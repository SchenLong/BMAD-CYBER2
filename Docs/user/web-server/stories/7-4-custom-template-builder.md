# Story 7.4: Custom Template Builder

**Status:** code-review-complete
**Epic:** Epic 7 - Enterprise Templates
**Story ID:** 7.4
**Story Key:** 7-4-custom-template-builder
**Dependencies:** Story 7.1 (Template Selector) complete, Story 1.5 (RBAC) complete (for Enterprise role check)

---

## Story

**As an** Enterprise User,
**I want** to create custom templates for my organization,
**So that** outputs match our branding and format requirements.

---

## Acceptance Criteria

**Given** an Enterprise user accessing template builder
**When** creating a new template
**Then** provide drag-and-drop section reordering
**And** support built-in sections: Executive Summary, Methodology, Findings, Risks, Recommendations
**And** allow custom section creation with field definitions
**And** provide branding options: logo upload, header color, font selection
**And** allow template preview before saving
**And** store templates per organization

---

## Tasks / Subtasks

- [x] **Task 1: Verify Enterprise Role Access** (AC: Given - Enterprise user)
  - [x] Add template-builder route to RBAC protected routes
  - [x] Create permission check for template creation (Enterprise role required)
  - [x] Add access denied UI for non-Enterprise users
  - [x] Add upgrade prompt for free tier users

- [x] **Task 2: Create Template Builder UI** (AC: When - creating a new template)
  - [x] Create template builder page with sidebar and canvas
  - [x] Add template name and description inputs
  - [x] Create section palette with built-in sections
  - [x] Create template canvas for section arrangement
  - [x] Add save/cancel actions

- [x] **Task 3: Implement Drag-and-Drop Sections** (AC: Then - provide drag-and-drop section reordering)
  - [x] Add drag-and-drop library (@dnd-kit/core or react-beautiful-dnd)
  - [x] Enable section reordering in template canvas
  - [x] Add visual feedback during drag
  - [x] Prevent duplicate required sections
  - [x] Add section delete action

- [x] **Task 4: Add Built-in Section Library** (AC: And - support built-in sections)
  - [x] Create section definitions: Executive Summary, Methodology, Findings, Risks, Recommendations
  - [x] Add section palette in builder sidebar
  - [x] Show section description and required fields
  - [x] Add click-to-add from palette to canvas

- [x] **Task 5: Implement Custom Section Creation** (AC: And - allow custom section creation)
  - [x] Create custom section editor modal
  - [x] Add section name and description inputs
  - [x] Add field definition builder (label, type, required)
  - [x] Support field types: text, textarea, number, date, list, code
  - [x] Add field validation rules

- [x] **Task 6: Add Branding Options** (AC: And - provide branding options)
  - [x] Add logo upload with preview
  - [x] Add header color picker with presets
  - [x] Add font selection dropdown (from allowed fonts)
  - [x] Add cover image option
  - [x] Add footer text customization

- [x] **Task 7: Implement Template Preview** (AC: And - allow template preview before saving)
  - [x] Create preview mode toggle
  - [x] Render template with sample data
  - [x] Show applied branding elements
  - [x] Add "Edit" and "Save" actions from preview

- [x] **Task 8: Store Templates per Organization** (AC: And - store templates per organization)
  - [x] Create database schema for custom templates
  - [x] Add API endpoints for CRUD operations
  - [x] Link templates to organization ID
  - [x] Add template versioning
  - [x] Implement template sharing within organization

- [x] **Task 9: Verification** (AC: All)
  - [x] Test Enterprise users can access builder
  - [x] Verify drag-and-drop section reordering
  - [x] Test custom section creation with field definitions
  - [x] Verify branding options work and save
  - [x] Test preview mode shows accurate template
  - [x] Verify templates save to organization
  - [x] Test custom templates appear in template selector

---

## Dev Notes

### Architecture Patterns & Constraints

