/**
 * Agents Page - Team Selection
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 1: Create Team Selection Interface
 *
 * Route: /agents
 * Displays team selection interface for Layer 3
 */

'use client';

import { TeamSelection } from '@/components/agents/TeamSelection';
import { AdvancedModeToggle } from '@/components/agents/AdvancedModeToggle';
import { useAgentStore } from '@/stores/agent-store';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const router = useRouter();

  const handleTeamSelect = (teamId: string) => {
    // Navigate to agent roster for the selected team
    router.push(`/agents/roster/${teamId}`);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Select a Team
          </h1>
          <p className="text-muted-foreground">
            Browse agents by their area of expertise
          </p>
        </div>
        <AdvancedModeToggle variant="button" />
      </div>

      <TeamSelection onTeamSelect={handleTeamSelect} showAllTeams={true} />
    </div>
  );
}
