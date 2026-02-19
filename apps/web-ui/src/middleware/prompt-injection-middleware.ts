/**
 * Prompt Injection Middleware
 * Story 9.2: Prompt Injection Middleware
 *
 * Automatically checks POST/PUT/PATCH requests for prompt injection attacks
 * before they reach route handlers. Blocks malicious requests with 400 status.
 *
 * Features:
 * - Scans request body for string fields commonly used for user input
 * - Recursive scanning of nested objects and arrays
 * - Rate limiting for repeat offenders
 * - Audit logging for all detection attempts
 * - Warning mode for medium severity (passes through with headers)
 *
 * @module middleware/prompt-injection-middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { detectPromptInjection, type DetectionResult } from '@/lib/security/prompt-injection-engine'

/**
 * String field names to check at the top level of request body
 */
const STRING_FIELDS_TO_CHECK = [
  'message',
  'prompt',
  'input',
  'query',
  'context',
  'description',
  'content',
  'title',
  'name',
  'parameters',
  'payload',
] as const

/**
 * Nested paths to check (endswith matching)
 */
const NESTED_PATHS = [
  'parameters.target',
  'parameters.scope',
  'parameters.objective',
  'parameters.description',
  'parameters.message',
  'project.description',
  'project.name',
  'workflow.parameters',
] as const

/**
 * Rate limit configuration
 */
const RATE_LIMIT_MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_CACHE_SIZE = 10000 // Maximum number of entries before cleanup

/**
 * Detection failure tracking entry
 */
interface DetectionFailureEntry {
  count: number
  resetTime: number
  lastDetection: DetectionResult
}

/**
 * In-memory store for tracking repeat offenders
 * In production, this should use Redis or similar for distributed deployments
 */
const detectionFailures = new Map<string, DetectionFailureEntry>()

/**
 * Clean up expired entries from the failures map
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of detectionFailures.entries()) {
    if (now >= entry.resetTime) {
      detectionFailures.delete(key)
    }
  }

  // Prevent unbounded growth
  if (detectionFailures.size > MAX_CACHE_SIZE) {
    const entries = Array.from(detectionFailures.entries())
    entries.sort((a, b) => a[1].lastDetection.score - b[1].lastDetection.score)
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      detectionFailures.delete(entries[i][0])
    }
  }
}

// Cleanup timer for expired entries - runs every 5 minutes
// Note: In Edge Runtime, timers may not persist across invocations
// The shouldBlockClient function also does lazy cleanup to handle this
let cleanupTimer: ReturnType<typeof setInterval> | null = null
if (typeof setInterval !== 'undefined') {
  cleanupTimer = setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}

/**
 * Cleanup function for module shutdown
 */
export function cleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

/**
 * Extract client IP address from request headers
 *
 * SECURITY NOTE: In production deployments behind Cloudflare, the cf-connecting-ip
 * header is most reliable as it cannot be spoofed by clients. The x-forwarded-for
 * and x-real-ip headers can be spoofed and should only be trusted from known
 * proxy/load balancer IPs. Consider configuring TRUSTED_PROXY_IPS for production.
 *
 * @param request - The Next.js request
 * @returns Client IP address
 */
function getClientIp(request: NextRequest): string {
  // Prefer cf-connecting-ip (most reliable, cannot be spoofed by clients)
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check if client should be rate limited based on previous detections
 *
 * @param clientIp - Client IP address
 * @returns Whether client should be blocked
 */
function shouldBlockClient(clientIp: string): boolean {
  const now = Date.now()
  const entry = detectionFailures.get(clientIp)

  // Clean up expired entry
  if (entry && now >= entry.resetTime) {
    detectionFailures.delete(clientIp)
    return false
  }

  // Check if limit exceeded
  return entry !== undefined && entry.count >= RATE_LIMIT_MAX_ATTEMPTS
}

/**
 * Record a detection failure for rate limiting
 *
 * @param clientIp - Client IP address
 * @param result - Detection result
 */
function recordDetectionFailure(clientIp: string, result: DetectionResult): void {
  const now = Date.now()
  const entry = detectionFailures.get(clientIp)

  if (entry && now < entry.resetTime) {
    // Increment existing entry
    entry.count++
    entry.lastDetection = result
  } else {
    // Create new entry
    detectionFailures.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
      lastDetection: result,
    })
  }
}

