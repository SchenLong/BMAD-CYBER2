/**
 * Findings API Route
 * Epic 6: Project Management System
 * Story 6.7: Penetration Test Tracker
 *
 * GET    /api/projects/[id]/findings - List findings for a project
 * POST   /api/projects/[id]/findings - Create a new finding
 *
 * Security:
 * - Authentication required
 * - Only project members can view
 * - Only project members can create findings
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  createFindingSchema,
  findingListQuerySchema,
} from '@/lib/projects/validation';
import { safeJsonParse, safeJsonArrayParse } from '@/lib/utils/json-parse';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/[id]/findings
 * List findings for a project
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = findingListQuerySchema.safeParse(Object.fromEntries(searchParams));

    const filters = queryResult.success ? queryResult.data : {};

    // Build where clause
    const where: any = { projectId: id };

    if (filters.severity) {
      where.severity = filters.severity.toUpperCase();
    }

    if (filters.status) {
      where.status = filters.status.toUpperCase().replace('-', '_');
    }

    if (filters.assignee) {
      where.assignee = filters.assignee;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get findings with history count
    const findings = await prisma.finding.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { discoveredAt: 'desc' },
      ],
    });

    // Get history count for each finding
    const findingIds = findings.map(f => f.id);
    const historyCounts = await prisma.findingHistory.groupBy({
      by: ['findingId'],
      where: { findingId: { in: findingIds } },
      _count: true,
    });

    const historyCountMap = Object.fromEntries(
      historyCounts.map(h => [h.findingId, h._count])
    );

    // Format response
    const formattedFindings = findings.map((finding) => ({
      ...finding,
      severity: finding.severity.toLowerCase() as any,
      status: finding.status.toLowerCase().replace('_', '-') as any,
      phase: finding.phase?.toLowerCase() as any | undefined,
      cvssBreakdown: safeJsonParse(finding.cvssBreakdown, undefined),
      affectedSystems: safeJsonArrayParse<string>(finding.affectedSystems),
      _count: {
        history: historyCountMap[finding.id] || 0,
      },
    }));

    return NextResponse.json({ findings: formattedFindings });
  } catch (error) {
    console.error('Error fetching findings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/findings
 * Create a new finding
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id: projectId } = await context.params;
    const body = await request.json();

    // Check if user is a project member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Validate request body
    const validationResult = createFindingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create finding
    const finding = await prisma.finding.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        severity: data.severity.toUpperCase() as any,
        cvssScore: data.cvssScore,
        cvssVector: data.cvssVector,
        cvssBreakdown: data.cvssBreakdown ? JSON.stringify(data.cvssBreakdown) : null,
        affectedSystems: data.affectedSystems && data.affectedSystems.length > 0
          ? JSON.stringify(data.affectedSystems)
          : null,
        owaspCategory: data.owaspCategory,
        cweId: data.cweId,
        remediation: data.remediation,
        assignee: data.assignee,
        phase: data.phase ? data.phase.toUpperCase().replace('-', '_') as any : null,
        discoveredBy: session.user.id,
      },
    });

    // Create history entry for creation
    await prisma.findingHistory.create({
      data: {
        findingId: finding.id,
        field: 'created',
        newValue: 'Finding created',
        changedBy: session.user.id,
        notes: `Initial severity: ${data.severity.toUpperCase()}`,
      },
    });

    // Format response
    const formattedFinding = {
      ...finding,
      severity: finding.severity.toLowerCase() as any,
      status: finding.status.toLowerCase().replace('_', '-') as any,
      phase: finding.phase?.toLowerCase() as any | undefined,
      cvssBreakdown: safeJsonParse(finding.cvssBreakdown, undefined),
      affectedSystems: safeJsonArrayParse<string>(finding.affectedSystems),
      _count: {
        history: 1, // We just created one history entry
      },
    };

    return NextResponse.json({ finding: formattedFinding }, { status: 201 });
  } catch (error) {
    console.error('Error creating finding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
