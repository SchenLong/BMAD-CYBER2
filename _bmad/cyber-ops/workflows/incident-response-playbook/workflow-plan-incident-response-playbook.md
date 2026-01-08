---
stepsCompleted: [1, 2, 3, 4, 5, 6]
---

# Workflow Creation Plan: incident-response-playbook

## Initial Project Context

- **Module:** cyber-ops (Cybersecurity Operations)
- **Target Location:** _bmad-output/bmb-creations/workflows/incident-response-playbook/
- **Final Installation:** _bmad/cyber-ops/workflows/incident-response-playbook/
- **Created:** 2026-01-08

## Requirements

### 1. Workflow Purpose and Scope

**Problem Solved:**
Security teams need structured, repeatable procedures for responding to security incidents (breaches, ransomware, data exfiltration, DDoS, insider threats, etc.) with clear guidance for detection, containment, eradication, recovery, and post-incident analysis.

**Primary Users:**
- Phoenix agent (Incident Response specialist) - Lead role
- SOC analysts responding to security incidents
- Security teams executing incident response procedures
- Incident response coordinators managing active incidents
- Security leadership overseeing incident response

**Main Outcome:**
Dual-mode workflow producing:
- **Playbook Creation Mode:** Incident Response Playbook documents with detailed procedures
- **Guided Execution Mode:** Real-time incident response guidance and incident reports

### 2. Workflow Type Classification

**Primary Type:** Document Workflow (dual-mode)

**Mode A - Playbook Creation:**
- Generates structured incident response playbooks
- Collaborative planning and procedure documentation
- Preparation/planning phase activities

**Mode B - Guided Execution:**
- Interactive workflow for active incident response
- Real-time decision support during crisis
- Step-by-step guidance through NIST incident response lifecycle
- Generates incident response reports

### 3. Workflow Flow and Step Structure

**Pattern:** Branching with two distinct execution paths

**Mode Selection at Initialization:**
- User chooses: Playbook Creation OR Guided Execution

**Mode A - Playbook Creation Flow (7 steps):**
1. **Initialization & Incident Type Selection** - Choose incident types to document
2. **Detection & Analysis Procedures** - Define indicators, alerts, triage steps
3. **Containment Procedures** - Short-term and long-term containment steps
4. **Eradication Steps** - Root cause removal, vulnerability remediation
5. **Recovery Procedures** - System restoration, validation, monitoring
6. **Post-Incident Activities** - Lessons learned, documentation, improvements
7. **Generate Playbook Document** - Complete formatted playbook with all procedures

**Mode B - Guided Execution Flow (7 steps):**
1. **Incident Triage & Classification** - Rapid assessment, severity, incident type
2. **Initial Containment** - Immediate actions to limit spread/damage
3. **Evidence Collection** - Preserve logs, artifacts, chain of custody
4. **Detailed Analysis** - Root cause, scope, attack timeline
5. **Eradication** - Remove threat actor access, patch vulnerabilities
6. **Recovery & Validation** - Restore systems, verify security, resume operations
7. **Post-Incident Report** - Generate complete incident response report

**Workflow Characteristics:**
- **Branching:** Mode selection at step 1
- **Linear within modes:** Each mode follows NIST incident response lifecycle
- **Continuation support:** Both modes pausable/resumable (critical for multi-day incidents)
- **Optional collaboration:** Can invoke other agents (Cipher for threat intel, Bastion for architecture review)

### 4. User Interaction Style

**Playbook Creation Mode:**
- Highly collaborative with extensive discussion
- User provides organizational context, tools, escalation paths, communication channels
- Iterative refinement of procedures based on feedback
- Flexible conversation adapting to organization's maturity
- User validates procedures are actionable and complete

**Guided Execution Mode:**
- Directive but adaptive during crisis
- Rapid collection of incident details
- Real-time decision support with clear next steps
- Checklist-style confirmation of completed actions
- Timestamped logging of all response actions
- Minimizes cognitive load during high-stress situations
- User executes actions and reports status

### 5. Instruction Style

**Mix of Intent-Based and Prescriptive:**

**Playbook Creation Mode (Intent-Based):**
- Conversational exploration of incident response procedures
- Adapt to organization's tools, maturity, and environment
- Flexible discussion of detection methods, containment strategies
- Example: "Guide user to define containment procedures appropriate for their infrastructure and tools"

**Guided Execution Mode (Prescriptive):**
- Clear, numbered steps during crisis response
- Specific checklists and validation points
- Explicit decision trees for incident classification
- Example: "Execute these containment steps in order: 1. Isolate affected system 2. Preserve memory dump 3. Disconnect network 4. Verify isolation"

**Rationale:** Crisis response demands clarity and speed (prescriptive), while playbook creation benefits from adaptation to organizational context (intent-based).

### 6. Input Requirements

**Playbook Creation Mode:**

**Required Inputs:**
- Organization context (size, industry, regulatory requirements)
- Incident types to cover (ransomware, data breach, DDoS, insider threat, malware, phishing, etc.)
- Available tools and technologies (SIEM, EDR, forensics tools, ticketing systems)
- Team structure and escalation paths
- Communication channels and stakeholder lists

