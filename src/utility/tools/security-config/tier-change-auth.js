/**
 * Tier Change Authentication - SEC-CFG-001
 * Epic 2, Security Enhancement
 *
 * Implements MFA/authentication requirement for security tier changes.
 * Provides challenge-response mechanism and logs all tier change attempts.
 *
 * @module security-config/tier-change-auth
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

import { compareTiers, getTierById } from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the tier change log file relative to project root
 * @type {string}
 */
export const TIER_CHANGE_LOG_PATH = '_bmad/core/security/tier-change-log.json';

/**
 * Challenge expiration time in milliseconds (5 minutes)
 * @type {number}
 */
export const CHALLENGE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * @typedef {Object} TierChangeAttempt
 * @property {string} timestamp - ISO timestamp of the attempt
 * @property {string} user - User who attempted the change
 * @property {string} fromTier - Original tier
 * @property {string} toTier - Target tier
 * @property {boolean} success - Whether the change was allowed
 * @property {string} reason - Reason for success/failure
 */

/**
 * @typedef {Object} AuthChallenge
 * @property {string} challenge - The challenge string
 * @property {string} expectedResponse - Expected response hash
 * @property {number} expiresAt - Expiration timestamp
 */

/**
 * Generates a cryptographic challenge for tier change authentication
 * @returns {AuthChallenge} Challenge object with expected response
 */
export function generateChallenge() {
  // Generate random bytes for challenge
  const randomBytes = crypto.randomBytes(16);
  const challenge = randomBytes.toString('hex').substring(0, 8).toUpperCase();

  // Calculate expected response (hash of challenge)
  const expectedResponse = crypto
    .createHash('sha256')
    .update(challenge)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  return {
    challenge,
    expectedResponse,
    expiresAt: Date.now() + CHALLENGE_EXPIRATION_MS
  };
}

/**
 * Verifies the challenge response
 * @param {AuthChallenge} challenge - The original challenge
 * @param {string} response - User's response
 * @returns {boolean} True if response is valid
 */
export function verifyChallenge(challenge, response) {
  // Check expiration
  if (Date.now() > challenge.expiresAt) {
    return false;
  }

  // Verify response matches expected
  return response.toUpperCase() === challenge.expectedResponse;
}

/**
 * Determines if a tier change requires authentication
 * Lowering security (higher order to lower order) requires confirmation
 * @param {string} fromTier - Current tier ID
 * @param {string} toTier - Target tier ID
 * @returns {boolean} True if authentication is required
 */
export function requiresAuthentication(fromTier, toTier) {
  // Initial configuration (no previous tier) doesn't require auth
  if (!fromTier) {
    return false;
  }

  // Same tier doesn't require auth
  if (fromTier === toTier) {
    return false;
  }

  // Compare tiers - returns 1 if fromTier > toTier (downgrade)
  const comparison = compareTiers(fromTier, toTier);

  // Require authentication for downgrades (lowering security)
  return comparison > 0;
}

/**
 * Gets the current user name from environment
 * @returns {string} Current user name
 */
function getCurrentUser() {
  return process.env.USER || process.env.USERNAME || 'unknown';
}

/**
 * Logs a tier change attempt
 * @param {string} projectRoot - Project root directory
 * @param {TierChangeAttempt} attempt - The attempt to log
 */
export function logTierChangeAttempt(projectRoot, attempt) {
  const logPath = path.join(projectRoot, TIER_CHANGE_LOG_PATH);

  let log = [];

  // Read existing log if it exists
  if (fs.existsSync(logPath)) {
    try {
      const content = fs.readFileSync(logPath, 'utf8');
      log = JSON.parse(content);
      if (!Array.isArray(log)) {
        log = [];
      }
    } catch {
      log = [];
    }
  }

  // Add new attempt
  log.push(attempt);

  // Keep only last 1000 entries
  if (log.length > 1000) {
    log = log.slice(-1000);
  }

  // Ensure directory exists
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Write log atomically
  const tempPath = logPath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(log, null, 2), 'utf8');
  fs.renameSync(tempPath, logPath);
}

/**
 * Reads the tier change log
 * @param {string} projectRoot - Project root directory
 * @returns {TierChangeAttempt[]} Array of tier change attempts
 */
