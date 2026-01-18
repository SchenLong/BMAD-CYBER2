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

import * as crypto from 'node:crypto';
import { AuditLogEntry } from '../types/index.js';

// Configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_ALGORITHM = 'pbkdf2';
const KEY_DERIVATION_DIGEST = 'sha256';
const KEY_DERIVATION_ITERATIONS = 100000; // OWASP 2024 minimum
const IV_LENGTH = 12; // 96 bits for GCM (recommended)
const TAG_LENGTH = 16; // 128 bits for GCM authentication tag
const SALT_LENGTH = 32; // 256 bits for key derivation salt
const DERIVED_KEY_LENGTH = 32; // 256 bits for AES-256

// Environment variables
const ENCRYPTION_KEY_ENV = 'BMAD_AUDIT_ENCRYPTION_KEY';
const ENCRYPTION_ENABLED_ENV = 'BMAD_AUDIT_ENCRYPTION_ENABLED';

// Error types
export class AuditEncryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AuditEncryptionError';
  }
}

export class AuditDecryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AuditDecryptionError';
  }
}

/**
 * Encrypted audit log entry structure.
 */
export interface EncryptedAuditEntry {
  encrypted: true;
  version: string;
  algorithm: string;
  iv: string; // Base64-encoded initialization vector
  salt: string; // Base64-encoded key derivation salt
  tag: string; // Base64-encoded authentication tag
  data: string; // Base64-encoded encrypted data
  timestamp: string; // Plaintext timestamp for log ordering
  session_id: string; // Plaintext session ID for correlation
}

/**
 * Check if an audit entry is encrypted.
 */
export function isEncryptedEntry(entry: unknown): entry is EncryptedAuditEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'encrypted' in entry &&
    entry.encrypted === true &&
    'version' in entry &&
    'algorithm' in entry &&
    'iv' in entry &&
    'salt' in entry &&
    'tag' in entry &&
    'data' in entry
  );
}

/**
 * Get the master encryption key from environment.
 */
function getMasterKey(): Buffer | null {
  const keyHex = process.env[ENCRYPTION_KEY_ENV];
  if (!keyHex) {
    return null;
  }

  try {
    // Validate key format (must be 64 hex characters = 32 bytes)
    if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
      throw new AuditEncryptionError(
        'Invalid encryption key format: must be 64 hex characters (32 bytes)',
        'INVALID_KEY_FORMAT'
      );
    }

    return Buffer.from(keyHex, 'hex');
  } catch (error) {
    throw new AuditEncryptionError(
      `Failed to parse encryption key: ${error instanceof Error ? error.message : String(error)}`,
      'KEY_PARSE_ERROR'
    );
  }
}

/**
 * Derive encryption key from master key using PBKDF2.
 */
function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    KEY_DERIVATION_ITERATIONS,
    DERIVED_KEY_LENGTH,
    KEY_DERIVATION_DIGEST
  );
}

/**
 * Check if encryption is enabled.
 */
export function isEncryptionEnabled(): boolean {
  const explicitSetting = process.env[ENCRYPTION_ENABLED_ENV];
  if (explicitSetting !== undefined) {
    return explicitSetting.toLowerCase() === 'true';
  }

  // Auto-detect: enabled if key is available
  return getMasterKey() !== null;
}

/**
 * Generate a secure random initialization vector.
 */
function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * Generate a secure random salt for key derivation.
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Encrypt an audit log entry.
 *
 * @param entry - The audit log entry to encrypt
 * @returns Promise resolving to encrypted entry or original entry if encryption disabled
 * @throws AuditEncryptionError if encryption fails
 */
