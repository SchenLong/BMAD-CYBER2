/**
 * Configuration Signing - SEC-CFG-002
 * Epic 2, Security Enhancement
 *
 * Implements cryptographic signing for security configuration files.
 * Uses HMAC-SHA256 to sign and verify configuration integrity.
 *
 * @module security-config/config-signing
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Signature field name in config
 * @type {string}
 */
export const SIGNATURE_FIELD = '_signature';

/**
 * Timestamp field name in config
 * @type {string}
 */
export const SIGNED_AT_FIELD = '_signed_at';

/**
 * Default signing key (should be overridden via environment variable)
 * @type {string}
 */
const DEFAULT_SIGNING_KEY = 'bmad-security-config-default-key-v1';

/**
 * Environment variable for custom signing key
 * @type {string}
 */
export const SIGNING_KEY_ENV = 'BMAD_SECURITY_CONFIG_SIGNING_KEY';

/**
 * Gets the signing key from environment or returns default
 * @returns {string} The signing key
 */
export function getSigningKey() {
  return process.env[SIGNING_KEY_ENV] || DEFAULT_SIGNING_KEY;
}

/**
 * Checks if a custom signing key is configured
 * @returns {boolean} True if using custom key
 */
export function hasCustomSigningKey() {
  return !!process.env[SIGNING_KEY_ENV];
}

/**
 * Creates a canonical string representation of config for signing
 * Removes signature fields and sorts keys for consistency
 * @param {Object} config - Configuration object
 * @returns {string} Canonical string for signing
 */
export function canonicalizeConfig(config) {
  // Create a copy without signature fields
  const configCopy = { ...config };
  delete configCopy[SIGNATURE_FIELD];
  delete configCopy[SIGNED_AT_FIELD];

  // Sort and stringify for consistent representation
  const sortedKeys = Object.keys(configCopy).sort();
  const sortedConfig = {};

  for (const key of sortedKeys) {
    sortedConfig[key] = configCopy[key];
  }

  return JSON.stringify(sortedConfig, null, 0);
}

/**
 * Computes HMAC-SHA256 signature for configuration
 * @param {Object} config - Configuration object to sign
 * @param {string} [key] - Signing key (uses default if not provided)
 * @returns {string} Hexadecimal signature string
 */
export function computeSignature(config, key = null) {
  const signingKey = key || getSigningKey();
  const canonical = canonicalizeConfig(config);

  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(canonical);

  return hmac.digest('hex');
}

/**
 * Signs a configuration object
 * Adds signature and timestamp fields to the config
 * @param {Object} config - Configuration object to sign
 * @param {string} [key] - Signing key (uses default if not provided)
 * @returns {Object} Signed configuration with signature fields
 */
export function signConfig(config, key = null) {
  // Remove any existing signature fields first
  const configCopy = { ...config };
  delete configCopy[SIGNATURE_FIELD];
  delete configCopy[SIGNED_AT_FIELD];

  // Add signed timestamp
  configCopy[SIGNED_AT_FIELD] = new Date().toISOString();

  // Compute and add signature
  configCopy[SIGNATURE_FIELD] = computeSignature(configCopy, key);

  return configCopy;
}

/**
 * Verifies the signature of a configuration object
 * @param {Object} config - Configuration object to verify
 * @param {string} [key] - Signing key (uses default if not provided)
 * @returns {{valid: boolean, error?: string}} Verification result
 */
export function verifySignature(config, key = null) {
  // Check if signature field exists
  if (!config || !config[SIGNATURE_FIELD]) {
    return {
      valid: false,
      error: 'Configuration is not signed (missing signature field)'
    };
  }

  const providedSignature = config[SIGNATURE_FIELD];

  // Compute expected signature
  const expectedSignature = computeSignature(config, key);

  // Use timing-safe comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return {
      valid: false,
      error: 'Invalid signature length'
    };
  }

  const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!isValid) {
    return {
      valid: false,
      error: 'Signature verification failed - configuration may have been tampered with'
    };
  }

  return { valid: true };
}

