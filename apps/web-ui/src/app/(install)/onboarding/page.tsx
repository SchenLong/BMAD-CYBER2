/**
 * Onboarding Page
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Server component that checks onboarding status and renders wizard
 */

import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { OnboardingWizardClient } from './onboarding-wizard-client';

export default async function OnboardingPage() {
  const session = await validateSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login');
  }

  // Check if onboarding is already completed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, onboardingRole: true },
  });

  // If onboarding completed, redirect to dashboard
  if (user?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return (
    <div className="w-full max-w-4xl px-4 py-8">
      <OnboardingWizardClient />
    </div>
  );
}
