/**
 * Rate Limiting Middleware
 * Story 1.5: Role-Based Access Control (RBAC) - Task 8
 *
 * Provides rate limiting for API users, with specific limits for the API role.
 * Uses in-memory Map with TTL-based cleanup for storing request counts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';

/**
 * Rate limit configuration from environment variables
 */
const RATE_LIMIT_API_PER_MINUTE = parseInt(process.env.RATE_LIMIT_API_PER_MINUTE || '100', 10);
const RATE_LIMIT_API_PER_HOUR = parseInt(process.env.RATE_LIMIT_API_PER_HOUR || '1000', 10);
const RATE_LIMIT_STANDARD_PER_MINUTE = parseInt(process.env.RATE_LIMIT_STANDARD_PER_MINUTE || '200', 10);
const RATE_LIMIT_STANDARD_PER_HOUR = parseInt(process.env.RATE_LIMIT_STANDARD_PER_HOUR || '2000', 10);

/**
 * Rate limit entry structure
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastReset: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * In-memory rate limit store using Map with TTL
 * Automatically evicts old entries to prevent memory leaks
 */
class RateLimitStore {
  private minuteStore: Map<string, RateLimitEntry>;
  private hourStore: Map<string, RateLimitEntry>;

  constructor() {
    this.minuteStore = new Map();
    this.hourStore = new Map();

    // Cleanup expired entries every 60 seconds
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Cleanup minute store
    for (const [key, entry] of this.minuteStore.entries()) {
      if (now >= entry.resetTime) {
        this.minuteStore.delete(key);
      }
    }

    // Cleanup hour store
    for (const [key, entry] of this.hourStore.entries()) {
      if (now >= entry.resetTime) {
        this.hourStore.delete(key);
      }
    }

    // Prevent unbounded growth - if stores get too large, trim to oldest entries
    if (this.minuteStore.size > 10000) {
      const entries = Array.from(this.minuteStore.entries());
      entries.sort((a, b) => a[1].lastReset - b[1].lastReset);
      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.minuteStore.delete(entries[i][0]);
      }
    }

    if (this.hourStore.size > 10000) {
      const entries = Array.from(this.hourStore.entries());
      entries.sort((a, b) => a[1].lastReset - b[1].lastReset);
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.hourStore.delete(entries[i][0]);
      }
    }
  }

  /**
   * Check rate limit for a given identifier
   * @param identifier - Unique identifier (user ID, API key, or IP)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @param store - The store to use (minute or hour)
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number,
    store: Map<string, RateLimitEntry>
  ): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    // First request or window expired
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        lastReset: now,
      };
      store.set(identifier, newEntry);

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment counter
    entry.count++;
    store.set(identifier, entry);

    return {
      allowed: true,
      limit,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Check both minute and hour limits
   * Uses the more restrictive limit
   */
  checkMinuteAndHour(
    identifier: string,
    minuteLimit: number,
    hourLimit: number
  ): RateLimitResult {
    const minuteResult = this.check(
      identifier,
      minuteLimit,
      60 * 1000,
      this.minuteStore
    );

    const hourResult = this.check(
      identifier,
      hourLimit,
      60 * 60 * 1000,
      this.hourStore
    );

    // Use the more restrictive result
    return minuteResult.allowed && hourResult.allowed
      ? minuteResult.remaining < hourResult.remaining
        ? minuteResult
        : hourResult
      : minuteResult.allowed
        ? hourResult
        : minuteResult;
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.minuteStore.delete(identifier);
    this.hourStore.delete(identifier);
  }
}

// Global rate limit store instance
export const rateLimitStore = new RateLimitStore();

/**
 * Rate limit tiers for different user roles
 */
const RATE_LIMITS = {
  [UserRole.API]: {
    perMinute: RATE_LIMIT_API_PER_MINUTE,
    perHour: RATE_LIMIT_API_PER_HOUR,
  },
  [UserRole.SUPERADMIN]: {
    perMinute: 1000,
    perHour: 10000,
  },
  [UserRole.ADMIN]: {
    perMinute: 500,
    perHour: 5000,
  },
  [UserRole.USER]: {
    perMinute: RATE_LIMIT_STANDARD_PER_MINUTE,
    perHour: RATE_LIMIT_STANDARD_PER_HOUR,
  },
  [UserRole.READONLY]: {
    perMinute: 100,
    perHour: 1000,
  },
} as const;

/**
 * Get user identifier from request
 * Priority: API key > User ID > IP address
 */
async function getIdentifier(request: NextRequest): Promise<string> {
  // Check for API key header
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return `apikey:${apiKey}`;
  }

  // Check for authenticated user
  const session = await auth();
  if (session?.user?.id) {
    return `user:${session.user.id}`;
  }

  // Fall back to IP address
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `ip:${ip}`;
}

/**
 * Get user role from request
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserRole(_request: NextRequest): Promise<UserRole | null> {
  const session = await auth();
  return (session?.user?.role as UserRole) || null;
}

/**
 * Check rate limit for a request
 * @param request - The Next.js request
 * @returns Rate limit result
 */
export async function checkRateLimit(request: NextRequest): Promise<RateLimitResult> {
  const identifier = await getIdentifier(request);
  const role = await getUserRole(request);

  // Get limits based on role
  const limits = role
    ? RATE_LIMITS[role] || RATE_LIMITS[UserRole.USER]
    : { perMinute: 30, perHour: 300 }; // Stricter limits for unauthenticated

  return rateLimitStore.checkMinuteAndHour(
    identifier,
    limits.perMinute,
    limits.perHour
  );
}

/**
 * Create a rate limit response (429 Too Many Requests)
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  );

  // Set rate limit headers
  response.headers.set('Retry-After', String(result.retryAfter || 60));
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', '0');
  response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));

  return response;
}

/**
 * Set rate limit headers on a response
 */
export function setRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): void {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));

  if (result.retryAfter) {
    response.headers.set('Retry-After', String(result.retryAfter));
  }
}

/**
 * Rate limiting middleware factory
 * Checks rate limits and sets appropriate headers
 */
export function createRateLimitMiddleware() {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await checkRateLimit(request);

    if (!result.allowed) {
      return createRateLimitResponse(result);
    }

    // Add rate limit headers to all responses
    const response = NextResponse.next();
    setRateLimitHeaders(response, result);
    return response;
  };
}

/**
 * Check rate limit for a specific user (for Server Actions)
 * @param userId - The user ID to check
 * @returns Rate limit result
 */
export async function checkUserRateLimit(userId: string): Promise<RateLimitResult> {
  const identifier = `user:${userId}`;
  const limits = RATE_LIMITS[UserRole.USER];

  return rateLimitStore.checkMinuteAndHour(
    identifier,
    limits.perMinute,
    limits.perHour
  );
}

/**
 * Reset rate limit for a specific user (admin function)
 * @param identifier - The identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.reset(identifier);
}

/**
 * Get current rate limit stats for a user
 * @param request - The Next.js request
 * @returns Current rate limit usage
 */
export async function getRateLimitStats(request: NextRequest): Promise<{
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  const result = await checkRateLimit(request);
  const used = result.limit - result.remaining;

  return {
    used,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: new Date(result.resetTime),
  };
}
