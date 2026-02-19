# BMAD Web Server - Frontend Architecture

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Technical Team:** Winston (Architect), Barry (Quick Flow Dev)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Next.js 15 App Router Structure](#1-nextjs-15-app-router-structure) | 18-150 | Complete app directory layout and routing |
| [2. Server vs Client Components](#2-server-vs-client-components) | 154-280 | When to use each, composition patterns |
| [3. Data Fetching Patterns](#3-data-fetching-patterns) | 284-420 | Server components, Server Actions, API routes |
| [4. State Management Architecture](#4-state-management-architecture) | 424-560 | Zustand stores, TanStack Query, forms |
| [5. Component Architecture](#5-component-architecture) | 564-720 | Composition patterns, shared layouts |
| [6. Real-Time Features](#6-real-time-features) | 724-820 | SSE streaming, WebSocket patterns |
| [7. Performance Optimizations](#7-performance-optimizations) | 824-900 | Suspense, streaming SSR, caching |
| [8. Error Handling & Boundaries](#8-error-handling--boundaries) | 904-980 | Error boundaries, not-found, loading states |

---

## 1. Next.js 15 App Router Structure

### 1.1 Complete App Directory Layout

```
src/app/
├── (auth)/                          # Auth route group (public layouts)
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── register/
│   │   └── page.tsx                 # Registration page
│   ├── forgot-password/
│   │   └── page.tsx                 # Password reset
│   └── layout.tsx                   # Auth-specific layout (minimal)
│
├── (dashboard)/                    # Protected dashboard route group
│   ├── page.tsx                     # Dashboard home
│   ├── projects/                    # Project management
│   │   ├── page.tsx                 # Project list
│   │   ├── new/
│   │   │   └── page.tsx             # Project creation wizard
│   │   └── [id]/
│   │       ├── page.tsx             # Project detail (overview tab)
│   │       ├── workflows/
│   │       │   └── page.tsx         # Workflows tab
│   │       ├── artifacts/
│   │       │   └── page.tsx         # Artifacts/evidence tab
│   │       ├── team/
│   │       │   └── page.tsx         # Team management tab
│   │       └── deliverables/
│   │           └── page.tsx         # Deliverables tracker tab
│   ├── agents/                      # Agent catalog
│   │   ├── page.tsx                 # Agent list
│   │   └── [id]/
│   │       └── page.tsx             # Agent detail
│   ├── workflows/                   # Workflow library (power user)
│   │   └── page.tsx
│   ├── settings/                    # Settings
│   │   ├── page.tsx                 # General settings
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── llm/
│   │   │   └── page.tsx             # LLM provider settings
│   │   └── organization/
│   │       └── page.tsx             # Org settings (admin)
│   └── layout.tsx                   # Dashboard layout with sidebar
│
├── (install)/                       # Install wizard (public)
│   └── page.tsx                     # Installation guide
│
├── (marketing)/                     # Public marketing pages
│   ├── page.tsx                     # Landing page
│   ├── features/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   └── docs/
│       └── [...path]                # Catchall for docs
│           └── page.tsx
│
├── api/                             # API routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── refresh/route.ts
│   │   └── callback/route.ts        # OAuth callback
│   ├── projects/
│   │   ├── route.ts                 # GET (list), POST (create)
│   │   ├── [id]/route.ts            # GET, PATCH, DELETE
│   │   ├── [id]/workflows/route.ts  # Workflow management
│   │   ├── [id]/artifacts/route.ts # File uploads
│   │   ├── [id]/team/route.ts       # Team management
│   │   └── [id]/deliverables/route.ts
│   ├── agents/
│   │   ├── route.ts                 # Agent catalog
│   │   └── [id]/invoke/route.ts     # Agent invocation
│   ├── workflows/
│   │   ├── route.ts                 # Workflow list
│   │   └── [id]/execute/route.ts    # Workflow execution (SSE)
│   ├── cli/
│   │   ├── execute/route.ts         # CLI bridge execution
│   │   ├── stream/route.ts          # SSE streaming endpoint
│   │   └── status/route.ts          # CLI status check
│   └── upload/
│       └── route.ts                 # File upload handler
│
├── actions/                         # Server Actions (mutations)
│   ├── projects.ts                  # Project CRUD actions
│   ├── workflows.ts                 # Workflow execution actions
│   ├── artifacts.ts                 # Artifact upload actions
│   └── auth.ts                      # Auth server actions
│
├── layout.tsx                       # Root layout
├── page.tsx                         # Root page (redirects to dashboard or marketing)
├── globals.css                      # Global styles + Tailwind
├── error.tsx                        # Global error boundary
├── not-found.tsx                    # 404 page
└── loading.tsx                      # Global loading UI
```

### 1.2 Route Groups Explained

Next.js 15 route groups `(name)` allow organizing files without affecting URL structure:

| Route Group | Purpose | Layout |
|------------|---------|--------|
| `(auth)` | Public auth pages | Minimal layout, no sidebar |
| `(dashboard)` | Protected app pages | Full layout with sidebar, requires auth |
| `(install)` | Install wizard | Standalone layout |
| `(marketing)` | Public pages | Marketing layout with CTA |

**Why Route Groups?**
- Share layouts between routes without affecting URL
- Separate public vs protected routes at file level
- Middleware can protect entire route groups

### 1.3 Route Protection Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes require authentication
const protectedRoutes = ['/dashboard', '/projects', '/agents', '/workflows', '/settings']
const publicRoutes = ['/login', '/register', '/install', '/api/auth']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for session token
  const token = req.cookies.get('bmad-session')?.value

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isPublicRoute && token && !pathname.includes('/logout')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico).*)'],
}
```

### 1.4 Root Layout Structure

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'BMAD - Multi-Domain Agent Defense',
  description: 'AI-powered security, intelligence, and strategy framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 2. Server vs Client Components

### 2.1 Component Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│  Does this component need interactivity?                        │
│  (hooks, event handlers, state)                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
            ┌──────────────┴──────────────┐
            │ NO                           │ YES
            ▼                              ▼
    Server Component                Client Component
    (Default)                       (add "use client")
```

### 2.2 Server Components (Default)

**Use for:**
- Data fetching (direct database access)
- Static content
- Rendering child components
- Keeping sensitive data on server

**Example: Project List**

```typescript
// app/(dashboard)/projects/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { ProjectList } from '@/components/projects/project-list'
import { ProjectFilters } from '@/components/projects/project-filters'

// Server Component - can directly access database
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; search?: string }
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  // Direct database access in Server Component
  const projects = await db.project.findMany({
    where: {
      ownerId: session.user.id,
      ...(searchParams.type && { type: searchParams.type }),
      ...(searchParams.status && { status: searchParams.status }),
      deletedAt: null,
    },
    include: {
      teamMembers: true,
      workflows: true,
      _count: { select: { artifacts: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <NewProjectButton />
      </div>

      <ProjectFilters currentFilters={searchParams} />
      <ProjectList projects={projects} />
    </div>
  )
}
```

### 2.3 Client Components

**Use for:**
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect, useRef)
- Browser APIs (localStorage, window)
- Interactive UI elements

**Example: Project Card with Actions**

```typescript
// components/projects/project-card.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    status: string
    type: string
    updatedAt: Date
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <Badge variant="secondary">{project.status}</Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
```

### 2.4 Composition Pattern

**Server Component wrapper, Client Component children:**

```typescript
// app/(dashboard)/projects/[id]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ProjectHeader } from '@/components/projects/project-header'
import { ProjectTabs } from '@/components/projects/project-tabs'
import { ProjectWorkflowList } from '@/components/projects/project-workflow-list'
import { AddWorkflowDialog } from '@/components/projects/add-workflow-dialog'

async function getProject(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      teamMembers: { include: { user: true } },
      workflows: { orderBy: { createdAt: 'desc' } },
      artifacts: true,
      deliverables: true,
    },
  })
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) return notFound()

  return (
    <div className="container">
      {/* Server Component: Static header */}
      <ProjectHeader project={project} />

      {/* Client Component: Interactive tabs */}
      <ProjectTabs projectId={project.id}>
        {/* Server Component: List of workflows */}
        <ProjectWorkflowList workflows={project.workflows} />
      </ProjectTabs>

      {/* Client Component: Interactive add button */}
      <AddWorkflowDialog projectId={project.id} />
    </div>
  )
}
```

### 2.5 Passing Server Data to Client

```typescript
// ⚠️ DON'T: Pass entire database rows to client
export default function Page({ projects }: { projects: Project[] }) {
  return <ClientComponent allData={projects} />
}

// ✅ DO: Pass only what's needed
export default function Page({ projects }: { projects: Project[] }) {
  const summaries = projects.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
  }))
  return <ClientComponent summaries={summaries} />
}
```

---

## 3. Data Fetching Patterns

### 3.1 Server Component Data Fetching

**Pattern: Direct database access**

```typescript
// lib/queries/projects.ts
import { cache } from 'react'
import { db } from '@/lib/db'

// Cache function to prevent duplicate queries in same request
export const getProject = cache(async (id: string) => {
  return db.project.findUnique({
    where: { id },
    include: {
      teamMembers: true,
      workflows: {
        include: { _count: { select: { artifacts: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { artifacts: true, deliverables: true } },
    },
  })
}, 'getProject')

export const listProjects = cache(async (userId: string) => {
  return db.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { teamMembers: { some: { userId } } },
      ],
      deletedAt: null,
    },
    include: {
      teamMembers: true,
      _count: { select: { workflows: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}, 'listProjects')
```

### 3.2 Server Actions (Mutations)

**Pattern: Server Actions for data mutations**

```typescript
// app/actions/projects.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const CreateProjectSchema = z.object({
  name: z.string().min(3).max(100),
  type: z.enum(['security-assessment', 'incident-response', 'investigation', 'advisory']),
  description: z.string().optional(),
  clientName: z.string().optional(),
})

export async function createProject(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  // Validate and parse form data
  const validated = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description'),
    clientName: formData.get('clientName'),
  })

  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  // Create project in database
  const project = await db.project.create({
    data: {
      name: validated.data.name,
      type: validated.data.type,
      description: validated.data.description,
      clientName: validated.data.clientName,
      ownerId: session.user.id,
      projectCode: generateProjectCode(),
      status: 'draft',
      phase: 'planning',
    },
  })

  // Add owner as team member
  await db.projectMember.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      role: 'owner',
    },
  })

  // Revalidate cache for project list
  revalidatePath('/dashboard/projects')
  revalidatePath('/projects')

  // Redirect to new project
  redirect(`/projects/${project.id}`)
}
```

### 3.3 API Routes (for Client Component fetching)

**Pattern: API routes for client component consumption**

```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProject } from '@/lib/queries/projects'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await getProject(params.id)

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Check access permission
  const hasAccess =
    project.ownerId === session.user.id ||
    project.teamMembers.some(m => m.userId === session.user.id)

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const project = await getProject(params.id)

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Check edit permission
  const member = project.teamMembers.find(m => m.userId === session.user.id)
  const canEdit = member?.role === 'owner' || member?.role === 'lead'

  if (!canEdit) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update project
  const updated = await db.project.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await getProject(params.id)

  if (!project || project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Soft delete
  await db.project.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
```

### 3.4 Client Component Data Fetching (TanStack Query)

**Pattern: TanStack Query for server state in client components**

```typescript
// hooks/use-projects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  status: string
  type: string
  updatedAt: Date
}

export function useProjects(filters?: { type?: string; status?: string }) {
  const queryParams = new URLSearchParams(filters as any).toString()

  return useQuery<Project[]>({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const res = await fetch(`/api/projects?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create project')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(`Project "${data.name}" created`)
    },
    onError: (error) => {
      toast.error('Failed to create project')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProjectInput) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update project')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', data.id] })
      toast.success('Project updated')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
  })
}
```

### 3.5 Streaming Data Fetching (SSE)

**Pattern: Server-Sent Events for real-time workflow execution**

```typescript
// hooks/use-workflow-stream.ts
'use client'

