import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable ESM support
    environment: 'node',

    // Test file patterns
    include: ['**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules', 'dist'],

    // VAL-11-001: Memory optimization to prevent OOM
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        execArgv: ['--max-old-space-size=4096']
      }
    },
    isolate: true,
    maxConcurrency: 1,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/downloader.js',
        'lib/extractor.js',
        'lib/package-merger.js',
        'lib/config.js',
      ],
      exclude: [
        'node_modules/',
        'vitest.config.js',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      // Coverage thresholds - 80% minimum for core lib modules
      // Note: git-clone.js, logger.js, utils.js are tested via mocking
      // and are excluded from coverage measurement
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Globals for cleaner test syntax
    globals: true,

    // Reporter configuration
    reporters: ['verbose'],

    // Timeout for async tests
    testTimeout: 10000,
  },
});
