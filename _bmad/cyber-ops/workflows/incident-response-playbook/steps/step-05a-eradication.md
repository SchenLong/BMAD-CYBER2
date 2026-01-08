---
name: 'step-05a-eradication'
description: 'Document root cause identification, threat actor removal, vulnerability remediation, and validation procedures'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-05a-eradication.md'
nextStepFile: '{workflow_path}/steps/step-06a-recovery.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5A: Eradication Steps

## STEP GOAL:

To document comprehensive eradication procedures including root cause identification, complete threat actor removal (malware, persistence, backdoors), vulnerability remediation, and validation procedures for {incident-type} incidents.

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

- 🎯 Focus ONLY on eradication procedures and validation
- 🚫 FORBIDDEN to start defining recovery procedures (that's step 6a)
- 💬 Guide through conversational exploration of eradication options
- 🌐 Web-Browsing ENCOURAGED for CVE details and patch information
- 👥 Party Mode (Trace) AVAILABLE for forensic validation expertise

## EXECUTION PROTOCOLS:

- 🎯 Leverage all previous sections (context, detection, containment)
- 💾 Append to Section 4 (Eradication Steps) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a, 3a, 4a, 5a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Containment procedures defined in step 4a
- Focus on HOW to completely remove threat and vulnerabilities
- Don't define HOW to recover systems yet (that's step 6a)
- Eradication must be thorough - incomplete eradication leads to reinfection

## ERADICATION PROCEDURE SEQUENCE:

### 1. Review Context

Display:

"**Eradication Steps for {incident-type}**

Containment (Section 3) has stopped the bleeding. Now we need to completely remove the threat actor and fix the vulnerabilities that allowed the {incident-type} incident.

**NIST Eradication Phase Goals:**
1. **Identify Root Cause:** How did the attacker get in?
2. **Remove Threat Actor:** Eliminate all malware, persistence mechanisms, and backdoors
3. **Remediate Vulnerabilities:** Patch, harden, and fix the weakness
4. **Validate Clean State:** Prove the threat is gone before recovery

**From Previous Sections:**
- Incident Type: {incident-type}
- IOCs: {summary-from-section-2}
- Affected Systems: {summary-from-containment}
- Tools Available: {edr-forensics-tools-from-section-1}

Let's design thorough eradication procedures for your environment."

### 2. Root Cause Identification Procedures

Engage in conversation:

"**Root Cause Analysis for {incident-type}**

Before we can prevent this from happening again, we need to understand exactly how the attacker succeeded.

**For {incident-type} incidents, common root causes include:**
{list-common-root-causes-for-incident-type}

**Root Cause Investigation Checklist:**

**Initial Access Vector:**
- [ ] How did the attacker first get in?
  - Phishing email? (check email logs, attachments)
  - Vulnerable service? (check CVE, patch status)
  - Compromised credentials? (check authentication logs)
  - Supply chain? (check third-party access)
  - Physical access? (check badge logs)

**Vulnerability Exploitation:**
- [ ] What vulnerability was exploited?
  - Software vulnerability: {CVE-number-if-known}
  - Configuration weakness: {misconfiguration-type}
  - Weak credentials: {password-policy-violation}
  - Missing patch: {patch-KB-number}
  - Social engineering: {attack-technique}

**Why Did Detection/Prevention Fail?**
- [ ] Why didn't existing controls prevent this?
  - AV/EDR: Why no detection? (signature gap, disabled, bypassed)
  - Firewall: Why was malicious traffic allowed?
  - Email filter: Why did phishing email get through?
  - User awareness: Why did user fall for social engineering?
  - Patching: Why was vulnerability unpatched?

**Timeline Reconstruction:**
- [ ] What was the full attack timeline?
  - Initial access: {timestamp}
  - Persistence established: {timestamp}
  - Lateral movement: {timestamp}
  - Objective achieved (data exfil/encryption/etc.): {timestamp}
  - Detection: {timestamp}
  - Dwell time: {calculated-duration}

