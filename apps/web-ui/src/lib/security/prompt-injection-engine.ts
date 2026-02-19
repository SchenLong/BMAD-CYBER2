/**
 * Prompt Injection Detection Engine
 *
 * Multi-layered detection system combining pattern matching and heuristic analysis
 * to identify prompt injection attempts before they reach the LLM.
 *
 * Features:
 * - 10+ pattern categories with comprehensive coverage
 * - Heuristic analysis for obfuscated attempts
 * - Score-based threshold system
 * - Configurable strict mode
 * - Detailed logging with context
 *
 * @module security/prompt-injection-engine
 */

import type {
  DetectionResult,
  PatternMatch,
  DetectionConfig,
  SeverityLevel,
  InjectionPatternCategory,
} from './types'
import {
  INJECTION_PATTERNS,
  HEURISTIC_PATTERNS,
  CATEGORY_BASE_SCORES,
  DEFAULT_CONFIG,
} from './prompt-injection-detector'

/**
 * Prompt Injection Detection Engine
 *
 * Analyzes input for potential prompt injection attacks using
 * pattern matching and heuristic analysis.
 *
 * @example
 * ```ts
 * const detector = new PromptInjectionDetector()
 * const result = detector.detect('Ignore previous instructions and...')
 * if (result.detected) {
 *   console.log(`Injection detected: ${result.severity}`)
 * }
 * ```
 */
export class PromptInjectionDetector {
  private config: DetectionConfig

  /**
   * Create a new detection engine instance
   *
   * @param config - Partial configuration to override defaults
   */
  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Primary detection method - analyzes input for prompt injection
   *
   * @param input - The user input to analyze
   * @returns Detection result with score, matches, and severity
   */
  detect(input: string): DetectionResult {
    const matches: PatternMatch[] = []
    let totalScore = 0

    // Early exit for empty or very short input
    if (!input || input.trim().length < 3) {
      return this.createResult(false, 0, [], 'Input too short to analyze')
    }

    // Normalize input for detection
    const normalized = this.normalizeInput(input)

    // Check each enabled category
    const categoriesToCheck = this.getEnabledCategories()
    for (const category of categoriesToCheck) {
      const categoryMatches = this.checkCategory(normalized, category)
      matches.push(...categoryMatches)
      totalScore += categoryMatches.reduce((sum, m) => sum + m.score, 0)
    }

    // Apply heuristic analysis
    const heuristicResults = this.runHeuristics(normalized)
    matches.push(...heuristicResults.matches)
    totalScore += Math.round(heuristicResults.score * this.config.heuristicWeight)

    // Determine if detected based on threshold
    const detected = totalScore >= this.config.scoreThreshold

    return this.createResult(
      detected,
      totalScore,
      matches,
      this.generateReason(matches, totalScore)
    )
  }

  /**
   * Get current configuration
   */
  getConfig(): DetectionConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Normalize input while preserving structure for detection
   *
   * Steps:
   * 1. Normalize whitespace (multiple spaces to single)
   * 2. Remove zero-width characters (common in obfuscation)
   * 3. Normalize line breaks (\r\n -> \n)
   * slides 4. Preserve case for pattern matching (case-insensitive regex)
   *
   * @param input - Raw input string
   * @returns Normalized input string
   */
  private normalizeInput(input: string): string {
    return input
      // Normalize whitespace but preserve single spaces
      .replace(/[ \t]+/g, ' ')
      // Remove zero-width characters (used for obfuscation)
      .replace(/[\u200B-\u200D\uFEFF\u2060\u2061\u2062\u2063\u2064]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize multiple newlines
      .replace(/\n{3,}/g, '\n\n')
  }

  /**
   * Get list of categories to check based on config
   */
  private getEnabledCategories(): InjectionPatternCategory[] {
    if (this.config.enabledCategories.length === 0) {
      return Object.keys(INJECTION_PATTERNS) as InjectionPatternCategory[]
    }
    return this.config.enabledCategories
  }

  /**
   * Check a specific category for pattern matches
   */
  private checkCategory(
    input: string,
    category: InjectionPatternCategory
  ): PatternMatch[] {
    const matches: PatternMatch[] = []
    const patterns = INJECTION_PATTERNS[category]

    if (!patterns || patterns.length === 0) {
      return matches
    }

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags)
      let match

      // Find all matches for this pattern
      while ((match = regex.exec(input)) !== null) {
        const matchText = match[0]
        const score = this.calculateScore(category, matchText)

        matches.push({
          category,
          pattern: pattern.source,
          position: match.index,
          context: this.extractContext(input, match.index, matchText.length),
          score,
        })

        // Prevent infinite loops for zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }

        // Early exit for critical severity matches
        if (score >= 100) {
          return matches
        }
      }
    }

