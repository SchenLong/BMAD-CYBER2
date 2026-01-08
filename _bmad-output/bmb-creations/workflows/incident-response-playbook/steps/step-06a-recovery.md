---
name: 'step-06a-recovery'
description: 'Define system restoration procedures, validation testing, and enhanced monitoring plans'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-06a-recovery.md'
nextStepFile: '{workflow_path}/steps/step-07a-post-incident.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingWorkflow: '{project-root}/_bmad/core/workflows/brainstorming/workflow.md'
---

# Step 6A: Recovery Procedures

## STEP GOAL:

To define comprehensive system restoration procedures including prioritization, restoration methods, validation testing, enhanced monitoring, and return-to-normal-operations criteria for {incident-type} incidents.

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

- 🎯 Focus ONLY on recovery and restoration procedures
- 🚫 FORBIDDEN to start defining post-incident activities (that's step 7a)
- 💬 Guide through conversational exploration of recovery strategies
- 🎨 Brainstorming ENCOURAGED for creative recovery approaches
- 👥 Party Mode (Bastion) AVAILABLE for architecture validation expertise

## EXECUTION PROTOCOLS:

- 🎯 Leverage all previous sections (eradication must be complete and validated)
- 💾 Append to Section 5 (Recovery Procedures) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Eradication validated complete in step 5a
- Focus on HOW to safely restore systems and services
- Don't define HOW to conduct post-incident review yet (that's step 7a)
- Recovery must be methodical - rushing causes reinfection or data loss

## RECOVERY PROCEDURE SEQUENCE:

### 1. Review Context

Display:

"**Recovery Procedures for {incident-type}**

Eradication is complete and validated (Section 4). Now we can safely restore systems and return to normal operations.

**NIST Recovery Phase Goals:**
1. **Restore Systems:** Bring systems back online in priority order
2. **Validate Function:** Ensure systems operate correctly
3. **Monitor Enhanced:** Watch for signs of reinfection
4. **Return to Normal:** Gradually reduce enhanced monitoring

**Critical Recovery Principles:**
- **Methodical, not rushed:** Each system validated before next
- **Test before production:** Verify functionality before business use
- **Monitor intensely:** Enhanced monitoring for reinfection signs
- **Document everything:** Recovery actions, timestamps, validators

**From Previous Sections:**
- Incident Type: {incident-type}
- Affected Systems: {summary}
- Eradication Complete: {sign-off-from-section-4}

Let's design your recovery procedures."

### 2. System Restoration Prioritization

Engage in conversation:

"**Recovery Prioritization for Your Organization**

Not all systems can be recovered simultaneously. Let's prioritize based on business criticality.

**NIST recommends priority-based recovery:**
- **P1 (Critical):** Business cannot operate without these (restore first)
- **P2 (High):** Significant business impact (restore second)
- **P3 (Standard):** Limited business impact (restore last)

**For {incident-type} affecting {affected-systems-profile}, let's categorize:**

**What systems are P1 (Critical)?**
- Examples: Payment processing, authentication servers, database servers, etc.
- Business Impact if offline: {impact}
- Maximum acceptable downtime: {timeframe}

**What systems are P2 (High)?**
- Examples: Email, file servers, internal applications
- Business Impact: {impact}
- Maximum acceptable downtime: {timeframe}

**What systems are P3 (Standard)?**
- Examples: Dev/test systems, workstations, non-critical apps
- Business Impact: {minimal}
- Acceptable downtime: {timeframe}

**Dependencies:**
Do any P2/P3 systems depend on P1 systems? Let's map dependencies:
- System A depends on: {list}
- System B depends on: {list}

Let's work together to create your prioritized restoration order."

Document:
- P1 systems list with business justification
- P2 systems list
- P3 systems list
- Dependency map
- Estimated restoration time per priority tier

### 3. System Restoration Methods

"**Restoration Methods for {incident-type}**

For each affected system, how will you restore it to a clean, operational state?

**Restoration Options:**

**Option 1: Restore from Known-Good Backup**
- **When to use:** Clean backup exists from before compromise
- **Requirements:**
  - Backup validation: Backup pre-dates compromise
  - Backup integrity: Not corrupted or compromised
  - Backup completeness: All data needed for operation
- **Process:**
  1. Verify backup date: {timestamp-before-compromise}
  2. Test restore on non-production system (if time allows)
  3. Restore to production
  4. Apply patches/updates from Section 4.4
  5. Validate (Section 6.4)

