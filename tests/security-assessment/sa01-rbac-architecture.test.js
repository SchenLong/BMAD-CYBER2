/**
 * SA-01-S1: RBAC & Authorization Architecture Review
 *
 * Security Assessment — Architecture Review Phase
 * Validates the RBAC authorization model end-to-end.
 * 8 checks covering deny_by_default, inheritance, path resolution,
 * agent coverage, wildcard scope, credential verification,
 * _bmad/ normalization, and yolo_mode isolation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import {
  agentPathResolver,
  AuthorizationManager,
} from '../../src/core/security/authorization.ts';

const PROJECT_ROOT = resolve(import.meta.dirname, '../..');
const RBAC_CONFIG_PATH = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');
const AUTHORIZATION_JS_PATH = resolve(PROJECT_ROOT, 'src/core/security/authorization.js');
const AUTHORIZATION_TS_PATH = resolve(PROJECT_ROOT, 'src/core/security/authorization.ts');
const AGENT_MANIFEST_PATH = resolve(PROJECT_ROOT, '_bmad/_config/agent-manifest.csv');
const CONFIG_YAML_PATH = resolve(PROJECT_ROOT, 'src/core/config.yaml');

// Test users with different roles
const USERS = {
  admin: { userId: 'admin-1', userName: 'admin', roles: ['admin'], modules: ['*'], credentialVerified: true },
  securityLead: { userId: 'sec-1', userName: 'sec-lead', roles: ['security_lead'], modules: ['cybersec-team', 'intel-team', 'core'], credentialVerified: true },
  developer: { userId: 'dev-1', userName: 'dev', roles: ['developer'], modules: ['bmm', 'bmgd', 'bmb', 'cis', 'core'], credentialVerified: false },
  viewer: { userId: 'viewer-1', userName: 'viewer', roles: ['viewer'], modules: ['core'], credentialVerified: false },
  guest: { userId: 'guest-1', userName: 'guest', roles: ['guest'], modules: ['core'], credentialVerified: false },
  intelAnalyst: { userId: 'intel-1', userName: 'intel', roles: ['intel_analyst'], modules: ['intel-team', 'core'], credentialVerified: true },
  intelAnalystNoCred: { userId: 'intel-2', userName: 'intel-nocred', roles: ['intel_analyst'], modules: ['intel-team', 'core'], credentialVerified: false },
};

// Helper: parse agent-manifest.csv
function parseAgentManifest() {
  const content = readFileSync(AGENT_MANIFEST_PATH, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const idIdx = headers.indexOf('id');
  const moduleIdx = headers.indexOf('module');
  const nameIdx = headers.indexOf('name');
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return { id: cols[idIdx], module: cols[moduleIdx], name: cols[nameIdx] };
  });
}

// Helper: read raw RBAC config
function parseRbacConfigRaw() {
  return readFileSync(RBAC_CONFIG_PATH, 'utf-8');
}

// ============================================================================
// Prerequisites
// ============================================================================

describe('SA-01-S1 Prerequisites', () => {
  it('rbac-config.yaml exists', () => { expect(existsSync(RBAC_CONFIG_PATH)).toBe(true); });
  it('authorization.js exists', () => { expect(existsSync(AUTHORIZATION_JS_PATH)).toBe(true); });
  it('authorization.ts exists', () => { expect(existsSync(AUTHORIZATION_TS_PATH)).toBe(true); });
  it('agent-manifest.csv exists', () => { expect(existsSync(AGENT_MANIFEST_PATH)).toBe(true); });
  it('config.yaml exists', () => { expect(existsSync(CONFIG_YAML_PATH)).toBe(true); });
});

// ============================================================================
// CHECK 1: deny_by_default: true
// ============================================================================

describe('SA-01 Check 1: deny_by_default is true', () => {
  it('should have deny_by_default: true in rbac-config.yaml', () => {
    const content = parseRbacConfigRaw();
    expect(content).toContain('deny_by_default: true');
  });

  it('should deny an unknown role access to any agent', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const unknownUser = { userId: 'x', userName: 'x', roles: ['nonexistent_role'], modules: [], credentialVerified: false };
    // Unknown role should be denied (deny_by_default)
    const result = manager.canAccessAgent(unknownUser, 'src/cybersec-team/agents/threat-analyst');
    expect(result.allowed).toBe(false);
  });

  it('should deny user with empty roles', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const noRoleUser = { userId: 'x', userName: 'x', roles: [], modules: [], credentialVerified: false };
    const result = manager.canAccessAgent(noRoleUser, 'src/core/agents/abdul');
    expect(result.allowed).toBe(false);
  });
});

// ============================================================================
// CHECK 2: No circular role inheritance
// ============================================================================

describe('SA-01 Check 2: No circular role inheritance', () => {
  it('should successfully construct AuthorizationManager (no circular refs)', () => {
    expect(() => new AuthorizationManager(RBAC_CONFIG_PATH)).not.toThrow();
  });

  it('should have circular detection guard in source code', () => {
    const tsSource = readFileSync(AUTHORIZATION_TS_PATH, 'utf-8');
    expect(tsSource).toContain('resolutionInProgress');
    expect(tsSource).toContain('Circular role inheritance detected');
  });

  it('should have only valid inheritance: security_lead -> security_analyst', () => {
    const content = parseRbacConfigRaw();
    // security_lead inherits security_analyst
    const secLeadIdx = content.indexOf('security_lead:');
    const afterSecLead = content.slice(secLeadIdx, secLeadIdx + 300);
    expect(afterSecLead).toContain('- security_analyst');
  });
});

// ============================================================================
// CHECK 3: agentPathResolver handles 4 input formats
// ============================================================================

describe('SA-01 Check 3: agentPathResolver handles all input formats', () => {
  it('should resolve legacy format: module/agent', () => {
    const result = agentPathResolver('cybersec-team/ghost');
    expect(result.format).toBe('legacy');
    expect(result.module).toBe('cybersec-team');
    expect(result.agent).toBe('ghost');
  });

  it('should resolve v6 format: src/module/agents/name', () => {
    const result = agentPathResolver('src/cybersec-team/agents/ghost');
    expect(result.format).toBe('v6');
    expect(result.module).toBe('cybersec-team');
    expect(result.agent).toBe('ghost');
  });

  it('should resolve single name format', () => {
    const result = agentPathResolver('ghost');
    expect(result.format).toBe('single');
    expect(result.agent).toBe('ghost');
  });

  it('should handle invalid/null input', () => {
    const result = agentPathResolver('');
    expect(result.format).toBe('invalid');
  });

  it('should handle path traversal input (not crash)', () => {
    const result = agentPathResolver('../../../etc/passwd');
    // Should parse as legacy format (contains slashes) but NOT grant access
    expect(result).toBeDefined();
    expect(['legacy', 'invalid']).toContain(result.format);
  });

  it('should not grant access for path traversal via RBAC', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    // Even viewer should not match any RBAC pattern with traversal
    const result = manager.canAccessAgent(USERS.viewer, '../../../etc/passwd');
    expect(result.allowed).toBe(false);
  });

  it('should resolve _bmad/ prefix as v6 format', () => {
    const result = agentPathResolver('_bmad/cybersec-team/agents/ghost');
    expect(result.format).toBe('v6');
    expect(result.module).toBe('cybersec-team');
  });
});

// ============================================================================
// CHECK 4: All 80 agents covered by RBAC rules
// ============================================================================

describe('SA-01 Check 4: Every agent in manifest has RBAC coverage', () => {
  it('should have exactly 80 agents in manifest', () => {
    const agents = parseAgentManifest();
    expect(agents.length).toBe(80);
  });

  it('should allow admin to access ALL 80 agents', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const agents = parseAgentManifest();
    const failures = [];

    for (const agent of agents) {
      const result = manager.canAccessAgent(USERS.admin, agent.id);
      if (!result.allowed) {
        failures.push(`${agent.id}: ${result.reason}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('should cover all 9 modules in RBAC patterns', () => {
    const content = parseRbacConfigRaw();
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const mod of modules) {
      expect(content).toContain(mod);
    }
  });
});

// ============================================================================
// CHECK 5: No over-permissive wildcard grants
// ============================================================================

describe('SA-01 Check 5: Wildcard patterns are module-scoped', () => {
  it('should not have bare wildcard "*" in non-admin roles', () => {
    const content = parseRbacConfigRaw();
    const lines = content.split('\n');

    // Find all lines with just "- \"*\"" or "- '*'" or "- *"
    // These should only appear under admin role
    let inAdmin = false;
    const bareWildcardOutsideAdmin = [];

    for (const line of lines) {
      if (line.match(/^\s{4}admin:/)) inAdmin = true;
      else if (line.match(/^\s{4}\w/) && !line.match(/^\s{4}admin/)) inAdmin = false;

      if (!inAdmin && line.trim().match(/^-\s+["']?\*["']?$/)) {
        bareWildcardOutsideAdmin.push(line.trim());
      }
    }

    expect(bareWildcardOutsideAdmin).toEqual([]);
  });

  it('should scope developer wildcards to dev modules only (no cybersec/intel)', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    // Developer should NOT access cybersec or intel agents
    expect(manager.canAccessAgent(USERS.developer, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false);
    expect(manager.canAccessAgent(USERS.developer, 'src/intel-team/agents/osint-lead').allowed).toBe(false);
  });

  it('should scope security_lead wildcards to cybersec/intel/core', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const agents = parseAgentManifest();

    // security_lead should NOT access bmm-only agents
    const bmmAgents = agents.filter((a) => a.module === 'bmm');
    for (const agent of bmmAgents) {
      const result = manager.canAccessAgent(USERS.securityLead, agent.id);
      expect(result.allowed).toBe(false);
    }
  });

  it('should scope strategist to strategy-team and core only', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const strategist = { userId: 's-1', userName: 'strat', roles: ['strategist'], modules: ['strategy-team', 'core'], credentialVerified: false };

    expect(manager.canAccessAgent(strategist, 'src/strategy-team/agents/the-master-strategist').allowed).toBe(true);
    expect(manager.canAccessAgent(strategist, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false);
  });
});

// ============================================================================
// CHECK 6: Credential verification for sensitive roles
// ============================================================================

describe('SA-01 Check 6: credential_verification for sensitive roles', () => {
  it('should require credential_verification for intel_analyst role', () => {
    const content = parseRbacConfigRaw();
    const intelIdx = content.indexOf('intel_analyst:');
    expect(intelIdx).toBeGreaterThan(-1);
    // The credential_verification is nested under "requires:" block at end of the role definition
    // The block includes many workflow patterns, so we need a large window (lines 108-135 = ~1500 chars)
    const afterIntel = content.slice(intelIdx, intelIdx + 1600);
    expect(afterIntel).toContain('requires:');
    expect(afterIntel).toContain('credential_verification: true');
  });

  it('should require credential_verification at intel-team module level', () => {
    const content = parseRbacConfigRaw();
    const modRestIdx = content.indexOf('module_restrictions:');
    const afterMod = content.slice(modRestIdx);
    const intelTeamIdx = afterMod.indexOf('intel-team:');
    const afterIntelTeam = afterMod.slice(intelTeamIdx, intelTeamIdx + 300);
    expect(afterIntelTeam).toContain('require_credential_verification: true');
  });

  it('should deny intel_analyst WITHOUT credentials for intel-team agents', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const result = manager.canAccessAgent(USERS.intelAnalystNoCred, 'src/intel-team/agents/osint-lead');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('verified credentials');
  });

  it('should allow intel_analyst WITH credentials for intel-team agents', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const result = manager.canAccessAgent(USERS.intelAnalyst, 'src/intel-team/agents/osint-lead');
    expect(result.allowed).toBe(true);
  });

  it('should enforce credential verification for sensitive agents', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);
    const sensitiveAgents = [
      'src/intel-team/agents/field-operative',
      'src/intel-team/agents/humint-specialist',
      'src/intel-team/agents/dark-web-analyst',
    ];
    for (const agentPath of sensitiveAgents) {
      expect(manager.canAccessAgent(USERS.intelAnalystNoCred, agentPath).allowed).toBe(false);
      expect(manager.canAccessAgent(USERS.intelAnalyst, agentPath).allowed).toBe(true);
    }
  });
});

// ============================================================================
// CHECK 7: _bmad/ prefix normalizes to src/ before RBAC matching
// ============================================================================

describe('SA-01 Check 7: _bmad/ prefix normalizes to src/', () => {
  let manager;

  beforeEach(() => {
    manager = new AuthorizationManager(RBAC_CONFIG_PATH);
  });

  it('should have normalization code in authorization.ts', () => {
    const tsSource = readFileSync(AUTHORIZATION_TS_PATH, 'utf-8');
    expect(tsSource).toContain("normalizedPath.startsWith('_bmad/')");
    expect(tsSource).toContain("normalizedPath.replace(/^_bmad\\//");
  });

  it('should give same result for _bmad/ and src/ paths (admin)', () => {
    const bmadResult = manager.canAccessAgent(USERS.admin, '_bmad/cybersec-team/agents/threat-analyst');
    const srcResult = manager.canAccessAgent(USERS.admin, 'src/cybersec-team/agents/threat-analyst');
    expect(bmadResult.allowed).toBe(srcResult.allowed);
    expect(bmadResult.allowed).toBe(true);
  });

  it('should give same result for _bmad/ and src/ paths (security_lead)', () => {
    const bmadResult = manager.canAccessAgent(USERS.securityLead, '_bmad/cybersec-team/agents/threat-analyst');
    const srcResult = manager.canAccessAgent(USERS.securityLead, 'src/cybersec-team/agents/threat-analyst');
    expect(bmadResult.allowed).toBe(srcResult.allowed);
  });

  it('should deny _bmad/ path for unauthorized role (no bypass)', () => {
    expect(manager.canAccessAgent(USERS.viewer, '_bmad/cybersec-team/agents/threat-analyst').allowed).toBe(false);
  });

  it('should deny _bmad/ path for developer accessing intel (no bypass)', () => {
    expect(manager.canAccessAgent(USERS.developer, '_bmad/intel-team/agents/osint-lead').allowed).toBe(false);
  });

  it('should deny _bmad/ path for uncredentialed intel analyst', () => {
    expect(manager.canAccessAgent(USERS.intelAnalystNoCred, '_bmad/intel-team/agents/field-operative').allowed).toBe(false);
  });
});

// ============================================================================
// CHECK 8: yolo_mode does NOT bypass RBAC
// ============================================================================

describe('SA-01 Check 8: yolo_mode does not bypass RBAC', () => {
  it('should have yolo_mode disabled by default in config.yaml', () => {
    const configContent = readFileSync(CONFIG_YAML_PATH, 'utf-8');
    expect(configContent).toContain('yolo_mode:');
    expect(configContent).toContain('enabled: false');
  });

  it('should have authorization.js NOT reference yolo_mode at all', () => {
    const jsSource = readFileSync(AUTHORIZATION_JS_PATH, 'utf-8');
    expect(jsSource).not.toContain('yolo_mode');
    expect(jsSource).not.toContain('yolo');
  });

  it('should have authorization.ts NOT reference yolo_mode at all', () => {
    const tsSource = readFileSync(AUTHORIZATION_TS_PATH, 'utf-8');
    expect(tsSource).not.toContain('yolo_mode');
    expect(tsSource).not.toContain('yolo');
  });

  it('should have rbac-config.yaml NOT reference yolo', () => {
    const rbacContent = parseRbacConfigRaw();
    expect(rbacContent).not.toContain('yolo');
  });

  it('should have AuthorizationManager not import or require config.yaml directly', () => {
    const jsSource = readFileSync(AUTHORIZATION_JS_PATH, 'utf-8');
    // The constructor only reads the passed configPath (rbac-config.yaml)
    // The JS file may mention config.yaml in comments/CLI output, but the
    // AuthorizationManager class itself must not load it
    expect(jsSource).toContain('fs.readFileSync(configPath');
    expect(jsSource).not.toContain("require('./config.yaml')");
    expect(jsSource).not.toContain("require('../config.yaml')");
  });

  it('should still deny restricted agents regardless of external config', () => {
    const manager = new AuthorizationManager(RBAC_CONFIG_PATH);

    expect(manager.canAccessAgent(USERS.viewer, 'src/cybersec-team/agents/threat-analyst').allowed).toBe(false);
    expect(manager.canAccessAgent(USERS.developer, 'src/intel-team/agents/osint-lead').allowed).toBe(false);
    expect(manager.canAccessAgent(USERS.guest, 'src/bmm/agents/pm').allowed).toBe(false);
    expect(manager.canAccessAgent(USERS.guest, 'src/core/agents/abdul').allowed).toBe(true);
  });

  it('should have yolo_mode with safety flags', () => {
    const configContent = readFileSync(CONFIG_YAML_PATH, 'utf-8');
    expect(configContent).toContain('require_explicit_flag: true');
    expect(configContent).toContain('allowed_workflows: []');
  });
});
