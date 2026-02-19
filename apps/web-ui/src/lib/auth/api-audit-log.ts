/**
 * API Audit Logging
 * Story 8.3: API Authentication - Task 6
 *
 * Logs all authenticated API requests with comprehensive metadata.
 *
 * NOTE: Current implementation logs to console. Database persistence will be
 * implemented in Story 9.4 (Comprehensive Audit Logging). The audit log
 * structure is designed to be compatible with the planned database schema.
 */

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Audit event types for API authentication
 */
export enum ApiAuditEventType {
  AUTH_SUCCESS = 'api_auth_success',
  AUTH_FAILURE = 'api_auth_failure',
  AUTH_EXPIRED = 'api_auth_expired',
  AUTH_REVOKED = 'api_auth_revoked',
  REQUEST_SUCCESS = 'api_request_success',
  REQUEST_ERROR = 'api_request_error',
  RATE_LIMITED = 'api_rate_limited',
  PERMISSION_DENIED = 'api_permission_denied',
}

/**
 * Audit log entry structure
 */
export interface ApiAuditLogEntry {
  eventType: ApiAuditEventType;
  requestId: string;
  userId?: string;
  apiKeyId?: string;
  tokenType: 'session' | 'api_key';
  endpoint: string;
  method: string;
  timestamp: Date;
  statusCode?: number;
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
}

/**
 * Severity levels
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `api_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Extract request metadata from headers
 */
export async function extractRequestMetadata(): Promise<{
  requestId: string;
  ipAddress: string;
  userAgent: string;
}> {
  const headersList = await headers();

  const requestId = headersList.get('x-request-id') || generateRequestId();

  const ipAddress =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown';

  const userAgent = headersList.get('user-agent') || 'unknown';

  return {
    requestId,
    ipAddress,
    userAgent,
  };
}

/**
 * Log API authentication event
 */
export async function logApiAuthEvent(entry: {
  eventType: ApiAuditEventType.AUTH_SUCCESS | ApiAuditEventType.AUTH_FAILURE | ApiAuditEventType.AUTH_EXPIRED | ApiAuditEventType.AUTH_REVOKED;
  userId?: string;
  apiKeyId?: string;
  tokenType: 'session' | 'api_key';
  errorMessage?: string;
}): Promise<void> {
  const { requestId, ipAddress, userAgent } = await extractRequestMetadata();

  const logEntry: ApiAuditLogEntry = {
    eventType: entry.eventType,
    requestId,
    userId: entry.userId,
    apiKeyId: entry.apiKeyId,
    tokenType: entry.tokenType,
    endpoint: 'auth',
    method: 'AUTH',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    errorMessage: entry.errorMessage,
  };

  await writeAuditLog(logEntry);
}

/**
 * Log API request event
 */
export async function logApiRequest(entry: {
  userId?: string;
  apiKeyId?: string;
  tokenType: 'session' | 'api_key';
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
}): Promise<void> {
  const { requestId, ipAddress, userAgent } = await extractRequestMetadata();

  const eventType = entry.statusCode >= 400
    ? ApiAuditEventType.REQUEST_ERROR
    : ApiAuditEventType.REQUEST_SUCCESS;

  const logEntry: ApiAuditLogEntry = {
    eventType,
    requestId,
    userId: entry.userId,
    apiKeyId: entry.apiKeyId,
    tokenType: entry.tokenType,
    endpoint: entry.endpoint,
    method: entry.method,
    timestamp: new Date(),
    statusCode: entry.statusCode,
    duration: entry.duration,
    ipAddress,
    userAgent,
  };

  await writeAuditLog(logEntry);
}

/**
 * Log rate limit event
 */
export async function logRateLimitEvent(entry: {
  userId?: string;
  apiKeyId?: string;
  tokenType: 'session' | 'api_key';
  endpoint: string;
}): Promise<void> {
  const { requestId, ipAddress, userAgent } = await extractRequestMetadata();

  const logEntry: ApiAuditLogEntry = {
    eventType: ApiAuditEventType.RATE_LIMITED,
    requestId,
    userId: entry.userId,
    apiKeyId: entry.apiKeyId,
    tokenType: entry.tokenType,
    endpoint: entry.endpoint,
    method: 'RATE_LIMIT',
    timestamp: new Date(),
    ipAddress,
    userAgent,
  };

  await writeAuditLog(logEntry);
}

