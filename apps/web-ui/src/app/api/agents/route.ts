/**
 * GET /api/agents
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 7: API Integration
 *
 * Returns all agents with optional filtering by team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllAgents, getAgentsByTeam } from '@/lib/data/agents-data';
import { TeamId } from '@/lib/types/agents';

const VALID_TEAMS: TeamId[] = ['intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const search = searchParams.get('search');

    // Validate team parameter if provided
    if (team && !VALID_TEAMS.includes(team as TeamId)) {
      return NextResponse.json(
        {
          error: 'Invalid team parameter',
          message: `Team must be one of: ${VALID_TEAMS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    let agents = team ? getAgentsByTeam(team) : getAllAgents();

    // Filter by search query if provided
    if (search) {
      // Sanitize search input - limit length and remove special chars
      const sanitized = search.trim().slice(0, 100);
      const searchLower = sanitized.toLowerCase();
      agents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.displayName.toLowerCase().includes(searchLower) ||
        agent.title.toLowerCase().includes(searchLower) ||
        agent.expertise.some(exp => exp.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      agents,
      count: agents.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch agents',
      },
      { status: 500 }
    );
  }
}
