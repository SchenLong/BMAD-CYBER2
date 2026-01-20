/**
 * BMAD Guardrails: Audit Log Encryption (SEC-003-1)
 * ==================================================
 * Implements AES-256-GCM encryption for audit logs to meet NIST PR.DS-1 compliance.
 *
 * Features:
 * - AES-256-GCM encryption for audit log entries at rest
 * - HMAC-based authentication for integrity verification
 * - Environment variable key management (BMAD_AUDIT_ENCRYPTION_KEY)
 * - Graceful fallback to plaintext when encryption key not available
 * - Backward compatibility with existing plaintext logs
 *
 * Security Design:
 * - 32-byte encryption key from environment (hex-encoded)
 * - Unique 12-byte IV per log entry (crypto.randomBytes)
 * - GCM authentication tag for integrity
 * - Key derivation using PBKDF2 with per-entry salt
 *
 * Configuration:
 *   BMAD_AUDIT_ENCRYPTION_KEY=<32-byte-hex-key> (required for encryption)
 *   BMAD_AUDIT_ENCRYPTION_ENABLED=true|false (default: auto-detect from key)
 *
 * Compliance:
 *   - NIST PR.DS-1: Data-at-rest is protected
 *   - FIPS 197: AES encryption standard
 *   - NIST SP 800-38D: GCM mode specification
 */
import { AuditLogEntry } from '../types/index.js';
export declare class AuditEncryptionError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class AuditDecryptionError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
/**
 * Encrypted audit log entry structure.
 */
export interface EncryptedAuditEntry {
    encrypted: true;
    version: string;
    algorithm: string;
    iv: string;
    salt: string;
    tag: string;
    data: string;
    timestamp: string;
    session_id: string;
}
/**
 * Check if an audit entry is encrypted.
 */
export declare function isEncryptedEntry(entry: unknown): entry is EncryptedAuditEntry;
/**
 * Check if encryption is enabled.
 */
export declare function isEncryptionEnabled(): boolean;
/**
 * Encrypt an audit log entry.
 *
 * @param entry - The audit log entry to encrypt
 * @returns Promise resolving to encrypted entry or original entry if encryption disabled
 * @throws AuditEncryptionError if encryption fails
 */
export declare function encryptEntry(entry: AuditLogEntry): Promise<AuditLogEntry | EncryptedAuditEntry>;
/**
 * Decrypt an encrypted audit log entry.
 *
 * @param entry - The encrypted audit entry to decrypt
 * @returns Promise resolving to decrypted audit log entry
 * @throws AuditDecryptionError if decryption fails
 */
export declare function decryptEntry(entry: EncryptedAuditEntry): Promise<AuditLogEntry>;
/**
 * Process an audit log entry for storage.
 * Encrypts if encryption is enabled, otherwise returns original entry.
 *
 * @param entry - The audit log entry to process
 * @returns Promise resolving to processed entry (encrypted or original)
 */
export declare function processEntryForStorage(entry: AuditLogEntry): Promise<AuditLogEntry | EncryptedAuditEntry>;
/**
 * Process a raw audit log line for reading.
 * Decrypts if encrypted, otherwise returns parsed JSON.
 *
 * @param line - Raw log line to process
 * @returns Promise resolving to audit log entry
 * @throws Error if parsing or decryption fails
 */
export declare function processLineForReading(line: string): Promise<AuditLogEntry>;
/**
 * Get encryption status and configuration information.
 */
export declare function getEncryptionStatus(): {
    enabled: boolean;
    keyAvailable: boolean;
    algorithm: string;
    keyDerivation: string;
    version: string;
    cacheStats?: {
        size: number;
        maxSize: number;
        hitRate: number;
        totalAccesses: number;
    };
};
/**
 * Encrypt an audit log entry synchronously (for logSync performance).
 *
 * @param entry - The audit log entry to encrypt
 * @returns Encrypted entry or original entry if encryption disabled/fails
 */
export declare function encryptEntrySync(entry: AuditLogEntry): AuditLogEntry | EncryptedAuditEntry;
/**
 * Generate a new random encryption key for audit logs.
 *
 * @returns 32-byte hex-encoded key suitable for BMAD_AUDIT_ENCRYPTION_KEY
 */
export declare function generateEncryptionKey(): string;
/**
 * Get key cache statistics for monitoring
 */
export declare function getKeyCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
};
/**
 * Clear key cache (useful for testing or security)
 */
export declare function clearKeyCache(): void;
/**
 * Cleanup encryption module resources
 */
export declare function cleanup(): void;
