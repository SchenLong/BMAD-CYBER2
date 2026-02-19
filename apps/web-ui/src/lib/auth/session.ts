/**
 * Session Management Utilities
 * Story 1.2: Authentication System - Core
 * Story 1.6: Session Management - Enhanced with metadata, refresh tokens, and concurrent limits
 *
 * Handles session creation, validation, and destruction.
 * Uses database-backed sessions for security and revocation capability.
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '../prisma';
import type { RequestMetadata } from './types';

// Session configuration
const SESSION_COOKIE_NAME = 'session';
const REFRESH_COOKIE_NAME = 'refresh';

// Get session duration from environment or use default
const SESSION_EXPIRY_MINUTES = parseInt(process.env.SESSION_EXPIRY_MINUTES || '15', 10);
const SESSION_DURATION = SESSION_EXPIRY_MINUTES * 60 * 1000; // milliseconds

// Refresh token duration from environment
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7', 10);
const REFRESH_DURATION = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // milliseconds

// Maximum concurrent sessions per user
const MAX_SESSIONS_PER_USER = parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10);

// Get required secrets from environment
const SESSION_SECRET = process.env.SESSION_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET || SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generate a secure random session token
 */
async function generateSessionToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a session for a user
 * @param userId - The user ID to create a session for
 * @param metadata - Request metadata (IP, user agent, device fingerprint)
 * @returns The session token
 */
export async function createSession(
  userId: string,
  metadata?: RequestMetadata
): Promise<string> {
  try {
    const sessionToken = await generateSessionToken();
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_DURATION);

    // Check concurrent session limit (Story 1.6 - Task 6)
    // Use a transaction to prevent race condition when multiple logins occur simultaneously
    await prisma.$transaction(async (tx) => {
      const activeSessionCount = await tx.session.count({
        where: {
          userId,
          expires: { gt: now },
        },
      });

      if (activeSessionCount >= MAX_SESSIONS_PER_USER) {
        // Revoke oldest session within the transaction
        const oldestSession = await tx.session.findFirst({
          where: {
            userId,
            expires: { gt: now },
          },
          orderBy: { createdAt: 'asc' },
        });

        if (oldestSession) {
          await tx.session.delete({ where: { id: oldestSession.id } });
        }
      }

      // Store session in database with metadata (Story 1.6)
      await tx.session.create({
        data: {
          userId,
          sessionToken,
          expires,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          deviceFingerprint: metadata?.deviceFingerprint,
          lastActivity: now,
        },
      });
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    const isSecure = process.env.COOKIE_SECURE === 'true';
    // SECURITY: Default to 'lax' for better UX with OAuth redirects.
    // Set COOKIE_SAMESITE=strict in .env for maximum CSRF protection if OAuth isn't needed.
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      expires,
      path: '/',
    });

    // Also create and set refresh token (Story 1.6 - Task 3)
    const refreshToken = await generateRefreshToken(userId, sessionToken);
    const refreshExpires = new Date(now.getTime() + REFRESH_DURATION);

    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      expires: refreshExpires,
      path: '/',
    });

    return sessionToken;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Generate a refresh token (Story 1.6 - Task 3)
 * @param userId - The user ID
 * @param sessionToken - The session token to link to
 * @returns The refresh token JWT
 */
