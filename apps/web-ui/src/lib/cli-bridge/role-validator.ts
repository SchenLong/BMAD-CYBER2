/**
 * CLI Bridge Role Validator
 * Story 5.1: Command Whitelist System - Task 4
 *
 * Provides role-based access control validation for CLI commands.
 * Integrates with the existing RBAC system from Story 1.5.
 *
 * Role Hierarchy: SUPERADMIN > ADMIN > USER > READONLY
 * API role is separate from hierarchy with specific permissions.
 */

import { UserRole } from '@prisma/client';
import { ROLE_HIERARCHY_LEVELS } from '@/lib/auth/permissions';
import type { CommandDefinition, RoleValidationResult } from './types';

/**
 * Error thrown when role validation fails
 */
export class RoleValidationError extends Error {
  public requiredRole?: UserRole;
  public code: 'INSUFFICIENT_ROLE' | 'ROLE_NOT_FOUND' | 'HIERARCHY_VIOLATION';

  constructor(
    message: string,
    public userRole: UserRole,
    code: 'INSUFFICIENT_ROLE' | 'ROLE_NOT_FOUND' | 'HIERARCHY_VIOLATION',
    requiredRole?: UserRole
  ) {
    super(message);
    this.name = 'RoleValidationError';
    this.code = code;
    this.requiredRole = requiredRole;
  }
}

/**
 * Check if a user's role meets the minimum required level
 * Uses role hierarchy for comparison
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns true if user role meets or exceeds required level
 */
export function meetsMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY_LEVELS[userRole];
  const requiredLevel = ROLE_HIERARCHY_LEVELS[requiredRole];

  return userLevel >= requiredLevel;
}

/**
 * Check if a user can execute a specific command
 * This is the primary authorization check for command execution
 *
 * @param command - The command definition to check
 * @param userRole - The user's role
 * @returns RoleValidationResult indicating if user can execute
 */
export function canExecuteCommand(
  command: CommandDefinition,
  userRole: UserRole
): RoleValidationResult {
  // Check if user's role is in the allowed roles list
  if (!command.allowedRoles.includes(userRole)) {
    // Find the lowest required role for better error messages
    const requiredRole = findMinimumRequiredRole(command.allowedRoles);

    return {
      allowed: false,
      requiredRole,
      userRole,
      error: `Command '${command.id}' requires role '${requiredRole}'. Current role: '${userRole}'`,
    };
  }

  return {
    allowed: true,
    userRole,
  };
}

/**
 * Find the minimum role level from an array of roles
 * Used to determine the lowest required role for a command
 *
 * @param roles - Array of roles to check
 * @returns The role with the lowest hierarchy level
 */
export function findMinimumRequiredRole(roles: UserRole[]): UserRole {
  if (roles.length === 0) {
    return UserRole.READONLY; // Default to lowest
  }

  // Sort roles by hierarchy level and return the first (lowest)
  return roles.sort((a, b) =>
    ROLE_HIERARCHY_LEVELS[a] - ROLE_HIERARCHY_LEVELS[b]
  )[0];
}

/**
 * Check if a user can target another user with a specific role
 * Used for administrative actions like user management
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the user being targeted
 * @returns true if actor can target the user with targetRole
 */
export function canTargetRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actorLevel = ROLE_HIERARCHY_LEVELS[actorRole];
  const targetLevel = ROLE_HIERARCHY_LEVELS[targetRole];

  // Actor must have higher level than target
  return actorLevel > targetLevel;
}

/**
 * Check if a user has any of the specified roles
 *
 * @param userRole - The user's role
 * @param allowedRoles - Array of allowed roles
 * @returns true if user's role is in the allowed list
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Assert that a user can execute a command
 * Throws RoleValidationError if not authorized
 *
 * @param command - The command to check
 * @param userRole - The user's role
 * @throws RoleValidationError if user cannot execute
 */
export function assertCanExecute(
  command: CommandDefinition,
  userRole: UserRole
): void {
  const result = canExecuteCommand(command, userRole);

  if (!result.allowed) {
    throw new RoleValidationError(
      result.error || 'Insufficient permissions',
      userRole,
      'INSUFFICIENT_ROLE',
      result.requiredRole
    );
  }
}

