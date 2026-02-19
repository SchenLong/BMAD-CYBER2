/**
 * API Rate Limiting
 * Story 8.3: API Authentication - Task 4
 *
 * Provides rate limiting specifically for API authentication.
 * Implements stricter limits for API keys compared to session auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

/**
 * Rate limit configuration from environment variables
 */
const API_RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.API_RATE_LIMIT_PER_MINUTE || '60',
  10
);
const API_RATE_LIMIT_PER_HOUR = parseInt(
  process.env.API_RATE_LIMIT_PER_HOUR || '1000',
  10
);
const API_ENTERPRISE_RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.API_ENTERPRISE_RATE_LIMIT_PER_MINUTE || '200',
  10
);
const API_ENTERPRISE_RATE_LIMIT_PER_HOUR = parseInt(
  process.env.API_ENTERPRISE_RATE_LIMIT_PER_HOUR || '5000',
  10
);

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
export interface ApiRateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Token type for rate limiting
 */
export enum AuthTokenType {
  SESSION = 'session',
  API_KEY = 'api_key',
  API_KEY_ENTERPRISE = 'api_key_enterprise',
}

/**
 * Rate limit tiers for different auth types
 */
const RATE_LIMITS: Record<AuthTokenType, { perMinute: number; perHour: number }> = {
  [AuthTokenType.SESSION]: {
    perMinute: 100,
    perHour: 2000,
  },
  [AuthTokenType.API_KEY]: {
    perMinute: API_RATE_LIMIT_PER_MINUTE,
    perHour: API_RATE_LIMIT_PER_HOUR,
  },
  [AuthTokenType.API_KEY_ENTERPRISE]: {
    perMinute: API_ENTERPRISE_RATE_LIMIT_PER_MINUTE,
    perHour: API_ENTERPRISE_RATE_LIMIT_PER_HOUR,
  },
};

/**
 * In-memory rate limit store using Map with TTL
 * Separate store for API rate limiting to avoid conflicts
 *
 * NOTE: This implementation uses in-memory storage which works for single-instance
 * deployments. For multi-instance/serverless deployments, this should be replaced
 * with Redis or another distributed cache for accurate rate limiting across instances.
 * The public API (checkApiRateLimit, etc.) is designed to be compatible with
 * a Redis-backed implementation.
 */
class ApiRateLimitStore {
  private minuteStore: Map<string, RateLimitEntry>;
  private hourStore: Map<string, RateLimitEntry>;

  constructor() {
    this.minuteStore = new Map();
    this.hourStore = new Map();

    // Cleanup expired entries every 60 seconds
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
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

    // Prevent unbounded growth
    this.trimStore(this.minuteStore);
    this.trimStore(this.hourStore);
  }

  /**
   * Trim store if it gets too large
   */
  private trimStore(store: Map<string, RateLimitEntry>): void {
    const maxSize = 10000;
    if (store.size <= maxSize) {
      return;
    }

    const entries = Array.from(store.entries());
    entries.sort((a, b) => a[1].lastReset - b[1].lastReset);

    // Remove oldest 20%
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      store.delete(entries[i][0]);
    }
  }

  /**
   * Check rate limit for a given identifier
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number,
    store: Map<string, RateLimitEntry>
  ): ApiRateLimitResult {
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
   */
  checkMinuteAndHour(
    identifier: string,
    minuteLimit: number,
    hourLimit: number
  ): ApiRateLimitResult {
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
const apiRateLimitStore = new ApiRateLimitStore();

/**
 * Determine auth type based on user context
 */
function getAuthTokenType(userRole?: UserRole, isEnterprise?: boolean): AuthTokenType {
  if (isEnterprise && userRole === UserRole.DEVELOPER) {
    return AuthTokenType.API_KEY_ENTERPRISE;
  }
  if (userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN) {
    return AuthTokenType.API_KEY_ENTERPRISE;
  }
  return AuthTokenType.API_KEY;
}

/**
 * Check API rate limit for a request
 * @param identifier - Unique identifier (user_id or api_key_id)
 * @param tokenType - Type of token (session or api_key)
 * @param userRole - User role for tier selection
 * @returns Rate limit result
 */
export function checkApiRateLimit(
  identifier: string,
  tokenType: 'session' | 'api_key',
  userRole?: UserRole
): ApiRateLimitResult {
  let authType: AuthTokenType;

  if (tokenType === 'session') {
    authType = AuthTokenType.SESSION;
  } else {
    authType = getAuthTokenType(userRole);
  }

  const limits = RATE_LIMITS[authType];

  return apiRateLimitStore.checkMinuteAndHour(
    identifier,
    limits.perMinute,
    limits.perHour
  );
}

/**
 * Check API rate limit with enterprise bypass
 * @param identifier - Unique identifier
 * @param tokenType - Type of token
 * @param userRole - User role
 * @param isEnterprise - Whether this is an enterprise API key
 * @returns Rate limit result
 */
export function checkApiRateLimitWithBypass(
  identifier: string,
  tokenType: 'session' | 'api_key',
  userRole?: UserRole,
  isEnterprise?: boolean
): ApiRateLimitResult {
  // Enterprise bypass for rate limiting
  if (isEnterprise || userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN) {
    authType = AuthTokenType.API_KEY_ENTERPRISE;
  } else if (tokenType === 'session') {
    authType = AuthTokenType.SESSION;
  } else {
    authType = AuthTokenType.API_KEY;
  }

  const limits = RATE_LIMITS[authType];

  return apiRateLimitStore.checkMinuteAndHour(
    identifier,
    limits.perMinute,
    limits.perHour
  );
}

/**
 * Create a rate limit response (429 Too Many Requests)
 */
export function createApiRateLimitResponse(result: ApiRateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please retry later.',
        retryAfter: result.retryAfter,
      },
    },
    { status: 429 }
  );

  // Set rate limit headers
  setApiRateLimitHeaders(response, result);

  return response;
}

/**
 * Set rate limit headers on a response
 */
export function setApiRateLimitHeaders(
  response: NextResponse,
  result: ApiRateLimitResult
): void {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));

  if (result.retryAfter) {
    response.headers.set('Retry-After', String(result.retryAfter));
  }
}

/**
 * Get rate limit stats for a user
 */
export function getApiRateLimitStats(
  identifier: string,
  tokenType: 'session' | 'api_key',
  userRole?: UserRole
): {
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
} {
  const result = checkApiRateLimit(identifier, tokenType, userRole);
  const used = result.limit - result.remaining;

  return {
    used,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: new Date(result.resetTime),
  };
}

/**
 * Reset rate limit for a specific identifier (admin function)
 */
export function resetApiRateLimit(identifier: string): void {
  apiRateLimitStore.reset(identifier);
}
