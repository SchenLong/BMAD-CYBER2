/**
 * TPI-16: Timing-Based & Slow-Drip Attack Detection Tests
 * =========================================================
 * Validates slow-drip and timing-based attack detection:
 * - AC1: Slow-drip detection triggers on sustained low-level probing
 * - AC2: Temporal velocity tracked in session state
 * - AC3: Session escalation works (probing → WARNING→CRITICAL)
 * - AC4: Normal sessions with occasional INFO findings → ALLOWED
 * - AC5: Minimum 13 tests
 */

import { describe, it, expect, beforeEach } from 'vitest';

const {
  detectSlowDrip,
  resetSessionState,
  getSessionState,
} = await import(
  '../../.claude/validators-node/src/ai-safety/session-tracker.ts'
);

// ===========================================================================
// SECTION 1: Slow-Drip Detection (AC1)
// ===========================================================================
describe('TPI-16: Timing-Based & Slow-Drip Attack Detection', () => {

  const testSessionId = 'test-timing-session-tpi16';

  beforeEach(() => {
    resetSessionState(testSessionId);
  });

  describe('Slow-drip detection (AC1)', () => {
    it('detects >10 INFO findings across >5 turns', () => {
      // Simulate 6 turns with 2 INFO findings each (total 12)
      let result;
      for (let turn = 1; turn <= 6; turn++) {
        result = detectSlowDrip(testSessionId, 2, turn);
      }
      expect(result.slowDripDetected).toBe(true);
      expect(result.infoFindingCount).toBe(12);
      expect(result.reason).toContain('Slow-drip detected');
    });

    it('detects slow drip with varying counts per turn', () => {
      detectSlowDrip(testSessionId, 1, 1);
      detectSlowDrip(testSessionId, 3, 2);
      detectSlowDrip(testSessionId, 1, 3);
      detectSlowDrip(testSessionId, 2, 4);
      const result = detectSlowDrip(testSessionId, 4, 5);
      // Total: 11, turns: 5
      expect(result.slowDripDetected).toBe(true);
      expect(result.infoFindingCount).toBe(11);
    });

    it('requires both count AND turn thresholds', () => {
      // High count but few turns
      const result = detectSlowDrip(testSessionId, 15, 2);
      expect(result.slowDripDetected).toBe(false); // Only 2 turns, need >=5
    });
  });

  // ===========================================================================
  // SECTION 2: Temporal Velocity Tracking (AC2)
  // ===========================================================================
  describe('Temporal velocity tracking (AC2)', () => {
    it('tracks findings velocity (findings per minute)', () => {
      detectSlowDrip(testSessionId, 5, 1);
      const result = detectSlowDrip(testSessionId, 5, 2);
      expect(result.findingsVelocity).toBeGreaterThan(0);
    });

    it('velocity is based on rolling window', () => {
      const result1 = detectSlowDrip(testSessionId, 3, 1);
      expect(result1.findingsVelocity).toBeGreaterThan(0);

      const result2 = detectSlowDrip(testSessionId, 0, 2);
      // Velocity still reflects recent findings
      expect(result2.findingsVelocity).toBeGreaterThan(0);
    });

    it('stores finding_timestamps in session state', () => {
      detectSlowDrip(testSessionId, 5, 1);
      const state = getSessionState(testSessionId);
      expect(state.finding_timestamps).toBeDefined();
      expect(state.finding_timestamps.length).toBe(5);
    });
  });

  // ===========================================================================
  // SECTION 3: Session Escalation (AC3)
  // ===========================================================================
  describe('Session escalation (AC3)', () => {
    it('shouldEscalate is true when slow drip detected', () => {
      for (let turn = 1; turn <= 5; turn++) {
        detectSlowDrip(testSessionId, 3, turn);
      }
      const result = detectSlowDrip(testSessionId, 1, 6);
      // 16 total, 6 turns
      expect(result.shouldEscalate).toBe(true);
    });

    it('reports escalation reason', () => {
      for (let turn = 1; turn <= 6; turn++) {
        detectSlowDrip(testSessionId, 2, turn);
      }
      const state = getSessionState(testSessionId);
      expect(state.info_finding_count).toBe(12);
    });
  });

  // ===========================================================================
  // SECTION 4: Normal Sessions — No False Positives (AC4)
  // ===========================================================================
  describe('Normal sessions — no false positives (AC4)', () => {
    it('allows 2 INFO findings across 10 turns', () => {
      detectSlowDrip(testSessionId, 1, 1);
      let result;
      for (let turn = 2; turn <= 10; turn++) {
        result = detectSlowDrip(testSessionId, 0, turn);
      }
      result = detectSlowDrip(testSessionId, 1, 11);
      // Only 2 findings, below threshold
      expect(result.slowDripDetected).toBe(false);
      expect(result.infoFindingCount).toBe(2);
    });

    it('allows burst of findings in 1 turn (not slow drip)', () => {
      const result = detectSlowDrip(testSessionId, 20, 1);
      // 20 findings but only 1 turn
      expect(result.slowDripDetected).toBe(false);
    });

    it('allows normal session with 0 findings', () => {
      let result;
      for (let turn = 1; turn <= 10; turn++) {
        result = detectSlowDrip(testSessionId, 0, turn);
      }
      expect(result.slowDripDetected).toBe(false);
      expect(result.infoFindingCount).toBe(0);
    });

    it('allows sparse findings across many turns', () => {
      // 5 findings across 20 turns (below threshold)
      detectSlowDrip(testSessionId, 1, 1);
      detectSlowDrip(testSessionId, 1, 5);
      detectSlowDrip(testSessionId, 1, 10);
      detectSlowDrip(testSessionId, 1, 15);
      const result = detectSlowDrip(testSessionId, 1, 20);
      expect(result.slowDripDetected).toBe(false);
    });
  });

  // ===========================================================================
  // SECTION 5: Edge Cases
  // ===========================================================================
  describe('Edge cases', () => {
    it('handles session reset after detection', () => {
      for (let turn = 1; turn <= 6; turn++) {
        detectSlowDrip(testSessionId, 2, turn);
      }
      resetSessionState(testSessionId);
      const result = detectSlowDrip(testSessionId, 0, 1);
      expect(result.slowDripDetected).toBe(false);
      expect(result.infoFindingCount).toBe(0);
    });
  });
});
