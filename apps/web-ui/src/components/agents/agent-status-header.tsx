/**
 * AgentStatusHeader Component
 *
 * Displays the agent name with a visual status indicator.
 * Shows animated states for working, completed, or error conditions.
 */

'use client'

import { cn } from '@/lib/utils'

/**
 * Props for the AgentStatusHeader component.
 */
export interface AgentStatusHeaderProps {
  /** The display name of the agent */
  agentName: string
  /** Whether the agent is currently streaming/working */
  isStreaming: boolean
  /** Whether the connection is established */
  isConnected: boolean
  /** Whether there's an error */
  hasError?: boolean
  /** Whether the operation is complete */
  isComplete?: boolean
}

/**
 * AgentStatusHeader component.
 *
 * Displays the agent name with appropriate status indicator.
 *
 * @example
 * ```tsx
 * <AgentStatusHeader
 *   agentName="Intel Agent"
 *   isStreaming={true}
 *   isConnected={true}
 * />
 * ```
 */
export function AgentStatusHeader({
  agentName,
  isStreaming,
  isConnected,
  hasError = false,
  isComplete = false,
}: AgentStatusHeaderProps) {
  // Determine status text and indicator color
  let statusText = ''
  let statusColor = ''

  if (hasError) {
    statusText = 'encountered an error'
    statusColor = 'text-accent-error'
  } else if (isComplete) {
    statusText = 'completed successfully'
    statusColor = 'text-accent-success'
  } else if (isStreaming && isConnected) {
    statusText = 'is working...'
    statusColor = 'text-accent-secondary'
  } else if (isConnected) {
    statusText = 'is connected'
    statusColor = 'text-accent-primary'
  } else {
    statusText = 'is connecting...'
    statusColor = 'text-text-tertiary'
  }

  return (
    <div className="flex items-center gap-3">
      {/* Status Indicator */}
      <div className="relative">
        <div
          className={cn(
            'h-3 w-3 rounded-full transition-colors duration-300',
            hasError && 'bg-accent-error',
            isComplete && 'bg-accent-success',
            !hasError && !isComplete && isStreaming && 'bg-accent-secondary',
            !hasError && !isComplete && !isStreaming && 'bg-text-tertiary'
          )}
        />
        {/* Pulse animation for active streaming */}
        {isStreaming && isConnected && !hasError && (
          <>
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-accent-secondary/50 animate-ping" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-accent-secondary/30 animate-pulse" />
          </>
        )}
      </div>

      {/* Agent Name and Status */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg font-semibold text-text-primary font-heading">
          {agentName}
        </h3>
        <span className={cn('text-sm', statusColor)}>{statusText}</span>
      </div>
    </div>
  )
}
