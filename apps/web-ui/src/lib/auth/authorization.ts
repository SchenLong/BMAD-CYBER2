/**
 * RBAC Authorization Utilities
 * Story 1.5: Role-Based Access Control (RBAC)
 *
 * Provides functions for checking user permissions and role hierarchy.
 */

import { UserRole } from '@prisma/client';
import { Permission, ROLE_PERMISSIONS, ROLE_HIERARCHY_LEVELS } from './permissions';
import { PROJECT_ROLE_PERMISSIONS, PROJECT_ROLE_HIERARCHY_LEVELS, ProjectMemberRole } from './project-roles';

/**
 * Check if a role has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns true if the role has the permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has any of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has all of the permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if one role can perform actions on another role based on hierarchy
 * A role can act on another role if it has a higher hierarchy level
 * @param actorRole - The role performing the action
 * @param targetRole - The role being acted upon
 * @param allowEqual - Whether to allow actions on roles of equal level (default: false)
 * @returns true if the actor role can act on the target role
 */
export function canTargetRole(
  actorRole: UserRole,
  targetRole: UserRole,
  allowEqual = false
): boolean {
  const actorLevel = ROLE_HIERARCHY_LEVELS[actorRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY_LEVELS[targetRole] ?? 0;

  if (allowEqual) {
    return actorLevel >= targetLevel;
  }

  return actorLevel > targetLevel;
}

/**
 * Get all permissions for a given role
 * @param role - The user's role
 * @returns Array of permissions for the role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a project role has a specific permission
 * @param projectRole - The user's project role
 * @param permission - The permission to check
 * @returns true if the project role has the permission
 */
export function hasProjectPermission(projectRole: ProjectMemberRole, permission: Permission): boolean {
  return PROJECT_ROLE_PERMISSIONS[projectRole]?.includes(permission) || false;
}

/**
 * Check if one project role can act on another based on hierarchy
 * @param actorRole - The role performing the action
 * @param targetRole - The role being acted upon
 * @param allowEqual - Whether to allow actions on roles of equal level (default: false)
 * @returns true if the actor role can act on the target role
 */
export function canTargetProjectRole(
  actorRole: ProjectMemberRole,
  targetRole: ProjectMemberRole,
  allowEqual = false
): boolean {
  const actorLevel = PROJECT_ROLE_HIERARCHY_LEVELS[actorRole] ?? 0;
  const targetLevel = PROJECT_ROLE_HIERARCHY_LEVELS[targetRole] ?? 0;

  if (allowEqual) {
    return actorLevel >= targetLevel;
  }

  return actorLevel > targetLevel;
}

/**
 * Combine system role permissions with project role permissions
 * Uses OR logic - user has permission if either role grants it
 * @param systemRole - The user's system role
 * @param projectRole - The user's project role (optional)
 * @param permission - The permission to check
 * @returns true if either role grants the permission
 */
export function hasCombinedPermission(
  systemRole: UserRole,
  projectRole: ProjectMemberRole | null,
  permission: Permission
): boolean {
  // Check system role permissions first
  if (hasPermission(systemRole, permission)) {
    return true;
  }

  // If no project role, deny
  if (!projectRole) {
    return false;
  }

  // Check project role permissions
  return hasProjectPermission(projectRole, permission);
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' = 'FORBIDDEN'
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Assert that a user has a specific permission
 * Throws AuthorizationError if permission is denied
 * @param role - The user's role
 * @param permission - The required permission
 * @throws AuthorizationError if permission is denied
 */
export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Permission denied: ${permission} required for role ${role}`,
      'FORBIDDEN'
    );
  }
}

/**
 * Assert that a user has any of the specified permissions
 * Throws AuthorizationError if all permissions are denied
 * @param role - The user's role
 * @param permissions - Array of permissions (any one is sufficient)
 * @throws AuthorizationError if all permissions are denied
 */
export function requireAnyPermission(role: UserRole, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new AuthorizationError(
      `Permission denied: one of ${permissions.join(', ')} required for role ${role}`,
      'FORBIDDEN'
    );
  }
}

/**
 * Assert that a user has a specific role or higher in hierarchy
 * Throws AuthorizationError if role is too low
 * @param userRole - The user's role
 * @param minimumRole - The minimum required role
 * @throws AuthorizationError if role is too low
 */
export function requireMinimumRole(userRole: UserRole, minimumRole: UserRole): void {
  if (!canTargetRole(userRole, minimumRole, true)) {
    throw new AuthorizationError(
      `Permission denied: role ${minimumRole} or higher required, got ${userRole}`,
      'FORBIDDEN'
    );
  }
}

/**
 * Assert that a user has a specific role
 * Throws AuthorizationError if role doesn't match
 * @param userRole - The user's role
 * @param requiredRole - The required role
 * @throws AuthorizationError if role doesn't match
 */
export function requireRole(userRole: UserRole, requiredRole: UserRole): void {
  if (userRole !== requiredRole) {
    throw new AuthorizationError(
      `Permission denied: role ${requiredRole} required, got ${userRole}`,
      'FORBIDDEN'
    );
  }
}

/**
 * Assert that a user has any of the specified roles
 * Throws AuthorizationError if none of the roles match
 * @param userRole - The user's role
 * @param allowedRoles - Array of allowed roles
 * @throws AuthorizationError if none of the roles match
 */
export function requireAnyRole(userRole: UserRole, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError(
      `Permission denied: one of roles ${allowedRoles.join(', ')} required, got ${userRole}`,
      'FORBIDDEN'
    );
  }
}

/**
 * Cache key generator for permission caching
 * Format: "permissions:{role}"
 */
export function getPermissionsCacheKey(role: UserRole): string {
  return `permissions:${role}`;
}

/**
 * Cache key generator for project permissions
 * Format: "project_permissions:{projectId}:{userId}"
 */
export function getProjectPermissionsCacheKey(projectId: string, userId: string): string {
  return `project_permissions:${projectId}:${userId}`;
}
