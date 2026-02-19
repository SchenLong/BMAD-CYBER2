/**
 * Missing Data Handler
 * Story 7.5: Template Rendering Engine - Task 3
 *
 * Gracefully handles missing data in agent outputs with configurable
 * strategies for different field types and requirements.
 */

import type {
  AgentOutput,
  MissingDataConfig,
  MissingDataStrategy,
} from '@/types/template-render'

/**
 * Default missing data configuration
 */
export const DEFAULT_MISSING_DATA_CONFIG: MissingDataConfig = {
  strategy: 'placeholder',
  placeholderText: 'No data available',
  logMissing: true,
  requiredFields: ['summary'],
}

/**
 * Missing field record for tracking
 */
interface MissingFieldRecord {
  path: string
  timestamp: Date
  strategy: MissingDataStrategy
}

/**
 * Session tracker for missing fields
 */
const missingFieldsLog: MissingFieldRecord[] = []

/**
 * Get value from nested object using dot notation
 * @param obj - Object to query
 * @param path - Dot-notation path (e.g., 'metadata.timestamp')
 * @returns Value at path or undefined
 */
export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined
  }

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current as T | undefined
}

/**
 * Check if a value is considered empty
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * Handle missing data based on strategy
 * @param config - Missing data configuration
 * @param fieldPath - Path to the field
 * @param currentValue - Current value (may be empty)
 * @param fallback - Fallback value
 * @returns Handled value
 */
export function handleMissingData<T>(
  config: MissingDataConfig,
  fieldPath: string,
  currentValue: T | undefined,
  fallback?: T
): T | string {
  const isMissing = isEmpty(currentValue)

  if (!isMissing) {
    return currentValue as T
  }

  // Log missing field if configured
  if (config.logMissing) {
    logMissingField(fieldPath, config.strategy)
  }

  // Check if this is a required field
  const isRequired = config.requiredFields.some(field =>
    fieldPath === field || fieldPath.startsWith(field + '.')
  )

  if (isRequired && config.strategy === 'error') {
    throw new Error(`Required field '${fieldPath}' is missing`)
  }

  // Apply strategy
  switch (config.strategy) {
    case 'placeholder':
      return fallback !== undefined
        ? (fallback as T)
        : `${config.placeholderText} (${fieldPath})`

    case 'empty':
      return '' as T

    case 'skip':
      // Return a marker that can be filtered out
      return null as T

    case 'error':
      throw new Error(`Field '${fieldPath}' is missing`)

    default:
      return fallback !== undefined
        ? (fallback as T)
        : config.placeholderText
  }
}

/**
 * Safely extract string value from agent output
 * @param output - Agent output
 * @param path - Field path
 * @param config - Missing data config
 * @returns String value or placeholder
 */
export function extractString(
  output: AgentOutput,
  path: string,
  config: MissingDataConfig = DEFAULT_MISSING_DATA_CONFIG
): string {
  const value = getNestedValue<string>(output, path)
  return handleMissingData(config, path, value, config.placeholderText) as string
}

/**
 * Safely extract array value from agent output
 * @param output - Agent output
 * @param path - Field path
 * @param config - Missing data config
 * @returns Array value or empty array
 */
export function extractArray<T>(
  output: AgentOutput,
  path: string,
  config: MissingDataConfig = DEFAULT_MISSING_DATA_CONFIG
): T[] {
  const value = getNestedValue<T[]>(output, path)

  if (isEmpty(value)) {
    handleMissingData(config, path, value)
    return []
  }

  return value as T[]
}

/**
 * Safely extract object value from agent output
 * @param output - Agent output
 * @param path - Field path
 * @param config - Missing data config
 * @param fallback - Fallback object
 * @returns Object value or fallback
 */
export function extractObject<T extends Record<string, unknown>>(
  output: AgentOutput,
  path: string,
  fallback: T,
  config: MissingDataConfig = DEFAULT_MISSING_DATA_CONFIG
): T {
  const value = getNestedValue<T>(output, path)
  return handleMissingData(config, path, value, fallback) as T
}

