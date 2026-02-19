/**
 * WorkflowPicker Component
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 1: Create Workflow Picker Component
 *
 * Main workflow picker with search, filtering, and category grouping
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, Clock, Play, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useWorkflows } from '@/hooks/use-workflows';
import { useExecuteWorkflow } from '@/hooks/use-workflows';
import { Workflow, WorkflowCategory } from '@/lib/types/workflows';
import { getWorkflowCategoryGroups } from '@/lib/data/workflows-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface WorkflowPickerProps {
  onExecute?: (workflowId: string) => void;
}

export function WorkflowPicker({ onExecute }: WorkflowPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<WorkflowCategory>>(new Set());
  const [workflowInputs, setWorkflowInputs] = useState<Record<string, unknown>>({});

  const { data: workflows = [], isLoading } = useWorkflows(searchQuery);
  const executeMutation = useExecuteWorkflow();

  // Group workflows by category
  const categoryGroups = useMemo(() => {
    if (searchQuery) {
      // When searching, flatten results but maintain category info
      const grouped = new Map<WorkflowCategory, Workflow[]>();
      workflows.forEach(workflow => {
        if (!grouped.has(workflow.category)) {
          grouped.set(workflow.category, []);
        }
        grouped.get(workflow.category)!.push(workflow);
      });
      return Array.from(grouped.entries()).map(([category, workflows]) => {
        const metadata = getWorkflowCategoryGroups().find(g => g.category === category);
        return {
          category,
          name: category,
          displayName: metadata?.displayName || category,
          icon: metadata?.icon || 'workflow',
          color: metadata?.color || 'text-gray-500',
          workflows,
        };
      });
    }
    return getWorkflowCategoryGroups();
  }, [workflows, searchQuery]);

  // Toggle category expansion
  const toggleCategory = (category: WorkflowCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Handle workflow execution
  const handleExecuteWorkflow = (workflow: Workflow) => {
    if (workflow.inputs && workflow.inputs.length > 0) {
      setSelectedWorkflow(workflow);
    } else {
      executeWorkflow(workflow.id);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const result = await executeMutation.mutateAsync({
        workflowId,
        inputs: workflowInputs,
      });
      onExecute?.(workflowId);
      setSelectedWorkflow(null);
      setWorkflowInputs({});
    } catch (error) {
      // Display user-friendly error message
      toast({
        type: 'error',
        title: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleInputChange = (inputName: string, value: unknown) => {
    setWorkflowInputs(prev => ({ ...prev, [inputName]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search workflows by name, description, or tags..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Workflow Categories */}
      <div className="space-y-3">
        {categoryGroups.map(group => {
          const isExpanded = expandedCategories.has(group.category) || !!searchQuery;

          return (
            <Card key={group.category} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => !searchQuery && toggleCategory(group.category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-5 w-5 ${group.color}`}>•</span>
                    <CardTitle className="text-lg">{group.displayName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {group.workflows.length}
                    </Badge>
                  </div>
                  {!searchQuery && (
                    <Button variant="ghost" size="sm">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-2">
                  {group.workflows.map(workflow => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onExecute={() => handleExecuteWorkflow(workflow)}
                      isExecuting={executeMutation.isPending}
                    />
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        {categoryGroups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No workflows found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Workflow Input Dialog */}
      <Dialog open={!!selectedWorkflow} onOpenChange={(open) => !open && setSelectedWorkflow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.displayName}</DialogTitle>
            <DialogDescription>
              Configure parameters for {selectedWorkflow?.name}
            </DialogDescription>
          </DialogHeader>

          {/* Note: Form validation is handled by the workflow execution system.
              The UI collects inputs and the backend validates them before execution. */}
          {selectedWorkflow?.inputs && (
            <div className="space-y-4">
              {selectedWorkflow.inputs.map(input => (
                <div key={input.name} className="space-y-2">
                  <Label htmlFor={`input-${input.name}`}>
                    {input.name}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {input.type === 'string' && input.options ? (
                    <select
                      id={`input-${input.name}`}
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={input.defaultValue as string}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      required={input.required}
                    >
                      <option value="">Select an option...</option>
                      {input.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : input.type === 'boolean' ? (
                    <select
                      id={`input-${input.name}`}
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={String(input.defaultValue ?? false)}
                      onChange={(e) => handleInputChange(input.name, e.target.value === 'true')}
                      required={input.required}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : input.type === 'array' ? (
                    <Input
                      id={`input-${input.name}`}
                      placeholder="Comma-separated values"
                      defaultValue={Array.isArray(input.defaultValue) ? input.defaultValue.join(', ') : undefined}
                      onChange={(e) => handleInputChange(input.name, e.target.value.split(',').map(s => s.trim()))}
                    />
                  ) : (
                    <Input
                      id={`input-${input.name}`}
                      type={input.type === 'number' ? 'number' : 'text'}
                      placeholder={input.description}
                      defaultValue={input.defaultValue as string}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      required={input.required}
                    />
                  )}
                  {input.description && (
                    <p className="text-xs text-muted-foreground">{input.description}</p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedWorkflow && executeWorkflow(selectedWorkflow.id)}
                  disabled={executeMutation.isPending}
                >
                  {executeMutation.isPending ? 'Executing...' : 'Execute'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onExecute: () => void;
  isExecuting: boolean;
}

function WorkflowCard({ workflow, onExecute, isExecuting }: WorkflowCardProps) {
  return (
    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm">{workflow.displayName}</h4>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {workflow.estimatedDuration}m
            </Badge>
            {workflow.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {workflow.description}
          </p>
          {workflow.requiredAgents && workflow.requiredAgents.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Agents: {workflow.requiredAgents.join(', ')}
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={onExecute}
          disabled={isExecuting}
          className="shrink-0"
        >
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
      </div>
    </div>
  );
}
