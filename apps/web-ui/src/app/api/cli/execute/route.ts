/**
 * CLI Execution API Endpoint
 * Story 5.2: Safe Process Spawning
 *
 * POST /api/cli/execute
 *
 * Executes whitelisted CLI commands safely.
 *
 * Security layers:
 * 1. Authentication (handled by middleware)
 * 2. Rate limiting (handled by middleware in Story 5.5)
 * 3. Whitelist validation (command must exist in ALLOWED_COMMANDS)
 * 4. Role-based authorization (user must have required role)
 * 5. Parameter validation (Zod schema validation)
 * 6. Safe process spawning (execa with shell: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { commandDispatcher } from '@/lib/cli-bridge/command-dispatcher';
import { processManager } from '@/lib/cli-bridge/process-manager';
import { ProcessError } from '@/lib/cli-bridge/process-error';
import { getCommand, hasCommand } from '@/lib/cli-bridge/allowed-commands';
import { canExecuteCommand } from '@/lib/cli-bridge/role-validator';
import { logCommandSuccess, logCommandBlocked } from '@/lib/cli-bridge/audit-logger';
import type { CommandExecutionRequest, CommandExecutionResponse } from '@/lib/cli-bridge/types';
import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Request body validation schema
 */
const executeRequestSchema = z.object({
  commandId: z.string().min(1).max(100),
  parameters: z.record(z.string(), z.unknown()).optional(),
  timeout: z.number().min(1000).max(3600000).optional(), // 1s to 1h
});

/**
 * POST /api/cli/execute
 * Execute a whitelisted CLI command
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();

  // Extract client information for audit logging
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // 1. Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = (session.user.role as UserRole) ?? UserRole.USER;

    // 2. Parse and validate request body
    let body: CommandExecutionRequest;
    try {
      const rawBody = await request.json();
      body = executeRequestSchema.parse(rawBody);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          validationErrors: error instanceof z.ZodError
            ? error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }))
            : undefined,
        },
        { status: 400 }
      );
    }

    const { commandId, parameters = {}, timeout } = body;

    // 3. Validate command exists in whitelist
    if (!hasCommand(commandId)) {
      await logCommandBlocked({
        userId,
        userRole,
        commandId,
        parameters,
        reason: 'not_found',
        ipAddress,
        userAgent,
      });

      // Import ALLOWED_COMMANDS to show available commands
      const { ALLOWED_COMMANDS } = await import('@/lib/cli-bridge/allowed-commands');
      const availableCommands = Object.keys(ALLOWED_COMMANDS);

      return NextResponse.json(
        {
          success: false,
          error: 'Command not found in whitelist',
          availableCommands,
        },
        { status: 404 }
      );
    }

    const commandDef = getCommand(commandId)!;

    // 4. Check if command is enabled
    if (commandDef.enabled === false) {
      await logCommandBlocked({
        userId,
        userRole,
        commandId,
        parameters,
        reason: 'disabled',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Command is currently disabled',
        },
        { status: 403 }
      );
    }

    // 5. Check user has required role
    const roleCheck = canExecuteCommand(commandDef, userRole);
    if (!roleCheck.allowed) {
      await logCommandBlocked({
        userId,
        userRole,
        commandId,
        parameters,
        reason: 'forbidden',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
          requiredRole: roleCheck.requiredRole,
          userRole,
        },
        { status: 403 }
      );
    }

    // 6. Validate timeout override doesn't exceed command's max timeout
    const effectiveTimeout = timeout ?? commandDef.timeout;
    if (timeout !== undefined && timeout > commandDef.timeout) {
      return NextResponse.json(
        {
          success: false,
          error: `Timeout override exceeds command's maximum timeout of ${commandDef.timeout}ms`,
        },
        { status: 400 }
      );
    }

    // 7. Start process tracking
    const processId = `cli-${userId}-${requestId.substring(0, 8)}`;
    const process = processManager.startProcess(
      processId,
      commandDef.command,
      [...commandDef.args],
      userId,
      commandId
    );

    try {
      // 8. Execute command via dispatcher
      const result = await commandDispatcher.execute(
        commandDef,
        parameters,
        {
          timeout: effectiveTimeout,
        }
      );

      // 9. Update process tracking
      processManager.completeProcess(processId, result.exitCode, result);

      // 10. Log successful execution
      await logCommandSuccess({
        userId,
        userRole,
        commandId,
        parameters,
        ipAddress,
        userAgent,
        result,
      });

      // 11. Return result
      return NextResponse.json(
        {
          success: result.exitCode === 0 || result.timedOut,
          result,
          processId,
        },
        { status: result.exitCode === 0 ? 200 : 202 } // 202 for non-zero exit (still executed)
      );

    } catch (execError) {
      // Handle execution errors
      let errorMessage = 'Command execution failed';
      let statusCode = 500;

      if (execError instanceof ProcessError) {
        errorMessage = execError.message;

        if (execError.isValidationError()) {
          statusCode = 400;
        } else if (execError.isNotFoundError()) {
          statusCode = 404;
        } else if (execError.isDisabledError()) {
          statusCode = 403;
        }

        // Update process tracking on error
        if (execError.isTimeout()) {
          processManager.markTimedOut(processId);
        } else {
          processManager.completeProcess(processId, execError.exitCode ?? 1, {
            stdout: '',
            stderr: execError.stderr || '',
            exitCode: execError.exitCode ?? 1,
            timedOut: execError.timedOut,
            command: commandDef.command,
            error: errorMessage,
          });
        }
      } else if (execError instanceof Error) {
        errorMessage = execError.message;
      }

      // Log failed execution
      await logCommandBlocked({
        userId,
        userRole,
        commandId,
        parameters,
        reason: 'execution_error',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: statusCode }
      );
    }

  } catch (error) {
    // Unexpected errors
    console.error('[CLI Execute] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cli/execute
 * Return information about the execute endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cli/execute',
    method: 'POST',
    description: 'Execute whitelisted CLI commands',
    authentication: 'Required',
    requestBody: {
      commandId: 'string (required) - Command ID from whitelist',
      parameters: 'object (optional) - Command parameters',
      timeout: 'number (optional) - Timeout override in milliseconds',
    },
    response: {
      success: 'boolean - Whether execution succeeded',
      result: 'CliResult - Execution result if successful',
      error: 'string - Error message if failed',
    },
    example: {
      commandId: 'mission.list',
      parameters: {},
    },
  });
}
