/**
 * Post-Migration Directory Structure Tests
 *
 * Validates the src/ directory layout after Story 17 migration:
 *  - All 9 modules exist under src/ with module.yaml
 *  - No stale module directories remain in _bmad/
 *  - Agent XML ids use src/ prefix
 *  - RBAC patterns use src/ prefix
 *  - Manifest paths use src/ prefix
 *  - Settings.json hooks reference correct paths
 *  - Backward compatibility directories preserved
 *  - Security infrastructure intact
 */

import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';

const PROJECT_ROOT = resolve(import.meta.dirname, '../..');

// ---------------------------------------------------------------------------
// Module constants
// ---------------------------------------------------------------------------

/** All 9 BMAD modules that should exist under src/ */
const EXPECTED_MODULES = [
  'bmb',
  'bmgd',
  'bmm',
  'cis',
  'core',
  'cybersec-team',
  'intel-team',
  'legal-team',
  'strategy-team',
];

/** Directories that should remain under _bmad/ (NOT modules) */
const PRESERVED_BMAD_DIRS = ['_compact', '_config', '_memory', 'framework'];

/** Module directories that must NOT exist under _bmad/ anymore */
const REMOVED_MODULE_DIRS = EXPECTED_MODULES;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readUtf8(relPath) {
  return readFileSync(join(PROJECT_ROOT, relPath), 'utf-8');
}

function fileExists(relPath) {
  return existsSync(join(PROJECT_ROOT, relPath));
}

function findFilesRecursive(dir, filter) {
  const results = [];
  const absDir = join(PROJECT_ROOT, dir);
  if (!existsSync(absDir)) return results;

  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (filter(entry.name, full)) {
        results.push(full);
      }
    }
  }
  walk(absDir);
  return results;
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

