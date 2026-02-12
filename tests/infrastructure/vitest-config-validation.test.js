/**
 * QE-10-S2: Vitest Config Validation Tests
 * =========================================
 * Validates that all vitest configuration files in the project:
 * 1. Are discovered and accounted for
 * 2. Have include patterns that match real files on disk
 * 3. Use consistent pool strategies
 * 4. Do not have exclude patterns that accidentally exclude everything
 * 5. Have valid structural integrity (defineConfig, test block, etc.)
 *
 * This prevents "silent zero-test" configs where a pattern matches nothing.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

// Project root (two levels up from tests/infrastructure/)
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

/**
 * All known vitest config files relative to PROJECT_ROOT.
 * If a new config is added but not listed here, the discovery test will fail.
 */
const KNOWN_CONFIGS = [
  'vitest.config.ts',
  'dev-tools/config/vitest.config.unit.ts',
  'dev-tools/config/vitest.config.integration.ts',
  'dev-tools/config/vitest.config.performance.ts',
  'dev-tools/config/vitest.config.regression.ts',
  'dev-tools/config/vitest.config.regression-critical.ts',
  '.claude/validators-node/vitest.config.ts',
];

/**
 * Configs that legitimately omit pool settings.
 * These are lightweight configs that do not trigger the project's known OOM issues.
 */
const CONFIGS_WITHOUT_POOL = [
  '.claude/validators-node/vitest.config.ts',
  'dev-tools/config/vitest.config.performance.ts',
];

/**
 * Aspirational include patterns: these use .spec extension but the project
 * currently only has .test files. They exist for future-proofing and are
 * paired with equivalent .test patterns in the same config. Validated as
 * a group (at least one pattern per config must match) rather than individually.
 */
const ASPIRATIONAL_SPEC_PATTERNS = new Set([
  'tests/utility/**/*.spec.{js,ts}',
  'tests/schema/**/*.spec.{js,ts}',
  'tests/core/**/*.spec.{js,ts}',
  'tests/cli/**/*.spec.{js,ts}',
  'tests/security/**/*.spec.{js,ts}',
]);

/**
 * Defensive exclude patterns: directories that may not exist (yet or anymore)
 * but are excluded proactively to prevent accidental test discovery. These are
 * acceptable even if they currently match 0 files. Includes:
 * - Guard directories for future content (archive, output, installation)
 * - Orphaned test directories (removed implementations, but excludes kept as guards)
 * - Tests for not-yet-implemented APIs
 */
const DEFENSIVE_EXCLUDES = new Set([
  // Guard directories
  'dev-tools/archive/**',
  '_bmad-output/**',
  'dev-tools-installation/**',
  // Orphaned tests — CommonJS tests whose implementations were removed
  'dev-tools/package-management/conflict/**',
  'dev-tools/package-management/versioning/**',
  'dev-tools/package-management/testing/**',
  // Orphaned performance tests with environment-specific thresholds
  'dev-tools/performance/performance-lessons-12-15-enhanced.test.js',
  'dev-tools/performance/lessons-12-15-performance-validation.test.js',
  'dev-tools/performance/performance-lessons-12-15-jest.test.js',
  // Test files expecting class-based API that does not exist
  'dev-tools/framework/validators.test.ts',
  'dev-tools/framework/auth.test.ts',
  // Cross-module communication tests — APIs not yet implemented
  'dev-tools/integration/cross-module-communication-paths.test.js',
]);

// =============================================================================
// Parsing Helpers
// =============================================================================

/**
 * Extract test.include patterns from a vitest config file read as text.
 * Handles multi-line arrays. Skips nested blocks (benchmark.include, coverage.include).
 */
