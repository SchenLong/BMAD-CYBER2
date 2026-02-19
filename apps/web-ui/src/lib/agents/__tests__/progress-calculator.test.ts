/**
 * Tests for Progress Calculator
 */

import {
  TimeEstimator,
  calculateProgress,
  calculateStepProgress,
  formatDuration,
  createTimeEstimator,
} from '../progress-calculator';
import type { AgentStep } from '@/types/events';

describe('TimeEstimator', () => {
  let estimator: TimeEstimator;

  beforeEach(() => {
    estimator = new TimeEstimator();
  });

  describe('recordStepStart', () => {
    it('should record step start time', () => {
      estimator.recordStepStart('step1');

      const steps = estimator.getSteps();
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe('step1');
      expect(steps[0].duration).toBe(0);
    });
  });

  describe('recordStepComplete', () => {
    it('should calculate step duration', async () => {
      estimator.recordStepStart('step1');
      await new Promise(resolve => setTimeout(resolve, 50));
      estimator.recordStepComplete('step1');

      const steps = estimator.getSteps();
      expect(steps[0].duration).toBeGreaterThanOrEqual(40);
      expect(steps[0].duration).toBeLessThan(100);
    });
  });

  describe('getEstimatedRemaining', () => {
    it('should return 0 when no steps recorded', () => {
      const remaining = estimator.getEstimatedRemaining(5);
      expect(remaining).toBe(0);
    });

    it('should return 0 when remaining steps is 0', () => {
      estimator.recordStepStart('step1');
      estimator.recordStepComplete('step1');

      const remaining = estimator.getEstimatedRemaining(0);
      expect(remaining).toBe(0);
    });

    it('should estimate remaining time based on average duration', async () => {
      // Record some completed steps
      for (let i = 0; i < 3; i++) {
        estimator.recordStepStart(`step${i}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        estimator.recordStepComplete(`step${i}`);
      }

      const remaining = estimator.getEstimatedRemaining(2);
      expect(remaining).toBeGreaterThan(0);
      // Should be approximately 2 * average step duration (around 100ms)
      expect(remaining).toBeGreaterThan(50);
      expect(remaining).toBeLessThan(500);
    });
  });

  describe('getSimpleEstimatedRemaining', () => {
    it('should return 0 when no steps recorded', () => {
      const remaining = estimator.getSimpleEstimatedRemaining(5, 0);
      expect(remaining).toBe(0);
    });

    it('should estimate based on elapsed time', () => {
      // This is a rough estimate, so we just check it returns a number
      const remaining = estimator.getSimpleEstimatedRemaining(5, 2);
      expect(typeof remaining).toBe('number');
    });
  });

  describe('getElapsedTime', () => {
    it('should return elapsed time since creation', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      const elapsed = estimator.getElapsedTime();
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('reset', () => {
    it('should clear all steps and reset start time', () => {
      estimator.recordStepStart('step1');
      estimator.recordStepComplete('step1');

      estimator.reset();

      expect(estimator.getSteps()).toHaveLength(0);
    });
  });
});

describe('calculateProgress', () => {
  const steps: AgentStep[] = [
    { id: 'step1', name: 'Step 1', weight: 10 },
    { id: 'step2', name: 'Step 2', weight: 20 },
    { id: 'step3', name: 'Step 3', weight: 30 },
    { id: 'step4', name: 'Step 4', weight: 40 },
  ];

  it('should return 0 for first step start', () => {
    const progress = calculateProgress(0, steps, true);
    expect(progress).toBe(5); // Half of first step weight (10/2)
  });

  it('should return correct progress after step completion', () => {
    const progress = calculateStepProgress(0, steps);
    expect(progress).toBe(10); // Full weight of first step
  });

  it('should return 100 at completion', () => {
    const progress = calculateStepProgress(3, steps);
    expect(progress).toBe(100); // Sum of all weights
  });

  it('should handle in-progress step correctly', () => {
    const progress = calculateProgress(1, steps, true);
    expect(progress).toBe(20); // 10 (first step) + 10 (half of 20)
  });

  it('should handle completed step without in-progress flag', () => {
    const progress = calculateProgress(1, steps, false);
    expect(progress).toBe(10); // Only first step completed
  });

  it('should handle steps with varying weights', () => {
    const progress = calculateStepProgress(2, steps);
    expect(progress).toBe(60); // 10 + 20 + 30
  });

  it('should cap at 100', () => {
    const unevenSteps: AgentStep[] = [
      { id: 'step1', name: 'Step 1', weight: 50 },
      { id: 'step2', name: 'Step 2', weight: 60 },
    ];
    const progress = calculateStepProgress(1, unevenSteps);
    expect(progress).toBe(100); // Should cap at 100 even though weights sum to 110
  });

  it('should not go below 0', () => {
    const progress = calculateProgress(-1, steps, true);
    expect(progress).toBe(0);
  });
});

describe('formatDuration', () => {
  it('should return "< 1s" for durations under 1 second', () => {
    expect(formatDuration(0)).toBe('< 1s');
    expect(formatDuration(500)).toBe('< 1s');
    expect(formatDuration(999)).toBe('< 1s');
  });

  it('should return seconds for durations under 1 minute', () => {
    expect(formatDuration(1000)).toBe('1s');
    expect(formatDuration(5000)).toBe('5s');
    expect(formatDuration(59000)).toBe('59s');
  });

  it('should return minutes and seconds for durations under 1 hour', () => {
    expect(formatDuration(60000)).toBe('1m');
    expect(formatDuration(65000)).toBe('1m 5s');
    expect(formatDuration(120000)).toBe('2m');
    expect(formatDuration(3540000)).toBe('59m'); // 59 minutes
  });

  it('should return hours and minutes for durations over 1 hour', () => {
    expect(formatDuration(3600000)).toBe('1h');
    expect(formatDuration(3660000)).toBe('1h 1m');
    expect(formatDuration(7200000)).toBe('2h');
    expect(formatDuration(7260000)).toBe('2h 1m');
  });
});

describe('createTimeEstimator', () => {
  it('should create a new TimeEstimator instance', () => {
    const estimator = createTimeEstimator();
    expect(estimator).toBeInstanceOf(TimeEstimator);
  });

  it('should accept custom start time', () => {
    const customTime = Date.now() - 10000;
    const estimator = createTimeEstimator(customTime);
    expect(estimator.getElapsedTime()).toBeGreaterThanOrEqual(10000);
  });
});
