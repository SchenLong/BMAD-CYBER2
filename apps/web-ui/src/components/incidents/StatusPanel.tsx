/**
 * Status Panel Component
 * Story 6.6, Task 2: Status Panel Component
 *
 * Displays:
 * - Current incident phase with progress indicator
 * - Affected systems count with severity breakdown
 * - Contained systems count
 * - Phase transition button with confirmation
 * - Phase progression visualization
 */

'use client';

import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type {
  IncidentProject,
  IncidentPhase,
  IncidentSeverity,
} from '@/lib/types/incidents';
import {
  PHASE_CONFIG,
  getAllowedTransitions,
} from '@/lib/types/incidents';

interface StatusPanelProps {
  incident: IncidentProject;
  onPhaseTransition?: (newPhase: IncidentPhase, notes?: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Phase progression stepper showing all phases
 */
function PhaseStepper({ currentPhase }: { currentPhase: IncidentPhase }) {
  const phases = Object.keys(PHASE_CONFIG) as IncidentPhase[];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center justify-between">
      {phases.map((phase, index) => {
        const config = PHASE_CONFIG[phase];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={phase}>
            {/* Phase Node */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted && 'bg-accent-success border-accent-success text-background-base',
                  isCurrent && 'border-current ring-4 ring-current/20',
                  isPending && 'border-border-subtle bg-background-hover text-text-muted'
                )}
                style={
                  isCurrent
                    ? {
                        borderColor: config.color,
                        color: config.color,
                      }
                    : undefined
                }
              >
                {isCompleted ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : isCurrent ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isCurrent && 'text-text-primary font-semibold',
                  isCompleted && 'text-text-secondary',
                  isPending && 'text-text-muted'
                )}
              >
                {config.name}
              </span>
            </div>

            {/* Connector Line */}
            {index < phases.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full transition-all',
                  index < currentIndex
                    ? 'bg-accent-success'
                    : 'bg-border-subtle'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Systems status display
 */
function SystemsStatus({
  affected,
  contained,
  total,
}: {
  affected: number;
  contained: number;
  total: number;
}) {
  const containmentPercentage = total > 0 ? (contained / total) * 100 : 0;
  const affectedPercentage = total > 0 ? (affected / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Systems Status</span>
        <span className="text-sm font-medium text-text-primary">
          {contained} / {total} contained
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={containmentPercentage}
          className="h-3"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>{affected} affected</span>
          <span>{total} total</span>
        </div>
      </div>

      {/* Visual indicators */}
      <div className="flex gap-2 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-error" />
          <span className="text-xs text-text-tertiary">Affected: {affected}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-success" />
          <span className="text-xs text-text-tertiary">Contained: {contained}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Phase transition dialog
 */
function PhaseTransitionDialog({
  open,
  onOpenChange,
  currentPhase,
  allowedTransitions,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhase: IncidentPhase;
  allowedTransitions: IncidentPhase[];
  onConfirm: (newPhase: IncidentPhase, notes: string) => Promise<void>;
  loading?: boolean;
}) {
  const [selectedPhase, setSelectedPhase] = useState<IncidentPhase | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    if (selectedPhase) {
      await onConfirm(selectedPhase, notes);
      onOpenChange(false);
      setNotes('');
      setSelectedPhase(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Transition Incident Phase</AlertDialogTitle>
          <AlertDialogDescription>
            Current phase: <strong>{PHASE_CONFIG[currentPhase].name}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* Available Transitions */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Select new phase:
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {allowedTransitions.map((phase) => {
                const config = PHASE_CONFIG[phase];
                return (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      'hover:border-current/40',
                      selectedPhase === phase
                        ? 'border-current bg-current/10'
                        : 'border-border-subtle bg-background-hover'
                    )}
                    style={
                      selectedPhase === phase
                        ? {
                            borderColor: config.color,
                            backgroundColor: `${config.color}15`,
                          }
                        : undefined
                    }
                  >
                    <div className="font-medium text-sm">{config.name}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {config.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Transition notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document the reason for this phase transition..."
              className="mt-2 w-full min-h-[80px] p-3 rounded-lg border border-border-subtle bg-background-hover text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!selectedPhase || loading}
          >
            {loading ? 'Transitioning...' : 'Confirm Transition'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Main Status Panel Component
 */
export function StatusPanel({
  incident,
  onPhaseTransition,
  disabled = false,
  className,
}: StatusPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const allowedTransitions = getAllowedTransitions(incident.phase);
  const canTransition = allowedTransitions.length > 0 && !disabled;

  const handlePhaseTransition = async (newPhase: IncidentPhase, notes?: string) => {
    setTransitioning(true);
    try {
      await onPhaseTransition?.(newPhase, notes);
    } finally {
      setTransitioning(false);
    }
  };

  const totalSystems = incident.affectedSystems;
  const uncontained = incident.affectedSystems - incident.containedSystems;

  return (
    <div
      className={cn(
        'p-6 rounded-lg border border-border-subtle bg-background-elevated space-y-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Incident Status
          </h2>
        </div>
        {canTransition && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            Advance Phase
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Phase Progression */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-4">
          Response Progress
        </h3>
        <PhaseStepper currentPhase={incident.phase} />
      </div>

      {/* Systems Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemsStatus
          affected={incident.affectedSystems}
          contained={incident.containedSystems}
          total={incident.affectedSystems}
        />

        {/* Phase Info */}
        <div className="space-y-3">
          <div className="text-sm text-text-secondary">Current Phase</div>
          <div className="flex items-center gap-3">
            <Badge
              className="text-sm py-1.5 px-3"
              style={{
                backgroundColor: `${PHASE_CONFIG[incident.phase].color}20`,
                color: PHASE_CONFIG[incident.phase].color,
                border: `${PHASE_CONFIG[incident.phase].color}40`,
              }}
            >
              {PHASE_CONFIG[incident.phase].name}
            </Badge>
            <span className="text-sm text-text-muted">
              {PHASE_CONFIG[incident.phase].description}
            </span>
          </div>

          {uncontained > 0 && (
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-accent-error/10 border border-accent-error/20">
              <ShieldAlert className="w-4 h-4 text-accent-error mt-0.5" />
              <div className="text-sm">
                <span className="text-accent-error font-medium">
                  {uncontained} system{uncontained > 1 ? 's' : ''} uncontained
                </span>
                <span className="text-text-muted ml-1">
                  - requires attention
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase Transition Dialog */}
      <PhaseTransitionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPhase={incident.phase}
        allowedTransitions={allowedTransitions}
        onConfirm={handlePhaseTransition}
        loading={transitioning}
      />
    </div>
  );
}
