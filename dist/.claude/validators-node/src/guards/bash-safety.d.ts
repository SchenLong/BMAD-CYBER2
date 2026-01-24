import type { CommandSubstitution } from '../types/index.js';
/**
 * Detect command substitution patterns that could bypass path checks.
 *
 * @returns List of detected patterns for warning purposes
 */
export declare function detectCommandSubstitution(cmd: string): CommandSubstitution[];
/**
 * Extract target paths from rm commands.
 */
export declare function extractRmTargets(cmd: string): string[];
export declare function checkDangerousRm(cmd: string, cwd: string): {
    isDangerous: boolean;
    isAbsolute: boolean;
    message: string;
};
/**
 * Check for directory traversal attempts.
 */
export declare function checkDirectoryEscape(cmd: string, cwd: string): {
    isEscape: boolean;
    message: string;
};
/**
 * Check for other dangerous patterns.
 */
export declare function checkDangerousPatterns(cmd: string): {
    isDangerous: boolean;
    message: string;
};
/**
 * Main validator function.
 */
export declare function validateBashCommand(cmd: string, cwd: string): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
//# sourceMappingURL=bash-safety.d.ts.map