/**
 * RoleCard Component
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Displays a selectable role card with icon, title, and description
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, icons } from 'lucide-react';
import { RoleDefinition } from '@/lib/types/onboarding';

interface RoleCardProps {
  role: RoleDefinition;
  isSelected: boolean;
  onSelect: () => void;
}

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const Icon: LucideIcon = icons[role.icon as keyof typeof icons] || icons.User;

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        'border-2',
        isSelected
          ? `${role.borderColor} ${role.bgColor} shadow-lg`
          : 'border-border bg-card hover:border-primary/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-lg',
              role.bgColor
            )}
          >
            <Icon className={cn('size-6', role.color)} />
          </div>
          {isSelected && (
            <div
              className={cn(
                'flex size-6 items-center justify-center rounded-full',
                role.bgColor
              )}
            >
              <div className="size-3 rounded-full bg-current" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <h3 className="font-semibold text-lg text-foreground">{role.name}</h3>
        <p className="text-sm text-muted-foreground">{role.description}</p>
        <p className="text-xs text-muted-foreground/70">{role.useCase}</p>
      </CardContent>
    </Card>
  );
}
