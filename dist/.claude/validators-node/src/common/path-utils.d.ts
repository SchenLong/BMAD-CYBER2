/**
 * BMAD Validators - Path Utilities
 * =================================
 * Common path resolution and validation utilities.
 */
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
//# sourceMappingURL=path-utils.d.ts.map