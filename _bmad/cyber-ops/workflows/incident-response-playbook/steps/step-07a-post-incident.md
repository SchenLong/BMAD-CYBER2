---
name: 'step-07a-post-incident'
description: 'Define post-incident activities including lessons learned, documentation requirements, communication plans, and process improvements'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-07a-post-incident.md'
nextStepFile: '{workflow_path}/steps/step-08a-generate-playbook.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7A: Post-Incident Activities

## STEP GOAL:

To define comprehensive post-incident activities including lessons learned session procedures, documentation requirements, communication plans, regulatory notification timelines, and process improvement actions for {incident-type} incidents.

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

- 🎯 Focus ONLY on post-incident activities and lessons learned
- 🚫 FORBIDDEN to start generating the final playbook (that's step 8a)
- 💬 Guide through conversational exploration of post-incident needs
- 🌐 Web-Browsing ENCOURAGED for regulatory requirements (GDPR, PCI-DSS, HIPAA)

## EXECUTION PROTOCOLS:

- 🎯 Leverage all previous sections (entire incident lifecycle documented)
- 💾 Append to Section 6 (Post-Incident Activities) AND Section 7 (Communication Plan) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Recovery complete in step 6a
- Focus on learning, documentation, communication, and improvement
- Don't generate the final playbook yet (that's step 8a)
- Post-incident activities ensure organization learns and improves

## POST-INCIDENT PROCEDURE SEQUENCE:

### 1. Review Context

Display:

"**Post-Incident Activities for {incident-type}**

Systems are recovered and operations are normal (Section 5). Now we conduct post-incident activities to learn and improve.

**NIST Post-Incident Phase Goals:**
1. **Lessons Learned:** What worked? What didn't? How do we improve?
2. **Documentation:** Complete timeline, final report, evidence preservation
3. **Communication:** Internal stakeholders, external notifications (customers, regulators, media)
4. **Improvement:** Action items to prevent recurrence and improve response

**From Organizational Context (Section 1):**
- Regulatory Requirements: {regulations-from-section-1}
- Communication Channels: {channels-from-section-1}

Let's design your post-incident procedures."

### 2. Lessons Learned Session

Engage in conversation:

"**Lessons Learned Session for {incident-type}**

The lessons learned session is the most valuable post-incident activity. Done well, it prevents future incidents and improves response capabilities.

**Session Logistics:**

**Timing:**
- When: {timeframe-e.g.-within-2-weeks-of-return-to-normal}
- Why not immediate: Allow time for emotions to settle and data to be compiled

**Duration:**
- Recommended: {duration-e.g.-2-4-hours}

**Facilitator:**
- Who: {role-ideally-someone-not-directly-involved}
- Role: Keep discussion constructive, ensure all voices heard, maintain focus

**Participants:**
- Required:
  - IR Team members
  - SOC analysts involved
  - IT Operations staff involved
  - Security leadership
  - Affected business unit representatives
  - {others-based-on-incident}
- Optional:
  - External forensics team (if used)
  - Legal (if involved)
  - PR/Communications (if involved)

**Session Structure:**

I'll help you design the lessons learned session framework. We'll use a structured approach to ensure productive discussion.

**1. Incident Timeline Review (30 minutes):**
- Present complete timeline from detection through recovery
- Ensure all participants understand what happened
- Clarify any confusion or information gaps

**2. What Worked Well (30 minutes):**
Identify strengths to maintain and celebrate:
- What processes worked effectively?
- What tools proved valuable?
- What decisions were correct?
- Which team members/teams performed well?
- What can we replicate in future incidents?

**3. What Could Be Improved (60 minutes):**
Identify gaps and opportunities (NO BLAME):
- What processes slowed us down?
- What tools failed or were missing?
- What information was unavailable when needed?
- What decisions could have been better?
- What communication breakdowns occurred?
- What training gaps were identified?

**4. Root Cause of Response Issues (30 minutes):**
For each improvement area, ask:
- **People:** Skill gap? Availability? Authority?
- **Process:** Process didn't exist? Unclear? Not followed?
- **Technology:** Tool didn't exist? Not configured? Failed?

**5. Action Items (30 minutes):**
For each improvement area, create action item:
- What: Specific action to take
- Who: Owner (by name)
- When: Target completion date
- Why: Expected improvement

**Lessons Learned Questions for {incident-type}:**

