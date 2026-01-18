/**
 * BMAD Guardrails: Production Guard Validator
 * ============================================
 * Blocks commands and content targeting production environments.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation
 *
 * Blocking Levels:
 * - ABSOLUTE BLOCK: Force push to main/master, deploy commands (no override)
 * - STRICT BLOCK: Other production indicators (user can override)
 *
 * Security Features:
 * - 18+ production keyword patterns
 * - Safe context detection (comments, documentation)
 * - Documentation file bypass
 * - Single-use override tokens with 5-minute timeout
 */
interface ProductionIndicator {
    pattern: string;
    match: string;
    context: string;
}
/**
 * Check if a file path is a documentation file.
 */
export declare function isDocumentationFile(filePath: string | null): boolean;
/**
 * Check if text is in a safe context (comments, safe words).
 */
export declare function isSafeContext(text: string): boolean;
/**
 * Check for critical deployment commands that cannot be overridden.
 */
export declare function isCriticalDeployCommand(text: string): {
    isCritical: boolean;
    message: string;
};
/**
 * Detect production indicators in text.
 */
export declare function detectProductionIndicators(text: string): ProductionIndicator[];
/**
 * Main validation function.
 */
export declare function validateProductionGuard(content: string, filePath: string | null): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
export {};
