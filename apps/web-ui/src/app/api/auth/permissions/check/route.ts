/**
 * Permission Check API Route
 * Story 7.4: Custom Template Builder
 *
 * POST /api/auth/permissions/check
 * Check if the current user has a specific permission
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { Permission } from '@/lib/auth/permissions';
import { z } from 'zod';

const checkPermissionSchema = z.object({
  permission: z.nativeEnum(Permission),
});

export async function POST(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { allowed: false, reason: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = checkPermissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid permission specified', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { permission } = validationResult.data;
    const userRole = session.user.role as any;

    const allowed = hasPermission(userRole, permission);

    return NextResponse.json({
      allowed,
      permission,
      userRole,
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
