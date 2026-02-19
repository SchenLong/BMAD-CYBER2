/**
 * Users Table Component
 * Story 1.5: Role-Based Access Control (RBAC) - Task 7
 *
 * Client component for displaying and managing users in a table.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import { ROLE_DESCRIPTIONS } from '@/lib/auth/permissions';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: Date | null;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function UsersTable() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      // Limit search input to prevent DoS
      if (search && search.length <= 100) {
        params.set('search', search);
      }
      if (roleFilter) params.set('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result: UsersResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        <button
          onClick={fetchUsers}
          className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
        <p className="text-lg text-gray-600 dark:text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          maxLength={100}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | '');
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">All Roles</option>
          <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.USER}>User</option>
          <option value={UserRole.READONLY}>ReadOnly</option>
          <option value={UserRole.API}>API</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {data.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name || 'No name'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className={user.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                    {user.mfaEnabled && (
                      <span className="text-blue-600">MFA Enabled</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
          {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
          {data.pagination.total} users
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPreviousPage}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.pagination.hasNextPage}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
