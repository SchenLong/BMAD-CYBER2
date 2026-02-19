# Story 4.2: Agent Progress Events

**Status:** done
**Epic:** Epic 4 - Real-Time Observability
**Story ID:** 4.2
**Story Key:** 4-2-agent-progress-events
**Dependencies:** Story 4.1 (SSE Infrastructure), Story 3.1 (Agent Integration)

---

## Story

**As a** System,
**I want** to emit structured progress events during agent execution,
**So that** the UI can display meaningful status updates.

---

## Acceptance Criteria

**Given** an agent being invoked
**When** the agent progresses through execution steps
**Then** emit events of types: step_start, step_complete, step_error, message, done
**And** each event includes agentId, agentName, step, progress (0-100), estimatedRemaining
**And** events are formatted as SSE data lines
**And** step events include human-readable step descriptions
**And** error events include error details and recovery suggestions

---

## Tasks / Subtasks

- [x] **Task 1: Define Agent Event Types** (AC: Then - event types)
  - [x] Create `AgentEventType` enum with: step_start, step_complete, step_error, message, done
  - [x] Create `AgentProgressEvent` interface with all required fields
  - [x] Create `AgentErrorEvent` interface extending base with error details
  - [x] Add types to `src/types/events.ts`

- [x] **Task 2: Create Event Emitter Utility** (AC: Given, When - emit events)
  - [x] Create `lib/agents/event-emitter.ts` with event broadcasting logic
  - [x] Implement emitProgressEvent function for agent updates
  - [x] Implement emitErrorEvent function for error conditions
  - [x] Integrate with StreamManager for SSE broadcasting

- [x] **Task 3: Define Agent Step Descriptions** (AC: And - human-readable steps)
  - [x] Create step description mapping for each agent type
  - [x] Define steps for Intel Agent: initialization, osint, analysis, reporting
  - [x] Define steps for Security Agent: scan, analysis, findings, report
  - [x] Define steps for IR Agent: triage, containment, investigation, recovery

- [x] **Task 4: Implement Progress Calculation** (AC: And - progress 0-100)
  - [x] Create calculateProgress helper with step weights
  - [x] Map step completion to percentage values
  - [x] Calculate estimated remaining time based on step duration
  - [x] Format estimated time as human-readable string

- [x] **Task 5: Format SSE Data Lines** (AC: And - SSE data lines)
  - [x] Create formatSSEEvent helper function
  - [x] Serialize events as JSON in data: lines
  - [x] Ensure proper line endings (\n\n) between events
  - [x] Handle special characters in event data

- [x] **Task 6: Integrate with Agent Invocation** (AC: Given - agent being invoked)
  - [x] Hook into agent execution start - emit step_start event
  - [x] Wrap agent step execution with progress events
  - [x] Emit step_complete on successful step completion
  - [x] Emit step_error with recovery suggestions on failure
  - [x] Emit done event on agent completion

- [x] **Task 7: Error Event Handling** (AC: And - error details and recovery)
  - [x] Define error categorization: timeout, connection, validation, execution
  - [x] Create recovery suggestion mapping for each error type
  - [x] Include stack trace in development mode
  - [x] Sanitize error messages for production (remove sensitive data)

- [x] **Task 8: Create Event Bus Integration** (AC: Then - emit events)
  - [x] Integrate event emitter with agent workflow execution
  - [x] Broadcast events to all connected SSE clients for agent
  - [x] Filter events by agentId for multi-client scenarios
  - [x] Queue events if no clients connected (optional)

- [x] **Task 9: Verification** (AC: Then, And)
  - [x] Test agent invocation generates proper event sequence
  - [x] Verify step_start events include correct step names
  - [x] Verify progress values increase monotonically
  - [x] Verify step_error events include recovery suggestions
  - [x] Verify done event includes final progress of 100
  - [x] Test multiple simultaneous agents emit to correct streams

---

## Dev Notes

### Architecture Patterns & Constraints

**Event Flow Architecture:**

