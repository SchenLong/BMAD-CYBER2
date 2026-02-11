/**
 * BMAD Security Regression Test Suite (Phase 2 - Tier 2)
 * =======================================================
 * Comprehensive Vitest test suite for CI-level security regression validation.
 * Complements: scripts/security-regression.sh (Tier 1 quick check)
 *
 * Verifies that all security infrastructure components remain intact:
 * - Hook command file integrity (existence + non-empty)
 * - Settings.json structural validation
 * - Content hash baseline verification
 * - RBAC & authorization module
 * - Audit infrastructure
 *
 * Part of E0.3: Security Regression Suite
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find project root (walk up until we find package.json + _bmad)
function findProjectRoot() {
  let dir = path.resolve(__dirname, '../../..');
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, '_bmad'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SETTINGS_PATH = path.join(PROJECT_ROOT, '.claude', 'settings.json');
const HASH_BASELINE_PATH = path.join(PROJECT_ROOT, 'tests', 'baselines', 'hook-content-hashes.json');
const RBAC_CONFIG_PATH = path.join(PROJECT_ROOT, 'src', 'core', 'security', 'rbac-config.yaml');
const AUTH_MODULE_PATH = path.join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.js');

// Required PreToolUse matchers (12 total)
const REQUIRED_MATCHERS = [
  'Skill', 'Task', 'Bash', 'Write', 'Edit', 'Read',
  'Glob', 'Grep', 'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite',
];

// Required hook event types
const REQUIRED_EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse'];

// Minimum hook count baseline
const MIN_HOOK_COUNT = 54;

// Load and parse settings.json once for all tests
function loadSettings() {
  const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
  return JSON.parse(content);
}

// Extract all hook command file paths from settings.json
function extractHookCommandPaths(settings) {
  const paths = [];
  for (const [eventName, handlers] of Object.entries(settings.hooks || {})) {
    const handlerList = Array.isArray(handlers) ? handlers : [handlers];
    for (const handler of handlerList) {
      for (const hook of (handler.hooks || [])) {
        if (hook.type === 'command' && hook.command) {
          // Replace $CLAUDE_PROJECT_DIR with project root
          const cmd = hook.command.replace(/"\$CLAUDE_PROJECT_DIR"/g, PROJECT_ROOT);
          const parts = cmd.split(' ');
          // Find the file path (skip 'node', 'python3', 'bash', etc.)
          const filePath = parts.find(p => p.startsWith(PROJECT_ROOT) || p.startsWith('/'));
          if (filePath) {
            paths.push({
              filePath,
              relativePath: path.relative(PROJECT_ROOT, filePath),
              event: eventName,
              matcher: handler.matcher || 'global',
            });
          }
        }
      }
    }
  }
  return paths;
}

// Count total hooks across all events
function countTotalHooks(settings) {
  let total = 0;
  for (const handlers of Object.values(settings.hooks || {})) {
    const handlerList = Array.isArray(handlers) ? handlers : [handlers];
    for (const handler of handlerList) {
      total += (handler.hooks || []).length;
    }
  }
  return total;
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

describe('Phase 2: Security Regression Suite', () => {
  let settings;
  let hookPaths;

  // Load settings once before all tests
  try {
    settings = loadSettings();
    hookPaths = extractHookCommandPaths(settings);
  } catch (e) {
    // If settings can't be loaded, tests will fail with clear messages
  }

  // =========================================================================
  // 1. HOOK COMMAND FILE INTEGRITY
  // =========================================================================
  describe('Hook Command File Integrity', () => {
    it('should have all hook command files present on disk', () => {
      expect(settings).toBeDefined();
      const missingFiles = [];
      for (const entry of hookPaths) {
        if (!fs.existsSync(entry.filePath)) {
          missingFiles.push(`${entry.relativePath} (${entry.event}/${entry.matcher})`);
        }
      }
      expect(missingFiles).toEqual([]);
    });

    it('should have all hook command files be non-empty', () => {
      expect(settings).toBeDefined();
      const emptyFiles = [];
      for (const entry of hookPaths) {
        if (fs.existsSync(entry.filePath)) {
          const stat = fs.statSync(entry.filePath);
          if (stat.size === 0) {
            emptyFiles.push(entry.relativePath);
          }
        }
      }
      expect(emptyFiles).toEqual([]);
    });

    it('should reference at least 15 unique hook command files', () => {
      expect(settings).toBeDefined();
      const uniquePaths = new Set(hookPaths.map(h => h.filePath));
      expect(uniquePaths.size).toBeGreaterThanOrEqual(15);
    });

    it('should have all hook commands using the "command" type', () => {
      expect(settings).toBeDefined();
      for (const [, handlers] of Object.entries(settings.hooks || {})) {
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

    it('should have all hook commands reference $CLAUDE_PROJECT_DIR', () => {
      expect(settings).toBeDefined();
      const violators = [];
      for (const [eventName, handlers] of Object.entries(settings.hooks || {})) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          for (const hook of (handler.hooks || [])) {
            if (hook.type === 'command' && hook.command) {
              if (!hook.command.includes('$CLAUDE_PROJECT_DIR')) {
                violators.push(`${eventName}/${handler.matcher || 'global'}: ${hook.command}`);
              }
            }
          }
        }
      }
      expect(violators).toEqual([]);
    });
  });

  // =========================================================================
  // 2. SETTINGS STRUCTURE VALIDATION
  // =========================================================================
  describe('Settings Structure Validation', () => {
    it('should have valid JSON in settings.json', () => {
      const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have all required event types', () => {
      expect(settings).toBeDefined();
      expect(settings.hooks).toBeDefined();
      for (const event of REQUIRED_EVENTS) {
        expect(settings.hooks[event]).toBeDefined();
        expect(Array.isArray(settings.hooks[event])).toBe(true);
        expect(
          settings.hooks[event].length,
          `${event} should have at least 1 handler`
        ).toBeGreaterThanOrEqual(1);
      }
    });

    it('should have all 12 required PreToolUse matchers', () => {
      expect(settings).toBeDefined();
      const preToolUseHandlers = settings.hooks.PreToolUse || [];
      const foundMatchers = new Set();
      for (const handler of preToolUseHandlers) {
        if (handler.matcher) {
          foundMatchers.add(handler.matcher);
        }
      }
      const missingMatchers = REQUIRED_MATCHERS.filter(m => !foundMatchers.has(m));
      expect(missingMatchers).toEqual([]);
      expect(foundMatchers.size).toBeGreaterThanOrEqual(12);
    });

    it('should maintain hook count at or above baseline of 54', () => {
      expect(settings).toBeDefined();
      const totalHooks = countTotalHooks(settings);
      expect(totalHooks).toBeGreaterThanOrEqual(MIN_HOOK_COUNT);
    });
  });

  // =========================================================================
  // 3. CONTENT HASH VERIFICATION
  // =========================================================================
  describe('Content Hash Verification', () => {
    let baseline;

    try {
      baseline = JSON.parse(fs.readFileSync(HASH_BASELINE_PATH, 'utf-8'));
    } catch (e) {
      // Will be caught in test
    }

    it('should have a valid hash baseline file', () => {
      expect(fs.existsSync(HASH_BASELINE_PATH)).toBe(true);
      expect(baseline).toBeDefined();
      expect(baseline.hashes).toBeDefined();
      expect(typeof baseline.hashes).toBe('object');
      expect(Object.keys(baseline.hashes).length).toBeGreaterThan(0);
    });

    it('should have all baselined files present on disk', () => {
      expect(baseline).toBeDefined();
      const missingFiles = [];
      for (const relativePath of Object.keys(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        if (!fs.existsSync(fullPath)) {
          missingFiles.push(relativePath);
        }
      }
      expect(missingFiles).toEqual([]);
    });

    it('should have all content hashes matching the baseline', () => {
      expect(baseline).toBeDefined();
      const mismatches = [];
      for (const [relativePath, expectedHash] of Object.entries(baseline.hashes)) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
          if (actualHash !== expectedHash) {
            mismatches.push(
              `${relativePath}: expected ${String(expectedHash).substring(0, 12)}..., got ${actualHash.substring(0, 12)}...`
            );
          }
        }
      }
      expect(mismatches).toEqual([]);
    });
  });

  // =========================================================================
  // 4. RBAC & AUTHORIZATION
  // =========================================================================
  describe('RBAC & Authorization', () => {
    it('should have rbac-config.yaml present and loadable', () => {
      expect(fs.existsSync(RBAC_CONFIG_PATH)).toBe(true);
      const content = fs.readFileSync(RBAC_CONFIG_PATH, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      // Verify it contains expected RBAC structure markers
      expect(content).toContain('rbac:');
      expect(content).toContain('enabled:');
      expect(content).toContain('roles:');
      expect(content).toContain('deny_by_default:');
    });

    it('should have authorization.js exporting agentPathResolver and AuthorizationManager', () => {
      expect(fs.existsSync(AUTH_MODULE_PATH)).toBe(true);
      const content = fs.readFileSync(AUTH_MODULE_PATH, 'utf-8');
      // Verify exports are present (CJS module.exports)
      expect(content).toContain('module.exports');
      expect(content).toContain('agentPathResolver');
      expect(content).toContain('AuthorizationManager');
      expect(content).toContain('getAuthorizationManager');
      expect(content).toContain('resetAuthorizationManager');
    });

    it('should have agentPathResolver handle both legacy and v6 formats', () => {
      // authorization.js is CJS but project has "type":"module" in package.json.
      // Use vm.runInNewContext to load it in a proper CJS sandbox.
      const escapedAuthPath = AUTH_MODULE_PATH.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const testScript = [
        'const fs = require("fs");',
        'const path = require("path");',
        'const vm = require("vm");',
        `const authPath = '${escapedAuthPath}';`,
        'const code = fs.readFileSync(authPath, "utf-8");',
        'const mod = { exports: {} };',
        'const sandbox = { module: mod, exports: mod.exports, require: require,',
        '  __dirname: path.dirname(authPath), __filename: authPath,',
        '  console: console, process: process };',
        'vm.runInNewContext(code, sandbox, { filename: authPath });',
        'const apr = mod.exports.agentPathResolver;',
        'const results = {',
        '  legacy: apr("cybersec-team/threat-analyst"),',
        '  v6: apr("src/cybersec-team/agents/threat-analyst"),',
        '  single: apr("abdul"),',
        '  invalid: apr("")',
        '};',
        'console.log(JSON.stringify(results));',
      ].join(' ');

      const output = execSync(`node --input-type=commonjs -e "${testScript.replace(/"/g, '\\"')}"`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      }).trim();
      const results = JSON.parse(output);

      // Legacy format: module/agent
      expect(results.legacy.module).toBe('cybersec-team');
      expect(results.legacy.agent).toBe('threat-analyst');
      expect(results.legacy.format).toBe('legacy');

      // V6 format: _bmad/module/agents/agent
      expect(results.v6.module).toBe('cybersec-team');
      expect(results.v6.agent).toBe('threat-analyst');
      expect(results.v6.format).toBe('v6');

      // Single format: agent
      expect(results.single.agent).toBe('abdul');
      expect(results.single.format).toBe('single');

      // Invalid input
      expect(results.invalid.format).toBe('invalid');
    });

    it('should initialize AuthorizationManager and load roles from rbac-config.yaml', () => {
      // Use vm.runInNewContext to load CJS authorization.js in ESM project
      const escapedAuthPath = AUTH_MODULE_PATH.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const escapedRbacPath = RBAC_CONFIG_PATH.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const testScript = [
        'const fs = require("fs");',
        'const path = require("path");',
        'const vm = require("vm");',
        `const authPath = '${escapedAuthPath}';`,
        'const code = fs.readFileSync(authPath, "utf-8");',
        'const mod = { exports: {} };',
        'const sandbox = { module: mod, exports: mod.exports, require: require,',
        '  __dirname: path.dirname(authPath), __filename: authPath,',
        '  console: { log: function(){}, error: function(){} }, process: process };',
        'vm.runInNewContext(code, sandbox, { filename: authPath });',
        `const mgr = new mod.exports.AuthorizationManager('${escapedRbacPath}');`,
        'const roles = mgr.getAllRoles();',
        'const enabled = mgr.isEnabled();',
        'const defaultRole = mgr.getDefaultRole();',
        'console.log(JSON.stringify({ roles, enabled, defaultRole }));',
      ].join(' ');

      const output = execSync(`node --input-type=commonjs -e "${testScript.replace(/"/g, '\\"')}"`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      }).trim();
      const result = JSON.parse(output);

      expect(result.enabled).toBe(true);
      expect(result.defaultRole).toBe('viewer');
      expect(result.roles).toContain('admin');
      expect(result.roles).toContain('security_lead');
      expect(result.roles).toContain('viewer');
      expect(result.roles.length).toBeGreaterThanOrEqual(8);
    });
  });

  // =========================================================================
  // 5. AUDIT INFRASTRUCTURE
  // =========================================================================
  describe('Audit Infrastructure', () => {
    it('should have audit logger source file', () => {
      const auditLoggerPath = path.join(PROJECT_ROOT, '.claude', 'validators-node', 'src', 'common', 'audit-logger.ts');
      expect(fs.existsSync(auditLoggerPath)).toBe(true);
      const content = fs.readFileSync(auditLoggerPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have audit integrity validator', () => {
      const auditIntegrityPath = path.join(PROJECT_ROOT, '.claude', 'validators-node', 'bin', 'audit-integrity.js');
      expect(fs.existsSync(auditIntegrityPath)).toBe(true);
      const content = fs.readFileSync(auditIntegrityPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have audit encryption module', () => {
      const auditEncryptionPath = path.join(PROJECT_ROOT, '.claude', 'validators-node', 'src', 'observability', 'audit-encryption.ts');
      expect(fs.existsSync(auditEncryptionPath)).toBe(true);
      const content = fs.readFileSync(auditEncryptionPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });
  });
});
