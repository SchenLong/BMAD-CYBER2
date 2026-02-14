/**
 * BMAD Security Telemetry Collector
 * ==================================
 * Centralized telemetry collection for security validators.
 * Writes JSONL telemetry data for external analysis.
 *
 * Telemetry Types:
 * - Security events (all validator actions)
 * - Rate limit metrics
 * - Permission audit trail
 * - Resource usage snapshots
 * - Supply chain verification results
 * - Confidence analysis (optional)
 * - Anomaly signals
 *
 * Output Location:
 *   docs/TestingLogs/security/AuditLogs/telemetry/
 *
 * Configuration:
 *   BMAD_TELEMETRY_ENABLED=true|false (default: true)
 *   BMAD_TELEMETRY_DIR=<path> (default: docs/TestingLogs/security/AuditLogs/telemetry)
 *   BMAD_TELEMETRY_ROTATE_MB=<size> (default: 50)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
// Configuration
const DEFAULT_TELEMETRY_DIR = path.join(getProjectDir(), 'docs', 'TestingLogs', 'security', 'AuditLogs', 'telemetry');
const TELEMETRY_DIR = process.env['BMAD_TELEMETRY_DIR'] || DEFAULT_TELEMETRY_DIR;
const TELEMETRY_ENABLED = (process.env['BMAD_TELEMETRY_ENABLED'] || 'true').toLowerCase() === 'true';
const ROTATE_SIZE_MB = parseInt(process.env['BMAD_TELEMETRY_ROTATE_MB'] || '50', 10);
const ROTATE_SIZE_BYTES = ROTATE_SIZE_MB * 1024 * 1024;
// Telemetry file names
const SECURITY_EVENTS_FILE = 'security_events.jsonl';
const RATE_LIMIT_FILE = 'rate_limit_metrics.jsonl';
const PERMISSION_AUDIT_FILE = 'permission_audit.jsonl';
const RESOURCE_USAGE_FILE = 'resource_usage.jsonl';
const SUPPLY_CHAIN_FILE = 'supply_chain_verification.jsonl';
const CONFIDENCE_FILE = 'confidence_analysis.jsonl';
const ANOMALY_FILE = 'anomaly_signals.jsonl';
// Lock timeout
const LOCK_TIMEOUT_MS = 5000;
// ============================================================================
// File Locking for Thread Safety
// ============================================================================
/**
 * Acquire a file-based lock for telemetry writes.
 */
function acquireTelemetryLock(filepath, timeout = LOCK_TIMEOUT_MS) {
    const lockFile = `${filepath}.lock`;
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            fs.writeFileSync(lockFile, String(process.pid), { flag: 'wx' });
            return true;
        }
        catch (e) {
            const error = e;
            if (error.code !== 'EEXIST') {
                return false;
            }
            // Check for stale lock (>30s old)
            try {
                const stats = fs.statSync(lockFile);
                if (Date.now() - stats.mtimeMs > 30000) {
                    try {
                        fs.unlinkSync(lockFile);
                    }
                    catch {
                        // Ignore
                    }
                    continue;
                }
            }
            catch {
                // Lock may have been removed
            }
            // Busy wait (small spin)
            const sleepUntil = Date.now() + 10;
            while (Date.now() < sleepUntil) {
                /* spin */
            }
        }
    }
    return false;
}
/**
 * Release telemetry lock.
 */
function releaseTelemetryLock(filepath) {
    try {
        fs.unlinkSync(`${filepath}.lock`);
    }
    catch {
        // Ignore
    }
}
/**
 * Centralized telemetry writer for BMAD security validators.
 *
 * Writes JSONL format for easy parsing and streaming.
 * Supports file rotation and atomic writes.
 */
