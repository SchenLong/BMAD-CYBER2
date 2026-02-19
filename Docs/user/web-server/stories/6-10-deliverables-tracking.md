# Story 6.10: Deliverables Tracking

**Status:** ready-for-dev
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.10
**Story Key:** 6-10-deliverables-tracking
**Dependencies:** Story 6.1 (Project Core), Story 6.2 (Project CRUD), Story 6.9 (Team Management)

---

## Story

**As a** Project Lead,
**I want** to track project deliverables and their status,
**So that** I can ensure on-time delivery.

---

## Acceptance Criteria

**Given** a project with defined deliverables
**When** viewing the Deliverables tab
**Then** display deliverable list with: name, due date, status, assignee
**And** status values: Pending, In Progress, Review, Complete
**And** allow adding deliverables with title, description, due date, assignee
**And** provide status update with one-click cycling
**And** show visual progress bar for overall completion
**And** highlight overdue deliverables

---

## Tasks / Subtasks

- [ ] **Task 1: Deliverable Data Model** (AC: Given - project with defined deliverables)
  - [ ] Create Deliverable database schema
  - [ ] Define status enum: Pending, In Progress, Review, Complete
  - [ ] Add deliverables relationship to Project model
  - [ ] Create deliverable priority levels (optional)
  - [ ] Set up deliverable dependencies (optional future enhancement)
  - [ ] Add deliverable completion tracking

- [ ] **Task 2: Deliverables List Display** (AC: When - viewing Deliverables tab, Then - display list)
  - [ ] Create DeliverablesTab component
  - [ ] Create DeliverableList table/grid component
  - [ ] Display columns: Name, Description, Due Date, Status, Assignee, Priority
  - [ ] Format due dates with relative time (e.g., "In 3 days", "Overdue by 2 days")
  - [ ] Add sorting by due date, status, priority
  - [ ] Implement filtering by status and assignee
  - [ ] Support pagination for large deliverable lists

- [ ] **Task 3: Status Management** (AC: And - status values, And - one-click cycling)
  - [ ] Create StatusBadge component with visual indicators
  - [ ] Implement status color coding (Pending=gray, In Progress=blue, Review=yellow, Complete=green)
  - [ ] Create one-click status cycling button
  - [ ] Define status transition order: Pending -> In Progress -> Review -> Complete
  - [ ] Add status change confirmation for Complete
  - [ ] Implement status change audit trail
  - [ ] Add status change notifications to assignee

- [ ] **Task 4: Deliverable Creation** (AC: And - adding deliverables)
  - [ ] Create AddDeliverableDialog component
  - [ ] Implement form fields: title (required), description, due date (required), assignee, priority
  - [ ] Add assignee selector from project team members
  - [ ] Implement date picker with due date validation
  - [ ] Add rich text description editor (markdown support)
  - [ ] Create deliverable template selection (optional)
  - [ ] Add deliverable tags/categories

- [ ] **Task 5: Deliverable Editing & Deletion** (AC: Then - track deliverables)
  - [ ] Create EditDeliverableDialog component
  - [ ] Allow editing all fields except creation timestamp
  - [ ] Implement delete with confirmation dialog
  - [ ] Add deliverable history view
  - [ ] Support bulk actions (update status, delete)
  - [ ] Add deliverable cloning

- [ ] **Task 6: Progress Visualization** (AC: And - visual progress bar)
  - [ ] Create ProgressBar component for overall completion
  - [ ] Calculate percentage: (Complete / Total) * 100
  - [ ] Display status breakdown (e.g., "3/5 Complete, 1 In Progress")
  - [ ] Add visual timeline view (Gantt-style, optional)
  - [ ] Show milestone indicators for key deliverables
  - [ ] Display predicted completion date based on progress

- [ ] **Task 7: Overdue Highlighting** (AC: And - highlight overdue)
  - [ ] Identify overdue deliverables (due date < today AND status != Complete)
  - [ ] Highlight overdue items with red background or border
  - [ ] Add overdue badge/icon to affected rows
  - [ ] Show overdue count in tab header
  - [ ] Create overdue filter/view
  - [ ] Send overdue notifications to assignees (optional)
  - [ ] Add calendar view with overdue indicators

