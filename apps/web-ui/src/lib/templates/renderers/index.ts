/**
 * Template Renderers Index
 * Story 7.5: Template Rendering Engine
 */

// Markdown renderer
export {
  renderMarkdown,
  renderWithHighlighting,
  renderMarkdownTable,
  truncateToWordCount,
  countMarkdownWords,
  countMarkdownCharacters,
} from './markdown-renderer'

// HTML renderer
export {
  renderHtml,
  renderHtmlSection,
  renderResponsiveHtml,
  renderEmailHtml,
  countHtmlCharacters,
  countHtmlWords,
} from './html-renderer'

// PDF generator
export {
  generatePdf,
  generatePdfFromHtml,
  downloadPdfBrowser,
  generatePdfWithPageNumbers,
  estimatePageCount,
  validatePdfOptions,
} from './exports/pdf-generator'

// DOCX generator
export {
  generateDocx,
  downloadDocxBrowser,
  validateDocxFilename,
} from './exports/docx-generator'
