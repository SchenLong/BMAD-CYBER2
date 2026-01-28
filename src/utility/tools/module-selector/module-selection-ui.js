/**
 * Module Selection UI Component - INST-002
 * Epic 1, Story 2 - Interactive Module Selection
 *
 * Implements multi-select checkbox UI for module selection during
 * BMAD installation wizard. Uses inquirer.js for interactive prompts.
 *
 * @module module-selection-ui
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * @typedef {Object} ModuleChoice
 * @property {string} name - Displayed name for the choice
 * @property {string} value - Module code value
 * @property {boolean} checked - Whether pre-selected
 * @property {boolean} [disabled] - Whether choice is disabled
 */

/**
 * @typedef {Object} SelectionSummary
 * @property {number} moduleCount - Number of selected modules
 * @property {number} agentCount - Total agents in selected modules
 * @property {number} workflowCount - Total workflows in selected modules
 * @property {number} estimatedSizeKB - Estimated total size in KB
 * @property {string} estimatedSizeMB - Estimated total size formatted as MB string
 */

/**
 * Section separator labels
 */
const SECTION_LABELS = {
  required: '=== REQUIRED (always installed) ===',
  recommended: '=== RECOMMENDED FOR YOUR ROLE ===',
  optional: '=== OPTIONAL ==='
};

/**
 * Creates a separator object compatible with inquirer's checkbox
 * @param {string} text - Separator text
 * @returns {Object} Separator-like object
 */
function createSeparator(text) {
  return new inquirer.Separator(text);
}

/**
 * Builds inquirer choices array from modules with section grouping
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - Array of module metadata
 * @param {string} [userRole='admin'] - User's selected role for recommendations
 * @returns {Array} Array of inquirer choices with separators
 */
export function buildModuleChoices(modules, userRole = 'admin') {
  const choices = [];

  // Separate modules into categories
  const requiredModules = modules.filter(m => m.required);
  const recommendedModules = modules.filter(m => !m.required && m.recommended);
  const optionalModules = modules.filter(m => !m.required && !m.recommended);

  // Add REQUIRED section
  if (requiredModules.length > 0) {
    choices.push(createSeparator(chalk.cyan.bold(SECTION_LABELS.required)));
    for (const mod of requiredModules) {
      choices.push(formatModuleChoice(mod, true, true)); // checked=true, disabled=true
    }
  }

  // Add RECOMMENDED section
  if (recommendedModules.length > 0) {
    choices.push(createSeparator('')); // Empty line separator
    choices.push(createSeparator(chalk.yellow.bold(SECTION_LABELS.recommended)));
    for (const mod of recommendedModules) {
      choices.push(formatModuleChoice(mod, mod.defaultSelected || mod.recommended, false));
    }
  }

  // Add OPTIONAL section
  if (optionalModules.length > 0) {
    choices.push(createSeparator('')); // Empty line separator
    choices.push(createSeparator(chalk.gray(SECTION_LABELS.optional)));
    for (const mod of optionalModules) {
      choices.push(formatModuleChoice(mod, mod.defaultSelected, false));
    }
  }

  return choices;
}

/**
 * Formats a single module as an inquirer choice
 * @param {import('./module-loader.js').ModuleMetadata} module - Module metadata
 * @param {boolean} checked - Whether to pre-select
 * @param {boolean} disabled - Whether to disable (for required modules)
 * @returns {ModuleChoice} Formatted choice object
 */
function formatModuleChoice(module, checked, disabled) {
  const agentInfo = chalk.gray(`(${module.agentCount} agents)`);
  const description = module.description
    ? chalk.dim(` - ${truncateDescription(module.description, 50)}`)
    : '';

  const name = `${module.name} ${agentInfo}${description}`;

  const choice = {
    name,
    value: module.code,
    checked,
    short: module.name // Short name for display after selection
  };

  if (disabled) {
    choice.disabled = chalk.dim('Required');
  }

  return choice;
}

/**
 * Truncates a description string to max length with ellipsis
 * @param {string} description - Full description text
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated description
 */
function truncateDescription(description, maxLength) {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + '...';
}

/**
 * Displays the module selection checkbox prompt
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - Array of module metadata
 * @param {string} [userRole='admin'] - User's selected role
 * @returns {Promise<string[]>} Array of selected module codes
 */
export async function showModuleSelector(modules, userRole = 'admin') {
  // Build choices with section grouping
  const choices = buildModuleChoices(modules, userRole);

  // Show the multi-select prompt
  console.log(''); // Empty line before prompt
  console.log(chalk.bold('Select modules to install:'));
  console.log(chalk.dim('(Use arrow keys to navigate, space to toggle, enter to confirm)'));
  console.log('');

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedModules',
      message: 'Select modules:',
      choices,
      pageSize: 15,
      loop: false,
      validate: (selected) => {
        // Ensure at least core is selected (it's disabled, so this is a safety check)
        if (!selected.includes('core')) {
          // Core might not be in the selected array since it's disabled
          // This is expected behavior - we'll add it back
          return true;
        }
        return true;
      }
    }
  ]);

  // Get selected modules
  let selectedCodes = answers.selectedModules || [];

  // Always include required modules (they're disabled in UI but need to be in result)
  const requiredCodes = modules.filter(m => m.required).map(m => m.code);
  for (const code of requiredCodes) {
    if (!selectedCodes.includes(code)) {
      selectedCodes.push(code);
    }
  }

  // Handle empty selection (only required modules)
  if (selectedCodes.length === requiredCodes.length) {
    const continueWithMinimal = await handleEmptySelection();
    if (!continueWithMinimal) {
      // Recursive call to re-show selector
      return showModuleSelector(modules, userRole);
    }
  }

  // Calculate and display summary
  const summary = calculateSelectionSummary(selectedCodes, modules);
  displaySelectionSummary(summary, selectedCodes, modules);

  return selectedCodes;
}