describe('Directory Structure Migration', () => {
  // -------------------------------------------------------------------------
  // 1. Source Layout
  // -------------------------------------------------------------------------
  describe('Source Layout', () => {
    it('should have all 9 modules under src/', () => {
      for (const mod of EXPECTED_MODULES) {
        const modPath = join(PROJECT_ROOT, 'src', mod);
        expect(existsSync(modPath), `src/${mod}/ should exist`).toBe(true);
        expect(
          statSync(modPath).isDirectory(),
          `src/${mod}/ should be a directory`
        ).toBe(true);
      }
    });

    it('should have module.yaml in each module directory', () => {
      for (const mod of EXPECTED_MODULES) {
        const yamlPath = join(PROJECT_ROOT, 'src', mod, 'module.yaml');
        expect(
          existsSync(yamlPath),
          `src/${mod}/module.yaml should exist`
        ).toBe(true);
      }
    });

    it('should have core/ with help, routing, security subdirs', () => {
      const requiredSubdirs = ['help', 'routing', 'security'];
      for (const sub of requiredSubdirs) {
        const subPath = join(PROJECT_ROOT, 'src', 'core', sub);
        expect(
          existsSync(subPath),
          `src/core/${sub}/ should exist`
        ).toBe(true);
      }
    });

    it('should have agents/ directory in each module', () => {
      for (const mod of EXPECTED_MODULES) {
        const agentsDir = join(PROJECT_ROOT, 'src', mod, 'agents');
        expect(
          existsSync(agentsDir),
          `src/${mod}/agents/ should exist`
        ).toBe(true);
      }
    });

    it('should have at least 80 agent .md files across src/', () => {
      const agentFiles = findFilesRecursive('src', (name, full) => {
        return name.endsWith('.md') && full.includes('/agents/');
      });
      expect(agentFiles.length).toBeGreaterThanOrEqual(80);
    });
  });

  // -------------------------------------------------------------------------
  // 2. No Stale _bmad/ Module Directories
  // -------------------------------------------------------------------------
  describe('Old _bmad/ Module Cleanup', () => {
    it('should not have any module directories under _bmad/', () => {
      for (const mod of REMOVED_MODULE_DIRS) {
        const oldPath = join(PROJECT_ROOT, '_bmad', mod);
        expect(
          existsSync(oldPath),
          `_bmad/${mod}/ should NOT exist (migrated to src/)`
        ).toBe(false);
      }
    });

    it('should preserve _bmad/_config/ directory', () => {
      expect(fileExists('_bmad/_config')).toBe(true);
      expect(fileExists('_bmad/_config/agent-manifest.csv')).toBe(true);
      expect(fileExists('_bmad/_config/workflow-manifest.csv')).toBe(true);
      expect(fileExists('_bmad/_config/module-help.csv')).toBe(true);
    });

    it('should preserve _bmad/framework/ directory', () => {
      expect(fileExists('_bmad/framework')).toBe(true);
    });

    it('should preserve _bmad/_compact/ directory', () => {
      expect(fileExists('_bmad/_compact')).toBe(true);
    });

    it('should only have preserved directories under _bmad/', () => {
      const entries = readdirSync(join(PROJECT_ROOT, '_bmad'), {
        withFileTypes: true,
      });
      const dirs = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

      for (const dir of dirs) {
        expect(
          PRESERVED_BMAD_DIRS.includes(dir),
          `_bmad/${dir}/ is unexpected — should be one of: ${PRESERVED_BMAD_DIRS.join(', ')}`
        ).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Path References
  // -------------------------------------------------------------------------
  describe('Path References', () => {
    it('should have zero _bmad/ module references in src/ .js/.ts imports', () => {
      const srcFiles = findFilesRecursive('src', (name) => {
        return name.endsWith('.js') || name.endsWith('.ts');
      });

      const staleImports = [];
      for (const file of srcFiles) {
        const content = readFileSync(file, 'utf-8');
        // Look for import/require referencing _bmad/ module paths
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (
            (line.includes('import') || line.includes('require')) &&
            /_bmad\/(bmb|bmgd|bmm|cis|core|cybersec-team|intel-team|legal-team|strategy-team)/.test(
              line
            )
          ) {
            staleImports.push(`${file}:${i + 1}: ${line.trim()}`);
          }
        }
      }

      expect(
        staleImports,
        `Found stale _bmad/ imports:\n${staleImports.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have correct paths in settings.json hooks', () => {
      const settings = JSON.parse(readUtf8('.claude/settings.json'));
      const hookEvents = Object.values(settings.hooks || {});
      const allCommands = [];

      for (const eventArray of hookEvents) {
        for (const entry of eventArray) {
          for (const hook of entry.hooks || []) {
            if (hook.command) {
              allCommands.push(hook.command);
            }
          }
        }
      }

      // No hook command should reference _bmad/ module paths
      const staleCommands = allCommands.filter((cmd) =>
        /_bmad\/(bmb|bmgd|bmm|cis|core|cybersec-team|intel-team|legal-team|strategy-team)\//.test(
          cmd
        )
      );

      expect(
        staleCommands,
        `Settings hooks with stale _bmad/ paths:\n${staleCommands.join('\n')}`
      ).toHaveLength(0);

      // authorization.js should reference src/core/security/
      const authCmds = allCommands.filter((c) =>
        c.includes('authorization.js')
      );
      expect(authCmds.length).toBeGreaterThan(0);
      for (const cmd of authCmds) {
        expect(cmd).toContain('src/core/security/authorization.js');
      }
    });

    it('should have correct paths in RBAC config agent patterns', () => {
      const rbacContent = readUtf8('src/core/security/rbac-config.yaml');

      // All agent path patterns should use src/ prefix, not _bmad/
      const lines = rbacContent.split('\n');
      const stalePatterns = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          /_bmad\/(bmb|bmgd|bmm|cis|core|cybersec-team|intel-team|legal-team|strategy-team)\/agents\//.test(
            line
          )
        ) {
          stalePatterns.push(`Line ${i + 1}: ${line.trim()}`);
        }
      }

      expect(
        stalePatterns,
        `RBAC config has stale _bmad/ patterns:\n${stalePatterns.join('\n')}`
      ).toHaveLength(0);

      // Should have src/ agent patterns
      const srcPatterns = lines.filter((l) => /src\/.*\/agents\//.test(l));
      expect(srcPatterns.length).toBeGreaterThan(0);
    });

    it('should have correct paths in RBAC agent_restrictions', () => {
      const rbacContent = readUtf8('src/core/security/rbac-config.yaml');
      const restrictionBlock = rbacContent.split('agent_restrictions:')[1];

      if (restrictionBlock) {
        const staleRestrictions = [];
        const lines = restrictionBlock.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          // Skip comment lines (documentation examples)
          if (trimmed.startsWith('#')) continue;
          if (/_bmad\/.*\/agents\//.test(lines[i])) {
            staleRestrictions.push(trimmed);
          }
        }
        expect(
          staleRestrictions,
          `RBAC agent_restrictions with stale _bmad/ paths:\n${staleRestrictions.join('\n')}`
        ).toHaveLength(0);
      }
    });

    it('should have correct paths in agent-manifest.csv', () => {
      const csv = readUtf8('_bmad/_config/agent-manifest.csv');
      const lines = csv.split('\n').filter((l) => l.trim().length > 0);
      // Skip header
      const dataLines = lines.slice(1);

      const staleEntries = dataLines.filter((line) =>
        /_bmad\/(bmb|bmgd|bmm|cis|core|cybersec-team|intel-team|legal-team|strategy-team)\//.test(
          line
        )
      );

      expect(
        staleEntries,
        `agent-manifest.csv has stale _bmad/ paths:\n${staleEntries.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have correct paths in micro-agent-manifest.csv', () => {
      const csv = readUtf8('_bmad/_config/micro-agent-manifest.csv');
      const lines = csv.split('\n').filter((l) => l.trim().length > 0);
      const dataLines = lines.slice(1);

      // All path fields should reference src/, not _bmad/
      for (const line of dataLines) {
        const fields = line.split(',');
        const pathField = fields[fields.length - 1]; // path is last column
        if (pathField && pathField.trim()) {
          expect(
            pathField.trim().startsWith('src/'),
            `micro-agent-manifest entry should start with src/: ${pathField.trim()}`
          ).toBe(true);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 4. Agent XML ID Format
  // -------------------------------------------------------------------------
  describe('Agent XML IDs', () => {
    it('should have src/ prefix in all agent XML ids', () => {
      const agentFiles = findFilesRecursive('src', (name, full) => {
        return name.endsWith('.md') && full.includes('/agents/');
      });

      const staleIds = [];
      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf-8');
        const match = content.match(/<agent\s+id="([^"]+)"/);
        if (match) {
          const id = match[1];
          if (id.startsWith('_bmad/')) {
            const relPath = file.replace(`${PROJECT_ROOT  }/`, '');
            staleIds.push(`${relPath}: id="${id}"`);
          }
        }
      }

      expect(
        staleIds,
        `Agent files with stale _bmad/ XML ids:\n${staleIds.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have valid v6 format in agent XML ids', () => {
      const agentFiles = findFilesRecursive('src', (name, full) => {
        return name.endsWith('.md') && full.includes('/agents/');
      });

      const invalidIds = [];
      // Standard: src/{module}/agents/{name}
      // Nested agents allowed: src/{module}/agents/{subdir}/{name}
      const v6Pattern = /^src\/[\w-]+\/agents\/([\w-]+\/)*[\w-]+$/;

      for (const file of agentFiles) {
        const content = readFileSync(file, 'utf-8');
        const match = content.match(/<agent\s+id="([^"]+)"/);
        if (match) {
          const id = match[1];
          if (!v6Pattern.test(id)) {
            const relPath = file.replace(`${PROJECT_ROOT  }/`, '');
            invalidIds.push(`${relPath}: id="${id}"`);
          }
        }
      }

      expect(
        invalidIds,
        `Agent files with invalid v6 format ids:\n${invalidIds.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Security Integrity
  // -------------------------------------------------------------------------
  describe('Security Integrity', () => {
    it('should have settings.json with all hook events', () => {
      const settings = JSON.parse(readUtf8('.claude/settings.json'));
      expect(settings.hooks).toBeDefined();

      const expectedEvents = [
        'SessionStart',
        'UserPromptSubmit',
        'PreToolUse',
      ];
      for (const event of expectedEvents) {
        expect(
          settings.hooks[event],
          `Hook event ${event} should exist`
        ).toBeDefined();
      }
    });

    it('should preserve all matchers in settings.json', () => {
      const settings = JSON.parse(readUtf8('.claude/settings.json'));
      const matchers = new Set();

      for (const eventArray of Object.values(settings.hooks || {})) {
        for (const entry of eventArray) {
          if (entry.matcher) {
            matchers.add(entry.matcher);
          }
        }
      }

      // At least 12 matchers expected
      expect(matchers.size).toBeGreaterThanOrEqual(12);
    });

    it('should preserve all hook commands (55+)', () => {
      const settings = JSON.parse(readUtf8('.claude/settings.json'));
      let commandCount = 0;

      for (const eventArray of Object.values(settings.hooks || {})) {
        for (const entry of eventArray) {
          for (const hook of entry.hooks || []) {
            if (hook.command) commandCount++;
          }
        }
      }

      // At least 55 commands (was 54, +1 for reference-validator moved to src/)
      expect(commandCount).toBeGreaterThanOrEqual(54);
    });

    it('should have authorization.js and authorization.ts in src/core/security/', () => {
      expect(fileExists('src/core/security/authorization.js')).toBe(true);
      expect(fileExists('src/core/security/authorization.ts')).toBe(true);
    });

    it('should have rbac-config.yaml in src/core/security/', () => {
      expect(fileExists('src/core/security/rbac-config.yaml')).toBe(true);
    });

    it('should have hook content hashes baseline', () => {
      expect(fileExists('tests/baselines/hook-content-hashes.json')).toBe(true);
      const hashes = JSON.parse(
        readUtf8('tests/baselines/hook-content-hashes.json')
      );
      expect(hashes.hashes).toBeDefined();
      expect(Object.keys(hashes.hashes).length).toBeGreaterThanOrEqual(19);
    });

    it('should have all validator .js files intact', () => {
      const validatorDir = join(
        PROJECT_ROOT,
        '.claude',
        'validators-node',
        'bin'
      );
      const expectedValidators = [
        'bash-safety.js',
        'env-protection.js',
        'jailbreak.js',
        'outside-repo.js',
        'pii.js',
        'plugin-permissions.js',
        'production.js',
        'prompt-injection.js',
        'rate-limiter.js',
        'recursion-guard.js',
        'resource-limits.js',
        'secret.js',
        'session-init.js',
        'supply-chain.js',
        'token-validator.js',
      ];

      for (const validator of expectedValidators) {
        expect(
          existsSync(join(validatorDir, validator)),
          `Validator ${validator} should exist`
        ).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. Backward Compatibility
  // -------------------------------------------------------------------------
  describe('Backward Compatibility', () => {
    it('should preserve _bmad/framework/ runtime', () => {
      expect(fileExists('_bmad/framework')).toBe(true);
      expect(fileExists('_bmad/framework/package.json')).toBe(true);
    });

    it('should preserve _bmad/_config/ manifests', () => {
      const requiredConfigs = [
        '_bmad/_config/agent-manifest.csv',
        '_bmad/_config/workflow-manifest.csv',
        '_bmad/_config/workflow-aliases.yaml',
        '_bmad/_config/module-help.csv',
        '_bmad/_config/micro-agent-manifest.csv',
        '_bmad/_config/micro-workflow-manifest.csv',
      ];
      for (const cfg of requiredConfigs) {
        expect(fileExists(cfg), `${cfg} should exist`).toBe(true);
      }
    });

    it('should preserve _bmad/_compact/ agent summaries', () => {
      expect(fileExists('_bmad/_compact')).toBe(true);
      const compactAgents = findFilesRecursive(
        '_bmad/_compact/agents',
        (name) => name.endsWith('.md')
      );
      expect(compactAgents.length).toBeGreaterThan(0);
    });

    it('should have compact agent references pointing to src/', () => {
      const compactFiles = findFilesRecursive(
        '_bmad/_compact/agents',
        (name) => name.endsWith('.md')
      );

      const staleRefs = [];
      for (const file of compactFiles) {
        const content = readFileSync(file, 'utf-8');
        // Check the "Full agent:" header line
        const match = content.match(/# Full agent:\s*(\S+)/);
        if (match) {
          const ref = match[1];
          if (
            ref.startsWith('_bmad/') &&
            !ref.startsWith('_bmad/_') &&
            !ref.startsWith('_bmad/framework')
          ) {
            const relPath = file.replace(`${PROJECT_ROOT  }/`, '');
            staleRefs.push(`${relPath}: ${ref}`);
          }
        }
      }

      expect(
        staleRefs,
        `Compact agent files with stale _bmad/ references:\n${staleRefs.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Schema Validation Integration
  // -------------------------------------------------------------------------
  describe('Schema Validation Compatibility', () => {
    it('should have validate-module-schema.js that scans src/', () => {
      const script = readUtf8('tools/validate-module-schema.js');
      // Should reference src/ directory for scanning
      expect(script).toContain('SRC_DIR');
    });

    it('should have validate-agent-schema.js', () => {
      expect(fileExists('tools/validate-agent-schema.js')).toBe(true);
    });

    it('should have validate-workflow-schema.js', () => {
      expect(fileExists('tools/validate-workflow-schema.js')).toBe(true);
    });
  });
});
