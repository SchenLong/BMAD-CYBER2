# Story 8.5: API Explorer

**Status:** review
**Epic:** Epic 8 - API & Developer Experience
**Story ID:** 8.5
**Story Key:** 8-5-api-explorer
**Dependencies:** 1.1, 8.1, 8.3, 8.4

---

## Story

**As a** Developer,
**I want** an interactive API explorer,
**So that** I can test endpoints directly from the browser.

---

## Acceptance Criteria

**Given** a developer accessing the API Explorer
**When** the explorer loads
**Then** display list of all available endpoints
**And** provide interface for selecting method, entering parameters
**And** show request preview with headers and body
**And** execute request and display response
**And** include authentication using current session or API key
**And** provide code snippet for executed request

---

## Tasks / Subtasks

- [x] **Task 1: Explorer UI Structure** (AC: Given - developer accessing API Explorer)
  - [x] Create /api-explorer route
  - [x] Design two-panel layout (endpoint list, request builder)
  - [x] Create responsive design for mobile/tablet
  - [x] Add authentication check for access
  - [x] Implement persistent state (localStorage)

- [x] **Task 2: Endpoint Discovery** (AC: Then - display list of endpoints)
  - [x] Fetch available endpoints from OpenAPI spec
  - [x] Group endpoints by category (Agents, Workflows, Projects)
  - [x] Display method badge (GET, POST, PUT, DELETE)
  - [x] Show endpoint path and brief description
  - [x] Implement filter/search for endpoints

- [x] **Task 3: Request Builder Interface** (AC: And - selecting method, entering parameters)
  - [x] Display selected endpoint details
  - [x] Show HTTP method (read-only for endpoints)
  - [x] Build URL with path parameters
  - [x] Add query parameter inputs
  - [x] Create request body editor for POST/PUT
  - [x] Add header editor (pre-populate with Authorization)

- [x] **Task 4: Request Preview** (AC: And - show request preview)
  - [x] Display full request URL
  - [x] Show all headers that will be sent
  - [x] Preview request body (formatted JSON)
  - [x] Update preview in real-time as user types
  - [x] Toggle between raw and formatted view

- [x] **Task 5: Request Execution** (AC: And - execute request and display response)
  - [x] Implement "Send Request" button
  - [x] Execute request using fetch/XHR
  - [x] Display loading state during request
  - [x] Show response status code and color-coded badge
  - [x] Display response headers
  - [x] Format and display response body
  - [x] Handle errors gracefully

- [x] **Task 6: Authentication Integration** (AC: And - authentication)
  - [x] Auto-populate Authorization from current session
  - [x] Allow switching to API key input
  - [x] Securely store API key preference (sessionStorage only)
  - [x] Show current auth method in UI
  - [x] Clear auth on logout

- [x] **Task 7: Code Snippet Generation** (AC: And - provide code snippet)
  - [x] Generate cURL command for executed request
  - [x] Generate JavaScript fetch code
  - [x] Generate Python requests code
  - [x] Add language selector tabs
  - [x] Include copy-to-clipboard button

- [x] **Task 8: History and Favorites** (AC: supporting)
  - [x] Save recent requests to localStorage
  - [x] Allow bookmarking frequently used requests
  - [x] Display request history panel
  - [x] Clear history option
  - [x] Re-run requests from history

---

## Dev Notes

### Architecture Patterns & Constraints

**Technology Considerations:**
- **Build vs Buy**: Consider Swagger UI, Redoc, Stoplight Elements
- **Recommendation**: Build custom using OpenAPI spec for better integration
- **State Management**: Use Zustand for explorer state
- **Request Client**: Use fetch API or axios for requests

**Explorer State Structure:**
```typescript
interface ExplorerState {
  selectedEndpoint: string | null
  pathParams: Record<string, string>
  queryParams: Record<string, string>
  headers: Record<string, string>
  body: string
  authMethod: 'session' | 'api_key'
  apiKey: string
  response: ExplorerResponse | null
  history: ExplorerRequest[]
  favorites: ExplorerRequest[]
}

interface ExplorerRequest {
  id: string
  method: string
  path: string
  params: Record<string, string>
  headers: Record<string, string>
  body: string
  timestamp: number
}

interface ExplorerResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  duration: number
}
```