export class TelemetryCollector {
    telemetryDir;
    enabled;
    constructor(telemetryDir = TELEMETRY_DIR) {
        this.telemetryDir = telemetryDir;
        this.enabled = TELEMETRY_ENABLED;
        this.ensureDir();
    }
    ensureDir() {
        if (this.enabled) {
            fs.mkdirSync(this.telemetryDir, { recursive: true });
        }
    }
    getFilePath(filename) {
        return path.join(this.telemetryDir, filename);
    }
    rotateIfNeeded(filepath) {
        try {
            if (fs.existsSync(filepath) && fs.statSync(filepath).size > ROTATE_SIZE_BYTES) {
                const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
                const parsed = path.parse(filepath);
                const rotated = path.join(parsed.dir, `${parsed.name}.${timestamp}${parsed.ext}`);
                fs.renameSync(filepath, rotated);
            }
        }
        catch {
            // Don't fail telemetry due to rotation issues
        }
    }
    writeEntry(filename, entry) {
        if (!this.enabled) {
            return false;
        }
        const filepath = this.getFilePath(filename);
        this.rotateIfNeeded(filepath);
        // Acquire lock for thread-safe writes
        if (!acquireTelemetryLock(filepath)) {
            // Non-blocking fallback - proceed without lock
            try {
                fs.appendFileSync(filepath, `${JSON.stringify(entry)}\n`);
                return true;
            }
            catch {
                return false;
            }
        }
        try {
            fs.appendFileSync(filepath, `${JSON.stringify(entry)}\n`);
            return true;
        }
        catch {
            // Silent failure - telemetry should not impact validator operation
            return false;
        }
        finally {
            releaseTelemetryLock(filepath);
        }
    }
    baseEntry() {
        return {
            timestamp: new Date().toISOString(),
            session_id: process.env['CLAUDE_SESSION_ID'] || 'unknown',
        };
    }
    // =========================================================================
    // Security Events (Core)
    // =========================================================================
    /**
     * Record a security event from any validator.
     */
    recordSecurityEvent(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            validator: params.validator,
            action: params.action,
            severity: params.severity,
            target: params.target.slice(0, 500), // Truncate long targets
            reason: params.reason,
        });
        if (params.latencyMs !== undefined) {
            entry['latency_ms'] = Math.round(params.latencyMs * 1000) / 1000;
        }
        if (params.metadata) {
            entry['metadata'] = params.metadata;
        }
        return this.writeEntry(SECURITY_EVENTS_FILE, entry);
    }
    // =========================================================================
    // Rate Limit Metrics
    // =========================================================================
    /**
     * Record rate limiter state snapshot.
     */
    recordRateLimitMetrics(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            operation_type: params.operationType,
            requests_count: params.requestsCount,
            limit: params.limit,
            window_seconds: params.windowSeconds,
            window_remaining_s: params.windowRemainingS,
            utilization_pct: params.limit > 0
                ? Math.round((params.requestsCount / params.limit) * 10000) / 100
                : 0,
            backoff_active: params.backoffActive || false,
            backoff_remaining_s: params.backoffRemainingS || 0,
            backoff_multiplier: params.backoffMultiplier || 1,
        });
        return this.writeEntry(RATE_LIMIT_FILE, entry);
    }
    // =========================================================================
    // Permission Audit
    // =========================================================================
    /**
     * Record a plugin permission check.
     */
    recordPermissionCheck(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            plugin_name: params.pluginName,
            capability: params.capability,
            requested_resource: params.requestedResource.slice(0, 500),
            decision: params.decision,
            reason: params.reason,
        });
        if (params.manifestVersion)
            entry['manifest_version'] = params.manifestVersion;
        if (params.rbacRole)
            entry['rbac_role'] = params.rbacRole;
        if (params.matchedPattern)
            entry['matched_pattern'] = params.matchedPattern;
        return this.writeEntry(PERMISSION_AUDIT_FILE, entry);
    }
    // =========================================================================
    // Resource Usage
    // =========================================================================
    /**
     * Record resource usage snapshot.
     */
    recordResourceUsage(params) {
        const entry = this.baseEntry();
        const contextPct = params.contextTokensMax > 0
            ? Math.round((params.contextTokensUsed / params.contextTokensMax) * 10000) / 100
            : 0;
        Object.assign(entry, {
            context_tokens_used: params.contextTokensUsed,
            context_tokens_max: params.contextTokensMax,
            context_pct: contextPct,
            context_status: params.contextStatus,
        });
        if (params.memoryMb !== undefined) {
            entry['memory_mb'] = Math.round(params.memoryMb * 100) / 100;
        }
        if (params.memoryLimitMb !== undefined) {
            entry['memory_limit_mb'] = params.memoryLimitMb;
            if (params.memoryMb !== undefined) {
                entry['memory_pct'] = Math.round((params.memoryMb / params.memoryLimitMb) * 10000) / 100;
            }
        }
        if (params.recursionDepth !== undefined)
            entry['recursion_depth'] = params.recursionDepth;
        if (params.recursionLimit !== undefined)
            entry['recursion_limit'] = params.recursionLimit;
        if (params.symlinkFollows !== undefined)
            entry['symlink_follows'] = params.symlinkFollows;
        if (params.symlinkLimit !== undefined)
            entry['symlink_limit'] = params.symlinkLimit;
        if (params.childProcesses !== undefined)
            entry['child_processes'] = params.childProcesses;
        if (params.childProcessLimit !== undefined)
            entry['child_process_limit'] = params.childProcessLimit;
        return this.writeEntry(RESOURCE_USAGE_FILE, entry);
    }
    // =========================================================================
    // Supply Chain Verification
    // =========================================================================
    /**
     * Record supply chain verification result.
     */
    recordSupplyChainVerification(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            verification_type: params.verificationType,
            file_path: params.filePath,
            verification_result: params.verificationResult,
            verification_mode: params.verificationMode,
            hash_match: params.hashMatch,
        });
        if (params.skillName)
            entry['skill_name'] = params.skillName;
        if (params.expectedHash)
            entry['expected_hash'] = params.expectedHash;
        if (params.actualHash)
            entry['actual_hash'] = params.actualHash;
        if (params.gpgSignatureChecked) {
            entry['gpg_signature_checked'] = params.gpgSignatureChecked;
            if (params.gpgSignatureValid !== undefined)
                entry['gpg_signature_valid'] = params.gpgSignatureValid;
            if (params.gpgKeyId)
                entry['gpg_key_id'] = params.gpgKeyId;
        }
        entry['cached'] = params.cached || false;
        if (params.latencyMs !== undefined) {
            entry['latency_ms'] = Math.round(params.latencyMs * 1000) / 1000;
        }
        return this.writeEntry(SUPPLY_CHAIN_FILE, entry);
    }
    // =========================================================================
    // Confidence Analysis
    // =========================================================================
    /**
     * Record confidence analysis result.
     */
    recordConfidenceAnalysis(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            response_length: params.responseLength,
            uncertainty_markers: params.uncertaintyMarkers,
            confidence_score: Math.round(params.confidenceScore * 1000) / 1000,
            confidence_level: params.confidenceLevel,
        });
        if (params.hedgingPhrases)
            entry['hedging_phrases'] = params.hedgingPhrases.slice(0, 10);
        if (params.codeWarnings)
            entry['code_warnings'] = params.codeWarnings;
        if (params.attributions)
            entry['attributions'] = params.attributions;
        if (params.notes)
            entry['notes'] = params.notes.slice(0, 5);
        return this.writeEntry(CONFIDENCE_FILE, entry);
    }
    // =========================================================================
    // Anomaly Signals
    // =========================================================================
    /**
     * Record detected anomaly signal.
     */
    recordAnomalySignal(params) {
        const entry = this.baseEntry();
        Object.assign(entry, {
            anomaly_type: params.anomalyType,
            metric_name: params.metricName,
            baseline_value: Math.round(params.baselineValue * 1000) / 1000,
            observed_value: Math.round(params.observedValue * 1000) / 1000,
            deviation_std: Math.round(params.deviationStd * 100) / 100,
            anomaly_score: Math.round(params.anomalyScore * 1000) / 1000,
            alert_triggered: params.alertTriggered || false,
        });
        if (params.alertSeverity)
            entry['alert_severity'] = params.alertSeverity;
        if (params.context)
            entry['context'] = params.context;
        return this.writeEntry(ANOMALY_FILE, entry);
    }
}
// Global singleton instance
let telemetryCollector = null;
/**
 * Get or create the global telemetry collector instance.
 */
