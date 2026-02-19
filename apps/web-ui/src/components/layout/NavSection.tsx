/**
 * NavSection Component
 * Story 2.6: Role-Configured Navigation
 *
 * Navigation section grouping with optional header
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { NavItem as NavItemType } from '@/lib/navigation-config';
import { NavItem, CollapsedNavItem } from './NavItem';

interface NavSectionProps {
  title?: string;
  items: NavItemType[];
  collapsed?: boolean;
  onItemClick?: () => void;
}

export function NavSection({
  title,
  items,
  collapsed,
  onItemClick,
}: NavSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      {title && !collapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <ul className="space-y-0.5">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="animate-in fade-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {collapsed ? (
              <CollapsedNavItem item={item} onClick={onItemClick} />
            ) : (
              <NavItem item={item} onClick={onItemClick} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
