/**
 * Module YAML Parser - INST-001
 * Epic 1, Story 1 - Interactive Module Selection
 *
 * Discovers and parses module.yaml files to enable interactive module selection
 * during the BMAD installation wizard.
 *
 * @module module-loader
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default project root - can be overridden
const DEFAULT_BMAD_PATH = '_bmad';

/**
 * @typedef {Object} ModuleMetadata
 * @property {string} code - Unique module identifier
 * @property {string} name - Human-readable module name
 * @property {string} description - Module description (from first line of prompt)
 * @property {boolean} required - Whether this module is required (cannot be deselected)
 * @property {boolean} defaultSelected - Whether module is selected by default
 * @property {string[]} prompt - Welcome message array shown during installation
 * @property {number} agentCount - Number of agents in this module
 * @property {number} workflowCount - Number of workflows in this module
 * @property {number} estimatedSizeKB - Estimated module size in KB
 * @property {string} agentsPath - Path to agents directory
 * @property {string} workflowsPath - Path to workflows directory
 * @property {string} moduleVersion - Module version string
 * @property {Object} interactiveFields - Fields that require user prompts during installation
 * @property {string} modulePath - Absolute path to the module directory
 */

/**
 * Scans the _bmad directory for subdirectories containing module.yaml files
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {string[]} Array of directory paths containing module.yaml files
 */
export function scanModuleDirectories(projectRoot = process.cwd()) {
  const bmadPath = path.join(projectRoot, DEFAULT_BMAD_PATH);
  const moduleDirectories = [];

  // Check if _bmad directory exists
  if (!fs.existsSync(bmadPath)) {
    console.warn(`Warning: _bmad directory not found at ${bmadPath}`);
    return moduleDirectories;
  }

  try {
    const entries = fs.readdirSync(bmadPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip non-directories and special directories (starting with _)
      if (!entry.isDirectory() || entry.name.startsWith('_')) {
        continue;
      }

      const moduleYamlPath = path.join(bmadPath, entry.name, 'module.yaml');

      // Check if module.yaml exists in this directory
      if (fs.existsSync(moduleYamlPath)) {
        moduleDirectories.push(path.join(bmadPath, entry.name));
      }
    }
  } catch (error) {
    console.error(`Error scanning module directories: ${error.message}`);
  }

  return moduleDirectories;
}

/**
 * Parses a YAML file without external dependencies
 * Simple YAML parser for module.yaml structure
 * @param {string} yamlContent - Raw YAML content
 * @returns {Object} Parsed YAML as JavaScript object
 */
function parseSimpleYaml(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;
  let inArray = false;
  let inNestedObject = false;
  let objectKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trimEnd();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Check for array item (starts with -)
    const arrayMatch = trimmedLine.match(/^(\s*)- (.*)$/);
    if (arrayMatch) {
      const indent = arrayMatch[1].length;
      const value = arrayMatch[2].trim();

      if (inArray && currentKey) {
        // Handle quoted strings
        let parsedValue = value;
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          parsedValue = value.slice(1, -1);
        }
        currentArray.push(parsedValue);
      }
      continue;
    }

    // Check for key-value pair
    const keyValueMatch = trimmedLine.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (keyValueMatch) {
      const indent = keyValueMatch[1].length;
      const key = keyValueMatch[2];
      let value = keyValueMatch[3].trim();

      // Top-level key (no indent)
      if (indent === 0) {
        inNestedObject = false;
        currentObject = null;
        objectKey = null;

        if (value === '') {
          // Could be array or nested object - check next line
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.trim().startsWith('-')) {
            // It's an array
            currentArray = [];
            result[key] = currentArray;
            currentKey = key;
            inArray = true;
          } else if (nextLine && nextLine.match(/^\s+[a-zA-Z_]/)) {
            // It's a nested object
            currentObject = {};
            result[key] = currentObject;
            objectKey = key;
            inNestedObject = true;
            inArray = false;
            currentKey = null;
          }
        } else {
          // Direct value
          inArray = false;
          currentKey = null;
          result[key] = parseYamlValue(value);
        }
      } else if (indent > 0 && inNestedObject && currentObject) {
        // Nested key-value within an object
        if (value === '') {
          // Nested object within nested object - just skip for now
          continue;
        }
        currentObject[key] = parseYamlValue(value);
      }
    }
  }

  return result;
}

