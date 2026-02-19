# Story 9.6: Input Validation Layer

**Status:** done
**Epic:** Epic 9 - Security Hardening
**Story ID:** 9.6
**Story Key:** 9-6-input-validation-layer
**Dependencies:** Story 1.1 (Project Scaffold)

---

## Story

**As a** Security Architect,
**I want** comprehensive input validation on all endpoints,
**So that** invalid or malicious data is rejected early.

---

## Acceptance Criteria

**Given** an API endpoint receiving user input
**When** the input validation middleware runs
**Then** validate all inputs with Zod schemas
**And** enforce max length constraints (e.g., 10000 chars for text fields)
**Then** reject unknown properties (strict validation)
**And** validate data types (string, number, boolean, array)
**And** sanitize HTML inputs with DOMPurify
**And** return 400 with validation error details for invalid input

---

## Tasks / Subtasks

- [ ] **Task 1: Install Validation Dependencies** (AC: Then - validate with Zod schemas)
  - [ ] Install zod package
  - [ ] Install DOMPurify for HTML sanitization
  - [ ] Install @types/dompurify if needed
  - [ ] Verify dependencies in package.json

- [ ] **Task 2: Create Validation Middleware Foundation** (AC: Given - API endpoint, When - middleware runs)
  - [ ] Create `src/middleware/validation-middleware.ts`
  - [ ] Create `src/lib/validation/schemas.ts` for Zod schemas
  - [ ] Create `src/lib/validation/sanitizers.ts` for sanitization
  - [ ] Define validation error response format
  - [ ] Define validation configuration options

- [ ] **Task 3: Define Common Validation Schemas** (AC: Then - validate with Zod)
  - [ ] Create base schemas: string, number, boolean, array, object
  - [ ] Create email schema with proper validation
  - [ ] Create URL schema with protocol validation
  - [ ] Create UUID schema
  - [ ] Create date/datetime schema
  - [ ] Create enum schemas for known values
  - [ ] Export all schemas from barrel file

- [ ] **Task 4: Implement Length Constraints** (AC: And - max length constraints)
  - [ ] Define max length constants (text: 10000, title: 200, name: 100)
  - [ ] Create maxLength helper schema
  - [ ] Create minLength helper schema
  - [ ] Apply to all string schemas
  - [ ] Document length constraints

- [ ] **Task 5: Implement Strict Validation** (AC: Then - reject unknown properties)
  - [ ] Configure Zod strict mode
  - [ ] Reject additional properties by default
  - [ ] Create passthrough option for specific use cases
  - [ ] Document strict validation behavior

- [ ] **Task 6: Implement Type Validation** (AC: And - validate data types)
  - [ ] Create string type validator
  - [ ] Create number type validator (with min/max)
  - [ ] Create boolean type validator
  - [ ] Create array type validator (with item schema)
  - [ ] Create object type validator
  - [ ] Create union type validator for multiple types

- [ ] **Task 7: Implement HTML Sanitization** (AC: And - sanitize HTML with DOMPurify)
  - [ ] Create `sanitizeHtml()` function using DOMPurify
  - [ ] Configure allowed HTML tags
  - [ ] Configure allowed HTML attributes
  - [ ] Create HTML validation schema with sanitization
  - [ ] Create markdown sanitization (if needed)
  - [ ] Test XSS prevention

- [ ] **Task 8: Create Domain-Specific Schemas** (AC: Given - API endpoints)
  - [ ] Create project schemas (name, description, metadata)
  - [ ] Create workflow schemas (name, parameters, config)
  - [ ] Create agent schemas (message, context, parameters)
  - [ ] Create user schemas (email, name, role)
  - [ ] Create file upload schemas (filename, size, type)
  - [ ] Create CLI command schemas (command, args, options)

- [ ] **Task 9: Implement Validation Middleware** (AC: When - middleware runs)
  - [ ] Create `validateBody(schema)` middleware factory
  - [ ] Create `validateQuery(schema)` middleware factory
  - [ ] Create `validateParams(schema)` middleware factory
  - [ ] Integrate with Next.js route handlers
  - [ ] Handle validation errors

- [ ] **Task 10: Create Validation Error Formatter** (AC: And - return 400 with details)
  - [ ] Create formatValidationErrors() function
  - [ ] Include field path in error
  - [ ] Include error message (Zod default or custom)
  - [ ] Include received value (sanitized)
  - [ ] Return 400 status code
  - [ ] Support JSON and HTML error responses

- [ ] **Task 11: Write Unit Tests** (AC: All)
  - [ ] Test schema validation (valid inputs)
  - [ ] Test schema validation (invalid inputs)
  - [ ] Test length constraints
  - [ ] Test strict validation (reject unknown properties)
  - [ ] Test type validation
  - [ ] Test HTML sanitization
  - [ ] Test error formatting