export function readTierChangeLog(projectRoot) {
  const logPath = path.join(projectRoot, TIER_CHANGE_LOG_PATH);

  if (!fs.existsSync(logPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(logPath, 'utf8');
    const log = JSON.parse(content);
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

/**
 * Displays the challenge-response prompt to the user
 * @param {string} fromTier - Current tier ID
 * @param {string} toTier - Target tier ID
 * @returns {Promise<boolean>} True if user passes authentication
 */
export async function promptTierChangeAuth(fromTier, toTier) {
  const fromTierInfo = getTierById(fromTier);
  const toTierInfo = getTierById(toTier);

  console.log('');
  console.log(chalk.yellow('='.repeat(60)));
  console.log(chalk.yellow.bold('  SECURITY TIER DOWNGRADE DETECTED'));
  console.log(chalk.yellow('='.repeat(60)));
  console.log('');
  console.log(chalk.red(`  You are attempting to LOWER your security tier:`));
  console.log(`    From: ${chalk.cyan(fromTierInfo?.name || fromTier)}`);
  console.log(`    To:   ${chalk.yellow(toTierInfo?.name || toTier)}`);
  console.log('');
  console.log(chalk.dim('  This will reduce your security protections.'));
  console.log(chalk.dim('  Authentication is required to proceed.'));
  console.log('');

  // Step 1: Explicit confirmation
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: chalk.yellow('Are you sure you want to lower your security tier?'),
      default: false
    }
  ]);

  if (!confirmed) {
    return false;
  }

  // Step 2: Challenge-response
  const challenge = generateChallenge();

  console.log('');
  console.log(chalk.cyan('  Challenge-Response Verification'));
  console.log(chalk.dim('  To confirm, you must provide the correct response.'));
  console.log('');
  console.log(`  Challenge code: ${chalk.bold.cyan(challenge.challenge)}`);
  console.log(chalk.dim(`  Compute SHA-256 hash and enter first 8 characters.`));
  console.log(chalk.dim(`  (Hint: echo -n "${challenge.challenge}" | sha256sum | head -c 8)`));
  console.log('');

  const { response } = await inquirer.prompt([
    {
      type: 'input',
      name: 'response',
      message: 'Enter response:',
      validate: (input) => {
        if (!input || input.length !== 8) {
          return 'Response must be exactly 8 characters';
        }
        return true;
      }
    }
  ]);

  const isValid = verifyChallenge(challenge, response);

  if (isValid) {
    console.log(chalk.green('\n  Authentication successful.\n'));
  } else {
    console.log(chalk.red('\n  Authentication failed. Invalid response.\n'));
  }

  return isValid;
}

/**
 * Main authentication function for tier changes
 * Combines all checks and logging
 *
 * @param {string} fromTier - Current tier ID (null if initial config)
 * @param {string} toTier - Target tier ID
 * @param {Object} options - Options
 * @param {string} [options.projectRoot=process.cwd()] - Project root directory
 * @param {boolean} [options.skipPrompt=false] - Skip interactive prompts (for testing)
 * @returns {Promise<{allowed: boolean, reason: string}>} Authentication result
 */
export async function authenticateTierChange(fromTier, toTier, options = {}) {
  const {
    projectRoot = process.cwd(),
    skipPrompt = false
  } = options;

  const user = process.env.USER || process.env.USERNAME || 'unknown';
  const timestamp = new Date().toISOString();

  // Check if authentication is required
  if (!requiresAuthentication(fromTier, toTier)) {
    const attempt = {
      timestamp,
      user,
      fromTier: fromTier || 'none',
      toTier,
      success: true,
      reason: 'No authentication required (upgrade or initial config)'
    };
    logTierChangeAttempt(projectRoot, attempt);

    return { allowed: true, reason: attempt.reason };
  }

  // Authentication is required - prompt user
  let authenticated = false;

  if (skipPrompt) {
    // For testing - authentication always fails when skipping prompt
    authenticated = false;
  } else {
    authenticated = await promptTierChangeAuth(fromTier, toTier);
  }

  const attempt = {
    timestamp,
    user,
    fromTier,
    toTier,
    success: authenticated,
    reason: authenticated
      ? 'User authenticated successfully'
      : 'User failed or cancelled authentication'
  };

  logTierChangeAttempt(projectRoot, attempt);

  return { allowed: authenticated, reason: attempt.reason };
}

/**
 * Displays warning when user attempts to lower security tier
 * @param {string} fromTier - Current tier ID
 * @param {string} toTier - Target tier ID
 */
export function displayDowngradeWarning(fromTier, toTier) {
  const fromTierInfo = getTierById(fromTier);
  const toTierInfo = getTierById(toTier);

  console.log('');
  console.log(chalk.yellow.bold('  WARNING: Security Tier Downgrade'));
  console.log(chalk.dim('  --------------------------------'));
  console.log(`  Current tier: ${chalk.cyan(fromTierInfo?.name || fromTier)}`);
  console.log(`  Target tier:  ${chalk.yellow(toTierInfo?.name || toTier)}`);
  console.log('');
  console.log(chalk.yellow('  Lowering your security tier will:'));
  console.log(chalk.dim('    - Reduce the number of active security validators'));
  console.log(chalk.dim('    - Remove protections that were previously enabled'));
  console.log(chalk.dim('    - Potentially expose your system to additional risks'));
  console.log('');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Tier Change Authentication - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: Generate challenge
  console.log('\n1. generateChallenge():');
  const challenge = generateChallenge();
  console.log(`   Challenge: ${challenge.challenge}`);
  console.log(`   Expected:  ${challenge.expectedResponse}`);

  // Test 2: Verify challenge
  console.log('\n2. verifyChallenge():');
  const validResult = verifyChallenge(challenge, challenge.expectedResponse);
  console.log(`   Valid response: ${validResult}`);
  const invalidResult = verifyChallenge(challenge, 'INVALID1');
  console.log(`   Invalid response: ${invalidResult}`);

  // Test 3: Check authentication requirements
  console.log('\n3. requiresAuthentication():');
  console.log(`   null -> standard: ${requiresAuthentication(null, 'standard')}`);
  console.log(`   standard -> advanced: ${requiresAuthentication('standard', 'advanced')}`);
  console.log(`   advanced -> standard: ${requiresAuthentication('advanced', 'standard')}`);
  console.log(`   enterprise -> essential: ${requiresAuthentication('enterprise', 'essential')}`);

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete.');
}
