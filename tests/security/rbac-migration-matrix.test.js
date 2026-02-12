/**
 * RBAC Migration Matrix Verification Tests
 *
 * Ensures the RBAC migration matrix document is complete,
 * consistent, and covers all agents in the filesystem.
 *
 * Part of Story 12 (CRIT-2) - Agent ID Migration Security
 */

import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find the project root by walking up from the test directory.
 */
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
const MATRIX_PATH = path.join(
  PROJECT_ROOT,
  'Docs',
  '03-developer-docs',
  'RBAC-MIGRATION-MATRIX.md'
);
const BMAD_DIR = path.join(PROJECT_ROOT, '_bmad');

/**
 * Modules that contain agents (have an agents/ subdirectory).
 * Excludes internal directories like _config, core/help, core/routing, etc.
 */
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

/**
 * Recursively find all .md files under a directory.
 */
function findMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Get all agent .md files from the filesystem, organized by module.
 * Returns an array of { module, agentName, filePath } objects.
 */
function getFilesystemAgents() {
  const agents = [];

  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(BMAD_DIR, moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;

    const mdFiles = findMdFiles(agentsDir);
    for (const filePath of mdFiles) {
      // Extract agent name from the relative path within agents/
      const relPath = path.relative(agentsDir, filePath);
      const parts = relPath.split(path.sep);

      let agentName;
      if (parts.length === 1) {
        // Standard: agents/agent-name.md
        agentName = parts[0].replace(/\.md$/, '');
      } else {
        // Nested: agents/agent-name/agent-name.md (e.g., storyteller)
        agentName = parts[0];
      }

      agents.push({
        module: moduleName,
        agentName,
        filePath,
        legacyId: `${moduleName}/${agentName}`,
        v6Id: `_bmad/${moduleName}/agents/${agentName}`,
      });
    }
  }

  return agents;
}

/**
 * Parse the matrix table from the markdown document.
 * Returns an array of { legacyId, v6Id, module } objects.
 */
function parseMatrixEntries(content) {
  const entries = [];

  // Match table rows with pipe-delimited columns
  // Format: | # | Module | Legacy ID | V6 ID | RBAC Pattern | ... |
  const tableRowRegex =
    /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|/gm;

  let match;
  while ((match = tableRowRegex.exec(content)) !== null) {
    const [, num, module, legacyId, v6Id] = match;
    entries.push({
      number: parseInt(num, 10),
      module: module.trim(),
      legacyId: legacyId.trim(),
      v6Id: v6Id.trim(),
    });
  }

  return entries;
}

// ===== Test Suite =====

