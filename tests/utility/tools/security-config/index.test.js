/**
 * Unit Tests for Security Configuration Entry Point - INST-011
 * Epic 2, Story 5 - Security Tier Configuration
 *
 * Tests the index.js entry point functionality for the security
 * configuration wizard.
 *
 * @module index.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  VERSION,
  showCurrentConfiguration,
  runSecurityConfig
} from './index.js';

import {
  applySecurityTier,
  SECURITY_CONFIG_PATH
} from './security-writer.js';

import { getTierFeatures } from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_index__');
const MOCK_SECURITY_PATH = path.join(MOCK_PROJECT_ROOT, 'src/core/security');

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_SECURITY_PATH, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

// Mock console.log for output tests
let consoleOutput = [];
const originalLog = console.log;

function mockConsole() {
  consoleOutput = [];
  console.log = (...args) => {
    consoleOutput.push(args.join(' '));
  };
}

function restoreConsole() {
  console.log = originalLog;
}

describe('Security Configuration Entry Point - INST-011', () => {
  describe('VERSION constant', () => {
    it('should be defined', () => {
      expect(VERSION).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof VERSION).toBe('string');
    });

    it('should follow semver format', () => {
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('showCurrentConfiguration()', () => {
    beforeEach(() => {
      setupTestFixtures();
      mockConsole();
    });

    afterEach(() => {
      cleanupTestFixtures();
      restoreConsole();
    });

    it('should show not configured message when no config', () => {
      showCurrentConfiguration(MOCK_PROJECT_ROOT);
      const output = consoleOutput.join('\n');

      expect(output).toContain('not configured');
    });

    it('should show configuration when configured', () => {
      applySecurityTier('standard', { projectRoot: MOCK_PROJECT_ROOT });
      showCurrentConfiguration(MOCK_PROJECT_ROOT);
      const output = consoleOutput.join('\n');

      expect(output).toContain('Enabled Features');
    });
  });

  describe('runSecurityConfig() - showOnly mode', () => {
    beforeEach(() => {
      setupTestFixtures();
      mockConsole();
    });

    afterEach(() => {
      cleanupTestFixtures();
      restoreConsole();
    });

    it('should return success in showOnly mode', async () => {
      const result = await runSecurityConfig({
        showOnly: true,
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      expect(result.success).toBe(true);
    });

    it('should not modify configuration in showOnly mode', async () => {
      await runSecurityConfig({
        showOnly: true,
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
      expect(fs.existsSync(configPath)).toBe(false);
    });
  });

  describe('runSecurityConfig() - tier preset mode', () => {
    beforeEach(() => {
      setupTestFixtures();
      mockConsole();
    });

    afterEach(() => {
      cleanupTestFixtures();
      restoreConsole();
    });

    it('should apply valid tier directly', async () => {
      const result = await runSecurityConfig({
        tier: 'standard',
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.tier).toBe('standard');
    });

    it('should return features for applied tier', async () => {
      const result = await runSecurityConfig({
        tier: 'advanced',
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      expect(result.features).toBeDefined();
      expect(result.features.length).toBeGreaterThan(0);
    });

    it('should fail for invalid tier', async () => {
      const result = await runSecurityConfig({
        tier: 'invalid-tier',
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid tier');
    });

    it('should create config file', async () => {
      await runSecurityConfig({
        tier: 'standard',
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      const configPath = path.join(MOCK_PROJECT_ROOT, SECURITY_CONFIG_PATH);
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should apply all tier options', async () => {
      // Test each tier
      for (const tierId of ['essential', 'standard', 'advanced', 'enterprise', 'beta']) {
        cleanupTestFixtures();
        setupTestFixtures();

        const result = await runSecurityConfig({
          tier: tierId,
          projectRoot: MOCK_PROJECT_ROOT,
          silent: true
        });

        expect(result.success).toBe(true);
        expect(result.tier).toBe(tierId);

        const expectedFeatures = getTierFeatures(tierId);
        expect(result.features).toEqual(expectedFeatures);
      }
    });
  });

  describe('runSecurityConfig() - error handling', () => {
    beforeEach(() => {
      setupTestFixtures();
      mockConsole();
    });

    afterEach(() => {
      cleanupTestFixtures();
      restoreConsole();
    });

    it('should handle invalid tier gracefully', async () => {
      const result = await runSecurityConfig({
        tier: 'nonexistent',
        projectRoot: MOCK_PROJECT_ROOT,
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Module Exports', () => {
    it('should export runSecurityConfig function', async () => {
      const module = await import('./index.js');
      expect(typeof module.runSecurityConfig).toBe('function');
    });

    it('should export showCurrentConfiguration function', async () => {
      const module = await import('./index.js');
      expect(typeof module.showCurrentConfiguration).toBe('function');
    });

    it('should export VERSION', async () => {
      const module = await import('./index.js');
      expect(module.VERSION).toBeDefined();
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should import from all security-config modules', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\/tier-definitions\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/tier-selection-ui\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/security-writer\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/advanced-override\.js['"]/);
    });

    it('should have shebang for node execution', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('CLI argument parsing', () => {
    it('should support --show flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toContain("'--show'");
      expect(moduleContent).toContain("'-s'");
    });

    it('should support --tier flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toContain("'--tier'");
      expect(moduleContent).toContain("'-t'");
    });

    it('should support --help flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toContain("'--help'");
      expect(moduleContent).toContain("'-h'");
    });

    it('should support --advanced flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toContain("'--advanced'");
      expect(moduleContent).toContain("'-a'");
    });
  });
});
