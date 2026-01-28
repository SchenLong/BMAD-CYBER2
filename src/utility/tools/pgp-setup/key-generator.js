#!/usr/bin/env node
/**
 * PGP Key Generation Wizard - INST-026
 * Epic 4, Story 1 - PGP Key Generation Interface
 *
 * Implements interactive PGP key generation for signing configuration files.
 * Supports RSA-4096 and Ed25519 algorithms with configurable expiration.
 *
 * Acceptance Criteria:
 * - "Generate a personal PGP key for signing files? (Y/n)" prompt
 * - Key algorithm selection: RSA-4096 (recommended), Ed25519 (modern)
 * - Key expiration selection: 1 year, 2 years (recommended), 5 years, Never
 * - Passphrase prompt with confirmation (password masking)
 * - Uses name and email from earlier installation steps
 * - Progress spinner during key generation
 * - Displays key fingerprint on success
 *
 * @module pgp-setup/key-generator
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Supported key algorithms for generation
 * @type {Object}
 */
export const KEY_ALGORITHMS = {
  RSA4096: {
    id: 'rsa4096',
    name: 'RSA-4096',
    type: 'RSA',
    length: 4096,
    description: 'Traditional algorithm, widely compatible, recommended for most users',
    recommended: true
  },
  ED25519: {
    id: 'ed25519',
    name: 'Ed25519',
    type: 'EDDSA',
    length: null,
    description: 'Modern elliptic curve algorithm, smaller keys, faster operations',
    recommended: false
  }
};

// Alias for backward compatibility
export const KEY_TYPES = KEY_ALGORITHMS;

/**
 * Key expiration options matching acceptance criteria
 * @type {Array}
 */
export const EXPIRATION_OPTIONS = [
  { id: '1y', value: '1y', label: '1 year', description: 'Expires in 1 year', recommended: false },
  { id: '2y', value: '2y', label: '2 years', description: 'Expires in 2 years', recommended: true },
  { id: '5y', value: '5y', label: '5 years', description: 'Expires in 5 years', recommended: false },
  { id: 'never', value: '0', label: 'Never', description: 'Key will never expire', recommended: false }
];

/**
 * Validates email format
 *
 * @param {string} email - Email to validate
 * @returns {boolean|string} True if valid, error message if not
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return true;
}

/**
 * Validates name format
 *
 * @param {string} name - Name to validate
 * @returns {boolean|string} True if valid, error message if not
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 100) {
    return 'Name must be less than 100 characters';
  }
  return true;
}

/**
 * Validates passphrase strength
 *
 * @param {string} passphrase - Passphrase to validate
 * @returns {boolean|string} True if valid, error message if not
 */
export function validatePassphrase(passphrase) {
  if (!passphrase || passphrase.length === 0) {
    return 'Passphrase is required';
  }
  if (passphrase.length < 8) {
    return 'Passphrase should be at least 8 characters';
  }
  return true;
}

/**
 * Gets algorithm by ID
 * @param {string} id - Algorithm ID (rsa4096, ed25519, RSA4096, ED25519)
 * @returns {Object|null} Algorithm or null if not found
 */
export function getAlgorithmById(id) {
  const normalizedId = id.toUpperCase();
  return KEY_ALGORITHMS[normalizedId] || null;
}

/**
 * Gets expiration option by ID
 * @param {string} id - Expiration ID (1y, 2y, 5y, never)
 * @returns {Object|null} Expiration option or null if not found
 */
export function getExpirationById(id) {
  return EXPIRATION_OPTIONS.find(e => e.id === id || e.value === id) || null;
}

/**
 * Creates a spinner-like progress indicator
 * @param {string} text - Initial text to display
 * @returns {Object} Spinner control object
 */
export function createSpinner(text) {
  const frames = ['|', '/', '-', '\\'];
  let i = 0;
  let interval = null;
  let currentText = text;

  return {
    start() {
      process.stdout.write('\n');
      interval = setInterval(() => {
        process.stdout.clearLine?.(0);
        process.stdout.cursorTo?.(0);
        process.stdout.write(`${chalk.cyan(frames[i])} ${currentText}`);
        i = (i + 1) % frames.length;
      }, 100);
      return this;
    },
    text(newText) {
      currentText = newText;
      return this;
    },
    succeed(text) {
      if (interval) clearInterval(interval);
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
      console.log(`${chalk.green('+')} ${text || currentText}`);
      return this;
    },
    fail(text) {
      if (interval) clearInterval(interval);
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
      console.log(`${chalk.red('x')} ${text || currentText}`);
      return this;
    },
    stop() {
      if (interval) clearInterval(interval);
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
      return this;
    }
  };
}

/**
 * Prompts user to confirm PGP key generation (matching acceptance criteria)
 * @returns {Promise<boolean>} True if user wants to generate key
 */
