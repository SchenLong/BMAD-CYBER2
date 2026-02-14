/**
 * BMAD Validators - Path Utilities
 * =================================
 * Common path resolution and validation utilities,
 * including sanitization to prevent absolute path leaks in reports.
 */

import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';

/** Placeholder used in sanitized output for paths inside the project. */
export const PROJECT_ROOT_PLACEHOLDER = '{project-root}';

/** Placeholder used in sanitized output for paths outside the project. */
export const EXTERNAL_PLACEHOLDER = '{external}';

/**
 * Get the project directory from environment or current working directory.
 */
export function getProjectDir(): string {
  return process.env['CLAUDE_PROJECT_DIR'] || process.cwd();
}

/**
 * Resolve a path to its absolute, canonical form.
 *
 * Handles:
 * - ~ expansion to home directory
 * - Relative paths resolved against cwd
 * - Symlink resolution
 *
 * @param inputPath - The path to resolve
 * @param cwd - Current working directory for relative paths
 * @returns Absolute, resolved path
 */
export function resolvePath(inputPath: string, cwd: string): string {
  if (!inputPath) {
    return '';
  }

  let resolvedPath = inputPath;

  // Expand ~ to home directory
  if (resolvedPath.startsWith('~')) {
    resolvedPath = path.join(os.homedir(), resolvedPath.slice(1));
  }

  // If relative, make it absolute based on cwd
  if (!path.isAbsolute(resolvedPath)) {
    resolvedPath = path.join(cwd, resolvedPath);
  }

  // Resolve symlinks and normalize
  try {
    return fs.realpathSync(resolvedPath);
  } catch {
    // If realpath fails (file doesn't exist), just normalize
    return path.resolve(resolvedPath);
  }
}

/**
 * Check if a path is within the repository.
 *
 * @param inputPath - The path to check
 * @param cwd - Current working directory for relative paths
 * @param projectDir - The project/repository root directory
 * @returns true if the path is within the repository
 */
export function isPathInRepo(
  inputPath: string,
  cwd: string,
  projectDir: string = getProjectDir()
): boolean {
  if (!inputPath) {
    // No path means we can't check, allow by default
    return true;
  }

  const resolved = resolvePath(inputPath, cwd);
  let repoResolved: string;

  try {
    repoResolved = fs.realpathSync(projectDir);
  } catch {
    repoResolved = path.resolve(projectDir);
  }

  // Also resolve the projectDir without realpath for comparison with non-existent files
  const repoResolvedNoLink = path.resolve(projectDir);

  // Check if resolved path starts with repo path (with or without symlink resolution)
  // Must be either equal to repo or within repo (with path separator)
  return (
    resolved === repoResolved ||
    resolved.startsWith(repoResolved + path.sep) ||
    resolved === repoResolvedNoLink ||
    resolved.startsWith(repoResolvedNoLink + path.sep)
  );
}

/**
 * Normalize a path for consistent comparison.
 *
 * @param inputPath - The path to normalize
 * @returns Normalized path
 */
export function normalizePath(inputPath: string): string {
  return path.normalize(inputPath);
}

/**
 * Get the relative path from the project root.
 *
 * @param absolutePath - The absolute path
 * @param projectDir - The project/repository root directory
 * @returns Relative path from project root
 */
export function getRelativePath(
  absolutePath: string,
  projectDir: string = getProjectDir()
): string {
  return path.relative(projectDir, absolutePath);
}

// ---------------------------------------------------------------------------
// Path Sanitization (Task 0.1 - Fix Absolute Path Leaks in Validation Reports)
// ---------------------------------------------------------------------------

/**
 * Preprocess a path string to defeat common bypass vectors before sanitization.
 *
 * Defenses:
 * - VULN-001: Unicode NFKC normalization (homoglyph collapse)
 * - VULN-002: URL percent-encoding decode
 * - VULN-003: Double/triple URL encoding (iterative decode)
 * - VULN-004: Null byte injection stripping
 * - VULN-006: Case normalization on Windows
 * - VULN-007: Embedded newline/carriage-return stripping
 * - Backslash to forward-slash normalization
 *
 * @param input - Raw path string that may contain bypass attempts
 * @returns Cleaned path string safe for further processing
 */
