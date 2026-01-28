/**
 * Unit Tests for Module Loading Verifier - INST-019
 * Epic 4, Post-Install Health Check
 *
 * Tests the module-checker.js functionality for verifying that enabled
 * modules from the manifest are properly installed with expected
 * directory structures, agents, and workflows.
 *
 * @module module-checker.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixture directory
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_module_checker__');
const MOCK_BMAD_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad');
const MOCK_CONFIG_PATH = path.join(MOCK_BMAD_PATH, '_config');
const MOCK_MANIFEST_PATH = path.join(MOCK_CONFIG_PATH, 'manifest.yaml');

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock manifest YAML string
 * @param {Object} options - Manifest options
 * @returns {string} YAML formatted manifest
 */
function createMockManifestYaml(options = {}) {
  const {
    enabledModules = ['core', 'bmm'],
    modules = null,
    useEnabledModules = true
  } = options;

  let yaml = '';

  if (useEnabledModules) {
    yaml += 'enabled_modules:\n';
    for (const mod of enabledModules) {
      yaml += `  - ${mod}\n`;
    }
  }

  if (modules) {
    yaml += 'modules:\n';
    for (const mod of modules) {
      yaml += `  - ${mod}\n`;
    }
  }

  yaml += 'installation:\n';
  yaml += '  version: "2.0.0"\n';
  yaml += '  installDate: "2024-01-01T00:00:00.000Z"\n';

  return yaml;
}

/**
 * Creates a mock module.yaml content
 * @param {Object} options - Module options
 * @returns {string} YAML formatted module config
 */
function createMockModuleYaml(options = {}) {
  const {
    code = 'test-module',
    name = 'Test Module',
    agentsPath = null,
    workflowsPath = null
  } = options;

  let yaml = `code: ${code}\n`;
  yaml += `name: ${name}\n`;
  yaml += 'required: false\n';
  yaml += 'default_selected: true\n';

  if (agentsPath) {
    yaml += `agents_path: ${agentsPath}\n`;
  }

  if (workflowsPath) {
    yaml += `workflows_path: ${workflowsPath}\n`;
  }

  return yaml;
}

// ============================================================================
// Test Fixture Setup/Teardown
// ============================================================================

