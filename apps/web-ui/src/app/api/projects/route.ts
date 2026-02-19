/**
 * Projects API Route
 * Epic 6: Project Management System
 * Story 6.2: Project CRUD API
 *
 * GET    /api/projects - List projects with filtering and pagination
 * POST   /api/projects - Create a new project
 *
 * Security:
 * - Authentication required for all operations
 * - Users can only see projects they are members of
 * - Only project owners can update/delete projects
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  createProjectSchema,
  updateProjectSchema,
  projectListQuerySchema,
  createSecurityAssessmentProjectSchema,
  createIncidentResponseProjectSchema,
} from '@/lib/projects/validation';
import { generateProjectCode, generateIncidentId, generatePentestId } from '@/lib/types/projects';

/**
 * GET /api/projects
 * List projects with filtering and pagination
 */
export async function GET(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = projectListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, type, status, search } = queryResult.data;

    // Build where clause
    const where: any = {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    };

    if (type) {
      where.projectType = type.toUpperCase().replace('-', '_');
    }

    if (status) {
      where.status = status.toUpperCase().replace('-', '_');
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { projectCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.project.count({ where });

    // Get projects with pagination
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        projectCode: true,
        name: true,
        description: true,
        projectType: true,
        status: true,
        phase: true,
        completionPercent: true,
        startDate: true,
        targetEndDate: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            userId: true,
            role: true,
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
        _count: {
          select: {
            members: true,
            workflows: true,
            artifacts: true,
            deliverables: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formattedProjects = projects.map((project) => ({
      ...project,
      projectType: project.projectType.toLowerCase().replace('_', '-') as any,
      status: project.status.toLowerCase().replace('_', '_') as any,
      phase: project.phase.toLowerCase() as any,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body based on project type
    let validationResult;
    if (body.projectType === 'security-assessment') {
      validationResult = createSecurityAssessmentProjectSchema.safeParse(body);
    } else if (body.projectType === 'incident-response') {
      validationResult = createIncidentResponseProjectSchema.safeParse(body);
    } else {
      validationResult = createProjectSchema.safeParse(body);
    }

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data as any;

    // Generate project code
    const projectCode = generateProjectCode(data.projectType);

    // Convert project type to Prisma enum format
    const projectType = data.projectType.toUpperCase().replace('-', '_') as any;
    const assessmentType = data.assessmentType?.toUpperCase().replace('-', '_') as any;

    // Create project with creator as owner
    const project = await prisma.project.create({
      data: {
        projectCode,
        name: data.name,
        description: data.description,
        projectType,
        status: 'PLANNING',
        phase: 'INITIATION',
        completionPercent: 0,
        startDate: data.startDate,
        targetEndDate: data.targetEndDate,

        // Security assessment specific fields
        ...(projectType === 'SECURITY_ASSESSMENT' && {
          assessmentType,
          pentestId: assessmentType === 'PENETRATION_TEST' ? generatePentestId() : null,
          scope: data.scope ? JSON.stringify(data.scope) : null,
        }),

        // Incident response specific fields
        ...(projectType === 'INCIDENT_RESPONSE' && {
          incidentId: generateIncidentId(),
          incidentSeverity: data.incidentSeverity?.toUpperCase() as any,
          affectedSystems: data.affectedSystems ?? 0,
          containedSystems: 0,
        }),

        // Add creator as owner
        members: {
          create: {
            userId: session.user.id,
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
                image: true,
              },
            },
          },
        },
      },
    });

    // Format response
    const formattedProject = {
      ...project,
      projectType: project.projectType.toLowerCase().replace('_', '-') as any,
      status: project.status.toLowerCase().replace('_', '_') as any,
      phase: project.phase.toLowerCase() as any,
      assessmentType: project.assessmentType?.toLowerCase().replace('_', '_') as any | undefined,
      incidentSeverity: project.incidentSeverity?.toLowerCase() as any | undefined,
    };

    return NextResponse.json({ project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
