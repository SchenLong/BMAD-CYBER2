/**
 * POST /api/auth/mfa/setup
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Initiates MFA setup by generating TOTP secret and QR code URL.
 * Stores unverified MFA credential temporarily.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { generateTotpSetup } from '@/lib/auth/mfa';
import { encrypt } from '@/lib/auth/encryption';

export async function POST() {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to setup MFA' },
        { status: 401 }
      );
    }

    // Get user with current MFA status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaCredentials: {
          where: { type: 'TOTP' },
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

    // Check if MFA is already enabled
    if (user.mfaEnabled && user.mfaCredentials.length > 0) {
      return NextResponse.json(
        {
          error: 'MFA already enabled',
          message: 'MFA is already enabled for this account',
          alreadyEnabled: true,
        },
        { status: 400 }
      );
    }

    // Delete any existing unverified TOTP credentials
    await prisma.mfaCredential.deleteMany({
      where: {
        userId: user.id,
        type: 'TOTP',
        verified: false,
      },
    });

    // Generate TOTP setup
    const appName = process.env.APP_NAME || 'BMAD';
    const setup = generateTotpSetup(user.email, appName);

    // Encrypt the secret for temporary storage
    const encryptedSecret = encrypt(setup.secret);
    const encryptedBackupCodes = JSON.stringify(setup.backupCodes.map(code => encrypt(code)));

    // Store unverified MFA credential
    await prisma.mfaCredential.create({
      data: {
        userId: user.id,
        type: 'TOTP',
        secret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        verified: false,
      },
    });

    // Return QR code URL and secret (for display)
    return NextResponse.json({
      qrCodeUrl: setup.qrCodeUrl,
      secret: setup.secret, // Plain text for user to save manually
      backupCodesCount: setup.backupCodes.length,
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to initiate MFA setup',
      },
      { status: 500 }
    );
  }
}
