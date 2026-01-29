---
name: 'step-06-underground'
description: 'Credential exposure, breaches, dark web mentions, threat indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-06-underground.md'
nextStepFile: '{workflow_path}/steps/step-07-threats.md'
prevStepFile: '{workflow_path}/steps/step-05-public-presence.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Phase 6: Underground Exposure & Threats

## STEP GOAL

Assess the organization's exposure in dark web forums, breach databases, and underground markets. Identify leaked credentials, exposed data, threat actor interest, and active targeting indicators.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground intelligence
- You assess breach exposure and credential leaks
- You monitor dark web for organizational mentions and threats

### Collection Protocol
- Check breach databases for credential exposure
- Search dark web forums for organizational mentions
- Monitor marketplaces for access or data sales
- Identify initial access broker activity
- Assess threat actor interest indicators

---

## COLLECTION EXECUTION SEQUENCE

### 1. Breach Database Assessment

Check for organization in known breaches:

```
BREACH DATABASE ASSESSMENT
==========================

Domain Breach Search:
| Domain | Breaches Found | Total Exposed | Date Range |
|--------|----------------|---------------|------------|
| [domain.com] | [count] | [count] | [earliest-latest] |
| [domain2.com] | [count] | [count] | [earliest-latest] |

Breach Inventory:
| Breach Name | Date | Records | Data Types | Source |
|-------------|------|---------|------------|--------|
| [breach] | [date] | [count] | [email/password/etc] | [site] |
| [breach] | [date] | [count] | [data types] | [site] |

Data Types Exposed:
| Data Type | Exposure Count | Risk Level |
|-----------|---------------|------------|
| Email addresses | [count] | MEDIUM |
| Passwords (hashed) | [count] | HIGH |
| Passwords (plain) | [count] | CRITICAL |
| Phone numbers | [count] | MEDIUM |
| Physical addresses | [count] | MEDIUM |
| Financial data | [count] | CRITICAL |
| SSN/ID numbers | [count] | CRITICAL |
| IP addresses | [count] | LOW |

Key Personnel Exposure:
| Name | Email | Breaches | Data Types |
|------|-------|----------|------------|
| [exec name] | [email] | [count] | [types] |
| [exec name] | [email] | [count] | [types] |

BREACH EXPOSURE SUMMARY:
- Total unique emails exposed: [count]
- Critical exposures (plaintext passwords): [count]
- Recent exposures (< 1 year): [count]
- Executive exposure: [count]
- Password reuse risk: [High/Medium/Low]
```

### 2. Dark Web Forum Monitoring

Search forums for organizational mentions:

```
DARK WEB FORUM MONITORING
=========================

Forum Search Results:
| Forum | Search Term | Matches | Date Range |
|-------|-------------|---------|------------|
| [forum] | [company name] | [count] | [dates] |
| [forum] | [domain] | [count] | [dates] |
| [forum] | [product] | [count] | [dates] |

Mention Analysis:
| Date | Forum | Thread | Context | Threat Level |
|------|-------|--------|---------|--------------|
| [date] | [forum] | [title] | [summary] | [H/M/L] |

Mention Categories:
| Category | Count | Assessment |
|----------|-------|------------|
| Data leak discussion | [count] | [analysis] |
| Vulnerability discussion | [count] | [analysis] |
| Attack planning | [count] | [analysis] |
| Credential sharing | [count] | [analysis] |
| Access sales | [count] | [analysis] |
| General mention | [count] | [analysis] |

Threat Actor Interest:
| Actor/Handle | Forum | Interest Type | Activity Level |
|--------------|-------|---------------|----------------|
| [handle] | [forum] | [type] | [recent/historical] |

FORUM MONITORING SUMMARY:
- Total mentions found: [count]
- Active discussions: [count]
- Threat-relevant mentions: [count]
- Attack planning indicators: [Y/N]
```

### 3. Marketplace Analysis

Check for organization data/access on marketplaces:

```
MARKETPLACE ANALYSIS
====================

Access Broker Listings:
| Marketplace | Listing | Access Type | Price | Date |
|-------------|---------|-------------|-------|------|
| [market] | [listing] | [VPN/RDP/etc] | [price] | [date] |

Data For Sale:
| Marketplace | Listing | Data Type | Records | Price | Date |
|-------------|---------|-----------|---------|-------|------|
| [market] | [listing] | [type] | [count] | [price] | [date] |

Credential Sales:
| Source | Count | Data Types | Price | Freshness |
|--------|-------|------------|-------|-----------|
| [combo list] | [count] | [types] | [price] | [date] |

Insider Threat Indicators:
| Platform | Listing Type | Details | Risk Level |
|----------|--------------|---------|------------|
| [market] | [insider access sale] | [details] | [H/M/L] |

Service Offerings Targeting Org:
| Service | Platform | Price | Status |
|---------|----------|-------|--------|
| [DDoS] | [platform] | [price] | [active/fulfilled] |
| [spam/phishing] | [platform] | [price] | [active/fulfilled] |

MARKETPLACE SUMMARY:
- Active access listings: [count]
- Data for sale: [Y/N, summary]
- Credential availability: [assessment]
- Insider threat indicators: [Y/N]
```

### 4. Paste Site and Dump Analysis

Check paste sites and data dumps:

```
PASTE SITE ANALYSIS
===================

Paste Site Findings:
| Site | Matches | Content Type | Date Range |
|------|---------|--------------|------------|
| Pastebin | [count] | [types] | [dates] |
| Ghostbin | [count] | [types] | [dates] |
| Other | [count] | [types] | [dates] |

Content Analysis:
| Paste ID | Date | Content Type | Sensitivity | Status |
|----------|------|--------------|-------------|--------|
| [ID] | [date] | [credentials/data/config] | [H/M/L] | [active/removed] |

Data Dump Assessment:
| Dump Source | Date | Organization Match | Content |
|-------------|------|-------------------|---------|
| [source] | [date] | [match type] | [summary] |

API Key/Secret Exposure:
| Type | Location | Status | Risk |
|------|----------|--------|------|
| API key | [paste/repo] | [valid/revoked] | [H/M/L] |
| Secret | [paste/repo] | [valid/revoked] | [H/M/L] |

PASTE SITE SUMMARY:
- Total relevant pastes: [count]
- Active credential dumps: [count]
- API/secret exposure: [Y/N]
- Takedown recommended: [list if any]
```

### 5. Initial Access Broker (IAB) Monitoring

Monitor for organizational access sales:

```
INITIAL ACCESS BROKER MONITORING
================================

Active Access Listings:
| Date | Platform | Access Type | Network Size | Price | Status |
|------|----------|-------------|--------------|-------|--------|
| [date] | [platform] | [VPN/RDP/etc] | [description] | [price] | [active/sold] |

Historical Access Sales:
| Date | Platform | Access Type | Buyer (if known) | Outcome |
|------|----------|-------------|------------------|---------|
| [date] | [platform] | [type] | [if known] | [ransomware/exfil/etc] |

Access Characteristics (if listing found):
□ Access type: [VPN/RDP/Citrix/WebShell/Other]
□ Privilege level: [Domain Admin/Local Admin/User]
□ Network description: [details from listing]
□ Revenue/employee mentioned: [if disclosed]
□ Price: [price]
□ Auction/fixed price: [type]

IAB Intelligence:
| Broker | Activity | Target Preference | History with Org |
|--------|----------|-------------------|------------------|
| [handle] | [active/inactive] | [industries] | [prior listings] |

IAB SUMMARY:
- Current access listings: [count]
- Historical access sales: [count]
- Active broker interest: [Y/N]
- Risk level: [Critical/High/Medium/Low]
```

### 6. Ransomware and Extortion Monitoring

Check for ransomware group targeting:

```
RANSOMWARE AND EXTORTION MONITORING
===================================

Ransomware Leak Site Check:
| Group | Organization Listed | Date | Data Published |
|-------|---------------------|------|----------------|
| [group] | [Y/N] | [date if Y] | [summary] |

Extortion History:
| Date | Threat Actor | Type | Outcome |
|------|--------------|------|---------|
| [date] | [actor] | [ransomware/extortion] | [paid/refused/unknown] |

Industry Targeting:
| Ransomware Group | Industry Focus | Recent Activity |
|------------------|----------------|-----------------|
| [group] | [industries] | [recent victims in industry] |

Extortion Indicators:
□ Listed on any leak site: [Y/N]
□ Historical ransomware incident: [Y/N]
□ Industry heavily targeted: [Y/N]
□ Recent industry attacks: [list if relevant]

RANSOMWARE RISK ASSESSMENT:
- Current leak site listing: [Y/N]
- Historical incident: [Y/N]
- Industry risk level: [High/Medium/Low]
- Specific group interest: [groups if any]
```

### 7. Underground Exposure Summary

Compile underground findings:

```
UNDERGROUND EXPOSURE SUMMARY
============================

Exposure Metrics:
| Category | Count | Risk Level |
|----------|-------|------------|
| Breach exposures | [count] | [H/M/L] |
| Forum mentions | [count] | [H/M/L] |
| Marketplace listings | [count] | [H/M/L] |
| Access broker listings | [count] | [H/M/L] |
| Ransomware exposure | [Y/N] | [H/M/L] |

Critical Findings:
1. [Most critical finding]
2. [Second most critical]
3. [Third most critical]

Immediate Risks:
| Risk | Severity | Recommended Action |
|------|----------|-------------------|
| [risk] | [Critical/High/Medium] | [action] |

PIR Contribution:
| PIR | Underground Contribution | Status |
|-----|------------------------|--------|
| PIR-1 | [contribution] | [status] |
| PIR-2 | [contribution] | [status] |
| PIR-3 | [contribution] | [status] |
| PIR-4 | [contribution] | [status] |

Handoff to Dossier (Phase 7):
- Threat actors with interest: [list]
- Attack indicators observed: [list]
- Vulnerability discussions: [list]
```

---

## PHASE 6 OUTPUT

```markdown
## UNDERGROUND EXPOSURE SUMMARY

### Breach Exposure
- Total breaches: [count]
- Unique emails exposed: [count]
- Critical exposures: [count]
- Executive exposure: [Y/N]

### Dark Web Presence
- Forum mentions: [count]
- Threat-relevant discussions: [count]
- Attack planning indicators: [Y/N]

### Marketplace Activity
- Access listings: [count]
- Data for sale: [Y/N]
- Insider threat indicators: [Y/N]

### Ransomware Risk
- Leak site listing: [Y/N]
- Historical incidents: [Y/N]
- Industry risk: [assessment]

### Overall Underground Risk
Rating: [Critical/High/Medium/Low]
Key concerns: [list top 3]

### Ready for Threat Landscape Analysis
Underground exposure assessed. Proceed to threat actor profiling.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 7:
- [ ] Breach databases checked
- [ ] Forums searched
- [ ] Marketplaces monitored
- [ ] Paste sites checked
- [ ] IAB activity assessed
- [ ] Ransomware exposure checked
- [ ] Threat indicators identified for Dossier

---

## MENU OPTIONS

**[C] Continue** - Proceed to threat landscape (Phase 7)
**[B] Breach** - Deeper breach analysis
**[M] Market** - Extended marketplace monitoring
**[I] IAB** - Initial access broker deep dive

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-07-threats.md`