export function getTelemetryCollector() {
    if (telemetryCollector === null) {
        telemetryCollector = new TelemetryCollector();
    }
    return telemetryCollector;
}
// Convenience functions for direct import
export function recordSecurityEvent(params) {
    return getTelemetryCollector().recordSecurityEvent(params);
}
export function recordRateLimitMetrics(params) {
    return getTelemetryCollector().recordRateLimitMetrics(params);
}
export function recordPermissionCheck(params) {
    return getTelemetryCollector().recordPermissionCheck(params);
}
export function recordResourceUsage(params) {
    return getTelemetryCollector().recordResourceUsage(params);
}
export function recordSupplyChainVerification(params) {
    return getTelemetryCollector().recordSupplyChainVerification(params);
}
export function recordConfidenceAnalysis(params) {
    return getTelemetryCollector().recordConfidenceAnalysis(params);
}
export function recordAnomalySignal(params) {
    return getTelemetryCollector().recordAnomalySignal(params);
}
// ============================================================================
// CLI Interface
// ============================================================================
/** All telemetry file types */
const TELEMETRY_FILES = {
    security: SECURITY_EVENTS_FILE,
    ratelimit: RATE_LIMIT_FILE,
    permission: PERMISSION_AUDIT_FILE,
    resource: RESOURCE_USAGE_FILE,
    supplychain: SUPPLY_CHAIN_FILE,
    confidence: CONFIDENCE_FILE,
    anomaly: ANOMALY_FILE,
};
/**
 * Count lines in a file.
 */
