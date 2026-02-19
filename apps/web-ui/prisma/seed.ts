/**
 * Prisma Seed File
 * Story 1.5: Role-Based Access Control (RBAC) - Task 1
 *
 * Creates default users with different roles for testing.
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if default admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@bmad.local' },
  });

  if (existingAdmin) {
    console.log('Default admin user already exists. Skipping seed.');
    return;
  }

  // Create default admin user
  // Note: Password would be hashed in a real scenario
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bmad.local',
      name: 'BMAD Administrator',
      role: UserRole.SUPERADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('Created default admin user:', adminUser.email);

  // Create test users with different roles
  const testUsers = [
    {
      email: 'admin-test@bmad.local',
      name: 'Test Admin',
      role: UserRole.ADMIN,
    },
    {
      email: 'user@bmad.local',
      name: 'Test User',
      role: UserRole.USER,
    },
    {
      email: 'readonly@bmad.local',
      name: 'Test Read Only',
      role: UserRole.READONLY,
    },
    {
      email: 'api@bmad.local',
      name: 'API Service Account',
      role: UserRole.API,
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        emailVerified: new Date(),
      },
    });
    console.log(`Created test user: ${user.email} with role ${user.role}`);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
