/**
 * Project Detail API Route
 * Epic 6: Project Management System
 * Story 6.2: Project CRUD API
 *
 * GET    /api/projects/[id] - Get project details
 * PATCH  /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete/archive project
 *
 * Security:
 * - Authentication required
 * - Only members can view
 * - Only owners/leads can update
 * - Only owners can delete
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { updateProjectSchema, updateIncidentProjectSchema, updatePentestProjectSchema } from '@/lib/projects/validation';
import type { ProjectType } from '@/lib/types/projects';
import { safeJsonParse, safeJsonArrayParse } from '@/lib/utils/json-parse';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/[id]
 * Get project details
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Get project with user membership check
    const project = await prisma.project.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
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
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        artifacts: {
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
        deliverables: {
          orderBy: { dueDate: 'asc' },
          take: 10,
        },
        findings: {
          orderBy: { severity: 'desc' },
          take: 20,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedProject = {
      ...project,
      projectType: project.projectType.toLowerCase().replace('_', '-') as ProjectType,
      status: project.status.toLowerCase().replace('_', '_') as any,
      phase: project.phase.toLowerCase() as any,
      assessmentType: project.assessmentType?.toLowerCase().replace('_', '_') as any | undefined,
      incidentSeverity: project.incidentSeverity?.toLowerCase() as any | undefined,
      // Parse JSON fields safely
      scope: safeJsonParse(project.scope, undefined),
      phaseProgress: safeJsonParse(project.phaseProgress, undefined),
      cvssBreakdown: project.findings.map(f =>
        safeJsonParse(f.cvssBreakdown, undefined)
      ),
    };

    return NextResponse.json({ project: formattedProject });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Check user permission (must be owner or lead)
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (membership.role !== 'OWNER' && membership.role !== 'LEAD') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get project to determine type-specific validation
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate based on project type
    let validationResult;
    if (existingProject.projectType === 'INCIDENT_RESPONSE') {
      validationResult = updateIncidentProjectSchema.safeParse(body);
    } else if (existingProject.projectType === 'SECURITY_ASSESSMENT') {
      validationResult = updatePentestProjectSchema.safeParse(body);
    } else {
      validationResult = updateProjectSchema.safeParse(body);
    }

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data as any;

    // Build update data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase().replace('-', '_');
    if (data.phase !== undefined) updateData.phase = data.phase.toUpperCase();
    if (data.completionPercent !== undefined) updateData.completionPercent = data.completionPercent;
    if (data.targetEndDate !== undefined) updateData.targetEndDate = data.targetEndDate;
    if (data.actualEndDate !== undefined) updateData.actualEndDate = data.actualEndDate;

    // Incident-specific updates
    if (existingProject.projectType === 'INCIDENT_RESPONSE') {
      if (data.phase !== undefined) updateData.phase = data.phase.toUpperCase();
      if (data.severity !== undefined) updateData.incidentSeverity = data.severity.toUpperCase();
      if (data.affectedSystems !== undefined) updateData.affectedSystems = data.affectedSystems;
      if (data.containedSystems !== undefined) updateData.containedSystems = data.containedSystems;
    }

    // Pentest-specific updates
    if (existingProject.projectType === 'SECURITY_ASSESSMENT') {
      if (data.weekNumber !== undefined) updateData.weekNumber = data.weekNumber;
      if (data.scope !== undefined) updateData.scope = JSON.stringify(data.scope);
      if (data.phaseProgress !== undefined) updateData.phaseProgress = JSON.stringify(data.phaseProgress);
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
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
      },
    });

    // Format response
    const formattedProject = {
      ...updatedProject,
      projectType: updatedProject.projectType.toLowerCase().replace('_', '-') as ProjectType,
      status: updatedProject.status.toLowerCase().replace('_', '_') as any,
      phase: updatedProject.phase.toLowerCase() as any,
      assessmentType: updatedProject.assessmentType?.toLowerCase().replace('_', '_') as any | undefined,
      incidentSeverity: updatedProject.incidentSeverity?.toLowerCase() as any | undefined,
      scope: safeJsonParse(updatedProject.scope, undefined),
      phaseProgress: safeJsonParse(updatedProject.phaseProgress, undefined),
    };

    return NextResponse.json({ project: formattedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete/archive project
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check user permission (must be owner)
    // First check if user is a member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Then check if user is owner (separate check for security)
    if (membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only project owners can delete projects' },
        { status: 403 }
      );
    }

    // Soft delete by archiving
    const archivedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: archivedProject.id,
        projectCode: archivedProject.projectCode,
        status: 'archived',
      },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
