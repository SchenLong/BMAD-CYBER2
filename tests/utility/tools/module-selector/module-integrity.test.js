/**
 * Unit Tests for Module Integrity Verification - Security Module
 *
 * Tests the security features:
 * - MOD-001: SHA256 hash verification for module files
 * - MOD-002: Path traversal prevention
 * - MOD-003: Module allowlist enforcement
 *
 * @module module-integrity.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import {
  checkModuleAllowlist,
  computeFileHash,
  computeModuleHashes,
  createSecurityContext,
  generateIntegrityManifest,
  loadIntegrityManifest,
  saveIntegrityManifest,
  validatePathSecurity,
  verifyModuleIntegrity
} from './module-integrity.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures directory
const TEST_FIXTURES_ROOT = path.join(__dirname, '__test_fixtures_security__');
const TEST_BMAD_PATH = path.join(TEST_FIXTURES_ROOT, '_bmad');
const TEST_MANIFEST_PATH = path.join(TEST_FIXTURES_ROOT, 'module-integrity-manifest.json');

// Test module content
const TEST_MODULE_CODE = 'test-module';
const TEST_MODULE_CONTENT = `
code: "test-module"
name: "Test Module"
required: false
`;

const TEST_AGENT_CONTENT = '# Test Agent\n\nThis is a test agent.';
const TEST_WORKFLOW_CONTENT = '# Test Workflow\n\nsteps:\n  - step1\n  - step2';

/**
 * Setup test fixtures
 */
function setupTestFixtures() {
  // Clean up any existing fixtures
  cleanupTestFixtures();

  // Create directory structure
  const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);
  const agentsPath = path.join(modulePath, 'agents');
  const workflowsPath = path.join(modulePath, 'workflows');

  fs.mkdirSync(agentsPath, { recursive: true });
  fs.mkdirSync(workflowsPath, { recursive: true });

  // Create module.yaml
  fs.writeFileSync(path.join(modulePath, 'module.yaml'), TEST_MODULE_CONTENT);

  // Create agent file
  fs.writeFileSync(path.join(agentsPath, 'test-agent.md'), TEST_AGENT_CONTENT);

  // Create workflow file
  fs.writeFileSync(path.join(workflowsPath, 'test-workflow.yaml'), TEST_WORKFLOW_CONTENT);
}

/**
 * Cleanup test fixtures
 */
function cleanupTestFixtures() {
  if (fs.existsSync(TEST_FIXTURES_ROOT)) {
    fs.rmSync(TEST_FIXTURES_ROOT, { recursive: true, force: true });
  }
}

