/**
 * Quick Actions Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Displays 3 role-configured quick action buttons
 * Actions are prominent and clearly actionable
 */

'use client';

import { UserRoleType, ROLE_QUICK_ACTIONS } from '@/lib/types/onboarding';
import { icons, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  role: UserRoleType | null;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function QuickActions({ role, onActionClick, className = '' }: QuickActionsProps) {
  const actions = role ? ROLE_QUICK_ACTIONS[role] : [];

  if (actions.length === 0) {
    return null;
  }

  const handleClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => {
          const Icon: LucideIcon = icons[action.icon as keyof typeof icons] || icons.Circle;
          return (
            <button
              key={action.action}
              onClick={() => handleClick(action.action)}
              className="h-auto flex-col gap-3 p-4 items-start text-left rounded-lg border border-input bg-background hover:bg-accent hover:scale-[1.02] hover:shadow-md transition-all duration-200"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="w-full">
                <p className="font-medium text-sm">{action.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact quick actions for smaller spaces
 */
interface QuickActionsCompactProps {
  role: UserRoleType | null;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function QuickActionsCompact({ role, onActionClick, className = '' }: QuickActionsCompactProps) {
  const actions = role ? ROLE_QUICK_ACTIONS[role] : [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action) => {
        const Icon: LucideIcon = icons[action.icon as keyof typeof icons] || icons.Circle;
        return (
          <Button
            key={action.action}
            variant="ghost"
            size="sm"
            onClick={() => onActionClick?.(action.action)}
            className="gap-2"
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="text-xs">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
