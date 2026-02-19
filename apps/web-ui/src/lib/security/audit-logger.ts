/**
 * Comprehensive Audit Logging System
 * Story 9.4: Comprehensive Audit Logging
 *
 * Provides tamper-evident audit logging with hash chain verification.
 * Logs are stored both in-memory and can be persisted to database/file.
 */

import crypto from 'crypto';

/**
 * Audit Action Types
 * Categorizes all auditable events in the system
 */
export enum AuditAction {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REVOKED = 'SESSION_REVOKED',

  // Authorization Events
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // Data Access Events
  PROJECT_ACCESSED = 'PROJECT_ACCESSED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  WORKFLOW_EXECUTED = 'WORKFLOW_EXECUTED',
  AGENT_INVOKED = 'AGENT_INVOKED',
  ARTIFACT_UPLOADED = 'ARTIFACT_UPLOADED',
  ARTIFACT_DOWNLOADED = 'ARTIFACT_DOWNLOADED',
  FILE_UPLOADED = 'FILE_UPLOADED',

  // Security Events
  SUSPICIOUS_ACTIVITY_DETECTED = 'SUSPICIOUS_ACTIVITY_DETECTED',
  INJECTION_ATTEMPT_BLOCKED = 'INJECTION_ATTEMPT_BLOCKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',

  // Configuration Events
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  AGENT_CONFIG_UPDATED = 'AGENT_CONFIG_UPDATED',
  WORKFLOW_CONFIG_UPDATED = 'WORKFLOW_CONFIG_UPDATED',

  // Compliance Events
  AUDIT_LOG_ACCESSED = 'AUDIT_LOG_ACCESSED',
  AUDIT_LOG_EXPORTED = 'AUDIT_LOG_EXPORTED',
  COMPLIANCE_REPORT_GENERATED = 'COMPLIANCE_REPORT_GENERATED',
}

/**
 * Severity levels for audit events
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  previousHash: string | null;
  entryHash: string;
}

/**
 * Audit log query filters
 */
export interface AuditQueryFilters {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity;
  limit?: number;
  offset?: number;
}

/**
 * Hash chain verification result
 */
export interface HashChainVerification {
  valid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  firstBreak?: {
    entryId: string;
    timestamp: string;
    expectedHash: string;
    actualHash: string;
  };
}

/**
 * In-memory audit log storage
 * In production, this should be replaced with database persistence
 */
class AuditLogStore {
  private entries: AuditLogEntry[] = [];
  private maxEntries = 10000; // Prevent unbounded growth

  add(entry: AuditLogEntry): void {
    this.entries.push(entry);

    // Prevent unbounded growth
    if (this.entries.length > this.maxEntries) {
      // Remove oldest entries (first 10%)
      const removeCount = Math.floor(this.maxEntries * 0.1);
      this.entries.splice(0, removeCount);
    }
  }

  getAll(): AuditLogEntry[] {
    return [...this.entries];
  }

  query(filters: AuditQueryFilters): AuditLogEntry[] {
    let results = [...this.entries];

    if (filters.userId) {
      results = results.filter(e => e.userId === filters.userId);
    }

    if (filters.action) {
      results = results.filter(e => e.action === filters.action);
    }

    if (filters.resource) {
      results = results.filter(e => e.resource === filters.resource);
    }

    if (filters.resourceId) {
      results = results.filter(e => e.resourceId === filters.resourceId);
    }

    if (filters.startDate) {
      const start = filters.startDate.getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() >= start);
    }

    if (filters.endDate) {
      const end = filters.endDate.getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() <= end);
    }

    if (filters.severity) {
      results = results.filter(e => e.severity === filters.severity);
    }

    // Sort by timestamp descending (newest first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    if (filters.offset) {
      results = results.slice(filters.offset);
    }

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  clear(): void {
    this.entries = [];
  }

  get count(): number {
    return this.entries.length;
  }
}

/**
 * Main Audit Logger class
 * Implements singleton pattern for consistent logging
 */
export class AuditLogger {
  private store: AuditLogStore;
  private previousHash: string | null = null;

  constructor() {
    this.store = new AuditLogStore();
  }

  /**
   * Get the previous hash for the hash chain
   */
  getPreviousHash(): string | null {
    return this.previousHash;
  }

