/**
 * E2E RBAC Authorization Tests (P6-30)
 *
 * Tests the full RBAC authorization pipeline:
 *   agent request -> path normalization -> RBAC check -> allow/deny
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { agentPathResolver, AuthorizationManager } from '../../src/core/security/authorization.ts';

const PROJECT_ROOT = resolve(import.meta.dirname, '../..');
const RBAC_CONFIG_PATH = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');

const USERS = {
  admin: { userId: 'admin-1', userName: 'admin', roles: ['admin'], modules: ['*'], credentialVerified: true },
  securityLead: { userId: 'sec-lead-1', userName: 'security-lead', roles: ['security_lead'], modules: ['cybersec-team', 'intel-team', 'core'], credentialVerified: true },
  developer: { userId: 'dev-1', userName: 'developer', roles: ['developer'], modules: ['bmm', 'bmgd', 'bmb', 'cis', 'core'], credentialVerified: false },
  viewer: { userId: 'viewer-1', userName: 'viewer', roles: ['viewer'], modules: ['core'], credentialVerified: false },
  guest: { userId: 'guest-1', userName: 'guest', roles: ['guest'], modules: ['core'], credentialVerified: false },
  intelAnalyst: { userId: 'intel-1', userName: 'intel-analyst', roles: ['intel_analyst'], modules: ['intel-team', 'core'], credentialVerified: true },
};

describe('E2E RBAC Authorization', () => {
  describe('Prerequisites', () => {
    it('should have rbac-config.yaml', () => { expect(existsSync(RBAC_CONFIG_PATH)).toBe(true); });
    it('should have authorization.ts', () => { expect(existsSync(resolve(PROJECT_ROOT, 'src/core/security/authorization.ts'))).toBe(true); });
    it('should have authorization.js', () => { expect(existsSync(resolve(PROJECT_ROOT, 'src/core/security/authorization.js'))).toBe(true); });
  });

  describe('Path Normalization Pipeline', () => {
    it('should normalize legacy format', () => {
      const r = agentPathResolver('cybersec-team/threat-analyst');
      expect(r.format).toBe('legacy'); expect(r.module).toBe('cybersec-team'); expect(r.agent).toBe('threat-analyst');
    });
    it('should normalize single-segment', () => { const r = agentPathResolver('abdul'); expect(r.format).toBe('single'); expect(r.agent).toBe('abdul'); });
    it('should pass through src/ v6', () => { const r = agentPathResolver('src/cybersec-team/agents/threat-analyst'); expect(r.format).toBe('v6'); expect(r.module).toBe('cybersec-team'); });
    it('should handle _bmad/ as v6', () => { const r = agentPathResolver('_bmad/cybersec-team/agents/threat-analyst'); expect(r.format).toBe('v6'); });
    it('should return invalid for empty', () => { expect(agentPathResolver('').format).toBe('invalid'); });
    it('should return invalid for null', () => { expect(agentPathResolver(null).format).toBe('invalid'); });
    it('should return invalid for undefined', () => { expect(agentPathResolver(undefined).format).toBe('invalid'); });
    it('should handle special chars', () => { expect(agentPathResolver('module/../etc/passwd')).toBeDefined(); });
    it('should handle deeply nested v6', () => { const r = agentPathResolver('src/deep/agents/nested/extra'); expect(r.format).toBe('v6'); expect(r.module).toBe('deep'); });
  });

  describe('Admin Role - Full Access', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('allow via v6', () => { expect(manager.canAccessAgent(USERS.admin, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(true); });
    it('allow via legacy', () => { expect(manager.canAccessAgent(USERS.admin, 'cybersec-team/threat-analyst').allowed).toBe(true); });
    it('allow via single', () => { expect(manager.canAccessAgent(USERS.admin, 'abdul').allowed).toBe(true); });
    it('allow via _bmad/', () => { expect(manager.canAccessAgent(USERS.admin, '_bmad/cybersec-team/agents/threat-analyst').allowed).toBe(true); });
    it('allow intel despite cred', () => { expect(manager.canAccessAgent(USERS.admin, 'src/intel-team/agents/osint-lead').allowed).toBe(true); });
    it('allow any workflow', () => { expect(manager.canExecuteWorkflow(USERS.admin, 'incident-response').allowed).toBe(true); });
  });

  describe('Security Lead Role', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('allow cybersec', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(true); });
    it('allow intel', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/intel-team/agents/osint-lead').allowed).toBe(true); });
    it('allow core', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/core/agents/abdul').allowed).toBe(true); });
    it('deny bmm', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/bmm/agents/pm').allowed).toBe(false); });
    it('deny legal', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/legal-team/agents/contract-attorney').allowed).toBe(false); });
    it('legacy path works', () => { expect(manager.canAccessAgent(USERS.securityLead, 'cybersec-team/threat-analyst').allowed).toBe(true); });
  });

  describe('Viewer Role - Minimal Access', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('allow core/abdul', () => { expect(manager.canAccessAgent(USERS.viewer, 'src/core/agents/abdul').allowed).toBe(true); });
    it('allow core/bmad-master', () => { expect(manager.canAccessAgent(USERS.viewer, 'src/core/agents/bmad-master').allowed).toBe(true); });
    it('deny cybersec', () => { expect(manager.canAccessAgent(USERS.viewer, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false); });
    it('deny intel', () => { expect(manager.canAccessAgent(USERS.viewer, 'src/intel-team/agents/osint-lead').allowed).toBe(false); });
    it('deny bmm', () => { expect(manager.canAccessAgent(USERS.viewer, 'src/bmm/agents/pm').allowed).toBe(false); });
    it('deny workflow exec', () => { expect(manager.canExecuteWorkflow(USERS.viewer, 'create-prd').allowed).toBe(false); });
  });

  describe('Developer Role', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('allow bmm', () => { expect(manager.canAccessAgent(USERS.developer, 'src/bmm/agents/pm').allowed).toBe(true); });
    it('allow core', () => { expect(manager.canAccessAgent(USERS.developer, 'src/core/agents/abdul').allowed).toBe(true); });
    it('deny cybersec', () => { expect(manager.canAccessAgent(USERS.developer, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false); });
    it('deny intel', () => { expect(manager.canAccessAgent(USERS.developer, 'src/intel-team/agents/osint-lead').allowed).toBe(false); });
    it('allow dev workflows', () => { expect(manager.canExecuteWorkflow(USERS.developer, 'create-prd').allowed).toBe(true); });
  });

  describe('Cross-Format Consistency', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('legacy vs v6 admin', () => { expect(manager.canAccessAgent(USERS.admin, 'cybersec-team/threat-analyst').allowed).toBe(manager.canAccessAgent(USERS.admin, 'src/cybersec-team/agents/threat-analyst').allowed); });
    it('legacy vs v6 sec_lead', () => { expect(manager.canAccessAgent(USERS.securityLead, 'cybersec-team/threat-analyst').allowed).toBe(manager.canAccessAgent(USERS.securityLead, 'src/cybersec-team/agents/threat-analyst').allowed); });
    it('legacy vs v6 viewer', () => { expect(manager.canAccessAgent(USERS.viewer, 'cybersec-team/threat-analyst').allowed).toBe(false); expect(manager.canAccessAgent(USERS.viewer, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false); });
    it('_bmad/ normalized to src/', () => { expect(manager.canAccessAgent(USERS.admin, '_bmad/cybersec-team/agents/threat-analyst').allowed).toBe(manager.canAccessAgent(USERS.admin, 'src/cybersec-team/agents/threat-analyst').allowed); });
  });

  describe('Wildcard Patterns', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('* for admin', () => { expect(manager.canAccessAgent(USERS.admin, 'src/any/agents/any').allowed).toBe(true); });
    it('module/* for sec_lead', () => { expect(manager.canAccessAgent(USERS.securityLead, 'src/cybersec-team/agents/any').allowed).toBe(true); });
    it('prefix-* workflow', () => { expect(manager.canExecuteWorkflow(USERS.securityLead, 'incident-response').allowed).toBe(true); });
    it('prefix-* variant', () => { expect(manager.canExecuteWorkflow(USERS.securityLead, 'incident-other').allowed).toBe(true); });
  });

  describe('Agent-Level Restrictions', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('enforce credential for field-operative', () => {
      const u = { ...USERS.intelAnalyst, credentialVerified: false };
      expect(manager.canAccessAgent(u, 'src/intel-team/agents/field-operative').allowed).toBe(false);
    });
    it('allow field-operative with credentials', () => { expect(manager.canAccessAgent(USERS.intelAnalyst, 'src/intel-team/agents/field-operative').allowed).toBe(true); });
  });

  describe('Module-Level Restrictions', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('deny intel for dev', () => { expect(manager.canAccessModule(USERS.developer, 'intel-team').allowed).toBe(false); });
    it('deny legal for dev', () => { expect(manager.canAccessModule(USERS.developer, 'legal-team').allowed).toBe(false); });
    it('allow bmm for dev', () => { expect(manager.canAccessModule(USERS.developer, 'bmm').allowed).toBe(true); });
    it('require cred for intel', () => { const u = { ...USERS.intelAnalyst, credentialVerified: false }; expect(manager.canAccessModule(u, 'intel-team').allowed).toBe(false); });
  });

  describe('Edge Cases', () => {
    let manager;
    beforeEach(() => { manager = new AuthorizationManager(RBAC_CONFIG_PATH); });
    it('handle empty path', () => { expect(manager.canAccessAgent(USERS.admin, '')).toBeDefined(); });
    it('handle unknown role', () => { const u = { userId: 'u1', userName: 'u', roles: ['nonexistent'], modules: [], credentialVerified: false }; expect(manager.canAccessAgent(u, 'src/core/agents/abdul').allowed).toBe(false); });
    it('deny-by-default no roles', () => { const u = { userId: 'n', userName: 'n', roles: [], modules: [], credentialVerified: false }; expect(manager.canAccessAgent(u, 'src/core/agents/abdul').allowed).toBe(false); });
    it('default role is viewer', () => { expect(manager.getDefaultRole()).toBe('viewer'); });
    it('list all roles', () => { const r = manager.getAllRoles(); expect(r).toContain('admin'); expect(r).toContain('viewer'); expect(r).toContain('guest'); });
  });
});
