/**
 * Markdown Renderer
 * Story 7.5: Template Rendering Engine - Task 4
 *
 * Renders template data as markdown with proper formatting,
 * syntax highlighting, and structure.
 */

import type { Template, AgentOutput, BrandingConfig } from '@/types/template-render'
import { formatConciseText, formatConciseFindings, formatConciseRecommendations, extractRiskLevel, calculateRiskBreakdown, formatExecutiveMetadata } from '../formatters/concise-formatter'
import { formatDetailedText, formatDetailedFindings, formatMethodology, formatDataCollection, formatAnalysis, formatDetailedRecommendations, formatAppendices, formatTechnicalMetadata } from '../formatters/detailed-formatter'
import { extractString, extractArray } from '../formatters/missing-data-handler'
// Note: TOC, code highlighting, and table generation would be implemented in separate modules
// For now, we provide simplified implementations

/**
 * Generate simple table of contents
 */
function generateTableOfContents(sections: Template['sections'], maxDepth = 3): string {
  const lines = ['## Table of Contents', '']
  for (const section of sections) {
    lines.push(`- [${section.title}](#${section.id.toLowerCase().replace(/\s+/g, '-')})`)
  }
  return lines.join('\n')
}

/**
 * Render options for markdown output
 */
export interface MarkdownRenderOptions {
  /** Include front matter */
  includeFrontMatter?: boolean
  /** Include table of contents */
  includeTOC?: boolean
  /** TOC max depth */
  tocMaxDepth?: number
  /** Branding configuration */
  branding?: BrandingConfig
  /** Concise mode (true) or detailed (false) */
  concise?: boolean
}

/**
 * Render agent output as markdown using template
 * @param template - Template to use
 * @param output - Agent output data
 * @param options - Render options
 * @returns Rendered markdown
 */
export function renderMarkdown(
  template: Template,
  output: AgentOutput,
  options: MarkdownRenderOptions = {}
): string {
  const {
    includeFrontMatter = true,
    includeTOC = true,
    tocMaxDepth = 3,
    branding,
    concise = template.onePage || false,
  } = options

  const sections: string[] = []

  // Front matter
  if (includeFrontMatter) {
    sections.push(generateFrontMatter(template, output, branding))
  }

  // Title and header
  sections.push(generateHeader(template, output, branding))

  // Table of contents
  if (includeTOC) {
    sections.push(generateTableOfContents(template.sections, tocMaxDepth))
  }

  // Render each section
  for (const section of template.sections) {
    const sectionContent = renderSection(section, output, concise)
    if (sectionContent) {
      sections.push(sectionContent)
    }
  }

  // Footer
  if (branding?.includeFooter !== false) {
    sections.push(generateFooter(branding))
  }

  return sections.filter(Boolean).join('\n\n')
}

/**
 * Generate YAML front matter
 */
function generateFrontMatter(
  template: Template,
  output: AgentOutput,
  branding?: BrandingConfig
): string {
  const metadata = {
    title: template.name,
    description: template.description,
    date: output.metadata?.timestamp || new Date().toISOString(),
    template: template.id,
    ...(branding?.organization && { organization: branding.organization }),
    ...(output.agent && { agent: output.agent }),
    ...(output.workflow && { workflow: output.workflow }),
  }

  const frontMatter = Object.entries(metadata)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')

  return `---\n${frontMatter}\n---`
}

/**
 * Generate document header
 */
function generateHeader(
  template: Template,
  output: AgentOutput,
  branding?: BrandingConfig
): string {
  const lines: string[] = []

  // Title
  lines.push(`# ${template.name}`)
  lines.push('')

  // Logo (if provided)
  if (branding?.logo) {
    lines.push(`<div align="center">`)
    lines.push(`<img src="${branding.logo}" alt="${branding.organization || 'Logo'}" width="200" />`)
    lines.push(`</div>`)
    lines.push('')
  }

  // Description
  if (template.description) {
    lines.push(`*${template.description}*`)
    lines.push('')
  }

  // Metadata block
  const date = output.metadata?.timestamp
    ? new Date(output.metadata.timestamp).toLocaleDateString()
    : new Date().toLocaleDateString()

  const meta: string[] = [`**Date:** ${date}`]

  if (output.agent) {
    meta.push(`**Agent:** ${output.agent}`)
  }

  if (output.workflow) {
    meta.push(`**Workflow:** ${output.workflow}`)
  }

  if (branding?.organization) {
    meta.push(`**Organization:** ${branding.organization}`)
  }

  lines.push(meta.join(' | '))

  return lines.join('\n')
}

/**
 * Render a single section
 */
function renderSection(
  section: Template['sections'][number],
  output: AgentOutput,
  concise: boolean
): string {
  const lines: string[] = []

  // Section header
  lines.push(`## ${section.title}`)
  lines.push('')

  // Section description
  if (section.description) {
    lines.push(`*${section.description}*`)
    lines.push('')
  }

  // Get section content based on section ID
  const content = getSectionContent(section.id, output, concise)

  if (content) {
    lines.push(content)
  } else if (section.required) {
    lines.push('*No data available*')
  }

  return lines.join('\n')
}

