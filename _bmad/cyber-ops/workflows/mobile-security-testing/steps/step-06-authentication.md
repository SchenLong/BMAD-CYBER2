---

name: 'step-06-authentication'
description: 'Authentication and session management assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-06-authentication.md'
nextStepFile: '{workflow_path}/steps/step-07-platform-specific.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 6: Authentication & Session Management

## STEP GOAL:

To assess authentication mechanisms, session management, and authorization controls.

## AUTHENTICATION SEQUENCE:

### 1. Authentication Methods

"Let's analyze authentication:

**Auth Methods Used:**

| Method | Implemented | Secure |
|--------|-------------|--------|
| Username/Password | ? | ? |
| OAuth 2.0 | ? | ? |
| Biometric | ? | ? |
| MFA/2FA | ? | ? |
| Social login | ? | ? |
| Magic link | ? | ? |
| SSO | ? | ? |

What authentication methods are used?"

### 2. Credential Handling

"Let's check credential security:

**Credential Security:**

| Check | Status | Risk |
|-------|--------|------|
| Password storage | ? | ? |
| Credential transmission | ? | ? |
| Failed login handling | ? | ? |
| Account lockout | ? | ? |
| Password requirements | ? | ? |

**Local Storage:**
- Credentials cached locally?
- Keychain/Keystore used?
- Biometric-protected?

How are credentials handled?"

### 3. Biometric Authentication

"Let's assess biometric security:

**Biometric Implementation:**

| Check | iOS | Android |
|-------|-----|---------|
| LAContext/BiometricPrompt | ? | ? |
| Fallback to PIN | ? | ? |
| Crypto-backed | ? | ? |
| Device passcode required | ? | ? |

**Bypass Checks:**
- Can biometric be bypassed with Frida?
- Is biometric tied to crypto operation?

How is biometric authentication implemented?"

### 4. Session Management

"Let's analyze sessions:

**Session Security:**

| Check | Status | Risk |
|-------|--------|------|
| Token storage | ? | ? |
| Token transmission | ? | ? |
| Token expiration | ? | ? |
| Refresh mechanism | ? | ? |
| Session invalidation | ? | ? |
| Multi-device handling | ? | ? |

**Token Analysis:**
- Token type (JWT, opaque)?
- Token lifetime?
- Refresh token rotation?

How are sessions managed?"

### 5. Authorization

"Let's check authorization:

**Authorization Checks:**

| Check | Status | Finding |
|-------|--------|---------|
| Role-based access | ? | ? |
| IDOR vulnerabilities | ? | ? |
| Privilege escalation | ? | ? |
| Data access control | ? | ? |
| Feature access | ? | ? |

**Testing:**
- Access resources as different users
- Modify object references
- Test horizontal access

What authorization issues exist?"

### 6. Account Security

"Let's review account protection:

**Account Security:**

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Password reset | ? | ? |
| Account recovery | ? | ? |
| Email verification | ? | ? |
| Phone verification | ? | ? |
| Activity logging | ? | ? |
| Device management | ? | ? |

Are there account security issues?"

### 7. Document Authentication

Update Section 6 of {outputFile}:

```markdown
## 6. Authentication & Session Management

### 6.1 Authentication Methods

| Method | Status | Finding |
|--------|--------|---------|
| [User data] | | |

### 6.2 Credential Security

| Check | Finding | Severity |
|-------|---------|----------|
| [User data] | | |

### 6.3 Biometric Authentication

**Implemented:** [Yes/No]
**Platform:** [iOS/Android/Both]

| Security Check | Status | Finding |
|----------------|--------|---------|
| [User data] | | |

### 6.4 Session Management

| Aspect | Implementation | Finding |
|--------|----------------|---------|
| [User data] | | |

**Token Analysis:**
[Token security details]

### 6.5 Authorization

| Test | Finding | Severity |
|------|---------|----------|
| [User data] | | |

### 6.6 Account Security Features

| Feature | Status | Finding |
|---------|--------|---------|
| [User data] | | |

### 6.7 Authentication Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Authentication Analysis Complete**

I've analyzed:
- Authentication methods
- Credential handling
- Biometric implementation
- Session management
- Authorization controls
- Account security

Next, we'll assess platform-specific issues.

Ready to proceed to platform-specific analysis?"

## MENU

Display: **Authentication Complete - Select an Option:** [C] Continue to Platform-Specific [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN authentication is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then immediately load, read entire file, then execute `{nextStepFile}`.
