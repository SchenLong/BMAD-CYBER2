/**
 * Suggested Responses Component
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Clickable suggestion chips for quick user responses.
 * Supports keyboard navigation (1-4 keys) and auto-dismissal.
 */

'use client'

import { memo, useEffect, useCallback, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestedResponsesProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  onDismiss?: () => void
  autoHide?: boolean
  maxSuggestions?: number
  className?: string
  disabled?: boolean
}

export const SuggestedResponses = memo(function SuggestedResponses({
  suggestions,
  onSelect,
  onDismiss,
  autoHide = true,
  maxSuggestions = 4,
  className = '',
  disabled = false,
}: SuggestedResponsesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Limit suggestions
  const limitedSuggestions = suggestions.slice(0, maxSuggestions)

  // Auto-hide after user responds (if enabled)
  useEffect(() => {
    if (!autoHide || !onDismiss || disabled) return

    // Hide after selection is made externally
    const handleInteraction = () => {
      onDismiss()
    }

    // Listen for message send event (dispatched by parent)
    window.addEventListener('chat-message-sent', handleInteraction)
    return () => {
      window.removeEventListener('chat-message-sent', handleInteraction)
    }
  }, [autoHide, onDismiss, disabled])

  // Keyboard navigation (1-4 keys)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return

      const key = parseInt(e.key, 10)
      if (key >= 1 && key <= limitedSuggestions.length) {
        e.preventDefault()
        const suggestion = limitedSuggestions[key - 1]
        onSelect(suggestion)

        // Dispatch event for auto-hide
        if (autoHide && onDismiss) {
          window.dispatchEvent(new Event('chat-message-sent'))
        }
      }
    },
    [limitedSuggestions, onSelect, autoHide, onDismiss, disabled]
  )

  useEffect(() => {
    if (limitedSuggestions.length === 0) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, limitedSuggestions.length])

  // Focus management
  useEffect(() => {
    if (containerRef.current && !disabled) {
      // Announce suggestions to screen readers
      const liveRegion = containerRef.current.querySelector('[role="status"]')
      liveRegion?.setAttribute('aria-live', 'polite')
    }
  }, [disabled])

  if (limitedSuggestions.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-wrap gap-2 mt-3',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="group"
      aria-label="Suggested responses"
    >
      <span
        role="status"
        className="sr-only"
        aria-live="polite"
      >
        {limitedSuggestions.length} suggested responses available. Press 1-
        {limitedSuggestions.length} to select.
      </span>

      {limitedSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => {
            if (!disabled) {
              onSelect(suggestion)
              if (autoHide && onDismiss) {
                window.dispatchEvent(new Event('chat-message-sent'))
              }
            }
          }}
          disabled={disabled}
          className={cn(
            'group relative inline-flex items-center gap-2',
            'px-4 py-2 rounded-full',
            'bg-muted/30 border border-border-subtle',
            'hover:bg-accent-primary/10 hover:border-accent-primary/30',
            'active:scale-95 transition-all duration-200',
            'text-sm text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Select suggestion: ${suggestion}`}
          data-suggestion-index={index + 1}
        >
          {/* Keyboard hint */}
          <span
            className={cn(
              'size-5 rounded flex items-center justify-center',
              'bg-muted-foreground/20 text-muted-foreground text-xs font-mono',
              'group-hover:bg-accent-primary/20 group-hover:text-accent-primary',
              'transition-colors'
            )}
            aria-hidden="true"
          >
            {index + 1}
          </span>

          {/* Suggestion text */}
          <span className="flex-1 text-left">{suggestion}</span>

          {/* Arrow icon */}
          <ChevronRight
            className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </button>
      ))}

      {/* Keyboard hint text */}
      <p className="w-full text-xs text-muted-foreground mt-1" aria-live="polite">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">1</kbd>
        {'–'}
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
          {limitedSuggestions.length}
        </kbd>
        {' '}to select
      </p>
    </div>
  )
})

/**
 * Compact variant for smaller spaces
 */
interface SuggestedResponsesCompactProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  onDismiss?: () => void
  className?: string
  disabled?: boolean
}

export const SuggestedResponsesCompact = memo(
  function SuggestedResponsesCompact({
    suggestions,
    onSelect,
    onDismiss,
    className = '',
    disabled = false,
  }: SuggestedResponsesCompactProps) {
    const limitedSuggestions = suggestions.slice(0, 3)

    if (limitedSuggestions.length === 0) {
      return null
    }

    return (
      <div
        className={cn(
          'flex flex-col gap-1 mt-2',
          'animate-in fade-in slide-in-from-bottom-1 duration-200',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        role="group"
        aria-label="Quick responses"
      >
        {limitedSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              if (!disabled) {
                onSelect(suggestion)
                onDismiss?.()
              }
            }}
            disabled={disabled}
            className={cn(
              'text-left px-3 py-2 rounded-lg',
              'bg-muted/20 hover:bg-muted/40',
              'text-sm text-muted-foreground hover:text-foreground',
              'active:scale-[0.98] transition-all',
              'focus:outline-none focus:ring-1 focus:ring-accent-primary/50',
              disabled && 'cursor-not-allowed'
            )}
          >
            <span className="text-muted-foreground/50 mr-2 font-mono text-xs">
              {index + 1}.
            </span>
            {suggestion}
          </button>
        ))}
      </div>
    )
  }
)

/**
 * Pill variant for horizontal display
 */
export const SuggestedResponsesPill = memo(function SuggestedResponsesPill({
  suggestions,
  onSelect,
  onDismiss,
  className = '',
  disabled = false,
}: SuggestedResponsesCompactProps) {
  const limitedSuggestions = suggestions.slice(0, 4)

  if (limitedSuggestions.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 mt-3',
        'animate-in fade-in duration-200',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="group"
      aria-label="Suggested responses"
    >
      {limitedSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => {
            if (!disabled) {
              onSelect(suggestion)
              onDismiss?.()
            }
          }}
          disabled={disabled}
          className={cn(
            'px-3 py-1.5 rounded-full',
            'border border-border-subtle bg-background',
            'hover:border-accent-primary/50 hover:bg-accent-primary/5',
            'text-sm text-foreground',
            'active:scale-95 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
            disabled && 'cursor-not-allowed'
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
})
