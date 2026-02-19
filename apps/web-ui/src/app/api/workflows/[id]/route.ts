/**
 * GET /api/workflows/[id]
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 *
 * Returns details for a specific workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById } from '@/lib/data/workflows-data';

export async function GET(
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

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch workflow',
      },
      { status: 500 }
    );
  }
}
