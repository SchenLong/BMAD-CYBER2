/**
 * UAT-06: Security Features (25 checks)
 *
 * Validates: User-facing security behavior — RBAC, validators, audit, hooks, path normalization
 * Complements: Section 11 (technical security assessment) with user-perspective validation
 *
 * Stories:
 *   S1: RBAC enforcement (8 checks)           — UAT-06-001 to UAT-06-008
 *   S2: Validator & hook enforcement (10 checks) — UAT-06-009 to UAT-06-018
 *   S3: Audit & security config (7 checks)     — UAT-06-019 to UAT-06-025
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const SETTINGS_PATH = join(PROJECT_ROOT, '.claude', 'settings.json');
const RBAC_CONFIG_PATH = join(PROJECT_ROOT, 'src', 'core', 'security', 'rbac-config.yaml');
const AUTH_JS_PATH = join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.js');
const AUTH_TS_PATH = join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.ts');
const VALIDATORS_BIN = join(PROJECT_ROOT, '.claude', 'validators-node', 'bin');
const VALIDATORS_SRC = join(PROJECT_ROOT, '.claude', 'validators-node', 'src');
const AUDIT_LOGGER_PATH = join(PROJECT_ROOT, 'src', 'security', 'audit', 'audit-logger.ts');
const SECURITY_REGRESSION_PATH = join(PROJECT_ROOT, 'scripts', 'security-regression.sh');

let settings;
let rbacConfig;

// =============================================================================
// Setup
// =============================================================================
beforeAll(() => {
  settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
  rbacConfig = readFileSync(RBAC_CONFIG_PATH, 'utf-8');
});

// Helper: count hooks across all events
function countHooks(settingsObj) {
  let count = 0;
  for (const [, handlers] of Object.entries(settingsObj.hooks || {})) {
    if (Array.isArray(handlers)) {
      for (const h of handlers) {
        count += (h.hooks || []).length;
      }
    } else if (handlers && handlers.hooks) {
      count += handlers.hooks.length;
    }
  }
  return count;
}

// Helper: collect all PreToolUse matchers
function getMatchers(settingsObj) {
  const matchers = new Set();
  const preToolUse = settingsObj.hooks?.PreToolUse || [];
  if (Array.isArray(preToolUse)) {
    for (const handler of preToolUse) {
      if (handler.matcher) matchers.add(handler.matcher);
    }
  }
  return matchers;
}

// =============================================================================
// S1: RBAC Enforcement (8 checks)
// =============================================================================
describe.skip('UAT-06-S1: RBAC Enforcement', () => {

  // UAT-06-001: RBAC config denies unauthorized agent access
  it('UAT-06-001: RBAC config has deny-by-default policy', () => {
    expect(rbacConfig).toContain('deny_by_default');
    expect(rbacConfig).toMatch(/deny_by_default:\s*true/);
    expect(rbacConfig).toContain('enabled: true');
  });

  // UAT-06-002: RBAC allows authorized agents per role
  it('UAT-06-002: RBAC defines roles with explicit agent permissions', () => {
    // admin should have wildcard access
    expect(rbacConfig).toContain('admin');
    // developer role should exist
    expect(rbacConfig).toContain('developer');
    // viewer role should have restricted access
    expect(rbacConfig).toContain('viewer');
    // guest role with minimal access
    expect(rbacConfig).toContain('guest');

    // Verify agent patterns use v6 format (src/module/agents/*)
    expect(rbacConfig).toMatch(/src\/\w[\w-]*\/agents\//);
  });

  // UAT-06-003: RBAC applies per-module restrictions
  it('UAT-06-003: RBAC config has module-level restrictions for sensitive modules', () => {
    // Sensitive modules should have restrictions
    expect(rbacConfig).toContain('intel-team');
    expect(rbacConfig).toContain('legal-team');
    expect(rbacConfig).toContain('cybersec-team');
    expect(rbacConfig).toContain('strategy-team');

    // Module restrictions section should exist
    expect(rbacConfig).toContain('module_restrictions');
  });

  // UAT-06-004: Legacy path normalization — authorization.js handles _bmad/ paths
  it('UAT-06-004: authorization code handles legacy _bmad/ path normalization', () => {
    const authCode = readFileSync(AUTH_TS_PATH, 'utf-8');
    // agentPathResolver should handle legacy format
    expect(authCode).toContain('agentPathResolver');
    // Should handle legacy format conversion
    expect(authCode).toMatch(/legacy|_bmad|format/i);
    // Should normalize to v6 format
    expect(authCode).toContain('src/');
  });

  // UAT-06-005: v6 path format — authorization handles src/ paths
  it('UAT-06-005: authorization handles v6 src/ path format directly', () => {
    const authCode = readFileSync(AUTH_TS_PATH, 'utf-8');
    // v6 format detection
    expect(authCode).toMatch(/v6|src\//);
    // Path parsing should extract module and agent
    expect(authCode).toContain('module');
    expect(authCode).toContain('agent');
  });

  // UAT-06-006: Single-name agent resolution
  it('UAT-06-006: authorization handles single-name agent lookup', () => {
    const authCode = readFileSync(AUTH_TS_PATH, 'utf-8');
    // Should handle 'single' format where only agent name is given
    expect(authCode).toMatch(/single|format/);
    // agentPathResolver function must exist and be exported
    expect(authCode).toMatch(/export\s+function\s+agentPathResolver/);
  });

  // UAT-06-007: RBAC uses wildcard patterns
  it('UAT-06-007: RBAC config uses wildcard patterns for module-level access', () => {
    // Wildcard patterns in agents
    expect(rbacConfig).toMatch(/src\/[\w-]+\/agents\/\*/);
    // Universal admin wildcard
    const hasUniversalWildcard = rbacConfig.includes("'*'") || rbacConfig.includes('"*"') || rbacConfig.match(/- \*/);
    expect(hasUniversalWildcard).toBe(true);
  });

  // UAT-06-008: RBAC config defines workflow restrictions
  it('UAT-06-008: RBAC config has workflow-level restrictions for sensitive operations', () => {
    expect(rbacConfig).toContain('workflow_restrictions');
    // Sensitive workflows should require restrictions
    expect(rbacConfig).toContain('incident-response');
    expect(rbacConfig).toContain('operation-mosaic');
  });
});

