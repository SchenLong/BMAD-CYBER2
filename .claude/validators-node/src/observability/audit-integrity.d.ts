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
/**
 * Result of chain verification.
 */
export interface VerificationResult {
    valid: boolean;
    entriesChecked: number;
    firstInvalidIndex: number | null;
    errorMessage: string | null;
    tamperingDetected: boolean;
}
/**
 * Hash Chain Manager class.
 *
 * Manages cryptographic hash chain for audit log integrity.
 * The hash chain provides tamper-evidence by linking each log entry
 * to its predecessor through cryptographic hashes.
 */
export declare class HashChainManager {
    private logFile;
    constructor(logFile: string);
    /**
     * Add a new entry to the hash chain.
     *
     * @param logEntry - The log entry to add (will be modified)
     * @returns The log entry with chain fields added
     */
    addEntry<T extends Record<string, unknown>>(logEntry: T): T & {
        _chain_index?: number;
        _previous_hash?: string;
        _entry_hash?: string;
        _chain_error?: string;
    };
    /**
     * Verify the integrity of the hash chain.
     *
     * @param maxEntries - Maximum entries to verify (undefined = all)
     * @returns VerificationResult with validation status
     */
    verifyChain(maxEntries?: number): VerificationResult;
    /**
     * Get current chain status and statistics.
     */
    getChainStatus(): Record<string, unknown>;
}
/**
 * Get or create the hash chain manager for the security log.
 */
export declare function getChainManager(logFile?: string): HashChainManager;
/**
 * Add hash chain fields to a log entry.
 */
export declare function addChainFields<T extends Record<string, unknown>>(logEntry: T): T;
/**
 * Verify the integrity of the security log.
 */
export declare function verifySecurityLog(maxEntries?: number): VerificationResult;
/**
 * Get integrity status of the security log.
 */
export declare function getIntegrityStatus(): Record<string, unknown>;
/**
 * CLI main function.
 *
 * NOTE: GPG signing/verification is not implemented in the Node.js version.
 * This is a lower priority feature that requires external dependencies.
 */
export declare function main(): void;