**Optional Inputs (enhance quality):**
- Existing incident response documentation
- Past incident reports or lessons learned
- Compliance frameworks (NIST, ISO 27001, PCI-DSS, HIPAA, GDPR)
- Business continuity plans
- Disaster recovery procedures
- Threat intelligence feeds
- Legal/regulatory notification requirements

**Guided Execution Mode:**

**Required Inputs:**
- Incident description and initial indicators
- Incident severity/priority (Critical/High/Medium/Low)
- Affected systems, users, data
- Timeline of events (when first detected, when occurred)
- Current incident status

**Optional Inputs:**
- Previously created playbook for this incident type (if exists)
- Related SIEM alerts or logs
- Threat intelligence context
- Business impact assessment
- Legal/compliance notification requirements

**Prerequisites:**
- Basic understanding of incident response concepts
- Access to security tools and systems
- Authority to execute response actions (for guided mode)
- Communication channels established

**File Support:**
- Workflow should reference existing playbooks, logs, screenshots
- Accept common formats (TXT, LOG, PNG, PDF for evidence)

### 7. Output Specifications

**Playbook Creation Mode Output:**

**Primary Output:** Incident Response Playbook (Markdown format)

**File Location:** `{output_folder}/planning/incident-response/playbook-{incident-type}.md`

**Playbook Structure (8 Required Sections):**

1. **Incident Overview**
   - Incident type and definition
   - Scope and assumptions
   - Severity classification criteria

2. **Detection & Analysis Procedures**
   - Indicators of compromise (IOCs)
   - Alert sources and monitoring
   - Triage procedures
   - Initial assessment checklist

3. **Containment Procedures**
   - Short-term containment (immediate actions)
   - Long-term containment (sustained isolation)
   - Decision criteria for containment strategies
   - Specific commands/procedures

4. **Eradication Steps**
   - Root cause identification
   - Threat actor removal procedures
   - Vulnerability remediation
   - Validation of eradication

5. **Recovery Procedures**
   - System restoration steps
   - Service restoration priority
   - Validation and testing
   - Enhanced monitoring during recovery

6. **Post-Incident Activities**
   - Lessons learned session guide
   - Documentation requirements
   - Process improvement actions
   - Knowledge base updates

7. **Communication Plan**
   - Internal stakeholder notification (IT, management, legal, HR)
   - External stakeholder notification (customers, partners, regulators)
   - Communication templates
   - Timeline requirements (GDPR 72 hours, etc.)

8. **Appendices**
   - Tool-specific commands (SIEM queries, EDR actions, forensics procedures)
   - Contact lists and escalation paths
   - Checklists and forms
   - Compliance references

**File Naming Convention:** `playbook-{incident-type}-{YYYY-MM-DD}.md`

---

**Guided Execution Mode Output:**

**Primary Output:** Incident Response Report (Markdown format)

**File Location:** `{output_folder}/incidents/incident-{incident-id}-{date}.md`

**Report Structure (7 Required Sections):**

1. **Incident Summary**
   - Incident ID, classification, severity
   - Detection time, response start time
   - Affected systems/users/data
   - Current status
   - Executive summary

2. **Timeline of Events**
   - Chronological log of incident and response
   - Timestamped entries for all actions
   - Detection, containment, eradication, recovery milestones

3. **Actions Taken**
   - Detailed log of response actions
   - Who performed each action
   - Results/outcomes of actions
   - Decisions made and rationale

4. **Evidence Collected**
   - Logs preserved
   - Screenshots/forensic images
   - IOCs identified
   - Chain of custody documentation

5. **Technical Analysis**
   - Root cause analysis
   - Attack vectors and techniques (MITRE ATT&CK mapping)
   - Scope of compromise
   - Vulnerabilities exploited

6. **Recovery Status**
   - Systems restored
   - Services resumed
   - Validation results
   - Ongoing monitoring

7. **Post-Incident Analysis**
   - Lessons learned
   - What worked well
   - What could be improved
   - Recommendations for prevention
   - Follow-up actions

**File Naming Convention:** `incident-{incident-id}-{YYYY-MM-DD}.md`

**Real-time Updates:** Document updated throughout incident lifecycle

---

### 8. Success Criteria

**Playbook Creation Mode:**

**Completeness Criteria:**
- ✅ All 6 NIST incident response phases covered (Preparation, Detection & Analysis, Containment, Eradication, Recovery, Post-Incident)
- ✅ Specific procedures for each incident type (not generic "handle the incident")
- ✅ Clear decision points and escalation criteria defined
- ✅ Actionable commands/steps included (not just theory)
- ✅ Communication templates and stakeholder lists complete
- ✅ Tool-specific guidance where applicable
- ✅ Compliance requirements addressed

**Quality Criteria:**
- Procedures are specific to organization's tools and environment (not generic)
- Steps are executable by target audience (SOC analysts, IR team)
- Includes time estimates and priority levels for actions
- References compliance requirements if applicable (GDPR, PCI-DSS, HIPAA)
- Playbook is usable during actual incident without modification
- Commands and procedures are tested or validated

**User Satisfaction Indicators:**
- Team feels prepared for incidents covered by playbook
- Playbook reduces confusion and decision paralysis during incidents
- Procedures align with organizational tools and capabilities
- Stakeholders agree on communication and escalation procedures

---

**Guided Execution Mode:**

