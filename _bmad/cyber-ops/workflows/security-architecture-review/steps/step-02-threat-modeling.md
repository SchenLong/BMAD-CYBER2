---

name: 'step-02-threat-modeling'
description: 'Guide user through systematic STRIDE threat modeling to identify security vulnerabilities across all threat categories'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-02-threat-modeling.md'
nextStepFile: '{workflow_path}/steps/step-03-control-assessment.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

# Task References

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'

---

# Step 2: STRIDE Threat Modeling

## STEP GOAL:

To systematically identify security threats across all six STRIDE categories (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) for each major component in the architecture, documenting realistic attack scenarios and threat-component mappings.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) specializing in threat modeling
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in STRIDE methodology, attack scenarios, and threat analysis
- ✅ User brings architecture knowledge, component interaction understanding, and business context
- ✅ Together we identify threats neither would find alone
- ✅ Maintain collaborative, inquisitive, security-focused tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on threat identification across all 6 STRIDE categories
- 🚫 FORBIDDEN to jump ahead to controls or recommendations
- 💬 Approach: Ask probing questions, provide examples, validate threat scenarios
- 📋 Ensure minimum 3 threats per major architecture component
- 🔍 All 6 STRIDE categories MUST be analyzed - no skipping

## EXECUTION PROTOCOLS:

- 🎯 Guide user through each STRIDE category systematically
- 💾 Document threats in Section 3 of output file with clear categorization
- 📖 Update frontmatter `stepsCompleted` to include 2 before loading next step
- 🚫 FORBIDDEN to proceed to control assessment until all STRIDE categories covered

## CONTEXT BOUNDARIES:

- Available context: Architecture Overview from Section 2 (components, boundaries, data flows, tech stack)
- Focus: Threat identification only - not mitigation or control assessment
- Limits: Don't assume threats without user validation; avoid generic threats
- Dependencies: Requires completed architecture context from Step 1

## STRIDE THREAT MODELING SEQUENCE:

### 1. Initialize Threat Modeling Session

"**STRIDE Threat Modeling Session**

We'll now systematically identify security threats using the STRIDE framework. STRIDE covers six threat categories:

- **S**poofing - Pretending to be something or someone else
- **T**ampering - Modifying data or code
- **R**epudiation - Claiming you didn't do something
- **I**nformation Disclosure - Exposing information to unauthorized parties
- **D**enial of Service - Denying or degrading service to users
- **E**levation of Privilege - Gaining capabilities without authorization

For each category, I'll ask targeted questions about your architecture components. Let's be thorough and creative in identifying potential threats."

### 2. Review Architecture Components

Load {outputFile} Section 2 (Architecture Overview) and identify major components:

"Based on your architecture, I see these major components:

[List components from Section 2]

We'll analyze threats for each component across all STRIDE categories. This ensures comprehensive coverage."

### 3. STRIDE Category Analysis

For each of the 6 categories below, guide user through threat identification:

#### Category 1: Spoofing Identity

"**Spoofing (S) - Identity Falsification Threats**

Spoofing involves an attacker pretending to be a legitimate user, system, or service.

**Key Questions:**

For each component in your architecture:

1. **Authentication bypass**: Could an attacker impersonate a user without valid credentials?
2. **Token theft**: Could session tokens or API keys be stolen and reused?
3. **Service impersonation**: Could a malicious service pretend to be a legitimate internal service?
4. **Email/sender spoofing**: Could attackers send emails or messages appearing to come from your system?
5. **IP/DNS spoofing**: Could network-level spoofing affect component communication?

**Common Spoofing Scenarios:**

- Weak or missing authentication on APIs
- Session token transmitted in URL parameters
- Missing mutual TLS for service-to-service communication
- No sender verification for webhooks or callbacks
- Missing origin validation in cross-origin requests

**Identify Spoofing Threats:**

For each major component, what spoofing threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

#### Category 2: Tampering

"**Tampering (T) - Data or Code Modification Threats**

Tampering involves unauthorized modification of data in transit, at rest, or of code itself.

**Key Questions:**

1. **Data in transit**: Could data be modified while traveling between components?
2. **Data at rest**: Could attackers modify stored data (databases, files, logs)?
3. **Message tampering**: Could API requests/responses be altered?
4. **Code injection**: Could attackers inject malicious code (SQL, script, command injection)?
5. **Configuration tampering**: Could attackers modify system configuration files?
6. **Binary tampering**: Could application binaries or dependencies be replaced?

**Common Tampering Scenarios:**

