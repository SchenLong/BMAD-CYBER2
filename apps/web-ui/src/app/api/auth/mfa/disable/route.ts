/**
 * POST /api/auth/mfa/disable
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Disables MFA for the current user.
 * Requires password confirmation for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import { mfaDisableRequestSchema } from '@/lib/auth/mfa-validation';

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to disable MFA' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = mfaDisableRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
        mfaEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error: 'Password not set',
          message: 'Cannot disable MFA for OAuth-only accounts',
        },
        { status: 400 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: 'Invalid password',
          message: 'The password you entered is incorrect',
        },
        { status: 401 }
      );
    }

    // Check if MFA is enabled
    if (!user.mfaEnabled) {
      return NextResponse.json(
        {
          error: 'MFA not enabled',
          message: 'MFA is not currently enabled for this account',
        },
        { status: 400 }
      );
    }

    // Check enterprise mode restriction
    const deploymentMode = process.env.DEPLOYMENT_MODE || 'community';
    if (deploymentMode === 'enterprise') {
      const mfaRequired = process.env.MFA_REQUIRED_FOR_ENTERPRISE !== 'false';
      if (mfaRequired) {
        return NextResponse.json(
          {
            error: 'Cannot disable MFA',
            message: 'MFA is mandatory for all users in enterprise mode',
          },
          { status: 403 }
        );
      }
    }

    // Disable MFA - delete all MFA credentials and update user
    await prisma.$transaction([
      // Delete all MFA credentials
      prisma.mfaCredential.deleteMany({
        where: { userId: user.id },
      }),
      // Update user MFA status
      prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaFactors: null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to disable MFA',
      },
      { status: 500 }
    );
  }
}