**Completeness Criteria:**
- ✅ Incident properly classified and triaged
- ✅ All containment steps executed and validated
- ✅ Evidence preserved for forensics/legal (chain of custody maintained)
- ✅ Root cause identified and documented
- ✅ Eradication validated (threat actor removed, vulnerabilities patched)
- ✅ Systems recovered and validated before resuming operations
- ✅ Stakeholders notified appropriately and timely
- ✅ Post-incident report complete with lessons learned

**Quality Criteria:**
- All actions logged with precise timestamps
- Critical decisions documented with rationale
- Compliance requirements met (evidence preservation, notification timelines)
- MITRE ATT&CK techniques mapped where applicable
- Lessons learned captured for continuous improvement
- Report is shareable with leadership, legal, auditors, insurance
- Evidence is forensically sound if legal action is needed

**User Satisfaction Indicators:**
- Guided mode: Team successfully contained and recovered from incident
- Clear, actionable guidance reduced response time and stress
- No critical steps missed during high-pressure incident
- Post-incident report provides closure and learning
- Organization better prepared for future incidents

---

## Tools Configuration

### Core BMAD Tools

- **Party-Mode**: ✅ INCLUDED
  - Integration points: Both modes - collaborate with Cipher (threat intelligence), Trace (forensics), Bastion (security architecture) when specialized expertise needed
  - Use case: Multi-agent collaboration for comprehensive incident analysis and response
  - Rationale: Enables consultation with domain experts during complex incidents or playbook development

- **Advanced Elicitation**: ✅ INCLUDED
  - Integration points: Playbook Creation Mode - after playbook draft completion for quality enhancement
  - Use case: Critical evaluation of playbook procedures, challenge assumptions, ensure comprehensive coverage
  - Rationale: Adversarial review ensures playbooks are battle-tested before real incidents

- **Brainstorming**: ✅ INCLUDED
  - Integration points: Playbook Creation Mode - during procedure development for creative strategies
  - Use case: Generate creative containment strategies, recovery approaches, and response innovations
  - Rationale: Complex incidents require innovative thinking; brainstorming generates novel response approaches

### LLM Features

- **Web-Browsing**: ✅ INCLUDED
  - Use cases: Lookup current CVEs, threat actor TTPs, MITRE ATT&CK techniques, compliance notification requirements (GDPR, PCI-DSS timelines), tool-specific commands
  - Integration: Throughout both modes for real-time threat intelligence and compliance information
  - Rationale: Incident response requires current threat intelligence and evolving compliance requirements

- **File I/O**: ✅ REQUIRED
  - Operations: Create/update playbook and incident report documents, read existing playbooks, logs, evidence files, screenshots
  - Integration: Essential for both output modes - document generation is core functionality
  - Rationale: Both modes produce structured documents; guided mode must read logs and evidence

- **Sub-Agents**: ❌ EXCLUDED
  - Rationale: Party Mode provides agent collaboration; workflow is sequential, not parallel delegation
  - Note: No need for autonomous sub-agents when Party Mode enables conversational collaboration

- **Sub-Processes**: ❌ EXCLUDED
  - Rationale: Both modes are conversational and sequential; no need for parallel background processing
  - Note: Incident response follows linear NIST lifecycle; no parallel processing requirements

### Memory Systems

- **Sidecar File**: ✅ INCLUDED (CRITICAL)
  - Purpose: Multi-session state management for multi-day incident response
  - Use cases:
    - **Playbook Creation:** Pause/resume playbook development across sessions, maintain drafts and decisions
    - **Guided Execution:** CRITICAL - preserve incident timeline, actions taken, evidence collected, decisions made across multi-day incidents
  - Integration: Auto-loaded on workflow resumption; updated after each major action/decision
  - Rationale: Real incidents span hours/days; must maintain perfect continuity of incident state

### External Integrations

❌ **No external integrations required**
- All functionality achievable with built-in BMAD capabilities
- Workflow is conversational and document-generation focused
- No database connections, APIs, or external tools needed

### Installation Requirements

✅ **No installations required**
- All selected tools are built-in BMAD capabilities (Party Mode, Advanced Elicitation, Brainstorming, Sidecar File)
- All LLM features are native capabilities
- No external dependencies
- No MCP server installations needed
- **Workflow ready to execute immediately after creation**

---

## Output Format Design

### Format Type: Structured

Both output documents require **structured format** with required sections and flexible content within each section.

### Output Document 1: Incident Response Playbook

**Document Type:** Incident Response Playbook (Preparation/Planning)

**File Format:** Markdown (.md)

**File Location:** `{output_folder}/planning/incident-response/playbook-{incident-type}-{YYYY-MM-DD}.md`

**File Naming:** `playbook-ransomware-2026-01-08.md`

**Frequency:** Single document per incident type (updated periodically)

**Structure Specifications:**

**8 Required Sections:**
1. **Incident Overview** - Type, definition, scope, severity classification
2. **Detection & Analysis Procedures** - IOCs, alerts, triage, assessment
3. **Containment Procedures** - Short-term/long-term, decision criteria, commands
4. **Eradication Steps** - Root cause, threat removal, vulnerability remediation
5. **Recovery Procedures** - Restoration, service priority, validation, monitoring
6. **Post-Incident Activities** - Lessons learned, documentation, improvements
7. **Communication Plan** - Internal/external stakeholders, templates, timelines
8. **Appendices** - Tool commands, contacts, checklists, compliance references

