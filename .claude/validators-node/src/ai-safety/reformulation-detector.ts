/**
 * BMAD Validators - Reformulation Detector (TPI-09)
 * ==================================================
 * Detects injection payloads disguised through code formatting:
 * - Code comments (10+ styles): //, block comments, #, --, %, REM, etc.
 * - Multi-line comments: triple-quote, Haskell, Pascal
 * - HTML/XML comments
 * - Markdown code blocks and inline code
 * - Variable/function name encoding
 *
 * LIBRARY MODULE ONLY — no bin entry point (P1-4).
 * Called from prompt-injection.ts pipeline.
 */

import type { Severity } from '../types/index.js';
import {
  detectPatterns,
  CRITICAL_PATTERNS,
} from './pattern-engine.js';

// =============================================================================
// TYPES
// =============================================================================

export interface ReformulationFinding {
  category: string;
  pattern_name: string;
  severity: Severity;
  source_type: string;        // 'code_comment' | 'variable_name' | 'function_name' | 'string_literal'
  extracted_text: string;      // The text extracted from the code construct
  description: string;
}

// =============================================================================
// CODE COMMENT EXTRACTION
// =============================================================================

/**
 * Comment extraction patterns for 10+ languages/formats.
 * Each pattern captures the comment content (group 1).
 */
const COMMENT_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  description: string;
}> = [
  // Single-line comments
  {
    name: 'c_style_single',
    pattern: /\/\/\s*(.*?)$/gm,
    description: 'C/C++/Java/JS single-line comment',
  },
  {
    name: 'hash_comment',
    pattern: /(?:^|\s)#\s+(.*?)$/gm,
    description: 'Python/Ruby/Shell hash comment',
  },
  {
    name: 'sql_comment',
    pattern: /--\s+(.*?)$/gm,
    description: 'SQL/Haskell double-dash comment',
  },
  {
    name: 'percent_comment',
    pattern: /(?:^|\s)%\s+(.*?)$/gm,
    description: 'MATLAB/LaTeX percent comment',
  },
  {
    name: 'rem_comment',
    pattern: /^REM\s+(.*?)$/gim,
    description: 'Batch file REM comment',
  },

  // Multi-line comments
  {
    name: 'c_style_multi',
    pattern: /\/\*\s*([\s\S]*?)\s*\*\//g,
    description: 'C-style multi-line comment',
  },
  {
    name: 'python_triple_double',
    pattern: /"""\s*([\s\S]*?)\s*"""/g,
    description: 'Python triple-double-quote docstring',
  },
  {
    name: 'python_triple_single',
    pattern: /'''\s*([\s\S]*?)\s*'''/g,
    description: 'Python triple-single-quote docstring',
  },
  {
    name: 'haskell_multi',
    pattern: /\{-\s*([\s\S]*?)\s*-\}/g,
    description: 'Haskell multi-line comment',
  },
  {
    name: 'pascal_multi',
    pattern: /\(\*\s*([\s\S]*?)\s*\*\)/g,
    description: 'Pascal/OCaml multi-line comment',
  },

  // HTML/XML comments
  {
    name: 'html_comment',
    pattern: /<!--\s*([\s\S]*?)\s*-->/g,
    description: 'HTML/XML comment',
  },
];

/**
 * Markdown code extraction patterns.
 */
