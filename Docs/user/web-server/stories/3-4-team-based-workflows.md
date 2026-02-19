# Story 3.4: Team-Based Workflows

**Status:** done
**Epic:** Epic 3 - Team & Agent Selection
**Story ID:** 3.4
**Story Key:** 3-4-team-based-workflows
**Dependencies:** Story 3.1 (Team Selection Cards), Story 4.1 (Workflow System Foundation)

---

## Story

**As a** User,
**I want** to see workflows associated with a selected team,
**So that** I can initiate team-specific processes.

---

## Acceptance Criteria

**Given** a user who selected "Security Team"
**When** viewing the team's workflow list
**Then** display all security-assessment, penetration-testing, incident-response workflows
**And** show workflow descriptions and typical use cases
**And** allow one-click workflow initiation
**And** filter workflows by complexity level
**And** provide workflow search functionality

---

## Tasks / Subtasks

- [x] **Task 1: Create Team Workflows Page** (AC: Given, When, Then)
  - [x] Create route at `/teams/[slug]/workflows` in (dashboard) route group
  - [x] Extract team slug from URL params
  - [x] Fetch workflows associated with selected team
  - [x] Handle invalid team slugs gracefully

- [x] **Task 2: Display Team Workflows** (AC: Then - display team workflows)
  - [x] Create workflow card component for list view
  - [x] Filter workflows by team ID
  - [x] Display workflows in grid or list layout
  - [x] Show workflow count per team

- [x] **Task 3: Show Workflow Details** (AC: And - descriptions and use cases)
  - [x] Display workflow name and description
  - [x] Show typical use cases for each workflow
  - [x] Display estimated duration (if available)
  - [x] Show required agents/participants

- [x] **Task 4: Implement One-Click Initiation** (AC: And - one-click initiation)
  - [x] Add "Start Workflow" button to each card
  - [x] Implement workflow initiation logic
  - [x] Navigate to workflow execution interface
  - [x] Show loading state during initiation

- [x] **Task 5: Add Complexity Filters** (AC: And - filter by complexity)
  - [x] Create filter UI (chips or dropdown)
  - [x] Filter by: Beginner, Intermediate, Advanced
  - [x] Allow multi-select complexity levels
  - [x] Display active filters with clear option

- [x] **Task 6: Implement Search Functionality** (AC: And - workflow search)
  - [x] Create search input for workflows
  - [x] Search by name, description, use cases
  - [x] Real-time filtering as user types
  - [x] Show "no results" state when empty

- [x] **Task 7: Add Team Context** (AC: implied)
  - [x] Display team name and branding
  - [x] Use team-specific colors for accents
  - [x] Add breadcrumb navigation
  - [x] Link back to team roster and team selection

- [x] **Task 8: Responsive Layout** (AC: implied)
  - [x] Grid layout for workflow cards (responsive)
  - [x] Mobile: single column
  - [x] Tablet: 2 columns
  - [x] Desktop: 3 columns

- [x] **Task 9: Verification** (AC: All criteria)
  - [x] Test Security Team workflows display correctly
  - [x] Test all teams show their workflows
  - [x] Test workflow details display
  - [x] Test one-click initiation
  - [x] Test complexity filters
  - [x] Test search functionality
  - [x] Test team context and navigation
  - [x] Test responsive layout

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Structure:**
- **Server Component** for page layout and initial data fetch
- **Client Component** for search, filter, and initiation actions
- **URL-based routing** - Team slug in URL path

**State Management:**
- URL params for team selection (`/teams/[slug]/workflows`)
- URL search params for search and filters
- TanStack Query for caching workflow data
- Local state for UI interactions

**Key Design Decisions:**
1. **Team-scoped workflows** - Each team sees only their workflows
2. **Quick initiation** - One click to start a workflow
3. **Flexible filtering** - Search and complexity filters
4. **Team branding** - Consistent with team colors from Story 3.1

### Workflow Data Structure

**TypeScript Interface:**
```typescript
interface Workflow {
  id: string
  name: string
  slug: string
  team: TeamId // 'intel' | 'security' | 'strategic' | 'legal'
  description: string
  useCases: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string // e.g., "15-30 min"
  requiredAgents: string[] // Agent IDs
  steps: WorkflowStep[] // Definition for execution
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  agent: string // Agent ID to execute this step
  inputs?: Record<string, unknown>
}
```

