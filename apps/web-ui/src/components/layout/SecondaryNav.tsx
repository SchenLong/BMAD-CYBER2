/**
 * SecondaryNav Component
 * Story 2.6: Role-Configured Navigation
 *
 * Contextual sub-navigation for specific views (team selection, agent conversation, project view)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import type { SecondaryNavItem, SecondaryNavContext } from '@/lib/navigation-config';
import { getSecondaryNavForContext } from '@/lib/navigation-config';

interface SecondaryNavProps {
  context: SecondaryNavContext;
  className?: string;
}

export function SecondaryNav({ context, className }: SecondaryNavProps) {
  const pathname = usePathname();

  const secondaryNavItems = React.useMemo(() => {
    return getSecondaryNavForContext(context);
  }, [context]);

  if (!secondaryNavItems || secondaryNavItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      aria-label="Secondary navigation"
    >
      <div className="flex items-center gap-1 px-4 overflow-x-auto">
        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.route ||
            (item.route !== '/' && pathname.startsWith(item.route));

          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                'border-b-2 -mb-px',
                'hover:text-foreground/80',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Secondary Nav Item Button (for actions within secondary nav)
 */
interface SecondaryNavActionProps {
  label: string;
  icon: string;
  onClick: () => void;
  isActive?: boolean;
}

export function SecondaryNavAction({
  label,
  icon,
  onClick,
  isActive,
}: SecondaryNavActionProps) {
  // @ts-expect-error - Dynamic icon access
  const Icon = Icons[icon] || Icons.Circle;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
        'border-b-2 -mb-px',
        'hover:text-foreground/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
