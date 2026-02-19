# BMAD Web Server - Backend Integration

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Technical Team:** Winston (Architect), Bastion (Security), Barry (Dev)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. CLI-to-Web Bridge Architecture](#1-cli-to-web-bridge-architecture) | 18-200 | Bridge design, process spawning, command execution |
| [2. Server-Sent Events (SSE) Streaming](#2-server-sent-events-sse-streaming) | 204-380 | Real-time output streaming to frontend |
| [3. WebSocket Communication](#3-websocket-communication) | 384-480 | Bidirectional communication patterns |
| [4. Security Layer](#4-security-layer) | 484-620 | Command whitelisting, parameter validation, rate limiting |
| [5. Background Job Queue](#5-background-job-queue) | 624-720 | Long-running workflow management |
| [6. Error Handling & Recovery](#6-error-handling--recovery) | 724-800 | Process failure, timeout, retry logic |
| [7. API Integration Layer](#7-api-integration-layer) | 804-900 | Unified API client, response handling |

---

## 1. CLI-to-Web Bridge Architecture

### 1.1 Bridge Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BMAD Web Server                                   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Next.js Application Layer                       │  │
│  │                                                                      │  │
│  │  ┌────────────────┐    ┌────────────────┐    ┌──────────────────┐ │  │
│  │  │ Server Actions │    │  API Routes     │    │  SSE Streams   │ │  │
│  │  │   (Mutations)   │    │   (Queries)     │    │   (Real-time)   │ │  │
│  │  └────────┬───────┘    └────────┬───────┘    └────────┬─────────┘ │  │
│  └───────────┼───────────────────────┼───────────────────┼───────────┘  │
│               │                          │                   │              │
│  ┌────────────┴───────────────────────┴───────────────────┴──────────────┐ │
│  │                      Bridge Interface Layer                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Command Dispatcher  │  Stream Controller  │  Result Handler   │ │ │
│  │  └────────────────────┬──────────────────────────────────────────────┘ │ │
│  └───────────────────────┼──────────────────────────────────────────────┘ │
│                          │ HTTP (internal)                             │
│                          ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    CLI Bridge Server (Express/NestJS)                   │ │
│  │                                                                      │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐ │ │
│  │  │ Command          │  │ Process Manager   │  │ Stream Manager    │ │ │
│  │  │ Whitelist         │  │                  │  │                    │ │ │
│  │  └──────────┬───────┘  └────────┬───────────┘  └────────┬─────────────┘ │ │
│  │             │                   │                       │               │ │
│  │             ▼                   ▼                       ▼               │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │              BMAD CLI (bmad commands)                             │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Bridge Server Specification

**Technology Choices:**
- **Express.js** - Lightweight, well-established, middleware ecosystem
- **BullMQ** - Job queue for long-running workflows
- **Zod** - Runtime validation schemas
- **execa** - Safer child process spawning

### 1.3 Bridge Server Structure

```
cli-bridge/
├── src/
│   ├── server.ts                    # Express server setup
│   ├── routes/
│   │   ├── execute.ts               # Command execution endpoint
│   │   ├── stream.ts                # SSE streaming endpoint
│   │   ├── status.ts                # CLI status check
│   │   └── upload.ts                # File upload handler
│   ├── services/
│   │   ├── command-dispatcher.ts   # Command routing & validation
│   │   ├── process-manager.ts      # Child process lifecycle
│   │   ├── stream-manager.ts       # SSE stream handling
│   │   ├── job-queue.ts             # Background job management
│   │   └── file-handler.ts          # Evidence file handling
│   ├── middleware/
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── rate-limit.ts            # Rate limiting
│   │   ├── validation.ts            # Request validation
│   │   └── audit.ts                 # Audit logging
│   └── types/
│       ├── commands.ts               # Command definitions
│       └── events.ts                 # Event types
├── package.json
├── tsconfig.json
└── Dockerfile
```

### 1.4 Command Dispatcher

```typescript
// cli-bridge/src/services/command-dispatcher.ts
import { z } from 'zod'
import { execa } from 'execa'

// Command definitions with validation schemas
export const COMMAND_DEFINITIONS = {
  // Project Management
  'project.list': {
    command: 'bmad',
    args: ['list', 'projects'],
    timeout: 30000,
    validation: z.object({
      format: z.enum(['json', 'markdown', 'table']).optional(),
    }),
  },
  'project.create': {
    command: 'bmad',
    args: ['project', 'create'],
    timeout: 60000,
    validation: z.object({
      name: z.string().min(3).max(100),
      type: z.enum(['security-assessment', 'incident-response', 'investigation', 'advisory', 'compliance', 'training']),
      description: z.string().optional(),
      client: z.string().optional(),
    }),
  },

  // Agent Invocation
  'agent.invoke': {
    command: 'bmad',
    args: ['invoke'],
    timeout: 300000, // 5 minutes for agent conversations
    validation: z.object({
      agent: z.string(),
      message: z.string().max(10000),
      context: z.string().optional(),
    }),
  },

  // Workflow Execution
  'workflow.execute': {
    command: 'bmad',
    args: ['workflow', 'execute'],
    timeout: 600000, // 10 minutes for complex workflows
    validation: z.object({
      workflow: z.string(),
      parameters: z.record(z.any()).optional(),
    }),
  },

  // Intel Team
  'intel.flash-assessment': {
    command: 'bmad',
    args: ['intel-team', 'flash-assessment'],
    timeout: 180000,
    validation: z.object({
      target: z.string(),
      depth: z.enum(['basic', 'standard', 'deep']).optional(),
    }),
  },

  // Security Team
  'security.architecture-review': {
    command: 'bmad',
    args: ['security-team', 'security-architecture-review'],
    timeout: 300000,
    validation: z.object({
      target: z.string(),
      scope: z.arrayOf(z.string()).optional(),
    }),
  },

  'security.threat-model': {
    command: 'bmad',
    args: ['security-team', 'threat-modeling'],
    timeout: 300000,
    validation: z.object({
      component: z.string(),
      framework: z.enum(['STRIDE', 'PASTA', 'LINDDUN']).optional(),
    }),
  },

  // Incident Response
  'security.incident-response': {
    command: 'bmad',
    args: ['security-team', 'incident-response-playbook'],
    timeout: 600000,
    validation: z.object({
      mode: z.enum(['A', 'B']), // A: planning, B: active incident
      incidentType: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    }),
  },
}

export class CommandDispatcher {
  async execute(commandName: string, options: Record<string, any> = {}) {
    const def = COMMAND_DEFINITIONS[commandName]

    if (!def) {
      throw new Error(`Unknown command: ${commandName}`)
    }

    // Validate input parameters
    const validated = def.validation.parse(options)

    // Build command arguments
    const args = [...def.args]
    for (const [key, value] of Object.entries(validated)) {
      args.push(`--${key}`, String(value))
    }

    // Execute with execa (safer than spawn)
    const result = await execa(def.command, args, {
      timeout: def.timeout,
      reject: false, // Don't throw on non-zero exit
      cwd: process.cwd(),
      env: {
        ...process.env,
        BMAD_OUTPUT_FORMAT: 'json', // Request JSON output from CLI
        BMAD_API_KEY: process.env.BMAD_API_KEY,
      },
    })

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      timedOut: result.timedOut === true,
      command: `${def.command} ${args.join(' ')}`,
    }
  }
}
```

### 1.5 Process Manager

```typescript
// cli-bridge/src/services/process-manager.ts
import { EventEmitter } from 'events'

interface ActiveProcess {
  id: string
  command: string
  args: string[]
  pid?: number
  status: 'starting' | 'running' | 'completed' | 'failed' | 'killed'
  startTime: Date
  endTime?: Date
  output: string[]
  error?: string
}

export class ProcessManager extends EventEmitter {
  private activeProcesses = new Map<string, ActiveProcess>()

  startProcess(id: string, command: string, args: string[]): ActiveProcess {
    const process: ActiveProcess = {
      id,
      command,
      args,
      status: 'starting',
      startTime: new Date(),
      output: [],
    }

    this.activeProcesses.set(id, process)
    this.emit('process:started', { id, command })

    return process
  }

  updateProcess(id: string, updates: Partial<ActiveProcess>) {
    const process = this.activeProcesses.get(id)
    if (process) {
      Object.assign(process, updates)
      this.emit('process:updated', { id, process })
    }
  }

  completeProcess(id: string, exitCode: number, output: string) {
    const process = this.activeProcesses.get(id)
    if (process) {
      process.status = exitCode === 0 ? 'completed' : 'failed'
      process.endTime = new Date()
      process.output.push(output)
      this.emit('process:completed', { id, process, exitCode })
    }
  }

  getProcess(id: string): ActiveProcess | undefined {
    return this.activeProcesses.get(id)
  }

  killProcess(id: string): boolean {
    const process = this.activeProcesses.get(id)
    if (process && process.pid) {
      try {
        process.kill('SIGTERM')
        process.status = 'killed'
        this.emit('process:killed', { id })
        return true
      } catch {
        return false
      }
    }
    return false
  }

  cleanup(id: string) {
    setTimeout(() => {
      this.activeProcesses.delete(id)
    }, 60000) // Keep process data for 1 minute
  }
}
```

---

## 2. Server-Sent Events (SSE) Streaming

### 2.1 SSE Protocol Design

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
│    data: {"type":"step","step":"Loading agent..."}     │
│    data: {"type":"step","step":"Analyzing..."}        │
│    data: {"type":"progress","progress":30}              │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"output","line":"Finding: CVE-2024-1234"} │
│    data: {"type":"output","line":"Severity: 9.8"}         │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    :keep-alive                                          │
│    (sent every 30 seconds)                              │
│                                                       │
│  <──────────────────────────────────────────────────  │
│    data: {"type":"completed","exitCode":0}             │
│                                                       │
│    Connection closed                                    │
```

### 2.2 SSE Stream Manager

```typescript
// cli-bridge/src/routes/stream.ts
import { EventEmitter } from 'events'
import { CommandDispatcher } from '../services/command-dispatcher'
import { ProcessManager } from '../services/process-manager'

const dispatcher = new CommandDispatcher()
const processManager = new ProcessManager()

export async function streamCommand(req: Request) {
  const { searchParams } = new URL(req.url)
  const command = searchParams.get('command')
  const params = JSON.parse(searchParams.get('params') || '{}')

  if (!command) {
    return new Response('Missing command parameter', { status: 400 })
  }

  const encoder = new TextEncoder()
  const streamId = crypto.randomUUID()

  const stream = new ReadableStream({
    async start(controller) => {
      const process = processManager.startProcess(streamId, command, [])

      // Send start event
      sendEvent(controller, { type: 'started', id: streamId })

      try {
        const result = await dispatcher.execute(command, params)

        // Stream output line by line
        const lines = result.stdout.split('\n').filter(Boolean)
        for (const line of lines) {
          // Parse CLI output for structured events
          const event = parseCLIOutput(line)
          sendEvent(controller, event)
        }

        // Send completion
        sendEvent(controller, {
          type: 'completed',
          exitCode: result.exitCode || 0,
          timedOut: result.timedOut || false,
        })

        processManager.completeProcess(streamId, result.exitCode || 0, result.stdout)

      } catch (error) {
        sendEvent(controller, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        processManager.updateProcess(streamId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Send close event
      controller.close()
    },

    cancel(signal) {
      // Handle client disconnect
      signal.addEventListener('abort', () => {
        processManager.killProcess(streamId)
      })
    },
  })

  // Keep-alive interval
  const keepAlive = setInterval(() => {
    // Send comment to keep connection alive
  }, 30000)

  req.signal.addEventListener('abort', () => {
    clearInterval(keepAlive)
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for real-time feel
    },
  })
}

function sendEvent(controller: ReadableStreamDefaultController, data: any) {
  const formatted = `data: ${JSON.stringify(data)}\n\n`
  controller.enqueue(encoder.encode(formatted))
}

function parseCLIOutput(line: string): any {
  // Try to parse as JSON first
  try {
    return JSON.parse(line)
  } catch {
    // Not JSON, return as raw output
    return { type: 'raw', message: line }
  }
}
```

### 2.3 Client-Side SSE Hook

```typescript
// hooks/use-command-stream.ts
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface StreamEvent {
  type: 'started' | 'step' | 'progress' | 'output' | 'raw' | 'completed' | 'error'
  id?: string
  step?: string
  progress?: number
  message?: string
  line?: string
  exitCode?: number
  error?: string
}

interface UseCommandStreamOptions {
  command: string
  params?: Record<string, any>
  enabled?: boolean
  onStep?: (step: string) => void
  onOutput?: (line: string) => void
  onProgress?: (progress: number) => void
  onComplete?: (exitCode: number) => void
  onError?: (error: string) => void
}

export function useCommandStream(options: UseCommandStreamOptions) {
  const { command, params = {}, enabled = true } = options

  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!enabled || !command) return

    setIsStreaming(true)
    setError(null)

    const queryParams = new URLSearchParams({ command, params: JSON.stringify(params) })
    const url = `/api/cli/stream?${queryParams}`

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (e) => {
      const event: StreamEvent = JSON.parse(e.data)
      setEvents((prev) => [...prev, event])

      // Call callbacks
      switch (event.type) {
        case 'started':
          break
        case 'step':
          options.onStep?.(event.step || '')
          break
        case 'progress':
          options.onProgress?.(event.progress || 0)
          break
        case 'output':
        case 'raw':
          options.onOutput?.(event.message || event.line || '')
          break
        case 'completed':
          setIsStreaming(false)
          cleanup()
          options.onComplete?.(event.exitCode || 0)
          break
        case 'error':
          setIsStreaming(false)
          cleanup()
          options.onError?.(event.error || 'Unknown error')
          setError(event.error || 'Unknown error')
          break
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setIsStreaming(false)

      // Auto-reconnect with exponential backoff
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 1000)
    }
  }, [command, params, enabled, options, cleanup])

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup()
  }, [cleanup])

  // Auto-connect when enabled
  useEffect(() => {
    connect()
    return cleanup
  }, [connect, enabled])

  // Cancel function
  const cancel = useCallback(() => {
    disconnect()
    // Optionally call cancel API to kill backend process
  }, [disconnect])

  return {
    events,
    isStreaming,
    isConnected,
    error,
    cancel,
  }
}
```

### 2.4 SSE Component Example

```typescript
// components/workflow/workflow-execution.tsx
'use client'

import { useCommandStream } from '@/hooks/use-command-stream'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Terminal } from '@/components/ui/terminal'

interface WorkflowExecutionProps {
  workflow: string
  parameters?: Record<string, any>
}

export function WorkflowExecution({ workflow, parameters }: WorkflowExecutionProps) {
  const { events, isStreaming, isConnected, error, cancel } = useCommandStream({
    command: 'workflow.execute',
    params: { workflow, parameters },
    onStep: (step) => console.log('Step:', step),
    onOutput: (line) => console.log('Output:', line),
    onProgress: (progress) => console.log('Progress:', progress),
  })

  const currentProgress = events
    .filter(e => e.type === 'progress')
    .pop()?.progress || 0

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <Progress value={currentProgress} className="flex-1" />
        <span className="text-sm text-muted-foreground">
          {Math.round(currentProgress)}%
        </span>
        {isStreaming && (
          <Button variant="outline" size="sm" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Terminal output */}
      <Terminal
        lines={events.filter(e => e.type === 'output' || e.type === 'raw').map(e => e.message || e.line || '')}
        isConnected={isConnected}
      />

      {/* Error display */}
      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      {/* Completion status */}
      {!isStreaming && events.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Workflow completed
        </div>
      )}
    </div>
  )
}
```

---

## 3. WebSocket Communication

### 3.1 When to Use WebSocket vs SSE

| Use Case | Recommended Technology | Rationale |
|---------|------------------------|-----------|
| CLI output streaming | SSE | One-way server→client, simpler |
| Real-time collaboration | WebSocket | Bi-directional, low latency |
| Full terminal emulation | WebSocket | Bidirectional character input |
| Multi-user cursor sharing | WebSocket | Real-time synchronization |

### 3.2 WebSocket Server Implementation

```typescript
// cli-bridge/src/routes/websocket.ts
import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'

const wss = new WebSocketServer({ noServer: true })

export function handleWebSocketUpgrade(server: Server) {
  server.on('upgrade', (request, socket, head) => {
    if (request.headers['upgrade'] !== 'websocket') return

    wss.handleUpgrade(request, socket, head)
  })
}

// Connection management
const clients = new Map<string, WebSocket>()

wss.on('connection', (ws: WebSocket, req) => {
  const sessionId = crypto.randomUUID()

  // Extract session info from cookie
  const sessionCookie = req.headers.cookie
  const userId = extractUserIdFromSession(sessionCookie)

  if (!userId) {
    ws.close(4001, 'Unauthorized')
    return
  }

  clients.set(sessionId, ws)

  ws.send(JSON.stringify({
    type: 'connected',
    sessionId,
  }))

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())

      switch (message.type) {
        case 'execute.command':
          // Execute command and stream results back to sender
          await handleCommandExecution(ws, sessionId, message.payload)
          break

        case 'join.project':
          // Join project room for real-time updates
          await handleProjectJoin(ws, sessionId, message.payload)
          break

        case 'chat.send':
          // Broadcast chat message to project room
          await broadcastToProject(message.payload.projectId, {
            type: 'chat.message',
            from: userId,
            content: message.payload.content,
            timestamp: new Date().toISOString(),
          })
          break
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  })

  ws.on('close', () => {
    clients.delete(sessionId)
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// Broadcast to all clients in a project
async function broadcastToProject(projectId: string, message: any) {
  const payload = JSON.stringify(message)

  for (const [sessionId, ws] of clients) {
    // Get user's active projects
    const userProjects = await getUserActiveProjects(sessionId)

    if (userProjects.includes(projectId)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    }
  }
}
```

### 3.3 WebSocket Hook

```typescript
// hooks/use-websocket.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { WebSocket } from 'wt'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  url: string
  enabled?: boolean
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { url, enabled = true } = options
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    if (!enabled) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      options.onConnect?.()
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        options.onMessage?.(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      options.onDisconnect?.()
      // Auto-reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 3000)
    }

    ws.onerror = (error) => {
      options.onError?.(error)
    }
  }, [url, enabled, options])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    clearTimeout(reconnectTimeoutRef.current)
  }, [])

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { send, disconnect, isConnected: wsRef.current?.readyState === WebSocket.OPEN }
}
```

---

## 4. Security Layer

### 4.1 Command Whitelist

```typescript
// cli-bridge/src/middleware/whitelist.ts
import { Request, Response, NextFunction } from 'express'

