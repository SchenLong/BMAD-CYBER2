/**
 * TeamSelection Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 1: Create Team Selection Interface
 *
 * Grid of team cards for direct team selection
 * Displays primary teams (Intel, Security, Strategic) by default
 * Shows recent/favorite teams if available
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { TeamCard } from './TeamCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryTeams, getAllTeams } from '@/lib/data/teams-data';
import { useAgentStore, useFavoriteTeams } from '@/stores/agent-store';

interface TeamSelectionProps {
  onBack?: () => void;
  onTeamSelect?: (teamId: string) => void;
  showAllTeams?: boolean;
  className?: string;
}

export function TeamSelection({
  onBack,
  onTeamSelect,
  showAllTeams = false,
  className
}: TeamSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { incrementDirectSelection } = useAgentStore();
  const favoriteTeams = useFavoriteTeams();

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    const teams = showAllTeams ? getAllTeams() : getPrimaryTeams();
    if (!searchQuery.trim()) {
      return teams;
    }
    const query = searchQuery.toLowerCase();
    return teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.displayName.toLowerCase().includes(query) ||
      team.description.some(d => d.toLowerCase().includes(query)) ||
      team.capabilities.some(c => c.toLowerCase().includes(query))
    );
  }, [searchQuery, showAllTeams]);

  // Sort teams: favorites first, then by agent count
  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      const aFav = favoriteTeams.includes(a.id);
      const bFav = favoriteTeams.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return b.agentCount - a.agentCount;
    });
  }, [filteredTeams, favoriteTeams]);

  const handleTeamSelect = useCallback((teamId: string) => {
    incrementDirectSelection();
    onTeamSelect?.(teamId);
  }, [incrementDirectSelection, onTeamSelect]);

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              I know what I need
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a team to see available agents
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search teams"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onSelect={handleTeamSelect}
          />
        ))}
      </div>

      {/* No results */}
      {sortedTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No teams found matching &quot;{searchQuery}&quot;
          </p>
          <Button
            variant="link"
            onClick={() => setSearchQuery('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}

      {/* Note: Additional teams available via search */}
      {filteredTeams.length === getPrimaryTeams().length && !searchQuery && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Showing primary teams • Use search to find all {getAllTeams().length} teams
        </p>
      )}
    </div>
  );
}

/**
 * CompactTeamSelection - For embedding in Layer 2 guidance
 */
export function CompactTeamSelection(props: Omit<TeamSelectionProps, 'className'>) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        Select a team to continue:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {getPrimaryTeams().map((team) => (
          <button
            key={team.id}
            onClick={() => props.onTeamSelect?.(team.id)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
              'hover:scale-[1.02] hover:shadow-md',
              team.borderColor,
              team.bgColor,
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <span className="text-xl">{team.icon}</span>
            <span className="font-medium text-sm">{team.displayName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
