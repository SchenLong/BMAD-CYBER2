#!/usr/bin/env node
/**
 * LLM Setup Entry Point - INST-018
 * Epic 3, Story 8 - LLM Provider Setup Wizard
 *
 * Main entry point for the BMAD LLM provider configuration wizard.
 * Orchestrates: sync check -> detect local -> select provider -> configure -> test -> save
 *
 * Usage:
 *   npm run llm:setup             - Interactive LLM setup
 *   npm run llm:setup --show      - Show current configuration only
 *   npm run llm:setup --detect    - Detect local providers only
 *   npm run llm:setup --provider  - Pre-select a provider
 *
 * @module llm-setup/index
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { confirm, password } from '../../cli/prompts.js';

import {
  detectLocalProviders,
  formatDetectedProviders
} from './local-detector.js';

import {
  detectDrift,
  ensureSynced,
  formatConfigStatus,
  getConfigStatus,
  getEffectiveProvider
} from './config-sync.js';

import {
  CLOUD_PROVIDERS,
  getProviderByCode,
  getProviderGroup,
  LOCAL_PROVIDER_DEFS,
  requiresApiKey,
  showProviderSelector
} from './provider-selection-ui.js';

import {
  COMMON_MODEL_DESCRIPTIONS,
  showModelSelector
} from './model-selection-ui.js';

import {
  showCustomEndpointFlow
} from './custom-endpoint-ui.js';

import {
  testConnection
} from './connection-tester.js';

import {
  displaySavedConfig,
  validateConfig,
  writeConfigs
} from './provider-config.js';

/**
 * Wizard version
 */
export const WIZARD_VERSION = '2.0.0';

/**
 * Display banner for the LLM setup wizard
 */
function displayBanner() {
  console.log(chalk.bold.blue('\n╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║                 BMAD LLM Provider Setup Wizard               ║'));
  console.log(chalk.bold.blue(`║                        Version ${  WIZARD_VERSION.padEnd(26)  }║`));
  console.log(chalk.bold.blue('╚══════════════════════════════════════════════════════════════╝\n'));
}

/**
 * Shows current LLM configuration
 *
 * @param {string} [projectRoot=process.cwd()] - Project root
 */
export function showCurrentLlmConfig(projectRoot = process.cwd()) {
  console.log(chalk.bold('\nCurrent LLM Configuration:\n'));

  const status = getConfigStatus(projectRoot);
  console.log(formatConfigStatus(status));

  if (!status.yamlConfig.exists) {
    console.log(chalk.dim('\nRun `npm run llm:setup` to configure.\n'));
    return;
  }

  displaySavedConfig(projectRoot);
}

/**
 * Detects and displays local LLM providers
 *
 * @returns {Promise<Array>} Detected providers
 */
export async function detectAndShowLocalProviders() {
  console.log(chalk.dim('\nScanning for local LLM providers...\n'));

  const providers = await detectLocalProviders({ timeout: 3000 });
  console.log(formatDetectedProviders(providers));
  console.log('');

  return providers;
}

/**
 * Prompts for API key if needed
 *
 * @param {string} provider - Provider code
 * @returns {Promise<string|null>} API key or null
 */
async function promptForApiKey(provider) {
  const providerInfo = getProviderByCode(provider);
  const providerName = providerInfo ? providerInfo.name : provider;

  console.log('');
  console.log(chalk.dim(`${providerName} requires an API key.`));
  console.log(chalk.dim('The key will be stored in your environment configuration.'));
  console.log('');

  const apiKey = await password({
    message: `Enter API key for ${providerName}:`,
    validate: (value) => {
      if (!value || value.trim() === '') {
        return 'API key is required for this provider';
      }
      if (value.trim().length < 10) {
        return 'API key seems too short';
      }
      return undefined;
    }
  });

  return apiKey.trim();
}

/**
 * Main LLM setup orchestration function
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.showOnly=false] - Only show current config
 * @param {boolean} [options.detectOnly=false] - Only detect local providers
 * @param {string} [options.provider] - Pre-selected provider
 * @param {string} [options.projectRoot=process.cwd()] - Project root
 * @param {boolean} [options.silent=false] - Suppress banner
 * @param {boolean} [options.skipTest=false] - Skip connection test
 * @returns {Promise<Object>} Configuration result
 */
