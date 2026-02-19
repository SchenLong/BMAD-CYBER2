/**
 * Register Page
 * Story 1.2: Authentication System - Core
 *
 * Public page for user registration.
 */

import { RegisterForm } from '@/components/forms/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">BMAD Web UI</h1>
          <p className="text-muted-foreground">
            Create an account to get started
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