/**
 * Log permission denied event
 */
export async function logPermissionDeniedEvent(entry: {
  userId?: string;
  apiKeyId?: string;
  tokenType: 'session' | 'api_key';
  endpoint: string;
  method: string;
  requiredPermission: string;
}): Promise<void> {
  const { requestId, ipAddress, userAgent } = await extractRequestMetadata();

  const logEntry: ApiAuditLogEntry = {
    eventType: ApiAuditEventType.PERMISSION_DENIED,
    requestId,
    userId: entry.userId,
    apiKeyId: entry.apiKeyId,
    tokenType: entry.tokenType,
    endpoint: entry.endpoint,
    method: entry.method,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    errorMessage: `Required permission: ${entry.requiredPermission}`,
  };

  await writeAuditLog(logEntry);
}

/**
 * Write audit log to console (and optionally to database/file)
 * This integrates with the existing audit logging infrastructure
 */
async function writeAuditLog(entry: ApiAuditLogEntry): Promise<void> {
  const severity = getSeverityForEvent(entry.eventType);

  // Console logging for development
  if (process.env.NODE_ENV !== 'production') {
    const logMessage = `[API-AUDIT:${severity.toUpperCase()}] ${entry.eventType} | ${entry.requestId} | ${entry.endpoint} | User: ${entry.userId || 'N/A'} | Key: ${entry.apiKeyId || 'N/A'}`;
    console.log(logMessage);
  }

  // TODO: Integrate with database audit log when Story 9.4 is implemented
  // For now, we'll use the existing file-based audit log if available
  // or just console logging

  // Future integration:
  // await prisma.auditLog.create({
  //   data: {
  //     eventType: entry.eventType,
  //     severity,
  //     userId: entry.userId,
  //     apiKeyId: entry.apiKeyId,
  //     endpoint: entry.endpoint,
  //     method: entry.method,
  //     statusCode: entry.statusCode,
  //     duration: entry.duration,
  //     ipAddress: entry.ipAddress,
  //     userAgent: entry.userAgent,
  //     metadata: {
  //       requestId: entry.requestId,
  //       tokenType: entry.tokenType,
  //     },
  //   },
  // });
}

/**
 * Get severity level for event type
 */
function getSeverityForEvent(eventType: ApiAuditEventType): AuditSeverity {
  switch (eventType) {
    case ApiAuditEventType.AUTH_SUCCESS:
    case ApiAuditEventType.REQUEST_SUCCESS:
      return AuditSeverity.INFO;
    case ApiAuditEventType.RATE_LIMITED:
    case ApiAuditEventType.AUTH_EXPIRED:
      return AuditSeverity.WARNING;
    case ApiAuditEventType.AUTH_FAILURE:
    case ApiAuditEventType.REQUEST_ERROR:
    case ApiAuditEventType.PERMISSION_DENIED:
      return AuditSeverity.ERROR;
    case ApiAuditEventType.AUTH_REVOKED:
      return AuditSeverity.CRITICAL;
    default:
      return AuditSeverity.INFO;
  }
}

/**
 * Create an audit log middleware wrapper
 * Wraps a handler and logs the request
 */
export function withApiAuditLog<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
  options: {
    endpoint: string;
    extractContext?: (args: Parameters<T>) => {
      userId?: string;
      apiKeyId?: string;
      tokenType: 'session' | 'api_key';
    };
  }
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const context = options.extractContext?.(args) || { tokenType: 'session' as const };

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      await logApiRequest({
        ...context,
        endpoint: options.endpoint,
        method: 'API',
        statusCode: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      await logApiRequest({
        ...context,
        endpoint: options.endpoint,
        method: 'API',
        statusCode: 500,
        duration,
      });

      throw error;
    }
  }) as T;
}

// Import NextResponse for typing
import { NextResponse } from 'next/server';