function getTestIncludePatterns(content) {
  const allPatterns = [];
  const lines = content.split('\n');
  let braceDepth = 0;
  let inTestBlock = false;
  let inBenchmarkBlock = false;
  let foundFirstInclude = false;
  let collectingInclude = false;
  let bracketDepth = 0;
  let includeContent = '';

  for (const line of lines) {
    if (/^\s*test\s*:\s*\{/.test(line) && !inTestBlock) {
      inTestBlock = true;
    }
    if (inTestBlock && /^\s*benchmark\s*:\s*\{/.test(line)) {
      inBenchmarkBlock = true;
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

    if (collectingInclude) {
      includeContent += line + '\n';
      for (const ch of line) {
        if (ch === '[') bracketDepth++;
        if (ch === ']') bracketDepth--;
      }
      if (bracketDepth <= 0) {
        collectingInclude = false;
        const stringRegex = /['"]([^'"]+)['"]/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(includeContent)) !== null) {
          allPatterns.push(strMatch[1]);
        }
        includeContent = '';
      }
      continue;
    }

    if (inTestBlock && !inBenchmarkBlock && !foundFirstInclude && /^\s*include\s*:\s*\[/.test(line)) {
      foundFirstInclude = true;
      collectingInclude = true;
      bracketDepth = 0;
      includeContent = line + '\n';
      for (const ch of line) {
        if (ch === '[') bracketDepth++;
        if (ch === ']') bracketDepth--;
      }
      if (bracketDepth <= 0) {
        collectingInclude = false;
        const stringRegex = /['"]([^'"]+)['"]/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(includeContent)) !== null) {
          allPatterns.push(strMatch[1]);
        }
        includeContent = '';
      }
    }
  }

  return allPatterns;
}

/**
 * Extract test.exclude patterns (not coverage.exclude) from config text.
 * Strips comments before extracting string patterns to avoid picking up
 * text from inline comments (e.g., "// No implementation exists").
 */
function extractExcludePatterns(rawContent) {
  const content = stripComments(rawContent);
  const patterns = [];
  const lines = content.split('\n');
  let inTestBlock = false;
  let inCoverageBlock = false;
  let braceDepth = 0;
  let coverageBraceDepth = 0;
  let collectingExclude = false;
  let bracketDepth = 0;
  let excludeArrayContent = '';

  for (const line of lines) {
    if (/^\s*test\s*:\s*\{/.test(line)) {
      inTestBlock = true;
    }
    if (inTestBlock && /^\s*coverage\s*:\s*\{/.test(line)) {
      inCoverageBlock = true;
      coverageBraceDepth = braceDepth;
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (inCoverageBlock && braceDepth <= coverageBraceDepth) {
          inCoverageBlock = false;
        }
      }
    }

    if (collectingExclude) {
      excludeArrayContent += line + '\n';
      for (const ch of line) {
        if (ch === '[') bracketDepth++;
        if (ch === ']') bracketDepth--;
      }
      if (bracketDepth <= 0) {
        collectingExclude = false;
        const stringRegex = /['"]([^'"]+)['"]/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(excludeArrayContent)) !== null) {
          patterns.push(strMatch[1]);
        }
        excludeArrayContent = '';
      }
      continue;
    }

    if (inTestBlock && !inCoverageBlock && /^\s*exclude\s*:\s*\[/.test(line)) {
      collectingExclude = true;
      bracketDepth = 0;
      excludeArrayContent = line + '\n';
      for (const ch of line) {
        if (ch === '[') bracketDepth++;
        if (ch === ']') bracketDepth--;
      }
      if (bracketDepth <= 0) {
        collectingExclude = false;
        const stringRegex = /['"]([^'"]+)['"]/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(excludeArrayContent)) !== null) {
          patterns.push(strMatch[1]);
        }
        excludeArrayContent = '';
      }
    }
  }

  return patterns;
}

/**
 * Strip inline and full-line comments from TypeScript/JavaScript content.
 * Preserves strings (does not strip content inside quotes).
 */