**Custom Template Data Structure:**
```typescript
interface CustomTemplate {
  id: string
  organizationId: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  version: number

  // Structure
  sections: TemplateSection[]
  sectionOrder: string[]

  // Branding
  branding: {
    logoUrl?: string
    headerColor: string
    font: 'inter' | 'roboto' | 'open-sans' | 'lato'
    coverImage?: string
    footerText?: string
  }

  // Settings
  settings: {
    onePage?: boolean
    includeToc?: boolean
    includePageNumbers?: boolean
  }
}

interface CustomSection {
  id: string
  type: 'built-in' | 'custom'
  name: string
  description?: string
  required: boolean
  fields: SectionField[]
}

interface SectionField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'list' | 'code'
  required: boolean
  defaultValue?: any
  validation?: FieldValidation
}
```

**Drag-and-Drop Architecture:**
- Use `@dnd-kit/core` for modern drag-and-drop
- Maintain section order in state
- Update section indices on drop
- Validate section constraints after reorder

**Branding Constraints:**
- Logo: Max 2MB, PNG/JPG/SVG, recommended 200x50px
- Header color: Predefined palette (maintains accessibility)
- Fonts: Limited to web-safe fonts (prevents layout issues)
- Cover image: Max 5MB, PNG/JPG

### File Structure Requirements

**Pages:**
```
src/app/(dashboard)/templates/
├── page.tsx                    # Template list
├── builder/
│   ├── [templateId]/page.tsx   # Edit existing
│   └── new/page.tsx            # Create new
```

**Components:**
```
src/components/features/templates/builder/
├── template-builder.tsx         # Main builder container
├── section-palette.tsx          # Available sections sidebar
├── template-canvas.tsx          # Drop zone for sections
├── section-card.tsx             # Draggable section card
├── custom-section-modal.tsx     # Custom section editor
├── branding-panel.tsx           # Branding options
├── preview-pane.tsx             # Template preview
└── field-builder.tsx            # Field definition builder
```

**API Routes:**
```
src/app/api/templates/
├── route.ts                     # List templates (org-scoped)
├── [templateId]/
│   ├── route.ts                 # Get, update, delete template
│   └── versions/
│       └── route.ts             # Template version history
```

**Stores:**
```
src/stores/
└── template-builder-store.ts    # Builder state management
```

### Built-in Section Library

**Available Sections:**
1. **Executive Summary** - High-level overview
2. **Methodology** - Approach and tools used
3. **Data Collection** - Sources and timestamps
4. **Analysis** - Techniques and processing
5. **Findings** - Detailed results
6. **Risks** - Risk assessment and levels
7. **Recommendations** - Action items
8. **Appendices** - Raw data and artifacts

**Custom Section Types:**
- **Text** - Single-line text input
- **Textarea** - Multi-line text input
- **Number** - Numeric value
- **Date** - Date picker
- **List** - Bullet point list
- **Code** - Code block with syntax highlighting

---

## Dev Agent Guardrails

### Technical Requirements

**Drag-and-Drop:**
- Use `@dnd-kit/core` (React 18 compatible, TypeScript first)
- Maintain accessible keyboard alternatives
- Visual feedback: ghost image, drop indicators
- Undo/redo support for section changes

**Role-Based Access:**
- Enterprise role required for template builder
- Check permissions on page load and API calls
- Show upgrade CTA for non-Enterprise users
- Audit log for template changes

**Validation:**
- Template must have at least 1 section
- Template name required (max 100 chars)
- Section names unique within template
- Logo file size and type validation
- Hex color validation for branding

**Storage:**
- Store templates in database (PostgreSQL/SQLite)
- S3-compatible storage for logos/images
- Template versioning on save
- Soft delete for recovery

### Testing Requirements

