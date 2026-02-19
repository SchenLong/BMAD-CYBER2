// MFA (Multi-Factor Authentication) utilities
// Story 1.4: Authentication - Multi-Factor Auth

import { generateSecret, verify, generateURI } from 'otplib';
import { decrypt, encryptBackupCodes } from './encryption';

// TOTP Configuration
export const TOTP_DIGITS = 6;
export const TOTP_PERIOD = 30;
export const TOTP_WINDOW = 2; // Allow ±60 seconds clock skew

// Backup Code Configuration
export const BACKUP_CODE_COUNT = 10;
export const BACKUP_CODE_LENGTH = 8; // 4 bytes = 8 hex chars

/**
 * Generate a cryptographically secure random TOTP secret
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * Generate TOTP setup result with QR code URL
 * @param email - User email for QR code labeling
 * @param appName - App name for QR code labeling (defaults to BMAD)
 */
export interface TotpSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function generateTotpSetup(email: string, appName: string = 'BMAD'): TotpSetupResult {
  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes();
  const qrCodeUrl = generateURI({
    issuer: appName,
    label: email,
    secret,
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  });

  return {
    secret,
    qrCodeUrl,
    backupCodes
  };
}

/**
 * Verify a TOTP token against a secret
 * @param token - 6-digit TOTP code from user
 * @param secret - Encrypted TOTP secret
 * @returns true if token is valid
 */
export async function verifyTotp(token: string, encryptedSecret: string): Promise<boolean> {
  try {
    const secret = decrypt(encryptedSecret);
    const result = await verify({
      token,
      secret,
      epochTolerance: TOTP_WINDOW * TOTP_PERIOD, // 2 * 30 = 60 seconds tolerance
      digits: TOTP_DIGITS
    });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Generate secure random backup codes
 * Each code is 8 hexadecimal characters (4 bytes of randomness)
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const used = new Set<string>();

  while (codes.length < BACKUP_CODE_COUNT) {
    // Generate 4 random bytes and convert to hex
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    const code = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    // Ensure uniqueness
    if (!used.has(code)) {
      used.add(code);
      codes.push(code);
    }
  }

  return codes;
}

/**
 * Encrypt backup codes for storage
 * @param codes - Array of backup codes
 * @returns JSON string of encrypted codes
 */
export function encryptBackupCodesForStorage(codes: string[]): string {
  return encryptBackupCodes(codes);
}

/**
 * Verify a backup code against encrypted list
 * @param code - User-provided backup code
 * @param encryptedBackupCodes - JSON string of encrypted codes
 * @returns Object with isValid flag and the index of the used code (if valid)
 */
export interface BackupCodeVerificationResult {
  isValid: boolean;
  codeIndex?: number;
  remainingCodes?: string[];
}

export function verifyBackupCode(
  code: string,
  encryptedBackupCodes: string
): BackupCodeVerificationResult {
  try {
    const codes = JSON.parse(encryptedBackupCodes) as string[];
    const upperCode = code.toUpperCase().replace(/\s/g, '');

    for (let i = 0; i < codes.length; i++) {
      const decrypted = decrypt(codes[i]);
      if (decrypted.toUpperCase() === upperCode) {
        // Remove the used code
        const remainingCodes = codes.filter((_, idx) => idx !== i);
        return {
          isValid: true,
          codeIndex: i,
          remainingCodes
        };
      }
    }

    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

/**
 * Format a backup code for display (XXXX-XXXX)
 */
export function formatBackupCode(code: string): string {
  const cleaned = code.toUpperCase().replace(/\s/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return cleaned;
}

/**
 * Validate TOTP token format
 */
export function isValidTotpFormat(token: string): boolean {
  return /^\d{6}$/.test(token);
}

/**
 * Validate backup code format
 */
export function isValidBackupCodeFormat(code: string): boolean {
  const cleaned = code.toUpperCase().replace(/\s/g, '');
  return /^[0-9A-F]{8}$/.test(cleaned);
}

/**
 * Get remaining backup codes count
 */
export function getRemainingBackupCodesCount(encryptedBackupCodes: string | null): number {
  if (!encryptedBackupCodes) return 0;
  try {
    const codes = JSON.parse(encryptedBackupCodes) as string[];
    return codes.length;
  } catch {
    return 0;
  }
}

/**
 * Check if user needs to regenerate backup codes
 * Warning when less than 3 codes remain
 */
export function shouldWarnBackupCodes(encryptedBackupCodes: string | null): boolean {
  return getRemainingBackupCodesCount(encryptedBackupCodes) < 3;
}
