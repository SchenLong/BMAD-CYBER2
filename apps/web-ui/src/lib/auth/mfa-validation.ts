// MFA input validation utilities
// Story 1.4: Authentication - Multi-Factor Auth

import { z } from 'zod';

/**
 * TOTP code validation schema
 */
export const totpCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'TOTP code must be 6 digits')
    .max(6, 'TOTP code must be 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must contain only digits')
});

/**
 * Backup code validation schema
 */
export const backupCodeSchema = z.object({
  code: z
    .string()
    .min(8, 'Backup code must be 8 characters')
    .max(9, 'Backup code must be 8 characters (optionally with hyphen)')
    .regex(/^[0-9A-F]{8}$/, 'Backup code must be 8 hexadecimal characters')
    .or(z.string().regex(/^[0-9A-F]{4}-[0-9A-F]{4}$/, 'Backup code format: XXXX-XXXX'))
});

/**
 * MFA setup request validation
 */
export const mfaSetupRequestSchema = z.object({
  // No body required for setup initiation
});

/**
 * MFA verify request validation
 */
export const mfaVerifyRequestSchema = z.object({
  code: z
    .string()
    .min(6, 'Verification code required')
    .max(9, 'Invalid code format')
});

/**
 * MFA login verification request
 */
export const mfaLoginVerifyRequestSchema = z.object({
  code: z.string().min(1, 'Code required'),
  backupCode: z.boolean().optional().default(false)
});

/**
 * MFA disable request validation
 */
export const mfaDisableRequestSchema = z.object({
  password: z.string().min(1, 'Password required to disable MFA')
});

/**
 * Validate TOTP code
 */
export function validateTotpCode(code: string): { valid: boolean; error?: string } {
  const result = totpCodeSchema.safeParse({ code });
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || 'Invalid TOTP code'
    };
  }
  return { valid: true };
}

/**
 * Validate backup code
 */
export function validateBackupCode(code: string): { valid: boolean; error?: string } {
  const normalizedCode = code.toUpperCase().replace(/\s/g, '');
  const result = backupCodeSchema.safeParse({ code: normalizedCode });
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || 'Invalid backup code'
    };
  }
  return { valid: true };
}

/**
 * Validate MFA verification code (TOTP or backup)
 */
export function validateMfaCode(code: string, isBackup: boolean = false): { valid: boolean; error?: string } {
  if (isBackup) {
    return validateBackupCode(code);
  }
  return validateTotpCode(code);
}

export type MfaSetupRequest = z.infer<typeof mfaSetupRequestSchema>;
export type MfaVerifyRequest = z.infer<typeof mfaVerifyRequestSchema>;
export type MfaLoginVerifyRequest = z.infer<typeof mfaLoginVerifyRequestSchema>;
export type MfaDisableRequest = z.infer<typeof mfaDisableRequestSchema>;
