---
name: 'step-04-stride-analysis'
description: 'Systematically identify threats for current component using STRIDE methodology'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-04-stride-analysis.md'
nextStepFile: '{workflow_path}/steps/step-05-risk-assessment.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Task References
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: STRIDE Threat Analysis

## STEP GOAL:

To systematically identify security threats for the current component using the STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Threat Modeling Expert
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring STRIDE methodology and security expertise, user brings system knowledge
- ✅ Maintain professional, systematic, security-focused tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on threat identification using STRIDE
- 🚫 FORBIDDEN to assess risk levels in this step (that's step 5)
- 💬 Guide systematic threat discovery for each STRIDE category
- 🚫 DO NOT proceed without covering all six STRIDE categories

## EXECUTION PROTOCOLS:

- 🎯 Walk through each STRIDE category systematically
- 💾 Document all identified threats with descriptions
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3, 4]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- currentComponent set in frontmatter from step 3
- Focus ONLY on the current component
- This is threat identification, not risk assessment
- All six STRIDE categories must be covered

## STRIDE ANALYSIS PROCESS:

### 1. Initialize STRIDE Analysis

Load {outputFile} frontmatter to get `currentComponent`.

Display:

"**STRIDE Threat Analysis**

**Component:** {currentComponent}

We'll systematically identify security threats using the STRIDE methodology. For each category, we'll explore:

- **S**poofing - Can an attacker impersonate a user, system, or data?
- **T**ampering - Can an attacker modify data or code?
- **R**epudiation - Can actions be denied or not traced?
- **I**nformation Disclosure - Can sensitive data be exposed?
- **D**enial of Service - Can the component be made unavailable?
- **E**levation of Privilege - Can an attacker gain unauthorized access?

Let's begin with Spoofing threats."

### 2. Spoofing Threats

"**S - Spoofing Identity**

Spoofing involves an attacker impersonating a legitimate user, system, or data source.

**Consider for {currentComponent}:**

**Authentication:**
- How does this component authenticate users/systems?
- Could authentication credentials be stolen, guessed, or bypassed?
- Are there weak or default credentials?
- Is multi-factor authentication used?

**Session Management:**
- How are sessions managed?
- Could session tokens be stolen or hijacked?
- Are sessions properly invalidated?

**Data Source Verification:**
- Does this component verify the source of incoming data/requests?
- Could an attacker spoof requests from trusted sources?

**Examples of Spoofing Threats:**
- Weak password policy allows credential guessing
- Session tokens transmitted over unencrypted channels
- Lack of API key validation allows unauthorized access
- Missing sender verification in webhook handling

**Identify Spoofing threats for {currentComponent}:**"

