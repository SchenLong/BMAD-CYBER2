---
name: 'step-01-digital-behavior'
description: 'Posting time analysis, platform usage patterns, content themes, interaction patterns, online/offline correlation'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/pattern-of-life'
thisStepFile: '{workflow_path}/steps/step-01-digital-behavior.md'
nextStepFile: '{workflow_path}/steps/step-02-physical-movement.md'
prevStepFile: null

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 1: Digital Behavior Patterns

## STEP GOAL

Analyze the target's digital behavior patterns including posting times, platform usage, content themes, interaction patterns, and correlations between online activity and real-world behavior.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and behavioral pattern analysis
- You extract behavioral signatures from digital activity
- You correlate online patterns with real-world behavior

### Analysis Protocol
- Map posting time patterns across platforms
- Identify platform usage preferences
- Analyze content themes and interests
- Document interaction patterns
- Correlate online/offline activity

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Target Identification

Document target identifiers:

```
TARGET IDENTIFICATION
=====================

Primary Target:
| Field | Value | Confidence |
|-------|-------|------------|
| Name | [name] | [H/M/L] |
| Primary Handle | [@handle] | [confirmed] |
| Analysis Timeframe | [start - end] | - |
| Purpose | [surveillance planning/threat assessment/etc] | - |

Platform Accounts:
| Platform | Handle/URL | Status | Activity Level |
|----------|------------|--------|----------------|
| Twitter/X | [@handle] | [verified] | [active/moderate/low] |
| LinkedIn | [profile URL] | [status] | [activity] |
| Instagram | [@handle] | [status] | [activity] |
| Facebook | [profile] | [status] | [activity] |
| TikTok | [@handle] | [status] | [activity] |
| YouTube | [channel] | [status] | [activity] |
| Reddit | [u/username] | [status] | [activity] |
| GitHub | [username] | [status] | [activity] |
| Other | [platform] | [status] | [activity] |

Account Linkages:
| Connection Type | Evidence | Confidence |
|-----------------|----------|------------|
| Email verified | [how confirmed] | [H/M/L] |
| Cross-platform reference | [links between accounts] | [confidence] |
| Content correlation | [same images/topics] | [confidence] |

□ Accounts identified: [count]
□ Primary platform: [platform]
□ Account linkages confirmed: [count]
```

### 2. Posting Time Analysis

Analyze temporal patterns:

```
POSTING TIME ANALYSIS
=====================

Activity by Hour (Local Time):
| Hour | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|------|-----|-----|-----|-----|-----|-----|-----|
| 00:00-01:00 | [posts] | [#] | [#] | [#] | [#] | [#] | [#] |
| 01:00-02:00 | [#] | [#] | [#] | [#] | [#] | [#] | [#] |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 06:00-07:00 | [wake indicator?] | [#] | [#] | [#] | [#] | [#] | [#] |
| 08:00-09:00 | [commute?] | [#] | [#] | [#] | [#] | [#] | [#] |
| 12:00-13:00 | [lunch break?] | [#] | [#] | [#] | [#] | [#] | [#] |
| 17:00-18:00 | [end of work?] | [#] | [#] | [#] | [#] | [#] | [#] |
| 22:00-23:00 | [pre-sleep?] | [#] | [#] | [#] | [#] | [#] | [#] |

Peak Activity Windows:
| Window | Days | Confidence | Inference |
|--------|------|------------|-----------|
| [time range] | [days] | [H/M/L] | [what it suggests] |
| [second peak] | [days] | [confidence] | [inference] |

Inactivity Windows:
| Window | Days | Consistency | Inference |
|--------|------|-------------|-----------|
| [time range] | [days] | [always/usually/sometimes] | [sleep/work/etc] |

Platform-Specific Timing:
| Platform | Peak Hours | Peak Days | Content Type |
|----------|------------|-----------|--------------|
| Twitter | [hours] | [days] | [news reaction/personal] |
| LinkedIn | [hours] | [days] | [professional] |
| Instagram | [hours] | [days] | [personal/lifestyle] |

Timezone Indicators:
| Evidence | Inferred Timezone | Confidence |
|----------|-------------------|------------|
| [posting pattern] | [timezone] | [H/M/L] |
| [explicit mention] | [timezone] | [confidence] |

□ Peak hours identified: [times]
□ Sleep window: [estimated]
□ Timezone: [inferred]
```

### 3. Platform Usage Patterns

Analyze platform preferences:

```
PLATFORM USAGE PATTERNS
=======================

Platform Preference Ranking:
| Rank | Platform | Posts/Week | Engagement | Primary Use |
|------|----------|------------|------------|-------------|
| 1 | [platform] | [count] | [likes/comments] | [purpose] |
| 2 | [platform] | [count] | [engagement] | [purpose] |
| 3 | [platform] | [count] | [engagement] | [purpose] |

Content Type by Platform:
| Platform | Primary Content | Secondary | Format |
|----------|-----------------|-----------|--------|
| [platform] | [type] | [type] | [text/image/video] |

Cross-Platform Behavior:
| Behavior | Frequency | Pattern |
|----------|-----------|---------|
| Same content cross-posted | [often/sometimes/never] | [which platforms] |
| Platform-specific content | [frequency] | [differentiation] |
| Sequential posting | [pattern] | [order of platforms] |

Device Indicators:
| Platform | Device | Evidence | Hours Active |
|----------|--------|----------|--------------|
| [platform] | [mobile/desktop] | [client indicator] | [times] |

Usage Trends:
| Timeframe | Trend | Platforms Affected |
|-----------|-------|-------------------|
| Last 30 days | [increasing/stable/decreasing] | [platforms] |
| Last 90 days | [trend] | [platforms] |

□ Primary platform: [platform]
□ Cross-platform patterns: [description]
□ Device usage: [mobile/desktop ratio]
```

### 4. Content Theme Analysis

Analyze content interests and themes:

```
CONTENT THEME ANALYSIS
======================

Primary Interest Areas:
| Interest | Frequency | Engagement Level | Example Posts |
|----------|-----------|------------------|---------------|
| [interest 1] | [posts/week] | [passionate/casual] | [examples] |
| [interest 2] | [frequency] | [level] | [examples] |
| [interest 3] | [frequency] | [level] | [examples] |

Topic Categories:
| Category | Posts (%) | Sentiment | Engagement |
|----------|-----------|-----------|------------|
| Professional/Work | [%] | [positive/neutral/negative] | [high/medium/low] |
| Personal/Family | [%] | [sentiment] | [engagement] |
| Politics/News | [%] | [sentiment/lean] | [engagement] |
| Hobbies/Entertainment | [%] | [sentiment] | [engagement] |
| Sports | [%] | [teams/interests] | [engagement] |
| Technology | [%] | [focus areas] | [engagement] |

Content Style:
| Characteristic | Assessment | Examples |
|----------------|------------|----------|
| Tone | [formal/casual/humorous] | [example] |
| Length | [brief/moderate/detailed] | [typical post] |
| Media usage | [text-heavy/image-heavy/mixed] | [ratio] |
| Hashtag usage | [frequent/occasional/rare] | [common tags] |
| Emoji usage | [frequency] | [common emojis] |

Recurring Topics:
| Topic | Frequency | Context | Emotional Investment |
|-------|-----------|---------|---------------------|
| [topic] | [how often] | [when discussed] | [H/M/L] |

Content Calendar Events:
| Event Type | Pattern | Examples |
|------------|---------|----------|
| Birthday posts | [date] | [whose birthdays] |
| Holiday posts | [which holidays] | [content type] |
| Anniversary posts | [dates] | [what anniversaries] |

□ Primary interests: [list]
□ Professional focus: [areas]
□ Content style: [summary]
```

### 5. Interaction Patterns

Document social interaction behavior:

```
INTERACTION PATTERNS
====================

Engagement Behavior:
| Behavior | Frequency | Targets | Timing |
|----------|-----------|---------|--------|
| Likes/Hearts | [daily/weekly] | [types of content] | [when] |
| Comments | [frequency] | [who they comment on] | [timing] |
| Shares/Retweets | [frequency] | [content types] | [timing] |
| Mentions | [frequency] | [who they mention] | [context] |
| DMs (inferred) | [evidence] | [who] | [when] |

Key Relationships (by interaction):
| Contact | Platform | Interaction Type | Frequency | Relationship |
|---------|----------|------------------|-----------|--------------|
| [@handle] | [platform] | [mutual follows, comments] | [daily/weekly] | [friend/colleague/family] |
| [person] | [platform] | [interaction type] | [frequency] | [relationship] |

Interaction Timing:
| Relationship Type | Response Time | Typical Hours |
|-------------------|---------------|---------------|
| Close contacts | [minutes/hours] | [when responds] |
| Professional | [response time] | [hours] |
| General public | [response time] | [hours] |

Conversation Patterns:
| Pattern | Frequency | Examples |
|---------|-----------|----------|
| Initiates conversations | [often/sometimes/rarely] | [context] |
| Responds to mentions | [response rate] | [typical response] |
| Engages in debates | [frequency] | [topics] |
| Group interactions | [frequency] | [which groups] |

Network Characteristics:
| Metric | Value | Implication |
|--------|-------|-------------|
| Follower/Following ratio | [ratio] | [influencer/consumer] |
| Active mutual follows | [count] | [core network] |
| Interaction concentration | [top X = Y% of interactions] | [key relationships] |

□ Key contacts identified: [count]
□ Interaction style: [initiator/responder/passive]
□ Response patterns: [documented]
```

