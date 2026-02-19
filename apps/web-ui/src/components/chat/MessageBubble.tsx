/**
 * Message Bubble Component
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Individual message display in chat interface.
 * Supports user and assistant (Abdul/agent) messages with distinct styling.
 */

'use client'

import { memo } from 'react'
import { Bot, User, Shield } from 'lucide-react'
import { ChatMessage } from '@/stores/conversation-store'
import { formatMessageTime, formatMessageContent } from '@/lib/message-utils'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  className?: string
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  className = '',
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  // System messages are typically hidden or shown differently
  if (isSystem) {
    return null
  }

  const timeString = formatMessageTime(message.timestamp)

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      data-role={message.role}
    >
      {/* Avatar */}
      <div
        className={cn(
          'size-10 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30'
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="size-5" />
        ) : message.agentName ? (
          <Shield className="size-5 text-accent-secondary" />
        ) : (
          <Bot className="size-5 text-accent-primary" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name (for agents) */}
        {!isUser && message.agentName && (
          <span className="text-xs text-accent-secondary mb-1 font-medium">
            {message.agentName}
          </span>
        )}
        {!isUser && !message.agentName && (
          <span className="text-xs text-accent-primary mb-1 font-medium">
            Abdul
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 break-words',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted/50 text-foreground border border-border-subtle rounded-bl-sm',
            isStreaming && 'animate-pulse'
          )}
        >
          {/* Content */}
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(message.content),
            }}
          />

          {/* Streaming indicator */}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <span className="animate-pulse">▊</span>
            </span>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <time
            className="text-xs text-muted-foreground"
            dateTime={message.timestamp.toISOString()}
          >
            {timeString}
          </time>
          {message.isStreaming && (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              typing...
            </span>
          )}
          {/* Read status for user messages */}
          {isUser && !message.isStreaming && (
            <span
              className="text-xs text-muted-foreground"
              aria-label="Message sent"
              title="Sent"
            >
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

/**
 * Compact variant for tight spaces
 */
interface MessageBubbleCompactProps {
  message: ChatMessage
  isStreaming?: boolean
  className?: string
}

export const MessageBubbleCompact = memo(function MessageBubbleCompact({
  message,
  isStreaming = false,
  className = '',
}: MessageBubbleCompactProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return null
  }

  return (
    <div
      className={cn(
        'flex gap-2 mb-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar - smaller */}
      <div
        className={cn(
          'size-8 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20'
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="size-4" />
        ) : (
          <Bot className="size-4 text-accent-primary" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          'rounded-xl px-3 py-2 max-w-[85%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-foreground border border-border-subtle',
          isStreaming && 'animate-pulse'
        )}
      >
        <p
          className="text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: formatMessageContent(message.content),
          }}
        />
      </div>
    </div>
  )
})
