---
name: 'step-07b-recovery-and-closure'
description: 'Guide system restoration, service resumption, enhanced monitoring, final incident report, and workflow closure'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-07b-recovery-and-closure.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current incident report file from frontmatter'
sidecarFile: 'Current sidecar timeline file from frontmatter'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7B: Recovery and Closure

## STEP GOAL:

To guide complete system restoration, service resumption with business approval, enhanced monitoring setup, comprehensive post-incident analysis, final incident report generation, and proper workflow closure with deliverables.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip business approval before service resumption
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: This is the FINAL step - mark workflowComplete: true at end
- 📋 YOU ARE AN INCIDENT COMMANDER guiding recovery and closure
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an Incident Commander
- ✅ Tone: Calm, directive, methodical, thorough, reflective
- ✅ Recovery must be methodical with validation gates
- ✅ Business approval required before service resumption
- ✅ This is the FINAL step - comprehensive closure required

### Step-Specific Rules:

- 🎯 Focus on complete recovery AND final report
- 💬 Provide specific restoration procedures
- 📝 Document ALL recovery actions and analysis
- ✅ Require business sign-off for service resumption
- 🏁 Mark workflowComplete: true when finished
- 📋 Close sidecar file with final entry

## EXECUTION PROTOCOLS:

- 🎯 Restore systems, resume services, setup monitoring, analyze incident, create recommendations, verify compliance, close workflow
- 💾 Append to Section 6 (Recovery Status) and Section 7 (Post-Incident Analysis)
- 📝 Update sidecar file with recovery and closure timeline
- 📖 Update frontmatter `stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]` and `workflowComplete: true`
- 🚫 Present menu (P/C) after recovery, THEN final closure after report

## RECOVERY AND CLOSURE SEQUENCE:

---

# PART 1: RECOVERY

---

### 1. Recovery Overview

Display:

"**🔄 RECOVERY PHASE 🔄**

**Incident:** {incident-id} - {incident-type}

**Recovery Goal:** Restore systems to normal operations with enhanced security monitoring.

**Recovery Approach:**

1. **Prioritization** - Restore by business criticality (P1 → P2 → P3)
2. **Restoration** - Backup/rebuild/patch per system
3. **Validation** - Test functionality, security, performance
4. **Service Resumption** - Return to operations with business approval
5. **Enhanced Monitoring** - 30-90 day heightened monitoring

Let's systematically restore operations."

### 2. Recovery Prioritization

"**SYSTEM PRIORITIZATION**

**Affected Systems (from step 2b):** {affected-systems-list}

We need to prioritize restoration by business impact.

**Priority Levels:**

- **P1 (Critical):** Revenue-generating, customer-facing, mission-critical
  - RTO: < 4 hours
  - Examples: Payment systems, production web servers, primary databases

- **P2 (High):** Important but not revenue-critical
  - RTO: < 24 hours
  - Examples: Email servers, internal applications, secondary databases

- **P3 (Standard):** Can tolerate longer downtime
  - RTO: < 72 hours
  - Examples: Development systems, test environments, reporting systems

**For each affected system, assign priority:**

| System | Business Function | Priority | RTO Target | Dependencies |
|--------|------------------|----------|-----------|--------------|
| {hostname-1} | {function} | P1/P2/P3 | {hours} | {dependent-systems} |

**Prioritization complete? (Y/N):**"

### 3. System Restoration Procedures

"**SYSTEM RESTORATION**

We'll restore systems in priority order with validation at each step.

**Restoration Methods:**

1. **Restore from backup** (cleanest, fastest)
2. **Rebuild from scratch** (most secure, time-consuming)
3. **Patch-in-place** (fastest, higher risk if any threat remains)

For each system, choose appropriate method based on:
- Extent of compromise
- Backup availability and trustworthiness
- Business urgency
- Data criticality

---

**P1 SYSTEMS - CRITICAL (Restore First)**

**P1 Systems:** {list-of-p1-systems}

**For each P1 system:**

**System:** {hostname-1}
**Priority:** P1 - Critical
**Business Function:** {function}
**Restoration Method:** {backup/rebuild/patch}

---

**RESTORATION METHOD: Backup**

"**Restoration from Backup:**

**Backup Selection:**
- **Backup date/time:** {prompt-for-backup-timestamp}
- **Backup location:** {prompt-for-location}
- **Backup verified clean:** {prompt-Y/N} (before incident start)
- **Backup integrity check:** {prompt-hash-verification}

**Restoration Procedure:**

```powershell
# Windows Server backup restore
wbadmin start systemstaterecovery -version:{version-identifier} -backupTarget:{location}

# Or VM snapshot revert (VMware)
# Or cloud instance restore (AWS/Azure)

# File-level restore if needed
wbadmin start recovery -version:{version} -itemtype:file -items:{path}
```

```bash
# Linux backup restore
# From rsync backup:
rsync -av --delete /backup/path/ /target/path/

# From tar backup:
tar -xzvf backup.tar.gz -C /

# Or VM snapshot revert
```

**Restoration Steps:**

1. **Take final forensic snapshot** (before restoration, for investigation)
2. **Restore from clean backup**
3. **Apply all security patches** (patch to current state)
4. **Apply configuration hardening** (from step 6b)
5. **Reset service account credentials** (if applicable)
6. **Start services**
7. **Validate functionality**
8. **Validate security posture**