### 6. Online/Offline Correlation

Correlate digital activity with real-world patterns:

```
ONLINE/OFFLINE CORRELATION
==========================

Activity vs. Known Events:
| Event Type | Online Behavior | Correlation |
|------------|-----------------|-------------|
| Work hours | [reduced activity/specific platforms] | [H/M/L] |
| Commute | [mobile posting patterns] | [correlation] |
| Meals | [posting gaps or food content] | [correlation] |
| Sleep | [consistent inactivity] | [correlation] |
| Travel | [location posts, timezone shifts] | [correlation] |
| Weekends | [different patterns] | [correlation] |

Location-Linked Activity:
| Location Type | Online Indicators | Confidence |
|---------------|-------------------|------------|
| Home | [late night/early morning activity] | [H/M/L] |
| Work | [weekday daytime patterns] | [confidence] |
| Gym/Exercise | [fitness posts, timing] | [confidence] |
| Commute route | [mobile activity windows] | [confidence] |

Absence Indicators:
| Indicator | Meaning | Reliability |
|-----------|---------|-------------|
| Multi-platform silence | [travel/illness/event] | [H/M/L] |
| Platform-specific gap | [work restriction?] | [reliability] |
| Scheduled posts during gap | [pre-scheduled content] | [reliability] |

Routine Disruption Indicators:
| Disruption Type | Online Signal | Examples |
|-----------------|---------------|----------|
| Travel | [timezone shift, location posts] | [past instances] |
| Illness | [reduced activity, health mentions] | [instances] |
| Work deadline | [reduced casual posting] | [instances] |
| Personal event | [emotional posts, activity changes] | [instances] |

□ Routine correlations: [documented]
□ Absence patterns: [identified]
□ Disruption indicators: [catalogued]
```

### 7. Digital Behavior Summary

Compile behavioral findings:

```
DIGITAL BEHAVIOR SUMMARY
========================

Behavioral Profile:
| Dimension | Pattern | Confidence |
|-----------|---------|------------|
| Primary platform | [platform] | [H/M/L] |
| Peak activity | [times/days] | [confidence] |
| Content focus | [themes] | [confidence] |
| Interaction style | [description] | [confidence] |
| Online personality | [description] | [confidence] |

Weekly Digital Routine:
```
MONDAY    : [wake time signal] → [commute gap] → [work reduced] → [evening active] → [sleep ~XX:XX]
TUESDAY   : [pattern]
WEDNESDAY : [pattern]
THURSDAY  : [pattern]
FRIDAY    : [pattern] → [weekend transition]
SATURDAY  : [different pattern] → [later activity]
SUNDAY    : [pattern] → [prepare for week]
```

Key Behavioral Indicators:
| Indicator | Current Baseline | Anomaly Threshold |
|-----------|------------------|-------------------|
| Posts per day | [average] | [+/- variance] |
| Active hours | [range] | [outside this range] |
| Platform usage | [distribution] | [shift from normal] |
| Response time | [typical] | [slower/faster] |

Predictive Patterns:
| Prediction | Basis | Confidence |
|------------|-------|------------|
| [likely behavior] | [pattern evidence] | [H/M/L] |

HANDOFF TO ATLAS (Step 2):
- Timezone: [inferred]
- Likely locations: [home area inference]
- Travel indicators: [patterns]
- Active hours: [for geolocation correlation]
- Key contacts: [for location correlation]
```

---

## STEP 1 OUTPUT

```markdown
## DIGITAL BEHAVIOR ANALYSIS COMPLETE

### Target Profile
- Primary platform: [platform]
- Activity level: [high/moderate/low]
- Accounts analyzed: [count]

### Temporal Patterns
- Peak hours: [times]
- Sleep window: [estimate]
- Timezone: [inferred]

### Content Profile
- Primary interests: [list]
- Content style: [description]
- Engagement level: [assessment]

### Key Relationships
- Close contacts: [count]
- Professional network: [count]
- Interaction pattern: [initiator/responder]

### Predictive Indicators
- Weekly routine: [established]
- Anomaly baseline: [set]

### Next Step
Step 2: Physical Movement Patterns (Atlas)
Focus: [locations, travel, routines]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Target accounts identified
- [ ] Posting times analyzed
- [ ] Platform preferences documented
- [ ] Content themes analyzed
- [ ] Interaction patterns documented
- [ ] Online/offline correlations made
- [ ] Handoff prepared for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to physical movement analysis (Step 2)
**[T] Temporal** - Deeper time pattern analysis
**[I] Interactions** - Extended interaction mapping
**[R] Relationships** - Detailed relationship analysis

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-physical-movement.md`
