/**
 * Onboarding Layout
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Minimal layout for onboarding flow without navigation
 */

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-base p-4">
      <div className="w-full">{children}</div>
    </div>
  );
}
