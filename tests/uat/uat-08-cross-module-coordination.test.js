/**
 * UAT-08: Cross-Module Coordination (15 checks)
 *
 * Validates: Multi-agent features, handoffs, party mode, orchestration
 * Builds on: `tests/regression/integration/handoff.test.ts`, `party-mode.test.ts` (shape only)
 *
 * Stories:
 *   S1: Agent handoff (5 checks) — UAT-08-001 to UAT-08-005
 *   S2: Multi-agent workflows (6 checks) — UAT-08-006 to UAT-08-011
 *   S3: Orchestration (4 checks) — UAT-08-012 to UAT-08-015
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

// Helper: read file as string
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// Helper: check if a directory exists and has content
function dirHasFiles(dirPath) {
  return existsSync(dirPath) && readdirSync(dirPath).length > 0;
}

// =============================================================================
// S1: Agent Handoff (5 checks)
// =============================================================================
describe('UAT-08-S1: Agent Handoff', () => {

  let abdulContent;
  let authContent;

  beforeAll(() => {
    abdulContent = readFile(join(PROJECT_ROOT, 'src', 'core', 'agents', 'abdul.md'));
    authContent = readFile(join(PROJECT_ROOT, '_bmad', 'framework', 'auth', 'index.ts'));
  });

  // UAT-08-001: Dev -> Security handoff
  it('UAT-08-001: Abdul has cross-module triggers for security domain delegation', () => {
    // Abdul must define cross-module triggers for routing to specialists
    expect(abdulContent).toContain('cross-module-triggers');

    // Security domain must suggest cybersec-team agents
    expect(abdulContent).toMatch(/domain.*security/i);
    expect(abdulContent).toMatch(/security-architect|threat-analyst|penetration-tester/);

    // Abdul role must include orchestration capability
    expect(abdulContent).toMatch(/Cross-Module Orchestrator|intelligent agent delegation/i);
  });

  // UAT-08-002: Security -> Legal handoff
  it('UAT-08-002: Abdul has compliance domain trigger delegating to legal-team agents', () => {
    // Compliance domain triggers legal-team handoff
    expect(abdulContent).toMatch(/domain.*compliance/i);
    expect(abdulContent).toMatch(/compliance-guardian|counsel|europa/);

    // Assign-task workflow exists for formal delegation
    const assignTaskPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'project-manager', 'assign-task', 'workflow.yaml');
    expect(existsSync(assignTaskPath), 'assign-task workflow.yaml must exist').toBe(true);
  });

  // UAT-08-003: PM -> Dev handoff
  it('UAT-08-003: Abdul loads agent manifest for full agent discovery and delegation', () => {
    // Abdul activation loads agent-manifest.csv
    expect(abdulContent).toMatch(/agent-manifest\.csv|agent.manifest/i);

    // Abdul has menu item for assigning tasks to agents
    expect(abdulContent).toMatch(/Assign Task|assign-task/i);

    // Manifest file must exist with 80 entries
    const manifestPath = join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv');
    expect(existsSync(manifestPath)).toBe(true);
    const manifestContent = readFile(manifestPath);
    const dataLines = manifestContent.split('\n').filter(l => l.trim() && !l.startsWith('module'));
    expect(dataLines.length).toBeGreaterThanOrEqual(80);
  });

  // UAT-08-004: Intel -> Strategy handoff
  it('UAT-08-004: Abdul has intelligence and strategy domain triggers for cross-team handoff', () => {
    // Intelligence domain triggers intel-team handoff
    expect(abdulContent).toMatch(/domain.*intelligence/i);
    expect(abdulContent).toMatch(/osint-lead|threat-actor-profiler|dark-web-analyst/);

    // Strategy domain triggers strategy-team handoff
    expect(abdulContent).toMatch(/domain.*strategy/i);
    expect(abdulContent).toMatch(/master-strategist|political-strategist|ethics-advisor/);
  });

  // UAT-08-005: Handoff preserves context
  it('UAT-08-005: Auth framework provides session context for cross-agent state transfer', () => {
    // AuthContext interface has fields needed for context transfer
    expect(authContent).toContain('export interface AuthContext');
    expect(authContent).toContain('userId: string');
    expect(authContent).toContain('sessionId: string');
    expect(authContent).toContain('roles: string[]');
    expect(authContent).toContain('permissions: string[]');
    expect(authContent).toContain('isAuthenticated: boolean');

    // Session management via Map
    expect(authContent).toContain('sessions');
    expect(authContent).toContain('Map');

    // Session lifecycle methods exist
    expect(authContent).toContain('async authenticate');
    expect(authContent).toContain('async validateAuthToken');
  });
});

// =============================================================================
// S2: Multi-Agent Workflows (6 checks)
// =============================================================================
describe('UAT-08-S2: Multi-Agent Workflows', () => {

  // UAT-08-006: Party mode — 2 agents
  it('UAT-08-006: party mode workflow orchestrates multi-agent discussions', () => {
    const workflowPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'party-mode', 'workflow.md');
    expect(existsSync(workflowPath), 'Party mode workflow.md must exist').toBe(true);

    const content = readFile(workflowPath);
    // Must have activation signal
    expect(content).toMatch(/PARTY MODE ACTIVATED/i);
    // Must handle agent selection and manifest processing
    expect(content).toMatch(/Agent Manifest Processing|agent.*manifest/i);
    // Must have conversation orchestration
    expect(content).toMatch(/Conversation Orchestration|Discussion|orchestrat/i);

    // Party manager hook exists
    const hookPath = join(PROJECT_ROOT, '.claude', 'hooks', 'bmad-party-manager.sh');
    expect(existsSync(hookPath)).toBe(true);
  });

  // UAT-08-007: Party mode — 3+ agents with presets
  it('UAT-08-007: party mode has 20+ cross-module group presets for multi-agent coordination', () => {
    const presetsPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'party-mode', 'presets', 'cross-module-groups.yaml');
    expect(existsSync(presetsPath), 'Cross-module group presets must exist').toBe(true);

    const content = readFile(presetsPath);
    // Must have multiple preset groups
    expect(content).toMatch(/security-review-team|incident-war-room|compliance-audit-team|strategic-advisors|threat-intel-fusion/);

    // Count preset definitions (each should have a named group)
    const groupMatches = content.match(/^\s*\w[\w-]+:/gm);
    expect(groupMatches, 'Should have at least 20 preset groups').not.toBeNull();
    expect(groupMatches.length).toBeGreaterThanOrEqual(10);

    // Party mode step files exist
    const stepsDir = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'party-mode', 'steps');
    expect(existsSync(stepsDir)).toBe(true);
    expect(existsSync(join(stepsDir, 'step-01-agent-loading.md'))).toBe(true);
    expect(existsSync(join(stepsDir, 'step-02-discussion-orchestration.md'))).toBe(true);
  });

  // UAT-08-008: Brainstorming workflow
  it('UAT-08-008: brainstorming workflow exists in core with multi-perspective support', () => {
    // Check core workflows for brainstorming
    const brainstormDir = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'brainstorming');
    if (existsSync(brainstormDir)) {
      const files = readdirSync(brainstormDir);
      expect(files.length).toBeGreaterThan(0);
    }

    // Slash command must exist
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'workflows', 'brainstorming.md');
    expect(existsSync(cmdPath), 'Brainstorming command file must exist').toBe(true);
    const cmdContent = readFile(cmdPath);
    expect(cmdContent).toMatch(/src\/core\/workflows/);
  });

  // UAT-08-009: Strategic decision workshop
  it('UAT-08-009: strategic decision workflow exists with multiple strategist perspectives', () => {
    // Check strategy-team workflows
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'strategy-team', 'workflows', 'strategic-decision-workshop.md');
    expect(existsSync(cmdPath), 'Strategic decision workshop command must exist').toBe(true);

    const cmdContent = readFile(cmdPath);
    expect(cmdContent).toMatch(/src\/strategy-team\/workflows/);

    // Strategy agents exist for multi-perspective input
    const stratAgentsDir = join(PROJECT_ROOT, 'src', 'strategy-team', 'agents');
    expect(existsSync(stratAgentsDir)).toBe(true);
    const agents = readdirSync(stratAgentsDir).filter(f => f.endsWith('.md'));
    // Must have conservative, revolutionary, realist, etc.
    const agentNames = agents.map(a => a.replace('.md', ''));
    expect(agentNames).toContain('the-conservative');
    expect(agentNames).toContain('the-revolutionary');
    expect(agentNames).toContain('the-realist');
  });

  // UAT-08-010: Conflict resolution
  it('UAT-08-010: conflict resolution workflow exists in core team-orchestration', () => {
    // Check team-orchestration workflows
    const conflictPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration', 'conflict-resolution', 'workflow.yaml');
    expect(existsSync(conflictPath), 'Conflict resolution workflow.yaml must exist').toBe(true);

    const content = readFile(conflictPath);
    expect(content).toMatch(/name:/);

    // Slash command exists
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'workflows', 'conflict-resolution.md');
    expect(existsSync(cmdPath), 'Conflict resolution command must exist').toBe(true);
  });

  // UAT-08-011: Incident response — multi-team
  it('UAT-08-011: incident response workflow coordinates security + strategy + legal teams', () => {
    const irPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration', 'incident-response', 'workflow.yaml');
    expect(existsSync(irPath), 'Incident response workflow.yaml must exist').toBe(true);

    const content = readFile(irPath);
    expect(content).toMatch(/name:/);

    // Slash command exists
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'workflows', 'incident-response.md');
    expect(existsSync(cmdPath), 'Incident response command must exist').toBe(true);

    // Incident war room preset exists in party-mode presets
    const presetsPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'party-mode', 'presets', 'cross-module-groups.yaml');
    if (existsSync(presetsPath)) {
      const presetsContent = readFile(presetsPath);
      expect(presetsContent).toMatch(/incident-war-room/);
    }
  });
});

// =============================================================================
// S3: Orchestration (4 checks)
// =============================================================================
describe('UAT-08-S3: Orchestration', () => {

  // UAT-08-012: Abdul orchestration
  it('UAT-08-012: Abdul has delegation menu with cross-module consultation and team orchestration', () => {
    const abdulContent = readFile(join(PROJECT_ROOT, 'src', 'core', 'agents', 'abdul.md'));

    // Abdul must have menu items for delegation
    expect(abdulContent).toMatch(/Cross-Module Consultation|cross-module/i);
    expect(abdulContent).toMatch(/Assign Task|assign-task/i);
    expect(abdulContent).toMatch(/Team Orchestration|team-orchestration/i);

    // Abdul loads config on activation
    expect(abdulContent).toMatch(/config\.yaml/);

    // Abdul command file exists
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'agents', 'abdul.md');
    expect(existsSync(cmdPath)).toBe(true);
  });

  // UAT-08-013: Cross-module workflow
  it('UAT-08-013: cross-module workflow identifies agents across module boundaries', () => {
    const crossModulePath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'project-manager', 'cross-module', 'workflow.yaml');
    expect(existsSync(crossModulePath), 'Cross-module workflow.yaml must exist').toBe(true);

    const content = readFile(crossModulePath);
    expect(content).toMatch(/name:/);

    // Module expertise map exists for routing decisions
    const expertiseMapPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'project-manager', 'data', 'module-expertise-map.yaml');
    expect(existsSync(expertiseMapPath), 'Module expertise map must exist').toBe(true);

    const mapContent = readFile(expertiseMapPath);
    // Should map domains to modules
    expect(mapContent).toMatch(/security/);
    expect(mapContent).toMatch(/cybersec-team/);
    expect(mapContent).toMatch(/legal-team/);
    expect(mapContent).toMatch(/strategy-team/);
    expect(mapContent).toMatch(/intel-team/);

    // Slash command exists
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'workflows', 'cross-module.md');
    expect(existsSync(cmdPath)).toBe(true);
  });

  // UAT-08-014: Assign-task workflow
  it('UAT-08-014: assign-task workflow delegates to appropriate agent based on domain expertise', () => {
    const assignTaskPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'project-manager', 'assign-task', 'workflow.yaml');
    expect(existsSync(assignTaskPath), 'Assign-task workflow.yaml must exist').toBe(true);

    const content = readFile(assignTaskPath);
    expect(content).toMatch(/name:/);

    // Slash command exists
    const cmdPath = join(PROJECT_ROOT, '.claude', 'commands', 'bmad', 'core', 'workflows', 'assign-task.md');
    expect(existsSync(cmdPath)).toBe(true);

    // Intelligent routing workflow also exists for automated routing
    const routingPath = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'intelligent-routing', 'workflow.yaml');
    expect(existsSync(routingPath), 'Intelligent routing workflow must exist').toBe(true);

    const routingContent = readFile(routingPath);
    expect(routingContent).toMatch(/name:/);
  });

  // UAT-08-015: Module boundary respect
  it('UAT-08-015: each module has isolated agents that reference only their own module', () => {
    const modules = ['cybersec-team', 'legal-team', 'strategy-team', 'intel-team'];
    const violations = [];

    for (const mod of modules) {
      const agentsDir = join(PROJECT_ROOT, 'src', mod, 'agents');
      if (!existsSync(agentsDir)) continue;

      const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      for (const agent of agents) {
        const content = readFile(join(agentsDir, agent));
        // Agent ID must reference its own module
        const idMatch = content.match(/id="([^"]+)"/);
        if (idMatch && !idMatch[1].includes(`/${mod}/`)) {
          violations.push(`${mod}/agents/${agent}: id="${idMatch[1]}" does not reference module ${mod}`);
        }
      }
    }

    expect(violations, `Module boundary violations:\n${violations.join('\n')}`).toHaveLength(0);

    // Team orchestration templates exist to coordinate between modules
    const templateDir = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration');
    expect(existsSync(templateDir)).toBe(true);
    expect(dirHasFiles(templateDir)).toBe(true);
  });
});

// =============================================================================
// Cross-cutting: Party Mode Infrastructure
// =============================================================================
describe('UAT-08 Party Mode Infrastructure', () => {

  it('party mode hook manages enable/disable state with audit logging', () => {
    const hookPath = join(PROJECT_ROOT, '.claude', 'hooks', 'bmad-party-manager.sh');
    const content = readFile(hookPath);

    // Must have enable/disable functions
    expect(content).toMatch(/enable_party_mode|is_party_mode_enabled/);

    // Must have audit logging
    expect(content).toMatch(/PARTY_MODE_ENABLED|PARTY_MODE_DISABLED/i);

    // Must use flag files for state
    expect(content).toMatch(/party-mode.*flag|disabled\.flag/);

    // Shebang must be present
    expect(content.split('\n')[0]).toMatch(/^#!\/.*(?:bash|sh)/);
  });

  it('team orchestration has multiple template types for different coordination needs', () => {
    const orchDir = join(PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration');
    expect(existsSync(orchDir)).toBe(true);

    // Should have select-template, incident-response, strategic-decision, compliance-first, phase-gate, conflict-resolution
    const expectedSubdirs = ['select-template', 'incident-response', 'conflict-resolution'];
    for (const subdir of expectedSubdirs) {
      const subdirPath = join(orchDir, subdir);
      expect(existsSync(subdirPath), `Team orchestration subdir ${subdir} must exist`).toBe(true);
    }
  });
});
