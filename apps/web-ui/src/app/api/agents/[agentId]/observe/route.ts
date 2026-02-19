/**
 * GET /api/agents/[agentId]/observe
 * Story 4.1: SSE Infrastructure
 *
 * SSE endpoint for streaming agent progress events.
 * Provides real-time updates from agent execution to connected clients.
 *
 * Runtime: 'nodejs' is required for streaming support (edge runtime doesn't support it).
 */

import { NextRequest } from 'next/server';
import { getAgentById } from '@/lib/data/agents-data';
import { streamManager } from '@/lib/sse/stream-manager';
import { sendEvent, createEvent, startKeepAlive } from '@/lib/sse/helpers';
import { SSE_HEADERS } from '@/lib/sse/types';

// Critical: Set runtime to 'nodejs' for streaming support
export const runtime = 'nodejs';

/**
 * GET handler for SSE endpoint.
 *
 * Establishes a Server-Sent Events connection for streaming agent progress.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing agent ID
 * @returns Response with ReadableStream for SSE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  // Validate agent exists
  const agent = getAgentById(agentId);
  if (!agent) {
    return new Response(
      JSON.stringify({
        error: 'Not found',
        message: `Agent with ID "${agentId}" not found`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create unique stream ID
  const streamId = crypto.randomUUID();

  // Create the readable stream
  const stream = new ReadableStream({
    start(controller) {
      console.log(`[SSE] Starting stream ${streamId} for agent ${agentId}`);

      // Register connection with stream manager
      streamManager.add(streamId, agentId, controller);

      // Send initial connection event
      const connectedEvent = createEvent('connected', {
        agentId,
        agentName: agent.name,
        streamId,
      });
      sendEvent(controller, connectedEvent);

      // Start keep-alive timer (prevent proxy/load balancer from closing idle connections)
      const stopKeepAlive = startKeepAlive(controller);

      // Handle client disconnect
      const cleanup = () => {
        console.log(`[SSE] Cleaning up stream ${streamId} for agent ${agentId}`);
        stopKeepAlive();
        streamManager.remove(streamId);
        try {
          controller.close();
        } catch (e) {
          // Controller may already be closed
        }
      };

      // Listen for abort signal (client disconnect)
      request.signal.addEventListener('abort', cleanup);

      // Note: ReadableStream doesn't have a standard error callback in the constructor
      // Error handling is done through try-catch in the enqueue operations
    },

    cancel() {
      // Cleanup when stream is cancelled
      console.log(`[SSE] Stream ${streamId} cancelled`);
      streamManager.remove(streamId);
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: SSE_HEADERS,
  });
}