- **Your backup solution:** {backup-platform-from-section-1}
- **Backup frequency:** {frequency}
- **Restore time:** {estimated-duration-per-system}

**Option 2: Rebuild from Scratch (Gold Image)**
- **When to use:** No clean backup OR uncertainty about backup integrity
- **Requirements:**
  - Gold image/template available
  - Configuration management (Ansible/Puppet/etc.)
  - Application reinstallation process
- **Process:**
  1. Deploy gold image
  2. Apply configuration management
  3. Install applications
  4. Restore data only (from verified backup)
  5. Apply patches/hardening from Section 4.4
  6. Validate

- **Do you have gold images for: {affected-system-types}?**
- **Configuration management used:** {tooling}
- **Rebuild time:** {estimated-duration-per-system}

**Option 3: Patch and Harden (In-Place Recovery)**
- **When to use:** System cleanly remediated, just needs patching
- **Requirements:**
  - Eradication validation passed (Section 4.5)
  - Patches available (Section 4.4)
- **Process:**
  1. Verify eradication complete
  2. Apply patches
  3. Apply hardening (Section 4.4)
  4. Update configurations
  5. Validate

- **When is in-place recovery appropriate for {incident-type}?**

**For your environment, which restoration method is preferred for each system type?**

Let's document the restoration method for each category:
- Domain Controllers: {method}
- Application Servers: {method}
- Database Servers: {method}
- Web Servers: {method}
- Workstations: {method}
- Other: {method}"

### 4. Restoration Procedures (Step-by-Step)

"**Detailed Restoration Steps**

Let's create step-by-step procedures for restoring each system type.

**Restoration Procedure Template:**

For each system or system type, document:

1. **Pre-Restoration:**
   - [ ] Eradication validated (Section 4.5 sign-off)
   - [ ] Backup/image verified
   - [ ] Dependencies restored (if applicable)
   - [ ] Change control approved (if required)
   - [ ] Stakeholders notified

2. **Restoration Steps:**
   - [ ] {step-1-specific-to-system-type}
   - [ ] {step-2}
   - [ ] {step-3}
   - [ ] Apply patches (Section 4.4)
   - [ ] Apply hardening (Section 4.4)
   - [ ] Restore data (if applicable)
   - [ ] Update configurations

3. **Post-Restoration:**
   - [ ] Validation testing (Section 6.4)
   - [ ] Enhanced monitoring enabled (Section 6.5)
   - [ ] Document restoration timestamp
   - [ ] Sign-off: {who}

Let's work through restoration procedures for your critical systems.

**Example: Domain Controller Restoration**

Would you like me to help create detailed procedures for:
- Domain Controllers
- Database Servers
- Web/Application Servers
- File Servers
- Workstations
- Other critical systems

What's your highest priority system type?"

Work conversationally through each system type to create detailed, step-by-step procedures.

### 5. Validation Testing

"**Restoration Validation Testing**

Before declaring a system recovered, it must pass validation tests.

**Validation Testing Framework:**

**1. Functional Testing:**
Does the system operate correctly?

- [ ] **Service Availability:**
  - Service starts successfully
  - Service responds to health checks
  - Service accessible to users (if user-facing)

- [ ] **Application Functionality:**
  - Core functions work (login, transactions, data access)
  - Integrations functional (APIs, databases, external systems)
  - Performance acceptable (response times, throughput)

- [ ] **Data Integrity:**
  - Data restored completely
  - No corruption detected
  - Latest approved changes present (check timestamp)

**2. Security Testing:**
Is the system secure and hardened?

- [ ] **Patch Status:**
  - All patches applied (Section 4.4)
  - Patch verification: {method}

- [ ] **Hardening Applied:**
  - Configuration hardening (Section 4.4)
  - Security baselines met
  - Compliance checks passed

- [ ] **No Malware:**
  - EDR scan: Clean
  - AV scan: Clean
  - No IOCs detected (Section 2.1)

- [ ] **Authentication:**
  - Credentials reset (Section 4.3)
  - MFA functioning
  - No unauthorized accounts

**3. Performance Testing:**
Does the system meet performance requirements?

- [ ] **Load Testing (if applicable):**
  - Handles expected user load
  - Response times acceptable
  - No degradation

- [ ] **Capacity:**
  - CPU/Memory/Disk utilization normal
  - Network connectivity adequate

**4. Integration Testing:**
Do dependent systems work together?

- [ ] **Upstream Dependencies:**
  - System can reach required services
  - Authentication working

