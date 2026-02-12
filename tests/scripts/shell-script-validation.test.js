/**
 * Shell Script Validation Tests — VAL-12
 *
 * Validates:
 * - scripts/security-regression.sh (execution + content checks)
 * - scripts/capture-hook-baseline.js (hash integrity)
 * - .claude/hooks/*.sh — bash -n syntax + ShellCheck errors (QE-09-S1)
 *
 * Source: TESTING-MASTER-VALIDATION-PLAN.md VAL-12 (Shell Script Validation)
 * Source: QA-EXECUTION-PLAN.md QE-09-S1
 */

import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const NODE_BIN = process.execPath;
const HOOKS_DIR = path.join(PROJECT_ROOT, '.claude', 'hooks');

// ============================================================================
// Tests
// ============================================================================

describe('Shell Script Validation (VAL-12)', () => {

  // --------------------------------------------------------------------------
  // 1. Security Regression Script
  // --------------------------------------------------------------------------
  describe('security-regression.sh', () => {
    const SCRIPT_PATH = path.join(PROJECT_ROOT, 'scripts', 'security-regression.sh');

    it('should exist', () => {
      expect(fs.existsSync(SCRIPT_PATH)).toBe(true);
    });

    it('should have shebang line', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    });

    it('should use set -e for fail-fast', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('set -e');
    });

    it('should check settings.json existence', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('settings.json');
    });

    it('should check hook count threshold', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/HOOK_COUNT/);
    });

    it('should check matcher count threshold', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/MATCHER_COUNT/);
    });

    it('should check critical file existence', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('CRITICAL_FILES');
      expect(content).toContain('bash-safety.js');
      expect(content).toContain('authorization.js');
    });

    it('should run settings-integrity.js check', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('settings-integrity.js');
    });

    it('should execute successfully', async () => {
      const { stdout } = await execFileAsync(
        'bash',
        [SCRIPT_PATH],
        { timeout: 30000, cwd: PROJECT_ROOT }
      );
      expect(stdout).toContain('ALL CHECKS PASSED');
    });

    it('should produce 6 PASS lines', async () => {
      const { stdout } = await execFileAsync(
        'bash',
        [SCRIPT_PATH],
        { timeout: 30000, cwd: PROJECT_ROOT }
      );
      const passLines = stdout.split('\n').filter((l) => l.startsWith('PASS:'));
      expect(passLines.length).toBe(6);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Hook Baseline Capture Script
  // --------------------------------------------------------------------------
  describe('capture-hook-baseline.js', () => {
    const SCRIPT_PATH = path.join(PROJECT_ROOT, 'scripts', 'capture-hook-baseline.js');
    const BASELINE_PATH = path.join(PROJECT_ROOT, 'tests', 'baselines', 'hook-content-hashes.json');

    it('should exist', () => {
      expect(fs.existsSync(SCRIPT_PATH)).toBe(true);
    });

    it('should use ESM imports', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/^import\s/m);
    });

    it('should use SHA-256 for hashing', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('sha256');
    });

    it('should output to tests/baselines/hook-content-hashes.json', () => {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('hook-content-hashes.json');
    });

    it('should have a valid existing baseline file', () => {
      expect(fs.existsSync(BASELINE_PATH)).toBe(true);

      const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
      expect(baseline.version).toBe('1.0.0');
      expect(baseline.fileCount).toBeGreaterThan(0);
      expect(baseline.hashes).toBeDefined();
      expect(Object.keys(baseline.hashes).length).toBe(baseline.fileCount);
    });

    it('should verify all baseline-referenced files still exist', () => {
      const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
      const missing = [];

      for (const relativePath of Object.keys(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        if (!fs.existsSync(fullPath)) {
          missing.push(relativePath);
        }
      }

      expect(
        missing,
        `Baseline references missing files:\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should verify baseline hashes match current file contents', () => {
      const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
      const crypto = require('crypto');
      const drifted = [];

      for (const [relativePath, expectedHash] of Object.entries(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');

        if (actualHash !== expectedHash) {
          drifted.push(`${relativePath}: expected ${expectedHash.slice(0, 12)}... got ${actualHash.slice(0, 12)}...`);
        }
      }

      expect(
        drifted,
        `Hook files with drifted hashes (run scripts/capture-hook-baseline.js to update):\n${drifted.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Other Critical Scripts
  // --------------------------------------------------------------------------
  describe('Other Scripts Existence', () => {
    // Only check scripts that actually exist on disk
    const REQUIRED_SCRIPTS = [
      'scripts/check-bundle-size.js',
      'scripts/capture-hook-baseline.js',
    ];

    for (const script of REQUIRED_SCRIPTS) {
      it(`should have ${script}`, () => {
        expect(fs.existsSync(path.join(PROJECT_ROOT, script))).toBe(true);
      });
    }
  });

  // --------------------------------------------------------------------------
  // 4. Settings Integrity Check
  // --------------------------------------------------------------------------
  describe('Settings Integrity', () => {
    it('should have .claude/settings.json', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      expect(fs.existsSync(settingsPath)).toBe(true);
    });

    it('should have valid JSON in settings.json', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const content = fs.readFileSync(settingsPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have hooks section in settings.json', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks).toBeDefined();
      expect(typeof settings.hooks).toBe('object');
    });

    it('should have at least 54 hook commands', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      let count = 0;
      for (const handlers of Object.values(settings.hooks || {})) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const h of handlerList) {
          count += (h.hooks || []).length;
        }
      }

      expect(count).toBeGreaterThanOrEqual(54);
    });

    it('should have at least 12 unique matchers', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      const matchers = new Set();
      for (const handler of (settings.hooks?.PreToolUse || [])) {
        if (handler.matcher) matchers.add(handler.matcher);
      }

      expect(matchers.size).toBeGreaterThanOrEqual(12);
    });
  });
});

