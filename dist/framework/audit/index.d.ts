/**
 * BMAD Audit Logging Framework
 * =============================
 *
 * Exported audit logging system providing comprehensive activity tracking,
 * compliance logging, and security event monitoring for BMAD applications.
 */
export { AuditLogger, LogArchiver, ConfidenceTracker, TelemetryCollector, AnomalyDetector } from '../../.claude/validators-node/src/observability/index.js';
export { AuditEncryption, AuditIntegrity } from '../../.claude/validators-node/src/observability/index.js';
/**
 * Audit Types and Interfaces
 */
export interface AuditConfig {
    enableEncryption?: boolean;
    enableArchival?: boolean;
    retentionPeriod?: number;
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
export type AuditEventType = 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_access' | 'security_violation' | 'configuration_change' | 'file_access' | 'api_call' | 'error' | 'warning' | 'custom';
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
    timeRange: {
        start: Date;
        end: Date;
    };
    topUsers: Array<{
        userId: string;
        eventCount: number;
    }>;
    topResources: Array<{
        resource: string;
        accessCount: number;
    }>;
}
export interface ComplianceReport {
    generatedAt: Date;
    period: {
        start: Date;
        end: Date;
    };
    totalEvents: number;
    securityViolations: number;
    failedAuthentications: number;
    unauthorizedAccess: number;
    dataModifications: number;
    configurationChanges: number;
    complianceScore: number;
    recommendations: string[];
}
/**
 * Enhanced Audit Logger with BMAD-specific features
 */
export declare class BMADAuditLogger {
    private config;
    private auditLogger;
    private events;
    constructor(config?: AuditConfig);
    private initializeAuditLogger;
    /**
     * Log an audit event
     */
    logEvent(event: Partial<AuditEvent>): Promise<void>;
    /**
     * Log authentication event
     */
    logAuthentication(userId: string, success: boolean, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log authorization event
     */
    logAuthorization(userId: string, resource: string, action: string, granted: boolean, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log security violation
     */
    logSecurityViolation(resource: string, action: string, details: string, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log data access
     */
    logDataAccess(userId: string, resource: string, action: string, success: boolean, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log configuration change
     */
    logConfigurationChange(userId: string, resource: string, changes: Record<string, any>, metadata?: Record<string, any>): Promise<void>;
    /**
     * Query audit events
     */
    queryEvents(query: AuditQuery): Promise<AuditEvent[]>;
    /**
     * Get audit statistics
     */
    getStatistics(startTime?: Date, endTime?: Date): Promise<AuditStatistics>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startTime: Date, endTime: Date): Promise<ComplianceReport>;
    /**
     * Archive old audit logs
     */
    archiveLogs(): Promise<void>;
}
/**
 * Audit Event Builder for convenient event creation
 */
export declare class AuditEventBuilder {
    private event;
    static create(): AuditEventBuilder;
    user(userId: string): AuditEventBuilder;
    session(sessionId: string): AuditEventBuilder;
    type(eventType: AuditEventType): AuditEventBuilder;
    resource(resource: string): AuditEventBuilder;
    action(action: string): AuditEventBuilder;
    result(result: 'success' | 'failure' | 'blocked'): AuditEventBuilder;
    severity(severity: 'low' | 'medium' | 'high' | 'critical'): AuditEventBuilder;
    metadata(metadata: Record<string, any>): AuditEventBuilder;
    ip(ipAddress: string): AuditEventBuilder;
    userAgent(userAgent: string): AuditEventBuilder;
    build(): Partial<AuditEvent>;
}
/**
 * Convenience function to create audit logger with default configuration
 */
export declare function createAuditLogger(config?: AuditConfig): BMADAuditLogger;
export declare function initializeGlobalAuditLogger(config?: AuditConfig): BMADAuditLogger;
export declare function getGlobalAuditLogger(): BMADAuditLogger | null;
/**
 * Convenience audit logging functions
 */
export declare function auditAuth(userId: string, success: boolean, metadata?: Record<string, any>): Promise<void>;
export declare function auditAccess(userId: string, resource: string, action: string, granted: boolean, metadata?: Record<string, any>): Promise<void>;
export declare function auditViolation(resource: string, action: string, details: string, metadata?: Record<string, any>): Promise<void>;
//# sourceMappingURL=index.d.ts.map