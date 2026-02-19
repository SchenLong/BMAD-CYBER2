/**
 * GET /api/auth/sessions - List active sessions for current user
 * DELETE /api/auth/sessions - Revoke all sessions except current
 * Story 1.6: Session Management - Session Management API
 *
 * Provides endpoints for managing user sessions.
 */

import { NextResponse } from 'next/server';
import { validateSession, getSessionId, revokeAllOtherSessions } from '@/lib/auth/session';
import { getUserSessions } from '@/lib/auth/session';

/**
 * GET /api/auth/sessions
 * Returns all active sessions for the current user
 */
export async function GET() {
  try {
    const validationResult = await validateSession(false);

    if (!validationResult) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to view sessions',
        },
        { status: 401 }
      );
    }

    const { user } = validationResult;

    // Get current session ID
    const currentSessionId = await getSessionId();

    // Get all sessions for user
    const sessions = await getUserSessions(user.id);

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      count: sessionsWithCurrent.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve sessions',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions
 * Revokes all sessions except the current one
 */
export async function DELETE() {
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

    const { user, session } = validationResult;

    // Revoke all other sessions
    const revokedCount = await revokeAllOtherSessions(user.id, session.id);

    return NextResponse.json({
      message: `Revoked ${revokedCount} other session${revokedCount !== 1 ? 's' : ''}`,
      revokedCount,
    });
  } catch (error) {
    console.error('Revoke sessions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to revoke sessions',
      },
      { status: 500 }
    );
  }
}