### File Structure Requirements

**Explorer Pages:**
```
src/app/api-explorer/
├── page.tsx                    # Main explorer page
└── layout.tsx                  # Explorer layout
```

**Explorer Components:**
```
src/components/features/api-explorer/
├── api-explorer.tsx            # Main container
├── endpoint-list.tsx           # Sidebar with endpoints
├── endpoint-item.tsx           # Single endpoint display
├── request-builder.tsx         # Request form
├── request-preview.tsx         # Request preview panel
├── response-viewer.tsx         # Response display
├── code-snippet.tsx            # Code generation
├── auth-selector.tsx           # Auth method selector
├── history-panel.tsx           # Request history
└── search-filter.tsx           # Endpoint search
```

**Explorer Stores:**
```
src/stores/
└── api-explorer-store.ts       # Explorer state management
```

### Technical Requirements

**Endpoint Metadata:**
```typescript
interface EndpointMetadata {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  category: string
  description: string
  parameters: {
    path?: ParameterDef[]
    query?: ParameterDef[]
    header?: ParameterDef[]
    body?: BodySchema
  }
  responses: Record<string, ResponseSchema>
}

interface ParameterDef {
  name: string
  type: string
  required: boolean
  description: string
  enum?: string[]
  default?: string
}
```

**Code Snippet Generation:**
```typescript
// cURL
function generateCurl(request: ExplorerRequest): string {
  const { method, path, headers, body } = request
  let curl = `curl -X ${method} "${getBaseUrl()}${path}"`

  for (const [key, value] of Object.entries(headers)) {
    curl += ` \\\n  -H "${key}: ${value}"`
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    curl += ` \\\n  -d '${body}'`
  }

  return curl
}

// JavaScript
function generateJS(request: ExplorerRequest): string {
  return `fetch("${getBaseUrl()}${request.path}", {
  method: "${request.method}",
  headers: ${JSON.stringify(request.headers, null, 2)}${request.body ? `,
  body: JSON.stringify(${request.body})` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))`
}

// Python
function generatePython(request: ExplorerRequest): string {
  return `import requests

url = "${getBaseUrl()}${request.path}"
headers = ${JSON.stringify(request.headers, null, 2)}
${request.body ? `data = ${request.body}` : ''}

response = requests.${request.method.toLowerCase()}(url${request.body ? ', data=data' : ''}, headers=headers)
print(response.json())`
}
```

### UI/UX Requirements

**Layout:**
```
+------------------+----------------------------------------+
| Endpoints        | Request Builder                        |
|                  |                                        |
| Agents           | GET /api/v1/agents                    |
|  - List          |                                        |
|  - Get details   | Query Params                           |
|  - Invoke        |   page: [1]                            |
|                  |   perPage: [20]                        |
| Workflows        |                                        |
|  - List          | Headers                                |
|  - Execute       |   Authorization: Bearer ********       |
|                  |                                        |
| Projects         | [Send Request]                         |
|  - List          |                                        |
|  - Create        +----------------------------------------+
|                  | Response                               |
| [Search...]      | Status: 200 OK (245ms)                 |
|                  |                                       |
+------------------+ {                                      |
| History          |   "agents": [...]                      |
|                  | }                                      |
+------------------+                                        |
| Code Snippet     | cURL | JavaScript | Python              |
|                  | [Copy]                                 |
+------------------+----------------------------------------+
```

**Status Code Colors:**
- 2xx: Green
- 3xx: Blue
- 4xx: Yellow/Orange
- 5xx: Red

**Response Formatting:**
- Pretty-print JSON
- Syntax highlighting
- Collapse/expand objects
- Show raw option
- Download response button

### Security Requirements

**API Key Handling:**
- Never store API key in localStorage
- Use sessionStorage only (cleared on browser close)
- Clear API key from memory after use
- Mask API key in display (show last 4 chars only)

**Request Security:**
- Use POST for state-changing operations
- Include CSRF token for session auth
- Validate input before sending
- Sanitize response display

**Access Control:**
- Require Developer role or higher
- Log all explorer requests
- Rate limit explorer requests
- Option to disable explorer in production

---

## Dev Agent Guardrails

### Technical Requirements

**CORS Considerations:**
- API must allow requests from explorer origin
- Configure CORS headers properly
- Handle preflight requests
- Consider proxy for development

**Error Handling:**
- Display meaningful error messages
- Show network errors clearly
- Handle timeout scenarios
- Provide retry option

**Performance:**
- Debounce input in request builder
- Lazy load endpoint list
- Cache endpoint metadata
- Optimize JSON formatting

### Implementation Priority

**Phase 1 (MVP):**
- Endpoint list from OpenAPI spec
- Basic request builder
- Request execution
- Response display
- Session authentication

**Phase 2 (Enhanced):**
- API key authentication
- Code snippet generation
- Request history
- Favorites

**Phase 3 (Polish):**
- Dark/light theme toggle
- Export/import collections
- Environment switching
- Advanced filtering

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Provide interactive API testing interface
**Target Users:** Developers testing API integration

**Key Design Principles:**
- **Immediate feedback** - See results as you type
- **Learning tool** - Understand API by exploring
- **Production ready** - Generate real code from tests
- **Efficient** - Quick iteration on requests

---

## Story Completion Status

**Status:** review
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation:** Complete

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Security architecture
- [Technical Implementation](../06-technical-implementation.md) - API architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 8: API & Developer Experience - [epics.md#epic-8](../epics.md#epic-8-api--developer-experience)
- Story 8.5 Details - [epics.md#story-85-api-explorer](../epics.md#story-85-api-explorer)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
None - implementation proceeded without blocking issues.

### Completion Notes List
- ✅ Created Zustand store for API explorer state management (`src/stores/api-explorer-store.ts`)
- ✅ Created main API Explorer container component (`src/components/features/api-explorer/api-explorer.tsx`)
- ✅ Created EndpointList component with grouped categories and color-coded method badges
- ✅ Created RequestBuilder component for entering parameters, headers, and body
- ✅ Created ResponseViewer component with status badge, headers, and body tabs
- ✅ Created CodeSnippet component for cURL, JavaScript, and Python code generation
- ✅ Created AuthSelector component for switching between session and API key authentication
- ✅ Created HistoryPanel component for displaying and replaying recent requests
- ✅ Created main page at `/dashboard/api-explorer`
- ✅ Updated DEVELOPER_NAV navigation config to point to the API Explorer route
- ✅ Implemented persistent state using Zustand persist middleware
- ✅ Used sessionStorage for API key storage (cleared on browser close for security)

### File List
**State Management:**
- `src/stores/api-explorer-store.ts` - Zustand store with persist middleware

**Explorer Components:**
- `src/components/features/api-explorer/api-explorer.tsx` - Main container
- `src/components/features/api-explorer/endpoint-list.tsx` - Endpoint sidebar
- `src/components/features/api-explorer/request-builder.tsx` - Request form
- `src/components/features/api-explorer/response-viewer.tsx` - Response display
- `src/components/features/api-explorer/code-snippet.tsx` - Code generation
- `src/components/features/api-explorer/auth-selector.tsx` - Auth selector
- `src/components/features/api-explorer/history-panel.tsx` - Request history
- `src/components/features/api-explorer/index.ts` - Component exports

**Pages:**
- `src/app/(dashboard)/api-explorer/page.tsx` - Main explorer page

**Configuration:**
- `src/lib/navigation-config.ts` - Updated DEVELOPER_NAV Explorer route

**OpenAPI Support (from Story 8.4):**
- `src/lib/openapi/spec.ts` - Endpoint metadata (exports EndpointMetadata, ParameterDef, RequestBodyDef)
