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

    return NextResponse.json(
      {
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
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
