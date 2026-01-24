---
name: 'step-04-dark-web-exposure'
description: 'Breach database checks, forum mentions, marketplace presence, leaked credentials'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-04-dark-web-exposure.md'
nextStepFile: '{workflow_path}/steps/step-05-corporate-intel.md'
prevStepFile: '{workflow_path}/steps/step-03-social-presence.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 4: Dark Web Exposure (Phase 2c)

## STEP GOAL

Assess the target's exposure in dark web sources including breach databases, underground forums, marketplaces, and paste sites. Identify leaked credentials, mentions in criminal discussions, and any indicators of targeting or compromise.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You navigate breach databases, forums, and criminal marketplaces
- You identify exposure and threat indicators

### Collection Protocol
- Search all available breach databases
- Check underground forums for mentions
- Scan marketplaces for related listings
- Search paste sites for leaked data
- Identify any threat actor interest
- Document all findings for threat correlation

---

## COLLECTION EXECUTION SEQUENCE

### 1. Breach Database Search

Check breach exposure:

```
BREACH DATABASE SEARCH
======================

Target Identifiers:
- Emails: [list from Steps 1-3]
- Domains: [list from Step 2]
- Usernames: [list from Step 3]
- Phone numbers: [if available]

Breach Exposure Results:
| Email/Identifier | Breaches Found | Dates | Data Types |
|------------------|----------------|-------|------------|
| [email 1] | [breach list] | [dates] | [pwd/hash/personal] |
| [email 2] | [breach list] | [dates] | [data types] |
| [domain] | [breaches] | [dates] | [data types] |

Detailed Breach Analysis:
| Breach Name | Date | Records | Target Data | Severity |
|-------------|------|---------|-------------|----------|
| [breach 1] | [date] | [count] | [data exposed] | [H/M/L] |
| [breach 2] | [date] | [count] | [data exposed] | [H/M/L] |

Password Intelligence:
| Breach | Password/Hash | Pattern | Reuse Risk |
|--------|---------------|---------|------------|
| [breach] | [pwd if available] | [pattern] | [H/M/L] |

Credential Validity Assessment:
| Credential | Likely Current | Risk Level |
|------------|----------------|------------|
| [email:pwd] | [Y/N/Unknown] | [H/M/L] |

Combolist/Collection Presence:
| Collection | Records | Date | Includes |
|------------|---------|------|----------|
| [collection] | [count] | [date] | [data types] |

□ Total breaches found: [count]
□ Credentials exposed: [Y/N]
□ Recent exposure: [Y/N - within 2 years]
□ Critical exposure: [Y/N]
```

### 2. Underground Forum Search

Search criminal forums:

```
UNDERGROUND FORUM SEARCH
========================

Forums Searched:
| Forum Category | Forums Checked | Results |
|----------------|----------------|---------|
| Hacking/Security | [forums] | [mentions] |
| Carding/Fraud | [forums] | [mentions] |
| Data Trading | [forums] | [mentions] |
| Regional | [forums] | [mentions] |

Forum Mentions Found:
| Forum | Date | Context | Threat Level |
|-------|------|---------|--------------|
| [forum] | [date] | [what was said] | [H/M/L] |
| [forum] | [date] | [context] | [level] |

Discussion Analysis:
| Thread/Topic | Target Mention Type | Participants | Sentiment |
|--------------|---------------------|--------------|-----------|
| [topic] | [victim/target/interest] | [count] | [hostile/neutral] |

Target as Forum Participant:
| Forum | Handle | Posts | Reputation | Activity |
|-------|--------|-------|------------|----------|
| [forum] | [handle if found] | [count] | [score] | [dates] |

Threat Indicators:
| Indicator | Forum | Date | Details |
|-----------|-------|------|---------|
| Interest in target | [forum] | [date] | [who/what] |
| Data for sale | [forum] | [date] | [description] |
| Attack planning | [forum] | [date] | [details] |

□ Forum presence found: [Y/N]
□ Threat discussions found: [Y/N]
□ Target is forum user: [Y/N]
```

### 3. Marketplace Scanning

Check dark web marketplaces:

```
MARKETPLACE SCANNING
====================

Marketplaces Searched:
| Marketplace | Status | Search Terms | Results |
|-------------|--------|--------------|---------|
| [market 1] | [active/defunct] | [terms] | [findings] |
| [market 2] | [status] | [terms] | [findings] |

Listings Related to Target:
| Marketplace | Listing Type | Description | Price | Date |
|-------------|--------------|-------------|-------|------|
| [market] | [data/access/etc] | [what's for sale] | [price] | [date] |

Access Listings (IAB):
| Marketplace | Access Type | Target Match | Price | Seller |
|-------------|-------------|--------------|-------|--------|
| [market] | [RDP/VPN/etc] | [domain/IP] | [price] | [reputation] |

Data Listings:
| Marketplace | Data Type | Relevance | Records | Price |
|-------------|-----------|-----------|---------|-------|
| [market] | [DB/docs/etc] | [target related?] | [count] | [price] |

Target as Vendor/Buyer:
| Marketplace | Role | Activity | Products/Purchases |
|-------------|------|----------|-------------------|
| [market] | [vendor/buyer] | [summary] | [types] |

□ Marketplace listings found: [count]
□ Access for sale: [Y/N]
□ Data for sale: [Y/N]
□ Target is marketplace user: [Y/N]
```