- [ ] **Downstream Dependencies:**
  - Dependent systems can reach this system
  - APIs functional

**For {incident-type} recovery, what are your specific validation tests?**

Let's customize the validation checklist for your critical systems."

### 6. Enhanced Monitoring

"**Enhanced Post-Recovery Monitoring**

After restoration, implement enhanced monitoring to detect any signs of reinfection.

**Enhanced Monitoring Requirements:**

**Duration:**
- How long to maintain enhanced monitoring?
  - NIST recommendation: 30-90 days minimum
  - Your organization: {duration-based-on-incident-severity}

**What to Monitor:**

1. **IOC Monitoring (from Section 2.1):**
   - [ ] Alert on any IOC detection (zero tolerance)
   - [ ] Monitor: Network IPs/domains, file hashes, process behaviors
   - [ ] SIEM rules: {enhanced-rules}

2. **Behavioral Monitoring:**
   - [ ] Unusual authentication patterns
   - [ ] Lateral movement attempts
   - [ ] Privilege escalation attempts
   - [ ] Data exfiltration patterns
   - [ ] New scheduled tasks/services
   - [ ] Process injection attempts

3. **System Health:**
   - [ ] Performance degradation
   - [ ] Unexpected reboots
   - [ ] Service failures
   - [ ] Disk space anomalies

4. **User Activity:**
   - [ ] Account usage patterns
   - [ ] Access to sensitive data
   - [ ] Off-hours activity

**Monitoring Configuration:**

**SIEM ({siem-platform}):**
- [ ] Enhanced correlation rules: {new-rules}
- [ ] Lower alert thresholds: {thresholds}
- [ ] Additional log sources: {sources}
- [ ] Alert routing: {escalation-for-post-recovery-alerts}

**EDR ({edr-platform}):**
- [ ] Enhanced detection policies: {policies}
- [ ] Behavioral analytics: {rules}
- [ ] Elevated telemetry collection: {scope}

**Network Monitoring:**
- [ ] IDS/IPS sensitivity: Elevated
- [ ] NetFlow analysis: Enhanced
- [ ] DNS monitoring: {enhanced-rules}

**Who monitors during enhanced period?**
- 24/7 SOC: {yes/no}
- Dedicated IR watchstander: {yes/no}
- On-call rotation: {schedule}

**Alert Response During Enhanced Monitoring:**
- Any IOC detection → {immediate-response-procedure}
- Suspicious behavior → {investigation-procedure}
- False positives → {tuning-procedure}"

### 7. Return to Normal Operations

"**Return to Normal Operations Criteria**

When can you declare the incident fully resolved and return to standard monitoring?

**Return-to-Normal Checklist:**

**Systems:**
- [ ] All affected systems restored
- [ ] All systems validated (functional, secure, performant)
- [ ] All P1 systems operational: {list}
- [ ] All P2 systems operational: {list}
- [ ] All P3 systems operational: {list}

**Security:**
- [ ] No IOC detections for {duration-e.g.-30-days}
- [ ] No anomalous behavior detected
- [ ] Threat hunting shows no compromise (Section 4.5)
- [ ] All vulnerabilities remediated (Section 4.4)
- [ ] All credentials reset (Section 4.3)

**Monitoring:**
- [ ] Enhanced monitoring duration complete: {duration}
- [ ] Ready to return to standard monitoring
- [ ] Monitoring tools tuned (false positives resolved)

**Business:**
- [ ] Business operations normal
- [ ] User complaints resolved
- [ ] Performance metrics normal
- [ ] SLAs met

**Documentation:**
- [ ] All recovery actions documented
- [ ] Timeline complete
- [ ] Lessons learned captured (Section 7)
- [ ] Incident report finalized (Section 7)

**Sign-Off for Return to Normal:**
- [ ] IR Team Lead: _________________ Date: _______
- [ ] IT Operations Lead: _________________ Date: _______
- [ ] Business Owner: _________________ Date: _______
- [ ] CISO: _________________ Date: _______

**Gradual Transition:**
Rather than abruptly returning to normal, consider gradual transition:
- Week 1-2: Full enhanced monitoring
- Week 3-4: Reduced enhanced monitoring (50% thresholds)
- Week 5-6: Standard monitoring with periodic threat hunting
- Week 7+: Normal operations"

### 8. Recovery Coordination and Communication

"**Recovery Team Coordination**

Recovery requires orchestration across multiple teams.

