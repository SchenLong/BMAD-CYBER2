/**
 * GET /api/missions
 * Lists all missions (projects) for the current user
 *
 * POST /api/missions
 * Creates a new mission (project)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiMiddleware } from '@/lib/api/middleware';

// Mission types mapped from Project (whitelist for validation)
const VALID_MISSION_TYPES = ['SECURITY_ASSESSMENT', 'INCIDENT_RESPONSE', 'INVESTIGATION', 'ADVISORY', 'COMPLIANCE', 'TRAINING'] as const;
type ValidMissionType = typeof VALID_MISSION_TYPES[number];

const MISSION_TYPE_MAP: Record<string, string> = {
  SECURITY_ASSESSMENT: 'security-assessment',
  INCIDENT_RESPONSE: 'incident-response',
  INVESTIGATION: 'investigation',
  ADVISORY: 'advisory',
  COMPLIANCE: 'compliance',
  TRAINING: 'training',
};

const STATUS_MAP: Record<string, string> = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

/**
 * Validate Content-Type for API requests
 */
function validateContentType(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

/**
 * Validate and map mission type from client format to Prisma enum
 */
function validateMissionType(type: string): ValidMissionType {
  const typeMap: Record<string, ValidMissionType> = {
    'security-assessment': 'SECURITY_ASSESSMENT',
    'incident-response': 'INCIDENT_RESPONSE',
    'investigation': 'INVESTIGATION',
    'advisory': 'ADVISORY',
    'compliance': 'COMPLIANCE',
    'training': 'TRAINING',
  };

  const normalizedType = type?.toLowerCase().replace('_', '-');
  const mappedType = typeMap[normalizedType];

  if (!mappedType || !VALID_MISSION_TYPES.includes(mappedType)) {
    throw new Error(`Invalid mission type. Must be one of: ${Object.keys(typeMap).join(', ')}`);
  }

  return mappedType;
}

async function getHandler(
  request: NextRequest,
  context: { user?: { userId: string } }
) {
  try {
    const userId = context.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User ID not found',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: any = {
      members: {
        some: {
          userId: userId,
        },
      },
    };

    if (status) {
      const statusValues = status.split(',').map(s => s.toUpperCase().replace('-', '_'));
      where.status = { in: statusValues };
    }

    // Get missions (projects) where user is a member
    const missions = await prisma.project.findMany({
      where,
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
        _count: {
          select: {
            artifacts: true,
            findings: true,
            workflows: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.project.count({ where });

    // Format response
    const formattedMissions = missions.map(mission => ({
      id: mission.id,
      projectCode: mission.projectCode,
      name: mission.name,
      description: mission.description,
      type: MISSION_TYPE_MAP[mission.projectType] || mission.projectType.toLowerCase(),
      status: STATUS_MAP[mission.status] || mission.status.toLowerCase(),
      phase: mission.phase.toLowerCase(),
      completionPercent: mission.completionPercent,
      startDate: mission.startDate,
      targetEndDate: mission.targetEndDate,
      actualEndDate: mission.actualEndDate,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
      memberCount: mission.members.length,
      artifactCount: mission._count.artifacts,
      findingCount: mission._count.findings,
      workflowCount: mission._count.workflows,
      // Incident-specific
      incidentId: mission.incidentId,
      incidentSeverity: mission.incidentSeverity?.toLowerCase(),
      // Pentest-specific
      pentestId: mission.pentestId,
      assessmentType: mission.assessmentType?.toLowerCase(),
    }));

    return NextResponse.json({
      missions: formattedMissions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get missions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch missions',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiMiddleware(getHandler, { requireAuth: true });

async function postHandler(
  request: NextRequest,
  context: { user?: { userId: string } }
) {
  try {
    const userId = context.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User ID not found',
        },
        { status: 401 }
      );
    }

    // Validate Content-Type
    if (!validateContentType(request)) {
      return NextResponse.json(
        {
          error: 'Unsupported Media Type',
          message: 'Content-Type must be application/json',
        },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { name, description, type, startDate, targetEndDate } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.length < 3 || name.length > 200) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Name must be between 3 and 200 characters',
        },
        { status: 400 }
      );
    }

    // Validate mission type with proper whitelist
    let projectType: ValidMissionType;
    try {
      projectType = type ? validateMissionType(type) : 'INVESTIGATION';
    } catch (typeError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: typeError instanceof Error ? typeError.message : 'Invalid mission type',
        },
        { status: 400 }
      );
    }

    // Generate project code
    const year = new Date().getFullYear();
    const count = await prisma.project.count({
      where: {
        projectCode: {
          startsWith: `MSN-${year}-`,
        },
      },
    });
    const projectCode = `MSN-${year}-${String(count + 1).padStart(3, '0')}`;

    // Create project (mission)
    const mission = await prisma.project.create({
      data: {
        projectCode,
        name,
        description,
        projectType: projectType as any,
        status: 'PLANNING',
        phase: 'INITIATION',
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        members: {
          create: {
            userId,
            role: 'OWNER',
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: mission.id,
      projectCode: mission.projectCode,
      name: mission.name,
      description: mission.description,
      type: MISSION_TYPE_MAP[mission.projectType] || mission.projectType.toLowerCase(),
      status: STATUS_MAP[mission.status] || mission.status.toLowerCase(),
      phase: mission.phase.toLowerCase(),
      createdAt: mission.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Create mission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create mission',
      },
      { status: 500 }
    );
  }
}

export const POST = withApiMiddleware(postHandler, { requireAuth: true });