import { useEffect, useState, useRef } from 'react'

interface StreamEvent {
  type: 'step_start' | 'step_complete' | 'message' | 'done' | 'error'
  step?: string
  progress: number
  message?: string
  error?: string
}

export function useWorkflowStream(workflowId: string, enabled = true) {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled || !workflowId) return

    setIsStreaming(true)
    setError(null)
    setEvents([])

    const eventSource = new EventSource(`/api/workflows/${workflowId}/execute`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      const event: StreamEvent = JSON.parse(e.data)

      setEvents((prev) => [...prev, event])

      if (event.type === 'done' || event.type === 'error') {
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
  }, [workflowId, enabled])

  const cancel = () => {
    eventSourceRef.current?.close()
    setIsStreaming(false)
  }

  return { events, isStreaming, error, cancel }
}
```

---

## 4. State Management Architecture

### 4.1 State Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BMAD State Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Server State (TanStack Query)                             │ │
│  │  - Projects, workflows, agents, users                       │ │
│  │  - Cached, synced with server                               │ │
│  │  - Automatic refetching on focus/mutation                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Client State (Zustand)                                     │ │
│  │  - UI state (modals, drawers, sidebars)                    │ │
│  │  - Transient state (form drafts, selections)                │ │
│  │  - User preferences (theme, density)                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Local State (useState)                                     │ │
│  │  - Component-specific state                                 │ │
│  │  - Form inputs, toggles, UI micro-interactions             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Zustand Stores

**UI Store**

```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Modals
  activeModal: string | null
  openModal: (modal: string) => void
  closeModal: () => void

  // Command Palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      activeModal: null,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'bmad-ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Project Filter Store**

