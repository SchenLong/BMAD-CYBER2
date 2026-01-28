/**
 * Module Loading Verifier - INST-019
 * Epic 4, Post-Install Health Check
 *
 * Verifies that enabled modules from the manifest are properly installed
 * with expected directory structures, agents, and workflows.
 *
 * @module module-checker
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the manifest file relative to project root
 * @type {string}
 */
export const MANIFEST_PATH = '_bmad/_config/manifest.yaml';

/**
 * Path to the BMAD modules directory
 * @type {string}
 */
export const BMAD_PATH = '_bmad';

/**
 * @typedef {Object} ModuleCheckResult
 * @property {string} code - Module code/identifier
 * @property {'healthy'|'degraded'|'unhealthy'} status - Module health status
 * @property {number} agentCount - Number of agents found
 * @property {number} workflowCount - Number of workflows found
 * @property {string[]} issues - List of issues found for this module
 */

/**
 * @typedef {Object} ModuleHealthReport
 * @property {'healthy'|'degraded'|'unhealthy'} status - Overall health status
 * @property {number} totalModules - Total number of enabled modules
 * @property {number} healthyModules - Number of healthy modules
 * @property {number} totalAgents - Total agents across all modules
 * @property {number} totalWorkflows - Total workflows across all modules
 * @property {ModuleCheckResult[]} modules - Individual module results
 * @property {string[]} issues - Global issues (not specific to any module)
 */

/**
 * Simple YAML parser for manifest.yaml structure
 * @param {string} yamlContent - Raw YAML content
 * @returns {Object} Parsed YAML as JavaScript object
 */
export function parseYaml(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n');
  const stack = [{ obj: result, indent: -1 }];
  let currentArray = null;
  let currentArrayKey = null;
  let currentArrayIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trimEnd();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.trim().startsWith('#')) {
      continue;
    }

    // Calculate indentation
    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // Handle array items
    const arrayMatch = trimmedLine.match(/^(\s*)- (.*)$/);
    if (arrayMatch) {
      const arrayIndent = arrayMatch[1].length;
      const value = arrayMatch[2].trim();

      if (currentArray && arrayIndent === currentArrayIndent) {
        currentArray.push(parseYamlValue(value));
      }
      continue;
    }

    // Handle key-value pairs
    const keyValueMatch = trimmedLine.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (keyValueMatch) {
      const keyIndent = keyValueMatch[1].length;
      const key = keyValueMatch[2];
      const value = keyValueMatch[3].trim();

      // Pop stack to find correct parent
      while (stack.length > 1 && stack[stack.length - 1].indent >= keyIndent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      if (value === '') {
        // Check if next line is an array or nested object
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim().startsWith('-')) {
          // It's an array
          currentArray = [];
          parent[key] = currentArray;
          currentArrayKey = key;
          currentArrayIndent = nextLine.search(/\S/);
        } else {
          // It's a nested object
          const nestedObj = {};
          parent[key] = nestedObj;
          stack.push({ obj: nestedObj, indent: keyIndent });
          currentArray = null;
          currentArrayKey = null;
        }
      } else {
        // Direct value
        parent[key] = parseYamlValue(value);
        currentArray = null;
        currentArrayKey = null;
      }
    }
  }

  return result;
}

/**
 * Parses a YAML value string into appropriate JavaScript type
 * @param {string} value - Raw value string
 * @returns {*} Parsed value (string, number, boolean, or null)
 */
function parseYamlValue(value) {
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Number
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  // Null/undefined
  if (value === 'null' || value === '~') return null;

  return value;
}

/**
 * Reads and parses the manifest.yaml file
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object} Parsed manifest or empty object if file doesn't exist
 */
