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
  // ── Global ignores ────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '_bmad-backup-*/',
      '_bmad-output/',
      'test-installation/',
      'Docs/',
      'examples/',
      'tests/',
      'tools/',
      'dev-tools/',
      'coverage/',
      // Separate workspaces — lint independently with their own config
      '.claude/validators-node/',
      '_bmad/framework/',
      // TS files not in any tsconfig project (parse errors)
      '.claude/hooks/',
      '.claude/scripts/',
      'vitest.config.ts',
    ]
  },

  // ── Base JS recommended (all source files) ──────────────────────────
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        queueMicrotask: 'readonly',
        structuredClone: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        fetch: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        crypto: 'readonly',
        performance: 'readonly',
        // CommonJS
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        global: 'readonly',
      }
    },
    rules: {
      // ── Security Rules (MUST PRESERVE — DO NOT DOWNGRADE) ───────────
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
      'no-return-assign': 'error',
      'no-throw-literal': 'error',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',

      // ── Code Complexity ────────────────────────────────────────────
      // Size rules off — codebase has many large generated/legacy files.
      // Enforced via code review, not lint.
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'complexity': 'off',
      'max-depth': ['error', 6],
      'max-params': 'off',
      'max-nested-callbacks': ['error', 5],

      // ── Import/Export ───────────────────────────────────────────────
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true
      }]
    }
  },

  // ── JavaScript files (non-type-checked) ─────────────────────────────
  //    JS files are NOT type-checked to avoid false positives from `any`
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      // Many JS files mix CJS/ESM patterns — no-undef false positives on require/module/__dirname
      'no-undef': 'off',
      // JS has no type info → base no-unused-vars is too noisy across legacy code
      'no-unused-vars': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  // ── TypeScript type-checked rules (TS files ONLY) ───────────────────
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      // ── TypeScript errors ────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // ── TypeScript warnings (aspirational — tracked but not blocking)
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-console': 'off'
    }
  },

  // ── Node.js plugin ──────────────────────────────────────────────────
  nodePlugin.configs['flat/mixed-esm-and-cjs'],
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'n/no-process-exit': 'off',
      'n/no-missing-import': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'n/hashbang': 'off'
    }
  },

  // ── Unicorn plugin (available for future rule additions) ────────────
  {
    plugins: { unicorn: unicornPlugin }
  },

  // ── YAML linting ────────────────────────────────────────────────────
  ...ymlPlugin.configs['flat/recommended'],
  {
    files: ['**/*.yaml', '**/*.yml'],
    rules: {
      'yml/file-extension': ['error', { extension: 'yaml', caseSensitive: true }],
      'yml/quotes': ['error', { prefer: 'double', avoidEscape: true }]
    }
  },

  // ── Override: GitHub Actions YAML (.yml is GitHub convention) ────────
  {
    files: ['.github/**/*.yml', '.github/**/*.yaml'],
    rules: {
      'yml/quotes': 'off',
      'yml/file-extension': 'off'
    }
  },

  // ── Override: Configuration files ───────────────────────────────────
  {
    files: ['**/*.config.js', '**/*.config.ts', '**/*.config.mjs', '**/config/**/*.js', '**/config/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off'
    }
  },

  // ── Prettier (last — disables formatting rules that conflict) ──────
  prettierConfig
);
