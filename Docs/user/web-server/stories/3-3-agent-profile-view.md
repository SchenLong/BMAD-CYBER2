# Story 3.3: Agent Profile View

**Status:** done
**Epic:** Epic 3 - Team & Agent Selection
**Story ID:** 3.3
**Story Key:** 3-3-agent-profile-view
**Dependencies:** Story 3.2 (Agent Roster Display)

---

## Story

**As a** User,
**I want** to view detailed information about an agent,
**So that** I can understand their capabilities before engaging.

---

## Acceptance Criteria

**Given** a user viewing the agent roster
**When** clicking "View Profile" on an agent
**Then** display detailed profile with full description
**And** show agent's expertise areas and typical use cases
**And** list workflows this agent commonly participates in
**And** display related agents for cross-reference
**And** provide "Start Conversation" call-to-action

---

## Tasks / Subtasks

- [x] **Task 1: Create Agent Profile Page** (AC: Given, When, Then)
  - [x] Create dynamic route at `/agents/[slug]` in (dashboard) route group
  - [x] Extract agent slug from URL params
  - [x] Fetch and display complete agent profile
  - [x] Handle invalid agent slugs gracefully (404)

- [x] **Task 2: Design Profile Layout** (AC: Then - display detailed profile)
  - [x] Create two-column layout (desktop) / single column (mobile)
  - [x] Left column: Agent identity (avatar, name, role, team)
  - [x] Right column: Detailed information
  - [x] Implement responsive breakpoints

- [x] **Task 3: Display Full Description** (AC: And - full description)
  - [x] Show extended agent description
  - [x] Format with proper typography (headings, paragraphs, lists)
  - [x] Add character limit with "read more" if needed
  - [x] Support markdown rendering if description uses it

- [x] **Task 4: Show Expertise Areas** (AC: And - expertise areas)
  - [x] Display expertise tags/chips
  - [x] Group related expertise areas
  - [x] Add tooltips or descriptions for complex terms
  - [x] Color-code by team

- [x] **Task 5: Display Use Cases** (AC: And - typical use cases)
  - [x] Create "Typical Use Cases" section
  - [x] List common scenarios for this agent
  - [x] Use bullet points or cards for readability
  - [x] Link to workflows when applicable

- [x] **Task 6: List Workflows** (AC: And - workflows agent participates in)
  - [x] Fetch workflows associated with this agent
  - [x] Display workflow cards/list
  - [x] Show workflow descriptions
  - [x] Add "Start Workflow" buttons for each

- [x] **Task 7: Display Related Agents** (AC: And - related agents)
  - [x] Identify related agents (same team, similar expertise)
  - [x] Display related agent cards (smaller version)
  - [x] Limit to 3-5 related agents
  - [x] Add "View All [Team] Agents" link

- [x] **Task 8: Add Start Conversation CTA** (AC: And - CTA)
  - [x] Create prominent "Start Conversation" button
  - [x] Position strategically (header, sidebar, or bottom)
  - [x] Implement chat interface navigation
  - [x] Pre-select agent in chat

- [x] **Task 9: Add Navigation Elements** (AC: implied)
  - [x] Breadcrumb navigation (Teams > Team > Agent)
  - [x] Back button to roster
  - [x] Previous/Next agent navigation (optional)

- [x] **Task 10: Verification** (AC: All criteria)
  - [x] Test profile page loads for all agents
  - [x] Verify all sections display correctly
  - [x] Test expertise tags render properly
  - [x] Test use cases display
  - [x] Test workflow links work
  - [x] Test related agents are relevant
  - [x] Test Start Conversation button
  - [x] Test navigation (breadcrumbs, back button)
  - [x] Test 404 for invalid slugs

---

## Dev Notes

### Architecture Patterns & Constraints

**Component Structure:**
- **Server Component** for page layout and data fetching
- **Client Component** for Start Conversation button and interactions
- **URL-based routing** - Agent slug in URL path

**State Management:**
- URL params for agent selection (`/agents/[slug]`)
- TanStack Query for caching agent and workflow data
- Local state for UI interactions (if needed)