function stripComments(content) {
  // Remove single-line comments (// ...) but not inside strings
  // Simple approach: for each line, remove everything after // that is not inside quotes
  return content.split('\n').map((line) => {
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = i > 0 ? line[i - 1] : '';
      if (prev === '\\') continue;
      if (ch === "'" && !inDouble && !inBacktick) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle && !inBacktick) { inDouble = !inDouble; continue; }
      if (ch === '`' && !inSingle && !inDouble) { inBacktick = !inBacktick; continue; }
      if (!inSingle && !inDouble && !inBacktick && ch === '/' && line[i + 1] === '/') {
        return line.substring(0, i);
      }
    }
    return line;
  }).join('\n');
}

/**
 * Extract pool setting (not poolOptions).
 */
function extractPoolSetting(content) {
  const poolMatch = content.match(/^\s*pool\s*:\s*['"](\w+)['"]/m);
  return poolMatch ? poolMatch[1] : null;
}

/**
 * Extract pool-related options from config content.
 */
function extractPoolOptions(content) {
  const options = {};
  if (/singleFork\s*:\s*true/.test(content)) options.singleFork = true;
  if (/singleThread\s*:\s*true/.test(content)) options.singleThread = true;
  const maxWorkersMatch = content.match(/maxWorkers\s*:\s*(\d+)/);
  if (maxWorkersMatch) options.maxWorkers = parseInt(maxWorkersMatch[1], 10);
  const memMatch = content.match(/--max-old-space-size=(\d+)/);
  if (memMatch) options.maxOldSpaceSize = parseInt(memMatch[1], 10);
  return options;
}

/**
 * Determine the effective root directory for globbing include patterns.
 * Most configs set `root: rootDir` pointing to PROJECT_ROOT.
 * The validators-node config does not set root, so its cwd is its own directory.
 */
function getEffectiveRoot(configRelPath) {
  if (configRelPath === '.claude/validators-node/vitest.config.ts') {
    return path.resolve(PROJECT_ROOT, '.claude/validators-node');
  }
  return PROJECT_ROOT;
}

// =============================================================================
// Tests
// =============================================================================

describe('Vitest Config Validation', () => {

  // -------------------------------------------------------------------------
  // 1. Config File Discovery
  // -------------------------------------------------------------------------
  describe('config file discovery', () => {
    it('should find all known vitest config files on disk', () => {
      for (const configPath of KNOWN_CONFIGS) {
        const fullPath = path.resolve(PROJECT_ROOT, configPath);
        expect(
          fs.existsSync(fullPath),
          `Expected config file to exist: ${configPath}`
        ).toBe(true);
      }
    });

    it('should not have untracked vitest config files in the project', () => {
      const allConfigs = globSync('**/vitest.config*.ts', {
        cwd: PROJECT_ROOT,
        ignore: ['node_modules/**', 'dist/**', '_bmad-output/**'],
        dot: true,
      });

      const unknownConfigs = allConfigs.filter(
        (c) => !KNOWN_CONFIGS.includes(c)
      );

      expect(
        unknownConfigs,
        `Found vitest config file(s) not listed in KNOWN_CONFIGS: [${unknownConfigs.join(', ')}]. ` +
        'Add them to KNOWN_CONFIGS in vitest-config-validation.test.js and add corresponding pattern validation tests.'
      ).toEqual([]);
    });

    it('should have the expected number of config files', () => {
      const allConfigs = globSync('**/vitest.config*.ts', {
        cwd: PROJECT_ROOT,
        ignore: ['node_modules/**', 'dist/**', '_bmad-output/**'],
        dot: true,
      });

      expect(allConfigs.length).toBe(KNOWN_CONFIGS.length);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Include Pattern Validation
  // -------------------------------------------------------------------------
  describe('include pattern validation', () => {
    for (const configRelPath of KNOWN_CONFIGS) {
      describe(configRelPath, () => {
        const fullPath = path.resolve(PROJECT_ROOT, configRelPath);
        const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
        const effectiveRoot = getEffectiveRoot(configRelPath);
        const patterns = getTestIncludePatterns(content);

        it('should have at least one include pattern', () => {
          expect(
            patterns.length,
            `Config ${configRelPath} has no test.include patterns — tests will not be discovered`
          ).toBeGreaterThanOrEqual(1);
        });

        // Separate concrete patterns from aspirational .spec patterns
        const concretePatterns = patterns.filter((p) => !ASPIRATIONAL_SPEC_PATTERNS.has(p));
        const aspirationalPatterns = patterns.filter((p) => ASPIRATIONAL_SPEC_PATTERNS.has(p));

        for (const pattern of concretePatterns) {
          it(`pattern "${pattern}" should match at least 1 file`, () => {
            const matched = globSync(pattern, {
              cwd: effectiveRoot,
              ignore: ['node_modules/**'],
            });

            expect(
              matched.length,
              `Pattern '${pattern}' in ${configRelPath} matches 0 files — this config is silently doing nothing. ` +
              `Globbed from root: ${effectiveRoot}`
            ).toBeGreaterThanOrEqual(1);
          });
        }

        if (aspirationalPatterns.length > 0) {
          it('aspirational .spec patterns should have a matching .test counterpart that resolves', () => {
            // Verify that for every aspirational .spec pattern, there is a paired
            // .test pattern in the same config that does match files.
            for (const specPattern of aspirationalPatterns) {
              const testCounterpart = specPattern.replace('.spec.', '.test.');
              const matched = globSync(testCounterpart, {
                cwd: effectiveRoot,
                ignore: ['node_modules/**'],
              });
              expect(
                matched.length,
                `Aspirational pattern '${specPattern}' in ${configRelPath} has no matching .test ` +
                `counterpart with files. The paired pattern '${testCounterpart}' also matches 0 files — ` +
                'this entire directory may be misconfigured.'
              ).toBeGreaterThanOrEqual(1);
            }
          });
        }

        it('at least one include pattern should match files (config is not silent)', () => {
          let totalMatched = 0;
          for (const pattern of patterns) {
            const matched = globSync(pattern, {
              cwd: effectiveRoot,
              ignore: ['node_modules/**'],
            });
            totalMatched += matched.length;
          }

          expect(
            totalMatched,
            `No include patterns in ${configRelPath} match any files — this config discovers zero tests`
          ).toBeGreaterThan(0);
        });
      });
    }
  });

  // -------------------------------------------------------------------------
  // 3. Pool Strategy Validation
  // -------------------------------------------------------------------------
  describe('pool strategy validation', () => {
    for (const configRelPath of KNOWN_CONFIGS) {
      const fullPath = path.resolve(PROJECT_ROOT, configRelPath);
      const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
      const pool = extractPoolSetting(content);
      const poolOptions = extractPoolOptions(content);

      describe(configRelPath, () => {
        if (pool) {
          it('should use "forks" pool for memory isolation (OOM prevention)', () => {
            expect(
              pool,
              `Config ${configRelPath} uses pool: "${pool}" — expected "forks" for OOM prevention. ` +
              'The project has known OOM issues with thread-based pool. See vitest.config.ts comments.'
            ).toBe('forks');
          });

          it('should use singleFork mode for deterministic execution', () => {
            expect(
              poolOptions.singleFork,
              `Config ${configRelPath} sets pool: "forks" but does not enable singleFork — ` +
              'this can lead to non-deterministic test ordering and memory accumulation'
            ).toBe(true);
          });

          it('should set --max-old-space-size for memory limit', () => {
            expect(
              poolOptions.maxOldSpaceSize,
              `Config ${configRelPath} does not set --max-old-space-size in poolOptions.forks.execArgv — ` +
              'worker processes may OOM without explicit memory limits'
            ).toBeGreaterThanOrEqual(2048);
          });
        } else {
          it('should be in the allowed list of configs without explicit pool', () => {
            // Lightweight or specialized configs may omit pool settings.
            // They must be explicitly listed in CONFIGS_WITHOUT_POOL.
            expect(
              CONFIGS_WITHOUT_POOL.includes(configRelPath),
              `Config ${configRelPath} omits pool setting but is not in CONFIGS_WITHOUT_POOL allowlist. ` +
              'Either add pool: "forks" configuration or add to allowlist with justification.'
            ).toBe(true);
          });
        }
      });
    }
  });

  // -------------------------------------------------------------------------
  // 4. Exclude Pattern Sanity
  // -------------------------------------------------------------------------
  describe('exclude pattern sanity', () => {
    for (const configRelPath of KNOWN_CONFIGS) {
      const fullPath = path.resolve(PROJECT_ROOT, configRelPath);
      const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
      const includePatterns = getTestIncludePatterns(content);
      const excludePatterns = extractExcludePatterns(content);
      const effectiveRoot = getEffectiveRoot(configRelPath);

      describe(configRelPath, () => {
        if (excludePatterns.length > 0) {
          it('exclude patterns should not exclude all files matched by include patterns', () => {
            let allIncluded = [];
            for (const pattern of includePatterns) {
              const matched = globSync(pattern, {
                cwd: effectiveRoot,
                ignore: ['node_modules/**'],
              });
              allIncluded.push(...matched);
            }
            allIncluded = [...new Set(allIncluded)];

            let allExcluded = [];
            for (const pattern of excludePatterns) {
              const matched = globSync(pattern, {
                cwd: effectiveRoot,
                ignore: [],
              });
              allExcluded.push(...matched);
            }
            const excludeSet = new Set(allExcluded);

            const remaining = allIncluded.filter((f) => !excludeSet.has(f));

            expect(
              remaining.length,
              `All ${allIncluded.length} files matched by include patterns in ${configRelPath} ` +
              `are also matched by exclude patterns — this config runs zero tests. ` +
              `Exclude patterns: ${excludePatterns.join(', ')}`
            ).toBeGreaterThan(0);
          });

          it('non-defensive exclude patterns should match at least 1 file', () => {
            const STANDARD_EXCLUDES = new Set([
              'node_modules/**',
              'dist/**',
              '**/node_modules/**',
            ]);

            for (const pattern of excludePatterns) {
              // Skip standard directory excludes (may or may not exist)
              if (STANDARD_EXCLUDES.has(pattern)) continue;

              // Skip explicitly defensive excludes (guard against future directories)
              if (DEFENSIVE_EXCLUDES.has(pattern)) continue;

              const matched = globSync(pattern, {
                cwd: effectiveRoot,
                ignore: [],
              });

              expect(
                matched.length,
                `Exclude pattern '${pattern}' in ${configRelPath} matches 0 files — ` +
                'this is a dead exclude. If it is intentionally defensive, add it to DEFENSIVE_EXCLUDES.'
              ).toBeGreaterThanOrEqual(1);
            }
          });
        } else {
          it('config without test-level exclude patterns is valid (uses vitest defaults)', () => {
            expect(excludePatterns.length).toBe(0);
          });
        }
      });
    }
  });

  // -------------------------------------------------------------------------
  // 5. Config Structural Integrity
  // -------------------------------------------------------------------------
  describe('config structural integrity', () => {
    for (const configRelPath of KNOWN_CONFIGS) {
      const fullPath = path.resolve(PROJECT_ROOT, configRelPath);
      const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';

      describe(configRelPath, () => {
        it('should use standalone defineConfig (not mergeConfig)', () => {
          expect(
            content.includes('mergeConfig'),
            `Config ${configRelPath} uses mergeConfig — should use standalone defineConfig per QE-01 fix`
          ).toBe(false);
        });

        it('should import defineConfig from vitest/config', () => {
          expect(
            content.includes("from 'vitest/config'"),
            `Config ${configRelPath} does not import from 'vitest/config'`
          ).toBe(true);
        });

        it('should contain a test block', () => {
          expect(
            /test\s*:\s*\{/.test(content),
            `Config ${configRelPath} does not have a test: { } block`
          ).toBe(true);
        });
      });
    }
  });
});
