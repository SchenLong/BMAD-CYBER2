/**
 * POST /api/auth/refresh
 * Story 1.6: Session Management - Refresh Token Implementation
 *
 * Uses a refresh token to issue a new access token.
 * The refresh token is stored in an HttpOnly cookie and has a longer expiry (7 days).
 *
 * SECURITY: Implements refresh token rotation - each use generates a new token
 * to limit the window of opportunity if a refresh token is stolen.
 */

import { NextResponse } from 'next/server';
import { getRefreshToken, verifyRefreshToken, refreshSession, rotateRefreshToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get refresh token from cookie
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        {
          error: 'No refresh token',
          message: 'Refresh token not found. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Verify the refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        {
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Check if the session still exists and is valid
    const session = await prisma.session.findUnique({
      where: { sessionToken: payload.sessionToken },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json(
        {
          error: 'Session not found',
          message: 'Session no longer exists. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        {
          error: 'Session expired',
          message: 'Your session has expired. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Refresh the session (sliding expiration)
    const refreshResult = await refreshSession();

    if (!refreshResult) {
      return NextResponse.json(
        {
          error: 'Refresh failed',
          message: 'Failed to refresh session. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Rotate the refresh token (Story 1.6: Security Enhancement)
    // Each use generates a new token, limiting stolen token usability
    const newRefreshToken = await rotateRefreshToken(session.user.id, session.sessionToken);

    if (!newRefreshToken) {
      console.warn('Failed to rotate refresh token, continuing with existing token');
    }

    // Return new access token
    return NextResponse.json({
      user: refreshResult.user,
      accessToken: refreshResult.accessToken,
      tokenRotated: !!newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to refresh token',
      },
      { status: 500 }
    );
  }
}