describe('Module Integrity - MOD-001: SHA256 Hash Verification', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('computeFileHash', () => {
    it('should compute correct SHA256 hash for a file', () => {
      const filePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE, 'module.yaml');
      const hash = computeFileHash(filePath);

      expect(hash).not.toBeNull();
      expect(hash).toHaveLength(64); // SHA256 hex is 64 characters

      // Verify hash is correct by computing manually
      const content = fs.readFileSync(filePath);
      const expectedHash = crypto.createHash('sha256').update(content).digest('hex');
      expect(hash).toBe(expectedHash);
    });

    it('should return null for non-existent file', () => {
      const hash = computeFileHash('/non/existent/file.txt');
      expect(hash).toBeNull();
    });

    it('should return different hashes for different content', () => {
      const file1 = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE, 'module.yaml');
      const file2 = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE, 'agents', 'test-agent.md');

      const hash1 = computeFileHash(file1);
      const hash2 = computeFileHash(file2);

      expect(hash1).not.toBeNull();
      expect(hash2).not.toBeNull();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('computeModuleHashes', () => {
    it('should compute hashes for all files in a module', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);
      const hashes = computeModuleHashes(modulePath);

      expect(Object.keys(hashes).length).toBeGreaterThan(0);
      expect(hashes['module.yaml']).toBeDefined();
      expect(hashes['agents/test-agent.md']).toBeDefined();
      expect(hashes['workflows/test-workflow.yaml']).toBeDefined();
    });

    it('should return empty object for non-existent path', () => {
      const hashes = computeModuleHashes('/non/existent/path');
      expect(hashes).toEqual({});
    });

    it('should use forward slashes in paths (cross-platform)', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);
      const hashes = computeModuleHashes(modulePath);

      for (const key of Object.keys(hashes)) {
        expect(key).not.toContain('\\');
      }
    });
  });

  describe('verifyModuleIntegrity', () => {
    it('should pass verification when hashes match', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      // Compute current hashes and create manifest
      const currentHashes = computeModuleHashes(modulePath);
      const manifest = {
        version: '1.0',
        hashes: {}
      };

      // Add hashes with module prefix
      for (const [filePath, hash] of Object.entries(currentHashes)) {
        manifest.hashes[`${TEST_MODULE_CODE}/${filePath}`] = hash;
      }

      const result = verifyModuleIntegrity(modulePath, manifest, TEST_MODULE_CODE);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail verification when hash does not match', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const manifest = {
        version: '1.0',
        hashes: {
          [`${TEST_MODULE_CODE}/module.yaml`]: 'invalid_hash_value'
        }
      };

      const result = verifyModuleIntegrity(modulePath, manifest, TEST_MODULE_CODE);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Hash mismatch');
    });

    it('should fail verification when file is missing', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const manifest = {
        version: '1.0',
        hashes: {
          [`${TEST_MODULE_CODE}/non-existent-file.md`]: 'some_hash'
        }
      };

      const result = verifyModuleIntegrity(modulePath, manifest, TEST_MODULE_CODE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing file'))).toBe(true);
    });

    it('should warn about unexpected files not in manifest', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const manifest = {
        version: '1.0',
        hashes: {
          [`${TEST_MODULE_CODE}/module.yaml`]: computeFileHash(path.join(modulePath, 'module.yaml'))
        }
      };

      const result = verifyModuleIntegrity(modulePath, manifest, TEST_MODULE_CODE);

      expect(result.valid).toBe(true); // Unexpected files don't fail verification
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Unexpected file'))).toBe(true);
    });

    it('should handle missing manifest gracefully', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const result = verifyModuleIntegrity(modulePath, null, TEST_MODULE_CODE);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('No integrity manifest'))).toBe(true);
    });

    it('should handle module not in manifest gracefully', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const manifest = {
        version: '1.0',
        hashes: {
          'other-module/file.yaml': 'some_hash'
        }
      };

      const result = verifyModuleIntegrity(modulePath, manifest, TEST_MODULE_CODE);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('No hashes found'))).toBe(true);
    });
  });

  describe('loadIntegrityManifest / saveIntegrityManifest', () => {
    it('should save and load manifest correctly', () => {
      const hashes = {
        'test-module/module.yaml': 'abc123',
        'test-module/agents/agent.md': 'def456'
      };
      const allowlist = ['core', 'test-module'];

      const saveResult = saveIntegrityManifest(TEST_MANIFEST_PATH, hashes, allowlist);
      expect(saveResult).toBe(true);

      const loaded = loadIntegrityManifest(TEST_MANIFEST_PATH);
      expect(loaded).not.toBeNull();
      expect(loaded.version).toBe('1.0');
      expect(loaded.hashes).toEqual(hashes);
      expect(loaded.allowlist).toEqual(allowlist);
      expect(loaded.createdAt).toBeDefined();
    });

    it('should return null for non-existent manifest', () => {
      const loaded = loadIntegrityManifest('/non/existent/manifest.json');
      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const invalidPath = path.join(TEST_FIXTURES_ROOT, 'invalid.json');
      fs.writeFileSync(invalidPath, 'not valid json {{{');

      const loaded = loadIntegrityManifest(invalidPath);
      expect(loaded).toBeNull();
    });

    it('should return null for manifest missing required fields', () => {
      const incompletePath = path.join(TEST_FIXTURES_ROOT, 'incomplete.json');
      fs.writeFileSync(incompletePath, JSON.stringify({ version: '1.0' }));

      const loaded = loadIntegrityManifest(incompletePath);
      expect(loaded).toBeNull();
    });
  });
});

