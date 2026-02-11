/**
 * CLI Install Command Tests
 *
 * Validates tools/cli/commands/install.js structure and help output.
 * Does NOT actually run the install (would modify the filesystem).
 * Tests the command's interface, validation, and error handling.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const CLI_PATH = resolve(import.meta.dirname, '../../tools/cli/bmad-cli.js');
const INSTALL_PATH = resolve(import.meta.dirname, '../../tools/cli/commands/install.js');
const NODE_BIN = process.execPath;
const PROJECT_ROOT = resolve(import.meta.dirname, '../..');

describe('CLI Install Command', () => {

  // --------------------------------------------------------------------------
  // 1. File Existence and Exports
  // --------------------------------------------------------------------------
  describe('Module Structure', () => {
    it('should have install.js command file', () => {
      expect(existsSync(INSTALL_PATH)).toBe(true);
    });

    it('should be importable as ESM', async () => {
      const mod = await import(INSTALL_PATH);
      expect(mod.installCommand).toBeDefined();
      expect(typeof mod.installCommand).toBe('function');
    });

    it('should import from ESM dependencies (not CJS)', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      // Should use ESM imports
      expect(content).toMatch(/^import\s/m);
      // Should not use require()
      expect(content).not.toMatch(/\brequire\(/);
    });

    it('should use prompts abstraction (not inquirer)', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]inquirer['"]/);
    });

    it('should use picocolors or prompts spinner (not ora or chalk)', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]ora['"]/);
      expect(content).not.toMatch(/from\s+['"]chalk['"]/);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Help Output
  // --------------------------------------------------------------------------
  describe('Help Output', () => {
    it('should display install command help', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('Install BMAD-CYBER framework');
    });

    it('should have --version option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('--version');
    });

    it('should have --from-git option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('--from-git');
    });

    it('should have --dry-run option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('--dry-run');
    });

    it('should have --modules option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('--modules');
    });

    it('should have --allow-scripts flag', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'install', '--help'],
        { timeout: 15000 }
      );
      expect(stdout).toContain('--allow-scripts');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Security Checks
  // --------------------------------------------------------------------------
  describe('Security', () => {
    it('should import url-validator for repo URL validation', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).toContain('assertValidRepoUrl');
    });

    it('should validate repo URL before cloning in the install function', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      // Within the installCommand function body, assertValidRepoUrl call
      // should come before cloneRepository call
      const funcStart = content.indexOf('async function installCommand') || content.indexOf('export async function installCommand');
      const funcBody = content.slice(funcStart);
      const validatorIdx = funcBody.indexOf('assertValidRepoUrl(');
      const cloneIdx = funcBody.indexOf('cloneRepository(');
      expect(validatorIdx).toBeGreaterThan(0);
      expect(cloneIdx).toBeGreaterThan(0);
      expect(validatorIdx).toBeLessThan(cloneIdx);
    });

    it('should have graceful shutdown handler for SIGINT', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).toContain('SIGINT');
    });

    it('should have rollback capability', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).toMatch(/rollback/i);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Dependencies
  // --------------------------------------------------------------------------
  describe('Dependencies', () => {
    it('should import from local lib modules', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).toContain('../lib/downloader.js');
      expect(content).toContain('../lib/git-clone.js');
      expect(content).toContain('../lib/extractor.js');
      expect(content).toContain('../lib/package-merger.js');
      expect(content).toContain('../lib/logger.js');
      expect(content).toContain('../lib/url-validator.js');
    });

    it('should use createSpinner from prompts', () => {
      const content = readFileSync(INSTALL_PATH, 'utf-8');
      expect(content).toContain('createSpinner');
    });
  });
});
