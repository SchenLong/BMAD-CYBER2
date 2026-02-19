/**
 * GET /api/auth/me
 * Story 1.2: Authentication System - Core
 *
 * Returns the current authenticated user's information.
 * Returns 401 if not authenticated.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';

export async function GET() {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          message: 'You must be logged in to access this resource',
        },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      user: session.user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to get user information',
      },
      { status: 500 }
    );
  }
}
