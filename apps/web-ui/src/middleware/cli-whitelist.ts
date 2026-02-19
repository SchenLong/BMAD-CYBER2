/**
 * CLI Whitelist Validation Middleware
 * Story 5.1: Command Whitelist System - Task 3
 *
 * Provides middleware and utilities for validating commands against
 * the configured whitelist. This is a critical security component.
 *
 * All commands must be explicitly whitelisted before execution.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import {
  getCommand,
  getCommandsForRole,
  hasCommand,
  type CommandDefinition,
  type WhitelistValidationResult,
  type RoleValidationResult,
} from '@/lib/cli-bridge';

/**
 * Error thrown when command validation fails
 */
export class WhitelistError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'FORBIDDEN' | 'DISABLED' | 'INVALID',
    public statusCode: number = 404
  ) {
    super(message);
    this.name = 'WhitelistError';
  }
}

/**
 * Validates that a command ID exists in the whitelist
 *
 * @param commandId - The command ID to validate
 * @returns WhitelistValidationResult with command definition or error
 */
export function validateCommandExists(commandId: string): WhitelistValidationResult {
  // Check if command exists in whitelist
  if (!hasCommand(commandId)) {
    return {
      found: false,
      error: `Command '${commandId}' not found in whitelist`,
    };
  }

  const command = getCommand(commandId);

  // Check if command is enabled
  if (command?.enabled === false) {
    return {
      found: true,
      command,
      error: `Command '${commandId}' is currently disabled`,
    };
  }

  return {
    found: true,
    command,
  };
}

/**
 * Validates that a user has permission to execute a command
 *
 * @param command - The command definition
 * @param userRole - The user's role
 * @returns RoleValidationResult indicating if user can execute
 */
export function validateCommandPermission(
  command: CommandDefinition,
  userRole: UserRole
): RoleValidationResult {
  // Check if user's role is in the allowed roles list
  if (!command.allowedRoles.includes(userRole)) {
    // Find the minimum required role (first in the list is typically the lowest)
    const requiredRole = command.allowedRoles[0];

    return {
      allowed: false,
      requiredRole,
      userRole,
      error: `Insufficient permissions. Command '${command.id}' requires role '${requiredRole}'`,
    };
  }

  return {
    allowed: true,
    userRole,
  };
}

/**
 * Validates command ID format and existence
 * Throws WhitelistError if validation fails
 *
 * @param commandId - The command ID to validate
 * @throws WhitelistError if command not found or disabled
 */
export function assertCommandWhitelisted(commandId: string): CommandDefinition {
  const result = validateCommandExists(commandId);

  if (!result.found) {
    throw new WhitelistError(
      result.error || 'Command not found',
      'NOT_FOUND',
      404
    );
  }

  if (result.error) {
    throw new WhitelistError(result.error, 'DISABLED', 503);
  }

  return result.command!;
}

/**
 * Validates both whitelist and user permissions
 * Throws WhitelistError if any validation fails
 *
 * @param commandId - The command ID to validate
 * @param userRole - The user's role
 * @returns CommandDefinition if validation passes
 * @throws WhitelistError if validation fails
 */
export function assertCommandAuthorized(
  commandId: string,
  userRole: UserRole
): CommandDefinition {
  const command = assertCommandWhitelisted(commandId);
  const roleCheck = validateCommandPermission(command, userRole);

  if (!roleCheck.allowed) {
    throw new WhitelistError(
      roleCheck.error || 'Forbidden',
      'FORBIDDEN',
      403
    );
  }

  return command;
}

/**
 * Extract command ID from request body or query params
 *
 * @param request - NextRequest object
 * @returns Command ID or null
 */
