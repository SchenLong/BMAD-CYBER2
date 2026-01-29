import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.{ts,js}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'dev-tools/archive/**',              // Archived tests - deprecated
      '_bmad-output/**',                   // Output directory
      'dev-tools-installation/**',         // Installation tests - run separately
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        '_bmad/framework/**/*.ts',
        '_bmad/core/**/*.ts',
        '.claude/validators-node/src/**/*.ts'
      ],
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        'node_modules/**',
        'dist/**',
        'dev-tools/**',
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
      '@framework': './_bmad/framework',
      '@validators': './.claude/validators-node/src',
      '@bmad': './_bmad'
    },
  },
});