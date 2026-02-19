/**
 * Type definitions for Prompt Injection Detection System
 *
 * These types define the structure and configuration for the
 * comprehensive prompt injection detection engine.
 *
 * @module security/types
 */

/**
 * Detection result returned by the prompt injection detector
 *
 * @property detected - Whether injection was detected based on threshold
 * @property score - Total detection score (higher = more suspicious)
 * @property matches - Array of individual pattern matches with details
 * @property severity - Severity level: low, medium, high, or critical
 * @property reason - Human-readable explanation of the detection
 */
export interface DetectionResult {
  detected: boolean
  score: number
  matches: PatternMatch[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  reason: string
}

/**
 * Individual pattern match details
 *
 * @property category - The category of pattern that matched
 * @property pattern - The regex pattern or identifier that matched
 * @property position - Position in the input where the match occurred
 * @property context - Context around the match for logging/debugging
 * @property score - Score contribution from this match
 */
export interface PatternMatch {
  category: string
  pattern: string
  position: number
  context: string
  score: number
}

/**
 * Detection configuration options
 *
 * @property strictMode - Enables stricter detection with lower threshold
 * @property scoreThreshold - Score threshold for detection (default: 50, strict: 30)
 * @property enabledCategories - Pattern categories to check (empty = all)
 * @property heuristicWeight - Weight multiplier for heuristic scores (default: 1.0)
 * @property allowPartialMatches - Allow partial pattern matches (default: false)
 */
export interface DetectionConfig {
  strictMode: boolean
  scoreThreshold: number
  enabledCategories: (keyof InjectionPatterns)[]
  heuristicWeight: number
  allowPartialMatches: boolean
}

/**
 * Pattern categories for injection detection
 */
export type InjectionPatternCategory =
  | 'systemOverride'
  | 'ignorePrevious'
  | 'roleManipulation'
  | 'jailbreak'
  | 'outputManipulation'
  | 'encoding'
  | 'delimiterInjection'
  | 'contextBreak'
  | 'markdownInjection'
  | 'transformationAttack'

/**
 * Collection of all injection patterns
 */
export interface InjectionPatterns {
  systemOverride: RegExp[]
  ignorePrevious: RegExp[]
  roleManipulation: RegExp[]
  jailbreak: RegExp[]
  outputManipulation: RegExp[]
  encoding: RegExp[]
  delimiterInjection: RegExp[]
  contextBreak: RegExp[]
  markdownInjection: RegExp[]
  transformationAttack: RegExp[]
}

/**
 * Heuristic pattern configuration
 */
export interface HeuristicPatterns {
  suspiciousChars: Array<{
    pattern: RegExp
    score: number
    name: string
  }>
  length: {
    minimumSuspicious: number
    maximumNormal: number
    excessiveRepetition: RegExp
  }
  keywordDensity: {
    keywords: string[]
    threshold: number
  }
}

/**
 * Sanitization options (for future use in output filtering)
 */
export interface SanitizeOptions {
  removeMatches: boolean
  replaceWith: string
  preserveStructure: boolean
}

/**
 * Severity level enum
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Category score mapping
 */
export interface CategoryScoreMap {
  [category: string]: number
}
