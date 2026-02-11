/**
 * Advanced Security Override - INST-010
 * Epic 2, Story 4 - Security Tier Configuration
 *
 * Provides granular control over security features with multi-select
 * checkboxes grouped by tier level.
 *
 * @module security-config/advanced-override
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import chalk from 'chalk';

import { select, multiselect, confirm } from '../../cli/prompts.js';

import {
  SECURITY_TIERS,
  FEATURE_DETAILS,
  getTierById,
  getTierFeatures,
  getFeaturesByTier,
  getMinimumTierForFeature,
  compareTiers
} from './tier-definitions.js';

/**
 * Essential features that should not be removed
 */
export const ESSENTIAL_FEATURES = ['auth'];

/**
 * Formats a feature choice for the checkbox prompt
 *
 * @param {string} featureCode - Feature code
 * @param {Object} detail - Feature details
 * @param {boolean} isEnabled - Whether currently enabled
 * @returns {Object} Inquirer checkbox choice
 */
function formatFeatureChoice(featureCode, detail, isEnabled) {
  let name = detail.name;

  // Add category tag
  name += chalk.gray(` [${detail.category}]`);

  // Add description on new line
  name += '\n        ' + chalk.dim(detail.description);

  return {
    name,
    value: featureCode,
    short: detail.name,
    checked: isEnabled
  };
}

/**
 * Creates a separator for inquirer choices
 *
 * @param {string} text - Separator text
 * @returns {Object} Inquirer separator
 */
function createSeparator(text) {
  return { type: 'separator', name: text };
}

/**
 * Builds feature choices grouped by tier
 *
 * @param {string[]} enabledFeatures - Currently enabled features
 * @returns {Array} Array of inquirer choices with separators
 */
export function buildFeatureChoices(enabledFeatures) {
  const choices = [];
  const featuresByTier = getFeaturesByTier();
  const tierOrder = ['essential', 'standard', 'advanced', 'enterprise', 'beta'];

  for (const tierId of tierOrder) {
    const tierFeatures = featuresByTier[tierId] || [];
    if (tierFeatures.length === 0) continue;

    const tier = getTierById(tierId);
    const tierLabel = tier.isBeta
      ? chalk.yellow.bold(`\n  ${tier.name.toUpperCase()} FEATURES [BETA]`)
      : chalk.cyan.bold(`\n  ${tier.name.toUpperCase()} FEATURES`);

    choices.push(createSeparator(tierLabel));

    for (const featureCode of tierFeatures) {
      const detail = FEATURE_DETAILS[featureCode];
      if (!detail) continue;

      const isEnabled = enabledFeatures.includes(featureCode);
      const choice = formatFeatureChoice(featureCode, detail, isEnabled);

      // Mark essential features
      if (ESSENTIAL_FEATURES.includes(featureCode)) {
        choice.disabled = 'Required';
        choice.checked = true;
      }

      choices.push(choice);
    }
  }

  return choices;
}

/**
 * Shows the advanced feature configuration UI
 *
 * @param {Object} options - Options
 * @param {string} [options.baseTier='standard'] - Base tier for defaults
 * @param {string[]} [options.currentFeatures] - Currently enabled features
 * @returns {Promise<string[]>} Selected feature codes
 */
export async function showAdvancedConfig(options = {}) {
  const {
    baseTier = 'standard',
    currentFeatures
  } = options;

  // Determine which features to show as enabled
  const enabledFeatures = currentFeatures || getTierFeatures(baseTier);

  console.log('');
  console.log(chalk.bold('Advanced Security Configuration'));
  console.log(chalk.dim('Select individual features to enable/disable'));
  console.log(chalk.dim('Essential features cannot be disabled'));
  console.log('');

  const choices = buildFeatureChoices(enabledFeatures);

  const features = await multiselect({
    message: 'Select security features:',
    choices
  });

  return features;
}

/**
 * Validates a feature selection and shows warnings
 *
 * @param {string[]} selectedFeatures - Selected feature codes
 * @param {string} baseTier - Original tier for comparison
 * @returns {Object} Validation result with warnings
 */
