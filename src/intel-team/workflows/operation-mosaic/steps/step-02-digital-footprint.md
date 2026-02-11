---
name: 'step-02-digital-footprint'
description: 'Domain/IP reconnaissance, infrastructure mapping, technology identification'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-02-digital-footprint.md'
nextStepFile: '{workflow_path}/steps/step-03-social-presence.md'
prevStepFile: '{workflow_path}/steps/step-01-target-definition.md'

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
supporting_agent: technical-researcher
supporting_codename: Probe
---

# Step 2: Digital Footprint (Phase 2a)

## STEP GOAL

Map the complete digital infrastructure footprint including domains, IPs, hosting, DNS configuration, email infrastructure, certificates, and technology stack. This step combines Resolver's domain intelligence with Probe's technical reconnaissance.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Roles

- **Primary: Resolver** (Domain-Intel-Specialist) - Domain/network intelligence
- **Supporting: Probe** (Technical-Researcher) - Technology and security analysis

### Collection Protocol

- Enumerate all associated domains and subdomains
- Map IP infrastructure and hosting relationships
- Analyze DNS configuration and email setup
- Review SSL/TLS certificates
- Identify technology stack and security posture
- Document all findings for correlation

---

## COLLECTION EXECUTION SEQUENCE

### 1. Domain Portfolio Enumeration

Map all associated domains:

```
DOMAIN PORTFOLIO ENUMERATION
============================

Primary Domain(s):
| Domain | Registrar | Created | Expires | Status |
|--------|-----------|---------|---------|--------|
| [domain.com] | [registrar] | [date] | [date] | [active/parked/etc] |

WHOIS Analysis:
| Domain | Registrant | Email | Organization |
|--------|------------|-------|--------------|
| [domain] | [name/privacy] | [email] | [org] |

Related Domains Discovered:
| Domain | Relationship | Evidence |
|--------|--------------|----------|
| [domain 1] | [same registrant/NS/IP] | [how found] |
| [domain 2] | [relationship type] | [evidence] |
| [domain 3] | [relationship type] | [evidence] |

Subdomain Enumeration:
| Subdomain | IP | Purpose | Status |
|-----------|-----|---------|--------|
| www.[domain] | [IP] | [web] | [active] |
| mail.[domain] | [IP] | [email] | [active] |
| api.[domain] | [IP] | [API] | [active] |
| dev.[domain] | [IP] | [development] | [status] |
| [other] | [IP] | [purpose] | [status] |

Historical Domains:
| Domain | Period | Relationship | Current Status |
|--------|--------|--------------|----------------|
| [old domain] | [dates] | [former main/acquired] | [expired/sold] |

□ Domain enumeration complete: [Y/N]
□ Subdomains mapped: [count]
□ Related domains found: [count]
```

### 2. IP Infrastructure Mapping

Map hosting and network infrastructure:

```
IP INFRASTRUCTURE MAPPING
=========================

IP Address Inventory:
| IP Address | Domain(s) | Provider | Location | Type |
|------------|-----------|----------|----------|------|
| [IP 1] | [domains] | [hosting] | [geo] | [shared/dedicated] |
| [IP 2] | [domains] | [provider] | [geo] | [type] |

ASN Analysis:
| ASN | Organization | IP Ranges | Notes |
|-----|--------------|-----------|-------|
| [ASN] | [org] | [ranges] | [findings] |

Hosting Provider Analysis:
| Provider | Services Used | Domains/IPs |
|----------|---------------|-------------|
| [provider 1] | [web/email/DNS] | [list] |
| [provider 2] | [services] | [list] |

CDN/Edge Infrastructure:
| CDN Provider | Domains | Configuration |
|--------------|---------|---------------|
| [CDN] | [domains] | [setup notes] |

Cloud Services Detected:
| Provider | Service | Evidence |
|----------|---------|----------|
| AWS | [services] | [indicators] |
| Azure | [services] | [indicators] |
| GCP | [services] | [indicators] |
| Other | [services] | [indicators] |

□ Infrastructure mapped: [Y/N]
□ Hosting providers identified: [count]
□ Cloud services detected: [list]
```

