/**
 * Tier Selection UI Component - INST-008
 * Epic 2, Story 2 - Security Tier Configuration
 *
 * Implements interactive UI for security tier selection using inquirer.js.
 * Shows tier name, feature count, description, and handles default selection.
 *
 * @module tier-selection-ui
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

import {
  SECURITY_TIERS,
  getTierById,
  getDefaultTier,
  getTierFeatures,
  getFeatureDetails,
  compareTiers,
  getTierDisplayInfo
} from './tier-definitions.js';

/**
 * @typedef {Object} TierChoice
 * @property {string} name - Displayed name for the choice
 * @property {string} value - Tier ID value
 * @property {string} short - Short name for display after selection
 */

/**
 * Beta tier warning message
 * @type {string}
 */
const BETA_WARNING = 'Contains experimental features - use with caution!';

/**
 * Formats tier name with appropriate indicators (default, beta, feature count)
 * @param {Object} tier - Security tier object
 * @returns {string} Formatted tier display string
 */
export function formatTierChoice(tier) {
  const featureCount = tier.features.length;
  const featureLabel = featureCount === 1 ? 'feature' : 'features';

  let name = chalk.bold(tier.name);
  name += chalk.gray(` (${featureCount} ${featureLabel})`);

  if (tier.isDefault) {
    name += chalk.cyan(' [RECOMMENDED]');
  }

  if (tier.isBeta) {
    name += chalk.yellow(' [BETA]');
  }

  // Add description on new line with indentation
  name += '\n      ' + chalk.dim(tier.description);

  if (tier.isBeta) {
    name += '\n      ' + chalk.yellow.dim(BETA_WARNING);
  }

  return name;
}

/**
 * Builds inquirer choices array from security tiers
 * @returns {TierChoice[]} Array of inquirer choices
 */
export function buildTierChoices() {
  const choices = [];

  for (const tier of SECURITY_TIERS) {
    choices.push({
      name: formatTierChoice(tier),
      value: tier.id,
      short: tier.name
    });
  }

  return choices;
}

/**
 * Gets the index of the default tier for pre-selection
 * @returns {number} Index of default tier in SECURITY_TIERS array
 */
export function getDefaultTierIndex() {
  const defaultTier = getDefaultTier();
  return SECURITY_TIERS.findIndex(t => t.id === defaultTier.id);
}

/**
 * Displays the security tier selection prompt
 * @returns {Promise<string>} Selected tier ID
 */
export async function showTierSelector() {
  const choices = buildTierChoices();
  const defaultIndex = getDefaultTierIndex();

  console.log('');
  console.log(chalk.bold('Select Security Tier:'));
  console.log(chalk.dim('(Use arrow keys to navigate, enter to confirm)'));
  console.log('');

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTier',
      message: 'Choose a security configuration tier:',
      choices,
      default: defaultIndex,
      pageSize: 10,
      loop: false
    }
  ]);

  return answer.selectedTier;
}

/**
 * Displays feature confirmation screen showing what will be enabled
 * @param {string} tierId - Selected tier ID
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
export async function showFeatureConfirmation(tierId) {
  const tier = getTierById(tierId);
  if (!tier) {
    console.log(chalk.red('Invalid tier selected.'));
    return false;
  }

  console.log('');
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan.bold('  SECURITY TIER CONFIRMATION'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');

  // Tier header
  let tierHeader = chalk.bold(`  ${tier.name} Tier`);
  if (tier.isBeta) {
    tierHeader += chalk.yellow(' [BETA]');
  }
  console.log(tierHeader);
  console.log(chalk.dim(`  ${tier.description}`));
  console.log('');

  // List features
  console.log(chalk.bold('  Features to be enabled:'));
  const features = getTierFeatures(tierId);

  for (const featureCode of features) {
    const details = getFeatureDetails(featureCode);
    if (details) {
      const icon = chalk.green('+');
      console.log(`    ${icon} ${details.name}`);
      console.log(`      ${chalk.dim(details.description)}`);
    } else {
      console.log(`    ${chalk.green('+')} ${featureCode}`);
    }
  }

  console.log('');
  console.log(chalk.gray('-'.repeat(60)));
  console.log('');

  // Beta warning
  if (tier.isBeta) {
    console.log(chalk.yellow.bold('  Warning: Beta features are experimental'));
    console.log(chalk.yellow.dim('  They may have bugs or change in future versions.'));
    console.log('');
  }

  // Confirmation prompt
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Apply this security configuration?',
      default: true
    }
  ]);

  return confirmed;
}

/**
 * Displays a comparison between two security tiers
 * @param {string} currentTierId - Current tier ID
 * @param {string} newTierId - New tier ID being compared
 */