Let's brainstorm specific questions for your lessons learned session:

**Detection:**
- How long between compromise and detection? Why the delay?
- What alerted us? (user report, automated detection, external notification)
- Could we have detected sooner? What would enable earlier detection?

**Analysis:**
- Was initial severity assessment accurate?
- Did we have the right information to triage effectively?
- What forensic capabilities were missing?

**Containment:**
- Did containment actions work as planned?
- Were any containment actions rolled back? Why?
- Did we contain fast enough?

**Eradication:**
- Was eradication complete on first attempt?
- Did we miss any persistence mechanisms initially?
- Were the right tools available?

**Recovery:**
- Did systems restore as expected?
- Were backups available and clean?
- Were any recovery attempts unsuccessful?

**Communication:**
- Did the right people get notified at the right time?
- Were communication channels effective?
- Did users have the information they needed?

For your organization, what additional questions should be asked about {incident-type} response?"

### 3. Documentation Requirements

"**Post-Incident Documentation for {incident-type}**

Complete documentation serves multiple purposes: legal protection, compliance, lessons learned, training material.

**Required Documentation:**

**1. Final Incident Report:**
- **Audience:** Executive leadership, legal, compliance, insurance
- **Content:**
  - Executive summary (1 page, non-technical)
  - Incident overview (type, severity, timeline)
  - Impact analysis (systems, data, users, business, financial)
  - Response summary (containment, eradication, recovery)
  - Root cause analysis
  - Lessons learned summary
  - Action items for improvement
- **Completion:** Within {timeframe-e.g.-30-days-of-recovery}
- **Owner:** {role-e.g.-IR-team-lead-or-CISO}

**2. Technical Incident Report:**
- **Audience:** Security team, IT operations, forensics team
- **Content:**
  - Complete technical timeline
  - IOCs (all artifacts)
  - Attack methodology (MITRE ATT&CK mapping)
  - Forensic findings
  - All actions taken (containment, eradication, recovery)
  - Evidence inventory
  - Validation results
- **Completion:** Within {timeframe-e.g.-45-days}
- **Owner:** {role-e.g.-IR-analyst}

**3. Lessons Learned Report:**
- **Audience:** All IR stakeholders
- **Content:**
  - Session summary
  - What worked well
  - What could be improved
  - Action items with owners and due dates
  - Follow-up plan
- **Completion:** Within {timeframe-e.g.-1-week-of-session}
- **Owner:** {session-facilitator}

**4. Evidence Preservation:**
- **What to Preserve:**
  - Memory dumps
  - Disk images
  - Log files
  - Network captures
  - Malware samples
  - Screenshots
  - Email trails
  - Chat transcripts
  - Chain of custody documentation
- **Retention Period:**
  - Legal requirement: {duration-based-on-regulations}
  - Recommended: {duration-e.g.-minimum-7-years}
- **Storage:**
  - Location: {secure-storage-location}
  - Access control: {who-can-access}
  - Encryption: {encryption-requirements}
- **Chain of Custody:**
  - Document: Who collected, when, where, hash values
  - Format: {chain-of-custody-form}

**5. Regulatory Documentation (if applicable):**
- GDPR: Breach notification documentation (72 hours)
- PCI-DSS: Incident response documentation, forensic report
- HIPAA: Breach analysis, notification documentation
- SOX: Incident impact on financial controls
- State breach laws: Notification documentation

Would you like me to use **Web-Browsing** to research specific regulatory documentation requirements for {regulations-from-section-1}?

**Documentation Repository:**
- Where: {location-e.g.-SharePoint-Confluence-case-management-system}
- Access control: {who-has-access}
- Retention policy: {duration}
- Review schedule: {frequency-e.g.-annually}"

### 4. Communication Plan

"**Post-Incident Communication Plan**

Different audiences need different information at different times.

**Internal Communication:**

**1. Executive Leadership:**
- **When:** {timeframe-e.g.-within-24-hours-of-return-to-normal}
- **Method:** {method-e.g.-executive-summary-board-presentation}
- **Content:**
  - Business impact summary
  - Financial impact (if known)
  - Response actions taken
  - Customer/partner impact
  - Reputational risk
  - Regulatory obligations
  - Action items and investment needs
- **Owner:** {CISO-or-CIO}

