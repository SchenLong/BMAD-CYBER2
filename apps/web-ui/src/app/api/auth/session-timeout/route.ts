/**
 * GET /api/auth/session-timeout
 * Story 1.6: Session Management - Server-side timeout check
 *
 * Provides server-side session timeout information to clients.
 * This prevents clients from relying solely on JavaScript for timeout detection,
 * which can be bypassed by disabling JS or modifying the code.
 *
 * Returns the remaining time until session expiry in seconds.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getSessionExpiryMinutes } from '@/lib/auth/session';

export async function GET() {
  try {
    const validationResult = await validateSession(false);

    if (!validationResult) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No valid session found',
        },
        { status: 401 }
      );
    }

    const { session } = validationResult;
    const now = new Date();
    const expiresAt = new Date(session.expires);
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const sessionDurationMinutes = getSessionExpiryMinutes();
    const warningThresholdSeconds = 2 * 60; // 2 minutes

    return NextResponse.json({
      remainingSeconds,
      expiresAt: session.expires.toISOString(),
      sessionDurationMinutes,
      shouldShowWarning: remainingSeconds <= warningThresholdSeconds && remainingSeconds > 0,
      isExpired: remainingSeconds <= 0,
    });
  } catch (error) {
    console.error('Session timeout check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to check session timeout',
      },
      { status: 500 }
    );
  }
}
