/**
 * ProgressBar Component
 *
 * Displays agent execution progress as a visual bar with percentage.
 * Uses the shadcn/ui Progress component with custom styling.
 */

'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number
  /** Whether there's an error (changes color) */
  hasError?: boolean
  /** Custom class names for styling */
  className?: string
}

/**
 * ProgressBar component.
 *
 * Displays a progress bar with percentage text.
 *
 * @example
 * ```tsx
 * <ProgressBar progress={45} />
 * ```
 */
export function ProgressBar({ progress, hasError = false, className }: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress))
  const displayValue = Math.round(clampedProgress)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-tertiary">Progress</span>
        <span
          className={cn(
            'font-mono font-medium',
            hasError ? 'text-accent-error' : 'text-accent-secondary'
          )}
        >
          {displayValue}%
        </span>
      </div>
      <Progress
        value={clampedProgress}
        className={cn(
          'h-2 w-full transition-all duration-300',
          'bg-background-hover'
        )}
        role="progressbar"
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={hasError ? `Progress: ${displayValue}%, error encountered` : `Progress: ${displayValue}%`}
      />
    </div>
  )
}
