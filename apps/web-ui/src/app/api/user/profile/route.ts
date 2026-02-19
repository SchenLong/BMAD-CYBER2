/**
 * User Profile API Route
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * GET: Fetch current user profile with onboarding status
 * PUT: Update user profile (role, onboarding completion)
 *
 * Security enhancements:
 * - Prisma error handling with specific status codes
 * - Rate limiting for profile updates
 * - Input sanitization and validation
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schema for profile update with stricter rules
const updateProfileSchema = z.object({
  onboardingRole: z.enum(['SOLO_OPERATOR', 'TEAM_LEAD', 'EXECUTIVE', 'DEVELOPER']).optional(),
  onboardingCompleted: z.boolean().optional(),
});

// Simple rate limiter using in-memory map (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * GET /api/user/profile
 * Fetch current user profile
 */
export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        onboardingRole: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile with partial data (role changes)
 * Story 2.6: Role-Configured Navigation - Dynamic role change support
 */
export async function PATCH(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { onboardingRole, onboardingCompleted } = validationResult.data;

    // Build update object with only provided fields
    const updateData: Prisma.UserUpdateInput = {};
    if (onboardingRole !== undefined) {
      updateData.onboardingRole = onboardingRole;
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted === true ? new Date() : null;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          onboardingRole: true,
          onboardingCompleted: true,
        },
      });

      return NextResponse.json({ user: updatedUser });
    } catch (dbError) {
      // Handle specific Prisma errors
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2025') {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
      }

      // Re-throw for general error handler
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Distinguish between different error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update user profile (onboarding role, completion status)
 */
export async function PUT(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { onboardingRole, onboardingCompleted } = validationResult.data;

    // Build update object with only provided fields
    const updateData: Prisma.UserUpdateInput = {};
    if (onboardingRole !== undefined) {
      updateData.onboardingRole = onboardingRole;
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted === true ? new Date() : null;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          onboardingRole: true,
          onboardingCompleted: true,
        },
      });

      return NextResponse.json({ user: updatedUser });
    } catch (dbError) {
      // Handle specific Prisma errors
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2025') {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
      }

      // Re-throw for general error handler
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Distinguish between different error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
