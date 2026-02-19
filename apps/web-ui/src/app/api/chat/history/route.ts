/**
 * Chat History API Endpoint
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * GET /api/chat/history - Fetch conversation history
 * DELETE /api/chat/history - Clear conversation history
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/../auth'

export const runtime = 'nodejs'

/**
 * GET handler - Fetch conversation history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get session ID from query params
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    // For now, return empty history
    // In production, this would fetch from a database
    // using the sessionId as the key
    return NextResponse.json({
      sessionId,
      messages: [],
      context: {},
    })
  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Clear conversation history
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId } = body

    // In production, this would delete from database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'History cleared',
    })
  } catch (error) {
    console.error('Chat history delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
