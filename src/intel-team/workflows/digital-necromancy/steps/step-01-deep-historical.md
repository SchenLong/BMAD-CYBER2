---
name: 'step-01-deep-historical'
description: 'Archived breach data, historical forum posts, deleted marketplace listings, paste site archives'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/digital-necromancy'
thisStepFile: '{workflow_path}/steps/step-01-deep-historical.md'
nextStepFile: '{workflow_path}/steps/step-02-technical-archaeology.md'
prevStepFile: null

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 1: Deep Historical Search

## STEP GOAL

Search underground archives, breach databases, historical forum posts, and dark web caches to recover deleted or hidden digital presence from sources that maintain historical records others have attempted to erase.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You navigate breach databases, forum archives, and dark web caches
- You recover historical data that targets have attempted to erase

### Analysis Protocol

- Search all available breach database archives
- Mine historical forum posts across platforms
- Check deleted marketplace listings and caches
- Search paste site archives systematically
- Recover cached dark web content
- Document all findings with timestamps and provenance

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Target Intake & Historical Context

Document the target and known historical presence:

```
DIGITAL NECROMANCY: TARGET INTAKE
=================================

Target Identifiers:
□ Primary identifier: [username/email/domain/name]
□ Secondary identifiers: [list all known variants]
□ Known aliases: [if any]

Historical Context:
| Timeframe | Known Activity | Source |
|-----------|---------------|--------|
| [date range] | [activity] | [how known] |
| [date range] | [activity] | [how known] |

Scrubbing Indicators:
□ When was presence deleted/hidden: [date if known]
□ Reason suspected: [investigation/cleanup/rebrand/other]
□ Platforms affected: [list]

Recovery Priorities:
| Priority | Platform/Data Type | Reason |
|----------|-------------------|--------|
| P1 | [most critical] | [why] |
| P2 | [important] | [why] |
| P3 | [useful] | [why] |

Investigation Context:
□ Purpose of recovery: [investigation type]
□ Legal/ethical constraints: [any restrictions]
□ Time sensitivity: [urgent/standard/archival]
```

### 2. Breach Database Archive Search

Search historical breach data:

```
BREACH DATABASE ARCHIVE SEARCH
==============================

Email Address Search:
| Email | Breaches Found | Data Types | Dates |
|-------|----------------|------------|-------|
| [email 1] | [breach list] | [pwd/hash/name/etc] | [breach dates] |
| [email 2] | [breach list] | [data types] | [dates] |

Password Pattern Analysis:
| Breach | Password/Hash | Pattern Notes |
|--------|---------------|---------------|
| [breach] | [pwd if available] | [reuse pattern] |

Historical Username Recovery:
| Breach | Username Found | Associated Data |
|--------|----------------|-----------------|
| [breach] | [username] | [linked info] |

Data Aggregation Finds:
| Source | Compilation | Data Fields |
|--------|-------------|-------------|
| [source] | [collection name] | [available data] |

□ Credential patterns identified:
  - [ ] Password reuse across breaches
  - [ ] Email variations discovered
  - [ ] Username evolution tracked
  - [ ] Phone numbers recovered
  - [ ] Address history found
  - [ ] Additional identities discovered

BREACH RECOVERY SCORE: [0-100]
Critical findings: [summary]
```

### 3. Historical Forum Post Recovery

Search archived forum content:

```
HISTORICAL FORUM POST RECOVERY
==============================

Forum Archives Searched:
| Forum Category | Platforms Searched | Results |
|----------------|-------------------|---------|
| Hacking/Security | [forums] | [count] |
| Carding/Fraud | [forums] | [count] |
| Markets | [forums] | [count] |
| General Tech | [forums] | [count] |
| Gaming | [forums] | [count] |
| Other | [forums] | [count] |

Recovered Forum Presence:
| Forum | Username | Join Date | Last Active | Post Count |
|-------|----------|-----------|-------------|------------|
| [forum 1] | [handle] | [date] | [date] | [count] |
| [forum 2] | [handle] | [date] | [date] | [count] |

Notable Post Content:
| Date | Forum | Topic | Content Summary | Significance |
|------|-------|-------|-----------------|--------------|
| [date] | [forum] | [topic] | [summary] | [why important] |
| [date] | [forum] | [topic] | [summary] | [significance] |

Reputation/Status Indicators:
| Forum | Reputation Score | Status/Rank | Notes |
|-------|------------------|-------------|-------|
| [forum] | [score/vouches] | [rank] | [context] |

Profile Information Recovered:
| Forum | Avatar | Bio/Signature | Contact Info |
|-------|--------|---------------|--------------|
| [forum] | [description/saved] | [text] | [jabber/tox/etc] |

Interaction Network:
| Forum | Interacted With | Context | Significance |
|-------|-----------------|---------|--------------|
| [forum] | [username] | [thread/deal] | [relationship] |

FORUM RECOVERY SCORE: [0-100]
Key forum personas: [summary]
```

