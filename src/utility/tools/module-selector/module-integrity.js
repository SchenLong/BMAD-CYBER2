/**
 * Module Integrity Verification - Security Module
 *
 * Provides security features for module loading:
 * - MOD-001: SHA256 hash verification for module files
 * - MOD-002: Path traversal prevention
 * - MOD-003: Module allowlist enforcement
 *
 * @module module-integrity
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Default integrity manifest filename
 */
const INTEGRITY_MANIFEST_FILENAME = 'module-integrity-manifest.json';

/**
 * @typedef {Object} IntegrityManifest
 * @property {string} version - Manifest format version
 * @property {string} createdAt - ISO timestamp of manifest creation
 * @property {Object.<string, string>} hashes - Map of relative file paths to SHA256 hashes
 * @property {string[]} allowlist - Array of allowed module codes
 */

/**
 * @typedef {Object} IntegrityCheckResult
 * @property {boolean} valid - Whether integrity check passed
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 */

/**
 * Computes SHA256 hash of a file
 * @param {string} filePath - Absolute path to the file
 * @returns {string|null} Hex-encoded SHA256 hash or null if file cannot be read
 */
export function computeFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Computes SHA256 hashes for all files in a module directory
 * @param {string} modulePath - Absolute path to the module directory
 * @returns {Object.<string, string>} Map of relative file paths to SHA256 hashes
 */