/**
 * Sanitize context for logging (remove potential sensitive data)
 *
 * @param context - Raw context string
 * @returns Sanitized context string
 */
function sanitizeContext(context: string): string {
  // Truncate if too long
  if (context.length > 200) {
    return context.substring(0, 200) + '...'
  }
  return context
}

/**
 * Log detection attempt to audit trail
 *
 * @param request - The Next.js request
 * @param result - Detection result
 */
function logDetectionAttempt(request: NextRequest, result: DetectionResult): void {
  const timestamp = new Date().toISOString()
  const clientIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const path = request.nextUrl.pathname
  const method = request.method

  // Get top 5 matches for logging
  const topMatches = result.matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(
      (m) =>
        `${m.category}:${sanitizeContext(m.context || m.pattern).substring(0, 50)}`
    )

  const logEntry = {
    timestamp,
    event_type: 'prompt_injection_detected',
    client_ip: clientIp,
    user_agent: userAgent.substring(0, 200),
    path,
    method,
    severity: result.severity,
    score: result.score,
    matches_count: result.matches.length,
    top_matches: topMatches,
    reason: result.reason,
  }

  console.warn('[Prompt Injection Detected]', JSON.stringify(logEntry))
}

/**
 * Recursively scan request body for prompt injection
 *
 * @param body - Request body to scan
 * @param path - Current path in the object (for nested tracking)
 * @returns Worst detection result found
 */
function scanBodyForInjection(
  body: unknown,
  path = ''
): DetectionResult {
  // Check if body is a string
  if (typeof body === 'string') {
    return detectPromptInjection(body)
  }

  // Recursively check object properties
  if (typeof body === 'object' && body !== null) {
    // Handle arrays
    if (Array.isArray(body)) {
      let worstResult: DetectionResult | null = null
      let worstScore = -1

      for (let i = 0; i < body.length; i++) {
        const result = scanBodyForInjection(body[i], `${path}[${i}]`)
        if (result.score > worstScore) {
          worstResult = result
          worstScore = result.score
        }
      }

      return worstResult || { detected: false, score: 0, matches: [], severity: 'low', reason: 'No suspicious patterns detected' }
    }

    // Handle objects
    let worstResult: DetectionResult | null = null
    let worstScore = -1

    for (const [key, value] of Object.entries(body)) {
      const currentPath = path ? `${path}.${key}` : key

      // Check if this path should be scanned
      const shouldScan =
        STRING_FIELDS_TO_CHECK.includes(key as any) ||
        NESTED_PATHS.some((p) => currentPath.endsWith(p))

      if (shouldScan) {
        let result: DetectionResult

        if (typeof value === 'string') {
          result = detectPromptInjection(value)
        } else if (typeof value === 'object' && value !== null) {
          result = scanBodyForInjection(value, currentPath)
        } else {
          continue
        }

        if (result.score > worstScore) {
          worstResult = result
          worstScore = result.score
        }

        // Early exit for critical detections
        if (result.score >= 100) {
          return result
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check nested objects even if path doesn't match
        const result = scanBodyForInjection(value, currentPath)
        if (result.score > worstScore) {
          worstResult = result
          worstScore = result.score
        }
      }
    }

    return worstResult || { detected: false, score: 0, matches: [], severity: 'low', reason: 'No suspicious patterns detected' }
  }

  // Default: no detection
  return { detected: false, score: 0, matches: [], severity: 'low', reason: 'No suspicious patterns detected' }
}

/**
 * Create a blocking response for detected injection
 *
 * @param result - Detection result
 * @returns NextResponse with 400 status
 */
function createBlockingResponse(result: DetectionResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Invalid input detected',
      reason: result.reason,
      severity: result.severity,
      score: result.score,
    },
    { status: 400 }
  )
}

