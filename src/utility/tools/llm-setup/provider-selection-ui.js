/**
 * Provider Selection UI - INST-013
 * Epic 3, Story 3 - Interactive Provider Selection
 *
 * Displays grouped list of LLM providers for user selection.
 * Groups: CLOUD PROVIDERS, LOCAL PROVIDERS, CUSTOM
 *
 * @module llm-setup/provider-selection-ui
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * @typedef {Object} ProviderOption
 * @property {string} code - Provider identifier
 * @property {string} name - Display name
 * @property {string} description - Brief description
 * @property {string} group - Provider group (cloud, local, custom)
 * @property {boolean} [recommended] - Whether this is the recommended option
 * @property {boolean} [detected] - Whether running locally
 * @property {string[]} [models] - Detected models (for local providers)
 */

/**
 * Cloud provider definitions
 */
export const CLOUD_PROVIDERS = [
  {
    code: 'claude',
    name: 'Claude',
    description: 'Anthropic Claude API via Claude Code CLI (native)',
    group: 'cloud',
    recommended: true
  },
  {
    code: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 Turbo and other OpenAI models',
    group: 'cloud'
  },
  {
    code: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with Llama and Mixtral',
    group: 'cloud'
  },
  {
    code: 'together',
    name: 'Together AI',
    description: 'Serverless inference for open-source models',
    group: 'cloud'
  }
];

/**
 * Local provider definitions
 */
export const LOCAL_PROVIDER_DEFS = [
  {
    code: 'ollama',
    name: 'Ollama',
    description: 'Local LLM server for running open-source models',
    group: 'local'
  },
  {
    code: 'vllm',
    name: 'vLLM',
    description: 'High-performance local serving with PagedAttention',
    group: 'local'
  },
  {
    code: 'lmstudio',
    name: 'LM Studio',
    description: 'Desktop app for running local models',
    group: 'local'
  },
  {
    code: 'llamacpp',
    name: 'llama.cpp',
    description: 'Direct llama.cpp server inference',
    group: 'local'
  }
];

/**
 * Custom provider option
 */
export const CUSTOM_PROVIDER = {
  code: 'custom',
  name: 'Custom Endpoint',
  description: 'Configure a custom API endpoint',
  group: 'custom'
};

/**
 * Merges detected local provider info with provider definitions
 *
 * @param {Array} detectedProviders - Results from detectLocalProviders()
 * @returns {ProviderOption[]} Enhanced local provider options
 */
export function enhanceLocalProviders(detectedProviders) {
  return LOCAL_PROVIDER_DEFS.map(def => {
    const detected = detectedProviders.find(d => d.code === def.code);
    if (detected && detected.running) {
      return {
        ...def,
        detected: true,
        models: detected.models || []
      };
    }
    return { ...def, detected: false, models: [] };
  });
}

/**
 * Creates a separator for inquirer choices
 * @param {string} text - Separator text
 * @returns {Object} Inquirer separator
 */
function createSeparator(text) {
  return new inquirer.Separator(text);
}

/**
 * Formats a provider choice for inquirer
 *
 * @param {ProviderOption} provider - Provider option
 * @returns {Object} Inquirer choice object
 */
function formatProviderChoice(provider) {
  let name = provider.name;

  // Add recommendation badge
  if (provider.recommended) {
    name = `${name} ${chalk.green('(Recommended)')}`;
  }

  // Add detected badge for local providers
  if (provider.detected) {
    name = `${name} ${chalk.cyan('(Detected - Running)')}`;
    if (provider.models && provider.models.length > 0 && provider.models[0] !== 'default') {
      const modelCount = provider.models.length;
      name = `${name} ${chalk.dim(`[${modelCount} model${modelCount !== 1 ? 's' : ''}]`)}`;
    }
  }

  // Add description
  name = `${name}\n    ${chalk.dim(provider.description)}`;

  return {
    name,
    value: provider.code,
    short: provider.name
  };
}

/**
 * Builds the provider choices array with groupings
 *
 * @param {Object} options - Options
 * @param {Array} [options.detectedProviders=[]] - Results from local detection
 * @param {string} [options.currentProvider] - Currently configured provider
 * @returns {Array} Array of inquirer choices with separators
 */