/**
 * Get content for a specific section
 */
function getSectionContent(
  sectionId: string,
  output: AgentOutput,
  concise: boolean
): string | null {
  switch (sectionId) {
    case 'executive-summary':
      return concise
        ? formatConciseText(output.summary || output.assessment)
        : formatDetailedText(output.summary)

    case 'key-findings':
      if (concise) {
        const findings = formatConciseFindings(
          output.findings?.map(f =>
            f.title ? `${f.title}: ${f.description || ''}` : f.description || ''
          ),
          5
        )
        return findings.map(f => `- ${f}`).join('\n')
      } else {
        return formatDetailedFindings(output.findings)
      }

    case 'risk-rating':
    case 'risk-assessment':
      const risk = extractRiskLevel(output)
      const breakdown = calculateRiskBreakdown(output)
      const lines = [
        `**Overall Risk Level:** ${risk.toUpperCase()}`,
        '',
        '**Breakdown:**',
        `- Critical: ${breakdown.critical}`,
        `- High: ${breakdown.high}`,
        `- Medium: ${breakdown.medium}`,
        `- Low: ${breakdown.low}`,
        `- Info: ${breakdown.info}`,
      ]
      return lines.join('\n')

    case 'recommendations':
      if (concise) {
        return formatConciseRecommendations(output.recommendations, 4)
          .map((r, i) => `${i + 1}. ${r}`)
          .join('\n')
      } else {
        return formatDetailedRecommendations(output.recommendations)
          .map((r, i) => `${i + 1}. ${r}`)
          .join('\n')
      }

    case 'methodology':
      return formatMethodology(output)

    case 'data-collection':
      return formatDataCollection(output)

    case 'analysis':
      return formatAnalysis(output)

    case 'findings':
      return formatDetailedFindings(output.findings)

    case 'appendices':
      return formatAppendices(output)

    default:
      // Try to get from rawData
      if (output.rawData && sectionId in output.rawData) {
        const value = output.rawData[sectionId]
        if (typeof value === 'string') {
          return value
        }
        return JSON.stringify(value, null, 2)
      }
      return null
  }
}

/**
 * Generate document footer
 */
function generateFooter(branding?: BrandingConfig): string {
  const lines: string[] = []
  lines.push('---')
  lines.push('')

  if (branding?.organization) {
    lines.push(`*Generated by ${branding.organization}*`)
  } else {
    lines.push('*Generated by BMAD System*')
  }

  lines.push(`*${new Date().toLocaleString()}*`)

  if (branding?.footerText) {
    lines.push('')
    lines.push(branding.footerText)
  }

  return lines.join('\n')
}

/**
 * Render markdown with code highlighting
 * @param markdown - Raw markdown
 * @param language - Language for syntax highlighting
 * @returns Markdown with highlighted code blocks
 */
export function renderWithHighlighting(
  markdown: string,
  language = 'typescript'
): string {
  // Find code blocks and apply highlighting
  return markdown.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const effectiveLang = lang || language
      return '```' + effectiveLang + '\n' + code + '```'
    }
  )
}

/**
 * Generate markdown table from data
 * @param headers - Table headers
 * @param rows - Table rows
 * @returns Markdown table
 */
export function renderMarkdownTable(
  headers: string[],
  rows: string[][]
): string {
  const lines: string[] = []

  // Header row
  lines.push('| ' + headers.join(' | ') + ' |')
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |')

  // Data rows
  for (const row of rows) {
    lines.push('| ' + row.map(cell => cell || '').join(' | ') + ' |')
  }

  return lines.join('\n')
}

/**
 * Truncate markdown to word count
 * @param markdown - Markdown content
 * @param maxWords - Maximum word count
 * @returns Truncated markdown
 */
export function truncateToWordCount(markdown: string, maxWords: number): string {
  const words = markdown.split(/\s+/)

  if (words.length <= maxWords) {
    return markdown
  }

  // Find a good break point (end of sentence)
  let breakPoint = maxWords
  for (let i = maxWords - 1; i >= maxWords - 50 && i >= 0; i--) {
    if (words[i].endsWith('.')) {
      breakPoint = i + 1
      break
    }
  }

  return words.slice(0, breakPoint).join(' ') + '\n\n[Content truncated...]'
}

/**
 * Count words in markdown
 * @param markdown - Markdown content
 * @returns Word count
 */
export function countMarkdownWords(markdown: string): number {
  // Remove code blocks for counting
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, '')
  // Count words
  return withoutInlineCode.split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Count characters in markdown
 * @param markdown - Markdown content
 * @returns Character count
 */
export function countMarkdownCharacters(markdown: string): number {
  return markdown.length
}
