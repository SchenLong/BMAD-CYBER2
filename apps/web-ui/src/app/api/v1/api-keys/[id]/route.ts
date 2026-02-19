/**
 * API v1: API Key Details
 * Story 8.2: API Key Management
 *
 * GET /api/v1/api-keys/:id - Get API key details
 * PATCH /api/v1/api-keys/:id - Update API key
 * DELETE /api/v1/api-keys/:id - Revoke API key
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  apiUnauthorized,
  apiValidationError,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import type {
  APIKeyDetails,
} from '@/lib/api-keys/types';
import { z } from 'zod';

// Validation schema for updating API keys
const updateApiKeySchema = z.object({
  name: z.string().min(1).max(255).regex(/^[a-zA-Z0-9\s\-_]+$/).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/v1/api-keys/:id
 * Get details of a specific API key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const { id } = await params;

  const apiKey = await prisma.aPIKey.findFirst({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      description: true,
      permissions: true,
      isActive: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      usageCount: true,
    },
  });

  if (!apiKey) {
    return apiNotFound('API key');
  }

  // Parse permissions to extract role
  let role = 'API';
  try {
    const permissions = JSON.parse(apiKey.permissions) as string[];
    if (permissions.includes('admin')) role = 'ADMIN';
    else if (permissions.includes('write')) role = 'DEVELOPER';
    else if (permissions.includes('read')) role = 'READONLY';
  } catch {
    role = 'API';
  }

  const details: APIKeyDetails = {
    id: apiKey.id,
    name: apiKey.description,
    role,
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
    lastUsedAt: apiKey.lastUsedAt,
    usageCount: apiKey.usageCount,
  };

  return apiSuccess(details);
}

/**
 * PATCH /api/v1/api-keys/:id
 * Update an API key (name, active status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const { id } = await params;
  const body = await request.json();

  // Validate request body
  const validation = updateApiKeySchema.safeParse(body);
  if (!validation.success) {
    return apiValidationError(
      'Invalid request body',
      validation.error.flatten().fieldErrors
    );
  }

  const data = validation.data;

  // Check ownership
  const apiKey = await prisma.aPIKey.findFirst({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
  });

  if (!apiKey) {
    return apiNotFound('API key');
  }

  // Build update data
  const updateData: {
    description?: string;
    isActive?: boolean;
  } = {};

  if (data.name !== undefined) {
    updateData.description = data.name;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  // Update API key
  const updatedKey = await prisma.aPIKey.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      description: true,
      permissions: true,
      isActive: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      usageCount: true,
    },
  });

  // Parse permissions to extract role
  let role = 'API';
  try {
    const permissions = JSON.parse(updatedKey.permissions) as string[];
    if (permissions.includes('admin')) role = 'ADMIN';
    else if (permissions.includes('write')) role = 'DEVELOPER';
    else if (permissions.includes('read')) role = 'READONLY';
  } catch {
    role = 'API';
  }

  const details: APIKeyDetails = {
    id: updatedKey.id,
    name: updatedKey.description,
    role,
    isActive: updatedKey.isActive,
    createdAt: updatedKey.createdAt,
    expiresAt: updatedKey.expiresAt,
    lastUsedAt: updatedKey.lastUsedAt,
    usageCount: updatedKey.usageCount,
  };

  return apiSuccess(details);
}

/**
 * DELETE /api/v1/api-keys/:id
 * Revoke (soft delete) an API key
 *
 * Story 8.2: Implements soft delete with deletedAt timestamp
 * Keys can be permanently deleted after 30 days
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const { id } = await params;

  // Check ownership
  const apiKey = await prisma.aPIKey.findFirst({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
  });

  if (!apiKey) {
    return apiNotFound('API key');
  }

  // Soft delete by setting deletedAt
  await prisma.aPIKey.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  return apiSuccess({
    success: true,
    message: 'API key revoked successfully',
  });
}
