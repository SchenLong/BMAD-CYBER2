/**
 * Next.js Middleware
 * Story 1.2: Authentication System - Core
 * Story 1.3: Authentication - OAuth Providers (Updated for Auth.js)
 * Story 1.4: Authentication - Multi-Factor Auth (MFA verification)
 * Story 1.5: Role-Based Access Control (RBAC) - Authorization checks
 * Story 2.1: Role-Based Onboarding Wizard - Onboarding redirect
 * Story 9.2: Prompt Injection Middleware - Injection detection
 *
 * Route protection middleware that validates sessions
 * and redirects unauthenticated users to login.
 *
 * Protected routes: /dashboard, /projects, /missions, /admin, etc.
 * Public routes: /, /login, /register, /api/auth
 * Onboarding route: /onboarding (requires auth, bypasses onboarding check)
 *
 * Security chain: Prompt Injection -> Auth -> Onboarding -> Response
 *
 * Performance: Story 2.1 optimized - onboarding check uses direct DB lookup
 * instead of API call to reduce latency on protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { needsOnboarding } from '@/lib/auth/onboarding';
import { promptInjectionMiddleware } from '@/middleware/prompt-injection-middleware';
import { jwtVerify } from 'jose';

const MFA_VERIFIED_COOKIE = 'mfa_verified';
const MIDDLEWARE_AUTH_COOKIE = 'middleware_auth';

/**
 * Verify middleware auth token (JWT)
 * This provides Edge Runtime compatible authentication for password-based logins
 * The JWT is created during login and contains user ID and onboarding status
 */
async function verifyMiddlewareToken(request: NextRequest): Promise<{
  userId: string;
  email: string;
  role: string;
  onboardingCompleted: string | null;
} | null> {
  try {
    const token = request.cookies.get(MIDDLEWARE_AUTH_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      onboardingCompleted: payload.onboardingCompleted as string | null,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/me',
    '/mfa/verify', // Story 1.4: MFA verification page
    '/onboarding', // Story 2.1: Onboarding page (requires auth, but checked separately)
  ];

  // Story 4.1: SSE endpoints need to be accessible for streaming
  // Note: In production, these should have their own authentication mechanism
  if (pathname.includes('/observe')) {
    return true;
  }

  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if a route is protected (requires authentication)
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ['/dashboard', '/projects', '/missions', '/admin', '/api/agents', '/api/missions', '/settings', '/templates/builder'];
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Check if MFA is required for the user
 * Story 1.4: Check deployment mode and user MFA status
 */
type SessionUser = { user?: { id?: string } } | null;

async function requiresMfaVerification(request: NextRequest, session: SessionUser): Promise<boolean> {
  // MFA verification is not required on the MFA page itself
  if (request.nextUrl.pathname === '/mfa/verify') {
    return false;
  }

  // If no MFA verified cookie, need to check if user has MFA enabled
  const mfaVerified = request.cookies.get(MFA_VERIFIED_COOKIE)?.value === 'true';

  if (mfaVerified) {
    return false; // Already verified
  }

  // Check if user has MFA enabled
  if (session?.user?.id) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/mfa/challenge`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.mfaEnabled === true;
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle legacy route redirects for backward compatibility
  // These routes were referenced in testing but are under /dashboard
  const legacyRedirects: Record<string, string> = {
    '/teams': '/agents', // Redirect to agents page where users can select teams
    '/workflows': '/dashboard/workflows',
    '/templates': '/dashboard/templates',
    '/docs': '/dashboard/docs/api',
  };

  // Check for exact match legacy redirects
  if (legacyRedirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = legacyRedirects[pathname];
    return NextResponse.redirect(url);
  }

  // Handle /teams/{slug} redirect to /dashboard/teams/{slug}
  if (pathname.startsWith('/teams/') && pathname !== '/teams') {
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard${pathname}`;
    return NextResponse.redirect(url);
  }

  // Story 9.2: Check for prompt injection first (before auth)
  // This applies to all POST/PUT/PATCH requests
  // Returns: blocking response (400), warning response (with headers),
  //          sanitized response (with x-prompt-sanitized header), or null (pass through)
  const injectionResult = await promptInjectionMiddleware(request);
  if (injectionResult) {
    // If it's a NextResponse (blocking, warning, or sanitized), return it
    // The sanitized response allows the request to continue while indicating
    // to downstream handlers that the input has been checked
    return injectionResult;
  }

  // Allow public routes to pass through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check for session using Auth.js OR middleware auth token
  if (isProtectedRoute(pathname)) {
    const authSession = await auth();
    const middlewareAuth = await verifyMiddlewareToken(request);

    // Check both Auth.js session (OAuth) and middleware token (password login)
    const isAuthenticated = (authSession?.user) || middlewareAuth;

    if (!isAuthenticated) {
      // No session - redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Story 1.4: Check if MFA verification is required
    // Use authSession if available, otherwise get user ID from middleware token
    const customUserId = middlewareAuth?.userId;
    const sessionForMfa = authSession || { user: { id: customUserId || undefined } };
    const needsMfa = await requiresMfaVerification(request, sessionForMfa);

    if (needsMfa) {
      // Redirect to MFA verification page
      const url = request.nextUrl.clone();
      url.pathname = '/mfa/verify';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Story 2.1: Check if onboarding is required
    // Optimized: Use JWT token data for password login, DB lookup for OAuth
    const pathnameLower = pathname.toLowerCase();
    if (!pathnameLower.includes('/onboarding') && !pathnameLower.startsWith('/api/')) {
      try {
        let onboardingNeeded = false;

        if (middlewareAuth && !authSession?.user) {
          // For password login: use onboarding status from JWT (no DB call needed)
          onboardingNeeded = !middlewareAuth.onboardingCompleted;
        } else if (authSession?.user?.id) {
          // For OAuth: use DB lookup via needsOnboarding function
          onboardingNeeded = await needsOnboarding(authSession.user.id);
        }

        if (onboardingNeeded) {
          // Redirect to onboarding page
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding';
          url.searchParams.set('redirect', pathname);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('[Middleware] Error checking onboarding:', error);
        // Fail open - if we can't check onboarding, don't block the user
      }
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - API routes starting with /api/auth (handled by Auth.js)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
