/**
 * TeamWorkflowsGrid Component
 * Story 3.4: Team-Based Workflows
 *
 * Displays workflows for a team with:
 * - Search functionality
 * - Complexity filtering
 * - Responsive grid layout
 * - Workflow count display
 * - No results state
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileSearch, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowCard } from './WorkflowCard';
import { ComplexityFilter } from './ComplexityFilter';
import type { Workflow } from '@/lib/types/workflows';
import type { Team, WorkflowComplexity } from '@/lib/types/agents';

interface TeamWorkflowsGridProps {
  team: Team;
  workflows: Workflow[];
  className?: string;
}

export function TeamWorkflowsGrid({
  team,
  workflows,
  className
}: TeamWorkflowsGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexities, setSelectedComplexities] = useState<WorkflowComplexity[]>([]);

  // Filter workflows based on search and complexity
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.useCases?.some((useCase) =>
          useCase.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        workflow.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Complexity filter
      const matchesComplexity =
        selectedComplexities.length === 0 ||
        (workflow.complexity && selectedComplexities.includes(workflow.complexity));

      return matchesSearch && matchesComplexity;
    });
  }, [workflows, searchQuery, selectedComplexities]);

  const handleComplexityToggle = (complexity: WorkflowComplexity) => {
    setSelectedComplexities((prev) =>
      prev.includes(complexity)
        ? prev.filter((c) => c !== complexity)
        : [...prev, complexity]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedComplexities([]);
  };

  const handleStartWorkflow = (workflowId: string) => {
    // Navigate to workflow execution
    router.push(`/workflows/${workflowId}/execute`);
  };

  const hasActiveFilters = searchQuery.trim() || selectedComplexities.length > 0;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search workflows by name, description, or use cases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11"
          aria-label="Search workflows"
        />
      </div>

      {/* Complexity Filter */}
      <ComplexityFilter
        selectedComplexities={selectedComplexities}
        onToggle={handleComplexityToggle}
        onClear={handleClearFilters}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredWorkflows.length === workflows.length ? (
            <>
              <Users className="inline size-3 mr-1" />
              {workflows.length} {workflows.length === 1 ? 'workflow' : 'workflows'} available
            </>
          ) : (
            <>
              {filteredWorkflows.length} of {workflows.length} workflows
              {hasActiveFilters && ' (filtered)'}
            </>
          )}
        </p>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Workflow Grid */}
      {filteredWorkflows.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="region"
          aria-live="polite"
          aria-label={`${filteredWorkflows.length} workflow${filteredWorkflows.length === 1 ? '' : 's'} found`}
        >
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              team={team}
              onStart={handleStartWorkflow}
            />
          ))}
        </div>
      ) : (
        /* No Results State */
        <div className="text-center py-16">
          <FileSearch className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No workflows found
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to see more results'
              : 'No workflows available for this team'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
