/**
 * Config Sync Service - INST-038
 * Epic 3, Story 2 - Configuration Synchronization
 *
 * Maintains single source of truth for LLM configuration between:
 * - _bmad/_config/llm-config.yaml (BMAD framework)
 * - .claude/llm-provider.txt (Claude Code CLI)
 *
 * @module llm-setup/config-sync
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

/**
 * Configuration file paths relative to project root
 */
export const CONFIG_PATHS = {
  yamlConfig: '_bmad/_config/llm-config.yaml',
  txtConfig: '.claude/llm-provider.txt'
};

/**
 * @typedef {Object} ConfigState
 * @property {string|null} yamlProvider - Provider from llm-config.yaml
 * @property {string|null} txtProvider - Provider from llm-provider.txt
 * @property {boolean} yamlExists - Whether yaml file exists
 * @property {boolean} txtExists - Whether txt file exists
 * @property {boolean} synced - Whether configs are in sync
 * @property {string|null} drift - Description of drift if not synced
 */

/**
 * @typedef {Object} SyncResult
 * @property {boolean} success - Whether sync was successful
 * @property {string} provider - The active provider after sync
 * @property {string} [error] - Error message if sync failed
 * @property {string} [action] - Description of action taken
 */

/**
 * Reads the active_provider from llm-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} Provider name or null if not found/readable
 */
