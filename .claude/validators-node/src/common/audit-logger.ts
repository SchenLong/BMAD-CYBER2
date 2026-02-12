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
import type { Action, AuditLogEntry, Severity } from '../types/index.js';
import { getProjectDir } from './path-utils.js';
import { processEntryForStorage } from '../observability/audit-encryption.js';

// Configuration
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB before rotation

// Lazy imports for optional modules
let telemetryModule: typeof import('../observability/telemetry.js') | null = null;
let auditIntegrityModule: typeof import('../observability/audit-integrity.js') | null = null;
let anomalyModule: typeof import('../observability/anomaly-detector.js') | null = null;
let archivalSchedulerModule: typeof import('../observability/archival-scheduler.js') | null = null;

/**
 * Get the log directory path.
 */
function getLogDir(): string {
  return path.join(getProjectDir(), '.claude', 'logs');
}

/**
 * Get the security log file path.
 */
function getLogFile(): string {
  return path.join(getLogDir(), 'security.log');
}

/**
 * Ensure the log directory exists.
 */
function ensureLogDir(): void {
  const logDir = getLogDir();
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Rotate log file if it exceeds max size.
 */
function rotateIfNeeded(): void {
  try {
    const logFile = getLogFile();
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        // Rotate: rename current to .old
        const oldLog = `${logFile  }.old`;
        if (fs.existsSync(oldLog)) {
          fs.unlinkSync(oldLog);
        }
        fs.renameSync(logFile, oldLog);
      }
    }
  } catch {
    // Don't fail validation due to log rotation issues
  }
}

/**
 * Try to load optional telemetry module.
 */
async function getTelemetry(): Promise<typeof import('../observability/telemetry.js') | null> {
  if (telemetryModule !== null) {
    return telemetryModule;
  }

  try {
    telemetryModule = await import('../observability/telemetry.js');
    return telemetryModule;
  } catch {
    return null;
  }
}

/**
 * Try to load optional audit integrity module.
 */
async function getAuditIntegrity(): Promise<typeof import('../observability/audit-integrity.js') | null> {
  if (auditIntegrityModule !== null) {
    return auditIntegrityModule;
  }

  try {
    auditIntegrityModule = await import('../observability/audit-integrity.js');
    return auditIntegrityModule;
  } catch {
    return null;
  }
}

/**
 * Try to load optional anomaly detector module.
 */
async function getAnomalyDetector(): Promise<typeof import('../observability/anomaly-detector.js') | null> {
  if (anomalyModule !== null) {
    return anomalyModule;
  }

  try {
    anomalyModule = await import('../observability/anomaly-detector.js');
    return anomalyModule;
  } catch {
    return null;
  }
}

/**
 * Try to load optional archival scheduler module.
 */
