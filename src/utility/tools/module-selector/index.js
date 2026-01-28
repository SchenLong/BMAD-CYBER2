#!/usr/bin/env node

/**
 * Module Selector Entry Point - INST-006
 * Epic 1, Story 6 - Module Selector npm Script Entry Point
 *
 * This is the main entry point for the BMAD module selection wizard.
 * It can be run standalone via `npm run modules` or programmatically
 * imported by other components like the postinstall wizard.
 *
 * Usage:
 *   npm run modules           - Interactive module selection
 *   npm run modules --current - Show current module selections only
 *
 * @module module-selector/index
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Import module-selector components
import {
  loadAllModules,
  getModuleSummary,
  findModuleByCode
} from './module-loader.js';

import {
  buildModuleChoices,
  showModuleSelector,
  calculateSelectionSummary,
  validateSelection
} from './module-selection-ui.js';

import {
  getRecommendedModules,
  applyRecommendations,
  sortModulesByRecommendation,
  isValidRole,
  VALID_ROLES
} from './role-recommendations.js';

import {
  updateManifest,
  readExistingManifest,
  MANIFEST_PATH,
  WIZARD_VERSION
} from './manifest-writer.js';

import {
  hasInteractiveFields,
  configureAllModules,
  getConfigurationStatus
} from './module-config-orchestrator.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Display banner for the module selector
 */
function displayBanner() {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║                 BMAD Module Selection Wizard                 ║'));
  console.log(chalk.bold.cyan('║                        Version ' + WIZARD_VERSION.padEnd(26) + '║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════════╝\n'));
}

/**
 * Display current module selections from manifest
 * @param {string} projectRoot - Root directory of the project
 */
export function showCurrentSelections(projectRoot = process.cwd()) {
  const manifest = readExistingManifest(projectRoot);

  console.log(chalk.bold('\nCurrent Module Selections:\n'));

  if (!manifest || (!manifest.modules && !manifest.enabled_modules)) {
    console.log(chalk.yellow('  No modules currently selected.'));
    console.log(chalk.dim('  Run `npm run modules` to configure modules.\n'));
    return;
  }

  const enabledModules = manifest.enabled_modules || manifest.modules || [];
  const modules = loadAllModules(projectRoot);

  console.log(chalk.green(`  ✓ ${enabledModules.length} modules enabled:\n`));

  for (const code of enabledModules) {
    const module = findModuleByCode(modules, code);
    if (module) {
      const tag = module.required ? chalk.yellow('[REQUIRED]') : '';
      console.log(`    ${chalk.cyan('•')} ${module.name} ${tag}`);
      console.log(`      ${chalk.dim(`${module.agentCount} agents, ${module.workflowCount} workflows`)}`);
    } else {
      console.log(`    ${chalk.cyan('•')} ${code} ${chalk.red('[NOT FOUND]')}`);
    }
  }

  // Show summary
  const summary = calculateSelectionSummary(enabledModules, modules);
  console.log(chalk.dim(`\n  Total: ${summary.agentCount} agents, ${summary.workflowCount} workflows (~${summary.estimatedSizeMB} MB)`));

  if (manifest.last_modified) {
    console.log(chalk.dim(`  Last modified: ${manifest.last_modified}`));
  }

  console.log();
}

/**
 * Prompt user to select their role
 * @returns {Promise<string>} Selected role
 */
async function promptForRole() {
  console.log(chalk.bold('\nSelect your role to see recommended modules:\n'));

  const roleChoices = VALID_ROLES.map(role => {
    const recommended = getRecommendedModules(role);
    return {
      name: `${formatRoleName(role)} (${recommended.length - 1} optional modules recommended)`,
      value: role,
      short: formatRoleName(role)
    };
  });

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'role',
      message: 'What is your primary role?',
      choices: roleChoices,
      pageSize: 10
    }
  ]);

  return answer.role;
}

/**
 * Format role ID to display name
 * @param {string} role - Role identifier
 * @returns {string} Formatted display name
 */
function formatRoleName(role) {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main module selection orchestration function
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.showCurrentOnly=false] - Only show current selections
 * @param {string} [options.role] - Pre-set user role (skip role prompt)
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @param {boolean} [options.skipConfig=false] - Skip per-module configuration
 * @param {boolean} [options.silent=false] - Suppress banner output
 * @returns {Promise<{selectedModules: string[], configuredModules: string[]}>}
 */
