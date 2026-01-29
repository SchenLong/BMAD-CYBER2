/**
 * Module Configuration Orchestrator - INST-005 (Part 3/4)
 * Epic 1, Story 5 - Per-Module Configuration Prompts
 *
 * Orchestrates the configuration process for selected BMAD modules.
 * Coordinates between prompt collection, directory creation, and config persistence.
 *
 * @module module-config-orchestrator
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import {
  extractInteractiveFields,
  promptForModuleConfig,
  expandPlaceholders
} from './module-config-prompt.js';
import {
  createOutputDirectory,
  saveModuleConfig,
  ensureModulesConfigDirectory
} from './module-config-persistence.js';
import { loadAllModules, findModuleByCode } from './module-loader.js';

/**
 * @typedef {Object} ConfigurationSummary
 * @property {string[]} configured - Module codes that were successfully configured
 * @property {string[]} skipped - Module codes that were skipped (no interactive fields)
 * @property {string[]} errors - Module codes that encountered errors during configuration
 */

/**
 * @typedef {Object} DirectoryCreationResult
 * @property {string[]} created - Paths of directories that were created
 * @property {string[]} failed - Paths of directories that failed to create
 */

/**
 * @typedef {Object} ModuleMetadata
 * @property {string} code - Unique module identifier
 * @property {string} name - Human-readable module name
 * @property {string} description - Module description
 * @property {boolean} required - Whether module is required
 * @property {Object} interactiveFields - Fields requiring user prompts
 * @property {string} modulePath - Path to the module directory
 */

/**
 * Checks if a module has any interactive fields (fields with 'prompt' key)
 *
 * @param {ModuleMetadata} module - Module metadata object
 * @returns {boolean} True if module has interactive fields, false otherwise
 *
 * @example
 * const module = { interactiveFields: { output_folder: { prompt: '...' } } };
 * hasInteractiveFields(module); // true
 *
 * const coreModule = { interactiveFields: {} };
 * hasInteractiveFields(coreModule); // false
 */
export function hasInteractiveFields(module) {
  if (!module || !module.interactiveFields) {
    return false;
  }

  return Object.keys(module.interactiveFields).length > 0;
}

/**
 * Creates all output directories from a resolved configuration object.
 * Scans configuration values for paths (strings containing '/') and creates them.
 *
 * @param {Object} config - Configuration object with resolved paths
 * @param {string} projectRoot - Project root path
 * @returns {Promise<DirectoryCreationResult>} Result with created and failed paths
 *
 * @example
 * const config = {
 *   output_folder: '/project/_bmad-output/intel-team',
 *   reports: '/project/_bmad-output/intel-team/reports',
 *   module_code: 'intel-team' // Not a path, will be skipped
 * };
 * const result = await createAllOutputDirectories(config, '/project');
 * // result.created: ['/project/_bmad-output/intel-team', '/project/_bmad-output/intel-team/reports']
 */
export async function createAllOutputDirectories(config, projectRoot) {
  const result = {
    created: [],
    failed: []
  };

  // Metadata fields to skip (not paths)
  const metadataFields = [
    'last_modified',
    'wizard_version',
    'module_code',
    'module_version',
    'user_context',
    'code',
    'name'
  ];

  for (const [key, value] of Object.entries(config)) {
    // Skip metadata fields
    if (metadataFields.includes(key)) {
      continue;
    }

    // Skip non-string values
    if (typeof value !== 'string') {
      continue;
    }

    // Check if value looks like a path (contains '/')
    if (!value.includes('/')) {
      continue;
    }

    // Skip paths that point to existing module directories (read-only paths)
    // These are typically source paths like agents_path, workflows_path, etc.
    if (value.includes('/_bmad/') && !value.includes('_bmad-output')) {
      continue;
    }

    try {
      await createOutputDirectory(value);
      result.created.push(value);
    } catch (error) {
      result.failed.push(value);
    }
  }

  return result;
}

/**
 * Main orchestration function for configuring all selected modules.
 * Coordinates the entire configuration flow: loading modules, prompting users,
 * creating directories, and persisting configurations.
 *
 * @param {string[]} selectedModuleCodes - Array of module codes to configure
 * @param {Object} context - Context object containing installation state
 * @param {string} context.projectRoot - Project root directory
 * @param {Object} [context.userProfile] - User profile information
 * @param {string} [context.userProfile.name] - User's name
 * @param {string} [context.userProfile.language] - Communication language
 * @param {string} projectRoot - Project root path
 * @returns {Promise<ConfigurationSummary>} Summary of configuration results
 *
 * @example
 * const summary = await configureAllModules(
 *   ['core', 'intel-team', 'cybersec-team'],
 *   { projectRoot: '/project', userProfile: { name: 'User' } },
 *   '/project'
 * );
 * console.log(summary.configured); // ['intel-team', 'cybersec-team']
 * console.log(summary.skipped); // ['core']
 */