### 4. Deleted Marketplace Listings

Search marketplace archives:

```
DELETED MARKETPLACE LISTINGS
============================

Marketplace Archives Searched:
| Marketplace | Status | Archive Source | Date Range |
|-------------|--------|----------------|------------|
| [market 1] | [active/defunct] | [source] | [dates covered] |
| [market 2] | [status] | [source] | [dates] |

Vendor Profiles Found:
| Market | Vendor Name | Products | Rating | Active Period |
|--------|-------------|----------|--------|---------------|
| [market] | [name] | [type] | [rating] | [dates] |

Recovered Listings:
| Date | Market | Title | Category | Price | Details |
|------|--------|-------|----------|-------|---------|
| [date] | [market] | [title] | [category] | [price] | [description] |
| [date] | [market] | [title] | [category] | [price] | [description] |

Transaction/Feedback History:
| Market | Role | Transaction Count | Feedback | Volume |
|--------|------|-------------------|----------|--------|
| [market] | [vendor/buyer] | [count] | [positive/negative] | [if known] |

Cryptocurrency Addresses:
| Market | Address Type | Address | Notes |
|--------|--------------|---------|-------|
| [market] | [BTC/XMR/etc] | [address] | [reuse/tracing] |

□ Marketplace presence indicators:
  - [ ] Active vendor history
  - [ ] Buyer activity recovered
  - [ ] Escrow disputes found
  - [ ] Exit scam involvement
  - [ ] Cross-market presence

MARKETPLACE RECOVERY SCORE: [0-100]
```

### 5. Paste Site Archive Search

Search paste site archives:

```
PASTE SITE ARCHIVE SEARCH
=========================

Paste Sites Searched:
| Site | Archive Source | Date Range | Results |
|------|----------------|------------|---------|
| Pastebin | [archive.org/other] | [dates] | [count] |
| Ghostbin | [source] | [dates] | [count] |
| Hastebin | [source] | [dates] | [count] |
| Rentry | [source] | [dates] | [count] |
| 0bin | [source] | [dates] | [count] |
| Other | [source] | [dates] | [count] |

Recovered Pastes:
| Date | Site | Title/ID | Content Type | Significance |
|------|------|----------|--------------|--------------|
| [date] | [site] | [id] | [type] | [importance] |
| [date] | [site] | [id] | [type] | [importance] |

Paste Content Analysis:
| Paste ID | Author Indicators | Content Summary | Links Found |
|----------|-------------------|-----------------|-------------|
| [id] | [username/style] | [summary] | [urls/emails] |

Data Dumps Found:
| Paste | Dump Type | Records | Target/Victim | Date |
|-------|-----------|---------|---------------|------|
| [id] | [creds/db/dox] | [count] | [target] | [date] |

Contact Information in Pastes:
| Paste | Contact Type | Value | Context |
|-------|--------------|-------|---------|
| [id] | [jabber/tox/email] | [value] | [purpose] |

□ Paste recovery indicators:
  - [ ] Target authored pastes found
  - [ ] Target mentioned in pastes
  - [ ] Leaked data containing target
  - [ ] Contact information recovered
  - [ ] Code/tools attributed to target

PASTE RECOVERY SCORE: [0-100]
```

### 6. Dark Web Cache Recovery

Search cached dark web content:

```
DARK WEB CACHE RECOVERY
=======================

Archive Sources Checked:
| Source Type | Platforms | Coverage | Results |
|-------------|-----------|----------|---------|
| Onion archives | [list] | [dates] | [findings] |
| Mirror services | [list] | [dates] | [findings] |
| Researcher archives | [list] | [dates] | [findings] |
| Leak site caches | [list] | [dates] | [findings] |

Recovered Hidden Services:
| Service Type | .onion Address | Status | Content |
|--------------|----------------|--------|---------|
| [type] | [address] | [active/archived] | [description] |

Cached Profile Pages:
| Platform | URL/Path | Cache Date | Content Recovered |
|----------|----------|------------|-------------------|
| [platform] | [path] | [date] | [description] |

Communication Channel Archives:
| Platform | Channel/Room | Date Range | Messages |
|----------|--------------|------------|----------|
| [IRC/Matrix/etc] | [channel] | [dates] | [count/summary] |

Cached Transaction Data:
| Source | Transaction Type | Date | Details |
|--------|------------------|------|---------|
| [source] | [escrow/direct] | [date] | [summary] |

□ Dark web cache findings:
  - [ ] Personal hidden services found
  - [ ] Marketplace profiles cached
  - [ ] Forum profiles archived
  - [ ] Communication logs recovered
  - [ ] Transaction history found

DARK WEB RECOVERY SCORE: [0-100]
```

### 7. Deep Historical Search Summary

Compile underground findings:

```
DEEP HISTORICAL SEARCH SUMMARY
==============================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Breach Archives | [score] | 25% | [weighted] |
| Forum Recovery | [score] | 25% | [weighted] |
| Marketplace Archives | [score] | 20% | [weighted] |
| Paste Archives | [score] | 15% | [weighted] |
| Dark Web Caches | [score] | 15% | [weighted] |
| **TOTAL HISTORICAL** | - | - | **[total]** |

Timeline of Underground Presence:
| Date | Platform | Activity | Evidence |
|------|----------|----------|----------|
| [earliest] | [platform] | [activity] | [source] |
| ... | ... | ... | ... |
| [most recent] | [platform] | [activity] | [source] |

Identity Evolution Discovered:
| Period | Username | Platform | Associated Data |
|--------|----------|----------|-----------------|
| [date range] | [handle] | [platform] | [email/etc] |
| [date range] | [handle pivot] | [platform] | [data] |

Critical Recoveries:
1. [Most significant finding]
2. [Second most significant]
3. [Third most significant]

Gaps Identified:
| Period | Expected Activity | Possible Reasons |
|--------|-------------------|------------------|
| [date range] | [what's missing] | [hypotheses] |

Handoff to Probe (Step 2):
- Domains to investigate historically: [list]
- Infrastructure indicators: [IPs, certificates]
- Code/technical artifacts: [repos, tools]
- Timeframes to focus on: [date ranges]
```

---

## STEP 1 OUTPUT

```markdown
## DEEP HISTORICAL SEARCH SUMMARY

### Recovery Overview
- Breach databases searched: [count]
- Forum archives mined: [count]
- Marketplace histories checked: [count]
- Paste archives searched: [count]
- Dark web caches recovered: [count]

### Historical Scores
| Category | Score |
|----------|-------|
| Breach Archives | [X/100] |
| Forum Recovery | [X/100] |
| Marketplace Archives | [X/100] |
| Paste Archives | [X/100] |
| Dark Web Caches | [X/100] |
| **HISTORICAL TOTAL** | **[X/100]** |

### Key Recoveries
- Earliest presence found: [date/platform]
- Identity pivots discovered: [count]
- Underground personas: [list]
- Critical data recovered: [summary]

### Identity Timeline (Underground)
| Period | Handle | Platform | Activity |
|--------|--------|----------|----------|
| [dates] | [name] | [platform] | [type] |

### Technical Archaeology Targets
- Domains: [list for Step 2]
- Infrastructure: [IPs, certs for Step 2]
- Repositories: [code artifacts for Step 2]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:

- [ ] Breach database archives searched
- [ ] Forum post history recovered
- [ ] Marketplace listings checked
- [ ] Paste site archives searched
- [ ] Dark web caches examined
- [ ] Historical score calculated
- [ ] Identity timeline started
- [ ] Technical targets identified for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical archaeology (Step 2)
**[B] Breach** - Deeper breach database analysis
**[F] Forum** - Extended forum archaeology
**[M] Marketplace** - Additional marketplace search

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-technical-archaeology.md`
