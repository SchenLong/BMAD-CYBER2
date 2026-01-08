---
name: 'step-08a-generate-playbook'
description: 'Finalize playbook with appendices, document control, and quality review before completion'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-08a-generate-playbook.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 8A: Generate Final Playbook

## STEP GOAL:

To finalize the incident response playbook by adding appendices, document control information, conducting a final quality review, and marking the workflow as complete.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: This is the FINAL step - mark workflowComplete after this
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

- 🎯 Focus ONLY on finalizing the playbook with appendices and document control
- 🚫 This is the LAST step - no next step file to load
- 💬 Conduct thorough quality review with user
- ✅ Mark workflowComplete: true when done

## EXECUTION PROTOCOLS:

- 🎯 All 7 main sections complete (Sections 1-7 from previous steps)
- 💾 Append Section 8 (Appendices) to output file
- 📖 Update frontmatter with final metadata and workflowComplete: true
- 🎉 This step completes the playbook creation workflow

## CONTEXT BOUNDARIES:

- All procedural sections complete (detection, containment, eradication, recovery, post-incident)
- Focus on appendices, references, and document control
- Final quality review before declaring complete
- This playbook will be used during real incidents

## PLAYBOOK FINALIZATION SEQUENCE:

### 1. Review Playbook Status

Display:

"**Finalizing {incident-type} Incident Response Playbook**

Congratulations! We've completed all 7 procedural sections of your playbook:
- ✅ Section 1: Incident Overview and Organizational Context
- ✅ Section 2: Detection & Analysis Procedures
- ✅ Section 3: Containment Procedures
- ✅ Section 4: Eradication Steps
- ✅ Section 5: Recovery Procedures
- ✅ Section 6: Post-Incident Activities
- ✅ Section 7: Communication Plan

Now we'll finalize the playbook with:
- Section 8: Appendices (commands, contacts, checklists, compliance)
- Document Control (version history, review schedule, approval)
- Final quality review

Let's complete your playbook."

### 2. Create Appendices

Engage in conversation:

"**Appendices for Quick Reference**

Appendices provide quick reference material for responders during an incident.

**Appendix A: Command Reference**

This should be a comprehensive command cheat sheet for your tools.

From the previous sections, we documented commands for:
- {edr-platform} (Sections 3, 4, 5)
- {siem-platform} (Sections 2, 3)
- {firewall-platform} (Section 3)
- Active Directory (Sections 3, 4)
- Cloud platforms (if applicable) (Sections 3, 4)

I'll compile all commands from the playbook into Appendix A for quick reference.

**Appendix B: Contact Information**

Who needs to be contacted during a {incident-type} incident?

**Internal Contacts:**
- IR Team Lead: {name, phone, email}
- SOC Manager: {contact-info}
- CISO: {contact-info}
- IT Director: {contact-info}
- Network Security Team: {contact-info}
- System Administrators: {contact-info}
- Legal: {contact-info}
- HR: {contact-info}
- Communications/PR: {contact-info}
- Executive Leadership: {contact-info}

**External Contacts:**
- Forensics Firm: {company, contact, phone, email}
- Legal Counsel (external): {firm, contact-info}
- Cyber Insurance: {company, policy-number, contact}
- FBI Cyber Division: {local-field-office-contact}
- Local Law Enforcement: {contact-if-appropriate}
- ISAC/Information Sharing: {organization-contact}

**Vendor Contacts:**
- {edr-vendor}: Support phone, account manager
- {siem-vendor}: Support phone, account manager
- {forensics-tool-vendor}: Support contact
- {cloud-provider}: Support contact
- {other-critical-vendors}

**Regulatory Contacts:**
- GDPR DPA: {contact-if-applicable}
- PCI-DSS Acquirer: {contact-if-applicable}
- State Attorney General: {contacts-for-breach-notification}

Let me know the contact information for your organization, or we can leave placeholders for you to fill in later.

**Appendix C: Incident Response Checklists**

Quick checklists for common scenarios:

**Initial Triage Checklist (from Section 2.4):**
I'll extract the initial assessment checklist from Section 2.

**Containment Quick Actions (from Section 3):**
I'll create a 1-page quick reference for containment actions.

