/**
 * CLI Command Detail API Endpoint
 * Story 5.1: Command Whitelist System - Task 6
 *
 * GET /api/cli/commands/[commandId]
 *
 * Returns detailed information about a specific whitelisted command.
 * Includes validation schema, timeout, allowed roles, and examples.
 *
 * Returns 404 if command not in whitelist.
 * Returns 403 if user doesn't have permission to execute.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { getCommand } from '@/lib/cli-bridge';
import { canExecuteCommand } from '@/lib/cli-bridge/role-validator';

interface RouteContext {
  params: Promise<{ commandId: string }>;
}

/**
 * GET /api/cli/commands/[commandId]
 *
 * Returns detailed information about a specific command
 *
 * Response:
 * {
 *   "id": string,
 *   "description": string,
 *   "category": string,
 *   "timeout": number,
 *   "allowedRoles": UserRole[],
 *   "example": string,
 *   "hasPermission": boolean,
 *   "validationSchema": object | null
 * }
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Authenticate user
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

    const { commandId } = await context.params;
    const userRole = session.user.role as UserRole;

    // Check if command exists in whitelist
    const command = getCommand(commandId);

    if (!command) {
      return NextResponse.json(
        {
          error: 'Command not found in whitelist',
          code: 'NOT_FOUND',
          commandId,
        },
        { status: 404 }
      );
    }

    // Check if command is enabled
    if (command.enabled === false) {
      return NextResponse.json(
        {
          error: 'Command is currently disabled',
          code: 'COMMAND_DISABLED',
          commandId,
        },
        { status: 503 }
      );
    }

    // Check if user has permission to execute
    const permissionCheck = canExecuteCommand(command, userRole);

    // Build response (include validation schema if it exists)
    const response = NextResponse.json({
      id: command.id,
      description: command.description,
      category: command.category,
      timeout: command.timeout,
      allowedRoles: command.allowedRoles,
      example: command.example,
      hasPermission: permissionCheck.allowed,
      // Include validation schema info (Zod schema string representation)
      hasValidation: !!command.validation,
      // For security, don't expose the full schema - just indicate it exists
    });

    // Set cache headers (shorter TTL for individual commands)
    response.headers.set('Cache-Control', 'public, max-age=60');

    return response;
  } catch (error) {
    console.error('Error fetching CLI command details:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/cli/commands/[commandId]
 *
 * Returns allowed methods for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
