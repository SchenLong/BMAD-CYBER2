/**
 * Technical Report Types
 * Story 7.3: Technical Report Template
 *
 * Type definitions for technical report template including sections,
 * code snippets, data tables, table of contents, and appendices.
 */

import type { RiskLevel } from './template'

/**
 * Code snippet with syntax highlighting metadata
 */
export interface CodeSnippet {
  /** Unique identifier for the snippet */
  id: string
  /** Programming language */
  language: CodeLanguage
  /** Code content */
  code: string
  /** Optional title/label */
  title?: string
  /** Line numbers to highlight (1-indexed) */
  highlightLines?: number[]
  /** Whether to show line numbers */
  showLineNumbers?: boolean
  /** Source file or context */
  source?: string
}

/**
 * Supported programming languages for syntax highlighting
 */
export type CodeLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'bash'
  | 'shell'
  | 'json'
  | 'yaml'
  | 'sql'
  | 'markdown'
  | 'html'
  | 'css'
  | 'xml'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'text'

/**
 * Raw data reference for appendices
 */
export interface RawDataReference {
  /** Unique identifier */
  id: string
  /** Data title/label */
  title: string
  /** Data content (can be large) */
  content: string
  /** MIME type for download */
  mimeType?: string
  /** Suggested filename for download */
  filename?: string
  /** Size in bytes */
  size?: number
  /** Timestamp of collection */
  timestamp?: string
  /** Data source */
  source?: string
}

/**
 * Table data for structured display
 */
export interface TableData {
  /** Unique identifier */
  id: string
  /** Table title/caption */
  title?: string
  /** Column headers */
  headers: string[]
  /** Table rows */
  rows: TableRow[]
  /** Optional footer note */
  footer?: string
}

/**
 * Single table row
 */
export type TableRow = (string | number | boolean | null)[]

/**
 * Evidence reference linking findings to data
 */
export interface EvidenceReference {
  /** Unique identifier */
  id: string
  /** Reference label (shown in text) */
  label: string
  /** Target section ID (anchor) */
  targetSection: string
  /** Target snippet ID */
  targetSnippet?: string
  /** Target appendix ID */
  targetAppendix?: string
  /** Brief description */
  description?: string
}

/**
 * Table of contents entry
 */
export interface TOCEntry {
  /** Entry ID matching section ID */
  id: string
  /** Display title */
  title: string
  /** Hierarchy level (1-6) */
  level: number
  /** Parent entry ID (for nesting) */
  parentId?: string
  /** Page number (for PDF export) */
  pageNumber?: number
  /** Child entries */
  children?: TOCEntry[]
}

/**
 * Methodology section data
 */
export interface MethodologyData {
  /** Overall approach description */
  approach: string
  /** Tools used with versions */
  tools?: ToolEntry[]
  /** Scope and limitations */
  scope?: string
  /** Techniques employed */
  techniques?: string[]
}

/**
 * Tool/software entry
 */
export interface ToolEntry {
  /** Tool name */
  name: string
  /** Version number */
  version?: string
  /** Purpose/usage */
  purpose?: string
  /** Command or configuration */
  command?: string
}

/**
 * Data collection section data
 */
export interface DataCollectionData {
  /** Data sources description */
  sources: string[]
  /** Collection timestamps */
  timestamps?: CollectionTimestamp[]
  /** Metadata about collection */
  metadata?: Record<string, string | number | boolean>
  /** Raw data references */
  rawData?: RawDataReference[]
}

/**
 * Collection timestamp entry
 */
export interface CollectionTimestamp {
  /** What was collected */
  item: string
  /** When it was collected */
  timestamp: string
  /** Collection method */
  method?: string
}

/**
 * Analysis section data
 */
export interface AnalysisData {
  /** Analysis description */
  description: string
  /** Analysis techniques used */
  techniques?: string[]
  /** Code snippets from analysis */
  codeSnippets?: CodeSnippet[]
  /** Data tables */
  tables?: TableData[]
  /** Processing steps */
  processingSteps?: string[]
  /** Validation methods */
  validationMethods?: string[]
}

/**
 * Findings section data
 */
export interface FindingsData {
  /** Detailed results */
  results: FindingResult[]
  /** Evidence references */
  evidence?: EvidenceReference[]
  /** Supporting data tables */
  tables?: TableData[]
  /** Code examples demonstrating findings */
  codeExamples?: CodeSnippet[]
}