- [ ] **Task 12: Write Integration Tests** (AC: All)
  - [ ] Test middleware on API routes
  - [ ] Test validation errors return 400
  - [ ] Test valid requests pass through
  - [ ] Test complex nested object validation
  - [ ] Test array validation
  - [ ] Test file upload validation

- [ ] **Task 13: Documentation & Verification** (AC: All)
  - [ ] Document all validation schemas
  - [ ] Create schema usage guide
  - [ ] Document sanitization rules
  - [ ] Create validation middleware guide
  - [ ] Add examples of common validations
  - [ ] Run test suite to verify 100% pass rate

---

## Dev Notes

### Architecture Patterns & Constraints

**Validation Layer Architecture:**
```
Request -> Validation Middleware -> Zod Schema -> Sanitization -> Route Handler
                                              |
                                              v
                                       Invalid? -> 400 Error
```

**Zod Schema Pattern:**
```typescript
import { z } from 'zod'

// Base schema with strict mode
export const baseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.datetime(),
}).strict()

// With validation
export const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict()
```

**Length Constraints:**
| Field Type | Max Length | Min Length |
|------------|------------|------------|
| Title/Name | 200 | 1 |
| Description | 10000 | 0 |
| Short text | 500 | 1 |
| URL | 2048 | 1 |
| Email | 320 | 1 |

**Sanitization Rules:**
- HTML: Allow limited tags (p, br, strong, em, ul, ol, li, a)
- HTML attributes: href (a only), class
- Remove all script tags and event handlers
- Strip dangerous CSS

### File Structure Requirements

**Must-Create Files:**
1. `src/lib/validation/schemas.ts` - Zod schema definitions
2. `src/lib/validation/sanitizers.ts` - Sanitization functions
3. `src/lib/validation/middleware.ts` - Validation middleware
4. `src/lib/validation/errors.ts` - Error formatting
5. `tests/validation/schemas.test.ts` - Schema tests
6. `tests/validation/sanitizers.test.ts` - Sanitization tests
7. `tests/validation/middleware.test.ts` - Middleware tests

**Schema Organization:**
```
src/lib/validation/
├── schemas/
│   ├── base.ts           # Base schemas
│   ├── project.ts        # Project schemas
│   ├── workflow.ts       # Workflow schemas
│   ├── agent.ts          # Agent schemas
│   ├── user.ts           # User schemas
│   └── index.ts          # Barrel export
├── sanitizers.ts
├── middleware.ts
└── errors.ts
```

### Testing Requirements

**Schema Tests:**
```typescript
describe('Validation Schemas', () => {
  describe('Project Schema', () => {
    it('should validate valid project data', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        description: 'A test project'
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = projectSchema.safeParse({
        name: '',
        description: 'A test project'
      })
      expect(result.success).toBe(false)
    })

    it('should reject unknown properties', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        unknown: 'field'
      })
      expect(result.success).toBe(false)
    })

    it('should enforce max length', () => {
      const result = projectSchema.safeParse({
        name: 'a'.repeat(201),
        description: 'A test project'
      })
      expect(result.success).toBe(false)
    })
  })
})
```

**Sanitization Tests:**
```typescript
describe('HTML Sanitization', () => {
  it('should remove script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert(1)</script>')
    expect(result).toBe('<p>Hello</p>')
  })

  it('should remove event handlers', () => {
    const result = sanitizeHtml('<p onclick="alert(1)">Hello</p>')
    expect(result).not.toContain('onclick')
  })

  it('should allow safe HTML', () => {
    const result = sanitizeHtml('<p><strong>Hello</strong></p>')
    expect(result).toBe('<p><strong>Hello</strong></p>')
  })
})
```

### Security Considerations

**Input Validation Security:**
- Validate all inputs, never trust client-side validation
- Use strict mode to catch unexpected properties
- Sanitize HTML to prevent XSS
- Validate file uploads (type, size, content)

**Type Coercion Prevention:**
- Zod prevents automatic type coercion
- Explicit type validation required
- No implicit string->number conversion

**Error Message Security:**
- Don't expose internal details in errors
- Sanitize error messages
- Don't return full input in errors

---

## Dev Agent Guardrails

### Technical Requirements

**Zod Schema Definition:**
```typescript
import { z } from 'zod'

// Strict schema by default
export const createStrictSchema = <T extends z.ZodRawShape>(shape: T) => {
  return z.object(shape).strict()
}

// Common validators
export const emailSchema = z.string().email().max(320)
export const urlSchema = z.string().url().max(2048)
export const uuidSchema = z.string().uuid()
export const dateSchema = z.string().datetime()

// String with length constraints
export const textSchema = (max = 10000) => z.string().max(max)
export const titleSchema = z.string().min(1).max(200)
export const nameSchema = z.string().min(1).max(100)

// Number with range
export const positiveNumberSchema = z.number().positive()
export const portSchema = z.number().int().min(1).max(65535)
```

