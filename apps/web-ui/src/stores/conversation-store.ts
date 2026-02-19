/**
 * Conversation Store - Chat State Management
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Manages chat messages, conversation context, and layer state
 * for the progressive disclosure interface.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

/**
 * Message roles in the conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  suggestions?: string[]
  isStreaming?: boolean
  agentId?: string
  agentName?: string
}

/**
 * Layer in progressive disclosure
 */
export type Layer = 1 | 2 | 3 | 4

/**
 * Suggested team/workflow from context analysis
 */
export interface SuggestedTeam {
  id: string
  name: string
  description: string
  icon?: string
}

export interface SuggestedWorkflow {
  id: string
  name: string
  description: string
  team: string
}

/**
 * Conversation context for intelligent responses
 */
export interface ConversationContext {
  userIntent?: string
  suggestedTeams?: SuggestedTeam[]
  suggestedWorkflows?: SuggestedWorkflow[]
  currentTopic?: string
  requiresTeam?: boolean
  requiresWorkflow?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Message status for optimistic updates
 */
export type MessageStatus = 'sending' | 'sent' | 'error'

/**
 * Conversation store state and actions
 */
interface ConversationState {
  // Messages
  messages: ChatMessage[]
  maxMessages: number

  // Layer state
  currentLayer: Layer
  previousLayer: Layer | null

  // Context
  context: ConversationContext

  // Session
  sessionId: string | null
  isTyping: boolean

  // Actions - Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void

  // Actions - Layer
  setLayer: (layer: Layer) => void
  goToPreviousLayer: () => void

  // Actions - Context
  updateContext: (context: Partial<ConversationContext>) => void
  clearContext: () => void

  // Actions - Session
  setSessionId: (id: string) => void
  setTyping: (isTyping: boolean) => void

  // Actions - Utility
  getMessageById: (id: string) => ChatMessage | undefined
  getLastMessage: () => ChatMessage | undefined
  getLastUserMessage: () => ChatMessage | undefined
  getLastAssistantMessage: () => ChatMessage | undefined
}

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Message limit to prevent memory issues
 */
const MAX_MESSAGES = 100

export const useConversationStore = create<ConversationState>()(
  immer((set, get) => ({
    // Initial state
    messages: [],
    maxMessages: MAX_MESSAGES,
    currentLayer: 1,
    previousLayer: null,
    context: {},
    sessionId: null,
    isTyping: false,

    // Message actions
    addMessage: (message) => {
      const id = generateMessageId()
      const newMessage: ChatMessage = {
        ...message,
        id,
        timestamp: new Date(),
      }

      set((state) => {
        // Add new message
        state.messages.push(newMessage)

        // Trim old messages if over limit
        if (state.messages.length > state.maxMessages) {
          const excess = state.messages.length - state.maxMessages
          state.messages = state.messages.slice(excess)
        }

        // Initialize session if needed
        if (!state.sessionId) {
          state.sessionId = generateSessionId()
        }
      })

      return id
    },

    updateMessage: (id, updates) => {
      set((state) => {
        const index = state.messages.findIndex((m) => m.id === id)
        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            ...updates,
          }
        }
      })
    },

    removeMessage: (id) => {
      set((state) => {
        state.messages = state.messages.filter((m) => m.id !== id)
      })
    },

    clearMessages: () => {
      set((state) => {
        state.messages = []
        state.context = {}
        state.currentLayer = 1
        state.previousLayer = null
      })
    },

    // Layer actions
    setLayer: (layer) => {
      set((state) => {
        state.previousLayer = state.currentLayer
        state.currentLayer = layer
      })
    },

    goToPreviousLayer: () => {
      set((state) => {
        if (state.previousLayer !== null) {
          const temp = state.currentLayer
          state.currentLayer = state.previousLayer
          state.previousLayer = temp
        }
      })
    },

    // Context actions
    updateContext: (contextUpdate) => {
      set((state) => {
        state.context = {
          ...state.context,
          ...contextUpdate,
        }
      })
    },

    clearContext: () => {
      set((state) => {
        state.context = {}
      })
    },

    // Session actions
    setSessionId: (id) => {
      set((state) => {
        state.sessionId = id
      })
    },

    setTyping: (isTyping) => {
      set((state) => {
        state.isTyping = isTyping
      })
    },

    // Utility actions
    getMessageById: (id) => {
      return get().messages.find((m) => m.id === id)
    },

    getLastMessage: () => {
      const messages = get().messages
      return messages[messages.length - 1]
    },

    getLastUserMessage: () => {
      const messages = get().messages
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          return messages[i]
        }
      }
      return undefined
    },

    getLastAssistantMessage: () => {
      const messages = get().messages
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          return messages[i]
        }
      }
      return undefined
    },
  }))
)
