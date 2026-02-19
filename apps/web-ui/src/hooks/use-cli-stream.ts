/**
 * useCliStream Hook
 *
 * Client-side SSE hook for consuming CLI command output streams.
 * Connects to the CLI streaming endpoint and manages the lifecycle.
 *
 * @see {@link ../types/events.ts} - Event type definitions
 * @see {@link ../lib/sse/types.ts} - SSE type definitions
 *
 * @requires API endpoint `/api/cli/stream` to be implemented
 * This endpoint should accept `command` and `params` query parameters
 * and return SSE events matching CliStreamEvent types
 */

'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

/**
 * CLI stream event types.
 */
export type CliStreamEventType =
  | 'started'
  | 'step'
  | 'progress'
  | 'output'
  | 'raw'
  | 'completed'
  | 'error'

/**
 * Base CLI stream event interface.
 */
export interface BaseCliStreamEvent {
  type: CliStreamEventType
  id?: string
}

/**
 * Event emitted when CLI command starts.
 */
export interface CliStreamStartedEvent extends BaseCliStreamEvent {
  type: 'started'
  id: string
  command: string
  params: Record<string, unknown>
}

/**
 * Event emitted for step updates during execution.
 */
export interface CliStreamStepEvent extends BaseCliStreamEvent {
  type: 'step'
  id?: string
  step: string
  stepNumber: number
  totalSteps: number
  progress: number
}

/**
 * Event emitted for progress updates.
 */
export interface CliStreamProgressEvent extends BaseCliStreamEvent {
  type: 'progress'
  id?: string
  progress: number
  message?: string
}

/**
 * Event emitted for command output.
 */
export interface CliStreamOutputEvent extends BaseCliStreamEvent {
  type: 'output'
  id?: string
  message: string
  timestamp: string
}

/**
 * Event emitted for raw output lines.
 */
export interface CliStreamRawEvent extends BaseCliStreamEvent {
  type: 'raw'
  id?: string
  line: string
  timestamp: string
}

/**
 * Event emitted when command completes.
 */
export interface CliStreamCompletedEvent extends BaseCliStreamEvent {
  type: 'completed'
  id: string
  exitCode: number
  duration: number
}

/**
 * Event emitted when command fails.
 */
export interface CliStreamErrorEvent extends BaseCliStreamEvent {
  type: 'error'
  id?: string
  error: string
  errorType?: string
  recovery?: string
}

/**
 * Union type of all CLI stream events.
 */
export type CliStreamEvent =
  | CliStreamStartedEvent
  | CliStreamStepEvent
  | CliStreamProgressEvent
  | CliStreamOutputEvent
  | CliStreamRawEvent
  | CliStreamCompletedEvent
  | CliStreamErrorEvent

/**
 * Configuration options for the CLI stream hook.
 */