const ALLOWED_COMMANDS = [
  'project.list',
  'project.create',
  'project.update',
  'project.delete',
  'project.workflow.add',
  'agent.invoke',
  'workflow.execute',
  'intel.flash-assessment',
  'security.architecture-review',
  'security.threat-model',
  'security.incident-response',
  'security.pentest-coordinate',
  // ... etc
]

export function whitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  const { command } = req.params

  if (!command) {
    return res.status(400).json({ error: 'Command parameter required' })
  }

  if (!ALLOWED_COMMANDS.includes(command)) {
    return res.status(404).json({ error: 'Command not found', command })
  }

  // Add command info to request for downstream handlers
  ;(req as any).commandDefinition = COMMAND_DEFINITIONS[command]
  next()
}
```

### 4.2 Parameter Validation Middleware

```typescript
// cli-bridge/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export function validateParams(req: Request, res: Response, next: NextFunction) {
  const commandDefinition = (req as any).commandDefinition

  if (!commandDefinition || !commandDefinition.validation) {
    return next()
  }

  try {
    // Validate request body against schema
    const validated = commandDefinition.validation.parse(req.body)
    (req as any).validatedParams = validated
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        issues: error.errors,
      })
    }
    return res.status(400).json({ error: 'Validation failed' })
  }
}
```

### 4.3 Prompt Injection Sanitization

```typescript
// cli-bridge/src/middleware/sanitization.ts
import { Request, Response, NextFunction } from 'express'

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

function detectPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input))
}

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Control characters
    .replace(/[\x7F-\x9F]/g, '') // Additional control characters
    .normalize('NFKC') // Unicode normalization
}

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = req.body

    // Check for prompt injection in string fields
    const stringsToCheck = [
      body.message,
      body.prompt,
      body.context,
      body.parameters?.target,
      body.parameters?.scope,
    ].filter(Boolean)

    for (const str of stringsToCheck) {
      if (typeof str === 'string' && detectPromptInjection(str)) {
        return res.status(400).json({
          error: 'Invalid input detected',
          reason: 'Prompt injection pattern detected',
        })
      }
    }

    // Sanitize all string inputs
    for (const key in body) {
      if (typeof body[key] === 'string') {
        body[key] = sanitizeInput(body[key])
      }
    }

    req.body = body
  }

  next()
}
```

### 4.4 Rate Limiting

```typescript
// cli-bridge/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// Different limits for different command types
const commandLimits = {
  'agent.invoke': rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 agent invocations per minute
    standardHeaders: true,
    message: 'Too many agent invocations. Please slow down.',
  }),

  'workflow.execute': rateLimit({
    windowMs: 60 * 1000 * 5, // 5 minutes
    max: 3, // 3 workflow executions per 5 minutes
    standardHeaders: true,
    message: 'Too many workflow executions. Please wait before running another.',
  }),

  default: rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    message: 'Too many requests. Please slow down.',
  }),
}

