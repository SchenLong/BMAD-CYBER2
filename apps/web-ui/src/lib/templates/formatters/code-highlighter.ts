/**
 * Code Highlighter
 * Story 7.3: Technical Report Template
 *
 * Syntax highlighting for code blocks using Shiki.
 * Supports multiple languages with dark/light theme support.
 */

import type { CodeLanguage, CodeSnippet } from '@/types/technical-report'

// Shiki is imported dynamically to avoid SSR issues
type ShikiHighlighter = any
let shikiHighlighter: ShikiHighlighter | null = null
let highlighterInitPromise: Promise<any> | null = null

/**
 * Get Shiki highlighter instance (singleton)
 */
async function getHighlighter() {
  const { getHighlighter: getShikiHighlighter } = await import('shiki')

  if (!shikiHighlighter) {
    shikiHighlighter = await getShikiHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'python',
        'javascript',
        'typescript',
        'bash',
        'shell',
        'json',
        'yaml',
        'sql',
        'markdown',
        'html',
        'css',
        'xml',
        'java',
        'c',
        'cpp',
        'csharp',
        'go',
        'rust',
        'php',
        'ruby',
      ],
    })
  }

  return shikiHighlighter
}

/**
 * Initialize highlighter (call once during app init)
 */
export async function initializeCodeHighlighter() {
  if (!highlighterInitPromise) {
    highlighterInitPromise = getHighlighter()
  }
  return highlighterInitPromise
}

/**
 * Highlight code snippet to HTML
 * @param snippet - Code snippet to highlight
 * @param theme - Theme name (dark or light)
 * @returns Highlighted HTML
 */
export async function highlightCode(
  snippet: CodeSnippet,
  theme: 'dark' | 'light' = 'dark'
): Promise<string> {
  // Validate input
  if (!snippet || !snippet.code) {
    return '<div class="code-block code-block-empty"><pre><code><!-- No code provided --></code></pre></div>'
  }

  const highlighter = await initializeCodeHighlighter()

  const themeName = theme === 'dark' ? 'github-dark' : 'github-light'

  try {
    const html = highlighter.codeToHtml(snippet.code, {
      lang: snippet.language || 'text',
      theme: themeName,
    })

    return wrapCodeBlock(html, snippet)
  } catch (error) {
    // Fallback for unsupported languages or errors
    console.warn(`Failed to highlight code with language ${snippet.language}, using plain text:`, error)
    return wrapCodeBlock(escapeHtml(snippet.code), snippet, true)
  }
}

/**
 * Highlight multiple code snippets in parallel
 */
export async function highlightCodeBlocks(
  snippets: CodeSnippet[],
  theme: 'dark' | 'light' = 'dark'
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  await Promise.all(
    snippets.map(async (snippet) => {
      const html = await highlightCode(snippet, theme)
      results.set(snippet.id, html)
    })
  )

  return results
}

/**
 * Generate markdown code block
 */
export function generateMarkdownCodeBlock(snippet: CodeSnippet): string {
  const language = snippet.language || 'text'
  const title = snippet.title ? ` // ${snippet.title}` : ''

  // Add source reference if available
  const sourceRef = snippet.source ? `\n// Source: ${snippet.source}\n` : ''

  return `\`\`\`${language}${title}${sourceRef}\n${snippet.code}\n\`\`\``
}

/**
 * Generate markdown code blocks from multiple snippets
 */
export function generateMarkdownCodeBlocks(snippets: CodeSnippet[]): string {
  return snippets.map(generateMarkdownCodeBlock).join('\n\n')
}

/**
 * Wrap highlighted HTML in container with metadata
 */
