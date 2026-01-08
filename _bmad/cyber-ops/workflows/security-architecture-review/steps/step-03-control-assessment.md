---

name: 'step-03-control-assessment'
description: 'Evaluate existing security controls against identified threats to identify gaps and effectiveness'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-03-control-assessment.md'
nextStepFile: '{workflow_path}/steps/step-04-attack-surface.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

# Task References

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 3: Security Control Assessment

## STEP GOAL:

To inventory and evaluate existing security controls against identified STRIDE threats, assess control effectiveness, and identify critical gaps where threats are not adequately mitigated.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) specializing in security controls
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in security control frameworks (NIST, CIS, OWASP), control effectiveness evaluation, and gap analysis
- ✅ User brings knowledge of existing controls, implementation details, and operational constraints
- ✅ Together we assess what's working and what needs improvement
- ✅ Maintain collaborative, analytical, constructive tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on evaluating existing controls against threats
- 🚫 FORBIDDEN to jump ahead to recommendations or new control proposals
- 💬 Approach: Map controls to threats, assess effectiveness, identify gaps
- 📋 Reference industry standards (NIST CSF, CIS Controls, OWASP ASVS) where applicable

## EXECUTION PROTOCOLS:

- 🎯 Map existing controls to STRIDE threats from Step 2
- 💾 Document control assessment in Section 4 of output file
- 📖 Update frontmatter `stepsCompleted` to include 3 before loading next step
- 🚫 FORBIDDEN to recommend new controls in this step (that's Step 6)

## CONTEXT BOUNDARIES:

- Available context: Architecture Overview (Section 2), complete STRIDE threat model (Section 3)
- Focus: Evaluate what controls EXIST now, not what should exist
- Limits: Don't assume controls exist without user confirmation
- Dependencies: Requires completed threat model from Step 2

## CONTROL ASSESSMENT SEQUENCE:

### 1. Initialize Control Assessment

"**Security Control Assessment**

Now that we've identified threats via STRIDE analysis, let's evaluate your existing security controls. We'll:

1. Inventory current security controls
2. Map controls to threats
3. Assess control effectiveness
4. Identify gaps where threats lack adequate mitigation

This assessment will reference industry frameworks like NIST CSF, CIS Controls, and OWASP ASVS to evaluate control maturity."

### 2. Load Threat Context

Read {outputFile} Section 3 (Threat Model) to understand all identified threats.

"Based on our threat model, we identified [X] threats across 6 STRIDE categories:
- Spoofing: [count]
- Tampering: [count]
- Repudiation: [count]
- Information Disclosure: [count]
- Denial of Service: [count]
- Elevation of Privilege: [count]

Let's assess what controls you have in place to address these threats."

### 3. Control Inventory by Category

Guide user through control discovery organized by security domain:

#### A. Authentication & Identity Controls

"**Authentication & Identity Controls**

These controls address Spoofing (S) and Elevation of Privilege (E) threats.

**What authentication controls do you have in place?**

Common controls:
- Multi-factor authentication (MFA) - where implemented?
- Password policies (complexity, rotation, history)
- SSO/Identity federation
- Certificate-based authentication
- API key management
- Session management (timeout, secure cookies)
- Account lockout policies

For each control, describe:
- Where it's implemented (which components)
- Coverage (all users, admin only, specific services)
- Maturity level (basic, intermediate, advanced)"

[Collect user responses]

#### B. Authorization & Access Controls

"**Authorization & Access Controls**

These controls address Elevation of Privilege (E) threats.

**What authorization controls exist?**

Common controls:
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Principle of least privilege enforcement
- Separation of duties
- Resource-level authorization checks
- Cloud IAM policies/roles
- Service-to-service authorization

For each control, describe:
- Implementation approach
- Granularity (coarse vs fine-grained)
- Enforcement points (UI only, API, database)"

[Collect user responses]

#### C. Data Protection Controls

"**Data Protection Controls**

These controls address Tampering (T) and Information Disclosure (I) threats.

**What data protection controls are implemented?**

Common controls:
- Encryption in transit (TLS version, certificate management)
- Encryption at rest (database, file storage, backups)
- Data classification and handling
- Data masking/redaction
- Secrets management (vault, KMS)
- Key rotation policies
- Data loss prevention (DLP)

For each control:
- What data is protected?
- Encryption algorithms and key lengths
- Key management approach"

[Collect user responses]

#### D. Input Validation & Output Encoding

"**Input Validation & Output Encoding Controls**

These controls address Tampering (T) and Information Disclosure (I) threats.

**What input validation and output encoding controls exist?**

Common controls:
- Input validation (allowlists, type checking, length limits)
- SQL injection prevention (parameterized queries, ORMs)
- XSS prevention (output encoding, CSP headers)
- Command injection prevention
- Path traversal prevention
- File upload validation
- API request validation (schema validation)

For each control:
- Where implemented (centralized vs per-endpoint)
- Coverage (all inputs, critical only)"

[Collect user responses]

#### E. Logging & Monitoring Controls

"**Logging & Monitoring Controls**

These controls address Repudiation (R) threats and enable detection of other attacks.

**What logging and monitoring controls are in place?**

Common controls:
- Authentication event logging (success, failures)
- Authorization decision logging
- Data access logging
- Administrative action logging
- Security event monitoring (SIEM)
- Anomaly detection
- Log integrity protection
- Log retention policies
- Centralized logging

For each control:
- What events are logged?
- Log retention duration
- Monitoring/alerting capabilities"

[Collect user responses]

#### F. Network Security Controls

"**Network Security Controls**

These controls address multiple threat categories across network layers.

**What network security controls exist?**

Common controls:
- Firewalls (network, web application)
- Network segmentation/VLANs
- DMZ architecture
- VPN for remote access
- DDoS protection
- Intrusion detection/prevention (IDS/IPS)
- TLS inspection
- DNS security (DNSSEC)

For each control:
- Placement in architecture
- Rules/policies enforced"

[Collect user responses]

#### G. Application Security Controls

"**Application Security Controls**

These controls address Tampering (T), Information Disclosure (I), and Denial of Service (D) threats.

**What application-level security controls exist?**

Common controls:
- Rate limiting/throttling
- CAPTCHA for automated abuse prevention
- Content Security Policy (CSP) headers
- Security headers (HSTS, X-Frame-Options, etc.)
- CORS configuration
- Anti-CSRF tokens
- Dependency vulnerability scanning
- Code signing

For each control:
- Implementation details
- Coverage and exceptions"

[Collect user responses]

#### H. Infrastructure & Configuration Controls

"**Infrastructure & Configuration Controls**

These controls provide defense-in-depth across all threat categories.

**What infrastructure security controls are implemented?**

Common controls:
- Patch management (OS, applications, dependencies)
- Hardened base images/configurations
- Secure defaults
- Configuration management (IaC, version control)
- Container security (image scanning, runtime protection)
- Secrets stored in environment variables (not code)
- Least privilege for service accounts
- Backup and recovery procedures

For each control:
- Automation level
- Update frequency
- Coverage"

[Collect user responses]

### 4. Control-to-Threat Mapping

"**Mapping Controls to Threats**

Now let's map your existing controls to the threats we identified in Step 2. This will show us:
- Which threats are well-protected
- Which threats have weak or missing controls
- Where multiple controls provide defense-in-depth

I'll create a mapping matrix..."

For each threat from Section 3, work with user to identify which controls (if any) mitigate it:

Example format:
- **Threat: API authentication bypass (Spoofing)**
  - **Controls:** MFA on user logins, API key validation, OAuth 2.0 implementation
  - **Assessment:** Partial coverage (API keys not rotated, MFA not enforced for all users)
  - **Gap:** No MFA enforcement policy, API key rotation missing

### 5. Control Effectiveness Assessment

"**Control Effectiveness Evaluation**

For each control, let's assess its effectiveness using these criteria:

**Effectiveness Levels:**
- **Effective**: Control fully mitigates the threat
- **Partially Effective**: Control reduces risk but doesn't eliminate threat
- **Ineffective**: Control exists but doesn't significantly reduce risk
- **Not Implemented**: No control in place

**Assessment Factors:**
- Coverage: Is the control applied consistently?
- Implementation: Is it correctly configured?
- Testing: Is effectiveness validated?
- Maintenance: Is it actively managed?"

Work through controls to assign effectiveness ratings.

### 6. Gap Analysis

"**Security Control Gaps**

Based on our assessment, let's identify critical gaps:

**Gap Categories:**
1. **Missing Controls**: Threats with no mitigating controls
2. **Weak Controls**: Controls that are ineffective or poorly implemented
3. **Coverage Gaps**: Controls that exist but aren't applied everywhere needed
4. **Configuration Gaps**: Controls misconfigured or using weak settings

Identify top 10 most critical gaps based on threat severity and control absence."

### 7. Document Control Assessment

Update {outputFile} Section 4 (Security Control Assessment):

```markdown
## 4. Security Control Assessment

### Control Inventory

#### Authentication & Identity Controls

[Document all authentication controls with implementation details]

#### Authorization & Access Controls

[Document all authorization controls]

#### Data Protection Controls

[Document encryption, secrets management, data protection]

#### Input Validation & Output Encoding

[Document validation and encoding controls]

#### Logging & Monitoring Controls

[Document logging, SIEM, monitoring]

#### Network Security Controls

[Document network segmentation, firewalls, IDS/IPS]

#### Application Security Controls

[Document rate limiting, security headers, CSRF protection]

#### Infrastructure & Configuration Controls

[Document patch management, hardening, backup]

---

### Control-to-Threat Mapping

| Threat ID | Threat Description | STRIDE Category | Existing Controls | Effectiveness | Gap |
|-----------|-------------------|-----------------|-------------------|---------------|-----|
| T-01 | [Threat description] | S | [Controls] | Partial | [Gap description] |
| T-02 | [Threat description] | T | [Controls] | Effective | None |
| ... | ... | ... | ... | ... | ... |

---

### Control Effectiveness Summary

**Effective Controls:** [count] - Fully mitigating threats
**Partially Effective Controls:** [count] - Reducing but not eliminating risk
**Ineffective Controls:** [count] - Implemented but not working
**Missing Controls:** [count] - No mitigation for identified threats

---

### Critical Control Gaps

**Top 10 Gaps (Prioritized by Risk):**

1. **Gap:** [Description]
   - **Threat(s) Affected:** [Threat IDs]
   - **Risk Level:** Critical/High/Medium
   - **Current State:** [What exists now]
   - **Impact:** [What happens due to this gap]

[Repeat for all critical gaps]

---

### Framework Alignment Assessment

**NIST Cybersecurity Framework (CSF):**
- Identify: [Maturity level]
- Protect: [Maturity level]
- Detect: [Maturity level]
- Respond: [Maturity level]
- Recover: [Maturity level]

**CIS Controls Coverage:**
- Critical Controls (1-6): [X/6 implemented]
- Foundational Controls (7-16): [X/10 implemented]
- Organizational Controls (17-20): [X/4 implemented]

**OWASP ASVS (if web application):**
- Level 1 (Opportunistic): [%]
- Level 2 (Standard): [%]
- Level 3 (Advanced): [%]

---
```

Update frontmatter in {outputFile}:
- Add 3 to `stepsCompleted` array: `stepsCompleted: [1, 2, 3]`
- Set `lastStep: 'control-assessment'`
- Add `controlsInventoried: [count]`
- Add `criticalGaps: [count]`

### 8. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Attack Surface Analysis

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with prompt: "Review our control assessment for completeness. Are there controls we missed? Are effectiveness ratings accurate? Are there hidden gaps we haven't identified?"
- IF P: Execute {partyModeWorkflow} with prompt: "Invite Sentinel (compliance expert) to review our control assessment for compliance framework alignment, or Ghost (penetration tester) for bypass techniques perspective."
- IF C: Verify control assessment complete, save to {outputFile}, update frontmatter `stepsCompleted: [1, 2, 3]`, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected AND control inventory is documented AND control-to-threat mapping is complete AND gaps are identified in Section 4 of {outputFile}, will you then:

1. Update frontmatter in {outputFile}: `stepsCompleted: [1, 2, 3]`, `lastStep: 'control-assessment'`
2. Load, read entire file, then execute {nextStepFile} to begin optional attack surface analysis

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Complete control inventory across all 8 categories
- Controls mapped to STRIDE threats from Step 2
- Effectiveness assessment completed for all controls
- Critical gaps identified and prioritized
- Framework alignment assessed (NIST CSF, CIS Controls, OWASP ASVS)
- Control assessment documented in Section 4
- User validated assessment completeness
- Frontmatter updated with step 3 completion

### ❌ SYSTEM FAILURE:

- Skipping control categories
- Not mapping controls to specific threats
- Generic control descriptions without implementation details
- Missing effectiveness assessment
- No gap analysis
- Proceeding without user validation
- Not documenting assessment in structured format
- Not updating frontmatter before loading next step

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
