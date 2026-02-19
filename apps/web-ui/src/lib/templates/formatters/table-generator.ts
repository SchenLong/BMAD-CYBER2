/**
 * Table Generator
 * Story 7.3: Technical Report Template
 *
 * Generates formatted tables for technical reports.
 */

import type { TableData } from '@/types/technical-report'

/**
 * Generate markdown table from data
 */
export function generateMarkdownTable(data: TableData): string {
  const { headers, rows, title, footer } = data

  let markdown = ''

  if (title) {
    markdown += `### ${title}\n\n`
  }

  // Build header row
  markdown += '| ' + headers.join(' | ') + ' |\n'

  // Build separator row
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

  // Build data rows
  for (const row of rows) {
    const cells = row.map((cell) => formatTableCell(cell))
    markdown += '| ' + cells.join(' | ') + ' |\n'
  }

  if (footer) {
    markdown += `\n*${footer}*\n`
  }

  return markdown
}

/**
 * Generate HTML table from data
 */
export function generateHtmlTable(data: TableData): string {
  const { headers, rows, title, footer } = data

  let html = '<div class="technical-table-container">'

  if (title) {
    html += `<caption class="technical-table-title">${escapeHtml(title)}</caption>`
  }

  html += '<table class="technical-table">'

  // Header
  html += '<thead><tr>'
  for (const header of headers) {
    html += `<th>${escapeHtml(header)}</th>`
  }
  html += '</tr></thead>'

  // Body
  html += '<tbody>'
  for (const row of rows) {
    html += '<tr>'
    for (const cell of row) {
      html += `<td>${formatTableCellHtml(cell)}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody>'

  html += '</table>'

  if (footer) {
    html += `<div class="technical-table-footer">${escapeHtml(footer)}</div>`
  }

  html += '</div>'

  return html
}

/**
 * Format table cell for markdown
 */
function formatTableCell(cell: string | number | boolean | null): string {
  if (cell === null || cell === undefined) {
    return '-'
  }

  if (typeof cell === 'boolean') {
    return cell ? '✓' : '✗'
  }

  if (typeof cell === 'number') {
    return cell.toLocaleString()
  }

  // Escape pipe characters and newlines
  return String(cell)
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>')
    .trim()
}

/**
 * Format table cell for HTML
 */
function formatTableCellHtml(cell: string | number | boolean | null): string {
  if (cell === null || cell === undefined) {
    return '<span class="table-cell-empty">-</span>'
  }

  if (typeof cell === 'boolean') {
    return cell
      ? '<span class="table-cell-boolean table-cell-true">✓</span>'
      : '<span class="table-cell-boolean table-cell-false">✗</span>'
  }

  if (typeof cell === 'number') {
    return `<span class="table-cell-number">${cell.toLocaleString()}</span>`
  }

  // Preserve line breaks
  return escapeHtml(String(cell)).replace(/\n/g, '<br>')
}

/**
 * Create table from array of objects
 */
export function tableFromObjects<T extends Record<string, any>>(
  objects: T[],
  options?: {
    title?: string
    columns?: (keyof T)[]
    columnLabels?: Partial<Record<keyof T, string>>
    footer?: string
  }
): TableData {
  if (objects.length === 0) {
    return {
      id: `table-${Date.now()}`,
      headers: [],
      rows: [],
    }
  }

  // Get columns from options or first object
  const columns = options?.columns || (Object.keys(objects[0]) as Array<keyof T>)
  const headers = columns.map(
    (col) => options?.columnLabels?.[col] || String(col)
  )

  const rows = objects.map((obj) =>
    columns.map((col) => obj[col] ?? null)
  )

  return {
    id: `table-${Date.now()}`,
    title: options?.title,
    headers,
    rows,
    footer: options?.footer,
  }
}

/**
 * Create comparison table
 */
export function createComparisonTable(
  items: Record<string, string | number | boolean>[],
  title?: string
): TableData {
  const keys = Object.keys(items[0] || {})
  const headers = ['Feature', ...items.map((_, i) => `Option ${i + 1}`)]

  const rows: TableData['rows'] = keys.map((key) => {
    const row: (string | number | boolean)[] = [key]
    for (const item of items) {
      row.push(item[key] ?? '-')
    }
    return row
  })

  return {
    id: `comparison-${Date.now()}`,
    title,
    headers,
    rows,
  }
}

/**
 * Create statistics table
 */
export function createStatisticsTable(
  stats: Record<string, number>,
  title?: string
): TableData {
  const rows = Object.entries(stats).map(([label, value]) => [label, value])

  return {
    id: `stats-${Date.now()}`,
    title: title || 'Statistics',
    headers: ['Metric', 'Value'],
    rows,
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Sort table rows by column index
 */
export function sortTableRows(
  data: TableData,
  columnIndex: number,
  order: 'asc' | 'desc' = 'asc'
): TableData {
  const sorted = [...data.rows].sort((a, b) => {
    const aVal = a[columnIndex]
    const bVal = b[columnIndex]

    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (order === 'asc') {
      return aStr.localeCompare(bStr)
    }
    return bStr.localeCompare(aStr)
  })

  return { ...data, rows: sorted }
}

/**
 * Filter table rows by condition
 */
export function filterTableRows(
  data: TableData,
  predicate: (row: TableData['rows'][0]) => boolean
): TableData {
  return {
    ...data,
    rows: data.rows.filter(predicate),
  }
}

/**
 * Calculate table column summary
 */
export function calculateColumnSummary(
  data: TableData,
  columnIndex: number
): { sum?: number; avg?: number; min?: number; max?: number; count: number } {
  const values = data.rows
    .map((row) => row[columnIndex])
    .filter((val): val is number => typeof val === 'number')

  if (values.length === 0) {
    return { count: 0 }
  }

  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)

  return { sum, avg, min, max, count: values.length }
}
