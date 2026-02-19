# Story 8.1: RESTful API Implementation

**Status:** in-progress
**Epic:** Epic 8 - API & Developer Experience
**Story ID:** 8.1
**Story Key:** 8-1-restful-api-implementation
**Dependencies:** 1.1, 1.2, 1.5, 6.2

---

## Story

**As a** Developer,
**I want** a complete REST API for all BMAD operations,
**So that** I can integrate BMAD into my automation workflows.

---

## Acceptance Criteria

**Given** the API route structure
**When** implementing endpoints
**Then** provide: GET /api/health (public), POST /api/auth/login (public), GET/POST /api/projects (protected)
**And** provide agent endpoints: GET /api/agents, GET /api/agents/:id, POST /api/agents/:id/invoke
**And** provide workflow endpoints: GET /api/workflows, POST /api/workflows/:id/execute
**And** provide project endpoints: CRUD on /api/projects, artifact management
**And** provide template endpoints: GET /api/templates, POST /api/custom-templates (enterprise)
**And** all endpoints return JSON with consistent response structure

---

## Tasks / Subtasks

- [x] **Task 1: Create API Base Infrastructure** (AC: Given - API route structure)
  - [x] Create `/api` route directory in Next.js app structure
  - [x] Set up API response wrapper with consistent structure
  - [x] Create API error handling middleware
  - [ ] Implement CORS configuration for API routes
  - [x] Set up API versioning structure (/api/v1/)

- [ ] **Task 2: Public Endpoints** (AC: Then - public endpoints)
  - [x] Implement GET /api/v1/health - health check endpoint
  - [ ] Implement POST /api/auth/login - authentication endpoint
  - [ ] Add public API documentation endpoint
  - [ ] Test public endpoints without authentication

- [x] **Task 3: Agent Endpoints** (AC: And - agent endpoints)
  - [x] Implement GET /api/v1/agents - list all available agents
  - [x] Implement GET /api/v1/agents/:id - get agent details
  - [x] Implement POST /api/v1/agents/:id/invoke - invoke agent with input
  - [ ] Add SSE support for agent streaming responses
  - [ ] Test agent endpoints with authenticated requests

- [x] **Task 4: Workflow Endpoints** (AC: And - workflow endpoints)
  - [x] Implement GET /api/v1/workflows - list workflows
  - [x] Implement GET /api/v1/workflows/:id - get workflow details
  - [x] Implement POST /api/v1/workflows/:id/execute - execute workflow
  - [ ] Add workflow execution status tracking
  - [ ] Test workflow endpoints

- [x] **Task 5: Project Endpoints** (AC: And - project endpoints)
  - [x] Implement GET /api/v1/projects - list user projects
  - [x] Implement POST /api/v1/projects - create new project
  - [x] Implement GET /api/v1/projects/:id - get project details
  - [x] Implement PUT /api/v1/projects/:id - update project
  - [x] Implement DELETE /api/v1/projects/:id - delete project
  - [x] Implement GET /api/v1/projects/:id/artifacts - list artifacts
  - [ ] Implement POST /api/v1/projects/:id/artifacts - upload artifact (501 Not Implemented)

- [x] **Task 6: Template Endpoints** (AC: And - template endpoints)
  - [x] Implement GET /api/v1/templates - list available templates
  - [x] Implement GET /api/v1/templates/:templateId - get template details
  - [ ] Implement POST /api/custom-templates - create custom template (enterprise)
  - [x] Add template category filtering

- [x] **Task 7: Response Structure Standardization** (AC: And - consistent response structure)
  - [x] Define standard response envelope (success, data, error, meta)
  - [x] Implement pagination wrapper for list endpoints
  - [ ] Add rate limit headers to responses (infrastructure exists, needs integration)
  - [x] Standardize error response format
  - [x] Add request ID tracking for debugging

---

## Review Follow-ups (AI)

- [ ] [AI-Review][HIGH] Implement POST /api/auth/login authentication endpoint
- [ ] [AI-Review][HIGH] Implement CORS configuration for API routes
- [ ] [AI-Review][HIGH] Add rate limit headers to API responses
- [ ] [AI-Review][MEDIUM] Implement POST /api/custom-templates endpoint
- [ ] [AI-Review][MEDIUM] Add SSE support for agent streaming responses
- [ ] [AI-Review][MEDIUM] Add pagination metadata to agents/workflows/templates list endpoints
- [ ] [AI-Review][LOW] Add OPTIONS handlers for CORS preflight
- [ ] [AI-Review][LOW] Add audit logging for API requests

---

## Dev Notes

### Architecture Patterns & Constraints

**RESTful API Design Principles:**
- **Resource-oriented** - Nouns over verbs (/agents not /getAgents)
- **HTTP semantics** - Proper use of GET, POST, PUT, DELETE, PATCH
- **Stateless** - Each request contains all necessary context
- **Versioned** - /api/v1/ for backward compatibility

**Response Structure Standard:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601",
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}
```

**Error Response Structure:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { /* additional error context */ }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}
```

### File Structure Requirements

**API Route Structure:**
```
src/app/api/v1/
├── health/
│   └── route.ts                    # GET - health check
├── auth/
│   └── login/
│       └── route.ts                # POST - authenticate
├── agents/
│   ├── route.ts                    # GET - list agents
│   └── [id]/
│       ├── route.ts                # GET - agent details
│       └── invoke/
│           └── route.ts            # POST - invoke agent
├── workflows/
│   ├── route.ts                    # GET - list workflows
│   └── [id]/
│       ├── route.ts                # GET - workflow details
│       └── execute/
│           └── route.ts            # POST - execute workflow
├── projects/
│   ├── route.ts                    # GET, POST - list/create
│   └── [id]/
│       ├── route.ts                # GET, PUT, DELETE
│       └── artifacts/
│           └── route.ts            # GET, POST - artifacts
├── templates/
│   ├── route.ts                    # GET - list templates
│   └── [id]/
│       └── route.ts                # GET - template details
└── middleware.ts                   # API middleware (auth, CORS, rate limit)
```

