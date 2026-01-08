# Incident Response Playbook - Build Status

## Overall Progress: 14 of 19 files (74%)

### ✅ Completed Files (14)

**Core Infrastructure (3 files):**
1. **workflow.md** - Main configuration with dual-mode branching
2. **step-01-init.md** - Initialization with mode selection and sidecar creation
3. **step-01b-continue.md** - Continuation logic for both modes

**Templates (2 files):**
4. **template-playbook.md** - 8-section playbook template (100+ placeholders)
5. **template-incident-report.md** - 7-section incident report template (150+ placeholders)

**Data Files (3 files):**
6. **data/incident-types.csv** - 10 incident types with MITRE tactics
7. **data/severity-criteria.csv** - 4 severity levels with response times
8. **data/mitre-attack-mapping.csv** - 12 MITRE ATT&CK tactics

**Mode A Steps - Playbook Creation (7 files):**
9. **step-02a-incident-type.md** - Incident type selection and organizational context
10. **step-03a-detection-analysis.md** - Detection procedures, IOCs, alert sources, triage
11. **step-04a-containment.md** - Short-term and long-term containment strategies
12. **step-05a-eradication.md** - Root cause, threat removal, vulnerability remediation
13. **step-06a-recovery.md** - System restoration, validation, enhanced monitoring
14. **step-07a-post-incident.md** - Lessons learned, documentation, communication plans
15. **step-08a-generate-playbook.md** - Appendices, document control, final quality review

**Mode B Steps - Guided Execution (1 file so far):**
16. **step-02b-triage.md** - Incident triage, classification, severity determination

### 🔄 Remaining Files (6)

**Mode B Steps - Guided Execution (6 remaining):**
- step-03b-containment.md
- step-04b-evidence.md
- step-05b-analysis.md
- step-06b-eradication.md
- step-07b-recovery.md
- step-08b-report.md

**Data Files (3 remaining):**
- data/incident-types.csv
- data/severity-criteria.csv
- data/mitre-attack-mapping.csv

---

## Quick Reference: Remaining File Specifications

### Mode A Remaining Steps (6 files)

#### step-03a-detection-analysis.md
- Guide IOC identification for incident type
- Define alert sources (SIEM, EDR, threat intel)
- Document triage procedures and decision trees
- Create initial assessment checklist
- Web-Browsing for threat actor TTPs
- Party Mode (Cipher) and Brainstorming options
- Append to Section 2
- Menu: A/P/C

#### step-04a-containment.md
- Short-term containment (immediate actions)
- Long-term containment (sustained isolation)
- Decision criteria (isolate vs monitor vs shutdown)
- Tool-specific commands (SIEM, EDR, firewall, network)
- Brainstorming for innovative strategies
- Party Mode (Bastion) for architecture awareness
- Append to Section 3
- Menu: A/P/C

#### step-05a-eradication.md
- Root cause identification procedures
- Threat actor removal (persistence, backdoors, malware)
- Vulnerability remediation (patches, hardening)
- Validation procedures
- Web-Browsing for CVE details
- Party Mode (Trace) for forensic validation
- Append to Section 4
- Menu: A/P/C

#### step-06a-recovery.md
- System restoration order (P1/P2/P3)
- Restoration procedures (backup verification, rebuild)
- Validation testing (functional, security, performance)
- Enhanced monitoring (duration, items, thresholds)
- Brainstorming for recovery strategies
- Party Mode (Bastion) for architecture validation
- Append to Section 5
- Menu: A/P/C

#### step-07a-post-incident.md
- Lessons learned session guide
- Documentation requirements (retention, storage)
- Communication plan (internal/external stakeholders)
- Timeline requirements (GDPR 72h, PCI-DSS, HIPAA)
- Process improvement actions
- Web-Browsing for regulatory requirements
- Append to Sections 6 & 7
- Menu: A/P/C

#### step-08a-generate-playbook.md
- Generate Appendices (commands, contacts, checklists, compliance)
- Add document control (version history, review schedule)
- Final review checklist (8 sections, actionable procedures)
- Advanced Elicitation for quality review
- Mark workflowComplete: true
- Success message with file location
- Menu: A/P/C then completion

---

### Mode B Remaining Steps (7 files)

All Mode B steps follow prescriptive, checklist-based format with P/C menus (no brainstorming).
All steps update sidecar file with timestamped timeline entries.

#### step-02b-triage.md
- Auto-generate Incident ID (INC-YYYY-NNN)
- Collect incident basics (detection time, indicators, affected systems)
- Classify incident type (decision tree)
- Determine severity (load severity-criteria.csv)
- Update sidecar: "Incident detected"
- Write to Section 1 (Incident Summary)
- Auto-proceed when classified