function setupTestFixtures() {
  cleanupTestFixtures();

  // Create mock directory structure
  fs.mkdirSync(MOCK_CONFIG_PATH, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

/**
 * Creates a complete mock module with agents and workflows
 * @param {string} moduleCode - Module code
 * @param {Object} options - Options for module creation
 */
function createMockModule(moduleCode, options = {}) {
  const {
    agentCount = 2,
    workflowCount = 2,
    hasModuleYaml = true,
    hasCodeField = true,
    hasNameField = true,
    workflowType = 'yaml' // 'yaml', 'directory', or 'mixed'
  } = options;

  const modulePath = path.join(MOCK_BMAD_PATH, moduleCode);
  const agentsPath = path.join(modulePath, 'agents');
  const workflowsPath = path.join(modulePath, 'workflows');

  // Create module directory
  fs.mkdirSync(modulePath, { recursive: true });

  // Create module.yaml
  if (hasModuleYaml) {
    let yaml = '';
    if (hasCodeField) yaml += `code: ${moduleCode}\n`;
    if (hasNameField) yaml += `name: ${moduleCode} Module\n`;
    yaml += 'required: false\n';
    fs.writeFileSync(path.join(modulePath, 'module.yaml'), yaml);
  }

  // Create agents
  if (agentCount > 0) {
    fs.mkdirSync(agentsPath, { recursive: true });
    for (let i = 1; i <= agentCount; i++) {
      fs.writeFileSync(path.join(agentsPath, `agent-${i}.md`), `# Agent ${i}\n`);
    }
  }

  // Create workflows
  if (workflowCount > 0) {
    fs.mkdirSync(workflowsPath, { recursive: true });

    if (workflowType === 'yaml') {
      for (let i = 1; i <= workflowCount; i++) {
        fs.writeFileSync(path.join(workflowsPath, `workflow-${i}.yaml`), `name: Workflow ${i}\n`);
      }
    } else if (workflowType === 'directory') {
      for (let i = 1; i <= workflowCount; i++) {
        const wfDir = path.join(workflowsPath, `workflow-${i}`);
        fs.mkdirSync(wfDir, { recursive: true });
        fs.writeFileSync(path.join(wfDir, 'workflow.md'), `# Workflow ${i}\n`);
      }
    } else if (workflowType === 'mixed') {
      // Half yaml, half directory
      const halfCount = Math.ceil(workflowCount / 2);
      for (let i = 1; i <= halfCount; i++) {
        fs.writeFileSync(path.join(workflowsPath, `workflow-${i}.yaml`), `name: Workflow ${i}\n`);
      }
      for (let i = halfCount + 1; i <= workflowCount; i++) {
        const wfDir = path.join(workflowsPath, `workflow-${i}`);
        fs.mkdirSync(wfDir, { recursive: true });
        fs.writeFileSync(path.join(wfDir, 'workflow.md'), `# Workflow ${i}\n`);
      }
    }
  }
}

// ============================================================================
// Import module-checker
// ============================================================================

let moduleChecker;
let parseYaml;
let readManifest;
let getEnabledModules;
let verifyModuleExists;
let parseModuleConfig;
let verifyAgentsDirectory;
let verifyWorkflowsDirectory;
let checkModule;
let checkAllModules;
let formatHealthReport;

beforeAll(async () => {
  try {
    moduleChecker = await import('./module-checker.js');
    parseYaml = moduleChecker.parseYaml;
    readManifest = moduleChecker.readManifest;
    getEnabledModules = moduleChecker.getEnabledModules;
    verifyModuleExists = moduleChecker.verifyModuleExists;
    parseModuleConfig = moduleChecker.parseModuleConfig;
    verifyAgentsDirectory = moduleChecker.verifyAgentsDirectory;
    verifyWorkflowsDirectory = moduleChecker.verifyWorkflowsDirectory;
    checkModule = moduleChecker.checkModule;
    checkAllModules = moduleChecker.checkAllModules;
    formatHealthReport = moduleChecker.formatHealthReport;
  } catch (err) {
    console.warn('module-checker.js import error:', err.message);
  }
});

// ============================================================================
// Tests: parseYaml()
// ============================================================================

describe('Module Checker - INST-019', () => {

  describe('parseYaml', () => {
    it('should parse simple key-value pairs', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'name: test\nversion: 1.0.0';
      const result = parseYaml(yaml);

      expect(result.name).toBe('test');
      expect(result.version).toBe('1.0.0');
    });

    it('should parse arrays', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'modules:\n  - core\n  - bmm\n  - intel';
      const result = parseYaml(yaml);

      expect(result.modules).toEqual(['core', 'bmm', 'intel']);
    });

    it('should parse nested objects', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'installation:\n  version: 2.0.0\n  date: 2024-01-01';
      const result = parseYaml(yaml);

      expect(result.installation).toBeDefined();
      expect(result.installation.version).toBe('2.0.0');
    });

    it('should handle quoted strings', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'name: "Test Module"\npath: \'some/path\'';
      const result = parseYaml(yaml);

      expect(result.name).toBe('Test Module');
      expect(result.path).toBe('some/path');
    });

    it('should parse boolean values', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'required: true\noptional: false';
      const result = parseYaml(yaml);

      expect(result.required).toBe(true);
      expect(result.optional).toBe(false);
    });

    it('should parse numeric values', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = 'count: 42\nprice: 19.99';
      const result = parseYaml(yaml);

      expect(result.count).toBe(42);
      expect(result.price).toBe(19.99);
    });

    it('should skip comments', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const yaml = '# This is a comment\nname: test\n# Another comment';
      const result = parseYaml(yaml);

      expect(result.name).toBe('test');
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should return empty object for empty input', () => {
      if (!parseYaml) expect.fail('parseYaml not implemented');

      const result = parseYaml('');
      expect(result).toEqual({});
    });
  });

  // ============================================================================
  // Tests: readManifest()
  // ============================================================================

  describe('readManifest', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty object when manifest does not exist', () => {
      if (!readManifest) expect.fail('readManifest not implemented');

      const result = readManifest(MOCK_PROJECT_ROOT);
      expect(result).toEqual({});
    });

    it('should parse manifest with enabled_modules', () => {
      if (!readManifest) expect.fail('readManifest not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['core', 'bmm', 'intel-team']
      }));

      const result = readManifest(MOCK_PROJECT_ROOT);

      expect(result.enabled_modules).toBeDefined();
      expect(result.enabled_modules).toContain('core');
      expect(result.enabled_modules).toContain('bmm');
    });

    it('should handle empty manifest file', () => {
      if (!readManifest) expect.fail('readManifest not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, '');

      const result = readManifest(MOCK_PROJECT_ROOT);
      expect(result).toEqual({});
    });
  });

  // ============================================================================
  // Tests: getEnabledModules()
  // ============================================================================

  describe('getEnabledModules', () => {
    it('should extract enabled_modules array', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const manifest = {
        enabled_modules: ['core', 'bmm', 'intel-team']
      };

      const result = getEnabledModules(manifest);
      expect(result).toEqual(['core', 'bmm', 'intel-team']);
    });

    it('should fall back to modules array for backward compatibility', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const manifest = {
        modules: ['core', 'legacy-module']
      };

      const result = getEnabledModules(manifest);
      expect(result).toEqual(['core', 'legacy-module']);
    });

    it('should prefer enabled_modules over modules', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const manifest = {
        enabled_modules: ['new-module'],
        modules: ['old-module']
      };

      const result = getEnabledModules(manifest);
      expect(result).toEqual(['new-module']);
    });

    it('should return empty array for empty manifest', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const result = getEnabledModules({});
      expect(result).toEqual([]);
    });

    it('should filter out non-string values', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const manifest = {
        enabled_modules: ['core', 123, null, 'bmm', undefined, '']
      };

      const result = getEnabledModules(manifest);
      expect(result).toEqual(['core', 'bmm']);
    });

    it('should remove duplicate module codes', () => {
      if (!getEnabledModules) expect.fail('getEnabledModules not implemented');

      const manifest = {
        enabled_modules: ['core', 'bmm', 'core', 'bmm']
      };

      const result = getEnabledModules(manifest);
      expect(result).toEqual(['core', 'bmm']);
    });
  });

  // ============================================================================
  // Tests: verifyModuleExists()
  // ============================================================================

  describe('verifyModuleExists', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return true when module.yaml exists', () => {
      if (!verifyModuleExists) expect.fail('verifyModuleExists not implemented');

      createMockModule('test-module');

      const result = verifyModuleExists('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(true);
    });

    it('should return false when module.yaml does not exist', () => {
      if (!verifyModuleExists) expect.fail('verifyModuleExists not implemented');

      const result = verifyModuleExists('nonexistent-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(false);
    });

    it('should return false when module directory exists but no module.yaml', () => {
      if (!verifyModuleExists) expect.fail('verifyModuleExists not implemented');

      const modulePath = path.join(MOCK_BMAD_PATH, 'empty-module');
      fs.mkdirSync(modulePath, { recursive: true });

      const result = verifyModuleExists('empty-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // Tests: verifyAgentsDirectory()
  // ============================================================================

  describe('verifyAgentsDirectory', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should count .md files in agents directory', () => {
      if (!verifyAgentsDirectory) expect.fail('verifyAgentsDirectory not implemented');

      createMockModule('test-module', { agentCount: 5 });

      const result = verifyAgentsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(5);
    });

    it('should return 0 when agents directory does not exist', () => {
      if (!verifyAgentsDirectory) expect.fail('verifyAgentsDirectory not implemented');

      createMockModule('test-module', { agentCount: 0 });

      const result = verifyAgentsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(0);
    });

    it('should not count non-.md files', () => {
      if (!verifyAgentsDirectory) expect.fail('verifyAgentsDirectory not implemented');

      createMockModule('test-module', { agentCount: 2 });

      // Add non-.md files
      const agentsPath = path.join(MOCK_BMAD_PATH, 'test-module', 'agents');
      fs.writeFileSync(path.join(agentsPath, 'config.yaml'), 'name: config');
      fs.writeFileSync(path.join(agentsPath, 'readme.txt'), 'readme');

      const result = verifyAgentsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(2);
    });

    it('should return 0 when module does not exist', () => {
      if (!verifyAgentsDirectory) expect.fail('verifyAgentsDirectory not implemented');

      const result = verifyAgentsDirectory('nonexistent', MOCK_PROJECT_ROOT);
      expect(result).toBe(0);
    });
  });

  // ============================================================================
  // Tests: verifyWorkflowsDirectory()
  // ============================================================================

  describe('verifyWorkflowsDirectory', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should count .yaml workflow files', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('test-module', { workflowCount: 3, workflowType: 'yaml' });

      const result = verifyWorkflowsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(3);
    });

    it('should count workflow directories with workflow.md', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('test-module', { workflowCount: 4, workflowType: 'directory' });

      const result = verifyWorkflowsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(4);
    });

    it('should count mixed workflow types', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('test-module', { workflowCount: 4, workflowType: 'mixed' });

      const result = verifyWorkflowsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(4);
    });

    it('should not count config files like module.yaml', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('test-module', { workflowCount: 2, workflowType: 'yaml' });

      // Add config files that should be excluded
      const workflowsPath = path.join(MOCK_BMAD_PATH, 'test-module', 'workflows');
      fs.writeFileSync(path.join(workflowsPath, 'config.yaml'), 'name: config');
      fs.writeFileSync(path.join(workflowsPath, 'manifest.yaml'), 'name: manifest');
      fs.writeFileSync(path.join(workflowsPath, 'module.yaml'), 'name: module');

      // These excluded files (config.yaml, manifest.yaml, module.yaml) should not be counted
      const result = verifyWorkflowsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(2); // Only the 2 workflow files, not the config files
    });

    it('should return 0 when workflows directory does not exist', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('test-module', { workflowCount: 0 });

      const result = verifyWorkflowsDirectory('test-module', MOCK_PROJECT_ROOT);
      expect(result).toBe(0);
    });
  });

  // ============================================================================
  // Tests: checkModule()
  // ============================================================================

  describe('checkModule', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return healthy status for complete module', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('healthy-module', {
        agentCount: 3,
        workflowCount: 2
      });

      const result = checkModule('healthy-module', MOCK_PROJECT_ROOT);

      expect(result.status).toBe('healthy');
      expect(result.code).toBe('healthy-module');
      expect(result.agentCount).toBe(3);
      expect(result.workflowCount).toBe(2);
      expect(result.issues).toHaveLength(0);
    });

    it('should return unhealthy status when module.yaml is missing', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      const result = checkModule('nonexistent-module', MOCK_PROJECT_ROOT);

      expect(result.status).toBe('unhealthy');
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain('module.yaml not found');
    });

    it('should return degraded status when only agents are missing', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('no-agents-module', {
        agentCount: 0,
        workflowCount: 3
      });

      const result = checkModule('no-agents-module', MOCK_PROJECT_ROOT);

      expect(result.status).toBe('degraded');
      expect(result.issues.some(i => i.includes('No agents'))).toBe(true);
    });

    it('should return degraded status when only workflows are missing', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('no-workflows-module', {
        agentCount: 2,
        workflowCount: 0
      });

      const result = checkModule('no-workflows-module', MOCK_PROJECT_ROOT);

      expect(result.status).toBe('degraded');
      expect(result.issues.some(i => i.includes('No workflows'))).toBe(true);
    });

    it('should return unhealthy status when both agents and workflows are missing', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('empty-module', {
        agentCount: 0,
        workflowCount: 0
      });

      const result = checkModule('empty-module', MOCK_PROJECT_ROOT);

      expect(result.status).toBe('unhealthy');
    });

    it('should report issue when module.yaml missing code and name', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('bad-yaml-module', {
        agentCount: 2,
        workflowCount: 2,
        hasCodeField: false,
        hasNameField: false
      });

      const result = checkModule('bad-yaml-module', MOCK_PROJECT_ROOT);

      expect(result.issues.some(i => i.includes('missing code or name'))).toBe(true);
    });
  });

  // ============================================================================
  // Tests: checkAllModules()
  // ============================================================================

  describe('checkAllModules', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return unhealthy when manifest does not exist', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.status).toBe('unhealthy');
      expect(result.totalModules).toBe(0);
      expect(result.issues.some(i => i.includes('Manifest file not found'))).toBe(true);
    });

    it('should return unhealthy when no enabled modules', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, 'enabled_modules:\ninstallation:\n  version: 1.0.0');

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.status).toBe('unhealthy');
      expect(result.issues.some(i => i.includes('No enabled modules'))).toBe(true);
    });

    it('should return healthy when all modules are healthy', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      // Create manifest
      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['module-a', 'module-b']
      }));

      // Create healthy modules
      createMockModule('module-a', { agentCount: 2, workflowCount: 2 });
      createMockModule('module-b', { agentCount: 3, workflowCount: 1 });

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.status).toBe('healthy');
      expect(result.totalModules).toBe(2);
      expect(result.healthyModules).toBe(2);
      expect(result.totalAgents).toBe(5);
      expect(result.totalWorkflows).toBe(3);
    });

    it('should return degraded when some modules are unhealthy', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['healthy-module', 'missing-module']
      }));

      createMockModule('healthy-module', { agentCount: 2, workflowCount: 2 });
      // missing-module is not created

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.status).toBe('degraded');
      expect(result.totalModules).toBe(2);
      expect(result.healthyModules).toBe(1);
    });

    it('should return unhealthy when all modules are unhealthy', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['missing-a', 'missing-b']
      }));

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.status).toBe('unhealthy');
      expect(result.healthyModules).toBe(0);
    });

    it('should aggregate issues from all modules', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['module-a', 'module-b']
      }));

      createMockModule('module-a', { agentCount: 0, workflowCount: 2 });
      createMockModule('module-b', { agentCount: 2, workflowCount: 0 });

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(i => i.includes('module-a'))).toBe(true);
      expect(result.issues.some(i => i.includes('module-b'))).toBe(true);
    });

    it('should correctly count total agents and workflows', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: ['mod-1', 'mod-2', 'mod-3']
      }));

      createMockModule('mod-1', { agentCount: 5, workflowCount: 3 });
      createMockModule('mod-2', { agentCount: 2, workflowCount: 4 });
      createMockModule('mod-3', { agentCount: 3, workflowCount: 2 });

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.totalAgents).toBe(10);
      expect(result.totalWorkflows).toBe(9);
    });
  });

  // ============================================================================
  // Tests: formatHealthReport()
  // ============================================================================

  describe('formatHealthReport', () => {
    it('should format healthy report', () => {
      if (!formatHealthReport) expect.fail('formatHealthReport not implemented');

      const report = {
        status: 'healthy',
        totalModules: 2,
        healthyModules: 2,
        totalAgents: 5,
        totalWorkflows: 4,
        modules: [
          { code: 'mod-a', status: 'healthy', agentCount: 3, workflowCount: 2, issues: [] },
          { code: 'mod-b', status: 'healthy', agentCount: 2, workflowCount: 2, issues: [] }
        ],
        issues: []
      };

      const formatted = formatHealthReport(report);

      expect(formatted).toContain('HEALTHY');
      expect(formatted).toContain('[OK]');
      expect(formatted).toContain('Total Modules: 2');
      expect(formatted).toContain('Total Agents: 5');
    });

    it('should format degraded report with issues', () => {
      if (!formatHealthReport) expect.fail('formatHealthReport not implemented');

      const report = {
        status: 'degraded',
        totalModules: 2,
        healthyModules: 1,
        totalAgents: 3,
        totalWorkflows: 2,
        modules: [
          { code: 'good-mod', status: 'healthy', agentCount: 3, workflowCount: 2, issues: [] },
          { code: 'bad-mod', status: 'degraded', agentCount: 0, workflowCount: 0, issues: ['No agents', 'No workflows'] }
        ],
        issues: ['No agents', 'No workflows']
      };

      const formatted = formatHealthReport(report);

      expect(formatted).toContain('DEGRADED');
      expect(formatted).toContain('[WARN]');
      expect(formatted).toContain('Issues Found');
    });

    it('should format unhealthy report', () => {
      if (!formatHealthReport) expect.fail('formatHealthReport not implemented');

      const report = {
        status: 'unhealthy',
        totalModules: 0,
        healthyModules: 0,
        totalAgents: 0,
        totalWorkflows: 0,
        modules: [],
        issues: ['Manifest file not found']
      };

      const formatted = formatHealthReport(report);

      expect(formatted).toContain('UNHEALTHY');
      expect(formatted).toContain('[FAIL]');
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should handle modules with special characters in name', () => {
      if (!checkModule) expect.fail('checkModule not implemented');

      createMockModule('my-special_module.v2', { agentCount: 1, workflowCount: 1 });

      const result = checkModule('my-special_module.v2', MOCK_PROJECT_ROOT);

      expect(result.code).toBe('my-special_module.v2');
    });

    it('should handle deeply nested workflow directories', () => {
      if (!verifyWorkflowsDirectory) expect.fail('verifyWorkflowsDirectory not implemented');

      createMockModule('nested-workflows', { workflowCount: 0 });

      // Create nested workflow structure
      const workflowsPath = path.join(MOCK_BMAD_PATH, 'nested-workflows', 'workflows');
      fs.mkdirSync(workflowsPath, { recursive: true });

      // Nested category with workflows inside
      const categoryPath = path.join(workflowsPath, 'category-a');
      fs.mkdirSync(categoryPath, { recursive: true });

      const wf1 = path.join(categoryPath, 'workflow-1');
      fs.mkdirSync(wf1, { recursive: true });
      fs.writeFileSync(path.join(wf1, 'workflow.md'), '# WF1');

      const wf2 = path.join(categoryPath, 'workflow-2');
      fs.mkdirSync(wf2, { recursive: true });
      fs.writeFileSync(path.join(wf2, 'workflow.yaml'), 'name: WF2');

      const result = verifyWorkflowsDirectory('nested-workflows', MOCK_PROJECT_ROOT);
      expect(result).toBe(2);
    });

    it('should handle manifest with only old modules array', () => {
      if (!checkAllModules) expect.fail('checkAllModules not implemented');

      fs.writeFileSync(MOCK_MANIFEST_PATH, createMockManifestYaml({
        enabledModules: [],
        modules: ['legacy-mod'],
        useEnabledModules: false
      }));

      createMockModule('legacy-mod', { agentCount: 1, workflowCount: 1 });

      const result = checkAllModules(MOCK_PROJECT_ROOT);

      expect(result.totalModules).toBe(1);
      expect(result.modules[0].code).toBe('legacy-mod');
    });

    it('should handle empty agents directory', () => {
      if (!verifyAgentsDirectory) expect.fail('verifyAgentsDirectory not implemented');

      createMockModule('empty-agents', { agentCount: 0 });

      // Create empty agents directory
      const agentsPath = path.join(MOCK_BMAD_PATH, 'empty-agents', 'agents');
      fs.mkdirSync(agentsPath, { recursive: true });

      const result = verifyAgentsDirectory('empty-agents', MOCK_PROJECT_ROOT);
      expect(result).toBe(0);
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS require)', async () => {
      const modulePath = path.join(__dirname, 'module-checker.js');

      if (!fs.existsSync(modulePath)) {
        return;
      }

      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use export statements', async () => {
      const modulePath = path.join(__dirname, 'module-checker.js');

      if (!fs.existsSync(modulePath)) {
        return;
      }

      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      expect(moduleContent).toMatch(/\bexport\s+(function|const|async)/);
    });

    it('should use ESM entry point detection', async () => {
      const modulePath = path.join(__dirname, 'module-checker.js');

      if (!fs.existsSync(modulePath)) {
        return;
      }

      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      expect(moduleContent).toMatch(/import\.meta\.url/);
      expect(moduleContent).toMatch(/fileURLToPath/);
    });
  });
});