export async function promptForKeyGeneration() {
  console.log('');
  console.log(chalk.bold('PGP Key Generation'));
  console.log(chalk.dim('Generate a personal PGP key for signing configuration files'));
  console.log('');

  const { generate } = await inquirer.prompt([{
    type: 'confirm',
    name: 'generate',
    message: 'Generate a personal PGP key for signing files?',
    default: true
  }]);

  return generate;
}

/**
 * Prompts user to select key algorithm (matching acceptance criteria)
 * @returns {Promise<string>} Selected algorithm key (RSA4096 or ED25519)
 */
export async function promptForAlgorithm() {
  console.log('');
  console.log(chalk.bold('Select Key Algorithm:'));
  console.log(chalk.dim('Choose the cryptographic algorithm for your key'));
  console.log('');

  const choices = Object.entries(KEY_ALGORITHMS).map(([key, value]) => {
    let name = chalk.bold(value.name);
    if (value.recommended) {
      name += chalk.green(' (recommended)');
    } else {
      name += chalk.cyan(' (modern)');
    }
    name += '\n    ' + chalk.dim(value.description);
    return { name, value: key, short: value.name };
  });

  const { algorithm } = await inquirer.prompt([{
    type: 'list',
    name: 'algorithm',
    message: 'Choose algorithm:',
    choices,
    default: 'RSA4096',
    pageSize: 10,
    loop: false
  }]);

  return algorithm;
}

/**
 * Prompts user to select key expiration (matching acceptance criteria)
 * @returns {Promise<string>} Selected expiration value
 */
export async function promptForExpiration() {
  console.log('');
  console.log(chalk.bold('Select Key Expiration:'));
  console.log(chalk.dim('How long should this key remain valid?'));
  console.log('');

  const choices = EXPIRATION_OPTIONS.map(opt => {
    let name = chalk.bold(opt.label);
    if (opt.recommended) {
      name += chalk.green(' (recommended)');
    }
    if (opt.id === 'never') {
      name += chalk.yellow(' - Warning: Key will never expire');
    }
    return { name, value: opt.value, short: opt.label };
  });

  const defaultIndex = EXPIRATION_OPTIONS.findIndex(e => e.recommended);

  const { expiration } = await inquirer.prompt([{
    type: 'list',
    name: 'expiration',
    message: 'Choose expiration:',
    choices,
    default: defaultIndex >= 0 ? defaultIndex : 1,
    pageSize: 10,
    loop: false
  }]);

  return expiration;
}

/**
 * Prompts user for passphrase with confirmation (password masking)
 * @returns {Promise<string>} Entered passphrase
 */
export async function promptForPassphrase() {
  console.log('');
  console.log(chalk.bold('Set Key Passphrase:'));
  console.log(chalk.dim('Enter a strong passphrase to protect your private key'));
  console.log(chalk.dim('Minimum 8 characters recommended'));
  console.log('');

  const { passphrase } = await inquirer.prompt([{
    type: 'password',
    name: 'passphrase',
    message: 'Enter passphrase:',
    mask: '*',
    validate: validatePassphrase
  }]);

  await inquirer.prompt([{
    type: 'password',
    name: 'confirmPassphrase',
    message: 'Confirm passphrase:',
    mask: '*',
    validate: (input) => input !== passphrase ? 'Passphrases do not match' : true
  }]);

  return passphrase;
}

/**
 * Prompts user for key generation parameters (legacy interface)
 *
 * @param {Object} [defaults] - Default values
 * @returns {Promise<Object>} User-provided parameters
 */
export async function promptKeyParameters(defaults = {}) {
  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('                    PGP Key Generation'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════════\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your full name:',
      default: defaults.name || process.env.USER || '',
      validate: validateName
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email address:',
      default: defaults.email || '',
      validate: validateEmail
    },
    {
      type: 'list',
      name: 'keyType',
      message: 'Key type:',
      choices: Object.entries(KEY_ALGORITHMS).map(([key, value]) => ({
        name: `${value.name} - ${value.description}${value.recommended ? chalk.green(' (Recommended)') : ''}`,
        value: key,
        short: value.name
      })),
      default: 'RSA4096'
    },
    {
      type: 'list',
      name: 'expiration',
      message: 'Key expiration:',
      choices: EXPIRATION_OPTIONS.map(opt => ({
        name: `${opt.label}${opt.recommended ? chalk.green(' (Recommended)') : ''} - ${opt.description}`,
        value: opt.value,
        short: opt.label
      })),
      default: '2y'
    },
    {
      type: 'password',
      name: 'passphrase',
      message: 'Passphrase (for key protection):',
      mask: '*',
      validate: validatePassphrase
    },
    {
      type: 'password',
      name: 'passphraseConfirm',
      message: 'Confirm passphrase:',
      mask: '*',
      validate: (input, answers) => {
        if (input !== answers.passphrase) {
          return 'Passphrases do not match';
        }
        return true;
      }
    }
  ]);

  return {
    name: answers.name.trim(),
    email: answers.email.trim(),
    keyType: KEY_ALGORITHMS[answers.keyType],
    keyTypeCode: answers.keyType,
    expiration: answers.expiration,
    passphrase: answers.passphrase
  };
}

