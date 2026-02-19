/**
 * Layer 2 Guidance Component
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Layer 2 specific content showing team/workflow suggestions
 * and contextual Abdul guidance.
 */

'use client'

import { memo } from 'react'
import { ArrowLeft, Lightbulb, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export interface SuggestedTeam {
  id: string
  name: string
  description: string
  icon?: string
}

export interface SuggestedWorkflow {
  id: string
  name: string
  description: string
  team: string
}

interface Layer2GuidanceProps {
  context: {
    suggestedTeams?: SuggestedTeam[]
    suggestedWorkflows?: SuggestedWorkflow[]
    currentTopic?: string
  }
  onTeamSelect?: (teamId: string) => void
  onWorkflowSelect?: (workflowId: string) => void
  onBack?: () => void
  onDirectSelect?: () => void // Story 2.4: Layer 3 direct selection
  className?: string
}

export const Layer2Guidance = memo(function Layer2Guidance({
  context,
  onTeamSelect,
  onWorkflowSelect,
  onBack,
  onDirectSelect,
  className = '',
}: Layer2GuidanceProps) {
  const hasSuggestions =
    (context.suggestedTeams && context.suggestedTeams.length > 0) ||
    (context.suggestedWorkflows && context.suggestedWorkflows.length > 0)

  return (
    <div
      className={cn(
        'space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {/* Back button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Welcome
        </Button>
      )}

      {/* Team Suggestions */}
      {context.suggestedTeams && context.suggestedTeams.length > 0 && (
        <TeamSuggestion
          teams={context.suggestedTeams}
          onTeamSelect={onTeamSelect}
        />
      )}

      {/* Workflow Suggestions */}
      {context.suggestedWorkflows && context.suggestedWorkflows.length > 0 && (
        <WorkflowSuggestion
          workflows={context.suggestedWorkflows}
          onWorkflowSelect={onWorkflowSelect}
        />
      )}

      {/* No suggestions hint */}
      {!hasSuggestions && (
        <Card className="p-4 bg-muted/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="size-5 text-accent-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Continue the conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tell me more about what you're trying to accomplish, and I'll
                suggest the right team and workflow.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Story 2.4: Layer 3 - "I know what I need" button */}
      <Card className="p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Zap className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Know exactly what you need?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Skip the conversation and browse teams and agents directly
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onDirectSelect}
            className="shrink-0 gap-2"
          >
            <Zap className="size-3.5" />
            Browse Teams
          </Button>
        </div>
      </Card>
    </div>
  )
})

/**
 * Team Suggestion Card
 */
interface TeamSuggestionProps {
  teams: SuggestedTeam[]
  onTeamSelect?: (teamId: string) => void
}

const TeamSuggestion = memo(function TeamSuggestion({
  teams,
  onTeamSelect,
}: TeamSuggestionProps) {
  return (
    <Card className="p-4 border-accent-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
          <span className="text-lg">👥</span>
        </div>
        <h3 className="text-sm font-semibold">Recommended Teams</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onTeamSelect?.(team.id)}
            className={cn(
              'p-3 rounded-lg text-left',
              'bg-muted/30 hover:bg-accent-primary/10',
              'border border-transparent hover:border-accent-primary/30',
              'transition-all duration-200',
              'active:scale-[0.98]',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/50'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {team.icon && (
                <span className="text-sm" aria-hidden="true">
                  {team.icon}
                </span>
              )}
              <span className="text-sm font-medium">{team.name}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          </button>
        ))}
      </div>
    </Card>
  )
})

/**
 * Workflow Suggestion Card
 */
interface WorkflowSuggestionProps {
  workflows: SuggestedWorkflow[]
  onWorkflowSelect?: (workflowId: string) => void
}

const WorkflowSuggestion = memo(function WorkflowSuggestion({
  workflows,
  onWorkflowSelect,
}: WorkflowSuggestionProps) {
  return (
    <Card className="p-4 border-accent-secondary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-8 rounded-lg bg-accent-secondary/20 flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <h3 className="text-sm font-semibold">Suggested Workflows</h3>
      </div>

      <div className="space-y-2">
        {workflows.map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => onWorkflowSelect?.(workflow.id)}
            className={cn(
              'w-full p-3 rounded-lg text-left',
              'bg-muted/30 hover:bg-accent-secondary/10',
              'border border-transparent hover:border-accent-secondary/30',
              'transition-all duration-200',
              'active:scale-[0.98]',
              'focus:outline-none focus:ring-2 focus:ring-accent-secondary/50'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {workflow.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {workflow.team}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-secondary/10 text-accent-secondary shrink-0">
                Run
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
})

/**
 * Compact Layer 2 Header
 */
export const Layer2Header = memo(function Layer2Header({
  title = 'Abdul Guidance',
  onBack,
  className = '',
}: {
  title?: string
  onBack?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between mb-4 pb-3 border-b border-border-subtle',
        className
      )}
    >
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">
          I'll help you find the right tools for your task
        </p>
      </div>
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
    </div>
  )
})

/**
 * Contextual hint based on conversation
 */
export const ContextualHint = memo(function ContextualHint({
  message,
  className = '',
}: {
  message: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        'p-3 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border-accent-primary/20',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="size-4 text-accent-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">{message}</p>
      </div>
    </Card>
  )
})
