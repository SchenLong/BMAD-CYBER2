# Story 6.2: Project CRUD API

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.2
**Story Key:** 6-2-project-crud-api
**Dependencies:** Story 6.1 (Project Data Model & Database)

---

## Story

**As a** User,
**I want** to create, read, update, and delete projects,
**So that** I can manage my engagements.

---

## Acceptance Criteria

**Given** an authenticated user with appropriate permissions
**When** creating a new project via POST /api/projects
**Then** validate project data with Zod schema
**And** generate unique project code
**And** set creator as project owner
**And** return created project with ID
**When** reading projects via GET /api/projects
**Then** support filtering by type, status, search query
**And** return paginated results
**When** updating via PATCH /api/projects/:id
**Then** validate user has permission (owner or admin)
**When** deleting via DELETE /api/projects/:id
**Then** perform soft delete (set archived status)

---

## Tasks / Subtasks

- [x] **Task 1: Create Project Zod Schema** (AC: Then - validate project data with Zod schema)
  - [x] Define CreateProjectInput schema with validation rules
  - [x] Define UpdateProjectInput schema with partial fields
  - [x] Define ProjectQuery schema for filtering/pagination
  - [x] Add custom validators for dates and enums
  - [x] Export schemas from validation module

- [x] **Task 2: Create Project Service Layer** (AC: All)
  - [x] Create project service with CRUD operations
  - [x] Implement code generation (e.g., PROJ-YYYY-NNNN)
  - [x] Implement permission checking logic
  - [x] Implement filtering and pagination logic
  - [x] Implement soft delete logic

- [x] **Task 3: Implement POST /api/projects** (AC: When creating via POST)
  - [x] Create API route handler
  - [x] Authenticate and authorize user
  - [x] Validate request body with Zod
  - [x] Call service to create project
  - [x] Return 201 with created project
  - [x] Handle validation errors (400)
  - [x] Handle unique constraint violations (409)

- [x] **Task 4: Implement GET /api/projects** (AC: When reading via GET)
  - [x] Create API route handler
  - [x] Parse query parameters (type, status, search, page, limit)
  - [x] Validate query params with Zod
  - [x] Call service with filters
  - [x] Return 200 with paginated results
  - [x] Include total count and pagination metadata

- [x] **Task 5: Implement GET /api/projects/:id** (AC: When reading single project)
  - [x] Create API route handler for single project
  - [x] Validate user has access to project
  - [x] Return 200 with full project details
  - [x] Include relations (members, workflows, artifacts)
  - [x] Handle not found (404)

- [x] **Task 6: Implement PATCH /api/projects/:id** (AC: When updating via PATCH)
  - [x] Create API route handler
  - [x] Validate user is owner or admin
  - [x] Validate request body with Zod partial schema
  - [x] Call service to update project
  - [x] Return 200 with updated project
  - [x] Handle forbidden (403)
  - [x] Handle not found (404)

- [x] **Task 7: Implement DELETE /api/projects/:id** (AC: When deleting via DELETE)
  - [x] Create API route handler
  - [x] Validate user is owner or admin
  - [x] Perform soft delete (set archivedAt)
  - [x] Return 204 No Content
  - [x] Handle forbidden (403)
  - [x] Handle not found (404)

- [x] **Task 8: Add Project Member Management Endpoints** (AC: And - project management)
  - [x] POST /api/projects/:id/members - Add team member
  - [x] PATCH /api/projects/:id/members/:userId - Update member role
  - [x] DELETE /api/projects/:id/members/:userId - Remove member
  - [x] Validate permissions for all operations

- [x] **Task 9: Error Handling and Response Formatting** (AC: All)
  - [x] Create consistent error response format
  - [x] Add request logging
  - [x] Add rate limiting for project creation
  - [x] Add input sanitization

- [x] **Task 10: Verification** (AC: All)
  - [x] Test creating project with valid data
  - [x] Test creating with invalid data (validation errors)
  - [x] Test filtering by type and status
  - [x] Test pagination
  - [x] Test updating project as owner
  - [x] Test updating as non-owner (should fail)
  - [x] Test soft delete
  - [x] Test member management

---

## Dev Notes

### Architecture Patterns & Constraints

**API Design Patterns:**
- **RESTful conventions** - Use HTTP verbs correctly (GET, POST, PATCH, DELETE)
- **Resource naming** - Plural nouns (/api/projects, /api/projects/:id)
- **Status codes** - Use appropriate codes (200, 201, 204, 400, 403, 404, 409)
- **Pagination** - Use page/limit or cursor-based pagination

**Next.js App Router API Routes:**
```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // List projects with filtering
}

export async function POST(request: NextRequest) {
  // Create new project
}

// src/app/api/projects/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get single project
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Update project
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Delete project
}
```

**Zod Validation Schemas:**
```typescript
// src/lib/validations/project.ts
import { z } from 'zod'

export const ProjectTypeEnum = z.enum([
  'security-assessment',
  'incident-response',
  'investigation',
  'advisory',
  'compliance',
  'training'
])

export const ProjectStatusEnum = z.enum([
  'planning',
  'active',
  'on-hold',
  'completed',
  'archived'
])

export const CreateProjectInput = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: ProjectTypeEnum,
  clientName: z.string().max(200).optional(),
  clientContact: z.string().max(200).optional(),
  targetCompletionDate: z.string().datetime().optional(),
  memberIds: z.array(z.string()).optional()
})

export const UpdateProjectInput = CreateProjectInput.partial()

export const ProjectQuery = z.object({
  type: ProjectTypeEnum.optional(),
  status: ProjectStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})
```

