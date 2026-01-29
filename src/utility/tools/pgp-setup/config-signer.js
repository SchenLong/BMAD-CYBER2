#!/usr/bin/env node
/**
 * Configuration File Signer - INST-028
 * Epic: BMAD-CYBER Installation Wizard Enhancement
 *
 * Signs configuration files with user PGP key for tamper detection.
 * Creates detached signatures and a signed hash manifest.
 *
 * @module config-signer
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Core configuration files to sign
 * @type {string[]}
 */
export const CONFIG_FILES = [
  '_bmad/_config/llm-config.yaml',
  '_bmad/core/security/security-config.yaml',
  '_bmad/_config/manifest.yaml'
];

/**
 * Alias for backwards compatibility
 * @type {string[]}
 */
export const SIGNABLE_CONFIGS = CONFIG_FILES;

/**
 * Path to the user hash manifest
 * @type {string}
 */
export const USER_MANIFEST_PATH = '_bmad/_config/user-manifest.sha256';

/**
 * Module configuration directory
 * @type {string}
 */
export const MODULE_CONFIG_DIR = '_bmad/_config/modules';

// ============================================================================
// YAML Parsing (Simple Parser)
// ============================================================================

/**
 * Simple YAML parser for reading manifest.yaml
 * @param {string} yamlString - YAML content
 * @returns {object} Parsed object
 */
function parseYaml(yamlString) {
  if (!yamlString || typeof yamlString !== 'string') {
    return {};
  }

  const result = {};
  const lines = yamlString.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    // Count leading spaces
    const leadingSpaces = line.match(/^(\s*)/)[1].length;
    const trimmedLine = line.trim();

    // Check for array item
    if (trimmedLine.startsWith('- ')) {
      const value = trimmedLine.slice(2).trim().replace(/^["']|["']$/g, '');
      if (currentArray && currentKey) {
        currentArray.push(value);
      }
      continue;
    }

    // Check for key-value pair
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.slice(0, colonIndex).trim();
      const valueStr = trimmedLine.slice(colonIndex + 1).trim();

      if (leadingSpaces === 0) {
        // Top-level key
        currentKey = key;
        currentObject = null;

        if (valueStr === '' || valueStr === '|' || valueStr === '>') {
          // Start of array or nested object
          currentArray = [];
          result[key] = currentArray;
        } else {
          // Simple value
          result[key] = parseValue(valueStr);
          currentArray = null;
        }
      } else if (leadingSpaces === 2 && currentKey) {
        // Nested in top-level
        if (!currentObject) {
          currentObject = {};
          result[currentKey] = currentObject;
          currentArray = null;
        }

        if (valueStr === '' || valueStr === '|' || valueStr === '>') {
          currentArray = [];
          currentObject[key] = currentArray;
        } else {
          currentObject[key] = parseValue(valueStr);
        }
      }
    }
  }

  return result;
}

/**
 * Parse a YAML value string
 * @param {string} valueStr - Value string
 * @returns {*} Parsed value
 */
