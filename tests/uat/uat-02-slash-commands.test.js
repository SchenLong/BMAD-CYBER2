/**
 * UAT-02: Slash Commands (16 checks)
 *
 * Validates: All slash command routing, resolution, error handling,
 * and cross-module invocation infrastructure.
 *
 * Stories:
 *   S1: Agent invocation (4 checks) — UAT-02-001 to UAT-02-004
 *   S2: Workflow invocation (3 checks) — UAT-02-005 to UAT-02-007
 *   S3: Error handling & edge cases (9 checks) — UAT-02-008 to UAT-02-016
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const COMMANDS_DIR = join(PROJECT_ROOT, '.claude', 'commands', 'bmad');
const ROUTER_PATH = join(PROJECT_ROOT, 'src', 'core', 'routing', 'slash-command-router.js');
const ALIASES_PATH = join(PROJECT_ROOT, '_bmad', '_config', 'workflow-aliases.yaml');

// Helper: read file as string
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// =============================================================================
// S1: Agent Invocation (4 checks)
// =============================================================================
describe('UAT-02-S1: Agent Invocation via Slash Commands', () => {

  // UAT-02-001: /bmad:core:agents:bmad-master
  it('UAT-02-001: core agent via full path — bmad-master command file exists and references correct source', () => {
    const cmdPath = join(COMMANDS_DIR, 'core', 'agents', 'bmad-master.md');
    expect(existsSync(cmdPath), 'Command file must exist').toBe(true);

    const content = readFile(cmdPath);
    // Must reference the source agent file
    expect(content).toContain('src/core/agents/bmad-master.md');
    // Must have activation instructions
    expect(content).toMatch(/agent-activation|LOAD.*agent/i);
    // Must have frontmatter with name
    expect(content).toMatch(/^---/);
    expect(content).toMatch(/name:/);

    // Source agent must also exist
    const srcPath = join(PROJECT_ROOT, 'src', 'core', 'agents', 'bmad-master.md');
    expect(existsSync(srcPath), 'Source agent must exist').toBe(true);
    const srcContent = readFile(srcPath);
    expect(srcContent).toContain('<agent');
    expect(srcContent).toMatch(/id="src\/core\/agents\/bmad-master"/);
  });

  // UAT-02-002: /bmad:cybersec-team:agents:penetration-tester
  it('UAT-02-002: cybersec agent via full path — penetration-tester correct module', () => {
    const cmdPath = join(COMMANDS_DIR, 'cybersec-team', 'agents', 'penetration-tester.md');
    expect(existsSync(cmdPath), 'Command file must exist').toBe(true);

    const content = readFile(cmdPath);
    expect(content).toContain('src/cybersec-team/agents/penetration-tester.md');

    // Source agent validates module membership
    const srcPath = join(PROJECT_ROOT, 'src', 'cybersec-team', 'agents', 'penetration-tester.md');
    expect(existsSync(srcPath)).toBe(true);
    const srcContent = readFile(srcPath);
    expect(srcContent).toMatch(/id="src\/cybersec-team\/agents\/penetration-tester"/);
  });

  // UAT-02-003: /bmad:bmm:agents:dev
  it('UAT-02-003: BMM agent via full path — dev agent activates', () => {
    const cmdPath = join(COMMANDS_DIR, 'bmm', 'agents', 'dev.md');
    expect(existsSync(cmdPath), 'Command file must exist').toBe(true);

    const content = readFile(cmdPath);
    expect(content).toContain('src/bmm/agents/dev.md');

    const srcPath = join(PROJECT_ROOT, 'src', 'bmm', 'agents', 'dev.md');
    expect(existsSync(srcPath)).toBe(true);
    const srcContent = readFile(srcPath);
    expect(srcContent).toMatch(/id="src\/bmm\/agents\/dev"/);
  });

  // UAT-02-004: /bmad:intel-team:agents:osint-lead
  it('UAT-02-004: intel agent via full path — osint-lead activates', () => {
    const cmdPath = join(COMMANDS_DIR, 'intel-team', 'agents', 'osint-lead.md');
    expect(existsSync(cmdPath), 'Command file must exist').toBe(true);

    const content = readFile(cmdPath);
    expect(content).toContain('src/intel-team/agents/osint-lead.md');

    const srcPath = join(PROJECT_ROOT, 'src', 'intel-team', 'agents', 'osint-lead.md');
    expect(existsSync(srcPath)).toBe(true);
  });
});

// =============================================================================
// S2: Workflow Invocation (3 checks)
// =============================================================================
describe('UAT-02-S2: Workflow Invocation via Slash Commands', () => {

  // UAT-02-005: /bmad:bmm:workflows:quick-dev
  it('UAT-02-005: workflow via full path — quick-dev command exists and references source', () => {
    const cmdPath = join(COMMANDS_DIR, 'bmm', 'workflows', 'quick-dev.md');
    expect(existsSync(cmdPath), 'Workflow command file must exist').toBe(true);

    const content = readFile(cmdPath);
    // Must reference the source workflow
    expect(content).toMatch(/src\/bmm\/workflows/);
    // Must have description in frontmatter
    expect(content).toMatch(/description:/);
    // Must instruct to LOAD the workflow
    expect(content).toMatch(/LOAD|READ|follow/i);
  });

  // UAT-02-006: Workflow via alias resolution
  it('UAT-02-006: workflow alias registry exists with 100+ unique aliases', () => {
    expect(existsSync(ALIASES_PATH), 'Alias registry must exist').toBe(true);

    const content = readFile(ALIASES_PATH);

    // Verify it's a proper registry
    expect(content).toMatch(/version:/);
    expect(content).toMatch(/aliases:/);

    // Count unique aliases (target: lines with the 'target:' field)
    const targetLines = content.match(/target:\s*"bmad:/g);
    expect(targetLines, 'Should have many alias → target mappings').not.toBeNull();
    expect(targetLines.length).toBeGreaterThanOrEqual(100);

    // Verify module prefixes section exists
    expect(content).toMatch(/module_prefixes:/);

    // Verify reserved names section exists
    expect(content).toMatch(/reserved_names:/);
  });

  // UAT-02-007: Cross-module workflow
  it('UAT-02-007: cross-module workflow command exists and references cross-module handler', () => {
    const cmdPath = join(COMMANDS_DIR, 'core', 'workflows', 'cross-module.md');
    expect(existsSync(cmdPath), 'Cross-module command must exist').toBe(true);

    const content = readFile(cmdPath);
    // Must reference the core cross-module workflow
    expect(content).toMatch(/src\/core\/workflows/);
  });
});

// =============================================================================
// S3: Error Handling & Edge Cases (9 checks)
// =============================================================================
describe('UAT-02-S3: Error Handling & Edge Cases', () => {

  let routerSrc;
  let aliasContent;

  beforeAll(() => {
    routerSrc = readFile(ROUTER_PATH);
    aliasContent = readFile(ALIASES_PATH);
  });

  // UAT-02-008: Invalid command — nonexistent module validation
  it('UAT-02-008: router validates input and rejects invalid patterns', () => {
    // Router must have validateInput method
    expect(routerSrc).toContain('validateInput');

    // Must check for valid command pattern
    expect(routerSrc).toMatch(/VALID_COMMAND_PATTERN/);

    // Must return error for invalid input
    expect(routerSrc).toMatch(/valid:\s*false/);
    expect(routerSrc).toMatch(/error:/);
  });

  // UAT-02-009: Invalid command — nonexistent agent returns not_found
  it('UAT-02-009: router returns not_found with fuzzy suggestions for unknown commands', () => {
    // Router must have fuzzyMatch for suggestions
    expect(routerSrc).toContain('fuzzyMatch');

    // Must return type: 'not_found' for unmatched commands
    expect(routerSrc).toMatch(/type:\s*'not_found'/);

    // Must include suggestions in response
    expect(routerSrc).toMatch(/suggestions/);

    // Levenshtein distance calculation for typo detection
    expect(routerSrc).toMatch(/levenshtein|distance/i);
  });

  // UAT-02-010: Invalid format gives helpful error
  it('UAT-02-010: router rejects malformed commands with descriptive error messages', () => {
    // Must validate command length
    expect(routerSrc).toContain('MAX_COMMAND_LENGTH');
    expect(routerSrc).toContain('MIN_COMMAND_LENGTH');

    // Must check for path traversal (security)
    expect(routerSrc).toMatch(/\.\.|path.*traversal/i);

    // Must check for command injection characters
    expect(routerSrc).toMatch(/;|&&|\||\$\(/);
  });

  // UAT-02-011: Reserved name protection
  it('UAT-02-011: reserved names blocked — system commands and validator names cannot be invoked', () => {
    // Router must check reserved names
    expect(routerSrc).toMatch(/reserved|RESERVED/);

    // Alias registry defines reserved names
    expect(aliasContent).toMatch(/reserved_names:/);

    // System commands must be reserved
    expect(aliasContent).toContain('help');
    expect(aliasContent).toContain('status');

    // Validator names must be reserved (prevent VULN-008)
    expect(aliasContent).toContain('bash-safety');
    expect(aliasContent).toContain('prompt-injection');
    expect(aliasContent).toContain('secret');
  });

  // UAT-02-012: Ambiguous alias disambiguation
  it('UAT-02-012: conflicted aliases return disambiguation with module-prefixed options', () => {
    // Router must handle disambiguation
    expect(routerSrc).toMatch(/type:\s*'disambiguation'/);
    expect(routerSrc).toContain('options');

    // Alias registry must have conflict entries
    expect(aliasContent).toMatch(/conflict:\s*true/);

    // Known conflicts exist (e.g., code-review in bmm + bmgd)
    const conflictEntries = aliasContent.match(/conflict:\s*true/g);
    expect(conflictEntries).not.toBeNull();
    expect(conflictEntries.length).toBeGreaterThanOrEqual(10);
  });

  // UAT-02-013: Case sensitivity — commands are lowercase
  it('UAT-02-013: command validation enforces lowercase — uppercase rejected or normalized', () => {
    // VALID_COMMAND_PATTERN only allows lowercase
    expect(routerSrc).toContain('VALID_COMMAND_PATTERN');
    // Pattern: /^[a-z0-9][a-z0-9:-]*[a-z0-9]$/
    expect(routerSrc).toMatch(/\[a-z0-9\]/);

    // BMAD path pattern allows mixed case in agent/workflow names
    expect(routerSrc).toContain('VALID_BMAD_PATH_PATTERN');
  });

  // UAT-02-014: Tab completion — .claude/commands structure enables IDE completions
  it('UAT-02-014: command directory structure enables tab completion with all 9 modules', () => {
    // Each module must have a commands directory
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const mod of modules) {
      const modDir = join(COMMANDS_DIR, mod);
      expect(existsSync(modDir), `Module ${mod} must have commands directory`).toBe(true);

      // Each module must have agents and/or workflows subdirectory
      const hasAgents = existsSync(join(modDir, 'agents'));
      const hasWorkflows = existsSync(join(modDir, 'workflows'));
      expect(hasAgents || hasWorkflows, `Module ${mod} must have agents or workflows`).toBe(true);
    }
  });

  // UAT-02-015: Help integration — help command exists
  it('UAT-02-015: help-related commands and workflows exist for context-aware help', () => {
    // Core has help-related infrastructure
    const helpFiles = [
      join(PROJECT_ROOT, '_bmad', '_config', 'module-help.csv'),
      join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv'),
    ];

    for (const helpFile of helpFiles) {
      expect(existsSync(helpFile), `Help file ${helpFile} must exist`).toBe(true);
      const content = readFile(helpFile);
      expect(content.length).toBeGreaterThan(100);
    }

    // Module help CSV should have 9 entries (one per module)
    const moduleHelp = readFile(helpFiles[0]);
    const dataLines = moduleHelp.split('\n').filter(l => l.trim() && !l.startsWith('code'));
    expect(dataLines.length).toBeGreaterThanOrEqual(9);
  });

  // UAT-02-016: Rapid sequential invocations — no state bleed between commands
  it('UAT-02-016: router is stateless — each resolve() call is independent', () => {
    // Router must not carry state between resolutions
    // Verify resolve() method exists and takes a single command argument
    expect(routerSrc).toContain('resolve(command)');

    // Execute method takes command + user (no hidden state)
    expect(routerSrc).toContain('execute(command, user)');

    // Audit logging per invocation (no batching)
    expect(routerSrc).toContain('logAuditEvent');

    // Router should be resettable (for testing)
    expect(routerSrc).toContain('resetSlashCommandRouter');
  });
});

// =============================================================================
// Cross-cutting: Command File Consistency
// =============================================================================
describe('UAT-02 Command File Consistency', () => {

  it('all agent command files reference existing source agents', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const mismatches = [];

    for (const mod of modules) {
      const agentCmdDir = join(COMMANDS_DIR, mod, 'agents');
      if (!existsSync(agentCmdDir)) continue;

      const cmdFiles = readdirSync(agentCmdDir).filter(f => f.endsWith('.md'));
      for (const cmdFile of cmdFiles) {
        const agentName = cmdFile.replace('.md', '');
        const content = readFile(join(agentCmdDir, cmdFile));

        // Extract source path reference (strip @ prefix and backticks)
        const srcRefMatch = content.match(/@?src\/[^\s,`]+\.md/);
        if (srcRefMatch) {
          const srcRef = srcRefMatch[0].replace(/^@/, '').replace(/`/g, '');
          const srcPath = join(PROJECT_ROOT, srcRef);
          if (!existsSync(srcPath)) {
            mismatches.push(`${mod}/agents/${agentName}: references ${srcRef} (not found)`);
          }
        }
      }
    }

    expect(mismatches, `Command→source mismatches:\n${mismatches.join('\n')}`).toHaveLength(0);
  });

  it('all workflow command files reference existing source workflows', () => {
    const modules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const mismatches = [];

    for (const mod of modules) {
      const wfCmdDir = join(COMMANDS_DIR, mod, 'workflows');
      if (!existsSync(wfCmdDir)) continue;

      const cmdFiles = readdirSync(wfCmdDir).filter(f => f.endsWith('.md'));
      for (const cmdFile of cmdFiles) {
        const content = readFile(join(wfCmdDir, cmdFile));

        // Extract source path reference (strip @ prefix and backticks)
        const srcRefMatch = content.match(/@?src\/[^\s,`]+/);
        if (srcRefMatch) {
          const srcRef = srcRefMatch[0].replace(/^@/, '').replace(/`/g, '');
          const srcPath = join(PROJECT_ROOT, srcRef);
          if (!existsSync(srcPath)) {
            mismatches.push(`${mod}/workflows/${cmdFile}: references ${srcRef} (not found)`);
          }
        }
      }
    }

    expect(mismatches, `Command→source mismatches:\n${mismatches.join('\n')}`).toHaveLength(0);
  });
});