  /**
   * Generate a SHA-256 hash for an audit log entry
   */
  private generateEntryHash(
    previousHash: string | null,
    data: Omit<AuditLogEntry, 'entryHash' | 'previousHash'>
  ): string {
    const content = JSON.stringify({
      previous: previousHash || '',
      timestamp: data.timestamp,
      action: data.action,
      userId: data.userId || '',
      resource: data.resource || '',
      resourceId: data.resourceId || '',
      success: data.success,
    });

    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get severity for an action
   */
  private getSeverityForAction(action: AuditAction): AuditSeverity {
    switch (action) {
      case AuditAction.LOGIN_FAILURE:
      case AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT:
      case AuditAction.BRUTE_FORCE_DETECTED:
        return AuditSeverity.WARNING;

      case AuditAction.INJECTION_ATTEMPT_BLOCKED:
      case AuditAction.SUSPICIOUS_ACTIVITY_DETECTED:
      case AuditAction.ACCOUNT_DELETED:
      case AuditAction.PERMISSION_REVOKED:
      case AuditAction.ROLE_CHANGED:
        return AuditSeverity.ERROR;

      case AuditAction.RATE_LIMIT_EXCEEDED:
        return AuditSeverity.CRITICAL;

      default:
        return AuditSeverity.INFO;
    }
  }

  /**
   * Create an audit log entry
   */
  private createEntry(
    action: AuditAction,
    data: {
      userId?: string;
      userEmail?: string;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      success: boolean;
      reason?: string;
    }
  ): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const severity = this.getSeverityForAction(action);

    // Generate entry ID
    const id = crypto.randomUUID();

    // Create entry without hash first
    const entryWithoutHash: Omit<AuditLogEntry, 'entryHash' | 'previousHash'> = {
      id,
      timestamp,
      action,
      severity,
      ...data,
    };

    // Generate hash with previous hash
    const entryHash = this.generateEntryHash(this.previousHash, entryWithoutHash);

    // Create final entry
    const entry: AuditLogEntry = {
      ...entryWithoutHash,
      previousHash: this.previousHash,
      entryHash,
    };

    // Update previous hash for next entry
    this.previousHash = entryHash;

    return entry;
  }

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    data: {
      userId?: string;
      userEmail?: string;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      success: boolean;
      reason?: string;
    }
  ): Promise<AuditLogEntry> {
    const entry = this.createEntry(action, data);
    this.store.add(entry);
    return entry;
  }

  /**
   * Query audit logs
   */
  query(filters: AuditQueryFilters = {}): AuditLogEntry[] {
    return this.store.query(filters);
  }

  /**
   * Get a single entry by ID
   */
  getById(id: string): AuditLogEntry | undefined {
    return this.store.getAll().find(e => e.id === id);
  }

  /**
   * Verify the hash chain for tamper evidence
   */
  verifyHashChain(): HashChainVerification {
    const entries = this.store.getAll();

    if (entries.length === 0) {
      return {
        valid: true,
        totalEntries: 0,
        verifiedEntries: 0,
      };
    }

    let verifiedCount = 0;
    let firstBreak: HashChainVerification['firstBreak'] | undefined = undefined;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // For first entry, verify previousHash is null
      if (i === 0) {
        if (entry.previousHash !== null) {
          firstBreak = {
            entryId: entry.id,
            timestamp: entry.timestamp,
            expectedHash: 'null (genesis entry)',
            actualHash: entry.previousHash || 'undefined',
          };
          break;
        }
      } else {
        // Verify previousHash matches the previous entry's hash
        const previousEntry = entries[i - 1];
        if (entry.previousHash !== previousEntry.entryHash) {
          firstBreak = {
            entryId: entry.id,
            timestamp: entry.timestamp,
            expectedHash: previousEntry.entryHash,
            actualHash: entry.previousHash || 'undefined',
          };
          break;
        }
      }

      // Re-verify the entry hash
      const entryWithoutHash: Omit<AuditLogEntry, 'entryHash' | 'previousHash'> = {
        id: entry.id,
        timestamp: entry.timestamp,
        action: entry.action,
        severity: entry.severity,
        userId: entry.userId,
        userEmail: entry.userEmail,
        resource: entry.resource,
        resourceId: entry.resourceId,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success,
        reason: entry.reason,
      };

      const expectedHash = this.generateEntryHash(
        entry.previousHash,
        entryWithoutHash
      );

      if (entry.entryHash !== expectedHash) {
        firstBreak = {
          entryId: entry.id,
          timestamp: entry.timestamp,
          expectedHash,
          actualHash: entry.entryHash,
        };
        break;
      }

      verifiedCount++;
    }

    return {
      valid: !firstBreak,
      totalEntries: entries.length,
      verifiedEntries: verifiedCount,
      ...(firstBreak && { firstBreak }),
    };
  }

  /**
   * Get statistics about the audit log
   */
  getStats(): {
    total: number;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    byUser: Record<string, number>;
  } {
    const entries = this.store.getAll();

    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    entries.forEach(entry => {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
      if (entry.userId) {
        byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
      }
    });

    return {
      total: entries.length,
      byAction,
      bySeverity,
      byUser,
    };
  }

  /**
   * Export audit logs for compliance reporting
   */
  export(filters: AuditQueryFilters = {}): {
    entries: AuditLogEntry[];
    exportDate: string;
    verificationStatus: HashChainVerification;
  } {
    const entries = this.query(filters);
    const verificationStatus = this.verifyHashChain();

    return {
      entries,
      exportDate: new Date().toISOString(),
      verificationStatus,
    };
  }

  /**
   * Clear all audit logs (use with caution - admin only)
   */
  clear(): void {
    this.store.clear();
    this.previousHash = null;
  }
}

