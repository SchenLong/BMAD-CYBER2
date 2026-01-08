---
name: 'step-05b-analysis'
description: 'Guide root cause analysis, attack timeline reconstruction, and MITRE ATT&CK mapping'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-05b-analysis.md'
nextStepFile: '{workflow_path}/steps/step-06b-eradication.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current incident report file from frontmatter'
sidecarFile: 'Current sidecar timeline file from frontmatter'

# Data References
mitreAttackData: '{workflow_path}/data/mitre-attack-mapping.csv'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5B: Detailed Analysis

## STEP GOAL:

To conduct comprehensive root cause analysis, reconstruct the complete attack timeline, map observed activity to MITRE ATT&CK framework, and determine full incident scope.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip root cause analysis
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE AN INCIDENT COMMANDER guiding technical analysis
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an Incident Commander
- ✅ Tone: Analytical, methodical, thorough
- ✅ Root cause understanding prevents recurrence
- ✅ MITRE ATT&CK mapping standardizes analysis

### Step-Specific Rules:

- 🎯 Focus ONLY on analysis and understanding
- 🚫 FORBIDDEN to start eradication (that's step 6b)
- 💬 Guide through analytical questions
- 📝 Map to MITRE ATT&CK using CSV data
- 🌐 Web-Browsing for threat intelligence

## EXECUTION PROTOCOLS:

- 🎯 Complete root cause analysis with evidence
- 💾 Append to Section 5 (Technical Analysis) in output file
- 📝 Update sidecar file with analysis completion
- 📖 Update frontmatter `stepsCompleted: [1, 2b, 3b, 4b, 5b]` before proceeding
- 🚫 Present menu (P/W/C) after analysis complete

## ANALYSIS SEQUENCE:

### 1. Analysis Overview

Display:

"**🔍 DETAILED ANALYSIS PHASE 🔍**

**Incident:** {incident-id} - {incident-type}

**Analysis Goals:**
1. Determine root cause (how did attacker succeed?)
2. Reconstruct complete attack timeline
3. Map activity to MITRE ATT&CK framework
4. Determine full scope (systems, data, duration)
5. Assess threat actor capabilities

**Evidence Available:**
{summary-from-step-4b}

Let's analyze this incident thoroughly."

### 2. Root Cause Analysis

"**ROOT CAUSE ANALYSIS**

We need to understand exactly how this incident occurred.

**Question 1: Initial Access Vector**

How did the attacker initially gain access?

Common vectors for {incident-type}:
a) Phishing email (credential theft or malware delivery)
b) Vulnerable internet-facing service (CVE exploitation)
c) Compromised credentials (brute force, password spray, stolen)
d) Supply chain compromise (trusted third-party)
e) Physical access
f) Insider action
g) Unknown / Under investigation

**Based on evidence collected in step 4b, what was the initial access vector?**

Your answer:"

**Wait for answer. Document.**

"**Question 2: Vulnerability Exploited**

What specific vulnerability or weakness did the attacker exploit?

For {incident-type}:
- Software vulnerability (CVE number if known): {prompt}
- Configuration weakness: {prompt}
- Weak/stolen credentials: {prompt}
- Social engineering success: {prompt}
- Zero-day vulnerability: {prompt}
- Other: {prompt}

**Your answer:**"

**Wait for answer.**

"**Would you like me to use Web-Browsing to research this vulnerability? (Y/N):**"

**If Yes, search for CVE details, exploitation techniques, patches.**

"**Question 3: Why Did Detection/Prevention Fail?**

Why didn't existing security controls prevent this?

**Endpoint Protection:**
- Why didn't EDR detect/prevent?: {prompt}
- Why didn't antivirus detect?: {prompt}

**Network Security:**
- Why didn't firewall block?: {prompt}
- Why didn't IDS/IPS detect?: {prompt}

**Email Security (if phishing):**
- Why did phishing email get through?: {prompt}

**User Awareness:**
- Why did user fall for social engineering?: {prompt}

**Patching:**
- Why was vulnerability unpatched?: {prompt}

**Root Cause Summary:**

Initial Access: {vector}
Vulnerability: {vulnerability-or-weakness}
Detection Failure: {why-not-detected}
Prevention Failure: {why-not-prevented}"

### 3. Attack Timeline Reconstruction

"**ATTACK TIMELINE RECONSTRUCTION**

Using evidence from step 4b, let's reconstruct the complete attack timeline.

**Timeline Template:**

| Date/Time | Phase | Activity | Evidence Source | IOCs |
|-----------|-------|----------|-----------------|------|
| {timestamp} | {phase} | {activity} | {source} | {iocs} |

**Let me guide you through each phase:**

