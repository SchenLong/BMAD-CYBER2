/**
 * CLI Security Middleware Chain
 * Story 5.5: CLI Bridge Security Middleware - Task 7
 *
 * Composes all CLI security middleware in correct order:
 * 1. Authentication (JWT validation)
 * 2. Rate Limiting (per-command limits)
 * 3. Authorization (role-based access)
 * 4. Audit Logging
 *
 * Each layer validates before passing to the next.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cliAuthMiddleware, isAuthError } from './cli-auth';
import { cliRateLimitMiddleware } from './cli-rate-limit';
import { cliAuthorizationMiddleware } from './cli-authorization';
import {
  logAuthSuccess,
  logAuthFailure,
  logRateLimitExceeded,
  logAuthzSuccess,
  logAuthzFailure,
  logCommandExecuted,
} from '@/lib/cli-bridge/security-audit-logger';
import type { AuthContext } from '@/types/cli-security';

/**
 * Security chain result
 * Either returns an error response or the auth context for proceeding
 */
export type SecurityChainResult =
  | { response: NextResponse } // Blocked/error response
  | { authContext: AuthContext }; // Allowed to proceed

/**
 * Apply CLI security chain to request
 * Validates auth, rate limit, and authorization in order
 *
 * @param request - NextRequest object
 * @param commandId - Command ID to execute (optional, for authorization)
 * @returns Security chain result
 *
 * @example
 * ```typescript
 * const result = await applyCLISecurity(request, 'workflow.execute');
 * if ('response' in result) {
 *   return result.response; // Error response
 * }
 * const { authContext } = result;
 * // Proceed with command execution
 * ```
 */
export async function applyCLISecurity(
  request: NextRequest,
  commandId?: string
): Promise<SecurityChainResult> {
  // ============================================================
  // Layer 1: Authentication
  // ============================================================
  const authResult = await cliAuthMiddleware(request);

  if (isAuthError(authResult)) {
    // Log authentication failure
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await logAuthFailure(ip, userAgent, 'Invalid or missing token');

    return { response: authResult };
  }

  const authContext = authResult;

  // Log authentication success
  await logAuthSuccess(authContext);

  // ============================================================
  // Layer 2: Rate Limiting
  // ============================================================
  const rateLimitResult = await cliRateLimitMiddleware(request, authContext, commandId);

  if (rateLimitResult) {
    // Log rate limit exceeded
    await logRateLimitExceeded(authContext, commandId || 'unknown', {
      retryAfter: rateLimitResult.headers.get('Retry-After'),
    });

    return { response: rateLimitResult };
  }

  // ============================================================
  // Layer 3: Authorization (if command specified)
  // ============================================================
  if (commandId) {
    const authzResult = await cliAuthorizationMiddleware(request, authContext, commandId);

    if (authzResult) {
      // Extract status code and reason
      const statusCode = authzResult.status;
      let reason = 'unknown';
      if (statusCode === 404) {
        reason = 'command_not_found';
      } else if (statusCode === 403) {
        reason = 'insufficient_permissions';
      } else if (statusCode === 503) {
        reason = 'command_disabled';
      }

      // Log authorization failure
      await logAuthzFailure(authContext, commandId, reason);

      return { response: authzResult };
    }

    // Log authorization success
    await logAuthzSuccess(authContext, commandId);
  }

  // All checks passed - return auth context
  return { authContext };
}

/**
 * Apply CLI security with command execution
 * Wraps security check and logs command execution
 *
 * @param request - NextRequest object
 * @param commandId - Command ID to execute
 * @param executor - Function to execute the command
 * @returns NextResponse with result or error
 */