**Restoration Execution:**

- **Forensic snapshot taken:** {Y/N}
- **Backup restore started:** {timestamp}
- **Backup restore completed:** {timestamp}
- **Duration:** {minutes}
- **Patches applied:** {patch-list}
- **Hardening applied:** {hardening-actions}
- **Services started:** {service-list}

**Restoration complete? (Y/N):**"

---

**RESTORATION METHOD: Rebuild**

"**System Rebuild from Scratch:**

**Rebuild Procedure:**

1. **Backup data** (if any data needs preservation)
2. **Wipe system** (reinstall OS)
3. **Apply gold image** (if available)
4. **Install applications**
5. **Apply security patches**
6. **Apply configuration hardening**
7. **Restore data** (from clean backup)
8. **Configure services**
9. **Validate functionality**
10. **Validate security**

**Rebuild Steps:**

- **Data backed up:** {Y/N}
- **OS reinstalled:** {OS-version} - {timestamp}
- **Applications installed:** {app-list} - {timestamp}
- **Patches applied:** {patch-list}
- **Hardening applied:** {hardening-actions}
- **Data restored:** {Y/N}
- **Services configured:** {service-list}

**Rebuild complete? (Y/N):**"

---

**VALIDATION TESTING**

"**System Validation:**

**Functional Testing:**
- [ ] System boots successfully
- [ ] All required services running
- [ ] Application functionality verified
- [ ] User access works
- [ ] Data accessible and complete
- [ ] Integration with dependent systems works
- [ ] Performance acceptable

**Functional test result:** {pass/fail - details}

**Security Testing:**
- [ ] EDR agent reporting healthy
- [ ] Latest security patches applied
- [ ] Configuration hardening verified
- [ ] No malicious activity detected
- [ ] Firewall rules correct
- [ ] Access controls correct
- [ ] Logging enabled and working

**Security test result:** {pass/fail - details}

**Performance Testing:**
- [ ] CPU utilization normal
- [ ] Memory utilization normal
- [ ] Disk I/O normal
- [ ] Network connectivity normal
- [ ] Response times acceptable

**Performance test result:** {pass/fail - details}

**Overall Validation:** {PASS / FAIL}

**If PASS:**"

---

**BUSINESS APPROVAL**

"**Business Approval for Production Use:**

**System:** {hostname}
**Restoration Method:** {method}
**Validation Results:** All tests passed ✅

**Business Owner Approval:**
- **Business Owner Name:** {prompt-for-name}
- **Title:** {prompt-for-title}
- **Approval:** I approve this system for production use
- **Signature/Confirmation:** {prompt-for-approval}
- **Timestamp:** {current-timestamp}

**IT Operations Approval:**
- **IT Ops Manager Name:** {prompt-for-name}
- **Title:** {prompt-for-title}
- **Approval:** I confirm system is operationally ready
- **Signature/Confirmation:** {prompt-for-approval}
- **Timestamp:** {current-timestamp}

**System approved for production use? (Y/N):**"

**If approved:**

"✅ **{hostname} RESTORED AND APPROVED**

**System Status:** Operational
**Restoration Time:** {duration}
**Business Approved:** ✅
**IT Approved:** ✅

**System returned to production at {timestamp}**"

**Repeat for all P1 systems, then P2 systems, then P3 systems.**

**Document each system restoration:**

| System | Priority | Restoration Method | Duration | Functional Test | Security Test | Business Approval | IT Approval | Operational Timestamp |
|--------|----------|-------------------|----------|----------------|---------------|-------------------|-------------|---------------------|
| {hostname} | P1 | {method} | {mins} | Pass ✅ | Pass ✅ | {name} ✅ | {name} ✅ | {timestamp} |

**All systems restored and operational? (Y/N):**"

### 4. Service Resumption

"**SERVICE RESUMPTION**

**Services to Resume:**

List all services/applications that need to be brought back online:

**Service:** {service-name}
**Dependent Systems:** {upstream-systems} → **This Service** → {downstream-systems}

**Resumption Checklist:**

1. **Dependency Check:**
   - [ ] Upstream dependencies operational
   - [ ] Database connectivity verified
   - [ ] Authentication services available
   - [ ] Network connectivity confirmed

**Dependencies ready:** {Y/N}

2. **Service Startup:**
   - [ ] Service configuration reviewed
   - [ ] Service started successfully
   - [ ] Health checks passing
   - [ ] Logs showing normal operation

**Service started:** {Y/N}

3. **Integration Testing:**
   - [ ] Upstream integrations working
   - [ ] Downstream integrations working
   - [ ] End-to-end transaction test passed
   - [ ] User acceptance test passed

**Integration test result:** {pass/fail}

4. **Business Approval:**
   - **Business Owner:** {name}
   - **Approval:** Service ready for customers/users
   - **Timestamp:** {timestamp}

**Service approved:** {Y/N}

**Repeat for all services.**

**Service Resumption Summary:**

| Service | Dependencies Verified | Service Started | Integration Test | Business Approval | Operational Timestamp |
|---------|---------------------|-----------------|------------------|-------------------|---------------------|
| {service} | ✅ | ✅ | Pass ✅ | {name} ✅ | {timestamp} |

**All services resumed and operational? (Y/N):**"

