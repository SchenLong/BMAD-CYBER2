---
name: 'step-02-reconnaissance'
description: 'Network reconnaissance and information gathering'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-02-reconnaissance.md'
nextStepFile: '{workflow_path}/steps/step-03-scanning.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 2: Network Reconnaissance

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Ask questions, gather information, then document

## RECONNAISSANCE SEQUENCE:

### 1. Passive Reconnaissance

"Let's start with passive information gathering.

**External Intelligence (for external tests):**
- DNS records (A, MX, NS, TXT, CNAME)
- WHOIS information
- ASN and IP block ownership
- Certificate transparency logs
- Shodan/Censys historical data
- Public breach databases

**OSINT Sources:**
- Company website and subdomains
- Job postings (technology hints)
- GitHub/GitLab repositories
- LinkedIn (employee/tech insights)

What passive reconnaissance have you gathered or want me to guide you through?"

### 2. DNS Enumeration

"Let's enumerate DNS infrastructure.

**DNS Discovery:**
- Zone transfer attempts (AXFR)
- Subdomain enumeration
- Reverse DNS lookups
- DNS record analysis

**Recommended Tools:**
- `dig`, `nslookup`, `host`
- Sublist3r, Amass, subfinder
- DNSRecon, fierce

**Key Questions:**
- Mail servers identified?
- Cloud services in use (AWS, Azure, GCP)?
- CDN providers?
- Third-party services?

What DNS enumeration results do you have?"

### 3. Network Topology Discovery

"Let's understand network topology.

**Discovery Methods:**
- Traceroute analysis
- BGP routing information
- Network diagrams (if provided)
- SNMP enumeration (if accessible)

**Key Elements:**
- Perimeter devices (firewalls, routers)
- DMZ architecture
- Internal network segments
- Cloud connectivity
- VPN concentrators

What network topology information is available?"

### 4. Live Host Discovery

"Before detailed scanning, let's identify live hosts.

**Discovery Techniques:**
- ICMP ping sweep
- TCP SYN ping (ports 80, 443)
- ARP scanning (internal)
- UDP probing

**Recommended Commands:**
```bash
# Nmap ping sweep
nmap -sn -PE -PP -PM <target_range>

# ARP scan (internal)
arp-scan --localnet

# Masscan for speed
masscan -p80,443 --rate=10000 <target_range>
```

What live host discovery have you performed?"

### 5. Document Reconnaissance

Append to {outputFile} Section 2:

```markdown
## 2. Reconnaissance

### 2.1 DNS Intelligence
| Record Type | Value | Notes |
|-------------|-------|-------|
| A | | |
| MX | | |
| NS | | |
| TXT | | |

### 2.2 Subdomains Discovered
[List of subdomains]

### 2.3 Network Topology
[Diagram or description]

### 2.4 Live Hosts Discovered
| IP Address | Hostname | Method | Notes |
|------------|----------|--------|-------|
| | | | |

### 2.5 OSINT Findings
[External intelligence gathered]

### 2.6 Reconnaissance Notes
[Additional observations]
```

### 6. Confirmation

"**Reconnaissance Complete**

**Identified:**
- [Domain count] domains/subdomains
- [Host count] live hosts
- [Key finding]

Ready to proceed to port scanning and enumeration?"

## MENU

Display: [C] Continue to Port Scanning [R] Review/Add Recon Data [T] Run Additional Tooling

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2]`, then execute {nextStepFile}.
