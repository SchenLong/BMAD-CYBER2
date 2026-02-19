/**
 * Built-in Template Definitions
 * Story 7.1: Template Selector
 * Story 7.2: Executive Brief Template
 *
 * Pre-defined templates for output formatting:
 * - Executive Brief: Concise stakeholder-friendly summary (one-page with constraints)
 * - Technical Report: Detailed technical documentation
 */

import type { Template, TemplateSection } from '@/types/template'

/**
 * Executive Brief Template Sections
 * Story 7.2: Enhanced with maxLength, bulletPoints, maxBullets constraints
 */
const EXECUTIVE_BRIEF_SECTIONS: TemplateSection[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'High-level overview of the operation or assessment',
    required: true,
    maxLength: 150,
    fields: [
      { id: 'summary', label: 'Summary', type: 'textarea', required: true },
    ],
  },
  {
    id: 'key-findings',
    title: 'Key Findings',
    description: 'Critical discoveries and their business impact',
    required: true,
    maxLength: 300,
    bulletPoints: true,
    maxBullets: 5,
    fields: [
      { id: 'findings', label: 'Findings', type: 'textarea', required: true },
    ],
  },
  {
    id: 'risk-rating',
    title: 'Risk Assessment',
    description: 'Overall risk level and severity indicators',
    required: true,
    fields: [
      {
        id: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        required: true,
        options: ['Critical', 'High', 'Medium', 'Low', 'Info'],
      },
      { id: 'riskDetails', label: 'Risk Details', type: 'textarea', required: false },
    ],
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'Prioritized action items for stakeholders',
    required: true,
    maxLength: 250,
    bulletPoints: true,
    maxBullets: 4,
    fields: [
      { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
    ],
  },
]

/**
 * Executive Brief Template
 * One-page stakeholder-friendly output with key findings and recommendations
 * Story 7.2: Enhanced with onePage constraint, maxWordCount, and section limits
 */
export const EXECUTIVE_BRIEF_TEMPLATE: Template = {
  id: 'executive-brief',
  name: 'Executive Brief',
  description: 'Concise one-page summary optimized for stakeholders. Focuses on key findings, risk assessment, and actionable recommendations.',
  category: 'built-in',
  format: 'markdown',
  icon: 'FileText',
  estimatedTime: '< 2 min',
  tags: ['executive', 'summary', 'stakeholder', 'concise'],
  onePage: true,
  maxWordCount: 800,
  sections: EXECUTIVE_BRIEF_SECTIONS,
  preview: {
    thumbnail: 'templates/executive-brief.svg',
    sampleData: {
      executiveSummary: 'Operation completed successfully with 15 targets analyzed.',
      keyFindings: '• 3 critical vulnerabilities discovered\n• All external exposures mitigated\n• Compliance requirements met',
      riskRating: 'Medium',
      recommendations: '1. Patch critical systems within 24 hours\n2. Review access controls\n3. Schedule follow-up assessment',
    },
    previewSections: ['executive-summary', 'key-findings', 'risk-rating', 'recommendations'],
  },
}

/**
 * Technical Report Template
 * Comprehensive technical documentation with full details
 */
export const TECHNICAL_REPORT_TEMPLATE: Template = {
  id: 'technical-report',
  name: 'Technical Report',
  description: 'Comprehensive technical documentation with methodology, data analysis, detailed findings, and appendices. Ideal for technical teams and auditors.',
  category: 'built-in',
  format: 'markdown',
  icon: 'Code',
  estimatedTime: '5-10 min',
  tags: ['technical', 'detailed', 'documentation', 'audit'],
  sections: [
    {
      id: 'methodology',
      title: 'Methodology',
      description: 'Approach, tools, and techniques used',
      required: true,
      fields: [
        { id: 'approach', label: 'Approach', type: 'textarea', required: true },
        { id: 'tools', label: 'Tools Used', type: 'textarea', required: false },
      ],
    },
    {
      id: 'data-collection',
      title: 'Data Collection',
      description: 'Sources and methods for gathering information',
      required: true,
      fields: [
        { id: 'sources', label: 'Data Sources', type: 'textarea', required: true },
        { id: 'collectionPeriod', label: 'Collection Period', type: 'text', required: false },
      ],
    },
    {
      id: 'analysis',
      title: 'Analysis',
      description: 'Detailed analysis of collected data',
      required: true,
      fields: [
        { id: 'analysis', label: 'Analysis Details', type: 'textarea', required: true },
      ],
    },
    {
      id: 'findings',
      title: 'Findings',
      description: 'Complete findings with evidence and references',
      required: true,
      fields: [
        { id: 'findings', label: 'Detailed Findings', type: 'textarea', required: true },
        { id: 'evidence', label: 'Evidence References', type: 'textarea', required: false },
      ],
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Technical recommendations with implementation guidance',
      required: true,
      fields: [
        { id: 'recommendations', label: 'Technical Recommendations', type: 'textarea', required: true },
      ],
    },
    {
      id: 'appendices',
      title: 'Appendices',
      description: 'Supplementary materials and raw data references',
      required: false,
      fields: [
        { id: 'appendices', label: 'Appendices Content', type: 'textarea', required: false },
      ],
    },
  ],
  preview: {
    thumbnail: 'templates/technical-report.svg',
    sampleData: {
      methodology: 'Automated reconnaissance using industry-standard tools followed by manual validation.',
      dataCollection: '• OSINT gathering from public sources\n• Network scanning results\n• Application security testing',
      analysis: 'Analysis of collected data revealed patterns in configuration and potential attack vectors.',
      findings: 'Detailed findings include:\n1. Missing security headers\n2. Outdated dependencies\n3. Misconfigured access controls',
      recommendations: '1. Implement security headers per CSP policy\n2. Update dependencies to latest stable versions\n3. Review and harden access control configuration',
    },
    previewSections: ['methodology', 'data-collection', 'analysis', 'findings', 'recommendations'],
  },
}

/**
 * Registry of all built-in templates
 */
export const BUILTIN_TEMPLATES: Template[] = [
  EXECUTIVE_BRIEF_TEMPLATE,
  TECHNICAL_REPORT_TEMPLATE,
]

/**
 * Get built-in template by ID
 */
export function getBuiltinTemplate(id: string): Template | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id)
}

/**
 * Check if a template ID is a built-in template
 */
export function isBuiltinTemplate(id: string): boolean {
  return BUILTIN_TEMPLATES.some((t) => t.id === id)
}

/**
 * Get all built-in templates
 */
export function getBuiltinTemplates(): Template[] {
  return BUILTIN_TEMPLATES
}
