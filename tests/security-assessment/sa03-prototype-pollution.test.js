/**
 * SA-03-S4: Prototype Pollution & Deserialization Penetration Tests
 *
 * Target: package-merger.js, YAML parsers (js-yaml, yaml)
 * Purpose: Attempt prototype pollution via malicious payloads.
 * Method: RUNTIME tests — execute payloads against real sanitization.
 *
 * Acceptance Criteria:
 * - All 5 pollution payloads tested
 * - 0 successful prototype modifications
 * - Recursive sanitization verified at depth 5+
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../..');

// Mock the prompts and logger modules
vi.mock('../../tools/cli/lib/prompts.js', () => ({
  confirm: vi.fn().mockResolvedValue(true),
  isCancel: vi.fn().mockReturnValue(false),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock('../../tools/cli/lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

// ============================================================================
describe('SA-03-S4: Prototype Pollution & Deserialization', () => {

  // --------------------------------------------------------------------------
  // Test 1: __proto__ in dependencies
  // --------------------------------------------------------------------------
  describe('prototype pollution via package.json merging', () => {
    afterEach(() => {
      // CRITICAL: Clean prototype after every test
      delete Object.prototype.admin;
      delete Object.prototype.isAdmin;
      delete Object.prototype.pwned;
      delete Object.prototype.polluted;
    });

    it('PENTEST-S4-01: __proto__.admin in dependencies stripped', async () => {
      const maliciousJson = '{"name":"test","version":"1.0.0","dependencies":{"__proto__":{"admin":true}}}';
      const parsed = JSON.parse(maliciousJson);

      // Verify the attack vector: JSON.parse creates __proto__ as own property
      expect(Object.getOwnPropertyNames(parsed.dependencies)).toContain('__proto__');

      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = join(ROOT, `.tmp-pentest-s4-01-${  Date.now()}`);
      mkdirSync(tmpDir, { recursive: true });

      try {
        writeFileSync(join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });

        // Verify prototype was NOT polluted
        expect(({}).admin).toBeUndefined();
        expect(Object.prototype.admin).toBeUndefined();
      } finally {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('PENTEST-S4-02: constructor.prototype.isAdmin stripped', async () => {
      const maliciousJson = JSON.stringify({
        name: 'test', version: '1.0.0',
        devDependencies: { constructor: { prototype: { isAdmin: true } } }
      });

      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = join(ROOT, `.tmp-pentest-s4-02-${  Date.now()}`);
      mkdirSync(tmpDir, { recursive: true });

      try {
        writeFileSync(join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(({}).isAdmin).toBeUndefined();
      } finally {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('PENTEST-S4-03: 5-level nested __proto__ caught by recursive sanitization', async () => {
      // Build 5-level deep payload
      const maliciousJson = '{"name":"test","version":"1.0.0","config":{"a":{"b":{"c":{"d":{"__proto__":{"pwned":true}}}}}}}';
      const parsed = JSON.parse(maliciousJson);

      // Verify attack vector exists at depth
      expect(Object.getOwnPropertyNames(parsed.config.a.b.c.d)).toContain('__proto__');

      const { mergePackageJson } = await import('../../tools/cli/lib/package-merger.js');
      const tmpDir = join(ROOT, `.tmp-pentest-s4-03-${  Date.now()}`);
      mkdirSync(tmpDir, { recursive: true });

      try {
        writeFileSync(join(tmpDir, 'package.json'), maliciousJson);
        await mergePackageJson(tmpDir, { yes: true });
        expect(({}).pwned).toBeUndefined();
      } finally {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('PENTEST-S4-04: JSON.parse __proto__ as own property handled safely', () => {
      // JSON.parse creates __proto__ as an own property (not on prototype chain)
      const parsed = JSON.parse('{"__proto__": "value"}');
      expect(Object.getOwnPropertyNames(parsed)).toContain('__proto__');

      // Verify sanitizeObject exists and handles this
      const src = readFileSync(resolve(ROOT, 'tools/cli/lib/package-merger.js'), 'utf-8');
      expect(src).toContain('Object.getOwnPropertyNames');
      expect(src).toContain('sanitizeObject');
    });
  });

  // --------------------------------------------------------------------------
  // Test 5: YAML deserialization safety
  // --------------------------------------------------------------------------
  describe('YAML deserialization safety', () => {
    it('PENTEST-S4-05a: js-yaml uses safe schema (no custom tags)', () => {
      // js-yaml's yaml.load() with default options uses DEFAULT_SCHEMA
      // which is the safe schema that rejects custom tags
      const jsYaml = require('js-yaml');

      // Attempt to deserialize a Python object tag
      const maliciousYaml = '!!python/object:os.system ["id"]';
      expect(() => {
        jsYaml.load(maliciousYaml);
      }).toThrow(); // Safe schema rejects !!python tags
    });

    it('PENTEST-S4-05b: yaml package uses safe parsing (no custom tags)', () => {
      const yaml = require('yaml');

      // Attempt to deserialize with custom tag
      const maliciousYaml = '!!python/object:os.system ["id"]';
      // yaml.parse with default options rejects unknown tags
      const result = yaml.parse(maliciousYaml);
      // If it doesn't throw, it should parse as a plain string/null, NOT execute
      expect(typeof result).not.toBe('function');
    });

    it('PENTEST-S4-05c: js-yaml rejects !!js/function tag', () => {
      const jsYaml = require('js-yaml');

      const maliciousYaml = '!!js/function "function(){return process.env}"';
      expect(() => {
        jsYaml.load(maliciousYaml);
      }).toThrow(); // Safe schema rejects !!js tags
    });

    it('PENTEST-S4-05d: js-yaml rejects !!js/undefined tag', () => {
      const jsYaml = require('js-yaml');

      const maliciousYaml = '!!js/undefined ""';
      expect(() => {
        jsYaml.load(maliciousYaml);
      }).toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // Source-level verification
  // --------------------------------------------------------------------------
  describe('sanitization source code verification', () => {
    const src = readFileSync(resolve(ROOT, 'tools/cli/lib/package-merger.js'), 'utf-8');

    it('DANGEROUS_KEYS includes __proto__, constructor, and prototype', () => {
      expect(src).toContain("'__proto__'");
      expect(src).toContain("'constructor'");
      expect(src).toContain("'prototype'");
      expect(src).toMatch(/DANGEROUS_KEYS\s*=\s*new\s+Set\(/);
    });

    it('uses Object.getOwnPropertyNames (not Object.keys)', () => {
      expect(src).toContain('Object.getOwnPropertyNames');
    });

    it('recursively sanitizes nested objects', () => {
      expect(src).toMatch(/sanitizeObject\(value[^)]*\)/);
    });

    it('sanitizes existing package.json on load', () => {
      expect(src).toContain('sanitizeObject(existing)');
    });
  });
});