export async function executeWithSecurity<T>(
  request: NextRequest,
  commandId: string,
  executor: (authContext: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  // Apply security chain
  const securityResult = await applyCLISecurity(request, commandId);

  if ('response' in securityResult) {
    return securityResult.response;
  }

  const { authContext } = securityResult;

  try {
    // Execute command
    const response = await executor(authContext);

    // Log successful execution
    await logCommandExecuted(authContext, commandId, {
      statusCode: response.status,
    });

    // Apply security headers to response
    return applySecurityHeaders(response);
  } catch (error) {
    // Log execution error
    await logCommandExecuted(authContext, commandId, {
      statusCode: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: 'Command execution failed',
        code: 'EXECUTION_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Apply security headers to response
 * Adds standard security headers to all CLI responses
 *
 * @param response - NextResponse object
 * @returns Response with security headers
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Standard security headers (only set if not already present)
  if (!response.headers.get('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  if (!response.headers.get('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'DENY');
  }
  if (!response.headers.get('X-XSS-Protection')) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production' && !response.headers.get('Strict-Transport-Security')) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

/**
 * Create error response with consistent format
 *
 * @param message - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code
 * @param details - Additional details
 * @returns NextResponse with error
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number,
  details?: Record<string, unknown>
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status: statusCode }
  );

  return applySecurityHeaders(response);
}

/**
 * Extract command ID from request
 * Tries multiple sources: body, query param, path param
 *
 * @param request - NextRequest object
 * @returns Command ID or undefined
 */
export async function extractCommandId(request: NextRequest): Promise<string | undefined> {
  // Try request body first
  try {
    const body = await request.json().catch(() => null);
    if (body?.commandId) {
      return body.commandId;
    }
    if (body?.command) {
      return body.command;
    }
  } catch {
    // Body parsing failed, continue
  }

  // Try query parameter
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.has('command')) {
    return searchParams.get('command') || undefined;
  }
  if (searchParams.has('commandId')) {
    return searchParams.get('commandId') || undefined;
  }

  // Try path parameter (for routes like /api/cli/:command)
  const pathParts = request.nextUrl.pathname.split('/');
  const commandIndex = pathParts.findIndex((p) => p === 'cli') + 1;
  if (commandIndex > 0 && commandIndex < pathParts.length) {
    return pathParts[commandIndex];
  }

  return undefined;
}

/**
 * Parse and validate request body
 * Ensures required fields are present
 *
 * @param request - NextRequest object
 * @param schema - Zod schema for validation
 * @returns Validated body or error response
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema?: { parse: (data: unknown) => T }
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await request.json();

    if (schema) {
      const validated = schema.parse(body);
      return { data: validated };
    }

    return { data: body as T };
  } catch (error) {
    const errorResponse = NextResponse.json(
      {
        error: 'Invalid request body',
        code: 'INVALID_BODY',
      },
      { status: 400 }
    );
    return { error: applySecurityHeaders(errorResponse) };
  }
}

/**
 * Security chain middleware factory
 * Creates a middleware function with custom configuration
 *
 * @param options - Optional configuration
 * @returns Middleware function
 */
export function createCLISecurityMiddleware(options?: {
  /** Whether to require command ID */
  requireCommand?: boolean;
  /** Custom rate limit bypass */
  bypassRateLimit?: (authContext: AuthContext) => boolean;
}) {
  return async (
    request: NextRequest,
    commandId?: string
  ): Promise<SecurityChainResult> => {
    // Extract command if required and not provided
    if (options?.requireCommand && !commandId) {
      commandId = await extractCommandId(request);
    }

    // Use standard security chain
    return applyCLISecurity(request, commandId);
  };
}

/**
 * Handle security chain errors consistently
 *
 * @param error - Error from security chain
 * @param authContext - Auth context (if available)
 * @param commandId - Command ID (if available)
 * @returns NextResponse with error
 */
export function handleSecurityError(
  error: unknown,
  authContext?: AuthContext,
  commandId?: string
): NextResponse {
  console.error('[CLI-SECURITY] Error:', error);

  const statusCode = error && typeof error === 'object' && 'statusCode' in error
    ? (error.statusCode as number)
    : 500;

  const message = error instanceof Error ? error.message : 'An error occurred';
  const code = error && typeof error === 'object' && 'code' in error
    ? (error.code as string)
    : 'SECURITY_ERROR';

  return createErrorResponse(message, code, statusCode, {
    ...(commandId && { command: commandId }),
  });
}
