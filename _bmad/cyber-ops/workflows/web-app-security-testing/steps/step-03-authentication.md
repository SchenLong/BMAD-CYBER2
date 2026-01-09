---
name: 'step-03-authentication'
description: 'Authentication mechanism security testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-03-authentication.md'
nextStepFile: '{workflow_path}/steps/step-04-authorization.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 3: Authentication Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide testing, collect results, document findings

## AUTHENTICATION TESTING SEQUENCE:

### 1. Credential Testing

"Let's test credential handling.

**Password Policy:**
- Minimum length?
- Complexity requirements?
- Common password blocking?

**Credential Attacks:**
- Brute force protection (lockout after X attempts)?
- Rate limiting on login endpoint?
- CAPTCHA implementation?
- Timing attacks (user enumeration via response time)?

**Testing Questions:**
1. What happens after 5 failed login attempts?
2. Can you enumerate valid usernames via login errors?
3. Is the password reset vulnerable to enumeration?

What have you observed or tested?"

### 2. Session Token Analysis

"Now let's analyze session tokens.

**Token Characteristics:**
- Cookie or header-based?
- Secure and HttpOnly flags set?
- SameSite attribute?
- Token entropy (length, randomness)?
- Predictable patterns?

**Session Behavior:**
- Session timeout configured?
- Session invalidated on logout?
- Concurrent session handling?
- Session fixation possible?

What session token details can you share?"

### 3. Password Reset Flow

"Let's examine password reset security.

**Reset Token Analysis:**
- Token length and entropy?
- Token expiration time?
- Single-use enforcement?
- Transmitted via URL or POST?

**Reset Vulnerabilities:**
- Host header injection?
- Token leakage in referer?
- Account takeover via reset?
- Reset link works for any account?

Have you tested the password reset functionality?"

### 4. Multi-Factor Authentication

"If MFA is implemented, let's test it.

**MFA Bypass Attempts:**
- Can MFA step be skipped by manipulating flow?
- Backup codes secure?
- SMS/email code brute-forceable?
- Rate limiting on MFA endpoint?
- MFA enforced on all sensitive operations?

What MFA testing have you performed?"

### 5. OAuth/SSO Testing

"For OAuth/OIDC/SAML implementations:

**OAuth Security:**
- State parameter implemented?
- Redirect URI validation (open redirect)?
- Token leakage in URL fragments?
- Scope escalation possible?

**SAML Security:**
- XML signature validation?
- XXE vulnerabilities?
- Comment injection?

What OAuth/SSO testing results do you have?"

### 6. Document Authentication Findings

Append to {outputFile} Section 3:

```markdown
## 3. Authentication Testing

### 3.1 Credential Policy
| Control | Status | Notes |
|---------|--------|-------|
| Password Length | | |
| Complexity Required | | |
| Account Lockout | | |
| Brute Force Protection | | |

### 3.2 User Enumeration
**Tested Vectors:**
- Login error messages: [VULNERABLE/SECURE]
- Registration: [VULNERABLE/SECURE]
- Password reset: [VULNERABLE/SECURE]
- Response timing: [VULNERABLE/SECURE]

### 3.3 Session Security
| Attribute | Value | Status |
|-----------|-------|--------|
| Secure Flag | | |
| HttpOnly Flag | | |
| SameSite | | |
| Token Entropy | | |
| Session Timeout | | |

### 3.4 Password Reset
[Findings and vulnerabilities]

### 3.5 MFA Analysis
[MFA implementation review]

### 3.6 OAuth/SSO
[OAuth/SAML findings]

### 3.7 Authentication Findings
| ID | Vulnerability | Severity | Status |
|----|---------------|----------|--------|
| AUTH-001 | | | |
```

### 7. Confirmation

"**Authentication Testing Complete**

**Findings:**
- [Count] authentication vulnerabilities identified
- [Highest severity] is the most critical
- [Key finding summary]

Ready to proceed to authorization testing?"

## MENU

Display: [C] Continue to Authorization Testing [R] Review/Add Auth Findings [E] Explore Specific Vulnerability

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3]`, then execute {nextStepFile}.
