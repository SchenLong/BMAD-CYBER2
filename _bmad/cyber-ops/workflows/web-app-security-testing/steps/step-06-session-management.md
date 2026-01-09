---
name: 'step-06-session-management'
description: 'Session management and cookie security testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-06-session-management.md'
nextStepFile: '{workflow_path}/steps/step-07-business-logic.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 6: Session Management Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide session security testing comprehensively

## SESSION MANAGEMENT TESTING SEQUENCE:

### 1. Session Token Analysis

"Let's analyze session token security.

**Token Properties:**
- Token name and location (cookie, header, URL)?
- Token length and character set?
- Entropy analysis (is it random enough)?
- Predictable patterns or sequences?

**Entropy Testing:**
- Collect multiple tokens
- Analyze with Burp Sequencer
- Check for timestamp encoding
- Look for user ID in token

What session tokens have you captured for analysis?"

### 2. Cookie Security Attributes

"Let's verify cookie security flags.

**Required Attributes:**
- **Secure**: Only transmitted over HTTPS
- **HttpOnly**: Not accessible via JavaScript
- **SameSite**: Cross-site request restrictions
- **Path**: Scope limitation
- **Domain**: Domain scope
- **Expires/Max-Age**: Session vs persistent

**Testing:**
1. Capture Set-Cookie headers
2. Verify all security flags
3. Check for cookie-based tokens without flags

What are the cookie attributes in use?"

### 3. Session Lifecycle

"Testing session lifecycle security.

**Session Creation:**
- New session on login?
- Session fixation possible?
- Pre-authentication session converted?

**Session Timeout:**
- Idle timeout configured?
- Absolute timeout enforced?
- Timeout too long (> 30 min idle)?

**Session Termination:**
- Logout invalidates session server-side?
- Token still works after logout?
- All sessions terminated on password change?

What session lifecycle behavior have you observed?"

### 4. Session Fixation

"Testing for session fixation attacks.

**Fixation Test Steps:**
1. Obtain session token before login
2. Login with valid credentials
3. Check if same session token is used
4. If yes: VULNERABLE

**Fixation via:**
- URL parameters (`?SESSIONID=abc`)
- Hidden form fields
- Cookie setting (cross-subdomain)

What session fixation testing results do you have?"

### 5. Concurrent Sessions

"Testing concurrent session handling.

**Multi-Session Security:**
- Can same user have multiple sessions?
- Max concurrent sessions enforced?
- Session displayed in account settings?
- Ability to terminate other sessions?
- Notification on new login?

**Testing:**
1. Login from Browser A
2. Login from Browser B (same user)
3. Check if both sessions valid
4. Check if user is notified

What concurrent session behavior have you found?"

### 6. Cross-Site Request Forgery (CSRF)

"Testing CSRF protection.

**CSRF Token Analysis:**
- CSRF tokens present in forms?
- Token validated server-side?
- Token unique per session/request?
- Token in header vs form field?

**Bypass Attempts:**
- Remove token entirely
- Use token from different session
- Modify token value
- Check non-form endpoints (APIs)

**CSRF Vulnerable Actions:**
- Password change
- Email change
- Account deletion
- Financial transactions
- Admin operations

What CSRF testing have you performed?"

### 7. JWT Analysis (if applicable)

"For JWT-based sessions:

**JWT Security Checks:**
- Algorithm confusion (`none` algorithm)?
- Weak secret (brute-forceable)?
- Signature actually validated?
- Sensitive data in payload?
- Token expiration enforced?
- Token revocation possible?

**JWT Testing:**
1. Decode token (jwt.io)
2. Try `alg: none` bypass
3. Brute force weak secrets
4. Modify claims without re-signing

What JWT analysis have you completed?"

### 8. Document Session Findings

Append to {outputFile} Section 6:

```markdown
## 6. Session Management Testing

### 6.1 Token Analysis
| Property | Value | Status |
|----------|-------|--------|
| Token Name | | |
| Location | Cookie/Header | |
| Length | | |
| Entropy | bits | |
| Predictable | Yes/No | |

### 6.2 Cookie Security
| Cookie | Secure | HttpOnly | SameSite | Status |
|--------|--------|----------|----------|--------|
| | | | | |

### 6.3 Session Lifecycle
| Test | Result | Notes |
|------|--------|-------|
| New session on login | | |
| Idle timeout | | |
| Absolute timeout | | |
| Logout invalidation | | |

### 6.4 Session Fixation
**Result:** [VULNERABLE/SECURE]
**Details:** [Testing details]

### 6.5 Concurrent Sessions
[Behavior and security implications]

### 6.6 CSRF Protection
| Form/Action | Token Present | Validated | Status |
|-------------|---------------|-----------|--------|
| | | | |

### 6.7 JWT Analysis (if applicable)
[JWT security findings]

### 6.8 Session Management Findings
| ID | Vulnerability | Severity | Status |
|----|---------------|----------|--------|
| SESS-001 | | | |
```

### 9. Confirmation

"**Session Management Testing Complete**

**Findings:**
- Cookie security issues: [Count]
- Session lifecycle issues: [Count]
- CSRF vulnerabilities: [Count]
- JWT issues: [Count]

Critical issues: [Summary]

Ready to proceed to business logic testing?"

## MENU

Display: [C] Continue to Business Logic [R] Review/Add Session Findings [E] Exploit Session Vulnerability

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then execute {nextStepFile}.
