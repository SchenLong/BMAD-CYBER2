/**
 * POST /api/auth/mfa/verify
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Verifies TOTP code during MFA setup and enables MFA.
 * Returns backup codes on successful verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyTotp, formatBackupCode } from '@/lib/auth/mfa';
import { mfaVerifyRequestSchema } from '@/lib/auth/mfa-validation';
import { decrypt } from '@/lib/auth/encryption';

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to verify MFA' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = mfaVerifyRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { code } = validationResult.data;

    // Get user with unverified MFA credential
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mfaCredentials: {
          where: {
            type: 'TOTP',
            verified: false,
          },
          orderBy: { createdAt: 'desc' },
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

    const unverifiedCredential = user.mfaCredentials[0];

    if (!unverifiedCredential || !unverifiedCredential.secret) {
      return NextResponse.json(
        {
          error: 'No pending setup',
          message: 'No MFA setup in progress. Please start MFA setup first.',
        },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const isValid = await verifyTotp(code, unverifiedCredential.secret);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid code',
          message: 'The TOTP code you entered is incorrect. Please try again.',
        },
        { status: 400 }
      );
    }

    // Decrypt backup codes
    let backupCodes: string[] = [];
    if (unverifiedCredential.backupCodes) {
      try {
        const encryptedCodes = JSON.parse(unverifiedCredential.backupCodes) as string[];
        // Decrypt each code individually and format
        backupCodes = encryptedCodes.map(code => {
          const decrypted = decrypt(code);
          return formatBackupCode(decrypted);
        });
      } catch (e) {
        console.error('Failed to decrypt backup codes:', e);
        // Generate new codes if decryption fails
        backupCodes = [];
      }
    }

    // Mark credential as verified and enable MFA
    await prisma.$transaction([
      // Update credential
      prisma.mfaCredential.update({
        where: { id: unverifiedCredential.id },
        data: {
          verified: true,
          lastUsedAt: new Date(),
        },
      }),
      // Update user MFA status
      prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true,
          mfaFactors: JSON.stringify(['TOTP', 'BACKUP_CODE']),
        },
      }),
    ]);

    // Return backup codes (only shown once)
    return NextResponse.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes, // Only shown once
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to verify MFA',
      },
      { status: 500 }
    );
  }
}
