/**
 * useUserRole Hook
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Hook to access and manage user's onboarding role
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRoleType, ROLE_QUICK_ACTIONS } from '@/lib/types/onboarding';
import type { QuickAction } from '@/lib/types/onboarding';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  onboardingRole: UserRoleType | null;
  onboardingCompleted: string | null;
}

interface UseUserRoleReturn {
  role: UserRoleType | null;
  isLoading: boolean;
  error: Error | null;
  quickActions: QuickAction[];
  isOnboardingComplete: boolean;
}

/**
 * Fetch user profile from API
 */
async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  const data = await response.json();
  return data.user;
}

/**
 * Hook to access user role and related data
 */
export function useUserRole(): UseUserRoleReturn {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const role = user?.onboardingRole ?? null;
  const isOnboardingComplete = !!user?.onboardingCompleted;

  // Get quick actions for the user's role
  const quickActions = role ? ROLE_QUICK_ACTIONS[role] : [];

  return {
    role,
    isLoading,
    error,
    quickActions,
    isOnboardingComplete,
  };
}

/**
 * Hook to check if user needs onboarding
 */
export function useNeedsOnboarding(): boolean {
  const { isOnboardingComplete, isLoading } = useUserRole();

  // Still loading = can't determine yet
  if (isLoading) return false;

  // No onboarding completed = needs onboarding
  return !isOnboardingComplete;
}