export async function runLlmSetup(options = {}) {
  const {
    showOnly = false,
    detectOnly = false,
    provider: preselectedProvider,
    projectRoot = process.cwd(),
    silent = false,
    skipTest = false
  } = options;

  // Display banner
  if (!silent) {
    displayBanner();
  }

  // Show-only mode
  if (showOnly) {
    showCurrentLlmConfig(projectRoot);
    return { success: true, action: 'show' };
  }

  // Detect-only mode
  if (detectOnly) {
    const providers = await detectAndShowLocalProviders();
    return { success: true, action: 'detect', providers };
  }

  // Step 1: Check config sync status
  console.log(chalk.dim('Checking configuration sync status...'));
  const syncResult = await ensureSynced({
    projectRoot,
    autoResolve: true
  });

  if (!syncResult.success && syncResult.error) {
    console.log(chalk.yellow(`  Note: ${syncResult.error}`));
  }

  // Step 2: Detect local providers
  const detectedProviders = await detectLocalProviders({ timeout: 2000 });
  const runningProviders = detectedProviders.filter(p => p.running);

  if (runningProviders.length > 0) {
    console.log(chalk.green(`\n✓ Found ${runningProviders.length} running local provider(s)`));
    for (const p of runningProviders) {
      console.log(`  - ${p.name} at ${p.endpoint}`);
    }
  }

  // Step 3: Get current provider
  const currentProvider = getEffectiveProvider(projectRoot);

  // Step 4: Select provider
  let selectedProvider;
  let model = null;
  let endpoint = null;
  let apiKey = null;

  if (preselectedProvider) {
    const providerInfo = getProviderByCode(preselectedProvider);
    if (!providerInfo) {
      console.log(chalk.red(`\nUnknown provider: ${preselectedProvider}`));
      const allProviders = [...CLOUD_PROVIDERS, ...LOCAL_PROVIDER_DEFS].map(p => p.code);
      console.log(chalk.dim(`Available providers: ${  allProviders.join(', ')  }\n`));
      return { success: false, error: 'Unknown provider' };
    }
    selectedProvider = preselectedProvider;
    console.log(chalk.dim(`\nUsing pre-selected provider: ${providerInfo.name}\n`));
  } else {
    selectedProvider = await showProviderSelector({
      detectedProviders,
      currentProvider
    });
  }

  // Step 5: Handle custom endpoint
  if (selectedProvider === 'custom') {
    const customConfig = await showCustomEndpointFlow();
    endpoint = customConfig.url;
    model = customConfig.model;
    apiKey = customConfig.apiKey;
    selectedProvider = customConfig.provider || 'custom';
  } else {
    // Step 6: Select model for local providers
    const providerGroup = getProviderGroup(selectedProvider);

    if (providerGroup === 'local') {
      const detected = detectedProviders.find(p => p.code === selectedProvider);
      if (detected && detected.models && detected.models.length > 0 && detected.models[0] !== 'default') {
        model = await showModelSelector({
          provider: selectedProvider,
          availableModels: detected.models
        });
      }
    } else if (providerGroup === 'cloud' && selectedProvider !== 'claude') {
      // Get API key for non-Claude cloud providers
      apiKey = await promptForApiKey(selectedProvider);
    }
  }

  // Step 7: Test connection (unless skipped)
  if (!skipTest) {
    console.log('');
    console.log(chalk.bold('Testing connection...'));
    console.log('');

    const testResult = await testConnection({
      provider: selectedProvider,
      apiKey,
      baseUrl: endpoint,
      timeout: 10000
    });

    if (!testResult.success) {
      const continueAnyway = await confirm({
        message: 'Connection test failed. Save configuration anyway?',
        initialValue: false
      });

      if (!continueAnyway) {
        console.log(chalk.yellow('\nConfiguration cancelled.\n'));
        return { success: false, action: 'cancelled', reason: 'connection_failed' };
      }
    }
  }

  // Step 8: Save configuration
  console.log('');
  console.log(chalk.dim('Saving configuration...'));

  const config = {
    provider: selectedProvider,
    model,
    endpoint,
    apiKey
  };

  const writeResult = writeConfigs(config, { projectRoot });

  if (!writeResult.success) {
    console.log(chalk.red(`\n✗ Failed to save configuration: ${writeResult.error}\n`));
    return { success: false, error: writeResult.error };
  }

  console.log(chalk.green(`✓ Configuration saved`));
  if (writeResult.filesWritten && writeResult.filesWritten.length > 0) {
    console.log(chalk.dim(`  Files: ${writeResult.filesWritten.join(', ')}`));
  }

  // Step 9: Final summary
  console.log('');
  console.log(chalk.bold.blue('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║              LLM Provider Setup Complete!                    ║'));
  console.log(chalk.bold.blue('╚══════════════════════════════════════════════════════════════╝\n'));

  const providerInfo = getProviderByCode(selectedProvider);
  console.log(`  Provider: ${chalk.cyan(providerInfo ? providerInfo.name : selectedProvider)}`);
  if (model) {
    console.log(`  Model: ${chalk.cyan(model)}`);
  }
  if (endpoint) {
    console.log(`  Endpoint: ${chalk.cyan(endpoint)}`);
  }
  console.log('');

  console.log(chalk.dim('Run `npm run llm:setup --show` to view current configuration.\n'));

  return {
    success: true,
    action: 'configured',
    provider: selectedProvider,
    model,
    endpoint
  };
}

/**
 * Parse command line arguments
 *
 * @returns {Object} Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    showOnly: false,
    detectOnly: false,
    provider: null,
    skipTest: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--show' || arg === '-s') {
      options.showOnly = true;
    } else if (arg === '--detect' || arg === '-d') {
      options.detectOnly = true;
    } else if (arg === '--provider' || arg === '-p') {
      options.provider = args[++i];
    } else if (arg === '--skip-test') {
      options.skipTest = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
${chalk.bold('BMAD LLM Provider Setup Wizard')}

${chalk.bold('Usage:')}
  npm run llm:setup [options]

${chalk.bold('Options:')}
  --show, -s              Show current LLM configuration only
  --detect, -d            Detect local LLM providers only
  --provider, -p <code>   Pre-select a provider (skip provider selection)
  --skip-test             Skip connection testing
  --help, -h              Show this help message

${chalk.bold('Cloud Providers:')}
  claude                  Anthropic Claude (via Claude Code CLI)
  openai                  OpenAI GPT models
  groq                    Groq (fast inference)
  together                Together AI (serverless inference)

${chalk.bold('Local Providers:')}
  ollama                  Ollama local server
  vllm                    vLLM high-performance serving
  lmstudio                LM Studio desktop app
  llamacpp                llama.cpp server

${chalk.bold('Examples:')}
  npm run llm:setup                    # Interactive setup
  npm run llm:setup --show             # View current config
  npm run llm:setup --detect           # Scan for local providers
  npm run llm:setup --provider ollama  # Pre-select Ollama
`);
}

// ============================================================================
// ESM Entry Point Detection
// ============================================================================
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  runLlmSetup(options)
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red('\n✗ LLM setup failed:'));
      console.error(chalk.red(`  ${error.message}\n`));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}
