# Story 6.5: Project Detail View - Overview Tab

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.5
**Story Key:** 6-5-project-detail-view-overview-tab
**Dependencies:** Story 6.1 (Project Data Model & Database), Story 6.2 (Project CRUD API)

---

## Story

**As a** User,
**I want** a comprehensive overview of a project,
**So that** I can understand its current state.

---

## Acceptance Criteria

**Given** a user viewing a project detail page
**When** the Overview tab is active
**Then** display project header with status badge, phase, completion percentage
**And** show tab navigation: Overview, Workflows, Artifacts, Team, Deliverables
**And** Overview tab displays: Workflows progress list, Team members, Deliverables tracker
**And** each workflow shows status (completed, in-progress, pending) and timestamp
**And** allow adding workflows via "+ Add Workflow" button

---

## Tasks / Subtasks

- [x] **Task 1: Create Project Detail Page Layout** (AC: Then - display project header)
  - [x] Create ProjectDetailPage component
  - [x] Create project header section
  - [x] Add status badge with color coding
  - [x] Add phase indicator
  - [x] Add completion percentage with progress bar
  - [x] Add project metadata (code, dates, client info)
  - [x] Add action buttons (edit, archive, share)

- [x] **Task 2: Build Tab Navigation** (AC: And - show tab navigation)
  - [x] Create ProjectTabs component
  - [x] Add tabs: Overview, Workflows, Artifacts, Team, Deliverables
  - [x] Implement tab switching logic
  - [x] Update URL query param for active tab
  - [x] Show active tab indicator
  - [x] Support keyboard navigation (arrow keys)

- [x] **Task 3: Build Overview Tab - Workflows Section** (AC: And - displays Workflows progress list)
  - [x] Create WorkflowsList component
  - [x] Display each workflow with name and status
  - [x] Show status badges (completed, in-progress, pending)
  - [x] Show timestamps (created, updated, completed)
  - [x] Add status icons for visual clarity
  - [x] Add click handler to view workflow details
  - [x] Show empty state if no workflows

- [x] **Task 4: Build Overview Tab - Team Section** (AC: And - displays Team members)
  - [x] Create TeamSummary component
  - [x] Display team members with avatars
  - [x] Show member roles (owner, lead, member, viewer)
  - [x] Add "View All Team" link to full team tab
  - [x] Add "Add Member" button for authorized users
  - [x] Show member count summary

- [x] **Task 5: Build Overview Tab - Deliverables Section** (AC: And - displays Deliverables tracker)
  - [x] Create DeliverablesTracker component
  - [x] Display deliverables with status
  - [x] Show due dates with overdue indicators
  - [x] Show approval status
  - [x] Add progress bar for overall deliverable completion
  - [x] Add "View All Deliverables" link
  - [x] Show empty state if no deliverables

- [x] **Task 6: Add Add Workflow Functionality** (AC: And - allow adding workflows)
  - [x] Create AddWorkflowButton component
  - [x] Create AddWorkflowDialog component
  - [x] Add workflow name input
  - [x] Add workflow description input
  - [x] Add workflow type selector
  - [x] Implement API call to create workflow
  - [x] Refresh workflows list after creation

- [x] **Task 7: Add Loading and Error States** (AC: All)
  - [x] Create loading skeleton for project header
  - [x] Create loading skeleton for each section
  - [x] Show error message with retry button
  - [x] Handle 404 (project not found)
  - [x] Handle 403 (access denied)

- [x] **Task 8: Add Visual Polish** (AC: All)
  - [x] Add hover effects on clickable elements
  - [x] Add transitions for tab switching
  - [x] Add focus states for accessibility
  - [x] Ensure dark mode consistency
  - [x] Add responsive design for mobile

- [x] **Task 9: Verification** (AC: All)
  - [x] Test project detail page loads correctly
  - [x] Test tab navigation works
  - [x] Test workflows section displays correctly
  - [x] Test team section displays correctly
  - [x] Test deliverables section displays correctly
  - [x] Test adding new workflow
  - [x] Test URL query param updates on tab change
  - [x] Test mobile responsiveness
  - [x] Test permission checks for edit actions

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Organization:**
```
src/components/features/projects/
├── ProjectDetailPage.tsx          # Main detail page
├── detail/
│   ├── ProjectHeader.tsx          # Project header section
│   ├── ProjectTabs.tsx            # Tab navigation
│   ├── tabs/
│   │   ├── OverviewTab.tsx        # Overview tab content
│   │   ├── WorkflowsTab.tsx       # (Future story)
│   │   ├── ArtifactsTab.tsx       # (Future story)
│   │   ├── TeamTab.tsx            # (Future story)
│   │   └── DeliverablesTab.tsx    # (Future story)
│   ├── overview/
│   │   ├── WorkflowsList.tsx      # Workflows in overview
│   │   ├── TeamSummary.tsx        # Team in overview
│   │   └── DeliverablesTracker.tsx # Deliverables in overview
│   └── dialogs/
│       └── AddWorkflowDialog.tsx  # Add workflow modal
```

