/**
 * GET /api/workflows
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 *
 * Returns all workflows with optional search and category filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllWorkflows, getWorkflowsByCategory } from '@/lib/data/workflows-data';
import { searchWorkflows } from '@/lib/data/workflows-data';
import { Workflow, WorkflowCategory } from '@/lib/types/workflows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Validate category parameter if provided
    if (category) {
      const validCategories: WorkflowCategory[] = ['intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'];
      if (!validCategories.includes(category as WorkflowCategory)) {
        return NextResponse.json(
          {
            error: 'Invalid category parameter',
            message: `Category must be one of: ${validCategories.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    let workflows: Workflow[] = [];

    if (category) {
      workflows = getWorkflowsByCategory(category as WorkflowCategory);
    } else if (search) {
      // Sanitize search input
      const sanitized = search.trim().slice(0, 100);
      workflows = searchWorkflows(sanitized);
    } else {
      workflows = getAllWorkflows();
    }

    return NextResponse.json({
      workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch workflows',
      },
      { status: 500 }
    );
  }
}
