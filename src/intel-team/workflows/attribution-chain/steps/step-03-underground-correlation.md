---
name: 'step-03-underground-correlation'
description: 'Dark web forum activity matching, marketplace connections, and persona identification'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-03-underground-correlation.md'
nextStepFile: '{workflow_path}/steps/step-04-opensource-correlation.md'
prevStepFile: '{workflow_path}/steps/step-02-technical-fingerprinting.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 3: Underground Correlation

## STEP GOAL

Search dark web forums, marketplaces, and underground communities for activity matching the observed indicators, tools, and operational patterns. Identify threat actor personas, communications, and marketplace activity that correlates with the hypothesized actors.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Shadow**, Dark Web Analyst
- You specialize in underground community analysis and threat actor tracking
- You identify personas across multiple underground platforms
- You correlate marketplace activity with observed tools and infrastructure

### Analysis Protocol

- Search forums using indicators from Steps 1-2
- Track persona activity across platforms
- Identify tool sales/purchases matching observed samples
- Document communication patterns and relationships
- Maintain operational security in underground research

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Search Term Development

Build comprehensive search strategy:

```
UNDERGROUND SEARCH STRATEGY
===========================

From TTP Analysis (Step 1):
□ Actor aliases/names to search: [list from hypotheses]
□ Campaign names/identifiers: [if known]
□ Tool names mentioned: [list]
□ Victim indicators: [if discussing on forums]

From Technical Analysis (Step 2):
□ Malware names/families: [list]
□ Domain names: [list]
□ Email addresses: [list]
□ Unique strings/identifiers: [list]
□ Tool-specific terms: [list]

Derived Search Terms:
□ Username variations: [list]
□ Infrastructure-related: [list]
□ Tool-related: [list]
□ Technique-specific: [list]

Forum Priority List:
| Forum/Platform | Language | Focus Area | Search Priority |
|----------------|----------|------------|-----------------|
| [forum name] | [lang] | [malware/carding/etc] | [HIGH/MED/LOW] |
| [forum name] | [lang] | [focus] | [priority] |
```

### 2. Forum Activity Search

Search underground forums for matching activity:

```
FORUM ACTIVITY SEARCH
=====================

FORUM: [Forum Name 1]
Search Terms Used: [list]
Results:

□ Matching Posts Found:
| Date | Thread/Post | Author | Content Summary | Relevance |
|------|-------------|--------|-----------------|-----------|
| [date] | [title/link] | [username] | [summary] | [HIGH/MED/LOW] |

□ Author Profile Analysis:
| Username | Registration Date | Post Count | Reputation | Activity Focus |
|----------|------------------|------------|------------|----------------|
| [name] | [date] | [count] | [score] | [focus areas] |

□ Communication Patterns:
- Languages used: [list]
- Writing style indicators: [observations]
- Technical competence level: [assessment]
- Known associates: [usernames mentioned/quoted]

FORUM: [Forum Name 2]
[Repeat structure above]

FORUM: [Forum Name 3]
[Repeat structure above]

Cross-Forum Username Correlation:
| Username (Forum 1) | Likely Same (Forum 2) | Evidence |
|--------------------|----------------------|----------|
| [name] | [name] | [reason for correlation] |
```

### 3. Marketplace Analysis

Search for tool sales and service offerings:

```
MARKETPLACE ANALYSIS
====================

Tool/Malware Sales:
| Platform | Listing | Seller | Price | Match to Observed |
|----------|---------|--------|-------|-------------------|
| [market] | [item] | [seller] | [price] | [correlation to case] |

□ Matching tool sales:
  - [tool observed in attack] sold by [seller] on [platform]
  - Evidence of connection: [details]

□ Service offerings matching observed TTPs:
  - [service type] offered by [actor] matching [observed technique]
  - Evidence: [details]

□ Infrastructure-as-a-service correlation:
  - Bulletproof hosting used in attack sold by: [if found]
  - Proxy/VPN services matching infrastructure: [if found]

Access Broker Activity:
| Platform | Listing Type | Seller | Target Sector | Date | Match |
|----------|--------------|--------|---------------|------|-------|
| [market] | [access type] | [seller] | [sector] | [date] | [correlation] |

□ Initial access sales matching victim:
  - [findings if access to victim was sold]
  - Timeline correlation: [analysis]
```

### 4. Persona Identification

Build threat actor persona profile:

```
PERSONA IDENTIFICATION
======================

PRIMARY PERSONA: [username/alias]

Known Aliases:
| Alias | Platform | First Seen | Last Seen | Confidence |
|-------|----------|------------|-----------|------------|
| [alias] | [platform] | [date] | [date] | [H/M/L] |

Profile Information:
□ Self-reported details:
  - Location claims: [claimed locations]
  - Language proficiency: [languages demonstrated]
  - Technical skills claimed: [list]
  - Timezone indicators: [from posting times]

□ Activity timeline:
  - First known activity: [date, platform]
  - Activity pattern: [description]
  - Periods of inactivity: [gaps noted]
  - Recent activity: [current status]

□ Technical focus areas:
  - Primary expertise: [area]
  - Tools developed/sold: [list]
  - Services offered: [list]
  - Targets preferred: [sectors/geographies]

□ Relationship mapping:
  - Known associates: [list]
  - Business partners: [list]
  - Customers (if seller): [notable]
  - Conflicts/rivalries: [if known]

Communication Patterns:
□ Writing style analysis:
  - Language patterns: [observations]
  - Technical vocabulary: [observations]
  - Slang/cultural indicators: [observations]
  - Consistent typos/errors: [patterns]

□ Posting behavior:
  - Active hours (UTC): [range]
  - Posting frequency: [pattern]
  - Response time patterns: [observations]

SECONDARY PERSONA(S): [if additional identified]
[Repeat structure above]
```

