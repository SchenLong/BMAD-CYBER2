/**
 * API Key Generator
 * Story 8.2: API Key Management
 * Task 2: API Key Generation
 *
 * Secure API key generation using crypto.randomBytes
 * Key format: bmad_sk_<64 chars>
 */

import { randomBytes } from 'crypto';

/**
 * API key prefix to identify BMAD secret keys
 */
export const API_KEY_PREFIX = 'bmad_sk_';

/**
 * API key length in characters (excluding prefix)
 * 256 bits = 32 bytes = 64 hex characters
 */
export const API_KEY_LENGTH = 64;

/**
 * Valid characters for API keys (alphanumeric only)
 * 36 characters for base36 encoding
 */
const VALID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Generate a secure API key
 *
 * Format: bmad_sk_<64 alphanumeric characters>
 * Example: bmad_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
 *
 * SECURITY: Uses only crypto.randomBytes() for all randomness
 * - Generates 64 bytes of random data
 * - Maps each byte to a valid character
 * - NEVER uses Math.random() which is not cryptographically secure
 *
 * @returns A new API key
 */
export function generateApiKey(): string {
  // Generate 64 bytes (512 bits) of random data for 64 characters
  // Using more bytes than needed ensures we can map directly to VALID_CHARS
  const bytes = randomBytes(API_KEY_LENGTH);

  // Convert each byte to a valid character
  // Each byte (0-255) is mapped to one of 36 characters using modulo
  let key = '';
  for (const byte of bytes) {
    key += VALID_CHARS[byte % VALID_CHARS.length];
  }

  return `${API_KEY_PREFIX}${key}`;
}

/**
 * Validate API key format
 *
 * @param key - The API key to validate
 * @returns True if the key format is valid
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Check prefix
  if (!key.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  // Check length
  const keyPart = key.substring(API_KEY_PREFIX.length);
  if (keyPart.length !== API_KEY_LENGTH) {
    return false;
  }

  // Check that all characters are valid
  return /^[a-z0-9]+$/.test(keyPart);
}

/**
 * Extract a safe preview of an API key (last 4 characters)
 *
 * @param key - The API key
 * @returns A safe preview string
 */
export function getApiKeyPreview(key: string): string {
  if (!key || key.length < 4) {
    return '****';
  }
  return `...${key.substring(key.length - 4)}`;
}
