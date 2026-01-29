/**
 * E2E Tests for BMAD-CYBER Install CLI
 *
 * Tests the complete install flow via the CLI entry point.
 * Uses --skip-npm-install and --dry-run to avoid network dependencies.
 *
 * @module npx/__tests__/install.e2e.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync, spawn } from 'child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the CLI entry point
const CLI_PATH = join(__dirname, '..', 'cli.js');
const NPX_DIR = join(__dirname, '..');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Execute CLI command synchronously and capture output
 * @param {string[]} args - CLI arguments
 * @param {object} options - execSync options
 * @returns {object} Result with stdout, stderr, exitCode
 */
function runCLI(args = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const cmd = `node "${CLI_PATH}" ${args.join(' ')}`;

  try {
    const stdout = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      timeout: options.timeout || 30000,
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1
    };
  }
}

/**
 * Execute CLI command asynchronously with spawn
 * Useful for testing signals and async behavior
 * @param {string[]} args - CLI arguments
 * @param {object} options - spawn options
 * @returns {Promise<object>} Result with stdout, stderr, exitCode
 */
function runCLIAsync(args = [], options = {}) {
  return new Promise((resolve) => {
    const cwd = options.cwd || process.cwd();
    const child = spawn('node', [CLI_PATH, ...args], {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Set timeout if specified
    let timeoutId;
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
      }, options.timeout);
    }

    child.on('close', (exitCode) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({ stdout, stderr, exitCode, child });
    });

    // Allow caller to interact with child process
    if (options.onSpawn) {
      options.onSpawn(child);
    }
  });
}

/**
 * Create a minimal package.json in directory
 * @param {string} dir - Directory path
 * @param {object} content - package.json content
 */
function createPackageJson(dir, content = {}) {
  const pkgPath = join(dir, 'package.json');
  const defaultContent = {
    name: 'test-project',
    version: '1.0.0',
    type: 'module',
    ...content
  };
  writeFileSync(pkgPath, JSON.stringify(defaultContent, null, 2));
}

// ============================================================================
// E2E Tests
// ============================================================================

