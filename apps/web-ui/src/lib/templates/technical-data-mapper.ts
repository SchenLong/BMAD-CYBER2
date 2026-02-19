/**
 * Technical Report Data Mapper
 * Story 7.3: Technical Report Template
 *
 * Maps agent and workflow outputs to technical report template data.
 * Handles extraction of methodology, data collection, analysis, findings,
 * recommendations, and appendices with code snippets and raw data.
 */

import type {
  TechnicalReportData,
  TechnicalReportMetadata,
  MethodologyData,
  DataCollectionData,
  AnalysisData,
  FindingsData,
  RecommendationsData,
  AppendicesData,
  CodeSnippet,
  RawDataReference,
  TableData,
  EvidenceReference,
  ToolEntry,
  FindingResult,
  RecommendationAction,
  RemediationStep,
  FullOutputReference,
  SupportingArtifact,
  CodeLanguage,
} from '@/types/technical-report'
import type { AgentOutput, Finding } from './data-mapper'
import { extractCodeSnippets, detectLanguage } from './formatters/code-highlighter'
import { tableFromObjects, createStatisticsTable } from './formatters/table-generator'
import { calculateRisk } from './risk-calculator'

/**
 * Extended agent output for technical reports
 */
export interface TechnicalAgentOutput extends AgentOutput {
  /** Detailed methodology description */
  methodology?: string
  /** Tools used with versions */
  tools?: ToolEntry[]
  /** Analysis steps taken */
  analysisSteps?: string[]
  /** Code produced during analysis */
  codeOutput?: string | CodeSnippet[]
  /** Raw data collected */
  rawData?: string | Record<string, unknown> | RawDataReference[]
  /** Full output log */
  fullOutput?: string
  /** Timestamps for data collection */
  timestamps?: Record<string, string>
  /** Artifacts produced */
  artifacts?: SupportingArtifact[]
}

/**
 * Map agent output to technical report data
 */
export function mapAgentOutputToTechnicalReport(
  output: TechnicalAgentOutput
): TechnicalReportData {
  const metadata = generateMetadata(output)
  const methodology = mapMethodology(output)
  const dataCollection = mapDataCollection(output)
  const analysis = mapAnalysis(output)
  const findings = mapFindings(output)
  const recommendations = mapRecommendations(output, findings)
  const appendices = mapAppendices(output)

  return {
    metadata,
    methodology,
    dataCollection,
    analysis,
    findings,
    recommendations,
    appendices,
  }
}

/**
 * Generate report metadata
 */
function generateMetadata(output: TechnicalAgentOutput): TechnicalReportMetadata {
  return {
    reportType: 'Technical Report',
    date: output.timestamp || new Date().toISOString(),
    preparedBy: output.agent || output.user || 'BMAD System',
    projectName: output.projectName || output.workflow,
    version: '1.0',
    classification: 'internal',
  }
}

/**
 * Map methodology section
 */
function mapMethodology(output: TechnicalAgentOutput): MethodologyData {
  const approach =
    output.methodology ||
    output.summary ||
    `Automated analysis conducted using industry-standard tools and techniques.`

  const tools = output.tools || inferTools(output)

  return {
    approach,
    tools,
    scope: output.projectName ? `Analysis of ${output.projectName}` : undefined,
    techniques: output.analysisSteps,
  }
}

/**
 * Infer tools used from output
 */
function inferTools(output: TechnicalAgentOutput): ToolEntry[] {
  const tools: ToolEntry[] = []

  // Common tools by workflow type
  const workflowTools: Record<string, ToolEntry[]> = {
    'network-assessment': [
      { name: 'Nmap', version: '7.94', purpose: 'Network scanning' },
      { name: 'Masscan', purpose: 'High-speed port discovery' },
    ],
    'web-assessment': [
      { name: 'Nuclei', purpose: 'Vulnerability scanning' },
      { name: 'Burp Suite', purpose: 'Web application testing' },
    ],
    'osint': [
      { name: 'TheHarvester', purpose: 'Email/subdomain gathering' },
      { name: 'Sherlock', purpose: 'Username enumeration' },
    ],
  }

  if (output.workflow) {
    const detected = workflowTools[output.workflow]
    if (detected) {
      tools.push(...detected)
    }
  }

  return tools
}

/**
 * Map data collection section
 */
function mapDataCollection(output: TechnicalAgentOutput): DataCollectionData {
  const sources = extractDataSources(output)

  const timestamps = output.timestamps
    ? Object.entries(output.timestamps).map(([item, timestamp]) => ({
        item,
        timestamp,
      }))
    : undefined

  const rawData = output.rawData ? normalizeRawData(output.rawData) : undefined

  return {
    sources,
    timestamps,
    metadata: {
      collector: output.agent || 'BMAD System',
      collectionDate: output.timestamp || new Date().toISOString(),
    },
    rawData,
  }
}