describe('RBAC Migration Matrix', () => {
  let matrixContent;
  let matrixEntries;
  let filesystemAgents;

  beforeAll(() => {
    filesystemAgents = getFilesystemAgents();
  });

  // -----------------------------------------------------------------------
  // Test 1: Matrix document exists
  // -----------------------------------------------------------------------
  describe('Document existence', () => {
    it('should exist at Docs/03-developer-docs/RBAC-MIGRATION-MATRIX.md', () => {
      expect(
        fs.existsSync(MATRIX_PATH),
        `Matrix document not found at: ${MATRIX_PATH}`
      ).toBe(true);
    });

    it('should not be empty', () => {
      matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      expect(matrixContent.length).toBeGreaterThan(100);
    });
  });

  // -----------------------------------------------------------------------
  // Test 2: Matrix contains entries for all modules that have agents
  // -----------------------------------------------------------------------
  describe('Module coverage', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      matrixEntries = parseMatrixEntries(matrixContent);
    });

    it('should contain entries for all modules that have agents', () => {
      const matrixModules = new Set(matrixEntries.map((e) => e.module));

      for (const moduleName of AGENT_MODULES) {
        const agentsDir = path.join(BMAD_DIR, moduleName, 'agents');
        if (fs.existsSync(agentsDir)) {
          const mdFiles = findMdFiles(agentsDir);
          if (mdFiles.length > 0) {
            expect(
              matrixModules.has(moduleName),
              `Module "${moduleName}" has agents on disk but no entries in the migration matrix`
            ).toBe(true);
          }
        }
      }
    });

    it('should have the correct number of total agents (80)', () => {
      expect(matrixEntries.length).toBe(80);
    });
  });

  // -----------------------------------------------------------------------
  // Test 3: Every agent file in _bmad/*/agents/ has a matrix entry
  // -----------------------------------------------------------------------
  describe('Agent completeness', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      if (!matrixEntries || matrixEntries.length === 0) {
        matrixEntries = parseMatrixEntries(matrixContent);
      }
    });

    it('should have a matrix entry for every agent on the filesystem', () => {
      const matrixV6Ids = new Set(matrixEntries.map((e) => e.v6Id));
      const missingAgents = [];

      for (const agent of filesystemAgents) {
        if (!matrixV6Ids.has(agent.v6Id)) {
          missingAgents.push(
            `${agent.v6Id} (file: ${path.relative(PROJECT_ROOT, agent.filePath)})`
          );
        }
      }

      expect(
        missingAgents,
        `The following agents exist on disk but are missing from the migration matrix:\n${missingAgents.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have a matrix entry for every agent in the filesystem (by legacy ID)', () => {
      const matrixLegacyIds = new Set(matrixEntries.map((e) => e.legacyId));
      const missingAgents = [];

      for (const agent of filesystemAgents) {
        if (!matrixLegacyIds.has(agent.legacyId)) {
          missingAgents.push(agent.legacyId);
        }
      }

      expect(
        missingAgents,
        `The following legacy IDs are missing from the matrix:\n${missingAgents.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Test 4: No duplicate v6 IDs in the matrix
  // -----------------------------------------------------------------------
  describe('Uniqueness', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      if (!matrixEntries || matrixEntries.length === 0) {
        matrixEntries = parseMatrixEntries(matrixContent);
      }
    });

    it('should have no duplicate v6 IDs', () => {
      const seen = new Map();
      const duplicates = [];

      for (const entry of matrixEntries) {
        if (seen.has(entry.v6Id)) {
          duplicates.push(
            `"${entry.v6Id}" appears at rows ${seen.get(entry.v6Id)} and ${entry.number}`
          );
        }
        seen.set(entry.v6Id, entry.number);
      }

      expect(
        duplicates,
        `Duplicate v6 IDs found:\n${duplicates.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have no duplicate legacy IDs', () => {
      const seen = new Map();
      const duplicates = [];

      for (const entry of matrixEntries) {
        if (seen.has(entry.legacyId)) {
          duplicates.push(
            `"${entry.legacyId}" appears at rows ${seen.get(entry.legacyId)} and ${entry.number}`
          );
        }
        seen.set(entry.legacyId, entry.number);
      }

      expect(
        duplicates,
        `Duplicate legacy IDs found:\n${duplicates.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Test 5: All legacy IDs follow module/agent format
  // -----------------------------------------------------------------------
  describe('Legacy ID format', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      if (!matrixEntries || matrixEntries.length === 0) {
        matrixEntries = parseMatrixEntries(matrixContent);
      }
    });

    it('should have all legacy IDs in module/agent format', () => {
      const legacyIdPattern = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;
      const invalid = [];

      for (const entry of matrixEntries) {
        if (!legacyIdPattern.test(entry.legacyId)) {
          invalid.push(
            `Row ${entry.number}: "${entry.legacyId}" does not match module/agent format`
          );
        }
      }

      expect(
        invalid,
        `Invalid legacy ID formats:\n${invalid.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Test 6: All v6 IDs follow _bmad/module/agents/agent format
  // -----------------------------------------------------------------------
  describe('V6 ID format', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      if (!matrixEntries || matrixEntries.length === 0) {
        matrixEntries = parseMatrixEntries(matrixContent);
      }
    });

    it('should have all v6 IDs in _bmad/module/agents/agent format', () => {
      const v6IdPattern = /^_bmad\/[a-z][a-z0-9-]*\/agents\/[a-z][a-z0-9-]*$/;
      const invalid = [];

      for (const entry of matrixEntries) {
        if (!v6IdPattern.test(entry.v6Id)) {
          invalid.push(
            `Row ${entry.number}: "${entry.v6Id}" does not match _bmad/module/agents/agent format`
          );
        }
      }

      expect(
        invalid,
        `Invalid v6 ID formats:\n${invalid.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Test 7: Matrix mentions atomic commit strategy
  // -----------------------------------------------------------------------
  describe('Atomic commit strategy', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
    });

    it('should mention atomic commit strategy', () => {
      const lowerContent = matrixContent.toLowerCase();
      expect(
        lowerContent.includes('atomic commit') || lowerContent.includes('atomic-commit'),
        'Matrix document does not mention "atomic commit" strategy'
      ).toBe(true);
    });

    it('should describe what must be in the single commit', () => {
      expect(
        matrixContent.includes('single commit') || matrixContent.includes('Single Commit'),
        'Matrix document does not describe single commit requirements'
      ).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Test 8: Matrix mentions migration lock mechanism
  // -----------------------------------------------------------------------
  describe('Migration lock mechanism', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
    });

    it('should mention migration lock mechanism', () => {
      const lowerContent = matrixContent.toLowerCase();
      expect(
        lowerContent.includes('migration lock') || lowerContent.includes('migration_lock'),
        'Matrix document does not mention "migration lock" mechanism'
      ).toBe(true);
    });

    it('should define migration lock lifecycle states', () => {
      expect(
        matrixContent.includes('agent_id_migration'),
        'Matrix document does not define agent_id_migration config'
      ).toBe(true);
    });

    it('should describe dual-format validation during migration', () => {
      const lowerContent = matrixContent.toLowerCase();
      expect(
        lowerContent.includes('both') &&
          (lowerContent.includes('old and new') || lowerContent.includes('legacy') && lowerContent.includes('v6')),
        'Matrix document does not describe dual-format (old and new) validation'
      ).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Test 9: Legacy-to-V6 ID consistency
  // -----------------------------------------------------------------------
  describe('ID mapping consistency', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
      if (!matrixEntries || matrixEntries.length === 0) {
        matrixEntries = parseMatrixEntries(matrixContent);
      }
    });

    it('should have consistent legacy-to-v6 ID transformation', () => {
      const inconsistent = [];

      for (const entry of matrixEntries) {
        const expectedV6 = `_bmad/${entry.legacyId.replace('/', '/agents/')}`;
        if (entry.v6Id !== expectedV6) {
          inconsistent.push(
            `Row ${entry.number}: legacy="${entry.legacyId}" -> expected v6="${expectedV6}" but got "${entry.v6Id}"`
          );
        }
      }

      expect(
        inconsistent,
        `Inconsistent ID transformations:\n${inconsistent.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have the module field matching the legacy ID prefix', () => {
      const mismatched = [];

      for (const entry of matrixEntries) {
        const legacyModule = entry.legacyId.split('/')[0];
        if (entry.module !== legacyModule) {
          mismatched.push(
            `Row ${entry.number}: module="${entry.module}" but legacy ID starts with "${legacyModule}"`
          );
        }
      }

      expect(
        mismatched,
        `Module/ID mismatches:\n${mismatched.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Test 10: RBAC rules section completeness
  // -----------------------------------------------------------------------
  describe('RBAC rules documentation', () => {
    beforeAll(() => {
      if (!matrixContent) {
        matrixContent = fs.readFileSync(MATRIX_PATH, 'utf-8');
      }
    });

    it('should document wildcard pattern changes', () => {
      expect(
        matrixContent.includes('Wildcard Agent Patterns') ||
          matrixContent.includes('wildcard pattern'),
        'Matrix does not document wildcard pattern changes'
      ).toBe(true);
    });

    it('should document explicit agent reference changes', () => {
      expect(
        matrixContent.includes('Explicit Agent References') ||
          matrixContent.includes('explicit agent'),
        'Matrix does not document explicit agent reference changes'
      ).toBe(true);
    });

    it('should document agent_restrictions key changes', () => {
      expect(
        matrixContent.includes('agent_restrictions') ||
          matrixContent.includes('Agent-Level Restriction'),
        'Matrix does not document agent_restrictions key changes'
      ).toBe(true);
    });

    it('should identify phantom agent references', () => {
      expect(
        matrixContent.includes('Phantom') || matrixContent.includes('phantom'),
        'Matrix does not identify phantom agent references in RBAC config'
      ).toBe(true);
    });
  });
});