/**
 * Generates GPG batch file content for unattended key generation
 *
 * @param {Object} params - Key parameters
 * @returns {string} Batch file content
 */
export function generateBatchContent(params) {
  const { name, email, keyType, expiration, passphrase } = params;

  const lines = [
    '%echo Generating GPG key pair',
    `Key-Type: ${keyType.type}`,
  ];

  if (keyType.length) {
    lines.push(`Key-Length: ${keyType.length}`);
  }

  if (keyType.type === 'RSA') {
    lines.push('Subkey-Type: RSA');
    lines.push(`Subkey-Length: ${keyType.length}`);
  } else if (keyType.type === 'EDDSA') {
    lines.push('Key-Curve: ed25519');
    lines.push('Subkey-Type: ECDH');
    lines.push('Subkey-Curve: cv25519');
  }

  lines.push('Key-Usage: sign');
  lines.push('Subkey-Usage: encrypt');
  lines.push(`Name-Real: ${name}`);
  lines.push(`Name-Email: ${email}`);
  lines.push(`Expire-Date: ${expiration}`);
  lines.push(`Passphrase: ${passphrase}`);
  lines.push('%commit');
  lines.push('%echo Key generation complete');

  return lines.join('\n');
}

// Alias for backward compatibility
export const buildBatchScript = generateBatchContent;

/**
 * Generates a GPG key pair using the provided parameters
 * Uses spinner for progress indication
 *
 * @param {Object} params - Key parameters from promptKeyParameters
 * @param {Object} [options] - Generation options
 * @returns {Promise<Object>} Generation result
 */
