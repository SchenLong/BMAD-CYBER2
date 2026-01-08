---
name: 'step-03a-detection-analysis'
description: 'Define detection procedures, IOC identification, alert sources, and triage decision trees for the selected incident type'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-03a-detection-analysis.md'
nextStepFile: '{workflow_path}/steps/step-04a-containment.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingWorkflow: '{project-root}/_bmad/core/workflows/brainstorming/workflow.md'
---

# Step 3A: Detection & Analysis Procedures

## STEP GOAL:

To define comprehensive detection procedures, IOC identification methods, alert sources, triage decision trees, and initial assessment checklists specific to the incident type selected in Step 2A.

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

- 🎯 Focus ONLY on detection and initial analysis procedures
- 🚫 FORBIDDEN to start defining containment actions (that's step 4a)
- 💬 Guide through conversational exploration of detection capabilities
- 🌐 Web-Browsing ENCOURAGED for threat actor TTPs and recent campaigns
- 🎨 Brainstorming ENCOURAGED for creative detection strategies
- 👥 Party Mode (Cipher) AVAILABLE for threat intelligence expertise

## EXECUTION PROTOCOLS:

- 🎯 Leverage organizational context from Section 1 (gathered in step 2a)
- 💾 Append to Section 2 (Detection & Analysis Procedures) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a, 3a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Organizational context and incident type defined in step 2a
- Focus on HOW to detect and initially analyze this incident type
- Don't define HOW to contain yet (that's step 4a)
- Detection procedures inform containment strategy

## DETECTION & ANALYSIS PROCEDURE SEQUENCE:

### 1. Review Incident Type Context

Display:

"**Detection & Analysis Procedures for {incident-type}**

Let's define how your organization will detect and analyze **{incident-type}** incidents.

From your organizational context in Section 1:
- SIEM Platform: {siem-platform}
- EDR Platform: {edr-platform}
- Other Monitoring: {other-tools}
- Team Structure: {soc-team-summary}

We'll now define detection procedures tailored to your environment."

### 2. Identify Indicators of Compromise (IOCs)

Engage in conversation:

"**Indicators of Compromise (IOCs)**

For **{incident-type}** incidents, what indicators would signal this type of attack in your environment?

Let's think through different indicator categories:

**Network Indicators:**
- What network patterns would indicate {incident-type}? (e.g., connections to known C2 IPs, unusual outbound traffic volumes, DNS requests to suspicious domains)
- What protocols might be abused?
- What destination IPs/domains should trigger alerts?

**Endpoint Indicators:**
- What file system changes would indicate compromise? (e.g., file encryption for ransomware, new scheduled tasks for persistence)
- What process behaviors would be suspicious? (e.g., PowerShell with encoded commands, LSASS access)
- What registry modifications signal {incident-type}?

**Log-Based Indicators:**
- What authentication patterns suggest compromise? (e.g., failed logins followed by success, impossible travel)
- What user behaviors would be anomalous?
- What application logs should be monitored?

**Threat Intelligence Indicators:**
- Are there known threat actor groups targeting your industry with {incident-type}?
- What are their known IOCs? (I can search for recent threat intel if helpful)

Would you like me to use **Web-Browsing** to research recent {incident-type} campaigns and associated IOCs?"

**If user requests Web-Browsing:**
- Execute web search for: "{incident-type} IOCs 2025 threat intelligence"
- Execute web search for: "{incident-type} {industry} recent attacks"
- Summarize findings and integrate into IOC list

Document IOCs in categories:
- Network IOCs (IPs, domains, URLs, protocols, ports)
- File IOCs (hashes, file paths, extensions, signatures)
- Behavioral IOCs (process chains, authentication patterns, lateral movement)
- Email IOCs (sender addresses, subject patterns, attachment types)

### 3. Define Alert Sources and Data Collection

"**Alert Sources for {incident-type} Detection**

Based on your environment, where will alerts come from?

**SIEM ({siem-platform}):**
- What log sources feed your SIEM for {incident-type} detection?
  - Firewall logs
  - Proxy logs
  - DNS logs
  - VPN logs
  - DHCP logs
  - Cloud audit logs
  - Others?

- What correlation rules exist or need to be created?
- What alerting thresholds should trigger escalation?

**EDR ({edr-platform}):**
- What EDR detections cover {incident-type}?
- What behavioral analytics are enabled?
- What response actions can EDR take automatically?

**Other Monitoring Tools:**
- {list-other-tools-from-section-1}
- How do these integrate with SIEM/EDR?

**External Sources:**
- Threat intelligence feeds subscribed?
- Information sharing communities (ISAC, etc.)?
- Vendor security advisories?

**User Reports:**
- How do users report suspicious activity?
- What training has been provided for {incident-type} awareness?
- What's the triage process for user reports?"

Document all alert sources with:
- Source name
- Data types collected
- Integration method
- Alert volume expectations
- Tuning requirements

### 4. Develop Triage Decision Tree

"**Triage Decision Tree for {incident-type}**