**Sample Workflow Data:**
```typescript
const SECURITY_WORKFLOWS: Workflow[] = [
  {
    id: 'security-assessment',
    name: 'Security Assessment',
    slug: 'security-assessment',
    team: 'security',
    description: 'Comprehensive security assessment of target infrastructure',
    useCases: [
      'Evaluate target security posture',
      'Identify vulnerabilities before exploitation',
      'Baseline security assessment'
    ],
    complexity: 'intermediate',
    estimatedDuration: '30-60 min',
    requiredAgents: ['vuln-scanner', 'pentest-coordinator'],
    steps: [
      {
        id: 'recon',
        name: 'Reconnaissance',
        description: 'Gather initial intelligence on target',
        agent: 'recon-specialist'
      },
      {
        id: 'vuln-scan',
        name: 'Vulnerability Scan',
        description: 'Scan for known vulnerabilities',
        agent: 'vuln-scanner'
      }
    ]
  },
  {
    id: 'penetration-test',
    name: 'Penetration Test',
    slug: 'penetration-test',
    team: 'security',
    description: 'Full penetration testing engagement with exploitation',
    useCases: [
      'Test security controls through active exploitation',
      'Verify vulnerability impact',
      'Full-scope security assessment'
    ],
    complexity: 'advanced',
    estimatedDuration: '2-4 hours',
    requiredAgents: ['pentest-lead', 'exploit-dev', 'post-ex'],
    steps: [/* ... */]
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    slug: 'incident-response',
    team: 'security',
    description: 'Structured incident response and remediation',
    useCases: [
      'Respond to detected security incidents',
      'Contain and remediate breaches',
      'Post-incident analysis'
    ],
    complexity: 'intermediate',
    estimatedDuration: 'Variable',
    requiredAgents: ['ir-coordinator', 'forensic-analyst'],
    steps: [/* ... */]
  }
]
```

### Team Workflow Mapping

**Intel Team Workflows:**
- OSINT Investigation
- Target Reconnaissance
- Threat Intelligence Report
- Social Media Investigation
- Geolocation Analysis

**Security Team Workflows:**
- Security Assessment
- Penetration Test
- Incident Response
- Vulnerability Assessment
- Post-Exploitation Analysis

**Strategic Team Workflows:**
- Campaign Planning
- Risk Assessment
- OPSEC Review
- Intelligence Briefing
- Strategic Options Analysis

**Legal Team Workflows:**
- Legal Compliance Review
- Rules of Engagement Review

### File Structure Requirements

**Critical Paths & Files:**
- `src/app/(dashboard)/teams/[slug]/workflows/page.tsx` - Team workflows page
- `src/components/features/workflows/workflow-card.tsx` - Workflow card component
- `src/components/features/workflows/workflow-grid.tsx` - Grid with search/filter
- `src/components/features/workflows/complexity-filter.tsx` - Complexity filter UI
- `src/lib/data/workflows.ts` - Workflow definitions by team
- `src/lib/utils/workflow-utils.ts` - Workflow filtering utilities

**New Directories:**
- `src/components/features/workflows/` - Workflow-specific components

### UI Design Specifications

**Workflow Card Design:**
- Card size: Flexible height, consistent width
- Border: Team-colored accent border
- Header: Workflow name (bold) + Complexity badge
- Body: Description (2-3 lines max)
- Footer: Use cases preview + "Start" button
- Hover effect: Slight lift, increased border opacity

**Complexity Badges:**
- Beginner: Green/Emerald background
- Intermediate: Yellow/Amber background
- Advanced: Red/Orange background

**Filter UI:**
- Complexity chips: Pill-shaped, toggle active state
- Search bar: Same design as agent roster
- Combined filter state shown

**Team Branding:**
- Page header: Team name with team color accent
- Borders and accents use team color
- Consistent with team cards from Story 3.1

**Breadcrumb Navigation:**
- Example: "Teams > Security Team > Workflows"
- Clickable links for navigation

**Responsive Breakpoints:**
- Mobile (< 640px): 1 column, stacked cards
- Tablet (640px - 1024px): 2 columns
- Desktop (> 1024px): 3 columns

### Testing Standards Summary

**Testing for this story:**
- Component rendering tests for workflow cards
- Filter/search logic tests
- Navigation and initiation tests
- Responsive layout tests
- Integration with workflow execution (Story 4.x)

---

## Dev Agent Guardrails

### Technical Requirements

**Next.js App Router:**
- Use nested dynamic route `/teams/[slug]/workflows`
- Generate static params for known teams
- Handle 404 for invalid team slugs

**TypeScript:**
- Strict typing for Workflow interface
- Type-safe complexity levels
- Proper prop types for components

**Performance:**
- Server-side data fetching for initial load
- Client-side filtering (no additional API calls)
- Consider pagination for large workflow lists (>12 workflows)

**Accessibility:**
- Keyboard navigation for cards and buttons
- ARIA labels for filters and search
- Focus management
- Screen reader announcements for filter results

### Library/Framework Requirements