**Eradication Validation Checklist (from Section 4.5):**
I'll extract the validation checklist for easy reference.

**Recovery Validation Checklist (from Section 5.4):**
I'll extract the recovery validation checklist.

**Appendix D: Compliance and Regulatory Quick Reference**

For {incident-type}, here are the regulatory obligations:

**Notification Timelines:**
- GDPR: 72 hours to DPA
- PCI-DSS: Immediate to acquirer
- HIPAA: 60 days to individuals
- State laws: {varies-by-state}

**Required Documentation:**
- Breach analysis
- Timeline of events
- Affected individuals/data
- Response actions taken
- Preventive measures

**Contact Information:**
- {regulatory-contacts-from-appendix-b}

**Appendix E: IOC Reference (from Section 2)**

I'll create a quick reference table of all IOCs documented in Section 2.1 for easy searching during an incident.

**Appendix F: MITRE ATT&CK Mapping Reference**

For {incident-type}, common tactics and techniques to look for during investigation.

I'll reference the MITRE ATT&CK data and create a quick reference table.

**Appendix G: Glossary**

Define key terms used in the playbook:
- IOC: Indicator of Compromise
- C2: Command and Control
- EDR: Endpoint Detection and Response
- SIEM: Security Information and Event Management
- NIST: National Institute of Standards and Technology
- {other-terms-used-in-your-playbook}

Would you like me to create all these appendices now?"

### 3. Generate Appendices

Once user confirms, generate:

Append to Section 8 (Appendices) in output file:

```markdown
## 8. Appendices

### Appendix A: Command Reference

**Quick reference for common incident response commands.**

**EDR ({edr-platform}) Commands:**

{Compile all EDR commands from Sections 3, 4, 5}

**SIEM ({siem-platform}) Queries:**

{Compile all SIEM queries from Sections 2, 3}

**Firewall ({firewall-platform}) Commands:**

{Compile all firewall commands from Section 3}

**Active Directory Commands:**

{Compile all AD commands from Sections 3, 4}

**Cloud Platform Commands (if applicable):**

{Compile all cloud commands from Sections 3, 4}

**Forensic Collection Commands:**

{Compile forensic commands from Section 4}

### Appendix B: Contact Information

**Internal Contacts:**

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|--------------|
| IR Team Lead | {TBD} | {TBD} | {TBD} | {24/7-or-business-hours} |
| SOC Manager | {TBD} | {TBD} | {TBD} | {24/7} |
| CISO | {TBD} | {TBD} | {TBD} | {availability} |
| IT Director | {TBD} | {TBD} | {TBD} | {availability} |
| Network Security | {TBD} | {TBD} | {TBD} | {availability} |
| System Administrators | {TBD} | {TBD} | {TBD} | {availability} |
| Legal | {TBD} | {TBD} | {TBD} | {availability} |
| HR | {TBD} | {TBD} | {TBD} | {availability} |
| Communications/PR | {TBD} | {TBD} | {TBD} | {availability} |
| Executive Leadership | {TBD} | {TBD} | {TBD} | {availability} |

**External Contacts:**

| Organization | Contact Name | Phone | Email | Account/Policy Number |
|--------------|--------------|-------|-------|----------------------|
| Forensics Firm | {TBD} | {TBD} | {TBD} | {TBD} |
| External Legal Counsel | {TBD} | {TBD} | {TBD} | {TBD} |
| Cyber Insurance | {TBD} | {TBD} | {TBD} | Policy: {TBD} |
| FBI Cyber Division | {local-office} | {phone} | {email} | N/A |
| Local Law Enforcement | {TBD} | {TBD} | {TBD} | N/A |
| ISAC | {TBD} | {TBD} | {TBD} | Member ID: {TBD} |

**Vendor Support Contacts:**

| Vendor | Product | Support Phone | Account Manager | Account Number |
|--------|---------|---------------|-----------------|----------------|
| {edr-vendor} | {edr-platform} | {TBD} | {TBD} | {TBD} |
| {siem-vendor} | {siem-platform} | {TBD} | {TBD} | {TBD} |
| {forensics-vendor} | {tool} | {TBD} | {TBD} | {TBD} |
| {cloud-provider} | {platform} | {TBD} | {TBD} | {TBD} |
| {other-vendors} | {products} | {TBD} | {TBD} | {TBD} |

**Regulatory Contacts (if applicable):**

| Regulator | Contact | Notification Method | Timeline |
|-----------|---------|---------------------|----------|
| GDPR DPA | {TBD} | {portal-or-email} | 72 hours |
| PCI-DSS Acquirer | {TBD} | {method} | Immediate |
| State AG | {TBD} | {method} | {varies} |
| {other} | {TBD} | {method} | {timeline} |

### Appendix C: Incident Response Checklists

**Initial Triage Checklist:**

{Extract and format checklist from Section 2.4}

**Containment Quick Actions:**

{Create 1-page quick reference from Section 3}

**Eradication Validation Checklist:**

{Extract checklist from Section 4.5}

**Recovery Validation Checklist:**

{Extract checklist from Section 5.4}

### Appendix D: Compliance and Regulatory Quick Reference

**For {incident-type} incidents involving regulated data:**

**Notification Timelines:**

| Regulation | Trigger | Timeline | Method | Content Requirements |
|------------|---------|----------|--------|---------------------|
| GDPR | Personal data breach | 72 hours to DPA | {method} | Nature, categories, numbers, consequences, measures |
| GDPR | Personal data breach (high risk) | Without undue delay to individuals | {method} | Same as DPA + advice |
| PCI-DSS | Payment card data | Immediate | {per-acquirer} | Incident details, forensics plan |
| HIPAA | PHI breach | 60 days | Mail/email | {HIPAA-requirements} |
| State Laws | Personal information | {varies-by-state} | {varies} | {varies} |

**Required Documentation for Compliance:**
- Complete timeline of events
- Affected data types and volumes
- Affected individuals (count and identification)
- Root cause analysis
- Response actions taken
- Preventive measures implemented
- Evidence of notifications sent

**Regulatory Contacts:** (See Appendix B)

### Appendix E: Indicators of Compromise (IOC) Reference

**Quick reference for IOCs identified in Section 2.1.**

**Network IOCs:**

{Extract and format network IOCs from Section 2.1}

**File IOCs:**

{Extract and format file IOCs from Section 2.1}

**Behavioral IOCs:**

{Extract and format behavioral IOCs from Section 2.1}

**How to Use:**
- Search SIEM for these IOCs periodically
- Alert on ANY detection (zero tolerance during enhanced monitoring)
- Update this list as new IOCs discovered

### Appendix F: MITRE ATT&CK Mapping for {incident-type}

**Common tactics and techniques to investigate during {incident-type} incidents.**

{Create table from MITRE ATT&CK data relevant to incident type}

| Tactic | Technique | Description | Detection Method |
|--------|-----------|-------------|------------------|
| {tactic} | {technique} | {description} | {how-to-detect} |

**How to Use:**
- Use during investigation to identify attack stages
- Document observed techniques in incident report
- Map detection gaps to improvement actions

### Appendix G: Glossary

**Key terms used in this playbook:**

- **APT (Advanced Persistent Threat):** Long-term targeted attack by sophisticated threat actor
- **C2 (Command and Control):** Infrastructure used by attackers to control compromised systems
- **Chain of Custody:** Documentation of evidence handling to maintain legal admissibility
- **CVE (Common Vulnerabilities and Exposures):** Standardized identifier for software vulnerabilities
- **DPA (Data Protection Authority):** Regulatory authority for GDPR compliance
- **Dwell Time:** Duration between initial compromise and detection
- **EDR (Endpoint Detection and Response):** Security tool for endpoint monitoring and response
- **Exfiltration:** Unauthorized transfer of data out of the organization
- **Forensics:** Scientific investigation of digital evidence
- **Hash:** Cryptographic fingerprint of a file (MD5, SHA-1, SHA-256)
- **IOC (Indicator of Compromise):** Artifact indicating potential security incident
- **IR (Incident Response):** Process of responding to security incidents
- **Lateral Movement:** Attacker moving through the network after initial compromise
- **MITRE ATT&CK:** Framework for categorizing adversary tactics and techniques
- **NIST (National Institute of Standards and Technology):** US standards organization, publishes cybersecurity frameworks
- **Persistence:** Mechanisms allowing attacker to maintain access across reboots
- **PFI (PCI Forensic Investigator):** Qualified forensic investigator for PCI-DSS incidents
- **Playbook:** Documented procedures for responding to specific incident types
- **RCA (Root Cause Analysis):** Investigation to identify underlying cause of incident
- **SIEM (Security Information and Event Management):** Platform for log aggregation and correlation
- **SOC (Security Operations Center):** Team monitoring for security incidents
- **TTPs (Tactics, Techniques, and Procedures):** Methods used by threat actors
- **Zero-Day:** Vulnerability exploited before patch available

{Add other terms specific to your organization or playbook}
```

