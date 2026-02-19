/**
 * CLI Authorization Middleware
 * Story 5.5: CLI Bridge Security Middleware - Task 4
 *
 * Role-based authorization for CLI commands.
 * Checks user roles against command's allowed roles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_COMMANDS } from '@/lib/cli-bridge/allowed-commands';
import { ROLE_HIERARCHY_LEVELS } from '@/lib/auth/permissions';
import type { AuthContext } from '@/types/cli-security';
import { AuthorizationError, CommandNotFoundError } from '@/types/cli-security';

/**
 * Check if user has required role for command
 * Uses role hierarchy to determine access
 *
 * SECURITY FIX: Now requires exact role match OR higher hierarchy level
 * This prevents privilege escalation while allowing proper inheritance
 *
 * @param userRoles - User's roles
 * @param requiredRoles - Roles required for command
 * @returns true if user has access
 */
export function hasRequiredRole(
  userRoles: string[],
  requiredRoles: string[]
): boolean {
  // First, check if user has an exact role match (most secure check)
  if (hasAnyRole(userRoles, requiredRoles)) {
    return true;
  }

  // If no exact match, check hierarchy: user's highest level vs minimum required level
  // This allows higher-privileged users to access lower-privileged commands
  const userRoleLevel = Math.max(
    ...userRoles.map((role) => ROLE_HIERARCHY_LEVELS[role as keyof typeof ROLE_HIERARCHY_LEVELS] || 0)
  );

  // Use minimum required level to allow hierarchy-based access
  const requiredRoleLevel = Math.min(
    ...requiredRoles.map((role) => ROLE_HIERARCHY_LEVELS[role as keyof typeof ROLE_HIERARCHY_LEVELS] || 0)
  );

  // User has access if their level meets or exceeds the minimum required level
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if user has any of the required roles
 * More strict check - user must have at least one exact role match
 *
 * @param userRoles - User's roles
 * @param requiredRoles - Roles required for command
 * @returns true if user has at least one required role
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Get command definition from whitelist
 *
 * @param commandId - Command ID to look up
 * @returns Command definition or undefined if not found
 */
export function getCommandDefinition(commandId: string) {
  return ALLOWED_COMMANDS[commandId];
}

/**
 * Check if command exists in whitelist
 *
 * @param commandId - Command ID to check
 * @returns true if command exists
 */
export function commandExists(commandId: string): boolean {
  return commandId in ALLOWED_COMMANDS;
}

/**
 * Get all available command IDs
 * Optionally filtered by user role
 *
 * @param userRole - User's role (optional)
 * @returns Array of command IDs
 */
export function getAvailableCommands(userRole?: string): string[] {
  if (!userRole) {
    return Object.keys(ALLOWED_COMMANDS);
  }

  return Object.entries(ALLOWED_COMMANDS)
    .filter(([_, def]) => hasAnyRole([userRole], def.allowedRoles))
    .map(([id]) => id);
}

/**
 * CLI Authorization Middleware
 * Validates user has permission to execute command
 *
 * @param request - NextRequest object
 * @param authContext - Authentication context
 * @param commandId - Command ID to authorize
 * @returns NextResponse if unauthorized, null if authorized
 *
 * @example
 * ```typescript
 * const authzResult = await cliAuthorizationMiddleware(request, authContext, 'workflow.execute');
 * if (authzResult) {
 *   return authzResult; // 403 or 404 error
 * }
 * // Proceed with command execution
 * ```
 */
export async function cliAuthorizationMiddleware(
  request: NextRequest,
  authContext: AuthContext,
  commandId: string
): Promise<NextResponse | null> {
  // Check if command exists
  const commandDef = getCommandDefinition(commandId);

  if (!commandDef) {
    const availableCommands = getAvailableCommands();
    return new CommandNotFoundError(commandId, availableCommands).toResponse();
  }

  // Check if command is enabled
  if (commandDef.enabled === false) {
    return NextResponse.json(
      {
        error: 'Command is currently disabled',
        code: 'COMMAND_DISABLED',
        command: commandId,
      },
      { status: 503 }
    );
  }

  // Check user has required roles
  const hasAccess = hasRequiredRole(authContext.roles, commandDef.allowedRoles);

  if (!hasAccess) {
    return NextResponse.json(
      {
        error: 'Insufficient permissions for this command',
        code: 'INSUFFICIENT_PERMISSIONS',
        command: commandId,
        requiredRoles: commandDef.allowedRoles,
        userRoles: authContext.roles,
      },
      { status: 403 }
    );
  }

  // Authorized
  return null;
}

/**
 * Authorization result type
 */
export type AuthorizationResult =
  | { authorized: true; command: typeof ALLOWED_COMMANDS[string] }
  | {
      authorized: false;
      reason: 'not_found' | 'disabled' | 'insufficient_permissions';
      command?: string;
      requiredRoles?: string[];
      userRoles?: string[];
    };

/**
 * Check authorization without creating response
 * Useful for pre-flight checks
 *
 * @param authContext - Authentication context
 * @param commandId - Command ID to check
 * @returns Authorization result
 */
export function checkAuthorization(
  authContext: AuthContext,
  commandId: string
): AuthorizationResult {
  const commandDef = getCommandDefinition(commandId);

  if (!commandDef) {
    return {
      authorized: false,
      reason: 'not_found',
      command: commandId,
    };
  }

  if (commandDef.enabled === false) {
    return {
      authorized: false,
      reason: 'disabled',
      command: commandId,
    };
  }

  const hasAccess = hasRequiredRole(authContext.roles, commandDef.allowedRoles);

  if (!hasAccess) {
    return {
      authorized: false,
      reason: 'insufficient_permissions',
      command: commandId,
      requiredRoles: commandDef.allowedRoles,
      userRoles: authContext.roles,
    };
  }

  return {
    authorized: true,
    command: commandDef,
  };
}

/**
 * Assert authorization - throws error if not authorized
 * Useful for programmatic checks
 *
 * @param authContext - Authentication context
 * @param commandId - Command ID to check
 * @throws AuthorizationError or CommandNotFoundError if not authorized
 */
export function assertAuthorization(
  authContext: AuthContext,
  commandId: string
): void {
  const result = checkAuthorization(authContext, commandId);

  if (!result.authorized) {
    switch (result.reason) {
      case 'not_found':
        throw new CommandNotFoundError(commandId);
      case 'disabled':
        throw new AuthorizationError('Command is currently disabled');
      case 'insufficient_permissions':
        throw new AuthorizationError('Insufficient permissions', {
          command: commandId,
          requiredRoles: result.requiredRoles,
          userRoles: result.userRoles,
        });
    }
  }
}

/**
 * Log authorization failure
 * Utility for audit logging
 *
 * @param authContext - Authentication context
 * @param commandId - Command that was attempted
 * @param reason - Failure reason
 */
export function logAuthorizationFailure(
  authContext: AuthContext,
  commandId: string,
  reason: string
): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[CLI-AUTHZ] Authorization failure: ${reason}`, {
      userId: authContext.userId,
      roles: authContext.roles,
      command: commandId,
      ip: authContext.ip,
    });
  }

  // TODO: Integrate with audit logger when available
  // await logAuditEntry({
  //   eventType: 'authz_failure',
  //   userId: authContext.userId,
  //   userRoles: authContext.roles,
  //   command: commandId,
  //   ipAddress: authContext.ip,
  //   statusCode: 403,
  //   error: reason,
  // });
}

/**
 * Get commands available to user based on role
 * Returns filtered list for UI display
 *
 * @param userRoles - User's roles
 * @returns Array of command definitions user can access
 */
export function getUserCommands(userRoles: string[]): Array<{
  id: string;
  description: string;
  category: string;
  example?: string;
  enabled: boolean;
}> {
  return Object.values(ALLOWED_COMMANDS)
    .filter((cmd) => cmd.enabled !== false && hasRequiredRole(userRoles, cmd.allowedRoles))
    .map(({ id, description, category, example, enabled }) => ({
      id,
      description,
      category,
      example,
      enabled: enabled !== false,
    }));
}

/**
 * Group commands by category
 * Useful for UI organization
 *
 * @param userRoles - User's roles
 * @returns Commands grouped by category
 */
export function getCommandsByCategory(userRoles: string[]): Record<
  string,
  Array<{
    id: string;
    description: string;
    example?: string;
  }>
> {
  const commands = getUserCommands(userRoles);
  const grouped: Record<string, Array<{ id: string; description: string; example?: string }>> = {};

  for (const cmd of commands) {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push({
      id: cmd.id,
      description: cmd.description,
      example: cmd.example,
    });
  }

  return grouped;
}
