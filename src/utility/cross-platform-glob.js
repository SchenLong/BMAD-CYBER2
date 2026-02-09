import { glob as baseGlob } from 'glob';

/**
 * Cross-platform glob that normalizes path separators
 * @param {string} pattern - Glob pattern
 * @param {object} options - Glob options
 * @returns {Promise<string[]>} Matching file paths
 */
export async function glob(pattern, options = {}) {
  // Normalize pattern to forward slashes
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Ensure Windows paths work correctly
  const results = await baseGlob(normalizedPattern, {
    ...options,
    windowsPathsNoEscape: true
  });

  return results;
}

/**
 * Normalize a file path for cross-platform use
 * @param {string} filePath - Path to normalize
 * @returns {string} Normalized path with forward slashes
 */
export function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}
