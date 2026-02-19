/**
 * Teams Selection Page
 * Story 3.1: Team Selection Cards
 *
 * Route: /teams
 * Displays team selection cards for Intel, Security, and Strategic teams
 * Legal team is accessible via Abdul/workflows only (not shown as primary card)
 */

'use client';

import { useRouter } from 'next/navigation';
import { getPrimaryTeams } from '@/lib/data/teams-data';

export default function TeamsPage() {
  const router = useRouter();

  // Handle team selection - navigate to that team's agent roster
  // Story 3.2: Navigate to /teams/[slug] route
  const handleTeamSelect = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
          Select a Team
        </h1>
        <p className="text-muted-foreground">
          Browse teams by expertise domain and find the right specialists for your mission
        </p>
      </div>

      {/* Primary Teams Grid - Intel, Security, Strategic only */}
      {/* Note: Legal Team is intentionally excluded from primary display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getPrimaryTeams().map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamSelect(team.id)}
            className={`
              group relative p-6 rounded-xl border-2 transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg
              ${team.borderColor} ${team.bgColor}
              focus:outline-none focus:ring-2 focus:ring-ring
              cursor-pointer text-left
            `}
            aria-label={`View ${team.displayName} agents`}
          >
            {/* Team Icon */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`
                  flex size-14 items-center justify-center rounded-lg
                  ${team.bgColor}
                  group-hover:scale-110 transition-transform duration-200
                `}
              >
                <span className="text-3xl">{team.icon}</span>
              </div>

              {/* Agent Count Badge */}
              <span
                className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${team.color} ${team.bgColor}
                  border ${team.borderColor}
                `}
              >
                {team.agentCount} agents
              </span>
            </div>

            {/* Team Name */}
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {team.displayName}
            </h3>

            {/* Team Description */}
            <ul className="text-sm text-muted-foreground space-y-2">
              {(team.description.slice(0, 3) ?? []).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className={team.color + ' mt-0.5'}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Capabilities Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(team.capabilities.slice(0, 3) ?? []).map((capability) => (
                <span
                  key={capability}
                  className="px-2 py-1 text-xs rounded-md bg-background/50 border border-border"
                >
                  {capability}
                </span>
              ))}
            </div>

            {/* Arrow Indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Teams Notice */}
      <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span>{' '}
          Additional teams (Legal, Game Development, Creativity & Innovation, Builder) are available through Abdul's guidance or workflow selection.
        </p>
      </div>
    </div>
  );
}
