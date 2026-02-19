# Story 9.5: Security Headers & CORS

**Status:** ready-for-dev
**Epic:** Epic 9 - Security Hardening
**Story ID:** 9.5
**Story Key:** 9-5-security-headers-cors
**Dependencies:** Story 1.1 (Project Scaffold)

---

## Story

**As a** Security Architect,
**I want** proper security headers and CORS configuration,
**So that** the application follows web security best practices.

---

## Acceptance Criteria

**Given** the Next.js application
**When** security middleware is configured
**Then** use Helmet.js to set: HSTS (Strict-Transport-Security), CSP (Content-Security-Policy), X-Frame-Options, X-Content-Type-Options
**And** configure CSP with report-only mode in development
**And** set CORS policy with strict origin whitelist (no wildcards)
**And** implement CSRF token protection for mutations
**And** set Referrer-Policy and Permissions-Policy headers

---

## Tasks / Subtasks

- [ ] **Task 1: Install Dependencies** (AC: Given - Next.js application, When - security middleware)
  - [ ] Install helmet package
  - [ ] Install @types/helmet if needed
  - [ ] Install csurf package for CSRF protection
  - [ ] Verify dependencies in package.json

- [ ] **Task 2: Create Security Middleware** (AC: Then - use Helmet.js to set headers)
  - [ ] Create `src/middleware/security-headers.ts`
  - [ ] Import helmet from 'helmet'
  - [ ] Configure HSTS header (max-age=31536000, includeSubDomains)
  - [ ] Configure X-Frame-Options (DENY or SAMEORIGIN)
  - [ ] Configure X-Content-Type-Options (nosniff)
  - [ ] Configure X-XSS-Protection (1; mode=block)
  - [ ] Apply helmet middleware to Next.js

- [ ] **Task 3: Implement Content Security Policy** (AC: Then - CSP with report-only in development)
  - [ ] Define CSP directives
  - [ ] Set default-src 'self'
  - [ ] Set script-src with 'self' and nonce
  - [ ] Set style-src with 'self' and unsafe-inline for shadcn
  - [ ] Set img-src with 'self' and data: for avatars
  - [ ] Set connect-src for API calls
  - [ ] Configure report-only mode for development
  - [ ] Configure enforce mode for production
  - [ ] Add CSP report-uri for violations

- [ ] **Task 4: Configure CORS Policy** (AC: And - strict origin whitelist)
  - [ ] Create `src/middleware/cors.ts`
  - [ ] Define allowed origins array (no wildcards)
  - [ ] Set origin validation function
  - [ ] Configure Access-Control-Allow-Origin header
  - [ ] Configure Access-Control-Allow-Methods
  - [ ] Configure Access-Control-Allow-Headers
  - [ ] Configure Access-Control-Max-Age
  - [ ] Add credentials support
  - [ ] Reject preflight requests from unauthorized origins

- [ ] **Task 5: Implement CSRF Protection** (AC: And - CSRF token for mutations)
  - [ ] Create CSRF token generation
  - [ ] Create CSRF token validation middleware
  - [ ] Add token to server action forms
  - [ ] Include token in API request headers
  - [ ] Configure cookie settings (SameSite=Strict, HttpOnly, Secure)
  - [ ] Implement token rotation

- [ ] **Task 6: Set Additional Security Headers** (AC: And - Referrer-Policy, Permissions-Policy)
  - [ ] Configure Referrer-Policy (strict-origin-when-cross-origin)
  - [ ] Configure Permissions-Policy
  - [ ] Set Permissions-Policy for geolocation=()
  - [ ] Set Permissions-Policy for microphone=()
  - [ ] Set Permissions-Policy for camera=()
  - [ ] Set Permissions-Policy for payment=()
  - [ ] Set Permissions-Policy for usb=()

- [ ] **Task 7: Configure Environment-Specific Settings** (AC: And - report-only in development)
  - [ ] Create configuration for development (report-only CSP)
  - [ ] Create configuration for production (enforce CSP)
  - [ ] Create configuration for testing
  - [ ] Use environment variable NODE_ENV for switching
  - [ ] Document CSP violation monitoring

- [ ] **Task 8: Update Root Middleware** (AC: All)
  - [ ] Update `src/middleware.ts`
  - [ ] Integrate security headers middleware
  - [ ] Integrate CORS middleware
  - [ ] Integrate CSRF middleware
  - [ ] Ensure proper middleware order

