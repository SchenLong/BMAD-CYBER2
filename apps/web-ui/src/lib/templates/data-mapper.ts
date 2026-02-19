/**
 * Data Mapper
 * Story 7.2: Executive Brief Template
 *
 * Maps agent and workflow outputs to executive brief template data.
 * Handles data extraction, transformation, and validation.
 */

import type { ExecutiveBriefData, RiskLevel, RiskBreakdown } from '@/types/template'
import { calculateRisk, SeverityFinding } from './risk-calculator'
import { simplifyText, formatAsBullets } from './transformers'

// Local type alias to avoid naming conflicts
type LocalSeverityFinding = SeverityFinding

/**
 * Agent output structure from BMAD workflows
 */
export interface AgentOutput {
  /** Agent name or ID */
  agent?: string
  /** Workflow name */
  workflow?: string
  /** Summary/conclusion from agent */
  summary?: string
  /** Detailed findings */
  findings?: Finding[]
  /** Key conclusions */
  conclusions?: string[]
  /** Recommendations from agent */
  recommendations?: string[]
  /** Overall assessment */
  assessment?: string
  /** Timestamp */
  timestamp?: string
  /** User who ran the workflow */
  user?: string
  /** Project/operation name */
  projectName?: string
}

/**
 * Finding structure from agent output
 */
export interface Finding {
  /** Finding title */
  title?: string
  /** Finding description */
  description?: string
  /** Severity level */
  severity?: RiskLevel
  /** Category */
  category?: string
  /** Recommendation for this finding */
  recommendation?: string
}

/**
 * Security assessment output
 */
export interface SecurityAssessmentOutput {
  /** Assessment type */
  type?: string
  /** Project/target name */
  target?: string
  /** Findings with severity */
  findings?: Finding[]
  /** Overall summary */
  summary?: string
  /** Risk assessment */
  riskLevel?: RiskLevel
  /** Recommendations */
  recommendations?: string[]
  /** Assessment date */
  date?: string
  /** Assessor name */
  assessor?: string
}

/**
 * Map agent output to executive brief data
 * @param output - Agent output to map
 * @returns Executive brief data
 */
export function mapAgentOutputToBrief(output: AgentOutput): ExecutiveBriefData {
  // Extract summary for executive summary
  const executiveSummary = output.summary ||
    output.assessment ||
    output.conclusions?.join('. ') ||
    'Assessment completed. See findings and recommendations below.'

  // Extract and format findings
  const keyFindings = extractKeyFindings(output.findings || [], 5)

  // Calculate risk from findings (filter out findings without severity)
  const findingsWithSeverity = (output.findings || []).filter(
    (f): f is LocalSeverityFinding => f.severity !== undefined
  )
  const riskResult = calculateRisk(findingsWithSeverity)
  const riskRating = output.findings && output.findings.length > 0
    ? riskResult.overallRisk
    : (output.assessment?.toLowerCase().includes('critical') ? 'critical' :
       output.assessment?.toLowerCase().includes('high') ? 'high' :
       output.assessment?.toLowerCase().includes('low') ? 'low' : 'medium')

  // Extract recommendations
  const recommendations = extractRecommendations(output, 4)

  // Build risk breakdown
  const riskBreakdown: RiskBreakdown = riskResult.breakdown

  // Metadata
  const metadata = {
    reportType: 'Executive Brief',
    date: output.timestamp || new Date().toLocaleDateString(),
    preparedBy: output.agent || output.user || 'BMAD System',
    projectName: output.projectName || output.workflow,
  }

  return {
    executiveSummary: simplifyText(executiveSummary, {
      translateJargon: true,
      expandAcronyms: true,
      useBullets: false,
      maxCharsTotal: 150,
    }) as string,
    keyFindings,
    riskRating,
    riskBreakdown,
    recommendations,
    metadata,
  }
}

/**
 * Map security assessment output to executive brief data
 * @param assessment - Security assessment output
 * @returns Executive brief data
 */
