---
name: 'step-03-scanning'
description: 'Port scanning and service enumeration'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-03-scanning.md'
nextStepFile: '{workflow_path}/steps/step-04-vulnerability-assessment.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 3: Port Scanning & Service Enumeration

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide scanning, collect results, document findings

## SCANNING SEQUENCE:

### 1. TCP Port Scanning

"Let's perform comprehensive port scanning.

**Scanning Approaches:**
- **Fast Scan**: Top 1000 ports for quick overview
- **Full Scan**: All 65535 ports for thorough assessment
- **Targeted Scan**: Specific ports based on service interest

**Recommended Nmap Commands:**
```bash
# Fast scan with service detection
nmap -sS -sV -T4 --top-ports 1000 <target>

# Full TCP port scan
nmap -sS -p- -T4 <target>

# Aggressive service detection
nmap -sS -sV -sC -O -A <target>

# Output to file
nmap -sS -sV -oA scan_results <target>
```

What TCP scanning results do you have?"

### 2. UDP Port Scanning

"UDP services often overlooked but critical.

**Key UDP Ports:**
- 53 (DNS)
- 67/68 (DHCP)
- 69 (TFTP)
- 123 (NTP)
- 161/162 (SNMP)
- 500 (IKE/VPN)
- 514 (Syslog)
- 1900 (SSDP)

**UDP Scanning:**
```bash
# Top UDP ports
nmap -sU --top-ports 100 <target>

# Specific UDP ports
nmap -sU -p 53,161,500,1900 <target>
```

What UDP services have you discovered?"

### 3. Service Enumeration

"Let's enumerate discovered services.

**Per-Service Enumeration:**

**SSH (22):**
- Version detection
- Supported algorithms
- Banner grabbing

**HTTP/HTTPS (80/443):**
- Web technology detection
- Virtual host enumeration
- Directory brute forcing

**SMB (445):**
- Share enumeration
- Null session testing
- Version detection

**SNMP (161):**
- Community string testing
- MIB walking

**Database Ports:**
- MySQL (3306)
- PostgreSQL (5432)
- MSSQL (1433)
- Oracle (1521)

What service enumeration have you completed?"

### 4. Operating System Detection

"Let's fingerprint operating systems.

**OS Detection Methods:**
- TCP/IP stack fingerprinting
- Banner analysis
- Response timing analysis
- Service behavior

**Commands:**
```bash
# Nmap OS detection
nmap -O --osscan-guess <target>

# Combined detection
nmap -sS -sV -O <target>
```

What OS information have you gathered?"

### 5. NSE Script Scanning

"Nmap Scripting Engine for deeper enumeration.

**Useful Script Categories:**
- `default`: Safe, useful scripts
- `discovery`: Information gathering
- `vuln`: Vulnerability detection
- `auth`: Authentication testing
- `brute`: Brute force attacks

**Script Examples:**
```bash
# Default scripts
nmap -sC <target>

# Vulnerability scripts
nmap --script vuln <target>

# Specific service scripts
nmap --script smb-enum-shares <target>
nmap --script http-enum <target>
```

What NSE script results do you have?"

### 6. Document Scanning Results

Append to {outputFile} Section 3:

```markdown
## 3. Port Scanning & Enumeration

### 3.1 TCP Ports Open
| IP | Port | Service | Version | Notes |
|----|------|---------|---------|-------|
| | | | | |

### 3.2 UDP Ports Open
| IP | Port | Service | Notes |
|----|------|---------|-------|
| | | | |

### 3.3 Operating Systems
| IP | OS Detection | Confidence |
|----|--------------|------------|
| | | |

### 3.4 Service Details

#### SSH Services
[SSH enumeration results]

#### Web Services
[HTTP/HTTPS enumeration]

#### SMB/Windows Services
[SMB enumeration]

#### Database Services
[Database enumeration]

### 3.5 NSE Script Results
[Relevant script output]

### 3.6 Attack Surface Summary
- Total hosts: [count]
- Total open ports: [count]
- High-interest services: [list]
```

### 7. Confirmation

"**Scanning Complete**

**Summary:**
- [Host count] hosts scanned
- [Port count] open ports identified
- [Service count] unique services
- Key targets: [High-value targets]

Ready to proceed to vulnerability assessment?"

## MENU

Display: [C] Continue to Vulnerability Assessment [R] Review/Add Scan Data [D] Deep Dive on Service

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3]`, then execute {nextStepFile}.