**Template Information:**
- **Template source:** Created from requirements analysis
- **Template file:** `template-playbook.md`
- **Placeholders:** 100+ placeholders for organizational customization
- **Format:** Markdown with frontmatter metadata
- **Sections:** Fixed structure, flexible content adapted to organization

**Special Considerations:**
- Must be usable during actual incidents (action-oriented)
- Include tool-specific commands (SIEM, EDR, forensics)
- Meet compliance requirements (GDPR, PCI-DSS, HIPAA)
- Version control with approval workflow
- Review cycle specification (quarterly/annually)
- Executable by SOC analysts (not just theory)

---

### Output Document 2: Incident Response Report

**Document Type:** Incident Response Report (Crisis Documentation)

**File Format:** Markdown (.md)

**File Location:** `{output_folder}/incidents/incident-{incident-id}-{YYYY-MM-DD}.md`

**File Naming:** `incident-INC-2026-001-2026-01-08.md`

**Frequency:** Single document per incident (updated throughout incident lifecycle)

**Structure Specifications:**

**7 Required Sections:**
1. **Incident Summary** - Classification, severity, timeline, affected assets, executive summary
2. **Timeline of Events** - Chronological log with timestamps, detection/containment/eradication/recovery milestones
3. **Actions Taken** - Response actions log, decisions, escalations, external support
4. **Evidence Collected** - Digital evidence, logs, forensic images, IOCs, chain of custody
5. **Technical Analysis** - Root cause, attack vectors, MITRE ATT&CK mapping, scope, vulnerabilities
6. **Recovery Status** - Systems/services restored, validation results, ongoing monitoring
7. **Post-Incident Analysis** - Lessons learned, effectiveness, recommendations, follow-up actions

**Template Information:**
- **Template source:** Created from requirements analysis
- **Template file:** `template-incident-report.md`
- **Placeholders:** 150+ placeholders for incident details
- **Format:** Markdown with frontmatter metadata
- **Sections:** Fixed structure, timestamped entries, precise records

**Special Considerations:**
- **Legal/Forensic Quality** - Chain of custody, evidence preservation
- **Compliance Requirements** - GDPR 72-hour notification, PCI-DSS, HIPAA timelines
- **MITRE ATT&CK Mapping** - Technique IDs for each attack phase
- **Real-time Updates** - Document updated throughout incident
- **Shareable Format** - Leadership, legal, auditors, insurance, regulators
- **Confidentiality Markings** - Classification and distribution control
- **Financial Impact Tracking** - Direct/indirect costs for budgeting
- **Approval Workflow** - Incident Commander, Security Manager, Legal sign-off

---

### Template Design Approach

**Method:** AI-designed templates based on requirements and industry best practices

**Template Features:**
- Frontmatter metadata for workflow state tracking
- Placeholder syntax: `{placeholder_name}` for easy identification
- Markdown formatting for readability and portability
- Table structures for structured data (severity criteria, contacts, evidence)
- Code blocks for commands and procedures
- Checklist format for actionable items
- Section numbering for navigation
- Document control sections for version management

**Template Validation:**
- All 8 playbook sections included
- All 7 report sections included
- Covers NIST incident response lifecycle
- Meets compliance documentation requirements
- Executable/actionable (not just informational)
- Professional formatting for stakeholder sharing

---

## Workflow Structure Design

### Workflow Architecture Pattern: Dual-Mode Branching

This workflow implements a **branching architecture** with mode selection at initialization, then follows linear paths within each mode following the NIST incident response lifecycle.

### Continuation Support: YES

**Rationale:**
- Both modes generate structured documents (playbooks and reports)
- Incidents can span multiple days requiring pause/resume capability
- Playbook creation requires extensive organizational input
- Must preserve incident state (timeline, evidence, decisions) across sessions

**Implementation:**
- step-01-init.md with continuation detection
- step-01b-continue.md for workflow resumption
- stepsCompleted tracking in output frontmatter
- Sidecar file for multi-session state (incident timeline, evidence chain of custody)

---

### File Structure

```
incident-response-playbook/
├── workflow.md                           # Main workflow configuration
├── steps/
│   ├── step-01-init.md                  # Initialization with mode selection
│   ├── step-01b-continue.md             # Continuation handler
│   │
│   ├── MODE A - PLAYBOOK CREATION (7 steps)
│   ├── step-02a-incident-type.md        # Choose incident types to document
│   ├── step-03a-detection-analysis.md   # Define detection procedures
│   ├── step-04a-containment.md          # Design containment procedures
│   ├── step-05a-eradication.md          # Document eradication steps
│   ├── step-06a-recovery.md             # Define recovery procedures
│   ├── step-07a-post-incident.md        # Plan post-incident activities
│   ├── step-08a-generate-playbook.md    # Generate complete playbook document
│   │
│   └── MODE B - GUIDED EXECUTION (7 steps)
│       ├── step-02b-triage.md           # Incident triage & classification
│       ├── step-03b-containment.md      # Execute containment actions
│       ├── step-04b-evidence.md         # Collect and preserve evidence
│       ├── step-05b-analysis.md         # Detailed technical analysis
│       ├── step-06b-eradication.md      # Execute eradication
│       ├── step-07b-recovery.md         # System recovery & validation
│       └── step-08b-report.md           # Generate incident report
│
├── templates/
│   ├── template-playbook.md             # Playbook document template (created)
│   └── template-incident-report.md      # Incident report template (created)
│
└── data/
    ├── incident-types.csv               # Common incident type definitions
    ├── severity-criteria.csv            # Severity classification guidelines
    └── mitre-attack-mapping.csv         # MITRE ATT&CK technique reference
```

