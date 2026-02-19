# Story 4.1: SSE Infrastructure

**Status:** done
**Epic:** Epic 4 - Real-Time Observability
**Story ID:** 4.1
**Story Key:** 4-1-sse-infrastructure
**Dependencies:** Story 1.1 (Project Scaffold), Story 3.1 (Agent Integration)

---

## Story

**As a** Developer,
**I want** SSE endpoints for streaming agent progress,
**So that** the UI can display real-time updates.

---

## Acceptance Criteria

**Given** the Next.js API routes
**When** implementing SSE endpoints
**Then** create `/api/agents/:id/observe` endpoint with text/event-stream content type
**And** implement connection management with Map of active connections
**And** send keep-alive messages every 30 seconds
**And** handle client disconnect gracefully
**And** set runtime to 'nodejs' for streaming support

---

## Tasks / Subtasks

- [x] **Task 1: Create SSE API Route** (AC: Given, When, Then)
  - [x] Create `/api/agents/[agentId]/observe/route.ts` API route
  - [x] Set `export const runtime = 'nodejs'` for streaming support
  - [x] Configure response headers: Content-Type, Cache-Control, Connection, X-Accel-Buffering
  - [x] Return Response with ReadableStream body

- [x] **Task 2: Implement Connection Management** (AC: And - Map of active connections)
  - [x] Create `ActiveConnection` interface with id, agentId, controller, startTime
  - [x] Create connections Map in module scope for tracking active SSE connections
  - [x] Implement connection registration on stream start
  - [x] Implement connection cleanup on stream close/error
  - [x] Add getConnection helper for retrieving active connections

- [x] **Task 3: Implement Keep-Alive Mechanism** (AC: And - keep-alive every 30 seconds)
  - [x] Create timer for sending colon-prefixed comments (:keep-alive) every 30s
  - [x] Clear timer on connection close
  - [x] Handle abort signal from request for cleanup

- [x] **Task 4: Handle Client Disconnect** (AC: And - handle disconnect gracefully)
  - [x] Listen for request.signal 'abort' event
  - [x] Cleanup connection tracking on abort
  - [x] Close stream controller gracefully
  - [x] Log disconnect for debugging

- [x] **Task 5: Create SSE Event Helper** (AC: Then - text/event-stream format)
  - [x] Create sendEvent helper function with controller and data
  - [x] Format events as `data: ${JSON.stringify(data)}\n\n`
  - [x] Use TextEncoder for proper encoding

- [x] **Task 6: Create Stream Manager Utility** (AC: And - connection management)
  - [x] Create `lib/sse/stream-manager.ts` with connection management utilities
  - [x] Implement `StreamManager` class with methods: add, remove, get, broadcast
  - [x] Export singleton instance for API routes

- [x] **Task 7: Verification** (AC: Then, And)
  - [x] Test SSE endpoint with curl or browser EventSource
  - [x] Verify headers are correct (text/event-stream, no-cache, keep-alive)
  - [x] Verify keep-alive messages sent every 30 seconds
  - [x] Test client disconnect - verify cleanup occurs
  - [x] Verify multiple concurrent connections work independently

---

## Dev Notes

### Architecture Patterns & Constraints

**SSE Protocol Design:**

Server-Sent Events (SSE) is a one-way server-to-client streaming protocol ideal for real-time updates. Unlike WebSocket, SSE is HTTP-based and simpler for one-way streaming.

```
Client                                                  Server
│                                                       │
│  GET /api/agents/abc123/observe                       │
│  ──────────────────────────────────────────────────>  │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    Content-Type: text/event-stream                         │
│    Cache-Control: no-cache                                 │
│    Connection: keep-alive                                 │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"started","agentId":"abc123"}        │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    :keep-alive (sent every 30 seconds)                │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"done"}                              │
```