/**
 * Singleton instance of the audit logger
 */
export const auditLogger = new AuditLogger();

/**
 * Helper functions for common audit scenarios
 */

/**
 * Log authentication events
 */
export async function logAuth(data: {
  userId?: string;
  userEmail?: string;
  action:
    | AuditAction.LOGIN_SUCCESS
    | AuditAction.LOGIN_FAILURE
    | AuditAction.LOGOUT
    | AuditAction.MFA_ENABLED
    | AuditAction.MFA_DISABLED
    | AuditAction.MFA_VERIFIED
    | AuditAction.PASSWORD_CHANGED
    | AuditAction.PASSWORD_RESET_REQUESTED
    | AuditAction.PASSWORD_RESET_COMPLETED
    | AuditAction.ACCOUNT_CREATED
    | AuditAction.SESSION_CREATED
    | AuditAction.SESSION_REVOKED;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}): Promise<AuditLogEntry> {
  return auditLogger.log(data.action, {
    userId: data.userId,
    userEmail: data.userEmail,
    resource: 'auth',
    metadata: { reason: data.reason },
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: data.success,
  });
}

/**
 * Log authorization events
 */
export async function logAuthz(data: {
  userId: string;
  userEmail: string;
  action:
    | AuditAction.PERMISSION_GRANTED
    | AuditAction.PERMISSION_REVOKED
    | AuditAction.ROLE_CHANGED;
  resource: string;
  resourceId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}): Promise<AuditLogEntry> {
  return auditLogger.log(data.action, {
    userId: data.userId,
    userEmail: data.userEmail,
    resource: data.resource,
    resourceId: data.resourceId,
    metadata: {
      previousValue: data.previousValue,
      newValue: data.newValue,
    },
    ipAddress: data.ipAddress,
    success: true,
  });
}

/**
 * Log data access events
 */
export async function logDataAccess(data: {
  userId: string;
  userEmail?: string;
  action:
    | AuditAction.PROJECT_ACCESSED
    | AuditAction.PROJECT_CREATED
    | AuditAction.PROJECT_UPDATED
    | AuditAction.PROJECT_DELETED
    | AuditAction.WORKFLOW_EXECUTED
    | AuditAction.AGENT_INVOKED
    | AuditAction.ARTIFACT_UPLOADED
    | AuditAction.ARTIFACT_DOWNLOADED
    | AuditAction.FILE_UPLOADED;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}): Promise<AuditLogEntry> {
  return auditLogger.log(data.action, {
    userId: data.userId,
    userEmail: data.userEmail,
    resource: data.resource,
    resourceId: data.resourceId,
    metadata: data.metadata,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: data.success,
    reason: data.reason,
  });
}

/**
 * Log security events
 */
export async function logSecurity(data: {
  userId?: string;
  userEmail?: string;
  action:
    | AuditAction.SUSPICIOUS_ACTIVITY_DETECTED
    | AuditAction.INJECTION_ATTEMPT_BLOCKED
    | AuditAction.RATE_LIMIT_EXCEEDED
    | AuditAction.BRUTE_FORCE_DETECTED
    | AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
}): Promise<AuditLogEntry> {
  return auditLogger.log(data.action, {
    userId: data.userId,
    userEmail: data.userEmail,
    resource: data.resource,
    resourceId: data.resourceId,
    metadata: data.metadata,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: false, // Security events are typically failures
  });
}

/**
 * Log configuration changes
 */
export async function logConfig(data: {
  userId: string;
  userEmail?: string;
  action:
    | AuditAction.SYSTEM_CONFIG_CHANGED
    | AuditAction.AGENT_CONFIG_UPDATED
    | AuditAction.WORKFLOW_CONFIG_UPDATED;
  resource: string;
  resourceId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLogEntry> {
  return auditLogger.log(data.action, {
    userId: data.userId,
    userEmail: data.userEmail,
    resource: data.resource,
    resourceId: data.resourceId,
    metadata: {
      previousValue: data.previousValue,
      newValue: data.newValue,
    },
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: true,
  });
}

/**
 * Extract IP address from request headers
 */
export function extractIPAddress(request: Request): string | undefined {
  // Check various headers for IP address (in order of preference)
  return (
    request.headers.get('cf-connecting-ip') || // Cloudflare
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Extract user agent from request headers
 */
export function extractUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
