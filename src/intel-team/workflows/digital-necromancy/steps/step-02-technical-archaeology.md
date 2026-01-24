---
name: 'step-02-technical-archaeology'
description: 'Wayback Machine analysis, DNS history, certificate transparency, code repository history'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/digital-necromancy'
thisStepFile: '{workflow_path}/steps/step-02-technical-archaeology.md'
nextStepFile: '{workflow_path}/steps/step-03-social-resurrection.md'
prevStepFile: '{workflow_path}/steps/step-01-deep-historical.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Step 2: Technical Archaeology

## STEP GOAL

Excavate technical infrastructure history through web archives, DNS records, certificate transparency logs, and code repository history to reconstruct the target's deleted or expired technical footprint.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in TECHINT and infrastructure forensics
- You recover historical technical artifacts through archival sources
- You reconstruct infrastructure timelines from fragmented records

### Analysis Protocol
- Deep dive into Wayback Machine for all known domains
- Trace DNS history and ownership changes
- Mine certificate transparency logs for domain history
- Excavate code repository commit history
- Recover cached API responses and technical documentation
- Build comprehensive infrastructure timeline

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Wayback Machine Deep Analysis

Analyze web archive captures:

```
WAYBACK MACHINE ANALYSIS
========================

Domain Inventory from Step 1:
| Domain | Status | First Seen | Last Seen | Priority |
|--------|--------|------------|-----------|----------|
| [domain 1] | [expired/active/parked] | [date] | [date] | [P1/P2/P3] |
| [domain 2] | [status] | [date] | [date] | [priority] |

Wayback Machine Results:
| Domain | Total Captures | Date Range | Key Captures |
|--------|----------------|------------|--------------|
| [domain] | [count] | [first - last] | [significant dates] |

Homepage Evolution:
| Date | Domain | Content Summary | Technology |
|------|--------|-----------------|------------|
| [date] | [domain] | [what the site showed] | [detected tech] |
| [date] | [domain] | [evolution] | [tech changes] |

Contact Information Recovery:
| Date | Page | Email | Phone | Address |
|------|------|-------|-------|---------|
| [date] | [url] | [email if found] | [phone] | [address] |

Personnel/Staff Pages:
| Date | Domain | Names Found | Roles | Notes |
|------|--------|-------------|-------|-------|
| [date] | [domain] | [names] | [titles] | [context] |

Login/Portal Pages:
| Date | URL | Portal Type | Technology | Notes |
|------|-----|-------------|------------|-------|
| [date] | [url] | [admin/customer/etc] | [CMS/framework] | [findings] |

Recovered Assets:
| Date | Asset Type | URL/Path | Content |
|------|------------|----------|---------|
| [date] | [image/doc/js] | [path] | [description] |

□ Wayback findings:
  - [ ] Multiple design iterations captured
  - [ ] Contact information recovered
  - [ ] Personnel names found
  - [ ] Technology stack evolution tracked
  - [ ] Hidden pages/directories found
  - [ ] Removed content recovered

WAYBACK RECOVERY SCORE: [0-100]
```

### 2. DNS History Reconstruction

Trace domain ownership and infrastructure:

```
DNS HISTORY RECONSTRUCTION
==========================

Historical DNS Records:
| Domain | Date | Record Type | Value | Notes |
|--------|------|-------------|-------|-------|
| [domain] | [date] | A | [IP] | [hosting] |
| [domain] | [date] | MX | [mail server] | [provider] |
| [domain] | [date] | NS | [nameservers] | [registrar] |
| [domain] | [date] | TXT | [SPF/DKIM/etc] | [findings] |

IP Address History:
| Domain | IP | Date Range | Hosting Provider | Location |
|--------|-----|------------|------------------|----------|
| [domain] | [IP] | [dates] | [provider] | [geo] |

Nameserver Evolution:
| Domain | Date | Nameservers | Registrar Indicated |
|--------|------|-------------|---------------------|
| [domain] | [date] | [NS records] | [registrar] |

WHOIS History:
| Domain | Date | Registrant | Email | Notes |
|--------|------|------------|-------|-------|
| [domain] | [date] | [name/org] | [email] | [privacy/change] |

Related Domains Discovered:
| Domain | Relationship | Evidence |
|--------|--------------|----------|
| [domain] | [same IP/NS/registrant] | [how discovered] |

□ DNS archaeology findings:
  - [ ] Domain ownership changes tracked
  - [ ] Historical hosting providers identified
  - [ ] Related infrastructure discovered
  - [ ] Email infrastructure mapped
  - [ ] Nameserver patterns identified

DNS RECOVERY SCORE: [0-100]
```

### 3. Certificate Transparency Mining

