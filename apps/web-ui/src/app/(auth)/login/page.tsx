/**
 * Login Page
 * Story 1.2: Authentication System - Core
 * Story 1.3: Authentication - OAuth Providers (Added OAuth buttons)
 *
 * Public page for user authentication with email/password and OAuth.
 */

import { LoginForm } from '@/components/forms/login-form';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">BMAD Web UI</h1>
          <p className="text-muted-foreground">
            Sign in to access your workspace
          </p>
        </div>
        <LoginForm redirectUrl={redirectUrl} />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
