/**
 * TPI-PRE-4: Settings.json Write Protection Tests
 * ==================================================
 * Verifies that Write/Edit operations targeting .claude/settings.json
 * and .claude/settings.local.json are HARD_BLOCKED with no override.
 */

import { describe, it, expect } from 'vitest';

const { isProtectedSettingsFile, validateSettingsGuard } = await import(
  '../../.claude/validators-node/src/guards/settings-guard.ts'
);

describe('TPI-PRE-4: Settings Guard', () => {
  describe('isProtectedSettingsFile()', () => {
    it('blocks .claude/settings.json', () => {
      const [blocked] = isProtectedSettingsFile('/project/.claude/settings.json');
      expect(blocked).toBe(true);
    });

    it('blocks .claude/settings.local.json', () => {
      const [blocked] = isProtectedSettingsFile('/project/.claude/settings.local.json');
      expect(blocked).toBe(true);
    });

    it('blocks with path traversal attempt', () => {
      const [blocked] = isProtectedSettingsFile('../../.claude/settings.json');
      expect(blocked).toBe(true);
    });

    it('blocks nested path traversal', () => {
      const [blocked] = isProtectedSettingsFile('/tmp/foo/../../project/.claude/settings.json');
      expect(blocked).toBe(true);
    });

    it('allows normal file with "settings" in name', () => {
      const [blocked] = isProtectedSettingsFile('/project/src/settings.json');
      expect(blocked).toBe(false);
    });

    it('allows file in different directory', () => {
      const [blocked] = isProtectedSettingsFile('/project/config/settings.json');
      expect(blocked).toBe(false);
    });

    it('allows settings.json without .claude parent', () => {
      const [blocked] = isProtectedSettingsFile('/project/settings.json');
      expect(blocked).toBe(false);
    });

    it('allows completely unrelated files', () => {
      const [blocked] = isProtectedSettingsFile('/project/src/app.ts');
      expect(blocked).toBe(false);
    });

    it('allows other .claude files', () => {
      const [blocked] = isProtectedSettingsFile('/project/.claude/commands/test.md');
      expect(blocked).toBe(false);
    });

    it('handles empty/null input gracefully', () => {
      const [blocked1] = isProtectedSettingsFile('');
      expect(blocked1).toBe(false);
      const [blocked2] = isProtectedSettingsFile(null);
      expect(blocked2).toBe(false);
    });

    it('returns reason string when blocked', () => {
      const [blocked, reason] = isProtectedSettingsFile('/project/.claude/settings.json');
      expect(blocked).toBe(true);
      expect(reason).toContain('settings.json');
      expect(reason).toContain('blocked');
    });
  });

  describe('validateSettingsGuard()', () => {
    it('returns HARD_BLOCK (2) for .claude/settings.json', () => {
      const exitCode = validateSettingsGuard('/project/.claude/settings.json');
      expect(exitCode).toBe(2);
    });

    it('returns HARD_BLOCK (2) for .claude/settings.local.json', () => {
      const exitCode = validateSettingsGuard('/project/.claude/settings.local.json');
      expect(exitCode).toBe(2);
    });

    it('returns ALLOW (0) for normal files', () => {
      const exitCode = validateSettingsGuard('/project/src/index.ts');
      expect(exitCode).toBe(0);
    });

    it('returns HARD_BLOCK for path traversal to settings.json', () => {
      const exitCode = validateSettingsGuard('../../.claude/settings.json');
      expect(exitCode).toBe(2);
    });
  });

  describe('settings.json hook wiring', () => {
    it('settings-guard.js is first hook for Write matcher', async () => {
      const fs = await import('fs');
      const settingsPath = new URL('../../.claude/settings.json', import.meta.url).pathname;
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      const writeEntry = settings.hooks.PreToolUse.find(
        (e) => e.matcher === 'Write'
      );
      expect(writeEntry).toBeDefined();
      expect(writeEntry.hooks[0].command).toContain('settings-guard.js');
    });

    it('settings-guard.js is first hook for Edit matcher', async () => {
      const fs = await import('fs');
      const settingsPath = new URL('../../.claude/settings.json', import.meta.url).pathname;
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      const editEntry = settings.hooks.PreToolUse.find(
        (e) => e.matcher === 'Edit'
      );
      expect(editEntry).toBeDefined();
      expect(editEntry.hooks[0].command).toContain('settings-guard.js');
    });

    it('total hook count is at least 57 after adding settings-guard', async () => {
      const fs = await import('fs');
      const settingsPath = new URL('../../.claude/settings.json', import.meta.url).pathname;
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      let totalHooks = 0;
      for (const event of Object.values(settings.hooks)) {
        for (const entry of event) {
          totalHooks += entry.hooks?.length || 0;
        }
      }
      expect(totalHooks).toBeGreaterThanOrEqual(57);
    });
  });
});
