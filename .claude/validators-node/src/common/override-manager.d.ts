/**
 * BMAD Validators - Override Manager
 * ====================================
 * Manages single-use override tokens with timeout and TOCTOU protection.
 *
 * Instead of allowing global environment variables to persist indefinitely,
 * this manager creates time-limited, single-use override tokens.
 *
 * Override workflow:
 * 1. User sets BMAD_ALLOW_<TYPE>=true
 * 2. First validator to check consumes the override (atomic)
 * 3. Override becomes invalid after use OR after timeout
 *
 * Security Note:
 *   Uses atomic file operations to prevent race conditions where multiple
 *   processes could consume the same override.
 *
 * Session Context Integration (NEW):
 *   When BMAD_SESSION_PERMISSIONS=true, overrides are session-scoped:
 *   - Permissions granted to parent session apply to all subagents
 *   - Subagents inherit permissions without consuming them
 *   - Session permissions persist for the session duration (not single-use)
 */
import type { OverrideCheckResult, OverrideStatus } from '../types/index.js';
/**
 * Override Manager class for managing single-use override tokens.
 */
export declare class OverrideManager {
    /**
     * Register an override from environment variable.
     * Called when env var is detected but not yet consumed.
     *
     * @param overrideType - The type of override (e.g., 'DANGEROUS', 'SECRETS')
     */
    static register(overrideType: string): void;
    /**
     * Check if override is available and consume it atomically.
     * Uses validator identification to prevent race conditions (SEC-001-3).
     *
     * NEW: Session-scoped permissions
     *   When BMAD_SESSION_PERMISSIONS=true (default), permissions are session-scoped:
     *   - First check session context for inherited permissions
     *   - If not in session, fall back to single-use override behavior
     *   - Subagents automatically inherit parent session permissions
     *
     * @param overrideType - The type of override to check
     * @param validatorName - Optional name of the validator consuming the token
     * @returns Result with validity and reason
     */
    static checkAndConsume(overrideType: string, validatorName?: string): OverrideCheckResult;
    /**
     * Get current status of all overrides (for debugging/admin).
     */
    static getStatus(): Record<string, OverrideStatus> | {
        error: string;
    };
}
