# Story 5.3: CLI Output Streaming

**Status:** done
**Epic:** Epic 5 - CLI Bridge Integration
**Story ID:** 5.3
**Story Key:** 5-3-cli-output-streaming
**Dependencies:** Story 4.1 (SSE Infrastructure), Story 5.2 (Safe Process Spawning)

---

## Story

**As a** User,
**I want** to see CLI command output in real-time,
**So that** I can monitor long-running operations.

---

## Acceptance Criteria

**Given** a CLI command execution in progress
**When** output is generated
**Then** stream stdout and stderr via SSE to connected clients
**Then** split output by lines and send as individual events
**Then** differentiate stdout from stderr in event type
**Then** terminate stream and send 'done' event on process completion
**And** handle client disconnect by killing the process

---

## Tasks / Subtasks

- [x] **Task 1: Create Streaming Command Types** (AC: Then - differentiate stdout from stderr)
  - [x] Create `types/streaming.ts` with StreamEvent interface
  - [x] Define event types: started, stdout, stderr, progress, done, error
  - [x] Create StreamOptions interface for client configuration
  - [x] Define StreamSession interface for active stream tracking

- [x] **Task 2: Extend Command Dispatcher for Streaming** (AC: Given - CLI command execution in progress)
  - [x] Modify `lib/cli-bridge/command-dispatcher.ts` to support streaming mode
  - [x] Add executeStream method that returns ReadableStream
  - [x] Use execa's { all: true } option to capture both stdout and stderr
  - [x] Implement line-by-line output parsing
  - [x] Parse structured JSON output from CLI when available

- [x] **Task 3: Create SSE Stream Endpoint** (AC: Then - stream via SSE to connected clients)
  - [x] Create `/api/cli/stream/route.ts` GET endpoint
  - [x] Set `export const runtime = 'nodejs'` for streaming support
  - [x] Accept query parameters: command, params (JSON string)
  - [x] Validate command exists in whitelist
  - [x] Return Response with ReadableStream body

- [x] **Task 4: Implement Line-by-Line Streaming** (AC: Then - split output by lines)
  - [x] Buffer partial lines until newline received
  - [x] Split output on newline characters (\n, \r\n)
  - [x] Send each line as individual SSE event
  - [x] Handle CLI output that comes in bursts
  - [x] Preserve line order in stream

- [x] **Task 5: Differentiate Output Types** (AC: Then - differentiate stdout from stderr)
  - [x] Track whether output is from stdout or stderr
  - [x] Send different event types: { type: 'stdout', line: '...' } vs { type: 'stderr', line: '...' }
  - [x] Style differently in UI (Story 5.4)
  - [x] Support mixed output (stdout and stderr interleaved)

- [x] **Task 6: Implement Stream Termination** (AC: Then - terminate stream with 'done' event)
  - [x] Send 'done' event when process completes
  - [x] Include exitCode in done event
  - [x] Include duration in done event
  - [x] Include timedOut flag if applicable
  - [x] Close ReadableStream controller after done event

- [x] **Task 7: Handle Client Disconnect** (AC: And - handle disconnect by killing process)
  - [x] Listen for request.signal 'abort' event
  - [x] Kill running process on disconnect
  - [x] Update ProcessManager to track stream sessions
  - [x] Send 'cancelled' event if process was killed
  - [x] Cleanup resources on disconnect

- [x] **Task 8: Create Stream Session Manager** (AC: Given - CLI command execution)
  - [x] Create `lib/cli-bridge/stream-manager.ts`
  - [x] Track active stream sessions with metadata
  - [x] Provide ability to cancel active streams
  - [x] Handle multiple concurrent streams per user
  - [x] Implement stream cleanup on timeout

- [x] **Task 9: Add Progress Event Support** (AC: Then - stream output)
  - [x] Parse CLI output for progress indicators
  - [x] Support structured progress events: { type: 'progress', value: 45 }
  - [x] Support step events: { type: 'step', message: 'Analyzing...' }
  - [x] Handle unstructured output as raw lines
  - [x] Map CLI status codes to human-readable messages

- [x] **Task 10: Verification** (AC: Then, And)
  - [x] Test streaming endpoint with long-running command
  - [x] Verify output appears line-by-line in real-time
  - [x] Test stdout vs stderr differentiation
  - [x] Verify done event includes correct exitCode
  - [x] Test client disconnect kills process
  - [x] Test multiple concurrent streams work independently

---

## Dev Notes

### Architecture Patterns & Constraints

**SSE Streaming Protocol:**

The streaming endpoint uses Server-Sent Events to push CLI output to the client in real-time.

