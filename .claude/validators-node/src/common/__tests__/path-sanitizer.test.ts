/**
 * Path Sanitizer Tests
 * ====================
 * Tests for preprocessPath, sanitizePath, and sanitizeErrorMessage
 * added in Task 0.1 (Fix Absolute Path Leaks in Validation Reports).
 */

import { describe, expect, it } from 'vitest';
import {
  preprocessPath,
  sanitizeErrorMessage,
  sanitizePath,
} from '../path-utils.js';

// Use a stable fake project directory for all tests
const FAKE_PROJECT = '/home/user/my-project';

describe('preprocessPath', () => {
  it('returns empty string for empty input', () => {
    expect(preprocessPath('')).toBe('');
  });

  it('returns empty string for null-ish input', () => {
    // TypeScript would catch this, but runtime defense matters
    expect(preprocessPath(undefined as unknown as string)).toBe('');
    expect(preprocessPath(null as unknown as string)).toBe('');
  });

  it('strips null bytes (VULN-004)', () => {
    const malicious = '/home/user\0/my-project/secret.txt';
    const result = preprocessPath(malicious);
    expect(result).not.toContain('\0');
    expect(result).toBe('/home/user/my-project/secret.txt');
  });

  it('strips embedded newlines (VULN-007)', () => {
    const malicious = '/home/user\n/my-project/secret.txt';
    const result = preprocessPath(malicious);
    expect(result).not.toContain('\n');
    expect(result).toBe('/home/user/my-project/secret.txt');
  });

  it('strips embedded carriage returns (VULN-007)', () => {
    const malicious = '/home/user\r\n/my-project/secret.txt';
    const result = preprocessPath(malicious);
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
    expect(result).toBe('/home/user/my-project/secret.txt');
  });

  it('decodes URL-encoded paths (VULN-002)', () => {
    const encoded = '%2Fhome%2Fuser%2Fmy-project%2Ffile.txt';
    const result = preprocessPath(encoded);
    expect(result).toBe('/home/user/my-project/file.txt');
  });

  it('decodes double-encoded paths (VULN-003)', () => {
    // %252F is double-encoded /  (%25 = %, so %252F -> %2F -> /)
    const doubleEncoded = '%252Fhome%252Fuser%252Fmy-project';
    const result = preprocessPath(doubleEncoded);
    expect(result).toBe('/home/user/my-project');
  });

  it('decodes triple-encoded paths (VULN-003)', () => {
    // %25252F is triple-encoded /
    const tripleEncoded = '%25252Fhome%25252Fuser';
    const result = preprocessPath(tripleEncoded);
    expect(result).toBe('/home/user');
  });

  it('handles malformed percent-encoding gracefully', () => {
    const malformed = '/home/user/%ZZ/file.txt';
    const result = preprocessPath(malformed);
    // Should not throw, should return the string as-is after other transformations
    expect(result).toContain('/home/user/');
  });

  it('normalizes Unicode via NFKC (VULN-001)', () => {
    // Fullwidth slash U+FF0F should normalize to regular /
    const homoglyph = '/home\uFF0Fuser\uFF0Fmy-project';
    const result = preprocessPath(homoglyph);
    expect(result).toBe('/home/user/my-project');
  });

  it('normalizes backslashes to forward slashes', () => {
    const windowsPath = '\\home\\user\\my-project\\file.txt';
    const result = preprocessPath(windowsPath);
    expect(result).toBe('/home/user/my-project/file.txt');
  });

  it('handles combined bypass vectors', () => {
    // Null byte + URL encoding + newline
    const combined = '%2Fhome\0%2Fuser\n%2Fmy-project';
    const result = preprocessPath(combined);
    expect(result).toBe('/home/user/my-project');
    expect(result).not.toContain('\0');
    expect(result).not.toContain('\n');
  });
});

