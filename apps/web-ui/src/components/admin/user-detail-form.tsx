/**
 * User Detail Form Component
 * Story 1.5: Role-Based Access Control (RBAC) - Task 7
 *
 * Client component for viewing and editing user details,
 * including role assignment.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { ROLE_DESCRIPTIONS } from '@/lib/auth/permissions';

interface UserDetailFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    emailVerified: Date | null;
    image: string | null;
    mfaEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  currentUserRole: UserRole;
}

export function UserDetailForm({ user, currentUserRole }: UserDetailFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Role hierarchy: higher numbers can modify lower roles
  const ROLE_HIERARCHY: Record<string, number> = {
    SUPERADMIN: 100,
    ADMIN: 75,
    DEVELOPER: 60,
    USER: 50,
    READONLY: 25,
    API: 50,
  };

  const currentLevel = ROLE_HIERARCHY[currentUserRole];
  const userLevel = ROLE_HIERARCHY[user.role];

  // Can only edit users with lower role level
  const canEdit = currentLevel > userLevel;

  // Available roles that can be assigned (only roles lower than current user)
  const availableRoles = Object.entries(UserRole)
    .filter(([, enumValue]) => ROLE_HIERARCHY[enumValue as UserRole] < currentLevel)
    .map(([name, value]) => ({ name, value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (r: UserRole): string => {
    switch (r) {
      case UserRole.SUPERADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case UserRole.ADMIN:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case UserRole.USER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case UserRole.READONLY:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case UserRole.API:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-green-800 dark:text-green-200">
            User updated successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-semibold">User Information</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.name || 'No name provided'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                User ID
              </label>
              <p className="mt-1 text-sm font-mono text-gray-500 dark:text-gray-400">
                {user.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Created
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 flex flex-wrap gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                user.emailVerified
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {user.emailVerified ? 'Email Verified' : 'Email Unverified'}
            </span>

            {user.mfaEnabled && (
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                MFA Enabled
              </span>
            )}
          </div>
        </div>

        {/* Role Assignment Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Role Assignment</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Current role: {user.role}
              </p>
            </div>

            {!isEditing && canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit Role
              </button>
            )}
          </div>

          {/* Current Role Badge */}
          <div className="mt-4">
            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {ROLE_DESCRIPTIONS[user.role]}
            </p>
          </div>

          {/* Role Editor */}
          {isEditing && (
            <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {availableRoles.map(({ name, value }) => (
                  <option key={value} value={value}>
                    {name} - {ROLE_DESCRIPTIONS[value]}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setRole(user.role);
                    setError(null);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cannot Edit Warning */}
          {!canEdit && (
            <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You cannot modify this user because they have an equal or higher role level.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Users
          </button>
        </div>
      </form>
    </div>
  );
}
