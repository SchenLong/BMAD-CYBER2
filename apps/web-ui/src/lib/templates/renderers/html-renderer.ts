/**
 * HTML Renderer
 * Story 7.5: Template Rendering Engine - Task 5
 *
 * Renders template data as HTML with CSS styling,
 * branding support, and print-friendly layout.
 */

import type { Template, AgentOutput, BrandingConfig } from '@/types/template-render'
import { renderMarkdown } from './markdown-renderer'

/**
 * Render options for HTML output
 */
export interface HtmlRenderOptions {
  /** Include CSS styles */
  includeStyles?: boolean
  /** Branding configuration */
  branding?: BrandingConfig
  /** Theme */
  theme?: 'light' | 'dark' | 'auto'
  /** Print-friendly */
  printFriendly?: boolean
  /** Custom CSS */
  customCss?: string
}

/**
 * Default colors
 */
const DEFAULT_COLORS = {
  primary: '#8B5CF6',
  secondary: '#00D9FF',
  background: '#0a0a0a',
  text: '#e4e4e7',
  muted: '#71717a',
  border: '#27272a',
}

/**
 * Render agent output as HTML
 * @param template - Template to use
 * @param output - Agent output data
 * @param options - Render options
 * @returns Rendered HTML
 */
export function renderHtml(
  template: Template,
  output: AgentOutput,
  options: HtmlRenderOptions = {}
): string {
  const {
    includeStyles = true,
    branding,
    theme = 'dark',
    printFriendly = true,
    customCss,
  } = options

  // Get markdown content first
  const markdown = renderMarkdown(template, output, {
    includeFrontMatter: false,
    includeTOC: true,
    concise: template.onePage || false,
    branding,
  })

  // Convert markdown to HTML
  const bodyHtml = markdownToHtml(markdown)

  // Generate full HTML document
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  ${includeStyles ? generateStyles(theme, branding, customCss, printFriendly) : ''}
</head>
<body class="${theme}">
  <div class="document-container">
    ${bodyHtml}
  </div>
  ${generateFooterHtml(branding)}
</body>
</html>`

  return html
}

/**
 * Generate CSS styles
 */
function generateStyles(
  theme: string,
  branding?: BrandingConfig,
  customCss?: string,
  printFriendly = true
): string {
  const colors = {
    primary: branding?.primaryColor || DEFAULT_COLORS.primary,
    secondary: branding?.secondaryColor || DEFAULT_COLORS.secondary,
    background: branding?.primaryColor ? '#ffffff' : DEFAULT_COLORS.background,
    text: branding?.primaryColor ? '#18181b' : DEFAULT_COLORS.text,
    muted: branding?.primaryColor ? '#71717a' : DEFAULT_COLORS.muted,
    border: branding?.primaryColor ? '#e4e4e7' : DEFAULT_COLORS.border,
  }

  const fontFamily = branding?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

  return `<style>
  :root {
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-background: ${colors.background};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
    --color-border: ${colors.border};
    --font-family: ${fontFamily};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family);
    background-color: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
    padding: 2rem;
  }

  .document-container {
    max-width: 850px;
    margin: 0 auto;
    background: var(--color-background);
    border-radius: 8px;
    ${!branding?.primaryColor ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);' : ''}
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--color-primary);
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--color-border);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: var(--color-secondary);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  code {
    background: var(--color-border);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background: var(--color-border);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  pre code {
    background: none;
    padding: 0;
  }

  blockquote {
    border-left: 4px solid var(--color-primary);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--color-muted);
    font-style: italic;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    background: var(--color-border);
    font-weight: 600;
  }

  hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 2rem 0;
  }

  .header-meta {
    color: var(--color-muted);
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .risk-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .risk-critical { background: #dc2626; color: white; }
  .risk-high { background: #f97316; color: white; }
  .risk-medium { background: #eab308; color: black; }
  .risk-low { background: #22c55e; color: white; }
  .risk-info { background: #3b82f6; color: white; }

  .footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  ${branding?.logo ? `
  .logo-container {
    text-align: center;
    margin-bottom: 1rem;
  }
  .logo-container img {
    max-width: 200px;
    max-height: 100px;
  }
  ` : ''}

  ${customCss || ''}

  ${printFriendly ? generatePrintStyles() : ''}
</style>`
}

/**
 * Generate print styles
 */
function generatePrintStyles(): string {
  return `
@media print {
  body {
    padding: 0;
    background: white;
    color: black;
  }

  .document-container {
    box-shadow: none;
  }

  h2 {
    page-break-before: auto;
    page-break-after: avoid;
  }

  h3 {
    page-break-after: avoid;
  }

  li, p {
    page-break-inside: avoid;
  }

  pre, blockquote {
    page-break-inside: avoid;
  }

  .no-print {
    display: none;
  }
}`
}

/**
 * Convert markdown to HTML (simplified implementation)
 */
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Unordered lists
  html = html.replace(/^\* (.+$)/gim, '<li>$1</li>')
  html = html.replace(/^- (.+$)/gim, '<li>$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+$)/gim, '<li>$1</li>')

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // Fix multiple ul tags
  html = html.replace(/<\/ul>\n<ul>/g, '\n')

  // Blockquotes
  html = html.replace(/^> (.+$)/gim, '<blockquote>$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>')

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')
  html = html.replace(/<p>(<pre>)/g, '$1')
  html = html.replace(/(<\/pre>)<\/p>/g, '$1')
  html = html.replace(/<p>(<blockquote>)/g, '$1')
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1')

  // Risk badges
  html = html.replace(
    /\*\[CRITICAL\]\*/g,
    '<span class="risk-badge risk-critical">CRITICAL</span>'
  )
  html = html.replace(
    /\*\[HIGH\]\*/g,
    '<span class="risk-badge risk-high">HIGH</span>'
  )
  html = html.replace(
    /\*\[MEDIUM\]\*/g,
    '<span class="risk-badge risk-medium">MEDIUM</span>'
  )
  html = html.replace(
    /\*\[LOW\]\*/g,
    '<span class="risk-badge risk-low">LOW</span>'
  )
  html = html.replace(
    /\*\[INFO\]\*/g,
    '<span class="risk-badge risk-info">INFO</span>'
  )

  return html
}

/**
 * Generate footer HTML
 */
function generateFooterHtml(branding?: BrandingConfig): string {
  const org = branding?.organization || 'BMAD System'
  const footerText = branding?.footerText || ''

  return `
<div class="footer">
  <p>Generated by ${org}</p>
  <p>${new Date().toLocaleString()}</p>
  ${footerText ? `<p>${footerText}</p>` : ''}
</div>
`
}

/**
 * Generate standalone HTML section
 * @param title - Section title
 * @param content - Section content (markdown or HTML)
 * @returns HTML section
 */
export function renderHtmlSection(title: string, content: string): string {
  return `
<div class="section">
  <h2>${title}</h2>
  <div class="section-content">
    ${content}
  </div>
</div>
`
}

/**
 * Generate responsive HTML for web view
 * @param template - Template
 * @param output - Agent output
 * @param branding - Branding config
 * @returns Responsive HTML
 */
export function renderResponsiveHtml(
  template: Template,
  output: AgentOutput,
  branding?: BrandingConfig
): string {
  const baseHtml = renderHtml(template, output, {
    branding,
    printFriendly: false,
  })

  // Add responsive meta tags and viewport
  return baseHtml.replace(
    '<head>',
    `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${template.description}">`
  )
}

/**
 * Generate email-compatible HTML
 * @param template - Template
 * @param output - Agent output
 * @param branding - Branding config
 * @returns Email HTML
 */
export function renderEmailHtml(
  template: Template,
  output: AgentOutput,
  branding?: BrandingConfig
): string {
  // Email HTML needs inline styles for compatibility
  const html = renderHtml(template, output, {
    branding,
    printFriendly: false,
  })

  // Convert to inline styles (simplified - in production, use a library like juice)
  return html.replace(/class="([^"]+)"/g, (match, classes) => {
    // Would need to map classes to inline styles here
    return match
  })
}

/**
 * Count characters in HTML (excluding tags)
 * @param html - HTML content
 * @returns Character count
 */
export function countHtmlCharacters(html: string): number {
  return html.replace(/<[^>]*>/g, '').length
}

/**
 * Count words in HTML (excluding tags)
 * @param html - HTML content
 * @returns Word count
 */
export function countHtmlWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, '')
  return text.split(/\s+/).filter(w => w.length > 0).length
}
