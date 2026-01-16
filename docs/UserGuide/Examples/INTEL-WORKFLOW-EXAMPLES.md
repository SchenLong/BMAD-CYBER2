# Intelligence Workflow Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Module:** intel-team
> **Agents:** 11 specialized intelligence professionals

---

## Overview

The Intel Team provides comprehensive intelligence collection and analysis capabilities across OSINT, HUMINT, SIGINT, GEOINT, and threat intelligence disciplines. This guide demonstrates practical applications with realistic scenarios.

**Important**: All examples use sanitized, fictional data. Intelligence operations require proper authorization and adherence to legal/ethical guidelines.

---

## Example 1: Flash Assessment (15-Minute Triage)

### Scenario
You need a rapid overview of a potential business partner before an urgent meeting.

### Invocation
```
/bmad:intel-team:workflows:flash-assessment
```

### Workflow Execution

**Input**
```
Target: Acme Innovations Ltd
Context: Considering partnership for AI integration project.
Meeting in 2 hours. Need quick risk assessment.
```

**Step 1: Digital Footprint Scan (5 min)**
```
Resolver (Domain Intel) performs:
- Domain registration check: acmeinnovations.co.uk
- DNS history: Registered 2019, stable infrastructure
- Email configuration: SPF/DKIM/DMARC properly configured
- SSL certificate: Valid, EV certificate (higher trust)
- Technology stack: CloudFlare, AWS hosting
```

**Step 2: Corporate Verification (5 min)**
```
Proxy (Corporate Intel) verifies:
- Companies House: Active, registered 2019
- Directors: 3 directors, identities verified
- Accounts: Filed, healthy financials
- Charges: No outstanding charges
- Previous names: None (stability indicator)
```

**Step 3: Reputation Scan (5 min)**
```
Echo (Social Media) reviews:
- LinkedIn: 47 employees, active posting
- Glassdoor: 4.2/5 rating, no major red flags
- News: No negative press coverage
- Social presence: Professional, consistent messaging
```

### Sample Output: Flash Assessment Report

```markdown
# FLASH ASSESSMENT: Acme Innovations Ltd

## CLASSIFICATION: UNCLASSIFIED
## ASSESSMENT DATE: 2026-01-16

---

### ENTITY OVERVIEW
| Attribute | Value |
|-----------|-------|
| Legal Name | Acme Innovations Ltd |
| Jurisdiction | United Kingdom |
| Established | 2019 |
| Employees | ~47 (LinkedIn) |
| Industry | AI/Technology Services |

---

### QUICK RISK INDICATORS

| Category | Status | Notes |
|----------|--------|-------|
| Corporate Registration | GREEN | Active, accounts filed |
| Domain/Infrastructure | GREEN | Properly configured |
| Financial Health | AMBER | Limited public data |
| Reputation | GREEN | No negative signals |
| Leadership | GREEN | Verified identities |

---

### OVERALL ASSESSMENT: LOW RISK

**Recommendation**: Proceed with meeting. No immediate red flags.

**Suggested Follow-up**:
- Request audited financials during discussions
- Verify specific technical capabilities
- Check references from existing clients

---

### LIMITATIONS
- 15-minute assessment - not comprehensive
- Public sources only
- Financial depth limited without paid databases

---

*Assessment by: Vector (Intelligence Director)*
*Duration: 15 minutes*
```

---

## Example 2: Attribution Chain (Threat Actor Investigation)

### Scenario
Following a security incident, you've collected IOCs and need to attribute the attack to a specific threat actor.

### Invocation
```
/bmad:intel-team:workflows:attribution-chain
```

### Workflow Steps

**Step 1: Indicator Collection**
```
User Input: "Incident IOCs:
- C2 Domain: update-service[.]net
- IP: 185.220.101.42
- Malware hash: a3b2c1d4e5f6...
- TTP: Spear-phishing with macro-enabled docs
- Target: Financial services sector"

Dossier (Threat Actor Profiler) initiates analysis.
```

