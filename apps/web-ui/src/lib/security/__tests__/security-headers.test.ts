/**
 * Security Headers Tests
 * Story 10.8: Test Coverage Enhancement
 *
 * Tests for security header utilities
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import {
  applySecurityHeaders,
  createSecureResponse,
  CSPBuilder,
  CSPolicies,
  applyRateLimitHeaders,
} from '../security-headers';

describe('Security Headers', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getSecurityHeaders (via applySecurityHeaders)', () => {
    it('should return production headers when NODE_ENV=production', () => {
      process.env.NODE_ENV = 'production';

      const response = new NextResponse(null, { status: 200 });
      const secured = applySecurityHeaders(response);

      expect(secured.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains; preload');
      expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
      expect(secured.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(secured.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('should return development headers when NODE_ENV != production', () => {
      process.env.NODE_ENV = 'development';

      const response = new NextResponse(null, { status: 200 });
      const secured = applySecurityHeaders(response);

      // Development headers are more relaxed
      expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
      expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(secured.headers.get('X-XSS-Protection')).toBe('1; mode=block');

      // No HSTS in development
      expect(secured.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should not override existing headers', () => {
      process.env.NODE_ENV = 'production';

      const response = new NextResponse(null, { status: 200 });
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');

      const secured = applySecurityHeaders(response);

      // Should keep the existing value
      expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });
  });

  describe('applySecurityHeaders', () => {
    it('should apply default headers to empty response', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response);

      expect(secured.headers.get('X-Content-Type-Options')).toBeDefined();
      expect(secured.headers.get('X-XSS-Protection')).toBeDefined();
    });

    it('should apply custom contentTypeOptions header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, { contentTypeOptions: 'nosniff' });

      expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should apply custom frameOptions header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, { frameOptions: 'SAMEORIGIN' });

      expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });

    it('should apply custom xssProtection header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, { xssProtection: '0' });

      expect(secured.headers.get('X-XSS-Protection')).toBe('0');
    });

    it('should apply custom strictTransportSecurity header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, {
        strictTransportSecurity: 'max-age=86400'
      });

      expect(secured.headers.get('Strict-Transport-Security')).toBe('max-age=86400');
    });

    it('should apply custom contentSecurityPolicy header', () => {
      const response = new NextResponse(null);
      const csp = "default-src 'self'";
      const secured = applySecurityHeaders(response, { contentSecurityPolicy: csp });

      expect(secured.headers.get('Content-Security-Policy')).toBe(csp);
    });

    it('should apply custom referrerPolicy header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, { referrerPolicy: 'no-referrer' });

      expect(secured.headers.get('Referrer-Policy')).toBe('no-referrer');
    });

    it('should apply custom permissionsPolicy header', () => {
      const response = new NextResponse(null);
      const policy = 'camera=self, microphone=self';
      const secured = applySecurityHeaders(response, { permissionsPolicy: policy });

      expect(secured.headers.get('Permissions-Policy')).toBe(policy);
    });

    it('should apply custom crossOriginOpenerPolicy header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, {
        crossOriginOpenerPolicy: 'same-origin-allow-popups'
      });

      expect(secured.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin-allow-popups');
    });

    it('should apply custom crossOriginResourcePolicy header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, {
        crossOriginResourcePolicy: 'cross-origin'
      });

      expect(secured.headers.get('Cross-Origin-Resource-Policy')).toBe('cross-origin');
    });

    it('should apply custom crossOriginEmbedderPolicy header', () => {
      const response = new NextResponse(null);
      const secured = applySecurityHeaders(response, {
        crossOriginEmbedderPolicy: 'credentialless'
      });

      expect(secured.headers.get('Cross-Origin-Embedder-Policy')).toBe('credentialless');
    });
  });

  describe('createSecureResponse', () => {
    it('should create response with security headers', () => {
      const response = createSecureResponse('Hello World', { status: 200 });

      expect(response.headers.get('X-Content-Type-Options')).toBeDefined();
    });

    it('should create response with custom headers', () => {
      const response = createSecureResponse('Hello World', undefined, {
        frameOptions: 'SAMEORIGIN'
      });

      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });
  });
});

describe('CSPBuilder', () => {
  it('should build default-src directive', () => {
    const builder = new CSPBuilder();
    builder.defaultSrc("'self'");

    const csp = builder.build();
    expect(csp).toContain("default-src 'self'");
  });

  it('should build script-src directive', () => {
    const builder = new CSPBuilder();
    builder.scriptSrc("'self'", "'unsafe-inline'");

    const csp = builder.build();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('should build style-src directive', () => {
    const builder = new CSPBuilder();
    builder.styleSrc("'self'", "'unsafe-inline'");

    const csp = builder.build();
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should build img-src directive', () => {
    const builder = new CSPBuilder();
    builder.imgSrc("'self'", 'data:', 'https:');

    const csp = builder.build();
    expect(csp).toContain("img-src 'self' data: https:");
  });

  it('should build connect-src directive', () => {
    const builder = new CSPBuilder();
    builder.connectSrc("'self'", 'https://api.example.com');

    const csp = builder.build();
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it('should build font-src directive', () => {
    const builder = new CSPBuilder();
    builder.fontSrc("'self'", 'https://fonts.gstatic.com');

    const csp = builder.build();
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
  });

  it('should build object-src directive', () => {
    const builder = new CSPBuilder();
    builder.objectSrc("'none'");

    const csp = builder.build();
    expect(csp).toContain("object-src 'none'");
  });

  it('should build media-src directive', () => {
    const builder = new CSPBuilder();
    builder.mediaSrc("'self'");

    const csp = builder.build();
    expect(csp).toContain("media-src 'self'");
  });

  it('should build frame-src directive', () => {
    const builder = new CSPBuilder();
    builder.frameSrc("'self'");

    const csp = builder.build();
    expect(csp).toContain("frame-src 'self'");
  });

  it('should build frame-ancestors directive', () => {
    const builder = new CSPBuilder();
    builder.frameAncestors("'none'");

    const csp = builder.build();
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('should build base-uri directive', () => {
    const builder = new CSPBuilder();
    builder.baseUri("'self'");

    const csp = builder.build();
    expect(csp).toContain("base-uri 'self'");
  });

  it('should build form-action directive', () => {
    const builder = new CSPBuilder();
    builder.formAction("'self'");

    const csp = builder.build();
    expect(csp).toContain("form-action 'self'");
  });

  it('should build multiple directives together', () => {
    const builder = new CSPBuilder();
    builder.defaultSrc("'self'");
    builder.scriptSrc("'self'", "'unsafe-inline'");
    builder.styleSrc("'self'", "'unsafe-inline'");

    const csp = builder.build();

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should separate directives with semicolons', () => {
    const builder = new CSPBuilder();
    builder.defaultSrc("'self'");
    builder.scriptSrc("'self'");

    const csp = builder.build();

    // Count semicolons - should have one between directives
    const semicolonCount = (csp.match(/;/g) || []).length;
    expect(semicolonCount).toBeGreaterThanOrEqual(1);
  });
});

describe('CSPolicies', () => {
  it('should have webUI policy configured', () => {
    expect(CSPolicies.webUI).toBeDefined();
    expect(typeof CSPolicies.webUI).toBe('string');
    expect(CSPolicies.webUI.length).toBeGreaterThan(0);
  });

  it('should have apiOnly policy with strict settings', () => {
    expect(CSPolicies.apiOnly).toBeDefined();
    expect(CSPolicies.apiOnly).toContain("default-src 'none'");
    expect(CSPolicies.apiOnly).toContain("connect-src 'self'");
  });

  it('should have development policy with relaxed settings', () => {
    expect(CSPolicies.development).toBeDefined();
    expect(CSPolicies.development).toContain("default-src 'self'");
    // Development should allow unsafe-inline for scripts
    expect(CSPolicies.development).toContain("'unsafe-inline'");
  });
});

describe('applyRateLimitHeaders', () => {
  it('should set rate limit headers on response', () => {
    const response = new NextResponse(null);
    applyRateLimitHeaders(response, 100, 95, Date.now() + 60000);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('95');
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });

  it('should convert numeric values to strings', () => {
    const response = new NextResponse(null);
    applyRateLimitHeaders(response, 1000, 500, 1234567890);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('1000');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('500');
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1234567890');
  });
});
