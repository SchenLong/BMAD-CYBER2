/**
 * Role Switcher Component
 * Story 2.6: Role-Configured Navigation
 *
 * Allows users to switch their onboarding role, which updates the navigation
 */

'use client';

import * as React from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ONBOARDING_ROLES, type UserRoleType } from '@/lib/types/onboarding';
import { useNavigation } from '@/hooks/use-navigation';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

export function RoleSwitcher() {
  const router = useRouter();
  const { refresh } = useNavigation();
  const { onboardingRole, setOnboardingRole } = useUserStore();
  const [isChanging, setIsChanging] = React.useState(false);

  const currentRoleConfig = onboardingRole ? ONBOARDING_ROLES[onboardingRole] : null;

  const handleRoleChange = async (newRole: UserRoleType) => {
    if (newRole === onboardingRole) return;

    setIsChanging(true);

    try {
      // Update via API to persist
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingRole: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update local state
      setOnboardingRole(newRole);

      // Refresh navigation
      refresh();

      // Show toast notification
      toast({
        type: 'success',
        title: `Role changed to ${ONBOARDING_ROLES[newRole].name}`,
        message: 'Navigation has been updated',
        duration: 3000,
      });

      // Navigate to dashboard to see new navigation
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);

    } catch (error) {
      console.error('Failed to change role:', error);
      toast({
        type: 'error',
        title: 'Failed to change role',
        message: 'Please try again later',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Role</CardTitle>
        <CardDescription>
          Your role determines which navigation items are shown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentRoleConfig && (
              <Badge className={currentRoleConfig.bgColor + ' ' + currentRoleConfig.borderColor + ' border'}>
                {currentRoleConfig.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {currentRoleConfig?.description}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.values(ONBOARDING_ROLES).map((role) => (
            <Button
              key={role.id}
              variant={onboardingRole === role.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleChange(role.id as UserRoleType)}
              disabled={isChanging || onboardingRole === role.id}
              className={role.bgColor + (onboardingRole === role.id ? ' ' + role.borderColor + ' border' : '')}
            >
              {role.name}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Changing your role will update the navigation menu and available features.
        </p>
      </CardContent>
    </Card>
  );
}
