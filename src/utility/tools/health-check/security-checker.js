/**
 * Security Validator Status Checker - INST-022
 * Epic 4 - Post-Install Health Check
 *
 * Checks security configuration status, validates enabled validators,
 * and reports on security tier and audit logging configuration.
 *
 * @module security-checker
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to validators directory relative to project root
 * @type {string}
 */
export const VALIDATORS_PATH = '_bmad/framework/validators/';

/**
 * Path to guards directory relative to project root
 * @type {string}
 */
export const GUARDS_PATH = '.claude/validators-node/src/guards/';

/**
 * Path to security config file relative to project root
 * @type {string}
 */
export const SECURITY_CONFIG_PATH = '_bmad/core/security/security-config.yaml';

/**
 * Path to audit log directory relative to project root
 * @type {string}
 */
export const AUDIT_LOG_PATH = '_bmad/framework/dist/audit/';

/**
 * Security check status values
 * @readonly
 * @enum {string}
 */
export const SecurityStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
};

/**
 * @typedef {Object} ValidatorInfo
 * @property {string} name - Validator name
 * @property {string} path - Validator file path
 * @property {boolean} loadable - Whether the validator can be loaded
 */

/**
 * @typedef {Object} FailedValidator
 * @property {string} name - Validator name
 * @property {string} path - Validator file path
 * @property {string} error - Error message
 */

/**
 * @typedef {Object} AuditLoggingStatus
 * @property {boolean} enabled - Whether audit logging is enabled
 * @property {string|null} logPath - Path to audit logs
 */

/**
 * @typedef {Object} SecurityCheckResult
 * @property {string} status - Overall security status (healthy|degraded|unhealthy)
 * @property {string} tier - Configured security tier or 'unconfigured'
 * @property {string|null} tierDescription - Description of the tier
 * @property {ValidatorInfo[]} enabledValidators - List of enabled validators
 * @property {FailedValidator[]} failedValidators - List of validators that failed to load
 * @property {AuditLoggingStatus} auditLogging - Audit logging status
 * @property {string[]} warnings - List of warnings
 */

/**
 * Security tier descriptions
 * @type {Object<string, string>}
 */
const TIER_DESCRIPTIONS = {
  essential: 'Minimal security - core authorization only. For development/testing.',
  standard: 'Recommended baseline - includes all 6 standard validators.',
  advanced: 'Full security suite - adds RBAC, session, and token management.',
  enterprise: 'Maximum protection - adds audit logging and integrity verification.',
  beta: 'Experimental features - includes all plus beta/experimental security features.'
};

/**
 * Simple YAML parser for security config structure
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
 * Reads the security configuration file
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {Object|null} Parsed security config or null if not found/invalid
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
    return null;
  }
}

/**
 * Extracts enabled validator information from security config
 * @param {Object} config - Security configuration object
 * @returns {Array<{name: string, paths: string[]}>} List of enabled validators with paths
 */
export function listEnabledValidators(config) {
  if (!config || !config.validators) {
    return [];
  }

  const validators = [];

  for (const [name, validatorConfig] of Object.entries(config.validators)) {
    if (validatorConfig && validatorConfig.enabled) {
      validators.push({
        name,
        paths: Array.isArray(validatorConfig.paths) ? validatorConfig.paths : [validatorConfig.paths]
      });
    }
  }

  return validators;
}

/**
 * Tests if a validator file can be loaded (exists and has valid syntax)
 * @param {string} validatorPath - Path to the validator file relative to project root
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ loadable: boolean, error?: string }} Load test result
 */
export function testValidatorLoad(validatorPath, projectRoot = process.cwd()) {
  const fullPath = path.join(projectRoot, validatorPath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return { loadable: false, error: `File not found: ${validatorPath}` };
  }

  // Skip non-JS files (yaml, sh, md, etc.)
  const ext = path.extname(fullPath).toLowerCase();
  if (!['.js', '.mjs', '.cjs'].includes(ext)) {
    // For non-JS files, just check existence
    return { loadable: true };
  }

  try {
    // Read file content to check for syntax errors
    const content = fs.readFileSync(fullPath, 'utf8');

    // Basic syntax check - look for common issues
    // Try to parse as a function to check syntax
    try {
      // Use Function constructor for basic syntax validation
      // This catches most syntax errors without actually running the code
      new Function(content);
    } catch (syntaxError) {
      // Check if it's an ES Module (has import/export)
      // ES Modules can't be validated with Function constructor
      const isESM = /\b(import|export)\s+/.test(content);
      if (!isESM) {
        return { loadable: false, error: `Syntax error: ${syntaxError.message}` };
      }
      // For ESM, we just check the file exists and is readable
    }

    return { loadable: true };
  } catch (error) {
    return { loadable: false, error: `Read error: ${error.message}` };
  }
}

/**
 * Checks a specific validator by name
 * @param {string} name - Validator feature name
 * @param {string[]} paths - Array of validator file paths
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ name: string, results: Array<{ path: string, loadable: boolean, error?: string }> }}
 */
export function checkValidator(name, paths, projectRoot = process.cwd()) {
  const results = [];

  for (const validatorPath of paths) {
    const testResult = testValidatorLoad(validatorPath, projectRoot);
    results.push({
      path: validatorPath,
      loadable: testResult.loadable,
      ...(testResult.error && { error: testResult.error })
    });
  }

  return { name, results };
}

/**
 * Checks all enabled validators from the security config
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ enabledValidators: ValidatorInfo[], failedValidators: FailedValidator[] }}
 */
