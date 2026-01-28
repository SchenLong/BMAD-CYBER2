/**
 * Module Configuration Prompts - INST-005
 * Epic 1, Story 5 - Per-Module Configuration Prompts
 *
 * Handles interactive configuration prompts for modules during the BMAD
 * installation wizard. Extracts interactive fields from module.yaml and
 * prompts users for configuration values.
 *
 * @module module-config-prompt
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} InteractiveFieldConfig
 * @property {string} prompt - The prompt message to display to the user
 * @property {string} default - Default value for the field (may contain placeholders)
 * @property {string} result - Result template with placeholders for expansion
 */

/**
 * @typedef {Object} ConfigContext
 * @property {string} projectRoot - The project root directory path
 * @property {string} [value] - The user-provided input value (used during expansion)
 * @property {Object.<string, string>} [configuredFields] - Previously configured field values
 */

/**
 * @typedef {Object} ModuleConfigResult
 * @property {string} fieldName - The expanded result value for each configured field
 */

/**
 * Extracts fields that have a 'prompt' property from parsed module.yaml content.
 * These fields are considered interactive and require user input during installation.
 *
 * @param {Object} moduleYaml - Parsed module.yaml content as a JavaScript object
 * @returns {Object.<string, InteractiveFieldConfig>} Map of field names to their configuration
 *
 * @example
 * const yaml = {
 *   code: 'intel-team',
 *   output_folder: {
 *     prompt: 'Where should outputs be saved?',
 *     default: '_bmad-output/intel-team',
 *     result: '{project-root}/{value}'
 *   },
 *   module_version: {
 *     result: '1.0.0'
 *   }
 * };
 * const fields = extractInteractiveFields(yaml);
 * // Returns: { output_folder: { prompt: '...', default: '...', result: '...' } }
 */
export function extractInteractiveFields(moduleYaml) {
  const interactiveFields = {};

  if (!moduleYaml || typeof moduleYaml !== 'object') {
    return interactiveFields;
  }

  for (const [key, value] of Object.entries(moduleYaml)) {
    // Skip non-object values and null
    if (typeof value !== 'object' || value === null) {
      continue;
    }

    // Check if this field has a prompt property (making it interactive)
    if (value.prompt && typeof value.prompt === 'string') {
      interactiveFields[key] = {
        prompt: value.prompt,
        default: value.default !== undefined ? String(value.default) : '',
        result: value.result !== undefined ? String(value.result) : '{value}'
      };
    }
  }

  return interactiveFields;
}

/**
 * Replaces placeholders in a string with values from the context object.
 *
 * Supported placeholders:
 * - {project-root} - Replaced with context.projectRoot
 * - {value} - Replaced with context.value (the user's input)
 * - {field_name} - Replaced with context.configuredFields[field_name]
 *
 * Handles nested placeholders by expanding outer placeholders first,
 * then processing inner placeholders in the result.
 *
 * @param {string} value - The string containing placeholders to expand
 * @param {ConfigContext} context - Context object with replacement values
 * @returns {string} The string with all placeholders replaced
 *
 * @example
 * const result = expandPlaceholders('{project-root}/{value}', {
 *   projectRoot: '/home/user/project',
 *   value: '_bmad-output/intel-team'
 * });
 * // Returns: '/home/user/project/_bmad-output/intel-team'
 *
 * @example
 * // Nested placeholders - {output_folder} contains project-root reference
 * const result = expandPlaceholders('{output_folder}/reports', {
 *   projectRoot: '/home/user',
 *   configuredFields: { output_folder: '/home/user/_bmad-output' }
 * });
 * // Returns: '/home/user/_bmad-output/reports'
 */
export function expandPlaceholders(value, context) {
  if (!value || typeof value !== 'string') {
    return value || '';
  }

  if (!context || typeof context !== 'object') {
    return value;
  }

  let result = value;
  const maxIterations = 10; // Prevent infinite loops with circular references
  let iterations = 0;
  let previousResult = '';

  // Keep expanding until no more changes or max iterations reached
  while (result !== previousResult && iterations < maxIterations) {
    previousResult = result;
    iterations++;

    // Replace {project-root} placeholder
    if (context.projectRoot !== undefined) {
      result = result.replace(/\{project-root\}/g, context.projectRoot);
    }

    // Replace {value} placeholder (the user's input)
    if (context.value !== undefined) {
      result = result.replace(/\{value\}/g, context.value);
    }

    // Replace field reference placeholders like {output_folder}, {data_path}, etc.
    if (context.configuredFields && typeof context.configuredFields === 'object') {
      for (const [fieldName, fieldValue] of Object.entries(context.configuredFields)) {
        const placeholder = new RegExp(`\\{${fieldName}\\}`, 'g');
        result = result.replace(placeholder, fieldValue);
      }
    }
  }

  return result;
}

/**
 * Determines the inquirer prompt type based on field configuration.
 * Currently supports 'input' (text), with extensibility for future types
 * like 'list' (selection) or 'confirm' (boolean).
 *
 * @param {InteractiveFieldConfig} fieldConfig - The field configuration object
 * @returns {string} The inquirer prompt type: 'input', 'list', or 'confirm'
 *
 * @example
 * getFieldType({ prompt: 'Enter path', default: '/path' }); // Returns: 'input'
 *
 * @example
 * // Future support for selection lists
 * getFieldType({ prompt: 'Choose option', choices: ['a', 'b'] }); // Returns: 'list'
 */
