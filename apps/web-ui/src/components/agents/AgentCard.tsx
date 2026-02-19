/**
 * AgentCard Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 3: Create Agent Card Component
 *
 * Displays an agent with avatar, name, role, expertise, and action buttons
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, User, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/types/agents';

interface AgentCardProps {
  agent: Agent;
  onStartConversation?: (agentId: string) => void;
  onViewProfile?: (agentId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  showTeamLabel?: boolean;
}

export function AgentCard({
  agent,
  onStartConversation,
  onViewProfile,
  variant = 'default',
  className,
  showTeamLabel = false
}: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartConversation = useCallback(() => {
    onStartConversation?.(agent.id);
  }, [agent.id, onStartConversation]);

  const handleViewProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile?.(agent.id);
  }, [agent.id, onViewProfile]);

  const getAgentInitials = (name: string) => {
    // Safe slice - returns available characters if name is shorter than 2
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card
      className={cn(
        'group relative transition-all duration-200',
        'hover:scale-[1.01] hover:shadow-md',
        'border-border hover:border-primary/50',
        variant === 'compact' && 'py-3',
        className
      )}
    >
      <CardHeader className={cn(
        'pb-3',
        variant === 'compact' && 'pb-2 space-y-2'
      )}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full',
              'bg-gradient-to-br from-primary/20 to-primary/10',
              variant === 'compact' ? 'size-10' : 'size-12'
            )}
          >
            <span className={cn(
              'font-semibold text-primary',
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}>
              {agent.icon || getAgentInitials(agent.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {agent.displayName}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {agent.title}
                </p>
              </div>

              {/* Status Indicator */}
              {agent.status && (
                <div
                  className={cn(
                    'size-2 rounded-full shrink-0',
                    agent.status === 'available' && 'bg-green-500',
                    agent.status === 'busy' && 'bg-yellow-500',
                    agent.status === 'offline' && 'bg-gray-400'
                  )}
                  title={`Status: ${agent.status}`}
                />
              )}
            </div>

            {/* Team Label */}
            {showTeamLabel && (
              <Badge variant="outline" className="mt-1 text-xs">
                {agent.team}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content - varies by variant */}
      {variant !== 'compact' && (
        <CardContent className="space-y-3">
          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(agent.expertise.slice(0, isExpanded ? undefined : 3) ?? []).map((exp) => (
              <Badge
                key={exp}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {exp}
              </Badge>
            ))}
            {!isExpanded && agent.expertise.length > 3 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-primary hover:underline"
              >
                +{agent.expertise.length - 3} more
              </button>
            )}
          </div>

          {/* Description (detailed variant only) */}
          {variant === 'detailed' && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {agent.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleStartConversation}
              className="flex-1"
              aria-label={`Start conversation with ${agent.displayName}`}
            >
              <MessageSquare className="size-3.5 mr-1.5" />
              Chat
            </Button>

            {onViewProfile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewProfile}
                    aria-label={`View ${agent.displayName} profile`}
                  >
                    <User className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View full profile</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      )}

      {/* Compact variant actions */}
      {variant === 'compact' && (
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex gap-1">
            {(agent.expertise.slice(0, 2) ?? []).map((exp) => (
              <Badge
                key={exp}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {exp}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStartConversation}
            aria-label={`Start conversation with ${agent.displayName}`}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

/**
 * HorizontalAgentCard - For list views
 */
interface HorizontalAgentCardProps extends Omit<AgentCardProps, 'variant'> {
  onClick?: () => void;
}

export function HorizontalAgentCard({
  agent,
  onClick,
  onStartConversation,
  className
}: HorizontalAgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:bg-accent hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
    )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex shrink-0 items-center justify-center size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
          <span className="text-sm font-semibold text-primary">
            {agent.icon || agent.name.slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">
              {agent.displayName}
            </h4>
            {agent.status && (
              <div
                className={cn(
                  'size-1.5 rounded-full shrink-0',
                  agent.status === 'available' && 'bg-green-500',
                  agent.status === 'busy' && 'bg-yellow-500',
                  agent.status === 'offline' && 'bg-gray-400'
                )}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {agent.title}
          </p>
        </div>

        {/* Expertise preview */}
        <div className="hidden sm:flex items-center gap-1">
          {(agent.expertise.slice(0, 2) ?? []).map((exp) => (
            <Badge
              key={exp}
              variant="outline"
              className="text-xs px-1.5 py-0"
            >
              {exp}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}
