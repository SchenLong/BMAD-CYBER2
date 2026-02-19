/**
 * API Key Generator Tests
 * Story 8.2: API Key Management
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateApiKey,
  isValidApiKeyFormat,
  getApiKeyPreview,
  API_KEY_PREFIX,
  API_KEY_LENGTH,
} from '../generator';

describe('API Key Generator', () => {
  describe('generateApiKey', () => {
    it('should generate a key with correct prefix', () => {
      const key = generateApiKey();
      expect(key.substring(0, API_KEY_PREFIX.length)).toBe(API_KEY_PREFIX);
    });

    it('should generate a key with correct total length', () => {
      const key = generateApiKey();
      expect(key.length).toBe(API_KEY_PREFIX.length + API_KEY_LENGTH);
    });

    it('should generate a key with only lowercase alphanumeric characters', () => {
      const key = generateApiKey();
      const keyPart = key.substring(API_KEY_PREFIX.length);
      expect(keyPart).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(generateApiKey());
      }
      expect(keys.size).toBe(100);
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should accept valid API keys', () => {
      const validKey = `${API_KEY_PREFIX}a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`;
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should reject keys without correct prefix', () => {
      const invalidKey = `invalid_${API_KEY_PREFIX}a1b2c3d4`;
      expect(isValidApiKeyFormat(invalidKey)).toBe(false);
    });

    it('should reject keys with wrong length', () => {
      const shortKey = `${API_KEY_PREFIX}short`;
      expect(isValidApiKeyFormat(shortKey)).toBe(false);
    });

    it('should reject keys with uppercase letters', () => {
      const uppercaseKey = `${API_KEY_PREFIX}A1B2C3D4`;
      expect(isValidApiKeyFormat(uppercaseKey)).toBe(false);
    });

    it('should reject keys with special characters', () => {
      const specialKey = `${API_KEY_PREFIX}a1b2-c3d4`;
      expect(isValidApiKeyFormat(specialKey)).toBe(false);
    });

    it('should reject empty or null values', () => {
      expect(isValidApiKeyFormat('')).toBe(false);
      expect(isValidApiKeyFormat(null as any)).toBe(false);
      expect(isValidApiKeyFormat(undefined as any)).toBe(false);
    });
  });

  describe('getApiKeyPreview', () => {
    it('should return last 4 characters with ellipsis prefix', () => {
      const key = `${API_KEY_PREFIX}abcd1234`;
      expect(getApiKeyPreview(key)).toBe('...1234');
    });

    it('should return placeholder for short keys', () => {
      expect(getApiKeyPreview('ab')).toBe('****');
    });

    it('should return placeholder for empty keys', () => {
      expect(getApiKeyPreview('')).toBe('****');
    });

    it('should return placeholder for null keys', () => {
      expect(getApiKeyPreview(null as any)).toBe('****');
    });
  });
});
