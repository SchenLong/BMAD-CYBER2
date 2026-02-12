/**
 * Unit Tests for Configuration Signing - SEC-CFG-002
 * Epic 2, Security Enhancement
 *
 * Tests the config-signing.js functionality for cryptographic
 * signing and verification of security configurations.
 *
 * @module config-signing.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  canonicalizeConfig,
  computeSignature,
  getSignatureMetadata,
  getSigningKey,
  hasCustomSigningKey,
  isSigned,
  parseConfigForSigning,
  SIGNATURE_FIELD,
  signConfig,
  signConfigFile,
  SIGNED_AT_FIELD,
  SIGNING_KEY_ENV,
  stripSignature,
  validateConfigIntegrity,
  verifyConfigFile,
  verifySignature
} from './config-signing.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_signing__');

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_PROJECT_ROOT, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

describe('Configuration Signing - SEC-CFG-002', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('Constants', () => {
    it('should have correct signature field name', () => {
      expect(SIGNATURE_FIELD).toBe('_signature');
    });

    it('should have correct signed_at field name', () => {
      expect(SIGNED_AT_FIELD).toBe('_signed_at');
    });

    it('should have correct env variable name', () => {
      expect(SIGNING_KEY_ENV).toBe('BMAD_SECURITY_CONFIG_SIGNING_KEY');
    });
  });

  describe('getSigningKey()', () => {
    const originalEnv = process.env[SIGNING_KEY_ENV];

    afterEach(() => {
      if (originalEnv) {
        process.env[SIGNING_KEY_ENV] = originalEnv;
      } else {
        delete process.env[SIGNING_KEY_ENV];
      }
    });

    it('should return default key when env not set', () => {
      delete process.env[SIGNING_KEY_ENV];
      const key = getSigningKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should return custom key when env is set', () => {
      process.env[SIGNING_KEY_ENV] = 'my-custom-key';
      const key = getSigningKey();
      expect(key).toBe('my-custom-key');
    });
  });

  describe('hasCustomSigningKey()', () => {
    const originalEnv = process.env[SIGNING_KEY_ENV];

    afterEach(() => {
      if (originalEnv) {
        process.env[SIGNING_KEY_ENV] = originalEnv;
      } else {
        delete process.env[SIGNING_KEY_ENV];
      }
    });

    it('should return false when env not set', () => {
      delete process.env[SIGNING_KEY_ENV];
      expect(hasCustomSigningKey()).toBe(false);
    });

    it('should return true when env is set', () => {
      process.env[SIGNING_KEY_ENV] = 'custom-key';
      expect(hasCustomSigningKey()).toBe(true);
    });
  });

  describe('canonicalizeConfig()', () => {
    it('should produce consistent output for same data', () => {
      const config1 = { tier: 'standard', version: '1.0.0' };
      const config2 = { version: '1.0.0', tier: 'standard' };

      const canon1 = canonicalizeConfig(config1);
      const canon2 = canonicalizeConfig(config2);

      expect(canon1).toBe(canon2);
    });

    it('should remove signature fields', () => {
      const config = {
        tier: 'standard',
        [SIGNATURE_FIELD]: 'somesig',
        [SIGNED_AT_FIELD]: '2024-01-01'
      };

      const canon = canonicalizeConfig(config);

      expect(canon).not.toContain(SIGNATURE_FIELD);
      expect(canon).not.toContain(SIGNED_AT_FIELD);
    });

    it('should return JSON string', () => {
      const config = { tier: 'standard' };
      const canon = canonicalizeConfig(config);

      // Should be valid JSON
      expect(() => JSON.parse(canon)).not.toThrow();
    });
  });

  describe('computeSignature()', () => {
    it('should produce 64-character hex string', () => {
      const config = { tier: 'standard', version: '1.0.0' };
      const sig = computeSignature(config);

      expect(sig).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(sig)).toBe(true);
    });

    it('should produce same signature for same config', () => {
      const config = { tier: 'standard', version: '1.0.0' };
      const sig1 = computeSignature(config);
      const sig2 = computeSignature(config);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signature for different config', () => {
      const config1 = { tier: 'standard' };
      const config2 = { tier: 'enterprise' };

      const sig1 = computeSignature(config1);
      const sig2 = computeSignature(config2);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signature with different key', () => {
      const config = { tier: 'standard' };
      const sig1 = computeSignature(config, 'key1');
      const sig2 = computeSignature(config, 'key2');

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('signConfig()', () => {
    it('should add signature field', () => {
      const config = { tier: 'standard', version: '1.0.0' };
      const signed = signConfig(config);

      expect(signed).toHaveProperty(SIGNATURE_FIELD);
      expect(signed[SIGNATURE_FIELD]).toHaveLength(64);
    });

    it('should add signed_at field', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      expect(signed).toHaveProperty(SIGNED_AT_FIELD);
      // Should be ISO timestamp
      expect(() => new Date(signed[SIGNED_AT_FIELD])).not.toThrow();
    });

    it('should preserve original config fields', () => {
      const config = { tier: 'standard', version: '1.0.0', features: ['auth'] };
      const signed = signConfig(config);

      expect(signed.tier).toBe('standard');
      expect(signed.version).toBe('1.0.0');
      expect(signed.features).toEqual(['auth']);
    });

    it('should not modify original config', () => {
      const config = { tier: 'standard' };
      signConfig(config);

      expect(config).not.toHaveProperty(SIGNATURE_FIELD);
    });

    it('should replace existing signature', () => {
      const config = {
        tier: 'standard',
        [SIGNATURE_FIELD]: 'old-signature',
        [SIGNED_AT_FIELD]: '2020-01-01'
      };

      const signed = signConfig(config);

      expect(signed[SIGNATURE_FIELD]).not.toBe('old-signature');
      expect(signed[SIGNED_AT_FIELD]).not.toBe('2020-01-01');
    });
  });

  describe('verifySignature()', () => {
    it('should verify valid signature', () => {
      const config = { tier: 'standard', version: '1.0.0' };
      const signed = signConfig(config);

      const result = verifySignature(signed);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject config without signature', () => {
      const config = { tier: 'standard' };

      const result = verifySignature(config);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not signed');
    });

    it('should reject tampered config', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      // Tamper with config
      signed.tier = 'essential';

      const result = verifySignature(signed);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('tampered');
    });

    it('should reject config with wrong key', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config, 'key1');

      const result = verifySignature(signed, 'key2');

      expect(result.valid).toBe(false);
    });

    it('should verify config with matching key', () => {
      const config = { tier: 'standard' };
      const customKey = 'my-custom-key-12345';
      const signed = signConfig(config, customKey);

      const result = verifySignature(signed, customKey);

      expect(result.valid).toBe(true);
    });

    it('should reject null config', () => {
      const result = verifySignature(null);

      expect(result.valid).toBe(false);
    });
  });

  describe('isSigned()', () => {
    it('should return true for signed config', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      expect(isSigned(signed)).toBe(true);
    });

    it('should return false for unsigned config', () => {
      const config = { tier: 'standard' };

      expect(isSigned(config)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isSigned(null)).toBe(false);
      expect(isSigned(undefined)).toBe(false);
    });
  });

  describe('getSignatureMetadata()', () => {
    it('should return metadata for signed config', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      const metadata = getSignatureMetadata(signed);

      expect(metadata).not.toBeNull();
      expect(metadata.signature).toBe(signed[SIGNATURE_FIELD]);
      expect(metadata.signedAt).toBe(signed[SIGNED_AT_FIELD]);
    });

    it('should return null for unsigned config', () => {
      const config = { tier: 'standard' };

      const metadata = getSignatureMetadata(config);

      expect(metadata).toBeNull();
    });
  });

  describe('stripSignature()', () => {
    it('should remove signature fields', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      const stripped = stripSignature(signed);

      expect(stripped).not.toHaveProperty(SIGNATURE_FIELD);
      expect(stripped).not.toHaveProperty(SIGNED_AT_FIELD);
    });

    it('should preserve other fields', () => {
      const config = { tier: 'standard', version: '1.0.0' };
      const signed = signConfig(config);

      const stripped = stripSignature(signed);

      expect(stripped.tier).toBe('standard');
      expect(stripped.version).toBe('1.0.0');
    });
  });

  describe('parseConfigForSigning()', () => {
    it('should parse simple key-value pairs', () => {
      const content = 'tier: standard\nversion: 1.0.0';
      const parsed = parseConfigForSigning(content);

      expect(parsed.tier).toBe('standard');
      expect(parsed.version).toBe('1.0.0');
    });

    it('should parse arrays', () => {
      const content = 'features:\n  - auth\n  - validators-6';
      const parsed = parseConfigForSigning(content);

      expect(parsed.features).toEqual(['auth', 'validators-6']);
    });

    it('should skip comments', () => {
      const content = '# comment\ntier: standard';
      const parsed = parseConfigForSigning(content);

      expect(parsed.tier).toBe('standard');
      expect(Object.keys(parsed)).not.toContain('#');
    });

    it('should parse booleans', () => {
      const content = 'enabled: true\ndisabled: false';
      const parsed = parseConfigForSigning(content);

      expect(parsed.enabled).toBe(true);
      expect(parsed.disabled).toBe(false);
    });

    it('should parse numbers', () => {
      const content = 'count: 42\nprice: 19.99';
      const parsed = parseConfigForSigning(content);

      expect(parsed.count).toBe(42);
      expect(parsed.price).toBe(19.99);
    });
  });

  describe('validateConfigIntegrity()', () => {
    it('should pass for unsigned config when signature not required', () => {
      const config = { tier: 'standard' };

      const result = validateConfigIntegrity(config, { requireSignature: false });

      expect(result.valid).toBe(true);
      expect(result.warning).toContain('not signed');
    });

    it('should fail for unsigned config when signature required', () => {
      const config = { tier: 'standard' };

      const result = validateConfigIntegrity(config, { requireSignature: true });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be signed');
    });

    it('should pass for valid signed config', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);

      const result = validateConfigIntegrity(signed);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail for tampered signed config', () => {
      const config = { tier: 'standard' };
      const signed = signConfig(config);
      signed.tier = 'essential';

      const result = validateConfigIntegrity(signed);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('rejected');
    });

    it('should fail for null config', () => {
      const result = validateConfigIntegrity(null);

      expect(result.valid).toBe(false);
    });
  });

  describe('File operations', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    describe('signConfigFile()', () => {
      it('should sign an existing config file', () => {
        const configPath = path.join(MOCK_PROJECT_ROOT, 'test-config.yaml');
        fs.writeFileSync(configPath, 'tier: standard\nversion: 1.0.0\n', 'utf8');

        const result = signConfigFile(configPath);

        expect(result.success).toBe(true);

        const content = fs.readFileSync(configPath, 'utf8');
        expect(content).toContain(SIGNATURE_FIELD);
        expect(content).toContain(SIGNED_AT_FIELD);
      });

      it('should fail for non-existent file', () => {
        const configPath = path.join(MOCK_PROJECT_ROOT, 'nonexistent.yaml');

        const result = signConfigFile(configPath);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('verifyConfigFile()', () => {
      it('should verify a signed config file', () => {
        const configPath = path.join(MOCK_PROJECT_ROOT, 'test-config.yaml');
        fs.writeFileSync(configPath, 'tier: standard\nversion: 1.0.0\n', 'utf8');

        signConfigFile(configPath);
        const result = verifyConfigFile(configPath);

        expect(result.valid).toBe(true);
      });

      it('should fail for unsigned config file', () => {
        const configPath = path.join(MOCK_PROJECT_ROOT, 'unsigned-config.yaml');
        fs.writeFileSync(configPath, 'tier: standard\n', 'utf8');

        const result = verifyConfigFile(configPath);

        expect(result.valid).toBe(false);
      });

      it('should fail for non-existent file', () => {
        const configPath = path.join(MOCK_PROJECT_ROOT, 'nonexistent.yaml');

        const result = verifyConfigFile(configPath);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('not found');
      });
    });
  });
});
