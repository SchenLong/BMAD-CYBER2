/**
 * BMAD Guardrails: Environment Protection Validator
 * ==================================================
 * Blocks modifications to sensitive environment and credential files.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation (with user override option)
 *
 * Security Features:
 * - 80+ protected file patterns
 * - Cloud provider configuration detection
 * - Hidden file with sensitive keyword detection
 * - Single-use override tokens with 5-minute timeout
 */
/**
 * Check if a filename matches any allowed pattern (example/template files).
 */
export declare function isAllowedPattern(filename: string): boolean;
/**
 * Check if a file is protected.
 *
 * @returns Tuple of [isProtected, reason]
 */
export declare function isProtectedFile(filePath: string): [boolean, string | null];
/**
 * Main validation function.
 */
export declare function validateEnvProtection(filePath: string): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
