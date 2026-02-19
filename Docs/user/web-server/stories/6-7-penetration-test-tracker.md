# Story 6.7: Penetration Test Tracker

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.7
**Story Key:** 6-7-penetration-test-tracker
**Dependencies:** Story 6.1 (Project Core), Story 6.2 (Project CRUD)

---

## Story

**As a** Pentester,
**I want** a findings tracker for penetration test projects,
**So that** I can manage vulnerabilities from discovery to verification.

---

## Acceptance Criteria

**Given** a security-assessment project with pentest type
**When** viewing the specialized tracker
**Then** display project header with: Pentest ID, Scope, Week, Findings count
**And** show FINDINGS TRACKER table with columns: Severity, Status, Finding
**And** severity levels: Critical, High, Medium, Low with color coding
**And** status values: Fixing, Verified, Testing, Pending
**And** allow adding findings with CVSS score and evidence
**And** display PHASE PROGRESS bars: Reconnaissance, Enumeration, Exploitation, Post-Exploitation, Reporting

---

## Tasks / Subtasks

- [x] **Task 1: Pentest Header Component** (AC: Given, When, Then - project header)
  - [x] Create PentestHeader component with project metadata
  - [x] Display Pentest ID (auto-generated format: PT-YYYY-NNN)
  - [x] Display Scope summary (in-scope/out-of-scope assets)
  - [x] Display current Week number of engagement
  - [x] Display total Findings count with severity breakdown
  - [x] Add quick actions: Add Finding, Export Report

- [x] **Task 2: Findings Tracker Table** (AC: And - FINDINGS TRACKER table)
  - [x] Create FindingsTracker table component
  - [x] Display columns: Severity (color-coded), Status, Finding title, CVSS, Assignee
  - [x] Implement sortable columns
  - [x] Add filtering by severity, status, assignee
  - [x] Support inline status updates
  - [x] Add row expand for detailed view
  - [x] Implement pagination for large finding sets

- [x] **Task 3: Severity & Status Management** (AC: And - severity levels, status values)
  - [x] Define severity enum: Critical, High, Medium, Low, Info
  - [x] Implement severity color coding (Critical=red, High=orange, Medium=yellow, Low=blue, Info=gray)
  - [x] Define status enum: Pending, Fixing, Testing, Verified, False Positive, Risk Accepted
  - [x] Create status badge component with visual indicators
  - [x] Implement one-click status cycling for quick updates
  - [x] Add status change audit trail

- [x] **Task 4: Finding Creation & Editing** (AC: And - adding findings with CVSS)
  - [x] Create FindingForm component for adding/editing findings
  - [x] Implement CVSS score calculator input
  - [x] Add fields: title, description, impact, proof of concept, remediation
  - [x] Support evidence file attachments (screenshots, logs)
  - [x] Add affected systems/URLs multi-input
  - [x] Implement OWASP category tagging
  - [x] Add CWE reference field

- [x] **Task 5: Phase Progress Display** (AC: And - PHASE PROGRESS bars)
  - [x] Create PhaseProgress component for pentest phases
  - [x] Display 5 phases: Reconnaissance, Enumeration, Exploitation, Post-Exploitation, Reporting
  - [x] Implement progress percentage for each phase
  - [x] Show active phase indicator
  - [x] Add phase completion checkmarks
  - [x] Link findings to phases (when discovered)
  - [x] Calculate overall engagement progress

- [x] **Task 6: Finding Detail View** (AC: Then - manage vulnerabilities)
  - [x] Create FindingDetail modal/page
  - [x] Display complete finding information
  - [x] Show CVSS vector string and breakdown
  - [x] Render evidence images and attachments
  - [x] Display remediation steps with priority
  - [x] Show finding history (status changes, edits)
  - [x] Add comments/discussion section
  - [x] Support markdown rendering for descriptions

- [x] **Task 7: Reporting Integration** (AC: Then - pentest tracker)
  - [x] Add export findings to CSV/JSON
  - [x] Support filtering exports by severity/status
  - [x] Generate executive summary statistics
  - [x] Calculate risk score aggregations
  - [x] Display findings trend chart over time
  - [x] Prepare data for report template (Epic 7)

- [x] **Task 8: Testing & Verification** (AC: All)
  - [x] Test pentest header displays all metadata
  - [x] Verify findings table sorting and filtering
  - [x] Test finding creation with all fields
  - [x] Verify CVSS calculation accuracy
  - [x] Test status updates and audit trail
  - [x] Verify phase progress calculations
  - [x] Test evidence file attachments
  - [x] Verify export functionality

---

## Dev Notes

### Architecture Patterns & Constraints

**Penetration Test Data Model:**
```typescript
interface PentestProject extends Project {
  projectType: 'security-assessment';
  assessmentType: 'penetration-test' | 'vulnerability-scan' | 'red-team';
  pentestId: string;           // PT-YYYY-NNN
  scope: {
    inScope: string[];         // URLs, IP ranges, assets
    outOfScope: string[];
    exclusions: string[];
  };
  weekNumber: number;
  phases: PhaseProgress[];
  findings: Finding[];
}

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'pending' | 'fixing' | 'testing' | 'verified' | 'false-positive' | 'risk-accepted';
  cvss: {
    score: number;
    vector: string;
    breakdown: CVSSBreakdown;
  };
  affectedSystems: string[];
  owaspCategory?: string;
  cweId?: string;
  evidence: EvidenceFile[];
  remediation: string;
  assignee?: string;
  discoveredAt: Date;
  discoveredBy: string;
  phase: string;
  history: FindingHistory[];
}

interface PhaseProgress {
  name: 'reconnaissance' | 'enumeration' | 'exploitation' | 'post-exploitation' | 'reporting';
  status: 'not-started' | 'in-progress' | 'complete';
  progress: number;  // 0-100
}
```

