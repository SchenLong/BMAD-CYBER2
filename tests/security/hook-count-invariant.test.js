/**
 * Hook Count Invariant Tests (P7-33 / INV-13)
 *
 * Security ratchet: hook command counts in .claude/settings.json must never decrease.
 * If someone accidentally removes a hook, this test fails.
 *
 * @module tests/security/hook-count-invariant
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let dir = join(__dirname, '..', '..');
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, '.claude'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SETTINGS_PATH = join(PROJECT_ROOT, '.claude', 'settings.json');

const MIN_SESSION_START_HOOKS = 5;
const MIN_USER_PROMPT_SUBMIT_HOOKS = 2;
const MIN_PRE_TOOL_USE_HOOKS = 48;
const MIN_TOTAL_HOOKS = 55;

const EXPECTED_MATCHERS = [
  'Bash', 'Edit', 'Glob', 'Grep', 'NotebookEdit', 'Read',
  'Skill', 'Task', 'TodoWrite', 'WebFetch', 'WebSearch', 'Write',
];

function countHooksInGroups(groups) {
  if (!Array.isArray(groups)) return 0;
  let count = 0;
  for (const group of groups) {
    if (group.hooks && Array.isArray(group.hooks)) count += group.hooks.length;
  }
  return count;
}

function extractMatchers(groups) {
  if (!Array.isArray(groups)) return [];
  const s = new Set();
  for (const g of groups) { if (g.matcher) s.add(g.matcher); }
  return [...s].sort();
}

function getHookCountPerMatcher(groups) {
  if (!Array.isArray(groups)) return {};
  const counts = {};
  for (const g of groups) {
    if (g.matcher && g.hooks && Array.isArray(g.hooks))
      counts[g.matcher] = (counts[g.matcher] || 0) + g.hooks.length;
  }
  return counts;
}

describe('Hook Count Invariant (INV-13)', () => {
  let settings;
  beforeAll(() => {
    expect(existsSync(SETTINGS_PATH)).toBe(true);
    settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
  });

  it('INV-13-001: settings.json has hooks property', () => {
    expect(settings).toHaveProperty('hooks');
    expect(typeof settings.hooks).toBe('object');
  });

  it('INV-13-002: has all three hook event types', () => {
    expect(settings.hooks).toHaveProperty('SessionStart');
    expect(settings.hooks).toHaveProperty('UserPromptSubmit');
    expect(settings.hooks).toHaveProperty('PreToolUse');
  });

  it('INV-13-003: SessionStart >= 5 hook commands', () => {
    expect(countHooksInGroups(settings.hooks.SessionStart))
      .toBeGreaterThanOrEqual(MIN_SESSION_START_HOOKS);
  });

  it('INV-13-004: UserPromptSubmit >= 2 hook commands', () => {
    expect(countHooksInGroups(settings.hooks.UserPromptSubmit))
      .toBeGreaterThanOrEqual(MIN_USER_PROMPT_SUBMIT_HOOKS);
  });

  it('INV-13-005: PreToolUse >= 48 hook commands', () => {
    expect(countHooksInGroups(settings.hooks.PreToolUse))
      .toBeGreaterThanOrEqual(MIN_PRE_TOOL_USE_HOOKS);
  });

  it('INV-13-006: >= 12 unique PreToolUse matchers', () => {
    expect(extractMatchers(settings.hooks.PreToolUse).length)
      .toBeGreaterThanOrEqual(12);
  });

  it('INV-13-007: total hook commands >= 55', () => {
    let total = 0;
    for (const ev of Object.keys(settings.hooks))
      total += countHooksInGroups(settings.hooks[ev]);
    expect(total).toBeGreaterThanOrEqual(MIN_TOTAL_HOOKS);
  });
});

describe('UserPromptSubmit Validators', () => {
  let cmds;
  beforeAll(() => {
    const s = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    cmds = [];
    for (const g of s.hooks.UserPromptSubmit)
      for (const h of g.hooks) cmds.push(h.command);
  });

  it('INV-13-008: includes prompt-injection validator', () => {
    expect(cmds.some((c) => c.includes('prompt-injection'))).toBe(true);
  });

  it('INV-13-009: includes jailbreak validator', () => {
    expect(cmds.some((c) => c.includes('jailbreak'))).toBe(true);
  });
});

describe('PreToolUse Matcher Coverage', () => {
  let matcherCounts;
  beforeAll(() => {
    const s = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    matcherCounts = getHookCountPerMatcher(s.hooks.PreToolUse);
  });

  for (const matcher of EXPECTED_MATCHERS) {
    it('INV-13-010-' + matcher + ': matcher present for ' + matcher, () => {
      expect(matcherCounts).toHaveProperty(matcher);
      expect(matcherCounts[matcher]).toBeGreaterThanOrEqual(1);
    });
  }

  it('INV-13-011: every discovered matcher has >= 1 hook', () => {
    for (const [m, c] of Object.entries(matcherCounts)) {
      expect(c, 'Matcher ' + m + ' has 0 hooks').toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Hook Command Integrity', () => {
  let settings;
  beforeAll(() => {
    settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
  });

  it('INV-13-012: all commands reference CLAUDE_PROJECT_DIR', () => {
    for (const ev of Object.keys(settings.hooks)) {
      const groups = settings.hooks[ev];
      if (!Array.isArray(groups)) continue;
      for (const g of groups) {
        if (!g.hooks || !Array.isArray(g.hooks)) continue;
        for (const h of g.hooks)
          expect(h.command).toContain('CLAUDE_PROJECT_DIR');
      }
    }
  });

  it('INV-13-013: no duplicate commands within same matcher group', () => {
    for (const ev of Object.keys(settings.hooks)) {
      const groups = settings.hooks[ev];
      if (!Array.isArray(groups)) continue;
      for (const g of groups) {
        if (!g.hooks || !Array.isArray(g.hooks)) continue;
        const cmds = g.hooks.map((h) => h.command);
        expect(cmds.length).toBe(new Set(cmds).size);
      }
    }
  });

  it('INV-13-014: all hooks are type command', () => {
    for (const ev of Object.keys(settings.hooks)) {
      const groups = settings.hooks[ev];
      if (!Array.isArray(groups)) continue;
      for (const g of groups) {
        if (!g.hooks || !Array.isArray(g.hooks)) continue;
        for (const h of g.hooks) {
          expect(h.type).toBe('command');
          expect(h.command).toBeTruthy();
        }
      }
    }
  });

  it('INV-13-015: SessionStart includes session-init and token-validator', () => {
    const cmds = [];
    for (const g of settings.hooks.SessionStart)
      for (const h of g.hooks) cmds.push(h.command);
    expect(cmds.some((c) => c.includes('session-init'))).toBe(true);
    expect(cmds.some((c) => c.includes('token-validator'))).toBe(true);
  });
});
