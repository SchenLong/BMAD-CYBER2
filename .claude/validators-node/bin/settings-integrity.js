#!/usr/bin/env node
/**
 * BMAD Settings Integrity Validator
 * ===================================
 * Validates .claude/settings.json structural integrity.
 *
 * Part of v6 Hybrid Upgrade - Story 01, Task 1.4 (VULN-012 mitigation).
 *
 * Checks:
 * - Valid JSON syntax
 * - Required top-level keys present
 * - All expected matchers present (SessionStart, UserPromptSubmit, PreToolUse matchers)
 * - Hook count >= baseline (never decreases)
 * - No empty hook arrays
 * - All hook commands reference existing files
 *
 * Usage:
 *   node settings-integrity.js [--baseline N] [--restore-on-fail]
 *
 * Exit codes:
 *   0 = valid
 *   1 = invalid (with details on stderr)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Walk up to find project root
function findProjectRoot() {
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, '_bmad'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SETTINGS_PATH = path.join(PROJECT_ROOT, '.claude', 'settings.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, '.claude', 'settings.json.pre-v6-backup');
const BASELINE_PATH = path.join(PROJECT_ROOT, '.claude', 'settings-baseline.txt');

// Expected matchers that must always be present in PreToolUse
const REQUIRED_MATCHERS = [
  'Skill', 'Task', 'Bash', 'Write', 'Edit', 'Read',
  'Glob', 'Grep', 'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite'
];

// Expected event types
const REQUIRED_EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse'];

// Minimum hook count from baseline (safety floor)
const MIN_HOOK_COUNT = 54;

function validate() {
  const errors = [];
  const warnings = [];

  // Step 1: Check file exists
  if (!fs.existsSync(SETTINGS_PATH)) {
    errors.push('settings.json not found at: ' + SETTINGS_PATH);
    return { valid: false, errors, warnings };
  }

  // Step 2: Parse JSON
  let settings;
  try {
    const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    settings = JSON.parse(content);
  } catch (e) {
    errors.push('Invalid JSON: ' + e.message);
    return { valid: false, errors, warnings };
  }

  // Step 3: Check top-level structure
  if (!settings.hooks) {
    errors.push('Missing required top-level key: "hooks"');
  }

  // Step 4: Check required events
  for (const event of REQUIRED_EVENTS) {
    if (!settings.hooks || !settings.hooks[event]) {
      errors.push(`Missing required event: "${event}"`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Step 5: Check PreToolUse matchers
  const preToolUseHandlers = settings.hooks.PreToolUse || [];
  const foundMatchers = new Set();
  for (const handler of preToolUseHandlers) {
    if (handler.matcher) {
      foundMatchers.add(handler.matcher);
    }
  }

  for (const matcher of REQUIRED_MATCHERS) {
    if (!foundMatchers.has(matcher)) {
      errors.push(`Missing required PreToolUse matcher: "${matcher}"`);
    }
  }

  // Step 6: Count hooks and validate non-empty
  let totalHooks = 0;
  for (const [eventName, handlers] of Object.entries(settings.hooks)) {
    const handlerList = Array.isArray(handlers) ? handlers : [handlers];
    for (const handler of handlerList) {
      const hooks = handler.hooks || [];
      if (hooks.length === 0) {
        warnings.push(`Empty hooks array in "${eventName}" (matcher: ${handler.matcher || 'none'})`);
      }
      totalHooks += hooks.length;
    }
  }

  // Step 7: Check hook count against baseline
  let baselineCount = MIN_HOOK_COUNT;
  if (fs.existsSync(BASELINE_PATH)) {
    const baselineContent = fs.readFileSync(BASELINE_PATH, 'utf-8');
    const match = baselineContent.match(/Pre-update hook count:\s*(\d+)/);
    if (match) {
      baselineCount = parseInt(match[1], 10);
    }
  }

  // Parse --baseline flag
  const baselineArg = process.argv.find(a => a.startsWith('--baseline'));
  if (baselineArg) {
    const val = baselineArg.includes('=') ? baselineArg.split('=')[1] : process.argv[process.argv.indexOf(baselineArg) + 1];
    if (val && !isNaN(parseInt(val, 10))) {
      baselineCount = parseInt(val, 10);
    }
  }

  if (totalHooks < baselineCount) {
    errors.push(`Hook count decreased: ${totalHooks} < baseline ${baselineCount}. Security hooks may have been removed!`);
  }

  // Step 8: Verify hook command files exist (spot check)
  for (const [eventName, handlers] of Object.entries(settings.hooks)) {
    const handlerList = Array.isArray(handlers) ? handlers : [handlers];
    for (const handler of handlerList) {
      for (const hook of (handler.hooks || [])) {
        if (hook.type === 'command' && hook.command) {
          // Extract file path from command (resolve $CLAUDE_PROJECT_DIR)
          const cmd = hook.command.replace(/"\$CLAUDE_PROJECT_DIR"/g, PROJECT_ROOT);
          const parts = cmd.split(' ');
          // Find the file path (skip 'node', 'python3', 'bash')
          const filePath = parts.find(p => p.startsWith(PROJECT_ROOT) || p.startsWith('/'));
          if (filePath && !fs.existsSync(filePath)) {
            warnings.push(`Hook command references missing file: ${filePath} (in ${eventName}/${handler.matcher || 'global'})`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalHooks,
      matcherCount: foundMatchers.size,
      baselineCount
    }
  };
}

function main() {
  const result = validate();

  if (result.valid) {
    console.log(`Settings integrity: VALID`);
    if (result.stats) {
      console.log(`  Hooks: ${result.stats.totalHooks} (baseline: ${result.stats.baselineCount})`);
      console.log(`  Matchers: ${result.stats.matcherCount}`);
    }
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.length}`);
      for (const w of result.warnings) {
        console.log(`    - ${w}`);
      }
    }
    process.exit(0);
  } else {
    console.error(`Settings integrity: FAILED`);
    for (const e of result.errors) {
      console.error(`  ERROR: ${e}`);
    }
    for (const w of result.warnings) {
      console.error(`  WARNING: ${w}`);
    }

    // Restore from backup if requested
    if (process.argv.includes('--restore-on-fail')) {
      if (fs.existsSync(BACKUP_PATH)) {
        console.error('\nRestoring from backup...');
        fs.copyFileSync(BACKUP_PATH, SETTINGS_PATH);
        console.error('Backup restored successfully.');
      } else {
        console.error('\nNo backup found at: ' + BACKUP_PATH);
      }
    }

    process.exit(1);
  }
}

// Run if invoked directly
main();

export { validate, REQUIRED_MATCHERS, REQUIRED_EVENTS, MIN_HOOK_COUNT };
