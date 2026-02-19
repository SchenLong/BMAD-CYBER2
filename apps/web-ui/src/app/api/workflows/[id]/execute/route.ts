/**
 * POST /api/workflows/[id]/execute
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 * Story 4.2: Agent Progress Events - Integrated with event emitter
 *
 * Executes a workflow with provided inputs and emits progress events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById } from '@/lib/data/workflows-data';
import { randomUUID } from 'crypto';
import { executeAgentWithEvents, getStepsForAgentType } from '@/lib/agents';
import type { AgentMetadata } from '@/types/events';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = getWorkflowById(id);

    if (!workflow) {
      return NextResponse.json(
        {
          error: 'Workflow not found',
          message: `No workflow found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { inputs = {}, options = {} } = body;

    // Validate inputs against workflow definition
    if (workflow.inputs) {
      for (const inputDef of workflow.inputs) {
        if (inputDef.required && !(inputDef.name in inputs)) {
          return NextResponse.json(
            {
              error: 'Missing required input',
              message: `Required input '${inputDef.name}' is missing`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Generate execution ID
    const executionId = randomUUID();

    // Determine agent type based on workflow team/category
    // Use a default agent type for workflows
    const agentType = workflow.team || 'bmm';

    // Create agent metadata for event emission
    const agentMetadata: AgentMetadata = {
      id: executionId,
      name: workflow.displayName,
      type: agentType as 'intel' | 'security' | 'ir' | 'legal' | 'strategy' | 'bmm' | 'bmgd' | 'custom',
      steps: getStepsForAgentType(agentType),
    };

    try {
      // Execute workflow with progress events
      const result = await executeAgentWithEvents(agentMetadata, async ({ emitMessage, emitStepStart, emitStepComplete }) => {
        // Emit initial message
        emitMessage(`Starting workflow: ${workflow.displayName}`, 'info');

        // Simulate workflow execution with steps
        const steps = agentMetadata.steps;

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];

          // Emit step start
          emitStepStart(step.id);

          // Simulate step processing
          await simulateWorkflowStep(step.id, workflow, inputs, { emitMessage });

          // Emit step complete
          emitStepComplete(step.id);
        }

        // Return workflow result
        return {
          message: `Workflow ${workflow.displayName} executed successfully`,
          outputFile: `_bmad-output/${id}-${executionId}.md`,
        };
      });

      const response = {
        executionId,
        workflowId: id,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        output: result?.message || 'Workflow executed successfully',
        outputFile: result?.outputFile,
      };

      return NextResponse.json(response);
    } catch (error) {
      // Error events are already emitted by executeAgentWithEvents
      console.error('Workflow execution error:', error);
      return NextResponse.json(
        {
          error: 'Workflow execution failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          executionId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to execute workflow',
      },
      { status: 500 }
    );
  }
}

/**
 * Simulate workflow step processing for demo purposes.
 * In production, this would be replaced with actual CLI bridge calls.
 *
 * @param stepId - Step identifier
 * @param workflow - Workflow being executed
 * @param inputs - User inputs
 * @param helpers - Emitter helpers
 */
async function simulateWorkflowStep(
  stepId: string,
  workflow: any,
  inputs: Record<string, unknown>,
  helpers: { emitMessage: (msg: string, level?: 'info' | 'warning' | 'success') => void }
): Promise<void> {
  // Simulate variable processing time
  const delay = Math.random() * 800 + 400;

  // Emit contextual messages based on step
  if (stepId === 'init' || stepId === 'initialization') {
    helpers.emitMessage(`Initializing ${workflow.displayName}...`, 'info');
  } else if (stepId === 'research' || stepId === 'requirements') {
    helpers.emitMessage('Gathering requirements...', 'info');
  } else if (stepId === 'analysis') {
    helpers.emitMessage('Analyzing inputs and context...', 'info');
  } else if (stepId === 'drafting' || stepId === 'design') {
    helpers.emitMessage('Creating content...', 'info');
  } else if (stepId === 'report' || stepId === 'validation' || stepId === 'review') {
    helpers.emitMessage('Finalizing output...', 'info');
  } else {
    helpers.emitMessage(`Processing ${stepId}...`, 'info');
  }

  await new Promise((resolve) => setTimeout(resolve, delay));
}
