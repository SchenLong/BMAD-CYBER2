import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Checks if BMAD framework is installed in the target directory
 * @description Determines if BMAD is installed by checking for the presence
 * of the _bmad directory in the target location.
 * @param {string} [targetDir=process.cwd()] - Directory to check for BMAD installation
 * @returns {boolean} True if _bmad directory exists, false otherwise
 * @example
 * if (isBmadInstalled()) {
 *   console.log('BMAD is already installed');
 * }
 *
 * @example
 * // Check specific directory
 * const isInstalled = isBmadInstalled('/path/to/project');
 */
export function isBmadInstalled(targetDir = process.cwd()) {
  return existsSync(join(targetDir, '_bmad'));
}

/**
 * Gets the installed version of BMAD framework
 * @description Attempts to read the version from the BMAD config file.
 * Note: Version parsing is not yet implemented and currently returns null.
 * @param {string} [targetDir=process.cwd()] - Directory to check for BMAD installation
 * @returns {string|null} Version string if found, null otherwise (currently always null)
 * @example
 * const version = getInstalledVersion();
 * if (version) {
 *   console.log(`Installed version: ${version}`);
 * } else {
 *   console.log('Version not found or BMAD not installed');
 * }
 */
export function getInstalledVersion(targetDir = process.cwd()) {
  const configPath = join(targetDir, '_bmad', 'core', 'config.yaml');
  if (!existsSync(configPath)) {
    return null;
  }
  // Return null for now - version parsing to be implemented
  return null;
}
