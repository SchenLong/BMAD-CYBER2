/**
 * BMAD BUILD TIME MODULE - EPIC 5.7
 * Build time profiling and analysis exports
 *
 * @module automation/build-time
 * @version 1.0.0
 * @epic Epic 5 - Story 5.7: Build Performance Optimization
 */

export { BuildTimeProfiler } from './build-time-profiler';

export interface BuildTimeMetrics {
  totalDuration: number;
  phases: PhaseMetrics[];
  hotspots: Hotspot[];
  recommendations: string[];
}

export interface PhaseMetrics {
  name: string;
  duration: number;
  percentage: number;
  startTime: number;
  endTime: number;
}

export interface Hotspot {
  location: string;
  duration: number;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

/**
 * Quick build time analysis utility
 */
export function analyzeBuildTime(startTime: number, endTime: number): {
  duration: number;
  formatted: string;
  performance: 'fast' | 'acceptable' | 'slow';
} {
  const duration = endTime - startTime;
  const seconds = duration / 1000;

  let formatted: string;
  if (seconds < 60) {
    formatted = `${seconds.toFixed(2)}s`;
  } else if (seconds < 3600) {
    formatted = `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
  } else {
    formatted = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  let performance: 'fast' | 'acceptable' | 'slow';
  if (seconds < 30) {
    performance = 'fast';
  } else if (seconds < 120) {
    performance = 'acceptable';
  } else {
    performance = 'slow';
  }

  return { duration, formatted, performance };
}
