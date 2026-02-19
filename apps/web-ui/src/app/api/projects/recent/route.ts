/**
 * Recent Projects API Route
 * Story 2.2: Abdul Welcome Screen
 * Epic 6: Project Management System (Story 6.1, 6.2)
 *
 * GET /api/projects/recent
 * Fetch up to 3 most recent projects for the current user
 *
 * Security:
 * - Authentication required
 * - Only returns projects user has access to
 * - User profile data sanitized
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/projects/recent
 * Fetch recent projects for the current user
 */
export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch recent projects using Epic 6 data model
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
        status: {
          not: 'ARCHIVED',
        },
      },
      select: {
        id: true,
        projectCode: true,
        name: true,
        projectType: true,
        status: true,
        updatedAt: true,
        completionPercent: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    });

    // Format projects for response
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      projectCode: project.projectCode,
      type: project.projectType.toLowerCase().replace('_', '-'),
      status: project.status.toLowerCase().replace('-', '_') as 'active' | 'paused' | 'completed',
      lastEdited: project.updatedAt,
      completionPercent: project.completionPercent,
    }));

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
