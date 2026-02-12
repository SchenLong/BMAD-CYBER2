/**
 * UAT-03: Agent Activation — All 80 Agents (80 checks)
 *
 * Validates: Every agent across all 9 modules activates correctly —
 * file exists, has valid XML structure, persona content, domain keywords.
 *
 * Stories:
 *   S1: core agents (2 checks) — UAT-03-001 to UAT-03-002
 *   S2: bmm agents (10 checks) — UAT-03-003 to UAT-03-012
 *   S3: bmb agents (3 checks) — UAT-03-013 to UAT-03-015
 *   S4: cybersec-team agents (15 checks) — UAT-03-016 to UAT-03-030
 *   S5: intel-team agents (11 checks) — UAT-03-031 to UAT-03-041
 *   S6: legal-team agents (13 checks) — UAT-03-042 to UAT-03-054
 *   S7: strategy-team agents (14 checks) — UAT-03-055 to UAT-03-068
 *   S8: bmgd agents (6 checks) — UAT-03-069 to UAT-03-074
 *   S9: cis agents (6 checks) — UAT-03-075 to UAT-03-080
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');
const COMMANDS_DIR = join(PROJECT_ROOT, '.claude', 'commands', 'bmad');
const MANIFEST_PATH = join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv');

// Helper: read file
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// Helper: extract XML attribute
function extractXmlAttr(content, attr) {
  const match = content.match(new RegExp(`${attr}="([^"]*)"`));
  return match ? match[1] : null;
}

// Helper: find agent .md file (handles both flat and nested directories)
function findAgentPath(module, agentName) {
  // Try flat first
  const flat = join(SRC_DIR, module, 'agents', `${agentName}.md`);
  if (existsSync(flat)) return flat;
  // Try nested (e.g., storyteller/storyteller.md)
  const nested = join(SRC_DIR, module, 'agents', agentName, `${agentName}.md`);
  if (existsSync(nested)) return nested;
  return null;
}

/**
 * Universal agent validation — verifies structure, persona, and domain content.
 * Each call maps to one UAT-03-NNN check.
 */
