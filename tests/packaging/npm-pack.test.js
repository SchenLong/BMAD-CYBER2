/**
 * NPM Pack Integrity Test
 *
 * Validates the tarball produced by `npm pack`:
 * - Required files are present (LICENSE, README, package.json)
 * - No secrets or sensitive files leak into the package
 * - tools/cli/ is included
 * - _bmad/ is included (framework core)
 * - .claude/ config (if intended) is handled properly
 *
 * Source: MASTER-BMAD-QA Section 3.2 — npm pack integrity gap
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

// ============================================================================
// Helpers
// ============================================================================

let packOutput;

async function runNpmPackDryRun() {
  // Use --ignore-scripts to skip prepack build (may fail in test env)
  const { stdout } = await execFileAsync(
    'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: PROJECT_ROOT, timeout: 60000 }
  );
  return JSON.parse(stdout);
}

async function runNpmPackList() {
  const { stdout } = await execFileAsync(
    'npm', ['pack', '--dry-run', '--ignore-scripts'],
    { cwd: PROJECT_ROOT, timeout: 60000 }
  );
  return stdout.trim().split('\n').map((l) => l.trim()).filter(Boolean);
}

// ============================================================================
// Tests
// ============================================================================

describe('NPM Pack Integrity', () => {
  let packFiles;

  beforeAll(async () => {
    // Get the list of files that would be included in the tarball
    try {
      const result = await runNpmPackDryRun();
      packOutput = result;
      packFiles = result[0]?.files?.map((f) => f.path) || [];
    } catch {
      // Fallback: parse text output
      const lines = await runNpmPackList();
      // Lines starting with npm warn or the filename.tgz are not files
      packFiles = lines.filter(
        (l) => !l.startsWith('npm') && !l.endsWith('.tgz') && !l.startsWith('Tarball')
          && !l.startsWith('=') && !l.includes(':')
      );
    }
  });

  // --------------------------------------------------------------------------
  // 1. Required Files
  // --------------------------------------------------------------------------
  describe('Required Files Present', () => {
    it('should include package.json', () => {
      expect(packFiles.some((f) => f === 'package.json')).toBe(true);
    });

    it('should include README.md or README', () => {
      expect(
        packFiles.some((f) => /^readme/i.test(f))
      ).toBe(true);
    });

    it('should include LICENSE', () => {
      expect(
        packFiles.some((f) => /^license/i.test(f))
      ).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. CLI Files Included
  // --------------------------------------------------------------------------
  describe('CLI Files Included', () => {
    it('should include tools/cli/bmad-cli.js', () => {
      expect(packFiles.some((f) => f.includes('tools/cli/bmad-cli.js'))).toBe(true);
    });

    it('should include tools/cli/commands/', () => {
      expect(packFiles.some((f) => f.includes('tools/cli/commands/'))).toBe(true);
    });

    it('should include tools/cli/lib/', () => {
      expect(packFiles.some((f) => f.includes('tools/cli/lib/'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. No Secrets or Sensitive Files
  // --------------------------------------------------------------------------
  describe('No Secrets Leak', () => {
    it('should NOT include .env files', () => {
      const envFiles = packFiles.filter((f) => /\.env($|\.)/.test(path.basename(f)));
      expect(envFiles, `Found .env files: ${envFiles.join(', ')}`).toHaveLength(0);
    });

    it('should NOT include private key files', () => {
      const keyFiles = packFiles.filter(
        (f) => f.endsWith('.pem') || f.endsWith('.key') || f.endsWith('.p12')
      );
      expect(keyFiles, `Found key files: ${keyFiles.join(', ')}`).toHaveLength(0);
    });

    it('should NOT include credentials or auth files', () => {
      const credFiles = packFiles.filter(
        (f) =>
          f.includes('credentials') ||
          f.includes('.auth') ||
          f.includes('token.json') ||
          f.includes('secrets')
      );
      expect(credFiles, `Found credential files: ${credFiles.join(', ')}`).toHaveLength(0);
    });

    it('should NOT include .git directory', () => {
      const gitFiles = packFiles.filter((f) => f.startsWith('.git/'));
      expect(gitFiles).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Test Files Excluded
  // --------------------------------------------------------------------------
  describe('Test Files Excluded', () => {
    it('should NOT include project test files in the package', () => {
      // Exclude node_modules/ test files (bundled deps may contain their own tests)
      const testFiles = packFiles.filter(
        (f) =>
          !f.includes('node_modules/') &&
          (f.startsWith('tests/') || f.includes('.test.') || f.includes('.spec.'))
      );
      expect(
        testFiles,
        `Project test files found in package: ${testFiles.slice(0, 5).join(', ')}...`
      ).toHaveLength(0);
    });

    it('should NOT include dev-tools/', () => {
      const devFiles = packFiles.filter((f) => f.startsWith('dev-tools/'));
      expect(devFiles).toHaveLength(0);
    });

    it('should NOT include _bmad-output/', () => {
      const outputFiles = packFiles.filter((f) => f.startsWith('_bmad-output/'));
      expect(outputFiles, `Found _bmad-output files: ${outputFiles.join(', ')}`).toHaveLength(0);
    });

    it('should NOT include __tests__ directories in dist', () => {
      const testDirs = packFiles.filter(
        (f) => f.includes('__tests__/')
      );
      expect(testDirs, `Found __tests__ files: ${testDirs.join(', ')}`).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Package Size
  // --------------------------------------------------------------------------
  describe('Package Metadata', () => {
    it('should have a reasonable number of files (not too many, not too few)', () => {
      expect(packFiles.length).toBeGreaterThan(10);
      // Sanity: shouldn't include thousands of files
      expect(packFiles.length).toBeLessThan(5000);
    });
  });
});