export function readYamlProvider(projectRoot) {
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);

  try {
    if (!fs.existsSync(yamlPath)) {
      return null;
    }

    const content = fs.readFileSync(yamlPath, 'utf8');

    // Simple regex to extract active_provider value
    // Handles: active_provider: claude or active_provider: "claude"
    const match = content.match(/^active_provider:\s*["']?(\w+)["']?\s*$/m);

    if (match) {
      return match[1];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Reads the provider from llm-provider.txt
 *
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} Provider name or null if not found/readable
 */
export function readTxtProvider(projectRoot) {
  const txtPath = path.join(projectRoot, CONFIG_PATHS.txtConfig);

  try {
    if (!fs.existsSync(txtPath)) {
      return null;
    }

    const content = fs.readFileSync(txtPath, 'utf8').trim();

    // Should be a single word on a line
    if (content && /^\w+$/.test(content)) {
      return content;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Writes provider to llm-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @param {string} provider - Provider name to write
 * @returns {boolean} Success status
 */
export function writeYamlProvider(projectRoot, provider) {
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);

  try {
    // Ensure directory exists
    const dir = path.dirname(yamlPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content;
    if (fs.existsSync(yamlPath)) {
      // Update existing file
      content = fs.readFileSync(yamlPath, 'utf8');
      content = content.replace(
        /^active_provider:\s*["']?\w+["']?\s*$/m,
        `active_provider: ${provider}`
      );
    } else {
      // Create minimal config file
      content = `# BMAD LLM Configuration
version: "1.0"

# Active provider
active_provider: ${provider}
`;
    }

    fs.writeFileSync(yamlPath, content, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Writes provider to llm-provider.txt
 *
 * @param {string} projectRoot - Project root directory
 * @param {string} provider - Provider name to write
 * @returns {boolean} Success status
 */
export function writeTxtProvider(projectRoot, provider) {
  const txtPath = path.join(projectRoot, CONFIG_PATHS.txtConfig);

  try {
    // Ensure directory exists
    const dir = path.dirname(txtPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(txtPath, provider + '\n', 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Detects configuration drift between the two config sources
 *
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {ConfigState} Current configuration state
 */
export function detectDrift(projectRoot = process.cwd()) {
  const yamlPath = path.join(projectRoot, CONFIG_PATHS.yamlConfig);
  const txtPath = path.join(projectRoot, CONFIG_PATHS.txtConfig);

  const yamlExists = fs.existsSync(yamlPath);
  const txtExists = fs.existsSync(txtPath);

  const yamlProvider = readYamlProvider(projectRoot);
  const txtProvider = readTxtProvider(projectRoot);

  // Determine sync status
  let synced = true;
  let drift = null;

  if (!yamlExists && !txtExists) {
    synced = true; // Both missing is "synced" (no config)
    drift = null;
  } else if (!yamlExists && txtExists) {
    synced = false;
    drift = `llm-provider.txt has "${txtProvider}" but llm-config.yaml is missing`;
  } else if (yamlExists && !txtExists) {
    synced = false;
    drift = `llm-config.yaml has "${yamlProvider}" but llm-provider.txt is missing`;
  } else if (yamlProvider !== txtProvider) {
    synced = false;
    drift = `Configuration mismatch: yaml="${yamlProvider}" vs txt="${txtProvider}"`;
  }

  return {
    yamlProvider,
    txtProvider,
    yamlExists,
    txtExists,
    synced,
    drift
  };
}

/**
 * Gets the effective provider (txt takes precedence as runtime override)
 *
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {string} The effective provider name, defaults to 'claude'
 */
export function getEffectiveProvider(projectRoot = process.cwd()) {
  const txtProvider = readTxtProvider(projectRoot);
  if (txtProvider) {
    return txtProvider;
  }

  const yamlProvider = readYamlProvider(projectRoot);
  if (yamlProvider) {
    return yamlProvider;
  }

  return 'claude'; // Default
}

/**
 * Synchronizes configuration to a specific provider
 *
 * @param {string} provider - Provider to sync to
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {SyncResult} Result of sync operation
 */
export function syncToProvider(provider, projectRoot = process.cwd()) {
  const yamlSuccess = writeYamlProvider(projectRoot, provider);
  const txtSuccess = writeTxtProvider(projectRoot, provider);

  if (yamlSuccess && txtSuccess) {
    return {
      success: true,
      provider,
      action: `Synced both configs to "${provider}"`
    };
  }

  if (!yamlSuccess && !txtSuccess) {
    return {
      success: false,
      provider,
      error: 'Failed to write both configuration files'
    };
  }

  return {
    success: false,
    provider,
    error: `Partial sync: yaml=${yamlSuccess}, txt=${txtSuccess}`
  };
}

/**
 * Ensures configurations are synced, with optional auto-resolution
 *
 * @param {Object} [options] - Options
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @param {boolean} [options.autoResolve=false] - Auto-resolve conflicts (use txt as source)
 * @param {function} [options.promptUser] - Function to prompt user for resolution
 * @returns {Promise<SyncResult>} Result of sync check/operation
 */
export async function ensureSynced(options = {}) {
  const {
    projectRoot = process.cwd(),
    autoResolve = false,
    promptUser
  } = options;

  const state = detectDrift(projectRoot);

  // Already synced
  if (state.synced) {
    const provider = state.yamlProvider || state.txtProvider || 'claude';
    return {
      success: true,
      provider,
      action: 'Configuration already in sync'
    };
  }

  // Auto-resolve: txt takes precedence (runtime override)
  if (autoResolve) {
    const provider = state.txtProvider || state.yamlProvider || 'claude';
    return syncToProvider(provider, projectRoot);
  }

  // If promptUser function provided, use it
  if (promptUser && typeof promptUser === 'function') {
    const resolution = await promptUser(state);
    if (resolution) {
      return syncToProvider(resolution, projectRoot);
    }
    return {
      success: false,
      provider: getEffectiveProvider(projectRoot),
      error: 'User cancelled conflict resolution'
    };
  }

  // No auto-resolve and no prompt function - return drift info
  return {
    success: false,
    provider: getEffectiveProvider(projectRoot),
    error: state.drift
  };
}

/**
 * Validates a provider name
 *
 * @param {string} provider - Provider name to validate
 * @returns {boolean} True if valid provider name
 */
export function isValidProvider(provider) {
  const validProviders = [
    'claude',
    'ollama',
    'vllm',
    'lmstudio',
    'llamacpp',
    'openai',
    'groq',
    'together',
    'custom'
  ];

  return validProviders.includes(provider);
}

/**
 * Gets current configuration status for display
 *
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 * @returns {Object} Status object for display
 */
export function getConfigStatus(projectRoot = process.cwd()) {
  const state = detectDrift(projectRoot);
  const effective = getEffectiveProvider(projectRoot);

  return {
    effective,
    yamlConfig: {
      exists: state.yamlExists,
      provider: state.yamlProvider,
      path: CONFIG_PATHS.yamlConfig
    },
    txtConfig: {
      exists: state.txtExists,
      provider: state.txtProvider,
      path: CONFIG_PATHS.txtConfig
    },
    synced: state.synced,
    drift: state.drift
  };
}

/**
 * Formats config status for display
 *
 * @param {Object} status - Status from getConfigStatus
 * @returns {string} Formatted status string
 */
export function formatConfigStatus(status) {
  const lines = ['LLM Configuration Status:'];
  lines.push('');
  lines.push(`  Active Provider: ${status.effective}`);
  lines.push('');
  lines.push('  Config Files:');
  lines.push(`    ${status.yamlConfig.path}: ${status.yamlConfig.exists ? status.yamlConfig.provider : '(missing)'}`);
  lines.push(`    ${status.txtConfig.path}: ${status.txtConfig.exists ? status.txtConfig.provider : '(missing)'}`);
  lines.push('');

  if (status.synced) {
    lines.push('  Status: Synced');
  } else {
    lines.push('  Status: DRIFT DETECTED');
    lines.push(`  ${status.drift}`);
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Config Sync Service - Standalone Test\n');
  const status = getConfigStatus();
  console.log(formatConfigStatus(status));
}
