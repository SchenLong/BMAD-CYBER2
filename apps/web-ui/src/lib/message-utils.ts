/**
 * Message Utilities
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Utility functions for formatting, sanitizing, and processing chat messages.
 */

import { ChatMessage } from '@/stores/conversation-store'

/**
 * Sanitize message content to prevent XSS
 * Converts potentially dangerous HTML to safe text
 */
export function sanitizeMessage(content: string): string {
  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '')

  // Escape common HTML entities
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }

  sanitized = sanitized.replace(/[&<>"']/g, (char) => escapeMap[char] || char)

  return sanitized
}

/**
 * Format message timestamp for display
 */
export function formatMessageTime(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Today
  if (timestamp.toDateString() === now.toDateString()) {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (timestamp.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`
  }

  // Older
  return timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format message content with markdown-like syntax
 * Supports: **bold**, *italic*, `code`
 */
export function formatMessageContent(content: string): string {
  // Escape HTML first
  let formatted = sanitizeMessage(content)

  // Code blocks
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

  // Bold
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br />')

  return formatted
}

/**
 * Validate message length
 */
export function validateMessageLength(message: string, maxLength = 5000): {
  valid: boolean
  remaining: number
  truncated?: string
} {
  if (message.length <= maxLength) {
    return {
      valid: true,
      remaining: maxLength - message.length,
    }
  }

  return {
    valid: false,
    remaining: 0,
    truncated: message.substring(0, maxLength),
  }
}

/**
 * Check if message contains potential command
 */
export function isCommand(message: string): boolean {
  return message.trim().startsWith('/')
}

/**
 * Extract command from message
 */
export function extractCommand(message: string): {
  command: string
  args: string[]
} | null {
  const trimmed = message.trim()
  if (!trimmed.startsWith('/')) {
    return null
  }

  const parts = trimmed.slice(1).split(/\s+/)
  const command = parts[0]
  const args = parts.slice(1)

  return { command, args }
}

/**
 * Generate typing indicator animation frames
 */
export function getTypingIndicatorFrames(): string[] {
  return ['.', '..', '...']
}

/**
 * Truncate message for preview
 */
export function truncateMessage(message: string, maxLength = 50): string {
  if (message.length <= maxLength) {
    return message
  }
  return `${message.substring(0, maxLength)}...`
}

/**
 * Get message status text
 */
export function getMessageStatusText(message: ChatMessage): string | null {
  if (message.isStreaming) {
    return 'Abdul is typing...'
  }

  const now = new Date()
  const timeDiff = now.getTime() - message.timestamp.getTime()

  if (timeDiff < 1000) {
    return 'Just now'
  }

  return null
}

/**
 * Parse suggestions from AI response
 * Expects format: [suggestion1, suggestion2, ...]
 */
export function parseSuggestions(content: string): string[] {
  const suggestionMatch = content.match(/\[([^\]]+)\](?!\()$/)
  if (!suggestionMatch) {
    return []
  }

  const suggestionsText = suggestionMatch[1]
  // Split by comma and trim
  return suggestionsText
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter((s) => s.length > 0)
}

/**
 * Strip suggestions from content for display
 */
export function stripSuggestionsFromContent(content: string): string {
  return content.replace(/\s*\[[^\]]+\]$/, '').trim()
}

/**
 * Detect intent from user message
 * Simple keyword-based intent detection
 */
export type MessageIntent =
  | 'investigation'
  | 'security'
  | 'strategy'
  | 'general'
  | 'unknown'

export function detectIntent(message: string): MessageIntent {
  const lower = message.toLowerCase()

  const intentKeywords: Record<MessageIntent, string[]> = {
    investigation: ['investigate', 'lookup', 'find', 'search', 'track', 'osint', 'person', 'company'],
    security: ['security', 'vulnerability', 'pentest', 'penetration', 'scan', 'audit', 'incident', 'threat'],
    strategy: ['strategy', 'plan', 'risk', 'crisis', 'board', 'executive', 'advisory'],
    general: ['help', 'what', 'how', 'can you', 'i need'],
    unknown: [],
  }

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return intent as MessageIntent
    }
  }

  return 'unknown'
}

/**
 * Clarifying questions by intent type
 */
export const CLARIFYING_QUESTIONS: Record<
  string,
  { question: string; suggestions: string[] }
> = {
  investigation: {
    question: 'Are you investigating a person, company, or potential threat?',
    suggestions: [
      'A person',
      'A company',
      'A threat actor',
      'Not sure yet',
    ],
  },
  security: {
    question: 'What type of security assessment do you need?',
    suggestions: [
      'Vulnerability scan',
      'Penetration test',
      'Security audit',
      'Incident response',
    ],
  },
  strategy: {
    question: 'What strategic challenge are you facing?',
    suggestions: [
      'Risk assessment',
      'Crisis planning',
      'Executive advisory',
      'Board communication',
    ],
  },
  general: {
    question: 'How can I help you today?',
    suggestions: [
      'Start a new investigation',
      'Security assessment',
      'Strategic planning',
      'Just exploring',
    ],
  },
}

/**
 * Get clarifying question for intent
 */
export function getClarifyingQuestion(
  intent: MessageIntent
): { question: string; suggestions: string[] } {
  return CLARIFYING_QUESTIONS[intent] || CLARIFYING_QUESTIONS.general
}
