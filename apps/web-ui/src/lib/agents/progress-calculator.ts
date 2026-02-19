/**
 * Progress Calculator
 *
 * Utilities for calculating agent progress percentage and
 * estimated remaining time based on step completion.
 */

import type { AgentStep } from '@/types/events';

/**
 * Time estimator for calculating remaining execution time.
 */
export class TimeEstimator {
  private startTime: number;
  private steps: Array<{ id: string; startTime: number; duration: number }> = [];

  constructor(startTime: number = Date.now()) {
    this.startTime = startTime;
  }

  /**
   * Record the start of a step.
   *
   * @param stepId - The step identifier
   */
  recordStepStart(stepId: string): void {
    this.steps.push({
      id: stepId,
      startTime: Date.now(),
      duration: 0,
    });
  }

  /**
   * Record the completion of a step.
   *
   * @param stepId - The step identifier
   */
  recordStepComplete(stepId: string): void {
    const step = this.steps.find((s) => s.id === stepId);
    if (step) {
      step.duration = Date.now() - step.startTime;
    }
  }

  /**
   * Calculate progress percentage based on completed steps.
   *
   * @param currentStepIndex - Index of the current step (0-based)
   * @param steps - Array of all steps in the workflow
   * @param inProgress - Whether the current step is in progress (adds half weight)
   * @returns Progress percentage (0-100)
   */
  static calculateProgress(
    currentStepIndex: number,
    steps: readonly AgentStep[],
    inProgress: boolean = true
  ): number {
    let progress = 0;

    // Add weights of all completed steps
    for (let i = 0; i < currentStepIndex; i++) {
      progress += steps[i]?.weight || 0;
    }

    // Add half of current step's weight if in progress
    if (inProgress && currentStepIndex < steps.length) {
      progress += (steps[currentStepIndex]?.weight || 0) / 2;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  }

  /**
   * Calculate progress for a specific step completion.
   *
   * @param stepIndex - Index of the completed step (0-based)
   * @param steps - Array of all steps in the workflow
   * @returns Progress percentage (0-100)
   */
  static calculateStepProgress(
    stepIndex: number,
    steps: readonly AgentStep[]
  ): number {
    let progress = 0;

    // Add weights of all completed steps including the current one
    for (let i = 0; i <= stepIndex; i++) {
      progress += steps[i]?.weight || 0;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  }

  /**
   * Get estimated remaining time based on historical step durations.
   *
   * @param remainingSteps - Number of steps remaining
   * @returns Estimated remaining time in milliseconds
   */
  getEstimatedRemaining(remainingSteps: number = 0): number {
    if (this.steps.length < 2 || remainingSteps <= 0) {
      return 0;
    }

    // Calculate average duration of completed steps
    const completedSteps = this.steps.filter((s) => s.duration > 0);

    if (completedSteps.length === 0) {
      return 0;
    }

    // Use recent steps (last 5 or all if less) for more accurate estimation
    const recentSteps = completedSteps.slice(-5);
    const avgDuration =
      recentSteps.reduce((sum, step) => sum + step.duration, 0) / recentSteps.length;

    return Math.round(avgDuration * remainingSteps);
  }

  /**
   * Get estimated remaining time using a simpler approach.
   *
   * @param totalSteps - Total number of steps
   * @param currentStepIndex - Current step index (0-based)
   * @returns Estimated remaining time in milliseconds
   */
  getSimpleEstimatedRemaining(totalSteps: number, currentStepIndex: number): number {
    const elapsed = Date.now() - this.startTime;
    const completedSteps = currentStepIndex;
    const remainingSteps = totalSteps - currentStepIndex;

    if (completedSteps <= 0 || remainingSteps <= 0) {
      return 0;
    }

    // If we have recorded step data, use it for better estimation
    if (this.steps.length >= 2) {
      const completedStepRecords = this.steps.filter((s) => s.duration > 0);
      if (completedStepRecords.length > 0) {
        const avgDuration = completedStepRecords.reduce((sum, step) => sum + step.duration, 0) / completedStepRecords.length;
        return Math.round(avgDuration * remainingSteps);
      }
    }

    // Fallback: Use elapsed time for estimation
    const avgTimePerStep = elapsed / completedSteps;
    return Math.round(avgTimePerStep * remainingSteps);
  }

  /**
   * Format milliseconds as human-readable time string.
   *
   * @param ms - Milliseconds to format
   * @returns Formatted time string (e.g., "2m 30s", "45s", "< 1s")
   */
  static formatTimeRemaining(ms: number): string {
    if (ms < 1000) {
      return '< 1s';
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    if (minutes > 0) {
      const secs = seconds % 60;
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }

    return `${seconds}s`;
  }

  /**
   * Get the elapsed time since the estimator was created.
   *
   * @returns Elapsed time in milliseconds
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get all recorded steps.
   *
   * @returns Array of recorded steps with timing info
   */
  getSteps(): Array<{ id: string; startTime: number; duration: number }> {
    return [...this.steps];
  }

  /**
   * Reset the estimator.
   *
   * @param newStartTime - Optional new start time (defaults to current time)
   */
  reset(newStartTime?: number): void {
    this.startTime = newStartTime ?? Date.now();
    this.steps = [];
  }
}

/**
 * Calculate progress for a given step index.
 *
 * @param currentStepIndex - Current step index (0-based)
 * @param steps - Array of all steps
 * @param inProgress - Whether current step is in progress
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  currentStepIndex: number,
  steps: readonly AgentStep[],
  inProgress: boolean = true
): number {
  return TimeEstimator.calculateProgress(currentStepIndex, steps, inProgress);
}

/**
 * Calculate step completion progress.
 *
 * @param stepIndex - Index of completed step
 * @param steps - Array of all steps
 * @returns Progress percentage (0-100)
 */
export function calculateStepProgress(
  stepIndex: number,
  steps: readonly AgentStep[]
): number {
  return TimeEstimator.calculateStepProgress(stepIndex, steps);
}

/**
 * Format time duration as human-readable string.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string
 */
export function formatDuration(ms: number): string {
  return TimeEstimator.formatTimeRemaining(ms);
}

/**
 * Create a new time estimator instance.
 *
 * @param startTime - Optional start time (defaults to current time)
 * @returns New TimeEstimator instance
 */
export function createTimeEstimator(startTime?: number): TimeEstimator {
  return new TimeEstimator(startTime);
}