Search certificate logs:

```
CERTIFICATE TRANSPARENCY MINING
===============================

Sources Searched:
| Source | Coverage | Results |
|--------|----------|---------|
| crt.sh | [date range] | [count] |
| Censys | [date range] | [count] |
| Facebook CT | [date range] | [count] |
| Google CT | [date range] | [count] |

Certificates Found:
| Domain | Issue Date | Expiry | Issuer | SAN Entries |
|--------|------------|--------|--------|-------------|
| [domain] | [date] | [date] | [CA] | [alt names] |

Subdomain Discovery:
| Parent Domain | Subdomain | First Seen | Purpose |
|---------------|-----------|------------|---------|
| [domain] | [sub.domain] | [date] | [inferred] |
| [domain] | [sub.domain] | [date] | [purpose] |

Historical Subdomains (Now Deleted):
| Subdomain | Active Period | Last Certificate | Purpose |
|-----------|---------------|------------------|---------|
| [subdomain] | [dates] | [date] | [what it was] |

Wildcard Certificate Analysis:
| Domain | Wildcard Cert | Dates | Notes |
|--------|---------------|-------|-------|
| [domain] | [*.domain] | [dates] | [infrastructure scale] |

Certificate Authority Patterns:
| CA | Domains | Date Range | Notes |
|----|---------|------------|-------|
| [CA] | [count] | [dates] | [preference changes] |

□ Certificate archaeology findings:
  - [ ] Hidden subdomains discovered
  - [ ] Infrastructure scale estimated
  - [ ] Service patterns identified
  - [ ] Deleted services found
  - [ ] Timeline gaps filled

CERTIFICATE RECOVERY SCORE: [0-100]
```

### 4. Code Repository Archaeology

Search code hosting history:

```
CODE REPOSITORY ARCHAEOLOGY
===========================

GitHub Search:
| Query Type | Query | Results |
|------------|-------|---------|
| Username | [username] | [repos/gists found] |
| Email | [email] | [commits found] |
| Organization | [org] | [repos found] |
| Domain | [domain] | [references] |

Recovered Repositories:
| Platform | Repo Name | Owner | Status | Content |
|----------|-----------|-------|--------|---------|
| GitHub | [repo] | [user/org] | [active/deleted/archived] | [description] |
| GitLab | [repo] | [user/org] | [status] | [description] |
| Bitbucket | [repo] | [user/org] | [status] | [description] |

Deleted Repository Recovery:
| Platform | Repo | Archive Source | Date | Content |
|----------|------|----------------|------|---------|
| [platform] | [repo] | [archive.org/fork/etc] | [date] | [what was recovered] |

Commit History Analysis:
| Repo | Author | Email | Commits | Date Range |
|------|--------|-------|---------|------------|
| [repo] | [name] | [email] | [count] | [dates] |

Sensitive Data in Commits:
| Repo | Commit | File | Data Type | Status |
|------|--------|------|-----------|--------|
| [repo] | [hash] | [file] | [API key/cred/etc] | [current validity] |

Fork Network:
| Original Repo | Forks | Notable Forks | Preservation |
|---------------|-------|---------------|--------------|
| [repo] | [count] | [which preserve history] | [what's preserved] |

Gist/Snippet Recovery:
| Platform | ID | Author | Content | Date |
|----------|-----|--------|---------|------|
| GitHub Gist | [id] | [user] | [description] | [date] |

□ Code archaeology findings:
  - [ ] Deleted repositories recovered via forks
  - [ ] Author identities correlated
  - [ ] Sensitive data found in commits
  - [ ] Development timeline established
  - [ ] Collaboration network mapped

CODE RECOVERY SCORE: [0-100]
```

### 5. Cached API & Documentation Recovery

Search for cached technical content:

```
CACHED API & DOCUMENTATION RECOVERY
===================================

API Documentation Archives:
| Service | Documentation URL | Archive Date | Content |
|---------|-------------------|--------------|---------|
| [service] | [url] | [date] | [API specs recovered] |

Swagger/OpenAPI Files:
| Source | File URL | Date | Endpoints Documented |
|--------|----------|------|---------------------|
| [source] | [url] | [date] | [count/summary] |

Developer Portal Archives:
| Portal | Archive URL | Date | Content |
|--------|-------------|------|---------|
| [portal] | [archive url] | [date] | [documentation] |

README/Wiki Recovery:
| Repo/Site | Document | Date | Key Information |
|-----------|----------|------|-----------------|
| [source] | [README] | [date] | [summary] |

Technical Blog Archives:
| Blog | Date Range | Posts Recovered | Topics |
|------|------------|-----------------|--------|
| [blog url] | [dates] | [count] | [technical topics] |

Integration Documentation:
| Partner | Documentation | Date | API Details |
|---------|---------------|------|-------------|
| [partner] | [doc url] | [date] | [integration info] |

□ Documentation recovery findings:
  - [ ] API endpoints documented
  - [ ] Integration partners identified
  - [ ] Technical capabilities mapped
  - [ ] Development practices revealed
  - [ ] Infrastructure details exposed

DOCUMENTATION RECOVERY SCORE: [0-100]
```