**Phase 1: Initial Access**
- Timestamp: {prompt-for-first-observed-activity}
- Activity: {prompt-for-what-happened}
- Evidence: {prompt-for-evidence-source}
- IOCs: {prompt-for-iocs}

**Phase 2: Execution**
- Timestamp: {prompt}
- Activity: {prompt-for-malware-execution-or-command}
- Evidence: {prompt}
- IOCs: {prompt}

**Phase 3: Persistence**
- Timestamp: {prompt}
- Activity: {prompt-for-persistence-mechanism}
- Evidence: {prompt}
- IOCs: {prompt}

**Phase 4: Privilege Escalation (if applicable)**
- Timestamp: {prompt}
- Activity: {prompt}
- Evidence: {prompt}
- IOCs: {prompt}

**Phase 5: Lateral Movement (if applicable)**
- Timestamp: {prompt}
- Activity: {prompt-for-systems-accessed}
- Evidence: {prompt}
- IOCs: {prompt}

**Phase 6: Collection / Exfiltration / Impact**
- Timestamp: {prompt}
- Activity: {prompt-for-objective-achieved}
- Evidence: {prompt}
- IOCs: {prompt}

**Phase 7: Detection**
- Timestamp: {detection-time-from-step-2b}
- Activity: Incident detected by {detection-method}
- Evidence: {alert-or-report}

**Dwell Time Calculation:**
- First Activity: {first-timestamp}
- Detection: {detection-timestamp}
- **Dwell Time:** {calculated-duration} days/hours/minutes

**Timeline complete? (Y/N):**"

### 4. MITRE ATT&CK Mapping

"**MITRE ATT&CK FRAMEWORK MAPPING**

Let's map observed attacker activity to the MITRE ATT&CK framework.

Loading MITRE ATT&CK tactics..."

**Load {mitreAttackData} and display:**

"**MITRE ATT&CK Tactics (12 tactics):**

For each tactic, indicate if you observed activity:

**TA0001 - Initial Access:**
Did attacker gain initial access? (Y/N):
If Yes, which technique?
- T1566 Phishing
- T1190 Exploit Public-Facing Application
- T1078 Valid Accounts
- Other: {prompt}

Observed indicators: {prompt}

**TA0002 - Execution:**
Did attacker execute code? (Y/N):
If Yes, which technique?
- T1059 Command and Scripting Interpreter (PowerShell, cmd, bash)
- T1203 Exploitation for Client Execution
- T1204 User Execution
- Other: {prompt}

Observed indicators: {prompt}

**TA0003 - Persistence:**
Did attacker establish persistence? (Y/N):
If Yes, which technique?
- T1543 Create or Modify System Process (services, daemons)
- T1053 Scheduled Task/Job
- T1547 Boot or Logon Autostart Execution (registry run keys)
- T1136 Create Account (backdoor accounts)
- Other: {prompt}

Observed indicators: {prompt}

**TA0004 - Privilege Escalation:**
Did attacker escalate privileges? (Y/N):
If Yes, which technique?
- T1068 Exploitation for Privilege Escalation
- T1078 Valid Accounts (privileged)
- Other: {prompt}

Observed indicators: {prompt}

**TA0005 - Defense Evasion:**
Did attacker evade defenses? (Y/N):
If Yes, which technique?
- T1027 Obfuscated Files or Information
- T1070 Indicator Removal (log clearing)
- T1562 Impair Defenses (disable AV)
- Other: {prompt}

Observed indicators: {prompt}

**TA0006 - Credential Access:**
Did attacker steal credentials? (Y/N):
If Yes, which technique?
- T1003 OS Credential Dumping (LSASS, SAM)
- T1110 Brute Force
- T1056 Input Capture (keylogging)
- Other: {prompt}

Observed indicators: {prompt}

**TA0007 - Discovery:**
Did attacker perform reconnaissance? (Y/N):
If Yes, which technique?
- T1082 System Information Discovery
- T1083 File and Directory Discovery
- T1087 Account Discovery
- T1018 Remote System Discovery
- Other: {prompt}

Observed indicators: {prompt}

**TA0008 - Lateral Movement:**
Did attacker move laterally? (Y/N):
If Yes, which technique?
- T1021 Remote Services (RDP, SSH, SMB)
- T1550 Use Alternate Authentication Material (pass-the-hash)
- Other: {prompt}

Systems accessed: {prompt}
Observed indicators: {prompt}

**TA0009 - Collection:**
Did attacker collect data? (Y/N):
If Yes, which technique?
- T1005 Data from Local System
- T1039 Data from Network Shared Drive
- T1113 Screen Capture
- Other: {prompt}

Data collected: {prompt}
Observed indicators: {prompt}

