/**
 * NavItem Component
 * Story 2.6: Role-Configured Navigation
 *
 * Individual navigation item with icon, label, and active state
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import type { NavItem as NavItemType } from '@/lib/navigation-config';

interface NavItemProps {
  item: NavItemType;
  collapsed?: boolean;
  onClick?: () => void;
}

/**
 * Dynamically render Lucide icon by name
 */
function IconByName({ name, className }: { name: string; className?: string }) {
  // @ts-expect-error - Dynamic icon access from lucide-react
  const Icon = Icons[name];

  if (!Icon) {
    // Fallback to Home icon if not found
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Icons.Home className={className} />;
  }

  return <Icon className={className} />;
}

export function NavItem({ item, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname();

  // Check if this nav item is active
  const isActive = pathname === item.route ||
    (item.route !== '/' && pathname.startsWith(item.route));

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <>
      <IconByName
        name={item.icon}
        className={cn(
          'h-5 w-5 shrink-0 transition-colors duration-200',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground group-hover/nav:text-foreground'
        )}
      />
      {!collapsed && (
        <span
          className={cn(
            'truncate transition-colors duration-200',
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground group-hover/nav:text-foreground'
          )}
        >
          {item.label}
        </span>
      )}
      {/* Badge indicator */}
      {!collapsed && item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
          {item.badge}
        </span>
      )}
      {/* Disabled indicator */}
      {item.disabled && (
        <span className="ml-auto text-xs text-muted-foreground">Soon</span>
      )}
    </>
  );

  const baseClasses = cn(
    'group/nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
    'hover:bg-accent/50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    isActive && 'bg-accent text-primary font-medium',
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  if (item.disabled) {
    return (
      <div className={baseClasses} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.route}
      className={baseClasses}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}

/**
 * Collapsed NavItem - shows only icon with tooltip
 */
export function CollapsedNavItem({ item, onClick }: NavItemProps) {
  return (
    <div className="relative group">
      <NavItem item={item} collapsed={true} onClick={onClick} />
      {/* Tooltip */}
      <div
        className={cn(
          'absolute left-full ml-2 px-2 py-1',
          'bg-popover text-popover-foreground text-xs rounded-md shadow-md',
          'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50',
          'hidden lg:block'
        )}
      >
        {item.label}
      </div>
    </div>
  );
}
