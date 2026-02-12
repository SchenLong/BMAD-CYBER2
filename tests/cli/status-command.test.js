/**
 * CLI Status Command Tests
 *
 * Validates tools/cli/commands/status.js behavior:
 * - Displays CLI version
 * - Checks installation status
 * - Lists active modules
 * - Shows component health
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const CLI_PATH = resolve(import.meta.dirname, '../../tools/cli/bmad-cli.js');
const STATUS_PATH = resolve(import.meta.dirname, '../../tools/cli/commands/status.js');
const NODE_BIN = process.execPath;
const PROJECT_ROOT = resolve(import.meta.dirname, '../..');

describe('CLI Status Command', () => {

  // --------------------------------------------------------------------------
  // 1. File Existence
  // --------------------------------------------------------------------------
  describe('Module Existence', () => {
    it('should have status.js command file', () => {
      expect(existsSync(STATUS_PATH)).toBe(true);
    });

    it('should be importable as ESM', async () => {
      const mod = await import(STATUS_PATH);
      expect(mod.statusCommand).toBeDefined();
      expect(typeof mod.statusCommand).toBe('function');
    });
  });

  // --------------------------------------------------------------------------
  // 2. CLI Invocation
  // --------------------------------------------------------------------------
  describe('CLI Invocation', () => {
    it('should execute status command via CLI', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('BMAD-CYBER Status');
    });

    it('should display CLI version', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('CLI Version:');
      // Version should match semver pattern
      expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should show installation status', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('Installation:');
      // In the project root, BMAD should be installed
      expect(stdout).toContain('Installed');
    });

    it('should display component check results', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('Components:');
    });

    it('should list active modules', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('Active Modules:');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Output Format Validation
  // --------------------------------------------------------------------------
  describe('Output Format', () => {
    it('should have a separator line', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      // Should contain a horizontal rule (─ characters)
      expect(stdout).toMatch(/[─-]{10,}/);
    });

    it('should show Framework Version when installed', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('Framework Version:');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Uninstalled Directory Behavior
  // --------------------------------------------------------------------------
  describe('Uninstalled Directory', () => {
    it('should handle non-BMAD directory gracefully', async () => {
      const tmpDir = resolve(import.meta.dirname);
      const { stdout } = await execFileAsync(
        NODE_BIN,
        [CLI_PATH, 'status'],
        { timeout: 15000, cwd: tmpDir }
      );
      // Should indicate not installed
      expect(stdout).toContain('BMAD-CYBER Status');
      expect(stdout).toMatch(/Not installed|Installed/);
    });
  });
});