### File Structure Requirements

**API Route Files:**
1. `src/app/api/projects/route.ts` - List and create projects
2. `src/app/api/projects/[id]/route.ts` - Get, update, delete single project
3. `src/app/api/projects/[id]/members/route.ts` - Member management
4. `src/app/api/projects/[id]/members/[userId]/route.ts` - Member role updates

**Service Layer Files:**
1. `src/lib/services/project.service.ts` - Business logic for projects
2. `src/lib/services/project-member.service.ts` - Member management logic

**Validation Files:**
1. `src/lib/validations/project.ts` - Zod schemas for projects
2. `src/lib/validations/query.ts` - Query parameter schemas

**Type Definition Files:**
1. `src/types/api/project.ts` - API request/response types

### Testing Requirements Summary

**Unit Tests:**
- Test Zod schema validation
- Test service layer functions
- Test permission checking logic
- Test code generation

**Integration Tests:**
- Test all API endpoints with valid/invalid data
- Test permission checks
- Test error responses
- Test pagination

**API Response Format:**
```typescript
// Success - Create
{
  "id": "clx1234567890",
  "code": "PROJ-2026-0001",
  "name": "Security Assessment",
  "type": "security-assessment",
  "status": "planning",
  "owner": { "id": "...", "name": "John Doe" },
  "createdAt": "2026-02-15T10:00:00Z"
}

// Success - List
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project data",
    "details": [...]
  }
}
```

---

## Dev Agent Guardrails

### Technical Requirements

**Authentication & Authorization:**
- All endpoints must verify authentication (except where public)
- Use session/auth headers from Epic 1
- Check permissions before allowing modifications
- Return 401 for unauthenticated, 403 for unauthorized

**Input Validation:**
- Always validate request body with Zod
- Always validate query parameters
- Never trust client input
- Sanitize strings to prevent injection attacks

**Response Formatting:**
- Consistent JSON structure
- Include appropriate HTTP status codes
- Handle errors gracefully (no stack traces)
- Support CORS if needed

### Architecture Compliance

**Service Layer Pattern:**
- Business logic in service layer, not API routes
- API routes handle HTTP concerns only
- Services return domain objects or throw errors
- API routes map domain results to HTTP responses

**Error Handling:**
```typescript
// src/lib/errors.ts
export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project not found: ${id}`)
    this.name = 'ProjectNotFoundError'
  }
}

export class InsufficientPermissionError extends Error {
  constructor() {
    super('Insufficient permissions')
    this.name = 'InsufficientPermissionError'
  }
}

// Usage in API route
try {
  const project = await projectService.getById(id, userId)
  return NextResponse.json(project)
} catch (error) {
  if (error instanceof ProjectNotFoundError) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: error.message } },
      { status: 404 }
    )
  }
  if (error instanceof InsufficientPermissionError) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: error.message } },
      { status: 403 }
    )
  }
  throw error
}
```

**Code Generation:**
```typescript
// Generate unique project code
async function generateProjectCode(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.project.count({
    where: {
      code: { startsWith: `PROJ-${year}` }
    }
  })
  const sequence = String(count + 1).padStart(4, '0')
  return `PROJ-${year}-${sequence}`
}
```

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "@prisma/client": "^6.0.0"
  }
}
```

**API Route Type Safety:**
```typescript
// Use Next.js 15 typed route handlers
type RouteHandlerContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteHandlerContext
) {
  const { id } = await context.params
  // ...
}
```

### Testing Requirements

**Verification Steps:**
1. Create project via POST /api/projects - verify 201 response
2. Create with invalid data - verify 400 with validation errors
3. List projects via GET /api/projects - verify pagination works
4. Filter by type - verify correct results
5. Update project as owner - verify 200 response
6. Update as non-owner - verify 403 response
7. Delete project - verify soft delete (archivedAt set)
8. Add member via POST /api/projects/:id/members - verify member added

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** RESTful API for complete project CRUD operations with proper validation, authorization, and error handling

**Key Design Principles:**
- **Type Safety** - Zod validation ensures data integrity
- **Security** - Proper authentication and authorization checks
- **DX Focus** - Clear error messages help frontend integration
- **Performance** - Efficient queries with pagination

**Technology Rationale:**
- **Next.js API Routes** - Integrated with Next.js app, no separate server
- **Zod** - Runtime type validation with TypeScript inference
- **Service Layer** - Separation of concerns for testability

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Security requirements
- [Technical Implementation](../06-technical-implementation.md) - API design patterns
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.2 Details - [epics.md#story-62-project-crud-api](../epics.md#story-62-project-crud-api)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- Complete CRUD API implemented with Next.js App Router
- Zod validation schemas defined for all inputs
- Service layer created for business logic separation
- Permission checks implemented for all operations
- Pagination and filtering working correctly
- Project member management endpoints functional
- Error handling consistent across all endpoints

### File List
- src/app/api/projects/route.ts - List and create projects
- src/app/api/projects/[id]/route.ts - Single project CRUD
- src/app/api/projects/[id]/members/route.ts - Member management
- src/lib/services/project.service.ts - Business logic
- src/lib/validations/project.ts - Zod schemas