- [ ] **Task 8: Deliverable Detail View** (AC: Then - tracking)
  - [ ] Create DeliverableDetail modal/page
  - [ ] Display complete deliverable information
  - [ ] Show history of status changes
  - [ ] Add comments/discussion section
  - [ ] Link related deliverables
  - [ ] Attach files/documents
  - [ ] Show task dependencies if implemented

- [ ] **Task 9: Integration with Other Features** (AC: All)
  - [ ] Link deliverables to project milestones
  - [ ] Connect deliverables to team member workload
  - [ ] Integrate with evidence locker for deliverable attachments
  - [ ] Support deliverable templates for common project types
  - [ ] Add deliverable export to report templates (Epic 7)

- [ ] **Task 10: Testing & Verification** (AC: All)
  - [ ] Test deliverable creation with all fields
  - [ ] Verify deliverable list displays correctly
  - [ ] Test one-click status cycling
  - [ ] Verify progress bar calculates correctly
  - [ ] Test overdue highlighting appears for past-due items
  - [ ] Verify assignee receives notifications
  - [ ] Test deliverable editing and deletion
  - [ ] Verify filters and sorting work
  - [ ] Test deliverable detail view

---

## Dev Notes

### Architecture Patterns & Constraints

**Deliverable Data Model:**
```typescript
interface Deliverable {
  id: string;                  // DEL-NNNNNN
  projectId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'review' | 'complete';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  dueDate: Date;
  assigneeId?: string;
  assignee?: {
    userId: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags: string[];
  attachments: string[];       // file IDs
  history: DeliverableHistory[];
  dependencies?: string[];     // IDs of prerequisite deliverables
}

interface DeliverableHistory {
  id: string;
  deliverableId: string;
  action: 'created' | 'updated' | 'status-changed' | 'assigned' | 'completed';
  userId: string;
  timestamp: Date;
  details: {
    field?: string;
    oldValue?: any;
    newValue?: any;
  };
}

interface ProjectWithDeliverables extends Project {
  deliverables: Deliverable[];
  deliverableProgress: {
    total: number;
    pending: number;
    inProgress: number;
    inReview: number;
    complete: number;
    percentage: number;
  };
  overdueCount: number;
}
```

**Component Structure:**
- **DeliverablesTab** - Main deliverables container
- **DeliverableList** - Table/grid of deliverables
- **DeliverableRow** - Individual deliverable display
- **DeliverableForm** - Create/edit form
- **StatusBadge** - Status indicator
- **ProgressBar** - Overall progress visualization
- **OverdueIndicator** - Overdue highlighting
- **DeliverableDetail** - Expanded deliverable view

### UI/UX Requirements

**Status Workflow:**
1. **Pending** (Gray) - Not started
2. **In Progress** (Blue) - Work underway
3. **Review** (Yellow) - Ready for review
4. **Complete** (Green) - Finished and approved

**Visual Design:**
- Status badges with color coding
- Progress bar at top of tab showing overall completion
- Overdue items highlighted with red styling
- Due dates formatted with relative time for easy scanning
- Assignee avatars for quick identification

**Priority Levels (optional):**
- Critical - Red, must complete ASAP
- High - Orange, important
- Medium - Yellow, normal priority
- Low - Blue, nice to have

**Quick Actions:**
- One-click status cycle: click badge to advance to next status
- Quick add button in tab header
- Bulk status update for multiple deliverables
- Calendar view toggle

### File Structure Requirements

**New Components:**
```
src/components/features/deliverables/
├── DeliverablesTab.tsx
├── DeliverableList.tsx
├── DeliverableRow.tsx
├── DeliverableForm.tsx
├── AddDeliverableDialog.tsx
├── EditDeliverableDialog.tsx
├── DeliverableDetail.tsx
├── StatusBadge.tsx
├── ProgressBar.tsx
├── OverdueIndicator.tsx
├── DeliverableFilters.tsx
└── types.ts
```

**API Endpoints:**
```
GET    /api/projects/:id/deliverables              # List all
POST   /api/projects/:id/deliverables              # Create
GET    /api/projects/:id/deliverables/:id          # Get details
PUT    /api/projects/:id/deliverables/:id          # Update
DELETE /api/projects/:id/deliverables/:id          # Delete
PATCH  /api/projects/:id/deliverables/:id/status   # Update status
GET    /api/projects/:id/deliverables/progress     # Get overall progress
GET    /api/projects/:id/deliverables/overdue      # Get overdue items
GET    /api/projects/:id/deliverables/:id/history  # Get history
```

