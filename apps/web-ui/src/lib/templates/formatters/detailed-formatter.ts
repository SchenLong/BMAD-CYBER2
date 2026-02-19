/**
 * Detailed Formatter
 * Story 7.5: Template Rendering Engine - Task 2
 *
 * Formats content for technical report output with detailed,
 * comprehensive information and technical depth.
 */

import type {
  AgentOutput,
  FormattingRules,
} from '@/types/template-render'

/**
 * Default detailed formatting rules
 */
export const DEFAULT_DETAILED_RULES: FormattingRules = {
  conciseness: 'detailed',
  maxSectionLength: 5000,
  maxBulletPoints: 50,
  includeRawData: true,
  includeCodeExamples: true,
  technicalDepth: 'technical',
}

/**
 * Format text for technical report (detailed)
 * @param text - Input text
 * @param maxLength - Maximum length (default large for detailed)
 * @returns Formatted detailed text
 */
export function formatDetailedText(
  text: string | undefined,
  maxLength = 5000
): string {
  if (!text) {
    return 'No information provided.'
  }

  // For detailed output, we keep most of the content
  // Only truncate if it exceeds the max length significantly
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...'
  }

  return text
}

/**
 * Format findings for technical report
 * @param findings - Array of finding objects or strings
 * @returns Formatted detailed findings
 */
export function formatDetailedFindings(
  findings: Array<{ title?: string; description?: string; severity?: string; category?: string; evidence?: string }> | undefined
): string {
  if (!findings || findings.length === 0) {
    return 'No findings available.'
  }

  const sections: string[] = []

  for (const finding of findings) {
    const parts: string[] = []

    if (finding.severity) {
      parts.push(`**[${finding.severity.toUpperCase()}]**`)
    }

    if (finding.title) {
      parts.push(`### ${finding.title}`)
    } else if (finding.severity) {
      parts.push('### Finding')
    }

    if (finding.description) {
      parts.push(finding.description)
    }

    if (finding.category) {
      parts.push(`*Category: ${finding.category}*`)
    }

    if (finding.evidence) {
      parts.push(`**Evidence:** ${finding.evidence}`)
    }

    if (parts.length > 0) {
      sections.push(parts.join('\n\n'))
    }
  }

  return sections.join('\n\n---\n\n')
}

/**
 * Format methodology section for technical report
 * @param output - Agent output
 * @returns Formatted methodology section
 */
export function formatMethodology(output: AgentOutput): string {
  const sections: string[] = []

  // Approach
  if (output.methodology?.approach) {
    sections.push(`**Approach:**\n${output.methodology.approach}`)
  }

  // Tools
  if (output.methodology?.tools && output.methodology.tools.length > 0) {
    sections.push(`**Tools Used:**\n${output.methodology.tools.map(t => `- ${t}`).join('\n')}`)
  }

  // Scope
  if (output.methodology?.scope) {
    sections.push(`**Scope:**\n${output.methodology.scope}`)
  }

  // Techniques
  if (output.methodology?.techniques && output.methodology.techniques.length > 0) {
    sections.push(`**Techniques:**\n${output.methodology.techniques.map(t => `- ${t}`).join('\n')}`)
  }

  return sections.length > 0 ? sections.join('\n\n') : 'No methodology information provided.'
}

/**
 * Format data collection section for technical report
 * @param output - Agent output
 * @returns Formatted data collection section
 */
export function formatDataCollection(output: AgentOutput): string {
  const sections: string[] = []

  // Sources
  if (output.dataCollection?.sources && output.dataCollection.sources.length > 0) {
    sections.push(`**Data Sources:**\n${output.dataCollection.sources.map(s => `- ${s}`).join('\n')}`)
  }

  // Collection period
  if (output.dataCollection?.collectionPeriod) {
    sections.push(`**Collection Period:** ${output.dataCollection.collectionPeriod}`)
  }

  // Metadata
  if (output.dataCollection?.metadata) {
    const metadataEntries = Object.entries(output.dataCollection.metadata)
    if (metadataEntries.length > 0) {
      sections.push(`**Metadata:**`)
      for (const [key, value] of metadataEntries) {
        sections.push(`- ${key}: ${JSON.stringify(value)}`)
      }
    }
  }

  return sections.length > 0 ? sections.join('\n\n') : 'No data collection information provided.'
}

