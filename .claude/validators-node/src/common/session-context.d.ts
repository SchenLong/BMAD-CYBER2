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
/**
 * Permission grant stored in session context
 */
export interface PermissionGrant {
    granted: boolean;
    grantedAt: number;
    expiresAt: number;
    grantedBy: string;
    reason?: string | undefined;
    consumable: boolean;
    consumed: boolean;
    consumedBy?: string | undefined;
    consumedAt?: number | undefined;
}
/**
 * Session context state
 */
export interface SessionContextState {
    sessionId: string;
    parentSessionId?: string | undefined;
    createdAt: number;
    expiresAt: number;
    lastActivity: number;
    permissions: Record<string, PermissionGrant>;
    subagentIds: string[];
    metadata: {
        projectDir: string;
        userId?: string | undefined;
        hostname?: string | undefined;
        startedBy?: string | undefined;
    };
}
/**
 * Result of permission check
 */
export interface PermissionCheckResult {
    allowed: boolean;
    reason: string;
    inherited: boolean;
    sessionId: string;
    expiresIn?: number;
}
/**
 * Session Context Manager
 */
export declare class SessionContext {
    /**
     * Initialize a new session or get existing session ID
     * Called by SessionStart hook
     */
    static initSession(options?: {
        parentSessionId?: string;
        userId?: string;
        metadata?: Record<string, string>;
    }): string;
    /**
     * Get current session ID (from env or state file)
     */
    static getSessionId(): string | null;
    /**
     * Grant a permission for the current session
     * Called when BMAD_ALLOW_* env var is detected
     */
    static grantPermission(permissionType: string, options?: {
        consumable?: boolean;
        timeoutSeconds?: number;
        reason?: string;
    }): boolean;
    /**
     * Check if a permission is granted for the current session
     * This is what validators call to check inherited permissions
     */
    static checkPermission(permissionType: string, options?: {
        consume?: boolean;
        validatorName?: string;
    }): PermissionCheckResult;
    /**
     * Register a subagent with the current session
     */
    static registerSubagent(subagentId: string): boolean;
    /**
     * Extend session timeout
     */
    static extendSession(additionalSeconds?: number): boolean;
    /**
     * End the current session
     */
    static endSession(): void;
    /**
     * Get current session status (for debugging/admin)
     */
    static getStatus(): SessionContextState | null;
    /**
     * Load state from file
     */
    private static loadState;
    /**
     * Save state atomically
     */
    private static saveState;
}
/**
 * Convenience function: Check and auto-grant permission from env var
 * Use this in validators instead of directly checking env vars
 */
export declare function checkSessionPermission(permissionType: string, validatorName?: string): PermissionCheckResult;
/**
 * Convenience function: Check and consume permission (single-use)
 */
export declare function consumeSessionPermission(permissionType: string, validatorName?: string): PermissionCheckResult;
/**
 * Convenience function: Initialize session (call from SessionStart hook)
 */
export declare function initSession(): string;
/**
 * Convenience function: Get current session ID
 */
export declare function getSessionId(): string | null;