---

### Step Design Details

#### **Step 01: Initialization & Mode Selection**

**File:** `step-01-init.md`

**Goal:** Detect continuation state, select execution mode (Playbook Creation or Guided Execution), and initialize the appropriate output document.

**Flow:**
1. Check for existing workflow (continuation detection)
2. If continuing → load step-01b-continue.md
3. If fresh start → Present mode selection:
   - Option A: Playbook Creation Mode
   - Option B: Guided Execution Mode
4. Based on selection, create appropriate output document:
   - Mode A → `{output_folder}/planning/incident-response/playbook-{incident-type}-{date}.md`
   - Mode B → `{output_folder}/incidents/incident-{incident-id}-{date}.md`
5. Initialize frontmatter with mode and stepsCompleted: [1]
6. Auto-proceed to appropriate mode path (step-02a or step-02b)

**Interaction:** Auto-proceed after mode selection (no A/P/C menu)

**Outputs:**
- Mode selection recorded in frontmatter
- Output document created from template
- stepsCompleted: [1]

---

#### **Step 01b: Continue Existing Workflow**

**File:** `step-01b-continue.md`

**Goal:** Resume paused workflow, load previous state, determine next step.

**Flow:**
1. Read complete output document with frontmatter
2. Load sidecar file (if exists) for incident state
3. Display workflow status:
   - Mode (Playbook Creation / Guided Execution)
   - Steps completed vs total
   - Last activity timestamp
   - Current section/phase
4. Present options:
   - Continue from where left off
   - Review previous work
   - Modify/refine previous sections
5. Route to appropriate next step based on stepsCompleted

**Interaction:** User chooses continue vs review

**Outputs:** Route to correct step based on progress

---

### MODE A: Playbook Creation (7 Steps)

**Overall Goal:** Generate comprehensive incident response playbook with organizational procedures

**Interaction Style:** Highly collaborative, intent-based, extensive discussion

**Tools Integration:**
- Brainstorming (steps 3a-7a for creative strategies)
- Party Mode (all steps for expert consultation - Cipher/Trace/Bastion)
- Advanced Elicitation (all steps for quality review)
- Web-Browsing (throughout for CVEs, MITRE ATT&CK, compliance)

---

#### **Step 02a: Incident Type Selection**

**Goal:** Determine which incident types to document in the playbook

**Flow:**
1. Load incident-types.csv with common types
2. Present incident type categories:
   - Ransomware
   - Data Breach/Exfiltration
   - DDoS Attack
   - Insider Threat
   - Malware Infection
   - Phishing/Social Engineering
   - Account Compromise
   - Advanced Persistent Threat (APT)
   - Supply Chain Attack
   - Physical Security Breach
3. User selects incident type(s) to cover
4. Gather organizational context:
   - Organization size, industry
   - Regulatory requirements (GDPR, PCI-DSS, HIPAA)
   - Tools available (SIEM, EDR, forensics)
   - Team structure
5. Document selections in playbook frontmatter and section 1
6. Update stepsCompleted: [1, 2a]

**Interaction:** Menu with A/P/C options

**Outputs:** Incident Overview section populated

---

#### **Step 03a: Detection & Analysis Procedures**

**Goal:** Define how to detect, identify, and initially analyze the incident type

**Flow:**
1. Guide user through IOC identification:
   - What are the indicators for this incident type?
   - Where would these show up? (logs, alerts, user reports)
2. Define alert sources:
   - SIEM alerts
   - EDR detections
   - User reports
   - Threat intelligence feeds
3. Document triage procedures:
   - Initial assessment checklist
   - Severity determination
   - Escalation criteria
4. Optional: Web-Browse for current threat actor TTPs
5. Optional: Party Mode with Cipher for threat intelligence insights
6. Optional: Brainstorming for creative detection methods
7. Append to section 2 of playbook
8. Update stepsCompleted: [1, 2a, 3a]

**Interaction:** Menu with A/P/C options

**Outputs:** Detection & Analysis Procedures section complete

---

#### **Step 04a: Containment Procedures**

**Goal:** Design short-term and long-term containment strategies

**Flow:**
1. Short-term containment design:
   - Immediate actions to limit spread/damage
   - Network isolation procedures
   - System quarantine steps
   - Access revocation
2. Long-term containment design:
   - Sustained isolation strategies
   - Segmentation approaches
   - Monitoring during containment
3. Decision criteria:
   - When to isolate vs monitor
   - When to shut down vs observe
4. Tool-specific commands:
   - SIEM queries
   - EDR actions
   - Firewall rules
   - Network segmentation
5. Optional: Brainstorming for innovative containment
6. Optional: Party Mode with Bastion for architecture-aware containment
7. Append to section 3 of playbook
8. Update stepsCompleted: [1, 2a, 3a, 4a]