**Key Technical Decisions:**
1. **Runtime: 'nodejs'** - Edge runtime doesn't support streaming responses properly
2. **ReadableStream** - Native Web API for streaming, works with Next.js App Router
3. **Connection Map** - Track active connections for cleanup and potential broadcast features
4. **Keep-alive comments** - Prevent proxy/load balancer from closing idle connections

### SSE Implementation Pattern

```typescript
// api/agents/[id]/observe/route.ts
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder()
  const streamId = crypto.randomUUID()

  const stream = new ReadableStream({
    start(controller) {
      // Register connection
      streamManager.add(streamId, params.id, controller)

      // Send initial event
      sendEvent(controller, { type: 'connected', streamId })

      // Keep-alive interval
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(':keep-alive\n\n'))
      }, 30000)

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        streamManager.remove(streamId)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  })
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `src/app/api/agents/[id]/observe/route.ts` - SSE endpoint for agent observation
- `src/lib/sse/stream-manager.ts` - Connection management utilities
- `src/lib/sse/types.ts` - SSE-related TypeScript interfaces
- `src/lib/sse/helpers.ts` - Event formatting and sending utilities

**Project Structure:**
```
src/
├── app/
│   └── api/
│       └── agents/
│           └── [id]/
│               └── observe/
│                   └── route.ts        # SSE endpoint
├── lib/
│   └── sse/
│       ├── stream-manager.ts           # Connection tracking
│       ├── types.ts                    # SSE types
│       └── helpers.ts                  # Event helpers
└── types/
    └── events.ts                       # Event type definitions
```

### SSE Event Types

**Standard Event Format:**
```typescript
interface SSEEvent {
  type: 'connected' | 'step_start' | 'step_complete' | 'step_error' | 'message' | 'done' | 'error'
  agentId?: string
  agentName?: string
  step?: string
  progress?: number        // 0-100
  estimatedRemaining?: number // milliseconds
  data?: unknown
  error?: string
  timestamp?: string
}
```

**Event Examples:**
```typescript
// Connection established
{ type: 'connected', streamId: 'abc-123', timestamp: '2025-02-15T10:30:00Z' }

// Step started
{ type: 'step_start', agentId: 'intel-agent', step: 'Analyzing target...', progress: 10 }

// Progress update
{ type: 'step_complete', agentId: 'intel-agent', step: 'Gathering OSINT', progress: 45 }

// Message
{ type: 'message', agentId: 'intel-agent', data: 'Found 3 subdomains' }

// Completion
{ type: 'done', agentId: 'intel-agent', progress: 100 }

// Error
{ type: 'error', error: 'Target unreachable', recovery: 'Check network connectivity' }
```

### Connection Management

**StreamManager Class:**
```typescript
class StreamManager {
  private connections = new Map<string, ActiveConnection>()

  add(id: string, agentId: string, controller: ReadableStreamDefaultController): void
  remove(id: string): void
  get(id: string): ActiveConnection | undefined
  broadcastToAgent(agentId: string, event: SSEEvent): void
  getConnectionsByAgent(agentId: string): ActiveConnection[]
  closeAll(): void
}

interface ActiveConnection {
  id: string
  agentId: string
  controller: ReadableStreamDefaultController
  startTime: Date
  lastActivity: Date
}
```

### Testing Standards Summary

**Verification Requirements:**
1. Manual testing with curl: `curl -N http://localhost:42001/api/agents/test/observe`
2. Browser EventSource testing in console
3. Verify keep-alive messages arrive every ~30 seconds
4. Test multiple simultaneous connections
5. Verify proper cleanup on client disconnect
6. Test with slow connections to ensure buffering doesn't block

**Expected Behavior:**
- Immediate connection response with initial event
- Regular keep-alive comments (empty data lines with colon prefix)
- Clean connection close when client aborts
- No memory leaks from unclosed connections

---

## Dev Agent Guardrails

### Technical Requirements

**Next.js API Route Configuration:**
- Must set `export const runtime = 'nodejs'` - Edge runtime doesn't support streaming
- Use Route Handlers (App Router pattern)
- Return standard Response with ReadableStream body