```typescript
// stores/project-filter-store.ts
import { create } from 'zustand'

interface ProjectFilters {
  type?: string
  status?: string
  search?: string
}

interface ProjectFilterState extends ProjectFilters {
  setFilters: (filters: Partial<ProjectFilters>) => void
  resetFilters: () => void
}

export const useProjectFilterStore = create<ProjectFilterState>()(
  (set) => ({
    type: undefined,
    status: undefined,
    search: undefined,

    setFilters: (filters) => set((state) => ({ ...state, ...filters })),

    resetFilters: () => set({
      type: undefined,
      status: undefined,
      search: undefined,
    }),
  })
)
```

### 4.3 Query Client Configuration

```typescript
// components/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
app/layout.tsx                      # Root layout (providers, fonts)
├── (dashboard)/layout.tsx          # Dashboard layout (sidebar, header)
│   ├── components/layout/
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   ├── header.tsx              # Top header with user menu
│   │   └── command-palette.tsx     # Cmd+K command palette
│   │
│   ├── projects/
│   │   ├── page.tsx                # Project list (Server)
│   │   ├── components/
│   │   │   ├── project-list.tsx    # Client
│   │   │   ├── project-card.tsx    # Client
│   │   │   └── project-filters.tsx # Client
│   │   │
│   │   └── [id]/
│   │       ├── page.tsx            # Project detail (Server)
│   │       ├── components/
│   │       │   ├── project-header.tsx       # Server
│   │       │   ├── project-tabs.tsx         # Client
│   │       │   ├── overview-tab.tsx         # Client
│   │       │   ├── workflows-tab.tsx        # Client
│   │       │   └── artifacts-tab.tsx        # Client
│   │       │
│   │       └── specialized/
│   │           ├── incident-workspace.tsx   # Client
│   │           └── pentest-tracker.tsx      # Client
│   │
│   ├── agents/
│   │   ├── page.tsx                # Agent catalog (Server)
│   │   └── components/
│   │       ├── agent-grid.tsx      # Client
│   │       └── agent-card.tsx      # Client
│   │
│   └── settings/
│       └── page.tsx                # Settings (Server)
```

