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
/** Current schema version for session state files. */
const SCHEMA_VERSION = 2;
/** New session state filename (TPI-PRE-2). */
const SESSION_FILENAME = '.session_security_state.json';
/** Legacy filename for backward-compatible migration. */
const LEGACY_SESSION_FILENAME = '.jailbreak_session.json';
/**
 * Get the session state file path.
 * On first access, auto-migrates legacy .jailbreak_session.json if it exists.
 */
function getSessionFile() {
    const dir = path.join(getProjectDir(), '.claude', 'logs');
    const newFile = path.join(dir, SESSION_FILENAME);
    const oldFile = path.join(dir, LEGACY_SESSION_FILENAME);
    // Backward compat: migrate old file if new doesn't exist yet
    if (!fs.existsSync(newFile) && fs.existsSync(oldFile)) {
        try {
            fs.renameSync(oldFile, newFile);
        }
        catch {
            // If rename fails, proceed with new file (will create fresh)
        }
    }
    return newFile;
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
                // Stamp schema_version on legacy containers missing it
                if (!container.schema_version) {
                    container.schema_version = SCHEMA_VERSION;
                }
                return container;
            }
        }
    }
    catch (error) {
        console.error('[session-tracker] Error loading sessions container:', error);
    }
    return {
        schema_version: SCHEMA_VERSION,
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
    const existingSession = container.sessions[sessionId];
    if (existingSession) {
        const session = existingSession;
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
            // Return the decayed session object directly (not a copy, since we just modified it)
            return session;
        }
        else if (elapsed >= SESSION_TIMEOUT_MS) {
            // Session expired, remove from container and return fresh state
            delete container.sessions[sessionId];
            saveSessionsContainer(container);
            return createFreshState(sessionId);
        }
        // Return the session object directly from the container
        // No deep copy needed since we're reading current state
        return session;
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
        fragment_buffer: [],
        instruction_count: 0,
        info_finding_count: 0,
        finding_timestamps: [],
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
        const tempFile = `${sessionFile}.tmp.${process.pid}.${Date.now()}`;
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
                escalationReason = `Category "${finding.category}" detected ${categoryCount} times across session (threshold: ${CATEGORY_REPEAT_THRESHOLD})`;
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
        escalationReason = `Accumulated risk weight ${state.accumulated_weight.toFixed(1)} exceeds threshold ${ACCUMULATION_THRESHOLD}`;
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
            reason: `Accumulated weight ${state.accumulated_weight.toFixed(1)} >= ${ACCUMULATION_THRESHOLD}`,
            riskScore: state.accumulated_weight,
        };
    }
    // Check category repetitions
    for (const [category, count] of Object.entries(state.patterns_by_category)) {
        if (count >= CATEGORY_REPEAT_THRESHOLD) {
            return {
                escalated: true,
                reason: `Category "${category}" repeated ${count} times`,
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
// =============================================================================
// TPI-13: FRAGMENT BUFFER TRACKING
// =============================================================================
/** Maximum total characters in fragment buffer */
const MAX_FRAGMENT_BUFFER_CHARS = 500;
/** Maximum number of fragments to track */
const MAX_FRAGMENT_COUNT = 5;
/** Keywords that indicate partial injection fragments */
const FRAGMENT_KEYWORDS = /\b(ignore|bypass|override|disable|remove|forget|reveal|show|previous|prior|instructions?|rules?|system|prompt|safety|jailbreak|unrestricted|constraints?|restrictions?)\b/gi;
/**
 * TPI-13: Update fragment buffer with content from current turn.
 * Extracts suspicious keywords, stores across turns, and checks
 * if combined fragments form injection patterns.
 *
 * @returns Array of findings if combined fragments match patterns
 */
export function updateFragmentBuffer(sessionId, content) {
    const state = getSessionState(sessionId);
    // Initialize fragment_buffer if missing (backward compat)
    if (!state.fragment_buffer) {
        state.fragment_buffer = [];
    }
    // Extract suspicious keywords from current turn
    const keywords = content.match(FRAGMENT_KEYWORDS);
    if (!keywords || keywords.length === 0) {
        return [];
    }
    // Add unique keywords to buffer (deduplicate within same turn)
    const uniqueKeywords = [...new Set(keywords.map((k) => k.toLowerCase()))];
    const newFragment = uniqueKeywords.join(' ');
    // Add to buffer, respecting size limits
    state.fragment_buffer.push(newFragment);
    // Enforce max count
    if (state.fragment_buffer.length > MAX_FRAGMENT_COUNT) {
        state.fragment_buffer = state.fragment_buffer.slice(-MAX_FRAGMENT_COUNT);
    }
    // Enforce max total chars
    let totalChars = state.fragment_buffer.reduce((sum, f) => sum + f.length, 0);
    while (totalChars > MAX_FRAGMENT_BUFFER_CHARS && state.fragment_buffer.length > 1) {
        state.fragment_buffer.shift();
        totalChars = state.fragment_buffer.reduce((sum, f) => sum + f.length, 0);
    }
    // Concatenate all fragments and scan for patterns
    const combinedText = state.fragment_buffer.join(' ');
    const findings = [];
    // Only check if we have fragments from multiple turns (>=2)
    if (state.fragment_buffer.length >= 2) {
        // Import detectPatterns dynamically to avoid circular deps
        // We check for common injection phrase patterns in combined text
        const injectionPhrases = [
            { pattern: /ignore\s+(?:all\s+)?(?:previous|prior)\s+(?:instructions?|rules?)/i, name: 'fragmented_ignore_instructions' },
            { pattern: /bypass\s+(?:all\s+)?(?:safety|security|restrictions?|constraints?)/i, name: 'fragmented_bypass_safety' },
            { pattern: /override\s+(?:all\s+)?(?:system|instructions?|rules?)/i, name: 'fragmented_override_system' },
            { pattern: /disable\s+(?:all\s+)?(?:safety|restrictions?|constraints?|rules?)/i, name: 'fragmented_disable_safety' },
            { pattern: /reveal\s+(?:system\s+)?prompt/i, name: 'fragmented_reveal_prompt' },
            { pattern: /jailbreak\s+(?:unrestricted|system)/i, name: 'fragmented_jailbreak' },
            { pattern: /remove\s+(?:all\s+)?(?:restrictions?|constraints?|safety)/i, name: 'fragmented_remove_restrictions' },
            { pattern: /forget\s+(?:all\s+)?(?:previous|prior)?\s*(?:rules?|instructions?)/i, name: 'fragmented_forget_rules' },
        ];
        for (const phrase of injectionPhrases) {
            if (phrase.pattern.test(combinedText)) {
                findings.push({
                    pattern_name: phrase.name,
                    severity: 'WARNING',
                    combined_text: combinedText.slice(0, 200),
                });
            }
        }
    }
    // Save updated state
    saveSessionState(state);
    return findings;
}
// =============================================================================
// TPI-11: SESSION-LEVEL MANY-SHOT TRACKING
// =============================================================================
/** Threshold for cumulative instruction count across turns */
const SESSION_INSTRUCTION_THRESHOLD = 50;
/**
 * TPI-11: Track instruction count per turn in session state.
 * Flags if cumulative instruction count across turns exceeds threshold.
 *
 * @returns Object indicating if session-level many-shot is detected
 */
export function updateInstructionCount(sessionId, instructionCount) {
    const state = getSessionState(sessionId);
    // Initialize instruction_count if missing (backward compat)
    if (!state.instruction_count) {
        state.instruction_count = 0;
    }
    state.instruction_count += instructionCount;
    saveSessionState(state);
    return {
        manyShotDetected: state.instruction_count > SESSION_INSTRUCTION_THRESHOLD,
        cumulativeCount: state.instruction_count,
    };
}
// =============================================================================
// TPI-16: SLOW-DRIP & TIMING-BASED ATTACK DETECTION
// =============================================================================
/** Minimum INFO findings to trigger slow-drip detection */
const SLOW_DRIP_INFO_THRESHOLD = 10;
/** Minimum turns for slow-drip (must be spread across turns, not burst) */
const SLOW_DRIP_TURN_THRESHOLD = 5;
/** Maximum elapsed time (ms) for slow-drip window (30 minutes) */
const SLOW_DRIP_WINDOW_MS = 1800000;
/** Rolling window for velocity calculation (10 minutes) */
const VELOCITY_WINDOW_MS = 600000;
/** Maximum finding timestamps to retain */
const MAX_FINDING_TIMESTAMPS = 100;
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
export function detectSlowDrip(sessionId, infoCount, turnCount) {
    const state = getSessionState(sessionId);
    const now = Date.now();
    // Initialize fields if missing (backward compat)
    if (!state.info_finding_count) {
        state.info_finding_count = 0;
    }
    if (!state.finding_timestamps) {
        state.finding_timestamps = [];
    }
    // Update counters
    state.info_finding_count += infoCount;
    // Record timestamps for velocity tracking
    for (let i = 0; i < infoCount; i++) {
        state.finding_timestamps.push(now);
    }
    // Trim old timestamps outside velocity window
    state.finding_timestamps = state.finding_timestamps.filter((t) => now - t < VELOCITY_WINDOW_MS);
    // Cap timestamp array size
    if (state.finding_timestamps.length > MAX_FINDING_TIMESTAMPS) {
        state.finding_timestamps = state.finding_timestamps.slice(-MAX_FINDING_TIMESTAMPS);
    }
    // Calculate velocity (findings per minute in rolling window)
    const velocityWindowFindings = state.finding_timestamps.length;
    const findingsVelocity = velocityWindowFindings > 0
        ? velocityWindowFindings / (VELOCITY_WINDOW_MS / 60000)
        : 0;
    // Check slow-drip conditions
    const elapsed = now - (state.last_updated || now);
    const withinWindow = elapsed < SLOW_DRIP_WINDOW_MS;
    const enoughFindings = state.info_finding_count > SLOW_DRIP_INFO_THRESHOLD;
    const spreadAcrossTurns = turnCount >= SLOW_DRIP_TURN_THRESHOLD;
    const slowDripDetected = enoughFindings && spreadAcrossTurns && withinWindow;
    // Save updated state
    saveSessionState(state);
    return {
        slowDripDetected,
        reason: slowDripDetected
            ? `Slow-drip detected: ${state.info_finding_count} INFO findings across ${turnCount} turns`
            : '',
        infoFindingCount: state.info_finding_count,
        findingsVelocity,
        shouldEscalate: slowDripDetected,
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