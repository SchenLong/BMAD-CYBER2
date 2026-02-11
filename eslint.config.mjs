import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';
import unicornPlugin from 'eslint-plugin-unicorn';
import ymlPlugin from 'eslint-plugin-yml';
import prettierConfig from 'eslint-config-prettier';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // ── Global ignores (replaces ignorePatterns) ──────────────────────────
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '_bmad-backup-*/',
      '_bmad-output/dist/',
      'test-installation/node_modules/',
      'Docs/',
      'src/bmb/',
      'src/core/',
      'examples/',
      'tests/',
      'tools/'
    ]
  },

  // ── Base JS recommended ───────────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [js.configs.recommended]
  },

  // ── TypeScript type-checked rules (scoped to TS/JS only) ──────────────
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: [
          './tsconfig.json',
          './_bmad/framework/tsconfig.json',
          './.claude/validators-node/tsconfig.json'
        ],
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      // ── Code Quality ────────────────────────────────────────────────
      'no-console': 'warn',
      'no-debugger': 'error',

      // ── TypeScript Specific ─────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // ── Clean Code Principles ───────────────────────────────────────
      'max-len': ['error', { code: 120, ignoreComments: true }],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'complexity': ['error', 10],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],

      // ── Code Style (Prettier overrides these via prettierConfig) ────
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }],

      // ── Security Rules (MUST PRESERVE) ──────────────────────────────
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // ── Best Practices ──────────────────────────────────────────────
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-throw-literal': 'error',
      'consistent-return': 'error',

      // ── Import/Export ───────────────────────────────────────────────
      'no-duplicate-imports': 'error',
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true
      }]
    }
  },

  // ── Node.js plugin (mixed ESM + CJS project) ─────────────────────────
  nodePlugin.configs['flat/mixed-esm-and-cjs'],

  // ── Unicorn plugin (available for future rule additions) ──────────────
  {
    plugins: { unicorn: unicornPlugin }
  },

  // ── YAML linting (new from v6) ────────────────────────────────────────
  ...ymlPlugin.configs['flat/recommended'],
  {
    files: ['**/*.yaml', '**/*.yml'],
    rules: {
      'yml/file-extension': ['error', { extension: 'yaml', caseSensitive: true }],
      'yml/quotes': ['error', { prefer: 'double', avoidEscape: true }]
    }
  },

  // ── Override: Test files ──────────────────────────────────────────────
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off'
    }
  },

  // ── Override: Configuration files ─────────────────────────────────────
  {
    files: ['**/*.config.js', '**/*.config.ts', '**/*.config.mjs', '**/config/**/*.js', '**/config/**/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },

  // ── Override: Legacy JavaScript files ─────────────────────────────────
  {
    files: ['src/**/*.js', '_bmad/**/*.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },

  // ── Prettier (last — disables formatting rules that conflict) ────────
  prettierConfig
);