/**
 * Handles the case when user selects no optional modules
 * @returns {Promise<boolean>} True if user wants to continue with minimal selection
 */
async function handleEmptySelection() {
  console.log('');
  console.log(chalk.yellow('Warning: You have not selected any optional modules.'));
  console.log(chalk.dim('   Only the core framework will be installed.'));
  console.log('');

  const { continueMinimal } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continueMinimal',
      message: 'Continue with minimal installation?',
      default: false
    }
  ]);

  return continueMinimal;
}

/**
 * Calculates selection summary statistics
 * @param {string[]} selectedCodes - Array of selected module codes
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - All available modules
 * @returns {SelectionSummary} Selection summary object
 */
export function calculateSelectionSummary(selectedCodes, modules) {
  const selectedModules = modules.filter(m => selectedCodes.includes(m.code));

  const moduleCount = selectedModules.length;
  const agentCount = selectedModules.reduce((sum, m) => sum + m.agentCount, 0);
  const workflowCount = selectedModules.reduce((sum, m) => sum + m.workflowCount, 0);
  const estimatedSizeKB = selectedModules.reduce((sum, m) => sum + m.estimatedSizeKB, 0);

  return {
    moduleCount,
    agentCount,
    workflowCount,
    estimatedSizeKB,
    estimatedSizeMB: (estimatedSizeKB / 1024).toFixed(2)
  };
}

/**
 * Displays the selection summary to the user
 * @param {SelectionSummary} summary - Calculated summary
 * @param {string[]} selectedCodes - Selected module codes
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - All modules
 */
function displaySelectionSummary(summary, selectedCodes, modules) {
  console.log('');
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan.bold('  SELECTION SUMMARY'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');

  // List selected modules
  console.log(chalk.bold('  Selected Modules:'));
  for (const code of selectedCodes) {
    const mod = modules.find(m => m.code === code);
    if (mod) {
      const icon = mod.required ? chalk.cyan('*') : chalk.green('+');
      console.log(`    ${icon} ${mod.name}`);
    }
  }

  console.log('');
  console.log(chalk.gray('-'.repeat(60)));
  console.log('');

  // Show totals with colored formatting
  console.log(`  ${chalk.bold('Modules:')}     ${chalk.green(summary.moduleCount)}`);
  console.log(`  ${chalk.bold('Agents:')}      ${chalk.green(summary.agentCount)}`);
  console.log(`  ${chalk.bold('Workflows:')}   ${chalk.green(summary.workflowCount)}`);
  console.log(`  ${chalk.bold('Est. Size:')}   ${chalk.green('~' + summary.estimatedSizeMB + ' MB')}`);

  console.log('');
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');
}

/**
 * Gets display name for a module by code
 * @param {string} code - Module code
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - All modules
 * @returns {string} Module display name or code if not found
 */
export function getModuleDisplayName(code, modules) {
  const mod = modules.find(m => m.code === code);
  return mod ? mod.name : code;
}

/**
 * Validates that required modules are included in selection
 * @param {string[]} selectedCodes - Selected module codes
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - All modules
 * @returns {{ valid: boolean, missing: string[] }} Validation result
 */
export function validateSelection(selectedCodes, modules) {
  const requiredCodes = modules.filter(m => m.required).map(m => m.code);
  const missing = requiredCodes.filter(code => !selectedCodes.includes(code));

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Applies role-based recommendations to modules (mutates module objects)
 * @param {import('./module-loader.js').ModuleMetadata[]} modules - Array of modules
 * @param {string[]} recommendedCodes - Codes of recommended modules
 */
export function applyRecommendations(modules, recommendedCodes) {
  for (const mod of modules) {
    mod.recommended = recommendedCodes.includes(mod.code);
  }
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Test the UI with mock data
  const mockModules = [
    {
      code: 'core',
      name: 'Core Framework',
      description: 'Essential BMAD framework components',
      required: true,
      defaultSelected: true,
      agentCount: 2,
      workflowCount: 8,
      estimatedSizeKB: 48
    },
    {
      code: 'cybersec-team',
      name: 'Cybersecurity Operations',
      description: 'Security architects and penetration testing specialists',
      required: false,
      defaultSelected: false,
      recommended: true,
      agentCount: 15,
      workflowCount: 18,
      estimatedSizeKB: 101
    },
    {
      code: 'intel-team',
      name: 'Intelligence Operations',
      description: 'OSINT and threat intelligence gathering',
      required: false,
      defaultSelected: false,
      recommended: true,
      agentCount: 11,
      workflowCount: 12,
      estimatedSizeKB: 93
    },
    {
      code: 'bmm',
      name: 'Product Development',
      description: 'Agile workflows and product management',
      required: false,
      defaultSelected: false,
      agentCount: 9,
      workflowCount: 32,
      estimatedSizeKB: 109
    }
  ];

  console.log('Module Selection UI - Test Mode\n');
  console.log('='.repeat(50));

  showModuleSelector(mockModules, 'admin')
    .then(selected => {
      console.log('\nFinal selection:', selected);
    })
    .catch(err => {
      console.error('Error:', err.message);
    });
}
