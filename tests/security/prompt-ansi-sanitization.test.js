/**
 * SA-05: ANSI Escape Sanitization Tests
 * =======================================
 * Tests that stripAnsi() removes ANSI escape sequences from user input,
 * preventing terminal escape injection attacks.
 *
 * Risk: R-022 (CVSS 2.8)
 * Remediation: REM-011
 */

import { describe, expect, it } from 'vitest';
import { stripAnsi } from '../../src/utility/cli/prompts.js';

describe('ANSI Escape Sanitization (SA-05)', () => {

  describe('SGR sequences (Select Graphic Rendition)', () => {
    it('should strip basic color codes', () => {
      expect(stripAnsi('\x1B[31mRed text\x1B[0m')).toBe('Red text');
    });

    it('should strip bold/underline codes', () => {
      expect(stripAnsi('\x1B[1mBold\x1B[22m \x1B[4mUnderline\x1B[24m')).toBe('Bold Underline');
    });

    it('should strip 256-color codes', () => {
      expect(stripAnsi('\x1B[38;5;196mBright red\x1B[0m')).toBe('Bright red');
    });

    it('should strip RGB color codes', () => {
      expect(stripAnsi('\x1B[38;2;255;0;0mRGB red\x1B[0m')).toBe('RGB red');
    });

    it('should strip background colors', () => {
      expect(stripAnsi('\x1B[44mBlue BG\x1B[0m')).toBe('Blue BG');
    });

    it('should strip reset code', () => {
      expect(stripAnsi('\x1B[0m')).toBe('');
    });
  });

  describe('CSI sequences (Control Sequence Introducer)', () => {
    it('should strip cursor movement sequences', () => {
      expect(stripAnsi('\x1B[5ACursor up 5')).toBe('Cursor up 5');
      expect(stripAnsi('\x1B[3BCursor down 3')).toBe('Cursor down 3');
      expect(stripAnsi('\x1B[10CCursor forward')).toBe('Cursor forward');
      expect(stripAnsi('\x1B[2DCursor back')).toBe('Cursor back');
    });

    it('should strip screen clear sequences', () => {
      expect(stripAnsi('\x1B[2JCleared')).toBe('Cleared');
      expect(stripAnsi('\x1B[KLine cleared')).toBe('Line cleared');
    });

    it('should strip cursor position sequences', () => {
      expect(stripAnsi('\x1B[10;20HRepositioned')).toBe('Repositioned');
    });

    it('should strip scroll sequences', () => {
      expect(stripAnsi('\x1B[5SScrolled up')).toBe('Scrolled up');
    });
  });

  describe('OSC sequences (Operating System Command)', () => {
    it('should strip terminal title injection (BEL terminated)', () => {
      expect(stripAnsi('\x1B]0;Malicious Title\x07Normal text')).toBe('Normal text');
    });

    it('should strip terminal title injection (ST terminated)', () => {
      expect(stripAnsi('\x1B]0;Malicious Title\x1B\\Normal text')).toBe('Normal text');
    });

    it('should strip hyperlink sequences', () => {
      expect(stripAnsi('\x1B]8;;https://evil.com\x07Click me\x1B]8;;\x07')).toBe('Click me');
    });
  });

  describe('Character set designations', () => {
    it('should strip character set designation sequences', () => {
      expect(stripAnsi('\x1B(BNormal')).toBe('Normal');
      expect(stripAnsi('\x1B(0Line drawing\x1B(B')).toBe('Line drawing');
    });
  });

  describe('Normal text preservation', () => {
    it('should pass through normal text unchanged', () => {
      const text = 'Hello, World! This is normal text.';
      expect(stripAnsi(text)).toBe(text);
    });

    it('should preserve Unicode characters', () => {
      const text = 'Hello \u{1F600} World \u00E9\u00E8\u00EA';
      expect(stripAnsi(text)).toBe(text);
    });

    it('should preserve newlines and tabs', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      expect(stripAnsi(text)).toBe(text);
    });

    it('should handle empty string', () => {
      expect(stripAnsi('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(stripAnsi(42)).toBe(42);
      expect(stripAnsi(null)).toBe(null);
      expect(stripAnsi(undefined)).toBe(undefined);
      expect(stripAnsi(true)).toBe(true);
    });
  });

  describe('Attack scenarios', () => {
    it('should prevent terminal title injection attack', () => {
      // Attacker tries to change terminal title to mislead user
      const malicious = '\x1B]0;SECURE BANK LOGIN\x07Enter password: ';
      const result = stripAnsi(malicious);
      expect(result).not.toContain('\x1B');
      expect(result).toBe('Enter password: ');
    });

    it('should prevent cursor repositioning attack', () => {
      // Attacker tries to overwrite displayed text
      const malicious = 'Safe message\x1B[2K\x1B[1GEvil overwrite';
      const result = stripAnsi(malicious);
      expect(result).not.toContain('\x1B');
      expect(result).toBe('Safe messageEvil overwrite');
    });

    it('should prevent screen clearing attack', () => {
      const malicious = '\x1B[2J\x1B[HFake login prompt';
      const result = stripAnsi(malicious);
      expect(result).not.toContain('\x1B');
      expect(result).toBe('Fake login prompt');
    });

    it('should handle multiple escape sequences in one string', () => {
      const malicious = '\x1B[31m\x1B[1m\x1B]0;EVIL\x07\x1B[2JDanger\x1B[0m';
      const result = stripAnsi(malicious);
      expect(result).not.toContain('\x1B');
      expect(result).toBe('Danger');
    });

    it('should handle escape sequences with no visible text', () => {
      const malicious = '\x1B[31m\x1B[0m\x1B[2J\x1B[H';
      const result = stripAnsi(malicious);
      expect(result).toBe('');
    });
  });

  describe('Integration with prompt functions', () => {
    it('should be exported for use in prompt wrappers', () => {
      expect(typeof stripAnsi).toBe('function');
    });

    it('should handle typical user input patterns', () => {
      // Normal input should pass through
      expect(stripAnsi('my-project-name')).toBe('my-project-name');
      expect(stripAnsi('user@host')).toBe('user@host');
      expect(stripAnsi('path/to/file.js')).toBe('path/to/file.js');
    });
  });
});