describe('Module Integrity - MOD-002: Path Traversal Prevention', () => {
  describe('validatePathSecurity', () => {
    const baseDir = '/safe/base/dir';

    it('should allow valid relative paths within base directory', () => {
      const result = validatePathSecurity('subdir/file.txt', baseDir);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.normalizedPath).toBe(path.resolve(baseDir, 'subdir/file.txt'));
    });

    it('should allow simple filenames', () => {
      const result = validatePathSecurity('module.yaml', baseDir);
      expect(result.valid).toBe(true);
    });

    it('should reject paths with parent directory references (..)', () => {
      const testCases = [
        '../outside/file.txt',
        'subdir/../../../etc/passwd',
        '..\\..\\windows\\system32',
        'valid/path/../../../escape'
      ];

      for (const testPath of testCases) {
        const result = validatePathSecurity(testPath, baseDir);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('..');
      }
    });

    it('should reject paths with null bytes', () => {
      const result = validatePathSecurity('file.txt\0.exe', baseDir);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('null bytes');
    });

    it('should reject null or undefined paths', () => {
      const result1 = validatePathSecurity(null, baseDir);
      expect(result1.valid).toBe(false);

      const result2 = validatePathSecurity(undefined, baseDir);
      expect(result2.valid).toBe(false);
    });

    it('should reject non-string paths', () => {
      const result = validatePathSecurity(123, baseDir);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('string');
    });

    it('should reject empty base directory', () => {
      const result = validatePathSecurity('file.txt', null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('base directory');
    });

    it('should handle deeply nested valid paths', () => {
      const deepPath = 'a/b/c/d/e/f/g/file.txt';
      const result = validatePathSecurity(deepPath, baseDir);
      expect(result.valid).toBe(true);
    });

    it('should normalize the path correctly', () => {
      const result = validatePathSecurity('subdir//double/slash/../slash/file.txt', baseDir);
      // This should fail because of ".."
      expect(result.valid).toBe(false);
    });
  });
});

