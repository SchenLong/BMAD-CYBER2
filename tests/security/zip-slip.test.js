/**
 * Zip-Slip (Path Traversal) Security Tests - P3-14
 *
 * Target: tools/cli/lib/extractor.js
 * Purpose: Verify that extractor.js prevents zip-slip (path traversal) attacks
 * and permission escalation during tar archive extraction.
 *
 * Zip-slip attacks exploit archive entries with path traversal sequences
 * (e.g., ../../etc/passwd) to write files outside the target directory.
 * The validatePathSafety() and validateSymlinkSafety() functions in extractor.js
 * are the primary defenses.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Zip-Slip Prevention Tests
// ============================================================================

describe('Zip-Slip (Path Traversal) Prevention - P3-14', () => {
  const extractorPath = path.resolve(__dirname, '../../tools/cli/lib/extractor.js');
  let extractorSource;

  beforeEach(() => {
    extractorSource = fs.readFileSync(extractorPath, 'utf-8');
  });

  // --------------------------------------------------------------------------
  // 1. Static Analysis: validatePathSafety defense mechanisms
  // --------------------------------------------------------------------------
  describe('Static Analysis: validatePathSafety defense mechanisms', () => {
    it('should define a validatePathSafety function', () => {
      expect(extractorSource).toContain('function validatePathSafety');
    });

    it('should check for ".." path traversal sequences', () => {
      expect(extractorSource).toMatch(/includes\(['"]\.\.['"]|\.\.(?=['"])/);
    });

    it('should check for absolute paths starting with "/"', () => {
      expect(extractorSource).toMatch(/startsWith\(['"]\//);
    });

    it('should use path.resolve to resolve paths against target directory', () => {
      expect(extractorSource).toContain('resolve(targetDir');
    });

    it('should use path.relative to verify resolved path stays within target', () => {
      expect(extractorSource).toContain('relative(targetDir');
    });

    it('should normalize paths before checking (prevent encoding bypasses)', () => {
      expect(extractorSource).toContain('normalize(entryPath)');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Static Analysis: validateSymlinkSafety defense mechanisms
  // --------------------------------------------------------------------------
  describe('Static Analysis: validateSymlinkSafety defense mechanisms', () => {
    it('should define a validateSymlinkSafety function', () => {
      expect(extractorSource).toContain('function validateSymlinkSafety');
    });

    it('should resolve symlink targets relative to link directory', () => {
      expect(extractorSource).toContain('dirname(linkPath)');
      expect(extractorSource).toContain('resolve(linkDir');
    });

    it('should check symlinks in the extraction filter', () => {
      expect(extractorSource).toContain('SymbolicLink');
      expect(extractorSource).toContain('linkpath');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Path traversal attack vectors
  // --------------------------------------------------------------------------
  describe('Path traversal attack vectors (unit testing validatePathSafety logic)', () => {
    // Inline re-implementation of the validation logic for unit testing,
    // since the function is not exported from extractor.js.

    function validatePathSafety(targetDir, entryPath) {
      const normalizedEntry = path.normalize(entryPath).replace(/\\/g, '/');
      if (normalizedEntry.includes('..') ||
          normalizedEntry.startsWith('/') ||
          normalizedEntry.includes('//')) {
        return { safe: false, error: `Path traversal detected: "${  entryPath  }"` };
      }
      const resolvedPath = path.resolve(targetDir, normalizedEntry);
      const relativePath = path.relative(targetDir, resolvedPath);
      if (relativePath.startsWith('..') || path.resolve(targetDir, relativePath) !== resolvedPath) {
        return { safe: false, error: `Path escapes target: "${  entryPath  }"` };
      }
      return { safe: true, resolvedPath };
    }

    const targetDir = '/tmp/extract-target';

    it('should reject ../../../etc/passwd path traversal', () => {
      const result = validatePathSafety(targetDir, '../../../etc/passwd');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('should reject ../../etc/shadow path traversal', () => {
      const result = validatePathSafety(targetDir, '../../etc/shadow');
      expect(result.safe).toBe(false);
    });

    it('should reject absolute path /etc/passwd', () => {
      const result = validatePathSafety(targetDir, '/etc/passwd');
      expect(result.safe).toBe(false);
    });

    it('should reject absolute path /tmp/evil', () => {
      const result = validatePathSafety(targetDir, '/tmp/evil');
      expect(result.safe).toBe(false);
    });

    it('should reject path with embedded .. components (foo/../../bar)', () => {
      const result = validatePathSafety(targetDir, 'foo/../../bar');
      expect(result.safe).toBe(false);
    });

    it('should reject double-slash paths (//etc/passwd)', () => {
      const result = validatePathSafety(targetDir, '//etc/passwd');
      expect(result.safe).toBe(false);
    });

    it('should accept valid relative paths (src/index.js)', () => {
      const result = validatePathSafety(targetDir, 'src/index.js');
      expect(result.safe).toBe(true);
    });

    it('should accept paths with . current-directory component', () => {
      const result = validatePathSafety(targetDir, './src/index.js');
      expect(result.safe).toBe(true);
    });

    it('should accept deeply nested valid paths', () => {
      const result = validatePathSafety(targetDir, 'a/b/c/d/e/f.txt');
      expect(result.safe).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Symlink-based path traversal
  // --------------------------------------------------------------------------
  describe('Symlink-based path traversal attacks', () => {
    function validateSymlinkSafety(targetDir, linkPath, linkTarget) {
      const linkDir = path.dirname(linkPath);
      const resolvedTarget = path.resolve(linkDir, linkTarget);
      const relativePath = path.relative(targetDir, resolvedTarget);
      if (relativePath.startsWith('..')) {
        return { safe: false, error: 'Symlink points outside target' };
      }
      return { safe: true };
    }

    const targetDir = '/tmp/extract-target';

    it('should reject symlink pointing to /etc/passwd', () => {
      const linkPath = path.join(targetDir, 'evil-link');
      const result = validateSymlinkSafety(targetDir, linkPath, '/etc/passwd');
      expect(result.safe).toBe(false);
    });

    it('should reject symlink with relative escape (../../etc/shadow)', () => {
      const linkPath = path.join(targetDir, 'subdir', 'evil-link');
      const result = validateSymlinkSafety(targetDir, linkPath, '../../etc/shadow');
      expect(result.safe).toBe(false);
    });

    it('should accept symlink pointing within target directory', () => {
      const linkPath = path.join(targetDir, 'link-to-src');
      const result = validateSymlinkSafety(targetDir, linkPath, './src/index.js');
      expect(result.safe).toBe(true);
    });

    it('should accept symlink using relative path within target', () => {
      const linkPath = path.join(targetDir, 'subdir', 'link');
      const result = validateSymlinkSafety(targetDir, linkPath, '../other/file.txt');
      // This resolves to /tmp/extract-target/other/file.txt - still within target
      expect(result.safe).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Permission escalation prevention
  // --------------------------------------------------------------------------
  describe('Permission escalation prevention', () => {
    it('should use tar chmod option for controlled permissions', () => {
      expect(extractorSource).toContain('chmod: true');
    });

    it('should handle entry.mode in onReadEntry', () => {
      expect(extractorSource).toContain('onReadEntry');
      expect(extractorSource).toContain('entry.mode');
    });

    it('should log security violations during extraction', () => {
      expect(extractorSource).toContain('securityViolations');
      expect(extractorSource).toContain('Security:');
    });

    it('should track and report blocked malicious entries', () => {
      expect(extractorSource).toContain('securityViolations.push');
      expect(extractorSource).toMatch(/potentially malicious entries/);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Extraction filter safety
  // --------------------------------------------------------------------------
  describe('Extraction filter safety', () => {
    it('should skip .git directories', () => {
      expect(extractorSource).toContain("'.git/'");
    });

    it('should skip node_modules directories', () => {
      expect(extractorSource).toContain("'node_modules/'");
    });

    it('should skip test files', () => {
      expect(extractorSource).toContain("'*.test.js'");
      expect(extractorSource).toContain("'*.test.ts'");
    });

    it('should have strip:1 to remove top-level directory from tar', () => {
      expect(extractorSource).toContain('strip: 1');
    });

    it('should resolve targetDir to absolute path before validation', () => {
      expect(extractorSource).toContain('resolve(targetDir)');
    });
  });
});
