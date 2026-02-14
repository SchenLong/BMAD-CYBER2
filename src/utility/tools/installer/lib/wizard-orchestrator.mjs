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
import { pathToFileURL } from 'url';

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
 * Tool paths relative to project root
 */
const TOOL_PATHS = {
  modules: 'src/utility/tools/module-selector/index.js',
  security: 'src/utility/tools/security-config/index.js',
  llm: 'src/utility/tools/llm-setup/index.js',
  pgp: 'src/utility/tools/pgp-setup/index.js'
};

/**
 * Import a tool module dynamically
 */
async function importTool(toolPath, projectRoot) {
  const absolutePath = path.resolve(projectRoot, toolPath);
  const toolUrl = pathToFileURL(absolutePath).href;

  try {
    const module = await import(toolUrl);
    return module;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

/**
 * Run a setup tool and return result
 */
async function runTool(toolName, toolPath, runFunctionName, options, projectRoot, silent) {
  const toolStartTime = Date.now();

  try {
    const module = await importTool(toolPath, projectRoot);

    if (!module) {
      return {
        success: false,
        skipped: true,
        result: null,
        error: 'Tool not found at ' + toolPath
      };
    }

    // Find the run function
    const runFunction = module[runFunctionName] || module.default?.[runFunctionName];

    if (typeof runFunction !== 'function') {
      return {
        success: false,
        skipped: true,
        result: null,
        error: 'Tool does not export ' + runFunctionName
      };
    }

    // Run the tool with silent mode to avoid duplicate banners
    const result = await runFunction({
      ...options,
      silent,
      projectRoot
    });

    const duration = Date.now() - toolStartTime;

    return {
      success: true,
      skipped: false,
      result,
      error: null,
      duration
    };

  } catch (error) {
    const duration = Date.now() - toolStartTime;

    return {
      success: false,
      skipped: false,
      result: null,
      error: error.message,
      duration
    };
  }
}

/**
 * Display step header
 */
function displayStepHeader(stepName, stepNum, totalSteps) {
  console.log('');
  console.log(chalk.cyan.bold('┌─ Step ' + stepNum + '/' + totalSteps + ': ' + stepName + ' ' + '─'.repeat(40)));
  console.log(chalk.cyan.bold('│'));
}

/**
 * Display step result
 */
function displayStepResult(stepName, stepResult) {
  console.log(chalk.cyan.bold('│'));
  console.log(chalk.cyan.bold('└' + '─'.repeat(59)));

  if (stepResult.skipped) {
    console.log(chalk.yellow('  ⊘ ' + stepName + ': Skipped (' + stepResult.error + ')'));
  } else if (stepResult.success) {
    const duration = stepResult.duration ? ' (' + Math.round(stepResult.duration) + 'ms)' : '';
    console.log(chalk.green('  ✓ ' + stepName + ': Complete' + duration));
  } else {
    console.log(chalk.red('  ✗ ' + stepName + ': Failed - ' + stepResult.error));
  }
}

/**
 * Run the complete setup wizard
 */
export async function runWizard(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const verbose = options.verbose || false;
  const quiet = options.quiet || false;
  const autoAccept = options.yes || options.force || false;

  const results = {
    modules: null,
    security: null,
    llm: null,
    pgp: null
  };

  const steps = [];
  if (!options.skipModules) steps.push({ name: 'Module Selection', key: 'modules', path: TOOL_PATHS.modules, func: 'runModuleSelector' });
  if (!options.skipSecurity) steps.push({ name: 'Security Configuration', key: 'security', path: TOOL_PATHS.security, func: 'runSecurityConfig' });
  if (!options.skipLLM) steps.push({ name: 'LLM Provider Setup', key: 'llm', path: TOOL_PATHS.llm, func: 'runLlmSetup' });
  if (!options.skipPGP) steps.push({ name: 'PGP Key Setup', key: 'pgp', path: TOOL_PATHS.pgp, func: 'runPgpSetup' });

  // Skip if nothing to run
  if (steps.length === 0) {
    if (!quiet) {
      console.log(chalk.yellow('\nNo setup steps enabled. All skipped.\n'));
    }
    return results;
  }

  try {
    if (!quiet) {
      console.log(chalk.cyan.bold('\n' + '='.repeat(60)));
      console.log(chalk.cyan.bold('  BMAD-CYBER Setup Wizard'));
      console.log(chalk.cyan.bold('='.repeat(60)));

      if (autoAccept) {
        console.log(chalk.yellow('\n  Running in non-interactive mode (--yes/--force)'));
        console.log(chalk.yellow('  Default values will be used for all prompts.\n'));
      } else {
        console.log('\nThe setup wizard will guide you through configuration steps.');
        console.log('Each tool can also be run individually:\n');
        console.log(chalk.dim('  npm run modules        - Module selection'));
        console.log(chalk.dim('  npm run security:config - Security configuration'));
        console.log(chalk.dim('  npm run llm:setup      - LLM provider setup'));
        console.log(chalk.dim('  npm run pgp:setup        - PGP key setup'));
      }
    }

    // Run each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNum = i + 1;

      if (!quiet) {
        displayStepHeader(step.name, stepNum, steps.length);
      }

      // Build options for this tool
      const toolOptions = {};

      const stepResult = await runTool(
        step.name,
        step.path,
        step.func,
        toolOptions,
        projectRoot,
        quiet
      );

      results[step.key] = stepResult;

      if (!quiet) {
        displayStepResult(step.name, stepResult);
      }

      // Continue on non-critical failures
      if (!stepResult.success && !stepResult.skipped) {
        if (!quiet) {
          console.log(chalk.yellow('  Continuing with remaining steps...\n'));
        }
      }
    }

    // Summary
    if (!quiet) {
      const completed = Object.entries(results).filter(([_, r]) => r?.success === true);
      const skipped = Object.entries(results).filter(([_, r]) => r?.skipped === true);
      const failed = Object.entries(results).filter(([_, r]) => r?.success === false && r?.skipped !== true);

      console.log('');
      console.log(chalk.bold('═════════════════════════════════════════════════════════════'));
      console.log(chalk.bold('                         Setup Summary'));
      console.log(chalk.bold('═════════════════════════════════════════════════════════════'));
      console.log('');

      if (completed.length > 0) {
        console.log(chalk.green('  Completed (' + completed.length + '): ' + completed.map(([k]) => k).join(', ')));
      }
      if (skipped.length > 0) {
        console.log(chalk.yellow('  Skipped (' + skipped.length + '): ' + skipped.map(([k]) => k).join(', ')));
      }
      if (failed.length > 0) {
        console.log(chalk.red('  Failed (' + failed.length + '): ' + failed.map(([k]) => k).join(', ')));
      }

      console.log('');

      if (failed.length > 0 || skipped.length > 0) {
        console.log(chalk.dim('You can run individual tools later:'));
        for (const [key, result] of Object.entries(results)) {
          if (result?.skipped || (!result?.success && result?.skipped !== true)) {
            const commands = {
              modules: 'npm run modules',
              security: 'npm run security:config',
              llm: 'npm run llm:setup',
              pgp: 'npm run pgp:setup'
            };
            console.log(chalk.dim('  ' + commands[key]));
          }
        }
        console.log('');
      }
    }

    return results;

  } catch (error) {
    console.error(chalk.red('\nSetup error: ' + error.message));
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
    quiet: args.includes('--quiet') || args.includes('-q'),
    yes: args.includes('--yes') || args.includes('-y'),
    force: args.includes('--force') || args.includes('-f')
  };

  try {
    await runWizard(options);
    return 0;
  } catch (error) {
    console.error(chalk.red('Wizard failed: ' + error.message));
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