### 4. Add Document Control

"**Document Control for Playbook Management**

This playbook is a living document that needs regular review and updates.

**Version History:**

Let's document the creation of this playbook:
- Version 1.0
- Created: {date}
- Created by: {organization-name} and Phoenix (BMAD IR Planning Consultant)
- Major changes: Initial creation

**Review and Update Schedule:**

How often should this playbook be reviewed?
- Recommended: Annually at minimum
- After each incident: Update based on lessons learned
- When tools change: Update commands and procedures
- When regulations change: Update compliance sections

**Approval and Sign-Off:**

Who must approve this playbook before it's official?

Typical approval workflow:
- Created by: IR Team
- Reviewed by: Security Team, IT Operations, Legal
- Approved by: CISO

Let's document the approval section."

Add to beginning of playbook (after frontmatter):

```markdown
---

## Document Control

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {current-date} | {organization-name} with BMAD IR Consultant | Initial creation |
| {future} | {future} | {future} | {future} |

### Review and Update Schedule

**Regular Review:** Annually (minimum)

**Trigger for Updates:**
- After each {incident-type} incident (update based on lessons learned)
- When security tools change (update commands, procedures, sections 2-5)
- When organizational structure changes (update contacts, escalation paths)
- When regulations change (update sections 6, 7, appendix D)
- When threat landscape evolves (update IOCs, TTPs, section 2)

**Next Scheduled Review:** {date-one-year-from-creation}

### Approval and Sign-Off

**This playbook has been reviewed and approved by:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| IR Team Lead | {TBD} | _________________ | _______ |
| Security Team Lead | {TBD} | _________________ | _______ |
| IT Operations Lead | {TBD} | _________________ | _______ |
| Legal | {TBD} | _________________ | _______ |
| CISO | {TBD} | _________________ | _______ |

**Playbook Status:** {Draft / Under Review / Approved / Active}

**Effective Date:** {date-when-approved}

---
```

### 5. Final Quality Review

"**Final Quality Review Checklist**

Before we declare this playbook complete, let's conduct a final quality review.

I'll ask you a series of questions to ensure the playbook is comprehensive and actionable.

**Section 1: Incident Overview**
- [ ] Incident type clearly defined?
- [ ] Organizational context comprehensive (tools, team, regulations)?
- [ ] Severity criteria defined?

**Section 2: Detection & Analysis**
- [ ] IOCs specific to {incident-type}?
- [ ] Alert sources documented?
- [ ] Triage decision tree clear?
- [ ] Initial assessment checklist complete?

**Section 3: Containment**
- [ ] Short-term and long-term containment strategies?
- [ ] Tool-specific commands provided?
- [ ] Decision matrix based on severity?
- [ ] Rollback procedures documented?

**Section 4: Eradication**
- [ ] Root cause identification procedures?
- [ ] Complete threat removal procedures (malware, persistence, credentials)?
- [ ] Vulnerability remediation procedures?
- [ ] Validation procedures with sign-off?

**Section 5: Recovery**
- [ ] System prioritization (P1/P2/P3)?
- [ ] Restoration methods per system type?
- [ ] Validation testing procedures?
- [ ] Enhanced monitoring plan?
- [ ] Return-to-normal criteria?

