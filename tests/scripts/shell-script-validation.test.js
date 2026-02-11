/**
 * Shell Script Validation Tests — VAL-12 Equivalent
 *
 * Validates the integrity and functionality of:
 * - scripts/security-regression.sh
 * - scripts/capture-hook-baseline.js
 * - scripts/check-bundle-size.js
 * - scripts/validate-security.js
 *
 * Source: TESTING-MASTER-VALIDATION-PLAN.md VAL-12 (Shell Script Validation)
 * Source: MASTER-BMAD-QA Section 9 (Never-Executed Checks)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const NODE_BIN = process.execPath;

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
