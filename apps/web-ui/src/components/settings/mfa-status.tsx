/**
 * MFA Status Display Component
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Shows current MFA status and allows management actions.
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';

interface MfaStatusProps {
  status: {
    mfaEnabled: boolean;
    mfaFactors: string[];
    backupCodesCount: number;
    shouldWarnBackupCodes: boolean;
    lastUsedAt: string | null;
    createdAt: string | null;
  } | null;
  onEnableMfa: () => void;
  onDisableMfa: () => void;
  onRegenerateCodes: () => void;
  onShowBackupCodes: () => void;
}

export default function MfaStatus({
  status,
  onEnableMfa,
  onDisableMfa,
  onRegenerateCodes,
  onShowBackupCodes,
}: MfaStatusProps) {
  if (!status) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.mfaEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              status.mfaEnabled
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            {status.mfaEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        <CardDescription>
          {status.mfaEnabled
            ? 'Your account is protected with two-factor authentication'
            : 'Add an extra layer of security to your account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.mfaEnabled ? (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Factors enabled:</span>
                <span className="font-medium">{status.mfaFactors.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Backup codes remaining:</span>
                <span className={`font-medium ${status.shouldWarnBackupCodes ? 'text-orange-600' : ''}`}>
                  {status.backupCodesCount} / 10
                  {status.shouldWarnBackupCodes && (
                    <span className="ml-2 text-xs">(Low - regenerate soon)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last used:</span>
                <span className="font-medium">{formatDate(status.lastUsedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Enabled on:</span>
                <span className="font-medium">{formatDate(status.createdAt)}</span>
              </div>
            </div>

            {status.shouldWarnBackupCodes && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  You have {status.backupCodesCount} backup codes remaining. Consider regenerating
                  them to ensure you always have access to your account.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onShowBackupCodes}>
                View Backup Codes
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerateCodes}>
                Regenerate Codes
              </Button>
              <Button variant="outline" size="sm" onClick={onDisableMfa}>
                Disable MFA
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Two-factor authentication adds an extra layer of security to your account. When
                enabled, you&apos;ll need to enter a code from your authenticator app in addition to
                your password.
              </p>
            </div>
            <Button onClick={onEnableMfa}>
              Enable Two-Factor Authentication
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