export async function configureAllModules(selectedModuleCodes, context, projectRoot) {
  const summary = {
    configured: [],
    skipped: [],
    errors: []
  };

  // Step 1: Ensure the modules config directory exists
  try {
    await ensureModulesConfigDirectory(projectRoot);
  } catch (error) {
    console.error(chalk.red(`Failed to create modules config directory: ${error.message}`));
    // Continue anyway - individual saves might still work
  }

  // Step 2: Load all available modules
  let allModules;
  try {
    allModules = loadAllModules(projectRoot);
  } catch (error) {
    console.error(chalk.red(`Failed to load modules: ${error.message}`));
    return summary;
  }

  if (allModules.length === 0) {
    console.warn(chalk.yellow('No modules found to configure.'));
    return summary;
  }

  // Step 3: Process each selected module
  console.log(chalk.cyan('\n=== Module Configuration ===\n'));

  for (const moduleCode of selectedModuleCodes) {
    // Find the module metadata
    const module = findModuleByCode(allModules, moduleCode);

    if (!module) {
      console.warn(chalk.yellow(`Module '${moduleCode}' not found, skipping.`));
      summary.errors.push(moduleCode);
      continue;
    }

    // Check if module has interactive fields
    const interactiveFields = extractInteractiveFields(module);

    if (Object.keys(interactiveFields).length === 0) {
      console.log(chalk.dim(`  ${module.name} - No configuration needed (using defaults)`));
      summary.skipped.push(moduleCode);
      continue;
    }

    // Module has interactive fields - prompt user
    console.log(chalk.bold(`\nConfiguring: ${module.name}`));

    try {
      // Prompt user for configuration values
      const userResponses = await promptForModuleConfig(module, context);

      // Expand placeholders in configuration
      const expandedConfig = expandPlaceholders(userResponses, {
        ...context,
        projectRoot
      });

      // Create output directories from the expanded config
      const dirResult = await createAllOutputDirectories(expandedConfig, projectRoot);

      if (dirResult.created.length > 0) {
        console.log(chalk.green(`  Created ${dirResult.created.length} output director${dirResult.created.length === 1 ? 'y' : 'ies'}`));
      }

      if (dirResult.failed.length > 0) {
        console.warn(chalk.yellow(`  Warning: Failed to create ${dirResult.failed.length} director${dirResult.failed.length === 1 ? 'y' : 'ies'}`));
      }

      // Save the configuration
      await saveModuleConfig(moduleCode, expandedConfig, projectRoot);

      console.log(chalk.green(`  ${module.name} configured successfully`));
      summary.configured.push(moduleCode);

    } catch (error) {
      console.error(chalk.red(`  Error configuring ${module.name}: ${error.message}`));
      summary.errors.push(moduleCode);
    }
  }

  return summary;
}

/**
 * Displays a formatted summary of the configuration process.
 * Uses chalk for colored output to highlight different result categories.
 *
 * @param {ConfigurationSummary} summary - Configuration summary from configureAllModules
 *
 * @example
 * const summary = {
 *   configured: ['intel-team', 'cybersec-team'],
 *   skipped: ['core'],
 *   errors: []
 * };
 * displayConfigSummary(summary);
 * // Output:
 * // === Configuration Summary ===
 * // Successfully configured: 2 modules
 * //   - intel-team
 * //   - cybersec-team
 * // Skipped (no config needed): 1 module
 * //   - core
 */
