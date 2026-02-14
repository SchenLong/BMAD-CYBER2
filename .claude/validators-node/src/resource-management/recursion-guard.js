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
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { getProjectDir } from '../common/path-utils.js';
import { AuditLogger } from '../common/audit-logger.js';
import { getToolInputFromStdinSync } from '../common/stdin-parser.js';
import { EXIT_CODES } from '../types/index.js';
// Configuration from environment
const LIMITS = {
    directoryTraversal: parseInt(process.env['BMAD_MAX_DIR_DEPTH'] || '10', 10),
    nestedCalls: parseInt(process.env['BMAD_MAX_NESTED_CALLS'] || '20', 10),
    taskDepth: parseInt(process.env['BMAD_MAX_TASK_DEPTH'] || '5', 10),
    includeDepth: parseInt(process.env['BMAD_MAX_INCLUDE_DEPTH'] || '10', 10),
    symlinkFollows: parseInt(process.env['BMAD_MAX_SYMLINK_FOLLOWS'] || '5', 10),
};
// Circular reference detection window
const CIRCULAR_WINDOW_SIZE = 50;
const FREQUENCY_WINDOW_SIZE = 20;
const FREQUENCY_THRESHOLD = 5;
// State staleness timeout (5 minutes)
const STATE_TIMEOUT_MS = 5 * 60 * 1000;
/**
 * Recursion guard for tracking and limiting recursion depth.
 */
