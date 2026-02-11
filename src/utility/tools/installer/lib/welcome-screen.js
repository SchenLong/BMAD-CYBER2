/**
 * Welcome Screen - INST-030
 * Epic Installation Wizard Enhancement - Welcome Screen and User Profile
 *
 * Provides a welcoming introduction to the installation process with
 * user profile collection for use in token generation and signing.
 *
 * @module installer/lib/welcome-screen
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import { select, text } from '../../../cli/prompts.js';
import chalk from 'chalk';

import { VALID_ROLES } from '../../module-selector/role-recommendations.js';

/**
 * ASCII art banner for BMAD-CYBER
 * @type {string}
 */
export const CYBER_BANNER = `
 ██████╗██╗   ██╗██████╗ ███████╗██████╗
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
╚██████╗   ██║   ██████╔╝███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
`;

/**
 * Welcome message displayed after the banner
 * @type {string}
 */
export const WELCOME_MESSAGE = "Welcome to BMAD-CYBER! Let's set up your environment.";

/**
 * @typedef {Object} UserProfile
 * @property {string} name - User's name (required)
 * @property {string} email - User's email (optional)
 * @property {string} role - User's primary role
 * @property {string} organization - User's organization/team (optional)
 */

/**
 * Formats a role identifier into a human-readable display name
 * Converts snake_case to Title Case
 *
 * @param {string} role - Role identifier (e.g., 'security_lead')
 * @returns {string} Formatted display name (e.g., 'Security Lead')
 * @example
 * formatRoleName('security_lead'); // Returns: 'Security Lead'
 * formatRoleName('admin');          // Returns: 'Admin'
 */
export function formatRoleName(role) {
  if (!role || typeof role !== 'string') {
    return '';
  }

  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validates an email address format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateEmail(email) {
  // Empty is allowed (optional field)
  if (!email || email.trim() === '') {
    return true;
  }

  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailPattern.test(email.trim())) {
    return true;
  }

  return 'Please enter a valid email address or leave empty';
}

/**
 * Validates a user name
 *
 * @param {string} name - Name to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters';
  }

  return true;
}

/**
 * Displays the welcome screen with ASCII banner and welcome message
 *
 * @param {Object} [options={}] - Display options
 * @param {boolean} [options.clearConsole=true] - Whether to clear the console before displaying
 * @returns {void}
 */
export function displayWelcome(options = {}) {
  const { clearConsole = true } = options;

  if (clearConsole) {
    console.clear();
  }

  // Display banner in cyan
  console.log(chalk.cyan(CYBER_BANNER));

  // Display welcome message
  console.log(chalk.bold.white(WELCOME_MESSAGE));
  console.log();
}

/**
 * Prompts the user for their name
 *
 * @returns {Promise<string>} User's name
 */
export async function promptForUserName() {
  const name = await text({
    message: 'What is your name?',
    validate: (value) => {
      const result = validateName(value);
      return result === true ? undefined : result;
    }
  });

  return name.trim();
}

/**
 * Prompts the user for their email address (optional)
 *
 * @returns {Promise<string>} User's email or empty string
 */
export async function promptForEmail() {
  const email = await text({
    message: 'What is your email address? (optional)',
    validate: (value) => {
      const result = validateEmail(value);
      return result === true ? undefined : result;
    },
    default: ''
  });

  return email.trim();
}

/**
 * Builds the role choices for the inquirer prompt
 *
 * @returns {Array<{name: string, value: string, short: string}>} Array of role choices
 */
export function buildRoleChoices() {
  return VALID_ROLES.map(role => ({
    name: formatRoleName(role),
    value: role,
    short: formatRoleName(role)
  }));
}

/**
 * Prompts the user to select their primary role
 *
 * @returns {Promise<string>} Selected role identifier
 */
export async function promptForRole() {
  const choices = buildRoleChoices();

  const role = await select({
    message: 'What is your primary role?',
    choices
  });

  return role;
}

/**
 * Prompts the user for their organization/team (optional)
 *
 * @returns {Promise<string>} Organization name or empty string
 */
export async function promptForOrganization() {
  const organization = await text({
    message: 'What is your organization/team? (optional)',
    default: ''
  });

  return organization.trim();
}

/**
 * Collects the complete user profile through a series of prompts
 *
 * Chains all prompts together to collect:
 * - Name (required)
 * - Email (optional)
 * - Role (required, single select)
 * - Organization (optional)
 *
 * @param {Object} [options={}] - Collection options
 * @param {boolean} [options.clearConsole=true] - Whether to clear console before welcome
 * @param {boolean} [options.showWelcome=true] - Whether to display welcome screen
 * @returns {Promise<UserProfile>} Complete user profile object
 * @example
 * const profile = await collectUserProfile();
 * console.log(profile);
 * // { name: 'John Doe', email: 'john@example.com', role: 'developer', organization: 'ACME Corp' }
 */
export async function collectUserProfile(options = {}) {
  const { clearConsole = true, showWelcome = true } = options;

  // Display welcome screen
  if (showWelcome) {
    displayWelcome({ clearConsole });
  }

  // Collect profile information
  const name = await promptForUserName();
  const email = await promptForEmail();
  const role = await promptForRole();
  const organization = await promptForOrganization();

  // Build and return profile object
  const profile = {
    name,
    email,
    role,
    organization
  };

  return profile;
}

/**
 * Displays a summary of the collected user profile
 *
 * @param {UserProfile} profile - User profile to display
 * @returns {void}
 */
export function displayProfileSummary(profile) {
  console.log();
  console.log(chalk.bold('Profile Summary:'));
  console.log(chalk.dim('-'.repeat(40)));
  console.log('  ' + chalk.cyan('Name:') + ' ' + profile.name);

  if (profile.email) {
    console.log('  ' + chalk.cyan('Email:') + ' ' + profile.email);
  }

  console.log('  ' + chalk.cyan('Role:') + ' ' + formatRoleName(profile.role));

  if (profile.organization) {
    console.log('  ' + chalk.cyan('Organization:') + ' ' + profile.organization);
  }

  console.log(chalk.dim('-'.repeat(40)));
  console.log();
}

// ESM Entry point detection for standalone testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Welcome Screen - Standalone Test\n');

  collectUserProfile()
    .then(profile => {
      console.log('\nCollected Profile:');
      console.log(JSON.stringify(profile, null, 2));
      displayProfileSummary(profile);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
