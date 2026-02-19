/**
 * Permissions API Route
 *
 * GET /api/auth/permissions - Returns available permissions
 * POST /api/auth/permissions - Check specific permission (redirects to /check)
 *
 * This route serves as the main permissions endpoint.
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { Permission } from '@/lib/auth/permissions';

/**
 * GET /api/auth/permissions
 * Returns list of all available permissions
 */
export async function GET() {
  const session = await validateSession();

  if (!session) {
    return NextResponse.json(
      {
        error: 'Not authenticated',
        message: 'You must be logged in to view permissions',
      },
      { status: 401 }
    );
  }

  // Return all available permissions
  const permissions = Object.values(Permission);

  return NextResponse.json({
    permissions,
    userRole: session.user.role,
  });
}

/**
 * POST /api/auth/permissions
 * Alias for /api/auth/permissions/check
 * Redirects to the check endpoint
 */
export async function POST(request: Request) {
  const session = await validateSession();

  if (!session) {
    return NextResponse.json(
      {
        error: 'Not authenticated',
        message: 'You must be logged in to check permissions',
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Import the check permission logic
    const { hasPermission } = await import('@/lib/auth/authorization');
    const { z } = await import('zod');

    const checkPermissionSchema = z.object({
      permission: z.nativeEnum(Permission),
    });

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