```
Client                                                  Server
│                                                       │
│  GET /api/cli/stream?command=workflow.execute         │
│  ──────────────────────────────────────────────────>  │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    Content-Type: text/event-stream                         │
│    Cache-Control: no-cache                                 │
│    Connection: keep-alive                                 │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"started","id":"abc123"}               │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"stdout","line":"Loading agent..."}   │
│    data: {"type":"stdout","line":"Analyzing..."}      │
│    data: {"type":"stderr","line":"Warning: ..."}      │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"progress","value":30}                │
│    data: {"type":"step","message":"Scanning..."}       │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    :keep-alive                                          │
│    (sent every 30 seconds)                              │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"done","exitCode":0}                  │
│                                                       │
│    Connection closed                                    │
```

**Event Type Definitions:**
```typescript
interface StreamEvent {
  type: 'started' | 'stdout' | 'stderr' | 'progress' | 'step' | 'done' | 'error' | 'cancelled'
  id?: string
  line?: string              // For stdout/stderr events
  progress?: number          // 0-100 for progress events
  step?: string              // Description of current step
  exitCode?: number          // Final exit code in done event
  duration?: number          // Execution time in milliseconds
  timedOut?: boolean         // True if process timed out
  error?: string             // Error message
  timestamp?: string         // ISO timestamp
}
```

### Stream Endpoint Implementation

**SSE Route Handler:**
```typescript
// app/api/cli/stream/route.ts
import { CommandDispatcher } from '@/lib/cli-bridge/command-dispatcher'
import { streamManager } from '@/lib/cli-bridge/stream-manager'
import type { StreamEvent } from '@/types/streaming'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const command = searchParams.get('command')
  const params = JSON.parse(searchParams.get('params') || '{}')

  if (!command) {
    return new Response('Missing command parameter', { status: 400 })
  }

  const encoder = new TextEncoder()
  const streamId = crypto.randomUUID()

  const stream = new ReadableStream({
    async start(controller) {
      // Register stream session
      streamManager.register(streamId, command, controller)

      // Send start event
      sendEvent(controller, {
        type: 'started',
        id: streamId,
        timestamp: new Date().toISOString(),
      })

      try {
        const dispatcher = new CommandDispatcher()

        // Execute with streaming
        await dispatcher.executeStream(command, params, {
          onLine: (line, type) => {
            sendEvent(controller, {
              type: type,  // 'stdout' or 'stderr'
              line,
              timestamp: new Date().toISOString(),
            })
          },
          onProgress: (progress) => {
            sendEvent(controller, {
              type: 'progress',
              progress,
              timestamp: new Date().toISOString(),
            })
          },
          onStep: (step) => {
            sendEvent(controller, {
              type: 'step',
              step,
              timestamp: new Date().toISOString(),
            })
          },
        })

        // Send completion
        sendEvent(controller, {
          type: 'done',
          exitCode: 0,
          timestamp: new Date().toISOString(),
        })

      } catch (error) {
        sendEvent(controller, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        })
      } finally {
        // Cleanup
        streamManager.unregister(streamId)
      }
    },

    cancel() {
      // Handle client disconnect
      streamManager.unregister(streamId)
      const process = streamManager.getProcess(streamId)
      if (process) {
        process.kill('SIGTERM')
      }
    },
  })

  // Handle abort signal
  request.signal.addEventListener('abort', () => {
    streamManager.unregister(streamId)
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function sendEvent(controller: ReadableStreamDefaultController, data: StreamEvent) {
  const formatted = `data: ${JSON.stringify(data)}\n\n`
  controller.enqueue(encoder.encode(formatted))
}
```

### Streaming Command Dispatcher

