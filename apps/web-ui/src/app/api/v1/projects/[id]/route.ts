/**
 * Project Details API - v1
 * Story 8.1: RESTful API Implementation
 * Task 5: Project Endpoints
 *
 * GET /api/v1/projects/:id - Get project details
 * PUT /api/v1/projects/:id - Update project
 * DELETE /api/v1/projects/:id - Delete project (soft delete)
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiForbidden,
  apiValidationError,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { updateProjectSchema } from '@/lib/projects/validation';

/**
 * GET /api/v1/projects/:id
 * Get detailed project information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const { id: projectId } = await params;

  // Check if user is a member of the project
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    return apiForbidden('You do not have access to this project');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      workflows: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      artifacts: {
        select: {
          id: true,
          name: true,
          fileSize: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!project) {
    return apiNotFound('Project');
  }

  // Get counts separately
  const [memberCount, workflowCount, artifactCount, deliverableCount] = await Promise.all([
    prisma.projectMember.count({ where: { projectId } }),
    prisma.workflow.count({ where: { projectId } }),
    prisma.artifact.count({ where: { projectId } }),
    prisma.deliverable.count({ where: { projectId } }),
  ]);

  // Format response
  const formattedProject = {
    id: project.id,
    projectCode: project.projectCode,
    name: project.name,
    description: project.description,
    projectType: project.projectType.toLowerCase().replace('_', '_') as string,
    status: project.status.toLowerCase().replace('_', '_') as string,
    phase: project.phase.toLowerCase() as string,
    completionPercent: project.completionPercent,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    members: project.members,
    workflows: project.workflows,
    artifacts: project.artifacts,
    counts: {
      members: memberCount,
      workflows: workflowCount,
      artifacts: artifactCount,
      deliverables: deliverableCount,
    },
    permissions: {
      canEdit: membership.role === 'OWNER' || membership.role === 'LEAD',
      canDelete: membership.role === 'OWNER',
    },
  };

  return apiSuccess(formattedProject);
}

/**
 * PUT /api/v1/projects/:id
 * Update project details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const { id: projectId } = await params;

  // Check if user is owner or lead
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
    },
  });

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'LEAD')) {
    return apiForbidden('Only project owners and leads can update projects');
  }

  const body = await request.json();

  // Validate request body
  const validationResult = updateProjectSchema.safeParse(body);

  if (!validationResult.success) {
    return apiValidationError('Invalid input', {
      issues: validationResult.error.issues,
    });
  }

  const data = validationResult.data;

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && {
        status: data.status.toUpperCase().replace('-', '_') as any,
      }),
      ...(data.phase !== undefined && {
        phase: data.phase.toUpperCase() as any,
      }),
      ...(data.completionPercent !== undefined && {
        completionPercent: data.completionPercent,
      }),
      ...(data.targetEndDate !== undefined && {
        targetEndDate: data.targetEndDate,
      }),
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Format response
  const formattedProject = {
    id: updatedProject.id,
    projectCode: updatedProject.projectCode,
    name: updatedProject.name,
    description: updatedProject.description,
    projectType: updatedProject.projectType.toLowerCase().replace('_', '_') as string,
    status: updatedProject.status.toLowerCase().replace('_', '_') as string,
    phase: updatedProject.phase.toLowerCase() as string,
    completionPercent: updatedProject.completionPercent,
    startDate: updatedProject.startDate,
    targetEndDate: updatedProject.targetEndDate,
    createdAt: updatedProject.createdAt,
    updatedAt: updatedProject.updatedAt,
    members: updatedProject.members,
  };

  return apiSuccess(formattedProject);
}

/**
 * DELETE /api/v1/projects/:id
 * Soft delete a project (archive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const { id: projectId } = await params;

  // Check if user is owner
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
      role: 'OWNER',
    },
  });

  if (!membership) {
    return apiForbidden('Only project owners can delete projects');
  }

  // Soft delete by setting status to archived
  const deletedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'ARCHIVED',
    },
  });

  return apiSuccess({
    id: deletedProject.id,
    projectCode: deletedProject.projectCode,
    message: 'Project archived successfully',
  });
}
