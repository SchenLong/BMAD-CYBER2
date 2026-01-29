/**
 * Global Test Setup for BMAD CYBER2
 * Amelia's Red-Green-Refactor Performance Testing Framework
 * Updated for ES Module compatibility
 */

import { performance } from 'perf_hooks';

// Setup global console mocking (Vitest compatible)
if (typeof global.console === 'undefined') {
  global.console = console;
}

// Mock console in test environment for Vitest
if (process.env.VITEST_VERBOSE !== 'true') {
  global.console = {
    ...global.console,
    log: typeof vi !== 'undefined' ? vi.fn() : (() => {}),
    warn: typeof vi !== 'undefined' ? vi.fn() : (() => {}),
    error: typeof vi !== 'undefined' ? vi.fn() : (() => {}),
    info: typeof vi !== 'undefined' ? vi.fn() : (() => {}),
  };
}

// Performance testing utilities (ES modules compatible)
global.performance = global.performance || performance;

// BMAD test utilities
global.BMAD_TEST_UTILS = {
  // Performance measurement helper
  measurePerformance: async (fn, label) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start,
      label: label || 'unnamed operation'
    };
  },

  // Memory usage measurement
  measureMemory: () => {
    return process.memoryUsage();
  },

  // Async timeout helper
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Test data generator
  generateTestData: (size) => {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      data: `test-data-${i}`,
      timestamp: Date.now() + i
    }));
  }
};

// Global beforeEach setup (Vitest compatible)
if (typeof beforeEach !== 'undefined') {
  beforeEach(() => {
    // Clear any cached modules between tests
    if (typeof vi !== 'undefined') {
      vi.clearAllMocks();
    }

    // Reset environment variables
    process.env.BMAD_TEST_MODE = 'true';
    process.env.NODE_ENV = 'test';
  });
}

// Global afterEach cleanup (Jest compatible)
if (typeof afterEach !== 'undefined') {
  afterEach(() => {
    // Clean up any test artifacts
    if (global.gc) {
      global.gc();
    }
  });
}
