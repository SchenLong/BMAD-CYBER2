---
name: 'step-02-technical-evolution'
description: 'IP history, hosting provider migrations, technology stack changes, certificate history'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/infrastructure-genealogy'
thisStepFile: '{workflow_path}/steps/step-02-technical-evolution.md'
nextStepFile: '{workflow_path}/steps/step-03-corporate-ownership.md'
prevStepFile: '{workflow_path}/steps/step-01-ownership-archaeology.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Step 2: Technical Evolution

## STEP GOAL

Trace the technical evolution of the infrastructure including IP address history, hosting provider migrations, technology stack changes over time, certificate history, and service evolution.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in technical infrastructure forensics
- You trace hosting and service evolution over time
- You identify technical patterns and relationships

### Analysis Protocol
- Map complete IP address history
- Track hosting provider migrations
- Document technology stack evolution
- Analyze certificate history and relationships
- Identify service changes over time
- Correlate technical changes with ownership events

---

## ANALYSIS EXECUTION SEQUENCE

### 1. IP Address History

Trace IP resolution history:

```
IP ADDRESS HISTORY
==================

Historical IP Resolutions:
| Date Range | IP Address | Provider | Location | Duration |
|------------|------------|----------|----------|----------|
| [earliest-date] | [IP] | [hosting provider] | [geo] | [days] |
| [date-date] | [IP change] | [provider] | [geo] | [days] |
| [date-date] | [IP] | [provider] | [geo] | [days] |
| [date-current] | [current IP] | [provider] | [geo] | [ongoing] |

IP Stability Analysis:
| Metric | Value | Assessment |
|--------|-------|------------|
| Total unique IPs | [count] | [stable/volatile] |
| Average IP tenure | [days] | [assessment] |
| Longest tenure | [days] | [which IP] |
| Shortest tenure | [days] | [which IP] |

IP Relationship Analysis:
| IP Address | Other Domains | Same Owner? | Period |
|------------|---------------|-------------|--------|
| [IP] | [domains on same IP] | [assessment] | [when] |

IP Geographic Migration:
| Period | Country | City | Provider Type |
|--------|---------|------|---------------|
| [dates] | [country] | [city] | [shared/dedicated/VPS/etc] |

Suspicious IP Patterns:
| Pattern | Evidence | Significance |
|---------|----------|--------------|
| Rapid IP changes | [details] | [evasion?] |
| Known bad IP ranges | [which] | [threat indicator] |
| Bulletproof hosting | [indicators] | [assessment] |

□ IP history mapped: [count records]
□ Hosting migrations: [count]
□ Current IP: [IP]
□ Current hosting: [provider]
```

### 2. Hosting Provider History

Track hosting migrations:

```
HOSTING PROVIDER HISTORY
========================

Provider Timeline:
| Period | Provider | Type | Location | Evidence |
|--------|----------|------|----------|----------|
| [dates] | [provider 1] | [shared/VPS/dedicated] | [DC location] | [how determined] |
| [dates] | [provider 2] | [type] | [location] | [evidence] |

Provider Details:
| Provider | ASN | Reputation | Typical Customers |
|----------|-----|------------|-------------------|
| [provider] | [AS#] | [legitimate/mixed/suspicious] | [business type] |

Migration Pattern Analysis:
| Migration | Date | From | To | Likely Reason |
|-----------|------|------|-----|---------------|
| [#1] | [date] | [provider A] | [provider B] | [hypothesis] |
| [#2] | [date] | [provider B] | [provider C] | [hypothesis] |

Provider Correlation:
| Provider | Other Target Domains | Significance |
|----------|---------------------|--------------|
| [provider] | [related domains from Step 1] | [common infra?] |

Bulletproof Hosting Indicators:
| Provider | Indicator | Evidence |
|----------|-----------|----------|
| [provider] | [known BPH/abuse tolerant] | [reports, history] |

Hosting Type Evolution:
| Period | Type | Sophistication | Notes |
|--------|------|----------------|-------|
| [early] | [shared] | [basic] | [starting out] |
| [later] | [VPS/dedicated] | [intermediate] | [scaling up] |
| [current] | [type] | [level] | [current state] |

□ Providers identified: [count]
□ Migrations documented: [count]
□ Suspicious hosting: [Y/N]
```

