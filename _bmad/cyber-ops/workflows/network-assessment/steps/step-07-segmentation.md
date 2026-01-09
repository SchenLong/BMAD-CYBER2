---
name: 'step-07-segmentation'
description: 'Network segmentation and lateral movement testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-07-segmentation.md'
nextStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 7: Network Segmentation Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide segmentation and lateral movement testing

## SEGMENTATION TESTING SEQUENCE:

### 1. Network Zone Mapping

"Let's understand network segmentation.

**Expected Zones:**
- DMZ (public-facing services)
- Production network
- Development/staging
- Management network
- User network segments
- Guest network
- PCI/sensitive data zones
- OT/ICS networks (if applicable)

**Zone Documentation:**
- VLAN structure
- Firewall rules
- Routing policies
- Trust relationships

What network zones exist in this environment?"

### 2. VLAN Security Testing

"Testing VLAN isolation.

**VLAN Attacks:**
- VLAN hopping (DTP manipulation)
- Double tagging attacks
- CDP/LLDP information disclosure
- Native VLAN exploitation

**Testing Commands:**
```bash
# Yersinia for VLAN attacks
yersinia -G

# Check DTP status
# Via switch access or traffic capture

# VLAN hopping with Scapy
# Custom packet crafting
```

**Key Questions:**
- Can you reach other VLANs from your position?
- Is trunk port access restricted?
- Native VLAN configured securely?

What VLAN testing have you performed?"

### 3. Firewall Rule Testing

"Testing firewall effectiveness.

**Firewall Testing:**
- Allowed port/protocol analysis
- Egress filtering
- Stateful inspection bypass
- Application layer filtering

**Methods:**
```bash
# Port testing through firewall
nmap -Pn -p- <target_behind_fw>

# Firewalking
firewalk -S1-1024 -i eth0 -n <gateway> <target>

# Egress testing
# Test common egress ports (80, 443, 53)
```

**Questions:**
- What traffic is allowed between zones?
- Is east-west traffic filtered?
- Egress restrictions in place?

What firewall testing have you done?"

### 4. Lateral Movement Testing

"Testing ability to move between systems.

**Lateral Movement Techniques:**
- Pass-the-hash / Pass-the-ticket
- SSH key reuse
- Credential reuse
- Remote service exploitation
- Admin share access

**Movement Paths:**
- User → Admin systems
- DMZ → Internal network
- Production → Management
- Guest → Corporate

**Tools:**
- CrackMapExec
- Impacket (psexec, wmiexec)
- Metasploit
- Evil-WinRM

What lateral movement testing have you performed?"

### 5. Privileged Network Access

"Testing access to sensitive networks.

**Sensitive Areas:**
- Server management networks
- Database networks
- Backup infrastructure
- Hypervisor management
- Network device management
- PCI/compliance zones

**Testing:**
- Can unprivileged users reach sensitive zones?
- Are jump hosts enforced?
- Network ACLs effective?
- Micro-segmentation working?

What sensitive network access testing have you done?"

### 6. Trust Relationship Analysis

"Analyzing trust between systems.

**Trust Vectors:**
- Active Directory trusts
- SSH key distribution
- Shared credentials
- Network-level trust (IP-based)
- Application trust (service accounts)

**Questions:**
- What systems trust each other?
- Are trusts bidirectional?
- Can trust be exploited for access?

What trust relationships have you identified?"

### 7. Egress Testing

"Testing outbound traffic controls.

**Egress Channels:**
- Direct internet access
- Proxy bypass
- DNS tunneling
- ICMP tunneling
- Covert channels

**Testing:**
```bash
# DNS tunneling test
nslookup test.yourdomain.com

# ICMP tunneling
ping -c 1 exfil.yourdomain.com

# HTTP(S) egress
curl https://yourdomain.com/test
```

What egress restrictions exist?"

### 8. Document Segmentation Findings

Append to {outputFile} Section 7:

```markdown
## 7. Network Segmentation Testing

### 7.1 Network Zones
| Zone | VLAN | Purpose | Isolation Status |
|------|------|---------|------------------|
| DMZ | | | |
| Production | | | |
| Management | | | |
| User | | | |

### 7.2 VLAN Security
| Test | Result | Risk |
|------|--------|------|
| VLAN Hopping | | |
| Native VLAN | | |
| Trunk Security | | |

### 7.3 Firewall Effectiveness
| Zone Pair | Expected | Actual | Finding |
|-----------|----------|--------|---------|
| DMZ → Internal | Blocked | | |
| User → Server | Limited | | |

### 7.4 Lateral Movement Paths
| Source | Target | Method | Success |
|--------|--------|--------|---------|
| | | | |

### 7.5 Trust Relationships
| System A | System B | Trust Type | Risk |
|----------|----------|------------|------|
| | | | |

### 7.6 Egress Controls
| Channel | Status | Notes |
|---------|--------|-------|
| Direct HTTP | | |
| DNS | | |
| ICMP | | |

### 7.7 Segmentation Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| SEG-001 | | | |
```

### 9. Confirmation

"**Segmentation Testing Complete**

**Summary:**
- Zones tested: [count]
- Segmentation bypasses: [count]
- Lateral movement paths: [count]
- Egress weaknesses: [count]

Ready to proceed to findings summary and remediation?"

## MENU

Display: [C] Continue to Findings & Remediation [R] Review/Add Findings [E] Explore Specific Path

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then execute {nextStepFile}.
