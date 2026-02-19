/**
 * TimeRemaining Component
 *
 * Displays estimated time remaining for agent execution.
 * Formats milliseconds into human-readable time.
 */

'use client'

import { formatDuration } from '@/hooks/use-agent-stream'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for the TimeRemaining component.
 */
export interface TimeRemainingProps {
  /** Estimated time remaining in milliseconds */
  estimatedRemaining: number | null
  /** Whether the operation is complete */
  isComplete?: boolean
  /** Custom class names for styling */
  className?: string
}

/**
 * TimeRemaining component.
 *
 * Displays estimated time remaining with a clock icon.
 *
 * @example
 * ```tsx
 * <TimeRemaining estimatedRemaining={150000} />
 * // Displays: "2m 30s remaining"
 * ```
 */
export function TimeRemaining({
  estimatedRemaining,
  isComplete = false,
  className,
}: TimeRemainingProps) {
  // Don't show if complete
  if (isComplete) {
    return null
  }

  // Format the duration
  const timeText = formatDuration(estimatedRemaining ?? 0)

  return (
    <div className={cn('flex items-center gap-2 text-sm text-text-tertiary', className)}>
      <Clock className="h-4 w-4" />
      <span className="font-mono">{timeText}</span>
    </div>
  )
}
