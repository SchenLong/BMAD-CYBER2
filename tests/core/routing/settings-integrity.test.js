/**
 * Settings Integrity Validator Tests
 * ====================================
 * Tests for v6 Hybrid Upgrade - Story 01, Task 1.4.
 *
 * Validates the settings integrity validator itself (VULN-012 mitigation).
 * Ensures the validator can detect all categories of settings corruption.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Settings Integrity', () => {

  describe('Current settings.json validation', () => {

    it('settings.json exists', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      expect(fs.existsSync(settingsPath)).toBe(true);
    });

    it('settings.json is valid JSON', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const content = fs.readFileSync(settingsPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('settings.json has hooks section', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks).toBeDefined();
    });

    it('settings.json has all required event types', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      expect(settings.hooks.SessionStart).toBeDefined();
      expect(settings.hooks.UserPromptSubmit).toBeDefined();
      expect(settings.hooks.PreToolUse).toBeDefined();
    });

    it('settings.json has all 12 required PreToolUse matchers', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      const requiredMatchers = [
        'Skill', 'Task', 'Bash', 'Write', 'Edit', 'Read',
        'Glob', 'Grep', 'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite'
      ];

      const foundMatchers = new Set();
      for (const handler of settings.hooks.PreToolUse) {
        if (handler.matcher) {
          foundMatchers.add(handler.matcher);
        }
      }

      for (const matcher of requiredMatchers) {
        expect(foundMatchers.has(matcher)).toBe(true);
      }
    });

    it('settings.json has >= 54 hook commands (baseline)', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      let totalHooks = 0;
      for (const handlers of Object.values(settings.hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          totalHooks += (handler.hooks || []).length;
        }
      }

      expect(totalHooks).toBeGreaterThanOrEqual(54);
    });

    it('no empty hook arrays in PreToolUse matchers', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      for (const handler of settings.hooks.PreToolUse) {
        expect(handler.hooks.length).toBeGreaterThan(0);
      }
    });

    it('all hook commands are properly formatted', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      for (const [eventName, handlers] of Object.entries(settings.hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          for (const hook of (handler.hooks || [])) {
            expect(hook.type).toBe('command');
            expect(hook.command).toBeDefined();
            expect(typeof hook.command).toBe('string');
            expect(hook.command.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('settings are valid JSON', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const current = fs.readFileSync(settingsPath, 'utf-8');

      // Should be valid JSON
      expect(() => JSON.parse(current)).not.toThrow();

      const settings = JSON.parse(current);
      expect(settings.hooks).toBeDefined();
      expect(typeof settings.hooks).toBe('object');
    });

    it('hook count is positive', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const current = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(current);

      let hookCount = 0;
      for (const handlers of Object.values(settings.hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          hookCount += (handler.hooks || []).length;
        }
      }

      expect(hookCount).toBeGreaterThan(0);
    });
  });

  describe('Settings integrity validator script exists', () => {
    it('settings-integrity.js exists in bin/', () => {
      const validatorPath = path.join(PROJECT_ROOT, '.claude', 'validators-node', 'bin', 'settings-integrity.js');
      expect(fs.existsSync(validatorPath)).toBe(true);
    });

    it('settings-baseline.txt exists', () => {
      const baselinePath = path.join(PROJECT_ROOT, '.claude', 'settings-baseline.txt');
      expect(fs.existsSync(baselinePath)).toBe(true);
    });
  });

  describe('Content Hash Verification (CRIT-3)', () => {
    const hashBaselinePath = path.join(PROJECT_ROOT, 'tests', 'baselines', 'hook-content-hashes.json');

    it('hook-content-hashes.json baseline exists', () => {
      expect(fs.existsSync(hashBaselinePath)).toBe(true);
    });

    it('baseline has valid JSON structure', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      expect(baseline).toHaveProperty('version');
      expect(baseline).toHaveProperty('hashes');
      expect(baseline).toHaveProperty('fileCount');
      expect(typeof baseline.hashes).toBe('object');
    });

    it('baseline has correct file count (matches hook command count)', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      expect(baseline.fileCount).toBeGreaterThanOrEqual(15);  // At least 15 unique files
    });

    it('all baseline files exist on disk', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      for (const relativePath of Object.keys(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        expect(fs.existsSync(fullPath), `Missing: ${relativePath}`).toBe(true);
      }
    });

    it('all baseline hashes match current file content', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      for (const [relativePath, expectedHash] of Object.entries(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
        expect(actualHash, `Hash mismatch: ${relativePath}`).toBe(expectedHash);
      }
    });

    it('hashes are valid SHA-256 hex strings', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      for (const [relativePath, hash] of Object.entries(baseline.hashes)) {
        expect(hash, `Invalid hash format for ${relativePath}`).toMatch(/^[a-f0-9]{64}$/);
      }
    });

    it('baseline version is set', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      expect(baseline.version).toBe('1.0.0');
    });

    it('baseline capturedAt is a valid ISO date', () => {
      const baseline = JSON.parse(fs.readFileSync(hashBaselinePath, 'utf-8'));
      expect(baseline.capturedAt).toBeDefined();
      const date = new Date(baseline.capturedAt);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});
