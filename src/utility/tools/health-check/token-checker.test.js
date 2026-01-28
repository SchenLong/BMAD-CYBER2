/**
 * Unit Tests for Token Validity Checker - INST-020
 * Epic 4 - Post-Install Health Check
 *
 * Tests the token-checker.js functionality for validating
 * BMAD authentication tokens.
 *
 * @module health-check/token-checker.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  TOKEN_PATH,
  KEY_PATH,
  TOKEN_PREFIX,
  EXPIRATION_WARNING_THRESHOLD_MS,
  REQUIRED_TOKEN_FIELDS,
  TOKEN_STATUS,
  checkTokenFilesExist,
  readKeyFile,
  readTokenFile,
  decryptToken,
  validateTokenStructure,
  checkExpiration,
  formatDuration,
  extractRole,
  extractUserId,
  checkToken
} from './token-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a valid encrypted token for testing
 * @param {Buffer} key - 32-byte encryption key
 * @param {object} claims - Token claims to encrypt
 * @returns {string} Encrypted token string
 */
function createTestToken(key, claims) {
  const plaintext = JSON.stringify(claims);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return TOKEN_PREFIX + combined.toString('base64url');
}

/**
 * Create test token claims
 * @param {object} overrides - Override default claims
 * @returns {object} Token claims
 */
