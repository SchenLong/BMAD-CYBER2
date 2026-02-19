/**
 * Team Workflows Page
 * Story 3.4: Team-Based Workflows
 *
 * Route: /teams/[slug]/workflows
 * Displays workflows for a specific team with:
 * - Team header with branding
 * - Workflow grid with search and filter
 * - Breadcrumb navigation
 * - Responsive layout
 */

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamWorkflowsGrid } from '@/components/workflows';
import { TeamWorkflowsSkeleton } from '@/components/workflows/TeamWorkflowsSkeleton';
import { getTeamById, getAllTeams } from '@/lib/data/teams-data';
import { getWorkflowsByTeam } from '@/lib/data/workflows-data';
import Link from 'next/link';

interface TeamWorkflowsPageProps {
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

export default function TeamWorkflowsPage({ params }: TeamWorkflowsPageProps) {
  const team = getTeamById(params.slug);

  if (!team) {
    notFound();
  }

  // Get workflows for this team
  const workflows = getWorkflowsByTeam(team.id);

  return (
    <div className="w-full space-y-6">
      {/* Header with Back Button and Team Info */}
      <div className="flex items-center gap-4">
        <Link href="/teams">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to Teams"
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <div
            className={`flex size-12 items-center justify-center rounded-lg ${team.bgColor}`}
          >
            <span className="text-2xl">{team.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {team.displayName} Workflows
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Layers className="size-3" />
              {workflows.length} {workflows.length === 1 ? 'workflow' : 'workflows'} available
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/teams" className="hover:text-foreground transition-colors">
          Teams
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <Link href={`/teams/${team.id}`} className="hover:text-foreground transition-colors">
          {team.displayName}
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium">Workflows</span>
      </nav>

      {/* Workflow Grid */}
      <Suspense fallback={<TeamWorkflowsSkeleton />}>
        <TeamWorkflowsGrid team={team} workflows={workflows} />
      </Suspense>
    </div>
  );
}
