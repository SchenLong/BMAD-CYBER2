/**
 * Cross-Module Agent Name Uniqueness Test — L3 Validation
 *
 * Validates that agent names (filenames) are unique across all 9 modules.
 * Duplicate agent names cause ambiguous resolution in the slash command router
 * and can lead to RBAC confusion.
 *
 * Source: LessonsLearned.md Lesson 3 (Duplicate Agent Name Detection)
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

function isAgentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return /<agent\s/.test(content);
}

function getAllAgents() {
  const agents = [];
  const EXCLUDED = ['README.md', 'CHANGELOG.md', 'INDEX.md'];

  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    const mdFiles = findMdFiles(agentsDir);
    for (const filePath of mdFiles) {
      if (EXCLUDED.includes(path.basename(filePath))) continue;
      if (!isAgentFile(filePath)) continue;

      const relToAgentsDir = path.relative(agentsDir, filePath);
      const parts = relToAgentsDir.split(path.sep);
      const agentName = parts.length === 1 ? parts[0].replace(/\.md$/, '') : parts[0];

      agents.push({ module: moduleName, name: agentName, filePath });
    }
  }
  return agents;
}

// ============================================================================
// Tests
// ============================================================================

let allAgents;

describe('Cross-Module Agent Name Uniqueness (L3)', () => {
  beforeAll(() => {
    allAgents = getAllAgents();
  });

  it('should find agents across all modules', () => {
    expect(allAgents.length).toBeGreaterThanOrEqual(79);
  });

  it('should have no duplicate agent names across different modules', () => {
    // Build a map: agentName → [modules]
    const nameToModules = new Map();

    for (const agent of allAgents) {
      const existing = nameToModules.get(agent.name) || [];
      existing.push(agent.module);
      nameToModules.set(agent.name, existing);
    }

    const duplicates = [];
    for (const [name, modules] of nameToModules) {
      if (modules.length > 1) {
        duplicates.push(`"${name}" exists in: ${modules.join(', ')}`);
      }
    }

    expect(
      duplicates,
      `Duplicate agent names across modules:\n${duplicates.join('\n')}`
    ).toHaveLength(0);
  });

  it('should have unique agent names within each module', () => {
    const duplicatesPerModule = [];

    for (const moduleName of AGENT_MODULES) {
      const moduleAgents = allAgents.filter((a) => a.module === moduleName);
      const names = moduleAgents.map((a) => a.name);
      const seen = new Set();

      for (const name of names) {
        if (seen.has(name)) {
          duplicatesPerModule.push(`${moduleName}: duplicate agent "${name}"`);
        }
        seen.add(name);
      }
    }

    expect(
      duplicatesPerModule,
      `Intra-module duplicate agent names:\n${duplicatesPerModule.join('\n')}`
    ).toHaveLength(0);
  });

  it('should have agent names use kebab-case format', () => {
    const nonKebab = [];
    const kebabPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

    for (const agent of allAgents) {
      if (!kebabPattern.test(agent.name)) {
        nonKebab.push(`${agent.module}/${agent.name}`);
      }
    }

    expect(
      nonKebab,
      `Agent names not in kebab-case:\n${nonKebab.join('\n')}`
    ).toHaveLength(0);
  });
});