### 5. Transaction and Reputation Analysis

Analyze marketplace transactions and reputation:

```
TRANSACTION ANALYSIS
====================

Seller Activity (if persona is seller):
| Date | Item/Service | Buyer | Price | Outcome |
|------|--------------|-------|-------|---------|
| [date] | [item] | [buyer username] | [price] | [completed/scam/etc] |

□ Transaction patterns:
  - Volume of sales: [assessment]
  - Pricing patterns: [observations]
  - Customer base: [observations]
  - Escrow usage: [patterns]

□ Reputation indicators:
  - Forum vouches: [count, quality]
  - Negative feedback: [any complaints]
  - Dispute history: [if known]

Buyer Activity (if persona is buyer):
| Date | Item/Service | Seller | Relevance |
|------|--------------|--------|-----------|
| [date] | [item] | [seller] | [connection to case] |

□ Procurement patterns:
  - Tools purchased: [list]
  - Services used: [list]
  - Timing relative to campaign: [analysis]
```

### 6. Attribution Correlation

Correlate underground findings with hypotheses:

```
ATTRIBUTION CORRELATION
=======================

Hypothesis Validation from Underground:

HYPOTHESIS 1: [Actor name from Step 1]
| Evidence Type | Finding | Impact on Confidence |
|---------------|---------|---------------------|
| Forum activity | [finding] | [+/-/neutral] |
| Tool correlation | [finding] | [+/-/neutral] |
| Persona match | [finding] | [+/-/neutral] |
| Timeline alignment | [finding] | [+/-/neutral] |
Updated Confidence: [new level]

HYPOTHESIS 2: [Actor name]
| Evidence Type | Finding | Impact on Confidence |
|---------------|---------|---------------------|
| Forum activity | [finding] | [+/-/neutral] |
| Tool correlation | [finding] | [+/-/neutral] |
| Persona match | [finding] | [+/-/neutral] |
| Timeline alignment | [finding] | [+/-/neutral] |
Updated Confidence: [new level]

HYPOTHESIS 3: [Actor name]
| Evidence Type | Finding | Impact on Confidence |
|---------------|---------|---------------------|
| Forum activity | [finding] | [+/-/neutral] |
| Tool correlation | [finding] | [+/-/neutral] |
| Persona match | [finding] | [+/-/neutral] |
| Timeline alignment | [finding] | [+/-/neutral] |
Updated Confidence: [new level]

Key Underground Evidence:
1. [strongest evidence from underground analysis]
2. [second strongest]
3. [third strongest]

Gaps in Underground Coverage:
- [what couldn't be determined from underground sources]
- [additional access/sources that would help]
```

---

## STEP 3 OUTPUT

```markdown
## UNDERGROUND CORRELATION SUMMARY

### Search Coverage
- Forums searched: [count]
- Marketplaces checked: [count]
- Search terms used: [count]
- Matching results found: [count]

### Persona Intelligence
- Primary persona identified: [Y/N]
  - Username: [if found]
  - Platforms active: [list]
  - Activity period: [dates]
- Associated personas: [count]

### Tool/Service Correlation
- Tools matching observed in underground: [Y/N, list]
- Services matching TTPs available: [Y/N, list]
- Infrastructure services correlated: [findings]

### Transaction Intelligence
- Relevant transactions identified: [count]
- Buyer/seller patterns: [summary]
- Timeline correlation: [assessment]

### Hypothesis Update
| Rank | Actor | Previous Confidence | Updated Confidence | Underground Evidence |
|------|-------|--------------------|--------------------|---------------------|
| 1 | [name] | [previous] | [updated] | [key evidence] |
| 2 | [name] | [previous] | [updated] | [key evidence] |
| 3 | [name] | [previous] | [updated] | [key evidence] |

### Key Findings
1. [most significant underground finding]
2. [second most significant]
3. [third most significant]

### Handoff to Open Source (Step 4)
- Social media identifiers to check: [list]
- Public persona correlations to validate: [list]
- Linguistic patterns to match: [description]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] All relevant forums searched
- [ ] Marketplace activity analyzed
- [ ] Persona profiles developed
- [ ] Transaction patterns documented
- [ ] Attribution hypotheses updated with underground evidence
- [ ] Social media identifiers identified for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to open source correlation (Step 4)
**[D] Deep Dive** - Additional underground investigation
**[P] Persona** - Expand persona investigation
**[M] Marketplace** - Additional marketplace analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-opensource-correlation.md`