**TA0011 - Command and Control:**
Did attacker establish C2? (Y/N):
If Yes, which technique?
- T1071 Application Layer Protocol (HTTP, HTTPS, DNS)
- T1095 Non-Application Layer Protocol (raw sockets)
- Other: {prompt}

C2 infrastructure: {prompt}
Observed indicators: {prompt}

**TA0010 - Exfiltration:**
Did attacker exfiltrate data? (Y/N):
If Yes, which technique?
- T1041 Exfiltration Over C2 Channel
- T1567 Exfiltration Over Web Service (cloud storage)
- Other: {prompt}

Data exfiltrated: {prompt-for-types-and-volumes}
Observed indicators: {prompt}

**TA0040 - Impact:**
Did attacker cause impact? (Y/N):
If Yes, which technique?
- T1486 Data Encrypted for Impact (ransomware)
- T1485 Data Destruction
- T1490 Inhibit System Recovery (delete backups)
- T1498 Network Denial of Service
- Other: {prompt}

Impact observed: {prompt}
Observed indicators: {prompt}

**MITRE ATT&CK Mapping Complete.**

**Tactics Used:** {count} of 12
**Techniques Identified:** {count}

Would you like me to use **Web-Browsing** to research these specific TTPs and find similar campaigns? (Y/N):"**

**If Yes, search for each identified technique and related campaigns.**

### 5. Scope Determination

"**INCIDENT SCOPE DETERMINATION**

Let's determine the full scope of the incident.

**Systems Compromised:**

**Complete list of compromised systems:**

{prompt-for-full-list-of-systems}

**Total systems compromised:** {count}

**System Categories:**
- Servers: {count}
- Workstations: {count}
- Network devices: {count}
- Cloud resources: {count}

**Data Accessed/Exfiltrated:**

**Was data exfiltrated? (Y/N):**"

**If Yes:**

"**Data Exfiltration Details:**

**Data Types:**
- [ ] Personal Identifiable Information (PII): {Y/N} - Records: {count}
- [ ] Protected Health Information (PHI): {Y/N} - Records: {count}
- [ ] Payment Card Data: {Y/N} - Records: {count}
- [ ] Intellectual Property: {Y/N} - Description: {prompt}
- [ ] Credentials: {Y/N} - Count: {count}
- [ ] Financial Data: {Y/N} - Description: {prompt}
- [ ] Other: {prompt}

**Data Sensitivity:**
- Confidential: {Y/N}
- Internal: {Y/N}
- Public: {Y/N}

**Estimated Volume:** {prompt-for-file-sizes-or-record-counts}

**Regulatory Impact:**
- GDPR applies?: {Y/N}
- PCI-DSS applies?: {Y/N}
- HIPAA applies?: {Y/N}
- Other regulations?: {prompt}"

"**Incident Duration:**

**Timeline:**
- First Observed Activity: {from-timeline}
- Detection: {from-timeline}
- Containment: {from-step-3b}
- Current Phase: Analysis

**Dwell Time:** {calculated-duration}
**Response Time:** {calculated-from-detection-to-containment}

**Lateral Movement Path:**

{prompt-for-description-of-how-attacker-moved}

Map: {initial-system} → {system-2} → {system-3} → ...

**Scope Summary:**
- Systems: {count}
- Data: {types-and-volumes}
- Duration: {dwell-time}
- Lateral Movement: {yes-or-no}"

### 6. Threat Actor Assessment

"**THREAT ACTOR ASSESSMENT**

Based on TTPs observed, let's assess the threat actor.

**Sophistication Level:**

a) Low (script kiddie, automated tools)
b) Medium (some custom tools, basic OPSEC)
c) High (advanced techniques, strong OPSEC)
d) Very High (APT, custom malware, anti-forensics)

**Your assessment:** {prompt}
**Reasoning:** {prompt}

**Likely Motivation:**

a) Financial (ransomware, data theft for sale)
b) Espionage (intellectual property, state secrets)
c) Sabotage (destructive, disruptive)
d) Hacktivism (ideological)
e) Unknown

**Your assessment:** {prompt}
**Reasoning:** {prompt}

**Attribution Indicators:**

- Known threat group?: {prompt}
- Similar campaigns?: {prompt}
- Unique TTPs?: {prompt}
- Attribution confidence: Low / Medium / High / None

Would you like me to use **Web-Browsing** to research attribution and find similar campaigns? (Y/N):"**

**If Yes, search for threat actor profiles matching TTPs.**

### 7. Document Analysis

"**DOCUMENTING ANALYSIS...**"

**Append to Section 5 (Technical Analysis) in output file:**

