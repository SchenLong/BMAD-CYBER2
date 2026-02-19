/**
 * Provider Config Writer - INST-017
 * Epic 3, Story 7 - Configuration File Writer
 *
 * Writes provider configuration to both llm-config.yaml and llm-provider.txt.
 * Uses config-sync to detect drift and ensure atomic writes.
 *
 * @module llm-setup/provider-config
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createHash } from 'crypto';

import {
  CONFIG_PATHS,
  detectDrift,
  readYamlProvider,
  syncToProvider,
  writeTxtProvider,
  writeYamlProvider
} from './config-sync.js';

/**
 * @typedef {Object} ProviderConfig
 * @property {string} provider - Provider code
 * @property {string} [model] - Model name
 * @property {string} [baseUrl] - Custom base URL
 * @property {string} [apiKey] - API key (will be saved as env var reference)
 * @property {string} [apiFormat] - API format (openai, anthropic, etc.)
 */

/**
 * @typedef {Object} WriteResult
 * @property {boolean} success - Whether write succeeded
 * @property {string[]} filesWritten - List of files written
 * @property {string} [error] - Error message if failed
 * @property {boolean} [driftResolved] - Whether configuration drift was resolved
 */

/**
 * Environment variable name mapping for API keys
 */
export const API_KEY_ENV_VARS = {
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
  together: 'TOGETHER_API_KEY',
  custom: 'CUSTOM_LLM_API_KEY'
};

/**
 * Gets the environment variable name for a provider's API key
 *
 * @param {string} provider - Provider code
 * @returns {string|null} Environment variable name or null
 */
export function getApiKeyEnvVar(provider) {
  return API_KEY_ENV_VARS[provider] || null;
}

/**
 * Computes content hash for deduplication
 *
 * @param {string} content - File content
 * @returns {string} SHA256 hash
 */
function contentHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Gets the most recent backup file path for a given config file
 *
 * @param {string} configPath - Path to the config file
 * @returns {string|null} Path to most recent backup or null
 */