/**
 * Extract data sources from output
 */
function extractDataSources(output: TechnicalAgentOutput): string[] {
  const sources: string[] = []

  if (output.projectName) {
    sources.push(`Target: ${output.projectName}`)
  }

  if (output.workflow) {
    sources.push(`Workflow: ${output.workflow}`)
  }

  // Add generic sources if no specific ones found
  if (sources.length === 0) {
    sources.push('Automated data collection')
    sources.push('Publicly available information')
  }

  return sources
}

/**
 * Normalize raw data to references
 */
function normalizeRawData(
  rawData: string | Record<string, unknown> | RawDataReference[]
): RawDataReference[] {
  if (Array.isArray(rawData)) {
    return rawData
  }

  if (typeof rawData === 'string') {
    return [
      {
        id: 'raw-data-1',
        title: 'Collected Data',
        content: rawData,
        mimeType: 'text/plain',
        filename: 'data.txt',
      },
    ]
  }

  // Object - convert to array of references with safe JSON.stringify
  const entries = Object.entries(rawData)
  const result: RawDataReference[] = []

  for (let index = 0; index < entries.length; index++) {
    const [key, value] = entries[index]
    let content: string

    try {
      // Safe stringify with circular reference handling
      content = JSON.stringify(value, null, 2)
    } catch (error) {
      // Fallback for circular or non-serializable values
      content = String(value)
    }

    result.push({
      id: `raw-data-${index}`,
      title: key,
      content,
      mimeType: 'application/json',
      filename: `${key}.json`,
    })
  }

  return result
}

/**
 * Map analysis section
 */
function mapAnalysis(output: TechnicalAgentOutput): AnalysisData {
  const description =
    output.assessment ||
    output.conclusions?.join('\n') ||
    'Analysis of collected data was performed using automated and manual techniques.'

  const codeSnippets = extractCodeFromOutput(output)

  const tables = extractTablesFromOutput(output)

  return {
    description,
    techniques: output.analysisSteps,
    codeSnippets,
    tables,
    processingSteps: extractProcessingSteps(output),
  }
}

/**
 * Extract code snippets from output
 */
function extractCodeFromOutput(output: TechnicalAgentOutput): CodeSnippet[] {
  const snippets: CodeSnippet[] = []

  // From codeOutput field
  if (output.codeOutput) {
    if (typeof output.codeOutput === 'string') {
      snippets.push(...extractCodeSnippets(output.codeOutput, 'extracted'))
    } else {
      snippets.push(...output.codeOutput)
    }
  }

  // Extract from findings
  if (output.findings) {
    for (const finding of output.findings) {
      if (finding.description && containsCode(finding.description)) {
        const extracted = extractCodeSnippets(finding.description, `finding-${snippets.length}`)
        snippets.push(...extracted)
      }
    }
  }

  return snippets
}

/**
 * Check if text contains code
 */
