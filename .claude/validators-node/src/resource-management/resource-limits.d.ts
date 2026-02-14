/**
 * BMAD Validators - Resource Limits
 * ==================================
 * Resource quota enforcement for Claude Code operations.
 * Prevents denial-of-service attacks (OWASP LLM04).
 *
 * Features:
 * - Memory limits with threshold warnings
 * - Child process tracking and timeout
 * - File size limits
 * - Graceful process termination (SIGTERM -> SIGKILL)
 * - Persistent state across validator invocations
 */
export interface ResourceLimits {
    maxMemoryMb: number;
    maxCpuPercent: number;
    maxChildProcesses: number;
    processTimeoutSeconds: number;
    maxFileSizeMb: number;
}
export interface ResourceCheckResult {
    allowed: boolean;
    status: 'ok' | 'warning' | 'critical' | 'blocked';
    percentage: number;
    current: number;
    limit: number;
    message: string;
}
export interface TrackedProcess {
    pid: number;
    name: string;
    startedAt: number;
    memoryMb: number;
    cpuPercent: number;
    killed: boolean;
}
export interface ResourceState {
    sessionId: string;
    trackedPids: number[];
    trackedProcesses: Record<number, TrackedProcess>;
    violationsCount: number;
    warningsCount: number;
    peakMemoryMb: number;
    peakCpuPercent: number;
    lastCheck: number;
    lastUpdate: number;
}
/**
 * Resource limiter class for enforcing resource quotas.
 */
export declare class ResourceLimiter {
    private stateFile;
    private limits;
    private trackedProcesses;
    constructor(limits?: Partial<ResourceLimits>);
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
     * Get current memory usage in MB.
     */
    getCurrentMemoryMb(): number;
    /**
     * Get current CPU usage percentage (approximation).
     */
    getCpuPercent(): number;
    /**
     * Get count of tracked child processes.
     */
    getChildProcessCount(): number;
    /**
     * Check memory limits.
     */
    checkMemory(estimatedAdditionalMb?: number): ResourceCheckResult;
    /**
     * Check child process limits.
     */
    checkChildProcesses(startingNew?: boolean): ResourceCheckResult;
    /**
     * Check file size limits.
     */
    checkFileSize(filePath: string, additionalBytes?: number): ResourceCheckResult;
    /**
     * Track a child process.
     */
    trackProcess(pid: number, name?: string): void;
    /**
     * Untrack a child process.
     */
    untrackProcess(pid: number): void;
    /**
     * Kill a process (gracefully or forcefully).
     */
    killProcess(pid: number, graceful?: boolean): boolean;
    /**
     * Kill processes that have exceeded their timeout.
     */
    killOverLimitProcesses(): number[];
    /**
     * Get current resource status.
     */
    getStatus(): Record<string, unknown>;
    /**
     * Reset resource tracking.
     */
    reset(): void;
}
/**
 * Get or create the singleton resource limiter instance.
 */
export declare function getResourceLimiter(): ResourceLimiter;
/**
 * Convenience function to check all resource limits.
 */
export declare function checkResourceLimits(): [boolean, string];
/**
 * Convenience function to check if memory is available.
 */
export declare function checkMemoryAvailable(estimatedMb: number): [boolean, string];
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates resource limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export declare function validateResourceLimits(): number;
/**
 * CLI entry point for bin/ invocation.
 */
export declare function main(): void;
