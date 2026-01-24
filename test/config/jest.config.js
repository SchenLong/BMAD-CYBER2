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
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
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

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/test/config/test-setup.js'
  ],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 30000,

  // Disable transform for now
  transform: {}
};