### 5. Enhanced Monitoring Setup

"**ENHANCED MONITORING**

After an incident, we implement heightened monitoring for 30-90 days.

**Enhanced Monitoring Period:** {30/60/90} days

**Monitoring Configuration:**

**1. IOC Monitoring:**

Monitor for any return of known IOCs from this incident.

**IOCs to monitor (from step 4b):**
- Malicious IPs: {list}
- Malicious domains: {list}
- Malware hashes: {list}
- Suspicious user accounts: {list}

**SIEM Rules:**

```
# Alert on any IOC appearance
source_ip IN ({malicious-ips}) OR
destination_ip IN ({malicious-ips}) OR
domain IN ({malicious-domains}) OR
file_hash IN ({malware-hashes}) OR
username IN ({suspicious-accounts})

Alert Priority: Critical
Notification: Security Team (immediate)
```

**IOC monitoring configured:** {Y/N}

**2. Behavioral Monitoring:**

Monitor for behaviors similar to the attack.

**Behaviors to monitor (based on MITRE TTPs from step 5b):**

- Unusual authentication patterns
- Lateral movement attempts
- Privilege escalation
- Data exfiltration indicators
- Suspicious PowerShell/script execution
- Registry persistence attempts
- Scheduled task creation
- Service creation
- {other-behaviors-specific-to-attack}

**EDR/SIEM Rules:**

```
# Enhanced behavioral detection
Multiple failed authentication attempts
AND
Successful authentication from unusual location
OR
Unusual process execution (PowerShell, wscript, etc.)
OR
Large data transfers (> {threshold})

Alert Priority: High
Notification: Security Team
```

**Behavioral monitoring configured:** {Y/N}

**3. Affected System Monitoring:**

Lowered alert thresholds for previously affected systems.

**Affected Systems:** {list}

**Monitoring Enhancements:**

- EDR telemetry increased (if available)
- SIEM log collection priority elevated
- Alert thresholds lowered (more sensitive)
- Daily security scans scheduled
- Weekly manual review scheduled

**Enhanced system monitoring configured:** {Y/N}

**4. Alert Threshold Adjustments:**

**Current SIEM/EDR Thresholds:**

| Alert Type | Normal Threshold | Enhanced Threshold (30-90 days) | Rationale |
|------------|-----------------|-------------------------------|-----------|
| Failed logins | 10 in 1 hour | 5 in 1 hour | Detect credential attacks faster |
| Data transfer | 10GB in 1 hour | 5GB in 1 hour | Detect exfiltration faster |
| Process anomaly | Medium confidence | Low confidence | Catch subtle variations |

**Thresholds adjusted:** {Y/N}

**5. Monitoring Duration and Review:**

**Monitoring Schedule:**

- **Week 1-4:** Daily security review of affected systems
- **Week 5-8:** Every 3 days security review
- **Week 9-12:** Weekly security review
- **End of monitoring period:** Return to normal thresholds

**Monitoring review owner:** {prompt-for-name}
**Monitoring start date:** {current-date}
**Monitoring end date:** {date-plus-90-days}

**Calendar reminders set:** {Y/N}

**Enhanced monitoring fully configured? (Y/N):**"

### 6. Business Operations Confirmation

"**BUSINESS OPERATIONS CONFIRMATION**

**Final confirmation that business operations are fully restored.**

**Business Readiness Checklist:**

- [ ] All critical systems (P1) operational
- [ ] All high priority systems (P2) operational
- [ ] All standard systems (P3) operational
- [ ] All services resumed
- [ ] User access restored
- [ ] Customer-facing services available
- [ ] No operational issues reported
- [ ] Performance metrics normal
- [ ] Business processes functioning normally

**Business Operations Status:** {FULLY RESTORED / PARTIAL / ISSUES}

**If FULLY RESTORED:**

**Executive Confirmation:**

- **Executive Sponsor:** {prompt-for-name}
- **Title:** {CTO/CIO/CISO}
- **Confirmation:** Business operations fully restored
- **Signature/Approval:** {prompt-for-approval}
- **Timestamp:** {current-timestamp}

✅ **BUSINESS OPERATIONS FULLY RESTORED**

**Recovery Phase Complete:** {timestamp}
**Total Recovery Duration:** {duration-from-step-2b-start}"

### 7. Document Recovery

"**DOCUMENTING RECOVERY...**"

**Append to Section 6 (Recovery Status) in output file:**

