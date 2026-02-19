/**
 * Template Renderer Tests
 * Story 7.5: Template Rendering Engine - Task 9
 *
 * Tests for the template rendering engine.
 */

import { TemplateRenderer, getTemplateRenderer } from '../engine/template-renderer'
import { EXECUTIVE_BRIEF_TEMPLATE, TECHNICAL_REPORT_TEMPLATE } from '@/lib/templates/builtin-templates'
import type { AgentOutput } from '@/types/template-render'

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer

  beforeEach(() => {
    renderer = getTemplateRenderer()
    renderer.clearCache()
  })

  describe('render', () => {
    const mockAgentOutput: AgentOutput = {
      agent: 'test-agent',
      workflow: 'test-workflow',
      summary: 'This is a test summary of the assessment results.',
      findings: [
        { title: 'Finding 1', description: 'First finding description', severity: 'high' },
        { title: 'Finding 2', description: 'Second finding description', severity: 'medium' },
      ],
      recommendations: [
        'Fix the high severity issue',
        'Address the medium severity issue',
      ],
      metadata: {
        timestamp: '2024-01-15T10:00:00Z',
        agent: 'test-agent',
        duration: 5000,
      },
    }

    it('should render executive brief template as markdown', async () => {
      const result = await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'markdown',
        useCache: false,
      })

      expect(result).toBeDefined()
      expect(result.format).toBe('markdown')
      expect(result.content).toContain('Executive Brief')
      expect(result.content).toContain('test summary')
      expect(result.wordCount).toBeGreaterThan(0)
      expect(result.characterCount).toBeGreaterThan(0)
      expect(result.generationTime).toBeGreaterThanOrEqual(0)
    })

    it('should render technical report template as markdown', async () => {
      const result = await renderer.render(TECHNICAL_REPORT_TEMPLATE, mockAgentOutput, {
        format: 'markdown',
        useCache: false,
      })

      expect(result).toBeDefined()
      expect(result.format).toBe('markdown')
      expect(result.content).toContain('Technical Report')
      expect(result.wordCount).toBeGreaterThan(0)
    })

    it('should render as HTML format', async () => {
      const result = await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'html',
        useCache: false,
      })

      expect(result).toBeDefined()
      expect(result.format).toBe('html')
      expect(result.content).toContain('<!DOCTYPE html>')
      expect(result.content).toContain('<html')
    })

    it('should cache render results when enabled', async () => {
      const options = { format: 'markdown' as const, useCache: true }

      const firstResult = await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, options)
      expect(firstResult.cached).toBe(false)

      const secondResult = await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, options)
      expect(secondResult.cached).toBe(true)
      // Cached results should be faster, but allow for timing variance
      expect(secondResult.generationTime).toBeLessThan(firstResult.generationTime + 10)
    })

    it('should call progress callback during rendering', async () => {
      const progressCalls: Array<{ progress: number; step: string; complete: boolean }> = []

      await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'markdown',
        useCache: false,
        onProgress: (progress) => progressCalls.push(progress),
      })

      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls[progressCalls.length - 1].complete).toBe(true)
    })

    it('should handle missing data gracefully', async () => {
      const minimalOutput: AgentOutput = {}

      const result = await renderer.render(EXECUTIVE_BRIEF_TEMPLATE, minimalOutput, {
        format: 'markdown',
        useCache: false,
      })

      expect(result).toBeDefined()
      // Should contain one of the various "no data" messages
      expect(result.content).toMatch(/No (data|information|findings) (available|provided)/)
    })

    it('should throw error for invalid template', async () => {
      await expect(
        renderer.render({} as any, mockAgentOutput, { format: 'markdown' })
      ).rejects.toThrow()
    })

    it('should throw error for missing output', async () => {
      await expect(
        renderer.render(EXECUTIVE_BRIEF_TEMPLATE, undefined as any, { format: 'markdown' })
      ).rejects.toThrow()
    })
  })

  describe('export', () => {
    const mockAgentOutput: AgentOutput = {
      agent: 'test-agent',
      workflow: 'test-workflow',
      summary: 'Test summary for export',
      findings: [
        { title: 'Export Test Finding', description: 'Finding description', severity: 'low' },
      ],
      recommendations: ['Test recommendation'],
    }

    it('should export as markdown', async () => {
      const result = await renderer.export(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'markdown',
        filename: 'test-export',
      })

      expect(result).toBeDefined()
      expect(result.filename).toBe('test-export.md')
      expect(result.contentType).toBe('text/markdown')
      expect(result.size).toBeGreaterThan(0)
      expect(result.content).toBeInstanceOf(Buffer)
    })

    it('should generate unique filename if not provided', async () => {
      const result = await renderer.export(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'markdown',
      })

      expect(result.filename).toMatch(/^executive-brief-\d+\.md$/)
    })

    it('should export as PDF', async () => {
      const result = await renderer.export(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'pdf',
      })

      expect(result).toBeDefined()
      expect(result.filename).toMatch(/\.pdf$/)
      expect(result.contentType).toBe('application/pdf')
    })

    it('should export as DOCX', async () => {
      const result = await renderer.export(EXECUTIVE_BRIEF_TEMPLATE, mockAgentOutput, {
        format: 'docx',
      })

      expect(result).toBeDefined()
      expect(result.filename).toMatch(/\.docx$/)
      expect(result.contentType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    })
  })

  describe('validateRenderable', () => {
    it('should validate complete output', () => {
      const completeOutput: AgentOutput = {
        agent: 'test',
        summary: 'Summary',
        findings: [{ title: 'Finding', severity: 'low' }],
        recommendations: ['Recommendation'],
      }

      const result = renderer.validateRenderable(EXECUTIVE_BRIEF_TEMPLATE, completeOutput)

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
    })

    it('should detect missing required sections', () => {
      const emptyOutput: AgentOutput = {}

      const result = renderer.validateRenderable(EXECUTIVE_BRIEF_TEMPLATE, emptyOutput)

      expect(result.valid).toBe(false)
      expect(result.missing.length).toBeGreaterThan(0)
    })

    it('should warn about word count limit', () => {
      const longOutput: AgentOutput = {
        agent: 'test',
        summary: 'a '.repeat(1000), // Long content
        findings: Array(20).fill({ title: 'Finding', description: 'x'.repeat(500) }),
        recommendations: Array(20).fill('A very long recommendation that exceeds limits'),
      }

      const result = renderer.validateRenderable(EXECUTIVE_BRIEF_TEMPLATE, longOutput)

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('one-page limit'))).toBe(true)
    })
  })

  describe('cache management', () => {
    it('should invalidate cache for template', () => {
      renderer.clearCache()

      renderer.invalidateCache('executive-brief')

      const stats = renderer.getCacheStats()
      expect(stats.entries).toBe(0)
    })

    it('should provide cache statistics', () => {
      const stats = renderer.getCacheStats()

      expect(stats).toHaveProperty('entries')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('sizeFormatted')
      expect(stats).toHaveProperty('config')
    })
  })

  describe('renderStream', () => {
    it('should stream content in chunks', async () => {
      const mockAgentOutput: AgentOutput = {
        agent: 'test',
        summary: 'Test summary',
      }

      const chunks: string[] = []

      await renderer.renderStream(
        EXECUTIVE_BRIEF_TEMPLATE,
        mockAgentOutput,
        { format: 'markdown' },
        (chunk) => chunks.push(chunk)
      )

      expect(chunks.length).toBeGreaterThan(0)
      const fullContent = chunks.join('')
      expect(fullContent).toContain('Executive Brief')
    })
  })
})
