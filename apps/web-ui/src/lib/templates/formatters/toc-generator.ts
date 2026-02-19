/**
 * Table of Contents Generator
 * Story 7.3: Technical Report Template
 *
 * Generates hierarchical table of contents for technical reports.
 */

import type { TOCEntry } from '@/types/technical-report'

/**
 * Generate table of contents from markdown headings
 */
export function generateTOCFromMarkdown(
  markdown: string,
  options?: { maxLevel?: number; minLevel?: number }
): TOCEntry[] {
  const { maxLevel = 6, minLevel = 1 } = options || {}
  const entries: TOCEntry[] = []

  // Regex to match markdown headings
  const headingRegex = /^(#{1,6})\s+(.+?)(?:\s*{:#([\w-]+)})?\s*$/gm
  let match
  let index = 0

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = match[3] || slugify(title)

    if (level < minLevel || level > maxLevel) {
      continue
    }

    entries.push({
      id,
      title,
      level,
      pageNumber: undefined, // Will be calculated during PDF export
    })

    index++
  }

  // Build hierarchical structure
  return buildTOCHierarchy(entries)
}

/**
 * Build hierarchical TOC structure from flat entries
 */
export function buildTOCHierarchy(entries: TOCEntry[]): TOCEntry[] {
  if (entries.length === 0) {
    return []
  }

  const result: TOCEntry[] = []
  const stack: Array<{ entry: TOCEntry; children: TOCEntry[] }> = []

  for (const entry of entries) {
    const node = { ...entry, children: [] }

    // Pop entries from stack that are at same or higher level
    while (stack.length > 0 && stack[stack.length - 1].entry.level >= entry.level) {
      const popped = stack.pop()!
      // Add popped entry to its parent's children or to result
      if (stack.length > 0) {
        stack[stack.length - 1].children.push({ ...popped.entry, children: popped.children })
      } else {
        result.push({ ...popped.entry, children: popped.children })
      }
    }

    stack.push({ entry: node, children: [] })
  }

  // Add remaining entries (in reverse order since we pop from stack)
  while (stack.length > 0) {
    const popped = stack.pop()!
    if (stack.length > 0) {
      // Add to the parent's children
      stack[stack.length - 1].children.push({ ...popped.entry, children: popped.children })
    } else {
      // Top-level entry
      result.push({ ...popped.entry, children: popped.children })
    }
  }

  return result
}

/**
 * Generate TOC for technical report sections
 */
export function generateTechnicalReportTOC(): TOCEntry[] {
  return [
    {
      id: 'methodology',
      title: '1. Methodology',
      level: 1,
      children: [
        { id: 'methodology-approach', title: '1.1 Approach', level: 2 },
        { id: 'methodology-tools', title: '1.2 Tools Used', level: 2 },
        { id: 'methodology-scope', title: '1.3 Scope and Limitations', level: 2 },
      ],
    },
    {
      id: 'data-collection',
      title: '2. Data Collection',
      level: 1,
      children: [
        { id: 'data-sources', title: '2.1 Data Sources', level: 2 },
        { id: 'data-timestamps', title: '2.2 Collection Timestamps', level: 2 },
        { id: 'data-metadata', title: '2.3 Metadata', level: 2 },
      ],
    },
    {
      id: 'analysis',
      title: '3. Analysis',
      level: 1,
      children: [
        { id: 'analysis-techniques', title: '3.1 Analysis Techniques', level: 2 },
        { id: 'analysis-processing', title: '3.2 Data Processing', level: 2 },
        { id: 'analysis-validation', title: '3.3 Validation Methods', level: 2 },
      ],
    },
    {
      id: 'findings',
      title: '4. Findings',
      level: 1,
      children: [
        { id: 'findings-detailed', title: '4.1 Detailed Results', level: 2 },
        { id: 'findings-evidence', title: '4.2 Evidence References', level: 2 },
        { id: 'findings-supporting', title: '4.3 Supporting Data', level: 2 },
      ],
    },
    {
      id: 'recommendations',
      title: '5. Recommendations',
      level: 1,
      children: [
        { id: 'recommendations-actions', title: '5.1 Technical Actions', level: 2 },
        { id: 'recommendations-priority', title: '5.2 Priority Matrix', level: 2 },
        { id: 'recommendations-remediation', title: '5.3 Remediation Steps', level: 2 },
      ],
    },
    {
      id: 'appendices',
      title: '6. Appendices',
      level: 1,
      children: [
        { id: 'appendices-raw', title: '6.1 Raw Data Dump', level: 2 },
        { id: 'appendices-output', title: '6.2 Full Agent Output', level: 2 },
        { id: 'appendices-artifacts', title: '6.3 Supporting Artifacts', level: 2 },
      ],
    },
  ]
}