**Section 6 & 7: Post-Incident**
- [ ] Lessons learned session structure?
- [ ] Documentation requirements?
- [ ] Communication plan (internal and external)?
- [ ] Regulatory notification timelines?
- [ ] Process improvement framework?

**Section 8: Appendices**
- [ ] Command reference complete?
- [ ] Contact information (or placeholders)?
- [ ] Checklists extracted?
- [ ] Compliance quick reference?
- [ ] Glossary?

**Document Control:**
- [ ] Version history?
- [ ] Review schedule?
- [ ] Approval section?

**Overall:**
- [ ] Procedures specific to {incident-type}?
- [ ] Procedures tailored to organizational tools and context?
- [ ] Actionable (responder can follow during incident)?
- [ ] No ambiguity or vague instructions?

Let me review the playbook... {pause for review}

{Provide feedback on any gaps or issues found}

Would you like to use **Advanced Elicitation** for a final quality review? This will use Socratic questioning to ensure we haven't missed anything critical."

### 6. Complete the Workflow

Once quality review is satisfactory:

"**Playbook Creation Complete! 🎉**

Congratulations! You now have a comprehensive **{incident-type} Incident Response Playbook** for {organization-name}.

**Playbook Summary:**
- **Incident Type:** {incident-type}
- **Sections Completed:** 8 (Incident Overview, Detection, Containment, Eradication, Recovery, Post-Incident, Communication, Appendices)
- **Created:** {date}
- **Location:** {file-path}

**Next Steps:**

1. **Fill in Placeholders:**
   - Contact information (Appendix B)
   - Any organizational-specific details marked {TBD}

2. **Obtain Approvals:**
   - Route to stakeholders for review
   - Obtain sign-offs (Document Control section)

3. **Socialize the Playbook:**
   - Distribute to IR team, SOC, IT operations
   - Train responders on the playbook
   - Add to incident response documentation repository

4. **Test the Playbook:**
   - Conduct tabletop exercise using this playbook
   - Simulate {incident-type} scenario
   - Identify any gaps or unclear procedures
   - Update based on findings

5. **Schedule Regular Review:**
   - Set calendar reminder for annual review
   - Update after each {incident-type} incident
   - Keep contact information current

**Additional Playbooks:**

This is your **first** incident response playbook. Consider creating playbooks for other incident types:
- Ransomware (if not already covered)
- Data Breach / Exfiltration
- DDoS Attack
- Insider Threat
- Phishing / Account Compromise
- APT
- {other-incident-types-relevant-to-your-organization}

**Would you like to:**
- Export the playbook to PDF?
- Create another playbook for a different incident type?
- Conduct a tabletop exercise to test this playbook?

Thank you for working with me to create this playbook! Your organization is now better prepared to respond to {incident-type} incidents."

Update frontmatter with FINAL metadata:

```yaml
stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a, 8a]
workflowComplete: true
completedAt: '{timestamp}'
lastUpdated: '{timestamp}'
playbookVersion: '1.0'
playbookStatus: 'Draft - Pending Approval'
```

### 7. Present FINAL MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation (Final Quality Review) [P] Party Mode [C] Complete

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY mark workflow complete when user selects 'C'
- After Advanced Elicitation or Party Mode, return to this menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "comprehensive final quality review of entire playbook"
- IF P: Execute {partyModeWorkflow} - User can select any expert for final consultation
- IF C: Mark workflowComplete: true, display completion message, workflow ends
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-final-menu-options)

## CRITICAL WORKFLOW COMPLETION NOTE

ONLY WHEN C is selected will you mark `workflowComplete: true` and complete the workflow.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Section 8 (Appendices) complete with all subsections
- Document control added (version history, review schedule, approval)
- Final quality review conducted
- All sections comprehensive and actionable
- Playbook tailored to {incident-type} and organizational context
- Frontmatter updated with workflowComplete: true
- Completion message displayed
- Next steps provided to user

### ❌ SYSTEM FAILURE:

- Missing appendices (critical quick-reference material)
- No document control (playbook won't be maintained)
- Skipping quality review (risk of gaps or errors)
- Generic playbook not tailored to organization
- Marking complete without user confirmation
- Not updating frontmatter with workflowComplete: true

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
