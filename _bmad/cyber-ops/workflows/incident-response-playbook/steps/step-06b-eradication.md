---
name: 'step-06b-eradication'
description: 'Guide complete threat removal, credential reset, and vulnerability remediation with validation'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-06b-eradication.md'
nextStepFile: '{workflow_path}/steps/step-07b-recovery-and-closure.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current incident report file from frontmatter'
sidecarFile: 'Current sidecar timeline file from frontmatter'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6B: Eradication

## STEP GOAL:

To guide complete threat removal from all affected systems, reset compromised credentials, remediate vulnerabilities, and validate clean systems with documented sign-off.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip validation - unremoved threats will re-compromise systems
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE AN INCIDENT COMMANDER guiding complete threat eradication
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an Incident Commander
- ✅ Tone: Calm, directive, methodical, thorough
- ✅ Eradication must be simultaneous across all systems
- ✅ Credentials MUST be reset for security
- ✅ Validation is mandatory - no assumptions

### Step-Specific Rules:

- 🎯 Focus ONLY on complete threat removal
- 🚫 FORBIDDEN to start recovery (that's step 7b)
- 💬 Provide specific removal commands
- 📝 Document all eradication actions meticulously
- ✅ Require validation AND sign-off before proceeding

## EXECUTION PROTOCOLS:

- 🎯 Remove malware, persistence, backdoors; reset credentials; patch vulnerabilities
- 💾 Append to Section 3 (Actions Taken) - continuation in output file
- 📝 Update sidecar file with eradication timeline
- 📖 Update frontmatter `stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b]` before proceeding
- 🚫 Present menu (P/C) after eradication validated and signed off

## ERADICATION SEQUENCE:

### 1. Eradication Overview

Display:

"**🧹 ERADICATION PHASE 🧹**

**Incident:** {incident-id} - {incident-type}

**Eradication Goal:** Complete removal of threat actor presence from all systems.

**Critical Requirements:**
- ⚠️ **Simultaneous removal** across all affected systems (prevent re-infection)
- ⚠️ **Credential reset** for all compromised accounts
- ⚠️ **Vulnerability remediation** to prevent re-exploitation
- ⚠️ **Validation** of clean systems
- ⚠️ **Sign-off** from IR Lead and Security Lead required

**Eradication Strategy:**

1. **Malware Removal** - Remove all malicious files from all systems
2. **Persistence Removal** - Eliminate all persistence mechanisms
3. **Credential Reset** - Reset all compromised credentials
4. **Vulnerability Remediation** - Patch exploited vulnerabilities
5. **Validation** - Verify clean systems
6. **Sign-Off** - Document approval to proceed

Let's systematically eradicate the threat."

### 2. Threat Actor Removal Checklist

"**THREAT ACTOR REMOVAL CHECKLIST**

We'll remove the threat actor from all affected systems simultaneously.

**Affected Systems (from step 2b):** {affected-systems-list}

**Coordination Required:** All removals must happen at the same time to prevent adversary from pivoting to uncleared systems.

---

**MALWARE REMOVAL**

**Malware identified (from step 4b/5b):**
- **Malware hashes:** {malware-hashes-from-evidence}
- **Malware filenames:** {malware-filenames}
- **Malware paths:** {malware-paths}

**Removal Tools Available:**

What tools do you have for malware removal?

1. EDR native removal (CrowdStrike, Defender, SentinelOne)
2. Antivirus (Sophos, Trend Micro, McAfee)
3. Manual removal
4. System rebuild

Your choice (1-4):"

**Based on choice, provide commands:**

**Example for CrowdStrike:**

"**CrowdStrike - Malware Removal**

```powershell
# From CrowdStrike Falcon console or API:

# Kill malicious process
Invoke-FalconProcess -Action kill -ProcessId {process-id}

# Delete malicious file
Invoke-FalconFileAction -Action delete -FilePath "{malware-path}" -HostId {host-id}

# Run full scan on affected systems
New-FalconScan -ScanType full -HostIds @({host-ids})
```

**For each affected system:**

**System:** {hostname-1}
- **Malware removed:** {list-malware-files}
- **Processes terminated:** {list-processes}
- **Scan result:** {clean/threats-found}
- **Removal timestamp:** {prompt-for-timestamp}

**Successfully removed? (Y/N):**"

**Example for Microsoft Defender:**

"**Microsoft Defender - Malware Removal**

```powershell
# Remote execution via PowerShell remoting:

# Quarantine threat
Remove-MpThreat -ThreatID {threat-id}

# Delete specific file
Remove-Item -Path "{malware-path}" -Force

# Full scan
Start-MpScan -ScanType FullScan

# Check scan results
Get-MpThreatDetection
```

**For each affected system:**

**System:** {hostname}
- **Malware removed:** {list}
- **Scan result:** {status}
- **Removal timestamp:** {timestamp}

**All malware removed from all systems? (Y/N):**"

**Log to sidecar.**

---

**PERSISTENCE MECHANISM REMOVAL**

"**PERSISTENCE REMOVAL CHECKLIST**

Threat actors install persistence mechanisms to survive reboots and maintain access.

**Common Persistence Locations (check all):**

**Scheduled Tasks:**

```powershell
# Windows - List suspicious tasks
Get-ScheduledTask | Where-Object {$_.TaskPath -notlike "*Microsoft*"} | Select TaskName, TaskPath, State

# Remove malicious task
Unregister-ScheduledTask -TaskName "{malicious-task-name}" -Confirm:$false
```

**Services:**

```powershell
# Windows - List suspicious services
Get-Service | Where-Object {$_.DisplayName -like "*{suspicious-keyword}*"}

# Stop and remove malicious service
Stop-Service -Name "{malicious-service}" -Force
sc.exe delete "{malicious-service}"
```

```bash
# Linux - List suspicious services
systemctl list-unit-files --type=service --state=enabled

# Stop and disable malicious service
sudo systemctl stop {malicious-service}
sudo systemctl disable {malicious-service}
sudo rm /etc/systemd/system/{malicious-service}.service
sudo systemctl daemon-reload
```

**Registry Keys (Windows):**

```powershell
# Common persistence locations:
# HKLM\Software\Microsoft\Windows\CurrentVersion\Run
# HKCU\Software\Microsoft\Windows\CurrentVersion\Run
# HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce
# HKLM\System\CurrentControlSet\Services

# List Run keys
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# Remove malicious entry
Remove-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "{malicious-entry}"
```

**WMI Subscriptions:**

```powershell
# List WMI event subscriptions (advanced persistence)
Get-WmiObject -Namespace root\subscription -Class __EventFilter
Get-WmiObject -Namespace root\subscription -Class __EventConsumer
Get-WmiObject -Namespace root\subscription -Class __FilterToConsumerBinding

# Remove malicious WMI subscription
Get-WmiObject -Namespace root\subscription -Class __EventFilter -Filter "Name='{malicious-name}'" | Remove-WmiObject
```

**Backdoor Accounts:**

```powershell
# Windows - List all user accounts
Get-LocalUser | Select Name, Enabled, LastLogon

# Disable suspicious account
Disable-LocalUser -Name "{suspicious-account}"

# Delete backdoor account
Remove-LocalUser -Name "{backdoor-account}"
```

```bash
# Linux - List all users
cat /etc/passwd | grep -v "nologin\|false"

# Lock suspicious account
sudo usermod -L {suspicious-account}

# Delete backdoor account
sudo userdel -r {backdoor-account}
```

**Web Shells (if web server compromised):**

```bash
# Search for common web shells
find /var/www -type f \( -name "*.php" -o -name "*.asp" -o -name "*.jsp" \) -exec grep -l "eval\|base64_decode\|exec\|system" {} \;

# Delete identified web shells
rm {webshell-path}
```

**Startup Folders:**

```powershell
# Windows
dir "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
dir "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"

# Remove malicious startup items
Remove-Item "{malicious-startup-file}"
```

**Cron Jobs (Linux):**

```bash
# List all cron jobs
for user in $(cut -f1 -d: /etc/passwd); do echo "=== $user ==="; crontab -u $user -l 2>/dev/null; done

# Remove malicious cron job
crontab -u {username} -e
# (delete malicious lines)
```

**For each system, document removed persistence:**

**System:** {hostname}
- **Scheduled tasks removed:** {list}
- **Services removed:** {list}
- **Registry keys removed:** {list}
- **WMI subscriptions removed:** {list}
- **Backdoor accounts removed:** {list}
- **Web shells removed:** {list}
- **Startup items removed:** {list}
- **Cron jobs removed:** {list}
- **Removal timestamp:** {timestamp}

**All persistence removed from all systems? (Y/N):**"

**Log to sidecar.**

### 3. Credential Reset Procedures

"**CREDENTIAL RESET PROCEDURES**

**CRITICAL:** All compromised credentials MUST be reset to prevent re-entry.

---

**USER ACCOUNT CREDENTIALS**

**Compromised user accounts (from step 5b):** {compromised-usernames-list}

**What directory service?**
1. Active Directory (on-premises)
2. Azure AD / Entra ID
3. Local accounts
4. Other

Your choice (1-4):"

**Based on choice, provide reset commands:**

**Active Directory:**

"**Active Directory - Credential Reset**

```powershell
# Force password reset for compromised users
Import-Module ActiveDirectory

# Reset single user password
Set-ADAccountPassword -Identity "{username}" -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "{new-temp-password}" -Force)
Set-ADUser -Identity "{username}" -ChangePasswordAtLogon $true

# Revoke all active sessions
Revoke-ADUserSession -Identity "{username}"

# For multiple users:
$compromisedUsers = @("{user1}", "{user2}", "{user3}")
foreach ($user in $compromisedUsers) {
    Set-ADAccountPassword -Identity $user -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "{temp-pass}" -Force)
    Set-ADUser -Identity $user -ChangePasswordAtLogon $true
    Write-Host "Reset password for $user"
}
```

**Compromised users reset:**
| Username | Password Reset | Session Revoked | Timestamp | Performed By |
|----------|---------------|-----------------|-----------|--------------|
| {user1} | ✅ | ✅ | {timestamp} | {your-name} |

**All compromised user passwords reset? (Y/N):**"

**Azure AD / Entra ID:**

"**Azure AD - Credential Reset**

```powershell
# Connect to Azure AD
Connect-AzureAD

# Reset user password
Set-AzureADUserPassword -ObjectId "{user@domain.com}" -Password (ConvertTo-SecureString -String "{temp-password}" -AsPlainText -Force) -ForceChangePasswordNextSignIn $true

# Revoke refresh tokens (signs out all sessions)
Revoke-AzureADUserAllRefreshToken -ObjectId "{user@domain.com}"
```

**All Azure AD user passwords reset? (Y/N):**"

---

**ADMIN/PRIVILEGED ACCOUNT CREDENTIALS**

"**ADMIN ACCOUNT CREDENTIALS**

**Privileged accounts affected:**
- Domain Admins
- Enterprise Admins
- Local Administrators
- Service Accounts with elevated privileges

**Admin accounts to reset:** {prompt-for-list}

```powershell
# Active Directory - Admin password reset
Set-ADAccountPassword -Identity "{domain-admin-username}" -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "{complex-new-password}" -Force)
Set-ADUser -Identity "{domain-admin-username}" -ChangePasswordAtLogon $false

# Document new admin password in password vault immediately
```

**Admin accounts reset:**
| Account | Type | Password Reset | New Password Stored in Vault | Timestamp |
|---------|------|---------------|------------------------------|-----------|
| {account1} | Domain Admin | ✅ | ✅ | {timestamp} |

**All admin passwords reset and secured? (Y/N):**"

---

**SERVICE ACCOUNT CREDENTIALS**

"**SERVICE ACCOUNT CREDENTIALS**

Service accounts require coordination with application teams.

**Service accounts affected:** {prompt-for-list}

**For each service account:**

**Service Account:** {service-account-name}
- **Used by application/service:** {application-name}
- **Application owner notified:** {Y/N}
- **Downtime window scheduled:** {timestamp-or-N/A}
- **New password generated:** {Y/N}
- **Application config updated:** {Y/N}
- **Service restarted:** {Y/N}
- **Validation complete:** {Y/N}

```powershell
# Active Directory - Service account reset
Set-ADAccountPassword -Identity "{service-account}" -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "{complex-new-password}" -Force)
Set-ADUser -Identity "{service-account}" -ChangePasswordAtLogon $false
```

**Update application configuration with new credentials BEFORE service restart.**

**All service account passwords reset and applications operational? (Y/N):**"

---

**CLOUD ACCOUNT CREDENTIALS**

"**CLOUD ACCOUNT CREDENTIALS**

**Cloud platforms affected:**
- [ ] AWS
- [ ] Azure
- [ ] Google Cloud
- [ ] Other

**AWS Credential Reset:**

```bash
# Rotate access keys for compromised IAM users
aws iam create-access-key --user-name {compromised-user}
# (provide new key to user)
aws iam delete-access-key --user-name {compromised-user} --access-key-id {old-key-id}

# Force password reset
aws iam update-login-profile --user-name {user} --password {temp-password} --password-reset-required
```

**Azure Credential Reset:**

```powershell
# Rotate service principal credentials
New-AzADSpCredential -ObjectId {service-principal-id}
Remove-AzADSpCredential -ObjectId {service-principal-id} -KeyId {old-key-id}
```

**GCP Credential Reset:**

```bash
# Rotate service account keys
gcloud iam service-accounts keys create new-key.json --iam-account={service-account-email}
gcloud iam service-accounts keys delete {old-key-id} --iam-account={service-account-email}
```

**All cloud credentials reset? (Y/N):**"

---

**API KEYS AND TOKENS**

"**API KEYS AND TOKENS**

**Compromised API keys/tokens (if any):**

For each API key/token:

**API Key:** {key-name-or-id}
- **Service:** {service-name}
- **Key revoked:** {Y/N}
- **New key generated:** {Y/N}
- **Application config updated:** {Y/N}
- **Timestamp:** {timestamp}

**All API keys and tokens rotated? (Y/N):**"

**Log all credential resets to sidecar.**

### 4. Vulnerability Remediation

"**VULNERABILITY REMEDIATION**

**Root cause vulnerability (from step 5b):** {vulnerability-description}

**CVE ID (if applicable):** {CVE-YYYY-NNNNN}

Would you like me to use **Web-Browsing** to research patch details for this CVE? (Y/N):"

**If Yes:**

"**Researching patch information...**

{execute-web-search-for-cve-patches}"

**Patch Deployment:**

"**PATCH DEPLOYMENT PLAN**

**Vulnerability:** {description}
**CVE:** {CVE-ID}
**Patch Available:** {Y/N}
**Patch Version:** {version}
**Affected Systems:** {list}

**Patching Strategy:**

1. **Critical systems (P1):** Patch immediately with change control approval
2. **High priority (P2):** Patch within 24 hours
3. **Standard systems (P3):** Patch within 72 hours

**Patch Execution:**

```powershell
# Windows Update (if Windows patch)
Install-WindowsUpdate -KBArticleID "{KB-number}" -AcceptAll -AutoReboot

# Or WSUS/SCCM deployment
# Or manual patch installation
```

```bash
# Linux patching
sudo apt update && sudo apt upgrade -y {package-name}
# or
sudo yum update -y {package-name}
```

**For each system:**

**System:** {hostname}
- **Patch applied:** {patch-version}
- **Application timestamp:** {timestamp}
- **Reboot required:** {Y/N}
- **Reboot completed:** {Y/N}
- **Patch verified:** {Y/N}
- **System operational:** {Y/N}

**All systems patched? (Y/N):**"

---

**CONFIGURATION HARDENING**

"**CONFIGURATION HARDENING**

Based on root cause analysis, implement hardening measures:

**Hardening Actions:**

What hardening is required based on the vulnerability?

Examples:
- Disable SMBv1
- Enable Windows Firewall
- Restrict PowerShell execution policy
- Disable unnecessary services
- Apply CIS benchmarks
- Implement application whitelisting
- Enable logging/auditing

**Your hardening actions:** {prompt-for-list}

**For each hardening action:**

**Action:** {description}
- **Systems affected:** {list}
- **Configuration change:** {details}
- **Validation:** {how-verified}
- **Timestamp:** {timestamp}

**All hardening complete? (Y/N):**"

---

**SECURITY CONTROL ENHANCEMENTS**

"**SECURITY CONTROL ENHANCEMENTS**

Based on lessons learned, what security controls need enhancement?

Examples:
- Deploy EDR to uncovered systems
- Enable MFA for all admin accounts
- Implement email security (anti-phishing)
- Network segmentation
- Privilege access management (PAM)
- Enhanced logging

**Control enhancements planned:**

| Control | Current State | Target State | Priority | Owner | Due Date |
|---------|---------------|--------------|----------|-------|----------|
| {control} | {current} | {target} | {P1/P2/P3} | {owner} | {date} |

**Immediate enhancements completed? (Y/N):**"

**Log all remediation to sidecar.**

### 5. Clean System Validation

"**CLEAN SYSTEM VALIDATION**

Before proceeding to recovery, we must validate all systems are clean.

---

**VALIDATION CHECKLIST**

For each affected system, verify:

**System:** {hostname}

**1. EDR/AV Scan Clean:**
- [ ] Full system scan completed
- [ ] No threats detected
- [ ] EDR agent reporting healthy

```powershell
# Windows Defender
Get-MpComputerStatus
Get-MpThreatDetection

# Or check EDR console
```

**Scan result:** {clean/threats-found}

**2. No Persistence Mechanisms:**
- [ ] Scheduled tasks reviewed - none malicious
- [ ] Services reviewed - none malicious
- [ ] Registry Run keys clean
- [ ] No WMI subscriptions
- [ ] No backdoor accounts
- [ ] No web shells (if web server)
- [ ] Startup folders clean
- [ ] Cron jobs clean (Linux)

**Persistence check:** {clean/suspicious-items-found}

**3. All IOCs Removed:**
- [ ] No malicious files present (hash verification)
- [ ] No malicious IPs in firewall/EDR logs
- [ ] No malicious domains in DNS logs
- [ ] No suspicious network connections

**IOC check:** {all-removed/still-present}

**4. Credentials Rotated:**
- [ ] User passwords reset
- [ ] Admin passwords reset
- [ ] Service account passwords reset (and apps updated)
- [ ] API keys rotated
- [ ] Cloud credentials rotated

**Credential check:** {all-rotated/pending}

**5. Vulnerabilities Patched:**
- [ ] CVE patch applied
- [ ] Configuration hardened
- [ ] Security controls enhanced

**Patch check:** {patched/pending}

**Overall System Status:** {CLEAN / NOT CLEAN}

**Repeat validation for all affected systems.**

**All systems validated clean? (Y/N):**"

**If any system not clean:**

"⚠️ **VALIDATION FAILED**

**System:** {hostname}
**Issue:** {description}

**Action Required:** Return to appropriate eradication step and resolve issue before proceeding.

**Cannot proceed to recovery until ALL systems are validated clean.**"

**If all systems clean:**

"✅ **ALL SYSTEMS VALIDATED CLEAN**

All affected systems have been verified clean and eradication is complete."

### 6. Sign-Off Requirements

"**ERADICATION SIGN-OFF**

**REQUIRED SIGN-OFF**

Eradication phase requires formal approval before proceeding to recovery.

**Eradication Summary:**

**Incident:** {incident-id} - {incident-type}
**Eradication Date:** {current-date}
**Systems Eradicated:** {count} systems
**Threat Removal:**
- Malware removed: {count} files
- Persistence removed: {count} mechanisms
- Credentials reset: {count} accounts
- Vulnerabilities patched: {count} systems
- All systems validated clean: ✅

**Sign-Off:**

**IR Team Lead:**
- Name: {prompt-for-name}
- Title: {prompt-for-title}
- Signature: {prompt-for-digital-signature-or-approval}
- Date/Time: {current-timestamp}
- Approval: I confirm all threat actor presence has been removed and systems are clean.

**Security Team Lead:**
- Name: {prompt-for-name}
- Title: {prompt-for-title}
- Signature: {prompt-for-approval}
- Date/Time: {current-timestamp}
- Approval: I confirm security validation is complete and systems are ready for recovery.

**Sign-off documented? (Y/N):**"

### 7. Document Eradication

"**DOCUMENTING ERADICATION...**"

**Append to Section 3 (Actions Taken) in output file:**

```markdown
### 3.X Eradication (Continued)

**Eradication Phase:** {start-timestamp} to {completion-timestamp}

#### 3.X.1 Threat Actor Removal

**Malware Removal:**

| System | Malware Removed | Processes Terminated | Scan Result | Timestamp |
|--------|----------------|---------------------|-------------|-----------|
| {hostname} | {files} | {processes} | Clean | {timestamp} |

**Total malware files removed:** {count}

**Persistence Mechanism Removal:**

| System | Scheduled Tasks | Services | Registry Keys | WMI Subs | Backdoor Accounts | Other | Timestamp |
|--------|----------------|----------|---------------|----------|-------------------|-------|-----------|
| {hostname} | {count} | {count} | {count} | {count} | {count} | {details} | {timestamp} |

**Total persistence mechanisms removed:** {count}

#### 3.X.2 Credential Reset

**User Account Credentials:**

| Username | Account Type | Password Reset | Sessions Revoked | Timestamp | Reset By |
|----------|--------------|----------------|------------------|-----------|----------|
| {user} | Standard | ✅ | ✅ | {timestamp} | {name} |

**Total user passwords reset:** {count}

**Admin Account Credentials:**

| Account | Type | Password Reset | Vault Updated | Timestamp |
|---------|------|----------------|---------------|-----------|
| {account} | Domain Admin | ✅ | ✅ | {timestamp} |

**Service Account Credentials:**

| Service Account | Application | Downtime Window | Password Reset | App Config Updated | Service Operational | Timestamp |
|----------------|-------------|-----------------|----------------|-------------------|-------------------|-----------|
| {account} | {app} | {window} | ✅ | ✅ | ✅ | {timestamp} |

**Cloud Credentials:**

| Platform | Account/Key | Old Credential Revoked | New Credential Generated | Timestamp |
|----------|-------------|----------------------|-------------------------|-----------|
| AWS | {user} | ✅ | ✅ | {timestamp} |

**API Keys:**

| Service | Key ID | Revoked | New Key Generated | Config Updated | Timestamp |
|---------|--------|---------|------------------|----------------|-----------|
| {service} | {key-id} | ✅ | ✅ | ✅ | {timestamp} |

**Total credentials reset:** {count}

#### 3.X.3 Vulnerability Remediation

**Root Cause Vulnerability:** {description}
**CVE ID:** {CVE-YYYY-NNNNN}
**Patch Version:** {version}

**Patch Deployment:**

| System | Priority | Patch Applied | Version | Reboot Required | Validation | Timestamp |
|--------|----------|---------------|---------|----------------|------------|-----------|
| {hostname} | P1 | ✅ | {version} | Yes/No | ✅ | {timestamp} |

**Total systems patched:** {count}

**Configuration Hardening:**

| Action | Systems Affected | Configuration Change | Validation | Timestamp |
|--------|------------------|---------------------|------------|-----------|
| {action} | {count} | {details} | ✅ | {timestamp} |

**Security Control Enhancements:**

| Control | Current State | Target State | Status | Owner | Timeline |
|---------|---------------|--------------|--------|-------|----------|
| {control} | {current} | {target} | Completed/Planned | {owner} | {timeline} |

#### 3.X.4 Clean System Validation

**Validation Checklist Results:**

| System | EDR Scan | Persistence Check | IOC Check | Credentials | Patches | Overall Status |
|--------|----------|------------------|-----------|-------------|---------|---------------|
| {hostname} | Clean ✅ | Clean ✅ | Removed ✅ | Reset ✅ | Applied ✅ | **CLEAN** ✅ |

**All systems validated clean:** ✅

#### 3.X.5 Eradication Sign-Off

**IR Team Lead Approval:**
- Name: {name}
- Title: {title}
- Date: {timestamp}
- Confirmation: All threat actor presence removed and systems clean

**Security Team Lead Approval:**
- Name: {name}
- Title: {title}
- Date: {timestamp}
- Confirmation: Security validation complete, ready for recovery

**Eradication Phase Complete:** {completion-timestamp}
```

**Update sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Eradication
- Action: Complete threat eradication and validation
- Details: |
    Eradication Phase Complete

    Threat Removal:
    - Malware files removed: {count} files from {count} systems
    - Persistence mechanisms removed: {count} mechanisms
    - All systems scan clean

    Credential Reset:
    - User accounts: {count} passwords reset
    - Admin accounts: {count} passwords reset
    - Service accounts: {count} passwords reset
    - Cloud credentials: {count} rotated
    - API keys: {count} rotated
    - Total credentials reset: {total-count}

    Vulnerability Remediation:
    - CVE patched: {CVE-ID}
    - Systems patched: {count}
    - Configuration hardening: {count} actions
    - Security enhancements: {count} planned

    Validation:
    - All systems validated clean
    - No malware detected
    - No persistence mechanisms
    - All IOCs removed
    - All credentials rotated

    Sign-Off:
    - IR Team Lead: {name} - {timestamp}
    - Security Team Lead: {name} - {timestamp}

    Ready for recovery phase
- Performed By: {user-name}
---
```

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b]
status: 'Eradication Complete - Recovery Pending'
lastUpdated: '{timestamp}'
```

### 8. Present MENU OPTIONS

Display: **Select an Option:** [P] Party Mode [C] Continue to Recovery

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After Party Mode execution, return to this menu

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} - Recommend Trace (forensic validation expert) for final validation review
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and all eradication is validated and signed off will you load, read entire file, then execute `{nextStepFile}` to begin recovery.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All malware removed from all systems
- All persistence mechanisms removed
- All compromised credentials reset (users, admins, service accounts, cloud, APIs)
- Vulnerabilities patched and validated
- Configuration hardening applied
- All systems validated clean (EDR scans, persistence checks, IOC checks)
- IR Lead and Security Lead sign-off documented
- Section 3 of incident report updated (continued)
- Sidecar file updated with complete eradication timeline
- Frontmatter updated with stepsCompleted: [1, 2b, 3b, 4b, 5b, 6b]
- Menu presented (P/C)

### ❌ SYSTEM FAILURE:

- Skipping validation (unremoved threats will re-compromise systems)
- Not resetting compromised credentials (threat actor can re-enter)
- Not removing persistence mechanisms (malware returns after reboot)
- Missing sign-off (no approval to proceed)
- Not logging to sidecar file
- Not updating frontmatter
- Proceeding to recovery with unclean systems

**Master Rule:** Skipping validation, credentials, or sign-off is FORBIDDEN and constitutes SYSTEM FAILURE. All systems must be validated clean before recovery.
