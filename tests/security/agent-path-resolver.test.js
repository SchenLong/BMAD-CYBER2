/**
 * CRIT-1: Agent Path Resolver Tests
 *
 * Validates that agentPathResolver correctly parses agent IDs in both
 * legacy format (module/agent) and v6 format (_bmad/module/agents/agent),
 * preventing RBAC bypass when agent ID formats change.
 *
 * Tests the ESM TypeScript version (authorization.ts) which Vitest handles
 * natively. The CJS version (authorization.js) has identical logic and runs
 * as a subprocess hook outside of Vitest.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { agentPathResolver, AuthorizationManager } from '../../src/core/security/authorization.ts';

// ============================================================================
// Unit Tests: agentPathResolver
// ============================================================================

describe('agentPathResolver', () => {
  describe('legacy format (module/agent)', () => {
    it('should parse cybersec-team/threat-analyst correctly', () => {
      const result = agentPathResolver('cybersec-team/threat-analyst');
      expect(result).toEqual({
        module: 'cybersec-team',
        agent: 'threat-analyst',
        format: 'legacy',
      });
    });

    it('should parse intel-team/osint-lead correctly', () => {
      const result = agentPathResolver('intel-team/osint-lead');
      expect(result).toEqual({
        module: 'intel-team',
        agent: 'osint-lead',
        format: 'legacy',
      });
    });

    it('should parse core/abdul correctly', () => {
      const result = agentPathResolver('core/abdul');
      expect(result).toEqual({
        module: 'core',
        agent: 'abdul',
        format: 'legacy',
      });
    });
  });

  describe('single segment format', () => {
    it('should parse single agent name "abdul" correctly', () => {
      const result = agentPathResolver('abdul');
      expect(result).toEqual({
        module: 'abdul',
        agent: 'abdul',
        format: 'single',
      });
    });
  });

  describe('v6 format (_bmad/module/agents/agent)', () => {
    it('should parse src/cybersec-team/agents/threat-analyst correctly', () => {
      const result = agentPathResolver('src/cybersec-team/agents/threat-analyst');
      expect(result).toEqual({
        module: 'cybersec-team',
        agent: 'threat-analyst',
        format: 'v6',
      });
    });

    it('should parse src/intel-team/agents/osint-lead correctly', () => {
      const result = agentPathResolver('src/intel-team/agents/osint-lead');
      expect(result).toEqual({
        module: 'intel-team',
        agent: 'osint-lead',
        format: 'v6',
      });
    });

    it('should parse src/core/agents/abdul correctly', () => {
      const result = agentPathResolver('src/core/agents/abdul');
      expect(result).toEqual({
        module: 'core',
        agent: 'abdul',
        format: 'v6',
      });
    });
  });

  describe('edge cases', () => {
    it('should return invalid for empty string', () => {
      const result = agentPathResolver('');
      expect(result).toEqual({
        module: '',
        agent: '',
        format: 'invalid',
      });
    });

    it('should return invalid for null', () => {
      // @ts-expect-error Testing invalid input
      const result = agentPathResolver(null);
      expect(result).toEqual({
        module: '',
        agent: '',
        format: 'invalid',
      });
    });

    it('should return invalid for undefined', () => {
      // @ts-expect-error Testing invalid input
      const result = agentPathResolver(undefined);
      expect(result).toEqual({
        module: '',
        agent: '',
        format: 'invalid',
      });
    });

    it('should handle _bmad/ prefix with missing segments gracefully', () => {
      const result = agentPathResolver('_bmad/');
      expect(result.format).toBe('v6');
      expect(result.module).toBe('');
      expect(result.agent).toBe('');
    });
  });
});

// ============================================================================
// Integration Tests: AuthorizationManager with v6 format paths
// ============================================================================

describe('AuthorizationManager integration with agentPathResolver', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const configPath = path.resolve(__dirname, '../../src/core/security/rbac-config.yaml');

  let manager;

  beforeEach(() => {
    manager = new AuthorizationManager(configPath);
  });

  it('should allow admin access to v6-format agent path', () => {
    const adminUser = {
      userId: 'admin-1',
      userName: 'admin',
      roles: ['admin'],
      modules: ['*'],
      credentialVerified: true,
    };

    // Legacy format should work
    const legacyResult = manager.canAccessAgent(adminUser, 'cybersec-team/threat-analyst');
    expect(legacyResult.allowed).toBe(true);

    // V6 format should also work (module extracted as "cybersec-team", not "_bmad")
    const v6Result = manager.canAccessAgent(adminUser, 'src/cybersec-team/agents/threat-analyst');
    expect(v6Result.allowed).toBe(true);
  });

  it('should extract correct module from v6 path for module-level RBAC check', () => {
    // A security_lead has access to cybersec-team and intel-team modules
    const secLead = {
      userId: 'sec-1',
      userName: 'sec-lead',
      roles: ['security_lead'],
      modules: ['cybersec-team', 'intel-team', 'core'],
      credentialVerified: true,
    };

    // V6 format: module should be "cybersec-team", NOT "_bmad"
    // CRIT-1 ensures agentPathResolver extracts the correct module from v6 paths.
    // The v6 path is normalized and matched against v6-format patterns in rbac-config.yaml.
    // security_lead has pattern "src/cybersec-team/agents/*" which matches this agent.
    const result = manager.canAccessAgent(secLead, 'src/cybersec-team/agents/threat-analyst');
    // With v6 patterns in rbac-config.yaml, both module and agent checks pass.
    // Without CRIT-1, this would fail at MODULE check with "_bmad" not found.
    expect(result.allowed).toBe(true);
  });

  it('should deny access to v6 path when user lacks module permission', () => {
    const viewer = {
      userId: 'viewer-1',
      userName: 'viewer',
      roles: ['viewer'],
      modules: [],
      credentialVerified: false,
    };

    // V6 format for a restricted module
    const result = manager.canAccessAgent(viewer, 'src/cybersec-team/agents/threat-analyst');
    expect(result.allowed).toBe(false);
  });
});
