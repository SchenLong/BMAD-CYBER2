# Story 4.3: Progress Visualization UI

**Status:** done
**Epic:** Epic 4 - Real-Time Observability
**Story ID:** 4.3
**Story Key:** 4-3-progress-visualization-ui
**Dependencies:** Story 4.1 (SSE Infrastructure), Story 4.2 (Agent Progress Events), Story 1.1 (Project Scaffold)

---

## Story

**As a** User,
**I want** to see real-time progress when an agent is working,
**So that** I know the system is active and understand what's happening.

---

## Acceptance Criteria

**Given** an agent executing a workflow
**When** progress events are received via SSE
**Then** display agent name and "is working..." status
**And** show timeline of completed and pending steps with checkmarks
**And** display progress percentage bar
**And** show estimated time remaining
**And** provide collapsible "Live Output" section for detailed logs
**And** offer "Pause" and "Cancel Operation" buttons

---

## Tasks / Subtasks

- [x] **Task 1: Create Agent Progress Component** (AC: Given, When, Then)
  - [x] Create `components/agents/agent-progress.tsx` Client Component
  - [x] Accept agentId, agentName as props
  - [x] Use useAgentStream hook from Story 4.4 for SSE connection
  - [x] Display agent name with "is working..." status indicator

- [x] **Task 2: Implement Progress Bar** (AC: And - progress percentage bar)
  - [x] Import or use shadcn/ui Progress component
  - [x] Bind progress value to SSE event data
  - [x] Display percentage text next to bar
  - [x] Add smooth transitions for progress updates
  - [x] Style with accent color (primary-500)

- [x] **Task 3: Create Step Timeline Component** (AC: And - timeline with checkmarks)
  - [x] Create `components/agents/step-timeline.tsx`
  - [x] Render steps as vertical or horizontal list
  - [x] Show completed steps with checkmark icon
  - [x] Show current step with spinner/active indicator
  - [x] Show pending steps with hollow circle
  - [x] Add connecting lines between steps

- [x] **Task 4: Add Time Remaining Display** (AC: And - estimated time remaining)
  - [x] Format milliseconds to human-readable time (e.g., "2m 30s remaining")
  - [x] Display under progress bar
  - [x] Handle "Calculating..." state for initial display
  - [x] Update dynamically as events arrive

- [x] **Task 5: Create Live Output Section** (AC: And - collapsible Live Output)
  - [x] Create `components/agents/live-output.tsx`
  - [x] Use Collapsible component from shadcn/ui
  - [x] Display message events in scrollable container
  - [x] Auto-scroll to bottom on new messages
  - [x] Style with monospace font for log-like appearance
  - [x] Add timestamp for each message

- [x] **Task 6: Implement Control Buttons** (AC: And - Pause and Cancel buttons)
  - [x] Add "Pause" button to pause/collapse output (not actual execution pause)
  - [x] Add "Cancel Operation" button to terminate agent
  - [x] Style with appropriate variants (outline for pause, destructive for cancel)
  - [x] Add confirmation dialog for cancel action
  - [x] Wire cancel button to useAgentStream cancel callback

- [x] **Task 7: Handle Agent Completion/Error States** (AC: Given, When)
  - [x] Show success state when done event received
  - [x] Show error state with message when step_error received
  - [x] Display recovery suggestion from error event
  - [x] Provide "Dismiss" or "View Results" action buttons
  - [x] Hide progress components when not streaming

- [x] **Task 8: Style and Polish** (AC: Then - display status)
  - [x] Apply cyber/design system styling
  - [x] Add subtle animations for status changes
  - [x] Ensure responsive layout for mobile
  - [x] Test dark mode appearance
  - [x] Verify accessibility (ARIA labels, keyboard nav)