When an alert fires that may indicate {incident-type}, how does the SOC analyst triage it?

Let's create a decision tree:

**Initial Validation:**
- Question 1: Is this a true positive or false positive?
  - What evidence confirms true positive?
  - What patterns indicate false positive?

**Severity Assessment:**
- Question 2: If true positive, what's the severity?
  - Critical: {critical-criteria-from-section-1}
  - High: {high-criteria-from-section-1}
  - Medium: {medium-criteria-from-section-1}
  - Low: {low-criteria-from-section-1}

**Scope Determination:**
- Question 3: How widespread is the incident?
  - Single endpoint?
  - Multiple endpoints in one segment?
  - Multiple segments?
  - Enterprise-wide?

**Escalation Decision:**
- Question 4: Who needs to be notified immediately?
  - Escalation matrix from Section 1
  - Based on severity and scope

**Initial Containment:**
- Question 5: Are immediate containment actions needed?
  - What actions can SOC take without approval? (e.g., isolate endpoint)
  - What actions require management approval? (e.g., network segmentation)

Let's work through this together. What's the first validation check your SOC analyst should perform when they see a potential {incident-type} alert?"

Work conversationally to build the decision tree with:
- Clear yes/no decision points
- Specific evidence requirements at each node
- Escalation triggers
- Timeframes for each decision
- Documented in flowchart-style markdown

### 5. Create Initial Assessment Checklist

"**Initial Assessment Checklist**

When a {incident-type} incident is confirmed, what information must be gathered immediately?

**Incident Metadata:**
- [ ] Incident ID assigned (format: {your-format})
- [ ] Detection timestamp
- [ ] Analyst name
- [ ] Initial severity assessment
- [ ] Alert source(s)

**Affected Assets:**
- [ ] List of affected systems (hostnames/IPs)
- [ ] Business criticality of affected systems
- [ ] Data classification of affected systems
- [ ] User accounts involved

**Technical Details:**
- [ ] IOCs observed (list from Section 2.1)
- [ ] Attack vector identified
- [ ] Timeline of observed activity
- [ ] Current state (active/contained/eradicated)

**Scope Questions:**
- [ ] How many systems affected?
- [ ] What data is at risk?
- [ ] Is attacker still active in environment?
- [ ] What access level does attacker have?

**Business Impact:**
- [ ] Services impacted
- [ ] Users affected
- [ ] Revenue impact (if known)
- [ ] Regulatory notification required?

**Evidence Preservation:**
- [ ] Memory dumps captured
- [ ] Disk images acquired
- [ ] Logs collected and secured
- [ ] Chain of custody initiated

What other information is critical to gather during the first {response-time-for-severity} of a {incident-type} incident?"

Customize the checklist based on user input and organizational needs.

### 6. Threat Intelligence Integration (Optional)

"**Threat Intelligence for {incident-type}**

Would you like to integrate threat intelligence into your detection procedures?

**Option 1:** I can use **Web-Browsing** to research:
- Recent {incident-type} campaigns targeting {industry}
- Known threat actor TTPs
- Emerging IOCs for {incident-type}
- Recommended detection signatures

**Option 2:** We can use **Party Mode** to bring in **Cipher** (our threat intelligence specialist) to:
- Provide deep analysis of {incident-type} threat landscape
- Recommend threat intel feeds and sources
- Design threat hunting procedures
- Create adversary emulation scenarios for testing

**Option 3:** We can use **Brainstorming** to:
- Explore creative detection strategies
- Identify gaps in current detection coverage
- Design proactive threat hunting procedures
- Develop deception/honeypot strategies

Would you like to use any of these tools? Or shall we proceed with what we have?"

### 7. Document Detection Procedures

Append to Section 2 (Detection & Analysis Procedures) in output file:

```markdown
## 2. Detection & Analysis Procedures

### 2.1 Indicators of Compromise (IOCs)

**Network Indicators:**
{network-iocs-list}

**Endpoint Indicators:**
{endpoint-iocs-list}

**Log-Based Indicators:**
{log-based-iocs-list}

**Threat Intelligence Indicators:**
{threat-intel-iocs-list}

**IOC Refresh Frequency:** {frequency}

### 2.2 Alert Sources and Data Collection

**SIEM Configuration ({siem-platform}):**
- Log Sources: {log-sources-list}
- Correlation Rules: {correlation-rules}
- Alert Thresholds: {thresholds}

**EDR Configuration ({edr-platform}):**
- Detection Rules: {edr-rules}
- Behavioral Analytics: {analytics-enabled}
- Automated Response: {auto-response-actions}

**Additional Monitoring:**
{additional-monitoring-tools-and-config}

**External Intelligence:**
- Threat Intel Feeds: {feeds-list}
- ISACs/Communities: {communities}
- Vendor Advisories: {vendors}

**User Reporting:**
- Reporting Mechanism: {reporting-method}
- Triage Process: {triage-process}

### 2.3 Triage Decision Tree

```
[Alert Fired: Potential {incident-type}]
    |
    ├─> [Validate Alert]
    |     ├─> False Positive? → Document and close
    |     └─> True Positive? → Continue
    |
    ├─> [Assess Severity]
    |     ├─> Critical: {critical-criteria} → Escalate immediately to {escalation-path}
    |     ├─> High: {high-criteria} → Escalate to {escalation-path}
    |     ├─> Medium: {medium-criteria} → Notify {team}
    |     └─> Low: {low-criteria} → Standard handling
    |
    ├─> [Determine Scope]
    |     ├─> Single endpoint → Isolate endpoint
    |     ├─> Multiple endpoints → Contain segment
    |     └─> Enterprise-wide → Activate IR team
    |
    ├─> [Escalation Decision]
    |     └─> Notify: {notification-matrix-based-on-severity}
    |
    └─> [Immediate Actions]
          ├─> SOC can take: {soc-authorized-actions}
          └─> Requires approval: {management-approval-required-actions}
