/**
 * Executive Brief Components
 * Story 7.2: Executive Brief Template
 */

export { RiskIndicator, RiskSummary, RiskBar } from './risk-indicator'
export { OnePageLayout, PageBreakIndicator } from './one-page-layout'
export {
  ExecutiveBriefRender,
  renderAsMarkdown,
  renderAsHTML,
  processExecutiveBriefData,
  getPrintableHTML,
  generateRenderOutput,
} from './executive-brief-render'

export type { RiskIndicatorProps, RiskSummaryProps, RiskBarProps } from './risk-indicator'
export type { OnePageLayoutProps, PageBreakIndicatorProps } from './one-page-layout'
export type { ExecutiveBriefRenderProps } from './executive-brief-render'
