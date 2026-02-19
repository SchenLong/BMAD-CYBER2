/**
 * Projects API - v1
 * Story 8.1: RESTful API Implementation
 * Task 5: Project Endpoints
 *
 * GET /api/v1/projects - List user projects with filtering and pagination
 * POST /api/v1/projects - Create a new project
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiValidationError,
  apiUnauthorized,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  createProjectSchema,
  projectListQuerySchema,
} from '@/lib/projects/validation';
import { generateProjectCode } from '@/lib/types/projects';
import { z } from 'zod';

/**
 * Helper function to parse pagination query parameters
 */
function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  perPage: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('perPage') || searchParams.get('limit') || '20', 10))
  );

  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
  };
}

/**
 * GET /api/v1/projects
 * List projects with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const queryResult = projectListQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );

  if (!queryResult.success) {
    return apiValidationError('Invalid query parameters', {
      issues: queryResult.error.issues,
    });
  }

  const { page, perPage, offset } = parsePaginationParams(searchParams);
  const { type, status, search } = queryResult.data;

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
    skip: offset,
    take: perPage,
  });

  // Format response
  const formattedProjects = projects.map((project) => ({
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
    counts: project._count,
  }));

  const totalPages = Math.ceil(total / perPage);

  return apiSuccess({
    projects: formattedProjects,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

/**
 * POST /api/v1/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const body = await request.json();

  // Validate request body
  const validationResult = createProjectSchema.safeParse(body);

  if (!validationResult.success) {
    return apiValidationError('Invalid input', {
      issues: validationResult.error.issues,
    });
  }

  const data = validationResult.data;

  // Generate project code
  const projectCode = generateProjectCode(data.projectType);

  // Convert project type to Prisma enum format
  const projectType = data.projectType.toUpperCase().replace('-', '_') as any;

  try {
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
    };

    return apiSuccess(formattedProject, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}