### Technical Requirements

**Next.js API Routes:**
- Use App Router convention (route.ts files)
- Implement proper TypeScript types for requests/responses
- Use Next.js Response helpers for JSON responses
- Handle HTTP methods explicitly (GET, POST, etc.)

**Authentication Integration:**
- Protected routes verify session or API key
- Extract user context from JWT
- Role-based access control enforcement
- Return 401 for unauthenticated, 403 for unauthorized

**Pagination Standard:**
- Query params: `?page=1&perPage=20`
- Response includes pagination metadata
- Default page size: 20, max: 100
- Include total count when available

**SSE for Streaming:**
- Agent invocation returns stream for real-time output
- Use Server-Sent Events (SSE) pattern
- Include event types: data, error, done

### Testing Requirements

**Manual API Testing:**
- Use cURL or Postman for endpoint verification
- Test authentication flows
- Verify error responses
- Check rate limit headers

**Example cURL Tests:**
```bash
# Health check
curl http://localhost:42001/api/v1/health

# List agents (authenticated)
curl -H "Authorization: Bearer <token>" \
  http://localhost:42001/api/v1/agents

# Invoke agent
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"input": "test input"}' \
  http://localhost:42001/api/v1/agents/scanner/invoke
```

---

## Dev Agent Guardrails

### Technical Requirements

**HTTP Status Codes:**
- 200 - Success
- 201 - Created
- 204 - No Content
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 422 - Validation Error
- 429 - Rate Limited
- 500 - Server Error

**Rate Limiting:**
- Configure stricter limits for API vs UI
- Return rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Use sliding window or token bucket algorithm

**CORS Configuration:**
- Whitelist allowed origins (configurable via env)
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Authorization, Content-Type
- Expose headers: X-Request-ID

### Security Requirements

**Input Validation:**
- Validate all request bodies with Zod schemas
- Sanitize string inputs
- Limit request body size (1MB default)
- Reject malformed JSON

**Output Sanitization:**
- Never expose internal errors in production
- Redact sensitive data from responses
- Sanitize user-generated content

**Audit Logging:**
- Log all API requests with user context
- Include request ID for traceability
- Log authentication attempts
- Track rate limit violations

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Provide programmatic access to all BMAD capabilities
**Target Users:** Developers integrating BMAD into automation workflows

**Key Design Principles:**
- **RESTful conventions** - Standard HTTP semantics
- **Consistent responses** - Predictable structure across endpoints
- **Developer-friendly** - Clear error messages and documentation
- **Production-ready** - Rate limiting, logging, monitoring

---

## Story Completion Status

**Status:** in-progress
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Address Review Follow-ups for remaining tasks

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Security architecture
- [Technical Implementation](../06-technical-implementation.md) - API architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 8: API & Developer Experience - [epics.md#epic-8](../epics.md#epic-8-api--developer-experience)
- Story 8.1 Details - [epics.md#story-81-restful-api-implementation](../epics.md#story-81-restful-api-implementation)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Implementation Date
2026-02-18

### Completion Notes List
- Implemented v1 API structure with 13 endpoints across agents, workflows, projects, templates, and health
- Created standardized response wrapper with success/error/meta structure
- All TypeScript compilation errors resolved
- Remaining work: auth/login endpoint, CORS configuration, SSE streaming, artifact upload

### File List
**Infrastructure:**
- `team/bmad-web-ui/src/lib/api/response.ts` - API response utilities (apiSuccess, apiError, helpers)
- `team/bmad-web-ui/src/lib/api/middleware.ts` - API middleware (auth, rate limiting)

**API Endpoints:**
- `team/bmad-web-ui/src/app/api/v1/health/route.ts` - GET /health (public)
- `team/bmad-web-ui/src/app/api/v1/agents/route.ts` - GET /agents (list)
- `team/bmad-web-ui/src/app/api/v1/agents/[id]/route.ts` - GET /agents/:id (details)
- `team/bmad-web-ui/src/app/api/v1/agents/[id]/invoke/route.ts` - POST /agents/:id/invoke (auth required)
- `team/bmad-web-ui/src/app/api/v1/workflows/route.ts` - GET /workflows (list)
- `team/bmad-web-ui/src/app/api/v1/workflows/[id]/route.ts` - GET /workflows/:id (details)
- `team/bmad-web-ui/src/app/api/v1/workflows/[id]/execute/route.ts` - POST /workflows/:id/execute (auth required)
- `team/bmad-web-ui/src/app/api/v1/projects/route.ts` - GET /projects, POST /projects
- `team/bmad-web-ui/src/app/api/v1/projects/[id]/route.ts` - GET/PUT/DELETE /projects/:id
- `team/bmad-web-ui/src/app/api/v1/projects/[id]/artifacts/route.ts` - GET /projects/:id/artifacts, POST (501)
- `team/bmad-web-ui/src/app/api/v1/templates/route.ts` - GET /templates
- `team/bmad-web-ui/src/app/api/v1/templates/[templateId]/route.ts` - GET /templates/:templateId

**Supporting Files Modified:**
- `team/bmad-web-ui/src/lib/templates/builtin-templates.ts` - Added getBuiltinTemplates() function
