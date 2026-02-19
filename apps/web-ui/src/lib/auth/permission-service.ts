/**
 * Permission Service
 * Story 8.3: API Authentication - Task 3
 *
 * Handles role-based permission checking and user context loading.
 */

import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Permission enumeration for fine-grained access control
 */
export enum Permission {
  // Agent permissions
  AGENTS_READ = 'agents:read',
  AGENTS_INVOKE = 'agents:invoke',
  AGENTS_WRITE = 'agents:write',

  // Workflow permissions
  WORKFLOWS_READ = 'workflows:read',
  WORKFLOWS_EXECUTE = 'workflows:execute',
  WORKFLOWS_WRITE = 'workflows:write',

  // Project permissions
  PROJECTS_READ = 'projects:read',
  PROJECTS_WRITE = 'projects:write',
  PROJECTS_DELETE = 'projects:delete',

  // Team permissions
  TEAMS_READ = 'teams:read',
  TEAMS_WRITE = 'teams:write',

  // API Key permissions
  API_KEYS_READ = 'api_keys:read',
  API_KEYS_WRITE = 'api_keys:write',
  API_KEYS_DELETE = 'api_keys:delete',

  // User permissions
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',

  // CLI permissions
  CLI_EXECUTE = 'cli:execute',

  // Template permissions
  TEMPLATES_READ = 'templates:read',
  TEMPLATES_WRITE = 'templates:write',
  TEMPLATES_DELETE = 'templates:delete',

  // Admin wildcard
  ADMIN = 'admin',
  ALL = '*',
}

/**
 * Role-based permission mapping
 * Maps user roles to their default permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERADMIN]: [
    Permission.ADMIN,
    Permission.ALL,
  ],
  [UserRole.ADMIN]: [
    Permission.AGENTS_READ,
    Permission.AGENTS_INVOKE,
    Permission.AGENTS_WRITE,
    Permission.WORKFLOWS_READ,
    Permission.WORKFLOWS_EXECUTE,
    Permission.WORKFLOWS_WRITE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_WRITE,
    Permission.PROJECTS_DELETE,
    Permission.TEAMS_READ,
    Permission.TEAMS_WRITE,
    Permission.API_KEYS_READ,
    Permission.API_KEYS_WRITE,
    Permission.API_KEYS_DELETE,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.CLI_EXECUTE,
    Permission.TEMPLATES_READ,
    Permission.TEMPLATES_WRITE,
    Permission.TEMPLATES_DELETE,
  ],
  [UserRole.DEVELOPER]: [
    Permission.AGENTS_READ,
    Permission.AGENTS_INVOKE,
    Permission.WORKFLOWS_READ,
    Permission.WORKFLOWS_EXECUTE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_WRITE,
    Permission.TEAMS_READ,
    Permission.API_KEYS_READ,
    Permission.API_KEYS_WRITE,
    Permission.CLI_EXECUTE,
    Permission.TEMPLATES_READ,
  ],
  [UserRole.USER]: [
    Permission.AGENTS_READ,
    Permission.AGENTS_INVOKE,
    Permission.WORKFLOWS_READ,
    Permission.WORKFLOWS_EXECUTE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_WRITE,
    Permission.TEAMS_READ,
    Permission.API_KEYS_READ,
    Permission.API_KEYS_WRITE,
    Permission.TEMPLATES_READ,
  ],
  [UserRole.READONLY]: [
    Permission.AGENTS_READ,
    Permission.WORKFLOWS_READ,
    Permission.PROJECTS_READ,
    Permission.TEAMS_READ,
    Permission.TEMPLATES_READ,
  ],
  [UserRole.API]: [
    Permission.AGENTS_READ,
    Permission.AGENTS_INVOKE,
    Permission.WORKFLOWS_READ,
    Permission.WORKFLOWS_EXECUTE,
    Permission.PROJECTS_READ,
  ],
};

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns True if role has permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Check for admin wildcard
  if (permissions.includes(Permission.ADMIN) || permissions.includes(Permission.ALL)) {
    return true;
  }

  // Check for exact permission
  if (permissions.includes(permission)) {
    return true;
  }

  // Check for wildcard permission (resource:*)
  const parts = permission.toString().split(':');
  if (parts.length === 2) {
    const wildcard = `${parts[0]}:*` as Permission;
    if (permissions.includes(wildcard)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a role has any of the specified permissions
 * @param role - User role
 * @param permissions - Permissions to check
 * @returns True if role has at least one permission
 */
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => roleHasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param role - User role
 * @param permissions - Permissions to check
 * @returns True if role has all permissions
 */
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => roleHasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Array of permissions
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if API key scopes include required permission
 * @param scopes - Array of scopes from JWT
 * @param permission - Required permission
 * @returns True if scope grants permission
 */
export function scopeHasPermission(scopes: string[], permission: string): boolean {
  // Check for admin wildcard
  if (scopes.includes('admin') || scopes.includes('*')) {
    return true;
  }

  // Check for exact permission
  if (scopes.includes(permission)) {
    return true;
  }

  // Check for wildcard permission (resource:*)
  const parts = permission.split(':');
  if (parts.length === 2) {
    const wildcard = `${parts[0]}:*`;
    if (scopes.includes(wildcard)) {
      return true;
    }
  }

  return false;
}

/**
 * Load user with permissions from database
 * @param userId - User ID
 * @returns User with role and computed permissions
 */
export async function loadUserWithPermissions(userId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  permissions: Permission[];
} | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      permissions: getPermissionsForRole(user.role),
    };
  } catch (error) {
    console.error('Failed to load user with permissions:', error);
    return null;
  }
}

/**
 * Check if user has permission (with database lookup)
 * @param userId - User ID
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export async function userHasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const user = await loadUserWithPermissions(userId);
  if (!user) {
    return false;
  }

  return roleHasPermission(user.role, permission);
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  required: Permission[];
  grantedPermissions: Permission[];
}

/**
 * Check multiple permissions at once
 * @param userId - User ID
 * @param requiredPermissions - Permissions required
 * @returns Permission check result
 */
export async function checkUserPermissions(
  userId: string,
  requiredPermissions: Permission[]
): Promise<PermissionCheckResult> {
  const user = await loadUserWithPermissions(userId);

  if (!user) {
    return {
      granted: false,
      required: requiredPermissions,
      grantedPermissions: [],
    };
  }

  const grantedPermissions = user.permissions;
  const hasAll = requiredPermissions.every(p =>
    grantedPermissions.includes(p) ||
    grantedPermissions.includes(Permission.ADMIN) ||
    grantedPermissions.includes(Permission.ALL)
  );

  return {
    granted: hasAll,
    required: requiredPermissions,
    grantedPermissions,
  };
}

/**
 * Scope permission check result
 */
export interface ScopePermissionCheckResult {
  granted: boolean;
  required: string;
  grantedScopes: string[];
}

/**
 * Check if API key scopes grant required permission
 * @param scopes - API key scopes
 * @param requiredPermission - Required permission string
 * @returns Scope permission check result
 */
export function checkScopePermissions(
  scopes: string[],
  requiredPermission: string
): ScopePermissionCheckResult {
  const granted = scopeHasPermission(scopes, requiredPermission);

  return {
    granted,
    required: requiredPermission,
    grantedScopes: scopes,
  };
}