export function mapSecurityAssessmentToBrief(assessment: SecurityAssessmentOutput): ExecutiveBriefData {
  // Use provided summary or generate from findings
  const executiveSummary = assessment.summary ||
    (assessment.findings && assessment.findings.length > 0
      ? `Security assessment completed for ${assessment.target || 'target'}. ` +
        `Identified ${assessment.findings.length} findings requiring attention.`
      : 'Security assessment completed.')

  // Extract and simplify findings
  const keyFindings = assessment.findings
    ? extractKeyFindings(assessment.findings, 5)
    : []

  // Use provided risk level or calculate from findings
  let riskRating = assessment.riskLevel || 'medium'
  let riskBreakdown: RiskBreakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }

  if (assessment.findings) {
    const findingsWithSeverity = assessment.findings.filter(
      (f): f is LocalSeverityFinding => f.severity !== undefined
    )
    const riskResult = calculateRisk(findingsWithSeverity)
    riskRating = riskResult.overallRisk
    riskBreakdown = riskResult.breakdown
  }

  // Extract recommendations
  const recommendations = assessment.recommendations
    ? assessment.recommendations.slice(0, 4)
    : assessment.findings
      ? extractRecommendationsFromFindings(assessment.findings, 4)
      : []

  // Metadata
  const metadata = {
    reportType: 'Security Assessment Brief',
    date: assessment.date || new Date().toLocaleDateString(),
    preparedBy: assessment.assessor || 'BMAD Security Team',
    projectName: assessment.target,
  }

  return {
    executiveSummary: simplifyText(executiveSummary, {
      translateJargon: true,
      expandAcronyms: true,
      useBullets: false,
      maxCharsTotal: 150,
    }) as string,
    keyFindings,
    riskRating,
    riskBreakdown,
    recommendations,
    metadata,
  }
}

/**
 * Extract key findings from agent output
 * @param findings - Raw findings
 * @param maxCount - Maximum number of findings to extract
 * @returns Formatted finding strings
 */
export function extractKeyFindings(findings: Finding[], maxCount: number = 5): string[] {
  if (!findings || findings.length === 0) {
    return ['No significant findings identified.']
  }

  // Sort by severity (critical first)
  const sorted = [...findings].sort((a, b) => {
    const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
    return (severityOrder[b.severity || 'info'] || 0) - (severityOrder[a.severity || 'info'] || 0)
  })

  // Take top findings and format
  return sorted.slice(0, maxCount).map((finding) => {
    const severity = finding.severity ? `[${finding.severity.toUpperCase()}] ` : ''
    const title = finding.title ? finding.title : ''
    const desc = finding.description ? ` ${finding.description}` : ''

    return simplifyText(`${severity}${title}${desc}`, {
      translateJargon: true,
      expandAcronyms: true,
      useBullets: false,
      maxCharsTotal: 120,
    }) as string
  })
}

/**
 * Extract recommendations from output
 * @param output - Agent output
 * @param maxCount - Maximum number of recommendations
 * @returns Recommendation strings
 */
export function extractRecommendations(output: AgentOutput, maxCount: number = 4): string[] {
  if (output.recommendations && output.recommendations.length > 0) {
    return output.recommendations.slice(0, maxCount)
  }

  // Generate from findings
  if (output.findings && output.findings.length > 0) {
    return extractRecommendationsFromFindings(output.findings, maxCount)
  }

  return ['Review findings and address according to severity.']
}

/**
 * Generate recommendations from findings
 * @param findings - Findings to generate recommendations from
 * @param maxCount - Maximum number of recommendations
 * @returns Recommendation strings
 */
export function extractRecommendationsFromFindings(findings: Finding[], maxCount: number = 4): string[] {
  // Get highest severity findings that need action
  const actionableFindings = findings
    .filter(f => f.severity !== 'info')
    .sort((a, b) => {
      const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
      return (severityOrder[b.severity || 'info'] || 0) - (severityOrder[a.severity || 'info'] || 0)
    })
    .slice(0, maxCount)

  if (actionableFindings.length === 0) {
    return ['Continue monitoring and maintain current security posture.']
  }

  return actionableFindings.map((finding) => {
    if (finding.recommendation) {
      return simplifyText(finding.recommendation, {
        translateJargon: true,
        expandAcronyms: true,
        useBullets: false,
        maxCharsTotal: 100,
      }) as string
    }

    // Generate generic recommendation from finding
    const action = finding.severity === 'critical' ? 'Immediately address' :
                  finding.severity === 'high' ? 'Promptly fix' :
                  finding.severity === 'medium' ? 'Address' : 'Consider fixing'

    return simplifyText(
      `${action}: ${finding.title || finding.description || 'identified issue'}.`,
      { translateJargon: true, expandAcronyms: true, useBullets: false, maxCharsTotal: 100 }
    ) as string
  })
}

/**
 * Map raw JSON data to executive brief
 * Handles various input formats
 * @param data - Raw data (can be object, string, etc.)
 * @returns Executive brief data
 */
export function mapRawDataToBrief(data: unknown): ExecutiveBriefData {
  if (!data) {
    return getDefaultBrief()
  }

  // If already an AgentOutput or SecurityAssessmentOutput
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>

    // Check for security assessment structure
    if ('findings' in obj && Array.isArray(obj.findings)) {
      return mapSecurityAssessmentToBrief(obj as SecurityAssessmentOutput)
    }

    // Check for agent output structure
    if ('summary' in obj || 'findings' in obj || 'conclusions' in obj) {
      return mapAgentOutputToBrief(obj as AgentOutput)
    }
  }

  // Fallback: try to extract from generic object
  return mapGenericDataToBrief(data)
}

/**
 * Map generic data to brief
 */
