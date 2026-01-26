import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'dev-tools/unit/**/*.test.{js,ts}',
      'dev-tools/unit/**/*.spec.{js,ts}',
      'dev-tools/validators-node/**/*.test.{js,ts}',
      'dev-tools/package-management/**/*.test.{js,ts}',
      'dev-tools/performance/**/*.test.{js,ts}',
      'dev-tools/automation/**/*.test.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'dev-tools-installation/**',
      'dev-tools/integration/**',
      'dev-tools/performance/**'
    ],
    timeout: 60000, // 1 minute for unit tests
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'framework/src/**/*.{js,ts}',
        '.claude/validators-node/src/**/*.{js,ts}',
        'src/**/*.{js,ts}'
      ],
      exclude: [
        'dev-tools/**',
        'node_modules/**',
        'dist/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    setupFiles: ['./dev-tools/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './dev-tools/reports/unit-test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@dev-tools': path.resolve(__dirname, 'dev-tools'),
      '@framework': path.resolve(__dirname, 'framework/src'),
      '@validators': path.resolve(__dirname, '.claude/validators-node/src'),
    },
  },
  esbuild: {
    target: 'node18'
  }
});