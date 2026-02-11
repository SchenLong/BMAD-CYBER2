/**
 * Agent ID Migration Tests - Story 12: Agent ID Standardization
 *
 * Validates that agent IDs have been fully migrated to v6 format across:
 * 1. Agent .md files (XML id attributes)
 * 2. Agent manifest CSV (id column)
 * 3. RBAC configuration (patterns and restrictions)
 * 4. Path normalization in AuthorizationManager
 *
 * Imports the ESM TypeScript version (authorization.ts) which Vitest handles
 * natively. The CJS version (authorization.js) has identical logic.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AuthorizationManager,
  agentPathResolver,
} from '../../src/core/security/authorization.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract the clean value from a YAML list item line like:
 *   - "*"                           # comment
 *   - "src/module/agents/*"        # comment
 * Handles quoted strings, inline comments, and bare values.
 */
function extractYamlListValue(trimmedLine) {
  let value = trimmedLine.slice(2).trim(); // Remove "- " prefix

  // Quoted string: extract content between quotes, ignore everything after
  if (value.startsWith('"')) {
    const closeQuote = value.indexOf('"', 1);
    if (closeQuote > 0) {
      return value.slice(1, closeQuote);
    }
  }
  if (value.startsWith("'")) {
    const closeQuote = value.indexOf("'", 1);
    if (closeQuote > 0) {
      return value.slice(1, closeQuote);
    }
  }

  // Unquoted: strip inline comment
  const commentIdx = value.indexOf('#');
  if (commentIdx > 0) {
    value = value.slice(0, commentIdx).trim();
  }
  return value;
}

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
const BMAD_DIR = path.join(PROJECT_ROOT, '_bmad');
const RBAC_CONFIG_PATH = path.join(PROJECT_ROOT, 'src', 'core', 'security', 'rbac-config.yaml');
const MANIFEST_PATH = path.join(BMAD_DIR, '_config', 'agent-manifest.csv');

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

/** Known phantom agents that were removed from RBAC config. */
const PHANTOM_AGENTS = [
  'appsec-engineer',
  'devsecops-engineer',
  'red-team-operator',
  'grc-specialist',
];

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
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Get all agent files from the filesystem.
 */
function getFilesystemAgents() {
  const agents = [];
  for (const moduleName of AGENT_MODULES) {
    const agentsDir = path.join(PROJECT_ROOT, 'src', moduleName, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    const mdFiles = findMdFiles(agentsDir);
    for (const filePath of mdFiles) {
      const relPath = path.relative(agentsDir, filePath);
      const parts = relPath.split(path.sep);
      let agentName;
      if (parts.length === 1) {
        agentName = parts[0].replace(/\.md$/, '');
      } else {
        // Nested agents like storyteller/storyteller.md
        agentName = parts[0];
      }
      agents.push({
        module: moduleName,
        agentName,
        filePath,
        v6Id: `src/${moduleName}/agents/${agentName}`,
        legacyId: `${moduleName}/${agentName}`,
      });
    }
  }
  return agents;
}

/**
 * Parse agent-manifest.csv into structured rows.
 */
function parseManifestCsv() {
  const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());
  const header = lines[0];
  const headerCols = header.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const idIdx = headerCols.indexOf('id');
  const moduleIdx = headerCols.indexOf('module');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // CSV with quoted fields - simple parse for known format
    const matches = [];
    const regex = /"([^"]*)"/g;
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      matches.push(match[1]);
    }
    if (matches.length > Math.max(idIdx, moduleIdx)) {
      rows.push({
        id: matches[idIdx],
        module: matches[moduleIdx],
        raw: lines[i],
      });
    }
  }
  return rows;
}

/**
 * Extract the XML agent id attribute from an agent .md file.
 */
function extractXmlAgentId(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const idMatch = content.match(/<agent\s+id="([^"]+)"/);
  return idMatch ? idMatch[1] : null;
}

// ============================================================================
// Test Data
// ============================================================================

let filesystemAgents;
let manifestRows;
let rbacContent;
let manager;

// ============================================================================
// Tests
// ============================================================================