export function displayConfigSummary(summary) {
  console.log(chalk.cyan('\n=== Configuration Summary ===\n'));

  // Successfully configured modules
  if (summary.configured.length > 0) {
    console.log(chalk.green(`Successfully configured: ${summary.configured.length} module${summary.configured.length === 1 ? '' : 's'}`));
    for (const code of summary.configured) {
      console.log(chalk.green(`  - ${code}`));
    }
    console.log('');
  }

  // Skipped modules (no interactive fields)
  if (summary.skipped.length > 0) {
    console.log(chalk.yellow(`Skipped (no config needed): ${summary.skipped.length} module${summary.skipped.length === 1 ? '' : 's'}`));
    for (const code of summary.skipped) {
      console.log(chalk.yellow(`  - ${code}`));
    }
    console.log('');
  }

  // Modules with errors
  if (summary.errors.length > 0) {
    console.log(chalk.red(`Errors encountered: ${summary.errors.length} module${summary.errors.length === 1 ? '' : 's'}`));
    for (const code of summary.errors) {
      console.log(chalk.red(`  - ${code}`));
    }
    console.log('');
  }

  // Overall status
  const total = summary.configured.length + summary.skipped.length + summary.errors.length;
  const successRate = total > 0 ? Math.round(((summary.configured.length + summary.skipped.length) / total) * 100) : 100;

  if (summary.errors.length === 0) {
    console.log(chalk.green.bold('All modules processed successfully!'));
  } else {
    console.log(chalk.yellow(`Configuration complete: ${successRate}% success rate`));
  }
}

/**
 * Configures a single module by code.
 * Useful for reconfiguring individual modules after initial installation.
 *
 * @param {string} moduleCode - The module code to configure
 * @param {Object} context - Context object containing installation state
 * @param {string} projectRoot - Project root path
 * @returns {Promise<{success: boolean, error?: string}>} Configuration result
 *
 * @example
 * const result = await configureSingleModule('intel-team', { projectRoot: '/project' }, '/project');
 * if (result.success) {
 *   console.log('Module configured!');
 * } else {
 *   console.error(result.error);
 * }
 */
export async function configureSingleModule(moduleCode, context, projectRoot) {
  const summary = await configureAllModules([moduleCode], context, projectRoot);

  if (summary.configured.includes(moduleCode)) {
    return { success: true };
  } else if (summary.skipped.includes(moduleCode)) {
    return { success: true, skipped: true };
  } else {
    return {
      success: false,
      error: `Failed to configure module '${moduleCode}'`
    };
  }
}

/**
 * Gets configuration status for all selected modules.
 * Checks which modules require configuration and which have existing configs.
 *
 * @param {string[]} selectedModuleCodes - Array of module codes to check
 * @param {string} projectRoot - Project root path
 * @returns {Object} Status object with arrays of configured, unconfigured, and noConfigNeeded modules
 *
 * @example
 * const status = getConfigurationStatus(['core', 'intel-team'], '/project');
 * console.log(status.unconfigured); // Modules needing configuration
 */
export function getConfigurationStatus(selectedModuleCodes, projectRoot) {
  const status = {
    configured: [],      // Modules with existing config files
    unconfigured: [],    // Modules needing configuration
    noConfigNeeded: []   // Modules without interactive fields
  };

  const allModules = loadAllModules(projectRoot);

  for (const moduleCode of selectedModuleCodes) {
    const module = findModuleByCode(allModules, moduleCode);

    if (!module) {
      continue;
    }

    if (!hasInteractiveFields(module)) {
      status.noConfigNeeded.push(moduleCode);
      continue;
    }

    // Check if config file exists
    const configPath = `${projectRoot}/_bmad/_config/modules/${moduleCode}-config.yaml`;
    if (fs.existsSync(configPath)) {
      status.configured.push(moduleCode);
    } else {
      status.unconfigured.push(moduleCode);
    }
  }

  return status;
}

// ESM Entry point detection (for testing)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(chalk.cyan('Module Configuration Orchestrator - Interactive Test\n'));
  console.log('='.repeat(50));

  const projectRoot = process.cwd();

  // Load modules to show what's available
  const modules = loadAllModules(projectRoot);

  console.log(`\nFound ${modules.length} modules:\n`);

  for (const mod of modules) {
    const hasPrompts = hasInteractiveFields(mod);
    const promptStatus = hasPrompts ? chalk.green('[CONFIG NEEDED]') : chalk.dim('[NO CONFIG]');
    console.log(`  ${mod.code} ${promptStatus}`);
    console.log(`    Name: ${mod.name}`);

    if (hasPrompts) {
      const fields = extractInteractiveFields(mod);
      console.log(`    Interactive Fields: ${Object.keys(fields).join(', ')}`);
    }
    console.log('');
  }

  // Example configuration run (uncomment to test interactively)
  /*
  console.log('\n' + '='.repeat(50));
  console.log('Running configuration for intel-team...\n');

  const summary = await configureAllModules(
    ['intel-team'],
    { projectRoot },
    projectRoot
  );

  displayConfigSummary(summary);
  */

  console.log('\nTo run configuration interactively, use:');
  console.log('  import { configureAllModules } from "./module-config-orchestrator.js"');
  console.log('  await configureAllModules(["intel-team"], { projectRoot }, projectRoot)');
}