export function validateFeatureSelection(selectedFeatures, baseTier) {
  const warnings = [];
  const errors = [];

  // Check essential features
  for (const essential of ESSENTIAL_FEATURES) {
    if (!selectedFeatures.includes(essential)) {
      errors.push(`Missing required feature: ${essential}`);
    }
  }

  // Check for removed features from higher tiers
  const baseFeatures = getTierFeatures(baseTier);
  const removed = baseFeatures.filter(f => !selectedFeatures.includes(f));

  if (removed.length > 0) {
    warnings.push(`Removing ${removed.length} feature(s) from ${baseTier} tier`);
  }

  // Check for added features from higher tiers
  const allFeatures = new Set(baseFeatures);
  const added = selectedFeatures.filter(f => !allFeatures.has(f));

  if (added.length > 0) {
    // Check which tier these features come from
    for (const feature of added) {
      const minTier = getMinimumTierForFeature(feature);
      if (minTier && compareTiers(baseTier, minTier) < 0) {
        warnings.push(`Adding ${feature} from ${minTier} tier`);
      }
    }
  }

  // Check for beta features
  const betaFeatures = selectedFeatures.filter(f => {
    const detail = FEATURE_DETAILS[f];
    return detail && detail.tier === 'beta';
  });

  if (betaFeatures.length > 0) {
    warnings.push(`Including ${betaFeatures.length} beta feature(s)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    selectedFeatures,
    addedFromBase: added,
    removedFromBase: removed
  };
}

/**
 * Shows a confirmation dialog for the feature selection
 *
 * @param {Object} validation - Validation result
 * @returns {Promise<boolean>} True if user confirms
 */
export async function confirmFeatureSelection(validation) {
  console.log('');
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan.bold('  FEATURE SELECTION SUMMARY'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log('');

  console.log(`  Total features: ${chalk.bold(validation.selectedFeatures.length)}`);
  console.log('');

  // Show warnings
  if (validation.warnings.length > 0) {
    console.log(chalk.yellow.bold('  Warnings:'));
    for (const warning of validation.warnings) {
      console.log(chalk.yellow(`    ! ${warning}`));
    }
    console.log('');
  }

  // Show errors
  if (validation.errors.length > 0) {
    console.log(chalk.red.bold('  Errors:'));
    for (const error of validation.errors) {
      console.log(chalk.red(`    ✗ ${error}`));
    }
    console.log('');
    return false;
  }

  // Show changes summary
  if (validation.removedFromBase.length > 0) {
    console.log(chalk.red('  Features being REMOVED:'));
    for (const feature of validation.removedFromBase) {
      const detail = FEATURE_DETAILS[feature];
      const name = detail ? detail.name : feature;
      console.log(`    ${chalk.red('-')} ${name}`);
    }
    console.log('');
  }

  if (validation.addedFromBase.length > 0) {
    console.log(chalk.green('  Features being ADDED:'));
    for (const feature of validation.addedFromBase) {
      const detail = FEATURE_DETAILS[feature];
      const name = detail ? detail.name : feature;
      console.log(`    ${chalk.green('+')} ${name}`);
    }
    console.log('');
  }

  console.log(chalk.gray('-'.repeat(60)));
  console.log('');

  const confirmed = await confirm({
    message: 'Apply this custom configuration?',
    initialValue: validation.warnings.length === 0
  });

  return confirmed;
}

/**
 * Prompts user to select a base tier before customization
 *
 * @returns {Promise<string>} Selected base tier ID
 */
export async function selectBaseTier() {
  const choices = SECURITY_TIERS.map(tier => {
    let name = tier.name;
    if (tier.isDefault) {
      name += chalk.cyan(' (Recommended)');
    }
    if (tier.isBeta) {
      name += chalk.yellow(' [BETA]');
    }
    name += chalk.gray(` - ${tier.features.length} features`);

    return {
      name,
      value: tier.id,
      short: tier.name
    };
  });

  const baseTier = await select({
    message: 'Select a base tier to customize:',
    choices,
    initialValue: 'standard'
  });

  return baseTier;
}

/**
 * Gets feature summary for display
 *
 * @param {string[]} features - Feature codes
 * @returns {Object} Summary with counts by tier
 */
export function getFeatureSummary(features) {
  const summary = {
    total: features.length,
    byTier: {},
    byCategory: {},
    hasBeta: false
  };

  for (const feature of features) {
    const detail = FEATURE_DETAILS[feature];
    if (!detail) continue;

    // Count by tier
    summary.byTier[detail.tier] = (summary.byTier[detail.tier] || 0) + 1;

    // Count by category
    summary.byCategory[detail.category] = (summary.byCategory[detail.category] || 0) + 1;

    // Check for beta
    if (detail.tier === 'beta') {
      summary.hasBeta = true;
    }
  }

  return summary;
}

/**
 * Determines the effective tier based on selected features
 *
 * @param {string[]} selectedFeatures - Selected feature codes
 * @returns {string} Effective tier ID or 'custom'
 */
export function determineEffectiveTier(selectedFeatures) {
  const selectedSet = new Set(selectedFeatures);

  // Check each tier from highest to lowest
  for (const tier of [...SECURITY_TIERS].reverse()) {
    const tierFeatures = new Set(getTierFeatures(tier.id));

    // Check if selected features exactly match tier features
    if (selectedSet.size === tierFeatures.size) {
      let matches = true;
      for (const f of tierFeatures) {
        if (!selectedSet.has(f)) {
          matches = false;
          break;
        }
      }
      if (matches) return tier.id;
    }
  }

  return 'custom';
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Advanced Security Override - Interactive Test\n');
  console.log('='.repeat(60));

  (async () => {
    try {
      // Select base tier
      const baseTier = await selectBaseTier();
      console.log(`\nSelected base tier: ${baseTier}`);

      // Show advanced config
      const selectedFeatures = await showAdvancedConfig({ baseTier });
      console.log(`\nSelected ${selectedFeatures.length} features`);

      // Validate
      const validation = validateFeatureSelection(selectedFeatures, baseTier);

      // Confirm
      const confirmed = await confirmFeatureSelection(validation);
      console.log(`\nConfirmed: ${confirmed}`);

      // Show effective tier
      const effectiveTier = determineEffectiveTier(selectedFeatures);
      console.log(`Effective tier: ${effectiveTier}`);

    } catch (error) {
      console.error('Error:', error.message);
    }
  })();
}
