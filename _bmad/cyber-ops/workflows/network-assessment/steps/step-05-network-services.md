---
name: 'step-05-network-services'
description: 'Network service exploitation and testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-05-network-services.md'
nextStepFile: '{workflow_path}/steps/step-06-wireless.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 5: Network Service Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide service exploitation testing

## NETWORK SERVICE TESTING SEQUENCE:

### 1. SMB/Windows Services

"Let's test Windows/SMB services.

**SMB Enumeration:**
- Null session testing
- Share enumeration
- User enumeration
- Password policy retrieval

**SMB Attacks:**
- EternalBlue (MS17-010)
- SMB signing disabled
- Relay attacks
- Pass-the-hash

**Commands:**
```bash
# Enum4linux
enum4linux -a <target>

# SMB client
smbclient -L //<target> -N

# Nmap SMB scripts
nmap --script smb-vuln-* <target>

# CrackMapExec
crackmapexec smb <target> -u '' -p ''
```

What SMB testing have you performed?"

### 2. Active Directory (if applicable)

"For Windows domain environments:

**AD Enumeration:**
- Domain controller identification
- Domain/forest structure
- Trust relationships
- Group Policy objects
- Service accounts

**AD Attacks:**
- Kerberoasting
- AS-REP roasting
- LLMNR/NBT-NS poisoning
- Password spraying
- BloodHound path analysis

**Tools:**
- Impacket suite
- BloodHound / SharpHound
- Rubeus
- Mimikatz
- Responder

What Active Directory testing have you done?"

### 3. Database Services

"Let's test database services.

**MySQL (3306):**
- Anonymous login
- Default credentials
- Version vulnerabilities
- File read/write (FILE privilege)

**MSSQL (1433):**
- SA account testing
- xp_cmdshell
- Linked servers
- Privilege escalation

**PostgreSQL (5432):**
- Default credentials
- pg_read_file
- Large object abuse

**Commands:**
```bash
# MySQL
mysql -h <target> -u root

# MSSQL
sqsh -S <target> -U sa

# Nmap database scripts
nmap --script mysql-* <target>
nmap --script ms-sql-* <target>
```

What database testing have you completed?"

### 4. Mail Services

"Testing email services.

**SMTP (25/587):**
- Open relay testing
- User enumeration (VRFY, EXPN, RCPT TO)
- Auth brute force
- STARTTLS downgrade

**POP3/IMAP (110/143/993/995):**
- Authentication testing
- Plaintext credentials
- Version vulnerabilities

**Commands:**
```bash
# SMTP enumeration
smtp-user-enum -M VRFY -U users.txt -t <target>

# Nmap mail scripts
nmap --script smtp-* <target>
```

What mail service testing have you done?"

### 5. Remote Access Services

"Testing remote access.

**SSH (22):**
- User enumeration
- Key-based auth bypass
- Algorithm weaknesses
- Brute force (if authorized)

**RDP (3389):**
- NLA enabled?
- BlueKeep (CVE-2019-0708)
- Credential testing
- Session hijacking

**Telnet (23):**
- Cleartext credentials
- Default credentials
- Banner information

**VNC (5900):**
- No authentication
- Weak passwords
- Version vulnerabilities

What remote access testing have you performed?"

### 6. Web Services on Non-Standard Ports

"Testing web services across the network.

**Common Non-Standard Web Ports:**
- 8080, 8443, 8888
- 3000, 5000, 9000
- Management interfaces (various)

**Testing:**
- Technology fingerprinting
- Directory enumeration
- Default credentials
- Known CVEs

What web services have you identified and tested?"

### 7. Network Device Services

"Testing network infrastructure.

**SNMP (161):**
- Community string guessing
- Full MIB walking
- Configuration extraction
- Write access

**Router/Switch Access:**
- Telnet/SSH access
- Web management
- Default credentials
- Firmware vulnerabilities

**Commands:**
```bash
# SNMP enumeration
snmpwalk -v2c -c public <target>
onesixtyone -c community.txt <target>

# SNMP brute force
hydra -P community.txt <target> snmp
```

What network device testing have you done?"

### 8. Document Service Testing

Append to {outputFile} Section 5:

```markdown
## 5. Network Service Testing

### 5.1 SMB/Windows
| Host | Finding | Risk | Exploited |
|------|---------|------|-----------|
| | | | |

### 5.2 Active Directory
| Finding | Impact | Evidence |
|---------|--------|----------|
| | | |

### 5.3 Database Services
| Host | Service | Finding | Risk |
|------|---------|---------|------|
| | | | |

### 5.4 Mail Services
| Host | Service | Finding | Risk |
|------|---------|---------|------|
| | | | |

### 5.5 Remote Access
| Host | Service | Finding | Risk |
|------|---------|---------|------|
| | | | |

### 5.6 Network Devices
| Device | Finding | Risk | Evidence |
|--------|---------|------|----------|
| | | | |

### 5.7 Exploitation Results
| Target | Vulnerability | Exploit | Result |
|--------|---------------|---------|--------|
| | | | |

### 5.8 Credentials Obtained
| Source | Username | Type | Access Level |
|--------|----------|------|--------------|
| | | | |
```

### 9. Confirmation

"**Network Service Testing Complete**

**Summary:**
- Services tested: [count]
- Successful exploits: [count]
- Credentials obtained: [count]
- Lateral movement paths: [count]

Ready to proceed to wireless security testing?"

## MENU

Display: [C] Continue to Wireless Security [R] Review/Add Findings [E] Exploit Further [S] Skip Wireless

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then execute {nextStepFile}.
