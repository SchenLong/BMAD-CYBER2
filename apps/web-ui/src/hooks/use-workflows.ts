/**
 * use-workflows Hook
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 1: Create Workflow Picker Component
 *
 * React Query hooks for fetching workflows data and execution
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workflow, WorkflowExecutionRequest, WorkflowExecutionResponse } from '@/lib/types/workflows';

// API base URL
const API_BASE = '/api';

/**
 * Fetch all workflows
 */
export function useWorkflows(search?: string) {
  return useQuery<Workflow[]>({
    queryKey: ['workflows', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`${API_BASE}/workflows?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      const data = await response.json();
      return data.workflows;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch workflows by category
 */
export function useWorkflowsByCategory(category: string) {
  return useQuery<Workflow[]>({
    queryKey: ['workflows', 'category', category],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/workflows?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      const data = await response.json();
      return data.workflows;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single workflow by ID
 */
export function useWorkflow(workflowId: string) {
  return useQuery<Workflow>({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      return response.json();
    },
    enabled: !!workflowId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Execute workflow mutation
 */
export function useExecuteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, inputs, options }: WorkflowExecutionRequest) => {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs, options }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to execute workflow');
      }

      return response.json() as Promise<WorkflowExecutionResponse>;
    },
    onSuccess: () => {
      // Invalidate workflows query to reflect any changes
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      });
    },
  });
}

/**
 * Search workflows hook (debounced)
 */
export function useSearchWorkflows(query: string, debounceMs = 300) {
  return useWorkflows(query);
}
