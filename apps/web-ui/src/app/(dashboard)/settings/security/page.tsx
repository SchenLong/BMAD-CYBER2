/**
 * Security Settings Page
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Allows users to enable/disable MFA and manage backup codes.
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MfaSetup from '@/components/auth/mfa-setup';
import MfaStatus from '@/components/settings/mfa-status';
import BackupCodesDisplay from '@/components/settings/backup-codes';
import { RoleSwitcher } from '@/components/settings/RoleSwitcher';

interface MfaStatusResponse {
  mfaEnabled: boolean;
  mfaFactors: string[];
  backupCodesCount: number;
  shouldWarnBackupCodes: boolean;
  lastUsedAt: string | null;
  createdAt: string | null;
}

export default function SecuritySettingsPage() {
  const [status, setStatus] = useState<MfaStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/auth/mfa/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaEnabled = () => {
    setShowMfaSetup(false);
    setSuccessMessage('MFA enabled successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
    fetchStatus();
  };

  const handleDisableMfa = async () => {
    setError('');
    setIsDisabling(true);

    try {
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to disable MFA');
        setIsDisabling(false);
        return;
      }

      setShowDisableDialog(false);
      setDisablePassword('');
      setSuccessMessage('MFA disabled successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchStatus();
    } catch {
      setError('An error occurred. Please try again.');
      setIsDisabling(false);
    }
  };

  const handleRegenerateCodes = async () => {
    try {
      const response = await fetch('/api/auth/mfa/regenerate-codes', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to regenerate codes');
        return;
      }

      setShowBackupCodes(true);
      setSuccessMessage('New backup codes generated');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Security Settings</h1>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account security settings
          </p>
        </div>

        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <MfaStatus
          status={status}
          onEnableMfa={() => setShowMfaSetup(true)}
          onDisableMfa={() => setShowDisableDialog(true)}
          onRegenerateCodes={handleRegenerateCodes}
          onShowBackupCodes={() => setShowBackupCodes(true)}
        />

        {/* Navigation Role Settings */}
        <RoleSwitcher />

        {/* Additional security settings can go here */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Change Password (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MFA Setup Dialog */}
      {showMfaSetup && (
        <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app and enter a verification code
              </DialogDescription>
            </DialogHeader>
            <MfaSetup onComplete={handleMfaEnabled} onCancel={() => setShowMfaSetup(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Disable MFA Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable MFA? This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password to confirm"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMfa}
              disabled={isDisabling || !disablePassword}
            >
              {isDisabling ? 'Disabling...' : 'Disable MFA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Display Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a secure location. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          <BackupCodesDisplay onClose={() => setShowBackupCodes(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
