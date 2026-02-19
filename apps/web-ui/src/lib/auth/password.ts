/**
 * Password Security Utilities
 * Story 1.2: Authentication System - Core
 *
 * Implements secure password hashing with bcrypt (cost factor 12)
 * and password strength validation using entropy calculation.
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Per security requirements (Story 1.2)

/**
 * Hash a password using bcrypt with cost factor 12
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hash to compare against
 * @returns Promise resolving to true if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Calculate password entropy based on character set variety and length
 * Higher entropy = stronger password
 *
 * Entropy formula: length * log2(pool_size)
 * Pool size depends on character types used:
 * - Lowercase only: 26
 * - + Uppercase: 52
 * - + Numbers: 62
 * - + Symbols: ~90+
 *
 * @param password - Password to analyze
 * @returns Entropy value in bits (higher is better)
 */
export function calculatePasswordEntropy(password: string): number {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  // Calculate pool size based on character variety
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32; // Common symbols

  // Entropy = length * log2(poolSize)
  if (poolSize === 0) return 0;
  return password.length * Math.log2(poolSize);
}

/**
 * Validate password strength based on minimum entropy threshold
 * @param password - Password to validate
 * @param minEntropy - Minimum required entropy bits (default: 40)
 * @returns Object with validation result and reason if failed
 */
export function validatePasswordStrength(
  password: string,
  minEntropy: number = 40
): { valid: boolean; reason?: string; entropy: number } {
  const entropy = calculatePasswordEntropy(password);

  // Minimum length check (Story 1.2 requires 12 chars)
  if (password.length < 12) {
    return {
      valid: false,
      reason: 'Password must be at least 12 characters long',
      entropy,
    };
  }

  // Entropy check
  if (entropy < minEntropy) {
    return {
      valid: false,
      reason:
        'Password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols.',
      entropy,
    };
  }

  return { valid: true, entropy };
}

/**
 * Password complexity score (0-100)
 * Useful for password strength meters in UI
 * @param password - Password to score
 * @returns Score from 0 (weak) to 100 (strong)
 */
export function getPasswordStrengthScore(password: string): number {
  const entropy = calculatePasswordEntropy(password);

  // Scale entropy to 0-100 score
  // 40 bits = minimum acceptable (~50 score)
  // 80 bits = very strong (~100 score)
  const score = Math.min(100, Math.max(0, (entropy / 80) * 100));
  return Math.round(score);
}

/**
 * Get password strength label based on entropy
 * @param password - Password to analyze
 * @returns Label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
 */
export function getPasswordStrengthLabel(
  password: string
): 'weak' | 'fair' | 'good' | 'strong' | 'very-strong' {
  const entropy = calculatePasswordEntropy(password);

  if (entropy < 30) return 'weak';
  if (entropy < 40) return 'fair';
  if (entropy < 55) return 'good';
  if (entropy < 70) return 'strong';
  return 'very-strong';
}
