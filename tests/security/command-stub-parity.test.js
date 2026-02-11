/**
 * Command Stub Parity Test — L15 + L17 Validation
 *
 * Validates bidirectional consistency between:
 * - Source agent files in src/{module}/agents/
 * - Command stubs in .claude/commands/bmad/{module}/agents/
 *
 * Detects:
 * - Orphan stubs (stubs without corresponding source files) — L17
 * - Missing stubs (source agents exposed to users without stubs) — L15
 * - Broken references (stubs pointing to non-existent source files)
 *
 * Source: LessonsLearned.md Lessons 15 and 17
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

/**
 * Get all agent stub files from .claude/commands/bmad/{module}/agents/
 */
function getStubAgents() {
  const stubs = [];
  for (const moduleName of AGENT_MODULES) {
    const stubDir = path.join(PROJECT_ROOT, '.claude', 'commands', 'bmad', moduleName, 'agents');
    if (!fs.existsSync(stubDir)) continue;
    const files = fs.readdirSync(stubDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(stubDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      stubs.push({
        module: moduleName,
        name: file.replace(/\.md$/, ''),
        filePath,
        content,
      });
    }
  }
  return stubs;
}

/**
 * Get all source agent files from src/{module}/agents/
 * Only includes actual agent files (with <agent XML tag).
 */
function getSourceAgents() {
  const agents = [];
  const EXCLUDED = ['README.md', 'CHANGELOG.md', 'INDEX.md'];
  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    const files = findMdFilesFlat(agentsDir);
    for (const filePath of files) {
      const basename = path.basename(filePath);
      if (EXCLUDED.includes(basename)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!/<agent\s/.test(content)) continue;

      // Determine the agent name from the file structure
      const relToAgentsDir = path.relative(agentsDir, filePath);
      const parts = relToAgentsDir.split(path.sep);
      // For nested agents (e.g., storyteller/storyteller.md), use directory name
      const agentName = parts.length === 1 ? parts[0].replace(/\.md$/, '') : parts[0];

      agents.push({
        module: moduleName,
        name: agentName,
        filePath,
      });
    }
  }
  return agents;
}

