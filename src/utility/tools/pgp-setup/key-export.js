#!/usr/bin/env node
/**
 * PGP Key Export - INST-027
 * Epic 3 - Key Export and Storage
 *
 * Exports generated PGP keys to secure BMAD directory and creates
 * configuration for signing operations.
 *
 * @module key-export
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default keys directory path (relative to home)
 * @type {string}
 */
export const KEYS_DIR = path.join(os.homedir(), '.bmad', 'keys');

/**
 * Public key filename
 * @type {string}
 */
export const PUBLIC_KEY_FILENAME = 'user-public.asc';

/**
 * Private key filename
 * @type {string}
 */
export const PRIVATE_KEY_FILENAME = 'user-private.asc';

/**
 * PGP config path relative to project root
 * @type {string}
 */
export const PGP_CONFIG_PATH = '_bmad/_config/security/pgp-config.yaml';

/**
 * Current config version
 * @type {string}
 */
export const CONFIG_VERSION = '1.0.0';

/**
 * Checks if the current platform is Windows
 * @returns {boolean} True if running on Windows
 */
export function isWindows() {
  return process.platform === 'win32';
}

/**
 * Creates the keys directory with secure permissions (700)
 * @param {string} [keysDir=KEYS_DIR] - Directory path for keys
 * @returns {{ success: boolean, path?: string, error?: string }} Result
 */
export function createKeysDirectory(keysDir = KEYS_DIR) {
  try {
    // Create directory recursively
    fs.mkdirSync(keysDir, { recursive: true });

    // Set secure permissions (700) on Unix systems
    if (!isWindows()) {
      try {
        fs.chmodSync(keysDir, 0o700);
      } catch (chmodError) {
        // Log but don't fail - directory was created
        console.warn(`Warning: Could not set permissions on ${keysDir}: ${chmodError.message}`);
      }
    }

    return { success: true, path: keysDir };
  } catch (error) {
    return { success: false, error: `Failed to create keys directory: ${error.message}` };
  }
}

/**
 * Runs a GPG command and returns the output
 * @param {string[]} args - GPG command arguments
 * @returns {{ success: boolean, stdout?: string, stderr?: string, error?: string }} Result
 */