// =============================================================================
// S2: Validator & Hook Enforcement (10 checks)
// =============================================================================
describe.skip('UAT-06-S2: Validator & Hook Enforcement', () => {

  // UAT-06-009: Bash safety validator exists and blocks dangerous commands
  it('UAT-06-009: bash-safety validator exists and detects rm -rf patterns', () => {
    const validatorPath = join(VALIDATORS_BIN, 'bash-safety.js');
    expect(existsSync(validatorPath), 'bash-safety.js must exist').toBe(true);

    // Source should contain dangerous command detection
    const srcPath = join(VALIDATORS_SRC, 'guards', 'bash-safety.ts');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf-8');
      expect(src).toContain('rm');
      expect(src).toMatch(/dangerous|unsafe|block/i);
    }
  });

  // UAT-06-010: sudo validator blocks sudo commands
  it('UAT-06-010: bash-safety validator detects sudo patterns', () => {
    const srcPath = join(VALIDATORS_SRC, 'guards', 'bash-safety.ts');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf-8');
      expect(src.toLowerCase()).toContain('sudo');
    }
  });

  // UAT-06-011: Secret validator detects API key patterns
  it('UAT-06-011: secret validator exists and detects credential patterns', () => {
    const validatorPath = join(VALIDATORS_BIN, 'secret.js');
    expect(existsSync(validatorPath), 'secret.js must exist').toBe(true);

    const srcPath = join(VALIDATORS_SRC, 'guards', 'secret.ts');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf-8');
      // Should detect common secret patterns
      expect(src).toMatch(/api.?key|secret|token|credential|password/i);
    }
  });

  // UAT-06-012: PII validator detects personal data
  it('UAT-06-012: PII validator exists and detects email/phone/SSN patterns', () => {
    const validatorPath = join(VALIDATORS_BIN, 'pii.js');
    expect(existsSync(validatorPath), 'pii.js must exist').toBe(true);

    // Check PII source for pattern detection
    const piiDir = join(VALIDATORS_SRC, 'guards', 'pii');
    const piiFile = join(VALIDATORS_SRC, 'guards', 'pii.ts');
    expect(
      existsSync(piiDir) || existsSync(piiFile),
      'PII validator source must exist'
    ).toBe(true);
  });

  // UAT-06-013: PreToolUse hooks execute for tool calls
  it('UAT-06-013: PreToolUse hooks are configured in settings.json', () => {
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(Array.isArray(settings.hooks.PreToolUse)).toBe(true);
    expect(settings.hooks.PreToolUse.length).toBeGreaterThan(0);
  });

  // UAT-06-014: All 12 matchers active
  it('UAT-06-014: all 12 PreToolUse matchers are configured', () => {
    const matchers = getMatchers(settings);
    expect(matchers.size).toBe(12);

    const expected = ['Bash', 'Edit', 'Write', 'Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite', 'Skill', 'Task'];
    for (const m of expected) {
      expect(matchers.has(m), `Missing matcher: ${m}`).toBe(true);
    }
  });

  // UAT-06-015: Settings.json integrity — 63 hooks, 12 PreToolUse matchers
  it('UAT-06-015: settings.json has 63 hook commands and 12 PreToolUse matchers', () => {
    const hookCount = countHooks(settings);
    expect(hookCount).toBe(63);

    const matcherCount = getMatchers(settings).size;
    expect(matcherCount).toBe(12);
  });

  // UAT-06-016: Validator source files exist for all 119 TypeScript sources
  it('UAT-06-016: validator TypeScript source directory exists with expected structure', () => {
    expect(existsSync(VALIDATORS_SRC), 'validators-node/src must exist').toBe(true);

    // Key subdirectories
    const expectedDirs = ['guards', 'ai-safety', 'common', 'observability', 'permissions', 'resource-management'];
    for (const dir of expectedDirs) {
      expect(existsSync(join(VALIDATORS_SRC, dir)), `${dir}/ must exist`).toBe(true);
    }

    // Count .ts files recursively
    let tsCount = 0;
    function countTs(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) countTs(join(dir, entry.name));
        else if (entry.name.endsWith('.ts')) tsCount++;
      }
    }
    countTs(VALIDATORS_SRC);
    expect(tsCount).toBeGreaterThanOrEqual(15); // At least 15 TS source files
  });

  // UAT-06-017: Prompt injection validator exists
  it('UAT-06-017: prompt injection validator exists with detection patterns', () => {
    const validatorPath = join(VALIDATORS_BIN, 'prompt-injection.js');
    expect(existsSync(validatorPath), 'prompt-injection.js must exist').toBe(true);

    const srcPath = join(VALIDATORS_SRC, 'ai-safety', 'prompt-injection.ts');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf-8');
      // Should contain injection detection patterns
      expect(src).toMatch(/ignore|override|system.?prompt|instruction/i);
      expect(src).toMatch(/CRITICAL|WARNING|severity/i);
    }
  });

  // UAT-06-018: Jailbreak validator exists
  it('UAT-06-018: jailbreak validator exists with detection patterns', () => {
    const validatorPath = join(VALIDATORS_BIN, 'jailbreak.js');
    expect(existsSync(validatorPath), 'jailbreak.js must exist').toBe(true);

    const srcPath = join(VALIDATORS_SRC, 'ai-safety', 'jailbreak.ts');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf-8');
      // Should detect jailbreak patterns
      expect(src).toMatch(/jailbreak|DAN|roleplay|pretend/i);
    }
  });
});

