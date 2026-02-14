/**
 * BMAD Validators - Path Utilities
 * =================================
 * Common path resolution and validation utilities,
 * including sanitization to prevent absolute path leaks in reports.
 */
/** Placeholder used in sanitized output for paths inside the project. */
export declare const PROJECT_ROOT_PLACEHOLDER = "{project-root}";
/** Placeholder used in sanitized output for paths outside the project. */
export declare const EXTERNAL_PLACEHOLDER = "{external}";
/**
 * Get the project directory from environment or current working directory.
 */
export declare function getProjectDir(): string;
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
export declare function resolvePath(inputPath: string, cwd: string): string;
/**
 * Check if a path is within the repository.
 *
 * @param inputPath - The path to check
 * @param cwd - Current working directory for relative paths
 * @param projectDir - The project/repository root directory
 * @returns true if the path is within the repository
 */
export declare function isPathInRepo(inputPath: string, cwd: string, projectDir?: string): boolean;
/**
 * Normalize a path for consistent comparison.
 *
 * @param inputPath - The path to normalize
 * @returns Normalized path
 */
export declare function normalizePath(inputPath: string): string;
/**
 * Get the relative path from the project root.
 *
 * @param absolutePath - The absolute path
 * @param projectDir - The project/repository root directory
 * @returns Relative path from project root
 */
export declare function getRelativePath(absolutePath: string, projectDir?: string): string;
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
export declare function preprocessPath(input: string): string;
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
export declare function sanitizePath(absolutePath: string, projectDir?: string): string;
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
export declare function sanitizeErrorMessage(message: string, projectDir?: string): string;