export class RecursionGuard {
    stateFile;
    limits;
    projectDir;
    constructor(limits) {
        this.projectDir = getProjectDir();
        const claudeDir = path.join(this.projectDir, '.claude');
        // Ensure directory exists
        fs.mkdirSync(claudeDir, { recursive: true });
        this.stateFile = path.join(claudeDir, '.recursion_state.json');
        this.limits = { ...LIMITS, ...limits };
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
            callStack: [],
            pathHistory: [],
            depthCounters: {},
            circularRefsDetected: 0,
            lastUpdate: Date.now(),
            sessionId: process.env['CLAUDE_SESSION_ID'] || String(Date.now()),
        };
    }
    /**
     * Save state atomically.
     */
    saveState(state) {
        state.lastUpdate = Date.now();
        const dir = path.dirname(this.stateFile);
        const tempFile = path.join(dir, `.recursion_${Date.now()}_${Math.random().toString(36).slice(2)}`);
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
     * Create MD5 hash of operation:target for tracking.
     */
    hashOperation(operation, target) {
        const content = `${operation}:${target}`;
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
    }
    /**
     * Detect circular patterns in history.
     */
    detectCircularPattern(history, newHash) {
        // Check if this hash exists in history
        if (!history.includes(newHash)) {
            return [false, 0];
        }
        // Find all indices where this hash appears
        const indices = history
            .map((h, i) => h === newHash ? i : -1)
            .filter(i => i !== -1);
        if (indices.length < 2) {
            return [false, 0];
        }
        // Check for repeating patterns
        for (let i = 0; i < indices.length - 1; i++) {
            const patternStart = indices[i];
            const patternEnd = indices[i + 1];
            if (patternStart === undefined || patternEnd === undefined)
                continue;
            const patternLength = patternEnd - patternStart;
            if (patternLength < 2)
                continue;
            // Check if pattern repeats
            if (patternEnd + patternLength <= history.length) {
                const pattern = history.slice(patternStart, patternEnd);
                const nextSegment = history.slice(patternEnd, patternEnd + patternLength);
                if (JSON.stringify(pattern) === JSON.stringify(nextSegment)) {
                    return [true, patternLength];
                }
            }
        }
        // Frequency-based detection: same operation too many times recently
        const recentHistory = history.slice(-FREQUENCY_WINDOW_SIZE);
        const count = recentHistory.filter(h => h === newHash).length;
        if (count >= FREQUENCY_THRESHOLD) {
            return [true, 1];
        }
        return [false, 0];
    }
    /**
     * Check recursion depth for a given type.
     */
    checkDepth(type, depth, target = '') {
        const limitKey = type.replace(/_/g, '');
        const maxDepth = this.limits[limitKey] || this.limits.nestedCalls;
        if (depth > maxDepth) {
            AuditLogger.logSync('recursion_guard', 'DEPTH_EXCEEDED', {
                type,
                depth,
                maxDepth,
                target: target.slice(0, 200),
            }, 'BLOCKED');
            return {
                allowed: false,
                reason: `${type} depth limit exceeded: ${depth} > ${maxDepth}`,
                recursionType: type,
                currentDepth: depth,
                maxDepth,
                isCircular: false,
            };
        }
        return {
            allowed: true,
            reason: 'Within depth limits',
            recursionType: type,
            currentDepth: depth,
            maxDepth,
            isCircular: false,
        };
    }
    /**
     * Check for circular references.
     */
    checkCircular(operation, target) {
        const state = this.loadState();
        const opHash = this.hashOperation(operation, target);
        const history = state.pathHistory;
        const [isCircular, patternLength] = this.detectCircularPattern(history, opHash);
        if (isCircular) {
            state.circularRefsDetected += 1;
            this.saveState(state);
            AuditLogger.logSync('recursion_guard', 'CIRCULAR_DETECTED', {
                operation,
                target: target.slice(0, 200),
                patternLength,
                circularRefsDetected: state.circularRefsDetected,
            }, 'BLOCKED');
            return {
                allowed: false,
                reason: `Circular reference detected (pattern length: ${patternLength})`,
                recursionType: 'circular',
                currentDepth: state.circularRefsDetected,
                maxDepth: 0,
                isCircular: true,
            };
        }
        // Add to history (keep last CIRCULAR_WINDOW_SIZE)
        history.push(opHash);
        if (history.length > CIRCULAR_WINDOW_SIZE) {
            state.pathHistory = history.slice(-CIRCULAR_WINDOW_SIZE);
        }
        else {
            state.pathHistory = history;
        }
        this.saveState(state);
        return {
            allowed: true,
            reason: 'No circular reference detected',
            recursionType: 'circular',
            currentDepth: 0,
            maxDepth: 0,
            isCircular: false,
        };
    }
    /**
     * Push a call onto the stack.
     */
    pushCall(callId) {
        const state = this.loadState();
        // Check for circular call (same callId in stack)
        if (state.callStack.includes(callId)) {
            state.circularRefsDetected += 1;
            this.saveState(state);
            AuditLogger.logSync('recursion_guard', 'CIRCULAR_CALL', {
                callId,
                stackDepth: state.callStack.length,
            }, 'BLOCKED');
            return {
                allowed: false,
                reason: `Circular call detected: ${callId} already in stack`,
                recursionType: 'nested_calls',
                currentDepth: state.callStack.length,
                maxDepth: this.limits.nestedCalls,
                isCircular: true,
            };
        }
        // Check depth limit
        if (state.callStack.length >= this.limits.nestedCalls) {
            AuditLogger.logSync('recursion_guard', 'CALL_DEPTH_EXCEEDED', {
                callId,
                depth: state.callStack.length,
                maxDepth: this.limits.nestedCalls,
            }, 'BLOCKED');
            return {
                allowed: false,
                reason: `Call stack depth limit exceeded: ${state.callStack.length} >= ${this.limits.nestedCalls}`,
                recursionType: 'nested_calls',
                currentDepth: state.callStack.length,
                maxDepth: this.limits.nestedCalls,
                isCircular: false,
            };
        }
        // Push to stack
        state.callStack.push(callId);
        this.saveState(state);
        return {
            allowed: true,
            reason: 'Call pushed to stack',
            recursionType: 'nested_calls',
            currentDepth: state.callStack.length,
            maxDepth: this.limits.nestedCalls,
            isCircular: false,
        };
    }
    /**
     * Pop a call from the stack.
     */
    popCall(callId) {
        const state = this.loadState();
        const index = state.callStack.indexOf(callId);
        if (index !== -1) {
            state.callStack.splice(index, 1);
            this.saveState(state);
        }
    }
    /**
     * Check directory traversal depth.
     */
    checkDirectoryDepth(filePath, basePath) {
        try {
            const base = basePath || this.projectDir;
            const normalized = path.normalize(path.resolve(filePath));
            const normalizedBase = path.normalize(path.resolve(base));
            const relPath = path.relative(normalizedBase, normalized);
            // Parent directory traversal resets depth to 0
            if (relPath.startsWith('..')) {
                return {
                    allowed: true,
                    reason: 'Path is outside base directory',
                    recursionType: 'directory_traversal',
                    currentDepth: 0,
                    maxDepth: this.limits.directoryTraversal,
                    isCircular: false,
                };
            }
            const depth = relPath.split(path.sep).filter(p => p && p !== '.').length;
            return this.checkDepth('directoryTraversal', depth, filePath);
        }
        catch {
            return {
                allowed: true,
                reason: 'Could not calculate depth',
                recursionType: 'directory_traversal',
                currentDepth: 0,
                maxDepth: this.limits.directoryTraversal,
                isCircular: false,
            };
        }
    }
    /**
     * Check symlink following depth.
     */
    checkSymlinkDepth(filePath) {
        const state = this.loadState();
        const symlinkKey = 'symlinks';
        const currentCount = state.depthCounters[symlinkKey] || 0;
        try {
            const stats = fs.lstatSync(filePath);
            if (!stats.isSymbolicLink()) {
                return {
                    allowed: true,
                    reason: 'Not a symlink',
                    recursionType: 'symlink_follows',
                    currentDepth: currentCount,
                    maxDepth: this.limits.symlinkFollows,
                    isCircular: false,
                };
            }
            // Increment symlink counter
            const newCount = currentCount + 1;
            state.depthCounters[symlinkKey] = newCount;
            this.saveState(state);
            if (newCount > this.limits.symlinkFollows) {
                AuditLogger.logSync('recursion_guard', 'SYMLINK_LIMIT', {
                    path: filePath.slice(0, 200),
                    count: newCount,
                    limit: this.limits.symlinkFollows,
                }, 'BLOCKED');
                return {
                    allowed: false,
                    reason: `Symlink following limit exceeded: ${newCount} > ${this.limits.symlinkFollows}`,
                    recursionType: 'symlink_follows',
                    currentDepth: newCount,
                    maxDepth: this.limits.symlinkFollows,
                    isCircular: false,
                };
            }
            return {
                allowed: true,
                reason: 'Within symlink limits',
                recursionType: 'symlink_follows',
                currentDepth: newCount,
                maxDepth: this.limits.symlinkFollows,
                isCircular: false,
            };
        }
        catch {
            return {
                allowed: true,
                reason: 'Could not check symlink',
                recursionType: 'symlink_follows',
                currentDepth: currentCount,
                maxDepth: this.limits.symlinkFollows,
                isCircular: false,
            };
        }
    }
    /**
     * Get current recursion guard status.
     */
    getStatus() {
        const state = this.loadState();
        return {
            callStackDepth: state.callStack.length,
            maxCallStackDepth: this.limits.nestedCalls,
            pathHistoryLength: state.pathHistory.length,
            circularRefsDetected: state.circularRefsDetected,
            depthCounters: state.depthCounters,
            limits: this.limits,
            sessionId: state.sessionId,
        };
    }
    /**
     * Reset recursion tracking.
     */
    reset() {
        this.saveState(this.initialState());
        AuditLogger.logSync('recursion_guard', 'RECURSION_RESET', {}, 'INFO');
    }
}
// Singleton instance
let recursionGuardInstance = null;
/**
 * Get or create the singleton recursion guard instance.
 */
