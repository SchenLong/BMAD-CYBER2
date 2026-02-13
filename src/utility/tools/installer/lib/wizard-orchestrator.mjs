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
    }

    // Step 1: Module Selection
    if (!options.skipModules) {
      if (!quiet) {
        console.log(chalk.cyan.bold('\nStep 1/4: Module Selection'));
      }
      try {
        const moduleSelectorPath = path.join(__dirname, '../../../../utility/tools/module-selector/index.js');
        const moduleSelector = await import(moduleSelectorPath);
        // Build args array - support both modules array and individual preselection
        const moduleArgs = options.moduleArgs || process.argv.slice(2);
        results.modules = await moduleSelector.main(moduleArgs);
      } catch (error) {
        if (!quiet) {
          console.log(chalk.yellow(`Module selection skipped: ${error.message}`));
        }
        results.modules = { skipped: true, reason: error.message };
      }
    } else {
      if (!quiet) {
        console.log(chalk.dim('Step 1/4: Module Selection (skipped)'));
      }
    }

    // Step 2: Security Configuration
    if (!options.skipSecurity) {
      if (!quiet) {
        console.log(chalk.cyan.bold('\nStep 2/4: Security Configuration'));
      }
      try {
        const securityConfigPath = path.join(__dirname, '../../../../utility/tools/security-config/index.js');
        const securityConfig = await import(securityConfigPath);
        const securityArgs = options.securityArgs || [];
        // Add preselected tier if provided
        if (options.securityTier) {
          securityArgs.unshift(`--tier=${options.securityTier}`);
        }
        results.security = await securityConfig.main(securityArgs);
      } catch (error) {
        if (!quiet) {
          console.log(chalk.yellow(`Security configuration skipped: ${error.message}`));
        }
        results.security = { skipped: true, reason: error.message };
      }
    } else {
      if (!quiet) {
        console.log(chalk.dim('Step 2/4: Security Configuration (skipped)'));
      }
    }

    // Step 3: LLM Setup
    if (!options.skipLLM) {
      if (!quiet) {
        console.log(chalk.cyan.bold('\nStep 3/4: LLM Provider Setup'));
      }
      try {
        const llmSetupPath = path.join(__dirname, '../../../../utility/tools/llm-setup/index.js');
        const llmSetup = await import(llmSetupPath);
        const llmArgs = options.llmArgs || process.argv.slice(2);
        results.llm = await llmSetup.main(llmArgs);
      } catch (error) {
        if (!quiet) {
          console.log(chalk.yellow(`LLM setup skipped: ${error.message}`));
        }
        results.llm = { skipped: true, reason: error.message };
      }
    } else {
      if (!quiet) {
        console.log(chalk.dim('Step 3/4: LLM Provider Setup (skipped)'));
      }
    }

    // Step 4: PGP Setup
    if (!options.skipPGP) {
      if (!quiet) {
        console.log(chalk.cyan.bold('\nStep 4/4: PGP Key Setup'));
      }
      try {
        const pgpSetupPath = path.join(__dirname, '../../../../utility/tools/pgp-setup/index.js');
        const pgpSetup = await import(pgpSetupPath);
        const pgpArgs = options.pgpArgs || process.argv.slice(2);
        results.pgp = await pgpSetup.main(pgpArgs);
      } catch (error) {
        if (!quiet) {
          console.log(chalk.yellow(`PGP setup skipped: ${error.message}`));
        }
        results.pgp = { skipped: true, reason: error.message };
      }
    } else {
      if (!quiet) {
        console.log(chalk.dim('Step 4/4: PGP Key Setup (skipped)'));
      }
    }

    // Summary
    if (!quiet) {
      console.log('\n' + '='.repeat(60));
      console.log(chalk.green.bold('  Setup Complete!'));
      console.log('='.repeat(60));

      const completedSteps = [];
      if (results.modules && !results.modules.skipped) completedSteps.push('Modules');
      if (results.security && !results.security.skipped) completedSteps.push('Security');
      if (results.llm && !results.llm.skipped) completedSteps.push('LLM');
      if (results.pgp && !results.pgp.skipped) completedSteps.push('PGP');

      if (completedSteps.length > 0) {
        console.log(chalk.green('\nConfigured: ') + completedSteps.join(', '));
      }

      const skippedSteps = [];
      if (!results.modules || results.modules.skipped) skippedSteps.push('Modules');
      if (!results.security || results.security.skipped) skippedSteps.push('Security');
      if (!results.llm || results.llm.skipped) skippedSteps.push('LLM');
      if (!results.pgp || results.pgp.skipped) skippedSteps.push('PGP');

      if (skippedSteps.length > 0) {
        console.log(chalk.yellow('\nSkipped: ') + skippedSteps.join(', '));
        console.log(chalk.dim('You can configure these later with:'));
        console.log(chalk.dim('  npm run modules         - Module selection'));
        console.log(chalk.dim('  npm run security:config  - Security configuration'));
        console.log(chalk.dim('  npm run llm:setup        - LLM provider setup'));
        console.log(chalk.dim('  npm run pgp:setup        - PGP key setup'));
      }

      console.log('');
    }

    return results;

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
