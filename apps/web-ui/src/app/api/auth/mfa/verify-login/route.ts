/**
 * POST /api/auth/mfa/verify-login
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Verifies TOTP or backup code during login flow.
 * Creates MFA-verified session on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyTotp, verifyBackupCode, isValidTotpFormat } from '@/lib/auth/mfa';
import { mfaLoginVerifyRequestSchema } from '@/lib/auth/mfa-validation';

const MFA_VERIFIED_COOKIE = 'mfa_verified';
const MFA_VERIFIED_MAX_AGE = 30 * 60 * 1000; // 30 minutes

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
    const validationResult = mfaLoginVerifyRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { code, backupCode = false } = validationResult.data;

    // Get user with MFA credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mfaCredentials: {
          where: { verified: true },
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

    let isValid = false;
    let usedBackupCode = false;
    let remainingBackupCodes: string[] | undefined;

    // Determine verification method
    const isBackupCodeRequest = backupCode || !isValidTotpFormat(code);

    if (isBackupCodeRequest) {
      // Verify backup code
      const totpCredential = user.mfaCredentials.find(c => c.type === 'TOTP');
      if (!totpCredential || !totpCredential.backupCodes) {
        return NextResponse.json(
          {
            error: 'Invalid code',
            message: 'No backup codes available for this account',
          },
          { status: 400 }
        );
      }

      const result = verifyBackupCode(code, totpCredential.backupCodes);

      if (result.isValid && result.codeIndex !== undefined) {
        isValid = true;
        usedBackupCode = true;
        remainingBackupCodes = result.remainingCodes!;

        // Update backup codes in database (remove used code)
        await prisma.mfaCredential.update({
          where: { id: totpCredential.id },
          data: {
            backupCodes: JSON.stringify(result.remainingCodes),
            lastUsedAt: new Date(),
          },
        });
      }
    } else {
      // Verify TOTP code
      const totpCredential = user.mfaCredentials.find(c => c.type === 'TOTP' && c.secret);

      if (!totpCredential || !totpCredential.secret) {
        return NextResponse.json(
          {
            error: 'MFA misconfigured',
            message: 'TOTP credential not found. Please contact support.',
          },
          { status: 400 }
        );
      }

      isValid = await verifyTotp(code, totpCredential.secret);

      if (isValid) {
        // Update last used timestamp
        await prisma.mfaCredential.update({
          where: { id: totpCredential.id },
          data: { lastUsedAt: new Date() },
        });
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid code',
          message: isBackupCodeRequest
            ? 'The backup code you entered is incorrect or has already been used.'
            : 'The TOTP code you entered is incorrect. Please try again.',
        },
        { status: 400 }
      );
    }

    // Set MFA verified cookie
    const cookieStore = await cookies();
    cookieStore.set(MFA_VERIFIED_COOKIE, 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: MFA_VERIFIED_MAX_AGE / 1000,
      path: '/',
    });

    // Return success
    return NextResponse.json({
      success: true,
      message: 'MFA verified successfully',
      usedBackupCode,
      remainingBackupCodes: remainingBackupCodes?.length || 0,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('MFA verify-login error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to verify MFA',
      },
      { status: 500 }
    );
  }
}

/**
 * Check if MFA has been verified in current session
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const mfaVerified = cookieStore.get(MFA_VERIFIED_COOKIE)?.value === 'true';

    return NextResponse.json({ mfaVerified });
  } catch {
    return NextResponse.json({ mfaVerified: false }, { status: 500 });
  }
}
