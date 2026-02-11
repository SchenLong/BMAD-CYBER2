/**
 * Agent Activation Smoke Tests (P9-37)
 *
 * Smoke test verifying agents can be loaded and have valid structure.
 * Tests 1 agent per module (9 total, first alphabetically) plus aggregate counts.
 *
 * @module tests/smoke/agent-activation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const CONFIG_DIR = join(PROJECT_ROOT, '_bmad', '_config');
const AGENT_MANIFEST = join(CONFIG_DIR, 'agent-manifest.csv');

const MODULES = [
  'core', 'bmm', 'bmb', 'bmgd', 'cis',
  'cybersec-team', 'intel-team', 'legal-team', 'strategy-team',
];

function getFirstAgent(moduleName) {
  const agentsDir = join(SRC_DIR, moduleName, 'agents');
  if (!existsSync(agentsDir)) return null;
  const files = readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
    .sort();
  if (files.length === 0) return null;
  return { name: files[0], path: join(agentsDir, files[0]) };
}

function extractXmlAttribute(content, attrName) {
  const regex = new RegExp(attrName + '="([^"]*)"');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function countAllAgents() {
  let total = 0;
  for (const mod of MODULES) {
    const agentsDir = join(SRC_DIR, mod, 'agents');
    if (existsSync(agentsDir)) {
      total += readdirSync(agentsDir).filter((f) => f.endsWith('.md') && !f.startsWith('.')).length;
    }
  }
  return total;
}

describe('Agent Activation Smoke Tests (P9-37)', () => {
  for (const mod of MODULES) {
    describe('Module: ' + mod, () => {
      let agent;
      let content;
      let fileSize;

      beforeAll(() => {
        agent = getFirstAgent(mod);
        if (agent) {
          content = readFileSync(agent.path, 'utf-8');
          fileSize = statSync(agent.path).size;
        }
      });

      it('SMOKE-' + mod + '-001: file exists and is readable', () => {
        expect(agent, 'No agent found in ' + mod).not.toBeNull();
        expect(existsSync(agent.path)).toBe(true);
        expect(content).toBeTruthy();
      });

      it('SMOKE-' + mod + '-002: has XML agent tag', () => {
        expect(content).toContain('<agent');
        expect(content).toMatch(/<agent\s+id="/);
      });

      it('SMOKE-' + mod + '-003: id in v6 format', () => {
        const agentId = extractXmlAttribute(content, 'id');
        expect(agentId).not.toBeNull();
        expect(agentId.startsWith('src/' + mod + '/agents/')).toBe(true);
      });

      it('SMOKE-' + mod + '-004: has name attribute', () => {
        const name = extractXmlAttribute(content, 'name');
        expect(name).not.toBeNull();
        expect(name.length).toBeGreaterThan(0);
      });

      it('SMOKE-' + mod + '-005: has title attribute', () => {
        const title = extractXmlAttribute(content, 'title');
        expect(title).not.toBeNull();
        expect(title.length).toBeGreaterThan(0);
      });

      it('SMOKE-' + mod + '-006: has substantial content', () => {
        expect(content.length).toBeGreaterThan(200);
      });

      it('SMOKE-' + mod + '-007: file size reasonable (100B-500KB)', () => {
        expect(fileSize).toBeGreaterThan(100);
        expect(fileSize).toBeLessThan(500 * 1024);
      });
    });
  }
});

describe('Agent Manifest Registration', () => {
  let manifestContent;
  beforeAll(() => {
    expect(existsSync(AGENT_MANIFEST)).toBe(true);
    manifestContent = readFileSync(AGENT_MANIFEST, 'utf-8');
  });

  for (const mod of MODULES) {
    it('SMOKE-MANIFEST-' + mod + ': first agent in manifest', () => {
      const agent = getFirstAgent(mod);
      expect(agent).not.toBeNull();
      expect(manifestContent).toContain('src/' + mod + '/agents/' + agent.name);
    });
  }
});

describe('Agent Count Validation', () => {
  it('SMOKE-COUNT-001: total agent count >= 79', () => {
    expect(countAllAgents()).toBeGreaterThanOrEqual(79);
  });

  it('SMOKE-COUNT-002: every module has >= 1 agent', () => {
    for (const mod of MODULES) {
      const d = join(SRC_DIR, mod, 'agents');
      expect(existsSync(d)).toBe(true);
      expect(readdirSync(d).filter((f) => f.endsWith('.md')).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('SMOKE-COUNT-003: manifest header has expected columns', () => {
    const h = readFileSync(AGENT_MANIFEST, 'utf-8').split('\n')[0];
    expect(h).toContain('id');
    expect(h).toContain('name');
    expect(h).toContain('module');
    expect(h).toContain('path');
  });
});

describe('Agent YAML Frontmatter', () => {
  for (const mod of MODULES) {
    it('SMOKE-FM-' + mod + ': valid YAML frontmatter', () => {
      const agent = getFirstAgent(mod);
      expect(agent).not.toBeNull();
      const content = readFileSync(agent.path, 'utf-8');
      const lines = content.split('\n');
      expect(lines[0].trim()).toBe('---');
      let endIdx = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') { endIdx = i; break; }
      }
      expect(endIdx).toBeGreaterThan(0);
      const fm = lines.slice(1, endIdx).join('\n');
      expect(fm).toContain('name:');
      expect(fm).toContain('description:');
    });
  }
});
