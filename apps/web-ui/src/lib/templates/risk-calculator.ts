/**
 * Risk Calculator
 * Story 7.2: Executive Brief Template
 *
 * Calculates and aggregates risk levels from security findings.
 * Provides visual risk indicators with colors and icons.
 */

import type { RiskLevel, RiskIndicator } from '@/types/template'

/**
 * Finding with severity level
 */
export interface SeverityFinding {
  severity: RiskLevel
  title?: string
  description?: string
  weight?: number
}

/**
 * Risk breakdown by category
 */
export interface RiskBreakdown {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  overallRisk: RiskLevel
  overallScore: number
  breakdown: RiskBreakdown
  indicator: RiskIndicator
  findingCount: number
}

/**
 * Risk level definitions with scores and display properties
 */
export const RISK_LEVELS: Record<RiskLevel, RiskIndicator> = {
  critical: {
    level: 'critical',
    label: 'Critical',
    color: '#DC2626', // red-600
    icon: 'AlertCircle',
    score: 95,
  },
  high: {
    level: 'high',
    label: 'High',
    color: '#EA580C', // orange-600
    icon: 'AlertTriangle',
    score: 75,
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    color: '#CA8A04', // yellow-600
    icon: 'AlertOctagon',
    score: 50,
  },
  low: {
    level: 'low',
    label: 'Low',
    color: '#2563EB', // blue-600
    icon: 'Info',
    score: 25,
  },
  info: {
    level: 'info',
    label: 'Info',
    color: '#6B7280', // gray-500
    icon: 'FileText',
    score: 10,
  },
}

/**
 * Risk level scores for calculation
 */
const RISK_SCORES: Record<RiskLevel, number> = {
  critical: 95,
  high: 75,
  medium: 50,
  low: 25,
  info: 10,
}

/**
 * Calculate overall risk from findings
 * @param findings - Array of findings with severity levels
 * @returns Risk assessment result
 */
export function calculateRisk(findings: SeverityFinding[]): RiskAssessment {
  if (findings.length === 0) {
    return {
      overallRisk: 'medium',
      overallScore: 50,
      breakdown: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      indicator: RISK_LEVELS.medium,
      findingCount: 0,
    }
  }

  // Aggregate by severity
  const breakdown: RiskBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  }

  let weightedScore = 0
  let totalWeight = 0

  for (const finding of findings) {
    const severity = finding.severity || 'info'
    const weight = finding.weight || 1
    const score = RISK_SCORES[severity]

    breakdown[severity]++
    weightedScore += score * weight
    totalWeight += weight
  }

  // Calculate weighted average score
  const overallScore = totalWeight > 0
    ? Math.round(weightedScore / totalWeight)
    : 50

  // Determine overall risk level from score
  const overallRisk = scoreToRiskLevel(overallScore)

  return {
    overallRisk,
    overallScore,
    breakdown,
    indicator: RISK_LEVELS[overallRisk],
    findingCount: findings.length,
  }
}

/**
 * Convert numeric score to risk level
 * @param score - Numeric risk score (0-100)
 * @returns Risk level
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 90) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  if (score >= 20) return 'low'
  return 'info'
}

/**
 * Get risk indicator for a risk level
 * @param level - Risk level
 * @returns Risk indicator with display properties
 */
export function getRiskIndicator(level: RiskLevel): RiskIndicator {
  return RISK_LEVELS[level]
}

/**
 * Get CSS class for risk level
 * @param level - Risk level
 * @param type - 'bg' for background, 'text' for text, 'border' for border
 * @returns Tailwind CSS class
 */
export function getRiskClass(
  level: RiskLevel,
  type: 'bg' | 'text' | 'border' | 'fill' = 'text'
): string {
  const classes: Record<RiskLevel, Record<string, string>> = {
    critical: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500',
      fill: 'fill-red-500',
    },
    high: {
      bg: 'bg-orange-500',
      text: 'text-orange-500',
      border: 'border-orange-500',
      fill: 'fill-orange-500',
    },
    medium: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500',
      fill: 'fill-yellow-500',
    },
    low: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-500',
      fill: 'fill-blue-500',
    },
    info: {
      bg: 'bg-gray-500',
      text: 'text-gray-500',
      border: 'border-gray-500',
      fill: 'fill-gray-500',
    },
  }

  return classes[level][type]
}

/**
 * Calculate risk from breakdown counts
 * @param breakdown - Risk breakdown by level
 * @returns Risk assessment result
 */
export function calculateRiskFromBreakdown(breakdown: RiskBreakdown): RiskAssessment {
  const findings: SeverityFinding[] = []

  for (const [level, count] of Object.entries(breakdown)) {
    for (let i = 0; i < count; i++) {
      findings.push({ severity: level as RiskLevel })
    }
  }

  return calculateRisk(findings)
}

/**
 * Get risk description for executives
 * @param level - Risk level
 * @returns Executive-friendly description
 */
export function getRiskDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    critical: 'Immediate action required. Severe impact on business operations.',
    high: 'Urgent attention needed. Significant impact if not addressed promptly.',
    medium: 'Should be addressed in the near term. Moderate impact potential.',
    low: 'Monitor and address when possible. Minimal impact expected.',
    info: 'Informational. No immediate action required.',
  }

  return descriptions[level]
}

/**
 * Format risk breakdown for display
 * @param breakdown - Risk breakdown
 * @returns Formatted string
 */
export function formatRiskBreakdown(breakdown: RiskBreakdown): string {
  const parts: string[] = []

  if (breakdown.critical > 0) parts.push(`${breakdown.critical} Critical`)
  if (breakdown.high > 0) parts.push(`${breakdown.high} High`)
  if (breakdown.medium > 0) parts.push(`${breakdown.medium} Medium`)
  if (breakdown.low > 0) parts.push(`${breakdown.low} Low`)
  if (breakdown.info > 0 && parts.length === 0) parts.push(`${breakdown.info} Info`)

  return parts.length > 0 ? parts.join(', ') : 'No findings'
}

/**
 * Get risk level label with emoji
 * @param level - Risk level
 * @returns Label with emoji
 */
export function getRiskLabel(level: RiskLevel): string {
  const emojis: Record<RiskLevel, string> = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🔵 Low',
    info: '⚪ Info',
  }

  return emojis[level]
}

/**
 * Compare two risk levels
 * @returns -1 if a < b, 1 if a > b, 0 if equal
 */
export function compareRiskLevels(a: RiskLevel, b: RiskLevel): number {
  const order: RiskLevel[] = ['info', 'low', 'medium', 'high', 'critical']
  return order.indexOf(a) - order.indexOf(b)
}

/**
 * Get the highest risk level from an array
 * @param levels - Array of risk levels
 * @returns Highest risk level
 */
export function getHighestRisk(...levels: RiskLevel[]): RiskLevel {
  if (levels.length === 0) return 'info'

  let highest = levels[0]
  for (const level of levels) {
    if (compareRiskLevels(level, highest) > 0) {
      highest = level
    }
  }

  return highest
}

/**
 * Calculate trend between two risk assessments
 * @param previous - Previous risk assessment
 * @param current - Current risk assessment
 * @returns 'improving', 'stable', or 'deteriorating'
 */
export function calculateRiskTrend(
  previous: RiskAssessment,
  current: RiskAssessment
): 'improving' | 'stable' | 'deteriorating' {
  const diff = current.overallScore - previous.overallScore

  if (diff < -5) return 'improving'
  if (diff > 5) return 'deteriorating'
  return 'stable'
}
