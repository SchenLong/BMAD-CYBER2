/**
 * ESLint Configuration — Comprehensive Test Suite
 * =================================================
 * Validates the ESLint flat config (eslint.config.mjs) for:
 *   1. Config structure & loading
 *   2. Security rules (MUST PRESERVE — never downgraded)
 *   3. Global ignores
 *   4. JS vs TS rule separation
 *   5. YAML linting rules
 *   6. Plugin registration
 *   7. Node.js globals
 *   8. Clean lint pass (no errors, no warnings)
 *   9. Prettier integration
 *  10. Rule consistency invariants
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CONFIG_PATH = path.join(ROOT, 'eslint.config.mjs');

// ─── Helper: load the flat config array ──────────────────────────────────────
let configBlocks;

beforeAll(async () => {
  // Dynamic import of the ESM config
  const mod = await import(CONFIG_PATH);
  configBlocks = mod.default;
});

// ─── Helper: find a config block by a predicate ─────────────────────────────
function findBlock(predicate) {
  return configBlocks.find(predicate);
}

function findBlocks(predicate) {
  return configBlocks.filter(predicate);
}

function getBlockRules(block) {
  return block?.rules ?? {};
}

// ─── Helper: find block that targets specific file patterns ──────────────────
function findBlockByFiles(patterns) {
  const patternsArr = Array.isArray(patterns) ? patterns : [patterns];
  return configBlocks.find((b) =>
    b.files && patternsArr.every((p) => b.files.includes(p))
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CONFIG STRUCTURE & LOADING
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Structure & Loading', () => {
  it('eslint.config.mjs exists', () => {
    expect(fs.existsSync(CONFIG_PATH)).toBe(true);
  });

  it('config exports a non-empty array', () => {
    expect(Array.isArray(configBlocks)).toBe(true);
    expect(configBlocks.length).toBeGreaterThan(5);
  });

  it('config contains at least one block with files', () => {
    const withFiles = configBlocks.filter((b) => b.files);
    expect(withFiles.length).toBeGreaterThan(0);
  });

  it('config contains a global ignores block (no files key)', () => {
    const ignoreBlock = configBlocks.find((b) => b.ignores && !b.files);
    expect(ignoreBlock).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SECURITY RULES (CRITICAL — DO NOT DOWNGRADE)
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Security Rules', () => {
  const SECURITY_RULES = [
    'no-eval',
    'no-implied-eval',
    'no-new-func',
    'no-script-url',
  ];

  let baseBlock;

  beforeAll(() => {
    // The base block targets all source file types
    baseBlock = findBlockByFiles('**/*.ts');
    // If not found by TS, find by JS (the base block has both)
    if (!baseBlock || !baseBlock.rules?.['no-eval']) {
      baseBlock = configBlocks.find(
        (b) => b.rules && b.rules['no-eval'] === 'error'
      );
    }
  });

  for (const rule of SECURITY_RULES) {
    it(`${rule} is set to 'error' (never warn, never off)`, () => {
      expect(baseBlock).toBeDefined();
      expect(getBlockRules(baseBlock)[rule]).toBe('error');
    });
  }

  it('no config block downgrades any security rule to warn or off', () => {
    for (const block of configBlocks) {
      const rules = getBlockRules(block);
      for (const rule of SECURITY_RULES) {
        if (rules[rule] !== undefined) {
          // typescript-eslint's recommendedTypeChecked replaces base
          // no-implied-eval with @typescript-eslint/no-implied-eval (which
          // IS enabled). The base rule is turned off to avoid duplicates.
          // This is expected and safe — skip this specific case.
          const isTypescriptOverride =
            block.files?.length === 1 &&
            block.files[0] === '**/*.ts' &&
            rule === 'no-implied-eval';

          if (!isTypescriptOverride) {
            expect(
              rules[rule],
              `Block with files=${JSON.stringify(block.files)} sets ${rule}=${rules[rule]}`
            ).toBe('error');
          }
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GLOBAL IGNORES
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Global Ignores', () => {
  let ignoredPaths;

  beforeAll(() => {
    const ignoreBlock = configBlocks.find((b) => b.ignores && !b.files);
    ignoredPaths = ignoreBlock?.ignores ?? [];
  });

  const REQUIRED_IGNORES = [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    '_bmad-output/',
    'tests/',
    'tools/',
    'dev-tools/',
    'coverage/',
  ];

  for (const p of REQUIRED_IGNORES) {
    it(`ignores ${p}`, () => {
      expect(ignoredPaths).toContain(p);
    });
  }

  it('ignores separate workspaces (.claude/validators-node/, _bmad/framework/)', () => {
    expect(ignoredPaths).toContain('.claude/validators-node/');
    expect(ignoredPaths).toContain('_bmad/framework/');
  });

  it('ignores TS files outside tsconfig (.claude/hooks/, .claude/scripts/)', () => {
    expect(ignoredPaths).toContain('.claude/hooks/');
    expect(ignoredPaths).toContain('.claude/scripts/');
  });

  it('ignores vitest.config.ts (not in tsconfig project)', () => {
    expect(ignoredPaths).toContain('vitest.config.ts');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. JS vs TS RULE SEPARATION
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — JS vs TS Rule Separation', () => {
  let jsBlock, tsBlock;

  beforeAll(() => {
    // JS block: targets .js/.mjs/.cjs only (NOT .ts)
    jsBlock = configBlocks.find(
      (b) =>
        b.files &&
        b.files.includes('**/*.js') &&
        !b.files.includes('**/*.ts') &&
        b.rules?.['no-undef'] === 'off'
    );

    // TS block: targets .ts only
    tsBlock = configBlocks.find(
      (b) =>
        b.files &&
        b.files.includes('**/*.ts') &&
        b.files.length === 1 &&
        b.languageOptions?.parserOptions?.project
    );
  });

  it('JS files have no-undef off (CJS/ESM mixed patterns)', () => {
    expect(jsBlock).toBeDefined();
    expect(getBlockRules(jsBlock)['no-undef']).toBe('off');
  });

  it('JS files have no-unused-vars off (no type info)', () => {
    expect(getBlockRules(jsBlock)['no-unused-vars']).toBe('off');
  });

  it('JS files have @typescript-eslint/no-require-imports off', () => {
    expect(getBlockRules(jsBlock)['@typescript-eslint/no-require-imports']).toBe('off');
  });

  it('TS block exists with type-checked config', () => {
    expect(tsBlock).toBeDefined();
  });

  it('TS block uses tsconfig.json for type checking', () => {
    expect(tsBlock.languageOptions.parserOptions.project).toContain('./tsconfig.json');
  });

  it('TS block has no-unsafe-* rules turned off (aspirational)', () => {
    const rules = getBlockRules(tsBlock);
    const unsafeRules = [
      '@typescript-eslint/no-unsafe-assignment',
      '@typescript-eslint/no-unsafe-call',
      '@typescript-eslint/no-unsafe-member-access',
      '@typescript-eslint/no-unsafe-return',
      '@typescript-eslint/no-unsafe-argument',
    ];
    for (const rule of unsafeRules) {
      expect(rules[rule], `${rule} should be off`).toBe('off');
    }
  });

  it('TS block has @typescript-eslint/no-unused-vars off', () => {
    expect(getBlockRules(tsBlock)['@typescript-eslint/no-unused-vars']).toBe('off');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. YAML LINTING RULES
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — YAML Linting', () => {
  let yamlBlock, githubYamlBlock;

  beforeAll(() => {
    yamlBlock = configBlocks.find(
      (b) =>
        b.files &&
        (b.files.includes('**/*.yaml') || b.files.includes('**/*.yml')) &&
        b.rules?.['yml/file-extension']
    );

    githubYamlBlock = configBlocks.find(
      (b) =>
        b.files &&
        b.files.some((f) => f.includes('.github/'))
    );
  });

  it('YAML block enforces .yaml extension', () => {
    expect(yamlBlock).toBeDefined();
    const rule = getBlockRules(yamlBlock)['yml/file-extension'];
    expect(rule).toBeDefined();
    expect(rule[0]).toBe('error');
    expect(rule[1].extension).toBe('yaml');
  });

  it('YAML block enforces double quotes', () => {
    const rule = getBlockRules(yamlBlock)['yml/quotes'];
    expect(rule).toBeDefined();
    expect(rule[0]).toBe('error');
    expect(rule[1].prefer).toBe('double');
  });

  it('GitHub Actions YAML has file-extension rule off (.yml is convention)', () => {
    expect(githubYamlBlock).toBeDefined();
    expect(getBlockRules(githubYamlBlock)['yml/file-extension']).toBe('off');
  });

  it('GitHub Actions YAML has quotes rule off', () => {
    expect(getBlockRules(githubYamlBlock)['yml/quotes']).toBe('off');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PLUGIN REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Plugin Registration', () => {
  it('unicorn plugin is registered', () => {
    const unicornBlock = configBlocks.find(
      (b) => b.plugins && b.plugins.unicorn
    );
    expect(unicornBlock).toBeDefined();
  });

  it('n (node) plugin rules are present', () => {
    const nBlock = configBlocks.find(
      (b) => b.rules && b.rules['n/no-process-exit'] !== undefined
    );
    expect(nBlock).toBeDefined();
  });

  it('yml plugin configs are spread into config array', () => {
    // yml/recommended adds blocks with yml/ prefixed rules
    const ymlBlock = configBlocks.find(
      (b) => b.plugins && (b.plugins.yml || b.plugins['yml'])
    );
    expect(ymlBlock).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. NODE.JS GLOBALS
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Node.js Globals', () => {
  let globals;

  beforeAll(() => {
    const baseBlock = configBlocks.find(
      (b) => b.languageOptions?.globals?.process
    );
    globals = baseBlock?.languageOptions?.globals ?? {};
  });

  const REQUIRED_GLOBALS = [
    'process',
    'console',
    'Buffer',
    '__dirname',
    '__filename',
    'URL',
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'fetch',
    'AbortController',
    'TextEncoder',
    'TextDecoder',
    'crypto',
    'performance',
  ];

  for (const g of REQUIRED_GLOBALS) {
    it(`global '${g}' is defined`, () => {
      expect(globals[g]).toBeDefined();
    });
  }

  it('CJS globals are defined (require, module, exports)', () => {
    expect(globals.require).toBe('readonly');
    expect(globals.module).toBe('writable');
    expect(globals.exports).toBe('writable');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CLEAN LINT PASS
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Clean Lint Pass', () => {
  it('npm run lint exits with 0 (no errors, no warnings)', () => {
    let exitCode = 0;
    try {
      execSync('npm run lint', {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 120_000,
      });
    } catch (err) {
      exitCode = err.status ?? 1;
    }
    expect(exitCode).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. PRETTIER INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Prettier Integration', () => {
  it('prettierConfig is the last block in the config array', () => {
    const lastBlock = configBlocks[configBlocks.length - 1];
    // eslint-config-prettier disables formatting rules — it sets them to 'off' or 0
    // It should have rules that override formatting (e.g., indent, quotes)
    const rules = getBlockRules(lastBlock);
    // prettierConfig sets known formatting rules to 'off'
    const prettierSignatures = ['indent', 'quotes', 'semi', 'comma-dangle'];
    const hasPrettierRules = prettierSignatures.some(
      (r) => rules[r] !== undefined
    );
    expect(hasPrettierRules).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. RULE CONSISTENCY INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('ESLint Config — Rule Consistency Invariants', () => {
  it('best practice rules are all error level', () => {
    const baseBlock = configBlocks.find(
      (b) => b.rules && b.rules['eqeqeq'] === 'error'
    );
    expect(baseBlock).toBeDefined();

    const expectedErrors = [
      'eqeqeq',
      'no-var',
      'prefer-const',
      'prefer-arrow-callback',
      'prefer-template',
      'no-return-assign',
      'no-throw-literal',
      'no-debugger',
      'no-duplicate-imports',
    ];

    const rules = getBlockRules(baseBlock);
    for (const rule of expectedErrors) {
      expect(rules[rule], `${rule} should be 'error'`).toBe('error');
    }
  });

  it('complexity rules are properly configured', () => {
    const baseBlock = configBlocks.find(
      (b) => b.rules && b.rules['max-depth'] !== undefined
    );
    expect(baseBlock).toBeDefined();
    const rules = getBlockRules(baseBlock);

    // max-depth has a threshold
    expect(rules['max-depth'][0]).toBe('error');
    expect(rules['max-depth'][1]).toBeGreaterThanOrEqual(4);

    // max-nested-callbacks has a threshold
    expect(rules['max-nested-callbacks'][0]).toBe('error');
    expect(rules['max-nested-callbacks'][1]).toBeGreaterThanOrEqual(3);

    // Size rules are off (large legacy files)
    expect(rules['max-lines-per-function']).toBe('off');
    expect(rules['max-lines']).toBe('off');
    expect(rules['complexity']).toBe('off');
    expect(rules['max-params']).toBe('off');
  });

  it('sort-imports is configured with case-insensitive and declaration sort ignored', () => {
    const baseBlock = configBlocks.find(
      (b) => b.rules && b.rules['sort-imports']
    );
    expect(baseBlock).toBeDefined();
    const rule = getBlockRules(baseBlock)['sort-imports'];
    expect(rule[0]).toBe('error');
    expect(rule[1].ignoreCase).toBe(true);
    expect(rule[1].ignoreDeclarationSort).toBe(true);
  });

  it('n/ plugin noisy rules are all off (our override block)', () => {
    // The n/ plugin preset may set rules to 'error'; our override block
    // comes after and sets them to 'off'. Find the LAST block with these rules.
    const nBlocks = configBlocks.filter(
      (b) => b.rules && b.rules['n/no-process-exit'] !== undefined
    );
    expect(nBlocks.length).toBeGreaterThan(0);
    const nBlock = nBlocks[nBlocks.length - 1]; // Last one = our override
    const rules = getBlockRules(nBlock);

    const expectedOff = [
      'n/no-process-exit',
      'n/no-missing-import',
      'n/no-extraneous-import',
      'n/no-unpublished-import',
      'n/no-unsupported-features/node-builtins',
      'n/hashbang',
    ];

    for (const rule of expectedOff) {
      expect(rules[rule], `${rule} should be 'off'`).toBe('off');
    }
  });

  it('config files override has max-lines rules off', () => {
    const configBlock = configBlocks.find(
      (b) =>
        b.files &&
        b.files.some((f) => f.includes('*.config.js'))
    );
    expect(configBlock).toBeDefined();
    const rules = getBlockRules(configBlock);
    expect(rules['max-lines-per-function']).toBe('off');
    expect(rules['max-lines']).toBe('off');
  });
});
