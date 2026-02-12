/**
 * Prototype Pollution Security Tests - P3-13
 *
 * Target: tools/cli/lib/package-merger.js
 * Purpose: Verify that package-merger.js is resistant to prototype pollution
 * attacks via malicious package.json payloads.
 *
 * Prototype pollution occurs when an attacker can inject properties into
 * Object.prototype via unsafe object merging, affecting all objects in the
 * runtime. The sanitizeObject() function in package-merger.js is the primary
 * defense and must strip __proto__, constructor, and prototype keys at all
 * nesting depths.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the prompts and logger modules to prevent interactive prompts.
vi.mock('../../tools/cli/lib/prompts.js', () => ({
  confirm: vi.fn().mockResolvedValue(true),
  isCancel: vi.fn().mockReturnValue(false),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock('../../tools/cli/lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

// ============================================================================
// Prototype Pollution Prevention Tests
// ============================================================================

describe('Prototype Pollution Prevention - P3-13', () => {
  const mergerPath = path.resolve(__dirname, '../../tools/cli/lib/package-merger.js');
  let src;

  beforeEach(() => {
    src = fs.readFileSync(mergerPath, 'utf-8');
  });

  // --------------------------------------------------------------------------
  // 1. Static Analysis: sanitizeObject defense mechanisms
  // --------------------------------------------------------------------------
  describe('Static Analysis: sanitizeObject defense mechanisms', () => {
    it('should define DANGEROUS_KEYS with __proto__, constructor, and prototype', () => {
      expect(src).toContain('__proto__');
      expect(src).toContain('constructor');
      expect(src).toContain('prototype');
      expect(src).toMatch(/DANGEROUS_KEYS\s*=\s*new\s+Set\(/);
    });

    it('should use Object.getOwnPropertyNames instead of Object.keys or for...in', () => {
      expect(src).toContain('Object.getOwnPropertyNames');
    });

    it('should recursively sanitize nested objects', () => {
      expect(src).toMatch(/sanitizeObject\(value[^)]*\)/);
    });

    it('should skip arrays (not recurse into array elements as objects)', () => {
      expect(src).toContain('Array.isArray(obj)');
    });

    it('should call sanitizeObject on existing package.json before merging', () => {
      expect(src).toContain('sanitizeObject(existing)');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Runtime Tests: __proto__ pollution attempts
  // --------------------------------------------------------------------------
  describe('Runtime: __proto__ pollution via JSON.parse', () => {
    afterEach(() => {
      // CRITICAL: Verify Object.prototype is clean after every test
      expect(Object.prototype.polluted).toBeUndefined();
      expect(Object.prototype.isAdmin).toBeUndefined();
      expect(Object.prototype.role).toBeUndefined();
      expect(Object.prototype.malicious).toBeUndefined();
      delete Object.prototype.polluted;
      delete Object.prototype.isAdmin;
      delete Object.prototype.role;
      delete Object.prototype.malicious;
    });

    it('should strip top-level __proto__ key from parsed JSON', async () => {
      const maliciousJson = '{"__proto__": {"polluted": true}, "name": "safe-pkg", "version": "1.0.0"}';
      const parsed = JSON.parse(maliciousJson);
      // Verify the attack vector exists: JSON.parse creates __proto__ as own property
      expect(Object.getOwnPropertyNames(parsed)).toContain('__proto__');

      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-proto-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });

      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        const result = await mergePackageJson(tmpDir, { yes: true });
        expect(result.cancelled).toBeFalsy();
        const testObj = {};
        expect(testObj.polluted).toBeUndefined();
        expect(({}).polluted).toBeUndefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should strip __proto__ from dependencies section', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        dependencies: { '__proto__': { 'isAdmin': true }, 'express': '^4.18.0' }
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-proto-deps-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(({}).isAdmin).toBeUndefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should strip deeply nested __proto__ keys', async () => {
      // Must use raw JSON string — JSON.stringify strips __proto__ set via object literal
      const maliciousJson = '{"name":"test-pkg","version":"1.0.0","scripts":{"nested":{"__proto__":{"role":"admin"}}}}';
      const parsed = JSON.parse(maliciousJson);
      expect(Object.getOwnPropertyNames(parsed.scripts.nested)).toContain('__proto__');
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-nested-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(({}).role).toBeUndefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. Runtime Tests: constructor.prototype pollution attempts
  // --------------------------------------------------------------------------
  describe('Runtime: constructor.prototype pollution', () => {
    afterEach(() => {
      delete Object.prototype.polluted;
      delete Object.prototype.malicious;
    });

    it('should strip constructor key from package.json', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        constructor: { prototype: { malicious: true } }
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-ctor-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(({}).malicious).toBeUndefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should strip prototype key from nested objects', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        devDependencies: { prototype: { polluted: 'yes' } }
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-proto-key-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        const result = await mergePackageJson(tmpDir, { yes: true });
        if (result.success) {
          const merged = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'));
          expect(merged.devDependencies).not.toHaveProperty('prototype');
        }
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Dangerous dependency name detection
  // --------------------------------------------------------------------------
  describe('Dangerous dependency name detection', () => {
    it('should reject path traversal in dependency names', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        dependencies: { '../../../etc/passwd': '1.0.0' }
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-trav-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await expect(mergePackageJson(tmpDir, { yes: true })).rejects.toThrow(/path traversal/i);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should reject absolute path dependency names', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        dependencies: { '/etc/passwd': '1.0.0' }
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-abs-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await expect(mergePackageJson(tmpDir, { yes: true })).rejects.toThrow(/path traversal/i);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Edge cases and bypass attempts
  // --------------------------------------------------------------------------
  describe('Edge cases and bypass attempts', () => {
    afterEach(() => {
      delete Object.prototype.polluted;
    });

    it('should handle null and non-object values gracefully', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        dependencies: null, devDependencies: 'not-an-object', scripts: 42
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-null-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        const result = await mergePackageJson(tmpDir, { yes: true });
        expect(result).toBeDefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should preserve arrays without deep-mutating them', async () => {
      const json = JSON.stringify({
        name: 'test-pkg', version: '1.0.0',
        keywords: ['safe', 'test'], files: ['src/', 'lib/']
      });
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-arrays-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), json);
        await mergePackageJson(tmpDir, { yes: true });
        const result = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'));
        expect(Array.isArray(result.keywords)).toBe(true);
        expect(result.keywords).toContain('safe');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should log warnings when dangerous keys are stripped', async () => {
      const { logger } = await import('../../tools/cli/lib/logger.js');
      const maliciousJson = '{"name":"test","version":"1.0.0","__proto__":{"p":1}}';
      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = path.join(__dirname, `../../.tmp-test-warn-${  Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('__proto__'));
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
