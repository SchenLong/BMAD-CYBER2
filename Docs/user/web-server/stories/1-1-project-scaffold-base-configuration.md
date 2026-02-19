# Story 1.1: Project Scaffold & Base Configuration

**Status:** done
**Epic:** Epic 1 - Foundation & Authentication
**Story ID:** 1.1
**Story Key:** 1-1-project-scaffold-base-configuration
**Dependencies:** None (First story)

---

## Story

**As a** Developer,
**I want** a properly configured Next.js 15+ project with all necessary dependencies and enterprise-grade folder structure,
**So that** the team can begin building features on a solid, scalable foundation.

---

## Acceptance Criteria

**Given** a fresh development environment
**When** initializing the project
**Then** create Next.js 15+ project with TypeScript, Tailwind CSS, ESLint, and src-directory
**And** configure shadcn/ui with base components (Button, Input, Card, Modal/Dialog)
**And** set up enterprise-grade folder structure matching technical specification
**And** configure Zustand for client state and TanStack Query for server state
**And** establish environment variables pattern with .env.example
**And** verify dev server runs without errors
**And** verify build completes successfully

---

## Tasks / Subtasks

- [x] **Task 1: Initialize Next.js Project** (AC: Given, When, Then)
  - [x] Create Next.js 15+ project with TypeScript, Tailwind CSS, ESLint, src-directory
  - [x] Verify project structure is created correctly
  - [x] Run `npm run dev` to confirm server starts

- [x] **Task 2: Install Core Dependencies** (AC: Then - configure shadcn/ui)
  - [x] Install shadcn/ui and initialize with base configuration
  - [x] Add core shadcn components: Button, Input, Card, Dialog
  - [x] Install state management: zustand, @tanstack/react-query
  - [x] Install form handling: react-hook-form, @hookform/resolvers, zod
  - [x] Install CLI bridge dependencies: execa
  - [x] Install dev dependencies: @types/node

