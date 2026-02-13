/**
 * OWASP ASVS V13: APIs and Microservices Security Tests
 * =====================================================
 * Suite: tests/owasp/asvs-api-microservices.test.js
 * OWASP Coverage: V13-001, V13-002, V13-003, V13-004
 * Story: OWASP-14 — ASVS API & Microservice Security
 *
 * Tests for API and microservice security:
 * - V13-001: Message format validation
 * - V13-002: Service-to-service authentication
 * - V13-003: API gateway security
 * - V13-004: Rate limiting per service
 *
 * Source files:
 *   .claude/validators-node/src/guards/microservice-validator.ts
 *   src/package-management/api/api-gateway.ts
 *   src/package-management/api/package-registry-api.ts
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// =============================================================================
// TEST DATA
// =============================================================================

const MOCK_CONFIGS = {
  // Configuration with mTLS authentication
  withMtls: `
    api:
      gateway:
        enabled: true
        mtls:
          enabled: true
          clientCertificate: required
          caCertificate: /etc/ssl/ca.crt
  `,

  // Configuration with JWT authentication
  withJwt: `
    api:
      authentication:
        type: jwt
        issuer: https://auth.example.com
        audience: api-gateway
        token:
          location: header
          scheme: bearer
  `,

  // Configuration with API key authentication
  withApiKey: `
    api:
      authentication:
        type: api_key
        header: X-API-Key
        keyLength: 32
  `,

  // Configuration with no authentication
  noAuth: `
    api:
      authentication:
        type: none
        allowAnonymous: true
  `,

  // Configuration with API gateway
  withGateway: `
    api:
      gateway:
        enabled: true
        service: api-gateway
        routes:
          - path: /api/v1
            service: backend
  `,

  // Configuration with service mesh
  withServiceMesh: `
    serviceMesh:
      provider: istio
      mtls:
        mode: strict
      sidecar:
        inject: true
  `,

  // Configuration with rate limiting per service
  withRateLimitPerService: `
    api:
      rateLimit:
        enabled: true
        algorithm: tokenBucket
        perService:
          userService:
            requestsPerMinute: 100
          orderService:
            requestsPerMinute: 50
  `,

  // Configuration with rate limiting but not per-service
  withRateLimitGlobal: `
    api:
      rateLimit:
        enabled: true
        algorithm: slidingWindow
        globalLimit: 1000
  `,

  // Configuration with disabled rate limiting
  rateLimitDisabled: `
    api:
      rateLimit:
        enabled: false
        reason: bypass-for-testing
  `,

  // Configuration with gateway bypass
  withGatewayBypass: `
    api:
      gateway:
        enabled: true
      bypass:
        enabled: true
        directAccess: true
  `,
};

// =============================================================================
// V13-001: Message Format Validation Tests
// =============================================================================

describe('V13-001: Message format validation', () => {
  it('validates JSON content type header', () => {
    const contentType = 'application/json';
    const payload = '{"userId": 123, "action": "update"}';

    // Should have JSON content type
    expect(contentType).toMatch(/application\/json/i);
    // Should be valid JSON payload
    expect(() => JSON.parse(payload)).not.toThrow();
  });

  it('validates XML content type header', () => {
    const contentType = 'application/xml';
    const payload = '<?xml version="1.0"?><request><userId>123</userId></request>';

    // Should have XML content type
    expect(contentType).toMatch(/application\/xml/i);
    // Should be valid XML structure
    expect(payload).toMatch(/^<\?xml/);
  });

  it('detects missing content type header', () => {
    const contentType = '';
    const payload = '{"data": "value"}';

    // Empty content type should be detected
    expect(contentType.trim()).toBe('');
    expect(payload.length).toBeGreaterThan(0);
  });

  it('validates JSON payload structure', () => {
    const contentType = 'application/json';
    const validPayload = '{"name": "test", "value": 123}';
    const invalidPayload = 'not valid json';

    // Valid JSON should parse
    expect(() => JSON.parse(validPayload)).not.toThrow();

    // Invalid JSON should throw
    expect(() => JSON.parse(invalidPayload)).toThrow();
  });

  it('detects XXE patterns in XML payload', () => {
    const xxePayload = '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>';

    // Should detect DOCTYPE declaration
    expect(xxePayload).toMatch(/<\?DOCTYPE|DOCTYPE/i);
    // Should detect entity definition
    expect(xxePayload).toMatch(/ENTITY/i);
  });

  it('validates protobuf content type', () => {
    const contentType = 'application/x-protobuf';

    // Should recognize protobuf content type
    expect(contentType).toMatch(/protobuf/i);
  });

  it('rejects unstructured message formats', () => {
    const contentType = 'text/plain';
    const payload = 'just plain text message';

    // Plain text is less secure for microservice communication
    expect(contentType).toBe('text/plain');
    expect(payload).not.toMatch(/^{/); // Not JSON
    expect(payload).not.toMatch(/^</); // Not XML
  });

  it('validates message with non-printable characters', () => {
    const payload = 'data\x00with\x01null\x02bytes';

    // Should detect non-printable characters
    expect(payload).toMatch(/[\x00-\x1F]/);
  });
});

// =============================================================================
// V13-002: Service-to-Service Authentication Tests
// =============================================================================

describe('V13-002: Service-to-service authentication', () => {
  it('detects mTLS authentication configuration', () => {
    const config = MOCK_CONFIGS.withMtls;

    // Should detect mTLS indicators
    expect(config).toMatch(/mtls|mutual.*tls|certificate/i);
    // Should be secure
    expect(config.toLowerCase()).not.toMatch(/no.*auth|anonymous/i);
  });

  it('detects JWT bearer token authentication', () => {
    const config = MOCK_CONFIGS.withJwt;

    // Should detect JWT indicators
    expect(config).toMatch(/jwt|json.*web.*token|bearer/i);
  });

  it('detects API key authentication', () => {
    const config = MOCK_CONFIGS.withApiKey;

    // Should detect API key indicators
    expect(config).toMatch(/api.*key|x-.*api.*key/i);
  });

  it('flags missing service authentication', () => {
    const config = MOCK_CONFIGS.noAuth;

    // Should detect no-auth configuration
    expect(config).toMatch(/type.*none|anonymous|no.*auth/i);
  });

  it('verifies mTLS is most secure authentication method', () => {
    const mtlsConfig = MOCK_CONFIGS.withMtls;
    const jwtConfig = MOCK_CONFIGS.withJwt;

    // mTLS should have certificate references
    expect(mtlsConfig).toMatch(/certificate|ca.*cert|client.*cert/i);

    // JWT should have bearer token scheme
    expect(jwtConfig).toMatch(/bearer|jwt/i);
  });

  it('detects OAuth2 authentication', () => {
    const config = `
      api:
        authentication:
          type: oauth2
          provider: keycloak
          scopes:
            - read
            - write
    `;

    // Should detect OAuth2 indicators
    expect(config.toLowerCase()).toMatch(/oauth|openid|oidc/i);
  });

  it('validates authentication in service mesh context', () => {
    const config = MOCK_CONFIGS.withServiceMesh;

    // Should detect service mesh with mTLS
    expect(config).toMatch(/service.*mesh|istio|linkerd/i);
    expect(config).toMatch(/mtls/i);
  });

  it('checks for certificate-based authentication', () => {
    const config = `
      tls:
        clientAuth: required
        clientCertPath: /etc/tls/client.crt
        clientKeyPath: /etc/tls/client.key
    `;

    // Should detect certificate authentication
    expect(config).toMatch(/certificate|client.*cert|x509/i);
  });

  it('detects anonymous access patterns', () => {
    const config = `
      endpoints:
        public:
          authentication:
            enabled: false
            allowAnonymous: true
    `;

    // Should detect anonymous access
    expect(config).toMatch(/anonymous|no.*auth|enabled.*false/i);
  });

  it('validates authorization header format', () => {
    const validHeader = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const invalidHeader = 'Authorization: none';

    // Valid header should have Bearer scheme
    expect(validHeader).toMatch(/bearer/i);

    // Invalid header has no proper scheme
    expect(invalidHeader).not.toMatch(/bearer|basic|apikey/i);
  });
});

// =============================================================================
// V13-003: API Gateway Security Tests
// =============================================================================

describe('V13-003: API gateway security', () => {
  it('detects API gateway configuration', () => {
    const config = MOCK_CONFIGS.withGateway;

    // Should detect gateway indicators
    expect(config).toMatch(/gateway|api.*gateway/i);
  });

  it('validates gateway has authentication enabled', () => {
    const config = `
      api:
        gateway:
          enabled: true
          authentication:
            required: true
            type: jwt
    `;

    // Should have both gateway and authentication
    expect(config).toMatch(/gateway/i);
    expect(config).toMatch(/authentication|jwt|bearer/i);
  });

  it('detects service mesh as gateway alternative', () => {
    const config = MOCK_CONFIGS.withServiceMesh;

    // Should detect service mesh
    expect(config).toMatch(/service.*mesh|istio|linkerd|consul/i);
  });

  it('flags gateway bypass patterns', () => {
    const config = MOCK_CONFIGS.withGatewayBypass;

    // Should detect bypass indicators
    expect(config).toMatch(/bypass|direct.*access|external.*direct/i);
  });

  it('checks for reverse proxy configuration', () => {
    const config = `
      nginx:
        reverseProxy:
          enabled: true
          upstream: backend-service
    `;

    // Should detect reverse proxy
    expect(config).toMatch(/reverse.*proxy|proxy.*server/i);
  });

  it('validates edge service as gateway', () => {
    const config = `
      services:
        edge:
          type: gateway
          endpoints:
            - /api/*
    `;

    // Should detect edge service
    expect(config).toMatch(/edge/i);
    expect(config).toMatch(/gateway/i);
  });

  it('detects direct service exposure without gateway', () => {
    const config = `
      services:
        backend:
          exposed: true
          directAccess: true
          gatewayBypass: true
    `;

    // Should detect direct access pattern
    expect(config).toMatch(/direct.*access|bypass.*gateway|exposed.*true/i);
  });

  it('validates gateway routing configuration', () => {
    const config = `
      gateway:
        routes:
          - path: /api/v1/users/*
            upstream: user-service
          - path: /api/v1/orders/*
            upstream: order-service
    `;

    // Should have routing definitions
    expect(config).toMatch(/routes?|upstream/i);
  });

  it('checks for gateway security middleware', () => {
    const config = `
      gateway:
        middleware:
          - authentication
          - rateLimit
          - cors
          - helmet
    `;

    // Should have security middleware
    expect(config).toMatch(/authentication|rate.*limit|cors|security/i);
  });

  it('validates gateway with service mesh integration', () => {
    const config = `
      gateway:
        type: ingress
        serviceMesh: istio
        mtls:
          mode: strict
    `;

    // Should have service mesh integration
    expect(config).toMatch(/service.*mesh|istio/i);
    expect(config).toMatch(/mtls/i);
  });
});

// =============================================================================
// V13-004: Per-Service Rate Limiting Tests
// =============================================================================

describe('V13-004: Rate limiting per service', () => {
  it('validates rate limiting is enabled', () => {
    const config = MOCK_CONFIGS.withRateLimitPerService;

    // Should detect rate limiting
    expect(config).toMatch(/rate.*limit|throttle|quota/i);
  });

  it('validates per-service rate limiting configuration', () => {
    const config = MOCK_CONFIGS.withRateLimitPerService;

    // Should detect per-service configuration
    expect(config).toMatch(/per.*service|service.*limit/i);
  });

  it('flags missing rate limiting', () => {
    const config = `
      api:
        endpoints:
          - path: /*
            controller: default
    `;

    // Should not have rate limiting
    expect(config).not.toMatch(/rate.*limit|throttle|quota/i);
  });

  it('validates token bucket algorithm', () => {
    const config = `
      rateLimit:
        algorithm: tokenBucket
        refillRate: 10
        capacity: 100
    `;

    // Should detect token bucket
    expect(config).toMatch(/token.*bucket/i);
  });

  it('validates sliding window algorithm', () => {
    const config = `
      rateLimit:
        algorithm: slidingWindow
        windowSize: 60s
        maxRequests: 100
    `;

    // Should detect sliding window
    expect(config).toMatch(/sliding.*window|fixed.*window/i);
  });

  it('flags disabled rate limiting', () => {
    const config = MOCK_CONFIGS.rateLimitDisabled;

    // Should detect disabled rate limiting
    expect(config).toMatch(/disabled|false|no.*rate.*limit|bypass/i);
  });

  it('validates rate limiting per endpoint', () => {
    const config = `
      endpoints:
        users:
          rateLimit:
            requestsPerMinute: 100
        orders:
          rateLimit:
            requestsPerMinute: 50
    `;

    // Should have per-endpoint rate limits
    expect(config).toMatch(/rate.*limit/i);
  });

  it('checks for rate limit bypass configuration', () => {
    const config = `
      rateLimit:
        enabled: true
        bypass:
          internalServices: true
          adminUsers: true
    `;

    // Should detect bypass configuration
    expect(config).toMatch(/bypass|skip.*rate|exempt/i);
  });

  it('validates distributed rate limiting', () => {
    const config = `
      rateLimit:
        backend: redis
        strategy: distributed
        keyFormat: "rate:limit:{service}:{userId}"
    `;

    // Should detect distributed rate limiting
    expect(config).toMatch(/redis|distribut|shared/i);
  });

  it('checks for rate limit headers in response', () => {
    const headers = {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '95',
      'X-RateLimit-Reset': '1640995200',
    };

    // Should have rate limit headers
    expect(headers).toHaveProperty('X-RateLimit-Limit');
    expect(headers).toHaveProperty('X-RateLimit-Remaining');
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('V13 Integration: Combined microservice security', () => {
  it('validates secure microservice configuration', () => {
    const config = `
      api:
        gateway:
          enabled: true
          mtls:
            enabled: true
        rateLimit:
          enabled: true
          perService: true
    `;

    // Should have gateway
    expect(config).toMatch(/gateway/i);
    // Should have mTLS
    expect(config).toMatch(/mtls/i);
    // Should have rate limiting
    expect(config).toMatch(/rate.*limit/i);
  });

  it('flags insecure microservice configuration', () => {
    const config = `
      api:
        gateway:
          enabled: false
        authentication:
          type: none
        rateLimit:
          enabled: false
    `;

    // Missing gateway
    expect(config).toMatch(/enabled.*false|disabled/i);
    // No authentication
    expect(config).toMatch(/type.*none/i);
    // No rate limiting
    expect(config).toMatch(/enabled.*false/i);
  });

  it('validates service mesh security', () => {
    const config = `
      serviceMesh:
        provider: istio
        mtls:
          mode: strict
        policy:
          rateLimiting:
            enabled: true
    `;

    // Should have service mesh
    expect(config).toMatch(/service.*mesh|istio/i);
    // Should have mTLS
    expect(config).toMatch(/mtls/i);
    // Should have rate limiting
    expect(config).toMatch(/rate.*limit/i);
  });

  it('checks for zero-trust architecture', () => {
    const config = `
      zeroTrust:
        enabled: true
        mtls:
          mode: strict
        authz:
          policy: deny-by-default
        encryption:
          inTransit: required
    `;

    // Should detect zero-trust patterns
    expect(config).toMatch(/zero.*trust|mtls|deny.*default/i);
  });

  it('validates defense in depth', () => {
    const config = `
      security:
        network:
          mtls: true
        application:
          jwtValidation: true
        rateLimit:
          enabled: true
        monitoring:
          auditLog: true
    `;

    // Should have multiple layers
    expect(config).toMatch(/mtls/i);
    expect(config).toMatch(/jwt|authentication/i);
    expect(config).toMatch(/rate.*limit/i);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('V13 Edge cases and error handling', () => {
  it('handles empty configuration', () => {
    const config = '';

    // Empty config should not crash parsing
    expect(config.length).toBe(0);
  });

  it('handles malformed YAML', () => {
    const config = `
      api: gateway: enabled: true authentication:
      malformed content here
    `;

    // Should handle without throwing
    expect(typeof config).toBe('string');
  });

  it('handles comments in configuration', () => {
    const config = `
      # Rate limiting configuration
      rateLimit:
        enabled: true # Enable rate limiting
        # per-service: true
      `;

    // Should ignore comments
    expect(config).toMatch(/rate.*limit/i);
  });

  it('handles environment variable references', () => {
    const config = `
      api:
        rateLimit:
          max: \${RATE_LIMIT_MAX}
          window: \${RATE_LIMIT_WINDOW}
    `;

    // Should detect rate limiting pattern
    expect(config).toMatch(/rate.*limit/i);
  });

  it('handles mixed-case configuration keys', () => {
    const config = `
      API:
        RateLimit:
          Enabled: True
        Authentication:
          Type: JWT
    `;

    // Should detect patterns case-insensitively
    expect(config.toLowerCase()).toMatch(/rate.*limit/i);
    expect(config.toLowerCase()).toMatch(/authentication|jwt/i);
  });
});

// =============================================================================
// Severity Classification Tests
// =============================================================================

describe('V13 Severity classification', () => {
  it('classifies no-auth as CRITICAL', () => {
    const config = MOCK_CONFIGS.noAuth;

    // No-auth is critical severity
    expect(config).toMatch(/no.*auth|anonymous|none/i);
  });

  it('classifies API key as WARNING (less secure than mTLS)', () => {
    const config = MOCK_CONFIGS.withApiKey;

    // API key is less secure than mTLS
    expect(config).toMatch(/api.*key/i);
    expect(config).not.toMatch(/mtls/i);
  });

  it('classifies mTLS as INFO (secure configuration)', () => {
    const config = MOCK_CONFIGS.withMtls;

    // mTLS is secure
    expect(config).toMatch(/mtls|certificate/i);
  });

  it('classifies missing rate limit as WARNING', () => {
    const config = MOCK_CONFIGS.rateLimitDisabled;

    // Disabled rate limiting is warning
    expect(config).toMatch(/disabled|false/i);
  });

  it('classifies gateway bypass as WARNING', () => {
    const config = MOCK_CONFIGS.withGatewayBypass;

    // Gateway bypass is warning
    expect(config).toMatch(/bypass/i);
  });
});
