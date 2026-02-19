/**
 * Audit Logging Utility
 * Story 9.4: Comprehensive Audit Logging
 *
 * Main export point for audit logging functionality.
 * Re-exports from the comprehensive audit-logger module.
 */

// Re-export everything from the comprehensive audit logger
export {
  auditLogger,
  AuditLogger,
  logAuth,
  logAuthz,
  logDataAccess,
  logSecurity,
  logConfig,
  extractIPAddress,
  extractUserAgent,
} from '../security/audit-logger';

// Re-export types and enums
export type {
  AuditLogEntry,
  AuditQueryFilters,
  HashChainVerification,
} from '../security/audit-logger';

export { AuditAction, AuditSeverity } from '../security/audit-logger';
export type { AuditAction as AuditActionType } from '../security/audit-logger';

// Re-export retention management
export {
  retentionManager,
  RetentionManager,
  RETENTION_PERIODS,
} from '../security/retention';

export type {
  RetentionPolicy,
  RetentionStats,
  ComplianceFramework,
} from '../security/retention';

/**
 * Legacy audit action types (for backwards compatibility)
 * @deprecated Use AuditAction from the comprehensive audit logger instead
 */
export enum LegacyAuditAction {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_MFA_ENABLED = 'user_mfa_enabled',
  USER_MFA_DISABLED = 'user_mfa_disabled',
  PROJECT_CREATED = 'project_created',
  PROJECT_DELETED = 'project_deleted',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
}

/**
 * Legacy audit log entry interface (for backwards compatibility)
 * @deprecated Use AuditLogEntry from the comprehensive audit logger instead
 */
export interface LegacyAuditLogEntry {
  action: string | 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed' | 'user_login' | 'user_logout' | 'user_mfa_enabled' | 'user_mfa_disabled' | 'project_created' | 'project_deleted' | 'permission_granted' | 'permission_revoked';
  actorId: string;
  actorEmail: string;
  targetId?: string;
  targetEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event (legacy function for backwards compatibility)
 * @deprecated Use logAuth, logAuthz, logDataAccess, logSecurity, or logConfig instead
 */
export async function createAuditLog(entry: LegacyAuditLogEntry): Promise<void> {
  // Import dynamically to avoid circular dependencies
  const { auditLogger: logger, AuditAction: NewAuditAction } = await import('../security/audit-logger');

  // Map old action strings to new AuditAction enum
  const actionMap: Record<string, any> = {
    'user_created': NewAuditAction.ACCOUNT_CREATED,
    'user_updated': NewAuditAction.ACCOUNT_CREATED, // Closest match
    'user_deleted': NewAuditAction.ACCOUNT_DELETED,
    'user_role_changed': NewAuditAction.ROLE_CHANGED,
    'user_login': NewAuditAction.LOGIN_SUCCESS,
    'user_logout': NewAuditAction.LOGOUT,
    'user_mfa_enabled': NewAuditAction.MFA_ENABLED,
    'user_mfa_disabled': NewAuditAction.MFA_DISABLED,
    'project_created': NewAuditAction.PROJECT_CREATED,
    'project_deleted': NewAuditAction.PROJECT_DELETED,
    'permission_granted': NewAuditAction.PERMISSION_GRANTED,
    'permission_revoked': NewAuditAction.PERMISSION_REVOKED,
  };

  const newAction = actionMap[entry.action as string] || NewAuditAction.LOGIN_SUCCESS;

  await logger.log(newAction, {
    userId: entry.actorId,
    userEmail: entry.actorEmail,
    resourceId: entry.targetId,
    metadata: entry.details,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    success: true,
  });
}

/**
 * Log a user role change (legacy function for backwards compatibility)
 * @deprecated Use logAuthz with action ROLE_CHANGED instead
 */
export async function logRoleChange(
  actorId: string,
  actorEmail: string,
  targetId: string,
  targetEmail: string,
  previousRole: string,
  newRole: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const { logAuthz } = await import('../security/audit-logger');

  await logAuthz({
    userId: actorId,
    userEmail: actorEmail,
    action: 'ROLE_CHANGED' as any,
    resource: 'user',
    resourceId: targetId,
    previousValue: previousRole,
    newValue: newRole,
    ipAddress,
  });
}

/**
 * Log a user update (legacy function for backwards compatibility)
 * @deprecated Use logDataAccess or logConfig instead
 */
export async function logUserUpdate(
  actorId: string,
  actorEmail: string,
  targetId: string,
  targetEmail: string,
  changes: Record<string, { from: unknown; to: unknown }>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const { auditLogger, AuditAction } = await import('../security/audit-logger');

  await auditLogger.log(AuditAction.ACCOUNT_CREATED, {
    userId: actorId,
    userEmail: actorEmail,
    resource: 'user',
    resourceId: targetId,
    metadata: { changes },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * Log a user deletion (legacy function for backwards compatibility)
 * @deprecated Use logAuthz with action ACCOUNT_DELETED instead
 */
export async function logUserDeletion(
  actorId: string,
  actorEmail: string,
  targetId: string,
  targetEmail: string,
  targetRole: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const { auditLogger, AuditAction } = await import('../security/audit-logger');

  await auditLogger.log(AuditAction.ACCOUNT_DELETED, {
    userId: actorId,
    userEmail: actorEmail,
    resource: 'user',
    resourceId: targetId,
    metadata: { deletedRole: targetRole },
    ipAddress,
    userAgent,
    success: true,
  });
}
