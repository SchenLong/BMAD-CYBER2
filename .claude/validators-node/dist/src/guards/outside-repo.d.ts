/**
 * BMAD Guardrails: Outside Repository Guard
 * ==========================================
 * Prevents file operations targeting paths outside the repository.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation
 *
 * Blocking Levels:
 * - ABSOLUTE BLOCK: rm commands outside repo (no override)
 * - STRICT BLOCK: Other operations outside repo (BMAD_ALLOW_OUTSIDE_REPO)
 * - SUBSTITUTION BLOCK: Unsafe command substitutions (BMAD_ALLOW_SUBSTITUTION)
 *
 * Supported Tools:
 * - Bash: Extracts paths from various commands
 * - Write/Edit: Checks file_path
 * - Read: Checks file_path
 * - Glob/Grep: Checks path if provided
 */
import type { ToolInput } from '../types/index.js';
interface PathExtraction {
    path: string;
    operation: 'read' | 'write' | 'delete' | 'navigate' | 'modify' | 'copy' | 'move' | 'link' | 'append' | 'create' | 'edit';
}
interface BashCheckResult {
    isViolation: boolean;
    isAbsolute: boolean;
    message: string;
    paths: PathExtraction[];
    substitutions: string[];
}
interface FileCheckResult {
    isViolation: boolean;
    message: string;
}
/**
 * Extract paths from a bash command.
 */
export declare function extractPathsFromCommand(cmd: string): PathExtraction[];
/**
 * Detect unsafe command substitutions.
 */
export declare function detectUnsafeSubstitutions(cmd: string): string[];
/**
 * Check a bash command for outside-repo violations.
 */
export declare function checkBashCommand(cmd: string, cwd: string): BashCheckResult;
/**
 * Check a single file path for outside-repo violation.
 */
export declare function checkFilePath(filePath: string, cwd: string): FileCheckResult;
/**
 * Main validation function for all tool types.
 */
export declare function validateOutsideRepo(input: ToolInput): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
export {};