describe('Module Integrity - MOD-003: Module Allowlist Enforcement', () => {
  describe('checkModuleAllowlist', () => {
    const allowlist = ['core', 'bmm', 'intel-team', 'legal-team'];

    it('should allow modules in the allowlist', () => {
      const result = checkModuleAllowlist('core', allowlist);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('should allow modules not in allowlist in non-strict mode', () => {
      const result = checkModuleAllowlist('unknown-module', allowlist, { strict: false });
      expect(result.allowed).toBe(true);
    });

    it('should reject modules not in allowlist in strict mode', () => {
      const result = checkModuleAllowlist('unknown-module', allowlist, { strict: true });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not in the allowlist');
    });

    it('should log rejection in strict mode', () => {
      const logged = [];
      const logger = (msg) => logged.push(msg);

      checkModuleAllowlist('unknown-module', allowlist, { strict: true, logger });

      expect(logged.length).toBe(1);
      expect(logged[0]).toContain('[SECURITY]');
      expect(logged[0]).toContain('unknown-module');
    });

    it('should log warning for non-allowlisted module in non-strict mode', () => {
      const logged = [];
      const logger = (msg) => logged.push(msg);

      checkModuleAllowlist('unknown-module', allowlist, { strict: false, logger });

      expect(logged.length).toBe(1);
      expect(logged[0]).toContain('[SECURITY WARNING]');
    });

    it('should handle empty allowlist in non-strict mode', () => {
      const result = checkModuleAllowlist('any-module', [], { strict: false });
      expect(result.allowed).toBe(true);
    });

    it('should reject all modules with empty allowlist in strict mode', () => {
      const result = checkModuleAllowlist('any-module', [], { strict: true });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No allowlist configured');
    });

    it('should handle null allowlist', () => {
      const result = checkModuleAllowlist('module', null, { strict: false });
      expect(result.allowed).toBe(true);
    });

    it('should reject invalid module codes', () => {
      const result = checkModuleAllowlist('', allowlist);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid module code');

      const result2 = checkModuleAllowlist(null, allowlist);
      expect(result2.allowed).toBe(false);
    });
  });
});

describe('Security Context', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('createSecurityContext', () => {
    it('should create a security context with all methods', () => {
      const ctx = createSecurityContext(TEST_BMAD_PATH);

      expect(typeof ctx.validatePath).toBe('function');
      expect(typeof ctx.isModuleAllowed).toBe('function');
      expect(typeof ctx.verifyIntegrity).toBe('function');
      expect(typeof ctx.checkModule).toBe('function');
      expect(typeof ctx.getAllowlist).toBe('function');
      expect(typeof ctx.hasManifest).toBe('function');
    });

    it('should validate paths using the context', () => {
      const ctx = createSecurityContext(TEST_BMAD_PATH, { logger: null });
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      expect(ctx.validatePath(modulePath)).toBe(true);
    });

    it('should reject path traversal attempts', () => {
      const ctx = createSecurityContext(TEST_BMAD_PATH, { logger: null });

      expect(ctx.validatePath('../outside')).toBe(false);
    });

    it('should check allowlist correctly', () => {
      const ctx = createSecurityContext(TEST_BMAD_PATH, {
        allowlist: ['core', TEST_MODULE_CODE],
        strictAllowlist: true,
        logger: null
      });

      expect(ctx.isModuleAllowed(TEST_MODULE_CODE)).toBe(true);
      expect(ctx.isModuleAllowed('unknown-module')).toBe(false);
    });

    it('should use manifest allowlist when no explicit allowlist provided', () => {
      // Create a manifest with allowlist
      const manifest = {
        version: '1.0',
        hashes: {},
        allowlist: ['core', 'from-manifest']
      };
      fs.writeFileSync(TEST_MANIFEST_PATH, JSON.stringify(manifest));

      const ctx = createSecurityContext(TEST_BMAD_PATH, {
        manifestPath: TEST_MANIFEST_PATH,
        strictAllowlist: true,
        logger: null
      });

      expect(ctx.getAllowlist()).toContain('from-manifest');
      expect(ctx.isModuleAllowed('from-manifest')).toBe(true);
    });

    it('should prefer explicit allowlist over manifest allowlist', () => {
      const manifest = {
        version: '1.0',
        hashes: {},
        allowlist: ['manifest-module']
      };
      fs.writeFileSync(TEST_MANIFEST_PATH, JSON.stringify(manifest));

      const ctx = createSecurityContext(TEST_BMAD_PATH, {
        manifestPath: TEST_MANIFEST_PATH,
        allowlist: ['explicit-module'],
        strictAllowlist: true,
        logger: null
      });

      expect(ctx.getAllowlist()).toContain('explicit-module');
      expect(ctx.getAllowlist()).not.toContain('manifest-module');
    });

    it('should perform combined security check with checkModule', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const ctx = createSecurityContext(TEST_BMAD_PATH, {
        allowlist: [TEST_MODULE_CODE],
        strictAllowlist: true,
        logger: null
      });

      const result = ctx.checkModule(modulePath, TEST_MODULE_CODE);
      expect(result.allowed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail combined check for non-allowlisted module in strict mode', () => {
      const modulePath = path.join(TEST_BMAD_PATH, TEST_MODULE_CODE);

      const ctx = createSecurityContext(TEST_BMAD_PATH, {
        allowlist: ['other-module'],
        strictAllowlist: true,
        logger: null
      });

      const result = ctx.checkModule(modulePath, TEST_MODULE_CODE);
      expect(result.allowed).toBe(false);
      expect(result.errors.some(e => e.includes('allowlist'))).toBe(true);
    });

    it('should report hasManifest correctly', () => {
      const manifest = { version: '1.0', hashes: {} };
      fs.writeFileSync(TEST_MANIFEST_PATH, JSON.stringify(manifest));

      const ctxWithManifest = createSecurityContext(TEST_BMAD_PATH, {
        manifestPath: TEST_MANIFEST_PATH,
        logger: null
      });
      expect(ctxWithManifest.hasManifest()).toBe(true);

      const ctxWithoutManifest = createSecurityContext(TEST_BMAD_PATH, {
        manifestPath: '/non/existent/manifest.json',
        logger: null
      });
      expect(ctxWithoutManifest.hasManifest()).toBe(false);
    });
  });

  describe('generateIntegrityManifest', () => {
    it('should generate manifest for all modules', () => {
      const manifest = generateIntegrityManifest(TEST_BMAD_PATH, [TEST_MODULE_CODE]);

      expect(manifest.version).toBe('1.0');
      expect(manifest.createdAt).toBeDefined();
      expect(manifest.allowlist).toContain(TEST_MODULE_CODE);
      expect(Object.keys(manifest.hashes).length).toBeGreaterThan(0);

      // Check that hashes are prefixed with module name
      const hasModulePrefixedHash = Object.keys(manifest.hashes).some(
        key => key.startsWith(`${TEST_MODULE_CODE}/`)
      );
      expect(hasModulePrefixedHash).toBe(true);
    });

    it('should return empty manifest for non-existent path', () => {
      const manifest = generateIntegrityManifest('/non/existent/path', []);

      expect(manifest.version).toBe('1.0');
      expect(manifest.hashes).toEqual({});
    });

    it('should skip directories starting with underscore', () => {
      // Create a _config directory
      fs.mkdirSync(path.join(TEST_BMAD_PATH, '_config'), { recursive: true });
      fs.writeFileSync(path.join(TEST_BMAD_PATH, '_config', 'config.yaml'), 'key: value');

      const manifest = generateIntegrityManifest(TEST_BMAD_PATH, []);

      const hasConfigHash = Object.keys(manifest.hashes).some(
        key => key.startsWith('_config/')
      );
      expect(hasConfigHash).toBe(false);
    });
  });
});
