/**
 * Project Management System Types
 * Epic 6: Project Management System
 * Stories 6.1-6.7
 */

/**
 * Project type enumeration
 */
export type ProjectType =
  | 'security-assessment'
  | 'incident-response'
  | 'investigation'
  | 'advisory'
  | 'compliance'
  | 'training';

/**
 * Project status enumeration
 */
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'archived';

/**
 * Project phase enumeration
 */
export type ProjectPhase =
  | 'initiation'
  | 'discovery'
  | 'analysis'
  | 'remediation'
  | 'reporting'
  | 'review'
  | 'closed';

/**
 * Project member role enumeration
 */
export type MemberRole = 'owner' | 'lead' | 'member' | 'viewer';

/**
 * Assessment type for security assessment projects
 */
export type AssessmentType =
  | 'penetration-test'
  | 'vulnerability-scan'
  | 'red-team'
  | 'blue-team';

/**
 * Finding severity enumeration
 */
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Finding status enumeration
 */
export type FindingStatus =
  | 'pending'
  | 'fixing'
  | 'testing'
  | 'verified'
  | 'false-positive'
  | 'risk-accepted';

/**
 * Pentest phase enumeration
 */
export type PentestPhase =
  | 'reconnaissance'
  | 'enumeration'
  | 'exploitation'
  | 'post-exploitation'
  | 'reporting';

/**
 * Deliverable status enumeration
 */
export type DeliverableStatus =
  | 'pending'
  | 'in-progress'
  | 'review'
  | 'complete'
  | 'cancelled';

/**
 * Artifact type enumeration
 */
export type ArtifactType =
  | 'finding'
  | 'evidence'
  | 'report'
  | 'screenshot'
  | 'log'
  | 'code'
  | 'config'
  | 'other';

/**
 * Incident severity enumeration (Story 6.6)
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Incident phase enumeration (NIST framework - Story 6.6)
 */
export type IncidentPhase =
  | 'identification'
  | 'containment'
  | 'eradication'
  | 'recovery'
  | 'closed';

/**
 * Project scope definition
 */
export interface ProjectScope {
  inScope: string[];
  outOfScope: string[];
  exclusions: string[];
}

/**
 * Phase progress tracking
 */
export interface PhaseProgress {
  name: PentestPhase;
  status: 'not-started' | 'in-progress' | 'complete';
  progress: number; // 0-100
}

/**
 * CVSS breakdown
 */
export interface CVSSBreakdown {
  attackVector: 'network' | 'adjacent' | 'local' | 'physical';
  attackComplexity: 'low' | 'high';
  privilegesRequired: 'none' | 'low' | 'high';
  userInteraction: 'none' | 'required';
  scope: 'unchanged' | 'changed';
  confidentiality: 'high' | 'low' | 'none';
  integrity: 'high' | 'low' | 'none';
  availability: 'high' | 'low' | 'none';
}

/**
 * Finding history entry
 */
export interface FindingHistoryEntry {
  id: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: Date;
  notes?: string;
}

/**
 * Base project interface
 */
export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  phase: ProjectPhase;
  completionPercent: number;
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project member interface
 */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  lastSeenAt?: Date;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

/**
 * Workflow interface
 */
export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  agentId?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Artifact interface
 */
export interface Artifact {
  id: string;
  projectId: string;
  name: string;
  type: ArtifactType;
  description?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  sha256Hash?: string;
  uploadedById?: string;
  uploadedAt: Date;
}

/**
 * Deliverable interface
 */
export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: DeliverableStatus;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Incident response project (Story 6.6)
 */
export interface IncidentProject extends Project {
  projectType: 'incident-response';
  incidentId: string;
  incidentSeverity: IncidentSeverity;
  affectedSystems: number;
  containedSystems: number;
}

/**
 * Pentest project (Story 6.7)
 */
export interface PentestProject extends Project {
  projectType: 'security-assessment';
  assessmentType: AssessmentType;
  pentestId: string;
  weekNumber?: number;
  scope: ProjectScope;
  phaseProgress: PhaseProgress[];
}

/**
 * Finding interface (Story 6.7)
 */
export interface Finding {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  cvssScore?: number;
  cvssVector?: string;
  cvssBreakdown?: CVSSBreakdown;
  affectedSystems?: string[];
  owaspCategory?: string;
  cweId?: string;
  remediation?: string;
  assignee?: string;
  discoveredAt: Date;
  discoveredBy?: string;
  phase?: PentestPhase;
  history?: FindingHistoryEntry[];
}

/**
 * Timeline event interface (Story 6.6)
 */
export interface TimelineEvent {
  id: string;
  projectId: string;
  phase: IncidentPhase;
  title: string;
  description?: string;
  severity?: IncidentSeverity;
  contributor?: string;
  createdAt: Date;
}

/**
 * Severity color mapping for UI
 */
