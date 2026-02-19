/**
 * Phase Progression Component
 * Story 6.6, Task 6: Phase Progression Logic
 *
 * Implements:
 * - Phase state machine for incidents
 * - Phase transition confirmation dialog
 * - Phase change audit logging
 * - Phase-specific action availability
 * - Phase history storage in timeline
 * - Phase completion checklist
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  AlertCircle,
  History,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type {
  IncidentPhase,
  PhaseTransition,
  PhaseChecklist,
} from '@/lib/types/incidents';
import {
  PHASE_CONFIG,
  PHASE_TRANSITIONS,
  isValidTransition,
} from '@/lib/types/incidents';

interface PhaseProgressionProps {
  currentPhase: IncidentPhase;
  phaseHistory: PhaseTransition[];
  onPhaseTransition?: (
    toPhase: IncidentPhase,
    notes?: string
  ) => Promise<void>;
  checklists?: Record<IncidentPhase, PhaseChecklist>;
  disabled?: boolean;
  className?: string;
}

/**
 * Phase completion checklist for each phase
 */
const DEFAULT_PHASE_CHECKLISTS: Record<IncidentPhase, string[]> = {
  identification: [
    'Initial incident detected and logged',
    'Scope and impact assessed',
    'Affected systems identified',
    'Incident severity determined',
    'Response team assembled',
  ],
  containment: [
    'Immediate threats contained',
    'Isolation measures implemented',
    'Containment strategy documented',
    'Stakeholders notified',
    'Blast radius assessed',
  ],
  eradication: [
    'Root cause identified',
    'Threat artifacts removed',
    'Vulnerabilities patched',
    'Systems cleaned and restored',
    'Eradication verified',
  ],
  recovery: [
    'Normal operations restored',
    'System functionality validated',
    'Monitoring for recurrence established',
    'Documentation updated',
    'Lessons learned initiated',
  ],
  closed: [
    'Post-incident review completed',
    'Final report delivered',
    'Improvement actions identified',
    'Stakeholders debriefed',
    'Incident archived',
  ],
};

/**
 * Phase history item component
 */
function PhaseHistoryItem({
  transition,
}: {
  transition: PhaseTransition;
}) {
  const fromConfig = PHASE_CONFIG[transition.from];
  const toConfig = PHASE_CONFIG[transition.to];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-background-hover border border-border-subtle">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
        <History className="w-4 h-4 text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              backgroundColor: `${fromConfig.color}15`,
              color: fromConfig.color,
            }}
          >
            {fromConfig.name}
          </Badge>
          <ChevronRight className="w-3 h-3 text-text-muted" />
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              backgroundColor: `${toConfig.color}15`,
              color: toConfig.color,
            }}
          >
            {toConfig.name}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
          <span>{transition.userName}</span>
          <span>•</span>
          <span>{new Date(transition.timestamp).toLocaleString()}</span>
        </div>
        {transition.notes && (
          <p className="text-sm text-text-secondary mt-2 line-clamp-2">
            {transition.notes}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Phase checklist component
 */
function PhaseChecklistComponent({
  phase,
  items,
  completed,
  onToggle,
}: {
  phase: IncidentPhase;
  items: Array<{ id: string; text: string; completed: boolean }>;
  completed: boolean;
  onToggle?: (itemId: string) => void;
}) {
  const config = PHASE_CONFIG[phase];
  const completedCount = items.filter((i) => i.completed).length;
  const isComplete = completedCount === items.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4" style={{ color: config.color }} />
          <span className="text-sm font-medium text-text-primary">
            {config.name} Checklist
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            isComplete
              ? 'text-accent-success border-accent-success/30 bg-accent-success/10'
              : 'text-text-muted'
          )}
        >
          {completedCount}/{items.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle?.(item.id)}
            disabled={!onToggle}
            className={cn(
              'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
              'hover:bg-background-hover',
              item.completed
                ? 'border-accent-success/30 bg-accent-success/5'
                : 'border-border-subtle bg-background-base',
              !onToggle && 'cursor-default'
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-accent-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
            )}
            <span
              className={cn(
                'text-sm',
                item.completed
                  ? 'text-text-primary line-through'
                  : 'text-text-secondary'
              )}
            >
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Phase option card for transition dialog
 */
function PhaseOptionCard({
  phase,
  selected,
  onSelect,
  disabled,
}: {
  phase: IncidentPhase;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  const config = PHASE_CONFIG[phase];

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative p-4 rounded-lg border text-left transition-all',
        'hover:border-current/40',
        selected
          ? 'border-current bg-current/10'
          : 'border-border-subtle bg-background-hover',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={
        selected
          ? {
              borderColor: config.color,
              backgroundColor: `${config.color}10`,
            }
          : undefined
      }
    >
      {disabled && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-text-muted" />
        </div>
      )}
      <div className="font-semibold text-sm">{config.name}</div>
      <div className="text-xs text-text-muted mt-1">{config.description}</div>
      {disabled && (
        <div className="text-xs text-accent-warning mt-2">Not available</div>
      )}
    </button>
  );
}

