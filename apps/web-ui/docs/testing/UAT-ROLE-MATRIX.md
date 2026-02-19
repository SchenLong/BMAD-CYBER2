# BMAD Web UI - Role-Based Testing Matrix

**Project:** BMAD Web UI
**Version:** 1.0.0
**Date:** 2026-02-19
**Target Audience:** UAT Testers, QA Team, Developers

---

## INDEX

| Section | Description |
|---------|-------------|
| [1. Role System Overview](#1-role-system-overview) | RBAC architecture |
| [2. System Roles](#2-system-roles) | Global role definitions |
| [3. Project Roles](#3-project-roles) | Project-level permissions |
| [4. Permission Matrix](#4-permission-matrix) | Detailed permission mapping |
| [5. Test Cases by Role](#5-test-cases-by-role) | Role-specific test scenarios |

---

## 1. ROLE SYSTEM OVERVIEW

### 1.1 RBAC Architecture

BMAD Web UI implements a **dual-role system**:

1. **System Role** - Global permissions across the entire application
2. **Project Role** - Permissions specific to individual projects

**Permission Combination:** Permissions are combined using OR logic
- User gets action if granted by EITHER system OR project role
- System role permissions take precedence in conflicts

### 1.2 Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    SUPERADMIN (Level 100)                │
│  All permissions + user impersonation + system config   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      ADMIN (Level 75)                    │
│         User mgmt + project mgmt + all workflows        │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                       USER (Level 50)                    │
│          Standard operations + workflow execution       │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     READONLY (Level 25)                 │
│                    View-only access                     │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Special Roles

| Role | Level | Description |
|------|-------|-------------|
| **API** | 50 | Programmatic access with rate limiting |
| **GUEST** | 10 | Temporary limited access (future) |

---

## 2. SYSTEM ROLES

### 2.1 SUPERADMIN

**Level:** 100
**Description:** Full system access including user impersonation and system configuration

#### Capabilities

| Category | Permissions |
|----------|-------------|
| **Projects** | Create, Read, Update, Delete, Archive any project |
| **Workflows** | Execute, Cancel any workflow |
| **Agents** | Invoke, Configure any agent |
| **Artifacts** | Create, Read, Update, Delete, Download, Upload |
| **Evidence** | Upload, Read, Delete, Verify |
| **Team** | Invite, Remove, Update any team member |
| **Users** | Create, Read, Update, Delete any user |
| **Audit Logs** | Read, Export all audit logs |
| **System** | Configure system settings, Manage organizations |
| **Security** | Initiate scans, View reports, Manage MFA policies |
| **Templates** | Create, Read, Update, Delete custom templates |
| **Billing** | View and manage subscriptions |
| **Impersonation** | Impersonate any user for support |

#### Restrictions

**None** - SuperAdmin has full system access

---

### 2.2 ADMIN

**Level:** 75
**Description:** Administrative access without user impersonation or system configuration

#### Capabilities

| Category | Permissions |
|----------|-------------|
| **Projects** | Create, Read, Update, Delete, Archive (within scope) |
| **Workflows** | Execute, Cancel any workflow |
| **Agents** | Invoke, Configure agents |
| **Artifacts** | Create, Read, Update, Delete, Download, Upload |
| **Evidence** | Upload, Read, Delete, Verify |
| **Team** | Invite, Remove, Update team members (within scope) |
| **Audit Logs** | Read, Export audit logs |
| **Security** | Initiate scans, View security reports |
| **Templates** | Create, Read, Update, Delete templates |

#### Restrictions

| Action | Restriction |
|--------|-------------|
| User Impersonation | ❌ Not allowed |
| System Configuration | ❌ Not allowed |
| Billing Management | ❌ Not allowed |
| Role Promotion | ❌ Cannot promote users to same/higher level |

---

### 2.3 USER

**Level:** 50
**Description:** Standard user access for daily operations

#### Capabilities

| Category | Permissions |
|----------|-------------|
| **Projects** | Read (limited), Create (if permitted) |
| **Workflows** | Execute permitted workflows |
| **Agents** | Invoke permitted agents |
| **Artifacts** | Create, Read, Upload |
| **Evidence** | Upload, Read |
| **Team** | Read team members, Invite (if permitted) |
| **Settings** | Manage own profile, Enable MFA |
| **API** | Generate and manage own API keys |

#### Restrictions

| Action | Restriction |
|--------|-------------|
| Delete Projects | ❌ Not allowed |
| Manage Other Users | ❌ Not allowed |
| Access Admin Settings | ❌ Not allowed |
| View All Audit Logs | ❌ Own logs only |
| Create Templates | ❌ Read only |

---

### 2.4 READONLY

**Level:** 25
**Description:** View-only access for stakeholders and auditors

#### Capabilities

| Category | Permissions |
|----------|-------------|
| **Projects** | View assigned projects |
| **Workflows** | View workflow results |
| **Artifacts** | Read, Download |
| **Evidence** | Read, Download |
| **Templates** | Read templates |

#### Restrictions

| Action | Restriction |
|--------|-------------|
| Execute Workflows | ❌ Not allowed |
| Create/Modify Data | ❌ Not allowed |
| CLI Terminal | ❌ Not allowed |
| Generate API Keys | ❌ Not allowed |
| Upload Artifacts | ❌ Not allowed |

---

### 2.5 API

**Level:** 50
**Description:** Programmatic access for external integrations

#### Capabilities

| Category | Permissions |
|----------|-------------|
| **Projects** | Read assigned projects |
| **Workflows** | Execute permitted workflows |
| **Agents** | Invoke permitted agents |
| **API Endpoints** | Access permitted REST API endpoints |

#### Restrictions

| Action | Restriction |
|--------|-------------|
| UI Access | ❌ Not allowed (unless also has other role) |
| Rate Limiting | ✅ Enforced (1000 req/15min) |
| Webhook Access | ✅ Permitted endpoints only |

---

## 3. PROJECT ROLES

### 3.1 Project Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    OWNER (Level 100)                     │
│         Full control + delete + member management       │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      LEAD (Level 75)                     │
│         Project mgmt + workflow execution + team        │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  CONTRIBUTOR (Level 50)                 │
│              Standard project operations                │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   REVIEWER (Level 40)                   │
│                Review + verify only                     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   VIEWER (Level 25)                     │
│                    View only                            │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Project Role Details

| Role | Projects | Workflows | Artifacts | Evidence | Team |
|------|----------|-----------|-----------|----------|-------|
| **OWNER** | Full | Create, Execute, Cancel | Full CRUD | Upload, Read, Delete, Verify | Invite, Remove, Update |
| **LEAD** | Update, Read | Create, Execute, Cancel | Create, Read, Upload, Download | Upload, Read, Delete, Verify | Invite, Update |
| **CONTRIBUTOR** | Read | Create, Execute | Create, Read, Upload | Upload, Read | Read |
| **REVIEWER** | Read | Read | Read, Download | Read, Verify | Read |
| **VIEWER** | Read | Read | Read, Download | Read | Read |

---

## 4. PERMISSION MATRIX

### 4.1 System Permissions by Role

| Permission Category | SUPERADMIN | ADMIN | USER | READONLY | API |
|---------------------|------------|-------|------|----------|-----|
| **Project Management** |
| Create Projects | ✅ | ✅ | Limited | ❌ | ✅ |
| Read Projects | ✅ | ✅ | Assigned | Assigned | ✅ |
| Update Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Archive Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Workflow Management** |
| Create Workflows | ✅ | ✅ | ✅ | ❌ | ✅ |
| Execute Workflows | ✅ | ✅ | ✅ | ❌ | ✅ |
| Cancel Workflows | ✅ | ✅ | Own | ❌ | ✅ |
| **Agent Interaction** |
| Invoke Agents | ✅ | ✅ | ✅ | ❌ | ✅ |
| Configure Agents | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Artifact Management** |
| Create Artifacts | ✅ | ✅ | ✅ | ❌ | ❌ |
| Read Artifacts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update Artifacts | ✅ | ✅ | Own | ❌ | ❌ |
| Delete Artifacts | ✅ | ✅ | Own | ❌ | ❌ |
| Download Artifacts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Artifacts | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Evidence Management** |
| Upload Evidence | ✅ | ✅ | ✅ | ❌ | ❌ |
| Read Evidence | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Evidence | ✅ | ✅ | Own | ❌ | ❌ |
| Verify Evidence | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Team Management** |
| Invite Members | ✅ | ✅ | Limited | ❌ | ❌ |
| Remove Members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Member Roles | ✅ | Limited | ❌ | ❌ | ❌ |
| **User Management** |
| Create Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Users | ✅ | ❌ | Own | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Impersonate Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Audit & Logging** |
| Read Audit Logs | ✅ | Limited | Own | ❌ | ❌ |
| Export Audit Logs | ✅ | Limited | Own | ❌ | ❌ |
| **System Administration** |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security Policies | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Organizations | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Security Features** |
| Initiate Security Scans | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Security Reports | ✅ | ✅ | Own | ❌ | ❌ |
| **Template Management** |
| Create Templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read Templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update Templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| **API Access** |
| Generate API Keys | ✅ | ✅ | ✅ | ❌ | N/A |
| Revoke API Keys | ✅ | ✅ | Own | ❌ | N/A |
| **Billing** |
| View Billing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Subscription | ✅ | ❌ | ❌ | ❌ | ❌ |

### 4.2 Cross-Role Access Rules

| Source Role | Can Target | Notes |
|-------------|------------|-------|
| SUPERADMIN | All roles | Full access including impersonation |
| ADMIN | USER, READONLY | Cannot target other ADMIN or SUPERADMIN |
| USER | READONLY | Cannot target other users |
| READONLY | None | No targeting permissions |
| API | System only | No user-to-user operations |

---

## 5. TEST CASES BY ROLE

### 5.1 SUPERADMIN Test Cases

#### TC-SUPERADMIN-001: User Impersonation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as SUPERADMIN | Dashboard loads with admin options |
| 2 | Navigate to Users list | All users displayed |
| 3 | Click "Impersonate" on a USER | Session switches to USER |
| 4 | Verify access | See USER's view, not admin |
| 5 | Click "Exit Impersonation" | Return to SUPERADMIN session |

**Expected:** Can impersonate any user
**Actual:** _______________

---

#### TC-SUPERADMIN-002: System Configuration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to System Settings | Settings panel opens |
| 2 | Modify session timeout value | Value accepted |
| 3 | Save changes | Changes persist |
| 4 | Verify new timeout applies | Session expires at new duration |

**Expected:** Can modify all system settings
**Actual:** _______________

---

#### TC-SUPERADMIN-003: Full Project Access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Browse all projects | All projects visible |
| 2 | Open any project | Project details load |
| 3 | Try to delete project | Confirmation dialog appears |
| 4 | Cancel deletion | Project remains |

**Expected:** Full CRUD on all projects
**Actual:** _______________

---

### 5.2 ADMIN Test Cases

#### TC-ADMIN-001: Project Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "New Project" | Project creation wizard opens |
| 2 | Fill project details | Form validates input |
| 3 | Create project | Project created successfully |
| 4 | Delete own project | Project deleted |

**Expected:** Can create/delete projects
**Actual:** _______________

---

#### TC-ADMIN-002: Team Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Team Management | Team list loads |
| 2 | Invite new USER | Invitation sent |
| 3 | Try to promote to ADMIN | Operation denied |
| 4 | Remove USER | USER removed from team |

**Expected:** Can manage team, not promote to same/higher level
**Actual:** _______________

---

#### TC-ADMIN-003: Restricted System Access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to System Settings | Access denied/hidden |
| 2 | Try to access Billing | Access denied/hidden |
| 3 | Try to impersonate user | Option not available |

**Expected:** Cannot access system-level functions
**Actual:** _______________

---

### 5.3 USER Test Cases

#### TC-USER-001: Standard Operations

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View assigned projects | Assigned projects shown |
| 2 | Execute permitted workflow | Workflow executes |
| 3 | Upload artifact | Artifact uploaded |
| 4 | Generate API key | API key created |

**Expected:** Can perform standard operations
**Actual:** _______________

---

#### TC-USER-002: Restricted Deletion

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open own project | Project loads |
| 2 | Try to delete project | Operation denied |
| 3 | Try to delete other's artifact | Operation denied |

**Expected:** Cannot delete projects or others' artifacts
**Actual:** _______________

---

#### TC-USER-003: Own Profile Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile | Profile settings load |
| 2 | Enable MFA | MFA setup starts |
| 3 | Complete MFA setup | MFA enabled |
| 4 | View own API keys | Own keys shown |

**Expected:** Can manage own profile
**Actual:** _______________

---

### 5.4 READONLY Test Cases

#### TC-READONLY-001: View-Only Access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View assigned projects | Projects displayed |
| 2 | Open project | Details shown |
| 3 | Try to execute workflow | Execute button hidden/disabled |
| 4 | Try to upload artifact | Upload option not available |

**Expected:** Can view, cannot modify
**Actual:** _______________

---

#### TC-READONLY-002: Download Permissions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open project artifacts | Artifacts listed |
| 2 | Download artifact | Download succeeds |
| 3 | Try to upload | Upload not available |

**Expected:** Can download, cannot upload
**Actual:** _______________

---

### 5.5 API Test Cases

#### TC-API-001: API Authentication

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Generate API key | Key returned (show once) |
| 2 | Copy key | Key stored securely |
| 3 | Use key in API request | Request authenticated |
| 4 | Use invalid key | 401 Unauthorized returned |

**Expected:** API key authentication works
**Actual:** _______________

---

#### TC-API-002: Rate Limiting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send 1000 requests in 15 minutes | All succeed |
| 2 | Send request 1001 | 429 Too Many Requests |
| 3 | Wait for window | Requests work again |

**Expected:** Rate limits enforced
**Actual:** _______________

---

## APPENDIX A: Test Execution Record

### Test Session Log

| Date | Tester | Role Tested | TC Count | Pass | Fail | Blocked |
|------|--------|-------------|----------|------|------|---------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

### Defect Summary

| Defect ID | Related Role | TC Reference | Severity | Status |
|-----------|--------------|--------------|----------|--------|
| | | | | |
| | | | | |
| | | | | |

---

**Document Status:** Active
**Last Updated:** 2026-02-19
**Next Review:** After each UAT cycle
