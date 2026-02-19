/**
 * OnboardingWizard Component
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Main wizard container for role selection
 *
 * Accessibility enhancements:
 * - Proper aria-labels on interactive elements
 * - Keyboard navigation support
 * - Screen reader announcements
 */

'use client';

import { useState } from 'react';
import { RoleCard } from './RoleCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ONBOARDING_ROLES, DEFAULT_ONBOARDING_ROLE, UserRoleType } from '@/lib/types/onboarding';
import { Loader2 } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (role: UserRoleType) => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading?: boolean;
}

export function OnboardingWizard({ onComplete, onSkip, isLoading = false }: OnboardingWizardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = Object.values(ONBOARDING_ROLES);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await onComplete(selectedRole);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setShowSkipDialog(false);
    setIsSubmitting(true);
    try {
      await onSkip();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContinueDisabled = !selectedRole || isSubmitting || isLoading;

  return (
    <>
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to BMAD
          </h1>
          <p className="text-muted-foreground">
            Select your role to customize your experience
          </p>
        </div>

        {/* Role Cards Grid */}
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Select your role"
        >
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              onSelect={() => setSelectedRole(role.id)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowSkipDialog(true)}
            disabled={isSubmitting || isLoading}
            className="order-2 sm:order-1"
            aria-label="Skip onboarding wizard and use default Solo Operator role"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className="order-1 min-w-[120px] sm:order-2"
            aria-label={`Continue with ${selectedRole || 'selected'} role`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-center text-xs text-muted-foreground">
          You can change your role later in Settings
        </p>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip onboarding?</DialogTitle>
            <DialogDescription>
              You can select your role later in Settings. For now, we'll use the
              <strong> Solo Operator</strong> role as a default.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSkipDialog(false)}
              disabled={isSubmitting}
            >
              Go back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              aria-label="Confirm skip onboarding"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Skipping...
                </>
              ) : (
                'Skip'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