For your organization, what's the process for root cause analysis? Who conducts it? What tools do you use for forensic investigation?"

Document:
- RCA process owner
- Forensic tools available ({forensic-tools-from-section-1})
- Timeline for completing RCA
- Where RCA findings are documented

### 3. Threat Actor Removal Procedures

"**Complete Threat Actor Removal**

This is the most critical phase. Incomplete removal leads to reinfection within days.

**CRITICAL RULE:** Remove ALL threat actor presence SIMULTANEOUSLY on ALL systems. If you eradicate one system but leave another compromised, the attacker will reinfect from the remaining foothold.

**Malware Removal:**

For {incident-type}, what malware is typically deployed?

**Step-by-Step Malware Removal:**

1. **Identify All Malware Components:**
   - [ ] Primary payload: {malware-name-or-type}
   - [ ] Droppers/downloaders: {filenames-or-patterns}
   - [ ] Persistence mechanisms: {scheduled-tasks-services-registry}
   - [ ] Post-exploitation tools: {tools-like-mimikatz-cobalt-strike}
   - [ ] Lateral movement tools: {tools-like-psexec-wmi}

2. **Locate Malware on All Systems:**
   - [ ] EDR ({edr-platform}): Search for malware hashes/names across estate
   - [ ] SIEM ({siem-platform}): Query for malware indicators
   - [ ] Manual hunt: Use IOCs from Section 2.1
   - [ ] Filesystem: {paths-where-malware-typically-hides}
   - [ ] Memory: {memory-resident-malware-detection}

3. **Remove Malware:**

   **EDR-Based Removal ({edr-platform}):**
   ```
   {quarantine-file-command}
   {delete-file-command}
   {kill-process-command}
   {remove-scheduled-task-command}
   ```

   **Manual Removal (if EDR unavailable):**
   ```powershell
   # Stop malicious process
   Stop-Process -Name {malware-process} -Force

   # Delete malware files
   Remove-Item -Path {malware-path} -Force

   # Remove scheduled task
   Unregister-ScheduledTask -TaskName {malicious-task} -Confirm:$false

   # Remove registry persistence
   Remove-ItemProperty -Path {registry-path} -Name {malware-key}
   ```

   **Forensic Imaging (BEFORE removal):**
   - [ ] Capture memory dump: {memory-dump-tool-and-process}
   - [ ] Capture disk image: {disk-imaging-tool-and-process}
   - [ ] Preserve logs: {log-collection-process}
   - [ ] Chain of custody: {documentation-requirements}

**Persistence Mechanism Removal:**

{Incident-type} attackers commonly use these persistence techniques:

- [ ] **Scheduled Tasks:** Check for suspicious scheduled tasks
  ```powershell
  Get-ScheduledTask | Where-Object {$_.TaskPath -notlike '\\Microsoft*'} | Select TaskName,TaskPath,State
  # Remove malicious task
  Unregister-ScheduledTask -TaskName {malicious-task}
  ```

- [ ] **Services:** Check for suspicious services
  ```powershell
  Get-Service | Where-Object {$_.DisplayName -like '*{suspicious-pattern}*'}
  # Remove malicious service
  sc.exe delete {malicious-service}
  ```

- [ ] **Registry Run Keys:** Check autorun locations
  ```powershell
  Get-ItemProperty -Path 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
  Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
  # Remove malicious entry
  Remove-ItemProperty -Path {registry-path} -Name {malicious-key}
  ```

- [ ] **WMI Event Subscriptions:** Check for malicious WMI persistence
  ```powershell
  Get-WmiObject -Namespace root\\subscription -Class __EventFilter
  Get-WmiObject -Namespace root\\subscription -Class CommandLineEventConsumer
  # Remove malicious WMI subscription
  ```

- [ ] **Backdoor Accounts:** Check for attacker-created accounts
  ```powershell
  Get-LocalUser | Where-Object {$_.Description -eq '' -or $_.LastLogon -eq $null}
  # Remove backdoor account
  Remove-LocalUser -Name {malicious-account}
  ```

