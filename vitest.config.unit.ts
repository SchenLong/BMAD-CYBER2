import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.test.{js,ts}',
      'tests/unit/**/*.spec.{js,ts}',
      'framework/tests/**/*.test.{js,ts}',
      '.claude/validators-node/tests/**/*.test.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '_bmad-output/**',
      'test-installation/**',
      'tests/integration/**',
      'tests/performance/**'
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
        'tests/**',
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
    setupFiles: ['./tests/config/test-setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './tests/reports/unit-test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests'),
      '@framework': path.resolve(__dirname, 'framework/src'),
      '@validators': path.resolve(__dirname, '.claude/validators-node/src'),
    },
  },
  esbuild: {
    target: 'node18'
  }
});