---
name: 'step-01-behavioral'
description: 'Posting patterns, linguistic fingerprinting, engagement authenticity, network analysis'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/doppelganger-hunt'
thisStepFile: '{workflow_path}/steps/step-01-behavioral.md'
nextStepFile: '{workflow_path}/steps/step-02-technical.md'
prevStepFile: null

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 1: Behavioral Analysis

## STEP GOAL

Analyze the target account's behavioral patterns including posting habits, linguistic characteristics, engagement quality, and network authenticity. Establish initial authenticity indicators based on behavioral signals.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and behavioral pattern analysis
- You identify authentic vs inauthentic account behaviors
- You analyze linguistic patterns and social dynamics

### Analysis Protocol
- Document all behavioral indicators systematically
- Compare against known authentic patterns
- Identify statistical anomalies in behavior
- Assess network authenticity
- Flag suspicious patterns for further investigation

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Account Intake

Document the target account(s):

```
ACCOUNT INTAKE
==============

Target Account:
□ Platform: [Twitter/LinkedIn/Instagram/Facebook/Other]
□ Handle/Username: [@handle or URL]
□ Display Name: [name shown]
□ Profile URL: [full URL]
□ Account Status: [Active/Suspended/Private]

Account Metadata:
| Attribute | Value | Notes |
|-----------|-------|-------|
| Account Created | [date] | [how determined] |
| Followers | [count] | [as of date] |
| Following | [count] | [as of date] |
| Posts/Tweets | [count] | [as of date] |
| Bio | [text] | [notable claims] |
| Location Claimed | [location] | [verification needed] |
| Website | [URL] | [investigation needed] |
| Verified | [Y/N] | [platform verification] |

Investigation Context:
□ Why investigating: [impersonation report/suspicious activity/verification]
□ Claimed identity: [if claiming to be someone]
□ Authentic comparison: [if available, reference account]
□ Related accounts: [other accounts to compare]
```

### 2. Posting Pattern Analysis

Analyze temporal and frequency patterns:

```
POSTING PATTERN ANALYSIS
========================

Activity Overview:
| Metric | Value | Assessment |
|--------|-------|------------|
| Total posts analyzed | [count] | - |
| Date range | [start to end] | - |
| Average posts/day | [avg] | [Normal/Unusual] |
| Maximum posts/day | [max] | [Normal/Unusual] |
| Days with zero posts | [count] | [Pattern?] |

Temporal Patterns:
□ Posting hours (local claimed time):
  | Hour Range | Post % | Notes |
  |------------|--------|-------|
  | 00:00-06:00 | [%] | [night posting?] |
  | 06:00-12:00 | [%] | [morning activity] |
  | 12:00-18:00 | [%] | [afternoon] |
  | 18:00-24:00 | [%] | [evening] |

□ Day of week distribution:
  | Day | Post % | Notes |
  |-----|--------|-------|
  | Monday-Friday | [%] | [work week pattern] |
  | Saturday-Sunday | [%] | [weekend pattern] |

□ Suspicious timing indicators:
  - [ ] Posts at exact intervals (bot indicator)
  - [ ] 24/7 activity (multiple operators or bot)
  - [ ] Sudden activity bursts after dormancy
  - [ ] Timezone inconsistencies

Activity Patterns:
| Pattern | Observation | Red Flag? |
|---------|-------------|-----------|
| Burst posting | [count posts in short period] | [Y/N] |
| Long dormancy | [gaps in activity] | [Y/N] |
| Consistent intervals | [regular timing] | [Y/N] |
| API posting markers | [posted via automation] | [Y/N] |

POSTING PATTERN SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 3. Linguistic Fingerprinting

Analyze language patterns and consistency:

```
LINGUISTIC FINGERPRINTING
=========================

Language Profile:
| Aspect | Observation | Consistency |
|--------|-------------|-------------|
| Primary language | [language] | [Consistent/Variable] |
| Secondary language(s) | [if any] | [Consistent/Variable] |
| Vocabulary level | [Basic/Intermediate/Advanced] | [Consistent/Variable] |
| Technical jargon | [domains] | [Consistent/Variable] |

