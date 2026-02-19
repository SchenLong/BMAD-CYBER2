/**
 * Template System
 * Story 7.1: Template Selector
 * Story 7.2: Executive Brief Template
 * Story 7.3: Technical Report Template
 * Story 7.5: Template Rendering Engine
 *
 * Central export point for all template functionality.
 */

// Built-in templates
export * from './builtin-templates'

// Storage
export * from './template-storage'

// Transformers
export * from './transformers'

// Risk calculator
export * from './risk-calculator'

// Data mapper
export * from './data-mapper'

// Technical report data mapper (Story 7.3)
export * from './technical-data-mapper'

// Formatters (Story 7.3, 7.5)
export * from './formatters'

// Renderers (Story 7.5)
export * from './renderers'

// Engine (Story 7.5)
export * from './engine'

// Cache (Story 7.5)
export * from './cache/render-cache'
