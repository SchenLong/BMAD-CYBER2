# Incident Response Playbook - Remaining Files to Build

## Status: 3 of 19 files completed

**Completed:**
✅ workflow.md
✅ step-01-init.md
✅ template-playbook.md (from Step 5)
✅ template-incident-report.md (from Step 5)

**Remaining: 15 step files + 3 data files = 18 files**

---

## Files to Create

### Core Workflow Files (2 remaining)

#### 1. step-01b-continue.md
**Purpose:** Handle workflow resumption for both Mode A and Mode B
**Location:** `steps/step-01b-continue.md`
**Key Features:**
- Detect which mode (playbook-creation vs guided-execution)
- Load output document and read stepsCompleted
- Load sidecar file if Mode B
- Display workflow status and progress
- Route to correct next step based on stepsCompleted array
- Support review/modification of previous work

**Template to follow:** `_bmad/bmb/docs/workflows/templates/step-1b-template.md`

---

### Mode A: Playbook Creation Steps (7 files)

#### 2. step-02a-incident-type.md
**Purpose:** Select incident type and gather organizational context
**Key Sections:**
- Load data/incident-types.csv
- Present incident type options (Ransomware, Data Breach, DDoS, etc.)
- Gather org context (size, industry, regulatory requirements)
- Collect available tools (SIEM, EDR, forensics)
- Document team structure
- Write to Incident Overview section
- Update stepsCompleted: [1, 2a]
**Menu:** A/P/C options

#### 3. step-03a-detection-analysis.md
**Purpose:** Define detection and analysis procedures
**Key Sections:**
- Guide IOC identification
- Define alert sources (SIEM, EDR, threat intel)
- Document triage procedures
- Create initial assessment checklist
- Web-Browsing for threat actor TTPs
- Party Mode option (Cipher for threat intel)
- Brainstorming option for detection methods
- Append to Detection & Analysis section
- Update stepsCompleted: [1, 2a, 3a]
**Menu:** A/P/C options

#### 4. step-04a-containment.md
**Purpose:** Design containment procedures
**Key Sections:**
- Short-term containment (immediate actions)
- Long-term containment (sustained isolation)
- Decision criteria (isolate vs monitor)
- Tool-specific commands (SIEM, EDR, firewall, network)
- Brainstorming for innovative containment
- Party Mode option (Bastion for architecture awareness)
- Append to Containment Procedures section
- Update stepsCompleted: [1, 2a, 3a, 4a]
**Menu:** A/P/C options

#### 5. step-05a-eradication.md
**Purpose:** Document eradication procedures
**Key Sections:**
- Root cause identification procedures
- Threat actor removal (persistence, backdoors, malware)
- Vulnerability remediation (patches, hardening, updates)
- Validation procedures
- Web-Browsing for CVE details
- Party Mode option (Trace for forensic validation)
- Append to Eradication Steps section
- Update stepsCompleted: [1, 2a, 3a, 4a, 5a]
**Menu:** A/P/C options

#### 6. step-06a-recovery.md
**Purpose:** Define recovery procedures
**Key Sections:**
- System restoration order (P1, P2, P3 prioritization)
- Restoration procedures (backup verification, rebuild)
- Validation and testing (functional, security, performance)
- Enhanced monitoring (duration, items, thresholds)
- Brainstorming for recovery strategies
- Party Mode option (Bastion for architecture validation)
- Append to Recovery Procedures section
- Update stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a]
**Menu:** A/P/C options

#### 7. step-07a-post-incident.md
**Purpose:** Plan post-incident activities and communication
**Key Sections:**
- Lessons learned session guide (agenda, questions, attendees)
- Documentation requirements (retention, storage)
- Communication plan (internal/external stakeholders, templates)
- Timeline requirements (GDPR 72 hours, PCI-DSS, HIPAA)
- Process improvement actions
- Web-Browsing for regulatory notification requirements
- Append to Post-Incident Activities & Communication Plan sections
- Update stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a]
**Menu:** A/P/C options

#### 8. step-08a-generate-playbook.md
**Purpose:** Finalize playbook with appendices and document control
**Key Sections:**
- Generate Appendices (tool commands, contacts, checklists, compliance)
- Add document control (version history, review schedule, approvals)
- Final review checklist (8 sections complete, procedures actionable, commands validated)
- Advanced Elicitation option for quality review
- Mark workflowComplete: true
- Display success message with file location
- Update stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a, 7a, 8a]
**Menu:** A/P/C options, then workflow completion