### 4. Paste Site Search

Search paste archives:

```
PASTE SITE SEARCH
=================

Paste Sites Searched:
| Site | Results | Date Range |
|------|---------|------------|
| Pastebin | [count] | [dates] |
| Ghostbin | [count] | [dates] |
| Other | [count] | [dates] |

Relevant Pastes Found:
| Site | Paste ID | Date | Content Type | Target Data |
|------|----------|------|--------------|-------------|
| [site] | [id] | [date] | [dump/dox/etc] | [what's exposed] |

Dox/Personal Info Pastes:
| Paste | Date | Data Exposed | Source |
|-------|------|--------------|--------|
| [id] | [date] | [address/phone/etc] | [how obtained] |

Credential Dumps:
| Paste | Date | Format | Target Records |
|-------|------|--------|----------------|
| [id] | [date] | [email:pass/etc] | [count] |

Code/Config Leaks:
| Paste | Date | Content | Sensitivity |
|-------|------|---------|-------------|
| [id] | [date] | [code/config] | [H/M/L] |

□ Pastes found: [count]
□ Credentials in pastes: [Y/N]
□ Personal info exposed: [Y/N]
□ Sensitive data leaked: [Y/N]
```

### 5. Threat Actor Interest Assessment

Assess targeting indicators:

```
THREAT ACTOR INTEREST ASSESSMENT
================================

Targeting Indicators:
| Indicator Type | Evidence | Threat Level |
|----------------|----------|--------------|
| Reconnaissance discussed | [forum posts] | [H/M/L] |
| Data being sold | [listings] | [H/M/L] |
| Access advertised | [IAB listings] | [H/M/L] |
| Named in attack planning | [discussions] | [H/M/L] |
| Mentioned by known actors | [context] | [H/M/L] |

Industry/Sector Targeting:
| Actor/Group | Industry Focus | Target Relevance |
|-------------|----------------|------------------|
| [actor] | [industry] | [same sector?] |

Recent Threat Activity:
| Date | Activity Type | Relevance |
|------|---------------|-----------|
| [date] | [attack/breach/etc] | [related to target?] |

Threat Level Assessment:
| Factor | Assessment | Evidence |
|--------|------------|----------|
| Current targeting | [Active/None/Unknown] | [evidence] |
| Recent compromise | [Y/N/Unknown] | [evidence] |
| Future targeting likelihood | [H/M/L] | [reasoning] |

□ Active targeting detected: [Y/N]
□ Recent compromise indicators: [Y/N]
□ Threat actor interest: [H/M/L/None]
```

### 6. Dark Web Exposure Summary

Compile DARKINT findings:

```
DARK WEB EXPOSURE SUMMARY
=========================

Exposure Overview:
| Category | Count | Severity |
|----------|-------|----------|
| Breaches | [count] | [highest severity] |
| Forum mentions | [count] | [threat level] |
| Marketplace listings | [count] | [threat level] |
| Paste exposure | [count] | [severity] |

Critical Findings:
1. [Most critical dark web finding]
2. [Second critical finding]
3. [Third critical finding]

Credential Exposure:
| Status | Count | Risk |
|--------|-------|------|
| Exposed credentials | [count] | [current validity risk] |
| Recent breaches | [count] | [timeframe] |
| Password patterns | [identified?] | [reuse risk] |

Threat Indicators:
| Indicator | Present | Details |
|-----------|---------|---------|
| Active targeting | [Y/N] | [details] |
| Data for sale | [Y/N] | [details] |
| Access for sale | [Y/N] | [details] |
| Threat actor interest | [Y/N] | [details] |

Handoffs for Other Agents:
| Agent | Data Provided |
|-------|---------------|
| Dossier | [threat indicators for correlation] |
| Proxy | [corporate breach exposure] |
| Viper | [credential reuse for SE vectors] |
| Probe | [compromised infrastructure indicators] |

Immediate Action Recommendations:
| Priority | Action | Reason |
|----------|--------|--------|
| [Critical/High] | [action] | [why needed] |
```

---

## STEP 4 OUTPUT

```markdown
## DARK WEB EXPOSURE SUMMARY

### Breach Exposure
- Total breaches: [count]
- Most recent: [date]
- Critical data exposed: [types]
- Credential risk: [H/M/L]

### Underground Presence
- Forum mentions: [count]
- Marketplace listings: [count]
- Paste exposure: [count]
- Target is underground user: [Y/N]

### Threat Assessment
- Active targeting: [Y/N]
- Data/access for sale: [Y/N]
- Threat actor interest: [H/M/L/None]
- Recent compromise indicators: [Y/N]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Threat Correlation Points for Dossier
- Known actors with interest: [if any]
- Related campaigns: [if found]
- IOC correlation needed: [indicators]
```

---

## COMPLETION CRITERIA

Before proceeding:
- [ ] Breach databases searched
- [ ] Forums checked
- [ ] Marketplaces scanned
- [ ] Paste sites searched
- [ ] Threat assessment completed
- [ ] Handoff data prepared for other agents

---

## PARALLEL EXECUTION NOTE

This step (4) can run in parallel with Steps 2-3, 5-6. Share findings as they become available.

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate intelligence (Step 5)
**[B] Breach** - Deeper breach analysis
**[F] Forum** - Extended forum search
**[T] Threat** - Detailed threat assessment

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-05-corporate-intel.md`
