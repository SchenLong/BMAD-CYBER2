/**
 * Executive Brief Renderer
 * Story 7.2: Executive Brief Template
 *
 * Main renderer for executive brief templates.
 * Supports markdown, HTML, and print-optimized output.
 */

'use client'

import { useMemo } from 'react'
import type { ExecutiveBriefData, TemplateRenderOutput, RiskLevel } from '@/types/template'
import { OnePageLayout } from './one-page-layout'
import { simplifyText, formatAsBullets, truncateContent, isReadableForExecutives, countWords } from '@/lib/templates/transformers'
import { formatRiskBreakdown } from '@/lib/templates/risk-calculator'

/**
 * Target readability grade level for executive audience
 * Story 7.2: Flesch-Kincaid validation
 */
const TARGET_READABILITY_MIN = 8
const TARGET_READABILITY_MAX = 12

export interface ExecutiveBriefRenderProps {
  /** Data to render */
  data: ExecutiveBriefData
  /** Output format */
  format?: 'markdown' | 'html' | 'preview'
  /** Whether to show print controls */
  showPrintControls?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Render executive brief as markdown
 */
export function renderAsMarkdown(data: ExecutiveBriefData): string {
  const lines: string[] = []

  // Header
  lines.push('# Executive Brief')
  lines.push('')

  if (data.metadata) {
    if (data.metadata.projectName) {
      lines.push(`**Project:** ${data.metadata.projectName}`)
    }
    if (data.metadata.date) {
      lines.push(`**Date:** ${data.metadata.date}`)
    }
    if (data.metadata.preparedBy) {
      lines.push(`**Prepared by:** ${data.metadata.preparedBy}`)
    }
    lines.push('')
  }

  // Risk Assessment
  lines.push('## Risk Assessment')
  lines.push('')
  lines.push(`**Overall Risk:** ${data.riskRating.toUpperCase()}`)
  lines.push('')

  if (data.riskBreakdown) {
    lines.push(`**Findings:** ${formatRiskBreakdown(data.riskBreakdown)}`)
    lines.push('')
  }

  // Executive Summary
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(data.executiveSummary)
  lines.push('')

  // Key Findings
  lines.push('## Key Findings')
  lines.push('')
  for (const finding of data.keyFindings) {
    lines.push(`• ${finding}`)
  }
  lines.push('')

  // Recommendations
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of data.recommendations) {
    lines.push(`${data.recommendations.indexOf(rec) + 1}. ${rec}`)
  }
  lines.push('')

  return lines.join('\n')
}

/**
 * Render executive brief as HTML
 */
export function renderAsHTML(data: ExecutiveBriefData): string {
  let html = ''

  // Header
  html += '<div class="executive-brief">'
  html += '<header>'
  html += '<h1>Executive Brief</h1>'

  if (data.metadata) {
    html += '<div class="metadata">'
    if (data.metadata.projectName) {
      html += `<p><strong>Project:</strong> ${escapeHtml(data.metadata.projectName)}</p>`
    }
    if (data.metadata.date) {
      html += `<p><strong>Date:</strong> ${escapeHtml(data.metadata.date)}</p>`
    }
    if (data.metadata.preparedBy) {
      html += `<p><strong>Prepared by:</strong> ${escapeHtml(data.metadata.preparedBy)}</p>`
    }
    html += '</div>'
  }

  html += '</header>'

  // Risk Assessment
  html += '<section class="risk-assessment">'
  html += '<h2>Risk Assessment</h2>'
  html += `<p><strong>Overall Risk:</strong> <span class="risk-${data.riskRating}">${data.riskRating.toUpperCase()}</span></p>`

  if (data.riskBreakdown) {
    html += `<p><strong>Findings:</strong> ${escapeHtml(formatRiskBreakdown(data.riskBreakdown))}</p>`
  }

  html += '</section>'

  // Executive Summary
  html += '<section class="executive-summary">'
  html += '<h2>Executive Summary</h2>'
  html += `<p>${escapeHtml(data.executiveSummary)}</p>`
  html += '</section>'

  // Key Findings
  html += '<section class="key-findings">'
  html += '<h2>Key Findings</h2>'
  html += '<ul>'
  for (const finding of data.keyFindings) {
    html += `<li>${escapeHtml(finding)}</li>`
  }
  html += '</ul>'
  html += '</section>'

  // Recommendations
  html += '<section class="recommendations">'
  html += '<h2>Recommendations</h2>'
  html += '<ol>'
  for (const rec of data.recommendations) {
    html += `<li>${escapeHtml(rec)}</li>`
  }
  html += '</ol>'
  html += '</section>'

  html += '</div>'

  return html
}

/**
 * Escape HTML special characters (server-safe implementation)
 * Story 7.2: Fixed HTML injection vulnerability
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char)
}

/**
 * Process and simplify data for executive brief
 * Story 7.2: Enhanced with readability validation
 */
