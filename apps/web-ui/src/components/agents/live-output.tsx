/**
 * LiveOutput Component
 *
 * Displays real-time agent output in a collapsible, scrollable container.
 * Features auto-scroll, manual scroll pause, and timestamp formatting.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Scroll, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Props for the LiveOutput component.
 */
export interface LiveOutputProps {
  /** Array of message events to display */
  messages: Array<{ message: string; timestamp: string; level?: string }>
  /** Default open state */
  defaultOpen?: boolean
  /** Custom class names for styling */
  className?: string
  /** Maximum messages to keep (prevents memory issues) */
  maxMessages?: number
}

/**
 * Format timestamp for display.
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  } catch {
    return timestamp
  }
}

/**
 * LiveOutput component.
 *
 * Displays agent messages in a terminal-like container.
 * Features:
 * - Collapsible section
 * - Auto-scroll to latest message
 * - Manual scroll pause
 * - Monospace font for log-like appearance
 *
 * @example
 * ```tsx
 * <LiveOutput
 *   messages={[
 *     { message: "Initializing...", timestamp: "2024-01-01T10:00:00Z", level: "info" },
 *     { message: "Found 15 subdomains", timestamp: "2024-01-01T10:00:05Z", level: "success" }
 *   ]}
 * />
 * ```
 */
export function LiveOutput({
  messages,
  defaultOpen = true,
  className,
  maxMessages = 1000,
}: LiveOutputProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Limit messages to maxMessages
  const limitedMessages = messages.slice(-maxMessages)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [limitedMessages, autoScroll])

  // Handle manual scroll - pause auto-scroll if user scrolls up
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
      setAutoScroll(isAtBottom)
    }
  }

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setAutoScroll((prev) => !prev)
    if (!autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  // Don't render if no messages
  if (limitedMessages.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Header with trigger and controls */}
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              !isOpen && '-rotate-90'
            )}
          />
          <span className="font-medium">Live Output</span>
          <span className="text-text-tertiary">({limitedMessages.length})</span>
        </CollapsibleTrigger>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={toggleAutoScroll}
        >
          {autoScroll ? (
            <Pause className="h-3.5 w-3.5 text-text-tertiary" />
          ) : (
            <Play className="h-3.5 w-3.5 text-text-tertiary" />
          )}
        </Button>
      </div>

      {/* Scrollable content */}
      <CollapsibleContent>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'mt-3 h-48 overflow-y-auto rounded-md',
            'bg-black/50 border border-border/50',
            'p-3 font-mono text-xs',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50',
            'hover:scrollbar-thumb-border/70',
            className
          )}
        >
          {limitedMessages.map((msg, index) => {
            const level = msg.level ?? 'info'
            const levelColor = cn({
              'text-green-400': level === 'success',
              'text-yellow-400': level === 'warning',
              'text-red-400': level === 'error',
              'text-text-secondary': level === 'info',
            })

            return (
              <div key={index} className={cn('leading-relaxed', levelColor)}>
                <span className="text-text-tertiary">
                  [{formatTimestamp(msg.timestamp)}]
                </span>{' '}
                <span>{msg.message}</span>
              </div>
            )
          })}

          {/* Auto-scroll indicator */}
          {!autoScroll && (
            <div className="sticky bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2 bg-black/80 text-xs text-text-tertiary border-t border-border/50">
              <Scroll className="h-3 w-3" />
              <span>Auto-scroll paused</span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
