/**
 * Unit Tests for Security Configuration Writer - INST-009
 * Epic 2, Story 3 - Security Tier Configuration
 *
 * Tests the security-writer.js functionality for creating and
 * managing security configuration files.
 *
 * @module security-writer.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  SECURITY_CONFIG_PATH,
  CONFIG_VERSION,
  serializeYaml,
  parseYaml,
  getCurrentUserName,
  createSecurityConfig,
  readSecurityConfig,
  ensureSecurityConfigDirectory,
  writeSecurityConfigAtomic,
  validateSecurityConfig,
  applySecurityTier,
  getCurrentTier,
  getCurrentFeatures,
  isSecurityConfigured
} from './security-writer.js';

import { getTierFeatures, getValidatorPaths } from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_security__');
const MOCK_SECURITY_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad/core/security');

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_SECURITY_PATH, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

describe('Security Configuration Writer - INST-009', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('Constants', () => {
    it('should have correct config path', () => {
      expect(SECURITY_CONFIG_PATH).toBe('_bmad/core/security/security-config.yaml');
    });

    it('should have version string', () => {
      expect(CONFIG_VERSION).toBeDefined();
      expect(typeof CONFIG_VERSION).toBe('string');
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

    it('should quote strings with special characters', () => {
      const obj = { path: 'some:path', truthy: 'true' };
      const yaml = serializeYaml(obj);
      expect(yaml).toContain("path: 'some:path'");
      expect(yaml).toContain("truthy: 'true'");
    });
  });

  describe('parseYaml()', () => {
    it('should parse simple key-value pairs', () => {
      const yaml = 'key: value\nnum: 42';
      const result = parseYaml(yaml);
      expect(result.key).toBe('value');
      expect(result.num).toBe(42);
    });

    it('should parse nested objects', () => {
      const yaml = 'outer:\n  inner: value';
      const result = parseYaml(yaml);
      expect(result.outer?.inner).toBe('value');
    });

    it('should parse arrays', () => {
      const yaml = 'items:\n  - a\n  - b\n  - c';
      const result = parseYaml(yaml);
      expect(result.items).toEqual(['a', 'b', 'c']);
    });

    it('should parse booleans', () => {
      const yaml = 'enabled: true\ndisabled: false';
      const result = parseYaml(yaml);
      expect(result.enabled).toBe(true);
      expect(result.disabled).toBe(false);
    });

    it('should parse null values', () => {
      const yaml = 'empty: null';
      const result = parseYaml(yaml);
      expect(result.empty).toBeNull();
    });

    it('should skip comments', () => {
      const yaml = '# comment\nkey: value';
      const result = parseYaml(yaml);
      expect(result.key).toBe('value');
    });

    it('should skip empty lines', () => {
      const yaml = 'key1: value1\n\nkey2: value2';
      const result = parseYaml(yaml);
      expect(result.key1).toBe('value1');
      expect(result.key2).toBe('value2');
    });
  });

  describe('YAML round-trip', () => {
    it('should round-trip simple objects', () => {
      const original = { key: 'value', num: 42, flag: true };
      const yaml = serializeYaml(original);
      const parsed = parseYaml(yaml);
      expect(parsed.key).toBe(original.key);
      expect(parsed.num).toBe(original.num);
      expect(parsed.flag).toBe(original.flag);
    });

    it('should round-trip nested objects', () => {
      const original = {
        metadata: {
          version: '1.0',
          enabled: true
        }
      };
      const yaml = serializeYaml(original);
      const parsed = parseYaml(yaml);
      expect(parsed.metadata?.version).toBe('1.0');
      expect(parsed.metadata?.enabled).toBe(true);
    });

    it('should round-trip arrays', () => {
      const original = { features: ['auth', 'validators-6'] };
      const yaml = serializeYaml(original);
      const parsed = parseYaml(yaml);
      expect(parsed.features).toEqual(original.features);
    });
  });

  describe('getCurrentUserName()', () => {
    it('should return a string', () => {
      const userName = getCurrentUserName();
      expect(typeof userName).toBe('string');
    });

    it('should return non-empty string', () => {
      const userName = getCurrentUserName();
      expect(userName.length).toBeGreaterThan(0);
    });

    it('should not return undefined', () => {
      const userName = getCurrentUserName();
      expect(userName).not.toBe('undefined');
    });
  });

  describe('createSecurityConfig()', () => {
    it('should create config for valid tier', () => {
      const config = createSecurityConfig('standard');
      expect(config).not.toBeNull();
      expect(config.tier).toBe('standard');
    });

    it('should return null for invalid tier', () => {
      const config = createSecurityConfig('invalid');
      expect(config).toBeNull();
    });

    it('should include version', () => {
      const config = createSecurityConfig('standard');
      expect(config.version).toBe(CONFIG_VERSION);
    });

    it('should include tier name', () => {
      const config = createSecurityConfig('standard');
      expect(config.tier_name).toBe('Standard');
    });

    it('should include features array', () => {
      const config = createSecurityConfig('standard');
      expect(Array.isArray(config.features)).toBe(true);
      expect(config.features.length).toBeGreaterThan(0);
    });

    it('should include validators object', () => {
      const config = createSecurityConfig('standard');
      expect(typeof config.validators).toBe('object');
    });

    it('should include metadata', () => {
      const config = createSecurityConfig('standard');
      expect(config.metadata).toBeDefined();
      expect(config.metadata.created_at).toBeDefined();
      expect(config.metadata.updated_at).toBeDefined();
      expect(config.metadata.configured_by).toBeDefined();
    });

    it('should have is_custom false by default', () => {
      const config = createSecurityConfig('standard');
      expect(config.metadata.is_custom).toBe(false);
    });

    it('should use custom features when provided', () => {
      const customFeatures = ['auth'];
      const config = createSecurityConfig('advanced', customFeatures);
      expect(config.features).toEqual(customFeatures);
      expect(config.metadata.is_custom).toBe(true);
    });

    it('should create validators for each feature', () => {
      const config = createSecurityConfig('standard');
      for (const feature of config.features) {
        const paths = getValidatorPaths(feature);
        if (paths.length > 0) {
          expect(config.validators[feature]).toBeDefined();
          expect(config.validators[feature].enabled).toBe(true);
          expect(config.validators[feature].paths).toEqual(paths);
        }
      }
    });
  });

  describe('validateSecurityConfig()', () => {
    it('should validate correct config', () => {
      const config = createSecurityConfig('standard');
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for null config', () => {
      const result = validateSecurityConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for missing version', () => {
      const config = createSecurityConfig('standard');
      delete config.version;
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: version');
    });

    it('should fail for missing tier', () => {
      const config = createSecurityConfig('standard');
      delete config.tier;
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: tier');
    });

    it('should fail for invalid tier', () => {
      const config = createSecurityConfig('standard');
      config.tier = 'invalid';
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid tier'))).toBe(true);
    });

    it('should fail for missing features', () => {
      const config = createSecurityConfig('standard');
      delete config.features;
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: features');
    });

    it('should fail for non-array features', () => {
      const config = createSecurityConfig('standard');
      config.features = 'not-an-array';
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field features must be an array');
    });

    it('should fail for missing metadata', () => {
      const config = createSecurityConfig('standard');
      delete config.metadata;
      const result = validateSecurityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: metadata');
    });
  });

  describe('ensureSecurityConfigDirectory()', () => {
    beforeEach(() => {
      cleanupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create directory if not exists', () => {
      const result = ensureSecurityConfigDirectory(MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
      expect(fs.existsSync(MOCK_SECURITY_PATH)).toBe(true);
    });

    it('should return true if directory exists', () => {
      fs.mkdirSync(MOCK_SECURITY_PATH, { recursive: true });
      const result = ensureSecurityConfigDirectory(MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
    });
  });

  describe('writeSecurityConfigAtomic()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should write file successfully', () => {
      const content = 'test: content';
      const result = writeSecurityConfigAtomic(content, MOCK_PROJECT_ROOT);
      expect(result.success).toBe(true);
    });

    it('should create file with correct content', () => {
      const content = 'tier: standard\nfeatures:\n  - auth';
      writeSecurityConfigAtomic(content, MOCK_PROJECT_ROOT);

      const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
      const written = fs.readFileSync(configPath, 'utf8');
      expect(written).toBe(content);
    });

    it('should not leave temp file on success', () => {
      const content = 'test: content';
      writeSecurityConfigAtomic(content, MOCK_PROJECT_ROOT);

      const tempPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH + '.tmp');
      expect(fs.existsSync(tempPath)).toBe(false);
    });
  });

  describe('readSecurityConfig()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null if config does not exist', () => {
      const config = readSecurityConfig(MOCK_PROJECT_ROOT);
      expect(config).toBeNull();
    });

    it('should read and parse config file', () => {
      const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
      fs.writeFileSync(configPath, 'tier: standard\nversion: 1.0.0', 'utf8');

      const config = readSecurityConfig(MOCK_PROJECT_ROOT);
      expect(config).not.toBeNull();
      expect(config.tier).toBe('standard');
      expect(config.version).toBe('1.0.0');
    });
  });

  describe('applySecurityTier()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should apply valid tier', () => {
      const result = applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      expect(result.success).toBe(true);
      expect(result.path).toContain(SECURITY_CONFIG_PATH);
    });

    it('should fail for invalid tier', () => {
      const result = applySecurityTier('invalid', { projectRoot: MOCK_PROJECT_ROOT });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid tier');
    });

    it('should create config file', () => {
      applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should preserve created_at on update', () => {
      // First apply
      applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      const firstConfig = readSecurityConfig(MOCK_PROJECT_ROOT);
      const originalCreatedAt = firstConfig.metadata?.created_at;

      // Wait a bit and apply again
      applySecurityTier('advanced', { projectRoot: MOCK_PROJECT_ROOT });
      const secondConfig = readSecurityConfig(MOCK_PROJECT_ROOT);

      expect(secondConfig.metadata?.created_at).toBe(originalCreatedAt);
    });

    it('should apply custom features', () => {
      const customFeatures = ['auth'];
      const result = applySecurityTier('advanced', {
        projectRoot: MOCK_PROJECT_ROOT,
        customFeatures
      });

      expect(result.success).toBe(true);
      const config = readSecurityConfig(MOCK_PROJECT_ROOT);
      expect(config.features).toEqual(customFeatures);
      expect(config.metadata?.is_custom).toBe(true);
    });
  });

  describe('getCurrentTier()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return null if not configured', () => {
      const tier = getCurrentTier(MOCK_PROJECT_ROOT);
      expect(tier).toBeNull();
    });

    it('should return current tier ID', () => {
      applySecurityTier('advanced', { projectRoot: MOCK_PROJECT_ROOT });
      const tier = getCurrentTier(MOCK_PROJECT_ROOT);
      expect(tier).toBe('advanced');
    });
  });

  describe('getCurrentFeatures()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty array if not configured', () => {
      const features = getCurrentFeatures(MOCK_PROJECT_ROOT);
      expect(features).toEqual([]);
    });

    it('should return current features', () => {
      applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      const features = getCurrentFeatures(MOCK_PROJECT_ROOT);
      expect(features).toContain('auth');
      expect(features).toContain('validators-6');
    });
  });

  describe('isSecurityConfigured()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return false if not configured', () => {
      const configured = isSecurityConfigured(MOCK_PROJECT_ROOT);
      expect(configured).toBe(false);
    });

    it('should return true if configured', () => {
      applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      const configured = isSecurityConfigured(MOCK_PROJECT_ROOT);
      expect(configured).toBe(true);
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'security-writer.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'security-writer.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should import from tier-definitions.js', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'security-writer.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\/tier-definitions\.js['"]/);
    });
  });
});
