/**
 * Template Renderer Engine
 * Story 7.5: Template Rendering Engine - Task 8
 *
 * Main rendering engine that orchestrates data mapping,
 * formatting, rendering, and export generation.
 */

import type {
  Template,
  AgentOutput,
  RenderOptions,
  RenderResult,
  RenderProgress,
  ExportOptions,
  ExportResult,
  OutputFormat,
  BrandingConfig,
  FormattingRules,
  RenderProgressCallback,
} from '@/types/template-render'
import { RenderError } from '@/types/template-render'
import { getRenderCache } from '../cache/render-cache'
import { renderMarkdown, countMarkdownWords, countMarkdownCharacters } from '../renderers/markdown-renderer'
import { renderHtml, countHtmlWords, countHtmlCharacters } from '../renderers/html-renderer'
import { generatePdf } from '../renderers/exports/pdf-generator'
import { generateDocx } from '../renderers/exports/docx-generator'
import { validateRequiredFields, getNestedValue } from '../formatters/missing-data-handler'

/**
 * Template Renderer Engine class
 */
export class TemplateRenderer {
  private cache = getRenderCache()
  private readonly MAX_OUTPUT_SIZE = 10 * 1024 * 1024 // 10MB as per story requirements

  /**
   * Render template with agent output data
   * @param template - Template to render
   * @param output - Agent output data
   * @param options - Render options
   * @returns Render result
   */
  async render(
    template: Template,
    output: AgentOutput,
    options: RenderOptions
  ): Promise<RenderResult> {
    const startTime = Date.now()

    // Validate inputs
    this.validateInputs(template, output)

    // Check cache
    if (options.useCache !== false) {
      const cached = this.cache.get(template.id, output, options.format)
      if (cached) {
        options.onProgress?.({
          progress: 1,
          step: 'Loaded from cache',
          complete: true,
        })
        return this.buildRenderResult(cached.rendered, options.format, true, startTime)
      }
    }

    // Report progress
    options.onProgress?.({
      progress: 0.1,
      step: 'Normalizing data',
      complete: false,
    })

    // Normalize data
    const normalized = this.normalizeData(output)

    // Report progress
    options.onProgress?.({
      progress: 0.3,
      step: 'Mapping to template',
      complete: false,
    })

    // Map to template sections
    const mappedData = this.mapToTemplate(template, normalized, options.formatting)

    // Report progress
    options.onProgress?.({
      progress: 0.5,
      step: 'Rendering output',
      complete: false,
    })

    // Render based on format
    let content: string
    switch (options.format) {
      case 'markdown':
        content = renderMarkdown(template, mappedData, {
          concise: options.formatting?.conciseness === 'concise',
          branding: options.branding,
        })
        break

      case 'html':
        content = renderHtml(template, mappedData, {
          branding: options.branding,
          printFriendly: true,
        })
        break

      case 'pdf':
        const pdfBuffer = await generatePdf(template, mappedData, {
          format: 'pdf',
          branding: options.branding,
        })
        content = pdfBuffer.toString('base64')
        break

      case 'docx':
        const docxBuffer = await generateDocx(template, mappedData, {
          format: 'docx',
          branding: options.branding,
        })
        content = docxBuffer.toString('base64')
        break

      default:
        throw new RenderError(`Unsupported format: ${options.format}`, 'UNSUPPORTED_FORMAT')
    }

    // Enforce max output size limit (10MB per story requirements)
    const contentSize = Buffer.byteLength(content, 'utf8')
    if (contentSize > this.MAX_OUTPUT_SIZE) {
      throw new RenderError(
        `Output size (${(contentSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`,
        'OUTPUT_TOO_LARGE'
      )
    }

    // Report progress
    options.onProgress?.({
      progress: 0.9,
      step: 'Finalizing',
      complete: false,
    })

    // Cache result
    if (options.useCache !== false) {
      try {
        this.cache.set(template.id, output, options.format, content)
      } catch {
        // Cache errors shouldn't fail the render
      }
    }

    // Report completion
    options.onProgress?.({
      progress: 1,
      step: 'Complete',
      complete: true,
    })

    return this.buildRenderResult(content, options.format, false, startTime)
  }

