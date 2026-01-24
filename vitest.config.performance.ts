import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/performance/**/*.test.{js,ts}',
      'tests/performance/**/*.spec.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'test-installation/**',
      'tests/integration/**',
      'tests/unit/**'
    ],
    timeout: 600000, // 10 minutes for performance tests
    testTimeout: 600000,
    hookTimeout: 120000,
    teardownTimeout: 60000,
    coverage: {
      enabled: false // Disable coverage for performance tests
    },
    setupFiles: ['./tests/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './tests/reports/performance-test-results.json'
    },
    benchmark: {
      include: [
        'tests/performance/**/*.bench.{js,ts}'
      ],
      reporter: ['verbose', 'json'],
      outputFile: './tests/reports/benchmark-results.json'
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