Writing Style Analysis:
□ Sentence structure:
  - Average length: [short/medium/long]
  - Complexity: [simple/compound/complex]
  - Consistency: [Consistent/Variable]

□ Punctuation habits:
  - Period usage: [pattern]
  - Comma usage: [pattern]
  - Exclamation marks: [frequent/rare]
  - Question marks: [pattern]
  - Emoji usage: [pattern]

□ Capitalization:
  - Style: [Proper/all caps/no caps/Mixed]
  - Consistency: [Consistent/Variable]

□ Distinctive patterns:
  - Unique phrases: [list if any]
  - Repeated expressions: [list]
  - Typo patterns: [consistent errors]
  - Abbreviation style: [patterns]

Content Themes:
| Theme | Frequency | Authenticity Signal |
|-------|-----------|---------------------|
| [topic 1] | [High/Med/Low] | [consistent with claimed identity?] |
| [topic 2] | [High/Med/Low] | [consistent?] |
| [topic 3] | [High/Med/Low] | [consistent?] |

Linguistic Red Flags:
- [ ] Inconsistent language proficiency
- [ ] Translation artifacts
- [ ] Style shifts (multiple authors?)
- [ ] Content doesn't match claimed expertise
- [ ] Generic/templated responses
- [ ] Copied content (plagiarism)

LINGUISTIC SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 4. Engagement Authenticity

Analyze the quality of engagement:

```
ENGAGEMENT AUTHENTICITY ANALYSIS
================================

Outgoing Engagement:
| Metric | Value | Assessment |
|--------|-------|------------|
| Reply rate | [%] | [Normal/Unusual] |
| Quote/retweet rate | [%] | [Normal/Unusual] |
| Original vs reaction | [ratio] | [Normal/Unusual] |

□ Reply quality assessment:
  - [ ] Generic responses ("Great!", "Thanks!")
  - [ ] Substantive discussions
  - [ ] Relevant to original content
  - [ ] Personal/authentic voice

Incoming Engagement:
| Metric | Value | Assessment |
|--------|-------|------------|
| Avg likes per post | [count] | [Normal for follower count?] |
| Avg replies per post | [count] | [Normal?] |
| Avg shares/retweets | [count] | [Normal?] |

□ Engagement quality:
  - [ ] Real conversations in replies
  - [ ] Same accounts always engaging (pod?)
  - [ ] Bot-like engagement patterns
  - [ ] Engagement rate vs follower quality

Conversation Analysis:
| Sample Conversation | Authenticity | Notes |
|---------------------|--------------|-------|
| [conversation 1] | [Authentic/Fake] | [observations] |
| [conversation 2] | [Authentic/Fake] | [observations] |
| [conversation 3] | [Authentic/Fake] | [observations] |

Engagement Red Flags:
- [ ] No real conversations
- [ ] Engagement from suspicious accounts
- [ ] Disproportionate engagement to followers
- [ ] Always same accounts engaging
- [ ] Generic/emoji-only engagement

ENGAGEMENT SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 5. Network Analysis

Analyze follower/following network:

```
NETWORK ANALYSIS
================

Network Overview:
| Metric | Value | Assessment |
|--------|-------|------------|
| Follower count | [count] | - |
| Following count | [count] | - |
| Ratio | [ratio] | [Normal/Unusual] |
| Mutual connections | [count/est.] | - |

Follower Quality Assessment:
□ Sample followers analyzed: [count]

| Quality Tier | % of Followers | Notes |
|--------------|----------------|-------|
| High quality (real, active) | [%] | - |
| Medium quality (real, low activity) | [%] | - |
| Low quality (inactive/empty) | [%] | - |
| Suspicious (bot-like) | [%] | - |

□ Follower red flags:
  - [ ] High % recently created accounts
  - [ ] High % no profile pictures
  - [ ] High % no posts/minimal activity
  - [ ] Geographic inconsistencies
  - [ ] Sequential/similar usernames

Following Analysis:
□ Following patterns:
  - [ ] Follow-back behavior
  - [ ] Industry/topic consistency
  - [ ] Celebrity/influencer following
  - [ ] Following suspicious accounts

