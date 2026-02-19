/**
 * CLI Streaming API Endpoint
 * Story 5.3: CLI Output Streaming
 *
 * GET /api/cli/stream
 *
 * Streams CLI command output in real-time via Server-Sent Events (SSE).
 * This allows clients to see command output as it's generated rather than
 * waiting for the command to complete.
 *
 * Security layers:
 * 1. Authentication (handled by middleware)
 * 2. Whitelist validation (command must exist in ALLOWED_COMMANDS)
 * 3. Role-based authorization (user must have required role)
 * 4. Parameter validation (Zod schema validation)
 * 5. Safe process spawning (execa with shell: false)
 * 6. Client disconnect handling (kills process on disconnect)
 *
 * Runtime: 'nodejs' is required for streaming support (edge runtime doesn't support it).
 */

import { NextRequest } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import { execa } from 'execa';
import { getCommand, hasCommand } from '@/lib/cli-bridge/allowed-commands';
import { canExecuteCommand } from '@/lib/cli-bridge/role-validator';
import { logCommandSuccess, logCommandBlocked } from '@/lib/cli-bridge/audit-logger';
import { ProcessError } from '@/lib/cli-bridge/process-error';
import { sendEvent, startKeepAlive } from '@/lib/sse/helpers';
import { SSE_HEADERS } from '@/lib/sse/types';
import { z } from 'zod';

// Critical: Set runtime to 'nodejs' for streaming support
export const runtime = 'nodejs';

/**
 * Request query validation schema
 */
const streamRequestSchema = z.object({
  commandId: z.string().min(1).max(100),
  params: z.string().optional(),
});

/**
 * Safe environment variables to pass to child processes
 * Never allow user-controlled environment variables
 */
function getSafeEnvironment(): Record<string, string> {
  const safeEnv: Record<string, string> = {
    // Essential system paths
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USER: process.env.USER || '',
    // Language/locale
    LANG: process.env.LANG || 'en_US.UTF-8',
    LC_ALL: process.env.LC_ALL || 'en_US.UTF-8',
    // BMAD-specific configuration (from server env only, never user input)
    BMAD_OUTPUT_FORMAT: 'json',
  };

  // Only add BMAD_API_KEY if it exists in the server environment
  if (process.env.BMAD_API_KEY) {
    safeEnv.BMAD_API_KEY = process.env.BMAD_API_KEY;
  }

  return safeEnv;
}

/**
 * GET /api/cli/stream
 * Stream CLI command output via SSE
 */
