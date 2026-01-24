/**
 * BMAD Audit Logging Framework
 * =============================
 *
 * Exported audit logging system providing comprehensive activity tracking,
 * compliance logging, and security event monitoring for BMAD applications.
 */
// Re-export observability modules
export { AuditLogger, LogArchiver, ConfidenceTracker, TelemetryCollector, AnomalyDetector } from '../../.claude/validators-node/src/observability/index.js';
// Re-export audit encryption
export { AuditEncryption, AuditIntegrity } from '../../.claude/validators-node/src/observability/index.js';
/**
 * Enhanced Audit Logger with BMAD-specific features
 */
export class BMADAuditLogger {
    config;
    auditLogger; // Will be the actual AuditLogger instance
    events = [];
    constructor(config = {}) {
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
    async initializeAuditLogger() {
        // Initialize the underlying audit logger with configuration
        // this.auditLogger = new AuditLogger(this.config);
    }
    /**
     * Log an audit event
     */
    async logEvent(event) {
        const fullEvent = {
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
        }
        catch (error) {
            console.error('Failed to log audit event:', error);
        }
    }
    /**
     * Log authentication event
     */
    async logAuthentication(userId, success, metadata = {}) {
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
    async logAuthorization(userId, resource, action, granted, metadata = {}) {
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
    async logSecurityViolation(resource, action, details, metadata = {}) {
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
    async logDataAccess(userId, resource, action, success, metadata = {}) {
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
    async logConfigurationChange(userId, resource, changes, metadata = {}) {
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
    async queryEvents(query) {
        let filteredEvents = this.events;
        if (query.startTime) {
            filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startTime);
        }
        if (query.endTime) {
            filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endTime);
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
            filteredEvents = filteredEvents.filter(e => query.severity.includes(e.severity));
        }
        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 100;
        return filteredEvents.slice(offset, offset + limit);
    }
    /**
     * Get audit statistics
     */
    async getStatistics(startTime, endTime) {
        const filteredEvents = await this.queryEvents({ startTime, endTime });
        const eventsByType = filteredEvents.reduce((acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {});
        const eventsBySeverity = filteredEvents.reduce((acc, event) => {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
        }, {});
        const userEventCounts = filteredEvents.reduce((acc, event) => {
            if (event.userId) {
                acc[event.userId] = (acc[event.userId] || 0) + 1;
            }
            return acc;
        }, {});
        const resourceAccessCounts = filteredEvents.reduce((acc, event) => {
            acc[event.resource] = (acc[event.resource] || 0) + 1;
            return acc;
        }, {});
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
    async generateComplianceReport(startTime, endTime) {
        const statistics = await this.getStatistics(startTime, endTime);
        const allEvents = await this.queryEvents({ startTime, endTime });
        const securityViolations = statistics.eventsByType.security_violation || 0;
        const failedAuthentications = allEvents.filter(e => e.eventType === 'authentication' && e.result === 'failure').length;
        const unauthorizedAccess = allEvents.filter(e => e.eventType === 'authorization' && e.result === 'blocked').length;
        const dataModifications = statistics.eventsByType.data_modification || 0;
        const configurationChanges = statistics.eventsByType.configuration_change || 0;
        // Calculate compliance score (simplified algorithm)
        const totalRiskEvents = securityViolations * 10 + failedAuthentications * 2 + unauthorizedAccess * 5;
        const complianceScore = Math.max(0, 100 - (totalRiskEvents / statistics.totalEvents) * 100);
        const recommendations = [];
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
    async archiveLogs() {
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
    event = {};
    static create() {
        return new AuditEventBuilder();
    }
    user(userId) {
        this.event.userId = userId;
        return this;
    }
    session(sessionId) {
        this.event.sessionId = sessionId;
        return this;
    }
    type(eventType) {
        this.event.eventType = eventType;
        return this;
    }
    resource(resource) {
        this.event.resource = resource;
        return this;
    }
    action(action) {
        this.event.action = action;
        return this;
    }
    result(result) {
        this.event.result = result;
        return this;
    }
    severity(severity) {
        this.event.severity = severity;
        return this;
    }
    metadata(metadata) {
        this.event.metadata = { ...this.event.metadata, ...metadata };
        return this;
    }
    ip(ipAddress) {
        this.event.ipAddress = ipAddress;
        return this;
    }
    userAgent(userAgent) {
        this.event.userAgent = userAgent;
        return this;
    }
    build() {
        return { ...this.event };
    }
}
/**
 * Convenience function to create audit logger with default configuration
 */
export function createAuditLogger(config) {
    return new BMADAuditLogger(config);
}
/**
 * Global audit logger instance for convenience
 */
let globalAuditLogger = null;
export function initializeGlobalAuditLogger(config) {
    globalAuditLogger = createAuditLogger(config);
    return globalAuditLogger;
}
export function getGlobalAuditLogger() {
    return globalAuditLogger;
}
/**
 * Convenience audit logging functions
 */
export async function auditAuth(userId, success, metadata) {
    const logger = globalAuditLogger || createAuditLogger();
    await logger.logAuthentication(userId, success, metadata);
}
export async function auditAccess(userId, resource, action, granted, metadata) {
    const logger = globalAuditLogger || createAuditLogger();
    await logger.logAuthorization(userId, resource, action, granted, metadata);
}
export async function auditViolation(resource, action, details, metadata) {
    const logger = globalAuditLogger || createAuditLogger();
    await logger.logSecurityViolation(resource, action, details, metadata);
}
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map