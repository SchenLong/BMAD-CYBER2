---
name: 'step-04-opensource-correlation'
description: 'Public persona matching, social network analysis, and linguistic fingerprinting'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-04-opensource-correlation.md'
nextStepFile: '{workflow_path}/steps/step-05-geographic-correlation.md'
prevStepFile: '{workflow_path}/steps/step-03-underground-correlation.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 4: Open Source Correlation

## STEP GOAL

Correlate underground personas and technical indicators with public social media presence, professional profiles, and open source intelligence. Perform linguistic analysis to identify consistent patterns across underground and surface web personas.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and open source persona correlation
- You identify connections between underground and public identities
- You perform linguistic and behavioral pattern analysis

### Analysis Protocol
- Search social platforms for persona correlations
- Analyze writing patterns for consistency
- Identify timeline overlaps between underground and public activity
- Document professional and personal connections
- Maintain awareness of sockpuppet indicators

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Persona Bridge Analysis

Connect underground personas to potential public identities:

```
PERSONA BRIDGE ANALYSIS
=======================

Underground Personas (from Step 3):
| Persona | Platforms | Key Identifiers | Search Leads |
|---------|-----------|-----------------|--------------|
| [name] | [forums] | [email, handles] | [variations to search] |

Search Strategy:
□ Username variations:
  - Exact match: [list]
  - Common variations: [list with patterns like _1, 123, etc]
  - Transliterations: [if non-Latin]
  - Abbreviations: [possible shorts]

□ Email-based searches:
  - Email usernames: [local-part variations]
  - Domain patterns: [if uses custom domain]

□ Unique identifier searches:
  - Unique phrases used: [from underground posts]
  - Technical jargon patterns: [distinctive usage]
  - Error patterns: [consistent typos]
```

### 2. Social Media Platform Search

Search major platforms for matching personas:

```
SOCIAL MEDIA PLATFORM SEARCH
============================

PLATFORM: Twitter/X
Search Terms: [list used]

□ Matching Accounts Found:
| Handle | Display Name | Bio | Followers | Created | Match Confidence |
|--------|--------------|-----|-----------|---------|------------------|
| @[handle] | [name] | [bio summary] | [count] | [date] | [H/M/L] |

□ Account Analysis:
  - Technical focus alignment: [assessment]
  - Posting patterns: [observations]
  - Network connections: [notable follows/followers]
  - Geographic indicators: [timezone, location tags]

PLATFORM: LinkedIn
□ Matching Profiles Found:
| Name | Title | Company | Location | Match Confidence |
|------|-------|---------|----------|------------------|
| [name] | [title] | [company] | [location] | [H/M/L] |

□ Professional correlation:
  - Skills matching threat actor capabilities: [list]
  - Employment history relevance: [observations]
  - Connection network: [notable connections]

PLATFORM: GitHub
□ Matching Accounts Found:
| Username | Real Name | Bio | Repos | Match Confidence |
|----------|-----------|-----|-------|------------------|
| [name] | [if shown] | [bio] | [count] | [H/M/L] |

□ Code repository analysis:
  - Languages used: [list]
  - Projects relevant to TTPs: [list]
  - Contribution patterns: [timing analysis]
  - Collaborators: [notable users]

PLATFORM: Facebook/Instagram
□ Matching Accounts Found:
| Name/Handle | Location | Profile Type | Match Confidence |
|-------------|----------|--------------|------------------|
| [identifier] | [location] | [public/private] | [H/M/L] |

□ Personal information indicators:
  - Location history: [observations]
  - Social connections: [observations]
  - Interests/activities: [observations]

OTHER PLATFORMS: [Telegram, Discord, etc.]
□ Findings:
  - [platform]: [findings]
```

### 3. Linguistic Fingerprinting

Compare writing patterns across platforms:

```
LINGUISTIC FINGERPRINTING
=========================

Writing Sample Comparison:
| Source | Sample Text | Key Patterns |
|--------|-------------|--------------|
| Underground persona | "[sample]" | [patterns noted] |
| Public persona | "[sample]" | [patterns noted] |

Pattern Analysis:
□ Vocabulary patterns:
  - Technical vocabulary consistency: [assessment]
  - Slang usage: [consistent terms]
  - Unique word choices: [distinctive vocabulary]
  - Abbreviation patterns: [consistent abbreviations]

□ Grammar and syntax:
  - Sentence structure patterns: [observations]
  - Punctuation habits: [patterns]
  - Capitalization patterns: [patterns]
  - Common grammatical errors: [consistent mistakes]

□ Stylistic indicators:
  - Emoji usage: [patterns]
  - Formatting preferences: [observations]
  - Response length patterns: [short/long tendencies]
  - Politeness markers: [patterns]

□ Language proficiency indicators:
  - Native language indicators: [assessment]
  - Second language markers: [observations]
  - Translation artifacts: [if present]
  - Regional dialect indicators: [observations]

Similarity Score:
| Comparison Pair | Vocabulary | Grammar | Style | Overall Match |
|-----------------|------------|---------|-------|---------------|
| [underground] vs [public] | [%] | [%] | [%] | [H/M/L] |
```

