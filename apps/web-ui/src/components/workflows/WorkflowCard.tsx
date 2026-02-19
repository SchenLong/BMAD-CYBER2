/**
 * WorkflowCard Component
 * Story 3.4: Team-Based Workflows
 *
 * Displays a workflow in a card format with:
 * - Workflow name and description
 * - Complexity badge
 * - Use cases preview
 * - Duration estimate
 * - Start Workflow button
 * - Team-colored accent border
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Workflow } from '@/lib/types/workflows';
import type { Team } from '@/lib/types/agents';

interface WorkflowCardProps {
  workflow: Workflow;
  team?: Team;
  onStart?: (workflowId: string) => void;
  className?: string;
}

/**
 * Get complexity badge styles
 */
function getComplexityBadgeStyles(complexity: string) {
  switch (complexity) {
    case 'beginner':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'intermediate':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    case 'advanced':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function WorkflowCard({
  workflow,
  team,
  onStart,
  className
}: WorkflowCardProps) {
  const router = useRouter();

  const handleStart = useCallback(() => {
    if (onStart) {
      onStart(workflow.id);
    } else {
      // Navigate to workflow execution interface
      // For now, navigate to a placeholder route
      router.push(`/workflows/${workflow.id}`);
    }
  }, [workflow.id, onStart, router]);

  const borderColor = team?.borderColor || 'border-border';
  const complexityBadge = getComplexityBadgeStyles(workflow.complexity || 'intermediate');

  return (
    <Card
      className={cn(
        'group flex flex-col transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        'border-l-4',
        borderColor,
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              {workflow.displayName}
            </h3>
            {workflow.complexity && (
              <Badge
                variant="outline"
                className={cn('text-xs capitalize', complexityBadge)}
              >
                {workflow.complexity}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {workflow.description}
        </p>

        {/* Use cases preview */}
        {workflow.useCases && workflow.useCases.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Use cases:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {(workflow.useCases.slice(0, 2) ?? []).map((useCase, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="line-clamp-1">{useCase}</span>
                </li>
              ))}
              {workflow.useCases.length > 2 && (
                <li className="text-muted-foreground/70 italic">
                  +{workflow.useCases.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>Est. {formatDuration(workflow.estimatedDuration)}</span>
        </div>

        {/* Required agents */}
        {workflow.requiredAgents && workflow.requiredAgents.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(workflow.requiredAgents.slice(0, 3) ?? []).map((agent) => (
              <Badge
                key={agent}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {agent}
              </Badge>
            ))}
            {workflow.requiredAgents.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{workflow.requiredAgents.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleStart}
          className="w-full"
          size="sm"
        >
          <Play className="size-3 mr-1.5" />
          Start Workflow
          <ChevronRight className="size-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </CardFooter>
    </Card>
  );
}
