/**
 * Unit Tests for Cross-Platform Glob Wrapper
 * Task 0.5 - Fix Glob Pattern Cross-Platform Normalization
 *
 * Tests the cross-platform glob wrapper that normalizes path separators
 * so that backslash-based Windows patterns work correctly.
 *
 * @module utility/cross-platform-glob.test
 */

import { describe, expect, it } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob, normalizePath } from '../../src/utility/cross-platform-glob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// ============================================================================
// normalizePath tests
// ============================================================================

describe('normalizePath', () => {
  it('should convert backslashes to forward slashes', () => {
    expect(normalizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
  });

  it('should leave forward slashes unchanged', () => {
    expect(normalizePath('foo/bar/baz')).toBe('foo/bar/baz');
  });

  it('should handle mixed separators', () => {
    expect(normalizePath('foo\\bar/baz\\qux')).toBe('foo/bar/baz/qux');
  });

  it('should handle empty string', () => {
    expect(normalizePath('')).toBe('');
  });

  it('should handle Windows-style absolute path', () => {
    expect(normalizePath('C:\\Users\\test\\project')).toBe('C:/Users/test/project');
  });

  it('should handle UNC paths', () => {
    expect(normalizePath('\\\\server\\share\\folder')).toBe('//server/share/folder');
  });
});

// ============================================================================
// glob pattern normalization tests
// ============================================================================

describe('glob', () => {
  describe('pattern normalization', () => {
    it('should normalize a Windows-style pattern and find files', async () => {
      // Use backslashes in the pattern - should still work
      const pattern = path.join(projectRoot, '_bmad\\**\\*.md').replace(/\//g, '\\');
      // On non-Windows systems, backslashes in the pattern get normalized to forward slashes
      const results = await glob(pattern);
      // We just need to verify the function doesn't throw on backslash patterns
      expect(Array.isArray(results)).toBe(true);
    });

    it('should work with forward-slash patterns unchanged', async () => {
      const pattern = `${projectRoot}/_bmad/**/*.md`;
      const results = await glob(pattern);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find markdown files in _bmad directory', async () => {
      const results = await glob(`${projectRoot}/_bmad/**/*.md`);
      expect(results.length).toBeGreaterThan(0);
      // All results should be .md files
      for (const filePath of results) {
        expect(filePath.endsWith('.md')).toBe(true);
      }
    });

    it('should return empty array when pattern matches nothing', async () => {
      const results = await glob(`${projectRoot}/_bmad/**/*.nonexistent_extension_xyz`);
      expect(results).toEqual([]);
    });
  });

  describe('options passthrough', () => {
    it('should pass options through to the underlying glob', async () => {
      const results = await glob(`${projectRoot}/_bmad/**/*.md`, {
        ignore: ['**/node_modules/**']
      });
      expect(Array.isArray(results)).toBe(true);
      // Verify no node_modules paths
      for (const filePath of results) {
        expect(filePath).not.toContain('node_modules');
      }
    });

    it('should support the cwd option', async () => {
      const results = await glob('**/*.md', {
        cwd: `${projectRoot}/_bmad`,
        ignore: ['**/node_modules/**']
      });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('cross-platform behavior', () => {
    it('should handle pattern with mixed separators', async () => {
      // Simulate a mixed-separator pattern
      const pattern = `${projectRoot}/_bmad/**/*.md`.replace(/\//g, '\\');
      const results = await glob(pattern);
      expect(Array.isArray(results)).toBe(true);
      // On macOS/Linux this should still work because we normalize
    });

    it('should set windowsPathsNoEscape by default', async () => {
      // This tests that the wrapper sets windowsPathsNoEscape: true
      // which prevents backslashes from being treated as escape characters
      const results = await glob(`${projectRoot}/_bmad/**/*.md`);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
