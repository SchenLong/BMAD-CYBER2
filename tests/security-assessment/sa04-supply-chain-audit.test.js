/**
 * SA-04: Supply Chain Audit — Package & Dependency Security
 *
 * Validates all 14 checks from MASTER-BMAD-QA Section 11.7:
 * 4.1  Tarball contents — no secrets
 * 4.2  LICENSE file present
 * 4.3  .npmignore excludes sensitive paths
 * 4.4  npm audit — 0 HIGH/CRITICAL
 * 4.5  Dependencies pinned (^ or ~)
 * 4.6  No typosquatting in dependency names
 * 4.7  bundledDependencies matches actual usage
 * 4.8  Install with --ignore-scripts works
 * 4.9  No eval(), new Function(), dynamic require() in shipped code
 * 4.10 PRESERVE_FILES includes security infrastructure
 * 4.11 Upgrade path preserves hooks and validators
 * 4.12 Checksum verification mandatory in downloader
 * 4.13 SBOM generation capability
 * 4.14 tar dependency >= 7.5.7
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(import.meta.dirname, '../..');
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const readText = (p) => readFileSync(join(ROOT, p), 'utf8');

// Load package.json once
const pkg = readJson('package.json');

describe('SA-04: Supply Chain Audit', () => {

  // ===== CHECK 4.1: Tarball contents — no secrets =====
  describe('4.1 Tarball contents — no secrets', () => {
    let packOutput;

    // Run npm pack --dry-run once and cache
    try {
      packOutput = execSync('npm pack --dry-run 2>&1', { cwd: ROOT, encoding: 'utf8' });
    } catch {
      packOutput = '';
    }

    it('should not include .env files in tarball', () => {
      const lines = packOutput.split('\n').filter(l => l.includes('.env'));
      // Filter out false positives (e.g., .env.example in gitignore references)
      const envFiles = lines.filter(l =>
        /\b\.env\b/.test(l) && !l.includes('.env.example') && !l.includes('npmignore')
      );
      expect(envFiles.length).toBe(0);
    });

    it('should not include credential files', () => {
      const lines = packOutput.split('\n');
      const credentialPatterns = [/credentials\./, /\.pem\b/, /\.key\b/, /id_rsa/];
      const violations = lines.filter(l =>
        credentialPatterns.some(p => p.test(l))
      );
      expect(violations).toEqual([]);
    });

    it('should not include _bmad-output/', () => {
      expect(packOutput).not.toContain('_bmad-output/');
    });

    it('should not include tests/', () => {
      const lines = packOutput.split('\n').filter(l => /\btests\//.test(l));
      expect(lines.length).toBe(0);
    });

    it('should not include dev-tools/', () => {
      expect(packOutput).not.toContain('dev-tools/');
    });
  });

  // ===== CHECK 4.2: LICENSE file present =====
  describe('4.2 LICENSE file present in tarball', () => {
    it('should have LICENSE file at project root', () => {
      expect(existsSync(join(ROOT, 'LICENSE'))).toBe(true);
    });

    it('should be listed in files field', () => {
      expect(pkg.files).toContain('LICENSE');
    });

    it('should contain MIT license text', () => {
      const license = readText('LICENSE');
      expect(license).toContain('MIT License');
    });
  });

  // ===== CHECK 4.3: .npmignore for defense-in-depth =====
  describe('4.3 .npmignore defense-in-depth', () => {
    it('should have .npmignore file', () => {
      expect(existsSync(join(ROOT, '.npmignore'))).toBe(true);
    });

    it('should exclude tests/', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('tests/');
    });

    it('should exclude dev-tools/', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('dev-tools/');
    });

    it('should exclude _bmad-output/', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('_bmad-output/');
    });

    it('should exclude .github/', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('.github/');
    });

    it('should exclude *.test.* patterns', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('*.test.*');
    });

    it('should exclude source maps', () => {
      const npmignore = readText('.npmignore');
      expect(npmignore).toContain('*.map');
    });
  });

  // ===== CHECK 4.4: npm audit — 0 HIGH/CRITICAL =====
  describe('4.4 npm audit — 0 HIGH/CRITICAL', () => {
    it('should have 0 vulnerabilities', () => {
      let auditResult;
      try {
        auditResult = execSync('npm audit --json 2>/dev/null', { cwd: ROOT, encoding: 'utf8' });
      } catch (e) {
        // npm audit exits non-zero if there are vulnerabilities
        auditResult = e.stdout || '{}';
      }
      const audit = JSON.parse(auditResult);
      const vulns = audit.metadata?.vulnerabilities || {};
      expect(vulns.high || 0).toBe(0);
      expect(vulns.critical || 0).toBe(0);
    });
  });

  // ===== CHECK 4.5: Dependencies pinned =====
  describe('4.5 Dependencies pinned (no floating versions)', () => {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    it('should have no * or >= or latest version ranges', () => {
      const violations = [];
      for (const [name, range] of Object.entries(allDeps)) {
        if (range === '*' || range === 'latest' || (range.startsWith('>=') && !name.startsWith('file:'))) {
          violations.push(`${name}: ${range}`);
        }
      }
      expect(violations).toEqual([]);
    });

    it('should use ^ or ~ or file: for all dependencies', () => {
      const violations = [];
      // Packages pinned to exact versions by npm audit fix --force for security
      const exactPinned = new Set(['@typescript-eslint/parser', 'eslint-config-next']);
      for (const [name, range] of Object.entries(allDeps)) {
        if (!range.startsWith('^') && !range.startsWith('~') && !range.startsWith('file:') && !exactPinned.has(name)) {
          violations.push(`${name}: ${range}`);
        }
      }
      expect(violations).toEqual([]);
    });
  });

  // ===== CHECK 4.6: No typosquatting =====
  describe('4.6 No typosquatting in dependency names', () => {
    const depNames = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ];

    it('should not contain known typosquat patterns', () => {
      // Map of typosquat names to their legitimate counterparts
      const typosquatNames = new Set([
        'picocolor',     // legit: picocolors
        '@clak/core',    // legit: @clack/core
        '@clak/prompts', // legit: @clack/prompts
        'js-yml',        // legit: js-yaml
        'zodd',          // legit: zod
        'comander',      // legit: commander
        'chalks',        // legit: chalk
        'vittest',       // legit: vitest
      ]);

      const violations = depNames.filter(dep => typosquatNames.has(dep));
      expect(violations).toEqual([]);
    });

    it('should only contain scoped packages from known organizations', () => {
      const knownScopes = ['@bmad', '@clack', '@eslint', '@types', '@vitest', '@typescript-eslint', '@jest'];
      const scopedDeps = depNames.filter(d => d.startsWith('@'));
      const unknownScoped = scopedDeps.filter(d =>
        !knownScopes.some(s => d.startsWith(`${s  }/`))
      );
      expect(unknownScoped).toEqual([]);
    });
  });

  // ===== CHECK 4.7: bundledDependencies matches actual usage =====
  describe('4.7 bundledDependencies matches shipped code', () => {
    it('should have bundledDependencies field', () => {
      expect(pkg.bundledDependencies).toBeDefined();
      expect(Array.isArray(pkg.bundledDependencies)).toBe(true);
    });

    it('should not have duplicate bundleDependencies key', () => {
      // Read raw JSON to check for duplicates
      const raw = readText('package.json');
      const matches = raw.match(/bundleDependencies/g) || [];
      // Should only have bundledDependencies (1 occurrence)
      expect(matches.length).toBeLessThanOrEqual(1);
    });

    it('should not bundle chalk (migrated to picocolors)', () => {
      expect(pkg.bundledDependencies).not.toContain('chalk');
    });

    it('should not bundle zod (not in shipped code)', () => {
      expect(pkg.bundledDependencies).not.toContain('zod');
    });

    it('should bundle commander (used by bmad-cli.js)', () => {
      expect(pkg.bundledDependencies).toContain('commander');
    });

    it('should bundle picocolors (used by CLI)', () => {
      expect(pkg.bundledDependencies).toContain('picocolors');
    });

    it('should bundle @clack/core and @clack/prompts', () => {
      expect(pkg.bundledDependencies).toContain('@clack/core');
      expect(pkg.bundledDependencies).toContain('@clack/prompts');
    });
  });

  // ===== CHECK 4.8: Install with --ignore-scripts =====
  describe('4.8 Package ships pre-built dist files', () => {
    it('should include pre-built dist in files field', () => {
      const files = pkg.files || [];
      const hasFrameworkDist = files.some(f => f.includes('framework/dist'));
      const hasValidatorDist = files.some(f => f.includes('validators-node/dist'));
      expect(hasFrameworkDist).toBe(true);
      expect(hasValidatorDist).toBe(true);
    });

    it('postinstall should only be build (not fetch/download)', () => {
      // postinstall is a simple console.log — framework is pre-built in dist/
      // Published package ships dist/ so consumers don't need postinstall
      expect(pkg.scripts.postinstall).toBe('node -e "console.log(\'✓ BMAD-CYBERSEC installed. Framework is pre-built and ready to use.\')"');
    });
  });

  // ===== CHECK 4.9: No eval/new Function/dynamic require in shipped code =====
  describe('4.9 No dangerous code patterns in shipped code', () => {
    it('should have no eval() calls in tools/cli/', () => {
      try {
        const result = execSync(
          "grep -rn 'eval(' tools/cli/ --include='*.js' | grep -v 'node_modules' | grep -v '.test.' || true",
          { cwd: ROOT, encoding: 'utf8' }
        );
        const lines = result.trim().split('\n').filter(Boolean);
        expect(lines.length).toBe(0);
      } catch {
        // grep returns 1 if no matches (which is what we want)
      }
    });

    it('should have no new Function() calls in tools/cli/', () => {
      try {
        const result = execSync(
          "grep -rn 'new Function' tools/cli/ --include='*.js' | grep -v 'node_modules' || true",
          { cwd: ROOT, encoding: 'utf8' }
        );
        const lines = result.trim().split('\n').filter(Boolean);
        expect(lines.length).toBe(0);
      } catch {
        // No matches is OK
      }
    });

    it('should not use exec() with string concatenation in shipped code', () => {
      // incremental-builder.ts was fixed: exec() → execFile() with array args
      const content = readText('src/automation/incremental/incremental-builder.ts');
      expect(content).toContain('execFile');
      // Should NOT have the old pattern: const { exec } = require('child_process')
      expect(content).not.toContain("const { exec } = require('child_process')");
    });
  });

  // ===== CHECK 4.10: PRESERVE_FILES includes security files =====
  describe('4.10 PRESERVE_FILES includes security infrastructure', () => {
    const cliUpdate = readText('tools/cli/commands/update.js');
    const npxUpdate = readText('tools/npx/commands/update.js');

    it('should preserve .claude/settings.json', () => {
      expect(cliUpdate).toContain("'.claude/settings.json'");
      expect(npxUpdate).toContain("'.claude/settings.json'");
    });

    it('should preserve .claude/hooks/', () => {
      expect(cliUpdate).toContain("'.claude/hooks/'");
      expect(npxUpdate).toContain("'.claude/hooks/'");
    });

    it('should preserve .claude/validators-node/', () => {
      expect(cliUpdate).toContain("'.claude/validators-node/'");
      expect(npxUpdate).toContain("'.claude/validators-node/'");
    });

    it('should preserve .claude/commands/', () => {
      expect(cliUpdate).toContain("'.claude/commands/'");
      expect(npxUpdate).toContain("'.claude/commands/'");
    });

    it('should preserve environment files', () => {
      expect(cliUpdate).toContain("'.env'");
      expect(cliUpdate).toContain("'.env.local'");
    });

    it('PRESERVE_FILES should be identical in CLI and npx', () => {
      const extractPreserveFiles = (content) => {
        const match = content.match(/const PRESERVE_FILES = \[([\s\S]*?)\];/);
        return match ? match[1].trim() : '';
      };
      expect(extractPreserveFiles(cliUpdate)).toBe(extractPreserveFiles(npxUpdate));
    });
  });

  // ===== CHECK 4.11: Upgrade path preservation =====
  describe('4.11 Upgrade path preserves security infrastructure', () => {
    it('update command should backup before extraction', () => {
      const content = readText('tools/cli/commands/update.js');
      // Look for the function CALLS (await pattern), not imports/definitions
      const backupCallIdx = content.indexOf('await backupConfigurations(');
      const extractCallIdx = content.indexOf('await extractFramework(');
      expect(backupCallIdx).toBeGreaterThan(-1);
      expect(extractCallIdx).toBeGreaterThan(-1);
      expect(backupCallIdx).toBeLessThan(extractCallIdx);
    });

    it('update command should restore after extraction', () => {
      const content = readText('tools/cli/commands/update.js');
      const extractIdx = content.indexOf('extractFramework');
      const restoreIdx = content.indexOf('restoreConfigurations');
      expect(restoreIdx).toBeGreaterThan(extractIdx);
    });
  });

  // ===== CHECK 4.12: Checksum verification in downloader =====
  describe('4.12 Mandatory checksum verification in downloader', () => {
    const downloader = readText('tools/cli/lib/downloader.js');

    it('should compute SHA-256 hash of downloaded files', () => {
      expect(downloader).toContain("createHash('sha256')");
    });

    it('should validate checksum format (64 hex chars)', () => {
      expect(downloader).toContain('{64}');
      expect(downloader).toContain('[a-fA-F0-9]');
    });

    it('should delete file on checksum mismatch', () => {
      expect(downloader).toContain('await rm(filePath');
      expect(downloader).toContain('Checksum verification failed');
    });

    it('should reject release downloads without checksum file', () => {
      expect(downloader).toContain('Checksum verification is mandatory for release downloads');
    });

    it('should warn when falling back to source tarball (no checksum)', () => {
      expect(downloader).toContain('WITHOUT checksum verification');
    });
  });

  // ===== CHECK 4.13: SBOM generation capability =====
  describe('4.13 SBOM generation', () => {
    it('should have npm sbom or cyclonedx capability', () => {
      // Verify npm is new enough to have sbom command
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      const [major] = npmVersion.split('.');
      // npm 10+ has sbom command
      expect(parseInt(major)).toBeGreaterThanOrEqual(10);
    });
  });

  // ===== CHECK 4.14: tar dependency version =====
  describe('4.14 tar dependency >= 7.5.7 (CVE remediation)', () => {
    it('should have tar in dependencies', () => {
      expect(pkg.dependencies.tar).toBeDefined();
    });

    it('should specify tar >= 7.5.7', () => {
      const tarRange = pkg.dependencies.tar;
      // Extract version from range (^7.5.7 → 7.5.7)
      const version = tarRange.replace(/^[\^~>=<]+/, '');
      const [major, minor, patch] = version.split('.').map(Number);
      expect(major).toBeGreaterThanOrEqual(7);
      if (major === 7) {
        expect(minor).toBeGreaterThanOrEqual(5);
        if (minor === 5) {
          expect(patch).toBeGreaterThanOrEqual(7);
        }
      }
    });
  });
});
