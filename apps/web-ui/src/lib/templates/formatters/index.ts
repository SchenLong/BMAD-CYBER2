/**
 * Template Formatters Index
 * Story 7.3: Technical Report Template
 * Story 7.5: Template Rendering Engine
 */

// Code highlighting
export {
  initializeCodeHighlighter,
  highlightCode,
  highlightCodeBlocks,
  generateMarkdownCodeBlock,
  generateMarkdownCodeBlocks,
  extractCodeSnippets,
  detectLanguage,
  formatWithLineNumbers,
  getLanguageClass,
  getLanguageDisplayName,
} from './code-highlighter'

// Table generation
export {
  generateMarkdownTable,
  generateHtmlTable,
  tableFromObjects,
  createComparisonTable,
  createStatisticsTable,
  sortTableRows,
  filterTableRows,
  calculateColumnSummary,
} from './table-generator'

// Table of contents
export {
  generateTOCFromMarkdown,
  buildTOCHierarchy,
  generateTechnicalReportTOC,
  generateMarkdownTOC,
  generateHtmlTOC,
  generateCollapsibleTOC,
  updatePageNumbers,
  flattenTOC,
  findTOCEntry,
} from './toc-generator'

// Story 7.5: Missing data handler
export {
  getNestedValue,
  isEmpty,
  handleMissingData,
  extractString,
  extractArray,
  extractObject,
  extractNumber,
  extractDate,
  safeTransform,
  expandArrayData,
  getValueWithFallbacks,
  getMissingFieldsLog,
  clearMissingFieldsLog,
  getMissingFieldsSummary,
  validateRequiredFields,
  DEFAULT_MISSING_DATA_CONFIG,
} from './missing-data-handler'

// Story 7.5: Concise formatter
export {
  formatConciseText,
  formatConciseFindings,
  formatConciseRecommendations,
  extractExecutiveSummary,
  extractKeyFindings,
  extractRiskLevel,
  applyConciseFormatting,
  formatExecutiveMetadata,
  calculateRiskBreakdown,
  DEFAULT_CONCISE_RULES,
} from './concise-formatter'

// Story 7.5: Detailed formatter
export {
  formatDetailedText,
  formatDetailedFindings,
  formatMethodology,
  formatDataCollection,
  formatAnalysis,
  formatDetailedRecommendations,
  formatAppendices,
  applyDetailedFormatting,
  formatTechnicalMetadata,
  extractTechnicalReportData,
  DEFAULT_DETAILED_RULES,
} from './detailed-formatter'
