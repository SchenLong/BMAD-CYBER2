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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
import { AuditLogger } from '../common/audit-logger.js';
import { getToolInputFromStdinSync } from '../common/stdin-parser.js';
import { EXIT_CODES } from '../types/index.js';
// Try to import telemetry (graceful fallback)
let recordResourceUsage = null;
try {
    const telemetry = await import('../observability/telemetry.js');
    recordResourceUsage = telemetry.recordResourceUsage;
}
catch {
    // Telemetry not available
}
// Configuration from environment
const LIMITS = {
    maxMemoryMb: parseInt(process.env['BMAD_MAX_MEMORY_MB'] || '4096', 10),
    maxCpuPercent: parseInt(process.env['BMAD_MAX_CPU_PERCENT'] || '80', 10),
    maxChildProcesses: parseInt(process.env['BMAD_MAX_CHILD_PROCS'] || '10', 10),
    processTimeoutSeconds: parseInt(process.env['BMAD_PROC_TIMEOUT'] || '300', 10),
    maxFileSizeMb: parseInt(process.env['BMAD_MAX_FILE_SIZE_MB'] || '50', 10),
};
// Thresholds
const WARNING_THRESHOLD = 0.75;
const CRITICAL_THRESHOLD = 0.90;
// Grace period for process termination
const GRACEFUL_SHUTDOWN_MS = 5000;
// State reset after inactivity
const STATE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
/**
 * Resource limiter class for enforcing resource quotas.
 */
