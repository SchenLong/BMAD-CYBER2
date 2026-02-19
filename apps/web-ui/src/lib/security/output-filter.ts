/**
 * Output Filter
 * Story 9.3: Output Filtering
 *
 * Filters LLM outputs for suspicious content that could indicate:
 * - Prompt injection success (embedded instructions in responses)
 * - Code execution attempts
 * - File system access
 * - System command execution
 * - Data exfiltration
 * - Internal API exposure
 * - Credential exposure
 *
 * @module security/output-filter
 */

import type {
  OutputFilterConfig,
  OutputPatternMatch,
  OutputSeverityLevel,
  OutputPatternCategory,
} from './patterns/output-patterns'
import {
  OUTPUT_PATTERNS,
  CATEGORY_SEVERITY,
  DEFAULT_FILTER_CONFIG,
  SEVERITY_THRESHOLDS,
} from './patterns/output-patterns'

/**
 * Filter result interface
 */
export interface FilterResult {
  flagged: boolean
  severity: OutputSeverityLevel
  patterns: OutputPatternMatch[]
  reason: string
  shouldBlock: boolean
  score: number
}

/**
 * Filtered response interface
 */
export interface FilteredResponse<T = unknown> {
  success: boolean
  data?: T
  warning?: string
  blocked?: boolean
  filterInfo?: {
    severity: OutputSeverityLevel
    patterns: string[]
    reason: string
  }
}

/**
 * Interface for response objects that may contain agent type
 */
export interface AgentResponse {
  content?: string
  agent?: string
  [key: string]: unknown
}

/**
 * Review queue entry for flagged outputs
 */
export interface ReviewQueueEntry {
  id: string
  timestamp: Date
  result: FilterResult
  originalOutput: string
  agentType?: string
  reviewed: boolean
  reviewedBy?: string
  reviewedAt?: Date
  action?: 'approved' | 'rejected' | 'escalated'
  notes?: string
}

/**
 * Review queue statistics
 */
export interface ReviewQueueStats {
  total: number
  pending: number
  reviewed: number
  bySeverity: Record<string, number>
  byAction: Record<string, number>
}

/**
 * In-memory review queue for flagged outputs
 * Can be extended to use persistent storage (database, file system)
 */
class ReviewQueue {
  private entries: Map<string, ReviewQueueEntry> = new Map()
  private maxEntries = 1000

  /**
   * Maximum length of output to store in review queue
   * Truncates long outputs to avoid excessive memory usage
   */
  private static readonly MAX_STORED_OUTPUT_LENGTH = 500