**Recovery Team Roles:**
- **Recovery Manager:** {role-typically-IR-team-lead}
  - Oversees entire recovery effort
  - Approves progression to next system
  - Escalation point

- **System Owners:** {roles-per-system-type}
  - Execute restoration procedures
  - Perform validation testing
  - Sign off on system recovery

- **Security Team:** {role}
  - Verify eradication complete before recovery
  - Monitor for reinfection during recovery
  - Validate security hardening

- **Business Representatives:** {roles}
  - Approve system restoration priority
  - Validate business functionality
  - Approve return to normal operations

**Communication Plan:**
- **Status Updates:** {frequency-e.g.-every-4-hours}
  - To: {stakeholders}
  - Content: Systems recovered, in progress, pending

- **Recovery Milestones:**
  - P1 systems recovered → Notify: {stakeholders}
  - P2 systems recovered → Notify: {stakeholders}
  - All systems recovered → Notify: {stakeholders}

- **User Communication:**
  - When systems coming back online: {notification-method}
  - When fully operational: {notification-method}
  - Guidance for users: {instructions}"

### 9. Document Recovery Procedures

Append to Section 5 (Recovery Procedures) in output file:

```markdown
## 5. Recovery Procedures

### 5.1 System Restoration Priority

**Priority-based recovery ensures critical business functions restored first.**

**P1 (Critical) - Restore First:**
| System | Business Justification | Max Downtime | Dependencies | Est. Recovery Time |
|--------|------------------------|--------------|--------------|-------------------|
| {system-1} | {justification} | {timeframe} | {dependencies} | {duration} |
| {system-2} | {justification} | {timeframe} | {dependencies} | {duration} |

**P2 (High) - Restore Second:**
| System | Business Impact | Max Downtime | Dependencies | Est. Recovery Time |
|--------|-----------------|--------------|--------------|-------------------|
| {system-1} | {impact} | {timeframe} | {dependencies} | {duration} |
| {system-2} | {impact} | {timeframe} | {dependencies} | {duration} |

**P3 (Standard) - Restore Last:**
| System | Business Impact | Acceptable Downtime | Dependencies | Est. Recovery Time |
|--------|-----------------|---------------------|--------------|-------------------|
| {system-1} | {impact} | {timeframe} | {dependencies} | {duration} |
| {system-2} | {impact} | {timeframe} | {dependencies} | {duration} |

**Restoration Order (considering dependencies):**
1. {system-or-system-type}
2. {system-or-system-type}
3. {system-or-system-type}
4. {continue-through-all-systems}

### 5.2 Restoration Methods

**Restoration method per system type:**

| System Type | Preferred Method | Backup/Image Source | Rationale |
|-------------|------------------|---------------------|-----------|
| Domain Controllers | {rebuild-or-restore} | {source} | {reason} |
| Database Servers | {method} | {source} | {reason} |
| Application Servers | {method} | {source} | {reason} |
| Web Servers | {method} | {source} | {reason} |
| File Servers | {method} | {source} | {reason} |
| Workstations | {method} | {source} | {reason} |

**Backup Infrastructure:**
- Backup Solution: {backup-platform}
- Backup Frequency: {frequency}
- Backup Retention: {duration}
- Backup Validation: {how-to-verify-backup-pre-dates-compromise}
- Restore Time (per system): {average-duration}

**Gold Images/Templates:**
- Available for: {system-types}
- Configuration Management: {tool-e.g.-Ansible-SCCM}
- Image Update Frequency: {frequency}
- Image Storage: {location}

### 5.3 System Restoration Procedures

**{System Type 1} Restoration:**

**Pre-Restoration:**
- [ ] Eradication validated (Section 4.5 sign-off confirmed)
- [ ] Backup/image verified: {verification-method}
- [ ] Dependencies restored: {list-if-applicable}
- [ ] Change control: {approval-if-required}
- [ ] Stakeholders notified: {business-owner-it-ops}

**Restoration Steps:**
1. {step-1-detailed-command-or-action}
2. {step-2}
3. {step-3}
4. Apply patches from Section 4.4: {patch-list}
5. Apply hardening from Section 4.4: {hardening-list}
6. {continue-through-all-restoration-steps}

**Post-Restoration:**
- [ ] Validation testing (Section 5.4): {pass/fail}
- [ ] Enhanced monitoring enabled (Section 5.5): {confirmed}
- [ ] Documentation: Restored at {timestamp} by {name}
- [ ] Sign-off: {role} _________________ Date: _______

**Rollback Plan (if restoration fails):**
- Criteria for rollback: {criteria}
- Rollback procedure: {steps}
- Decision maker: {role}

**{Repeat for each critical system type}**

### 5.4 Restoration Validation

**Every restored system MUST pass validation before considered recovered.**

**Validation Checklist:**

**1. Functional Testing:**
- [ ] Service starts successfully
- [ ] Service responds to health checks
- [ ] Users can access (if user-facing)
- [ ] Core functions operate: {list-critical-functions}
- [ ] Integrations functional: {list-dependencies}
- [ ] Performance acceptable: {response-time-requirements}
- [ ] Data integrity verified: {verification-method}

**2. Security Testing:**
- [ ] All patches applied and verified: {verification-method}
- [ ] Configuration hardening applied (Section 4.4): {checklist}
- [ ] Security baseline met: {compliance-check}
- [ ] EDR scan clean: {scan-result}
- [ ] AV scan clean: {scan-result}
- [ ] No IOCs detected (Section 2.1): {verification-query}
- [ ] Credentials reset verified (Section 4.3): {confirmed}
- [ ] MFA functional: {tested}
- [ ] No unauthorized accounts: {verified}

**3. Performance Testing:**
- [ ] CPU utilization: {acceptable-range}
- [ ] Memory utilization: {acceptable-range}
- [ ] Disk utilization: {acceptable-range}
- [ ] Network connectivity: {verified}
- [ ] Load testing (if applicable): {pass/fail}

**4. Integration Testing:**
- [ ] Can reach required upstream services: {list}
- [ ] Downstream services can reach this system: {list}
- [ ] API functionality: {tested}
- [ ] Database connectivity: {verified}

**Validation Sign-Off (per system):**
- System: {system-name}
- Functional Test: {pass/fail} - {tester-name} - {timestamp}
- Security Test: {pass/fail} - {tester-name} - {timestamp}
- Performance Test: {pass/fail} - {tester-name} - {timestamp}
- Integration Test: {pass/fail} - {tester-name} - {timestamp}
- **Overall: PASS / FAIL**
- Approved by: {role} _________________ Date: _______

### 5.5 Enhanced Post-Recovery Monitoring

**Enhanced monitoring to detect reinfection for {duration} after recovery.**

**Monitoring Duration:** {duration-e.g.-30-90-days}

**Enhanced Monitoring Items:**

**1. IOC Monitoring (Zero Tolerance):**
- [ ] Network IOCs from Section 2.1: {monitoring-method}
- [ ] File IOCs from Section 2.1: {monitoring-method}
- [ ] Behavioral IOCs from Section 2.1: {monitoring-method}
- [ ] Alert on ANY IOC detection → Immediate escalation to {role}

**2. Behavioral Monitoring:**
- [ ] Unusual authentication patterns: {detection-rules}
- [ ] Lateral movement attempts: {detection-rules}
- [ ] Privilege escalation attempts: {detection-rules}
- [ ] Data exfiltration patterns: {detection-rules}
- [ ] New scheduled tasks/services: {monitoring-frequency}
- [ ] Process injection attempts: {edr-rules}

**3. System Health:**
- [ ] Performance degradation: {thresholds}
- [ ] Unexpected reboots: {alert-on-any}
- [ ] Service failures: {alert-on-any}
- [ ] Disk space anomalies: {thresholds}

**4. User Activity:**
- [ ] Account usage patterns: {anomaly-detection}
- [ ] Sensitive data access: {monitoring-rules}
- [ ] Off-hours activity: {alert-rules}

**Enhanced Monitoring Configuration:**

**SIEM ({siem-platform}):**
- Enhanced rules: {list-new-or-modified-rules}
- Lower thresholds: {threshold-changes}
- Additional log sources: {new-log-sources}
- Alert routing: {escalation-path}

**EDR ({edr-platform}):**
- Enhanced policies: {policy-changes}
- Behavioral analytics: {new-rules}
- Elevated telemetry: {scope}

**Network Monitoring:**
- IDS/IPS: Elevated sensitivity
- NetFlow analysis: Enhanced
- DNS monitoring: {enhanced-rules}

**Monitoring Team:**
- Primary: {team-e.g.-SOC}
- Schedule: {24x7-or-business-hours}
- Escalation: {on-call-rotation}

**Alert Response:**
- IOC detection → {immediate-response-procedure}
- Suspicious behavior → {investigation-procedure}
- False positives → {tuning-procedure}

**Monitoring Metrics:**
- Alerts reviewed: {target-response-time}
- False positive rate: {target-e.g.-less-than-10-percent}
- Time to investigate: {target}

### 5.6 Return to Normal Operations

**Criteria for declaring incident fully resolved and returning to standard operations.**

**Return-to-Normal Checklist:**

**Systems:**
- [ ] All P1 systems restored and validated
- [ ] All P2 systems restored and validated
- [ ] All P3 systems restored and validated
- [ ] All systems meet performance SLAs
- [ ] User satisfaction: {feedback-method}

**Security:**
- [ ] Zero IOC detections for {duration-e.g.-30-days}
- [ ] No anomalous behavior detected
- [ ] Threat hunting (Section 4.5) shows clean: {date-of-last-hunt}
- [ ] All vulnerabilities remediated (Section 4.4): {verification}
- [ ] All credentials reset (Section 4.3): {verification}
- [ ] Security controls operational: {verification}

**Monitoring:**
- [ ] Enhanced monitoring duration complete: {start-date} to {end-date}
- [ ] Monitoring tools tuned: False positive rate < {threshold}
- [ ] Ready to return to standard monitoring
- [ ] Standard monitoring validated functional

**Business:**
- [ ] Business operations normal: {confirmation-from-business}
- [ ] Revenue/productivity normal: {metrics}
- [ ] Customer satisfaction: {metrics-or-feedback}

**Documentation:**
- [ ] Recovery timeline complete: {documented-in-section}
- [ ] All actions documented: {verification}
- [ ] Incident report finalized (Section 7): {completion-date}
- [ ] Lessons learned captured (Section 7): {completion-date}

**Gradual Transition Plan:**
- **Weeks 1-2:** Full enhanced monitoring (100%)
- **Weeks 3-4:** Reduced enhanced monitoring (lower thresholds 50%)
- **Weeks 5-6:** Standard monitoring + weekly threat hunting
- **Week 7+:** Normal operations

**Sign-Off for Return to Normal Operations:**
- IR Team Lead: _________________ Date: _______
- IT Operations Lead: _________________ Date: _______
- Security Team Lead: _________________ Date: _______
- Business Owner: _________________ Date: _______
- CISO: _________________ Date: _______

**Post-Return Actions:**
- [ ] Update playbook based on lessons learned
- [ ] Conduct tabletop exercise within {timeframe}
- [ ] Schedule follow-up review: {date}

### 5.7 Recovery Coordination

**Recovery Team:**
- **Recovery Manager:** {role}
- **System Owners:** {roles-per-system}
- **Security Team:** {role}
- **Business Representatives:** {roles}

**Communication Plan:**
- **Status Updates:** {frequency} to {stakeholders}
- **P1 Recovery Complete:** Notify {stakeholders}
- **P2 Recovery Complete:** Notify {stakeholders}
- **All Systems Recovered:** Notify {stakeholders}
- **Return to Normal:** Notify {all-staff}

**User Communication:**
- Systems coming online: {notification-method}
- Fully operational: {notification-method}
- User guidance: {instructions-or-FAQ}

**Recovery Metrics:**
- Total recovery time: {target}
- Time per system: {tracked}
- Validation pass rate: {target-100-percent}
- Reinfection incidents: {target-zero}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a]
lastUpdated: '{timestamp}'
```

### 10. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [B] Brainstorming [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "completeness and safety of recovery procedures"
- IF P: Execute {partyModeWorkflow} - Recommend Bastion (architecture expert) for recovery validation and monitoring strategies
- IF B: Execute {brainstormingWorkflow} with focus on "innovative recovery strategies that minimize downtime and risk"
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Section 5 is complete will you load, read entire file, then execute `{nextStepFile}` to begin defining post-incident activities.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- System restoration priorities clearly defined (P1/P2/P3)
- Restoration methods documented per system type
- Detailed restoration procedures with validation steps
- Enhanced monitoring plan comprehensive (IOCs, behaviors, duration)
- Return-to-normal criteria and sign-off requirements clear
- Recovery coordination and communication plan complete
- Section 5 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a, 3a, 4a, 5a, 6a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- No system prioritization (all systems treated equally - unrealistic)
- Missing validation procedures (high risk of failed recovery)
- No enhanced monitoring plan (reinfection risk)
- Rushing to declare return-to-normal without criteria
- Defining post-incident activities (belongs in step 7a)
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
