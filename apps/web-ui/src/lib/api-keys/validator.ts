/**
 * API Key Validator
 * Story 8.2: API Key Management
 *
 * Validates API key format and checks against database
 */

import { prisma } from '@/lib/prisma';
import { hashApiKey, verifyApiKey, isValidApiKeyFormat } from './hasher';
import type { APIKeyValidationResult } from './types';
import { UserRole } from '@prisma/client';

/**
 * Validate an API key from the Authorization header
 *
 * @param authHeader - The Authorization header value
 * @returns A promise that resolves to the validation result
 */
export async function validateApiKeyFromHeader(
  authHeader: string | null
): Promise<APIKeyValidationResult> {
  if (!authHeader) {
    return { isValid: false };
  }

  // Extract key from Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match) {
    return { isValid: false };
  }

  const key = match[1];

  // Validate format
  if (!isValidApiKeyFormat(key)) {
    return { isValid: false };
  }

  return await validateApiKey(key);
}

/**
 * Validate an API key against the database
 *
 * SECURITY: Uses hash-based lookup with unique index for O(log n) performance
 * This avoids loading all API keys into memory and provides constant-time
 * verification via bcrypt.compare after the initial hash lookup.
 *
 * @param key - The plaintext API key
 * @returns A promise that resolves to the validation result
 */
export async function validateApiKey(
  key: string
): Promise<APIKeyValidationResult> {
  // Hash the provided key for database lookup
  // Note: We hash first to leverage the unique index on keyHash
  const keyHash = await hashApiKey(key);

  // Look up API key by hash using the unique index
  const apiKey = await prisma.aPIKey.findFirst({
    where: {
      keyHash: keyHash,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      userId: true,
      keyHash: true,
      role: true,
      expiresAt: true,
    },
  });

  if (!apiKey) {
    return { isValid: false };
  }

  // Double-check with constant-time comparison to prevent timing attacks
  // This is necessary because hash collisions are theoretically possible
  const isValid = await verifyApiKey(key, apiKey.keyHash);
  if (!isValid) {
    return { isValid: false };
  }

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { isValid: false };
  }

  // Update last used timestamp and usage count
  await prisma.aPIKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  });

  return {
    isValid: true,
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    role: apiKey.role as UserRole,
  };
}

/**
 * Extract API key from request headers
 *
 * @param headers - Request headers
 * @returns The API key string or null
 */
export function extractApiKeyFromHeaders(
  headers: Headers
): string | null {
  // Try Authorization header first
  const authHeader = headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try X-API-Key header
  return headers.get('X-API-Key');
}
