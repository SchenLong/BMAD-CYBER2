/**
 * GET /api/admin/users - List all users
 * PATCH /api/admin/users - Bulk update users (future)
 *
 * Story 1.5: Role-Based Access Control (RBAC) - Task 6
 *
 * Admin-only endpoint for managing users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { Permission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';

/**
 * Query parameters schema for listing users
 */
const ListUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/admin/users
 * List all users with pagination and filtering
 *
 * Requires: Permission.USER_MANAGE
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const query = ListUsersQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    // Build where clause
    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      users,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to list users' },
      { status: 500 }
    );
  }
}
