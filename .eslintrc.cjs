module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './_bmad/framework/tsconfig.json', './.claude/validators-node/tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Code Quality Rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Use TypeScript version
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // TypeScript Specific
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',

    // Clean Code Principles
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 4],
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],

    // Code Style
    'indent': 'off', // Use TypeScript version
    '@typescript-eslint/indent': ['error', 2],
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

    // Security Rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Best Practices
    'eqeqeq': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'no-param-reassign': 'error',
    'no-return-assign': 'error',
    'no-throw-literal': 'error',
    'consistent-return': 'error',

    // Import/Export Rules
    'no-duplicate-imports': 'error',
    'sort-imports': ['error', {
      ignoreCase: true,
      ignoreDeclarationSort: true
    }],

    // Documentation
    'require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: false,
        FunctionExpression: false
      }
    }],
    'valid-jsdoc': ['warn', {
      requireReturn: false,
      requireReturnDescription: false,
      requireParamDescription: true,
      prefer: {
        return: 'returns'
      }
    }]
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
      env: {
        jest: true,
        mocha: true
      },
      rules: {
        'no-console': 'off',
        'max-lines-per-function': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off'
      }
    },
    {
      // Configuration files
      files: ['**/*.config.js', '**/*.config.ts', '**/config/**/*.js', '**/config/**/*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      // Legacy JavaScript files (to be migrated)
      files: ['src/**/*.js', '_bmad/**/*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'require-jsdoc': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    '_bmad-backup-*/',
    '_bmad-output/dist/',
    'test-installation/node_modules/',
    'Docs/',
    // Files outside tsconfig include paths (not part of TypeScript compilation)
    '_bmad/bmb/',
    '_bmad/core/',
    'examples/',
    'tests/',
    'tools/'
  ]
};