describe('Agent ID Migration - Story 12', () => {
  beforeAll(() => {
    filesystemAgents = getFilesystemAgents();
    manifestRows = parseManifestCsv();
    rbacContent = fs.readFileSync(RBAC_CONFIG_PATH, 'utf-8');
    manager = new AuthorizationManager(RBAC_CONFIG_PATH);
  });

  // --------------------------------------------------------------------------
  // 1. Agent ID Format Validation
  // --------------------------------------------------------------------------
  describe('Agent ID Format Validation', () => {
    it('should have XML id attribute in v6 format for all 80 agent .md files', () => {
      const v6Pattern = /^src\/[a-z][a-z0-9-]*\/agents\/[a-z][a-z0-9-]*/;
      const failures = [];

      for (const agent of filesystemAgents) {
        const xmlId = extractXmlAgentId(agent.filePath);
        if (!xmlId) {
          failures.push(
            `${path.relative(PROJECT_ROOT, agent.filePath)}: missing XML id attribute`
          );
        } else if (!v6Pattern.test(xmlId)) {
          failures.push(
            `${path.relative(PROJECT_ROOT, agent.filePath)}: id="${xmlId}" is not v6 format`
          );
        }
      }

      expect(
        failures,
        `Agent files with non-v6 XML id attributes:\n${failures.join('\n')}`
      ).toHaveLength(0);
      // Verify we actually checked all 80 agents
      expect(filesystemAgents.length).toBe(80);
    });

    it('should have agent-manifest.csv id column with v6 format values', () => {
      const v6Pattern = /^src\/[a-z][a-z0-9-]*\/agents\/[a-z][a-z0-9-]*/;
      const failures = [];

      for (const row of manifestRows) {
        if (!v6Pattern.test(row.id)) {
          failures.push(`Manifest id="${row.id}" is not v6 format`);
        }
      }

      expect(
        failures,
        `Manifest entries with non-v6 id values:\n${failures.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have no old format agent IDs (name.agent.yaml or name.agent.md) in XML', () => {
      const oldPatterns = [/\.agent\.yaml/, /\.agent\.md/];
      const failures = [];

      for (const agent of filesystemAgents) {
        const xmlId = extractXmlAgentId(agent.filePath);
        if (xmlId) {
          for (const pattern of oldPatterns) {
            if (pattern.test(xmlId)) {
              failures.push(
                `${path.relative(PROJECT_ROOT, agent.filePath)}: id="${xmlId}" uses old format`
              );
            }
          }
        }
      }

      expect(
        failures,
        `Agent files with old-format XML ids:\n${failures.join('\n')}`
      ).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. RBAC V6 Format Tests
  // --------------------------------------------------------------------------
  describe('RBAC V6 Format', () => {
    it('should have no legacy-format agent patterns without src/ prefix in rbac-config.yaml', () => {
      // Extract all agent permission lines from RBAC config
      // Legacy format would be: "module/agent" without src/ prefix
      // Valid patterns: "src/module/agents/*", "src/module/agents/name", "*"
      const agentLines = [];
      const lines = rbacContent.split('\n');
      let inAgentSection = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'agents:') {
          inAgentSection = true;
          continue;
        }
        if (inAgentSection && trimmed.startsWith('- ')) {
          agentLines.push(extractYamlListValue(trimmed));
        }
        // Exit agent section on next key that is not a list item or comment
        if (
          inAgentSection &&
          !trimmed.startsWith('- ') &&
          !trimmed.startsWith('#') &&
          trimmed !== '' &&
          trimmed !== 'agents:'
        ) {
          inAgentSection = false;
        }
      }

      const legacyPatterns = agentLines.filter((p) => {
        if (p === '*') return false;
        if (p.startsWith('src/')) return false;
        return true;
      });

      expect(
        legacyPatterns,
        `Legacy agent patterns found in rbac-config.yaml:\n${legacyPatterns.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have all agent patterns starting with src/ or be wildcard *', () => {
      // Parse all agent patterns from roles permissions
      const agentPatterns = [];
      const lines = rbacContent.split('\n');
      let inAgentSection = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'agents:') {
          inAgentSection = true;
          continue;
        }
        if (inAgentSection && trimmed.startsWith('- ')) {
          agentPatterns.push(extractYamlListValue(trimmed));
        }
        if (
          inAgentSection &&
          !trimmed.startsWith('- ') &&
          !trimmed.startsWith('#') &&
          trimmed !== '' &&
          trimmed !== 'agents:'
        ) {
          inAgentSection = false;
        }
      }

      const invalid = agentPatterns.filter(
        (p) => p !== '*' && !p.startsWith('src/')
      );

      expect(
        invalid,
        `Agent patterns not starting with src/ or *:\n${invalid.join('\n')}`
      ).toHaveLength(0);
    });

    it('should NOT contain phantom agents in rbac-config.yaml', () => {
      const foundPhantoms = [];

      for (const phantom of PHANTOM_AGENTS) {
        // Check that phantom agent names do not appear as agent path references
        // Pattern: look for phantom name in agent-related contexts
        const phantomV6 = `agents/${phantom}`;
        if (rbacContent.includes(phantomV6)) {
          foundPhantoms.push(phantom);
        }
      }

      expect(
        foundPhantoms,
        `Phantom agents still referenced in rbac-config.yaml:\n${foundPhantoms.join('\n')}`
      ).toHaveLength(0);
    });

    it('should have agent_restrictions keys using v6 format', () => {
      // Extract agent_restrictions keys from RBAC config
      const lines = rbacContent.split('\n');
      let inRestrictions = false;
      const restrictionKeys = [];

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === 'agent_restrictions:') {
          inRestrictions = true;
          continue;
        }
        if (inRestrictions) {
          // Restriction keys are at a specific indent level and have a colon
          // They look like: src/intel-team/agents/field-operative:
          const keyMatch = lines[i].match(/^\s{4}(\S[^:]+):/);
          if (keyMatch && !keyMatch[1].startsWith('#') && !keyMatch[1].startsWith('-')) {
            restrictionKeys.push(keyMatch[1]);
          }
          // Exit on next top-level section (no indent)
          if (/^[a-z#]/.test(lines[i]) && i > 0) {
            inRestrictions = false;
          }
        }
      }

      const nonV6Keys = restrictionKeys.filter((k) => !k.startsWith('src/'));

      expect(
        nonV6Keys,
        `agent_restrictions keys not in v6 format:\n${nonV6Keys.join('\n')}`
      ).toHaveLength(0);

      // Should have at least some restrictions defined
      expect(restrictionKeys.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Path Normalization Tests
  // --------------------------------------------------------------------------
  describe('Path Normalization in canAccessAgent', () => {
    it('should allow admin access with v6 format input', () => {
      const adminUser = {
        userId: 'admin-1',
        userName: 'admin',
        roles: ['admin'],
        modules: ['*'],
        credentialVerified: true,
      };

      const result = manager.canAccessAgent(
        adminUser,
        'src/cybersec-team/agents/threat-analyst'
      );
      expect(result.allowed).toBe(true);
    });

    it('should allow admin access with legacy format input (backward compat)', () => {
      const adminUser = {
        userId: 'admin-1',
        userName: 'admin',
        roles: ['admin'],
        modules: ['*'],
        credentialVerified: true,
      };

      const result = manager.canAccessAgent(
        adminUser,
        'cybersec-team/threat-analyst'
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny unauthorized users with both v6 and legacy format', () => {
      const viewer = {
        userId: 'viewer-1',
        userName: 'viewer',
        roles: ['viewer'],
        modules: [],
        credentialVerified: false,
      };

      // V6 format denial
      const v6Result = manager.canAccessAgent(
        viewer,
        'src/cybersec-team/agents/threat-analyst'
      );
      expect(v6Result.allowed).toBe(false);

      // Legacy format denial
      const legacyResult = manager.canAccessAgent(
        viewer,
        'cybersec-team/threat-analyst'
      );
      expect(legacyResult.allowed).toBe(false);
    });

    it('should enforce agent_restrictions with normalized paths (field-operative)', () => {
      // field-operative requires intel_analyst + credential verification
      const unverifiedAnalyst = {
        userId: 'analyst-1',
        userName: 'analyst',
        roles: ['intel_analyst'],
        modules: ['intel-team', 'core'],
        credentialVerified: false,
      };

      // V6 format - should be denied due to credential verification requirement
      const v6Result = manager.canAccessAgent(
        unverifiedAnalyst,
        'src/intel-team/agents/field-operative'
      );
      expect(v6Result.allowed).toBe(false);
      expect(v6Result.reason).toContain('verified credentials');

      // Legacy format - should normalize to v6 and hit the same restriction
      const legacyResult = manager.canAccessAgent(
        unverifiedAnalyst,
        'intel-team/field-operative'
      );
      expect(legacyResult.allowed).toBe(false);
      expect(legacyResult.reason).toContain('verified credentials');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Complete Coverage Tests
  // --------------------------------------------------------------------------
  describe('Complete Coverage', () => {
    it('should have every manifest agent in a module recognized by RBAC config', () => {
      // Collect modules from module_restrictions section
      const lines = rbacContent.split('\n');
      let inModuleRestrictions = false;
      const rbacModules = new Set();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'module_restrictions:') {
          inModuleRestrictions = true;
          continue;
        }
        if (inModuleRestrictions) {
          const keyMatch = line.match(/^\s{4}([a-z][a-z0-9-]*):/);
          if (keyMatch) {
            rbacModules.add(keyMatch[1]);
          }
          if (/^[a-z#]/.test(line) && trimmed !== '') {
            inModuleRestrictions = false;
          }
        }
      }

      // Also collect modules referenced in role permissions (modules: section)
      let inModulesSection = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'modules:') {
          inModulesSection = true;
          continue;
        }
        if (inModulesSection && trimmed.startsWith('- ')) {
          rbacModules.add(extractYamlListValue(trimmed));
        }
        if (
          inModulesSection &&
          !trimmed.startsWith('- ') &&
          !trimmed.startsWith('#') &&
          trimmed !== '' &&
          trimmed !== 'modules:'
        ) {
          inModulesSection = false;
        }
      }

      // Every manifest agent's module must appear somewhere in RBAC config
      const uniqueModules = new Set(manifestRows.map((r) => r.module));
      const missingModules = [];

      for (const mod of uniqueModules) {
        if (!rbacModules.has(mod) && mod !== '*') {
          missingModules.push(
            `Module "${mod}" has agents in manifest but is not referenced in RBAC config`
          );
        }
      }

      expect(
        missingModules,
        `Modules without RBAC coverage:\n${missingModules.join('\n')}`
      ).toHaveLength(0);
    });

    it('should grant admin access to every agent listed in agent-manifest.csv', () => {
      const adminUser = {
        userId: 'admin-1',
        userName: 'admin',
        roles: ['admin'],
        modules: ['*'],
        credentialVerified: true,
      };

      const failures = [];

      for (const row of manifestRows) {
        const result = manager.canAccessAgent(adminUser, row.id);
        if (!result.allowed) {
          failures.push(
            `Admin denied access to "${row.id}": ${result.reason}`
          );
        }
      }

      expect(
        failures,
        `Admin was denied access to these agents:\n${failures.join('\n')}`
      ).toHaveLength(0);

      // Verify we tested all 80 agents
      expect(manifestRows.length).toBe(80);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Cross-validation: XML ids match manifest ids
  // --------------------------------------------------------------------------
  describe('Cross-validation', () => {
    it('should have XML agent id matching agent-manifest.csv id for each agent', () => {
      const manifestIds = new Set(manifestRows.map((r) => r.id));
      const mismatches = [];

      for (const agent of filesystemAgents) {
        const xmlId = extractXmlAgentId(agent.filePath);
        if (xmlId && !manifestIds.has(xmlId)) {
          // The storyteller has nested path, check with nested form
          const nestedId = `${xmlId}/${agent.agentName}`;
          if (!manifestIds.has(nestedId) && !manifestIds.has(xmlId)) {
            mismatches.push(
              `${path.relative(PROJECT_ROOT, agent.filePath)}: XML id="${xmlId}" not found in manifest`
            );
          }
        }
      }

      expect(
        mismatches,
        `XML ids not matching manifest:\n${mismatches.join('\n')}`
      ).toHaveLength(0);
    });
  });
});
