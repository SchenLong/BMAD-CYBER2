/**
 * POST /api/agents/[agentId]/invoke
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 * Story 4.2: Agent Progress Events - Integrated with event emitter
 *
 * Directly invokes an agent with a message and emits progress events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentById } from '@/lib/data/agents-data';
import { randomUUID } from 'crypto';
import { agentEventEmitter, executeAgentWithEvents, getStepsForAgentType } from '@/lib/agents';
import type { AgentMetadata } from '@/types/events';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { message, context = {} } = body;

    // Validate agent exists
    const agent = getAgentById(agentId);
    if (!agent) {
      return NextResponse.json(
        {
          error: 'Agent not found',
          message: `No agent found with ID: ${agentId}`,
        },
        { status: 404 }
      );
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid message',
          message: 'Message is required and must be non-empty',
        },
        { status: 400 }
      );
    }

    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 10000);

    // Generate invocation ID
    const invocationId = randomUUID();

    // Get agent metadata for event emission
    const agentMetadata: AgentMetadata = {
      id: agentId,
      name: agent.displayName,
      type: agent.team as 'intel' | 'security' | 'ir' | 'legal' | 'strategy' | 'bmm' | 'bmgd' | 'custom',
      steps: getStepsForAgentType(agent.team as 'intel' | 'security' | 'ir' | 'legal' | 'strategy' | 'bmm' | 'bmgd' | 'custom'),
    };

    // Execute agent with progress events
    try {
      const result = await executeAgentWithEvents(agentMetadata, async ({ emitMessage, emitStepStart, emitStepComplete }) => {
        // Emit initial message
        emitMessage(`Processing your request: "${sanitizedMessage.slice(0, 50)}..."`, 'info');

        // Simulate agent execution with steps
        // In production, this would call the actual CLI bridge
        const steps = agentMetadata.steps;

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];

          // Emit step start
          emitStepStart(step.id);

          // Simulate step processing with a delay
          await simulateStepWork(step.id, sanitizedMessage, { emitMessage });

          // Emit step complete
          emitStepComplete(step.id);
        }

        // Return mock response
        return {
          message: `Agent ${agent.displayName} processed your request.`,
          originalMessage: sanitizedMessage,
        };
      });

      const response = {
        invocationId,
        agentId,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        response: result?.message || 'Agent execution completed',
      };

      return NextResponse.json(response);
    } catch (error) {
      // Error events are already emitted by executeAgentWithEvents
      console.error('Agent execution error:', error);
      return NextResponse.json(
        {
          error: 'Agent execution failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          invocationId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to invoke agent',
      },
      { status: 500 }
    );
  }
}

/**
 * Simulate step work for demo purposes.
 * In production, this would be replaced with actual CLI bridge calls.
 *
 * @param stepId - Step identifier
 * @param message - User message
 * @param helpers - Emitter helpers
 */
async function simulateStepWork(
  stepId: string,
  message: string,
  helpers: { emitMessage: (msg: string, level?: 'info' | 'warning' | 'success') => void }
): Promise<void> {
  // Simulate variable processing time based on step
  const delay = Math.random() * 1000 + 500;

  // Emit some progress messages during step execution
  if (stepId === 'osint' || stepId === 'scan') {
    helpers.emitMessage('Collecting data...', 'info');
  }

  if (stepId === 'analysis') {
    helpers.emitMessage('Analyzing findings...', 'info');
  }

  if (stepId === 'report') {
    helpers.emitMessage('Generating report...', 'info');
  }

  await new Promise((resolve) => setTimeout(resolve, delay));
}