export function getRecursionGuard() {
    if (recursionGuardInstance === null) {
        recursionGuardInstance = new RecursionGuard();
    }
    return recursionGuardInstance;
}
/**
 * Convenience function to check recursion limit.
 */
export function checkRecursionLimit(type, depth, target = '') {
    const guard = getRecursionGuard();
    const result = guard.checkDepth(type, depth, target);
    return [result.allowed, result.reason];
}
/**
 * Convenience function to check circular reference.
 */
export function checkCircularReference(operation, target) {
    const guard = getRecursionGuard();
    const result = guard.checkCircular(operation, target);
    return [result.allowed, result.reason];
}
/**
 * Print block message to stderr.
 */
function printBlockMessage(result) {
    console.error('');
    console.error('='.repeat(60));
    console.error('RECURSION LIMIT EXCEEDED');
    console.error('='.repeat(60));
    console.error(`Type: ${result.recursionType}`);
    console.error(`Depth: ${result.currentDepth} / ${result.maxDepth}`);
    console.error(`Circular: ${result.isCircular ? 'Yes' : 'No'}`);
    console.error(`Reason: ${result.reason}`);
    console.error('='.repeat(60));
    console.error('');
}
/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates recursion limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export function validateRecursion() {
    try {
        // Read from stdin synchronously (prevents hang on EOF issues)
        const input = getToolInputFromStdinSync();
        if (!input.tool_name) {
            return EXIT_CODES.ALLOW;
        }
        const toolName = input.tool_name.toLowerCase();
        const toolInput = input.tool_input || {};
        const guard = getRecursionGuard();
        // Task tool: Check task depth and circular
        if (toolName === 'task') {
            const taskPrompt = String(toolInput.prompt || '');
            const circularResult = guard.checkCircular('task', taskPrompt);
            if (!circularResult.allowed) {
                printBlockMessage(circularResult);
                AuditLogger.logSync('recursion_guard', 'BLOCKED', {
                    tool_name: toolName,
                    reason: circularResult.reason,
                }, 'BLOCKED');
                return EXIT_CODES.SOFT_BLOCK;
            }
        }
        // Read/Glob tool: Check directory depth
        if (toolName === 'read' || toolName === 'glob') {
            const filePath = String(toolInput.file_path || toolInput.path || '');
            if (filePath) {
                const depthResult = guard.checkDirectoryDepth(filePath);
                if (!depthResult.allowed) {
                    printBlockMessage(depthResult);
                    AuditLogger.logSync('recursion_guard', 'BLOCKED', {
                        tool_name: toolName,
                        file_path: filePath.slice(0, 200),
                        reason: depthResult.reason,
                    }, 'BLOCKED');
                    return EXIT_CODES.SOFT_BLOCK;
                }
                // Also check for symlinks
                const symlinkResult = guard.checkSymlinkDepth(filePath);
                if (!symlinkResult.allowed) {
                    printBlockMessage(symlinkResult);
                    AuditLogger.logSync('recursion_guard', 'BLOCKED', {
                        tool_name: toolName,
                        file_path: filePath.slice(0, 200),
                        reason: symlinkResult.reason,
                    }, 'BLOCKED');
                    return EXIT_CODES.SOFT_BLOCK;
                }
            }
        }
        return EXIT_CODES.ALLOW;
    }
    catch (e) {
        // On error, allow the operation (fail open for availability)
        console.error(`Recursion guard error: ${e}`);
        return EXIT_CODES.ALLOW;
    }
}
/**
 * CLI entry point for bin/ invocation.
 */
export function main() {
    process.exit(validateRecursion());
}
// CLI entry point (direct execution)
if (process.argv[1]?.endsWith('recursion-guard.js') || process.argv[1]?.endsWith('recursion-guard.ts')) {
    main();
}
//# sourceMappingURL=recursion-guard.js.map