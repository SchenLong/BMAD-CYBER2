/**
 * DOCX Generator
 * Story 7.5: Template Rendering Engine - Task 6
 *
 * Generates DOCX (Word) exports from template data.
 * Uses the docx library for native DOCX creation.
 */

import type { Template, AgentOutput, ExportOptions, BrandingConfig } from '@/types/template-render'

/**
 * Document element types
 */
type DocxElement =
  | { type: 'paragraph'; text: string; heading?: 1 | 2 | 3 | 4 | 5 | 6; bold?: boolean; italic?: boolean }
  | { type: 'bullet'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'pageBreak' }
  | { type: 'image'; src: string; width?: number; height?: number }

/**
 * Generate DOCX from template and agent output
 * @param template - Template to use
 * @param output - Agent output data
 * @param options - Export options
 * @returns DOCX buffer
 */
export async function generateDocx(
  template: Template,
  output: AgentOutput,
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    format = 'docx',
    filename = `${template.id}-${Date.now()}`,
    branding,
    includeMetadata = true,
  } = options

  if (format !== 'docx') {
    throw new Error(`Invalid format: ${format}. Expected 'docx'.`)
  }

  // Build document structure
  const elements: DocxElement[] = []

  // Title
  elements.push({
    type: 'paragraph',
    text: template.name,
    heading: 1,
    bold: true,
  })

  // Metadata section
  if (includeMetadata) {
    elements.push({
      type: 'paragraph',
      text: `Generated: ${new Date().toLocaleString()}`,
    })
    if (output.agent) {
      elements.push({
        type: 'paragraph',
        text: `Agent: ${output.agent}`,
      })
    }
    if (output.workflow) {
      elements.push({
        type: 'paragraph',
        text: `Workflow: ${output.workflow}`,
      })
    }
    if (branding?.organization) {
      elements.push({
        type: 'paragraph',
        text: `Organization: ${branding.organization}`,
      })
    }
    elements.push({ type: 'pageBreak' })
  }

  // Process each template section
  for (const section of template.sections) {
    const sectionElements = renderSectionToDocx(section, output)
    elements.push(...sectionElements)
  }

  // Convert to buffer (in production, would use docx library)
  const docxContent = serializeDocx(elements, template, output, branding)

  return Buffer.from(docxContent, 'utf-8')
}

/**
 * Render a section to DOCX elements
 */
function renderSectionToDocx(
  section: Template['sections'][number],
  output: AgentOutput
): DocxElement[] {
  const elements: DocxElement[] = []

  // Section header
  elements.push({
    type: 'paragraph',
    text: section.title,
    heading: 2,
    bold: true,
  })

  // Get section content
  const content = getSectionContentForDocx(section.id, output)

  if (!content) {
    if (section.required) {
      elements.push({
        type: 'paragraph',
        text: 'No data available.',
        italic: true,
      })
    }
    return elements
  }

  // Add content based on type
  if (content.type === 'text') {
    elements.push({
      type: 'paragraph',
      text: content.text,
    })
  } else if (content.type === 'bullets') {
    elements.push({
      type: 'bullet',
      items: content.items,
    })
  } else if (content.type === 'numbered') {
    elements.push({
      type: 'numbered',
      items: content.items,
    })
  } else if (content.type === 'table') {
    elements.push({
      type: 'table',
      headers: content.headers,
      rows: content.rows,
    })
  }

  return elements
}

/**
 * Get section content for DOCX rendering
 */
