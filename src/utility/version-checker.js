/**
 * Version Checker with Update Notification
 *
 * Compares the local package version against the npm registry
 * for the published `bmad-cybersec` package. Caches results for
 * 24 hours to avoid excessive network calls.
 *
 * @module utility/version-checker
 * @version 1.0.0
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import semver from 'semver';

// ============================================================================
// Constants
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Mutable config object. Functions read from this object so that
 * tests can override paths without needing to patch module-level
 * constants. In production the defaults are never changed.
 */
const _config = {
  /** The npm package name to check against the registry. */
  NPM_PACKAGE_NAME: 'bmad-cybersec',

  /** npm registry URL for fetching package metadata. */
  NPM_REGISTRY_URL: 'https://registry.npmjs.org/bmad-cybersec/latest',

  /** How long to cache results (24 hours in milliseconds). */
  CACHE_TTL_MS: 24 * 60 * 60 * 1000,

  /** Network request timeout in milliseconds. */
  FETCH_TIMEOUT_MS: 5000,

  /** Path to the cache file in the project root. */
  CACHE_FILE_PATH: resolve(__dirname, '../../.version-check-cache'),

  /** Path to the root package.json. */
  PACKAGE_JSON_PATH: resolve(__dirname, '../../package.json'),
};

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Read the current version from the root package.json.
 * @returns {string} The current version string.
 */
function getCurrentVersion() {
  const raw = readFileSync(_config.PACKAGE_JSON_PATH, 'utf8');
  const pkg = JSON.parse(raw);
  return pkg.version;
}

/**
 * Read the cached version check result.
 * @returns {{ latest: string, checkedAt: number } | null}
 */
function readCache() {
  try {
    if (!existsSync(_config.CACHE_FILE_PATH)) {
      return null;
    }
    const raw = readFileSync(_config.CACHE_FILE_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !data.latest || !data.checkedAt) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Write a version check result to the cache file.
 * @param {string} latest - The latest version from npm.
 */
function writeCache(latest) {
  try {
    const data = JSON.stringify({ latest, checkedAt: Date.now() }, null, 2);
    writeFileSync(_config.CACHE_FILE_PATH, data, 'utf8');
  } catch {
    // Silently ignore cache write failures
  }
}

/**
 * Check whether the cache is still valid (within TTL).
 * @param {{ latest: string, checkedAt: number }} cache
 * @returns {boolean}
 */
function isCacheValid(cache) {
  if (!cache || !cache.checkedAt) {
    return false;
  }
  return (Date.now() - cache.checkedAt) < _config.CACHE_TTL_MS;
}

/**
 * Fetch the latest version from the npm registry.
 * Uses AbortController for a 5-second timeout.
 * @returns {Promise<string|null>} The latest version, or null on failure.
 */
async function fetchLatestVersion() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), _config.FETCH_TIMEOUT_MS);

    const response = await fetch(_config.NPM_REGISTRY_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.version || null;
  } catch {
    // Network errors, timeouts, etc. - fail silently
    return null;
  }
}

/**
 * Determine the type of update available.
 * @param {string} current - Current version.
 * @param {string} latest - Latest version.
 * @returns {'major' | 'minor' | 'patch' | 'none'}
 */
