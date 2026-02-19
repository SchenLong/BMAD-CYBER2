/**
 * Template Render API
 * Story 7.5: Template Rendering Engine - Task 8
 *
 * API endpoint for rendering templates with agent output data.
 * Supports multiple output formats and export capabilities.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/../auth'
import { getTemplateRenderer } from '@/lib/templates/engine/template-renderer'
import { getBuiltinTemplate } from '@/lib/templates/builtin-templates'
import type { AgentOutput, RenderOptions, ExportOptions } from '@/types/template-render'
import { RenderError } from '@/types/template-render'

/**
 * POST /api/templates/render
 *
 * Render a template with agent output data.
 *
 * Request body:
 * {
 *   templateId: string           // Template ID to render
 *   agentOutput: AgentOutput     // Agent output data
 *   format: 'markdown' | 'html' | 'pdf' | 'docx'
 *   options?: {
 *     concise?: boolean
 *     branding?: BrandingConfig
 *     useCache?: boolean
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { templateId, agentOutput, format, options = {} } = body

    // Validate required fields
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    if (!agentOutput) {
      return NextResponse.json(
        { success: false, error: 'Agent output is required' },
        { status: 400 }
      )
    }

    if (!format) {
      return NextResponse.json(
        { success: false, error: 'Format is required' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats = ['markdown', 'html', 'pdf', 'docx']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Get template
    let template = getBuiltinTemplate(templateId)
    if (!template) {
      // Try to get from custom templates (would implement here)
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Build render options
    const renderOptions: RenderOptions = {
      format,
      formatting: {
        conciseness: options.concise ? 'concise' : 'detailed',
        maxSectionLength: options.concise ? 150 : 5000,
        maxBulletPoints: options.concise ? 5 : 50,
        includeRawData: !options.concise,
        includeCodeExamples: !options.concise,
        technicalDepth: options.concise ? 'executive' : 'technical',
      },
      branding: options.branding,
      useCache: options.useCache !== false,
    }

    // Render template
    const renderer = getTemplateRenderer()
    const result = await renderer.render(template, agentOutput, renderOptions)

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        format: result.format,
        cached: result.cached,
        wordCount: result.wordCount,
        characterCount: result.characterCount,
        generationTime: result.generationTime,
      },
    })

  } catch (error) {
    console.error('Template render error:', error)

    if (error instanceof RenderError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/templates/render
 *
 * Get rendering capabilities and cache statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const renderer = getTemplateRenderer()
    const cacheStats = renderer.getCacheStats()

    return NextResponse.json({
      success: true,
      data: {
        supportedFormats: ['markdown', 'html', 'pdf', 'docx'],
        exportFormats: ['pdf', 'docx', 'markdown'],
        cache: cacheStats,
        capabilities: {
          caching: true,
          streaming: true,
          branding: true,
          multiFormat: true,
        },
      },
    })

  } catch (error) {
    console.error('Template render info error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/templates/render
 *
 * CORS preflight support.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