### 5.2 Layout Components

**Dashboard Layout**

```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Sidebar Component**

```typescript
// components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/agents', icon: Zap, label: 'Agents' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed } = useUIStore()

  return (
    <aside
      className={cn(
        'bg-slate-950 border-r border-slate-800 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded" />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg">BMAD</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              'hover:bg-slate-800',
              pathname === item.href && 'bg-slate-800 text-purple-400'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

### 5.3 Shared Layout Pattern

**Parallel Routes for Modals**

```
app/(dashboard)/
├── @modal/default.tsx           # Empty modal
├── @modal/projects/[id]/edit/page.tsx  # Edit project modal
├── layout.tsx                    # Dashboard layout with modal slot
└── projects/page.tsx
```

```typescript
// app/(dashboard)/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <main>{children}</main>
      </div>
      {modal}
    </>
  )
}
```

### 5.4 Compound Component Pattern

**Project Card Component**

```typescript
// components/projects/project-card.tsx
'use client'

import { ProjectCardHeader } from './project-card-header'
import { ProjectCardMetrics } from './project-card-metrics'
import { ProjectCardActions } from './project-card-actions'
import { ProjectCardBadge } from './project-card-badge'

interface ProjectCardProps {
  project: Project
  onEdit?: () => void
  onDelete?: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-purple-500/50 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ProjectCardBadge status={project.status} />
            <ProjectCardBadge type={project.type} />
          </div>
          <ProjectCardHeader project={project} />
          <ProjectCardMetrics project={project} />
        </div>
        <ProjectCardActions
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
```

---

## 6. Real-Time Features

### 6.1 Server-Sent Events (SSE)

**Workflow Execution Streaming**

```typescript
// app/api/workflows/[id]/execute/route.ts
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Execute workflow via CLI bridge
      const proc = spawn('bmad', ['workflow', 'execute', params.id], {
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      // Send start event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'started' })}\n\n`))

      // Stream stdout
      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          // Parse CLI output and send structured events
          try {
            const event = parseCLIOutput(line)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          } catch {
            // Send raw line if parsing fails
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'raw', message: line })}\n\n`))
          }
        }
      })

      // Handle completion
      proc.on('close', (code) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', code })}\n\n`))
        controller.close()
      })

      // Handle disconnect
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

