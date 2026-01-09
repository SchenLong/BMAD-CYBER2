---

name: 'step-05-network-security'
description: 'Network communication security assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-05-network-security.md'
nextStepFile: '{workflow_path}/steps/step-06-authentication.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 5: Network Security

## STEP GOAL:

To assess network communication security including TLS configuration, API security, and data transmission protection.

## NETWORK SECURITY SEQUENCE:

### 1. TLS Configuration

"Let's assess TLS security:

**TLS Analysis:**

| Check | Status | Risk |
|-------|--------|------|
| TLS 1.2+ enforced | ? | Downgrade attacks |
| Weak ciphers | ? | MITM |
| Certificate validation | ? | Impersonation |
| Hostname verification | ? | MITM |

**iOS ATS (App Transport Security):**
- ATS enabled?
- Exceptions defined?

**Android Network Security Config:**
- Custom config present?
- Clear-text allowed?

What's the TLS configuration?"

### 2. Certificate Pinning Analysis

"Let's analyze pinning implementation:

**Pinning Assessment:**

| Aspect | Finding | Severity |
|--------|---------|----------|
| Pinning present | ? | ? |
| Pin type | [Cert/Public Key/Hash] | ? |
| Backup pins | ? | ? |
| Expiration handling | ? | ? |

**Implementation Quality:**
- Single or multiple pins?
- Fallback mechanism?
- Pin update process?

How robust is the certificate pinning?"

### 3. API Endpoint Security

"Let's analyze API security:

**Endpoints Identified:**

| Endpoint | Method | Auth | Sensitive |
|----------|--------|------|-----------|
| [URL] | [Method] | [Type] | [Yes/No] |

**API Security Checks:**

| Check | Status | Finding |
|-------|--------|---------|
| Authentication | ? | ? |
| Authorization | ? | ? |
| Rate limiting | ? | ? |
| Input validation | ? | ? |
| Error handling | ? | ? |

What API issues were found?"

### 4. Request/Response Analysis

"Let's analyze traffic content:

**Request Analysis:**

| Issue | Found | Details |
|-------|-------|---------|
| Sensitive in URL | ? | ? |
| PII in requests | ? | ? |
| Auth in headers | ? | ? |
| Proper encoding | ? | ? |

**Response Analysis:**

| Issue | Found | Details |
|-------|-------|---------|
| Sensitive data | ? | ? |
| Stack traces | ? | ? |
| Debug info | ? | ? |
| Version disclosure | ? | ? |

What traffic issues were identified?"

### 5. WebSocket/Real-time

"Let's check real-time communications:

**WebSocket Analysis:**

| Check | Status | Risk |
|-------|--------|------|
| WSS (secure) | ? | MITM |
| Authentication | ? | Unauthorized access |
| Input validation | ? | Injection |
| Rate limiting | ? | DoS |

**Push Notifications:**
- Token security?
- Payload encryption?

Are there real-time communication issues?"

### 6. Third-Party SDKs

"Let's review third-party network activity:

**SDK Traffic:**

| SDK | Endpoints | Data Sent | Consent |
|-----|-----------|-----------|---------|
| Analytics | ? | ? | ? |
| Crash reporting | ? | ? | ? |
| Advertising | ? | ? | ? |
| Social | ? | ? | ? |

Are SDKs properly configured?"

### 7. Document Network Security

Update Section 5 of {outputFile}:

```markdown
## 5. Network Security

### 5.1 TLS Configuration

| Check | Status | Finding |
|-------|--------|---------|
| [User data] | | |

**ATS/Network Security Config:**
[Configuration analysis]

### 5.2 Certificate Pinning

**Implementation:** [Yes/No/Partial]
**Type:** [Certificate/Public Key/Hash]
**Bypass Difficulty:** [Easy/Medium/Hard]

| Finding | Severity |
|---------|----------|
| [User data] | |

### 5.3 API Security

| Endpoint | Finding | Severity |
|----------|---------|----------|
| [User data] | | |

### 5.4 Traffic Analysis

**Request Issues:**
| Issue | Details | Severity |
|-------|---------|----------|
| [User data] | | |

**Response Issues:**
| Issue | Details | Severity |
|-------|---------|----------|
| [User data] | | |

### 5.5 Real-time Communications

| Type | Security | Finding |
|------|----------|---------|
| [User data] | | |

### 5.6 Third-Party SDK Traffic

| SDK | Data Exposure | Risk |
|-----|---------------|------|
| [User data] | | |

### 5.7 Network Security Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Network Security Analysis Complete**

I've analyzed:
- TLS configuration
- Certificate pinning implementation
- API endpoint security
- Request/response content
- Real-time communications
- Third-party SDK traffic

Next, we'll assess authentication and session management.

Ready to proceed to authentication analysis?"

## MENU

Display: **Network Security Complete - Select an Option:** [C] Continue to Authentication [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN network security is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then immediately load, read entire file, then execute `{nextStepFile}`.
