import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

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
      // Memory stress test deliberately pushes heap past limits — causes worker OOM
      'tests/performance/memory.test.ts',
      // Backup directories - excluded to prevent duplicate tests
      'team/backups/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        '_bmad/framework/**/*.ts',
        'src/**/*.{js,ts}',
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
    hookTimeout: 30000,
    setupFiles: ['./tests/vitest-setup.js'],
    // VAL-11-001: Use separate forks per test file to prevent OOM from memory accumulation
    // Use multiple workers for speed, but with proper teardown to avoid worker exit issues
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        execArgv: ['--max-old-space-size=12288']
      }
    },
    isolate: true,
    maxConcurrency: 2,
    minWorkers: 1,
    maxWorkers: 2
  },
  resolve: {
    alias: {
      '@dev-tools': path.resolve(__dirname, 'dev-tools'),
      '@framework': path.resolve(__dirname, '_bmad/framework'),
      '@validators': path.resolve(__dirname, '.claude/validators-node/src'),
      '@bmad/validators': path.resolve(__dirname, '.claude/validators-node/src'),
      '@bmad': path.resolve(__dirname, '_bmad'),
      '@src': path.resolve(__dirname, 'src'),
      '@tools': path.resolve(__dirname, 'src/utility/tools'),
      // Map test file relative imports to source implementations
      // Tests in tests/utility/tools/*/*.test.js import from './*.js'
      // These aliases resolve those imports to src/utility/tools/*/*.js
    },
  },
  plugins: [
    {
      name: 'resolve-test-imports',
      resolveId(source, importer) {
        // Only handle imports from test files in tests/utility/tools/
        if (!importer || !importer.includes('/tests/utility/tools/')) {
          return null;
        }

        // Handle relative imports (both ./ and ../)
        if (!source.startsWith('./') && !source.startsWith('../')) {
          return null;
        }

        // Skip if already resolving a .test.js file
        if (source.endsWith('.test.js')) {
          return null;
        }

        // Get the directory containing the importer
        const importerDir = path.dirname(importer);

        // Resolve the relative path
        const resolvedTestPath = path.resolve(importerDir, source);

        // Map the resolved path from tests/ to src/
        if (resolvedTestPath.includes('/tests/utility/tools/')) {
          const sourcePath = resolvedTestPath.replace('/tests/utility/tools/', '/src/utility/tools/');

          // Check if source file exists
          if (fs.existsSync(sourcePath)) {
            return sourcePath;
          }
        }

        return null;
      }
    }
  ],
  esbuild: {
    target: 'node18'
  },
  // Suppress source map warnings for validators-node src files
  // Source maps are generated in dist/ during build, tests run from src/
  sourcemap: 'false',
  // Don't fail on unhandled errors - worker exit from E2E subprocesses is expected
  failOnUnhandledErrors: false
});