export function getRateLimiter(command: string) {
  return commandLimits[command] || commandLimits.default
}
```

---

## 5. Background Job Queue

### 5.1 Job Queue Configuration

```typescript
// cli-bridge/src/services/job-queue.ts
import { Queue, Worker, Job } from 'bullmq'
import { processManager } from './process-manager'

interface JobData {
  command: string
  params: Record<string, any>
  userId: string
  projectId?: string
}

interface JobResult {
  stdout: string
  stderr: string
  exitCode: number
  outputFiles: string[]
}

// Create job queue
export const jobQueue = new Queue<JobData, JobResult>('bmad-workflows', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
})
```

### 5.2 Job Processor

```typescript
// cli-bridge/src/workers/workflow-processor.ts
import { Job, Worker } from 'bullmq'
import { CommandDispatcher } from '../services/command-dispatcher'

const dispatcher = new CommandDispatcher()

export const workflowProcessor = new Worker<JobData, JobResult>(
  'bmad-workflows',
  async (job: Job<JobData, JobResult>) => {
    const { command, params, userId, projectId } = job.data

    job.updateProgress(10)

    try {
      const result = await dispatcher.execute(command, params)

      job.updateProgress(90)

      // Parse output for generated files
      const outputFiles = extractOutputFiles(result.stdout)

      // Notify via WebSocket if project room
      if (projectId) {
        await broadcastToProject(projectId, {
          type: 'workflow.completed',
          workflow: command,
          userId,
          result: {
            status: result.exitCode === 0 ? 'success' : 'failed',
            files: outputFiles.length,
          },
        })
      }

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode || 0,
        outputFiles,
      }
    } catch (error) {
      job.updateProgress(0)

      // Log error for investigation
      console.error(`Workflow ${command} failed:`, error)

      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 3, // Max 3 concurrent workflow executions
  }
)

