/**
 * Onboarding Wizard Client Component
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Client component for interactive onboarding flow
 *
 * Security & UX enhancements:
 * - Proper error clearing on retry
 * - Console error logging for debugging
 * - Better error state management
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { UserRoleType, DEFAULT_ONBOARDING_ROLE } from '@/lib/types/onboarding';

export function OnboardingWizardClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(async (role: UserRoleType) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingRole: role,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Redirect to dashboard after successful onboarding
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('[Onboarding] Failed to complete onboarding:', errorMessage);
      setError(errorMessage);
    }
  }, [router]);

  const handleSkip = useCallback(async () => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingRole: DEFAULT_ONBOARDING_ROLE,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to skip onboarding');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('[Onboarding] Failed to skip onboarding:', errorMessage);
      setError(errorMessage);
    }
  }, [router]);

  // Clear error when user dismisses it
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-start justify-between">
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={handleDismissError}
            className="ml-4 text-destructive hover:text-destructive/80"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
      <OnboardingWizard
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </>
  );
}
