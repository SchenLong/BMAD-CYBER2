/**
 * AgentProgress Component
 *
 * Main container component for displaying agent execution progress.
 * Integrates all sub-components to provide a comprehensive progress view.
 *
 * @see {@link ./progress-bar.tsx} - Progress bar component
 * @see {@link ./step-timeline.tsx} - Step timeline component
 * @see {@link ./live-output.tsx} - Live output component
 * @see {@link ./action-buttons.tsx} - Control buttons component
 */

'use client'

import { Card } from '@/components/ui/card'
import { useAgentStream } from '@/hooks/use-agent-stream'
import { AgentStatusHeader } from './agent-status-header'
import { ProgressBar } from './progress-bar'
import { TimeRemaining } from './time-remaining'
import { StepTimeline } from './step-timeline'
import { LiveOutput } from './live-output'
import { ActionButtons } from './action-buttons'
import { cn } from '@/lib/utils'

/**
 * Props for the AgentProgress component.
 */
export interface AgentProgressProps {
  /** The ID of the agent to observe */
  agentId: string | null
  /** The display name of the agent */
  agentName: string
  /** Known steps for this agent's workflow */
  steps?: string[]
  /** Custom class names for styling */
  className?: string
  /** Whether to auto-connect to the stream */
  enabled?: boolean
  /** Callback when stream connects */
  onConnect?: () => void
  /** Callback when stream disconnects */
  onDisconnect?: () => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
  /** Callback when agent completes */
  onComplete?: () => void
}

/**
 * AgentProgress container component.
 *
 * Displays a comprehensive view of agent execution progress including:
 * - Agent status header
 * - Progress bar with percentage
 * - Estimated time remaining
 * - Step timeline with visual indicators
 * - Live output logs
 * - Control buttons (pause, cancel)
 *
 * @example
 * ```tsx
 * <AgentProgress
 *   agentId="intel-agent-123"
 *   agentName="Intel Agent"
 *   steps={[
 *     "Initializing",
 *     "Collecting OSINT",
 *     "Analyzing findings",
 *     "Generating report"
 *   ]}
 * />
 * ```
 */
export function AgentProgress({
  agentId,
  agentName,
  steps = [],
  className,
  enabled = true,
  onConnect,
  onDisconnect,
  onError,
  onComplete,
}: AgentProgressProps) {
  const {
    isStreaming,
    isConnected,
    progress,
    currentStep,
    completedSteps,
    estimatedRemaining,
    error,
    recovery,
    messages,
    cancel,
  } = useAgentStream(agentId, {
    enabled,
    onConnect,
    onDisconnect,
    onError,
    onEvent: (event) => {
      if (event.type === 'done' && onComplete) {
        onComplete()
      }
    },
  })

  // Don't render if not connected and no events/states to show
  if (!isConnected && !isStreaming && progress === 0 && !error) {
    return null
  }

  const hasError = error !== null
  const isComplete = progress === 100 || (!isStreaming && completedSteps.length > 0)

  return (
    <Card
      className={cn(
        'cyber-card border-border/50 bg-background-elevated/50 backdrop-blur-sm',
        'overflow-hidden transition-all duration-300',
        hasError && 'border-accent-error/50',
        isComplete && 'border-accent-success/50',
        className
      )}
    >
      <div className="space-y-4 p-6">
        {/* Status Header */}
        <AgentStatusHeader
          agentName={agentName}
          isStreaming={isStreaming}
          isConnected={isConnected}
          hasError={hasError}
          isComplete={isComplete}
        />

        {/* Progress Bar */}
        <ProgressBar progress={progress} hasError={hasError} />

        {/* Time Remaining */}
        <TimeRemaining estimatedRemaining={estimatedRemaining} isComplete={isComplete} />

        {/* Step Timeline */}
        {steps.length > 0 && (
          <StepTimeline
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        )}

        {/* Error Display */}
        {hasError && (
          <div className="rounded-md bg-accent-error/10 border border-accent-error/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-error/20">
                <span className="text-accent-error text-sm">⚠</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-accent-error">Error Occurred</p>
                <p className="text-sm text-text-secondary mt-1">{error}</p>
                {recovery && (
                  <div className="mt-2 rounded bg-background-hover p-2">
                    <p className="text-xs text-text-tertiary">Suggested action:</p>
                    <p className="text-sm text-text-secondary">{recovery}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && !hasError && (
          <div className="rounded-md bg-accent-success/10 border border-accent-success/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-success/20">
                <span className="text-accent-success text-sm">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-accent-success">Operation Complete</p>
                <p className="text-sm text-text-secondary mt-1">
                  {agentName} has finished executing the workflow.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Output */}
        <LiveOutput messages={messages} />

        {/* Action Buttons */}
        <ActionButtons
          onCancel={cancel}
          isStreaming={isStreaming}
          isComplete={isComplete}
        />
      </div>
    </Card>
  )
}
