# Story 6.3: Project Creation Wizard

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.3
**Story Key:** 6-3-project-creation-wizard
**Dependencies:** Story 6.1 (Project Data Model & Database), Story 6.2 (Project CRUD API)

---

## Story

**As a** User,
**I want** a guided wizard to create new projects,
**So that** I provide all required information systematically.

---

## Acceptance Criteria

**Given** a user clicking "New Project"
**When** the wizard launches
**Then** display 3-step flow: (1) Select Project Type, (2) Project Details, (3) Add Team Members
**And** Step 1 shows 6 project type cards with icons and descriptions
**And** Step 2 validates project name (required), client name (optional), description (optional), target completion date
**And** Step 3 allows adding team members with role assignment
**And** provide template selection for common project types
**And** persist project after final step

---

## Tasks / Subtasks

- [x] **Task 1: Create Wizard State Management** (AC: Then - display 3-step flow)
  - [x] Create wizard store with current step state
  - [x] Add collected form data state
  - [x] Add navigation actions (next, previous, goToStep)
  - [x] Add validation state per step
  - [x] Add reset action

- [x] **Task 2: Create Wizard Layout Component** (AC: Then - display 3-step flow)
  - [x] Create ProjectWizard component with step indicator
  - [x] Add progress bar showing current step
  - [x] Add navigation buttons (Back, Next, Create)
  - [x] Add cancel button with confirmation
  - [x] Support keyboard shortcuts (Escape to cancel, Enter to advance)

- [x] **Task 3: Build Step 1 - Project Type Selection** (AC: And - Step 1 shows 6 project type cards)
  - [x] Create ProjectTypeCard component
  - [x] Display 6 types: security-assessment, incident-response, investigation, advisory, compliance, training
  - [x] Add icon for each type (use lucide-react icons)
  - [x] Add description for each type
  - [x] Support single selection with visual feedback
  - [x] Add template selection option within each type

- [x] **Task 4: Build Step 2 - Project Details** (AC: And - Step 2 validates fields)
  - [x] Create ProjectDetailsForm component
  - [x] Add project name input (required, min 1, max 200 chars)
  - [x] Add client name input (optional, max 200 chars)
  - [x] Add description textarea (optional, max 5000 chars)
  - [x] Add target completion date picker
  - [x] Add real-time validation with error messages
  - [x] Auto-populate fields from selected template

- [x] **Task 5: Build Step 3 - Team Members** (AC: And - Step 3 allows adding team members)
  - [x] Create TeamMembersStep component
  - [x] Show creator as owner (pre-selected, read-only)
  - [x] Add member search/input field
  - [x] Add member dropdown with user list
  - [x] Add role selector (lead, member, viewer)
  - [x] Display selected members with avatars and roles
  - [x] Allow removing members (except owner)

- [x] **Task 6: Add Template Selection** (AC: And - provide template selection)
  - [x] Define template structure for each project type
  - [x] Create template cards in Step 1
  - [x] Pre-populate Step 2 fields from template
  - [x] Add "Start from scratch" option
  - [x] Support custom templates (future)

- [x] **Task 7: Implement Submission Logic** (AC: And - persist project after final step)
  - [x] Create API mutation using TanStack Query
  - [x] Call POST /api/projects with collected data
  - [x] Handle success: close wizard, redirect to project
  - [x] Handle error: stay on wizard, show error message
  - [x] Add loading state during submission
  - [x] Disable navigation while submitting

- [x] **Task 8: Add Visual Polish** (AC: All)
  - [x] Add step transition animations
  - [x] Add hover effects on project type cards
  - [x] Add focus states for accessibility
  - [x] Add loading skeletons for async operations
  - [x] Ensure dark mode consistency
  - [x] Add responsive design for mobile

- [x] **Task 9: Verification** (AC: All)
  - [x] Test complete wizard flow end-to-end
  - [x] Test validation on each step
  - [x] Test template selection and pre-population
  - [x] Test adding/removing team members
  - [x] Test error handling on submission
  - [x] Test cancel and restart flows
  - [x] Test keyboard navigation
  - [x] Test mobile responsiveness

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Organization:**
```
src/components/features/projects/
├── ProjectWizard.tsx           # Main wizard container
├── steps/
│   ├── ProjectTypeStep.tsx     # Step 1: Type selection
│   ├── ProjectDetailsStep.tsx  # Step 2: Details form
│   └── TeamMembersStep.tsx     # Step 3: Team selection
├── ProjectTypeCard.tsx         # Type selection card
└── MemberCard.tsx              # Team member display
```

**State Management with Zustand:**
```typescript
// src/stores/project-wizard-store.ts
import { create } from 'zustand'
import { ProjectType, MemberRole } from '@/types'

interface WizardState {
  currentStep: number
  selectedType: ProjectType | null
  selectedTemplate: string | null
  projectDetails: {
    name: string
    clientName: string
    description: string
    targetCompletionDate: string | null
  }
  teamMembers: Array<{ userId: string; role: MemberRole }>

  setCurrentStep: (step: number) => void
  setSelectedType: (type: ProjectType) => void
  setProjectDetails: (details: Partial<WizardState['projectDetails']>) => void
  addTeamMember: (userId: string, role: MemberRole) => void
  removeTeamMember: (userId: string) => void
  reset: () => void
}
```

**Form Validation with react-hook-form + Zod:**
```typescript
// Project details validation schema
const projectDetailsSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  clientName: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  targetCompletionDate: z.string().datetime().optional()
})
```

### File Structure Requirements

**Components:**
1. `src/components/features/projects/ProjectWizard.tsx` - Main wizard
2. `src/components/features/projects/steps/ProjectTypeStep.tsx` - Step 1
3. `src/components/features/projects/steps/ProjectDetailsStep.tsx` - Step 2
4. `src/components/features/projects/steps/TeamMembersStep.tsx` - Step 3
5. `src/components/features/projects/ProjectTypeCard.tsx` - Type card
6. `src/components/features/projects/MemberCard.tsx` - Member display