- [x] **Task 3: Create Enterprise Folder Structure** (AC: And - enterprise-grade folder structure)
  - [x] Create route groups: (auth), (dashboard), (install)
  - [x] Create API routes structure: api/auth, api/cli, api/agents, api/missions
  - [x] Create components structure: ui/, forms/, features/, layout/, providers/
  - [x] Create lib/, hooks/, stores/, styles/ directories
  - [x] Verify structure matches [technical specification](../06-technical-implementation.md#2-project-structure)

- [x] **Task 4: Configure State Management** (AC: And - configure Zustand and TanStack Query)
  - [x] Set up Zustand store with initial structure (mission-store, ui-store, user-store)
  - [x] Create TanStack Query provider component
  - [x] Configure providers in app layout

- [x] **Task 5: Configure UI Theme** (AC: And - shadcn/ui base components)
  - [x] Apply custom theme CSS variables per [UI Design System](../05-ui-design-system.md#appendix-a-css-variables-reference)
  - [x] Configure dark mode as default
  - [x] Set up custom fonts: Orbitron (headings), Inter (body), JetBrains Mono (code)
  - [x] Configure Tailwind with design tokens (4px base unit, 12-column grid)

- [x] **Task 6: Environment Configuration** (AC: And - environment variables pattern)
  - [x] Create .env.example with all required variables
  - [x] Add .env to .gitignore
  - [x] Document required vs optional environment variables

- [x] **Task 7: Verification** (AC: And - verify dev server and build)
  - [x] Run `npm run dev` - verify no errors
  - [x] Run `npm run build` - verify build succeeds
  - [x] Test shadcn components render correctly
  - [x] Verify TypeScript compilation passes
  - [x] Check Tailwind styling works

---

## Dev Notes

### Architecture Patterns & Constraints

**Framework & Technology Stack:**
- **Next.js 15+ App Router** - Server Components by default, Client Components for interactivity
- **TypeScript 5.3+** - Strict mode enabled, no implicit any
- **Tailwind CSS 4.x** - Utility-first CSS with custom design tokens
- **shadcn/ui** - Copy-paste model, components owned by project (not npm package)

**State Management Philosophy:**
- **Zustand** for client state (UI state, modals, form state) - keep it minimal
- **TanStack Query** for server state (API data) - handles caching, synchronization
- **Server Components** for data fetching when possible (no hydration mismatch)
- **Server Actions** for mutations (form submissions, state changes)

**Key Architectural Decisions:**
1. **Monolith-first** - Single Next.js app with clear boundaries for future microservice extraction
2. **Route groups** - Use (auth), (dashboard) for logical separation without URL segments
3. **Zero-trust** - Every input validated, every output sanitized
4. **Progressive disclosure** - UI complexity hidden until relevant

### Project Structure Notes

**Enterprise-Grade Folder Structure:**

```
bmad-web-ui/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (login, register)
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── (install)/                # First-time setup wizard
│   │   ├── api/                      # API routes
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles with CSS variables
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Form components
│   │   ├── features/                 # Feature-specific components
│   │   ├── layout/                   # Layout components (header, sidebar)
│   │   └── providers/                # Context providers
│   ├── lib/
│   │   ├── cli-bridge.ts             # CLI process management (future)
│   │   ├── api-client.ts             # API wrappers
│   │   └── utils.ts                  # Utility functions
│   ├── hooks/
│   │   └── use-cli-stream.ts         # SSE hook (future)
│   ├── stores/
│   │   ├── mission-store.ts          # Mission state (future)
│   │   ├── ui-store.ts               # UI state (modals, drawers)
│   │   └── user-store.ts             # User preferences
│   └── styles/
│       └── theme.css                 # Custom theme extensions
├── public/                            # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Component Organization:**
- **Server Components** by default (no "use client" directive)
- **Client Components** only when needed (hooks, event handlers, interactivity)
- **Separate client/** or explicit "use client" for interactive components
- **Colocation** - Keep components near where they're used

### File Structure Requirements

**Critical Paths & Files:**
- `src/app/layout.tsx` - Root layout with all providers
- `src/app/globals.css` - CSS variables, Tailwind imports, custom theme
- `src/components/providers/` - ThemeProvider, QueryProvider
- `tailwind.config.ts` - Custom design tokens, fonts, colors
- `tsconfig.json` - Path aliases (`@/*` for src/)
- `.env.example` - All environment variables documented

### Testing Standards Summary

**Testing Philosophy (for this story):**
- Verify server starts without errors
- Verify build completes successfully
- Manual component rendering verification
- TypeScript compilation check

**Note:** Full test framework setup (Vitest, Playwright) comes in later stories. This story focuses on getting the foundation working.

---

## Dev Agent Guardrails

### Technical Requirements

**Next.js 15+ Configuration:**
- Use App Router (not Pages Router)
- Enable strict TypeScript mode
- Use src/ directory (not root app/)
- Enable Turbopack for development (optional but recommended)

**Tailwind CSS Configuration:**
- Use CSS variables for theming (shadcn/ui pattern)
- Configure custom fonts: Orbitron, Inter, JetBrains Mono
- Set dark mode as default (class-based)
- Extend theme with 4px spacing scale
- Custom color palette per [UI Design System](../05-ui-design-system.md#2-color-system)

**shadcn/ui Setup:**
- Use copy-paste model (components go in src/components/ui/)
- Initialize with CSS variables option
- Add minimal base components first: Button, Input, Card, Dialog
- Don't add all components at once (add as needed)

**State Management Setup:**
- Zustand stores in `src/stores/` directory
- Create initial store structure even if empty
- TanStack Query provider in `src/components/providers/query-provider.tsx`

### Architecture Compliance

**Server Components vs Client Components:**
```typescript
// ✅ Server Component (default) - Use for static content, data fetching
export default function DashboardPage() {
  return <div>...</div>
}

// ❌ Client Component (explicit) - Only when needed
"use client"
export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Import Aliases:**
- Use `@/` for src/ directory (configured in tsconfig.json)
- Example: `import { Button } from '@/components/ui/button'`

**CSS Variables Pattern:**
- Define in `src/app/globals.css`
- Use CSS custom properties for colors, spacing, typography
- Enables easy theming and dark mode

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^4.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "execa": "^9.0.0"
  }
}
```

**Dev Dependencies:**
```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

### File Structure Requirements

**Must-Create Files:**
1. `src/app/layout.tsx` - Root layout with providers
2. `src/app/page.tsx` - Landing page (can be placeholder)
3. `src/app/globals.css` - Global styles with theme
4. `src/components/providers/theme-provider.tsx` - Theme context
5. `src/components/providers/query-provider.tsx` - TanStack Query provider
6. `src/stores/ui-store.ts` - UI state store
7. `src/stores/user-store.ts` - User preferences store
8. `tailwind.config.ts` - Custom theme configuration
9. `.env.example` - Environment variable template

**Route Groups to Create:**
- `src/app/(auth)/` - Login, register pages
- `src/app/(dashboard)/` - Protected dashboard pages
- `src/app/(install)/` - First-time setup wizard
- `src/app/api/` - API routes

### Testing Requirements

**Verification Steps:**
1. `npm run dev` - Server starts on http://localhost:42001
2. No console errors or warnings
3. `npm run build` - Production build succeeds
4. `npm run start` - Production server starts
5. Visit http://localhost:42001 - Page renders without errors
6. Check browser console - no errors
7. Test theme toggle (if implemented)
8. Verify shadcn components render correctly

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Web-based interface providing access to all BMAD capabilities via browser
**Target Users:** Solo operators, team leads, executives, developers

**Key Design Principles:**
- **Sophisticated Minimalism** - Every element serves a purpose
- **Progressive Disclosure** - Show only what serves the moment
- **Conversational-First** - Abdul orchestrates, interface supports
- **Dark Mode Primary** - Optimized for long professional sessions

**Technology Rationale:**
- **Next.js 15** - Server Components, App Router, excellent TypeScript support
- **shadcn/ui** - Component ownership, accessible primitives, CSS variables
- **Zustand** - Lightweight (1KB), simple API, TypeScript-first
- **TanStack Query** - Server state caching, synchronization, optimistic updates

---

## Story Completion Status

**Status:** review
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation Date:** 2026-02-15

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives and requirements
- [Architecture & Security](../02-architecture-security.md) - Technical architecture overview
- [UX Design](../03-ux-design.md) - User experience patterns
- [Technical Implementation](../06-technical-implementation.md) - Detailed implementation guide
- [UI Design System](../05-ui-design-system.md) - Visual design specifications
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase implementation guide

**Story Breakdown Reference:**
- Epic 1: Foundation & Authentication - [epics.md#epic-1](../epics.md#epic-1-foundation--authentication)
- Story 1.1 Details - [epics.md#story-11-project-scaffold-base-configuration](../epics.md#story-11-project-scaffold-base-configuration)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (Implementation)
Claude Opus 4.6 (Code Review)

### Debug Log References
No critical issues encountered during implementation.

### Completion Notes List
- Created Next.js 16.1.6 project with TypeScript, Tailwind CSS 4.x, ESLint
- Configured shadcn/ui with Button, Input, Card, Dialog components
- Set up Zustand stores: ui-store, user-store, mission-store with immer middleware
- Created TanStack Query provider and integrated in root layout
- Applied BMAD Design System theme with custom CSS variables
- Configured fonts: Orbitron (headings), Inter (body), JetBrains Mono (code)
- Set dark mode as default
- Created enterprise-grade folder structure with route groups and API routes
- Created .env.example with comprehensive environment variable documentation
- Fixed Turbopack workspace root warning
- All verification steps passed: dev server starts, build succeeds, TypeScript compiles

### Code Review Fixes Applied (2026-02-15)
- Created missing `src/styles/theme.css` with custom animations and scrollbar styling
- Created missing `src/components/providers/theme-provider.tsx` for theme management
- Removed unnecessary `radix-ui` package dependency (was conflicting with specific @radix-ui/* packages)
- Updated root layout to import and use ThemeProvider

### File List
- team/bmad-web-ui/package.json - Project dependencies and scripts
- team/bmad-web-ui/src/app/layout.tsx - Root layout with providers and fonts
- team/bmad-web-ui/src/app/page.tsx - Landing page with component verification
- team/bmad-web-ui/src/app/globals.css - BMAD theme CSS variables
- team/bmad-web-ui/src/app/(auth)/layout.tsx - Auth route group layout
- team/bmad-web-ui/src/app/(dashboard)/layout.tsx - Dashboard route group layout
- team/bmad-web-ui/src/components/providers/query-provider.tsx - TanStack Query provider
- team/bmad-web-ui/src/components/providers/theme-provider.tsx - Theme context provider
- team/bmad-web-ui/src/components/ui/button.tsx - shadcn/ui Button component
- team/bmad-web-ui/src/components/ui/input.tsx - shadcn/ui Input component
- team/bmad-web-ui/src/components/ui/card.tsx - shadcn/ui Card component
- team/bmad-web-ui/src/components/ui/dialog.tsx - shadcn/ui Dialog component
- team/bmad-web-ui/src/stores/ui-store.ts - UI state management
- team/bmad-web-ui/src/stores/user-store.ts - User preferences store
- team/bmad-web-ui/src/stores/mission-store.ts - Mission state store
- team/bmad-web-ui/src/styles/theme.css - Custom theme extensions
- team/bmad-web-ui/next.config.ts - Next.js configuration with Turbopack fix
- team/bmad-web-ui/.env.example - Environment variable template
- team/bmad-web-ui/tsconfig.json - TypeScript configuration with path aliases
