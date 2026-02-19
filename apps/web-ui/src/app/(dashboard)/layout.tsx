/**
 * Dashboard Layout
 * Story 2.6: Role-Configured Navigation
 *
 * Main dashboard layout with sidebar navigation, header, and main content area
 */

import { PrimaryNav } from '@/components/layout/PrimaryNav';
import { Header } from '@/components/layout/Header';
import { SecondaryNav } from '@/components/layout/SecondaryNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Primary Sidebar Navigation - Desktop */}
        <div className="hidden md:block">
          <PrimaryNav />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Secondary Navigation - contextual sub-navigation */}
          <SecondaryNav context="none" />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
