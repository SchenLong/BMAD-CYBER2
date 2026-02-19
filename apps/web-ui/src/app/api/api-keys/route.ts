/**
 * GET/POST /api/api-keys
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 * Task 7: API Integration
 *
 * Lists and creates API keys for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';
import { APIKeyPermission } from '@/lib/types/api-keys';

/**
 * GET /api/api-keys
 * Lists all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const apiKeys = await prisma.aPIKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform for client response (never expose full key)
    const keys = apiKeys.map(key => ({
      id: key.id,
      description: key.description,
      keyPreview: key.keyPreview,
      permissions: JSON.parse(key.permissions) as APIKeyPermission[],
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      isActive: key.isActive,
    }));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Creates a new API key for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { description, permissions, expiresIn } = body;

    // Validate inputs
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Description is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input', message: 'At least one permission is required' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions: APIKeyPermission[] = [
      'read', 'write', 'execute', 'admin',
      'projects:read', 'projects:write', 'agents:invoke', 'workflows:execute', 'cli:execute'
    ];

    for (const perm of permissions) {
      if (!validPermissions.includes(perm)) {
        return NextResponse.json(
          { error: 'Invalid permission', message: `Unknown permission: ${perm}` },
          { status: 400 }
        );
      }
    }

    // Generate API key
    const keyId = randomBytes(16).toString('hex');
    const keyRaw = `bmad.v1.${keyId}`;
    const keyHash = createHash('sha256').update(keyRaw).digest('hex');
    const keyPreview = keyRaw.slice(-4);

    // Calculate expiration
    let expiresAt: Date | undefined = undefined;
    if (expiresIn && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
    }

    // Create API key in database
    const apiKey = await prisma.aPIKey.create({
      data: {
        userId: session.user.id,
        keyHash,
        keyPreview,
        description: description.slice(0, 200),
        permissions: JSON.stringify(permissions),
        expiresAt,
      },
    });

    // Return full key only on creation
    const response = {
      id: apiKey.id,
      key: keyRaw,
      description: apiKey.description,
      permissions: permissions as APIKeyPermission[],
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
