/**
 * Related Agents Component
 * Story 3.3: Agent Profile View
 * Task 7: Display Related Agents
 *
 * Shows related agents from same team or with similar expertise
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent, Team } from '@/lib/types/agents';

interface RelatedAgentsProps {
  relatedAgents: Agent[];
  team?: Team;
  teamLinkHref?: string;
  maxDisplay?: number;
  className?: string;
}

export function RelatedAgents({
  relatedAgents,
  team,
  teamLinkHref,
  maxDisplay = 5,
  className
}: RelatedAgentsProps) {
  const displayAgents = relatedAgents.slice(0, maxDisplay);

  if (displayAgents.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5" />
            Related Agents
          </CardTitle>
          {team && teamLinkHref && (
            <Link
              href={teamLinkHref}
              className="h-7 text-xs gap-1 inline-flex items-center hover:text-foreground transition-colors"
            >
              View All {team.displayName}
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayAgents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className={cn(
                'p-3 rounded-lg border text-left',
                'hover:border-primary/50 hover:bg-accent/50',
                'transition-all group'
              )}
            >
              {/* Icon and Name */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{agent.icon}</span>
                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                  {agent.displayName}
                </span>
              </div>

              {/* Title */}
              <p className="text-xs text-muted-foreground line-clamp-1">
                {agent.title}
              </p>

              {/* Expertise preview */}
              <div className="mt-2 flex flex-wrap gap-1">
                {agent.expertise.slice(0, 2).map((exp) => (
                  <span
                    key={exp}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                  >
                    {exp}
                  </span>
                ))}
                {agent.expertise.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{agent.expertise.length - 2}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View More Indicator */}
        {relatedAgents.length > maxDisplay && (
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              And {relatedAgents.length - maxDisplay} more related agents
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
