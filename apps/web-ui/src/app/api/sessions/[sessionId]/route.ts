/**
 * DELETE /api/sessions/[sessionId]
 * Story 1.6: Session Management
 *
 * Revokes a specific session (logout from that device)
 * Security: Only allows revoking sessions that belong to the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/lib/auth/session';
import { withApiMiddleware } from '@/lib/api/middleware';

interface RouteContext {
  params: { sessionId: string };
}

async function handler(
  request: NextRequest,
  context: { user?: { userId: string } } & { params?: { sessionId: string } }
) {
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

    const sessionId = context.params?.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Session ID is required',
        },
        { status: 400 }
      );
    }

    // Validate sessionId format (cuid format)
    if (!/^[a-z0-9]{25}$/.test(sessionId)) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Invalid session ID format',
        },
        { status: 400 }
      );
    }

    // Revoke the session (revokeSession verifies ownership internally)
    const success = await revokeSession(sessionId, userId);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Session not found or does not belong to you',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to revoke session',
      },
      { status: 500 }
    );
  }
}

export const DELETE = withApiMiddleware(handler, { requireAuth: true });
