/**
 * Audit Alerting Module
 * Real-time alerting for audit trail violations and security events
 *
 * Compliance:
 * - HIPAA 164.312(b): Audit controls for PHI access logging
 * - GDPR Article 30: Processing activity records maintained
 * - SOC 2 CC7.3: Security events analyzed within 24 hours
 * - NIST AU-12: Audit generation enabled at all components
 * - PCI-DSS 10.3: Audit entry completeness verified
 *
 * @module audit-alerting
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALERT_LOG_PATH = process.env.ALERT_LOG_PATH || './logs/security-alerts.log';
const ALERT_STORE_PATH = process.env.ALERT_STORE_PATH || './data/alerts';

/**
 * Alert Types
 */
export const AlertType = {
    TAMPER_DETECTED: 'TAMPER_DETECTED',
    INTEGRITY_VIOLATION: 'INTEGRITY_VIOLATION',
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
    CHAIN_BREAK: 'CHAIN_BREAK',
    MISSING_AUDIT_ENTRY: 'MISSING_AUDIT_ENTRY',
    SEQUENCE_GAP: 'SEQUENCE_GAP',
    TIMESTAMP_ANOMALY: 'TIMESTAMP_ANOMALY',
    HIGH_FAILURE_RATE: 'HIGH_FAILURE_RATE',
    PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
    DATA_EXFILTRATION: 'DATA_EXFILTRATION',
    BRUTE_FORCE: 'BRUTE_FORCE',
    SUSPICIOUS_PATTERN: 'SUSPICIOUS_PATTERN'
};

/**
 * Alert Severity Levels
 */
export const AlertSeverity = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFO: 'INFO'
};

/**
 * Audit Alerter - Real-time alert management
 */
export class AuditAlerter {
    constructor(options = {}) {
        this.handlers = [];
        this.alertLog = [];
        this.maxLogSize = options.maxLogSize || 1000;
        this.alertStorePath = options.alertStorePath || ALERT_STORE_PATH;
        this.alertLogPath = options.alertLogPath || ALERT_LOG_PATH;
        this.suppressDuplicates = options.suppressDuplicates !== false;
        this.duplicateWindow = options.duplicateWindow || 300000; // 5 minutes
        this.recentAlerts = new Map();
    }

    /**
     * Register an alert handler callback
     * @param {Function} handler - Function(alert) to call on alerts
     * @param {Object} options - Handler options (filter by type/severity)
     */
    registerAlertHandler(handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }

        this.handlers.push({
            handler,
            types: options.types || null, // null = all types
            minSeverity: options.minSeverity || AlertSeverity.LOW
        });
    }

    /**
     * Unregister an alert handler
     * @param {Function} handler - Handler to remove
     */
    unregisterAlertHandler(handler) {
        this.handlers = this.handlers.filter(h => h.handler !== handler);
    }

    /**
     * Trigger an alert
     * @param {string} alertType - Type of alert
     * @param {Object} details - Alert details
     * @returns {Object} The triggered alert
     */
    triggerAlert(alertType, details) {
        const severity = this._determineSeverity(alertType, details);

        const alert = {
            alertId: crypto.randomUUID(),
            type: alertType,
            severity,
            timestamp: new Date().toISOString(),
            details,
            acknowledged: false,
            acknowledgedBy: null,
            acknowledgedAt: null
        };

        // Check for duplicate suppression
        if (this.suppressDuplicates && this._isDuplicate(alert)) {
            return null;
        }

        // Store in memory log
        this.alertLog.push(alert);
        if (this.alertLog.length > this.maxLogSize) {
            this.alertLog.shift();
        }

        // Track for duplicate detection
        this._trackAlert(alert);

        // Persist alert
        this._persistAlert(alert);

        // Log to file
        this._logAlert(alert);

        // Dispatch to handlers
        this._dispatchAlert(alert);

        return alert;
    }

    /**
     * Determine alert severity based on type and context
     * @private
     */
    _determineSeverity(alertType, details) {
        const severityMap = {
            [AlertType.TAMPER_DETECTED]: AlertSeverity.CRITICAL,
            [AlertType.INTEGRITY_VIOLATION]: AlertSeverity.CRITICAL,
            [AlertType.CHAIN_BREAK]: AlertSeverity.CRITICAL,
            [AlertType.UNAUTHORIZED_ACCESS]: AlertSeverity.HIGH,
            [AlertType.PRIVILEGE_ESCALATION]: AlertSeverity.HIGH,
            [AlertType.DATA_EXFILTRATION]: AlertSeverity.CRITICAL,
            [AlertType.BRUTE_FORCE]: AlertSeverity.HIGH,
            [AlertType.MISSING_AUDIT_ENTRY]: AlertSeverity.MEDIUM,
            [AlertType.SEQUENCE_GAP]: AlertSeverity.MEDIUM,
            [AlertType.TIMESTAMP_ANOMALY]: AlertSeverity.MEDIUM,
            [AlertType.HIGH_FAILURE_RATE]: AlertSeverity.MEDIUM,
            [AlertType.SUSPICIOUS_PATTERN]: AlertSeverity.LOW
        };

        return details.severity || severityMap[alertType] || AlertSeverity.MEDIUM;
    }

    /**
     * Check if alert is duplicate within suppression window
     * @private
     */
    _isDuplicate(alert) {
        const key = `${alert.type}:${JSON.stringify(alert.details)}`;
        const existing = this.recentAlerts.get(key);

        if (existing) {
            const elapsed = Date.now() - existing.timestamp;
            if (elapsed < this.duplicateWindow) {
                existing.count++;
                return true;
            }
        }

        return false;
    }

    /**
     * Track alert for duplicate detection
     * @private
     */
    _trackAlert(alert) {
        const key = `${alert.type}:${JSON.stringify(alert.details)}`;
        this.recentAlerts.set(key, {
            timestamp: Date.now(),
            count: 1
        });

        // Clean old entries
        const cutoff = Date.now() - this.duplicateWindow;
        for (const [k, v] of this.recentAlerts.entries()) {
            if (v.timestamp < cutoff) {
                this.recentAlerts.delete(k);
            }
        }
    }

    /**
     * Persist alert to storage
     * @private
     */
    _persistAlert(alert) {
        try {
            const dir = this.alertStorePath;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const filePath = path.join(dir, `${alert.alertId}.json`);
            fs.writeFileSync(filePath, JSON.stringify(alert, null, 2));
        } catch (err) {
            console.error(`Failed to persist alert: ${err.message}`);
        }
    }

    /**
     * Log alert to file
     * @private
     */
    _logAlert(alert) {
        try {
            const logDir = path.dirname(this.alertLogPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            // Sanitize CRLF and Unicode line separators to prevent log injection (A03-011)
            const sanitizeLogField = (v) => String(v).replace(/[\r\n\u2028\u2029]+/g, ' ');
            const safeType = sanitizeLogField(alert.type);
            const safeSeverity = sanitizeLogField(alert.severity);
            const safeTimestamp = sanitizeLogField(alert.timestamp);
            const safeDetails = sanitizeLogField(JSON.stringify(alert.details));
            const logLine = `[${safeTimestamp}] [${safeSeverity}] ${safeType}: ${safeDetails}\n`;
            fs.appendFileSync(this.alertLogPath, logLine);
        } catch (err) {
            console.error(`Failed to log alert: ${err.message}`);
        }
    }

    /**
     * Dispatch alert to registered handlers
     * @private
     */
    _dispatchAlert(alert) {
        const severityOrder = [AlertSeverity.INFO, AlertSeverity.LOW, AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL];

        for (const { handler, types, minSeverity } of this.handlers) {
            // Check type filter
            if (types && !types.includes(alert.type)) {
                continue;
            }

            // Check severity filter
            const alertSeverityIndex = severityOrder.indexOf(alert.severity);
            const minSeverityIndex = severityOrder.indexOf(minSeverity);
            if (alertSeverityIndex < minSeverityIndex) {
                continue;
            }

            try {
                handler(alert);
            } catch (err) {
                console.error(`Alert handler error: ${err.message}`);
            }
        }
    }

    /**
     * Acknowledge an alert
     * @param {string} alertId - Alert ID
     * @param {string} userId - User acknowledging
     * @param {string} notes - Acknowledgment notes
     */
    acknowledgeAlert(alertId, userId, notes) {
        const alert = this.alertLog.find(a => a.alertId === alertId);
        if (!alert) {
            throw new Error(`Alert not found: ${alertId}`);
        }

        alert.acknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date().toISOString();
        alert.acknowledgmentNotes = notes;

        // Update persisted alert
        this._persistAlert(alert);

        return alert;
    }

    /**
     * Get unacknowledged alerts
     * @returns {Array} Unacknowledged alerts
     */
    getUnacknowledgedAlerts() {
        return this.alertLog.filter(a => !a.acknowledged);
    }

    /**
     * Get alerts by severity
     * @param {string} severity - Minimum severity
     * @returns {Array} Matching alerts
     */
    getAlertsBySeverity(severity) {
        const severityOrder = [AlertSeverity.INFO, AlertSeverity.LOW, AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL];
        const minIndex = severityOrder.indexOf(severity);

        return this.alertLog.filter(a =>
            severityOrder.indexOf(a.severity) >= minIndex
        );
    }

    /**
     * Get recent alerts
     * @param {number} hours - Hours to look back
     * @returns {Array} Recent alerts
     */
    getRecentAlerts(hours = 24) {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);

        return this.alertLog.filter(a =>
            new Date(a.timestamp) >= cutoff
        );
    }
}

