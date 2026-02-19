/**
 * NextAuth Type Extensions
 * Story 1.3: Authentication - OAuth Providers
 *
 * Extends NextAuth types to include custom user fields.
 */

import { UserRole } from "@prisma/client";

declare module "next-auth" {
  /**
   * The shape of the session object returned from useSession, getSession, etc.
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  /**
   * The shape of the User object returned from the OAuth provider
   * Note: role is added via adapter callbacks, not part of the base User type
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * The shape of the JWT token used by Auth.js
   */
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role?: UserRole;
  }
}
