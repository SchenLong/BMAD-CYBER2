/**
 * UAT-04: Workflow Execution — 52 Workflows (104 checks)
 *
 * Validates: Target workflows load correctly (valid structure, description)
 * and can progress (have steps, instructions, or content sections).
 *
 * Each workflow gets 2 checks:
 *   - Load: Command file exists, source file parseable, description present
 *   - Progression: Source has steps/sections/instructions for execution
 *
 * Stories:
 *   S1: core workflows (5 × 2 = 10 checks) — UAT-04-001 to UAT-04-010
 *   S2: bmm workflows (8 × 2 = 16 checks) — UAT-04-011 to UAT-04-026
 *   S3: bmb workflows (5 × 2 = 10 checks) — UAT-04-027 to UAT-04-036
 *   S4: cybersec-team workflows (7 × 2 = 14 checks) — UAT-04-037 to UAT-04-050
 *   S5: intel-team workflows (7 × 2 = 14 checks) — UAT-04-051 to UAT-04-064
 *   S6: legal-team workflows (5 × 2 = 10 checks) — UAT-04-065 to UAT-04-074
 *   S7: strategy-team workflows (6 × 2 = 12 checks) — UAT-04-075 to UAT-04-086
 *   S8: bmgd workflows (5 × 2 = 10 checks) — UAT-04-087 to UAT-04-096
 *   S9: cis workflows (4 × 2 = 8 checks) — UAT-04-097 to UAT-04-104
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');
const COMMANDS_DIR = join(PROJECT_ROOT, '.claude', 'commands', 'bmad');

// Helper: read file
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// Helper: find workflow source files (yaml or md)
function findWorkflowSource(module, workflowName) {
  const workflowsDir = join(SRC_DIR, module, 'workflows');
  if (!existsSync(workflowsDir)) return null;

  // Search recursively for a directory matching the workflow name
  function searchDir(dir) {
    if (!existsSync(dir)) return null;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === workflowName) {
          const yamlPath = join(dir, entry.name, 'workflow.yaml');
          const mdPath = join(dir, entry.name, 'workflow.md');
          if (existsSync(yamlPath)) return { path: yamlPath, type: 'yaml' };
          if (existsSync(mdPath)) return { path: mdPath, type: 'md' };
        }
        // Recurse into subdirectories
        const found = searchDir(join(dir, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  return searchDir(workflowsDir);
}

// Helper: check if workflow has steps/progression content
function hasProgressionContent(source) {
  if (!source) return false;
  const content = readFile(source.path);

  if (source.type === 'yaml') {
    try {
      const parsed = yaml.load(content);
      if (!parsed || typeof parsed !== 'object') return false;
      // Check for steps, phases, or structured content
      return !!(
        parsed.steps ||
        parsed.phases ||
        parsed.workflow?.steps ||
        parsed.workflow?.phases ||
        parsed.tasks ||
        parsed.checklist ||
        content.includes('step') ||
        content.includes('instruction')
      );
    } catch {
      return false;
    }
  }

  if (source.type === 'md') {
    // MD workflows have step files in steps/ subdirectory or inline content
    const dir = source.path.replace(/\/workflow\.md$/, '');
    const stepsDir = join(dir, 'steps');
    const hasStepsDir = existsSync(stepsDir);
    const hasInlineSteps = content.includes('## Step') || content.includes('### Step') ||
                           content.includes('## Phase') || content.includes('# Step');
    const hasSubstantialContent = content.length > 200;
    return hasStepsDir || hasInlineSteps || hasSubstantialContent;
  }

  return false;
}

/**
 * Validates a workflow's Load and Progression checks.
 * Generates 2 test cases per call (matching UAT-04-NNN numbering).
 */
