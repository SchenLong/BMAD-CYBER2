/**
 * use-agents Hook
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 7: API Integration
 *
 * React Query hooks for fetching agents and teams data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agent, Team, AgentUserPreferences, TeamId } from '@/lib/types/agents';

// API base URL
const API_BASE = '/api';

/**
 * Fetch all teams
 */
export function useTeams(options?: { primaryOnly?: boolean }) {
  return useQuery<Team[]>({
    queryKey: ['teams', options?.primaryOnly],
    queryFn: async () => {
      const params = options?.primaryOnly ? 'primary=true' : '';
      const response = await fetch(`${API_BASE}/teams?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      return data.teams;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all agents with optional team filter
 */
export function useAgents(teamId?: string, search?: string) {
  return useQuery<Agent[]>({
    queryKey: ['agents', teamId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teamId) params.set('team', teamId);
      if (search) params.set('search', search);

      const response = await fetch(`${API_BASE}/agents?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      return data.agents;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch single agent by ID
 */
export function useAgent(agentId: string) {
  return useQuery<{ agent: Agent; relatedAgents: Agent[] }>({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      return response.json();
    },
    enabled: !!agentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch user preferences
 */
export function useUserPreferences() {
  return useQuery<AgentUserPreferences>({
    queryKey: ['user', 'preferences'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/preferences`);
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      const data = await response.json();
      return data.preferences;
    },
    staleTime: 0, // Always check for fresh preferences
  });
}

/**
 * Update user preferences mutation
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<AgentUserPreferences>) => {
      const response = await fetch(`${API_BASE}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch preferences
      queryClient.invalidateQueries({
        queryKey: ['user', 'preferences'],
      });
    },
  });
}

/**
 * Add to favorites mutation
 */
export function useAddFavoriteTeam() {
  const queryClient = useQueryClient();
  const updatePreferences = useUpdatePreferences();

  return useMutation({
    mutationFn: async (teamId: TeamId) => {
      // Get current preferences
      const currentPrefs = queryClient.getQueryData<AgentUserPreferences>(['user', 'preferences']);
      const favoriteTeams = currentPrefs?.favoriteTeams || [];

      // Add new team if not already present
      if (!favoriteTeams.includes(teamId)) {
        await updatePreferences.mutateAsync({
          favoriteTeams: [...favoriteTeams, teamId],
        });
      }

      return teamId;
    },
  });
}

/**
 * Add favorite agent mutation
 */
export function useAddFavoriteAgent() {
  const queryClient = useQueryClient();
  const updatePreferences = useUpdatePreferences();

  return useMutation({
    mutationFn: async (agentId: string) => {
      // Get current preferences
      const currentPrefs = queryClient.getQueryData<AgentUserPreferences>(['user', 'preferences']);
      const favoriteAgents = currentPrefs?.favoriteAgents || [];

      // Add new agent if not already present
      if (!favoriteAgents.includes(agentId)) {
        await updatePreferences.mutateAsync({
          favoriteAgents: [...favoriteAgents, agentId],
        });
      }

      return agentId;
    },
  });
}
