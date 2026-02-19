/**
 * AgentProfile Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 4: Implement Direct Agent Selection
 *
 * Displays full agent profile with details, expertise, and action buttons
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  ArrowLeft,
  Share2,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/types/agents';

interface AgentProfileProps {
  agent: Agent;
  onStartConversation?: (agentId: string) => void;
  onBack?: () => void;
  relatedAgents?: Agent[];
  className?: string;
}

export function AgentProfile({
  agent,
  onStartConversation,
  onBack,
  relatedAgents = [],
  className
}: AgentProfileProps) {
  const getAgentInitials = (name: string) => {
    // Safe slice - returns available characters if name is shorter than 2
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to agents
        </Button>
      )}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full',
                'bg-gradient-to-br from-primary/30 to-primary/10',
                'size-24 sm:size-32'
              )}
            >
              <span className="text-4xl font-semibold text-primary">
                {agent.icon || getAgentInitials(agent.name)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {agent.displayName}
                </h1>
                <p className="text-lg text-muted-foreground">{agent.title}</p>
              </div>

              {/* Status */}
              {agent.status && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'size-2.5 rounded-full',
                      agent.status === 'available' && 'bg-green-500',
                      agent.status === 'busy' && 'bg-yellow-500',
                      agent.status === 'offline' && 'bg-gray-400'
                    )}
                  />
                  <span className="text-sm text-muted-foreground capitalize">
                    {agent.status === 'available' && 'Available for conversations'}
                    {agent.status === 'busy' && 'Currently in a conversation'}
                    {agent.status === 'offline' && 'Offline'}
                  </span>
                </div>
              )}

              {/* Actions */}
              {/* TODO: Implement favorite and share functionality - these buttons are placeholders */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => onStartConversation?.(agent.id)}
                  className="gap-2"
                >
                  <MessageSquare className="size-4" />
                  Start Conversation
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Star className="size-4" />
                  Add to Favorites
                </Button>
                <Button variant="ghost" size="lg" className="gap-2">
                  <Share2 className="size-4" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          {agent.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {agent.description}
              </p>
            </div>
          )}

          {/* Communication Style */}
          {agent.communicationStyle && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Communication Style</h2>
              <p className="text-muted-foreground leading-relaxed italic">
                &quot;{agent.communicationStyle}&quot;
              </p>
            </div>
          )}

          {/* Principles */}
          {agent.principles && agent.principles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Guiding Principles</h2>
              <ul className="space-y-2">
                {agent.principles.map((principle, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expertise Areas */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Expertise Areas</h2>
            <div className="flex flex-wrap gap-2">
              {agent.expertise.map((exp) => (
                <Badge key={exp} variant="secondary" className="px-3 py-1">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>

          {/* Team Association */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Team</h2>
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm capitalize"
            >
              <Users className="size-3 mr-1" />
              {agent.team}
            </Badge>
          </div>

          {/* Activity Stats (placeholder) */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Activity</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <Clock className="size-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <MessageSquare className="size-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <Star className="size-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Agents */}
      {relatedAgents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Related Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedAgents.map((relatedAgent) => (
              <button
                key={relatedAgent.id}
                onClick={() => onStartConversation?.(relatedAgent.id)}
                className="p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{relatedAgent.icon}</span>
                  <span className="font-medium">{relatedAgent.displayName}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {relatedAgent.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CompactAgentProfile - For side panels or modals
 */
export function CompactAgentProfile({
  agent,
  onStartConversation,
  className
}: Pick<AgentProfileProps, 'agent' | 'onStartConversation' | 'className'>) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10">
          <span className="text-xl font-semibold text-primary">
            {agent.icon || agent.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{agent.displayName}</h3>
          <p className="text-sm text-muted-foreground">{agent.title}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {agent.description}
      </p>

      <Button
        className="w-full"
        onClick={() => onStartConversation?.(agent.id)}
      >
        <MessageSquare className="size-4 mr-2" />
        Start Conversation
      </Button>
    </div>
  );
}
