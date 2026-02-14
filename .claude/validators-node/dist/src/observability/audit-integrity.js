/**
 * BMAD Guardrails: Cryptographic Audit Log Integrity
 * ===================================================
 * Implements hash chain verification for tamper detection in audit logs.
 *
 * Hash Chain Design:
 *   Entry 1: hash1 = SHA256(timestamp + event + "genesis")
 *   Entry 2: hash2 = SHA256(timestamp + event + hash1)
 *   Entry 3: hash3 = SHA256(timestamp + event + hash2)
 *   ...
 *   Verification: Recompute chain, compare hashes
 *
 * Features:
 * - Hash chain for sequential log entries
 * - Tamper detection on log read
 * - Integrity verification command
 * - Alert on detected tampering
 *
 * Configuration:
 *   BMAD_AUDIT_SIGNING=true|false (default: true)
 *   BMAD_AUDIT_ALERT_TAMPERING=true|false (default: true)
 *
 * Security Note:
 *   This module provides tamper-evidence, not tamper-prevention.
 *   An attacker with file access could regenerate the hash chain.
 *   For stronger guarantees, use external log aggregation with
 *   remote attestation or blockchain anchoring.
 */
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
// Configuration
const LOG_DIR = path.join(getProjectDir(), '.claude', 'logs');
const CHAIN_STATE_FILE = path.join(LOG_DIR, '.chain_state.json');
const CHAIN_LOCK_FILE = path.join(LOG_DIR, '.chain.lock');
const SIGNING_ENABLED = (process.env['BMAD_AUDIT_SIGNING'] || 'true').toLowerCase() === 'true';
const ALERT_ON_TAMPERING = (process.env['BMAD_AUDIT_ALERT_TAMPERING'] || 'true').toLowerCase() === 'true';
const LOCK_TIMEOUT_MS = 5000;
const LOCK_RETRY_MS = 10;
// Genesis block identifier
const GENESIS_HASH = 'genesis';
/**
 * Acquire a simple lock using file creation.
 */
function acquireLock(timeout = LOCK_TIMEOUT_MS) {
    fs.mkdirSync(path.dirname(CHAIN_LOCK_FILE), { recursive: true });
    const startTime = Date.now();
    while (true) {
        try {
            fs.writeFileSync(CHAIN_LOCK_FILE, String(process.pid), { flag: 'wx' });
            return true;
        }
        catch (err) {
            const error = err;
            if (error.code === 'EEXIST') {
                // Check for stale lock
                try {
                    const stats = fs.statSync(CHAIN_LOCK_FILE);
                    if (Date.now() - stats.mtimeMs > 30000) {
                        fs.unlinkSync(CHAIN_LOCK_FILE);
                        continue;
                    }
                }
                catch {
                    // Lock may have been removed
                }
                if (Date.now() - startTime > timeout) {
                    return false;
                }
                // Busy wait (small spin) - avoid SharedArrayBuffer/Atomics which is problematic
                const sleepUntil = Date.now() + LOCK_RETRY_MS;
                while (Date.now() < sleepUntil) {
                    /* spin */
                }
                continue;
            }
            throw err;
        }
    }
}
/**
 * Release the lock.
 */
function releaseLock() {
    try {
        fs.unlinkSync(CHAIN_LOCK_FILE);
    }
    catch {
        // Ignore unlink errors
    }
}
/**
 * Compute SHA256 hash of data.
 */
function computeHash(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}
/**
 * Compute hash of log entry content (excluding chain fields).
 */
function computeContentHash(entry) {
    // Remove chain-specific fields for content hash
    const content = {};
    for (const [k, v] of Object.entries(entry)) {
        if (!['_chain_index', '_previous_hash', '_entry_hash'].includes(k)) {
            content[k] = v;
        }
    }
    // Serialize deterministically
    const contentStr = JSON.stringify(content, Object.keys(content).sort());
    return computeHash(contentStr);
}
/**
 * Compute the chain hash for an entry.
 */
function computeEntryHash(timestamp, contentHash, previousHash) {
    const data = `${timestamp}:${contentHash}:${previousHash}`;
    return computeHash(data);
}
/**
 * Load chain state from file.
 */
function loadChainState(logFile) {
    try {
        if (fs.existsSync(CHAIN_STATE_FILE)) {
            const content = fs.readFileSync(CHAIN_STATE_FILE, 'utf8');
            return JSON.parse(content);
        }
    }
    catch {
        // Return default state on error
    }
    return {
        last_hash: GENESIS_HASH,
        entry_count: 0,
        last_timestamp: null,
        log_file: logFile,
    };
}
/**
 * Save chain state atomically.
 */