### 3. DNS Configuration Analysis

Analyze DNS setup:

```
DNS CONFIGURATION ANALYSIS
==========================

Nameserver Configuration:
| Domain | Nameservers | Provider |
|--------|-------------|----------|
| [domain] | [NS records] | [DNS provider] |

DNS Record Analysis:
| Domain | Record Type | Value | Notes |
|--------|-------------|-------|-------|
| [domain] | A | [IP] | [primary web] |
| [domain] | AAAA | [IPv6] | [if present] |
| [domain] | MX | [mail servers] | [priority] |
| [domain] | TXT | [SPF record] | [email auth] |
| [domain] | TXT | [DKIM] | [if present] |
| [domain] | TXT | [DMARC] | [policy] |
| [domain] | CNAME | [aliases] | [services] |

Email Infrastructure:
| Domain | MX Provider | SPF | DKIM | DMARC |
|--------|-------------|-----|------|-------|
| [domain] | [provider] | [Y/N] | [Y/N] | [policy] |

DNS Security:
| Feature | Status | Notes |
|---------|--------|-------|
| DNSSEC | [enabled/disabled] | [details] |
| CAA records | [present/absent] | [allowed CAs] |

□ DNS fully analyzed: [Y/N]
□ Email infrastructure mapped: [Y/N]
□ Security configuration noted: [Y/N]
```

### 4. Certificate Analysis

Review SSL/TLS certificates:

```
CERTIFICATE ANALYSIS
====================

Active Certificates:
| Domain | Issuer | Valid From | Valid To | SANs |
|--------|--------|------------|----------|------|
| [domain] | [CA] | [date] | [date] | [alt names] |

Certificate Transparency Search:
| Domain | Certificates Found | Date Range | Notable SANs |
|--------|-------------------|------------|--------------|
| [domain] | [count] | [range] | [interesting subdomains] |

Historical Certificates:
| Domain | Period | Issuer | SANs Discovered |
|--------|--------|--------|-----------------|
| [domain] | [dates] | [CA] | [historical subdomains] |

Certificate Security:
| Domain | Key Size | Protocol | Grade |
|--------|----------|----------|-------|
| [domain] | [bits] | [TLS version] | [A-F] |

Wildcard Certificates:
| Wildcard | Issuer | Implications |
|----------|--------|--------------|
| *.[domain] | [CA] | [infrastructure scale] |

□ Certificates analyzed: [count]
□ Hidden subdomains found: [count]
□ Security posture assessed: [Y/N]
```

### 5. Technology Stack Identification (Probe)

Identify technologies in use:

```
TECHNOLOGY STACK IDENTIFICATION
===============================

Web Technologies:
| Domain | Server | Framework | CMS | Language |
|--------|--------|-----------|-----|----------|
| [domain] | [nginx/apache/etc] | [React/Vue/etc] | [WordPress/etc] | [PHP/JS/etc] |

Technology Detection Results:
| Category | Technology | Version | Confidence |
|----------|------------|---------|------------|
| Web Server | [server] | [version] | [H/M/L] |
| Frontend | [framework] | [version] | [H/M/L] |
| Backend | [language] | [version] | [H/M/L] |
| CMS | [CMS] | [version] | [H/M/L] |
| Analytics | [service] | - | [H/M/L] |
| CDN | [provider] | - | [H/M/L] |
| Security | [WAF/etc] | - | [H/M/L] |

Third-Party Services:
| Service Type | Provider | Purpose |
|--------------|----------|---------|
| Analytics | [Google Analytics/etc] | [tracking] |
| Marketing | [service] | [purpose] |
| Chat | [service] | [support] |
| Payment | [processor] | [commerce] |

Code Repositories:
| Platform | URL/Identifier | Public | Content |
|----------|----------------|--------|---------|
| GitHub | [org/user] | [Y/N] | [repos found] |
| GitLab | [identifier] | [Y/N] | [content] |
| Bitbucket | [identifier] | [Y/N] | [content] |

□ Technology stack mapped: [Y/N]
□ Third-party services identified: [count]
□ Code repositories found: [count]
```

### 6. Security Posture Indicators (Probe)

