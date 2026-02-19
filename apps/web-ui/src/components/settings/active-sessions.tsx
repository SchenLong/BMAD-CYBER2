'use client';

/**
 * Active Sessions Component
 * Story 1.6: Session Management - Session Management UI
 *
 * Displays all active sessions for the current user with device/browser information.
 * Allows revoking specific sessions or all other sessions.
 */

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Monitor, Smartphone, Tablet, Laptop, AlertCircle } from 'lucide-react';
import { parseDeviceInfo, formatIpAddress, formatRelativeTime, getDeviceIcon } from '@/lib/auth/device-info';
import type { SessionInfo } from '@/lib/auth/types';

interface ActiveSessionsProps {
  /** Callback when sessions are updated */
  onSessionsChange?: () => void;
}

interface SessionsResponse {
  sessions: SessionInfo[];
  count: number;
}

export function ActiveSessions({ onSessionsChange }: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data: SessionsResponse = await response.json();
        setSessions(data.sessions);
      } else {
        setError('Failed to load sessions');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    setError('');

    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage('Session revoked successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchSessions();
        onSessionsChange?.();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to revoke session');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    setIsRevoking(true);
    setError('');

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setShowRevokeAllDialog(false);
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchSessions();
        onSessionsChange?.();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to revoke sessions');
        setIsRevoking(false);
      }
    } catch {
      setError('Failed to connect to server');
      setIsRevoking(false);
    } finally {
      setIsRevoking(false);
    }
  };

  const getDeviceIconComponent = (deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown') => {
    const iconName = getDeviceIcon(deviceType);
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="h-4 w-4" />;
      case 'Smartphone':
        return <Smartphone className="h-4 w-4" />;
      case 'Tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevokeAllDialog(true)}
              >
                Revoke All Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              {successMessage}
            </div>
          )}

          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No active sessions found. You may need to log in again.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const deviceInfo = parseDeviceInfo(session.userAgent);
                const isCurrent = session.isCurrent;

                return (
                  <div
                    key={session.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full ${
                        isCurrent
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getDeviceIconComponent(deviceInfo.deviceType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {deviceInfo.display}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatIpAddress(session.ipAddress)} • Last active {formatRelativeTime(session.lastActivity)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Expires {new Date(session.expires).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingSessionId === session.id}
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {revokingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {sessions.length > 0 && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Sessions expire after 15 minutes of inactivity. Using the &quot;Stay Logged In&quot; button
              when prompted will extend your session.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revoke All Others Confirmation Dialog */}
      <Dialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke All Other Sessions</DialogTitle>
            <DialogDescription>
              This will sign you out of all other devices and browsers. Your current session will remain active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeAllDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeAllOthers}
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke All Others'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