- Missing TLS or using weak TLS for data in transit
- No integrity checks on database records
- SQL injection vulnerabilities in data layer
- Missing input validation allowing XSS or command injection
- Unprotected configuration files with weak file permissions
- No code signing or integrity verification for deployed code

**Identify Tampering Threats:**

For each major component, what tampering threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

#### Category 3: Repudiation

"**Repudiation (R) - Action Deniability Threats**

Repudiation involves an attacker denying they performed an action, or lack of evidence to prove what happened.

**Key Questions:**

1. **Audit logging**: Are all security-relevant actions logged with sufficient detail?
2. **Log integrity**: Could audit logs be modified or deleted?
3. **Non-repudiation**: Can you prove who performed critical actions (transactions, data access)?
4. **Log coverage**: Are authentication, authorization, data modifications, and administrative actions logged?
5. **Time synchronization**: Are timestamps reliable across all systems?

**Common Repudiation Scenarios:**

- Missing or incomplete audit logs
- Logs stored on same system as application (attacker can delete)
- No logging of authentication failures or authorization decisions
- Logs don't capture sufficient context (user ID, IP, timestamp, action details)
- Missing transaction signing for critical operations
- No immutable audit trail for compliance-critical actions

**Identify Repudiation Threats:**

For each major component, what repudiation threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

#### Category 4: Information Disclosure

"**Information Disclosure (I) - Unauthorized Data Exposure Threats**

Information disclosure involves exposing information to parties who shouldn't have access.

**Key Questions:**

1. **Data exposure**: What sensitive data could be exposed (PII, credentials, financial, health data)?
2. **Encryption**: Is sensitive data encrypted in transit and at rest?
3. **Access controls**: Could users access data they shouldn't see?
4. **Error messages**: Do error messages leak system internals or sensitive data?
5. **Logging**: Are credentials or sensitive data logged in plaintext?
6. **Side channels**: Could timing, cache, or other side channels leak information?

**Common Information Disclosure Scenarios:**

- Sensitive data transmitted without TLS
- Database credentials in source code or configuration files
- Missing encryption at rest for PII/sensitive data
- API endpoints returning more data than UI displays (mass assignment vulnerabilities)
- Detailed error messages revealing database schema, stack traces, or system paths
- Insufficient authorization checks allowing horizontal privilege escalation
- Credentials or tokens logged in plaintext in application logs

**Identify Information Disclosure Threats:**

For each major component and data flow, what information disclosure threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

#### Category 5: Denial of Service (DoS)

"**Denial of Service (D) - Availability Threats**

Denial of Service involves making the system unavailable or degrading its performance.

**Key Questions:**

1. **Resource exhaustion**: Could attackers exhaust CPU, memory, disk, or network resources?
2. **Algorithmic complexity**: Are there algorithms with poor worst-case performance?
3. **Rate limiting**: Are there limits on API requests, logins, or expensive operations?
4. **Dependency failures**: Could failure of external dependencies cascade?
5. **Data volume**: Could attackers fill up storage (logs, uploads, database)?
6. **Distributed DoS**: Are there protections against DDoS attacks?

**Common DoS Scenarios:**

- Missing rate limiting on authentication or API endpoints
- No limits on file upload size or count
- Expensive database queries without pagination or limits
- Regular expression denial of service (ReDoS) vulnerabilities
- Missing circuit breakers for external service calls
- Unbounded resource allocation per user/session
- No protection against large payload attacks (XML bomb, billion laughs)

**Identify Denial of Service Threats:**

For each major component, what DoS threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

#### Category 6: Elevation of Privilege

"**Elevation of Privilege (E) - Unauthorized Access Threats**

Elevation of privilege involves gaining capabilities or access that should be restricted.

**Key Questions:**

1. **Horizontal privilege escalation**: Could users access other users' data or actions?
2. **Vertical privilege escalation**: Could users gain admin/privileged access?
3. **Authorization checks**: Are authorization checks enforced on all protected operations?
4. **Default credentials**: Are there any default accounts or credentials?
5. **Privilege boundaries**: Are different trust levels properly enforced?
6. **Confused deputy**: Could legitimate services be tricked into performing unauthorized actions?

**Common Elevation of Privilege Scenarios:**

- Missing authorization checks (authentication only, no authorization)
- Client-side enforcement only (role checks in UI but not backend)
- IDOR (Insecure Direct Object Reference) allowing access to other users' resources
- Path traversal vulnerabilities
- SQL injection leading to admin access
- Misconfigured IAM roles or policies in cloud environments
- Container escape or VM escape vulnerabilities
- Privilege escalation via dependency confusion or supply chain attacks

**Identify Elevation of Privilege Threats:**

