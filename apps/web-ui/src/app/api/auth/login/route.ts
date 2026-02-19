/**
 * POST /api/auth/login
 * Story 1.2: Authentication System - Core
 * Story 1.6: Session Management - Enhanced with metadata capture
 *
 * Authenticates a user with email and password.
 * Verifies password with bcrypt, creates session on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/validation';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, generateJWT } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import type { RequestMetadata } from '@/lib/auth/types';
import { SignJWT } from 'jose';

/**
 * Extract request metadata from the NextRequest
 */
function extractRequestMetadata(request: NextRequest): RequestMetadata {
  // Get IP address from headers
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || undefined;

  // SECURITY NOTE: This is a basic device fingerprint for session tracking.
  // It combines IP and user agent to create a simple identifier.
  //
  // LIMITATIONS:
  // - User Agent can be easily spoofed
  // - IP addresses change (VPN, mobile networks, ISP reassignment)
  // - Does not use browser fingerprinting techniques (canvas, WebGL, etc.)
  //
  // For production environments requiring stronger security:
  // 1. Consider using a dedicated fingerprinting library (e.g., fingerprintjs)
  // 2. Implement server-side IP reputation checks
  // 3. Add behavioral analysis for anomaly detection
  // 4. Consider implementing true device fingerprinting with canvas/WebGL hashes
  //
  // For now, this provides basic session correlation and is sufficient
  // for the stated security requirements of concurrent session management.
  const deviceFingerprint = userAgent
    ? Buffer.from(`${ipAddress}:${userAgent}`).toString('base64').substring(0, 32)
    : undefined;

  return {
    ipAddress,
    userAgent,
    deviceFingerprint,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        { status: 401 }
      );
    }

    // Check if user has a password (OAuth users may not)
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error: 'Password not set',
          message: 'This account uses a different sign-in method',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        { status: 401 }
      );
    }

    // Extract request metadata for session (Story 1.6)
    const metadata = extractRequestMetadata(request);

    // Story 1.4: Check if MFA is enabled
    if (user.mfaEnabled) {
      // Create session but mark as pending MFA verification
      await createSession(user.id, metadata);

      return NextResponse.json({
        requiresMfa: true,
        mfaFactors: user.mfaFactors ? JSON.parse(user.mfaFactors) : [],
        redirect: '/mfa/verify',
      });
    }

    // Create session with metadata (Story 1.6)
    await createSession(user.id, metadata);

    // Generate middleware auth token (JWT for Edge Runtime compatibility)
    // This token is used by middleware to verify authentication without DB access
    // Includes onboarding status to avoid database lookups in middleware
    const middlewareSecret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SESSION_SECRET);
    const middlewareToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted?.toISOString() || null,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15d') // Match session duration
      .sign(middlewareSecret);

    // Create response with user data and set middleware auth token cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set middleware auth token cookie (HttpOnly for security)
    response.cookies.set('middleware_auth', middlewareToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax',
      maxAge: 15 * 24 * 60 * 60, // 15 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to log in',
      },
      { status: 500 }
    );
  }
}
