'use client';

/**
 * Session Refresh Hook
 * Story 1.6: Session Management - Auto-refresh session
 *
 * Automatically refreshes the session token to prevent expiration.
 * Implements sliding window session expiration on the client side.
 */

import { useEffect, useRef, useCallback } from 'react';

/** Configuration */
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const MIN_REFRESH_INTERVAL_MS = 60 * 1000; // Minimum 1 minute between refreshes

interface UseSessionRefreshOptions {
  /** Session expiry in minutes (default: 15) */
  sessionExpiryMinutes?: number;
  /** Whether to enable auto-refresh (default: true) */
  enabled?: boolean;
  /** Callback when refresh succeeds */
  onRefresh?: () => void;
  /** Callback when refresh fails */
  onError?: (error: Error) => void;
  /** Callback when session expires */
  onExpired?: () => void;
}

export function useSessionRefresh({
  sessionExpiryMinutes = 15,
  enabled = true,
  onRefresh,
  onError,
  onExpired,
}: UseSessionRefreshOptions = {}) {
  const lastActivityRef = useRef<Date>(new Date());
  const lastRefreshRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /** Update last activity timestamp */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
  }, []);

  /** Perform session refresh */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const now = new Date();
      const timeSinceLastRefresh = now.getTime() - lastRefreshRef.current.getTime();

      // Don't refresh if we refreshed recently
      if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL_MS) {
        return true;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        lastRefreshRef.current = new Date();
        onRefresh?.();
        return true;
      } else if (response.status === 401) {
        // Session expired or invalid
        onExpired?.();
        return false;
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      return false;
    }
  }, [onRefresh, onError, onExpired]);

  /** Check if session needs refresh */
  const checkAndRefresh = useCallback(async () => {
    if (!enabled) return;

    const now = new Date();
    const lastActivity = lastActivityRef.current;
    const inactiveTime = now.getTime() - lastActivity.getTime();
    const sessionDuration = sessionExpiryMinutes * 60 * 1000;
    const timeUntilExpiry = sessionDuration - inactiveTime;

    // Refresh if we're within the refresh window
    if (timeUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS && timeUntilExpiry > 0) {
      await refreshSession();
    }
    // Session has expired
    else if (timeUntilExpiry <= 0) {
      onExpired?.();
    }
  }, [enabled, sessionExpiryMinutes, refreshSession, onExpired]);

  /** Manually trigger a refresh */
  const manualRefresh = useCallback(async () => {
    return await refreshSession();
  }, [refreshSession]);

  /** Set up activity tracking and periodic checks */
  useEffect(() => {
    if (!enabled) return;

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'visibilitychange'] as const;

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check periodically
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkAndRefresh, updateActivity]);

  return {
    refreshSession: manualRefresh,
    updateActivity,
  };
}
