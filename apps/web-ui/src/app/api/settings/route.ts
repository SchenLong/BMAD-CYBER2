/**
 * GET /api/settings
 * Story 8.1: User Settings Management
 *
 * Returns user settings and preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiMiddleware } from '@/lib/api/middleware';

/**
 * Sanitize user input to prevent XSS and injection attacks
 * Removes HTML tags, control characters, and trims whitespace
 */
function sanitizeString(input: string): string {
  // Remove potential HTML tags and control characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validate Content-Type for API requests
 */
function validateContentType(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

async function handler(
  request: NextRequest,
  context: { user?: { userId: string } }
) {
  try {
    const userId = context.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User ID not found',
        },
        { status: 401 }
      );
    }

    // Get user with settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        mfaFactors: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        organizationMemberships: {
          select: {
            organizationId: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get active sessions count
    const { getUserSessions } = await import('@/lib/auth/session');
    const sessions = await getUserSessions(userId);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        mfaFactors: user.mfaFactors ? JSON.parse(user.mfaFactors) : [],
        onboardingCompleted: user.onboardingCompleted,
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
      },
      organizations: user.organizationMemberships.map(membership => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      })),
      security: {
        activeSessions: sessions.length,
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiMiddleware(handler, { requireAuth: true });

/**
 * PATCH /api/settings
 * Story 8.1: User Settings Management
 *
 * Updates user settings and preferences
 */
async function patchHandler(
  request: NextRequest,
  context: { user?: { userId: string } }
) {
  try {
    const userId = context.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User ID not found',
        },
        { status: 401 }
      );
    }

    // Validate Content-Type
    if (!validateContentType(request)) {
      return NextResponse.json(
        {
          error: 'Unsupported Media Type',
          message: 'Content-Type must be application/json',
        },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Build update object with only allowed fields
    const updateData: { name?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Name must be between 2 and 100 characters',
          },
          { status: 400 }
        );
      }

      // Sanitize input to prevent XSS
      const sanitizedName = sanitizeString(name);

      if (sanitizedName.length < 2) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Name contains invalid characters',
          },
          { status: 400 }
        );
      }

      updateData.name = sanitizedName;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        onboardingCompleted: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    // Distinguish between different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body contains invalid JSON',
        },
        { status: 400 }
      );
    }

    console.error('Update settings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}

export const PATCH = withApiMiddleware(patchHandler, { requireAuth: true });
