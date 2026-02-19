/**
 * Chat Interface Component
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Main chat interface with message list, input, and suggestions.
 * Integrates all chat components and handles layer transitions.
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useConversationStore, ChatMessage } from '@/stores/conversation-store'
import { useLayerTransition } from '@/hooks/use-layer-transition'
import { MessageBubble } from './MessageBubble'
import { StreamingResponse } from './StreamingResponse'
import { SuggestedResponses } from './SuggestedResponses'
import { Layer2Guidance, type SuggestedTeam, type SuggestedWorkflow } from './Layer2Guidance'
import { ChatInput } from './ChatInput'
import { AbdulAvatar } from './AbdulAvatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Scroll } from 'lucide-react'
import { UserRoleType } from '@/lib/types/onboarding'

interface ChatInterfaceProps {
  userId: string
  userName?: string | null
  role?: UserRoleType | null
  className?: string
}

export function ChatInterface({
  userId,
  userName,
  role,
  className = '',
}: ChatInterfaceProps) {
  const {
    messages,
    currentLayer,
    setLayer,
    addMessage,
    updateMessage,
    updateContext,
    clearMessages,
    setTyping,
  } = useConversationStore()

  const [isSending, setIsSending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    transitionState,
    goBack,
    analyzeAndTransition,
    shouldShowSuggestions,
    getAnimationClass,
  } = useLayerTransition({
    animated: true,
    duration: 300,
    onLayerChange: (from, to) => {
      // Layer transition logged for debugging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`Layer transition: ${from} → ${to}`)
      }
    },
  })

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  // Show suggestions on Layer 2
  useEffect(() => {
    setShowSuggestions(currentLayer === 2)
  }, [currentLayer])

  // Send message to API
  const sendMessage = async (content: string) => {
    if (isSending) return

    setError(null)
    setIsSending(true)
    setTyping(true)

    // Add user message
    const userMessageId = addMessage({
      role: 'user',
      content,
    })

    // Analyze intent and transition if needed
    const analysis = await analyzeAndTransition(content)

    // Prepare for response
    const assistantMessageId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    setIsStreaming(true)
    setStreamingContent('')

    try {
      // Call chat API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId: useConversationStore.getState().sessionId,
          context: {
            layer: currentLayer,
            intent: analysis.intent,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {
              case 'content':
                fullContent += data.content
                setStreamingContent(fullContent)
                updateMessage(assistantMessageId, {
                  content: fullContent,
                })
                break
              case 'suggestions':
                setCurrentSuggestions(data.suggestions)
                break
              case 'context':
                updateContext(data.context)
                break
              case 'done':
                updateMessage(assistantMessageId, {
                  isStreaming: false,
                })
                break
              case 'error':
                throw new Error(data.error || 'Unknown error')
            }
          }
        }
      }

      // Update message with final content and suggestions
      updateMessage(assistantMessageId, {
        content: fullContent,
        suggestions: currentSuggestions,
        isStreaming: false,
      })
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      updateMessage(assistantMessageId, {
        content: '',
        isStreaming: false,
      })
    } finally {
      setIsSending(false)
      setIsStreaming(false)
      setStreamingContent('')
      setTyping(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    sendMessage(suggestion)
    setShowSuggestions(false)
  }

  // Handle back to Layer 1
  const handleBack = () => {
    setLayer(1)
    goBack()
  }

  // Get last assistant message suggestions
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant')

  const suggestions = lastAssistantMessage?.suggestions || currentSuggestions

  return (
    <div
      className={cn(
        'flex flex-col h-full max-w-4xl mx-auto',
        transitionState.isTransitioning && getAnimationClass(),
        className
      )}
    >
      {/* Header - Layer aware */}
      {currentLayer === 2 && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
              aria-label="Back to welcome"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Guidance Mode</h2>
              <p className="text-xs text-muted-foreground">
                Abdul will help clarify your request
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMessages}
            className="gap-2"
          >
            <Scroll className="size-4" />
            Clear
          </Button>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-1 -mx-1"
      >
        {/* Layer 1: Welcome state */}
        {currentLayer === 1 && messages.length === 0 && (
          <div className="animate-in fade-in duration-300">
            <AbdulAvatar userName={userName?.split(' ')[0]} role={role ?? null} />
            <Card className="p-6 bg-muted/30 mt-4">
              <ChatInput
                placeholder="What can I help you with today?"
                onSend={sendMessage}
                disabled={isSending}
              />
            </Card>
          </div>
        )}

        {/* Messages list */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={message.isStreaming}
          />
        ))}

        {/* Streaming response */}
        {isStreaming && streamingContent && (
          <StreamingResponse
            content={streamingContent}
            isStreaming={isStreaming}
            agentName="Abdul"
          />
        )}

        {/* Error state */}
        {error && (
          <Card className="p-4 border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (Layer 2) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SuggestedResponses
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            onDismiss={() => setShowSuggestions(false)}
            disabled={isSending}
          />
        </div>
      )}

      {/* Input - always visible */}
      <div className="mt-4">
        <ChatInput
          placeholder={
            currentLayer === 1
              ? 'What can I help you with today?'
              : 'Continue the conversation...'
          }
          onSend={sendMessage}
          disabled={isSending}
        />
      </div>
    </div>
  )
}

/**
 * Export hook for use conversation
 */
export function useChatInterface() {
  const {
    messages,
    currentLayer,
    isTyping,
  } = useConversationStore()

  return {
    messageCount: messages.length,
    currentLayer,
    isTyping,
  }
}