export function processExecutiveBriefData(
  rawData: Partial<ExecutiveBriefData>
): ExecutiveBriefData {
  // Ensure required fields
  const data: ExecutiveBriefData = {
    executiveSummary: rawData.executiveSummary || '',
    keyFindings: rawData.keyFindings || [],
    riskRating: rawData.riskRating || 'medium',
    riskBreakdown: rawData.riskBreakdown,
    recommendations: rawData.recommendations || [],
    metadata: rawData.metadata || {
      reportType: 'Executive Brief',
      date: new Date().toLocaleDateString(),
      preparedBy: 'System',
    },
  }

  // Simplify executive summary
  if (data.executiveSummary) {
    data.executiveSummary = simplifyText(data.executiveSummary, {
      translateJargon: true,
      expandAcronyms: true,
      useBullets: false,
      maxCharsTotal: 150,
    }) as string

    // Validate readability for executive audience (Grade 8-12)
    if (!isReadableForExecutives(data.executiveSummary)) {
      // If not readable, try to simplify further by breaking into shorter sentences
      const sentences = data.executiveSummary.split('. ')
      const simplifiedSentences = sentences.map(s => {
        const words = countWords(s)
        if (words > 15) {
          // Break long sentences into shorter ones
          const midPoint = Math.floor(s.length / 2)
          return s.slice(0, midPoint) + '. ' + s.slice(midPoint + 1).trim()
        }
        return s
      })
      data.executiveSummary = simplifiedSentences.join('. ')
    }
  }

  // Process findings as bullets
  if (rawData.keyFindings && Array.isArray(rawData.keyFindings)) {
    data.keyFindings = rawData.keyFindings.slice(0, 5)
  } else if (typeof rawData.keyFindings === 'string') {
    data.keyFindings = formatAsBullets(rawData.keyFindings, 5, 120)
  }

  // Process recommendations
  if (rawData.recommendations && Array.isArray(rawData.recommendations)) {
    data.recommendations = rawData.recommendations.slice(0, 4)
  } else if (typeof rawData.recommendations === 'string') {
    data.recommendations = formatAsBullets(rawData.recommendations, 4, 120)
  }

  return data
}

/**
 * ExecutiveBriefRender component
 */
export function ExecutiveBriefRender({
  data: rawData,
  format = 'preview',
  showPrintControls = true,
  className = '',
}: ExecutiveBriefRenderProps) {
  const data = useMemo(() => processExecutiveBriefData(rawData), [rawData])

  if (format === 'markdown') {
    return (
      <pre className={`text-sm whitespace-pre-wrap font-mono ${className}`}>
        {renderAsMarkdown(data)}
      </pre>
    )
  }

  if (format === 'html') {
    return (
      <div
        className={`executive-brief-html ${className}`}
        dangerouslySetInnerHTML={{ __html: renderAsHTML(data) }}
      />
    )
  }

  // Default preview format
  return (
    <div className={className}>
      <OnePageLayout
        data={data}
        showPrintHint={showPrintControls}
      />
    </div>
  )
}

/**
 * Export executive brief to various formats
 */
export interface ExportOptions {
  /** Include print styles */
  includePrintStyles?: boolean
  /** Page size for PDF */
  pageSize?: 'letter' | 'a4'
  /** Orientation */
  orientation?: 'portrait' | 'landscape'
}

/**
 * Get printable HTML with styles
 */
export function getPrintableHTML(data: ExecutiveBriefData, options: ExportOptions = {}): string {
  const pageSize = options.pageSize || 'letter'
  const orientation = options.orientation || 'portrait'

  const styles = `
    <style>
      @page {
        size: ${pageSize} ${orientation};
        margin: 0.5in;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #1a1a1a;
        max-width: 8in;
        margin: 0 auto;
        padding: 0.5in;
      }

      .executive-brief h1 {
        font-size: 18pt;
        font-weight: 700;
        margin: 0 0 0.25in 0;
        color: #0a0a0a;
      }

      .executive-brief h2 {
        font-size: 13pt;
        font-weight: 600;
        margin: 0.25in 0 0.125in 0;
        color: #1a1a1a;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.0625in;
      }

      .executive-brief header {
        margin-bottom: 0.375in;
        padding-bottom: 0.25in;
        border-bottom: 2px solid #e5e5e5;
      }

      .executive-brief .metadata {
        font-size: 9pt;
        color: #666;
        margin-top: 0.125in;
      }

      .executive-brief section {
        margin-bottom: 0.375in;
      }

      .executive-brief ul, .executive-brief ol {
        margin: 0.125in 0;
        padding-left: 0.25in;
      }

      .executive-brief li {
        margin: 0.0625in 0;
      }

      .risk-critical { color: #DC2626; font-weight: 700; }
      .risk-high { color: #EA580C; font-weight: 700; }
      .risk-medium { color: #CA8A04; font-weight: 700; }
      .risk-low { color: #2563EB; font-weight: 700; }
      .risk-info { color: #6B7280; font-weight: 700; }

      @media print {
        body { margin: 0; }
        .no-print { display: none; }
      }
    </style>
  `

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Executive Brief</title>
  ${styles}
</head>
<body>
  ${renderAsHTML(data)}
</body>
</html>`
}

/**
 * Generate render output with metrics
 */
export function generateRenderOutput(
  data: ExecutiveBriefData,
  format: 'markdown' | 'html'
): TemplateRenderOutput {
  let content = ''
  if (format === 'markdown') {
    content = renderAsMarkdown(data)
  } else {
    content = getPrintableHTML(data)
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  const charCount = content.length

  return {
    content,
    format,
    fitsOnOnePage: wordCount <= 800 && charCount <= 4500,
    wordCount,
    characterCount: charCount,
  }
}
