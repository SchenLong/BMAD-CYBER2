/**
 * CLI Security Types
 * Story 5.5: CLI Bridge Security Middleware
 *
 * Type definitions for CLI security middleware including authentication,
 * rate limiting, and authorization.
 */

import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Authentication context attached to requests
 * Contains user information extracted from JWT token
 */
export interface AuthContext {
  /** User ID from JWT subject */
  userId: string;
  /** User email address */
  email: string;
  /** User's assigned roles */
  roles: UserRole[];
  /** Client IP address */
  ip: string;
  /** Client user agent string */
  userAgent?: string;
  /** Token expiration timestamp */
  exp?: number;
}

/**
 * Rate limit configuration for a specific command
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional description of why this limit exists */
  description?: string;
  /** Optional bypass for specific roles */
  bypassRoles?: UserRole[];
}

/**
 * Rate limit entry tracking state
 */
export interface RateLimitEntry {
  /** Number of requests in current window */
  count: number;
  /** Window start timestamp */
  windowStart: number;
  /** First request timestamp in window */
  firstRequest?: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Seconds until retry is allowed (if not allowed) */
  retryAfter?: number;
  /** Remaining requests in window */
  remaining: number;
  /** Window reset timestamp */
  resetTime: number;
  /** Applied limit */
  limit: number;
}

/**
 * Audit log entry for CLI security events
 * Extended from Story 5.1 audit logging
 */
export interface SecurityAuditLogEntry {
  /** ISO-8601 timestamp */
  timestamp: string;
  /** User ID who made the request */
  userId: string;
  /** User's roles */
  userRoles: UserRole[];
  /** Command being executed (if applicable) */
  command?: string;
  /** Event type */
  eventType: 'auth_success' | 'auth_failure' | 'rate_limited' | 'authz_success' | 'authz_failure' | 'command_executed';
  /** Client IP address */
  ipAddress: string;
  /** User agent string */
  userAgent: string;
  /** HTTP status code returned */
  statusCode: number;
  /** Error message if applicable */
  error?: string;
  /** Additional event details */
  details?: Record<string, unknown>;
  /** SHA-256 hash for tamper evidence */
  hash?: string;
  /** Previous hash in chain */
  prevHash?: string;
}

/**
 * Security error with HTTP status code
 */
export class SecurityError extends Error {
  /** HTTP status code to return */
  public readonly statusCode: number;
  /** Error code for client */
  public readonly code: string;
  /** Additional details */
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'SECURITY_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SecurityError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  /**
   * Convert to NextResponse
   */
  toResponse(): NextResponse {
    return NextResponse.json(
      {
        error: this.message,
        code: this.code,
        ...(this.details && { details: this.details }),
      },
      { status: this.statusCode }
    );
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends SecurityError {
  constructor(message: string = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 401, 'INVALID_TOKEN', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends SecurityError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, unknown>) {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS', details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends SecurityError {
  constructor(retryAfter: number, details?: Record<string, unknown>) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter, ...details });
    this.name = 'RateLimitError';
  }
}

/**
 * Command not found error (404)
 */
export class CommandNotFoundError extends SecurityError {
  constructor(command: string, availableCommands?: string[]) {
    super(
      'Command not found',
      404,
      'COMMAND_NOT_FOUND',
      { command, ...(availableCommands && { availableCommands }) }
    );
    this.name = 'CommandNotFoundError';
  }
}

/**
 * Security middleware chain result
 * Either returns a NextResponse (error/blocked) or continues with auth context
 */
export type SecurityMiddlewareResult =
  | { response: NextResponse } // Blocked/error response
  | { authContext: AuthContext }; // Allowed to proceed

/**
 * Security headers to add to responses
 */
export interface SecurityHeaders {
  'X-Content-Type-Options': 'nosniff';
  'X-Frame-Options': 'DENY' | 'SAMEORIGIN';
  'X-XSS-Protection': string;
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
}

/**
 * CLI security configuration
 */
export interface CLISecurityConfig {
  /** Default rate limit for all commands */
  defaultRateLimit: RateLimitConfig;
  /** Per-command rate limits */
  commandRateLimits: Record<string, RateLimitConfig>;
  /** Trusted IPs that bypass rate limiting */
  trustedIPs: string[];
  /** Roles that bypass rate limiting */
  rateLimitBypassRoles: UserRole[];
  /** Whether to enable audit logging */
  auditLoggingEnabled: boolean;
  /** Audit log directory */
  auditLogDir: string;
}
