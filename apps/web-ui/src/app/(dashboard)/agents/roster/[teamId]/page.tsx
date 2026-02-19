/**
 * Agent Roster Page
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 2: Create Agent Roster Component
 *
 * Route: /agents/roster/[teamId]
 * Displays agents for a specific team
 */

'use client';

import { notFound } from 'next/navigation';
import { AgentRoster } from '@/components/agents/AgentRoster';
import { getTeamById } from '@/lib/data/teams-data';
import { useRouter } from 'next/navigation';

interface AgentRosterPageProps {
  params: {
    teamId: string;
  };
}

export default function AgentRosterPage({ params }: AgentRosterPageProps) {
  const router = useRouter();
  const team = getTeamById(params.teamId);

  if (!team) {
    notFound();
  }

  const handleBack = () => {
    router.push('/agents');
  };

  const handleAgentSelect = (agentId: string) => {
    // Navigate to agent profile
    router.push(`/agents/${agentId}`);
  };

  const handleViewProfile = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  return (
    <div className="container py-6">
      <AgentRoster
        teamId={params.teamId}
        onBack={handleBack}
        onAgentSelect={handleAgentSelect}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}
