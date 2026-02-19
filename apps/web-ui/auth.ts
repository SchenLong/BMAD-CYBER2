/**
 * Auth.js Configuration (NextAuth v5)
 * Story 1.3: Authentication - OAuth Providers
 *
 * Provides OAuth authentication with Google and GitHub providers.
 * Integrates with existing Prisma database and User model.
 *
 * Type extensions are in src/types/next-auth.d.ts
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./src/lib/prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// Environment variables - Auth.js v5 uses AUTH_ prefix
const AUTH_SECRET = process.env.AUTH_SECRET;
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET;

// Validate required environment variables
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set. Generate one with: openssl rand -base64 33");
}

/**
 * Auth.js configuration with OAuth providers
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for edge compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
    GitHub({
      clientId: GITHUB_CLIENT_ID || "",
      clientSecret: GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    /**
     * JWT callback - called when token is created or updated
     * Adds custom fields (id, role) to the JWT token
     */
    async jwt({ token, user }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Fetch user role from database for RBAC (Story 1.5)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role || "USER";
      }
      return token;
    },

    /**
     * Session callback - called when session is checked
     * Makes user data available in the session object
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = (token.role || "USER") as "SUPERADMIN" | "ADMIN" | "USER" | "READONLY" | "API";
      }
      return session;
    },

    /**
     * Sign in callback - can be used to restrict sign in
     * Returns true to allow sign in, false to deny
     */
    async signIn() {
      // Allow sign in for all configured OAuth providers
      // You can add custom validation here (e.g., only allow specific email domains)
      return true;
    },

    /**
     * Redirect callback - controls where user is redirected after sign in/out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    /**
     * Called when a new user is created via OAuth
     * Can be used to set default values or trigger welcome flows
     */
    async createUser({ user }) {
      console.log(`New user created via OAuth: ${user.email}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});