---

### Mode B: Guided Execution Steps (7 files)

#### 9. step-02b-triage.md
**Purpose:** Rapidly assess and classify incident
**Key Sections:**
- Auto-generate Incident ID (INC-YYYY-NNN)
- Collect incident basics (detection time, initial indicators, affected systems/users/data)
- Classify incident type using decision tree
- Determine severity from data/severity-criteria.csv (Critical/High/Medium/Low)
- Update sidecar file with incident start timestamp
- Write to Incident Summary section
- Add timeline entry: "Incident detected"
- Update stepsCompleted: [1, 2b]
**Interaction:** Prescriptive checklist, rapid Q&A, auto-proceed when classified

#### 10. step-03b-containment.md
**Purpose:** Execute immediate containment actions
**Key Sections:**
- Present containment decision tree (isolate systems? disconnect network? revoke access? quarantine files?)
- For each action: present commands, user executes, log timestamp to sidecar
- Validation checklist (systems isolated, network disconnected, access revoked, quarantine verified)
- Party Mode option (Bastion for containment strategy)
- Append to Actions Taken section
- Add timeline entry: "Containment complete at {timestamp}"
- Update stepsCompleted: [1, 2b, 3b]
**Menu:** P/C options (prescriptive, no brainstorming)

#### 11. step-04b-evidence.md
**Purpose:** Collect and preserve evidence with chain of custody
**Key Sections:**
- Evidence collection checklist (memory dumps, disk images, logs, screenshots, network captures)
- For each evidence item: filename, hash (MD5/SHA256), collected by, timestamp, storage location
- Chain of custody documentation (who, when, where, access)
- IOC extraction (IPs, domains, file hashes, emails)
- Web-Browsing for IOC threat intelligence
- Party Mode option (Trace for forensic guidance)
- Append to Evidence Collected section
- Add timeline entry: "Evidence collection complete"
- Update stepsCompleted: [1, 2b, 3b, 4b]
**Menu:** P/C options

#### 12. step-05b-analysis.md
**Purpose:** Determine root cause, attack vectors, scope
**Key Sections:**
- Root cause analysis (vulnerability exploited, how attacker gained access, when compromise occurred)
- Attack timeline reconstruction (initial access, lateral movement, data access, exfiltration)
- MITRE ATT&CK mapping from data/mitre-attack-mapping.csv (11 tactic categories)
- Scope determination (systems compromised, data accessed/exfiltrated, duration)
- Web-Browsing for threat actor TTPs and CVE details
- Party Mode option (Cipher for threat intelligence correlation)
- Append to Technical Analysis section
- Add timeline entry: "Analysis complete - root cause identified"
- Update stepsCompleted: [1, 2b, 3b, 4b, 5b]
**Menu:** P/C options

#### 13. step-06b-eradication.md
**Purpose:** Remove threat actor access and patch vulnerabilities
**Key Sections:**
- Threat actor removal checklist (persistence eliminated, backdoors removed, malware eradicated, credentials rotated)
- Vulnerability remediation checklist (patches applied, configurations hardened, updates installed)
- For each action: what was done, who performed, timestamp, validation result
- Clean system validation (forensic scan clean, no persistence, IOCs removed)
- Sign-off requirements (IR team, security team)
- Party Mode option (Trace for validation)
- Append to Actions Taken section
- Add timeline entry: "Eradication complete and validated"
- Update stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b]
**Menu:** P/C options

#### 14. step-07b-recovery.md
**Purpose:** Restore systems, resume services, validate
**Key Sections:**
- System restoration checklist (P1/P2/P3 priority order)
- For each system: restoration method (rebuild/restore), timestamp, validation tests, approval
- Service resumption (name, dependencies verified, testing passed, approved for users)
- Enhanced monitoring setup (what's monitored, alert thresholds, duration e.g. 7 days)
- Business operations resumed confirmation
- Append to Recovery Status section
- Add timeline entry: "Recovery complete - operations resumed"
- Update stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]
**Menu:** P/C options