function parseValue(valueStr) {
  // Remove quotes
  const unquoted = valueStr.replace(/^["']|["']$/g, '');

  // Check for special values
  if (unquoted === 'true') return true;
  if (unquoted === 'false') return false;
  if (unquoted === 'null') return null;
  if (/^-?\d+$/.test(unquoted)) return parseInt(unquoted, 10);
  if (/^-?\d+\.\d+$/.test(unquoted)) return parseFloat(unquoted);

  return unquoted;
}

// ============================================================================
// GPG Operations
// ============================================================================

/**
 * Check if GPG is available
 * @returns {boolean} Whether GPG is available
 */
export function isGpgAvailable() {
  try {
    const result = spawnSync('gpg', ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: 'pipe'
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Check if a GPG key exists for the given fingerprint
 * @param {string} fingerprint - Key fingerprint or ID
 * @returns {boolean} Whether the key exists
 */
export function keyExists(fingerprint) {
  if (!fingerprint) return false;

  try {
    const result = spawnSync('gpg', ['--list-secret-keys', fingerprint], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: 'pipe'
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Sign a file with a GPG key, creating a detached signature
 * @param {string} filePath - Absolute path to the file to sign
 * @param {string} keyFingerprint - GPG key fingerprint or ID
 * @returns {{success: boolean, signaturePath?: string, error?: string}}
 */
export function signFile(filePath, keyFingerprint) {
  // Validate inputs
  if (!filePath || typeof filePath !== 'string') {
    return { success: false, error: 'Invalid file path' };
  }

  if (!keyFingerprint || typeof keyFingerprint !== 'string') {
    return { success: false, error: 'Invalid key fingerprint' };
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return { success: false, error: `File not found: ${filePath}` };
  }

  const signaturePath = `${filePath}.asc`;

  try {
    // Remove existing signature if present
    if (fs.existsSync(signaturePath)) {
      fs.unlinkSync(signaturePath);
    }

    // Run GPG to create detached signature
    const result = spawnSync('gpg', [
      '--detach-sign',
      '--armor',
      '-u', keyFingerprint,
      '--output', signaturePath,
      filePath
    ], {
      encoding: 'utf8',
      timeout: 30000,
      stdio: 'pipe'
    });

    if (result.status === 0 && fs.existsSync(signaturePath)) {
      return { success: true, signaturePath };
    }

    // Check for specific GPG errors
    const stderr = result.stderr || '';
    if (stderr.includes('secret key not available')) {
      return { success: false, error: 'Secret key not available for signing' };
    }
    if (stderr.includes('unusable secret key')) {
      return { success: false, error: 'Secret key is unusable' };
    }

    return { success: false, error: stderr || 'GPG signing failed' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Verify a GPG signature
 * @param {string} filePath - Path to the signed file
 * @param {string} signaturePath - Path to the signature file (optional, defaults to filePath.asc)
 * @returns {{valid: boolean, signer?: string, signedAt?: string, error?: string}}
 */
export function verifySignature(filePath, signaturePath = null) {
  const sigPath = signaturePath || `${filePath}.asc`;

  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'File not found' };
  }

  if (!fs.existsSync(sigPath)) {
    return { valid: false, error: 'Signature file not found' };
  }

  try {
    const result = spawnSync('gpg', ['--verify', sigPath, filePath], {
      encoding: 'utf8',
      timeout: 10000,
      stdio: 'pipe'
    });

    // GPG outputs verification result to stderr
    const output = result.stderr || '';
    const isValid = result.status === 0 || output.includes('Good signature');

    // Try to extract signer info
    let signer = null;
    let signedAt = null;

    const signerMatch = output.match(/Good signature from "([^"]+)"/);
    if (signerMatch) {
      signer = signerMatch[1];
    }

    const dateMatch = output.match(/Signature made (.+)/);
    if (dateMatch) {
      signedAt = dateMatch[1];
    }

    return {
      valid: isValid,
      signer,
      signedAt,
      error: isValid ? undefined : 'Signature verification failed'
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Alias for verifySignature with different signature
 * @param {string} filePath - Path to the file
 * @param {string} projectRoot - Project root (optional, for compatibility)
 * @returns {{valid: boolean, signer?: string, signedAt?: string, error?: string}}
 */
export async function verifyConfigSignature(filePath, projectRoot = process.cwd()) {
  return verifySignature(filePath);
}

// ============================================================================
// Hash Calculations
// ============================================================================

/**
 * Calculate SHA-256 hash of a file
 * @param {string} filePath - Absolute path to the file
 * @returns {{hash: string | null, error?: string}}
 */
export function calculateSha256(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return { hash: null, error: 'Invalid file path' };
  }

  if (!fs.existsSync(filePath)) {
    return { hash: null, error: `File not found: ${filePath}` };
  }

  try {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return { hash };
  } catch (err) {
    return { hash: null, error: err.message };
  }
}

/**
 * Calculate SHA-256 hash from a string
 * @param {string} content - Content to hash
 * @returns {string} Hash string
 */
export function calculateSha256FromString(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// ============================================================================
// Module Configuration Discovery
// ============================================================================

/**
 * Get enabled modules from manifest.yaml
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Array of enabled module names
 */
export function getEnabledModules(projectRoot) {
  const manifestPath = path.join(projectRoot, '_bmad/_config/manifest.yaml');

  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = parseYaml(content);

    // Check for enabled_modules first, then modules
    if (Array.isArray(manifest.enabled_modules)) {
      return manifest.enabled_modules;
    }
    if (Array.isArray(manifest.modules)) {
      return manifest.modules;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Get configuration files for enabled modules
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Array of relative paths to module config files
 */
export function getModuleConfigFiles(projectRoot) {
  const enabledModules = getEnabledModules(projectRoot);
  const moduleConfigDir = path.join(projectRoot, MODULE_CONFIG_DIR);
  const configFiles = [];

  // Check if module config directory exists
  if (!fs.existsSync(moduleConfigDir)) {
    return configFiles;
  }

  try {
    // Scan for module config files
    const files = fs.readdirSync(moduleConfigDir);

    for (const file of files) {
      // Match pattern: {module-name}.yaml or {module-name}-config.yaml
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const baseName = file.replace(/(-config)?\.(yaml|yml)$/, '');

        // Check if this module is enabled
        if (enabledModules.includes(baseName)) {
          configFiles.push(path.join(MODULE_CONFIG_DIR, file));
        }
      }
    }

    // Also check for subdirectories matching module names
    for (const moduleName of enabledModules) {
      const moduleDir = path.join(moduleConfigDir, moduleName);
      if (fs.existsSync(moduleDir) && fs.statSync(moduleDir).isDirectory()) {
        // Look for config.yaml in module directory
        const configYaml = path.join(moduleConfigDir, moduleName, 'config.yaml');
        const configYml = path.join(moduleConfigDir, moduleName, 'config.yml');

        if (fs.existsSync(configYaml)) {
          configFiles.push(path.join(MODULE_CONFIG_DIR, moduleName, 'config.yaml'));
        } else if (fs.existsSync(configYml)) {
          configFiles.push(path.join(MODULE_CONFIG_DIR, moduleName, 'config.yml'));
        }
      }
    }
  } catch {
    // Return what we have
  }

  return configFiles;
}

/**
 * Get all configuration files to sign (core + module configs)
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Array of relative paths to config files
 */
export function getAllConfigFiles(projectRoot) {
  const allFiles = [...CONFIG_FILES];
  const moduleFiles = getModuleConfigFiles(projectRoot);

  // Add module files that aren't duplicates
  for (const file of moduleFiles) {
    if (!allFiles.includes(file)) {
      allFiles.push(file);
    }
  }

  return allFiles;
}

/**
 * Get list of signed files (files with .asc signatures)
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Array of signed file paths
 */
export async function getSignedFiles(projectRoot = process.cwd()) {
  const configFiles = getAllConfigFiles(projectRoot);
  const signedFiles = [];

  for (const file of configFiles) {
    const absolutePath = path.join(projectRoot, file);
    const signaturePath = `${absolutePath}.asc`;

    if (fs.existsSync(absolutePath) && fs.existsSync(signaturePath)) {
      signedFiles.push(file);
    }
  }

  return signedFiles;
}

// ============================================================================
// Hash Manifest Generation
// ============================================================================

/**
 * Build the hash manifest for all config files
 * @param {string[]} files - Array of relative file paths
 * @param {string} projectRoot - Project root path
 * @returns {{manifest: string, hashes: Array<{path: string, hash: string}>, errors: Array<{path: string, error: string}>}}
 */
export function buildHashManifest(files, projectRoot) {
  const hashes = [];
  const errors = [];
  const lines = [];

  // Header
  lines.push('# BMAD Configuration File Integrity Manifest');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push('# Format: SHA256 hash  filepath');
  lines.push('');

  for (const relativePath of files) {
    const absolutePath = path.join(projectRoot, relativePath);
    const result = calculateSha256(absolutePath);

    if (result.hash) {
      lines.push(`${result.hash}  ${relativePath}`);
      hashes.push({ path: relativePath, hash: result.hash });
    } else {
      errors.push({ path: relativePath, error: result.error });
    }
  }

  lines.push('');
  lines.push(`# Total files: ${hashes.length}`);
  lines.push(`# Errors: ${errors.length}`);
  lines.push('# End of manifest');

  return {
    manifest: lines.join('\n'),
    hashes,
    errors
  };
}

/**
 * Write the hash manifest to disk
 * @param {string} manifestContent - Manifest content
 * @param {string} projectRoot - Project root path
 * @returns {{success: boolean, path?: string, error?: string}}
 */
export function writeHashManifest(manifestContent, projectRoot) {
  const manifestPath = path.join(projectRoot, USER_MANIFEST_PATH);
  const manifestDir = path.dirname(manifestPath);

  try {
    // Ensure directory exists
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }

    // Write atomically using temp file
    const tempPath = `${manifestPath}.tmp`;
    fs.writeFileSync(tempPath, manifestContent, 'utf8');
    fs.renameSync(tempPath, manifestPath);

    return { success: true, path: manifestPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign the hash manifest file
 * @param {string} keyFingerprint - GPG key fingerprint
 * @param {string} projectRoot - Project root path
 * @returns {{success: boolean, signaturePath?: string, error?: string}}
 */
export function signHashManifest(keyFingerprint, projectRoot) {
  const manifestPath = path.join(projectRoot, USER_MANIFEST_PATH);
  return signFile(manifestPath, keyFingerprint);
}

// ============================================================================
// Main Signing Function
// ============================================================================

/**
 * Sign all configuration files and create signed hash manifest
 * @param {string|object} keyFingerprintOrOptions - GPG key fingerprint or options object
 * @param {string} [projectRoot] - Project root path (if first arg is string)
 * @returns {{
 *   success: boolean,
 *   signedFiles: string[],
 *   failedFiles: Array<{path: string, error: string}>,
 *   manifestPath: string | null,
 *   manifestSignaturePath: string | null,
 *   errors: string[],
 *   fingerprint?: string,
 *   error?: string
 * }}
 */
export function signAllConfigs(keyFingerprintOrOptions, projectRoot) {
  // Support both old API (fingerprint, projectRoot) and new API ({ fingerprint, projectRoot })
  let keyFingerprint;
  let root;

  if (keyFingerprintOrOptions && typeof keyFingerprintOrOptions === 'object') {
    keyFingerprint = keyFingerprintOrOptions.fingerprint;
    root = keyFingerprintOrOptions.projectRoot || process.cwd();
  } else {
    keyFingerprint = keyFingerprintOrOptions;
    root = projectRoot;
  }

  const result = {
    success: false,
    signedFiles: [],
    failedFiles: [],
    manifestPath: null,
    manifestSignaturePath: null,
    errors: [],
    fingerprint: keyFingerprint,
    error: null
  };

  // Validate inputs
  if (!keyFingerprint || typeof keyFingerprint !== 'string') {
    result.errors.push('Invalid key fingerprint provided');
    result.error = 'Invalid key fingerprint provided';
    return result;
  }

  if (!root || typeof root !== 'string') {
    result.errors.push('Invalid project root provided');
    result.error = 'Invalid project root provided';
    return result;
  }

  if (!fs.existsSync(root)) {
    result.errors.push(`Project root does not exist: ${root}`);
    result.error = `Project root does not exist: ${root}`;
    return result;
  }

  // Check if GPG is available
  if (!isGpgAvailable()) {
    result.errors.push('GPG is not available on this system');
    result.error = 'GPG is not available on this system';
    return result;
  }

  // Check if the key exists
  if (!keyExists(keyFingerprint)) {
    result.errors.push(`GPG key not found: ${keyFingerprint}`);
    result.error = `GPG key not found: ${keyFingerprint}`;
    return result;
  }

  // Get all config files
  const configFiles = getAllConfigFiles(root);
  const existingFiles = [];

  // Filter to only existing files
  for (const file of configFiles) {
    const absolutePath = path.join(root, file);
    if (fs.existsSync(absolutePath)) {
      existingFiles.push(file);
    } else {
      result.failedFiles.push({ path: file, error: 'File not found' });
    }
  }

  // Sign each configuration file
  for (const file of existingFiles) {
    const absolutePath = path.join(root, file);
    const signResult = signFile(absolutePath, keyFingerprint);

    if (signResult.success) {
      result.signedFiles.push(file);
    } else {
      result.failedFiles.push({ path: file, error: signResult.error });
    }
  }

  // Build and write hash manifest
  const manifestResult = buildHashManifest(existingFiles, root);

  // Add hash errors to failed files (but don't duplicate)
  for (const hashError of manifestResult.errors) {
    const alreadyFailed = result.failedFiles.some(f => f.path === hashError.path);
    if (!alreadyFailed) {
      result.failedFiles.push(hashError);
    }
  }

  // Write manifest
  const writeResult = writeHashManifest(manifestResult.manifest, root);

  if (writeResult.success) {
    result.manifestPath = writeResult.path;

    // Sign the manifest
    const manifestSignResult = signHashManifest(keyFingerprint, root);

    if (manifestSignResult.success) {
      result.manifestSignaturePath = manifestSignResult.signaturePath;
    } else {
      result.errors.push(`Failed to sign manifest: ${manifestSignResult.error}`);
    }
  } else {
    result.errors.push(`Failed to write manifest: ${writeResult.error}`);
  }

  // Determine overall success
  // Success if at least one file was signed and manifest was created
  result.success = result.signedFiles.length > 0 &&
                   result.manifestPath !== null &&
                   result.errors.length === 0;

  return result;
}

/**
 * Display summary of signed files
 * @param {object} result - Result from signAllConfigs
 * @returns {string} Formatted summary
 */
export function formatSigningSummary(result) {
  const lines = [];

  lines.push('');
  lines.push('='.repeat(60));
  lines.push('  Configuration File Signing Summary');
  lines.push('='.repeat(60));
  lines.push('');

  if (result.signedFiles.length > 0) {
    lines.push('Signed Files:');
    for (const file of result.signedFiles) {
      lines.push(`  [OK] ${file}`);
      lines.push(`       ${file}.asc`);
    }
    lines.push('');
  }

  if (result.failedFiles.length > 0) {
    lines.push('Failed Files:');
    for (const { path: filePath, error } of result.failedFiles) {
      lines.push(`  [FAIL] ${filePath}`);
      lines.push(`         Reason: ${error}`);
    }
    lines.push('');
  }

  if (result.manifestPath) {
    lines.push('Hash Manifest:');
    lines.push(`  [OK] ${path.basename(result.manifestPath)}`);
    if (result.manifestSignaturePath) {
      lines.push(`  [OK] ${path.basename(result.manifestPath)}.asc (signed)`);
    }
    lines.push('');
  }

  if (result.errors.length > 0) {
    lines.push('Errors:');
    for (const error of result.errors) {
      lines.push(`  - ${error}`);
    }
    lines.push('');
  }

  lines.push('-'.repeat(60));
  lines.push(`Total signed: ${result.signedFiles.length}`);
  lines.push(`Total failed: ${result.failedFiles.length}`);
  lines.push(`Overall status: ${result.success ? 'SUCCESS' : 'PARTIAL/FAILED'}`);
  lines.push('='.repeat(60));
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * Run as CLI if executed directly
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node config-signer.js <key-fingerprint> [project-root]');
    console.log('');
    console.log('Arguments:');
    console.log('  key-fingerprint   GPG key fingerprint or ID to use for signing');
    console.log('  project-root      Project root directory (default: current directory)');
    process.exit(1);
  }

  const keyFingerprint = args[0];
  const projectRoot = args[1] || process.cwd();

  console.log(`Signing configuration files with key: ${keyFingerprint}`);
  console.log(`Project root: ${projectRoot}`);

  const result = signAllConfigs(keyFingerprint, projectRoot);
  console.log(formatSigningSummary(result));

  process.exit(result.success ? 0 : 1);
}

// ESM entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

// Default export for compatibility
export default {
  signAllConfigs,
  verifyConfigSignature,
  verifySignature,
  getSignedFiles,
  CONFIG_FILES,
  SIGNABLE_CONFIGS
};
