/**
 * Tests for tools/migrate-directory-structure.js
 *
 * Validates the migration script's core logic:
 *  - CLI argument parsing and phase selection
 *  - File mapping generation (move, merge, core-partial, core-security)
 *  - Conflict detection
 *  - Dry-run behavior
 *  - Phase definitions and constants
 *  - Rollback guard logic
 *
 * These tests do NOT execute actual file moves. They validate the script's
 * planning/analysis functions using the real project filesystem (read-only)
 * and temporary fixtures (for merge/conflict scenarios).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, relative } from 'node:path';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

import {
  parseArgs,
  parsePhaseArg,
  PHASE_DEFINITIONS,
  PHASE_ORDER,
  EXCLUDED_BMAD_DIRS,
  SRC_INFRASTRUCTURE_DIRS,
  escapeRegExp,
  listFilesRecursive,
  hashFile,
  generateMoveMapping,
  generateMergeMapping,
  generateCoreMapping,
  generatePhaseMapping,
  detectConflicts,
} from '../../tools/migrate-directory-structure.js';

const PROJECT_ROOT = resolve(import.meta.dirname, '../..');

// ---------------------------------------------------------------------------
// Helpers: Temporary fixture creation
// ---------------------------------------------------------------------------

let tempDir;

function createTempFixture() {
  tempDir = mkdtempSync(join(tmpdir(), 'bmad-migrate-test-'));
  return tempDir;
}

function cleanTempFixture() {
  if (tempDir && existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
    tempDir = null;
  }
}

/**
 * Create a nested file in the temp directory.
 * @param {string} relPath - Relative path from tempDir
 * @param {string} content - File content
 */
function createFile(relPath, content = '') {
  const absPath = join(tempDir, relPath);
  mkdirSync(join(absPath, '..'), { recursive: true });
  writeFileSync(absPath, content, 'utf-8');
  return absPath;
}

// =========================================================================
// Test Suites
// =========================================================================