### 4. Timestamp Correlation

Analyze activity timing across platforms:

```
TIMESTAMP CORRELATION
=====================

Activity Timeline Analysis:
| Platform | Active Hours (UTC) | Peak Days | Activity Gaps |
|----------|-------------------|-----------|---------------|
| Underground forum | [hours] | [days] | [gaps noted] |
| Twitter | [hours] | [days] | [gaps noted] |
| GitHub | [hours] | [days] | [gaps noted] |
| [other] | [hours] | [days] | [gaps noted] |

□ Timezone inference:
  - Consistent active window: [hours UTC]
  - Implied timezone: [timezone with confidence]
  - Working hours pattern: [9-5 or different]

□ Cross-platform activity correlation:
  - Simultaneous activity: [observations]
  - Mutually exclusive patterns: [if underground silent when public active]
  - Event-based correlation: [activity around same events]

□ Notable timing patterns:
  - Response to events: [reactions to news, patches, etc]
  - Campaign timing alignment: [activity around attack dates]
  - Absence patterns: [correlated gaps]
```

### 5. Network and Association Analysis

Map social connections:

```
NETWORK ANALYSIS
================

Public Network Mapping:
□ Professional connections:
  - Colleagues/coworkers: [list]
  - Industry contacts: [list]
  - Conference/event connections: [list]

□ Personal connections:
  - Family indicators: [if public]
  - Friend networks: [if relevant]
  - Location-based connections: [local connections]

□ Technical community involvement:
  - Security community connections: [list]
  - Development community: [list]
  - Underground-to-surface connections: [if people appear in both]

Association Analysis:
| Public Figure | Underground Connection | Evidence |
|---------------|----------------------|----------|
| [public name] | [underground persona] | [connection evidence] |

□ Notable associations:
  - Known threat actors connected: [if any]
  - Security researchers following/connected: [observations]
  - Suspicious account clusters: [sockpuppet indicators]
```

### 6. Attribution Correlation Update

Update hypotheses with open source findings:

```
ATTRIBUTION CORRELATION UPDATE
==============================

Hypothesis Validation from Open Source:

HYPOTHESIS 1: [Actor name]
| Evidence Type | Finding | Impact on Confidence |
|---------------|---------|---------------------|
| Public persona match | [finding] | [+/-/neutral] |
| Linguistic correlation | [finding] | [+/-/neutral] |
| Timestamp alignment | [finding] | [+/-/neutral] |
| Network connections | [finding] | [+/-/neutral] |
Updated Confidence: [new level]

HYPOTHESIS 2: [Actor name]
[Same structure]

HYPOTHESIS 3: [Actor name]
[Same structure]

Key Open Source Evidence:
1. [strongest finding]
2. [second strongest]
3. [third strongest]

Identity Confidence Assessment:
| Level | Description | Current Assessment |
|-------|-------------|-------------------|
| Technical Attribution | Can attribute to technical actor | [confidence] |
| Persona Attribution | Can attribute to specific persona | [confidence] |
| True Identity | Can identify real-world individual | [confidence] |

Open Source Gaps:
- [what couldn't be determined]
- [additional investigation needed]
```

---

## STEP 4 OUTPUT

```markdown
## OPEN SOURCE CORRELATION SUMMARY

### Platform Coverage
- Social platforms searched: [count]
- Code platforms searched: [count]
- Matching accounts found: [count]
- High-confidence matches: [count]

### Persona Correlation
- Underground-to-public persona link: [Y/N]
  - Underground persona: [name]
  - Public persona: [name(s)]
  - Link confidence: [level]

### Linguistic Analysis
- Writing pattern match: [Y/N]
- Language proficiency: [native/fluent/intermediate]
- Regional indicators: [findings]
- Distinctive patterns: [list]

### Timestamp Analysis
- Inferred timezone: [timezone]
- Active hours: [range UTC]
- Cross-platform consistency: [assessment]

### Network Analysis
- Notable connections identified: [count]
- Underground-surface overlap: [findings]
- Potential real identity indicators: [Y/N]

### Hypothesis Update
| Rank | Actor | Previous Confidence | Updated Confidence | Open Source Evidence |
|------|-------|--------------------|--------------------|---------------------|
| 1 | [name] | [previous] | [updated] | [key evidence] |
| 2 | [name] | [previous] | [updated] | [key evidence] |
| 3 | [name] | [previous] | [updated] | [key evidence] |

### Handoff to Geographic (Step 5)
- Location indicators found: [list]
- Timezone confirmation needed: [Y/N]
- Infrastructure locations to correlate: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:
- [ ] All relevant social platforms searched
- [ ] Linguistic analysis performed
- [ ] Timestamp patterns analyzed
- [ ] Network connections mapped
- [ ] Attribution hypotheses updated
- [ ] Geographic indicators identified for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to geographic correlation (Step 5)
**[L] Linguistic** - Deeper linguistic analysis
**[N] Network** - Expand network mapping
**[T] Timeline** - Detailed timeline correlation

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-05-geographic-correlation.md`