/**
 * Checks if a configuration is signed
 * @param {Object} config - Configuration object
 * @returns {boolean} True if config has signature field
 */
export function isSigned(config) {
  return !!(config && typeof config[SIGNATURE_FIELD] === 'string');
}

/**
 * Gets signature metadata from a signed config
 * @param {Object} config - Signed configuration object
 * @returns {{signature: string, signedAt: string}|null} Signature metadata or null if not signed
 */
export function getSignatureMetadata(config) {
  if (!isSigned(config)) {
    return null;
  }

  return {
    signature: config[SIGNATURE_FIELD],
    signedAt: config[SIGNED_AT_FIELD] || null
  };
}

/**
 * Removes signature fields from a configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Configuration without signature fields
 */
export function stripSignature(config) {
  const configCopy = { ...config };
  delete configCopy[SIGNATURE_FIELD];
  delete configCopy[SIGNED_AT_FIELD];
  return configCopy;
}

/**
 * Signs a configuration file in place
 * @param {string} configPath - Path to configuration file
 * @param {string} [key] - Signing key (uses default if not provided)
 * @returns {{success: boolean, error?: string}} Result
 */
export function signConfigFile(configPath, key = null) {
  try {
    if (!fs.existsSync(configPath)) {
      return { success: false, error: 'Configuration file not found' };
    }

    // Read and parse the config
    const content = fs.readFileSync(configPath, 'utf8');

    // Simple YAML parsing for our config format
    // Note: We'll work with the raw content and append signature
    const config = parseConfigForSigning(content);

    // Sign the config
    const signedConfig = signConfig(config, key);

    // Write back (we'll serialize with signature)
    const signedContent = serializeSignedConfig(signedConfig, content);

    // Atomic write
    const tempPath = configPath + '.tmp';
    fs.writeFileSync(tempPath, signedContent, 'utf8');
    fs.renameSync(tempPath, configPath);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Verifies a configuration file's signature
 * @param {string} configPath - Path to configuration file
 * @param {string} [key] - Signing key (uses default if not provided)
 * @returns {{valid: boolean, error?: string}} Verification result
 */
export function verifyConfigFile(configPath, key = null) {
  try {
    if (!fs.existsSync(configPath)) {
      return { valid: false, error: 'Configuration file not found' };
    }

    const content = fs.readFileSync(configPath, 'utf8');
    const config = parseConfigForSigning(content);

    return verifySignature(config, key);
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Parses configuration content for signing purposes
 * Simplified parser that handles our YAML format
 * @param {string} content - Raw file content
 * @returns {Object} Parsed configuration
 */
export function parseConfigForSigning(content) {
  const result = {};
  const lines = content.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Handle array items
    if (trimmed.startsWith('- ')) {
      if (currentArray !== null) {
        const value = trimmed.substring(2).trim();
        currentArray.push(parseValue(value));
      }
      continue;
    }

    // Handle key-value pairs
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      currentKey = key;

      if (value === '') {
        // Could be object or array - check next line
        currentArray = [];
        result[key] = currentArray;
      } else {
        currentArray = null;
        result[key] = parseValue(value);
      }
    }
  }

  // Handle nested arrays that might have been incorrectly parsed
  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value) && value.length === 0) {
      // Empty arrays stay as arrays
    }
  }

  return result;
}

/**
 * Parses a YAML value string
 * @param {string} value - Raw value string
 * @returns {*} Parsed value
 */
function parseValue(value) {
  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Handle null
  if (value === 'null' || value === '~') return null;

  // Handle numbers
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  return value;
}

/**
 * Serializes a signed configuration back to YAML-ish format
 * Preserves original content and appends signature fields
 * @param {Object} signedConfig - Signed configuration
 * @param {string} originalContent - Original file content
 * @returns {string} Serialized content with signature
 */