### 3. Technology Stack Evolution

Track technology changes:

```
TECHNOLOGY STACK EVOLUTION
==========================

Web Server History:
| Period | Server | Version | Evidence |
|--------|--------|---------|----------|
| [dates] | [Apache/Nginx/IIS] | [version] | [headers/Wayback] |
| [dates] | [changed to] | [version] | [evidence] |

Backend Technology History:
| Period | Language/Framework | Evidence |
|--------|-------------------|----------|
| [dates] | [PHP/ASP/Node/etc] | [how detected] |
| [dates] | [changed to] | [evidence] |

CMS History:
| Period | CMS | Version | Evidence |
|--------|-----|---------|----------|
| [dates] | [WordPress/Drupal/etc] | [version] | [Wayback/fingerprint] |

Frontend Evolution:
| Period | Technology | Evidence |
|--------|------------|----------|
| [dates] | [jQuery/React/etc] | [source/Wayback] |

Security Evolution:
| Period | SSL/TLS | HSTS | Other Security |
|--------|---------|------|----------------|
| [dates] | [provider/version] | [Y/N] | [headers] |

Third-Party Service History:
| Period | Service Type | Provider | Evidence |
|--------|--------------|----------|----------|
| [dates] | Analytics | [GA/etc] | [scripts] |
| [dates] | CDN | [Cloudflare/etc] | [headers] |
| [dates] | Email | [provider] | [MX records] |

Technology Stack Correlation:
| Stack Element | Similar On | Significance |
|---------------|------------|--------------|
| [unique config] | [other domains] | [same operator?] |

□ Tech stack documented: [completeness]
□ Major changes: [count]
□ Distinctive patterns: [identified?]
```

### 4. Certificate History

Analyze SSL/TLS certificate evolution:

```
CERTIFICATE HISTORY
===================

Certificate Timeline:
| Issue Date | Expiry | Issuer | Type | SANs |
|------------|--------|--------|------|------|
| [date] | [date] | [CA] | [DV/OV/EV] | [alt names] |
| [date] | [date] | [CA change] | [type] | [SANs] |

Certificate Authority Evolution:
| Period | CA | Type | Cost Tier |
|--------|-----|------|-----------|
| [dates] | [Let's Encrypt/Comodo/etc] | [DV/OV/EV] | [free/paid/enterprise] |

SAN (Subject Alternative Name) Analysis:
| Certificate | SANs | Related Domains Found |
|-------------|------|----------------------|
| [cert date] | [list] | [domains not previously known] |

Certificate Fingerprint Tracking:
| Period | Fingerprint | Also Used By |
|--------|-------------|--------------|
| [dates] | [hash] | [other domains] |

Wildcard Certificate Usage:
| Period | Wildcard | Scope | Implications |
|--------|----------|-------|--------------|
| [dates] | *.[domain] | [infrastructure scale] | [assessment] |

Organization Validation Details (if OV/EV):
| Field | Value | Verification |
|-------|-------|--------------|
| O (Organization) | [org name] | [matches WHOIS?] |
| L (Locality) | [city] | [consistent?] |
| C (Country) | [country] | [consistent?] |

Certificate Transparency Search:
| Domain | Total Certs | Date Range | Notable Findings |
|--------|-------------|------------|------------------|
| [domain] | [count] | [first-last] | [unusual patterns] |

□ Certificates tracked: [count]
□ CAs used: [count]
□ Subdomains discovered via CT: [count]
```

### 5. Service Evolution

Track services and functionality:

```
SERVICE EVOLUTION
=================

Wayback Machine Analysis:
| Date | Site Type | Content | Technology |
|------|-----------|---------|------------|
| [earliest capture] | [what site was] | [description] | [tech indicators] |
| [date] | [changed to] | [description] | [tech] |
| [date] | [redesign] | [description] | [tech] |
| [recent] | [current] | [description] | [tech] |

Site Purpose Evolution:
| Period | Purpose | Evidence | Legitimacy |
|--------|---------|----------|------------|
| [dates] | [business/personal/parking/malicious] | [content] | [assessment] |

Content Theme Changes:
| Period | Theme/Industry | Language | Target Audience |
|--------|----------------|----------|-----------------|
| [dates] | [theme] | [language] | [audience] |

Service Type Changes:
| Period | Services Offered | Evidence |
|--------|------------------|----------|
| [dates] | [e-commerce/blog/etc] | [Wayback/records] |

Port/Service History (if available):
| Period | Open Ports | Services | Source |
|--------|------------|----------|--------|
| [dates] | [ports] | [HTTP/SSH/etc] | [Shodan history] |

Major Redesigns/Changes:
| Date | Change Type | Before | After |
|------|-------------|--------|-------|
| [date] | [redesign/rebrand/pivot] | [state] | [new state] |

□ Site history captured: [date range]
□ Purpose changes: [count]
□ Major pivots: [count]
```

### 6. Technical Evolution Summary

Compile technical findings:

```
TECHNICAL EVOLUTION SUMMARY
===========================

Infrastructure Timeline:
| Date | Event | Category | Details |
|------|-------|----------|---------|
| [earliest] | [creation/first seen] | [ownership] | [details] |
| [date] | [hosting change] | [technical] | [from-to] |
| [date] | [tech stack change] | [technical] | [details] |
| [date] | [cert change] | [technical] | [details] |
| [date] | [ownership change] | [ownership] | [from Step 1] |
| [current] | [current state] | - | [summary] |

Key Technical Findings:
1. [Most significant technical finding]
2. [Second finding]
3. [Third finding]

Technical Patterns:
| Pattern | Description | Significance |
|---------|-------------|--------------|
| [pattern] | [what observed] | [what it suggests] |

Correlation with Ownership (from Step 1):
| Technical Event | Ownership Event | Correlation |
|-----------------|-----------------|-------------|
| [tech change] | [ownership change] | [related?] |

Technical Risk Indicators:
| Indicator | Present | Details |
|-----------|---------|---------|
| Bulletproof hosting | [Y/N] | [evidence] |
| Rapid changes | [Y/N] | [pattern] |
| Known bad infrastructure | [Y/N] | [specifics] |

Handoff to Proxy (Step 3):
- Corporate entities to investigate: [from WHOIS orgs]
- Officer names found: [if any in certs]
- Business relationship indicators: [patterns]
```

---

## STEP 2 OUTPUT

```markdown
## TECHNICAL EVOLUTION SUMMARY

### IP History
- Total unique IPs: [count]
- Current IP: [IP] at [provider]
- Geographic movement: [countries]

### Hosting Evolution
| Period | Provider | Type |
|--------|----------|------|
| [dates] | [provider] | [type] |

### Technology Stack
- Current: [stack summary]
- Major changes: [count]
- Distinctive patterns: [summary]

### Certificate History
- Total certificates: [count]
- Current CA: [CA]
- Subdomains via CT: [count]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Corporate Investigation Targets
- Organizations: [for Step 3]
- Key dates: [ownership changes]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] IP history mapped
- [ ] Hosting migrations documented
- [ ] Technology evolution tracked
- [ ] Certificate history analyzed
- [ ] Service evolution documented
- [ ] Technical timeline built
- [ ] Handoff data prepared for Proxy

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate ownership (Step 3)
**[I] IP** - Deeper IP investigation
**[H] Hosting** - Extended hosting analysis
**[C] Certificate** - Additional certificate research

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-03-corporate-ownership.md`