function findMdFilesFlat(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'reference' || entry.name === 'simple-examples') continue;
      results.push(...findMdFilesFlat(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Extract the @src/ reference path from a stub file.
 */
function extractStubReference(content) {
  // Pattern: @src/{module}/agents/{name}.md
  const match = content.match(/@(src\/[^\s]+\.md)/);
  return match ? match[1] : null;
}

// ============================================================================
// Test Data
// ============================================================================

let stubAgents;
let sourceAgents;

// ============================================================================
// Tests
// ============================================================================

describe('Command Stub Parity (L15 + L17)', () => {
  beforeAll(() => {
    stubAgents = getStubAgents();
    sourceAgents = getSourceAgents();
  });

  // --------------------------------------------------------------------------
  // 1. Discovery
  // --------------------------------------------------------------------------
  describe('Discovery', () => {
    it('should find agent stubs in .claude/commands/bmad/', () => {
      expect(stubAgents.length).toBeGreaterThan(0);
    });

    it('should find source agents in src/', () => {
      expect(sourceAgents.length).toBeGreaterThan(0);
    });

    it('should have stubs across all 9 modules', () => {
      const stubModules = new Set(stubAgents.map((s) => s.module));
      for (const mod of AGENT_MODULES) {
        expect(stubModules.has(mod), `No stubs found for module: ${mod}`).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. Stub → Source Validation (No Orphan Stubs - L17)
  // --------------------------------------------------------------------------
  describe('Stub → Source (Orphan Detection - L17)', () => {
    it('should have every stub reference a valid source file', () => {
      const orphans = [];

      for (const stub of stubAgents) {
        const ref = extractStubReference(stub.content);
        if (!ref) {
          orphans.push(`${stub.module}/agents/${stub.name}: no @src/ reference found`);
          continue;
        }

        const resolvedPath = path.join(PROJECT_ROOT, ref);
        if (!fs.existsSync(resolvedPath)) {
          orphans.push(
            `${stub.module}/agents/${stub.name}: references ${ref} but file does not exist`
          );
        }
      }

      expect(
        orphans,
        `Orphan stubs (reference non-existent source files):\n${orphans.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have all stubs contain the activation pattern', () => {
      const malformed = [];

      for (const stub of stubAgents) {
        if (!stub.content.includes('<agent-activation')) {
          malformed.push(`${stub.module}/agents/${stub.name}: missing <agent-activation> tag`);
        }
      }

      expect(
        malformed,
        `Malformed stubs missing activation pattern:\n${malformed.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have all stubs reference src/ paths (not _bmad/)', () => {
      const legacyRefs = [];

      for (const stub of stubAgents) {
        if (stub.content.includes('@_bmad/') || stub.content.includes('_bmad/')) {
          if (!stub.content.includes('@src/')) {
            legacyRefs.push(`${stub.module}/agents/${stub.name}: uses legacy _bmad/ path`);
          }
        }
      }

      expect(
        legacyRefs,
        `Stubs with legacy _bmad/ paths:\n${legacyRefs.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Source → Stub Audit (Coverage Check - L15)
  // --------------------------------------------------------------------------
  describe('Source → Stub (Coverage Check - L15)', () => {
    it('should report source agents without stubs (informational)', () => {
      const stubKeys = new Set(stubAgents.map((s) => `${s.module}/${s.name}`));
      const missing = [];

      for (const agent of sourceAgents) {
        const key = `${agent.module}/${agent.name}`;
        if (!stubKeys.has(key)) {
          missing.push(key);
        }
      }

      // This is informational — not all agents need stubs (some are internal)
      // But we track the count for awareness
      if (missing.length > 0) {
        console.log(`Source agents without stubs (${missing.length}): ${missing.join(', ')}`);
      }

      // At most a small number should be missing stubs
      expect(missing.length).toBeLessThanOrEqual(5);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Stub Naming Consistency
  // --------------------------------------------------------------------------
  describe('Stub Naming Consistency', () => {
    it('should have stub filename match the referenced agent name', () => {
      const mismatches = [];

      for (const stub of stubAgents) {
        const ref = extractStubReference(stub.content);
        if (!ref) continue;

        // Extract agent name from ref path: src/{module}/agents/{name}.md
        const refName = path.basename(ref, '.md');
        if (refName !== stub.name) {
          mismatches.push(
            `Stub: ${stub.name}.md → references: ${refName}.md (name mismatch)`
          );
        }
      }

      expect(
        mismatches,
        `Stub filename/reference mismatches:\n${mismatches.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have all stubs with valid frontmatter (name + description)', () => {
      const invalid = [];

      for (const stub of stubAgents) {
        const frontmatterMatch = stub.content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
          invalid.push(`${stub.module}/agents/${stub.name}: no frontmatter`);
          continue;
        }

        const fm = frontmatterMatch[1];
        if (!fm.includes('name:') && !fm.includes('description:')) {
          invalid.push(`${stub.module}/agents/${stub.name}: missing name or description`);
        }
      }

      expect(
        invalid,
        `Stubs with invalid frontmatter:\n${invalid.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Per-Module Parity
  // --------------------------------------------------------------------------
  describe('Per-Module Counts', () => {
    for (const moduleName of AGENT_MODULES) {
      it(`should have consistent stub count for ${moduleName}`, () => {
        const moduleStubs = stubAgents.filter((s) => s.module === moduleName);
        const moduleSources = sourceAgents.filter((a) => a.module === moduleName);

        // Stubs should not exceed sources (no phantom stubs)
        expect(
          moduleStubs.length,
          `${moduleName}: more stubs (${moduleStubs.length}) than sources (${moduleSources.length})`
        ).toBeLessThanOrEqual(moduleSources.length);
      });
    }
  });
});