export class ResourceLimiter {
    stateFile;
    limits;
    trackedProcesses;
    constructor(limits) {
        const projectDir = getProjectDir();
        const claudeDir = path.join(projectDir, '.claude');
        // Ensure directory exists
        fs.mkdirSync(claudeDir, { recursive: true });
        this.stateFile = path.join(claudeDir, '.resource_state.json');
        this.limits = { ...LIMITS, ...limits };
        this.trackedProcesses = new Map();
        // Load tracked processes from state
        const state = this.loadState();
        for (const proc of Object.values(state.trackedProcesses || {})) {
            this.trackedProcesses.set(proc.pid, proc);
        }
    }
    /**
     * Load state from file.
     */
    loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const content = fs.readFileSync(this.stateFile, 'utf-8');
                const state = JSON.parse(content);
                // Auto-reset if state is too old
                if (Date.now() - state.lastUpdate > STATE_TIMEOUT_MS) {
                    return this.initialState();
                }
                return state;
            }
        }
        catch {
            // Return initial state on error
        }
        return this.initialState();
    }
    /**
     * Get initial empty state.
     */
    initialState() {
        return {
            sessionId: process.env['CLAUDE_SESSION_ID'] || String(Date.now()),
            trackedPids: [],
            trackedProcesses: {},
            violationsCount: 0,
            warningsCount: 0,
            peakMemoryMb: 0,
            peakCpuPercent: 0,
            lastCheck: Date.now(),
            lastUpdate: Date.now(),
        };
    }
    /**
     * Save state atomically.
     */
    saveState(state) {
        state.lastUpdate = Date.now();
        const dir = path.dirname(this.stateFile);
        const tempFile = path.join(dir, `.resource_${Date.now()}_${Math.random().toString(36).slice(2)}`);
        try {
            fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
            fs.renameSync(tempFile, this.stateFile);
        }
        catch (e) {
            try {
                fs.unlinkSync(tempFile);
            }
            catch {
                // Ignore cleanup errors
            }
            throw e;
        }
    }
    /**
     * Get current memory usage in MB.
     */
    getCurrentMemoryMb() {
        try {
            const usage = process.memoryUsage();
            // RSS (resident set size) in bytes -> MB
            return usage.rss / (1024 * 1024);
        }
        catch {
            return 0;
        }
    }
    /**
     * Get current CPU usage percentage (approximation).
     */
    getCpuPercent() {
        try {
            const usage = process.cpuUsage();
            // User + system time in microseconds
            const totalMicros = usage.user + usage.system;
            // Very rough approximation - assumes 10 seconds of elapsed time
            return Math.min((totalMicros / 10_000_000) * 100, 100);
        }
        catch {
            return 0;
        }
    }
    /**
     * Get count of tracked child processes.
     */
    getChildProcessCount() {
        return this.trackedProcesses.size;
    }
    /**
     * Check memory limits.
     */
    checkMemory(estimatedAdditionalMb = 0) {
        const currentMb = this.getCurrentMemoryMb();
        const projectedMb = currentMb + estimatedAdditionalMb;
        const limitMb = this.limits.maxMemoryMb;
        const percentage = projectedMb / limitMb;
        let status = 'ok';
        let allowed = true;
        let message = '';
        if (percentage >= 1.0) {
            status = 'blocked';
            allowed = false;
            message = `Memory limit exceeded: ${projectedMb.toFixed(1)}MB / ${limitMb}MB`;
        }
        else if (percentage >= CRITICAL_THRESHOLD) {
            status = 'critical';
            message = `Memory critical: ${projectedMb.toFixed(1)}MB / ${limitMb}MB (${(percentage * 100).toFixed(1)}%)`;
        }
        else if (percentage >= WARNING_THRESHOLD) {
            status = 'warning';
            message = `Memory warning: ${projectedMb.toFixed(1)}MB / ${limitMb}MB (${(percentage * 100).toFixed(1)}%)`;
        }
        // Update peak memory
        const state = this.loadState();
        if (currentMb > state.peakMemoryMb) {
            state.peakMemoryMb = currentMb;
            this.saveState(state);
        }
        // Record telemetry
        if (recordResourceUsage) {
            recordResourceUsage({
                contextTokensUsed: 0,
                contextTokensMax: 200000,
                contextStatus: status,
                memoryMb: currentMb,
                memoryLimitMb: limitMb,
                childProcesses: this.getChildProcessCount(),
                childProcessLimit: this.limits.maxChildProcesses,
            });
        }
        return {
            allowed,
            status,
            percentage,
            current: projectedMb,
            limit: limitMb,
            message,
        };
    }
    /**
     * Check child process limits.
     */
    checkChildProcesses(startingNew = false) {
        const current = this.getChildProcessCount();
        const projected = startingNew ? current + 1 : current;
        const limit = this.limits.maxChildProcesses;
        const percentage = projected / limit;
        let status = 'ok';
        let allowed = true;
        let message = '';
        if (projected > limit) {
            status = 'blocked';
            allowed = false;
            message = `Child process limit exceeded: ${projected} / ${limit}`;
        }
        else if (percentage >= CRITICAL_THRESHOLD) {
            status = 'critical';
            message = `Child processes critical: ${projected} / ${limit}`;
        }
        else if (percentage >= WARNING_THRESHOLD) {
            status = 'warning';
            message = `Child processes warning: ${projected} / ${limit}`;
        }
        return {
            allowed,
            status,
            percentage,
            current: projected,
            limit,
            message,
        };
    }
    /**
     * Check file size limits.
     */
    checkFileSize(filePath, additionalBytes = 0) {
        const limitBytes = this.limits.maxFileSizeMb * 1024 * 1024;
        let currentSize = 0;
        try {
            if (fs.existsSync(filePath)) {
                currentSize = fs.statSync(filePath).size;
            }
        }
        catch {
            // File doesn't exist or can't be read
        }
        const projectedSize = currentSize + additionalBytes;
        const percentage = projectedSize / limitBytes;
        let status = 'ok';
        let allowed = true;
        let message = '';
        if (projectedSize > limitBytes) {
            status = 'blocked';
            allowed = false;
            message = `File size limit exceeded: ${(projectedSize / (1024 * 1024)).toFixed(1)}MB / ${this.limits.maxFileSizeMb}MB`;
        }
        else if (percentage >= CRITICAL_THRESHOLD) {
            status = 'critical';
            message = `File size critical: ${(projectedSize / (1024 * 1024)).toFixed(1)}MB / ${this.limits.maxFileSizeMb}MB`;
        }
        else if (percentage >= WARNING_THRESHOLD) {
            status = 'warning';
            message = `File size warning: ${(projectedSize / (1024 * 1024)).toFixed(1)}MB / ${this.limits.maxFileSizeMb}MB`;
        }
        return {
            allowed,
            status,
            percentage,
            current: projectedSize,
            limit: limitBytes,
            message,
        };
    }
    /**
     * Track a child process.
     */
    trackProcess(pid, name = 'child') {
        const proc = {
            pid,
            name,
            startedAt: Date.now(),
            memoryMb: 0,
            cpuPercent: 0,
            killed: false,
        };
        this.trackedProcesses.set(pid, proc);
        // Update state
        const state = this.loadState();
        state.trackedPids.push(pid);
        state.trackedProcesses[pid] = proc;
        this.saveState(state);
        AuditLogger.logSync('resource_limits', 'PROCESS_TRACKED', {
            pid,
            name,
        }, 'INFO');
    }
    /**
     * Untrack a child process.
     */
    untrackProcess(pid) {
        this.trackedProcesses.delete(pid);
        // Update state
        const state = this.loadState();
        state.trackedPids = state.trackedPids.filter(p => p !== pid);
        delete state.trackedProcesses[pid];
        this.saveState(state);
    }
    /**
     * Kill a process (gracefully or forcefully).
     */
    killProcess(pid, graceful = true) {
        const proc = this.trackedProcesses.get(pid);
        try {
            if (graceful) {
                // Send SIGTERM
                process.kill(pid, 'SIGTERM');
                // Wait for graceful shutdown, then force kill
                setTimeout(() => {
                    try {
                        // Check if still alive
                        process.kill(pid, 0);
                        // Still alive, force kill
                        process.kill(pid, 'SIGKILL');
                    }
                    catch {
                        // Already dead, which is good
                    }
                }, GRACEFUL_SHUTDOWN_MS);
            }
            else {
                // Force kill immediately
                process.kill(pid, 'SIGKILL');
            }
            if (proc) {
                proc.killed = true;
            }
            AuditLogger.logSync('resource_limits', 'PROCESS_KILLED', {
                pid,
                graceful,
            }, 'WARNING');
            this.untrackProcess(pid);
            return true;
        }
        catch (e) {
            const error = e;
            if (error.code === 'ESRCH') {
                // Process doesn't exist
                this.untrackProcess(pid);
                return true;
            }
            return false;
        }
    }
    /**
     * Kill processes that have exceeded their timeout.
     */
    killOverLimitProcesses() {
        const killed = [];
        const timeoutMs = this.limits.processTimeoutSeconds * 1000;
        const now = Date.now();
        for (const [pid, proc] of this.trackedProcesses) {
            if (proc.killed)
                continue;
            const elapsed = now - proc.startedAt;
            if (elapsed > timeoutMs) {
                if (this.killProcess(pid)) {
                    killed.push(pid);
                }
            }
        }
        if (killed.length > 0) {
            AuditLogger.logSync('resource_limits', 'PROCESSES_KILLED_TIMEOUT', {
                pids: killed,
                timeoutSeconds: this.limits.processTimeoutSeconds,
            }, 'WARNING');
        }
        return killed;
    }
    /**
     * Get current resource status.
     */
    getStatus() {
        const memoryResult = this.checkMemory();
        const processResult = this.checkChildProcesses();
        const state = this.loadState();
        return {
            memory: {
                currentMb: this.getCurrentMemoryMb(),
                limitMb: this.limits.maxMemoryMb,
                percentage: memoryResult.percentage,
                status: memoryResult.status,
                peakMb: state.peakMemoryMb,
            },
            childProcesses: {
                current: this.getChildProcessCount(),
                limit: this.limits.maxChildProcesses,
                percentage: processResult.percentage,
                status: processResult.status,
                tracked: Array.from(this.trackedProcesses.values()),
            },
            limits: this.limits,
            violations: state.violationsCount,
            warnings: state.warningsCount,
        };
    }
    /**
     * Reset resource tracking.
     */
    reset() {
        this.trackedProcesses.clear();
        this.saveState(this.initialState());
        AuditLogger.logSync('resource_limits', 'RESOURCE_RESET', {}, 'INFO');
    }
}
// Singleton instance
let resourceLimiterInstance = null;
/**
 * Get or create the singleton resource limiter instance.
 */
