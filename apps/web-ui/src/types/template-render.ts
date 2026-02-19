/**
 * Template Rendering Engine Types
 * Story 7.5: Template Rendering Engine
 *
 * Type definitions for the template rendering system including
 * data mapping, formatting, rendering, and export capabilities.
 */

import type { Template, TemplateFormat } from './template'

/**
 * Supported output formats for rendering
 */
export type OutputFormat = 'markdown' | 'html' | 'pdf' | 'docx'

/**
 * Export format type
 */
export type ExportFormat = 'pdf' | 'docx' | 'markdown'

/**
 * Conciseness level for formatting
 */
export type ConcisenessLevel = 'concise' | 'detailed'

/**
 * Technical depth level
 */
export type TechnicalDepth = 'executive' | 'technical' | 'developer'

/**
 * Formatting rules configuration
 */
export interface FormattingRules {
  /** Conciseness level */
  conciseness: ConcisenessLevel
  /** Maximum section length in characters */
  maxSectionLength?: number
  /** Maximum number of bullet points */
  maxBulletPoints?: number
  /** Whether to include raw data */
  includeRawData: boolean
  /** Whether to include code examples */
  includeCodeExamples: boolean
  /** Technical depth level */
  technicalDepth: TechnicalDepth
}

/**
 * Template section mapping configuration
 */
export interface TemplateSectionMapping {
  /** Section identifier */
  sectionId: string
  /** Data fields to extract from agent output */
  fields: string[]
  /** Optional transform function for data */
  transform?: (data: unknown) => unknown
  /** Default value if data is missing */
  fallback?: unknown
  /** Whether this section is required */
  required: boolean
}

/**
 * Agent output data structure
 */
export interface AgentOutput {
  /** Agent name or ID */
  agent?: string
  /** Workflow name */
  workflow?: string
  /** Summary/conclusion */
  summary?: string
  /** Detailed findings */
  findings?: Finding[]
  /** Key conclusions */
  conclusions?: string[]
  /** Recommendations */
  recommendations?: string[]
  /** Overall assessment */
  assessment?: string
  /** Methodology information */
  methodology?: Methodology
  /** Data collection information */
  dataCollection?: DataCollection
  /** Analysis details */
  analysis?: Analysis
  /** Raw data */
  rawData?: Record<string, unknown>
  /** Metadata */
  metadata?: AgentMetadata
}

/**
 * Finding structure
 */
export interface Finding {
  /** Finding title */
  title?: string
  /** Finding description */
  description?: string
  /** Severity level */
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
  /** Category */
  category?: string
  /** Recommendation */
  recommendation?: string
  /** Evidence reference */
  evidence?: string
}

/**
 * Methodology information
 */
export interface Methodology {
  /** Approach description */
  approach?: string
  /** Tools used */
  tools?: string[]
  /** Scope */
  scope?: string
  /** Techniques */
  techniques?: string[]
}

/**
 * Data collection information
 */
export interface DataCollection {
  /** Data sources */
  sources?: string[]
  /** Collection period */
  collectionPeriod?: string
  /** Metadata */
  metadata?: Record<string, unknown>
}

/**
 * Analysis information
 */
export interface Analysis {
  /** Techniques used */
  techniques?: string[]
  /** Processing steps */
  processing?: unknown[]
  /** Validation methods */
  validation?: string[]
}

/**
 * Agent metadata
 */
export interface AgentMetadata {
  /** Timestamp */
  timestamp?: string
  /** Agent name */
  agent?: string
  /** Duration in milliseconds */
  duration?: number
  /** User who ran the agent */
  user?: string
  /** Project name */
  projectName?: string
}

/**
 * Cache entry for rendered outputs
 */
export interface CacheEntry {
  /** Cache key */
  key: string
  /** Template ID */
  templateId: string
  /** Hash of input data */
  dataHash: string
  /** Output format */
  format: OutputFormat
  /** Rendered content */
  rendered: string
  /** When it was generated */
  generatedAt: Date
  /** When it expires */
  expiresAt: Date
  /** Size in bytes */
  size?: number
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean
  /** Time to live in milliseconds */
  ttl: number
  /** Maximum cache size in bytes */
  maxSize: number
  /** Maximum number of entries */
  maxEntries: number
}

/**
 * Render progress callback
 */
export type RenderProgressCallback = (progress: RenderProgress) => void

/**
 * Render progress information
 */
export interface RenderProgress {
  /** Current step (0-1) */
  progress: number
  /** Current step description */
  step: string
  /** Whether rendering is complete */
  complete: boolean
  /** Error if any */
  error?: string
}

/**
 * Render options
 */
export interface RenderOptions {
  /** Output format */
  format: OutputFormat
  /** Formatting rules */
  formatting?: FormattingRules
  /** Progress callback */
  onProgress?: RenderProgressCallback
  /** Whether to use cache */
  useCache?: boolean
  /** Branding configuration */
  branding?: BrandingConfig
  /** Template mappings (for custom templates) */
  mappings?: TemplateSectionMapping[]
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  /** Logo URL or base64 */
  logo?: string
  /** Primary color (hex) */
  primaryColor?: string
  /** Secondary color (hex) */
  secondaryColor?: string
  /** Font family */
  fontFamily?: string
  /** Organization name */
  organization?: string
  /** Whether to include footer */
  includeFooter?: boolean
  /** Custom footer text */
  footerText?: string
}

/**
 * Render result
 */
export interface RenderResult {
  /** Rendered content */
  content: string
  /** Output format */
  format: OutputFormat
  /** Whether from cache */
  cached: boolean
  /** Word count */
  wordCount: number
  /** Character count */
  characterCount: number
  /** Generation time in milliseconds */
  generationTime: number
  /** Cache key (if applicable) */
  cacheKey?: string
}

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat
  /** Output filename (without extension) */
  filename?: string
  /** Branding configuration */
  branding?: BrandingConfig
  /** Whether to include metadata */
  includeMetadata?: boolean
  /** Page size for PDF */
  pageSize?: 'letter' | 'a4'
  /** Orientation for PDF */
  orientation?: 'portrait' | 'landscape'
}

/**
 * Export result
 */
export interface ExportResult {
  /** File content as buffer */
  content: Buffer
  /** Content type (MIME) */
  contentType: string
  /** Suggested filename */
  filename: string
  /** Size in bytes */
  size: number
}

/**
 * Template mapping configuration
 */
export interface TemplateMapping {
  /** Section mappings */
  [sectionId: string]: {
    /** Data fields to extract */
    fields: string[]
    /** Optional transform */
    transform?: (data: any) => any
    /** Default if missing */
    fallback?: any
  }
}

/**
 * Renderer error
 */
export class RenderError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'RenderError'
  }
}

/**
 * Missing data handling strategy
 */
export type MissingDataStrategy = 'placeholder' | 'empty' | 'error' | 'skip'

/**
 * Missing data configuration
 */
export interface MissingDataConfig {
  /** Strategy for handling missing data */
  strategy: MissingDataStrategy
  /** Placeholder text for missing fields */
  placeholderText: string
  /** Whether to log missing fields */
  logMissing: boolean
  /** Required fields that cannot be missing */
  requiredFields: string[]
}
