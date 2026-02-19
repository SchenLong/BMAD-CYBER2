/**
 * Agent Details API - v1
 * Story 8.1: RESTful API Implementation
 * Task 3: Agent Endpoints
 *
 * GET /api/v1/agents/:id - Get specific agent details
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiNotFound } from '@/lib/api/response';
import { getAgentById } from '@/lib/data/agents-data';
import { getAgentProfile } from '@/lib/data/agent-profiles';

/**
 * GET /api/v1/agents/:id
 * Get detailed information about a specific agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;

  const agent = getAgentById(agentId);

  if (!agent) {
    return apiNotFound('Agent');
  }

  // Get extended profile if available
  const profile = getAgentProfile(agentId);

  return apiSuccess({
    id: agent.id,
    name: agent.name,
    displayName: agent.displayName,
    title: agent.title,
    team: agent.team,
    expertise: agent.expertise,
    description: agent.description,
    status: agent.status || 'available',
    icon: agent.icon,
    ...(profile && {
      profile: {
        fullDescription: profile.fullDescription,
        capabilities: profile.capabilities,
        useCases: profile.useCases,
        limitations: profile.limitations,
        relatedAgents: profile.relatedAgents,
        communicationStyle: profile.communicationStyle,
        principles: agent.principles,
      },
    }),
  });
}
