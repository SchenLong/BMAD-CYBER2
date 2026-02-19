'use client';

/**
 * Session Timeout Dialog
 * Story 1.6: Session Management - Session Timeout UX
 *
 * Displays a warning dialog 2 minutes before session timeout.
 * Allows user to extend session or log out.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

/** Session timeout configuration constants
 * These values should match the server-side configuration in .env
 *
 * WARNING_TIME_MS: Show warning dialog this many milliseconds before expiry
 * CHECK_INTERVAL_MS: How often to check session status (client-side only)
 * ACTIVITY_EVENTS: Events that reset the activity timer
 */
const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes before timeout
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;

interface SessionTimeoutDialogProps {
  /** Session expiry in minutes (default: from API) */
  sessionExpiryMinutes?: number;
  /** Custom message for the timeout warning */
  warningMessage?: string;
}

export function SessionTimeoutDialog({
  sessionExpiryMinutes = 15,
  warningMessage,
}: SessionTimeoutDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  // Track last activity timestamp
  const lastActivityRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /** Update last activity timestamp */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    // No dependencies - this function updates a ref only
  }, []);

  /** Check if session is about to expire */
  const checkSessionExpiry = useCallback(() => {
    const now = new Date();
    const lastActivity = lastActivityRef.current;
    const inactiveTime = now.getTime() - lastActivity.getTime();
    const sessionDuration = sessionExpiryMinutes * 60 * 1000;
    const timeUntilExpiry = sessionDuration - inactiveTime;

    // Show warning if within warning window
    if (timeUntilExpiry <= WARNING_TIME_MS && timeUntilExpiry > 0) {
      setTimeRemaining(Math.ceil(timeUntilExpiry / 1000));
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  }, [sessionExpiryMinutes, isOpen]);

  /** Log out the user */
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and redirect to login
      setIsOpen(false);
      router.push('/login');
    }
  }, [router]);

  /** Extend the current session */
  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Update last activity to now
        updateActivity();
        setIsOpen(false);
      } else {
        // Refresh failed - user needs to log in again
        handleLogout();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      handleLogout();
    } finally {
      setIsExtending(false);
    }
  };

  /** Format seconds to MM:SS */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /** Set up activity tracking and session checking */
  useEffect(() => {
    // Add activity event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Check session expiry every minute
    intervalRef.current = setInterval(checkSessionExpiry, CHECK_INTERVAL_MS);

    // Initial check
    checkSessionExpiry();

    return () => {
      // Clean up event listeners
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkSessionExpiry, updateActivity]);

  // Update countdown display when dialog is open
  useEffect(() => {
    if (isOpen) {
      const countdownInterval = setInterval(() => {
        const now = new Date();
        const lastActivity = lastActivityRef.current;
        const inactiveTime = now.getTime() - lastActivity.getTime();
        const sessionDuration = sessionExpiryMinutes * 60 * 1000;
        const timeUntilExpiry = sessionDuration - inactiveTime;

        if (timeUntilExpiry <= 0) {
          handleLogout();
        } else {
          setTimeRemaining(Math.ceil(timeUntilExpiry / 1000));
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isOpen, sessionExpiryMinutes, handleLogout]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription>
            {warningMessage ||
              `For security reasons, your session will expire due to inactivity.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="text-4xl font-mono font-semibold tabular-nums text-amber-500">
            {formatTime(timeRemaining)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            until your session expires
          </p>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="sm:order-2"
          >
            Log Out
          </Button>
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
            className="sm:order-1"
          >
            {isExtending ? 'Extending...' : 'Stay Logged In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
