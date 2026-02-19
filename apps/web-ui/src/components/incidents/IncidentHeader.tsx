/**
 * Incident Header Component
 * Story 6.6, Task 1: Incident Header Component
 *
 * Displays incident metadata including:
 * - Incident ID (INC-YYYY-NNN format)
 * - Severity indicator with color coding
 * - Current Phase badge
 * - Team member count
 */

'use client';

import React from 'react';
import { AlertTriangle, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  IncidentProject,
  IncidentSeverity,
  IncidentPhase,
} from '@/lib/types/incidents';
import { SEVERITY_COLORS, PHASE_CONFIG } from '@/lib/types/incidents';

interface IncidentHeaderProps {
  incident: IncidentProject;
  teamCount?: number;
  className?: string;
}

/**
 * Severity badge with color coding
 */
function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const color = SEVERITY_COLORS[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <Badge
      variant="outline"
      className="border-current/20 text-current"
      style={{
        backgroundColor: `${color}20`,
        color,
        borderColor: `${color}40`,
      }}
    >
      <AlertTriangle className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

/**
 * Phase badge with progress indicator
 */
function PhaseBadge({ phase, isActive = false }: { phase: IncidentPhase; isActive?: boolean }) {
  const config = PHASE_CONFIG[phase];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-current/20 text-current transition-all',
        isActive && 'ring-2 ring-current/30'
      )}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: `${config.color}40`,
      }}
    >
      {config.name}
    </Badge>
  );
}

/**
 * Incident ID display with copy functionality
 */
function IncidentIdDisplay({ incidentId }: { incidentId: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(incidentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
    >
      <span className="text-text-tertiary">#</span>
      {incidentId}
      <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? '✓ Copied' : 'Click to copy'}
      </span>
    </button>
  );
}

/**
 * Main Incident Header Component
 */
export function IncidentHeader({
  incident,
  teamCount = 0,
  className,
}: IncidentHeaderProps) {
  // Validate project type
  if (process.env.NODE_ENV === 'development' && incident.type !== 'incident-response') {
    console.warn(`IncidentHeader received non-incident-response project type: ${incident.type}`);
  }

  const createdAt = new Date(incident.createdAt);
  const duration = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  );

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-lg border border-border-subtle bg-background-elevated',
        className
      )}
    >
      {/* Left Section: Incident Identity */}
      <div className="flex items-center gap-4">
        {/* Severity Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${SEVERITY_COLORS[incident.severity]}20` }}
        >
          <AlertTriangle
            className="w-5 h-5"
            style={{ color: SEVERITY_COLORS[incident.severity] }}
          />
        </div>

        {/* Incident Info */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-text-primary">
              {incident.name}
            </h1>
            <SeverityBadge severity={incident.severity} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <IncidentIdDisplay incidentId={incident.incidentId} />
            <span className="text-text-muted">•</span>
            <PhaseBadge phase={incident.phase} isActive />
          </div>
        </div>
      </div>

      {/* Right Section: Stats & Actions */}
      <div className="flex items-center gap-4">
        {/* Team Count */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="text-text-primary">{teamCount}</span>
                <span className="text-text-tertiary text-sm">members</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{teamCount} team members assigned</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Duration */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-text-primary">
                  {duration > 0 ? `${duration}h` : '< 1h'}
                </span>
                <span className="text-text-tertiary text-sm">active</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Started {createdAt.toLocaleDateString()} at{' '}
                {createdAt.toLocaleTimeString()}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Status Indicator */}
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            incident.status === 'active' ? 'bg-accent-success animate-pulse' : 'bg-text-muted'
          )}
        />
      </div>
    </div>
  );
}

/**
 * Compact header variant for smaller displays
 */
export function IncidentHeaderCompact({
  incident,
  className,
}: {
  incident: IncidentProject;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border border-border-subtle bg-background-elevated',
        className
      )}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${SEVERITY_COLORS[incident.severity]}20` }}
      >
        <AlertTriangle
          className="w-4 h-4"
          style={{ color: SEVERITY_COLORS[incident.severity] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-primary truncate">
          {incident.name}
        </h3>
        <p className="text-xs text-text-secondary font-mono">
          {incident.incidentId}
        </p>
      </div>
      <PhaseBadge phase={incident.phase} />
    </div>
  );
}
