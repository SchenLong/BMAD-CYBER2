/**
 * GET /api/admin/users/[id] - Get a specific user
 * PATCH /api/admin/users/[id] - Update a user
 * DELETE /api/admin/users/[id] - Delete a user
 *
 * Story 1.5: Role-Based Access Control (RBAC) - Task 6
 *
 * Admin-only endpoint for managing individual users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { Permission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import { canTargetRole } from '@/lib/auth/authorization';
import { checkRateLimit, setRateLimitHeaders } from '@/middleware/rate-limit';
import { logRoleChange, logUserUpdate, logUserDeletion, extractIPAddress, extractUserAgent } from '@/lib/audit/audit-log';

/**
 * Schema for updating a user
 */
const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

/**
 * GET /api/admin/users/[id]
 * Get a specific user by ID
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        mfaEnabled: true,
        mfaFactors: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to get user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update a user's role or other attributes
 *
 * Requires: Permission.USER_MANAGE
 * Prevents privilege escalation (can't assign roles higher than your own)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      );
    }

    // Check authorization
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const actorRole = session.user.role as UserRole;

    // Check if user has permission to manage users
    if (!ROLE_PERMISSIONS[actorRole]?.includes(Permission.USER_MANAGE)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'User management permission required' },
        { status: 403 }
      );
    }

    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported Media Type', message: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Parse request body
    const body = await request.json();
    const updates = UpdateUserSchema.parse(body);

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Track changes for audit log
    const changes: Record<string, { from: string | UserRole | null; to: string | UserRole }> = {};

    // Check for privilege escalation when changing roles
    if (updates.role && updates.role !== targetUser.role) {
      changes.role = { from: targetUser.role, to: updates.role };

      // Can't modify roles at or above your own level
      if (!canTargetRole(actorRole, targetUser.role, false)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Cannot modify users with equal or higher privileges',
          },
          { status: 403 }
        );
      }

      // Can't assign roles at or above your own level
      if (!canTargetRole(actorRole, updates.role, false)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Cannot assign roles with equal or higher privileges',
          },
          { status: 403 }
        );
      }

      // Prevent removing the last SuperAdmin
      if (targetUser.role === UserRole.SUPERADMIN && updates.role !== UserRole.SUPERADMIN) {
        const superAdminCount = await prisma.user.count({
          where: { role: UserRole.SUPERADMIN },
        });

        if (superAdminCount <= 1) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Cannot remove the last SuperAdmin',
            },
            { status: 403 }
          );
        }
      }
    }

    if (updates.name && updates.name !== targetUser.name) {
      changes.name = { from: targetUser.name, to: updates.name };
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);

    if (changes.role) {
      await logRoleChange(
        session.user.id,
        session.user.email || 'unknown',
        targetUser.id,
        targetUser.email,
        changes.role.from || 'unknown',
        changes.role.to,
        ipAddress,
        userAgent
      );
    } else if (Object.keys(changes).length > 0) {
      await logUserUpdate(
        session.user.id,
        session.user.email || 'unknown',
        targetUser.id,
        targetUser.email,
        changes,
        ipAddress,
        userAgent
      );
    }

    const response = NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });

    // Set rate limit headers
    setRateLimitHeaders(response, rateLimitResult);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 *
 * Requires: Permission.USER_MANAGE
 * Prevents deletion of users with equal or higher privileges
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      );
    }

    // Check authorization
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const actorRole = session.user.role as UserRole;

    // Check if user has permission to manage users
    if (!ROLE_PERMISSIONS[actorRole]?.includes(Permission.USER_MANAGE)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'User management permission required' },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting users at or above your own level
    if (!canTargetRole(actorRole, targetUser.role, false)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Cannot delete users with equal or higher privileges',
        },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Prevent deleting the last SuperAdmin
    if (targetUser.role === UserRole.SUPERADMIN) {
      const superAdminCount = await prisma.user.count({
        where: { role: UserRole.SUPERADMIN },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Cannot delete the last SuperAdmin',
          },
          { status: 403 }
        );
      }
    }

    // Create audit log before deletion
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);
    await logUserDeletion(
      session.user.id,
      session.user.email || 'unknown',
      targetUser.id,
      targetUser.email,
      targetUser.role,
      ipAddress,
      userAgent
    );

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id },
    });

    const response = NextResponse.json({
      message: 'User deleted successfully',
    });

    // Set rate limit headers
    setRateLimitHeaders(response, rateLimitResult);

    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
