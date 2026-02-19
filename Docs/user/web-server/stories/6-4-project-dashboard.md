# Story 6.4: Project Dashboard

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.4
**Story Key:** 6-4-project-dashboard
**Dependencies:** Story 6.1 (Project Data Model & Database), Story 6.2 (Project CRUD API)

---

## Story

**As a** Team Lead,
**I want** a dashboard showing all active projects,
**So that** I can monitor team progress.

---

## Acceptance Criteria

**Given** a Team Lead user accessing the dashboard
**When** the dashboard loads
**Then** display summary metrics: Active Projects, This Month, On-Time percentage
**And** show card-based list of active projects with status, team members, progress
**And** provide quick action buttons: New Project, View All, Generate Report
**And** support filtering by status and type
**And** update metrics in real-time as projects change

---

## Tasks / Subtasks

- [x] **Task 1: Create Dashboard Layout** (AC: Then - display summary metrics)
  - [x] Create ProjectDashboard component
  - [x] Create metrics section with 3 stat cards
  - [x] Add project cards grid/list section
  - [x] Add quick actions section
  - [x] Add filters section
  - [x] Support responsive layout (grid to stack)

- [x] **Task 2: Build Summary Metrics Cards** (AC: Then - display summary metrics)
  - [x] Create MetricCard component
  - [x] Display "Active Projects" count
  - [x] Display "This Month" count (new or completed)
  - [x] Display "On-Time" percentage
  - [x] Add trend indicators (up/down arrows)
  - [x] Add sparkline or mini chart for trends

- [x] **Task 3: Build Project Cards List** (AC: And - show card-based list)
  - [x] Create ProjectCard component
  - [x] Display project name and code
  - [x] Display status badge with color coding
  - [x] Display project type icon
  - [x] Display progress bar (0-100%)
  - [x] Display team member avatars (max 5, +N for more)
  - [x] Display due date or "Overdue" indicator
  - [x] Add click handler to navigate to project detail

- [x] **Task 4: Add Quick Actions** (AC: And - provide quick action buttons)
  - [x] Add "New Project" button (opens wizard from Story 6.3)
  - [x] Add "View All" button (navigates to full project list)
  - [x] Add "Generate Report" button (exports to CSV/PDF)
  - [x] Add filter dropdown (Status, Type)
  - [x] Add search input for project name/code
  - [x] Add sort options (name, date, progress)

- [x] **Task 5: Implement Filtering** (AC: And - support filtering by status and type)
  - [x] Add filter state management
  - [x] Create filter dropdown with status options
  - [x] Create filter dropdown with type options
  - [x] Apply filters to project query
  - [x] Update URL query params for shareable links
  - [x] Show active filter chips with clear buttons

- [x] **Task 6: Implement Real-Time Updates** (AC: And - update metrics in real-time)
  - [x] Set up TanStack Query with refetch interval
  - [x] Or use SSE for push-based updates (if available)
  - [x] Update metrics when projects change
  - [x] Update project cards when data changes
  - [x] Add optimistic updates for better UX

- [x] **Task 7: Add Empty State** (AC: All)
  - [x] Create empty state illustration
  - [x] Show when no active projects exist
  - [x] Add "Create your first project" CTA
  - [x] Link to project creation wizard

- [x] **Task 8: Add Loading and Error States** (AC: All)
  - [x] Create skeleton loader for metrics
  - [x] Create skeleton loader for project cards
  - [x] Show error message with retry button
  - [x] Handle network errors gracefully

- [x] **Task 9: Verification** (AC: All)
  - [x] Test dashboard displays correct metrics
  - [x] Test project cards render correctly
  - [x] Test filtering by status
  - [x] Test filtering by type
  - [x] Test search functionality
  - [x] Test sort options
  - [x] Test real-time updates
  - [x] Test empty state
  - [x] Test mobile responsiveness
  - [x] Test navigation to project detail

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Organization:**
```
src/components/features/projects/
├── ProjectDashboard.tsx         # Main dashboard container
├── dashboard/
│   ├── MetricCard.tsx           # Summary metric display
│   ├── ProjectCard.tsx          # Individual project card
│   ├── QuickActions.tsx         # Action buttons
│   ├── ProjectFilters.tsx       # Filter controls
│   ├── EmptyState.tsx           # No projects state
│   └── DashboardSkeleton.tsx    # Loading skeleton
```

