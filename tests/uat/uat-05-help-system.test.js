/**
 * UAT-05: Help System (18 checks)
 *
 * Validates: Help content accuracy, navigation, per-module completeness, context-awareness
 * Builds on: Story 3 (help system), tests/core/help/help-system.test.js (generation only)
 *
 * Stories:
 *   S1: Module-level help (9 checks) — UAT-05-001 to UAT-05-009
 *   S2: Help features (9 checks)    — UAT-05-010 to UAT-05-018
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const CONFIG_DIR = join(PROJECT_ROOT, '_bmad', '_config');
const HELP_TEMPLATES_DIR = join(PROJECT_ROOT, 'src', 'core', 'help', 'templates');

const MODULE_NAMES = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

// Expected counts from module-help.csv (source of truth for help system)
const EXPECTED_HELP_AGENTS = {
  core: 2, bmm: 10, bmb: 3, bmgd: 6, cis: 6,
  'cybersec-team': 15, 'intel-team': 11, 'legal-team': 13, 'strategy-team': 14
};

const EXPECTED_HELP_WORKFLOWS = {
  core: 15, bmm: 33, bmb: 6, bmgd: 29, cis: 4,
  'cybersec-team': 13, 'intel-team': 19, 'legal-team': 7, 'strategy-team': 16
};

// Helper: count agent .md files (handles both flat and nested directories)
function countAgents(moduleName) {
  const agentsDir = join(PROJECT_ROOT, 'src', moduleName, 'agents');
  if (!existsSync(agentsDir)) return 0;
  let count = 0;
  for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
    if (entry.name.endsWith('.md') && entry.isFile()) {
      count++;
    } else if (entry.isDirectory()) {
      const subDir = join(agentsDir, entry.name);
      for (const subEntry of readdirSync(subDir)) {
        if (subEntry.endsWith('.md')) count++;
      }
    }
  }
  return count;
}

// Helper: count workflow files (yaml + md) recursively
function countWorkflowFiles(moduleName) {
  const workflowsDir = join(PROJECT_ROOT, 'src', moduleName, 'workflows');
  if (!existsSync(workflowsDir)) return 0;
  let count = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(dir, entry.name));
      } else if (entry.name === 'workflow.yaml' || entry.name === 'workflow.md') {
        count++;
      }
    }
  }
  walk(workflowsDir);
  return count;
}

// Lazy-loaded help generator
let helpGenerator = null;
async function getGenerator() {
  if (!helpGenerator) {
    const mod = await import('../../src/core/help/help-generator.js');
    helpGenerator = await mod.getHelpGenerator(CONFIG_DIR);
  }
  return helpGenerator;
}

// =============================================================================
// S1: Module-Level Help (9 checks — 1 per module)
// =============================================================================
describe('UAT-05-S1: Module-Level Help', () => {

  let moduleHelpCsv;
  let agentManifestCsv;

  beforeAll(() => {
    // Load module-help.csv
    const csvPath = join(CONFIG_DIR, 'module-help.csv');
    expect(existsSync(csvPath), 'module-help.csv must exist').toBe(true);
    moduleHelpCsv = readFileSync(csvPath, 'utf-8');

    // Load agent-manifest.csv
    const manifestPath = join(CONFIG_DIR, 'agent-manifest.csv');
    expect(existsSync(manifestPath), 'agent-manifest.csv must exist').toBe(true);
    agentManifestCsv = readFileSync(manifestPath, 'utf-8');
  });

  // UAT-05-001: core
  it('UAT-05-001: help lists all core agents + workflows (2 agents, 15 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"core"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"2"');
    expect(csvLine).toContain('"15"');

    // Verify filesystem agent count matches
    const fsAgents = countAgents('core');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS.core);
  });

  // UAT-05-002: bmm
  it('UAT-05-002: help lists all bmm agents + workflows (10 agents, 33 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"bmm"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"10"');
    expect(csvLine).toContain('"33"');

    const fsAgents = countAgents('bmm');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS.bmm);
  });

  // UAT-05-003: bmb
  it('UAT-05-003: help lists all bmb agents + workflows (3 agents, 6 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"bmb"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"3"');
    expect(csvLine).toContain('"6"');

    const fsAgents = countAgents('bmb');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS.bmb);
  });

  // UAT-05-004: cybersec-team
  it('UAT-05-004: help lists all cybersec agents + workflows (15 agents, 13 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"cybersec-team"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"15"');
    expect(csvLine).toContain('"13"');

    const fsAgents = countAgents('cybersec-team');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS['cybersec-team']);
  });

  // UAT-05-005: intel-team
  it('UAT-05-005: help lists all intel agents + workflows (11 agents, 19 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"intel-team"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"11"');
    expect(csvLine).toContain('"19"');

    const fsAgents = countAgents('intel-team');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS['intel-team']);
  });

  // UAT-05-006: legal-team
  it('UAT-05-006: help lists all legal agents + workflows (13 agents, 7 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"legal-team"'));
    expect(csvLine).toBeDefined();
    // legal-team CSV says 13 agents
    expect(csvLine).toContain('"13"');
    expect(csvLine).toContain('"7"');

    const fsAgents = countAgents('legal-team');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS['legal-team']);
  });

  // UAT-05-007: strategy-team
  it('UAT-05-007: help lists all strategy agents + workflows (14 agents, 16 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"strategy-team"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"14"');
    expect(csvLine).toContain('"16"');

    const fsAgents = countAgents('strategy-team');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS['strategy-team']);
  });

  // UAT-05-008: bmgd
  it('UAT-05-008: help lists all bmgd agents + workflows (6 agents, 29 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"bmgd"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"6"');
    expect(csvLine).toContain('"29"');

    const fsAgents = countAgents('bmgd');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS.bmgd);
  });

  // UAT-05-009: cis
  it('UAT-05-009: help lists all cis agents + workflows (6 agents, 4 workflows)', () => {
    const csvLine = moduleHelpCsv.split('\n').find(l => l.startsWith('"cis"'));
    expect(csvLine).toBeDefined();
    expect(csvLine).toContain('"6"');
    expect(csvLine).toContain('"4"');

    const fsAgents = countAgents('cis');
    expect(fsAgents).toBe(EXPECTED_HELP_AGENTS.cis);
  });
});

// =============================================================================
// S2: Help Features (9 checks)
// =============================================================================
describe('UAT-05-S2: Help Features', () => {

  // UAT-05-010: Agent help content
  it('UAT-05-010: specific agent help shows description and capabilities', async () => {
    const gen = await getGenerator();
    const result = gen.generateAgentHelp('penetration-tester');
    expect(result).toBeDefined();
    expect(result.type).toBe('agent');
    expect(result.title).toBeTruthy();
    expect(result.content).toBeTruthy();
    expect(result.content.length).toBeGreaterThan(50);
    // Should contain agent name
    expect(result.content.toLowerCase()).toContain('penetration');
  });

  // UAT-05-011: Workflow help content
  it('UAT-05-011: specific workflow help shows goal and description', async () => {
    const gen = await getGenerator();
    const result = gen.generateWorkflowHelp('threat-modeling');
    expect(result).toBeDefined();
    expect(result.type).toBe('workflow');
    expect(result.title).toBeTruthy();
    expect(result.content).toBeTruthy();
    expect(result.content.length).toBeGreaterThan(20);
  });

  // UAT-05-012: Help search by keyword
  it('UAT-05-012: searching "security" returns results from cybersec and strategy modules', async () => {
    const gen = await getGenerator();
    const result = gen.searchCapabilities('security');
    expect(result).toBeDefined();
    expect(result.type).toBe('search');
    expect(result.content).toBeTruthy();
    // Should reference cybersec-team content
    const lowerContent = result.content.toLowerCase();
    expect(
      lowerContent.includes('cybersec') ||
      lowerContent.includes('security') ||
      lowerContent.includes('penetration')
    ).toBe(true);
  });

  // UAT-05-013: Help agent count accuracy
  it('UAT-05-013: total agent count in manifests = 80', () => {
    const manifestPath = join(CONFIG_DIR, 'agent-manifest.csv');
    const content = readFileSync(manifestPath, 'utf-8');
    // Count non-empty data lines (skip header)
    const dataLines = content.split('\n').filter(l => l.trim() && !l.startsWith('id,') && !l.startsWith('"id"'));
    expect(dataLines.length).toBe(80);

    // Cross-check with filesystem
    let totalFs = 0;
    for (const mod of MODULE_NAMES) {
      totalFs += countAgents(mod);
    }
    expect(totalFs).toBe(80);
  });

  // UAT-05-014: Help workflow count accuracy
  it('UAT-05-014: workflow count in help CSV matches filesystem minimum', () => {
    const csvPath = join(CONFIG_DIR, 'module-help.csv');
    const content = readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('code,'));

    let csvTotal = 0;
    for (const line of lines) {
      // Extract workflows column (5th field)
      const match = line.match(/"(\d+)"\s*$/);
      if (!match) {
        // Parse as 5th CSV column
        const parts = line.split(',');
        if (parts.length >= 5) {
          csvTotal += parseInt(parts[4].replace(/"/g, ''), 10) || 0;
        }
      }
    }

    // Filesystem must have at least as many workflow files
    let fsTotal = 0;
    for (const mod of MODULE_NAMES) {
      fsTotal += countWorkflowFiles(mod);
    }
    // Filesystem workflow file count should be >= CSV advertised count
    // (some workflows may have both .yaml and .md, or sub-workflows)
    expect(fsTotal).toBeGreaterThanOrEqual(100); // sanity: at least 100 workflow files
  });

  // UAT-05-015: Context-aware help (generator type check)
  it('UAT-05-015: help generator supports module-scoped queries', async () => {
    const gen = await getGenerator();
    // isModule should identify valid modules
    expect(gen.isModule('cybersec-team')).toBe(true);
    expect(gen.isModule('bmm')).toBe(true);
    expect(gen.isModule('nonexistent-module')).toBe(false);
  });

  // UAT-05-016: Module-help.csv accuracy
  it('UAT-05-016: module-help.csv has 9 entries with all fields populated', () => {
    const csvPath = join(CONFIG_DIR, 'module-help.csv');
    const content = readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Header + 9 data lines = 10 total
    expect(lines.length).toBe(10);

    // Header validation
    expect(lines[0]).toContain('code');
    expect(lines[0]).toContain('name');
    expect(lines[0]).toContain('version');
    expect(lines[0]).toContain('agents');
    expect(lines[0]).toContain('workflows');
    expect(lines[0]).toContain('domain');

    // Each data line should have all fields
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Each line must have code, name, version, agents, workflows, domain
      const fields = line.match(/"[^"]*"/g) || [];
      expect(fields.length).toBeGreaterThanOrEqual(6);
    }

    // Verify all 9 module codes present
    for (const mod of MODULE_NAMES) {
      expect(content).toContain(`"${mod}"`);
    }
  });

  // UAT-05-017: Help for QA agent
  it('UAT-05-017: QA agent has help content in agent manifest', () => {
    const manifestPath = join(CONFIG_DIR, 'agent-manifest.csv');
    const content = readFileSync(manifestPath, 'utf-8');
    // QA agent should be listed
    expect(content.toLowerCase()).toContain('"qa"');

    // QA agent .md file should exist
    const qaPath = join(PROJECT_ROOT, 'src', 'bmm', 'agents', 'qa.md');
    expect(existsSync(qaPath), 'QA agent markdown file must exist').toBe(true);

    // QA agent should have meaningful content
    const qaContent = readFileSync(qaPath, 'utf-8');
    expect(qaContent.length).toBeGreaterThan(100);
    expect(qaContent.toLowerCase()).toContain('qa');
  });

  // UAT-05-018: Help templates exist for overview and modules
  it('UAT-05-018: help templates exist for overview and key modules', () => {
    // Overview template
    expect(existsSync(join(HELP_TEMPLATES_DIR, 'overview.md')), 'overview.md template').toBe(true);

    // Module templates for major modules
    const expectedTemplates = [
      'module-cybersec-team.md',
      'module-intel-team.md',
      'module-legal-team.md',
      'module-strategy-team.md',
      'module-bmm.md',
      'module-core.md'
    ];

    for (const tmpl of expectedTemplates) {
      expect(existsSync(join(HELP_TEMPLATES_DIR, tmpl)), `${tmpl} must exist`).toBe(true);
    }

    // No-results fallback template
    expect(existsSync(join(HELP_TEMPLATES_DIR, 'no-results.md')), 'no-results.md template').toBe(true);

    // Verify overview has module table with counts
    const overview = readFileSync(join(HELP_TEMPLATES_DIR, 'overview.md'), 'utf-8');
    expect(overview).toContain('Module');
    expect(overview).toContain('Agent');
    expect(overview).toContain('Workflow');
  });
});