/**
 * Generate markdown TOC
 */
export function generateMarkdownTOC(entries: TOCEntry[]): string {
  let markdown = '## Table of Contents\n\n'

  for (const entry of entries) {
    markdown += generateEntryMarkdown(entry, 0)
  }

  return markdown
}

/**
 * Generate single TOC entry as markdown
 */
function generateEntryMarkdown(entry: TOCEntry, depth: number): string {
  const indent = '  '.repeat(depth)
  const indentInner = '  '.repeat(depth + 1)
  const bullet = depth === 0 ? '-' : '*'

  let markdown = `${indent}${bullet} [${entry.title}](#${entry.id})\n`

  if (entry.children && entry.children.length > 0) {
    for (const child of entry.children) {
      markdown += generateEntryMarkdown(child, depth + 1)
    }
  }

  return markdown
}

/**
 * Generate HTML TOC with anchor links
 */
export function generateHtmlTOC(entries: TOCEntry[]): string {
  let html = '<nav class="table-of-contents">\n'
  html += '<h2>Table of Contents</h2>\n'
  html += '<ul class="toc-list">\n'

  for (const entry of entries) {
    html += generateEntryHtml(entry, 0)
  }

  html += '</ul>\n</nav>'

  return html
}

/**
 * Generate single TOC entry as HTML
 */
function generateEntryHtml(entry: TOCEntry, depth: number): string {
  const indent = '  '.repeat(depth + 1)
  const className = depth === 0 ? 'toc-item' : `toc-item toc-item-level-${entry.level}`

  let html = `${indent}<li class="${className}">\n`
  html += `${indent}  <a href="#${entry.id}" class="toc-link">${entry.title}</a>\n`

  if (entry.children && entry.children.length > 0) {
    html += `${indent}  <ul class="toc-children">\n`
    for (const child of entry.children) {
      html += generateEntryHtml(child, depth + 1)
    }
    html += `${indent}  </ul>\n`
  }

  html += `${indent}</li>\n`

  return html
}

/**
 * Generate collapsible TOC component data
 */
export function generateCollapsibleTOC(entries: TOCEntry[]): {
  structure: TOCEntry[]
  defaultExpanded: string[]
} {
  // Get top-level entry IDs
  const defaultExpanded = entries
    .filter((e) => e.level === 1)
    .map((e) => e.id)

  return {
    structure: entries,
    defaultExpanded,
  }
}

/**
 * Update page numbers for TOC entries
 */
export function updatePageNumbers(
  entries: TOCEntry[],
  pageMap: Record<string, number>
): TOCEntry[] {
  return entries.map((entry) => ({
    ...entry,
    pageNumber: pageMap[entry.id],
    children: entry.children
      ? updatePageNumbers(entry.children, pageMap)
      : undefined,
  }))
}

/**
 * Flatten TOC entries to array
 */
export function flattenTOC(entries: TOCEntry[]): TOCEntry[] {
  const result: TOCEntry[] = []

  function traverse(entry: TOCEntry) {
    result.push({ ...entry, children: undefined })
    if (entry.children) {
      for (const child of entry.children) {
        traverse(child)
      }
    }
  }

  for (const entry of entries) {
    traverse(entry)
  }

  return result
}

/**
 * Find TOC entry by ID
 */
export function findTOCEntry(
  entries: TOCEntry[],
  id: string
): TOCEntry | undefined {
  for (const entry of entries) {
    if (entry.id === id) {
      return entry
    }
    if (entry.children) {
      const found = findTOCEntry(entry.children, id)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

/**
 * Slugify text for anchor IDs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
