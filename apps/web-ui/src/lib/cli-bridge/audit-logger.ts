/**
 * CLI Bridge Audit Logger
 * Story 5.1: Command Whitelist System - Task 5
 *
 * Provides comprehensive audit logging for all CLI command attempts.
 * All command attempts (allowed and blocked) are logged for security compliance.
 *
 * Audit logs are stored in JSON format with daily rotation.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { UserRole } from '@prisma/client';
import type { CliAuditEntry, CliResult } from './types';

/**
 * Audit log configuration
 */
const AUDIT_CONFIG = {
  // Directory for audit logs
  auditDir: process.env.CLI_AUDIT_DIR || join(process.cwd(), '_bmad-output', '.audit'),

  // Log file prefix
  filePrefix: 'cli-audit',

  // Maximum log file size before rotation (50MB)
  maxFileSize: 50 * 1024 * 1024,

  // Retention period in days (90 days by default for compliance)
  retentionDays: 90,

  // Whether to log to console in addition to file
  logToConsole: process.env.NODE_ENV === 'development',
};

/**
 * Ensure audit directory exists
 */
async function ensureAuditDir(): Promise<void> {
  try {
    await fs.mkdir(AUDIT_CONFIG.auditDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create audit directory:', error);
    throw new Error('Audit log directory initialization failed');
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
  return join(AUDIT_CONFIG.auditDir, `${AUDIT_CONFIG.filePrefix}-${dateStr}.jsonl`);
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
        const entry = JSON.parse(lines[i]) as CliAuditEntry;
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
 * Create a new audit entry
 *
 * @param params - Audit entry parameters
 * @returns Complete audit entry with hash
 */
async function createAuditEntry(params: {
  userId: string;
  userRole: UserRole;
  commandId: string;
  parameters: Record<string, unknown>;
  allowed: boolean;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  result?: CliResult;
}): Promise<CliAuditEntry> {
  const prevHash = await getPreviousHash();

  const entryWithoutHash: Omit<CliAuditEntry, 'hash'> = {
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userRole: params.userRole,
    commandId: params.commandId,
    parameters: params.parameters,
    allowed: params.allowed,
    reason: params.reason,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    result: params.result,
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
async function writeAuditEntry(entry: CliAuditEntry): Promise<void> {
  await ensureAuditDir();

  const logPath = getAuditLogPath();
  const line = JSON.stringify(entry) + '\n';

  await fs.appendFile(logPath, line, 'utf-8');

  if (AUDIT_CONFIG.logToConsole) {
    const status = entry.allowed ? 'ALLOWED' : 'BLOCKED';
    console.log(`[CLI-AUDIT:${status}] ${entry.userRole} ${entry.commandId} (${entry.userId})`);
  }
}

/**
 * Log a successful command execution
 *
 * @param params - Execution parameters
 */
export async function logCommandSuccess(params: {
  userId: string;
  userRole: UserRole;
  commandId: string;
  parameters: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  result: CliResult;
}): Promise<void> {
  const entry = await createAuditEntry({
    ...params,
    allowed: true,
  });

  await writeAuditEntry(entry);
}

/**
 * Log a blocked command attempt
 *
 * @param params - Blocked attempt parameters
 */
export async function logCommandBlocked(params: {
  userId: string;
  userRole: UserRole;
  commandId: string;
  parameters: Record<string, unknown>;
  reason: string;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  const entry = await createAuditEntry({
    ...params,
    allowed: false,
  });

  await writeAuditEntry(entry);
}

/**
 * Log any command attempt (allowed or blocked)
 * Generic function that handles both cases
 *
 * @param params - Command attempt parameters
 */
export async function logCommandAttempt(params: {
  userId: string;
  userRole: UserRole;
  commandId: string;
  parameters: Record<string, unknown>;
  allowed: boolean;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  result?: CliResult;
}): Promise<void> {
  const entry = await createAuditEntry(params);
  await writeAuditEntry(entry);
}

/**
 * Read audit log entries for a date range
 *
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @param filters - Optional filters (userId, commandId, allowed)
 * @returns Array of audit entries
 */
export async function readAuditLogs(
  startDate: Date,
  endDate: Date,
  filters?: {
    userId?: string;
    commandId?: string;
    allowed?: boolean;
  }
): Promise<CliAuditEntry[]> {
  const entries: CliAuditEntry[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    try {
      const logPath = getAuditLogPath(currentDate);
      const content = await fs.readFile(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        const entry = JSON.parse(line) as CliAuditEntry;

        // Apply filters
        if (filters?.userId && entry.userId !== filters.userId) continue;
        if (filters?.commandId && entry.commandId !== filters.commandId) continue;
        if (filters?.allowed !== undefined && entry.allowed !== filters.allowed) continue;

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
 * Get audit statistics for a user
 *
 * @param userId - User ID to get stats for
 * @param days - Number of days to look back (default: 30)
 * @returns Statistics object
 */
export async function getUserAuditStats(userId: string, days: number = 30): Promise<{
  totalAttempts: number;
  allowedCommands: number;
  blockedCommands: number;
  mostUsedCommands: Array<{ commandId: string; count: number }>;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await readAuditLogs(startDate, endDate, { userId });

  const commandCounts = new Map<string, number>();
  let allowed = 0;
  let blocked = 0;

  for (const entry of entries) {
    const count = commandCounts.get(entry.commandId) || 0;
    commandCounts.set(entry.commandId, count + 1);

    if (entry.allowed) {
      allowed++;
    } else {
      blocked++;
    }
  }

  const mostUsedCommands = Array.from(commandCounts.entries())
    .map(([commandId, count]) => ({ commandId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalAttempts: entries.length,
    allowedCommands: allowed,
    blockedCommands: blocked,
    mostUsedCommands,
  };
}

/**
 * Verify audit log chain integrity
 * Checks that all hashes in the chain are valid
 *
 * @param date - Date to verify (defaults to today)
 * @returns true if chain is valid, false otherwise
 */
export async function verifyAuditChain(date: Date = new Date()): Promise<boolean> {
  try {
    const logPath = getAuditLogPath(date);
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');

    let prevHash = 'GENESIS';

    for (const line of lines) {
      if (!line.trim()) continue;

      const entry = JSON.parse(line) as CliAuditEntry;

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
export async function rotateAuditLogs(): Promise<void> {
  try {
    await ensureAuditDir();

    const files = await fs.readdir(AUDIT_CONFIG.auditDir);
    const now = Date.now();
    const maxAge = AUDIT_CONFIG.retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith(AUDIT_CONFIG.filePrefix)) continue;

      const filePath = join(AUDIT_CONFIG.auditDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Failed to rotate audit logs:', error);
  }
}

/**
 * Get audit log file path
 * Useful for admin exports
 *
 * @param date - Date to get file for (defaults to today)
 * @returns Full path to the audit log file
 */
export function getAuditFilePath(date: Date = new Date()): string {
  return getAuditLogPath(date);
}

/**
 * Extract IP address from request headers
 * Handles proxy and load balancer scenarios
 *
 * @param headers - Request headers
 * @returns Client IP address
 */
export function extractIpAddress(headers: Headers): string {
  // Check for forwarded headers (proxy/load balancer)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Extract user agent from request headers
 *
 * @param headers - Request headers
 * @returns User agent string
 */
export function extractUserAgent(headers: Headers): string {
  return headers.get('user-agent') || 'unknown';
}

/**
 * Create audit logger middleware helpers
 * Provides convenient functions for API routes
 */
export const auditLogger = {
  /**
   * Log successful command execution
   */
  success: logCommandSuccess,

  /**
   * Log blocked command attempt
   */
  blocked: logCommandBlocked,

  /**
   * Log any command attempt
   */
  attempt: logCommandAttempt,

  /**
   * Get user statistics
   */
  getUserStats: getUserAuditStats,

  /**
   * Verify log integrity
   */
  verify: verifyAuditChain,

  /**
   * Rotate old logs
   */
  rotate: rotateAuditLogs,

  /**
   * Extract IP from request
   */
  extractIp: extractIpAddress,

  /**
   * Extract user agent from request
   */
  extractUserAgent: extractUserAgent,
};
