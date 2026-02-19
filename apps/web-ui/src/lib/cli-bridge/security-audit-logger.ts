/**
 * CLI Security Audit Logger
 * Story 5.5: CLI Bridge Security Middleware - Task 5
 *
 * Extended audit logging for CLI security events.
 * Logs all security-relevant events: auth, rate limiting, authorization, command execution.
 *
 * Integrates with the existing audit logger from Story 5.1.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { UserRole } from '@prisma/client';
import type { AuthContext } from '@/types/cli-security';
import type { SecurityAuditLogEntry } from '@/types/cli-security';

/**
 * Security audit log configuration
 */
const SECURITY_AUDIT_CONFIG = {
  // Directory for security audit logs
  auditDir: process.env.SECURITY_AUDIT_DIR || join(process.cwd(), '_bmad-output', '.audit'),

  // Log file prefix
  filePrefix: 'cli-security',

  // Maximum log file size before rotation (50MB)
  maxFileSize: 50 * 1024 * 1024,

  // Retention period in days (90 days for compliance)
  retentionDays: 90,

  // Whether to log to console in addition to file
  logToConsole: process.env.NODE_ENV === 'development',
};

/**
 * Ensure audit directory exists
 */
async function ensureAuditDir(): Promise<void> {
  try {
    await fs.mkdir(SECURITY_AUDIT_CONFIG.auditDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create security audit directory:', error);
    throw new Error('Security audit log directory initialization failed');
  }
}

/**
 * Get the audit log file path for current date
 *
 * @param date - Date to get log file for (defaults to today)
 * @returns Full path to the audit log file
 */
function getAuditLogPath(date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return join(SECURITY_AUDIT_CONFIG.auditDir, `${SECURITY_AUDIT_CONFIG.filePrefix}-${dateStr}.jsonl`);
}

/**
 * Get previous hash for chain integrity
 * Reads the last entry from the current log file
 *
 * @returns Hash of the previous entry or "GENESIS" if no previous entry
 */
async function getPreviousHash(): Promise<string> {
  try {
    const logPath = getAuditLogPath();
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');

    if (lines.length === 0 || lines[0] === '') {
      return 'GENESIS';
    }

    // Get the last valid line
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim()) {
        const entry = JSON.parse(lines[i]) as SecurityAuditLogEntry;
        return entry.hash || 'GENESIS';
      }
    }

    return 'GENESIS';
  } catch {
    return 'GENESIS';
  }
}

/**
 * Generate SHA-256 hash for audit entry
 * Used for tamper-evident chain
 *
 * @param data - Data to hash
 * @param prevHash - Previous hash in chain
 * @returns Hex string of SHA-256 hash
 */
async function generateHash(data: unknown, prevHash: string): Promise<string> {
  const crypto = await import('crypto');
  const dataStr = JSON.stringify(data) + prevHash;
  return crypto.createHash('sha256').update(dataStr).digest('hex');
}

/**
 * Create a security audit entry
 *
 * @param params - Audit entry parameters
 * @returns Complete audit entry with hash
 */
async function createAuditEntry(params: {
  eventType: SecurityAuditLogEntry['eventType'];
  authContext: AuthContext;
  command?: string;
  statusCode: number;
  error?: string;
  details?: Record<string, unknown>;
}): Promise<SecurityAuditLogEntry> {
  const prevHash = await getPreviousHash();

  const entryWithoutHash: Omit<SecurityAuditLogEntry, 'hash'> = {
    timestamp: new Date().toISOString(),
    userId: params.authContext.userId,
    userRoles: params.authContext.roles,
    command: params.command,
    eventType: params.eventType,
    ipAddress: params.authContext.ip,
    userAgent: params.authContext.userAgent || 'unknown',
    statusCode: params.statusCode,
    error: params.error,
    details: params.details,
  };

  const hash = await generateHash(entryWithoutHash, prevHash);

  return {
    ...entryWithoutHash,
    hash: `sha256:${hash}`,
    prevHash,
  };
}

/**
 * Write audit entry to log file
 * Appends to daily log file in JSONL format
 *
 * @param entry - Audit entry to write
 */
