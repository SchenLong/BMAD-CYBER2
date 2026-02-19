/**
 * API Key Rate Limiter
 * Story 8.2: API Key Management
 * Task 9: Security Features
 *
 * Rate limiting for API key generation:
 * - Max 5 active API keys per user
 * - Max 3 generation attempts per hour
 */

import { prisma } from '@/lib/prisma';

/**
 * Rate limit configuration for API key generation
 */
const MAX_ACTIVE_KEYS = 5;
const MAX_GENERATION_ATTEMPTS_PER_HOUR = 3;

/**
 * Check if user can generate a new API key
 *
 * @param userId - The user ID
 * @returns Object with canGenerate flag and reason if not allowed
 */
export async function checkApiKeyGenerationLimit(userId: string): Promise<{
  canGenerate: boolean;
  reason?: string;
  currentCount?: number;
}> {
  // Check active key count
  const activeCount = await prisma.aPIKey.count({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (activeCount >= MAX_ACTIVE_KEYS) {
    return {
      canGenerate: false,
      reason: `Maximum active API key limit reached (${MAX_ACTIVE_KEYS}). Revoke existing keys to create new ones.`,
      currentCount: activeCount,
    };
  }

  // Check generation attempts in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentAttempts = await prisma.aPIKey.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentAttempts >= MAX_GENERATION_ATTEMPTS_PER_HOUR) {
    return {
      canGenerate: false,
      reason: `Too many generation attempts. Maximum ${MAX_GENERATION_ATTEMPTS_PER_HOUR} per hour. Please try again later.`,
    };
  }

  return { canGenerate: true };
}

/**
 * Get API key usage statistics for a user
 *
 * @param userId - The user ID
 * @returns Usage statistics
 */
export async function getApiKeyUsageStats(userId: string) {
  const [totalCount, activeCount, revokedCount, totalUsage] = await Promise.all([
    prisma.aPIKey.count({ where: { userId } }),
    prisma.aPIKey.count({
      where: { userId, isActive: true, deletedAt: null },
    }),
    prisma.aPIKey.count({
      where: { userId, deletedAt: { not: null } },
    }),
    prisma.aPIKey.aggregate({
      where: { userId },
      _sum: { usageCount: true },
    }),
  ]);

  return {
    total: totalCount,
    active: activeCount,
    revoked: revokedCount,
    totalUsage: totalUsage._sum.usageCount || 0,
    remaining: Math.max(0, MAX_ACTIVE_KEYS - activeCount),
  };
}

/**
 * Get rate limit information for display
 */
export function getRateLimitInfo() {
  return {
    maxActiveKeys: MAX_ACTIVE_KEYS,
    maxGenerationAttemptsPerHour: MAX_GENERATION_ATTEMPTS_PER_HOUR,
  };
}
