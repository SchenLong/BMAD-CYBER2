/**
 * Prompt Injection Pattern Library
 *
 * Comprehensive collection of regex patterns for detecting various
 * prompt injection attack vectors. Patterns are categorized by attack type
 * for better detection accuracy and logging.
 *
 * @module security/prompt-injection-detector
 */

import type { InjectionPatterns, HeuristicPatterns, DetectionConfig } from './types'

/**
 * Comprehensive prompt injection pattern library
 *
 * Patterns are categorized by attack type:
 * - systemOverride: Attempts to override system instructions
 * - ignorePrevious: Attempts to ignore or bypass previous instructions
 * - roleManipulation: Attempts to manipulate the AI's role/persona
 * - jailbreak: Direct jailbreak attempts
 * - outputManipulation: Attempts to extract system prompts or internal data
 * - encoding: Obfuscation through encoding schemes
 * - delimiterInjection: Injection via newline/delimiter manipulation
 * - contextBreak: Attempts to break context boundaries
 * - markdownInjection: Injection via markdown code blocks
 * - transformationAttack: Translation/transformation attacks
 */
export const INJECTION_PATTERNS: InjectionPatterns = {
  /**
   * System instruction override attempts
   * High severity (base score: 100)
   * Examples: <system>, [ADMIN], <critical>
   */
  systemOverride: [
    /<\s*system\s*>/i,
    /<\s*instruction\s*>/i,
    /<\s*admin\s*>/i,
    /<\s*agent\s*>/i,
    /<\s*immediate\s*\*>/i,
    /<\s*critical\s*\*>/i,
    /<\s*developer\s*\*>/i,
    /<\s*config\s*\*>/i,
    /<\s*settings\s*\*>/i,
    /\[SYSTEM\]/i,
    /\[INSTRUCTION\]/i,
    /\[ADMIN\]/i,
    /\[CRITICAL\]/i,
    /\[DEVELOPER\]/i,
    /\[CONFIG\]/i,
    /\{SYSTEM\}/i,
    /\{ADMIN\}/i,
    /\{INSTRUCTION\}/i,
  ],

  /**
   * Ignore and bypass patterns
   * High severity (base score: 80)
   * Examples: "ignore all previous", "disregard above"
   */
  ignorePrevious: [
    /ignore\s+(all\s+)?(previous|above|earlier|prior)(\s+instructions?)?/i,
    /disregard\s+(all\s+)?(previous|above|earlier|prior)(\s+instructions?)?/i,
    /forget\s+(all\s+)?(previous|above|earlier|prior)(\s+instructions?)?/i,
    /don't\s+listen\s+to/i,
    /pay\s+no\s+attention\s+to/i,
    /skip\s+(all\s+)?(previous|above)/i,
    /override\s+(all\s+)?previous/i,
    /clear\s+(all\s+)?(previous|above)/i,
    /reset\s+(all\s+)?(previous|above)/i,
    /delete\s+(all\s+)?(previous|above)/i,
  ],

  /**
   * Role manipulation
   * Medium-high severity (base score: 60)
   * Examples: "pretend to be", "act as", "role-play"
   */
  roleManipulation: [
    /pretend\s+(to\s+be|you\s+are|you're|you\s+were)/i,
    /act\s+(as|like)\s+(a|an|the)/i,
    /role[- ]?play\s+(as|like)/i,
    /you\s+are\s+now/i,
    /become\s+(a|an)/i,
    /switch\s+(to|into)/i,
    /adopt\s+(the\s+)?persona/i,
    /assume\s+(the\s+)?role/i,
    /take\s+on\s+(the\s+)?role/i,
    /transform\s+into/i,
    /you\s+are\s+(now\s+)?(a|an)\s+(developer|hacker|admin)/i,
  ],

  /**
   * Jailbreak attempts
   * Critical severity (base score: 100)
   * Examples: "jailbreak", "developer mode", "unrestricted"
   */
  jailbreak: [
    /jailbreak/i,
    /(bypass|override)\s+(safety|security|restrictions|filters|protections)/i,
    /disable\s+(safety|security|restrictions|filters|protections)/i,
    /developer\s+mode/i,
    /debug\s+mode/i,
    /god\s+mode/i,
    /unrestricted\s+mode/i,
    /no\s+limits?\s+mode/i,
    /uncensored/i,
    /without\s+(restriction|limit|filter)/i,
    /ignore\s+(all\s+)?(rules|safety|security)/i,
    /above?\s+the\s+(law|rules)/i,
  ],

  /**
   * Output manipulation
   * High severity (base score: 90)
   * Examples: "reveal instructions", "dump memory"
   */
  outputManipulation: [
    /output\s+(only|just)\s+(the|all)/i,
    /print\s+(everything|all)/i,
    /reveal\s+(your\s+)?(instructions|system\s+prompt|training\s+data|internal\s+instructions)/i,
    /show\s+(me\s+)?(your\s+)?(instructions|prompt|configuration|settings)/i,
    /dump\s+(your\s+)?(memory|knowledge|context|data)/i,
    /repeat\s+(everything|back\s+to\s+me|all)/i,
    /tell\s+me\s+(how\s+you\s+)?work/i,
    /explain\s+(your\s+)?(programming|instructions)/i,
    /what\s+(are\s+)?your\s+instructions/i,
    /display\s+(your\s+)?(system\s+prompt|internal)/i,
  ],

  /**
   * Encoding and obfuscation
   * Medium-high severity (base score: 70)
   * Examples: base64:, rot13:, hex:, binary:, unicode:
   */
  encoding: [
    /base64:\s*[A-Za-z0-9+/=]+/i,
    /rot13:\s*[a-z]+/i,
    /morse:\s*[.\-\/\s]+/i,
    /hex:\s*(0x)?[0-9a-f]+/i,
    /binary:\s*[01\s]+/i,
    /unicode:\s*(\\u|U\+)[0-9a-f]+/i,
    /ascii:\s*\d+(\s+\d+)*/i,
    /decode:\s*(base64|hex|binary)/i,
  ],

  /**
   * Newline and delimiter injection
   * High severity (base score: 85)
   * Examples: newline-based system tags
   */
  delimiterInjection: [
    /\n\s*(system|instruction|admin|agent|developer):\s*/i,
    /\\n\s*(system|instruction|admin|agent|developer):\s*/i,
    /\r\n\s*(system|instruction|admin|agent|developer):\s*/i,
    /\n\s*<\s*(system|instruction|admin)/i,
    /\\n\s*<\s*(system|instruction|admin)/i,
    /\n\s*\[(system|instruction|admin)\]/i,
  ],

  /**
   * Context boundary breaking
   * Medium-high severity (base score: 75)
   * Examples: "--- end of context", "<<< override"
   */
  contextBreak: [
    /---\s*end\s+of\s+(context|input|message)/i,
    /---\s*new\s+(instruction|direction|command)/i,
    /<<<\s*override/i,
    />>>\s*(new|different|override)/i,
    /===\s*(end|stop|halt)/i,
    /###\s*new\s+(context|instruction)/i,
  ],

  /**
   * Markdown-based injection
   * Medium severity (base score: 50)
   * Examples: ```system, ```instruction blocks
   */
  markdownInjection: [
    /```\s*(system|instruction|admin|agent|developer)/i,
    /~~~\s*(system|instruction|admin|agent|developer)/i,
    /```\s*json\s*{\s*"role"?\s*:\s*"system"/i,
    /```json\s*{\s*"role"?\s*:\s*"system"/i,
  ],

  /**
   * Translation and transformation attacks
   * Medium-low severity (base score: 40)
   * Examples: "translate this to", "convert this to"
   */
  transformationAttack: [
    /translate\s+(this|the\s+above|everything)\s+to/i,
    /convert\s+(this|the\s+above|everything)\s+to/i,
    /transform\s+(this|the\s+above)\s+into/i,
    /rewrite\s+(this|the\s+above)\s+as/i,
    /rephrase\s+(this|the\s+above)\s+to/i,
  ],
}

/**
 * Heuristic patterns for detecting suspicious input characteristics
 *
 * These patterns are weighted scores rather than binary matches,
 * allowing for more nuanced detection of obfuscated attempts.
 */
export const HEURISTIC_PATTERNS: HeuristicPatterns = {
  /**
   * Suspicious character sequences
   * Multiple brackets, nested braces, excessive escapes
   */
  suspiciousChars: [
    { pattern: /[<>]{3,}/, score: 30, name: 'multiple_brackets' },
    { pattern: /\{.*\{.*\{/, score: 20, name: 'nested_braces' },
    { pattern: /\[.*\[.*\[/, score: 20, name: 'nested_brackets' },
    { pattern: /\\.*\\.*\\/, score: 15, name: 'excessive_escapes' },
    { pattern: /\$\{.*\}/, score: 25, name: 'template_literal' },
    { pattern: /@{2,}/, score: 20, name: 'double_at_sign' },
  ],

  /**
   * Length-based heuristics
   * Very long inputs may contain obfuscated payloads
   */
  length: {
    minimumSuspicious: 500,
    maximumNormal: 10000,
    excessiveRepetition: /\s(.{1,10}\s){10,}/i,
  },

  /**
   * Keyword density analysis
   * High density of suspicious keywords indicates potential attack
   */
  keywordDensity: {
    keywords: [
      'system',
      'instruction',
      'override',
      'ignore',
      'pretend',
      'jailbreak',
      'admin',
      'developer',
      'unrestricted',
      'bypass',
      'disable',
      'reveal',
      'prompt',
      'context',
    ],
    threshold: 0.05, // 5% of words
  },
}

/**
 * Base scores for each pattern category
 * Higher scores indicate more severe attack types
 */
export const CATEGORY_BASE_SCORES: Record<string, number> = {
  systemOverride: 100,
  ignorePrevious: 80,
  roleManipulation: 60,
  jailbreak: 100,
  outputManipulation: 90,
  encoding: 70,
  delimiterInjection: 85,
  contextBreak: 75,
  markdownInjection: 50,
  transformationAttack: 40,
}

/**
 * Default detection configuration
 *
 * Provides balanced security with minimal false positives
 */
export const DEFAULT_CONFIG: DetectionConfig = {
  strictMode: false,
  scoreThreshold: 50,
  enabledCategories: Object.keys(INJECTION_PATTERNS) as (keyof InjectionPatterns)[],
  heuristicWeight: 1.0,
  allowPartialMatches: false,
}

/**
 * Strict mode configuration for high-security environments
 *
 * Lowers threshold to 30 and enables all heuristics
 */
export const STRICT_CONFIG: DetectionConfig = {
  strictMode: true,
  scoreThreshold: 30,
  enabledCategories: Object.keys(INJECTION_PATTERNS) as (keyof InjectionPatterns)[],
  heuristicWeight: 1.5,
  allowPartialMatches: true,
}
