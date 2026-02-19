/**
 * PDF Generator
 * Story 7.5: Template Rendering Engine - Task 6
 *
 * Generates PDF exports from rendered HTML content.
 * NOTE: Currently returns HTML buffer. Full PDF generation requires puppeteer dependency.
 * TODO: Add puppeteer for actual PDF generation with print styling.
 */

import type { Template, AgentOutput, ExportOptions, BrandingConfig } from '@/types/template-render'
import { renderHtml } from '../html-renderer'

/**
 * PDF generation options
 */
export interface PdfGenerateOptions {
  /** Page size */
  pageSize?: 'letter' | 'a4'
  /** Orientation */
  orientation?: 'portrait' | 'landscape'
  /** Display header/footer */
  displayHeaderFooter?: boolean
  /** Margin settings */
  margins?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  /** Prefer CSS page size */
  preferCSSPageSize?: boolean
  /** Print background graphics */
  printBackground?: boolean
}

/**
 * Generate PDF from template and agent output
 * @param template - Template to use
 * @param output - Agent output data
 * @param options - Export options
 * @returns PDF buffer
 */
export async function generatePdf(
  template: Template,
  output: AgentOutput,
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    format = 'pdf',
    filename = `${template.id}-${Date.now()}`,
    branding,
    pageSize = 'letter',
    orientation = 'portrait',
    includeMetadata = true,
  } = options

  if (format !== 'pdf') {
    throw new Error(`Invalid format: ${format}. Expected 'pdf'.`)
  }

  // Generate HTML first
  const html = renderHtml(template, output, {
    includeStyles: true,
    branding,
    printFriendly: true,
  })

  // Generate metadata (embedded in HTML head when using puppeteer)
  const metadata = generatePdfMetadata(template, output, filename)

  // For now, return HTML as buffer (puppeteer would be used in production)
  // TODO: When puppeteer is added, embed metadata into PDF properties
  // In a browser environment, we'd use window.print() or a library
  // In Node.js, we'd use puppeteer
  const htmlBuffer = Buffer.from(html, 'utf-8')

  return htmlBuffer
}

/**
 * Generate PDF from HTML string
 * @param html - HTML content
 * @param options - PDF options
 * @returns PDF buffer
 */
export async function generatePdfFromHtml(
  html: string,
  options: PdfGenerateOptions = {}
): Promise<Buffer> {
  const {
    pageSize = 'letter',
    orientation = 'portrait',
    displayHeaderFooter = true,
    margins = { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    preferCSSPageSize = false,
    printBackground = true,
  } = options

  // In production with puppeteer:
  // const browser = await puppeteer.launch()
  // const page = await browser.newPage()
  // await page.setContent(html, { waitUntil: 'networkidle0' })
  // const pdf = await page.pdf({
  //   format: pageSize,
  //   orientation,
  //   displayHeaderFooter,
  //   margin: margins,
  //   preferCSSPageSize,
  //   printBackground,
  // })
  // await browser.close()
  // return pdf

  // For now, return HTML as buffer
  return Buffer.from(html, 'utf-8')
}

/**
 * Generate PDF metadata
 */
function generatePdfMetadata(
  template: Template,
  output: AgentOutput,
  filename: string
): Record<string, string> {
  return {
    Title: template.name,
    Author: output.metadata?.agent || output.agent || 'BMAD System',
    Subject: template.description,
    Creator: 'BMAD Template Rendering Engine',
    Producer: 'BMAD Web UI',
    CreationDate: new Date().toISOString(),
    Keywords: template.tags?.join(', ') || '',
  }
}

/**
 * Client-side PDF generation using browser print API
 * @param html - HTML content
 * @param filename - Output filename
 */
export function downloadPdfBrowser(html: string, filename: string): void {
  // Create a hidden iframe with the HTML
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(html)
    doc.close()

    // Wait for content to load, then print
    iframe.contentWindow?.setTimeout(() => {
      iframe.contentWindow?.print()
      document.body.removeChild(iframe)
    }, 500)
  }
}

/**
 * Generate PDF with page numbers
 * @param html - HTML content
 * @param options - PDF options
 * @returns PDF buffer
 */
export async function generatePdfWithPageNumbers(
  html: string,
  options: PdfGenerateOptions = {}
): Promise<Buffer> {
  // Add page number CSS to HTML
  const pageNumbersCss = `
  <style>
    @media print {
      .page-number {
        position: fixed;
        bottom: 10px;
        right: 10px;
        font-size: 10px;
        color: #666;
      }
      .page-count {
        position: fixed;
        bottom: 10px;
        left: 10px;
        font-size: 10px;
        color: #666;
      }
    }
  </style>
  <div class="page-number"><span class="current"></span> of <span class="total"></span></div>
  <div class="page-count">Page <span class="current"></span></div>
  `

  const htmlWithPageNumbers = html.replace('</head>', pageNumbersCss + '</head>')

  return generatePdfFromHtml(htmlWithPageNumbers, options)
}

/**
 * Estimate PDF page count
 * @param html - HTML content
 * @returns Estimated page count
 */
export function estimatePageCount(html: string): number {
  // Rough estimate: 1 page per ~3000 characters
  const charCount = html.replace(/<[^>]*>/g, '').length
  return Math.max(1, Math.ceil(charCount / 3000))
}

/**
 * Validate PDF options
 * @param options - Options to validate
 * @returns Validated options
 */
export function validatePdfOptions(options: PdfGenerateOptions): PdfGenerateOptions {
  const validPageSizes = ['letter', 'legal', 'a4', 'a3']
  const validOrientations = ['portrait', 'landscape']

  return {
    pageSize: validPageSizes.includes(options.pageSize || 'letter')
      ? options.pageSize
      : 'letter',
    orientation: validOrientations.includes(options.orientation || 'portrait')
      ? options.orientation
      : 'portrait',
    displayHeaderFooter: options.displayHeaderFooter ?? true,
    margins: options.margins || {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
    preferCSSPageSize: options.preferCSSPageSize ?? false,
    printBackground: options.printBackground ?? true,
  }
}
