import type { CommandSubstitution } from '../types/index.js';
/**
 * Detect command substitution patterns that could bypass path checks.
 *
 * @returns List of detected patterns for warning purposes
 */
export declare function detectCommandSubstitution(cmd: string): CommandSubstitution[];
/**
 * Split a command string into individual pipeline/chain segments.
 * SA-02 LOW: Commands like "echo foo | rm -rf /" need each segment analyzed independently.
 */
export declare function splitCommandSegments(cmd: string): string[];
/**
 * Result type for SQL injection detection
 */
export interface SQLInjectionResult {
    isSQLi: boolean;
    testId?: string;
    subtype?: string;
    severity: string;
}
/**
 * Detect SQL injection patterns in a command string
 *
 * A03-101: UNION-based SQL injection
 * A03-102: Boolean-blind SQL injection
 * A03-103: Time-based SQL injection
 * A03-104: Error-based SQL injection
 * A03-105: Stacked query injection
 */
export declare function checkSQLInjection(cmd: string): SQLInjectionResult;
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