function getUpdateType(current, latest) {
  if (!semver.valid(current) || !semver.valid(latest)) {
    return 'none';
  }
  if (semver.major(latest) > semver.major(current)) {
    return 'major';
  }
  if (semver.minor(latest) > semver.minor(current)) {
    return 'minor';
  }
  if (semver.patch(latest) > semver.patch(current)) {
    return 'patch';
  }
  return 'none';
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check for available updates by comparing the local version
 * against the npm registry. Uses a 24-hour cache to limit
 * network requests.
 *
 * This function is designed to be non-blocking and will never
 * throw on network errors.
 *
 * @returns {Promise<{ current: string, latest: string|null, updateAvailable: boolean, updateType: string }>}
 */
export async function checkVersion() {
  // Suppress in CI environments (FAIL-PV6-01-010-4)
  if (process.env.CI) {
    const current = getCurrentVersion();
    return { current, latest: null, updateAvailable: false, updateType: 'none' };
  }

  // Suppress when explicitly disabled (FAIL-PV6-01-010-5)
  if (process.env.BMAD_NO_UPDATE_CHECK) {
    const current = getCurrentVersion();
    return { current, latest: null, updateAvailable: false, updateType: 'none' };
  }

  const current = getCurrentVersion();

  // Check cache first
  const cache = readCache();
  if (cache && isCacheValid(cache)) {
    const updateAvailable = semver.gt(cache.latest, current);
    const updateType = getUpdateType(current, cache.latest);
    return { current, latest: cache.latest, updateAvailable, updateType };
  }

  // Fetch from npm registry
  const latest = await fetchLatestVersion();
  if (!latest) {
    return { current, latest: null, updateAvailable: false, updateType: 'none' };
  }

  // Cache the result
  writeCache(latest);

  const updateAvailable = semver.gt(latest, current);
  const updateType = getUpdateType(current, latest);
  return { current, latest, updateAvailable, updateType };
}

/**
 * Display a styled update notification box in the terminal.
 * Only displays if an update is available.
 *
 * Uses dynamic import for chalk (ESM-only).
 *
 * @param {{ current: string, latest: string|null, updateAvailable: boolean, updateType: string }} info
 */
export async function displayUpdateNotice(info) {
  if (!info || !info.updateAvailable || !info.latest) {
    return;
  }

  let chalk;
  try {
    chalk = (await import('chalk')).default;
  } catch {
    // If chalk is unavailable, fall back to plain text
    chalk = null;
  }

  const updateCommand = `npm install -g ${_config.NPM_PACKAGE_NAME}@latest`;

  if (chalk) {
    const typeColor =
      info.updateType === 'major' ? chalk.red :
      info.updateType === 'minor' ? chalk.yellow :
      chalk.green;

    const border = chalk.dim('+-------------------------------------------------+');
    const empty  = chalk.dim('|') + ' '.repeat(49) + chalk.dim('|');

    const title = `  Update available: ${chalk.dim(info.current)} -> ${typeColor(info.latest)}`;
    const type  = `  Type: ${typeColor(info.updateType)} update`;
    const cmd   = `  Run: ${chalk.cyan(updateCommand)}`;

    // Pad lines to fit inside the box
    const padLine = (text, rawLen) => {
      const padding = Math.max(0, 49 - rawLen);
      return chalk.dim('|') + text + ' '.repeat(padding) + chalk.dim('|');
    };

    console.log('');
    console.log(border);
    console.log(empty);
    console.log(padLine(title, `  Update available: ${info.current} -> ${info.latest}`.length));
    console.log(padLine(type, `  Type: ${info.updateType} update`.length));
    console.log(padLine(cmd, `  Run: ${updateCommand}`.length));
    console.log(empty);
    console.log(border);
    console.log('');
  } else {
    // Plain fallback without chalk
    console.log('');
    console.log('+-------------------------------------------------+');
    console.log('|                                                 |');
    console.log(`|  Update available: ${info.current} -> ${info.latest}`.padEnd(50) + '|');
    console.log(`|  Type: ${info.updateType} update`.padEnd(50) + '|');
    console.log(`|  Run: ${updateCommand}`.padEnd(50) + '|');
    console.log('|                                                 |');
    console.log('+-------------------------------------------------+');
    console.log('');
  }
}

// ============================================================================
// Exports for testing
// ============================================================================

export const _internals = {
  getCurrentVersion,
  readCache,
  writeCache,
  isCacheValid,
  fetchLatestVersion,
  getUpdateType,
  /** Mutable config - tests can override paths here. */
  _config,
};

export default { checkVersion, displayUpdateNotice, _internals };