/**
 * Parses a YAML value string into appropriate JavaScript type
 * @param {string} value - Raw value string
 * @returns {*} Parsed value
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
 * Parses a module.yaml file and extracts module metadata
 * @param {string} modulePath - Path to the module directory
 * @returns {ModuleMetadata|null} Parsed module metadata or null if parsing fails
 */
export function parseModuleYaml(modulePath) {
  const yamlPath = path.join(modulePath, 'module.yaml');

  if (!fs.existsSync(yamlPath)) {
    console.warn(`Warning: module.yaml not found at ${yamlPath}`);
    return null;
  }

  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const parsedYaml = parseSimpleYaml(yamlContent);

    // Extract essential fields with defaults
    const code = parsedYaml.code || path.basename(modulePath);
    const name = parsedYaml.name || code;
    const defaultSelected = parsedYaml.default_selected ?? false;
    const required = parsedYaml.required ?? false;
    const prompt = Array.isArray(parsedYaml.prompt) ? parsedYaml.prompt : [];

    // Extract description from prompt (first non-empty line)
    let description = '';
    for (const line of prompt) {
      const trimmed = String(line).trim();
      if (trimmed && !trimmed.startsWith('-')) {
        description = trimmed;
        break;
      }
    }

    // Extract paths
    const agentsPath = extractResultPath(parsedYaml.agents_path, modulePath);
    const workflowsPath = extractResultPath(parsedYaml.workflows_path, modulePath);

    // Count agents and workflows
    const agentCount = countAgents(agentsPath);
    const workflowCount = countWorkflows(workflowsPath);

    // Calculate estimated size
    const estimatedSizeKB = calculateEstimatedSize(agentCount, workflowCount);

    // Extract module version
    const moduleVersion = extractResultValue(parsedYaml.module_version) || '1.0.0';

    // Extract interactive fields (those with 'prompt' key)
    const interactiveFields = extractInteractiveFields(parsedYaml);

    return {
      code,
      name,
      description,
      required,
      defaultSelected,
      prompt,
      agentCount,
      workflowCount,
      estimatedSizeKB,
      agentsPath,
      workflowsPath,
      moduleVersion,
      interactiveFields,
      modulePath
    };
  } catch (error) {
    console.error(`Error parsing module.yaml at ${yamlPath}: ${error.message}`);
    return null;
  }
}

/**
 * Extracts the result path from a config field, replacing placeholders
 * @param {Object|string} field - Config field object or direct value
 * @param {string} modulePath - Module directory path for fallback
 * @returns {string} Resolved path
 */
function extractResultPath(field, modulePath) {
  if (!field) {
    return modulePath;
  }

  let resultValue = '';
  if (typeof field === 'object' && field.result) {
    resultValue = field.result;
  } else if (typeof field === 'string') {
    resultValue = field;
  }

  // Replace {project-root} placeholder with actual path
  const projectRoot = process.cwd();
  return resultValue.replace('{project-root}', projectRoot);
}

/**
 * Extracts a simple result value from a config field
 * @param {Object|string} field - Config field object or direct value
 * @returns {string|null} Extracted value
 */
function extractResultValue(field) {
  if (!field) return null;
  if (typeof field === 'object' && field.result) {
    return field.result;
  }
  if (typeof field === 'string') {
    return field;
  }
  return null;
}

/**
 * Extracts interactive fields that require user prompts
 * @param {Object} parsedYaml - Parsed module.yaml content
 * @returns {Object} Map of field names to their prompt configurations
 */
function extractInteractiveFields(parsedYaml) {
  const interactiveFields = {};

  for (const [key, value] of Object.entries(parsedYaml)) {
    if (typeof value === 'object' && value !== null && value.prompt) {
      interactiveFields[key] = {
        prompt: value.prompt,
        default: value.default || '',
        result: value.result || ''
      };
    }
  }

  return interactiveFields;
}

/**
 * Counts the number of agent files in the agents directory
 * @param {string} agentsPath - Path to the agents directory
 * @returns {number} Number of .md files found
 */
export function countAgents(agentsPath) {
  if (!agentsPath || !fs.existsSync(agentsPath)) {
    return 0;
  }

  try {
    const files = fs.readdirSync(agentsPath);
    return files.filter(file => file.endsWith('.md')).length;
  } catch (error) {
    console.warn(`Warning: Could not read agents directory at ${agentsPath}`);
    return 0;
  }
}