Network Growth Pattern:
| Period | Follower Change | Assessment |
|--------|-----------------|------------|
| [month 1] | [+/- count] | [Organic/Suspicious] |
| [month 2] | [+/- count] | [Organic/Suspicious] |
| [month 3] | [+/- count] | [Organic/Suspicious] |

□ Growth red flags:
  - [ ] Sudden large spikes
  - [ ] Purchased follower patterns
  - [ ] Follow/unfollow manipulation
  - [ ] Coordinated following

NETWORK SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 6. Content Originality Check

Verify content authenticity:

```
CONTENT ORIGINALITY CHECK
=========================

Content Type Distribution:
| Type | % of Content | Originality |
|------|--------------|-------------|
| Original text posts | [%] | [Verified original] |
| Shares/retweets | [%] | - |
| Replies | [%] | - |
| Links to external | [%] | - |
| Images/media | [%] | [Original check needed] |

Plagiarism/Copy Check:
| Content Sample | Original Source | Copied? |
|----------------|-----------------|---------|
| "[sample 1]" | [source if found] | [Y/N] |
| "[sample 2]" | [source if found] | [Y/N] |
| "[sample 3]" | [source if found] | [Y/N] |

□ Content originality indicators:
  - [ ] All content appears copied
  - [ ] Mix of original and copied
  - [ ] Primarily original content
  - [ ] Uses content from specific sources

Content Evolution:
□ Has content style/topics evolved over time? [Y/N]
□ Does evolution seem natural? [Y/N]
□ Any abrupt changes suggesting account takeover? [Y/N]

ORIGINALITY SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 7. Behavioral Analysis Summary

Compile behavioral findings:

```
BEHAVIORAL ANALYSIS SUMMARY
===========================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Posting Patterns | [score] | 20% | [weighted] |
| Linguistic | [score] | 25% | [weighted] |
| Engagement | [score] | 20% | [weighted] |
| Network | [score] | 20% | [weighted] |
| Content Originality | [score] | 15% | [weighted] |
| **TOTAL BEHAVIORAL** | - | - | **[total]** |

Key Behavioral Indicators:

AUTHENTIC Signals:
1. [Most convincing authentic indicator]
2. [Second most convincing]
3. [Third most convincing]

FAKE/SUSPICIOUS Signals:
1. [Most concerning fake indicator]
2. [Second most concerning]
3. [Third most concerning]

Preliminary Assessment:
□ Likely Authentic: [Y/N]
□ Likely Fake: [Y/N]
□ Inconclusive: [Y/N]
□ Requires Further Analysis: [Y/N]

Handoff to Probe (Step 2):
- Profile images to analyze: [list]
- Cross-platform accounts to find: [patterns]
- Technical indicators to check: [list]
```

---

## STEP 1 OUTPUT

```markdown
## BEHAVIORAL ANALYSIS SUMMARY

### Account Overview
- Platform: [platform]
- Handle: [handle]
- Created: [date]
- Followers: [count]

### Behavioral Scores
| Category | Score |
|----------|-------|
| Posting Patterns | [X/100] |
| Linguistic | [X/100] |
| Engagement | [X/100] |
| Network Quality | [X/100] |
| Content Originality | [X/100] |
| **BEHAVIORAL TOTAL** | **[X/100]** |

### Key Findings
**Authentic indicators:**
- [List top authentic signals]

**Suspicious indicators:**
- [List top suspicious signals]

### Preliminary Assessment
[Assessment statement]

### Technical Analysis Needed
- Image analysis: [needs]
- Bot detection: [needs]
- Cross-platform: [needs]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Account metadata documented
- [ ] Posting patterns analyzed
- [ ] Linguistic fingerprint created
- [ ] Engagement authenticity assessed
- [ ] Network quality evaluated
- [ ] Content originality checked
- [ ] Behavioral score calculated
- [ ] Technical analysis targets identified

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical fingerprinting (Step 2)
**[D] Deep Dive** - Additional behavioral analysis
**[N] Network** - Expanded network analysis
**[L] Linguistic** - Detailed linguistic analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-technical.md`
