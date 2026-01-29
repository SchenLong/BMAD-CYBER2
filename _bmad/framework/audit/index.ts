/**
 * BMAD Audit Logging Framework
 * =============================
 *
 * Exported audit logging system providing comprehensive activity tracking,
 * compliance logging, and security event monitoring for BMAD applications.
 */

// Re-export observability modules from @bmad/validators package
export {
  LogArchiver,
  ConfidenceTracker,
  TelemetryCollector,
  AnomalyDetector,
  // Audit encryption utilities
  encryptEntry,
  decryptEntry,
  processEntryForStorage,
  processLineForReading,
  isEncryptionEnabled,
  getEncryptionStatus,
  generateEncryptionKey,
  isEncryptedEntry,
  AuditEncryptionError,
  AuditDecryptionError,
  // Audit integrity utilities
  HashChainManager,
  getChainManager,
  addChainFields,
  verifySecurityLog,
  getIntegrityStatus,
} from '@bmad/validators';

/**
 * Audit Types and Interfaces
 */
export interface AuditConfig {
  enableEncryption?: boolean;
  enableArchival?: boolean;
  retentionPeriod?: number; // days
  compressionLevel?: 'none' | 'low' | 'high';
  outputPath?: string;
  enableTelemetry?: boolean;
  enableAnomalyDetection?: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  eventType: AuditEventType;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  fingerprint?: string;
}

export type AuditEventType =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'system_access'
  | 'security_violation'
  | 'configuration_change'
  | 'file_access'
  | 'api_call'
  | 'error'
  | 'warning'
  | 'custom';

export interface AuditQuery {
  startTime?: Date;
  endTime?: Date;
  userId?: string;
  eventType?: AuditEventType;
  resource?: string;
  result?: 'success' | 'failure' | 'blocked';
  severity?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<string, number>;
  timeRange: { start: Date; end: Date };
  topUsers: Array<{ userId: string; eventCount: number }>;
  topResources: Array<{ resource: string; accessCount: number }>;
}

export interface ComplianceReport {
  generatedAt: Date;
  period: { start: Date; end: Date };
  totalEvents: number;
  securityViolations: number;
  failedAuthentications: number;
  unauthorizedAccess: number;
  dataModifications: number;
  configurationChanges: number;
  complianceScore: number; // 0-100
  recommendations: string[];
}

/**
 * Enhanced Audit Logger with BMAD-specific features
 */
export class BMADAuditLogger {
  private config: Required<AuditConfig>;
  private auditLogger: any; // Will be the actual AuditLogger instance
  private events: AuditEvent[] = [];

  constructor(config: AuditConfig = {}) {
    this.config = {
      enableEncryption: true,
      enableArchival: true,
      retentionPeriod: 90,
      compressionLevel: 'high',
      outputPath: './audit-logs',
      enableTelemetry: true,
      enableAnomalyDetection: true,
      ...config
    };

    this.initializeAuditLogger();
  }

  private async initializeAuditLogger(): Promise<void> {
    // Initialize the underlying audit logger with configuration
    // this.auditLogger = new AuditLogger(this.config);
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Partial<AuditEvent>): Promise<void> {
    const fullEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'custom',
      resource: 'unknown',
      action: 'unknown',
      result: 'success',
      severity: 'low',
      metadata: {},
      ...event
    };

    this.events.push(fullEvent);

