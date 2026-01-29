#!/usr/bin/env node
/**
 * BMAD Setup Wizard Entry Point - INST-034
 * Epic 5 - PGP Setup & Unified Postinstall Wizard
 *
 * Postinstall hook that triggers the installation wizard.
 * Automatically detects CI environments and skips interactive prompts.
 *
 * Usage:
 *   npm run postinstall         - Triggered automatically after npm install
 *   npm run setup               - Manual setup with --force flag
 *   npm run setup -- --skip-wizard  - Skip the wizard entirely
 *
 * @module installer/bin/setup-wizard
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import path from 'path';

// Dynamic chalk import to handle ESM
let chalk;
try {
  chalk = (await import('chalk')).default;
} catch {
  // Fallback if chalk is not available
  chalk = {
    cyan: (s) => s,
    green: (s) => s,
    yellow: (s) => s,
    red: (s) => s,
    bold: (s) => s,
    dim: (s) => s
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Constants
// ============================================================================

export const VERSION = '1.0.0';

/**
 * Environment variables that indicate a CI environment
 * @type {string[]}
 */
export const CI_ENV_VARS = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'BUILD_NUMBER',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'JENKINS_URL',
  'TEAMCITY_VERSION'
];

export const HELP_TEXT = `
BMAD Setup Wizard v${VERSION}

This script runs automatically after npm install to guide you through
the BMAD-CYBER framework configuration.

Usage:
  npm run setup              Run setup wizard interactively
  npm run setup -- --force   Force run even in CI environment
  npm run setup -- --skip-wizard  Skip the wizard entirely
  npm run setup -- --help    Show this help message

Environment:
  In CI environments (GitHub Actions, GitLab CI, Jenkins, etc.),
  the interactive wizard is automatically skipped.
  Use 'npm run setup' to configure manually after CI install.

CI Detection Variables:
  ${CI_ENV_VARS.join(', ')}
`;

// ============================================================================
// CI Detection
// ============================================================================

/**
 * Check if running in a CI environment
 * @param {object} [env=process.env] - Environment variables to check
 * @returns {boolean} True if running in CI
 */
export function isCI(env = process.env) {
  return CI_ENV_VARS.some(varName => {
    const value = env[varName];
    // Check for truthy values (non-empty string, not 'false', not '0')
    return value !== undefined &&
           value !== '' &&
           value !== 'false' &&
           value !== '0';
  });
}

/**
 * Get the name of the detected CI environment
 * @param {object} [env=process.env] - Environment variables to check
 * @returns {string|null} CI environment name or null
 */
export function getDetectedCI(env = process.env) {
  const ciNames = {
    'GITHUB_ACTIONS': 'GitHub Actions',
    'GITLAB_CI': 'GitLab CI',
    'CIRCLECI': 'CircleCI',
    'TRAVIS': 'Travis CI',
    'JENKINS_URL': 'Jenkins',
    'TEAMCITY_VERSION': 'TeamCity',
    'CI': 'CI (generic)',
    'CONTINUOUS_INTEGRATION': 'CI (generic)',
    'BUILD_NUMBER': 'CI (generic)'
  };

  for (const [varName, displayName] of Object.entries(ciNames)) {
    const value = env[varName];
    if (value !== undefined && value !== '' && value !== 'false' && value !== '0') {
      return displayName;
    }
  }

  return null;
}

// ============================================================================
// Argument Parsing
// ============================================================================

/**
 * Parse command line arguments
 * @param {string[]} [args=process.argv.slice(2)] - Command line arguments
 * @returns {object} Parsed options
 */
export function parseArgs(args = process.argv.slice(2)) {
  return {
    skipWizard: args.includes('--skip-wizard') || args.includes('--skip'),
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    quiet: args.includes('--quiet') || args.includes('-q')
  };
}

// ============================================================================
// Wizard Runner
// ============================================================================

/**
 * Import and run the wizard orchestrator
 * @param {object} options - Options for the wizard
 * @returns {Promise<object>} Wizard result
 */
