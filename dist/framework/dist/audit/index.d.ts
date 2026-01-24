/**
 * Convenience function to create audit logger with default configuration
 */
export function createAuditLogger(config: any): BMADAuditLogger;
export function initializeGlobalAuditLogger(config: any): BMADAuditLogger;
export function getGlobalAuditLogger(): any;
/**
 * Convenience audit logging functions
 */
export function auditAuth(userId: any, success: any, metadata: any): Promise<void>;
export function auditAccess(userId: any, resource: any, action: any, granted: any, metadata: any): Promise<void>;
export function auditViolation(resource: any, action: any, details: any, metadata: any): Promise<void>;
/**
 * Enhanced Audit Logger with BMAD-specific features
 */
export class BMADAuditLogger {
    constructor(config?: {});
    config: {
        enableEncryption: boolean;
        enableArchival: boolean;
        retentionPeriod: number;
        compressionLevel: string;
        outputPath: string;
        enableTelemetry: boolean;
        enableAnomalyDetection: boolean;
    };
    auditLogger: any;
    events: any[];
    initializeAuditLogger(): Promise<void>;
    /**
     * Log an audit event
     */
    logEvent(event: any): Promise<void>;
    /**
     * Log authentication event
     */
    logAuthentication(userId: any, success: any, metadata?: {}): Promise<void>;
    /**
     * Log authorization event
     */
    logAuthorization(userId: any, resource: any, action: any, granted: any, metadata?: {}): Promise<void>;
    /**
     * Log security violation
     */
    logSecurityViolation(resource: any, action: any, details: any, metadata?: {}): Promise<void>;
    /**
     * Log data access
     */
    logDataAccess(userId: any, resource: any, action: any, success: any, metadata?: {}): Promise<void>;
    /**
     * Log configuration change
     */
    logConfigurationChange(userId: any, resource: any, changes: any, metadata?: {}): Promise<void>;
    /**
     * Query audit events
     */
    queryEvents(query: any): Promise<any[]>;
    /**
     * Get audit statistics
     */
    getStatistics(startTime: any, endTime: any): Promise<{
        totalEvents: number;
        eventsByType: any;
        eventsBySeverity: any;
        timeRange: {
            start: any;
            end: any;
        };
        topUsers: {
            userId: string;
            eventCount: any;
        }[];
        topResources: {
            resource: string;
            accessCount: any;
        }[];
    }>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startTime: any, endTime: any): Promise<{
        generatedAt: Date;
        period: {
            start: any;
            end: any;
        };
        totalEvents: number;
        securityViolations: any;
        failedAuthentications: number;
        unauthorizedAccess: number;
        dataModifications: any;
        configurationChanges: any;
        complianceScore: number;
        recommendations: string[];
    }>;
    /**
     * Archive old audit logs
     */
    archiveLogs(): Promise<void>;
}
/**
 * Audit Event Builder for convenient event creation
 */
export class AuditEventBuilder {
    static create(): AuditEventBuilder;
    event: {};
    user(userId: any): this;
    session(sessionId: any): this;
    type(eventType: any): this;
    resource(resource: any): this;
    action(action: any): this;
    result(result: any): this;
    severity(severity: any): this;
    metadata(metadata: any): this;
    ip(ipAddress: any): this;
    userAgent(userAgent: any): this;
    build(): {};
}
//# sourceMappingURL=index.d.ts.map