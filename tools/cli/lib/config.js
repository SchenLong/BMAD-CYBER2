/**
 * Configuration constants for the BMAD installer
 * @description Contains version information, GitHub repository details,
 * and other configuration values used throughout the installer.
 * @type {Object}
 * @property {string} VERSION - Current version of the installer
 * @property {string} GITHUB_OWNER - GitHub organization/owner name
 * @property {string} GITHUB_REPO - GitHub repository name
 * @property {number} MIN_NODE_VERSION - Minimum required Node.js major version
 * @property {string} TEMP_DIR_PREFIX - Prefix for temporary directory names
 * @example
 * import { CONFIG } from './config.js';
 * console.log(`Installing from ${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}`);
 */
export const CONFIG = {
  VERSION: '4.7.0',
  GITHUB_OWNER: 'SchenLong',
  GITHUB_REPO: 'BMAD-CYBERSEC',
  MIN_NODE_VERSION: 20,
  TEMP_DIR_PREFIX: 'bmad-cyber-install'
};
