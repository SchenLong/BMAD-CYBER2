/**
 * DELETE/PATCH /api/api-keys/[id]
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 *
 * Deletes (revokes) or updates an API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/api-keys/[id]
 * Revokes an API key (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Not found', message: 'API key not found' },
        { status: 404 }
      );
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not own this API key' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.aPIKey.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/api-keys/[id]
 * Updates an API key (e.g., deactivate/reactivate)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Not found', message: 'API key not found' },
        { status: 404 }
      );
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not own this API key' },
        { status: 403 }
      );
    }

    // Update allowed fields only
    const updates: { isActive?: boolean; description?: string } = {};
    if ('isActive' in body) {
      updates.isActive = Boolean(body.isActive);
    }
    if ('description' in body && typeof body.description === 'string') {
      updates.description = body.description.slice(0, 200);
    }

    const updatedKey = await prisma.aPIKey.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      id: updatedKey.id,
      description: updatedKey.description,
      isActive: updatedKey.isActive,
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update API key' },
      { status: 500 }
    );
  }
}