- [ ] **Web Shells (if web server compromised):** Check web directories
  - Locations: {web-root-paths-e.g.-inetpub-var-www}
  - Patterns: {webshell-patterns-e.g.-eval-base64-decode}
  - Removal: Delete files and restore from known-good backup

What persistence mechanisms are most relevant for {incident-type} in your environment?"

### 4. Credential Reset and Access Revocation

"**Credential Hygiene After {incident-type}**

If credentials were compromised (likely for {incident-type}), ALL potentially compromised credentials must be reset.

**User Accounts:**
- [ ] Identify all compromised user accounts
- [ ] Force password reset for: {scope-e.g.-all-admin-accounts-all-users-affected-dept}
- [ ] Revoke all active sessions
- [ ] Require MFA re-enrollment (if MFA was bypassed)

**Administrator/Privileged Accounts:**
- [ ] Domain Admin credentials: RESET
- [ ] Enterprise Admin credentials: RESET
- [ ] Local Administrator (LAPS): Rotate on ALL systems
- [ ] Service account credentials: RESET (requires app reconfiguration)

**Service Accounts and API Keys:**
- [ ] Identify service accounts used on affected systems: {list}
- [ ] Reset service account passwords
- [ ] Rotate API keys/tokens: {which-apis}
- [ ] Rotate database credentials: {which-databases}

**Cloud Platform Credentials:**
- [ ] AWS IAM: Rotate access keys, reset passwords
- [ ] Azure AD: Reset passwords, revoke tokens
- [ ] Office 365: Reset passwords, revoke sessions
- [ ] SaaS applications: {list-of-saas-apps-requiring-credential-reset}

**Certificate/Key Material:**
- [ ] If certificates compromised: Revoke and reissue
- [ ] If SSH keys compromised: Regenerate authorized_keys
- [ ] If encryption keys compromised: {key-rotation-procedure}

**Credential Reset Commands:**

```powershell
# Active Directory bulk password reset
Import-Csv affected-users.csv | ForEach-Object {
    Set-ADAccountPassword -Identity $_.SamAccountName -Reset -NewPassword (ConvertTo-SecureString -AsPlainText '{temp-password}' -Force)
    Set-ADUser -Identity $_.SamAccountName -ChangePasswordAtLogon $true
}

# Revoke all Azure AD refresh tokens
Import-Csv affected-users.csv | ForEach-Object {
    Revoke-AzureADUserAllRefreshToken -ObjectId $_.ObjectId
}

# Rotate LAPS password on all affected systems
Import-Csv affected-systems.csv | ForEach-Object {
    Reset-AdmPwdPassword -ComputerName $_.Hostname
}
```

What's your credential reset policy for {incident-type}? Who approves service account resets?"

### 5. Vulnerability Remediation Procedures

"**Vulnerability Remediation for {incident-type}**

Now that the threat is removed, fix the vulnerabilities to prevent reinfection.

**For {incident-type}, common vulnerabilities include:**
{list-common-vulnerabilities-for-incident-type}

**Vulnerability Remediation Checklist:**

**Patch Management:**
- [ ] Identify vulnerability exploited: {CVE-or-description}
- [ ] Identify patch/update required: {KB-number-or-version}
- [ ] Test patch on non-production system (if time allows)
- [ ] Deploy patch to ALL systems (not just affected)
  - Priority 1 (Critical systems): {list} - Patch within {timeframe}
  - Priority 2 (High-value systems): {list} - Patch within {timeframe}
  - Priority 3 (All other systems): {list} - Patch within {timeframe}
- [ ] Verify patch deployment: {verification-method}
- [ ] Reboot systems (if required): {reboot-schedule}

Would you like me to use **Web-Browsing** to research the CVE and patch details?

**Configuration Hardening:**

What configuration weaknesses enabled {incident-type}?

