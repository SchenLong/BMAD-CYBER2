/**
 * Security Audit Logs API
 * Story 5.5: CLI Bridge Security Middleware - Task 10
 *
 * GET /api/admin/audit-logs - Retrieve security audit logs
 * Requires admin role for access.
 *
 * Query Parameters:
 * - userId: Filter by user ID
 * - command: Filter by command
 * - eventType: Filter by event type
 * - startDate: Start date (ISO-8601)
 * - endDate: End date (ISO-8601)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 500)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyCLISecurity } from '@/middleware/cli-security-chain';
import { readSecurityAuditLogs, getUserSecurityStats } from '@/lib/cli-bridge/security-audit-logger';
import { createSecureJSONResponse, createSecureErrorResponse } from '@/lib/security/security-headers';

/**
 * Query parameter schema
 */
const QuerySchema = z.object({
  userId: z.string().optional(),
  command: z.string().optional(),
  eventType: z.enum([
    'auth_success',
    'auth_failure',
    'rate_limited',
    'authz_success',
    'authz_failure',
    'command_executed',
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(50),
});

/**
 * GET /api/admin/audit-logs
 * Retrieve security audit logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  // ============================================================
  // Security Check
  // ============================================================
  // Note: This endpoint uses session-based auth (NextAuth) instead of JWT
  // because it's accessed from the admin dashboard, not CLI
  const session = await getSession();

  if (!session?.user) {
    return createSecureErrorResponse('Authentication required', 401, 'INVALID_TOKEN');
  }

  // Check admin role
  if (!['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    return createSecureErrorResponse('Admin access required', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  // ============================================================
  // Parse Query Parameters
  // ============================================================
  const searchParams = request.nextUrl.searchParams;
  const queryResult = QuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!queryResult.success) {
    return createSecureErrorResponse(
      'Invalid query parameters',
      400,
      'INVALID_QUERY',
      { errors: queryResult.error.flatten() }
    );
  }

  const {
    userId,
    command,
    eventType,
    startDate: startDateStr,
    endDate: endDateStr,
    page,
    limit,
  } = queryResult.data;

  // Default date range: last 7 days
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Validate date range
  if (startDate > endDate) {
    return createSecureErrorResponse(
      'Start date must be before end date',
      400,
      'INVALID_DATE_RANGE'
    );
  }

  // Max date range: 90 days (retention period)
  const maxDateRange = 90 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > maxDateRange) {
    return createSecureErrorResponse(
      'Date range cannot exceed 90 days',
      400,
      'DATE_RANGE_TOO_LARGE'
    );
  }

  try {
    // ============================================================
    // Read Audit Logs
    // ============================================================
    const logs = await readSecurityAuditLogs(startDate, endDate, {
      userId,
      command,
      eventType,
    });

    // Reverse chronological order (newest first)
    logs.reverse();

    // ============================================================
    // Paginate Results
    // ============================================================
    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    // ============================================================
    // Build Response
    // ============================================================
    return createSecureJSONResponse({
      logs: paginatedLogs.map((log) => ({
        timestamp: log.timestamp,
        userId: log.userId,
        userRoles: log.userRoles,
        command: log.command,
        eventType: log.eventType,
        ipAddress: log.ipAddress,
        statusCode: log.statusCode,
        error: log.error,
        details: log.details,
        // Omit hash from API response (internal use only)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(userId && { userId }),
        ...(command && { command }),
        ...(eventType && { eventType }),
      },
    });
  } catch (error) {
    console.error('[AUDIT-LOGS-API] Error:', error);
    return createSecureErrorResponse(
      'Failed to retrieve audit logs',
      500,
      'INTERNAL_ERROR'
    );
  }
}

/**
 * GET /api/admin/audit-logs/stats
 * Get security statistics for a user
 */
export async function GET_STATS(request: NextRequest) {
  // Security check
  const session = await getSession();

  if (!session?.user) {
    return createSecureErrorResponse('Authentication required', 401, 'INVALID_TOKEN');
  }

  if (!['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    return createSecureErrorResponse('Admin access required', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const days = parseInt(searchParams.get('days') || '30', 10);

  if (!userId) {
    return createSecureErrorResponse('userId parameter is required', 400, 'MISSING_USER_ID');
  }

  if (days < 1 || days > 90) {
    return createSecureErrorResponse('days must be between 1 and 90', 400, 'INVALID_DAYS');
  }

  try {
    const stats = await getUserSecurityStats(userId, days);

    return createSecureJSONResponse({
      userId,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      stats: {
        totalAttempts: stats.totalAttempts,
        authSuccesses: stats.authSuccesses,
        authFailures: stats.authFailures,
        rateLimited: stats.rateLimited,
        authzFailures: stats.authzFailures,
        commandsExecuted: stats.commandsExecuted,
        mostUsedCommands: stats.mostUsedCommands,
      },
    });
  } catch (error) {
    console.error('[AUDIT-LOGS-API-STATS] Error:', error);
    return createSecureErrorResponse(
      'Failed to retrieve user statistics',
      500,
      'INTERNAL_ERROR'
    );
  }
}

/**
 * Helper to get session
 * Reuses existing auth utilities
 */
async function getSession() {
  try {
    const { validateSession } = await import('@/lib/auth/session');
    return await validateSession();
  } catch {
    return null;
  }
}