**Step 2: Infrastructure Analysis**
```
Resolver (Domain Intel) investigates:

Domain: update-service[.]net
├── Registered: 2025-11-15 via PrivacyProtect Inc
├── Nameservers: ns1.cloudflare-dns[.]net
├── Historical DNS:
│   └── Previously resolved to 5 different IPs
├── Related domains (shared infrastructure):
│   ├── secure-update[.]org
│   ├── microsoft-patch[.]net
│   └── windows-service[.]com
└── WHOIS correlation: Same privacy service, similar registration patterns

IP: 185.220.101.42
├── ASN: AS9009 (M247 Ltd) - Common VPN/hosting provider
├── Geolocation: Moldova
├── Historical malicious activity: Yes (VT score 12/94)
└── Co-hosted domains: 23 other suspicious domains
```

**Step 3: Malware Analysis Correlation**
```
Cipher (Threat Analyst) performs:

Malware Family: Identified as variant of "BazarLoader"
Code Similarities: 87% overlap with known samples
Infrastructure Overlap: C2 patterns match previous campaigns
Target Victimology: Financial services (consistent)

MITRE ATT&CK Mapping:
├── T1566.001 - Spear-phishing Attachment
├── T1059.001 - PowerShell Execution
├── T1071.001 - Application Layer Protocol (HTTPS)
├── T1041 - Exfiltration Over C2 Channel
└── T1486 - Data Encrypted for Impact (ransomware goal)
```

**Step 4: Actor Attribution**
```
Dossier synthesizes:

Primary Hypothesis: FIN7 / Carbanak Group
Confidence Level: MODERATE-HIGH (65%)

Evidence Supporting:
1. BazarLoader use (documented FIN7 tool)
2. Financial sector targeting (matches victimology)
3. Infrastructure patterns (consistent with previous campaigns)
4. Operational timing (GMT+3 business hours)

Alternative Hypotheses:
- FIN12: Lower probability (30%) - Different TTPs
- Unknown Actor: Possible (5%) - Using leaked tools

Diamond Model Analysis:
┌─────────────────────────────────────────┐
│              ADVERSARY                   │
│          FIN7 / Carbanak                │
│       (Eastern European eCrime)          │
├───────────────────┬─────────────────────┤
│   CAPABILITY      │   INFRASTRUCTURE    │
│  BazarLoader      │   Bulletproof VPS   │
│  Macro droppers   │   CloudFlare proxy  │
│  PowerShell       │   Moldova/Romania   │
├───────────────────┴─────────────────────┤
│              VICTIM                      │
│     Financial Services Sector            │
│    (Primary target for monetization)     │
└─────────────────────────────────────────┘
```

**Step 5: Intelligence Product**
```
Vector (Director) produces final assessment.
```

### Sample Output: Attribution Report

```markdown
# ATTRIBUTION ASSESSMENT: IR-2026-0042

## CLASSIFICATION: TLP:AMBER

---

## EXECUTIVE SUMMARY

With MODERATE-HIGH confidence (65%), we assess the attack on [Victim Org]
is attributable to FIN7/Carbanak, a Eastern European financially-motivated
threat actor group. This assessment is based on malware family identification,
infrastructure patterns, and victim targeting consistency.

---

## KEY FINDINGS

### Attributed Actor: FIN7 (Carbanak Group)

| Attribute | Assessment |
|-----------|------------|
| Actor Type | eCrime (Financially Motivated) |
| Origin | Eastern Europe (Russia/Ukraine nexus) |
| Active Since | 2013 |
| Primary Motivation | Financial gain (card data, ransomware) |
| Known Aliases | Carbanak, Navigator Group, JokerStash |

### Confidence Assessment

| Evidence Type | Confidence Contribution |
|---------------|------------------------|
| Malware Family (BazarLoader) | +25% |
| Infrastructure Patterns | +20% |
| Victim Targeting | +15% |
| Operational Timing | +5% |
| **Total Confidence** | **65% (Moderate-High)** |

---

## EVIDENCE CHAIN

### Technical Indicators
1. **Malware**: BazarLoader variant (87% code similarity to known FIN7 samples)
2. **C2 Infrastructure**: Bulletproof hosting in Moldova (known FIN7 preference)
3. **Domain Patterns**: Registration via privacy services 30-90 days before use
4. **TTP Alignment**: 8/10 ATT&CK techniques match historical FIN7 operations

### Analytical Indicators
1. **Victimology**: Financial services targeting consistent with FIN7 monetization
2. **Operational Tempo**: Activity during GMT+3 business hours
3. **Campaign Timing**: Aligned with FIN7 seasonal patterns

---

## RECOMMENDED ACTIONS

### Immediate
- [ ] Block all identified IOCs at perimeter
- [ ] Hunt for additional indicators using provided TTPs
- [ ] Notify relevant ISACs (FS-ISAC)

### Short-term
- [ ] Implement enhanced email filtering for macro documents
- [ ] Deploy EDR rules for BazarLoader execution patterns
- [ ] Increase monitoring of financial systems

### Long-term
- [ ] Review anti-phishing controls
- [ ] Conduct tabletop exercise for ransomware scenario
- [ ] Consider threat intelligence sharing arrangements

---

## APPENDICES

### A: Complete IOC List
[Structured IOC export in STIX 2.1 format]

### B: MITRE ATT&CK Navigator Layer
[Link to ATT&CK layer file]

### C: Historical Campaign Comparison
[Timeline of related FIN7 operations]

---

*Prepared by: Vector (Intelligence Director)*
*Primary Analyst: Dossier (Threat Actor Profiler)*
*Contributing: Resolver, Cipher*
*Date: 2026-01-16*
```

