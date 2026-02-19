/**
 * Streaming Response Component
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Real-time agent response display with streaming text effect.
 * Shows partial responses as they arrive from the server.
 */

'use client'

import { memo, useEffect, useState, useRef } from 'react'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamingResponseProps {
  content: string
  isStreaming: boolean
  onComplete?: () => void
  agentName?: string
  className?: string
  typingSpeed?: number // ms per character (0 = instant)
}

export const StreamingResponse = memo(function StreamingResponse({
  content,
  isStreaming,
  onComplete,
  agentName = 'Abdul',
  className = '',
  typingSpeed = 15, // 15ms per character for smooth typing effect
}: StreamingResponseProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousContentRef = useRef('')

  // Reset when content changes significantly
  useEffect(() => {
    // If content is shorter than displayed, we're starting fresh
    if (content.length < previousContentRef.current.length) {
      setDisplayedContent('')
      setIsComplete(false)
    }
    previousContentRef.current = content
  }, [content])

  // Streaming effect
  useEffect(() => {
    if (!isStreaming) {
      // Show full content immediately when not streaming
      setDisplayedContent(content)
      setIsComplete(true)
      return
    }

    if (typingSpeed === 0) {
      // Instant display
      setDisplayedContent(content)
      return
    }

    // Typing animation
    const targetLength = content.length
    const currentLength = displayedContent.length

    if (currentLength >= targetLength) {
      // Already displayed everything
      if (!isComplete && displayedContent.length > 0) {
        setIsComplete(true)
        onComplete?.()
      }
      return
    }

    // Add characters gradually
    timeoutRef.current = setTimeout(() => {
      const charsToAdd = Math.max(1, Math.floor(30 / typingSpeed)) // Add ~2 chars per 30ms frame
      const newLength = Math.min(currentLength + charsToAdd, targetLength)
      setDisplayedContent(content.substring(0, newLength))
    }, 30)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, displayedContent, isStreaming, typingSpeed, isComplete, onComplete])

  // Handle completion when streaming stops
  useEffect(() => {
    if (!isStreaming && displayedContent !== content) {
      setDisplayedContent(content)
    }
    if (!isStreaming && content.length > 0 && !isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [isStreaming, content, displayedContent, isComplete, onComplete])

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {/* Avatar with pulsing effect while streaming */}
      <div
        className={cn(
          'size-10 rounded-full flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30',
          isStreaming && 'animate-pulse'
        )}
        aria-hidden="true"
      >
        <Bot className="size-5 text-accent-primary" />
      </div>

      {/* Message Content */}
      <div className="flex flex-col max-w-[80%] items-start">
        {/* Agent Name */}
        <span className="text-xs text-accent-primary mb-1 font-medium">
          {agentName}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl rounded-bl-sm px-4 py-3 break-words',
            'bg-muted/50 text-foreground border border-border-subtle',
            isStreaming && 'animate-pulse'
          )}
        >
          {/* Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayedContent}
            {/* Cursor when streaming */}
            {isStreaming && displayedContent === content && (
              <span className="inline-block w-2 h-4 bg-accent-primary ml-1 animate-pulse" />
            )}
          </p>
        </div>

        {/* Streaming Status */}
        {isStreaming && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" />
            </div>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {agentName} is responding...
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

/**
 * Minimal typing indicator for loading states
 */
export function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={cn('flex gap-3 mb-4', className)}>
      <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30">
        <Bot className="size-5 text-accent-primary" />
      </div>

      <div className="flex items-center gap-2 bg-muted/50 border border-border-subtle rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" />
        </div>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          Abdul is thinking...
        </span>
      </div>
    </div>
  )
}

/**
 * Streaming response wrapper with error handling
 */
interface StreamingResponseWithErrorProps {
  content: string
  isStreaming: boolean
  error?: string | null
  onComplete?: () => void
  agentName?: string
  className?: string
}

export const StreamingResponseWithError = memo(
  function StreamingResponseWithError({
    content,
    isStreaming,
    error,
    onComplete,
    agentName = 'Abdul',
    className = '',
  }: StreamingResponseWithErrorProps) {
    if (error) {
      return (
        <div
          className={cn(
            'flex gap-3 mb-4',
            'border border-destructive/50 bg-destructive/10 rounded-2xl px-4 py-3',
            className
          )}
        >
          <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-destructive/20">
            <Bot className="size-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Error</p>
            <p className="text-sm text-foreground mt-1">{error}</p>
          </div>
        </div>
      )
    }

    return (
      <StreamingResponse
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
        agentName={agentName}
        className={className}
      />
    )
  }
)
