/**
 * MobileNav Component
 * Story 2.6: Role-Configured Navigation
 *
 * Mobile hamburger menu with slide-out drawer
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useUserStore } from '@/stores/user-store';
import { getNavigationForRole } from '@/lib/navigation-config';
import { NavSection } from './NavSection';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const onboardingRole = useUserStore((state) => state.onboardingRole);

  // Get navigation items based on user's role
  const navItems = React.useMemo(() => {
    return getNavigationForRole(onboardingRole);
  }, [onboardingRole]);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Close on route change
  React.useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    return () => {
      handleRouteChange();
    };
  }, []);

  return (
    <div className={cn('md:hidden', className)}>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="h-10 w-10"
      >
        {isOpen ? (
          <Icons.X className="h-6 w-6" />
        ) : (
          <Icons.Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-80 transform bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out md:hidden translate-x-0'
          )}
          aria-label="Mobile navigation"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-6">
            <div
              className="flex items-center gap-2 font-semibold text-lg cursor-pointer"
              onClick={() => {
                router.push('/dashboard');
                handleItemClick();
              }}
            >
              <Icons.Command className="h-6 w-6 text-primary" />
              <span>BMAD</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              aria-label="Close navigation"
            >
              <Icons.X className="h-6 w-6" />
            </Button>
          </div>

          <Separator className="mb-4" />

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto">
            <NavSection
              items={navItems}
              collapsed={false}
              onItemClick={handleItemClick}
            />
          </div>

          {/* Drawer Footer */}
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                router.push('/dashboard/settings/security');
                handleItemClick();
              }}
            >
              <Icons.Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
