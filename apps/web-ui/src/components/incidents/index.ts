/**
 * Incident Response Components
 * Story 6.6: Incident Response Workspace
 *
 * Export all incident-related components for easy importing
 */

export { IncidentHeader, IncidentHeaderCompact } from './IncidentHeader';
export { StatusPanel } from './StatusPanel';
export { IncidentTimeline } from './IncidentTimeline';
export { EvidenceLocker } from './EvidenceLocker';
export { TeamPresence, TeamPresenceIndicator } from './TeamPresence';
export {
  PhaseProgression,
  DEFAULT_PHASE_CHECKLISTS,
} from './PhaseProgression';
export {
  IncidentNavigation,
  IncidentBreadcrumbs,
  IncidentNotificationIndicator,
  IncidentQuickActions,
  IncidentStatusBanner,
} from './IncidentNavigation';

// Re-export types for convenience
export type {
  IncidentProject,
  IncidentSeverity,
  IncidentPhase,
  TimelineEvent,
  TimelineEventType,
  TimelineFilters,
  TeamPresence as TeamPresenceData,
  PresenceStatus,
  EvidenceItem,
  PhaseTransition,
  PhaseChecklist,
  ChecklistItem,
  IncidentStats,
} from '@/lib/types/incidents';

export {
  SEVERITY_COLORS,
  PHASE_CONFIG,
  PHASE_TRANSITIONS,
  getAllowedTransitions,
  isValidTransition,
  generateIncidentId,
  formatIncidentTime,
} from '@/lib/types/incidents';
