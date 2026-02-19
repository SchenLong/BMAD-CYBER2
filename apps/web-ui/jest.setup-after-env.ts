/**
 * Jest Setup After Environment
 *
 * Global cleanup and configuration that runs after the test environment is set up.
 * This file handles resetting singletons and cleaning up resources between tests.
 */

import { jest } from '@jest/globals';

// Set a shorter default timeout for all tests
jest.setTimeout(10000);

// Store original setInterval/setTimeout to restore after tests
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

// Track all intervals created during tests
const activeIntervals: Set<ReturnType<typeof setInterval>> = new Set();

// Override setInterval to track intervals
global.setInterval = function<T extends (...args: unknown[]) => unknown>(
  handler: T,
  timeout?: number,
  ...args: unknown[]
): ReturnType<typeof setInterval> {
  const intervalId = originalSetInterval(handler, timeout as number, ...args);
  activeIntervals.add(intervalId);
  return intervalId;
} as typeof setInterval;

// Override clearInterval to also remove from tracking
global.clearInterval = function(intervalId: ReturnType<typeof setInterval>): void {
  activeIntervals.delete(intervalId);
  originalClearInterval(intervalId);
} as typeof clearInterval;

// Global afterEach to clean up resources
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Restore all mocks to their original implementations
  jest.restoreAllMocks();

  // Clear all tracked intervals to prevent hanging
  for (const intervalId of activeIntervals) {
    originalClearInterval(intervalId);
  }
  activeIntervals.clear();
});

// Add a global teardown for the entire test suite
afterAll(async () => {
  // Clear any remaining intervals/timeouts
  jest.clearAllTimers();

  // Clear any tracked intervals that might remain
  for (const intervalId of activeIntervals) {
    originalClearInterval(intervalId);
  }
  activeIntervals.clear();

  // Restore original functions
  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
});

// Mock console methods to reduce noise in tests (optional - can be disabled for debugging)
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Export a helper function to reset singletons
export function resetSingleton<T>(singletonModule: () => T, resetFn: (instance: T) => void): void {
  try {
    const instance = singletonModule();
    if (instance && typeof instance === 'object') {
      resetFn(instance);
    }
  } catch (error) {
    // Ignore errors during reset
  }
}

// Helper to clear Maps and Sets
export function clearCollections(obj: unknown): void {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value instanceof Map) {
        value.clear();
      } else if (value instanceof Set) {
        value.clear();
      }
    }
  }
}
