/**
 * Onboarding Utilities
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Helper functions for onboarding status checking
 */

import { cookies } from 'next/headers';
import { prisma } from '../prisma';

/**
 * Check if user needs onboarding
 * Optimized version that checks database directly without API call
 * Used by middleware for efficient onboarding status checking
 *
 * @param userId - The user ID to check
 * @returns true if onboarding is needed, false otherwise
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    });

    // If user not found or onboarding not completed, needs onboarding
    return !user || !user.onboardingCompleted;
  } catch (error) {
    console.error('[Onboarding] Error checking status:', error);
    // Fail open - if we can't check, don't block the user
    return false;
  }
}

/**
 * Get onboarding status from session cookie
 * Fast check that doesn't require database lookup
 * Uses session validation which now includes onboarding status
 *
 * @returns Object with onboarding status and user ID
 */
export async function getOnboardingStatus(): Promise<{
  needsOnboarding: boolean;
  userId: string | null;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return { needsOnboarding: false, userId: null };
    }

    // Look up session with user onboarding status
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return { needsOnboarding: false, userId: null };
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      return { needsOnboarding: false, userId: null };
    }

    return {
      needsOnboarding: !session.user.onboardingCompleted,
      userId: session.user.id,
    };
  } catch (error) {
    console.error('[Onboarding] Error getting status:', error);
    return { needsOnboarding: false, userId: null };
  }
}
