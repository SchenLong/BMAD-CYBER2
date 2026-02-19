# Story 1.2: Authentication System - Core

**Status:** done
**Epic:** Epic 1 - Foundation & Authentication
**Story ID:** 1.2
**Story Key:** 1-2-authentication-system-core
**Dependencies:** Story 1.1 (Project Scaffold & Base Configuration)

---

## Story

**As a** User,
**I want** to sign in with email and password,
**So that** I can access my protected workspace securely.

---

## Acceptance Criteria

**Given** a new user on the login page
**When** entering valid email and password (min 12 chars, entropy check)
**Then** authenticate the user and create a session
**And** redirect to the dashboard
**And** store session in HttpOnly cookie with secure flag
**And** implement bcrypt with cost factor 12 for password hashing
**And** validate input with Zod schema
**And** show appropriate error messages for invalid credentials
**And** handle user registration with password validation

---

## Tasks / Subtasks

- [x] **Task 1: Database Schema Setup** (AC: Then - authenticate the user)
  - [x] Install Prisma ORM with SQLite adapter
  - [x] Create `prisma/schema.prisma` with User model
  - [x] Define UserRole enum (SUPERADMIN, ADMIN, USER, READONLY, API)
  - [x] Create Session model for session management
  - [x] Run initial Prisma migration
  - [x] Generate Prisma client

- [x] **Task 2: Password Security Implementation** (AC: And - bcrypt with cost factor 12)
  - [x] Install bcrypt package
  - [x] Create password hashing utility with cost factor 12
  - [x] Implement password validation (min 12 chars, entropy check)
  - [x] Create password verification utility
  - [x] Add unit tests for password utilities

- [x] **Task 3: Input Validation with Zod** (AC: And - validate input with Zod schema)
  - [x] Create login validation schema (email, password)
  - [x] Create registration validation schema (email, password, name)
  - [x] Implement custom password entropy validator
  - [x] Add email format validation
  - [x] Create shared validation types file

- [x] **Task 4: Authentication API Routes** (AC: Then - authenticate and create session)
  - [x] Create POST /api/auth/register endpoint
  - [x] Create POST /api/auth/login endpoint
  - [x] Create POST /api/auth/logout endpoint
  - [x] Create GET /api/auth/me endpoint (current user)
  - [x] Implement JWT generation with 15min access token
  - [x] Implement session storage in database

- [x] **Task 5: Session Management** (AC: And - store session in HttpOnly cookie)
  - [x] Configure HttpOnly, Secure, SameSite cookies
  - [x] Implement session creation on login
  - [x] Implement session validation on protected routes
  - [x] Implement session destruction on logout
  - [x] Add session middleware for route protection

- [x] **Task 6: Login UI Component** (AC: Given - login page)
  - [x] Create login page at `app/(auth)/login/page.tsx`
  - [x] Create registration page at `app/(auth)/register/page.tsx`
  - [x] Build login form with React Hook Form + Zod
  - [x] Build registration form with password confirmation
  - [x] Add form error handling and user feedback
  - [x] Implement client-side validation

- [x] **Task 7: Route Protection & Middleware** (AC: Then - redirect to dashboard)
  - [x] Create Next.js middleware for protected routes
  - [x] Implement redirect logic for unauthenticated users
  - [x] Protect dashboard routes
  - [x] Add redirect query parameter handling (return after login)
  - [x] Test authentication flow end-to-end

- [x] **Task 8: Testing & Verification** (All AC)
  - [x] Test user registration with valid data
  - [x] Test user registration with invalid password (too short)
  - [x] Test user registration with weak password (low entropy)
  - [x] Test login with valid credentials
  - [x] Test login with invalid credentials
  - [x] Verify session cookie is HttpOnly and Secure
  - [x] Verify redirect to dashboard after login
  - [x] Verify protected routes redirect to login
  - [x] Test logout clears session

## Review Follow-ups (AI Code Review)
All HIGH and MEDIUM issues from adversarial code review have been fixed:
- [x] **[AI-Review][HIGH]** Added unit tests for password utilities (`src/lib/__tests__/password.test.ts`)
- [x] **[AI-Review][HIGH]** Removed fallback secrets, added environment variable validation at module load
- [x] **[AI-Review][HIGH]** Added try/catch error handling in all session management functions
- [x] **[AI-Review][MEDIUM]** Implemented redirect query parameter handling in login page and LoginForm
- [x] **[AI-Review][LOW]** Changed cookie `secure` flag to always `true` (works on localhost in modern browsers)

---

## Dev Notes

### Architecture Patterns & Constraints

