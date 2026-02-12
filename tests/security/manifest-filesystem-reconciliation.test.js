/**
 * Manifest ↔ Filesystem Reconciliation Test — L6 Phase 7 Validation
 *
 * Validates consistency between:
 * - agent-manifest.csv entries vs actual src/{module}/agents/*.md files
 * - workflow schema entries vs actual workflow.yaml files
 * - module.yaml definitions vs actual module directories
 *
 * Detects registration drift where manifests become out of sync with filesystem.
 *
 * Source: LessonsLearned.md Lesson 6 (Phase 7: Framework Registration)
 */

import { beforeAll, describe, expect, it } from 'vitest';
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
const MANIFEST_PATH = path.join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv');

/**
 * Parse agent-manifest.csv into structured rows.
 */
function parseManifestCsv() {
  const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());
  const header = lines[0];
  const headerCols = header.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const idIdx = headerCols.indexOf('id');
  const nameIdx = headerCols.indexOf('name');
  const moduleIdx = headerCols.indexOf('module');
  const pathIdx = headerCols.indexOf('path');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const matches = [];
    const regex = /"([^"]*)"/g;
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      matches.push(match[1]);
    }
    if (matches.length > Math.max(idIdx, nameIdx, moduleIdx)) {
      rows.push({
        id: matches[idIdx],
        name: matches[nameIdx],
        module: matches[moduleIdx],
        path: pathIdx >= 0 && pathIdx < matches.length ? matches[pathIdx] : '',
        rawLine: i + 1,
      });
    }
  }
  return rows;
}

/**
 * Find all actual agent .md files on the filesystem.
 */
function getFilesystemAgents() {
  const agents = [];
  const EXCLUDED = ['README.md', 'CHANGELOG.md', 'INDEX.md'];

  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;

    const mdFiles = findMdFiles(agentsDir);
    for (const filePath of mdFiles) {
      const basename = path.basename(filePath);
      if (EXCLUDED.includes(basename)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      if (!/<agent\s/.test(content)) continue;

      const relToAgentsDir = path.relative(agentsDir, filePath);
      const parts = relToAgentsDir.split(path.sep);
      const agentName = parts.length === 1 ? parts[0].replace(/\.md$/, '') : parts[0];

      agents.push({
        module: moduleName,
        name: agentName,
        filePath,
        v6Id: `src/${moduleName}/agents/${agentName}`,
      });
    }
  }
  return agents;
}

function findMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'reference' || entry.name === 'simple-examples') continue;
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Find all workflow.yaml files on the filesystem.
 */
function getFilesystemWorkflows() {
  const workflows = [];
  for (const moduleName of AGENT_MODULES) {
    const workflowsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'workflows');
    if (!fs.existsSync(workflowsDir)) continue;

    const yamlFiles = findFiles(workflowsDir, 'workflow.yaml');
    for (const filePath of yamlFiles) {
      workflows.push({
        module: moduleName,
        filePath,
        relativePath: path.relative(PROJECT_ROOT, filePath),
      });
    }
  }
  return workflows;
}

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

// ============================================================================
// Test Data
// ============================================================================

let manifestRows;
let filesystemAgents;
let filesystemWorkflows;

// ============================================================================
// Tests
// ============================================================================

