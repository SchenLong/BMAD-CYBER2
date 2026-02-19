/**
 * One Page Layout Component
 * Story 7.2: Executive Brief Template
 *
 * Enforces one-page layout constraints for executive brief output.
 * Provides optimized spacing, typography, and content truncation.
 */

'use client'

import { useMemo } from 'react'
import type { RiskLevel, ExecutiveBriefData } from '@/types/template'
import { RiskIndicator, RiskBar } from './risk-indicator'
import { countWords, countChars } from '@/lib/templates/transformers'

export interface OnePageLayoutProps {
  /** Brief data to render */
  data: ExecutiveBriefData
  /** Whether to show print hint */
  showPrintHint?: boolean
  /** Whether to enforce constraints strictly */
  strict?: boolean
  /** URL to full detailed report */
  fullReportUrl?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Layout constraints for one page (Letter size)
 */
const ONE_PAGE_CONSTRAINTS = {
  maxWords: 800,
  maxChars: 4500,
  sectionMaxWords: {
    executiveSummary: 100,
    keyFindings: 200,
    recommendations: 150,
  },
  sectionMaxBullets: {
    keyFindings: 5,
    recommendations: 4,
  },
}

/**
 * OnePageLayout component for executive briefs
 */
export function OnePageLayout({
  data,
  showPrintHint = false,
  strict = true,
  fullReportUrl,
  className = '',
}: OnePageLayoutProps) {
  const metrics = useMemo(() => {
    const summaryWords = countWords(data.executiveSummary)
    const findingsWords = data.keyFindings.reduce((sum, f) => sum + countWords(f), 0)
    const recommendationsWords = data.recommendations.reduce((sum, r) => sum + countWords(r), 0)

    return {
      summaryWords,
      findingsWords,
      recommendationsWords,
      totalWords: summaryWords + findingsWords + recommendationsWords,
      summaryChars: countChars(data.executiveSummary),
      findingsChars: data.keyFindings.reduce((sum, f) => sum + countChars(f), 0),
      recommendationsChars: data.recommendations.reduce((sum, r) => sum + countChars(r), 0),
      totalChars: countChars(data.executiveSummary) +
        data.keyFindings.reduce((sum, f) => sum + countChars(f), 0) +
        data.recommendations.reduce((sum, r) => sum + countChars(r), 0),
    }
  }, [data])

  const fitsOnOnePage = useMemo(() => {
    return metrics.totalWords <= ONE_PAGE_CONSTRAINTS.maxWords &&
           metrics.totalChars <= ONE_PAGE_CONSTRAINTS.maxChars
  }, [metrics])

  return (
    <div className={`one-page-layout ${className}`}>
      {/* Header */}
      <header className="border-b border-border pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Executive Brief
            </h1>
            {data.metadata?.projectName && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.metadata.projectName}
              </p>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {data.metadata?.date && (
              <p>{data.metadata.date}</p>
            )}
            {data.metadata?.preparedBy && (
              <p>Prepared by: {data.metadata.preparedBy}</p>
            )}
          </div>
        </div>
      </header>

      {/* Risk Summary */}
      <section className="mb-6">
        <RiskIndicator
          level={data.riskRating}
          mode="card"
          showDescription
          className="mb-3"
        />
        {data.riskBreakdown && (
          <RiskBar level={data.riskRating} score={Math.round(
            (data.riskBreakdown.critical * 95 +
             data.riskBreakdown.high * 75 +
             data.riskBreakdown.medium * 50 +
             data.riskBreakdown.low * 25 +
             data.riskBreakdown.info * 10) /
            (Object.values(data.riskBreakdown).reduce((a, b) => a + b, 0) || 1)
          )} />
        )}
      </section>

      {/* Executive Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Executive Summary
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.executiveSummary}
        </p>
      </section>

      {/* Key Findings */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Key Findings
        </h2>
        <ul className="space-y-2">
          {data.keyFindings.slice(0, ONE_PAGE_CONSTRAINTS.sectionMaxBullets.keyFindings).map((finding, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
        {data.keyFindings.length > ONE_PAGE_CONSTRAINTS.sectionMaxBullets.keyFindings && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            + {data.keyFindings.length - ONE_PAGE_CONSTRAINTS.sectionMaxBullets.keyFindings} more findings
          </p>
        )}
      </section>

      {/* Recommendations */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Recommendations
        </h2>
        <ol className="space-y-2">
          {data.recommendations.slice(0, ONE_PAGE_CONSTRAINTS.sectionMaxBullets.recommendations).map((rec, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-primary font-bold">{idx + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
        {data.recommendations.length > ONE_PAGE_CONSTRAINTS.sectionMaxBullets.recommendations && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            + {data.recommendations.length - ONE_PAGE_CONSTRAINTS.sectionMaxBullets.recommendations} more recommendations
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-4 mt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {metrics.totalWords} words • {metrics.totalChars} characters
          </span>
          <div className="flex items-center gap-3">
            {fitsOnOnePage ? (
              <span className="text-green-500 flex items-center gap-1">
                ✓ Fits on one page
              </span>
            ) : strict && (
              <span className="text-amber-500 flex items-center gap-1">
                ⚠ Exceeds one page
              </span>
            )}
            {fullReportUrl && (
              <a
                href={fullReportUrl}
                className="text-primary hover:underline flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Report →
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Print Hint */}
      {showPrintHint && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-center text-xs text-muted-foreground print:hidden">
          Press <kbd className="px-1 py-0.5 bg-background rounded">Cmd+P</kbd> to print or save as PDF
        </div>
      )}
    </div>
  )
}

/**
 * PageBreakIndicator component for visual feedback
 */
export interface PageBreakIndicatorProps {
  /** Current word count */
  wordCount: number
  /** Current character count */
  charCount: number
  /** Maximum words */
  maxWords?: number
  /** Maximum characters */
  maxChars?: number
}

export function PageBreakIndicator({
  wordCount,
  charCount,
  maxWords = ONE_PAGE_CONSTRAINTS.maxWords,
  maxChars = ONE_PAGE_CONSTRAINTS.maxChars,
}: PageBreakIndicatorProps) {
  const wordPercent = Math.min((wordCount / maxWords) * 100, 100)
  const charPercent = Math.min((charCount / maxChars) * 100, 100)
  const overallPercent = Math.max(wordPercent, charPercent)

  const status = overallPercent >= 100 ? 'exceeds' :
                 overallPercent >= 90 ? 'warning' :
                 overallPercent >= 70 ? 'caution' : 'ok'

  const statusColors = {
    exceeds: 'bg-red-500',
    warning: 'bg-amber-500',
    caution: 'bg-yellow-500',
    ok: 'bg-green-500',
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all`}
          style={{ width: `${overallPercent}%` }}
        />
      </div>
      <span className="text-muted-foreground whitespace-nowrap">
        {wordCount}/{maxWords} words
      </span>
    </div>
  )
}
