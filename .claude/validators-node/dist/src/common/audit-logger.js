/**
 * BMAD Validators - Audit Logger
 * ================================
 * Secure audit logging for all security events.
 *
 * Logs are written to .claude/logs/security.log with timestamps,
 * validator name, action taken, and relevant details.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from './path-utils.js';
import { processEntryForStorage } from '../observability/audit-encryption.js';
// Configuration
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB before rotation
// Lazy imports for optional modules
let telemetryModule = null;
let auditIntegrityModule = null;
let anomalyModule = null;
let archivalSchedulerModule = null;
/**
 * Get the log directory path.
 */
function getLogDir() {
    return path.join(getProjectDir(), '.claude', 'logs');
}
/**
 * Get the security log file path.
 */
function getLogFile() {
    return path.join(getLogDir(), 'security.log');
}
/**
 * Ensure the log directory exists.
 */
function ensureLogDir() {
    const logDir = getLogDir();
    fs.mkdirSync(logDir, { recursive: true });
}
/**
 * Rotate log file if it exceeds max size.
 */
function rotateIfNeeded() {
    try {
        const logFile = getLogFile();
        if (fs.existsSync(logFile)) {
            const stats = fs.statSync(logFile);
            if (stats.size > MAX_LOG_SIZE) {
                // Rotate: rename current to .old
                const oldLog = `${logFile}.old`;
                if (fs.existsSync(oldLog)) {
                    fs.unlinkSync(oldLog);
                }
                fs.renameSync(logFile, oldLog);
            }
        }
    }
    catch {
        // Don't fail validation due to log rotation issues
    }
}
/**
 * Try to load optional telemetry module.
 */
async function getTelemetry() {
    if (telemetryModule !== null) {
        return telemetryModule;
    }
    try {
        telemetryModule = await import('../observability/telemetry.js');
        return telemetryModule;
    }
    catch {
        return null;
    }
}
/**
 * Try to load optional audit integrity module.
 */
async function getAuditIntegrity() {
    if (auditIntegrityModule !== null) {
        return auditIntegrityModule;
    }
    try {
        auditIntegrityModule = await import('../observability/audit-integrity.js');
        return auditIntegrityModule;
    }
    catch {
        return null;
    }
}
/**
 * Try to load optional anomaly detector module.
 */
async function getAnomalyDetector() {
    if (anomalyModule !== null) {
        return anomalyModule;
    }
    try {
        anomalyModule = await import('../observability/anomaly-detector.js');
        return anomalyModule;
    }
    catch {
        return null;
    }
}
/**
 * Try to load optional archival scheduler module.
 */
async function getArchivalScheduler() {
    if (archivalSchedulerModule !== null) {
        return archivalSchedulerModule;
    }
    try {
        archivalSchedulerModule = await import('../observability/archival-scheduler.js');
        return archivalSchedulerModule;
    }
    catch {
        return null;
    }
}
/**
 * Audit Logger class for secure event logging.
 */
