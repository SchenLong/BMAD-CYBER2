/**
 * API Response Utilities
 * Story 8.1: RESTful API Implementation
 * Task 1: Create API Base Infrastructure
 *
 * Provides standardized response wrappers for all API endpoints.
 * Ensures consistent response structure across the application.
 */

import { NextResponse } from 'next/server';
import { applyRateLimitHeaders } from '@/lib/security/security-headers';

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ResponseMeta;
}

/**
 * Error information structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  totalCount?: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Rate limit metadata
 */
export interface RateLimitMeta {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Error codes enumeration
 */
export enum ErrorCode {
  // Validation errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ENDPOINT_NOT_FOUND = 'ENDPOINT_NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business logic errors
  CONFLICT = 'CONFLICT',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,

  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,

  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.ENDPOINT_NOT_FOUND]: 404,

  [ErrorCode.RATE_LIMITED]: 429,

  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,

  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.OPERATION_FAILED]: 400,
};

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Get API version from environment
 */
export function getApiVersion(): string {
  return process.env.API_VERSION || '1.0.0';
}

/**
 * Create a successful API response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param meta - Additional metadata
 * @returns NextResponse with standardized structure
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: Partial<ResponseMeta>
): NextResponse<ApiResponse<T>> {
  const requestId = meta?.requestId || generateRequestId();
  const timestamp = new Date().toISOString();

  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    meta: {
      requestId,
      timestamp,
      version: getApiVersion(),
      ...meta,
    },
  };

  const nextResponse = NextResponse.json(response, { status });

  // Apply rate limit headers if provided
  if (meta?.rateLimit) {
    applyRateLimitHeaders(
      nextResponse,
      meta.rateLimit.limit,
      meta.rateLimit.remaining,
      meta.rateLimit.reset
    );
  }

  return nextResponse;
}

/**
 * Create a paginated API response
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with pagination info
 */
export function apiPaginated<T>(
  data: T[],
  pagination: Omit<PaginationMeta, 'hasNextPage' | 'hasPreviousPage'> & {
    totalCount: number;
  },
  status: number = 200
): NextResponse<ApiResponse<T[]>> {
  const totalPages = pagination.totalCount
    ? Math.ceil(pagination.totalCount / pagination.perPage)
    : 0;

  const paginationMeta: PaginationMeta = {
    ...pagination,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };

  return apiSuccess(data, status, {
    pagination: paginationMeta,
  });
}

/**
 * Create an error API response
 *
 * @param code - Error code
 * @param message - Human-readable error message
 * @param details - Additional error details
 * @param status - Override HTTP status code
 * @returns NextResponse with error structure
 */
export function apiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  status?: number
): NextResponse<ApiResponse<null>> {
  const actualStatus = status ?? ERROR_STATUS_MAP[code] ?? 500;
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId,
      timestamp,
      version: getApiVersion(),
    },
  };

  return NextResponse.json(response, { status: actualStatus });
}

/**
 * Create a validation error response (400)
 *
 * @param message - Error message
 * @param details - Validation error details
 * @returns NextResponse with validation error
 */
export function apiValidationError(
  message: string = 'Validation failed',
  details?: Record<string, unknown>
): NextResponse<ApiResponse<null>> {
  return apiError(ErrorCode.VALIDATION_ERROR, message, details);
}

/**
 * Create an unauthorized response (401)
 *
 * @param message - Error message
 * @returns NextResponse with unauthorized error
 */
export function apiUnauthorized(
  message: string = 'Authentication required'
): NextResponse<ApiResponse<null>> {
  return apiError(ErrorCode.UNAUTHORIZED, message);
}

/**
 * Create a forbidden response (403)
 *
 * @param message - Error message
 * @returns NextResponse with forbidden error
 */
export function apiForbidden(
  message: string = 'Insufficient permissions'
): NextResponse<ApiResponse<null>> {
  return apiError(ErrorCode.INSUFFICIENT_PERMISSIONS, message);
}

/**
 * Create a not found response (404)
 *
 * @param resource - Resource name
 * @returns NextResponse with not found error
 */
export function apiNotFound(
  resource: string = 'Resource'
): NextResponse<ApiResponse<null>> {
  return apiError(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`);
}

/**
 * Create a rate limited response (429)
 *
 * @param retryAfter - Seconds until retry is allowed
 * @returns NextResponse with rate limit error
 */
export function apiRateLimited(retryAfter?: number): NextResponse<ApiResponse<null>> {
  const response = apiError(
    ErrorCode.RATE_LIMITED,
    'Too many requests. Please try again later.'
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Create a conflict response (409)
 *
 * @param message - Error message
 * @param details - Additional details
 * @returns NextResponse with conflict error
 */
export function apiConflict(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiResponse<null>> {
  return apiError(ErrorCode.CONFLICT, message, details);
}

/**
 * Create an internal server error response (500)
 *
 * @param message - Error message
 * @param details - Additional details (excluded in production)
 * @returns NextResponse with internal error
 */
export function apiInternalError(
  message: string = 'An internal server error occurred',
  details?: Record<string, unknown>
): NextResponse<ApiResponse<null>> {
  // In production, don't expose internal error details
  const safeDetails =
    process.env.NODE_ENV === 'production' ? undefined : details;

  return apiError(ErrorCode.INTERNAL_ERROR, message, safeDetails);
}

/**
 * Helper function to parse pagination query parameters
 *
 * @param searchParams - URLSearchParams from request
 * @returns Parsed pagination parameters
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  perPage: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('perPage') || searchParams.get('limit') || '20', 10))
  );

  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
  };
}
