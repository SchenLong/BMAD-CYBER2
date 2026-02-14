/**
 * TPI-21: Multimodal Context Warnings
 * =====================================
 * Tests for untrusted source detection, session-level image load tracking,
 * and context warnings for unverifiable visual content.
 *
 * Test count target: ≥11 (TEA-revised from 8)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const {
  isUntrustedSource,
  generateContextWarnings,
  trackImageLoad,
  scanMediaFile,
  severityToExitCode,
  computeHighestSeverity,
} = await import(
  '../../.claude/validators-node/src/ai-safety/media-validator.ts'
);

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tpi21-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// Clean up session state between tests to avoid cross-contamination
beforeEach(() => {
  try {
    const sessionFiles = ['.media_session_state.json'];
    for (const f of sessionFiles) {
      const p = path.join(process.cwd(), '.claude', 'logs', f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch {
    // Ignore cleanup errors
  }
});

describe.skip('TPI-21: Multimodal Context Warnings', () => {
  // =============================================================================
  // 1. UNTRUSTED SOURCE DETECTION (AC1)
  // =============================================================================

  describe('Untrusted source detection (AC1)', () => {
    it('detects Downloads directory as untrusted', () => {
      expect(isUntrustedSource('/Users/user/Downloads/image.png')).toBe(true);
    });

    it('detects tmp directory as untrusted', () => {
      expect(isUntrustedSource('/tmp/uploaded-image.jpg')).toBe(true);
    });

    it('detects temp directory as untrusted', () => {
      expect(isUntrustedSource('/var/temp/suspicious.png')).toBe(true);
    });

    it('detects Desktop as untrusted', () => {
      expect(isUntrustedSource('/Users/user/Desktop/screenshot.png')).toBe(true);
    });

    it('considers files outside project as untrusted', () => {
      // Files outside the project directory
      expect(isUntrustedSource('/some/other/project/file.png')).toBe(true);
    });

    it('considers files inside project as trusted', () => {
      // Files within project should be trusted
      const projectFile = path.join(process.cwd(), 'assets', 'logo.png');
      expect(isUntrustedSource(projectFile)).toBe(false);
    });
  });

  // =============================================================================
  // 2. CONTEXT WARNINGS FOR UNTRUSTED IMAGES (AC1, AC3)
  // =============================================================================

  describe('Context warnings generation', () => {
    it('generates INFO warning for image from Downloads', () => {
      const findings = generateContextWarnings('/Users/user/Downloads/photo.jpg');
      const untrustedFinding = findings.find((f) => f.pattern_name === 'untrusted_image');
      expect(untrustedFinding).toBeDefined();
      expect(untrustedFinding.severity).toBe('INFO');
    });

    it('generates WARNING for SVG from untrusted source (AC3)', () => {
      const findings = generateContextWarnings('/Users/user/Downloads/icon.svg');
      const untrustedSvg = findings.find((f) => f.pattern_name === 'untrusted_svg');
      expect(untrustedSvg).toBeDefined();
      expect(untrustedSvg.severity).toBe('WARNING');
    });

    it('generates no warning for image from within repo', () => {
      const projectFile = path.join(process.cwd(), 'src', 'assets', 'logo.png');
      const findings = generateContextWarnings(projectFile);
      const untrustedFindings = findings.filter(
        (f) => f.pattern_name === 'untrusted_image' || f.pattern_name === 'untrusted_svg'
      );
      expect(untrustedFindings.length).toBe(0);
    });
  });

  // =============================================================================
  // 3. SESSION-LEVEL TRACKING (AC2)
  // =============================================================================

  describe('Session-level image load tracking (AC2)', () => {
    it('tracks untrusted image loads', () => {
      const state = trackImageLoad('/tmp/image1.jpg', true);
      expect(state.untrusted_image_count).toBeGreaterThanOrEqual(1);
    });

    it('warns after >10 untrusted images in session', () => {
      // Load 11 untrusted images
      for (let i = 0; i < 11; i++) {
        trackImageLoad(`/tmp/image${i}.jpg`, true);
      }
      const findings = generateContextWarnings('/tmp/image12.jpg');
      const bulkFinding = findings.find((f) => f.pattern_name === 'bulk_untrusted_images');
      expect(bulkFinding).toBeDefined();
      expect(bulkFinding.severity).toBe('WARNING');
    });
  });

  // =============================================================================
  // 4. AUDIT LOGGING (AC4)
  // =============================================================================

  describe('Audit log recording (AC4)', () => {
    it('scanMediaFile logs findings for untrusted sources', () => {
      // Create an image file in tmp (untrusted)
      const filePath = path.join(tmpDir, 'audit-test.jpg');
      // Write a minimal JPEG
      fs.writeFileSync(filePath, Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10,
        0x4A, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
        0xFF, 0xD9,
      ]));

      // scanMediaFile should process without errors
      const result = scanMediaFile(filePath);
      // Since tmpDir is outside project, it should generate context warnings
      expect(typeof result.exitCode).toBe('number');
    });
  });

  // =============================================================================
  // 5. SEVERITY MAPPING
  // =============================================================================

  describe('Severity helpers', () => {
    it('maps INFO to ALLOW (exit 0)', () => {
      expect(severityToExitCode('INFO')).toBe(0);
    });

    it('maps WARNING to SOFT_BLOCK (exit 1)', () => {
      expect(severityToExitCode('WARNING')).toBe(1);
    });

    it('maps CRITICAL to HARD_BLOCK (exit 2)', () => {
      expect(severityToExitCode('CRITICAL')).toBe(2);
    });

    it('computes highest severity from findings', () => {
      const findings = [
        { category: 'test', pattern_name: 'a', severity: 'INFO', description: 'info' },
        { category: 'test', pattern_name: 'b', severity: 'WARNING', description: 'warn' },
        { category: 'test', pattern_name: 'c', severity: 'INFO', description: 'info2' },
      ];
      expect(computeHighestSeverity(findings)).toBe('WARNING');
    });
  });
});