export function checkAllValidators(projectRoot = process.cwd()) {
  const config = readSecurityConfig(projectRoot);
  const enabledValidators = [];
  const failedValidators = [];

  if (!config) {
    return { enabledValidators, failedValidators };
  }

  const validators = listEnabledValidators(config);

  for (const { name, paths } of validators) {
    const checkResult = checkValidator(name, paths, projectRoot);

    for (const result of checkResult.results) {
      if (result.loadable) {
        enabledValidators.push({
          name,
          path: result.path,
          loadable: true
        });
      } else {
        failedValidators.push({
          name,
          path: result.path,
          error: result.error || 'Unknown error'
        });
      }
    }
  }

  return { enabledValidators, failedValidators };
}

/**
 * Gets the configured security tier
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {{ tier: string, tierDescription: string|null }} Tier information
 */
export function getSecurityTier(projectRoot = process.cwd()) {
  const config = readSecurityConfig(projectRoot);

  if (!config || !config.tier) {
    return { tier: 'unconfigured', tierDescription: null };
  }

  const tier = config.tier;
  const tierDescription = TIER_DESCRIPTIONS[tier] || config.tier_name || null;

  return { tier, tierDescription };
}

/**
 * Checks audit logging status
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {AuditLoggingStatus} Audit logging status
 */
export function checkAuditLogging(projectRoot = process.cwd()) {
  const config = readSecurityConfig(projectRoot);

  // Check if audit-logging feature is enabled in config
  const features = config?.features || [];
  const hasAuditFeature = features.includes('audit-logging');

  // Check if audit directory exists
  const auditPath = path.join(projectRoot, AUDIT_LOG_PATH);
  const auditDirExists = fs.existsSync(auditPath);

  // Check validators config for audit-logging
  const auditValidator = config?.validators?.['audit-logging'];
  const auditEnabled = hasAuditFeature || (auditValidator && auditValidator.enabled);

  return {
    enabled: Boolean(auditEnabled && auditDirExists),
    logPath: auditDirExists ? auditPath : null
  };
}

/**
 * Main function to check overall security health
 * @param {string} [projectRoot=process.cwd()] - Root directory of the project
 * @returns {SecurityCheckResult} Complete security check result
 */
export function checkSecurity(projectRoot = process.cwd()) {
  const warnings = [];

  // Get tier information
  const { tier, tierDescription } = getSecurityTier(projectRoot);

  if (tier === 'unconfigured') {
    warnings.push('Security is not configured. Run the security configuration wizard.');
  }

  // Check all validators
  const { enabledValidators, failedValidators } = checkAllValidators(projectRoot);

  if (failedValidators.length > 0) {
    warnings.push(`${failedValidators.length} validator(s) failed to load.`);
  }

  if (enabledValidators.length === 0 && tier !== 'unconfigured') {
    warnings.push('No validators are enabled. Security may not be properly configured.');
  }

  // Check audit logging
  const auditLogging = checkAuditLogging(projectRoot);

  // Check if enterprise tier but audit logging is disabled
  if ((tier === 'enterprise' || tier === 'beta') && !auditLogging.enabled) {
    warnings.push('Enterprise/Beta tier configured but audit logging is not enabled or audit directory is missing.');
  }

  // Determine overall status
  let status = SecurityStatus.HEALTHY;

  if (tier === 'unconfigured') {
    status = SecurityStatus.UNHEALTHY;
  } else if (failedValidators.length > 0) {
    status = SecurityStatus.DEGRADED;
  } else if (warnings.length > 0 && enabledValidators.length === 0) {
    status = SecurityStatus.UNHEALTHY;
  }

  return {
    status,
    tier,
    tierDescription,
    enabledValidators,
    failedValidators,
    auditLogging,
    warnings
  };
}

/**
 * Formats security check result for display
 * @param {SecurityCheckResult} result - Security check result
 * @returns {string} Formatted output string
 */
export function formatSecurityResult(result) {
  const lines = [];

  // Status header
  const statusIcon = result.status === SecurityStatus.HEALTHY ? '[OK]' :
                     result.status === SecurityStatus.DEGRADED ? '[WARN]' : '[FAIL]';
  lines.push(`Security Status: ${statusIcon} ${result.status.toUpperCase()}`);
  lines.push('');

  // Tier information
  lines.push(`Security Tier: ${result.tier}`);
  if (result.tierDescription) {
    lines.push(`  ${result.tierDescription}`);
  }
  lines.push('');

  // Enabled validators
  lines.push(`Enabled Validators: ${result.enabledValidators.length}`);
  for (const validator of result.enabledValidators) {
    lines.push(`  [OK] ${validator.name}: ${validator.path}`);
  }

  // Failed validators
  if (result.failedValidators.length > 0) {
    lines.push('');
    lines.push(`Failed Validators: ${result.failedValidators.length}`);
    for (const validator of result.failedValidators) {
      lines.push(`  [FAIL] ${validator.name}: ${validator.path}`);
      lines.push(`         Error: ${validator.error}`);
    }
  }
  lines.push('');

  // Audit logging
  lines.push(`Audit Logging: ${result.auditLogging.enabled ? 'Enabled' : 'Disabled'}`);
  if (result.auditLogging.logPath) {
    lines.push(`  Log Path: ${result.auditLogging.logPath}`);
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Security Checker - Self-Test\n');
  console.log('='.repeat(60));

  const result = checkSecurity();
  console.log(formatSecurityResult(result));

  console.log('\n' + '='.repeat(60));
}
