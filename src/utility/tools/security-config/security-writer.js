/**
 * Security Configuration Writer - INST-009
 * Epic 2, Story 3 - Security Tier Configuration
 *
 * Creates and updates the security-config.yaml file with tier configurations.
 * Uses atomic write pattern (temp file + rename) for safe file operations.
 *
 * @module security-writer
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  getTierById,
  getTierFeatures,
  getValidatorPaths,
  getFeatureDetails,
  isValidTierId
} from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the security config file relative to project root
 * @type {string}
 */
export const SECURITY_CONFIG_PATH = '_bmad/core/security/security-config.yaml';

/**
 * Current security config version
 * @type {string}
 */
export const CONFIG_VERSION = '1.0.0';

/**
 * @typedef {Object} SecurityConfig
 * @property {string} version - Config version
 * @property {string} tier - Selected tier ID
 * @property {string[]} features - Enabled feature codes
 * @property {Object} validators - Validator configurations
 * @property {Object} metadata - Configuration metadata
 */

/**
 * Simple YAML serializer for security config structure
 * @param {Object} obj - Object to serialize
 * @param {number} [indent=0] - Current indentation level
 * @returns {string} YAML formatted string
 */
export function serializeYaml(obj, indent = 0) {
  const lines = [];
  const indentStr = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      lines.push(`${indentStr}${key}: null`);
    } else if (Array.isArray(value)) {
      lines.push(`${indentStr}${key}:`);
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const objLines = serializeYaml(item, indent + 2).split('\n');
          lines.push(`${indentStr}  - ${objLines[0].trim()}`);
          for (let i = 1; i < objLines.length; i++) {
            if (objLines[i].trim()) {
              lines.push(`${indentStr}    ${objLines[i].trim()}`);
            }
          }
        } else {
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
    // Quote strings that contain special characters
    if (value.includes(':') || value.includes('#') || value.includes('\n') ||
        value.includes("'") || value.includes('"') ||
        value === 'true' || value === 'false' || value === 'null' ||
        /^-?\d+(\.\d+)?$/.test(value)) {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }
  return String(value);
}

/**
 * Simple YAML parser for security config structure
 * @param {string} yamlContent - Raw YAML content
 * @returns {Object} Parsed YAML as JavaScript object
 */
export function parseYaml(yamlContent) {
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
        parent[key] = parseYamlValue(value);
        currentArray = null;
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

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value === 'null' || value === '~') return null;

  return value;
}

/**
 * Gets the current user's name from the operating system
 * @returns {string} Current user's name
 */
export function getCurrentUserName() {
  try {
    const userInfo = os.userInfo();
    return userInfo.username || 'unknown';
  } catch (error) {
    return process.env.USER || process.env.USERNAME || 'unknown';
  }
}

/**
 * Creates a security configuration object for a tier
 * @param {string} tierId - Tier ID to configure
 * @param {string[]} [customFeatures] - Optional custom feature list (for advanced override)
 * @returns {SecurityConfig|null} Security configuration object or null if invalid tier
 */
export function createSecurityConfig(tierId, customFeatures = null) {
  if (!isValidTierId(tierId)) {
    return null;
  }

  const tier = getTierById(tierId);
  const features = customFeatures || getTierFeatures(tierId);
  const now = new Date().toISOString();

  // Build validators configuration
  const validators = {};
  for (const feature of features) {
    const paths = getValidatorPaths(feature);
    if (paths.length > 0) {
      const details = getFeatureDetails(feature);
      validators[feature] = {
        enabled: true,
        paths: paths,
        category: details ? details.category : 'Unknown'
      };
    }
  }

  return {
    version: CONFIG_VERSION,
    tier: tierId,
    tier_name: tier.name,
    features: features,
    validators: validators,
    metadata: {
      created_at: now,
      updated_at: now,
      configured_by: getCurrentUserName(),
      is_custom: customFeatures !== null
    }
  };
}

/**
 * Reads the existing security configuration file
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {SecurityConfig|null} Parsed security config or null if not found
 */
export function readSecurityConfig(projectRoot = process.cwd()) {
  const configPath = path.join(projectRoot, SECURITY_CONFIG_PATH);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return parseYaml(content);
  } catch (error) {
    console.warn(`Warning: Could not read security config at ${configPath}: ${error.message}`);
    return null;
  }
}

/**
 * Ensures the security config directory exists
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {boolean} True if directory exists or was created
 */
