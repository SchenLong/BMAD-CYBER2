/**
 * Unit Tests for Normalize Line Endings Utility
 * Task 0.3 - YAML CRLF Line Ending Normalization
 *
 * Tests that the normalizeLineEndings function properly converts
 * Windows (CRLF), old Mac (CR), and mixed line endings to Unix (LF).
 * Also validates that YAML parsing succeeds after normalization.
 *
 * @module utility/normalize-line-endings.test
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { normalizeLineEndings } from '../../src/utility/normalize-line-endings.js';

// ============================================================================
// normalizeLineEndings - Core Function Tests
// ============================================================================

describe('normalizeLineEndings', () => {

  describe('CRLF normalization', () => {
    it('should convert Windows CRLF to LF', () => {
      const input = 'line1\r\nline2\r\nline3';
      const result = normalizeLineEndings(input);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should handle CRLF at end of file', () => {
      const input = 'line1\r\nline2\r\n';
      const result = normalizeLineEndings(input);
      expect(result).toBe('line1\nline2\n');
    });

    it('should handle single CRLF', () => {
      const input = '\r\n';
      const result = normalizeLineEndings(input);
      expect(result).toBe('\n');
    });
  });

  describe('CR normalization (old Mac)', () => {
    it('should convert old Mac CR to LF', () => {
      const input = 'line1\rline2\rline3';
      const result = normalizeLineEndings(input);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should handle single CR', () => {
      const input = '\r';
      const result = normalizeLineEndings(input);
      expect(result).toBe('\n');
    });
  });

  describe('mixed line endings', () => {
    it('should handle mixed CRLF, CR, and LF', () => {
      const input = 'line1\r\nline2\rline3\nline4';
      const result = normalizeLineEndings(input);
      expect(result).toBe('line1\nline2\nline3\nline4');
    });

    it('should handle consecutive different line endings', () => {
      const input = 'a\r\n\r\nb\r\rc\n\nd';
      const result = normalizeLineEndings(input);
      expect(result).toBe('a\n\nb\n\nc\n\nd');
    });
  });

  describe('LF-only content (no change needed)', () => {
    it('should leave LF-only content unchanged', () => {
      const input = 'line1\nline2\nline3';
      const result = normalizeLineEndings(input);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should leave content without line endings unchanged', () => {
      const input = 'single line no ending';
      const result = normalizeLineEndings(input);
      expect(result).toBe('single line no ending');
    });
  });

  describe('empty string', () => {
    it('should handle empty string', () => {
      const result = normalizeLineEndings('');
      expect(result).toBe('');
    });
  });

  describe('non-string input', () => {
    it('should return non-string input as-is', () => {
      expect(normalizeLineEndings(null)).toBe(null);
      expect(normalizeLineEndings(undefined)).toBe(undefined);
      expect(normalizeLineEndings(42)).toBe(42);
    });
  });

  // ============================================================================
  // YAML Parsing Integration Tests
  // ============================================================================

  describe('YAML parsing with CRLF content', () => {
    it('should parse YAML with CRLF line endings after normalization', () => {
      const yamlWithCRLF = 'name: test\r\nversion: 1.0.0\r\ndata:\r\n  key: value\r\n  nested:\r\n    deep: true';
      const normalized = normalizeLineEndings(yamlWithCRLF);
      const parsed = yaml.load(normalized, { schema: yaml.CORE_SCHEMA });

      expect(parsed).toEqual({
        name: 'test',
        version: '1.0.0',
        data: {
          key: 'value',
          nested: {
            deep: true
          }
        }
      });
    });

    it('should parse YAML with mixed line endings after normalization', () => {
      const yamlMixed = 'items:\r\n  - first\r  - second\n  - third';
      const normalized = normalizeLineEndings(yamlMixed);
      const parsed = yaml.load(normalized, { schema: yaml.CORE_SCHEMA });

      expect(parsed).toEqual({
        items: ['first', 'second', 'third']
      });
    });

    it('should parse YAML frontmatter with CRLF', () => {
      const frontmatter = '---\r\ntitle: Test Agent\r\nid: test-001\r\nteam: cybersec\r\n---';
      const normalized = normalizeLineEndings(frontmatter);

      // Extract between --- markers
      const lines = normalized.split('\n');
      const yamlContent = lines.slice(1, lines.length - 1).join('\n');
      const parsed = yaml.load(yamlContent, { schema: yaml.CORE_SCHEMA });

      expect(parsed).toEqual({
        title: 'Test Agent',
        id: 'test-001',
        team: 'cybersec'
      });
    });

    it('should handle YAML with CRLF in multiline strings', () => {
      const yamlMultiline = 'description: |\r\n  This is a multiline\r\n  description that spans\r\n  multiple lines';
      const normalized = normalizeLineEndings(yamlMultiline);
      const parsed = yaml.load(normalized, { schema: yaml.CORE_SCHEMA });

      expect(parsed.description).toContain('This is a multiline');
      expect(parsed.description).toContain('description that spans');
      expect(parsed.description).toContain('multiple lines');
    });

    it('should handle complex YAML module config with CRLF', () => {
      const moduleYaml = [
        'code: cybersec-team',
        'name: Cybersecurity Team',
        'version: 2.0.0',
        'output_folder: cybersec-team',
        'module_code: cybersec',
        'agents:',
        '  count: 3',
        '  agent_list:',
        '    - threat-analyst',
        '    - security-architect',
        '    - soc-analyst',
      ].join('\r\n');

      const normalized = normalizeLineEndings(moduleYaml);
      const parsed = yaml.load(normalized, { schema: yaml.CORE_SCHEMA });

      expect(parsed.code).toBe('cybersec-team');
      expect(parsed.agents.count).toBe(3);
      expect(parsed.agents.agent_list).toHaveLength(3);
    });
  });
});
