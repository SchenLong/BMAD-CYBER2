/**
 * Admin Users Page
 * Story 1.5: Role-Based Access Control (RBAC) - Task 7
 *
 * Displays a list of all users with role management capabilities.
 * Accessible only to users with USER_MANAGE permission.
 */

import { auth } from '@/../auth';
import { redirect } from 'next/navigation';
import { assertPermission } from '@/middleware/authorization';
import { Permission } from '@/lib/auth/permissions';
import { AuthorizationError } from '@/lib/auth/authorization';
import { UsersTable } from '@/components/admin/users-table';

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Check authorization - will redirect if not authorized
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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <UsersTable />
    </div>
  );
}
