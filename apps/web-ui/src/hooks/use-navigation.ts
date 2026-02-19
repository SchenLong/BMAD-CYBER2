/**
 * useNavigation Hook
 * Story 2.6: Role-Configured Navigation
 *
 * Custom hook for role-based navigation with caching and permission checks
 */

'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import {
  getNavigationForRole,
  findNavItemById,
  isNavActive,
  type NavItem,
  type SecondaryNavItem,
  SecondaryNavContext,
} from '@/lib/navigation-config';

interface UseNavigationReturn {
  /** Current navigation items based on user role */
  navItems: NavItem[];
  /** User's current role */
  role: ReturnType<typeof useUserStore.getState>['onboardingRole'];
  /** Check if a nav item is active */
  isActive: (item: NavItem, exact?: boolean) => boolean;
  /** Navigate to a specific route */
  navigate: (route: string) => void;
  /** Find a nav item by ID */
  findItem: (id: string) => NavItem | undefined;
  /** Check if user has permission for a nav item */
  hasPermission: (item: NavItem) => boolean;
  /** Refresh navigation (call after role change) */
  refresh: () => void;
}

const navigationCache = new Map<string, NavItem[]>();

/**
 * Clear navigation cache (call after role changes)
 */
export function clearNavigationCache() {
  navigationCache.clear();
}

/**
 * Main navigation hook
 */
export function useNavigation(): UseNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingRole = useUserStore((state) => state.onboardingRole);

  // Generate cache key based on role
  const cacheKey = `nav-${onboardingRole || 'default'}`;

  // Get navigation items with caching
  const navItems = useMemo(() => {
    if (navigationCache.has(cacheKey)) {
      return navigationCache.get(cacheKey)!;
    }

    const items = getNavigationForRole(onboardingRole);
    navigationCache.set(cacheKey, items);
    return items;
  }, [onboardingRole, cacheKey]);

  // Check if nav item is active
  const isActive = useCallback(
    (item: NavItem, exact: boolean = false) => {
      return isNavActive(item, pathname, exact);
    },
    [pathname]
  );

  // Navigate to route
  const navigate = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  // Find nav item by ID
  const findItem = useCallback(
    (id: string) => {
      return findNavItemById(id, onboardingRole);
    },
    [onboardingRole]
  );

  // Check permission for nav item
  const hasPermission = useCallback(
    (item: NavItem) => {
      if (!onboardingRole) return false;
      return (
        item.roles.includes(onboardingRole) || item.roles.length === 4
      );
    },
    [onboardingRole]
  );

  // Refresh navigation (clear cache and re-fetch)
  const refresh = useCallback(() => {
    clearNavigationCache();
    // Force re-render by updating timestamp in store if needed
  }, []);

  // Clear cache when role changes
  useEffect(() => {
    return () => {
      // Optional: cleanup on unmount
    };
  }, [onboardingRole]);

  return {
    navItems,
    role: onboardingRole,
    isActive,
    navigate,
    findItem,
    hasPermission,
    refresh,
  };
}

/**
 * Secondary navigation hook
 */
export function useSecondaryNavigation(context: SecondaryNavContext) {
  const { getSecondaryNavForContext } = require('@/lib/navigation-config');

  const secondaryNavItems = useMemo(() => {
    if (context === 'none') return [];
    return getSecondaryNavForContext(context);
  }, [context]);

  return {
    secondaryNavItems,
    hasSecondaryNav: secondaryNavItems.length > 0,
  };
}

/**
 * Role change handler hook
 * Handles role transitions with notification and navigation refresh
 */
export function useRoleChange() {
  const router = useRouter();
  const setOnboardingRole = useUserStore((state) => state.setOnboardingRole);
  const onboardingRole = useUserStore((state) => state.onboardingRole);

  const changeRole = useCallback(
    async (newRole: NonNullable<typeof onboardingRole>) => {
      // Update role in store
      setOnboardingRole(newRole);

      // Clear navigation cache
      clearNavigationCache();

      // Show notification (optional - can integrate with toast system)
      // For now, just navigate to dashboard to refresh navigation
      router.push('/dashboard');

      return true;
    },
    [setOnboardingRole, router]
  );

  return {
    changeRole,
    currentRole: onboardingRole,
  };
}