```

### 2.4 Initial Assessment Checklist

**When {incident-type} incident is confirmed, gather:**

**Incident Metadata:**
- [ ] Incident ID: {format}
- [ ] Detection timestamp
- [ ] Analyst name
- [ ] Initial severity: Critical / High / Medium / Low
- [ ] Alert source(s)

**Affected Assets:**
- [ ] Affected systems list (hostname, IP, OS, business criticality)
- [ ] User accounts involved (username, privilege level, department)
- [ ] Data classification of affected systems (Confidential/Internal/Public)
- [ ] Geographic location of affected systems

**Technical Details:**
- [ ] IOCs observed: {reference-section-2.1}
- [ ] Attack vector: {initial-access-method}
- [ ] Timeline: First observed activity timestamp
- [ ] Current state: Active / Contained / Eradicated / Monitoring
- [ ] Attacker tools identified

**Scope Assessment:**
- [ ] Number of systems affected
- [ ] Data at risk (type and volume)
- [ ] Is attacker currently active?
- [ ] Attacker access level (user/admin/domain admin/system)
- [ ] Lateral movement observed?

**Business Impact:**
- [ ] Services impacted (list critical services)
- [ ] Number of users affected
- [ ] Estimated revenue impact
- [ ] SLA violations
- [ ] Regulatory notification required? (GDPR/PCI-DSS/HIPAA/etc.)
- [ ] Customer impact assessment

**Evidence Preservation:**
- [ ] Memory dumps captured (affected systems)
- [ ] Disk images acquired (critical evidence systems)
- [ ] Logs collected and secured (retention period: {retention})
- [ ] Network packet captures (if available)
- [ ] Screenshots of malicious activity
- [ ] Chain of custody documentation initiated

**Initial Response Actions Taken:**
- [ ] {list-actions-taken-during-triage}

**Timeframe for Initial Assessment:** {response-time-based-on-severity}

### 2.5 Threat Intelligence Integration

{threat-intel-procedures-if-applicable}

**Threat Intel Sources:**
{threat-intel-sources-list}

**Threat Hunting Procedures:**
{proactive-hunting-procedures-if-defined}

**Known Threat Actors:**
{threat-actor-profiles-if-researched}

**Recent Campaigns:**
{recent-campaign-summaries-if-researched}

### 2.6 Detection Testing and Validation

**Detection Rule Testing:**
- Test Frequency: {frequency}
- Test Method: {method-e.g.-purple-team-adversary-emulation}
- Success Criteria: {criteria}

**False Positive Management:**
- Tuning Process: {tuning-process}
- Baseline Review Frequency: {frequency}
- Rule Retirement Process: {process}

**Detection Metrics:**
- Mean Time to Detect (MTTD): {target-time}
- False Positive Rate: {target-rate}
- Alert Volume: {expected-volume}
- Detection Coverage: {coverage-percentage}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a, 3a]
lastUpdated: '{timestamp}'
```

### 8. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [B] Brainstorming [W] Web-Browsing [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "quality and completeness of detection procedures"
- IF P: Execute {partyModeWorkflow} - User can select Cipher (threat intel), Trace (forensics), or other experts
- IF B: Execute {brainstormingWorkflow} with focus on "creative detection strategies for {incident-type}"
- IF W: Offer web search options:
  - Recent {incident-type} campaigns and IOCs
  - Threat actor TTPs for {incident-type}
  - {incident-type} detection best practices
  - Industry-specific {incident-type} threat intelligence
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Section 2 is complete will you load, read entire file, then execute `{nextStepFile}` to begin defining containment procedures.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Comprehensive IOC list documented for {incident-type}
- All alert sources identified and documented
- Triage decision tree created with clear decision points
- Initial assessment checklist complete and actionable
- Detection procedures tailored to organizational tools (SIEM/EDR from Section 1)
- Section 2 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a, 3a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- Generic IOCs not specific to {incident-type} or organization
- Skipping triage decision tree
- Not leveraging organizational context from Section 1
- Defining containment actions (belongs in step 4a)
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
