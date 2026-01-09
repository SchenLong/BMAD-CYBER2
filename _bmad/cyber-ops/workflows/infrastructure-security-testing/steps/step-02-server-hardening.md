---
name: 'step-02-server-hardening'
description: 'Server hardening assessment for Linux and Windows'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-02-server-hardening.md'
nextStepFile: '{workflow_path}/steps/step-03-container-security.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 2: Server Hardening Assessment

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide hardening assessment based on CIS benchmarks

## SERVER HARDENING SEQUENCE:

### 1. Operating System Inventory

"Let's inventory the systems to assess.

**System Information:**
- OS type and version
- Patch level
- Role/purpose
- Network exposure
- Criticality rating

**Sample Systems:**
- Select representative systems per OS type
- Include internet-facing and internal
- Cover different roles (web, database, etc.)

What systems should we assess?"

### 2. Linux Hardening Assessment

"For Linux systems, let's check CIS benchmark controls.

**Filesystem Configuration:**
- Separate partitions (/tmp, /var, /home)
- noexec, nosuid, nodev mount options
- Sticky bit on world-writable directories

**Boot Settings:**
- GRUB password protection
- Single-user mode authentication
- Secure boot configuration

**Process Hardening:**
- ASLR enabled
- Core dumps restricted
- ptrace scope limited

**Commands:**
```bash
# Check mount options
mount | grep -E '(tmp|var|home)'

# Check kernel parameters
sysctl -a | grep -E '(randomize|ptrace|core)'

# Check running services
systemctl list-units --type=service --state=running
```

What Linux hardening results do you have?"

### 3. User and Access Control

"Let's review user and access controls.

**User Account Security:**
- Root login disabled (SSH)?
- Password policy enforced?
- Account lockout configured?
- Inactive accounts removed?

**Privilege Management:**
- Sudo configuration secure?
- No unauthorized SUID/SGID binaries?
- umask settings appropriate?

**Authentication:**
- SSH key-based auth enforced?
- MFA implemented?
- PAM configuration secure?

**Commands:**
```bash
# Check password policy
grep -E '^PASS' /etc/login.defs

# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check sudoers
cat /etc/sudoers
```

What user/access control findings do you have?"

### 4. Network Configuration

"Reviewing network security settings.

**Firewall:**
- iptables/nftables rules configured?
- Default deny policy?
- Only required ports open?

**Network Parameters:**
- IP forwarding disabled (if not router)?
- ICMP redirects disabled?
- Source routing disabled?
- SYN cookies enabled?

**Network Services:**
- Unnecessary services disabled?
- Services bound to localhost where possible?

**Commands:**
```bash
# Check firewall
iptables -L -n -v

# Check network parameters
sysctl -a | grep -E '(forward|icmp|accept_source_route)'

# Check listening services
ss -tlnp
```

What network configuration have you reviewed?"

### 5. Logging and Auditing

"Reviewing logging and audit configuration.

**System Logging:**
- rsyslog/journald configured?
- Log rotation in place?
- Remote logging enabled?
- Log integrity protection?

**Audit System:**
- auditd running?
- Critical file access monitored?
- Privileged command execution logged?
- Login/logout events captured?

**Commands:**
```bash
# Check audit status
auditctl -s

# Check audit rules
auditctl -l

# Check log configuration
cat /etc/rsyslog.conf
```

What logging/audit configuration have you found?"

### 6. Windows Hardening (if applicable)

"For Windows systems:

**Security Policies:**
- Password policy
- Account lockout
- Audit policy
- User rights assignment

**Services and Features:**
- Unnecessary services disabled?
- SMBv1 disabled?
- Windows Firewall enabled?
- PowerShell logging enabled?

**Updates:**
- Windows Update configured?
- WSUS/SCCM managed?
- Pending updates?

**Commands:**
```powershell
# Check password policy
Get-ADDefaultDomainPasswordPolicy

# Check running services
Get-Service | Where-Object {$_.Status -eq 'Running'}

# Check Windows features
Get-WindowsFeature | Where-Object Installed
```

What Windows hardening have you assessed?"

### 7. Document Server Hardening

Append to {outputFile} Section 2:

```markdown
## 2. Server Hardening Assessment

### 2.1 Systems Assessed
| Hostname | OS | Version | Role | Benchmark |
|----------|-----|---------|------|-----------|
| | | | | CIS Level 1/2 |

### 2.2 Linux Hardening
| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Filesystem partitioning | | | |
| Mount options | | | |
| Kernel parameters | | | |
| Service hardening | | | |

### 2.3 User/Access Control
| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Password policy | | | |
| SSH configuration | | | |
| Sudo configuration | | | |
| SUID/SGID review | | | |

### 2.4 Network Security
| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Firewall rules | | | |
| Network parameters | | | |
| Service exposure | | | |

### 2.5 Logging/Auditing
| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| System logging | | | |
| Audit configuration | | | |
| Log protection | | | |

### 2.6 Windows Hardening (if applicable)
[Windows-specific findings]

### 2.7 Server Hardening Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| SRV-001 | | | |
```

### 8. Confirmation

"**Server Hardening Assessment Complete**

**Summary:**
- Systems assessed: [count]
- Hardening gaps: [count]
- Critical issues: [count]
- CIS compliance: [percentage]

Ready to proceed to container security?"

## MENU

Display: [C] Continue to Container Security [R] Review/Add Findings [S] Skip to K8s

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2]`, then execute {nextStepFile}.
