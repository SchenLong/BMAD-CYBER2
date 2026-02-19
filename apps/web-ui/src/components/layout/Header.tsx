/**
 * Header Component
 * Story 2.6: Role-Configured Navigation
 *
 * Top header bar with logo, user menu, and mobile toggle
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { cn } from '@/lib/utils';
import { Command, Settings, LogOut, Key, Menu, X, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileNav } from './MobileNav';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const userName = useUserStore((state) => state.userName);
  const userId = useUserStore((state) => state.userId);
  const onboardingRole = useUserStore((state) => state.onboardingRole);

  // Get user initials for avatar fallback
  const initials = React.useMemo(() => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [userName]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingRole: newRole }),
      });
      // Store will update via revalidation
      router.refresh();
    } catch (error) {
      console.error('Role change failed:', error);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6',
        className
      )}
    >
      {/* Mobile Nav Toggle */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Logo (desktop) */}
      <Link
        href="/dashboard"
        className="hidden md:flex items-center gap-2 font-semibold text-lg"
      >
        <Command className="h-6 w-6 text-primary" />
        <span>BMAD</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Role Badge (if available) */}
      {onboardingRole && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          <Badge className="h-3 w-3" />
          <span className="capitalize">
            {onboardingRole.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`/avatars/${userId}.png`} alt={userName || 'User'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
              {onboardingRole && (
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {onboardingRole.toLowerCase().replace('_', ' ')}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings/security')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings/sessions')}>
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
