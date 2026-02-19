/**
 * Organization Members API Route
 * Multi-tenancy support for enterprise features
 *
 * GET /api/organizations/members - List organization members
 *
 * Security:
 * - Authentication required
 * - Users can only view members of their own organization
 * - Returns list of organization members for sharing templates
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/organizations/members
 * Get list of organization members for template sharing
 *
 * Returns members of the user's organization for selecting
 * who to share templates with (when isPublic is enabled)
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

    // If user doesn't have an organization, return empty list
    if (!session.organizationId) {
      return NextResponse.json({
        members: [],
        organizationId: null,
      });
    }

    // Get organization members with their roles
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId: session.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Format response
    const formattedMembers = members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      organizationRole: member.role, // OWNER, ADMIN, or MEMBER
      joinedAt: member.joinedAt,
    }));

    return NextResponse.json({
      members: formattedMembers,
      organization: organization ? {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