function mapGenericDataToBrief(data: unknown): ExecutiveBriefData {
  const defaultBrief = getDefaultBrief()

  if (typeof data === 'string') {
    // Try to parse JSON
    try {
      const parsed = JSON.parse(data)
      return mapRawDataToBrief(parsed)
    } catch {
      // Use string as summary
      defaultBrief.executiveSummary = simplifyText(data.slice(0, 150), {
        translateJargon: true,
        expandAcronyms: true,
        useBullets: false,
      }) as string
      return defaultBrief
    }
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>

    // Extract any text fields as summary
    const summaryField = obj.summary || obj.description || obj.message || obj.text
    if (typeof summaryField === 'string') {
      defaultBrief.executiveSummary = simplifyText(summaryField, {
        translateJargon: true,
        expandAcronyms: true,
        useBullets: false,
        maxCharsTotal: 150,
      }) as string
    }

    // Extract any array as findings or recommendations
    const findingsField = obj.findings || obj.items || obj.results
    if (Array.isArray(findingsField)) {
      defaultBrief.keyFindings = findingsField
        .slice(0, 5)
        .map(item => typeof item === 'string' ? item : JSON.stringify(item))
    }

    const recsField = obj.recommendations || obj.actions || obj.nextSteps
    if (Array.isArray(recsField)) {
      defaultBrief.recommendations = recsField
        .slice(0, 4)
        .map(item => typeof item === 'string' ? item : JSON.stringify(item))
    }
  }

  return defaultBrief
}

/**
 * Get default brief structure
 */
function getDefaultBrief(): ExecutiveBriefData {
  return {
    executiveSummary: 'No summary available.',
    keyFindings: ['No findings provided.'],
    riskRating: 'medium',
    riskBreakdown: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    recommendations: ['Review the full assessment for detailed recommendations.'],
    metadata: {
      reportType: 'Executive Brief',
      date: new Date().toLocaleDateString(),
      preparedBy: 'BMAD System',
    },
  }
}

/**
 * Validate executive brief data
 * @param data - Data to validate
 * @returns Whether data is valid
 */
export function validateBriefData(data: ExecutiveBriefData): boolean {
  return !!(
    data.executiveSummary &&
    data.keyFindings &&
    Array.isArray(data.keyFindings) &&
    data.keyFindings.length > 0 &&
    data.recommendations &&
    Array.isArray(data.recommendations) &&
    data.recommendations.length > 0 &&
    data.riskRating
  )
}

/**
 * Merge multiple briefs into one
 * @param briefs - Briefs to merge
 * @returns Merged brief
 */
export function mergeBriefs(...briefs: ExecutiveBriefData[]): ExecutiveBriefData {
  if (briefs.length === 0) {
    return getDefaultBrief()
  }

  if (briefs.length === 1) {
    return briefs[0]
  }

  // Combine summaries
  const executiveSummary = briefs
    .map(b => b.executiveSummary)
    .filter(Boolean)
    .join(' ')

  // Combine findings
  const allFindings = briefs.flatMap(b => b.keyFindings || [])

  // Get highest risk level
  const highestRisk = getHighestRisk(...briefs.map(b => b.riskRating))

  // Combine risk breakdowns
  const riskBreakdown: RiskBreakdown = {
    critical: briefs.reduce((sum, b) => sum + (b.riskBreakdown?.critical || 0), 0),
    high: briefs.reduce((sum, b) => sum + (b.riskBreakdown?.high || 0), 0),
    medium: briefs.reduce((sum, b) => sum + (b.riskBreakdown?.medium || 0), 0),
    low: briefs.reduce((sum, b) => sum + (b.riskBreakdown?.low || 0), 0),
    info: briefs.reduce((sum, b) => sum + (b.riskBreakdown?.info || 0), 0),
  }

  // Combine recommendations
  const allRecommendations = briefs.flatMap(b => b.recommendations || [])

  // Use first metadata
  const metadata = briefs[0].metadata || {
    reportType: 'Executive Brief',
    date: new Date().toLocaleDateString(),
    preparedBy: 'BMAD System',
  }

  return {
    executiveSummary: simplifyText(executiveSummary, {
      translateJargon: true,
      expandAcronyms: true,
      useBullets: false,
      maxCharsTotal: 150,
    }) as string,
    keyFindings: allFindings.slice(0, 5),
    riskRating: highestRisk,
    riskBreakdown,
    recommendations: allRecommendations.slice(0, 4),
    metadata,
  }
}

/**
 * Get highest risk level from array
 */
function getHighestRisk(...levels: RiskLevel[]): RiskLevel {
  const order: RiskLevel[] = ['info', 'low', 'medium', 'high', 'critical']

  let highest = levels[0] || 'medium'
  for (const level of levels) {
    if (order.indexOf(level) > order.indexOf(highest)) {
      highest = level
    }
  }

  return highest
}
