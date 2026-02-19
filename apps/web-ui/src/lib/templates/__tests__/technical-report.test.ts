/**
 * Technical Report Template Tests
 * Story 7.3: Technical Report Template
 *
 * Tests for technical report data mapping, formatting, and rendering.
 */

import { describe, it, expect } from '@jest/globals'
import {
  mapAgentOutputToTechnicalReport,
  mapRawDataToTechnicalReport,
} from '../technical-data-mapper'
import {
  generateMarkdownTable,
  tableFromObjects,
  createStatisticsTable,
} from '../formatters/table-generator'
import {
  extractCodeSnippets,
  detectLanguage,
  generateMarkdownCodeBlock,
} from '../formatters/code-highlighter'
import {
  generateTechnicalReportTOC,
  generateMarkdownTOC,
  buildTOCHierarchy,
} from '../formatters/toc-generator'
import type { TechnicalAgentOutput, CodeSnippet } from '@/types/technical-report'

describe('Technical Report Data Mapper', () => {
  it('should map agent output to technical report data', () => {
    const agentOutput: TechnicalAgentOutput = {
      agent: 'test-agent',
      workflow: 'test-workflow',
      summary: 'Test summary',
      projectName: 'Test Project',
      findings: [
        {
          title: 'Test Finding',
          description: 'Test description',
          severity: 'high',
        },
      ],
      recommendations: ['Fix the issue'],
      timestamp: '2025-02-15T10:00:00Z',
    }

    const report = mapAgentOutputToTechnicalReport(agentOutput)

    expect(report.metadata.preparedBy).toBe('test-agent')
    expect(report.metadata.projectName).toBe('Test Project')
    expect(report.methodology.approach).toContain('Test summary')
    expect(report.findings.results).toHaveLength(1)
    expect(report.findings.results[0].title).toBe('Test Finding')
    expect(report.findings.results[0].severity).toBe('high')
    expect(report.recommendations.actions).toHaveLength(1)
  })

  it('should handle empty agent output', () => {
    const agentOutput: TechnicalAgentOutput = {}

    const report = mapAgentOutputToTechnicalReport(agentOutput)

    expect(report.metadata.preparedBy).toBe('BMAD System')
    expect(report.methodology.approach).toBeTruthy()
    expect(report.findings.results).toHaveLength(0)
  })

  it('should map raw data to technical report', () => {
    const data = {
      summary: 'Raw data summary',
      findings: [{ title: 'Finding', severity: 'medium' as const }],
    }

    const report = mapRawDataToTechnicalReport(data)

    expect(report.metadata.reportType).toBe('Technical Report')
    expect(report.methodology.approach).toBeTruthy()
  })

  it('should return empty report for null input', () => {
    const report = mapRawDataToTechnicalReport(null)

    expect(report.metadata.reportType).toBe('Technical Report')
    expect(report.methodology.approach).toBe('No methodology information available.')
  })
})

describe('Code Highlighter', () => {
  it('should detect Python language', () => {
    const code = `import os
def hello():
    print("Hello, World!")`

    const detected = detectLanguage(code)

    expect(detected).toBe('python')
  })

  it('should detect JavaScript language', () => {
    const code = `const x = 10;
const y = () => console.log(x);`

    const detected = detectLanguage(code)

    expect(detected).toBe('javascript')
  })

  it('should detect TypeScript language', () => {
    const code = `interface User {
  name: string;
  age: number;
}`

    const detected = detectLanguage(code)

    expect(detected).toBe('typescript')
  })

  it('should detect JSON language', () => {
    const code = `{"name": "test", "value": 123}`

    const detected = detectLanguage(code)

    expect(detected).toBe('json')
  })

  it('should extract code snippets from markdown', () => {
    const markdown = `
Some text.

\`\`\`python
def test():
    pass
\`\`\`

More text.

\`\`\`javascript
const x = 10;
\`\`\`
`

    const snippets = extractCodeSnippets(markdown)

    expect(snippets).toHaveLength(2)
    expect(snippets[0].language).toBe('python')
    expect(snippets[1].language).toBe('javascript')
  })

  it('should generate markdown code block', () => {
    const snippet: CodeSnippet = {
      id: 'test',
      language: 'python',
      code: 'print("hello")',
      title: 'Test Code',
    }

    const markdown = generateMarkdownCodeBlock(snippet)

    expect(markdown).toContain('```python')
    expect(markdown).toContain('print("hello")')
    expect(markdown).toContain('Test Code')
    expect(markdown).toContain('```')
  })

  it('should default to text for unknown language', () => {
    const code = `Just some plain text
with no code patterns.`

    const detected = detectLanguage(code)

    expect(detected).toBe('text')
  })
})

