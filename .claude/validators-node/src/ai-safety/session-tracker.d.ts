/**
 * BMAD Validators - Session Security State Tracker
 * ==================================================
 * Tracks security patterns across conversation turns to detect gradual
 * escalation attacks that bypass single-turn detection.
 *
 * Tracks: jailbreak patterns, fragment buffers, URL reputation,
 * image loads, timing velocity, and social engineering patterns.
 *
 * Security Features:
 * - Temporal decay to prevent false positives from old patterns
 * - Category-based repetition detection
 * - Accumulated weight threshold monitoring
 * - Atomic file operations for concurrent safety
 * - Backward-compatible migration from .jailbreak_session.json (TPI-PRE-2)
 *
 * Reference: SECURITY-MITIGATION-PLAN.md Section P0-2
 */
/**
 * Half-life for temporal decay in milliseconds (10 minutes).
 * After 10 minutes, accumulated weight decays to 50%.
 */
export declare const DECAY_HALF_LIFE_MS = 600000;
/**
 * Threshold for accumulated weight to trigger escalation.
 * If total accumulated weight exceeds this, escalate severity.
 */
export declare const ACCUMULATION_THRESHOLD = 15;
/**
 * Threshold for same-category repetition.
 * If the same pattern category appears this many times, escalate.
 */
export declare const CATEGORY_REPEAT_THRESHOLD = 3;
/**
 * Session timeout in milliseconds (1 hour).
 * Sessions older than this are considered expired.
 */
export declare const SESSION_TIMEOUT_MS = 3600000;
/**
 * Individual pattern finding from jailbreak detection.
 */
export interface SessionPatternFinding {
    category: string;
    weight: number;
    pattern_name?: string;
    timestamp?: number;
}
/**
 * Individual session state.
 */
export interface SessionPatternState {
    session_id: string;
    patterns_by_category: Record<string, number>;
    accumulated_weight: number;
    last_updated: number;
    turn_count: number;
    findings_history: Array<{
        turn: number;
        timestamp: number;
        categories: string[];
        weight: number;
    }>;
    /** TPI-13: Fragment buffer tracking partial injection keywords across turns */
    fragment_buffer: string[];
    /** TPI-11: Cumulative instruction count across turns for many-shot detection */
    instruction_count: number;
    /** TPI-16: Cumulative INFO-level finding count for slow-drip detection */
    info_finding_count: number;
    /** TPI-16: Timestamps of recent findings for velocity calculation */
    finding_timestamps: number[];
}
/**
 * Result from session state update.
 */
export interface SessionUpdateResult {
    shouldEscalate: boolean;
    reason: string;
    riskScore: number;
    turnCount: number;
    repeatedCategories: string[];
}
/**
 * Load session state from file with temporal decay applied.
 *
 * @param sessionId - The session identifier
 * @returns Session state with decay applied
 */
export declare function getSessionState(sessionId: string): SessionPatternState;
/**
 * Update session state with new findings and check for escalation.
 *
 * @param sessionId - The session identifier
 * @param findings - Array of pattern findings from current turn
 * @returns Result indicating whether to escalate and why
 */
export declare function updateSessionState(sessionId: string, findings: SessionPatternFinding[]): SessionUpdateResult;
/**
 * Reset session state (for testing or admin purposes).
 */
export declare function resetSessionState(sessionId: string): void;
/**
 * Check if a session is currently escalated without updating.
 */
export declare function isSessionEscalated(sessionId: string): {
    escalated: boolean;
    reason: string;
    riskScore: number;
};
/**
 * TPI-13: Update fragment buffer with content from current turn.
 * Extracts suspicious keywords, stores across turns, and checks
 * if combined fragments form injection patterns.
 *
 * @returns Array of findings if combined fragments match patterns
 */
export declare function updateFragmentBuffer(sessionId: string, content: string): Array<{
    pattern_name: string;
    severity: string;
    combined_text: string;
}>;
/**
 * TPI-11: Track instruction count per turn in session state.
 * Flags if cumulative instruction count across turns exceeds threshold.
 *
 * @returns Object indicating if session-level many-shot is detected
 */
export declare function updateInstructionCount(sessionId: string, instructionCount: number): {
    manyShotDetected: boolean;
    cumulativeCount: number;
};
/**
 * Result from slow-drip detection.
 */
export interface SlowDripResult {
    slowDripDetected: boolean;
    reason: string;
    infoFindingCount: number;
    findingsVelocity: number;
    shouldEscalate: boolean;
}
/**
 * TPI-16: Detect slow-drip injection attacks.
 * Tracks cumulative INFO-level findings across session turns.
 * Flags if >10 INFO findings across >5 turns within 30 minutes.
 *
 * @param sessionId - The session identifier
 * @param infoCount - Number of INFO-level findings in current turn
 * @param turnCount - Current turn number
 * @returns Detection result with velocity and escalation info
 */
export declare function detectSlowDrip(sessionId: string, infoCount: number, turnCount: number): SlowDripResult;
/**
 * Get session statistics for debugging/monitoring.
 */
export declare function getSessionStats(sessionId: string): {
    turnCount: number;
    accumulatedWeight: number;
    categoryCounts: Record<string, number>;
    lastUpdated: number;
    isExpired: boolean;
};