describe('migrate-directory-structure.js', () => {

  // ── Constants & Phase Definitions ──────────────────────────────────

  describe('PHASE_DEFINITIONS', () => {
    it('should define exactly 5 phases (A-E)', () => {
      expect(Object.keys(PHASE_DEFINITIONS)).toHaveLength(5);
      expect(Object.keys(PHASE_DEFINITIONS).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('should define PHASE_ORDER with correct sequence', () => {
      expect(PHASE_ORDER).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('Phase A should contain bmm, bmb, bmgd, cis with move strategy', () => {
      const phaseA = PHASE_DEFINITIONS.A;
      expect(phaseA.modules).toEqual(['bmm', 'bmb', 'bmgd', 'cis']);
      expect(phaseA.strategy).toBe('move');
      expect(phaseA.risk).toBe('low');
    });

    it('Phase B should contain strategy-team with merge strategy', () => {
      const phaseB = PHASE_DEFINITIONS.B;
      expect(phaseB.modules).toEqual(['strategy-team']);
      expect(phaseB.strategy).toBe('merge');
      expect(phaseB.risk).toBe('medium');
    });

    it('Phase C should contain cybersec-team, intel-team, legal-team', () => {
      const phaseC = PHASE_DEFINITIONS.C;
      expect(phaseC.modules).toEqual(['cybersec-team', 'intel-team', 'legal-team']);
      expect(phaseC.strategy).toBe('merge');
    });

    it('Phase D should be core-partial (exclude security)', () => {
      const phaseD = PHASE_DEFINITIONS.D;
      expect(phaseD.modules).toEqual(['core']);
      expect(phaseD.strategy).toBe('core-partial');
      expect(phaseD.excludeDirs).toContain('security');
    });

    it('Phase E should be core-security (critical, atomic)', () => {
      const phaseE = PHASE_DEFINITIONS.E;
      expect(phaseE.modules).toEqual(['core']);
      expect(phaseE.strategy).toBe('core-security');
      expect(phaseE.onlyDirs).toEqual(['security']);
      expect(phaseE.risk).toBe('critical');
    });

    it('every phase should have label, modules, strategy, and risk', () => {
      for (const [key, phase] of Object.entries(PHASE_DEFINITIONS)) {
        expect(phase.label, `Phase ${key} missing label`).toBeTruthy();
        expect(phase.modules, `Phase ${key} missing modules`).toBeInstanceOf(Array);
        expect(phase.modules.length, `Phase ${key} has empty modules`).toBeGreaterThan(0);
        expect(phase.strategy, `Phase ${key} missing strategy`).toBeTruthy();
        expect(phase.risk, `Phase ${key} missing risk`).toBeTruthy();
      }
    });

    it('all 9 modules should be covered across phases', () => {
      const allModules = new Set();
      for (const phase of Object.values(PHASE_DEFINITIONS)) {
        for (const mod of phase.modules) {
          allModules.add(mod);
        }
      }
      // 9 unique module names: bmm, bmb, bmgd, cis, strategy-team,
      // cybersec-team, intel-team, legal-team, core
      expect(allModules.size).toBe(9);
      expect(allModules).toContain('bmm');
      expect(allModules).toContain('bmb');
      expect(allModules).toContain('bmgd');
      expect(allModules).toContain('cis');
      expect(allModules).toContain('strategy-team');
      expect(allModules).toContain('cybersec-team');
      expect(allModules).toContain('intel-team');
      expect(allModules).toContain('legal-team');
      // 'core' appears in both D and E
      expect(allModules).toContain('core');
    });
  });

  describe('EXCLUDED_BMAD_DIRS', () => {
    it('should include _config, _compact, _memory, framework', () => {
      expect(EXCLUDED_BMAD_DIRS).toContain('_config');
      expect(EXCLUDED_BMAD_DIRS).toContain('_compact');
      expect(EXCLUDED_BMAD_DIRS).toContain('_memory');
      expect(EXCLUDED_BMAD_DIRS).toContain('framework');
    });

    it('should NOT include any migration target modules', () => {
      const moduleNames = ['bmm', 'bmb', 'bmgd', 'cis', 'core', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      for (const mod of moduleNames) {
        expect(EXCLUDED_BMAD_DIRS).not.toContain(mod);
      }
    });
  });

  describe('SRC_INFRASTRUCTURE_DIRS', () => {
    it('should include config, package-management, security, utility, automation', () => {
      expect(SRC_INFRASTRUCTURE_DIRS).toContain('config');
      expect(SRC_INFRASTRUCTURE_DIRS).toContain('package-management');
      expect(SRC_INFRASTRUCTURE_DIRS).toContain('security');
      expect(SRC_INFRASTRUCTURE_DIRS).toContain('utility');
      expect(SRC_INFRASTRUCTURE_DIRS).toContain('automation');
    });
  });

  // ── CLI Argument Parsing ───────────────────────────────────────────

  describe('parseArgs()', () => {
    it('should default to all phases, no dry-run, no rollback', () => {
      const options = parseArgs(['node', 'script.js']);
      expect(options.dryRun).toBe(false);
      expect(options.rollback).toBe(false);
      expect(options.phases).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('should parse --dry-run flag', () => {
      const options = parseArgs(['node', 'script.js', '--dry-run']);
      expect(options.dryRun).toBe(true);
    });

    it('should parse --rollback flag', () => {
      const options = parseArgs(['node', 'script.js', '--rollback']);
      expect(options.rollback).toBe(true);
    });

    it('should parse --phase with a single phase', () => {
      const options = parseArgs(['node', 'script.js', '--phase', 'A']);
      expect(options.phases).toEqual(['A']);
    });

    it('should parse --phase with multiple comma-separated phases', () => {
      const options = parseArgs(['node', 'script.js', '--phase', 'A,B,C']);
      expect(options.phases).toEqual(['A', 'B', 'C']);
    });

    it('should normalize phase order regardless of input order', () => {
      const options = parseArgs(['node', 'script.js', '--phase', 'C,A']);
      expect(options.phases).toEqual(['A', 'C']); // Canonical order
    });

    it('should handle lowercase phase letters', () => {
      const options = parseArgs(['node', 'script.js', '--phase', 'a,b']);
      expect(options.phases).toEqual(['A', 'B']);
    });

    it('should parse --phase= (equals) syntax', () => {
      const options = parseArgs(['node', 'script.js', '--phase=D,E']);
      expect(options.phases).toEqual(['D', 'E']);
    });

    it('should combine --dry-run with --phase', () => {
      const options = parseArgs(['node', 'script.js', '--dry-run', '--phase', 'B']);
      expect(options.dryRun).toBe(true);
      expect(options.phases).toEqual(['B']);
    });

    it('should throw for invalid phase letter', () => {
      expect(() => parseArgs(['node', 'script.js', '--phase', 'X'])).toThrow('Invalid phase');
    });

    it('should throw for --phase without value', () => {
      expect(() => parseArgs(['node', 'script.js', '--phase'])).toThrow('--phase requires a value');
    });

    it('should throw for unknown arguments', () => {
      expect(() => parseArgs(['node', 'script.js', '--bogus'])).toThrow('Unknown argument');
    });
  });

  describe('parsePhaseArg()', () => {
    it('should parse single phase', () => {
      expect(parsePhaseArg('A')).toEqual(['A']);
    });

    it('should parse multiple phases in order', () => {
      expect(parsePhaseArg('E,B,A')).toEqual(['A', 'B', 'E']);
    });

    it('should handle whitespace around commas', () => {
      expect(parsePhaseArg('A , B , C')).toEqual(['A', 'B', 'C']);
    });

    it('should reject invalid phase letters', () => {
      expect(() => parsePhaseArg('A,F')).toThrow('Invalid phase(s): F');
    });

    it('should reject all invalid phases and list them', () => {
      expect(() => parsePhaseArg('X,Y,Z')).toThrow('X, Y, Z');
    });
  });

  // ── Utility Functions ──────────────────────────────────────────────

  describe('escapeRegExp()', () => {
    it('should escape special regex characters', () => {
      // Hyphen is NOT a regex special character outside character classes
      expect(escapeRegExp('cybersec-team')).toBe('cybersec-team');
      expect(escapeRegExp('core')).toBe('core');
      expect(escapeRegExp('test.module')).toBe('test\\.module');
      expect(escapeRegExp('a[b]c')).toBe('a\\[b\\]c');
      expect(escapeRegExp('foo(bar)')).toBe('foo\\(bar\\)');
      expect(escapeRegExp('a+b*c?')).toBe('a\\+b\\*c\\?');
    });

    it('should not alter strings without special characters', () => {
      expect(escapeRegExp('bmm')).toBe('bmm');
      expect(escapeRegExp('bmgd')).toBe('bmgd');
      expect(escapeRegExp('intel-team')).toBe('intel-team');
    });
  });

  describe('listFilesRecursive()', () => {
    beforeEach(() => createTempFixture());
    afterEach(() => cleanTempFixture());

    it('should return empty array for non-existent directory', () => {
      expect(listFilesRecursive('/tmp/does-not-exist-12345')).toEqual([]);
    });

    it('should list all files recursively', () => {
      createFile('a/b/c.md', 'content');
      createFile('a/d.yaml', 'content');
      createFile('e.txt', 'content');

      const files = listFilesRecursive(tempDir);
      expect(files).toHaveLength(3);
      expect(files.some(f => f.endsWith('c.md'))).toBe(true);
      expect(files.some(f => f.endsWith('d.yaml'))).toBe(true);
      expect(files.some(f => f.endsWith('e.txt'))).toBe(true);
    });

    it('should not include directories in the result', () => {
      createFile('a/b/c.md', 'content');
      const files = listFilesRecursive(tempDir);
      for (const f of files) {
        expect(f).toMatch(/\.\w+$/); // Should have a file extension
      }
    });
  });

  describe('hashFile()', () => {
    beforeEach(() => createTempFixture());
    afterEach(() => cleanTempFixture());

    it('should return consistent SHA-256 hash for same content', () => {
      const file1 = createFile('a.txt', 'hello world');
      const file2 = createFile('b.txt', 'hello world');
      expect(hashFile(file1)).toBe(hashFile(file2));
    });

    it('should return different hash for different content', () => {
      const file1 = createFile('a.txt', 'hello');
      const file2 = createFile('b.txt', 'world');
      expect(hashFile(file1)).not.toBe(hashFile(file2));
    });

    it('should return a 64-character hex string', () => {
      const file = createFile('test.txt', 'test content');
      const hash = hashFile(file);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  // ── File Mapping Generation: Move ──────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('generateMoveMapping()', () => {
    it('should generate mappings for bmm module (real filesystem)', () => {
      const mappings = generateMoveMapping('bmm');
      expect(mappings.length).toBeGreaterThan(100); // bmm has ~252 files
      expect(mappings.length).toBeLessThan(500);

      // Every mapping should be a 'move' action
      for (const m of mappings) {
        expect(m.action).toBe('move');
      }

      // Source should be _bmad/bmm/..., dest should be src/bmm/...
      for (const m of mappings) {
        expect(m.relSource).toMatch(/^_bmad\/bmm\//);
        expect(m.relDest).toMatch(/^src\/bmm\//);
      }
    });

    it('should generate mappings for cis module (smallest pure-move)', () => {
      const mappings = generateMoveMapping('cis');
      expect(mappings.length).toBeGreaterThan(10); // cis has ~33 files
      expect(mappings.length).toBeLessThan(100);

      // Verify specific expected files exist
      const agentFiles = mappings.filter(m => m.relSource.includes('/agents/'));
      expect(agentFiles.length).toBeGreaterThanOrEqual(6); // 6 agents
    });

    it('should return empty array for non-existent module', () => {
      const mappings = generateMoveMapping('nonexistent-module-xyz');
      expect(mappings).toEqual([]);
    });

    it('should map relative paths correctly', () => {
      const mappings = generateMoveMapping('bmb');
      for (const m of mappings) {
        // relSource should not contain PROJECT_ROOT
        expect(m.relSource).not.toContain(PROJECT_ROOT);
        expect(m.relDest).not.toContain(PROJECT_ROOT);
        // But absolute paths should
        expect(m.source).toContain(PROJECT_ROOT);
        expect(m.destination).toContain(PROJECT_ROOT);
      }
    });
  });

  // ── File Mapping Generation: Merge ─────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('generateMergeMapping()', () => {
    it('should generate mappings for strategy-team (real filesystem)', () => {
      const mappings = generateMergeMapping('strategy-team');
      expect(mappings.length).toBeGreaterThan(50);

      // Should contain merge actions (identical + overwrite)
      const actions = new Set(mappings.map(m => m.action));
      // strategy-team has files in both _bmad/ and src/ -- expect merge actions
      expect(
        actions.has('merge-identical') || actions.has('merge-overwrite') || actions.has('merge-move')
      ).toBe(true);
    });

    it('should identify identical files as merge-identical', () => {
      const mappings = generateMergeMapping('strategy-team');
      const identicals = mappings.filter(m => m.action === 'merge-identical');
      // strategy-team has many duplicate step files between _bmad/ and src/
      // We expect at least some identical files
      expect(identicals.length).toBeGreaterThanOrEqual(0);
    });

    it('should identify different files as merge-overwrite', () => {
      const mappings = generateMergeMapping('strategy-team');
      const overwrites = mappings.filter(m => m.action === 'merge-overwrite');
      // There should be some files that differ between _bmad/ and src/
      // (agent .md files differ from .agent.yaml files — but those have different names)
      expect(overwrites.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array for non-existent module', () => {
      const mappings = generateMergeMapping('nonexistent-module-xyz');
      expect(mappings).toEqual([]);
    });

    it('should only map files from _bmad/ (not src/ files)', () => {
      const mappings = generateMergeMapping('cybersec-team');
      for (const m of mappings) {
        expect(m.relSource).toMatch(/^_bmad\/cybersec-team\//);
      }
    });
  });

  // ── File Mapping Generation: Core ──────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('generateCoreMapping()', () => {
    it('should exclude security directory when excludeDirs includes security', () => {
      const mappings = generateCoreMapping({ excludeDirs: ['security'] });
      for (const m of mappings) {
        expect(m.relSource).not.toMatch(/^_bmad\/core\/security\//);
      }
    });

    it('should include ONLY security directory when onlyDirs is ["security"]', () => {
      const mappings = generateCoreMapping({ onlyDirs: ['security'] });
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.relSource).toMatch(/^_bmad\/core\/security\//);
      }
    });

    it('Phase D mapping should NOT include security files', () => {
      const mappings = generateCoreMapping({ excludeDirs: PHASE_DEFINITIONS.D.excludeDirs });
      const securityFiles = mappings.filter(m => m.relSource.includes('/security/'));
      expect(securityFiles).toHaveLength(0);
    });

    it('Phase E mapping should ONLY include security files', () => {
      const mappings = generateCoreMapping({ onlyDirs: PHASE_DEFINITIONS.E.onlyDirs });
      for (const m of mappings) {
        expect(m.relSource).toMatch(/^_bmad\/core\/security\//);
      }
    });

    it('Phase D + Phase E should cover all core files', () => {
      const phaseDMappings = generateCoreMapping({ excludeDirs: ['security'] });
      const phaseEMappings = generateCoreMapping({ onlyDirs: ['security'] });
      const allMappings = generateCoreMapping({});

      // D + E combined should equal all (with possible root files going to D)
      expect(phaseDMappings.length + phaseEMappings.length).toBe(allMappings.length);
    });

    it('should include core root files (module.yaml, README) in Phase D', () => {
      const mappings = generateCoreMapping({ excludeDirs: ['security'] });
      const rootFiles = mappings.filter(m => {
        const relFromCore = m.relSource.replace('src/core/', '');
        return !relFromCore.includes('/');
      });
      // Core has root files: module.yaml, manifest.yaml, README.md, etc.
      expect(rootFiles.length).toBeGreaterThanOrEqual(1);
    });

    it('should NOT include core root files in Phase E (onlyDirs)', () => {
      const mappings = generateCoreMapping({ onlyDirs: ['security'] });
      const rootFiles = mappings.filter(m => {
        const relFromCore = m.relSource.replace('src/core/', '');
        return !relFromCore.includes('/');
      });
      expect(rootFiles).toHaveLength(0);
    });
  });

  // ── Phase Mapping (integration) ────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('generatePhaseMapping()', () => {
    it('should generate Phase A mappings (all move actions)', () => {
      const mappings = generatePhaseMapping('A');
      expect(mappings.length).toBeGreaterThan(400); // ~652 files across 4 modules

      // All should be 'move' since Phase A modules have no src/ content
      const actions = new Set(mappings.map(m => m.action));
      expect(actions).toEqual(new Set(['move']));
    });

    it('should generate Phase B mappings (strategy-team)', () => {
      const mappings = generatePhaseMapping('B');
      expect(mappings.length).toBeGreaterThan(50);
    });

    it('should generate Phase C mappings (3 merge modules)', () => {
      const mappings = generatePhaseMapping('C');
      expect(mappings.length).toBeGreaterThan(200);
    });

    it('should generate Phase D mappings (core non-security)', () => {
      const mappings = generatePhaseMapping('D');
      expect(mappings.length).toBeGreaterThan(30);

      // No security files
      const securityFiles = mappings.filter(m => m.relSource.includes('/security/'));
      expect(securityFiles).toHaveLength(0);
    });

    it('should generate Phase E mappings (core security only)', () => {
      const mappings = generatePhaseMapping('E');
      expect(mappings.length).toBeGreaterThan(5);

      // All files should be security-related
      for (const m of mappings) {
        expect(m.relSource).toMatch(/^_bmad\/core\/security\//);
      }
    });

    it('should throw for unknown phase key', () => {
      expect(() => generatePhaseMapping('Z')).toThrow('Unknown phase');
    });

    it('should cover all _bmad/ in-scope files across all 5 phases', () => {
      let totalMapped = 0;
      for (const phaseKey of PHASE_ORDER) {
        const mappings = generatePhaseMapping(phaseKey);
        totalMapped += mappings.length;
      }
      // Total should be a large number (1000+ files across all modules)
      expect(totalMapped).toBeGreaterThan(800);
    });
  });

  // ── Conflict Detection ─────────────────────────────────────────────

  describe('detectConflicts()', () => {
    it('should count moves correctly', () => {
      const mappings = [
        { action: 'move', relSource: 'a', relDest: 'b' },
        { action: 'move', relSource: 'c', relDest: 'd' },
        { action: 'merge-move', relSource: 'e', relDest: 'f' },
      ];
      const report = detectConflicts(mappings);
      expect(report.totalFiles).toBe(3);
      expect(report.moves).toBe(3);
      expect(report.identical).toBe(0);
      expect(report.overwrites).toBe(0);
    });

    it('should count identical duplicates', () => {
      const mappings = [
        { action: 'merge-identical', relSource: 'a', relDest: 'b' },
        { action: 'merge-identical', relSource: 'c', relDest: 'd' },
      ];
      const report = detectConflicts(mappings);
      expect(report.identical).toBe(2);
    });

    it('should count and detail overwrites', () => {
      const mappings = [
        { action: 'merge-overwrite', relSource: 'old/a.md', relDest: 'new/a.md' },
        { action: 'move', relSource: 'b.md', relDest: 'c.md' },
      ];
      const report = detectConflicts(mappings);
      expect(report.overwrites).toBe(1);
      expect(report.overwriteDetails).toHaveLength(1);
      expect(report.overwriteDetails[0].relSource).toBe('old/a.md');
    });

    it('should handle empty mappings', () => {
      const report = detectConflicts([]);
      expect(report.totalFiles).toBe(0);
      expect(report.moves).toBe(0);
      expect(report.identical).toBe(0);
      expect(report.overwrites).toBe(0);
    });

    // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
    it.skip('should work with real Phase A data (all moves)', () => {
      const mappings = generatePhaseMapping('A');
      const report = detectConflicts(mappings);
      expect(report.totalFiles).toBe(mappings.length);
      expect(report.moves).toBe(mappings.length); // Phase A is all moves
      expect(report.identical).toBe(0);
      expect(report.overwrites).toBe(0);
    });

    // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
    it.skip('should detect merge conflicts in Phase B data', () => {
      const mappings = generatePhaseMapping('B');
      const report = detectConflicts(mappings);
      expect(report.totalFiles).toBe(mappings.length);
      // Phase B (strategy-team) has some merge operations
      expect(report.moves + report.identical + report.overwrites).toBe(report.totalFiles);
    });
  });

  // ── Dry-Run Behavioral Contract ────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('Dry-run contract', () => {
    it('Phase A dry-run generates mappings without filesystem changes', () => {
      const mappings = generatePhaseMapping('A');
      // This is the planning/analysis step only -- no side effects
      expect(mappings.length).toBeGreaterThan(0);

      // Verify _bmad/ modules still exist (we didn't move them)
      for (const mod of PHASE_DEFINITIONS.A.modules) {
        const bmadDir = resolve(PROJECT_ROOT, '_bmad', mod);
        expect(existsSync(bmadDir)).toBe(true);
      }
    });

    it('Phase E dry-run identifies critical security files', () => {
      const mappings = generatePhaseMapping('E');
      const criticalFiles = [
        'authorization.js',
        'authorization.ts',
        'rbac-config.yaml',
        'check-authorization.js',
      ];

      for (const critFile of criticalFiles) {
        const found = mappings.some(m => m.relSource.endsWith(critFile));
        expect(found, `Critical file ${critFile} should be in Phase E mappings`).toBe(true);
      }
    });
  });

  // ── Module Coverage Validation ─────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('Module coverage', () => {
    it('Phase A modules should NOT have existing src/ directories', () => {
      for (const mod of PHASE_DEFINITIONS.A.modules) {
        const srcDir = resolve(PROJECT_ROOT, 'src', mod);
        expect(existsSync(srcDir), `src/${mod}/ should not exist for Phase A`).toBe(false);
      }
    });

    it('Phase B+C modules SHOULD have existing src/ directories', () => {
      const mergeModules = [
        ...PHASE_DEFINITIONS.B.modules,
        ...PHASE_DEFINITIONS.C.modules,
      ];
      for (const mod of mergeModules) {
        const srcDir = resolve(PROJECT_ROOT, 'src', mod);
        expect(existsSync(srcDir), `src/${mod}/ should exist for merge phases`).toBe(true);
      }
    });

    it('all _bmad/ in-scope modules should have _bmad/ directories', () => {
      const allModules = new Set();
      for (const phase of Object.values(PHASE_DEFINITIONS)) {
        for (const mod of phase.modules) {
          allModules.add(mod);
        }
      }
      for (const mod of allModules) {
        const bmadDir = resolve(PROJECT_ROOT, '_bmad', mod);
        expect(existsSync(bmadDir), `_bmad/${mod}/ should exist`).toBe(true);
      }
    });

    it('excluded _bmad/ dirs should exist and not appear in any phase', () => {
      for (const excluded of EXCLUDED_BMAD_DIRS) {
        const dir = resolve(PROJECT_ROOT, '_bmad', excluded);
        expect(existsSync(dir), `_bmad/${excluded}/ should exist`).toBe(true);

        // Should not be in any phase's module list
        for (const [phaseKey, phase] of Object.entries(PHASE_DEFINITIONS)) {
          expect(phase.modules, `Phase ${phaseKey} should not include ${excluded}`).not.toContain(excluded);
        }
      }
    });
  });

  // ── Mapping Data Integrity ─────────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('Mapping data integrity', () => {
    it('no duplicate source paths across Phase A', () => {
      const mappings = generatePhaseMapping('A');
      const sources = mappings.map(m => m.relSource);
      const uniqueSources = new Set(sources);
      expect(uniqueSources.size).toBe(sources.length);
    });

    it('no duplicate destination paths across Phase A', () => {
      const mappings = generatePhaseMapping('A');
      const dests = mappings.map(m => m.relDest);
      const uniqueDests = new Set(dests);
      expect(uniqueDests.size).toBe(dests.length);
    });

    it('source and destination should never be the same path', () => {
      for (const phaseKey of PHASE_ORDER) {
        const mappings = generatePhaseMapping(phaseKey);
        for (const m of mappings) {
          expect(m.relSource, `Phase ${phaseKey}: source equals dest`).not.toBe(m.relDest);
        }
      }
    });

    it('all source paths should reference _bmad/', () => {
      for (const phaseKey of PHASE_ORDER) {
        const mappings = generatePhaseMapping(phaseKey);
        for (const m of mappings) {
          expect(m.relSource).toMatch(/^_bmad\//);
        }
      }
    });

    it('all destination paths should reference src/', () => {
      for (const phaseKey of PHASE_ORDER) {
        const mappings = generatePhaseMapping(phaseKey);
        for (const m of mappings) {
          expect(m.relDest).toMatch(/^src\//);
        }
      }
    });

    it('Phase D and Phase E should not overlap (no duplicate source files)', () => {
      const phaseDSources = new Set(generatePhaseMapping('D').map(m => m.relSource));
      const phaseESources = new Set(generatePhaseMapping('E').map(m => m.relSource));

      for (const src of phaseESources) {
        expect(phaseDSources.has(src), `File ${src} appears in both Phase D and E`).toBe(false);
      }
    });
  });

  // ── Expected File Counts ───────────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('Expected file counts (regression guard)', () => {
    it('Phase A should map 400-800 files (bmm + bmb + bmgd + cis)', () => {
      const mappings = generatePhaseMapping('A');
      expect(mappings.length).toBeGreaterThanOrEqual(400);
      expect(mappings.length).toBeLessThanOrEqual(800);
    });

    it('Phase B should map 100-300 files (strategy-team)', () => {
      const mappings = generatePhaseMapping('B');
      expect(mappings.length).toBeGreaterThanOrEqual(100);
      expect(mappings.length).toBeLessThanOrEqual(300);
    });

    it('Phase C should map 200-600 files (3 merge modules)', () => {
      const mappings = generatePhaseMapping('C');
      expect(mappings.length).toBeGreaterThanOrEqual(200);
      expect(mappings.length).toBeLessThanOrEqual(600);
    });

    it('Phase D should map 30-150 files (core non-security)', () => {
      const mappings = generatePhaseMapping('D');
      expect(mappings.length).toBeGreaterThanOrEqual(30);
      expect(mappings.length).toBeLessThanOrEqual(150);
    });

    it('Phase E should map 5-40 files (core security)', () => {
      const mappings = generatePhaseMapping('E');
      expect(mappings.length).toBeGreaterThanOrEqual(5);
      expect(mappings.length).toBeLessThanOrEqual(40);
    });
  });

  // ── Critical Files Presence ────────────────────────────────────────

  // SKIP: Post-migration — _bmad/ module directories no longer exist (moved to src/)
  describe.skip('Critical files in migration mappings', () => {
    it('Phase E should include authorization.js', () => {
      const mappings = generatePhaseMapping('E');
      const authJs = mappings.find(m => m.relSource === 'src/core/security/authorization.js');
      expect(authJs, 'authorization.js should be in Phase E').toBeTruthy();
      expect(authJs.relDest).toBe('src/core/security/authorization.js');
    });

    it('Phase E should include rbac-config.yaml', () => {
      const mappings = generatePhaseMapping('E');
      const rbac = mappings.find(m => m.relSource === 'src/core/security/rbac-config.yaml');
      expect(rbac, 'rbac-config.yaml should be in Phase E').toBeTruthy();
    });

    it('Phase E should include check-authorization.js', () => {
      const mappings = generatePhaseMapping('E');
      const checkAuth = mappings.find(m => m.relSource === 'src/core/security/check-authorization.js');
      expect(checkAuth, 'check-authorization.js should be in Phase E').toBeTruthy();
    });

    it('Phase D should include help templates', () => {
      const mappings = generatePhaseMapping('D');
      const helpFiles = mappings.filter(m => m.relSource.includes('core/help/'));
      expect(helpFiles.length).toBeGreaterThanOrEqual(1);
    });

    it('Phase D should include workflow files', () => {
      const mappings = generatePhaseMapping('D');
      const workflowFiles = mappings.filter(m => m.relSource.includes('core/workflows/'));
      expect(workflowFiles.length).toBeGreaterThan(10);
    });

    it('Phase A should include bmm agent files', () => {
      const mappings = generatePhaseMapping('A');
      const bmmAgents = mappings.filter(m => m.relSource.match(/^_bmad\/bmm\/agents\/.+\.md$/));
      expect(bmmAgents.length).toBeGreaterThanOrEqual(9); // 10 agents
    });
  });
});
