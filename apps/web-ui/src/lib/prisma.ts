/**
 * Prisma Client Singleton
 *
 * In development, React's Fast Refresh recreates the module,
 * which would create multiple Prisma Client instances.
 * This singleton prevents that issue.
 *
 * In production, we still want to reuse the same instance.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

export const prisma = globalForPrisma.prisma;
