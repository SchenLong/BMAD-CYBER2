import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <main className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold text-gradient-primary">
            BMAD - Mission Orchestration Platform
          </h1>
          <p className="text-text-secondary">
            Abdul Orchestrates. You Command.
          </p>
        </div>

        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle>Welcome to BMAD Web UI</CardTitle>
            <CardDescription>
              Your mission orchestration platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-tertiary">
              Story 1.2: Authentication System - Core has been implemented.
              Sign in or create an account to access your workspace.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button asChild variant="default">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
            <div className="pt-4 border-t text-xs text-text-tertiary">
              <p>Implemented features:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Prisma database with User and Session models</li>
                <li>Password hashing with bcrypt (cost factor 12)</li>
                <li>Zod validation schemas for all inputs</li>
                <li>Authentication API routes (login, register, logout, me)</li>
                <li>HttpOnly, Secure session cookies</li>
                <li>Route protection middleware</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