    try {
      // Log to underlying audit system
      // await this.auditLogger.log(fullEvent);

      // Console logging for development
      console.log(`[AUDIT] ${fullEvent.timestamp.toISOString()} - ${fullEvent.eventType} - ${fullEvent.resource}:${fullEvent.action} - ${fullEvent.result}`);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log authentication event
   */
  async logAuthentication(userId: string, success: boolean, metadata: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'authentication',
      resource: 'auth',
      action: 'login',
      result: success ? 'success' : 'failure',
      severity: success ? 'low' : 'medium',
      metadata: {
        success,
        ...metadata
      }
    });
  }

  /**
   * Log authorization event
   */
  async logAuthorization(userId: string, resource: string, action: string, granted: boolean, metadata: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'authorization',
      resource,
      action,
      result: granted ? 'success' : 'blocked',
      severity: granted ? 'low' : 'medium',
      metadata: {
        granted,
        ...metadata
      }
    });
  }

  /**
   * Log security violation
   */
  async logSecurityViolation(resource: string, action: string, details: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      eventType: 'security_violation',
      resource,
      action,
      result: 'blocked',
      severity: 'critical',
      metadata: {
        violation: details,
        ...metadata
      }
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(userId: string, resource: string, action: string, success: boolean, metadata: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'data_access',
      resource,
      action,
      result: success ? 'success' : 'failure',
      severity: 'low',
      metadata: {
        success,
        ...metadata
      }
    });
  }

  /**
   * Log configuration change
   */
  async logConfigurationChange(userId: string, resource: string, changes: Record<string, any>, metadata: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'configuration_change',
      resource,
      action: 'modify',
      result: 'success',
      severity: 'medium',
      metadata: {
        changes,
        ...metadata
      }
    });
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    let filteredEvents = this.events;

    if (query.startTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startTime!);
    }
    if (query.endTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endTime!);
    }
    if (query.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === query.userId);
    }
    if (query.eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === query.eventType);
    }
    if (query.resource) {
      filteredEvents = filteredEvents.filter(e => e.resource === query.resource);
    }
    if (query.result) {
      filteredEvents = filteredEvents.filter(e => e.result === query.result);
    }
    if (query.severity) {
      filteredEvents = filteredEvents.filter(e => query.severity!.includes(e.severity));
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return filteredEvents.slice(offset, offset + limit);
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startTime?: Date, endTime?: Date): Promise<AuditStatistics> {
    const filteredEvents = await this.queryEvents({ startTime, endTime });

    const eventsByType = filteredEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<AuditEventType, number>);

    const eventsBySeverity = filteredEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userEventCounts = filteredEvents.reduce((acc, event) => {
      if (event.userId) {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const resourceAccessCounts = filteredEvents.reduce((acc, event) => {
      acc[event.resource] = (acc[event.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: filteredEvents.length,
      eventsByType,
      eventsBySeverity,
      timeRange: {
        start: startTime || new Date(Math.min(...filteredEvents.map(e => e.timestamp.getTime()))),
        end: endTime || new Date(Math.max(...filteredEvents.map(e => e.timestamp.getTime())))
      },
      topUsers: Object.entries(userEventCounts)
        .map(([userId, count]) => ({ userId, eventCount: count }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 10),
      topResources: Object.entries(resourceAccessCounts)
        .map(([resource, count]) => ({ resource, accessCount: count }))
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 10)
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startTime: Date, endTime: Date): Promise<ComplianceReport> {
    const statistics = await this.getStatistics(startTime, endTime);
    const allEvents = await this.queryEvents({ startTime, endTime });

    const securityViolations = statistics.eventsByType.security_violation || 0;
    const failedAuthentications = allEvents.filter(e =>
      e.eventType === 'authentication' && e.result === 'failure'
    ).length;
    const unauthorizedAccess = allEvents.filter(e =>
      e.eventType === 'authorization' && e.result === 'blocked'
    ).length;
    const dataModifications = statistics.eventsByType.data_modification || 0;
    const configurationChanges = statistics.eventsByType.configuration_change || 0;

    // Calculate compliance score (simplified algorithm)
    const totalRiskEvents = securityViolations * 10 + failedAuthentications * 2 + unauthorizedAccess * 5;
    const complianceScore = Math.max(0, 100 - (totalRiskEvents / statistics.totalEvents) * 100);

    const recommendations: string[] = [];
    if (securityViolations > 0) {
      recommendations.push(`Address ${securityViolations} security violations immediately`);
    }
    if (failedAuthentications > statistics.totalEvents * 0.05) {
      recommendations.push('High failed authentication rate - review authentication policies');
    }
    if (unauthorizedAccess > 0) {
      recommendations.push('Review access control policies for unauthorized access attempts');
    }

    return {
      generatedAt: new Date(),
      period: { start: startTime, end: endTime },
      totalEvents: statistics.totalEvents,
      securityViolations,
      failedAuthentications,
      unauthorizedAccess,
      dataModifications,
      configurationChanges,
      complianceScore: Math.round(complianceScore),
      recommendations
    };
  }

  /**
   * Archive old audit logs
   */
  async archiveLogs(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

    const eventsToArchive = this.events.filter(e => e.timestamp < cutoffDate);
    if (eventsToArchive.length > 0) {
      // Archive logic would go here
      console.log(`Archiving ${eventsToArchive.length} audit events older than ${cutoffDate.toISOString()}`);

      // Remove archived events from memory
      this.events = this.events.filter(e => e.timestamp >= cutoffDate);
    }
  }
}

/**
 * Audit Event Builder for convenient event creation
 */
export class AuditEventBuilder {
  private event: Partial<AuditEvent> = {};

  static create(): AuditEventBuilder {
    return new AuditEventBuilder();
  }

  user(userId: string): AuditEventBuilder {
    this.event.userId = userId;
    return this;
  }

  session(sessionId: string): AuditEventBuilder {
    this.event.sessionId = sessionId;
    return this;
  }

  type(eventType: AuditEventType): AuditEventBuilder {
    this.event.eventType = eventType;
    return this;
  }

  resource(resource: string): AuditEventBuilder {
    this.event.resource = resource;
    return this;
  }

  action(action: string): AuditEventBuilder {
    this.event.action = action;
    return this;
  }

  result(result: 'success' | 'failure' | 'blocked'): AuditEventBuilder {
    this.event.result = result;
    return this;
  }

  severity(severity: 'low' | 'medium' | 'high' | 'critical'): AuditEventBuilder {
    this.event.severity = severity;
    return this;
  }

  metadata(metadata: Record<string, any>): AuditEventBuilder {
    this.event.metadata = { ...this.event.metadata, ...metadata };
    return this;
  }

  ip(ipAddress: string): AuditEventBuilder {
    this.event.ipAddress = ipAddress;
    return this;
  }

  userAgent(userAgent: string): AuditEventBuilder {
    this.event.userAgent = userAgent;
    return this;
  }

  build(): Partial<AuditEvent> {
    return { ...this.event };
  }
}

/**
 * Convenience function to create audit logger with default configuration
 */
export function createAuditLogger(config?: AuditConfig): BMADAuditLogger {
  return new BMADAuditLogger(config);
}

/**
 * Global audit logger instance for convenience
 */
let globalAuditLogger: BMADAuditLogger | null = null;

export function initializeGlobalAuditLogger(config?: AuditConfig): BMADAuditLogger {
  globalAuditLogger = createAuditLogger(config);
  return globalAuditLogger;
}

export function getGlobalAuditLogger(): BMADAuditLogger | null {
  return globalAuditLogger;
}

/**
 * Convenience audit logging functions
 */
export async function auditAuth(userId: string, success: boolean, metadata?: Record<string, any>): Promise<void> {
  const logger = globalAuditLogger || createAuditLogger();
  await logger.logAuthentication(userId, success, metadata);
}

export async function auditAccess(userId: string, resource: string, action: string, granted: boolean, metadata?: Record<string, any>): Promise<void> {
  const logger = globalAuditLogger || createAuditLogger();
  await logger.logAuthorization(userId, resource, action, granted, metadata);
}

export async function auditViolation(resource: string, action: string, details: string, metadata?: Record<string, any>): Promise<void> {
  const logger = globalAuditLogger || createAuditLogger();
  await logger.logSecurityViolation(resource, action, details, metadata);
}