async function writeAuditEntry(entry: SecurityAuditLogEntry): Promise<void> {
  await ensureAuditDir();

  const logPath = getAuditLogPath();
  const line = JSON.stringify(entry) + '\n';

  await fs.appendFile(logPath, line, 'utf-8');

  if (SECURITY_AUDIT_CONFIG.logToConsole) {
    console.log(`[SECURITY-AUDIT:${entry.eventType}] ${entry.userRoles.join(',')} ${entry.command || 'N/A'} (${entry.userId}) - ${entry.statusCode}`);
  }
}

/**
 * Log authentication success
 *
 * @param authContext - Authentication context
 */
export async function logAuthSuccess(authContext: AuthContext): Promise<void> {
  const entry = await createAuditEntry({
    eventType: 'auth_success',
    authContext,
    statusCode: 200,
  });

  await writeAuditEntry(entry);
}

/**
 * Log authentication failure
 *
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 * @param reason - Failure reason
 */
export async function logAuthFailure(
  ipAddress: string,
  userAgent: string,
  reason: string
): Promise<void> {
  // Create a minimal auth context for failures
  const authContext: AuthContext = {
    userId: 'unknown',
    email: 'unknown',
    roles: [],
    ip: ipAddress,
    userAgent,
  };

  const entry = await createAuditEntry({
    eventType: 'auth_failure',
    authContext,
    statusCode: 401,
    error: reason,
  });

  await writeAuditEntry(entry);
}

/**
 * Log rate limit exceeded
 *
 * @param authContext - Authentication context
 * @param command - Command being attempted
 * @param details - Additional details (retryAfter, limit, etc.)
 */
export async function logRateLimitExceeded(
  authContext: AuthContext,
  command: string,
  details?: Record<string, unknown>
): Promise<void> {
  const entry = await createAuditEntry({
    eventType: 'rate_limited',
    authContext,
    command,
    statusCode: 429,
    error: 'Rate limit exceeded',
    details,
  });

  await writeAuditEntry(entry);
}

/**
 * Log authorization success
 *
 * @param authContext - Authentication context
 * @param command - Command being authorized
 */
export async function logAuthzSuccess(
  authContext: AuthContext,
  command: string
): Promise<void> {
  const entry = await createAuditEntry({
    eventType: 'authz_success',
    authContext,
    command,
    statusCode: 200,
  });

  await writeAuditEntry(entry);
}

/**
 * Log authorization failure
 *
 * @param authContext - Authentication context
 * @param command - Command being attempted
 * @param reason - Failure reason
 * @param requiredRoles - Roles required for command
 */
export async function logAuthzFailure(
  authContext: AuthContext,
  command: string,
  reason: string,
  requiredRoles?: string[]
): Promise<void> {
  const entry = await createAuditEntry({
    eventType: 'authz_failure',
    authContext,
    command,
    statusCode: 403,
    error: reason,
    details: { requiredRoles },
  });

  await writeAuditEntry(entry);
}

/**
 * Log command execution
 *
 * @param authContext - Authentication context
 * @param command - Command executed
 * @param details - Execution details
 */
export async function logCommandExecuted(
  authContext: AuthContext,
  command: string,
  details?: Record<string, unknown>
): Promise<void> {
  const entry = await createAuditEntry({
    eventType: 'command_executed',
    authContext,
    command,
    statusCode: 200,
    details,
  });

  await writeAuditEntry(entry);
}

/**
 * Read security audit logs for a date range
 *
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @param filters - Optional filters
 * @returns Array of audit entries
 */
