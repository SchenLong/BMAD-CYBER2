/**
 * NextAuth.js API Route Handler
 * Story 1.3: Authentication - OAuth Providers
 *
 * Handles all OAuth authentication requests:
 * - /api/auth/signin - Initiate OAuth flow
 * - /api/auth/callback - OAuth provider callback
 * - /api/auth/signout - Sign out user
 *
 * IMPORTANT: The folder name "[...nextauth]" uses ellipsis (...)
 * which is a Next.js catch-all route pattern.
 */

import { handlers } from "@/../auth";

/**
 * Export GET and POST handlers for NextAuth.js
 * NextAuth.js uses both methods for different OAuth flows
 */
export const { GET, POST } = handlers;
