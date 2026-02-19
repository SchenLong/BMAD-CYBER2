/**
 * TeamCard Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 1: Create Team Selection Interface
 *
 * Displays a team card with icon, name, description, and agent count
 * Follows the existing RoleCard component pattern
 */

'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight, Users } from 'lucide-react';
import { Team } from '@/lib/types/agents';

interface TeamCardProps {
  team: Team;
  onSelect?: (teamId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function TeamCard({
  team,
  onSelect,
  variant = 'default',
  className
}: TeamCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(team.id);
  }, [team.id, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  }, [handleSelect]);

  return (
    <Card
      onClick={handleSelect}
      className={cn(
        'group relative cursor-pointer transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        'border-2',
        team.borderColor,
        team.bgColor,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variant === 'compact' && 'py-4',
        className
      )}
      tabIndex={0}
      role="button"
      aria-label={`Select ${team.displayName}`}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className={cn(
        'pb-3',
        variant === 'compact' && 'pb-2'
      )}>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-lg',
              team.bgColor,
              'group-hover:scale-110 transition-transform duration-200'
            )}
          >
            <span className="text-2xl">{team.icon}</span>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1 text-xs',
              team.color,
              team.bgColor
            )}
          >
            <Users className="size-3" />
            {team.agentCount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={cn(
        'space-y-2',
        variant === 'compact' && 'space-y-1'
      )}>
        <h3 className={cn(
          'font-semibold text-foreground',
          variant === 'default' && 'text-lg',
          variant === 'compact' && 'text-base'
        )}>
          {team.displayName}
        </h3>

        {variant === 'default' && (
          <ul className="text-sm text-muted-foreground space-y-1">
            {(team.description.slice(0, 3) ?? []).map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1">
            {(team.capabilities.slice(0, variant === 'compact' ? 2 : 3) ?? []).map((cap) => (
              <Badge
                key={cap}
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {cap}
              </Badge>
            ))}
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CompactTeamCard - Smaller variant for grid layouts
 */
export function CompactTeamCard(props: Omit<TeamCardProps, 'variant'>) {
  return <TeamCard {...props} variant="compact" />;
}