export function computeModuleHashes(modulePath) {
  const hashes = {};

  if (!fs.existsSync(modulePath) || !fs.statSync(modulePath).isDirectory()) {
    return hashes;
  }

  function scanDirectory(dirPath, relativePath = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          scanDirectory(fullPath, relPath);
        } else if (entry.isFile()) {
          const hash = computeFileHash(fullPath);
          if (hash) {
            // Use forward slashes for cross-platform consistency
            hashes[relPath.replace(/\\/g, '/')] = hash;
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scanDirectory(modulePath);
  return hashes;
}

/**
 * Loads an integrity manifest from disk
 * @param {string} manifestPath - Path to the manifest file
 * @returns {IntegrityManifest|null} Parsed manifest or null if not found/invalid
 */
export function loadIntegrityManifest(manifestPath) {
  try {
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    // Validate manifest structure
    if (!manifest.version || !manifest.hashes || typeof manifest.hashes !== 'object') {
      return null;
    }

    return manifest;
  } catch (error) {
    return null;
  }
}

/**
 * Saves an integrity manifest to disk
 * @param {string} manifestPath - Path where to save the manifest
 * @param {Object.<string, string>} hashes - Map of file paths to hashes
 * @param {string[]} allowlist - Array of allowed module codes
 * @returns {boolean} True if saved successfully
 */
export function saveIntegrityManifest(manifestPath, hashes, allowlist = []) {
  try {
    const manifest = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      hashes,
      allowlist
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifies module file integrity against a manifest
 * MOD-001: SHA256 hash verification for module files
 * @param {string} modulePath - Absolute path to the module directory
 * @param {IntegrityManifest} manifest - Integrity manifest to verify against
 * @param {string} moduleCode - Module code for scoped hash lookup
 * @returns {IntegrityCheckResult} Result of integrity verification
 */
export function verifyModuleIntegrity(modulePath, manifest, moduleCode) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!manifest || !manifest.hashes) {
    result.warnings.push('No integrity manifest provided, skipping hash verification');
    return result;
  }

  // Compute current hashes
  const currentHashes = computeModuleHashes(modulePath);

  // Find hashes for this module (prefixed with moduleCode/)
  const modulePrefix = moduleCode + '/';
  const expectedHashes = {};

  for (const [filePath, hash] of Object.entries(manifest.hashes)) {
    if (filePath.startsWith(modulePrefix)) {
      // Remove module prefix to get relative path within module
      expectedHashes[filePath.substring(modulePrefix.length)] = hash;
    }
  }

  // If no hashes found for this module in manifest, allow but warn
  if (Object.keys(expectedHashes).length === 0) {
    result.warnings.push(`No hashes found in manifest for module: ${moduleCode}`);
    return result;
  }

  // Check each expected file
  for (const [filePath, expectedHash] of Object.entries(expectedHashes)) {
    const currentHash = currentHashes[filePath];

    if (!currentHash) {
      result.valid = false;
      result.errors.push(`Missing file: ${filePath}`);
    } else if (currentHash !== expectedHash) {
      result.valid = false;
      result.errors.push(`Hash mismatch for ${filePath}: expected ${expectedHash.substring(0, 8)}..., got ${currentHash.substring(0, 8)}...`);
    }
  }

  // Check for unexpected files (new files not in manifest)
  for (const filePath of Object.keys(currentHashes)) {
    if (!expectedHashes[filePath]) {
      result.warnings.push(`Unexpected file not in manifest: ${filePath}`);
    }
  }

  return result;
}

/**
 * Validates a path to prevent path traversal attacks
 * MOD-002: Explicit path traversal prevention
 * @param {string} inputPath - Path to validate (can be relative or absolute)
 * @param {string} allowedBaseDir - Base directory that paths must stay within
 * @returns {{valid: boolean, error: string|null, normalizedPath: string|null}} Validation result
 */
export function validatePathSecurity(inputPath, allowedBaseDir) {
  const result = {
    valid: false,
    error: null,
    normalizedPath: null
  };

  // Check for null/undefined
  if (!inputPath || typeof inputPath !== 'string') {
    result.error = 'Path is required and must be a string';
    return result;
  }

  if (!allowedBaseDir || typeof allowedBaseDir !== 'string') {
    result.error = 'Allowed base directory is required and must be a string';
    return result;
  }

  // Reject paths with null bytes (common injection technique)
  if (inputPath.includes('\0')) {
    result.error = 'Path contains null bytes';
    return result;
  }

  // Reject paths with explicit parent directory references
  // Check both normalized and raw path for ".."
  if (inputPath.includes('..')) {
    result.error = 'Path contains parent directory reference (..)';
    return result;
  }

  // Normalize the base directory
  const normalizedBase = path.resolve(allowedBaseDir);

  // Handle both absolute and relative paths
  // If inputPath is already absolute, resolve it directly
  // If it's relative, resolve it against the base directory
  const normalizedInput = path.isAbsolute(inputPath)
    ? path.resolve(inputPath)
    : path.resolve(allowedBaseDir, inputPath);

  // Check again after normalization (handles encoded sequences)
  if (normalizedInput.includes('..')) {
    result.error = 'Normalized path contains parent directory reference';
    return result;
  }

  // Ensure the resolved path is within the allowed base directory
  // Use path.sep to handle trailing slashes properly
  const baseWithSep = normalizedBase.endsWith(path.sep) ? normalizedBase : normalizedBase + path.sep;

  // Path must either be exactly the base, or start with base + separator
  if (normalizedInput !== normalizedBase && !normalizedInput.startsWith(baseWithSep)) {
    result.error = `Path escapes allowed directory: resolved to ${normalizedInput}`;
    return result;
  }

  result.valid = true;
  result.normalizedPath = normalizedInput;
  return result;
}

/**
 * Checks if a module is in the allowlist
 * MOD-003: Module allowlist enforcement
 * @param {string} moduleCode - Module code to check
 * @param {string[]} allowlist - Array of allowed module codes
 * @param {Object} options - Options for allowlist checking
 * @param {boolean} options.strict - If true, reject modules not in allowlist. If false, allow but warn.
 * @param {function} options.logger - Logger function for warnings/errors
 * @returns {{allowed: boolean, reason: string|null}} Allowlist check result
 */
export function checkModuleAllowlist(moduleCode, allowlist, options = {}) {
  const { strict = false, logger = console.warn } = options;

  const result = {
    allowed: true,
    reason: null
  };

  // Validate inputs
  if (!moduleCode || typeof moduleCode !== 'string') {
    result.allowed = false;
    result.reason = 'Invalid module code';
    return result;
  }

  // If no allowlist provided, allow all modules (non-strict mode)
  if (!allowlist || !Array.isArray(allowlist) || allowlist.length === 0) {
    if (strict) {
      result.allowed = false;
      result.reason = 'No allowlist configured and strict mode is enabled';
    }
    return result;
  }

  // Check if module is in allowlist
  const isAllowed = allowlist.includes(moduleCode);

  if (!isAllowed) {
    if (strict) {
      result.allowed = false;
      result.reason = `Module '${moduleCode}' is not in the allowlist`;
      if (logger) {
        logger(`[SECURITY] Rejected module not in allowlist: ${moduleCode}`);
      }
    } else {
      // Non-strict mode: allow but log warning
      if (logger) {
        logger(`[SECURITY WARNING] Module '${moduleCode}' is not in the allowlist but was loaded (non-strict mode)`);
      }
    }
  }

  return result;
}

/**
 * Creates a security context for module loading operations
 * Combines all security checks into a single verification
 * @param {string} bmadPath - Base _bmad directory path
 * @param {Object} options - Security options
 * @param {string} options.manifestPath - Path to integrity manifest
 * @param {string[]} options.allowlist - Module allowlist (overrides manifest allowlist)
 * @param {boolean} options.strictAllowlist - Enable strict allowlist enforcement
 * @param {boolean} options.requireIntegrity - Require integrity verification to pass
 * @param {function} options.logger - Logger function
 * @returns {Object} Security context with verification methods
 */
export function createSecurityContext(bmadPath, options = {}) {
  const {
    manifestPath = path.join(bmadPath, '..', INTEGRITY_MANIFEST_FILENAME),
    allowlist = null,
    strictAllowlist = false,
    requireIntegrity = false,
    logger = console.warn
  } = options;

  // Load manifest if available
  const manifest = loadIntegrityManifest(manifestPath);

  // Use provided allowlist or fall back to manifest allowlist
  const effectiveAllowlist = allowlist || (manifest && manifest.allowlist) || [];

  return {
    /**
     * Validates a module path for security
     * @param {string} modulePath - Path to validate
     * @returns {boolean} True if path is valid
     */
    validatePath(modulePath) {
      const result = validatePathSecurity(modulePath, bmadPath);
      if (!result.valid && logger) {
        logger(`[SECURITY] Path validation failed: ${result.error}`);
      }
      return result.valid;
    },

    /**
     * Checks if a module is allowed to be loaded
     * @param {string} moduleCode - Module code to check
     * @returns {boolean} True if module is allowed
     */
    isModuleAllowed(moduleCode) {
      const result = checkModuleAllowlist(moduleCode, effectiveAllowlist, {
        strict: strictAllowlist,
        logger
      });
      return result.allowed;
    },

    /**
     * Verifies module integrity
     * @param {string} modulePath - Path to module directory
     * @param {string} moduleCode - Module code
     * @returns {IntegrityCheckResult} Integrity check result
     */
    verifyIntegrity(modulePath, moduleCode) {
      const result = verifyModuleIntegrity(modulePath, manifest, moduleCode);

      if (!result.valid && logger) {
        for (const error of result.errors) {
          logger(`[SECURITY] Integrity error: ${error}`);
        }
      }

      for (const warning of result.warnings) {
        if (logger) {
          logger(`[SECURITY WARNING] ${warning}`);
        }
      }

      return result;
    },

    /**
     * Performs all security checks for a module
     * @param {string} modulePath - Path to module directory
     * @param {string} moduleCode - Module code
     * @returns {{allowed: boolean, errors: string[]}} Combined security check result
     */
    checkModule(modulePath, moduleCode) {
      const errors = [];

      // Check path security
      if (!this.validatePath(modulePath)) {
        errors.push('Path validation failed');
      }

      // Check allowlist
      if (!this.isModuleAllowed(moduleCode)) {
        errors.push(`Module '${moduleCode}' is not in the allowlist`);
      }

      // Check integrity
      const integrityResult = this.verifyIntegrity(modulePath, moduleCode);
      if (requireIntegrity && !integrityResult.valid) {
        errors.push(...integrityResult.errors);
      }

      return {
        allowed: errors.length === 0,
        errors
      };
    },

    /**
     * Gets the effective allowlist
     * @returns {string[]} The allowlist being used
     */
    getAllowlist() {
      return [...effectiveAllowlist];
    },

    /**
     * Checks if an integrity manifest is loaded
     * @returns {boolean} True if manifest is loaded
     */
    hasManifest() {
      return manifest !== null;
    }
  };
}

/**
 * Generates an integrity manifest for all modules in a _bmad directory
 * Utility function for creating initial manifests
 * @param {string} bmadPath - Path to _bmad directory
 * @param {string[]} allowlist - List of allowed module codes
 * @returns {IntegrityManifest} Generated manifest
 */
export function generateIntegrityManifest(bmadPath, allowlist = []) {
  const hashes = {};

  if (!fs.existsSync(bmadPath)) {
    return { version: '1.0', createdAt: new Date().toISOString(), hashes, allowlist };
  }

  try {
    const entries = fs.readdirSync(bmadPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip non-directories and special directories
      if (!entry.isDirectory() || entry.name.startsWith('_')) {
        continue;
      }

      const modulePath = path.join(bmadPath, entry.name);
      const moduleYamlPath = path.join(modulePath, 'module.yaml');

      // Only include directories with module.yaml
      if (fs.existsSync(moduleYamlPath)) {
        const moduleHashes = computeModuleHashes(modulePath);

        // Prefix all hashes with module name
        for (const [filePath, hash] of Object.entries(moduleHashes)) {
          hashes[`${entry.name}/${filePath}`] = hash;
        }
      }
    }
  } catch (error) {
    // Return empty manifest on error
  }

  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    hashes,
    allowlist
  };
}
