/**
 * Test Configuration Index
 * Central configuration for all BMAD testing
 */

const path = require('path');
const fs = require('fs');

const TEST_CONFIG = {
  // Paths
  ROOT_PATH: path.resolve(__dirname, '../..'),
  SRC_PATH: path.resolve(__dirname, '../../src'),
  DIST_PATH: path.resolve(__dirname, '../../_bmad-output/dist'),
  FIXTURES_PATH: path.resolve(__dirname, '../fixtures'),
  OUTPUT_PATH: path.resolve(__dirname, '../output'),
  REPORTS_PATH: path.resolve(__dirname, '../reports'),

  // Test categories
  CATEGORIES: {
    UNIT: 'unit',
    INTEGRATION: 'integration',
    BENCHMARKS: 'benchmarks',
    VALIDATORS: 'validators',
    FIXTURES: 'fixtures'
  },

  // Team modules
  TEAMS: [
    'cybersec-team',
    'intel-team',
    'legal-team',
    'strategy-team'
  ],

  // Test thresholds
  THRESHOLDS: {
    ROUTING_ACCURACY: 0.90,
    COVERAGE_MINIMUM: 0.80,
    PERFORMANCE_MAX_MS: 1000
  },

  // Test timeouts
  TIMEOUTS: {
    UNIT: 5000,
    INTEGRATION: 30000,
    BENCHMARK: 60000
  },

  // Validation rules
  VALIDATION: {
    AGENT_REQUIRED_FIELDS: ['name', 'role', 'capabilities'],
    WORKFLOW_REQUIRED_FIELDS: ['name', 'description', 'steps'],
    TEAM_REQUIRED_FIELDS: ['name', 'description', 'agents', 'workflows']
  }
};

// Ensure test directories exist
const ensureDirectories = () => {
  const dirs = [
    TEST_CONFIG.OUTPUT_PATH,
    TEST_CONFIG.REPORTS_PATH,
    path.join(TEST_CONFIG.OUTPUT_PATH, 'unit'),
    path.join(TEST_CONFIG.OUTPUT_PATH, 'integration'),
    path.join(TEST_CONFIG.OUTPUT_PATH, 'benchmarks')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize test environment
const initializeTestEnvironment = () => {
  ensureDirectories();

  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.BMAD_TEST_MODE = 'true';
  process.env.BMAD_ROOT_PATH = TEST_CONFIG.ROOT_PATH;
  process.env.BMAD_DIST_PATH = TEST_CONFIG.DIST_PATH;

  return TEST_CONFIG;
};

module.exports = {
  TEST_CONFIG,
  ensureDirectories,
  initializeTestEnvironment
};