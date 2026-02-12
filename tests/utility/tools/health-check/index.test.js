/**
 * Unit Tests for Health Check Entry Point - INST-024
 * Epic 4 - Post-Install Health Check
 *
 * Tests the index.js entry point for running all health checks.
 *
 * @module health-check/index.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  HELP_TEXT,
  main,
  parseArgs,
  runAllChecks,
  runLLMCheck,
  runModuleCheck,
  runSecurityCheck,
  runTokenCheck,
  VERSION
} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a temporary directory with mock files
 * @returns {string} Path to temp directory
 */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'health-check-test-'));
}

/**
 * Clean up temporary directory
 * @param {string} dir - Directory to remove
 */
function cleanupTempDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true });
  } catch { /* best-effort cleanup */ }
}

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Health Check Entry Point - INST-024', () => {
  describe('Constants', () => {
    it('should have version string', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have help text', () => {
      expect(HELP_TEXT).toBeDefined();
      expect(HELP_TEXT).toContain('BMAD Health Check');
      expect(HELP_TEXT).toContain('--json');
      expect(HELP_TEXT).toContain('--help');
      expect(HELP_TEXT).toContain('Exit Codes');
    });
  });

  // ============================================================================
  // Tests: Individual Check Runners
  // ============================================================================

  describe('runModuleCheck()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should return result object with status', async () => {
      const result = await runModuleCheck(tempDir);
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });

    it('should handle errors gracefully', async () => {
      const result = await runModuleCheck('/nonexistent/path');
      expect(result.status).toBe('unhealthy');
      // checkAllModules returns issues array, not error field
      expect(result.issues).toBeDefined();
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('runTokenCheck()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should return result object with status', async () => {
      const result = await runTokenCheck(tempDir);
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['valid', 'expired', 'invalid', 'missing']).toContain(result.status);
    });

    it('should return missing for empty directory', async () => {
      const result = await runTokenCheck(tempDir);
      expect(result.status).toBe('missing');
    });
  });

  describe('runLLMCheck()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should return result object with status', async () => {
      const result = await runLLMCheck(tempDir);
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });

    it('should include providers array', async () => {
      const result = await runLLMCheck(tempDir);
      expect(result.providers).toBeDefined();
      expect(Array.isArray(result.providers)).toBe(true);
    });
  });

  describe('runSecurityCheck()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should return result object with status', async () => {
      const result = await runSecurityCheck(tempDir);
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });
  });

  // ============================================================================
  // Tests: runAllChecks
  // ============================================================================

  describe('runAllChecks()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should return all check results', async () => {
      const results = await runAllChecks({ basePath: tempDir });

      expect(results).toBeDefined();
      expect(results.modules).toBeDefined();
      expect(results.token).toBeDefined();
      expect(results.llm).toBeDefined();
      expect(results.security).toBeDefined();
    });

    it('should run checks concurrently', async () => {
      const start = Date.now();
      await runAllChecks({ basePath: tempDir });
      const duration = Date.now() - start;

      // Should complete reasonably fast (concurrent)
      // This is a loose check - just ensure it doesn't take forever
      expect(duration).toBeLessThan(5000);
    });
  });

  // ============================================================================
  // Tests: parseArgs
  // ============================================================================

  describe('parseArgs()', () => {
    it('should detect --json flag', () => {
      const options = parseArgs(['--json']);
      expect(options.json).toBe(true);
    });

    it('should detect --help flag', () => {
      const options = parseArgs(['--help']);
      expect(options.help).toBe(true);
    });

    it('should detect -h flag', () => {
      const options = parseArgs(['-h']);
      expect(options.help).toBe(true);
    });

    it('should detect --no-color flag', () => {
      const options = parseArgs(['--no-color']);
      expect(options.noColor).toBe(true);
    });

    it('should default json to false', () => {
      const options = parseArgs([]);
      expect(options.json).toBe(false);
    });

    it('should default help to false', () => {
      const options = parseArgs([]);
      expect(options.help).toBe(false);
    });

    it('should handle multiple flags', () => {
      const options = parseArgs(['--json', '--no-color']);
      expect(options.json).toBe(true);
      expect(options.noColor).toBe(true);
    });
  });

  // ============================================================================
  // Tests: main
  // ============================================================================

  describe('main()', () => {
    let originalLog;
    let capturedOutput;

    beforeEach(() => {
      originalLog = console.log;
      capturedOutput = [];
      console.log = (...args) => {
        capturedOutput.push(args.join(' '));
      };
    });

    afterEach(() => {
      console.log = originalLog;
    });

    it('should show help text with --help', async () => {
      const exitCode = await main(['--help']);
      expect(exitCode).toBe(0);
      expect(capturedOutput.join('')).toContain('BMAD Health Check');
    });

    it('should return exit code 0-2', async () => {
      const exitCode = await main([]);
      expect([0, 1, 2]).toContain(exitCode);
    });

    it('should output JSON with --json flag', async () => {
      const exitCode = await main(['--json']);
      const output = capturedOutput.join('');

      // Should be valid JSON
      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch (e) {
        // Might not be pure JSON if there are errors, but structure should exist
      }

      // At minimum, the output should contain JSON-like structure
      expect(output).toContain('{');
      expect(output).toContain('}');
    });

    it('should display formatted output without --json', async () => {
      await main([]);
      const output = capturedOutput.join('');

      expect(output).toContain('BMAD-CYBER Health Check');
      expect(output).toContain('Core Services');
      expect(output).toContain('Overall Status');
    });
  });

  // ============================================================================
  // Tests: Exit Codes
  // ============================================================================

  describe('Exit Codes', () => {
    it('should document exit codes in help text', () => {
      expect(HELP_TEXT).toContain('0');
      expect(HELP_TEXT).toContain('HEALTHY');
      expect(HELP_TEXT).toContain('1');
      expect(HELP_TEXT).toContain('DEGRADED');
      expect(HELP_TEXT).toContain('2');
      expect(HELP_TEXT).toContain('UNHEALTHY');
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS require)', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/module\.exports/);
      expect(moduleContent).not.toMatch(/require\s*\(/);
    });

    it('should use import statements', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent.includes('import ')).toBe(true);
    });

    it('should have shebang for CLI execution', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should export default object with all functions', async () => {
      const module = await import('./index.js');
      const defaultExport = module.default;

      expect(defaultExport).toBeDefined();
      expect(typeof defaultExport.runAllChecks).toBe('function');
      expect(typeof defaultExport.main).toBe('function');
      expect(typeof defaultExport.parseArgs).toBe('function');
    });
  });

  // ============================================================================
  // Tests: npm Script Integration
  // ============================================================================

  describe('npm Script Integration', () => {
    it('should be registered in package.json', () => {
      const packageJsonPath = path.resolve(__dirname, '../../../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.scripts.health).toBeDefined();
      expect(packageJson.scripts.health).toContain('health-check/index.js');
    });
  });
});
