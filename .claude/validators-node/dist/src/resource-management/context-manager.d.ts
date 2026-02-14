/**
 * BMAD Validators - Context Manager
 * ==================================
 * Context window tracking and management for Claude Code.
 * Prevents context overflow (OWASP LLM04).
 *
 * Features:
 * - Token estimation for operations
 * - Context usage tracking
 * - Warning/block thresholds
 * - Actionable suggestions when approaching limits
 * - Persistent state across validator invocations
 */
export interface TokenEstimate {
    tokens: number;
    source: 'file' | 'text' | 'command' | 'web' | 'agent';
    path?: string;
    truncated: boolean;
    originalTokens?: number;
}
export interface ContextStatus {
    status: 'ok' | 'warning' | 'critical' | 'blocked';
    percentage: number;
    tokensUsed: number;
    tokensRemaining: number;
    maxTokens: number;
    message?: string | undefined;
}
export interface OperationRecord {
    tool: string;
    tokens: number;
    timestamp: number;
}
export interface ContextState {
    sessionId: string;
    tokensUsed: number;
    operations: OperationRecord[];
    warningsIssued: number;
    lastUpdate: number;
    createdAt: number;
}
/**
 * Context manager for tracking and managing context window usage.
 */
export declare class ContextManager {
    private stateFile;
    private projectDir;
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
     * Estimate tokens from text.
     */
    estimateTokens(text: string): number;
    /**
     * Estimate tokens for a file.
     */
    estimateFileTokens(filePath: string): TokenEstimate;
    /**
     * Estimate tokens for a tool operation.
     */
    estimateOperationTokens(toolName: string, toolInput: Record<string, unknown>): TokenEstimate;
    /**
     * Record an operation.
     */
    recordOperation(toolName: string, tokens: number): void;
    /**
     * Check current context capacity.
     */
    checkCapacity(): ContextStatus;
    /**
     * Check if operation can be accommodated.
     */
    canAccommodate(estimatedTokens: number): [boolean, string];
    /**
     * Get current context status.
     */
    getStatus(): Record<string, unknown>;
    /**
     * Reset context tracking.
     */
    reset(): void;
    /**
     * Get actionable suggestions when approaching limits.
     */
    suggestActions(): string[];
}
/**
 * Get or create the singleton context manager instance.
 */
export declare function getContextManager(): ContextManager;
/**
 * Convenience function to check context capacity.
 */
export declare function checkContextCapacity(): [string, number, string | undefined];
/**
 * Convenience function to estimate operation cost.
 */
export declare function estimateOperationCost(toolName: string, toolInput: Record<string, unknown>): [number, string];
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates context capacity.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export declare function validateContextCapacity(): number;
/**
 * CLI entry point for bin/ invocation.
 */
export declare function main(): void;