export async function runModuleSelector(options = {}) {
  const {
    showCurrentOnly = false,
    role: presetRole,
    projectRoot = process.cwd(),
    skipConfig = false,
    silent = false
  } = options;

  // Display banner unless silent mode
  if (!silent) {
    displayBanner();
  }

  // Show current selections only mode
  if (showCurrentOnly) {
    showCurrentSelections(projectRoot);
    return { selectedModules: [], configuredModules: [] };
  }

  // Step 1: Load all available modules
  console.log(chalk.dim('Scanning for available modules...\n'));
  const modules = loadAllModules(projectRoot);
  const summary = getModuleSummary(modules);

  console.log(chalk.green(`Found ${summary.moduleCount} modules (${summary.totalAgents} agents, ${summary.totalWorkflows} workflows)\n`));

  // Step 2: Get user role (from options or prompt)
  let userRole = presetRole;
  if (!userRole || !isValidRole(userRole)) {
    userRole = await promptForRole();
  }

  console.log(chalk.dim(`\nUsing role: ${formatRoleName(userRole)}\n`));

  // Step 3: Apply role-based recommendations
  applyRecommendations(modules, userRole);
  const sortedModules = sortModulesByRecommendation(modules);

  // Step 4: Show module selection UI
  const selectedModuleCodes = await showModuleSelector(sortedModules, userRole);

  // Step 5: Validate selection
  const validation = validateSelection(selectedModuleCodes, modules);
  if (!validation.valid) {
    console.log(chalk.red('\n⚠ Selection validation failed:'));
    for (const missing of validation.missing) {
      console.log(chalk.red(`  • Missing required module: ${missing}`));
    }
    // Auto-add missing required modules
    const fixedSelection = [...new Set([...selectedModuleCodes, ...validation.missing])];
    console.log(chalk.yellow('\nAutomatically adding required modules...\n'));
    return runModuleSelector({ ...options, selectedModules: fixedSelection });
  }

  // Step 6: Display selection summary
  const selectionSummary = calculateSelectionSummary(selectedModuleCodes, modules);
  console.log(chalk.bold('\n═══════════════════════════════════════════════════════════════'));
  console.log(chalk.bold('                      Selection Summary'));
  console.log(chalk.bold('═══════════════════════════════════════════════════════════════'));
  console.log(`  Modules: ${chalk.cyan(selectionSummary.moduleCount)}`);
  console.log(`  Agents:  ${chalk.cyan(selectionSummary.agentCount)}`);
  console.log(`  Workflows: ${chalk.cyan(selectionSummary.workflowCount)}`);
  console.log(`  Est. Size: ${chalk.cyan(selectionSummary.estimatedSizeMB + ' MB')}`);
  console.log(chalk.bold('═══════════════════════════════════════════════════════════════\n'));

  // Step 7: Confirm selection
  const confirmAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed with this selection?',
      default: true
    }
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow('\nSelection cancelled. Run `npm run modules` to try again.\n'));
    return { selectedModules: [], configuredModules: [] };
  }

  // Step 8: Update manifest
  console.log(chalk.dim('\nUpdating manifest configuration...'));
  const userInfo = {
    name: process.env.USER || process.env.USERNAME || 'unknown',
    role: userRole
  };
  const manifestResult = updateManifest(selectedModuleCodes, userInfo, projectRoot);

  if (!manifestResult.success) {
    console.log(chalk.red(`\n✗ Failed to update manifest: ${manifestResult.error}\n`));
    return { selectedModules: selectedModuleCodes, configuredModules: [] };
  }

  console.log(chalk.green(`✓ Manifest updated: ${manifestResult.path}\n`));

  // Step 9: Run per-module configuration (unless skipped)
  let configuredModules = [];

  if (!skipConfig) {
    // Check which modules need configuration
    const configStatus = getConfigurationStatus(selectedModuleCodes, projectRoot);

    if (configStatus.unconfigured.length > 0) {
      console.log(chalk.bold('\n═══════════════════════════════════════════════════════════════'));
      console.log(chalk.bold('                   Module Configuration'));
      console.log(chalk.bold('═══════════════════════════════════════════════════════════════\n'));

      console.log(chalk.dim(`${configStatus.unconfigured.length} module(s) need configuration:\n`));
      for (const code of configStatus.unconfigured) {
        console.log(`  • ${code}`);
      }
      console.log();

      // Prompt to configure now
      const configAnswer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'configure',
          message: 'Would you like to configure these modules now?',
          default: true
        }
      ]);

      if (configAnswer.configure) {
        const selectedModuleObjects = selectedModuleCodes.map(code => findModuleByCode(modules, code)).filter(Boolean);
        const unconfiguredModules = selectedModuleObjects.filter(m =>
          configStatus.unconfigured.includes(m.code)
        );

        const unconfiguredCodes = configStatus.unconfigured;
        configuredModules = await configureAllModules(unconfiguredCodes, {
          projectRoot,
          userContext: userInfo
        }, projectRoot);
      }
    } else if (configStatus.noConfigNeeded.length === selectedModuleCodes.length) {
      console.log(chalk.dim('No module configuration needed.\n'));
    } else {
      console.log(chalk.green('All selected modules are already configured.\n'));
    }
  }

  // Step 10: Final success message
  console.log(chalk.bold.green('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.green('║              Module Selection Complete!                      ║'));
  console.log(chalk.bold.green('╚══════════════════════════════════════════════════════════════╝\n'));

  console.log(chalk.dim('Your selected modules are now enabled.'));
  console.log(chalk.dim('Run `npm run modules --current` to view current selections.\n'));

  return {
    selectedModules: selectedModuleCodes,
    configuredModules
  };
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    showCurrentOnly: false,
    role: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--current' || arg === '-c') {
      options.showCurrentOnly = true;
    } else if (arg === '--role' || arg === '-r') {
      options.role = args[++i];
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
${chalk.bold('BMAD Module Selection Wizard')}

${chalk.bold('Usage:')}
  npm run modules [options]

${chalk.bold('Options:')}
  --current, -c     Show current module selections only
  --role, -r <role> Pre-select user role (skip role prompt)
  --help, -h        Show this help message

${chalk.bold('Available Roles:')}
  ${VALID_ROLES.join(', ')}

${chalk.bold('Examples:')}
  npm run modules                    # Interactive module selection
  npm run modules --current          # View current selections
  npm run modules --role developer   # Pre-set role to developer
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

  runModuleSelector(options)
    .then(result => {
      if (result.selectedModules.length > 0) {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error(chalk.red('\n✗ Module selection failed:'));
      console.error(chalk.red(`  ${error.message}\n`));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}
