/**
 * RBAC Permission Definitions
 * Story 1.5: Role-Based Access Control (RBAC)
 *
 * Defines all system permissions and role mappings.
 * Based on Security Deep Dive document.
 */

import { UserRole } from '@prisma/client';

/**
 * System Permission Enum
 * Covers all system operations that require authorization
 */
export enum Permission {
  // Project Management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_ARCHIVE = 'project:archive',

  // Workflow Management
  WORKFLOW_CREATE = 'workflow:create',
  WORKFLOW_READ = 'workflow:read',
  WORKFLOW_EXECUTE = 'workflow:execute',
  WORKFLOW_CANCEL = 'workflow:cancel',

  // Agent Interaction
  AGENT_INVOKE = 'agent:invoke',
  AGENT_CONFIGURE = 'agent:configure',

  // Artifact Management
  ARTIFACT_CREATE = 'artifact:create',
  ARTIFACT_READ = 'artifact:read',
  ARTIFACT_UPDATE = 'artifact:update',
  ARTIFACT_DELETE = 'artifact:delete',
  ARTIFACT_DOWNLOAD = 'artifact:download',
  ARTIFACT_UPLOAD = 'artifact:upload',

  // Team Management
  TEAM_INVITE = 'team:invite',
  TEAM_REMOVE = 'team:remove',
  TEAM_UPDATE_ROLE = 'team:update_role',

  // Evidence Locker
  EVIDENCE_UPLOAD = 'evidence:upload',
  EVIDENCE_READ = 'evidence:read',
  EVIDENCE_DELETE = 'evidence:delete',
  EVIDENCE_VERIFY = 'evidence:verify',

  // Audit Logs
  AUDIT_READ = 'audit:read',
  AUDIT_EXPORT = 'audit:export',

  // System Administration
  USER_MANAGE = 'user:manage',
  USER_IMPERSONATE = 'user:impersonate',
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_MONITOR = 'system:monitor',

  // Security
  SECURITY_SCAN = 'security:scan',
  SECURITY_REPORT = 'security:report',

  // Template Management (Epic 7)
  TEMPLATE_CREATE = 'template:create',
  TEMPLATE_READ = 'template:read',
  TEMPLATE_UPDATE = 'template:update',
  TEMPLATE_DELETE = 'template:delete',
  TEMPLATE_CUSTOMIZE = 'template:customize', // Custom template creation (Enterprise only)
}

/**
 * Role Hierarchy Levels
 * Higher numbers indicate more privileges
 */
export const ROLE_HIERARCHY_LEVELS: Record<UserRole, number> = {
  SUPERADMIN: 100,
  ADMIN: 75,
  DEVELOPER: 60,
  USER: 50,
  READONLY: 25,
  API: 50, // API is separate from hierarchy, has specific permissions
} as const;