export async function encryptEntry(entry: AuditLogEntry): Promise<AuditLogEntry | EncryptedAuditEntry> {
  // Check if encryption is enabled
  if (!isEncryptionEnabled()) {
    return entry; // Return original entry unchanged
  }

  const masterKey = getMasterKey();
  if (!masterKey) {
    return entry; // Fallback to plaintext
  }

  try {
    // Generate unique IV and salt for this entry
    const iv = generateIV();
    const salt = generateSalt();

    // Derive encryption key from master key using salt
    const derivedKey = deriveKey(masterKey, salt);

    // Create cipher with modern API
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    cipher.setAAD(Buffer.from(JSON.stringify({ iv: iv.toString('base64'), salt: salt.toString('base64') })));

    // Prepare data to encrypt (exclude timestamp and session_id for correlation)
    const dataToEncrypt = { ...entry };
    delete (dataToEncrypt as any).timestamp;
    delete (dataToEncrypt as any).session_id;

    // Encrypt the data
    const plaintext = JSON.stringify(dataToEncrypt);
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Return encrypted entry
    const encryptedEntry: EncryptedAuditEntry = {
      encrypted: true,
      version: '1.0',
      algorithm: ENCRYPTION_ALGORITHM,
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64'),
      timestamp: entry.timestamp, // Keep timestamp in plaintext for ordering
      session_id: entry.session_id, // Keep session_id in plaintext for correlation
    };

    return encryptedEntry;

  } catch (error) {
    throw new AuditEncryptionError(
      `Failed to encrypt audit entry: ${error instanceof Error ? error.message : String(error)}`,
      'ENCRYPTION_FAILED'
    );
  }
}

/**
 * Decrypt an encrypted audit log entry.
 *
 * @param entry - The encrypted audit entry to decrypt
 * @returns Promise resolving to decrypted audit log entry
 * @throws AuditDecryptionError if decryption fails
 */
export async function decryptEntry(entry: EncryptedAuditEntry): Promise<AuditLogEntry> {
  const masterKey = getMasterKey();
  if (!masterKey) {
    throw new AuditDecryptionError(
      'Cannot decrypt audit entry: encryption key not available',
      'ENCRYPTION_KEY_UNAVAILABLE'
    );
  }

  try {
    // Validate entry structure
    if (!isEncryptedEntry(entry)) {
      throw new AuditDecryptionError(
        'Invalid encrypted entry structure',
        'INVALID_ENTRY_STRUCTURE'
      );
    }

    // Validate algorithm
    if (entry.algorithm !== ENCRYPTION_ALGORITHM) {
      throw new AuditDecryptionError(
        `Unsupported encryption algorithm: ${entry.algorithm}`,
        'UNSUPPORTED_ALGORITHM'
      );
    }

    // Parse encrypted components
    const iv = Buffer.from(entry.iv, 'base64');
    const salt = Buffer.from(entry.salt, 'base64');
    const tag = Buffer.from(entry.tag, 'base64');
    const encryptedData = Buffer.from(entry.data, 'base64');

    // Validate component lengths
    if (iv.length !== IV_LENGTH) {
      throw new AuditDecryptionError(
        `Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`,
        'INVALID_IV_LENGTH'
      );
    }

    if (tag.length !== TAG_LENGTH) {
      throw new AuditDecryptionError(
        `Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`,
        'INVALID_TAG_LENGTH'
      );
    }

    // Derive decryption key
    const derivedKey = deriveKey(masterKey, salt);

    // Create decipher with modern API
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    decipher.setAAD(Buffer.from(JSON.stringify({ iv: entry.iv, salt: entry.salt })));
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    // Parse decrypted JSON
    const decryptedData = JSON.parse(decrypted);

    // Reconstruct full audit entry
    const auditEntry: AuditLogEntry = {
      timestamp: entry.timestamp,
      session_id: entry.session_id,
      ...decryptedData,
    };

    return auditEntry;

  } catch (error) {
    if (error instanceof AuditDecryptionError) {
      throw error;
    }

    throw new AuditDecryptionError(
      `Failed to decrypt audit entry: ${error instanceof Error ? error.message : String(error)}`,
      'DECRYPTION_FAILED'
    );
  }
}

