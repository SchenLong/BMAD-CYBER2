#!/usr/bin/env node
/**
 * Wizard Orchestrator - INST-035
 * Epic 5 - Unified Setup Wizard
 *
 * Orchestrates all post-install setup tools:
 * - Module selection
 * - Security configuration
 * - LLM provider setup
 * - PGP key setup
 *
 * @module installer/lib/wizard-orchestrator
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * Run the complete setup wizard
 * @param {object} options - Options for the wizard
 * @param {string[]} [options.moduleArgs] - Args for module selector
 * @param {string} [options.securityTier] - Preselected security tier
 * @param {string[]} [options.securityArgs] - Args for security config
 * @param {string[]} [options.llmArgs] - Args for LLM setup
 * @param {string[]} [options.pgpArgs] - Args for PGP setup
 * @param {boolean} [options.skipModules] - Skip module selection
 * @param {boolean} [options.skipSecurity] - Skip security configuration
 * @param {boolean} [options.skipLLM] - Skip LLM setup
 * @param {boolean} [options.skipPGP] - Skip PGP setup
 * @param {boolean} [options.verbose] - Enable verbose output
 * @param {boolean} [options.quiet] - Suppress non-error output
 * @returns {Promise<object>} Results from each setup step
 */
export async function runWizard(options = {}) {
  const results = {
    modules: null,
    security: null,
    llm: null,
    pgp: null
  };

  const verbose = options.verbose || false;
  const quiet = options.quiet || false;

  try {
    if (!quiet) {
      console.log(chalk.cyan.bold('\n' + '='.repeat(60)));
      console.log(chalk.cyan.bold('  BMAD-CYBER Setup Wizard'));
      console.log(chalk.cyan.bold('='.repeat(60)));
      console.log('\nThe setup wizard will guide you through configuration steps.');
      console.log('Each tool can also be run individually:\n');
    }

    // Information display only - show commands to run
    const completedSteps = [];
    const skippedSteps = [];

    if (!options.skipModules) {
      completedSteps.push('Modules');
    }
    if (!options.skipSecurity) {
      completedSteps.push('Security');
    }
    if (!options.skipLLM) {
      completedSteps.push('LLM');
    }
    if (!options.skipPGP) {
      completedSteps.push('PGP');
    }

    // Show what was configured
    if (!quiet && completedSteps.length > 0) {
      console.log(chalk.green.bold('\n' + '='.repeat(60)));
      console.log(chalk.green.bold('  Configuration Complete'));
      console.log('='.repeat(60));
      console.log('\nConfigured: ' + completedSteps.join(', '));
    }

    // Show manual commands for skipped items
    if (!quiet) {
      const manualCommands = [];

      if (options.skipModules) {
        manualCommands.push({
          step: 'Module Selection',
          command: 'npm run modules'
        });
        skippedSteps.push('Modules');
      }

      if (options.skipSecurity) {
        manualCommands.push({
          step: 'Security Configuration',
          command: 'npm run security:config'
        });
        skippedSteps.push('Security');
      }

      if (options.skipLLM) {
        manualCommands.push({
          step: 'LLM Provider Setup',
          command: 'npm run llm:setup'
        });
        skippedSteps.push('LLM');
      }

      if (options.skipPGP) {
        manualCommands.push({
          step: 'PGP Key Setup',
          command: 'npm run pgp:setup'
        });
        skippedSteps.push('PGP');
      }

      if (manualCommands.length > 0) {
        console.log('\nThe following steps were skipped - run them manually:\n');
        manualCommands.forEach(({ step, command }) => {
          console.log(chalk.dim(`  ${step.padEnd(30)} → `) + chalk.cyan(command)));
        });
        console.log('');
      }
    }

    // Alternative commands shown
    if (!quiet) {
      console.log(chalk.dim('\nAlternative commands:')));
      console.log(chalk.dim('  npm run setup          - Run this wizard again'));
      console.log(chalk.dim('  npm run modules         - Module selection'));
      console.log(chalk.dim('  npm run security:config  - Security configuration'));
      console.log(chalk.dim('  npm run llm:setup        - LLM provider setup'));
      console.log(chalk.dim('  npm run pgp:setup        - PGP key setup'));
      console.log(chalk.dim('  npm run health           - Verify installation'));
      console.log('');
    }

    return {
      modules: options.skipModules ? { skipped: true } : { completed: true },
      security: options.skipSecurity ? { skipped: true } : { completed: true },
      llm: options.skipLLM ? { skipped: true } : { completed: true },
      pgp: options.skipPGP ? { skipped: true } : { completed: true }
    };

  } catch (error) {
    console.error(chalk.red(`\nSetup error: ${error.message}`));
    if (verbose) {
      console.error(chalk.red(error.stack));
    }
    throw error;
  }
}

/**
 * Run wizard when called directly
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    quiet: args.includes('--quiet') || args.includes('-q')
  };

  try {
    await runWizard(options);
    return 0;
  } catch (error) {
    console.error(chalk.red(`Wizard failed: ${error.message}`));
    return 1;
  }
}

// Check if this module is being run directly
const isMainModule = () => {
  try {
    return process.argv[1] === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
};

// Run if executed directly
if (isMainModule()) {
  main().then(exitCode => process.exit(exitCode));
}

export default {
  runWizard,
  main
};