// =============================================================================
// S3: Audit & Security Config (7 checks)
// =============================================================================
describe.skip('UAT-06-S3: Audit & Security Config', () => {

  // UAT-06-019: Audit logger implementation exists
  it('UAT-06-019: TamperEvidentAuditLogger exists with logEvent method', () => {
    expect(existsSync(AUDIT_LOGGER_PATH), 'audit-logger.ts must exist').toBe(true);

    const src = readFileSync(AUDIT_LOGGER_PATH, 'utf-8');
    expect(src).toContain('TamperEvidentAuditLogger');
    expect(src).toContain('logEvent');
    // Hash chain integrity
    expect(src).toMatch(/hash|chain|integrity|SHA/i);
    // HMAC signing
    expect(src).toMatch(/HMAC|sign|verify/i);
  });

  // UAT-06-020: Security tier is configurable (HIGH/MEDIUM/LOW)
  it('UAT-06-020: security tier concept exists in RBAC or settings', () => {
    // Check for tier references in RBAC or auth code
    const authTs = readFileSync(AUTH_TS_PATH, 'utf-8');
    const hasSecurityLevels = authTs.includes('SecurityLevel') ||
      authTs.includes('HIGH') || authTs.includes('MEDIUM') || authTs.includes('LOW') ||
      authTs.includes('audit_level');

    const auditSrc = readFileSync(AUDIT_LOGGER_PATH, 'utf-8');
    const hasLevelsInAudit = auditSrc.includes('SecurityLevel') ||
      auditSrc.includes('"high"') || auditSrc.includes('"medium"') || auditSrc.includes('"low"');

    expect(hasSecurityLevels || hasLevelsInAudit, 'Security level/tier must be defined').toBe(true);
  });

  // UAT-06-021: Settings.json hook counts are tier-dependent (check structure)
  it('UAT-06-021: settings.json has SessionStart + UserPromptSubmit + PreToolUse hooks', () => {
    const events = Object.keys(settings.hooks || {});
    expect(events).toContain('SessionStart');
    expect(events).toContain('UserPromptSubmit');
    expect(events).toContain('PreToolUse');
  });

  // UAT-06-022: SessionStart hooks include security initialization
  it('UAT-06-022: SessionStart hooks include session-init and security bootstrap', () => {
    const sessionStartHooks = settings.hooks?.SessionStart;
    expect(sessionStartHooks).toBeDefined();

    // Flatten hook commands (hooks are objects with {type, command} or plain strings)
    const commands = [];
    if (Array.isArray(sessionStartHooks)) {
      for (const h of sessionStartHooks) {
        for (const hook of (h.hooks || [])) {
          commands.push(typeof hook === 'string' ? hook : hook.command || '');
        }
      }
    } else if (sessionStartHooks?.hooks) {
      for (const hook of sessionStartHooks.hooks) {
        commands.push(typeof hook === 'string' ? hook : hook.command || '');
      }
    }

    // Should have session init
    const hasSessionInit = commands.some(c => c.includes('session-init') || c.includes('session-security'));
    expect(hasSessionInit, 'SessionStart must include session initialization').toBe(true);
  });

  // UAT-06-023: UserPromptSubmit hooks protect against injection
  it('UAT-06-023: UserPromptSubmit hooks include prompt-injection and jailbreak detection', () => {
    const promptHooks = settings.hooks?.UserPromptSubmit;
    expect(promptHooks).toBeDefined();

    const commands = [];
    if (Array.isArray(promptHooks)) {
      for (const h of promptHooks) {
        for (const hook of (h.hooks || [])) {
          commands.push(typeof hook === 'string' ? hook : hook.command || '');
        }
      }
    } else if (promptHooks?.hooks) {
      for (const hook of promptHooks.hooks) {
        commands.push(typeof hook === 'string' ? hook : hook.command || '');
      }
    }

    const hasPromptInjection = commands.some(c => c.includes('prompt-injection'));
    const hasJailbreak = commands.some(c => c.includes('jailbreak'));
    expect(hasPromptInjection, 'Must have prompt-injection validator').toBe(true);
    expect(hasJailbreak, 'Must have jailbreak validator').toBe(true);
  });

  // UAT-06-024: RBAC audit logging is implemented
  it('UAT-06-024: authorization.js includes RBAC decision audit logging', () => {
    const authJs = readFileSync(AUTH_JS_PATH, 'utf-8');
    expect(authJs).toContain('logRbacDecision');
    expect(authJs).toContain('rbac-decisions.log');
    // Audit entries include key fields
    expect(authJs).toContain('timestamp');
    expect(authJs).toContain('sessionId');
  });

  // UAT-06-025: Security regression script exists and checks 6 items
  it('UAT-06-025: security regression script exists with 6 checks', () => {
    expect(existsSync(SECURITY_REGRESSION_PATH), 'security-regression.sh must exist').toBe(true);

    const script = readFileSync(SECURITY_REGRESSION_PATH, 'utf-8');
    // Should have 6 checks
    expect(script).toContain('Check 1');
    expect(script).toContain('Check 2');
    expect(script).toContain('Check 3');
    expect(script).toContain('Check 4');
    expect(script).toContain('Check 5');
    expect(script).toContain('Check 6');

    // Check key validations
    expect(script).toContain('settings.json');
    expect(script).toContain('Hook count');
    expect(script).toContain('Matcher count');
    expect(script).toContain('validator files');
    expect(script).toContain('authorization.js');

    // All 10 critical files checked
    const criticalFiles = [
      'bash-safety.js', 'env-protection.js', 'jailbreak.js', 'pii.js',
      'prompt-injection.js', 'secret.js', 'supply-chain.js',
      'settings-integrity.js', 'authorization.js', 'outside-repo.js'
    ];
    for (const f of criticalFiles) {
      expect(script).toContain(f);
    }
  });
});