describe('Manifest ↔ Filesystem Reconciliation (L6-P7)', () => {
  beforeAll(() => {
    manifestRows = parseManifestCsv();
    filesystemAgents = getFilesystemAgents();
    filesystemWorkflows = getFilesystemWorkflows();
  });

  // --------------------------------------------------------------------------
  // 1. Agent Manifest Integrity
  // --------------------------------------------------------------------------
  describe('Agent Manifest Integrity', () => {
    it('should have agent-manifest.csv exist and be non-empty', () => {
      expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
      expect(manifestRows.length).toBeGreaterThan(0);
    });

    it('should have manifest entry count match filesystem agent count', () => {
      const diff = Math.abs(manifestRows.length - filesystemAgents.length);
      expect(
        diff,
        `Manifest has ${manifestRows.length} entries but filesystem has ${filesystemAgents.length} agents (diff: ${diff})`
      ).toBeLessThanOrEqual(2); // Allow small tolerance for special files
    });

    it('should have every manifest agent exist on the filesystem', () => {
      const fsIds = new Set(filesystemAgents.map((a) => a.v6Id));
      // Also add nested path variants (e.g., storyteller → src/cis/agents/storyteller/storyteller)
      for (const agent of filesystemAgents) {
        // For nested agents, add the manifest-style ID (with doubled name)
        const nestedId = `${agent.v6Id}/${agent.name}`;
        fsIds.add(nestedId);
      }

      const missing = [];

      for (const row of manifestRows) {
        if (!fsIds.has(row.id)) {
          missing.push(`Manifest id="${row.id}" (module: ${row.module}) — no matching file`);
        }
      }

      expect(
        missing,
        `Manifest entries without filesystem files:\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have nearly every filesystem agent in the manifest', () => {
      const manifestIds = new Set(manifestRows.map((r) => r.id));
      const unregistered = [];

      for (const agent of filesystemAgents) {
        if (!manifestIds.has(agent.v6Id)) {
          unregistered.push(
            `${agent.v6Id} (${agent.module}/${agent.name}) — not in manifest`
          );
        }
      }

      // Allow a small tolerance (e.g., qa agent may exist on disk but not in CSV)
      expect(
        unregistered.length,
        `Filesystem agents NOT in manifest (${unregistered.length}):\n${unregistered.join('\n')}`
      ).toBeLessThanOrEqual(2);
    });

    it('should have all manifest ids use v6 format (src/ prefix)', () => {
      const nonV6 = manifestRows.filter((r) => !r.id.startsWith('src/'));
      expect(
        nonV6.map((r) => r.id),
        `Manifest IDs not using v6 format:\n${nonV6.map((r) => r.id).join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Per-Module Agent Count Consistency
  // --------------------------------------------------------------------------
  describe('Per-Module Agent Counts', () => {
    for (const moduleName of AGENT_MODULES) {
      it(`should have matching agent count for ${moduleName}`, () => {
        const manifestCount = manifestRows.filter((r) => r.module === moduleName).length;
        const fsCount = filesystemAgents.filter((a) => a.module === moduleName).length;
        const diff = Math.abs(manifestCount - fsCount);

        expect(
          diff,
          `${moduleName}: manifest has ${manifestCount} agents, filesystem has ${fsCount} (diff: ${diff})`
        ).toBeLessThanOrEqual(1);
      });
    }
  });

  // --------------------------------------------------------------------------
  // 3. Workflow Filesystem Counts
  // --------------------------------------------------------------------------
  describe('Workflow Filesystem Integrity', () => {
    it('should find workflow.yaml files across all modules', () => {
      expect(filesystemWorkflows.length).toBeGreaterThan(0);
    });

    it('should have at least 100 workflow.yaml files', () => {
      expect(filesystemWorkflows.length).toBeGreaterThanOrEqual(100);
    });

    it('should have workflows in all modules with workflow content', () => {
      const modulesWithWorkflows = new Set(filesystemWorkflows.map((w) => w.module));
      // At minimum these modules should have workflows (yaml format)
      // Note: bmb uses workflow.md format exclusively, not workflow.yaml
      const expectedYamlModules = ['core', 'bmm', 'bmgd', 'cybersec-team', 'intel-team'];
      for (const mod of expectedYamlModules) {
        expect(
          modulesWithWorkflows.has(mod),
          `Module ${mod} should have workflow.yaml files`
        ).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Module Directory Integrity
  // --------------------------------------------------------------------------
  describe('Module Directory Integrity', () => {
    it('should have all 9 module directories exist in src/', () => {
      const missing = [];
      for (const moduleName of AGENT_MODULES) {
        const moduleDir = path.join(PROJECT_ROOT, 'src', moduleName);
        if (!fs.existsSync(moduleDir)) {
          missing.push(moduleName);
        }
      }

      expect(
        missing,
        `Missing module directories in src/:\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have module.yaml in each module directory', () => {
      const missing = [];
      for (const moduleName of AGENT_MODULES) {
        const moduleYaml = path.join(PROJECT_ROOT, 'src', moduleName, 'module.yaml');
        if (!fs.existsSync(moduleYaml)) {
          missing.push(`src/${moduleName}/module.yaml`);
        }
      }

      expect(
        missing,
        `Missing module.yaml files:\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have agents/ directory in each module', () => {
      const missing = [];
      for (const moduleName of AGENT_MODULES) {
        const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
        if (!fs.existsSync(agentsDir)) {
          missing.push(`src/${moduleName}/agents/`);
        }
      }

      expect(
        missing,
        `Missing agents/ directories:\n${missing.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Manifest CSV Format Validation
  // --------------------------------------------------------------------------
  describe('Manifest CSV Format', () => {
    it('should have required columns: id, name, module', () => {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      const header = content.split('\n')[0];
      // Header may be unquoted (id,name,...) or quoted ("id","name",...)
      expect(header).toMatch(/\bid\b/);
      expect(header).toMatch(/\bname\b/);
      expect(header).toMatch(/\bmodule\b/);
    });

    it('should have no empty id fields', () => {
      const emptyIds = manifestRows.filter((r) => !r.id || r.id.trim() === '');
      expect(emptyIds).toHaveLength(0);
    });

    it('should have no duplicate ids', () => {
      const ids = manifestRows.map((r) => r.id);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(
        duplicates,
        `Duplicate manifest IDs:\n${duplicates.join('\n')}`
      ).toHaveLength(0);
    });
  });
});