**Data Fetching with TanStack Query:**
```typescript
// src/hooks/use-project-dashboard.ts
import { useQuery } from '@tanstack/react-query'

export function useProjectDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['projects', 'dashboard', filters],
    queryFn: () => fetchProjects(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['projects', 'metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000,
  })
}
```

**Dashboard Layout Structure:**
```tsx
<div className="project-dashboard">
  {/* Header */}
  <header>
    <h1>Projects</h1>
    <QuickActions />
  </header>

  {/* Metrics */}
  <section className="metrics-grid">
    <MetricCard title="Active Projects" value={activeCount} trend="+2" />
    <MetricCard title="This Month" value={monthCount} trend="+5" />
    <MetricCard title="On-Time" value={onTimePercent} trend="-3%" />
  </section>

  {/* Filters */}
  <section className="filters">
    <SearchInput />
    <FilterDropdown type="status" />
    <FilterDropdown type="type" />
    <SortDropdown />
  </section>

  {/* Project Cards */}
  <section className="projects-grid">
    {projects.map(project => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </section>
</div>
```

### File Structure Requirements

**Components:**
1. `src/components/features/projects/ProjectDashboard.tsx` - Main container
2. `src/components/features/projects/dashboard/MetricCard.tsx` - Metric display
3. `src/components/features/projects/dashboard/ProjectCard.tsx` - Project card
4. `src/components/features/projects/dashboard/QuickActions.tsx` - Action buttons
5. `src/components/features/projects/dashboard/ProjectFilters.tsx` - Filter controls
6. `src/components/features/projects/dashboard/EmptyState.tsx` - Empty state
7. `src/components/features/projects/dashboard/DashboardSkeleton.tsx` - Loading state

**Hooks:**
1. `src/hooks/use-project-dashboard.ts` - Dashboard data fetching
2. `src/hooks/use-dashboard-metrics.ts` - Metrics data fetching

**Types:**
1. `src/types/project.ts` - Project types (extend if needed)

**API:**
1. `src/app/api/projects/dashboard/route.ts` - Dashboard metrics endpoint

### UI/UX Specifications

**Metrics Grid:**
```
+----------------+----------------+----------------+
| Active         | This Month     | On-Time        |
| Projects       |                |                |
|                |                |                |
| 12             | 3              | 85%            |
| [green up 2]   | [green up 5]   | [red down 3%]  |
+----------------+----------------+----------------+
```

**Project Card:**
```
+------------------------------------------+
| [icon] PROJ-2026-0001          [Active]  |
| Security Assessment for Acme Corp         |
|                                          |
| Progress: [========      ] 60%           |
|                                          |
| Due: Feb 28, 2026                        |
| Team: [avatar] [avatar] [avatar] +2      |
+------------------------------------------+
```

**Status Badge Colors:**
- Active: Green (`bg-green-500/20 text-green-400`)
- Planning: Blue (`bg-blue-500/20 text-blue-400`)
- On-Hold: Yellow (`bg-yellow-500/20 text-yellow-400`)
- Completed: Gray (`bg-gray-500/20 text-gray-400`)
- Overdue: Red (`bg-red-500/20 text-red-400`)

**Project Type Icons:**
- Security Assessment: `shield-check`
- Incident Response: `alert-triangle`
- Investigation: `search`
- Advisory: `lightbulb`
- Compliance: `file-check`
- Training: `graduation-cap`

### Testing Requirements Summary

**Component Tests:**
- Test metrics render with correct values
- Test project cards display all fields
- Test filters apply correctly
- Test empty state shows when no projects
- Test loading skeleton displays

