/**
 * POST /api/auth/revoke
 * Story 1.6: Session Management - Revoke all sessions for current user
 *
 * Revokes ALL sessions for the current user, including the current one.
 * This is typically used for password changes, MFA enablement, or security events.
 */

import { NextResponse } from 'next/server';
import { validateSession, revokeAllSessions } from '@/lib/auth/session';

export async function POST() {
  try {
    const validationResult = await validateSession(false);

    if (!validationResult) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to revoke sessions',
        },
        { status: 401 }
      );
    }

    const { user } = validationResult;

    // Revoke all sessions
    const revokedCount = await revokeAllSessions(user.id);

    return NextResponse.json({
      message: `Revoked all ${revokedCount} session${revokedCount !== 1 ? 's' : ''}`,
      revokedCount,
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json(
      {
      error: 'Internal server error',
      message: 'Failed to revoke sessions',
      },
      { status: 500 }
    );
  }
}
