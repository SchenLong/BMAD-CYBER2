/**
 * MFA Verification Page (Login Flow)
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Shown after successful password authentication when MFA is enabled.
 * User must enter TOTP code or backup code to complete login.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function MfaVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/mfa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          backupCode: useBackupCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const formatInput = (value: string) => {
    if (useBackupCode) {
      // Format as XXXX-XXXX
      const cleaned = value.toUpperCase().replace(/[^0-9A-F]/g, '');
      if (cleaned.length >= 4) {
        return cleaned.slice(0, 4) + (cleaned.length > 4 ? '-' + cleaned.slice(4, 8) : '');
      }
      return cleaned;
    }
    // TOTP: digits only, max 6
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setCode(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter your verification code to complete sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                {useBackupCode ? 'Backup Code' : 'Authentication Code'}
              </Label>
              <Input
                id="code"
                type="text"
                inputMode={useBackupCode ? 'text' : 'numeric'}
                placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
                value={code}
                onChange={handleInputChange}
                autoComplete={useBackupCode ? 'off' : 'one-time-code'}
                maxLength={useBackupCode ? 9 : 6}
                className="text-center text-lg tracking-widest"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {useBackupCode
                  ? 'Enter one of your 8-character backup codes'
                  : 'Open your authenticator app and enter the 6-digit code'}
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length === 0}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setError('');
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {useBackupCode
                ? 'Use authenticator app code instead'
                : 'Use a backup code instead'}
            </button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Back to login
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
