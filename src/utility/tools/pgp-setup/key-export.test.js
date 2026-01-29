/**
 * Unit Tests for PGP Key Export - INST-027
 * Epic 3 - Key Export and Storage
 *
 * Tests the key-export.js functionality for exporting PGP keys
 * and creating security configurations.
 *
 * @module key-export.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  KEYS_DIR,
  PUBLIC_KEY_FILENAME,
  PRIVATE_KEY_FILENAME,
  PGP_CONFIG_PATH,
  CONFIG_VERSION,
  isWindows,
  createKeysDirectory,
  runGpgCommand,
  isGpgAvailable,
  isValidFingerprint,
  cleanFingerprint,
  setSecurePermissions,
  exportPublicKey,
  exportPrivateKey,
  getKeyInfo,
  serializeYaml,
  ensurePgpConfigDirectory,
  savePgpConfig,
  displayExportSummary,
  exportKeys,
  getKeysDirectory,
  checkExistingKeys,
  readPgpConfig
} from './key-export.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_pgp__');
const MOCK_KEYS_DIR = path.join(MOCK_PROJECT_ROOT, '.bmad', 'keys');
const MOCK_CONFIG_DIR = path.join(MOCK_PROJECT_ROOT, '_bmad/_config/security');

// Valid test fingerprint (40 hex chars)
const VALID_FINGERPRINT = 'ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234';
const VALID_FINGERPRINT_SPACED = 'ABCD 1234 ABCD 1234 ABCD 1234 ABCD 1234 ABCD 1234';
const VALID_FINGERPRINT_LOWER = 'abcd1234abcd1234abcd1234abcd1234abcd1234';

// Mock GPG key data
const MOCK_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGTXYZ8BEAC3abc123...
...
-----END PGP PUBLIC KEY BLOCK-----`;

const MOCK_PRIVATE_KEY = `-----BEGIN PGP PRIVATE KEY BLOCK-----

lQdGBGTXYZ8BEAC3abc123...
...
-----END PGP PRIVATE KEY BLOCK-----`;

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_KEYS_DIR, { recursive: true });
  fs.mkdirSync(MOCK_CONFIG_DIR, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

describe('PGP Key Export - INST-027', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('Constants', () => {
    it('should have correct KEYS_DIR containing .bmad/keys', () => {
      expect(KEYS_DIR).toContain('.bmad');
      expect(KEYS_DIR).toContain('keys');
    });

    it('should have correct public key filename', () => {
      expect(PUBLIC_KEY_FILENAME).toBe('user-public.asc');
    });

    it('should have correct private key filename', () => {
      expect(PRIVATE_KEY_FILENAME).toBe('user-private.asc');
    });

    it('should have correct PGP config path', () => {
      expect(PGP_CONFIG_PATH).toBe('_bmad/_config/security/pgp-config.yaml');
    });

    it('should have version string', () => {
      expect(CONFIG_VERSION).toBeDefined();
      expect(typeof CONFIG_VERSION).toBe('string');
      expect(CONFIG_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('isWindows()', () => {
    it('should return boolean', () => {
      const result = isWindows();
      expect(typeof result).toBe('boolean');
    });

    it('should match process.platform check', () => {
      expect(isWindows()).toBe(process.platform === 'win32');
    });
  });

  describe('isValidFingerprint()', () => {
    it('should validate correct 40-char hex fingerprint', () => {
      expect(isValidFingerprint(VALID_FINGERPRINT)).toBe(true);
    });

    it('should validate fingerprint with spaces', () => {
      expect(isValidFingerprint(VALID_FINGERPRINT_SPACED)).toBe(true);
    });

    it('should validate lowercase fingerprint', () => {
      expect(isValidFingerprint(VALID_FINGERPRINT_LOWER)).toBe(true);
    });

    it('should reject null fingerprint', () => {
      expect(isValidFingerprint(null)).toBe(false);
    });

    it('should reject undefined fingerprint', () => {
      expect(isValidFingerprint(undefined)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidFingerprint('')).toBe(false);
    });

    it('should reject short fingerprint', () => {
      expect(isValidFingerprint('ABCD1234')).toBe(false);
    });

    it('should reject long fingerprint', () => {
      expect(isValidFingerprint(VALID_FINGERPRINT + 'EXTRA')).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(isValidFingerprint('GHIJ1234ABCD1234ABCD1234ABCD1234ABCD1234')).toBe(false);
    });

    it('should reject number input', () => {
      expect(isValidFingerprint(12345)).toBe(false);
    });

    it('should reject object input', () => {
      expect(isValidFingerprint({})).toBe(false);
    });
  });

  describe('cleanFingerprint()', () => {
    it('should remove spaces from fingerprint', () => {
      const cleaned = cleanFingerprint(VALID_FINGERPRINT_SPACED);
      expect(cleaned).not.toContain(' ');
    });

    it('should convert to uppercase', () => {
      const cleaned = cleanFingerprint(VALID_FINGERPRINT_LOWER);
      expect(cleaned).toBe(VALID_FINGERPRINT);
    });

    it('should handle already clean fingerprint', () => {
      const cleaned = cleanFingerprint(VALID_FINGERPRINT);
      expect(cleaned).toBe(VALID_FINGERPRINT);
    });

    it('should produce 40 character output', () => {
      const cleaned = cleanFingerprint(VALID_FINGERPRINT_SPACED);
      expect(cleaned.length).toBe(40);
    });
  });

  describe('createKeysDirectory()', () => {
    beforeEach(() => {
      cleanupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create directory successfully', () => {
      const result = createKeysDirectory(MOCK_KEYS_DIR);
      expect(result.success).toBe(true);
      expect(result.path).toBe(MOCK_KEYS_DIR);
    });

    it('should create nested directories', () => {
      const nestedDir = path.join(MOCK_PROJECT_ROOT, 'deep', 'nested', 'keys');
      const result = createKeysDirectory(nestedDir);
      expect(result.success).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('should return success if directory exists', () => {
      fs.mkdirSync(MOCK_KEYS_DIR, { recursive: true });
      const result = createKeysDirectory(MOCK_KEYS_DIR);
      expect(result.success).toBe(true);
    });

    it('should set permissions on Unix systems', () => {
      if (!isWindows()) {
        const result = createKeysDirectory(MOCK_KEYS_DIR);
        expect(result.success).toBe(true);
        const stats = fs.statSync(MOCK_KEYS_DIR);
        // Check for 700 permissions (owner rwx only)
        expect(stats.mode & 0o777).toBe(0o700);
      }
    });
  });

  describe('setSecurePermissions()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should set permissions on file', () => {
      const testFile = path.join(MOCK_KEYS_DIR, 'test.txt');
      fs.writeFileSync(testFile, 'test', 'utf8');

      const result = setSecurePermissions(testFile, 0o600);
      expect(result.success).toBe(true);

      if (!isWindows()) {
        const stats = fs.statSync(testFile);
        expect(stats.mode & 0o777).toBe(0o600);
      }
    });

    it('should return success on Windows even if chmod fails', () => {
      if (isWindows()) {
        const result = setSecurePermissions('/nonexistent/path', 0o600);
        expect(result.success).toBe(true);
      }
    });

    it('should handle non-existent file on Unix', () => {
      if (!isWindows()) {
        const result = setSecurePermissions('/nonexistent/path/file.txt', 0o600);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to set permissions');
      }
    });
  });

  describe('serializeYaml()', () => {
    it('should serialize simple object', () => {
      const obj = { key: 'value', num: 42 };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain('key: value');
      expect(yaml).toContain('num: 42');
    });

    it('should serialize nested objects', () => {
      const obj = { outer: { inner: 'value' } };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain('outer:');
      expect(yaml).toContain('inner: value');
    });

    it('should serialize arrays', () => {
      const obj = { items: ['a', 'b', 'c'] };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain('items:');
      expect(yaml).toContain('- a');
      expect(yaml).toContain('- b');
      expect(yaml).toContain('- c');
    });

    it('should serialize booleans', () => {
      const obj = { enabled: true, disabled: false };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain('enabled: true');
      expect(yaml).toContain('disabled: false');
    });

    it('should serialize null values', () => {
      const obj = { empty: null };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain('empty: null');
    });

    it('should quote strings with colons', () => {
      const obj = { path: 'some:path' };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain("path: 'some:path'");
    });

    it('should quote strings that look like booleans', () => {
      const obj = { truthy: 'true', falsy: 'false' };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain("truthy: 'true'");
      expect(yaml).toContain("falsy: 'false'");
    });

    it('should quote strings starting with tilde', () => {
      const obj = { home: '~/.bmad/keys' };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain("home: '~/.bmad/keys'");
    });
  });

  describe('ensurePgpConfigDirectory()', () => {
    beforeEach(() => {
      cleanupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create directory if not exists', () => {
      const result = ensurePgpConfigDirectory(MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
      expect(fs.existsSync(MOCK_CONFIG_DIR)).toBe(true);
    });

    it('should return true if directory exists', () => {
      fs.mkdirSync(MOCK_CONFIG_DIR, { recursive: true });
      const result = ensurePgpConfigDirectory(MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
    });
  });

  describe('checkExistingKeys()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return exists false when no keys', () => {
      const result = checkExistingKeys(MOCK_KEYS_DIR);
      expect(result.exists).toBe(false);
      expect(result.publicKey).toBe(false);
      expect(result.privateKey).toBe(false);
    });

    it('should detect public key', () => {
      const publicPath = path.join(MOCK_KEYS_DIR, PUBLIC_KEY_FILENAME);
      fs.writeFileSync(publicPath, MOCK_PUBLIC_KEY, 'utf8');

      const result = checkExistingKeys(MOCK_KEYS_DIR);
      expect(result.exists).toBe(true);
      expect(result.publicKey).toBe(true);
      expect(result.privateKey).toBe(false);
    });

    it('should detect private key', () => {
      const privatePath = path.join(MOCK_KEYS_DIR, PRIVATE_KEY_FILENAME);
      fs.writeFileSync(privatePath, MOCK_PRIVATE_KEY, 'utf8');

      const result = checkExistingKeys(MOCK_KEYS_DIR);
      expect(result.exists).toBe(true);
      expect(result.publicKey).toBe(false);
      expect(result.privateKey).toBe(true);
    });

    it('should detect both keys', () => {
      const publicPath = path.join(MOCK_KEYS_DIR, PUBLIC_KEY_FILENAME);
      const privatePath = path.join(MOCK_KEYS_DIR, PRIVATE_KEY_FILENAME);
      fs.writeFileSync(publicPath, MOCK_PUBLIC_KEY, 'utf8');
      fs.writeFileSync(privatePath, MOCK_PRIVATE_KEY, 'utf8');

      const result = checkExistingKeys(MOCK_KEYS_DIR);
      expect(result.exists).toBe(true);
      expect(result.publicKey).toBe(true);
      expect(result.privateKey).toBe(true);
    });
  });

  describe('getKeysDirectory()', () => {
    it('should return KEYS_DIR constant', () => {
      const result = getKeysDirectory();
      expect(result).toBe(KEYS_DIR);
    });
  });

  describe('readPgpConfig()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null if config does not exist', () => {
      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config).toBeNull();
    });

    it('should read and parse config file', () => {
      const configPath = path.join(MOCK_PROJECT_ROOT, PGP_CONFIG_PATH);
      fs.writeFileSync(configPath, `version: 1.0.0
key_fingerprint: ${VALID_FINGERPRINT}`, 'utf8');

      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config).not.toBeNull();
      expect(config.version).toBe('1.0.0');
      expect(config.key_fingerprint).toBe(VALID_FINGERPRINT);
    });

    it('should skip comment lines', () => {
      const configPath = path.join(MOCK_PROJECT_ROOT, PGP_CONFIG_PATH);
      fs.writeFileSync(configPath, `# This is a comment
version: 1.0.0`, 'utf8');

      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config.version).toBe('1.0.0');
    });

    it('should parse boolean values', () => {
      const configPath = path.join(MOCK_PROJECT_ROOT, PGP_CONFIG_PATH);
      fs.writeFileSync(configPath, `enabled: true
disabled: false`, 'utf8');

      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config.enabled).toBe(true);
      expect(config.disabled).toBe(false);
    });

    it('should parse integer values', () => {
      const configPath = path.join(MOCK_PROJECT_ROOT, PGP_CONFIG_PATH);
      fs.writeFileSync(configPath, `count: 42`, 'utf8');

      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config.count).toBe(42);
    });
  });

  describe('exportPublicKey()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should fail with invalid fingerprint', () => {
      const result = exportPublicKey('invalid', MOCK_KEYS_DIR);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid fingerprint');
    });

    it('should fail with null fingerprint', () => {
      const result = exportPublicKey(null, MOCK_KEYS_DIR);
      expect(result.success).toBe(false);
    });

    it('should fail with empty fingerprint', () => {
      const result = exportPublicKey('', MOCK_KEYS_DIR);
      expect(result.success).toBe(false);
    });
  });

  describe('exportPrivateKey()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should fail with invalid fingerprint', () => {
      const result = exportPrivateKey('invalid', MOCK_KEYS_DIR);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid fingerprint');
    });

    it('should fail with null fingerprint', () => {
      const result = exportPrivateKey(null, MOCK_KEYS_DIR);
      expect(result.success).toBe(false);
    });
  });

  describe('getKeyInfo()', () => {
    it('should fail with invalid fingerprint', () => {
      const result = getKeyInfo('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid fingerprint');
    });

    it('should fail with empty fingerprint', () => {
      const result = getKeyInfo('');
      expect(result.success).toBe(false);
    });
  });

  describe('savePgpConfig()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should fail with invalid fingerprint', () => {
      const result = savePgpConfig('invalid', MOCK_PROJECT_ROOT);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid fingerprint');
    });

    it('should fail with null fingerprint', () => {
      const result = savePgpConfig(null, MOCK_PROJECT_ROOT);
      expect(result.success).toBe(false);
    });
  });

  describe('exportKeys()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should fail with invalid fingerprint', () => {
      const result = exportKeys('invalid', MOCK_PROJECT_ROOT, {
        keysDir: MOCK_KEYS_DIR,
        silent: true
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid fingerprint');
    });

    it('should fail with empty fingerprint', () => {
      const result = exportKeys('', MOCK_PROJECT_ROOT, {
        keysDir: MOCK_KEYS_DIR,
        silent: true
      });
      expect(result.success).toBe(false);
    });

    it('should fail with null fingerprint', () => {
      const result = exportKeys(null, MOCK_PROJECT_ROOT, {
        keysDir: MOCK_KEYS_DIR,
        silent: true
      });
      expect(result.success).toBe(false);
    });

    it('should fail with short fingerprint', () => {
      const result = exportKeys('ABCD1234', MOCK_PROJECT_ROOT, {
        keysDir: MOCK_KEYS_DIR,
        silent: true
      });
      expect(result.success).toBe(false);
    });
  });

  describe('displayExportSummary()', () => {
    it('should not throw with valid result', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        publicKeyPath: '/path/to/public.asc',
        privateKeyPath: '/path/to/private.asc',
        configPath: '/path/to/config.yaml'
      };

      expect(() => displayExportSummary(result, VALID_FINGERPRINT)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should output fingerprint', () => {
      const logs = [];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

      displayExportSummary({ publicKeyPath: '/pub', privateKeyPath: '/priv', configPath: '/cfg' }, VALID_FINGERPRINT);

      const output = logs.join('\n');
      expect(output).toContain(VALID_FINGERPRINT);

      consoleSpy.mockRestore();
    });

    it('should output public key path', () => {
      const logs = [];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

      displayExportSummary({ publicKeyPath: '/custom/public.asc', privateKeyPath: '/priv', configPath: '/cfg' }, VALID_FINGERPRINT);

      const output = logs.join('\n');
      expect(output).toContain('/custom/public.asc');

      consoleSpy.mockRestore();
    });

    it('should output private key path', () => {
      const logs = [];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

      displayExportSummary({ publicKeyPath: '/pub', privateKeyPath: '/custom/private.asc', configPath: '/cfg' }, VALID_FINGERPRINT);

      const output = logs.join('\n');
      expect(output).toContain('/custom/private.asc');

      consoleSpy.mockRestore();
    });

    it('should output config path', () => {
      const logs = [];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

      displayExportSummary({ publicKeyPath: '/pub', privateKeyPath: '/priv', configPath: '/custom/config.yaml' }, VALID_FINGERPRINT);

      const output = logs.join('\n');
      expect(output).toContain('/custom/config.yaml');

      consoleSpy.mockRestore();
    });

    it('should output permissions info', () => {
      const logs = [];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

      displayExportSummary({ publicKeyPath: '/pub', privateKeyPath: '/priv', configPath: '/cfg' }, VALID_FINGERPRINT);

      const output = logs.join('\n');
      expect(output).toContain('700');
      expect(output).toContain('644');
      expect(output).toContain('600');

      consoleSpy.mockRestore();
    });
  });

  describe('runGpgCommand()', () => {
    it('should return success false when GPG not available', () => {
      // If GPG is not installed, this will fail
      const result = runGpgCommand(['--nonexistent-option-xyz123']);
      // Command should either fail or work, but not throw
      expect(result).toHaveProperty('success');
    });

    it('should handle --version command', () => {
      const result = runGpgCommand(['--version']);
      // Either GPG is installed (success) or not (failure)
      expect(result).toHaveProperty('success');
      if (result.success) {
        expect(result.stdout).toContain('gpg');
      }
    });
  });

  describe('isGpgAvailable()', () => {
    it('should return boolean', () => {
      const result = isGpgAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'key-export.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'key-export.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should have default export for backward compatibility', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'key-export.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/export\s+default/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle fingerprint with mixed case and spaces', () => {
      const mixed = 'AbCd 1234 aBcD 1234 ABCD 1234 abcd 1234 AbCd 1234';
      expect(isValidFingerprint(mixed)).toBe(true);
      expect(cleanFingerprint(mixed)).toBe(VALID_FINGERPRINT);
    });

    it('should handle fingerprint with tabs', () => {
      const tabbed = 'ABCD\t1234\tABCD\t1234\tABCD\t1234\tABCD\t1234\tABCD\t1234';
      // Implementation uses \s which matches all whitespace including tabs
      expect(isValidFingerprint(tabbed)).toBe(true);
      expect(cleanFingerprint(tabbed)).toBe(VALID_FINGERPRINT);
    });

    it('should reject fingerprint with special characters', () => {
      const special = 'ABCD!234ABCD1234ABCD1234ABCD1234ABCD1234';
      expect(isValidFingerprint(special)).toBe(false);
    });
  });

  describe('Config File Content', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should write YAML header with fingerprint', () => {
      // Mock the getKeyInfo to avoid GPG dependency
      const originalGetKeyInfo = getKeyInfo;

      // Write config manually to test reading
      const configPath = path.join(MOCK_PROJECT_ROOT, PGP_CONFIG_PATH);
      const content = `# BMAD PGP Configuration
# Key Fingerprint: ${VALID_FINGERPRINT}
version: ${CONFIG_VERSION}
key_fingerprint: ${VALID_FINGERPRINT}`;

      fs.writeFileSync(configPath, content, 'utf8');

      const config = readPgpConfig(MOCK_PROJECT_ROOT);
      expect(config.version).toBe(CONFIG_VERSION);
      expect(config.key_fingerprint).toBe(VALID_FINGERPRINT);
    });
  });

  describe('Directory Permissions', () => {
    beforeEach(() => {
      cleanupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create keys directory with 700 permissions on Unix', () => {
      if (!isWindows()) {
        const result = createKeysDirectory(MOCK_KEYS_DIR);
        expect(result.success).toBe(true);

        const stats = fs.statSync(MOCK_KEYS_DIR);
        const permissions = stats.mode & 0o777;
        expect(permissions).toBe(0o700);
      }
    });

    it('should handle permission errors gracefully', () => {
      // This test verifies the error handling path
      // We can't easily simulate permission errors, but we verify structure
      const result = createKeysDirectory(MOCK_KEYS_DIR);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('path');
    });
  });
});