/**
 * Audit Completeness Checker - Verify audit trail integrity
 */
export class AuditCompletenessChecker {
    constructor(options = {}) {
        this.alerter = options.alerter || new AuditAlerter();
    }

    /**
     * Check completeness of audit entries within time range
     * @param {Date} startTime - Start of range
     * @param {Date} endTime - End of range
     * @param {Array} entries - Audit entries to check
     * @returns {Object} Completeness check result
     */
    checkCompleteness(startTime, endTime, entries) {
        const result = {
            complete: true,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            entriesChecked: entries.length,
            gaps: [],
            sequenceErrors: [],
            timestampAnomalies: []
        };

        // Sort entries by timestamp
        const sorted = [...entries].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Check for time gaps
        const maxGapMs = 60000; // 1 minute max gap between entries
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1].timestamp);
            const curr = new Date(sorted[i].timestamp);
            const gap = curr - prev;

            if (gap > maxGapMs) {
                result.complete = false;
                result.gaps.push({
                    afterEntry: sorted[i - 1].id,
                    beforeEntry: sorted[i].id,
                    gapMs: gap,
                    gapMinutes: (gap / 60000).toFixed(2)
                });
            }
        }

        // Check sequence numbers if present
        if (sorted.length > 0 && sorted[0].sequence !== undefined) {
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i].sequence !== sorted[i - 1].sequence + 1) {
                    result.complete = false;
                    result.sequenceErrors.push({
                        expected: sorted[i - 1].sequence + 1,
                        actual: sorted[i].sequence,
                        entryId: sorted[i].id
                    });
                }
            }
        }

        // Check for timestamp anomalies (entries out of order)
        for (let i = 1; i < sorted.length; i++) {
            if (new Date(sorted[i].timestamp) < new Date(sorted[i - 1].timestamp)) {
                result.complete = false;
                result.timestampAnomalies.push({
                    entryId: sorted[i].id,
                    timestamp: sorted[i].timestamp,
                    previousTimestamp: sorted[i - 1].timestamp
                });
            }
        }

        // Trigger alerts for issues found
        if (result.gaps.length > 0) {
            this.alerter.triggerAlert(AlertType.SEQUENCE_GAP, {
                gapCount: result.gaps.length,
                gaps: result.gaps
            });
        }

        if (result.timestampAnomalies.length > 0) {
            this.alerter.triggerAlert(AlertType.TIMESTAMP_ANOMALY, {
                anomalyCount: result.timestampAnomalies.length,
                anomalies: result.timestampAnomalies
            });
        }

        return result;
    }

    /**
     * Verify hash chain integrity of audit entries
     * @param {Array} entries - Audit entries with hash and previousHash fields
     * @returns {Object} Chain verification result
     */
    verifyChainIntegrity(entries) {
        const result = {
            valid: true,
            entriesVerified: 0,
            chainBreaks: [],
            hashMismatches: []
        };

        const sorted = [...entries].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        for (let i = 0; i < sorted.length; i++) {
            const entry = sorted[i];
            result.entriesVerified++;

            // Verify previous hash link (skip first entry)
            if (i > 0) {
                const expectedPreviousHash = sorted[i - 1].hash;
                if (entry.previousHash !== expectedPreviousHash) {
                    result.valid = false;
                    result.chainBreaks.push({
                        entryId: entry.id,
                        entryIndex: i,
                        expectedPreviousHash,
                        actualPreviousHash: entry.previousHash
                    });
                }
            }

            // Verify entry hash (if we can recalculate)
            if (entry._rawContent) {
                const calculated = crypto
                    .createHash('sha256')
                    .update(entry._rawContent + (entry.previousHash || ''))
                    .digest('hex');

                if (calculated !== entry.hash) {
                    result.valid = false;
                    result.hashMismatches.push({
                        entryId: entry.id,
                        expectedHash: calculated,
                        actualHash: entry.hash
                    });
                }
            }
        }

        // Trigger alert if chain is broken
        if (!result.valid) {
            this.alerter.triggerAlert(AlertType.CHAIN_BREAK, {
                chainBreaks: result.chainBreaks.length,
                hashMismatches: result.hashMismatches.length,
                details: result
            });
        }

        return result;
    }

    /**
     * Find missing expected events
     * @param {Array} expectedEvents - Events that should exist
     * @param {Array} actualEvents - Events that do exist
     * @returns {Object} Missing events analysis
     */
    findMissingEvents(expectedEvents, actualEvents) {
        const actualSet = new Set(actualEvents.map(e =>
            `${e.eventType}:${e.resourceId || ''}:${e.userId || ''}`
        ));

        const missing = expectedEvents.filter(e => {
            const key = `${e.eventType}:${e.resourceId || ''}:${e.userId || ''}`;
            return !actualSet.has(key);
        });

        if (missing.length > 0) {
            this.alerter.triggerAlert(AlertType.MISSING_AUDIT_ENTRY, {
                missingCount: missing.length,
                expectedCount: expectedEvents.length,
                missing: missing.slice(0, 10) // Limit details
            });
        }

        return {
            expectedCount: expectedEvents.length,
            actualCount: actualEvents.length,
            missingCount: missing.length,
            missing,
            coveragePercent: ((actualEvents.length / expectedEvents.length) * 100).toFixed(2)
        };
    }

    /**
     * Generate completeness report
     * @param {Array} entries - Audit entries to analyze
     * @returns {Object} Completeness report
     */
    generateCompletenessReport(entries) {
        const now = new Date();
        const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

        const recentEntries = entries.filter(e =>
            new Date(e.timestamp) >= dayAgo
        );

        const completeness = this.checkCompleteness(dayAgo, now, recentEntries);
        const chainIntegrity = this.verifyChainIntegrity(entries);

        // Event type distribution
        const eventTypes = {};
        entries.forEach(e => {
            eventTypes[e.eventType] = (eventTypes[e.eventType] || 0) + 1;
        });

        return {
            reportGeneratedAt: now.toISOString(),
            period: {
                start: dayAgo.toISOString(),
                end: now.toISOString()
            },
            summary: {
                totalEntries: entries.length,
                entriesLast24h: recentEntries.length,
                completenessStatus: completeness.complete ? 'COMPLETE' : 'INCOMPLETE',
                chainStatus: chainIntegrity.valid ? 'VERIFIED' : 'COMPROMISED'
            },
            completeness,
            chainIntegrity,
            eventTypeDistribution: eventTypes,
            compliance: {
                'PCI-DSS-10.3': completeness.complete && chainIntegrity.valid,
                'SOC2-CC7.3': completeness.gaps.length === 0,
                'NIST-AU-12': entries.length > 0,
                'HIPAA-164.312(b)': chainIntegrity.valid
            }
        };
    }
}

/**
 * Create audit alerter instance
 */
export function createAuditAlerter(options) {
    return new AuditAlerter(options);
}

/**
 * Create completeness checker instance
 */
export function createCompletenessChecker(options) {
    return new AuditCompletenessChecker(options);
}

export default {
    AuditAlerter,
    AuditCompletenessChecker,
    AlertType,
    AlertSeverity,
    createAuditAlerter,
    createCompletenessChecker
};
