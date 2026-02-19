/**
 * ActionButtons Component
 *
 * Control buttons for agent execution.
 * Includes pause (output only) and cancel operations with confirmation dialog.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

/**
 * Props for the ActionButtons component.
 */
export interface ActionButtonsProps {
  /** Callback when cancel is confirmed */
  onCancel: () => void
  /** Whether the agent is currently streaming */
  isStreaming: boolean
  /** Whether the operation is complete */
  isComplete?: boolean
  /** Custom class names for styling */
  className?: string
}

/**
 * ActionButtons component.
 *
 * Displays control buttons for agent execution:
 * - Pause Output: Toggles output display (not execution pause)
 * - Cancel Operation: Terminates the agent with confirmation
 *
 * @example
 * ```tsx
 * <ActionButtons
 *   onCancel={() => console.log('Cancelled')}
 *   isStreaming={true}
 * />
 * ```
 */
export function ActionButtons({
  onCancel,
  isStreaming,
  isComplete = false,
  className,
}: ActionButtonsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCancel = () => {
    onCancel()
    setShowCancelDialog(false)
  }

  // Hide buttons when complete
  if (isComplete) {
    return null
  }

  return (
    <>
      <div className={cn('flex gap-2', className)}>
        {/* Cancel Operation Button */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowCancelDialog(true)}
          disabled={!isStreaming}
          className="text-xs"
        >
          Cancel Operation
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Operation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the agent and discard any in-progress results. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Resume</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleCancel}>
              Cancel Operation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