#### 15. step-08b-report.md
**Purpose:** Generate complete incident report with lessons learned
**Key Sections:**
- Post-incident analysis (what worked well, what could improve, unexpected challenges, response time)
- Effectiveness evaluation (detection, containment, communication, tools)
- Recommendations (technical, process, training, tool/capability gaps)
- Follow-up actions with owners and due dates
- Compliance check (regulatory notifications sent? GDPR/PCI-DSS/HIPAA? customer notifications? insurance claim?)
- Financial impact calculation (direct costs: IR/forensics/legal; indirect costs: downtime/revenue; total)
- Append to Post-Incident Analysis section
- Add document control and approval signatures
- Mark workflowComplete: true
- Close sidecar file with final timestamp
- Display success message with report location
- Update stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b, 8b]
**Menu:** P/C options, then workflow completion

---

### Data Files (3 files)

#### 16. data/incident-types.csv
**Purpose:** Common incident type definitions
**Format:**
```csv
incident_type,definition,common_characteristics,typical_severity,mitre_tactics
Ransomware,"Malware that encrypts data and demands payment","File encryption, ransom note, data exfiltration, double extortion","Critical to High","Initial Access, Execution, Persistence, Defense Evasion, Impact"
Data Breach,"Unauthorized access to sensitive data","Data exfiltration, credential theft, database compromise","High to Critical","Initial Access, Credential Access, Collection, Exfiltration"
DDoS Attack,"Distributed denial of service attack","Service unavailability, traffic floods, bandwidth saturation","Medium to High","Impact"
Insider Threat,"Malicious or negligent actions by trusted insider","Data theft, sabotage, policy violations, privilege abuse","Medium to Critical","Initial Access, Persistence, Collection, Exfiltration"
Malware Infection,"Malicious software compromise","Virus, trojan, worm, spyware, fileless malware","Medium to High","Execution, Persistence, Defense Evasion"
Phishing,"Social engineering via email or messages","Credential theft, malware delivery, business email compromise","Low to High","Initial Access, Credential Access"
Account Compromise,"Unauthorized access to user or admin accounts","Stolen credentials, brute force, session hijacking","Medium to High","Initial Access, Credential Access"
Advanced Persistent Threat,"Long-term targeted attack by sophisticated actor","Stealth, persistence, data theft, espionage","High to Critical","All MITRE tactics"
Supply Chain Attack,"Compromise via trusted third-party","Vendor compromise, software backdoor, update poisoning","High to Critical","Initial Access, Persistence"
Physical Security Breach,"Unauthorized physical access to facilities/systems","Theft, sabotage, unauthorized entry, tailgating","Medium to High","Physical Security, Initial Access"
```

#### 17. data/severity-criteria.csv
**Purpose:** Severity classification guidelines
**Format:**
```csv
severity,response_time,escalation_level,criteria,business_impact,notification_requirements
Critical,Immediate (< 15 min),C-Level + Board,"Complete service outage, data breach with PII/PHI, ransomware with encryption, active ongoing attack, critical infrastructure compromise","Severe revenue loss, regulatory fines, brand damage, customer trust loss","Immediate: Executive leadership, Legal, PR, Regulators (GDPR 72h)"
High,< 1 hour,Senior Management,"Partial service degradation, suspected data access, malware on critical systems, privilege escalation, multiple systems compromised","Significant revenue impact, customer impact, operational disruption","Within 4 hours: Management, Legal, Affected customers"
Medium,< 4 hours,Department Manager,"Single system compromise, policy violation, suspicious activity, contained malware, failed attack attempt","Limited revenue impact, minimal customer impact, isolated disruption","Within 24 hours: Department heads, Security team"
Low,< 24 hours,Security Team,"Security alert requiring investigation, minor policy violation, vulnerability scan findings, informational alert","Minimal to no business impact, no customer impact","Within 72 hours: Security team, IT operations"
```

