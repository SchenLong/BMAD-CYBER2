/**
 * Profile Header Component
 * Story 3.3: Agent Profile View
 * Task 2: Design Profile Layout
 *
 * Left column of agent profile: Avatar, name, role, team, status, CTA button
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Share2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent, AgentProfile, Team } from '@/lib/types/agents';
import { getTeamById } from '@/lib/data/teams-data';

interface ProfileHeaderProps {
  agent: Agent & Partial<AgentProfile>;
  team?: Team;
  onStartConversation?: (agentId: string) => void;
  onShare?: () => void;
  onFavorite?: () => void;
  className?: string;
}

export function ProfileHeader({
  agent,
  team,
  onStartConversation,
  onShare,
  onFavorite,
  className
}: ProfileHeaderProps) {
  const getAgentInitials = (name: string) => {
    // Safe slice - returns available characters if name is shorter than 2
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available for conversations';
      case 'busy':
        return 'Currently in a conversation';
      case 'offline':
        return 'Offline';
      default:
        return 'Status unknown';
    }
  };

  return (
    <Card className={cn('h-fit', className)}>
      <CardContent className="pt-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'flex items-center justify-center rounded-full',
              'bg-gradient-to-br from-primary/30 to-primary/10',
              'size-32'
            )}
          >
            <span className="text-5xl font-semibold text-primary">
              {agent.icon || getAgentInitials(agent.name)}
            </span>
          </div>
        </div>

        {/* Name and Title */}
        <div className="text-center space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-foreground font-orbitron">
            {agent.displayName}
          </h1>
          <p className="text-base text-muted-foreground">{agent.title}</p>
        </div>

        {/* Status */}
        {agent.status && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={cn('size-2.5 rounded-full', getStatusColor(agent.status))}
            />
            <span className="text-sm text-muted-foreground">
              {getStatusText(agent.status)}
            </span>
          </div>
        )}

        {/* Team Badge */}
        {team && (
          <div className="flex justify-center mb-6">
            {/* Note: Color class manipulation via string replacement is intentional.
              Future refactor should use CSS custom properties for better maintainability. */}
            <Badge
              variant="outline"
              className={cn(
                'px-3 py-1 text-sm capitalize',
                team.borderColor.replace('border-', 'border-').replace('500', '500/20'),
                team.color.replace('text-', 'text-')
              )}
            >
              <Users className="size-3 mr-1.5" />
              {team.displayName}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => onStartConversation?.(agent.id)}
          >
            <MessageSquare className="size-4" />
            Start Conversation
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              className="flex-1 gap-2"
              onClick={onFavorite}
            >
              <Star className="size-4" />
              <span className="hidden sm:inline">Favorite</span>
            </Button>
            <Button
              variant="ghost"
              size="default"
              className="flex-1 gap-2"
              onClick={onShare}
            >
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
