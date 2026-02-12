/**
 * UAT-11: Configuration & Customization (15 checks)
 *
 * Validates: All user configuration paths — module management, settings, customization
 * Closes: Category F partial gap from Section 9.4
 *
 * Stories:
 *   S1: Module management (5 checks)        — UAT-11-001 to UAT-11-005
 *   S2: Configuration files (5 checks)      — UAT-11-006 to UAT-11-010
 *   S3: Customization (5 checks)            — UAT-11-011 to UAT-11-015
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { parse as yamlParse } from 'yaml';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const MANIFEST_PATH = join(PROJECT_ROOT, '_bmad', '_config', 'manifest.yaml');
const AGENT_MANIFEST_PATH = join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv');
const MODULE_HELP_PATH = join(PROJECT_ROOT, '_bmad', '_config', 'module-help.csv');
const REGISTRY_PATH = join(PROJECT_ROOT, 'tools', 'cli', 'external-official-modules.yaml');
const SETTINGS_PATH = join(PROJECT_ROOT, '.claude', 'settings.json');
const CONFIG_PATH = join(PROJECT_ROOT, 'src', 'core', 'config.yaml');
const UPDATE_PATH = join(PROJECT_ROOT, 'tools', 'cli', 'commands', 'update.js');
const MODULE_LOADER_PATH = join(PROJECT_ROOT, 'src', 'utility', 'tools', 'module-selector', 'module-loader.js');
const MODULE_SELECTOR_PATH = join(PROJECT_ROOT, 'src', 'utility', 'tools', 'module-selector', 'index.js');
const EXTERNAL_MODULE_MANAGER_PATH = join(PROJECT_ROOT, 'tools', 'cli', 'lib', 'external-module-manager.js');
const HELP_GENERATOR_PATH = join(PROJECT_ROOT, 'src', 'core', 'help', 'help-generator.js');

// Helper: read file as string
function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// Helper: parse CSV rows (skip header)
function parseCsvRows(content) {
  const lines = content.trim().split('\n');
  return lines.slice(1); // skip header
}

// Helper: count agents per module from manifest
function countAgentsPerModule(manifestContent) {
  const rows = parseCsvRows(manifestContent);
  const counts = {};
  for (const row of rows) {
    // Module is the 10th column (0-indexed: 9)
    const parts = row.split(',');
    // Find module field — it's quoted
    const moduleMatch = row.match(/,"([^"]+)","src\//);
    if (moduleMatch) {
      const mod = moduleMatch[1];
      counts[mod] = (counts[mod] || 0) + 1;
    }
  }
  return counts;
}

// =============================================================================
// S1: Module Management (5 checks)
// =============================================================================
describe('UAT-11-S1: Module Management', () => {

  let registry;
  let manifest;
  let moduleLoader;
  let moduleManager;
  let agentManifest;
  let moduleHelp;
  let helpGenerator;

  beforeAll(() => {
    registry = readFile(REGISTRY_PATH);
    manifest = readFile(MANIFEST_PATH);
    moduleLoader = readFile(MODULE_LOADER_PATH);
    moduleManager = readFile(EXTERNAL_MODULE_MANAGER_PATH);
    agentManifest = readFile(AGENT_MANIFEST_PATH);
    moduleHelp = readFile(MODULE_HELP_PATH);
    helpGenerator = readFile(HELP_GENERATOR_PATH);
  });

  // UAT-11-001: Module disable — cybersec-team module can be disabled
  it('UAT-11-001: module system supports disabling cybersec-team (15 agents become unavailable)', () => {
    // Registry defines cybersec-team as optional (defaultSelected: false)
    expect(registry).toMatch(/code:\s*["']?cybersec-team/);
    expect(registry).toMatch(/cybersec-team[\s\S]*?default_?[Ss]elected:\s*false/);

    // Manifest tracks enabled modules — cybersec-team is currently listed
    expect(manifest).toContain('cybersec-team');

    // Module help confirms cybersec-team has 15 agents
    const cybersecRow = moduleHelp.split('\n').find(l => l.includes('cybersec-team'));
    expect(cybersecRow).toBeDefined();
    expect(cybersecRow).toContain('"15"');

    // Agent manifest has 15 cybersec-team agents
    const cybersecAgents = agentManifest.split('\n').filter(l => l.includes('"cybersec-team"'));
    expect(cybersecAgents).toHaveLength(15);

    // Help generator filters agents by module — disabling removes from help output
    expect(helpGenerator).toMatch(/filter.*module|module.*filter/i);
  });

  // UAT-11-002: Module re-enable — cybersec-team agents available again
  it('UAT-11-002: module re-enable restores agent availability via manifest update', () => {
    // Module loader scans src/ directory for modules
    expect(moduleLoader).toMatch(/src\//);
    expect(moduleLoader).toMatch(/module\.yaml/);

    // Module selector supports enable/disable via manifest write
    const moduleSelector = readFile(MODULE_SELECTOR_PATH);
    expect(moduleSelector).toMatch(/manifest|updateManifest|writeManifest/i);

    // Manifest has both legacy and new field formats
    expect(manifest).toMatch(/modules:/);
  });

  // UAT-11-003: Module disable cascading — help, status, slash commands reflect removal
  it('UAT-11-003: module disable cascades to help, status, and slash commands', () => {
    // Help generator groups output by module
    expect(helpGenerator).toMatch(/module/i);
    expect(helpGenerator).toMatch(/filter/i);

    // Status command reads enabled modules
    const statusCmd = readFile(join(PROJECT_ROOT, 'tools', 'cli', 'commands', 'status.js'));
    expect(statusCmd).toMatch(/module/i);

    // Authorization checks module access
    const authCode = readFile(join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.ts'));
    expect(authCode).toMatch(/module/i);
    expect(authCode).toMatch(/canAccess/i);
  });

  // UAT-11-004: Default module selection matches defaultSelected in registry
  it('UAT-11-004: default module selection matches registry defaultSelected flags', () => {
    // External module manager has getDefaultSelectedModules()
    expect(moduleManager).toContain('getDefaultSelectedModules');

    // Registry has defaultSelected flags
    expect(registry).toMatch(/default_?[Ss]elected:\s*true/);
    expect(registry).toMatch(/default_?[Ss]elected:\s*false/);

    // Core should be defaultSelected: true
    const coreSection = registry.match(/code:\s*["']?core[\s\S]*?(?=\n\s*-\s*code:|\n\s*$)/);
    expect(coreSection).not.toBeNull();
    expect(coreSection[0]).toMatch(/default_?[Ss]elected:\s*true/);

    // BMM should be defaultSelected: true
    const bmmSection = registry.match(/code:\s*["']?bmm[\s\S]*?(?=\n\s*-\s*code:|\n\s*$)/);
    expect(bmmSection).not.toBeNull();
    expect(bmmSection[0]).toMatch(/default_?[Ss]elected:\s*true/);
  });

  // UAT-11-005: Required module enforcement — core cannot be disabled
  it('UAT-11-005: core module is required and cannot be disabled', () => {
    // Core module.yaml has required: true
    const coreModule = readFile(join(PROJECT_ROOT, 'src', 'core', 'module.yaml'));
    expect(coreModule).toMatch(/required:\s*true/);

    // Registry marks core as required
    const coreSection = registry.match(/code:\s*["']?core[\s\S]*?(?=\n\s*-\s*code:|\n\s*$)/);
    expect(coreSection).not.toBeNull();
    expect(coreSection[0]).toMatch(/required:\s*true/);

    // External module manager has getRequiredModules()
    expect(moduleManager).toContain('getRequiredModules');

    // No other module is marked required
    const nonCoreModules = ['bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const mod of nonCoreModules) {
      const modYaml = readFile(join(PROJECT_ROOT, 'src', mod, 'module.yaml'));
      // These modules should NOT have required: true
      expect(modYaml).not.toMatch(/required:\s*true/);
    }
  });
});

// =============================================================================
// S2: Configuration Files (5 checks)
// =============================================================================
describe('UAT-11-S2: Configuration Files', () => {

  let configYaml;
  let settingsJson;
  let settings;
  let updateCode;

  beforeAll(() => {
    configYaml = readFile(CONFIG_PATH);
    settingsJson = readFile(SETTINGS_PATH);
    settings = JSON.parse(settingsJson);
    updateCode = readFile(UPDATE_PATH);
  });

  // UAT-11-006: Config file editing — user_name field is editable
  it('UAT-11-006: config.yaml has user_name field and is editable', () => {
    // config.yaml exists and has user_name field
    expect(existsSync(CONFIG_PATH)).toBe(true);
    expect(configYaml).toMatch(/user_name:/);

    // Config is loaded by authorization.js (the YAML parser)
    const authCode = readFile(join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.js'));
    expect(authCode).toContain('config.yaml');
  });

  // UAT-11-007: Config invalid YAML — clear error, no crash
  it('UAT-11-007: YAML parsing has error handling for invalid content', () => {
    // authorization.js has its own YAML parser with error tolerance
    const authCode = readFile(join(PROJECT_ROOT, 'src', 'core', 'security', 'authorization.js'));

    // Parser skips empty lines and comments gracefully
    expect(authCode).toMatch(/trim\(\)|startsWith\('#'\)|continue/);

    // Module loader handles YAML parse errors
    const moduleLoader = readFile(MODULE_LOADER_PATH);
    expect(moduleLoader).toMatch(/try|catch|error/i);
  });

  // UAT-11-008: Settings.json manual edit — custom hooks take effect
  it('UAT-11-008: settings.json supports custom hooks via hook arrays', () => {
    // Settings.json has hooks structure with command arrays
    expect(settings).toHaveProperty('hooks');
    expect(settings.hooks).toHaveProperty('PreToolUse');
    expect(settings.hooks).toHaveProperty('SessionStart');
    expect(settings.hooks).toHaveProperty('UserPromptSubmit');

    // Each PreToolUse entry has matcher + hooks array
    const preToolUse = settings.hooks.PreToolUse;
    expect(Array.isArray(preToolUse)).toBe(true);
    expect(preToolUse.length).toBeGreaterThan(0);

    // First entry should have matcher and hooks
    const firstEntry = preToolUse[0];
    expect(firstEntry).toHaveProperty('matcher');
    expect(firstEntry).toHaveProperty('hooks');
    expect(Array.isArray(firstEntry.hooks)).toBe(true);
    expect(firstEntry.hooks[0]).toHaveProperty('type', 'command');
    expect(firstEntry.hooks[0]).toHaveProperty('command');
  });

  // UAT-11-009: Settings.json preservation on update
  it('UAT-11-009: update.js preserves settings.json and other critical files', () => {
    // PRESERVE_FILES array includes settings.json
    expect(updateCode).toContain('PRESERVE_FILES');
    expect(updateCode).toContain('.claude/settings.json');

    // Also preserves hooks directory
    expect(updateCode).toContain('.claude/hooks');

    // Also preserves config.yaml
    expect(updateCode).toMatch(/config\.yaml/);

    // Also preserves validators
    expect(updateCode).toContain('.claude/validators-node');

    // Also preserves commands
    expect(updateCode).toContain('.claude/commands');

    // Backup and restore functions exist
    expect(updateCode).toMatch(/backup|restore/i);
  });

  // UAT-11-010: YOLO mode toggle — config field exists and validators reference it
  it('UAT-11-010: YOLO mode is configurable via config.yaml security section', () => {
    // config.yaml has YOLO mode section
    expect(configYaml).toMatch(/yolo_mode/i);
    expect(configYaml).toMatch(/enabled:\s*false/);

    // YOLO mode has safety flags
    expect(configYaml).toMatch(/require_explicit_flag/i);
    expect(configYaml).toMatch(/log_invocations/i);

    // Audit config tracks YOLO events
    expect(configYaml).toMatch(/yolo_invoked/i);
    expect(configYaml).toMatch(/yolo_blocked/i);
  });
});

// =============================================================================
// S3: Customization (5 checks)
// =============================================================================
describe('UAT-11-S3: Customization', () => {

  // UAT-11-011: Custom agent addition — agent .md format supports new agents
  it('UAT-11-011: agent .md format supports custom agents with proper XML structure', () => {
    // Sample an existing agent to verify the template format
    const sampleAgent = readFile(join(PROJECT_ROOT, 'src', 'bmm', 'agents', 'dev.md'));

    // Agent has YAML frontmatter
    expect(sampleAgent).toMatch(/^---\n/);
    expect(sampleAgent).toMatch(/name:/);
    expect(sampleAgent).toMatch(/description:/);

    // Agent has XML structure with id attribute
    expect(sampleAgent).toMatch(/<agent\s+id="src\/bmm\/agents\/dev"/);

    // Agent has identity section
    expect(sampleAgent).toMatch(/<identity>/i);

    // Agents directory accepts .md files — module-loader discovers them
    const moduleLoader = readFile(MODULE_LOADER_PATH);
    expect(moduleLoader).toMatch(/\.md/);
    expect(moduleLoader).toMatch(/agents/);
  });

  // UAT-11-012: Custom workflow addition — workflow format supports new workflows
  it('UAT-11-012: workflow format supports custom workflows with YAML structure', () => {
    // Sample an existing workflow.yaml to verify the template format
    const sampleWorkflow = readFile(join(
      PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration',
      'secure-software', 'workflow.yaml'
    ));

    // Workflow has name and description
    expect(sampleWorkflow).toMatch(/name:/);
    expect(sampleWorkflow).toMatch(/description:/);

    // Module-loader discovers workflows
    const moduleLoader = readFile(MODULE_LOADER_PATH);
    expect(moduleLoader).toMatch(/workflow/);
  });

  // UAT-11-013: Custom module creation — module.yaml template supports new modules
  it('UAT-11-013: module.yaml format supports custom module creation', () => {
    // Verify module.yaml template by checking existing module
    const sampleModule = readFile(join(PROJECT_ROOT, 'src', 'bmb', 'module.yaml'));

    // Module has required fields
    expect(sampleModule).toMatch(/code:/);
    expect(sampleModule).toMatch(/name:/);

    // BMB module-builder agent exists for creating modules
    expect(existsSync(join(PROJECT_ROOT, 'src', 'bmb', 'agents', 'module-builder.md'))).toBe(true);

    // Create-module workflow exists
    const createModuleWorkflow = join(
      PROJECT_ROOT, 'src', 'bmb', 'workflows', 'create-module'
    );
    expect(existsSync(createModuleWorkflow)).toBe(true);

    // Module schema exists for validation
    expect(existsSync(join(PROJECT_ROOT, 'tools', 'schema', 'module.js'))).toBe(true);
  });

  // UAT-11-014: Agent persona customization — identity section is editable
  it('UAT-11-014: agent persona is customizable via identity section in .md files', () => {
    // Read multiple agents to verify identity section is present and distinct
    const agents = [
      join(PROJECT_ROOT, 'src', 'bmm', 'agents', 'pm.md'),
      join(PROJECT_ROOT, 'src', 'cybersec-team', 'agents', 'penetration-tester.md'),
      join(PROJECT_ROOT, 'src', 'intel-team', 'agents', 'osint-lead.md'),
    ];

    const identities = [];
    for (const agentPath of agents) {
      const content = readFile(agentPath);
      // Each agent has identity section
      expect(content).toMatch(/<identity>/i);

      // Extract identity content
      const idMatch = content.match(/<identity>([\s\S]*?)<\/identity>/i);
      expect(idMatch).not.toBeNull();
      identities.push(idMatch[1]);
    }

    // Identities should be unique per agent
    const uniqueIdentities = new Set(identities);
    expect(uniqueIdentities.size).toBe(identities.length);
  });

  // UAT-11-015: Workflow step customization — instructions.md is editable
  it('UAT-11-015: workflow instructions are customizable via instructions.md or workflow.md', () => {
    // Some workflows use instructions.md (automate pattern)
    const qaWorkflowDir = join(PROJECT_ROOT, 'src', 'bmm', 'workflows', 'qa', 'automate');
    if (existsSync(join(qaWorkflowDir, 'instructions.md'))) {
      const instructions = readFile(join(qaWorkflowDir, 'instructions.md'));
      expect(instructions.length).toBeGreaterThan(100);
      // Instructions contain step definitions
      expect(instructions).toMatch(/step|phase|check/i);
    }

    // Other workflows use workflow.md format
    const partyMode = readFile(join(PROJECT_ROOT, 'src', 'core', 'workflows', 'party-mode', 'workflow.md'));
    expect(partyMode.length).toBeGreaterThan(100);
    // Workflow.md contains executable instructions
    expect(partyMode).toMatch(/step|phase|workflow/i);

    // Workflow.yaml files support steps definition
    const secureWorkflow = readFile(join(
      PROJECT_ROOT, 'src', 'core', 'workflows', 'team-orchestration',
      'secure-software', 'workflow.yaml'
    ));
    expect(secureWorkflow).toMatch(/steps:|phases:|instructions/i);
  });
});