// Progress update helper
workflowProcessor.on('progress', (job: Job, progress) => {
  // Broadcast progress to project room
  const { projectId } = job.data

  if (projectId) {
    broadcastToProject(projectId, {
      type: 'workflow.progress',
      workflow: job.data.command,
      progress: progress,
    })
  }
})
```

### 5.3 Job Management API

```typescript
// cli-bridge/src/routes/jobs.ts
import { jobQueue } from '../services/job-queue'

// Add job to queue
router.post('/jobs', async (req, res) => {
  const { command, params, projectId } = req.body
  const userId = req.user.id // From auth middleware

  const job = await jobQueue.add('workflow-execute', {
    command,
    params,
    userId,
    projectId,
  }, {
    jobId: `job_${Date.now()}_${userId.slice(0, 8)}`,
    priority: projectId ? getPriority(projectId) : 5,
  })

  res.json({
    jobId: job.id,
    status: 'queued',
  })
})

// Get job status
router.get('/jobs/:jobId', async (req, res) => {
  const job = await jobQueue.getJob(req.params.jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  res.json({
    id: job.id,
    status: await job.getState(),
    progress: job.progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
  })
})

// Cancel job
router.delete('/jobs/:jobId', async (req, res) => {
  const job = await jobQueue.getJob(req.params.jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  if (await job.getState() === 'completed') {
    return res.status(400).json({ error: 'Cannot cancel completed job' })
  }

  await job.remove()
  res.json({ success: true })
})
```

---

## 6. Error Handling & Recovery

### 6.1 Process Timeout Handling

```typescript
// cli-bridge/src/services/process-manager.ts
async function executeWithTimeout(
  command: string,
  args: string[],
  timeout: number
): Promise<ProcessResult> {
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Process timeout after ${timeout}ms`))
    }, timeout)

    execa(command, args, {
      timeout,
      killSignal: 'SIGKILL',
    })
      .then((result) => {
        clearTimeout(timer)
        resolve({
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode || 0,
          duration: Date.now() - startTime,
          timedOut: false,
        })
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}
```

### 6.2 Retry Logic

```typescript
// cli-bridge/src/services/retry.ts
interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableError: (error: Error) => boolean
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryableError = () => true,
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable
      if (!retryableError(lastError) || attempt === maxAttempts) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      )

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
```

### 6.3 Error Classification

```typescript
// cli-bridge/src/types/errors.ts

export enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  COMMAND_NOT_FOUND = 'command_not_found',
  PROCESS_TIMEOUT = 'process_timeout',
  PROCESS_CRASH = 'process_crash',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNKNOWN_ERROR = 'unknown_error',
}

export class BridgeError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public userMessage: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'BridgeError'
  }
}

export function classifyError(error: Error): BridgeError {
  // Check error message or type
  const message = error.message.toLowerCase()

  if (message.includes('timeout')) {
    return new BridgeError(
      error.message,
      ErrorType.PROCESS_TIMEOUT,
      'The operation timed out. Please try again with a smaller scope.',
      408
    )
  }

  if (message.includes('command not found')) {
    return new BridgeError(
      error.message,
      ErrorType.COMMAND_NOT_FOUND,
      'This operation is not available.',
      404
    )
  }

  if (message.includes('unauthorized') || message.includes('authentication')) {
    return new BridgeError(
      error.message,
      ErrorType.AUTHORIZATION_ERROR,
      'You are not authorized to perform this action.',
      401
    )
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return new BridgeError(
      error.message,
      ErrorType.VALIDATION_ERROR,
      'The provided parameters are invalid.',
      400
    )
  }

  if (message.includes('rate limit')) {
    return new BridgeError(
      error.message,
      ErrorType.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please wait a moment before trying again.',
      429
    )
  }

  // Default unknown error
  return new BridgeError(
    error.message,
    ErrorType.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
    500
  )
}
```

---

## 7. API Integration Layer

### 7.1 Unified API Client

```typescript
// lib/api-client.ts
import { QueryClient } from '@tanstack/react-query'

export const apiClient = {
  // Projects
  projects: {
    list: (filters?: Record<string, string>) =>
      fetch('/api/projects' + (filters ? `?${new URLSearchParams(filters)}` : '')),

    get: (id: string) => fetch(`/api/projects/${id}`),

    create: (data: CreateProjectInput) =>
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateProjectInput) =>
      fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetch(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  // Workflows
  workflows: {
    execute: (id: string, params: Record<string, any>) =>
      fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: id, params }),
      }),

    stream: (id: string, params: Record<string, any>) =>
      fetch(`/api/workflows/${id}/stream?${new URLSearchParams({ params: JSON.stringify(params) })}`),
  },

  // Agents
  agents: {
    list: () => fetch('/api/agents'),

    invoke: (agentId: string, message: string) =>
      fetch('/api/agents/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message }),
      }),
  },
}

// Type helpers
export async function fetchAPI<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown error',
      status: response.status,
    }))
    throw new Error(JSON.stringify(error))
  }

  return response.json() as Promise<T>
}
```

### 7.2 Response Parser

```typescript
// lib/api-parser.ts
import { z } from 'zod'

// Define response schemas
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  phase: z.string(),
  ownerId: z.string(),
  teamMembers: z.array(z.object({
    userId: z.string(),
    role: z.string(),
  })),
  workflows: z.array(z.object({
    id: z.string(),
    status: z.string(),
  })),
  _count: z.object({
    workflows: z.number(),
    artifacts: z.number(),
  }),
  createdAt: z.string().transform((v) => new Date(v)),
  updatedAt: z.string().transform((v) => new Date(v)),
})

export function parseAPIResponse<T>(schema: z.ZodSchema<T>) {
  return async (response: Response): Promise<T> => {
    const data = await response.json()
    return schema.parse(data)
  }
}
```

---

**Document Status:** ✅ Complete

**Next Steps:**
- Implement bridge server with Express
- Set up SSE streaming for CLI output
- Configure WebSocket for real-time collaboration
- Implement security middleware (whitelist, validation, rate limiting)
- Set up BullMQ for background job processing