function countLines(filepath) {
    try {
        if (!fs.existsSync(filepath))
            return 0;
        const content = fs.readFileSync(filepath, 'utf8');
        return content.split('\n').filter((line) => line.trim()).length;
    }
    catch {
        return 0;
    }
}
/**
 * Get file size in MB.
 */
function getFileSizeMB(filepath) {
    try {
        if (!fs.existsSync(filepath))
            return 0;
        const stats = fs.statSync(filepath);
        return Math.round((stats.size / 1024 / 1024) * 100) / 100;
    }
    catch {
        return 0;
    }
}
/**
 * Read last N entries from a JSONL file.
 */
function readLastEntries(filepath, count) {
    try {
        if (!fs.existsSync(filepath))
            return [];
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n').filter((line) => line.trim());
        const lastLines = lines.slice(-count);
        return lastLines.map((line) => JSON.parse(line));
    }
    catch {
        return [];
    }
}
/**
 * CLI main function.
 */
export function main() {
    const args = process.argv.slice(2);
    const jsonOutput = args.includes('--json') || args.includes('-j');
    const filteredArgs = args.filter((a) => a !== '--json' && a !== '-j');
    const command = filteredArgs[0] || 'status';
    if (command === 'status') {
        const status = {
            enabled: TELEMETRY_ENABLED,
            directory: TELEMETRY_DIR,
            rotate_size_mb: ROTATE_SIZE_MB,
            files: {},
        };
        for (const [name, filename] of Object.entries(TELEMETRY_FILES)) {
            const filepath = path.join(TELEMETRY_DIR, filename);
            status['files'][name] = {
                filename,
                lines: countLines(filepath),
                size_mb: getFileSizeMB(filepath),
            };
        }
        if (jsonOutput) {
            console.log(JSON.stringify(status, null, 2));
        }
        else {
            console.log('=== Telemetry Status ===');
            console.log(`Enabled: ${status['enabled']}`);
            console.log(`Directory: ${status['directory']}`);
            console.log(`Rotate size: ${status['rotate_size_mb']} MB`);
            console.log('\nFiles:');
            const files = status['files'];
            for (const [name, info] of Object.entries(files)) {
                console.log(`  ${name}: ${info.lines} entries, ${info.size_mb} MB`);
            }
        }
    }
    else if (command === 'test') {
        console.log('Writing test telemetry entries...');
        const collector = getTelemetryCollector();
        // Write test entries to all types
        collector.recordSecurityEvent({
            validator: 'test_validator',
            action: 'TEST',
            severity: 'INFO',
            target: '/test/path',
            reason: 'CLI test entry',
        });
        collector.recordRateLimitMetrics({
            operationType: 'Bash',
            requestsCount: 5,
            limit: 60,
            windowSeconds: 60,
            windowRemainingS: 55,
        });
        collector.recordPermissionCheck({
            pluginName: 'test-plugin',
            capability: 'filesystem',
            requestedResource: '/test/resource',
            decision: 'GRANTED',
            reason: 'CLI test',
        });
        collector.recordResourceUsage({
            contextTokensUsed: 10000,
            contextTokensMax: 200000,
            contextStatus: 'ok',
        });
        collector.recordSupplyChainVerification({
            verificationType: 'file',
            filePath: '/test/file.ts',
            verificationResult: 'VALID',
            verificationMode: 'strict',
            hashMatch: true,
        });
        collector.recordConfidenceAnalysis({
            responseLength: 1000,
            uncertaintyMarkers: { high: 0, medium: 1, low: 2 },
            confidenceScore: 0.85,
            confidenceLevel: 'HIGH',
        });
        collector.recordAnomalySignal({
            anomalyType: 'volume_spike',
            metricName: 'test_metric',
            baselineValue: 10,
            observedValue: 50,
            deviationStd: 4.5,
            anomalyScore: 0.8,
        });
        if (jsonOutput) {
            console.log(JSON.stringify({ status: 'success', entries_written: 7 }));
        }
        else {
            console.log('✓ Wrote 7 test entries to all telemetry types.');
        }
    }
    else if (command === 'export') {
        // Parse --type and -n options
        let telemetryType = 'security';
        let count = 10;
        for (let i = 1; i < filteredArgs.length; i++) {
            const arg = filteredArgs[i];
            if (arg === '--type' && filteredArgs[i + 1]) {
                telemetryType = filteredArgs[i + 1];
                i++;
            }
            else if (arg === '-n' && filteredArgs[i + 1]) {
                count = parseInt(filteredArgs[i + 1], 10);
                i++;
            }
        }
        const filename = TELEMETRY_FILES[telemetryType];
        if (!filename) {
            console.error(`Unknown telemetry type: ${telemetryType}`);
            console.error(`Available types: ${Object.keys(TELEMETRY_FILES).join(', ')}`);
            process.exit(1);
        }
        const filepath = path.join(TELEMETRY_DIR, filename);
        const entries = readLastEntries(filepath, count);
        if (jsonOutput) {
            console.log(JSON.stringify(entries, null, 2));
        }
        else {
            console.log(`=== Last ${entries.length} ${telemetryType} entries ===\n`);
            for (const entry of entries) {
                console.log(JSON.stringify(entry));
            }
        }
    }
    else {
        console.error('Usage: telemetry [status|test|export] [options]');
        console.error('');
        console.error('Commands:');
        console.error('  status                Show telemetry status (default)');
        console.error('  test                  Write test entries to all types');
        console.error('  export                Export recent entries');
        console.error('');
        console.error('Export options:');
        console.error('  --type <type>         Telemetry type (security, ratelimit, permission, resource, supplychain, confidence, anomaly)');
        console.error('  -n <count>            Number of entries to export (default: 10)');
        console.error('');
        console.error('General options:');
        console.error('  --json, -j            Output as JSON');
        process.exit(1);
    }
}
// Run CLI if executed directly
const isMainModule = process.argv[1] &&
    (process.argv[1].endsWith('telemetry.js') || process.argv[1].endsWith('telemetry.ts'));
if (isMainModule) {
    main();
}
//# sourceMappingURL=telemetry.js.map