---

## Example 3: Campaign Planner - Organization

### Scenario
Pre-acquisition due diligence on a technology company.

### Invocation
```
/bmad:intel-team:workflows:campaign-planner-org
```

### Workflow Steps

**Step 1: Collection Requirements**
```
User Input: "Target: TechCorp Solutions Inc.
Purpose: Acquisition due diligence
Focus areas: Security posture, key personnel, IP assets,
regulatory compliance, hidden liabilities"

Vector establishes collection plan:
├── PHASE 1: Open Source Baseline (Resolver, Echo, Proxy)
├── PHASE 2: Technical Reconnaissance (Probe, Sigil)
├── PHASE 3: Personnel Analysis (Echo, Viper profile only)
├── PHASE 4: Competitive Intelligence (Proxy)
└── PHASE 5: Risk Assessment & Synthesis
```

**Step 2: Corporate Intelligence**
```
Proxy (Corporate Intel) investigates:

Corporate Structure:
├── Parent: TechCorp Holdings LLC (Delaware)
├── Subsidiaries: 3 entities (CA, UK, Germany)
├── Beneficial Owners: 2 identified, 1 unclear (shell company)
│
Regulatory History:
├── SEC: No actions
├── FTC: Clean
├── State AG: 1 consumer complaint (resolved 2024)
│
Litigation Search:
├── Active: 2 cases (employment, contract dispute)
├── Resolved: 5 cases (all settled, NDA)
│
IP Portfolio:
├── Patents: 12 active (software, AI methods)
├── Trademarks: 8 registered
└── Copyrights: Extensive code base registered
```

**Step 3: Technical Reconnaissance**
```
Probe (Technical Researcher) assesses:

External Attack Surface:
├── Domains: 23 registered to TechCorp
├── Subdomains: 156 discovered
├── External IPs: 47 (AWS primary, GCP secondary)
├── Exposed services: 12 (all standard ports)
│
Security Posture Indicators:
├── SSL/TLS: All certificates valid, TLS 1.3
├── Email security: SPF/DKIM/DMARC enforced
├── Web headers: Security headers present
├── Known vulnerabilities: 0 critical (external scan)
│
Technology Stack:
├── Frontend: React (detected via headers)
├── Backend: Node.js, Python (job postings)
├── Database: PostgreSQL, Redis (inferred)
└── Cloud: AWS (primary), GCP (disaster recovery)
```

**Step 4: Personnel Intelligence**
```
Echo (Social Media) + Viper (HUMINT context) analyze:

Leadership Assessment:
├── CEO: 15+ years industry experience, strong network
├── CTO: Technical credibility, published researcher
├── CFO: Previous IPO experience, clean background
│
Key Person Risk:
├── Single points of failure: CTO (IP knowledge)
├── Non-compete status: All executives under agreement
├── Retention risk: 2 VPs posted "open to opportunities"
│
Cultural Indicators:
├── Glassdoor: 3.8/5 (below industry average)
├── Employee sentiment: Mixed (growth pains mentioned)
└── Turnover indicators: Engineering churn elevated
```

**Step 5: Synthesis**
```
Vector produces integrated assessment.
```

### Sample Output: Due Diligence Intelligence Package

