/**
 * Model Selection UI - INST-014
 * Epic 3, Story 4 - Interactive Model Selection
 *
 * Shows detected models for local providers with descriptions.
 * Allows custom model name input.
 *
 * @module llm-setup/model-selection-ui
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Common model descriptions for well-known models
 */
export const COMMON_MODEL_DESCRIPTIONS = {
  // Llama models
  'llama2': 'Meta Llama 2 - General purpose, 7B-70B parameters',
  'llama2:7b': 'Llama 2 7B - Fast, good for simple tasks',
  'llama2:13b': 'Llama 2 13B - Balanced performance',
  'llama2:70b': 'Llama 2 70B - Best quality, slowest',
  'llama3': 'Meta Llama 3 - Latest generation, improved reasoning',
  'llama3:8b': 'Llama 3 8B - Fast, efficient',
  'llama3:70b': 'Llama 3 70B - Top quality',
  'llama3.1': 'Meta Llama 3.1 - Extended context, tool use',
  'llama3.1:8b': 'Llama 3.1 8B - 128K context',
  'llama3.1:70b': 'Llama 3.1 70B - Best for complex tasks',

  // Code models
  'codellama': 'Code Llama - Optimized for code generation',
  'codellama:7b': 'Code Llama 7B - Fast coding assistant',
  'codellama:13b': 'Code Llama 13B - Better code quality',
  'codellama:34b': 'Code Llama 34B - Best code generation',
  'deepseek-coder': 'DeepSeek Coder - Strong coding model',
  'deepseek-coder-v2': 'DeepSeek Coder V2 - Improved reasoning',
  'starcoder2': 'StarCoder 2 - Code completion specialist',

  // Mistral models
  'mistral': 'Mistral 7B - Efficient, fast inference',
  'mistral:7b': 'Mistral 7B - Great quality/speed ratio',
  'mixtral': 'Mixtral 8x7B - Mixture of experts model',
  'mixtral:8x7b': 'Mixtral 8x7B MoE - 47B total params',
  'mixtral:8x22b': 'Mixtral 8x22B - Largest Mixtral',

  // Qwen models
  'qwen': 'Qwen - Alibaba multilingual model',
  'qwen2': 'Qwen 2 - Improved multilingual support',
  'qwen2:7b': 'Qwen 2 7B - Fast multilingual',
  'qwen2:72b': 'Qwen 2 72B - Best multilingual',
  'qwen2.5': 'Qwen 2.5 - Latest Qwen generation',
  'qwen2.5:72b': 'Qwen 2.5 72B - Extended capabilities',

  // Other popular models
  'phi3': 'Microsoft Phi-3 - Small but capable',
  'phi3:mini': 'Phi-3 Mini - 3.8B parameters',
  'phi3:medium': 'Phi-3 Medium - 14B parameters',
  'gemma': 'Google Gemma - Efficient open model',
  'gemma:7b': 'Gemma 7B - Google open weights',
  'gemma2': 'Google Gemma 2 - Improved version',
  'command-r': 'Cohere Command R - Retrieval optimized',
  'command-r-plus': 'Command R Plus - Enhanced capabilities',
  'nemotron-mini': 'NVIDIA Nemotron Mini - Fast inference',
  'yi': 'Yi - 01.AI bilingual model',

  // Special models
  'default': 'Default model loaded in server',
  'local-model': 'Currently loaded local model'
};

/**
 * Gets description for a model name
 *
 * @param {string} modelName - Model name/identifier
 * @returns {string} Description or empty string
 */
export function getModelDescription(modelName) {
  // Try exact match first
  if (COMMON_MODEL_DESCRIPTIONS[modelName]) {
    return COMMON_MODEL_DESCRIPTIONS[modelName];
  }

  // Try base name (before colon)
  const baseName = modelName.split(':')[0];
  if (COMMON_MODEL_DESCRIPTIONS[baseName]) {
    return COMMON_MODEL_DESCRIPTIONS[baseName];
  }

  // Try lowercase
  const lower = modelName.toLowerCase();
  if (COMMON_MODEL_DESCRIPTIONS[lower]) {
    return COMMON_MODEL_DESCRIPTIONS[lower];
  }

  return '';
}

/**
 * Formats a model choice for inquirer
 *
 * @param {string} modelName - Model name
 * @param {boolean} [isCustom=false] - Whether this is custom option
 * @returns {Object} Inquirer choice object
 */
function formatModelChoice(modelName, isCustom = false) {
  if (isCustom) {
    return {
      name: `${chalk.yellow('+')} Enter custom model name`,
      value: '__custom__',
      short: 'Custom'
    };
  }

  const description = getModelDescription(modelName);
  let name = modelName;

  if (description) {
    name = `${modelName}\n    ${chalk.dim(description)}`;
  }

  return {
    name,
    value: modelName,
    short: modelName
  };
}

