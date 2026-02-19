/**
 * API v1: API Keys Management
 * Story 8.2: API Key Management
 * Task 9: Security Features - Rate limiting
 *
 * GET /api/v1/api-keys - List user's API keys
 * POST /api/v1/api-keys - Create a new API key
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiUnauthorized, apiValidationError, apiConflict } from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/api-keys/generator';
import { hashApiKey } from '@/lib/api-keys/hasher';
import { checkApiKeyGenerationLimit } from '@/lib/api-keys/rate-limiter';
import type {
  APIKeyListItem,
  CreateAPIKeyResponse,
} from '@/lib/api-keys/types';
import { z } from 'zod';

// Validation schema for creating API keys
const createApiKeySchema = z.object({
  name: z.string().max(255).regex(/^[a-zA-Z0-9\s\-_]*$/, {
    message: 'Name must contain only letters, numbers, spaces, hyphens, and underscores',
  }).optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER', 'DEVELOPER', 'READONLY', 'API']).optional(),
  expiresIn: z.number().int().positive().optional().nullable(),
});

/**
 * Generate a default API key name
 * @param count - User's current key count
 * @returns Default name like "API Key #3"
 */
function generateDefaultKeyName(count: number): string {
  return `API Key #${count + 1}`;
}

/**
 * GET /api/v1/api-keys
 * List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const apiKeys = await prisma.aPIKey.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      description: true, // Mapped to 'name' in response
      permissions: true, // Mapped to 'role' in response
      isActive: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      usageCount: true,
    },
  });

  // Map database fields to API response format
  const items: APIKeyListItem[] = apiKeys.map((key) => {
    // Parse permissions to extract role (default to API if not set)
    let role = 'API';
    try {
      const permissions = JSON.parse(key.permissions) as string[];
      if (permissions.includes('admin')) role = 'ADMIN';
      else if (permissions.includes('write')) role = 'DEVELOPER';
      else if (permissions.includes('read')) role = 'READONLY';
    } catch {
      role = 'API';
    }

    return {
      id: key.id,
      name: key.description, // description maps to name
      role,
      isActive: key.isActive,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
    };
  });

  return apiSuccess({ keys: items });
}

/**
 * POST /api/v1/api-keys
 * Create a new API key
 *
 * Security: Returns the full key ONLY once at creation time
 * Story 8.2, Task 9: Rate limiting for key generation
 */
export async function POST(request: NextRequest) {
  const session = await validateSession();
  if (!session) {
    return apiUnauthorized('Authentication required');
  }

  const body = await request.json();

  // Validate request body
  const validation = createApiKeySchema.safeParse(body);
  if (!validation.success) {
    return apiValidationError(
      'Invalid request body',
      validation.error.flatten().fieldErrors
    );
  }

  const data = validation.data;

  // Check rate limits (Task 9: Security Features)
  const rateLimitCheck = await checkApiKeyGenerationLimit(session.user.id);
  if (!rateLimitCheck.canGenerate) {
    return apiConflict(rateLimitCheck.reason || 'Rate limit exceeded', {
      limit: 5,
      current: rateLimitCheck.currentCount,
    });
  }

  // Generate API key
  const key = generateApiKey();
  const keyHash = await hashApiKey(key);

  // Use provided name or generate default (Task 4 requirement)
  const keyName = data.name?.trim() || generateDefaultKeyName(rateLimitCheck.currentCount || 0);

  // Map role to permissions (maintain backward compatibility)
  const role = data.role || 'API';
  let permissions: string[] = [];
  switch (role) {
    case 'SUPERADMIN':
    case 'ADMIN':
      permissions = ['read', 'write', 'execute', 'admin',
                     'projects:read', 'projects:write',
                     'agents:invoke', 'workflows:execute', 'cli:execute'];
      break;
    case 'DEVELOPER':
    case 'USER':
      permissions = ['read', 'write', 'execute',
                     'projects:read', 'projects:write',
                     'agents:invoke', 'workflows:execute'];
      break;
    case 'READONLY':
      permissions = ['read', 'projects:read'];
      break;
    case 'API':
    default:
      permissions = ['read', 'write', 'execute',
                     'projects:read', 'projects:write',
                     'agents:invoke', 'workflows:execute', 'cli:execute'];
      break;
  }

  // Calculate expiration
  let expiresAt: Date | null = null;
  if (data.expiresIn) {
    expiresAt = new Date(Date.now() + data.expiresIn * 60 * 60 * 1000);
  }

  // Create API key in database
  const apiKey = await prisma.aPIKey.create({
    data: {
      userId: session.user.id,
      keyHash,
      keyPreview: key.slice(-4), // Store last 4 chars for identification
      description: keyName, // name maps to description
      permissions: JSON.stringify(permissions),
      expiresAt,
    },
  });

  // Create response (includes full key - shown ONLY once)
  const response: CreateAPIKeyResponse = {
    id: apiKey.id,
    key, // Full plaintext key - only returned at creation
    name: apiKey.description,
    role,
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
  };

  return apiSuccess(response, 201);
}
