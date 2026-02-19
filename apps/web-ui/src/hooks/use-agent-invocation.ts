/**
 * use-agent-invocation Hook
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 2: Implement Direct Agent Invocation
 *
 * React Query hooks for direct agent invocation with autocomplete
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agent } from '@/lib/types/agents';

// API base URL
const API_BASE = '/api';

/**
 * Agent invocation request
 */
export interface AgentInvocationRequest {
  agentId: string;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Agent invocation response
 */
export interface AgentInvocationResponse {
  invocationId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  response?: string;
  error?: string;
}

/**
 * Fetch all agents for autocomplete
 */
export function useAllAgents(search?: string) {
  return useQuery<Agent[]>({
    queryKey: ['agents', 'all', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`${API_BASE}/agents?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      return data.agents;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Invoke agent directly mutation
 */
export function useInvokeAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AgentInvocationRequest): Promise<AgentInvocationResponse> => {
      const response = await fetch(`${API_BASE}/agents/${request.agentId}/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: request.message, context: request.context }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invoke agent');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate agents query if needed
      queryClient.invalidateQueries({
        queryKey: ['agents'],
      });
    },
  });
}

/**
 * Agent autocomplete with fuzzy search
 * Returns filtered agents based on search query
 */
export function useAgentAutocomplete(query: string, minQueryLength = 2) {
  return useQuery<Agent[]>({
    queryKey: ['agents', 'autocomplete', query],
    queryFn: async () => {
      if (!query || query.length < minQueryLength) {
        return [];
      }

      const response = await fetch(`${API_BASE}/agents?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search agents');
      }
      const data = await response.json();
      return data.agents;
    },
    enabled: query.length >= minQueryLength,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get agent availability status
 * This is a placeholder for future real-time status tracking
 */
export function useAgentStatus(agentId: string) {
  return useQuery<{ status: 'available' | 'busy' | 'offline' }>({
    queryKey: ['agent', 'status', agentId],
    queryFn: async () => {
      // For now, return available as default
      // In the future, this would check actual agent status
      return { status: 'available' as const };
    },
    enabled: !!agentId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}
