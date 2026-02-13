/**
 * TPI-PRE-1: Text Normalizer Unit Tests
 * =======================================
 * Verifies the extracted shared text normalizer behaves identically
 * to the original inline implementations in prompt-injection.ts and jailbreak.ts.
 */

import { describe, it, expect } from 'vitest';

const {
  normalizeText,
  detectHiddenUnicode,
  ZERO_WIDTH_CHARS,
  COMBINING_MARK_PATTERN,
  CONFUSABLE_MAP,
  SUSPICIOUS_UNICODE_RANGES,
} = await import(
  '../../.claude/validators-node/src/ai-safety/text-normalizer.ts'
);

describe('TPI-PRE-1: Shared Text Normalizer', () => {
  describe('normalizeText()', () => {
    it('returns plain ASCII unchanged', () => {
      expect(normalizeText('hello world')).toBe('hello world');
    });

    it('maps Cyrillic confusables to ASCII', () => {
      // Cyrillic а, е, о → ASCII a, e, o
      const cyrillic = '\u0430\u0435\u043e';
      expect(normalizeText(cyrillic)).toBe('aeo');
    });

    it('maps fullwidth characters to ASCII', () => {
      expect(normalizeText('Ｈｅｌｌｏ')).toBe('Hello');
    });

    it('strips zero-width characters', () => {
      const zwsp = 'ig\u200bnore';
      expect(normalizeText(zwsp)).toBe('ignore');
    });

    it('collapses excessive whitespace', () => {
      expect(normalizeText('hello   world')).toBe('hello world');
    });

    it('collapses excessive newlines', () => {
      expect(normalizeText('a\n\n\n\nb')).toBe('a\n\nb');
    });
  });

  describe('detectHiddenUnicode()', () => {
    it('returns empty for clean ASCII text', () => {
      expect(detectHiddenUnicode('hello world')).toHaveLength(0);
    });

    it('detects zero-width space', () => {
      const findings = detectHiddenUnicode('ig\u200bnore all');
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].category).toBe('unicode_manipulation');
    });

    it('skips BOM at start of file', () => {
      const findings = detectHiddenUnicode('\ufeffnormal text');
      expect(findings).toHaveLength(0);
    });

    it('upgrades severity to WARNING for high counts (>=5)', () => {
      const manyZW = 'a' + '\u200b'.repeat(6) + 'b';
      const findings = detectHiddenUnicode(manyZW);
      const zwFinding = findings.find(f => f.description.includes('zero-width'));
      expect(zwFinding).toBeDefined();
      expect(zwFinding.severity).toBe('WARNING');
      expect(zwFinding.count).toBeGreaterThanOrEqual(5);
    });
  });

  describe('exported constants', () => {
    it('ZERO_WIDTH_CHARS contains expected characters', () => {
      expect(ZERO_WIDTH_CHARS).toContain('\u200b');
      expect(ZERO_WIDTH_CHARS).toContain('\ufeff');
      expect(ZERO_WIDTH_CHARS.length).toBe(11);
    });

    it('COMBINING_MARK_PATTERN is a RegExp', () => {
      expect(COMBINING_MARK_PATTERN).toBeInstanceOf(RegExp);
    });

    it('CONFUSABLE_MAP covers Cyrillic, Greek, fullwidth, and modifier letters', () => {
      expect(CONFUSABLE_MAP['а']).toBe('a');  // Cyrillic
      expect(CONFUSABLE_MAP['Α']).toBe('A');  // Greek
      expect(CONFUSABLE_MAP['Ａ']).toBe('A'); // Fullwidth
      expect(CONFUSABLE_MAP['ᴬ']).toBe('A'); // Modifier
    });

    it('SUSPICIOUS_UNICODE_RANGES covers zero-width and direction ranges', () => {
      expect(SUSPICIOUS_UNICODE_RANGES.length).toBe(7);
      const categories = SUSPICIOUS_UNICODE_RANGES.map(r => r[2]);
      expect(categories).toContain('zero-width');
      expect(categories).toContain('direction');
    });
  });
});
