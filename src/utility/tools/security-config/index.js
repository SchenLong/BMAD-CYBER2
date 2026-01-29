#!/usr/bin/env node

/**
 * Security Configuration Entry Point - INST-011
 * Epic 2, Story 5 - Security Tier Configuration
 *
 * This is the main entry point for the BMAD security configuration wizard.
 * It can be run standalone via `npm run security:config` or programmatically
 * imported by other components.
 *
 * Usage:
 *   npm run security:config           - Interactive security configuration
 *   npm run security:config --show    - Show current configuration only
 *   npm run security:config --tier standard  - Apply tier without prompts
 *
 * @module security-config/index
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import chalk from 'chalk';

import {
  SECURITY_TIERS,
  getTierById,
  getDefaultTier,
  isValidTierId,
  getAllTierIds
} from './tier-definitions.js';

import {
  showTierSelector,
  showFeatureConfirmation,
  showTierComparison,
  showCurrentConfig,
  promptAdvancedCustomization,
  showSelectionSummary
} from './tier-selection-ui.js';

import {
  applySecurityTier,
  getCurrentTier,
  getCurrentFeatures,
  isSecurityConfigured,
  SECURITY_CONFIG_PATH
} from './security-writer.js';

import {
  showAdvancedConfig,
  validateFeatureSelection,
  confirmFeatureSelection,
  determineEffectiveTier
} from './advanced-override.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = import.meta.url;

/**
 * Config version
 */
export const VERSION = '1.0.0';

/**
 * Display banner for the security configuration wizard
 */
function displayBanner() {
  console.log(chalk.bold.cyan('\n==================================================================='));
  console.log(chalk.bold.cyan('              BMAD Security Configuration Wizard                  '));
  console.log(chalk.bold.cyan('                        Version ' + VERSION + '                           '));
  console.log(chalk.bold.cyan('===================================================================\n'));
}

/**
 * Display current security configuration
 * @param {string} [projectRoot=process.cwd()] - Project root directory
 */
export function showCurrentConfiguration(projectRoot = process.cwd()) {
  const configured = isSecurityConfigured(projectRoot);

  console.log('');
  console.log(chalk.bold('Current Security Configuration:'));
  console.log('');

  if (!configured) {
    console.log(chalk.yellow('  Security is not configured.'));
    console.log(chalk.dim('  Run `npm run security:config` to configure.\n'));
    return;
  }

  const currentTier = getCurrentTier(projectRoot);
  const currentFeatures = getCurrentFeatures(projectRoot);

  if (currentTier) {
    showCurrentConfig(currentTier);
  }

  console.log(chalk.bold('  Enabled Features:'));
  for (const feature of currentFeatures) {
    console.log(`    ${chalk.green('+')} ${feature}`);
  }
  console.log('');
}

/**
 * Main security configuration orchestration function
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.showOnly=false] - Only show current configuration
 * @param {string} [options.tier] - Pre-set tier (skip UI)
 * @param {boolean} [options.advanced=false] - Go directly to advanced mode
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @param {boolean} [options.silent=false] - Suppress banner output
 * @returns {Promise<{success: boolean, tier?: string, features?: string[], error?: string}>}
 */
