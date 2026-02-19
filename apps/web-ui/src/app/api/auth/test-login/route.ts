/**
 * POST /api/auth/test-login
 * Story 10.5: Performance Testing - Test Authentication Endpoint
 *
 * TEST-ONLY endpoint for performance testing with K6.
 * This endpoint bypasses actual authentication and returns a mock token.
 * SECURITY: This endpoint should ONLY be enabled in test/staging environments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// SECURITY: This endpoint must NEVER be enabled in production
const isProduction = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-performance-testing-only';

// Validate JWT_SECRET is set in production
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

// Test user IDs for different roles
const TEST_USERS = {
  SUPERADMIN: 'test-superadmin-id',
  ADMIN: 'test-admin-id',
  USER: 'test-user-id',
  READONLY: 'test-readonly-id',
} as const;

type TestUserRole = keyof typeof TEST_USERS;

// Standard error response type for consistent API responses
type ErrorResponse = {
  error: string;
  message?: string;
  validRoles?: readonly string[];
};

function createErrorResponse(
  error: string,
  message?: string,
  validRoles?: readonly string[],
  status: number = 400
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { error };
  if (message) body.message = message;
  if (validRoles) body.validRoles = validRoles;
  return NextResponse.json(body, { status });
}

// Rate limiting for test endpoint (disabled for performance testing)
// NOTE: In production, this endpoint should be disabled entirely. The in-memory
// rate limit is NOT suitable for multi-instance deployments and only provides
// basic protection for accidental misuse in test environments.
let requestCount = 0;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
let windowStart = Date.now();
const MAX_REQUESTS_PER_MINUTE = 100000; // Very high limit for performance testing

/**
 * POST /api/auth/test-login
 *
 * TEST-ONLY endpoint for performance testing with K6.
 * SECURITY: Disabled in production environment.
 *
 * @param request - Next.js request object
 * @returns NextResponse with JWT token or error
 *
 * Request body:
 * {
 *   "email": "test-user@example.com",  // Optional, for identification
 *   "role": "USER"                      // Optional, defaults to USER
 * }
 *
 * Response:
 * {
 *   "token": "jwt-token",
 *   "userId": "test-user-id",
 *   "role": "USER",
 *   "expiresAt": 1234567890
 * }
 */
export async function POST(request: NextRequest) {
  // Block production access
  if (isProduction) {
    return createErrorResponse(
      'Test endpoint not available in production',
      'This endpoint is disabled in production environments',
      undefined,
      403
    );
  }

  // Simple rate limiting
  const now = Date.now();
  if (now - windowStart > RATE_LIMIT_WINDOW) {
    requestCount = 0;
    windowStart = now;
  }
  requestCount++;

  if (requestCount > MAX_REQUESTS_PER_MINUTE) {
    return createErrorResponse(
      'Rate limit exceeded',
      `Maximum ${MAX_REQUESTS_PER_MINUTE} requests per minute allowed`,
      undefined,
      429
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { role = 'USER', email = 'test-user@example.com' } = body;

    // Validate role
    const validRoles: TestUserRole[] = ['SUPERADMIN', 'ADMIN', 'USER', 'READONLY'];
    if (!validRoles.includes(role as TestUserRole)) {
      return createErrorResponse(
        'Invalid role',
        `Role must be one of: ${validRoles.join(', ')}`,
        validRoles,
        400
      );
    }

    // Get test user ID for role (using proper type narrowing)
    const userId = TEST_USERS[role as TestUserRole] ?? TEST_USERS.USER;

    // Create JWT token
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const token = sign(
      {
        userId,
        role,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: expiresAt,
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );

    return NextResponse.json({
      token,
      userId,
      role,
      email,
      expiresAt: expiresAt * 1000,
    });
  } catch (error) {
    // Log error without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // In production, use proper logging service (e.g., Winston, Pino)
    if (!isProduction) {
      console.error('Test login error:', errorMessage);
    }
    return createErrorResponse(
      'Internal server error',
      'An unexpected error occurred',
      undefined,
      500
    );
  }
}

/**
 * GET /api/auth/test-login
 * Returns information about the test endpoint (for discovery)
 *
 * @returns NextResponse with endpoint metadata
 */
export async function GET() {
  if (isProduction) {
    return createErrorResponse(
      'Test endpoint not available in production',
      'This endpoint is disabled in production environments',
      undefined,
      403
    );
  }

  return NextResponse.json({
    endpoint: '/api/auth/test-login',
    purpose: 'Performance testing authentication endpoint',
    method: 'POST',
    roles: ['SUPERADMIN', 'ADMIN', 'USER', 'READONLY'],
    warning: 'This endpoint is for testing only and should be disabled in production',
    disabledInProduction: true,
  });
}
