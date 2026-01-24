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
import { AuditLogger } from './audit-logger.js';
// Configuration
const MAX_INPUT_LENGTH = 100000; // 100KB
const REGEX_TIMEOUT_MS = 100; // 100ms warning threshold
/**
 * Truncate input to safe length for regex processing.
 */
export function truncateForRegex(input, maxLength = MAX_INPUT_LENGTH) {
    const originalLength = input.length;
    if (originalLength <= maxLength) {
        return { text: input, truncated: false, originalLength };
    }
    return {
        text: input.slice(0, maxLength),
        truncated: true,
        originalLength,
    };
}
/**
 * Safe regex match with input truncation and timing.
 * Use this instead of direct .match() for user-provided content.
 *
 * @param input - The input string to match against
 * @param pattern - The regex pattern to match
 * @param validatorName - Optional validator name for logging
 * @returns SafeMatchResult with matches and metadata
 */
export function safeMatch(input, pattern, validatorName) {
    // Step 1: Truncate input if too long
    const { text, truncated, originalLength } = truncateForRegex(input);
    // Step 2: Execute regex with timing
    const startTime = performance.now();
    let matches = null;
    try {
        matches = text.match(pattern);
    }
    catch (error) {
        // Regex execution error (shouldn't happen with valid patterns)
        const execTime = performance.now() - startTime;
        if (validatorName) {
            AuditLogger.logSync(validatorName, 'WARNING', {
                message: 'Regex execution error',
                pattern: pattern.source.slice(0, 100),
                error: error instanceof Error ? error.message : 'Unknown error',
                execution_time_ms: execTime,
            }, 'WARNING');
        }
        return {
            matches: null,
            truncated,
            originalLength,
            processedLength: text.length,
            executionTimeMs: execTime,
            timedOut: false,
        };
    }
    const executionTimeMs = performance.now() - startTime;
    // Step 3: Log warning if execution was slow
    const timedOut = executionTimeMs > REGEX_TIMEOUT_MS;
    if (timedOut && validatorName) {
        AuditLogger.logSync(validatorName, 'WARNING', {
            message: 'Slow regex execution detected',
            pattern: pattern.source.slice(0, 100),
            execution_time_ms: executionTimeMs,
            input_length: text.length,
            threshold_ms: REGEX_TIMEOUT_MS,
        }, 'WARNING');
    }
    // Step 4: Log if input was truncated
    if (truncated && validatorName) {
        AuditLogger.logSync(validatorName, 'INFO', {
            message: 'Input truncated for regex safety',
            original_length: originalLength,
            processed_length: text.length,
            max_length: MAX_INPUT_LENGTH,
        }, 'INFO');
    }
    return {
        matches,
        truncated,
        originalLength,
        processedLength: text.length,
        executionTimeMs,
        timedOut,
    };
}
/**
 * Safe regex test with input truncation and timing.
 * Use this instead of direct .test() for user-provided content.
 *
 * @param input - The input string to test
 * @param pattern - The regex pattern to test
 * @param validatorName - Optional validator name for logging
 * @returns Boolean result with timing info
 */
export function safeTest(input, pattern, validatorName) {
    const { text, truncated } = truncateForRegex(input);
    const startTime = performance.now();
    let result = false;
    try {
        result = pattern.test(text);
    }
    catch {
        // Regex execution error
        return { result: false, truncated, executionTimeMs: performance.now() - startTime };
    }
    const executionTimeMs = performance.now() - startTime;
    // Log warning if execution was slow
    if (executionTimeMs > REGEX_TIMEOUT_MS && validatorName) {
        AuditLogger.logSync(validatorName, 'WARNING', {
            message: 'Slow regex test detected',
            pattern: pattern.source.slice(0, 100),
            execution_time_ms: executionTimeMs,
            input_length: text.length,
        }, 'WARNING');
    }
    return { result, truncated, executionTimeMs };
}
/**
 * Batch safe match for multiple patterns.
 * Useful when checking content against many patterns.
 *
 * @param input - The input string to match against
 * @param patterns - Array of regex patterns to match
 * @param validatorName - Optional validator name for logging
 * @returns Array of results for each pattern
 */
export function safeBatchMatch(input, patterns, validatorName) {
    // Truncate once for all patterns
    const { text, truncated, originalLength } = truncateForRegex(input);
    if (truncated && validatorName) {
        AuditLogger.logSync(validatorName, 'INFO', {
            message: 'Input truncated for batch regex safety',
            original_length: originalLength,
            processed_length: text.length,
            pattern_count: patterns.length,
        }, 'INFO');
    }
    const results = [];
    let totalTimeMs = 0;
    for (const pattern of patterns) {
        const startTime = performance.now();
        let matches = null;
        try {
            matches = text.match(pattern);
        }
        catch {
            // Skip this pattern on error
        }
        totalTimeMs += performance.now() - startTime;
        results.push({ pattern, matches });
    }
    // Log if total batch time was slow
    if (totalTimeMs > REGEX_TIMEOUT_MS * 2 && validatorName) {
        AuditLogger.logSync(validatorName, 'WARNING', {
            message: 'Slow batch regex execution',
            total_execution_time_ms: totalTimeMs,
            pattern_count: patterns.length,
            input_length: text.length,
        }, 'WARNING');
    }
    return results;
}
/**
 * Get the configured maximum input length.
 */
export function getMaxInputLength() {
    return MAX_INPUT_LENGTH;
}
/**
 * Get the configured regex timeout threshold.
 */
export function getRegexTimeout() {
    return REGEX_TIMEOUT_MS;
}
//# sourceMappingURL=safe-regex.js.map