**Interaction:** Menu with A/P/C options

**Outputs:** Containment Procedures section complete

---

#### **Step 05a: Eradication Steps**

**Goal:** Document procedures for removing threat actor and remediating vulnerabilities

**Flow:**
1. Root cause identification procedures
2. Threat actor removal:
   - Persistence mechanism checks
   - Backdoor elimination
   - Malware removal
3. Vulnerability remediation:
   - Patch procedures
   - Configuration hardening
   - Security updates
4. Validation procedures:
   - Clean system criteria
   - Verification testing
5. Optional: Web-Browse for CVE details and patches
6. Optional: Party Mode with Trace for forensic validation
7. Append to section 4 of playbook
8. Update stepsCompleted: [1, 2a, 3a, 4a, 5a]

**Interaction:** Menu with A/P/C options

**Outputs:** Eradication Steps section complete

---

#### **Step 06a: Recovery Procedures**

**Goal:** Define system restoration, service resumption, and validation

**Flow:**
1. System restoration order:
   - Prioritize services (P1, P2, P3)
   - Dependencies mapping
2. Restoration procedures:
   - Backup verification
   - System rebuild steps
   - Service restart procedures
3. Validation and testing:
   - Functional testing
   - Security validation
   - Performance testing
4. Enhanced monitoring:
   - What to monitor during recovery
   - Alert thresholds
   - Monitoring duration
5. Optional: Brainstorming for graceful recovery strategies
6. Optional: Party Mode with Bastion for architecture validation
7. Append to section 5 of playbook
8. Update stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a]

**Interaction:** Menu with A/P/C options

**Outputs:** Recovery Procedures section complete

---

#### **Step 07a: Post-Incident Activities & Communication**

**Goal:** Plan lessons learned, documentation, and stakeholder communication

**Flow:**
1. Lessons learned session guide:
   - Agenda template
   - Key questions
   - Attendees
2. Documentation requirements:
   - What to document
   - Retention periods
   - Storage locations
3. Communication plan:
   - Internal stakeholders (IT, management, legal, HR)
   - External stakeholders (customers, partners, regulators)
   - Communication templates
   - Timeline requirements (GDPR 72 hours, etc.)
4. Process improvement actions
5. Optional: Web-Browse for regulatory notification requirements
6. Append to sections 6 and 7 of playbook
7. Update stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a]

**Interaction:** Menu with A/P/C options

**Outputs:** Post-Incident Activities & Communication Plan sections complete

---

#### **Step 08a: Generate Final Playbook**

**Goal:** Compile appendices, finalize playbook, and generate complete document

**Flow:**
1. Generate Appendices section:
   - Tool-specific commands summary
   - Contact lists from communication plan
   - Checklists compilation
   - Compliance references
2. Add document control:
   - Version history
   - Review schedule
   - Approval workflow
3. Final review prompt:
   - All 8 sections complete?
   - Procedures actionable?
   - Commands validated?
4. Optional: Advanced Elicitation for final quality review
5. Finalize playbook document
6. Mark workflow complete: stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a, 8a]
7. Set workflowComplete: true in frontmatter
8. Display success message with file location

**Interaction:** Menu with A/P/C options for final review, then completion

**Outputs:** Complete incident response playbook ready for use

---

### MODE B: Guided Execution (7 Steps)

**Overall Goal:** Guide real-time incident response and generate incident report

**Interaction Style:** Directive/prescriptive, rapid, checklist-based, minimizes cognitive load

**Tools Integration:**
- Party Mode (all steps for expert consultation - Cipher/Trace/Bastion)
- Web-Browsing (throughout for threat intel, IOC lookups, CVEs)
- Sidecar File (CRITICAL - preserve timeline, evidence, decisions)

**Critical Feature:** Real-time document updates - incident report updated throughout

---

#### **Step 02b: Incident Triage & Classification**

**Goal:** Rapidly assess incident, classify type, determine severity

**Flow:**
1. Collect incident basics:
   - Incident ID (auto-generate: INC-{YYYY}-{NNN})
   - Detection time
   - Initial indicators
   - Affected systems/users/data
   - Reporter information
2. Classify incident type (present decision tree):
   - Ransomware?
   - Data breach?
   - DDoS?
   - Insider threat?
   - Malware?
   - Phishing?
   - Other?
3. Determine severity (load severity-criteria.csv):
   - Critical / High / Medium / Low
   - Response time requirements
   - Escalation needs
4. Update sidecar file with incident start timestamp
5. Write Incident Summary section to report
6. Update stepsCompleted: [1, 2b]

**Interaction:** Prescriptive checklist, rapid Q&A, auto-proceed when classified

**Outputs:**
- Incident Summary section populated
- Severity determined
- Response clock started
- Timeline entry 1: "Incident detected"

---

#### **Step 03b: Initial Containment**

**Goal:** Execute immediate actions to limit spread and damage

**Flow:**
1. Present containment decision tree based on incident type:
   - Isolate affected systems? Y/N
   - Disconnect network? Y/N
   - Revoke user access? Y/N
   - Quarantine files? Y/N
2. For each action:
   - Present specific commands (from playbook if exists)
   - User executes and confirms completion
   - Log timestamp and action to sidecar
3. Validation checklist:
   - [ ] Systems isolated
   - [ ] Network disconnected
   - [ ] Access revoked
   - [ ] Quarantine verified