### 6.2 SSE Hook

```typescript
// hooks/use-sse.ts
'use client'

import { useEffect, useState, useRef } from 'react'

interface SSEOptions {
  enabled?: boolean
  onMessage?: (data: any) => void
  onError?: (error: Error) => void
}

export function useSSE(url: string, options: SSEOptions = {}) {
  const { enabled = true, onMessage, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled || !url) return

    setIsConnected(true)
    setError(null)

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      onMessage?.(data)
    }

    eventSource.onerror = (e) => {
      const error = new Error('SSE connection error')
      setError(error)
      setIsConnected(false)
      onError?.(error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [url, enabled, onMessage, onError])

  const close = () => {
    eventSourceRef.current?.close()
    setIsConnected(false)
  }

  return { isConnected, error, close }
}
```

### 6.3 Real-Time Project Updates

```typescript
// hooks/use-project-realtime.ts
'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSSE } from './use-sse'
import { useEffect } from 'react'

export function useProjectRealtime(projectId: string) {
  const queryClient = useQueryClient()

  useSSE(`/api/projects/${projectId}/updates`, {
    enabled: !!projectId,
    onMessage: (event) => {
      switch (event.type) {
        case 'workflow.started':
        case 'workflow.completed':
        case 'workflow.failed':
          // Invalidate project queries
          queryClient.invalidateQueries({ queryKey: ['project', projectId] })
          queryClient.invalidateQueries({ queryKey: ['projects'] })
          break

        case 'artifact.uploaded':
        case 'artifact.deleted':
          queryClient.invalidateQueries({ queryKey: ['project', projectId] })
          break

        case 'team.member_added':
        case 'team.member_removed':
          queryClient.invalidateQueries({ queryKey: ['project', projectId] })
          break
      }
    },
  })
}
```

---

## 7. Performance Optimizations

### 7.1 Suspense Boundaries

```typescript
// app/(dashboard)/projects/loading.tsx
export function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-slate-800/50 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}
```

```typescript
// app/(dashboard)/projects/page.tsx
import { Suspense } from 'react'

export default function ProjectsPage() {
  return (
    <div>
      <h1>Projects</h1>
      <Suspense fallback={<ProjectsLoading />}>
        <ProjectList />
      </Suspense>
    </div>
  )
}
```

### 7.2 Streaming Server-Side Rendering

```typescript
// app/(marketing)/page.tsx
import { Suspense } from 'react'

async function Hero() {
  await delay(100) // Simulate data fetch
  return <section>Hero content</section>
}

async function Features() {
  await delay(200)
  return <section>Features content</section>
}

export default function MarketingPage() {
  return (
    <div>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>
    </div>
  )
}
```

### 7.3 Image Optimization

```typescript
import Image from 'next/image'

export function AgentAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={48}
      height={48}
      className="rounded-full"
      priority={false} // Set true for above-fold images
    />
  )
}
```

### 7.4 Route Prefetching

```typescript
import Link from 'next/link'

<Link
  href="/projects/abc123"
  prefetch={true} // Default for viewport links
>
  View Project
</Link>
```

---

## 8. Error Handling & Boundaries

### 8.1 Error Boundary Component

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{this.state.error?.message}</p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Reload Page
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### 8.2 Global Error Page

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-400 mb-4">An error occurred</h2>
      <p className="text-slate-400 mb-6">{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 8.3 Not-Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Page not found</h2>
      <Link href="/dashboard" className="text-purple-400 hover:underline">
        Return to dashboard
      </Link>
    </div>
  )
}
```

### 8.4 API Error Handling

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    )
  }

  if (error instanceof Error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  return Response.json(
    { error: 'Unknown error' },
    { status: 500 }
  )
}
```

---

**Document Status:** ✅ Complete

**Next Steps:**
- Implement App Router structure
- Set up authentication middleware
- Create base components (Sidebar, Header)
- Implement project CRUD with Server Actions
