/**
 * Data Mapper
 * Story 7.5: Template Rendering Engine - Task 1
 *
 * Maps agent output data to template sections with support for
 * nested paths, transformations, and array expansion.
 */

import type { AgentOutput, TemplateMapping } from '@/types/template-render'
import { getNestedValue, isEmpty } from '../formatters/missing-data-handler'

/**
 * Extract data from agent output using template mapping
 * @param output - Agent output data
 * @param mapping - Template section mapping
 * @returns Mapped data
 */
export function mapDataFromOutput(
  output: AgentOutput,
  mapping: TemplateMapping
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [sectionId, config] of Object.entries(mapping)) {
    const { fields, transform, fallback } = config

    // Extract values from each field path
    const values: unknown[] = []
    for (const field of fields) {
      const value = getNestedValue(output, field)
      if (value !== undefined) {
        values.push(value)
      }
    }

    // Apply transform if provided
    let mappedValue: unknown
    if (transform && values.length > 0) {
      mappedValue = transform(values.length === 1 ? values[0] : values)
    } else {
      mappedValue = values.length === 1 ? values[0] : values
    }

    // Use fallback if no values found
    if (isEmpty(mappedValue) && fallback !== undefined) {
      mappedValue = fallback
    }

    result[sectionId] = mappedValue
  }

  return result
}

/**
 * Create a template mapping from a template
 * @param template - Template with sections
 * @returns Template mapping configuration
 */
export function createTemplateMapping(
  template: Record<string, { fields?: string[] }>
): TemplateMapping {
  const mapping: TemplateMapping = {}

  for (const [sectionId, config] of Object.entries(template)) {
    mapping[sectionId] = {
      fields: config.fields || [],
      required: true,
    }
  }

  return mapping
}

/**
 * Expand array data into multiple template instances
 * @param data - Array data to expand
 * @param template - Template to use for each item
 * @param itemField - Field name to use for item data
 * @returns Array of mapped data objects
 */
export function expandArrayData<T>(
  data: T[],
  template: Record<string, { fields?: string[] }>,
  itemField = 'item'
): Array<Record<string, unknown>> {
  return data.map((item, index) => ({
    ...mapDataFromOutput({ [itemField]: item } as AgentOutput, createTemplateMapping(template)),
    _index: index,
  }))
}

/**
 * Validate that all required fields are present in output
 * @param output - Agent output to validate
 * @param requiredFields - Required field paths
 * @returns Validation result
 */
export function validateOutputFields(
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

/**
 * Get a value from agent output with multiple fallback paths
 * @param output - Agent output
 * @param paths - Array of paths to try (in order)
 * @returns First non-empty value found
 */
export function getValueWithFallbacks<T = unknown>(
  output: AgentOutput,
  paths: string[]
): T | undefined {
  for (const path of paths) {
    const value = getNestedValue<T>(output, path)
    if (value !== undefined && !isEmpty(value)) {
      return value
    }
  }
  return undefined
}

/**
 * Flatten nested object for template rendering
 * @param obj - Object to flatten
 * @param separator - Path separator (default: '.')
 * @returns Flattened object
 */
export function flattenObject(
  obj: Record<string, unknown>,
  separator = '.'
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  function flatten(current: Record<string, unknown>, parentKey = '') {
    for (const [key, value] of Object.entries(current)) {
      const newKey = parentKey ? `${parentKey}${separator}${key}` : key

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, newKey)
      } else {
        result[newKey] = value
      }
    }
  }

  flatten(obj)
  return result
}
