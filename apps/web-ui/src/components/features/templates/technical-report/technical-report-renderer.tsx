/**
 * Technical Report Renderer
 * Story 7.3: Technical Report Template
 *
 * Renders technical reports with all sections, code highlighting,
 * tables, and table of contents.
 */

'use client'

import React, { useMemo, useState } from 'react'
import type {
  TechnicalReportData,
  TechnicalReportRenderOutput,
  TOCEntry,
  CodeSnippet,
} from '@/types/technical-report'
import { generateTechnicalReportTOC, generateMarkdownTOC, flattenTOC } from '@/lib/templates/formatters/toc-generator'
import { generateMarkdownCodeBlocks } from '@/lib/templates/formatters/code-highlighter'
import { generateMarkdownTable } from '@/lib/templates/formatters/table-generator'

/**
 * Technical Report Renderer Props
 */
export interface TechnicalReportRendererProps {
  /** Report data to render */
  data: TechnicalReportData
  /** Output format */
  format?: 'markdown' | 'html' | 'preview'
  /** Theme for code highlighting */
  theme?: 'dark' | 'light'
  /** Whether to show table of contents */
  showTOC?: boolean
  /** Whether to show line numbers in code blocks */
  showLineNumbers?: boolean
}

/**
 * Main Technical Report Renderer Component
 */
