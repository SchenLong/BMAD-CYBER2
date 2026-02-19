/**
 * Agents API - v1
 * Story 8.1: RESTful API Implementation
 * Task 3: Agent Endpoints
 *
 * GET /api/v1/agents - List all available agents
 *
 * Supports filtering by team and search functionality
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiValidationError } from '@/lib/api/response';
import { getAllAgents, getAgentsByTeam } from '@/lib/data/agents-data';
import { TeamId } from '@/lib/types/agents';

/**
 * GET /api/v1/agents
 * List all available agents with optional filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate team parameter if provided
  const team = searchParams.get('team');
  if (team) {
    const validTeams: TeamId[] = ['intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'];
    if (!validTeams.includes(team as TeamId)) {
      return apiValidationError('Invalid team parameter', {
        validTeams,
        provided: team,
      });
    }
  }

  const search = searchParams.get('search');

  let agents = team ? getAgentsByTeam(team) : getAllAgents();

  // Filter by search query if provided
  if (search) {
    // Sanitize and limit search input to prevent abuse
    const sanitized = search.trim().slice(0, 100);

    // Basic XSS prevention - remove any HTML/script tags
    const safeSearch = sanitized.replace(/<[^>]*>/g, '');
    const searchLower = safeSearch.toLowerCase();

    agents = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchLower) ||
      agent.displayName.toLowerCase().includes(searchLower) ||
      agent.title.toLowerCase().includes(searchLower) ||
      agent.expertise.some(exp => exp.toLowerCase().includes(searchLower))
    );
  }

  return apiSuccess({
    agents: agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.displayName,
      title: agent.title,
      team: agent.team,
      expertise: agent.expertise,
      description: agent.description,
      status: agent.status || 'available',
    })),
    count: agents.length,
  });
}