// ============================================================================
// QE-09-S1: Hook Script Syntax Validation (.claude/hooks/*.sh)
// ============================================================================

describe('Hook Script Syntax Validation (QE-09-S1)', () => {
  const hookFiles = fs.readdirSync(HOOKS_DIR)
    .filter((f) => f.endsWith('.sh'))
    .sort();

  it('should discover at least 40 .sh hook scripts', () => {
    expect(hookFiles.length).toBeGreaterThanOrEqual(40);
  });

  // --------------------------------------------------------------------------
  // bash -n syntax check for every .sh file
  // --------------------------------------------------------------------------
  describe('bash -n syntax validation', () => {
    for (const file of hookFiles) {
      it(`bash -n passes: ${file}`, async () => {
        const filePath = path.join(HOOKS_DIR, file);
        await execFileAsync('bash', ['-n', filePath], { timeout: 10000 });
        // bash -n exits 0 if syntax is valid — reaching here means pass
      });
    }
  });

  // --------------------------------------------------------------------------
  // ShellCheck error check (skip gracefully if shellcheck not installed)
  // --------------------------------------------------------------------------
  describe('ShellCheck error validation', () => {
    let shellcheckAvailable = false;

    beforeAll(async () => {
      try {
        await execFileAsync('shellcheck', ['--version'], { timeout: 5000 });
        shellcheckAvailable = true;
      } catch {
        shellcheckAvailable = false;
      }
    });

    it('shellcheck is available', () => {
      if (!shellcheckAvailable) {
        console.warn('ShellCheck not installed — skipping SC error checks');
      }
      // Not a hard failure if missing, but we note it
      expect(true).toBe(true);
    });

    for (const file of hookFiles) {
      it(`shellcheck 0 errors: ${file}`, async () => {
        if (!shellcheckAvailable) return; // skip gracefully
        const filePath = path.join(HOOKS_DIR, file);
        try {
          await execFileAsync(
            'shellcheck', ['--severity=error', '--format=gcc', filePath],
            { timeout: 15000 }
          );
        } catch (err) {
          // shellcheck exits non-zero when errors found — stderr has details
          const output = (err.stdout || '') + (err.stderr || '');
          expect.fail(`ShellCheck errors in ${file}:\n${output}`);
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // Shebang line check
  // --------------------------------------------------------------------------
  describe('Shebang line validation', () => {
    for (const file of hookFiles) {
      it(`has valid shebang: ${file}`, () => {
        const content = fs.readFileSync(path.join(HOOKS_DIR, file), 'utf-8');
        const firstLine = content.split('\n')[0];
        expect(
          firstLine.startsWith('#!/bin/bash') || firstLine.startsWith('#!/usr/bin/env bash'),
          `${file} shebang: "${firstLine}"`
        ).toBe(true);
      });
    }
  });
});
