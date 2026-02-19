/**
 * POST /api/auth/mfa/regenerate-codes
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Regenerates backup codes for a user with MFA enabled.
 * Invalidates all previous backup codes.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { generateBackupCodes, encryptBackupCodesForStorage, formatBackupCode } from '@/lib/auth/mfa';

export async function POST() {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to regenerate backup codes' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mfaCredentials: {
          where: {
            type: 'TOTP',
            verified: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.mfaEnabled) {
      return NextResponse.json(
        {
          error: 'MFA not enabled',
          message: 'MFA is not enabled for this account',
        },
        { status: 400 }
      );
    }

    const totpCredential = user.mfaCredentials[0];

    if (!totpCredential) {
      return NextResponse.json(
        {
          error: 'TOTP not found',
          message: 'TOTP credential not found. Please setup MFA first.',
        },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();
    const encryptedBackupCodes = encryptBackupCodesForStorage(newBackupCodes);

    // Update credential with new backup codes
    await prisma.mfaCredential.update({
      where: { id: totpCredential.id },
      data: {
        backupCodes: encryptedBackupCodes,
      },
    });

    // Return new backup codes (only shown once)
    return NextResponse.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      backupCodes: newBackupCodes.map(formatBackupCode),
    });
  } catch (error) {
    console.error('MFA regenerate codes error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to regenerate backup codes',
      },
      { status: 500 }
    );
  }
}
