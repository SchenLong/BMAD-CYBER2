/**
 * useAgentStream Hook
 *
 * Client-side SSE hook for consuming agent progress events.
 * Connects to the SSE endpoint and manages the agent stream lifecycle.
 *
 * @see {@link ../types/events.ts} - Agent event type definitions
 * @see {@link ../lib/sse/types.ts} - SSE type definitions
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AgentEvent } from '@/types/events'

/**
 * Configuration options for the agent stream hook.
 */
export interface UseAgentStreamOptions {
  /** Whether the stream should automatically connect on mount */
  enabled?: boolean
  /** Callback invoked when a new event arrives */
  onEvent?: (event: AgentEvent) => void
  /** Callback invoked when the stream connects */
  onConnect?: () => void
  /** Callback invoked when the stream disconnects */
  onDisconnect?: () => void
  /** Callback invoked when an error occurs */
  onError?: (error: string) => void
}

/**
 * Stream state returned by the hook.
 */
export interface AgentStreamState {
  /** Whether currently connected and streaming */
  isStreaming: boolean
  /** Whether the connection is established */
  isConnected: boolean
  /** All events received so far */
  events: AgentEvent[]
  /** Current progress percentage (0-100) */
  progress: number
  /** Current step name */
  currentStep: string | null
  /** Completed step names */
  completedSteps: string[]
  /** Estimated time remaining in milliseconds */
  estimatedRemaining: number | null
  /** Latest error, if any */
  error: string | null
  /** Recovery suggestion for errors */
  recovery: string | null
  /** Latest message events */
  messages: Array<{ message: string; timestamp: string; level: string }>
}

/**
 * Stream controls returned by the hook.
 */
export interface AgentStreamControls {
  /** Manually connect to the stream */
  connect: () => void
  /** Disconnect from the stream */
  disconnect: () => void
  /** Cancel the stream and close connection */
  cancel: () => void
  /** Clear all stored events */
  clearEvents: () => void
  /** Manually reconnect to the stream */
  reconnect: () => void
}

/**
 * Result type combining state and controls.
 */
export type UseAgentStreamResult = AgentStreamState & AgentStreamControls

/**
 * Maximum number of retry attempts for connection.
 */
const MAX_RETRY_ATTEMPTS = 5

/**
 * Base delay for exponential backoff in milliseconds.
 */
const BASE_RETRY_DELAY = 1000

/**
 * Maximum retry delay in milliseconds.
 */
const MAX_RETRY_DELAY = 30000

/**
 * Calculate retry delay with exponential backoff.
 * @param retryCount - Current retry attempt number
 * @returns Delay in milliseconds
 */
function getRetryDelay(retryCount: number): number {
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY)
}

/**
 * Formats milliseconds to human-readable time.
 * @param ms - Milliseconds to format
 * @returns Formatted time string (e.g., "2m 30s")
 */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return 'Calculating...'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m remaining`
      : `${hours}h remaining`
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s remaining`
      : `${minutes}m remaining`
  }

  return `${seconds}s remaining`
}

/**
 * Parse SSE message data into an AgentEvent.
 * @param data - Raw data string from SSE event
 * @returns Parsed AgentEvent or null if invalid
 */
function parseSSEEvent(data: string): AgentEvent | null {
  try {
    const parsed = JSON.parse(data)
    // Ensure the event has a type field
    if (!parsed.type) {
      console.warn('[SSE] Dropping event without type:', parsed)
      return null
    }
    // agentId is preferred but not strictly required for all event types
    return parsed as AgentEvent
  } catch (err) {
    console.warn('[SSE] Failed to parse event:', err instanceof Error ? err.message : 'Unknown error', data)
    return null
  }
}

/**
 * Hook for connecting to agent progress SSE streams.
 *
 * @param agentId - The ID of the agent to observe
 * @param options - Configuration options
 * @returns Stream state and controls
 *
 * @example
 * ```tsx
 * const { isStreaming, progress, currentStep, cancel } = useAgentStream('agent-123', {
 *   onEvent: (event) => console.log('New event:', event),
 *   onError: (error) => toast.error(error),
 * })
 * ```
 */