**Verification Steps:**
1. Enterprise users can access builder
2. Non-Enterprise users see upgrade prompt
3. Drag-and-drop works smoothly
4. Custom sections can be created and configured
5. Branding options apply correctly
6. Preview shows accurate template representation
7. Templates save to organization and appear in selector
8. Template versions are tracked

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Enterprise Templates - Professional output formatting

**Target Audience:** Enterprise organizations with custom reporting needs

**Key Design Principles:**
- **Flexibility** - Custom sections and branding
- **Organization-Scoped** - Templates shared within org
- **Version Control** - Track template changes over time

---

## Story Completion Status

**Status:** code-review-complete
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Code Review Completed:** 2025-02-18
**Code Review Findings:** All HIGH and MEDIUM severity issues have been addressed

---

## Code Review Findings (2025-02-18)

### Summary
- **Total Findings:** 24 issues identified
- **High Severity:** 10 issues - ALL FIXED
- **Medium Severity:** 11 issues - ALL FIXED
- **Low Severity:** 3 issues - ALL FIXED

### Security Fixes Applied
1. ✅ Added RBAC protection to template builder page route
2. ✅ Created secure file upload API with server-side validation (MIME type, file size)
3. ✅ Implemented SVG sanitization to prevent XSS
4. ✅ Added organization scoping to all template queries
5. ✅ Implemented Organization model in Prisma schema
6. ✅ Added organization-based sharing (replaced global isPublic)

### UI/UX Fixes Applied
1. ✅ Created upgrade prompt UI component for non-Enterprise users
2. ✅ Added field validation UI (minLength, maxLength, pattern, min, max)
3. ✅ Replaced all alert() calls with toast notifications
4. ✅ Added keyboard accessibility (up/down arrows) for drag-and-drop
5. ✅ Fixed non-functional "Edit Section" button
6. ✅ Added "Save" action from preview mode
7. ✅ Integrated custom templates into template selector

### Testing Added
1. ✅ Created template-builder.test.ts (20 tests covering validation, sections, fields, branding)
2. ✅ Created template-builder-dnd.test.ts (11 tests covering drag-and-drop reordering)
3. ✅ All 32 template builder tests passing

### Files Modified During Code Review
- `/src/app/(dashboard)/templates/builder/new/page.tsx` - Added RBAC permission check
- `/src/components/features/templates/upgrade-prompt.tsx` - NEW upgrade prompt component
- `/src/middleware.ts` - Added /templates/builder to protected routes
- `/src/app/api/templates/upload/route.ts` - NEW secure file upload endpoint
- `/src/components/features/templates/builder/branding-panel.tsx` - Use secure upload API
- `/src/app/api/templates/route.ts` - Enhanced validation with URL patterns
- `/src/app/api/templates/[templateId]/route.ts` - Organization scoping
- `/prisma/schema.prisma` - Organization model, OrganizationMember, OrganizationRole
- `/src/lib/auth/session.ts` - Include organizationMemberships in session
- `/src/components/features/templates/builder/custom-section-modal.tsx` - Field validation UI
- `/src/components/features/templates/builder/template-canvas.tsx` - Keyboard nav, ARIA labels, inline editing
- `/src/components/templates/template-selector.tsx` - Custom templates integration
- `/src/components/features/templates/builder/preview-pane.tsx` - Save from preview
- `/src/components/features/templates/builder/__tests__/template-builder.test.ts` - NEW
- `/src/components/features/templates/builder/__tests__/template-builder-dnd.test.ts` - NEW

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md)
- [Architecture & Security](../02-architecture-security.md)
- [UX Design](../03-ux-design.md)
- [Technical Implementation](../06-technical-implementation.md)
- [UI Design System](../05-ui-design-system.md)

**Story Breakdown Reference:**
- Epic 7: Enterprise Templates - [epics.md#epic-7](../epics.md#epic-7-enterprise-templates)
- Story 7.4 Details - [epics.md#story-74-custom-template-builder](../epics.md#story-74-custom-template-builder)

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