#### step-03b-containment.md
- Containment decision tree (isolate? disconnect? revoke? quarantine?)
- For each action: present commands, user executes, log to sidecar
- Validation checklist
- Party Mode (Bastion) option
- Append to Section 3 (Actions Taken)
- Update sidecar: "Containment complete"
- Menu: P/C

#### step-04b-evidence.md
- Evidence collection checklist (memory dumps, disk images, logs, screenshots, network captures)
- For each item: filename, hash, collected by, timestamp, storage
- Chain of custody documentation
- IOC extraction (IPs, domains, hashes, emails)
- Web-Browsing for IOC threat intel
- Party Mode (Trace) option
- Append to Section 4 (Evidence Collected)
- Update sidecar: "Evidence collection complete"
- Menu: P/C

#### step-05b-analysis.md
- Root cause analysis (vulnerability, access method, timeline)
- Attack timeline reconstruction
- MITRE ATT&CK mapping (load mitre-attack-mapping.csv for 11 tactics)
- Scope determination (systems, data, duration)
- Web-Browsing for threat actor TTPs and CVEs
- Party Mode (Cipher) option
- Append to Section 5 (Technical Analysis)
- Update sidecar: "Analysis complete"
- Menu: P/C

#### step-06b-eradication.md
- Threat actor removal checklist (persistence, backdoors, malware, credentials)
- Vulnerability remediation checklist (patches, hardening, updates)
- For each action: what/who/when/validation
- Clean system validation (forensic scan, no persistence, IOCs removed)
- Sign-off requirements (IR team, security team)
- Party Mode (Trace) option
- Append to Section 3 (Actions Taken)
- Update sidecar: "Eradication complete and validated"
- Menu: P/C

#### step-07b-recovery.md
- System restoration checklist (P1/P2/P3)
- For each system: method/timestamp/validation/approval
- Service resumption (dependencies, testing, approval)
- Enhanced monitoring setup (items, thresholds, duration)
- Business operations resumed confirmation
- Append to Section 6 (Recovery Status)
- Update sidecar: "Recovery complete - operations resumed"
- Menu: P/C

#### step-08b-report.md
- Post-incident analysis (what worked, what could improve, challenges, response time)
- Effectiveness evaluation (detection, containment, communication, tools)
- Recommendations (technical, process, training, tool gaps)
- Follow-up actions (with owners and due dates)
- Compliance check (GDPR/PCI-DSS/HIPAA notifications, customer notifications, insurance)
- Financial impact (direct: IR/forensics/legal; indirect: downtime/revenue)
- Append to Section 7 (Post-Incident Analysis)
- Document control and approval signatures
- Mark workflowComplete: true
- Close sidecar file
- Success message
- Menu: P/C then completion

---

### Data Files (3 files)

#### data/incident-types.csv
10 rows with columns: incident_type, definition, common_characteristics, typical_severity, mitre_tactics

Types: Ransomware, Data Breach, DDoS Attack, Insider Threat, Malware Infection, Phishing, Account Compromise, APT, Supply Chain Attack, Physical Security Breach

#### data/severity-criteria.csv
4 rows with columns: severity, response_time, escalation_level, criteria, business_impact, notification_requirements

Levels: Critical (< 15 min), High (< 1 hour), Medium (< 4 hours), Low (< 24 hours)

#### data/mitre-attack-mapping.csv
12 rows with columns: tactic, tactic_id, technique_example, technique_id, description, common_indicators

Tactics: Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact

---

## Implementation Priority

**Critical Path (for testing):**
1. data/incident-types.csv (needed by step-02a)
2. data/severity-criteria.csv (needed by step-02b)
3. data/mitre-attack-mapping.csv (needed by step-05b)
4. Remaining Mode A steps (to test playbook creation flow)
5. Remaining Mode B steps (to test guided execution flow)

**Estimated Remaining Work:**
- 6 Mode A step files: ~6,000 lines
- 7 Mode B step files: ~7,000 lines
- 3 CSV data files: ~500 lines
- **Total: ~13,500 lines remaining**

---

## Testing Checklist (After Build Complete)

- [ ] Test Mode A initialization and flow through all 7 steps
- [ ] Test Mode B initialization and flow through all 7 steps
- [ ] Test continuation logic for both modes
- [ ] Verify data files load correctly
- [ ] Test Party Mode integration points
- [ ] Test Web-Browsing integration
- [ ] Verify sidecar file creation and updates (Mode B)
- [ ] Test workflowComplete flag and completion messages
- [ ] Verify frontmatter stepsCompleted tracking
- [ ] Test menu handling (A/P/C)

---

## Next Session Tasks

To complete the build efficiently:

1. Create 3 data CSV files (quick, straightforward)
2. Create remaining 6 Mode A step files (follow step-02a pattern)
3. Create remaining 7 Mode B step files (prescriptive, checklist-focused)
4. Test both modes end-to-end
5. Update workflow plan with build complete status