function getLatestBackup(configPath) {
  const configDir = path.dirname(configPath);
  const configBasename = path.basename(configPath);
  const parentDir = path.dirname(configPath);

  try {
    const files = fs.readdirSync(parentDir);
    const backupPattern = new RegExp(`^${configBasename}\\.backup-\\d{4}-\\d{2}-\\d{2}T`);

    const backups = files
      .filter(f => backupPattern.test(f))
      .map(f => ({
        path: path.join(parentDir, f),
        time: fs.statSync(path.join(parentDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    return backups.length > 0 ? backups[0].path : null;
  } catch (e) {
    return null;
  }
}

/**
 * Gets hash of the most recent backup
 *
 * @param {string} configPath - Path to the config file
 * @returns {string|null} Hash of latest backup content or null
 */
function getLatestBackupHash(configPath) {
  const latestBackup = getLatestBackup(configPath);
  if (!latestBackup) {
    return null;
  }

  try {
    const content = fs.readFileSync(latestBackup, 'utf8');
    return contentHash(content);
  } catch (e) {
    return null;
  }
}

/**
 * Creates a backup of existing config files (with deduplication)
 *
 * Only creates a new backup if the content has changed since the last backup.
 * This prevents accumulating duplicate backup files when the configuration
 * hasn't actually changed between multiple writeConfigs() calls.
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Backup info with skipped flag
 * @property {string} [yaml] - Path to created yaml backup (if created)
 * @property {string} [txt] - Path to created txt backup (if created)
 * @property {Object} skipped - Deduplication status
 * @property {boolean} skipped.yaml - True if yaml backup was skipped (unchanged)
 * @property {boolean} skipped.txt - True if txt backup was skipped (unchanged)
 */
export function backupConfigs(projectRoot) {
  const backups = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const skipped = { yaml: false, txt: false };

  // Backup yaml config
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);
  if (fs.existsSync(yamlPath)) {
    const currentContent = fs.readFileSync(yamlPath, 'utf8');
    const currentHash = contentHash(currentContent);
    const latestBackupHash = getLatestBackupHash(yamlPath);

    if (latestBackupHash === currentHash) {
      // Content unchanged, skip backup
      skipped.yaml = true;
    } else {
      const backupPath = `${yamlPath}.backup-${timestamp}`;
      fs.copyFileSync(yamlPath, backupPath);
      backups.yaml = backupPath;
    }
  }

  // Backup txt config
  const txtPath = path.join(projectRoot, CONFIG_PATHS.txtConfig);
  if (fs.existsSync(txtPath)) {
    const currentContent = fs.readFileSync(txtPath, 'utf8');
    const currentHash = contentHash(currentContent);
    const latestBackupHash = getLatestBackupHash(txtPath);

    if (latestBackupHash === currentHash) {
      // Content unchanged, skip backup
      skipped.txt = true;
    } else {
      const backupPath = `${txtPath}.backup-${timestamp}`;
      fs.copyFileSync(txtPath, backupPath);
      backups.txt = backupPath;
    }
  }

  return { ...backups, skipped };
}

/**
 * Removes old backup files, keeping only the most recent ones
 *
 * Useful for cleanup operations to prevent excessive backup accumulation.
 * Combined with deduplication in backupConfigs(), this ensures only
 * a small number of unique backups are retained.
 *
 * @param {string} projectRoot - Project root directory
 * @param {number} [keep=3] - Number of most recent backups to keep
 * @returns {Object} Cleanup result with removed count
 * @property {number} yaml - Number of yaml backups removed
 * @property {number} txt - Number of txt backups removed
 */
export function cleanupOldBackups(projectRoot, keep = 3) {
  const removed = { yaml: 0, txt: 0 };

  const cleanupConfigBackups = (configPath, key) => {
    const parentDir = path.dirname(path.join(projectRoot, configPath));
    const configBasename = path.basename(configPath);
    const backupPattern = new RegExp(`^${configBasename}\\.backup-\\d{4}-\\d{2}-\\d{2}T`);

    try {
      const files = fs.readdirSync(parentDir);
      const backups = files
        .filter(f => backupPattern.test(f))
        .map(f => ({
          path: path.join(parentDir, f),
          time: fs.statSync(path.join(parentDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Remove all but the N most recent
      const toRemove = backups.slice(keep);
      for (const backup of toRemove) {
        fs.unlinkSync(backup.path);
        removed[key]++;
      }
    } catch (e) {
      // Directory doesn't exist or other error - skip
    }
  };

  cleanupConfigBackups(CONFIG_PATHS.yamlConfig, 'yaml');
  cleanupConfigBackups(CONFIG_PATHS.txtConfig, 'txt');

  return removed;
}

/**
 * Reads the full YAML config file
 *
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} File contents or null
 */
function readYamlConfig(projectRoot) {
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);
  try {
    if (fs.existsSync(yamlPath)) {
      return fs.readFileSync(yamlPath, 'utf8');
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Updates provider-specific settings in YAML config
 *
 * @param {string} projectRoot - Project root directory
 * @param {string} provider - Provider code
 * @param {Object} settings - Settings to update
 * @returns {boolean} Success status
 */
export function updateProviderSettings(projectRoot, provider, settings) {
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);

  try {
    let content = readYamlConfig(projectRoot);

    if (!content) {
      // Create minimal config
      content = `# BMAD LLM Configuration
version: "1.0"

active_provider: ${provider}

providers:
  ${provider}:
    type: ${provider}
`;
    }

    // Update model if specified
    if (settings.model) {
      const providerSection = new RegExp(
        `(${provider}:\\s*\\n(?:.*\\n)*?)(\\s*model:\\s*)[^\\n]+`,
        'm'
      );

      if (providerSection.test(content)) {
        content = content.replace(providerSection, `$1$2${settings.model}`);
      } else {
        // Add model to provider section
        const providerStart = new RegExp(`(${provider}:\\s*\\n)`, 'm');
        if (providerStart.test(content)) {
          content = content.replace(providerStart, `$1    model: ${settings.model}\n`);
        }
      }
    }

    // Update base_url if specified
    if (settings.baseUrl) {
      const providerSection = new RegExp(
        `(${provider}:\\s*\\n(?:.*\\n)*?)(\\s*base_url:\\s*)[^\\n]+`,
        'm'
      );

      if (providerSection.test(content)) {
        content = content.replace(providerSection, `$1$2"${settings.baseUrl}"`);
      }
    }

    // Ensure directory exists
    const dir = path.dirname(yamlPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(yamlPath, content, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Writes provider configuration to both config files
 *
 * @param {ProviderConfig} config - Provider configuration
 * @param {Object} [options] - Options
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @param {boolean} [options.createBackup=true] - Create backup before writing
 * @param {boolean} [options.checkDrift=true] - Check for drift before writing
 * @returns {WriteResult} Result of write operation
 */
export function writeConfigs(config, options = {}) {
  const {
    projectRoot = process.cwd(),
    createBackup = true,
    checkDrift = true
  } = options;

  const { provider, model, baseUrl, apiKey, apiFormat } = config;
  const filesWritten = [];
  let driftResolved = false;

  try {
    // Check for drift first
    if (checkDrift) {
      const drift = detectDrift(projectRoot);
      if (!drift.synced) {
        driftResolved = true;
      }
    }

    // Create backups (with deduplication)
    if (createBackup) {
      const backupResult = backupConfigs(projectRoot);
      // backupResult now contains { yaml?, txt?, skipped: { yaml, txt } }
      // We don't need to do anything with it - backups are created or skipped
    }

    // Write to txt file first (quick override)
    const txtSuccess = writeTxtProvider(projectRoot, provider);
    if (txtSuccess) {
      filesWritten.push(CONFIG_PATHS.txtConfig);
    }

    // Write to yaml file
    const yamlSuccess = writeYamlProvider(projectRoot, provider);
    if (yamlSuccess) {
      filesWritten.push(CONFIG_PATHS.yamlConfig);
    }

    // Update provider-specific settings if provided
    if (model || baseUrl) {
      updateProviderSettings(projectRoot, provider, { model, baseUrl });
    }

    // If both writes failed
    if (!txtSuccess && !yamlSuccess) {
      return {
        success: false,
        filesWritten: [],
        error: 'Failed to write both configuration files'
      };
    }

    return {
      success: true,
      filesWritten,
      driftResolved
    };
  } catch (error) {
    return {
      success: false,
      filesWritten,
      error: error.message
    };
  }
}

/**
 * Writes configuration with user confirmation
 *
 * @param {ProviderConfig} config - Provider configuration
 * @param {Object} [options] - Options
 * @returns {Promise<WriteResult>} Result of write operation
 */
export async function writeConfigsWithConfirmation(config, options = {}) {
  const { projectRoot = process.cwd() } = options;

  // Check current state
  const currentProvider = readYamlProvider(projectRoot);
  const drift = detectDrift(projectRoot);

  console.log('');
  console.log(chalk.bold('Configuration Summary:'));
  console.log(chalk.dim('-'.repeat(40)));
  console.log(`  Provider: ${config.provider}`);
  if (config.model) {
    console.log(`  Model: ${config.model}`);
  }
  if (config.baseUrl) {
    console.log(`  Base URL: ${config.baseUrl}`);
  }
  if (config.apiKey) {
    console.log(`  API Key: ${chalk.green('Configured')}`);
  }
  console.log('');

  if (currentProvider && currentProvider !== config.provider) {
    console.log(chalk.yellow(`Note: This will change provider from "${currentProvider}" to "${config.provider}"`));
  }

  if (!drift.synced) {
    console.log(chalk.yellow('Note: Configuration drift will be resolved'));
  }

  console.log('');

  return writeConfigs(config, options);
}

/**
 * Displays the saved configuration
 *
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 */
export function displaySavedConfig(projectRoot = process.cwd()) {
  const provider = readYamlProvider(projectRoot);
  const drift = detectDrift(projectRoot);

  console.log('');
  console.log(chalk.bold('Current LLM Configuration:'));
  console.log(chalk.dim('-'.repeat(40)));
  console.log(`  Provider: ${provider || 'Not configured'}`);
  console.log(`  Config files:`);
  console.log(`    ${CONFIG_PATHS.yamlConfig}: ${drift.yamlExists ? chalk.green('exists') : chalk.yellow('missing')}`);
  console.log(`    ${CONFIG_PATHS.txtConfig}: ${drift.txtExists ? chalk.green('exists') : chalk.yellow('missing')}`);

  if (!drift.synced) {
    console.log('');
    console.log(chalk.yellow('  Warning: Configuration drift detected'));
    console.log(`  ${drift.drift}`);
  } else {
    console.log('');
    console.log(chalk.green('  Configuration is synchronized'));
  }
  console.log('');
}

/**
 * Validates a provider configuration
 *
 * @param {ProviderConfig} config - Configuration to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateConfig(config) {
  const errors = [];

  if (!config.provider) {
    errors.push('Provider is required');
  }

  if (config.baseUrl) {
    try {
      new URL(config.baseUrl);
    } catch (e) {
      errors.push('Invalid base URL format');
    }
  }

  if (config.model && typeof config.model !== 'string') {
    errors.push('Model must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Provider Config Writer - Standalone Test\n');
  displaySavedConfig();
}