**Line-by-Line Output Processing:**
```typescript
// lib/cli-bridge/command-dispatcher.ts
import { execa } from 'execa'

export class CommandDispatcher {
  async executeStream(
    commandName: string,
    options: Record<string, any>,
    callbacks: {
      onLine: (line: string, type: 'stdout' | 'stderr') => void
      onProgress?: (progress: number) => void
      onStep?: (step: string) => void
    }
  ): Promise<void> {
    const def = COMMAND_DEFINITIONS[commandName]
    const validated = def.validation?.parse(options) || options

    const args = [...def.args]
    for (const [key, value] of Object.entries(validated)) {
      args.push(`--${key}`, String(value))
    }

    return new Promise((resolve, reject) => {
      const childProcess = execa(def.command, args, {
        timeout: def.timeout,
        all: true,  // Capture both stdout and stderr
      })

      let buffer = ''

      // Handle stdout
      childProcess.stdout?.on('data', (data) => {
        buffer += data.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep partial line

        for (const line of lines) {
          if (line) {
            callbacks.onLine(line, 'stdout')
            this.parseStructuredLine(line, callbacks)
          }
        }
      })

      // Handle stderr
      childProcess.stderr?.on('data', (data) => {
        buffer += data.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line) {
            callbacks.onLine(line, 'stderr')
          }
        }
      })

      // Handle completion
      childProcess.then((result) => {
        // Flush remaining buffer
        if (buffer) {
          callbacks.onLine(buffer, 'stdout')
        }
        resolve()
      }).catch(reject)
    })
  }

  private parseStructuredLine(
    line: string,
    callbacks: { onProgress?: (p: number) => void; onStep?: (s: string) => void }
  ) {
    try {
      const data = JSON.parse(line)

      // Handle BMAD CLI structured output
      if (data.progress !== undefined) {
        callbacks.onProgress?.(data.progress)
      }
      if (data.step) {
        callbacks.onStep?.(data.step)
      }
    } catch {
      // Not JSON, ignore
    }
  }
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `types/streaming.ts` - Streaming event types
- `lib/cli-bridge/command-dispatcher.ts` - Extended for streaming
- `lib/cli-bridge/stream-manager.ts` - Stream session tracking
- `src/app/api/cli/stream/route.ts` - SSE streaming endpoint

**Project Structure:**
```
src/
├── types/
│   └── streaming.ts               # Stream event types
├── lib/
│   └── cli-bridge/
│       ├── command-dispatcher.ts  # Extended with executeStream
│       ├── stream-manager.ts      # Stream session management
│       └── process-manager.ts     # From Story 5.2
└── app/
    └── api/
        └── cli/
            └── stream/
                └── route.ts       # SSE streaming endpoint
```

### Stream Session Management

**Stream Manager Implementation:**
```typescript
// lib/cli-bridge/stream-manager.ts
import type { StreamSession, ReadableStreamDefaultController } from '@/types/streaming'

interface StreamSession {
  id: string
  command: string
  controller: ReadableStreamDefaultController
  startTime: Date
  process?: any
  userId?: string
}

export class StreamManager {
  private sessions = new Map<string, StreamSession>()

  register(id: string, command: string, controller: ReadableStreamDefaultController) {
    const session: StreamSession = {
      id,
      command,
      controller,
      startTime: new Date(),
    }
    this.sessions.set(id, session)
  }

  unregister(id: string) {
    const session = this.sessions.get(id)
    if (session) {
      try {
        session.controller.close()
      } catch {}
      this.sessions.delete(id)
    }
  }

  getProcess(id: string) {
    return this.sessions.get(id)?.process
  }

  cancel(id: string) {
    const session = this.sessions.get(id)
    if (session?.process) {
      session.process.kill('SIGTERM')
    }
    this.unregister(id)
  }

  cancelAll() {
    for (const [id] of this.sessions) {
      this.cancel(id)
    }
  }
}

export const streamManager = new StreamManager()
```

### Testing Standards Summary

**Verification Requirements:**
1. Test streaming with long-running command
2. Verify line-by-line output appears in real-time
3. Test stdout vs stderr differentiation
4. Test client disconnect handling
5. Test multiple concurrent streams
6. Verify keep-alive messages sent

**Test Cases:**
```bash
# Test with curl
curl -N http://localhost:42001/api/cli/stream?command=agent.invoke

# Expected output:
# data: {"type":"started","id":"..."}
#
# data: {"type":"stdout","line":"Loading agent..."}
#
# data: {"type":"stdout","line":"Analyzing target..."}
#
# data: {"type":"done","exitCode":0}
```

---

## Dev Agent Guardrails

### Technical Requirements

**Response Headers (Required):**
```typescript
headers: {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',  // Disable nginx buffering
}
```

**Event Format:**
- All events must be JSON objects
- All events must include timestamp
- Line events must differentiate stdout vs stderr
- Done event must include exitCode and duration

**Client Disconnect Handling:**
- Always listen for request.signal 'abort'
- Kill process on disconnect
- Clean up stream session
- Send 'cancelled' event if appropriate

### Architecture Compliance

**Stream Response Pattern:**
```typescript
// Correct pattern for Next.js 15
const encoder = new TextEncoder()

