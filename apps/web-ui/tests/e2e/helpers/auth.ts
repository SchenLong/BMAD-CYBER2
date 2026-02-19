/**
 * E2E Test Authentication Helpers
 *
 * This module provides helper functions for authentication in end-to-end tests.
 * It supports test authentication endpoints for different user roles.
 */

import { Page } from '@playwright/test';

/**
 * User roles supported in BMAD Web UI
 */
export type UserRole =
  | 'USER'       // Standard user with basic access
  | 'ADMIN'      // Administrator with elevated permissions
  | 'SUPERADMIN' // Super administrator with full system access
  | 'READONLY';  // Read-only user with view-only access

/**
 * Login options for authentication
 */
export interface LoginOptions {
  role?: UserRole;
  newUser?: boolean;
  mfa?: boolean;
}

/**
 * Authenticates a user using the test login endpoint.
 *
 * This function uses the test authentication endpoint to simulate login
 * without requiring real OAuth credentials. It sets up the session and
 * redirects to the appropriate page based on user state.
 *
 * @param page - Playwright Page object
 * @param options - Login options including role and flags
 * @returns Promise that resolves when login is complete
 *
 * @example
 * ```typescript
 * // Login as standard user
 * await login(page);
 *
 * // Login as admin
 * await login(page, { role: 'ADMIN' });
 *
 * // Login as new user (triggers onboarding)
 * await login(page, { role: 'USER', newUser: true });
 * ```
 */
export async function login(page: Page, options: LoginOptions = {}): Promise<void> {
  const { role = 'USER', newUser = false, mfa = false } = options;

  try {
    // Build test login URL with query parameters
    const params = new URLSearchParams({
      role,
      ...(newUser && { new: 'true' }),
      ...(mfa && { mfa: 'true' }),
    });

    const loginUrl = `/api/auth/test-login?${params.toString()}`;

    // Navigate to login endpoint
    await page.goto(loginUrl, { timeout: 10000 });

    // Wait for redirect to dashboard (or onboarding for new users)
    const expectedUrl = newUser ? /\/onboarding/ : /\/dashboard/;
    await page.waitForURL(expectedUrl, { timeout: 10000 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Login failed for role ${role}: ${errorMessage}`);
  }
}

/**
 * Logs out the current user.
 *
 * @param page - Playwright Page object
 * @returns Promise that resolves when logout is complete
 *
 * @example
 * ```typescript
 * await logout(page);
 * await page.waitForURL('/login');
 * ```
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Click logout button if visible
    const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign Out")').first();

    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
    }

    // Alternatively, navigate to logout endpoint
    await page.goto('/api/auth/logout', { timeout: 5000 });

    // Wait for redirect to login page
    await page.waitForURL('/login', { timeout: 5000 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Logout failed: ${errorMessage}`);
  }
}

/**
 * Creates a test session cookie for API testing.
 *
 * This helper is useful when you need to make authenticated API requests
 * in your tests without going through the full login flow.
 *
 * @param page - Playwright Page object
 * @param userId - Test user ID
 * @param role - User role
 * @returns Promise that resolves when session is set
 *
 * @example
 * ```typescript
 * await setTestSession(page, 'test-user-123', 'ADMIN');
 * await page.goto('/dashboard'); // Will be authenticated
 * ```
 */
export async function setTestSession(
  page: Page,
  userId: string,
  role: UserRole = 'USER'
): Promise<void> {
  const sessionData = {
    userId,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000, // 1 hour
  };

  await page.evaluate(({ data }) => {
    document.cookie = `test-session=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=3600`;
  }, { data: sessionData });
}

/**
 * Clears all test session cookies.
 *
 * @param page - Playwright Page object
 * @returns Promise that resolves when cookies are cleared
 */
export async function clearTestSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}
