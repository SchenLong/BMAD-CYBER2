/**
 * GET /api/sessions
 * Story 1.6: Session Management
 *
 * Returns all active sessions for the current user
 * Used for session management UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSessions, getSessionId } from '@/lib/auth/session';
import { withApiMiddleware } from '@/lib/api/middleware';

async function handler(request: NextRequest, context: { user?: { userId: string } }) {
  try {
    const userId = context.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User ID not found',
        },
        { status: 401 }
      );
    }

    // Get current session ID
    const currentSessionId = await getSessionId();

    // Get all sessions for the user
    const sessions = await getUserSessions(userId);

    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      count: sessionsWithCurrent.length,
      currentSessionId,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch sessions',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiMiddleware(handler, { requireAuth: true });
