/**
 * Workflow Execution Smoke Tests (P9-38)
 *
 * Smoke test verifying workflows can be loaded and have valid structure.
 * Tests 1 workflow per module (first alphabetically) plus aggregate counts.
 *
 * @module tests/smoke/workflow-execution
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let dir = join(__dirname, '..', '..');
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'package.json')) && (existsSync(join(dir, 'src')) || existsSync(join(dir, '_bmad')))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SRC_DIR = join(PROJECT_ROOT, 'src');

const MODULES = [
  'core', 'bmm', 'bmb', 'bmgd', 'cis',
  'cybersec-team', 'intel-team', 'legal-team', 'strategy-team',
];

// Modules that use workflow.md only (no workflow.yaml files)
const YAML_OPTIONAL_MODULES = ['bmb'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findFilesRecursive(dir, fileName) {
  const results = [];
  if (!existsSync(dir)) return results;

  function walk(currentDir) {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === fileName) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function getFirstWorkflowYaml(moduleName) {
  const workflowsDir = join(SRC_DIR, moduleName, 'workflows');
  const files = findFilesRecursive(workflowsDir, 'workflow.yaml');
  if (files.length === 0) return null;
  files.sort();
  return files[0];
}

function getFirstWorkflowMd(moduleName) {
  const workflowsDir = join(SRC_DIR, moduleName, 'workflows');
  const files = findFilesRecursive(workflowsDir, 'workflow.md');
  if (files.length === 0) return null;
  files.sort();
  return files[0];
}

function getWorkflowName(parsed) {
  if (!parsed) return null;
  if (typeof parsed.name === 'string') return parsed.name;
  if (parsed.workflow && parsed.workflow.metadata) {
    return parsed.workflow.metadata.name || parsed.workflow.metadata.id || null;
  }
  return null;
}

function hasDescription(parsed) {
  if (!parsed) return false;
  if (typeof parsed.description === 'string') return true;
  if (parsed.workflow && typeof parsed.workflow.description === 'string') return true;
  if (parsed.workflow && parsed.workflow.metadata && typeof parsed.workflow.metadata.description === 'string') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Per-Module Workflow Smoke Tests
// ---------------------------------------------------------------------------

describe('Workflow Execution Smoke Tests (P9-38)', () => {
  for (const mod of MODULES) {
    describe(`Module: ${  mod}`, () => {
      let workflowPath;
      let rawContent;
      let parsed;
      const yamlOptional = YAML_OPTIONAL_MODULES.includes(mod);

      beforeAll(() => {
        workflowPath = getFirstWorkflowYaml(mod);
        if (workflowPath) {
          rawContent = readFileSync(workflowPath, 'utf-8');
          parsed = yaml.load(rawContent);
        }
      });

      it(`WF-SMOKE-${  mod  }-001: has at least one workflow.yaml${  yamlOptional ? ' or workflow.md' : ''}`, () => {
        if (yamlOptional && !workflowPath) {
          // Module uses workflow.md instead of workflow.yaml
          const mdPath = getFirstWorkflowMd(mod);
          expect(mdPath, `No workflow.yaml or workflow.md in ${  mod}`).not.toBeNull();
          return;
        }
        expect(workflowPath, `No workflow.yaml in ${  mod}`).not.toBeNull();
        expect(existsSync(workflowPath)).toBe(true);
      });

      it(`WF-SMOKE-${  mod  }-002: parses as valid YAML`, () => {
        if (yamlOptional && !workflowPath) return; // Skip - uses workflow.md
        expect(parsed).not.toBeNull();
        expect(parsed).not.toBeUndefined();
        expect(typeof parsed).toBe('object');
      });

      it(`WF-SMOKE-${  mod  }-003: has a name field`, () => {
        if (yamlOptional && !workflowPath) return; // Skip - uses workflow.md
        const name = getWorkflowName(parsed);
        expect(name, `No name in ${  mod  } workflow`).not.toBeNull();
        expect(name.length).toBeGreaterThan(0);
      });

      it(`WF-SMOKE-${  mod  }-004: has a description`, () => {
        if (yamlOptional && !workflowPath) return; // Skip - uses workflow.md
        expect(hasDescription(parsed), `No description in ${  mod}`).toBe(true);
      });

      it(`WF-SMOKE-${  mod  }-005: companion files are non-empty if present`, () => {
        if (!workflowPath) return; // No workflow.yaml to check companions for
        const dir = dirname(workflowPath);
        const companionFiles = ['workflow.md', 'instructions.md', 'checklist.md'];
        for (const file of companionFiles) {
          const filePath = join(dir, file);
          if (existsSync(filePath)) {
            const fc = readFileSync(filePath, 'utf-8');
            expect(fc.trim().length, `${file  } in ${  mod  } is empty`).toBeGreaterThan(0);
          }
        }
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Aggregate Workflow Count Tests
// ---------------------------------------------------------------------------

describe('Workflow Count Validation', () => {
  let allWorkflowYamls;
  let allWorkflowMds;

  beforeAll(() => {
    allWorkflowYamls = [];
    allWorkflowMds = [];
    for (const mod of MODULES) {
      const workflowsDir = join(SRC_DIR, mod, 'workflows');
      allWorkflowYamls.push(...findFilesRecursive(workflowsDir, 'workflow.yaml'));
      allWorkflowMds.push(...findFilesRecursive(workflowsDir, 'workflow.md'));
    }
  });

  it('WF-COUNT-001: total workflow.yaml count >= 120', () => {
    expect(allWorkflowYamls.length).toBeGreaterThanOrEqual(120);
  });

  it('WF-COUNT-002: total workflow.md count >= 79', () => {
    expect(allWorkflowMds.length).toBeGreaterThanOrEqual(79);
  });

  it('WF-COUNT-003: every module has >= 1 workflow (yaml or md)', () => {
    for (const mod of MODULES) {
      const workflowsDir = join(SRC_DIR, mod, 'workflows');
      const yamls = findFilesRecursive(workflowsDir, 'workflow.yaml');
      const mds = findFilesRecursive(workflowsDir, 'workflow.md');
      expect(yamls.length + mds.length, `${mod  } has 0 workflows`).toBeGreaterThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// YAML Parse Safety Tests
// ---------------------------------------------------------------------------

describe('Workflow YAML Parse Safety', () => {
  it('WF-PARSE-001: all workflow.yaml files parse without errors', () => {
    const errors = [];
    for (const mod of MODULES) {
      const workflowsDir = join(SRC_DIR, mod, 'workflows');
      const yamls = findFilesRecursive(workflowsDir, 'workflow.yaml');
      for (const yamlPath of yamls) {
        try {
          const content = readFileSync(yamlPath, 'utf-8');
          yaml.load(content);
        } catch (err) {
          errors.push(`${yamlPath  }: ${  err.message}`);
        }
      }
    }
    expect(errors, `YAML parse errors:\n${  errors.join('\n')}`).toHaveLength(0);
  });

  it('WF-PARSE-002: all parsed workflow.yaml are objects', () => {
    for (const mod of MODULES) {
      const workflowsDir = join(SRC_DIR, mod, 'workflows');
      const yamls = findFilesRecursive(workflowsDir, 'workflow.yaml');
      for (const yamlPath of yamls) {
        const content = readFileSync(yamlPath, 'utf-8');
        const parsed = yaml.load(content);
        expect(typeof parsed, `${yamlPath  } not object`).toBe('object');
        expect(Array.isArray(parsed), `${yamlPath  } is array`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Workflow MD Frontmatter Tests
// ---------------------------------------------------------------------------

describe('Workflow MD Frontmatter', () => {
  it('WF-MD-001: workflow.md files with frontmatter parse correctly', () => {
    const errors = [];
    for (const mod of MODULES) {
      const workflowsDir = join(SRC_DIR, mod, 'workflows');
      const mds = findFilesRecursive(workflowsDir, 'workflow.md');
      for (const mdPath of mds) {
        const content = readFileSync(mdPath, 'utf-8');
        const lines = content.split('\n');
        if (lines[0].trim() !== '---') continue;

        let endIdx = -1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') { endIdx = i; break; }
        }
        if (endIdx === -1) {
          errors.push(`${mdPath  }: unclosed frontmatter`);
          continue;
        }

        const fmBlock = lines.slice(1, endIdx).join('\n');
        try {
          const parsed = yaml.load(fmBlock);
          if (!parsed || typeof parsed !== 'object') {
            errors.push(`${mdPath  }: frontmatter not an object`);
          }
        } catch (err) {
          errors.push(`${mdPath  }: ${  err.message}`);
        }
      }
    }
    expect(errors, `Frontmatter errors:\n${  errors.join('\n')}`).toHaveLength(0);
  });
});