describe('Table Generator', () => {
  it('should generate markdown table', () => {
    const table = {
      id: 'test-table',
      headers: ['Name', 'Value', 'Status'],
      rows: [
        ['Item 1', 100, true],
        ['Item 2', 200, false],
      ],
      title: 'Test Table',
    }

    const markdown = generateMarkdownTable(table)

    expect(markdown).toContain('### Test Table')
    expect(markdown).toContain('| Name | Value | Status |')
    expect(markdown).toContain('| --- |')
    expect(markdown).toContain('| Item 1 | 100 | ✓ |')
    expect(markdown).toContain('| Item 2 | 200 | ✗ |')
  })

  it('should create table from objects', () => {
    const objects = [
      { name: 'Alice', age: 30, active: true },
      { name: 'Bob', age: 25, active: false },
    ]

    const table = tableFromObjects(objects, {
      title: 'Users',
    })

    expect(table.headers).toEqual(['name', 'age', 'active'])
    expect(table.rows).toHaveLength(2)
    expect(table.rows[0]).toEqual(['Alice', 30, true])
    expect(table.title).toBe('Users')
  })

  it('should create statistics table', () => {
    const stats = {
      total: 100,
      passed: 85,
      failed: 15,
    }

    const table = createStatisticsTable(stats)

    expect(table.headers).toEqual(['Metric', 'Value'])
    expect(table.rows.length).toBeGreaterThan(0)
  })

  it('should handle empty rows', () => {
    const table = {
      id: 'empty-table',
      headers: ['A', 'B'],
      rows: [],
    }

    const markdown = generateMarkdownTable(table)

    expect(markdown).toContain('| A | B |')
  })
})

describe('TOC Generator', () => {
  it('should generate technical report TOC', () => {
    const toc = generateTechnicalReportTOC()

    expect(toc).toHaveLength(6) // 6 main sections
    expect(toc[0].id).toBe('methodology')
    expect(toc[0].title).toBe('1. Methodology')
    expect(toc[0].children).toHaveLength(3)
    expect(toc[0].children![0].title).toBe('1.1 Approach')
  })

  it('should generate markdown TOC', () => {
    const toc = [
      {
        id: 'section1',
        title: 'Section 1',
        level: 1,
        children: [
          { id: 'section1-1', title: 'Section 1.1', level: 2 },
        ],
      },
      {
        id: 'section2',
        title: 'Section 2',
        level: 1,
      },
    ]

    const markdown = generateMarkdownTOC(toc)

    expect(markdown).toContain('## Table of Contents')
    expect(markdown).toContain('[Section 1](#section1)')
    expect(markdown).toContain('[Section 1.1](#section1-1)')
    expect(markdown).toContain('[Section 2](#section2)')
  })

  it('should build hierarchical TOC structure', () => {
    const entries = [
      { id: '1', title: 'Section 1', level: 1 },
      { id: '1-1', title: 'Section 1.1', level: 2 },
      { id: '1-2', title: 'Section 1.2', level: 2 },
      { id: '2', title: 'Section 2', level: 1 },
    ]

    const hierarchy = buildTOCHierarchy(entries)

    expect(hierarchy).toHaveLength(2)
    expect(hierarchy[0].children).toHaveLength(2)
    // hierarchy[1].children is an empty array, not undefined
    expect(hierarchy[1].children || []).toHaveLength(0)
  })

  it('should handle empty entries', () => {
    const hierarchy = buildTOCHierarchy([])

    expect(hierarchy).toHaveLength(0)
  })
})