**Page URL Structure:**
```
/projects/[projectId]?tab=overview
/projects/[projectId]?tab=workflows
/projects/[projectId]?tab=artifacts
/projects/[projectId]?tab=team
/projects/[projectId]?tab=deliverables
```

**Data Fetching with TanStack Query:**
```typescript
// src/hooks/use-project-detail.ts
import { useQuery } from '@tanstack/react-query'

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  })
}

export function useProjectWorkflows(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'workflows'],
    queryFn: () => fetchWorkflows(projectId),
    enabled: !!projectId,
  })
}

export function useProjectTeam(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'team'],
    queryFn: () => fetchProjectTeam(projectId),
    enabled: !!projectId,
  })
}

export function useProjectDeliverables(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'deliverables'],
    queryFn: () => fetchDeliverables(projectId),
    enabled: !!projectId,
  })
}
```

**Project Header Layout:**
```tsx
<header className="project-header">
  <div className="header-top">
    <h1>{project.name}</h1>
    <div className="actions">
      <Button variant="ghost">Edit</Button>
      <Button variant="ghost">Archive</Button>
      <Button>Share</Button>
    </div>
  </div>

  <div className="header-meta">
    <Badge variant={statusVariant}>{project.status}</Badge>
    <span className="phase">{project.phase}</span>
    <span className="code">{project.code}</span>
  </div>

  <div className="progress-section">
    <div className="progress-bar">
      <div className="fill" style={{ width: `${project.completion}%` }} />
    </div>
    <span className="percentage">{project.completion}%</span>
  </div>

  <div className="dates">
    <span>Started: {formatDate(project.startDate)}</span>
    <span>Target: {formatDate(project.targetDate)}</span>
  </div>
</header>
```

### File Structure Requirements

**Page Component:**
1. `src/app/(dashboard)/projects/[projectId]/page.tsx` - Project detail page

**Components:**
1. `src/components/features/projects/ProjectDetailPage.tsx` - Main container
2. `src/components/features/projects/detail/ProjectHeader.tsx` - Header
3. `src/components/features/projects/detail/ProjectTabs.tsx` - Tabs
4. `src/components/features/projects/detail/tabs/OverviewTab.tsx` - Overview
5. `src/components/features/projects/detail/overview/WorkflowsList.tsx` - Workflows
6. `src/components/features/projects/detail/overview/TeamSummary.tsx` - Team
7. `src/components/features/projects/detail/overview/DeliverablesTracker.tsx` - Deliverables
8. `src/components/features/projects/detail/dialogs/AddWorkflowDialog.tsx` - Add workflow

**Hooks:**
1. `src/hooks/use-project-detail.ts` - Project data fetching
2. `src/hooks/use-project-workflows.ts` - Workflows fetching
3. `src/hooks/use-project-team.ts` - Team fetching
4. `src/hooks/use-project-deliverables.ts` - Deliverables fetching

**API Routes:**
1. `src/app/api/projects/[projectId]/route.ts` - Single project GET/PATCH/DELETE
2. `src/app/api/projects/[projectId]/workflows/route.ts` - Workflows CRUD

### UI/UX Specifications

**Status Badge Colors:**
- Planning: Blue (`bg-blue-500/20 text-blue-400`)
- Active: Green (`bg-green-500/20 text-green-400`)
- On-Hold: Yellow (`bg-yellow-500/20 text-yellow-400`)
- Completed: Gray (`bg-gray-500/20 text-gray-400`)
- Archived: Dark Gray (`bg-gray-700/50 text-gray-400`)

**Workflow Status Indicators:**
- Completed: Green checkmark icon
- In Progress: Blue spinner or dots
- Pending: Gray circle

**Workflow List Item:**
```
+------------------------------------------+
| [check] Initial Scoping                  |
| Completed 2 days ago                     |
+------------------------------------------+
| [spinner] Vulnerability Assessment       |
| Started 5 hours ago                      |
+------------------------------------------+
| [circle] Exploitation Testing            |
| Not started                              |
+------------------------------------------+
```

**Deliverables Tracker:**
```
+------------------------------------------+
| Deliverables Progress                    |
| [==========      ] 60% (3 of 5)          |
|                                          |
| [check] Methodology                      |
| [check] Initial Report                   |
| [check] Technical Report                 |
| [pending] Final Report                   |
| [pending] Executive Summary              |
+------------------------------------------+
```

