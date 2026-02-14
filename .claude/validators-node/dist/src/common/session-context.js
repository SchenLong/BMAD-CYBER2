/**
 * BMAD Validators - Session Context Manager
 * ==========================================
 * Manages session-scoped state for permission inheritance across subagents.
 *
 * Problem Solved:
 *   - Environment variables don't propagate to subagent processes
 *   - Single-use override tokens get consumed by first process
 *   - Parallel agents race on shared state files
 *
 * Solution:
 *   - Create a session context that persists across all agents in a session
 *   - Permissions granted to parent session apply to all subagents
 *   - Session ID propagated via environment variable (BMAD_SESSION_ID)
 *   - File-based shared state with proper locking
 *
 * Usage:
 *   1. SessionStart hook creates session context
 *   2. Parent grants permissions (BMAD_ALLOW_* env vars)
 *   3. Permissions stored in session context with expiry
 *   4. Subagents check session context for inherited permissions
 *   5. Session context cleaned up on session end or timeout
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { getProjectDir } from './path-utils.js';
// Configuration
const SESSION_TIMEOUT_SECONDS = 3600; // 1 hour default session timeout
const PERMISSION_TIMEOUT_SECONDS = 300; // 5 minutes for granted permissions
const LOCK_TIMEOUT_MS = 5000;
const LOCK_RETRY_INTERVAL_MS = 50;
/**
 * Get session context file path
 */
function getContextFile() {
    return path.join(getProjectDir(), '.claude', '.session_context.json');
}
/**
 * Get lock file path
 */
function getLockFile() {
    return path.join(getProjectDir(), '.claude', '.session_context.lock');
}
/**
 * Acquire exclusive lock
 */
function acquireLock(timeout = LOCK_TIMEOUT_MS) {
    const lockFile = getLockFile();
    const dir = path.dirname(lockFile);
    fs.mkdirSync(dir, { recursive: true });
    const startTime = Date.now();
    while (true) {
        try {
            const fd = fs.openSync(lockFile, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR);
            return fd;
        }
        catch (err) {
            const error = err;
            if (error.code === 'EEXIST') {
                // Check for stale lock
                try {
                    const stats = fs.statSync(lockFile);
                    if (Date.now() - stats.mtimeMs > 30000) {
                        fs.unlinkSync(lockFile);
                        continue;
                    }
                }
                catch {
                    // Lock may have been removed
                }
                if (Date.now() - startTime > timeout) {
                    return null;
                }
                // Wait and retry
                Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, LOCK_RETRY_INTERVAL_MS);
                continue;
            }
            throw err;
        }
    }
}
/**
 * Release lock
 */
function releaseLock(fd) {
    try {
        fs.closeSync(fd);
    }
    catch {
        // Ignore
    }
    try {
        fs.unlinkSync(getLockFile());
    }
    catch {
        // Ignore
    }
}
/**
 * Generate a unique session ID
 */
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString('hex');
    return `bmad-${timestamp}-${random}`;
}
/**
 * Session Context Manager
 */
