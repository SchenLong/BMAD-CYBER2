/**
 * Agent Roster Page
 * Story 3.2: Agent Roster Display
 *
 * Route: /teams/[slug]
 * Displays agents for a specific team with search and filter functionality
 */

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TeamAgentRoster } from '@/components/agents/TeamAgentRoster';
import { TeamAgentRosterSkeleton } from '@/components/agents/TeamAgentRosterSkeleton';
import { getTeamById, getAllTeams } from '@/lib/data/teams-data';

interface AgentRosterPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all teams
export async function generateStaticParams() {
  const teams = getAllTeams();
  return teams.map((team) => ({
    slug: team.id,
  }));
}

export default function AgentRosterPage({ params }: AgentRosterPageProps) {
  const team = getTeamById(params.slug);

  if (!team) {
    notFound();
  }

  return (
    <div className="container py-6">
      <Suspense fallback={<TeamAgentRosterSkeleton />}>
        <TeamAgentRoster teamId={team.id} teamName={team.displayName} />
      </Suspense>
    </div>
  );
}
