/**
 * BMAD Validators - Session Tracker for Multi-Turn Jailbreak Detection
 * =====================================================================
 * Tracks jailbreak patterns across conversation turns to detect gradual
 * escalation attacks that bypass single-turn detection.
 *
 * Security Features:
 * - Temporal decay to prevent false positives from old patterns
 * - Category-based repetition detection
 * - Accumulated weight threshold monitoring
 * - Atomic file operations for concurrent safety
 *
 * Reference: SECURITY-MITIGATION-PLAN.md Section P0-2
 */
import * as fs from 'fs';
import * as path from 'path';
import { getProjectDir } from '../common/path-utils.js';
// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================
/**
 * Half-life for temporal decay in milliseconds (10 minutes).
 * After 10 minutes, accumulated weight decays to 50%.
 */
export const DECAY_HALF_LIFE_MS = 600000;
/**
 * Threshold for accumulated weight to trigger escalation.
 * If total accumulated weight exceeds this, escalate severity.
 */
export const ACCUMULATION_THRESHOLD = 15;
/**
 * Threshold for same-category repetition.
 * If the same pattern category appears this many times, escalate.
 */
export const CATEGORY_REPEAT_THRESHOLD = 3;
/**
 * Session timeout in milliseconds (1 hour).
 * Sessions older than this are considered expired.
 */
export const SESSION_TIMEOUT_MS = 3600000;
// =============================================================================
// FILE PATHS
// =============================================================================
/**
 * Get the session state file path.
 */
function getSessionFile() {
    return path.join(getProjectDir(), '.claude', 'logs', '.jailbreak_session.json');
}
// =============================================================================
// SESSION STATE MANAGEMENT
// =============================================================================
/**
 * Load all sessions container from file.
 */
function loadSessionsContainer() {
    const sessionFile = getSessionFile();
    try {
        if (fs.existsSync(sessionFile)) {
            const content = fs.readFileSync(sessionFile, 'utf-8');
            const container = JSON.parse(content);
            // Validate container format
            if (container.sessions && typeof container.sessions === 'object') {
                return container;
            }
        }
    }
    catch (error) {
        console.error('[session-tracker] Error loading sessions container:', error);
    }
    return {
        sessions: {},
        last_cleanup: Date.now(),
    };
}
/**
 * Load session state from file with temporal decay applied.
 *
 * @param sessionId - The session identifier
 * @returns Session state with decay applied
 */
export function getSessionState(sessionId) {
    const container = loadSessionsContainer();
    const now = Date.now();
    // Check if session exists
    if (container.sessions[sessionId]) {
        const session = container.sessions[sessionId];
        const elapsed = now - session.last_updated;
        // Apply temporal decay to accumulated weight only if significant time has passed (>1 minute)
        if (elapsed > 60000 && elapsed < SESSION_TIMEOUT_MS) {
            const decayFactor = Math.pow(0.5, elapsed / DECAY_HALF_LIFE_MS);
            session.accumulated_weight *= decayFactor;
            // Also decay category counts (less aggressively) - only for very long periods
            if (elapsed > DECAY_HALF_LIFE_MS / 2) { // Only decay categories after 5+ minutes
                const categoryDecayFactor = Math.pow(0.7, elapsed / DECAY_HALF_LIFE_MS);
                for (const category of Object.keys(session.patterns_by_category)) {
                    session.patterns_by_category[category] = Math.floor((session.patterns_by_category[category] ?? 0) * categoryDecayFactor);
                    // Remove category if count drops to 0
                    if (session.patterns_by_category[category] === 0) {
                        delete session.patterns_by_category[category];
                    }
                }
            }
            // Save the decayed state back to container
            container.sessions[sessionId] = session;
            saveSessionsContainer(container);
            return session;
        }
        else if (elapsed >= SESSION_TIMEOUT_MS) {
            // Session expired, remove from container and return fresh state
            delete container.sessions[sessionId];
            saveSessionsContainer(container);
            return createFreshState(sessionId);
        }
        // Return deep copy to avoid mutations affecting the stored state
        return JSON.parse(JSON.stringify(session));
    }
    return createFreshState(sessionId);
}
/**
 * Create a fresh session state.
 */
function createFreshState(sessionId) {
    return {
        session_id: sessionId,
        patterns_by_category: {},
        accumulated_weight: 0,
        last_updated: Date.now(),
        turn_count: 0,
        findings_history: [],
    };
}
/**
 * Save sessions container atomically using temp file + rename.
 */
