/**
 * Authorization Middleware
 * Story 1.5: Role-Based Access Control (RBAC) - Task 4
 *
 * Provides middleware factories for checking permissions and roles.
 * Works with Next.js middleware.ts and App Router.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { Permission } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';
import {
  hasPermission,
  hasAnyPermission,
  AuthorizationError,
} from '@/lib/auth/authorization';
import { ROLE_HIERARCHY_LEVELS } from '@/lib/auth/permissions';

/**
 * Result of an authorization check
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  userRole?: UserRole;
  userId?: string;
}

/**
 * Get the current user's session from the request
 * Uses Auth.js v5 auth() function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCurrentUser(_request?: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    role: session.user.role as UserRole,
  };
}

/**
 * Create middleware that requires a specific permission
 * @param permission - The required permission
 * @returns NextResponse if denied, undefined if allowed
 */
export function requirePermission(permission: Permission) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, permission)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Permission ${permission} required`,
        },
        { status: 403 }
      );
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    return response;
  };
}

/**
 * Create middleware that requires a specific role
 * @param roles - Allowed roles
 * @returns NextResponse if denied, undefined if allowed
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `One of roles ${roles.join(', ')} required`,
        },
        { status: 403 }
      );
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    return response;
  };
}

/**
 * Create middleware that requires any of the specified permissions
 * @param permissions - Array of permissions (any one is sufficient)
 * @returns NextResponse if denied, undefined if allowed
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAnyPermission(user.role, permissions)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `One of permissions ${permissions.join(', ')} required`,
        },
        { status: 403 }
      );
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    return response;
  };
}

/**
 * Create middleware that requires a minimum role level
 * Uses role hierarchy for comparison
 * @param minimumRole - The minimum required role
 * @returns NextResponse if denied, undefined if allowed
 */
export function requireMinimumRoleMiddleware(minimumRole: UserRole) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userLevel = ROLE_HIERARCHY_LEVELS[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY_LEVELS[minimumRole] ?? 0;

    if (userLevel < requiredLevel) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Role ${minimumRole} or higher required`,
        },
        { status: 403 }
      );
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    return response;
  };
}

/**
 * Check authorization without returning a response
 * Useful for Server Components and Server Actions
 * @param permission - The permission to check
 * @returns Authorization result
 */
export async function checkPermission(permission: Permission): Promise<AuthorizationResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      allowed: false,
      reason: 'Not authenticated',
    };
  }

  const userRole = session.user.role as UserRole;

  if (!hasPermission(userRole, permission)) {
    return {
      allowed: false,
      reason: `Permission ${permission} required`,
      userRole,
      userId: session.user.id,
    };
  }

  return {
    allowed: true,
    userRole,
    userId: session.user.id,
  };
}

/**
 * Check if user has any of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns Authorization result
 */
export async function checkAnyPermission(permissions: Permission[]): Promise<AuthorizationResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      allowed: false,
      reason: 'Not authenticated',
    };
  }

  const userRole = session.user.role as UserRole;

  if (!hasAnyPermission(userRole, permissions)) {
    return {
      allowed: false,
      reason: `One of permissions ${permissions.join(', ')} required`,
      userRole,
      userId: session.user.id,
    };
  }

  return {
    allowed: true,
    userRole,
    userId: session.user.id,
  };
}

/**
 * Check if user has a specific role
 * @param role - The role to check
 * @returns Authorization result
 */
export async function checkRole(role: UserRole): Promise<AuthorizationResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      allowed: false,
      reason: 'Not authenticated',
    };
  }

  const userRole = session.user.role as UserRole;

  if (userRole !== role) {
    return {
      allowed: false,
      reason: `Role ${role} required`,
      userRole,
      userId: session.user.id,
    };
  }

  return {
    allowed: true,
    userRole,
    userId: session.user.id,
  };
}

/**
 * Get the current user's role
 * Returns null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();
  return (session?.user?.role as UserRole) || null;
}

/**
 * Get the current user's ID
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Server-side authorization check for Server Components
 * Throws an AuthorizationError if authorization fails
 * @param permission - The required permission
 * @throws AuthorizationError if permission denied
 */
export async function assertPermission(permission: Permission): Promise<void> {
  const result = await checkPermission(permission);

  if (!result.allowed) {
    throw new AuthorizationError(result.reason || 'Permission denied', 'FORBIDDEN');
  }
}

/**
 * Server-side role check for Server Components
 * Throws an AuthorizationError if role doesn't match
 * @param role - The required role
 * @throws AuthorizationError if role doesn't match
 */
export async function assertRole(role: UserRole): Promise<void> {
  const result = await checkRole(role);

  if (!result.allowed) {
    throw new AuthorizationError(result.reason || 'Role requirement not met', 'FORBIDDEN');
  }
}

/**
 * Server-side minimum role check for Server Components
 * Throws an AuthorizationError if role is too low
 * @param minimumRole - The minimum required role
 * @throws AuthorizationError if role is too low
 */
export async function assertMinimumRole(minimumRole: UserRole): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    throw new AuthorizationError('Not authenticated', 'UNAUTHORIZED');
  }

  const userRole = session.user.role as UserRole;
  const userLevel = ROLE_HIERARCHY_LEVELS[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY_LEVELS[minimumRole] ?? 0;

  if (userLevel < requiredLevel) {
    throw new AuthorizationError(`Role ${minimumRole} or higher required`, 'FORBIDDEN');
  }
}
