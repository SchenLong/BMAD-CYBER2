/**
 * AgentRoster Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 2: Create Agent Roster Component
 *
 * Displays agents for a selected team with search and filter functionality
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { AgentCard, HorizontalAgentCard } from './AgentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Grid3x3, List, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgentsByTeam, getAllExpertiseAreas } from '@/lib/data/agents-data';
import { getTeamById } from '@/lib/data/teams-data';
import { useAgentStore } from '@/stores/agent-store';

interface AgentRosterProps {
  teamId: string;
  onBack?: () => void;
  onAgentSelect?: (agentId: string) => void;
  onViewProfile?: (agentId: string) => void;
  className?: string;
}

export function AgentRoster({
  teamId,
  onBack,
  onAgentSelect,
  onViewProfile,
  className
}: AgentRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpertise, setFilterExpertise] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { addFavoriteTeam } = useAgentStore();

  // Get team info and agents
  const team = getTeamById(teamId);
  const allAgents = getAgentsByTeam(teamId);

  // Track this team as favorite when viewed
  // addFavoriteTeam is stable from Zustand store and won't change, so excluding it is intentional
  useEffect(() => {
    if (team) {
      addFavoriteTeam(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id]);

  // Get available expertise areas for this team
  const expertiseAreas = useMemo(() => {
    const areas = new Set<string>();
    allAgents.forEach(agent => {
      agent.expertise.forEach(exp => areas.add(exp));
    });
    return Array.from(areas).sort();
  }, [allAgents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return allAgents.filter(agent => {
      // Search filter
      const matchesSearch = !searchQuery.trim() ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

      // Expertise filter
      const matchesExpertise = !filterExpertise ||
        agent.expertise.includes(filterExpertise);

      return matchesSearch && matchesExpertise;
    });
  }, [allAgents, searchQuery, filterExpertise]);

  const handleAgentSelect = (agentId: string) => {
    onAgentSelect?.(agentId);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterExpertise(null);
  };

  const hasActiveFilters = searchQuery.trim() || filterExpertise;

  if (!team) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">Team not found</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            Go back
          </Button>
        )}
      </div>
    );
  }

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
              aria-label="Go back to teams"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                team.bgColor
              )}
            >
              <span className="text-xl">{team.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {team.displayName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'}
                {hasActiveFilters && ` filtered from ${allAgents.length}`}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid3x3 className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents by name, role, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search agents"
          />
        </div>

        {/* Expertise Filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {filterExpertise ? (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setFilterExpertise(null)}
              >
                {filterExpertise}
                <span className="ml-1">&times;</span>
              </Badge>
            ) : (
              (expertiseAreas.slice(0, 4) ?? []).map((exp) => (
                <Badge
                  key={exp}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setFilterExpertise(exp)}
                >
                  {exp}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="shrink-0"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Agent List/Grid */}
      {filteredAgents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                variant="default"
                onStartConversation={handleAgentSelect}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAgents.map((agent) => (
              <HorizontalAgentCard
                key={agent.id}
                agent={agent}
                onClick={() => handleAgentSelect(agent.id)}
              />
            ))}
          </div>
        )
      ) : (
        /* No Results */
        <div className="text-center py-12">
          <Users className="size-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No agents found matching your criteria
          </p>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * CompactAgentRoster - For embedding in other components
 */
interface CompactAgentRosterProps {
  teamId: string;
  onAgentSelect?: (agentId: string) => void;
  maxAgents?: number;
}

export function CompactAgentRoster({
  teamId,
  onAgentSelect,
  maxAgents = 3
}: CompactAgentRosterProps) {
  const agents = getAgentsByTeam(teamId).slice(0, maxAgents) ?? [];
  const team = getTeamById(teamId);

  if (!team) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{team.icon}</span>
        <h3 className="font-semibold">{team.displayName}</h3>
        <Badge variant="outline">{agents.length}</Badge>
      </div>
      <div className="space-y-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onAgentSelect?.(agent.id)}
            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{agent.icon}</span>
              <div>
                <p className="text-sm font-medium">{agent.displayName}</p>
                <p className="text-xs text-muted-foreground">{agent.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