- [ ] **Disable unnecessary services:** {services-to-disable}
  ```powershell
  Stop-Service -Name {service} -Force
  Set-Service -Name {service} -StartupType Disabled
  ```

- [ ] **Remove unnecessary software:** {software-to-remove}

- [ ] **Harden authentication:**
  - Enforce MFA: {scope}
  - Strengthen password policy: {new-requirements}
  - Disable NTLM (if applicable): {plan}

- [ ] **Restrict administrative access:**
  - Implement Privileged Access Workstations (PAWs): {plan}
  - Limit local admin rights: {new-policy}
  - Implement Just-In-Time (JIT) admin: {plan}

- [ ] **Network segmentation improvements:**
  - Segment {systems-or-vlans}: {plan}
  - Implement micro-segmentation: {plan}
  - Restrict lateral movement: {firewall-rules}

- [ ] **Endpoint hardening:**
  - Application whitelisting: {scope}
  - PowerShell Constrained Language Mode: {enable-where}
  - WDAC/AppLocker: {policy}
  - Credential Guard: {enable-where}

- [ ] **Email security improvements (if phishing vector):**
  - SPF/DKIM/DMARC: {implement-or-strengthen}
  - External email tagging: {implement}
  - Attachment blocking: {file-types}
  - Link protection: {enable-safe-links}

What hardening measures are appropriate for your environment after {incident-type}?"

### 6. Validation Procedures

"**Validation: Prove the Threat is Gone**

Before moving to recovery, we must prove eradication was complete.

**CRITICAL:** If validation finds remaining threat actor presence, return to removal step. Do not proceed to recovery with incomplete eradication.

**Validation Checklist:**

**1. Forensic Validation:**
- [ ] No malware hashes detected on any system
  ```
  {edr-platform-sweep-command}
  ```
- [ ] No suspicious processes running
  ```
  {edr-platform-process-query}
  ```
- [ ] No unauthorized scheduled tasks/services
  ```powershell
  # Sweep all systems for suspicious tasks
  Invoke-Command -ComputerName (Get-ADComputer -Filter *).Name -ScriptBlock {
      Get-ScheduledTask | Where-Object {$_.TaskPath -notlike '\\Microsoft*' -and $_.Author -notlike 'Microsoft*'}
  }
  ```
- [ ] No suspicious registry keys
- [ ] No web shells detected (if applicable)

**2. Network Validation:**
- [ ] No beaconing to C2 infrastructure
  - SIEM query: {query-for-iocs-from-section-2}
  - Firewall logs: No connections to blocked IPs/domains
  - DNS logs: No queries to malicious domains

**3. Authentication Validation:**
- [ ] All compromised credentials reset (verified)
- [ ] No unauthorized accounts exist
  ```powershell
  # Check for accounts created during incident timeframe
  Get-ADUser -Filter * -Properties WhenCreated | Where-Object {$_.WhenCreated -gt '{incident-start-date}'}
  ```
- [ ] All sessions revoked (no stale tokens)

**4. Threat Hunting Validation:**
- [ ] Proactive hunt using IOCs from Section 2.1
- [ ] Hunt for living-off-the-land techniques
- [ ] Hunt for lateral movement indicators
- [ ] Hunt for data staging/exfiltration indicators
- [ ] Responsible: {threat-hunting-team}
- [ ] Duration: {hunt-duration-e.g.-minimum-7-days}

**5. EDR/AV Validation:**
- [ ] Full system scans on all affected systems
  ```
  {edr-platform-full-scan-command}
  ```
- [ ] Updated signatures/definitions: {verify-up-to-date}
- [ ] No detections: {confirm-clean}

**6. External Validation (Optional but Recommended):**
- [ ] Third-party forensic firm validates eradication
- [ ] Compromise Assessment scan
- [ ] Penetration test simulating same attack vector

**Validation Sign-Off:**

Who must sign off that eradication is complete before recovery begins?

