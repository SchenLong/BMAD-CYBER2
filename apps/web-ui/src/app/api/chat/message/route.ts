/**
 * Chat Message API Endpoint
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * POST /api/chat/message
 *
 * Processes user messages and returns Abdul's response with:
 * - Clarifying questions based on user intent
 * - Suggested responses for quick selection
 * - Team/workflow recommendations
 *
 * Supports streaming responses via Server-Sent Events (SSE).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/../auth'
import { detectIntent, getClarifyingQuestion } from '@/lib/message-utils'
import { checkRateLimit, createRateLimitResponse, setRateLimitHeaders } from '@/middleware/rate-limit'

// Set runtime to nodejs for streaming support
export const runtime = 'nodejs'

/**
 * Message request schema
 */
interface ChatMessageRequest {
  message: string
  sessionId?: string
  context?: {
    layer?: number
    intent?: string
    [key: string]: unknown
  }
}

/**
 * Validate request
 */
function validateRequest(req: ChatMessageRequest): {
  valid: boolean
  error?: string
} {
  if (!req.message || typeof req.message !== 'string') {
    return { valid: false, error: 'Message is required' }
  }

  if (req.message.length > 5000) {
    return { valid: false, error: 'Message too long (max 5000 characters)' }
  }

  if (req.message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  return { valid: true }
}

/**
 * Get Abdul's response based on user intent
 */
function getAbdulResponse(
  message: string,
  intent: string
): {
  response: string
  suggestions: string[]
  context?: Record<string, unknown>
} {
  const clarifying = getClarifyingQuestion(intent as any)

  // Build response
  const response = clarifying.question

  return {
    response,
    suggestions: clarifying.suggestions,
    context: {
      userIntent: intent,
      requiresTeam: true,
      requiresWorkflow: false,
    },
  }
}

/**
 * Generate suggested teams based on intent
 */
function getSuggestedTeams(intent: string): Array<{
  id: string
  name: string
  description: string
  icon: string
}> {
  const teamMap: Record<string, Array<{ id: string; name: string; description: string; icon: string }>> = {
    investigation: [
      { id: 'intel-team', name: 'Intel Team', description: 'OSINT and social media analysis', icon: '🕵️' },
      { id: 'dopplegang-hunt', name: 'Doppelganger Hunt', description: 'Find fake accounts and impersonators', icon: '👯' },
    ],
    security: [
      { id: 'cybersec-team', name: 'Cybersecurity Team', description: 'Vulnerability assessments and penetration testing', icon: '🛡️' },
      { id: 'incident-response', name: 'Incident Response', description: 'Handle security breaches and threats', icon: '🚨' },
    ],
    strategy: [
      { id: 'strategy-team', name: 'Strategy Team', description: 'Strategic planning and risk assessment', icon: '♟️' },
      { id: 'legal-team', name: 'Legal Team', description: 'Contract review and compliance', icon: '⚖️' },
    ],
  }

  return teamMap[intent] || []
}

/**
 * Generate suggested workflows based on intent
 */
function getSuggestedWorkflows(intent: string): Array<{
  id: string
  name: string
  description: string
  team: string
}> {
  const workflowMap: Record<string, Array<{ id: string; name: string; description: string; team: string }>> = {
    investigation: [
      { id: 'flash-assessment', name: 'Flash Assessment', description: 'Quick 15-minute OSINT analysis', team: 'Intel Team' },
      { id: 'doppelganger-hunt', name: 'Doppelganger Hunt', description: 'Identify fake accounts', team: 'Intel Team' },
      { id: 'attribution-chain', name: 'Attribution Chain', description: 'Build evidence-based attribution', team: 'Intel Team' },
    ],
    security: [
      { id: 'vulnerability-scan', name: 'Vulnerability Scan', description: 'Identify security weaknesses', team: 'Cybersecurity Team' },
      { id: 'threat-modeling', name: 'Threat Modeling', description: 'STRIDE-based threat analysis', team: 'Cybersecurity Team' },
      { id: 'incident-response-playbook', name: 'Incident Response', description: 'Handle security incidents', team: 'Cybersecurity Team' },
    ],
    strategy: [
      { id: 'strategic-planning', name: 'Strategic Planning', description: 'Long-term strategic planning', team: 'Strategy Team' },
      { id: 'risk-assessment', name: 'Risk Assessment', description: 'Comprehensive risk evaluation', team: 'Strategy Team' },
    ],
  }

  return workflowMap[intent] || []
}

/**
 * POST handler - Process message and stream response
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check rate limit - Chat specific limits (stricter than general API)
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Parse request
    const body: ChatMessageRequest = await request.json()
    const validation = validateRequest(body)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { message, sessionId, context } = body

    // Detect user intent
    const intent = detectIntent(message)
    const abdulResponse = getAbdulResponse(message, intent)

    // Get suggestions based on intent
    const suggestedTeams = getSuggestedTeams(intent)
    const suggestedWorkflows = getSuggestedWorkflows(intent)

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session info
          const sessionData = {
            type: 'session',
            sessionId: sessionId || `session_${Date.now()}`,
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(sessionData)}\n\n`)
          )

          // Stream response content character by character for effect
          const responseText = abdulResponse.response
          const chunkSize = 3 // Characters per chunk

          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.substring(i, i + chunkSize)
            const contentData = {
              type: 'content',
              content: chunk,
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(contentData)}\n\n`)
            )

            // Small delay for typing effect
            await new Promise((resolve) => setTimeout(resolve, 15))
          }

          // Send suggestions
          const suggestionsData = {
            type: 'suggestions',
            suggestions: abdulResponse.suggestions,
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(suggestionsData)}\n\n`)
          )

          // Send context with team/workflow suggestions
          const contextData = {
            type: 'context',
            context: {
              ...abdulResponse.context,
              suggestedTeams,
              suggestedWorkflows,
            },
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(contextData)}\n\n`)
          )

          // Send completion
          const doneData = { type: 'done' }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`)
          )

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream error',
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          )
          controller.close()
        }
      },
    })

    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })

    // Add rate limit headers
    setRateLimitHeaders(response as unknown as NextResponse, rateLimitResult)

    return response
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
