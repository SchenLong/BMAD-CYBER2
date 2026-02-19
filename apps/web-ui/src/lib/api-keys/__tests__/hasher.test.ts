/**
 * API Key Hasher Tests
 * Story 8.2: API Key Management
 */

import { describe, it, expect } from '@jest/globals';
import { hashApiKey, verifyApiKey, isValidApiKeyFormat } from '../hasher';

describe('API Key Hasher', () => {
  describe('hashApiKey', () => {
    it('should generate a different hash for the same key', async () => {
      const key = 'test-api-key';
      const hash1 = await hashApiKey(key);
      const hash2 = await hashApiKey(key);

      // Bcrypt includes salt, so hashes will be different
      expect(hash1).not.toBe(hash2);
    });

    it('should generate a hash starting with $2b$', async () => {
      const key = 'test-api-key';
      const hash = await hashApiKey(key);

      // $2b$ indicates bcrypt with cost factor
      expect(hash.substring(0, 4)).toBe('$2b$');
    });

    it('should use cost factor 12', async () => {
      const key = 'test-api-key';
      const hash = await hashApiKey(key);

      // Extract cost factor from bcrypt hash
      // Format: $2b$[cost]$[salt+hash]
      const match = hash.match(/^\$2b\$(\d+)\$/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe('12');
    });
  });

  describe('verifyApiKey', () => {
    it('should return true for correct key', async () => {
      const key = 'test-api-key';
      const hash = await hashApiKey(key);

      const result = await verifyApiKey(key, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect key', async () => {
      const key = 'test-api-key';
      const wrongKey = 'wrong-api-key';
      const hash = await hashApiKey(key);

      const result = await verifyApiKey(wrongKey, hash);
      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const key = 'Test-API-Key';
      const hash = await hashApiKey(key);

      const result = await verifyApiKey('test-api-key', hash);
      expect(result).toBe(false);
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should accept valid bmad_sk_ keys', () => {
      expect(isValidApiKeyFormat('bmad_sk_' + 'a'.repeat(64))).toBe(true);
    });

    it('should reject keys without bmad_sk_ prefix', () => {
      expect(isValidApiKeyFormat('invalid_' + 'a'.repeat(64))).toBe(false);
    });

    it('should reject keys with wrong length', () => {
      expect(isValidApiKeyFormat('bmad_sk_' + 'a'.repeat(63))).toBe(false);
      expect(isValidApiKeyFormat('bmad_sk_' + 'a'.repeat(65))).toBe(false);
    });

    it('should reject keys with invalid characters', () => {
      expect(isValidApiKeyFormat('bmad_sk_' + 'a'.repeat(63) + 'A')).toBe(false); // uppercase
      expect(isValidApiKeyFormat('bmad_sk_' + 'a'.repeat(63) + '-')).toBe(false); // hyphen
    });
  });
});