```
Agent Execution          Event Emitter             StreamManager              Client
     │                          │                          │                    │
     │  Start execution         │                          │                    │
     ├─────────────────────────>│                          │                    │
     │                          │                          │                    │
     │  Step 1 start            │                          │                    │
     ├─────────────────────────>│                          │                    │
     │                          │  Broadcast event         │                    │
     │                          ├─────────────────────────>│                    │
     │                          │                          │  SSE data line      │
     │                          │                          ├───────────────────>│
     │                          │                          │                    │
     │  Step 1 complete         │                          │                    │
     ├─────────────────────────>│                          │                    │
     │                          │  Broadcast event         │                    │
     │                          ├─────────────────────────>│                    │
     │                          │                          │  SSE data line      │
     │                          │                          ├───────────────────>│
     │                          │                          │                    │
     │  ...more steps...        │                          │                    │
     │                          │                          │                    │
     │  Complete                │                          │                    │
     ├─────────────────────────>│                          │                    │
     │                          │  Broadcast done          │                    │
     │                          ├─────────────────────────>│                    │
     │                          │                          │  SSE data line      │
     │                          │                          ├───────────────────>│
```

**Key Technical Decisions:**
1. **Event-first design** - All agent progress goes through event emitter
2. **Agent-specific streams** - Events broadcast only to clients watching specific agent
3. **Human-readable steps** - Step names user-friendly, not technical
4. **Progress estimation** - Calculate both percentage and time remaining

### Event Type Definitions

**Base Event Interface:**
```typescript
interface BaseAgentEvent {
  type: AgentEventType
  agentId: string
  agentName: string
  timestamp: string
}

enum AgentEventType {
  STEP_START = 'step_start',
  STEP_COMPLETE = 'step_complete',
  STEP_ERROR = 'step_error',
  MESSAGE = 'message',
  DONE = 'done',
}
```

**Progress Event (step_start, step_complete):**
```typescript
interface AgentProgressEvent extends BaseAgentEvent {
  type: AgentEventType.STEP_START | AgentEventType.STEP_COMPLETE
  step: string              // Human-readable step name
  stepNumber: number        // Current step number (1-based)
  totalSteps: number        // Total steps in workflow
  progress: number          // 0-100
  estimatedRemaining: number // Milliseconds
  data?: unknown           // Optional step-specific data
}
```

**Error Event:**
```typescript
interface AgentErrorEvent extends BaseAgentEvent {
  type: AgentEventType.STEP_ERROR
  step: string
  error: string            // User-friendly error message
  errorType: string        // Technical error type
  recovery: string         // Suggested recovery action
  details?: string         // Additional error details
  stack?: string           // Stack trace (dev only)
}
```

**Message Event:**
```typescript
interface AgentMessageEvent extends BaseAgentEvent {
  type: AgentEventType.MESSAGE
  message: string
  level: 'info' | 'warning' | 'success'
  data?: unknown
}
```

**Done Event:**
```typescript
interface AgentDoneEvent extends BaseAgentEvent {
  type: AgentEventType.DONE
  progress: 100
  duration: number         // Total execution time in ms
  result?: unknown         // Optional result data
}
```

### Agent Step Definitions

**Intel Agent Steps:**
```typescript
const INTEL_AGENT_STEPS = [
  { id: 'init', name: 'Initializing intelligence gathering', weight: 10 },
  { id: 'osint', name: 'Collecting OSINT data', weight: 30 },
  { id: 'dns', name: 'Enumerating DNS records', weight: 15 },
  { id: 'subdomains', name: 'Discovering subdomains', weight: 15 },
  { id: 'analysis', name: 'Analyzing findings', weight: 20 },
  { id: 'report', name: 'Generating intelligence report', weight: 10 },
] as const
```

**Security Agent Steps:**
```typescript
const SECURITY_AGENT_STEPS = [
  { id: 'init', name: 'Initializing security assessment', weight: 10 },
  { id: 'recon', name: 'Performing reconnaissance', weight: 20 },
  { id: 'scan', name: 'Running vulnerability scan', weight: 30 },
  { id: 'analysis', name: 'Analyzing security findings', weight: 25 },
  { id: 'report', name: 'Generating security report', weight: 15 },
] as const
```

**IR Agent Steps:**
```typescript
const IR_AGENT_STEPS = [
  { id: 'triage', name: 'Triaging incident', weight: 15 },
  { id: 'containment', name: 'Implementing containment measures', weight: 25 },
  { id: 'investigation', name: 'Investigating root cause', weight: 30 },
  { id: 'eradication', name: 'Eradicating threat', weight: 15 },
  { id: 'recovery', name: 'Implementing recovery actions', weight: 15 },
] as const
```

### Progress Calculation

