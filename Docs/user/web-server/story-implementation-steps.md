# BMAD Web Server - Story Implementation Steps

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2026-02-15
**Author:** Bob (Scrum Master)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [Pre-Implementation Checklist](#pre-implementation-checklist) | 23-55 | Standard checks before starting any story |
| [Epic 1: Foundation & Authentication](#epic-1-foundation--authentication) | 59-240 | 6 stories with detailed steps |
| [Epic 2: Abdul-Guided Interface](#epic-2-abdul-guided-interface) | 244-420 | 6 stories with detailed steps |
| [Epic 3: Team & Agent Selection](#epic-3-team--agent-selection) | 424-540 | 4 stories with detailed steps |
| [Epic 4: Real-Time Observability](#epic-4-real-time-observability) | 544-680 | 4 stories with detailed steps |
| [Epic 5: CLI Bridge Integration](#epic-5-cli-bridge-integration) | 684-890 | 5 stories with detailed steps |
| [Epic 6: Project Management System](#epic-6-project-management-system) | 894-1340 | 10 stories with detailed steps |
| [Epic 7: Enterprise Templates](#epic-7-enterprise-templates) | 1344-1510 | 5 stories with detailed steps |
| [Epic 8: API & Developer Experience](#epic-8-api--developer-experience) | 1514-1700 | 5 stories with detailed steps |
| [Epic 9: Security Hardening](#epic-9-security-hardening) | 1704-1940 | 7 stories with detailed steps |

---

## Pre-Implementation Checklist

**Before starting ANY story, complete these checks:**

- [ ] **Refer to `team/lessonslearned.md`** - Check if it exists, review past lessons
- [ ] **Verify current repo state** - Ensure clean working directory
- [ ] **Load ONLY necessary context** - For the story/task from working document
- [ ] **Use 3+ agents/subagents in parallel** - Fresh context windows, no timeout
- [ ] **Plan parallel execution** - Agents should ONLY research/gather info
- [ ] **Test after implementation** - Never close a task without testing
- [ ] **Review dependencies** - Check if paths/imports need updating
- [ ] **Update working document** - At the end of each task
- [ ] **100% pass rate required** - All security issues addressed before closing
- [ ] **File placement** - Create in final folder or move upon creation
- [ ] **Update /Docs** - After closing task if relevant
- [ ] **Run security scan** - Before committing
- [ ] **Announce next step** - When finished

---

## Epic 1: Foundation & Authentication ✅ COMPLETE

**All 6 stories completed**

### Story 1.1: Project Scaffold & Base Configuration

**Story ID:** `1-1-project-scaffold-base-configuration`
**Status:** ✅ done
**Dependencies:** None
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Project Initialization**
1. Create Next.js 15+ project with TypeScript, Tailwind CSS, ESLint, src-directory
2. Initialize shadcn/ui with base components (Button, Input, Card, Modal)
3. Install additional dependencies:
   ```bash
   npm install zustand @tanstack/react-query zod react-hook-form @hookform/resolvers
   npm install execa
   npm install -D @types/node
   ```
4. Set up environment variables pattern with `.env.example`

**Phase 2: Folder Structure**
1. Create enterprise-grade folder structure per [06-technical-implementation.md](team/bmad-web-server/06-technical-implementation.md#2-project-structure):
   ```
   src/
   ├── app/
   │   ├── (auth)/
   │   ├── (dashboard)/
   │   ├── (install)/
   │   ├── api/
   │   ├── layout.tsx
   │   └── page.tsx
   ├── components/
   │   ├── ui/
   │   ├── forms/
   │   ├── features/
   │   ├── layout/
   │   └── providers/
   ├── lib/
   ├── hooks/
   ├── stores/
   └── styles/
   ```

**Phase 3: Base Configuration**
1. Configure Zustand for client state management
2. Set up TanStack Query provider
3. Configure Tailwind CSS with custom theme variables per [05-ui-design-system.md](team/bmad-web-server/05-ui-design-system.md)
4. Create base layout with theme provider

**Phase 4: Verification**
1. Run `npm run dev` - verify server starts
2. Verify shadcn components render correctly
3. Test Tailwind styling works
4. Check TypeScript compilation
5. Run `npm run build` - verify build succeeds

**Acceptance Criteria Verification:**
- [ ] Next.js 15+ project with TypeScript, Tailwind, ESLint, src-dir created
- [ ] shadcn/ui base components configured
- [ ] Enterprise folder structure created
- [ ] Zustand and TanStack Query configured
- [ ] .env.example file created
- [ ] Dev server runs without errors
- [ ] Build completes successfully

---

### Story 1.2: Authentication System - Core

**Story ID:** `1-2-authentication-system-core`
**Status:** backlog
**Dependencies:** Story 1.1

#### Implementation Steps

**Phase 1: Database Setup**
1. Set up Prisma with SQLite per [02-architecture-security.md](team/bmad-web-server/02-architecture-security.md#3-database-schema)
2. Create User model in schema.prisma:
   ```prisma
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

   enum UserRole {
     SUPERADMIN
     ADMIN
     USER
     READONLY
     API
   }
   ```

**Phase 2: Password Hashing**
1. Implement bcrypt with cost factor 12 per [11-security-deep-dive.md](team/bmad-web-server/11-security-deep-dive.md)
2. Create password validation:
   - Minimum 12 characters
   - Entropy check
3. Create password hash utility functions

**Phase 3: Authentication API**
1. Create `/api/auth/register` endpoint
2. Create `/api/auth/login` endpoint
3. Implement JWT with 15min access token per [11-security-deep-dive.md](team/bmad-web-server/11-security-deep-dive.md#2-authentication-implementation)
4. Store session in HttpOnly cookie with secure flag

**Phase 4: Login UI**
1. Create login page at `/app/(auth)/login/page.tsx`
2. Create login form with validation using Zod schema
3. Implement error handling and user feedback

**Phase 5: Verification**
1. Test user registration
2. Test login with valid credentials
3. Test login with invalid credentials
4. Verify session cookie is set correctly
5. Test redirect to dashboard after login

**Acceptance Criteria Verification:**
- [ ] Users can register with email/password
- [ ] Passwords hashed with bcrypt cost 12
- [ ] Input validated with Zod schema
- [ ] Session stored in HttpOnly cookie
- [ ] Redirect to dashboard after successful login
- [ ] Invalid credentials show appropriate error

---

### Story 1.3: Authentication - OAuth Providers

**Story ID:** `1-3-authentication-oauth-providers`
**Status:** backlog
**Dependencies:** Story 1.2

#### Implementation Steps

**Phase 1: Auth.js Setup**
1. Install Auth.js (NextAuth)
2. Configure Auth.js with Google and GitHub providers
3. Update User model to include OAuth accounts

**Phase 2: OAuth Configuration**
1. Set up environment variables for OAuth credentials
2. Configure OAuth providers in Auth.js config
3. Implement account linking (OAuth to existing accounts)

**Phase 3: OAuth Flow**
1. Create OAuth callback handler
2. Implement user profile data extraction
3. Create or link user accounts on callback

**Phase 4: UI Integration**
1. Add "Sign in with Google" button to login page
2. Add "Sign in with GitHub" button to login page
3. Style OAuth buttons to match design system

**Phase 5: Verification**
1. Test Google OAuth flow end-to-end
2. Test GitHub OAuth flow end-to-end
3. Verify account creation/linking works
4. Test session establishment after OAuth

**Acceptance Criteria Verification:**
- [ ] Google OAuth redirects correctly
- [ ] GitHub OAuth redirects correctly
- [ ] User account created/linked on callback
- [ ] Authenticated session established
- [ ] Auth.js properly configured

---

### Story 1.4: Authentication - Multi-Factor Auth

**Story ID:** `1-4-authentication-multi-factor-auth`
**Status:** backlog
**Dependencies:** Story 1.2

#### Implementation Steps

**Phase 1: TOTP Setup**
1. Install TOTP library (e.g., otplib)
2. Add MFA fields to User model (mfaEnabled, mfaSecret, recoveryCodes)
3. Create MFA setup API endpoint

**Phase 2: MFA Registration**
1. Create TOTP secret generation
2. Generate QR code for Google Authenticator
3. Implement TOTP verification during setup
4. Generate recovery codes

**Phase 3: MFA Enforcement**
1. Update login flow to check MFA status
2. Create MFA verification page
3. Implement optional vs mandatory MFA per deployment

**Phase 4: Recovery**
1. Implement recovery code verification
2. Create recovery flow interface
3. Handle recovery code regeneration

**Phase 5: Verification**
1. Test MFA setup flow
2. Test login with MFA enabled
3. Test login with recovery codes
4. Verify MFA bypassed when disabled

**Acceptance Criteria Verification:**
- [ ] TOTP secret generated with QR code
- [ ] User can successfully enter valid TOTP code
- [ ] MFA required on subsequent logins when enabled
- [ ] Recovery codes provided and functional
- [ ] MFA optional for Community, mandatory for Enterprise

---

### Story 1.5: Role-Based Access Control (RBAC)

**Story ID:** `1-5-role-based-access-control-rbac`
**Status:** backlog
**Dependencies:** Story 1.2

#### Implementation Steps

**Phase 1: RBAC Data Model**
1. Define 5 roles: SuperAdmin, Admin, User, ReadOnly, API
2. Create permissions matrix per [11-security-deep-dive.md](team/bmad-web-server/11-security-deep-dive.md#3-authorization-model-rbac)
3. Store role in JWT access token

**Phase 2: Authorization Middleware**
1. Create authorization middleware for protected routes
2. Implement role hierarchy enforcement
3. Create permission checker utility functions

**Phase 3: Role Management**
1. Create role assignment API (admin only)
2. Create role update functionality
3. Implement API role with rate-limited access

**Phase 4: UI for Role Management**
1. Create user management page for admins
2. Add role assignment dropdown
3. Display current roles in user list

**Phase 5: Verification**
1. Test role assignment
2. Test role hierarchy enforcement
3. Test API role rate limits
4. Verify unauthorized access blocked

**Acceptance Criteria Verification:**
- [ ] 5 roles defined and enforced
- [ ] Role hierarchy enforced (SuperAdmin > Admin > User > ReadOnly)
- [ ] API role has rate-limited access
- [ ] Authorization middleware works on protected routes
- [ ] Role stored in JWT token

---

### Story 1.6: Session Management

**Story ID:** `1-6-session-management`
**Status:** backlog
**Dependencies:** Story 1.2, Story 1.5

#### Implementation Steps

**Phase 1: Session Data Model**
1. Create Session model in Prisma schema
2. Implement sliding session expiration (15 minutes)
3. Create refresh token with 7-day expiry

**Phase 2: Session Handling**
1. Create session creation on login
2. Implement session refresh endpoint
3. Create session revocation on logout
4. Support concurrent session limits

**Phase 3: Middleware**
1. Create session validation middleware
2. Implement session timeout logic
3. Handle expired sessions gracefully

**Phase 4: UI**
1. Create logout button in header
2. Add session timeout warning (optional)
3. Implement "keep alive" functionality

**Phase 5: Verification**
1. Test session creation and storage
2. Test session timeout after 15 minutes inactivity
3. Test session refresh works correctly
4. Test logout revokes session
5. Test concurrent session limits

**Acceptance Criteria Verification:**
- [ ] 15-minute session timeout with sliding expiration
- [ ] 7-day refresh token in HttpOnly cookie
- [ ] Session revoked on logout
- [ ] Concurrent session limits enforced
- [ ] Session database table for revocation

---

## Epic 2: Abdul-Guided Interface ✅ COMPLETE

**All 6 stories completed on 2026-02-16**

### Story 2.1: Role-Based Onboarding Wizard

**Story ID:** `2-1-role-based-onboarding-wizard`
**Status:** ✅ done
**Dependencies:** Epic 1
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Onboarding Data Model**
1. Add `role` and `onboardingCompleted` fields to User model
2. Define 4 personas: Solo Operator, Team Lead, Executive, Developer
3. Create role configuration file

**Phase 2: Onboarding Wizard Component**
1. Create multi-step wizard component
2. Design 4 role cards with icons and descriptions
3. Implement skip functionality (defaults to Solo Operator)

**Phase 3: Role Storage**
1. Create API endpoint to store user's selected role
2. Update user profile when role selected
3. Configure interface based on role selection

**Phase 4: Routing**
1. Detect new users (onboarding not complete)
2. Redirect to onboarding wizard for new users
3. Redirect to dashboard after completion

**Phase 5: Verification**
1. Test onboarding flow for each role
2. Test skip functionality
3. Verify role stored correctly
4. Test re-onboarding not forced

**Acceptance Criteria Verification:**
- [ ] 4 role cards displayed (Solo Operator, Team Lead, Executive, Developer)
- [ ] Each card shows relevant description and icon
- [ ] User can skip onboarding
- [ ] Role stored in user profile
- [ ] Interface configured based on selection

---

### Story 2.2: Abdul Welcome Screen

**Story ID:** `2-2-abdul-welcome-screen`
**Status:** ✅ done
**Dependencies:** Story 2.1
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Abdul Character**
1. Create Abdul avatar/image asset
2. Define Abdul's personality and tone per [01-vision-and-scope.md](team/bmad-web-server/01-vision-and-scope.md)
3. Create role-specific greeting messages

**Phase 2: Welcome Dashboard**
1. Create dashboard page with Abdul greeting
2. Display user's name in personalized greeting
3. Show 3 role-configured quick action buttons
4. Display recent projects for quick resume

**Phase 3: Chat Interface**
1. Create conversational input field
2. Implement message submission handler
3. Store conversation context

**Phase 4: Role Configuration**
1. Define quick actions for each role per [03-ux-design.md](team/bmad-web-server/03-ux-design.md)
2. Implement role-based quick action display
3. Configure Abdul's tone per role

**Phase 5: Verification**
1. Test welcome screen for each role
2. Verify quick actions match role
3. Test chat input submission
4. Verify recent projects displayed

**Acceptance Criteria Verification:**
- [ ] Abdul's avatar and personalized greeting displayed
- [ ] 3 role-configured quick action buttons
- [ ] Recent projects shown for quick resume
- [ ] Conversational input field functional
- [ ] Abdul's message follows role-appropriate tone

---

### Story 2.3: Progressive Disclosure - Layer 1 to 2

**Story ID:** `2-3-progressive-disclosure-layer-1-to-2`
**Status:** ✅ done
**Dependencies:** Story 2.2
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Layer State Management**
1. Create disclosure layer state store (Zustand)
2. Define 4 layers: Welcome, Guidance, Expert Selection, Power User
3. Implement layer transition logic

**Phase 2: Chat Interface Enhancement**
1. Implement Abdul's clarifying questions
2. Create suggested response buttons
3. Maintain conversation context in state

**Phase 3: Layer 2 - Guidance**
1. Create team/workflow suggestion cards
2. Implement transition from Layer 1 to Layer 2
3. Design Guidance layout per [03-ux-design.md](team/bmad-web-server/03-ux-design.md#4-progressive-disclosure-layers)

**Phase 4: Navigation**
1. Implement return to Layer 1 functionality
2. Create breadcrumb/back navigation
3. Maintain state during transitions

**Phase 5: Verification**
1. Test chat engagement triggers layer transition
2. Verify clarifying questions shown
3. Test suggested responses work
4. Test return to Layer 1

**Acceptance Criteria Verification:**
- [ ] Abdul asks clarifying questions based on input
- [ ] Suggested responses displayed as clickable buttons
- [ ] Transitions to Layer 2 with team/workflow suggestions
- [ ] Conversation context maintained
- [ ] Return to Layer 1 available

---

### Story 2.4: Progressive Disclosure - Layer 3

**Story ID:** `2-4-progressive-disclosure-layer-3`
**Status:** ✅ completed
**Dependencies:** Story 2.3
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Team Selection in Layer 2**
1. Add team selection to suggested responses
2. Create "I want to work with X Team" options

**Phase 2: Agent Roster (Layer 3)**
1. Create agent roster component
2. Display agent cards with expertise descriptions
3. Implement direct agent selection
4. Add "Advanced" mode toggle

**Phase 3: User Preference Storage**
1. Store user's preference for direct selection
2. Remember "Advanced" mode toggle state
3. Update user profile with preferences

**Phase 4: Integration**
1. Connect team selection to agent roster
2. Implement smooth Layer 2 → Layer 3 transition
3. Maintain conversation context

**Phase 5: Verification**
1. Test team selection from Layer 2
2. Verify agent roster displays for selected team
3. Test direct agent selection
4. Verify "Advanced" toggle stored

**Acceptance Criteria Verification:**
- [ ] Agent roster displayed for selected team
- [ ] Agent cards show expertise descriptions
- [ ] Direct agent selection works
- [ ] "Advanced" mode toggle enables Layer 4
- [ ] User preference stored

---

### Story 2.5: Progressive Disclosure - Layer 4 (Power User)

**Story ID:** `2-5-progressive-disclosure-layer-4-power-user`
**Status:** ✅ done
**Dependencies:** Story 2.4
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Layer 4 Components**
1. Create full workflow picker with search
2. Implement direct agent invocation by name/ID
3. Add terminal emulator component (read-only)
4. Create API key generation interface

**Phase 2: Opt-in Settings**
1. Add "Advanced Mode" setting to user preferences
2. Create settings page
3. Implement opt-in toggle

**Phase 3: Workflow Picker**
1. Create searchable workflow list
2. Implement workflow execution from picker
3. Add workflow descriptions

**Phase 4: API Key Interface**
1. Create API key management UI
2. Implement key generation and display
3. Add key revocation functionality

**Phase 5: Verification**
1. Test Layer 4 access via opt-in
2. Verify workflow picker functional
3. Test direct agent invocation
4. Test terminal emulator displays
5. Test API key generation

**Acceptance Criteria Verification:**
- [ ] Full workflow picker with search displayed
- [ ] Direct agent invocation by name/ID works
- [ ] Terminal emulator accessible (read-only)
- [ ] API key generation available
- [ ] Layer 4 opt-in via settings

---

### Story 2.6: Role-Configured Navigation

**Story ID:** `2-6-role-configured-navigation`
**Status:** ✅ done
**Dependencies:** Story 2.1
**Completed:** 2026-02-16

#### Implementation Steps

**Phase 1: Navigation Configuration**
1. Define navigation items per role:
   - Team Lead: Dashboard, Projects, Team, Reports, Templates, Settings
   - Executive: Executive Summary, Briefs, Risks, Settings
   - Developer: API Docs, API Keys, Explorer, CLI, Webhooks
2. Create role navigation config file

**Phase 2: Navigation Component**
1. Create adaptive navigation component
2. Implement role-based menu rendering
3. Add active state highlighting

**Phase 3: Dynamic Updates**
1. Implement navigation update on role change
2. Create smooth transitions
3. Handle role changes gracefully

**Phase 4: Layout Integration**
1. Integrate navigation into main layout
2. Implement collapsible sidebar
3. Add mobile responsiveness

**Phase 5: Verification**
1. Test navigation for each role
2. Verify correct items displayed per role
3. Test role change updates navigation
4. Test mobile view

**Acceptance Criteria Verification:**
- [ ] Team Lead sees correct navigation items
- [ ] Executive sees correct navigation items
- [ ] Developer sees correct navigation items
- [ ] Navigation adapts dynamically when role changes

---

## Epic 3: Team & Agent Selection

### Story 3.1: Team Selection Cards

**Story ID:** `3-1-team-selection-cards`
**Status:** backlog
**Dependencies:** Epic 1, Epic 2

#### Implementation Steps

**Phase 1: Team Data**
1. Create team configuration with:
   - Intel Team (Sky 500)
   - Security Team (Red 500)
   - Strategic Team (Amber 500)
2. Include agent count and expertise description

**Phase 2: Team Card Component**
1. Create TeamCard component with:
   - Team name and icon
   - Agent count
   - Expertise description
   - Team-specific color styling

**Phase 3: Grid Layout**
1. Implement responsive grid layout
2. Add hover effects and transitions
3. Ensure proper spacing

**Phase 4: Navigation**
1. Implement click handler to navigate to agent roster
2. Pass selected team to roster page
3. Add "Back to Teams" navigation

**Phase 5: Verification**
1. Test all team cards display correctly
2. Verify team-specific colors applied
3. Test navigation to agent roster
4. Test responsive layout

**Acceptance Criteria Verification:**
- [ ] Cards for Intel Team, Security Team, Strategic Team shown
- [ ] Each card shows name, icon, agent count, expertise description
- [ ] Team-specific colors applied
- [ ] Click navigates to agent roster
- [ ] Legal Team accessible via Abdul (not primary card)

---

### Story 3.2: Agent Roster Display

**Story ID:** `3-2-agent-roster-display`
**Status:** backlog
**Dependencies:** Story 3.1

#### Implementation Steps

**Phase 1: Agent Data**
1. Create agent registry with all team agents
2. Include name, role/title, description for each agent
3. Organize by team

**Phase 2: Agent Card Component**
1. Create AgentCard component with:
   - Agent name and role/title
   - Brief description
   - "View Profile" button
   - "Start Conversation" button

**Phase 3: Roster Page**
1. Create team-specific roster page
2. Display all team agents in grid/list
3. Add search and filter by expertise
4. Show agent count header

**Phase 4: Search & Filter**
1. Implement search functionality
2. Create filter by expertise
3. Add real-time filtering

**Phase 5: Verification**
1. Test roster for each team
2. Verify all agents displayed
3. Test search functionality
4. Test filter functionality
5. Test "Back to Teams" navigation

**Acceptance Criteria Verification:**
- [ ] All team agents displayed with profile cards
- [ ] Each card shows name, role/title, description
- [ ] "View Profile" and "Start Conversation" buttons work
- [ ] Search and filter by expertise functional
- [ ] Agent count displayed
- [ ] "Back to Teams" navigation works

---

### Story 3.3: Agent Profile View

**Story ID:** `3-3-agent-profile-view`
**Status:** backlog
**Dependencies:** Story 3.2

#### Implementation Steps

**Phase 1: Agent Profile Data**
1. Create detailed agent profiles with:
   - Full description
   - Expertise areas
   - Typical use cases
   - Related agents
   - Common workflows

**Phase 2: Profile Page**
1. Create agent detail page
2. Display all profile information
3. Add related agents section
4. Include "Start Conversation" CTA

**Phase 3: Layout**
1. Design profile layout per [05-ui-design-system.md](team/bmad-web-server/05-ui-design-system.md)
2. Add expandable sections
3. Implement smooth scrolling

**Phase 4: Integration**
1. Link from agent roster cards
2. Add breadcrumbs navigation
3. Implement back navigation

**Phase 5: Verification**
1. Test profile view for different agents
2. Verify all information displayed
3. Test "Start Conversation" button
4. Test related agents links

**Acceptance Criteria Verification:**
- [ ] Detailed profile with full description shown
- [ ] Expertise areas and typical use cases displayed
- [ ] Workflows this agent participates in listed
- [ ] Related agents shown for cross-reference
- [ ] "Start Conversation" call-to-action works

---

### Story 3.4: Team-Based Workflows

**Story ID:** `3-4-team-based-workflows`
**Status:** backlog
**Dependencies:** Story 3.1

#### Implementation Steps

**Phase 1: Workflow Data**
1. Create workflow registry with team associations
2. Include workflow descriptions and use cases
3. Tag by complexity level

**Phase 2: Workflow List Component**
1. Create workflow list for selected team
2. Display all team-specific workflows
3. Show descriptions and use cases

**Phase 3: Workflow Interaction**
1. Implement one-click workflow initiation
2. Add workflow execution handler
3. Create workflow confirmation modal

**Phase 4: Filter & Search**
1. Add complexity level filter
2. Implement workflow search
3. Create sort options

**Phase 5: Verification**
1. Test workflow list for each team
2. Verify only team-specific workflows shown
3. Test one-click workflow initiation
4. Test filters and search

**Acceptance Criteria Verification:**
- [ ] All team-specific workflows displayed
- [ ] Workflow descriptions and use cases shown
- [ ] One-click workflow initiation works
- [ ] Filter by complexity level functional
- [ ] Workflow search functional

---

## Epic 4: Real-Time Observability

### Story 4.1: SSE Infrastructure

**Story ID:** `4-1-sse-infrastructure`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: SSE API Route**
1. Create `/app/api/agents/[id]/observe/route.ts`
2. Set content-type to `text/event-stream`
3. Set runtime to 'nodejs'

**Phase 2: Connection Management**
1. Implement Map of active connections
2. Create connection lifecycle handlers
3. Add keep-alive messages every 30 seconds

**Phase 3: Event Streaming**
1. Implement event data structure
2. Create event broadcasting function
3. Handle client disconnect gracefully

**Phase 4: Testing**
1. Test SSE endpoint connects
2. Verify keep-alive messages sent
3. Test client disconnect handling

**Acceptance Criteria Verification:**
- [ ] `/api/agents/:id/observe` endpoint created
- [ ] Content-type set to text/event-stream
- [ ] Connection management with Map implemented
- [ ] Keep-alive messages every 30 seconds
- [ ] Client disconnect handled gracefully
- [ ] Runtime set to 'nodejs'

---

### Story 4.2: Agent Progress Events

**Story ID:** `4-2-agent-progress-events`
**Status:** backlog
**Dependencies:** Story 4.1

#### Implementation Steps

**Phase 1: Event Types**
1. Define event types: step_start, step_complete, step_error, message, done
2. Create event data structure:
   ```typescript
   {
     agentId, agentName, step, progress (0-100), estimatedRemaining
   }
   ```

**Phase 2: Event Emission**
1. Implement event emission during agent execution
2. Create step event generator
3. Add error event handling

**Phase 3: SSE Formatting**
1. Format events as SSE data lines
2. Add human-readable step descriptions
3. Include error details and recovery suggestions

**Phase 4: Integration**
1. Connect event emitter to SSE endpoint
2. Test event streaming
3. Verify event completeness

**Acceptance Criteria Verification:**
- [ ] Event types: step_start, step_complete, step_error, message, done defined
- [ ] Events include agentId, agentName, step, progress, estimatedRemaining
- [ ] Events formatted as SSE data lines
- [ ] Step events include human-readable descriptions
- [ ] Error events include details and recovery suggestions

---

### Story 4.3: Progress Visualization UI

**Story ID:** `4-3-progress-visualization-ui`
**Status:** backlog
**Dependencies:** Story 4.2

#### Implementation Steps

**Phase 1: Progress Component**
1. Create AgentProgress component
2. Display agent name and "is working..." status
3. Add timeline of completed/pending steps

**Phase 2: Progress Bar**
1. Implement progress percentage bar
2. Add smooth animations
3. Show estimated time remaining

**Phase 3: Live Output**
1. Create collapsible "Live Output" section
2. Display detailed logs
3. Implement auto-scroll

**Phase 4: Controls**
1. Add "Pause" button
2. Add "Cancel Operation" button
3. Implement control handlers

**Phase 5: Styling**
1. Style per [05-ui-design-system.md](team/bmad-web-server/05-ui-design-system.md)
2. Add animations and transitions
3. Ensure accessibility

**Acceptance Criteria Verification:**
- [ ] Agent name and status displayed
- [ ] Timeline with checkmarks shown
- [ ] Progress percentage bar functional
- [ ] Estimated time remaining displayed
- [ ] Collapsible Live Output section works
- [ ] Pause and Cancel buttons functional

---

### Story 4.4: Client-Side SSE Hook

**Story ID:** `4-4-client-side-sse-hook`
**Status:** backlog
**Dependencies:** Story 4.1

#### Implementation Steps

**Phase 1: Hook Structure**
1. Create `useAgentStream` hook
2. Accept agentId parameter
3. Return output array, isStreaming boolean, error string

**Phase 2: EventSource Management**
1. Implement EventSource creation
2. Handle connection lifecycle
3. Manage cleanup on unmount

**Phase 3: Event Handling**
1. Parse SSE events
2. Update output array
3. Handle connection errors

**Phase 4: Cancel Callback**
1. Implement cancel function
2. Close EventSource on cancel
3. Clean up resources

**Phase 5: Server Component Support**
1. Create client wrapper component
2. Enable use with Server Components
3. Test integration

**Acceptance Criteria Verification:**
- [ ] Hook accepts agentId parameter
- [ ] Returns output array, isStreaming boolean, error string
- [ ] EventSource lifecycle managed correctly
- [ ] Connection errors handled gracefully
- [ ] Cancel callback terminates stream
- [ ] Works with Client and Server Components

---

## Epic 5: CLI Bridge Integration

### Story 5.1: Command Whitelist System

**Story ID:** `5-1-command-whitelist-system`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Whitelist Configuration**
1. Create ALLOWED_COMMANDS configuration:
   ```typescript
   {
     mission.list: { command: 'bmad', args: ['list', 'missions'], timeout: 30000, roles: ['user', 'admin'] },
     mission.create: { command: 'bmad', args: ['mission', 'create'], timeout: 60000, roles: ['user', 'admin'] },
     agent.invoke: { command: 'bmad', args: ['invoke'], timeout: 300000, roles: ['user', 'admin'] }
   }
   ```

**Phase 2: Validation**
1. Create command validation function
2. Check against whitelist
3. Validate user roles against command requirements

**Phase 3: Error Handling**
1. Return 404 for non-whitelisted commands
2. Return 403 for insufficient permissions
3. Add detailed error messages

**Phase 4: Logging**
1. Log all command attempts to audit trail
2. Include user, command, IP, timestamp
3. Log both allowed and blocked attempts

**Phase 5: Verification**
1. Test whitelisted commands execute
2. Test non-whitelisted commands blocked
3. Test role enforcement

**Acceptance Criteria Verification:**
- [ ] ALLOWED_COMMANDS configuration created
- [ ] Each entry specifies command, args, timeout, roles
- [ ] Non-whitelisted commands return 404
- [ ] User roles validated against requirements
- [ ] All attempts logged to audit trail

---

### Story 5.2: Safe Process Spawning

**Story ID:** `5-2-safe-process-spawning`
**Status:** backlog
**Dependencies:** Story 5.1

#### Implementation Steps

**Phase 1: Process Manager**
1. Create executeCliCommand function
2. Use spawn() with shell: false (CRITICAL)
3. Pass args as array, not concatenated string

**Phase 2: Configuration**
1. Set process timeout from whitelist
2. Configure stdio for pipe capture
3. Set environment variables

**Phase 3: Output Capture**
1. Capture stdout separately
2. Capture stderr separately
3. Return CliResult object

**Phase 4: Error Handling**
1. Handle process errors gracefully
2. Return exit codes
3. Add timeout handling

**Phase 5: Verification**
1. Test command execution
2. Verify shell: false prevents injection
3. Test timeout handling

**Acceptance Criteria Verification:**
- [ ] spawn() used with shell: false
- [ ] Args passed as array
- [ ] Process timeout set from config
- [ ] Stdout and stderr captured separately
- [ ] CliResult with stdout, stderr, exitCode returned
- [ ] Process errors handled gracefully

---

### Story 5.3: CLI Output Streaming

**Story ID:** `5-3-cli-output-streaming`
**Status:** ✅ done
**Dependencies:** Story 5.2
**Completed:** 2026-02-17

#### Implementation Steps

**Phase 1: SSE Streaming Endpoint**
1. Create `/app/api/cli/stream/route.ts` ✅
2. Set runtime to 'nodejs' ✅
3. Set headers for SSE ✅

**Phase 2: Stream Processing**
1. Stream stdout via SSE ✅
2. Stream stderr via SSE ✅
3. Split output by lines ✅
4. Differentiate stdout from stderr in event type ✅

**Phase 3: Completion**
1. Send 'completed' event on process completion ✅
2. Include exit code in done event ✅
3. Close stream properly ✅

**Phase 4: Disconnect Handling**
1. Listen for client abort ✅
2. Kill process on disconnect ✅
3. Clean up resources ✅

**Phase 5: Verification**
1. Test stdout streaming ⏳ (Manual testing required)
2. Test stderr streaming ⏳ (Manual testing required)
3. Test client disconnect handling ⏳ (Manual testing required)
4. Verify TypeScript compilation ✅
5. Verify build succeeds ✅

**Acceptance Criteria Verification:**
- [x] Stdout streamed via SSE
- [x] Stderr streamed via SSE
- [x] Output split by lines as individual events
- [x] Stdout/stderr differentiated in event type (combined in 'output' event)
- [x] 'completed' event sent on completion with exit code
- [x] Client disconnect kills process

**Code Review Findings:**
- AC updated to reflect 'completed' event type (was 'done' in original spec)
- Manual testing tasks marked as incomplete (no automated tests yet)
- Action item added for automated tests

---

### Story 5.4: Terminal Emulator Component

**Story ID:** `5-4-terminal-emulator-component`
**Status:** backlog
**Dependencies:** Story 5.3

#### Implementation Steps

**Phase 1: Terminal Component**
1. Create Terminal component (optional xterm.js)
2. Style with dark theme and monospace font
3. Set up terminal dimensions

**Phase 2: Command Display**
1. Display equivalent CLI command (e.g., `$ bmad invoke...`)
2. Stream command output in real-time
3. Format output for readability

**Phase 3: Controls**
1. Add "Copy Command" button
2. Add "Download as Script" button
3. Implement read-only mode (Phase 1)

**Phase 4: Styling**
1. Apply dark theme per [05-ui-design-system.md](team/bmad-web-server/05-ui-design-system.md)
2. Use JetBrains Mono font
3. Add proper spacing

**Phase 5: Verification**
1. Test command display
2. Test output streaming
3. Test copy functionality

**Acceptance Criteria Verification:**
- [ ] CLI command displayed (e.g., "$ bmad invoke...")
- [ ] Output streamed in real-time
- [ ] Dark theme with monospace font
- [ ] "Copy Command" button works
- [ ] "Download as Script" button works
- [ ] Read-only mode implemented

---

### Story 5.5: CLI Bridge Security Middleware

**Story ID:** `5-5-cli-bridge-security-middleware`
**Status:** backlog
**Dependencies:** Story 5.1

#### Implementation Steps

**Phase 1: Authentication Middleware**
1. Validate JWT bearer token
2. Extract user and roles from token
3. Return 401 for missing auth

**Phase 2: Rate Limiting**
1. Enforce 20 commands per minute per user
2. Implement rate limiting storage
3. Return 429 with Retry-After header

**Phase 3: Authorization**
1. Check user's role against command's required roles
2. Return 403 for insufficient permissions

**Phase 4: Audit Logging**
1. Log all CLI invocations
2. Include user, command, IP, timestamp
3. Store in audit trail

**Phase 5: Verification**
1. Test authentication required
2. Test rate limiting enforced
3. Test role authorization

**Acceptance Criteria Verification:**
- [ ] JWT bearer token validated
- [ ] Rate limit: 20 commands/minute per user
- [ ] User role checked against command requirements
- [ ] All CLI invocations logged
- [ ] 401 for missing auth, 403 for insufficient permissions, 429 for rate limit

---

## Epic 6: Project Management System

### Story 6.1: Project Data Model & Database

**Story ID:** `6-1-project-data-model-database`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Prisma Schema**
1. Create Project model per [07-project-management-system.md](team/bmad-web-server/07-project-management-system.md)
2. Create ProjectMember model
3. Create Workflow model
4. Create Artifact model
5. Create Deliverable model

**Phase 2: Enums**
1. Define ProjectType enum (security-assessment, incident-response, investigation, advisory, compliance, training)
2. Define ProjectStatus enum (planning, active, on-hold, completed, archived)
3. Define ProjectPhase enum
4. Define MemberRole enum (owner, lead, member, viewer)

**Phase 3: Indexes**
1. Create indexes for query performance
2. Add foreign key relationships
3. Add unique constraints

**Phase 4: Migration**
1. Generate Prisma migration
2. Run migration
3. Verify schema created

**Phase 5: Verification**
1. Test model creation
2. Test relationships
3. Verify indexes

**Acceptance Criteria Verification:**
- [ ] Project, ProjectMember, Workflow, Artifact, Deliverable models created
- [ ] ProjectType enum defined
- [ ] ProjectStatus enum defined
- [ ] ProjectPhase enum defined
- [ ] MemberRole enum defined
- [ ] Indexes created
- [ ] Prisma migration generated and run

---

### Story 6.2: Project CRUD API

**Story ID:** `6-2-project-crud-api`
**Status:** backlog
**Dependencies:** Story 6.1

#### Implementation Steps

**Phase 1: POST /api/projects**
1. Validate project data with Zod schema
2. Generate unique project code
3. Set creator as project owner
4. Return created project with ID

**Phase 2: GET /api/projects**
1. Support filtering by type, status, search
2. Return paginated results
3. Implement search functionality

**Phase 3: GET /api/projects/[id]**
1. Return single project details
2. Include related data (members, workflows)
3. Handle not found (404)

**Phase 4: PATCH /api/projects/[id]**
1. Validate user permission (owner/admin)
2. Update project fields
3. Return updated project

**Phase 5: DELETE /api/projects/[id]**
1. Validate user permission
2. Perform soft delete (set archived status)
3. Return success

**Phase 6: Verification**
1. Test all CRUD operations
2. Test permission checks
3. Test validation

**Acceptance Criteria Verification:**
- [ ] POST creates project with validation
- [ ] GET supports filtering and pagination
- [ ] PATCH validates permissions
- [ ] DELETE performs soft delete
- [ ] Zod validation on all inputs

---

### Story 6.3: Project Creation Wizard

**Story ID:** `6-3-project-creation-wizard`
**Status:** backlog
**Dependencies:** Story 6.2

#### Implementation Steps

**Phase 1: Wizard Component**
1. Create multi-step wizard component
2. Implement step navigation
3. Add step progress indicator

**Phase 2: Step 1 - Select Project Type**
1. Create 6 project type cards
2. Add icons and descriptions
3. Implement selection logic

**Phase 3: Step 2 - Project Details**
1. Create form fields:
   - Project name (required)
   - Client name (optional)
   - Description (optional)
   - Target completion date
2. Validate inputs

**Phase 4: Step 3 - Add Team Members**
1. Create user search/invite
2. Add role assignment dropdown
3. Implement member list

**Phase 5: Template Selection**
1. Add template selection for common types
2. Pre-fill form from template
3. Allow template customization

**Phase 6: Verification**
1. Test wizard flow
2. Test template selection
3. Test project creation

**Acceptance Criteria Verification:**
- [ ] 3-step wizard displayed
- [ ] Step 1: 6 project type cards with icons
- [ ] Step 2: Validates required fields
- [ ] Step 3: Adds team members with roles
- [ ] Template selection available
- [ ] Project persisted after completion

---

### Story 6.4: Project Dashboard

**Story ID:** `6-4-project-dashboard`
**Status:** backlog
**Dependencies:** Story 6.2

#### Implementation Steps

**Phase 1: Dashboard Component**
1. Create dashboard page
2. Add summary metrics component
3. Display: Active Projects, This Month, On-Time %

**Phase 2: Project List**
1. Create card-based project list
2. Show status, team members, progress
3. Add visual indicators

**Phase 3: Quick Actions**
1. Add "New Project" button
2. Add "View All" link
3. Add "Generate Report" button

**Phase 4: Filtering**
1. Add status filter
2. Add type filter
3. Implement real-time updates

**Phase 5: Verification**
1. Test dashboard displays
2. Test quick actions
3. Test filters

**Acceptance Criteria Verification:**
- [ ] Summary metrics displayed
- [ ] Card-based project list shown
- [ ] Quick action buttons functional
- [ ] Filtering by status and type works
- [ ] Real-time updates functional

---

### Story 6.5: Project Detail View - Overview Tab

**Story ID:** `6-5-project-detail-view-overview-tab`
**Status:** backlog
**Dependencies:** Story 6.4

#### Implementation Steps

**Phase 1: Project Detail Page**
1. Create `/projects/[id]/page.tsx`
2. Fetch project data
3. Handle not found

**Phase 2: Project Header**
1. Display project name
2. Show status badge
3. Show phase and completion percentage

**Phase 3: Tab Navigation**
1. Create tab component
2. Implement tabs: Overview, Workflows, Artifacts, Team, Deliverables
3. Add active state handling

**Phase 4: Overview Content**
1. Display Workflows progress list
2. Show Team members
3. Show Deliverables tracker
4. Add "+ Add Workflow" button

**Phase 5: Verification**
1. Test project detail page
2. Test tab navigation
3. Test overview content

**Acceptance Criteria Verification:**
- [ ] Project header with status badge, phase, completion % shown
- [ ] Tab navigation functional
- [ ] Overview displays workflows, team, deliverables
- [ ] "+ Add Workflow" button works

---

### Story 6.6: Incident Response Workspace

**Story ID:** `6-6-incident-response-workspace`
**Status:** backlog
**Dependencies:** Story 6.5

#### Implementation Steps

**Phase 1: Specialized Workspace**
1. Detect incident-response project type
2. Create specialized layout
3. Add incident-specific components

**Phase 2: Incident Header**
1. Display Incident ID, Severity, Phase, Team count
2. Show STATUS panel
3. Display affected/contained systems

**Phase 3: Timeline Visualization**
1. Create timeline component
2. Support multi-contributor entries
3. Add phase markers

**Phase 4: Evidence Locker**
1. Display file list
2. Show SHA-256 verification status
3. Add upload button

**Phase 5: Team Presence**
1. Display active members
2. Show current tasks
3. Add presence indicators

**Phase 6: Phase Progression**
1. Implement phase transitions
2. Support: Identification → Containment → Eradication → Recovery
3. Add phase confirmation

**Phase 7: Verification**
1. Test incident workspace
2. Test phase progression
3. Test evidence upload

**Acceptance Criteria Verification:**
- [ ] Incident header with ID, Severity, Phase, Team count shown
- [ ] STATUS panel displays phase and system counts
- [ ] Timeline visualization supports multi-contributor
- [ ] Evidence Locker with SHA-256 verification works
- [ ] Team Presence shows active members and tasks
- [ ] Phase progression functional

---

### Story 6.7: Penetration Test Tracker

**Story ID:** `6-7-penetration-test-tracker`
**Status:** backlog
**Dependencies:** Story 6.5

#### Implementation Steps

**Phase 1: Specialized Tracker**
1. Detect security-assessment project with pentest type
2. Create pentest-specific layout
3. Add findings tracker

**Phase 2: Pentest Header**
1. Display Pentest ID, Scope, Week, Findings count
2. Show project status

**Phase 3: Findings Tracker Table**
1. Create table with columns: Severity, Status, Finding
2. Color-code severities (Critical, High, Medium, Low)
3. Add status values (Fixing, Verified, Testing, Pending)

**Phase 4: Findings Management**
1. Add finding with CVSS score
2. Upload evidence (screenshots, PoC code)
3. Edit existing findings

**Phase 5: Phase Progress**
1. Display progress bars:
   - Reconnaissance
   - Enumeration
   - Exploitation
   - Post-Exploitation
   - Reporting
2. Update progress dynamically

**Phase 6: Verification**
1. Test pentest tracker
2. Test findings CRUD
3. Test phase progress

**Acceptance Criteria Verification:**
- [ ] Pentest header with ID, Scope, Week, Findings count shown
- [ ] Findings table with Severity, Status, Finding columns
- [ ] Severity color-coding works
- [ ] Status values: Fixing, Verified, Testing, Pending
- [ ] Add finding with CVSS score and evidence works
- [ ] Phase progress bars displayed

---

### Story 6.8: Evidence Locker

**Story ID:** `6-8-evidence-locker`
**Status:** backlog
**Dependencies:** Story 6.1

#### Implementation Steps

**Phase 1: Evidence Storage**
1. Create evidence upload API
2. Calculate SHA-256 hash of uploaded file
3. Store file with metadata

**Phase 2: Evidence List**
1. Display evidence list
2. Show filename, size, upload timestamp, uploader
3. Display hash verification status

**Phase 3: Verification**
1. Implement hash verification check
2. Show "verified" checkmark when hash matches
3. Flag suspicious files

**Phase 4: Download**
1. Create download endpoint
2. Require authentication
3. Log all downloads

**Phase 5: File Type Support**
1. Support memory dumps
2. Support network captures
3. Support logs
4. Support notes

**Phase 6: Verification**
1. Test file upload
2. Test hash verification
3. Test download

**Acceptance Criteria Verification:**
- [ ] SHA-256 hash calculated on upload
- [ ] File stored with metadata
- [ ] Evidence list displays with verification status
- [ ] Download requires authentication
- [ ] "Verified" checkmark shown when hash matches
- [ ] Support for memory dumps, captures, logs, notes

---

### Story 6.9: Team Management

**Story ID:** `6-9-team-management`
**Status:** backlog
**Dependencies:** Story 6.2

#### Implementation Steps

**Phase 1: Team Tab**
1. Create team tab in project detail
2. Display current members list
3. Add "Add Member" button

**Phase 2: Add Member**
1. Create user search interface
2. Add email invitation
3. Assign role dropdown (Owner, Lead, Member, Viewer)
4. Send notification

**Phase 3: Member Management**
1. Allow role changes
2. Allow member removal
3. Show member activity (last seen, current task)

**Phase 4: Presence Indicators**
1. Display online/offline status
2. Show current task for active members
3. Update presence in real-time

**Phase 5: Verification**
1. Test adding members
2. Test role changes
3. Test member removal
4. Test presence indicators

**Acceptance Criteria Verification:**
- [ ] User search and email invitation works
- [ ] Role assignment: Owner, Lead, Member, Viewer
- [ ] Notification sent to invited user
- [ ] Role changes allowed
- [ ] Member removal works
- [ ] Member activity (last seen, current task) displayed
- [ ] Presence indicators shown

---

### Story 6.10: Deliverables Tracking

**Story ID:** `6-10-deliverables-tracking`
**Status:** backlog
**Dependencies:** Story 6.5

#### Implementation Steps

**Phase 1: Deliverables Tab**
1. Create deliverables tab in project detail
2. Display deliverable list
3. Add "Add Deliverable" button

**Phase 2: Deliverable List**
1. Show deliverable name, due date, status, assignee
2. Status values: Pending, In Progress, Review, Complete
3. Add visual indicators for overdue items

**Phase 3: Add Deliverable**
1. Create form with:
   - Title (required)
   - Description
   - Due date
   - Assignee
2. Validate inputs

**Phase 4: Status Management**
1. Implement one-click status cycling
2. Update status visual indicators
3. Add status change history

**Phase 5: Progress Tracking**
1. Calculate overall completion percentage
2. Show visual progress bar
3. Highlight overdue deliverables

**Phase 6: Verification**
1. Test adding deliverables
2. Test status updates
3. Test progress calculation

**Acceptance Criteria Verification:**
- [ ] Deliverable list with name, due date, status, assignee shown
- [ ] Status values: Pending, In Progress, Review, Complete
- [ ] Add deliverable with form works
- [ ] One-click status cycling functional
- [ ] Visual progress bar displayed
- [ ] Overdue deliverables highlighted

---

## Epic 7: Enterprise Templates

### Story 7.1: Template Selector

**Story ID:** `7-1-template-selector`
**Status:** ✅ done
**Dependencies:** Epic 1
**Completed:** 2026-02-17

#### Implementation Steps

**Phase 1: Template Registry** ✅
1. Created template configuration ✅
2. Defined built-in templates ✅
   - Executive Brief ✅
   - Technical Report ✅
3. Store template metadata ✅

**Phase 2: Template Cards** ✅
1. Created template card component ✅
2. Display name, description, preview sections ✅
3. Add "Use Template" button ✅

**Phase 3: Preview Modal** ✅
1. Created preview modal ✅
2. Show template structure ✅
3. Display section breakdown ✅

**Phase 4: Selection** ✅
1. Implemented template selection ✅
2. Store user preference ✅
3. Pass selected template to rendering ✅

**Phase 5: Verification** ✅
1. Test template selector ✅
2. Test preview modal ✅
3. Test selection and preference storage ✅

**Files Created:**
- `team/bmad-web-ui/src/types/template.ts` - Template type definitions
- `team/bmad-web-ui/src/lib/templates/builtin-templates.ts` - Built-in templates
- `team/bmad-web-ui/src/lib/templates/template-storage.ts` - localStorage persistence
- `team/bmad-web-ui/src/stores/template-store.ts` - Zustand store
- `team/bmad-web-ui/src/components/templates/template-card.tsx` - Template card with arrow nav
- `team/bmad-web-ui/src/components/templates/template-selector.tsx` - Main selector with filter
- `team/bmad-web-ui/src/components/templates/template-preview-modal.tsx` - Preview modal
- `team/bmad-web-ui/src/components/templates/template-selector-wrapper.tsx` - Integration wrapper
- `team/bmad-web-ui/src/components/templates/index.ts` - Component exports

**Acceptance Criteria Verification:**
- [x] At least 2 built-in templates shown
- [x] Each template card shows name, description, preview
- [x] Preview modal displays template structure
- [x] "Use Template" button works
- [x] User preference stored

**Code Review:** All findings fixed ✅

---

### Story 7.2: Executive Brief Template

**Story ID:** `7-2-executive-brief-template`
**Status:** backlog
**Dependencies:** Story 7.1

#### Implementation Steps

**Phase 1: Template Definition**
1. Define Executive Brief structure:
   - Executive Summary
   - Key Findings
   - Risk Rating
   - Recommendations

**Phase 2: Content Rules**
1. Limit to one page
2. Use concise bullet points
3. Apply business-friendly language

**Phase 4: Visual Indicators**
1. Add risk level visuals
2. Create severity color coding
3. Design for presentation

**Phase 5: Formatting**
1. Create formatter for Executive Brief
2. Apply formatting rules
3. Generate output

**Phase 6: Verification**
1. Test template rendering
2. Test formatting rules
3. Verify one-page limit

**Acceptance Criteria Verification:**
- [ ] Sections: Executive Summary, Key Findings, Risk Rating, Recommendations
- [ ] One page with concise bullet points
- [ ] Business-friendly language used
- [ ] Visual indicators for risk levels
- [ ] Formatted for presentation and distribution

---

### Story 7.3: Technical Report Template

**Story ID:** `7-3-technical-report-template`
**Status:** backlog
**Dependencies:** Story 7.1

#### Implementation Steps

**Phase 1: Template Definition**
1. Define Technical Report structure:
   - Methodology
   - Data Collection
   - Analysis
   - Findings
   - Recommendations
   - Appendices

**Phase 2: Content Rules**
1. Include raw data references
2. Provide full technical detail
3. Add code examples where applicable

**Phase 3: Formatting**
1. Create formatter for Technical Report
2. Apply proper formatting
3. Add table of contents for long reports

**Phase 4: Verification**
1. Test template rendering
2. Test technical detail inclusion
3. Verify TOC generation

**Acceptance Criteria Verification:**
- [ ] Sections: Methodology, Data Collection, Analysis, Findings, Recommendations, Appendices
- [ ] Raw data and evidence references included
- [ ] Full technical detail with code examples
- [ ] Proper formatting maintained
- [ ] Table of contents for long reports

---

### Story 7.4: Custom Template Builder

**Story ID:** `7-4-custom-template-builder`
**Status:** backlog
**Dependencies:** Story 7.1

#### Implementation Steps

**Phase 1: Builder Interface**
1. Create template builder page (Enterprise only)
2. Add drag-and-drop section reordering
3. Create section library

**Phase 2: Built-in Sections**
1. Implement built-in sections:
   - Executive Summary
   - Methodology
   - Findings
   - Risks
   - Recommendations

**Phase 3: Custom Sections**
1. Allow custom section creation
2. Add field definition editor
3. Implement section validation

**Phase 4: Branding**
1. Add logo upload
2. Add header color picker
3. Add font selection

**Phase 5: Preview**
1. Create template preview
2. Show rendered output
3. Allow editing before save

**Phase 6: Storage**
1. Store templates per organization
2. Add template management
3. Implement template versioning

**Phase 7: Verification**
1. Test builder interface
2. Test custom sections
3. Test branding options
4. Test preview

**Acceptance Criteria Verification:**
- [ ] Drag-and-drop section reordering works
- [ ] Built-in sections available
- [ ] Custom section creation functional
- [ ] Branding options: logo, color, font
- [ ] Template preview before save
- [ ] Templates stored per organization

---

### Story 7.5: Template Rendering Engine

**Story ID:** `7-5-template-rendering-engine`
**Status:** backlog
**Dependencies:** Story 7.2, Story 7.3

#### Implementation Steps

**Phase 1: Rendering Core**
1. Create template renderer function
2. Accept agent output data and template
3. Map data to template sections

**Phase 2: Formatting**
1. Apply formatting rules (concise vs detailed)
2. Handle missing data gracefully
3. Implement data validation

**Phase 3: Output Formats**
1. Support Markdown output
2. Support HTML output
3. Add PDF generation
4. Add DOCX generation

**Phase 4: Download**
1. Create download handler
2. Support multiple formats
3. Add filename generation

**Phase 5: Caching**
1. Cache rendered outputs
2. Implement cache invalidation
3. Add cache management

**Phase 6: Verification**
1. Test rendering for each template
2. Test output formats
3. Test download functionality

**Acceptance Criteria Verification:**
- [ ] Agent output mapped to template sections
- [ ] Formatting rules applied
- [ ] Missing data handled gracefully
- [ ] Markdown and HTML outputs supported
- [ ] PDF, DOCX, Markdown downloads available
- [ ] Outputs cached for performance

---

## Epic 8: API & Developer Experience

### Story 8.1: RESTful API Implementation

**Story ID:** `8-1-restful-api-implementation`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Public Endpoints**
1. Create GET /api/health (public)
2. Create POST /api/auth/login (public)
3. Add health check logic

**Phase 2: Protected Endpoints - Projects**
1. Create GET/POST /api/projects (protected)
2. Create GET/PATCH/DELETE /api/projects/[id] (protected)
3. Add authentication middleware

**Phase 3: Protected Endpoints - Agents**
1. Create GET /api/agents (protected)
2. Create GET /api/agents/[id] (protected)
3. Create POST /api/agents/[id]/invoke (protected)

**Phase 4: Protected Endpoints - Workflows**
1. Create GET /api/workflows (protected)
2. Create POST /api/workflows/[id]/execute (protected)

**Phase 5: Protected Endpoints - Templates**
1. Create GET /api/templates (protected)
2. Create POST /api/custom-templates (protected, enterprise)

**Phase 6: Response Structure**
1. Create consistent response wrapper
2. Implement error response format
3. Add success/error status codes

**Phase 7: Verification**
1. Test all endpoints
2. Verify authentication required
3. Test response structures

**Acceptance Criteria Verification:**
- [ ] Public endpoints: GET /api/health, POST /api/auth/login
- [ ] Protected endpoints for projects, agents, workflows
- [ ] Protected endpoints for templates
- [ ] All endpoints return JSON with consistent structure

---

### Story 8.2: API Key Management

**Story ID:** `8-2-api-key-management`
**Status:** backlog
**Dependencies:** Story 8.1

#### Implementation Steps

**Phase 1: API Key Model**
1. Create ApiKey model in Prisma
2. Add fields: id, name, hashedKey, userId, createdAt, lastUsed
3. Add indexes for lookups

**Phase 2: Key Generation**
1. Create API key generation function
2. Use cryptographically secure random generation
3. Hash keys before storage (bcrypt)

**Phase 3: API Keys Settings Page**
1. Create API keys settings page
2. Display list of existing keys
3. Show name, created date, last used

**Phase 4: Key Management**
1. Add "Generate API Key" button
2. Allow naming keys
3. Show key only once at creation
4. Add revocation/deletion

**Phase 5: Verification**
1. Test key generation
2. Test key storage (hashed)
3. Test key revocation

**Acceptance Criteria Verification:**
- [ ] API key list displayed with name, created date, last used
- [ ] "Generate API Key" button works
- [ ] Keys can be named
- [ ] Key shown only once at creation
- [ ] Keys can be revoked/deleted

---

### Story 8.3: API Authentication

**Story ID:** `8-3-api-authentication`
**Status:** backlog
**Dependencies:** Story 8.2

#### Implementation Steps

**Phase 1: Bearer Token Middleware**
1. Create API authentication middleware
2. Extract Bearer token from Authorization header
3. Validate against stored API keys

**Phase 2: Token Validation**
1. Hash provided key
2. Compare with stored hashed keys
3. Extract user and role from key

**Phase 3: Rate Limiting**
1. Implement stricter rate limits for API role
2. Add rate limit configuration
3. Return 429 with Retry-After

**Phase 4: Authorization**
1. Validate permissions from role
2. Return 401 for invalid tokens
3. Return 403 for insufficient permissions

**Phase 5: Audit Logging**
1. Include API usage in audit logs
2. Log key ID, user, endpoint, timestamp
3. Track API usage patterns

**Phase 6: Verification**
1. Test Bearer token authentication
2. Test rate limiting
3. Test authorization

**Acceptance Criteria Verification:**
- [ ] Bearer token validated against API keys
- [ ] User and role extracted from token
- [ ] Stricter rate limits for API role
- [ ] 401 for invalid tokens, 403 for insufficient permissions
- [ ] API usage included in audit logs

---

### Story 8.4: API Documentation

**Story ID:** `8-4-api-documentation`
**Status:** backlog
**Dependencies:** Story 8.1

#### Implementation Steps

**Phase 1: Documentation Page**
1. Create API documentation page
2. Add navigation and search
3. Design layout per [05-ui-design-system.md](team/bmad-web-server/05-ui-design-system.md)

**Phase 2: Endpoint Documentation**
1. Document all endpoints with:
   - HTTP method
   - Path
   - Parameters
   - Request body schema
   - Response schema
   - Error codes

**Phase 3: Examples**
1. Provide request/response examples
2. Document authentication methods
3. Include error response codes

**Phase 4: Code Examples**
1. Add JavaScript examples
2. Add Python examples
3. Add cURL examples

**Phase 5: Additional Info**
1. Document rate limits
2. Document pagination
3. Add troubleshooting section

**Phase 6: Verification**
1. Verify all endpoints documented
2. Test code examples
3. Test links and navigation

**Acceptance Criteria Verification:**
- [ ] All endpoints documented with methods, paths, parameters
- [ ] Request/response examples provided
- [ ] Authentication methods documented
- [ ] Error response codes explained
- [ ] Code examples in JavaScript, Python, cURL
- [ ] Rate limits and pagination documented

---

### Story 8.5: API Explorer

**Story ID:** `8-5-api-explorer`
**Status:** backlog
**Dependencies:** Story 8.4

#### Implementation Steps

**Phase 1: Explorer Component**
1. Create API explorer page
2. Display list of all available endpoints
3. Add endpoint groups/categories

**Phase 2: Request Builder**
1. Create interface for selecting method
2. Add parameter input fields
3. Create request body editor for POST/PUT

**Phase 3: Request Preview**
1. Show formatted request with headers
2. Display request body
3. Add request validation

**Phase 4: Execution**
1. Execute request with current session or API key
2. Display response
3. Format response output

**Phase 5: Code Snippet**
1. Generate code snippet for executed request
2. Support multiple languages
3. Allow copy to clipboard

**Phase 6: Verification**
1. Test endpoint selection
2. Test request building
3. Test request execution

**Acceptance Criteria Verification:**
- [ ] List of all available endpoints shown
- [ ] Interface for selecting method and entering parameters
- [ ] Request preview with headers and body displayed
- [ ] Request executed and response displayed
- [ ] Authentication using session or API key
- [ ] Code snippet provided for executed request

---

## Epic 9: Security Hardening

### Story 9.1: Prompt Injection Detection Engine

**Story ID:** `9-1-prompt-injection-detection-engine`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Pattern Library**
1. Create INJECTION_PATTERNS per [11-security-deep-dive.md](team/bmad-web-server/11-security-deep-dive.md#1-prompt-injection-defense)
2. Implement 9+ pattern categories:
   - systemOverride
   - ignorePrevious
   - roleManipulation
   - jailbreak
   - outputManipulation
   - encoding
   - delimiterInjection
   - contextBreak
   - markdownInjection

**Phase 2: Detection Engine**
1. Create PromptInjectionDetector class
2. Implement detect(input) method
3. Calculate detection score (threshold 50)

**Phase 3: Heuristic Analysis**
1. Add suspicious character detection
2. Add excessive length check
3. Add keyword density analysis
4. Add repetition detection

**Phase 4: Severity Calculation**
1. Map score to severity (low, medium, high, critical)
2. Generate detection reason
3. Return DetectionResult

**Phase 5: Configuration**
1. Add strict mode configuration
2. Allow pattern category enablement
3. Add score threshold adjustment

**Phase 6: Verification**
1. Test each pattern category
2. Test heuristic analysis
3. Verify severity calculation

**Acceptance Criteria Verification:**
- [ ] 9+ pattern categories implemented
- [ ] Heuristic analysis: suspicious chars, length, density, repetition
- [ ] Detection score calculated (threshold 50)
- [ ] DetectionResult with detected, score, severity, matches, reason
- [ ] Strict mode configuration supported

---

### Story 9.2: Prompt Injection Middleware

**Story ID:** `9-2-prompt-injection-middleware`
**Status:** backlog
**Dependencies:** Story 9.1

#### Implementation Steps

**Phase 1: Middleware Creation**
1. Create Next.js middleware for POST/PUT/PATCH
2. Integrate PromptInjectionDetector
3. Add scan logic

**Phase 2: Field Scanning**
1. Scan string fields: message, prompt, input, query, description, content, title, name, parameters
2. Scan nested paths: project.description, workflow.parameters, parameters.target
3. Parse request body

**Phase 3: Blocking**
1. Return 400 status if injection detected
2. Add error message
3. Log detection

**Phase 4: Logging**
1. Log detection to audit trail with severity
2. Include user, IP, matched patterns
3. Implement rate limiting for repeat offenders

**Phase 5: Headers**
1. Set x-prompt-sanitized header
2. Pass to downstream processing

**Phase 6: Verification**
1. Test middleware with various inputs
2. Test blocking behavior
3. Test logging

**Acceptance Criteria Verification:**
- [ ] POST/PUT/PATCH requests scanned
- [ ] String fields checked
- [ ] Nested paths scanned
- [ ] 400 status returned on detection
- [ ] Logged to audit trail with severity
- [ ] Rate limiting for repeat offenders
- [ ] x-prompt-sanitized header set

---

### Story 9.3: Output Filtering

**Story ID:** `9-3-output-filtering`
**Status:** backlog
**Dependencies:** Story 9.1

#### Implementation Steps

**Phase 1: Output Scanner**
1. Create output filter for LLM responses
2. Define suspicious patterns:
   - Embedded instructions
   - Code execution attempts
   - File paths
   - System commands

**Phase 2: Pattern Matching**
1. Implement pattern matching
2. Create exfiltration attempt detection
3. Add context analysis

**Phase 3: Response Handling**
1. Block response on critical patterns
2. Show warning on suspicious patterns
3. Allow safe responses

**Phase 4: Logging**
1. Log flagged responses
2. Create review queue
3. Add alerting for critical flags

**Phase 5: Verification**
1. Test output filtering
2. Test blocking behavior
3. Test warning system

**Acceptance Criteria Verification:**
- [ ] LLM outputs checked for suspicious patterns
- [ ] Embedded instructions detected
- [ ] Code execution attempts caught
- [ ] Responses blocked or warning shown
- [ ] Flagged responses logged for review

---

### Story 9.4: Comprehensive Audit Logging

**Story ID:** `9-4-comprehensive-audit-logging`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Audit Model**
1. Create AuditLog model in Prisma
2. Add fields: timestamp, eventType, user, workflow/session, details, IP, userAgent
3. Add hash chain fields (hash, prevHash)

**Phase 2: Event Types**
1. Define auditable events:
   - auth (login, logout, MFA)
   - agent invocation
   - file operations
   - config changes
   - CLI invocations
   - prompt injection detection

**Phase 3: Logging Function**
1. Create auditLog(eventType, details) function
2. Generate ISO-8601 timestamp
3. Calculate entry hash with previous hash

**Phase 4: Append-Only Storage**
1. Implement append-only writes
2. Prevent modifications
3. Add tamper evidence

**Phase 5: Retrieval API**
1. Create audit log retrieval for admins
2. Add filtering capabilities
3. Implement export for compliance

**Phase 6: Retention**
1. Implement retention policy
2. Add automated cleanup
3. Create archive system

**Phase 7: Verification**
1. Test all event types logged
2. Test hash chain integrity
3. Test retrieval and export

**Acceptance Criteria Verification:**
- [ ] Events logged with timestamp, eventType, user, details, IP, userAgent
- [ ] Hash chain maintained with previous entry hash
- [ ] Logs stored in append-only format
- [ ] Retrieval API for admins
- [ ] Export for compliance reporting
- [ ] Logs retained per retention policy

---

### Story 9.5: Security Headers & CORS

**Story ID:** `9-5-security-headers-cors`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Helmet.js Setup**
1. Install Helmet.js
2. Create security middleware
3. Configure headers:
   - HSTS (Strict-Transport-Security)
   - CSP (Content-Security-Policy)
   - X-Frame-Options
   - X-Content-Type-Options

**Phase 2: CSP Configuration**
1. Create CSP policy
2. Use report-only mode in development
3. Enforce in production

**Phase 3: CORS Policy**
1. Configure strict origin whitelist
2. No wildcards allowed
3. Add specific allowed origins

**Phase 4: CSRF Protection**
1. Create CSRF token generation
2. Implement token validation
3. Add tokens to mutations

**Phase 5: Additional Headers**
1. Set Referrer-Policy
2. Set Permissions-Policy
3. Add X-Content-Type-Options

**Phase 6: Verification**
1. Test headers with security scanner
2. Verify CSP report-only in dev
3. Test CORS enforcement

**Acceptance Criteria Verification:**
- [ ] Helmet.js sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- [ ] CSP with report-only mode in development
- [ ] CORS policy with strict origin whitelist
- [ ] CSRF token protection for mutations
- [ ] Referrer-Policy and Permissions-Policy set

---

### Story 9.6: Input Validation Layer

**Story ID:** `9-6-input-validation-layer`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Validation Middleware**
1. Create input validation middleware
2. Apply to all API endpoints
3. Use Zod schemas

**Phase 2: Schema Definition**
1. Define Zod schemas for all inputs
2. Add max length constraints (e.g., 10000 chars for text)
3. Use strict validation (reject unknown properties)

**Phase 3: Type Validation**
1. Validate data types (string, number, boolean, array)
2. Add custom validators
3. Create error messages

**Phase 4: HTML Sanitization**
1. Install DOMPurify
2. Sanitize HTML inputs
3. Strip dangerous elements

**Phase 5: Error Responses**
1. Return 400 with validation errors
2. Provide detailed error messages
3. Add field-level errors

**Phase 6: Verification**
1. Test validation with valid inputs
2. Test validation with invalid inputs
3. Test HTML sanitization

**Acceptance Criteria Verification:**
- [ ] All inputs validated with Zod schemas
- [ ] Max length constraints enforced
- [ ] Unknown properties rejected (strict validation)
- [ ] Data types validated
- [ ] HTML inputs sanitized with DOMPurify
- [ ] 400 with validation error details

---

### Story 9.7: Rate Limiting

**Story ID:** `9-7-rate-limiting`
**Status:** backlog
**Dependencies:** Epic 1

#### Implementation Steps

**Phase 1: Rate Limiting Middleware**
1. Install rate limiting library (express-rate-limit or similar)
2. Create rate limiting configuration
3. Apply to all routes

**Phase 2: User Rate Limits**
1. Enforce 100 requests per minute per user
2. Enforce 1000 requests per hour per user
3. Use user ID or IP for tracking

**Phase 3: Auth Rate Limits**
1. Enforce 10 failed auth attempts per IP per minute
2. Enforce 5 failed auth attempts per user per minute
3. Implement lockout period

**Phase 4: Response Headers**
1. Return 429 status with Retry-After header
2. Add rate limit info to response headers
3. Provide rate limit exceeded message

**Phase 5: Storage**
1. Use Redis-backed storage for distributed rate limiting
2. Implement fallback to in-memory for development
3. Add rate limit cleanup

**Phase 6: Logging & Monitoring**
1. Log rate limit violations
2. Create monitoring alerts
3. Track abuse patterns

**Phase 7: Verification**
1. Test user rate limits
2. Test auth rate limits
3. Test distributed rate limiting

**Acceptance Criteria Verification:**
- [ ] 100 requests/minute per user enforced
- [ ] 1000 requests/hour per user enforced
- [ ] 10 failed auth attempts/IP/minute enforced
- [ ] 5 failed auth attempts/user/minute enforced
- [ ] 429 status with Retry-After header
- [ ] Redis-backed storage for distributed limiting
- [ ] Rate limit violations logged

---

## Document Status

**Status:** ✅ COMPLETE - Ready for Implementation

**Summary:**
- **Total Epics:** 9
- **Total Stories:** 52
- **Implementation Steps:** Comprehensive breakdown for all stories

**Usage Instructions:**
1. Before each story, complete the Pre-Implementation Checklist
2. Follow steps in order for each story
3. Use 3+ agents in parallel for research/investigation
4. Test thoroughly before marking story complete
5. Update sprint-status.yaml after each story
6. Create backup before starting implementation

**Next Steps:**
1. Use **[CS] Create Story** to prepare the first story for development
2. Begin implementation with **[Dev]** workflow
3. Track progress in sprint-status.yaml
