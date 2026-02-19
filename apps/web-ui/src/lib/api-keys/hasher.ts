/**
 * API Key Hasher
 * Story 8.2: API Key Management
 * Task 2: API Key Generation
 *
 * Secure hashing for API keys using bcrypt
 */

import { hash, compare } from 'bcrypt';
import { API_KEY_PREFIX, API_KEY_LENGTH } from './generator';

/**
 * Cost factor for bcrypt hashing
 * Higher values = more secure but slower
 * Story requirement: cost factor 12
 */
export const BCRYPT_COST_FACTOR = 12;

/**
 * Hash an API key using bcrypt
 *
 * @param key - The plaintext API key
 * @returns A promise that resolves to the hashed key
 */
export async function hashApiKey(key: string): Promise<string> {
  return await hash(key, BCRYPT_COST_FACTOR);
}

/**
 * Verify an API key against its hash
 *
 * Uses constant-time comparison via bcrypt.compare
 * to prevent timing attacks
 *
 * @param key - The plaintext API key to verify
 * @param keyHash - The stored hash to compare against
 * @returns A promise that resolves to true if the key matches
 */
export async function verifyApiKey(
  key: string,
  keyHash: string
): Promise<boolean> {
  return await compare(key, keyHash);
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

  // Check that all characters are valid (lowercase alphanumeric)
  return /^[a-z0-9]+$/.test(keyPart);
}
