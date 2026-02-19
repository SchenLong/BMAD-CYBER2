/**
 * Project-Level Roles Management
 * Story 1.5: Role-Based Access Control (RBAC) - Task 9
 *
 * Defines project-specific roles and permissions.
 * Full implementation will be added in Story 6.1 (Project Data Model)
 * when the ProjectMember model is created.
 */

import { prisma } from '../prisma';
import { AuthorizationError } from './authorization';
import { Permission } from './permissions';

/**
 * Project Member Roles
 * Users can have different permission levels within specific projects
 */
export enum ProjectMemberRole {
  OWNER = 'OWNER',
  LEAD = 'LEAD',
  CONTRIBUTOR = 'CONTRIBUTOR',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER',
}

/**
 * Project Role Hierarchy Levels
 * Higher numbers indicate more privileges within a project
 */
export const PROJECT_ROLE_HIERARCHY_LEVELS: Record<ProjectMemberRole, number> = {
  OWNER: 100,
  LEAD: 75,
  CONTRIBUTOR: 50,
  REVIEWER: 40,
  VIEWER: 25,
} as const;

/**
 * Project Role Permissions Mapping
 * Each project role has a set of permissions within that project
 */
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectMemberRole, Permission[]> = {
  OWNER: [
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_ARCHIVE,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_EXECUTE,
    Permission.WORKFLOW_CANCEL,
    Permission.AGENT_INVOKE,
    Permission.AGENT_CONFIGURE,
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_UPDATE,
    Permission.ARTIFACT_DELETE,
    Permission.ARTIFACT_DOWNLOAD,
    Permission.ARTIFACT_UPLOAD,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_UPDATE_ROLE,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_DELETE,
    Permission.EVIDENCE_VERIFY,
  ],

  LEAD: [
    Permission.PROJECT_UPDATE,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_EXECUTE,
    Permission.WORKFLOW_CANCEL,
    Permission.AGENT_INVOKE,
    Permission.AGENT_CONFIGURE,
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_UPDATE,
    Permission.ARTIFACT_DOWNLOAD,
    Permission.ARTIFACT_UPLOAD,
    Permission.TEAM_INVITE,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_VERIFY,
  ],

  CONTRIBUTOR: [
    Permission.PROJECT_READ,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_EXECUTE,
    Permission.AGENT_INVOKE,
    Permission.ARTIFACT_CREATE,
    Permission.ARTIFACT_READ,
    Permission.ARTIFACT_UPLOAD,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
  ],

  REVIEWER: [
    Permission.PROJECT_READ,
    Permission.WORKFLOW_READ,
    Permission.ARTIFACT_READ,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_VERIFY,
  ],

  VIEWER: [
    Permission.PROJECT_READ,
    Permission.WORKFLOW_READ,
    Permission.ARTIFACT_READ,
    Permission.EVIDENCE_READ,
  ],
} as const;

// Re-export UserRole for convenience
export type { UserRole } from '@prisma/client';

/**
 * Project member interface
 */
export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectMemberRole;
  addedAt: Date;
  addedBy: string;
}

/**
 * Add a member to a project with a specific role
 * @param projectId - The project ID
 * @param userId - The user ID to add
 * @param role - The project role to assign
 * @param addedBy - The ID of the user performing the action
 * @returns The created project member
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function addProjectMember(
  _projectId: string,
  _userId: string,
  _role: ProjectMemberRole,
  _addedBy: string
): Promise<ProjectMember> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  throw new AuthorizationError(
    'Project membership model not yet created. This will be implemented in Story 6.1 (Project Data Model).',
    'FORBIDDEN'
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Update a project member's role
 * @param projectId - The project ID
 * @param userId - The user ID to update
 * @param newRole - The new project role
 * @param updatedBy - The ID of the user performing the action
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function updateProjectMemberRole(
  _projectId: string,
  _userId: string,
  _newRole: ProjectMemberRole,
  _updatedBy: string
): Promise<void> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  throw new AuthorizationError(
    'Project membership model not yet created. This will be implemented in Story 6.1 (Project Data Model).',
    'FORBIDDEN'
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Remove a member from a project
 * @param projectId - The project ID
 * @param userId - The user ID to remove
 * @param removedBy - The ID of the user performing the action
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function removeProjectMember(
  _projectId: string,
  _userId: string,
  _removedBy: string
): Promise<void> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  throw new AuthorizationError(
    'Project membership model not yet created. This will be implemented in Story 6.1 (Project Data Model).',
    'FORBIDDEN'
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Get a project member's role
 * @param projectId - The project ID
 * @param userId - The user ID
 * @returns The project member or null
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getProjectMember(
  _projectId: string,
  _userId: string
): Promise<ProjectMember | null> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  return null;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Get all members of a project
 * @param projectId - The project ID
 * @returns Array of project members
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getProjectMembers(_projectId: string): Promise<ProjectMember[]> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  return [];
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Get a user's permissions for a specific project
 * Combines system role permissions with project role permissions
 * @param projectId - The project ID
 * @param userId - The user ID
 * @returns Array of permissions the user has for this project
 */
export async function getProjectUserPermissions(
  projectId: string,
  userId: string
): Promise<Permission[]> {
  // Get user's system role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return [];
  }

  // Get user's project role
  const member = await getProjectMember(projectId, userId);

  if (!member) {
    // User is not a member of the project
    // Return only basic read permissions if system role allows
    if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
      return PROJECT_ROLE_PERMISSIONS[ProjectMemberRole.VIEWER];
    }
    return [];
  }

  // Return project role permissions
  return PROJECT_ROLE_PERMISSIONS[member.role];
}

/**
 * Check if a user has a specific permission for a project
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param permission - The permission to check
 * @returns true if the user has the permission
 */
export async function hasProjectPermission(
  projectId: string,
  userId: string,
  permission: Permission
): Promise<boolean> {
  const permissions = await getProjectUserPermissions(projectId, userId);
  return permissions.includes(permission);
}

/**
 * Get all projects for a user with their roles
 * @param userId - The user ID
 * @returns Array of projects with user's role
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getUserProjects(_userId: string): Promise<Array<{ projectId: string; role: ProjectMemberRole }>> {
  // Note: This will use the ProjectMember model when it's created in Story 6.1
  return [];
}
/* eslint-enable @typescript-eslint/no-unused-vars */
