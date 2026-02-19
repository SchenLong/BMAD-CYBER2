/**
 * GET /api/admin/users/[id]/permissions - Get a user's permissions
 *
 * Story 1.5: Role-Based Access Control (RBAC) - Task 6
 *
 * Returns the list of permissions a user has based on their role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { Permission, ROLE_PERMISSIONS, PERMISSION_CATEGORIES } from '@/lib/auth/permissions';

/**
 * GET /api/admin/users/[id]/permissions
 * Get a user's permissions based on their role
 *
 * Requires: Permission.USER_MANAGE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authorization
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = session.user.role as UserRole;

    // Check if user has permission to manage users
    if (!ROLE_PERMISSIONS[userRole]?.includes(Permission.USER_MANAGE)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'User management permission required' },
        { status: 403 }
      );
    }

    // Get target user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get permissions for the user's role
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    // Group permissions by category
    const permissionsByCategory: Record<string, Permission[]> = {};
    const categoryEntries = Object.entries(PERMISSION_CATEGORIES);

    for (const [category, categoryPermissions] of categoryEntries) {
      const userPermissionsInCategory = permissions.filter((p) =>
        categoryPermissions.includes(p)
      );

      if (userPermissionsInCategory.length > 0) {
        permissionsByCategory[category] = userPermissionsInCategory;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      permissions: {
        all: permissions,
        count: permissions.length,
        byCategory: permissionsByCategory,
      },
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to get user permissions' },
      { status: 500 }
    );
  }
}
