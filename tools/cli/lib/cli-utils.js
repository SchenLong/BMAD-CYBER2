import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Checks if BMAD framework is installed in the target directory
 * @description Determines if BMAD is installed by checking for the presence
 * of the _bmad directory or src/ module directories in the target location.
 * Supports both pre-migration (_bmad/) and post-migration (src/) layouts.
 * @param {string} [targetDir=process.cwd()] - Directory to check for BMAD installation
 * @returns {boolean} True if BMAD directories exist, false otherwise
 */
export function isBmadInstalled(targetDir = process.cwd()) {
  return existsSync(join(targetDir, '_bmad')) ||
    existsSync(join(targetDir, 'src', 'core', 'module.yaml'));
}

/**
 * Gets the installed version of BMAD framework
 * @description Reads the version from _bmad/_config/manifest.yaml (installation.version)
 * or falls back to package.json bmadVersion field.
 * @param {string} [targetDir=process.cwd()] - Directory to check for BMAD installation
 * @returns {string|null} Version string if found, null otherwise
 */
export function getInstalledVersion(targetDir = process.cwd()) {
  // Try manifest.yaml first (most reliable)
  const manifestPath = join(targetDir, '_bmad', '_config', 'manifest.yaml');
  if (existsSync(manifestPath)) {
    try {
      const content = readFileSync(manifestPath, 'utf-8');
      const match = content.match(/^\s*version:\s*(.+)$/m);
      if (match) {
        return match[1].trim();
      }
    } catch {
      // Fall through to next method
    }
  }

  // Try package.json bmadVersion field
  const pkgPath = join(targetDir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.bmadVersion) {
        return pkg.bmadVersion;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * Gets list of installed BMAD modules
 * @description Scans both src/ and _bmad/ directories for module.yaml files.
 * Returns module codes found. src/ takes priority (post-migration layout).
 * @param {string} [targetDir=process.cwd()] - Directory to scan
 * @returns {string[]} Array of module code strings
 */
export function getInstalledModules(targetDir = process.cwd()) {
  const moduleNames = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
  const found = [];

  for (const mod of moduleNames) {
    // Check src/ first (post-migration), then _bmad/ (legacy)
    if (existsSync(join(targetDir, 'src', mod, 'module.yaml')) ||
        existsSync(join(targetDir, 'src', mod, 'agents')) ||
        existsSync(join(targetDir, '_bmad', mod, 'module.yaml')) ||
        existsSync(join(targetDir, '_bmad', mod, 'agents'))) {
      found.push(mod);
    }
  }

  return found;
}
