/**
 * Slash Command Router Tests
 * ===========================
 * Tests for v6 Hybrid Upgrade - Story 01: Direct Slash Command Invocation.
 *
 * Test coverage per TEA Phase 3 test plan (49 test cases):
 * - Task 1.2: Alias registry loading & collision detection
 * - Task 1.3: Router resolution, RBAC, audit, input validation
 * - Task 1.5: Backward compatibility
 *
 * Security tests per consolidated review:
 * - VULN-005: RBAC enforcement
 * - VULN-008: Reserved name collision
 * - VULN-011: Command injection prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';

import {
  SlashCommandRouter,
  levenshteinDistance,
  VALID_COMMAND_PATTERN,
  VALID_BMAD_PATH_PATTERN,
  MAX_COMMAND_LENGTH,
  MIN_COMMAND_LENGTH
} from '../../../_bmad/core/routing/slash-command-router.js';

// ============================================================================
// Test Data: Mock Alias Registry
// ============================================================================

function createMockRouter() {
  const router = new SlashCommandRouter();

  const aliases = new Map([
    // Unique aliases
    ['threat-modeling', { target: 'bmad:cybersec-team:workflows:threat-modeling', module: 'cybersec-team', description: 'STRIDE/DREAD threat modeling' }],
    ['incident-response-playbook', { target: 'bmad:cybersec-team:workflows:incident-response-playbook', module: 'cybersec-team', description: 'Incident response playbook' }],
    ['flash-assessment', { target: 'bmad:intel-team:workflows:flash-assessment', module: 'intel-team', description: 'Rapid 15-min OSINT assessment' }],
    ['party-mode', { target: 'bmad:core:workflows:party-mode', module: 'core', description: 'Multi-agent conversations' }],
    ['create-prd', { target: 'bmad:bmm:workflows:create-prd', module: 'bmm', description: 'Create product requirements' }],
    ['brainstorm-game', { target: 'bmad:bmgd:workflows:brainstorm-game', module: 'bmgd', description: 'Game brainstorming sessions' }],
    ['contract-drafting', { target: 'bmad:legal-team:workflows:contract-drafting', module: 'legal-team', description: 'Draft legal contracts' }],
    ['design-thinking', { target: 'bmad:cis:workflows:design-thinking', module: 'cis', description: 'Design thinking workshop' }],
    // Module-prefixed aliases (disambiguation)
    ['game:code-review', { target: 'bmad:bmgd:workflows:code-review', module: 'bmgd', description: 'Game dev code review' }],
    ['bmm:code-review', { target: 'bmad:bmm:workflows:code-review', module: 'bmm', description: 'Software dev code review' }],
    ['core:conflict-resolution', { target: 'bmad:core:workflows:conflict-resolution', module: 'core', description: 'Core conflict resolution' }],
    ['strategy:conflict-resolution', { target: 'bmad:strategy-team:workflows:conflict-resolution', module: 'strategy-team', description: 'Strategic conflict resolution' }],
    ['game:quick-dev', { target: 'bmad:bmgd:workflows:quick-dev', module: 'bmgd', description: 'Game quick development' }],
    ['bmm:quick-dev', { target: 'bmad:bmm:workflows:quick-dev', module: 'bmm', description: 'Software quick development' }],
  ]);

  const conflicts = new Map([
    ['code-review', {
      options: [
        { alias: 'game:code-review', target: 'bmad:bmgd:workflows:code-review', module: 'bmgd' },
        { alias: 'bmm:code-review', target: 'bmad:bmm:workflows:code-review', module: 'bmm' }
      ]
    }],
    ['conflict-resolution', {
      options: [
        { alias: 'core:conflict-resolution', target: 'bmad:core:workflows:conflict-resolution', module: 'core' },
        { alias: 'strategy:conflict-resolution', target: 'bmad:strategy-team:workflows:conflict-resolution', module: 'strategy-team' }
      ]
    }],
    ['quick-dev', {
      options: [
        { alias: 'game:quick-dev', target: 'bmad:bmgd:workflows:quick-dev', module: 'bmgd' },
        { alias: 'bmm:quick-dev', target: 'bmad:bmm:workflows:quick-dev', module: 'bmm' }
      ]
    }],
  ]);

  const reserved = new Set([
    'secret', 'bash-safety', 'env-protection', 'outside-repo', 'production',
    'pii', 'prompt-injection', 'jailbreak', 'rate-limiter', 'supply-chain',
    'plugin-permissions', 'resource-limits', 'recursion-guard', 'token-validator',
    'anomaly-detector', 'audit-integrity', 'confidence-tracker', 'context-manager',
    'session-init', 'telemetry',
    'help', 'bmad-help', 'clear', 'exit', 'status',
    'abdul', 'bmad-master'
  ]);

  router.loadFromMap(aliases, conflicts, reserved);
  return router;
}

// Mock AuthorizationManager
function createMockAuthManager(options = {}) {
  const defaultPerms = { allowed: true };
  return {
    canExecuteWorkflow: vi.fn().mockReturnValue(options.result || defaultPerms),
    formatDenialMessage: vi.fn().mockReturnValue('ACCESS DENIED: Mock denial message'),
    isEnabled: vi.fn().mockReturnValue(true)
  };
}

// Mock user objects
const adminUser = { userId: 'admin-1', userName: 'admin', roles: ['admin'], credentialVerified: true };
const analystUser = { userId: 'analyst-1', userName: 'analyst', roles: ['security_analyst'], credentialVerified: false };
const viewerUser = { userId: 'viewer-1', userName: 'viewer', roles: ['viewer'], credentialVerified: false };
const devUser = { userId: 'dev-1', userName: 'developer', roles: ['developer'], credentialVerified: false };

// ============================================================================
// Test Suites
// ============================================================================

describe('SlashCommandRouter', () => {

  // ==========================================================================
  // Task 1.2: Alias Registry Tests (TEST-1-2-*)
  // ==========================================================================

  describe('Alias Registry Loading', () => {

    it('TEST-1-2-001: All aliases loaded from map', () => {
      const router = createMockRouter();
      const stats = router.getStats();
      expect(stats.totalAliases).toBeGreaterThan(0);
      expect(stats.loaded).toBe(true);
    });

    it('TEST-1-2-002: No alias collisions within resolved aliases', () => {
      const router = createMockRouter();
      const allAliases = router.getAllAliases();
      const names = allAliases.map(a => a.alias);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('TEST-1-2-003: Alias lookup returns correct full path', () => {
      const router = createMockRouter();
      const result = router.resolve('threat-modeling');
      expect(result.type).toBe('resolved');
      expect(result.path).toBe('bmad:cybersec-team:workflows:threat-modeling');
    });

    it('TEST-1-2-004: Module prefix disambiguation works', () => {
      const router = createMockRouter();

      const gameReview = router.resolve('game:code-review');
      expect(gameReview.type).toBe('resolved');
      expect(gameReview.path).toBe('bmad:bmgd:workflows:code-review');

      const bmmReview = router.resolve('bmm:code-review');
      expect(bmmReview.type).toBe('resolved');
      expect(bmmReview.path).toBe('bmad:bmm:workflows:code-review');
    });

    it('TEST-1-2-007: Reserved name collision detection', () => {
      const router = createMockRouter();

      const secretResult = router.validateInput('secret');
      expect(secretResult.valid).toBe(false);
      expect(secretResult.error).toContain('reserved');

      const bashSafetyResult = router.validateInput('bash-safety');
      expect(bashSafetyResult.valid).toBe(false);

      const jailbreakResult = router.validateInput('jailbreak');
      expect(jailbreakResult.valid).toBe(false);
    });

    it('TEST-1-2-008: All confirmed conflicts have disambiguation entries', () => {
      const router = createMockRouter();
      const conflicts = router.getAllConflicts();

      expect(conflicts.length).toBeGreaterThan(0);

      for (const conflict of conflicts) {
        expect(conflict.options.length).toBeGreaterThanOrEqual(2);
        for (const option of conflict.options) {
          expect(option.alias).toBeDefined();
          expect(option.target).toBeDefined();
        }
      }
    });

    it('TEST-1-2-009: Alias name validation pattern', () => {
      expect(VALID_COMMAND_PATTERN.test('threat-modeling')).toBe(true);
      expect(VALID_COMMAND_PATTERN.test('create-prd')).toBe(true);
      expect(VALID_COMMAND_PATTERN.test('game:code-review')).toBe(true);
      expect(VALID_COMMAND_PATTERN.test('a1')).toBe(true);

      expect(VALID_COMMAND_PATTERN.test('Threat-Modeling')).toBe(false);
      expect(VALID_COMMAND_PATTERN.test('threat modeling')).toBe(false);
      expect(VALID_COMMAND_PATTERN.test('-threat')).toBe(false);
      expect(VALID_COMMAND_PATTERN.test('threat-')).toBe(false);
      expect(VALID_COMMAND_PATTERN.test('../etc/passwd')).toBe(false);
    });

    it('TEST-1-2-010: Registry loading completes quickly', () => {
      const start = performance.now();
      const router = createMockRouter();
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50); // < 50ms
    });
  });

  // ==========================================================================
  // Task 1.3: Slash Command Router Tests (TEST-1-3-*)
  // ==========================================================================

  describe('Command Resolution', () => {

    it('TEST-1-3-001: Exact alias match resolves correctly', () => {
      const router = createMockRouter();

      const result = router.resolve('threat-modeling');
      expect(result.type).toBe('resolved');
      expect(result.path).toBe('bmad:cybersec-team:workflows:threat-modeling');
      expect(result.module).toBe('cybersec-team');
    });

    it('TEST-1-3-002: Resolution time < 5ms', () => {
      const router = createMockRouter();

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        router.resolve('threat-modeling');
      }
      const elapsed = (performance.now() - start) / 100;
      expect(elapsed).toBeLessThan(5);
    });

    it('TEST-1-3-003: Unknown command returns not_found with suggestions', () => {
      const router = createMockRouter();

      const result = router.resolve('unknown-command');
      expect(result.type).toBe('not_found');
      expect(result.command).toBe('unknown-command');
    });

    it('TEST-1-3-004: Fuzzy matching for typos', () => {
      const router = createMockRouter();

      const result = router.resolve('thret-modeling');
      expect(result.type).toBe('not_found');
      expect(result.suggestions).toContain('threat-modeling');
    });

    it('TEST-1-3-005: Disambiguation prompt for ambiguous commands', () => {
      const router = createMockRouter();

      const result = router.resolve('code-review');
      expect(result.type).toBe('disambiguation');
      expect(result.options.length).toBe(2);
      expect(result.options.map(o => o.module)).toContain('bmgd');
      expect(result.options.map(o => o.module)).toContain('bmm');
    });

    it('TEST-1-3-011: Full bmad:* path passthrough', () => {
      const router = createMockRouter();

      const result = router.resolve('bmad:cybersec-team:workflows:threat-modeling');
      expect(result.type).toBe('direct');
      expect(result.path).toBe('bmad:cybersec-team:workflows:threat-modeling');
    });

    it('TEST-1-3-015: Empty/whitespace command handled gracefully', () => {
      const router = createMockRouter();

      expect(router.validateInput('')).toEqual({ valid: false, error: 'Command must be a non-empty string' });
      expect(router.validateInput(null)).toEqual({ valid: false, error: 'Command must be a non-empty string' });
      expect(router.validateInput(undefined)).toEqual({ valid: false, error: 'Command must be a non-empty string' });
      expect(router.validateInput(123)).toEqual({ valid: false, error: 'Command must be a non-empty string' });
    });
  });

  describe('RBAC Integration', () => {

    it('TEST-1-3-006: RBAC check before dispatch', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      router.execute('threat-modeling', adminUser);
      expect(authManager.canExecuteWorkflow).toHaveBeenCalledWith(adminUser, 'threat-modeling');
    });

    it('TEST-1-3-007: RBAC denial message', () => {
      const authManager = createMockAuthManager({
        result: { allowed: false, reason: 'Viewer role cannot execute workflows' }
      });
      const router = createMockRouter();
      router.authManager = authManager;

      const result = router.execute('threat-modeling', viewerUser);
      expect(result.type).toBe('denied');
      expect(result.reason).toBe('Viewer role cannot execute workflows');
    });

    it('TEST-1-3-006b: RBAC allows admin access to all workflows', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      const result = router.execute('threat-modeling', adminUser);
      expect(result.type).toBe('resolved');
    });

    it('TEST-1-3-006c: RBAC approval required flow', () => {
      const authManager = createMockAuthManager({
        result: { allowed: true, requires_approval: true, warning: 'Sensitive workflow' }
      });
      const router = createMockRouter();
      router.authManager = authManager;

      const result = router.execute('threat-modeling', analystUser);
      expect(result.type).toBe('approval_required');
      expect(result.warning).toBe('Sensitive workflow');
    });

    it('TEST-1-5-005: RBAC identical for both invocation paths', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      // Short form
      router.execute('threat-modeling', adminUser);
      const shortCall = authManager.canExecuteWorkflow.mock.calls[0];

      authManager.canExecuteWorkflow.mockClear();

      // Long form
      router.execute('bmad:cybersec-team:workflows:threat-modeling', adminUser);
      const longCall = authManager.canExecuteWorkflow.mock.calls[0];

      // Both should check the same workflow name
      expect(shortCall[1]).toBe('threat-modeling');
      expect(longCall[1]).toBe('threat-modeling');
    });
  });

  describe('Audit Logging', () => {
    let logSpy;

    beforeEach(() => {
      // Mock fs.appendFileSync to capture audit log calls
      logSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('TEST-1-3-008: Audit log entry on successful dispatch', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      router.execute('threat-modeling', adminUser);

      const logCalls = logSpy.mock.calls.filter(call =>
        typeof call[1] === 'string' && call[1].includes('DISPATCHED')
      );
      expect(logCalls.length).toBeGreaterThan(0);

      const logEntry = JSON.parse(logCalls[0][1].trim());
      expect(logEntry.action).toBe('DISPATCHED');
      expect(logEntry.details.command).toBe('threat-modeling');
    });

    it('TEST-1-3-009: Audit log entry on denied dispatch', () => {
      const authManager = createMockAuthManager({
        result: { allowed: false, reason: 'No access' }
      });
      const router = createMockRouter();
      router.authManager = authManager;

      router.execute('threat-modeling', viewerUser);

      const logCalls = logSpy.mock.calls.filter(call =>
        typeof call[1] === 'string' && call[1].includes('DENIED')
      );
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('TEST-1-3-010: Audit log entry on unknown command', () => {
      const router = createMockRouter();

      router.execute('nonexistent-command', adminUser);

      const logCalls = logSpy.mock.calls.filter(call =>
        typeof call[1] === 'string' && call[1].includes('NOT_FOUND')
      );
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('TEST-1-5-006: Audit entries generated for both short and long paths', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      router.execute('threat-modeling', adminUser);
      router.execute('bmad:cybersec-team:workflows:threat-modeling', adminUser);

      const dispatchCalls = logSpy.mock.calls.filter(call =>
        typeof call[1] === 'string' && call[1].includes('DISPATCHED')
      );
      expect(dispatchCalls.length).toBe(2);
    });
  });

  // ==========================================================================
  // Security Tests (VULN-005, VULN-008, VULN-011)
  // ==========================================================================

  describe('Input Validation & Security', () => {

    it('TEST-1-3-012: Path traversal in command name rejected', () => {
      const router = createMockRouter();

      expect(router.validateInput('../../../etc/passwd').valid).toBe(false);
      expect(router.validateInput('..\\windows\\system32').valid).toBe(false);
      expect(router.validateInput('foo/../bar').valid).toBe(false);
    });

    it('TEST-1-3-013: Command injection in command name rejected', () => {
      const router = createMockRouter();

      expect(router.validateInput('; rm -rf /').valid).toBe(false);
      expect(router.validateInput('foo && bar').valid).toBe(false);
      expect(router.validateInput('foo | bar').valid).toBe(false);
      expect(router.validateInput('$(whoami)').valid).toBe(false);
      expect(router.validateInput('`whoami`').valid).toBe(false);
    });

    it('TEST-1-3-014: Security validator names blocked from aliases', () => {
      const router = createMockRouter();

      const validators = [
        'secret', 'bash-safety', 'env-protection', 'outside-repo',
        'production', 'pii', 'prompt-injection', 'jailbreak',
        'rate-limiter', 'supply-chain', 'plugin-permissions',
        'resource-limits', 'recursion-guard', 'token-validator'
      ];

      for (const name of validators) {
        const result = router.validateInput(name);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('reserved');
      }
    });

    it('TEST-1-3-014b: System commands blocked from aliases', () => {
      const router = createMockRouter();

      const systemCmds = ['help', 'bmad-help', 'clear', 'exit', 'status'];
      for (const name of systemCmds) {
        const result = router.validateInput(name);
        expect(result.valid).toBe(false);
      }
    });

    it('TEST-1-3-014c: Agent names blocked from aliases', () => {
      const router = createMockRouter();

      expect(router.validateInput('abdul').valid).toBe(false);
      expect(router.validateInput('bmad-master').valid).toBe(false);
    });

    it('Rejects commands exceeding max length', () => {
      const router = createMockRouter();
      const longCmd = 'a'.repeat(MAX_COMMAND_LENGTH + 1);
      expect(router.validateInput(longCmd).valid).toBe(false);
    });

    it('Rejects commands below min length', () => {
      const router = createMockRouter();
      expect(router.validateInput('a').valid).toBe(false);
    });

    it('Rejects uppercase characters', () => {
      const router = createMockRouter();
      expect(router.validateInput('Threat-Modeling').valid).toBe(false);
    });

    it('Rejects special characters', () => {
      const router = createMockRouter();
      expect(router.validateInput('threat@modeling').valid).toBe(false);
      expect(router.validateInput('threat#modeling').valid).toBe(false);
      expect(router.validateInput('threat!modeling').valid).toBe(false);
    });

    it('Validates full bmad: path format', () => {
      const router = createMockRouter();

      expect(router.validateInput('bmad:cybersec-team:workflows:threat-modeling').valid).toBe(true);
      expect(router.validateInput('bmad:core:agents:abdul').valid).toBe(true);

      // Invalid bmad paths
      expect(router.validateInput('bmad:').valid).toBe(false);
      expect(router.validateInput('bmad:../../etc:workflows:evil').valid).toBe(false);
    });
  });

  // ==========================================================================
  // Task 1.5: Backward Compatibility Tests (TEST-1-5-*)
  // ==========================================================================

  describe('Backward Compatibility', () => {

    it('TEST-1-5-001: Long-form path still works', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      const result = router.execute('bmad:cybersec-team:workflows:threat-modeling', adminUser);
      expect(result.type).toBe('resolved');
      expect(result.path).toBe('bmad:cybersec-team:workflows:threat-modeling');
    });

    it('TEST-1-5-002: Long-form and short-form produce identical behavior', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      const shortResult = router.execute('threat-modeling', adminUser);
      const longResult = router.execute('bmad:cybersec-team:workflows:threat-modeling', adminUser);

      expect(shortResult.path).toBe(longResult.path);
    });

    it('TEST-1-5-007: Module-prefixed aliases work correctly', () => {
      const authManager = createMockAuthManager({ result: { allowed: true } });
      const router = createMockRouter();
      router.authManager = authManager;

      const gameResult = router.execute('game:code-review', devUser);
      expect(gameResult.type).toBe('resolved');
      expect(gameResult.path).toBe('bmad:bmgd:workflows:code-review');

      const bmmResult = router.execute('bmm:code-review', devUser);
      expect(bmmResult.type).toBe('resolved');
      expect(bmmResult.path).toBe('bmad:bmm:workflows:code-review');
    });
  });

  // ==========================================================================
  // Utility Tests
  // ==========================================================================

  describe('Levenshtein Distance', () => {

    it('Returns 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('Returns correct distance for single edit', () => {
      expect(levenshteinDistance('hello', 'helo')).toBe(1);
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('Returns correct distance for multiple edits', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('Returns length for empty comparison', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'hello')).toBe(5);
    });
  });

  describe('Workflow Name Extraction', () => {
    it('Extracts name from full bmad path', () => {
      const router = createMockRouter();
      expect(router.extractWorkflowName('bmad:cybersec-team:workflows:threat-modeling')).toBe('threat-modeling');
      expect(router.extractWorkflowName('bmad:core:workflows:party-mode')).toBe('party-mode');
    });

    it('Returns input for simple names', () => {
      const router = createMockRouter();
      expect(router.extractWorkflowName('threat-modeling')).toBe('threat-modeling');
    });

    it('Handles empty input', () => {
      const router = createMockRouter();
      expect(router.extractWorkflowName('')).toBe('');
      expect(router.extractWorkflowName(null)).toBe('');
    });
  });

  describe('Router Stats', () => {
    it('Reports correct statistics', () => {
      const router = createMockRouter();
      const stats = router.getStats();

      expect(stats.totalAliases).toBe(14);
      expect(stats.totalConflicts).toBe(3);
      expect(stats.totalReservedNames).toBeGreaterThan(20);
      expect(stats.loaded).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('Returns error when router not loaded', () => {
      const router = new SlashCommandRouter();
      const result = router.resolve('threat-modeling');
      expect(result.type).toBe('error');
    });

    it('Handles missing registry file gracefully', () => {
      const router = new SlashCommandRouter();
      expect(() => router.load('/nonexistent/path.yaml')).toThrow('Alias registry not found');
    });
  });
});