export function TechnicalReportRenderer({
  data,
  format = 'markdown',
  theme = 'dark',
  showTOC = true,
  showLineNumbers = true,
}: TechnicalReportRendererProps) {
  const [isTOCCollapsed, setIsTOCCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const renderOutput = useMemo(() => {
    return renderTechnicalReport(data, { format, theme, showLineNumbers })
  }, [data, format, theme, showLineNumbers])

  const tocEntries = useMemo(() => {
    return generateTechnicalReportTOC()
  }, [])

  const flattenedTOC = useMemo(() => {
    return flattenTOC(tocEntries)
  }, [tocEntries])

  if (format === 'markdown') {
    return (
      <div className="technical-report markdown">
        <MarkdownContent content={renderOutput.markdown} />
      </div>
    )
  }

  return (
    <div className={`technical-report theme-${theme}`}>
      {showTOC && (
        <TableOfContents
          entries={tocEntries}
          isCollapsed={isTOCCollapsed}
          onToggle={() => setIsTOCCollapsed(!isTOCCollapsed)}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
        />
      )}

      <div className="technical-report-content">
        <ReportHeader metadata={data.metadata} />
        <ReportSections data={data} />
        <ReportFooter metadata={data.metadata} />
      </div>
    </div>
  )
}

/**
 * Render technical report to output format
 */
export function renderTechnicalReport(
  data: TechnicalReportData,
  options?: {
    format?: 'markdown' | 'html' | 'preview'
    theme?: 'dark' | 'light'
    showLineNumbers?: boolean
  }
): TechnicalReportRenderOutput {
  const { format = 'markdown', theme = 'dark', showLineNumbers = true } = options || {}

  // Collect all code snippets
  const allCodeSnippets: CodeSnippet[] = [
    ...(data.analysis.codeSnippets || []),
    ...(data.findings.codeExamples || []),
  ]

  // Collect all tables
  const allTables = [
    ...(data.analysis.tables || []),
    ...(data.findings.tables || []),
  ]

  // Generate markdown
  let markdown = generateMarkdownReport(data, { showLineNumbers })

  // Generate HTML if needed
  let html: string | undefined
  if (format === 'html' || format === 'preview') {
    html = generateHtmlReport(data)
  }

  // Generate TOC
  const tableOfContents = generateTechnicalReportTOC()

  // Calculate stats
  const wordCount = markdown.split(/\s+/).length
  const estimatedPages = Math.ceil(wordCount / 500)

  // Collect downloadable artifacts
  const downloadableArtifacts = [...data.appendices.rawDataDumps]

  return {
    markdown,
    html,
    tableOfContents,
    wordCount,
    estimatedPages,
    codeSnippets: allCodeSnippets,
    tables: allTables,
    downloadableArtifacts,
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(
  data: TechnicalReportData,
  options?: { showLineNumbers?: boolean }
): string {
  const { showLineNumbers = true } = options || {}
  let md = ''

  // Title and metadata
  md += `# ${data.metadata.reportType}\n\n`
  md += generateMetadataBlock(data.metadata)
  md += '\n'

  // Table of Contents
  md += generateMarkdownTOC(generateTechnicalReportTOC())
  md += '\n---\n\n'

  // Methodology
  md += generateMethodologySection(data.methodology)
  md += '\n'

  // Data Collection
  md += generateDataCollectionSection(data.dataCollection)
  md += '\n'

  // Analysis
  md += generateAnalysisSection(data.analysis)
  md += '\n'

  // Findings
  md += generateFindingsSection(data.findings)
  md += '\n'

  // Recommendations
  md += generateRecommendationsSection(data.recommendations)
  md += '\n'

  // Appendices
  md += generateAppendicesSection(data.appendices)
  md += '\n'

  return md
}

/**
 * Generate metadata block
 */
function generateMetadataBlock(metadata: TechnicalReportData['metadata']): string {
  let md = '<!-- Metadata\n'
  md += `Report Type: ${metadata.reportType}\n`
  md += `Date: ${metadata.date}\n`
  md += `Prepared By: ${metadata.preparedBy}\n`
  if (metadata.projectName) {
    md += `Project: ${metadata.projectName}\n`
  }
  if (metadata.version) {
    md += `Version: ${metadata.version}\n`
  }
  if (metadata.classification) {
    md += `Classification: ${metadata.classification.toUpperCase()}\n`
  }
  md += '-->\n\n'

  return md
}

/**
 * Generate methodology section
 */
function generateMethodologySection(
  methodology: TechnicalReportData['methodology']
): string {
  let md = '## 1. Methodology\n\n'

  md += '### 1.1 Approach\n\n'
  md += `${methodology.approach}\n\n`

  if (methodology.tools && methodology.tools.length > 0) {
    md += '### 1.2 Tools Used\n\n'
    for (const tool of methodology.tools) {
      md += `- **${tool.name}**`
      if (tool.version) {
        md += ` v${tool.version}`
      }
      if (tool.purpose) {
        md += ` - ${tool.purpose}`
      }
      md += '\n'
    }
    md += '\n'
  }

  if (methodology.scope) {
    md += '### 1.3 Scope and Limitations\n\n'
    md += `${methodology.scope}\n\n`
  }

  return md
}

/**
 * Generate data collection section
 */
function generateDataCollectionSection(
  dataCollection: TechnicalReportData['dataCollection']
): string {
  let md = '## 2. Data Collection\n\n'

  md += '### 2.1 Data Sources\n\n'
  for (const source of dataCollection.sources) {
    md += `- ${source}\n`
  }
  md += '\n'

  if (dataCollection.timestamps && dataCollection.timestamps.length > 0) {
    md += '### 2.2 Collection Timestamps\n\n'
    md += '| Item | Timestamp | Method |\n'
    md += '|------|-----------|--------|\n'
    for (const ts of dataCollection.timestamps) {
      md += `| ${ts.item} | ${ts.timestamp} | ${ts.method || 'N/A'} |\n`
    }
    md += '\n'
  }

  if (dataCollection.metadata) {
    md += '### 2.3 Metadata\n\n'
    for (const [key, value] of Object.entries(dataCollection.metadata)) {
      md += `- **${key}**: ${value}\n`
    }
    md += '\n'
  }

  return md
}

/**
 * Generate analysis section
 */
function generateAnalysisSection(analysis: TechnicalReportData['analysis']): string {
  let md = '## 3. Analysis\n\n'

  md += '### 3.1 Analysis Description\n\n'
  md += `${analysis.description}\n\n`

  if (analysis.techniques && analysis.techniques.length > 0) {
    md += '### 3.2 Analysis Techniques\n\n'
    for (const technique of analysis.techniques) {
      md += `${technique}\n`
    }
    md += '\n'
  }

  if (analysis.codeSnippets && analysis.codeSnippets.length > 0) {
    md += '### 3.3 Code Analysis\n\n'
    md += generateMarkdownCodeBlocks(analysis.codeSnippets)
    md += '\n'
  }

  if (analysis.tables && analysis.tables.length > 0) {
    md += '### 3.4 Analysis Results\n\n'
    for (const table of analysis.tables) {
      md += generateMarkdownTable(table)
      md += '\n'
    }
  }

  return md
}

/**
 * Generate findings section
 */
function generateFindingsSection(findings: TechnicalReportData['findings']): string {
  let md = '## 4. Findings\n\n'

  md += '### 4.1 Detailed Results\n\n'

  if (findings.results.length === 0) {
    md += '*No findings to report.*\n\n'
  } else {
    for (const result of findings.results) {
      md += `#### ${result.title}\n\n`
      md += `**Severity:** ${result.severity.toUpperCase()}\n\n`
      md += `${result.description}\n\n`

      if (result.technicalDetails) {
        md += `**Technical Details:**\n\`\`\`\n${result.technicalDetails}\n\`\`\`\n\n`
      }

      if (result.affectedComponents && result.affectedComponents.length > 0) {
        md += `**Affected Components:**\n`
        for (const component of result.affectedComponents) {
          md += `- ${component}\n`
        }
        md += '\n'
      }
    }
  }

  if (findings.codeExamples && findings.codeExamples.length > 0) {
    md += '### 4.2 Code Examples\n\n'
    md += generateMarkdownCodeBlocks(findings.codeExamples)
    md += '\n'
  }

  return md
}

/**
 * Generate recommendations section
 */
function generateRecommendationsSection(
  recommendations: TechnicalReportData['recommendations']
): string {
  let md = '## 5. Recommendations\n\n'

  md += '### 5.1 Technical Actions\n\n'

  if (recommendations.actions.length === 0) {
    md += '*No recommendations to report.*\n\n'
  } else {
    for (const action of recommendations.actions) {
      md += `#### ${action.title}\n\n`
      md += `**Priority:** ${action.priority.toUpperCase()}\n\n`
      md += `${action.description}\n\n`

      if (action.codeFix) {
        md += '**Remediation Code:**\n\n'
        md += generateMarkdownCodeBlocks([action.codeFix])
        md += '\n'
      }

      if (action.effort) {
        md += `**Estimated Effort:** ${action.effort}\n\n`
      }
    }
  }

  if (recommendations.priorityMatrix && recommendations.priorityMatrix.length > 0) {
    md += '### 5.2 Priority Matrix\n\n'
    for (const matrix of recommendations.priorityMatrix) {
      md += `**${matrix.category}**\n\n`
      md += '| Priority | Count |\n'
      md += '|----------|-------|\n'
      for (const [priority, count] of Object.entries(matrix.counts)) {
        md += `| ${priority.toUpperCase()} | ${count} |\n`
      }
      md += `| **Total** | **${matrix.total}** |\n\n`
    }
  }

  if (recommendations.remediationSteps && recommendations.remediationSteps.length > 0) {
    md += '### 5.3 Remediation Steps\n\n'
    for (const step of recommendations.remediationSteps) {
      md += `${step.stepNumber}. **${step.title}**\n`
      md += `   ${step.instructions}\n\n`

      if (step.codeSnippets && step.codeSnippets.length > 0) {
        md += '   ```\n'
        for (const snippet of step.codeSnippets) {
          md += `   ${snippet.code}\n`
        }
        md += '   ```\n\n'
      }

      if (step.verificationCommands && step.verificationCommands.length > 0) {
        md += '   **Verification:**\n'
        for (const cmd of step.verificationCommands) {
          md += `   \`\`\`bash\n   ${cmd}\n   \`\`\`\n`
        }
        md += '\n'
      }
    }
  }

  return md
}

/**
 * Generate appendices section
 */
function generateAppendicesSection(appendices: TechnicalReportData['appendices']): string {
  let md = '## 6. Appendices\n\n'

  md += '### 6.1 Raw Data\n\n'

  if (appendices.rawDataDumps.length === 0) {
    md += '*No raw data available.*\n\n'
  } else {
    for (const data of appendices.rawDataDumps) {
      md += `#### ${data.title}\n\n`
      md += `**ID:** ${data.id}\n`
      if (data.timestamp) {
        md += `**Timestamp:** ${data.timestamp}\n`
      }
      if (data.source) {
        md += `**Source:** ${data.source}\n`
      }
      md += '\n'

      // Truncate for markdown view
      const preview =
        data.content.length > 1000
          ? data.content.substring(0, 1000) + '\n\n[... truncated ...]'
          : data.content

      md += '```text\n' + preview + '\n```\n\n'

      if (data.filename) {
        md += `*Download: [${data.filename}](${data.filename})*\n\n`
      }
    }
  }

  if (appendices.fullOutputs && appendices.fullOutputs.length > 0) {
    md += '### 6.2 Full Output\n\n'
    for (const output of appendices.fullOutputs) {
      md += `#### ${output.source}\n\n`
      md += `**Timestamp:** ${output.timestamp}\n`
      if (output.command) {
        md += `**Command:** ${output.command}\n`
      }
      md += '\n'

      const preview =
        output.content.length > 500
          ? output.content.substring(0, 500) + '\n\n[... truncated ...]'
          : output.content

      md += '```text\n' + preview + '\n```\n\n'
    }
  }

  if (appendices.artifacts && appendices.artifacts.length > 0) {
    md += '### 6.3 Supporting Artifacts\n\n'
    for (const artifact of appendices.artifacts) {
      md += `- [${artifact.name}](${artifact.path})`
      if (artifact.description) {
        md += ` - ${artifact.description}`
      }
      md += '\n'
    }
    md += '\n'
  }

  return md
}

/**
 * Generate HTML report
 */
function generateHtmlReport(data: TechnicalReportData): string {
  // This is a placeholder - full HTML generation would be more complex
  // In production, use a proper markdown-to-HTML converter
  return `<div class="technical-report-html">${generateMarkdownReport(data)}</div>`
}

/**
 * Report Header Component
 */
function ReportHeader({ metadata }: { metadata: TechnicalReportData['metadata'] }) {
  return (
    <header className="technical-report-header">
      <div className="report-classification">
        {metadata.classification?.toUpperCase()}
      </div>
      <h1 className="report-title">{metadata.reportType}</h1>
      <div className="report-metadata">
        <div className="metadata-row">
          <span className="metadata-label">Date:</span>
          <span className="metadata-value">{new Date(metadata.date).toLocaleDateString()}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Prepared By:</span>
          <span className="metadata-value">{metadata.preparedBy}</span>
        </div>
        {metadata.projectName && (
          <div className="metadata-row">
            <span className="metadata-label">Project:</span>
            <span className="metadata-value">{metadata.projectName}</span>
          </div>
        )}
        {metadata.version && (
          <div className="metadata-row">
            <span className="metadata-label">Version:</span>
            <span className="metadata-value">{metadata.version}</span>
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * Report Sections Component
 */
function ReportSections({ data }: { data: TechnicalReportData }) {
  return (
    <div className="technical-report-sections">
      <MethodologySection data={data.methodology} />
      <DataCollectionSection data={data.dataCollection} />
      <AnalysisSection data={data.analysis} />
      <FindingsSection data={data.findings} />
      <RecommendationsSection data={data.recommendations} />
      <AppendicesSection data={data.appendices} />
    </div>
  )
}

/**
 * Individual Section Components
 */
function MethodologySection({
  data,
}: {
  data: TechnicalReportData['methodology']
}) {
  return (
    <section id="methodology" className="report-section">
      <h2>1. Methodology</h2>
      <h3>1.1 Approach</h3>
      <p>{data.approach}</p>
      {data.tools && data.tools.length > 0 && (
        <>
          <h3>1.2 Tools Used</h3>
          <ul>
            {data.tools.map((tool) => (
              <li key={`tool-${tool.name}-${tool.version || ''}`}>
                <strong>{tool.name}</strong>
                {tool.version && ` v${tool.version}`}
                {tool.purpose && ` - ${tool.purpose}`}
              </li>
            ))}
          </ul>
        </>
      )}
      {data.scope && (
        <>
          <h3>1.3 Scope and Limitations</h3>
          <p>{data.scope}</p>
        </>
      )}
    </section>
  )
}

function DataCollectionSection({
  data,
}: {
  data: TechnicalReportData['dataCollection']
}) {
  return (
    <section id="data-collection" className="report-section">
      <h2>2. Data Collection</h2>
      <h3>2.1 Data Sources</h3>
      <ul>
        {data.sources.map((source, i) => (
          <li key={`source-${i}`}>{source}</li>
        ))}
      </ul>
      {data.timestamps && data.timestamps.length > 0 && (
        <>
          <h3>2.2 Collection Timestamps</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Timestamp</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {data.timestamps.map((ts) => (
                <tr key={`ts-${ts.item}-${ts.timestamp}`}>
                  <td>{ts.item}</td>
                  <td>{ts.timestamp}</td>
                  <td>{ts.method || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function AnalysisSection({ data }: { data: TechnicalReportData['analysis'] }) {
  return (
    <section id="analysis" className="report-section">
      <h2>3. Analysis</h2>
      <h3>3.1 Analysis Description</h3>
      <p>{data.description}</p>
      {data.techniques && data.techniques.length > 0 && (
        <>
          <h3>3.2 Analysis Techniques</h3>
          <ul>
            {data.techniques.map((technique, i) => (
              <li key={`technique-${i}`}>{technique}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function FindingsSection({ data }: { data: TechnicalReportData['findings'] }) {
  return (
    <section id="findings" className="report-section">
      <h2>4. Findings</h2>
      <h3>4.1 Detailed Results</h3>
      {data.results.length === 0 ? (
        <p>No findings to report.</p>
      ) : (
        data.results.map((result, i) => (
          <div key={`finding-${i}-${result.title}`} className={`finding finding-${result.severity}`}>
            <h4>{result.title}</h4>
            <span className={`severity-badge severity-${result.severity}`}>
              {result.severity.toUpperCase()}
            </span>
            <p>{result.description}</p>
            {result.technicalDetails && (
              <details>
                <summary>Technical Details</summary>
                <pre>{result.technicalDetails}</pre>
              </details>
            )}
          </div>
        ))
      )}
    </section>
  )
}

function RecommendationsSection({
  data,
}: {
  data: TechnicalReportData['recommendations']
}) {
  return (
    <section id="recommendations" className="report-section">
      <h2>5. Recommendations</h2>
      <h3>5.1 Technical Actions</h3>
      {data.actions.length === 0 ? (
        <p>No recommendations to report.</p>
      ) : (
        data.actions.map((action, i) => (
          <div key={`action-${i}-${action.title}`} className={`recommendation priority-${action.priority}`}>
            <h4>{action.title}</h4>
            <span className={`priority-badge priority-${action.priority}`}>
              {action.priority.toUpperCase()}
            </span>
            <p>{action.description}</p>
          </div>
        ))
      )}
    </section>
  )
}

function AppendicesSection({
  data,
}: {
  data: TechnicalReportData['appendices']
}) {
  return (
    <section id="appendices" className="report-section">
      <h2>6. Appendices</h2>
      <h3>6.1 Raw Data</h3>
      {data.rawDataDumps.length === 0 ? (
        <p>No raw data available.</p>
      ) : (
        data.rawDataDumps.map((dump, i) => (
          <details key={`dump-${i}-${dump.title}`}>
            <summary>{dump.title}</summary>
            <pre className="raw-data">{dump.content}</pre>
          </details>
        ))
      )}
    </section>
  )
}

/**
 * Table of Contents Component
 */
function TableOfContents({
  entries,
  isCollapsed,
  onToggle,
  activeSection,
  onSectionClick,
}: {
  entries: TOCEntry[]
  isCollapsed: boolean
  onToggle: () => void
  activeSection: string | null
  onSectionClick: (id: string) => void
}) {
  return (
    <nav className={`table-of-contents ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="toc-header">
        <h3>Table of Contents</h3>
        <button
          className="toc-toggle"
          onClick={onToggle}
          aria-label="Toggle table of contents"
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>
      {!isCollapsed && (
        <ul className="toc-list">
          {entries.map((entry) => (
            <TOCEntryItem
              key={entry.id}
              entry={entry}
              isActive={activeSection === entry.id}
              onClick={onSectionClick}
            />
          ))}
        </ul>
      )}
    </nav>
  )
}

/**
 * TOC Entry Item Component
 */
function TOCEntryItem({
  entry,
  isActive,
  onClick,
}: {
  entry: TOCEntry
  isActive: boolean
  onClick: (id: string) => void
}) {
  const hasChildren = entry.children && entry.children.length > 0

  return (
    <li className={`toc-entry toc-level-${entry.level} ${isActive ? 'active' : ''}`}>
      <a
        href={`#${entry.id}`}
        className="toc-link"
        onClick={(e) => {
          e.preventDefault()
          onClick(entry.id)
        }}
      >
        {entry.title}
      </a>
      {hasChildren && (
        <ul className="toc-children">
          {entry.children!.map((child) => (
            <TOCEntryItem
              key={child.id}
              entry={child}
              isActive={isActive}
              onClick={onClick}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Report Footer Component
 */
function ReportFooter({
  metadata,
}: {
  metadata: TechnicalReportData['metadata']
}) {
  return (
    <footer className="technical-report-footer">
      <p>
        End of Report | Generated by BMAD | {new Date(metadata.date).toLocaleString()}
      </p>
      {metadata.classification && (
        <p className="classification-mark">
          This document is classified as <strong>{metadata.classification.toUpperCase()}</strong>
        </p>
      )}
    </footer>
  )
}

/**
 * Markdown Content Display Component
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <pre className="markdown-output">{content}</pre>
    </div>
  )
}