Collect each spoofing threat with:
- Threat ID (e.g., S-01, S-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable spoofing threats.

### 3. Tampering Threats

"**T - Tampering with Data**

Tampering involves unauthorized modification of data or code.

**Consider for {currentComponent}:**

**Data Integrity:**
- What data does this component process or store?
- Could data be modified in transit?
- Could data be modified at rest?
- Are integrity checks in place (checksums, signatures)?

**Code Integrity:**
- Could application code be modified?
- Are software updates verified?
- Could configuration files be tampered with?

**Input Validation:**
- Are inputs properly validated and sanitized?
- Could malicious input (SQL injection, XSS) modify data?

**Examples of Tampering Threats:**
- SQL injection allows database modification
- Man-in-the-middle attack modifies API requests
- Missing input validation allows malicious data entry
- Configuration files world-writable on filesystem

**Identify Tampering threats for {currentComponent}:**"

Collect each tampering threat with:
- Threat ID (e.g., T-01, T-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable tampering threats.

### 4. Repudiation Threats

"**R - Repudiation**

Repudiation involves denying performing an action without the ability to prove otherwise.

**Consider for {currentComponent}:**

**Logging and Auditing:**
- Are security-relevant actions logged?
- Are logs tamper-proof?
- Do logs contain sufficient detail (who, what, when)?
- Are logs monitored and retained?

**Non-Repudiation:**
- Can users/systems deny performing actions?
- Are critical transactions digitally signed?
- Is there an audit trail for sensitive operations?

**Examples of Repudiation Threats:**
- Insufficient logging allows attackers to hide their tracks
- Logs can be deleted or modified by attackers
- No audit trail for financial transactions
- Shared credentials prevent attribution of actions

**Identify Repudiation threats for {currentComponent}:**"

Collect each repudiation threat with:
- Threat ID (e.g., R-01, R-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable repudiation threats.

### 5. Information Disclosure Threats

"**I - Information Disclosure**

Information disclosure involves exposing information to unauthorized parties.

**Consider for {currentComponent}:**

**Data Confidentiality:**
- What sensitive data does this component handle?
- Is data encrypted in transit (TLS)?
- Is data encrypted at rest?
- Are encryption keys properly managed?

**Access Controls:**
- Who should have access to what data?
- Are access controls properly enforced?
- Could horizontal/vertical privilege escalation expose data?

**Information Leakage:**
- Could error messages reveal sensitive information?
- Are verbose logs exposing secrets?
- Could timing attacks reveal information?
- Are backups properly secured?

**Examples of Information Disclosure Threats:**
- Unencrypted database exposes PII
- API returns excessive data in responses
- Error messages expose system internals
- Credentials stored in plaintext configuration files
- Directory listing exposes sensitive files

**Identify Information Disclosure threats for {currentComponent}:**"

Collect each information disclosure threat with:
- Threat ID (e.g., I-01, I-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable information disclosure threats.

### 6. Denial of Service Threats

"**D - Denial of Service**

Denial of service involves making the system unavailable to legitimate users.

**Consider for {currentComponent}:**

**Availability:**
- Could an attacker exhaust resources (CPU, memory, disk, network)?
- Are there rate limits on API endpoints?
- Could algorithmic complexity be exploited?
- Is the component resilient to traffic spikes?

**Resource Management:**
- Could an attacker fill disk space?
- Could memory leaks be triggered?
- Are database connections properly pooled?

**Dependency Failures:**
- What happens if dependencies are unavailable?
- Are there timeouts and circuit breakers?
- Could cascading failures occur?

**Examples of Denial of Service Threats:**
- No rate limiting allows API flooding
- Regex complexity allows ReDoS attacks
- File upload allows disk exhaustion
- Missing connection pooling exhausts database
- Synchronous processing blocks all requests

**Identify Denial of Service threats for {currentComponent}:**"

Collect each denial of service threat with:
- Threat ID (e.g., D-01, D-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable DoS threats.

### 7. Elevation of Privilege Threats

"**E - Elevation of Privilege**

Elevation of privilege involves gaining capabilities beyond what is authorized.

**Consider for {currentComponent}:**

**Authorization:**
- How are permissions enforced?
- Could a regular user access admin functions?
- Could privilege escalation vulnerabilities exist?
- Is the principle of least privilege followed?

**Access Control Bypass:**
- Could authorization checks be bypassed?
- Are all endpoints/functions protected?
- Could path traversal access restricted resources?

**Confused Deputy:**
- Could the component be tricked into performing unauthorized actions?
- Are cross-site request forgery (CSRF) protections in place?

**Examples of Elevation of Privilege Threats:**
- Missing authorization checks on admin endpoints
- Path traversal allows accessing arbitrary files
- Insecure direct object references expose other users' data
- SQL injection allows database admin access
- Deserialization vulnerabilities execute arbitrary code

**Identify Elevation of Privilege threats for {currentComponent}:**"

Collect each elevation of privilege threat with:
- Threat ID (e.g., E-01, E-02)
- Threat description
- Attack scenario

Continue until user has identified all applicable elevation of privilege threats.

### 8. Compile Threat List

Create comprehensive list of all identified threats organized by STRIDE category:

**Component:** {currentComponent}

**Spoofing Threats:**
- S-01: {description}
- S-02: {description}
...

**Tampering Threats:**
- T-01: {description}
- T-02: {description}
...

**Repudiation Threats:**
- R-01: {description}
...

**Information Disclosure Threats:**
- I-01: {description}
...

**Denial of Service Threats:**
- D-01: {description}
...

**Elevation of Privilege Threats:**
- E-01: {description}
...

**Total Threats Identified:** {count}

### 9. Append Section 3 to Threat Model Document

Update {outputFile} by appending:

```markdown

---

## 3. STRIDE Threat Analysis

### 3.1 Component: {currentComponent}

#### Spoofing Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{spoofing-threat-table-rows}

#### Tampering Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{tampering-threat-table-rows}

#### Repudiation Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{repudiation-threat-table-rows}

#### Information Disclosure Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{information-disclosure-threat-table-rows}

#### Denial of Service Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{dos-threat-table-rows}

#### Elevation of Privilege Threats

| Threat ID | Description | Attack Scenario |
|-----------|-------------|-----------------|
{eop-threat-table-rows}

**Total Threats for {currentComponent}:** {total-count}

---
```

### 10. Update Frontmatter

Update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3, 4]
lastStep: 'stride-analysis'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [...existing...]
componentsAnalyzed: [...existing...]
currentComponent: '{current-component-name}'
workflowComplete: false
date: '{date}'
user_name: '{user_name}'
---
```

### 11. Present MENU OPTIONS

Display: **Select an Option:** [B] Brainstorming [P] Party Mode [W] Web-Browsing [C] Continue to Risk Assessment

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Use menu handling logic section below

#### Menu Handling Logic:

- IF B: Execute {brainstormingTask} with prompt: "Help me brainstorm additional security threats for {currentComponent} using the STRIDE methodology. Are there edge cases, attack vectors, or threat scenarios we haven't considered?"
- IF P: Execute {partyModeWorkflow} with focus: "Review the STRIDE threat analysis for {currentComponent} - are there threats we've missed? Attack scenarios that need refinement?"
- IF W: Web-Browsing - Guide user: "What would you like to research? Examples: CVE vulnerabilities for {technology}, common {component-type} attack patterns, {specific-threat} examples"
- IF C: Verify at least one threat identified, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#11-present-menu-options)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All six STRIDE categories covered systematically
- Threats identified with IDs, descriptions, and scenarios
- Section 3 appended to threat model document
- Frontmatter updated with step 4 complete
- Ready to proceed to risk assessment (step 5)

### ❌ SYSTEM FAILURE:

- Skipping any STRIDE category
- Not collecting threat descriptions and scenarios
- Generating threats without user input
- Proceeding without completing all categories
- Not updating document with threat findings

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected AND all STRIDE threats are documented in the threat model will you load, read entire file, then execute {nextStepFile} to begin risk assessment.
