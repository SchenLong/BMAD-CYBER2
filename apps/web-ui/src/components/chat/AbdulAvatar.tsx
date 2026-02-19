/**
 * Abdul Avatar Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Displays Abdul's avatar with personalized greeting
 * Abdul is the primary interface - not a sidebar or secondary element
 */

'use client';

import { UserRoleType } from '@/lib/types/onboarding';
import { getPersonalizedGreeting } from '@/lib/role-config';
import { Bot } from 'lucide-react';

interface AbdulAvatarProps {
  role: UserRoleType | null;
  userName?: string | null;
  className?: string;
}

export function AbdulAvatar({ role, userName, className = '' }: AbdulAvatarProps) {
  const greeting = getPersonalizedGreeting(role, userName);

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {/* Avatar - 64px diameter with subtle pulse animation */}
      <div className="relative" role="img" aria-label="Abdul avatar">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg">
          <Bot className="size-8 text-primary-foreground" aria-hidden="true" />
        </div>
        {/* Subtle pulse animation when idle */}
        <div className="absolute inset-0 -m-1 rounded-full border-2 border-primary/30 animate-pulse" aria-hidden="true" />
      </div>

      {/* Greeting Message */}
      <div className="flex-1 pt-2">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}
        </h1>
      </div>
    </div>
  );
}

/**
 * Compact avatar variant for smaller spaces
 */
interface AbdulAvatarCompactProps {
  className?: string;
}

export function AbdulAvatarCompact({ className = '' }: AbdulAvatarCompactProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
        <Bot className="size-5 text-primary-foreground" aria-hidden="true" />
      </div>
      <span className="font-semibold text-foreground">Abdul</span>
    </div>
  );
}
