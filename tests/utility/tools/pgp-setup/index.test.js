/**
 * Unit Tests for PGP Setup Entry Point - INST-029
 * Epic 5, Story 5 - Create npm run pgp:setup command entry point
 *
 * Comprehensive tests for the PGP setup wizard entry point.
 * Tests cover module exports, configuration handling, argument parsing,
 * and various execution modes.
 *
 * @module pgp-setup/index.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('PGP Setup Entry Point - INST-029', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgp-setup-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Module Imports Tests
  // =========================================================================

  describe('Module Imports', () => {
    it('should export VERSION', async () => {
      const module = await import('./index.js');
      expect(module.VERSION).toBeDefined();
      expect(typeof module.VERSION).toBe('string');
      expect(module.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should export runPgpSetup function', async () => {
      const module = await import('./index.js');
      expect(module.runPgpSetup).toBeDefined();
      expect(typeof module.runPgpSetup).toBe('function');
    });

    it('should export showCurrentKeyStatus function', async () => {
      const module = await import('./index.js');
      expect(module.showCurrentKeyStatus).toBeDefined();
      expect(typeof module.showCurrentKeyStatus).toBe('function');
    });

    it('should export showSignedFilesStatus function', async () => {
      const module = await import('./index.js');
      expect(module.showSignedFilesStatus).toBeDefined();
      expect(typeof module.showSignedFilesStatus).toBe('function');
    });

    it('should export readPgpConfig function', async () => {
      const module = await import('./index.js');
      expect(module.readPgpConfig).toBeDefined();
      expect(typeof module.readPgpConfig).toBe('function');
    });

    it('should export writePgpConfig function', async () => {
      const module = await import('./index.js');
      expect(module.writePgpConfig).toBeDefined();
      expect(typeof module.writePgpConfig).toBe('function');
    });

    it('should export parseArgs function', async () => {
      const module = await import('./index.js');
      expect(module.parseArgs).toBeDefined();
      expect(typeof module.parseArgs).toBe('function');
    });

    it('should export HELP_TEXT', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toBeDefined();
      expect(typeof module.HELP_TEXT).toBe('string');
    });

    it('should export PGP_CONFIG_PATH', async () => {
      const module = await import('./index.js');
      expect(module.PGP_CONFIG_PATH).toBeDefined();
      expect(typeof module.PGP_CONFIG_PATH).toBe('string');
    });
  });

  // =========================================================================
  // VERSION Constant Tests
  // =========================================================================

  describe('VERSION constant', () => {
    it('should be version 1.0.0', async () => {
      const module = await import('./index.js');
      expect(module.VERSION).toBe('1.0.0');
    });

    it('should follow semantic versioning format', async () => {
      const module = await import('./index.js');
      const parts = module.VERSION.split('.');
      expect(parts).toHaveLength(3);
      expect(parts.every(p => !isNaN(parseInt(p, 10)))).toBe(true);
    });
  });

  // =========================================================================
  // HELP_TEXT Tests
  // =========================================================================

  describe('HELP_TEXT', () => {
    it('should contain usage information', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('Usage:');
    });

    it('should document --generate flag', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('--generate');
    });

    it('should document --sign flag', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('--sign');
    });

    it('should document --status flag', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('--status');
    });

    it('should document --help flag', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('--help');
    });

    it('should include examples', async () => {
      const module = await import('./index.js');
      expect(module.HELP_TEXT).toContain('Examples:');
      expect(module.HELP_TEXT).toContain('npm run pgp:setup');
    });
  });

  // =========================================================================
  // readPgpConfig Tests
  // =========================================================================

  describe('readPgpConfig()', () => {
    it('should return null when config file does not exist', async () => {
      const module = await import('./index.js');
      const result = module.readPgpConfig(tempDir);
      expect(result).toBeNull();
    });

    it('should read and parse existing config file', async () => {
      const module = await import('./index.js');

      // Create config directory and file
      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        "fingerprint: 'ABCD1234'\nkey_id: '1234'\nemail: 'test@example.com'\n"
      );

      const result = module.readPgpConfig(tempDir);

      expect(result).not.toBeNull();
      expect(result.fingerprint).toBe('ABCD1234');
      expect(result.key_id).toBe('1234');
      expect(result.email).toBe('test@example.com');
    });

    it('should ignore comment lines in config', async () => {
      const module = await import('./index.js');

      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        "# This is a comment\nfingerprint: 'TEST'\n# Another comment\n"
      );

      const result = module.readPgpConfig(tempDir);

      expect(result).not.toBeNull();
      expect(result.fingerprint).toBe('TEST');
    });

    it('should handle double-quoted values', async () => {
      const module = await import('./index.js');

      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        'fingerprint: "DOUBLEQUOTED"\n'
      );

      const result = module.readPgpConfig(tempDir);

      expect(result).not.toBeNull();
      expect(result.fingerprint).toBe('DOUBLEQUOTED');
    });
  });

  // =========================================================================
  // writePgpConfig Tests
  // =========================================================================

  describe('writePgpConfig()', () => {
    it('should create config file successfully', async () => {
      const module = await import('./index.js');

      const config = {
        fingerprint: 'TESTFINGERPRINT',
        key_id: 'TEST1234',
        email: 'test@example.com'
      };

      const result = module.writePgpConfig(config, tempDir);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(fs.existsSync(result.path)).toBe(true);
    });

    it('should create parent directories if they do not exist', async () => {
      const module = await import('./index.js');

      const config = { fingerprint: 'TEST' };
      const result = module.writePgpConfig(config, tempDir);

      expect(result.success).toBe(true);
      const configDir = path.join(tempDir, '_bmad/_config');
      expect(fs.existsSync(configDir)).toBe(true);
    });

    it('should write YAML format with comments', async () => {
      const module = await import('./index.js');

      const config = { fingerprint: 'TEST' };
      module.writePgpConfig(config, tempDir);

      const content = fs.readFileSync(
        path.join(tempDir, '_bmad/_config/pgp-config.yaml'),
        'utf8'
      );

      expect(content).toContain('# BMAD PGP Configuration');
      expect(content).toContain("fingerprint: 'TEST'");
    });

    it('should handle array values', async () => {
      const module = await import('./index.js');

      const config = {
        fingerprint: 'TEST',
        signed_files: ['file1.yaml', 'file2.yaml']
      };

      const result = module.writePgpConfig(config, tempDir);

      expect(result.success).toBe(true);
      const content = fs.readFileSync(result.path, 'utf8');
      expect(content).toContain('signed_files:');
      expect(content).toContain('  - file1.yaml');
      expect(content).toContain('  - file2.yaml');
    });
  });

  // =========================================================================
  // showCurrentKeyStatus Tests
  // =========================================================================

  describe('showCurrentKeyStatus()', () => {
    it('should return hasKey: false when no config exists', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = module.showCurrentKeyStatus(tempDir);

      expect(result.hasKey).toBe(false);
      expect(result.config).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return hasKey: true when config with fingerprint exists', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create config
      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        "fingerprint: 'TESTKEY'\nkey_id: 'TEST'\n"
      );

      const result = module.showCurrentKeyStatus(tempDir);

      expect(result.hasKey).toBe(true);
      expect(result.config).not.toBeNull();
      expect(result.config.fingerprint).toBe('TESTKEY');

      consoleSpy.mockRestore();
    });

    it('should log status information', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      module.showCurrentKeyStatus(tempDir);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // parseArgs Tests
  // =========================================================================

  describe('parseArgs()', () => {
    let originalArgv;

    beforeEach(() => {
      originalArgv = process.argv;
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('should parse --generate flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '--generate'];
      const result = module.parseArgs();
      expect(result.generate).toBe(true);
    });

    it('should parse -g flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '-g'];
      const result = module.parseArgs();
      expect(result.generate).toBe(true);
    });

    it('should parse --sign flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '--sign'];
      const result = module.parseArgs();
      expect(result.sign).toBe(true);
    });

    it('should parse -s flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '-s'];
      const result = module.parseArgs();
      expect(result.sign).toBe(true);
    });

    it('should parse --status flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '--status'];
      const result = module.parseArgs();
      expect(result.status).toBe(true);
    });

    it('should parse --help flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '--help'];
      const result = module.parseArgs();
      expect(result.help).toBe(true);
    });

    it('should parse -h flag', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '-h'];
      const result = module.parseArgs();
      expect(result.help).toBe(true);
    });

    it('should return all false when no flags provided', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js'];
      const result = module.parseArgs();
      expect(result.generate).toBe(false);
      expect(result.sign).toBe(false);
      expect(result.status).toBe(false);
      expect(result.help).toBe(false);
    });

    it('should parse multiple flags', async () => {
      const module = await import('./index.js');
      process.argv = ['node', 'index.js', '--generate', '--status'];
      const result = module.parseArgs();
      expect(result.generate).toBe(true);
      expect(result.status).toBe(true);
    });
  });

  // =========================================================================
  // runPgpSetup Tests - Status Mode
  // =========================================================================

  describe('runPgpSetup() - status mode', () => {
    it('should return success with status flag', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runPgpSetup({
        status: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('status');

      consoleSpy.mockRestore();
    });

    it('should return key status info', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runPgpSetup({
        status: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.result).toBeDefined();
      expect(result.result.hasKey).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should show signed files when key exists', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create config with fingerprint
      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        "fingerprint: 'TESTKEY'\n"
      );

      const result = await module.runPgpSetup({
        status: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.result.hasKey).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // runPgpSetup Tests - Sign Mode
  // =========================================================================

  describe('runPgpSetup() - sign mode', () => {
    it('should fail if no key exists', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runPgpSetup({
        sign: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('sign');
      expect(result.error).toContain('No key available');

      consoleSpy.mockRestore();
    });

    it('should attempt to sign files when key exists in config', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create config with fingerprint
      const configDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        path.join(configDir, 'pgp-config.yaml'),
        "fingerprint: 'TESTKEY'\n"
      );

      const result = await module.runPgpSetup({
        sign: true,
        projectRoot: tempDir,
        silent: true
      });

      // The action should be 'sign' regardless of success
      // (actual signing requires GPG key to exist)
      expect(result.action).toBe('sign');
      // result will include the signing result (success or failure depending on GPG)
      expect(result.result).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // ESM Compatibility Tests
  // =========================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should import from local modules', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\/gpg-checker\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/key-generator\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/key-export\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/config-signer\.js['"]/);
    });

    it('should import chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });

    it('should import prompts abstraction', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\.\/\.\.\/cli\/prompts\.js['"]/);
    });

    it('should have shebang for node execution', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  // =========================================================================
  // Module Structure Tests
  // =========================================================================

  describe('Module Structure', () => {
    it('should have displayBanner function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+displayBanner/);
    });

    it('should have parseArgs function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+parseArgs/);
    });

    it('should have showHelp function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+showHelp/);
    });

    it('should have ESM entry point detection', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.argv\[1\]\s*===\s*fileURLToPath\(import\.meta\.url\)/);
    });

    it('should have performKeyGeneration function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/async\s+function\s+performKeyGeneration/);
    });
  });

  // =========================================================================
  // Exit Code Tests
  // =========================================================================

  describe('Exit Codes', () => {
    it('should exit with code 0 on success', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.exit\(0\)/);
    });

    it('should exit with code 1 on failure', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.exit\(1\)/);
    });
  });

  // =========================================================================
  // Error Handling Tests
  // =========================================================================

  describe('Error Handling', () => {
    it('should catch and handle errors', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\.catch\(/);
    });

    it('should support DEBUG environment variable', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.env\.DEBUG/);
    });
  });

  // =========================================================================
  // Silent Mode Tests
  // =========================================================================

  describe('Silent Mode', () => {
    it('should not display banner in silent mode', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await module.runPgpSetup({
        status: true,
        projectRoot: tempDir,
        silent: true
      });

      const bannerCalls = consoleSpy.mock.calls.filter(c =>
        typeof c[0] === 'string' && c[0].includes('BMAD PGP Setup Wizard')
      );
      expect(bannerCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // Default Export Tests
  // =========================================================================

  describe('Default Export', () => {
    it('should have default export with all functions', async () => {
      const module = await import('./index.js');

      expect(module.default).toBeDefined();
      expect(module.default.runPgpSetup).toBeDefined();
      expect(module.default.showCurrentKeyStatus).toBeDefined();
      expect(module.default.showSignedFilesStatus).toBeDefined();
      expect(module.default.readPgpConfig).toBeDefined();
      expect(module.default.writePgpConfig).toBeDefined();
      expect(module.default.parseArgs).toBeDefined();
      expect(module.default.VERSION).toBeDefined();
      expect(module.default.HELP_TEXT).toBeDefined();
      expect(module.default.PGP_CONFIG_PATH).toBeDefined();
    });
  });

  // =========================================================================
  // Prompt Function Exports Tests
  // =========================================================================

  describe('Prompt Function Exports', () => {
    it('should export promptForAction function', async () => {
      const module = await import('./index.js');
      expect(module.promptForAction).toBeDefined();
      expect(typeof module.promptForAction).toBe('function');
    });

    it('should export confirmKeyGeneration function', async () => {
      const module = await import('./index.js');
      expect(module.confirmKeyGeneration).toBeDefined();
      expect(typeof module.confirmKeyGeneration).toBe('function');
    });

    it('should export confirmReplaceKey function', async () => {
      const module = await import('./index.js');
      expect(module.confirmReplaceKey).toBeDefined();
      expect(typeof module.confirmReplaceKey).toBe('function');
    });
  });
});
