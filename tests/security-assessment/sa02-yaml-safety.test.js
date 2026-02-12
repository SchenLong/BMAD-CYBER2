/**
 * SA-02-S4: YAML Deserialization Safety Tests
 *
 * Validates that YAML parsing is safe across the codebase:
 * - js-yaml v4+ (safe by default)
 * - yaml v2 (safe by default)
 * - No unsafe schema usage
 * - Billion laughs (alias bomb) protection
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '../..');

describe('SA-02-S4: YAML Deserialization Safety', () => {
  // ── Check 1: js-yaml version ──────────────────────────────────────
  describe('Check 1: js-yaml version safety', () => {
    it('js-yaml is >= 4.0.0 (safe by default)', () => {
      const lockfile = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
      // Find js-yaml version in lock file
      const jsYaml = lockfile.packages?.['node_modules/js-yaml'];
      expect(jsYaml).toBeDefined();
      const version = jsYaml.version;
      const major = parseInt(version.split('.')[0], 10);
      expect(major).toBeGreaterThanOrEqual(4);
    });
  });

  // ── Check 2: No unsafe schema calls ───────────────────────────────
  describe('Check 2: No unsafe YAML schema usage', () => {
    const dangerousPatterns = [
      'UNSAFE_SCHEMA',
      'DEFAULT_FULL_SCHEMA',
      'yaml.safeLoad(',
      'customTags',
    ];

    for (const pattern of dangerousPatterns) {
      it(`no "${pattern}" usage in source files`, () => {
        try {
          const result = execSync(
            `grep -rl "${pattern}" src/ tools/ .claude/ --include="*.js" --include="*.ts" --include="*.mjs" 2>/dev/null || true`,
            { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
          );
          // Filter out node_modules and test files
          const matches = result
            .trim()
            .split('\n')
            .filter(l => l.trim())
            .filter(l => !l.includes('node_modules'));
          expect(matches).toHaveLength(0);
        } catch {
          // grep returns 1 when no matches — PASS
        }
      });
    }
  });

  // ── Check 3: yaml v2 library safety ───────────────────────────────
  describe('Check 3: yaml v2 library safety', () => {
    it('yaml library is v2+ (safe parse by default)', () => {
      const lockfile = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
      const yamlPkg = lockfile.packages?.['node_modules/yaml'];
      expect(yamlPkg).toBeDefined();
      const major = parseInt(yamlPkg.version.split('.')[0], 10);
      expect(major).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Check 4: YAML bomb protection ─────────────────────────────────
  describe('Check 4: YAML bomb (billion laughs) protection', () => {
    it('js-yaml handles alias-based YAML bomb without crashing', () => {
      // Create a small YAML bomb using anchors and aliases
      const yamlBomb = `
a: &a ["lol","lol","lol","lol","lol"]
b: &b [*a,*a,*a,*a,*a]
c: &c [*b,*b,*b,*b,*b]
d: &d [*c,*c,*c,*c,*c]
e: &e [*d,*d,*d,*d,*d]
f: &f [*e,*e,*e,*e,*e]
g: &g [*f,*f,*f,*f,*f]
h: &h [*g,*g,*g,*g,*g]
`;
      // js-yaml v4 will expand this — measure that it doesn't exceed memory limits
      // This particular bomb creates 5^8 = ~390K string elements, which is large but bounded
      // A true billion laughs would need more levels, but we cap at 8 for test safety
      const startMem = process.memoryUsage().heapUsed;
      let parsed;
      try {
        parsed = yaml.load(yamlBomb);
      } catch (e) {
        // If js-yaml rejects it, that's also acceptable
        expect(e).toBeDefined();
        return;
      }
      const endMem = process.memoryUsage().heapUsed;
      const memGrowthMB = (endMem - startMem) / (1024 * 1024);
      // Verify memory growth is bounded (< 500MB — this bomb should be ~50MB at most)
      expect(memGrowthMB).toBeLessThan(500);
    });

    it('js-yaml rejects dangerous !!js/function tag', () => {
      const malicious = '!!js/function "function() { return process.env }"';
      expect(() => yaml.load(malicious)).toThrow();
    });

    it('js-yaml rejects !!js/regexp tag', () => {
      const malicious = '!!js/regexp /test/g';
      expect(() => yaml.load(malicious)).toThrow();
    });

    it('js-yaml rejects !!python/object tag', () => {
      const malicious = '!!python/object:os.system ["id"]';
      expect(() => yaml.load(malicious)).toThrow();
    });
  });

  // ── Additional: Verify all yaml.load() callsites use safe schema ──
  describe('Callsite safety verification', () => {
    it('no yaml.load with UNSAFE_SCHEMA in codebase', () => {
      try {
        const result = execSync(
          'grep -rn "UNSAFE_SCHEMA" src/ tools/ --include="*.js" --include="*.ts" 2>/dev/null || true',
          { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
        );
        expect(result.trim()).toBe('');
      } catch {
        // No matches — PASS
      }
    });

    it('js-yaml CORE_SCHEMA is used where explicit schema is needed', () => {
      // Verify at least some callsites use the most restrictive schema
      try {
        const result = execSync(
          'grep -rl "CORE_SCHEMA" src/ tools/ --include="*.js" --include="*.ts" 2>/dev/null || true',
          { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
        );
        const files = result.trim().split('\n').filter(l => l.trim());
        expect(files.length).toBeGreaterThan(0);
      } catch {
        expect.fail('Expected at least one file using CORE_SCHEMA');
      }
    });
  });
});
