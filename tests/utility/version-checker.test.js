/**
 * Unit Tests for Version Checker
 * Task 0.6 - Version Checking with Update Notification
 *
 * Tests version comparison, cache logic, and display output.
 * Network calls are mocked to keep tests fast and deterministic.
 *
 * @module utility/version-checker.test
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Import the module under test
import {
  _internals,
  checkVersion,
  displayUpdateNotice,
} from '../../src/utility/version-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Test Helpers
// ============================================================================

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'version-checker-test-'));
}

function cleanupTempDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true });
  } catch {
    // ignore cleanup errors
  }
}

// ============================================================================
// Tests: getCurrentVersion
// ============================================================================

describe('Version Checker', () => {
  describe('getCurrentVersion()', () => {
    it('should return a valid semver version string', () => {
      const version = _internals.getCurrentVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should return the version from root package.json', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(_internals._config.PACKAGE_JSON_PATH, 'utf8')
      );
      const version = _internals.getCurrentVersion();
      expect(version).toBe(packageJson.version);
    });
  });

  // ============================================================================
  // Tests: getUpdateType
  // ============================================================================

  describe('getUpdateType()', () => {
    it('should detect major updates', () => {
      expect(_internals.getUpdateType('1.0.0', '2.0.0')).toBe('major');
      expect(_internals.getUpdateType('1.5.3', '3.0.0')).toBe('major');
    });

    it('should detect minor updates', () => {
      expect(_internals.getUpdateType('1.0.0', '1.1.0')).toBe('minor');
      expect(_internals.getUpdateType('2.3.1', '2.5.0')).toBe('minor');
    });

    it('should detect patch updates', () => {
      expect(_internals.getUpdateType('1.0.0', '1.0.1')).toBe('patch');
      expect(_internals.getUpdateType('2.3.1', '2.3.5')).toBe('patch');
    });

    it('should return none when versions are equal', () => {
      expect(_internals.getUpdateType('1.0.0', '1.0.0')).toBe('none');
    });

    it('should return none when current is newer', () => {
      expect(_internals.getUpdateType('2.0.0', '1.0.0')).toBe('none');
    });

    it('should return none for invalid versions', () => {
      expect(_internals.getUpdateType('invalid', '1.0.0')).toBe('none');
      expect(_internals.getUpdateType('1.0.0', 'invalid')).toBe('none');
      expect(_internals.getUpdateType('', '')).toBe('none');
    });
  });

  // ============================================================================
  // Tests: Cache Read / Write
  // ============================================================================

  describe('Cache logic', () => {
    let tempDir;
    let originalCachePath;

    beforeEach(() => {
      tempDir = createTempDir();
      originalCachePath = _internals._config.CACHE_FILE_PATH;
      // Point cache to a unique temp file for each test
      _internals._config.CACHE_FILE_PATH = path.join(tempDir, '.version-check-cache');
    });

    afterEach(() => {
      _internals._config.CACHE_FILE_PATH = originalCachePath;
      cleanupTempDir(tempDir);
    });

    it('should return null when cache file does not exist', () => {
      const result = _internals.readCache();
      expect(result).toBeNull();
    });

    it('should write and read cache correctly', () => {
      _internals.writeCache('3.0.0');

      const cache = _internals.readCache();
      expect(cache).toBeDefined();
      expect(cache.latest).toBe('3.0.0');
      expect(typeof cache.checkedAt).toBe('number');
    });

    it('should return null for malformed cache', () => {
      fs.writeFileSync(_internals._config.CACHE_FILE_PATH, 'not json', 'utf8');
      expect(_internals.readCache()).toBeNull();
    });

    it('should return null for cache missing required fields', () => {
      const cachePath = _internals._config.CACHE_FILE_PATH;

      fs.writeFileSync(cachePath, JSON.stringify({ latest: '1.0.0' }), 'utf8');
      expect(_internals.readCache()).toBeNull();

      fs.writeFileSync(cachePath, JSON.stringify({ checkedAt: Date.now() }), 'utf8');
      expect(_internals.readCache()).toBeNull();
    });

    it('should validate cache TTL correctly', () => {
      const fresh = { latest: '2.0.0', checkedAt: Date.now() };
      expect(_internals.isCacheValid(fresh)).toBe(true);

      const stale = { latest: '2.0.0', checkedAt: Date.now() - (25 * 60 * 60 * 1000) };
      expect(_internals.isCacheValid(stale)).toBe(false);
    });

    it('should treat null cache as invalid', () => {
      expect(_internals.isCacheValid(null)).toBe(false);
    });

    it('should treat cache without checkedAt as invalid', () => {
      expect(_internals.isCacheValid({ latest: '1.0.0' })).toBe(false);
    });

    it('should not throw when cache directory is unwritable', () => {
      _internals._config.CACHE_FILE_PATH = '/nonexistent/path/.version-check-cache';
      // Should not throw
      expect(() => _internals.writeCache('1.0.0')).not.toThrow();
    });
  });

  // ============================================================================
  // Tests: checkVersion (with mocked fetch)
  // ============================================================================

  describe('checkVersion()', () => {
    let originalFetch;
    let originalCachePath;
    let tempDir;

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      originalCachePath = _internals._config.CACHE_FILE_PATH;
      tempDir = createTempDir();
      // Each checkVersion test gets its own isolated cache path
      _internals._config.CACHE_FILE_PATH = path.join(tempDir, '.version-check-cache');
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      _internals._config.CACHE_FILE_PATH = originalCachePath;
      cleanupTempDir(tempDir);
    });

    it('should return current version even on network failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkVersion();
      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('string');
      expect(result.latest).toBeNull();
      expect(result.updateAvailable).toBe(false);
      expect(result.updateType).toBe('none');
    });

    it('should detect when an update is available', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: '99.0.0' }),
      });

      const result = await checkVersion();
      expect(result.updateAvailable).toBe(true);
      expect(result.latest).toBe('99.0.0');
      expect(result.updateType).toBe('major');
    });

    it('should detect when no update is available', async () => {
      const current = _internals.getCurrentVersion();
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: current }),
      });

      const result = await checkVersion();
      expect(result.updateAvailable).toBe(false);
      expect(result.updateType).toBe('none');
    });

    it('should use cached result when cache is fresh', async () => {
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      // Write a fresh cache
      _internals.writeCache('5.0.0');

      const result = await checkVersion();

      // Should NOT have called fetch since cache is fresh
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.latest).toBe('5.0.0');
      expect(result.updateAvailable).toBe(true);
    });

    it('should handle HTTP errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await checkVersion();
      expect(result.latest).toBeNull();
      expect(result.updateAvailable).toBe(false);
    });

    it('should handle fetch timeout gracefully', async () => {
      globalThis.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        });
      });

      const result = await checkVersion();
      expect(result.latest).toBeNull();
      expect(result.updateAvailable).toBe(false);
    });
  });

  // ============================================================================
  // Tests: displayUpdateNotice
  // ============================================================================

  describe('displayUpdateNotice()', () => {
    let originalLog;
    let capturedOutput;

    beforeEach(() => {
      originalLog = console.log;
      capturedOutput = [];
      console.log = (...args) => {
        capturedOutput.push(args.join(' '));
      };
    });

    afterEach(() => {
      console.log = originalLog;
    });

    it('should not throw when called with update info', async () => {
      await expect(
        displayUpdateNotice({
          current: '1.0.0',
          latest: '2.0.0',
          updateAvailable: true,
          updateType: 'major',
        })
      ).resolves.not.toThrow();
    });

    it('should display output when update is available', async () => {
      await displayUpdateNotice({
        current: '1.0.0',
        latest: '2.0.0',
        updateAvailable: true,
        updateType: 'major',
      });

      const output = capturedOutput.join('\n');
      expect(output).toContain('1.0.0');
      expect(output).toContain('2.0.0');
      expect(output).toContain('@blackunicorn/bmad-cybersec');
    });

    it('should not display anything when no update is available', async () => {
      await displayUpdateNotice({
        current: '1.0.0',
        latest: '1.0.0',
        updateAvailable: false,
        updateType: 'none',
      });

      expect(capturedOutput.length).toBe(0);
    });

    it('should not throw when called with null', async () => {
      await expect(displayUpdateNotice(null)).resolves.not.toThrow();
    });

    it('should not throw when called with undefined', async () => {
      await expect(displayUpdateNotice(undefined)).resolves.not.toThrow();
    });

    it('should not display anything when latest is null', async () => {
      await displayUpdateNotice({
        current: '1.0.0',
        latest: null,
        updateAvailable: false,
        updateType: 'none',
      });

      expect(capturedOutput.length).toBe(0);
    });

    it('should handle minor update display', async () => {
      await displayUpdateNotice({
        current: '1.0.0',
        latest: '1.1.0',
        updateAvailable: true,
        updateType: 'minor',
      });

      const output = capturedOutput.join('\n');
      expect(output).toContain('1.1.0');
      expect(output).toContain('minor');
    });

    it('should handle patch update display', async () => {
      await displayUpdateNotice({
        current: '1.0.0',
        latest: '1.0.1',
        updateAvailable: true,
        updateType: 'patch',
      });

      const output = capturedOutput.join('\n');
      expect(output).toContain('1.0.1');
      expect(output).toContain('patch');
    });
  });

  // ============================================================================
  // Tests: Constants
  // ============================================================================

  describe('Constants', () => {
    it('should target @blackunicorn/bmad-cybersec as the npm package', () => {
      expect(_internals._config.NPM_PACKAGE_NAME).toBe('@blackunicorn/bmad-cybersec');
    });

    it('should use the npm registry URL', () => {
      expect(_internals._config.NPM_REGISTRY_URL).toContain('registry.npmjs.org');
      expect(_internals._config.NPM_REGISTRY_URL).toContain('@blackunicorn/bmad-cybersec');
    });

    it('should have a 24-hour cache TTL', () => {
      expect(_internals._config.CACHE_TTL_MS).toBe(24 * 60 * 60 * 1000);
    });

    it('should have a 5-second fetch timeout', () => {
      expect(_internals._config.FETCH_TIMEOUT_MS).toBe(5000);
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should export checkVersion as a named export', () => {
      expect(typeof checkVersion).toBe('function');
    });

    it('should export displayUpdateNotice as a named export', () => {
      expect(typeof displayUpdateNotice).toBe('function');
    });

    it('should export _internals for testing', () => {
      expect(_internals).toBeDefined();
      expect(typeof _internals.getCurrentVersion).toBe('function');
      expect(typeof _internals.readCache).toBe('function');
      expect(typeof _internals.writeCache).toBe('function');
      expect(typeof _internals.isCacheValid).toBe('function');
      expect(typeof _internals.fetchLatestVersion).toBe('function');
      expect(typeof _internals.getUpdateType).toBe('function');
    });
  });
});