function wrapCodeBlock(html: string, snippet: CodeSnippet, isPlain: boolean = false): string {
  const language = snippet.language || 'text'
  const title = snippet.title || ''

  const classes = [
    'code-block',
    `code-block-${language}`,
    isPlain ? 'code-block-plain' : 'code-block-highlighted',
    snippet.showLineNumbers ? 'code-block-line-numbers' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const titleHtml = title
    ? `<div class="code-block-title">${escapeHtml(title)}</div>`
    : ''

  const sourceHtml = snippet.source
    ? `<div class="code-block-source">Source: ${escapeHtml(snippet.source)}</div>`
    : ''

  return `
<div class="${classes}" data-language="${language}">
  ${titleHtml}
  ${sourceHtml}
  <pre class="code-block-pre"><code class="code-block-code">${html}</code></pre>
</div>
  `.trim()
}

/**
 * Escape HTML entities - SSR-safe implementation
 */
function escapeHtml(text: string): string {
  // SSR-safe: use string replacement instead of DOM API
  if (typeof text !== 'string') {
    return ''
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Extract code snippets from text content
 * Finds code blocks in markdown format
 */
export function extractCodeSnippets(text: string, prefix: string = 'snippet'): CodeSnippet[] {
  if (!text || typeof text !== 'string') {
    return []
  }

  const snippets: CodeSnippet[] = []
  const codeBlockRegex = /```(\w+)?(?:\s*\/\/\s*(.+?))?\n([\s\S]+?)```/g
  let match
  let index = 0

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const rawLanguage = match[1] || 'text'
    // Validate language against known types
    const validLanguages: CodeLanguage[] = [
      'python', 'javascript', 'typescript', 'bash', 'shell', 'json', 'yaml',
      'sql', 'markdown', 'html', 'css', 'xml', 'java', 'c', 'cpp', 'csharp',
      'go', 'rust', 'php', 'ruby', 'text'
    ]
    const language: CodeLanguage = validLanguages.includes(rawLanguage as CodeLanguage)
      ? (rawLanguage as CodeLanguage)
      : 'text'

    const title = match[2] || undefined
    const code = match[3].trim()

    snippets.push({
      id: `${prefix}-${index}`,
      language,
      code,
      title,
      showLineNumbers: code.split('\n').length > 10,
    })

    index++
  }

  return snippets
}

/**
 * Detect language from code content
 */
export function detectLanguage(code: string): CodeLanguage {
  const patterns: Partial<Record<CodeLanguage, RegExp[]>> = {
    python: [/^import\s+\w+/m, /^def\s+\w+/m, /^class\s+\w+.*:/m, /^from\s+\w+\s+import/m],
    javascript: [/^(const|let|var)\s+\w+\s*=/m, /function\s*\w*\s*\(/m, /=>\s*{/m, /^import\s+.*from/m],
    typescript: [/^:\s*(string|number|boolean|any|void)\b/m, /^interface\s+\w+/m, /^type\s+\w+\s*=/m],
    bash: [/^#!/m, /^\s*(export\s+)?\w+=/m, /^\s*(if|then|fi|do|done|for|while)\b/m],
    shell: [/^#!/m, /^\s*(export\s+)?\w+=/m, /^\s*(if|then|fi|do|done|for|while)\b/m],
    json: [/^\s*{[\s\S]*":\s*"/m, /^\s*\[[\s\S]*\]/m],
    yaml: [/^\w+\s*:/m, /^  \w+\s*:/m, /^-\s+\w+/m],
    sql: [/^SELECT\s+/im, /^INSERT\s+INTO/im, /^UPDATE\s+\w+\s+SET/im, /^CREATE\s+TABLE/im],
    markdown: [/^#{1,6}\s/m, /^\*{3,}/m, /^\[.+\]\(.+\)/m],
    html: [/^<\w+[^>]*>/m, /^<\/\w+>/m],
    css: [/^[\.\#]\w+\s*{/m, /^\w+:\s*[^;]+;/m],
    xml: [/^<\?xml/m, /^<\w+[^>]*>/m, /^<\/\w+>/m],
    java: [/^public\s+(class|interface|enum)\s+\w+/m, /^package\s+[\w.]+;/m, /^\s*(private|protected|public)\s+/m],
    c: [/^#include\s+</m, /^int\s+main\s*\(/m, /^printf\s*\(/m],
    cpp: [/^#include\s+</m, /^std::/m, /^class\s+\w+/m, /^using\s+namespace\s+/m],
    csharp: [/^using\s+System;/m, /^namespace\s+\w+/m, /^\s*(public|private|internal)\s+class\s+\w+/m],
    go: [/^package\s+main/m, /^func\s+\w+\(/m, /import\s+\(/m],
    rust: [/^use\s+/m, /^fn\s+main\s*\(/m, /^impl\s+\w+/m],
    php: [/^<\?php/m, /\$\w+\s*=/m, /^function\s+\w*\s*\(/m],
    ruby: [/^require\s+/m, /^def\s+\w+/m, /^class\s+\w+/m, /^\w+\s*do\s*\|/m],
    text: [],
  }

  for (const [language, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (regex.test(code)) {
        return language as CodeLanguage
      }
    }
  }

  return 'text'
}

/**
 * Format code for display with line numbers
 */
export function formatWithLineNumbers(code: string): string {
  const lines = code.split('\n')
  const maxLineNum = lines.length.toString().length

  return lines
    .map((line, i) => {
      const lineNum = (i + 1).toString().padStart(maxLineNum, ' ')
      return `${lineNum} | ${line}`
    })
    .join('\n')
}

/**
 * Get CSS class for language
 */
export function getLanguageClass(language: CodeLanguage): string {
  return `language-${language}`
}

/**
 * Get display name for language
 */
export function getLanguageDisplayName(language: CodeLanguage): string {
  const names: Record<CodeLanguage, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    bash: 'Bash',
    shell: 'Shell',
    json: 'JSON',
    yaml: 'YAML',
    sql: 'SQL',
    markdown: 'Markdown',
    html: 'HTML',
    css: 'CSS',
    xml: 'XML',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    text: 'Plain Text',
  }

  return names[language] || 'Unknown'
}
