/**
 * CLI Rate Limiting Middleware
 * Story 5.5: CLI Bridge Security Middleware - Task 3
 *
 * Implements in-memory rate limiting using sliding window algorithm.
 * Supports per-command rate limits and role-based bypass.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AuthContext, RateLimitEntry, RateLimitResult, RateLimitConfig } from '@/types/cli-security';
import { RateLimitError } from '@/types/cli-security';

/**
 * Default rate limit configuration
 * 20 requests per minute per user
 */
const DEFAULT_LIMIT = 20;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Per-command rate limits
 * Commands can have their own rate limits based on cost/risk
 */
export const COMMAND_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'workflow.execute': { limit: 3, windowMs: 5 * 60 * 1000 }, // 3 per 5 minutes
  'agent.invoke': { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  'intel.flash-assessment': { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  'intel.campaign-planner': { limit: 2, windowMs: 10 * 60 * 1000 }, // 2 per 10 minutes
  'security.scan': { limit: 1, windowMs: 30 * 60 * 1000 }, // 1 per 30 minutes
  // All other commands use default
};

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: DEFAULT_LIMIT,
  windowMs: DEFAULT_WINDOW_MS,
};

/**
 * Trusted IPs that bypass rate limiting
 * Can be configured via environment variable (comma-separated)
 */
const TRUSTED_IPS = new Set(
  (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
);

/**
 * Roles that bypass rate limiting
 * Can be configured via environment variable (comma-separated)
 */
const RATE_LIMIT_BYPASS_ROLES = new Set(
  (process.env.RATE_LIMIT_BYPASS_ROLES || '').split(',').filter(Boolean)
);

/**
 * In-memory rate limit store
 * Maps identifier to rate limit entry
 * Thread-safe with atomic operations to prevent race conditions
 */
class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs = 60 * 1000; // Clean up every minute
  // Global instance counter for proper cleanup
  private static instanceCount = 0;

  constructor() {
    RateLimitStore.instanceCount++;

    // Start cleanup interval in Node.js environment (only once)
    if (typeof setInterval !== 'undefined' && RateLimitStore.instanceCount === 1) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, this.cleanupIntervalMs);

      // Don't keep process open for this interval
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check if identifier has exceeded rate limit
   * Implements sliding window algorithm with atomic check-and-set
   * The entire check-and-increment operation is done atomically
   *
   * @param identifier - Unique identifier (userId:command or ip:command)
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  checkLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();

    // Atomic read-modify-write using get/set
    const entry = this.store.get(identifier);

    // No existing entry or window expired - create new
    if (!entry || now - entry.windowStart >= config.windowMs) {
      const newEntry: RateLimitEntry = {
        count: 1,
        windowStart: now,
        firstRequest: now,
      };
      this.store.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetTime: now + config.windowMs,
        limit: config.limit,
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.limit) {
      const resetTime = entry.windowStart + config.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
        limit: config.limit,
      };
    }

    // Increment counter with atomic set (create new object instead of mutating)
    const updatedEntry: RateLimitEntry = {
      ...entry,
      count: entry.count + 1,
    };
    this.store.set(identifier, updatedEntry);

    return {
      allowed: true,
      remaining: config.limit - updatedEntry.count,
      resetTime: entry.windowStart + config.windowMs,
      limit: config.limit,
    };
  }

  /**
   * Get remaining requests for identifier
   *
   * @param identifier - Unique identifier
   * @param limit - Rate limit
   * @returns Remaining requests
   */
  getRemaining(identifier: string, limit: number): number {
    const entry = this.store.get(identifier);
    if (!entry) return limit;
    return Math.max(0, limit - entry.count);
  }

  /**
   * Get reset time for identifier
   *
   * @param identifier - Unique identifier
   * @param windowMs - Window size in ms
   * @returns Reset timestamp
   */
  getResetTime(identifier: string, windowMs: number): number {
    const entry = this.store.get(identifier);
    if (!entry) return 0;
    return entry.windowStart + windowMs;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxWindowMs = Math.max(
      DEFAULT_WINDOW_MS,
      ...Object.values(COMMAND_RATE_LIMITS).map((c) => c.windowMs)
    );

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > maxWindowMs) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Delete a specific entry (for admin reset)
   */
  delete(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get all keys (for admin reset)
   */
  keys(): IterableIterator<string> {
    return this.store.keys();
  }

  /**
   * Get current entry count (for monitoring)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    RateLimitStore.instanceCount--;
  }
}

// Global rate limit store instance
const rateLimitStore = new RateLimitStore();

/**
 * Get rate limit configuration for a command
 *
 * @param command - Command ID (optional)
 * @returns Rate limit configuration
 */
function getRateLimitConfig(command?: string): RateLimitConfig {
  if (command && COMMAND_RATE_LIMITS[command]) {
    return COMMAND_RATE_LIMITS[command];
  }
  return DEFAULT_RATE_LIMIT;
}

/**
 * Generate rate limit identifier for request
 * Uses userId if available, falls back to IP
 *
 * @param authContext - Authentication context
 * @param command - Command ID (optional)
 * @returns Unique identifier for rate limiting
 */
function generateIdentifier(authContext: AuthContext, command?: string): string {
  const userPart = authContext.userId || authContext.ip;
  const commandPart = command || 'default';
  return `${userPart}:${commandPart}`;
}

/**
 * Check if rate limiting should be bypassed
 *
 * @param authContext - Authentication context
 * @returns true if bypass allowed
 */
function shouldBypass(authContext: AuthContext): boolean {
  // Check trusted IPs
  if (TRUSTED_IPS.has(authContext.ip)) {
    return true;
  }

  // Check bypass roles
  for (const role of authContext.roles) {
    if (RATE_LIMIT_BYPASS_ROLES.has(role)) {
      return true;
    }
  }

  // Admin role always bypasses (optional, can be disabled)
  if (authContext.roles.includes('SUPERADMIN') || authContext.roles.includes('ADMIN')) {
    // Only bypass if explicitly configured
    return RATE_LIMIT_BYPASS_ROLES.has('SUPERADMIN') || RATE_LIMIT_BYPASS_ROLES.has('ADMIN');
  }

  return false;
}

/**
 * CLI Rate Limiting Middleware
 * Checks rate limits and returns error response if exceeded
 *
 * @param request - NextRequest object
 * @param authContext - Authentication context
 * @param command - Command ID (optional, for per-command limits)
 * @returns NextResponse if rate limited, null if allowed
 *
 * @example
 * ```typescript
 * const rateLimitResult = await cliRateLimitMiddleware(request, authContext, 'workflow.execute');
 * if (rateLimitResult) {
 *   return rateLimitResult; // 429 error
 * }
 * // Proceed with request
 * ```
 */
export async function cliRateLimitMiddleware(
  request: NextRequest,
  authContext: AuthContext,
  command?: string
): Promise<NextResponse | null> {
  // Check bypass
  if (shouldBypass(authContext)) {
    // Add headers indicating bypass
    request.headers.set('X-RateLimit-Limit', '-1');
    request.headers.set('X-RateLimit-Remaining', '-1');
    request.headers.set('X-RateLimit-Reset', '0');
    request.headers.set('X-RateLimit-Bypass', 'true');
    return null;
  }

  // Get rate limit config
  const config = getRateLimitConfig(command);

  // Generate identifier
  const identifier = generateIdentifier(authContext, command);

  // Check limit
  const result = rateLimitStore.checkLimit(identifier, config);

  // Add rate limit headers to request for downstream handlers
  request.headers.set('X-RateLimit-Limit', result.limit.toString());
  request.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  request.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  // Return error if not allowed
  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': (result.retryAfter || 60).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
          'X-RateLimit-Command': command || 'default',
        },
      }
    );
    return response;
  }

  // Allowed to proceed
  return null;
}

