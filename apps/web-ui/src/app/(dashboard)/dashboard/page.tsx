/**
 * Dashboard Page with Welcome Screen
 * Story 2.2: Abdul Welcome Screen
 *
 * Protected dashboard page - shows Abdul's welcome screen with:
 * - Personalized greeting with user's name
 * - Role-configured quick actions (3 buttons)
 * - Recent projects for quick resume
 * - Conversational input field
 */

import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { WelcomeScreenClient } from './welcome-screen-client';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await validateSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch user profile with onboarding data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingRole: true,
      onboardingCompleted: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // If onboarding not completed, redirect to onboarding
  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with user info and logout */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-bold text-primary">A</span>
            </div>
            <span className="font-semibold">BMAD Web UI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name || user.email}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content - Welcome Screen */}
      <main className="container mx-auto px-4 py-8">
        <WelcomeScreenClient
          userId={user.id}
          userName={user.name}
          onboardingRole={user.onboardingRole}
        />
      </main>
    </div>
  );
}