**Weight-Based Progress:**
```typescript
function calculateProgress(
  currentStepIndex: number,
  steps: readonly Step[]
): number {
  let progress = 0

  // Add completed steps' weights
  for (let i = 0; i < currentStepIndex; i++) {
    progress += steps[i].weight
  }

  // Add half of current step's weight (in-progress)
  progress += steps[currentStepIndex].weight / 2

  return Math.min(100, Math.round(progress))
}
```

**Time Estimation:**
```typescript
interface TimeEstimator {
  startTime: number
  steps: { id: string; startTime: number }[]

  getEstimatedRemaining(): number {
    if (this.steps.length < 2) return 0

    const recentSteps = this.steps.slice(-5)
    const avgStepDuration = recentSteps.reduce((sum, step, i, arr) => {
      if (i === 0) return 0
      return sum + (step.startTime - arr[i-1].startTime)
    }, 0) / (recentSteps.length - 1)

    const remainingSteps = TOTAL_STEPS - this.steps.length
    return avgStepDuration * remainingSteps
  }
}
```

### Event Emitter Implementation

**Core Emitter:**
```typescript
// lib/agents/event-emitter.ts
import { streamManager } from '@/lib/sse/stream-manager'
import type { AgentProgressEvent, AgentErrorEvent } from '@/types/events'

class AgentEventEmitter {
  emitStepStart(agentId: string, agentName: string, step: string, progress: number) {
    const event: AgentProgressEvent = {
      type: AgentEventType.STEP_START,
      agentId,
      agentName,
      step,
      progress,
      timestamp: new Date().toISOString(),
    }
    this.broadcast(agentId, event)
  }

  emitStepComplete(agentId: string, agentName: string, step: string, progress: number) {
    const event: AgentProgressEvent = {
      type: AgentEventType.STEP_COMPLETE,
      agentId,
      agentName,
      step,
      progress,
      timestamp: new Date().toISOString(),
    }
    this.broadcast(agentId, event)
  }

  emitError(agentId: string, agentName: string, step: string, error: Error) {
    const event: AgentErrorEvent = {
      type: AgentEventType.STEP_ERROR,
      agentId,
      agentName,
      step,
      error: error.message,
      errorType: error.constructor.name,
      recovery: this.getRecoverySuggestion(error),
      timestamp: new Date().toISOString(),
    }
    this.broadcast(agentId, event)
  }

  emitDone(agentId: string, agentName: string, duration: number) {
    const event: AgentDoneEvent = {
      type: AgentEventType.DONE,
      agentId,
      agentName,
      progress: 100,
      duration,
      timestamp: new Date().toISOString(),
    }
    this.broadcast(agentId, event)
  }

  private broadcast(agentId: string, event: AgentEvent) {
    streamManager.broadcastToAgent(agentId, formatSSEEvent(event))
  }

  private getRecoverySuggestion(error: Error): string {
    // Map error types to recovery suggestions
    const recoveryMap: Record<string, string> = {
      'TimeoutError': 'The operation timed out. Try reducing the scope or check network connectivity.',
      'ConnectionError': 'Failed to connect to target. Verify the target is accessible.',
      'ValidationError': 'Invalid input provided. Review your parameters and try again.',
      'NotFoundError': 'The requested resource was not found.',
    }
    return recoveryMap[error.constructor.name] || 'An error occurred. Please try again.'
  }
}

export const agentEventEmitter = new AgentEventEmitter()
```

### Integration with Agent Execution