```markdown
## 6. Recovery Status

**Recovery Phase:** {start-timestamp} to {completion-timestamp}
**Total Recovery Duration:** {duration}

### 6.1 System Restoration

**Restoration Priority and Timeline:**

| System | Priority | Restoration Method | Duration | Functional Test | Security Test | Business Approval | IT Approval | Operational |
|--------|----------|-------------------|----------|----------------|---------------|-------------------|-------------|-------------|
| {hostname} | P1 | {method} | {mins} | Pass ✅ | Pass ✅ | {name} | {name} | {timestamp} |

**Restoration Statistics:**
- **P1 Systems Restored:** {count} systems in {duration}
- **P2 Systems Restored:** {count} systems in {duration}
- **P3 Systems Restored:** {count} systems in {duration}
- **Total Systems Restored:** {count} systems
- **Average Restoration Time:** {minutes}

### 6.2 Restoration Methods Used

- **Backup Restore:** {count} systems
- **Rebuild from Scratch:** {count} systems
- **Patch-in-Place:** {count} systems

### 6.3 Service Resumption

**Services Restored:**

| Service | Dependencies Verified | Service Started | Integration Test | Business Approval | Operational Timestamp |
|---------|---------------------|-----------------|------------------|-------------------|---------------------|
| {service} | ✅ | ✅ | Pass ✅ | {name} | {timestamp} |

**All services operational:** ✅

### 6.4 Enhanced Monitoring

**Monitoring Period:** {30/60/90} days
**Monitoring Start:** {start-date}
**Monitoring End:** {end-date}

**IOC Monitoring:**
- Malicious IPs monitored: {count}
- Malicious domains monitored: {count}
- Malware hashes monitored: {count}
- SIEM rules configured: ✅

**Behavioral Monitoring:**
- Enhanced behavioral detection rules: {count} rules
- Alert thresholds lowered: ✅
- Affected systems flagged for enhanced monitoring: {count}

**Monitoring Configuration:**
- EDR telemetry increased: ✅
- SIEM priority elevated: ✅
- Daily security scans scheduled: ✅
- Weekly manual review scheduled: ✅

**Monitoring Review Owner:** {name}

### 6.5 Business Operations Confirmation

**Business Operations Status:** FULLY RESTORED ✅

**Executive Confirmation:**
- **Executive Sponsor:** {name}, {title}
- **Confirmation:** Business operations fully restored
- **Timestamp:** {timestamp}

**Recovery Phase Complete:** {timestamp}
```

**Update sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Recovery
- Action: Complete system restoration and service resumption
- Details: |
    Recovery Phase Complete

    System Restoration:
    - P1 systems restored: {count} in {duration}
    - P2 systems restored: {count} in {duration}
    - P3 systems restored: {count} in {duration}
    - Total systems restored: {count}

    Restoration Methods:
    - Backup restore: {count}
    - Rebuild: {count}
    - Patch-in-place: {count}

    All systems validated (functional, security, performance)
    All systems approved by business owners and IT operations

    Service Resumption:
    - Services resumed: {count}
    - All integration tests passed
    - Business operations fully restored

    Enhanced Monitoring:
    - Monitoring period: {90} days
    - IOC monitoring configured
    - Behavioral monitoring enhanced
    - Alert thresholds lowered
    - Daily security reviews scheduled

    Executive Confirmation:
    - {name} ({title}) confirmed operations restored at {timestamp}

    Recovery Duration: {total-duration}
- Performed By: {user-name}
---
```

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]
status: 'Recovery Complete - Post-Incident Analysis Pending'
lastUpdated: '{timestamp}'
```

### 8. Present MENU OPTIONS (Recovery Complete)

Display: **Select an Option:** [P] Party Mode [C] Continue to Post-Incident Analysis

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} - Recommend Bastion (strategic advisor) for recovery review
- IF C: Continue to Part 2 (Post-Incident Analysis and Final Report)
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options-recovery-complete)

**When user selects C, continue immediately to Part 2 below.**

---

# PART 2: POST-INCIDENT ANALYSIS AND FINAL REPORT

---

### 9. Post-Incident Analysis

"**📊 POST-INCIDENT ANALYSIS 📊**

**Incident:** {incident-id} - {incident-type}

Now that operations are restored, let's conduct comprehensive post-incident analysis.

---

**WHAT WORKED WELL**

What aspects of the incident response were effective?

Examples:
- Detection was rapid
- Containment prevented lateral movement
- Communication was clear
- Team collaboration was excellent
- Playbook was helpful
- Tools performed well
- Evidence collection was thorough

**What worked well:** {prompt-for-list-with-details}

---

**WHAT COULD BE IMPROVED**

What aspects of the incident response need improvement?

Examples:
- Detection was delayed
- Containment took too long
- Communication gaps existed
- Authority/decision-making unclear
- Playbook was missing steps
- Tools had gaps
- Staffing was insufficient
- Training needs identified

**What could be improved:** {prompt-for-list-with-details}

---

**CHALLENGES FACED**

What challenges or obstacles did the team encounter?

Examples:
- Lack of visibility into certain systems
- Difficulty coordinating with third parties
- Legal/compliance questions caused delays
- Tool limitations
- Staff fatigue during extended response
- Business pressure to restore quickly
- Insufficient documentation

**Challenges faced:** {prompt-for-list-with-details}

---

**RESPONSE TIME METRICS**

Let's calculate key incident response metrics.

**Mean Time to Detect (MTTD):**
- **Attack started (estimated):** {prompt-for-estimated-start}
- **First detection:** {detection-timestamp-from-step-2b}
- **MTTD:** {calculated-duration}

**Mean Time to Contain (MTTC):**
- **First detection:** {detection-timestamp}
- **Containment complete:** {containment-timestamp-from-step-3b}
- **MTTC:** {calculated-duration}

**Mean Time to Eradicate (MTTE):**
- **Eradication start:** {eradication-start-from-step-6b}
- **Eradication complete:** {eradication-complete}
- **MTTE:** {calculated-duration}

**Mean Time to Recover (MTTR):**
- **Recovery start:** {recovery-start-timestamp}
- **Recovery complete:** {recovery-complete-timestamp}
- **MTTR:** {calculated-duration}

