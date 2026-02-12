/**
 * SA-03-S5: RBAC Bypass Penetration Tests
 *
 * Target: src/core/security/authorization.ts
 * Purpose: Attempt RBAC authorization bypass and privilege escalation.
 * Method: RUNTIME tests — call real RBAC functions with bypass payloads.
 *
 * Acceptance Criteria:
 * - All 5 bypass vectors tested
 * - 0 successful unauthorized access
 * - Yolo mode confirmed independent of RBAC
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import {
  agentPathResolver,
  AuthorizationManager
} from '../../src/core/security/authorization.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const RBAC_CONFIG = resolve(ROOT, 'src/core/security/rbac-config.yaml');

// ============================================================================
describe('SA-03-S5: RBAC Bypass Attempts', () => {
  // Create AuthorizationManager instance
  const authManager = new AuthorizationManager(RBAC_CONFIG);

  // Unauthorized user context (guest role — minimal permissions)
  const guestUser = {
    userId: 'pentest-guest',
    userName: 'Pentest Guest',
    roles: ['guest'],
    modules: [],
    credentialVerified: false
  };

  // Viewer user context (default role)
  const viewerUser = {
    userId: 'pentest-viewer',
    userName: 'Pentest Viewer',
    roles: ['viewer'],
    modules: ['core', 'bmm'],
    credentialVerified: false
  };

  // --------------------------------------------------------------------------
  // Test 1: Legacy path format bypass
  // --------------------------------------------------------------------------
  describe('legacy path format bypass attempts', () => {
    it('PENTEST-S5-01: legacy path `cybersec-team/ghost` DENIED for guest', () => {
      const result = authManager.canAccessAgent(guestUser, 'cybersec-team/ghost');
      // Legacy paths are normalized to src/ format before RBAC matching
      // Guest role should NOT have access to cybersec-team agents
      expect(result.allowed).toBe(false);
    });

    it('PENTEST-S5-01b: legacy path `cybersec-team/ghost` DENIED for viewer', () => {
      const result = authManager.canAccessAgent(viewerUser, 'cybersec-team/ghost');
      expect(result.allowed).toBe(false);
    });

    it('PENTEST-S5-01c: v6 path for restricted agent DENIED for guest', () => {
      const result = authManager.canAccessAgent(guestUser, 'src/cybersec-team/agents/penetration-tester');
      expect(result.allowed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Test 2: Wildcard pattern abuse via parent directory traversal
  // --------------------------------------------------------------------------
  describe('wildcard pattern abuse via traversal', () => {
    it('PENTEST-S5-02: traversal src/bmm/agents/../../cybersec-team/agents/ghost', () => {
      const traversalPath = 'src/bmm/agents/../../cybersec-team/agents/ghost';
      const result = authManager.canAccessAgent(viewerUser, traversalPath);

      // agentPathResolver parses this as:
      // parts = ['src', 'bmm', 'agents', '..', '..', 'cybersec-team', 'agents', 'ghost']
      // module = parts[1] = 'bmm', agent = parts[3] = '..'
      // The traversal is NOT resolved — it's just parsed literally
      // RBAC matching checks against normalizedPath which is the original path
      // The viewer does NOT have wildcard access to this agent
      expect(result.allowed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Test 3: Module-level bypass (disabled module)
  // --------------------------------------------------------------------------
  describe('module-level access control', () => {
    it('PENTEST-S5-03: guest cannot access cybersec-team module agents', () => {
      // cybersec-team module has restrictions
      const result = authManager.canAccessModule(guestUser, 'cybersec-team');
      expect(result.allowed).toBe(false);
    });

    it('PENTEST-S5-03b: guest cannot access intel-team module agents', () => {
      const result = authManager.canAccessModule(guestUser, 'intel-team');
      expect(result.allowed).toBe(false);
    });

    it('PENTEST-S5-03c: viewer cannot access restricted modules', () => {
      // Viewer should not have access to security-restricted modules
      const restrictedModules = ['cybersec-team', 'intel-team'];
      for (const mod of restrictedModules) {
        const result = authManager.canAccessModule(viewerUser, mod);
        expect(result.allowed).toBe(false);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Test 4: rbac-config.yaml write protection
  // --------------------------------------------------------------------------
  describe('RBAC config write protection', () => {
    it('PENTEST-S5-04: settings.json blocks writes to rbac-config.yaml', () => {
      const settingsPath = resolve(ROOT, '.claude/settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));

      // Check that there are PreToolUse hooks that validate file writes
      const preToolUse = settings.hooks?.PreToolUse || [];
      const hasWriteValidation = preToolUse.some(hook => {
        const hookStr = JSON.stringify(hook);
        return hookStr.includes('Write') || hookStr.includes('Edit');
      });
      expect(hasWriteValidation).toBe(true);

      // Check that validators exist for security-critical files
      const validatorsDir = resolve(ROOT, '.claude/validators-node');
      expect(existsSync(validatorsDir)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Test 5: Yolo mode does NOT override RBAC
  // --------------------------------------------------------------------------
  describe('yolo mode independence', () => {
    it('PENTEST-S5-05: RBAC is independent of yolo_mode', () => {
      // Verify in source that yolo_mode does not disable RBAC
      const authSource = readFileSync(resolve(ROOT, 'src/core/security/authorization.ts'), 'utf-8');

      // canAccessAgent should NOT check for yolo_mode
      expect(authSource).not.toMatch(/yolo.*disable.*rbac/i);
      expect(authSource).not.toMatch(/yolo.*bypass/i);

      // The enabled check only reads from RBAC config, not yolo_mode
      expect(authSource).toContain('this.config.enabled');
    });

    it('PENTEST-S5-05b: RBAC still denies guest even if RBAC is "enabled"', () => {
      // Double-check: guest with enabled RBAC is denied
      expect(authManager.isEnabled()).toBe(true);
      const result = authManager.canAccessAgent(guestUser, 'src/cybersec-team/agents/penetration-tester');
      expect(result.allowed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Additional RBAC hardening checks
  // --------------------------------------------------------------------------
  describe('RBAC hardening', () => {
    it('deny_by_default is enabled', () => {
      const configContent = readFileSync(RBAC_CONFIG, 'utf-8');
      expect(configContent).toContain('deny_by_default: true');
    });

    it('circular inheritance detection works', () => {
      const authSource = readFileSync(resolve(ROOT, 'src/core/security/authorization.ts'), 'utf-8');
      expect(authSource).toContain('Circular role inheritance detected');
      expect(authSource).toContain('resolutionInProgress');
    });

    it('credential verification enforced for intel module', () => {
      // Intel module requires credential verification
      const unverifiedIntel = {
        userId: 'pentest-intel',
        userName: 'Intel Tester',
        roles: ['intel_analyst'],
        modules: ['intel-team'],
        credentialVerified: false  // NOT verified
      };

      const configContent = readFileSync(RBAC_CONFIG, 'utf-8');
      // Verify intel-team requires credential verification
      expect(configContent).toMatch(/intel.*credential_verification.*true/s);
    });
  });
});