**Wrapper Pattern:**
```typescript
async function executeAgentWithEvents(
  agentId: string,
  agentName: string,
  steps: Step[],
  executor: () => Promise<void>
) {
  const startTime = Date.now()
  const timeEstimator = new TimeEstimator()

  try {
    agentEventEmitter.emitStepStart(agentId, agentName, steps[0].name, 0)

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      timeEstimator.recordStep(step.id)

      const progress = calculateProgress(i, steps)
      const estimatedRemaining = timeEstimator.getEstimatedRemaining()

      agentEventEmitter.emitStepStart(
        agentId,
        agentName,
        step.name,
        progress,
        estimatedRemaining
      )

      try {
        await executeStep(step)
        agentEventEmitter.emitStepComplete(
          agentId,
          agentName,
          step.name,
          progress
        )
      } catch (error) {
        agentEventEmitter.emitError(agentId, agentName, step.name, error)
        throw error // Re-throw to stop execution
      }
    }

    const duration = Date.now() - startTime
    agentEventEmitter.emitDone(agentId, agentName, duration)

  } catch (error) {
    // Error already emitted, cleanup if needed
  }
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `src/types/events.ts` - Event type definitions
- `src/lib/agents/event-emitter.ts` - Event broadcasting logic
- `src/lib/agents/step-definitions.ts` - Agent step configurations
- `src/lib/agents/progress-calculator.ts` - Progress and time estimation
- `src/lib/agents/recovery-suggestions.ts` - Error recovery mapping
- `src/lib/sse/helpers.ts` - SSE event formatting

**Project Structure:**
```
src/
├── types/
│   └── events.ts                    # Event interfaces and enums
├── lib/
│   ├── agents/
│   │   ├── event-emitter.ts         # Event emitter singleton
│   │   ├── step-definitions.ts      # Agent step configs
│   │   ├── progress-calculator.ts   # Progress utilities
│   │   └── recovery-suggestions.ts  # Error recovery mapping
│   └── sse/
│       └── helpers.ts               # SSE formatting
```

### Error Recovery Suggestions

**Error Type Mapping:**
```typescript
const ERROR_RECOVERY_MAP: Record<string, string> = {
  // Network errors
  'ECONNREFUSED': 'Connection refused. Check if the target service is running and accessible.',
  'ETIMEDOUT': 'Connection timed out. The target may be unreachable or blocking connections.',
  'ENOTFOUND': 'Host not found. Verify the target hostname or IP address.',

  // CLI errors
  'CommandTimeout': 'The command took too long to complete. Try with a smaller scope.',
  'CommandNotFound': 'Required CLI tool not found. Ensure BMAD CLI is properly installed.',

  // Agent errors
  'AgentInitializationError': 'Failed to initialize agent. Check agent configuration.',
  'AgentExecutionError': 'Agent execution failed. Review agent logs for details.',

  // Validation errors
  'ValidationError': 'Input validation failed. Check your parameters and try again.',
  'SchemaError': 'Data structure error. Report this issue to the development team.',
}
```

---

## Dev Agent Guardrails

### Technical Requirements

**Event Format Requirements:**
- All events must include: type, agentId, agentName, timestamp
- Progress events must include: step, progress (0-100), estimatedRemaining
- Error events must include: error (user-friendly), recovery (actionable)
- Events are serialized as JSON in SSE data: lines

**Progress Calculation Rules:**
- Progress starts at 0, ends at 100
- Use weighted steps for accurate progress representation
- Show half-weight for current in-progress step
- Calculate estimated remaining based on recent step durations

**Step Description Guidelines:**
- Use user-friendly language, not technical jargon
- Format as verb+object: "Scanning target", "Analyzing results"
- Keep under 50 characters for UI display
- Use consistent naming across similar agent types

### Architecture Compliance

**Event Emitter Pattern:**
```typescript
// Singleton emitter for consistent broadcasting
export const agentEventEmitter = new AgentEventEmitter()

// Usage throughout codebase
import { agentEventEmitter } from '@/lib/agents/event-emitter'

agentEventEmitter.emitStepStart(agentId, agentName, step, progress)
```

**Error Handling Pattern:**
```typescript
try {
  await executeStep(step)
  agentEventEmitter.emitStepComplete(...)
} catch (error) {
  agentEventEmitter.emitError(...)
  // Decide whether to continue or abort
}
```

### Library/Framework Requirements

**No Additional Dependencies:**
- Event emitter uses native EventEmitter pattern or simple callback
- SSE formatting uses native JSON.stringify
- Progress calculation uses native Date and Math

**TypeScript Types:**
```typescript
// Required types to define
type AgentEventType = 'step_start' | 'step_complete' | 'step_error' | 'message' | 'done'

interface AgentEvent {
  type: AgentEventType
  agentId: string
  agentName: string
  timestamp: string
}
```

### Testing Requirements

**Verification Steps:**
1. Create test agent with 5 steps
2. Execute agent and verify event sequence
3. Check each event has required fields
4. Verify progress values: 0 -> 20 -> 40 -> 60 -> 80 -> 100
5. Test error path - verify step_error event emitted
6. Test error recovery suggestion is helpful
7. Verify estimated remaining time decreases over execution

**Sample Event Sequence:**
```json
{"type":"step_start","agentId":"intel-1","agentName":"Intel Agent","step":"Initializing intelligence gathering","progress":0}
{"type":"step_complete","agentId":"intel-1","agentName":"Intel Agent","step":"Initializing intelligence gathering","progress":10}
{"type":"step_start","agentId":"intel-1","agentName":"Intel Agent","step":"Collecting OSINT data","progress":10}
{"type":"message","agentId":"intel-1","agentName":"Intel Agent","message":"Found 15 subdomains"}
{"type":"step_complete","agentId":"intel-1","agentName":"Intel Agent","step":"Collecting OSINT data","progress":40}
...
{"type":"done","agentId":"intel-1","agentName":"Intel Agent","progress":100,"duration":15000}
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 4 Objective:** Enable real-time visibility into agent execution progress

