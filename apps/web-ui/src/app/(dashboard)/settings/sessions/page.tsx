/**
 * Sessions Settings Page
 * Story 1.6: Session Management - Session Management UI
 *
 * Displays and manages active sessions for the current user.
 */

import { ActiveSessions } from '@/components/settings/active-sessions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock } from 'lucide-react';

export default function SessionsSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your active sessions across devices
          </p>
        </div>

        {/* Session Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Session Timeout</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  For your security, sessions automatically expire after 15 minutes of inactivity.
                  You&apos;ll see a warning 2 minutes before your session expires.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Active Sessions */}
        <ActiveSessions />

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-base">Security Tips</CardTitle>
                <CardDescription>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>Regularly review your active sessions and revoke any you don&apos;t recognize</li>
                    <li>Always log out when using a shared or public device</li>
                    <li>Enable two-factor authentication for additional security</li>
                    <li>Use a strong, unique password for your account</li>
                  </ul>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