export function buildProviderChoices(options = {}) {
  const {
    detectedProviders = [],
    currentProvider
  } = options;

  const choices = [];

  // Cloud Providers Section
  choices.push(createSeparator(chalk.bold.blue('\n  CLOUD PROVIDERS')));
  choices.push(createSeparator(chalk.dim('  Hosted API services - requires API key')));

  for (const provider of CLOUD_PROVIDERS) {
    const choice = formatProviderChoice(provider);
    if (currentProvider === provider.code) {
      choice.name = `${chalk.yellow('*')} ${choice.name}`;
    }
    choices.push(choice);
  }

  // Local Providers Section
  const enhancedLocalProviders = enhanceLocalProviders(detectedProviders);
  const runningProviders = enhancedLocalProviders.filter(p => p.detected);
  const stoppedProviders = enhancedLocalProviders.filter(p => !p.detected);

  choices.push(createSeparator(''));
  choices.push(createSeparator(chalk.bold.green('\n  LOCAL PROVIDERS')));
  choices.push(createSeparator(chalk.dim('  Run models on your own hardware')));

  // Running providers first
  for (const provider of runningProviders) {
    const choice = formatProviderChoice(provider);
    if (currentProvider === provider.code) {
      choice.name = `${chalk.yellow('*')} ${choice.name}`;
    }
    choices.push(choice);
  }

  // Then stopped providers
  for (const provider of stoppedProviders) {
    const choice = formatProviderChoice(provider);
    choice.name = `${chalk.dim(choice.name)}`;
    if (currentProvider === provider.code) {
      choice.name = `${chalk.yellow('*')} ${choice.name}`;
    }
    choices.push(choice);
  }

  // Custom Section
  choices.push(createSeparator(''));
  choices.push(createSeparator(chalk.bold.magenta('\n  CUSTOM')));
  choices.push(createSeparator(chalk.dim('  Configure your own endpoint')));

  const customChoice = formatProviderChoice(CUSTOM_PROVIDER);
  if (currentProvider === 'custom') {
    customChoice.name = `${chalk.yellow('*')} ${customChoice.name}`;
  }
  choices.push(customChoice);

  return choices;
}

/**
 * Shows the provider selection UI
 *
 * @param {Object} options - Options
 * @param {Array} [options.detectedProviders=[]] - Results from local detection
 * @param {string} [options.currentProvider] - Currently configured provider
 * @returns {Promise<string>} Selected provider code
 */
export async function showProviderSelector(options = {}) {
  const {
    detectedProviders = [],
    currentProvider
  } = options;

  const choices = buildProviderChoices({ detectedProviders, currentProvider });

  console.log('');
  console.log(chalk.bold('Select LLM Provider:'));

  if (currentProvider) {
    console.log(chalk.dim(`(Currently configured: ${currentProvider})`));
  }

  console.log(chalk.dim('Use arrow keys to navigate, Enter to select'));
  console.log('');

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Choose a provider:',
      choices,
      pageSize: 20,
      loop: false
    }
  ]);

  return answer.provider;
}

/**
 * Shows a quick provider selection (no groups, just list)
 *
 * @param {Object} options - Options
 * @param {Array} [options.providers] - Custom list of providers
 * @param {string} [options.message='Select provider:'] - Prompt message
 * @returns {Promise<string>} Selected provider code
 */
export async function showQuickProviderSelector(options = {}) {
  const {
    providers = [...CLOUD_PROVIDERS, ...LOCAL_PROVIDER_DEFS],
    message = 'Select provider:'
  } = options;

  const choices = providers.map(p => ({
    name: `${p.name} - ${chalk.dim(p.description)}`,
    value: p.code,
    short: p.name
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message,
      choices,
      pageSize: 15
    }
  ]);

  return answer.provider;
}

/**
 * Gets provider info by code
 *
 * @param {string} code - Provider code
 * @returns {ProviderOption|null} Provider info or null
 */
export function getProviderByCode(code) {
  const allProviders = [...CLOUD_PROVIDERS, ...LOCAL_PROVIDER_DEFS, CUSTOM_PROVIDER];
  return allProviders.find(p => p.code === code) || null;
}

/**
 * Checks if a provider requires an API key
 *
 * @param {string} code - Provider code
 * @returns {boolean} True if API key required
 */
export function requiresApiKey(code) {
  const cloudCodes = CLOUD_PROVIDERS.map(p => p.code);
  return cloudCodes.includes(code) && code !== 'claude';
}

/**
 * Gets the group name for a provider
 *
 * @param {string} code - Provider code
 * @returns {string} Group name (cloud, local, or custom)
 */
export function getProviderGroup(code) {
  const provider = getProviderByCode(code);
  return provider ? provider.group : 'unknown';
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Provider Selection UI - Standalone Test\n');

  // Mock detected providers for demo
  const mockDetected = [
    { code: 'ollama', name: 'Ollama', running: true, models: ['llama2', 'mistral'] },
    { code: 'vllm', name: 'vLLM', running: false, models: [] }
  ];

  showProviderSelector({
    detectedProviders: mockDetected,
    currentProvider: 'claude'
  })
    .then(selected => {
      console.log('\nSelected provider:', selected);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
