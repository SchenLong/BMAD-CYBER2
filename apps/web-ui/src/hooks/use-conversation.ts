/**
 * Conversation Hook
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Main hook for chat operations. Provides a clean interface
 * for sending messages and managing conversation state.
 */

import { useCallback } from 'react'
import { useConversationStore } from '@/stores/conversation-store'
import { useLayerTransition } from './use-layer-transition'

interface SendMessageOptions {
  onSuccess?: (messageId: string) => void
  onError?: (error: string) => void
}

export function useConversation() {
  const {
    messages,
    currentLayer,
    previousLayer,
    context,
    isTyping,
    sessionId,
    addMessage,
    updateMessage,
    updateContext,
    setLayer,
    clearMessages,
    setTyping,
    setSessionId,
  } = useConversationStore()

  const { analyzeAndTransition, goBack } = useLayerTransition()

  /**
   * Send a message to Abdul
   */
  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions = {}) => {
      if (!content.trim()) {
        return
      }

      setTyping(true)

      // Add user message
      const messageId = addMessage({
        role: 'user',
        content: content.trim(),
      })

      // Analyze intent for layer transition
      const analysis = await analyzeAndTransition(content.trim())

      try {
        // Create assistant message for response
        const assistantMessageId = addMessage({
          role: 'assistant',
          content: '',
          isStreaming: true,
        })

        // Call chat API
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
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
        let suggestions: string[] = []
        let contextUpdate: Record<string, unknown> = {}

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.type) {
                  case 'session':
                    setSessionId(data.sessionId)
                    break
                  case 'content':
                    fullContent += data.content
                    updateMessage(assistantMessageId, {
                      content: fullContent,
                    })
                    break
                  case 'suggestions':
                    suggestions = data.suggestions
                    break
                  case 'context':
                    contextUpdate = data.context
                    updateContext(data.context)
                    break
                  case 'done':
                    updateMessage(assistantMessageId, {
                      isStreaming: false,
                      suggestions,
                    })
                    break
                  case 'error':
                    throw new Error(data.error || 'Unknown error')
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }

        // Update with suggestions
        updateMessage(assistantMessageId, {
          suggestions,
        })

        options.onSuccess?.(messageId)
      } catch (error) {
        console.error('Send message error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to send message'

        // Add error message
        addMessage({
          role: 'system',
          content: errorMessage,
        })

        options.onError?.(errorMessage)
      } finally {
        setTyping(false)
      }
    },
    [
      addMessage,
      updateMessage,
      updateContext,
      setTyping,
      setSessionId,
      sessionId,
      currentLayer,
      analyzeAndTransition,
    ]
  )

  /**
   * Send a suggestion
   */
  const sendSuggestion = useCallback(
    (suggestion: string, options?: SendMessageOptions) => {
      return sendMessage(suggestion, options)
    },
    [sendMessage]
  )

  /**
   * Go back to previous layer
   */
  const goToPreviousLayer = useCallback(() => {
    goBack()
  }, [goBack])

  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    clearMessages()
  }, [clearMessages])

  /**
   * Get last assistant message with suggestions
   */
  const getLastAssistantMessage = useCallback(() => {
    return messages
      .slice()
      .reverse()
      .find((m) => m.role === 'assistant')
  }, [messages])

  /**
   * Get current suggestions
   */
  const getCurrentSuggestions = useCallback(() => {
    const lastAssistant = getLastAssistantMessage()
    return lastAssistant?.suggestions || []
  }, [getLastAssistantMessage])

  return {
    // State
    messages,
    currentLayer,
    previousLayer,
    context,
    isTyping,
    sessionId,

    // Actions
    sendMessage,
    sendSuggestion,
    goToPreviousLayer,
    clearConversation,

    // Queries
    getLastAssistantMessage,
    getCurrentSuggestions,
  }
}