export async function generateKey(params, options = {}) {
  const { timeout = 120000 } = options;
  const batchContent = generateBatchContent(params);
  const spinner = createSpinner('Generating PGP key...');

  spinner.start();

  return new Promise((resolve, reject) => {
    const gpg = spawn('gpg', ['--batch', '--gen-key', '--pinentry-mode', 'loopback'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    gpg.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    gpg.stderr.on('data', (data) => {
      stderr += data.toString();
      // Update spinner with progress
      if (stderr.includes('generating')) {
        spinner.text('Generating key material...');
      }
      if (stderr.includes('revocation')) {
        spinner.text('Creating revocation certificate...');
      }
    });

    gpg.on('close', (code) => {
      if (code === 0 || stderr.includes('complete')) {
        spinner.succeed('PGP key generated successfully!');
        resolve({
          success: true,
          generated: true,
          name: params.name,
          email: params.email,
          keyType: params.keyType?.name || params.keyType,
          algorithm: params.keyTypeCode,
          expiration: params.expiration,
          output: stderr
        });
      } else {
        spinner.fail('Key generation failed');
        reject(new Error(stderr || 'Key generation failed'));
      }
    });

    gpg.on('error', (err) => {
      spinner.fail(`GPG command failed: ${err.message}`);
      reject(err);
    });

    const timeoutId = setTimeout(() => {
      gpg.kill();
      spinner.fail('Key generation timed out');
      reject(new Error('Key generation timed out'));
    }, timeout);

    gpg.on('close', () => clearTimeout(timeoutId));

    gpg.stdin.write(batchContent);
    gpg.stdin.end();
  });
}

/**
 * Extracts fingerprint from GPG output or by listing keys
 *
 * @param {string} email - Email to search for
 * @returns {string|null} Key fingerprint or null if not found
 */
export function extractFingerprint(email) {
  try {
    const output = execSync(`gpg --list-keys --with-colons "${email}" 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 10000
    });

    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('fpr:')) {
        const parts = line.split(':');
        if (parts[9]) {
          return parts[9];
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Gets the key ID of the most recently generated key for an email
 *
 * @param {string} email - Email to search for
 * @returns {string|null} Key ID or null if not found
 */
export function getKeyIdByEmail(email) {
  try {
    const result = execSync(`gpg --list-keys --keyid-format long "${email}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const match = result.match(/([A-F0-9]{16,40})/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Checks if a key already exists for the given email
 *
 * @param {string} email - Email to check
 * @returns {{exists: boolean, fingerprint: string|null}} Result
 */
export async function checkExistingKey(email) {
  const fingerprint = extractFingerprint(email);
  return {
    exists: fingerprint !== null,
    fingerprint
  };
}

/**
 * Displays the key fingerprint in a formatted manner
 *
 * @param {string} fingerprint - Key fingerprint
 */
export function displayFingerprint(fingerprint) {
  console.log('');
  console.log(chalk.green('='.repeat(60)));
  console.log(chalk.green.bold('  PGP KEY GENERATED SUCCESSFULLY'));
  console.log(chalk.green('='.repeat(60)));
  console.log('');
  console.log(chalk.bold('  Key Fingerprint:'));
  console.log('');

  // Format fingerprint in groups of 4
  const formatted = fingerprint.match(/.{1,4}/g)?.join(' ') || fingerprint;
  console.log(chalk.cyan(`    ${formatted}`));

  console.log('');
  console.log(chalk.dim('  Store this fingerprint safely. You will need it to verify'));
  console.log(chalk.dim('  signatures and share your public key with others.'));
  console.log('');
  console.log(chalk.green('='.repeat(60)));
  console.log('');
}

/**
 * Main interactive key generation flow (INST-026 compliant)
 * Uses name and email from userProfile (from earlier installation steps)
 *
 * @param {Object} userProfile - User profile with name and email
 * @param {string} userProfile.name - User's full name
 * @param {string} userProfile.email - User's email address
 * @returns {Promise<Object>} Generation result
 */
export async function runKeyGeneration(userProfile = {}) {
  try {
    // Support both new interface (userProfile with name/email) and legacy (defaults)
    const hasProfile = userProfile.name && userProfile.email;

    // Step 1: Ask if user wants to generate a key
    const wantsKey = await promptForKeyGeneration();

    if (!wantsKey) {
      console.log(chalk.dim('\nSkipping PGP key generation.'));
      return { success: false, generated: false, skipped: true };
    }

    let name, email;

    if (hasProfile) {
      // Use name/email from user profile (from earlier installation steps)
      name = userProfile.name;
      email = userProfile.email;
    } else {
      // Prompt for name and email if not provided
      const nameAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Your full name:',
        default: userProfile.name || process.env.USER || '',
        validate: validateName
      }]);
      name = nameAnswer.name.trim();

      const emailAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'email',
        message: 'Your email address:',
        default: userProfile.email || '',
        validate: validateEmail
      }]);
      email = emailAnswer.email.trim();
    }

    // Step 2: Select algorithm
    const algorithmKey = await promptForAlgorithm();
    const selectedAlgo = KEY_ALGORITHMS[algorithmKey];
    console.log(chalk.dim(`\nSelected: ${selectedAlgo.name}`));

    // Step 3: Select expiration
    const expiration = await promptForExpiration();
    const selectedExp = getExpirationById(expiration) || { label: expiration };
    console.log(chalk.dim(`\nExpiration: ${selectedExp.label}`));

    // Step 4: Enter passphrase
    const passphrase = await promptForPassphrase();

    // Step 5: Show summary before generation
    console.log('');
    console.log(chalk.cyan('-'.repeat(50)));
    console.log(chalk.bold('Key Generation Summary:'));
    console.log(`  Name:       ${name}`);
    console.log(`  Email:      ${email}`);
    console.log(`  Algorithm:  ${selectedAlgo.name}`);
    console.log(`  Expiration: ${selectedExp.label}`);
    console.log(chalk.cyan('-'.repeat(50)));

    // Step 6: Confirm generation
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Generate key with these settings?',
      default: true
    }]);

    if (!confirm) {
      console.log(chalk.dim('\nKey generation cancelled.'));
      return { success: false, generated: false, cancelled: true };
    }

    // Step 7: Generate key (with spinner progress)
    const params = {
      name,
      email,
      keyType: selectedAlgo,
      keyTypeCode: algorithmKey,
      expiration,
      passphrase
    };

    const result = await generateKey(params);

    // Step 8: Extract and display fingerprint
    const fingerprint = extractFingerprint(email);
    if (fingerprint) {
      result.keyId = fingerprint;
      result.fingerprint = fingerprint;
      displayFingerprint(fingerprint);
    } else {
      console.log(chalk.dim('\nYour new key pair is ready to use.'));
      console.log(chalk.dim('Run "gpg --list-keys" to view your keys.'));
    }

    console.log(chalk.dim('Run the key export step to backup your keys.\n'));

    return result;
  } catch (error) {
    console.error(chalk.red('\nKey generation failed:'), error.message);
    return { success: false, generated: false, error: error.message };
  }
}

// ESM Entry point detection
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('PGP Key Generator - Standalone Test\n');
  runKeyGeneration()
    .then(result => {
      if (result.success) {
        console.log('\nKey generation completed.');
      }
    })
    .catch(error => console.error('Error:', error.message));
}
