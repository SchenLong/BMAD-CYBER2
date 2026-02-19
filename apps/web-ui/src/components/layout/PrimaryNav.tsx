/**
 * PrimaryNav Component
 * Story 2.6: Role-Configured Navigation
 *
 * Main sidebar navigation component that displays role-based navigation items
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useUserStore } from '@/stores/user-store';
import { getNavigationForRole } from '@/lib/navigation-config';
import { NavSection } from './NavSection';
import { cn } from '@/lib/utils';
import { Command, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface PrimaryNavProps {
  className?: string;
}

export function PrimaryNav({ className }: PrimaryNavProps) {
  const router = useRouter();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const onboardingRole = useUserStore((state) => state.onboardingRole);

  // Get navigation items based on user's role
  const navItems = React.useMemo(() => {
    return getNavigationForRole(onboardingRole);
  }, [onboardingRole]);

  const handleItemClick = () => {
    // Optional: Close mobile drawer or perform other actions
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex flex-col h-screen bg-background border-r border-border transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-60',
          className
        )}
        aria-label="Primary navigation"
      >
        {/* Logo/Brand Area */}
        <div className="flex h-16 items-center border-b border-border px-4">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mx-auto"
                  onClick={() => router.push('/dashboard')}
                >
                  <Command className="h-6 w-6" />
                  <span className="sr-only">BMAD</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">BMAD Dashboard</TooltipContent>
            </Tooltip>
          ) : (
            <div
              className="flex items-center gap-2 font-semibold text-lg cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <Command className="h-6 w-6 text-primary" />
              <span>BMAD</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <NavSection
            items={navItems}
            collapsed={sidebarCollapsed}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'w-full',
                  !sidebarCollapsed && 'justify-start px-3'
                )}
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <>
                    <ChevronsLeft className="h-5 w-5" />
                    {!sidebarCollapsed && (
                      <span className="ml-2 text-sm">Collapse</span>
                    )}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={sidebarCollapsed ? 'right' : 'top'}>
              {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
