import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'dev-tools/performance/**/*.test.{js,ts}',
      'dev-tools/performance/**/*.spec.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'dev-tools-installation/**',
      'dev-tools/integration/**',
      'dev-tools/unit/**'
    ],
    timeout: 600000, // 10 minutes for performance tests
    testTimeout: 600000,
    hookTimeout: 120000,
    teardownTimeout: 60000,
    coverage: {
      enabled: false // Disable coverage for performance tests
    },
    setupFiles: ['./dev-tools/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './dev-tools/reports/performance-test-results.json'
    },
    benchmark: {
      include: [
        'dev-tools/performance/**/*.bench.{js,ts}'
      ],
      reporter: ['verbose', 'json'],
      outputFile: './dev-tools/reports/benchmark-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@dev-tools': path.resolve(__dirname, 'dev-tools'),
      '@framework': path.resolve(__dirname, 'framework/src'),
    },
  },
  esbuild: {
    target: 'node18'
  }
});