**Total Incident Duration:**
- **Attack start (estimated):** {estimated-start}
- **Incident closed:** {current-timestamp}
- **Total Duration:** {calculated-duration}

**Dwell Time (attacker in environment before detection):** {calculated-duration}

**Metrics documented? (Y/N):**"

### 10. Effectiveness Evaluation

"**EFFECTIVENESS RATINGS**

Rate the effectiveness of each phase on a scale of 1-5:
- **1** = Ineffective, major failures
- **2** = Below expectations, significant issues
- **3** = Adequate, met basic requirements
- **4** = Good, exceeded expectations in some areas
- **5** = Excellent, exceeded expectations across the board

**Detection Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Containment Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Eradication Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Recovery Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Communication Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Tool Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Overall Response Effectiveness:**
- **Rating (1-5):** {prompt-for-rating}
- **Rationale:** {prompt-for-explanation}

**Effectiveness evaluation documented? (Y/N):**"

### 11. Recommendations

"**RECOMMENDATIONS**

Based on this incident, what improvements should be made?

---

**TECHNICAL RECOMMENDATIONS**

**Detection Improvements:**

What technical improvements would improve detection?

Examples:
- Deploy EDR to uncovered systems
- Implement UEBA (User and Entity Behavior Analytics)
- Add new SIEM correlation rules
- Improve log collection coverage
- Implement network traffic analysis
- Deploy deception technology

**Detection recommendations:** {prompt-for-list-with-priority}

**Prevention Improvements:**

What technical improvements would prevent similar incidents?

Examples:
- Patch management improvements
- Configuration hardening standards
- Network segmentation
- Privilege access management (PAM)
- Email security enhancements (anti-phishing)
- Endpoint protection improvements
- Application whitelisting

**Prevention recommendations:** {prompt-for-list-with-priority}

**Response Improvements:**

What technical improvements would improve response?

Examples:
- Automated containment capabilities
- Forensic collection automation
- Threat intelligence integration
- Sandbox/malware analysis capability
- Orchestration/SOAR platform

**Response recommendations:** {prompt-for-list-with-priority}

---

**PROCESS RECOMMENDATIONS**

What process improvements are needed?

Examples:
- Update incident response playbooks
- Clarify escalation procedures
- Improve communication templates
- Define authority/decision rights
- Establish vendor contact procedures
- Improve coordination with legal/PR
- Business continuity plan updates

**Process recommendations:** {prompt-for-list-with-priority}

---

**TRAINING RECOMMENDATIONS**

What training is needed?

Examples:
- Incident response tabletop exercises
- Technical tool training (EDR, SIEM, forensics)
- Threat hunting training
- Malware analysis training
- Security awareness training (users)
- Executive crisis management training

**Training recommendations:** {prompt-for-list-with-priority}

---

**TOOL RECOMMENDATIONS**

What tools are needed or need improvement?

Examples:
- EDR platform upgrade
- SIEM platform upgrade
- Threat intelligence platform
- Forensic tools
- Orchestration/SOAR platform
- Backup/recovery improvements
- Network visibility tools

**Tool recommendations:** {prompt-for-list-with-priority}

---

**RECOMMENDATIONS SUMMARY TABLE:**

| Recommendation | Category | Priority | Estimated Cost | Owner | Target Completion |
|----------------|----------|----------|---------------|-------|------------------|
| {recommendation} | Technical | Critical/High/Medium/Low | {cost} | {owner} | {date} |

**All recommendations documented? (Y/N):**"

### 12. Follow-Up Actions

"**FOLLOW-UP ACTIONS**

Convert recommendations into actionable follow-up items.

**For each recommendation, create follow-up action:**

**Action Item 1:**
- **Action:** {description}
- **Owner:** {prompt-for-name}
- **Due Date:** {prompt-for-date}
- **Success Criteria:** {how-will-we-know-its-done}
- **Status:** Not Started / In Progress / Complete
- **Tracking Mechanism:** {Jira/ServiceNow/Spreadsheet}

**Repeat for all critical/high priority recommendations.**

**Follow-Up Actions Summary:**

| Action | Owner | Due Date | Success Criteria | Status | Tracking Link |
|--------|-------|----------|------------------|--------|--------------|
| {action} | {name} | {date} | {criteria} | Not Started | {link} |

**Follow-up actions assigned and tracked? (Y/N):**"

### 13. Compliance Verification

"**COMPLIANCE VERIFICATION**

**Regulatory Notification Requirements:**

Based on incident type and impact, verify all compliance obligations met.

---

**GDPR (if applicable):**

- **Was personal data breached:** {Y/N}
- **If YES:**
  - [ ] Data Protection Authority (DPA) notified within 72 hours
  - [ ] Notification date/time: {timestamp}
  - [ ] Individuals notified (if high risk)
  - [ ] Notification date/time: {timestamp}
  - [ ] Documentation retained: ✅

**GDPR compliance verified:** {Y/N/N/A}

---

**PCI-DSS (if applicable):**

- **Was cardholder data compromised:** {Y/N}
- **If YES:**
  - [ ] Acquiring bank notified immediately
  - [ ] Notification date/time: {timestamp}
  - [ ] Card brands notified (Visa, Mastercard, etc.)
  - [ ] Notification date/time: {timestamp}
  - [ ] Forensic investigation completed (PFI)
  - [ ] Report submitted: {timestamp}