**Authentication Architecture (from [Security Deep Dive](../11-security-deep-dive.md#2-authentication-implementation)):**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Authentication Layer                                 │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                          Next.js Auth Middleware                          │  │
│  │  Route Protection → Session Validation → CSRF Checking                   │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        Authentication Providers                           │  │
│  │  Credentials (Local) │ OAuth (SSO/IdP) │ SAML (Enterprise)              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                          User Store (Database)                           │  │
│  │  Users table │ Accounts table │ Sessions table │ MFA factors           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Security Requirements:**
- **Password hashing**: bcrypt with cost factor 12 (per [Security Deep Dive](../11-security-deep-dive.md))
- **Session storage**: HttpOnly, Secure, SameSite cookies
- **JWT tokens**: 15min access token, 7-day refresh token (for future)
- **Input validation**: Zod schemas on ALL inputs
- **Minimum password length**: 12 characters
- **Password entropy check**: Validate password strength

### Project Structure Notes

**Database Files:**
```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Auto-generated migrations
└── seed.ts                # Optional: seed admin user
```

**Authentication Files:**
```
src/
├── lib/
│   └── auth/
│       ├── password.ts           # Password hashing/validation
│       ├── session.ts            # Session management
│       └── jwt.ts                # JWT token generation
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth layout (no header/footer)
│   ├── api/
│   │   └── auth/
│   │       ├── register/
│   │       │   └── route.ts
│   │       ├── login/
│   │       │   └── route.ts
│   │       ├── logout/
│   │       │   └── route.ts
│   │       └── me/
│   │           └── route.ts
│   └── (dashboard)/               # Protected routes
├── components/
│   └── forms/
│       ├── login-form.tsx
│       └── register-form.tsx
└── middleware.ts                  # Route protection
```

### Database Schema

**Prisma Schema (based on [Security Deep Dive](../11-security-deep-dive.md#22-database-schema-for-authentication)):**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPERADMIN
  ADMIN
  USER
  READONLY
  API
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionToken String   @unique
  expires      DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
}
```

**Note:** Future stories will add Accounts table (OAuth) and MFA factors table.

### Security Implementation Details

**Password Hashing (bcrypt cost factor 12):**
```typescript
// src/lib/auth/password.ts
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function calculatePasswordEntropy(password: string): number {
  // Implementation based on character set variety and length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length

  return password.length * Math.log2(variety * 10)
}
```

**Zod Validation Schemas:**
```typescript
// src/lib/auth/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .refine(
      (pwd) => calculatePasswordEntropy(pwd) >= 40,
      'Password is too weak. Use mix of letters, numbers, and symbols.'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

---

## Dev Agent Guardrails

### Technical Requirements

**Dependencies to Install:**
```bash
npm install prisma @prisma/client bcrypt
npm install @types/bcrypt --save-dev
```

**Prisma Setup Commands:**
```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

**Environment Variables (.env.example):**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here-change-in-production"
SESSION_SECRET="your-session-secret-here"
```

### Architecture Compliance

**Server Components vs Client Components:**
- Login/Register pages: **Server Components** (default)
- Forms: **Client Components** (need "use client" for React Hook Form)
- API routes: Server-side only

**Authentication Flow:**
1. User submits login form (client-side validation with Zod)
2. POST to /api/auth/login (server-side validation + bcrypt verify)
3. On success: create session, set HttpOnly cookie, return user data
4. Client redirects to dashboard
5. Middleware validates session on protected routes

**Session Management Pattern:**
- Use database-backed sessions (not just JWT)
- Store session token in HttpOnly cookie
- Validate session on each protected request
- Invalidate session on logout

### File Structure Requirements

**Must-Create Files:**
1. `prisma/schema.prisma` - Database schema
2. `src/lib/auth/password.ts` - Password utilities
3. `src/lib/auth/validation.ts` - Zod schemas
4. `src/lib/auth/session.ts` - Session management
5. `src/app/(auth)/login/page.tsx` - Login page
6. `src/app/(auth)/register/page.tsx` - Registration page
7. `src/app/api/auth/login/route.ts` - Login API
8. `src/app/api/auth/register/route.ts` - Register API
9. `src/app/api/auth/logout/route.ts` - Logout API
10. `src/middleware.ts` - Route protection

**Route Groups:**
- `(auth)` - Public authentication pages
- `(dashboard)` - Protected pages (requires auth)

### Testing Requirements

**Manual Testing Checklist:**
- [ ] Register new user with strong password → Success
- [ ] Register with password < 12 chars → Error
- [ ] Register with weak password → Error
- [ ] Register with existing email → Error
- [ ] Login with valid credentials → Success, redirect to dashboard
- [ ] Login with invalid credentials → Error message
- [ ] Logout → Cookie cleared, redirect to login
- [ ] Access protected route while logged out → Redirect to login
- [ ] Access protected route while logged in → Page loads
- [ ] Check session cookie in browser dev tools → HttpOnly, Secure flags set

**Security Verification:**
- [ ] Passwords are hashed (never stored in plain text)
- [ ] Cost factor is 12 (check bcrypt implementation)
- [ ] Session cookie is HttpOnly (not accessible via JavaScript)
- [ ] Session cookie is Secure (only sent over HTTPS in production)
- [ ] Session cookie has SameSite set (CSRF protection)
- [ ] Input validation prevents empty/null values
- [ ] Error messages don't leak sensitive information

---

## Previous Story Intelligence

**From Story 1.1 (Project Scaffold):**
- Next.js 15+ project with TypeScript, Tailwind CSS configured
- shadcn/ui base components (Button, Input, Card, Dialog) available
- Zustand and TanStack Query configured
- Enterprise folder structure created
- `.env.example` file exists

**Dependencies on Story 1.1:**
- Project structure must exist before adding authentication
- shadcn/ui components needed for forms
- Zustand stores available for auth state

---

## Project Context Reference

**From [Security Deep Dive](../11-security-deep-dive.md#2-authentication-implementation):**
- **bcrypt cost factor**: 12 for password hashing
- **Session timeout**: 15 minutes (Story 1.6 will implement sliding expiration)
- **JWT**: 15min access token, 7-day refresh token (future OAuth stories)
- **Password policy**: Min 12 chars, entropy check
- **Roles**: SUPERADMIN, ADMIN, USER, READONLY, API

**From [Architecture & Security](../02-architecture-security.md#4-authentication--authorization):**
- Zero-trust principles: verify every request
- HttpOnly cookies prevent XSS token theft
- Secure flag ensures HTTPS-only transmission
- Database-backed sessions enable revocation

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation Date:** 2026-02-15
**Code Review Date:** 2026-02-15

---

## References

**Source Documents:**
- [Security Deep Dive - Authentication Implementation](../11-security-deep-dive.md#2-authentication-implementation) - JWT, sessions, password hashing
- [Architecture & Security - Auth & Authorization](../02-architecture-security.md#4-authentication--authorization) - Auth flow diagram, RBAC
- [Technical Implementation - Frontend Architecture](../06-technical-implementation.md#3-front-end-architecture) - Server components, middleware
- [Story Implementation Steps](../story-implementation-steps.md#story-12-authentication-system---core) - Phase-by-phase implementation guide

**Story Breakdown Reference:**
- Epic 1: Foundation & Authentication - [epics.md#epic-1](../epics.md#epic-1-foundation--authentication)
- Story 1.2 Details - [epics.md#story-12-authentication-system---core](../epics.md#story-12-authentication-system---core)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (Implementation)

### Debug Log References
- Prisma 7 compatibility issues resolved by downgrading to Prisma 6.x
- Zod error property name changed from `errors` to `issues` in Zod 4.x

### Completion Notes List
- Installed Prisma 6.19.2 (downgraded from 7.x due to API changes)
- Created database schema with User and Session models in SQLite
- Implemented bcrypt password hashing with cost factor 12
- Created password entropy validation (minimum 40 bits)
- Implemented Zod validation schemas for login and registration
- Created authentication API endpoints: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
- Implemented session management with HttpOnly, Secure, SameSite cookies
- Created login and register pages with React Hook Form forms
- Implemented Next.js middleware for route protection
- Added shadcn/ui Label component for forms
- All acceptance criteria verified through manual testing
- Application builds successfully with no TypeScript errors
- **Code Review Fixes Applied (2026-02-15):**
  - Added unit tests for password utilities using Jest
  - Removed fallback secrets, added environment variable validation
  - Added comprehensive error handling in session management
  - Implemented redirect query parameter handling in login flow
  - Set cookie secure flag to always true

### File List
- team/bmad-web-ui/prisma/schema.prisma - Database schema with User and Session models
- team/bmad-web-ui/prisma/migrations/20260215212947_init/ - Initial database migration
- team/bmad-web-ui/src/lib/prisma.ts - Prisma client singleton
- team/bmad-web-ui/src/lib/auth/password.ts - Password hashing and validation utilities
- team/bmad-web-ui/src/lib/auth/validation.ts - Zod validation schemas
- team/bmad-web-ui/src/lib/auth/session.ts - Session management utilities (with error handling)
- team/bmad-web-ui/src/lib/__tests__/password.test.ts - Unit tests for password utilities
- team/bmad-web-ui/src/app/api/auth/register/route.ts - Registration endpoint
- team/bmad-web-ui/src/app/api/auth/login/route.ts - Login endpoint
- team/bmad-web-ui/src/app/api/auth/logout/route.ts - Logout endpoint
- team/bmad-web-ui/src/app/api/auth/me/route.ts - Current user endpoint
- team/bmad-web-ui/src/app/(auth)/login/page.tsx - Login page with redirect handling
- team/bmad-web-ui/src/app/(auth)/register/page.tsx - Registration page
- team/bmad-web-ui/src/app/(dashboard)/dashboard/page.tsx - Protected dashboard page
- team/bmad-web-ui/src/components/forms/login-form.tsx - Login form component with redirectUrl prop
- team/bmad-web-ui/src/components/forms/register-form.tsx - Registration form component
- team/bmad-web-ui/src/components/ui/label.tsx - shadcn/ui Label component
- team/bmad-web-ui/src/middleware.ts - Route protection middleware
- team/bmad-web-ui/src/app/page.tsx - Updated landing page
- team/bmad-web-ui/jest.config.json - Jest test configuration
- team/bmad-web-ui/.env.example - Updated with DATABASE_URL, JWT_SECRET, SESSION_SECRET
- team/bmad-web-ui/.gitignore - Updated to ignore database files
- team/bmad-web-ui/package.json - Added prisma, bcrypt, jsonwebtoken, cookie, jest dependencies
