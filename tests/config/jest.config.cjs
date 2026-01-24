/**
 * Jest Configuration for BMAD CYBER2 Testing
 * Amelia's Red-Green-Refactor Test Configuration
 * EPIC 2 Story 2.2 Implementation
 */

const path = require('path');

module.exports = {
  // Set root directory to project root
  rootDir: path.resolve(__dirname, '../..'),
  
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/fixtures/',
    '/test-installation/',
    '/_bmad-output/',
    '/tests/reports/',
    '/tests/coverage/'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/config/test-setup.js'
  ],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 30000,

  // Disable transform for now
  transform: {}
};