**PCI-DSS compliance verified:** {Y/N/N/A}

---

**HIPAA (if applicable):**

- **Was PHI/ePHI breached:** {Y/N}
- **If YES:**
  - [ ] OCR notified within 60 days (if > 500 individuals)
  - [ ] Notification date: {date}
  - [ ] Individuals notified within 60 days
  - [ ] Notification date: {date}
  - [ ] Media notice (if required)
  - [ ] Notification date: {date}

**HIPAA compliance verified:** {Y/N/N/A}

---

**State Breach Notification Laws:**

- **Was resident data of any US state compromised:** {Y/N}
- **If YES:**
  - **States affected:** {list}
  - [ ] State notifications sent per state law timelines
  - **Notification dates:** {dates-by-state}

**State law compliance verified:** {Y/N/N/A}

---

**Customer Notifications:**

- **Were customer accounts/data affected:** {Y/N}
- **If YES:**
  - [ ] Customer notification sent
  - [ ] Notification date: {date}
  - [ ] Notification method: {email/letter/phone/portal}
  - [ ] Customer support prepared for inquiries
  - [ ] FAQ published: {Y/N}

**Customer notification complete:** {Y/N/N/A}

---

**Insurance Claim:**

- **Does cyber insurance policy cover this incident:** {Y/N}
- **If YES:**
  - [ ] Insurance carrier notified
  - [ ] Notification date: {date}
  - [ ] Claim filed
  - [ ] Claim number: {claim-number}
  - [ ] Forensic costs covered: {Y/N}
  - [ ] Business interruption covered: {Y/N}

**Insurance claim filed:** {Y/N/N/A}

---

**Compliance Summary:**

| Requirement | Applicable | Notification Sent | Date | Status |
|------------|-----------|------------------|------|--------|
| GDPR | Y/N | Y/N | {date} | Complete/N/A |
| PCI-DSS | Y/N | Y/N | {date} | Complete/N/A |
| HIPAA | Y/N | Y/N | {date} | Complete/N/A |
| State Laws | Y/N | Y/N | {date} | Complete/N/A |
| Customers | Y/N | Y/N | {date} | Complete/N/A |
| Insurance | Y/N | Y/N | {date} | Complete/N/A |

**All compliance obligations met:** {Y/N}

**Compliance verification documented? (Y/N):**"

### 14. Financial Impact

"**FINANCIAL IMPACT ASSESSMENT**

Let's estimate the total cost of this incident.

---

**DIRECT COSTS**

**Incident Response Team Time:**
- **Internal IR team hours:** {prompt-for-hours}
- **Average hourly rate:** {prompt-for-rate}
- **IR team cost:** ${calculated}

**External Forensics:**
- **Forensic firm engaged:** {Y/N}
- **If YES, cost:** ${prompt-for-cost}

**Legal Fees:**
- **Legal counsel cost:** ${prompt-for-cost}

**Notifications:**
- **Notification letters/emails cost:** ${prompt-for-cost}
- **Credit monitoring (if offered):** ${prompt-for-cost}

**Regulatory Fines:**
- **Fines assessed (if any):** ${prompt-for-cost}

**Insurance Deductible:**
- **Deductible paid:** ${prompt-for-cost}

**Direct Costs Subtotal:** ${sum-of-direct-costs}

---

**INDIRECT COSTS**

**System Downtime:**
- **Revenue-generating systems down:** {hours}
- **Estimated revenue loss:** ${prompt-for-estimate}

**Productivity Loss:**
- **Employee productivity impact:** ${prompt-for-estimate}

**Reputation Damage:**
- **Customer churn (estimated):** {count} customers
- **Lost future revenue (estimated):** ${prompt-for-estimate}

**Recovery and Remediation:**
- **System rebuild costs:** ${prompt-for-cost}
- **Security improvements cost:** ${prompt-for-cost}

**Indirect Costs Subtotal:** ${sum-of-indirect-costs}

---

**TOTAL INCIDENT COST**

**Direct Costs:** ${direct-total}
**Indirect Costs:** ${indirect-total}
**Total Incident Cost:** ${grand-total}

**Financial impact documented? (Y/N):**"

### 15. Document Control

"**DOCUMENT CONTROL**

**Incident Report Metadata:**

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {current-date} | {incident-commander-name} | Initial incident report |

**Review and Approval:**

**Reviewed By:**

- **IR Team Lead:** {prompt-for-name} - {prompt-for-date}
- **Security Team Lead:** {prompt-for-name} - {prompt-for-date}
- **IT Operations Manager:** {prompt-for-name} - {prompt-for-date}

**Approved By:**

- **CISO:** {prompt-for-name}
- **Signature/Approval:** {prompt-for-approval}
- **Date:** {current-date}

**Distribution List:**

Who should receive this incident report?

- [ ] CISO
- [ ] CTO/CIO
- [ ] CEO
- [ ] Legal Counsel
- [ ] Compliance Officer
- [ ] Board of Directors
- [ ] Audit Committee
- [ ] Insurance Carrier
- [ ] {Other}

**Distribution list:** {prompt-for-final-list}

**Classification:** Confidential / Restricted / Internal Use Only

**Retention Period:** {7 years / per regulations}

**Document control complete? (Y/N):**"

### 16. Generate Final Report

