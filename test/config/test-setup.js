/**
 * Global Test Setup for BMAD CYBER2
 * Amelia's Red-Green-Refactor Performance Testing Framework
 */

// Global test timeout
jest.setTimeout(30000);

// Mock console in test environment
global.console = {
  ...global.console,
  log: process.env.JEST_VERBOSE === 'true' ? console.log : jest.fn(),
  warn: process.env.JEST_VERBOSE === 'true' ? console.warn : jest.fn(),
  error: process.env.JEST_VERBOSE === 'true' ? console.error : jest.fn(),
  info: process.env.JEST_VERBOSE === 'true' ? console.info : jest.fn(),
};

// Performance testing utilities
global.performance = global.performance || require('perf_hooks').performance;

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

// Global beforeEach setup
beforeEach(() => {
  // Clear any cached modules between tests
  jest.clearAllMocks();
  
  // Reset environment variables
  process.env.BMAD_TEST_MODE = 'true';
  process.env.NODE_ENV = 'test';
});

// Global afterEach cleanup
afterEach(() => {
  // Clean up any test artifacts
  if (global.gc) {
    global.gc();
  }
});