export class AuditLogger {
    /**
     * Log a security event.
     *
     * @param validator - Name of the validator (e.g., 'bash_safety')
     * @param action - Action taken (e.g., 'BLOCKED', 'ALLOWED', 'OVERRIDE_USED')
     * @param details - Dictionary of relevant details
     * @param severity - Log level (INFO, WARNING, BLOCKED, CRITICAL)
     */
    static async log(validator, action, details, severity = 'INFO') {
        ensureLogDir();
        rotateIfNeeded();
        const timestamp = new Date().toISOString();
        const sessionId = process.env['CLAUDE_SESSION_ID'] || 'unknown';
        let logEntry = {
            timestamp,
            session_id: sessionId,
            validator,
            severity,
            action,
            details,
        };
        // Add cryptographic hash chain fields for tamper detection
        const auditIntegrity = await getAuditIntegrity();
        if (auditIntegrity) {
            logEntry = auditIntegrity.addChainFields(logEntry);
        }
        // Process entry for storage (encrypt if encryption is enabled)
        let processedEntry;
        try {
            processedEntry = await processEntryForStorage(logEntry);
        }
        catch (encryptionError) {
            // Log encryption failure but continue with plaintext
            console.warn(`Audit encryption failed, using plaintext: ${encryptionError instanceof Error ? encryptionError.message : String(encryptionError)}`);
            processedEntry = logEntry;
        }
        try {
            const logFile = getLogFile();
            fs.appendFileSync(logFile, `${JSON.stringify(processedEntry)}\n`);
        }
        catch (e) {
            // Log to stderr if file logging fails
            console.error(`AUDIT LOG (file write failed): ${JSON.stringify(processedEntry)}`);
        }
        // Also emit telemetry for external analysis
        const telemetry = await getTelemetry();
        if (telemetry) {
            const target = (details['target'] || details['command'] || details['file'] || '');
            const reason = (details['reason'] || '');
            const metadata = {};
            for (const [k, v] of Object.entries(details)) {
                if (!['target', 'reason', 'command', 'file'].includes(k)) {
                    metadata[k] = v;
                }
            }
            telemetry.recordSecurityEvent({
                validator,
                action,
                severity,
                target: String(target),
                reason: String(reason),
                metadata,
            });
        }
        // Record for anomaly detection
        const anomalyDetector = await getAnomalyDetector();
        if (anomalyDetector) {
            const operationType = details['tool_name'] || validator.replace('_guard', '').replace('_safety', '');
            anomalyDetector.recordSecurityEventForAnomaly(operationType, validator, action, severity);
        }
    }
    /**
     * Synchronous version of log for simpler validators.
     * Does not include telemetry or anomaly detection.
     * Uses simplified synchronous encryption for consistency.
     */
    static logSync(validator, action, details, severity = 'INFO') {
        ensureLogDir();
        rotateIfNeeded();
        const timestamp = new Date().toISOString();
        const sessionId = process.env['CLAUDE_SESSION_ID'] || 'unknown';
        const logEntry = {
            timestamp,
            session_id: sessionId,
            validator,
            severity,
            action,
            details,
        };
        // Process entry for storage (encrypt if encryption is enabled)
        // Use sync version of encryption for performance in sync context
        let processedEntry = logEntry;
        try {
            // Import encryption module synchronously if available
            const encryptionModule = require('../observability/audit-encryption.js');
            if (encryptionModule.isEncryptionEnabled()) {
                // Use sync encryption for logSync to maintain performance
                processedEntry = encryptionModule.encryptEntrySync ?
                    encryptionModule.encryptEntrySync(logEntry) :
                    logEntry; // Fallback to plaintext if sync encryption not available
            }
        }
        catch (encryptionError) {
            // Log encryption failure but continue with plaintext
            console.warn(`Audit encryption failed in logSync, using plaintext: ${encryptionError instanceof Error ? encryptionError.message : String(encryptionError)}`);
        }
        try {
            const logFile = getLogFile();
            fs.appendFileSync(logFile, `${JSON.stringify(processedEntry)}\n`);
        }
        catch {
            // Log to stderr if file logging fails
            console.error(`AUDIT LOG (file write failed): ${JSON.stringify(processedEntry)}`);
        }
    }
    /**
     * Convenience method for logging blocked operations.
     */
    static logBlocked(validator, reason, commandOrFile, additional) {
        const details = {
            reason,
            target: commandOrFile.slice(0, 500), // Truncate very long commands
        };
        if (additional) {
            Object.assign(details, additional);
        }
        this.logSync(validator, 'BLOCKED', details, 'BLOCKED');
    }
    /**
     * Convenience method for logging allowed operations.
     */
    static logAllowed(validator, reason = 'Passed all checks', additional) {
        const details = { reason };
        if (additional) {
            Object.assign(details, additional);
        }
        this.logSync(validator, 'ALLOWED', details, 'INFO');
    }
    /**
     * Log when an override is used (consumes single-use overrides).
     */
    static logOverrideUsed(validator, overrideVar, commandOrFile) {
        const details = {
            override_variable: overrideVar,
            target: commandOrFile.slice(0, 500),
        };
        this.logSync(validator, 'OVERRIDE_USED', details, 'WARNING');
    }
    /**
     * Initialize archival scheduling for automatic log archival.
     * This should be called once during application startup.
     */
    static async initializeArchival() {
        const scheduler = await getArchivalScheduler();
        if (scheduler) {
            try {
                await scheduler.initializeArchivalScheduling();
                await this.log('audit_logger', 'ARCHIVAL_INITIALIZED', { timestamp: new Date().toISOString() }, 'INFO');
            }
            catch (error) {
                await this.log('audit_logger', 'ARCHIVAL_INIT_FAILED', { error: error instanceof Error ? error.message : String(error) }, 'WARNING');
            }
        }
    }
    /**
     * Trigger manual archival of logs.
     */
    static async triggerArchival() {
        const scheduler = await getArchivalScheduler();
        if (scheduler) {
            try {
                const result = await scheduler.triggerArchival();
                await this.log('audit_logger', 'MANUAL_ARCHIVAL_TRIGGERED', {
                    success: result.success,
                    archiveId: result.archiveId,
                    filesArchived: result.filesArchived,
                    bytesArchived: result.bytesArchived,
                    duration: `${result.duration}ms`,
                }, result.success ? 'INFO' : 'BLOCKED');
            }
            catch (error) {
                await this.log('audit_logger', 'MANUAL_ARCHIVAL_FAILED', { error: error instanceof Error ? error.message : String(error) }, 'BLOCKED');
                throw error;
            }
        }
    }
    /**
     * Get archival system status.
     */
    static async getArchivalStatus() {
        const scheduler = await getArchivalScheduler();
        if (scheduler) {
            return await scheduler.getArchivalStatus();
        }
        return { error: 'Archival scheduler not available' };
    }
}
//# sourceMappingURL=audit-logger.js.map