"**GENERATING FINAL INCIDENT REPORT...**"

**Append to Section 7 (Post-Incident Analysis) in output file:**

```markdown
## 7. Post-Incident Analysis and Lessons Learned

**Analysis Conducted:** {timestamp}
**Analysis Participants:** {list-of-participants}

### 7.1 What Worked Well

{list-what-worked-well}

### 7.2 What Could Be Improved

{list-what-could-be-improved}

### 7.3 Challenges Faced

{list-challenges-faced}

### 7.4 Response Time Metrics

| Metric | Duration | Industry Benchmark | Assessment |
|--------|----------|-------------------|------------|
| MTTD (Mean Time to Detect) | {duration} | {benchmark} | {above/below/at} |
| MTTC (Mean Time to Contain) | {duration} | {benchmark} | {above/below/at} |
| MTTE (Mean Time to Eradicate) | {duration} | {benchmark} | {above/below/at} |
| MTTR (Mean Time to Recover) | {duration} | {benchmark} | {above/below/at} |
| **Total Incident Duration** | **{duration}** | - | - |
| **Dwell Time** | **{duration}** | {benchmark} | {above/below/at} |

### 7.5 Effectiveness Evaluation

| Phase | Rating (1-5) | Rationale |
|-------|-------------|-----------|
| Detection | {rating} | {rationale} |
| Containment | {rating} | {rationale} |
| Eradication | {rating} | {rationale} |
| Recovery | {rating} | {rationale} |
| Communication | {rating} | {rationale} |
| Tools | {rating} | {rationale} |
| **Overall Response** | **{rating}** | **{rationale}** |

### 7.6 Recommendations

#### 7.6.1 Technical Recommendations

**Detection:**
{list-detection-recommendations}

**Prevention:**
{list-prevention-recommendations}

**Response:**
{list-response-recommendations}

#### 7.6.2 Process Recommendations

{list-process-recommendations}

#### 7.6.3 Training Recommendations

{list-training-recommendations}

#### 7.6.4 Tool Recommendations

{list-tool-recommendations}

#### 7.6.5 Recommendations Summary

| Recommendation | Category | Priority | Estimated Cost | Owner | Target Completion |
|----------------|----------|----------|---------------|-------|------------------|
| {recommendation} | {category} | {priority} | {cost} | {owner} | {date} |

### 7.7 Follow-Up Actions

| Action | Owner | Due Date | Success Criteria | Status | Tracking |
|--------|-------|----------|------------------|--------|----------|
| {action} | {name} | {date} | {criteria} | {status} | {link} |

### 7.8 Compliance Verification

| Requirement | Applicable | Notification Sent | Date | Status |
|------------|-----------|------------------|------|--------|
| GDPR | {Y/N} | {Y/N} | {date} | {Complete/N/A} |
| PCI-DSS | {Y/N} | {Y/N} | {date} | {Complete/N/A} |
| HIPAA | {Y/N} | {Y/N} | {date} | {Complete/N/A} |
| State Laws | {Y/N} | {Y/N} | {date} | {Complete/N/A} |
| Customers | {Y/N} | {Y/N} | {date} | {Complete/N/A} |
| Insurance | {Y/N} | {Y/N} | {date} | {Complete/N/A} |

**All compliance obligations met:** ✅

### 7.9 Financial Impact

**Direct Costs:**
- IR Team Time: ${amount}
- External Forensics: ${amount}
- Legal Fees: ${amount}
- Notifications: ${amount}
- Regulatory Fines: ${amount}
- Insurance Deductible: ${amount}
- **Direct Costs Total:** **${total}**

**Indirect Costs:**
- System Downtime: ${amount}
- Productivity Loss: ${amount}
- Reputation Damage: ${amount}
- Recovery/Remediation: ${amount}
- **Indirect Costs Total:** **${total}**

**Total Incident Cost:** **${grand-total}**

### 7.10 Document Control

**Version:** 1.0
**Date:** {current-date}
**Author:** {incident-commander-name}

**Reviewed By:**
- IR Team Lead: {name} - {date}
- Security Team Lead: {name} - {date}
- IT Operations Manager: {name} - {date}

**Approved By:**
- CISO: {name} - {date}

**Classification:** {classification}
**Retention Period:** {period}
**Distribution:** {distribution-list}

---

## Executive Summary

**Incident ID:** {incident-id}
**Incident Type:** {incident-type}
**Severity:** {severity}

**Timeline:**
- **Incident Start (estimated):** {start-date}
- **Detection:** {detection-date}
- **Containment:** {containment-date}
- **Eradication:** {eradication-date}
- **Recovery:** {recovery-date}
- **Incident Closed:** {closure-date}
- **Total Duration:** {duration}

**Impact:**
- **Systems Affected:** {count}
- **Services Impacted:** {count}
- **Data Compromised:** {Y/N - description}
- **Financial Impact:** ${total-cost}

**Response Effectiveness:** {rating}/5

**Key Findings:**
{brief-summary-of-root-cause}

**Key Recommendations:**
{top-3-recommendations}

**Status:** Incident closed - all systems restored - enhanced monitoring active for {90} days

---

**Report Generated:** {timestamp}
**Report Version:** 1.0
**Classification:** {classification}
```

### 17. Close Sidecar File

"**CLOSING SIDECAR FILE...**"

