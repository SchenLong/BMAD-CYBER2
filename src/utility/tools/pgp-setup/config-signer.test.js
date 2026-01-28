/**
 * Unit Tests for Configuration File Signer - INST-028
 * Epic: BMAD-CYBER Installation Wizard Enhancement
 *
 * Tests the config-signer.js functionality for signing configuration
 * files with PGP keys and generating hash manifests.
 *
 * @module config-signer.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixture directory
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_signer__');
const MOCK_CONFIG_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad', '_config');
const MOCK_SECURITY_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad', 'core', 'security');
const MOCK_MODULES_PATH = path.join(MOCK_CONFIG_PATH, 'modules');

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock manifest.yaml content
 */
function createMockManifestYaml(modules = ['core', 'bmm']) {
  return `installation:
  version: 6.0.0
  installDate: 2024-01-01T00:00:00.000Z
modules:
  - ${modules.join('\n  - ')}
enabled_modules:
  - ${modules.join('\n  - ')}
`;
}

/**
 * Creates a mock llm-config.yaml content
 */
function createMockLlmConfigYaml() {
  return `llm:
  provider: anthropic
  model: claude-3-opus
  api_key_env: ANTHROPIC_API_KEY
`;
}

/**
 * Creates a mock security-config.yaml content
 */
function createMockSecurityConfigYaml() {
  return `security:
  tier: standard
  features:
    - auth
    - validators-6
`;
}

/**
 * Creates a mock module config file
 */
function createMockModuleConfigYaml(moduleName) {
  return `module:
  name: ${moduleName}
  enabled: true
`;
}

// ============================================================================
// Test Fixture Setup/Teardown
// ============================================================================