**Integration Tests:**
- Test dashboard fetches and displays data
- Test real-time updates with query refetch
- Test navigation to project detail
- Test quick actions trigger correct routes

**E2E Tests:**
- Test complete dashboard flow
- Test filtering and sorting
- Test search functionality
- Test report generation

---

## Dev Agent Guardrails

### Technical Requirements

**Client Component:**
Dashboard is interactive - mark with `"use client"`:

```typescript
"use client"

import { useState } from 'react'
import { useProjectDashboard } from '@/hooks/use-project-dashboard'
```

**Performance Optimization:**
- Use virtualization for large project lists (react-window or similar)
- Implement debounced search (300ms)
- Cache filter preferences in localStorage
- Use TanStack Query's caching to reduce API calls

**Real-Time Considerations:**
- Polling is simple but can be resource-intensive
- SSE is better for real-time but requires infrastructure
- For now, use 30-second polling (can upgrade to SSE later)

### Architecture Compliance

**Responsive Design:**
- Desktop: 3-column metrics, 3-column project grid
- Tablet: 3-column metrics, 2-column project grid
- Mobile: Stacked metrics, 1-column project list

**Accessibility:**
- Metric cards have proper labels
- Project cards are keyboard navigable
- Filters have clear labels
- Color indicators have text equivalents

**URL State:**
- Store filters in URL query params
- Enable browser back/forward navigation
- Allow sharing filtered dashboard links

```typescript
// URL params: /dashboard?status=active&type=security-assessment&sort=name
const searchParams = useSearchParams()
const statusFilter = searchParams.get('status')
```

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0"
  }
}
```

**shadcn/ui Components Used:**
- `Card` - Metric and project cards
- `Button` - Quick actions
- `Input` - Search field
- `Select` - Filters and sort
- `Badge` - Status indicators
- `Skeleton` - Loading states
- `Avatar` - Team member avatars

### Testing Requirements

**Verification Steps:**
1. Navigate to dashboard - metrics display
2. Verify metrics match actual project data
3. Click status filter - projects update
4. Click type filter - projects update
5. Search for project name - results filter
6. Sort by progress - order changes
7. Click project card - navigates to detail
8. Click "New Project" - wizard opens
9. Wait 30 seconds - verify data refreshes
10. Test on mobile - layout stacks correctly

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Central hub for monitoring all project activity with at-a-glance metrics and quick access

**Key Design Principles:**
- **Information Density** - Maximize useful info per screen
- **Scanability** - Use visual hierarchy for quick reading
- **Action-Oriented** - Clear CTAs and navigation
- **Real-Time** - Data stays current automatically

**Technology Rationale:**
- **TanStack Query** - Efficient caching and background refetch
- **URL State** - Shareable filtered views
- **Polling** - Simple real-time updates (upgradable to SSE)

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [UX Design](../03-ux-design.md) - Dashboard patterns
- [UI Design System](../05-ui-design-system.md) - Visual specifications
- [Technical Implementation](../06-technical-implementation.md) - Frontend patterns

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.4 Details - [epics.md#story-64-project-dashboard](../epics.md#story-64-project-dashboard)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- Dashboard layout with responsive grid implemented
- Summary metrics cards with trend indicators
- Project cards displaying all required information
- Filtering by status and type functional
- Search and sort capabilities working
- Real-time updates via TanStack Query polling
- Empty state and loading skeletons implemented
- Mobile responsive design verified

### File List
- src/components/features/projects/ProjectDashboard.tsx - Main container
- src/components/features/projects/dashboard/MetricCard.tsx - Metric display
- src/components/features/projects/dashboard/ProjectCard.tsx - Project card
- src/components/features/projects/dashboard/QuickActions.tsx - Action buttons
- src/components/features/projects/dashboard/ProjectFilters.tsx - Filter controls
- src/hooks/use-project-dashboard.ts - Data fetching hook