function serializeSignedConfig(signedConfig, originalContent) {
  // Remove existing signature lines from original
  const lines = originalContent.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith(SIGNATURE_FIELD + ':') &&
           !trimmed.startsWith(SIGNED_AT_FIELD + ':');
  });

  // Ensure file ends with newline
  let result = filteredLines.join('\n').trimEnd();

  // Append signature fields
  result += '\n\n# Cryptographic signature - DO NOT MODIFY\n';
  result += `${SIGNED_AT_FIELD}: '${signedConfig[SIGNED_AT_FIELD]}'\n`;
  result += `${SIGNATURE_FIELD}: '${signedConfig[SIGNATURE_FIELD]}'\n`;

  return result;
}

/**
 * Validates and rejects tampered configurations
 * Use this before applying any configuration
 * @param {Object} config - Configuration to validate
 * @param {Object} [options] - Options
 * @param {boolean} [options.requireSignature=false] - Require signature to be present
 * @param {string} [options.key] - Custom signing key
 * @returns {{valid: boolean, error?: string, warning?: string}} Validation result
 */
export function validateConfigIntegrity(config, options = {}) {
  const { requireSignature = false, key = null } = options;

  if (!config) {
    return { valid: false, error: 'Configuration is null or undefined' };
  }

  // Check if signed
  if (!isSigned(config)) {
    if (requireSignature) {
      return { valid: false, error: 'Configuration must be signed' };
    }
    return {
      valid: true,
      warning: 'Configuration is not signed - integrity cannot be verified'
    };
  }

  // Verify signature
  const verifyResult = verifySignature(config, key);

  if (!verifyResult.valid) {
    return {
      valid: false,
      error: `Configuration rejected: ${verifyResult.error}`
    };
  }

  return { valid: true };
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Configuration Signing - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: Sign and verify
  console.log('\n1. signConfig() and verifySignature():');
  const testConfig = {
    version: '1.0.0',
    tier: 'standard',
    features: ['auth', 'validators-6']
  };
  const signedConfig = signConfig(testConfig);
  console.log(`   Original keys: ${Object.keys(testConfig).join(', ')}`);
  console.log(`   Signed keys: ${Object.keys(signedConfig).join(', ')}`);
  console.log(`   Signature: ${signedConfig[SIGNATURE_FIELD].substring(0, 16)}...`);

  const verifyResult = verifySignature(signedConfig);
  console.log(`   Verification: ${verifyResult.valid ? 'PASSED' : 'FAILED'}`);

  // Test 2: Tamper detection
  console.log('\n2. Tamper detection:');
  const tamperedConfig = { ...signedConfig, tier: 'essential' };
  const tamperResult = verifySignature(tamperedConfig);
  console.log(`   Tampered verification: ${tamperResult.valid ? 'PASSED (BAD!)' : 'FAILED (expected)'}`);
  console.log(`   Error: ${tamperResult.error}`);

  // Test 3: Canonicalization
  console.log('\n3. canonicalizeConfig():');
  const canon1 = canonicalizeConfig({ b: 2, a: 1 });
  const canon2 = canonicalizeConfig({ a: 1, b: 2 });
  console.log(`   Key order independence: ${canon1 === canon2 ? 'PASSED' : 'FAILED'}`);

  // Test 4: Custom key
  console.log('\n4. Custom signing key:');
  const customKey = 'my-custom-secret-key';
  const customSigned = signConfig(testConfig, customKey);
  const customVerifyCorrect = verifySignature(customSigned, customKey);
  const customVerifyWrong = verifySignature(customSigned, 'wrong-key');
  console.log(`   Correct key verification: ${customVerifyCorrect.valid ? 'PASSED' : 'FAILED'}`);
  console.log(`   Wrong key verification: ${customVerifyWrong.valid ? 'PASSED (BAD!)' : 'FAILED (expected)'}`);

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete.');
}
