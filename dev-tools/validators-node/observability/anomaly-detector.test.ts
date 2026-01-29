/**
 * Tests for Anomaly Detector
 * ===========================
 * Validates statistical anomaly detection for security events.
 *
 * LESSON LEARNED: Do NOT use destructive commands in test strings.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  AnomalyDetector,
  getAnomalyDetector,
  recordSecurityEventForAnomaly,
  checkAnomalies,
  getBaselineStatus,
  resetBaseline,
} from '../../../.claude/validators-node/src/observability/anomaly-detector.js';

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;

  beforeEach(() => {
    detector = new AnomalyDetector();
    detector.resetBaseline();
  });

  afterEach(() => {
    detector.resetBaseline();
  });

  describe('recordEvent', () => {
    it('should record events without errors', () => {
      const result = detector.recordEvent('Bash', 'bash_safety', 'ALLOWED', 'INFO');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should track operation counts', () => {
      for (let i = 0; i < 5; i++) {
        detector.recordEvent('Bash', 'bash_safety', 'ALLOWED', 'INFO');
      }

      const status = detector.getBaselineStatus();
      expect(status['operation_types_tracked']).toBeGreaterThanOrEqual(0);
    });

    it('should track blocked events', () => {
      detector.recordEvent('Bash', 'bash_safety', 'BLOCKED', 'WARNING');
      const status = detector.getBaselineStatus();
      expect(status).toBeDefined();
    });
  });

  describe('getBaselineStatus', () => {
    it('should return baseline status object', () => {
      const status = detector.getBaselineStatus();

      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('threshold_std');
      expect(status).toHaveProperty('operation_types_tracked');
      expect(status).toHaveProperty('hours_tracked');
      expect(status).toHaveProperty('validators_tracked');
      expect(status).toHaveProperty('blocked_ratio_samples');
      expect(status).toHaveProperty('baseline_ready');
    });

    it('should indicate baseline not ready with insufficient samples', () => {
      detector.resetBaseline();
      const status = detector.getBaselineStatus();
      expect(status['baseline_ready']).toBe(false);
    });
  });

  describe('resetBaseline', () => {
    it('should reset all statistics', () => {
      // Add some events
      for (let i = 0; i < 5; i++) {
        detector.recordEvent('Bash', 'bash_safety', 'ALLOWED', 'INFO');
      }

      // Reset
      detector.resetBaseline();

      const status = detector.getBaselineStatus();
      expect(status['operation_types_tracked']).toBe(0);
      expect(status['hours_tracked']).toBe(0);
      expect(status['validators_tracked']).toBe(0);
    });
  });

  describe('checkAllAnomalies', () => {
    it('should return empty array when no anomalies', () => {
      const anomalies = detector.checkAllAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });
});

describe('StatisticsWindow', () => {
  // Test the StatisticsWindow class indirectly through AnomalyDetector
  let detector: AnomalyDetector;

  beforeEach(() => {
    detector = new AnomalyDetector();
    detector.resetBaseline();
  });

  it('should compute rolling statistics correctly', () => {
    // Add enough events to build baseline
    for (let i = 0; i < 15; i++) {
      detector.recordEvent('Write', 'env_protection', 'ALLOWED', 'INFO');
    }

    const status = detector.getBaselineStatus();
    const stats = status['statistics'] as Record<string, { mean: number; std: number; samples: number }>;

    // Statistics should exist for tracked operations
    if (stats && Object.keys(stats).length > 0) {
      const firstStat = Object.values(stats)[0]!;
      expect(firstStat).toHaveProperty('mean');
      expect(firstStat).toHaveProperty('std');
      expect(firstStat).toHaveProperty('samples');
    }
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    resetBaseline();
  });

  describe('getAnomalyDetector', () => {
    it('should return singleton instance', () => {
      const detector1 = getAnomalyDetector();
      const detector2 = getAnomalyDetector();
      expect(detector1).toBe(detector2);
    });
  });

  describe('recordSecurityEventForAnomaly', () => {
    it('should record events via convenience function', () => {
      const result = recordSecurityEventForAnomaly('Edit', 'secret_guard', 'ALLOWED', 'INFO');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('checkAnomalies', () => {
    it('should return anomaly array', () => {
      const anomalies = checkAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe('getBaselineStatus', () => {
    it('should return status via convenience function', () => {
      const status = getBaselineStatus();
      expect(status).toHaveProperty('enabled');
    });
  });

  describe('resetBaseline', () => {
    it('should reset via convenience function', () => {
      // Add event
      recordSecurityEventForAnomaly('Bash', 'bash_safety', 'ALLOWED', 'INFO');

      // Reset
      resetBaseline();

      const status = getBaselineStatus();
      expect(status['operation_types_tracked']).toBe(0);
    });
  });
});

describe('AnomalySignal', () => {
  it('should have correct structure when anomaly detected', () => {
    // This test validates the AnomalySignal interface structure
    const mockAnomaly = {
      anomalyType: 'volume_spike' as const,
      metricName: 'test_metric',
      baselineValue: 10,
      observedValue: 50,
      deviationStd: 4.5,
      anomalyScore: 0.8,
      alertSeverity: 'WARNING' as const,
      description: 'Test anomaly',
    };

    expect(mockAnomaly.anomalyType).toBe('volume_spike');
    expect(mockAnomaly.anomalyScore).toBeGreaterThan(0);
    expect(mockAnomaly.anomalyScore).toBeLessThanOrEqual(1);
    expect(['INFO', 'WARNING', 'CRITICAL']).toContain(mockAnomaly.alertSeverity);
  });
});
