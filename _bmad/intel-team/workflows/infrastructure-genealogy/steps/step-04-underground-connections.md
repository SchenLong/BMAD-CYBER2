---
name: 'step-04-underground-connections'
description: 'Malware C2 history, phishing campaign usage, forum mentions, bulletproof hosting indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/infrastructure-genealogy'
thisStepFile: '{workflow_path}/steps/step-04-underground-connections.md'
nextStepFile: '{workflow_path}/steps/step-05-threat-timeline.md'
prevStepFile: '{workflow_path}/steps/step-03-corporate-ownership.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 4: Underground Connections

## STEP GOAL

Investigate the infrastructure's connections to underground activity including malware C2 history, phishing campaign usage, criminal forum mentions, bulletproof hosting indicators, and other malicious activity associations.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You identify infrastructure abuse and criminal connections
- You assess threat actor associations

### Analysis Protocol
- Search threat intelligence for malware associations
- Check phishing/abuse databases
- Search underground forums for mentions
- Assess hosting provider reputation
- Identify bulletproof hosting indicators
- Document all malicious activity associations

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Malware C2 History

Check for command and control usage:

```
MALWARE C2 HISTORY
==================

Threat Intelligence Database Results:
| Source | Domain/IP | Malware Family | Date | Confidence |
|--------|-----------|----------------|------|------------|
| [source 1] | [indicator] | [malware name] | [date] | [H/M/L] |
| [source 2] | [indicator] | [family] | [date] | [confidence] |

C2 Infrastructure Analysis:
| Period | Malware | C2 Type | Campaign | Actor Attribution |
|--------|---------|---------|----------|-------------------|
| [dates] | [family] | [HTTP/DNS/etc] | [campaign name] | [actor if known] |

Historical Malware Associations:
| Date | Indicator | Malware | Detection Source | Still Active |
|------|-----------|---------|------------------|--------------|
| [date] | [domain/IP] | [malware] | [vendor] | [Y/N] |

Related Infrastructure (same campaign):
| Our Indicator | Related | Relationship | Evidence |
|---------------|---------|--------------|----------|
| [domain/IP] | [related domain/IP] | [same C2/staging/etc] | [how linked] |

Malware Sample Connections:
| Sample Hash | Communication | Date | Campaign |
|-------------|---------------|------|----------|
| [hash] | [to our infra] | [date] | [campaign] |

IOC Feed Presence:
| Feed | Listed | Category | Date Added | Date Removed |
|------|--------|----------|------------|--------------|
| [feed] | [Y/N] | [malware/C2/etc] | [date] | [date or N/A] |

□ C2 associations found: [count]
□ Malware families: [count]
□ Active threats: [Y/N]
```

### 2. Phishing Campaign History

Check phishing and abuse history:

```
PHISHING CAMPAIGN HISTORY
=========================

Phishing Database Results:
| Source | URL/Domain | Target | Date | Status |
|--------|------------|--------|------|--------|
| [OpenPhish/PhishTank/etc] | [URL] | [brand targeted] | [date] | [active/resolved] |

Brand Impersonation History:
| Period | Brands Targeted | Methods | Scale |
|--------|-----------------|---------|-------|
| [dates] | [brand list] | [techniques] | [URL count] |

Phishing Kit Analysis:
| Period | Kit Type | Characteristics | Actor Profile |
|--------|----------|-----------------|---------------|
| [dates] | [kit name/type] | [features] | [sophistication] |

Takedown History:
| Date | Reporter | Reason | Response Time | Outcome |
|------|----------|--------|---------------|---------|
| [date] | [who reported] | [phishing/malware] | [hours/days] | [taken down/ignored] |

Related Phishing Infrastructure:
| Our Domain | Related | Connection | Period |
|------------|---------|------------|--------|
| [domain] | [related phish] | [same registrant/IP] | [dates] |

Abuse Report History:
| Date | Source | Complaint Type | Resolution |
|------|--------|----------------|------------|
| [date] | [reporter] | [phishing/spam/etc] | [action taken] |

□ Phishing associations: [count]
□ Brands targeted: [count]
□ Active phishing: [Y/N]
```

### 3. Forum Mentions

Search underground forums:

```
FORUM MENTIONS
==============

Forum Search Results:
| Forum | Date | Context | Poster | Thread |
|-------|------|---------|--------|--------|
| [forum] | [date] | [how mentioned] | [username] | [topic] |

Context Categories:
| Context Type | Count | Examples |
|--------------|-------|----------|
| For sale (infrastructure) | [count] | [details] |
| Recommended provider | [count] | [details] |
| Complaint/warning | [count] | [details] |
| Used in tutorial | [count] | [details] |
| Other | [count] | [details] |

Reputation Discussions:
| Forum | Thread | Date | Sentiment | Details |
|-------|--------|------|-----------|---------|
| [forum] | [topic] | [date] | [positive/negative] | [summary] |

Personnel Mentions:
| Forum | Name/Handle | Context | Date |
|-------|-------------|---------|------|
| [forum] | [name from Step 3] | [how mentioned] | [date] |

Entity Mentions:
| Forum | Entity | Context | Date |
|-------|--------|---------|------|
| [forum] | [company name] | [how mentioned] | [date] |

Actor Associations:
| Forum | Actor/Group | Association Type | Evidence |
|-------|-------------|------------------|----------|
| [forum] | [actor handle] | [seller/user/reviewer] | [posts] |

□ Forum mentions found: [count]
□ Reputation: [positive/negative/mixed]
□ Actor associations: [count]
```

### 4. Bulletproof Hosting Assessment

Assess hosting for abuse tolerance:

```
BULLETPROOF HOSTING ASSESSMENT
==============================

Hosting Provider Analysis:
| Provider | Known BPH? | Evidence | Period |
|----------|------------|----------|--------|
| [provider from Step 2] | [Y/N/Suspected] | [reports/history] | [dates] |

Abuse Response Assessment:
| Provider | Abuse Reports | Response | Average Time |
|----------|---------------|----------|--------------|
| [provider] | [count known] | [action/ignore] | [hours/days/never] |

BPH Indicators Present:
| Indicator | Present | Evidence |
|-----------|---------|----------|
| Known BPH provider | [Y/N] | [source] |
| Abuse-tolerant jurisdiction | [Y/N] | [country] |
| Slow/no abuse response | [Y/N] | [reports] |
| Anonymous payment accepted | [Y/N] | [evidence] |
| Cryptocurrency only | [Y/N] | [evidence] |
| Dark web advertising | [Y/N] | [forum posts] |
| Privacy-focused marketing | [Y/N] | [website claims] |

Provider Reputation:
| Source | Rating | Assessment |
|--------|--------|------------|
| [Spamhaus/etc] | [listed?] | [details] |
| [Security vendors] | [reputation] | [details] |
| [Forum discussions] | [reputation] | [details] |

Co-Hosted Analysis:
| Provider | Our Domain | Other Notable Domains | Pattern |
|----------|------------|----------------------|---------|
| [provider] | [domain] | [suspicious neighbors] | [assessment] |

□ BPH indicators: [count]
□ Provider assessment: [legitimate/suspicious/known BPH]
□ Abuse tolerance: [high/medium/low]
```

### 5. Criminal Marketplace Connections

Check marketplace presence:

```
CRIMINAL MARKETPLACE CONNECTIONS
================================

Marketplace Mentions:
| Marketplace | Type | Context | Date |
|-------------|------|---------|------|
| [market] | [data/access/services] | [how listed] | [date] |

Access Sales:
| Market | Listing | Price | Seller | Date |
|--------|---------|-------|--------|------|
| [market] | [RDP/VPN/shell access] | [price] | [seller handle] | [date] |

Data Sales Related:
| Market | Data Type | Volume | Price | Connection |
|--------|-----------|--------|-------|------------|
| [market] | [DB/docs/etc] | [records] | [price] | [to our infra] |

Service Provider Listings:
| Market | Service | Provider | Connection |
|--------|---------|----------|------------|
| [market] | [hosting/proxy/etc] | [provider] | [our hosting?] |

Related Seller Activity:
| Seller | Markets | Products | Connection to Infra |
|--------|---------|----------|---------------------|
| [seller] | [markets] | [what selling] | [same domains/IPs] |

□ Marketplace connections: [count]
□ Access for sale: [Y/N]
□ Data breach related: [Y/N]
```

### 6. Underground Connections Summary

Compile underground findings:

```
UNDERGROUND CONNECTIONS SUMMARY
===============================

Threat History:
| Category | Findings | Severity | Period |
|----------|----------|----------|--------|
| Malware C2 | [count/none] | [H/M/L] | [dates] |
| Phishing | [count/none] | [H/M/L] | [dates] |
| Forum mentions | [count/none] | [H/M/L] | [dates] |
| BPH indicators | [count/none] | [H/M/L] | [dates] |
| Marketplace | [count/none] | [H/M/L] | [dates] |

Key Underground Findings:
1. [Most significant underground finding]
2. [Second finding]
3. [Third finding]

Threat Timeline:
| Date | Type | Details | Actor Link |
|------|------|---------|------------|
| [date] | [malware/phishing/etc] | [specifics] | [actor if known] |

Actor Associations:
| Actor/Group | Association Type | Confidence | Evidence |
|-------------|------------------|------------|----------|
| [actor] | [user/operator/customer] | [H/M/L] | [basis] |

Current Threat Status:
| Indicator | Status | Last Seen | Threat Level |
|-----------|--------|-----------|--------------|
| [domain] | [active threat/historical/clean] | [date] | [H/M/L] |
| [IP] | [status] | [date] | [level] |

Handoff to Dossier (Step 5):
- Actor associations: [for correlation]
- Malware families: [for campaign matching]
- Threat timeline: [for integration]
- Campaign indicators: [for attribution]
```

---

## STEP 4 OUTPUT

```markdown
## UNDERGROUND CONNECTIONS SUMMARY

### Threat History
| Type | Count | Severity |
|------|-------|----------|
| Malware C2 | [count] | [H/M/L] |
| Phishing | [count] | [H/M/L] |
| Forum mentions | [count] | [H/M/L] |
| Marketplace | [count] | [H/M/L] |

### Hosting Assessment
- Provider: [provider]
- BPH indicators: [count]
- Assessment: [legitimate/suspicious/BPH]

### Actor Associations
| Actor | Association | Confidence |
|-------|-------------|------------|
| [actor] | [type] | [H/M/L] |

### Current Status
- Active threats: [Y/N]
- Last malicious activity: [date]
- Current threat level: [H/M/L]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Threat Correlation Targets
- Actors: [for Step 5]
- Campaigns: [for Step 5]
- Malware: [for Step 5]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:
- [ ] Malware C2 history checked
- [ ] Phishing history assessed
- [ ] Forum mentions searched
- [ ] Hosting assessed for BPH
- [ ] Marketplace connections checked
- [ ] Threat timeline built
- [ ] Handoff data prepared for Dossier

---

## MENU OPTIONS

**[C] Continue** - Proceed to threat correlation (Step 5)
**[M] Malware** - Deeper malware analysis
**[P] Phishing** - Extended phishing investigation
**[F] Forum** - Additional forum search

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-05-threat-timeline.md`