export async function readSecurityAuditLogs(
  startDate: Date,
  endDate: Date,
  filters?: {
    userId?: string;
    eventType?: SecurityAuditLogEntry['eventType'];
    command?: string;
  }
): Promise<SecurityAuditLogEntry[]> {
  const entries: SecurityAuditLogEntry[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    try {
      const logPath = getAuditLogPath(currentDate);
      const content = await fs.readFile(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        const entry = JSON.parse(line) as SecurityAuditLogEntry;

        // Apply filters
        if (filters?.userId && entry.userId !== filters.userId) continue;
        if (filters?.eventType && entry.eventType !== filters.eventType) continue;
        if (filters?.command && entry.command !== filters.command) continue;

        entries.push(entry);
      }
    } catch {
      // File doesn't exist or can't be read - skip
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return entries;
}

/**
 * Get security statistics for a user
 *
 * @param userId - User ID to get stats for
 * @param days - Number of days to look back (default: 30)
 * @returns Statistics object
 */
export async function getUserSecurityStats(userId: string, days: number = 30): Promise<{
  totalAttempts: number;
  authSuccesses: number;
  authFailures: number;
  rateLimited: number;
  authzFailures: number;
  commandsExecuted: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await readSecurityAuditLogs(startDate, endDate, { userId });

  const commandCounts = new Map<string, number>();
  let authSuccess = 0;
  let authFailure = 0;
  let rateLimited = 0;
  let authzFailure = 0;
  let commandsExecuted = 0;

  for (const entry of entries) {
    // Count commands
    if (entry.command) {
      const count = commandCounts.get(entry.command) || 0;
      commandCounts.set(entry.command, count + 1);
    }

    // Count by event type
    switch (entry.eventType) {
      case 'auth_success':
        authSuccess++;
        break;
      case 'auth_failure':
        authFailure++;
        break;
      case 'rate_limited':
        rateLimited++;
        break;
      case 'authz_failure':
        authzFailure++;
        break;
      case 'command_executed':
        commandsExecuted++;
        break;
    }
  }

  const mostUsedCommands = Array.from(commandCounts.entries())
    .map(([command, count]) => ({ command, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalAttempts: entries.length,
    authSuccesses: authSuccess,
    authFailures: authFailure,
    rateLimited,
    authzFailures: authzFailure,
    commandsExecuted,
    mostUsedCommands,
  };
}

/**
 * Verify security audit log chain integrity
 * Checks that all hashes in the chain are valid
 *
 * @param date - Date to verify (defaults to today)
 * @returns true if chain is valid, false otherwise
 */
export async function verifySecurityAuditChain(date: Date = new Date()): Promise<boolean> {
  try {
    const logPath = getAuditLogPath(date);
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');

    let prevHash = 'GENESIS';

    for (const line of lines) {
      if (!line.trim()) continue;

      const entry = JSON.parse(line) as SecurityAuditLogEntry;

      // Verify prev_hash matches
      if (entry.prevHash !== prevHash) {
        return false;
      }

      // Verify hash is correct
      const expectedHash = await generateHash(
        { ...entry, hash: undefined },
        prevHash
      );
      const actualHash = (entry.hash || '').replace('sha256:', '');

      if (expectedHash !== actualHash || !entry.hash) {
        return false;
      }

      prevHash = entry.hash;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up old audit log files
 * Removes files older than retention period
 */
export async function rotateSecurityAuditLogs(): Promise<void> {
  try {
    await ensureAuditDir();

    const files = await fs.readdir(SECURITY_AUDIT_CONFIG.auditDir);
    const now = Date.now();
    const maxAge = SECURITY_AUDIT_CONFIG.retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith(SECURITY_AUDIT_CONFIG.filePrefix)) continue;

      const filePath = join(SECURITY_AUDIT_CONFIG.auditDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Failed to rotate security audit logs:', error);
  }
}

/**
 * Create security audit logger middleware helpers
 * Provides convenient functions for API routes
 */
export const securityAuditLogger = {
  /**
   * Log authentication success
   */
  authSuccess: logAuthSuccess,

  /**
   * Log authentication failure
   */
  authFailure: logAuthFailure,

  /**
   * Log rate limit exceeded
   */
  rateLimited: logRateLimitExceeded,

  /**
   * Log authorization success
   */
  authzSuccess: logAuthzSuccess,

  /**
   * Log authorization failure
   */
  authzFailure: logAuthzFailure,

  /**
   * Log command execution
   */
  commandExecuted: logCommandExecuted,

  /**
   * Get user statistics
   */
  getUserStats: getUserSecurityStats,

  /**
   * Verify log integrity
   */
  verify: verifySecurityAuditChain,

  /**
   * Rotate old logs
   */
  rotate: rotateSecurityAuditLogs,

  /**
   * Read logs
   */
  readLogs: readSecurityAuditLogs,
};