Assess external security posture:

```
SECURITY POSTURE INDICATORS
===========================

External Security Assessment:
| Check | Result | Risk Level |
|-------|--------|------------|
| SSL/TLS Configuration | [grade] | [H/M/L] |
| Security Headers | [present/missing] | [H/M/L] |
| Open Ports (common) | [list] | [H/M/L] |
| WAF Detection | [Y/N] | [info] |
| Cookie Security | [flags] | [H/M/L] |

Security Headers Present:
| Header | Value | Assessment |
|--------|-------|------------|
| Strict-Transport-Security | [value] | [good/weak/missing] |
| Content-Security-Policy | [value] | [good/weak/missing] |
| X-Frame-Options | [value] | [good/weak/missing] |
| X-Content-Type-Options | [value] | [good/weak/missing] |

Common Port Scan Results:
| Port | Service | Status | Notes |
|------|---------|--------|-------|
| 80 | HTTP | [open/closed] | - |
| 443 | HTTPS | [open/closed] | - |
| 22 | SSH | [open/closed] | [if open: risk] |
| 21 | FTP | [open/closed] | [if open: risk] |
| 3389 | RDP | [open/closed] | [if open: risk] |

Vulnerability Indicators:
| Indicator | Found | Details |
|-----------|-------|---------|
| Outdated software | [Y/N] | [versions] |
| Default credentials | [Y/N] | [evidence] |
| Information leakage | [Y/N] | [type] |
| Misconfigurations | [Y/N] | [details] |

□ Security posture assessed: [Y/N]
□ Risk indicators documented: [count]
```

### 7. Digital Footprint Summary

Compile infrastructure findings:

```
DIGITAL FOOTPRINT SUMMARY
=========================

Infrastructure Overview:
| Metric | Count | Details |
|--------|-------|---------|
| Domains | [count] | [primary + related] |
| Subdomains | [count] | [enumerated] |
| IP Addresses | [count] | [unique IPs] |
| Hosting Providers | [count] | [providers] |
| Certificates | [count] | [active] |

Key Infrastructure Findings:
1. [Most significant infrastructure finding]
2. [Second finding]
3. [Third finding]

Security Observations:
1. [Most significant security observation]
2. [Second observation]
3. [Third observation]

Technology Summary:
- Primary stack: [summary]
- Third-party dependencies: [count]
- Code exposure: [summary]

Handoffs for Other Agents:
| Agent | Data Provided |
|-------|---------------|
| Echo | [usernames from repos, contact pages] |
| Shadow | [domains/emails for breach search] |
| Proxy | [corporate info from WHOIS] |
| Atlas | [IP geolocations, office addresses] |
| Dossier | [infrastructure for threat correlation] |
```

---

## STEP 2 OUTPUT

```markdown
## DIGITAL FOOTPRINT SUMMARY

### Infrastructure Inventory
- Primary domains: [list]
- Subdomains discovered: [count]
- IP addresses: [count]
- Hosting providers: [list]

### Technology Stack
- Web: [technologies]
- Backend: [technologies]
- Cloud: [providers]
- Third-party: [key services]

### Security Posture
- SSL/TLS: [grade]
- Headers: [assessment]
- Notable risks: [if any]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Correlation Points for Other Steps
- Emails for breach search: [list]
- Personnel for social search: [names]
- Corporate entities for Proxy: [list]
- Locations for Atlas: [addresses]
```

---

## COMPLETION CRITERIA

Before proceeding:

- [ ] Domain portfolio enumerated
- [ ] IP infrastructure mapped
- [ ] DNS configuration analyzed
- [ ] Certificates reviewed
- [ ] Technology stack identified
- [ ] Security posture assessed
- [ ] Handoff data prepared for other agents

---

## PARALLEL EXECUTION NOTE

This step (2) can run in parallel with Steps 3-6. Coordinate findings as they become available.

---

## MENU OPTIONS

**[C] Continue** - Proceed to social presence (Step 3)
**[D] Deep Dive** - Extended infrastructure analysis
**[S] Security** - Detailed security assessment
**[T] Technology** - Extended tech stack analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-social-presence.md`