function containsCode(text: string): boolean {
  return /```\w+/.test(text) || /\b(function|class|import|const|let|var|def)\b/.test(text)
}

/**
 * Extract tables from output
 */
function extractTablesFromOutput(output: TechnicalAgentOutput): TableData[] {
  const tables: TableData[] = []

  // Create statistics table from findings
  if (output.findings && output.findings.length > 0) {
    const severityCounts = output.findings.reduce(
      (acc, f) => {
        const sev = f.severity || 'info'
        acc[sev] = (acc[sev] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    tables.push(
      createStatisticsTable(severityCounts, 'Findings by Severity')
    )
  }

  return tables
}

/**
 * Extract processing steps from output
 */
function extractProcessingSteps(output: TechnicalAgentOutput): string[] {
  const steps: string[] = []

  if (output.methodology) {
    steps.push('1. Applied methodology: ' + output.methodology.substring(0, 100) + '...')
  }

  if (output.tools) {
    steps.push(`2. Utilized ${output.tools.length} tools for analysis`)
  }

  if (output.findings) {
    steps.push(`3. Analyzed ${output.findings.length} findings`)
  }

  return steps
}

/**
 * Map findings section
 */
function mapFindings(output: TechnicalAgentOutput): FindingsData {
  const results: FindingResult[] = []
  const evidence: EvidenceReference[] = []
  const codeExamples: CodeSnippet[] = []

  if (output.findings) {
    for (const finding of output.findings) {
      const result: FindingResult = {
        title: finding.title || 'Unnamed Finding',
        severity: finding.severity || 'medium',
        description: finding.description || '',
      }

      if (finding.recommendation) {
        result.technicalDetails = `Recommendation: ${finding.recommendation}`
      }

      results.push(result)
      evidence.push({
        id: `evidence-${results.length}`,
        label: `Evidence ${results.length}`,
        targetSection: 'appendices',
        targetAppendix: 'raw-data',
        description: `Supporting data for ${result.title}`,
      })
    }
  }

  // Add code examples
  const snippets = extractCodeFromOutput(output)
  codeExamples.push(...snippets)

  return {
    results,
    evidence,
    codeExamples,
  }
}

/**
 * Map recommendations section
 */
function mapRecommendations(
  output: TechnicalAgentOutput,
  findings: FindingsData
): RecommendationsData {
  const actions: RecommendationAction[] = []

  // From explicit recommendations
  if (output.recommendations) {
    for (let i = 0; i < output.recommendations.length; i++) {
      const rec = output.recommendations[i]

      // Determine priority
      let priority: RecommendationAction['priority'] = 'medium'
      if (rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('immediate')) {
        priority = 'critical'
      } else if (rec.toLowerCase().includes('high') || rec.toLowerCase().includes('prompt')) {
        priority = 'high'
      } else if (rec.toLowerCase().includes('low')) {
        priority = 'low'
      }

      actions.push({
        title: `Recommendation ${i + 1}`,
        priority,
        description: rec,
      })
    }
  }

  // Generate from findings if no recommendations
  if (actions.length === 0 && findings.results.length > 0) {
    for (const finding of findings.results) {
      actions.push({
        title: `Address: ${finding.title}`,
        priority: finding.severity === 'critical' || finding.severity === 'high' ? 'high' : 'medium',
        description: finding.technicalDetails || finding.description,
        relatedFindingIds: [finding.title],
      })
    }
  }

  // Generate remediation steps
  const remediationSteps = generateRemediationSteps(actions)

  return {
    actions,
    priorityMatrix: generatePriorityMatrix(actions),
    remediationSteps,
  }
}

/**
 * Generate priority matrix
 */
function generatePriorityMatrix(actions: RecommendationAction[]) {
  return [
    {
      category: 'Security',
      counts: {
        critical: actions.filter((a) => a.priority === 'critical').length,
        high: actions.filter((a) => a.priority === 'high').length,
        medium: actions.filter((a) => a.priority === 'medium').length,
        low: actions.filter((a) => a.priority === 'low').length,
        informational: actions.filter((a) => a.priority === 'informational').length,
      },
      total: actions.length,
    },
  ]
}

/**
 * Generate remediation steps
 */
function generateRemediationSteps(actions: RecommendationAction[]): RemediationStep[] {
  return actions
    .filter((a) => a.priority === 'critical' || a.priority === 'high')
    .map((action, index) => ({
      stepNumber: index + 1,
      title: action.title,
      instructions: action.description,
      estimatedTime: 'Varies',
    }))
}

/**
 * Map appendices section
 */
function mapAppendices(output: TechnicalAgentOutput): AppendicesData {
  const rawDataDumps = output.rawData ? normalizeRawData(output.rawData) : []

  const fullOutputs: FullOutputReference[] = []

  if (output.fullOutput) {
    fullOutputs.push({
      id: 'full-output-1',
      source: output.agent || output.workflow || 'BMAD',
      content: output.fullOutput,
      timestamp: output.timestamp || new Date().toISOString(),
    })
  }

  const artifacts = output.artifacts || []

  return {
    rawDataDumps,
    fullOutputs,
    artifacts,
  }
}

/**
 * Map raw data to technical report
 */
export function mapRawDataToTechnicalReport(data: unknown): TechnicalReportData {
  if (!data) {
    return getEmptyTechnicalReport()
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>

    // Check if already a technical agent output
    if ('findings' in obj || 'methodology' in obj || 'codeOutput' in obj) {
      return mapAgentOutputToTechnicalReport(obj as TechnicalAgentOutput)
    }

    // Check if agent output
    if ('summary' in obj || 'findings' in obj || 'conclusions' in obj) {
      return mapAgentOutputToTechnicalReport(obj as TechnicalAgentOutput)
    }
  }

  return getEmptyTechnicalReport()
}

/**
 * Get empty technical report structure
 */
function getEmptyTechnicalReport(): TechnicalReportData {
  return {
    metadata: {
      reportType: 'Technical Report',
      date: new Date().toISOString(),
      preparedBy: 'BMAD System',
      version: '1.0',
    },
    methodology: {
      approach: 'No methodology information available.',
    },
    dataCollection: {
      sources: ['No data sources recorded.'],
    },
    analysis: {
      description: 'No analysis data available.',
    },
    findings: {
      results: [],
    },
    recommendations: {
      actions: [],
    },
    appendices: {
      rawDataDumps: [],
    },
  }
}

/**
 * Type for recommendation priority
 */
type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low' | 'informational'