- [ ] **Task 9: Write Unit Tests** (AC: All)
  - [ ] Test HSTS header is set
  - [ ] Test CSP header is set correctly
  - [ ] Test X-Frame-Options is set
  - [ ] Test CORS allows valid origins
  - [ ] Test CORS rejects invalid origins
  - [ ] Test CSRF token generation
  - [ ] Test CSRF token validation
  - [ ] Test Referrer-Policy is set
  - [ ] Test Permissions-Policy is set

- [ ] **Task 10: Write Integration Tests** (AC: All)
  - [ ] Test security headers on API routes
  - [ ] Test CORS preflight requests
  - [ ] Test CSRF protection on mutations
  - [ ] Test CSP violation reports
  - [ ] Test environment-specific configurations

- [ ] **Task 11: Documentation & Verification** (AC: All)
  - [ ] Document all security headers
  - [ ] Document CORS allowed origins
  - [ ] Create CSP directive guide
  - [ ] Document CSRF token usage
  - [ ] Create security header checklist
  - [ ] Verify headers with security scanner (e.g., securityheaders.com)
  - [ ] Run test suite to verify 100% pass rate

---

## Dev Notes

### Architecture Patterns & Constraints

**Security Headers Configuration:**

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Enforce HTTPS |
| Content-Security-Policy | default-src 'self'; ... | Prevent XSS |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS filter (legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Restrict browser features |

**CORS Configuration:**
- No wildcards (*) in production
- Explicit origin whitelist
- Credentials support with specific origins
- Proper preflight handling

**CSP Strategy:**
- Development: Report-Only mode (learn what breaks)
- Production: Enforce mode (block violations)
- Monitor violations via report-uri

### File Structure Requirements

**Must-Create Files:**
1. `src/middleware/security-headers.ts` - Helmet configuration
2. `src/middleware/cors.ts` - CORS middleware
3. `src/middleware/csrf.ts` - CSRF protection
4. `src/middleware.ts` - Root middleware (update)
5. `tests/middleware/security-headers.test.ts` - Unit tests
6. `tests/middleware/cors.test.ts` - CORS tests
7. `tests/middleware/csrf.test.ts` - CSRF tests

**Configuration File:**
```
src/
├── config/
│   └── security-headers.ts      # Header configurations
└── middleware/
    ├── security-headers.ts
    ├── cors.ts
    └── csrf.ts
```

### Testing Requirements

**Security Header Tests:**
```typescript
// Test HSTS header
expect(headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains')

// Test CSP header
expect(headers.get('content-security-policy')).toContain('default-src')

// Test X-Frame-Options
expect(headers.get('x-frame-options')).toBe('DENY')
```

**CORS Tests:**
```typescript
// Test allowed origin
const response = await fetch(url, {
  headers: { Origin: 'https://allowed.example.com' }
})
expect(response.headers.get('access-control-allow-origin')).toBe('https://allowed.example.com')

// Test blocked origin
const response = await fetch(url, {
  headers: { Origin: 'https://malicious.com' }
})
expect(response.headers.get('access-control-allow-origin')).toBeNull()
```

**CSRF Tests:**
```typescript
// Test token generation
const token = await generateCsrfToken()
expect(token).toBeTruthy()
expect(token.length).toBeGreaterThan(20)

// Test token validation
const valid = await validateCsrfToken(token)
expect(valid).toBe(true)
```

### Security Considerations

**CSP Challenges:**
- shadcn/ui uses inline styles (needs unsafe-inline or nonce)
- Next.js dynamic imports may need strict-dynamic
- External scripts (if any) need explicit allowlist
- Images from data: URLs need img-src data:

**CORS Security:**
- Never use Access-Control-Allow-Origin: *
- Always validate origin against whitelist
- Use credentials: true only when needed
- Handle preflight requests properly

**CSRF Protection:**
- Use SameSite=Strict for cookies
- Implement token validation on mutations
- Consider double-submit cookie pattern
- Rotate tokens periodically

---

## Dev Agent Guardrails

### Technical Requirements

**Helmet Configuration:**
```typescript
import helmet from 'helmet'

export const securityHeaders = helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})
```

**CORS Configuration:**
```typescript
const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN_1,
  process.env.ALLOWED_ORIGIN_2,
].filter(Boolean) as string[]

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin')

  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': origin || ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  return new NextResponse(null, { status: 403 })
}
```

**CSRF Configuration:**
```typescript
import { generateRandom } from 'crypto'

export async function generateCsrfToken(): Promise<string> {
  return generateRandom(32, 'hex')
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const storedToken = await getCsrfToken()
  return storedToken === token
}
```

### Architecture Compliance

**Middleware Order:**
```typescript
// src/middleware.ts
export async function middleware(req: NextRequest) {
  // 1. Security headers (first)
  const securityResponse = await securityHeadersMiddleware(req)
  if (securityResponse) return securityResponse

  // 2. CORS
  const corsResponse = await corsMiddleware(req)
  if (corsResponse) return corsResponse

  // 3. CSRF (for mutations)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfResponse = await csrfMiddleware(req)
    if (csrfResponse) return csrfResponse
  }

  // 4. Continue to route handler
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Environment-Specific CSP:**
```typescript
const isDev = process.env.NODE_ENV === 'development'

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'strict-dynamic'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  // ... other directives
}