```markdown
# CORPORATE INTELLIGENCE ASSESSMENT
## Target: TechCorp Solutions Inc.

### CLASSIFICATION: TLP:AMBER - ACQUISITION DUE DILIGENCE

---

## EXECUTIVE SUMMARY

TechCorp Solutions presents a MODERATE RISK acquisition target. While
technical assets and IP portfolio are valuable, concerns exist around
beneficial ownership transparency, elevated employee turnover, and
two active litigation matters requiring deeper investigation.

---

## RISK MATRIX

| Risk Category | Level | Key Concerns |
|---------------|-------|--------------|
| Corporate Structure | MODERATE | 1 beneficial owner unclear |
| Legal/Regulatory | MODERATE | 2 active litigation matters |
| Cybersecurity | LOW | External posture solid |
| Key Person | MODERATE | CTO single point of failure |
| IP/Technology | LOW | Strong portfolio, properly protected |
| Cultural/Retention | ELEVATED | Engineering turnover above norm |

---

## RECOMMENDED DUE DILIGENCE FOCUS

1. **Beneficial Ownership**: Clarify shell company (Cayman registration)
2. **Litigation Details**: Obtain case files for active matters
3. **Employee Interviews**: Assess CTO commitment, retention plans
4. **Technical Deep Dive**: Audit code base, verify patent ownership
5. **Financial Audit**: Independent verification of reported metrics

---

## COLLECTION SUMMARY

| Source Type | Items Collected | Confidence |
|-------------|----------------|------------|
| Corporate Records | 47 documents | HIGH |
| Technical Recon | 23 data points | MODERATE |
| Social/Personnel | 34 profiles | MODERATE |
| Media/News | 12 articles | HIGH |
| Court Records | 7 filings | HIGH |

---

*Assessment by: Vector (Director), Proxy (Corporate), Probe (Technical)*
*Date: 2026-01-16*
```

---

## Example 4: Operation Mosaic (Full Spectrum)

### Scenario
Comprehensive target package using all 11 intelligence agents.

### Invocation
```
/bmad:intel-team:workflows:operation-mosaic
```

### Workflow Overview

**Phase 1: Collection Tasking**
```
Vector assigns each agent:

Agent          | Collection Focus
---------------|------------------
Resolver       | Domain/Infrastructure mapping
Echo           | Social media footprint
Shadow         | Dark web exposure
Atlas          | Geolocation/physical presence
Probe          | Technical attack surface
Dossier        | Known associations/threats
Viper          | HUMINT approach vectors
Sigil          | Communications patterns
Specter        | Physical security assessment
Proxy          | Corporate/financial intelligence
Vector         | Fusion and synthesis
```

**Phase 2: Parallel Collection**
```
All agents work simultaneously on assigned tasks.
Results consolidated in shared evidence repository.
```

**Phase 3: Multi-Source Fusion**
```
Vector synthesizes:
- Cross-reference findings between agents
- Identify intelligence gaps
- Assess confidence levels
- Produce unified target package
```

### Sample Output Structure

```markdown
# OPERATION MOSAIC: [Target Name]

## CLASSIFICATION: [As appropriate]

### VOLUME 1: EXECUTIVE SUMMARY
- Key findings
- Risk assessment
- Recommended actions

### VOLUME 2: CORPORATE INTELLIGENCE (Proxy)
- Entity structure
- Financial position
- Regulatory status

### VOLUME 3: DIGITAL FOOTPRINT (Resolver, Probe)
- Domain inventory
- Infrastructure mapping
- Attack surface assessment

### VOLUME 4: SOCIAL PRESENCE (Echo)
- Social media analysis
- Influence mapping
- Sentiment assessment

### VOLUME 5: THREAT EXPOSURE (Shadow, Dossier)
- Dark web mentions
- Known threat associations
- Historical incidents

### VOLUME 6: GEOSPATIAL (Atlas)
- Physical locations
- Site assessments
- Travel patterns (if applicable)

### VOLUME 7: COMMUNICATIONS (Sigil)
- Contact methods
- Communication patterns
- Technical capabilities

### VOLUME 8: APPROACH ANALYSIS (Viper, Specter)
- Engagement vectors
- Physical security
- Vulnerability assessment

### VOLUME 9: INTEGRATED ASSESSMENT (Vector)
- Multi-source correlation
- Confidence assessment
- Intelligence gaps

### APPENDICES
- A: Complete IOC/indicator list
- B: Source references
- C: Collection methodology
- D: Classification guide
```