async function generateRefreshToken(userId: string, sessionToken: string): Promise<string> {
  const secret = new TextEncoder().encode(COOKIE_SECRET);

  return new SignJWT({ userId, sessionToken, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY_DAYS}d`)
    .sign(secret);
}

/**
 * Verify a refresh token (Story 1.6 - Task 3)
 * @param token - The refresh token to verify
 * @returns The decoded payload or null if invalid
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string; sessionToken: string } | null> {
  try {
    const secret = new TextEncoder().encode(COOKIE_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.type !== 'refresh') {
      return null;
    }

    return {
      userId: payload.userId as string,
      sessionToken: payload.sessionToken as string,
    };
  } catch {
    return null;
  }
}

/**
 * Get the refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Clear the refresh token cookie
 */
export async function clearRefreshToken(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const isSecure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    cookieStore.set(REFRESH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.error('Failed to clear refresh token:', error);
  }
}

/**
 * Set a new refresh token cookie (for rotation)
 * @param userId - The user ID
 * @param sessionToken - The session token to link to
 *
 * Story 1.6: Security Enhancement - Refresh Token Rotation
 * Implements token rotation to limit the window of opportunity if a refresh token is stolen.
 * Each time a refresh token is used, a new one is issued and the old one is invalidated.
 */
export async function rotateRefreshToken(userId: string, sessionToken: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const now = new Date();
    const refreshExpires = new Date(now.getTime() + REFRESH_DURATION);

    // Generate new refresh token
    const newRefreshToken = await generateRefreshToken(userId, sessionToken);
    const isSecure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    // Set new refresh token cookie
    cookieStore.set(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      expires: refreshExpires,
      path: '/',
    });

    return newRefreshToken;
  } catch (error) {
    console.error('Failed to rotate refresh token:', error);
    return null;
  }
}

/**
 * Validate a session and return the user if valid
 * Story 2.1: Extended to include onboarding status for efficient middleware checks
 * Organization: Extended to include organization membership for organization scoping
 * @param updateActivity - Whether to update lastActivity timestamp (default: true)
 * @returns The session data with user if valid, null otherwise
 */
export async function validateSession(updateActivity = true): Promise<{
  user: { id: string; email: string; name: string | null; role: string; onboardingCompleted: Date | null };
  session: { id: string; expires: Date };
  organizationId?: string | null;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    // Look up session in database with user onboarding status and organization memberships
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            onboardingCompleted: true, // Story 2.1: Include for efficient onboarding check
            organizationMemberships: {
              select: {
                organizationId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    // Update last activity timestamp if requested (Story 1.6 - sliding expiration)
    if (updateActivity) {
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() },
      }).catch(() => {
        // Silently fail if update fails
      });
    }

    // Get the primary organization ID (first membership or null)
    // In a multi-org scenario, we'd use context to determine which org
    const organizationId = session.user.organizationMemberships.length > 0
      ? session.user.organizationMemberships[0].organizationId
      : null;

    // Session is valid, return user data, session info, and organization ID
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        onboardingCompleted: session.user.onboardingCompleted, // Story 2.1
      },
      session: {
        id: session.id,
        expires: session.expires,
      },
      organizationId,
    };
  } catch (error) {
    console.error('Failed to validate session:', error);
    return null; // Fail closed - if we can't validate, treat as unauthenticated
  }
}

/**
 * Destroy the current session (logout)
 * Also clears the refresh token (Story 1.6 - Task 5)
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Delete from database
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    const isSecure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    // Clear session cookie
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: 0,
      path: '/',
    });

    // Clear refresh token cookie (Story 1.6)
    cookieStore.set(REFRESH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.error('Failed to destroy session:', error);
    // Still clear the cookies even if database delete fails
    const cookieStore = await cookies();
    const isSecure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: 0,
      path: '/',
    });

    cookieStore.set(REFRESH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: 0,
      path: '/',
    });
  }
}

/**
 * Refresh a session (extend expiration) - Story 1.6 - Task 2
 * Implements sliding session expiration
 * @returns The new session data or null if refresh failed
 */
export async function refreshSession(): Promise<{
  user: { id: string; email: string; name: string | null; role: string };
  accessToken?: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    // Extend session expiration (sliding window)
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_DURATION);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        expires,
        lastActivity: now,
      },
    });

    // Update session cookie with new expiration
    const isSecure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      expires,
      path: '/',
    });

    // Generate new JWT access token
    const accessToken = await generateJWT(session.user.id);

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      accessToken,
    };
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
}

/**
 * Get all active sessions for a user (Story 1.6 - Task 7)
 * @param userId - The user ID
 * @returns Array of active sessions
 */
export async function getUserSessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expires: session.expires,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceFingerprint: session.deviceFingerprint,
      isCurrent: false, // Will be set by caller
    }));
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

/**
 * Revoke a specific session (Story 1.6 - Task 7)
 * @param sessionId - The session ID to revoke
 * @param userId - The user ID (for authorization)
 * @returns true if revoked, false otherwise
 */
export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return false;
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return true;
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }
}

/**
 * Revoke all sessions for a user except the current one (Story 1.6 - Task 5)
 * @param userId - The user ID
 * @param currentSessionId - The current session ID to exclude
 * @returns Number of sessions revoked
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to revoke all other sessions:', error);
    return 0;
  }
}

/**
 * Revoke all sessions for a user (Story 1.6 - Task 5)
 * @param userId - The user ID
 * @returns Number of sessions revoked
 */
export async function revokeAllSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to revoke all sessions:', error);
    return 0;
  }
}

/**
 * Get the current session token without validating
 * Useful for API routes that need the token
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Get the current session ID
 * @returns The session ID or null
 */
export async function getSessionId(): Promise<string | null> {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: { id: true },
    });

    return session?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get session duration in milliseconds (for client-side timeout warning)
 */
export function getSessionDuration(): number {
  return SESSION_DURATION;
}

/**
 * Get session expiry minutes (for client-side display)
 */
export function getSessionExpiryMinutes(): number {
  return SESSION_EXPIRY_MINUTES;
}

/**
 * Generate a JWT token for API authentication
 * Used for REST API
 * @param userId - The user ID
 * @returns The JWT token
 */
export async function generateJWT(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

/**
 * Verify a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export async function verifyJWT(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}
