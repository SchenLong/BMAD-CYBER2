/**
 * TPI-19: Image File Validation & Heuristics
 * ============================================
 * Tests for magic number validation, extension/content mismatch,
 * polyglot detection, and file size bounds checking.
 *
 * Test count target: ≥13 (TEA-revised from 10)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const {
  detectMagicFormat,
  detectExecutableSignature,
  validateMagicNumber,
  validateFileSize,
  scanMediaFile,
} = await import(
  '../../.claude/validators-node/src/ai-safety/media-validator.ts'
);

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tpi19-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('TPI-19: Image File Validation & Heuristics', () => {
  // =============================================================================
  // 1. MAGIC NUMBER DETECTION (AC1)
  // =============================================================================

  describe('Magic number detection (AC1)', () => {
    it('detects JPEG magic number', () => {
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      expect(detectMagicFormat(buffer)).toBe('JPEG');
    });

    it('detects PNG magic number', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(detectMagicFormat(buffer)).toBe('PNG');
    });

    it('detects GIF magic number', () => {
      const buffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      expect(detectMagicFormat(buffer)).toBe('GIF');
    });

    it('detects BMP magic number', () => {
      const buffer = Buffer.from([0x42, 0x4D, 0x00, 0x00]);
      expect(detectMagicFormat(buffer)).toBe('BMP');
    });

    it('detects TIFF little-endian magic number', () => {
      const buffer = Buffer.from([0x49, 0x49, 0x2A, 0x00]);
      expect(detectMagicFormat(buffer)).toBe('TIFF_LE');
    });

    it('detects TIFF big-endian magic number', () => {
      const buffer = Buffer.from([0x4D, 0x4D, 0x00, 0x2A]);
      expect(detectMagicFormat(buffer)).toBe('TIFF_BE');
    });

    it('detects WebP magic number', () => {
      const buffer = Buffer.alloc(12);
      buffer.write('RIFF', 0, 'ascii');
      buffer.writeUInt32LE(100, 4); // File size
      buffer.write('WEBP', 8, 'ascii');
      expect(detectMagicFormat(buffer)).toBe('WebP');
    });

    it('returns null for unknown format', () => {
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
      expect(detectMagicFormat(buffer)).toBeNull();
    });
  });

  // =============================================================================
  // 2. EXTENSION/CONTENT MISMATCH (AC2)
  // =============================================================================

  describe('Extension/content mismatch detection (AC2)', () => {
    it('detects .jpg extension with PNG magic', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const findings = validateMagicNumber('/path/to/fake.jpg', pngBuffer);
      expect(findings.length).toBe(1);
      expect(findings[0].pattern_name).toBe('extension_content_mismatch');
      expect(findings[0].severity).toBe('WARNING');
    });

    it('allows .jpg extension with JPEG magic', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const findings = validateMagicNumber('/path/to/real.jpg', jpegBuffer);
      expect(findings.length).toBe(0);
    });

    it('allows .png extension with PNG magic', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const findings = validateMagicNumber('/path/to/real.png', pngBuffer);
      expect(findings.length).toBe(0);
    });
  });

  // =============================================================================
  // 3. POLYGLOT DETECTION (AC3)
  // =============================================================================

  describe('Polyglot file detection (AC3)', () => {
    it('detects ELF executable with .png extension as CRITICAL', () => {
      const elfBuffer = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x00, 0x00]);
      const findings = validateMagicNumber('/path/to/malicious.png', elfBuffer);
      expect(findings.length).toBe(1);
      expect(findings[0].pattern_name).toBe('polyglot_executable');
      expect(findings[0].severity).toBe('CRITICAL');
    });

    it('detects PE executable with .jpg extension as CRITICAL', () => {
      const peBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00]);
      const findings = validateMagicNumber('/path/to/malicious.jpg', peBuffer);
      expect(findings.length).toBe(1);
      expect(findings[0].pattern_name).toBe('polyglot_executable');
      expect(findings[0].severity).toBe('CRITICAL');
    });

    it('detects Mach-O binary with .gif extension as CRITICAL', () => {
      const machoBuffer = Buffer.from([0xFE, 0xED, 0xFA, 0xCE]);
      const findings = validateMagicNumber('/path/to/malicious.gif', machoBuffer);
      expect(findings.length).toBe(1);
      expect(findings[0].pattern_name).toBe('polyglot_executable');
      expect(findings[0].severity).toBe('CRITICAL');
    });

    it('detects executable signature function directly', () => {
      const elfBuffer = Buffer.from([0x7F, 0x45, 0x4C, 0x46]);
      expect(detectExecutableSignature(elfBuffer)).toBe('ELF');

      const peBuffer = Buffer.from([0x4D, 0x5A]);
      expect(detectExecutableSignature(peBuffer)).toBe('PE');
    });
  });

  // =============================================================================
  // 4. FILE SIZE VALIDATION (AC4)
  // =============================================================================

  describe('File size validation (AC4)', () => {
    it('warns on very small file (<100 bytes)', () => {
      const filePath = path.join(tmpDir, 'tiny.jpg');
      fs.writeFileSync(filePath, Buffer.alloc(50));
      const findings = validateFileSize(filePath);
      expect(findings.length).toBe(1);
      expect(findings[0].pattern_name).toBe('suspiciously_small_file');
      expect(findings[0].severity).toBe('WARNING');
    });

    it('allows normal-sized file', () => {
      const filePath = path.join(tmpDir, 'normal.jpg');
      fs.writeFileSync(filePath, Buffer.alloc(5000));
      const findings = validateFileSize(filePath);
      expect(findings.length).toBe(0);
    });

    it('allows file at exactly 100 bytes (boundary)', () => {
      const filePath = path.join(tmpDir, 'boundary.jpg');
      fs.writeFileSync(filePath, Buffer.alloc(100));
      const findings = validateFileSize(filePath);
      // Exactly 100 bytes — not <100, so no warning
      expect(findings.length).toBe(0);
    });
  });

  // =============================================================================
  // 5. INTEGRATED VALIDATION
  // =============================================================================

  describe('Integrated image validation via scanMediaFile', () => {
    it('returns CRITICAL for polyglot file', () => {
      const filePath = path.join(tmpDir, 'polyglot.png');
      // Write ELF header with .png extension
      fs.writeFileSync(filePath, Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x00, 0x00, 0x00, 0x00]));
      const result = scanMediaFile(filePath);
      expect(result.exitCode).toBe(2); // HARD_BLOCK
      expect(result.severity).toBe('CRITICAL');
    });

    it('skips validation for non-image files', () => {
      const result = scanMediaFile('/path/to/script.js');
      expect(result.exitCode).toBe(0);
      expect(result.findings.length).toBe(0);
    });
  });
});
