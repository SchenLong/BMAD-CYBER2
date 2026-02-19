# Story 8.3: API Authentication

**Status:** done
**Epic:** Epic 8 - API & Developer Experience
**Story ID:** 8.3
**Story Key:** 8-3-api-authentication
**Dependencies:** 1.1, 1.2, 1.5, 8.1, 8.2

---

## Story

**As a** Developer,
**I want** to authenticate API requests using Bearer tokens,
**So that** my API client can access protected endpoints.

---

## Acceptance Criteria

**Given** an API request with Authorization header
**When** the request reaches a protected endpoint
**Then** validate Bearer token against stored API keys
**And** extract user and role from token
**And** enforce rate limits specific to API role (stricter than user)
**And** return 401 for invalid tokens, 403 for insufficient permissions
**And** include API usage in audit logs

---

## Tasks / Subtasks

- [x] **Task 1: API Authentication Middleware** (AC: Given - API request)
  - [x] Create authentication middleware for API routes
  - [x] Extract Authorization header from request
  - [x] Validate Bearer token format
  - [x] Support both session JWT and API key JWT
  - [x] Attach user context to request object

- [x] **Task 2: API Key Token Validation** (AC: Then - validate Bearer token)
  - [x] Implement JWT verification for API key tokens
  - [x] Extract key_id from JWT claims
  - [x] Query api_keys table to verify key exists and is_active
  - [x] Check expiration date if set
  - [x] Update last_used_at and usage_count on successful auth

- [x] **Task 3: User and Role Extraction** (AC: And - extract user and role)
  - [x] Extract user_id from JWT sub claim
  - [x] Extract role from JWT role claim
  - [x] Extract scopes from JWT scope claim
  - [x] Load user permissions based on role
  - [x] Attach full user context to request

- [x] **Task 4: Rate Limiting for API Keys** (AC: And - rate limits specific to API role)
  - [x] Implement separate rate limiter for API vs session auth
  - [x] Configure stricter limits for API requests
  - [x] Implement sliding window rate limiting
  - [x] Return rate limit headers in response
  - [x] Allow rate limit bypass for enterprise roles

- [x] **Task 5: Error Responses** (AC: And - 401/403 responses)
  - [x] Return 401 for missing/invalid tokens
  - [x] Return 401 for expired/revoked API keys
  - [x] Return 403 for insufficient permissions
  - [x] Return 403 for scope violations
  - [x] Include error code and human-readable message

- [x] **Task 6: Audit Logging** (AC: And - include API usage in audit logs)
  - [x] Log all authenticated API requests
  - [x] Include request ID, user ID, API key ID
  - [x] Log endpoint, method, timestamp
  - [x] Track response status and duration
  - [x] Log authentication failures separately

- [x] **Task 7: Token Generation** (AC: supporting)
  - [x] Create JWT signing for API key authentication
  - [x] Include standard claims: sub, iat, exp, type
  - [x] Include API-specific claims: key_id, role, scopes
  - [x] Use appropriate token expiration (1 hour default)
  - [x] Implement token refresh mechanism

- [x] **Task 8: Testing and Documentation** (AC: all)
  - [x] Write unit tests for auth middleware
  - [x] Test rate limiting behavior
  - [x] Test error response formats
  - [x] Document authentication flow
  - [x] Provide example requests with auth headers

---

## Dev Notes

### Architecture Patterns & Constraints

**Authentication Flow:**
```
1. Client sends request with Authorization: Bearer <token> or x-api-key header
2. Middleware extracts and validates JWT or API key
3. If API key: verify key exists, is active, not expired
4. Extract user context and permissions
5. Check rate limits
6. Attach user context to request
7. Proceed to route handler or return error
```

**Token Types:**
- **Session JWT**: Issued after web login, longer expiration, browser context
- **API Key JWT**: Issued from API key, shorter expiration, programmatic context
- Both use same signing key and validation logic
- Distinguished by `type` claim: "session" or "api_key"

### File Structure Requirements

**Middleware:**
```
src/lib/auth/
├── api-auth-middleware.ts      # API authentication middleware
├── api-rate-limit.ts            # Rate limiting for API
└── api-audit-log.ts             # API usage logging
```

**Authentication Utilities:**
```
src/lib/auth/
├── jwt-service.ts              # JWT signing/verification
├── api-key-service.ts          # API key validation
├── permission-service.ts       # Role/permission checks
└── token-types.ts              # Token type definitions (re-exports)
```

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes List
- **Task 1**: Created `api-auth-middleware.ts` with `withApiAuth()` higher-order function for protecting API routes. Supports both session and API key tokens.
- **Task 2**: Created `api-key-service.ts` with `validateApiKey()` function that checks key existence, active status, expiration, and updates usage statistics.
- **Task 3**: Created `permission-service.ts` with role-based permission checking and scope validation. Includes `roleHasPermission()` and `scopeHasPermission()` functions.
- **Task 4**: Created `api-rate-limit.ts` with separate rate limiting for API vs session auth. Implements sliding window with stricter limits for API keys (60/min vs 100/min for session).
- **Task 5**: Error responses use existing `api-error` helpers from `lib/api/response.ts`. Returns appropriate 401/403/429 status codes with error details.
- **Task 6**: Created `api-audit-log.ts` with functions for logging authentication events, API requests, rate limit violations, and permission denied events.
- **Task 7**: Created `jwt-service.ts` with `createApiKeyToken()` and `createSessionApiToken()` functions. Uses HS256 algorithm with configurable expiration.
- **Task 8**: Created `api-auth.test.ts` with 30 tests covering all functionality. All tests passing. Created `docs/api-authentication.md` with comprehensive documentation.

### Code Review Findings & Fixes
**Review Date:** 2026-02-18

**Findings Fixed:**
1. ✅ **MEDIUM** - Removed duplicate TokenType enum from token-types.ts (now re-exports from jwt-service.ts)
2. ✅ **MEDIUM** - Added proper permission checking for session tokens (was incomplete "allow all")
3. ✅ **MEDIUM** - Added x-api-key header support to extractAuthToken function
4. ✅ **MEDIUM** - Added documentation note about rate limiting limitation for multi-instance deployments
5. ✅ **MEDIUM** - Added note about audit logging being console-only until Story 9.4

**Known Limitations (Deferred to Future Stories):**
- Token refresh endpoint implementation (framework exists, endpoint TBD)
- Redis-backed rate limiting for multi-instance deployments
- Database audit log persistence (Story 9.4)

### File List
- `team/bmad-web-ui/src/lib/auth/api-auth-middleware.ts`
- `team/bmad-web-ui/src/lib/auth/api-key-service.ts`
- `team/bmad-web-ui/src/lib/auth/api-rate-limit.ts`
- `team/bmad-web-ui/src/lib/auth/api-audit-log.ts`
- `team/bmad-web-ui/src/lib/auth/jwt-service.ts`
- `team/bmad-web-ui/src/lib/auth/permission-service.ts`
- `team/bmad-web-ui/src/lib/auth/token-types.ts`
- `team/bmad-web-ui/src/lib/auth/__tests__/api-auth.test.ts`
- `team/bmad-web-ui/docs/api-authentication.md`
- `team/bmad-web-ui/jest.config.json` (updated transformIgnorePatterns)

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Security architecture
- [Technical Implementation](../06-technical-implementation.md) - API architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 8: API & Developer Experience - [epics.md#epic-8](../epics.md#epic-8-api--developer-experience)
- Story 8.3 Details - [epics.md#story-83-api-authentication](../epics.md#story-83-api-authentication)
