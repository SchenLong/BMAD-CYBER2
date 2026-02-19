/**
 * Bullet Formatter
 * Story 7.2: Executive Brief Template
 *
 * Formats content as concise bullet points optimized for executive briefs.
 */

export interface BulletFormatConfig {
  /** Maximum number of bullets (0 = no limit) */
  maxBullets?: number
  /** Maximum characters per bullet (0 = no limit) */
  maxCharsPerBullet?: number
  /** Maximum sentences per bullet (0 = no limit) */
  maxSentencesPerBullet?: number
  /** Bullet character to use */
  bulletChar?: '•' | '-' | '*' | '1'
}

/**
 * Default config for executive brief bullet points
 */
export const DEFAULT_FORMAT_CONFIG: BulletFormatConfig = {
  maxBullets: 5,
  maxCharsPerBullet: 120,
  maxSentencesPerBullet: 3,
  bulletChar: '•',
}

/**
 * Split text into sentences
 * @param text - Text to split
 * @returns Array of sentences
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * Format a single bullet point with constraints
 * @param text - Text to format
 * @param maxChars - Maximum characters
 * @param maxSentences - Maximum sentences
 * @returns Formatted bullet text
 */
function formatSingleBullet(
  text: string,
  maxChars: number = 0,
  maxSentences: number = 0
): string {
  let result = text.trim()

  // Limit sentences
  if (maxSentences > 0) {
    const sentences = splitSentences(result)
    if (sentences.length > maxSentences) {
      result = sentences.slice(0, maxSentences).join('. ')
    }
  }

  // Limit characters
  if (maxChars > 0 && result.length > maxChars) {
    result = result.slice(0, maxChars - 3).trim() + '...'
  }

  return result
}

/**
 * Format text as bullet points
 * @param text - Input text (bullets, paragraphs, or comma-separated)
 * @param config - Formatting configuration
 * @returns Array of formatted bullet points
 */
export function formatAsBulletPoints(
  text: string,
  config: BulletFormatConfig = DEFAULT_FORMAT_CONFIG
): string[] {
  const {
    maxBullets = 0,
    maxCharsPerBullet = 0,
    maxSentencesPerBullet = 0,
    bulletChar = '•',
  } = config

  // Split input into potential bullets
  let bullets: string[] = []

  // Try various split patterns
  const patterns = [
    { regex: /\n•\s*/, priority: 1 },      // • bullets
    { regex: /\n-\s*/, priority: 2 },      // - bullets
    { regex: /\n\*\s*/, priority: 3 },     // * bullets
    { regex: /\n\d+\.\s*/, priority: 4 },  // 1. numbered
    { regex: /\n;\s*/, priority: 5 },      // ; semicolon
  ]

  let matched = false
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      bullets = text.split(pattern.regex).filter(b => b.trim().length > 0)
      matched = true
      break
    }
  }

  // Fallback: split by newlines or commas
  if (!matched) {
    if (text.includes('\n\n')) {
      // Split by double newlines (paragraphs)
      bullets = text.split('\n\n').filter(b => b.trim().length > 0)
    } else if (text.includes('\n')) {
      bullets = text.split('\n').filter(b => b.trim().length > 0)
    } else if (text.includes(',')) {
      bullets = text.split(',').filter(b => b.trim().length > 0)
    } else {
      bullets = [text]
    }
  }

  // Clean each bullet
  bullets = bullets.map(b => {
    // Remove existing bullet markers
    b = b.replace(/^[•\-\*\d+\.\s]+/, '').trim()
    // Remove leading/trailing whitespace
    b = b.trim()
    return b
  }).filter(b => b.length > 0)

  // Apply constraints to each bullet
  bullets = bullets.map(b =>
    formatSingleBullet(b, maxCharsPerBullet, maxSentencesPerBullet)
  )

  // Apply bullet count limit
  if (maxBullets > 0 && bullets.length > maxBullets) {
    bullets = bullets.slice(0, maxBullets)
    // Add ellipsis to last bullet to indicate truncation
    const lastBullet = bullets[maxBullets - 1]
    if (!lastBullet.endsWith('...')) {
      const ellipsisSpace = maxCharsPerBullet > 0 ? 4 : 0
      const availableChars = maxCharsPerBullet > 0
        ? maxCharsPerBullet - ellipsisSpace
        : lastBullet.length
      bullets[maxBullets - 1] = lastBullet.slice(0, availableChars).trim() + '...'
    }
  }

  // Add bullet characters if requested (for display purposes)
  if (bulletChar === '1') {
    // Numbered bullets
    return bullets.map((b, i) => `${i + 1}. ${b}`)
  } else {
    // Symbol bullets
    return bullets.map(b => `${bulletChar} ${b}`)
  }
}

/**
 * Format bullets as markdown string
 * @param bullets - Array of bullet points
 * @returns Markdown formatted string
 */
export function bulletsToMarkdown(bullets: string[]): string {
  return bullets.join('\n')
}

/**
 * Format bullets as HTML list
 * @param bullets - Array of bullet points
 * @returns HTML formatted string
 */
export function bulletsToHTML(bullets: string[]): string {
  const cleanBullets = bullets.map(b => b.replace(/^[•\-\*\d+\.]\s*/, '').trim())
  const listItems = cleanBullets.map(b => `  <li>${b}</li>`).join('\n')
  return `<ul>\n${listItems}\n</ul>`
}

/**
 * Count bullets that would result from text
 * @param text - Input text
 * @returns Estimated bullet count
 */
export function estimateBulletCount(text: string): number {
  const patterns = [
    /\n•\s*/,
    /\n-\s*/,
    /\n\*\s*/,
    /\n\d+\.\s*/,
  ]

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return (text.match(pattern) || []).length
    }
  }

  // Estimate by paragraph or sentence count
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  if (paragraphs.length > 1) {
    return paragraphs.length
  }

  return Math.min(splitSentences(text).length, 5)
}

/**
 * Validate if bullets meet executive brief constraints
 * @param bullets - Array of bullet points
 * @param constraints - Constraints to validate
 * @returns Whether bullets are valid
 */
export function validateBullets(
  bullets: string[],
  constraints: { maxBullets?: number; maxCharsPerBullet?: number }
): boolean {
  const { maxBullets = 0, maxCharsPerBullet = 0 } = constraints

  if (maxBullets > 0 && bullets.length > maxBullets) {
    return false
  }

  if (maxCharsPerBullet > 0) {
    if (bullets.some(b => b.replace(/^[•\-\*\d+\.]\s*/, '').trim().length > maxCharsPerBullet)) {
      return false
    }
  }

  return true
}
