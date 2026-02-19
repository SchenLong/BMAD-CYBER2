/**
 * ComplexityFilter Component
 * Story 3.4: Team-Based Workflows
 *
 * Filter workflows by complexity level:
 * - Beginner (Green)
 * - Intermediate (Amber)
 * - Advanced (Red)
 * - Multi-select support
 * - Clear all option
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowComplexity } from '@/lib/types/agents';

interface ComplexityFilterProps {
  selectedComplexities: WorkflowComplexity[];
  onToggle: (complexity: WorkflowComplexity) => void;
  onClear: () => void;
  className?: string;
}

const COMPLEXITY_OPTIONS: {
  value: WorkflowComplexity;
  label: string;
  badgeClassName: string;
}[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    badgeClassName: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    badgeClassName: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
  },
  {
    value: 'advanced',
    label: 'Advanced',
    badgeClassName: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
  }
];

export function ComplexityFilter({
  selectedComplexities,
  onToggle,
  onClear,
  className
}: ComplexityFilterProps) {
  const hasActiveFilters = selectedComplexities.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by complexity:</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2 text-xs text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by complexity level"
      >
        {COMPLEXITY_OPTIONS.map((option) => {
          const isActive = selectedComplexities.includes(option.value);
          return (
            <Badge
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : option.badgeClassName,
                !isActive && 'hover:bg-accent'
              )}
              onClick={() => onToggle(option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle(option.value);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
            >
              {option.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