/**
 * Counts the number of workflow files in the workflows directory
 * Counts both .yaml/.yml files and directories containing workflow.md files
 * @param {string} workflowsPath - Path to the workflows directory
 * @returns {number} Number of workflows found
 */
export function countWorkflows(workflowsPath) {
  if (!workflowsPath || !fs.existsSync(workflowsPath)) {
    return 0;
  }

  try {
    return countWorkflowsRecursively(workflowsPath);
  } catch (error) {
    console.warn(`Warning: Could not read workflows directory at ${workflowsPath}`);
    return 0;
  }
}

/**
 * Recursively counts workflows in a directory
 * Workflows can be either:
 * - .yaml/.yml files
 * - Directories containing workflow.md or workflow.yaml files
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
 * Calculates estimated module size based on file counts
 * Uses heuristic: (agentCount * 5KB) + (workflowCount * 2KB)
 * @param {number} agentCount - Number of agent files
 * @param {number} workflowCount - Number of workflow files
 * @returns {number} Estimated size in KB
 */
export function calculateEstimatedSize(agentCount, workflowCount) {
  const AGENT_SIZE_KB = 5;
  const WORKFLOW_SIZE_KB = 2;

  return (agentCount * AGENT_SIZE_KB) + (workflowCount * WORKFLOW_SIZE_KB);
}

/**
 * Loads all available modules from the _bmad directory
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {ModuleMetadata[]} Array of module metadata objects
 */
export function loadAllModules(projectRoot = process.cwd()) {
  const moduleDirs = scanModuleDirectories(projectRoot);
  const modules = [];

  for (const moduleDir of moduleDirs) {
    const moduleData = parseModuleYaml(moduleDir);

    if (moduleData) {
      modules.push(moduleData);
    }
  }

  // Sort modules: required first, then by code
  modules.sort((a, b) => {
    // Required modules first
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;

    // Then alphabetically by code
    return a.code.localeCompare(b.code);
  });

  return modules;
}

/**
 * Gets a summary of all loaded modules
 * @param {ModuleMetadata[]} modules - Array of module metadata
 * @returns {Object} Summary object with totals
 */
export function getModuleSummary(modules) {
  const totalAgents = modules.reduce((sum, m) => sum + m.agentCount, 0);
  const totalWorkflows = modules.reduce((sum, m) => sum + m.workflowCount, 0);
  const totalSizeKB = modules.reduce((sum, m) => sum + m.estimatedSizeKB, 0);
  const requiredCount = modules.filter(m => m.required).length;
  const optionalCount = modules.length - requiredCount;

  return {
    moduleCount: modules.length,
    requiredCount,
    optionalCount,
    totalAgents,
    totalWorkflows,
    totalSizeKB,
    totalSizeMB: (totalSizeKB / 1024).toFixed(2)
  };
}

/**
 * Finds a module by its code
 * @param {ModuleMetadata[]} modules - Array of module metadata
 * @param {string} code - Module code to find
 * @returns {ModuleMetadata|undefined} Found module or undefined
 */
export function findModuleByCode(modules, code) {
  return modules.find(m => m.code === code);
}

// ESM Entry point detection
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Running as main script - display loaded modules
  console.log('BMAD Module Loader - Discovery Test\n');
  console.log('='.repeat(50));

  const modules = loadAllModules();
  const summary = getModuleSummary(modules);

  console.log(`\nDiscovered ${summary.moduleCount} modules:\n`);

  for (const mod of modules) {
    const requiredTag = mod.required ? ' [REQUIRED]' : '';
    const selectedTag = mod.defaultSelected ? ' *' : '';
    console.log(`  ${mod.code}${requiredTag}${selectedTag}`);
    console.log(`    Name: ${mod.name}`);
    console.log(`    Agents: ${mod.agentCount}, Workflows: ${mod.workflowCount}`);
    console.log(`    Est. Size: ${mod.estimatedSizeKB} KB`);
    console.log('');
  }

  console.log('='.repeat(50));
  console.log(`Summary:`);
  console.log(`  Total Modules: ${summary.moduleCount} (${summary.requiredCount} required, ${summary.optionalCount} optional)`);
  console.log(`  Total Agents: ${summary.totalAgents}`);
  console.log(`  Total Workflows: ${summary.totalWorkflows}`);
  console.log(`  Estimated Total Size: ~${summary.totalSizeMB} MB`);
  console.log('\n* = selected by default');
}