export const cspHeader = isDev
  ? `Content-Security-Policy-Report-Only: ${serializeCsp(cspDirectives)}`
  : `Content-Security-Policy: ${serializeCsp(cspDirectives)}`
```

### Library/Framework Requirements

**Dependencies:**
```json
{
  "dependencies": {
    "helmet": "^8.0.0",
    "cookie": "^0.6.0",
    "csrf": "^3.1.0"
  },
  "devDependencies": {
    "@types/cookie": "^0.6.0",
    "@types/csrf": "^3.1.0"
  }
}
```

**Permissions-Policy Directives:**
```typescript
const permissionsPolicy = [
  'geolocation=()',
  'microphone=()',
  'camera=()',
  'payment=()',
  'usb=()',
  'magnetometer=()',
  'gyroscope=()',
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=(self)',
  'encrypted-media=(self)',
  'fullscreen=(self)',
  'picture-in-picture=(self)',
].join(', ')
```

### File Structure Requirements

**Export Structure:**
```typescript
// src/middleware/security-headers.ts
export { securityHeaders } from './helmet-config'
export { applySecurityHeaders } from './apply-headers'

// src/middleware/cors.ts
export { corsMiddleware }
export { isOriginAllowed }

// src/middleware/csrf.ts
export { generateCsrfToken }
export { validateCsrfToken }
export { csrfMiddleware }
```

### Testing Requirements

**Test Structure:**
```typescript
describe('Security Headers', () => {
  describe('HSTS', () => {
    it('should set HSTS header')
    it('should include subdomains')
  })

  describe('CSP', () => {
    it('should set CSP header')
    it('should use report-only in dev')
    it('should use enforce in prod')
  })

  describe('CORS', () => {
    it('should allow whitelisted origins')
    it('should reject non-whitelisted origins')
    it('should handle preflight requests')
  })

  describe('CSRF', () => {
    it('should generate unique tokens')
    it('should validate valid tokens')
    it('should reject invalid tokens')
  })
})
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Security Hardening (Epic 9)

**Browser Features Used:**
- No geolocation needed
- No microphone/camera access
- JavaScript required (CSP script-src)
- Inline styles for shadcn (CSP style-src unsafe-inline)

**External Origins:**
- May need to allow API server origin
- May need to allow webhook origins
- Configure via environment variables

**Compliance Alignment:**
- OWASP A05: Security Misconfiguration
- OWASP Security Headers Verification
- SOC 2: Network security controls

---

## Story Completion Status

**Status:** ready-for-dev
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Security Deep Dive](../11-security-deep-dive.md) - Security implementation details
- [Architecture & Security](../02-architecture-security.md) - Security architecture overview
- [Epic 9 Details](../epics.md#story-95-security-headers-cors) - Story requirements

**Story Breakdown Reference:**
- Epic 9: Security Hardening - [epics.md#epic-9](../epics.md#epic-9-security-hardening)
- Story 9.5 Details - [epics.md#story-95-security-headers-cors](../epics.md#story-95-security-headers-cors)

**Depends On:**
- Story 1.1: Project Scaffold & Base Configuration

**Related Stories:**
- Story 9.4: Comprehensive Audit Logging (logs violations)
- Story 9.6: Input Validation Layer

---

## Dev Agent Record

### Agent Model Used
*To be filled by Dev agent during implementation*

### Debug Log References
*To be filled by Dev agent during implementation*

### Completion Notes List
*To be filled by Dev agent during implementation*

### File List
*To be filled by Dev agent during implementation*
