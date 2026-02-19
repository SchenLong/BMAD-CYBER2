# BMAD Web UI - User Acceptance Testing (UAT) Plan

**Project:** BMAD Web UI
**Version:** 1.0.0
**Date:** 2025-02-18
**Target Users:** Security Professionals, Incident Responders, Intelligence Analysts

---

## INDEX

| Section | Description |
|---------|-------------|
| [1. UAT Overview](#1-uat-overview) | Purpose and scope |
| [2. Test Scenarios](#2-test-scenarios) | User journey tests |
| [3. Role-Based Testing](#3-role-based-testing) | By user role |
| [4. Acceptance Criteria](#4-acceptance-criteria) | Sign-off requirements |
| [5. UAT Environment](#5-uat-environment) | Setup and access |

---

## 1. UAT OVERVIEW

### 1.1 Purpose

User Acceptance Testing validates that the BMAD Web UI meets business requirements and is ready for production deployment. This document outlines test scenarios for real-world usage by security professionals.

### 1.2 Scope

UAT covers:
- End-to-end user workflows
- Role-based functionality
- Integration with BMAD CLI
- Security features from user perspective
- Performance under realistic load
- Usability and accessibility

### 1.3 Out of Scope

- Unit testing (covered by QA)
- Security penetration testing (covered by security team)
- Performance stress testing (covered by performance tests)
- API documentation validation

---

## 2. TEST SCENARIOS

### 2.1 Scenario 1: New User Onboarding

**User Story:** As a new security analyst, I want to set up my account and understand the system quickly so I can start working on incident response.

**Preconditions:**
- User has valid email address
- Organization uses Google/Microsoft/GitHub OAuth

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to application URL | Login page loads with OAuth options | ☐ |
| 2 | Click "Sign in with Google" | Redirects to Google OAuth | ☐ |
| 3 | Complete Google authentication | Redirects back to BMAD, onboarding wizard starts | ☐ |
| 4 | Select primary role (e.g., "Intel Team") | UI updates to show relevant workflows | ☐ |
| 5 | Complete onboarding wizard | Dashboard loads with role-appropriate navigation | ☐ |
| 6 | Verify navigation menu shows correct items | Menu items match selected role | ☐ |

**Acceptance Criteria:**
- [ ] User can complete OAuth authentication
- [ ] Onboarding wizard guides user through role selection
- [ ] Dashboard is configured based on selected role
- [ ] User can access help documentation
- [ ] Session persists after page refresh

---

### 2.2 Scenario 2: Incident Response Workflow

**User Story:** As an incident responder, I want to create a new incident project and run the flash-assessment workflow to quickly understand the situation.

**Preconditions:**
- User is authenticated with Admin or User role
- User has access to Intel team workflows

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Click "New Project" button | Project creation wizard opens | ☐ |
| 2 | Enter project name "Ransomware Incident - ACME Corp" | Name is accepted | ☐ |
| 3 | Select project type "Incident Response" | Type is selected | ☐ |
| 4 | Select team "Intel Team" | Team is assigned | ☐ |
| 5 | Click "Create Project" | Project created, redirects to project detail | ☐ |
| 6 | Click "Start Workflow" → Select "Flash Assessment" | Workflow execution starts | ☐ |
| 7 | Enter incident details in prompt form | Form accepts input | ☐ |
| 8 | Submit form | Real-time progress updates display | ☐ |
| 9 | Wait for completion | Results display with executive brief | ☐ |
| 10 | Click "Export" → Select "PDF" | PDF downloads with formatted content | ☐ |

**Acceptance Criteria:**
- [ ] Project is created with correct metadata
- [ ] Workflow executes without errors
- [ ] Progress updates are displayed in real-time
- [ ] Results are formatted correctly
- [ ] Export functionality works
- [ ] Activity is logged in audit trail

---

### 2.3 Scenario 3: CLI Command Execution

**User Story:** As a penetration tester, I want to run BMAD CLI commands through the web interface without opening a terminal.

**Preconditions:**
- User is authenticated with User or higher role
- BMAD CLI is installed and accessible

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to Terminal/CLI section | Terminal emulator component loads | ☐ |
| 2 | Type "bmad mission list" | Command is validated against whitelist | ☐ |
| 3 | Press Enter or click Execute | Authentication check passes, command executes | ☐ |
| 4 | View output in terminal | Output is formatted and sanitized | ☐ |
| 5 | Try "rm -rf /etc/passwd" | Command is rejected with "Not in whitelist" error | ☐ |
| 6 | Try "bmad mission.create" (if Admin) | Command executes (or denied if not Admin) | ☐ |
| 7 | Check rate limit after 10 commands | Commands are rate-limited after threshold | ☐ |

**Acceptance Criteria:**
- [ ] Only whitelisted commands can execute
- [ ] Authorization is checked before execution
- [ ] Output is sanitized for security
- [ ] Rate limiting prevents abuse
- [ ] Audit log records command execution
- [ ] Errors are displayed clearly

---

### 2.4 Scenario 4: Evidence Locker

**User Story:** As a forensic analyst, I want to upload evidence files and verify their integrity using cryptographic hashes.

**Preconditions:**
- User is authenticated
- Project exists

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open project → Evidence Locker tab | Evidence locker interface loads | ☐ |
| 2 | Click "Upload Evidence" | File picker dialog opens | ☐ |
| 3 | Select a PDF report | File uploads, hash is calculated | ☐ |
| 4 | Verify hash is displayed | SHA-256 hash is shown | ☐ |
| 5 | Add description and tags | Metadata is saved | ☐ |
| 6 | Download the file | Downloaded file hash matches original | ☐ |
| 7 | Try uploading executable (.exe) | File type is rejected | ☐ |

**Acceptance Criteria:**
- [ ] File uploads work for allowed types
- [ ] Hash calculation is accurate
- [ ] Metadata is preserved
- [ ] File integrity can be verified
- [ ] Dangerous file types are blocked
- [ ] Upload size limits are enforced

---

### 2.5 Scenario 5: Template Generation

**User Story:** As a security consultant, I want to generate a professional executive brief for my client.

**Preconditions:**
- User is authenticated
- Project with findings exists

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open project → Deliverables tab | Deliverables interface loads | ☐ |
| 2 | Click "Generate from Template" → "Executive Brief" | Template form opens | ☐ |
| 3 | Fill in client information | Form accepts input with validation | ☐ |
| 4 | Select findings to include | Findings are added to template | ☐ |
| 5 | Click "Generate" | Template processes and displays preview | ☐ |
| 6 | Review preview and click "Finalize" | Document is saved to deliverables | ☐ |
| 7 | Export to Word and PDF | Both formats download correctly | ☐ |

**Acceptance Criteria:**
- [ ] Template form validates inputs
- [ ] Findings are correctly formatted
- [ ] Preview matches final output
- [ ] Export formats work correctly
- [ ] Branded templates maintain styling
- [ ] Document is added to project history

---

### 2.6 Scenario 6: Team Management

**User Story:** As a team lead, I want to invite team members and assign them appropriate roles.

**Preconditions:**
- User is authenticated with Admin role
- Organization has available seats

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to Settings → Team Management | Team list loads | ☐ |
| 2 | Click "Invite Member" | Invitation form opens | ☐ |
| 3 | Enter email and select role "User" | Form validates input | ☐ |
| 4 | Send invitation | Email is queued, invitation appears in list | ☐ |
| 5 | Open incognito and accept invitation | New user can set up account | ☐ |
| 6 | Verify new user appears in team list | User shows with correct role | ☐ |
| 7 | Try to promote user to SuperAdmin (as Admin) | Operation is denied (insufficient permission) | ☐ |

**Acceptance Criteria:**
- [ ] Invitations can be sent
- [ ] Role hierarchy is enforced
- [ ] New users can accept invitations
- [ ] Team list is accurate
- [ ] Permission checks work correctly

---

### 2.7 Scenario 7: Multi-Factor Authentication

**User Story:** As a security-conscious user, I want to enable MFA to protect my account.

**Preconditions:**
- User is authenticated
- User has authenticator app (Google Authenticator, etc.)

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to Settings → Security | Security settings load | ☐ |
| 2 | Click "Enable MFA" | QR code is displayed | ☐ |
| 3 | Scan QR code with authenticator app | App adds BMAD account | ☐ |
| 4 | Enter 6-digit code from app | Code is validated | ☐ |
| 5 | Click "Confirm" | MFA is enabled | ☐ |
| 6 | Logout and login again | MFA code prompt appears | ☐ |
| 7 | Enter correct code | Login successful | ☐ |
| 8 | Try incorrect code | Login fails, error message | ☐ |

**Acceptance Criteria:**
- [ ] QR code generation works
- [ ] TOTP codes are validated correctly
- [ ] MFA is enforced on subsequent logins
- [ ] Backup codes are provided
- [ ] MFA can be disabled (with verification)

---

### 2.8 Scenario 8: API Access

**User Story:** As a developer, I want to generate an API key to integrate BMAD with my tools.

**Preconditions:**
- User is authenticated with Admin or User role

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to Settings → API Keys | API key management loads | ☐ |
| 2 | Click "Generate API Key" | Creation form opens | ☐ |
| 3 | Enter key name "SIEM Integration" | Form accepts input | ☐ |
| 4 | Set expiration to 90 days | Expiration is set | ☐ |
| 5 | Click "Generate" | API key is displayed (show once) | ☐ |
| 6 | Copy API key to clipboard | Key is copied securely | ☐ |
| 7 | Use API key in Postman/curl | API request authenticates successfully | ☐ |
| 8 | Try to use invalid key | API returns 401 Unauthorized | ☐ |

**Acceptance Criteria:**
- [ ] API keys can be generated
- [ ] Keys are hashed before storage
- [ ] Keys are shown only once
- [ ] Expiration is enforced
- [ ] Keys can be revoked
- [ ] API authentication works correctly

---

## 3. ROLE-BASED TESTING

### 3.1 SuperAdmin

**Capabilities to Test:**
- [ ] Access all system settings
- [ ] Manage users and roles
- [ ] View and export audit logs
- [ ] Configure security policies
- [ ] Manage API keys for all users
- [ ] Access billing/subscription (if applicable)

**Restrictions:**
- None - SuperAdmin has full access

### 3.2 Admin

**Capabilities to Test:**
- [ ] Create and delete projects
- [ ] Manage team members
- [ ] Access all workflows
- [ ] Generate and view deliverables
- [ ] Manage project-level settings
- [ ] View audit logs within projects

**Restrictions:**
- [ ] Cannot modify system-level settings
- [ ] Cannot manage roles outside their team
- [ ] Cannot access billing

### 3.3 User

**Capabilities to Test:**
- [ ] View assigned projects
- [ ] Execute permitted workflows
- [ ] Create deliverables
- [ ] Upload evidence
- [ ] Generate API keys
- [ ] Enable MFA

**Restrictions:**
- [ ] Cannot create projects (unless permitted)
- [ ] Cannot delete projects
- [ ] Cannot manage other users
- [ ] Cannot access admin settings

### 3.4 ReadOnly

**Capabilities to Test:**
- [ ] View projects they have access to
- [ ] View deliverables
- [ ] View evidence locker
- [ ] Download exported reports

**Restrictions:**
- [ ] Cannot execute workflows
- [ ] Cannot create or modify data
- [ ] Cannot access CLI terminal
- [ ] Cannot generate API keys

### 3.5 API

**Capabilities to Test:**
- [ ] Authenticate via API key
- [ ] Execute permitted endpoints
- [ ] Access data via REST API
- [ ] Webhook notifications

**Restrictions:**
- [ ] Cannot access UI (unless also has other role)
- [ ] Subject to rate limits
- [ ] Cannot perform actions beyond API scope

---

## 4. ACCEPTANCE CRITERIA

### 4.1 General Acceptance Criteria

All features must meet these criteria:

**Functionality:**
- [ ] Feature works as documented
- [ ] Edge cases are handled gracefully
- [ ] Error messages are clear and actionable
- [ ] Data persists correctly

**Security:**
- [ ] Authentication is required
- [ ] Authorization is enforced
- [ ] Input validation prevents injection
- [ ] Sensitive data is protected

**Performance:**
- [ ] Pages load within acceptable time
- [ ] Real-time updates are responsive
- [ ] Large data sets paginate correctly
- [ ] No memory leaks detected

**Usability:**
- [ ] Interface is intuitive
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (WCAG 2.1 AA)
- [ ] Mobile responsive design

### 4.2 Sign-Off Process

Each feature requires sign-off from:

| Role | Sign-Off | Date | Notes |
|------|----------|------|-------|
| Product Owner | ☐ | | |
| Security Lead | ☐ | | |
| QA Lead | ☐ | | |
| User Representative | ☐ | | |

---

## 5. UAT ENVIRONMENT

### 5.1 Environment Setup

**URL:** [To be configured]
**Data:** Sanitized production copy or realistic test data
**Access:** VPN or authentication required

### 5.2 Test Data

**Pre-configured Accounts:**
- SuperAdmin: uat-superadmin@bmad.test
- Admin: uat-admin@bmad.test
- User: uat-user@bmad.test
- ReadOnly: uat-readonly@bmad.test

**Sample Projects:**
- Incident Response: "Ransomware - ACME Corp"
- Pen Test: "External Assessment - Target Inc"
- Intel: "Threat Actor - APT29"

### 5.3 Known Issues

| ID | Issue | Severity | Workaround |
|----|-------|----------|------------|
| UAT-001 | [Document known issues] | | |

### 5.4 Issue Reporting

Issues found during UAT should be reported to:
- **Email:** [Security Team]
- **Slack:** #bmad-uat-feedback
- **Tracker:** [Issue Tracker Link]

**Issue Template:**
```
Title: [UAT] Brief description of issue
Steps to Reproduce:
1.
2.
3.

Expected Result:
Actual Result:
Screenshots:
Role: (role when issue occurred)
Browser: (browser and version)
```

---

## APPENDIX A: UAT Checklist

### Daily UAT Checklist

**Morning Setup:**
- [ ] Verify UAT environment is accessible
- [ ] Check test data is intact
- [ ] Review any new issues from overnight

**Testing Session:**
- [ ] Complete assigned test scenarios
- [ ] Document any deviations from expected behavior
- [ ] Capture screenshots of issues
- [ ] Verify browser compatibility

**End of Day:**
- [ ] Update test results
- [ ] Report critical issues immediately
- [ ] Note any improvements to test cases

### UAT Sign-Off

**I, ________________________, confirm that:**

- [ ] I have completed all assigned UAT scenarios
- [ ] All critical and high-severity issues are resolved
- [ ] Medium-severity issues are documented with acceptable risk
- [ ] The application is ready for production deployment

**Signature:** _________________ **Date:** _________

---

**Document Status:** Active
**Last Updated:** 2025-02-18
**Next Review:** Before each release
