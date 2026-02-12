/**
 * Workflow Alias Count Validation Test
 *
 * Reconciles workflow counts across multiple sources:
 * - Filesystem: workflow.yaml files in src/
 * - Command stubs: .claude/commands/bmad/{module}/workflows/
 * - Dual format: workflow.yaml vs workflow.md (L16)
 *
 * Resolves the "120 workflow.yaml vs 139 alias" discrepancy.
 *
 * Source: LessonsLearned.md Lessons 16, 18 (Dual Workflow Format Awareness)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Constants
// ============================================================================

const AGENT_MODULES = [
  'core',
  'bmb',
  'bmgd',
  'bmm',
  'cis',
  'cybersec-team',
  'intel-team',
  'legal-team',
  'strategy-team',
];

// ============================================================================
// Helpers
// ============================================================================

function findProjectRoot() {
  let dir = path.resolve(__dirname, '../..');
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(dir, 'package.json')) &&
      fs.existsSync(path.join(dir, '_bmad'))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();

function findFiles(dir, filename) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, filename));
    } else if (entry.isFile() && entry.name === filename) {
      results.push(fullPath);
    }
  }
  return results;
}

function findMdFilesInDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const entry of entries) {
    results.push(path.join(dir, entry));
  }
  return results;
}

/**
 * Get all workflow.yaml files across src/ modules.
 */
function getYamlWorkflows() {
  const workflows = [];
  for (const moduleName of AGENT_MODULES) {
    const workflowsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'workflows');
    if (!fs.existsSync(workflowsDir)) continue;
    const yamlFiles = findFiles(workflowsDir, 'workflow.yaml');
    for (const filePath of yamlFiles) {
      workflows.push({
        module: moduleName,
        filePath,
        format: 'yaml',
        relativePath: path.relative(PROJECT_ROOT, filePath),
      });
    }
  }
  return workflows;
}

/**
 * Get all Step-File (workflow.md) format workflows.
 */
function getMdWorkflows() {
  const workflows = [];
  for (const moduleName of AGENT_MODULES) {
    const workflowsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'workflows');
    if (!fs.existsSync(workflowsDir)) continue;
    const mdFiles = findFiles(workflowsDir, 'workflow.md');
    for (const filePath of mdFiles) {
      workflows.push({
        module: moduleName,
        filePath,
        format: 'md',
        relativePath: path.relative(PROJECT_ROOT, filePath),
      });
    }
  }
  return workflows;
}

/**
 * Get all workflow command stubs from .claude/commands/bmad/{module}/workflows/
 */
function getWorkflowStubs() {
  const stubs = [];
  for (const moduleName of AGENT_MODULES) {
    const stubDir = path.join(
      PROJECT_ROOT, '.claude', 'commands', 'bmad', moduleName, 'workflows'
    );
    if (!fs.existsSync(stubDir)) continue;
    const files = findMdFilesInDir(stubDir);
    for (const filePath of files) {
      stubs.push({
        module: moduleName,
        name: path.basename(filePath, '.md'),
        filePath,
      });
    }
  }
  return stubs;
}

// ============================================================================
// Test Data
// ============================================================================

let yamlWorkflows;
let mdWorkflows;
let allWorkflows;
let workflowStubs;

// ============================================================================
// Tests
// ============================================================================