/**
 * Process an audit log entry for storage.
 * Encrypts if encryption is enabled, otherwise returns original entry.
 *
 * @param entry - The audit log entry to process
 * @returns Promise resolving to processed entry (encrypted or original)
 */
export async function processEntryForStorage(entry: AuditLogEntry): Promise<AuditLogEntry | EncryptedAuditEntry> {
  try {
    return await encryptEntry(entry);
  } catch (error) {
    // Log encryption failure but don't block audit logging
    console.warn(`Audit encryption failed, falling back to plaintext: ${error instanceof Error ? error.message : String(error)}`);
    return entry;
  }
}

/**
 * Process a raw audit log line for reading.
 * Decrypts if encrypted, otherwise returns parsed JSON.
 *
 * @param line - Raw log line to process
 * @returns Promise resolving to audit log entry
 * @throws Error if parsing or decryption fails
 */
export async function processLineForReading(line: string): Promise<AuditLogEntry> {
  try {
    const parsed = JSON.parse(line);

    // Check if entry is encrypted
    if (isEncryptedEntry(parsed)) {
      return await decryptEntry(parsed);
    }

    // Return plaintext entry as-is
    return parsed as AuditLogEntry;

  } catch (error) {
    throw new Error(`Failed to process audit log line: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get encryption status and configuration information.
 */
export function getEncryptionStatus(): {
  enabled: boolean;
  keyAvailable: boolean;
  algorithm: string;
  keyDerivation: string;
  version: string;
} {
  return {
    enabled: isEncryptionEnabled(),
    keyAvailable: getMasterKey() !== null,
    algorithm: ENCRYPTION_ALGORITHM,
    keyDerivation: `${KEY_DERIVATION_ALGORITHM}/${KEY_DERIVATION_DIGEST}/${KEY_DERIVATION_ITERATIONS}`,
    version: '1.0',
  };
}

/**
 * Encrypt an audit log entry synchronously (for logSync performance).
 *
 * @param entry - The audit log entry to encrypt
 * @returns Encrypted entry or original entry if encryption disabled/fails
 */
export function encryptEntrySync(entry: AuditLogEntry): AuditLogEntry | EncryptedAuditEntry {
  // Check if encryption is enabled
  if (!isEncryptionEnabled()) {
    return entry; // Return original entry unchanged
  }

  const masterKey = getMasterKey();
  if (!masterKey) {
    return entry; // Fallback to plaintext
  }

  try {
    // Generate unique IV and salt for this entry
    const iv = generateIV();
    const salt = generateSalt();

    // Derive encryption key from master key using salt
    const derivedKey = deriveKey(masterKey, salt);

    // Create cipher with modern API
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    cipher.setAAD(Buffer.from(JSON.stringify({ iv: iv.toString('base64'), salt: salt.toString('base64') })));

    // Prepare data to encrypt (exclude timestamp and session_id for correlation)
    const dataToEncrypt = { ...entry };
    delete (dataToEncrypt as any).timestamp;
    delete (dataToEncrypt as any).session_id;

    // Encrypt the data
    const plaintext = JSON.stringify(dataToEncrypt);
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Return encrypted entry
    const encryptedEntry: EncryptedAuditEntry = {
      encrypted: true,
      version: '1.0',
      algorithm: ENCRYPTION_ALGORITHM,
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64'),
      timestamp: entry.timestamp, // Keep timestamp in plaintext for ordering
      session_id: entry.session_id, // Keep session_id in plaintext for correlation
    };

    return encryptedEntry;

  } catch (error) {
    // In sync context, log warning and return plaintext rather than throwing
    console.warn(`Sync encryption failed, using plaintext: ${error instanceof Error ? error.message : String(error)}`);
    return entry;
  }
}

/**
 * Generate a new random encryption key for audit logs.
 *
 * @returns 32-byte hex-encoded key suitable for BMAD_AUDIT_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}