### Testing Requirements

**Manual Testing Checklist:**
1. Open Deliverables tab - verify list displays
2. Add new deliverable with all fields - verify it appears
3. Test one-click status cycling - verify status advances
4. Change status to Complete - verify progress bar updates
5. Create deliverable with past due date - verify it highlights as overdue
6. Assign deliverable to team member - verify assignment shows
7. Filter by status - verify correct items show
8. Sort by due date - verify ordering
9. Edit deliverable - verify changes save
10. Delete deliverable - verify it removes from list
11. View deliverable details - verify all info shows

---

## Dev Agent Guardrails

### Technical Requirements

**State Management:**
- Use TanStack Query for deliverables data with caching
- Create deliverables-specific Zustand store for UI state (filters, sort)
- Implement optimistic updates for status changes
- Revalidate progress calculation on any status change

**Form Validation:**
- Title is required (max 200 chars)
- Due date is required and must be future date
- Description optional (markdown supported)
- Assignee must be project team member
- Tags limited to 10 per deliverable

**Date Handling:**
- Use date-fns for date formatting and calculations
- Store dates as ISO 8601 strings in database
- Display in user's timezone
- Show relative time for due dates (< 30 days)
- Show absolute date for distant due dates

### Architecture Compliance

**Server Component Strategy:**
- Deliverables tab is Server Component
- Interactive elements (forms, filters, modals) are Client Components
- Use Server Actions for deliverable CRUD operations

**Authorization:**
- Project Leads and Owners can create/edit/delete deliverables
- Project Members can update status of assigned deliverables
- Viewers have read-only access

**Error Handling:**
- Show toast notifications for successful operations
- Display validation errors inline with form fields
- Handle duplicate deliverable names gracefully
- Show error state for failed loads

### Library/Framework Requirements

**Additional Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.0.0"  // for date picker
  }
}
```

**Markdown Support:**
- Use react-markdown for description rendering
- Support GFM (GitHub Flavored Markdown)
- Sanitize markdown to prevent XSS

### File Structure Requirements

**Must-Create Files:**
1. `src/components/features/deliverables/DeliverablesTab.tsx`
2. `src/components/features/deliverables/DeliverableList.tsx`
3. `src/components/features/deliverables/AddDeliverableDialog.tsx`
4. `src/components/features/deliverables/StatusBadge.tsx`
5. `src/components/features/deliverables/ProgressBar.tsx`
6. `src/components/features/deliverables/types.ts`
7. `src/app/api/projects/[id]/deliverables/route.ts`
8. `src/app/api/projects/[id]/deliverables/[deliverableId]/route.ts`

**Database Schema Changes:**
```sql
CREATE TABLE deliverables (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'review', 'complete')),
  priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  due_date TIMESTAMP NOT NULL,
  assignee_id VARCHAR(20) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  tags TEXT[],
  completed_by VARCHAR(20) REFERENCES users(id)
);

CREATE TABLE deliverable_history (
  id SERIAL PRIMARY KEY,
  deliverable_id VARCHAR(20) NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  details JSONB
);

CREATE INDEX idx_deliverables_project ON deliverables(project_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_due_date ON deliverables(due_date);
CREATE INDEX idx_deliverables_assignee ON deliverables(assignee_id);
CREATE INDEX idx_deliverable_history_deliverable ON deliverable_history(deliverable_id);
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 6 Focus:** Project Management System - Deliverables Tracking

**Related Stories:**
- Story 6.1 - Project Core Data Model
- Story 6.2 - Project CRUD Operations
- Story 6.9 - Team Management (assignees)
- Story 6.8 - Evidence Locker (deliverable attachments)
- Epic 7 - Enterprise Templates (deliverable reports)

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md)
- [Architecture & Security](../02-architecture-security.md)
- [UX Design](../03-ux-design.md)
- [Technical Implementation](../06-technical-implementation.md)
- [UI Design System](../05-ui-design-system.md)
- [Story Implementation Steps](../story-implementation-steps.md)

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.10 Details - [epics.md#story-610-deliverables-tracking](../epics.md#story-610-deliverables-tracking)

---

## Dev Agent Record

### Agent Model Used
*To be filled by Dev agent during implementation*

### Debug Log References
*To be filled by Dev agent during implementation*

### Completion Notes List
*To be filled by Dev agent during implementation*

### File List
*To be filled by Dev agent during implementation*