async function getArchivalScheduler(): Promise<typeof import('../observability/archival-scheduler.js') | null> {
  if (archivalSchedulerModule !== null) {
    return archivalSchedulerModule;
  }

  try {
    archivalSchedulerModule = await import('../observability/archival-scheduler.js');
    return archivalSchedulerModule;
  } catch {
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
  static async log(
    validator: string,
    action: Action | string,
    details: Record<string, unknown>,
    severity: Severity = 'INFO'
  ): Promise<void> {
    ensureLogDir();
    rotateIfNeeded();

    const timestamp = new Date().toISOString();
    const sessionId = process.env['CLAUDE_SESSION_ID'] || 'unknown';

    let logEntry: AuditLogEntry = {
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
    } catch (encryptionError) {
      // Log encryption failure but continue with plaintext
      console.warn(`Audit encryption failed, using plaintext: ${encryptionError instanceof Error ? encryptionError.message : String(encryptionError)}`);
      processedEntry = logEntry;
    }

    try {
      const logFile = getLogFile();
      fs.appendFileSync(logFile, `${JSON.stringify(processedEntry)  }\n`);
    } catch (e) {
      // Log to stderr if file logging fails
      console.error(`AUDIT LOG (file write failed): ${JSON.stringify(processedEntry)}`);
    }

    // Also emit telemetry for external analysis
    const telemetry = await getTelemetry();
    if (telemetry) {
      const target = (details['target'] || details['command'] || details['file'] || '') as string;
      const reason = (details['reason'] || '') as string;
      const metadata: Record<string, unknown> = {};
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
      const operationType = (details['tool_name'] as string) || validator.replace('_guard', '').replace('_safety', '');
      anomalyDetector.recordSecurityEventForAnomaly(operationType, validator, action, severity);
    }
  }

  /**
   * Synchronous version of log for simpler validators.
   * Does not include telemetry or anomaly detection.
   * Uses simplified synchronous encryption for consistency.
   */
  static logSync(
    validator: string,
    action: Action | string,
    details: Record<string, unknown>,
    severity: Severity = 'INFO'
  ): void {
    ensureLogDir();
    rotateIfNeeded();

    const timestamp = new Date().toISOString();
    const sessionId = process.env['CLAUDE_SESSION_ID'] || 'unknown';

    const logEntry: AuditLogEntry = {
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
    } catch (encryptionError) {
      // Log encryption failure but continue with plaintext
      console.warn(`Audit encryption failed in logSync, using plaintext: ${encryptionError instanceof Error ? encryptionError.message : String(encryptionError)}`);
    }

    try {
      const logFile = getLogFile();
      fs.appendFileSync(logFile, `${JSON.stringify(processedEntry)  }\n`);
    } catch {
      // Log to stderr if file logging fails
      console.error(`AUDIT LOG (file write failed): ${JSON.stringify(processedEntry)}`);
    }
  }

  /**
   * Convenience method for logging blocked operations.
   */
  static logBlocked(
    validator: string,
    reason: string,
    commandOrFile: string,
    additional?: Record<string, unknown>
  ): void {
    const details: Record<string, unknown> = {
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
  static logAllowed(
    validator: string,
    reason: string = 'Passed all checks',
    additional?: Record<string, unknown>
  ): void {
    const details: Record<string, unknown> = { reason };
    if (additional) {
      Object.assign(details, additional);
    }
    this.logSync(validator, 'ALLOWED', details, 'INFO');
  }

  /**
   * Log when an override is used (consumes single-use overrides).
   */
  static logOverrideUsed(
    validator: string,
    overrideVar: string,
    commandOrFile: string
  ): void {
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
  static async initializeArchival(): Promise<void> {
    const scheduler = await getArchivalScheduler();
    if (scheduler) {
      try {
        await scheduler.initializeArchivalScheduling();
        await this.log(
          'audit_logger',
          'ARCHIVAL_INITIALIZED',
          { timestamp: new Date().toISOString() },
          'INFO'
        );
      } catch (error) {
        await this.log(
          'audit_logger',
          'ARCHIVAL_INIT_FAILED',
          { error: error instanceof Error ? error.message : String(error) },
          'WARNING'
        );
      }
    }
  }

  /**
   * Trigger manual archival of logs.
   */
  static async triggerArchival(): Promise<void> {
    const scheduler = await getArchivalScheduler();
    if (scheduler) {
      try {
        const result = await scheduler.triggerArchival();
        await this.log(
          'audit_logger',
          'MANUAL_ARCHIVAL_TRIGGERED',
          {
            success: result.success,
            archiveId: result.archiveId,
            filesArchived: result.filesArchived,
            bytesArchived: result.bytesArchived,
            duration: `${result.duration}ms`,
          },
          result.success ? 'INFO' : 'BLOCKED'
        );
      } catch (error) {
        await this.log(
          'audit_logger',
          'MANUAL_ARCHIVAL_FAILED',
          { error: error instanceof Error ? error.message : String(error) },
          'BLOCKED'
        );
        throw error;
      }
    }
  }

  /**
   * Get archival system status.
   */
  static async getArchivalStatus(): Promise<any> {
    const scheduler = await getArchivalScheduler();
    if (scheduler) {
      return await scheduler.getArchivalStatus();
    }
    return { error: 'Archival scheduler not available' };
  }
}