const MARKDOWN_CODE_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  description: string;
}> = [
  {
    name: 'fenced_code_block',
    pattern: /```(?:\w+)?\s*\n([\s\S]*?)\n\s*```/g,
    description: 'Markdown fenced code block',
  },
  {
    name: 'inline_code',
    pattern: /`([^`]+)`/g,
    description: 'Markdown inline code',
  },
];

/**
 * Extract all comment text from content.
 * Returns array of {text, source} pairs.
 */
function extractCommentText(content: string): Array<{ text: string; source: string }> {
  const extracted: Array<{ text: string; source: string }> = [];

  for (const commentPattern of COMMENT_PATTERNS) {
    let match: RegExpExecArray | null;
    commentPattern.pattern.lastIndex = 0; // Reset regex state

    while ((match = commentPattern.pattern.exec(content)) !== null) {
      const text = (match[1] || '').trim();
      if (text.length > 5) { // Skip very short comments
        extracted.push({ text, source: commentPattern.name });
      }
    }
  }

  // Also extract from markdown code blocks
  for (const mdPattern of MARKDOWN_CODE_PATTERNS) {
    let match: RegExpExecArray | null;
    mdPattern.pattern.lastIndex = 0;

    while ((match = mdPattern.pattern.exec(content)) !== null) {
      const text = (match[1] || '').trim();
      if (text.length > 10) { // Higher threshold for code blocks
        extracted.push({ text, source: mdPattern.name });
      }
    }
  }

  return extracted;
}

// =============================================================================
// VARIABLE/FUNCTION NAME ENCODING DETECTION
// =============================================================================

/**
 * Patterns that detect injection keywords encoded in identifiers.
 * These match variable names, function names, or class names that spell out
 * injection-related instructions.
 */
const IDENTIFIER_INJECTION_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  severity: Severity;
  description: string;
}> = [
  {
    name: 'var_bypass_safety',
    pattern: /(?:const|let|var|function|def|class)\s+(?:\w*(?:bypass|ignore|override|disable|remove)(?:Safety|Security|Filter|Guard|Rules?|Restrictions?|Constraints?)\w*)/i,
    severity: 'INFO',
    description: 'Variable/function name encodes safety bypass instruction',
  },
  {
    name: 'var_jailbreak',
    pattern: /(?:const|let|var|function|def|class)\s+(?:\w*(?:jailbreak|jailBreak|jail_break)\w*)/i,
    severity: 'INFO',
    description: 'Variable/function name contains jailbreak reference',
  },
  {
    name: 'var_ignore_instructions',
    pattern: /(?:const|let|var|function|def|class)\s+(?:\w*(?:ignoreAll(?:Previous|Prior)?(?:Rules?|Instructions?)|forgetRules|overrideSystem)\w*)/i,
    severity: 'INFO',
    description: 'Variable/function name encodes instruction override',
  },
  {
    name: 'assignment_nullify_rules',
    pattern: /(?:rules?|restrictions?|safety|constraints?|guardrails?|filters?)\s*(?:=|:=)\s*(?:null|nil|false|0|undefined|None|\[\]|\{\}|"")/i,
    severity: 'INFO',
    description: 'Assignment nullifies rules/restrictions variable',
  },
];

/**
 * Detect injection keywords encoded in variable/function names.
 */
function detectIdentifierEncoding(content: string): ReformulationFinding[] {
  const findings: ReformulationFinding[] = [];

  for (const pattern of IDENTIFIER_INJECTION_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      findings.push({
        category: 'code_format_injection',
        pattern_name: pattern.name,
        severity: pattern.severity,
        source_type: pattern.name.startsWith('assignment') ? 'assignment' : 'variable_name',
        extracted_text: match[0].slice(0, 100),
        description: pattern.description,
      });
    }
  }

  return findings;
}

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Detect injection payloads hidden in code format constructs.
 *
 * 1. Extracts text from code comments (10+ comment styles)
 * 2. Runs pattern engine detection on extracted text
 * 3. Detects variable/function name encoding
 *
 * Returns array of ReformulationFinding objects.
 */
export function detectCodeFormatInjection(content: string): ReformulationFinding[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  const findings: ReformulationFinding[] = [];

  // Step 1: Extract comment text and scan for patterns
  const commentExtracts = extractCommentText(content);

  for (const { text, source } of commentExtracts) {
    // Run pattern engine on extracted comment text
    const patternFindings = detectPatterns(text);

    for (const pf of patternFindings) {
      // Determine severity: WARNING for CRITICAL patterns in comments, INFO for others
      const isCriticalPattern = CRITICAL_PATTERNS.some(
        (cp) => cp.name === pf.pattern_name
      );
      const severity: Severity = isCriticalPattern ? 'WARNING' : 'INFO';

      findings.push({
        category: 'code_format_injection',
        pattern_name: `comment_${pf.pattern_name}`,
        severity,
        source_type: 'code_comment',
        extracted_text: text.slice(0, 100),
        description: `Code comment (${source}) contains ${pf.description}`,
      });
    }
  }

  // Step 2: Detect variable/function name encoding
  const identifierFindings = detectIdentifierEncoding(content);
  findings.push(...identifierFindings);

  return findings;
}

// =============================================================================
// TPI-10: CHARACTER-LEVEL ENCODING DETECTION
// =============================================================================

/** Performance guard: only decode content under 10KB */
const MAX_CHAR_DECODE_SIZE = 10240;

/**
 * Apply ROT13 to a string.
 */
function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/**
 * Apply ROT47 to printable ASCII.
 */
function rot47(text: string): string {
  return text.replace(/[!-~]/g, (c) => {
    return String.fromCharCode(((c.charCodeAt(0) - 33 + 47) % 94) + 33);
  });
}

/**
 * Reverse a string.
 */
function reverseText(text: string): string {
  return [...text].reverse().join('');
}

/**
 * Extract acrostic (first char of each line, min 5 lines).
 */
function extractAcrostic(text: string): string | null {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 5) return null;
  return lines.map((l) => l.trim()[0] || '').join('');
}

/**
 * Detect Pig Latin: words ending in -ay with moved consonant cluster.
 */
function detectPigLatin(text: string): string | null {
  const words = text.split(/\s+/);
  const pigLatinWords = words.filter((w) => /[a-z]+ay$/i.test(w));
  if (pigLatinWords.length < 3 || pigLatinWords.length / words.length < 0.5) return null;
  // Attempt decode
  const decoded = pigLatinWords.map((w) => {
    // Vowel-start words end in "way" (e.g., "ignoreway" → "ignore")
    if (/^[aeiou].*way$/i.test(w)) {
      return w.slice(0, -3);
    }
    // Consonant-start words: cluster moved to end before "ay"
    const match = w.match(/^(.+?)([bcdfghjklmnpqrstvwxyz]+)ay$/i);
    if (!match) return w;
    return (match[2] ?? '') + (match[1] ?? '');
  });
  return decoded.join(' ');
}

/** Keywords that indicate injection when found in decoded content */
const CHAR_INJECTION_KEYWORDS = /\b(?:ignore|bypass|override|system|jailbreak|unrestricted|disable|instructions|prompt|safety)\b/i;

/**
 * Detect character-level encoded injection payloads.
 * Decodes ROT13, ROT47, reverse text, acrostic, and pig latin.
 */
export function detectCharacterLevelEncoding(content: string): ReformulationFinding[] {
  if (!content || content.length > MAX_CHAR_DECODE_SIZE || content.trim().length === 0) {
    return [];
  }

  const findings: ReformulationFinding[] = [];

  // ROT13 decode
  const rot13Decoded = rot13(content);
  if (rot13Decoded !== content && CHAR_INJECTION_KEYWORDS.test(rot13Decoded)) {
    const patternHits = detectPatterns(rot13Decoded);
    const hasCritical = patternHits.some((p) => p.severity === 'CRITICAL' || p.severity === 'WARNING');
    findings.push({
      category: 'character_encoding',
      pattern_name: 'rot13_injection',
      severity: hasCritical ? 'WARNING' : 'INFO',
      source_type: 'rot13',
      extracted_text: rot13Decoded.slice(0, 100),
      description: 'ROT13 decoded content contains injection keywords',
    });
  }

  // ROT47 decode
  const rot47Decoded = rot47(content);
  if (rot47Decoded !== content && rot47Decoded !== rot13Decoded && CHAR_INJECTION_KEYWORDS.test(rot47Decoded)) {
    findings.push({
      category: 'character_encoding',
      pattern_name: 'rot47_injection',
      severity: 'INFO',
      source_type: 'rot47',
      extracted_text: rot47Decoded.slice(0, 100),
      description: 'ROT47 decoded content contains injection keywords',
    });
  }

  // Reverse text
  const reversed = reverseText(content);
  if (CHAR_INJECTION_KEYWORDS.test(reversed)) {
    const patternHits = detectPatterns(reversed);
    const hasCritical = patternHits.some((p) => p.severity === 'CRITICAL' || p.severity === 'WARNING');
    findings.push({
      category: 'character_encoding',
      pattern_name: 'reverse_text_injection',
      severity: hasCritical ? 'WARNING' : 'INFO',
      source_type: 'reverse',
      extracted_text: reversed.slice(0, 100),
      description: 'Reversed text contains injection keywords',
    });
  }

  // Acrostic extraction
  const acrostic = extractAcrostic(content);
  if (acrostic && CHAR_INJECTION_KEYWORDS.test(acrostic)) {
    findings.push({
      category: 'character_encoding',
      pattern_name: 'acrostic_injection',
      severity: 'INFO',
      source_type: 'acrostic',
      extracted_text: acrostic,
      description: 'Acrostic (first letters of lines) contains injection keywords',
    });
  }

  // Pig Latin detection
  const pigLatinDecoded = detectPigLatin(content);
  if (pigLatinDecoded && CHAR_INJECTION_KEYWORDS.test(pigLatinDecoded)) {
    findings.push({
      category: 'character_encoding',
      pattern_name: 'pig_latin_injection',
      severity: 'INFO',
      source_type: 'pig_latin',
      extracted_text: pigLatinDecoded.slice(0, 100),
      description: 'Pig Latin decoded content contains injection keywords',
    });
  }

  return findings;
}

// =============================================================================
// TPI-11: CONTEXT OVERLOAD & MANY-SHOT DETECTION
// =============================================================================

/**
 * Detect context overload and many-shot injection patterns.
 * - Token flooding: long content with high repetition
 * - Many-shot: >10 similar instruction patterns in single message
 * - Repetition: >40% sentences share same hash bucket (O(n) hash-based, P1-5)
 */
export function detectContextOverload(content: string): ReformulationFinding[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  const findings: ReformulationFinding[] = [];

  // Token flooding heuristic: >15,000 chars with high repetition ratio
  if (content.length > 15000) {
    const sentences = content.split(/[.!?\n]+/).filter((s) => s.trim().length > 5);
    if (sentences.length > 0) {
      // O(n) hash-based dedup (P1-5)
      const hashBuckets = new Map<string, number>();
      for (const sentence of sentences) {
        const normalized = sentence.trim().toLowerCase().replace(/\s+/g, ' ');
        const count = hashBuckets.get(normalized) || 0;
        hashBuckets.set(normalized, count + 1);
      }

      const totalSentences = sentences.length;
      const uniqueSentences = hashBuckets.size;
      const repetitionRatio = 1 - (uniqueSentences / totalSentences);

      if (repetitionRatio > 0.4) {
        findings.push({
          category: 'context_overload',
          pattern_name: 'token_flooding',
          severity: 'WARNING',
          source_type: 'flooding',
          extracted_text: `${content.length} chars, ${totalSentences} sentences, ${Math.round(repetitionRatio * 100)}% repetition`,
          description: 'Token flooding detected: long content with high repetition ratio',
        });
      }
    }
  }

  // Many-shot detection: count instruction-like sentences
  const instructionPatterns = /(?:^|\n)\s*(?:(?:please\s+)?(?:ignore|bypass|override|disable|remove|forget|reveal|show)\b|(?:you\s+(?:must|should|will|need\s+to))\b)/gi;
  const instructionMatches = content.match(instructionPatterns) || [];
  if (instructionMatches.length > 10) {
    findings.push({
      category: 'context_overload',
      pattern_name: 'many_shot',
      severity: 'WARNING',
      source_type: 'many_shot',
      extracted_text: `${instructionMatches.length} instruction-like patterns detected`,
      description: 'Many-shot injection: >10 similar instruction patterns in single message',
    });
  }

  // Repetition analysis using O(n) hash-based dedup (P1-5)
  const allSentences = content.split(/[.!?\n]+/).filter((s) => s.trim().length > 5);
  if (allSentences.length > 5) {
    const hashBuckets = new Map<string, number>();
    for (const sentence of allSentences) {
      const normalized = sentence.trim().toLowerCase().replace(/\s+/g, ' ');
      const count = hashBuckets.get(normalized) || 0;
      hashBuckets.set(normalized, count + 1);
    }

    const totalSentences = allSentences.length;
    const uniqueSentences = hashBuckets.size;
    const repetitionRatio = 1 - (uniqueSentences / totalSentences);

    if (repetitionRatio > 0.4 && content.length <= 15000) {
      findings.push({
        category: 'context_overload',
        pattern_name: 'repetitive_content',
        severity: 'WARNING',
        source_type: 'repetition',
        extracted_text: `${totalSentences} sentences, ${Math.round(repetitionRatio * 100)}% repetition`,
        description: 'High repetition ratio: >40% of sentences are duplicates',
      });
    }
  }

  return findings;
}

// =============================================================================
// TPI-13: MATHEMATICAL/LOGICAL ENCODING DETECTION
// =============================================================================

/**
 * Patterns detecting injection encoded as math/logic.
 */
const MATH_LOGIC_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  description: string;
}> = [
  {
    name: 'formal_logic_override',
    pattern: /(?:∀|∃|⊢|⊨|→|⇒|∧|∨)\s*(?:\w+\s*)?[:(]?\s*(?:safety|rules?|instructions?|constraints?|restrictions?)(?:\([^)]*\))?\s*(?:→|⇒|=)\s*(?:ignore|null|false|0|⊥)(?:\([^)]*\))?/i,
    description: 'Formal logic encoding of safety override',
  },
  {
    name: 'pseudomath_nullify',
    pattern: /(?:let|set|define)\s+(?:rules?|restrictions?|safety|constraints?|guardrails?)\s*(?:=|:=|←)\s*(?:null|nil|0|false|∅|undefined|None|empty|\[\]|\{\})/i,
    description: 'Pseudomath notation nullifying rules',
  },
  {
    name: 'conditional_override',
    pattern: /(?:if|when|given)\s+(?:true|1|always)\s*(?:then|→|⇒|:)\s*(?:ignore|bypass|override|disable)\s+(?:all\s+)?(?:rules?|safety|restrictions?)/i,
    description: 'Conditional logic encoding safety bypass',
  },
];

/**
 * Detect mathematical/logical encoding of injection payloads.
 */
export function detectMathLogicEncoding(content: string): ReformulationFinding[] {
  if (!content || content.length > 5120 || content.trim().length === 0) {
    return [];
  }

  const findings: ReformulationFinding[] = [];

  for (const pattern of MATH_LOGIC_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      findings.push({
        category: 'math_logic_encoding',
        pattern_name: pattern.name,
        severity: 'INFO',
        source_type: 'math_notation',
        extracted_text: match[0].slice(0, 100),
        description: pattern.description,
      });
    }
  }

  return findings;
}
