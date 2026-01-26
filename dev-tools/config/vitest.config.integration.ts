import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'dev-tools/integration/**/*.test.{js,ts}',
      'dev-tools/integration/**/*.spec.{js,ts}',
      'dev-tools/integration/**/bmad-cross-module-integration-tests.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'dev-tools-installation/**',
      'dev-tools/fixtures/**',
      'dev-tools/reports/**',
      'dev-tools/coverage/**'
    ],
    timeout: 300000, // 5 minutes for integration tests
    testTimeout: 300000,
    hookTimeout: 60000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'dev-tools/integration/**/*.{js,ts}',
        'framework/src/**/*.{js,ts}',
        'src/**/*.{js,ts}'
      ],
      exclude: [
        'dev-tools/**/*.test.{js,ts}',
        'dev-tools/**/*.spec.{js,ts}',
        'node_modules/**',
        'dist/**'
      ],
    },
    setupFiles: ['./dev-tools/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './dev-tools/reports/integration-test-results.json'
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