function saveChainState(state) {
    state.updated_at = new Date().toISOString();
    fs.mkdirSync(path.dirname(CHAIN_STATE_FILE), { recursive: true });
    // Atomic write via temp file
    const tempFile = `${CHAIN_STATE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
    fs.renameSync(tempFile, CHAIN_STATE_FILE);
}
/**
 * Handle detected tampering by generating alert.
 */
function handleTamperingAlert(logFile, entryIndex, alertType) {
    if (!ALERT_ON_TAMPERING) {
        return;
    }
    const separator = '='.repeat(60);
    const alertMsg = `
${separator}
SECURITY ALERT: AUDIT LOG TAMPERING DETECTED
${separator}
Log file: ${logFile}
Entry index: ${entryIndex}
Alert type: ${alertType}
Time: ${new Date().toISOString()}
${separator}
`;
    console.error(alertMsg);
    // Also write to separate alert log
    const alertLog = path.join(LOG_DIR, 'tampering_alerts.log');
    try {
        fs.appendFileSync(alertLog, `${JSON.stringify({
            timestamp: new Date().toISOString(),
            log_file: logFile,
            entry_index: entryIndex,
            alert_type: alertType,
        })}\n`);
    }
    catch {
        // Non-critical
    }
}
/**
 * Hash Chain Manager class.
 *
 * Manages cryptographic hash chain for audit log integrity.
 * The hash chain provides tamper-evidence by linking each log entry
 * to its predecessor through cryptographic hashes.
 */
export class HashChainManager {
    logFile;
    constructor(logFile) {
        this.logFile = logFile;
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
    }
    /**
     * Add a new entry to the hash chain.
     *
     * @param logEntry - The log entry to add (will be modified)
     * @returns The log entry with chain fields added
     */
    addEntry(logEntry) {
        if (!SIGNING_ENABLED) {
            return logEntry;
        }
        if (!acquireLock()) {
            // If we can't get the lock, log without chain (degraded mode)
            return { ...logEntry, _chain_error: 'lock_timeout' };
        }
        try {
            const state = loadChainState(this.logFile);
            // Compute hashes
            const timestamp = logEntry['timestamp'] || new Date().toISOString();
            const contentHash = computeContentHash(logEntry);
            const previousHash = state.last_hash;
            const entryHash = computeEntryHash(timestamp, contentHash, previousHash);
            // Add chain fields to entry
            const result = {
                ...logEntry,
                _chain_index: state.entry_count,
                _previous_hash: previousHash,
                _entry_hash: entryHash,
            };
            // Update state
            state.last_hash = entryHash;
            state.entry_count += 1;
            state.last_timestamp = timestamp;
            saveChainState(state);
            return result;
        }
        finally {
            releaseLock();
        }
    }
    /**
     * Verify the integrity of the hash chain.
     *
     * @param maxEntries - Maximum entries to verify (undefined = all)
     * @returns VerificationResult with validation status
     */
    verifyChain(maxEntries) {
        if (!fs.existsSync(this.logFile)) {
            return {
                valid: true,
                entriesChecked: 0,
                firstInvalidIndex: null,
                errorMessage: null,
                tamperingDetected: false,
            };
        }
        let entriesChecked = 0;
        let expectedPrevious = GENESIS_HASH;
        try {
            const content = fs.readFileSync(this.logFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                if (maxEntries !== undefined && entriesChecked >= maxEntries) {
                    break;
                }
                const line = lines[lineNum];
                let entry;
                try {
                    entry = JSON.parse(line);
                }
                catch {
                    return {
                        valid: false,
                        entriesChecked,
                        firstInvalidIndex: lineNum,
                        errorMessage: `Invalid JSON at line ${lineNum + 1}`,
                        tamperingDetected: true,
                    };
                }
                // Skip entries without chain data (pre-chain or degraded mode)
                if (!('_entry_hash' in entry)) {
                    continue;
                }
                // Verify chain linkage
                if (entry['_previous_hash'] !== expectedPrevious) {
                    handleTamperingAlert(this.logFile, lineNum, 'previous_hash_mismatch');
                    return {
                        valid: false,
                        entriesChecked,
                        firstInvalidIndex: lineNum,
                        errorMessage: `Chain broken at entry ${lineNum}: previous hash mismatch`,
                        tamperingDetected: true,
                    };
                }
                // Verify content hash
                const contentHash = computeContentHash(entry);
                const timestamp = entry['timestamp'] || '';
                const computedHash = computeEntryHash(timestamp, contentHash, (entry['_previous_hash']) || '');
                if (computedHash !== entry['_entry_hash']) {
                    handleTamperingAlert(this.logFile, lineNum, 'content_modified');
                    return {
                        valid: false,
                        entriesChecked,
                        firstInvalidIndex: lineNum,
                        errorMessage: `Entry ${lineNum} content hash mismatch - content modified`,
                        tamperingDetected: true,
                    };
                }
                expectedPrevious = entry['_entry_hash'];
                entriesChecked++;
            }
            return {
                valid: true,
                entriesChecked,
                firstInvalidIndex: null,
                errorMessage: null,
                tamperingDetected: false,
            };
        }
        catch (e) {
            return {
                valid: false,
                entriesChecked,
                firstInvalidIndex: null,
                errorMessage: `Verification error: ${e}`,
                tamperingDetected: false,
            };
        }
    }
    /**
     * Get current chain status and statistics.
     */
    getChainStatus() {
        const state = loadChainState(this.logFile);
        const verification = this.verifyChain(100); // Quick check
        return {
            log_file: this.logFile,
            entry_count: state.entry_count,
            last_timestamp: state.last_timestamp,
            last_hash: `${state.last_hash.slice(0, 16)}...`,
            signing_enabled: SIGNING_ENABLED,
            chain_valid: verification.valid,
            entries_verified: verification.entriesChecked,
            tampering_detected: verification.tamperingDetected,
        };
    }
}
// Global instance for the main security log
let chainManager = null;
/**
 * Get or create the hash chain manager for the security log.
 */
export function getChainManager(logFile) {
    if (logFile) {
        return new HashChainManager(logFile);
    }
    if (chainManager === null) {
        const defaultLog = path.join(LOG_DIR, 'security.log');
        chainManager = new HashChainManager(defaultLog);
    }
    return chainManager;
}
/**
 * Add hash chain fields to a log entry.
 */
export function addChainFields(logEntry) {
    return getChainManager().addEntry(logEntry);
}
/**
 * Verify the integrity of the security log.
 */
export function verifySecurityLog(maxEntries) {
    return getChainManager().verifyChain(maxEntries);
}
/**
 * Get integrity status of the security log.
 */
export function getIntegrityStatus() {
    return getChainManager().getChainStatus();
}
// ============================================================================
// CLI Interface
// ============================================================================
/**
 * Parse CLI arguments for --log and -n options.
 */
function parseArgs(args) {
    let logFile = null;
    let maxEntries;
    let jsonOutput = false;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--log' && args[i + 1]) {
            logFile = args[i + 1];
            i++;
        }
        else if ((arg === '-n' || arg === '--max-entries') && args[i + 1]) {
            maxEntries = parseInt(args[i + 1], 10);
            i++;
        }
        else if (arg === '--json' || arg === '-j') {
            jsonOutput = true;
        }
    }
    return { logFile, maxEntries, jsonOutput };
}
/**
 * CLI main function.
 *
 * NOTE: GPG signing/verification is not implemented in the Node.js version.
 * This is a lower priority feature that requires external dependencies.
 */
export function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const { logFile, maxEntries, jsonOutput } = parseArgs(args.slice(1));
    if (!command || command === 'status') {
        const manager = logFile ? getChainManager(logFile) : getChainManager();
        const status = manager.getChainStatus();
        if (jsonOutput) {
            console.log(JSON.stringify(status, null, 2));
        }
        else {
            console.log('=== Audit Chain Status ===');
            console.log(`Log file: ${status['log_file']}`);
            console.log(`Entry count: ${status['entry_count']}`);
            console.log(`Last timestamp: ${status['last_timestamp'] || 'N/A'}`);
            console.log(`Last hash: ${status['last_hash']}`);
            console.log(`Signing enabled: ${status['signing_enabled']}`);
            console.log(`Chain valid: ${status['chain_valid']}`);
            console.log(`Entries verified: ${status['entries_verified']}`);
            console.log(`Tampering detected: ${status['tampering_detected']}`);
        }
    }
    else if (command === 'verify') {
        if (!logFile) {
            console.error('Usage: audit-integrity verify --log <file> [--max-entries N] [--json]');
            process.exit(1);
        }
        const manager = getChainManager(logFile);
        const result = manager.verifyChain(maxEntries);
        if (jsonOutput) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log('=== Chain Verification Result ===');
            console.log(`Log file: ${logFile}`);
            console.log(`Valid: ${result.valid}`);
            console.log(`Entries checked: ${result.entriesChecked}`);
            if (result.valid) {
                console.log('\n✓ Hash chain verified successfully.');
            }
            else {
                console.log(`\n✗ Verification FAILED`);
                console.log(`  First invalid index: ${result.firstInvalidIndex}`);
                console.log(`  Error: ${result.errorMessage}`);
                console.log(`  Tampering detected: ${result.tamperingDetected}`);
            }
        }
        process.exit(result.valid ? 0 : 1);
    }
    else if (command === 'sign' || command === 'verify-gpg') {
        // GPG commands not implemented
        console.error(`GPG ${command} is not implemented in the Node.js version.`);
        console.error('Use the Python version for GPG signing/verification.');
        process.exit(1);
    }
    else {
        console.error('Usage: audit-integrity [status|verify] --log <file> [--max-entries N] [--json]');
        console.error('');
        console.error('Commands:');
        console.error('  status   Show chain status (default)');
        console.error('  verify   Verify chain integrity');
        console.error('');
        console.error('Options:');
        console.error('  --log <file>       Log file to verify');
        console.error('  -n, --max-entries  Maximum entries to verify');
        console.error('  --json, -j         Output as JSON');
        process.exit(1);
    }
}
// Run CLI if executed directly
const isMainModule = process.argv[1] &&
    (process.argv[1].endsWith('audit-integrity.js') ||
        process.argv[1].endsWith('audit-integrity.ts'));
if (isMainModule) {
    main();
}
//# sourceMappingURL=audit-integrity.js.map