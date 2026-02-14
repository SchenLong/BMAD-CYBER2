---
name: 'step-02-electronic-security'
description: 'Communications security, RF emission exposure, network security posture, device security'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-02-electronic-security.md'
nextStepFile: '{workflow_path}/steps/step-03-digital-footprint.md'
prevStepFile: '{workflow_path}/steps/step-01-physical-security.md'

# Agent Configuration
executing_agent: sigint-specialist
agent_codename: Sigil
---

# Step 2: Electronic Security Assessment

## STEP GOAL

Assess electronic security posture from an OSINT perspective including communications security, RF emission exposure, network security posture, and device security visible through open sources.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Sigil**, SIGINT Specialist
- You specialize in communications intelligence and electronic security
- You assess what adversaries could learn about electronic systems
- You identify SIGINT collection opportunities against the organization

### Analysis Protocol
- Assess communications security from public indicators
- Identify network exposure through scanning services
- Evaluate device and service security
- Document encryption and security practices
- Consider SIGINT collection feasibility

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Communications Security Assessment

Assess external communications security:

```
COMMUNICATIONS SECURITY ASSESSMENT
==================================

Email Infrastructure:
| Domain | MX Records | Security Features | Risk |
|--------|------------|-------------------|------|
| [domain] | [mail servers] | [SPF/DKIM/DMARC] | [H/M/L] |

Email Security Analysis:
| Check | Result | Implication |
|-------|--------|-------------|
| SPF Record | [present/missing/weak] | [spoofing risk] |
| DKIM | [present/missing] | [authentication] |
| DMARC | [policy: none/quarantine/reject] | [enforcement] |
| MTA-STS | [present/missing] | [downgrade attack] |

Webmail Exposure:
| Service | URL | Security | Risk |
|---------|-----|----------|------|
| [OWA/Gmail/etc] | [url] | [2FA required?] | [H/M/L] |

Communication Platforms (Visible):
| Platform | Evidence | Security Assessment |
|----------|----------|---------------------|
| Slack | [evidence of use] | [workspace exposure] |
| Teams | [evidence] | [external sharing?] |
| Zoom | [meeting links found] | [security settings] |
| Other | [platform] | [assessment] |

Phone System:
| Type | Provider (if known) | Exposure | Risk |
|------|---------------------|----------|------|
| [VoIP/Traditional] | [provider] | [published numbers] | [vishing risk] |

Encryption Practices (Observable):
| Communication Type | Encryption Evidence | Assessment |
|--------------------|---------------------|------------|
| Email | [TLS/S/MIME/PGP] | [adequate/weak] |
| Website | [TLS version] | [configuration] |
| VPN | [evidence of use] | [technology if known] |

□ Email security score: [X/10]
□ Communication platform exposure: [H/M/L]
□ Encryption practices: [strong/adequate/weak]
```

### 2. Network Security Posture

Assess externally visible network security:

```
NETWORK SECURITY POSTURE
========================

Internet-Facing Assets (Shodan/Censys):
| IP/Domain | Services | Ports | Risk |
|-----------|----------|-------|------|
| [IP/domain] | [services found] | [open ports] | [H/M/L] |

Service Version Exposure:
| Service | Version | Vulnerability Status | Risk |
|---------|---------|---------------------|------|
| [Apache/nginx/etc] | [version] | [known vulns?] | [H/M/L] |
| [SSH] | [version] | [status] | [risk] |
| [Other] | [version] | [status] | [risk] |

SSL/TLS Configuration:
| Domain | Grade | Issues | Risk |
|--------|-------|--------|------|
| [domain] | [A/B/C/F] | [weak ciphers, old TLS] | [H/M/L] |

DNS Configuration:
| Check | Result | Risk |
|-------|--------|------|
| DNSSEC | [enabled/disabled] | [cache poisoning] |
| Zone transfer | [allowed/denied] | [enumeration] |
| Subdomain exposure | [count discovered] | [attack surface] |

Cloud Service Exposure:
| Service | Evidence | Exposure | Risk |
|---------|----------|----------|------|
| AWS | [S3 buckets, etc] | [public access?] | [H/M/L] |
| Azure | [services] | [exposure] | [risk] |
| GCP | [services] | [exposure] | [risk] |

API Exposure:
| API | Documentation Public | Authentication | Risk |
|-----|---------------------|----------------|------|
| [API] | [Y/N] | [type] | [H/M/L] |

Remote Access:
| Service | Evidence | Security | Risk |
|---------|----------|----------|------|
| VPN | [technology] | [assessment] | [H/M/L] |
| RDP | [exposed?] | [security] | [risk] |
| SSH | [exposed?] | [configuration] | [risk] |

□ Internet-facing assets: [count]
□ Critical exposures: [count]
□ Patch status concerns: [count]
```

