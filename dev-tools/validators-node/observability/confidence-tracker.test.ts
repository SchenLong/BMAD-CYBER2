/**
 * Tests for Confidence Tracker
 * =============================
 * Validates confidence scoring and uncertainty detection.
 *
 * LESSON LEARNED: Do NOT use destructive commands like `rm -rf` in test strings.
 * Use safe alternatives like `echo INJECTED` instead.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  ConfidenceTracker,
  ConfidenceLevel,
  getConfidenceTracker,
  analyzeResponseConfidence,
  getConfidenceIndicator,
} from '../../.claude/validators-node/src/observability/confidence-tracker.js';

describe('ConfidenceTracker', () => {
  let tracker: ConfidenceTracker;

  beforeEach(() => {
    tracker = new ConfidenceTracker();
  });

  describe('analyzeText', () => {
    it('should return HIGH confidence for text without uncertainty markers', () => {
      const text = `
        The function calculateSum takes two parameters and returns their sum.
        It uses standard arithmetic operations and handles edge cases correctly.
        The implementation follows best practices and is well-documented.
      `;
      const result = tracker.analyzeText(text);

      expect(result.confidenceLevel).toBe(ConfidenceLevel.HIGH);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.85);
      expect(result.uncertaintyMarkers.length).toBe(0);
    });

    it('should detect HIGH severity uncertainty markers', () => {
      const text = `
        I'm not sure about this implementation, but I think it might work.
        I don't know if this is the best approach, and it's unclear to me
        whether this will handle all edge cases.
      `;
      const result = tracker.analyzeText(text);

      expect(result.confidenceLevel).toBe(ConfidenceLevel.VERY_LOW);
      expect(result.confidenceScore).toBeLessThan(0.45);
      const highSeverity = result.uncertaintyMarkers.filter((m) => m.severity === 'high');
      expect(highSeverity.length).toBeGreaterThan(0);
    });

    it('should detect MEDIUM severity uncertainty markers', () => {
      const text = `
        I think this approach is correct. It probably handles most cases.
        The algorithm seems like it should work, and maybe it's efficient.
        This might be the best solution, though I believe there could be alternatives.
      `;
      const result = tracker.analyzeText(text);

      // With multiple medium markers, expect LOW or VERY_LOW
      expect([ConfidenceLevel.LOW, ConfidenceLevel.VERY_LOW]).toContain(result.confidenceLevel);
      const mediumSeverity = result.uncertaintyMarkers.filter((m) => m.severity === 'medium');
      expect(mediumSeverity.length).toBeGreaterThan(3);
    });

    it('should detect LOW severity uncertainty markers', () => {
      const text = `
        Generally, this pattern is used in most cases.
        Typically, the function returns the expected value.
        Usually, depending on the input, it varies in performance.
        Sometimes the behavior differs.
      `;
      const result = tracker.analyzeText(text);

      const lowSeverity = result.uncertaintyMarkers.filter((m) => m.severity === 'low');
      expect(lowSeverity.length).toBeGreaterThan(3);
    });

    it('should detect confidence boosters', () => {
      const text = `
        The answer is definitely correct. I'm confident this implementation
        is absolutely right. The documentation states this is the proper approach,
        and the code shows exactly how it works.
      `;
      const result = tracker.analyzeText(text);

      expect(result.confidenceBoosters.length).toBeGreaterThan(2);
      expect(result.confidenceScore).toBeGreaterThan(0.8);
    });

    it('should detect code warnings like TODO and FIXME', () => {
      const text = `
        function example() {
          // TODO: Implement this properly
          // FIXME: This is a temporary hack
          # HACK: Workaround for the issue
          pass # placeholder
        }
      `;
      const result = tracker.analyzeText(text);

      expect(result.codeWarnings.length).toBeGreaterThan(2);
    });

    it('should detect source attributions', () => {
      const text = `
        According to the documentation, this function takes two parameters.
        Based on the source code, the implementation follows the specification.
        The error message shows that the input was invalid.
      `;
      const result = tracker.analyzeText(text);

      expect(result.attributions.length).toBeGreaterThan(1);
    });

    it('should skip analysis for very short texts', () => {
      const text = 'Short text';
      const result = tracker.analyzeText(text);

      expect(result.confidenceLevel).toBe(ConfidenceLevel.HIGH);
      expect(result.confidenceScore).toBe(1.0);
      expect(result.analysisNotes).toContain('Text too short for meaningful analysis');
    });

    it('should calculate score correctly with mixed signals', () => {
      const text = `
        I think this implementation is correct. According to the documentation,
        the function definitely works as expected. However, maybe there are
        edge cases I'm uncertain about. The spec says it should handle errors.
        // TODO: Add more tests
      `;
      const result = tracker.analyzeText(text);

      // Should be somewhere in the middle due to mixed signals
      expect(result.confidenceScore).toBeGreaterThan(0.3);
      expect(result.confidenceScore).toBeLessThan(0.9);
    });
  });

  describe('scoreToLevel thresholds', () => {
    it('should map HIGH for score >= 0.85', () => {
      // Create text that results in high confidence
      const text = 'The answer is definitely correct and well documented. '.repeat(5);
      const result = tracker.analyzeText(text);
      if (result.confidenceScore >= 0.85) {
        expect(result.confidenceLevel).toBe(ConfidenceLevel.HIGH);
      }
    });

    it('should map MEDIUM for 0.65 <= score < 0.85', () => {
      // Create text with some uncertainty
      const text = 'I think this might work. It probably handles most cases. '.repeat(3);
      const result = tracker.analyzeText(text);
      if (result.confidenceScore >= 0.65 && result.confidenceScore < 0.85) {
        expect(result.confidenceLevel).toBe(ConfidenceLevel.MEDIUM);
      }
    });

    it('should map LOW for 0.45 <= score < 0.65', () => {
      const text =
        "I'm not sure but I think maybe this works. I believe it probably handles some cases. ".repeat(
          2
        );
      const result = tracker.analyzeText(text);
      if (result.confidenceScore >= 0.45 && result.confidenceScore < 0.65) {
        expect(result.confidenceLevel).toBe(ConfidenceLevel.LOW);
      }
    });

    it('should map VERY_LOW for score < 0.45', () => {
      const text = `
        I don't know if this is right. I'm not sure about anything.
        It's unclear to me and hard to say. I'm uncertain and guessing.
        Cannot be certain, no way to know. I'm guessing this might fail.
      `;
      const result = tracker.analyzeText(text);
      expect(result.confidenceLevel).toBe(ConfidenceLevel.VERY_LOW);
      expect(result.confidenceScore).toBeLessThan(0.45);
    });
  });

  describe('display indicators', () => {
    it('should return appropriate indicator for HIGH confidence', () => {
      const text = 'The answer is definitely correct. '.repeat(5);
      const result = tracker.analyzeText(text);
      if (result.confidenceLevel === ConfidenceLevel.HIGH) {
        expect(result.displayIndicator).toContain('HIGH');
      }
    });

    it('should return warning for LOW confidence', () => {
      const text = "I'm not sure and don't know. Maybe it works but unclear to me. ".repeat(3);
      const result = tracker.analyzeText(text);
      if (
        result.confidenceLevel === ConfidenceLevel.LOW ||
        result.confidenceLevel === ConfidenceLevel.VERY_LOW
      ) {
        expect(result.displayIndicator).toMatch(/LOW|caution|verify/i);
      }
    });
  });

  describe('session stats', () => {
    it('should return session statistics', () => {
      const stats = tracker.getSessionStats();

      expect(stats).toHaveProperty('session_id');
      expect(stats).toHaveProperty('analyses_count');
      expect(stats).toHaveProperty('average_confidence');
    });
  });
});

describe('Convenience Functions', () => {
  describe('analyzeResponseConfidence', () => {
    it('should return tuple of level, score, and indicator', () => {
      const text = 'This is a test response with some content that is long enough to analyze.';
      const [level, score, indicator] = analyzeResponseConfidence(text);

      expect(typeof level).toBe('string');
      expect(typeof score).toBe('number');
      expect(typeof indicator).toBe('string');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('getConfidenceIndicator', () => {
    it('should return display indicator string', () => {
      const text =
        'This is a response that definitely explains the correct answer according to documentation.';
      const indicator = getConfidenceIndicator(text);

      expect(typeof indicator).toBe('string');
    });
  });

  describe('getConfidenceTracker', () => {
    it('should return singleton instance', () => {
      const tracker1 = getConfidenceTracker();
      const tracker2 = getConfidenceTracker();

      expect(tracker1).toBe(tracker2);
    });
  });
});
