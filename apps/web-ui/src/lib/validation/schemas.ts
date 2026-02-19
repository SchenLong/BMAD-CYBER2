/**
 * Common Validation Schemas
 * Story 9.6: Input Validation Layer
 *
 * Zod schemas for input validation across all endpoints.
 * Provides base schemas, validators, and helpers.
 */

import { z } from 'zod';

/**
 * Length Constraints
 */
export const LENGTH_CONSTRAINTS = {
  TITLE: 200,
  NAME: 100,
  SHORT_TEXT: 500,
  DESCRIPTION: 10000,
  URL: 2048,
  EMAIL: 320,
  UUID: 36,
  SLUG: 100,
} as const;

/**
 * Base Schemas
 */

// Email validation with max length per RFC 5321
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(LENGTH_CONSTRAINTS.EMAIL, 'Email is too long');

// UUID validation
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')
  .max(LENGTH_CONSTRAINTS.UUID, 'Invalid UUID format');

// URL validation with protocol requirement
export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Invalid URL format')
  .max(LENGTH_CONSTRAINTS.URL, 'URL is too long')
  .refine(
    (url) => {
      const allowedProtocols = ['http:', 'https:', 'ftp:', 'ftps:'];
      try {
        const parsed = new URL(url);
        return allowedProtocols.includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use http, https, ftp, or ftps protocol' }
  );

// Date/time validation (ISO 8601)
export const dateTimeSchema = z
  .string()
  .datetime('Invalid datetime format. Use ISO 8601 format');

// Date only (YYYY-MM-DD)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');

// Boolean schema (strict, no truthy/falsy coercion)
export const booleanSchema = z.boolean({
  required_error: 'Boolean value is required',
  invalid_type_error: 'Must be a boolean (true or false)',
});

// Number schema with range helpers
export const positiveNumberSchema = z
  .number({ required_error: 'Number is required' })
  .positive('Must be a positive number');

export const nonNegativeNumberSchema = z
  .number({ required_error: 'Number is required' })
  .nonnegative('Must be zero or greater');

export const portSchema = z
  .number({ required_error: 'Port number is required' })
  .int('Port must be an integer')
  .min(1, 'Port must be between 1 and 65535')
  .max(65535, 'Port must be between 1 and 65535');

// Integer schema
export const intSchema = z
  .number({ required_error: 'Integer is required' })
  .int('Must be an integer');

/**
 * String Validators with Length Constraints
 */

// Title/name fields (required, 1-200 chars)
export const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(LENGTH_CONSTRAINTS.TITLE, 'Title is too long (max 200 characters)');

// Name fields (required, 2-100 chars)
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(LENGTH_CONSTRAINTS.NAME, 'Name is too long (max 100 characters)')
  .trim();

// Optional name
export const optionalNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(LENGTH_CONSTRAINTS.NAME, 'Name is too long (max 100 characters)')
  .trim()
  .optional();

// Short text (optional, max 500 chars)
export const shortTextSchema = z
  .string()
  .max(LENGTH_CONSTRAINTS.SHORT_TEXT, 'Text is too long (max 500 characters)')
  .trim()
  .optional();

// Description/long text (optional, max 10000 chars)
export const descriptionSchema = z
  .string()
  .max(LENGTH_CONSTRAINTS.DESCRIPTION, 'Description is too long (max 10000 characters)')
  .trim()
  .optional();

// Slug validation (lowercase letters, numbers, hyphens)
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(LENGTH_CONSTRAINTS.SLUG, 'Slug is too long (max 100 characters)')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .trim();

// API key format validation
export const apiKeySchema = z
  .string()
  .min(32, 'API key is too short')
  .regex(/^[a-zA-Z0-9_-]+$/, 'API key must contain only letters, numbers, underscores, and hyphens');

/**
 * Array Validators
 */

// Non-empty array
export const nonEmptyArraySchema = <T extends z.ZodType>(itemSchema: T) =>
  z.array(itemSchema).min(1, 'Array must contain at least one item');

// Bounded array (min and max items)
export const boundedArraySchema = <T extends z.ZodType>(
  itemSchema: T,
  min: number = 0,
  max: number = 100
) =>
  z
    .array(itemSchema)
    .min(min, `Array must contain at least ${min} item(s)`)
    .max(max, `Array must contain at most ${max} item(s)`);

/**
 * Object Validators with Strict Mode
 */

// Create a strict schema (rejects unknown properties)
export function createStrictSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict();
}

// Create a schema that allows unknown properties (passthrough)
export function createPassthroughSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).passthrough();
}

/**
 * Enum Validators
 */

// Create an enum schema from string array
export function createEnumSchema<T extends readonly [string, ...string[]]>(
  values: T,
  fieldName = 'value'
) {
  return z.enum(values, {
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be one of: ${values.join(', ')}`,
  });
}

/**
 * Common Field Sets
 */

// Metadata field (key-value pairs with unknown values)
export const metadataFieldSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .refine(
    (meta) => {
      if (!meta) return true;
      // Check total size (rough estimate)
      const jsonSize = JSON.stringify(meta).length;
      return jsonSize <= 5000; // Max 5KB for metadata
    },
    { message: 'Metadata is too large (max 5KB)' }
  );

// Pagination params
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

// ID params (single or multiple)
export const idParamSchema = z.object({
  id: uuidSchema,
});

export const idsParamSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
});

/**
 * Sanitization (HTML)
 * Note: This is a placeholder. Full HTML sanitization requires DOMPurify.
 * In a production environment, use isomorphic-dompurify or similar.
 */

/**
 * Sanitize HTML by removing potentially dangerous content
 * This is a basic implementation - for production, use DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  // Remove object/embed tags
  sanitized = sanitized.replace(/<(?:object|embed|form)\b[^<]*(?:(?!<\/(?:object|embed|form)>)<[^<]*)*<\/?(?:object|embed|form)>/gi, '');
  return sanitized;
}

/**
 * Create a schema that sanitizes HTML string input
 */
export function createHtmlSchema(maxLength = LENGTH_CONSTRAINTS.DESCRIPTION) {
  return z
    .string()
    .max(maxLength, `HTML content is too long (max ${maxLength} characters)`)
    .transform(sanitizeHtml);
}

/**
 * Type Exports
 */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type IdsParam = z.infer<typeof idsParamSchema>;
