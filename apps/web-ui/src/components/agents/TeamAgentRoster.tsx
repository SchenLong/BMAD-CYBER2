/**
 * TeamAgentRoster Component
 * Story 3.2: Agent Roster Display
 *
 * Displays agents for a selected team with:
 * - Search functionality
 * - Filter by expertise
 * - Agent count display
 * - Back to Teams navigation
 * - View Profile and Start Conversation buttons
 * - Responsive layout
 */

'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgentCard } from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Users, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgentsByTeam } from '@/lib/data/agents-data';
import { getTeamById } from '@/lib/data/teams-data';
import { useAgentStore } from '@/stores/agent-store';

interface TeamAgentRosterProps {
  teamId: string;
  teamName?: string;
  className?: string;
}

export function TeamAgentRoster({
  teamId,
  teamName,
  className
}: TeamAgentRosterProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpertise, setFilterExpertise] = useState<string[]>([]);
  const [showAllExpertise, setShowAllExpertise] = useState(false);

  const { addFavoriteTeam } = useAgentStore();

  // Get team info and agents
  const team = getTeamById(teamId);
  const allAgents = getAgentsByTeam(teamId);

  // Track this team as favorite when viewed
  // Note: addFavoriteTeam is a stable Zustand store function that won't change between renders.
  // Including it in deps would cause this effect to run on every mount unnecessarily.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (team) {
      addFavoriteTeam(team.id);
    }
  }, [team?.id]);

  // Get available expertise areas for this team
  const expertiseAreas = useMemo(() => {
    const areas = new Set<string>();
    allAgents.forEach(agent => {
      agent.expertise.forEach(exp => areas.add(exp));
    });
    return Array.from(areas).sort();
  }, [allAgents]);

  // Filter agents based on search and expertise filters
  const filteredAgents = useMemo(() => {
    return allAgents.filter(agent => {
      // Search filter - check name, display name, title, and expertise
      const matchesSearch = !searchQuery.trim() ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

      // Expertise filter - check if agent has any of the selected expertise areas
      const matchesExpertise = filterExpertise.length === 0 ||
        filterExpertise.some(exp => agent.expertise.includes(exp));

      return matchesSearch && matchesExpertise;
    });
  }, [allAgents, searchQuery, filterExpertise]);

  const handleBack = () => {
    router.push('/teams');
  };

  const handleAgentSelect = (agentId: string) => {
    // Navigate to conversation or agent profile
    router.push(`/agents/${agentId}`);
  };

  const handleViewProfile = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFilterExpertise(prev =>
      prev.includes(expertise)
        ? prev.filter(e => e !== expertise)
        : [...prev, expertise]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterExpertise([]);
  };

  const hasActiveFilters = searchQuery.trim() || filterExpertise.length > 0;

  if (!team) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">Team not found</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header with Back Button and Team Info */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          aria-label="Back to Teams"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-lg',
              team.bgColor
            )}
          >
            <span className="text-2xl">{team.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {team.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'Specialized Agent' : 'Specialized Agents'}
              {hasActiveFilters && ` (filtered from ${allAgents.length} total)`}
            </p>
          </div>
        </div>

        {/* View Workflows Button */}
        <Link href={`/teams/${team.id}/workflows`}>
          <Button variant="outline" size="sm" className="shrink-0">
            <Layers className="size-4 mr-2" />
            View Workflows
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents by name, role, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
            aria-label="Search agents"
          />
        </div>
      </div>

      {/* Filter Chips by Expertise */}
      {expertiseAreas.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by expertise:</span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by expertise">
            {(showAllExpertise ? expertiseAreas : expertiseAreas.slice(0, 8) ?? []).map((exp) => {
              const isActive = filterExpertise.includes(exp);
              return (
                <Badge
                  key={exp}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                  onClick={() => handleExpertiseToggle(exp)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleExpertiseToggle(exp);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                >
                  {exp}
                </Badge>
              );
            })}
            {expertiseAreas.length > 8 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllExpertise(!showAllExpertise)}
                className="h-7 px-2 text-xs"
              >
                {showAllExpertise ? 'Show less' : `+${expertiseAreas.length - 8} more`}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Agent Grid */}
      {filteredAgents.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="region"
          aria-live="polite"
          aria-label={`Agent results: ${filteredAgents.length} ${filteredAgents.length === 1 ? 'agent' : 'agents'} found`}
        >
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              variant="default"
              onStartConversation={handleAgentSelect}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      ) : (
        /* No Results State */
        <div className="text-center py-16">
          <Users className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No agents found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to see more results
          </p>
          <Button
            variant="outline"
            onClick={handleClearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