**Component Structure:**
- **PentestHeader** - Project metadata and quick actions
- **FindingsTracker** - Main findings table
- **FindingForm** - Add/edit finding modal
- **FindingDetail** - Expanded finding view
- **PhaseProgress** - Phase visualization
- **CvssCalculator** - CVSS scoring input

### UI/UX Requirements

**Visual Design:**
- Use security-focused color scheme (darker theme for pentest context)
- Severity indicators: Critical (dark red), High (orange), Medium (yellow), Low (blue), Info (gray)
- Status badges should show current state clearly
- Phase progress bars should be prominent and easy to scan

**CVSS Scoring:**
- Support CVSS v3.1 calculator
- Show base score prominently
- Display temporal and environmental scores if available
- Link to CVSS calculator for reference

**Finding Workflow:**
1. Discovery -> Pending status
2. Validation -> Fixing status (if valid)
3. Remediation -> Testing status
4. Verification -> Verified status
5. Exceptions: False Positive, Risk Accepted

### File Structure Requirements

**New Components:**
```
src/components/features/pentest/
├── PentestHeader.tsx
├── FindingsTracker.tsx
├── FindingForm.tsx
├── FindingDetail.tsx
├── PhaseProgress.tsx
├── CvssCalculator.tsx
├── SeverityBadge.tsx
├── StatusBadge.tsx
└── types.ts
```

**API Endpoints:**
```
GET    /api/projects/:id/pentest
POST   /api/projects/:id/findings
GET    /api/projects/:id/findings
PUT    /api/projects/:id/findings/:findingId
DELETE /api/projects/:id/findings/:findingId
POST   /api/projects/:id/findings/:findingId/status
GET    /api/projects/:id/findings/export
```

### Testing Requirements

**Manual Testing Checklist:**
1. Create security-assessment project with pentest type
2. Verify pentest header shows all metadata
3. Add findings with various severity levels
4. Test CVSS calculator produces correct scores
5. Verify findings table sorting and filtering
6. Test status changes create audit entries
7. Verify phase progress updates
8. Test finding detail view expands correctly
9. Verify export produces valid CSV/JSON

---

## Dev Agent Guardrails

### Technical Requirements

**State Management:**
- Use TanStack Query for findings data with caching
- Create pentest-specific Zustand store for UI state (filters, sort)
- Implement optimistic updates for status changes
- Cache findings list with revalidation on changes

**Table Performance:**
- Virtualize findings table for large datasets (100+ findings)
- Debounce search/filter inputs
- Implement server-side pagination for scalability

**Form Validation:**
- Use react-hook-form with Zod schemas
- CVSS vector must be valid format
- Required fields: title, description, severity
- Evidence files limited to 10MB each

### Architecture Compliance

**Server Component Strategy:**
- Pentest tracker page is Server Component
- Interactive elements (table, filters, modals) are Client Components
- Use Server Actions for finding CRUD operations

**Error Handling:**
- Handle CVSS calculation errors gracefully
- Show toast notifications for status updates
- Display error state for failed loads

### Library/Framework Requirements

**Additional Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "date-fns": "^3.0.0"
  }
}
```

**CVSS Calculation:**
- Use cvss.js library or implement CVSS v3.1 calculator
- Reference: https://www.first.org/cvss/calculator/3.1

### File Structure Requirements

**Must-Create Files:**
1. `src/components/features/pentest/PentestHeader.tsx`
2. `src/components/features/pentest/FindingsTracker.tsx`
3. `src/components/features/pentest/FindingForm.tsx`
4. `src/components/features/pentest/FindingDetail.tsx`
5. `src/components/features/pentest/PhaseProgress.tsx`
6. `src/components/features/pentest/CvssCalculator.tsx`
7. `src/components/features/pentest/types.ts`
8. `src/app/api/projects/[id]/findings/route.ts`
9. `src/app/api/projects/[id]/findings/[findingId]/route.ts`

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 6 Focus:** Project Management System - Specialized Workspaces

**Related Stories:**
- Story 6.1 - Project Core Data Model
- Story 6.2 - Project CRUD Operations
- Story 6.8 - Evidence Locker (evidence attachment)
- Story 6.10 - Deliverables Tracking (phase milestones)

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
- Story 6.7 Details - [epics.md#story-67-penetration-test-tracker](../epics.md#story-67-penetration-test-tracker)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- Pentest tracker page with header displaying project metadata
- Findings tracker table with sorting and filtering implemented
- Severity badges with proper color coding (Critical=red, High=orange, Medium=yellow, Low=blue, Info=gray)
- Status workflow (Pending, Fixing, Testing, Verified, False Positive, Risk Accepted)
- CVSS calculator integration for scoring vulnerabilities
- Phase progress bars for pentest lifecycle visualization
- Finding detail view with evidence attachments
- Export functionality for findings (CSV/JSON)
- Audit trail for status changes

### File List
- src/components/features/pentest/PentestHeader.tsx - Project metadata header
- src/components/features/pentest/FindingsTracker.tsx - Findings table
- src/components/features/pentest/FindingForm.tsx - Add/edit finding modal
- src/components/features/pentest/FindingDetail.tsx - Expanded finding view
- src/components/features/pentest/PhaseProgress.tsx - Phase visualization
- src/components/features/pentest/CvssCalculator.tsx - CVSS scoring
- src/components/features/pentest/SeverityBadge.tsx - Severity indicator
- src/app/api/projects/[id]/findings/route.ts - Findings CRUD endpoint
- src/app/api/projects/[id]/findings/[findingId]/route.ts - Single finding operations