### 3. WiFi and RF Exposure

Assess wireless exposure (from public sources):

```
WIFI AND RF EXPOSURE
====================

WiFi Network Visibility (Wigle.net, etc):
| Facility | Networks Visible | Security | Last Seen |
|----------|------------------|----------|-----------|
| [location] | [SSID list] | [WPA2/WPA3/Open] | [date] |

WiFi Security Assessment:
| SSID | Security Protocol | Risk | Notes |
|------|-------------------|------|-------|
| [network name] | [WPA2-Enterprise/PSK] | [H/M/L] | [naming reveals?] |
| [guest network] | [security] | [risk] | [isolation?] |

SSID Information Leakage:
| SSID | Information Revealed | Risk |
|------|---------------------|------|
| [CORP_ORG_5G] | [company name, floor?] | [social engineering] |
| [EXEC_SUITE] | [executive area] | [targeting info] |

Bluetooth/IoT Exposure:
| Device Type | Evidence | Risk |
|-------------|----------|------|
| [Bluetooth devices] | [visible in photos] | [pairing attacks] |
| [IoT devices] | [smart building systems] | [attack surface] |

RF Environment Concerns:
| Concern | Evidence | Risk |
|---------|----------|------|
| Conference room WiFi | [separate/same network?] | [eavesdropping] |
| Visitor WiFi | [segmentation?] | [pivot risk] |
| Building automation | [evidence] | [access/disruption] |

□ WiFi networks discovered: [count]
□ Security protocol concerns: [count]
□ SSID information leakage: [Y/N]
```

### 4. Device and Endpoint Exposure

Assess device security from OSINT:

```
DEVICE AND ENDPOINT EXPOSURE
============================

Device Information Leakage:
| Source | Devices Visible | Risk |
|--------|-----------------|------|
| Social media photos | [laptops, phones] | [make/model known] |
| LinkedIn | [work setup photos] | [software visible] |
| News/press | [executive devices] | [targeting info] |

Mobile Device Management (Evidence):
| Indicator | Observation | Assessment |
|-----------|-------------|------------|
| MDM in use | [evidence] | [managed/unmanaged] |
| BYOD policy | [evidence] | [risk level] |
| Device types | [iOS/Android/mix] | [standardization] |

Software Stack (Visible):
| Category | Software | Evidence | Risk |
|----------|----------|----------|------|
| OS | [Windows/Mac/Linux] | [photos/job posts] | [targeting] |
| Browser | [Chrome/Edge/etc] | [screenshots] | [plugin attacks] |
| Email client | [Outlook/etc] | [interface visible] | [phishing customization] |
| Productivity | [O365/Google/etc] | [documents] | [attack vectors] |

Printer/MFD Exposure:
| Evidence | Risk |
|----------|------|
| [Shodan results] | [data extraction] |
| [Visible in photos] | [make/model] |

Webcam/Audio Device Concerns:
| Device | Visibility | Risk |
|--------|------------|------|
| Conference room systems | [model visible] | [vulnerabilities] |
| Desktop webcams | [photos] | [hijacking] |

□ Device types identifiable: [count]
□ Software stack visible: [Y/N]
□ MDM evidence: [Y/N]
```

### 5. SIGINT Collection Feasibility

Assess adversary SIGINT opportunities:

```
SIGINT COLLECTION FEASIBILITY
=============================

Collection Opportunities:
| Target | Method | Feasibility | Value |
|--------|--------|-------------|-------|
| Email | [MitM/compromise/access] | [H/M/L] | [H/M/L] |
| VoIP | [interception] | [feasibility] | [value] |
| WiFi | [proximity collection] | [feasibility] | [value] |
| Mobile | [targeting] | [feasibility] | [value] |

Encryption Barriers:
| Communication | Encryption | Bypass Difficulty |
|---------------|------------|-------------------|
| [type] | [encryption used] | [easy/moderate/difficult] |

Metadata Exposure:
| Source | Metadata Available | Intelligence Value |
|--------|-------------------|-------------------|
| Email headers | [sender/receiver/timing] | [pattern analysis] |
| Certificate logs | [domain relationships] | [infrastructure map] |
| DNS queries | [if observable] | [interests/tools] |

Covert Access Points:
| Access Point | Feasibility | Detection Risk |
|--------------|-------------|----------------|
| [WiFi proximity] | [assessment] | [risk] |
| [Visitor network] | [assessment] | [risk] |
| [Supply chain] | [assessment] | [risk] |

□ High-value SIGINT targets: [count]
□ Collection feasibility: [easy/moderate/difficult]
□ Encryption effectiveness: [strong/adequate/weak]
```

### 6. Electronic Security Summary

Compile electronic assessment findings:

```
ELECTRONIC SECURITY SUMMARY
===========================

Risk Score by Category:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Communications security | [H/M/L] | [summary] |
| Network posture | [H/M/L] | [summary] |
| WiFi/RF exposure | [H/M/L] | [summary] |
| Device security | [H/M/L] | [summary] |
| **OVERALL ELECTRONIC** | **[H/M/L]** | **[summary]** |

Critical Electronic Vulnerabilities:
| Rank | Vulnerability | Risk | Remediation Priority |
|------|---------------|------|---------------------|
| 1 | [most critical] | [H] | Immediate |
| 2 | [second] | [H/M] | [priority] |
| 3 | [third] | [M] | [priority] |

SIGINT Risk Assessment:
| Collection Type | Feasibility | Mitigation Status |
|-----------------|-------------|-------------------|
| Email interception | [H/M/L] | [assessment] |
| Network eavesdropping | [H/M/L] | [assessment] |
| WiFi collection | [H/M/L] | [assessment] |
| Mobile targeting | [H/M/L] | [assessment] |

Quick Wins (Electronic):
| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| [action 1] | [impact] | [effort] | [P1/P2/P3] |
| [action 2] | [impact] | [effort] | [priority] |

HANDOFF TO ECHO (Step 3):
- Domains to assess social presence: [list]
- Personnel for social exposure: [list]
- Platforms to investigate: [from device/software observations]
- Communication platforms in use: [for social footprint]
```

---

## STEP 2 OUTPUT

```markdown
## ELECTRONIC SECURITY ASSESSMENT SUMMARY

### Risk Assessment
| Category | Risk Level |
|----------|------------|
| Communications Security | [H/M/L] |
| Network Posture | [H/M/L] |
| WiFi/RF Exposure | [H/M/L] |
| Device Security | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical electronic vulnerability]
2. [Second finding]
3. [Third finding]

### External Attack Surface
- Internet-facing services: [count]
- Open ports of concern: [count]
- SSL/TLS issues: [count]

### SIGINT Collection Risk
- Collection feasibility: [easy/moderate/difficult]
- Primary concern: [most vulnerable channel]

### Quick Wins
- [Immediate action 1]
- [Immediate action 2]

### Digital Footprint Targets for Echo
- Domains: [list]
- Personnel: [list]
- Platforms: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Communications security assessed
- [ ] Network posture evaluated
- [ ] WiFi/RF exposure analyzed
- [ ] Device security reviewed
- [ ] SIGINT feasibility assessed
- [ ] Risk scores assigned
- [ ] Targets prepared for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to digital footprint assessment (Step 3)
**[N] Network** - Deeper network analysis
**[W] WiFi** - Extended wireless assessment
**[E] Email** - Email security deep dive

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-digital-footprint.md`