export function ensureSecurityConfigDirectory(projectRoot = process.cwd()) {
  const configDir = path.dirname(path.join(projectRoot, SECURITY_CONFIG_PATH));

  if (!fs.existsSync(configDir)) {
    try {
      fs.mkdirSync(configDir, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Error creating security config directory: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Writes the security config file atomically using a temp file
 * @param {string} content - YAML content to write
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Write result
 */
export function writeSecurityConfigAtomic(content, projectRoot = process.cwd()) {
  const configPath = path.join(projectRoot, SECURITY_CONFIG_PATH);
  const tempPath = `${configPath}.tmp`;

  try {
    // Ensure directory exists
    if (!ensureSecurityConfigDirectory(projectRoot)) {
      return { success: false, error: 'Failed to create security config directory' };
    }

    // Write to temp file first
    fs.writeFileSync(tempPath, content, 'utf8');

    // Atomic rename
    fs.renameSync(tempPath, configPath);

    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return { success: false, error: error.message };
  }
}

/**
 * Validates a security configuration structure
 * @param {Object} config - Configuration object to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateSecurityConfig(config) {
  const errors = [];

  if (!config) {
    errors.push('Configuration is null or undefined');
    return { valid: false, errors };
  }

  if (!config.version) {
    errors.push('Missing required field: version');
  }

  if (!config.tier) {
    errors.push('Missing required field: tier');
  } else if (!isValidTierId(config.tier)) {
    errors.push(`Invalid tier: ${config.tier}`);
  }

  if (!config.features) {
    errors.push('Missing required field: features');
  } else if (!Array.isArray(config.features)) {
    errors.push('Field features must be an array');
  }

  if (!config.metadata) {
    errors.push('Missing required field: metadata');
  } else {
    if (!config.metadata.created_at) {
      errors.push('Missing required field: metadata.created_at');
    }
    if (!config.metadata.updated_at) {
      errors.push('Missing required field: metadata.updated_at');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Applies a security tier configuration
 * Main function to update security configuration
 *
 * @param {string} tierId - Tier ID to apply
 * @param {Object} [options={}] - Options
 * @param {string[]} [options.customFeatures] - Custom feature list (for advanced override)
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @returns {{ success: boolean, path?: string, error?: string }} Apply result
 */
export function applySecurityTier(tierId, options = {}) {
  const {
    customFeatures = null,
    projectRoot = process.cwd()
  } = options;

  // Validate tier
  if (!isValidTierId(tierId)) {
    return { success: false, error: `Invalid tier: ${tierId}` };
  }

  // Create configuration
  const config = createSecurityConfig(tierId, customFeatures);
  if (!config) {
    return { success: false, error: 'Failed to create security configuration' };
  }

  // Check if updating existing config
  const existingConfig = readSecurityConfig(projectRoot);
  if (existingConfig) {
    // Preserve original created_at
    config.metadata.created_at = existingConfig.metadata?.created_at || config.metadata.created_at;
  }

  // Validate configuration
  const validation = validateSecurityConfig(config);
  if (!validation.valid) {
    return { success: false, error: `Validation failed: ${validation.errors.join(', ')}` };
  }

  // Generate YAML header
  const header = `# BMAD Security Configuration
# Generated by security-config wizard
# DO NOT EDIT MANUALLY - use 'npm run security:config' to modify
#
# Tier: ${config.tier_name}
# Features: ${config.features.length}
# Last updated: ${config.metadata.updated_at}
#

`;

  // Serialize to YAML
  const yamlContent = serializeYaml(config);

  // Write atomically
  const writeResult = writeSecurityConfigAtomic(header + yamlContent + '\n', projectRoot);

  if (writeResult.success) {
    const configPath = path.join(projectRoot, SECURITY_CONFIG_PATH);
    return { success: true, path: configPath };
  }

  return writeResult;
}

/**
 * Gets the current security tier from config
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {string|null} Current tier ID or null if not configured
 */
export function getCurrentTier(projectRoot = process.cwd()) {
  const config = readSecurityConfig(projectRoot);
  return config?.tier || null;
}

/**
 * Gets the current enabled features from config
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {string[]} Array of enabled feature codes
 */
export function getCurrentFeatures(projectRoot = process.cwd()) {
  const config = readSecurityConfig(projectRoot);
  return config?.features || [];
}

/**
 * Checks if security is configured
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {boolean} True if security config exists
 */
export function isSecurityConfigured(projectRoot = process.cwd()) {
  const configPath = path.join(projectRoot, SECURITY_CONFIG_PATH);
  return fs.existsSync(configPath);
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Security Configuration Writer - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: Create config
  console.log('\n1. createSecurityConfig("standard"):');
  const config = createSecurityConfig('standard');
  console.log('   Tier: ' + config.tier);
  console.log('   Features: ' + config.features.length);
  console.log('   Validators: ' + Object.keys(config.validators).length);

  // Test 2: Serialize
  console.log('\n2. serializeYaml():');
  const yaml = serializeYaml(config);
  console.log('   Lines: ' + yaml.split('\n').length);

  // Test 3: Parse
  console.log('\n3. parseYaml() round-trip:');
  const parsed = parseYaml(yaml);
  console.log('   Tier matches: ' + (parsed.tier === config.tier));
  console.log('   Features match: ' + (parsed.features?.length === config.features.length));

  // Test 4: Validate
  console.log('\n4. validateSecurityConfig():');
  const validation = validateSecurityConfig(config);
  console.log('   Valid: ' + validation.valid);
  console.log('   Errors: ' + validation.errors.length);

  // Test 5: Check current config
  console.log('\n5. getCurrentTier():');
  const currentTier = getCurrentTier();
  console.log('   Current: ' + (currentTier || 'Not configured'));

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete. (No files were modified)');
}
