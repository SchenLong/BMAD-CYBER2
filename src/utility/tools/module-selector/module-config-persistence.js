/**
 * Module Configuration Persistence - INST-005
 * Epic 1, Story 5 - Per-Module Configuration Prompts
 *
 * Handles saving and loading per-module configuration settings.
 * Each module can have its own configuration stored in YAML format
 * under _bmad/_config/modules/{moduleCode}.yaml
 *
 * @module module-config-persistence
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
 * Path to the modules configuration directory relative to project root
 * @type {string}
 */
export const MODULES_CONFIG_DIR = '_bmad/_config/modules';

/**
 * Current wizard version for metadata tracking
 * @type {string}
 */
const WIZARD_VERSION = '2.0.0';

/**
 * Serializes a JavaScript object to YAML format
 * Handles strings, numbers, booleans, arrays, and nested objects
 *
 * @param {Object} obj - Object to serialize
 * @param {number} [indent=0] - Current indentation level
 * @returns {string} YAML formatted string
 */
function serializeYaml(obj, indent = 0) {
  const lines = [];
  const indentStr = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      lines.push(`${indentStr}${key}: null`);
    } else if (Array.isArray(value)) {
      lines.push(`${indentStr}${key}:`);
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          // Complex array items (objects)
          const objLines = serializeYaml(item, indent + 2).split('\n');
          lines.push(`${indentStr}  - ${objLines[0].trim()}`);
          for (let i = 1; i < objLines.length; i++) {
            if (objLines[i].trim()) {
              lines.push(`${indentStr}    ${objLines[i].trim()}`);
            }
          }
        } else {
          // Simple array items
          lines.push(`${indentStr}  - ${formatYamlValue(item)}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${indentStr}${key}:`);
      const nestedYaml = serializeYaml(value, indent + 1);
      lines.push(nestedYaml);
    } else {
      lines.push(`${indentStr}${key}: ${formatYamlValue(value)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Formats a JavaScript value for YAML output
 *
 * @param {*} value - Value to format
 * @returns {string} YAML formatted value
 */
function formatYamlValue(value) {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    // Quote strings that contain special characters or look like other types
    if (value.includes(':') || value.includes('#') || value.includes('\n') ||
        value.includes("'") || value.includes('"') ||
        value === 'true' || value === 'false' || value === 'null' ||
        /^-?\d+(\.\d+)?$/.test(value)) {
      // Use single quotes, escaping any single quotes in the string
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }
  return String(value);
}

/**
 * Simple YAML parser for module configuration files
 * Handles nested objects, arrays, and basic value types
 *
 * @param {string} yamlContent - Raw YAML content
 * @returns {Object} Parsed YAML as JavaScript object
 */
function parseYaml(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n');
  const stack = [{ obj: result, indent: -1 }];
  let currentArray = null;
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
          currentArrayIndent = nextLine.search(/\S/);
        } else {
          // It's a nested object
          const nestedObj = {};
          parent[key] = nestedObj;
          stack.push({ obj: nestedObj, indent: keyIndent });
          currentArray = null;
        }
      } else {
        // Direct value
        parent[key] = parseYamlValue(value);
        currentArray = null;
      }
    }
  }

  return result;
}

/**
 * Parses a YAML value string into appropriate JavaScript type
 *
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
 * Creates a directory recursively
 * Handles both absolute and relative paths
 *
 * @param {string} dirPath - Directory path to create (absolute or relative)
 * @param {string} [projectRoot=process.cwd()] - Root directory for relative paths
 * @returns {{ success: boolean, path: string, error?: string }} Creation result
 * @example
 * const result = createOutputDirectory('_bmad-output/intel-team/reports');
 * if (result.success) {
 *   console.log(`Created directory: ${result.path}`);
 * }
 */
export function createOutputDirectory(dirPath, projectRoot = process.cwd()) {
  // Determine absolute path
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.join(projectRoot, dirPath);

  try {
    // Create directory recursively if it doesn't exist
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
      console.log(`Created directory: ${absolutePath}`);
    }

    return {
      success: true,
      path: absolutePath
    };
  } catch (error) {
    return {
      success: false,
      path: absolutePath,
      error: error.message
    };
  }
}

/**
 * Ensures the modules configuration directory exists
 * Creates _bmad/_config/modules/ directory if it doesn't exist
 *
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {boolean} True if directory exists or was created successfully
 * @example
 * if (ensureModulesConfigDirectory()) {
 *   console.log('Module config directory ready');
 * }
 */
export function ensureModulesConfigDirectory(projectRoot = process.cwd()) {
  const result = createOutputDirectory(MODULES_CONFIG_DIR, projectRoot);
  return result.success;
}

/**
 * Saves a module configuration to its YAML file
 * Uses atomic write pattern (write to .tmp then rename) for safety
 *
 * @param {string} moduleCode - Module identifier (e.g., 'intel-team', 'bmm')
 * @param {Object} config - Configuration object to save
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ success: boolean, path?: string, error?: string }} Save result
 * @example
 * const result = saveModuleConfig('intel-team', {
 *   output_folder: '/path/to/output',
 *   collection_artifacts: '/path/to/collection'
 * });
 */
export function saveModuleConfig(moduleCode, config, projectRoot = process.cwd()) {
  // Validate inputs
  if (!moduleCode || typeof moduleCode !== 'string') {
    return { success: false, error: 'moduleCode must be a non-empty string' };
  }

  if (!config || typeof config !== 'object') {
    return { success: false, error: 'config must be an object' };
  }

  // Ensure the modules config directory exists
  if (!ensureModulesConfigDirectory(projectRoot)) {
    return { success: false, error: 'Failed to create modules config directory' };
  }

  // Build the config file path
  const configPath = path.join(projectRoot, MODULES_CONFIG_DIR, `${moduleCode}.yaml`);
  const tempPath = `${configPath}.tmp`;

  // Add metadata to config
  const configWithMetadata = {
    ...config,
    last_modified: new Date().toISOString(),
    wizard_version: WIZARD_VERSION
  };

  try {
    // Build YAML content with header comment
    const header = `# Module configuration for ${moduleCode}\n`;
    const yamlContent = serializeYaml(configWithMetadata);
    const fullContent = header + yamlContent + '\n';

    // Write to temp file first (atomic write pattern)
    fs.writeFileSync(tempPath, fullContent, 'utf8');

    // Atomic rename (ensures file is fully written or not at all)
    fs.renameSync(tempPath, configPath);

    console.log(`Module config saved: ${configPath}`);
    return {
      success: true,
      path: configPath
    };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reads an existing module configuration from its YAML file
 * Returns an empty object if the file doesn't exist
 *
 * @param {string} moduleCode - Module identifier (e.g., 'intel-team', 'bmm')
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object} Parsed configuration object or empty object if not found
 * @example
 * const config = readModuleConfig('intel-team');
 * if (config.output_folder) {
 *   console.log(`Output folder: ${config.output_folder}`);
 * }
 */
export function readModuleConfig(moduleCode, projectRoot = process.cwd()) {
  // Validate input
  if (!moduleCode || typeof moduleCode !== 'string') {
    console.warn('readModuleConfig: moduleCode must be a non-empty string');
    return {};
  }

  // Build the config file path
  const configPath = path.join(projectRoot, MODULES_CONFIG_DIR, `${moduleCode}.yaml`);

  // Check if file exists
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return parseYaml(content);
  } catch (error) {
    console.warn(`Warning: Could not read module config at ${configPath}: ${error.message}`);
    return {};
  }
}

