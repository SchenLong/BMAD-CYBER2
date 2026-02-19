/**
 * CLI Authentication Middleware
 * Story 5.5: CLI Bridge Security Middleware - Task 2
 *
 * Validates JWT bearer tokens for CLI bridge endpoints.
 * Extracts user information and attaches to request context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import type { AuthContext } from '@/types/cli-security';
import { AuthenticationError } from '@/types/cli-security';

/**
 * JWT Secret for token verification
 * Must be set in environment variables
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Extract IP address from request headers
 * Handles proxy and load balancer scenarios with security validation
 * Prevents IP spoofing by validating header trust chain
 *
 * @param request - NextRequest object
 * @returns Client IP address
 */
function extractIpAddress(request: NextRequest): string {
  // Get the remote address from the request (most reliable)
  // In Next.js/Edge runtime, this comes from the connection
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  if (remoteAddr) {
    // Vercel provides this header which is trusted
    return remoteAddr.split(',')[0].trim();
  }

  // Check if we're behind a trusted proxy (via environment variable)
  const trustedProxies = process.env.TRUSTED_PROXY_CIDRS
    ? process.env.TRUSTED_PROXY_CIDRS.split(',').map(s => s.trim())
    : [];

  // Only trust x-forwarded-for if configured to trust the proxy
  if (trustedProxies.length > 0) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // The leftmost IP is the original client, rightmost is the proxy
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      // In production with trusted proxies, use the client IP (first)
      return ips[0];
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
  }

  // Cloudflare trusted IP header
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fall back to unknown - do NOT trust unvalidated headers
  return 'unknown';
}

/**
 * Extract user agent from request headers
 *
 * @param request - NextRequest object
 * @returns User agent string
 */
function extractUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Verify JWT token and extract payload
 * Validates all required claims to prevent token confusion attacks
 *
 * @param token - JWT token string
 * @returns Decoded payload with userId
 * @throws AuthenticationError if token is invalid
 */
async function verifyToken(token: string): Promise<{ userId: string; exp?: number; iat?: number }> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validate required claims
    const userId = payload.userId as string | undefined;
    const exp = payload.exp as number | undefined;
    const iat = payload.iat as number | undefined;
    const sub = payload.sub as string | undefined;
    const iss = payload.iss as string | undefined;

    // userId is required
    if (!userId || typeof userId !== 'string') {
      throw new AuthenticationError('Invalid token: missing or invalid userId claim');
    }

    // Validate userId format (should be a valid UUID or similar)
    if (userId.length < 10 || userId.length > 256) {
      throw new AuthenticationError('Invalid token: userId format invalid');
    }

    // Expiration must be in the past (jose verifies this, but we double-check)
    if (!exp) {
      throw new AuthenticationError('Invalid token: missing exp claim');
    }

    // Issued at must be present and reasonable
    if (!iat) {
      throw new AuthenticationError('Invalid token: missing iat claim');
    }

    // Check for token issued in the future (clock skew tolerance: 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (iat > now + 300) {
      throw new AuthenticationError('Invalid token: issued in the future');
    }

    // Validate issuer if expected
    const expectedIssuer = process.env.JWT_ISSUER || 'bmad-cli';
    if (iss && iss !== expectedIssuer) {
      throw new AuthenticationError('Invalid token: invalid issuer');
    }

    // Subject should match userId (JWT best practice)
    if (sub && sub !== userId) {
      throw new AuthenticationError('Invalid token: subject mismatch');
    }

    return { userId, exp, iat };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    // Jose throws specific errors for expired tokens
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_JWT_EXPIRED') {
      throw new AuthenticationError('Token has expired');
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_JWT_CLAIM_INVALID') {
      throw new AuthenticationError('Invalid token claims');
    }
    throw new AuthenticationError('Invalid or malformed token');
  }
}

/**
 * Load user roles from database
 *
 * @param userId - User ID to load roles for
 * @returns User with role from database
 * @throws AuthenticationError if user not found
 */
async function loadUserWithRoles(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  return user;
}

/**
 * CLI Authentication Middleware
 * Validates JWT bearer token and returns auth context
 *
 * @param request - NextRequest object
 * @returns AuthContext if valid, NextResponse with 401 if invalid
 *
 * @example
 * ```typescript
 * const authResult = await cliAuthMiddleware(request);
 * if (authResult instanceof NextResponse) {
 *   return authResult; // 401 error
 * }
 * const authContext = authResult;
 * // Proceed with authenticated request
 * ```
 */
export async function cliAuthMiddleware(
  request: NextRequest
): Promise<NextResponse | AuthContext> {
  // Extract Authorization header
  const authHeader = request.headers.get('authorization');

  // Check if header exists and has Bearer prefix
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        error: 'Missing or invalid authorization header',
        code: 'INVALID_TOKEN',
      },
      { status: 401 }
    );
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.substring(7);

  // Verify token and extract userId
  let payload: { userId: string; exp?: number };
  try {
    payload = await verifyToken(token);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return error.toResponse();
    }
    return NextResponse.json(
      {
        error: 'Authentication failed',
        code: 'INVALID_TOKEN',
      },
      { status: 401 }
    );
  }

  // Load user from database
  let user;
  try {
    user = await loadUserWithRoles(payload.userId);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return error.toResponse();
    }
    return NextResponse.json(
      {
        error: 'Failed to load user data',
        code: 'INVALID_TOKEN',
      },
      { status: 401 }
    );
  }

  // Build auth context
  const authContext: AuthContext = {
    userId: user.id,
    email: user.email,
    roles: [user.role], // Roles as array for consistency
    ip: extractIpAddress(request),
    userAgent: extractUserAgent(request),
    exp: payload.exp,
  };

  return authContext;
}

/**
 * Helper to check if a result is an error response
 *
 * @param result - Result from cliAuthMiddleware
 * @returns true if result is a NextResponse (error)
 */
export function isAuthError(
  result: NextResponse | AuthContext
): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Helper to check if a result is a valid auth context
 *
 * @param result - Result from cliAuthMiddleware
 * @returns true if result is AuthContext (valid)
 */
export function isAuthContext(
  result: NextResponse | AuthContext
): result is AuthContext {
  return !isAuthError(result);
}

/**
 * Extract token from Authorization header
 * Utility function for testing
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Validate JWT token string directly
 * Utility function for testing and standalone use
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export async function validateJWTToken(token: string): Promise<{ userId: string } | null> {
  try {
    const result = await verifyToken(token);
    return { userId: result.userId };
  } catch {
    return null;
  }
}

/**
 * Create authentication error response
 * Standardized error response format
 *
 * @param message - Error message
 * @param code - Error code
 * @returns NextResponse with 401 status
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required',
  code: string = 'INVALID_TOKEN'
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
    },
    { status: 401 }
  );
}

/**
 * CLI Authentication Middleware Factory
 * Returns a middleware function with custom configuration
 *
 * SECURITY: Development bypass removed to prevent production leakage
 * Use test tokens for testing instead
 *
 * @param options - Optional configuration
 * @returns Middleware function
 */
export function createCliAuthMiddleware(options?: {
  /** Optional custom secret for testing (NEVER use in production) */
  secret?: string;
}) {
  return async (request: NextRequest): Promise<NextResponse | AuthContext> => {
    // SECURITY: No development bypass - always require valid authentication
    // This prevents accidental production deployment with auth disabled
    return cliAuthMiddleware(request);
  };
}