/**
 * Apply rate limit headers to a response
 * Utility for adding rate limit info to successful responses
 *
 * @param response - NextResponse object
 * @param request - NextRequest with rate limit headers
 * @returns Response with rate limit headers
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const limit = request.headers.get('X-RateLimit-Limit');
  const remaining = request.headers.get('X-RateLimit-Remaining');
  const reset = request.headers.get('X-RateLimit-Reset');
  const bypass = request.headers.get('X-RateLimit-Bypass');

  if (limit) {
    response.headers.set('X-RateLimit-Limit', limit);
  }
  if (remaining) {
    response.headers.set('X-RateLimit-Remaining', remaining);
  }
  if (reset) {
    response.headers.set('X-RateLimit-Reset', reset);
  }
  if (bypass === 'true') {
    response.headers.set('X-RateLimit-Bypass', 'true');
  }

  return response;
}

/**
 * Get current rate limit status for a user
 * Utility for displaying rate limit info
 *
 * @param authContext - Authentication context
 * @param command - Command ID (optional)
 * @returns Rate limit status
 */
export function getRateLimitStatus(
  authContext: AuthContext,
  command?: string
): {
  limit: number;
  remaining: number;
  resetTime: number;
  windowMs: number;
} {
  const config = getRateLimitConfig(command);
  const identifier = generateIdentifier(authContext, command);
  const remaining = rateLimitStore.getRemaining(identifier, config.limit);
  const resetTime = rateLimitStore.getResetTime(identifier, config.windowMs);

  return {
    limit: config.limit,
    remaining,
    resetTime,
    windowMs: config.windowMs,
  };
}

/**
 * Reset rate limits for a user (admin only)
 * Utility for admin controls
 *
 * @param authContext - Authentication context
 * @param command - Command ID to reset (optional, resets all if not provided)
 */
export function resetRateLimits(authContext: AuthContext, command?: string): void {
  if (command) {
    const identifier = generateIdentifier(authContext, command);
    rateLimitStore.delete(identifier);
  } else {
    // Reset all limits for this user
    const userId = authContext.userId || authContext.ip;
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${userId}:`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Export store for testing
 */
export const __test__ = {
  store: rateLimitStore,
  createTestStore: () => new RateLimitStore(),
  setTrustedIPs: (ips: string[]) => {
    TRUSTED_IPS.clear();
    ips.forEach((ip) => TRUSTED_IPS.add(ip));
  },
  setBypassRoles: (roles: string[]) => {
    RATE_LIMIT_BYPASS_ROLES.clear();
    roles.forEach((role) => RATE_LIMIT_BYPASS_ROLES.add(role));
  },
};