export async function GET(request: NextRequest) {
  // Extract client information for audit logging
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // 1. Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Authentication required',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const userRole = (session.user.role as UserRole) ?? UserRole.USER;

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validationResult = streamRequestSchema.safeParse({
      commandId: searchParams.get('commandId') || '',
      params: searchParams.get('params') || undefined,
    });

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Invalid query parameters',
          details: validationResult.error.issues,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { commandId, params: paramsStr } = validationResult.data;

    // Parse parameters if provided
    let parameters: Record<string, unknown> = {};
    if (paramsStr) {
      try {
        parameters = JSON.parse(paramsStr);
      } catch (error) {
        return new Response(
          JSON.stringify({
            type: 'error',
            error: 'Invalid parameters JSON',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

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

      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Command not found in whitelist',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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

      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Command is currently disabled',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
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

      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Insufficient permissions',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build command arguments array
    const args = [...commandDef.args];

    // Add parameters as --key value pairs
    for (const [key, value] of Object.entries(parameters)) {
      // Skip undefined/null values
      if (value === undefined || value === null) {
        continue;
      }

      // Handle different parameter types
      if (typeof value === 'boolean') {
        // Boolean flags: add --flag if true, skip if false
        if (value) {
          args.push(`--${key}`);
        }
      } else if (typeof value === 'object') {
        // Objects/arrays: convert to JSON string
        args.push(`--${key}`, JSON.stringify(value));
      } else {
        // Primitives: add --key value
        args.push(`--${key}`, String(value));
      }
    }

    const fullCommand = `${commandDef.command} ${args.join(' ')}`;
    const streamId = `${commandId}-${userId}-${Date.now()}`;
    const startTime = Date.now();

    // 7. Create the SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        console.log(`[CLI-STREAM] Starting stream ${streamId} for command ${commandId}`);

        let childProcess: ReturnType<typeof execa> | null = null;
        let isComplete = false;

        // Send initial started event
        sendEvent(controller, {
          type: 'started',
          id: streamId,
          command: fullCommand,
          params: parameters,
          timestamp: new Date().toISOString(),
        });

        // Start keep-alive timer
        const stopKeepAlive = startKeepAlive(controller);

        // Cleanup function
        const cleanup = () => {
          if (!isComplete) {
            console.log(`[CLI-STREAM] Cleaning up stream ${streamId}`);
            stopKeepAlive();

            // Kill the process if still running
            if (childProcess && typeof childProcess.kill === 'function') {
              try {
                childProcess.kill('SIGTERM');
                console.log(`[CLI-STREAM] Killed process for stream ${streamId}`);
              } catch (error) {
                console.error(`[CLI-STREAM] Error killing process:`, error);
              }
            }

            isComplete = true;
            try {
              controller.close();
            } catch (e) {
              // Controller may already be closed
            }
          }
        };

        // Listen for abort signal (client disconnect)
        request.signal.addEventListener('abort', cleanup);

        try {
          // 8. Execute the command using execa with streaming
          childProcess = execa(commandDef.command, args, {
            timeout: commandDef.timeout,
            reject: false, // Don't throw on non-zero exit
            cwd: process.cwd(),
            env: getSafeEnvironment(),
            extendTimeout: true,
          });

          const pid = childProcess.pid || 0;

          console.log(`[CLI-STREAM] Started process ${pid} for ${commandId}`);

          // Helper to split output into lines and send as events
          const sendOutputLines = (data: string, streamType: 'stdout' | 'stderr') => {
            if (!data) return;

            // Split by lines to send individual events
            const lines = data.split(/\r?\n/);

            for (const line of lines) {
              // Skip empty lines
              if (!line.trim()) continue;

              // Send output event with the line
              sendEvent(controller, {
                type: 'output',
                id: streamId,
                message: line,
                timestamp: new Date().toISOString(),
              });
            }
          };

          // Stream stdout data
          if (childProcess.stdout) {
            childProcess.stdout.setEncoding('utf-8');
            childProcess.stdout.on('data', (chunk: Buffer | string) => {
              if (!isComplete) {
                const data = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
                sendOutputLines(data, 'stdout');
              }
            });
          }

          // Stream stderr data
          if (childProcess.stderr) {
            childProcess.stderr.setEncoding('utf-8');
            childProcess.stderr.on('data', (chunk: Buffer | string) => {
              if (!isComplete) {
                const data = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
                sendOutputLines(data, 'stderr');
              }
            });
          }

          // Wait for process completion
          const result = await childProcess;
          const duration = Date.now() - startTime;
          const exitCode = result.exitCode ?? 0;

          console.log(`[CLI-STREAM] Process ${pid} completed with exit code ${exitCode}`);

          // Send completion event
          sendEvent(controller, {
            type: 'completed',
            id: streamId,
            exitCode,
            duration,
            timestamp: new Date().toISOString(),
          });

          // Log successful execution
          await logCommandSuccess({
            userId,
            userRole,
            commandId,
            parameters,
            ipAddress,
            userAgent,
            result: {
              stdout: typeof result.stdout === 'string' ? result.stdout : '',
              stderr: typeof result.stderr === 'string' ? result.stderr : '',
              exitCode,
              timedOut: result.timedOut ?? false,
              command: fullCommand,
              duration,
            },
          });

          isComplete = true;
          stopKeepAlive();
          controller.close();

        } catch (error) {
          const duration = Date.now() - startTime;

          console.error(`[CLI-STREAM] Error executing command:`, error);

          let errorMessage = 'Command execution failed';
          let exitCode = 1;

          if (error instanceof ProcessError) {
            errorMessage = error.message;
            exitCode = error.exitCode ?? 1;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          // Send error event
          sendEvent(controller, {
            type: 'error',
            id: streamId,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });

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

          isComplete = true;
          stopKeepAlive();
          controller.close();
        }
      },

      cancel() {
        console.log(`[CLI-STREAM] Stream ${streamId} cancelled`);
      },
    });

    // Return SSE response with proper headers
    return new Response(stream, {
      headers: SSE_HEADERS,
    });

  } catch (error) {
    console.error('[CLI-STREAM] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        type: 'error',
        error: 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/cli/stream
 * Alternative endpoint that accepts command in request body
 */
export async function POST(request: NextRequest) {
  // For POST, we'll redirect to GET with query parameters
  // This keeps the streaming logic in one place
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Authentication required',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Validate body
    const bodySchema = z.object({
      commandId: z.string().min(1).max(100),
      parameters: z.record(z.string(), z.unknown()).optional(),
    });

    const validationResult = bodySchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: 'Invalid request body',
          details: validationResult.error.issues,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { commandId, parameters } = validationResult.data;

    // Redirect to GET endpoint with query parameters
    const url = new URL(request.url);
    url.searchParams.set('commandId', commandId);
    if (parameters) {
      url.searchParams.set('params', JSON.stringify(parameters));
    }

    // Return 302 redirect to GET endpoint
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.pathname + url.search,
      },
    });

  } catch (error) {
    console.error('[CLI-STREAM] POST error:', error);
    return new Response(
      JSON.stringify({
        type: 'error',
        error: 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
