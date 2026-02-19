/**
 * GET /api/auth/mfa/status
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Returns current MFA status for the authenticated user.
 * Includes enabled state, factors, and backup code count.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getRemainingBackupCodesCount, shouldWarnBackupCodes } from '@/lib/auth/mfa';

export async function GET() {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Get user with MFA credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaFactors: true,
        mfaCredentials: {
          select: {
            id: true,
            type: true,
            verified: true,
            backupCodes: true,
            lastUsedAt: true,
            createdAt: true,
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

    // Get backup code count
    const totpCredential = user.mfaCredentials.find(c => c.type === 'TOTP');
    const backupCodesCount = getRemainingBackupCodesCount(totpCredential?.backupCodes || null);

    return NextResponse.json({
      mfaEnabled: user.mfaEnabled,
      mfaFactors,
      backupCodesCount,
      shouldWarnBackupCodes: shouldWarnBackupCodes(totpCredential?.backupCodes || null),
      lastUsedAt: totpCredential?.lastUsedAt || null,
      createdAt: totpCredential?.createdAt || null,
    });
  } catch (error) {
    console.error('MFA status error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to get MFA status',
      },
      { status: 500 }
    );
  }
}