export function getFieldType(fieldConfig) {
  if (!fieldConfig || typeof fieldConfig !== 'object') {
    return 'input';
  }

  // Check for list/selection type (future support)
  if (Array.isArray(fieldConfig.choices) && fieldConfig.choices.length > 0) {
    return 'list';
  }

  // Check for boolean/confirm type (future support)
  if (fieldConfig.type === 'boolean' || fieldConfig.type === 'confirm') {
    return 'confirm';
  }

  // Default to text input
  return 'input';
}

/**
 * Prompts the user for configuration values for a single module.
 * Displays the module name header and iterates through all interactive fields,
 * collecting user input and expanding result templates.
 *
 * @param {Object} module - Module metadata object (from module-loader.js)
 * @param {string} module.name - Human-readable module name
 * @param {string} module.code - Module identifier code
 * @param {Object} module.interactiveFields - Map of interactive field configurations
 * @param {ConfigContext} context - Context object with projectRoot and configuredFields
 * @returns {Promise<ModuleConfigResult>} Object mapping field names to their expanded result values
 *
 * @example
 * const module = {
 *   name: 'Intelligence Operations Team',
 *   code: 'intel-team',
 *   interactiveFields: {
 *     output_folder: {
 *       prompt: 'Where should outputs be saved?',
 *       default: '_bmad-output/intel-team',
 *       result: '{project-root}/{value}'
 *     }
 *   }
 * };
 * const context = { projectRoot: '/home/user/project', configuredFields: {} };
 * const config = await promptForModuleConfig(module, context);
 * // User enters '_bmad-output/intel-team'
 * // Returns: { output_folder: '/home/user/project/_bmad-output/intel-team' }
 */
export async function promptForModuleConfig(module, context) {
  const config = {};

  // Validate module input
  if (!module || typeof module !== 'object') {
    console.warn(chalk.yellow('Warning: Invalid module provided to promptForModuleConfig'));
    return config;
  }

  const moduleName = module.name || module.code || 'Unknown Module';
  const interactiveFields = module.interactiveFields || {};

  // Check if there are any interactive fields
  const fieldEntries = Object.entries(interactiveFields);
  if (fieldEntries.length === 0) {
    // No interactive fields to configure
    return config;
  }

  // Display module configuration header
  console.log('');
  console.log(chalk.bold.cyan(`Configuring: ${moduleName}`));
  console.log(chalk.dim('-'.repeat(40)));

  // Create a working context that accumulates configured fields
  const workingContext = {
    projectRoot: context?.projectRoot || process.cwd(),
    configuredFields: { ...context?.configuredFields } || {}
  };

  // Iterate through interactive fields and prompt user
  for (const [fieldName, fieldConfig] of fieldEntries) {
    // Expand default value with current context
    const expandedDefault = expandPlaceholders(fieldConfig.default, workingContext);

    // Determine prompt type
    const promptType = getFieldType(fieldConfig);

    // Build inquirer prompt configuration
    const promptConfig = {
      type: promptType,
      name: 'answer',
      message: fieldConfig.prompt,
      default: expandedDefault
    };

    // Add choices for list type (future support)
    if (promptType === 'list' && Array.isArray(fieldConfig.choices)) {
      promptConfig.choices = fieldConfig.choices;
    }

    // Prompt the user
    const { answer } = await inquirer.prompt([promptConfig]);

    // Create context with user's value for result expansion
    const resultContext = {
      ...workingContext,
      value: answer
    };

    // Expand the result template with user's input
    const expandedResult = expandPlaceholders(fieldConfig.result, resultContext);

    // Store the expanded result
    config[fieldName] = expandedResult;

    // Update working context with this field's value for subsequent field expansions
    workingContext.configuredFields[fieldName] = expandedResult;
  }

  // Display completion message
  console.log(chalk.dim('-'.repeat(40)));
  console.log(chalk.green(`  ${moduleName} configuration complete`));

  return config;
}

/**
 * Validates that a field configuration object has all required properties.
 *
 * @param {InteractiveFieldConfig} fieldConfig - Field configuration to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result with error messages
 *
 * @example
 * validateFieldConfig({ prompt: 'Enter path' });
 * // Returns: { valid: true, errors: [] }
 *
 * @example
 * validateFieldConfig({ default: '/path' });
 * // Returns: { valid: false, errors: ['Missing required property: prompt'] }
 */
