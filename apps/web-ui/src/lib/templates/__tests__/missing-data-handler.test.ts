/**
 * Missing Data Handler Tests
 * Story 7.5: Template Rendering Engine - Task 9
 *
 * Tests for the missing data handler.
 */

import {
  getNestedValue,
  isEmpty,
  extractString,
  extractArray,
  extractObject,
  extractNumber,
  extractDate,
  safeTransform,
  expandArrayData,
  getValueWithFallbacks,
  validateRequiredFields,
  DEFAULT_MISSING_DATA_CONFIG,
} from '../formatters/missing-data-handler'
import type { AgentOutput } from '@/types/template-render'

describe('Missing Data Handler', () => {
  const mockOutput: AgentOutput = {
    agent: 'test-agent',
    workflow: 'test-workflow',
    summary: 'Test summary',
    findings: [
      { title: 'Finding 1', description: 'Description 1', severity: 'high' },
      { title: 'Finding 2', description: 'Description 2', severity: 'medium' },
    ],
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    metadata: {
      timestamp: '2024-01-15T10:00:00Z',
      agent: 'test-agent',
      duration: 5000,
      user: 'test-user',
      projectName: 'test-project',
    },
  }

  describe('getNestedValue', () => {
    it('should extract top-level values', () => {
      expect(getNestedValue(mockOutput, 'agent')).toBe('test-agent')
      expect(getNestedValue(mockOutput, 'summary')).toBe('Test summary')
    })

    it('should extract nested values with dot notation', () => {
      expect(getNestedValue(mockOutput, 'metadata.timestamp')).toBe('2024-01-15T10:00:00Z')
      expect(getNestedValue(mockOutput, 'metadata.duration')).toBe(5000)
    })

    it('should return undefined for missing paths', () => {
      expect(getNestedValue(mockOutput, 'nonexistent')).toBeUndefined()
      expect(getNestedValue(mockOutput, 'metadata.nonexistent')).toBeUndefined()
    })

    it('should handle arrays in path', () => {
      const result = getNestedValue(mockOutput, 'findings.0.title')
      expect(result).toBe('Finding 1')
    })
  })

  describe('isEmpty', () => {
    it('should detect null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should detect empty strings', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
    })

    it('should detect empty arrays', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('should detect empty objects', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should not detect non-empty values', () => {
      expect(isEmpty('text')).toBe(false)
      expect(isEmpty(['item'])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('extractString', () => {
    it('should extract existing string values', () => {
      expect(extractString(mockOutput, 'summary')).toBe('Test summary')
      expect(extractString(mockOutput, 'agent')).toBe('test-agent')
    })

    it('should return placeholder for missing values', () => {
      const result = extractString(mockOutput, 'nonexistent')
      expect(result).toContain('No data available')
    })

    it('should use custom placeholder', () => {
      const config = { ...DEFAULT_MISSING_DATA_CONFIG, placeholderText: 'Custom placeholder' }
      const result = extractString(mockOutput, 'nonexistent', config)
      expect(result).toContain('Custom placeholder')
    })
  })

  describe('extractArray', () => {
    it('should extract existing arrays', () => {
      const result = extractArray(mockOutput, 'recommendations')
      expect(result).toEqual(['Recommendation 1', 'Recommendation 2'])
    })

    it('should return empty array for missing values', () => {
      const result = extractArray(mockOutput, 'nonexistent')
      expect(result).toEqual([])
    })

    it('should handle array of objects', () => {
      const result = extractArray(mockOutput, 'findings')
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('title', 'Finding 1')
    })
  })

  describe('extractObject', () => {
    it('should extract existing objects', () => {
      const result = extractObject(mockOutput, 'metadata', { default: true })
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('duration')
    })

    it('should return fallback for missing values', () => {
      const fallback = { default: 'value' }
      const result = extractObject(mockOutput, 'nonexistent', fallback)
      expect(result).toEqual(fallback)
    })
  })

  describe('extractNumber', () => {
    it('should extract existing numbers', () => {
      expect(extractNumber(mockOutput, 'metadata.duration', 0)).toBe(5000)
    })

    it('should return fallback for missing values', () => {
      expect(extractNumber(mockOutput, 'nonexistent', 42)).toBe(42)
    })

    it('should handle non-number values', () => {
      const stringOutput = { ...mockOutput, metadata: { ...mockOutput.metadata, duration: '5000' as any } }
      expect(extractNumber(stringOutput, 'metadata.duration', 0)).toBe(0)
    })
  })

  describe('extractDate', () => {
    it('should extract existing dates', () => {
      const result = extractDate(mockOutput, 'metadata.timestamp')
      expect(result).toBe('2024-01-15T10:00:00Z')
    })

    it('should return fallback for missing values', () => {
      const result = extractDate(mockOutput, 'nonexistent', '2024-01-01')
      expect(result).toBe('2024-01-01')
    })

    it('should use current date if no fallback', () => {
      const result = extractDate(mockOutput, 'nonexistent')
      expect(result).toBeTruthy()
    })
  })

  describe('safeTransform', () => {
    it('should transform valid data', () => {
      const result = safeTransform('hello world', (s) => s.toUpperCase(), 'fallback')
      expect(result).toBe('HELLO WORLD')
    })

    it('should return fallback for empty data', () => {
      const result = safeTransform('', (s) => s.toUpperCase(), 'fallback')
      expect(result).toBe('fallback')
    })

    it('should return fallback on error', () => {
      const result = safeTransform('invalid', JSON.parse, 'fallback')
      expect(result).toBe('fallback')
    })
  })

  describe('expandArrayData', () => {
    it('should expand array with formatter', () => {
      const items = ['item1', 'item2', 'item3']
      const result = expandArrayData(items, (item, index) => `${index + 1}. ${item}`)
      expect(result).toEqual(['1. item1', '2. item2', '3. item3'])
    })

    it('should limit items with maxItems', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      const result = expandArrayData(items, (item) => item, 3)
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for undefined', () => {
      const result = expandArrayData(undefined, (item) => item)
      expect(result).toEqual([])
    })
  })

  describe('getValueWithFallbacks', () => {
    it('should return first matching value', () => {
      const result = getValueWithFallbacks(mockOutput, ['nonexistent1', 'agent', 'summary'])
      expect(result).toBe('test-agent')
    })

    it('should try all paths', () => {
      const result = getValueWithFallbacks(mockOutput, ['nonexistent1', 'nonexistent2', 'summary'])
      expect(result).toBe('Test summary')
    })

    it('should return undefined if no paths match', () => {
      const result = getValueWithFallbacks(mockOutput, ['nonexistent1', 'nonexistent2'])
      expect(result).toBeUndefined()
    })
  })

  describe('validateRequiredFields', () => {
    it('should pass validation when all required fields present', () => {
      const result = validateRequiredFields(mockOutput, ['agent', 'summary'])
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should fail validation when required fields missing', () => {
      const result = validateRequiredFields(mockOutput, ['agent', 'nonexistent'])
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('nonexistent')
    })

    it('should validate nested paths', () => {
      const result = validateRequiredFields(mockOutput, ['metadata.timestamp'])
      expect(result.valid).toBe(true)
    })
  })
})