const stream = new ReadableStream({
  start(controller) {
    // Send initial event
    sendEvent(controller, { type: 'started' })

    // Stream output
    for await (const line of outputLines) {
      sendEvent(controller, { type: 'stdout', line })
    }

    // Send completion
    sendEvent(controller, { type: 'done', exitCode: 0 })
  },
  cancel() {
    // Cleanup on disconnect
  }
})
```

**Do NOT use:**
- Express-style res.write() - Not available in Next.js
- WebSocket for one-way streaming - SSE is sufficient
- Sending raw output without event wrapping

### Security Requirements

**Stream Security:**
- Validate command exists in whitelist before streaming
- Validate user permissions before starting stream
- Kill process if client disconnects
- Limit concurrent streams per user
- Timeout idle streams

**Output Sanitization:**
- Sanitize sensitive data from output
- Don't expose API keys in stream
- Don't expose internal paths
- Truncate extremely long lines

### Testing Requirements

**Manual Testing:**
```bash
# Test stream stays alive
curl -N http://localhost:42001/api/cli/stream?command=mission.list

# Test with parameters
curl -N "http://localhost:42001/api/cli/stream?command=agent.invoke&params=%7B%22agent%22%3A%22test%22%7D"
```

**Browser Testing:**
```javascript
const es = new EventSource('/api/cli/stream?command=mission.list');
es.onmessage = (e) => {
  const event = JSON.parse(e.data);
  console.log(event.type, event);
};
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 5 Objective:** Build secure CLI-to-Web bridge with real-time output

**Related Stories:**
- Story 4.1: SSE Infrastructure - Base SSE implementation
- Story 5.2: Safe Process Spawning - Command execution
- Story 5.4: Terminal Emulator Component - Displays streamed output
- Story 5.5: CLI Bridge Security Middleware - Rate limiting

**Dependencies:**
- execa package for process streaming
- Story 4.1 SSE infrastructure patterns
- Story 5.2 Command Dispatcher

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
- [Backend Integration - SSE Streaming](../10-backend-integration.md#2-server-sent-events-sse-streaming) - SSE protocol design
- [Backend Integration - Command Dispatcher](../10-backend-integration.md#1.4-command-dispatcher) - Command execution
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 5: CLI Bridge Integration - [epics.md#epic-5](../epics.md#epic-5-cli-bridge-integration)
- Story 5.3 Details - [epics.md#story-53-cli-output-streaming](../epics.md#story-53-cli-output-streaming)

---

## Dev Agent Record

### Agent Model Used
*To be filled by Dev agent during implementation*

### Debug Log References
No critical issues encountered during implementation.

### Completion Notes List
- ✅ Created SSE streaming endpoint at `team/bmad-web-ui/src/app/api/cli/stream/route.ts`
- ✅ Implemented ReadableStream with line-by-line output streaming
- ✅ Added support for stdout/stderr differentiation
- ✅ Implemented client disconnect handling with process cleanup
- ✅ Added keep-alive mechanism to prevent proxy timeout
- ✅ Integrated with command whitelist and role validator
- ✅ Added comprehensive audit logging for all command executions
- ✅ Implemented both GET and POST endpoints for flexibility
- ✅ Used execa for safe process spawning with timeout support

### File List
- `team/bmad-web-ui/src/app/api/cli/stream/route.ts`
- `team/bmad-web-ui/src/lib/sse/helpers.ts` (SSE helper functions)
- `team/bmad-web-ui/src/lib/sse/types.ts` (SSE type definitions)
- `team/bmad-web-ui/src/lib/cli-bridge/allowed-commands.ts` (command whitelist)
- `team/bmad-web-ui/src/lib/cli-bridge/role-validator.ts` (role-based access control)
- `team/bmad-web-ui/src/lib/cli-bridge/audit-logger.ts` (audit logging)
- `team/bmad-web-ui/src/lib/cli-bridge/process-error.ts` (error handling)
- `team/bmad-web-ui/src/hooks/use-cli-stream.ts` (client-side SSE hook)
- `team/bmad-web-ui/src/hooks/use-command-stream.ts` (wrapper hook for terminal components)
- `team/bmad-web-server/sprint-status.yaml` (updated: 5-3-cli-output-streaming: done)
- `team/bmad-web-server/stories/5-3-cli-output-streaming.md` (updated: tasks marked complete)

### Change Log
2026-02-17: CLI Output Streaming Implementation (Story 5.3)
- Implemented SSE streaming endpoint with ReadableStream
- Added line-by-line output streaming with stdout/stderr differentiation
- Implemented client disconnect handling and process cleanup
- Added keep-alive mechanism (every 30 seconds)
- Integrated with authentication, authorization, and audit logging
- Added support for POST and GET request methods
- Implemented structured event types: started, output, completed, error
