/**
 * useRecentProjects Hook
 * Story 2.2: Abdul Welcome Screen
 *
 * Hook to fetch recent projects with caching
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { RecentProject } from '@/components/projects/RecentProjects';

interface RecentProjectsResponse {
  projects: RecentProject[];
}

/**
 * Fetch recent projects from API
 */
async function fetchRecentProjects(): Promise<RecentProject[]> {
  const response = await fetch('/api/projects/recent');
  if (!response.ok) {
    throw new Error('Failed to fetch recent projects');
  }
  const data: RecentProjectsResponse = await response.json();
  return data.projects;
}

/**
 * Hook to access recent projects
 * Caches for 5 minutes to reduce API calls
 */
export function useRecentProjects() {
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery<RecentProject[]>({
    queryKey: ['recent-projects'],
    queryFn: fetchRecentProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    projects,
    isLoading,
    error,
  };
}
