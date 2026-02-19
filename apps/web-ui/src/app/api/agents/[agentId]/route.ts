/**
 * GET /api/agents/[agentId]
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 7: API Integration
 *
 * Returns detailed information about a specific agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, getAgentsByTeam } from '@/lib/data/agents-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const agent = getAgentById(agentId);

    if (!agent) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: `Agent with ID "${agentId}" not found`,
        },
        { status: 404 }
      );
    }

    // Get related agents from the same team
    const relatedAgents = getAgentsByTeam(agent.team)
      .filter(a => a.id !== agent.id)
      .slice(0, 5);

    return NextResponse.json({
      agent,
      relatedAgents,
    });
  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch agent details',
      },
      { status: 500 }
    );
  }
}