**Validation Middleware:**
```typescript
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { formatValidationErrors } from './errors'

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatValidationErrors(result.error.errors)
          },
          { status: 400 }
        )
      }

      // Attach validated data to request for downstream handlers
      ;(req as any).validatedBody = result.data
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }
}
```

**Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const ALLOWED_ATTR = ['href', 'class']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

export function createHtmlSchema(maxLength = 10000) {
  return z.string()
    .max(maxLength)
    .transform(sanitizeHtml)
}
```

**Error Formatting:**
```typescript
import { ZodError } from 'zod'

export interface ValidationError {
  path: string[]
  message: string
  code: string
}

export function formatValidationErrors(errors: ZodError['errors']): ValidationError[] {
  return errors.map(error => ({
    path: error.path.map(String),
    message: error.message,
    code: error.code,
  }))
}
```

### Architecture Compliance

**Usage in API Routes:**
```typescript
// src/app/api/projects/route.ts
import { validateBody } from '@/lib/validation/middleware'
import { createProjectSchema } from '@/lib/validation/schemas/project'

export async function POST(req: NextRequest) {
  // Validate input
  const validationResult = await validateBody(createProjectSchema)(req)
  if (validationResult.status === 400) return validationResult

  const data = (req as any).validatedBody

  // Create project...
}
```

**Custom Validations:**
```typescript
// Create reusable validators
export const slugSchema = z.string()
  .regex(/^[a-z0-9-]+$/, 'Must contain only lowercase letters, numbers, and hyphens')
  .min(1)
  .max(100)

export const apiKeySchema = z.string()
  .regex(/^[a-zA-Z0-9_-]{32,}$/, 'Invalid API key format')

// Conditional validation
export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(12).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
}).refine(
  data => Object.keys(data).length > 0,
  'At least one field must be provided'
)
```

### Library/Framework Requirements

**Dependencies:**
```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "isomorphic-dompurify": "^2.11.0"
  },
  "devDependencies": {
    "@types/dompurify": "^3.0.5"
  }
}
```

**DOMPurify Configuration:**
```typescript
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  // Additional sanitization logic
  if (data.attrName === 'href') {
    // Block javascript: links
    if (data.attrValue.startsWith('javascript:')) {
      node.removeAttribute('href')
    }
  }
})
```

### File Structure Requirements

**Export Structure:**
```typescript
// src/lib/validation/schemas/index.ts
export * from './base'
export * from './project'
export * from './workflow'
export * from './agent'
export * from './user'

// src/lib/validation/index.ts
export * from './schemas'
export * from './sanitizers'
export * from './middleware'
export * from './errors'
```

### Testing Requirements

**Test Structure:**
```typescript
describe('Validation Layer', () => {
  describe('Schemas', () => {
    it('should validate valid input')
    it('should reject invalid input')
    it('should enforce length constraints')
    it('should reject unknown properties')
  })

  describe('Sanitization', () => {
    it('should remove dangerous HTML')
    it('should preserve safe HTML')
    it('should prevent XSS attacks')
  })

  describe('Middleware', () => {
    it('should return 400 for invalid input')
    it('should attach validated data to request')
    it('should handle malformed JSON')
  })
})
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Security Hardening (Epic 9)

**Input Validation Priority:**
1. High-risk inputs: Agent messages, CLI commands, file uploads
2. Medium-risk: Project descriptions, workflow parameters
3. Low-risk: Display names, metadata

**Domain-Specific Validations:**
- **Projects**: Name (1-200 chars), description (max 10000)
- **Workflows**: Parameters schema validation
- **Agents**: Message length, context limits
- **CLI**: Command whitelist, argument validation
- **Files**: Type whitelist, size limits

**Integration Points:**
- Story 9.1: Complements prompt injection detection
- Story 9.2: Middleware integration
- Story 9.5: CORS and CSRF protection

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
- [Security Deep Dive](../11-security-deep-dive.md#3-authorization-model-rbac) - Input validation context
- [Architecture & Security](../02-architecture-security.md) - Security architecture overview
- [Epic 9 Details](../epics.md#story-96-input-validation-layer) - Story requirements

**Story Breakdown Reference:**
- Epic 9: Security Hardening - [epics.md#epic-9](../epics.md#epic-9-security-hardening)
- Story 9.6 Details - [epics.md#story-96-input-validation-layer](../epics.md#story-96-input-validation-layer)

**Depends On:**
- Story 1.1: Project Scaffold & Base Configuration

**Related Stories:**
- Story 9.1: Prompt Injection Detection Engine
- Story 9.2: Prompt Injection Middleware
- Story 9.5: Security Headers & CORS

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