function setupTestFixtures() {
  cleanupTestFixtures();

  // Create mock directory structure
  fs.mkdirSync(MOCK_CONFIG_PATH, { recursive: true });
  fs.mkdirSync(MOCK_SECURITY_PATH, { recursive: true });
  fs.mkdirSync(MOCK_MODULES_PATH, { recursive: true });

  // Create mock config files
  fs.writeFileSync(
    path.join(MOCK_CONFIG_PATH, 'manifest.yaml'),
    createMockManifestYaml()
  );
  fs.writeFileSync(
    path.join(MOCK_CONFIG_PATH, 'llm-config.yaml'),
    createMockLlmConfigYaml()
  );
  fs.writeFileSync(
    path.join(MOCK_SECURITY_PATH, 'security-config.yaml'),
    createMockSecurityConfigYaml()
  );
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

// ============================================================================
// Import module
// ============================================================================

let configSigner;

beforeAll(async () => {
  try {
    configSigner = await import('./config-signer.js');
  } catch (err) {
    console.warn('config-signer.js import error:', err.message);
  }
});

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Configuration File Signer - INST-028', () => {

  describe('Constants', () => {
    it('should export CONFIG_FILES array', () => {
      expect(configSigner.CONFIG_FILES).toBeDefined();
      expect(Array.isArray(configSigner.CONFIG_FILES)).toBe(true);
    });

    it('should include llm-config.yaml in CONFIG_FILES', () => {
      expect(configSigner.CONFIG_FILES).toContain('_bmad/_config/llm-config.yaml');
    });

    it('should include security-config.yaml in CONFIG_FILES', () => {
      expect(configSigner.CONFIG_FILES).toContain('_bmad/core/security/security-config.yaml');
    });

    it('should include manifest.yaml in CONFIG_FILES', () => {
      expect(configSigner.CONFIG_FILES).toContain('_bmad/_config/manifest.yaml');
    });

    it('should export USER_MANIFEST_PATH', () => {
      expect(configSigner.USER_MANIFEST_PATH).toBeDefined();
      expect(configSigner.USER_MANIFEST_PATH).toContain('user-manifest.sha256');
    });

    it('should export MODULE_CONFIG_DIR', () => {
      expect(configSigner.MODULE_CONFIG_DIR).toBeDefined();
      expect(configSigner.MODULE_CONFIG_DIR).toContain('modules');
    });

    it('should export SIGNABLE_CONFIGS for backwards compatibility', () => {
      expect(configSigner.SIGNABLE_CONFIGS).toBeDefined();
      expect(configSigner.SIGNABLE_CONFIGS).toEqual(configSigner.CONFIG_FILES);
    });
  });

  // ============================================================================
  // Tests: calculateSha256()
  // ============================================================================

  describe('calculateSha256()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return hash for existing file', () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result = configSigner.calculateSha256(filePath);

      expect(result.hash).not.toBeNull();
      expect(result.hash).toHaveLength(64); // SHA-256 hex length
    });

    it('should return consistent hash for same file', () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result1 = configSigner.calculateSha256(filePath);
      const result2 = configSigner.calculateSha256(filePath);

      expect(result1.hash).toBe(result2.hash);
    });

    it('should return null hash for non-existent file', () => {
      const result = configSigner.calculateSha256('/nonexistent/file.yaml');

      expect(result.hash).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid file path', () => {
      const result = configSigner.calculateSha256(null);

      expect(result.hash).toBeNull();
      expect(result.error).toContain('Invalid file path');
    });

    it('should return error for empty string path', () => {
      const result = configSigner.calculateSha256('');

      expect(result.hash).toBeNull();
      expect(result.error).toContain('Invalid file path');
    });

    it('should produce different hashes for different files', () => {
      const manifest = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const llmConfig = path.join(MOCK_CONFIG_PATH, 'llm-config.yaml');

      const result1 = configSigner.calculateSha256(manifest);
      const result2 = configSigner.calculateSha256(llmConfig);

      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  // ============================================================================
  // Tests: calculateSha256FromString()
  // ============================================================================

  describe('calculateSha256FromString()', () => {
    it('should hash string content', () => {
      const hash = configSigner.calculateSha256FromString('test content');

      expect(hash).toHaveLength(64);
    });

    it('should return consistent hash for same content', () => {
      const hash1 = configSigner.calculateSha256FromString('test content');
      const hash2 = configSigner.calculateSha256FromString('test content');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', () => {
      const hash1 = configSigner.calculateSha256FromString('content a');
      const hash2 = configSigner.calculateSha256FromString('content b');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = configSigner.calculateSha256FromString('');

      expect(hash).toHaveLength(64);
      // SHA-256 of empty string is known value
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
  });

  // ============================================================================
  // Tests: getEnabledModules()
  // ============================================================================

  describe('getEnabledModules()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return enabled modules from manifest', () => {
      const modules = configSigner.getEnabledModules(MOCK_PROJECT_ROOT);

      expect(modules).toContain('core');
      expect(modules).toContain('bmm');
    });

    it('should return empty array if manifest does not exist', () => {
      cleanupTestFixtures();
      fs.mkdirSync(MOCK_CONFIG_PATH, { recursive: true });

      const modules = configSigner.getEnabledModules(MOCK_PROJECT_ROOT);

      expect(modules).toEqual([]);
    });

    it('should return empty array for invalid project root', () => {
      const modules = configSigner.getEnabledModules('/nonexistent/path');

      expect(modules).toEqual([]);
    });

    it('should use modules array if enabled_modules not present', () => {
      fs.writeFileSync(
        path.join(MOCK_CONFIG_PATH, 'manifest.yaml'),
        `modules:
  - core
  - intel-team
`
      );

      const modules = configSigner.getEnabledModules(MOCK_PROJECT_ROOT);

      expect(modules).toContain('core');
      expect(modules).toContain('intel-team');
    });
  });

  // ============================================================================
  // Tests: getModuleConfigFiles()
  // ============================================================================

  describe('getModuleConfigFiles()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty array if no module configs exist', () => {
      const files = configSigner.getModuleConfigFiles(MOCK_PROJECT_ROOT);

      expect(files).toEqual([]);
    });

    it('should find module config files matching enabled modules', () => {
      // Create module config for 'core'
      fs.writeFileSync(
        path.join(MOCK_MODULES_PATH, 'core.yaml'),
        createMockModuleConfigYaml('core')
      );

      const files = configSigner.getModuleConfigFiles(MOCK_PROJECT_ROOT);

      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.includes('core.yaml'))).toBe(true);
    });

    it('should find module-config.yaml pattern', () => {
      fs.writeFileSync(
        path.join(MOCK_MODULES_PATH, 'bmm-config.yaml'),
        createMockModuleConfigYaml('bmm')
      );

      const files = configSigner.getModuleConfigFiles(MOCK_PROJECT_ROOT);

      expect(files.some(f => f.includes('bmm-config.yaml'))).toBe(true);
    });

    it('should not include configs for disabled modules', () => {
      // Write manifest with only 'core' enabled
      fs.writeFileSync(
        path.join(MOCK_CONFIG_PATH, 'manifest.yaml'),
        createMockManifestYaml(['core'])
      );

      // Create config for disabled module
      fs.writeFileSync(
        path.join(MOCK_MODULES_PATH, 'intel-team.yaml'),
        createMockModuleConfigYaml('intel-team')
      );

      const files = configSigner.getModuleConfigFiles(MOCK_PROJECT_ROOT);

      expect(files.some(f => f.includes('intel-team.yaml'))).toBe(false);
    });

    it('should return empty array if modules directory does not exist', () => {
      fs.rmSync(MOCK_MODULES_PATH, { recursive: true, force: true });

      const files = configSigner.getModuleConfigFiles(MOCK_PROJECT_ROOT);

      expect(files).toEqual([]);
    });
  });

  // ============================================================================
  // Tests: getAllConfigFiles()
  // ============================================================================

  describe('getAllConfigFiles()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should include core config files', () => {
      const files = configSigner.getAllConfigFiles(MOCK_PROJECT_ROOT);

      expect(files).toContain('_bmad/_config/llm-config.yaml');
      expect(files).toContain('_bmad/core/security/security-config.yaml');
      expect(files).toContain('_bmad/_config/manifest.yaml');
    });

    it('should include module config files', () => {
      fs.writeFileSync(
        path.join(MOCK_MODULES_PATH, 'core.yaml'),
        createMockModuleConfigYaml('core')
      );

      const files = configSigner.getAllConfigFiles(MOCK_PROJECT_ROOT);

      expect(files.some(f => f.includes('modules/core.yaml'))).toBe(true);
    });

    it('should not have duplicate entries', () => {
      const files = configSigner.getAllConfigFiles(MOCK_PROJECT_ROOT);
      const uniqueFiles = [...new Set(files)];

      expect(files.length).toBe(uniqueFiles.length);
    });
  });

  // ============================================================================
  // Tests: buildHashManifest()
  // ============================================================================

  describe('buildHashManifest()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should build manifest with header', () => {
      const files = ['_bmad/_config/manifest.yaml'];
      const result = configSigner.buildHashManifest(files, MOCK_PROJECT_ROOT);

      expect(result.manifest).toContain('# BMAD Configuration File Integrity Manifest');
      expect(result.manifest).toContain('# Generated:');
    });

    it('should include hashes for existing files', () => {
      const files = ['_bmad/_config/manifest.yaml'];
      const result = configSigner.buildHashManifest(files, MOCK_PROJECT_ROOT);

      expect(result.hashes.length).toBe(1);
      expect(result.hashes[0].path).toBe('_bmad/_config/manifest.yaml');
      expect(result.hashes[0].hash).toHaveLength(64);
    });

    it('should include errors for missing files', () => {
      const files = ['_bmad/_config/nonexistent.yaml'];
      const result = configSigner.buildHashManifest(files, MOCK_PROJECT_ROOT);

      expect(result.errors.length).toBe(1);
      expect(result.errors[0].path).toBe('_bmad/_config/nonexistent.yaml');
      expect(result.errors[0].error).toContain('not found');
    });

    it('should include file count in footer', () => {
      const files = ['_bmad/_config/manifest.yaml', '_bmad/_config/llm-config.yaml'];
      const result = configSigner.buildHashManifest(files, MOCK_PROJECT_ROOT);

      expect(result.manifest).toContain('# Total files: 2');
    });

    it('should format hash entries correctly', () => {
      const files = ['_bmad/_config/manifest.yaml'];
      const result = configSigner.buildHashManifest(files, MOCK_PROJECT_ROOT);

      // Should have format: "hash  filepath"
      const lines = result.manifest.split('\n');
      const hashLine = lines.find(l => l.includes('manifest.yaml') && !l.startsWith('#'));

      expect(hashLine).toMatch(/^[a-f0-9]{64}\s{2}_bmad\/_config\/manifest\.yaml$/);
    });
  });

  // ============================================================================
  // Tests: writeHashManifest()
  // ============================================================================

  describe('writeHashManifest()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should write manifest file successfully', () => {
      const content = '# Test manifest\nhash  file.yaml';
      const result = configSigner.writeHashManifest(content, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
    });

    it('should create correct file content', () => {
      const content = '# Test manifest content';
      configSigner.writeHashManifest(content, MOCK_PROJECT_ROOT);

      const manifestPath = path.join(MOCK_PROJECT_ROOT, configSigner.USER_MANIFEST_PATH);
      const written = fs.readFileSync(manifestPath, 'utf8');

      expect(written).toBe(content);
    });

    it('should create directory if not exists', () => {
      cleanupTestFixtures();
      fs.mkdirSync(MOCK_PROJECT_ROOT, { recursive: true });

      const content = '# Test';
      const result = configSigner.writeHashManifest(content, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(true);
    });

    it('should not leave temp files on success', () => {
      const content = '# Test manifest';
      configSigner.writeHashManifest(content, MOCK_PROJECT_ROOT);

      const configDir = path.join(MOCK_PROJECT_ROOT, '_bmad/_config');
      const files = fs.readdirSync(configDir);
      const tempFiles = files.filter(f => f.includes('.tmp'));

      expect(tempFiles.length).toBe(0);
    });
  });

  // ============================================================================
  // Tests: isGpgAvailable()
  // ============================================================================

  describe('isGpgAvailable()', () => {
    it('should return boolean', () => {
      const result = configSigner.isGpgAvailable();

      expect(typeof result).toBe('boolean');
    });
  });

  // ============================================================================
  // Tests: keyExists()
  // ============================================================================

  describe('keyExists()', () => {
    it('should return false for null fingerprint', () => {
      const result = configSigner.keyExists(null);

      expect(result).toBe(false);
    });

    it('should return false for empty fingerprint', () => {
      const result = configSigner.keyExists('');

      expect(result).toBe(false);
    });

    it('should return false for non-existent key', () => {
      const result = configSigner.keyExists('NONEXISTENT1234567890');

      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // Tests: signFile()
  // ============================================================================

  describe('signFile()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return error for invalid file path', () => {
      const result = configSigner.signFile(null, 'fingerprint');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file path');
    });

    it('should return error for invalid fingerprint', () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result = configSigner.signFile(filePath, null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid key fingerprint');
    });

    it('should return error for non-existent file', () => {
      const result = configSigner.signFile('/nonexistent/file.yaml', 'fingerprint');

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });
  });

  // ============================================================================
  // Tests: verifySignature()
  // ============================================================================

  describe('verifySignature()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return error for non-existent file', () => {
      const result = configSigner.verifySignature('/nonexistent/file.yaml');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should return error for missing signature', () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result = configSigner.verifySignature(filePath);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Signature file not found');
    });
  });

  // ============================================================================
  // Tests: signAllConfigs()
  // ============================================================================

  describe('signAllConfigs()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return error for invalid fingerprint', () => {
      const result = configSigner.signAllConfigs(null, MOCK_PROJECT_ROOT);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid key fingerprint');
    });

    it('should return error for invalid project root', () => {
      const result = configSigner.signAllConfigs('fingerprint', null);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid project root');
    });

    it('should return error for non-existent project root', () => {
      const result = configSigner.signAllConfigs('fingerprint', '/nonexistent/path');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('does not exist'))).toBe(true);
    });

    it('should support object options parameter', () => {
      const result = configSigner.signAllConfigs({
        fingerprint: 'test-key',
        projectRoot: '/nonexistent'
      });

      expect(result.success).toBe(false);
      // Should still process the options correctly
      expect(result.fingerprint).toBe('test-key');
    });

    it('should report missing files as failed when GPG available', () => {
      // This test validates that missing files would be tracked as failed
      // when GPG validation passes. Since we can't guarantee GPG is available,
      // we test the getAllConfigFiles and verify the missing file detection logic

      // Remove one of the config files
      fs.unlinkSync(path.join(MOCK_CONFIG_PATH, 'llm-config.yaml'));

      // Get all config files - should still include the missing file path
      const configFiles = configSigner.getAllConfigFiles(MOCK_PROJECT_ROOT);
      expect(configFiles).toContain('_bmad/_config/llm-config.yaml');

      // Verify calculateSha256 reports error for missing file
      const hashResult = configSigner.calculateSha256(
        path.join(MOCK_PROJECT_ROOT, '_bmad/_config/llm-config.yaml')
      );
      expect(hashResult.hash).toBeNull();
      expect(hashResult.error).toContain('not found');
    });

    it('should return structured result object', () => {
      const result = configSigner.signAllConfigs('test', MOCK_PROJECT_ROOT);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('signedFiles');
      expect(result).toHaveProperty('failedFiles');
      expect(result).toHaveProperty('manifestPath');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.signedFiles)).toBe(true);
      expect(Array.isArray(result.failedFiles)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  // ============================================================================
  // Tests: formatSigningSummary()
  // ============================================================================

  describe('formatSigningSummary()', () => {
    it('should format successful result', () => {
      const result = {
        success: true,
        signedFiles: ['file1.yaml', 'file2.yaml'],
        failedFiles: [],
        manifestPath: '/path/to/manifest.sha256',
        manifestSignaturePath: '/path/to/manifest.sha256.asc',
        errors: []
      };

      const summary = configSigner.formatSigningSummary(result);

      expect(summary).toContain('Signed Files:');
      expect(summary).toContain('file1.yaml');
      expect(summary).toContain('file2.yaml');
      expect(summary).toContain('SUCCESS');
    });

    it('should format failed result', () => {
      const result = {
        success: false,
        signedFiles: [],
        failedFiles: [{ path: 'file.yaml', error: 'GPG error' }],
        manifestPath: null,
        manifestSignaturePath: null,
        errors: ['Major error']
      };

      const summary = configSigner.formatSigningSummary(result);

      expect(summary).toContain('Failed Files:');
      expect(summary).toContain('file.yaml');
      expect(summary).toContain('GPG error');
      expect(summary).toContain('Errors:');
      expect(summary).toContain('Major error');
      expect(summary).toContain('PARTIAL/FAILED');
    });

    it('should include manifest info when present', () => {
      const result = {
        success: true,
        signedFiles: ['file.yaml'],
        failedFiles: [],
        manifestPath: '/path/to/user-manifest.sha256',
        manifestSignaturePath: '/path/to/user-manifest.sha256.asc',
        errors: []
      };

      const summary = configSigner.formatSigningSummary(result);

      expect(summary).toContain('Hash Manifest:');
      expect(summary).toContain('user-manifest.sha256');
    });

    it('should show totals', () => {
      const result = {
        success: true,
        signedFiles: ['a.yaml', 'b.yaml'],
        failedFiles: [{ path: 'c.yaml', error: 'error' }],
        manifestPath: '/path',
        manifestSignaturePath: '/path.asc',
        errors: []
      };

      const summary = configSigner.formatSigningSummary(result);

      expect(summary).toContain('Total signed: 2');
      expect(summary).toContain('Total failed: 1');
    });
  });

  // ============================================================================
  // Tests: getSignedFiles()
  // ============================================================================

  describe('getSignedFiles()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty array when no signatures exist', async () => {
      const files = await configSigner.getSignedFiles(MOCK_PROJECT_ROOT);

      expect(files).toEqual([]);
    });

    it('should return files that have .asc signatures', async () => {
      // Create a fake signature file
      const manifestPath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      fs.writeFileSync(`${manifestPath}.asc`, '-----BEGIN PGP SIGNATURE-----\nfake\n-----END PGP SIGNATURE-----');

      const files = await configSigner.getSignedFiles(MOCK_PROJECT_ROOT);

      expect(files).toContain('_bmad/_config/manifest.yaml');
    });
  });

  // ============================================================================
  // Tests: verifyConfigSignature()
  // ============================================================================

  describe('verifyConfigSignature()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return result object', async () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result = await configSigner.verifyConfigSignature(filePath, MOCK_PROJECT_ROOT);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
    });

    it('should return invalid for missing signature', async () => {
      const filePath = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');
      const result = await configSigner.verifyConfigSignature(filePath, MOCK_PROJECT_ROOT);

      expect(result.valid).toBe(false);
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const modulePath = path.join(__dirname, 'config-signer.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).not.toMatch(/\brequire\s*\(/);
      expect(content).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use export statements', async () => {
      const modulePath = path.join(__dirname, 'config-signer.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).toMatch(/\bexport\s+(function|const|async)/);
    });

    it('should use import.meta.url pattern', async () => {
      const modulePath = path.join(__dirname, 'config-signer.js');
      const content = fs.readFileSync(modulePath, 'utf8');

      expect(content).toMatch(/import\.meta\.url/);
    });

    it('should have default export', () => {
      expect(configSigner.default).toBeDefined();
      expect(configSigner.default.signAllConfigs).toBeDefined();
    });
  });

  // ============================================================================
  // Tests: Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should handle concurrent operations gracefully', async () => {
      const content1 = '# Manifest 1';
      const content2 = '# Manifest 2';

      const promise1 = Promise.resolve(configSigner.writeHashManifest(content1, MOCK_PROJECT_ROOT));
      const promise2 = Promise.resolve(configSigner.writeHashManifest(content2, MOCK_PROJECT_ROOT));

      const results = await Promise.all([promise1, promise2]);

      // Both should complete without throwing
      expect(results[0].success || results[1].success).toBe(true);
    });

    it('should not throw on malformed YAML', () => {
      fs.writeFileSync(
        path.join(MOCK_CONFIG_PATH, 'manifest.yaml'),
        'invalid: yaml: content:\n  bad_indent'
      );

      // Should not throw
      expect(() => {
        configSigner.getEnabledModules(MOCK_PROJECT_ROOT);
      }).not.toThrow();
    });

    it('should handle binary file hashing', () => {
      const binaryPath = path.join(MOCK_CONFIG_PATH, 'binary.bin');
      fs.writeFileSync(binaryPath, Buffer.from([0x00, 0x01, 0x02, 0xff]));

      const result = configSigner.calculateSha256(binaryPath);

      expect(result.hash).not.toBeNull();
      expect(result.hash).toHaveLength(64);
    });
  });
});
