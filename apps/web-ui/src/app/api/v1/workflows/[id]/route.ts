/**
 * Workflow Details API - v1
 * Story 8.1: RESTful API Implementation
 * Task 4: Workflow Endpoints
 *
 * GET /api/v1/workflows/:id - Get specific workflow details
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiNotFound } from '@/lib/api/response';
import { getWorkflowById } from '@/lib/data/workflows-data';

/**
 * GET /api/v1/workflows/:id
 * Get detailed information about a specific workflow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const workflowId = params.id;

  const workflow = getWorkflowById(workflowId);

  if (!workflow) {
    return apiNotFound('Workflow');
  }

  return apiSuccess({
    id: workflow.id,
    name: workflow.name,
    displayName: workflow.displayName,
    description: workflow.description,
    category: workflow.category,
    team: workflow.team,
    requiredAgents: workflow.requiredAgents,
    estimatedDuration: workflow.estimatedDuration,
    complexity: workflow.complexity || 'intermediate',
    inputs: workflow.inputs,
    outputs: workflow.outputs,
    tags: workflow.tags || [],
    useCases: workflow.useCases || [],
  });
}