**Tab Navigation:**
```
+-----+------+------+------+------+
| Overview | Workflows | Artifacts | Team | Deliverables |
+-----+------+------+------+------+
     ^ active tab indicator
```

### Testing Requirements Summary

**Component Tests:**
- Test header displays all project info
- Test tab navigation switches content
- Test workflows list renders correctly
- Test team summary shows members
- Test deliverables tracker shows progress
- Test add workflow dialog opens and submits

**Integration Tests:**
- Test page loads project data
- Test tab switching updates URL
- Test add workflow creates and refreshes
- Test navigation from dashboard
- Test error handling for missing project

**E2E Tests:**
- Test complete project detail flow
- Test tab navigation
- Test adding workflow
- Test navigating to workflow details
- Test editing project

---

## Dev Agent Guardrails

### Technical Requirements

**Client Component:**
Project detail is highly interactive - mark page and components with `"use client"`:

```typescript
"use client"

import { use } from 'react'
import { useProjectDetail } from '@/hooks/use-project-detail'
```

**URL State Management:**
- Use `useSearchParams()` to get active tab
- Update URL query param on tab change
- Support direct linking to specific tabs
- Maintain browser history

**Permission Checking:**
- Hide edit buttons for non-owners
- Disable add workflow for non-members
- Show appropriate error for unauthorized access
- Verify access at API level too

### Architecture Compliance

**Responsive Design:**
- Desktop: Multi-column layout
- Tablet: Single column, stacked sections
- Mobile: Compact header, stacked content, horizontal scroll for tabs

**Accessibility:**
- Use semantic HTML (header, nav, section)
- Support keyboard navigation for tabs
- Add ARIA labels where needed
- Ensure color contrast meets WCAG AA

**Performance:**
- Lazy load tab content
- Prefetch data for adjacent tabs
- Use TanStack Query caching
- Implement optimistic updates for mutations

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

**shadcn/ui Components Used:**
- `Badge` - Status indicators
- `Button` - Actions
- `Tabs` - Tab navigation
- `Progress` - Completion bars
- `Dialog` - Add workflow modal
- `Avatar` - Team member avatars
- `Card` - Section containers
- `Skeleton` - Loading states

### Testing Requirements

**Verification Steps:**
1. Navigate to /projects/[projectId] - page loads
2. Verify header shows correct project info
3. Click each tab - content updates, URL changes
4. Verify Overview tab shows all sections
5. Click "Add Workflow" - dialog opens
6. Submit workflow form - workflow added, list updates
7. Click workflow item - navigates to workflow detail (when implemented)
8. Test on mobile - tabs scroll horizontally, content stacks
9. Try to access with invalid ID - shows 404
10. Try to access without permission - shows 403

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Comprehensive project detail view with organized tabs and at-a-glance overview

**Key Design Principles:**
- **Organized** - Logical tab grouping of related info
- **Actionable** - Quick actions visible and accessible
- **Informative** - All key project data visible in overview
- **Navigable** - Easy to drill down into details

**Technology Rationale:**
- **URL-based tabs** - Shareable links, browser history
- **TanStack Query** - Efficient data fetching and caching
- **Component colocation** - Keep related components together

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
- [UX Design](../03-ux-design.md) - Detail view patterns
- [UI Design System](../05-ui-design-system.md) - Component specifications
- [Technical Implementation](../06-technical-implementation.md) - Frontend patterns

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.5 Details - [epics.md#story-65-project-detail-view-overview-tab](../epics.md#story-65-project-detail-view-overview-tab)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- Project detail page with header and metadata implemented
- Tab navigation with URL query param sync working
- Overview tab displaying workflows, team, and deliverables
- Add workflow dialog functional
- Loading and error states handled properly
- Permission checks for edit actions implemented
- Mobile responsive design verified

### File List
- src/app/projects/[projectId]/page.tsx - Project detail page
- src/components/features/projects/detail/ProjectHeader.tsx - Header component
- src/components/features/projects/detail/ProjectTabs.tsx - Tab navigation
- src/components/features/projects/detail/tabs/OverviewTab.tsx - Overview tab
- src/components/features/projects/detail/overview/WorkflowsList.tsx - Workflows list
- src/components/features/projects/detail/overview/TeamSummary.tsx - Team summary
- src/components/features/projects/detail/overview/DeliverablesTracker.tsx - Deliverables
- src/components/features/projects/detail/dialogs/AddWorkflowDialog.tsx - Add workflow modal
