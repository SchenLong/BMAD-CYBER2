# Story 6.9: Team Management

**Status:** ready-for-dev
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.9
**Story Key:** 6-9-team-management
**Dependencies:** Story 6.1 (Project Core), Story 1.3 (OAuth Users), Story 1.5 (RBAC)

---

## Story

**As a** Project Owner,
**I want** to add and manage team members on my projects,
**So that** the right people have access.

---

## Acceptance Criteria

**Given** a project owner viewing the Team tab
**When** adding a team member
**Then** provide user search or email invitation
**And** assign role: Owner, Lead, Member, Viewer
**And** send notification to invited user
**When** managing existing members
**Then** allow role changes
**And** allow removal of members
**And** show member activity (last seen, current task)
**And** display presence indicators for active members

---

## Tasks / Subtasks

- [ ] **Task 1: Team Data Model** (AC: Given - project owner viewing Team tab)
  - [ ] Create ProjectMember database schema
  - [ ] Define roles: Owner, Lead, Member, Viewer with permissions
  - [ ] Add team membership to Project model
  - [ ] Create member activity tracking schema
  - [ ] Define invitation schema and workflow
  - [ ] Set up presence tracking infrastructure

- [ ] **Task 2: User Search & Invitation** (AC: When - adding team member, Then - user search or email)
  - [ ] Create user search API endpoint
  - [ ] Implement search by username, email, name
  - [ ] Create UserSearchInput component with debounce
  - [ ] Display search results with user avatars
  - [ ] Create email invitation flow for non-existent users
  - [ ] Generate invitation tokens with expiration
  - [ ] Send invitation email with project link

- [ ] **Task 3: Role Assignment** (AC: And - assign role)
  - [ ] Define role permissions matrix
  - [ ] Create RoleSelector component
  - [ ] Implement role assignment on add member
  - [ ] Add role descriptions for each level
  - [ ] Create role validation middleware
  - [ ] Prevent last owner from being removed/downgraded
  - [ ] Implement role change audit logging

- [ ] **Task 4: Team List Display** (AC: When - managing existing members)
  - [ ] Create TeamList component
  - [ ] Display members in table or card grid
  - [ ] Show columns: Avatar, Name, Role, Status, Last Seen, Current Task
  - [ ] Add role badge with color coding
  - [ ] Sort members by role then name
  - [ ] Filter by role and status
  - [ ] Support pagination for large teams

- [ ] **Task 5: Member Management Actions** (AC: And - allow role changes, removal)
  - [ ] Create RoleChangeDialog component
  - [ ] Implement role dropdown with confirmation
  - [ ] Create RemoveMemberDialog component
  - [ ] Add removal confirmation with warning
  - [ ] Implement member audit log display
  - [ ] Add bulk actions (change role, remove)
  - [ ] Show last activity timestamp

- [ ] **Task 6: Activity Tracking** (AC: And - show member activity)
  - [ ] Track member last seen timestamp
  - [ ] Record current task assignment per member
  - [ ] Create ActivityIndicator component
  - [ ] Display relative time (e.g., "5 min ago")
  - [ ] Show task assignment with link to task
  - [ ] Add activity filter (active, inactive, offline)

- [ ] **Task 7: Presence Indicators** (AC: And - display presence indicators)
  - [ ] Integrate with SSE presence system (Epic 4)
  - [ ] Create PresenceIndicator component (online, away, offline)
  - [ ] Show green dot for online users
  - [ ] Display yellow for away (idle >5 min)
  - [ ] Show gray for offline
  - [ ] Update presence in real-time
  - [ ] Add presence count summary

- [ ] **Task 8: Notifications** (AC: And - send notification)
  - [ ] Create notification service for team invitations
  - [ ] Send email invitation with accept/decline links
  - [ ] Create in-app notification for added members
  - [ ] Send notification for role changes
  - [ ] Create notification for removal
  - [ ] Implement notification preferences

- [ ] **Task 9: Team Tab Integration** (AC: Given - Team tab)
  - [ ] Create Team tab route in project detail
  - [ ] Integrate all team components
  - [ ] Add team statistics header (total members, online count)
  - [ ] Create team permissions overview
  - [ ] Add team activity graph (optional)
  - [ ] Implement team search and filter

- [ ] **Task 10: Testing & Verification** (AC: All)
  - [ ] Test user search finds existing users
  - [ ] Verify email invitation sends correctly
  - [ ] Test role assignment updates permissions
  - [ ] Verify role changes are logged
  - [ ] Test member removal with confirmation
  - [ ] Verify last owner protection works
  - [ ] Test presence indicators update in real-time
  - [ ] Verify activity tracking displays correctly
  - [ ] Test notifications are sent

---

## Dev Notes

### Architecture Patterns & Constraints

**Team Data Model:**
```typescript
interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'lead' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy?: string;
  currentTask?: string;
  lastSeen: Date;
}

interface ProjectWithTeam extends Project {
  members: ProjectMember[];
  memberCount: number;
  onlineCount: number;
}

interface RolePermissions {
  owner: {
    canEdit: true;
    canDelete: true;
    canManageTeam: true;
    canInvite: true;
    canRemove: true;
  };
  lead: {
    canEdit: true;
    canDelete: false;
    canManageTeam: true;
    canInvite: true;
    canRemove: true; // except owners
  };
  member: {
    canEdit: true;
    canDelete: false;
    canManageTeam: false;
    canInvite: false;
    canRemove: false;
  };
  viewer: {
    canEdit: false;
    canDelete: false;
    canManageTeam: false;
    canInvite: false;
    canRemove: false;
  };
}

interface Presence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastActivity: Date;
  currentTask?: string;
}
```