export function runGpgCommand(args) {
  try {
    const result = spawnSync('gpg', args, {
      encoding: 'utf8',
      timeout: 30000, // 30 second timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for keys
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    if (result.status !== 0) {
      return {
        success: false,
        error: result.stderr || `GPG command failed with code ${result.status}`,
        stderr: result.stderr
      };
    }

    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Checks if GPG is available on the system
 * @returns {boolean} True if GPG is installed and accessible
 */
export function isGpgAvailable() {
  const result = runGpgCommand(['--version']);
  return result.success;
}

/**
 * Validates a fingerprint format (40 hex characters)
 * @param {string} fingerprint - Fingerprint to validate
 * @returns {boolean} True if valid fingerprint
 */
export function isValidFingerprint(fingerprint) {
  if (!fingerprint || typeof fingerprint !== 'string') {
    return false;
  }
  // Fingerprint should be 40 hex characters (can have spaces)
  const cleaned = fingerprint.replace(/\s/g, '');
  return /^[A-Fa-f0-9]{40}$/.test(cleaned);
}

/**
 * Cleans/normalizes a fingerprint (removes spaces)
 * @param {string} fingerprint - Fingerprint to clean
 * @returns {string} Cleaned fingerprint
 */
export function cleanFingerprint(fingerprint) {
  return fingerprint.replace(/\s/g, '').toUpperCase();
}

/**
 * Sets secure file permissions
 * @param {string} filePath - Path to file
 * @param {number} mode - Unix permission mode (e.g., 0o600)
 * @returns {{ success: boolean, error?: string }} Result
 */
export function setSecurePermissions(filePath, mode) {
  if (isWindows()) {
    // Windows doesn't support Unix permissions
    return { success: true };
  }

  try {
    fs.chmodSync(filePath, mode);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to set permissions: ${error.message}` };
  }
}

/**
 * Exports the public key to a file
 * @param {string} fingerprint - Key fingerprint
 * @param {string} [keysDir=KEYS_DIR] - Directory to export to
 * @returns {{ success: boolean, path?: string, error?: string }} Result
 */
export function exportPublicKey(fingerprint, keysDir = KEYS_DIR) {
  if (!isValidFingerprint(fingerprint)) {
    return { success: false, error: 'Invalid fingerprint format' };
  }

  const cleanedFp = cleanFingerprint(fingerprint);
  const exportPath = path.join(keysDir, PUBLIC_KEY_FILENAME);

  // Export public key using GPG
  const result = runGpgCommand([
    '--export',
    '--armor',
    cleanedFp
  ]);

  if (!result.success) {
    return { success: false, error: `Failed to export public key: ${result.error}` };
  }

  if (!result.stdout || result.stdout.trim().length === 0) {
    return { success: false, error: 'No public key data returned from GPG' };
  }

  try {
    fs.writeFileSync(exportPath, result.stdout, 'utf8');

    // Set permissions to 644 (readable by all)
    setSecurePermissions(exportPath, 0o644);

    return { success: true, path: exportPath };
  } catch (error) {
    return { success: false, error: `Failed to write public key: ${error.message}` };
  }
}

/**
 * Exports the private key to a file (encrypted)
 * @param {string} fingerprint - Key fingerprint
 * @param {string} [keysDir=KEYS_DIR] - Directory to export to
 * @returns {{ success: boolean, path?: string, error?: string }} Result
 */
export function exportPrivateKey(fingerprint, keysDir = KEYS_DIR) {
  if (!isValidFingerprint(fingerprint)) {
    return { success: false, error: 'Invalid fingerprint format' };
  }

  const cleanedFp = cleanFingerprint(fingerprint);
  const exportPath = path.join(keysDir, PRIVATE_KEY_FILENAME);

  // Export private key using GPG
  const result = runGpgCommand([
    '--export-secret-keys',
    '--armor',
    cleanedFp
  ]);

  if (!result.success) {
    return { success: false, error: `Failed to export private key: ${result.error}` };
  }

  if (!result.stdout || result.stdout.trim().length === 0) {
    return { success: false, error: 'No private key data returned from GPG' };
  }

  try {
    fs.writeFileSync(exportPath, result.stdout, 'utf8');

    // Set permissions to 600 (owner only)
    const permResult = setSecurePermissions(exportPath, 0o600);
    if (!permResult.success) {
      console.warn(`Warning: ${permResult.error}`);
    }

    return { success: true, path: exportPath };
  } catch (error) {
    return { success: false, error: `Failed to write private key: ${error.message}` };
  }
}

/**
 * Gets key information from GPG
 * @param {string} fingerprint - Key fingerprint
 * @returns {{ success: boolean, data?: Object, error?: string }} Result
 */
export function getKeyInfo(fingerprint) {
  if (!isValidFingerprint(fingerprint)) {
    return { success: false, error: 'Invalid fingerprint format' };
  }

  const cleanedFp = cleanFingerprint(fingerprint);

  const result = runGpgCommand([
    '--list-keys',
    '--with-fingerprint',
    '--with-colons',
    cleanedFp
  ]);

  if (!result.success) {
    return { success: false, error: `Failed to get key info: ${result.error}` };
  }

  // Parse key info from colon-delimited output
  const lines = result.stdout.split('\n');
  let userId = '';
  let email = '';
  let keyId = '';

  for (const line of lines) {
    const parts = line.split(':');
    if (parts[0] === 'uid') {
      userId = parts[9] || '';
      // Extract email from user ID
      const emailMatch = userId.match(/<([^>]+)>/);
      if (emailMatch) {
        email = emailMatch[1];
      }
    }
    if (parts[0] === 'pub') {
      keyId = parts[4] || '';
    }
  }

  return {
    success: true,
    data: {
      fingerprint: cleanedFp,
      keyId,
      userId,
      email
    }
  };
}

/**
 * Simple YAML serializer
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
        /^-?\d+(\.\d+)?$/.test(value) || value.startsWith('~')) {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }
  return String(value);
}

/**
 * Ensures the PGP config directory exists
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {boolean} True if directory exists or was created
 */
export function ensurePgpConfigDirectory(projectRoot = process.cwd()) {
  const configDir = path.dirname(path.join(projectRoot, PGP_CONFIG_PATH));

  if (!fs.existsSync(configDir)) {
    try {
      fs.mkdirSync(configDir, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Error creating PGP config directory: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Saves the PGP configuration file
 * @param {string} fingerprint - Key fingerprint
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @param {Object} [options={}] - Additional options
 * @returns {{ success: boolean, path?: string, error?: string }} Result
 */
export function savePgpConfig(fingerprint, projectRoot = process.cwd(), options = {}) {
  if (!isValidFingerprint(fingerprint)) {
    return { success: false, error: 'Invalid fingerprint format' };
  }

  const cleanedFp = cleanFingerprint(fingerprint);
  const configPath = path.join(projectRoot, PGP_CONFIG_PATH);

  // Ensure directory exists
  if (!ensurePgpConfigDirectory(projectRoot)) {
    return { success: false, error: 'Failed to create PGP config directory' };
  }

  // Get key info for additional metadata
  const keyInfo = getKeyInfo(fingerprint);

  // Build config object
  const now = new Date().toISOString();
  const config = {
    version: CONFIG_VERSION,
    key_fingerprint: cleanedFp,
    key_id: keyInfo.success ? keyInfo.data.keyId : cleanedFp.slice(-16),
    public_key_path: `~/.bmad/keys/${PUBLIC_KEY_FILENAME}`,
    private_key_path: `~/.bmad/keys/${PRIVATE_KEY_FILENAME}`,
    metadata: {
      created: now,
      updated: now,
      user_id: keyInfo.success ? keyInfo.data.userId : '',
      email: keyInfo.success ? keyInfo.data.email : ''
    }
  };

  // Merge with options
  if (options.keysDir && options.keysDir !== KEYS_DIR) {
    config.public_key_path = path.join(options.keysDir, PUBLIC_KEY_FILENAME);
    config.private_key_path = path.join(options.keysDir, PRIVATE_KEY_FILENAME);
  }

  // Generate YAML header
  const header = `# BMAD PGP Configuration
# Generated by pgp-setup wizard
# DO NOT EDIT MANUALLY - use 'npm run pgp:setup' to modify
#
# Key Fingerprint: ${cleanedFp}
# Created: ${now}
#

`;

  try {
    const yamlContent = serializeYaml(config);
    fs.writeFileSync(configPath, header + yamlContent + '\n', 'utf8');
    return { success: true, path: configPath };
  } catch (error) {
    return { success: false, error: `Failed to write PGP config: ${error.message}` };
  }
}

/**
 * Displays the export summary
 * @param {Object} result - Export result object
 * @param {string} fingerprint - Key fingerprint
 */
export function displayExportSummary(result, fingerprint) {
  console.log('\n' + '='.repeat(60));
  console.log('PGP Key Export Summary');
  console.log('='.repeat(60));

  console.log('\nKey Fingerprint:');
  console.log(`  ${cleanFingerprint(fingerprint)}`);

  console.log('\nExported Files:');
  if (result.publicKeyPath) {
    console.log(`  Public Key:  ${result.publicKeyPath}`);
  }
  if (result.privateKeyPath) {
    console.log(`  Private Key: ${result.privateKeyPath}`);
  }

  console.log('\nConfiguration:');
  if (result.configPath) {
    console.log(`  Config File: ${result.configPath}`);
  }

  console.log('\nPermissions:');
  console.log('  Keys Directory: 700 (owner only)');
  console.log('  Public Key:     644 (world readable)');
  console.log('  Private Key:    600 (owner only)');

  console.log('\n' + '='.repeat(60));
  console.log('Key export complete!');
  console.log('='.repeat(60) + '\n');
}

/**
 * Main export function - exports keys and saves configuration
 * @param {string} fingerprint - Key fingerprint
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @param {Object} [options={}] - Additional options
 * @returns {{ success: boolean, publicKeyPath?: string, privateKeyPath?: string, configPath?: string, error?: string }} Result
 */
export function exportKeys(fingerprint, projectRoot = process.cwd(), options = {}) {
  const {
    keysDir = KEYS_DIR,
    silent = false
  } = options;

  // Validate fingerprint
  if (!isValidFingerprint(fingerprint)) {
    return { success: false, error: 'Invalid fingerprint format. Expected 40 hex characters.' };
  }

  // Check if GPG is available
  if (!isGpgAvailable()) {
    return { success: false, error: 'GPG is not installed or not accessible' };
  }

  // Step 1: Create keys directory
  const dirResult = createKeysDirectory(keysDir);
  if (!dirResult.success) {
    return dirResult;
  }

  // Step 2: Export public key
  const publicResult = exportPublicKey(fingerprint, keysDir);
  if (!publicResult.success) {
    return publicResult;
  }

  // Step 3: Export private key
  const privateResult = exportPrivateKey(fingerprint, keysDir);
  if (!privateResult.success) {
    return privateResult;
  }

  // Step 4: Save configuration
  const configResult = savePgpConfig(fingerprint, projectRoot, { keysDir });
  if (!configResult.success) {
    return configResult;
  }

  const result = {
    success: true,
    publicKeyPath: publicResult.path,
    privateKeyPath: privateResult.path,
    configPath: configResult.path,
    fingerprint: cleanFingerprint(fingerprint)
  };

  // Display summary unless silent
  if (!silent) {
    displayExportSummary(result, fingerprint);
  }

  return result;
}

/**
 * Gets the keys directory (for backward compatibility)
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {string} Keys directory path
 */
export function getKeysDirectory(projectRoot = process.cwd()) {
  return KEYS_DIR;
}

/**
 * Checks if keys have already been exported
 * @param {string} [keysDir=KEYS_DIR] - Directory to check
 * @returns {{ exists: boolean, publicKey: boolean, privateKey: boolean }} Status
 */
export function checkExistingKeys(keysDir = KEYS_DIR) {
  const publicKeyPath = path.join(keysDir, PUBLIC_KEY_FILENAME);
  const privateKeyPath = path.join(keysDir, PRIVATE_KEY_FILENAME);

  return {
    exists: fs.existsSync(publicKeyPath) || fs.existsSync(privateKeyPath),
    publicKey: fs.existsSync(publicKeyPath),
    privateKey: fs.existsSync(privateKeyPath)
  };
}

/**
 * Reads the PGP configuration
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object|null} Config object or null if not found
 */
export function readPgpConfig(projectRoot = process.cwd()) {
  const configPath = path.join(projectRoot, PGP_CONFIG_PATH);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    // Simple YAML parsing for our config format
    const result = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();

        // Parse value
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (/^-?\d+$/.test(value)) {
          value = parseInt(value, 10);
        }

        result[key] = value;
      }
    }

    return result;
  } catch (error) {
    console.warn(`Warning: Could not read PGP config: ${error.message}`);
    return null;
  }
}

// Default export for backward compatibility
export default { exportKeys, getKeysDirectory };

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('PGP Key Export - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: Check GPG availability
  console.log('\n1. GPG availability:');
  console.log('   Available: ' + isGpgAvailable());

  // Test 2: Validate fingerprint
  console.log('\n2. Fingerprint validation:');
  const testFp = 'ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234';
  console.log('   Valid format: ' + isValidFingerprint(testFp));
  console.log('   Cleaned: ' + cleanFingerprint('ABCD 1234 ABCD 1234 ABCD 1234 ABCD 1234 ABCD 1234'));

  // Test 3: Check existing keys
  console.log('\n3. Existing keys:');
  const existingKeys = checkExistingKeys();
  console.log('   Keys exist: ' + existingKeys.exists);
  console.log('   Public key: ' + existingKeys.publicKey);
  console.log('   Private key: ' + existingKeys.privateKey);

  // Test 4: Platform detection
  console.log('\n4. Platform:');
  console.log('   Windows: ' + isWindows());
  console.log('   Keys dir: ' + KEYS_DIR);

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete. (No keys were exported)');
}
