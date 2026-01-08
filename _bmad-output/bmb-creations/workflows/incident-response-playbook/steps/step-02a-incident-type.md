---
name: 'step-02a-incident-type'
description: 'Select incident type and gather organizational context for playbook creation'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-02a-incident-type.md'
nextStepFile: '{workflow_path}/steps/step-03a-detection-analysis.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Data References
incidentTypesData: '{workflow_path}/data/incident-types.csv'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2A: Incident Type Selection & Organizational Context

## STEP GOAL:

To determine which incident type(s) this playbook will cover and gather essential organizational context that will inform all procedures documented in subsequent steps.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an IR Planning Consultant
- ✅ If you already have been given a name, communication_style, and persona, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring NIST framework expertise and best practices
- ✅ User brings organizational knowledge and requirements
- ✅ Maintain collaborative, consultative tone

### Step-Specific Rules:

- 🎯 Focus ONLY on incident type selection and org context gathering
- 🚫 FORBIDDEN to start defining procedures (that's step 3a onward)
- 💬 Guide through conversational exploration, not interrogation
- 📋 Document all context - it informs every subsequent step

## EXECUTION PROTOCOLS:

- 🎯 Load incident types data and present options clearly
- 💾 Append to Section 1 (Incident Overview) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Playbook file was created in step 1
- Focus on WHAT incident type and WHO the organization is
- Don't define HOW to respond yet (that's steps 3a-7a)
- Context gathered here shapes all subsequent procedures

## INCIDENT TYPE SELECTION SEQUENCE:

### 1. Load and Present Incident Types

Load {incidentTypesData} and display:

"**Incident Type Selection**

Let's define which incident type this playbook will cover. I have reference data on common incident types:

**Common Incident Types:**

1. **Ransomware** - Malware that encrypts data and demands payment
2. **Data Breach / Exfiltration** - Unauthorized access to sensitive data
3. **DDoS Attack** - Distributed denial of service
4. **Insider Threat** - Malicious or negligent actions by trusted insider
5. **Malware Infection** - Virus, trojan, worm, spyware
6. **Phishing / Social Engineering** - Credential theft via deception
7. **Account Compromise** - Unauthorized access to user/admin accounts
8. **Advanced Persistent Threat (APT)** - Long-term targeted attack
9. **Supply Chain Attack** - Compromise via trusted third-party
10. **Physical Security Breach** - Unauthorized physical access

Which incident type should this playbook address?

You can choose one primary type, or we can create a playbook that covers multiple related types."

### 2. Gather Incident Type Details

Once user selects type:

"Excellent. Let's define the scope for **{incident-type}** incidents.

**Incident Definition:**
How would you define a {incident-type} incident for your organization? (I can suggest a definition based on industry standards, or you can provide your own)"

Discuss and document:
- Incident type name
- Organizational definition
- Common characteristics specific to their environment
- What's in scope vs out of scope

### 3. Gather Organizational Context

"**Organizational Context**

To create actionable procedures, I need to understand your organization's environment:

**Organization Profile:**
- What's your organization size? (Employees, locations)
- What industry/sector?
- What's your security maturity level? (Developing/Defined/Managed/Optimized)

**Regulatory Requirements:**
- Which regulations apply? (GDPR, PCI-DSS, HIPAA, SOC2, ISO 27001, etc.)
- What are your notification requirements? (e.g., GDPR 72 hours)
- Any industry-specific compliance needs?"

### 4. Gather Tool and Technology Context

"**Security Tools and Technologies**

What security tools does your team use?

**SIEM (Security Information and Event Management):**
- Platform: (Splunk, Elastic, QRadar, Sentinel, etc.)
- Access level:
- Key data sources:

**EDR (Endpoint Detection and Response):**
- Platform: (CrowdStrike, SentinelOne, Carbon Black, Defender, etc.)
- Deployment coverage:

**Forensics Tools:**
- Available tools: (FTK, EnCase, Volatility, etc.)
- Capabilities:

**Ticketing/Case Management:**
- System: (Jira, ServiceNow, etc.)

**Other Relevant Tools:**
- Firewall management:
- Network monitoring:
- Threat intelligence:
- Backup/recovery:"

### 5. Gather Team Structure

"**Incident Response Team Structure**

Who responds to incidents in your organization?

**Team Members:**
- SOC Analysts:
- Incident Response Team:
- Security Engineering:
- IT Operations:
- Management:
- Legal:
- Communications/PR:

**Escalation Paths:**
- When does a SOC analyst escalate?
- When is senior management notified?
- When is legal involved?
- When is PR/Communications involved?

**Availability:**
- 24/7 coverage?
- On-call rotation?
- External support available? (Vendor, MSSP, consulting)"

### 6. Gather Communication Channels

"**Communication Channels**

How does your team communicate during incidents?

**Primary Channels:**
- Real-time collaboration: (Slack, Teams, etc.)
- Voice/video: (Zoom, phone bridge, etc.)
- Incident documentation: (SharePoint, Confluence, etc.)

**Contact Information:**
- Emergency contact list exists?
- Escalation contact list maintained?
- External stakeholder contacts documented?"

### 7. Document Severity Classification

"**Severity Classification**

Does your organization have existing severity levels for incidents? If yes, please share them. If no, I can propose a framework based on NIST best practices.

We'll need to define:
- Severity levels (Critical, High, Medium, Low)
- Criteria for each level
- Response time requirements
- Escalation requirements"

### 8. Document in Playbook

Append to Section 1 (Incident Overview) in output file:

```markdown
## 1. Incident Overview

### 1.1 Incident Type and Definition

**Incident Type:** {incident-type}

**Definition:**
{incident-definition}

**Common Characteristics:**
{incident-characteristics}

### 1.2 Scope and Assumptions

**Scope:**
This playbook covers {incident-type} incidents affecting {organization-name}.

**Assumptions:**
- Security tools are operational and monitored
- Team members have appropriate access and training
- Communication channels are available
- Escalation paths are established

**Out of Scope:**
{out-of-scope-items}

### 1.3 Organizational Context

**Organization Profile:**
- Size: {size}
- Industry: {industry}
- Regulatory Requirements: {regulations}
- Security Maturity: {maturity-level}

**Security Tools:**
- SIEM: {siem-platform}
- EDR: {edr-platform}
- Forensics: {forensics-tools}
- Ticketing: {ticketing-system}
- Other: {other-tools}

**Team Structure:**
- SOC Analysts: {soc-team}
- IR Team: {ir-team}
- Escalation Paths: {escalation-structure}

**Communication Channels:**
- Real-time: {realtime-channel}
- Voice/Video: {voice-channel}
- Documentation: {doc-platform}

### 1.4 Severity Classification Criteria

| Severity | Criteria | Response Time | Escalation |
|----------|----------|---------------|------------|
| **Critical** | {critical-criteria} | {critical-response-time} | {critical-escalation} |
| **High** | {high-criteria} | {high-response-time} | {high-escalation} |
| **Medium** | {medium-criteria} | {medium-response-time} | {medium-escalation} |
| **Low** | {low-criteria} | {low-response-time} | {low-escalation} |
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a]
incidentType: '{incident-type}'
organizationName: '{org-name}'
lastUpdated: '{timestamp}'
```

### 9. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}
- IF P: Execute {partyModeWorkflow}
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Section 1 is complete will you load, read entire file, then execute `{nextStepFile}` to begin defining detection procedures.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Incident type clearly selected and defined
- Organizational context comprehensively gathered
- Tool environment documented
- Team structure understood
- Severity criteria defined
- Section 1 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- Skipping organizational context gathering
- Generic procedures without org-specific context
- Not documenting severity criteria
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
