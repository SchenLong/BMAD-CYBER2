/**
 * POST /api/auth/logout
 * Story 1.2: Authentication System - Core
 *
 * Logs out the current user by destroying their session.
 */

import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST() {
  try {
    // Destroy session (clears cookie and deletes from database)
    await destroySession();

    // Create response and also clear the middleware_auth cookie
    const response = NextResponse.json(
      {
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear middleware auth token cookie
    response.cookies.set('middleware_auth', '', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to log out',
      },
      { status: 500 }
    );
  }
}
