/**
 * Validation Error Formatting
 * Story 9.6: Input Validation Layer
 *
 * Formats Zod validation errors into consistent API responses.
 */

import { ZodError } from 'zod';

/**
 * Single validation error
 */
export interface ValidationError {
  path: string[];
  message: string;
  code: string;
  received?: unknown;
}

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  error: string;
  details: ValidationError[];
}

/**
 * Format Zod validation errors into a consistent format
 *
 * @param issues - Zod error issues array
 * @param includeReceived - Whether to include received values (default: false for security)
 * @returns Formatted validation errors
 */
export function formatValidationErrors(
  issues: ZodError['issues'],
  includeReceived = false
): ValidationError[] {
  return issues.map((error) => ({
    path: error.path.map(String),
    message: formatErrorMessage(error),
    code: error.code,
    ...(includeReceived && { received: error.received }),
  }));
}

/**
 * Format a single Zod error message
 * Adds context to make errors more user-friendly
 */
function formatErrorMessage(error: {
  message: string;
  code: string;
  path: (string | number)[];
}): string {
  const path = error.path.length > 0 ? error.path.join('.') : 'field';
  const message = error.message;

  // Add context for common error codes
  switch (error.code) {
    case 'too_small':
      if (error.path.length > 0 && error.path[error.path.length - 1] === 'email') {
        return `${path} is required`;
      }
      return `${message} (at ${path})`;
    case 'too_big':
      return `${message} (at ${path})`;
    case 'invalid_type':
      return `${path} has invalid type (expected ${getExpectedTypeName(error)})`;
    case 'invalid_enum_value':
      return `${path} must be one of the allowed values`;
    case 'unrecognized_keys':
      return `Unexpected fields found: ${error.keys?.join(', ')}`;
    default:
      return `${path}: ${message}`;
  }
}

/**
 * Get human-readable type name from Zod error
 */
function getExpectedTypeName(error: {
  expected?: string;
  received?: unknown;
}): string {
  if (error.expected) {
    return error.expected;
  }
  if (error.received === undefined) {
    return 'defined';
  }
  if (error.received === null) {
    return 'non-null';
  }
  return typeof error.received;
}

/**
 * Create a validation error response
 * Suitable for returning from API routes
 *
 * @param issues - Zod error issues array
 * @param statusCode - HTTP status code (default: 400)
 * @returns Response object
 */
export function createValidationErrorResponse(
  issues: ZodError['issues'],
  statusCode = 400
): { statusCode: number; body: ValidationErrorResponse } {
  return {
    statusCode,
    body: {
      error: 'Validation failed',
      details: formatValidationErrors(issues),
    },
  };
}

/**
 * Create a 400 Bad Request response with validation errors
 *
 * @param issues - Zod error issues array
 * @returns Response object
 */
export function badRequest(
  issues: ZodError['issues']
): { statusCode: number; body: ValidationErrorResponse } {
  return createValidationErrorResponse(issues, 400);
}

/**
 * Create a validation error for JSON parsing failures
 */
export function createInvalidJSONResponse(): {
  statusCode: number;
  body: { error: string; details: ValidationError[] };
} {
  return {
    statusCode: 400,
    body: {
      error: 'Invalid JSON',
      details: [
        {
          path: ['body'],
          message: 'Request body contains invalid JSON',
          code: 'invalid_json',
        },
      ],
    },
  };
}

/**
 * Create a validation error for content-type mismatches
 */
export function createInvalidContentTypeResponse(
  expected = 'application/json'
): {
  statusCode: number;
  body: { error: string; details: ValidationError[] };
} {
  return {
    statusCode: 400,
    body: {
      error: 'Invalid Content-Type',
      details: [
        {
          path: ['headers', 'content-type'],
          message: `Content-Type must be ${expected}`,
          code: 'invalid_content_type',
        },
      ],
    },
  };
}

/**
 * Validate and extract request body with proper error handling
 *
 * @param request - Next.js Request object
 * @param schema - Zod schema to validate against
 * @returns Tuple of (success, data | errors)
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } }
): Promise<{ success: true; data: T } | { success: false; response: ReturnType<typeof createValidationErrorResponse>}> {
  // Check content type
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    return {
      success: false,
      response: createInvalidContentTypeResponse(),
    };
  }

  // Parse body
  let body: unknown;
  try {
    const text = await request.text();
    if (!text) {
      body = {};
    } else {
      body = JSON.parse(text);
    }
  } catch {
    return {
      success: false,
      response: createInvalidJSONResponse(),
    };
  }

  // Validate against schema
  const result = schema.safeParse(body);
  if (!result.success) {
    // Use issues property from ZodError
    const issues = result.error?.issues ?? [];
    return {
      success: false,
      response: createValidationErrorResponse(issues),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
