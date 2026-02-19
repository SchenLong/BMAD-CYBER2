/**
 * AdvancedModeToggle Component
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 5: Add Advanced Mode Toggle
 *
 * Toggle switch for enabling Layer 4 (Power User mode)
 * Shows confirmation modal before enabling
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Zap, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentStore } from '@/stores/agent-store';

interface AdvancedModeToggleProps {
  variant?: 'switch' | 'button';
  size?: 'default' | 'sm' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function AdvancedModeToggle({
  variant = 'switch',
  size = 'default',
  showTooltip = true,
  className
}: AdvancedModeToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  const { isAdvancedMode, setAdvancedMode, toggleAdvancedMode } = useAgentStore();

  const handleToggleRequest = useCallback((checked: boolean) => {
    if (checked && !isAdvancedMode) {
      // Requesting to enable - show confirmation
      setPendingState(true);
      setShowConfirm(true);
    } else {
      // Disabling - no confirmation needed
      toggleAdvancedMode();
    }
  }, [isAdvancedMode, toggleAdvancedMode]);

  const handleConfirmEnable = useCallback(() => {
    setAdvancedMode(true);
    setShowConfirm(false);
    setPendingState(false);
  }, [setAdvancedMode]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setPendingState(false);
  }, []);

  // Button variant
  if (variant === 'button') {
    return (
      <>
        <Button
          variant={isAdvancedMode ? 'default' : 'outline'}
          size={size}
          onClick={() => handleToggleRequest(!isAdvancedMode)}
          className={cn(
            'gap-2',
            isAdvancedMode && 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
            className
          )}
        >
          <Zap className={cn('size-4', isAdvancedMode && 'fill-white')} />
          {isAdvancedMode ? 'Advanced Active' : 'Advanced Mode'}
        </Button>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="size-5 text-amber-500" />
                Enable Advanced Mode?
              </DialogTitle>
              <DialogDescription className="space-y-3">
                <p>
                  Advanced Mode unlocks Layer 4 (Power User) features including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Full workflow picker with search</li>
                  <li>Direct agent invocation by name/ID</li>
                  <li>Terminal emulator access</li>
                  <li>API key management</li>
                </ul>
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    These features are intended for experienced users. You can disable
                    Advanced Mode at any time in settings.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirmEnable} className="bg-amber-500 hover:bg-amber-600">
                Enable Advanced Mode
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Switch variant
  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <Switch
          checked={isAdvancedMode}
          onCheckedChange={handleToggleRequest}
          aria-label="Toggle advanced mode"
        />
        <span className="text-sm font-medium">Advanced Mode</span>
        {showTooltip && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="About advanced mode"
          >
            <Info className="size-4" />
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500" />
              Enable Advanced Mode?
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Advanced Mode unlocks Layer 4 (Power User) features including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Full workflow picker with search</li>
                <li>Direct agent invocation by name/ID</li>
                <li>Terminal emulator access</li>
                <li>API key management</li>
              </ul>
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">
                  These features are intended for experienced users. You can disable
                  Advanced Mode at any time in settings.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEnable} className="bg-amber-500 hover:bg-amber-600">
              Enable Advanced Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * AdvancedModeBadge - Display badge showing advanced mode status
 */
export function AdvancedModeBadge({ className }: { className?: string }) {
  const { isAdvancedMode } = useAgentStore();

  if (!isAdvancedMode) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
        'border border-amber-500/30',
        'text-amber-600 dark:text-amber-400',
        className
      )}
    >
      <Zap className="size-3 fill-current" />
      <span>Advanced</span>
    </div>
  );
}