function validateAgent(checkId, module, agentName, expectedKeywords) {
  it(`${checkId}: ${module}/${agentName} — activates with valid persona and domain content`, () => {
    // 1. Source file exists
    const agentPath = findAgentPath(module, agentName);
    expect(agentPath, `Agent file not found: ${module}/agents/${agentName}.md`).not.toBeNull();

    const content = readFile(agentPath);
    const fileSize = statSync(agentPath).size;

    // 2. Has XML <agent> tag
    expect(content, `${agentName} must have <agent tag`).toContain('<agent');
    expect(content, `${agentName} must have agent id`).toMatch(/<agent\s+id="/);

    // 3. Agent ID in v6 format (src/{module}/agents/{name})
    const agentId = extractXmlAttr(content, 'id');
    expect(agentId, `${agentName} must have id attribute`).not.toBeNull();
    expect(agentId, `${agentName} id must start with src/${module}/agents/`).toMatch(
      new RegExp(`^src/${module}/agents/`)
    );

    // 4. Has name and title attributes
    const name = extractXmlAttr(content, 'name');
    expect(name, `${agentName} must have name attribute`).not.toBeNull();
    expect(name.length).toBeGreaterThan(0);

    const title = extractXmlAttr(content, 'title');
    expect(title, `${agentName} must have title attribute`).not.toBeNull();
    expect(title.length).toBeGreaterThan(0);

    // 5. Has YAML frontmatter
    const lines = content.split('\n');
    expect(lines[0].trim(), `${agentName} must start with ---`).toBe('---');
    let fmEnd = -1;
    for (let i = 1; i < Math.min(lines.length, 30); i++) {
      if (lines[i].trim() === '---') { fmEnd = i; break; }
    }
    expect(fmEnd, `${agentName} must have closing --- frontmatter`).toBeGreaterThan(0);

    // 6. Substantial content (>200 chars, reasonable file size)
    expect(content.length, `${agentName} must have >200 chars`).toBeGreaterThan(200);
    expect(fileSize, `${agentName} file size 100B-500KB`).toBeGreaterThan(100);
    expect(fileSize).toBeLessThan(500 * 1024);

    // 7. Domain keyword presence (verifies persona is domain-appropriate)
    if (expectedKeywords && expectedKeywords.length > 0) {
      const contentLower = content.toLowerCase();
      const found = expectedKeywords.filter(kw => contentLower.includes(kw.toLowerCase()));
      expect(
        found.length,
        `${agentName} should contain at least 1 domain keyword from [${expectedKeywords.join(', ')}]`
      ).toBeGreaterThanOrEqual(1);
    }

    // 8. Command file exists (compact agent for slash invocation)
    const cmdPath = join(COMMANDS_DIR, module, 'agents', `${agentName}.md`);
    if (existsSync(cmdPath)) {
      const cmdContent = readFile(cmdPath);
      expect(cmdContent, `Command for ${agentName} must reference source`).toContain(`src/${module}/agents/`);
    }
    // Note: some agents may use nested command paths — not a failure if flat path missing
  });
}

// =============================================================================
// S1: core agents (2 checks)
// =============================================================================
describe('UAT-03-S1: core agents', () => {
  validateAgent('UAT-03-001', 'core', 'bmad-master', ['orchestrat', 'module', 'delegat', 'master']);
  validateAgent('UAT-03-002', 'core', 'abdul', ['project', 'task', 'manage', 'delegat']);
});

// =============================================================================
// S2: bmm agents (10 checks)
// =============================================================================
describe('UAT-03-S2: bmm agents', () => {
  validateAgent('UAT-03-003', 'bmm', 'analyst', ['requirement', 'business', 'analysis', 'stakeholder']);
  validateAgent('UAT-03-004', 'bmm', 'architect', ['architecture', 'design', 'system', 'pattern']);
  validateAgent('UAT-03-005', 'bmm', 'dev', ['develop', 'code', 'implement', 'function']);
  validateAgent('UAT-03-006', 'bmm', 'pm', ['project', 'plan', 'sprint', 'manage']);
  validateAgent('UAT-03-007', 'bmm', 'qa', ['test', 'quality', 'validation', 'defect']);
  validateAgent('UAT-03-008', 'bmm', 'sm', ['scrum', 'sprint', 'standup', 'retrospective']);
  validateAgent('UAT-03-009', 'bmm', 'tea', ['test', 'framework', 'automat', 'coverage']);
  validateAgent('UAT-03-010', 'bmm', 'tech-writer', ['document', 'technical', 'writing', 'guide']);
  validateAgent('UAT-03-011', 'bmm', 'ux-designer', ['design', 'user', 'experience', 'interface']);
  validateAgent('UAT-03-012', 'bmm', 'quick-flow-solo-dev', ['develop', 'full-stack', 'solo', 'build']);
});

// =============================================================================
// S3: bmb agents (3 checks)
// =============================================================================
describe('UAT-03-S3: bmb agents', () => {
  validateAgent('UAT-03-013', 'bmb', 'agent-builder', ['agent', 'build', 'creat', 'persona']);
  validateAgent('UAT-03-014', 'bmb', 'workflow-builder', ['workflow', 'build', 'creat', 'step']);
  validateAgent('UAT-03-015', 'bmb', 'module-builder', ['module', 'build', 'creat', 'structure']);
});

// =============================================================================
// S4: cybersec-team agents (15 checks)
// =============================================================================
describe('UAT-03-S4: cybersec-team agents', () => {
  validateAgent('UAT-03-016', 'cybersec-team', 'security-architect', ['security', 'architecture', 'review', 'design']);
  validateAgent('UAT-03-017', 'cybersec-team', 'penetration-tester', ['penetration', 'vulnerabilit', 'exploit', 'offensive']);
  validateAgent('UAT-03-018', 'cybersec-team', 'threat-analyst', ['threat', 'model', 'STRIDE', 'risk']);
  validateAgent('UAT-03-019', 'cybersec-team', 'compliance-guardian', ['compliance', 'SOC', 'audit', 'framework']);
  validateAgent('UAT-03-020', 'cybersec-team', 'forensic-investigator', ['forensic', 'investigat', 'evidence', 'incident']);
  validateAgent('UAT-03-021', 'cybersec-team', 'incident-commander', ['incident', 'response', 'coordinat', 'triage']);
  validateAgent('UAT-03-022', 'cybersec-team', 'soc-analyst', ['SOC', 'monitor', 'alert', 'detection']);
  validateAgent('UAT-03-023', 'cybersec-team', 'blue-team-lead', ['defensive', 'detection', 'blue team', 'protect']);
  validateAgent('UAT-03-024', 'cybersec-team', 'cloud-security-specialist', ['cloud', 'AWS', 'Azure', 'IAM']);
  validateAgent('UAT-03-025', 'cybersec-team', 'web-app-security-expert', ['web', 'XSS', 'injection', 'OWASP']);
  validateAgent('UAT-03-026', 'cybersec-team', 'api-security-expert', ['API', 'authenticat', 'endpoint', 'REST']);
  validateAgent('UAT-03-027', 'cybersec-team', 'mobile-security-expert', ['mobile', 'Android', 'iOS', 'APK']);
  validateAgent('UAT-03-028', 'cybersec-team', 'blockchain-security-expert', ['blockchain', 'smart contract', 'Web3', 'Solidity']);
  validateAgent('UAT-03-029', 'cybersec-team', 'llm-ai-security-expert', ['AI', 'LLM', 'machine learning', 'model']);
  validateAgent('UAT-03-030', 'cybersec-team', 'social-engineer', ['social engineer', 'phishing', 'pretexting', 'awareness']);
});

// =============================================================================
// S5: intel-team agents (11 checks)
// =============================================================================
describe('UAT-03-S5: intel-team agents', () => {
  validateAgent('UAT-03-031', 'intel-team', 'osint-lead', ['OSINT', 'intelligence', 'operation', 'investigat']);
  validateAgent('UAT-03-032', 'intel-team', 'social-media-analyst', ['social media', 'SOCMINT', 'profile', 'platform']);
  validateAgent('UAT-03-033', 'intel-team', 'domain-intel-specialist', ['domain', 'network', 'infrastructure', 'DNS']);
  validateAgent('UAT-03-034', 'intel-team', 'threat-actor-profiler', ['threat actor', 'APT', 'profil', 'attribution']);
  validateAgent('UAT-03-035', 'intel-team', 'corporate-intel-specialist', ['corporate', 'competitive', 'business', 'intelligence']);
  validateAgent('UAT-03-036', 'intel-team', 'dark-web-analyst', ['dark web', 'tor', 'underground', 'credential']);
  validateAgent('UAT-03-037', 'intel-team', 'sigint-specialist', ['SIGINT', 'signal', 'intercept', 'communication']);
  validateAgent('UAT-03-038', 'intel-team', 'humint-specialist', ['HUMINT', 'human', 'source', 'elicitation']);
  validateAgent('UAT-03-039', 'intel-team', 'technical-researcher', ['technical', 'research', 'vulnerabilit', 'zero-day']);
  validateAgent('UAT-03-040', 'intel-team', 'field-operative', ['field', 'surveillance', 'reconnaissance', 'physical']);
  validateAgent('UAT-03-041', 'intel-team', 'geospatial-analyst', ['geospatial', 'GEOINT', 'satellite', 'imagery']);
});

// =============================================================================
// S6: legal-team agents (13 checks)
// =============================================================================
describe('UAT-03-S6: legal-team agents', () => {
  validateAgent('UAT-03-042', 'legal-team', 'counsel', ['legal', 'counsel', 'advic', 'matter']);
  validateAgent('UAT-03-043', 'legal-team', 'covenant', ['contract', 'agreement', 'clause', 'NDA']);
  validateAgent('UAT-03-044', 'legal-team', 'advocate', ['litigation', 'dispute', 'court', 'strategy']);
  validateAgent('UAT-03-045', 'legal-team', 'liberty', ['US', 'American', 'federal', 'state law']);
  validateAgent('UAT-03-046', 'legal-team', 'europa', ['EU', 'GDPR', 'European', 'regulation']);
  validateAgent('UAT-03-047', 'legal-team', 'charter', ['corporate', 'governance', 'board', 'compliance']);
  validateAgent('UAT-03-048', 'legal-team', 'insignia', ['intellectual property', 'trademark', 'patent', 'copyright']);
  validateAgent('UAT-03-049', 'legal-team', 'deed', ['real estate', 'property', 'lease', 'commercial']);
  validateAgent('UAT-03-050', 'legal-team', 'tribute', ['tax', 'fiscal', 'international', 'jurisdiction']);
  validateAgent('UAT-03-051', 'legal-team', 'iberia', ['Spain', 'Spanish', 'civil', 'derecho']);
  validateAgent('UAT-03-052', 'legal-team', 'castile', ['Spain', 'Spanish', 'corporate', 'sociedad']);
  validateAgent('UAT-03-053', 'legal-team', 'gremio', ['Spain', 'Spanish', 'labor', 'employment']);
  validateAgent('UAT-03-054', 'legal-team', 'baltic', ['Estonia', 'e-residency', 'digital', 'Nordic']);
});

// =============================================================================
// S7: strategy-team agents (14 checks)
// =============================================================================
describe('UAT-03-S7: strategy-team agents', () => {
  validateAgent('UAT-03-055', 'strategy-team', 'the-master-strategist', ['strateg', 'competitive', 'analysis', 'market']);
  validateAgent('UAT-03-056', 'strategy-team', 'debate-coach', ['debate', 'argument', 'rhetoric', 'persuasi']);
  validateAgent('UAT-03-057', 'strategy-team', 'communications-director', ['communicat', 'message', 'media', 'crisis']);
  validateAgent('UAT-03-058', 'strategy-team', 'stakeholder-mediator', ['mediat', 'stakeholder', 'conflict', 'negotiat']);
  validateAgent('UAT-03-059', 'strategy-team', 'ethics-advisor', ['ethic', 'moral', 'principle', 'dilemma']);
  validateAgent('UAT-03-060', 'strategy-team', 'policy-analyst', ['policy', 'regulat', 'impact', 'analysis']);
  validateAgent('UAT-03-061', 'strategy-team', 'political-strategist', ['politic', 'power', 'influence', 'stakeholder']);
  validateAgent('UAT-03-062', 'strategy-team', 'the-conservative', ['conservat', 'tradition', 'stability', 'caution']);
  validateAgent('UAT-03-063', 'strategy-team', 'the-revolutionary', ['revolution', 'disrupt', 'challeng', 'transform']);
  validateAgent('UAT-03-064', 'strategy-team', 'the-realist', ['realist', 'pragmat', 'practical', 'feasib']);
  validateAgent('UAT-03-065', 'strategy-team', 'the-principled-commander', ['command', 'leadership', 'principl', 'decisive']);
  validateAgent('UAT-03-066', 'strategy-team', 'the-technocrat', ['technolog', 'data', 'efficien', 'system']);
  validateAgent('UAT-03-067', 'strategy-team', 'the-liberator', ['empower', 'liber', 'autonomy', 'freedom']);
  validateAgent('UAT-03-068', 'strategy-team', 'the-strategist-warrior', ['warfare', 'strateg', 'tactical', 'offensive']);
});

// =============================================================================
// S8: bmgd agents (6 checks)
// =============================================================================
describe('UAT-03-S8: bmgd agents', () => {
  validateAgent('UAT-03-069', 'bmgd', 'game-designer', ['game', 'design', 'mechanic', 'gameplay']);
  validateAgent('UAT-03-070', 'bmgd', 'game-dev', ['game', 'develop', 'implement', 'engine']);
  validateAgent('UAT-03-071', 'bmgd', 'game-architect', ['game', 'architect', 'ECS', 'system']);
  validateAgent('UAT-03-072', 'bmgd', 'game-qa', ['game', 'test', 'quality', 'bug']);
  validateAgent('UAT-03-073', 'bmgd', 'game-scrum-master', ['game', 'sprint', 'scrum', 'agile']);
  validateAgent('UAT-03-074', 'bmgd', 'game-solo-dev', ['game', 'solo', 'develop', 'prototype']);
});

// =============================================================================
// S9: cis agents (6 checks)
// =============================================================================
describe('UAT-03-S9: cis agents', () => {
  validateAgent('UAT-03-075', 'cis', 'brainstorming-coach', ['brainstorm', 'ideation', 'creativity', 'facilitat']);
  validateAgent('UAT-03-076', 'cis', 'storyteller', ['story', 'narrative', 'audience', 'compelling']);
  validateAgent('UAT-03-077', 'cis', 'creative-problem-solver', ['creative', 'problem', 'solution', 'innovat']);
  validateAgent('UAT-03-078', 'cis', 'design-thinking-coach', ['design thinking', 'empathize', 'prototype', 'iterate']);
  validateAgent('UAT-03-079', 'cis', 'innovation-strategist', ['innovat', 'disrupt', 'strategy', 'market']);
  validateAgent('UAT-03-080', 'cis', 'presentation-master', ['presentation', 'slide', 'audience', 'visual']);
});

// =============================================================================
// Cross-cutting: Aggregate Validation
// =============================================================================
describe('UAT-03 Aggregate Validation', () => {

  it('total agent count is exactly 80 across all 9 modules', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const expected = { core: 2, bmm: 10, bmb: 3, bmgd: 6, cis: 6, 'cybersec-team': 15, 'intel-team': 11, 'legal-team': 13, 'strategy-team': 14 };

    let total = 0;
    for (const mod of modules) {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      let count = 0;
      if (existsSync(agentsDir)) {
        for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
          if (entry.name.endsWith('.md') && entry.isFile()) {
            count++;
          } else if (entry.isDirectory()) {
            const subDir = join(agentsDir, entry.name);
            for (const sub of readdirSync(subDir)) {
              if (sub.endsWith('.md')) count++;
            }
          }
        }
      }
      expect(count, `${mod} agent count`).toBe(expected[mod]);
      total += count;
    }
    expect(total).toBe(80);
  });

  it('agent manifest CSV has 80 entries matching filesystem', () => {
    const content = readFile(MANIFEST_PATH);
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('"id"') && !l.startsWith('id'));
    // Filter out header line
    const dataLines = lines.filter(l => l.includes('src/'));
    expect(dataLines.length).toBe(80);
  });

  it('every agent has a unique id across all modules', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const ids = new Set();
    const duplicates = [];

    for (const mod of modules) {
      const agentsDir = join(SRC_DIR, mod, 'agents');
      if (!existsSync(agentsDir)) continue;

      function scanDir(dir) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.name.endsWith('.md') && entry.isFile()) {
            const content = readFile(join(dir, entry.name));
            const id = extractXmlAttr(content, 'id');
            if (id) {
              if (ids.has(id)) duplicates.push(id);
              ids.add(id);
            }
          } else if (entry.isDirectory()) {
            scanDir(join(dir, entry.name));
          }
        }
      }
      scanDir(agentsDir);
    }

    expect(duplicates, `Duplicate agent ids: ${duplicates.join(', ')}`).toHaveLength(0);
    expect(ids.size).toBe(80);
  });
});
