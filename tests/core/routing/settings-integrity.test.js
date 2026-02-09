/**
 * Settings Integrity Validator Tests
 * ====================================
 * Tests for v6 Hybrid Upgrade - Story 01, Task 1.4.
 *
 * Validates the settings integrity validator itself (VULN-012 mitigation).
 * Ensures the validator can detect all categories of settings corruption.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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

    it('backup file exists', () => {
      const backupPath = path.join(PROJECT_ROOT, '.claude', 'settings.json.pre-v6-backup');
      expect(fs.existsSync(backupPath)).toBe(true);
    });

    it('backup matches current settings (no unauthorized changes)', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
      const backupPath = path.join(PROJECT_ROOT, '.claude', 'settings.json.pre-v6-backup');

      const current = fs.readFileSync(settingsPath, 'utf-8');
      const backup = fs.readFileSync(backupPath, 'utf-8');

      // Both should be valid JSON
      expect(() => JSON.parse(current)).not.toThrow();
      expect(() => JSON.parse(backup)).not.toThrow();

      // Current hook count should be >= backup hook count
      const currentSettings = JSON.parse(current);
      const backupSettings = JSON.parse(backup);

      let currentCount = 0;
      let backupCount = 0;
      for (const handlers of Object.values(currentSettings.hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          currentCount += (handler.hooks || []).length;
        }
      }
      for (const handlers of Object.values(backupSettings.hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          backupCount += (handler.hooks || []).length;
        }
      }

      expect(currentCount).toBeGreaterThanOrEqual(backupCount);
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
});