function validateWorkflow(loadCheckId, progressCheckId, module, workflowName, expectedDescription) {
  // Load check
  it(`${loadCheckId}: ${module}/${workflowName} — loads with description`, () => {
    // Command file should exist
    const cmdPath = join(COMMANDS_DIR, module, 'workflows', `${workflowName}.md`);
    expect(existsSync(cmdPath), `Command file missing: ${module}/workflows/${workflowName}.md`).toBe(true);

    const cmdContent = readFile(cmdPath);

    // Must have frontmatter with description
    expect(cmdContent).toMatch(/^---/);
    expect(cmdContent.toLowerCase()).toMatch(/description/);

    // Must reference source file
    expect(cmdContent).toMatch(/src\//);

    // Source must exist
    const source = findWorkflowSource(module, workflowName);
    if (!source) {
      // Some workflows use command-only pattern (workflow.md is the entire workflow in the command)
      // In this case, command file itself must have substantial content
      expect(cmdContent.length, `${workflowName} command must have substantial content if no source dir`).toBeGreaterThan(100);
      return;
    }

    const sourceContent = readFile(source.path);
    expect(sourceContent.length, `${workflowName} source must be non-empty`).toBeGreaterThan(50);

    // YAML workflows must parse correctly
    if (source.type === 'yaml') {
      const parsed = yaml.load(sourceContent);
      expect(parsed, `${workflowName} YAML must parse to object`).not.toBeNull();
      expect(typeof parsed).toBe('object');

      // Must have name or description
      const hasName = parsed.name || parsed.workflow?.metadata?.name || parsed.workflow?.name;
      const hasDesc = parsed.description || parsed.workflow?.description || parsed.workflow?.metadata?.description;
      expect(hasName || hasDesc, `${workflowName} must have name or description`).toBeTruthy();
    }
  });

  // Progression check
  it(`${progressCheckId}: ${module}/${workflowName} — has progression steps/content`, () => {
    const source = findWorkflowSource(module, workflowName);

    if (!source) {
      // Command-only workflow — verify command file has instructions
      const cmdPath = join(COMMANDS_DIR, module, 'workflows', `${workflowName}.md`);
      const cmdContent = readFile(cmdPath);
      expect(
        cmdContent.length,
        `${workflowName} command-only workflow must have instructions`
      ).toBeGreaterThan(100);
      return;
    }

    const content = readFile(source.path);

    if (source.type === 'yaml') {
      // YAML workflow: check for structured steps/phases/tasks
      const parsed = yaml.load(content);
      const hasSteps = !!(
        parsed.steps ||
        parsed.phases ||
        parsed.workflow?.steps ||
        parsed.workflow?.phases ||
        parsed.tasks
      );
      // Also check for companion instruction files
      const dir = source.path.replace(/\/workflow\.yaml$/, '');
      const hasInstructions = existsSync(join(dir, 'instructions.md'));
      const hasChecklist = existsSync(join(dir, 'checklist.md'));
      const hasWorkflowMd = existsSync(join(dir, 'workflow.md'));

      expect(
        hasSteps || hasInstructions || hasChecklist || hasWorkflowMd,
        `${workflowName} YAML must have steps/phases/tasks or companion instructions`
      ).toBe(true);
    }

    if (source.type === 'md') {
      // MD workflow: check for step files or inline structure
      const dir = source.path.replace(/\/workflow\.md$/, '');
      const stepsDir = join(dir, 'steps');
      const hasStepsDir = existsSync(stepsDir);
      const hasHeadings = !!content.match(/^#{1,3}\s+/m);
      const hasSubstantialContent = content.length > 200;

      expect(
        hasStepsDir || hasHeadings || hasSubstantialContent,
        `${workflowName} MD must have steps directory, headings, or substantial content`
      ).toBe(true);
    }
  });
}

// =============================================================================
// S1: core workflows (5 × 2 = 10 checks)
// =============================================================================
describe('UAT-04-S1: core workflows', () => {
  validateWorkflow('UAT-04-001', 'UAT-04-002', 'core', 'select-template', 'template list');
  validateWorkflow('UAT-04-003', 'UAT-04-004', 'core', 'project-status', 'project scan');
  validateWorkflow('UAT-04-005', 'UAT-04-006', 'core', 'party-mode', 'multi-agent discussion');
  validateWorkflow('UAT-04-007', 'UAT-04-008', 'core', 'brainstorming', 'brainstorm session');
  validateWorkflow('UAT-04-009', 'UAT-04-010', 'core', 'assign-task', 'task delegation');
});

// =============================================================================
// S2: bmm workflows (8 × 2 = 16 checks)
// =============================================================================
describe('UAT-04-S2: bmm workflows', () => {
  validateWorkflow('UAT-04-011', 'UAT-04-012', 'bmm', 'quick-dev', 'task prompt');
  validateWorkflow('UAT-04-013', 'UAT-04-014', 'bmm', 'code-review', 'review target');
  validateWorkflow('UAT-04-015', 'UAT-04-016', 'bmm', 'create-prd', 'PRD wizard');
  validateWorkflow('UAT-04-017', 'UAT-04-018', 'bmm', 'create-architecture', 'architecture');
  validateWorkflow('UAT-04-019', 'UAT-04-020', 'bmm', 'create-story', 'story creation');
  validateWorkflow('UAT-04-021', 'UAT-04-022', 'bmm', 'sprint-planning', 'sprint planning');
  validateWorkflow('UAT-04-023', 'UAT-04-024', 'bmm', 'testarch-test-design', 'test design');
  validateWorkflow('UAT-04-025', 'UAT-04-026', 'bmm', 'research', 'research topic');
});

// =============================================================================
// S3: bmb workflows (5 × 2 = 10 checks)
// =============================================================================
describe('UAT-04-S3: bmb workflows', () => {
  validateWorkflow('UAT-04-027', 'UAT-04-028', 'bmb', 'create-workflow', 'workflow creation');
  validateWorkflow('UAT-04-029', 'UAT-04-030', 'bmb', 'agent', 'agent creation');
  validateWorkflow('UAT-04-031', 'UAT-04-032', 'bmb', 'create-module', 'module creation');
  validateWorkflow('UAT-04-033', 'UAT-04-034', 'bmb', 'edit-workflow', 'workflow edit');
  validateWorkflow('UAT-04-035', 'UAT-04-036', 'bmb', 'workflow-compliance-check', 'compliance check');
});

// =============================================================================
// S4: cybersec-team workflows (7 × 2 = 14 checks)
// =============================================================================
describe('UAT-04-S4: cybersec-team workflows', () => {
  validateWorkflow('UAT-04-037', 'UAT-04-038', 'cybersec-team', 'threat-modeling', 'STRIDE methodology');
  validateWorkflow('UAT-04-039', 'UAT-04-040', 'cybersec-team', 'web-app-security-testing', 'target scope');
  validateWorkflow('UAT-04-041', 'UAT-04-042', 'cybersec-team', 'security-architecture-review', 'review scope');
  validateWorkflow('UAT-04-043', 'UAT-04-044', 'cybersec-team', 'incident-response-playbook', 'incident type');
  validateWorkflow('UAT-04-045', 'UAT-04-046', 'cybersec-team', 'compliance-audit-prep', 'framework');
  validateWorkflow('UAT-04-047', 'UAT-04-048', 'cybersec-team', 'vulnerability-management', 'vulnerability');
  validateWorkflow('UAT-04-049', 'UAT-04-050', 'cybersec-team', 'cloud-security-assessment', 'cloud');
});

// =============================================================================
// S5: intel-team workflows (7 × 2 = 14 checks)
// =============================================================================
describe('UAT-04-S5: intel-team workflows', () => {
  validateWorkflow('UAT-04-051', 'UAT-04-052', 'intel-team', 'flash-assessment', 'target prompt');
  validateWorkflow('UAT-04-053', 'UAT-04-054', 'intel-team', 'campaign-planner-org', 'organization target');
  validateWorkflow('UAT-04-055', 'UAT-04-056', 'intel-team', 'campaign-planner-person', 'person target');
  validateWorkflow('UAT-04-057', 'UAT-04-058', 'intel-team', 'spider-web', 'network mapping');
  validateWorkflow('UAT-04-059', 'UAT-04-060', 'intel-team', 'threat-constellation', 'threat landscape');
  validateWorkflow('UAT-04-061', 'UAT-04-062', 'intel-team', 'the-synthesis', 'multi-source');
  validateWorkflow('UAT-04-063', 'UAT-04-064', 'intel-team', 'pattern-of-life', 'behavioral');
});

// =============================================================================
// S6: legal-team workflows (5 × 2 = 10 checks)
// =============================================================================
describe('UAT-04-S6: legal-team workflows', () => {
  validateWorkflow('UAT-04-065', 'UAT-04-066', 'legal-team', 'contract-review', 'document input');
  validateWorkflow('UAT-04-067', 'UAT-04-068', 'legal-team', 'legal-matter-intake', 'intake form');
  validateWorkflow('UAT-04-069', 'UAT-04-070', 'legal-team', 'contract-drafting', 'drafting');
  validateWorkflow('UAT-04-071', 'UAT-04-072', 'legal-team', 'corporate-formation', 'jurisdiction');
  validateWorkflow('UAT-04-073', 'UAT-04-074', 'legal-team', 'cross-border-matter', 'multi-jurisdiction');
});

// =============================================================================
// S7: strategy-team workflows (6 × 2 = 12 checks)
// =============================================================================
describe('UAT-04-S7: strategy-team workflows', () => {
  validateWorkflow('UAT-04-075', 'UAT-04-076', 'strategy-team', 'strategic-decision-workshop', 'decision input');
  validateWorkflow('UAT-04-077', 'UAT-04-078', 'strategy-team', 'crisis-response-planning', 'scenario');
  validateWorkflow('UAT-04-079', 'UAT-04-080', 'strategy-team', 'competitive-warfare', 'competitor');
  validateWorkflow('UAT-04-081', 'UAT-04-082', 'strategy-team', 'ma-due-diligence', 'target company');
  validateWorkflow('UAT-04-083', 'UAT-04-084', 'strategy-team', 'stakeholder-negotiation-prep', 'negotiation');
  validateWorkflow('UAT-04-085', 'UAT-04-086', 'strategy-team', 'board-presentation-prep', 'presentation');
});

// =============================================================================
// S8: bmgd workflows (5 × 2 = 10 checks)
// =============================================================================
describe('UAT-04-S8: bmgd workflows', () => {
  validateWorkflow('UAT-04-087', 'UAT-04-088', 'bmgd', 'brainstorm-game', 'game concept');
  validateWorkflow('UAT-04-089', 'UAT-04-090', 'bmgd', 'create-game-brief', 'game parameters');
  validateWorkflow('UAT-04-091', 'UAT-04-092', 'bmgd', 'create-gdd', 'GDD wizard');
  validateWorkflow('UAT-04-093', 'UAT-04-094', 'bmgd', 'quick-dev', 'game dev task');
  validateWorkflow('UAT-04-095', 'UAT-04-096', 'bmgd', 'gametest-test-design', 'test design');
});

// =============================================================================
// S9: cis workflows (4 × 2 = 8 checks)
// =============================================================================
describe('UAT-04-S9: cis workflows', () => {
  validateWorkflow('UAT-04-097', 'UAT-04-098', 'cis', 'design-thinking', 'problem input');
  validateWorkflow('UAT-04-099', 'UAT-04-100', 'cis', 'problem-solving', 'problem input');
  validateWorkflow('UAT-04-101', 'UAT-04-102', 'cis', 'storytelling', 'narrative');
  validateWorkflow('UAT-04-103', 'UAT-04-104', 'cis', 'innovation-strategy', 'innovation context');
});

// =============================================================================
// Cross-cutting: Aggregate Validation
// =============================================================================
describe('UAT-04 Aggregate Validation', () => {

  it('all 9 modules have at least 1 workflow command file', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const mod of modules) {
      const wfDir = join(COMMANDS_DIR, mod, 'workflows');
      expect(existsSync(wfDir), `${mod} must have workflows command dir`).toBe(true);
      const files = readdirSync(wfDir).filter(f => f.endsWith('.md'));
      expect(files.length, `${mod} must have >= 1 workflow command`).toBeGreaterThanOrEqual(1);
    }
  });

  it('total workflow command files >= 120 across all modules', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let total = 0;
    for (const mod of modules) {
      const wfDir = join(COMMANDS_DIR, mod, 'workflows');
      if (existsSync(wfDir)) {
        total += readdirSync(wfDir).filter(f => f.endsWith('.md')).length;
      }
    }
    expect(total).toBeGreaterThanOrEqual(120);
  });

  it('workflow.yaml files across all modules total >= 120', () => {
    const modules = ['core', 'bmm', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let total = 0;
    function countYamls(dir) {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) countYamls(join(dir, entry.name));
        else if (entry.name === 'workflow.yaml') total++;
      }
    }
    for (const mod of modules) {
      countYamls(join(SRC_DIR, mod, 'workflows'));
    }
    expect(total).toBeGreaterThanOrEqual(120);
  });

  it('all workflow.yaml files parse as valid YAML objects', () => {
    const modules = ['core', 'bmm', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const errors = [];

    function checkYamls(dir, modName) {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          checkYamls(join(dir, entry.name), modName);
        } else if (entry.name === 'workflow.yaml') {
          try {
            const content = readFile(join(dir, entry.name));
            const parsed = yaml.load(content);
            if (!parsed || typeof parsed !== 'object') {
              errors.push(`${modName}/${dir}: not an object`);
            }
          } catch (err) {
            errors.push(`${modName}/${dir}: ${err.message}`);
          }
        }
      }
    }

    for (const mod of modules) {
      checkYamls(join(SRC_DIR, mod, 'workflows'), mod);
    }
    expect(errors, `YAML parse errors:\n${errors.join('\n')}`).toHaveLength(0);
  });
});
