/**
 * Custom Endpoint UI - INST-015
 * Epic 3, Story 5 - Custom Endpoint Configuration
 *
 * Collects custom API endpoint configuration from user.
 * Validates URL format, collects model name and API key.
 *
 * @module llm-setup/custom-endpoint-ui
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * @typedef {Object} CustomEndpointConfig
 * @property {string} url - API endpoint URL
 * @property {string} model - Model name/identifier
 * @property {string} [apiKey] - API key (optional)
 * @property {string} [apiFormat] - API format (openai, anthropic, custom)
 */

/**
 * Validates a URL for custom endpoint
 *
 * @param {string} url - URL to validate
 * @returns {true|string} True if valid, error message if invalid
 */
export function validateEndpointUrl(url) {
  if (!url || !url.trim()) {
    return 'URL is required';
  }

  const trimmed = url.trim();

  // Must be http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'URL must start with http:// or https://';
  }

  // http:// only allowed for localhost
  if (trimmed.startsWith('http://')) {
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
      return 'Non-HTTPS URLs only allowed for localhost and local network addresses';
    }
  }

  // Basic URL format validation
  try {
    new URL(trimmed);
    return true;
  } catch (e) {
    return 'Invalid URL format';
  }
}

/**
 * Validates model name format
 *
 * @param {string} model - Model name to validate
 * @returns {true|string} True if valid, error message if invalid
 */
export function validateModelName(model) {
  if (!model || !model.trim()) {
    return 'Model name is required';
  }

  const trimmed = model.trim();

  // Allow alphanumeric, hyphens, underscores, dots, colons, slashes
  if (!/^[\w\-.:\/]+$/.test(trimmed)) {
    return 'Model name contains invalid characters';
  }

  if (trimmed.length > 200) {
    return 'Model name too long (max 200 characters)';
  }

  return true;
}

/**
 * API format options
 */
export const API_FORMATS = [
  {
    value: 'openai',
    name: 'OpenAI Compatible',
    description: 'Standard OpenAI API format (most common)'
  },
  {
    value: 'anthropic',
    name: 'Anthropic Compatible',
    description: 'Anthropic Claude API format'
  },
  {
    value: 'ollama',
    name: 'Ollama Compatible',
    description: 'Ollama native API format'
  },
  {
    value: 'custom',
    name: 'Custom',
    description: 'Specify custom format later'
  }
];

/**
 * Prompts for endpoint URL
 *
 * @param {Object} [options] - Options
 * @param {string} [options.defaultUrl] - Default URL value
 * @returns {Promise<string>} Validated URL
 */
export async function promptEndpointUrl(options = {}) {
  const { defaultUrl = 'http://localhost:8000/v1' } = options;

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter API endpoint URL:',
      default: defaultUrl,
      validate: validateEndpointUrl
    }
  ]);

  return answer.url.trim();
}

/**
 * Prompts for model name
 *
 * @param {Object} [options] - Options
 * @param {string} [options.defaultModel] - Default model name
 * @returns {Promise<string>} Model name
 */
export async function promptModelName(options = {}) {
  const { defaultModel } = options;

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'model',
      message: 'Enter model name/identifier:',
      default: defaultModel,
      validate: validateModelName
    }
  ]);

  return answer.model.trim();
}

/**
 * Prompts for API key with password masking
 *
 * @param {Object} [options] - Options
 * @param {boolean} [options.required=false] - Whether API key is required
 * @returns {Promise<string|null>} API key or null if skipped
 */
export async function promptApiKey(options = {}) {
  const { required = false } = options;

  if (!required) {
    const skipAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasKey',
        message: 'Does this endpoint require an API key?',
        default: false
      }
    ]);

    if (!skipAnswer.hasKey) {
      return null;
    }
  }

  const answer = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter API key:',
      mask: '*',
      validate: (input) => {
        if (required && (!input || !input.trim())) {
          return 'API key is required';
        }
        return true;
      }
    }
  ]);

  return answer.apiKey || null;
}

/**
 * Prompts for API format selection
 *
 * @param {Object} [options] - Options
 * @param {string} [options.defaultFormat='openai'] - Default format
 * @returns {Promise<string>} Selected API format
 */
export async function promptApiFormat(options = {}) {
  const { defaultFormat = 'openai' } = options;

  const choices = API_FORMATS.map(format => ({
    name: `${format.name}\n    ${chalk.dim(format.description)}`,
    value: format.value,
    short: format.name
  }));

  const defaultIndex = API_FORMATS.findIndex(f => f.value === defaultFormat);

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Select API format:',
      choices,
      default: defaultIndex >= 0 ? defaultIndex : 0
    }
  ]);

  return answer.format;
}

/**
 * Shows the complete custom endpoint configuration flow
 *
 * @param {Object} [options] - Options
 * @param {string} [options.defaultUrl] - Default URL
 * @param {string} [options.defaultModel] - Default model
 * @param {string} [options.defaultFormat='openai'] - Default API format
 * @returns {Promise<CustomEndpointConfig>} Complete endpoint configuration
 */
export async function showCustomEndpointFlow(options = {}) {
  const {
    defaultUrl = 'http://localhost:8000/v1',
    defaultModel,
    defaultFormat = 'openai'
  } = options;

  console.log('');
  console.log(chalk.bold('Configure Custom Endpoint:'));
  console.log(chalk.dim('Enter the details for your custom LLM API endpoint'));
  console.log('');

  // Step 1: Get URL
  const url = await promptEndpointUrl({ defaultUrl });

  // Step 2: Get model name
  const model = await promptModelName({ defaultModel });

  // Step 3: Get API format
  const apiFormat = await promptApiFormat({ defaultFormat });

  // Step 4: Get API key (optional)
  const apiKey = await promptApiKey({ required: false });

  // Display summary
  console.log('');
  console.log(chalk.bold('Custom Endpoint Configuration:'));
  console.log(chalk.dim('-'.repeat(40)));
  console.log(`  URL:      ${url}`);
  console.log(`  Model:    ${model}`);
  console.log(`  Format:   ${apiFormat}`);
  console.log(`  API Key:  ${apiKey ? chalk.green('Configured') : chalk.dim('None')}`);
  console.log('');

  // Confirm
  const confirmAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Is this configuration correct?',
      default: true
    }
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow('Configuration cancelled. Starting over...'));
    return showCustomEndpointFlow(options);
  }

  return {
    url,
    model,
    apiKey,
    apiFormat
  };
}

/**
 * Parses a URL to extract base URL components
 *
 * @param {string} url - Full URL
 * @returns {Object} Parsed URL components
 */
export function parseEndpointUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      pathname: parsed.pathname,
      baseUrl: `${parsed.protocol}//${parsed.host}`,
      isLocal: ['localhost', '127.0.0.1'].includes(parsed.hostname.toLowerCase()) ||
               parsed.hostname.startsWith('192.168.') ||
               parsed.hostname.startsWith('10.')
    };
  } catch (e) {
    return null;
  }
}

/**
 * Suggests API format based on URL
 *
 * @param {string} url - Endpoint URL
 * @returns {string} Suggested API format
 */
export function suggestApiFormat(url) {
  const lower = url.toLowerCase();

  if (lower.includes('11434') || lower.includes('ollama')) {
    return 'ollama';
  }

  if (lower.includes('anthropic')) {
    return 'anthropic';
  }

  // Default to OpenAI format (most common)
  return 'openai';
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Custom Endpoint UI - Standalone Test\n');

  showCustomEndpointFlow()
    .then(config => {
      console.log('\nFinal configuration:');
      console.log(JSON.stringify(config, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