  /**
   * Export rendered content to file
   * @param template - Template to export
   * @param output - Agent output data
   * @param options - Export options
   * @returns Export result
   */
  async export(
    template: Template,
    output: AgentOutput,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Render first if needed
    const renderResult = await this.render(template, output, {
      format: options.format === 'markdown' ? 'markdown' : 'html',
      branding: options.branding,
    })

    // Generate export based on format
    let buffer: Buffer
    let contentType: string

    switch (options.format) {
      case 'pdf':
        buffer = await generatePdf(template, output, options)
        contentType = 'application/pdf'
        break

      case 'docx':
        buffer = await generateDocx(template, output, options)
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break

      case 'markdown':
        buffer = Buffer.from(renderResult.content, 'utf-8')
        contentType = 'text/markdown'
        break

      default:
        throw new RenderError(`Unsupported export format: ${options.format}`, 'UNSUPPORTED_EXPORT_FORMAT')
    }

    const filename = options.filename || `${template.id}-${Date.now()}`
    const ext = this.getFileExtension(options.format)

    return {
      content: buffer,
      contentType,
      filename: filename.endsWith(ext) ? filename : `${filename}${ext}`,
      size: buffer.length,
    }
  }

  /**
   * Render with streaming support for large outputs
   * @param template - Template to render
   * @param output - Agent output data
   * @param options - Render options
   * @param onChunk - Callback for each chunk
   */
  async renderStream(
    template: Template,
    output: AgentOutput,
    options: RenderOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const maxChunkSize = 1024 * 1024 // 1MB chunks

    // Render full content
    const result = await this.render(template, output, options)

    // Stream in chunks
    const content = result.content
    for (let i = 0; i < content.length; i += maxChunkSize) {
      const chunk = content.substring(i, i + maxChunkSize)
      onChunk(chunk)
    }
  }

  /**
   * Validate inputs before rendering
   */
  private validateInputs(template: Template, output: AgentOutput): void {
    if (!template) {
      throw new RenderError('Template is required', 'MISSING_TEMPLATE')
    }

    if (!template.id || !template.sections) {
      throw new RenderError('Invalid template structure', 'INVALID_TEMPLATE')
    }

    if (!output) {
      throw new RenderError('Agent output is required', 'MISSING_OUTPUT')
    }
  }

  /**
   * Normalize agent output data
   */
  private normalizeData(output: AgentOutput): AgentOutput {
    return {
      ...output,
      metadata: output.metadata || {
        timestamp: new Date().toISOString(),
        agent: output.agent,
        duration: output.metadata?.duration,
      },
    }
  }

  /**
   * Map normalized data to template structure
   */
  private mapToTemplate(
    template: Template,
    data: AgentOutput,
    formatting?: FormattingRules
  ): AgentOutput {
    // Apply any transformations based on template requirements
    const mapped: AgentOutput = { ...data }

    // Apply concise formatting if needed
    if (formatting?.conciseness === 'concise') {
      // Truncate summary if too long
      if (mapped.summary && formatting.maxSectionLength) {
        mapped.summary = mapped.summary.substring(0, formatting.maxSectionLength)
      }

      // Limit findings
      if (mapped.findings && formatting.maxBulletPoints) {
        mapped.findings = mapped.findings.slice(0, formatting.maxBulletPoints)
      }

      // Limit recommendations
      if (mapped.recommendations && formatting.maxBulletPoints) {
        mapped.recommendations = mapped.recommendations.slice(0, formatting.maxBulletPoints)
      }
    }

    return mapped
  }

