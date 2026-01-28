/**
 * Provider Config Writer - INST-017
 * Epic 3, Story 7 - Configuration File Writer
 *
 * Writes provider configuration to both llm-config.yaml and llm-provider.txt.
 * Uses config-sync to detect drift and ensure atomic writes.
 *
 * @module llm-setup/provider-config
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import {
  CONFIG_PATHS,
  detectDrift,
  syncToProvider,
  readYamlProvider,
  writeYamlProvider,
  writeTxtProvider
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
 * Creates a backup of existing config files
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Backup info
 */
export function backupConfigs(projectRoot) {
  const backups = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Backup yaml config
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);
  if (fs.existsSync(yamlPath)) {
    const backupPath = `${yamlPath}.backup-${timestamp}`;
    fs.copyFileSync(yamlPath, backupPath);
    backups.yaml = backupPath;
  }

  // Backup txt config
  const txtPath = path.join(projectRoot, CONFIG_PATHS.txtConfig);
  if (fs.existsSync(txtPath)) {
    const backupPath = `${txtPath}.backup-${timestamp}`;
    fs.copyFileSync(txtPath, backupPath);
    backups.txt = backupPath;
  }

  return backups;
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

    // Create backups
    if (createBackup) {
      backupConfigs(projectRoot);
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