function createTestClaims(overrides = {}) {
  const now = new Date();
  const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  return {
    sub: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['admin'],
    modules: ['core', 'intel-team'],
    iat: now.toISOString(),
    exp: exp.toISOString(),
    jti: crypto.randomUUID(),
    ...overrides
  };
}

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Token Checker - INST-020', () => {
  describe('Constants', () => {
    it('should have correct TOKEN_PATH', () => {
      expect(TOKEN_PATH).toBe('.bmad-token');
    });

    it('should have correct KEY_PATH', () => {
      expect(KEY_PATH).toBe('.bmad-key');
    });

    it('should have correct TOKEN_PREFIX', () => {
      expect(TOKEN_PREFIX).toBe('bmad.v1.');
    });

    it('should have 24-hour warning threshold', () => {
      expect(EXPIRATION_WARNING_THRESHOLD_MS).toBe(24 * 60 * 60 * 1000);
    });

    it('should have required token fields', () => {
      expect(REQUIRED_TOKEN_FIELDS).toContain('sub');
      expect(REQUIRED_TOKEN_FIELDS).toContain('roles');
      expect(REQUIRED_TOKEN_FIELDS).toContain('modules');
      expect(REQUIRED_TOKEN_FIELDS).toContain('exp');
    });

    it('should have all token statuses', () => {
      expect(TOKEN_STATUS.VALID).toBe('valid');
      expect(TOKEN_STATUS.EXPIRED).toBe('expired');
      expect(TOKEN_STATUS.INVALID).toBe('invalid');
      expect(TOKEN_STATUS.MISSING).toBe('missing');
    });
  });

  // ============================================================================
  // Tests: decryptToken
  // ============================================================================

  describe('decryptToken()', () => {
    const key = crypto.randomBytes(32);

    it('should decrypt valid token', () => {
      const claims = createTestClaims();
      const token = createTestToken(key, claims);

      const result = decryptToken(token, key);

      expect(result.success).toBe(true);
      expect(result.claims.sub).toBe(claims.sub);
      expect(result.claims.roles).toEqual(claims.roles);
      expect(result.error).toBeNull();
    });

    it('should fail for token without prefix', () => {
      const result = decryptToken('invalid-token', key);

      expect(result.success).toBe(false);
      expect(result.claims).toBeNull();
      expect(result.error).toContain('prefix');
    });

    it('should fail for null token', () => {
      const result = decryptToken(null, key);

      expect(result.success).toBe(false);
      expect(result.error).toContain('prefix');
    });

    it('should fail for invalid key length', () => {
      const shortKey = crypto.randomBytes(16);
      const claims = createTestClaims();
      const token = createTestToken(key, claims);

      const result = decryptToken(token, shortKey);

      expect(result.success).toBe(false);
      expect(result.error).toContain('32 bytes');
    });

    it('should fail for wrong key', () => {
      const claims = createTestClaims();
      const token = createTestToken(key, claims);
      const wrongKey = crypto.randomBytes(32);

      const result = decryptToken(token, wrongKey);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Decryption failed');
    });

    it('should fail for too short payload', () => {
      const shortPayload = TOKEN_PREFIX + Buffer.from('short').toString('base64url');

      const result = decryptToken(shortPayload, key);

      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  // ============================================================================
  // Tests: validateTokenStructure
  // ============================================================================

  describe('validateTokenStructure()', () => {
    it('should validate complete claims', () => {
      const claims = createTestClaims();

      const result = validateTokenStructure(claims);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should report missing sub field', () => {
      const claims = createTestClaims();
      delete claims.sub;

      const result = validateTokenStructure(claims);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('sub');
    });

    it('should report missing roles field', () => {
      const claims = createTestClaims();
      delete claims.roles;

      const result = validateTokenStructure(claims);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('roles');
    });

    it('should report multiple missing fields', () => {
      const claims = { name: 'Test' };

      const result = validateTokenStructure(claims);

      expect(result.valid).toBe(false);
      expect(result.missingFields.length).toBeGreaterThan(1);
    });

    it('should fail for null claims', () => {
      const result = validateTokenStructure(null);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toEqual(REQUIRED_TOKEN_FIELDS);
    });

    it('should fail for non-object claims', () => {
      const result = validateTokenStructure('string');

      expect(result.valid).toBe(false);
    });
  });

  // ============================================================================
  // Tests: checkExpiration
  // ============================================================================

  describe('checkExpiration()', () => {
    it('should return not expired for future date', () => {
      const now = new Date();
      const futureExp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const claims = { exp: futureExp.toISOString() };

      const result = checkExpiration(claims, now);

      expect(result.expired).toBe(false);
      expect(result.expiresAt).toEqual(futureExp);
      expect(result.expiresIn).toBeTruthy();
    });

    it('should return expired for past date', () => {
      const now = new Date();
      const pastExp = new Date(now.getTime() - 1000);
      const claims = { exp: pastExp.toISOString() };

      const result = checkExpiration(claims, now);

      expect(result.expired).toBe(true);
      expect(result.expiresIn).toBeNull();
    });

    it('should detect warning threshold (within 24 hours)', () => {
      const now = new Date();
      const soonExp = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
      const claims = { exp: soonExp.toISOString() };

      const result = checkExpiration(claims, now);

      expect(result.expired).toBe(false);
      expect(result.warningThresholdReached).toBe(true);
    });

    it('should not warn if more than 24 hours', () => {
      const now = new Date();
      const laterExp = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      const claims = { exp: laterExp.toISOString() };

      const result = checkExpiration(claims, now);

      expect(result.warningThresholdReached).toBe(false);
    });

    it('should handle missing exp field', () => {
      const result = checkExpiration({});

      expect(result.expired).toBe(true);
      expect(result.expiresAt).toBeNull();
    });

    it('should handle invalid date string', () => {
      const claims = { exp: 'not-a-date' };

      const result = checkExpiration(claims);

      expect(result.expired).toBe(true);
      expect(result.expiresAt).toBeNull();
    });
  });

  // ============================================================================
  // Tests: formatDuration
  // ============================================================================

  describe('formatDuration()', () => {
    it('should format days correctly', () => {
      const ms = 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000; // 6 days 23 hours

      const result = formatDuration(ms);

      expect(result).toContain('6 days');
      expect(result).toContain('23 hours');
    });

    it('should format hours correctly', () => {
      const ms = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours 30 minutes

      const result = formatDuration(ms);

      expect(result).toContain('5 hours');
      expect(result).toContain('30 minutes');
    });

    it('should format minutes and seconds for short durations', () => {
      const ms = 45 * 60 * 1000 + 30 * 1000; // 45 minutes 30 seconds

      const result = formatDuration(ms);

      expect(result).toContain('45 minutes');
      expect(result).toContain('30 seconds');
    });

    it('should return 0 seconds for zero or negative', () => {
      expect(formatDuration(0)).toBe('0 seconds');
      expect(formatDuration(-1000)).toBe('0 seconds');
    });

    it('should use singular for 1 day', () => {
      const ms = 1 * 24 * 60 * 60 * 1000;

      const result = formatDuration(ms);

      expect(result).toContain('1 day');
      expect(result).not.toContain('1 days');
    });

    it('should use singular for 1 hour', () => {
      const ms = 1 * 60 * 60 * 1000;

      const result = formatDuration(ms);

      expect(result).toContain('1 hour');
      expect(result).not.toContain('1 hours');
    });
  });

  // ============================================================================
  // Tests: extractRole and extractUserId
  // ============================================================================

  describe('extractRole()', () => {
    it('should extract first role from roles array', () => {
      const claims = { roles: ['admin', 'developer'] };

      expect(extractRole(claims)).toBe('admin');
    });

    it('should extract single role string', () => {
      const claims = { role: 'viewer' };

      expect(extractRole(claims)).toBe('viewer');
    });

    it('should prefer role over roles', () => {
      const claims = { role: 'viewer', roles: ['admin'] };

      expect(extractRole(claims)).toBe('viewer');
    });

    it('should return null for empty roles', () => {
      const claims = { roles: [] };

      expect(extractRole(claims)).toBeNull();
    });

    it('should return null for null claims', () => {
      expect(extractRole(null)).toBeNull();
    });
  });

  describe('extractUserId()', () => {
    it('should extract sub field', () => {
      const claims = { sub: 'user-123' };

      expect(extractUserId(claims)).toBe('user-123');
    });

    it('should extract userId field', () => {
      const claims = { userId: 'user-456' };

      expect(extractUserId(claims)).toBe('user-456');
    });

    it('should prefer sub over userId', () => {
      const claims = { sub: 'user-123', userId: 'user-456' };

      expect(extractUserId(claims)).toBe('user-123');
    });

    it('should return null for null claims', () => {
      expect(extractUserId(null)).toBeNull();
    });
  });

  // ============================================================================
  // Tests: checkToken (Integration)
  // ============================================================================

  describe('checkToken()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-test-'));
    });

    afterEach(() => {
      try {
        fs.rmSync(tempDir, { recursive: true });
      } catch {}
    });

    it('should return missing when both files absent', () => {
      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('missing');
      expect(result.error).toContain('Both token and key files are missing');
    });

    it('should return missing when token file absent', () => {
      const key = crypto.randomBytes(32);
      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('missing');
      expect(result.error).toContain('Token file missing');
    });

    it('should return missing when key file absent', () => {
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), 'bmad.v1.test');

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('missing');
      expect(result.error).toContain('Key file missing');
    });

    it('should return invalid for wrong key size', () => {
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), 'bmad.v1.test');
      fs.writeFileSync(path.join(tempDir, KEY_PATH), Buffer.from('shortkey'));

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('invalid');
      expect(result.error).toContain('32 bytes');
    });

    it('should return valid for correct token', () => {
      const key = crypto.randomBytes(32);
      const claims = createTestClaims();
      const token = createTestToken(key, claims);

      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), token);

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('valid');
      expect(result.role).toBe('admin');
      expect(result.userId).toBe('test-user-123');
      expect(result.expiresIn).toBeTruthy();
      expect(result.error).toBeNull();
    });

    it('should return expired for expired token', () => {
      const key = crypto.randomBytes(32);
      const pastDate = new Date(Date.now() - 1000);
      const claims = createTestClaims({ exp: pastDate.toISOString() });
      const token = createTestToken(key, claims);

      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), token);

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('expired');
      expect(result.warnings).toContain('Token has expired');
    });

    it('should warn when token expires within 24 hours', () => {
      const key = crypto.randomBytes(32);
      const soonDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
      const claims = createTestClaims({ exp: soonDate.toISOString() });
      const token = createTestToken(key, claims);

      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), token);

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('valid');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('24 hours');
    });

    it('should return invalid for malformed token', () => {
      const key = crypto.randomBytes(32);

      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), 'bmad.v1.invalidpayload');

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('invalid');
    });

    it('should return invalid for empty token file', () => {
      const key = crypto.randomBytes(32);

      fs.writeFileSync(path.join(tempDir, KEY_PATH), key);
      fs.writeFileSync(path.join(tempDir, TOKEN_PATH), '');

      const result = checkToken({ basePath: tempDir });

      expect(result.status).toBe('invalid');
      expect(result.error).toContain('empty');
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require)', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'token-checker.js'),
        'utf8'
      );

      // Check no CommonJS patterns
      expect(moduleContent.includes('module.exports')).toBe(false);
      expect(moduleContent.includes('require(')).toBe(false);
    });

    it('should use import statements', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'token-checker.js'),
        'utf8'
      );

      // Check for ESM patterns
      expect(moduleContent.includes('import ')).toBe(true);
      expect(moduleContent.includes('export ')).toBe(true);
    });
  });
});
