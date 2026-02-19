/**
 * DELETE /api/auth/sessions/:id
 * Story 1.6: Session Management - Revoke a specific session
 *
 * Revokes a specific session by ID (if it belongs to the current user).
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession, revokeSession } from '@/lib/auth/session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: sessionId } = await params;

    // Prevent revoking current session
    if (sessionId === session.id) {
      return NextResponse.json(
        {
          error: 'Cannot revoke current session',
          message: 'Use the logout endpoint to end your current session',
        },
        { status: 400 }
      );
    }

    // Revoke the session
    const revoked = await revokeSession(sessionId, user.id);

    if (!revoked) {
      return NextResponse.json(
        {
          error: 'Session not found',
          message: 'The session does not exist or does not belong to you',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Session revoked successfully',
      sessionId,
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
