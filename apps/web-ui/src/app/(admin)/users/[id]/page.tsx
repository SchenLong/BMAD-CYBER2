/**
 * User Detail Page
 * Story 1.5: Role-Based Access Control (RBAC) - Task 7
 *
 * Displays detailed information about a specific user
 * and allows role assignment.
 */

import { notFound } from 'next/navigation';
import { auth } from '@/../auth';
import { redirect } from 'next/navigation';
import { assertPermission } from '@/middleware/authorization';
import { Permission } from '@/lib/auth/permissions';
import { AuthorizationError } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { UserDetailForm } from '@/components/admin/user-detail-form';
import { UserRole } from '@prisma/client';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Check authorization
  try {
    await assertPermission(Permission.USER_MANAGE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      if (error.code === 'UNAUTHORIZED') {
        redirect('/login');
      }
      redirect('/forbidden');
    }
    redirect('/forbidden');
  }

  const { id } = await params;

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      image: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Details</h1>
        <p className="text-muted-foreground mt-2">
          Manage user role and permissions
        </p>
      </div>

      <UserDetailForm user={user} currentUserRole={session.user.role as UserRole} />
    </div>
  );
}