```markdown
## 5. Technical Analysis

### 5.1 Root Cause Analysis

**Initial Access Vector:**
{vector-description}

**Vulnerability Exploited:**
{vulnerability-or-weakness}
- CVE: {cve-if-applicable}
- Description: {description}
- Exploit Method: {method}

**Why Detection Failed:**
{detection-failure-reasons}

**Why Prevention Failed:**
{prevention-failure-reasons}

**Root Cause Summary:**
{narrative-summary}

### 5.2 Attack Timeline

**Complete Attack Timeline:**

| Date/Time | Phase | Activity | Evidence Source | IOCs |
|-----------|-------|----------|-----------------|------|
{timeline-table-rows}

**Dwell Time:** {duration} ({first-activity} to {detection})
**Response Time:** {duration} ({detection} to {containment})

### 5.3 MITRE ATT&CK Mapping

**Tactics and Techniques Observed:**

**TA0001 - Initial Access:**
- Technique: {technique-id-and-name}
- Indicators: {indicators}

**TA0002 - Execution:**
- Technique: {technique-id-and-name}
- Indicators: {indicators}

{continue-for-all-observed-tactics}

**Summary:**
- Tactics Used: {count} of 12
- Techniques Identified: {count}
- MITRE ATT&CK IDs: {list-of-technique-ids}

### 5.4 Incident Scope

**Systems Compromised:**
- Total: {count}
- Servers: {list}
- Workstations: {list}
- Network Devices: {list}
- Cloud Resources: {list}

**Data Impact:**

**Data Accessed:**
- PII Records: {count}
- PHI Records: {count}
- Payment Card Records: {count}
- Intellectual Property: {description}
- Credentials: {count}

**Data Exfiltrated:**
- Confirmed: {Y/N}
- Types: {types}
- Estimated Volume: {volume}
- Sensitivity: {confidential/internal/public}

**Regulatory Impact:**
- GDPR: {applicable-Y/N}
- PCI-DSS: {applicable-Y/N}
- HIPAA: {applicable-Y/N}

**Timeline:**
- First Activity: {timestamp}
- Detection: {timestamp}
- Containment: {timestamp}
- Dwell Time: {duration}

**Lateral Movement:**
{description-of-movement-path}
{diagram-if-applicable}

### 5.5 Threat Actor Assessment

**Sophistication:** {level}
**Reasoning:** {explanation}

**Motivation:** {motivation}
**Reasoning:** {explanation}

**Attribution:**
- Known Group: {group-name-or-unknown}
- Similar Campaigns: {campaigns-if-known}
- Attribution Confidence: {confidence-level}

**Threat Intelligence:**
{additional-context-from-web-browsing-if-performed}
```

**Update sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Analysis
- Action: Root cause analysis and MITRE ATT&CK mapping complete
- Details: |
    Root Cause: {summary}
    Initial Access: {vector}
    Vulnerability: {vulnerability}

    Attack Timeline Reconstructed:
    - Dwell Time: {duration}
    - Phases: {count} phases identified

    MITRE ATT&CK Mapping:
    - Tactics Used: {count} of 12
    - Techniques: {list-of-technique-ids}

    Scope Determined:
    - Systems: {count} compromised
    - Data: {types} affected
    - Exfiltration: {confirmed-or-suspected}

    Threat Actor:
    - Sophistication: {level}
    - Motivation: {motivation}
    - Attribution: {group-or-unknown}

    Analysis complete - ready for eradication planning
- Performed By: {user-name}
---
```

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b, 4b, 5b]
status: 'Analysis Complete - Eradication Planning'
lastUpdated: '{timestamp}'
```

### 8. Present MENU OPTIONS

Display: **Select an Option:** [P] Party Mode [W] Web-Browsing [C] Continue to Eradication

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After Party Mode or Web-Browsing execution, return to this menu

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} - Recommend Cipher (threat intelligence expert) for TTP analysis and attribution guidance
- IF W: Offer web search options:
  - CVE vulnerability details
  - Threat actor TTPs and attribution
  - Similar campaign research
  - MITRE ATT&CK technique details
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and analysis is complete will you load, read entire file, then execute `{nextStepFile}` to begin eradication.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Root cause analysis complete with evidence
- Attack timeline reconstructed with timestamps
- MITRE ATT&CK mapping complete using CSV data
- Incident scope fully determined (systems, data, duration)
- Threat actor assessed (sophistication, motivation)
- Section 5 of incident report comprehensive
- Sidecar file updated with analysis summary
- Frontmatter updated with stepsCompleted: [1, 2b, 3b, 4b, 5b]
- Menu presented (P/W/C)

### ❌ SYSTEM FAILURE:

- Skipping root cause analysis (will repeat incident)
- Missing MITRE ATT&CK mapping (incomplete analysis)
- Incomplete scope determination (may miss compromised systems)
- Starting eradication without analysis
- Not logging to sidecar file
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
