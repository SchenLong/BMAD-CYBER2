/**
 * StepTimeline Component
 *
 * Visualizes workflow steps with status indicators.
 * Shows completed, current, and pending steps with appropriate icons.
 */

'use client'

import { Check, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for the StepTimeline component.
 */
export interface StepTimelineProps {
  /** All step names in the workflow */
  steps: string[]
  /** The current step being executed */
  currentStep: string | null
  /** Array of completed step names */
  completedSteps: string[]
  /** Custom class names for styling */
  className?: string
  /** Layout direction - vertical or horizontal */
  layout?: 'vertical' | 'horizontal'
}

/**
 * Step status for a single step.
 */
interface StepStatus {
  isCompleted: boolean
  isCurrent: boolean
  isPending: boolean
}

/**
 * Get the status of a single step.
 */
function getStepStatus(
  step: string,
  currentStep: string | null,
  completedSteps: string[]
): StepStatus {
  const isCompleted = completedSteps.includes(step)
  const isCurrent = step === currentStep
  const isPending = !isCompleted && !isCurrent

  return { isCompleted, isCurrent, isPending }
}

/**
 * Render the appropriate icon for a step's status.
 */
function StepIcon({ status }: { status: StepStatus }) {
  if (status.isCompleted) {
    return <Check className="h-4 w-4 text-accent-success" />
  }

  if (status.isCurrent) {
    return (
      <div className="relative">
        <Loader2 className="h-4 w-4 text-accent-secondary animate-spin" />
        <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-accent-secondary/50" />
      </div>
    )
  }

  return <Circle className="h-4 w-4 text-text-tertiary/30 fill-none" />
}

/**
 * StepTimeline component.
 *
 * Displays workflow steps with visual status indicators.
 *
 * @example
 * ```tsx
 * <StepTimeline
 *   steps={[
 *     "Initializing",
 *     "Collecting OSINT",
 *     "Analyzing findings",
 *     "Generating report"
 *   ]}
 *   currentStep="Collecting OSINT"
 *   completedSteps={["Initializing"]}
 * />
 * ```
 */
export function StepTimeline({
  steps,
  currentStep,
  completedSteps,
  className,
  layout = 'vertical',
}: StepTimelineProps) {
  if (steps.length === 0) {
    return null
  }

  const isHorizontal = layout === 'horizontal'

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
        Workflow Steps
      </div>

      {isHorizontal ? (
        // Horizontal Layout
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step, currentStep, completedSteps)

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-all duration-200',
                  status.isCompleted && 'bg-accent-success/10 text-text-secondary',
                  status.isCurrent && 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/30',
                  status.isPending && 'bg-background-hover text-text-tertiary'
                )}
              >
                <StepIcon status={status} />
                <span className="truncate max-w-[120px]">{step}</span>
              </div>
            )
          })}
          {/* Connecting lines between steps */}
          <div className="flex items-center gap-1">
            {steps.map((_, index) => {
              if (index >= steps.length - 1) return null
              const stepStatus = getStepStatus(steps[index], currentStep, completedSteps)
              const nextStatus = getStepStatus(steps[index + 1], currentStep, completedSteps)
              const isCompletedPath = stepStatus.isCompleted || nextStatus.isCompleted

              return (
                <div
                  key={`connector-${index}`}
                  className={cn(
                    'h-px w-4',
                    isCompletedPath ? 'bg-accent-success/30' : 'bg-border-subtle'
                  )}
                />
              )
            })}
          </div>
        </div>
      ) : (
        // Vertical Layout
        <div className="space-y-1">
          {steps.map((step, index) => {
            const status = getStepStatus(step, currentStep, completedSteps)

            return (
              <div
                key={index}
                className={cn(
                  'relative flex items-center gap-3 text-sm py-1.5 px-2 rounded-md transition-all duration-200',
                  status.isCurrent && 'bg-accent-secondary/5 border border-accent-secondary/20'
                )}
              >
                <StepIcon status={status} />
                <span
                  className={cn(
                    'flex-1',
                    status.isCompleted && 'text-text-secondary',
                    status.isCurrent && 'text-text-primary font-medium',
                    status.isPending && 'text-text-tertiary'
                  )}
                >
                  {step}
                </span>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[7px] top-8 h-4 w-px -z-10',
                      status.isCompleted ? 'bg-accent-success/30' : 'bg-border-subtle'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
