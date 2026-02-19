/**
 * Template Export API
 * Story 7.5: Template Rendering Engine - Task 6
 *
 * API endpoint for exporting rendered templates to files.
 * Supports PDF, DOCX, and Markdown downloads.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/../auth'
import { getTemplateRenderer } from '@/lib/templates/engine/template-renderer'
import { getBuiltinTemplate } from '@/lib/templates/builtin-templates'
import type { AgentOutput, ExportOptions } from '@/types/template-render'

/**
 * POST /api/templates/export
 *
 * Export a template with agent output data to a downloadable file.
 *
 * Request body:
 * {
 *   templateId: string           // Template ID to export
 *   agentOutput: AgentOutput     // Agent output data
 *   format: 'pdf' | 'docx' | 'markdown'
 *   options?: {
 *     filename?: string
 *     branding?: BrandingConfig
 *     includeMetadata?: boolean
 *     pageSize?: 'letter' | 'a4'
 *     orientation?: 'portrait' | 'landscape'
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
    const validFormats = ['pdf', 'docx', 'markdown']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Get template
    let template = getBuiltinTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Build export options
    const exportOptions: ExportOptions = {
      format: format as 'pdf' | 'docx' | 'markdown',
      filename: options.filename,
      branding: options.branding,
      includeMetadata: options.includeMetadata !== false,
      pageSize: options.pageSize || 'letter',
      orientation: options.orientation || 'portrait',
    }

    // Generate export
    const renderer = getTemplateRenderer()
    const result = await renderer.export(template, agentOutput, exportOptions)

    // Determine content disposition
    const contentDisposition = `attachment; filename="${result.filename}"`

    // Return file response - cast content to BodyInit to handle Buffer/Uint8Array
    return new NextResponse(result.content as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': result.size.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Template export error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/templates/export
 *
 * Get export capabilities and supported formats.
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

    return NextResponse.json({
      success: true,
      data: {
        supportedFormats: [
          {
            format: 'pdf',
            description: 'PDF document with print formatting',
            contentType: 'application/pdf',
            extension: '.pdf',
          },
          {
            format: 'docx',
            description: 'Microsoft Word document',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            extension: '.docx',
          },
          {
            format: 'markdown',
            description: 'Markdown text file',
            contentType: 'text/markdown',
            extension: '.md',
          },
        ],
        options: {
          branding: 'Custom branding support (logo, colors, fonts)',
          metadata: 'Include document metadata',
          pageSize: 'Letter or A4 page sizes',
          orientation: 'Portrait or landscape orientation',
        },
      },
    })

  } catch (error) {
    console.error('Template export info error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/templates/export
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
