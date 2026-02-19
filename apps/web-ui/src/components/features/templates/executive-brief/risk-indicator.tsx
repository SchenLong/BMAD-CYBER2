/**
 * Risk Indicator Component
 * Story 7.2: Executive Brief Template
 *
 * Visual component for displaying risk levels with color and icon.
 */

'use client'

import type { RiskLevel } from '@/types/template'
import { getRiskIndicator, getRiskClass, getRiskDescription, getRiskLabel } from '@/lib/templates/risk-calculator'
import { AlertCircle, AlertTriangle, AlertOctagon, Info, FileText } from 'lucide-react'

export interface RiskIndicatorProps {
  /** Risk level to display */
  level: RiskLevel
  /** Display mode */
  mode?: 'badge' | 'card' | 'compact' | 'detailed'
  /** Whether to show description */
  showDescription?: boolean
  /** Additional CSS classes */
  className?: string
}

const ICONS = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: AlertOctagon,
  low: Info,
  info: FileText,
}

/**
 * RiskIndicator component for visual risk level display
 */
export function RiskIndicator({
  level,
  mode = 'badge',
  showDescription = false,
  className = '',
}: RiskIndicatorProps) {
  const indicator = getRiskIndicator(level)
  const Icon = ICONS[level]
  const textClass = getRiskClass(level, 'text')
  const bgClass = getRiskClass(level, 'bg')
  const borderClass = getRiskClass(level, 'border')
  const fillClass = getRiskClass(level, 'fill')

  const baseClasses = 'inline-flex items-center gap-2'

  if (mode === 'compact') {
    return (
      <span className={`${baseClasses} ${textClass} ${className}`}>
        <Icon className="h-4 w-4" />
        <span className="font-medium capitalize">{indicator.label}</span>
      </span>
    )
  }

  if (mode === 'card') {
    return (
      <div className={`border-2 ${borderClass} rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${bgClass} bg-opacity-20`}>
            <Icon className={`h-6 w-6 ${textClass} ${fillClass}`} />
          </div>
          <div>
            <div className={`text-lg font-bold ${textClass} capitalize`}>
              {indicator.label} Risk
            </div>
            <div className="text-sm text-muted-foreground">
              Score: {indicator.score}/100
            </div>
          </div>
        </div>
        {showDescription && (
          <p className="mt-3 text-sm text-muted-foreground">
            {getRiskDescription(level)}
          </p>
        )}
      </div>
    )
  }

  if (mode === 'detailed') {
    return (
      <div className={`border rounded-lg p-4 ${borderClass} ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${textClass} ${fillClass}`} />
            <span className={`font-bold ${textClass} capitalize`}>
              {indicator.label} Risk
            </span>
          </div>
          <span className={`text-sm font-mono px-2 py-1 rounded ${bgClass} bg-opacity-20 ${textClass}`}>
            {indicator.score}/100
          </span>
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground">
            {getRiskDescription(level)}
          </p>
        )}
      </div>
    )
  }

  // Default badge mode
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${textClass} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="capitalize">{indicator.label}</span>
    </span>
  )
}

/**
 * RiskSummary component for displaying risk breakdown
 */
export interface RiskSummaryProps {
  /** Risk breakdown by level */
  breakdown: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  /** Overall risk level */
  overallRisk: RiskLevel
  /** Additional CSS classes */
  className?: string
}

export function RiskSummary({ breakdown, overallRisk, className = '' }: RiskSummaryProps) {
  const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-muted-foreground">No findings reported</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Risk Breakdown</span>
        <RiskIndicator level={overallRisk} mode="compact" />
      </div>

      <div className="grid grid-cols-5 gap-2">
        <RiskSummaryItem level="critical" count={breakdown.critical} total={total} />
        <RiskSummaryItem level="high" count={breakdown.high} total={total} />
        <RiskSummaryItem level="medium" count={breakdown.medium} total={total} />
        <RiskSummaryItem level="low" count={breakdown.low} total={total} />
        <RiskSummaryItem level="info" count={breakdown.info} total={total} />
      </div>
    </div>
  )
}

interface RiskSummaryItemProps {
  level: RiskLevel
  count: number
  total: number
}

function RiskSummaryItem({ level, count, total }: RiskSummaryItemProps) {
  if (count === 0) return null

  const indicator = getRiskIndicator(level)
  const bgClass = getRiskClass(level, 'bg')
  const textClass = getRiskClass(level, 'text')
  const percentage = Math.round((count / total) * 100)

  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${textClass}`}>{count}</div>
      <div className={`text-xs capitalize ${textClass} opacity-80`}>{level}</div>
      <div className={`h-1 mt-1 rounded ${bgClass}`} style={{ width: '100%' }} />
    </div>
  )
}

/**
 * RiskBar component for visual risk level bar
 */
export interface RiskBarProps {
  /** Current risk level */
  level: RiskLevel
  /** Score (0-100) */
  score?: number
  /** Whether to show labels */
  showLabels?: boolean
  /** Additional CSS classes */
  className?: string
}

export function RiskBar({ level, score, showLabels = true, className = '' }: RiskBarProps) {
  const indicator = score ? { ...getRiskIndicator(level), score } : getRiskIndicator(level)
  const fillClass = getRiskClass(level, 'fill')

  // Create gradient bar with risk zones
  const zones = [
    { level: 'info', color: '#6B7280', width: '20%' },
    { level: 'low', color: '#2563EB', width: '20%' },
    { level: 'medium', color: '#CA8A04', width: '20%' },
    { level: 'high', color: '#EA580C', width: '20%' },
    { level: 'critical', color: '#DC2626', width: '20%' },
  ]

  const markerPosition = `${indicator.score}%`

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {zones.map((zone) => (
          <div
            key={zone.level}
            className="h-full"
            style={{ backgroundColor: zone.color, width: zone.width }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: markerPosition, transform: 'translateX(-50%)' }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low Risk</span>
          <span className={`font-medium ${getRiskClass(level, 'text')}`}>
            {indicator.label} ({indicator.score})
          </span>
          <span>Critical</span>
        </div>
      )}
    </div>
  )
}