**Response Headers (Required):**
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no  // Disable nginx buffering
```

**Keep-Alive Format:**
- Send colon-prefixed comments: `:keep-alive\n\n`
- Interval: 30 seconds (configurable via environment)
- Prevents proxy/load balancer from closing idle connections

### Architecture Compliance

**Streaming Response Pattern:**
```typescript
// Correct pattern for Next.js 15
const encoder = new TextEncoder()

const stream = new ReadableStream({
  start(controller) {
    // Send initial data
    controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

    // Setup cleanup
    return () => {
      // Cleanup resources
    }
  }
})

return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
```

**Do NOT use:**
- Express-style res.write() - Not available in Next.js App Router
- Server-Sent events libraries - Native implementation is sufficient
- WebSocket - SSE is simpler for one-way streaming

### Library/Framework Requirements

**No Additional Dependencies:**
- SSE uses native Web APIs (ReadableStream, TextEncoder)
- EventSource is built into browsers
- No external packages required

**Optional Development Dependencies:**
- `@types/node` - For TypeScript types (already installed)

### Testing Requirements

**Manual Testing Commands:**
```bash
# Test SSE endpoint with curl
curl -N http://localhost:42001/api/agents/test/observe

# Expected output:
# data: {"type":"connected","streamId":"..."}
#
# :keep-alive
#
# :keep-alive
#
```

**Browser Console Test:**
```javascript
const es = new EventSource('/api/agents/test/observe');
es.onmessage = (e) => console.log(JSON.parse(e.data));
es.onerror = (e) => console.error('Connection error:', e);
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 4 Objective:** Enable real-time visibility into agent execution progress

**Related Stories:**
- Story 4.2: Agent Progress Events - Defines event structure emitted through SSE
- Story 4.3: Progress Visualization UI - Consumes SSE events for display
- Story 4.4: Client-Side SSE Hook - React hook for SSE consumption

**SSE vs WebSocket Decision:**
- SSE chosen for one-way server-to-client streaming
- Simpler implementation, native browser support
- Automatic reconnection with EventSource
- HTTP-based, works through standard proxies

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation:** Complete

---

## References

**Source Documents:**
- [Backend Integration - SSE Streaming](../10-backend-integration.md#2-server-sent-events-sse-streaming) - SSE protocol design and implementation
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 4: Real-Time Observability - [epics.md#epic-4](../epics.md#epic-4-real-time-observability)
- Story 4.1 Details - [epics.md#story-41-sse-infrastructure](../epics.md#story-41-sse-infrastructure)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- SSE endpoint tested with curl: `curl -N http://localhost:42001/api/agents/osint-lead/observe`
- Keep-alive messages verified at 30-second intervals
- Connection cleanup verified on client disconnect

### Completion Notes List
- All 7 tasks completed successfully
- SSE infrastructure is ready for agent progress events (Story 4.2)
- StreamManager provides connection tracking and broadcast capabilities
- Unit tests added for helpers and stream-manager modules

### Code Review Findings (Fixed)
1. Removed unused encoder variable in route.ts
2. Fixed controller.error handling approach
3. Added unit tests for SSE module (helpers.test.ts, stream-manager.test.ts)
4. Updated story file with completion status

### File List
- `src/lib/sse/types.ts` - SSE types and constants
- `src/lib/sse/helpers.ts` - Event formatting and sending utilities
- `src/lib/sse/stream-manager.ts` - Connection management class
- `src/lib/sse/index.ts` - Module exports
- `src/app/api/agents/[agentId]/observe/route.ts` - SSE endpoint
- `src/lib/sse/__tests__/helpers.test.ts` - Unit tests for helpers
- `src/lib/sse/__tests__/stream-manager.test.ts` - Unit tests for stream manager
- `src/middleware.ts` - Updated to allow /observe endpoints (temporary, needs auth)