  /**
   * Add an entry to the review queue
   *
   * @param result - The filter result
   * @param originalOutput - The original output (sanitized before storage)
   * @param agentType - Optional agent type
   * @returns The review entry ID
   */
  add(result: FilterResult, originalOutput: string, agentType?: string): string {
    // Enforce max entries limit (FIFO eviction)
    if (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value
      if (oldestKey) {
        this.entries.delete(oldestKey)
      }
    }

    const id = `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const entry: ReviewQueueEntry = {
      id,
      timestamp: new Date(),
      result,
      originalOutput: originalOutput.substring(0, ReviewQueue.MAX_STORED_OUTPUT_LENGTH), // Truncate for storage
      agentType,
      reviewed: false,
    }

    this.entries.set(id, entry)
    return id
  }

  /**
   * Get an entry by ID
   *
   * @param id - The entry ID
   * @returns The entry or undefined if not found
   */
  get(id: string): ReviewQueueEntry | undefined {
    return this.entries.get(id)
  }

  /**
   * Mark an entry as reviewed
   *
   * @param id - The entry ID
   * @param reviewedBy - Who reviewed the entry
   * @param action - The action taken
   * @param notes - Optional notes
   * @returns True if the entry was found and updated
   */
  markReviewed(
    id: string,
    reviewedBy: string,
    action: 'approved' | 'rejected' | 'escalated',
    notes?: string
  ): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false

    entry.reviewed = true
    entry.reviewedBy = reviewedBy
    entry.reviewedAt = new Date()
    entry.action = action
    entry.notes = notes

    this.entries.set(id, entry)
    return true
  }

  /**
   * Get all entries, optionally filtered
   *
   * @param options - Filter options
   * @returns Array of entries matching the filter
   */
  getEntries(options?: {
    reviewed?: boolean
    severity?: OutputSeverityLevel
    limit?: number
  }): ReviewQueueEntry[] {
    let entries = Array.from(this.entries.values())

    if (options?.reviewed !== undefined) {
      entries = entries.filter((e) => e.reviewed === options.reviewed)
    }

    if (options?.severity) {
      entries = entries.filter((e) => e.result.severity === options.severity)
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (options?.limit) {
      entries = entries.slice(0, options.limit)
    }

    return entries
  }

  /**
   * Get review queue statistics
   *
   * @returns Statistics about the review queue
   */
  getStats(): ReviewQueueStats {
    const entries = Array.from(this.entries.values())

    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }

    const byAction: Record<string, number> = {
      approved: 0,
      rejected: 0,
      escalated: 0,
    }

    for (const entry of entries) {
      bySeverity[entry.result.severity]++
      if (entry.action) {
        byAction[entry.action]++
      }
    }

    return {
      total: entries.length,
      pending: entries.filter((e) => !e.reviewed).length,
      reviewed: entries.filter((e) => e.reviewed).length,
      bySeverity,
      byAction,
    }
  }

  /**
   * Clear old entries
   *
   * @param olderThan - Remove entries older than this date
   * @returns Number of entries removed
   */
  clearOld(olderThan: Date): number {
    let removed = 0
    for (const [id, entry] of this.entries) {
      if (entry.timestamp < olderThan) {
        this.entries.delete(id)
        removed++
      }
    }
    return removed
  }
}

/**
 * Global review queue instance
 */
export const reviewQueue = new ReviewQueue()

/**
 * Output Filter Class
 *
 * Scans LLM outputs for suspicious patterns and determines if they should be blocked or warned.
 */
export class OutputFilter {
  private config: OutputFilterConfig

  /**
   * Create a new output filter instance
   *
   * @param config - Partial configuration to override defaults
   */
  constructor(config: Partial<OutputFilterConfig> = {}) {
    this.config = { ...DEFAULT_FILTER_CONFIG, ...config }
  }

  /**
   * Primary filter method - analyzes output for suspicious patterns
   *
   * @param output - The LLM output to analyze
   * @param agentType - Optional agent type for context-aware filtering
   * @param addToReviewQueue - Whether to add flagged outputs to review queue (default: true)
   * @returns Filter result with score, matches, and action recommendation
   */
  filter(output: string, agentType?: string, addToReviewQueue = true): FilterResult {
    // Early exit for empty output
    if (!output || output.trim().length === 0) {
      return this.createResult(false, 0, [], 'No output to analyze')
    }

    // Get agent-specific config if provided
    const agentConfig = agentType && this.config.agentSpecificRules[agentType]
      ? { ...this.config, ...this.config.agentSpecificRules[agentType] }
      : this.config

    // Truncate for performance if needed
    const outputToCheck = output.length > agentConfig.maxOutputLength
      ? output.substring(0, agentConfig.maxOutputLength)
      : output

    const matches: OutputPatternMatch[] = []
    let totalScore = 0

    // Check each pattern category
    const matchedCategories = new Set<OutputPatternCategory>()
    for (const [category, patterns] of Object.entries(OUTPUT_PATTERNS)) {
      const categoryMatches = this.checkCategory(
        outputToCheck,
        category as OutputPatternCategory,
        patterns
      )
      matches.push(...categoryMatches)
      // Track which categories have matches
      if (categoryMatches.length > 0) {
        matchedCategories.add(category as OutputPatternCategory)
      }
    }

    // Calculate score: each matched category contributes its severity once
    // This prevents the same pattern matching multiple times from inflating the score
    totalScore = Array.from(matchedCategories).reduce(
      (sum, category) => sum + CATEGORY_SEVERITY[category],
      0
    )

    // Check allowlist - if fully allowlisted with no patterns, return early
    const isFullyAllowlisted = this.isAllowlisted(output, agentConfig)
    if (matches.length === 0 && isFullyAllowlisted) {
      return this.createResult(false, 0, [], 'Output matched allowlist')
    }

    // Determine severity based on score
    const severity = this.calculateSeverity(totalScore)

    // If allowlisted content is present, reduce severity for patterns that overlap with allowlist
    if (isFullyAllowlisted && matches.length > 0) {
      // Check if non-allowlisted patterns exist
      const hasNonAllowlistedPatterns = this.hasNonAllowlistedMatches(output, agentConfig, matches)
      if (!hasNonAllowlistedPatterns) {
        // All patterns are within allowlisted content - don't block
        return this.createResult(false, 0, [], 'Output matched allowlist')
      }
      // Some patterns are outside allowlisted content - proceed with filtering
    }

    // Determine if output should be blocked
    const shouldBlock = this.shouldBlock(severity, agentConfig)

    // Determine if flagged
    const flagged = matches.length > 0

    const result = this.createResult(
      flagged,
      totalScore,
      matches,
      this.generateReason(matches, totalScore),
      shouldBlock,
      severity
    )

    // Add to review queue if flagged
    if (flagged && addToReviewQueue) {
      reviewQueue.add(result, output, agentType)
    }

    return result
  }

  /**
   * Filter a stream of chunks (for streaming responses)
   *
   * @param chunks - Array of output chunks to filter
   * @param agentType - Optional agent type for context-aware filtering
   * @returns Filter result for the combined chunks
   */
  filterChunks(chunks: string[], agentType?: string): FilterResult {
    const combined = chunks.join('')
    return this.filter(combined, agentType)
  }

  /**
   * Check if output is allowlisted
   *
   * @param output - The output to check
   * @param config - The filter configuration
   * @returns True if output matches allowlist pattern
   */
  private isAllowlisted(output: string, config: OutputFilterConfig): boolean {
    if (config.allowlist.length === 0) {
      return false
    }

    // Check if any allowlist pattern matches the output
    for (const pattern of config.allowlist) {
      try {
        const regex = new RegExp(pattern, 'i')
        if (regex.test(output)) {
          return true
        }
      } catch (e) {
        // Log warning for invalid regex pattern
        console.warn(`[Output Filter] Invalid allowlist pattern: ${pattern}`, e)
      }
    }

    return false
  }

  /**
   * Check if there are non-allowlisted pattern matches in the output
   *
   * @param output - The output to check
   * @param config - The filter configuration
   * @param matchedPatterns - Patterns that were found
   * @returns True if there are matches outside allowlisted content
   */
  private hasNonAllowlistedMatches(output: string, config: OutputFilterConfig, matchedPatterns: OutputPatternMatch[]): boolean {
    // If no patterns matched, or no allowlist, there's nothing to check
    if (matchedPatterns.length === 0 || config.allowlist.length === 0) {
      return false
    }

    // Find all allowlisted regions in the output
    const allowlistedRegions: Array<{ start: number; end: number }> = []
    for (const allowlistPattern of config.allowlist) {
      try {
        const regex = new RegExp(allowlistPattern, 'gi')
        let match: RegExpExecArray | null
        while ((match = regex.exec(output)) !== null) {
          allowlistedRegions.push({ start: match.index, end: match.index + match[0].length })
        }
      } catch {
        // Invalid regex, skip
      }
    }

    // If no allowlisted regions found, all patterns are non-allowlisted
    if (allowlistedRegions.length === 0) {
      return true
    }

    // Check each matched pattern - if any match is outside allowlisted regions, return true
    for (const match of matchedPatterns) {
      const matchStart = match.position
      const matchEnd = match.position + match.match.length

      // Check if this match is within any allowlisted region
      const isInAllowlisted = allowlistedRegions.some(
        region => matchStart >= region.start && matchEnd <= region.end
      )

      if (!isInAllowlisted) {
        return true
      }
    }

    return false
  }

  /**
   * Check a specific pattern category against the output
   *
   * Creates fresh regex instances to avoid state issues with global patterns.
   *
   * @param output - The output to check
   * @param category - The pattern category to check
   * @param patterns - Array of patterns for this category
   * @returns Array of pattern matches
   */
  private checkCategory(
    output: string,
    category: OutputPatternCategory,
    patterns: RegExp[]
  ): OutputPatternMatch[] {
    const matches: OutputPatternMatch[] = []

    for (const pattern of patterns) {
      // Create a fresh regex instance to avoid state issues with global patterns
      // This ensures clean state for each check and better performance
      const freshPattern = new RegExp(pattern.source, pattern.flags)

      let match: RegExpExecArray | null
      while ((match = freshPattern.exec(output)) !== null) {
        matches.push({
          category,
          pattern: pattern.source,
          match: match[0] || '',
          position: match.index,
          severity: this.getCategorySeverity(category),
        })
      }
    }

    return matches
  }

  /**
   * Get severity level for a category
   *
   * @param category - The pattern category
   * @returns Severity level
   */
  private getCategorySeverity(category: OutputPatternCategory): OutputSeverityLevel {
    const score = CATEGORY_SEVERITY[category]
    if (score >= SEVERITY_THRESHOLDS.critical) return 'critical'
    if (score >= SEVERITY_THRESHOLDS.high) return 'high'
    if (score >= SEVERITY_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  /**
   * Calculate severity from total score
   *
   * Maps cumulative detection scores to severity levels using the defined thresholds:
   * - critical: score >= 90
   * - high: score >= 70
   * - medium: score >= 50
   * - low: score < 50
   *
   * @param score - The total detection score
   * @returns Severity level based on threshold mapping
   */
  private calculateSeverity(score: number): OutputSeverityLevel {
    if (score >= SEVERITY_THRESHOLDS.critical) return 'critical'
    if (score >= SEVERITY_THRESHOLDS.high) return 'high'
    if (score >= SEVERITY_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  /**
   * Determine if output should be blocked based on severity
   *
   * @param severity - The detected severity
   * @param config - The filter configuration
   * @returns True if output should be blocked
   */
  private shouldBlock(severity: OutputSeverityLevel, config: OutputFilterConfig): boolean {
    return (
      (severity === 'critical' && config.blockCritical) ||
      (severity === 'high' && config.blockHigh)
    )
  }

  /**
   * Create a filter result object
   *
   * @param flagged - Whether suspicious patterns were found
   * @param score - The detection score
   * @param patterns - Array of pattern matches
   * @param reason - Human-readable reason
   * @param shouldBlock - Whether to block the output
   * @param severity - The severity level
   * @returns Filter result object
   */
  private createResult(
    flagged: boolean,
    score: number,
    patterns: OutputPatternMatch[],
    reason: string,
    shouldBlock?: boolean,
    severity?: OutputSeverityLevel
  ): FilterResult {
    const calculatedSeverity = severity || this.calculateSeverity(score)
    const calculatedShouldBlock = shouldBlock !== undefined ? shouldBlock : this.shouldBlock(calculatedSeverity, this.config)

    return {
      flagged,
      severity: calculatedSeverity,
      patterns,
      reason,
      shouldBlock: calculatedShouldBlock,
      score,
    }
  }

  /**
   * Generate human-readable reason from matches
   *
   * @param matches - Array of pattern matches
   * @param score - Total detection score
   * @returns Human-readable reason string
   */
  private generateReason(matches: OutputPatternMatch[], score: number): string {
    if (matches.length === 0) {
      return 'No suspicious patterns detected'
    }

    // Count matches by category
    const categoryCounts: Record<string, number> = {}
    for (const match of matches) {
      categoryCounts[match.category] = (categoryCounts[match.category] || 0) + 1
    }

    // Get top categories
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ')

    return `Suspicious patterns detected in: ${topCategories}. Score: ${score}`
  }

  /**
   * Sanitize output for logging (truncates long outputs)
   *
   * @param output - The output to sanitize
   * @returns Sanitized output string
   */
  sanitizeForLog(output: string): string {
    if (output.length <= this.config.truncateLogLength) {
      return output
    }
    return output.substring(0, this.config.truncateLogLength) + '...'
  }

  /**
   * Log a flagged output to the audit trail
   *
   * @param result - The filter result
   * @param originalOutput - The original output (will be sanitized)
   * @param agentType - Optional agent type
   */
  logFlaggedOutput(result: FilterResult, originalOutput: string, agentType?: string): void {
    const timestamp = new Date().toISOString()
    const sanitizedOutput = this.sanitizeForLog(originalOutput)

    const logEntry = {
      timestamp,
      event_type: 'output_filtered',
      severity: result.severity,
      score: result.score,
      shouldBlock: result.shouldBlock,
      pattern_count: result.patterns.length,
      patterns: result.patterns.slice(0, 5).map((p) => ({
        category: p.category,
        match: p.match.substring(0, 50),
      })),
      reason: result.reason,
      agent_type: agentType || 'unknown',
      output_preview: sanitizedOutput,
    }

    console.warn('[Output Filter]', JSON.stringify(logEntry))
  }

  /**
   * Create a blocked response
   *
   * @param result - The filter result
   * @returns Filtered response with blocked flag
   */
  createBlockedResponse<T = unknown>(result: FilterResult): FilteredResponse<T> {
    return {
      success: false,
      blocked: true,
      filterInfo: {
        severity: result.severity,
        patterns: result.patterns.map((p) => `${p.category}:${p.pattern.substring(0, 30)}`),
        reason: result.reason,
      },
    }
  }

  /**
   * Create a warning response (output passes but with warning)
   *
   * @param data - The original data
   * @param result - The filter result
   * @returns Filtered response with warning flag
   */
  createWarningResponse<T = unknown>(data: T, result: FilterResult): FilteredResponse<T> {
    return {
      success: true,
      data,
      warning: `Suspicious content detected: ${result.reason}`,
      blocked: false,
      filterInfo: {
        severity: result.severity,
        patterns: result.patterns.map((p) => `${p.category}:${p.pattern.substring(0, 30)}`),
        reason: result.reason,
      },
    }
  }

  /**
   * Create a safe response (no issues detected)
   *
   * @param data - The original data
   * @returns Filtered response with success flag
   */
  createSafeResponse<T = unknown>(data: T): FilteredResponse<T> {
    return {
      success: true,
      data,
      blocked: false,
    }
  }

  /**
   * Wrap and filter an agent response
   *
   * @param response - The agent response object with content field
   * @param agentType - Optional agent type (will be extracted from response.agent if not provided)
   * @returns Filtered response
   */
  wrapResponse<T extends AgentResponse>(
    response: T,
    agentType?: string
  ): FilteredResponse<T> {
    if (!response.content) {
      return this.createSafeResponse(response)
    }

    // Extract agent type from response if not explicitly provided
    const effectiveAgentType = agentType || response.agent

    const result = this.filter(response.content, effectiveAgentType)

    if (result.shouldBlock) {
      this.logFlaggedOutput(result, response.content, effectiveAgentType)
      return this.createBlockedResponse(result)
    }

    // Only return warning response for medium and higher severity
    // Low severity is logged but doesn't affect the response
    if (result.flagged && result.severity !== 'low') {
      this.logFlaggedOutput(result, response.content, effectiveAgentType)
      return this.createWarningResponse(response, result)
    }

    // Log low severity if configured to do so
    if (result.flagged && result.severity === 'low' && this.config.logLow) {
      this.logFlaggedOutput(result, response.content, effectiveAgentType)
    }

    return this.createSafeResponse(response)
  }

  /**
   * Update filter configuration
   *
   * @param config - Partial configuration to merge
   */
  updateConfig(config: Partial<OutputFilterConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   *
   * @returns Current filter configuration
   */
  getConfig(): OutputFilterConfig {
    return { ...this.config }
  }
}

/**
 * Default singleton instance
 */
export const outputFilter = new OutputFilter()

/**
 * Convenience function to filter output
 *
 * @param output - The output to filter
 * @param config - Optional configuration override
 * @returns Filter result
 */
export function filterOutput(
  output: string,
  config?: Partial<OutputFilterConfig>
): FilterResult {
  const filter = config ? new OutputFilter(config) : outputFilter
  return filter.filter(output)
}

/**
 * Convenience function to wrap and filter a response
 *
 * @param response - The response object
 * @param agentType - Optional agent type
 * @param config - Optional configuration override
 * @returns Filtered response
 */
export function wrapFilteredResponse<T extends AgentResponse>(
  response: T,
  agentType?: string,
  config?: Partial<OutputFilterConfig>
): FilteredResponse<T> {
  const filter = config ? new OutputFilter(config) : outputFilter
  return filter.wrapResponse(response, agentType)
}
