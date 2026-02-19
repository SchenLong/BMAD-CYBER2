/**
 * StreamProvider Component
 *
 * Client-side provider component that wraps the SSE hooks for use
 * in Server Components. This enables real-time streaming functionality
 * to be used from Server Components via the "use client" boundary pattern.
 *
 * @see {@link ../../hooks/use-agent-stream.ts} - Agent stream hook
 * @see {@link ../../hooks/use-cli-stream.ts} - CLI stream hook
 */

'use client'

import { useAgentStream, type UseAgentStreamOptions, type UseAgentStreamResult } from '@/hooks/use-agent-stream'
import { useCliStream, type UseCliStreamOptions, type UseCliStreamResult } from '@/hooks/use-cli-stream'
import { createContext, useContext, ReactNode } from 'react'

/**
 * Agent stream context type.
 */
interface AgentStreamContextType {
  /** Agent ID being observed */
  agentId: string | null
  /** Stream result from useAgentStream hook */
  stream: UseAgentStreamResult
}

/**
 * CLI stream context type.
 */
interface CliStreamContextType {
  /** Command being executed */
  command: string | null
  /** Command parameters */
  params: Record<string, unknown> | null
  /** Stream result from useCliStream hook */
  stream: UseCliStreamResult
}

/**
 * Combined stream provider props.
 */
export interface StreamProviderProps {
  /** Children components */
  children: ReactNode
}

/**
 * Agent-specific stream provider props.
 */
export interface AgentStreamProviderProps {
  /** Agent ID to observe */
  agentId: string | null
  /** Whether the stream is enabled */
  enabled?: boolean
  /** Event callback */
  onEvent?: UseAgentStreamOptions['onEvent']
  /** Connect callback */
  onConnect?: UseAgentStreamOptions['onConnect']
  /** Disconnect callback */
  onDisconnect?: UseAgentStreamOptions['onDisconnect']
  /** Error callback */
  onError?: UseAgentStreamOptions['onError']
  /** Child components */
  children: ReactNode
}

/**
 * CLI-specific stream provider props.
 */
export interface CliStreamProviderProps {
  /** Command to execute */
  command: string | null
  /** Command parameters */
  params?: Record<string, unknown>
  /** Whether the stream is enabled */
  enabled?: boolean
  /** Event callback */
  onEvent?: UseCliStreamOptions['onEvent']
  /** Output callback */
  onOutput?: UseCliStreamOptions['onOutput']
  /** Complete callback */
  onComplete?: UseCliStreamOptions['onComplete']
  /** Connect callback */
  onConnect?: UseCliStreamOptions['onConnect']
  /** Disconnect callback */
  onDisconnect?: UseCliStreamOptions['onDisconnect']
  /** Error callback */
  onError?: UseCliStreamOptions['onError']
  /** Child components */
  children: ReactNode
}

// Create contexts
const AgentStreamContext = createContext<AgentStreamContextType | null>(null)
const CliStreamContext = createContext<CliStreamContextType | null>(null)

/**
 * Hook to access agent stream from context.
 * @throws Error if used outside AgentStreamProvider
 */
export function useAgentStreamContext(): AgentStreamContextType {
  const context = useContext(AgentStreamContext)
  if (!context) {
    throw new Error('useAgentStreamContext must be used within AgentStreamProvider')
  }
  return context
}

/**
 * Hook to access CLI stream from context.
 * @throws Error if used outside CliStreamProvider
 */
export function useCliStreamContext(): CliStreamContextType {
  const context = useContext(CliStreamContext)
  if (!context) {
    throw new Error('useCliStreamContext must be used within CliStreamProvider')
  }
  return context
}

/**
 * AgentStreamProvider Component
 *
 * Provides agent streaming context to child components.
 * This component must be a Client Component ('use client') and wraps
 * the useAgentStream hook for Server Component compatibility.
 *
 * @example
 * ```tsx
 * // In Server Component
 * import { AgentStreamProvider } from '@/components/providers/stream-provider'
 *
 * export default function AgentPage({ params }: { params: { id: string } }) {
 *   return (
 *     <AgentStreamProvider agentId={params.id}>
 *       <AgentProgressUI />
 *     </AgentStreamProvider>
 *   )
 * }
 *
 * // In Client Component
 * import { useAgentStreamContext } from '@/components/providers/stream-provider'
 *
 * function AgentProgressUI() {
 *   const { stream } = useAgentStreamContext()
 *   return <div>{stream.progress}%</div>
 * }
 * ```
 */
export function AgentStreamProvider({
  agentId,
  enabled = true,
  onEvent,
  onConnect,
  onDisconnect,
  onError,
  children,
}: AgentStreamProviderProps) {
  const stream = useAgentStream(agentId, {
    enabled,
    onEvent,
    onConnect,
    onDisconnect,
    onError,
  })

  const contextValue: AgentStreamContextType = {
    agentId,
    stream,
  }

  return (
    <AgentStreamContext.Provider value={contextValue}>
      {children}
    </AgentStreamContext.Provider>
  )
}

/**
 * CliStreamProvider Component
 *
 * Provides CLI streaming context to child components.
 * This component must be a Client Component ('use client') and wraps
 * the useCliStream hook for Server Component compatibility.
 *
 * @example
 * ```tsx
 * // In Server Component
 * import { CliStreamProvider } from '@/components/providers/stream-provider'
 *
 * export default function CommandPage() {
 *   return (
 *     <CliStreamProvider command="scan" params={{ target: 'example.com' }}>
 *       <CommandOutputUI />
 *     </CliStreamProvider>
 *   )
 * }
 *
 * // In Client Component
 * import { useCliStreamContext } from '@/components/providers/stream-provider'
 *
 * function CommandOutputUI() {
 *   const { stream } = useCliStreamContext()
 *   return <div>{stream.output.join('\n')}</div>
 * }
 * ```
 */
export function CliStreamProvider({
  command,
  params = {},
  enabled = true,
  onEvent,
  onOutput,
  onComplete,
  onConnect,
  onDisconnect,
  onError,
  children,
}: CliStreamProviderProps) {
  const stream = useCliStream({
    command: command || '',
    params,
    enabled: enabled && !!command,
    onEvent,
    onOutput,
    onComplete,
    onConnect,
    onDisconnect,
    onError,
  })

  const contextValue: CliStreamContextType = {
    command,
    params,
    stream,
  }

  return (
    <CliStreamContext.Provider value={contextValue}>
      {children}
    </CliStreamContext.Provider>
  )
}