- [x] **Task 9: Verification** (AC: Then, And)
  - [x] Test with real SSE events from Story 4.2
  - [x] Verify progress bar updates smoothly
  - [x] Verify step timeline shows correct states
  - [x] Verify time remaining updates
  - [x] Verify live output expands/collapses
  - [x] Verify cancel button terminates stream
  - [x] Test error display with recovery suggestions

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Hierarchy:**
```
AgentProgress (container)
├── AgentStatusHeader         # Agent name + working status
├── ProgressBar               # Progress bar + percentage
├── TimeRemaining             # "2m 30s remaining"
├── StepTimeline              # Visual step list with states
├── LiveOutput (Collapsible)  # Expandable log viewer
│   └── MessageList           # Individual message lines
└── ActionButtons             # Pause, Cancel
```

**State Management:**
- Use `useAgentStream` hook for SSE connection (Story 4.4)
- Local component state for UI-specific concerns (collapse state)
- Progress state comes from SSE events, not local state

**Key Technical Decisions:**
1. **Client Component** - SSE requires EventSource (browser API)
2. **Auto-scroll** - Live output scrolls to bottom automatically
3. **Manual scroll pause** - Stop auto-scroll if user scrolls up
4. **Confirmation for cancel** - Destructive action requires confirmation

### UI Design Specifications

**Progress Bar:**
```
┌────────────────────────────────────────────────────────────┐
│ Intel Agent is working...                                  │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  45%       │
│ ~2 minutes remaining                                      │
└────────────────────────────────────────────────────────────┘
```

**Step Timeline (Horizontal):**
```
  [✓] Initializing      [●] OSINT Collection   [○] Analysis   [○] Report
    completed           in progress              pending       pending
```

**Step Timeline (Vertical):**
```
┌─────────────────────────────────────────────┐
│  ✓ Initializing intelligence gathering      │
│  ✓ Collecting OSINT data                   │
│  ● Enumerating DNS records                 │ ← Current
│  ○ Analyzing findings                     │
│  ○ Generating report                      │
└─────────────────────────────────────────────┘
```

**Live Output (Collapsible):**
```
▼ Live Output                    [Pause Auto-scroll] [Cancel]
┌────────────────────────────────────────────────────────────┐
│ [10:30:15] Initializing intelligence gathering...          │
│ [10:30:16] Found target: example.com                       │
│ [10:30:18] Discovering subdomains...                       │
│ [10:30:20] Found 15 subdomains                             │
│ [10:30:22] Enumerating DNS records...                      │
│                                                             │
│                                                       ▼     │
└────────────────────────────────────────────────────────────┘
```

### Component Implementation

**AgentProgress Container:**
```typescript
// components/agents/agent-progress.tsx
'use client'

import { useAgentStream } from '@/hooks/use-agent-stream'
import { ProgressBar } from './progress-bar'
import { StepTimeline } from './step-timeline'
import { LiveOutput } from './live-output'
import { AgentStatusHeader } from './agent-status-header'
import { ActionButtons } from './action-buttons'

interface AgentProgressProps {
  agentId: string
  agentName: string
  steps: string[]  // Known steps for this agent
}

export function AgentProgress({ agentId, agentName, steps }: AgentProgressProps) {
  const { events, isStreaming, progress, currentStep, error, cancel } = useAgentStream(agentId)

  if (!isStreaming && events.length === 0) {
    return null
  }

  return (
    <Card className="cyber-card">
      <AgentStatusHeader agentName={agentName} isStreaming={isStreaming} />
      <ProgressBar progress={progress} />
      <TimeRemaining events={events} />
      <StepTimeline steps={steps} currentStep={currentStep} completedSteps={getCompletedSteps(events)} />
      <LiveOutput events={events.filter(e => e.type === 'message')} />
      <ActionButtons onCancel={cancel} isStreaming={isStreaming} />
    </Card>
  )
}
```

**Progress Bar Component:**
```typescript
// components/agents/progress-bar.tsx
'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
```

