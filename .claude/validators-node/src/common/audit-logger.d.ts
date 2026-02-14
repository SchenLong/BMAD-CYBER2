/**
 * BMAD Validators - Audit Logger
 * ================================
 * Secure audit logging for all security events.
 *
 * Logs are written to .claude/logs/security.log with timestamps,
 * validator name, action taken, and relevant details.
 */
import type { Action, Severity } from '../types/index.js';
/**
 * Audit Logger class for secure event logging.
 */
export declare class AuditLogger {
    /**
     * Log a security event.
     *
     * @param validator - Name of the validator (e.g., 'bash_safety')
     * @param action - Action taken (e.g., 'BLOCKED', 'ALLOWED', 'OVERRIDE_USED')
     * @param details - Dictionary of relevant details
     * @param severity - Log level (INFO, WARNING, BLOCKED, CRITICAL)
     */
    static log(validator: string, action: Action | string, details: Record<string, unknown>, severity?: Severity): Promise<void>;
    /**
     * Synchronous version of log for simpler validators.
     * Does not include telemetry or anomaly detection.
     * Uses simplified synchronous encryption for consistency.
     */
    static logSync(validator: string, action: Action | string, details: Record<string, unknown>, severity?: Severity): void;
    /**
     * Convenience method for logging blocked operations.
     */
    static logBlocked(validator: string, reason: string, commandOrFile: string, additional?: Record<string, unknown>): void;
    /**
     * Convenience method for logging allowed operations.
     */
    static logAllowed(validator: string, reason?: string, additional?: Record<string, unknown>): void;
    /**
     * Log when an override is used (consumes single-use overrides).
     */
    static logOverrideUsed(validator: string, overrideVar: string, commandOrFile: string): void;
    /**
     * Initialize archival scheduling for automatic log archival.
     * This should be called once during application startup.
     */
    static initializeArchival(): Promise<void>;
    /**
     * Trigger manual archival of logs.
     */
    static triggerArchival(): Promise<void>;
    /**
     * Get archival system status.
     */
    static getArchivalStatus(): Promise<any>;
}
