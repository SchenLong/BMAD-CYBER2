// Encryption utilities for MFA secrets and backup codes
// Story 1.4: Authentication - Multi-Factor Auth

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Throws error if key is not configured
 */
function getEncryptionKey(): Buffer {
  const key = process.env.MFA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('MFA_ENCRYPTION_KEY environment variable is not set');
  }

  // Key should be 32 bytes for AES-256-GCM
  // If hex encoded, decode it. If base64, decode it.
  // Otherwise assume it's already the right length
  if (key.length === 64 && /^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  if (key.length === 44 && /^[A-Za-z0-9+/]{42}==$/.test(key)) {
    return Buffer.from(key, 'base64');
  }

  // Use as-is with padding/truncation (not recommended but functional)
  const buffer = Buffer.from(key, 'utf8');
  const keyBuffer = Buffer.alloc(32);
  buffer.copy(keyBuffer, 0, 0, Math.min(buffer.length, 32));
  return keyBuffer;
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Plain text to encrypt
 * @returns Encrypted data with IV and auth tag (base64 encoded)
 */
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Base64 encoded encrypted data (IV + authTag + encrypted)
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt an array of backup codes
 * @param codes - Array of backup codes to encrypt
 * @returns JSON string of encrypted codes
 */
export function encryptBackupCodes(codes: string[]): string {
  return JSON.stringify(codes.map(code => encrypt(code)));
}

/**
 * Decrypt an array of backup codes
 * @param encryptedJson - JSON string of encrypted codes
 * @returns Array of decrypted backup codes
 */
export function decryptBackupCodes(encryptedJson: string): string[] {
  try {
    const encryptedCodes: string[] = JSON.parse(encryptedJson);
    return encryptedCodes.map(code => decrypt(code));
  } catch (error) {
    throw new Error(`Backup codes decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash a backup code for comparison (one-way)
 * This allows us to verify codes without storing them in decryptable form
 * Note: For MFA, we store encrypted codes to allow one-time use tracking
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}