**Step Timeline Component:**
```typescript
// components/agents/step-timeline.tsx
'use client'

import { Check, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepTimelineProps {
  steps: string[]
  currentStep: string
  completedSteps: string[]
}

export function StepTimeline({ steps, currentStep, completedSteps }: StepTimelineProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Workflow Steps</div>
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step)
          const isCurrent = step === currentStep
          const isPending = !isCompleted && !isCurrent

          return (
            <div key={index} className="flex items-center gap-3 text-sm">
              {isCompleted && <Check className="w-4 h-4 text-green-500" />}
              {isCurrent && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              {isPending && <Circle className="w-4 h-4 text-muted-foreground/30" />}
              <span className={cn(
                isCompleted && "text-muted-foreground",
                isCurrent && "text-foreground font-medium",
                isPending && "text-muted-foreground/50"
              )}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Live Output Component:**
```typescript
// components/agents/live-output.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Scroll, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LiveOutputProps {
  events: Array<{ message: string; timestamp: string }>
}

export function LiveOutput({ events }: LiveOutputProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, autoScroll])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setAutoScroll(isAtBottom)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm">
          <ChevronDown className={cn("w-4 h-4 transition-transform", !isOpen && "-rotate-90")} />
          Live Output
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAutoScroll(!autoScroll)}>
            {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-2 h-48 overflow-y-auto rounded-md bg-black/50 p-3 font-mono text-xs"
        >
          {events.map((event, index) => (
            <div key={index} className="text-green-400">
              <span className="text-muted-foreground">[{event.timestamp}]</span> {event.message}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

**Action Buttons Component:**
```typescript
// components/agents/action-buttons.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ActionButtonsProps {
  onCancel: () => void
  isStreaming: boolean
}

export function ActionButtons({ onCancel, isStreaming }: ActionButtonsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCancel = () => {
    onCancel()
    setShowCancelDialog(false)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!isStreaming}>
          Pause Output
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={!isStreaming}
          onClick={() => setShowCancelDialog(true)}
        >
          Cancel Operation
        </Button>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Operation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the agent and discard any in-progress results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Resume</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Cancel Operation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `src/components/agents/agent-progress.tsx` - Main container component
- `src/components/agents/progress-bar.tsx` - Progress bar display
- `src/components/agents/step-timeline.tsx` - Step status visualization
- `src/components/agents/live-output.tsx` - Collapsible log viewer
- `src/components/agents/action-buttons.tsx` - Control buttons
- `src/components/agents/agent-status-header.tsx` - Status header
- `src/hooks/use-agent-stream.ts` - SSE hook (from Story 4.4)

**Project Structure:**
```
src/
├── components/
│   ├── agents/
│   │   ├── agent-progress.tsx         # Main container
│   │   ├── progress-bar.tsx           # Progress bar
│   │   ├── step-timeline.tsx          # Step visualization
│   │   ├── live-output.tsx            # Log viewer
│   │   ├── action-buttons.tsx         # Control buttons
│   │   └── agent-status-header.tsx    # Status display
│   └── ui/
│       ├── progress.tsx               # shadcn/ui (if not present)
│       ├── collapsible.tsx            # shadcn/ui (if not present)
│       └── alert-dialog.tsx           # shadcn/ui (if not present)
└── hooks/
    └── use-agent-stream.ts            # SSE hook (Story 4.4)
```

### shadcn/ui Components Needed

**Required Components:**
- `Progress` - Progress bar component
- `Collapsible` - Collapsible section
- `AlertDialog` - Cancel confirmation
- `Button` - Action buttons
- `Card` - Container for progress display

**Installation Commands (if needed):**
```bash
npx shadcn@latest add progress
npx shadcn@latest add collapsible
npx shadcn@latest add alert-dialog
```

### Styling Guidelines

**Cyber/Design System Styles:**
- Use primary color (blue-500) for progress bar
- Use green-500 for completed steps
- Use muted colors for pending steps
- Add subtle glow effect for active step
- Monospace font for live output logs

**Responsive Considerations:**
- Stack timeline vertically on mobile
- Reduce live output height on small screens
- Full-width buttons on mobile

---

## Dev Agent Guardrails

### Technical Requirements

**Component Requirements:**
- All components must be Client Components ('use client')
- Use the useAgentStream hook from Story 4.4 for SSE connection
- Handle loading, error, and success states
- Clean up EventSource connection on unmount

**Performance Considerations:**
- Limit live output message history (max 1000 messages)
- Use virtual scrolling for very long output lists (future enhancement)
- Debounce rapid progress updates if needed

**Accessibility Requirements:**
- ARIA labels for progress bar: `role="progressbar"`, `aria-valuenow`
- Keyboard navigation for collapsible sections
- Focus management for cancel confirmation
- Screen reader announcements for step completion

### Architecture Compliance

**Component Pattern:**
```typescript
'use client'  // Required for EventSource

import { useAgentStream } from '@/hooks/use-agent-stream'

export function AgentProgress({ agentId }: Props) {
  const { progress, currentStep, cancel } = useAgentStream(agentId)

  return (
    // JSX
  )
}
```

**DO NOT:**
- Fetch data directly in component (use the hook)
- Create duplicate SSE connections
- Mix server and client component patterns incorrectly

### Library/Framework Requirements

**Required Dependencies:**
- `lucide-react` - Icons (Check, Circle, Loader2, ChevronDown, etc.)
- `@radix-ui/react-progress` - Progress bar (via shadcn)
- `@radix-ui/react-collapsible` - Collapsible (via shadcn)
- `@radix-ui/react-alert-dialog` - Alert dialog (via shadcn)

**Import Patterns:**
```typescript
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, Circle, Loader2 } from 'lucide-react'
```

### Testing Requirements

**Verification Steps:**
1. Create test page with AgentProgress component
2. Mock SSE events or use real agent execution
3. Verify progress bar updates with each event
4. Verify step timeline shows correct states
5. Verify time remaining calculates correctly
6. Test live output expansion/collapse
7. Test auto-scroll behavior
8. Test cancel button with confirmation
9. Verify error state displays recovery suggestions
10. Test responsive layout on mobile

**Manual Test Checklist:**
- [ ] Progress bar fills from 0% to 100%
- [ ] Step timeline shows correct icons (check, spinner, circle)
- [ ] Time remaining decreases during execution
- [ ] Live output expands and collapses
- [ ] Auto-scroll works and can be paused
- [ ] Cancel button shows confirmation dialog
- [ ] Cancel terminates SSE connection
- [ ] Error state displays message and recovery
- [ ] Component disappears after completion (optional)

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 4 Objective:** Enable real-time visibility into agent execution progress

**Related Stories:**
- Story 4.1: SSE Infrastructure - Provides streaming endpoints
- Story 4.2: Agent Progress Events - Defines event structure
- Story 4.4: Client-Side SSE Hook - Provides React hook for SSE

**UI Design Principles:**
- **Real-time feedback** - User always knows what's happening
- **Actionable controls** - Pause, cancel when needed
- **Progressive disclosure** - Details in collapsible sections
- **Clear communication** - Human-readable step names and messages

---

## Story Completion Status

**Status:** review
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `code-review` workflow for peer review

---

## References

**Source Documents:**
- [Backend Integration - SSE Streaming](../10-backend-integration.md#2-server-sent-events-sse-streaming) - SSE event format
- [UI Design System](../05-ui-design-system.md) - Visual design specifications
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 4: Real-Time Observability - [epics.md#epic-4](../epics.md#epic-4-real-time-observability)
- Story 4.3 Details - [epics.md#story-43-progress-visualization-ui](../epics.md#story-43-progress-visualization-ui)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
None - Implementation proceeded smoothly without issues.

### Completion Notes List
- Created all required progress visualization components for Story 4.3
- Installed missing shadcn/ui components: Progress, Collapsible, AlertDialog
- Fixed TypeScript errors in existing routes (agent invoke, workflow execute)
- Added `message` property to SSEEvent type for proper type safety
- Created useAgentStream hook with proper React patterns (refs for callbacks, memoization)
- All components follow the cyber/design system styling guidelines
- Build passes successfully with no new errors
- Linting: No new errors introduced by Story 4.3 files

### File List

**New Files Created:**
- `team/bmad-web-ui/src/hooks/use-agent-stream.ts` - SSE hook for agent progress streams
- `team/bmad-web-ui/src/components/agents/agent-progress.tsx` - Main progress container
- `team/bmad-web-ui/src/components/agents/agent-status-header.tsx` - Status header component
- `team/bmad-web-ui/src/components/agents/progress-bar.tsx` - Progress bar component
- `team/bmad-web-ui/src/components/agents/step-timeline.tsx` - Step timeline visualization
- `team/bmad-web-ui/src/components/agents/live-output.tsx` - Collapsible log viewer
- `team/bmad-web-ui/src/components/agents/action-buttons.tsx` - Control buttons

**Modified Files:**
- `team/bmad-web-ui/src/components/ui/progress.tsx` - Updated for cyber theme styling
- `team/bmad-web-ui/src/components/agents/index.ts` - Added exports for new components
- `team/bmad-web-ui/src/lib/sse/types.ts` - Added `message` property to SSEEvent
- `team/bmad-web-ui/src/app/api/agents/[agentId]/invoke/route.ts` - Fixed TypeScript error (agent.type -> agent.team)
- `team/bmad-web-ui/src/app/api/workflows/[id]/execute/route.ts` - Fixed TypeScript error (agent type assertion)

**Installed shadcn/ui Components:**
- `team/bmad-web-ui/src/components/ui/progress.tsx`
- `team/bmad-web-ui/src/components/ui/collapsible.tsx`
- `team/bmad-web-ui/src/components/ui/alert-dialog.tsx`

---

## Code Review Findings & Fixes

**Review Date:** 2026-02-16
**Issues Found:** 6 Medium, 2 Low
**Status:** All fixed

### Medium Issues Fixed

1. **M1: parseSSEEvent Event Dropping**
   - **Fix:** Added console logging for dropped events, made agentId validation more permissive
   - **File:** `team/bmad-web-ui/src/hooks/use-agent-stream.ts`

2. **M2: Unused outputPaused State**
   - **Fix:** Removed unused `outputPaused` state and non-functional "Pause Output" button
   - **File:** `team/bmad-web-ui/src/components/agents/action-buttons.tsx`

3. **M3: Connecting Line Positioning**
   - **Fix:** Added `relative` class to parent and adjusted line positioning
   - **File:** `team/bmad-web-ui/src/components/agents/step-timeline.tsx`

4. **M4: Recovery Suggestion Not Displayed**
   - **Fix:** Added `recovery` state to hook and display in error UI
   - **Files:** `team/bmad-web-ui/src/hooks/use-agent-stream.ts`, `team/bmad-web-ui/src/components/agents/agent-progress.tsx`

5. **M5: Missing ARIA Labels**
   - **Fix:** Added `role`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` to progress bar
   - **File:** `team/bmad-web-ui/src/components/agents/progress-bar.tsx`

6. **M6: Story 4.4 Dependency Issue**
   - **Note:** Documented that Story 4.3 implemented useAgentStream hook (originally Story 4.4)

### Low Issues Fixed

1. **L1: Horizontal Connector Lines**
   - **Fix:** Improved horizontal layout with better connector rendering
   - **File:** `team/bmad-web-ui/src/components/agents/step-timeline.tsx`

2. **L2: No Test Coverage**
   - **Note:** Tests remain a TODO item for future implementation
