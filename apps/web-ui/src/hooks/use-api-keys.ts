/**
 * use-api-keys Hook
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 4: Implement API Key Generation
 *
 * React Query hooks for API key management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIKey, CreateAPIKeyRequest, CreateAPIKeyResponse } from '@/lib/types/api-keys';

// API base URL
const API_BASE = '/api';

/**
 * Fetch all API keys for current user
 */
export function useAPIKeys() {
  return useQuery<APIKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api-keys`);
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      return data.keys;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create new API key mutation
 */
export function useCreateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> => {
      const response = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create API key');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({
        queryKey: ['api-keys'],
      });
    },
  });
}

/**
 * Revoke API key mutation
 */
export function useRevokeAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`${API_BASE}/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      return keyId;
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({
        queryKey: ['api-keys'],
      });
    },
  });
}

/**
 * Update API key mutation (for deactivating/reactivating)
 */
export function useUpdateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyId, updates }: { keyId: string; updates: Partial<APIKey> }) => {
      const response = await fetch(`${API_BASE}/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({
        queryKey: ['api-keys'],
      });
    },
  });
}
