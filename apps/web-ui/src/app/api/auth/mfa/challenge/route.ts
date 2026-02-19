/**
 * GET /api/auth/mfa/challenge
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Returns MFA challenge information for login flow.
 * Called after successful password authentication to check if MFA is required.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get session token from cookie
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No valid session found' },
        { status: 401 }
      );
    }

    // Get user with MFA status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaFactors: true,
        mfaCredentials: {
          select: {
            type: true,
            verified: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Parse MFA factors
    let mfaFactors: string[] = [];
    if (user.mfaFactors) {
      try {
        mfaFactors = JSON.parse(user.mfaFactors);
      } catch (e) {
        console.error('Failed to parse MFA factors:', e);
      }
    }

    return NextResponse.json({
      mfaEnabled: user.mfaEnabled,
      mfaFactors,
      requiresMfa: user.mfaEnabled,
    });
  } catch (error) {
    console.error('MFA challenge error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to get MFA challenge',
      },
      { status: 500 }
    );
  }
}
