/**
 * Unit Tests for Security Validator Status Checker - INST-022
 * Epic 4 - Post-Install Health Check
 *
 * Tests the security-checker.js functionality for checking security
 * configuration status and validator health.
 *
 * @module security-checker.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  VALIDATORS_PATH,
  GUARDS_PATH,
  SECURITY_CONFIG_PATH,
  AUDIT_LOG_PATH,
  SecurityStatus,
  readSecurityConfig,
  listEnabledValidators,
  testValidatorLoad,
  checkValidator,
  checkAllValidators,
  getSecurityTier,
  checkAuditLogging,
  checkSecurity,
  formatSecurityResult
} from './security-checker.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_security_checker__');
const MOCK_SECURITY_PATH = path.join(MOCK_PROJECT_ROOT, 'src/core/security');
const MOCK_VALIDATORS_PATH = path.join(MOCK_PROJECT_ROOT, '.claude/validators-node/src/guards');
const MOCK_AUDIT_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad/framework/dist/audit');

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_SECURITY_PATH, { recursive: true });
  fs.mkdirSync(MOCK_VALIDATORS_PATH, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

function writeSecurityConfig(config) {
  const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });

  // Simple YAML serializer for tests
  const lines = [];
  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        if (typeof v === 'object' && v !== null) {
          lines.push(`  ${k}:`);
          for (const [k2, v2] of Object.entries(v)) {
            if (Array.isArray(v2)) {
              lines.push(`    ${k2}:`);
              for (const item of v2) {
                lines.push(`      - ${item}`);
              }
            } else {
              lines.push(`    ${k2}: ${v2}`);
            }
          }
        } else {
          lines.push(`  ${k}: ${v}`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  fs.writeFileSync(configPath, lines.join('\n'), 'utf8');
}

function createMockValidator(validatorPath, content = 'export default function() {}') {
  const fullPath = path.join(MOCK_PROJECT_ROOT, validatorPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

describe('Security Checker - INST-022', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('Constants', () => {
    it('should export VALIDATORS_PATH', () => {
      expect(VALIDATORS_PATH).toBe('_bmad/framework/validators/');
    });

    it('should export GUARDS_PATH', () => {
      expect(GUARDS_PATH).toBe('.claude/validators-node/src/guards/');
    });

    it('should export SECURITY_CONFIG_PATH', () => {
      expect(SECURITY_CONFIG_PATH).toBe('src/core/security/security-config.yaml');
    });

    it('should export AUDIT_LOG_PATH', () => {
      expect(AUDIT_LOG_PATH).toBe('_bmad/framework/dist/audit/');
    });

    it('should export SecurityStatus enum', () => {
      expect(SecurityStatus.HEALTHY).toBe('healthy');
      expect(SecurityStatus.DEGRADED).toBe('degraded');
      expect(SecurityStatus.UNHEALTHY).toBe('unhealthy');
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
      writeSecurityConfig({ tier: 'standard', version: '1.0.0' });

      const config = readSecurityConfig(MOCK_PROJECT_ROOT);
      expect(config).not.toBeNull();
      expect(config.tier).toBe('standard');
      expect(config.version).toBe('1.0.0');
    });

    it('should parse features array', () => {
      writeSecurityConfig({
        tier: 'standard',
        features: ['auth', 'validators-6']
      });

      const config = readSecurityConfig(MOCK_PROJECT_ROOT);
      expect(config.features).toEqual(['auth', 'validators-6']);
    });
  });

  describe('listEnabledValidators()', () => {
    it('should return empty array for null config', () => {
      const validators = listEnabledValidators(null);
      expect(validators).toEqual([]);
    });

    it('should return empty array for config without validators', () => {
      const validators = listEnabledValidators({ tier: 'standard' });
      expect(validators).toEqual([]);
    });

    it('should extract enabled validators', () => {
      const config = {
        validators: {
          auth: { enabled: true, paths: ['src/core/security/authorization.js'] },
          rbac: { enabled: false, paths: ['src/core/security/rbac-config.yaml'] }
        }
      };

      const validators = listEnabledValidators(config);
      expect(validators).toHaveLength(1);
      expect(validators[0].name).toBe('auth');
      expect(validators[0].paths).toEqual(['src/core/security/authorization.js']);
    });

    it('should handle string path as array', () => {
      const config = {
        validators: {
          auth: { enabled: true, paths: 'src/core/security/authorization.js' }
        }
      };

      const validators = listEnabledValidators(config);
      expect(validators[0].paths).toEqual(['src/core/security/authorization.js']);
    });
  });

  describe('testValidatorLoad()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return loadable false for non-existent file', () => {
      const result = testValidatorLoad('nonexistent.js', MOCK_PROJECT_ROOT);
      expect(result.loadable).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should return loadable true for existing JS file', () => {
      createMockValidator('.claude/validators-node/src/guards/test.js');

      const result = testValidatorLoad('.claude/validators-node/src/guards/test.js', MOCK_PROJECT_ROOT);
      expect(result.loadable).toBe(true);
    });

    it('should return loadable true for non-JS files that exist', () => {
      const yamlPath = 'src/core/security/rbac-config.yaml';
      const fullPath = path.join(MOCK_PROJECT_ROOT, yamlPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, 'roles:\n  - admin', 'utf8');

      const result = testValidatorLoad(yamlPath, MOCK_PROJECT_ROOT);
      expect(result.loadable).toBe(true);
    });

    it('should detect syntax errors in CommonJS modules', () => {
      createMockValidator('.claude/validators-node/src/guards/bad.js', 'function( { invalid syntax');

      const result = testValidatorLoad('.claude/validators-node/src/guards/bad.js', MOCK_PROJECT_ROOT);
      expect(result.loadable).toBe(false);
      expect(result.error).toContain('Syntax error');
    });

    it('should allow ESM modules even when Function constructor fails', () => {
      createMockValidator('.claude/validators-node/src/guards/esm.js',
        'import fs from "fs";\nexport default function() {}');

      const result = testValidatorLoad('.claude/validators-node/src/guards/esm.js', MOCK_PROJECT_ROOT);
      expect(result.loadable).toBe(true);
    });
  });

  describe('checkValidator()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should check multiple paths for a validator', () => {
      createMockValidator('.claude/validators-node/src/guards/bash-safety.js');

      const result = checkValidator('validators-6', [
        '.claude/validators-node/src/guards/bash-safety.js',
        '.claude/validators-node/src/guards/env-protection.js'
      ], MOCK_PROJECT_ROOT);

      expect(result.name).toBe('validators-6');
      expect(result.results).toHaveLength(2);
      expect(result.results[0].loadable).toBe(true);
      expect(result.results[1].loadable).toBe(false);
    });
  });

  describe('checkAllValidators()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty arrays if no config', () => {
      const { enabledValidators, failedValidators } = checkAllValidators(MOCK_PROJECT_ROOT);
      expect(enabledValidators).toEqual([]);
      expect(failedValidators).toEqual([]);
    });

    it('should categorize validators correctly', () => {
      writeSecurityConfig({
        tier: 'standard',
        validators: {
          auth: {
            enabled: true,
            paths: ['src/core/security/authorization.js']
          }
        }
      });
      createMockValidator('src/core/security/authorization.js');

      const { enabledValidators, failedValidators } = checkAllValidators(MOCK_PROJECT_ROOT);
      expect(enabledValidators).toHaveLength(1);
      expect(enabledValidators[0].name).toBe('auth');
      expect(failedValidators).toHaveLength(0);
    });

    it('should report failed validators', () => {
      writeSecurityConfig({
        tier: 'standard',
        validators: {
          auth: {
            enabled: true,
            paths: ['src/core/security/missing.js']
          }
        }
      });

      const { enabledValidators, failedValidators } = checkAllValidators(MOCK_PROJECT_ROOT);
      expect(enabledValidators).toHaveLength(0);
      expect(failedValidators).toHaveLength(1);
      expect(failedValidators[0].name).toBe('auth');
      expect(failedValidators[0].error).toContain('File not found');
    });
  });

  describe('getSecurityTier()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return unconfigured if no config', () => {
      const { tier, tierDescription } = getSecurityTier(MOCK_PROJECT_ROOT);
      expect(tier).toBe('unconfigured');
      expect(tierDescription).toBeNull();
    });

    it('should return tier from config', () => {
      writeSecurityConfig({ tier: 'standard' });

      const { tier, tierDescription } = getSecurityTier(MOCK_PROJECT_ROOT);
      expect(tier).toBe('standard');
      expect(tierDescription).toBe('Recommended baseline - includes all 6 standard validators.');
    });

    it('should return description for all tiers', () => {
      for (const tierName of ['essential', 'standard', 'advanced', 'enterprise', 'beta']) {
        writeSecurityConfig({ tier: tierName });
        const { tier, tierDescription } = getSecurityTier(MOCK_PROJECT_ROOT);
        expect(tier).toBe(tierName);
        expect(tierDescription).toBeTruthy();
      }
    });
  });

  describe('checkAuditLogging()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should report disabled if no config', () => {
      const result = checkAuditLogging(MOCK_PROJECT_ROOT);
      expect(result.enabled).toBe(false);
      expect(result.logPath).toBeNull();
    });

    it('should report disabled if feature enabled but directory missing', () => {
      writeSecurityConfig({
        tier: 'enterprise',
        features: ['audit-logging']
      });

      const result = checkAuditLogging(MOCK_PROJECT_ROOT);
      expect(result.enabled).toBe(false);
    });

    it('should report enabled if feature and directory exist', () => {
      writeSecurityConfig({
        tier: 'enterprise',
        features: ['audit-logging']
      });
      fs.mkdirSync(MOCK_AUDIT_PATH, { recursive: true });

      const result = checkAuditLogging(MOCK_PROJECT_ROOT);
      expect(result.enabled).toBe(true);
      // The logPath may have a trailing slash from path.join
      expect(result.logPath).toContain('_bmad/framework/dist/audit');
    });
  });

  describe('checkSecurity()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return unhealthy if not configured', () => {
      const result = checkSecurity(MOCK_PROJECT_ROOT);
      expect(result.status).toBe(SecurityStatus.UNHEALTHY);
      expect(result.tier).toBe('unconfigured');
      expect(result.warnings).toContain('Security is not configured. Run the security configuration wizard.');
    });

    it('should return healthy for properly configured security', () => {
      writeSecurityConfig({
        tier: 'standard',
        validators: {
          auth: { enabled: true, paths: ['src/core/security/authorization.js'] }
        }
      });
      createMockValidator('src/core/security/authorization.js');

      const result = checkSecurity(MOCK_PROJECT_ROOT);
      expect(result.status).toBe(SecurityStatus.HEALTHY);
      expect(result.tier).toBe('standard');
    });

    it('should return degraded when validators fail to load', () => {
      writeSecurityConfig({
        tier: 'standard',
        validators: {
          auth: { enabled: true, paths: ['src/core/security/missing.js'] }
        }
      });

      const result = checkSecurity(MOCK_PROJECT_ROOT);
      expect(result.status).toBe(SecurityStatus.DEGRADED);
      expect(result.failedValidators.length).toBeGreaterThan(0);
    });

    it('should warn about enterprise tier without audit logging', () => {
      writeSecurityConfig({
        tier: 'enterprise',
        validators: {
          auth: { enabled: true, paths: ['src/core/security/authorization.js'] }
        }
      });
      createMockValidator('src/core/security/authorization.js');

      const result = checkSecurity(MOCK_PROJECT_ROOT);
      expect(result.warnings).toContain('Enterprise/Beta tier configured but audit logging is not enabled or audit directory is missing.');
    });

    it('should include all expected fields in result', () => {
      writeSecurityConfig({ tier: 'standard' });

      const result = checkSecurity(MOCK_PROJECT_ROOT);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('tierDescription');
      expect(result).toHaveProperty('enabledValidators');
      expect(result).toHaveProperty('failedValidators');
      expect(result).toHaveProperty('auditLogging');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('formatSecurityResult()', () => {
    it('should format healthy status correctly', () => {
      const result = {
        status: SecurityStatus.HEALTHY,
        tier: 'standard',
        tierDescription: 'Recommended baseline',
        enabledValidators: [{ name: 'auth', path: 'test.js', loadable: true }],
        failedValidators: [],
        auditLogging: { enabled: false, logPath: null },
        warnings: []
      };

      const formatted = formatSecurityResult(result);
      expect(formatted).toContain('[OK] HEALTHY');
      expect(formatted).toContain('standard');
      expect(formatted).toContain('Enabled Validators: 1');
    });

    it('should format degraded status correctly', () => {
      const result = {
        status: SecurityStatus.DEGRADED,
        tier: 'standard',
        tierDescription: 'Recommended baseline',
        enabledValidators: [],
        failedValidators: [{ name: 'auth', path: 'missing.js', error: 'File not found' }],
        auditLogging: { enabled: false, logPath: null },
        warnings: ['1 validator(s) failed to load.']
      };

      const formatted = formatSecurityResult(result);
      expect(formatted).toContain('[WARN] DEGRADED');
      expect(formatted).toContain('Failed Validators: 1');
      expect(formatted).toContain('File not found');
    });

    it('should format unhealthy status correctly', () => {
      const result = {
        status: SecurityStatus.UNHEALTHY,
        tier: 'unconfigured',
        tierDescription: null,
        enabledValidators: [],
        failedValidators: [],
        auditLogging: { enabled: false, logPath: null },
        warnings: ['Security is not configured.']
      };

      const formatted = formatSecurityResult(result);
      expect(formatted).toContain('[FAIL] UNHEALTHY');
      expect(formatted).toContain('Warnings:');
    });

    it('should include audit logging status', () => {
      const result = {
        status: SecurityStatus.HEALTHY,
        tier: 'enterprise',
        tierDescription: 'Maximum protection',
        enabledValidators: [],
        failedValidators: [],
        auditLogging: { enabled: true, logPath: '/path/to/audit' },
        warnings: []
      };

      const formatted = formatSecurityResult(result);
      expect(formatted).toContain('Audit Logging: Enabled');
      expect(formatted).toContain('Log Path: /path/to/audit');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'security-checker.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'security-checker.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });
  });
});
