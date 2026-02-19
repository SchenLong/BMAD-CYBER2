/**
 * Security Headers Utility
 * Story 5.5: CLI Bridge Security Middleware - Task 8
 *
 * Provides standard security headers for HTTP responses.
 * Headers can be applied to individual responses or globally.
 */

import { NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /** X-Content-Type-Options */
  contentTypeOptions?: 'nosniff';
  /** X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  /** X-XSS-Protection */
  xssProtection?: string;
  /** Strict-Transport-Security */
  strictTransportSecurity?: string;
  /** Content-Security-Policy */
  contentSecurityPolicy?: string;
  /** Referrer-Policy */
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  /** Permissions-Policy */
  permissionsPolicy?: string;
  /** Cross-Origin-Opener-Policy */
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  /** Cross-Origin-Resource-Policy */
  crossOriginResourcePolicy?: 'same-origin' | 'same-site' | 'cross-origin';
  /** Cross-Origin-Embedder-Policy */
  crossOriginEmbedderPolicy?: 'require-corp' | 'credentialless';
}

/**
 * Default security headers for production
 */
const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * Development security headers (relaxed for local development)
 */
const DEV_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Get security headers based on environment
 *
 * @returns Security headers object
 */
function getSecurityHeaders(): Record<string, string> {
  if (process.env.NODE_ENV === 'production') {
    return {
      ...DEFAULT_SECURITY_HEADERS,
      // Only add HSTS in production with HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    };
  }

  return DEV_SECURITY_HEADERS;
}

/**
 * Apply security headers to a response
 *
 * @param response - NextResponse object
 * @param customHeaders - Optional custom headers to override defaults
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(
  response: NextResponse,
  customHeaders?: Partial<SecurityHeadersConfig>
): NextResponse {
  const headers = getSecurityHeaders();

  // Apply default headers
  for (const [key, value] of Object.entries(headers)) {
    // Don't override if already set
    if (!response.headers.get(key)) {
      response.headers.set(key, value);
    }
  }

  // Apply custom headers
  if (customHeaders) {
    if (customHeaders.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', customHeaders.contentTypeOptions);
    }
    if (customHeaders.frameOptions) {
      response.headers.set('X-Frame-Options', customHeaders.frameOptions);
    }
    if (customHeaders.xssProtection) {
      response.headers.set('X-XSS-Protection', customHeaders.xssProtection);
    }
    if (customHeaders.strictTransportSecurity) {
      response.headers.set('Strict-Transport-Security', customHeaders.strictTransportSecurity);
    }
    if (customHeaders.contentSecurityPolicy) {
      response.headers.set('Content-Security-Policy', customHeaders.contentSecurityPolicy);
    }
    if (customHeaders.referrerPolicy) {
      response.headers.set('Referrer-Policy', customHeaders.referrerPolicy);
    }
    if (customHeaders.permissionsPolicy) {
      response.headers.set('Permissions-Policy', customHeaders.permissionsPolicy);
    }
    if (customHeaders.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', customHeaders.crossOriginOpenerPolicy);
    }
    if (customHeaders.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', customHeaders.crossOriginResourcePolicy);
    }
    if (customHeaders.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', customHeaders.crossOriginEmbedderPolicy);
    }
  }

  return response;
}

/**
 * Create a response with security headers
 *
 * @param body - Response body
 * @param init - Response init options
 * @param customHeaders - Optional custom security headers
 * @returns NextResponse with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit,
  customHeaders?: Partial<SecurityHeadersConfig>
): NextResponse {
  const response = new NextResponse(body, init);
  return applySecurityHeaders(response, customHeaders);
}

/**
 * Create a secure JSON response
 *
 * @param data - Data to serialize
 * @param init - Response init options
 * @param customHeaders - Optional custom security headers
 * @returns NextResponse with security headers
 */
export function createSecureJSONResponse(
  data: unknown,
  init?: ResponseInit,
  customHeaders?: Partial<SecurityHeadersConfig>
): NextResponse {
  const response = NextResponse.json(data, init);
  return applySecurityHeaders(response, customHeaders);
}

/**
 * Create a secure error response
 *
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param code - Error code
 * @param details - Additional error details
 * @returns NextResponse with error and security headers
 */
export function createSecureErrorResponse(
  message: string,
  statusCode: number = 500,
  code: string = 'ERROR',
  details?: Record<string, unknown>
): NextResponse {
  return createSecureJSONResponse(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Content-Security-Policy builder
 * Helps construct CSP header
 */
export class CSPBuilder {
  private directives: Record<string, string[]> = {};

  /**
   * Add default-src directive
   */
  defaultSrc(...sources: string[]): this {
    this.directives['default-src'] = sources;
    return this;
  }

  /**
   * Add script-src directive
   */
  scriptSrc(...sources: string[]): this {
    this.directives['script-src'] = sources;
    return this;
  }

  /**
   * Add style-src directive
   */
  styleSrc(...sources: string[]): this {
    this.directives['style-src'] = sources;
    return this;
  }

  /**
   * Add img-src directive
   */
  imgSrc(...sources: string[]): this {
    this.directives['img-src'] = sources;
    return this;
  }

  /**
   * Add connect-src directive
   */
  connectSrc(...sources: string[]): this {
    this.directives['connect-src'] = sources;
    return this;
  }

  /**
   * Add font-src directive
   */
  fontSrc(...sources: string[]): this {
    this.directives['font-src'] = sources;
    return this;
  }

  /**
   * Add object-src directive
   */
  objectSrc(...sources: string[]): this {
    this.directives['object-src'] = sources;
    return this;
  }

  /**
   * Add media-src directive
   */
  mediaSrc(...sources: string[]): this {
    this.directives['media-src'] = sources;
    return this;
  }

  /**
   * Add frame-src directive
   */
  frameSrc(...sources: string[]): this {
    this.directives['frame-src'] = sources;
    return this;
  }

  /**
   * Add frame-ancestors directive
   */
  frameAncestors(...sources: string[]): this {
    this.directives['frame-ancestors'] = sources;
    return this;
  }

  /**
   * Add base-uri directive
   */
  baseUri(...sources: string[]): this {
    this.directives['base-uri'] = sources;
    return this;
  }

  /**
   * Add form-action directive
   */
  formAction(...sources: string[]): this {
    this.directives['form-action'] = sources;
    return this;
  }

  /**
   * Build CSP header string
   */
  build(): string {
    const parts: string[] = [];

    for (const [directive, sources] of Object.entries(this.directives)) {
      parts.push(`${directive} ${sources.join(' ')}`);
    }

    return parts.join('; ');
  }

  /**
   * Get as SecurityHeadersConfig
   */
  toConfig(): SecurityHeadersConfig {
    return {
      contentSecurityPolicy: this.build(),
    };
  }
}

/**
 * Pre-configured CSP policies
 */
export const CSPolicies = {
  /**
   * Strict CSP for API endpoints (no scripts/styles)
   */
  apiOnly: new CSPBuilder()
    .defaultSrc("'none'")
    .connectSrc("'self'")
    .build(),

  /**
   * Moderate CSP for web UI
   */
  webUI: new CSPBuilder()
    .defaultSrc("'self'")
    .scriptSrc("'self'", "'unsafe-inline'", "'unsafe-eval'")
    .styleSrc("'self'", "'unsafe-inline'")
    .imgSrc("'self'", 'data:', 'https:')
    .connectSrc("'self'")
    .fontSrc("'self'")
    .objectSrc("'none'")
    .baseUri("'self'")
    .formAction("'self'")
    .frameAncestors("'none'")
    .build(),

  /**
   * Development CSP (relaxed)
   */
  development: new CSPBuilder()
    .defaultSrc("'self'")
    .scriptSrc("'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*')
    .styleSrc("'self'", "'unsafe-inline'")
    .imgSrc("'self'", 'data:', 'https:', 'http:')
    .connectSrc("'self'", 'localhost:*', 'ws://localhost:*')
    .build(),
};

/**
 * Apply rate limit headers to response
 *
 * @param response - NextResponse object
 * @param limit - Rate limit
 * @param remaining - Remaining requests
 * @param reset - Reset timestamp
 * @returns Response with rate limit headers
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}

/**
 * Get all security headers as an object
 * Useful for documentation or testing
 *
 * @returns All security headers
 */
export function getAllSecurityHeaders(): Record<string, string> {
  return {
    ...getSecurityHeaders(),
    ...(process.env.NODE_ENV === 'production' && {
      'Content-Security-Policy': CSPolicies.webUI,
    }),
  };
}