export function showTierComparison(currentTierId, newTierId) {
  const currentTier = getTierById(currentTierId);
  const newTier = getTierById(newTierId);

  if (!currentTier || !newTier) {
    console.log(chalk.red('Cannot compare invalid tiers.'));
    return;
  }

  console.log('');
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan.bold('  TIER COMPARISON'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');

  // Header row
  console.log(chalk.bold(`  Current: ${currentTier.name}`));
  console.log(chalk.bold(`  New:     ${newTier.name}`));
  console.log('');

  const currentFeatures = new Set(getTierFeatures(currentTierId));
  const newFeatures = new Set(getTierFeatures(newTierId));

  // Features being added
  const added = [...newFeatures].filter(f => !currentFeatures.has(f));
  if (added.length > 0) {
    console.log(chalk.green.bold('  Features to be ADDED:'));
    for (const feature of added) {
      const details = getFeatureDetails(feature);
      const name = details ? details.name : feature;
      console.log(`    ${chalk.green('+')} ${name}`);
    }
    console.log('');
  }

  // Features being removed
  const removed = [...currentFeatures].filter(f => !newFeatures.has(f));
  if (removed.length > 0) {
    console.log(chalk.red.bold('  Features to be REMOVED:'));
    for (const feature of removed) {
      const details = getFeatureDetails(feature);
      const name = details ? details.name : feature;
      console.log(`    ${chalk.red('-')} ${name}`);
    }
    console.log('');
  }

  // Features unchanged
  const unchanged = [...currentFeatures].filter(f => newFeatures.has(f));
  if (unchanged.length > 0) {
    console.log(chalk.gray('  Features UNCHANGED:'));
    for (const feature of unchanged) {
      const details = getFeatureDetails(feature);
      const name = details ? details.name : feature;
      console.log(`    ${chalk.gray('=')} ${name}`);
    }
    console.log('');
  }

  // Summary
  const comparison = compareTiers(currentTierId, newTierId);
  let summary;
  if (comparison < 0) {
    summary = chalk.green('Upgrading to higher security tier');
  } else if (comparison > 0) {
    summary = chalk.yellow('Downgrading to lower security tier');
  } else {
    summary = chalk.gray('No change in security tier');
  }

  console.log(chalk.gray('-'.repeat(60)));
  console.log(`  ${summary}`);
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');
}

/**
 * Displays current security configuration summary
 * @param {string} tierId - Current tier ID
 */
export function showCurrentConfig(tierId) {
  const tier = getTierById(tierId);

  if (!tier) {
    console.log(chalk.yellow('\n  No security tier configured.\n'));
    return;
  }

  const info = getTierDisplayInfo(tierId);

  console.log('');
  console.log(chalk.bold('Current Security Configuration:'));
  console.log('');

  let tierLine = `  Tier: ${chalk.cyan(info.name)}`;
  if (info.isDefault) {
    tierLine += chalk.dim(' (recommended)');
  }
  if (info.isBeta) {
    tierLine += chalk.yellow(' [BETA]');
  }
  console.log(tierLine);
  console.log(`  Features: ${chalk.cyan(info.featureCount)}`);
  console.log(`  ${chalk.dim(info.description)}`);
  console.log('');
}

/**
 * Prompts user if they want to customize features (enter advanced mode)
 * @returns {Promise<boolean>} True if user wants advanced customization
 */
export async function promptAdvancedCustomization() {
  console.log('');

  const { wantsAdvanced } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'wantsAdvanced',
      message: 'Would you like to customize individual features? (Advanced)',
      default: false
    }
  ]);

  return wantsAdvanced;
}

/**
 * Shows a summary of the tier that was selected
 * @param {string} tierId - Selected tier ID
 */
export function showSelectionSummary(tierId) {
  const tier = getTierById(tierId);

  if (!tier) {
    return;
  }

  console.log('');
  console.log(chalk.green.bold('Security tier selected: ' + tier.name));
  console.log(chalk.dim(`  ${tier.features.length} features will be enabled.`));

  if (tier.isBeta) {
    console.log(chalk.yellow('  Note: This tier includes experimental features.'));
  }

  console.log('');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Tier Selection UI - Interactive Test\n');
  console.log('='.repeat(60));

  // Run interactive test
  (async () => {
    try {
      // Test 1: Show tier selector
      console.log('\n1. Testing showTierSelector():');
      const selectedTier = await showTierSelector();
      console.log('   Selected: ' + selectedTier);

      // Test 2: Show feature confirmation
      console.log('\n2. Testing showFeatureConfirmation():');
      const confirmed = await showFeatureConfirmation(selectedTier);
      console.log('   Confirmed: ' + confirmed);

      // Test 3: Show comparison (if not essential)
      if (selectedTier !== 'essential') {
        console.log('\n3. Testing showTierComparison():');
        showTierComparison('standard', selectedTier);
      }

      // Test 4: Show current config
      console.log('\n4. Testing showCurrentConfig():');
      showCurrentConfig(selectedTier);

      // Test 5: Show selection summary
      console.log('\n5. Testing showSelectionSummary():');
      showSelectionSummary(selectedTier);

      console.log('\n' + '='.repeat(60));
      console.log('Interactive test complete.');
    } catch (error) {
      console.error('Error:', error.message);
    }
  })();
}