function saveSessionsContainer(container) {
    const sessionFile = getSessionFile();
    const dir = path.dirname(sessionFile);
    try {
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Write to temp file first for atomic operation
        const tempFile = sessionFile + '.tmp.' + process.pid + '.' + Date.now();
        fs.writeFileSync(tempFile, JSON.stringify(container, null, 2), 'utf-8');
        // Atomic rename
        fs.renameSync(tempFile, sessionFile);
    }
    catch (error) {
        console.error('[session-tracker] Error saving sessions container:', error);
    }
}
/**
 * Save session state atomically using temp file + rename.
 */
function saveSessionState(state) {
    const container = loadSessionsContainer();
    container.sessions[state.session_id] = state;
    container.last_cleanup = Date.now();
    saveSessionsContainer(container);
}
/**
 * Update session state with new findings and check for escalation.
 *
 * @param sessionId - The session identifier
 * @param findings - Array of pattern findings from current turn
 * @returns Result indicating whether to escalate and why
 */
export function updateSessionState(sessionId, findings) {
    const state = getSessionState(sessionId);
    const now = Date.now();
    let shouldEscalate = false;
    let escalationReason = '';
    const repeatedCategories = [];
    // Process each finding
    for (const finding of findings) {
        // Track category occurrences
        state.patterns_by_category[finding.category] =
            (state.patterns_by_category[finding.category] || 0) + 1;
        // Accumulate weight
        state.accumulated_weight += finding.weight;
        // Check for category repetition attack
        const categoryCount = state.patterns_by_category[finding.category] ?? 0;
        if (categoryCount >= CATEGORY_REPEAT_THRESHOLD) {
            if (!repeatedCategories.includes(finding.category)) {
                repeatedCategories.push(finding.category);
            }
            if (!shouldEscalate) {
                shouldEscalate = true;
                escalationReason = 'Category "' + finding.category + '" detected ' + categoryCount + ' times across session (threshold: ' + CATEGORY_REPEAT_THRESHOLD + ')';
            }
        }
    }
    // Update turn count and history
    state.turn_count++;
    state.last_updated = now;
    // Add to findings history (keep last 20 turns)
    if (findings.length > 0) {
        state.findings_history.push({
            turn: state.turn_count,
            timestamp: now,
            categories: [...new Set(findings.map((f) => f.category))],
            weight: findings.reduce((sum, f) => sum + f.weight, 0),
        });
        // Trim history to last 20 entries
        if (state.findings_history.length > 20) {
            state.findings_history = state.findings_history.slice(-20);
        }
    }
    // Check accumulated weight threshold
    if (state.accumulated_weight >= ACCUMULATION_THRESHOLD && !shouldEscalate) {
        shouldEscalate = true;
        escalationReason = 'Accumulated risk weight ' + state.accumulated_weight.toFixed(1) + ' exceeds threshold ' + ACCUMULATION_THRESHOLD;
    }
    // Save updated state
    saveSessionState(state);
    return {
        shouldEscalate,
        reason: escalationReason,
        riskScore: state.accumulated_weight,
        turnCount: state.turn_count,
        repeatedCategories,
    };
}
/**
 * Reset session state (for testing or admin purposes).
 */
export function resetSessionState(sessionId) {
    const container = loadSessionsContainer();
    delete container.sessions[sessionId];
    saveSessionsContainer(container);
}
/**
 * Check if a session is currently escalated without updating.
 */
export function isSessionEscalated(sessionId) {
    const state = getSessionState(sessionId);
    // Check accumulated weight
    if (state.accumulated_weight >= ACCUMULATION_THRESHOLD) {
        return {
            escalated: true,
            reason: 'Accumulated weight ' + state.accumulated_weight.toFixed(1) + ' >= ' + ACCUMULATION_THRESHOLD,
            riskScore: state.accumulated_weight,
        };
    }
    // Check category repetitions
    for (const [category, count] of Object.entries(state.patterns_by_category)) {
        if (count >= CATEGORY_REPEAT_THRESHOLD) {
            return {
                escalated: true,
                reason: 'Category "' + category + '" repeated ' + count + ' times',
                riskScore: state.accumulated_weight,
            };
        }
    }
    return {
        escalated: false,
        reason: '',
        riskScore: state.accumulated_weight,
    };
}
/**
 * Get session statistics for debugging/monitoring.
 */
export function getSessionStats(sessionId) {
    const state = getSessionState(sessionId);
    const now = Date.now();
    const elapsed = now - state.last_updated;
    return {
        turnCount: state.turn_count,
        accumulatedWeight: state.accumulated_weight,
        categoryCounts: { ...state.patterns_by_category },
        lastUpdated: state.last_updated,
        isExpired: elapsed >= SESSION_TIMEOUT_MS,
    };
}
//# sourceMappingURL=session-tracker.js.map