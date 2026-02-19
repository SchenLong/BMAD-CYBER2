/**
 * Incident Response Types
 * Story 6.6: Incident Response Workspace
 */

/**
 * Incident severity levels with color coding
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Incident response phases following NIST framework
 */
export type IncidentPhase =
  | 'identification'
  | 'containment'
  | 'eradication'
  | 'recovery'
  | 'closed';

/**
 * Timeline event types for incident visualization
 */
export type TimelineEventType =
  | 'detection'
  | 'analysis'
  | 'containment_action'
  | 'eradication_action'
  | 'recovery_action'
  | 'phase_change'
  | 'evidence_added'
  | 'note'
  | 'external_update';

/**
 * Team member presence status
 */
export type PresenceStatus = 'online' | 'away' | 'offline';

/**
 * Incident project data model
 * Extends base project type with incident-specific fields
 */
export interface IncidentProject {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  type: 'incident-response';
  // Incident-specific fields
  incidentId: string;        // INC-YYYY-NNN format
  severity: IncidentSeverity;
  phase: IncidentPhase;
  affectedSystems: number;
  containedSystems: number;
  phaseHistory: PhaseTransition[];
  // Standard project fields
  ownerId: string;
  status: 'draft' | 'active' | 'on-hold' | 'review' | 'delivered' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Phase transition for audit trail
 */
export interface PhaseTransition {
  from: IncidentPhase;
  to: IncidentPhase;
  timestamp: Date;
  userId: string;
  userName: string;
  notes?: string;
}

/**
 * Timeline event with contributor attribution
 */
export interface TimelineEvent {
  id: string;
  incidentId: string;
  type: TimelineEventType;
  timestamp: Date;
  userId: string;
  userName: string;
  message: string;
  details?: Record<string, unknown>;
  attachmentIds?: string[];
  severity?: IncidentSeverity;
}

/**
 * Team member with presence info
 */
export interface TeamPresence {
  userId: string;
  userName: string;
  avatar?: string;
  status: PresenceStatus;
  currentTask?: string;
  lastActivity: Date;
  role: string;
}

/**
 * Evidence item with hash verification
 */
export interface EvidenceItem {
  id: string;
  incidentId: string;
  title: string;
  description?: string;
  filePath: string;
  fileHash: string;        // SHA-256
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  uploaderName: string;
  verified: boolean;
  collector?: string;
  source?: string;
}

/**
 * Phase completion checklist
 */
export interface PhaseChecklist {
  phase: IncidentPhase;
  items: ChecklistItem[];
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

/**
 * Filter options for timeline
 */
export interface TimelineFilters {
  eventTypes?: TimelineEventType[];
  userIds?: string[];
  severity?: IncidentSeverity[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

/**
 * Phase transition validation
 */
export interface PhaseTransitionRule {
  from: IncidentPhase;
  allowedTransitions: IncidentPhase[];
  requiredChecklistItems?: string[];
}

/**
 * Incident statistics for dashboard
 */
export interface IncidentStats {
  totalIncidents: number;
  activeIncidents: number;
  byPhase: Record<IncidentPhase, number>;
  bySeverity: Record<IncidentSeverity, number>;
  avgResolutionTime: number; // in hours
}

/**
 * Severity color mapping for UI
 */
export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: 'rgb(239, 68, 68)',    // red
  high: 'rgb(249, 115, 22)',       // orange
  medium: 'rgb(234, 179, 8)',      // yellow
  low: 'rgb(59, 130, 246)',        // blue
};

/**
 * Phase display names and order
 */
export const PHASE_CONFIG: Record<IncidentPhase, {
  name: string;
  description: string;
  order: number;
  color: string;
}> = {
  identification: {
    name: 'Identification',
    description: 'Initial detection and assessment',
    order: 1,
    color: 'rgb(234, 179, 8)',
  },
  containment: {
    name: 'Containment',
    description: 'Limiting incident damage',
    order: 2,
    color: 'rgb(249, 115, 22)',
  },
  eradication: {
    name: 'Eradication',
    description: 'Removing threat artifacts',
    order: 3,
    color: 'rgb(168, 85, 247)',
  },
  recovery: {
    name: 'Recovery',
    description: 'Restoring normal operations',
    order: 4,
    color: 'rgb(59, 130, 246)',
  },
  closed: {
    name: 'Closed',
    description: 'Incident resolved',
    order: 5,
    color: 'rgb(34, 197, 94)',
  },
};

/**
 * Valid phase transitions
 */
export const PHASE_TRANSITIONS: PhaseTransitionRule[] = [
  {
    from: 'identification',
    allowedTransitions: ['containment', 'closed'],
  },
  {
    from: 'containment',
    allowedTransitions: ['eradication', 'identification', 'closed'],
  },
  {
    from: 'eradication',
    allowedTransitions: ['recovery', 'containment', 'closed'],
  },
  {
    from: 'recovery',
    allowedTransitions: ['closed', 'eradication'],
  },
  {
    from: 'closed',
    allowedTransitions: [],
  },
];

/**
 * Get allowed transitions for a phase
 */
export function getAllowedTransitions(currentPhase: IncidentPhase): IncidentPhase[] {
  const rule = PHASE_TRANSITIONS.find(r => r.from === currentPhase);
  return rule?.allowedTransitions ?? [];
}

/**
 * Check if transition is valid
 */
export function isValidTransition(from: IncidentPhase, to: IncidentPhase): boolean {
  return getAllowedTransitions(from).includes(to);
}

/**
 * Generate incident ID in INC-YYYY-NNN format
 */
export function generateIncidentId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INC-${year}-${random}`;
}

/**
 * Format timestamp for display
 */
export function formatIncidentTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}
