/**
 * Jest Configuration for BMAD CYBER2 Testing
 * Amelia's Red-Green-Refactor Test Configuration
 * EPIC 2 Story 2.2 Implementation
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directories for tests
  roots: [
    '<rootDir>/test'
  ],

  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js',
    '**/test/**/*test*.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/fixtures/',
    '/test-installation/',
    '/_bmad-output/',
    '/test/reports/',
    '/test/coverage/'
  ],

  // Coverage configuration
  collectCoverage: false, // Disable by default, enable when needed
  coverageDirectory: 'test/coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json'],
  collectCoverageFrom: [
    'src/**/*.js',
    'test/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/_bmad-output/**',
    '!**/test/reports/**',
    '!**/test/coverage/**'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/test/config/test-setup.js'
  ],

  // Module paths
  modulePaths: [
    '<rootDir>/src',
    '<rootDir>/test'
  ],

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'yaml', 'yml'],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 30000,

  // Global variables
  globals: {
    'BMAD_TEST_MODE': true,
    'BMAD_ROOT_PATH': '<rootDir>',
    'BMAD_DIST_PATH': '<rootDir>/_bmad-output/dist'
  },

  // Reporter configuration
  reporters: [
    'default'
  ],

  // Resolve modules
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1'
  }
};