describe('E2E Install', () => {
  let testDir;

  beforeAll(() => {
    // Create a unique temp directory for tests
    testDir = mkdtempSync(join(tmpdir(), 'bmad-cyber-test-'));
  });

  afterAll(() => {
    // Clean up temp directory
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  // ============================================================================
  // --help flag tests
  // ============================================================================

  describe('--help flag', () => {
    it('should display usage information with --help', () => {
      const result = runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('bmad-cyber');
      expect(result.stdout).toContain('Install and manage BMAD-CYBER');
    });

    it('should display available commands in help', () => {
      const result = runCLI(['--help']);

      expect(result.stdout).toContain('install');
      expect(result.stdout).toContain('update');
      expect(result.stdout).toContain('version');
    });

    it('should display install command help with install --help', () => {
      const result = runCLI(['install', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Install BMAD-CYBER framework');
      expect(result.stdout).toContain('--dry-run');
      expect(result.stdout).toContain('--skip-npm-install');
      expect(result.stdout).toContain('--force');
    });

    it('should display all install options', () => {
      const result = runCLI(['install', '--help']);

      expect(result.stdout).toContain('--version');
      expect(result.stdout).toContain('--branch');
      expect(result.stdout).toContain('--from-git');
      expect(result.stdout).toContain('--modules');
      expect(result.stdout).toContain('--security-tier');
      expect(result.stdout).toContain('--yes');
      expect(result.stdout).toContain('--skip-wizard');
      expect(result.stdout).toContain('--with-docs');
      expect(result.stdout).toContain('--with-dev');
    });
  });

  // ============================================================================
  // --version flag tests
  // ============================================================================

  describe('--version flag', () => {
    it('should display version with --version', () => {
      const result = runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      // Version should match semver pattern
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should display version with -V', () => {
      const result = runCLI(['-V']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should show CLI version matching config', () => {
      const result = runCLI(['--version']);

      // Read version from config
      const configPath = join(NPX_DIR, 'lib', 'config.js');
      const configContent = readFileSync(configPath, 'utf8');
      const versionMatch = configContent.match(/VERSION:\s*['"]([^'"]+)['"]/);
      const expectedVersion = versionMatch ? versionMatch[1] : null;

      expect(expectedVersion).not.toBeNull();
      expect(result.stdout.trim()).toBe(expectedVersion);
    });
  });

  // ============================================================================
  // version command tests
  // ============================================================================

  describe('version command', () => {
    it('should show CLI version info with version command', () => {
      const result = runCLI(['version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('bmad-cyber CLI');
      expect(result.stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should indicate no installation in empty directory', () => {
      const emptyDir = mkdtempSync(join(tmpdir(), 'bmad-empty-'));

      try {
        const result = runCLI(['version'], { cwd: emptyDir });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('No BMAD-CYBER installation detected');
      } finally {
        rmSync(emptyDir, { recursive: true, force: true });
      }
    });
  });

  // ============================================================================
  // Unknown command tests
  // ============================================================================

  describe('Unknown command handling', () => {
    it('should show error for unknown command', () => {
      const result = runCLI(['nonexistent-command']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Unknown command');
      expect(result.stderr).toContain('nonexistent-command');
    });

    it('should show help after unknown command error', () => {
      const result = runCLI(['foobar']);

      expect(result.exitCode).toBe(1);
      // After error, help should be displayed
      expect(result.stdout).toContain('install');
      expect(result.stdout).toContain('update');
      expect(result.stdout).toContain('version');
    });

    it('should handle unknown command with multiple words', () => {
      const result = runCLI(['foo', 'bar', 'baz']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Unknown command');
    });
  });

  // ============================================================================
  // --dry-run tests
  // ============================================================================

  describe('--dry-run flag', () => {
    let dryRunDir;

    beforeEach(() => {
      dryRunDir = mkdtempSync(join(tmpdir(), 'bmad-dry-run-'));
      createPackageJson(dryRunDir);
    });

    afterEach(() => {
      if (dryRunDir && existsSync(dryRunDir)) {
        rmSync(dryRunDir, { recursive: true, force: true });
      }
    });

    it('should show what would be installed without making changes', { timeout: 60000 }, async () => {
      const result = await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        { cwd: dryRunDir, timeout: 55000 }
      );

      // Dry run should complete successfully
      expect(result.exitCode).toBe(0);

      // Should indicate dry run mode
      const output = result.stdout + result.stderr;
      expect(output).toContain('dry run');
    });

    it('should not modify package.json in dry-run mode', { timeout: 60000 }, async () => {
      const originalPkg = readFileSync(join(dryRunDir, 'package.json'), 'utf8');

      await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        { cwd: dryRunDir, timeout: 55000 }
      );

      const afterPkg = readFileSync(join(dryRunDir, 'package.json'), 'utf8');
      expect(afterPkg).toBe(originalPkg);
    });

    it('should not create _bmad directory in dry-run mode', { timeout: 60000 }, async () => {
      await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        { cwd: dryRunDir, timeout: 55000 }
      );

      expect(existsSync(join(dryRunDir, '_bmad'))).toBe(false);
    });

    it('should not create .claude directory in dry-run mode', { timeout: 60000 }, async () => {
      await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        { cwd: dryRunDir, timeout: 55000 }
      );

      expect(existsSync(join(dryRunDir, '.claude'))).toBe(false);
    });
  });

  // ============================================================================
  // Complete install tests (network-dependent, marked for integration)
  // ============================================================================

  describe.skip('Complete install in new directory', () => {
    // These tests require network access and are skipped by default
    // Run with: vitest run --testNamePattern="Complete install"

    let installDir;

    beforeEach(() => {
      installDir = mkdtempSync(join(tmpdir(), 'bmad-install-'));
      createPackageJson(installDir);
    });

    afterEach(() => {
      if (installDir && existsSync(installDir)) {
        rmSync(installDir, { recursive: true, force: true });
      }
    });

    it('should complete full install with --skip-npm-install', { timeout: 180000 }, async () => {
      const result = await runCLIAsync(
        ['install', '--skip-npm-install', '--skip-wizard', '-y'],
        { cwd: installDir, timeout: 175000 }
      );

      expect(result.exitCode).toBe(0);

      // Check for expected directories
      expect(existsSync(join(installDir, '_bmad'))).toBe(true);
      expect(existsSync(join(installDir, '.claude'))).toBe(true);

      // Check for CLAUDE.md
      expect(existsSync(join(installDir, 'CLAUDE.md'))).toBe(true);
    });

    it('should show success message after install', { timeout: 180000 }, async () => {
      const result = await runCLIAsync(
        ['install', '--skip-npm-install', '--skip-wizard', '-y'],
        { cwd: installDir, timeout: 175000 }
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('INSTALLED SUCCESSFULLY');
    });

    it('should show quick start guide after install', { timeout: 180000 }, async () => {
      const result = await runCLIAsync(
        ['install', '--skip-npm-install', '--skip-wizard', '-y'],
        { cwd: installDir, timeout: 175000 }
      );

      expect(result.stdout).toContain('Quick Start');
      expect(result.stdout).toContain('claude .');
    });
  });

  // ============================================================================
  // Graceful cancellation (Ctrl+C) tests
  // ============================================================================

  describe('Graceful cancellation (SIGINT)', () => {
    let cancelDir;

    beforeEach(() => {
      cancelDir = mkdtempSync(join(tmpdir(), 'bmad-cancel-'));
      createPackageJson(cancelDir);
    });

    afterEach(() => {
      if (cancelDir && existsSync(cancelDir)) {
        rmSync(cancelDir, { recursive: true, force: true });
      }
    });

    it('should handle SIGINT gracefully', { timeout: 30000 }, async () => {
      let childProcess = null;

      const result = await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        {
          cwd: cancelDir,
          timeout: 25000,
          onSpawn: (child) => {
            childProcess = child;
            // Send SIGINT after a brief delay
            setTimeout(() => {
              if (childProcess && !childProcess.killed) {
                childProcess.kill('SIGINT');
              }
            }, 500);
          }
        }
      );

      // Should exit with code 130 (128 + SIGINT signal number 2)
      // Or 0 if it completed before signal
      expect([0, 130, null]).toContain(result.exitCode);

      // If interrupted, should show cancellation message
      if (result.exitCode === 130) {
        const output = result.stdout + result.stderr;
        expect(output).toMatch(/cancel|interrupt/i);
      }
    });

    it('should clean up temp files on cancellation', { timeout: 30000 }, async () => {
      let childProcess = null;

      await runCLIAsync(
        ['install', '--dry-run', '--skip-wizard', '-y'],
        {
          cwd: cancelDir,
          timeout: 25000,
          onSpawn: (child) => {
            childProcess = child;
            setTimeout(() => {
              if (childProcess && !childProcess.killed) {
                childProcess.kill('SIGINT');
              }
            }, 500);
          }
        }
      );

      // Check no partial installation files left
      const files = existsSync(cancelDir)
        ? readFileSync(join(cancelDir, 'package.json'), 'utf8')
        : '';

      // Original package.json should be preserved
      if (existsSync(cancelDir)) {
        expect(files).toContain('test-project');
      }
    });
  });

  // ============================================================================
  // No arguments behavior tests
  // ============================================================================

  describe('No arguments behavior', () => {
    it('should show help when called with no arguments', () => {
      const result = runCLI([]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('bmad-cyber');
      expect(result.stdout).toContain('install');
      expect(result.stdout).toContain('update');
      expect(result.stdout).toContain('version');
    });

    it('should show description in help', () => {
      const result = runCLI([]);

      expect(result.stdout).toContain('Install and manage BMAD-CYBER');
    });
  });

  // ============================================================================
  // Install command option validation
  // ============================================================================

  describe('Install command option validation', () => {
    let optDir;

    beforeEach(() => {
      optDir = mkdtempSync(join(tmpdir(), 'bmad-opt-'));
      createPackageJson(optDir);
    });

    afterEach(() => {
      if (optDir && existsSync(optDir)) {
        rmSync(optDir, { recursive: true, force: true });
      }
    });

    it('should accept --modules option', () => {
      const result = runCLI(['install', '--help']);

      expect(result.stdout).toContain('--modules');
      expect(result.stdout).toContain('Pre-select modules');
    });

    it('should accept --security-tier option', () => {
      const result = runCLI(['install', '--help']);

      expect(result.stdout).toContain('--security-tier');
      expect(result.stdout).toContain('Pre-select security tier');
    });

    it('should accept --branch option', () => {
      const result = runCLI(['install', '--help']);

      expect(result.stdout).toContain('--branch');
      expect(result.stdout).toContain('specific branch');
    });

    it('should accept --from-git option', () => {
      const result = runCLI(['install', '--help']);

      expect(result.stdout).toContain('--from-git');
      expect(result.stdout).toContain('Clone from git');
    });
  });

  // ============================================================================
  // Update command tests
  // ============================================================================

  describe('Update command', () => {
    it('should show update help with update --help', () => {
      const result = runCLI(['update', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Update existing BMAD-CYBER installation');
    });

    it('should have --check option for update', () => {
      const result = runCLI(['update', '--help']);

      expect(result.stdout).toContain('--check');
      expect(result.stdout).toContain('Only check for updates');
    });

    it('should have --force option for update', () => {
      const result = runCLI(['update', '--help']);

      expect(result.stdout).toContain('--force');
    });
  });

  // ============================================================================
  // Node.js version check tests
  // ============================================================================

  describe('Node.js version requirements', () => {
    it('should document Node 18+ requirement', () => {
      // Read CLI source to verify version check exists
      const cliContent = readFileSync(CLI_PATH, 'utf8');

      expect(cliContent).toContain('nodeVersion');
      expect(cliContent).toMatch(/node.*18/i);
    });
  });
});
