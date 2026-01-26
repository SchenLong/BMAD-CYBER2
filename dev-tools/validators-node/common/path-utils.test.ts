/**
 * BMAD Path Utilities Tests
 * ==========================
 * Unit tests for path resolution and validation utilities.
 */

import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  resolvePath,
  isPathInRepo,
  getProjectDir,
  normalizePath,
  getRelativePath,
} from '../../.claude/validators-node/src/common/path-utils.js';

describe('resolvePath', () => {
  const cwd = process.cwd();

  it('should resolve relative paths', () => {
    const result = resolvePath('src/index.ts', cwd);
    expect(result).toBe(path.join(cwd, 'src/index.ts'));
  });

  it('should resolve absolute paths unchanged', () => {
    const result = resolvePath('/tmp/test.txt', cwd);
    expect(result).toBe('/tmp/test.txt');
  });

  it('should expand tilde to home directory', () => {
    const result = resolvePath('~/test.txt', cwd);
    expect(result).toBe(path.join(os.homedir(), 'test.txt'));
  });

  it('should return empty string for empty input', () => {
    const result = resolvePath('', cwd);
    expect(result).toBe('');
  });

  it('should normalize path components', () => {
    const result = resolvePath('src/../src/index.ts', cwd);
    expect(result).toBe(path.join(cwd, 'src/index.ts'));
  });
});

describe('isPathInRepo', () => {
  const projectDir = process.cwd();

  it('should return true for paths inside repo', () => {
    const result = isPathInRepo('src/index.ts', projectDir, projectDir);
    expect(result).toBe(true);
  });

  it('should return true for the repo root itself', () => {
    const result = isPathInRepo(projectDir, projectDir, projectDir);
    expect(result).toBe(true);
  });

  it('should return false for paths outside repo', () => {
    const result = isPathInRepo('/tmp/external.txt', projectDir, projectDir);
    expect(result).toBe(false);
  });

  it('should return false for home directory outside repo', () => {
    const result = isPathInRepo('~/.bashrc', projectDir, projectDir);
    expect(result).toBe(false);
  });

  it('should return true for empty path (no path = allow)', () => {
    const result = isPathInRepo('', projectDir, projectDir);
    expect(result).toBe(true);
  });

  it('should handle parent directory references correctly', () => {
    // Going up and back should still be in repo
    const result = isPathInRepo('../' + path.basename(projectDir) + '/src', projectDir, projectDir);
    expect(result).toBe(true);
  });

  it('should reject paths that traverse out of repo', () => {
    const result = isPathInRepo('../../etc/passwd', projectDir, projectDir);
    expect(result).toBe(false);
  });
});

describe('getProjectDir', () => {
  it('should return process.cwd() by default', () => {
    const result = getProjectDir();
    // Should return CLAUDE_PROJECT_DIR if set, otherwise cwd
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('normalizePath', () => {
  it('should normalize path separators', () => {
    const result = normalizePath('/path/to/../to/file');
    expect(result).toBe('/path/to/file');
  });

  it('should handle multiple slashes', () => {
    const result = normalizePath('/path//to///file');
    expect(result).toBe('/path/to/file');
  });
});

describe('getRelativePath', () => {
  const projectDir = process.cwd();

  it('should return relative path from project root', () => {
    const absolutePath = path.join(projectDir, 'src', 'index.ts');
    const result = getRelativePath(absolutePath, projectDir);
    expect(result).toBe(path.join('src', 'index.ts'));
  });

  it('should handle paths outside project', () => {
    const result = getRelativePath('/tmp/test.txt', projectDir);
    // Should start with ../
    expect(result.startsWith('..')).toBe(true);
  });
});
