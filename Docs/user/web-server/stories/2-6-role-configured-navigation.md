# Story 2.6: Role-Configured Navigation

**Status:** done
**Epic:** Epic 2 - Abdul-Guided Interface
**Story ID:** 2.6
**Story Key:** 2-6-role-configured-navigation
**Dependencies:** Story 2.1 (Role-Based Onboarding Wizard)

---

## Story

**As a** User with a specific role,
**I want** my navigation menu to show items relevant to my role,
**So that** I can quickly access the features I need most.

---

## Acceptance Criteria

**Given** a user with role "Team Lead"
**When** the primary navigation renders
**Then** display: Dashboard, Projects, Team, Reports, Templates, Settings
**Given** a user with role "Executive"
**When** the primary navigation renders
**Then** display: Executive Summary, Briefs, Risks, Settings
**Given** a user with role "Developer"
**When** the primary navigation renders
**Then** display: API Docs, API Keys, Explorer, CLI, Webhooks
**And** navigation adapts dynamically when role changes

---

## Tasks / Subtasks

- [x] **Task 1: Create Navigation Configuration** (AC: All - display role-specific items)
  - [x] Create navigation config in `src/lib/navigation-config.ts`
  - [x] Define navigation items per role per [UX Design section 9.1](../03-ux-design.md#91-primary-navigation-role-configured)
  - [x] Add icons, labels, and routes for each nav item
  - [x] Include Solo Operator navigation as default
  - [x] Support nested/secondary navigation items

- [x] **Task 2: Create Navigation Component** (AC: When - primary navigation renders)
  - [x] Create `PrimaryNav` component in `src/components/layout/`
  - [x] Create `NavItem` component for individual items
  - [x] Create `NavSection` component for grouping
  - [x] Implement active state highlighting
  - [x] Add collapse/expand for sidebar

- [x] **Task 3: Implement Role-Based Rendering** (AC: All - role-specific items)
  - [x] Create `use-navigation` hook that takes user role
  - [x] Filter navigation items by role
  - [x] Handle role transitions (re-render nav on role change)
  - [x] Support navigation item permissions check
  - [x] Cache navigation config for performance

- [x] **Task 4: Add Role Navigation Configurations** (All AC - specific items)
  - [x] **Solo Operator**: Home, Projects, Templates, CLI, Settings
  - [x] **Team Lead**: Dashboard, Projects, Team, Reports, Templates, Settings
  - [x] **Executive**: Executive Summary, Briefs, Risks, Settings
  - [x] **Developer**: API Docs, API Keys, Explorer, CLI, Webhooks

- [x] **Task 5: Implement Dynamic Role Change** (AC: And - navigation adapts when role changes)
  - [x] Create role change handler in user store
  - [x] Animate navigation transition on role change
  - [x] Show notification when role changes
  - [x] Update user profile with new role
  - [x] Refresh navigation items after role update

- [x] **Task 6: Create Mobile Navigation** (Responsive design)
  - [x] Create `MobileNav` component with hamburger menu
  - [x] Implement slide-out drawer for mobile
  - [x] Add touch-friendly tap targets (44px min)
  - [x] Support swipe to close on mobile
  - [x] Collapse nested items by default on mobile

- [x] **Task 7: Add Secondary Navigation** (Contextual nav per [UX Design section 9.2](../03-ux-design.md#92-secondary-navigation-contextual))
  - [x] Create `SecondaryNav` component
  - [x] Define secondary nav for Team Selection context
  - [x] Define secondary nav for Agent Conversation context
  - [x] Define secondary nav for Project View context
  - [x] Link secondary nav to active context state

- [x] **Task 8: Verification** (All AC)
  - [x] Test Solo Operator shows correct navigation
  - [x] Test Team Lead shows 6 items correctly
  - [x] Test Executive shows 4 items correctly
  - [x] Test Developer shows 5 items correctly
  - [x] Verify navigation updates when role changes
  - [x] Test mobile navigation drawer works
  - [x] Verify active state highlighting
  - [x] Test secondary nav contexts
  - [x] Verify keyboard navigation works

---

## Dev Notes

### Architecture Patterns & Constraints

**Navigation Hierarchy:**
```
App Layout
├── Header (logo, user menu, mobile toggle)
├── Sidebar (primary navigation - role-based)
│   ├── Nav sections
│   └── Nav items with icons
├── Main Content Area
│   └── Secondary Nav (contextual, if applicable)
└── Footer (optional)
```

**Role Configuration Strategy:**
- Central navigation config maps roles to items
- Role stored in user profile and Zustand store
- Navigation re-renders on role change
- Items can be hidden/disabled based on permissions

**Responsive Design:**
- Desktop: Fixed sidebar (240px wide)
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu with full-screen drawer

### File Structure Requirements

**New Files to Create:**
```
src/
├── components/
│   └── layout/
│       ├── PrimaryNav.tsx              # Main sidebar navigation
│       ├── NavItem.tsx                 # Individual nav item
│       ├── NavSection.tsx              # Nav grouping
│       ├── MobileNav.tsx               # Mobile hamburger menu
│       ├── SecondaryNav.tsx            # Contextual sub-nav
│       └── Header.tsx                  # Top header bar
├── hooks/
│   └── use-navigation.ts              # Navigation hook
├── lib/
│   └── navigation-config.ts           # Role-based nav config
└── stores/
    └── ui-store.ts                     # Extend with nav state
```

**No API endpoints required** - Navigation config is client-side

### Component Specifications

**Navigation Config:**
```typescript
interface NavigationConfig {
  [role: string]: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: NavItem[];
  badge?: number | string;
  disabled?: boolean;
}
```

**PrimaryNav Component:**
```typescript
interface PrimaryNavProps {
  role: UserRole;
  currentRoute: string;
  onItemClick?: (item: NavItem) => void;
  collapsed?: boolean;
}
```

**NavItem Component:**
```typescript
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  collapsed?: boolean;
}
```

**SecondaryNav Component:**
```typescript
interface SecondaryNavProps {
  context: 'team-selection' | 'agent-conversation' | 'project-view';
  items: SecondaryNavItem[];
  activeItem?: string;
}

interface SecondaryNavItem {
  id: string;
  label: string;
  route: string;
}
```

### Navigation Configuration by Role

**Solo Operator:**
```typescript
const SOLO_OPERATOR_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/', roles: ['solo-operator'] },
  { id: 'projects', label: 'Projects', icon: 'folder', route: '/projects', roles: ['solo-operator'] },
  { id: 'templates', label: 'Templates', icon: 'file', route: '/templates', roles: ['solo-operator'] },
  { id: 'cli', label: 'CLI', icon: 'terminal', route: '/cli', roles: ['solo-operator', 'developer'] },
  { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings', roles: ['all'] }
];
```

**Team Lead:**
```typescript
const TEAM_LEAD_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart', route: '/dashboard', roles: ['team-lead'] },
  { id: 'projects', label: 'Projects', icon: 'folder', route: '/projects', roles: ['team-lead', 'solo-operator'] },
  { id: 'team', label: 'Team', icon: 'users', route: '/team', roles: ['team-lead'] },
  { id: 'reports', label: 'Reports', icon: 'document', route: '/reports', roles: ['team-lead'] },
  { id: 'templates', label: 'Templates', icon: 'file', route: '/templates', roles: ['team-lead', 'solo-operator'] },
  { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings', roles: ['all'] }
];
```

**Executive:**
```typescript
const EXECUTIVE_NAV: NavItem[] = [
  { id: 'executive-summary', label: 'Executive Summary', icon: 'chart', route: '/executive', roles: ['executive'] },
  { id: 'briefs', label: 'Briefs', icon: 'document', route: '/briefs', roles: ['executive'] },
  { id: 'risks', label: 'Risks', icon: 'alert', route: '/risks', roles: ['executive'] },
  { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings', roles: ['all'] }
];
```

**Developer:**
```typescript
const DEVELOPER_NAV: NavItem[] = [
  { id: 'api-docs', label: 'API Docs', icon: 'book', route: '/api-docs', roles: ['developer'] },
  { id: 'api-keys', label: 'API Keys', icon: 'key', route: '/api-keys', roles: ['developer'] },
  { id: 'explorer', label: 'Explorer', icon: 'search', route: '/explorer', roles: ['developer'] },
  { id: 'cli', label: 'CLI', icon: 'terminal', route: '/cli', roles: ['developer', 'solo-operator'] },
  { id: 'webhooks', label: 'Webhooks', icon: 'link', route: '/webhooks', roles: ['developer'] }
];
```

### Secondary Navigation by Context

**Team Selection Context:**
```typescript
const TEAM_SELECTION_SECONDARY: SecondaryNavItem[] = [
  { id: 'agents', label: 'Agents', route: '/teams/{teamId}/agents' },
  { id: 'workflows', label: 'Workflows', route: '/teams/{teamId}/workflows' },
  { id: 'projects', label: 'Projects', route: '/teams/{teamId}/projects' }
];
```

**Agent Conversation Context:**
```typescript
const AGENT_CONVERSATION_SECONDARY: SecondaryNavItem[] = [
  { id: 'profile', label: 'Profile', route: '/agents/{agentId}' },
  { id: 'related', label: 'Related Agents', route: '/agents/{agentId}/related' },
  { id: 'docs', label: 'Documentation', route: '/agents/{agentId}/docs' }
];
```

**Project View Context:**
```typescript
const PROJECT_VIEW_SECONDARY: SecondaryNavItem[] = [
  { id: 'overview', label: 'Overview', route: '/projects/{projectId}' },
  { id: 'workflows', label: 'Workflows', route: '/projects/{projectId}/workflows' },
  { id: 'output', label: 'Output', route: '/projects/{projectId}/output' },
  { id: 'history', label: 'History', route: '/projects/{projectId}/history' }
];
```

### Icon System

**Icon Sources:**
- Use Lucide React icons (already in shadcn/ui)
- Icon names match config: 'home', 'chart', 'folder', 'users', 'settings', etc.
- Custom icons for BMAD-specific items (Abdul avatar, team icons)

### Testing Requirements

**Manual Testing Checklist:**
- [x] Solo Operator nav shows 5 items
- [x] Team Lead nav shows 6 items
- [x] Executive nav shows 4 items
- [x] Developer nav shows 5 items
- [x] Active route highlights correctly
- [x] Clicking nav item navigates to route
- [x] Role change updates nav items
- [x] Mobile drawer opens/closes correctly
- [x] Secondary nav shows for each context
- [x] Keyboard navigation works (Tab, Arrow keys, Enter)
- [x] Collapsed sidebar shows icons only

---

## Dev Agent Guardrails

### Technical Requirements

**Styling Requirements:**
- Sidebar: 240px wide, collapsed: 64px wide
- Nav items: 40px height with 8px padding
- Active state: brand color background, white text
- Hover state: subtle background shift
- Smooth transitions for all state changes

**Accessibility:**
- Nav items are semantic `<a>` or `<button>` elements
- ARIA current="page" for active item
- Keyboard navigation with Tab and arrow keys
- Focus indicators visible on all items
- Screen reader announces navigation changes

**Performance:**
- Navigation config loaded once at startup
- Role changes trigger efficient re-render
- Mobile drawer uses GPU-accelerated transform
- No unnecessary re-renders on route change

### Architecture Compliance

**Server vs Client Components:**
- PrimaryNav: Client Component (interactive)
- NavItem: Client Component (click handler)
- SecondaryNav: Client Component (context-based)

**Data Flow:**
1. User logs in, fetch user profile with role
2. `use-navigation` hook filters nav config by role
3. PrimaryNav renders filtered items
4. User clicks item → route change
5. Active state updates based on current route
6. Role change → refilter and re-render

**Security:**
- Validate user has permission for each route
- Redirect if user accesses unauthorized route
- Role-based middleware on protected routes
- Sanitize all route parameters

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Role-based navigation reduces cognitive load

**Design Principles:**
- **Relevant Only** - Show what matters to the role
- **Consistent** - Same items in same place
- **Adaptive** - Update when role changes
- **Accessible** - Keyboard and screen reader friendly

---

## Story Completion Status

**Status:** review
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation:** Complete

---

## References

**Source Documents:**
- [UX Design - Navigation Structure](../03-ux-design.md#9-navigation-structure)
- [UX Design - Primary Navigation](../03-ux-design.md#91-primary-navigation-role-configured)
- [UX Design - Secondary Navigation](../03-ux-design.md#92-secondary-navigation-contextual)
- [Epics - Story 2.6](../epics.md#story-26-role-configured-navigation)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Fixed TypeScript errors for 'ALL' role type - changed to explicit role array
- Fixed lucide-react icon imports - replaced non-existent 'Abdul' icon with 'Command'
- Fixed Tooltip component errors - added TooltipProvider wrapper

### Completion Notes List
- Created navigation configuration in `src/lib/navigation-config.ts` with all 4 role configurations
- Built PrimaryNav component with collapsible sidebar support
- Created NavItem component with active state highlighting and Lucide icons
- Created NavSection component for grouping navigation items
- Built MobileNav component with hamburger menu and slide-out drawer
- Created SecondaryNav component for contextual navigation
- Implemented use-navigation hook with role-based filtering and caching
- Added TooltipProvider to PrimaryNav for proper icon tooltips
- Created Avatar and DropdownMenu UI components
- Updated dashboard layout to integrate navigation sidebar and header
- Added PATCH endpoint to user profile API for role changes
- All build passing and tests passing (66 tests)

### File List
- `team/bmad-web-ui/src/lib/navigation-config.ts`
- `team/bmad-web-ui/src/components/layout/PrimaryNav.tsx`
- `team/bmad-web-ui/src/components/layout/NavItem.tsx`
- `team/bmad-web-ui/src/components/layout/NavSection.tsx`
- `team/bmad-web-ui/src/components/layout/MobileNav.tsx`
- `team/bmad-web-ui/src/components/layout/SecondaryNav.tsx`
- `team/bmad-web-ui/src/components/layout/Header.tsx`
- `team/bmad-web-ui/src/hooks/use-navigation.ts`
- `team/bmad-web-ui/src/components/ui/avatar.tsx`
- `team/bmad-web-ui/src/components/ui/dropdown-menu.tsx`
- `team/bmad-web-ui/src/app/(dashboard)/layout.tsx`
- `team/bmad-web-ui/src/app/api/user/profile/route.ts` (added PATCH method)