export interface UseCliStreamOptions {
  /** Command to execute */
  command: string
  /** Parameters to pass to the command */
  params?: Record<string, unknown>
  /** Whether the stream should automatically connect on mount */
  enabled?: boolean
  /** Callback invoked when a new event arrives */
  onEvent?: (event: CliStreamEvent) => void
  /** Callback invoked when output is received */
  onOutput?: (line: string) => void
  /** Callback invoked when command completes */
  onComplete?: (exitCode: number) => void
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
export interface CliStreamState {
  /** Whether currently connected and streaming */
  isStreaming: boolean
  /** Whether the connection is established */
  isConnected: boolean
  /** All events received so far */
  events: CliStreamEvent[]
  /** Output lines from command */
  output: string[]
  /** Current progress percentage (0-100) */
  progress: number
  /** Current step name */
  currentStep: string | null
  /** Latest error, if any */
  error: string | null
  /** Exit code when completed */
  exitCode: number | null
  /** Command duration in milliseconds */
  duration: number | null
}

/**
 * Stream controls returned by the hook.
 */
export interface CliStreamControls {
  /** Manually connect to the stream */
  connect: () => void
  /** Disconnect from the stream */
  disconnect: () => void
  /** Cancel the stream and close connection */
  cancel: () => void
  /** Clear all stored events */
  clearEvents: () => void
  /** Reconnect to the stream */
  reconnect: () => void
}

/**
 * Result type combining state and controls.
 */
export type UseCliStreamResult = CliStreamState & CliStreamControls


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
 * Parse SSE message data into a CliStreamEvent.
 * @param data - Raw data string from SSE event
 * @returns Parsed CliStreamEvent or null if invalid
 */
function parseSSEEvent(data: string): CliStreamEvent | null {
  try {
    const parsed = JSON.parse(data)
    // Ensure the event has a type field
    if (!parsed.type) {
      console.warn('[CLI-SSE] Dropping event without type:', parsed)
      return null
    }
    return parsed as CliStreamEvent
  } catch (err) {
    console.warn('[CLI-SSE] Failed to parse event:', err instanceof Error ? err.message : 'Unknown error', data)
    return null
  }
}

/**
 * Hook for connecting to CLI command SSE streams.
 *
 * @param options - Configuration options including command and params
 * @returns Stream state and controls
 *
 * @example
 * ```tsx
 * const { output, isStreaming, progress, cancel } = useCliStream({
 *   command: 'scan',
 *   params: { target: 'example.com' },
 *   onComplete: (code) => console.log('Exit code:', code),
 * })
 * ```
 */
export function useCliStream(options: UseCliStreamOptions): UseCliStreamResult {
  // State management
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<CliStreamEvent[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  // Refs for cleanup and reconnection
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const optionsRef = useRef<UseCliStreamOptions>(options)
  const retryCountRef = useRef(0)
  const manuallyCancelledRef = useRef(false)
  const connectRef = useRef<() => void>(() => {})

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Process incoming event - use ref to avoid dependency issues
  const processEventRef = useRef<(event: CliStreamEvent) => void>(() => {})

  useEffect(() => {
    processEventRef.current = (event: CliStreamEvent) => {
      setEvents((prev) => [...prev, event])

      // Update progress
      if (event.type === 'progress' || event.type === 'step') {
        setProgress(event.progress)
      }

      // Update current step
      if (event.type === 'step') {
        setCurrentStep(event.step)
      }

      // Handle output events
      if (event.type === 'output' || event.type === 'raw') {
        if (optionsRef.current.onOutput) {
          const line = event.type === 'output' ? event.message : event.line
          optionsRef.current.onOutput(line || '')
        }
      }

      // Handle completion
      if (event.type === 'completed') {
        setIsStreaming(false)
        setProgress(100)
        setExitCode(event.exitCode)
        setDuration(event.duration)
        if (optionsRef.current.onComplete) {
          optionsRef.current.onComplete(event.exitCode)
        }
      }

      // Handle errors
      if (event.type === 'error') {
        setError(event.error)
        setIsStreaming(false)
        if (optionsRef.current.onError) {
          optionsRef.current.onError(event.error)
        }
      }

      // Invoke user callback
      if (optionsRef.current.onEvent) {
        optionsRef.current.onEvent(event)
      }
    }
  }, [options.onEvent, options.onOutput, options.onComplete, options.onError])

  // Computed output array
  const output = useMemo(() => {
    return events
      .filter((e): e is CliStreamOutputEvent | CliStreamRawEvent =>
        e.type === 'output' || e.type === 'raw'
      )
      .map((e) => e.type === 'output' ? e.message : e.line)
      .filter((line): line is string => line !== undefined)
  }, [events])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Connect to SSE stream
  const connect = useCallback(() => {
    const opts = optionsRef.current
    if (!opts.enabled || !opts.command || eventSourceRef.current || manuallyCancelledRef.current) {
      return
    }

    // Build SSE URL
    const queryParams = new URLSearchParams()
    queryParams.append('command', opts.command)
    if (opts.params) {
      queryParams.append('params', JSON.stringify(opts.params))
    }
    const url = `/api/cli/stream?${queryParams.toString()}`

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

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        const parsed = parseSSEEvent(event.data)
        if (parsed) {
          processEventRef.current(parsed)
        }
      }

      // Handle errors with exponential backoff
      eventSource.onerror = () => {
        console.error('[CLI-SSE] Connection error')
        setIsConnected(false)
        setIsStreaming(false)

        const errorMsg = 'Connection to CLI stream failed'
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
          cleanup()
          if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
            setError('Connection failed after multiple attempts. Please try again.')
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to CLI stream'
      setError(errorMsg)
      setIsConnected(false)
      setIsStreaming(false)

      if (optionsRef.current.onError) {
        optionsRef.current.onError(errorMsg)
      }
    }
  }, [cleanup])

  // Keep connect ref updated
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  // Disconnect from stream
  const disconnect = useCallback(() => {
    cleanup()
    setIsStreaming(false)

    if (optionsRef.current.onDisconnect) {
      optionsRef.current.onDisconnect()
    }
  }, [cleanup])

  // Cancel stream (same as disconnect but also clears error and resets state)
  const cancel = useCallback(() => {
    manuallyCancelledRef.current = true
    disconnect()
    setError(null)
    setExitCode(null)
    setDuration(null)
  }, [disconnect])

  // Reconnect function (reset manual cancel flag)
  const reconnect = useCallback(() => {
    manuallyCancelledRef.current = false
    retryCountRef.current = 0
    connect()
  }, [connect])

  // Clear all stored events
  const clearEvents = useCallback(() => {
    setEvents([])
    setProgress(0)
    setCurrentStep(null)
    setError(null)
    setExitCode(null)
    setDuration(null)
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    const opts = optionsRef.current
    const shouldConnect = opts.enabled && opts.command && !manuallyCancelledRef.current
    if (shouldConnect) {
      // Schedule connect to next tick to avoid setState warning
      const timeoutId = setTimeout(() => {
        connect()
      }, 0)
      return () => {
        clearTimeout(timeoutId)
        cleanup()
      }
    }

    return cleanup
  }, [options.enabled, options.command, connect, cleanup])

  return {
    // State
    isStreaming,
    isConnected,
    events,
    output,
    progress,
    currentStep,
    error,
    exitCode,
    duration,
    // Controls
    connect,
    disconnect,
    cancel,
    clearEvents,
    reconnect,
  }
}