export async function extractCommandId(request: NextRequest): Promise<string | null> {
  try {
    // Try body first (for POST/PUT)
    const body = await request.json().catch(() => null);
    if (body?.commandId) {
      return body.commandId as string;
    }

    // Try query params (for GET)
    const urlParam = request.nextUrl.searchParams.get('commandId');
    if (urlParam) {
      return urlParam;
    }

    // Try path params for /api/cli/commands/[commandId] routes
    const pathSegments = request.nextUrl.pathname.split('/');
    const commandIdIndex = pathSegments.findIndex((seg) => seg === 'commands') + 1;
    if (commandIdIndex > 0 && commandIdIndex < pathSegments.length) {
      return pathSegments[commandIdIndex];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Middleware factory for validating CLI command whitelist
 * Use this in API routes to ensure only whitelisted commands can be executed
 *
 * @returns NextResponse if validation fails, undefined if passes
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function POST(request: NextRequest) {
 *   const error = await validateCliWhitelist(request);
 *   if (error) return error;
 *
 *   // Command is whitelisted, proceed with execution
 * }
 * ```
 */
export async function validateCliWhitelist(
  request: NextRequest
): Promise<NextResponse | undefined> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      },
      { status: 401 }
    );
  }

  const commandId = await extractCommandId(request);

  if (!commandId) {
    return NextResponse.json(
      {
        error: 'Command ID is required',
        code: 'MISSING_COMMAND_ID',
      },
      { status: 400 }
    );
  }

  // Security: Validate command ID format to prevent injection attempts
  // Only allow alphanumeric, dots, and hyphens
  const commandIdPattern = /^[a-z][a-z0-9]*\.[a-z][a-z0-9]*(-[a-z][a-z0-9]*)?$/;
  if (!commandIdPattern.test(commandId)) {
    return NextResponse.json(
      {
        error: 'Invalid command ID format',
        code: 'INVALID_COMMAND_ID',
        commandId,
      },
      { status: 400 }
    );
  }

  const userRole = session.user.role as UserRole;

  try {
    // Validate command exists and user has permission
    assertCommandAuthorized(commandId, userRole);

    // Validation passed - add command info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-command-id', commandId);
    response.headers.set('x-user-role', userRole);

    return response;
  } catch (error) {
    if (error instanceof WhitelistError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          commandId,
          ...(error.code === 'NOT_FOUND' && {
            availableCommands: getEnabledCommandIds(),
          }),
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal validation error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Get list of enabled command IDs
 * Useful for error messages showing available commands
 */
export function getEnabledCommandIds(): string[] {
  const enabled = getCommandsForRole(UserRole.USER); // Show all user-accessible commands
  return enabled.map((cmd) => cmd.id);
}

/**
 * Get commands available to a specific user role
 * Returns filtered list for API responses
 *
 * @param userRole - The user's role
 * @returns Array of available command definitions
 */
export function getAvailableCommands(userRole: UserRole): CommandDefinition[] {
  return getCommandsForRole(userRole);
}

/**
 * Validate command parameters against schema
 * Returns validation errors or null if valid
 *
 * @param command - The command definition
 * @param parameters - The parameters to validate
 * @returns Array of validation errors or null
 */
export function validateCommandParameters(
  command: CommandDefinition,
  parameters: Record<string, unknown>
): Array<{ field: string; message: string }> | null {
  if (!command.validation) {
    return null; // No validation schema defined
  }

  const result = command.validation.safeParse(parameters);

  if (result.success) {
    return null;
  }

  return result.error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Middleware factory for command parameter validation
 * Use after whitelist validation
 *
 * @param commandId - The command to validate parameters for
 * @returns NextResponse if validation fails, undefined if passes
 */
export function validateParameters(commandId: string) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const command = getCommand(commandId);

    if (!command) {
      return NextResponse.json(
        { error: 'Command not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!command.validation) {
      return undefined; // No validation required
    }

    try {
      const body = await request.json();
      const parameters = body?.parameters || body;

      const errors = validateCommandParameters(command, parameters);

      if (errors) {
        return NextResponse.json(
          {
            error: 'Parameter validation failed',
            code: 'VALIDATION_ERROR',
            validationErrors: errors,
          },
          { status: 400 }
        );
      }

      return undefined;
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          code: 'INVALID_BODY',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Create standardized command not found error response
 *
 * @param commandId - The requested command ID
 * @returns NextResponse with 404 status
 */
export function commandNotFoundResponse(commandId: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Command not found in whitelist',
      code: 'NOT_FOUND',
      commandId,
      availableCommands: getEnabledCommandIds(),
    },
    { status: 404 }
  );
}

/**
 * Create forbidden response for insufficient permissions
 *
 * @param command - The command definition
 * @param userRole - The user's role
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(
  command: CommandDefinition,
  userRole: UserRole
): NextResponse {
  return NextResponse.json(
    {
      error: 'Insufficient permissions',
      code: 'FORBIDDEN',
      commandId: command.id,
      requiredRoles: command.allowedRoles,
      userRole,
    },
    { status: 403 }
  );
}
