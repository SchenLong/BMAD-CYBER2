/**
 * SA-02-S3: Agent Content Security Review Tests
 *
 * Validates all 80 agents have security rules, no secrets,
 * no injection vectors, and correct ID format.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, relative, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(import.meta.dirname, '../..');

// Collect all agent files
function getAllAgentFiles() {
  const agents = [];
  const srcDir = join(ROOT, 'src');
  for (const mod of readdirSync(srcDir)) {
    const agentsDir = join(srcDir, mod, 'agents');
    if (!existsSync(agentsDir)) continue;
    const files = readdirSync(agentsDir, { recursive: true });
    for (const f of files) {
      if (typeof f === 'string' && f.endsWith('.md')) {
        agents.push(join(agentsDir, f));
      }
    }
  }
  return agents;
}

describe('SA-02-S3: Agent Content Security Review', () => {
  const agentFiles = getAllAgentFiles();

  // ── Check 1: L8 Rule (Prompt Injection Protection) ──────────────────
  describe('Check 1: L8 Rule — Prompt Injection Protection', () => {
    it('found 80 agent files', () => {
      expect(agentFiles.length).toBe(80);
    });

    it('80/80 agents contain PROMPT INJECTION PROTECTION', () => {
      let pass = 0;
      const failures = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        if (content.includes('PROMPT INJECTION PROTECTION')) {
          pass++;
        } else {
          failures.push(relative(ROOT, file));
        }
      }
      expect(failures).toEqual([]);
      expect(pass).toBe(80);
    });
  });

  // ── Check 2: L9 Rule (External Content Manipulation) ───────────────
  describe('Check 2: L9 Rule — External Content Manipulation Protection', () => {
    it('80/80 agents contain EXTERNAL CONTENT MANIPULATION PROTECTION', () => {
      let pass = 0;
      const failures = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        if (content.includes('EXTERNAL CONTENT MANIPULATION PROTECTION')) {
          pass++;
        } else {
          failures.push(relative(ROOT, file));
        }
      }
      expect(failures).toEqual([]);
      expect(pass).toBe(80);
    });
  });

  // ── Check 3: Secret Scan ───────────────────────────────────────────
  describe('Check 3: Secret Scan', () => {
    const secretPatterns = [
      { name: 'AWS key', pattern: /AKIA[A-Z0-9]{16}/ },
      { name: 'GitHub PAT', pattern: /ghp_[a-zA-Z0-9]{36}/ },
      { name: 'MongoDB URI', pattern: /mongodb:\/\/[^\s]+@/ },
      { name: 'Postgres URI', pattern: /postgres:\/\/[^\s]+@/ },
    ];

    for (const { name, pattern } of secretPatterns) {
      it(`0 ${name} patterns in agent files`, () => {
        const matches = [];
        for (const file of agentFiles) {
          const content = readFileSync(file, 'utf8');
          if (pattern.test(content)) {
            matches.push(relative(ROOT, file));
          }
        }
        expect(matches).toEqual([]);
      });
    }
  });

  // ── Check 4: Injection Vectors ─────────────────────────────────────
  describe('Check 4: Injection Vectors in Agent Files', () => {
    it('0 command substitution $() in agent files', () => {
      const matches = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        // Look for actual $() command substitution, not documentation
        if (/\$\([^)]*\)/.test(content)) {
          // Check if it's inside a code block (markdown) or part of documentation
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/\$\([^)]*\)/.test(line) && !line.trimStart().startsWith('`') && !line.includes('```')) {
              matches.push(`${relative(ROOT, file)}:${i + 1}`);
            }
          }
        }
      }
      expect(matches).toEqual([]);
    });

    it('0 external URLs (http/https) in agent files', () => {
      const matches = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        // Look for external URLs but exclude the known hook invocation patterns
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/https?:\/\//.test(line) && !line.includes('agentvibes.org') && !line.includes('github.com/paulpreibisch')) {
            matches.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim().substring(0, 80)}`);
          }
        }
      }
      expect(matches).toEqual([]);
    });

    it('0 path traversal (../) in agent files', () => {
      const matches = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        if (content.includes('../')) {
          matches.push(relative(ROOT, file));
        }
      }
      expect(matches).toEqual([]);
    });
  });

  // ── Check 5: Agent ID Format ───────────────────────────────────────
  describe('Check 5: Agent ID Format', () => {
    it('all agent XML ids match src/{module}/agents/{name} format', () => {
      const mismatches = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        const idMatch = content.match(/<agent\s+id="([^"]+)"/);
        if (!idMatch) {
          mismatches.push(`${relative(ROOT, file)}: no agent id found`);
          continue;
        }
        const id = idMatch[1];
        if (!id.startsWith('src/') || !id.includes('/agents/')) {
          mismatches.push(`${relative(ROOT, file)}: id="${id}" does not match format`);
        }
      }
      expect(mismatches).toEqual([]);
    });

    it('agent IDs match agent-manifest.csv', () => {
      const manifestPath = join(ROOT, '_bmad/_config/agent-manifest.csv');
      const csv = readFileSync(manifestPath, 'utf8');
      // CSV uses quoted fields — extract first quoted value from each row
      const csvIds = new Set(
        csv.split('\n').slice(1).filter(l => l.trim()).map(l => {
          const match = l.match(/^"([^"]+)"/);
          return match ? match[1] : l.split(',')[0];
        })
      );

      const mismatches = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf8');
        const idMatch = content.match(/<agent\s+id="([^"]+)"/);
        if (idMatch && !csvIds.has(idMatch[1])) {
          mismatches.push(`${relative(ROOT, file)}: id="${idMatch[1]}" not in manifest`);
        }
      }
      expect(mismatches).toEqual([]);
    });
  });

  // ── Check 6: Abdul References ──────────────────────────────────────
  describe('Check 6: Abdul Orchestrator References', () => {
    it('abdul.md exists', () => {
      expect(existsSync(join(ROOT, 'src/core/agents/abdul.md'))).toBe(true);
    });

    it('all cross-module trigger agents exist', () => {
      const content = readFileSync(join(ROOT, 'src/core/agents/abdul.md'), 'utf8');
      const expectedAgents = [
        'src/cybersec-team/agents/security-architect.md',
        'src/cybersec-team/agents/threat-analyst.md',
        'src/cybersec-team/agents/penetration-tester.md',
        'src/cybersec-team/agents/compliance-guardian.md',
        'src/legal-team/agents/counsel.md',
        'src/legal-team/agents/europa.md',
        'src/strategy-team/agents/the-master-strategist.md',
        'src/strategy-team/agents/political-strategist.md',
        'src/strategy-team/agents/ethics-advisor.md',
        'src/intel-team/agents/osint-lead.md',
        'src/intel-team/agents/threat-actor-profiler.md',
        'src/intel-team/agents/dark-web-analyst.md',
      ];
      const missing = expectedAgents.filter(a => !existsSync(join(ROOT, a)));
      expect(missing).toEqual([]);
    });
  });
});