**2. All Staff:**
- **When:** {timeframe-e.g.-within-1-week-of-resolution}
- **Method:** {method-e.g.-company-wide-email-town-hall}
- **Content:**
  - What happened (high-level, non-technical)
  - How it was resolved
  - User actions needed (password resets, MFA enrollment, etc.)
  - How to report suspicious activity
  - Assurance that systems are secure
- **Owner:** {CISO-or-communications}

**3. Affected Users:**
- **When:** {timeframe-e.g.-as-soon-as-systems-recovered}
- **Method:** {method-e.g.-targeted-email-helpdesk-announcement}
- **Content:**
  - Systems are back online
  - Any actions required (password reset, data verification)
  - Where to get help
  - What to expect (monitoring, security changes)
- **Owner:** {IT-operations-or-helpdesk}

**External Communication:**

**4. Customers (if data exposure suspected):**
- **When:** Based on regulatory requirements (e.g., GDPR 72 hours)
- **Method:** {method-e.g.-email-portal-notification-letter}
- **Content:**
  - What happened
  - What data was affected
  - What we're doing about it
  - What customers should do (credit monitoring, password changes)
  - Contact information for questions
  - Apology and assurance
- **Owner:** {legal-communications-ciso}
- **Legal Review:** REQUIRED before sending

**5. Regulators (if required):**
- **When:**
  - GDPR: 72 hours of becoming aware
  - PCI-DSS: Immediately (acquirer/card brands)
  - HIPAA: 60 days for affected individuals, HHS
  - State breach laws: {varies-by-state}
- **Method:** {method-per-regulator-requirements}
- **Content:** {per-regulator-requirements}
- **Owner:** {legal-compliance}

**6. Media (if public incident):**
- **When:** {decision-based-on-PR-strategy}
- **Method:** {press-release-media-briefing}
- **Content:**
  - Prepared statement
  - Q&A for spokesperson
  - Consistent messaging
- **Owner:** {PR-communications}
- **Spokesperson:** {designated-person-usually-CEO-or-CISO}

**7. Partners/Vendors (if affected or involved):**
- **When:** {timeframe-e.g.-within-48-hours-of-discovery}
- **Method:** {method-e.g.-email-phone-call}
- **Content:**
  - Incident overview
  - Partner impact
  - Actions needed from partner
  - Coordination contact
- **Owner:** {business-relationship-owner}

**8. Cyber Insurance:**
- **When:** {timeframe-e.g.-within-24-hours-per-policy}
- **Method:** {method-per-policy-requirements}
- **Content:**
  - Incident notification
  - Preliminary impact assessment
  - Response costs (forensics, legal, notification)
- **Owner:** {legal-or-cfo}

**Communication Decision Tree:**

Let's create a decision tree for external notifications:

**Did incident involve:**
- Personal data (PII/PHI)? → Likely customer + regulator notification
- Payment card data? → PCI-DSS notification required
- Protected health information? → HIPAA notification required
- EU residents' data? → GDPR notification within 72 hours
- Financial data? → May require SEC notification

**Was there data exfiltration?**
- Confirmed exfiltration → Mandatory notifications
- Suspected but not confirmed → {decision-criteria}
- No exfiltration → {optional-notification-based-on}

For {incident-type}, what's your notification decision matrix?"

### 5. Regulatory Notification Timelines

"**Regulatory Notification Requirements**

Missing notification deadlines can result in fines.

**GDPR (if processing EU resident data):**
- **Notification to DPA:** 72 hours of becoming aware of breach
- **Content:** Nature of breach, categories and numbers of individuals affected, contact point, likely consequences, measures taken
- **Notification to Individuals:** Without undue delay if high risk
- **Penalty for non-compliance:** Up to €20 million or 4% of global revenue

**PCI-DSS (if processing payment cards):**
- **Notification to Acquirer:** Immediately upon discovery
- **Notification to Card Brands:** {varies-by-brand-typically-immediately}
- **Notification to Affected Individuals:** Per state/federal law
- **Forensic Investigation:** PFI-required (PCI Forensic Investigator)

**HIPAA (if protected health information):**
- **Notification to Individuals:** 60 days of discovery
- **Notification to HHS:** 60 days if > 500 individuals; annually if < 500
- **Notification to Media:** If > 500 residents of a state
- **Penalty for non-compliance:** Up to $1.5 million per violation category per year