export async function runWizard(options = {}) {
  try {
    // Try to import the wizard orchestrator
    const orchestratorPath = path.join(__dirname, '../lib/wizard-orchestrator.js');
    const orchestrator = await import(orchestratorPath);

    if (typeof orchestrator.runWizard === 'function') {
      return await orchestrator.runWizard(options);
    } else if (typeof orchestrator.default === 'function') {
      return await orchestrator.default(options);
    } else if (typeof orchestrator.default?.runWizard === 'function') {
      return await orchestrator.default.runWizard(options);
    }

    throw new Error('Wizard orchestrator does not export a runWizard function');
  } catch (error) {
    // Re-throw with more context
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'Wizard orchestrator not found. The setup wizard will be available in a future update. ' +
        'For now, please configure BMAD-CYBER manually using:\n' +
        '  npm run modules        - Configure modules\n' +
        '  npm run security:config - Configure security\n' +
        '  npm run llm:setup      - Configure LLM provider\n' +
        '  npm run health         - Verify installation'
      );
    }
    throw error;
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main CLI entry point
 * @param {string[]} [args] - Command line arguments
 * @param {object} [env=process.env] - Environment variables
 * @returns {Promise<number>} Exit code (0 = success)
 */
export async function main(args = process.argv.slice(2), env = process.env) {
  const options = parseArgs(args);

  // Show help
  if (options.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  // Check for --skip-wizard flag
  if (options.skipWizard) {
    if (!options.quiet) {
      console.log(chalk.yellow('Wizard skipped by user request.'));
      console.log(chalk.dim("Run 'npm run setup' to configure later."));
    }
    return 0;
  }

  // Check for CI environment (unless --force is used)
  const inCI = isCI(env);
  if (inCI && !options.force) {
    const ciName = getDetectedCI(env) || 'CI';
    if (!options.quiet) {
      console.log(chalk.cyan(ciName + ' environment detected, skipping interactive wizard.'));
      console.log(chalk.dim("Run 'npm run setup' manually to configure."));
    }
    return 0;
  }

  // Check if we have a TTY (terminal) for interactive prompts
  if (!process.stdin.isTTY && !options.force) {
    if (!options.quiet) {
      console.log(chalk.yellow('Non-interactive terminal detected, skipping wizard.'));
      console.log(chalk.dim("Run 'npm run setup' in an interactive terminal to configure."));
    }
    return 0;
  }

  // Run the wizard
  try {
    if (!options.quiet) {
      console.log(chalk.cyan.bold('\nStarting BMAD-CYBER Setup Wizard...\n'));
    }

    await runWizard({
      verbose: options.verbose,
      quiet: options.quiet,
      force: options.force
    });

    if (!options.quiet) {
      console.log(chalk.green.bold('\nSetup completed successfully!'));
    }

    return 0;
  } catch (error) {
    // Handle errors gracefully - postinstall should never fail npm install
    if (!options.quiet) {
      console.error(chalk.red('Setup wizard error:'), error.message);

      // Provide helpful guidance
      console.log(chalk.dim('\nYou can configure BMAD-CYBER manually:'));
      console.log(chalk.dim('  npm run modules        - Configure modules'));
      console.log(chalk.dim('  npm run security:config - Configure security'));
      console.log(chalk.dim('  npm run llm:setup      - Configure LLM provider'));
      console.log(chalk.dim('  npm run health         - Verify installation'));
    }

    // Exit with 0 to not fail npm install
    // Postinstall errors should be warnings, not failures
    return 0;
  }
}

// ============================================================================
// Entry Point Detection
// ============================================================================

/**
 * Check if this module is being run directly
 * @returns {boolean} True if running as main module
 */
function isMainModule() {
  try {
    return process.argv[1] === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

// Run if executed directly
if (isMainModule()) {
  main().catch(err => {
    console.error(chalk.red('Setup failed:'), err.message);
    // Exit with 0 to not fail npm install
    process.exit(0);
  });
}

// ============================================================================
// Exports for Programmatic Use & Testing
// ============================================================================

export default {
  main,
  isCI,
  getDetectedCI,
  parseArgs,
  runWizard,
  CI_ENV_VARS,
  VERSION
};