---

## Example 5: Counter-Intelligence Audit

### Scenario
Assess your own organization's exposure and vulnerability to intelligence collection.

### Invocation
```
/bmad:intel-team:workflows:counter-intel-audit
```

### Workflow Steps

**Step 1: External Footprint Assessment**
```
What can an adversary learn about you?

Digital Exposure:
├── Domains leaking information
├── Metadata in public documents
├── Employee social media (OPSEC violations)
├── Job postings revealing tech stack
├── Conference presentations exposing IP
│
Corporate Exposure:
├── Excessive detail in regulatory filings
├── Supplier relationships (supply chain intel)
├── Partnership announcements
└── Patent applications (future product intel)
```

**Step 2: Credential/Data Exposure**
```
Shadow (Dark Web) searches:

Breach Database Results:
├── Corporate email domain: 147 credentials found
├── Credential reuse detected: 23 accounts
├── VIP exposure: CFO personal email in breach
│
Dark Web Monitoring:
├── Company mentions: 3 forum threads
├── Data for sale: None detected
└── Targeting discussion: None detected
```

**Step 3: Physical Security Assessment**
```
Atlas + Specter evaluate:

Facility Exposure:
├── Satellite imagery: High-resolution available
├── Social media geotags: 34 from employees at HQ
├── Delivery records: Shipping addresses public
│
Access Control Indicators:
├── Badge photos on LinkedIn
├── Visitor policies documented online
└── Physical security vendor identified (RFP)
```

**Step 4: Recommendations**
```
Vector provides remediation roadmap.
```

### Sample Output: Counter-Intel Report

```markdown
# COUNTER-INTELLIGENCE AUDIT REPORT

## CLASSIFICATION: INTERNAL ONLY

---

## EXECUTIVE SUMMARY

This assessment reveals MODERATE exposure to adversary intelligence
collection. Primary concerns: 147 breached credentials, excessive
technical detail in job postings, and inadequate social media OPSEC
among employees.

---

## EXPOSURE SUMMARY

| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Credential Exposure | HIGH | 147 in breaches, 23 reused |
| Social Media OPSEC | MODERATE | 34 facility geotags |
| Technical Disclosure | MODERATE | Full stack in job posts |
| Dark Web | LOW | No active targeting |
| Physical Security | LOW | Standard protections |

---

## PRIORITY REMEDIATIONS

### Immediate (This Week)
1. Force password reset for 147 exposed accounts
2. Enable MFA for all VIP accounts
3. Remove geotag permissions from employee devices

### Short-term (30 Days)
4. Revise job posting template (remove tech stack details)
5. Employee OPSEC training
6. Remove metadata from public documents

### Long-term (90 Days)
7. Continuous dark web monitoring
8. Vendor security review
9. Social media policy update

---

*Assessment by: Vector (Director)*
*Contributing: Shadow, Atlas, Specter, Probe*
```

---

## Workflow Combinations

### Incident Response + Attribution
```
1. flash-assessment (immediate triage)
2. attribution-chain (actor identification)
3. threat-constellation (map actor ecosystem)
4. counter-intel-audit (assess own exposure)
```

### Due Diligence Package
```
1. campaign-planner-org (comprehensive research)
2. breach-archaeology (exposure assessment)
3. infrastructure-genealogy (technical history)
```

### Threat Hunting Support
```
1. threat-constellation (understand actor landscape)
2. pattern-of-life (predict actor behavior)
3. tripwire (set up monitoring)
```

---

## Best Practices

1. **Define clear collection requirements** before starting
2. **Document all sources** for auditability
3. **Assess confidence levels** for all conclusions
4. **Protect sources and methods** appropriately
5. **Classify outputs** according to sensitivity
6. **Validate findings** through multiple sources when possible

---

## See Also

- [Cybersec Workflow Examples](CYBERSEC-WORKFLOW-EXAMPLES.md) - For incident response integration
- [Strategy Workflow Examples](STRATEGY-WORKFLOW-EXAMPLES.md) - For strategic decision support
- [Party Mode Examples](PARTY-MODE-EXAMPLES.md) - For `threat-intel-fusion` preset
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
