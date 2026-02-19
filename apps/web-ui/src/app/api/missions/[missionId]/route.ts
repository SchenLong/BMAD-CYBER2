/**
 * GET /api/missions/[missionId]
 * Gets a single mission (project) by ID
 *
 * PATCH /api/missions/[missionId]
 * Updates a mission
 *
 * DELETE /api/missions/[missionId]
 * Deletes/archives a mission
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiMiddleware } from '@/lib/api/middleware';

async function getHandler(
  request: NextRequest,
  context: { user?: { userId: string } } & { params?: { missionId: string } }
) {
  try {
    const missionId = context.params?.missionId;
    const userId = context.user?.userId;

    if (!missionId) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Mission ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is a member of this project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: missionId,
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have access to this mission',
        },
        { status: 403 }
      );
    }

    const mission = await prisma.project.findUnique({
      where: { id: missionId },
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
        artifacts: {
          take: 20,
          orderBy: { uploadedAt: 'desc' },
        },
        findings: {
          take: 50,
          orderBy: { severity: 'desc' },
        },
        workflows: {
          orderBy: { createdAt: 'desc' },
        },
        deliverables: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!mission) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Mission not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: mission.id,
      projectCode: mission.projectCode,
      name: mission.name,
      description: mission.description,
      type: mission.projectType.toLowerCase(),
      status: mission.status.toLowerCase(),
      phase: mission.phase.toLowerCase(),
      completionPercent: mission.completionPercent,
      startDate: mission.startDate,
      targetEndDate: mission.targetEndDate,
      actualEndDate: mission.actualEndDate,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
      members: mission.members.map(m => ({
        id: m.id,
        role: m.role.toLowerCase(),
        joinedAt: m.joinedAt,
        lastSeenAt: m.lastSeenAt,
        user: m.user,
      })),
      artifacts: mission.artifacts,
      findings: mission.findings,
      workflows: mission.workflows,
      deliverables: mission.deliverables,
    });
  } catch (error) {
    console.error('Get mission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch mission',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiMiddleware(getHandler, { requireAuth: true });

async function patchHandler(
  request: NextRequest,
  context: { user?: { userId: string } } & { params?: { missionId: string } }
) {
  try {
    const missionId = context.params?.missionId;
    const userId = context.user?.userId;

    if (!missionId) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Mission ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is an owner or lead
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: missionId,
        userId: userId,
        role: { in: ['OWNER', 'LEAD'] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to update this mission',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, status, phase, completionPercent, targetEndDate } = body;

    // Build update object
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 3 || name.length > 200) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Name must be between 3 and 200 characters',
          },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (status !== undefined) {
      const validStatuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid status',
          },
          { status: 400 }
        );
      }
      updateData.status = status.toUpperCase();
    }

    if (phase !== undefined) {
      const validPhases = ['INITIATION', 'DISCOVERY', 'ANALYSIS', 'REMEDIATION', 'REPORTING', 'REVIEW', 'CLOSED'];
      if (!validPhases.includes(phase.toUpperCase())) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid phase',
          },
          { status: 400 }
        );
      }
      updateData.phase = phase.toUpperCase();
    }

    if (completionPercent !== undefined) {
      if (typeof completionPercent !== 'number' || completionPercent < 0 || completionPercent > 100) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Completion percent must be between 0 and 100',
          },
          { status: 400 }
        );
      }
      updateData.completionPercent = completionPercent;
    }

    if (targetEndDate !== undefined) {
      updateData.targetEndDate = targetEndDate ? new Date(targetEndDate) : null;
    }

    // Update mission
    const mission = await prisma.project.update({
      where: { id: missionId },
      data: updateData,
    });

    return NextResponse.json({
      id: mission.id,
      projectCode: mission.projectCode,
      name: mission.name,
      description: mission.description,
      status: mission.status.toLowerCase(),
      phase: mission.phase.toLowerCase(),
      completionPercent: mission.completionPercent,
      targetEndDate: mission.targetEndDate,
      updatedAt: mission.updatedAt,
    });
  } catch (error) {
    console.error('Update mission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update mission',
      },
      { status: 500 }
    );
  }
}

export const PATCH = withApiMiddleware(patchHandler, { requireAuth: true });

async function deleteHandler(
  request: NextRequest,
  context: { user?: { userId: string } } & { params?: { missionId: string } }
) {
  try {
    const missionId = context.params?.missionId;
    const userId = context.user?.userId;

    if (!missionId) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Mission ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is an owner
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: missionId,
        userId: userId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only mission owners can delete missions',
        },
        { status: 403 }
      );
    }

    // Archive instead of delete (soft delete)
    await prisma.project.update({
      where: { id: missionId },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      message: 'Mission archived successfully',
    });
  } catch (error) {
    console.error('Delete mission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete mission',
      },
      { status: 500 }
    );
  }
}

export const DELETE = withApiMiddleware(deleteHandler, { requireAuth: true });