For each major component and trust boundary, what privilege escalation threats exist?"

[Collect user responses, provide probing questions, validate threat scenarios]

### 4. Cross-Component Threat Analysis

"**Cross-Component and Data Flow Threats**

Now let's consider threats that span multiple components or focus on data flows:

1. **Trust boundary transitions**: Where does data cross from untrusted to trusted zones?
2. **External integrations**: What threats exist in third-party API integrations?
3. **Data aggregation**: Could combining data from multiple components reveal sensitive information?
4. **Transitive trust**: If Component A trusts Component B, what happens if B is compromised?

Identify any additional threats we haven't captured yet."

### 5. Document Threats in Output File

After collecting all STRIDE threats, update {outputFile} Section 3 (Threat Model):

```markdown
## 3. Threat Model

### STRIDE Threat Analysis

Methodology: Microsoft STRIDE framework applied to all architecture components and data flows.

---

#### Spoofing (S)

**[Component Name]:**
- **Threat:** [Specific spoofing threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all spoofing threats across all components]

---

#### Tampering (T)

**[Component Name]:**
- **Threat:** [Specific tampering threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all tampering threats across all components]

---

#### Repudiation (R)

**[Component Name]:**
- **Threat:** [Specific repudiation threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all repudiation threats across all components]

---

#### Information Disclosure (I)

**[Component Name]:**
- **Threat:** [Specific information disclosure threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all information disclosure threats across all components]

---

#### Denial of Service (D)

**[Component Name]:**
- **Threat:** [Specific DoS threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all DoS threats across all components]

---

#### Elevation of Privilege (E)

**[Component Name]:**
- **Threat:** [Specific privilege escalation threat description]
  - Attack Scenario: [How attacker would exploit]
  - Impact: [What happens if successful]
  - Likelihood: [High/Medium/Low]

[Repeat for all privilege escalation threats across all components]

---

### Threat Summary

**Total Threats Identified:** [Count]

**By Category:**
- Spoofing (S): [Count]
- Tampering (T): [Count]
- Repudiation (R): [Count]
- Information Disclosure (I): [Count]
- Denial of Service (D): [Count]
- Elevation of Privilege (E): [Count]

**By Component:**
[List component threat counts]

---
```

Update frontmatter in {outputFile}:
- Add 2 to `stepsCompleted` array: `stepsCompleted: [1, 2]`
- Set `lastStep: 'threat-modeling'`
- Add `threatCount: [total threat count]`

### 6. Validation Check

Before presenting menu, validate:

"**Threat Model Validation:**

✅ All 6 STRIDE categories analyzed
✅ Minimum [X] threats identified ([3 per major component target])
✅ Threats documented with attack scenarios and impact
✅ All major architecture components covered

Does this threat model accurately reflect the security risks in your architecture? Any additional threats to add?"

### 7. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [B] Brainstorming [P] Party Mode [C] Continue to Control Assessment

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with prompt: "Review the STRIDE threat model and identify any missed threats, attack scenarios we haven't considered, or gaps in our analysis. Challenge assumptions and explore edge cases."
- IF B: Execute {brainstormingTask} with prompt: "Generate creative attack scenarios we might not have considered. Think like an attacker: what unconventional or sophisticated threats could target this architecture?"
- IF P: Execute {partyModeWorkflow} with prompt: "Invite Ghost (penetration tester) and Cipher (threat intelligence) to review our threat model for missing threats or alternative attack perspectives."
- IF C: Verify all 6 STRIDE categories covered, save complete threat model to {outputFile}, update frontmatter `stepsCompleted: [1, 2]`, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected AND all 6 STRIDE categories have been analyzed AND threats are documented in Section 3 of {outputFile}, will you then:

1. Update frontmatter in {outputFile}: `stepsCompleted: [1, 2]`, `lastStep: 'threat-modeling'`, `threatCount: [count]`
2. Load, read entire file, then execute {nextStepFile} to begin security control assessment

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All 6 STRIDE categories systematically analyzed
- Minimum 3 threats identified per major architecture component
- Each threat documented with: description, attack scenario, impact, likelihood
- Threats organized by STRIDE category in Section 3
- Threat summary statistics included
- User validated threat model completeness
- Frontmatter updated with step 2 completion
- Output file Section 3 populated with complete threat model

### ❌ SYSTEM FAILURE:

- Skipping any STRIDE category
- Generic or vague threat descriptions
- Missing attack scenarios or impact analysis
- Not documenting threats in structured format
- Proceeding without user validation
- Not updating frontmatter before loading next step
- Generating threats without user input and validation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