export function preprocessPath(input: string): string {
  if (!input) {
    return '';
  }

  let result = input;

  // VULN-004: Strip null bytes
  result = result.replace(/\0/g, '');

  // VULN-007: Strip embedded newlines and carriage returns
  result = result.replace(/[\r\n]/g, '');

  // VULN-002/003: Iteratively decode URL percent-encoding until stable
  // This catches double-encoding (%2525 -> %25 -> %) and triple-encoding.
  let previous = '';
  let iterations = 0;
  const MAX_DECODE_ITERATIONS = 10;
  while (result !== previous && iterations < MAX_DECODE_ITERATIONS) {
    previous = result;
    try {
      result = decodeURIComponent(result);
    } catch {
      // If decodeURIComponent throws (malformed sequence), stop decoding
      break;
    }
    iterations++;
  }

  // VULN-001: Unicode NFKC normalization to collapse homoglyphs
  // e.g. fullwidth slash \uFF0F -> / , fullwidth backslash \uFF3C -> \
  result = result.normalize('NFKC');

  // Normalize path separators: backslash -> forward slash
  result = result.replace(/\\/g, '/');

  // VULN-006: Case normalization on Windows (paths are case-insensitive)
  if (process.platform === 'win32') {
    result = result.toLowerCase();
  }

  return result;
}

/**
 * Sanitize an absolute path to prevent leaking directory structure in reports.
 *
 * - Paths inside the project root become `{project-root}/relative/path`
 * - Paths outside the project become `{external}/filename`
 * - Path traversal sequences are collapsed before checking
 *
 * The input is preprocessed automatically to defeat bypass vectors.
 *
 * @param absolutePath - The absolute path to sanitize
 * @param projectDir  - Override for the project root (default: getProjectDir())
 * @returns Sanitized path string with placeholders
 */
export function sanitizePath(
  absolutePath: string,
  projectDir: string = getProjectDir()
): string {
  if (!absolutePath) {
    return '';
  }

  // Preprocess to defeat bypass vectors
  const cleaned = preprocessPath(absolutePath);

  if (!cleaned) {
    return '';
  }

  // Normalize the project dir for comparison (same separator treatment)
  let normalizedProjectDir = projectDir.replace(/\\/g, '/');
  if (process.platform === 'win32') {
    normalizedProjectDir = normalizedProjectDir.toLowerCase();
  }

  // Remove trailing slash from project dir for consistent matching
  if (normalizedProjectDir.endsWith('/')) {
    normalizedProjectDir = normalizedProjectDir.slice(0, -1);
  }

  // Use path.posix.normalize to collapse traversal sequences like /../
  const normalizedCleaned = cleaned.replace(/\\/g, '/');
  const collapsed = path.posix.normalize(normalizedCleaned);

  // Check if the collapsed path is inside the project directory
  if (
    collapsed === normalizedProjectDir ||
    collapsed.startsWith(`${normalizedProjectDir  }/`)
  ) {
    // Inside project: replace root with placeholder, keep relative portion
    const relative = collapsed.slice(normalizedProjectDir.length);
    // relative starts with '/' or is empty
    if (!relative || relative === '/') {
      return PROJECT_ROOT_PLACEHOLDER;
    }
    return PROJECT_ROOT_PLACEHOLDER + relative;
  }

  // Outside project: show only the filename to avoid leaking external paths
  const basename = path.posix.basename(collapsed);
  if (!basename || basename === '.') {
    return EXTERNAL_PLACEHOLDER;
  }
  return `${EXTERNAL_PLACEHOLDER}/${basename}`;
}

/**
 * Sanitize an error message by finding and replacing path-like substrings.
 *
 * Detects common path patterns (Unix absolute, Windows absolute, UNC)
 * and replaces each with its sanitized form.
 *
 * @param message    - The error message that may contain absolute paths
 * @param projectDir - Override for the project root (default: getProjectDir())
 * @returns Error message with all paths sanitized
 */
export function sanitizeErrorMessage(
  message: string,
  projectDir: string = getProjectDir()
): string {
  if (!message) {
    return '';
  }

  // Match Unix absolute paths, Windows drive paths, and UNC paths.
  // The pattern captures the path (sequence of non-whitespace, non-quote,
  // non-paren characters after an initial path prefix).
  //
  // Examples matched:
  //   /Users/foo/bar/baz.ts
  //   C:\Users\foo\bar
  //   \\server\share\file
  //   /home/user/project/src/index.ts:42:10  (with trailing :line:col stripped)
  const pathPattern = /(?:\/[^\s"'`(),]+|[A-Za-z]:[/\\][^\s"'`(),]+|\\\\[^\s"'`(),]+)/g;

  return message.replace(pathPattern, (match) => {
    // Strip trailing colon-separated line:col info (e.g. :42:10)
    const stripped = match.replace(/(?::\d+)+$/, '');
    return sanitizePath(stripped, projectDir);
  });
}
