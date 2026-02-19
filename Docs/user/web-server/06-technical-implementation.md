# BMAD Web Server - Technical Implementation Plan

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Technical Team:** Winston (Architect), Bastion (Security), Barry (Quick Flow Dev)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Technology Stack](#1-technology-stack) | 23-79 | Core technologies, rationale, installation commands |
| [2. Project Structure](#2-project-structure) | 83-176 | Enterprise-grade folder structure |
| [3. Frontend Architecture](#3-frontend-architecture) | 180-309 | Component architecture, routing, server actions |
| [4. Project Management System](#4-project-management-system) | 313-398 | Data model, API spec, specialized project UIs |
| [5. CLI-to-Web Bridge](#5-cli-to-web-bridge) | 402-558 | Bridge architecture, safe process spawning, SSE streaming |
| [6. State Management](#6-state-management) | 563-658 | Zustand store, TanStack Query |
| [7. Real-Time Communication](#7-real-time-communication) | 662-804 | SSE implementation, optional xterm.js terminal |
| [8. Security Implementation](#8-security-implementation) | 808-946 | CLI bridge security, prompt injection middleware |
| [9. Deployment Strategy](#9-deployment-strategy) | 950-1023 | Deployment options, Docker Compose, production checklist |
| [Appendix A: Dependencies](#appendix-a-key-dependencies) | 1026-1051 | package.json dependencies |
| [Appendix B: Development Workflow](#appendix-b-development-workflow) | 1054-1074 | Development commands |

---

## 1. Technology Stack

### 1.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15+ | React framework with App Router |
| **Language** | TypeScript | 5.3+ | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Component library (copy-paste model) |
| **State Management** | Zustand | 5.x | Client state |
| **Server State** | TanStack Query | 5.x | API caching, sync |
| **Forms** | React Hook Form + Zod | Latest | Form handling, validation |
| **Real-Time** | Server-Sent Events | Native | CLI output streaming |
| **Terminal** | xterm.js (optional) | 5.x | Full terminal emulation |

### 1.2 Rationale

**Next.js 15 App Router:**
- Server Components by default (better performance)
- Built-in API routes and Server Actions
- Excellent TypeScript support
- Great SEO capabilities (for marketing site)

**shadcn/ui:**
- Component ownership (copied to project, not dependency)
- Built on Radix UI (accessible primitives)
- CSS variables based (easy theming)
- Works seamlessly with App Router

**Zustand over Redux:**
- 1KB bundle size vs Redux's 15KB+
- Simpler API (no actions, reducers, boilerplate)
- TypeScript first-class support
- Works great with Server Components

### 1.3 Installation Commands

```bash
# Create Next.js project
npx create-next-app@latest bmad-web-ui --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Initialize shadcn/ui
npx shadcn@latest init

# Add core dependencies
npm install zustand @tanstack/react-query zod react-hook-form @hookform/resolvers

# Add CLI bridge dependencies
npm install execa execa

# Add terminal dependencies (optional, for full terminal)
npm install xterm xterm-addon-fit

# Add development dependencies
npm install -D @types/node
```

---

## 2. Project Structure

### 2.1 Enterprise-Grade Folder Structure

```
bmad-web-ui/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected dashboard
│   │   │   ├── missions/
│   │   │   ├── agents/
│   │   │   ├── workflows/
│   │   │   └── layout.tsx
│   │   ├── (install)/                # Install wizard
│   │   │   └── page.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── cli/                  # CLI bridge endpoints
│   │   │   │   ├── execute/route.ts
│   │   │   │   ├── stream/route.ts   # SSE streaming
│   │   │   │   └── status/route.ts
│   │   │   ├── agents/
│   │   │   ├── missions/
│   │   │   └── websocket/...          # Optional WebSocket
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css                # Global styles
│   │   └── error.tsx                  # Error boundary
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── forms/                     # Form components
│   │   │   ├── llm-config-form.tsx
│   │   │   ├── invite-user-form.tsx
│   │   │   └── settings-forms.tsx
│   │   ├── features/                  # Feature components
│   │   │   ├── mission-dashboard/
│   │   │   ├── agent-card/
│   │   │   ├── chat-interface/
│   │   │   ├── workflow-runner/
│   │   │   └── settings/
│   │   ├── layout/                    # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── command-palette.tsx
│   │   └── providers/                 # Context providers
│   │       ├── theme-provider.tsx
│   │       ├── query-provider.tsx
│   │       └── auth-provider.tsx
│   │
│   ├── lib/
│   │   ├── cli-bridge.ts              # CLI process management
│   │   ├── command-whitelist.ts       # Allowed commands
│   │   ├── api-client.ts              # API wrappers
│   │   ├── utils.ts                   # Utilities
│   │   └── types.ts                   # Shared types
│   │
│   ├── hooks/
│   │   ├── use-cli-stream.ts          # SSE hook for CLI output
│   │   ├── use-mutation.ts            # Optimistic updates
│   │   └── use-debounce.ts
│   │
│   ├── stores/
│   │   ├── mission-store.ts           # Mission state
│   │   ├── ui-store.ts               # UI state (modals, drawers)
│   │   └── user-store.ts             # User preferences
│   │
│   └── styles/
│       └── theme.css                  # Custom theme extensions
│
├── cli-bridge/                        # CLI bridge server (separate package)
│   ├── src/
│   │   ├── server.ts                  # Express/NestJS server
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── package.json
│
├── public/                            # Static assets
├── tests/                             # E2E tests
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Frontend Architecture

### 3.1 Component Architecture

**Server Components vs Client Components:**

```typescript
// ✅ Server Component (default)
// Used for: data fetching, static content, no interactivity
import { MissionList } from '@/components/features/mission-list'

export default function DashboardPage() {
  const missions = await fetchMissions() // Direct data fetching
  return <MissionList missions={missions} />
}

// ❌ Client Component (explicit "use client")
// Used for: interactivity, hooks, event handlers
"use client"

import { useState } from 'react'

export function MissionControls() {
  const [isActive, setIsActive] = useState(false)
  return <button onClick={() => setIsActive(!isActive)}>Toggle</button>
}
```

**Composition Pattern:**

```typescript
// Server Component wrapper
import { MissionChat } from '@/components/features/mission-chat/client'
import { AgentPanel } from '@/components/features/agent-panel'

export default function MissionDashboard({ params }: { params: { id: string } }) {
  const mission = await fetchMission(params.id)

  return (
    <div className="grid grid-cols-3 gap-6">
      <MissionChat missionId={mission.id} />
      <AgentPanel agents={mission.agents} />
    </div>
  )
}
```

### 3.2 Routing Architecture

**App Router Structure:**

```
/                    → Landing page (marketing)
/install             → Install wizard
/auth/login           → Login
/auth/callback        → OAuth callback
/dashboard           → Dashboard (protected)
/dashboard/missions  → Mission list (protected)
/missions/[id]       → Mission detail (protected)
/settings            → Settings (protected)
/api/*               → API routes
```

**Middleware for Route Protection:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/missions', '/settings']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('bmad-session')?.value

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 3.3 Server Actions for Mutations

```typescript
// app/actions/missions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateMissionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  agents: z.array(z.string()),
})

export async function createMission(formData: FormData) {
  const validated = CreateMissionSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    agents: formData.getAll('agents'),
  })

  // Call CLI bridge API
  const response = await fetch(`${process.env.CLI_BRIDGE_URL}/api/cli/mission/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  })

  const result = await response.json()

  revalidatePath('/dashboard/missions')
  return result
}
```

---

## 4. Project Management System

> **Detailed Specification:** See [07-project-management-system.md](./07-project-management-system.md) for complete data model, API specification, and security considerations.

### 4.1 Overview

A BMAD **Project** is the primary container for organizing multi-workflow engagements, team collaboration, and deliverable tracking. Unlike a "mission" (single workflow execution), a project spans the full lifecycle of a client engagement.

**Key Distinction:**
- **Mission/Workflow**: Single execution (e.g., "run threat-modeling")
- **Project**: Container for multiple workflows (e.g., "Acme Corp Security Assessment")

### 4.2 Routing Structure

Updated App Router structure with project management:

```
/                          → Landing page (marketing)
/install                   → Install wizard
/auth/login                 → Login
/auth/callback              → OAuth callback
/dashboard                  → Dashboard (protected)
/projects                  → Project list (protected)
/projects/new              → Create new project (protected)
/projects/[id]             → Project detail (protected)
  ├── /overview            → Project overview tab
  ├── /workflows           → Workflows tab
  ├── /artifacts           → Artifacts/evidence tab
  ├── /team                → Team management tab
  └── /deliverables        → Deliverables tracker tab
/agents                    → Agent catalog
/workflows                 → Workflow library (power user)
/settings                  → Settings (protected)
/api/*                     → API routes
```

### 4.3 Core Project Types

| Project Type | Use Case | Typical Workflows | Special Features |
|--------------|----------|------------------|------------------|
| `security-assessment` | Architecture reviews, pentests | Architecture review, threat modeling, vuln scan | Findings tracker, severity scoring |
| `incident-response` | Active incident handling | Incident response playbook | Timeline viz, evidence locker, team presence |
| `investigation` | OSINT, forensics | Flash assessment, attribution | Evidence chain of custody |
| `advisory` | Strategy, legal counsel | Strategic planning, board prep | Executive briefs, slide decks |
| `compliance` | Audit prep | Compliance audit prep | Control mapping, evidence collection |
| `training` | Security awareness | Security awareness training | Training materials, attendee tracking |

### 4.4 Project State Store (Zustand)

```typescript
// stores/project-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Project {
  id: string
  projectCode: string
  name: string
  type: ProjectType
  status: ProjectStatus
  phase: ProjectPhase
  ownerId: string
  teamMembers: ProjectMember[]
  workflowCount: number
  artifactCount: number
  createdAt: Date
  updatedAt: Date
}

interface ProjectState {
  // Data
  projects: Project[]
  activeProject: Project | null
  filters: {
    type?: ProjectType
    status?: ProjectStatus
    search?: string
  }

  // Actions
  setActiveProject: (id: string) => void
  setFilters: (filters: Partial<ProjectState['filters']>) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void

  // Computed
  filteredProjects: () => Project[]
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    projects: [],
    activeProject: null,
    filters: {},

    setActiveProject: (id) =>
      set((state) => {
        state.activeProject = state.projects.find((p) => p.id === id) || null
      }),

    setFilters: (newFilters) =>
      set((state) => {
        state.filters = { ...state.filters, ...newFilters }
      }),

    addProject: (project) =>
      set((state) => {
        state.projects.push(project)
      }),

    updateProject: (id, updates) =>
      set((state) => {
        const project = state.projects.find((p) => p.id === id)
        if (project) {
          Object.assign(project, updates)
        }
      }),

    removeProject: (id) =>
      set((state) => {
        state.projects = state.projects.filter((p) => p.id !== id)
        if (state.activeProject?.id === id) {
          state.activeProject = null
        }
      }),

    filteredProjects: () => {
      const { projects, filters } = get()
      return projects.filter((p) => {
        if (filters.type && p.type !== filters.type) return false
        if (filters.status && p.status !== filters.status) return false
        if (filters.search) {
          const search = filters.search.toLowerCase()
          return (
            p.name.toLowerCase().includes(search) ||
            p.projectCode.toLowerCase().includes(search)
          )
        }
        return true
      })
    },
  }))
)
```

### 4.5 Specialized Project UI Components

```typescript
// Incident Response Workspace
components/projects/specialized/IncidentWorkspace.tsx

interface IncidentWorkspaceProps {
  projectId: string
}

// Features:
// - Real-time team presence indicators
// - Timeline visualization with multi-contributor support
// - Evidence locker with hash verification
// - Stakeholder communication templates
// - Phase tracking (Identification → Containment → Eradication → Recovery)

// Penetration Test Tracker
components/projects/specialized/PentestTracker.tsx

interface PentestTrackerProps {
  projectId: string
}

// Features:
// - Findings tracker with severity (CVSS) scoring
// - Evidence capture (screenshots, PoC code)
// - Retesting workflow (findings → fixes → verification)
// - Executive summary + technical detail separation
```

### 4.6 Project API Endpoints

```typescript
// API Routes for Project Management

// GET /api/projects - List all projects with filtering
// GET /api/projects/[id] - Get project details
// POST /api/projects - Create new project
// PATCH /api/projects/[id] - Update project
// DELETE /api/projects/[id] - Soft delete project

// Workflow Management within Projects
// GET /api/projects/[id]/workflows - List project workflows
// POST /api/projects/[id]/workflows - Add workflow to project
// POST /api/projects/[id]/workflows/[workflowId]/execute - Execute workflow (SSE)

// Artifacts & Evidence
// GET /api/projects/[id]/artifacts - List project artifacts
// POST /api/projects/[id]/artifacts - Upload artifact
// GET /api/projects/[id]/artifacts/[artifactId]/download - Download with auth
// GET /api/projects/[id]/artifacts/[artifactId]/verify - Hash verification

// Team Management
// GET /api/projects/[id]/team - List project team
// POST /api/projects/[id]/team - Add team member
// PATCH /api/projects/[id]/team/[memberId] - Update member role
// DELETE /api/projects/[id]/team/[memberId] - Remove team member

// Deliverables
// GET /api/projects/[id]/deliverables - List deliverables
// POST /api/projects/[id]/deliverables - Create deliverable
// PATCH /api/projects/[id]/deliverables/[deliverableId] - Update status
```

---

## 5. CLI-to-Web Bridge

### 4.1 Bridge Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Web UI                                                 │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌──────────────┐  │
│  │ Mission Chat   │    │ Agent Cards    │    │ Settings     │  │
│  └────────┬───────┘    └────────┬───────┘    └──────┬───────┘  │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                                   │                            │
│                                   ▼                            │
│                        ┌─────────────────────┐                      │
│                        │ API Routes         │                      │
│                        │ /api/cli/*         │                      │
│                        └─────────┬───────────┘                      │
│                                  │                                 │
└──────────────────────────────────┼─────────────────────────────────┘
                                   │ HTTP
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLI Bridge Server (Express/NestJS)                            │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌──────────────┐  │
│  │ Command        │    │ Process         │    │ Stream       │  │
│  │ Whitelist      │───▶│ Manager        │───▶│ Controller    │  │
│  └────────────────┘    └────────────────┘    └──────────────┘  │
│                                  │                                 │
│                                  ▼                                 │
│                        ┌─────────────────────┐                      │
│                        │ BMAD CLI           │                      │
│                        │ bmad commands      │                      │
│                        └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Safe Process Spawning

```typescript
// lib/cli-bridge.ts
import { spawn } from 'child_process'
import { promisify } from 'util'

// Command whitelist - CRITICAL for security
const ALLOWED_COMMANDS = {
  'mission.list': {
    command: 'bmad',
    args: ['list', 'missions'],
    timeout: 30000,
    roles: ['user', 'admin'],
  },
  'mission.create': {
    command: 'bmad',
    args: ['mission', 'create'],
    timeout: 60000,
    roles: ['user', 'admin'],
  },
  'agent.invoke': {
    command: 'bmad',
    args: ['invoke'],
    timeout: 300000, // 5 minutes for agent execution
    roles: ['user', 'admin'],
  },
}

export interface CliResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

export async function executeCliCommand(
  commandName: string,
  options: Record<string, any> = {}
): Promise<CliResult> {
  const config = ALLOWED_COMMANDS[commandName]

  if (!config) {
    throw new Error(`Command '${commandName}' is not whitelisted`)
  }

  // Build args with options
  const args = [...config.args]
  if (options.title) args.push('--title', options.title)
  if (options.target) args.push('--target', options.target)

  return new Promise((resolve, reject) => {
    const proc = spawn(config.command, args, {
      shell: false, // CRITICAL: Never use shell: true
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: config.timeout,
      env: {
        ...process.env,
        BMAD_API_KEY: process.env.BMAD_API_KEY,
        BMAD_LLM_PROVIDER: options.llmProvider || 'openai',
      },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code })
    })

    proc.on('error', (error) => {
      reject(error)
    })
  })
}
```

### 4.3 Streaming with Server-Sent Events

```typescript
// app/api/cli/stream/route.ts
import { NextRequest } from 'next/server'
import { spawn } from 'child_process'

export const runtime = 'nodejs' // Required for streaming

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const command = searchParams.get('command')

  if (!command || !ALLOWED_COMMANDS[command]) {
    return new Response('Command not allowed', { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const config = ALLOWED_COMMANDS[command]
      const proc = spawn(config.command, config.args, {
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      // Stream stdout
      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stdout', line })}\n\n`))
        }
      })

      // Stream stderr
      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stderr', line })}\n\n`))
        }
      })

      // Handle completion
      proc.on('close', (code) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', code })}\n\n`))
        controller.close()
      })

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        proc.kill('SIGTERM')
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**Client-side SSE Hook:**

```typescript
// hooks/use-cli-stream.ts
'use client'

import { useEffect, useState, useRef } from 'react'

interface StreamEvent {
  type: 'stdout' | 'stderr' | 'done'
  line?: string
  code?: number
}

export function useCliStream(command: string, enabled = true) {
  const [output, setOutput] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled || !command) return

    setIsStreaming(true)
    setOutput([])
    setError(null)

    const eventSource = new EventSource(`/api/cli/stream?command=${command}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data: StreamEvent = JSON.parse(event.data)

      if (data.type === 'stdout' || data.type === 'stderr') {
        setOutput((prev) => [...prev, data.line || ''])
      } else if (data.type === 'done') {
        setIsStreaming(false)
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      setError('Connection lost')
      setIsStreaming(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [command, enabled])

  const cancel = () => {
    eventSourceRef.current?.close()
    setIsStreaming(false)
  }

  return { output, isStreaming, error, cancel }
}
```

---

## 5. State Management

### 5.1 Zustand Store Structure

```typescript
// stores/mission-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Mission {
  id: string
  title: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  agents: string[]
  output: string[]
}

interface MissionState {
  missions: Mission[]
  activeMission: Mission | null
  isExecuting: boolean

  // Actions
  setActiveMission: (id: string) => void
  addMission: (mission: Mission) => void
  updateMissionStatus: (id: string, status: Mission['status']) => void
  appendOutput: (missionId: string, line: string) => void
  clearActiveMission: () => void
}

export const useMissionStore = create<MissionState>()(
  immer((set, get) => ({
    missions: [],
    activeMission: null,
    isExecuting: false,

    setActiveMission: (id) =>
      set((state) => {
        state.activeMission = state.missions.find((m) => m.id === id) || null
      }),

    addMission: (mission) =>
      set((state) => {
        state.missions.push(mission)
      }),

    updateMissionStatus: (id, status) =>
      set((state) => {
        const mission = state.missions.find((m) => m.id === id)
        if (mission) mission.status = status
      }),

    appendOutput: (missionId, line) =>
      set((state) => {
        const mission = state.missions.find((m) => m.id === missionId)
        if (mission) mission.output.push(line)
      }),

    clearActiveMission: () =>
      set((state) => {
        state.activeMission = null
        state.isExecuting = false
      }),
  }))
)
```

### 5.2 Server State with TanStack Query

```typescript
// lib/api-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchMissions() {
  const res = await fetch(`${API_BASE}/api/missions`)
  if (!res.ok) throw new Error('Failed to fetch missions')
  return res.json()
}

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/api/agents`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}
```

---

## 6. Real-Time Communication

### 6.1 Communication Strategy

| Use Case | Technology | Rationale |
|----------|-----------|-----------|
| CLI output streaming | Server-Sent Events | Simple, HTTP-based, one-way |
| Agent status updates | SSE + polling | Periodic sync for state changes |
| Full terminal (optional) | WebSocket + xterm.js | Bidirectional for interactive shells |

### 6.2 SSE Implementation

**Server-side (API Route):**

```typescript
// app/api/events/route.ts
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// Store active connections
const connections = new Map<string, ReadableStream>()

export async function GET(req: NextRequest) {
  const clientId = crypto.randomUUID()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      connections.set(clientId, controller)

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`))

      // Keep-alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'))
      }, 30000)

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        connections.delete(clientId)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Helper to broadcast to all clients
export function broadcastEvent(event: any) {
  const encoder = new TextEncoder()
  const message = `data: ${JSON.stringify(event)}\n\n`

  for (const controller of connections.values()) {
    try {
      controller.enqueue(encoder.encode(message))
    } catch (err) {
      // Connection closed, will be cleaned up
    }
  }
}
```

### 6.3 Optional: Full Terminal with xterm.js

**Terminal Component:**

```typescript
// components/features/terminal/terminal.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalProps {
  wsUrl: string
}

export function WebTerminal({ wsUrl }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      theme: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        cursor: '#8B5CF6',
        selection: 'rgba(139, 92, 246, 0.3)',
      },
    })

    const fitAddon = new FitAddon()
    terminal.current.loadAddon(fitAddon)

    terminal.current.open(terminalRef.current)
    fitAddon.fit()

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      terminal.current?.writeln('\x1b[32m✓ Connected to BMAD CLI\x1b[0m\r\n')
    }

    ws.onmessage = (event) => {
      terminal.current?.write(event.data)
    }

    terminal.current.onData((data) => {
      ws.send(data)
    }

    ws.onclose = () => {
      terminal.current?.writeln('\x1b[31m✗ Connection closed\x1b[0m\r\n')
    }

    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      ws.close()
      terminal.current?.dispose()
      window.removeEventListener('resize', handleResize)
    }
  }, [wsUrl])

  return <div ref={terminalRef} className="h-full w-full" />
}
```

---

## 7. Security Implementation

### 7.1 CLI Bridge Security Checklist

| Threat | Mitigation |
|--------|-----------|
| **Command Injection** | Whitelist-only commands, array arguments, never shell: true |
| **Resource Exhaustion** | Concurrency limits, per-user rate limits, process timeouts |
| **Privilege Escalation** | Run as non-root, container isolation optional |
| **Data Exfiltration** | Sanitize output, mask secrets, limit buffer sizes |
| **Unauthorized Access** | JWT authentication, role-based permissions |
| **CSRF** | SameSite cookies, CSRF tokens for mutations |

### 7.2 CLI Bridge Security Middleware

```typescript
// cli-bridge/middleware/security.ts
import { Request, Response, NextFunction } from 'express'

// Rate limiting
import rateLimit from 'express-rate-limit'

export const cliRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 commands per minute
  message: { error: 'Too many CLI requests' },
  standardHeaders: true,
})

// Command whitelist validation
export function validateCommand(req: Request, res: Response, next: NextFunction) {
  const { command } = req.params

  if (!ALLOWED_COMMANDS[command]) {
    return res.status(404).json({ error: 'Command not found' })
  }

  req.commandConfig = ALLOWED_COMMANDS[command]
  next()
}

// JWT authentication
export function authenticateCli(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Role-based authorization
export function authorizeCommand(req: Request, res: Response, next: NextFunction) {
  const userRoles = (req as any).user?.roles || []
  const allowedRoles = (req as any).commandConfig?.roles || []

  const hasPermission = userRoles.some((role: string) => allowedRoles.includes(role))

  if (!hasPermission) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      required: allowedRoles
    })
  }

  next()
}

// Audit logging
export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      user: (req as any).user?.id,
      command: req.params.command,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }

    // Write to audit log
    console.log('[AUDIT]', JSON.stringify(logEntry))

    next()
  }
}
```

### 7.3 Prompt Injection Defense Middleware

```typescript
// middleware/prompt-injection.ts
import { NextRequest, NextResponse } from 'next/server'

const PROMPT_INJECTION_PATTERNS = [
  /<system|instruction|admin|agent>/i,
  /<(\s*)*immediate\s*\*>/i,
  /ignore\s+(previous|above)/i,
  /pretend\s+(to be|you are)/i,
  /jailbreak/i,
  /developer\s+mode/i,
  /\[INSTRUCTION\]/i,
  /\[SYSTEM\]/i,
]

export function detectPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input))
}

export async function promptInjectionMiddleware(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()

  const body = await req.json().catch(() => ({}))
  const userInput = body.message || body.prompt || body.input || ''

  if (detectPromptInjection(userInput)) {
    return NextResponse.json(
      { error: 'Invalid input detected' },
      { status: 400 }
    )
  }

  // Add sanitized flag for downstream processing
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-prompt-sanitized', 'true')

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}
```

---

## 8. Deployment Strategy

### 8.1 Deployment Options

| Environment | Recommendation |
|-------------|----------------|
| **Local Development** | `npm run dev` (Next.js) + CLI bridge on separate port |
| **Self-Hosted (Single Server)** | Docker Compose with nginx reverse proxy |
| **Cloud (VPS)** | DigitalOcean, AWS Lightsail, similar |
| **Enterprise** | Kubernetes with Helm charts (future) |

### 8.2 Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  web-ui:
    build:
      context: ./bmad-web-ui
      dockerfile: Dockerfile
    ports:
      - "42001:42001"
    environment:
      - NEXT_PUBLIC_API_URL=http://cli-bridge:4000
      - NEXT_PUBLIC_APP_URL=http://localhost:42001
      - NODE_ENV=production
    depends_on:
      - cli-bridge
    restart: unless-stopped

  cli-bridge:
    build:
      context: ./cli-bridge
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - BMAD_CLI_PATH=/usr/local/bin/bmad
    volumes:
      - /usr/local/bin/bmad:/usr/local/bin/bmad:ro
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web-ui
    restart: unless-stopped
```

### 8.3 Production Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting enabled
- [ ] Audit logging configured
- [ ] Database backups scheduled
- [ ] Error monitoring (Sentry) configured
- [ ] Health check endpoints functional
- [ ] Log rotation configured
- [ ] Security headers enabled
- [ ] CSP policies configured

---

## Appendix A: Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "execa": "^9.0.0",
    "xterm": "^5.0.0",
    "xterm-addon-fit": "^0.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

---

## Appendix B: Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Start development servers
npm run dev           # Next.js on :42001
npm run dev:bridge    # CLI bridge on :4000

# 3. Run tests
npm run test
npm run test:e2e

# 4. Build for production
npm run build

# 5. Start production
npm run start
```

---

**Document Status:** ✅ Complete
**Next Phase:** Frontend Implementation Sprint
