/**
 * Workflows API - v1
 * Story 8.1: RESTful API Implementation
 * Task 4: Workflow Endpoints
 *
 * GET /api/v1/workflows - List all available workflows
 *
 * Supports filtering by category, complexity, and search
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiValidationError } from '@/lib/api/response';
import {
  getAllWorkflows,
  getWorkflowsByCategory,
  searchWorkflows,
  getWorkflowsByComplexity,
} from '@/lib/data/workflows-data';
import { WorkflowCategory, WorkflowComplexity } from '@/lib/types/workflows';

/**
 * GET /api/v1/workflows
 * List all available workflows with optional filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const complexity = searchParams.get('complexity');
  const search = searchParams.get('search');
  const team = searchParams.get('team');

  // Validate category parameter if provided
  if (category) {
    const validCategories: WorkflowCategory[] = [
      'intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'
    ];
    if (!validCategories.includes(category as WorkflowCategory)) {
      return apiValidationError('Invalid category parameter', {
        validCategories,
        provided: category,
      });
    }
  }

  // Validate complexity parameter if provided
  if (complexity) {
    const validComplexities: WorkflowComplexity[] = ['beginner', 'intermediate', 'advanced'];
    if (!validComplexities.includes(complexity as WorkflowComplexity)) {
      return apiValidationError('Invalid complexity parameter', {
        validComplexities,
        provided: complexity,
      });
    }
  }

  let workflows = [];

  // Apply filters in order of specificity
  if (category) {
    workflows = getWorkflowsByCategory(category as WorkflowCategory);
  } else if (complexity) {
    workflows = getWorkflowsByComplexity(complexity as WorkflowComplexity);
  } else if (search) {
    const sanitized = search.trim().slice(0, 100);
    workflows = searchWorkflows(sanitized);
  } else {
    workflows = getAllWorkflows();
  }

  // Filter by team if provided (post-filter since getWorkflowsByTeam doesn't exist)
  if (team) {
    workflows = workflows.filter(w => w.team === team);
  }

  return apiSuccess({
    workflows: workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      displayName: workflow.displayName,
      description: workflow.description,
      category: workflow.category,
      team: workflow.team,
      estimatedDuration: workflow.estimatedDuration,
      complexity: workflow.complexity || 'intermediate',
      tags: workflow.tags || [],
      useCases: workflow.useCases || [],
    })),
    count: workflows.length,
  });
}
