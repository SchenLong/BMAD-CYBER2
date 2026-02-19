/**
 * MFA Setup Component
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Handles MFA setup flow: generate QR, verify code, show backup codes.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MfaSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface SetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodesCount: number;
  alreadyEnabled?: boolean;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  backupCodes: string[];
}

type Step = 'setup' | 'verify' | 'backup';

export default function MfaSetup({ onComplete, onCancel }: MfaSetupProps) {
  const [step, setStep] = useState<Step>('setup');
  const [setupData, setSetupData] = useState<(SetupResponse & { backupCodes?: string[] }) | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize MFA setup
  useEffect(() => {
    initiateSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
      });

      const data: SetupResponse & { error?: string; message?: string } = await response.json();

      if (!response.ok) {
        if (data.alreadyEnabled) {
          setError('MFA is already enabled for your account');
          setTimeout(onCancel, 2000);
          return;
        }
        throw new Error(data.message || data.error || 'Setup failed');
      }

      setSetupData(data);

      // Generate QR code image
      const qrResponse = await fetch(`/api/auth/mfa/qr?data=${encodeURIComponent(data.qrCodeUrl)}`);
      if (qrResponse.ok) {
        const qrBlob = await qrResponse.blob();
        setQrCodeUrl(URL.createObjectURL(qrBlob));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data: VerifyResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setIsLoading(false);
        return;
      }

      setSetupData((prev) => ({ ...prev!, ...data }));
      setStep('backup');
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 6
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (step === 'setup') {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Generating QR code...</p>
          </div>
        ) : setupData ? (
          <>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center relative w-[200px] h-[200px] mx-auto">
                  <Image src={qrCodeUrl} alt="QR Code" fill className="border-4 border-white p-2 rounded object-contain" />
                </div>
              )}
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Or enter this code manually:</p>
                <code className="text-sm font-mono">{setupData.secret}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('verify')} className="flex-1">
                Continue
              </Button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verify-code">Authentication Code</Label>
          <Input
            id="verify-code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            className="text-center text-lg tracking-widest"
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep('setup')} className="flex-1">
            Back
          </Button>
          <Button type="submit" disabled={code.length !== 6 || isLoading} className="flex-1">
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">MFA enabled successfully!</p>
        </div>

        <div className="space-y-2">
          <Label>Backup Codes</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Save these backup codes in a secure location. Each code can only be used once.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              {setupData?.backupCodes?.map((code, i) => (
                <code key={i} className="text-sm font-mono">
                  {code}
                </code>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const codes = setupData?.backupCodes?.join('\n') || '';
              navigator.clipboard.writeText(codes);
            }}
          >
            Copy All Codes
          </Button>
        </div>

        <Button onClick={onComplete} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return null;
}