/**
 * Assert that a user meets a minimum role requirement
 * Throws RoleValidationError if not authorized
 *
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 * @throws RoleValidationError if user doesn't meet requirement
 */
export function assertMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole
): void {
  if (!meetsMinimumRole(userRole, requiredRole)) {
    throw new RoleValidationError(
      `Role '${requiredRole}' is required. Current role: '${userRole}'`,
      userRole,
      'INSUFFICIENT_ROLE',
      requiredRole
    );
  }
}

/**
 * Filter commands by user role
 * Returns only commands the user is allowed to execute
 *
 * @param commands - Array of command definitions
 * @param userRole - The user's role
 * @returns Filtered array of commands
 */
export function filterCommandsByRole(
  commands: CommandDefinition[],
  userRole: UserRole
): CommandDefinition[] {
  return commands.filter((cmd) =>
    cmd.allowedRoles.includes(userRole)
  );
}

/**
 * Get all commands a user can execute by role
 *
 * @param userRole - The user's role
 * @param allCommands - All available command definitions
 * @returns Commands the user can execute
 */
export function getExecutableCommands(
  userRole: UserRole,
  allCommands: CommandDefinition[]
): CommandDefinition[] {
  return filterCommandsByRole(allCommands, userRole);
}

/**
 * Check if API role can access a command
 * API role has special handling - it's separate from the hierarchy
 *
 * @param command - The command to check
 * @returns true if API role can execute this command
 */
export function apiRoleCanExecute(command: CommandDefinition): boolean {
  return command.allowedRoles.includes(UserRole.API);
}

/**
 * Validate role hierarchy doesn't violate security constraints
 * Ensures roles are being compared correctly
 *
 * @param higherRole - The higher privilege role
 * @param lowerRole - The lower privilege role
 * @returns true if hierarchy is valid (higher > lower)
 */
export function isValidHierarchy(
  higherRole: UserRole,
  lowerRole: UserRole
): boolean {
  return ROLE_HIERARCHY_LEVELS[higherRole] > ROLE_HIERARCHY_LEVELS[lowerRole];
}

/**
 * Get role display name for UI messages
 *
 * @param role - The role to get display name for
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SUPERADMIN]: 'Super Administrator',
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.DEVELOPER]: 'Developer',
    [UserRole.USER]: 'User',
    [UserRole.READONLY]: 'Read Only',
    [UserRole.API]: 'API Key',
  };

  return displayNames[role] || role;
}

/**
 * Get all roles that can execute a specific command
 *
 * @param command - The command definition
 * @returns Array of role names
 */
export function getAllowedRolesForCommand(command: CommandDefinition): string[] {
  return command.allowedRoles.map(getRoleDisplayName);
}

/**
 * Check if a role is an administrative role
 * Administrative roles: SUPERADMIN, ADMIN
 *
 * @param role - The role to check
 * @returns true if role is administrative
 */
export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.SUPERADMIN || role === UserRole.ADMIN;
}

/**
 * Check if a role can perform administrative actions
 * Administrative actions include user management, system config, etc.
 *
 * @param role - The role to check
 * @returns true if role can perform admin actions
 */
export function canPerformAdminActions(role: UserRole): boolean {
  return isAdminRole(role);
}

/**
 * Cache key for role-based command lists
 * Used to cache filtered command lists by role
 */
export function getRoleCacheKey(role: UserRole): string {
  return `cli:commands:${role}`;
}

/**
 * TTL for role cache in seconds
 * Role assignments typically don't change frequently
 */
export const ROLE_CACHE_TTL = 300; // 5 minutes

/**
 * Role-level command categories
 * Maps roles to command categories they can access
 */
export const ROLE_CATEGORIES: Record<UserRole, string[]> = {
  [UserRole.SUPERADMIN]: ['project', 'agent', 'workflow', 'intel', 'security'],
  [UserRole.ADMIN]: ['project', 'agent', 'workflow', 'intel', 'security'],
  [UserRole.DEVELOPER]: ['project', 'agent', 'workflow', 'intel', 'security'],
  [UserRole.USER]: ['project', 'agent', 'workflow', 'intel'],
  [UserRole.READONLY]: ['project', 'workflow'],
  [UserRole.API]: ['project', 'agent', 'workflow'],
};