/**
 * Role Permissions Mapping
 * Each role has a set of permissions associated with it
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPERADMIN: Object.values(Permission), // All permissions

  ADMIN: Object.values(Permission).filter(
    (p) => p !== Permission.USER_IMPERSONATE
  ),

  // Enterprise template customization is available to SUPERADMIN and ADMIN
  // TEMPLATE_CUSTOMIZE is included in the full permission list above

  DEVELOPER: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_ARCHIVE,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_READ,
    Permission.WORKFLOW_EXECUTE,
    Permission.WORKFLOW_CANCEL,
    Permission.AGENT_INVOKE,
    Permission.AGENT_CONFIGURE,
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_UPDATE,
    Permission.ARTIFACT_DOWNLOAD,
    Permission.ARTIFACT_UPLOAD,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.TEMPLATE_READ,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_UPDATE,
    Permission.SECURITY_SCAN,
    Permission.SECURITY_REPORT,
  ],

  USER: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_READ,
    Permission.WORKFLOW_EXECUTE,
    Permission.AGENT_INVOKE,
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_DOWNLOAD,
    Permission.ARTIFACT_UPLOAD,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.TEAM_INVITE,
    Permission.TEMPLATE_READ, // Users can read/use templates
  ],

  READONLY: [
    Permission.PROJECT_READ,
    Permission.WORKFLOW_READ,
    Permission.ARTIFACT_READ,
    Permission.EVIDENCE_READ,
    Permission.TEMPLATE_READ,
  ],

  API: [
    Permission.PROJECT_READ,
    Permission.WORKFLOW_EXECUTE,
    Permission.AGENT_INVOKE,
    Permission.ARTIFACT_READ,
    Permission.TEMPLATE_READ,
    // Rate-limited access
  ],
} as const;

/**
 * Permission descriptions for UI display
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.PROJECT_CREATE]: 'Create new projects',
  [Permission.PROJECT_READ]: 'View projects',
  [Permission.PROJECT_UPDATE]: 'Edit project details',
  [Permission.PROJECT_DELETE]: 'Delete projects',
  [Permission.PROJECT_ARCHIVE]: 'Archive projects',
  [Permission.WORKFLOW_CREATE]: 'Create workflows',
  [Permission.WORKFLOW_READ]: 'View workflows',
  [Permission.WORKFLOW_EXECUTE]: 'Execute workflows',
  [Permission.WORKFLOW_CANCEL]: 'Cancel running workflows',
  [Permission.AGENT_INVOKE]: 'Invoke AI agents',
  [Permission.AGENT_CONFIGURE]: 'Configure agent settings',
  [Permission.ARTIFACT_CREATE]: 'Create artifacts',
  [Permission.ARTIFACT_READ]: 'View artifacts',
  [Permission.ARTIFACT_UPDATE]: 'Edit artifacts',
  [Permission.ARTIFACT_DELETE]: 'Delete artifacts',
  [Permission.ARTIFACT_DOWNLOAD]: 'Download artifacts',
  [Permission.ARTIFACT_UPLOAD]: 'Upload artifacts',
  [Permission.TEAM_INVITE]: 'Invite team members',
  [Permission.TEAM_REMOVE]: 'Remove team members',
  [Permission.TEAM_UPDATE_ROLE]: 'Update team member roles',
  [Permission.EVIDENCE_UPLOAD]: 'Upload evidence',
  [Permission.EVIDENCE_READ]: 'View evidence',
  [Permission.EVIDENCE_DELETE]: 'Delete evidence',
  [Permission.EVIDENCE_VERIFY]: 'Verify evidence',
  [Permission.AUDIT_READ]: 'View audit logs',
  [Permission.AUDIT_EXPORT]: 'Export audit logs',
  [Permission.USER_MANAGE]: 'Manage user accounts',
  [Permission.USER_IMPERSONATE]: 'Impersonate other users',
  [Permission.SYSTEM_CONFIG]: 'Modify system configuration',
  [Permission.SYSTEM_MONITOR]: 'View system metrics',
  [Permission.SECURITY_SCAN]: 'Initiate security scans',
  [Permission.SECURITY_REPORT]: 'View security reports',
  [Permission.TEMPLATE_CREATE]: 'Create new templates',
  [Permission.TEMPLATE_READ]: 'View templates',
  [Permission.TEMPLATE_UPDATE]: 'Edit templates',
  [Permission.TEMPLATE_DELETE]: 'Delete templates',
  [Permission.TEMPLATE_CUSTOMIZE]: 'Create custom templates (Enterprise)',
} as const;

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPERADMIN: 'Full system access including user impersonation',
  ADMIN: 'Administrative access without impersonation privileges',
  DEVELOPER: 'Developer access with extended API and configuration capabilities',
  USER: 'Standard user access for daily operations',
  READONLY: 'Read-only access for viewing purposes',
  API: 'Programmatic access with rate limiting',
} as const;

/**
 * Permission categories for grouping in UI
 */
export const PERMISSION_CATEGORIES: Record<string, Permission[]> = {
  PROJECTS: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_ARCHIVE,
  ],
  WORKFLOWS: [
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_READ,
    Permission.WORKFLOW_EXECUTE,
    Permission.WORKFLOW_CANCEL,
  ],
  AGENTS: [
    Permission.AGENT_INVOKE,
    Permission.AGENT_CONFIGURE,
  ],
  ARTIFACTS: [
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_UPDATE,
    Permission.ARTIFACT_DELETE,
    Permission.ARTIFACT_DOWNLOAD,
    Permission.ARTIFACT_UPLOAD,
  ],
  TEAM: [
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_UPDATE_ROLE,
  ],
  EVIDENCE: [
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_DELETE,
    Permission.EVIDENCE_VERIFY,
  ],
  AUDIT: [
    Permission.AUDIT_READ,
    Permission.AUDIT_EXPORT,
  ],
  SYSTEM: [
    Permission.USER_MANAGE,
    Permission.USER_IMPERSONATE,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITOR,
  ],
  SECURITY: [
    Permission.SECURITY_SCAN,
    Permission.SECURITY_REPORT,
  ],
  TEMPLATES: [
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_READ,
    Permission.TEMPLATE_UPDATE,
    Permission.TEMPLATE_DELETE,
    Permission.TEMPLATE_CUSTOMIZE,
  ],
};
