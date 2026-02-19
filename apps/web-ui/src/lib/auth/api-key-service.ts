/**
 * API Key Service
 * Story 8.3: API Authentication - Task 2
 *
 * Handles API key validation, verification, and usage tracking.
 */

import { prisma } from '@/lib/prisma';
import { createHash, randomBytes } from 'crypto';

/**
 * API Key validation result
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: {
    id: string;
    userId: string;
    name: string;
    permissions: string[];
    isActive: boolean;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    usageCount: number;
  };
  error?: string;
}

/**
 * Generate API key hash for storage
 * @param key - The raw API key
 * @returns SHA-256 hash
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate API key preview (last 4 characters)
 * @param key - The raw API key
 * @returns Last 4 characters for display
 */
export function getApiKeyPreview(key: string): string {
  return key.slice(-4);
}

/**
 * Generate a new API key
 * @returns Generated API key
 */
export function generateApiKey(): string {
  const keyId = randomBytes(16).toString('hex');
  return `bmad.v1.${keyId}`;
}

/**
 * Validate an API key by hash lookup
 * @param keyHash - SHA-256 hash of the API key
 * @returns Validation result with API key data if valid
 */
export async function validateApiKeyByKeyHash(
  keyHash: string
): Promise<ApiKeyValidationResult> {
  try {
    const apiKey = await prisma.aPIKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey) {
      return {
        isValid: false,
        error: 'API key not found',
      };
    }

    // Check if soft deleted
    if (apiKey.deletedAt !== null) {
      return {
        isValid: false,
        error: 'API key has been revoked',
      };
    }

    // Check if active
    if (!apiKey.isActive) {
      return {
        isValid: false,
        error: 'API key is inactive',
      };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return {
        isValid: false,
        error: 'API key has expired',
      };
    }

    // Parse permissions from JSON
    let permissions: string[] = [];
    if (apiKey.permissions) {
      try {
        permissions = JSON.parse(apiKey.permissions);
      } catch {
        permissions = [];
      }
    }

    return {
      isValid: true,
      apiKey: {
        id: apiKey.id,
        userId: apiKey.userId,
        name: apiKey.description || 'Unnamed Key',
        permissions,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        usageCount: apiKey.usageCount,
      },
    };
  } catch (error) {
    console.error('Failed to validate API key:', error);
    return {
      isValid: false,
      error: 'Internal validation error',
    };
  }
}

/**
 * Validate an API key by raw key
 * @param rawKey - The raw API key
 * @returns Validation result with API key data if valid
 */
export async function validateApiKey(rawKey: string): Promise<ApiKeyValidationResult> {
  if (!rawKey || typeof rawKey !== 'string') {
    return {
      isValid: false,
      error: 'Invalid API key format',
    };
  }

  // Check key format (bmad.v1.{hex})
  if (!rawKey.startsWith('bmad.v1.')) {
    return {
      isValid: false,
      error: 'Invalid API key format',
    };
  }

  const keyHash = hashApiKey(rawKey);
  return validateApiKeyByKeyHash(keyHash);
}

/**
 * Update API key usage statistics
 * Called after successful authentication
 * @param keyId - The API key ID
 */
export async function updateApiKeyUsage(keyId: string): Promise<void> {
  try {
    await prisma.aPIKey.update({
      where: { id: keyId },
      data: {
        lastUsedAt: new Date(),
        usageCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Failed to update API key usage:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Check if an API key has a specific permission
 * @param keyId - The API key ID
 * @param permission - The permission to check
 * @returns True if key has permission, false otherwise
 */
export async function apiKeyHasPermission(
  keyId: string,
  permission: string
): Promise<boolean> {
  try {
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id: keyId },
      select: { permissions: true },
    });

    if (!apiKey) {
      return false;
    }

    if (!apiKey.permissions) {
      return false;
    }

    let permissions: string[];
    try {
      permissions = JSON.parse(apiKey.permissions);
    } catch {
      return false;
    }

    // Check for admin permission (grants all)
    if (permissions.includes('admin')) {
      return true;
    }

    // Check for specific permission or wildcard
    return permissions.includes(permission) ||
           permissions.includes('*') ||
           hasWildcardPermission(permissions, permission);
  } catch (error) {
    console.error('Failed to check API key permission:', error);
    return false;
  }
}

/**
 * Check if permissions list contains a matching wildcard
 * @param permissions - List of permissions
 * @param permission - Permission to check
 * @returns True if wildcard matches
 */
function hasWildcardPermission(permissions: string[], permission: string): boolean {
  const parts = permission.split(':');
  if (parts.length < 2) {
    return false;
  }

  const resource = parts[0];
  return permissions.some(p => p === `${resource}:*`);
}

/**
 * Get API key owner user info
 * @param keyId - The API key ID
 * @returns User info or null
 */
export async function getApiKeyOwner(keyId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
} | null> {
  try {
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id: keyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!apiKey) {
      return null;
    }

    return apiKey.user;
  } catch (error) {
    console.error('Failed to get API key owner:', error);
    return null;
  }
}

/**
 * Revoke an API key (soft delete)
 * @param keyId - The API key ID
 * @param userId - User ID for authorization
 * @returns True if revoked, false otherwise
 */
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  try {
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== userId) {
      return false;
    }

    await prisma.aPIKey.update({
      where: { id: keyId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return false;
  }
}
