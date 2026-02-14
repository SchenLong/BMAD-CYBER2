/**
 * BMAD Validators - Recursion Guard
 * ==================================
 * Recursion depth tracking and circular reference detection.
 * Prevents stack exhaustion and infinite loops (OWASP LLM04).
 *
 * Features:
 * - Directory traversal depth limiting
 * - Nested call stack tracking
 * - Task depth limiting
 * - Symlink following limits
 * - Circular reference detection
 * - Pattern repetition detection
 */
export interface RecursionLimits {
    directoryTraversal: number;
    nestedCalls: number;
    taskDepth: number;
    includeDepth: number;
    symlinkFollows: number;
}
export interface RecursionState {
    callStack: string[];
    pathHistory: string[];
    depthCounters: Record<string, number>;
    circularRefsDetected: number;
    lastUpdate: number;
    sessionId: string;
}
export interface RecursionCheckResult {
    allowed: boolean;
    reason: string;
    recursionType: string;
    currentDepth: number;
    maxDepth: number;
    isCircular: boolean;
}
/**
 * Recursion guard for tracking and limiting recursion depth.
 */
export declare class RecursionGuard {
    private stateFile;
    private limits;
    private projectDir;
    constructor(limits?: Partial<RecursionLimits>);
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
     * Create MD5 hash of operation:target for tracking.
     */
    private hashOperation;
    /**
     * Detect circular patterns in history.
     */
    private detectCircularPattern;
    /**
     * Check recursion depth for a given type.
     */
    checkDepth(type: string, depth: number, target?: string): RecursionCheckResult;
    /**
     * Check for circular references.
     */
    checkCircular(operation: string, target: string): RecursionCheckResult;
    /**
     * Push a call onto the stack.
     */
    pushCall(callId: string): RecursionCheckResult;
    /**
     * Pop a call from the stack.
     */
    popCall(callId: string): void;
    /**
     * Check directory traversal depth.
     */
    checkDirectoryDepth(filePath: string, basePath?: string): RecursionCheckResult;
    /**
     * Check symlink following depth.
     */
    checkSymlinkDepth(filePath: string): RecursionCheckResult;
    /**
     * Get current recursion guard status.
     */
    getStatus(): Record<string, unknown>;
    /**
     * Reset recursion tracking.
     */
    reset(): void;
}
/**
 * Get or create the singleton recursion guard instance.
 */
export declare function getRecursionGuard(): RecursionGuard;
/**
 * Convenience function to check recursion limit.
 */
export declare function checkRecursionLimit(type: string, depth: number, target?: string): [boolean, string];
/**
 * Convenience function to check circular reference.
 */
export declare function checkCircularReference(operation: string, target: string): [boolean, string];
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates recursion limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export declare function validateRecursion(): number;
/**
 * CLI entry point for bin/ invocation.
 */
export declare function main(): void;