/**
 * Creates separator for inquirer
 * @param {string} text - Separator text
 * @returns {Object} Inquirer separator
 */
function createSeparator(text) {
  return new inquirer.Separator(text);
}

/**
 * Builds model choices array
 *
 * @param {string[]} models - Available models
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowCustom=true] - Allow custom model entry
 * @param {string} [options.currentModel] - Currently configured model
 * @returns {Array} Array of inquirer choices
 */
export function buildModelChoices(models, options = {}) {
  const { allowCustom = true, currentModel } = options;
  const choices = [];

  if (models.length === 0) {
    choices.push(createSeparator(chalk.dim('No models detected')));
  } else {
    choices.push(createSeparator(chalk.dim(`${models.length} model(s) available`)));

    for (const model of models) {
      const choice = formatModelChoice(model);
      if (currentModel === model) {
        choice.name = `${chalk.green('*')} ${choice.name}`;
      }
      choices.push(choice);
    }
  }

  if (allowCustom) {
    choices.push(createSeparator(''));
    choices.push(formatModelChoice(null, true));
  }

  return choices;
}

/**
 * Prompts for custom model name
 *
 * @param {Object} [options] - Options
 * @param {string} [options.defaultValue] - Default value
 * @returns {Promise<string>} Custom model name
 */
export async function promptCustomModel(options = {}) {
  const { defaultValue } = options;

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'model',
      message: 'Enter model name:',
      default: defaultValue,
      validate: (input) => {
        if (!input || !input.trim()) {
          return 'Model name is required';
        }
        if (!/^[\w\-.:\/]+$/.test(input.trim())) {
          return 'Invalid model name format';
        }
        return true;
      }
    }
  ]);

  return answer.model.trim();
}

/**
 * Shows the model selection UI
 *
 * @param {Object} options - Options
 * @param {string[]} options.models - Available models
 * @param {string} [options.providerName='Provider'] - Provider name for display
 * @param {string} [options.currentModel] - Currently configured model
 * @param {boolean} [options.allowCustom=true] - Allow custom model entry
 * @returns {Promise<string>} Selected model name
 */
export async function showModelSelector(options) {
  const {
    models = [],
    providerName = 'Provider',
    currentModel,
    allowCustom = true
  } = options;

  console.log('');
  console.log(chalk.bold(`Select Model for ${providerName}:`));

  if (currentModel) {
    console.log(chalk.dim(`(Currently configured: ${currentModel})`));
  }

  console.log('');

  // If only default model, show simplified prompt
  if (models.length === 1 && models[0] === 'default') {
    const useDefault = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDefault',
        message: `Use the default model loaded in ${providerName}?`,
        default: true
      }
    ]);

    if (useDefault.useDefault) {
      return 'default';
    }

    return promptCustomModel();
  }

  // Build choices
  const choices = buildModelChoices(models, { allowCustom, currentModel });

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: 'Choose a model:',
      choices,
      pageSize: 15,
      loop: false
    }
  ]);

  // Handle custom selection
  if (answer.model === '__custom__') {
    return promptCustomModel({ defaultValue: currentModel });
  }

  return answer.model;
}

/**
 * Shows quick model input without selection
 *
 * @param {Object} [options] - Options
 * @param {string} [options.providerName='Provider'] - Provider name
 * @param {string} [options.defaultModel] - Default value
 * @returns {Promise<string>} Model name
 */
export async function showModelInput(options = {}) {
  const { providerName = 'Provider', defaultModel } = options;

  console.log('');
  console.log(chalk.bold(`Configure Model for ${providerName}:`));
  console.log('');

  return promptCustomModel({ defaultValue: defaultModel });
}

/**
 * Categorizes models by type
 *
 * @param {string[]} models - Model names
 * @returns {Object} Categorized models
 */
export function categorizeModels(models) {
  const categories = {
    code: [],
    general: [],
    multilingual: [],
    other: []
  };

  for (const model of models) {
    const lower = model.toLowerCase();

    if (lower.includes('code') || lower.includes('starcoder') || lower.includes('deepseek-coder')) {
      categories.code.push(model);
    } else if (lower.includes('qwen') || lower.includes('yi') || lower.includes('multilingual')) {
      categories.multilingual.push(model);
    } else if (
      lower.includes('llama') ||
      lower.includes('mistral') ||
      lower.includes('mixtral') ||
      lower.includes('phi') ||
      lower.includes('gemma')
    ) {
      categories.general.push(model);
    } else {
      categories.other.push(model);
    }
  }

  return categories;
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Model Selection UI - Standalone Test\n');

  const mockModels = ['llama2:7b', 'codellama:13b', 'mistral:7b', 'qwen2:7b'];

  showModelSelector({
    models: mockModels,
    providerName: 'Ollama',
    currentModel: 'mistral:7b'
  })
    .then(selected => {
      console.log('\nSelected model:', selected);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