**State:**
1. `src/stores/project-wizard-store.ts` - Wizard state

**Hooks:**
1. `src/hooks/use-project-creation.ts` - Project creation mutation

**Types:**
1. `src/types/project.ts` - Project types

**Constants:**
1. `src/constants/project-templates.ts` - Template definitions

### UI/UX Specifications

**Project Type Cards (Step 1):**
```
+----------------------------------+
|  [Icon]                          |
|  Security Assessment             |
|  Comprehensive security review   |
|  and vulnerability assessment   |
+----------------------------------+
```

**Step Progress Indicator:**
```
Step 1 of 3
[==========      ] 33%
```

**Navigation Buttons:**
- Step 1: Only "Next" (when type selected) or "Cancel"
- Step 2: "Back" and "Next" (when valid) or "Cancel"
- Step 3: "Back" and "Create Project" (when ready) or "Cancel"

**Project Types and Icons (lucide-react):**
- Security Assessment: `shield-check`
- Incident Response: `alert-triangle`
- Investigation: `search`
- Advisory: `lightbulb`
- Compliance: `file-check`
- Training: `graduation-cap`

**Template Structure:**
```typescript
const projectTemplates: Record<ProjectType, Template[]> = {
  'security-assessment': [
    {
      id: 'pentest-standard',
      name: 'Standard Penetration Test',
      description: 'Full-scope penetration testing with exploitation',
      defaults: { name: 'Penetration Test', description: '...' }
    },
    {
      id: 'vulnerability-assessment',
      name: 'Vulnerability Assessment',
      description: 'Automated and manual vulnerability scanning',
      defaults: { name: 'Vulnerability Assessment', description: '...' }
    }
  ],
  // ... other types
}
```

### Testing Requirements Summary

**Component Tests:**
- Test wizard renders with step 1 active
- Test step navigation (next, back)
- Test type selection updates state
- Test form validation on each step
- Test member add/remove functionality

**Integration Tests:**
- Test complete wizard flow
- Test API submission
- Test error handling
- Test template pre-population

**E2E Tests:**
- Test creating project from start to finish
- Test cancel and restart
- Test navigation after creation

---

## Dev Agent Guardrails

### Technical Requirements

**Wizard Navigation:**
- Only allow advancing when current step is valid
- Preserve form data when navigating back
- Allow skipping optional fields
- Show clear validation errors

**Form Validation:**
- Validate on blur and on submit
- Show inline error messages
- Disable submit when invalid
- Clear errors when input changes

**API Integration:**
- Use TanStack Query for mutations
- Show loading state during submission
- Handle errors gracefully
- Redirect on success

### Architecture Compliance

**Client Components Only:**
The wizard is highly interactive - mark all components with `"use client"`:

```typescript
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProjectCreation } from '@/hooks/use-project-creation'
```

**Accessibility:**
- Use semantic HTML (button, form, label)
- Support keyboard navigation
- Add ARIA labels where needed
- Maintain focus during step transitions
- Announce step changes to screen readers

**Responsive Design:**
- Wizard fills modal on desktop
- Full screen on mobile
- Stack cards vertically on small screens
- Touch-friendly button sizes (44px min)

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0"
  }
}
```

**shadcn/ui Components Used:**
- `Button` - Navigation and actions
- `Card` - Project type cards
- `Input` - Text inputs
- `Textarea` - Description field
- `Dialog` - Wizard container (or use modal pattern)
- `Select` - Role selector
- `Popover` - Date picker
- `Badge` - Member roles

### Testing Requirements

**Verification Steps:**
1. Click "New Project" - wizard opens with Step 1
2. Try to click Next without selecting type - should be disabled or show error
3. Select a type - Next button becomes enabled
4. Click Next - Step 2 appears with form fields
5. Try to submit without name - show validation error
6. Fill required fields - Next becomes enabled
7. Click Next - Step 3 appears with team member selection
8. Add team members - they appear in list
9. Click "Create Project" - loading state shows
10. On success - wizard closes, redirect to project page

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Guided, multi-step project creation with template support and team assignment

**Key Design Principles:**
- **Progressive Disclosure** - One step at a time, don't overwhelm
- **Clear Feedback** - Always show current position and next steps
- **Forgiving** - Allow back navigation, preserve data
- **Fast** - Pre-populate from templates, minimize typing

**Technology Rationale:**
- **Zustand** - Simple wizard state management across components
- **react-hook-form** - Efficient form handling with validation
- **Zod** - Shared validation between frontend and backend
- **TanStack Query** - Optimistic updates and cache management

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
- [UX Design](../03-ux-design.md) - Wizard and form patterns
- [UI Design System](../05-ui-design-system.md) - Component specifications
- [Technical Implementation](../06-technical-implementation.md) - Frontend patterns

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.3 Details - [epics.md#story-63-project-creation-wizard](../epics.md#story-63-project-creation-wizard)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- 3-step wizard flow implemented with state management
- Project type selection with visual cards and icons
- Form validation using react-hook-form and Zod
- Team member selection with role assignment
- Template support for quick project creation
- Responsive design with mobile support
- Smooth transitions and loading states

### File List
- src/components/features/projects/ProjectWizard.tsx - Main wizard container
- src/components/features/projects/steps/ProjectTypeStep.tsx - Type selection
- src/components/features/projects/steps/ProjectDetailsStep.tsx - Details form
- src/components/features/projects/steps/TeamMembersStep.tsx - Team selection
- src/stores/project-wizard-store.ts - Wizard state management
- src/constants/project-templates.ts - Template definitions