export function readManifest(projectRoot = process.cwd()) {
  const manifestPath = path.join(projectRoot, MANIFEST_PATH);

  if (!fs.existsSync(manifestPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return parseYaml(content);
  } catch (error) {
    return {};
  }
}

/**
 * Extracts enabled module codes from manifest
 * Supports both 'enabled_modules' and 'modules' arrays for backward compatibility
 * @param {Object} manifest - Parsed manifest object
 * @returns {string[]} Array of enabled module codes
 */
export function getEnabledModules(manifest) {
  // Prefer enabled_modules, fall back to modules for backward compatibility
  const enabledModules = manifest.enabled_modules || manifest.modules;

  if (!enabledModules || !Array.isArray(enabledModules)) {
    return [];
  }

  // Filter out any non-string values and ensure uniqueness
  return [...new Set(
    enabledModules.filter(code => typeof code === 'string' && code.trim() !== '')
  )];
}

/**
 * Checks if a module.yaml file exists for a given module
 * @param {string} moduleCode - Module code/identifier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {boolean} True if module.yaml exists
 */
export function verifyModuleExists(moduleCode, projectRoot = process.cwd()) {
  const modulePath = path.join(projectRoot, BMAD_PATH, moduleCode, 'module.yaml');
  return fs.existsSync(modulePath);
}

/**
 * Parses a module.yaml file to extract agent and workflow paths
 * @param {string} moduleCode - Module code/identifier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object|null} Module config with agents_path and workflows_path, or null if not found
 */
export function parseModuleConfig(moduleCode, projectRoot = process.cwd()) {
  const modulePath = path.join(projectRoot, BMAD_PATH, moduleCode, 'module.yaml');

  if (!fs.existsSync(modulePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(modulePath, 'utf8');
    const config = parseYaml(content);
    return config;
  } catch (error) {
    return null;
  }
}

/**
 * Resolves a path that may contain placeholders like {project-root}
 * @param {string|Object} pathValue - Path string or object with result property
 * @param {string} moduleCode - Module code for default path
 * @param {string} projectRoot - Project root directory
 * @returns {string} Resolved absolute path
 */
function resolvePath(pathValue, moduleCode, projectRoot) {
  let resolvedPath = '';

  if (typeof pathValue === 'object' && pathValue !== null && pathValue.result) {
    resolvedPath = pathValue.result;
  } else if (typeof pathValue === 'string') {
    resolvedPath = pathValue;
  } else {
    // Default to module directory
    return path.join(projectRoot, BMAD_PATH, moduleCode);
  }

  // Replace {project-root} placeholder
  return resolvedPath.replace('{project-root}', projectRoot);
}

/**
 * Counts agent files (.md files) in the agents directory
 * @param {string} moduleCode - Module code/identifier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {number} Number of agent .md files found
 */
export function verifyAgentsDirectory(moduleCode, projectRoot = process.cwd()) {
  const config = parseModuleConfig(moduleCode, projectRoot);

  // Get agents path from config or use default
  let agentsPath;
  if (config && config.agents_path) {
    agentsPath = resolvePath(config.agents_path, moduleCode, projectRoot);
  } else {
    agentsPath = path.join(projectRoot, BMAD_PATH, moduleCode, 'agents');
  }

  if (!fs.existsSync(agentsPath)) {
    return 0;
  }

  try {
    const entries = fs.readdirSync(agentsPath, { withFileTypes: true });
    return entries.filter(entry => entry.isFile() && entry.name.endsWith('.md')).length;
  } catch (error) {
    return 0;
  }
}

/**
 * Counts workflow files in the workflows directory
 * Counts both .yaml/.yml files and directories containing workflow.md files
 * @param {string} moduleCode - Module code/identifier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {number} Number of workflows found
 */
export function verifyWorkflowsDirectory(moduleCode, projectRoot = process.cwd()) {
  const config = parseModuleConfig(moduleCode, projectRoot);

  // Get workflows path from config or use default
  let workflowsPath;
  if (config && config.workflows_path) {
    workflowsPath = resolvePath(config.workflows_path, moduleCode, projectRoot);
  } else {
    workflowsPath = path.join(projectRoot, BMAD_PATH, moduleCode, 'workflows');
  }

  if (!fs.existsSync(workflowsPath)) {
    return 0;
  }

  try {
    return countWorkflowsRecursively(workflowsPath);
  } catch (error) {
    return 0;
  }
}

/**
 * Recursively counts workflows in a directory
 * @param {string} dirPath - Directory path to scan
 * @returns {number} Count of workflows
 */
function countWorkflowsRecursively(dirPath) {
  let count = 0;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory IS a workflow (contains workflow.md or workflow.yaml)
        const hasWorkflowMd = fs.existsSync(path.join(fullPath, 'workflow.md'));
        const hasWorkflowYaml = fs.existsSync(path.join(fullPath, 'workflow.yaml'));

        if (hasWorkflowMd || hasWorkflowYaml) {
          count++;
        } else {
          // Not a workflow directory, recurse into it
          count += countWorkflowsRecursively(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
        // Skip module.yaml, manifest.yaml, config.yaml etc. - only count workflow definitions
        if (entry.name === 'workflow.yaml' || entry.name === 'workflow.yml') {
          // Already counted as directory workflow, skip
          continue;
        }
        // Count standalone yaml files that aren't common config files
        const excludeFiles = ['module.yaml', 'manifest.yaml', 'config.yaml', 'module.yml', 'manifest.yml', 'config.yml'];
        if (!excludeFiles.includes(entry.name)) {
          count++;
        }
      }
    }
  } catch (error) {
    // Silently handle permission errors
  }

  return count;
}

/**
 * Checks a single module's health status
 * @param {string} moduleCode - Module code/identifier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {ModuleCheckResult} Module health check result
 */
export function checkModule(moduleCode, projectRoot = process.cwd()) {
  const issues = [];
  let status = 'healthy';

  // Check if module.yaml exists
  const moduleExists = verifyModuleExists(moduleCode, projectRoot);
  if (!moduleExists) {
    issues.push(`Module ${moduleCode}: module.yaml not found`);
    return {
      code: moduleCode,
      status: 'unhealthy',
      agentCount: 0,
      workflowCount: 0,
      issues
    };
  }

  // Count agents
  const agentCount = verifyAgentsDirectory(moduleCode, projectRoot);
  if (agentCount === 0) {
    issues.push(`Module ${moduleCode}: No agents found in agents directory`);
    status = 'degraded';
  }

  // Count workflows
  const workflowCount = verifyWorkflowsDirectory(moduleCode, projectRoot);
  if (workflowCount === 0) {
    issues.push(`Module ${moduleCode}: No workflows found in workflows directory`);
    // Only degrade if both agents and workflows are missing
    if (agentCount === 0) {
      status = 'unhealthy';
    } else if (status === 'healthy') {
      status = 'degraded';
    }
  }

  // Validate module config structure
  const config = parseModuleConfig(moduleCode, projectRoot);
  if (config) {
    if (!config.code && !config.name) {
      issues.push(`Module ${moduleCode}: module.yaml missing code or name field`);
      if (status === 'healthy') {
        status = 'degraded';
      }
    }
  }

  return {
    code: moduleCode,
    status,
    agentCount,
    workflowCount,
    issues
  };
}

/**
 * Checks all enabled modules from the manifest
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {ModuleHealthReport} Complete health report for all modules
 */
export function checkAllModules(projectRoot = process.cwd()) {
  const globalIssues = [];

  // Read manifest
  const manifest = readManifest(projectRoot);
  if (!manifest || Object.keys(manifest).length === 0) {
    return {
      status: 'unhealthy',
      totalModules: 0,
      healthyModules: 0,
      totalAgents: 0,
      totalWorkflows: 0,
      modules: [],
      issues: ['Manifest file not found or empty at ' + MANIFEST_PATH]
    };
  }

  // Get enabled modules
  const enabledModules = getEnabledModules(manifest);
  if (enabledModules.length === 0) {
    return {
      status: 'unhealthy',
      totalModules: 0,
      healthyModules: 0,
      totalAgents: 0,
      totalWorkflows: 0,
      modules: [],
      issues: ['No enabled modules found in manifest (checked enabled_modules and modules arrays)']
    };
  }

  // Check each module
  const moduleResults = [];
  let totalAgents = 0;
  let totalWorkflows = 0;
  let healthyCount = 0;
  let degradedCount = 0;
  let unhealthyCount = 0;

  for (const moduleCode of enabledModules) {
    const result = checkModule(moduleCode, projectRoot);
    moduleResults.push(result);

    totalAgents += result.agentCount;
    totalWorkflows += result.workflowCount;

    if (result.status === 'healthy') {
      healthyCount++;
    } else if (result.status === 'degraded') {
      degradedCount++;
    } else {
      unhealthyCount++;
    }
  }

  // Determine overall status
  let overallStatus = 'healthy';
  if (unhealthyCount > 0) {
    // If any module is unhealthy, the overall status depends on the ratio
    if (unhealthyCount === enabledModules.length) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  }

  // Aggregate issues from modules
  const allIssues = [...globalIssues];
  for (const result of moduleResults) {
    allIssues.push(...result.issues);
  }

  return {
    status: overallStatus,
    totalModules: enabledModules.length,
    healthyModules: healthyCount,
    totalAgents,
    totalWorkflows,
    modules: moduleResults,
    issues: allIssues
  };
}

/**
 * Formats a health report for human-readable output
 * @param {ModuleHealthReport} report - Health report to format
 * @returns {string} Formatted report string
 */
export function formatHealthReport(report) {
  const lines = [];

  lines.push('='.repeat(60));
  lines.push('BMAD Module Health Check Report');
  lines.push('='.repeat(60));
  lines.push('');

  // Overall status
  const statusEmoji = report.status === 'healthy' ? '[OK]' :
                      report.status === 'degraded' ? '[WARN]' : '[FAIL]';
  lines.push(`Overall Status: ${statusEmoji} ${report.status.toUpperCase()}`);
  lines.push('');

  // Summary
  lines.push('Summary:');
  lines.push(`  Total Modules: ${report.totalModules}`);
  lines.push(`  Healthy Modules: ${report.healthyModules}`);
  lines.push(`  Total Agents: ${report.totalAgents}`);
  lines.push(`  Total Workflows: ${report.totalWorkflows}`);
  lines.push('');

  // Module details
  if (report.modules.length > 0) {
    lines.push('Module Details:');
    for (const mod of report.modules) {
      const modStatus = mod.status === 'healthy' ? '[OK]' :
                        mod.status === 'degraded' ? '[WARN]' : '[FAIL]';
      lines.push(`  ${modStatus} ${mod.code}`);
      lines.push(`      Agents: ${mod.agentCount}, Workflows: ${mod.workflowCount}`);
      if (mod.issues.length > 0) {
        for (const issue of mod.issues) {
          lines.push(`      - ${issue}`);
        }
      }
    }
    lines.push('');
  }

  // Issues
  if (report.issues.length > 0) {
    lines.push('Issues Found:');
    for (const issue of report.issues) {
      lines.push(`  - ${issue}`);
    }
    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

// ESM Entry point detection
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('BMAD Module Health Check - Running...\n');

  const report = checkAllModules();
  console.log(formatHealthReport(report));

  // Exit with appropriate code
  if (report.status === 'unhealthy') {
    process.exit(1);
  } else if (report.status === 'degraded') {
    process.exit(2);
  } else {
    process.exit(0);
  }
}