export async function runSecurityConfig(options = {}) {
  const {
    showOnly = false,
    tier: presetTier,
    advanced = false,
    projectRoot = process.cwd(),
    silent = false
  } = options;

  // Display banner unless silent mode
  if (!silent) {
    displayBanner();
  }

  // Show-only mode
  if (showOnly) {
    showCurrentConfiguration(projectRoot);
    return { success: true };
  }

  // Check current configuration
  const wasConfigured = isSecurityConfigured(projectRoot);
  const previousTier = wasConfigured ? getCurrentTier(projectRoot) : null;

  if (wasConfigured && !silent) {
    console.log(chalk.dim('Current configuration detected.\n'));
    showCurrentConfig(previousTier);
  }

  // Direct tier application (--tier flag)
  if (presetTier) {
    if (!isValidTierId(presetTier)) {
      console.log(chalk.red(`Invalid tier: ${presetTier}`));
      console.log(chalk.dim(`Valid tiers: ${getAllTierIds().join(', ')}`));
      return { success: false, error: `Invalid tier: ${presetTier}` };
    }

    // Show comparison if changing tiers
    if (previousTier && previousTier !== presetTier) {
      showTierComparison(previousTier, presetTier);
    }

    // Apply tier
    const result = applySecurityTier(presetTier, { projectRoot });

    if (result.success) {
      const tier = getTierById(presetTier);
      console.log(chalk.green(`\n Security configured to ${tier.name} tier.`));
      console.log(chalk.dim(`  Config written to: ${result.path}\n`));
      return { success: true, tier: presetTier, features: tier.features };
    } else {
      console.log(chalk.red(`\n Failed to apply configuration: ${result.error}\n`));
      return { success: false, error: result.error };
    }
  }

  // Interactive mode
  try {
    // Step 1: Select tier
    let selectedTier;

    if (advanced) {
      // Advanced mode - go directly to feature customization
      selectedTier = previousTier || 'standard';
    } else {
      // Normal mode - show tier selector
      selectedTier = await showTierSelector();
    }

    // Show selection summary
    if (!advanced) {
      showSelectionSummary(selectedTier);
    }

    // Step 2: Optionally offer advanced customization
    let customFeatures = null;
    const wantsAdvanced = advanced || await promptAdvancedCustomization();

    if (wantsAdvanced) {
      // Show advanced feature selection
      const currentFeatures = getCurrentFeatures(projectRoot);
      const selectedFeatures = await showAdvancedConfig({
        baseTier: selectedTier,
        currentFeatures: currentFeatures.length > 0 ? currentFeatures : undefined
      });

      // Validate selection
      const validation = validateFeatureSelection(selectedFeatures, selectedTier);

      // Confirm
      const confirmed = await confirmFeatureSelection(validation);

      if (!confirmed) {
        console.log(chalk.yellow('\nConfiguration cancelled.\n'));
        return { success: false, error: 'Cancelled by user' };
      }

      customFeatures = selectedFeatures;

      // Determine effective tier
      const effectiveTier = determineEffectiveTier(selectedFeatures);
      if (effectiveTier !== 'custom') {
        selectedTier = effectiveTier;
        customFeatures = null; // Not custom if matches a tier exactly
      }
    } else {
      // Standard tier selection - confirm
      const confirmed = await showFeatureConfirmation(selectedTier);

      if (!confirmed) {
        console.log(chalk.yellow('\nConfiguration cancelled.\n'));
        return { success: false, error: 'Cancelled by user' };
      }
    }

    // Step 3: Show comparison if changing
    if (previousTier && previousTier !== selectedTier) {
      showTierComparison(previousTier, selectedTier);
    }

    // Step 4: Apply configuration
    console.log(chalk.dim('\nApplying security configuration...'));

    const result = applySecurityTier(selectedTier, {
      projectRoot,
      customFeatures
    });

    if (!result.success) {
      console.log(chalk.red(`\n Failed to apply configuration: ${result.error}\n`));
      return { success: false, error: result.error };
    }

    // Step 5: Success message
    const appliedTier = getTierById(selectedTier);
    const appliedFeatures = customFeatures || appliedTier.features;

    console.log('');
    console.log(chalk.bold.green('==================================================================='));
    console.log(chalk.bold.green('           Security Configuration Complete!                       '));
    console.log(chalk.bold.green('==================================================================='));
    console.log('');

    if (customFeatures) {
      console.log(chalk.dim(`  Custom configuration with ${appliedFeatures.length} features.`));
    } else {
      console.log(chalk.dim(`  Applied ${appliedTier.name} tier with ${appliedFeatures.length} features.`));
    }

    console.log(chalk.dim(`  Config written to: ${SECURITY_CONFIG_PATH}`));
    console.log(chalk.dim('  Run `npm run security:config --show` to view configuration.\n'));

    return {
      success: true,
      tier: selectedTier,
      features: appliedFeatures
    };

  } catch (error) {
    console.log(chalk.red(`\n Error: ${error.message}\n`));
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    showOnly: false,
    tier: null,
    advanced: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--show' || arg === '-s') {
      options.showOnly = true;
    } else if (arg === '--tier' || arg === '-t') {
      options.tier = args[++i];
    } else if (arg === '--advanced' || arg === '-a') {
      options.advanced = true;
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
${chalk.bold('BMAD Security Configuration Wizard')}

${chalk.bold('Usage:')}
  npm run security:config [options]

${chalk.bold('Options:')}
  --show, -s           Show current security configuration only
  --tier, -t <tier>    Apply tier directly (skip interactive prompts)
  --advanced, -a       Go directly to advanced feature customization
  --help, -h           Show this help message

${chalk.bold('Available Tiers:')}
  ${getAllTierIds().join(', ')}

${chalk.bold('Examples:')}
  npm run security:config                   # Interactive configuration
  npm run security:config --show            # View current config
  npm run security:config --tier standard   # Apply standard tier
  npm run security:config --advanced        # Advanced feature selection
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

  runSecurityConfig(options)
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red('\n Security configuration failed:'));
      console.error(chalk.red(`  ${error.message}\n`));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}