- [ ] IR Team Lead: {name-and-timestamp}
- [ ] Security Team Lead: {name-and-timestamp}
- [ ] CISO: {name-and-timestamp}
- [ ] Forensic Investigator: {name-and-timestamp-if-external}

**If Validation Fails:**
- Do NOT proceed to recovery
- Return to threat removal step
- Document what was missed
- Expand scope of eradication
- Re-validate

Would you like to use **Party Mode - Trace** (forensic expert) to review the validation procedures?"

### 7. Eradication Timeline and Coordination

"**Eradication Execution Timeline**

Eradication requires coordination across teams.

**Timeline:**
- Eradication planning: {duration-e.g.-4-hours-after-containment}
- Eradication execution: {duration-e.g.-8-hour-window}
- Validation: {duration-e.g.-48-hours}
- Sign-off: {duration-e.g.-before-recovery-begins}

**Team Coordination:**
- IR Team: {responsibilities}
- IT Operations: {responsibilities}
- Security Engineering: {responsibilities}
- Application Teams: {responsibilities-for-service-account-resets}

**Communication:**
- Status updates: {frequency-and-to-whom}
- Completion notification: {stakeholders}
- Validation results: {stakeholders}

**Rollback Plan:**
If eradication causes critical system failures:
- Decision maker: {role}
- Rollback procedure: {high-level-steps}
- Compensating controls: {if-must-rollback}"

### 8. Document Eradication Procedures

Append to Section 4 (Eradication Steps) in output file:

