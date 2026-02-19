/**
 * Finding Detail API Route
 * Epic 6: Project Management System
 * Story 6.7: Penetration Test Tracker
 *
 * GET    /api/projects/[id]/findings/[findingId] - Get finding details
 * PATCH  /api/projects/[id]/findings/[findingId] - Update finding
 * DELETE /api/projects/[id]/findings/[findingId] - Delete finding
 *
 * Security:
 * - Authentication required
 * - Only project members can view
 * - Only project members can update/delete
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  updateFindingSchema,
  updateFindingStatusSchema,
} from '@/lib/projects/validation';
import { safeJsonParse, safeJsonArrayParse } from '@/lib/utils/json-parse';

type RouteContext = {
  params: Promise<{ id: string; findingId: string }>;
};

/**
 * GET /api/projects/[id]/findings/[findingId]
 * Get finding details with history
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

    const { id, findingId } = await context.params;

    // Check if user is a project member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get finding
    const finding = await prisma.finding.findFirst({
      where: {
        id: findingId,
        projectId: id,
      },
    });

    if (!finding) {
      return NextResponse.json(
        { error: 'Finding not found' },
        { status: 404 }
      );
    }

    // Get history separately
    const history = await prisma.findingHistory.findMany({
      where: { findingId },
      orderBy: { changedAt: 'desc' },
    });

    // Format response
    const formattedFinding = {
      ...finding,
      severity: finding.severity.toLowerCase() as any,
      status: finding.status.toLowerCase().replace('_', '-') as any,
      phase: finding.phase?.toLowerCase() as any | undefined,
      cvssBreakdown: safeJsonParse(finding.cvssBreakdown, undefined),
      affectedSystems: safeJsonArrayParse<string>(finding.affectedSystems),
      history,
    };

    return NextResponse.json({ finding: formattedFinding });
  } catch (error) {
    console.error('Error fetching finding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]/findings/[findingId]
 * Update finding
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

    const { id, findingId } = await context.params;
    const body = await request.json();

    // Check if user is a project member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // VIEWERs cannot update findings
    if (membership.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Viewers cannot update findings.' },
        { status: 403 }
      );
    }

    // Get existing finding
    const existingFinding = await prisma.finding.findFirst({
      where: {
        id: findingId,
        projectId: id,
      },
    });

    if (!existingFinding) {
      return NextResponse.json(
        { error: 'Finding not found' },
        { status: 404 }
      );
    }

    // Check if this is a status-only update
    const isStatusUpdate = Object.keys(body).length === 1 && 'status' in body;

    let validationResult;
    if (isStatusUpdate) {
      validationResult = updateFindingStatusSchema.safeParse(body);
    } else {
      validationResult = updateFindingSchema.safeParse(body);
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
    const historyEntries: Array<{ field: string; oldValue?: string; newValue: string; notes?: string }> = [];

    if (data.title !== undefined) {
      updateData.title = data.title;
      if (data.title !== existingFinding.title) {
        historyEntries.push({
          field: 'title',
          oldValue: existingFinding.title,
          newValue: data.title,
        });
      }
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.severity !== undefined) {
      updateData.severity = data.severity.toUpperCase();
      if (data.severity !== existingFinding.severity.toLowerCase()) {
        historyEntries.push({
          field: 'severity',
          oldValue: existingFinding.severity,
          newValue: data.severity.toUpperCase(),
        });
      }
    }

    if (data.status !== undefined) {
      const newStatus = data.status.toUpperCase().replace('-', '_');
      updateData.status = newStatus;
      historyEntries.push({
        field: 'status',
        oldValue: existingFinding.status,
        newValue: newStatus,
        notes: data.notes,
      });
    }

    if (data.cvssScore !== undefined) {
      updateData.cvssScore = data.cvssScore;
    }

    if (data.cvssVector !== undefined) {
      updateData.cvssVector = data.cvssVector;
    }

    if (data.cvssBreakdown !== undefined) {
      updateData.cvssBreakdown = JSON.stringify(data.cvssBreakdown);
    }

    if (data.affectedSystems !== undefined) {
      updateData.affectedSystems = JSON.stringify(data.affectedSystems);
    }

    if (data.owaspCategory !== undefined) {
      updateData.owaspCategory = data.owaspCategory;
    }

    if (data.cweId !== undefined) {
      updateData.cweId = data.cweId;
    }

    if (data.remediation !== undefined) {
      updateData.remediation = data.remediation;
    }

    if (data.assignee !== undefined) {
      updateData.assignee = data.assignee;
      if (data.assignee !== existingFinding.assignee) {
        historyEntries.push({
          field: 'assignee',
          oldValue: existingFinding.assignee || 'unassigned',
          newValue: data.assignee || 'unassigned',
        });
      }
    }

    // Update finding
    const updatedFinding = await prisma.finding.update({
      where: { id: findingId },
      data: updateData,
    });

    // Create history entries
    if (historyEntries.length > 0) {
      await prisma.findingHistory.createMany({
        data: historyEntries.map((entry) => ({
          findingId,
          field: entry.field,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          changedBy: session.user.id,
          notes: entry.notes,
        })),
      });
    }

    // Format response
    const formattedFinding = {
      ...updatedFinding,
      severity: updatedFinding.severity.toLowerCase() as any,
      status: updatedFinding.status.toLowerCase().replace('_', '-') as any,
      phase: updatedFinding.phase?.toLowerCase() as any | undefined,
      cvssBreakdown: safeJsonParse(updatedFinding.cvssBreakdown, undefined),
      affectedSystems: safeJsonArrayParse<string>(updatedFinding.affectedSystems),
    };

    return NextResponse.json({ finding: formattedFinding });
  } catch (error) {
    console.error('Error updating finding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/findings/[findingId]
 * Delete finding
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

    const { id, findingId } = await context.params;

    // Check if user is a project member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only OWNER and LEAD can delete findings
    if (membership.role !== 'OWNER' && membership.role !== 'LEAD') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only Owners and Leads can delete findings.' },
        { status: 403 }
      );
    }

    // Delete finding (cascade will delete history)
    await prisma.finding.deleteMany({
      where: {
        id: findingId,
        projectId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting finding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