/**
 * Main Phase Progression Component
 */
export function PhaseProgression({
  currentPhase,
  phaseHistory,
  onPhaseTransition,
  checklists,
  disabled = false,
  className,
}: PhaseProgressionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<IncidentPhase | null>(null);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Get allowed transitions based on current phase
  const allowedTransitions = useMemo(() => {
    const rule = PHASE_TRANSITIONS.find((r) => r.from === currentPhase);
    return rule?.allowedTransitions ?? [];
  }, [currentPhase]);

  const canTransition = allowedTransitions.length > 0 && !disabled;

  const handleTransition = async () => {
    if (selectedPhase) {
      await onPhaseTransition?.(selectedPhase, notes || undefined);
      setDialogOpen(false);
      setSelectedPhase(null);
      setNotes('');
    }
  };

  const allPhases = Object.keys(PHASE_CONFIG) as IncidentPhase[];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Phase Progression
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>

          {canTransition && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              Advance Phase
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Phase History */}
      {showHistory && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-text-primary">
            Transition History
          </h3>
          {phaseHistory.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No phase transitions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {phaseHistory.map((transition, index) => (
                <PhaseHistoryItem key={index} transition={transition} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Phase Checklist */}
      {checklists?.[currentPhase] && (
        <PhaseChecklistComponent
          phase={currentPhase}
          items={checklists[currentPhase].items}
          completed={checklists[currentPhase].completed}
        />
      )}

      {/* Phase Progression Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advance Incident Phase</DialogTitle>
            <DialogDescription>
              Current phase: <strong>{PHASE_CONFIG[currentPhase].name}</strong>
              <br />
              Select the next phase for this incident.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Available Phases */}
            <div>
              <Label>Select Next Phase</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {allPhases.map((phase) => {
                  const isAllowed = allowedTransitions.includes(phase);
                  const isCurrent = phase === currentPhase;

                  return (
                    <PhaseOptionCard
                      key={phase}
                      phase={phase}
                      selected={selectedPhase === phase}
                      onSelect={() => isAllowed && setSelectedPhase(phase)}
                      disabled={!isAllowed || isCurrent}
                    />
                  );
                })}
              </div>
            </div>

            {/* Transition Notes */}
            <div>
              <Label htmlFor="notes">Transition Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document the reason for this phase transition, key decisions made, and any outstanding issues..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Warning for critical transitions */}
            {selectedPhase === 'closed' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/30">
                <AlertCircle className="w-5 h-5 text-accent-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent-warning">
                    Closing Incident
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    This will mark the incident as closed. Ensure all tasks are
                    completed, documentation is finalized, and lessons learned are
                    captured.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransition}
              disabled={!selectedPhase}
              className="gap-2"
            >
              Confirm Transition
              <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Export default checklists for use
 */
export { DEFAULT_PHASE_CHECKLISTS };