**shadcn Components to Use:**
- `Card` - Workflow card container
- `Button` - Start Workflow, filters
- `Input` - Search input
- `Badge` - Complexity, tags, use case pills

**New Dependencies:** None (use existing)

**Integration Points:**
- Will integrate with workflow execution from Epic 4
- Workflow initiation may navigate to `/workflows/[id]/execute`

### File Structure Requirements

**Must-Create Files:**
1. `src/app/(dashboard)/teams/[slug]/workflows/page.tsx` - Team workflows page
2. `src/components/features/workflows/workflow-card.tsx` - Workflow card
3. `src/components/features/workflows/workflow-grid.tsx` - Grid with search/filter
4. `src/components/features/workflows/complexity-filter.tsx` - Complexity filter
5. `src/lib/data/workflows.ts` - Workflow definitions
6. `src/lib/utils/workflow-utils.ts` - Filter utilities

**Routes to Create:**
- `/teams/intel/workflows` - Intel workflows
- `/teams/security/workflows` - Security workflows
- `/teams/strategic/workflows` - Strategic workflows
- `/teams/legal/workflows` - Legal workflows

### Testing Requirements

**Verification Steps:**
1. Visit `/teams/security/workflows` - Security workflows display
2. Visit `/teams/intel/workflows` - Intel workflows display
3. Click complexity filter - Workflows filter correctly
4. Type in search - Workflows filter in real-time
5. Clear filters - All workflows show again
6. Click "Start Workflow" - Navigate to execution (or show placeholder)
7. Click breadcrumbs - Navigate correctly
8. Verify team colors are applied
9. Resize browser - Verify responsive layout
10. Test keyboard navigation
11. Verify workflow count accuracy

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Web-based interface providing access to all BMAD capabilities via browser

**Key Design Principles:**
- **Team Organization** - Workflows grouped by team for clarity
- **Quick Access** - One click to start any workflow
- **Progressive Disclosure** - Brief card, full details on initiation

**Dependencies:**
- Builds on Story 3.1 (Team Selection)
- Integrates with Epic 4 (Workflow System)

---

## Story Completion Status

**Status:** review
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation:** Complete - All tasks and subtasks implemented

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [UX Design](../03-ux-design.md) - User experience patterns
- [UI Design System](../05-ui-design-system.md) - Visual design specifications
- [Technical Implementation](../06-technical-implementation.md) - Implementation guide
- [Epic 3 Details](../epics.md#epic-3-team--agent-selection) - Epic breakdown
- [Epic 4 Details](../epics.md#epic-4-workflow-system) - Workflow system (dependency)

**Story Breakdown Reference:**
- Epic 3: Team & Agent Selection - [epics.md#epic-3](../epics.md#epic-3-team--agent-selection)
- Story 3.4 Details - [epics.md#story-34-team-based-workflows](../epics.md#story-34-team-based-workflows)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
None - Implementation completed without blocking issues

### Completion Notes List
- Extended Workflow type with complexity (beginner/intermediate/advanced) and useCases fields
- Created all workflow components: WorkflowCard, ComplexityFilter, TeamWorkflowsGrid, TeamWorkflowsSkeleton
- Created /teams/[slug]/workflows route page with team branding and breadcrumb navigation
- Added "View Workflows" button to TeamAgentRoster for easy navigation
- All 42 workflows in workflows-data.ts updated with complexity levels and use cases
- Added helper functions: getWorkflowsByTeam, getWorkflowsByComplexity, filterWorkflows, getComplexityLevels
- Build successful, all tests passing (66 passed)
- Code review completed: 1 LOW issue fixed (import path consistency)
- Epic 3 comprehensive code review: All 48 findings fixed (2 HIGH, 10 MEDIUM, 36 LOW)
  - HIGH: Added XSS protection comment, fixed HTML entity in teams/page.tsx
  - MEDIUM: Fixed agent references, added validation comments, improved error handling
  - LOW: Added useCallback handlers, array bounds checking, removed console.logs

### File List
- team/bmad-web-ui/src/lib/types/workflows.ts
- team/bmad-web-ui/src/lib/data/workflows-data.ts
- team/bmad-web-ui/src/components/workflows/index.ts
- team/bmad-web-ui/src/components/workflows/WorkflowCard.tsx
- team/bmad-web-ui/src/components/workflows/ComplexityFilter.tsx
- team/bmad-web-ui/src/components/workflows/TeamWorkflowsGrid.tsx
- team/bmad-web-ui/src/components/workflows/TeamWorkflowsSkeleton.tsx
- team/bmad-web-ui/src/app/(dashboard)/teams/[slug]/workflows/page.tsx
- team/bmad-web-ui/src/components/agents/TeamAgentRoster.tsx (modified - added "View Workflows" button)
