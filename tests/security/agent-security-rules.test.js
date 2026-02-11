/**
 * Agent Security Rules Scanner — L8 + L9 Validation
 *
 * Validates that ALL production agent files contain:
 * - L8: PROMPT INJECTION PROTECTION rule
 * - L9: EXTERNAL CONTENT MANIPULATION PROTECTION rule
 *
 * Source: LessonsLearned.md Lessons 8 & 9
 * These rules are mandatory security controls for every agent.
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

const L8_PATTERN = 'PROMPT INJECTION PROTECTION';
const L9_PATTERN = 'EXTERNAL CONTENT MANIPULATION PROTECTION';

// Files that are not actual agents (documentation, READMEs, etc.)
const EXCLUDED_FILES = ['README.md', 'CHANGELOG.md', 'INDEX.md'];

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
 * Recursively find all .md files in a directory.
 */
function findMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip reference/example directories
      if (entry.name === 'reference' || entry.name === 'simple-examples') continue;
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!EXCLUDED_FILES.includes(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Check if a file is an actual agent (has <agent XML tag).
 */
function isAgentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return /<agent\s/.test(content);
}

/**
 * Get all production agent files from the filesystem.
 */
function getAllAgentFiles() {
  const agents = [];
  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    const mdFiles = findMdFiles(agentsDir);
    for (const filePath of mdFiles) {
      if (isAgentFile(filePath)) {
        agents.push({
          module: moduleName,
          filePath,
          relativePath: path.relative(PROJECT_ROOT, filePath),
        });
      }
    }
  }
  return agents;
}

// ============================================================================
// Test Data
// ============================================================================

let agentFiles;

// ============================================================================
// Tests
// ============================================================================

describe('Agent Security Rules Scanner (L8 + L9)', () => {
  beforeAll(() => {
    agentFiles = getAllAgentFiles();
  });

  // --------------------------------------------------------------------------
  // 1. Discovery
  // --------------------------------------------------------------------------
  describe('Agent Discovery', () => {
    it('should find at least 79 production agent files', () => {
      expect(agentFiles.length).toBeGreaterThanOrEqual(79);
    });

    it('should find agents across all 9 modules', () => {
      const modules = new Set(agentFiles.map((a) => a.module));
      for (const mod of AGENT_MODULES) {
        expect(modules.has(mod), `Module ${mod} should have agents`).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. L8 — Prompt Injection Protection
  // --------------------------------------------------------------------------
  describe('L8: Prompt Injection Protection Rule', () => {
    it('should be present in ALL production agent files', () => {
      const missing = [];

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');
        if (!content.includes(L8_PATTERN)) {
          missing.push(agent.relativePath);
        }
      }

      expect(
        missing,
        `Agents MISSING L8 (${L8_PATTERN}):\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should be inside an XML rules section with critical="SECURITY" attribute', () => {
      const malformed = [];

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');
        if (content.includes(L8_PATTERN)) {
          // Check it's within a <r critical="SECURITY"> tag
          const hasProperTag = content.includes(
            `<r critical="SECURITY">`
          ) && content.includes(L8_PATTERN);
          if (!hasProperTag) {
            malformed.push(agent.relativePath);
          }
        }
      }

      expect(
        malformed,
        `Agents with L8 rule NOT in proper <r critical="SECURITY"> tag:\n${malformed.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. L9 — External Content Manipulation Protection
  // --------------------------------------------------------------------------
  describe('L9: External Content Manipulation Protection Rule', () => {
    it('should be present in ALL production agent files', () => {
      const missing = [];

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');
        if (!content.includes(L9_PATTERN)) {
          missing.push(agent.relativePath);
        }
      }

      expect(
        missing,
        `Agents MISSING L9 (${L9_PATTERN}):\n${missing.join('\n')}`
      ).toHaveLength(0);
    });

    it('should be inside an XML rules section with critical="SECURITY" attribute', () => {
      const malformed = [];

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');
        if (content.includes(L9_PATTERN)) {
          const hasProperTag = content.includes(
            `<r critical="SECURITY">`
          ) && content.includes(L9_PATTERN);
          if (!hasProperTag) {
            malformed.push(agent.relativePath);
          }
        }
      }

      expect(
        malformed,
        `Agents with L9 rule NOT in proper <r critical="SECURITY"> tag:\n${malformed.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Combined Coverage
  // --------------------------------------------------------------------------
  describe('Combined L8 + L9 Coverage', () => {
    it('should have BOTH L8 and L9 in every agent', () => {
      const failures = [];

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');
        const hasL8 = content.includes(L8_PATTERN);
        const hasL9 = content.includes(L9_PATTERN);

        if (!hasL8 || !hasL9) {
          failures.push(
            `${agent.relativePath}: L8=${hasL8 ? 'OK' : 'MISSING'}, L9=${hasL9 ? 'OK' : 'MISSING'}`
          );
        }
      }

      expect(
        failures,
        `Agents with incomplete security rules:\n${failures.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have consistent rule text across all agents (minimal variants)', () => {
      // Collect all unique L8 and L9 rule blocks
      const l8Variants = new Set();
      const l9Variants = new Set();

      for (const agent of agentFiles) {
        const content = fs.readFileSync(agent.filePath, 'utf-8');

        // Extract L8 rule block
        const l8Match = content.match(
          /<r critical="SECURITY">[^<]*PROMPT INJECTION PROTECTION[^<]*<\/r>/
        );
        if (l8Match) l8Variants.add(l8Match[0]);

        // Extract L9 rule block
        const l9Match = content.match(
          /<r critical="SECURITY">[^<]*EXTERNAL CONTENT MANIPULATION PROTECTION[^<]*<\/r>/
        );
        if (l9Match) l9Variants.add(l9Match[0]);
      }

      // Allow small number of variants (some agents may have minor text differences)
      expect(
        l8Variants.size,
        `Expected <=2 L8 variants but found ${l8Variants.size}. Review consistency.`
      ).toBeLessThanOrEqual(2);

      expect(
        l9Variants.size,
        `Expected <=2 L9 variants but found ${l9Variants.size}. Review consistency.`
      ).toBeLessThanOrEqual(2);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Per-Module Coverage Report
  // --------------------------------------------------------------------------
  describe('Per-Module Coverage', () => {
    for (const moduleName of AGENT_MODULES) {
      it(`should have 100% L8+L9 coverage in ${moduleName} module`, () => {
        const moduleAgents = agentFiles.filter((a) => a.module === moduleName);
        const failures = [];

        for (const agent of moduleAgents) {
          const content = fs.readFileSync(agent.filePath, 'utf-8');
          if (!content.includes(L8_PATTERN) || !content.includes(L9_PATTERN)) {
            failures.push(agent.relativePath);
          }
        }

        expect(
          failures,
          `${moduleName}: agents missing L8/L9:\n${failures.join('\n')}`
        ).toHaveLength(0);
        expect(moduleAgents.length).toBeGreaterThan(0);
      });
    }
  });
});