// ESM Entry point detection for self-test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('BMAD Module Config Persistence - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: createOutputDirectory
  console.log('\n1. createOutputDirectory() Test:');
  const testDir = '/tmp/bmad-test-' + Date.now();
  const dirResult = createOutputDirectory(testDir);
  console.log(`   Created directory: ${dirResult.success ? 'PASS' : 'FAIL'}`);
  console.log(`   Path: ${dirResult.path}`);

  // Cleanup test directory
  if (fs.existsSync(testDir)) {
    fs.rmdirSync(testDir);
    console.log('   Cleaned up test directory');
  }

  // Test 2: ensureModulesConfigDirectory
  console.log('\n2. ensureModulesConfigDirectory() Test:');
  const ensureResult = ensureModulesConfigDirectory();
  console.log(`   Directory ensured: ${ensureResult ? 'PASS' : 'FAIL'}`);

  // Test 3: saveModuleConfig
  console.log('\n3. saveModuleConfig() Test:');
  const testConfig = {
    output_folder: '/Users/test/BMAD-PROJECT/_bmad-output/intel-team',
    collection_artifacts: '/Users/test/BMAD-PROJECT/_bmad-output/intel-team/collection',
    analysis_artifacts: '/Users/test/BMAD-PROJECT/_bmad-output/intel-team/analysis',
    reports: '/Users/test/BMAD-PROJECT/_bmad-output/intel-team/reports'
  };
  const saveResult = saveModuleConfig('intel-team-test', testConfig);
  console.log(`   Save result: ${saveResult.success ? 'PASS' : 'FAIL'}`);
  if (saveResult.path) {
    console.log(`   Saved to: ${saveResult.path}`);
  }
  if (saveResult.error) {
    console.log(`   Error: ${saveResult.error}`);
  }

  // Test 4: readModuleConfig
  console.log('\n4. readModuleConfig() Test:');
  const readConfig = readModuleConfig('intel-team-test');
  if (Object.keys(readConfig).length > 0) {
    console.log('   Read result: PASS');
    console.log(`   output_folder: ${readConfig.output_folder}`);
    console.log(`   last_modified: ${readConfig.last_modified}`);
    console.log(`   wizard_version: ${readConfig.wizard_version}`);
  } else {
    console.log('   Read result: No config found (may not have written)');
  }

  // Test 5: readModuleConfig for non-existent module
  console.log('\n5. readModuleConfig() for non-existent module:');
  const emptyConfig = readModuleConfig('non-existent-module-xyz');
  console.log(`   Returns empty object: ${Object.keys(emptyConfig).length === 0 ? 'PASS' : 'FAIL'}`);

  // Cleanup test config file
  console.log('\n6. Cleanup:');
  const testConfigPath = path.join(process.cwd(), MODULES_CONFIG_DIR, 'intel-team-test.yaml');
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
    console.log('   Removed test config file');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete.\n');
  console.log('Exported functions:');
  console.log('  - MODULES_CONFIG_DIR');
  console.log('  - createOutputDirectory(dirPath, projectRoot)');
  console.log('  - ensureModulesConfigDirectory(projectRoot)');
  console.log('  - saveModuleConfig(moduleCode, config, projectRoot)');
  console.log('  - readModuleConfig(moduleCode, projectRoot)');
}
