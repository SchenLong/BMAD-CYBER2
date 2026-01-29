/**
 * BMAD Validators - Path Utilities
 * =================================
 * Common path resolution and validation utilities.
 */
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
/**
 * Get the project directory from environment or current working directory.
 */
export function getProjectDir() {
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
export function resolvePath(inputPath, cwd) {
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
    }
    catch {
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
export function isPathInRepo(inputPath, cwd, projectDir = getProjectDir()) {
    if (!inputPath) {
        // No path means we can't check, allow by default
        return true;
    }
    const resolved = resolvePath(inputPath, cwd);
    let repoResolved;
    try {
        repoResolved = fs.realpathSync(projectDir);
    }
    catch {
        repoResolved = path.resolve(projectDir);
    }
    // Check if resolved path starts with repo path
    // Must be either equal to repo or within repo (with path separator)
    return resolved === repoResolved || resolved.startsWith(repoResolved + path.sep);
}
/**
 * Normalize a path for consistent comparison.
 *
 * @param inputPath - The path to normalize
 * @returns Normalized path
 */
export function normalizePath(inputPath) {
    return path.normalize(inputPath);
}
/**
 * Get the relative path from the project root.
 *
 * @param absolutePath - The absolute path
 * @param projectDir - The project/repository root directory
 * @returns Relative path from project root
 */
export function getRelativePath(absolutePath, projectDir = getProjectDir()) {
    return path.relative(projectDir, absolutePath);
}
//# sourceMappingURL=path-utils.js.map