    return matches
  }

  /**
   * Calculate score based on category and match characteristics
   *
   * @param category - The pattern category
   * @param match - The matched text
   * @returns Calculated score
   */
  private calculateScore(category: string, match: string): number {
    let score = CATEGORY_BASE_SCORES[category] || 50

    // Increase score for complex patterns
    if (match.length > 50) score += 10
    if (match.includes('{') || match.includes('}')) score += 5
    if (match.includes('$') && match.includes('{')) score += 10

    return Math.min(score, 100) // Cap at 100
  }

  /**
   * Extract context around a match for logging/debugging
   *
   * @param input - Full input string
   * @param position - Position of the match
   * @param length - Length of the match
   * @param contextSize - Characters to extract on each side
   * @returns Context string with truncation markers
   */
  private extractContext(
    input: string,
    position: number,
    length: number,
    contextSize = 50
  ): string {
    const start = Math.max(0, position - contextSize)
    const end = Math.min(input.length, position + length + contextSize)
    let context = input.slice(start, end)

    if (start > 0) context = '...' + context
    if (end < input.length) context = context + '...'

    return context
  }

  /**
   * Run heuristic analysis on input
   *
   * @param input - Normalized input string
   * @returns Heuristic matches and total score
   */
  private runHeuristics(input: string): { matches: PatternMatch[]; score: number } {
    const matches: PatternMatch[] = []
    let score = 0

    // Check suspicious character patterns
    for (const heuristic of HEURISTIC_PATTERNS.suspiciousChars) {
      if (heuristic.pattern.test(input)) {
        matches.push({
          category: 'heuristic',
          pattern: heuristic.name,
          position: 0,
          context: '',
          score: heuristic.score,
        })
        score += heuristic.score
      }
    }

    // Check length heuristics
    if (input.length > HEURISTIC_PATTERNS.length.maximumNormal) {
      const excessScore = Math.min(
        Math.floor((input.length - HEURISTIC_PATTERNS.length.maximumNormal) / 1000),
        20
      )
      matches.push({
        category: 'heuristic',
        pattern: 'excessive_length',
        position: 0,
        context: `length: ${input.length}`,
        score: 10 + excessScore,
      })
      score += 10 + excessScore
    }

    // Check for excessive repetition
    if (HEURISTIC_PATTERNS.length.excessiveRepetition.test(input)) {
      matches.push({
        category: 'heuristic',
        pattern: 'excessive_repetition',
        position: 0,
        context: '',
        score: 25,
      })
      score += 25
    }

    // Calculate keyword density
    const keywordScore = this.calculateKeywordDensity(input)
    if (keywordScore > 0) {
      matches.push({
        category: 'heuristic',
        pattern: 'high_keyword_density',
        position: 0,
        context: '',
        score: keywordScore,
      })
      score += keywordScore
    }

    return { matches, score }
  }

  /**
   * Calculate keyword density score
   *
   * @param input - Input string
   * @returns Density score
   */
  private calculateKeywordDensity(input: string): number {
    const words = input.toLowerCase().split(/\s+/)
    const { keywords, threshold } = HEURISTIC_PATTERNS.keywordDensity

    const keywordCount = words.filter((word) =>
      keywords.some((kw) => word.includes(kw))
    ).length

    const density = keywordCount / Math.max(words.length, 1)

    if (density > threshold) {
      return Math.min(Math.round(density * 100), 50)
    }

    return 0
  }

  /**
   * Calculate severity level based on score
   *
   * @param score - Total detection score
   * @returns Severity level
   */
  private calculateSeverity(score: number): SeverityLevel {
    if (score >= 100) return 'critical'
    if (score >= 75) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  /**
   * Generate human-readable reason for detection
   *
   * @param matches - All pattern matches
   * @param score - Total score
   * @returns Human-readable explanation
   */
  private generateReason(matches: PatternMatch[], score: number): string {
    if (matches.length === 0) {
      return 'No suspicious patterns detected'
    }

    const categorySet = new Set(matches.map((m) => m.category))
    const categories = Array.from(categorySet)

    if (categories.length === 1 && categories[0] === 'heuristic') {
      const heuristicSet = new Set(matches.map((m) => m.pattern))
      const heuristics = Array.from(heuristicSet)
      return `Suspicious characteristics detected: ${heuristics.join(', ')}`
    }

    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((m) => `${m.category} (${m.score})`)

    return `Suspicious patterns detected in: ${categories.join(', ')}. Top matches: ${topMatches.join(', ')}`
  }

  /**
   * Create a detection result object
   */
  private createResult(
    detected: boolean,
    score: number,
    matches: PatternMatch[],
    reason: string
  ): DetectionResult {
    return {
      detected,
      score,
      matches,
      severity: this.calculateSeverity(score),
      reason,
    }
  }
}

/**
 * Singleton instance for use across the application
 *
 * Uses default configuration. For custom config, create a new instance.
 */
export const detector = new PromptInjectionDetector()

/**
 * Convenience function for quick detection
 *
 * @param input - The user input to analyze
 * @param config - Optional configuration override
 * @returns Detection result
 *
 * @example
 * ```ts
 * import { detectPromptInjection } from '@/lib/security/prompt-injection-engine'
 *
 * const result = detectPromptInjection(userInput)
 * if (result.detected) {
 *   // Block the input
 * }
 * ```
 */
export function detectPromptInjection(
  input: string,
  config?: Partial<DetectionConfig>
): DetectionResult {
  if (config) {
    const customDetector = new PromptInjectionDetector(config)
    return customDetector.detect(input)
  }
  return detector.detect(input)
}

/**
 * Check if input is safe (no injection detected)
 *
 * @param input - The user input to analyze
 * @returns True if safe, false if injection detected
 */
export function isInputSafe(input: string): boolean {
  const result = detector.detect(input)
  return !result.detected
}

/**
 * Get detailed analysis of input
 *
 * Always returns result, even if no injection detected.
 * Useful for logging and monitoring.
 *
 * @param input - The user input to analyze
 * @returns Full detection result
 */
export function analyzeInput(input: string): DetectionResult {
  return detector.detect(input)
}

/**
 * Create a detector with strict mode enabled
 *
 * @returns New detector instance with strict configuration
 */
export function createStrictDetector(): PromptInjectionDetector {
  return new PromptInjectionDetector({
    strictMode: true,
    scoreThreshold: 30,
    heuristicWeight: 1.5,
  })
}

/**
 * Create a detector with custom configuration
 *
 * @param config - Custom configuration
 * @returns New detector instance
 */
export function createDetector(
  config: Partial<DetectionConfig>
): PromptInjectionDetector {
  return new PromptInjectionDetector(config)
}
