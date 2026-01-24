import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/integration/**/*.test.{js,ts}',
      'tests/integration/**/*.spec.{js,ts}',
      'tests/integration/**/bmad-cross-module-integration-tests.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'test-installation/**',
      'tests/fixtures/**',
      'tests/reports/**',
      'tests/coverage/**'
    ],
    timeout: 300000, // 5 minutes for integration tests
    testTimeout: 300000,
    hookTimeout: 60000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'tests/integration/**/*.{js,ts}',
        'framework/src/**/*.{js,ts}',
        'src/**/*.{js,ts}'
      ],
      exclude: [
        'tests/**/*.test.{js,ts}',
        'tests/**/*.spec.{js,ts}',
        'node_modules/**',
        'dist/**'
      ],
    },
    setupFiles: ['./tests/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './tests/reports/integration-test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests'),
      '@framework': path.resolve(__dirname, 'framework/src'),
    },
  },
  esbuild: {
    target: 'node18'
  }
});