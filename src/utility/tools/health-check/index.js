/**
 * BMAD Health Check Entry Point - INST-024
 * Epic 4 - Post-Install Health Check
 *
 * Main entry point for running all health checks.
 * Usage: npm run health
 * Flags: --json for machine-readable output
 *
 * @module health-check/index
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { checkAllModules } from './module-checker.js';
import checkToken from './token-checker.js';
import { checkLlmConnectivity } from './llm-checker.js';
import { checkSecurity } from './security-checker.js';
import { displaySummary, formatJsonOutput } from './summary-display.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Constants
// ============================================================================

export const VERSION = '1.0.0';
export const HELP_TEXT = `
BMAD Health Check v${VERSION}

Usage:
  npm run health              Run all health checks with summary display
  npm run health -- --json    Output results as JSON
  npm run health -- --help    Show this help message

Exit Codes:
  0 - All checks passed (HEALTHY)
  1 - Some checks have warnings (DEGRADED)
  2 - Critical checks failed (UNHEALTHY)

Checks Performed:
  - Module Loading: Verifies installed modules are accessible
  - Token Validity: Checks authentication token status
  - LLM Connectivity: Tests LLM provider connections
  - Security Status: Validates security configuration
`;

// ============================================================================
// Individual Check Runners
// ============================================================================

/**
 * Run module check
 * @param {string} basePath - Base path for the project
 * @returns {Promise<object>} Module check results
 */
export async function runModuleCheck(basePath) {
  try {
    return await checkAllModules(basePath);
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      totalModules: 0,
      totalAgents: 0,
      totalWorkflows: 0,
      modules: [],
      issues: [`Error checking modules: ${error.message}`]
    };
  }
}

/**
 * Run token check
 * @param {string} basePath - Base path for the project
 * @returns {Promise<object>} Token check results
 */
export async function runTokenCheck(basePath) {
  try {
    return checkToken({ basePath });
  } catch (error) {
    return {
      status: 'invalid',
      error: error.message,
      role: null,
      userId: null,
      expiresIn: null,
      expiresAt: null,
      warnings: []
    };
  }
}

/**
 * Run LLM check
 * @param {string} basePath - Base path for the project
 * @returns {Promise<object>} LLM check results
 */
export async function runLLMCheck(basePath) {
  try {
    const result = await checkLlmConnectivity({ projectRoot: basePath });

    // Transform result to match expected format for summary-display
    const providers = [];

    if (result.primary) {
      providers.push({
        name: result.primary.provider,
        status: result.primary.connected ? 'healthy' : 'unhealthy',
        isPrimary: true,
        model: result.primary.model,
        error: result.primary.error
      });
    }

    for (const fallback of (result.fallbacks || [])) {
      providers.push({
        name: fallback.provider,
        status: fallback.connected ? 'healthy' : 'unhealthy',
        isPrimary: false,
        model: fallback.model,
        error: fallback.error
      });
    }

    // Map llm-checker status to health status
    let status;
    if (result.status === 'connected') {
      status = 'healthy';
    } else if (result.status === 'fallback') {
      status = 'degraded';
    } else if (result.status === 'unconfigured' || result.status === 'disconnected') {
      status = 'unhealthy';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      providers,
      error: result.status === 'unconfigured' ? 'LLM not configured' : null,
      warnings: result.warnings || []
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      providers: []
    };
  }
}

/**
 * Run security check
 * @param {string} basePath - Base path for the project
 * @returns {Promise<object>} Security check results
 */
export async function runSecurityCheck(basePath) {
  try {
    return await checkSecurity(basePath);
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      validatorsEnabled: 0,
      guardsEnabled: 0,
      auditLogging: false,
      warnings: []
    };
  }
}

// ============================================================================
// Main Check Orchestrator
// ============================================================================

/**
 * Run all health checks
 * @param {object} options - Check options
 * @param {string} [options.basePath] - Base path for the project
 * @returns {Promise<object>} Aggregated results from all checks
 */
export async function runAllChecks(options = {}) {
  const basePath = options.basePath || process.cwd();

  // Run all checks concurrently for performance
  const [modules, token, llm, security] = await Promise.all([
    runModuleCheck(basePath),
    runTokenCheck(basePath),
    runLLMCheck(basePath),
    runSecurityCheck(basePath)
  ]);

  return {
    modules,
    token,
    llm,
    security
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {object} Parsed options
 */
export function parseArgs(args = []) {
  return {
    json: args.includes('--json'),
    help: args.includes('--help') || args.includes('-h'),
    noColor: args.includes('--no-color'),
    basePath: process.cwd()
  };
}

/**
 * Main CLI entry point
 * @param {string[]} args - Command line arguments
 * @returns {Promise<number>} Exit code
 */
export async function main(args = []) {
  const options = parseArgs(args);

  // Show help
  if (options.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  try {
    // Run all checks
    const results = await runAllChecks({ basePath: options.basePath });

    if (options.json) {
      // JSON output
      const jsonOutput = formatJsonOutput(results);
      console.log(JSON.stringify(jsonOutput, null, 2));
      return jsonOutput.exitCode;
    } else {
      // Human-readable output
      const { exitCode, formattedOutput } = displaySummary(results, {
        noColor: options.noColor
      });
      console.log(formattedOutput);
      return exitCode;
    }
  } catch (error) {
    console.error('Health check failed:', error.message);
    if (!options.json) {
      console.error('\nRun with --json flag for detailed error information.');
    }
    return 2;
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
  // ESM entry point detection
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
}

// Run if executed directly
if (isMainModule()) {
  const args = process.argv.slice(2);
  main(args).then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(2);
  });
}

// ============================================================================
// Exports for Programmatic Use
// ============================================================================

export default {
  runAllChecks,
  runModuleCheck,
  runTokenCheck,
  runLLMCheck,
  runSecurityCheck,
  main,
  parseArgs,
  VERSION
};