#### 18. data/mitre-attack-mapping.csv
**Purpose:** MITRE ATT&CK technique reference
**Format:**
```csv
tactic,tactic_id,technique_example,technique_id,description,common_indicators
Initial Access,TA0001,Phishing,T1566,"Adversary sends phishing emails to gain access","Suspicious emails, credential harvesting, malicious attachments"
Execution,TA0002,Command and Scripting Interpreter,T1059,"Adversary executes malicious code","PowerShell, cmd.exe, bash execution, script files"
Persistence,TA0003,Boot or Logon Autostart Execution,T1547,"Adversary maintains access through system restart","Registry Run keys, Startup folder, scheduled tasks"
Privilege Escalation,TA0004,Exploitation for Privilege Escalation,T1068,"Adversary exploits vulnerability to gain higher privileges","CVE exploitation, kernel exploits, UAC bypass"
Defense Evasion,TA0005,Obfuscated Files or Information,T1027,"Adversary hides malicious code","Encoded PowerShell, packed binaries, encryption"
Credential Access,TA0006,OS Credential Dumping,T1003,"Adversary steals credentials","LSASS dumping, SAM database access, Mimikatz"
Discovery,TA0007,System Information Discovery,T1082,"Adversary gathers system information","Enumeration commands, network scanning, system profiling"
Lateral Movement,TA0008,Remote Services,T1021,"Adversary moves between systems","RDP, SMB, WinRM, PsExec, lateral tool transfer"
Collection,TA0009,Data from Local System,T1005,"Adversary collects data of interest","File access, database queries, clipboard monitoring"
Command and Control,TA0011,Application Layer Protocol,T1071,"Adversary communicates with C2 server","HTTP/HTTPS, DNS, Web Services beaconing"
Exfiltration,TA0010,Exfiltration Over C2 Channel,T1041,"Adversary steals data","Large data transfers, unusual outbound traffic, encrypted channels"
Impact,TA0040,Data Encrypted for Impact,T1486,"Adversary disrupts systems or data","Ransomware encryption, file deletion, service disruption"
```

---

## Implementation Notes

### General Step File Structure

All step files should follow this pattern:
1. **Frontmatter** with file references (thisStepFile, nextStepFile, templates, data files)
2. **MANDATORY EXECUTION RULES** section
3. **Role Reinforcement** appropriate for mode
4. **STEP GOAL** clearly stated
5. **Numbered sequence** of instructions (no skipping allowed)
6. **Menu handling** (A/P/C for Mode A, P/C for Mode B)
7. **SUCCESS/FAILURE METRICS** section

### Mode A Characteristics:
- Collaborative, conversational tone
- Intent-based instructions ("Guide user to...")
- A/P/C menus (Advanced Elicitation, Party Mode, Continue)
- Emphasis on organizational adaptation
- Brainstorming options for creative strategies
- Append-only document building

### Mode B Characteristics:
- Directive, prescriptive tone
- Specific checklists and commands
- P/C menus (Party Mode for expert consultation, Continue)
- Real-time timestamp logging to sidecar file
- Forensic-quality evidence handling
- Chain of custody documentation
- Continuous document updates throughout incident

### Key Patterns:

**Party Mode Integration:**
- Mode A: Optional at all steps for Cipher (threat intel), Trace (forensics), Bastion (architecture)
- Mode B: Optional at containment, evidence, analysis, eradication for expert consultation

**Web-Browsing Integration:**
- Mode A: Current CVEs, MITRE ATT&CK techniques, compliance requirements
- Mode B: IOC threat intelligence, CVE lookups, threat actor TTPs

**State Management:**
- Update stepsCompleted array before loading next step
- Mode B: Update sidecar file timeline with every significant action
- Use frontmatter variables for continuation detection

**Document Building:**
- Mode A: Append to 8-section playbook template
- Mode B: Update 7-section incident report template in real-time

---

## Completion Checklist

When all files are created:
- [ ] 1 workflow.md ✅
- [ ] 2 init/continue step files (step-01-init.md ✅, step-01b-continue.md)
- [ ] 7 Mode A step files (step-02a through step-08a)
- [ ] 7 Mode B step files (step-02b through step-08b)
- [ ] 2 template files ✅ (template-playbook.md, template-incident-report.md)
- [ ] 3 data files (incident-types.csv, severity-criteria.csv, mitre-attack-mapping.csv)
- [ ] Test initialization with mode selection
- [ ] Test Mode A flow
- [ ] Test Mode B flow
- [ ] Test continuation logic
- [ ] Update workflow-plan-incident-response-playbook.md with build status

**Total files: 19 files**
**Completed: 4 files (21%)**
**Remaining: 15 files (79%)**

---

## Next Steps

To complete the build:
1. Create step-01b-continue.md
2. Create all 7 Mode A step files
3. Create all 7 Mode B step files
4. Create 3 CSV data files
5. Test the complete workflow
6. Update workflow plan with final build summary
7. Mark stepsCompleted: [1, 2, 3, 4, 5, 6, 7] in workflow plan
