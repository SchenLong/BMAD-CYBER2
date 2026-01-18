/**
 * BMAD Validators - Safe Regex Module (SEC-002-2)
 * ================================================
 * Protection against catastrophic regex backtracking attacks.
 *
 * Features:
 * - Input length limits before regex processing
 * - Execution time monitoring
 * - Safe match wrapper with performance warnings
 *
 * Constants:
 * - MAX_INPUT_LENGTH: 100KB (100,000 characters)
 * - REGEX_TIMEOUT_MS: 100ms warning threshold
 */
/**
 * Result from a safe regex match operation.
 */
export interface SafeMatchResult {
    matches: RegExpMatchArray | null;
    truncated: boolean;
    originalLength: number;
    processedLength: number;
    executionTimeMs: number;
    timedOut: boolean;
}
/**
 * Truncate input to safe length for regex processing.
 */
export declare function truncateForRegex(input: string, maxLength?: number): {
    text: string;
    truncated: boolean;
    originalLength: number;
};
/**
 * Safe regex match with input truncation and timing.
 * Use this instead of direct .match() for user-provided content.
 *
 * @param input - The input string to match against
 * @param pattern - The regex pattern to match
 * @param validatorName - Optional validator name for logging
 * @returns SafeMatchResult with matches and metadata
 */
export declare function safeMatch(input: string, pattern: RegExp, validatorName?: string): SafeMatchResult;
/**
 * Safe regex test with input truncation and timing.
 * Use this instead of direct .test() for user-provided content.
 *
 * @param input - The input string to test
 * @param pattern - The regex pattern to test
 * @param validatorName - Optional validator name for logging
 * @returns Boolean result with timing info
 */
export declare function safeTest(input: string, pattern: RegExp, validatorName?: string): {
    result: boolean;
    truncated: boolean;
    executionTimeMs: number;
};
/**
 * Batch safe match for multiple patterns.
 * Useful when checking content against many patterns.
 *
 * @param input - The input string to match against
 * @param patterns - Array of regex patterns to match
 * @param validatorName - Optional validator name for logging
 * @returns Array of results for each pattern
 */
export declare function safeBatchMatch(input: string, patterns: RegExp[], validatorName?: string): Array<{
    pattern: RegExp;
    matches: RegExpMatchArray | null;
}>;
/**
 * Get the configured maximum input length.
 */
export declare function getMaxInputLength(): number;
/**
 * Get the configured regex timeout threshold.
 */
export declare function getRegexTimeout(): number;