4. Optional: Party Mode with Bastion for containment strategy review
5. Append to Actions Taken section
6. Add timeline entry: "Containment complete at {timestamp}"
7. Update stepsCompleted: [1, 2b, 3b]

**Interaction:** Prescriptive steps with checkboxes, P/C menu

**Outputs:**
- Containment actions logged
- Timeline updated
- Sidecar file updated with actions

---

#### **Step 04b: Evidence Collection**

**Goal:** Preserve logs, artifacts, and evidence with chain of custody

**Flow:**
1. Evidence collection checklist (forensically sound):
   - [ ] Memory dumps captured
   - [ ] Disk images created
   - [ ] Logs preserved (SIEM, EDR, firewall, etc.)
   - [ ] Screenshots collected
   - [ ] Network captures saved
2. For each evidence item:
   - File name
   - Hash (MD5/SHA256)
   - Collected by
   - Timestamp
   - Storage location
3. Chain of custody documentation:
   - Who collected
   - When collected
   - Where stored
   - Who has access
4. IOC extraction:
   - IP addresses
   - Domains
   - File hashes
   - Email addresses
5. Optional: Web-Browse for IOC threat intelligence
6. Optional: Party Mode with Trace for forensic guidance
7. Append to Evidence Collected section
8. Add timeline entry: "Evidence collection complete"
9. Update stepsCompleted: [1, 2b, 3b, 4b]

**Interaction:** Checklist with P/C menu

**Outputs:**
- Evidence inventory complete
- Chain of custody documented
- IOCs identified
- Timeline updated

---

#### **Step 05b: Detailed Analysis**

**Goal:** Determine root cause, attack vectors, scope of compromise

**Flow:**
1. Root cause analysis:
   - What vulnerability was exploited?
   - How did attacker gain access?
   - When did compromise occur?
2. Attack timeline reconstruction:
   - Initial access timestamp
   - Lateral movement
   - Data access
   - Exfiltration (if any)
3. MITRE ATT&CK mapping (load mitre-attack-mapping.csv):
   - Initial Access technique
   - Execution technique
   - Persistence technique
   - Privilege Escalation technique
   - Defense Evasion technique
   - Credential Access technique
   - Discovery technique
   - Lateral Movement technique
   - Collection technique
   - Exfiltration technique (if applicable)
   - Impact technique
4. Scope determination:
   - Systems compromised
   - Data accessed
   - Data exfiltrated
   - Duration of compromise
5. Optional: Web-Browse for threat actor TTPs and CVE details
6. Optional: Party Mode with Cipher for threat intelligence correlation
7. Append to Technical Analysis section
8. Add timeline entry: "Analysis complete - root cause identified"
9. Update stepsCompleted: [1, 2b, 3b, 4b, 5b]

**Interaction:** P/C menu for expert consultation

**Outputs:**
- Root cause identified
- Attack vectors documented
- MITRE ATT&CK mapping complete
- Scope of compromise determined
- Timeline updated

---

#### **Step 06b: Eradication**

**Goal:** Remove threat actor access, patch vulnerabilities, validate clean state

**Flow:**
1. Threat actor removal checklist:
   - [ ] Persistence mechanisms eliminated
   - [ ] Backdoors removed
   - [ ] Malware eradicated
   - [ ] Compromised credentials rotated
2. Vulnerability remediation checklist:
   - [ ] Patches applied
   - [ ] Configurations hardened
   - [ ] Security updates installed
3. For each action:
   - Document what was done
   - Who performed it
   - Timestamp
   - Validation result
4. Clean system validation:
   - Forensic scan clean
   - No persistence detected
   - All IOCs removed
5. Sign-off requirements:
   - IR team validates eradication
   - Security team approves
6. Optional: Party Mode with Trace for validation
7. Append to Actions Taken section
8. Add timeline entry: "Eradication complete and validated"
9. Update stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b]

**Interaction:** Checklist with P/C menu

**Outputs:**
- Eradication actions logged
- Validation documented
- Timeline updated

---

#### **Step 07b: Recovery & Validation**

**Goal:** Restore systems, resume services, validate security, return to operations

**Flow:**
1. System restoration checklist (priority order):
   - [ ] P1 systems restored
   - [ ] P2 systems restored
   - [ ] P3 systems restored
2. For each system:
   - Restoration method (rebuild/restore from backup)
   - Timestamp
   - Validation tests performed
   - Approved for production
3. Service resumption:
   - Service name
   - Dependencies verified
   - Functional testing passed
   - Security validation passed
   - Approved for users
4. Enhanced monitoring setup:
   - What's being monitored
   - Alert thresholds
   - Monitoring duration (e.g., 7 days)
5. Business operations resumed confirmation
6. Append to Recovery Status section
7. Add timeline entry: "Recovery complete - operations resumed"
8. Update stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]

**Interaction:** Checklist with P/C menu

**Outputs:**
- Recovery actions logged
- Systems/services restored
- Validation documented
- Timeline updated

---

#### **Step 08b: Post-Incident Report Generation**

**Goal:** Generate complete incident report with lessons learned and follow-up actions

**Flow:**
1. Post-incident analysis:
   - What worked well?
   - What could be improved?
   - Unexpected challenges?
   - Response time analysis