```markdown
## 4. Eradication Steps

### 4.1 Root Cause Identification

**Root Cause Analysis Process:**
- Process Owner: {role}
- Forensic Tools: {forensic-tools-from-section-1}
- Timeline: Complete within {duration} of containment

**Investigation Checklist:**

**Initial Access Vector:**
- [ ] How did attacker gain initial access?
  - Method: {phishing-vulnerability-credentials-etc}
  - Evidence: {logs-artifacts-proof}

**Vulnerability Exploited:**
- [ ] What weakness was exploited?
  - CVE: {cve-number-if-applicable}
  - Description: {vulnerability-description}
  - Affected systems: {list}

**Detection/Prevention Failure:**
- [ ] Why didn't existing controls prevent this?
  - Control: {control-that-failed}
  - Reason: {why-it-failed}
  - Remediation: {fix-for-control}

**Attack Timeline:**
- Initial access: {timestamp}
- Persistence established: {timestamp}
- Lateral movement: {timestamp}
- Objective achieved: {timestamp}
- Detection: {timestamp}
- **Dwell time:** {calculated-duration}

**Root Cause Summary:**
{narrative-summary-to-be-filled-during-incident}

### 4.2 Threat Actor Removal

**CRITICAL RULE:** Remove ALL threat actor presence SIMULTANEOUSLY across ALL systems to prevent reinfection.

**Malware Removal:**

**Malware Components for {incident-type}:**
- Primary payload: {malware-name-or-type}
- Persistence mechanisms: {list}
- Post-exploitation tools: {list}

**Malware Removal Procedure:**

1. **Forensic Preservation (BEFORE removal):**
   - [ ] Memory dumps: {systems-requiring-dumps}
   - [ ] Disk images: {systems-requiring-images}
   - [ ] Log collection: {logs-to-collect}
   - [ ] Chain of custody: {documentation-process}

2. **Locate Malware:**
   - [ ] EDR sweep: Search for hashes from Section 2.1 IOCs
   ```
   {edr-search-command}
   ```
   - [ ] SIEM query: {query-for-malware-indicators}
   - [ ] Manual hunt: {filesystem-paths-to-check}

3. **Remove Malware:**

   **EDR-Based Removal ({edr-platform}):**
   ```
   {quarantine-command}
   {delete-command}
   {kill-process-command}
   ```

   **Manual Removal:**
   ```powershell
   {manual-removal-commands}
   ```

**Persistence Mechanism Removal:**

For {incident-type}, check and remove:

- [ ] **Scheduled Tasks:**
  ```powershell
  Get-ScheduledTask | Where-Object {$_.TaskPath -notlike '\\Microsoft*'}
  # Review and remove malicious tasks
  Unregister-ScheduledTask -TaskName {malicious-task}
  ```

- [ ] **Services:**
  ```powershell
  Get-Service | Where-Object {$_.DisplayName -like '*{suspicious-pattern}*'}
  sc.exe delete {malicious-service}
  ```

- [ ] **Registry Run Keys:**
  ```powershell
  {check-registry-autorun-locations}
  Remove-ItemProperty -Path {registry-path} -Name {malicious-key}
  ```

- [ ] **WMI Event Subscriptions:**
  ```powershell
  {check-wmi-subscriptions}
  ```

- [ ] **Backdoor Accounts:**
  ```powershell
  {check-for-unauthorized-accounts}
  Remove-LocalUser -Name {malicious-account}
  ```

- [ ] **Web Shells (if applicable):**
  - Check: {web-root-paths}
  - Remove: {deletion-procedure}
  - Restore: {restore-from-known-good-backup}

### 4.3 Credential Reset and Access Revocation

**All potentially compromised credentials MUST be reset:**

**User Accounts:**
- [ ] Scope: {all-affected-users-all-admins-entire-organization}
- [ ] Force password reset
- [ ] Revoke all active sessions
- [ ] Require MFA re-enrollment (if MFA bypassed)

**Administrator/Privileged Accounts:**
- [ ] Domain Admin: RESET ALL
- [ ] Enterprise Admin: RESET ALL
- [ ] Local Administrator (LAPS): Rotate on ALL systems
- [ ] Service accounts: {list-and-reset-procedure}

**Service Accounts and API Keys:**
- [ ] Service accounts: {list}
  - Reset password: {procedure}
  - Update application configurations: {responsible-team}
- [ ] API keys: {which-apis-to-rotate}
- [ ] Database credentials: {which-databases}

**Cloud Platform Credentials:**
- [ ] AWS: Rotate IAM access keys
- [ ] Azure: Reset passwords, revoke tokens
- [ ] Office 365: Reset passwords, revoke sessions
- [ ] SaaS applications: {list-requiring-resets}

**Credential Reset Commands:**
```powershell
{bulk-password-reset-commands}
{session-revocation-commands}
{laps-rotation-commands}
```

**Approval Requirements:**
- User account resets: {approver}
- Service account resets: {approver-e.g.-app-owner-ciso}
- Production service accounts: {additional-approval-required}

### 4.4 Vulnerability Remediation

**Vulnerabilities Enabling {incident-type}:**

**Patch Management:**
- [ ] Vulnerability: {CVE-or-description}
- [ ] Patch/Update: {KB-number-or-version-number}
- [ ] Testing: {skip-or-abbreviated-testing}
- [ ] Deployment:
  - P1 (Critical): {systems} - Within {timeframe}
  - P2 (High): {systems} - Within {timeframe}
  - P3 (Standard): {systems} - Within {timeframe}
- [ ] Verification: {verification-method}
- [ ] Reboot: {if-required-schedule}

**Configuration Hardening:**

- [ ] **Disable unnecessary services:**
  ```powershell
  {disable-services-commands}
  ```

- [ ] **Remove unnecessary software:**
  - Software: {list}
  - Removal: {process}

- [ ] **Harden authentication:**
  - MFA enforcement: {scope}
  - Password policy: {new-requirements}
  - Disable NTLM: {if-applicable}

- [ ] **Restrict administrative access:**
  - PAWs: {implementation-plan}
  - Limit local admin: {new-policy}
  - JIT admin: {implementation-plan}

- [ ] **Network segmentation:**
  - Segment: {systems-or-vlans}
  - Micro-segmentation: {plan}
  - Firewall rules: {new-rules}

- [ ] **Endpoint hardening:**
  - Application whitelisting: {scope}
  - PowerShell CLM: {enable-where}
  - WDAC/AppLocker: {policy}
  - Credential Guard: {enable-where}

- [ ] **Email security (if phishing vector):**
  - SPF/DKIM/DMARC: {implement-or-strengthen}
  - External email tagging: {implement}
  - Attachment blocking: {file-types}
  - Link protection: {safe-links}

### 4.5 Eradication Validation

**Validation ensures eradication is complete BEFORE recovery begins.**

**Validation Checklist:**

**1. Forensic Validation:**
- [ ] No malware detected (EDR full sweep)
- [ ] No suspicious processes
- [ ] No unauthorized scheduled tasks/services
- [ ] No suspicious registry keys
- [ ] No web shells (if applicable)

**2. Network Validation:**
- [ ] No C2 beaconing (SIEM query: {query})
- [ ] No connections to blocked IPs/domains
- [ ] No DNS queries to malicious domains

**3. Authentication Validation:**
- [ ] All compromised credentials reset (verified)
- [ ] No unauthorized accounts
- [ ] All sessions revoked

**4. Threat Hunting:**
- [ ] Hunt using Section 2.1 IOCs
- [ ] Hunt for LOLBAS techniques
- [ ] Hunt for lateral movement
- [ ] Hunt for data staging
- [ ] Duration: Minimum {duration-e.g.-7-days}
- [ ] Responsible: {team}

**5. EDR/AV Validation:**
- [ ] Full system scans (all affected systems)
- [ ] Signatures up-to-date
- [ ] No detections

**6. External Validation (Optional):**
- [ ] Third-party forensic validation
- [ ] Compromise assessment
- [ ] Penetration test

**Validation Sign-Off (Required before recovery):**
- [ ] IR Team Lead: _________________ Date: _______
- [ ] Security Team Lead: _________________ Date: _______
- [ ] CISO: _________________ Date: _______
- [ ] Forensic Investigator: _________________ Date: _______ (if external)

**If Validation Fails:**
- Do NOT proceed to recovery
- Return to Section 4.2 (Threat Actor Removal)
- Document what was missed
- Expand eradication scope
- Re-validate

### 4.6 Eradication Timeline and Coordination

**Timeline:**
- Planning: {duration} after containment
- Execution: {window-e.g.-8-hours}
- Validation: {duration-e.g.-48-hours}
- Sign-off: Before recovery begins

**Team Responsibilities:**
- IR Team: {responsibilities}
- IT Operations: {responsibilities}
- Security Engineering: {responsibilities}
- Application Teams: {responsibilities}

**Communication:**
- Status updates: {frequency} to {stakeholders}
- Completion: Notify {stakeholders}
- Validation results: Distribute to {stakeholders}

**Rollback Plan:**
- Decision maker: {role}
- Rollback procedure: {high-level-steps}
- Compensating controls: {if-rollback-required}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a, 3a, 4a, 5a]
lastUpdated: '{timestamp}'
```

### 9. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [W] Web-Browsing [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "thoroughness and completeness of eradication and validation procedures"
- IF P: Execute {partyModeWorkflow} - Recommend Trace (forensic expert) for validation procedures
- IF W: Offer web search options:
  - CVE details and patch information
  - {incident-type} eradication best practices
  - Threat actor TTPs and persistence mechanisms
  - Forensic validation techniques
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Section 4 is complete will you load, read entire file, then execute `{nextStepFile}` to begin defining recovery procedures.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Root cause analysis procedures documented
- Complete threat actor removal procedures with tool-specific commands
- Credential reset procedures comprehensive
- Vulnerability remediation procedures tailored to {incident-type}
- Validation procedures thorough with sign-off requirements
- Section 4 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a, 3a, 4a, 5a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- Incomplete removal procedures (missing persistence mechanisms)
- No validation procedures (high risk of reinfection)
- Generic procedures not tailored to organizational tools
- Skipping credential reset procedures
- No sign-off requirements before recovery
- Defining recovery procedures (belongs in step 6a)
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
