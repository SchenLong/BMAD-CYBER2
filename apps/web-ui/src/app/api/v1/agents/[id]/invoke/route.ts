/**
 * Agent Invocation API - v1
 * Story 8.1: RESTful API Implementation
 * Task 3: Agent Endpoints
 *
 * POST /api/v1/agents/:id/invoke - Invoke an agent with input
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiValidationError, apiNotFound, apiUnauthorized } from '@/lib/api/response';
import { getAgentById } from '@/lib/data/agents-data';
import { validateSession } from '@/lib/auth/session';
import { z } from 'zod';

/**
 * Schema for agent invocation request
 */
const invokeAgentSchema = z.object({
  input: z.string().min(1).max(10000),
  context: z.record(z.string(), z.any()).optional(),
  stream: z.boolean().optional(),
  sessionId: z.string().optional(),
});

/**
 * POST /api/v1/agents/:id/invoke
 * Invoke a specific agent with input
 *
 * Note: This is a placeholder implementation.
 * Actual agent invocation will be handled by the backend integration.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const { id: agentId } = await params;

  // Verify agent exists
  const agent = getAgentById(agentId);
  if (!agent) {
    return apiNotFound('Agent');
  }

  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return apiValidationError('Invalid JSON body');
  }

  const validationResult = invokeAgentSchema.safeParse(body);
  if (!validationResult.success) {
    return apiValidationError('Invalid input format', {
      issues: validationResult.error.issues,
    });
  }

  const { input, context, stream, sessionId } = validationResult.data;

  // Placeholder response - actual implementation will connect to agent execution
  // For now, return a response indicating the agent would be invoked
  return apiSuccess({
    agentId,
    agentName: agent.displayName,
    invocationId: `inv_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    status: 'pending',
    message: 'Agent invocation requires backend integration',
    input: {
      provided: true,
      length: input.length,
      hasContext: !!context,
      streamRequested: stream,
      sessionId,
    },
    nextSteps: [
      'Backend agent execution integration required',
      'SSE streaming for real-time output (Story 4.2)',
      'Integration with BMAD CLI via cli-bridge (Story 5.x)',
    ],
  }, 202); // 202 Accepted
}