**Component Structure:**
- **TeamTab** - Main team management container
- **TeamList** - Display of all members
- **MemberRow** - Individual member display
- **AddMemberDialog** - User search and invite
- **RoleSelector** - Role assignment dropdown
- **PresenceIndicator** - Online/away/offline status
- **MemberActions** - Edit role, remove member

### UI/UX Requirements

**Role Hierarchy:**
1. **Owner** - Full control, can manage all members
2. **Lead** - Can edit project, manage non-owner members
3. **Member** - Can edit project content, read-only on team
4. **Viewer** - Read-only access to project

**Visual Design:**
- Role badges with distinct colors (Owner=gold, Lead=purple, Member=blue, Viewer=gray)
- Presence indicators as colored dots
- Member avatars with fallback initials
- Action buttons in kebab menu for clean UI

**Permission Checks:**
- Only Owners/Leads can access Team tab management
- Only Owners can promote/demote other Owners
- Last Owner cannot be removed or downgraded
- Viewers see read-only team list

### File Structure Requirements

**New Components:**
```
src/components/features/team/
├── TeamTab.tsx
├── TeamList.tsx
├── MemberRow.tsx
├── AddMemberDialog.tsx
├── UserSearchInput.tsx
├── RoleSelector.tsx
├── RoleBadge.tsx
├── PresenceIndicator.tsx
├── MemberActions.tsx
├── RemoveMemberDialog.tsx
├── ChangeRoleDialog.tsx
└── types.ts
```

**API Endpoints:**
```
GET    /api/projects/:id/team                    # List members
POST   /api/projects/:id/team                    # Add member (invite)
PUT    /api/projects/:id/team/:userId            # Change role
DELETE /api/projects/:id/team/:userId            # Remove member
GET    /api/users/search                         # Search users
POST   /api/projects/:id/team/invite             # Send email invite
POST   /api/projects/:id/team/invite/:token/accept # Accept invite
GET    /api/projects/:id/team/:userId/activity   # Get member activity
GET    /api/presence                             # SSE presence stream
```

### Testing Requirements

**Manual Testing Checklist:**
1. Open Team tab as Owner - verify all actions available
2. Search for existing users - verify results appear
3. Invite new user by email - verify email sends
4. Add user with role assignment - verify user appears in list
5. Change member role - verify permissions update
6. Remove member - verify user removed from project
7. Try to remove last owner - verify blocked with error
8. View as Member - verify limited actions
9. Check presence indicators update when users come online
10. Verify activity tracking shows last seen

---

## Dev Agent Guardrails

### Technical Requirements

**User Search:**
- Debounce search input (300ms)
- Limit results to 10 users
- Exclude existing members from results
- Search across name, username, email
- Cache frequent searches

**Invitations:**
- Generate secure random tokens (crypto.randomBytes)
- Set 7-day expiration on invitations
- Allow invitation re-sending
- Track invitation status (pending, accepted, declined, expired)
- Require authentication to accept invitation

**Presence System:**
- Integrate with SSE from Epic 4
- Update last seen on every authenticated request
- Mark as away after 5 minutes of inactivity
- Mark as offline after 15 minutes
- Reconnect to SSE on page visibility change

### Architecture Compliance

**Server Component Strategy:**
- Team tab is Server Component
- Interactive elements (dialogs, search) are Client Components
- Use Server Actions for team management operations

**Authorization:**
- Use middleware to check team management permissions
- Authorize every team API endpoint
- Return 403 for unauthorized operations
- Log all permission changes

**Error Handling:**
- Show toast notifications for successful operations
- Display error messages for failures
- Handle invitation expiry gracefully
- Show loading states during async operations

### Library/Framework Requirements

**Additional Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0"
  }
}
```

**Email Service:**
- Use Resend, SendGrid, or similar for transactional emails
- Create email templates for invitations
- Support plain text and HTML versions

### File Structure Requirements

**Must-Create Files:**
1. `src/components/features/team/TeamTab.tsx`
2. `src/components/features/team/TeamList.tsx`
3. `src/components/features/team/AddMemberDialog.tsx`
4. `src/components/features/team/RoleSelector.tsx`
5. `src/components/features/team/PresenceIndicator.tsx`
6. `src/components/features/team/types.ts`
7. `src/app/api/projects/[id]/team/route.ts`
8. `src/app/api/projects/[id]/team/[userId]/route.ts`
9. `src/app/api/users/search/route.ts`

**Database Schema Changes:**
```sql
CREATE TABLE project_members (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'lead', 'member', 'viewer')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  invited_by VARCHAR(20) REFERENCES users(id),
  current_task VARCHAR(100),
  last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE project_invitations (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  invited_by VARCHAR(20) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);
CREATE INDEX idx_project_invitations_expires ON project_invitations(expires_at);
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 6 Focus:** Project Management System - Team Collaboration

**Related Stories:**
- Story 1.3 - OAuth Providers (user identity)
- Story 1.5 - Role-Based Access Control (permissions)
- Story 6.1 - Project Core Data Model
- Story 4.2 - Agent Progress Events (presence system)

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
- Story 6.9 Details - [epics.md#story-69-team-management](../epics.md#story-69-team-management)

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