  /**
   * Build render result
   */
  private buildRenderResult(
    content: string,
    format: OutputFormat,
    cached: boolean,
    startTime: number
  ): RenderResult {
    // For binary formats (PDF, DOCX), word count is estimated
    let wordCount = 0
    let characterCount = 0

    if (format === 'markdown' || format === 'html') {
      if (format === 'markdown') {
        wordCount = countMarkdownWords(content)
        characterCount = countMarkdownCharacters(content)
      } else {
        // Strip HTML tags for counting
        const textContent = content.replace(/<[^>]*>/g, '')
        wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length
        characterCount = textContent.length
      }
    } else {
      // For binary formats, estimate from buffer size
      const buffer = Buffer.from(content, 'base64')
      characterCount = buffer.length
      wordCount = Math.floor(characterCount / 5) // Rough estimate
    }

    return {
      content,
      format,
      cached,
      wordCount,
      characterCount,
      generationTime: Date.now() - startTime,
    }
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'pdf':
        return '.pdf'
      case 'docx':
        return '.docx'
      case 'markdown':
        return '.md'
      default:
        return ''
    }
  }

  /**
   * Invalidate cache for a template
   */
  invalidateCache(templateId: string): void {
    this.cache.invalidateTemplate(templateId)
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * Validate template can be rendered with given output
   */
  validateRenderable(template: Template, output: AgentOutput): {
    valid: boolean
    missing: string[]
    warnings: string[]
  } {
    const missing: string[] = []
    const warnings: string[] = []

    // Check required sections
    for (const section of template.sections) {
      if (section.required) {
        const hasData = this.hasDataForSection(section.id, output)
        if (!hasData) {
          missing.push(section.title)
        }
      }
    }

    // Check word count constraint
    if (template.onePage && template.maxWordCount) {
      const estimatedWords = this.estimateWordCount(output)
      if (estimatedWords > template.maxWordCount) {
        warnings.push(
          `Content may exceed one-page limit (${estimatedWords} estimated words, limit is ${template.maxWordCount})`
        )
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings,
    }
  }

  /**
   * Check if data exists for a section
   */
  private hasDataForSection(sectionId: string, output: AgentOutput): boolean {
    const paths = this.getPathsForSection(sectionId)
    for (const path of paths) {
      const value = getNestedValue(output, path)
      if (value !== undefined && value !== null && value !== '') {
        return true
      }
    }
    return false
  }

  /**
   * Get data paths for a section ID
   */
  private getPathsForSection(sectionId: string): string[] {
    const pathMap: Record<string, string[]> = {
      'executive-summary': ['summary', 'assessment', 'conclusions'],
      'key-findings': ['findings'],
      'risk-rating': ['findings'],
      'recommendations': ['recommendations'],
      'methodology': ['methodology'],
      'data-collection': ['dataCollection'],
      'analysis': ['analysis'],
      'findings': ['findings'],
      'appendices': ['rawData'],
    }

    return pathMap[sectionId] || [sectionId]
  }

  /**
   * Estimate word count for output
   */
  private estimateWordCount(output: AgentOutput): number {
    let count = 0

    if (output.summary) count += output.summary.split(/\s+/).length
    if (output.assessment) count += output.assessment.split(/\s+/).length
    if (output.findings) {
      count += output.findings.length * 20 // Estimate per finding
    }
    if (output.recommendations) {
      count += output.recommendations.length * 15 // Estimate per recommendation
    }

    return count
  }
}

/**
 * Singleton renderer instance
 */
let rendererInstance: TemplateRenderer | null = null

/**
 * Get or create template renderer instance
 */
export function getTemplateRenderer(): TemplateRenderer {
  if (!rendererInstance) {
    rendererInstance = new TemplateRenderer()
  }
  return rendererInstance
}

/**
 * Convenience function to render a template
 */
export async function renderTemplate(
  template: Template,
  output: AgentOutput,
  options: RenderOptions
): Promise<RenderResult> {
  const renderer = getTemplateRenderer()
  return renderer.render(template, output, options)
}

/**
 * Convenience function to export a template
 */
export async function exportTemplate(
  template: Template,
  output: AgentOutput,
  options: ExportOptions
): Promise<ExportResult> {
  const renderer = getTemplateRenderer()
  return renderer.export(template, output, options)
}