export function getResourceLimiter() {
    if (resourceLimiterInstance === null) {
        resourceLimiterInstance = new ResourceLimiter();
    }
    return resourceLimiterInstance;
}
/**
 * Convenience function to check all resource limits.
 */
export function checkResourceLimits() {
    const limiter = getResourceLimiter();
    const memoryResult = limiter.checkMemory();
    if (!memoryResult.allowed) {
        return [false, memoryResult.message];
    }
    const processResult = limiter.checkChildProcesses();
    if (!processResult.allowed) {
        return [false, processResult.message];
    }
    // Kill timed-out processes
    limiter.killOverLimitProcesses();
    return [true, 'All resource checks passed'];
}
/**
 * Convenience function to check if memory is available.
 */
export function checkMemoryAvailable(estimatedMb) {
    const limiter = getResourceLimiter();
    const result = limiter.checkMemory(estimatedMb);
    return [result.allowed, result.message];
}
/**
 * Print block message to stderr.
 */
function printBlockMessage(result) {
    console.error('');
    console.error('='.repeat(60));
    console.error('RESOURCE LIMIT EXCEEDED');
    console.error('='.repeat(60));
    console.error(`Status: ${result.status.toUpperCase()}`);
    console.error(`Current: ${result.current.toFixed(1)} / ${result.limit}`);
    console.error(`Usage: ${(result.percentage * 100).toFixed(1)}%`);
    console.error(`Reason: ${result.message}`);
    console.error('='.repeat(60));
    console.error('');
}
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates resource limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export function validateResourceLimits() {
    try {
        // Read from stdin synchronously (prevents hang on EOF issues)
        const input = getToolInputFromStdinSync();
        if (!input.tool_name) {
            return EXIT_CODES.ALLOW;
        }
        const toolName = input.tool_name.toLowerCase();
        const toolInput = input.tool_input || {};
        const limiter = getResourceLimiter();
        // Check 1: Memory limits (all operations)
        const memoryResult = limiter.checkMemory();
        if (!memoryResult.allowed) {
            printBlockMessage(memoryResult);
            AuditLogger.logSync('resource_limits', 'BLOCKED', {
                tool_name: toolName,
                resource: 'memory',
                reason: memoryResult.message,
            }, 'BLOCKED');
            return EXIT_CODES.SOFT_BLOCK;
        }
        // Check 2: Task tool checks child processes
        if (toolName === 'task') {
            const processResult = limiter.checkChildProcesses(true);
            if (!processResult.allowed) {
                printBlockMessage(processResult);
                AuditLogger.logSync('resource_limits', 'BLOCKED', {
                    tool_name: toolName,
                    resource: 'child_processes',
                    reason: processResult.message,
                }, 'BLOCKED');
                return EXIT_CODES.SOFT_BLOCK;
            }
        }
        // Check 3: Write tool checks file size
        if (toolName === 'write' && toolInput.file_path && toolInput.content) {
            const content = String(toolInput.content);
            const filePath = String(toolInput.file_path);
            const sizeResult = limiter.checkFileSize(filePath, Buffer.byteLength(content, 'utf-8'));
            if (!sizeResult.allowed) {
                printBlockMessage(sizeResult);
                AuditLogger.logSync('resource_limits', 'BLOCKED', {
                    tool_name: toolName,
                    resource: 'file_size',
                    file_path: filePath.slice(0, 200),
                    reason: sizeResult.message,
                }, 'BLOCKED');
                return EXIT_CODES.SOFT_BLOCK;
            }
        }
        // Log warnings but allow
        if (memoryResult.status === 'warning' || memoryResult.status === 'critical') {
            console.error(`WARNING: ${memoryResult.message}`);
        }
        return EXIT_CODES.ALLOW;
    }
    catch (e) {
        // On error, allow the operation (fail open for availability)
        console.error(`Resource limiter error: ${e}`);
        return EXIT_CODES.ALLOW;
    }
}
/**
 * CLI entry point for bin/ invocation.
 */
export function main() {
    process.exit(validateResourceLimits());
}
// CLI entry point (direct execution)
if (process.argv[1]?.endsWith('resource-limits.js') || process.argv[1]?.endsWith('resource-limits.ts')) {
    main();
}
//# sourceMappingURL=resource-limits.js.map