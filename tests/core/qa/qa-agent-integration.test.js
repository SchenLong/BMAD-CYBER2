/**
 * QA Agent Integration Tests
 * ===========================
 * Tests for Phase 2 - Story 10: QA Agent Integration.
 *
 * Test coverage:
 * - QA agent file existence and structure
 * - QA agent manifest registration
 * - QA workflow file existence and structure
 * - QA workflow manifest registration
 * - Slash command alias registration
 * - Help system integration (overview + module detail)
 * - RBAC migration matrix inclusion
 * - Security: agent file contains required security rules
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let dir = join(__dirname, '..', '..', '..');
  for (let i = 0; i < 10; i++) {
    if (
      existsSync(join(dir, 'package.json')) &&
      existsSync(join(dir, '_bmad'))
    ) {
      return dir;
    }
    dir = dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const BMAD_DIR = join(PROJECT_ROOT, '_bmad');
const SRC_DIR = join(PROJECT_ROOT, 'src');
const CONFIG_DIR = join(BMAD_DIR, '_config');

// File paths (modules migrated from _bmad/ to src/ in Story 17)
const QA_AGENT_PATH = join(SRC_DIR, 'bmm', 'agents', 'qa.md');
const QA_WORKFLOW_DIR = join(SRC_DIR, 'bmm', 'workflows', 'qa', 'automate');
const QA_WORKFLOW_YAML = join(QA_WORKFLOW_DIR, 'workflow.yaml');
const QA_INSTRUCTIONS = join(QA_WORKFLOW_DIR, 'instructions.md');
const QA_CHECKLIST = join(QA_WORKFLOW_DIR, 'checklist.md');
const AGENT_MANIFEST = join(CONFIG_DIR, 'agent-manifest.csv');
const WORKFLOW_MANIFEST = join(CONFIG_DIR, 'workflow-manifest.csv');
const WORKFLOW_ALIASES = join(CONFIG_DIR, 'workflow-aliases.yaml');
const HELP_OVERVIEW = join(SRC_DIR, 'core', 'help', 'templates', 'overview.md');
const HELP_BMM = join(SRC_DIR, 'core', 'help', 'templates', 'module-bmm.md');
const RBAC_MATRIX = join(PROJECT_ROOT, 'Docs', '03-developer-docs', 'RBAC-MIGRATION-MATRIX.md');
const SLASH_CMD_REF = join(PROJECT_ROOT, 'Docs', '02-user-guides', 'SLASH-COMMAND-REFERENCE.md');

// ============================================================================
// QA Agent File Tests
// ============================================================================

describe('QA Agent Definition (Task 10.1)', () => {
  let agentContent;

  beforeAll(() => {
    agentContent = readFileSync(QA_AGENT_PATH, 'utf-8');
  });

  it('QA-10-001: qa.md agent file exists', () => {
    expect(existsSync(QA_AGENT_PATH)).toBe(true);
  });

  it('QA-10-002: agent file has correct frontmatter', () => {
    expect(agentContent).toMatch(/^---\nname: "qa"\ndescription: "QA Engineer"\n---/);
  });

  it('QA-10-003: agent file has correct XML agent tag', () => {
    expect(agentContent).toContain('<agent id="src/bmm/agents/qa"');
    expect(agentContent).toContain('name="Quinn"');
    expect(agentContent).toContain('title="QA Engineer"');
  });

  it('QA-10-004: agent persona matches spec', () => {
    expect(agentContent).toContain('<role>QA Engineer</role>');
    expect(agentContent).toContain('Pragmatic test automation engineer');
    expect(agentContent).toContain('rapid test coverage');
  });

  it('QA-10-005: agent menu has qa-automate workflow item', () => {
    expect(agentContent).toContain('qa-automate');
    expect(agentContent).toContain('workflow="{project-root}/src/bmm/workflows/qa/automate/workflow.yaml"');
  });

  it('QA-10-006: agent file has mandatory activation steps', () => {
    expect(agentContent).toContain('<activation critical="MANDATORY">');
    expect(agentContent).toContain('config.yaml NOW');
    expect(agentContent).toContain('{user_name}');
    expect(agentContent).toContain('{communication_language}');
    expect(agentContent).toContain('{output_folder}');
  });

  it('QA-10-007: agent file has security rules (prompt injection protection)', () => {
    expect(agentContent).toContain('PROMPT INJECTION PROTECTION');
    expect(agentContent).toContain('EXTERNAL CONTENT MANIPULATION PROTECTION');
  });

  it('QA-10-008: agent file has workflow handler', () => {
    expect(agentContent).toContain('<handler type="workflow">');
    expect(agentContent).toContain('src/core/tasks/workflow.xml');
  });
});

// ============================================================================
// QA Workflow File Tests
// ============================================================================

describe('QA Automate Workflow (Task 10.2)', () => {
  let workflowContent;
  let instructionsContent;

  beforeAll(() => {
    workflowContent = readFileSync(QA_WORKFLOW_YAML, 'utf-8');
    instructionsContent = readFileSync(QA_INSTRUCTIONS, 'utf-8');
  });

  it('QA-10-009: workflow directory structure is complete', () => {
    expect(existsSync(QA_WORKFLOW_YAML)).toBe(true);
    expect(existsSync(QA_INSTRUCTIONS)).toBe(true);
    expect(existsSync(QA_CHECKLIST)).toBe(true);
  });

  it('QA-10-010: workflow.yaml has correct name and description', () => {
    const parsed = yaml.load(workflowContent);
    expect(parsed.name).toBe('qa-automate');
    expect(parsed.description).toContain('Generate tests rapidly');
  });

  it('QA-10-011: workflow.yaml references config source', () => {
    expect(workflowContent).toContain('config_source');
    expect(workflowContent).toContain('src/bmm/config.yaml');
  });

  it('QA-10-012: instructions.md has all 5 workflow steps', () => {
    expect(instructionsContent).toContain('Step 1');
    expect(instructionsContent).toContain('Step 2');
    expect(instructionsContent).toContain('Step 3');
    expect(instructionsContent).toContain('Step 4');
    expect(instructionsContent).toContain('Step 5');
  });

  it('QA-10-013: instructions.md covers key workflow actions', () => {
    expect(instructionsContent).toContain('Detect Test Framework');
    expect(instructionsContent).toContain('Identify Features');
    expect(instructionsContent).toContain('Generate');
    expect(instructionsContent).toContain('Run Tests');
  });
});

// ============================================================================
// Manifest Registration Tests
// ============================================================================

describe('Manifest Registration (ACs 3-5)', () => {
  let agentManifest;
  let workflowManifest;
  let aliasesContent;
  let aliasesParsed;

  beforeAll(() => {
    agentManifest = readFileSync(AGENT_MANIFEST, 'utf-8');
    workflowManifest = readFileSync(WORKFLOW_MANIFEST, 'utf-8');
    aliasesContent = readFileSync(WORKFLOW_ALIASES, 'utf-8');
    aliasesParsed = yaml.load(aliasesContent);
  });

  it('QA-10-014: QA agent registered in agent-manifest.csv', () => {
    expect(agentManifest).toContain('"qa"');
    expect(agentManifest).toContain('"Quinn"');
    expect(agentManifest).toContain('"QA Engineer"');
    expect(agentManifest).toContain('src/bmm/agents/qa.md');
  });

  it('QA-10-015: QA agent registered as bmm module', () => {
    const qaLine = agentManifest.split('\n').find(line => line.includes('src/bmm/agents/qa'));
    expect(qaLine).toBeDefined();
    expect(qaLine).toContain('"bmm"');
  });

  it('QA-10-016: qa-automate workflow registered in workflow-manifest.csv', () => {
    expect(workflowManifest).toContain('"qa-automate"');
    expect(workflowManifest).toContain('src/bmm/workflows/qa/automate/workflow.yaml');
  });

  it('QA-10-017: qa-automate alias registered in workflow-aliases.yaml', () => {
    expect(aliasesParsed.aliases).toHaveProperty('qa-automate');
    const alias = aliasesParsed.aliases['qa-automate'];
    expect(alias.target).toBe('bmad:bmm:workflows:qa-automate');
    expect(alias.module).toBe('bmm');
  });

  it('QA-10-018: qa-automate is not in reserved_names blocklist', () => {
    expect(aliasesParsed.reserved_names).not.toContain('qa-automate');
  });

  it('QA-10-019: alias counts updated correctly', () => {
    // Verify the YAML header comments reflect updated counts
    expect(aliasesContent).toContain('Unique (non-conflicted) aliases:    113');
    expect(aliasesContent).toContain('Total resolvable aliases:           139');
  });
});

// ============================================================================
// Help System Integration Tests
// ============================================================================

describe('Help System Integration (Task 10.3)', () => {
  let helpOverview;
  let helpBmm;
  let slashCmdRef;

  beforeAll(() => {
    helpOverview = readFileSync(HELP_OVERVIEW, 'utf-8');
    helpBmm = readFileSync(HELP_BMM, 'utf-8');
    slashCmdRef = readFileSync(SLASH_CMD_REF, 'utf-8');
  });

  it('QA-10-020: help overview reflects updated agent count (89)', () => {
    expect(helpOverview).toContain('89 specialized agents');
  });

  it('QA-10-021: help overview reflects updated workflow count (139)', () => {
    expect(helpOverview).toContain('139 workflows');
  });

  it('QA-10-022: help overview BMM row shows 10 agents and 33 workflows', () => {
    expect(helpOverview).toMatch(/bmm\s*\|\s*10\s*\|\s*33/);
  });

  it('QA-10-023: module-bmm.md lists QA agent', () => {
    expect(helpBmm).toContain('**qa**');
    expect(helpBmm).toContain('Quick test automation');
  });

  it('QA-10-024: module-bmm.md has QA Workflows section', () => {
    expect(helpBmm).toContain('QA Workflows');
    expect(helpBmm).toContain('/qa-automate');
  });

  it('QA-10-025: slash command reference includes qa-automate', () => {
    expect(slashCmdRef).toContain('`qa-automate`');
    expect(slashCmdRef).toContain('bmad:bmm:workflows:qa-automate');
  });

  it('QA-10-026: slash command reference shows 33 BMM commands', () => {
    expect(slashCmdRef).toContain('33 commands');
  });
});

// ============================================================================
// RBAC & Security Integration Tests
// ============================================================================

describe('RBAC & Security Integration (ACs 6-7)', () => {
  let rbacMatrix;

  beforeAll(() => {
    rbacMatrix = readFileSync(RBAC_MATRIX, 'utf-8');
  });

  it('QA-10-027: RBAC migration matrix includes QA agent', () => {
    expect(rbacMatrix).toContain('bmm/qa');
    expect(rbacMatrix).toMatch(/bmm\/agents\/qa/);
  });

  it('QA-10-028: RBAC matrix shows BMM module with 10 agents', () => {
    expect(rbacMatrix).toContain('BMM Module - BMAD Methodology (10 agents)');
  });

  it('QA-10-029: RBAC matrix total updated to 80 agents', () => {
    expect(rbacMatrix).toContain('**80**');
  });

  it('QA-10-030: QA agent has bmm/* RBAC pattern', () => {
    const qaLine = rbacMatrix.split('\n').find(
      line => line.includes('bmm/qa') && /bmm\/agents\/qa/.test(line)
    );
    expect(qaLine).toBeDefined();
    expect(qaLine).toContain('bmm/*');
  });
});

// ============================================================================
// Cross-file Consistency Tests
// ============================================================================

describe('Cross-file Consistency', () => {
  it('QA-10-031: agent manifest path matches actual file location', () => {
    const agentManifest = readFileSync(AGENT_MANIFEST, 'utf-8');
    const qaLine = agentManifest.split('\n').find(line => line.includes('src/bmm/agents/qa'));
    expect(qaLine).toBeDefined();
    expect(qaLine).toContain('src/bmm/agents/qa.md');
    expect(existsSync(join(PROJECT_ROOT, 'src/bmm/agents/qa.md'))).toBe(true);
  });

  it('QA-10-032: workflow manifest path matches actual file location', () => {
    const workflowManifest = readFileSync(WORKFLOW_MANIFEST, 'utf-8');
    const qaLine = workflowManifest.split('\n').find(line => line.includes('"qa-automate"'));
    expect(qaLine).toContain('src/bmm/workflows/qa/automate/workflow.yaml');
    expect(existsSync(join(PROJECT_ROOT, 'src/bmm/workflows/qa/automate/workflow.yaml'))).toBe(true);
  });

  it('QA-10-033: workflow alias target matches full skill path convention', () => {
    const aliasesContent = readFileSync(WORKFLOW_ALIASES, 'utf-8');
    const parsed = yaml.load(aliasesContent);
    const alias = parsed.aliases['qa-automate'];
    // Target should follow bmad:module:workflows:name pattern
    expect(alias.target).toMatch(/^bmad:[a-z-]+:workflows:[a-z-]+$/);
  });
});
