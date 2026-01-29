/**
 * Manifest Configuration Writer - INST-004
 * Epic 1, Story 4 - Interactive Module Selection
 *
 * Updates the manifest.yaml file with user module selections from the
 * BMAD installation wizard. Maintains backward compatibility with existing
 * manifest formats while adding new fields.
 *
 * @module manifest-writer
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the manifest file relative to project root
 * @type {string}
 */
export const MANIFEST_PATH = '_bmad/_config/manifest.yaml';

/**
 * Current wizard version - read from package.json
 * @type {string}
 */
export const WIZARD_VERSION = '2.0.0';

/**
 * Simple YAML parser for manifest.yaml structure
 * Handles nested objects, arrays, and basic value types
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
 * Serializes a JavaScript object to YAML format
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
 * Reads and parses the existing manifest.yaml file
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object} Parsed manifest or empty object if file doesn't exist
 */
export function readExistingManifest(projectRoot = process.cwd()) {
  const manifestPath = path.join(projectRoot, MANIFEST_PATH);

  if (!fs.existsSync(manifestPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return parseYaml(content);
  } catch (error) {
    console.warn(`Warning: Could not read existing manifest at ${manifestPath}: ${error.message}`);
    return {};
  }
}

/**
 * Preserves existing fields from the old manifest while applying updates
 * Updates only the specified fields without overwriting other settings
 * @param {Object} existing - Existing manifest content
 * @param {Object} updates - New fields to add/update
 * @returns {Object} Merged manifest with preserved fields
 */
export function preserveExistingFields(existing, updates) {
  const merged = { ...existing };

  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Deep merge for objects
      merged[key] = preserveExistingFields(existing[key] || {}, value);
    } else {
      // Direct assignment for primitives and arrays
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * Gets the current user's name from the operating system
 * @returns {string} Current user's name or 'unknown' if not available
 */
export function getCurrentUserName() {
  try {
    // Try to get the user info from os module
    const userInfo = os.userInfo();
    return userInfo.username || 'unknown';
  } catch (error) {
    // Fallback to environment variables
    return process.env.USER || process.env.USERNAME || 'unknown';
  }
}

/**
 * Creates a new manifest structure with module selections
 * @param {string[]} selectedModules - Array of selected module codes
 * @param {Object} [userProfile={}] - Optional user profile with name
 * @param {Object} [existingManifest={}] - Existing manifest to preserve fields from
 * @returns {Object} New manifest object ready for serialization
 */
export function createManifestStructure(selectedModules, userProfile = {}, existingManifest = {}) {
  const now = new Date().toISOString();
  const userName = (userProfile && userProfile.name) || getCurrentUserName();

  // Build the new manifest structure
  const newManifest = {
    installation: {
      version: existingManifest.installation?.version || WIZARD_VERSION,
      installDate: existingManifest.installation?.installDate || now,
      lastUpdated: now
    },
    // Maintain backward compatibility: keep modules array
    modules: [...selectedModules],
    // New field: enabled_modules for clarity
    enabled_modules: [...selectedModules],
    // Metadata about the last update
    last_modified: now,
    installed_by: userName,
    wizard_version: WIZARD_VERSION
  };

  // Preserve existing fields that aren't being updated
  const fieldsToPreserve = ['ides', 'config_files'];
  for (const field of fieldsToPreserve) {
    if (existingManifest[field]) {
      newManifest[field] = existingManifest[field];
    }
  }

  return newManifest;
}

/**
 * Validates the manifest structure before writing
 * Checks for required fields and correct types
 * @param {Object} manifest - Manifest object to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result with errors
 */
export function validateManifestStructure(manifest) {
  const errors = [];

  // Check required fields
  if (!manifest.installation) {
    errors.push('Missing required field: installation');
  } else {
    if (!manifest.installation.version) {
      errors.push('Missing required field: installation.version');
    }
    if (!manifest.installation.installDate) {
      errors.push('Missing required field: installation.installDate');
    }
  }

  // Check modules array
  if (!manifest.modules) {
    errors.push('Missing required field: modules');
  } else if (!Array.isArray(manifest.modules)) {
    errors.push('Field modules must be an array');
  }

  // Check enabled_modules array
  if (!manifest.enabled_modules) {
    errors.push('Missing required field: enabled_modules');
  } else if (!Array.isArray(manifest.enabled_modules)) {
    errors.push('Field enabled_modules must be an array');
  }

  // Check metadata fields
  if (!manifest.last_modified) {
    errors.push('Missing required field: last_modified');
  }

  if (!manifest.wizard_version) {
    errors.push('Missing required field: wizard_version');
  }

  // Validate ISO date format for last_modified
  if (manifest.last_modified) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (!dateRegex.test(manifest.last_modified)) {
      errors.push('Field last_modified must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ensures the manifest directory exists
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {boolean} True if directory exists or was created
 */
export function ensureManifestDirectory(projectRoot = process.cwd()) {
  const manifestDir = path.dirname(path.join(projectRoot, MANIFEST_PATH));

  if (!fs.existsSync(manifestDir)) {
    try {
      fs.mkdirSync(manifestDir, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Error creating manifest directory: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Writes the manifest file atomically using a temp file
 * @param {string} content - YAML content to write
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ success: boolean, error?: string }} Write result
 */
export function writeManifestAtomic(content, projectRoot = process.cwd()) {
  const manifestPath = path.join(projectRoot, MANIFEST_PATH);
  const tempPath = `${manifestPath}.tmp`;

  try {
    // Ensure directory exists
    if (!ensureManifestDirectory(projectRoot)) {
      return { success: false, error: 'Failed to create manifest directory' };
    }

    // Write to temp file first
    fs.writeFileSync(tempPath, content, 'utf8');

    // Atomic rename (this ensures the file is either fully written or not at all)
    fs.renameSync(tempPath, manifestPath);

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
 * Main function to update the manifest with selected modules
 * This is the primary entry point for updating manifest configuration
 *
 * @param {string[]} selectedModules - Array of selected module codes
 * @param {Object} [userProfile={}] - Optional user profile with name
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ success: boolean, path?: string, error?: string }} Update result
 * @example
 * const result = updateManifest(['core', 'bmm', 'cybersec-team'], { name: 'john.doe' });
 * if (result.success) {
 *   console.log(`Manifest updated at ${result.path}`);
 * }
 */
export function updateManifest(selectedModules, userProfile = {}, projectRoot = process.cwd()) {
  // Validate input
  if (!Array.isArray(selectedModules)) {
    return { success: false, error: 'selectedModules must be an array' };
  }

  if (selectedModules.length === 0) {
    return { success: false, error: 'selectedModules cannot be empty' };
  }

  // Read existing manifest
  const existingManifest = readExistingManifest(projectRoot);

  // Create new manifest structure
  const newManifest = createManifestStructure(selectedModules, userProfile, existingManifest);

  // Validate the structure
  const validation = validateManifestStructure(newManifest);
  if (!validation.valid) {
    return { success: false, error: `Validation failed: ${validation.errors.join(', ')}` };
  }

  // Serialize to YAML
  const yamlContent = serializeYaml(newManifest);

  // Write atomically
  const writeResult = writeManifestAtomic(yamlContent + '\n', projectRoot);

  if (writeResult.success) {
    const manifestPath = path.join(projectRoot, MANIFEST_PATH);
    console.log(`Manifest updated successfully at ${manifestPath}`);
    return { success: true, path: manifestPath };
  }

  return writeResult;
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('BMAD Manifest Writer - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: parseYaml
  console.log('\n1. parseYaml() Test:');
  const testYaml = `
installation:
  version: 6.0.0-alpha.22
  installDate: 2026-01-08T17:39:34.328Z
modules:
  - core
  - bmm
ides:
  - claude-code
`;
  const parsed = parseYaml(testYaml);
  console.log('   Parsed YAML:');
  console.log(`   - installation.version: ${parsed.installation?.version}`);
  console.log(`   - modules: [${parsed.modules?.join(', ')}]`);
  console.log(`   - ides: [${parsed.ides?.join(', ')}]`);

  // Test 2: serializeYaml
  console.log('\n2. serializeYaml() Test:');
  const testObj = {
    installation: {
      version: '1.0.0',
      installDate: '2026-01-27T12:00:00.000Z'
    },
    modules: ['core', 'bmm'],
    last_modified: '2026-01-27T12:00:00.000Z'
  };
  const serialized = serializeYaml(testObj);
  console.log('   Serialized YAML:\n');
  console.log(serialized.split('\n').map(l => `   ${l}`).join('\n'));

  // Test 3: preserveExistingFields
  console.log('\n3. preserveExistingFields() Test:');
  const existing = { a: 1, b: { c: 2 }, d: 'keep' };
  const updates = { a: 10, b: { e: 3 } };
  const merged = preserveExistingFields(existing, updates);
  console.log(`   Existing: ${JSON.stringify(existing)}`);
  console.log(`   Updates: ${JSON.stringify(updates)}`);
  console.log(`   Merged: ${JSON.stringify(merged)}`);

  // Test 4: validateManifestStructure
  console.log('\n4. validateManifestStructure() Test:');
  const validManifest = {
    installation: { version: '1.0.0', installDate: '2026-01-27T12:00:00.000Z' },
    modules: ['core'],
    enabled_modules: ['core'],
    last_modified: '2026-01-27T12:00:00.000Z',
    wizard_version: '2.0.0'
  };
  const invalidManifest = { modules: 'not-an-array' };

  const validResult = validateManifestStructure(validManifest);
  const invalidResult = validateManifestStructure(invalidManifest);

  console.log(`   Valid manifest check: ${validResult.valid ? 'PASS' : 'FAIL'}`);
  console.log(`   Invalid manifest check: ${!invalidResult.valid ? 'PASS' : 'FAIL'}`);
  console.log(`   Errors found: ${invalidResult.errors.join('; ')}`);

  // Test 5: getCurrentUserName
  console.log('\n5. getCurrentUserName() Test:');
  const userName = getCurrentUserName();
  console.log(`   Current user: ${userName}`);

  // Test 6: createManifestStructure
  console.log('\n6. createManifestStructure() Test:');
  const structure = createManifestStructure(
    ['core', 'bmm', 'cybersec-team'],
    { name: 'test-user' },
    { installation: { version: '1.0.0', installDate: '2026-01-01T00:00:00.000Z' }, ides: ['vscode'] }
  );
  console.log(`   modules: [${structure.modules.join(', ')}]`);
  console.log(`   enabled_modules: [${structure.enabled_modules.join(', ')}]`);
  console.log(`   installed_by: ${structure.installed_by}`);
  console.log(`   wizard_version: ${structure.wizard_version}`);
  console.log(`   ides preserved: [${structure.ides?.join(', ')}]`);

  // Test 7: Read existing manifest (dry run)
  console.log('\n7. readExistingManifest() Test:');
  const existingManifest = readExistingManifest();
  if (Object.keys(existingManifest).length > 0) {
    console.log(`   Found existing manifest with ${existingManifest.modules?.length || 0} modules`);
    console.log(`   Modules: [${existingManifest.modules?.join(', ') || 'none'}]`);
  } else {
    console.log('   No existing manifest found or empty');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete. (No files were modified)');
  console.log('\nTo actually update the manifest, call:');
  console.log("  updateManifest(['core', 'bmm'], { name: 'your-name' })");
}
