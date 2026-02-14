/**
 * BMAD Validators - Rate Limiter
 * ==============================
 * Sliding window rate limiting for Claude Code operations.
 * Prevents resource exhaustion attacks (OWASP LLM04).
 *
 * Features:
 * - Per-operation rate limits (bash, write, read, etc.)
 * - Global rate limit across all operations
 * - Sliding window algorithm (60-second window)
 * - Exponential backoff on violations
 * - Whitelist bypass for critical operations
 * - Persistent state across validator invocations
 *
 * Session-Aware Rate Limiting (NEW):
 * - Rate limits are shared across all agents in a session
 * - Subagents count against the same session-level limits
 * - Configurable multiplier for parallel execution (BMAD_RATE_LIMIT_MULTIPLIER)
 */
export interface RequestRecord {
    timestamp: number;
    target: string;
}
export interface RateLimitState {
    requests: Record<string, RequestRecord[]>;
    violations: Record<string, number>;
    backoff_until: Record<string, number>;
    last_cleanup: number;
}
export interface RateLimitCheckResult {
    allowed: boolean;
    reason: string;
    operation: string;
    count: number;
    limit: number;
    retryAfter?: number;
}
export interface RateLimitStatus {
    operations: Record<string, {
        count: number;
        limit: number;
        percentage: number;
        backoffActive: boolean;
        backoffRemaining: number;
    }>;
    globalCount: number;
    globalLimit: number;
    globalPercentage: number;
}
/**
 * Rate limiter with sliding window algorithm.
 */
export declare class RateLimiter {
    private stateFile;
    constructor();
    /**
     * Load state from file.
     */
    private loadState;
    /**
     * Get initial empty state.
     */
    private initialState;
    /**
     * Save state atomically.
     */
    private saveState;
    /**
     * Clean up old requests outside the sliding window.
     */
    private cleanupOldRequests;
    /**
     * Count requests within the sliding window.
     */
    private getRequestsInWindow;
    /**
     * Get total requests across all operations.
     */
    private getGlobalRequestsInWindow;
    /**
     * Check if operation/target is whitelisted.
     */
    private isWhitelisted;
    /**
     * Calculate exponential backoff duration.
     */
    private calculateBackoff;
    /**
     * Check if an operation is within rate limits.
     */
    checkLimit(operation: string, target?: string): RateLimitCheckResult;
    /**
     * Handle a rate limit violation.
     */
    private handleViolation;
    /**
     * Record a request for rate limiting.
     */
    recordRequest(operation: string, target?: string): void;
    /**
     * Get seconds until rate limit resets.
     */
    getRetryAfter(operation: string, state?: RateLimitState, currentTime?: number): number;
    /**
     * Get current rate limit status.
     */
    getStatus(): RateLimitStatus;
    /**
     * Reset rate limit state.
     */
    reset(operation?: string): void;
}
/**
 * Get or create the singleton rate limiter instance.
 */
export declare function getRateLimiter(): RateLimiter;
/**
 * Convenience function to check rate limit.
 */
export declare function checkRateLimit(operation: string, target?: string): [boolean, string | null];
/**
 * Convenience function to record an operation.
 */
export declare function recordOperation(operation: string, target?: string): void;
/**
 * Convenience function to get rate limit status.
 */
export declare function getRateStatus(): RateLimitStatus;
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates rate limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export declare function validateRateLimit(): number;
/**
 * CLI entry point for bin/ invocation.
 */
export declare function main(): void;