export class SessionContext {
    /**
     * Initialize a new session or get existing session ID
     * Called by SessionStart hook
     */
    static initSession(options) {
        const lockFd = acquireLock();
        if (lockFd === null) {
            // Generate session ID even if we can't lock
            const sessionId = process.env['BMAD_SESSION_ID'] || generateSessionId();
            console.error(`[session_context] Warning: Could not acquire lock, using session ${sessionId}`);
            return sessionId;
        }
        try {
            // Check for existing valid session
            const existing = this.loadState();
            const now = Date.now() / 1000;
            if (existing && existing.expiresAt > now) {
                // Update last activity
                existing.lastActivity = now;
                this.saveState(existing);
                // Set environment variable for subagents
                process.env['BMAD_SESSION_ID'] = existing.sessionId;
                return existing.sessionId;
            }
            // Create new session
            const sessionId = generateSessionId();
            const state = {
                sessionId,
                parentSessionId: options?.parentSessionId || process.env['BMAD_PARENT_SESSION_ID'],
                createdAt: now,
                expiresAt: now + SESSION_TIMEOUT_SECONDS,
                lastActivity: now,
                permissions: {},
                subagentIds: [],
                metadata: {
                    projectDir: getProjectDir(),
                    userId: options?.userId,
                    hostname: process.env['HOSTNAME'] || process.env['HOST'],
                    startedBy: process.env['USER'] || 'unknown',
                },
            };
            this.saveState(state);
            // Set environment variable for subagents
            process.env['BMAD_SESSION_ID'] = sessionId;
            return sessionId;
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * Get current session ID (from env or state file)
     */
    static getSessionId() {
        // First check environment variable
        const envSessionId = process.env['BMAD_SESSION_ID'];
        if (envSessionId) {
            return envSessionId;
        }
        // Check state file
        const state = this.loadState();
        if (state && state.expiresAt > Date.now() / 1000) {
            return state.sessionId;
        }
        return null;
    }
    /**
     * Grant a permission for the current session
     * Called when BMAD_ALLOW_* env var is detected
     */
    static grantPermission(permissionType, options) {
        const lockFd = acquireLock();
        if (lockFd === null) {
            console.error(`[session_context] Could not acquire lock to grant ${permissionType}`);
            return false;
        }
        try {
            let state = this.loadState();
            const now = Date.now() / 1000;
            // Initialize session if needed
            if (!state || state.expiresAt < now) {
                this.initSession();
                state = this.loadState();
                if (!state) {
                    console.error(`[session_context] Failed to initialize session`);
                    return false;
                }
            }
            // Update last activity
            state.lastActivity = now;
            // Grant permission
            const expiresIn = options?.timeoutSeconds || PERMISSION_TIMEOUT_SECONDS;
            state.permissions[permissionType] = {
                granted: true,
                grantedAt: now,
                expiresAt: now + expiresIn,
                grantedBy: process.env['BMAD_AGENT_ID'] || `pid-${process.pid}`,
                reason: options?.reason,
                consumable: options?.consumable ?? false, // Default: NOT consumable (session-wide)
                consumed: false,
            };
            this.saveState(state);
            return true;
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * Check if a permission is granted for the current session
     * This is what validators call to check inherited permissions
     */
    static checkPermission(permissionType, options) {
        const sessionId = this.getSessionId();
        // First check environment variable (immediate grant)
        const envVar = `BMAD_ALLOW_${permissionType.toUpperCase()}`;
        const envValue = (process.env[envVar] || '').toLowerCase();
        if (envValue === 'true') {
            // Grant it to session context for inheritance
            this.grantPermission(permissionType, {
                consumable: false, // Session-wide permission
                reason: `Granted via ${envVar} environment variable`,
            });
            return {
                allowed: true,
                reason: `Granted via ${envVar} (session-scoped)`,
                inherited: false,
                sessionId: sessionId || 'unknown',
            };
        }
        // Check session context
        const lockFd = acquireLock(2000); // Shorter timeout for reads
        if (lockFd === null) {
            return {
                allowed: false,
                reason: 'Could not acquire lock to check permissions',
                inherited: false,
                sessionId: sessionId || 'unknown',
            };
        }
        try {
            const state = this.loadState();
            const now = Date.now() / 1000;
            if (!state || state.expiresAt < now) {
                return {
                    allowed: false,
                    reason: 'No active session',
                    inherited: false,
                    sessionId: sessionId || 'unknown',
                };
            }
            const permission = state.permissions[permissionType];
            if (!permission) {
                return {
                    allowed: false,
                    reason: `Permission ${permissionType} not granted in session`,
                    inherited: false,
                    sessionId: state.sessionId,
                };
            }
            // Check if expired
            if (permission.expiresAt < now) {
                return {
                    allowed: false,
                    reason: `Permission ${permissionType} expired`,
                    inherited: false,
                    sessionId: state.sessionId,
                };
            }
            // Check if consumable and already consumed
            if (permission.consumable && permission.consumed) {
                return {
                    allowed: false,
                    reason: `Permission ${permissionType} already consumed by ${permission.consumedBy}`,
                    inherited: true,
                    sessionId: state.sessionId,
                };
            }
            // Permission is valid!
            const result = {
                allowed: true,
                reason: permission.consumable
                    ? `Permission ${permissionType} granted (consumable)`
                    : `Permission ${permissionType} granted (session-scoped)`,
                inherited: true, // It came from session context, not env var
                sessionId: state.sessionId,
                expiresIn: Math.floor(permission.expiresAt - now),
            };
            // Consume if requested and consumable
            if (options?.consume && permission.consumable) {
                permission.consumed = true;
                permission.consumedBy = options.validatorName || `pid-${process.pid}`;
                permission.consumedAt = now;
                this.saveState(state);
                result.reason = `Permission ${permissionType} consumed by ${permission.consumedBy}`;
            }
            return result;
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * Register a subagent with the current session
     */
    static registerSubagent(subagentId) {
        const lockFd = acquireLock();
        if (lockFd === null) {
            return false;
        }
        try {
            const state = this.loadState();
            if (!state) {
                return false;
            }
            if (!state.subagentIds.includes(subagentId)) {
                state.subagentIds.push(subagentId);
                state.lastActivity = Date.now() / 1000;
                this.saveState(state);
            }
            return true;
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * Extend session timeout
     */
    static extendSession(additionalSeconds) {
        const lockFd = acquireLock();
        if (lockFd === null) {
            return false;
        }
        try {
            const state = this.loadState();
            if (!state) {
                return false;
            }
            const now = Date.now() / 1000;
            state.lastActivity = now;
            state.expiresAt = now + (additionalSeconds || SESSION_TIMEOUT_SECONDS);
            this.saveState(state);
            return true;
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * End the current session
     */
    static endSession() {
        const lockFd = acquireLock();
        if (lockFd === null) {
            return;
        }
        try {
            const contextFile = getContextFile();
            if (fs.existsSync(contextFile)) {
                fs.unlinkSync(contextFile);
            }
            delete process.env['BMAD_SESSION_ID'];
        }
        finally {
            releaseLock(lockFd);
        }
    }
    /**
     * Get current session status (for debugging/admin)
     */
    static getStatus() {
        const state = this.loadState();
        if (!state) {
            return null;
        }
        const now = Date.now() / 1000;
        if (state.expiresAt < now) {
            return null;
        }
        return state;
    }
    /**
     * Load state from file
     */
    static loadState() {
        try {
            const contextFile = getContextFile();
            if (fs.existsSync(contextFile)) {
                const content = fs.readFileSync(contextFile, 'utf-8');
                return JSON.parse(content);
            }
        }
        catch {
            // Return null on error
        }
        return null;
    }
    /**
     * Save state atomically
     */
    static saveState(state) {
        const contextFile = getContextFile();
        const dir = path.dirname(contextFile);
        fs.mkdirSync(dir, { recursive: true });
        const tempFile = path.join(dir, `.session_${process.pid}_${Date.now()}.tmp`);
        fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
        fs.renameSync(tempFile, contextFile);
    }
}
/**
 * Convenience function: Check and auto-grant permission from env var
 * Use this in validators instead of directly checking env vars
 */
export function checkSessionPermission(permissionType, validatorName) {
    if (process.env['DEBUG_SESSION']) {
        console.error(`[DEBUG session-context] checkSessionPermission called: permissionType=${permissionType}, validatorName=${validatorName}`);
    }
    const result = SessionContext.checkPermission(permissionType, {
        consume: false, // Don't consume by default - session-wide
        ...(validatorName !== undefined && { validatorName }),
    });
    if (process.env['DEBUG_SESSION']) {
        console.error(`[DEBUG session-context] checkSessionPermission result:`, JSON.stringify(result));
    }
    return result;
}
/**
 * Convenience function: Check and consume permission (single-use)
 */
export function consumeSessionPermission(permissionType, validatorName) {
    return SessionContext.checkPermission(permissionType, {
        consume: true,
        ...(validatorName !== undefined && { validatorName }),
    });
}
/**
 * Convenience function: Initialize session (call from SessionStart hook)
 */
export function initSession() {
    return SessionContext.initSession();
}
/**
 * Convenience function: Get current session ID
 */
export function getSessionId() {
    return SessionContext.getSessionId();
}
//# sourceMappingURL=session-context.js.map