**Related Stories:**
- Story 4.1: SSE Infrastructure - Provides the streaming mechanism for events
- Story 4.3: Progress Visualization UI - Consumes these events for display
- Story 4.4: Client-Side SSE Hook - React hook for event consumption

**Event Design Philosophy:**
- Human-readable first - technical details in separate fields
- Actionable error messages - tell user what to do next
- Consistent structure - all events share base fields
- Progress visibility - always show where we are in the workflow

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
- [Backend Integration - SSE Streaming](../10-backend-integration.md#2-server-sent-events-sse-streaming) - SSE event format
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 4: Real-Time Observability - [epics.md#epic-4](../epics.md#epic-4-real-time-observability)
- Story 4.2 Details - [epics.md#story-42-agent-progress-events](../epics.md#story-42-agent-progress-events)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- All tests passing: 102/102 tests passed in lib/agents test suite
- Tests cover: event-emitter, progress-calculator, recovery-suggestions, step-definitions
- Integration with existing SSE infrastructure verified

### Completion Notes List
- Task 1: Created AgentEventType enum and all event interfaces (AgentProgressEvent, AgentErrorEvent, AgentMessageEvent, AgentDoneEvent) in src/types/events.ts
- Task 2: Created AgentEventEmitter class with emitStepStart, emitStepComplete, emitError, emitMessage, emitDone methods in src/lib/agents/event-emitter.ts
- Task 3: Created step definitions for Intel, Security, IR, Legal, Strategy, BMM, BMGD agents in src/lib/agents/step-definitions.ts
- Task 4: Created TimeEstimator class and progress calculation utilities in src/lib/agents/progress-calculator.ts
- Task 5: Extended src/lib/sse/helpers.ts with agent-specific SSE formatting functions (formatAgentEvent, sendAgentEvent, createAgentEvent)
- Task 6: Integrated event emitter with agent invocation route (src/app/api/agents/[agentId]/invoke/route.ts) and workflow execute route (src/app/api/workflows/[id]/execute/route.ts)
- Task 7: Created error recovery suggestion mapping with 20+ error types in src/lib/agents/recovery-suggestions.ts
- Task 8: Created executeAgentWithEvents helper function for automatic event emission during agent execution
- Task 9: All tests passing (102/102) - comprehensive test coverage for all modules

### File List
- `src/types/events.ts` - Agent event type definitions (AgentEventType enum, AgentProgressEvent, AgentErrorEvent, AgentMessageEvent, AgentDoneEvent interfaces)
- `src/lib/agents/event-emitter.ts` - AgentEventEmitter class with progress event methods and executeAgentWithEvents helper
- `src/lib/agents/step-definitions.ts` - Step definitions for all agent types (Intel, Security, IR, Legal, Strategy, BMM, BMGD, Generic)
- `src/lib/agents/progress-calculator.ts` - TimeEstimator class and progress calculation utilities
- `src/lib/agents/recovery-suggestions.ts` - Error recovery suggestion mapping and sanitization functions
- `src/lib/agents/index.ts` - Module exports for all agent-related functionality
- `src/lib/sse/helpers.ts` - Extended with agent-specific SSE formatting functions
- `src/app/api/agents/[agentId]/invoke/route.ts` - Updated to emit progress events during agent invocation
- `src/app/api/workflows/[id]/execute/route.ts` - Updated to emit progress events during workflow execution
- `src/lib/agents/__tests__/event-emitter.test.ts` - Unit tests for event emitter (28 tests)
- `src/lib/agents/__tests__/progress-calculator.test.ts` - Unit tests for progress calculator (33 tests)
- `src/lib/agents/__tests__/recovery-suggestions.test.ts` - Unit tests for recovery suggestions (25 tests)
- `src/lib/agents/__tests__/step-definitions.test.ts` - Unit tests for step definitions (16 tests)
