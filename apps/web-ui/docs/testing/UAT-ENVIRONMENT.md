# BMAD Web UI - UAT Environment Setup Guide

**Project:** BMAD Web UI
**Version:** 1.0.0
**Date:** 2026-02-19
**Target Audience:** UAT Coordinators, Testers, Stakeholders

---

## INDEX

| Section | Description |
|---------|-------------|
| [1. Environment Overview](#1-environment-overview) | UAT environment details |
| [2. Access Instructions](#2-access-instructions) | How to access UAT environment |
| [3. Test Accounts](#3-test-accounts) | Pre-configured test credentials |
| [4. Test Data](#4-test-data) | Sample projects and data |
| [5. Environment Configuration](#5-environment-configuration) | Settings and features |
| [6. Maintenance](#6-maintenance) | Reset and refresh procedures |

---

## 1. ENVIRONMENT OVERVIEW

### 1.1 Purpose

The UAT (User Acceptance Testing) environment provides a stable, production-like environment for stakeholders to validate features before production deployment.

### 1.2 Environment Details

| Property | Value |
|----------|-------|
| **Environment Name** | BMAD Web UI - UAT |
| **URL** | `https://uat.bmad.example.com` (to be configured) |
| **Status** | Active |
| **Data Refresh** | Weekly (Sundays 02:00 UTC) |
| **Maintenance Window** | Saturdays 03:00-05:00 UTC |

### 1.3 Environment Characteristics

- **Data Source:** Sanitized production data with added test scenarios
- **Authentication:** OAuth test providers + local test accounts
- **External Integrations:** Mocked/sandboxed (email, APIs)
- **Performance:** Production-equivalent resources

---

## 2. ACCESS INSTRUCTIONS

### 2.1 Initial Access

**Step 1: Request Access**
1. Contact the UAT Coordinator
2. Provide your name, role, and testing scope
3. Receive environment URL and initial credentials

**Step 2: First Login**
1. Navigate to UAT environment URL
2. Click "First Time Setup" or use provided credentials
3. Complete password reset (for first-time users)
4. Complete onboarding wizard

**Step 3: Verify Access**
- Confirm you can access your assigned projects
- Verify your role permissions
- Test basic navigation

### 2.2 VPN Requirements

**For Internal Team Members:**
- VPN required when accessing from outside corporate network
- Use corporate VPN client
- Connect to `vpn.internal.com` before accessing UAT URL

**For External Stakeholders:**
- No VPN required
- Access via authentication only
- Contact IT for whitelist if needed

### 2.3 Browser Requirements

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | 120+ | Recommended |
| Firefox | 115+ | Fully supported |
| Safari | 17+ | macOS/iOS only |
| Edge | 120+ | Chromium-based |

---

## 3. TEST ACCOUNTS

### 3.1 Pre-Configured Accounts

The following test accounts are pre-configured in the UAT environment:

| Role | Email | Initial Password | Purpose |
|------|-------|------------------|---------|
| **SuperAdmin** | uat-superadmin@bmad.test | TestPass123! | Full system access testing |
| **Admin** | uat-admin@bmad.test | TestPass123! | Admin feature testing |
| **User** | uat-user@bmad.test | TestPass123! | Standard user workflows |
| **ReadOnly** | uat-readonly@bmad.test | TestPass123! | View-only access testing |
| **API** | uat-api@bmad.test | TestPass123! | API integration testing |

### 3.2 OAuth Test Accounts

For OAuth authentication testing, use these test provider accounts:

**Google Test Account:**
- Email: bmad.uat@gmail.com
- Password: [Contact UAT Coordinator]

**Microsoft Test Account:**
- Email: bmad-uat@outlook.com
- Password: [Contact UAT Coordinator]

### 3.3 Account Permissions Summary

| Permission | SuperAdmin | Admin | User | ReadOnly | API |
|------------|------------|-------|------|----------|-----|
| Create Projects | ✅ | ✅ | Limited | ❌ | ✅ |
| Delete Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Execute Workflows | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage Team | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | Own | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| CLI Terminal | ✅ | ✅ | ✅ | ❌ | ❌ |
| API Key Generation | ✅ | ✅ | ✅ | ❌ | N/A |

### 3.4 Session Management

**Session Duration:** 15 minutes (inactivity timeout)

**Concurrent Sessions:**
- SuperAdmin: 10 sessions
- Admin: 5 sessions
- User: 3 sessions
- ReadOnly: 2 sessions
- API: Unlimited (with rate limiting)

**Test Note:** Sessions are reset during weekly data refresh.

---

## 4. TEST DATA

### 4.1 Pre-Configured Projects

The following projects are available for testing:

#### Incident Response Projects

| Project Name | Type | Team | Status | Test Purpose |
|--------------|------|------|--------|--------------|
| Ransomware - ACME Corp | Incident Response | Intel Team | Active | Workflow execution |
| Phishing Campaign - Retail Inc | Incident Response | Intel Team | Active | Evidence upload |
| Data Breach - Finance Co | Incident Response | Intel Team | Closed | Report generation |

#### Penetration Testing Projects

| Project Name | Type | Team | Status | Test Purpose |
|--------------|------|------|--------|--------------|
| External Assessment - Target Inc | Pen Test | CyberSec Team | Active | CLI commands |
| Internal Assessment - Health Corp | Pen Test | CyberSec Team | Active | Workflow testing |
| Web App Assessment - Tech Startup | Pen Test | CyberSec Team | In Progress | Template generation |

#### Intelligence Projects

| Project Name | Type | Team | Status | Test Purpose |
|--------------|------|------|--------|--------------|
| Threat Actor - APT29 | Intel | Intel Team | Active | OSINT workflows |
| Campaign - Disinformation Ops | Intel | Intel Team | Active | Analysis workflows |
| Infrastructure - Botnet X | Intel | Intel Team | Active | Evidence locker |

### 4.2 Evidence Files

Pre-loaded evidence files are available in project evidence lockers:

| File Name | Type | Size | Hash (SHA-256) | Project |
|-----------|------|------|---------------|---------|
| phishing_email.eml | Email | 12 KB | a1b2c3d4... | Phishing Campaign |
| malware_sample.bin | Binary | 45 KB | e5f6g7h8... | Ransomware - ACME |
| network_capture.pcap | Network | 2.3 MB | i9j0k1l2... | Data Breach |
| screenshot.png | Image | 156 KB | m3n4o5p6... | Web App Assessment |

**Note:** Download any evidence file to verify hash calculation integrity.

### 4.3 Test Data Limitations

- **Email Notifications:** Captured, not sent (check "Email Log" in Settings)
- **External APIs:** Mocked responses (CLIs return sample data)
- **File Storage:** Temporary (reset weekly)
- **Audit Logs:** Retained for 30 days only

---

## 5. ENVIRONMENT CONFIGURATION

### 5.1 Enabled Features

| Feature | Status | Notes |
|---------|--------|-------|
| OAuth Authentication | ✅ Enabled | Google, Microsoft, GitHub |
| MFA (TOTP) | ✅ Enabled | Google Authenticator compatible |
| CLI Bridge | ✅ Enabled | Whitelist enforced |
| Evidence Locker | ✅ Enabled | 100MB limit per project |
| Template Generation | ✅ Enabled | 3 templates available |
| API Access | ✅ Enabled | Rate limited |
| Real-time Updates | ✅ Enabled | SSE/WebSocket |
| Audit Logging | ✅ Enabled | All actions logged |

### 5.2 Rate Limiting

API rate limits are enforced in UAT environment:

| Access Type | Limit | Window |
|-------------|-------|--------|
| Session-based | 100 requests | 15 minutes |
| API Key | 1000 requests | 15 minutes |
| CLI Commands | 10 commands | 5 minutes |
| File Uploads | 5 uploads | 5 minutes |

### 5.3 Security Configuration

- **Password Policy:** Minimum 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special
- **Session Timeout:** 15 minutes of inactivity
- **MFA:** Optional (can be enforced per user)
- **IP Whitelist:** None (for UAT accessibility)
- **File Upload Limits:**
  - Max file size: 50MB
  - Allowed types: PDF, PNG, JPG, TXT, CSV, JSON, XML, PCAP, EML, MSG

### 5.4 Disabled Features

The following features are disabled in UAT:

- ❌ Production email sending (use email log instead)
- ❌ Real payment processing
- ❌ Production webhook calls
- ❌ External service integrations (SLACK, JIRA, etc.)

---

## 6. MAINTENANCE

### 6.1 Data Refresh Schedule

**Weekly Refresh:** Every Sunday at 02:00 UTC

**What Gets Reset:**
- Test data to baseline state
- Passwords to initial values
- Sessions and tokens
- Uploaded files (evidence)
- Audit logs older than 30 days

**What Gets Preserved:**
- Custom test configurations
- UAT issue reports
- Sign-off records

### 6.2 Manual Reset

If you need to reset your test environment:

**Option 1: Self-Service Reset**
1. Navigate to Settings → UAT Tools
2. Click "Reset My Test Data"
3. Confirm reset
4. Wait 2-3 minutes for completion

**Option 2: Coordinator Reset**
1. Contact UAT Coordinator
2. Request account/project reset
3. Coordinator will process within 1 business day

### 6.3 Environment Status Check

**Current Environment Status:**
- Health Check: [Run `/api/health` endpoint]
- Last Refresh: [Check Status page]
- Next Scheduled Refresh: Sundays 02:00 UTC
- Known Issues: [Refer to UAT-TEST-PLAN.md Section 5.3]

### 6.4 Issue Reporting

**If you encounter environment issues:**

1. **First, check:** Is it a known issue? (See UAT-TEST-PLAN.md)
2. **Check browser:** Try a different browser or incognito mode
3. **Check credentials:** Verify you're using the correct test account
4. **Report if needed:** Use the issue template in UAT-TEST-PLAN.md

**UAT Coordinator Contact:**
- Email: uat-coordinator@bmad.example.com
- Slack: #bmad-uat-support
- Response Time: Within 4 hours during business days

---

## APPENDIX A: Quick Reference Card

### UAT Environment Quick Access

```
URL: https://uat.bmad.example.com
VPN: vpn.internal.com (internal only)

Test Accounts:
SuperAdmin: uat-superadmin@bmad.test / TestPass123!
Admin:      uat-admin@bmad.test / TestPass123!
User:       uat-user@bmad.test / TestPass123!
ReadOnly:   uat-readonly@bmad.test / TestPass123!

Support: #bmad-uat-support
Status: /api/health
```

### Common Test Workflows

**1. Test Incident Response:**
- Login as Admin
- Open project "Ransomware - ACME Corp"
- Run "Flash Assessment" workflow

**2. Test Evidence Upload:**
- Login as User
- Open any project
- Navigate to Evidence Locker
- Upload test file, verify hash

**3. Test CLI Commands:**
- Login as User
- Navigate to CLI Terminal
- Run: `bmad mission list`

**4. Test Role Restrictions:**
- Login as ReadOnly
- Verify you cannot create projects
- Verify you cannot execute workflows

---

**Document Status:** Active
**Last Updated:** 2026-02-19
**Next Review:** Monthly or before each UAT cycle
**Maintained By:** UAT Coordinator