**State Breach Notification Laws (US):**
- **Varies by state:** Most require \"without unreasonable delay\"
- **California:** Without unreasonable delay (court precedent ~2 weeks)
- **New York:** Without unreasonable delay
- **{other-states-applicable-to-your-organization}**

**Other Regulations:**
- **SOX (if public company):** Material cybersecurity incidents disclosed in SEC filings
- **SEC (if public company):** 4 business days from determination of materiality
- **Industry-specific:** {any-industry-regulations}

Would you like me to use **Web-Browsing** to research current notification requirements for {regulations-from-section-1}?

**Notification Timeline Tracker (for during incident):**

Create a tracking document:
| Regulation | Notification Deadline | Calculated Date | Notification Status | Owner |
|------------|----------------------|-----------------|---------------------|-------|
| GDPR DPA | 72 hours from awareness | {calculated} | Not started / In progress / Complete | {name} |
| GDPR Individuals | Without undue delay | {calculated} | | {name} |
| PCI-DSS | Immediate | {calculated} | | {name} |
| State Laws | {requirement} | {calculated} | | {name} |"

### 6. Process Improvement Actions

"**Process Improvement for {incident-type}**

Lessons learned are useless without action. Let's define how to track and implement improvements.

**Action Item Framework:**

For each improvement identified in lessons learned:

**Action Item Template:**
1. **Finding:** What issue or gap was identified?
2. **Impact:** How did this affect the incident response?
3. **Action:** What specific action will address this?
4. **Owner:** Who is responsible? (name, not just role)
5. **Due Date:** When will this be completed?
6. **Success Criteria:** How will we know it's done and effective?
7. **Priority:** Critical / High / Medium / Low
8. **Resources Required:** Budget, tools, people
9. **Status:** Not started / In progress / Complete / Blocked

**Common Improvement Categories:**

Let's think through common improvement areas for {incident-type}:

**1. Detection Improvements:**
- New SIEM rules or correlation?
- Additional log sources?
- Enhanced monitoring?
- Threat intelligence integration?

**2. Prevention Improvements:**
- Patching process improvements?
- Configuration hardening?
- Network segmentation?
- Security control additions?

**3. Response Process Improvements:**
- Playbook updates?
- Role clarifications?
- Decision authority changes?
- Communication improvements?

**4. Tool/Technology Improvements:**
- New tools needed?
- Existing tool enhancements?
- Integration improvements?
- Automation opportunities?

**5. People/Training Improvements:**
- Additional headcount?
- Training needed (technical, process)?
- Tabletop exercises?
- Red team/purple team testing?

**6. Documentation Improvements:**
- Playbook gaps?
- Runbook needs?
- Decision trees?
- Contact lists?

For {incident-type}, what are the most likely improvement categories?

**Action Item Tracking:**
- **Tool:** {tool-e.g.-Jira-ServiceNow-Excel}
- **Review Frequency:** {frequency-e.g.-monthly}
- **Review Forum:** {meeting-e.g.-security-leadership-meeting}
- **Accountability:** {who-drives-completion}

**Investment Justification:**
Some action items require budget. How to build business case:
- Quantify incident cost: {response-cost-plus-business-impact}
- Estimate reduction in likelihood or impact with improvement
- Calculate ROI
- Present to: {decision-maker}"

### 7. Document Post-Incident Activities

Append to Section 6 and Section 7 in output file:

```markdown
## 6. Post-Incident Activities

### 6.1 Lessons Learned Session

**Conduct lessons learned session within {timeframe-e.g.-2-weeks} of return to normal operations.**

**Session Logistics:**
- **Timing:** {timeframe} after return to normal
- **Duration:** {duration-e.g.-2-4-hours}
- **Facilitator:** {role-name-if-identified}
- **Location:** {physical-or-virtual}

**Required Participants:**
- IR Team members
- SOC analysts involved
- IT Operations staff involved
- Security leadership ({CISO-security-managers})
- Affected business unit representatives: {list}
- {others}

**Optional Participants:**
- External forensics team (if used)
- Legal (if involved)
- PR/Communications (if involved)

**Session Agenda:**

**1. Incident Timeline Review (30 min):**
- Present complete timeline from detection through recovery
- Clarify any confusion
- Ensure common understanding

**2. What Worked Well (30 min):**
Identify strengths to maintain:
- Effective processes
- Valuable tools
- Correct decisions
- Strong team performance

**3. What Could Be Improved (60 min):**
Identify gaps (NO BLAME):
- Process slowdowns
- Tool failures or gaps
- Information unavailability
- Decision improvements
- Communication breakdowns
- Training gaps

**4. Root Cause of Response Issues (30 min):**
For each improvement area:
- People issue? (skill, availability, authority)
- Process issue? (nonexistent, unclear, not followed)
- Technology issue? (missing, misconfigured, failed)

**5. Action Items (30 min):**
For each improvement:
- What: Specific action
- Who: Owner by name
- When: Target completion date
- Why: Expected improvement

**Lessons Learned Questions for {incident-type}:**

**Detection:**
- Dwell time: How long between compromise and detection? Why?
- Alert source: What alerted us? (user, automated, external)
- Earlier detection: Could we have detected sooner? How?

**Analysis:**
- Severity assessment: Was initial assessment accurate?
- Triage effectiveness: Did we have the right information?
- Forensic capabilities: What was missing?

**Containment:**
- Containment effectiveness: Did actions work as planned?
- Rollbacks: Were any actions rolled back? Why?
- Containment speed: Fast enough? What slowed us down?

**Eradication:**
- Eradication completeness: Complete on first attempt?
- Persistence mechanisms: Did we miss any initially?
- Tool availability: Were the right tools available?

**Recovery:**
- Restoration success: Did systems restore as expected?
- Backup availability: Were backups available and clean?
- Recovery failures: Any unsuccessful attempts?

**Communication:**
- Notification timeliness: Right people notified at right time?
- Channel effectiveness: Were communication channels effective?
- User information: Did users have needed information?

**{Additional-questions-specific-to-organization}**

**Session Output:**
- Documented findings (what worked, what didn't)
- Action item list with owners and dates
- Lessons learned report (see Section 6.2)

### 6.2 Documentation Requirements

**All post-incident documentation must be completed per timelines below.**

**1. Final Incident Report (Executive):**
- **Audience:** Executive leadership, board, legal, compliance, insurance
- **Owner:** {role-e.g.-CISO}
- **Due:** Within {timeframe-e.g.-30-days} of return to normal
- **Content:**
  - Executive summary (1 page, non-technical)
  - Incident overview (type, severity, timeline)
  - Impact analysis:
    - Systems affected
    - Data affected
    - Users affected
    - Business impact
    - Financial impact
  - Response summary (containment, eradication, recovery)
  - Root cause analysis (from Section 4.1)
  - Lessons learned summary (from Section 6.1)
  - Action items for improvement (from Section 6.3)
- **Distribution:** {list-recipients}
- **Storage:** {location}

**2. Technical Incident Report:**
- **Audience:** Security team, IT operations, forensics
- **Owner:** {role-e.g.-IR-analyst}
- **Due:** Within {timeframe-e.g.-45-days}
- **Content:**
  - Complete technical timeline
  - IOCs (all artifacts from Section 2.1)
  - Attack methodology (MITRE ATT&CK mapping)
  - Forensic findings
  - All actions taken (Sections 3, 4, 5)
  - Evidence inventory (Section 6.2.4)
  - Validation results (Sections 4.5, 5.4)
- **Distribution:** {list-recipients}
- **Storage:** {location}

**3. Lessons Learned Report:**
- **Audience:** All IR stakeholders
- **Owner:** {session-facilitator}
- **Due:** Within {timeframe-e.g.-1-week} of session
- **Content:**
  - Session summary
  - Participants
  - What worked well
  - What could be improved
  - Action items with owners and due dates (Section 6.3)
  - Follow-up plan
- **Distribution:** {all-session-participants-plus-management}
- **Storage:** {location}

**4. Evidence Preservation:**

**What to Preserve:**
- Memory dumps
- Disk images
- Log files (SIEM, EDR, firewall, authentication, application)
- Network captures (PCAP files)
- Malware samples (in secure container)
- Screenshots of malicious activity
- Email trails
- Chat transcripts (incident response coordination)
- Chain of custody documentation

**Retention Period:**
- Legal requirement: {duration-based-on-regulations}
- Recommended minimum: {duration-e.g.-7-years}

**Storage:**
- Location: {secure-storage-location}
- Access control: {who-can-access}
- Encryption: {encryption-requirements-e.g.-AES-256}
- Backup: {backup-frequency-and-location}

**Chain of Custody:**
- Documentation required: Who collected, when, where, hash values (SHA-256)
- Form: {chain-of-custody-form-template-location}
- Responsibility: {role-e.g.-forensic-analyst}

**5. Regulatory Documentation (if applicable):**

- **GDPR:**
  - Breach notification to DPA
  - Notification to affected individuals (if required)
  - Documentation of breach, impact, and response
  - Retention: {duration-per-GDPR-requirements}

- **PCI-DSS:**
  - Incident response documentation
  - Forensic investigation report (by PFI)
  - Notification documentation (acquirer, card brands)
  - Retention: {duration}

- **HIPAA:**
  - Breach analysis documentation
  - Notification documentation (individuals, HHS, media)
  - Retention: 6 years

- **{Other-regulations}:**
  - {requirements}

**Documentation Repository:**
- Location: {e.g.-SharePoint-Confluence-case-management-system}
- Access control: {who-has-access}
- Retention policy: {duration}
- Review schedule: {frequency-e.g.-annually}

### 6.3 Process Improvement Action Items

**Track and implement improvements identified in lessons learned.**

**Action Item Tracking:**
- Tool: {e.g.-Jira-ServiceNow-Excel}
- Review frequency: {e.g.-monthly-in-security-leadership-meeting}
- Accountability: {role-driving-completion}

**Action Item Template:**

For each improvement identified:

| Finding | Impact | Action | Owner | Due Date | Priority | Status | Success Criteria |
|---------|--------|--------|-------|----------|----------|--------|------------------|
| {finding} | {impact} | {action} | {name} | {date} | {priority} | {status} | {criteria} |

**Common Improvement Categories:**

**Detection Improvements:**
- {specific-actions-from-lessons-learned}

**Prevention Improvements:**
- {specific-actions}

**Response Process Improvements:**
- {specific-actions}

**Tool/Technology Improvements:**
- {specific-actions}

**People/Training Improvements:**
- {specific-actions}

**Documentation Improvements:**
- {specific-actions}

**Investment Requirements:**
- Budget needed: {amount}
- Justification: {incident-cost-vs-improvement-cost}
- Approval: {decision-maker}

**Follow-Up:**
- Action items reviewed {frequency} in {meeting}
- Completion target: {timeframe-e.g.-90-days-for-critical-items}
- Accountability: {role-reports-on-progress}

## 7. Communication Plan

### 7.1 Internal Communication

**Executive Leadership:**
- **When:** Within {timeframe-e.g.-24-hours} of return to normal
- **Method:** {executive-summary-and-or-board-presentation}
- **Content:**
  - Business impact summary
  - Financial impact
  - Response actions taken
  - Customer/partner impact
  - Reputational risk
  - Regulatory obligations
  - Action items and investment needs
- **Owner:** {CISO}
- **Audience:** {CEO-CIO-CFO-board}

**All Staff:**
- **When:** Within {timeframe-e.g.-1-week} of resolution
- **Method:** {company-wide-email-or-town-hall}
- **Content:**
  - What happened (high-level, non-technical)
  - How it was resolved
  - User actions needed (password resets, MFA, etc.)
  - How to report suspicious activity
  - Assurance that systems are secure
- **Owner:** {CISO-or-communications}
- **Audience:** All employees

**Affected Users:**
- **When:** As soon as systems recovered
- **Method:** {targeted-email-helpdesk-announcement}
- **Content:**
  - Systems are back online
  - Any actions required (password reset, data verification)
  - Where to get help
  - What to expect (monitoring, security changes)
- **Owner:** {IT-operations}
- **Audience:** {affected-users-or-departments}

### 7.2 External Communication

**Customers (if data exposure):**
- **When:** Per regulatory requirements (GDPR: 72 hours; State laws: varies)
- **Method:** {email-portal-notification-postal-letter}
- **Content:**
  - What happened
  - What data was affected
  - What we're doing about it
  - What customers should do (credit monitoring, password changes)
  - Contact information for questions
  - Apology and assurance
- **Legal Review:** REQUIRED before sending
- **Owner:** {legal-communications-CISO}
- **Audience:** Affected customers

**Regulators (if required):**

- **GDPR (EU data):**
  - When: 72 hours of becoming aware
  - Method: {DPA-notification-portal}
  - Content: {per-GDPR-requirements}
  - Owner: {legal-compliance}

- **PCI-DSS (payment card data):**
  - When: Immediately upon discovery
  - Method: {per-acquirer-requirements}
  - Content: Incident details, forensic investigation plan
  - Owner: {legal-compliance}

- **HIPAA (health data):**
  - When: 60 days for individuals; varies for HHS/media
  - Method: {per-HIPAA-requirements}
  - Content: {breach-notification-format}
  - Owner: {legal-compliance}

- **State Breach Laws:**
  - When: {varies-by-state-without-unreasonable-delay}
  - Method: {per-state-requirements}
  - Content: {per-state-requirements}
  - Owner: {legal}

**Media (if public incident):**
- **When:** {decision-based-on-PR-strategy}
- **Method:** {press-release-or-media-briefing}
- **Content:**
  - Prepared statement
  - Q&A for spokesperson
  - Consistent messaging
- **Owner:** {PR-communications}
- **Spokesperson:** {CEO-or-CISO}

**Partners/Vendors (if affected):**
- **When:** Within {timeframe-e.g.-48-hours} of discovery
- **Method:** {direct-communication-email-phone}
- **Content:**
  - Incident overview
  - Partner impact
  - Actions needed from partner
  - Coordination contact
- **Owner:** {business-relationship-owner}

**Cyber Insurance:**
- **When:** Per policy requirements (typically within 24 hours)
- **Method:** {per-policy}
- **Content:**
  - Incident notification
  - Preliminary impact assessment
  - Response costs (forensics, legal, notification)
- **Owner:** {legal-or-CFO}

### 7.3 Communication Decision Matrix

**Use this decision tree to determine external notifications:**

**Data Involved:**
- Personal data (PII/PHI)? → Likely customer + regulator notification
- Payment card data? → PCI-DSS notification REQUIRED
- Protected health information? → HIPAA notification REQUIRED
- EU residents' data? → GDPR notification within 72 hours
- Financial data? → May require SEC notification (if material)

**Data Exfiltration:**
- Confirmed exfiltration → Mandatory notifications per regulations
- Suspected but not confirmed → {decision-criteria}
- No exfiltration → {optional-notification-based-on-legal-advice}

**Notification Timeline Tracker (use during incident):**

| Regulation | Notification Deadline | Awareness Date | Calculated Deadline Date | Notification Sent Date | Status | Owner |
|------------|----------------------|----------------|-------------------------|----------------------|--------|-------|
| GDPR DPA | 72 hours from awareness | {date} | {calculated} | {date} | {status} | {name} |
| GDPR Individuals | Without undue delay | {date} | {calculated} | {date} | {status} | {name} |
| PCI-DSS Acquirer | Immediate | {date} | {immediate} | {date} | {status} | {name} |
| State Laws | {requirement} | {date} | {calculated} | {date} | {status} | {name} |
| {Other} | {requirement} | {date} | {calculated} | {date} | {status} | {name} |

**Communication Approval Workflow:**
1. Draft notification: {owner}
2. Legal review: {legal-contact}
3. Leadership approval: {CISO-CEO}
4. Distribution: {owner}
5. Documentation: Store in {location}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a]
lastUpdated: '{timestamp}'
```

### 8. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [W] Web-Browsing [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "comprehensiveness of post-incident procedures and communication plans"
- IF P: Execute {partyModeWorkflow} - User can select any expert for consultation
- IF W: Offer web search options:
  - GDPR breach notification requirements
  - PCI-DSS incident response requirements
  - HIPAA breach notification requirements
  - State breach notification laws ({specific-states})
  - Post-incident best practices
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Sections 6 & 7 are complete will you load, read entire file, then execute `{nextStepFile}` to finalize the playbook with appendices and document control.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Lessons learned session structure comprehensive and actionable
- Documentation requirements complete with retention and storage
- Communication plan covers all stakeholders (internal and external)
- Regulatory notification timelines accurate and complete
- Process improvement action item framework defined
- Sections 6 & 7 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- No lessons learned session structure (missing critical learning opportunity)
- Missing regulatory notification timelines (compliance risk)
- Incomplete communication plan (stakeholder confusion)
- No action item tracking framework (improvements won't happen)
- Starting to generate final playbook (belongs in step 8a)
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
