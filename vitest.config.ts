import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.claude/validators-node/tests/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        'framework/**/*.ts',
        '_bmad/core/**/*.ts',
        'src/**/*.ts'
      ],
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    testTimeout: 15000,
    hookTimeout: 15000
  },
  resolve: {
    alias: {
      '@': './src',
      '@framework': './framework',
      '@bmad': './_bmad'
    },
  },
});