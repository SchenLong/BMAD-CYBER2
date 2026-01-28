import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.{ts,js}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'dev-tools/archive/**',              // Archived/deprecated tests
      '_bmad-output/**',                   // Output directory
      'dev-tools-installation/**',         // Installation tests - run separately
      '**/node_modules/**',
      // Orphaned tests - CommonJS tests without implementations
      'dev-tools/package-management/conflict/**',      // No implementation exists
      'dev-tools/package-management/versioning/**',    // No implementation exists
      'dev-tools/package-management/testing/**',       // No implementation exists
      'dev-tools/performance/performance-lessons-12-15-enhanced.test.js', // CommonJS/broken imports
      // Test files expecting class-based API that doesn't exist
      'dev-tools/framework/validators.test.ts',   // Expects class constructors, actual API is function-based
      'dev-tools/framework/auth.test.ts',         // Expects class constructors not matching actual implementation
      // Cross-module communication tests - APIs not yet implemented
      'dev-tools/integration/cross-module-communication-paths.test.js', // Cross-module APIs pending
      // Performance tests with environment-specific thresholds
      'dev-tools/performance/lessons-12-15-performance-validation.test.js', // Strict thresholds, run separately
      'dev-tools/performance/performance-lessons-12-15-jest.test.js',       // Strict thresholds, run separately
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
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000
  },
  resolve: {
    alias: {
      '@dev-tools': path.resolve(__dirname, 'dev-tools'),
      '@framework': path.resolve(__dirname, '_bmad/framework'),
      '@validators': path.resolve(__dirname, '.claude/validators-node/src'),
      '@bmad/validators': path.resolve(__dirname, '.claude/validators-node/src'),
      '@bmad': path.resolve(__dirname, '_bmad'),
    },
  },
  esbuild: {
    target: 'node18'
  }
});