describe('Technical Report Integration', () => {
  it('should create complete technical report from agent output', () => {
    const agentOutput: TechnicalAgentOutput = {
      agent: 'security-analyst',
      workflow: 'vulnerability-scan',
      summary: 'Completed security vulnerability scan',
      projectName: 'example.com',
      methodology: 'Automated scanning with manual validation',
      tools: [
        { name: 'Nmap', version: '7.94', purpose: 'Port scanning' },
        { name: 'Nuclei', purpose: 'Vulnerability scanning' },
      ],
      analysisSteps: [
        '1. Performed port scan',
        '2. Scanned for vulnerabilities',
        '3. Validated findings',
      ],
      codeOutput:
        '```python\ndef scan(target):\n    results = []\n    # scanning logic\n    return results\n```',
      findings: [
        {
          title: 'Open SSH Port',
          description: 'SSH port 22 is open to the internet',
          severity: 'medium',
          category: 'network',
        },
        {
          title: 'Outdated SSL Certificate',
          description: 'SSL certificate uses weak encryption',
          severity: 'high',
          category: 'crypto',
        },
      ],
      recommendations: [
        'Restrict SSH access to specific IP ranges',
        'Update SSL certificate with strong encryption',
      ],
      timestamps: {
        'Scan Start': '2025-02-15T10:00:00Z',
        'Scan End': '2025-02-15T10:30:00Z',
      },
      rawData: {
        'scan-results.json': JSON.stringify({ total_ports: 100, open_ports: 5 }),
      },
      timestamp: '2025-02-15T10:30:00Z',
    }

    const report = mapAgentOutputToTechnicalReport(agentOutput)

    // Verify metadata
    expect(report.metadata.preparedBy).toBe('security-analyst')
    expect(report.metadata.projectName).toBe('example.com')

    // Verify methodology
    expect(report.methodology.approach).toContain('Automated scanning')
    expect(report.methodology.tools).toHaveLength(2)
    expect(report.methodology.tools![0].name).toBe('Nmap')

    // Verify data collection
    expect(report.dataCollection.sources).toHaveLength(2)
    expect(report.dataCollection.timestamps).toHaveLength(2)

    // Verify analysis
    expect(report.analysis.description).toBeTruthy()
    expect(report.analysis.codeSnippets).toHaveLength(1)
    expect(report.analysis.codeSnippets![0].language).toBe('python')

    // Verify findings
    expect(report.findings.results).toHaveLength(2)
    expect(report.findings.results[0].severity).toBe('medium')
    expect(report.findings.results[1].severity).toBe('high')

    // Verify recommendations
    expect(report.recommendations.actions).toHaveLength(2)
    expect(report.recommendations.actions[0].priority).toBe('medium')

    // Verify appendices
    expect(report.appendices.rawDataDumps).toHaveLength(1)
    expect(report.appendices.rawDataDumps[0].title).toBe('scan-results.json')
  })

  it('should include all six required sections', () => {
    const agentOutput: TechnicalAgentOutput = {
      summary: 'Test',
      findings: [],
    }

    const report = mapAgentOutputToTechnicalReport(agentOutput)

    expect(report.methodology).toBeDefined()
    expect(report.dataCollection).toBeDefined()
    expect(report.analysis).toBeDefined()
    expect(report.findings).toBeDefined()
    expect(report.recommendations).toBeDefined()
    expect(report.appendices).toBeDefined()
  })
})