/**
 * Safely extract number value from agent output
 * @param output - Agent output
 * @param path - Field path
 * @param fallback - Fallback number
 * @param config - Missing data config
 * @returns Number value or fallback
 */
export function extractNumber(
  output: AgentOutput,
  path: string,
  fallback: number,
  config: MissingDataConfig = DEFAULT_MISSING_DATA_CONFIG
): number {
  const value = getNestedValue<number>(output, path)

  if (isEmpty(value) || typeof value !== 'number') {
    handleMissingData(config, path, value)
    return fallback
  }

  return value
}

/**
 * Safely extract date value from agent output
 * @param output - Agent output
 * @param path - Field path
 * @param fallback - Fallback date string
 * @param config - Missing data config
 * @returns Date string or fallback
 */
export function extractDate(
  output: AgentOutput,
  path: string,
  fallback?: string,
  config: MissingDataConfig = DEFAULT_MISSING_DATA_CONFIG
): string {
  const value = getNestedValue<string>(output, path)

  if (isEmpty(value)) {
    handleMissingData(config, path, value)
    return fallback || new Date().toISOString()
  }

  return value as string
}

/**
 * Transform data with error handling for missing properties
 * @param data - Data to transform
 * @param transformer - Transform function
 * @param fallback - Fallback value
 * @returns Transformed data or fallback
 */
export function safeTransform<T, R>(
  data: T,
  transformer: (data: T) => R,
  fallback: R
): R {
  try {
    if (isEmpty(data)) {
      return fallback
    }
    return transformer(data)
  } catch {
    return fallback
  }
}

/**
 * Expand array data with missing data handling
 * @param items - Array items to expand
 * @param formatter - Item formatter
 * @param maxItems - Maximum items to include
 * @returns Formatted items
 */
export function expandArrayData<T, R>(
  items: T[] | undefined,
  formatter: (item: T, index: number) => R,
  maxItems?: number
): R[] {
  if (!items || items.length === 0) {
    return []
  }

  const limited = maxItems ? items.slice(0, maxItems) : items
  return limited.map((item, index) => formatter(item, index))
}

/**
 * Get nested object value with multiple fallback paths
 * @param output - Agent output
 * @param paths - Array of paths to try (in order)
 * @returns First non-empty value found
 */
export function getValueWithFallbacks<T>(
  output: AgentOutput,
  paths: string[]
): T | undefined {
  for (const path of paths) {
    const value = getNestedValue<T>(output, path)
    if (!isEmpty(value)) {
      return value
    }
  }
  return undefined
}

/**
 * Log a missing field
 * @param path - Field path
 * @param strategy - Strategy used
 */
function logMissingField(path: string, strategy: MissingDataStrategy): void {
  const record: MissingFieldRecord = {
    path,
    timestamp: new Date(),
    strategy,
  }

  missingFieldsLog.push(record)

  // Keep log size manageable
  if (missingFieldsLog.length > 1000) {
    missingFieldsLog.splice(0, 100)
  }
}

/**
 * Get missing fields log
 * @param since - Optional date filter
 * @returns Missing field records
 */
export function getMissingFieldsLog(since?: Date): MissingFieldRecord[] {
  if (since) {
    return missingFieldsLog.filter(r => r.timestamp >= since)
  }
  return [...missingFieldsLog]
}

/**
 * Clear missing fields log
 */
export function clearMissingFieldsLog(): void {
  missingFieldsLog.length = 0
}

/**
 * Get summary of missing fields by path
 * @returns Summary object with counts
 */
export function getMissingFieldsSummary(): Record<string, number> {
  const summary: Record<string, number> = {}

  for (const record of missingFieldsLog) {
    summary[record.path] = (summary[record.path] || 0) + 1
  }

  return summary
}

/**
 * Validate required fields are present
 * @param output - Agent output
 * @param requiredFields - Required field paths
 * @returns Object with validation result and missing fields
 */
export function validateRequiredFields(
  output: AgentOutput,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const field of requiredFields) {
    const value = getNestedValue(output, field)
    if (isEmpty(value)) {
      missing.push(field)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}