**Append final entry to sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Closure
- Action: Incident closed - final report complete
- Details: |
    INCIDENT CLOSED

    Final Statistics:
    - Total duration: {duration}
    - Systems affected: {count}
    - Systems restored: {count}
    - Total cost: ${amount}

    Post-Incident Analysis:
    - Overall response effectiveness: {rating}/5
    - Recommendations generated: {count}
    - Follow-up actions assigned: {count}
    - All compliance obligations met

    Deliverables:
    - Comprehensive incident report (9 sections)
    - MITRE ATT&CK mapping
    - Evidence inventory with chain of custody
    - Recovery documentation
    - Lessons learned
    - Recommendations with priorities
    - Follow-up action plan
    - Financial impact analysis

    Enhanced Monitoring:
    - Active for {90} days
    - Review owner: {name}
    - End date: {date}

    Incident Status: CLOSED
- Performed By: {user-name}
---

# INCIDENT CLOSED
# Timeline tracking complete
# Enhanced monitoring continues until {end-date}
```

### 18. Mark Workflow Complete

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]
status: 'Incident Closed - Enhanced Monitoring Active'
workflowComplete: true
completionTimestamp: '{current-timestamp}'
lastUpdated: '{timestamp}'
```

### 19. Success Message

Display:

"**🎉 INCIDENT RESPONSE COMPLETE 🎉**

**Incident:** {incident-id} - {incident-type}

✅ **WORKFLOW COMPLETE**

**Summary:**

**Response Timeline:**
- **Detection:** {detection-date}
- **Containment:** {containment-date} ({mttc})
- **Eradication:** {eradication-date} ({mtte})
- **Recovery:** {recovery-date} ({mttr})
- **Closure:** {current-date}
- **Total Duration:** {total-duration}

**Systems Impact:**
- **Systems Affected:** {count}
- **Systems Restored:** {count} (100%)
- **Services Restored:** {count} (100%)

**Response Effectiveness:** {rating}/5

**Deliverables Generated:**

1. ✅ **Comprehensive Incident Report** ({outputFile})
   - 9 sections covering full incident lifecycle
   - Executive summary
   - MITRE ATT&CK mapping
   - Root cause analysis
   - Lessons learned
   - Recommendations with priorities
   - Financial impact analysis
   - Compliance verification

2. ✅ **Incident Timeline** ({sidecarFile})
   - Detailed timestamped timeline
   - All actions documented
   - Evidence chain of custody
   - Forensic-quality documentation

3. ✅ **Follow-Up Action Plan**
   - {count} recommendations
   - {count} action items assigned
   - Owners and due dates established
   - Tracking mechanism in place

4. ✅ **Enhanced Monitoring**
   - Active for {90} days
   - IOC monitoring configured
   - Behavioral detection enhanced
   - Review schedule established

**Next Steps:**

1. **Enhanced Monitoring:** Active until {end-date}
   - Daily reviews (weeks 1-4)
   - Review owner: {name}

2. **Follow-Up Actions:** {count} action items
   - Track progress in {tracking-system}
   - Review in incident response team meetings

3. **Lessons Learned Distribution:**
   - Share report with distribution list
   - Conduct team debrief session
   - Update incident response playbooks

4. **Compliance:**
   - All regulatory notifications sent ✅
   - Customer notifications sent ✅
   - Insurance claim filed ✅

**Files Location:**
- **Incident Report:** {outputFile}
- **Incident Timeline:** {sidecarFile}

**Thank you for your thorough incident response work. The organization's security posture is stronger as a result.**

**Incident Status:** CLOSED ✅

---

Would you like me to generate any additional documentation or analysis? (Y/N)"

**If user says No or ends conversation, workflow is complete.**

**If user requests additional analysis, provide it, but workflow is marked complete.**

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All systems restored to operational status
- Business approval received for all systems/services
- Enhanced monitoring configured for 30-90 days
- Executive confirmation of operations restored
- Post-incident analysis completed (what worked, what didn't, challenges, metrics)
- Effectiveness evaluation completed (ratings for all phases)
- Recommendations generated (technical, process, training, tool)
- Follow-up actions assigned with owners and due dates
- Compliance verification completed (GDPR, PCI-DSS, HIPAA, state laws, customers, insurance)
- Financial impact assessed (direct and indirect costs)
- Document control completed (version, approvals, distribution)
- Section 6 (Recovery Status) documented in report
- Section 7 (Post-Incident Analysis) documented in report
- Executive summary generated
- Sidecar file closed with final entry
- Frontmatter updated: workflowComplete: true, stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b, 7b]
- Success message displayed with deliverables

### ❌ SYSTEM FAILURE:

- Skipping business approval (systems returned to production without authorization)
- Not configuring enhanced monitoring (missing potential re-compromise)
- Incomplete post-incident analysis (no lessons learned)
- Missing recommendations (no improvements made)
- Skipping compliance verification (regulatory violations)
- Not closing sidecar file (incomplete documentation)
- Not marking workflowComplete: true
- Missing executive summary
- Incomplete financial impact assessment

**Master Rule:** This is the FINAL step. All analysis, documentation, approvals, and closure requirements are MANDATORY. Skipping any closure step is FORBIDDEN and constitutes SYSTEM FAILURE. The workflow MUST be marked complete with workflowComplete: true.