/**
 * Individual finding result
 */
export interface FindingResult {
  /** Finding title */
  title: string
  /** Severity level */
  severity: RiskLevel
  /** Detailed description */
  description: string
  /** Evidence reference IDs */
  evidenceIds?: string[]
  /** Code snippets demonstrating the finding */
  snippetIds?: string[]
  /** Affected components/locations */
  affectedComponents?: string[]
  /** Technical details */
  technicalDetails?: string
}

/**
 * Recommendations section data
 */
export interface RecommendationsData {
  /** Technical actions */
  actions: RecommendationAction[]
  /** Priority matrix */
  priorityMatrix?: PriorityEntry[]
  /** Remediation steps */
  remediationSteps?: RemediationStep[]
}

/**
 * Single recommendation action
 */
export interface RecommendationAction {
  /** Action title */
  title: string
  /** Priority level */
  priority: RecommendationPriority
  /** Detailed description */
  description: string
  /** Related finding IDs */
  relatedFindingIds?: string[]
  /** Estimated effort */
  effort?: 'low' | 'medium' | 'high'
  /** Code example fix */
  codeFix?: CodeSnippet
}

/**
 * Recommendation priority levels
 */
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low' | 'informational'

/**
 * Priority matrix entry
 */
export interface PriorityEntry {
  /** Finding/issue category */
  category: string
  /** Count by priority */
  counts: Record<RecommendationPriority, number>
  /** Total items */
  total: number
}

/**
 * Remediation step
 */
export interface RemediationStep {
  /** Step number */
  stepNumber: number
  /** Step title */
  title: string
  /** Detailed instructions */
  instructions: string
  /** Code snippets for implementation */
  codeSnippets?: CodeSnippet[]
  /** Verification commands */
  verificationCommands?: string[]
  /** Estimated time */
  estimatedTime?: string
}

/**
 * Appendices section data
 */
export interface AppendicesData {
  /** Raw data dumps */
  rawDataDumps: RawDataReference[]
  /** Full agent/tool output */
  fullOutputs?: FullOutputReference[]
  /** Supporting artifacts */
  artifacts?: SupportingArtifact[]
}

/**
 * Full output reference
 */
export interface FullOutputReference {
  /** Reference ID */
  id: string
  /** Output source (agent/tool name) */
  source: string
  /** Output content */
  content: string
  /** Timestamp */
  timestamp: string
  /** Command or workflow that produced it */
  command?: string
}

/**
 * Supporting artifact (files, images, etc.)
 */
export interface SupportingArtifact {
  /** Artifact ID */
  id: string
  /** Artifact name */
  name: string
  /** Artifact type */
  type: 'screenshot' | 'log' | 'config' | 'report' | 'other'
  /** File path or URL */
  path: string
  /** Description */
  description?: string
}

/**
 * Complete technical report data
 */
export interface TechnicalReportData {
  /** Report metadata */
  metadata: TechnicalReportMetadata
  /** Methodology section */
  methodology: MethodologyData
  /** Data collection section */
  dataCollection: DataCollectionData
  /** Analysis section */
  analysis: AnalysisData
  /** Findings section */
  findings: FindingsData
  /** Recommendations section */
  recommendations: RecommendationsData
  /** Appendices section */
  appendices: AppendicesData
  /** Generated table of contents */
  tableOfContents?: TOCEntry[]
}

/**
 * Technical report metadata
 */
export interface TechnicalReportMetadata {
  /** Report type/title */
  reportType: string
  /** Report date */
  date: string
  /** Prepared by (agent/user) */
  preparedBy: string
  /** Project/operation name */
  projectName?: string
  /** Report version */
  version?: string
  /** Classification level */
  classification?: 'public' | 'internal' | 'confidential' | 'secret'
}

/**
 * Technical report render output
 */
export interface TechnicalReportRenderOutput {
  /** Rendered markdown content */
  markdown: string
  /** Rendered HTML content (optional) */
  html?: string
  /** Table of contents entries */
  tableOfContents: TOCEntry[]
  /** Word count */
  wordCount: number
  /** Page count estimate (for PDF) */
  estimatedPages: number
  /** All code snippets for syntax highlighting */
  codeSnippets: CodeSnippet[]
  /** All tables for rendering */
  tables: TableData[]
  /** All downloadable artifacts */
  downloadableArtifacts: RawDataReference[]
}
