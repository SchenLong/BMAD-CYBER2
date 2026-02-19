/**
 * Profile Details Component
 * Story 3.3: Agent Profile View
 * Task 3, 4, 5, 6: Display Full Description, Expertise, Use Cases, Workflows
 *
 * Right column of agent profile: About, Expertise, Use Cases, Workflows, etc.
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Briefcase,
  Workflow,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent, AgentProfile, WorkflowSummary } from '@/lib/types/agents';

interface ProfileDetailsProps {
  agent: Agent & Partial<AgentProfile>;
  onStartWorkflow?: (workflowId: string) => void;
  className?: string;
}

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

function ExpandableSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  className
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('space-y-2', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
      >
        {icon}
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="size-4 ml-auto" />
        ) : (
          <ChevronDown className="size-4 ml-auto" />
        )}
      </button>
      {isExpanded && <div className="pt-1">{children}</div>}
    </div>
  );
}

interface WorkflowCardProps {
  workflow: WorkflowSummary;
  onStart?: (workflowId: string) => void;
}

function WorkflowCard({ workflow, onStart }: WorkflowCardProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm flex-1">{workflow.name}</h4>
        <Badge
          variant="outline"
          className={cn('text-xs capitalize', getComplexityColor(workflow.complexity))}
        >
          {workflow.complexity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {workflow.description}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs h-7"
        onClick={() => onStart?.(workflow.id)}
      >
        <Workflow className="size-3" />
        Start Workflow
      </Button>
    </div>
  );
}

export function ProfileDetails({
  agent,
  onStartWorkflow,
  className
}: ProfileDetailsProps) {
  // Get expertise color based on team
  const getExpertiseColor = (index: number) => {
    const colors = [
      'bg-sky-500/10 text-sky-500 border-sky-500/20',
      'bg-red-500/10 text-red-500 border-red-500/20',
      'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* About Section - Full Description */}
      {(agent.fullDescription || agent.description) && (
        <ExpandableSection
          title="About"
          icon={<MessageSquare className="size-5" />}
          defaultExpanded={true}
        >
          {/* Note: React automatically escapes content in JSX, preventing XSS attacks.
              The markdown parsing below is safe as React handles HTML entity escaping. */}
          <div className="text-muted-foreground leading-relaxed space-y-3">
            {agent.fullDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {agent.fullDescription.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={idx} className="text-base font-semibold text-foreground mt-4 mb-2">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-sm font-semibold text-foreground mt-3 mb-1">
                        {line.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-4">
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.trim().length === 0) {
                    return <br key={idx} />;
                  }
                  return (
                    <p key={idx} className="mb-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p>{agent.description}</p>
            )}
          </div>
        </ExpandableSection>
      )}

      <Separator />

      {/* Communication Style */}
      {agent.communicationStyle && (
        <ExpandableSection
          title="Communication Style"
          icon={<MessageSquare className="size-5" />}
          defaultExpanded={true}
        >
          <p className="text-muted-foreground italic leading-relaxed">
            "{agent.communicationStyle}"
          </p>
        </ExpandableSection>
      )}

      <Separator />

      {/* Expertise Areas */}
      {agent.expertise && agent.expertise.length > 0 && (
        <ExpandableSection
          title="Expertise Areas"
          icon={<Briefcase className="size-5" />}
        >
          <div className="flex flex-wrap gap-2">
            {agent.expertise.map((exp, index) => (
              <Badge
                key={exp}
                variant="outline"
                className={cn('px-3 py-1 text-sm', getExpertiseColor(index))}
              >
                {exp}
              </Badge>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Capabilities */}
      {agent.capabilities && agent.capabilities.length > 0 && (
        <>
          <Separator />
          <ExpandableSection
            title="Capabilities"
            icon={<Lightbulb className="size-5" />}
          >
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <Badge
                  key={cap}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                >
                  {cap}
                </Badge>
              ))}
            </div>
          </ExpandableSection>
        </>
      )}

      {/* Limitations */}
      {agent.limitations && agent.limitations.length > 0 && (
        <>
          <Separator />
          <ExpandableSection
            title="Limitations"
            icon={<Briefcase className="size-5" />}
          >
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {agent.limitations.map((limit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span>{limit}</span>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        </>
      )}

      {/* Use Cases */}
      {agent.useCases && agent.useCases.length > 0 && (
        <>
          <Separator />
          <ExpandableSection
            title="Typical Use Cases"
            icon={<Briefcase className="size-5" />}
          >
            <ul className="space-y-2">
              {agent.useCases.map((useCase, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        </>
      )}

      {/* Workflows */}
      {agent.workflows && agent.workflows.length > 0 && (
        <>
          <Separator />
          <ExpandableSection
            title="Workflows"
            icon={<Workflow className="size-5" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agent.workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onStart={onStartWorkflow}
                />
              ))}
            </div>
          </ExpandableSection>
        </>
      )}

      {/* Principles */}
      {agent.principles && agent.principles.length > 0 && !agent.fullDescription && (
        <>
          <Separator />
          <ExpandableSection
            title="Guiding Principles"
            icon={<Lightbulb className="size-5" />}
          >
            <ul className="space-y-2">
              {agent.principles.map((principle, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        </>
      )}
    </div>
  );
}