export const SEVERITY_COLORS: Record<FindingSeverity | IncidentSeverity, string> = {
  critical: 'rgb(220, 38, 38)',   // red-600
  high: 'rgb(249, 115, 22)',      // orange-500
  medium: 'rgb(234, 179, 8)',     // yellow-500
  low: 'rgb(59, 130, 246)',       // blue-500
  info: 'rgb(107, 114, 128)',     // gray-500
};

/**
 * Status badge colors
 */
export const STATUS_COLORS: Record<FindingStatus, string> = {
  pending: 'rgb(107, 114, 128)',       // gray
  fixing: 'rgb(249, 115, 22)',         // orange
  testing: 'rgb(234, 179, 8)',         // yellow
  verified: 'rgb(34, 197, 94)',        // green
  'false-positive': 'rgb(168, 85, 247)', // purple
  'risk-accepted': 'rgb(236, 72, 153)',   // pink
};

/**
 * Pentest phase configuration
 */
export const PENTEST_PHASES: Record<PentestPhase, {
  name: string;
  description: string;
  order: number;
}> = {
  reconnaissance: {
    name: 'Reconnaissance',
    description: 'Information gathering and target identification',
    order: 1,
  },
  enumeration: {
    name: 'Enumeration',
    description: 'Detailed target analysis and vulnerability scanning',
    order: 2,
  },
  exploitation: {
    name: 'Exploitation',
    description: 'Active testing and exploitation attempts',
    order: 3,
  },
  'post-exploitation': {
    name: 'Post-Exploitation',
    description: 'Lateral movement and privilege escalation',
    order: 4,
  },
  reporting: {
    name: 'Reporting',
    description: 'Documentation and report generation',
    order: 5,
  },
};

/**
 * Project type configuration
 */
export const PROJECT_TYPE_CONFIG: Record<ProjectType, {
  name: string;
  icon: string;
  description: string;
}> = {
  'security-assessment': {
    name: 'Security Assessment',
    icon: 'shield',
    description: 'Penetration testing, vulnerability scans, and security audits',
  },
  'incident-response': {
    name: 'Incident Response',
    icon: 'alert-triangle',
    description: 'Emergency response and breach investigation',
  },
  investigation: {
    name: 'Investigation',
    icon: 'search',
    description: 'Digital forensics and investigative services',
  },
  advisory: {
    name: 'Advisory',
    icon: 'lightbulb',
    description: 'Strategic guidance and consulting',
  },
  compliance: {
    name: 'Compliance',
    icon: 'clipboard-check',
    description: 'Regulatory compliance audits and assessments',
  },
  training: {
    name: 'Training',
    icon: 'graduation-cap',
    description: 'Security training and awareness programs',
  },
};

/**
 * Generate project code
 */
export function generateProjectCode(type: ProjectType): string {
  const year = new Date().getFullYear();
  const prefix = type === 'security-assessment' ? 'AS' :
                 type === 'incident-response' ? 'IR' :
                 type === 'investigation' ? 'INV' :
                 type === 'advisory' ? 'ADV' :
                 type === 'compliance' ? 'COMP' : 'TRN';
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}

/**
 * Generate pentest ID
 */
export function generatePentestId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PT-${year}-${random}`;
}

/**
 * Generate incident ID
 */
export function generateIncidentId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INC-${year}-${random}`;
}

/**
 * Calculate CVSS score from vector
 * This is a simplified calculation - use cvss.js for full implementation
 */
export function calculateCVSSScore(vector: string): number {
  // Simplified CVSS v3.1 calculator
  // In production, use a proper CVSS library
  const metrics = vector.split('/').reduce((acc, part) => {
    const [key, value] = part.split(':');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  let score = 0.0;

  // Attack Vector
  const avScore: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  score += (avScore[metrics.AV] || 0) * 10;

  // Attack Complexity
  const acScore: Record<string, number> = { L: 0.77, H: 0.44 };
  score *= acScore[metrics.AC] || 0.77;

  // Privileges Required
  const prScore: Record<string, number> = { N: 0.85, L: 0.68, H: 0.5 };
  score *= prScore[metrics.PR] || 0.85;

  // User Interaction
  const uiScore: Record<string, number> = { N: 0.85, R: 0.62 };
  score *= uiScore[metrics.UI] || 0.85;

  // Scope
  const scopeChanged = metrics.S === 'C';

  // Impact
  const cScore: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };
  const iScore: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };
  const aScore: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };

  const iss = 1 - ((1 - cScore[metrics.C] || 0) *
                    (1 - iScore[metrics.I] || 0) *
                    (1 - aScore[metrics.A] || 0));

  if (scopeChanged) {
    score = Math.min(10, 1.08 * (score + iss));
  } else {
    score = Math.min(10, score + iss);
  }

  return Math.round(score * 10) / 10;
}

/**
 * Get severity from CVSS score
 */
export function getSeverityFromScore(score: number): FindingSeverity {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  if (score > 0) return 'low';
  return 'info';
}

/**
 * Format finding status for display
 */
export function formatFindingStatus(status: FindingStatus): string {
  return status.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Format project type for display
 */
export function formatProjectType(type: ProjectType): string {
  return PROJECT_TYPE_CONFIG[type]?.name || type;
}
