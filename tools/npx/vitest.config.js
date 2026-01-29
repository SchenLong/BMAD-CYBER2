import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable ESM support
    environment: 'node',

    // Test file patterns
    include: ['**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.config.js',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      // Coverage thresholds - 80% minimum
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
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