### 6. Infrastructure Timeline Assembly

Build the technical history:

```
INFRASTRUCTURE TIMELINE ASSEMBLY
================================

Chronological Technical Events:
| Date | Event Type | Details | Evidence |
|------|------------|---------|----------|
| [earliest] | [domain reg/cert/etc] | [details] | [source] |
| [date] | [hosting change] | [details] | [DNS history] |
| [date] | [tech stack change] | [details] | [wayback] |
| [date] | [expansion/subdomain] | [details] | [cert logs] |
| [date] | [code published] | [details] | [repo] |
| [date] | [content removed] | [details] | [gap analysis] |
| [latest] | [current state] | [details] | [source] |

Technology Stack Evolution:
| Period | Frontend | Backend | Infrastructure | Evidence |
|--------|----------|---------|----------------|----------|
| [dates] | [tech] | [tech] | [hosting/CDN] | [source] |
| [dates] | [evolution] | [evolution] | [changes] | [source] |

Scale Indicators Over Time:
| Period | Subdomains | Certificates | Repos | Infrastructure |
|--------|------------|--------------|-------|----------------|
| [dates] | [count] | [count] | [count] | [complexity] |

Unexplained Gaps:
| Period | Missing Data | Possible Explanations |
|--------|--------------|----------------------|
| [dates] | [what's not archived] | [hypotheses] |
```

### 7. Technical Archaeology Summary

Compile technical findings:

```
TECHNICAL ARCHAEOLOGY SUMMARY
=============================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Wayback Machine | [score] | 30% | [weighted] |
| DNS History | [score] | 25% | [weighted] |
| Certificate Logs | [score] | 20% | [weighted] |
| Code Repositories | [score] | 15% | [weighted] |
| Documentation | [score] | 10% | [weighted] |
| **TOTAL TECHNICAL** | - | - | **[total]** |

Key Technical Recoveries:
1. [Most significant technical finding]
2. [Second most significant]
3. [Third most significant]

Infrastructure Map:
□ Domains recovered: [count]
□ Subdomains discovered: [count]
□ IP addresses tracked: [count]
□ Certificates found: [count]
□ Repositories recovered: [count]

Identity Correlation Points:
| Type | Value | Connected To |
|------|-------|--------------|
| Email | [email] | [commits/whois] |
| Name | [name] | [commits/docs] |
| Username | [user] | [repos/wayback] |

Handoff to Echo (Step 3):
- Social profiles to resurrect: [from wayback/commits]
- Usernames to trace: [from code/docs]
- Time periods to focus on: [from timeline gaps]
- Contact information found: [emails/handles]
```

---

## STEP 2 OUTPUT

```markdown
## TECHNICAL ARCHAEOLOGY SUMMARY

### Recovery Overview
- Wayback captures analyzed: [count]
- DNS historical records: [count]
- Certificates found: [count]
- Repositories recovered: [count]
- Documentation archived: [count]

### Technical Scores
| Category | Score |
|----------|-------|
| Wayback Machine | [X/100] |
| DNS History | [X/100] |
| Certificate Logs | [X/100] |
| Code Repositories | [X/100] |
| Documentation | [X/100] |
| **TECHNICAL TOTAL** | **[X/100]** |

### Infrastructure Timeline
| Period | Infrastructure State | Evidence |
|--------|---------------------|----------|
| [dates] | [state] | [source] |

### Key Discoveries
- Domains traced: [list]
- Hidden subdomains: [count]
- Personnel identified: [names from commits/docs]
- Technology evolution: [summary]

### Social Media Targets
- Profiles to resurrect: [list for Step 3]
- Usernames discovered: [list for Step 3]
- Contact info: [emails/handles for Step 3]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Wayback Machine fully analyzed
- [ ] DNS history reconstructed
- [ ] Certificate logs mined
- [ ] Code repositories excavated
- [ ] Documentation recovered
- [ ] Infrastructure timeline assembled
- [ ] Technical score calculated
- [ ] Social media targets identified for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to social media resurrection (Step 3)
**[W] Wayback** - Deeper web archive analysis
**[D] DNS** - Extended DNS archaeology
**[G] Git** - Additional code repository search

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-03-social-resurrection.md`