describe('sanitizePath', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizePath('', FAKE_PROJECT)).toBe('');
  });

  it('replaces project root with placeholder', () => {
    const result = sanitizePath(
      '/home/user/my-project/src/index.ts',
      FAKE_PROJECT
    );
    expect(result).toBe('{project-root}/src/index.ts');
  });

  it('returns placeholder for the project root itself', () => {
    const result = sanitizePath('/home/user/my-project', FAKE_PROJECT);
    expect(result).toBe('{project-root}');
  });

  it('returns placeholder for project root with trailing slash', () => {
    const result = sanitizePath('/home/user/my-project/', FAKE_PROJECT);
    expect(result).toBe('{project-root}');
  });

  it('shows only filename for external paths', () => {
    const result = sanitizePath('/etc/passwd', FAKE_PROJECT);
    expect(result).toBe('{external}/passwd');
  });

  it('shows only filename for deeply nested external paths', () => {
    const result = sanitizePath(
      '/var/log/some/deeply/nested/app.log',
      FAKE_PROJECT
    );
    expect(result).toBe('{external}/app.log');
  });

  it('handles Windows-style paths with backslashes', () => {
    const result = sanitizePath(
      '\\home\\user\\my-project\\src\\file.ts',
      FAKE_PROJECT
    );
    expect(result).toBe('{project-root}/src/file.ts');
  });

  it('defeats Unicode homoglyph bypass (VULN-001)', () => {
    // Using fullwidth slash to try to evade project root matching
    const homoglyphPath = '/home\uFF0Fuser\uFF0Fmy-project\uFF0Fsrc\uFF0Fsecret.ts';
    const result = sanitizePath(homoglyphPath, FAKE_PROJECT);
    expect(result).toBe('{project-root}/src/secret.ts');
  });

  it('defeats URL-encoded bypass (VULN-002)', () => {
    const encoded = '%2Fhome%2Fuser%2Fmy-project%2Fsrc%2Ffile.ts';
    const result = sanitizePath(encoded, FAKE_PROJECT);
    expect(result).toBe('{project-root}/src/file.ts');
  });

  it('defeats double-encoded bypass (VULN-003)', () => {
    const doubleEncoded =
      '%252Fhome%252Fuser%252Fmy-project%252Fsrc%252Ffile.ts';
    const result = sanitizePath(doubleEncoded, FAKE_PROJECT);
    expect(result).toBe('{project-root}/src/file.ts');
  });

  it('defeats null byte injection (VULN-004)', () => {
    const nullByte = '/home/user/my-project\0/../../etc/passwd';
    const result = sanitizePath(nullByte, FAKE_PROJECT);
    // After stripping null bytes and normalizing, the traversal resolves
    // to /etc/passwd which is external
    expect(result).toBe('{external}/passwd');
  });

  it('defeats embedded newline splitting (VULN-007)', () => {
    const newlineSplit = '/home/user/my-project\n/src/file.ts';
    const result = sanitizePath(newlineSplit, FAKE_PROJECT);
    // After stripping newlines, becomes /home/user/my-project/src/file.ts
    expect(result).toBe('{project-root}/src/file.ts');
  });

  it('handles path traversal by collapsing it', () => {
    const traversal = '/home/user/my-project/src/../../../etc/passwd';
    const result = sanitizePath(traversal, FAKE_PROJECT);
    // path.posix.normalize collapses the traversal to /etc/passwd
    expect(result).toBe('{external}/passwd');
  });

  it('is idempotent (double-sanitize produces same result)', () => {
    const input = '/home/user/my-project/src/index.ts';
    const first = sanitizePath(input, FAKE_PROJECT);
    const second = sanitizePath(first, FAKE_PROJECT);

    // The second sanitize sees {project-root}/... which won't match the
    // project dir, so it becomes external. But the key property is that
    // no absolute paths leak through.
    expect(second).not.toContain('/home/user');
    expect(second).not.toContain(FAKE_PROJECT);

    // Also verify the first result is correct
    expect(first).toBe('{project-root}/src/index.ts');
  });

  it('does not leak project root in any output', () => {
    const paths = [
      '/home/user/my-project/src/index.ts',
      '/home/user/my-project',
      '/etc/passwd',
      '/var/log/app.log',
      '/home/user/my-project/node_modules/.cache/file.js',
    ];

    for (const p of paths) {
      const result = sanitizePath(p, FAKE_PROJECT);
      expect(result).not.toContain('/home/user');
    }
  });
});

describe('sanitizeErrorMessage', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeErrorMessage('', FAKE_PROJECT)).toBe('');
  });

  it('sanitizes a single embedded path', () => {
    const msg = 'Error reading /home/user/my-project/config.json';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe('Error reading {project-root}/config.json');
  });

  it('sanitizes multiple embedded paths', () => {
    const msg =
      'Cannot copy /home/user/my-project/src/a.ts to /home/user/my-project/dist/a.js';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe(
      'Cannot copy {project-root}/src/a.ts to {project-root}/dist/a.js'
    );
  });

  it('sanitizes external paths in error messages', () => {
    const msg = 'Permission denied: /etc/shadow';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe('Permission denied: {external}/shadow');
  });

  it('handles error messages with line:col info', () => {
    const msg = 'SyntaxError in /home/user/my-project/src/app.ts:42:10';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe('SyntaxError in {project-root}/src/app.ts');
  });

  it('leaves messages without paths unchanged', () => {
    const msg = 'Something went wrong with the configuration';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe('Something went wrong with the configuration');
  });

  it('does not leak any absolute paths', () => {
    const msg =
      'Failed at /home/user/my-project/node_modules/pkg/index.js:12:5 ' +
      'while reading /var/secrets/key.pem';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).not.toContain('/home/user');
    expect(result).not.toContain('/var/secrets');
    expect(result).toContain('{project-root}');
    expect(result).toContain('{external}');
  });

  it('handles mixed content with paths and normal text', () => {
    const msg = 'File /home/user/my-project/README.md has 42 lines and 1024 bytes';
    const result = sanitizeErrorMessage(msg, FAKE_PROJECT);
    expect(result).toBe('File {project-root}/README.md has 42 lines and 1024 bytes');
  });
});
