/**
 * Text Simplifier
 * Story 7.2: Executive Brief Template
 *
 * Transforms technical content into business-friendly language.
 * Handles jargon translation, acronym expansion, and bullet formatting.
 */

import { findAllTranslations, expandAcronym } from './jargon-dictionary'

/**
 * Configuration for text simplification
 */
export interface SimplifierConfig {
  /** Whether to translate technical jargon to business terms */
  translateJargon: boolean
  /** Whether to expand acronyms on first use */
  expandAcronyms: boolean
  /** Whether to format as concise bullet points */
  useBullets: boolean
  /** Maximum number of bullets (0 = no limit) */
  maxBullets?: number
  /** Maximum characters per bullet (0 = no limit) */
  maxCharsPerBullet?: number
  /** Maximum characters total (0 = no limit) */
  maxCharsTotal?: number
}

/**
 * Default configuration for executive brief simplification
 */
export const DEFAULT_EXECUTIVE_CONFIG: SimplifierConfig = {
  translateJargon: true,
  expandAcronyms: true,
  useBullets: false,
}

/**
 * Default configuration for bullet point sections
 */
export const DEFAULT_BULLET_CONFIG: SimplifierConfig = {
  translateJargon: true,
  expandAcronyms: true,
  useBullets: true,
  maxBullets: 5,
  maxCharsPerBullet: 120,
}

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param text - Text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0 || text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3).trim() + '...'
}

/**
 * Format text as bullet points
 * @param text - Input text (can be bullets, paragraphs, or comma-separated)
 * @param maxBullets - Maximum number of bullets (0 = no limit)
 * @param maxCharsPerBullet - Maximum characters per bullet (0 = no limit)
 * @returns Formatted bullet points
 */
export function formatAsBullets(
  text: string,
  maxBullets: number = 0,
  maxCharsPerBullet: number = 0
): string[] {
  // Split by common delimiters
  let bullets: string[] = []

  // Try splitting by existing bullet markers
  const bulletPatterns = [
    /\n•\s*/,      // • bullet
    /\n-\s*/,      // - bullet
    /\n\*\s*/,     // * bullet
    /\n\d+\.\s*/,  // 1. numbered
    /\n;\s*/,      // ; semicolon
  ]

  let splitByBullet = false
  for (const pattern of bulletPatterns) {
    if (pattern.test(text)) {
      bullets = text.split(pattern).filter(b => b.trim().length > 0)
      splitByBullet = true
      break
    }
  }

  // If no bullet pattern found, split by newlines or commas
  if (!splitByBullet) {
    if (text.includes('\n')) {
      bullets = text.split('\n').filter(b => b.trim().length > 0)
    } else if (text.includes(',')) {
      bullets = text.split(',').filter(b => b.trim().length > 0)
    } else {
      // Single paragraph, return as is
      bullets = [text]
    }
  }

  // Clean up bullets
  bullets = bullets.map(b => b.trim()).filter(b => b.length > 0)

  // Remove common bullet prefixes if present
  bullets = bullets.map(b => {
    return b.replace(/^[•\-\*\d+\.\s]+/, '').trim()
  })

  // Apply character limit per bullet
  if (maxCharsPerBullet > 0) {
    bullets = bullets.map(b => truncateText(b, maxCharsPerBullet))
  }

  // Apply bullet count limit
  if (maxBullets > 0 && bullets.length > maxBullets) {
    bullets = bullets.slice(0, maxBullets)
    const last = truncateText(bullets[maxBullets - 1], maxCharsPerBullet > 0 ? maxCharsPerBullet - 10 : 110)
    bullets[maxBullets - 1] = last
  }

  return bullets
}

/**
 * Translate technical jargon to business-friendly terms
 * @param text - Text containing technical jargon
 * @returns Text with jargon replaced by business terms
 */
export function translateJargon(text: string): string {
  let result = text
  const translations = findAllTranslations(text)

  // Replace each occurrence with its business-friendly translation
  for (const [technical, business] of translations.entries()) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${technical}\\b`, 'gi')
    result = result.replace(regex, business)
  }

  return result
}

/**
 * Expand acronyms on first use
 * @param text - Text containing acronyms
 * @returns Text with acronyms expanded on first use
 */
export function expandAcronymsFirstUse(text: string): string {
  const expandedAcronyms = new Set<string>()

  return text.replace(/\b([A-Z]{2,})\b/g, (match) => {
    const upperMatch = match.toUpperCase()
    // Don't expand common words
    if (['THE', 'AND', 'OR', 'FOR', 'WITH', 'FROM', 'TO', 'OF', 'IN', 'AT', 'ON', 'AS', 'BY'].includes(upperMatch)) {
      return match
    }

    // Only expand once per acronym
    if (!expandedAcronyms.has(upperMatch)) {
      const expansion = expandAcronym(upperMatch)
      if (expansion) {
        expandedAcronyms.add(upperMatch)
        return `${match} (${expansion})`
      }
    }

    return match
  })
}

/**
 * Simplify text for executive audience
 * @param text - Technical text to simplify
 * @param config - Simplification configuration
 * @returns Simplified text or bullet points
 */
export function simplifyText(
  text: string,
  config: SimplifierConfig = DEFAULT_EXECUTIVE_CONFIG
): string | string[] {
  let result = text

  // Step 1: Translate jargon
  if (config.translateJargon) {
    result = translateJargon(result)
  }

  // Step 2: Expand acronyms
  if (config.expandAcronyms) {
    result = expandAcronymsFirstUse(result)
  }

  // Step 3: Apply total character limit
  if (config.maxCharsTotal && config.maxCharsTotal > 0) {
    result = truncateText(result, config.maxCharsTotal)
  }

  // Step 4: Format as bullets if requested
  if (config.useBullets) {
    const bullets = formatAsBullets(
      result,
      config.maxBullets || 0,
      config.maxCharsPerBullet || 0
    )
    return bullets
  }

  return result
}

/**
 * Count words in text
 * @param text - Text to count
 * @returns Word count
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Approximates reading difficulty for English text
 * @param text - Text to analyze
 * @returns Grade level (approximately)
 */
export function fleschKincaidGrade(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) {
    return 0
  }

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Flesch-Kincaid formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  return Math.round((0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59 * 10) / 10
}

/**
 * Count syllables in a word (approximation)
 * @param word - Word to analyze
 * @returns Approximate syllable count
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1

  const matches = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g)

  return matches ? matches.length : 1
}

/**
 * Check if text meets readability target (Grade 8-10 for executives)
 * @param text - Text to check
 * @returns Whether text is within target grade level
 */
export function isReadableForExecutives(text: string): boolean {
  const grade = fleschKincaidGrade(text)
  return grade >= 8 && grade <= 12
}