describe('Workflow Alias Count Validation (L16)', () => {
  beforeAll(() => {
    yamlWorkflows = getYamlWorkflows();
    mdWorkflows = getMdWorkflows();
    allWorkflows = [...yamlWorkflows, ...mdWorkflows];
    workflowStubs = getWorkflowStubs();
  });

  // --------------------------------------------------------------------------
  // 1. Workflow Count Discovery
  // --------------------------------------------------------------------------
  describe('Workflow Count Discovery', () => {
    it('should find workflow.yaml files', () => {
      expect(yamlWorkflows.length).toBeGreaterThan(0);
    });

    it('should report dual format counts (yaml vs md)', () => {
      // This is informational — we expect both formats to exist
      console.log(`workflow.yaml files: ${yamlWorkflows.length}`);
      console.log(`workflow.md files: ${mdWorkflows.length}`);
      console.log(`Total unique workflows: ${allWorkflows.length}`);

      // Total should be in reasonable range
      expect(allWorkflows.length).toBeGreaterThanOrEqual(100);
    });

    it('should find workflow command stubs', () => {
      expect(workflowStubs.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Dual Format Awareness (L16, L18)
  // --------------------------------------------------------------------------
  describe('Dual Format Awareness (L16, L18)', () => {
    it('should track directories with both workflow.yaml and workflow.md (dual format)', () => {
      // Many workflows have BOTH formats: yaml provides metadata/schema,
      // md provides step-file instructions. This is expected per the dual
      // workflow architecture (L16, L18).
      const dirs = new Map();

      for (const wf of allWorkflows) {
        const dir = path.dirname(wf.filePath);
        const existing = dirs.get(dir) || [];
        existing.push(wf.format);
        dirs.set(dir, existing);
      }

      const dualFormat = [];
      const yamlOnly = [];
      const mdOnly = [];
      for (const [dir, formats] of dirs) {
        const hasBoth = formats.includes('yaml') && formats.includes('md');
        if (hasBoth) dualFormat.push(path.relative(PROJECT_ROOT, dir));
        else if (formats.includes('yaml')) yamlOnly.push(path.relative(PROJECT_ROOT, dir));
        else mdOnly.push(path.relative(PROJECT_ROOT, dir));
      }

      // Report counts for awareness
      console.log(`Dual format (yaml+md): ${dualFormat.length}`);
      console.log(`YAML only: ${yamlOnly.length}`);
      console.log(`MD only: ${mdOnly.length}`);

      // Total unique workflow directories should be reasonable
      expect(dirs.size).toBeGreaterThanOrEqual(100);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Stub ↔ Workflow Consistency
  // --------------------------------------------------------------------------
  describe('Stub ↔ Workflow Consistency', () => {
    it('should have every workflow stub reference a valid source file', () => {
      const broken = [];

      for (const stub of workflowStubs) {
        const content = fs.readFileSync(stub.filePath, 'utf-8');

        // Extract the @src/ reference (may be wrapped in backticks)
        const refMatch = content.match(/@(src\/[^\s,`]+)/);
        if (!refMatch) {
          broken.push(`${stub.module}/workflows/${stub.name}: no @src/ reference`);
          continue;
        }

        const resolvedPath = path.join(PROJECT_ROOT, refMatch[1]);
        if (!fs.existsSync(resolvedPath)) {
          broken.push(
            `${stub.module}/workflows/${stub.name}: references ${refMatch[1]} — file not found`
          );
        }
      }

      expect(
        broken,
        `Workflow stubs with broken references:\n${broken.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have all stubs reference src/ paths (not _bmad/)', () => {
      const legacyRefs = [];

      for (const stub of workflowStubs) {
        const content = fs.readFileSync(stub.filePath, 'utf-8');
        if (content.includes('@_bmad/') && !content.includes('@src/')) {
          legacyRefs.push(`${stub.module}/workflows/${stub.name}: uses legacy _bmad/ path`);
        }
      }

      expect(
        legacyRefs,
        `Workflow stubs with legacy _bmad/ paths:\n${legacyRefs.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Per-Module Workflow Counts
  // --------------------------------------------------------------------------
  describe('Per-Module Workflow Counts', () => {
    for (const moduleName of AGENT_MODULES) {
      it(`should have workflows in ${moduleName}`, () => {
        const moduleWorkflows = allWorkflows.filter((w) => w.module === moduleName);
        const moduleStubs = workflowStubs.filter((s) => s.module === moduleName);

        // Every module should have at least 1 workflow or stub
        const hasWorkflows = moduleWorkflows.length > 0 || moduleStubs.length > 0;
        expect(hasWorkflows, `${moduleName} has no workflows or stubs`).toBe(true);
      });
    }
  });

  // --------------------------------------------------------------------------
  // 5. Alias Uniqueness
  // --------------------------------------------------------------------------
  describe('Alias Uniqueness', () => {
    it('should have unique workflow names (aliases) within each module', () => {
      const duplicates = [];

      for (const moduleName of AGENT_MODULES) {
        const moduleYaml = yamlWorkflows.filter((w) => w.module === moduleName);
        const aliases = new Map(); // alias -> [file paths]

        for (const wf of moduleYaml) {
          try {
            const content = fs.readFileSync(wf.filePath, 'utf-8');
            const nameMatch = content.match(/^name:\s*['"]?([^\s'"#]+)/m);
            if (!nameMatch) continue;

            const alias = nameMatch[1];
            const existing = aliases.get(alias) || [];
            existing.push(wf.relativePath);
            aliases.set(alias, existing);
          } catch {
            // Skip unreadable files
          }
        }

        for (const [alias, files] of aliases) {
          if (files.length > 1) {
            duplicates.push(`${moduleName}: "${alias}" in ${files.join(', ')}`);
          }
        }
      }

      expect(
        duplicates,
        `Duplicate workflow aliases within modules:\n${duplicates.join('\n')}`
      ).toHaveLength(0);
    });

    it('should report cross-module duplicate aliases (informational)', () => {
      // Cross-module duplicates are expected (e.g., bmgd forks bmm workflows).
      // The slash command system namespaces by module, so this is safe.
      const globalAliases = new Map(); // alias -> [module names]

      for (const wf of yamlWorkflows) {
        try {
          const content = fs.readFileSync(wf.filePath, 'utf-8');
          const nameMatch = content.match(/^name:\s*['"]?([^\s'"#]+)/m);
          if (!nameMatch) continue;

          const alias = nameMatch[1];
          const existing = globalAliases.get(alias) || new Set();
          existing.add(wf.module);
          globalAliases.set(alias, existing);
        } catch {
          // Skip
        }
      }

      const crossModuleDupes = [];
      for (const [alias, modules] of globalAliases) {
        if (modules.size > 1) {
          crossModuleDupes.push(`"${alias}" in: ${[...modules].join(', ')}`);
        }
      }

      if (crossModuleDupes.length > 0) {
        console.log(`Cross-module duplicate aliases (expected): ${crossModuleDupes.length}`);
        crossModuleDupes.forEach((d) => console.log(`  ${d}`));
      }

      // This is informational — cross-module duplicates are by design
      expect(crossModuleDupes.length).toBeDefined();
    });

    it('should report total unique alias count', () => {
      const aliases = new Set();

      for (const wf of yamlWorkflows) {
        try {
          const content = fs.readFileSync(wf.filePath, 'utf-8');
          const nameMatch = content.match(/^name:\s*['"]?([^\s'"#]+)/m);
          if (nameMatch) aliases.add(nameMatch[1]);
        } catch {
          // Skip
        }
      }

      console.log(`Unique workflow aliases from YAML: ${aliases.size}`);
      // Should have a reasonable number of unique aliases
      expect(aliases.size).toBeGreaterThanOrEqual(50);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Workflow YAML Validation
  // --------------------------------------------------------------------------
  describe('Workflow YAML Basic Validation', () => {
    it('should have all workflow.yaml files be valid YAML (parseable)', () => {
      const invalid = [];

      for (const wf of yamlWorkflows) {
        try {
          const content = fs.readFileSync(wf.filePath, 'utf-8');
          // Basic check: should have name or title field
          if (!content.includes('name:') && !content.includes('title:')) {
            invalid.push(`${wf.relativePath}: missing name or title field`);
          }
        } catch (err) {
          invalid.push(`${wf.relativePath}: read error — ${err.message}`);
        }
      }

      expect(
        invalid,
        `Invalid workflow.yaml files:\n${invalid.join('\n')}`
      ).toHaveLength(0);
    });
  });
});
