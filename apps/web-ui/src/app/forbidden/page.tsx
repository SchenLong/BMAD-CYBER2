/**
 * Permission Denied Page (403 Forbidden)
 * Story 1.5: Role-Based Access Control (RBAC) - Task 5
 *
 * Displayed when a user tries to access a resource
 * without the required permissions.
 */

import Link from 'next/link';
import { auth } from '@/../auth';

export default async function ForbiddenPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Access Denied
        </h1>

        {/* Message */}
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          You don&apos;t have permission to access this resource.
        </p>

        {/* User Info */}
        {session?.user && (
          <div className="mb-6 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Signed in as <span className="font-medium">{session.user.email}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Role: <span className="font-medium">{session.user.role}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
