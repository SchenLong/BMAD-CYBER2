/**
 * Content Truncator
 * Story 7.2: Executive Brief Template
 *
 * Enforces length constraints for one-page template output.
 */

/**
 * One-page layout constraints (Letter size)
 * Story 7.2: Exported for consistent usage across components
 */
export const ONE_PAGE_MAX_WORDS = 800
export const ONE_PAGE_MAX_CHARS = 4500

export interface TruncationConfig {
  /** Maximum character count */
  maxChars?: number
  /** Maximum word count */
  maxWords?: number
  /** Truncation suffix */
  suffix?: string
  /** Whether to preserve sentence boundaries */
  preserveSentence?: boolean
}

/**
 * Default config for executive brief sections
 */
export const DEFAULT_TRUNCATION_CONFIG: TruncationConfig = {
  maxChars: 150,
  maxWords: 30,
  suffix: '...',
  preserveSentence: true,
}

/**
 * Truncate text to maximum characters
 * @param text - Text to truncate
 * @param maxChars - Maximum characters
 * @param suffix - Suffix to add if truncated
 * @param preserveSentence - Whether to end at sentence boundary
 * @returns Truncated text
 */
export function truncateToChars(
  text: string,
  maxChars: number,
  suffix: string = '...',
  preserveSentence: boolean = false
): string {
  if (text.length <= maxChars) {
    return text
  }

  let truncated = text.slice(0, maxChars - suffix.length)

  if (preserveSentence) {
    // Try to end at a sentence boundary
    const lastPeriod = truncated.lastIndexOf('.')
    const lastExclamation = truncated.lastIndexOf('!')
    const lastQuestion = truncated.lastIndexOf('?')
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)

    if (lastSentenceEnd > maxChars * 0.5) {
      // Only use sentence end if it's not too far back
      truncated = truncated.slice(0, lastSentenceEnd + 1)
    } else {
      // Try word boundary
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > maxChars * 0.7) {
        truncated = truncated.slice(0, lastSpace)
      }
    }
  } else {
    // Try word boundary
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > maxChars * 0.7) {
      truncated = truncated.slice(0, lastSpace)
    }
  }

  return truncated.trim() + suffix
}

/**
 * Truncate text to maximum words
 * @param text - Text to truncate
 * @param maxWords - Maximum words
 * @param suffix - Suffix to add if truncated
 * @returns Truncated text
 */
export function truncateToWords(
  text: string,
  maxWords: number,
  suffix: string = '...'
): string {
  const words = text.trim().split(/\s+/)

  if (words.length <= maxWords) {
    return text
  }

  return words.slice(0, maxWords).join(' ') + suffix
}

/**
 * Truncate text based on config
 * @param text - Text to truncate
 * @param config - Truncation configuration
 * @returns Truncated text
 */
export function truncateContent(
  text: string,
  config: TruncationConfig = DEFAULT_TRUNCATION_CONFIG
): string {
  const {
    maxChars = 0,
    maxWords = 0,
    suffix = '...',
    preserveSentence = true,
  } = config

  let result = text

  // Apply character limit first
  if (maxChars > 0) {
    result = truncateToChars(result, maxChars, '', preserveSentence)
  }

  // Then apply word limit
  if (maxWords > 0) {
    result = truncateToWords(result, maxWords, '')
  }

  // Add suffix if truncated
  if (result !== text && suffix) {
    result = result.trim() + suffix
  }

  return result
}

/**
 * Count characters in text
 * @param text - Text to count
 * @returns Character count
 */
export function countChars(text: string): number {
  return text.length
}

/**
 * Count words in text
 * @param text - Text to count
 * @returns Word count
 */
export function countWordsInText(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Calculate total content metrics
 * @param sections - Object with section content
 * @returns Metrics for each section and total
 */
export interface ContentMetrics {
  totalChars: number
  totalWords: number
  sections: Record<string, { chars: number; words: number }>
}

export function calculateContentMetrics(
  sections: Record<string, string>
): ContentMetrics {
  const metrics: ContentMetrics = {
    totalChars: 0,
    totalWords: 0,
    sections: {},
  }

  for (const [sectionId, content] of Object.entries(sections)) {
    const chars = countChars(content)
    const words = countWordsInText(content)

    metrics.sections[sectionId] = { chars, words }
    metrics.totalChars += chars
    metrics.totalWords += words
  }

  return metrics
}

/**
 * Check if content fits on one page
 * Based on typical one-page constraints (800 words, ~4500 characters)
 * @param metrics - Content metrics
 * @returns Whether content fits on one page
 */
export function fitsOnOnePage(metrics: ContentMetrics): boolean {
  return metrics.totalWords <= ONE_PAGE_MAX_WORDS && metrics.totalChars <= ONE_PAGE_MAX_CHARS
}

/**
 * Estimate page count for content
 * @param metrics - Content metrics
 * @returns Estimated page count
 */
export function estimatePageCount(metrics: ContentMetrics): number {
  const wordPages = Math.ceil(metrics.totalWords / ONE_PAGE_MAX_WORDS)
  const charPages = Math.ceil(metrics.totalChars / ONE_PAGE_MAX_CHARS)

  return Math.max(wordPages, charPages)
}

/**
 * Truncate sections to fit on one page
 * Distributes available space proportionally
 * @param sections - Object with section content
 * @param priorities - Section priorities (higher = more space)
 * @returns Truncated sections
 */
export function truncateToOnePage(
  sections: Record<string, string>,
  priorities: Record<string, number> = {}
): Record<string, string> {
  const metrics = calculateContentMetrics(sections)

  if (fitsOnOnePage(metrics)) {
    return sections
  }

  const availableWords = ONE_PAGE_MAX_WORDS * 0.9 // Leave 10% margin

  // Calculate total priority
  const totalPriority = Object.values(priorities).reduce((sum, p) => sum + p, 0)
  const defaultPriority = totalPriority > 0 ? 0 : 1
  const effectivePriority = totalPriority > 0 ? totalPriority : Object.keys(sections).length

  // Allocate words to each section
  const result: Record<string, string> = {}
  let allocatedWords = 0

  for (const [sectionId, content] of Object.entries(sections)) {
    const priority = priorities[sectionId] || defaultPriority
    const sectionRatio = priority / effectivePriority
    const maxSectionWords = Math.floor(availableWords * sectionRatio)

    // Truncate section to allocated words
    const currentWords = countWordsInText(content)
    if (currentWords > maxSectionWords) {
      result[sectionId] = truncateToWords(content, maxSectionWords, '...')
    } else {
      result[sectionId] = content
    }

    allocatedWords += countWordsInText(result[sectionId])
  }

  return result
}
