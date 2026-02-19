/**
 * API Middleware
 * Story 8.1: RESTful API Implementation
 * Task 1: Create API Base Infrastructure
 *
 * Provides middleware functions for API route handling.
 * Includes authentication, rate limiting, and request validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { apiUnauthorized, apiForbidden, apiRateLimited } from './response';
import { checkRateLimit } from '@/middleware/rate-limit';

/**
 * Rate limit result (copied here to avoid circular dependency)
 */
export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Authentication result
 * Story 8.2: Added apiKeyId for API key authentication tracking
 */
export interface AuthResult {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  organizationId?: string | null;
  apiKeyId?: string; // Present when authenticated via API key
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

/**
 * Rate limit configurations by role
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  SUPERADMIN: { requestsPerMinute: 200, requestsPerHour: 2000 },
  ADMIN: { requestsPerMinute: 150, requestsPerHour: 1500 },
  USER: { requestsPerMinute: 100, requestsPerHour: 1000 },
  READONLY: { requestsPerMinute: 50, requestsPerHour: 500 },
  API: { requestsPerMinute: 300, requestsPerHour: 5000 },
};

/**
 * Default rate limit for unauthenticated requests
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  requestsPerMinute: 20,
  requestsPerHour: 100,
};

/**
 * Check if the endpoint is public (no authentication required)
 */
export function isPublicEndpoint(pathname: string): boolean {
  const publicPaths = [
    '/api/v1/health',
    '/api/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/auth/login',
    '/api/auth/register',
  ];

  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Authenticate the request using session or API key
 * Story 8.2: API Key Management - Enhanced with API key authentication
 *
 * @param request - NextRequest object
 * @returns Authentication result or null if not authenticated
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult | null> {
  // Try session authentication first
  const session = await validateSession();

  if (session) {
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      organizationId: session.organizationId,
    };
  }

  // Try API key authentication (Story 8.2)
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.headers.get('X-API-Key');

  if (apiKey) {
    // Import validateApiKey dynamically to avoid circular dependency
    const { validateApiKeyFromHeader } = await import('@/lib/api-keys/validator');
    const result = await validateApiKeyFromHeader(request.headers.get('Authorization') || '');

    if (result.isValid && result.userId && result.role) {
      // Get user details
      const { prisma } = await import('@/lib/prisma');
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { id: true, email: true, name: true, organizationMemberships: true },
      });

      if (user) {
        const organizationId = user.organizationMemberships.length > 0
          ? user.organizationMemberships[0].organizationId
          : null;

        return {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: result.role,
          organizationId,
          apiKeyId: result.apiKeyId,
        };
      }
    }
  }

  return null;
}

/**
 * Require authentication for an API route
 * Returns error response if not authenticated
 *
 * @param request - NextRequest object
 * @returns Authentication result or error response
 */
export async function requireAuth(request: NextRequest): Promise<
  | { success: true; user: AuthResult }
  | { success: false; response: NextResponse }
> {
  const user = await authenticateRequest(request);

  if (!user) {
    return {
      success: false,
      response: apiUnauthorized('Valid authentication required'),
    };
  }

  return { success: true, user };
}

/**
 * Check rate limit for a request
 *
 * @param request - NextRequest object
 * @param user - Authenticated user (optional)
 * @returns Rate limit result
 */
export async function checkApiRateLimit(
  request: NextRequest,
  user?: AuthResult | null
): Promise<RateLimitResult | null> {
  // Get identifier for rate limiting
  let identifier: string;

  if (user?.userId) {
    identifier = `user:${user.userId}`;
  } else {
    // Use IP address for unauthenticated requests
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              request.headers.get('x-real-ip') ||
              'unknown';
    identifier = `ip:${ip}`;
  }

  // Get rate limit configuration
  const config = user ? RATE_LIMITS[user.role] || DEFAULT_RATE_LIMIT : DEFAULT_RATE_LIMIT;

  // Check rate limit
  return checkRateLimit(identifier, config.requestsPerMinute, config.requestsPerHour);
}

/**
 * Extract rate limit metadata from result
 */
export function getRateLimitMeta(result: RateLimitResult | null) {
  if (!result) {
    return undefined;
  }

  return {
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * API route wrapper that handles authentication and rate limiting
 *
 * @param handler - The route handler function
 * @param options - Middleware options
 * @returns Wrapped handler
 */
export function withApiMiddleware<T extends any[]>(
  handler: (
    request: NextRequest,
    context?: { user: AuthResult; params?: Record<string, string> }
  ) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    allowedRoles?: string[];
    rateLimit?: boolean;
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const {
      requireAuth: requireAuthOption = true,
      allowedRoles,
      rateLimit: checkRateLimitOption = true,
    } = options;

    // Skip authentication for public endpoints
    const isPublic = !requireAuthOption || isPublicEndpoint(request.nextUrl.pathname);
    const authResult = isPublic ? null : await requireAuth(request);

    // Check authentication
    if (!isPublic && authResult && !authResult.success) {
      return authResult.response;
    }

    const user = authResult?.success ? authResult.user : undefined;

    // Check role-based access
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      return apiForbidden('You do not have permission to access this resource');
    }

    // Check rate limit
    if (checkRateLimitOption) {
      const rateLimitResult = await checkApiRateLimit(request, user);

      if (rateLimitResult && !rateLimitResult.isAllowed) {
        return apiRateLimited(rateLimitResult.retryAfter);
      }
    }

    // Extract params from args (Next.js 15 passes params as a separate argument)
    const params = args.length > 0 && args[0] ? { params: args[0] } : undefined;

    // Call the handler
    try {
      return await handler(request, user ? { user, ...(params || {}) } : params);
    } catch (error) {
      console.error('API route error:', error);
      throw error;
    }
  };
}

/**
 * Extract client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Generate request metadata for logging
 */
export function getRequestMetadata(request: NextRequest, user?: AuthResult | null) {
  return {
    ip: getClientIp(request),
    userAgent: getUserAgent(request),
    method: request.method,
    pathname: request.nextUrl.pathname,
    userId: user?.userId,
    userRole: user?.role,
    timestamp: new Date().toISOString(),
  };
}