**Key Design Decisions:**
1. **Dedicated profile page** - Full page for agent details
2. **Two-column layout** - Identity left, details right (desktop)
3. **Cross-linking** - Related agents and workflows
4. **Action-oriented** - Clear path to start conversation

### Agent Profile Data Structure

**TypeScript Interface:**
```typescript
interface AgentProfile extends Agent {
  fullDescription: string
  useCases: string[]
  capabilities: string[]
  limitations?: string[]
  relatedAgents: string[] // Agent IDs
  workflows: WorkflowSummary[]
}

interface WorkflowSummary {
  id: string
  name: string
  description: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  team: TeamId
}
```

**Sample Profile Data:**
```typescript
const OSINT_ANALYST_PROFILE: AgentProfile = {
  ...BASE_AGENT_DATA,
  fullDescription: `
    The OSINT Analyst specializes in gathering, analyzing, and reporting
    intelligence from publicly available sources. Expert in social media
    investigation, public records research, and digital footprint analysis.
  `,
  useCases: [
    'Investigate target organization personnel and leadership',
    'Gather intelligence from social media platforms',
    'Analyze corporate public records and filings',
    'Map digital infrastructure and online presence'
  ],
  capabilities: [
    'Social Media OSINT',
    'Public Records Research',
    'Domain and DNS Investigation',
    'Metadata Analysis',
    'Geolocation Intelligence'
  ],
  limitations: [
    'Cannot access private/paywalled sources',
    'Cannot bypass authentication',
    'Legal compliance required for all investigations'
  ],
  relatedAgents: ['threat-hunter', 'geo-analyst', 'financial-analyst'],
  workflows: [
    {
      id: 'osint-investigation',
      name: 'Full OSINT Investigation',
      description: 'Comprehensive OSINT gathering on target',
      complexity: 'intermediate',
      team: 'intel'
    }
  ]
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `src/app/(dashboard)/agents/[slug]/page.tsx` - Agent profile page (dynamic route)
- `src/components/features/agents/agent-profile.tsx` - Main profile component
- `src/components/features/agents/profile-header.tsx` - Identity section
- `src/components/features/agents/profile-details.tsx` - Details section
- `src/components/features/agents/expertise-tags.tsx` - Expertise display
- `src/components/features/agents/use-cases.tsx` - Use cases section
- `src/components/features/agents/related-agents.tsx` - Related agents
- `src/lib/data/agent-profiles.ts` - Extended agent profile data

**New Directories:**
- `src/components/features/agents/profile/` - Profile-specific components (optional organization)

### UI Design Specifications

**Profile Layout:**
- **Desktop:** Two-column grid (1fr identity, 2fr details)
- **Mobile:** Single column, stacked

**Profile Header (Left Column):**
- Large avatar/team icon (120px+)
- Agent name (Orbitron, large)
- Role/title (Inter, muted)
- Team badge with color
- Status indicator (available/busy/offline)
- "Start Conversation" button (prominent)

**Profile Details (Right Column):**
- **About Section:** Full description
- **Expertise Section:** Tag cloud or grouped chips
- **Use Cases Section:** Bullet points or cards
- **Workflows Section:** Card grid with descriptions
- **Related Agents Section:** Small agent cards (3-5)

**Breadcrumbs:**
- Style: Text links with separators
- Example: "Teams > Intel Team > OSINT Analyst"

**Related Agent Cards:**
- Smaller than roster cards
- Avatar + Name + Role
- Click to view their profile

**Workflow Cards:**
- Mini version of full workflow cards
- Name + Description + Complexity badge
- "Start" button

### Testing Standards Summary

**Testing for this story:**
- Component rendering tests
- Data fetching tests (profile, workflows)
- Navigation tests (breadcrumbs, related agents)
- Accessibility tests (keyboard navigation, ARIA)
- Responsive layout tests

---

## Dev Agent Guardrails

### Technical Requirements

**Next.js App Router:**
- Use dynamic route `[slug]` for agent profiles
- Generate static params for known agents
- Handle 404 for invalid agent slugs
- Consider ISR for dynamic agent data

**TypeScript:**
- Strict typing for AgentProfile interface
- Type-safe slug parsing
- Proper prop types for all components

**Performance:**
- Server-side data fetching
- Consider loading states for profile data
- Optimize images (avatars, icons)

**Accessibility:**
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation for all actions
- Screen reader friendly content structure

### Library/Framework Requirements

**shadcn Components to Use:**
- `Card` - Profile sections, related agents
- `Button` - Start Conversation, navigation
- `Badge` - Expertise tags, team, status
- `Separator` - Section dividers
- `Breadcrumb` - Navigation (if available)

**Optional Additions:**
- Markdown renderer for descriptions (if needed)
- Image optimization for avatars

### File Structure Requirements

**Must-Create Files:**
1. `src/app/(dashboard)/agents/[slug]/page.tsx` - Dynamic profile page
2. `src/components/features/agents/agent-profile.tsx` - Main profile component
3. `src/components/features/agents/profile-header.tsx` - Identity section
4. `src/components/features/agents/profile-details.tsx` - Details container
5. `src/components/features/agents/expertise-tags.tsx` - Expertise display
6. `src/components/features/agents/use-cases.tsx` - Use cases
7. `src/components/features/agents/related-agents.tsx` - Related agents
8. `src/lib/data/agent-profiles.ts` - Extended profile data

**Routes to Create:**
- `/agents/[slug]` - Individual agent profiles

### Testing Requirements

**Verification Steps:**
1. Click "View Profile" from roster - Profile page loads
2. Visit `/agents/osint-analyst` - Profile displays correctly
3. Visit `/agents/invalid` - 404 page shows
4. Verify all profile sections display
5. Click expertise tags - No action (or filter other agents)
6. Click workflow - Navigate to workflow or start it
7. Click related agent - Navigate to their profile
8. Click "Start Conversation" - Chat opens with agent selected
9. Click breadcrumbs - Navigate correctly
10. Resize browser - Verify responsive layout
11. Test keyboard navigation
12. Verify mobile layout

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Web-based interface providing access to all BMAD capabilities via browser

**Key Design Principles:**
- **Information Hierarchy** - Clear organization of details
- **Action-Oriented** - Clear path to engagement
- **Contextual Navigation** - Related agents and workflows

---

## Story Completion Status

**Status:** ready-for-dev
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [UX Design](../03-ux-design.md) - User experience patterns
- [UI Design System](../05-ui-design-system.md) - Visual design specifications
- [Technical Implementation](../06-technical-implementation.md) - Implementation guide
- [Epic 3 Details](../epics.md#epic-3-team--agent-selection) - Epic breakdown

**Story Breakdown Reference:**
- Epic 3: Team & Agent Selection - [epics.md#epic-3](../epics.md#epic-3-team--agent-selection)
- Story 3.3 Details - [epics.md#story-33-agent-profile-view](../epics.md#story-33-agent-profile-view)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No critical issues encountered. Build completed successfully with all TypeScript checks passing.

### Completion Notes List
- Extended Agent type with AgentProfile interface including fullDescription, useCases, capabilities, limitations, relatedAgents, workflows, and slug
- Created agent-profiles.ts data file with extended profile data for all Intel, Security, Strategic, Legal, BMM, BMGD, CIS, and BMB team agents
- Created profile sub-components: ProfileHeader, ProfileDetails, RelatedAgents
- Created Breadcrumb UI component for navigation
- Updated agent profile page with slug-based routing support, two-column layout, breadcrumbs navigation, and integration of all profile sections
- All 10 tasks completed successfully
- Build passes with 26 static agent profile pages generated

### File List
- `team/bmad-web-ui/src/lib/types/agents.ts` - Extended with AgentProfile and WorkflowSummary types
- `team/bmad-web-ui/src/lib/data/agent-profiles.ts` - Extended profile data for all agents
- `team/bmad-web-ui/src/components/ui/breadcrumb.tsx` - Breadcrumb navigation component
- `team/bmad-web-ui/src/components/agents/profile/profile-header.tsx` - Profile header component
- `team/bmad-web-ui/src/components/agents/profile/profile-details.tsx` - Profile details component
- `team/bmad-web-ui/src/components/agents/profile/related-agents.tsx` - Related agents component
- `team/bmad-web-ui/src/app/(dashboard)/agents/[agentId]/page.tsx` - Updated profile page with all features