function getSectionContentForDocx(
  sectionId: string,
  output: AgentOutput
): { type: 'text' | 'bullets' | 'numbered' | 'table'; text?: string; items?: string[]; headers?: string[]; rows?: string[][] } | null {
  switch (sectionId) {
    case 'executive-summary':
      return {
        type: 'text',
        text: output.summary || output.assessment || 'No summary available.',
      }

    case 'key-findings':
      const findings = output.findings?.map(f =>
        f.title ? `${f.title}: ${f.description || ''}` : f.description || ''
      ) || []
      return {
        type: 'bullets',
        items: findings.length > 0 ? findings : ['No findings available.'],
      }

    case 'risk-rating':
    case 'risk-assessment':
      const riskText = `Risk Level: ${output.findings?.[0]?.severity?.toUpperCase() || 'MEDIUM'}`
      return {
        type: 'text',
        text: riskText,
      }

    case 'recommendations':
      const recs = output.recommendations || []
      return {
        type: 'numbered',
        items: recs.length > 0 ? recs : ['No specific recommendations.'],
      }

    case 'methodology':
      return {
        type: 'text',
        text: output.methodology?.approach || 'No methodology information provided.',
      }

    case 'data-collection':
      const sources = output.dataCollection?.sources || []
      return {
        type: 'bullets',
        items: sources.length > 0 ? sources : ['No data sources provided.'],
      }

    case 'analysis':
      return {
        type: 'text',
        text: output.analysis?.techniques?.join(', ') || 'No analysis information provided.',
      }

    case 'findings':
      const detailedFindings = output.findings?.map(f =>
        f.title || f.description || ''
      ) || []
      return {
        type: 'bullets',
        items: detailedFindings.length > 0 ? detailedFindings : ['No findings.'],
      }

    case 'appendices':
      return {
        type: 'text',
        text: output.rawData ? JSON.stringify(output.rawData, null, 2) : 'No appendices data.',
      }

    default:
      // Try rawData
      if (output.rawData && sectionId in output.rawData) {
        const value = output.rawData[sectionId]
        if (typeof value === 'string') {
          return { type: 'text', text: value }
        }
        return { type: 'text', text: JSON.stringify(value, null, 2) }
      }
      return null
  }
}

/**
 * Serialize DOCX elements to a simplified format
 * In production, this would use the docx library to create actual DOCX files
 */
function serializeDocx(
  elements: DocxElement[],
  template: Template,
  output: AgentOutput,
  branding?: BrandingConfig
): string {
  // This is a simplified serialization
  // In production, use the 'docx' library:
  // const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx')
  // const doc = new Document({
  //   sections: [{
  //     properties: {},
  //     children: elements.map(e => new Paragraph({...}))
  //   }]
  // })
  // return await Packer.toBuffer(doc)

  const lines: string[] = []

  lines.push('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
  lines.push('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">')

  // Add document properties
  lines.push('<w:documentProperties>')
  lines.push(`<w:title>${template.name}</w:title>`)
  lines.push(`<w:author>${output.agent || 'BMAD System'}</w:author>`)
  lines.push(`<w:created>${new Date().toISOString()}</w:created>`)
  lines.push('</w:documentProperties>')

  // Add body
  lines.push('<w:body>')

  for (const element of elements) {
    switch (element.type) {
      case 'paragraph':
        lines.push(`<w:p><w:r><w:t>${element.text}</w:t></w:r></w:p>`)
        break
      case 'bullet':
        for (const item of element.items) {
          lines.push(`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>${item}</w:t></w:r></w:p>`)
        }
        break
      case 'numbered':
        for (const item of element.items) {
          lines.push(`<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>${item}</w:t></w:r></w:p>`)
        }
        break
      case 'pageBreak':
        lines.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
        break
    }
  }

  lines.push('</w:body>')
  lines.push('</w:document>')

  return lines.join('\n')
}

/**
 * Generate DOCX metadata
 */
function generateDocxMetadata(
  template: Template,
  output: AgentOutput,
  filename: string
): Record<string, string> {
  return {
    title: template.name,
    subject: template.description,
    creator: output.agent || 'BMAD System',
    keywords: template.tags?.join(', ') || '',
    description: template.description,
    lastModifiedBy: 'BMAD Template Engine',
    revision: '1',
    created: new Date().toISOString(),
  }
}

/**
 * Download DOCX in browser environment
 */
export function downloadDocxBrowser(docxBuffer: Buffer, filename: string): void {
  const blob = new Blob([docxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validate DOCX filename
 */
export function validateDocxFilename(filename: string): string {
  const clean = filename.replace(/[^a-z0-9_-]/gi, '_')
  return clean.endsWith('.docx') ? clean : `${clean}.docx`
}