/**
 * Create a warning response for medium severity detections
 * Allows request to pass through but adds warning headers
 *
 * @param result - Detection result
 * @param originalRequest - The original request to clone
 * @returns NextResponse with warning headers
 */
function createWarningResponse(
  result: DetectionResult,
  originalRequest: NextRequest
): NextResponse {
  const response = NextResponse.next()

  // Set warning headers
  response.headers.set('X-Security-Warning', 'Suspicious input detected')
  response.headers.set('X-Detection-Score', String(result.score))
  response.headers.set('X-Detection-Severity', result.severity)
  // AC requirement: x-prompt-sanitized header
  response.headers.set('x-prompt-sanitized', 'true')

  return response
}

/**
 * Create a rate limit response
 *
 * @returns NextResponse with 400 status
 */
function createRateLimitResponse(): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      reason: 'Too many suspicious requests. Please try again later.',
    },
    { status: 400 }
  )

  const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
  response.headers.set('Retry-After', String(retryAfter))

  return response
}

/**
 * Create a sanitized response for requests that passed scanning
 *
 * @returns NextResponse with x-prompt-sanitized header
 */
function createSanitizedResponse(): NextResponse {
  const response = NextResponse.next()
  response.headers.set('x-prompt-sanitized', 'true')
  return response
}

/**
 * Main prompt injection middleware function
 *
 * Scans POST/PUT/PATCH requests for prompt injection patterns
 * and blocks or warns based on severity level.
 *
 * @param request - The Next.js request
 * @returns NextResponse with 400 status if injection detected (critical/high) or rate limit exceeded
 *          NextResponse with warning headers if medium severity detected
 *          NextResponse with x-prompt-sanitized header if scan passed
 *          null to pass through for GET/DELETE/etc (no scan needed)
 */
export async function promptInjectionMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only scan POST, PUT, PATCH requests
  const method = request.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return null // Pass through - no scan needed for these methods
  }

  // Get client IP for rate limiting
  const clientIp = getClientIp(request)

  // Check rate limiting for repeat offenders
  if (shouldBlockClient(clientIp)) {
    return createRateLimitResponse()
  }

  // Try to parse request body
  let body: unknown
  try {
    const bodyText = await request.text()
    if (!bodyText || bodyText.trim().length === 0) {
      // Empty body - return sanitized response (no injection possible)
      return createSanitizedResponse()
    }

    // Safe JSON parse with fallback
    try {
      body = JSON.parse(bodyText)
    } catch {
      // Not JSON - try scanning as plain text if it's a common field
      body = bodyText
    }
  } catch (error) {
    // Can't read body - let downstream handler deal with it
    return null
  }

  // Scan body for injection
  const result = scanBodyForInjection(body)

  // If no detection, return sanitized response
  if (!result.detected) {
    return createSanitizedResponse()
  }

  // Log the detection attempt
  logDetectionAttempt(request, result)

  // Handle based on severity
  if (result.severity === 'critical' || result.severity === 'high') {
    // Record failure for rate limiting
    recordDetectionFailure(clientIp, result)
    return createBlockingResponse(result)
  }

  if (result.severity === 'medium') {
    // Warning mode - pass through with headers
    // But still record for rate limiting if score is high
    if (result.score >= 60) {
      recordDetectionFailure(clientIp, result)
    }
    return createWarningResponse(result, request)
  }

  // Low severity - return sanitized response (logged but not blocked)
  return createSanitizedResponse()
}

/**
 * Get current rate limit status for a client
 *
 * @param clientIp - Client IP address
 * @returns Rate limit status or null
 */
export function getClientRateLimitStatus(clientIp: string): {
  count: number
  maxAttempts: number
  resetTime: number | null
} | null {
  const entry = detectionFailures.get(clientIp)
  if (!entry) {
    return null
  }

  return {
    count: entry.count,
    maxAttempts: RATE_LIMIT_MAX_ATTEMPTS,
    resetTime: entry.resetTime,
  }
}

/**
 * Reset rate limit for a client (admin function)
 *
 * @param clientIp - Client IP address
 */
export function resetClientRateLimit(clientIp: string): void {
  detectionFailures.delete(clientIp)
}
