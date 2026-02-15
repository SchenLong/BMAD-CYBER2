/**
 * OWASP Coverage Script Tests
 * Tests for scripts/owasp-coverage.js
 *
 * Test IDs: OWASP-001..008
 * Minimum: 8 tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const COVERAGE_SCRIPT = path.join(PROJECT_ROOT, 'scripts/owasp-coverage.js');

// ============================================================================
// STORY: OWASP-00 — Coverage Tracking & Reporting Infrastructure
// Test IDs: OWASP-001..008
// ============================================================================

describe('OWASP-00: Coverage Tracking & Reporting', () => {
  describe('OWASP-001: Script executes without errors', () => {
    it('should run the coverage script successfully', () => {
      expect(fs.existsSync(COVERAGE_SCRIPT)).toBe(true);
      const result = execSync(`node ${COVERAGE_SCRIPT} --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      expect(result).toContain('OWASP Compliance Coverage Report');
    });

    it('should exit with appropriate code (0, 1, or 2)', () => {
      try {
        execSync(`node ${COVERAGE_SCRIPT} --minimum 0`, {
          cwd: PROJECT_ROOT,
          stdio: 'pipe'
        });
        // If no error, exit code was 0 or 1 (success or below threshold)
        expect(true).toBe(true);
      } catch (error) {
        // Error thrown means non-zero exit code
        expect(error.status).toBeGreaterThanOrEqual(0);
        expect(error.status).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('OWASP-002: Help flag displays usage information', () => {
    it('should show help when --help is passed', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --help`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });
      expect(result).toContain('Usage:');
      expect(result).toContain('Options:');
      expect(result).toContain('--help');
      expect(result).toContain('--verbose');
      expect(result).toContain('--json');
    });

    it('should show help when -h is passed', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} -h`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });
      expect(result).toContain('Usage:');
      expect(result).toContain('Options:');
    });
  });

  describe('OWASP-003: JSON output format is valid', () => {
    it('should produce valid JSON when --json is passed', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --json --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      // Parse as JSON - will throw if invalid
      const json = JSON.parse(result);
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('summary');
      expect(json).toHaveProperty('frameworks');
    });

    it('should include all frameworks in JSON output', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --json --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      const json = JSON.parse(result);
      expect(Object.keys(json.frameworks)).toContain('owasp_web_top_10');
      expect(Object.keys(json.frameworks)).toContain('owasp_api_security_top_10');
      expect(Object.keys(json.frameworks)).toContain('owasp_asvs');
    });
  });

  describe('OWASP-004: Coverage calculation is accurate', () => {
    it('should calculate percentage correctly', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --json --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      const json = JSON.parse(result);
      const summary = json.summary;

      // Verify coverage is between 0 and 100
      expect(summary.overallCoverage).toBeGreaterThanOrEqual(0);
      expect(summary.overallCoverage).toBeLessThanOrEqual(100);

      // Verify totals are consistent
      expect(summary.totalImplemented).toBeGreaterThanOrEqual(0);
      expect(summary.totalControls).toBeGreaterThan(0);
    });

    it('should have consistent implemented/total counts', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --json --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      const json = JSON.parse(result);

      for (const [key, framework] of Object.entries(json.frameworks)) {
        // ASVS has 47 V* controls (not just 41), other frameworks use framework.total
        const expectedTotal = framework.short === 'ASVS' ? 47 : framework.total;
        expect(framework.implemented).toBeLessThanOrEqual(expectedTotal);
        expect(framework.coverage).toBe((framework.implemented / expectedTotal) * 100);
      }
    });
  });

  describe('OWASP-005: Baseline file is created', () => {
    const baselinePath = path.join(PROJECT_ROOT, 'coverage/owasp-baseline.json');

    afterEach(() => {
      // Clean up if test created the file
      if (fs.existsSync(baselinePath)) {
        const backup = path.join(PROJECT_ROOT, 'coverage/owasp-baseline.test-backup.json');
        if (fs.existsSync(backup)) {
          fs.copyFileSync(backup, baselinePath);
        }
      }
    });

    it('should create baseline file on first run', () => {
      // Backup existing baseline if present
      if (fs.existsSync(baselinePath)) {
        fs.copyFileSync(baselinePath, `${baselinePath}.test-backup.json`);
        fs.unlinkSync(baselinePath);
      }

      execSync(`node ${COVERAGE_SCRIPT} --minimum 0`, {
        cwd: PROJECT_ROOT,
        stdio: 'pipe'
      });

      expect(fs.existsSync(baselinePath)).toBe(true);

      // Restore backup
      if (fs.existsSync(`${baselinePath}.test-backup.json`)) {
        fs.copyFileSync(`${baselinePath}.test-backup.json`, baselinePath);
        fs.unlinkSync(`${baselinePath}.test-backup.json`);
      }
    });

    it('should contain valid JSON in baseline file', () => {
      expect(fs.existsSync(baselinePath)).toBe(true);

      const content = fs.readFileSync(baselinePath, 'utf-8');
      try {
        const baseline = JSON.parse(content);
        expect(baseline).toHaveProperty('timestamp');
        expect(baseline).toHaveProperty('frameworks');
      } catch (error) {
        // Show more context about where JSON parsing failed
        const errorPos = (error as Error).message.match(/position (\d+)/);
        if (errorPos) {
          const pos = parseInt(errorPos[1], 10);
          const context = content.substring(Math.max(0, pos - 50), pos + 50);
          throw new Error(`Invalid JSON at position ${pos}: ...${context}...`);
        }
        throw error;
      }
    });
  });

  describe('OWASP-006: Verbose mode includes test IDs', () => {
    it('should show test IDs in verbose mode', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --verbose --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      // Should include some test IDs
      expect(result).toMatch(/A\d{2}-\d{3}/);
    });

    it('should show category breakdown in verbose mode', () => {
      const result = execSync(`node ${COVERAGE_SCRIPT} --verbose --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      expect(result).toContain('Category Breakdown');
    });
  });

  describe('OWASP-007: Minimum threshold can be configured', () => {
    it('should accept custom minimum threshold', () => {
      // With very low threshold, should pass
      const result = execSync(`node ${COVERAGE_SCRIPT} --minimum 0`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      expect(result).toContain('[PASS]');
    });

    it('should fail when coverage is below minimum', () => {
      // With very high threshold, should fail
      try {
        execSync(`node ${COVERAGE_SCRIPT} --minimum 99`, {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        // If we get here, test failed (should have thrown)
        expect(true).toBe(false);
      } catch (error) {
        // Error is expected - coverage is below 99%
        expect(error.status).toBe(1);
      }
    });
  });

  describe('OWASP-008: Controls YAML is read correctly', () => {
    const controlsPath = path.join(PROJECT_ROOT, 'Docs/04-operations/security/owasp-controls.yaml');

    it('should read controls from YAML file', () => {
      expect(fs.existsSync(controlsPath)).toBe(true);

      const content = fs.readFileSync(controlsPath, 'utf-8');
      expect(content).toContain('owasp_web_top_10:');
      expect(content).toContain('owasp_api_security_top_10:');
      expect(content).toContain('owasp_asvs:');
    });

    it('should contain control_id definitions', () => {
      const content = fs.readFileSync(controlsPath, 'utf-8');
      expect(content).toContain('control_id:');
    });
  });
});
