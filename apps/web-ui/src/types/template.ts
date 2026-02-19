/**
 * Template Types
 * Story 7.1: Template Selector
 * Story 7.2: Executive Brief Template
 *
 * Type definitions for template system including template metadata,
 * sections, preview, and user preferences.
 */

/**
 * Template category determining where templates are shown
 */
export type TemplateCategory = 'built-in' | 'custom' | 'enterprise'

/**
 * Supported output formats for templates
 */
export type TemplateFormat = 'markdown' | 'html' | 'pdf'

/**
 * Risk level for security assessments and findings
 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

/**
 * Risk breakdown showing counts for each risk level
 */
export interface RiskBreakdown {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

/**
 * Individual section within a template
 */
export interface TemplateSection {
  /** Unique section identifier */
  id: string
  /** Display title for the section */
  title: string
  /** Brief description of section content */
  description: string
  /** Whether this section must be included */
  required: boolean
  /** Optional field definitions for this section */
  fields?: TemplateField[]
  /** Maximum character length for this section (for one-page templates) */
  maxLength?: number
  /** Whether content should be formatted as bullet points */
  bulletPoints?: boolean
  /** Maximum number of bullet points allowed */
  maxBullets?: number
}

/**
 * Field definition for template sections
 */
export interface TemplateField {
  /** Field identifier */
  id: string
  /** Field label */
  label: string
  /** Field type */
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect'
  /** Whether field is required */
  required: boolean
  /** Options for select fields */
  options?: string[]
  /** Default value */
  defaultValue?: string | number
}

/**
 * Preview data for template card display
 */
export interface TemplatePreview {
  /** URL or icon identifier for thumbnail */
  thumbnail: string
  /** Sample data for preview rendering */
  sampleData: Record<string, string | Record<string, unknown> | null>
  /** Preview sections to show */
  previewSections: string[]
}

/**
 * Main template interface
 */
export interface Template {
  /** Unique template identifier */
  id: string
  /** Human-readable template name */
  name: string
  /** Template description */
  description: string
  /** Template category */
  category: TemplateCategory
  /** Template sections */
  sections: TemplateSection[]
  /** Preview information */
  preview: TemplatePreview
  /** Output format */
  format: TemplateFormat
  /** Optional icon identifier */
  icon?: string
  /** Estimated completion time */
  estimatedTime?: string
  /** Tags for filtering */
  tags?: string[]
  /** Whether this template is constrained to one page */
  onePage?: boolean
  /** Maximum total word count for this template */
  maxWordCount?: number
}

/**
 * User's template preferences
 */
export interface TemplatePreferences {
  /** ID of user's default template */
  defaultTemplateId: string | null
  /** Whether to always use default without prompting */
  alwaysUseDefault: boolean
  /** Recently used template IDs (most recent first) */
  recentTemplates: string[]
}

/**
 * Template selection state
 */
export interface TemplateSelection {
  /** Currently selected template */
  selectedTemplate: Template | null
  /** Whether preview modal is open */
  isPreviewOpen: boolean
  /** Template being previewed */
  previewTemplate: Template | null
}

/**
 * Risk indicator with visualization properties
 * Story 7.2: Executive Brief Template
 */
export interface RiskIndicator {
  /** Risk level */
  level: RiskLevel
  /** Display label */
  label: string
  /** CSS color class */
  color: string
  /** Icon identifier */
  icon: string
  /** Numeric score (0-100) */
  score: number
}

/**
 * Executive brief render data
 * Story 7.2: Executive Brief Template
 */
export interface ExecutiveBriefData {
  /** Executive summary content */
  executiveSummary: string
  /** Key findings as bullet points */
  keyFindings: string[]
  /** Overall risk level */
  riskRating: RiskLevel
  /** Risk breakdown by category */
  riskBreakdown?: Record<RiskLevel, number>
  /** Recommendations as bullet points */
  recommendations: string[]
  /** Report metadata */
  metadata?: {
    reportType: string
    date: string
    preparedBy: string
    projectName?: string
  }
}

/**
 * Template render output
 * Story 7.2: Executive Brief Template
 */
export interface TemplateRenderOutput {
  /** Rendered content in the template's format */
  content: string
  /** Content format */
  format: TemplateFormat
  /** Whether content fits on one page (for one-page templates) */
  fitsOnOnePage: boolean
  /** Word count */
  wordCount: number
  /** Character count */
  characterCount: number
}