2. Effectiveness evaluation:
   - Detection effectiveness
   - Containment effectiveness
   - Communication effectiveness
   - Tool effectiveness
3. Recommendations:
   - Technical improvements
   - Process improvements
   - Training needs
   - Tool/capability gaps
4. Follow-up actions (with owners and due dates):
   - Patch remaining systems
   - Update detection rules
   - Improve monitoring
   - Update playbooks
   - Conduct training
5. Compliance check:
   - Regulatory notifications sent? (GDPR, PCI-DSS, HIPAA)
   - Customer notifications sent?
   - Insurance claim filed?
6. Financial impact calculation:
   - Direct costs (IR, forensics, legal)
   - Indirect costs (downtime, lost revenue)
   - Total estimated cost
7. Append to Post-Incident Analysis section
8. Add document control and approval signatures
9. Mark workflow complete: stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b, 8b]
10. Set workflowComplete: true in frontmatter
11. Close sidecar file with final timestamp
12. Display success message with report location

**Interaction:** P/C menu for final review, then completion

**Outputs:**
- Complete incident response report
- Lessons learned documented
- Follow-up actions assigned
- Incident formally closed
- Report ready for stakeholders

---

### Data Flow Design

**Mode A (Playbook Creation):**
1. User input → Organizational context, procedures, tools
2. Collaborative discussion → Refined procedures
3. Section-by-section building → Cumulative playbook document
4. Frontmatter tracking → stepsCompleted array
5. Optional tools → Brainstorming, Party Mode, Advanced Elicitation
6. Web-Browsing → Current threat intel, CVEs, compliance requirements
7. Final output → Complete playbook markdown document

**Mode B (Guided Execution):**
1. Incident details → Triage classification
2. Real-time actions → Timestamped logging to sidecar
3. Evidence collection → Chain of custody documentation
4. Analysis → MITRE ATT&CK mapping
5. Continuous updates → Incident report sections
6. Sidecar file → Persistent state across sessions
7. Timeline → Chronological event log
8. Web-Browsing → IOC lookups, threat intelligence
9. Party Mode → Expert consultation (Cipher, Trace, Bastion)
10. Final output → Complete incident report + sidecar timeline

---

### Role and Persona Definition

**Mode A (Playbook Creation):**
- **Role:** Incident Response Planning Consultant
- **Expertise:** NIST IR framework, industry best practices, compliance requirements
- **Tone:** Collaborative, consultative, adaptable to organization's maturity
- **Style:** Intent-based guidance, open-ended questions, iterative refinement
- **Communication:** "Let's explore...", "What works best for your team...", "Consider..."

**Mode B (Guided Execution):**
- **Role:** Incident Commander / IR Technical Lead
- **Expertise:** Real-time crisis management, forensic procedures, containment tactics
- **Tone:** Calm, directive, confidence-building during crisis
- **Style:** Prescriptive steps, checklists, rapid decision support
- **Communication:** "Execute these steps:", "Confirm completion:", "Next action:"

---

### Validation and Error Handling

**Validation Checkpoints:**

**Mode A:**
- Each step validates section completeness before proceeding
- Final step validates all 8 sections present
- Advanced Elicitation available for quality review
- User confirmation required before finalizing

**Mode B:**
- Severity classification validation (must select Critical/High/Medium/Low)
- Containment confirmation checklist (all items checked)
- Evidence chain of custody complete (no gaps)
- Eradication validation (forensic scan clean)
- Recovery validation (functional and security tests passed)
- Timeline continuity (no missing timestamps)

**Error Handling:**

- Invalid incident type → Re-prompt with valid options
- Missing required fields → Highlight and request completion
- Incomplete checklists → Show remaining items
- Continuation errors → Gracefully resume from last valid step
- Sidecar file corruption → Reconstruct from report document

---

### Success Criteria

**Mode A Success:**
- All 8 playbook sections complete
- Procedures are actionable (not theoretical)
- Tool-specific commands included
- Compliance requirements addressed
- Communication templates ready
- Document control complete
- workflowComplete: true

**Mode B Success:**
- Incident properly classified and triaged
- All containment actions executed and validated
- Evidence preserved with chain of custody
- Root cause identified and documented
- Eradication validated (clean system)
- Systems/services fully recovered
- Stakeholders notified per requirements
- Complete incident report with lessons learned
- workflowComplete: true

---

### Special Features

1. **Dual-Mode Branching:** Unique pattern - single initialization routes to two distinct workflows
2. **Real-Time Updates:** Mode B updates incident report continuously (not just at end)
3. **Sidecar File:** Critical for Mode B - preserves incident state across multi-day response
4. **MITRE ATT&CK Integration:** Automatic technique mapping in Mode B analysis
5. **Compliance Awareness:** Built-in GDPR, PCI-DSS, HIPAA notification tracking
6. **Playbook Integration:** Mode B can reference existing playbooks created in Mode A
7. **Chain of Custody:** Forensic-quality evidence tracking in Mode B
8. **Multi-Session Support:** Both modes support pause/resume via continuation logic
9. **Expert Collaboration:** Party Mode access to Cipher (threat intel), Trace (forensics), Bastion (architecture)
10. **Timestamped Actions:** Mode B logs precise timestamps for all response actions (legal/compliance requirement)