export function validateFieldConfig(fieldConfig) {
  const errors = [];

  if (!fieldConfig || typeof fieldConfig !== 'object') {
    return { valid: false, errors: ['Field configuration must be an object'] };
  }

  if (!fieldConfig.prompt || typeof fieldConfig.prompt !== 'string') {
    errors.push('Missing required property: prompt');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets a preview of what the expanded result will look like for a field.
 * Useful for debugging or displaying to users before they confirm.
 *
 * @param {InteractiveFieldConfig} fieldConfig - Field configuration
 * @param {string} userValue - The user's input value
 * @param {ConfigContext} context - Expansion context
 * @returns {string} Preview of the expanded result
 */
export function getResultPreview(fieldConfig, userValue, context) {
  if (!fieldConfig || !fieldConfig.result) {
    return userValue;
  }

  const previewContext = {
    ...context,
    value: userValue
  };

  return expandPlaceholders(fieldConfig.result, previewContext);
}

// ESM Entry point detection for self-test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('BMAD Module Config Prompt - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: extractInteractiveFields
  console.log('\n1. extractInteractiveFields() Test:');
  const mockYaml = {
    code: 'intel-team',
    name: 'Intelligence Operations Team',
    output_folder: {
      prompt: 'Where should intel-team save intelligence reports?',
      default: '_bmad-output/intel-team',
      result: '{project-root}/{value}'
    },
    module_version: {
      result: '1.1.0'
    },
    agents_path: {
      result: '{project-root}/_bmad/intel-team/agents'
    },
    reports: {
      result: '{output_folder}/reports'
    }
  };

  const interactiveFields = extractInteractiveFields(mockYaml);
  console.log('   Input fields:', Object.keys(mockYaml).length);
  console.log('   Interactive fields found:', Object.keys(interactiveFields).length);
  console.log('   Field names:', Object.keys(interactiveFields).join(', ') || 'none');

  // Test 2: expandPlaceholders
  console.log('\n2. expandPlaceholders() Test:');

  const testCases = [
    {
      input: '{project-root}/{value}',
      context: { projectRoot: '/home/user', value: '_output' },
      expected: '/home/user/_output'
    },
    {
      input: '{output_folder}/reports',
      context: {
        projectRoot: '/home/user',
        configuredFields: { output_folder: '/home/user/_output' }
      },
      expected: '/home/user/_output/reports'
    },
    {
      input: 'no placeholders',
      context: { projectRoot: '/home' },
      expected: 'no placeholders'
    }
  ];

  for (const tc of testCases) {
    const result = expandPlaceholders(tc.input, tc.context);
    const status = result === tc.expected ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(`   ${status}: "${tc.input}" -> "${result}"`);
    if (result !== tc.expected) {
      console.log(`      Expected: "${tc.expected}"`);
    }
  }

  // Test 3: getFieldType
  console.log('\n3. getFieldType() Test:');
  const typeTests = [
    { config: { prompt: 'Enter path' }, expected: 'input' },
    { config: { prompt: 'Choose', choices: ['a', 'b'] }, expected: 'list' },
    { config: { prompt: 'Enable?', type: 'confirm' }, expected: 'confirm' },
    { config: null, expected: 'input' }
  ];

  for (const tt of typeTests) {
    const result = getFieldType(tt.config);
    const status = result === tt.expected ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(`   ${status}: ${JSON.stringify(tt.config)} -> "${result}"`);
  }

  // Test 4: validateFieldConfig
  console.log('\n4. validateFieldConfig() Test:');
  const validConfig = { prompt: 'Enter path', default: '/path', result: '{value}' };
  const invalidConfig = { default: '/path' };

  const validResult = validateFieldConfig(validConfig);
  const invalidResult = validateFieldConfig(invalidConfig);

  console.log(`   Valid config: ${validResult.valid ? chalk.green('PASS') : chalk.red('FAIL')}`);
  console.log(`   Invalid config detected: ${!invalidResult.valid ? chalk.green('PASS') : chalk.red('FAIL')}`);
  console.log(`   Errors: ${invalidResult.errors.join(', ')}`);

  // Test 5: getResultPreview
  console.log('\n5. getResultPreview() Test:');
  const previewConfig = { prompt: 'Path?', default: '_output', result: '{project-root}/{value}' };
  const preview = getResultPreview(previewConfig, 'my-output', { projectRoot: '/home/user' });
  console.log(`   Preview: ${preview}`);
  const previewPass = preview === '/home/user/my-output';
  console.log(`   Result: ${previewPass ? chalk.green('PASS') : chalk.red('FAIL')}`);

  // Test 6: Interactive demo (optional)
  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete.');
  console.log('\nTo test interactive prompts, run with --interactive flag:');
  console.log('  node module-config-prompt.js --interactive\n');

  if (process.argv.includes('--interactive')) {
    console.log('\n' + '='.repeat(60));
    console.log('Interactive Demo\n');

    const mockModule = {
      name: 'Intelligence Operations Team',
      code: 'intel-team',
      interactiveFields: {
        output_folder: {
          prompt: 'Where should intel-team save intelligence reports?',
          default: '_bmad-output/intel-team',
          result: '{project-root}/{value}'
        }
      }
    };

    const context = {
      projectRoot: process.cwd(),
      configuredFields: {}
    };

    promptForModuleConfig(mockModule, context)
      .then(config => {
        console.log('\n' + '='.repeat(60));
        console.log('Configuration Result:');
        console.log(JSON.stringify(config, null, 2));
      })
      .catch(err => {
        console.error('Error:', err.message);
      });
  }
}