export function useAgentStream(
  agentId: string | null,
  options: UseAgentStreamOptions = {}
): UseAgentStreamResult {
  // State management
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [estimatedRemaining, setEstimatedRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recovery, setRecovery] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ message: string; timestamp: string; level: string }>>([])

  // Refs for cleanup and reconnection
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const optionsRef = useRef<UseAgentStreamOptions>(options)
  const agentIdRef = useRef(agentId)
  const processEventRef = useRef<(event: AgentEvent) => void>(() => {})
  const retryCountRef = useRef(0)
  const manuallyCancelledRef = useRef(false)
  const connectRef = useRef<() => void>(() => {})

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Keep agentId ref updated
  useEffect(() => {
    agentIdRef.current = agentId
  }, [agentId])

  // Process incoming event - use ref to avoid dependency issues
  useEffect(() => {
    processEventRef.current = (event: AgentEvent) => {
      setEvents((prev) => [...prev, event])

      // Update progress
      if ('progress' in event && typeof event.progress === 'number') {
        setProgress(event.progress)
      }

      // Update current step based on event type
      if (event.type === 'step_start' && 'step' in event) {
        setCurrentStep(event.step)
      }

      // Update completed steps
      if (event.type === 'step_complete' && 'step' in event) {
        setCompletedSteps((prev) => {
          if (!prev.includes(event.step)) {
            return [...prev, event.step]
          }
          return prev
        })
      }

      // Update estimated remaining time
      if ('estimatedRemaining' in event && typeof event.estimatedRemaining === 'number') {
        setEstimatedRemaining(event.estimatedRemaining)
      }

      // Handle message events
      if (event.type === 'message') {
        setMessages((prev) => [...prev, {
          message: event.message,
          timestamp: event.timestamp,
          level: event.level,
        }])
      }

      // Handle errors
      if (event.type === 'step_error') {
        setError(event.error)
        // Type narrowing for error events with recovery
        const errorEvent = event as Extract<AgentEvent, { type: 'step_error' }>
        setRecovery(errorEvent.recovery || null)
        setIsStreaming(false)
      }

      // Handle completion
      if (event.type === 'done') {
        setIsStreaming(false)
        setProgress(100)
        setEstimatedRemaining(0)
      }

      // Invoke user callback
      if (optionsRef.current.onEvent) {
        optionsRef.current.onEvent(event)
      }
    }
  }, [])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      const timeout = reconnectTimeoutRef.current
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  // Connect to SSE stream
  const connect = useCallback(() => {
    const currentAgentId = agentIdRef.current
    if (!currentAgentId || eventSourceRef.current || manuallyCancelledRef.current) {
      return
    }

    // Build SSE URL - adjust based on your API route structure
    const url = `/api/agents/${currentAgentId}/observe`

    try {
      const eventSource = new EventSource(url)

      eventSourceRef.current = eventSource

      // Connection opened
      eventSource.onopen = () => {
        setIsConnected(true)
        setIsStreaming(true)
        setError(null)
        retryCountRef.current = 0

        if (optionsRef.current.onConnect) {
          optionsRef.current.onConnect()
        }
      }

      // Handle incoming messages - use ref to avoid dependency issues
      eventSource.onmessage = (event) => {
        const parsed = parseSSEEvent(event.data)
        if (parsed) {
          processEventRef.current(parsed)
        }
      }

      // Handle errors with exponential backoff
      eventSource.onerror = (e) => {
        console.error('SSE connection error:', e)
        setIsConnected(false)
        setIsStreaming(false)

        const errorMsg = 'Connection to agent stream failed'
        setError(errorMsg)

        if (optionsRef.current.onError) {
          optionsRef.current.onError(errorMsg)
        }

        // Exponential backoff reconnection
        if (retryCountRef.current < MAX_RETRY_ATTEMPTS && !manuallyCancelledRef.current) {
          const delay = getRetryDelay(retryCountRef.current)
          retryCountRef.current++

          reconnectTimeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close()
            }
            // Use the ref to call connect
            connectRef.current()
          }, delay)
        } else {
          // Max retries reached or manually cancelled
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
          if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
            setError('Connection failed after multiple attempts. Please try again.')
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to agent stream'
      setError(errorMsg)
      setIsConnected(false)
      setIsStreaming(false)

      if (optionsRef.current.onError) {
        optionsRef.current.onError(errorMsg)
      }
    }
  }, [])

  // Keep connect ref updated for use in error handler
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  // Disconnect from stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setIsStreaming(false)

    if (optionsRef.current.onDisconnect) {
      optionsRef.current.onDisconnect()
    }
  }, [])

  // Cancel stream (same as disconnect but also clears error and prevents auto-reconnect)
  const cancel = useCallback(() => {
    manuallyCancelledRef.current = true
    disconnect()
    setError(null)
    setRecovery(null)
  }, [disconnect])

  // Clear all stored events
  const clearEvents = useCallback(() => {
    setEvents([])
    setProgress(0)
    setCurrentStep(null)
    setCompletedSteps([])
    setEstimatedRemaining(null)
    setError(null)
    setRecovery(null)
    setMessages([])
  }, [])

  // Reconnect function (reset manual cancel flag)
  const reconnect = useCallback(() => {
    manuallyCancelledRef.current = false
    retryCountRef.current = 0
    disconnect()
    // Small delay to ensure clean disconnect before reconnect
    setTimeout(() => {
      connect()
    }, 100)
  }, [connect, disconnect])

  // Auto-connect on mount if enabled - schedule connect to avoid setState in effect
  useEffect(() => {
    const shouldConnect = optionsRef.current.enabled && agentId && !eventSourceRef.current
    if (shouldConnect) {
      // Schedule connect to next tick to avoid setState warning
      const timeoutId = setTimeout(() => {
        connect()
      }, 0)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      disconnect()
    }
  }, [agentId, connect, disconnect])

  return {
    // State
    isStreaming,
    isConnected,
    events,
    progress,
    currentStep,
    completedSteps,
    estimatedRemaining,
    error,
    recovery,
    messages,
    // Controls
    connect,
    disconnect,
    cancel,
    clearEvents,
    reconnect,
  }
}

/**
 * Hook variant that connects to a specific agent by ID.
 * This is the primary hook intended for use in components.
 *
 * @param agentId - The ID of the agent to observe
 * @param options - Configuration options
 * @returns Stream state and controls
 */
export function useAgentProgress(
  agentId: string | null,
  options?: UseAgentStreamOptions
): UseAgentStreamResult {
  return useAgentStream(agentId, options)
}