/**
 * Format analysis section for technical report
 * @param output - Agent output
 * @returns Formatted analysis section
 */
export function formatAnalysis(output: AgentOutput): string {
  const sections: string[] = []

  // Techniques
  if (output.analysis?.techniques && output.analysis.techniques.length > 0) {
    sections.push(`**Analysis Techniques:**\n${output.analysis.techniques.map(t => `- ${t}`).join('\n')}`)
  }

  // Processing
  if (output.analysis?.processing && output.analysis.processing.length > 0) {
    sections.push(`**Processing Steps:**`)
    for (let i = 0; i < output.analysis.processing.length; i++) {
      const step = output.analysis.processing[i]
      sections.push(`${i + 1}. ${JSON.stringify(step)}`)
    }
  }

  // Validation
  if (output.analysis?.validation && output.analysis.validation.length > 0) {
    sections.push(`**Validation Methods:**\n${output.analysis.validation.map(v => `- ${v}`).join('\n')}`)
  }

  return sections.length > 0 ? sections.join('\n\n') : 'No analysis information provided.'
}

/**
 * Format recommendations for technical report
 * @param recommendations - Array of recommendations
 * @param maxCount - Maximum number (default large for detailed)
 * @returns Formatted recommendations
 */
export function formatDetailedRecommendations(
  recommendations: string[] | undefined,
  maxCount = 50
): string[] {
  if (!recommendations || recommendations.length === 0) {
    return ['No specific recommendations provided.']
  }

  return recommendations.slice(0, maxCount)
}

/**
 * Format raw data appendices for technical report
 * @param output - Agent output
 * @returns Formatted appendices section
 */
export function formatAppendices(output: AgentOutput): string {
  const sections: string[] = []

  // Raw data (if included)
  if (output.rawData && Object.keys(output.rawData).length > 0) {
    sections.push('**Raw Data:**')
    sections.push('```json')
    sections.push(JSON.stringify(output.rawData, null, 2))
    sections.push('```')
  }

  // Full summary
  if (output.summary) {
    sections.push('**Full Summary:**')
    sections.push(output.summary)
  }

  return sections.length > 0 ? sections.join('\n\n') : 'No appendices data available.'
}

/**
 * Apply detailed formatting to section content
 * @param content - Section content
 * @param rules - Formatting rules
 * @returns Formatted content
 */
export function applyDetailedFormatting(
  content: string,
  rules: FormattingRules = DEFAULT_DETAILED_RULES
): string {
  let formatted = content

  // Truncate to max section length (if specified)
  if (rules.maxSectionLength && formatted.length > rules.maxSectionLength) {
    formatted = formatted.substring(0, rules.maxSectionLength - 3) + '\n\n[Content truncated due to length...]'
  }

  // Keep code examples if enabled
  if (!rules.includeCodeExamples) {
    // Remove code blocks
    formatted = formatted.replace(/```[\s\S]*?```/g, '[Code block omitted]')
  }

  return formatted
}

/**
 * Format metadata for technical report
 * @param output - Agent output
 * @returns Formatted metadata object
 */
export function formatTechnicalMetadata(output: AgentOutput): {
  reportType: string
  date: string
  preparedBy: string
  projectName?: string
  duration?: string
  agent?: string
} {
  return {
    reportType: 'Technical Report',
    date: output.metadata?.timestamp
      ? new Date(output.metadata.timestamp).toLocaleString()
      : new Date().toLocaleString(),
    preparedBy: output.metadata?.user || output.agent || 'BMAD System',
    projectName: output.metadata?.projectName || output.workflow,
    duration: output.metadata?.duration
      ? `${output.metadata.duration}ms`
      : undefined,
    agent: output.agent,
  }
}

/**
 * Extract all structured data for technical report
 * @param output - Agent output
 * @returns Object with all technical report sections
 */
export function extractTechnicalReportData(output: AgentOutput): {
  methodology: string
  dataCollection: string
  analysis: string
  findings: string
  recommendations: string[]
  appendices: string
  metadata: ReturnType<typeof formatTechnicalMetadata>
} {
  return {
    methodology: formatMethodology(output),
    dataCollection: formatDataCollection(output),
    analysis: formatAnalysis(output),
    findings: formatDetailedFindings(output.findings),
    recommendations: formatDetailedRecommendations(output.recommendations),
    appendices: formatAppendices(output),
    metadata: formatTechnicalMetadata(output),
  }
}
