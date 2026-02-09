---
name: 'step-03-communication-patterns'
description: 'Active hours analysis, communication frequency, platform preferences, contact network activity'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/pattern-of-life'
thisStepFile: '{workflow_path}/steps/step-03-communication-patterns.md'
nextStepFile: '{workflow_path}/steps/step-04-operational-assessment.md'
prevStepFile: '{workflow_path}/steps/step-02-physical-movement.md'

# Agent Configuration
executing_agent: sigint-specialist
agent_codename: Sigil
---

# Step 3: Communication Patterns

## STEP GOAL

Analyze the target's communication patterns including active hours, communication frequency, platform preferences, and contact network activity to understand communication behavior and identify collection opportunities.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Sigil**, SIGINT Specialist
- You specialize in communications intelligence and pattern analysis
- You analyze communication timing, frequency, and platform usage
- You map contact networks and identify communication habits

### Analysis Protocol
- Analyze active hours across platforms
- Assess communication frequency and volume
- Document platform preferences for different communication types
- Map contact network activity patterns
- Identify collection opportunities

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Active Hours Analysis

Analyze when target is communicating:

```
ACTIVE HOURS ANALYSIS
=====================

Communication Activity by Hour:
| Hour (Local) | Weekday Activity | Weekend Activity | Platform Distribution |
|--------------|------------------|------------------|----------------------|
| 00:00-01:00 | [level] | [level] | [platforms active] |
| 01:00-02:00 | [level] | [level] | [platforms] |
| ... | ... | ... | ... |
| 07:00-08:00 | [morning activity] | [weekend morning] | [platforms] |
| 08:00-09:00 | [commute activity?] | [level] | [mobile-heavy?] |
| 12:00-13:00 | [lunch activity] | [level] | [platforms] |
| 17:00-18:00 | [end of work] | [level] | [platforms] |
| 21:00-22:00 | [evening peak?] | [level] | [platforms] |
| 23:00-00:00 | [last activity] | [level] | [platforms] |

Peak Communication Windows:
| Window | Days | Activity Level | Primary Platform |
|--------|------|----------------|------------------|
| [time range] | [specific days] | [high/medium] | [platform] |
| [second peak] | [days] | [level] | [platform] |
| [third peak] | [days] | [level] | [platform] |

Low Activity Windows:
| Window | Days | Reason (Inferred) |
|--------|------|-------------------|
| [time range] | [days] | [sleep/work/commute] |
| [window] | [days] | [reason] |

Platform-Specific Active Hours:
| Platform | Peak Hours | Low Hours | Weekend Shift |
|----------|------------|-----------|---------------|
| Email (inferred) | [hours] | [hours] | [different?] |
| Messaging apps | [hours] | [hours] | [shift] |
| Social media | [hours] | [hours] | [shift] |
| Professional platforms | [hours] | [hours] | [weekday only?] |

Device-Based Activity:
| Time Block | Likely Device | Evidence |
|------------|---------------|----------|
| Morning commute | Mobile | [posting patterns] |
| Work hours | Desktop | [platform/client indicators] |
| Evening | [mobile/desktop] | [evidence] |
| Late night | Mobile | [patterns] |

□ Active hours mapped: [Y/N]
□ Peak windows identified: [count]
□ Platform distribution by time: [documented]
```

### 2. Communication Frequency

Analyze communication volume and patterns:

```
COMMUNICATION FREQUENCY
=======================

Overall Communication Volume:
| Metric | Daily Average | Weekly Total | Trend |
|--------|---------------|--------------|-------|
| Posts/tweets | [count] | [count] | [increasing/stable/decreasing] |
| Comments | [count] | [count] | [trend] |
| Likes/reactions | [count] | [count] | [trend] |
| Shares/retweets | [count] | [count] | [trend] |
| Replies received | [count] | [count] | [trend] |

Platform-Specific Volume:
| Platform | Posts/Day | Engagement/Day | Response Rate |
|----------|-----------|----------------|---------------|
| Twitter/X | [count] | [count] | [%] |
| LinkedIn | [count] | [count] | [%] |
| Instagram | [count] | [count] | [%] |
| Facebook | [count] | [count] | [%] |
| Other | [count] | [count] | [%] |

Communication Type Distribution:
| Type | Frequency | Primary Platform | Typical Time |
|------|-----------|------------------|--------------|
| Original content | [X/week] | [platform] | [when] |
| Reactive (replies, retweets) | [X/week] | [platform] | [when] |
| Private messaging (inferred) | [frequency] | [platforms] | [when] |
| Professional communication | [frequency] | [platform] | [hours] |

Burst vs. Steady Patterns:
| Pattern | Frequency | Context |
|---------|-----------|---------|
| Communication bursts | [frequency] | [news events, personal] |
| Steady posting | [baseline] | [normal behavior] |
| Silent periods | [frequency/duration] | [context] |

Response Latency:
| Context | Typical Response Time | Urgency Indicators |
|---------|----------------------|-------------------|
| Direct mentions | [minutes/hours] | [faster for whom?] |
| Comments on posts | [response time] | [selective?] |
| Professional inquiries | [response time] | [patterns] |

□ Volume baseline: [established]
□ Pattern type: [bursty/steady/mixed]
□ Response patterns: [documented]
```

### 3. Platform Preferences

Document platform usage preferences:

```
PLATFORM PREFERENCES
====================

Platform Hierarchy:
| Rank | Platform | Use Case | Frequency | Importance |
|------|----------|----------|-----------|------------|
| 1 | [platform] | [primary use] | [daily/weekly] | [critical] |
| 2 | [platform] | [use case] | [frequency] | [importance] |
| 3 | [platform] | [use case] | [frequency] | [importance] |
| 4 | [platform] | [use case] | [frequency] | [importance] |

Communication Type by Platform:
| Communication Type | Primary Platform | Secondary | Avoided |
|--------------------|------------------|-----------|---------|
| Professional updates | [LinkedIn?] | [Twitter?] | [Instagram?] |
| Personal sharing | [platform] | [platform] | [platform] |
| News/opinions | [platform] | [platform] | [platform] |
| Private messaging | [platform] | [platform] | [platform] |
| Photo sharing | [platform] | [platform] | [platform] |

Audience Segmentation:
| Platform | Apparent Audience | Content Tailoring |
|----------|-------------------|-------------------|
| LinkedIn | Professional network | [formal, career-focused] |
| Twitter | [public/niche community] | [style adaptation] |
| Instagram | [friends/public] | [visual, personal] |
| Facebook | [family/friends] | [personal, events] |

Platform Switching Patterns:
| Scenario | Platform Choice | Evidence |
|----------|-----------------|----------|
| Breaking news reaction | [platform] | [observation] |
| Personal announcement | [platform] | [observation] |
| Professional content | [platform] | [observation] |
| Controversial topic | [platform or silence] | [observation] |

Messaging Platform Indicators:
| Platform | Evidence of Use | Likely Contacts |
|----------|-----------------|-----------------|
| WhatsApp | [mentioned, visible?] | [international?] |
| Signal | [mentioned?] | [privacy-conscious?] |
| Telegram | [mentioned?] | [communities?] |
| iMessage | [device indicators] | [iOS users] |
| Slack/Teams | [work-related] | [professional] |

□ Platform hierarchy: [established]
□ Use cases mapped: [Y/N]
□ Messaging platforms identified: [count]
```

### 4. Contact Network Activity

Map communication network:

```
CONTACT NETWORK ACTIVITY
========================

Primary Contacts (by interaction frequency):
| Contact | Platform | Interaction Type | Frequency | Relationship |
|---------|----------|------------------|-----------|--------------|
| [handle/name] | [platform] | [mutual, one-way] | [daily/weekly] | [inferred] |
| [contact 2] | [platform] | [type] | [frequency] | [relationship] |
| [contact 3] | [platform] | [type] | [frequency] | [relationship] |

Contact Categories:
| Category | Count | Platforms | Interaction Pattern |
|----------|-------|-----------|---------------------|
| Close personal | [count] | [platforms] | [frequent, responsive] |
| Professional peers | [count] | [platforms] | [workday, formal] |
| Family | [count] | [platforms] | [pattern] |
| Acquaintances | [count] | [platforms] | [occasional] |
| Public figures | [count] | [platforms] | [one-way] |

Network Activity Patterns:
| Contact Type | Active Hours | Response Priority |
|--------------|--------------|-------------------|
| Close contacts | [any time] | [immediate] |
| Professional | [work hours] | [same day] |
| Casual | [evening/weekend] | [varied] |

Group Interactions:
| Group/Community | Platform | Participation Level | Topics |
|-----------------|----------|---------------------|--------|
| [group name] | [platform] | [active/lurker] | [topics] |

Communication Flow:
| Direction | Volume | Primary Platforms |
|-----------|--------|-------------------|
| Outgoing (initiates) | [X/day] | [platforms] |
| Incoming (responds) | [X/day] | [platforms] |
| Ratio | [initiator/responder] | - |

Key Relationship Indicators:
| Indicator | Contacts | Significance |
|-----------|----------|--------------|
| Mutual follows | [list] | Close/peer relationship |
| Regular replies | [list] | Active relationship |
| Tagged together | [list] | Real-world connection |
| Mentioned in posts | [list] | Important to target |

□ Primary contacts: [count]
□ Network structure: [tight/diverse/mixed]
□ Key relationships: [identified]
```

### 5. Communication Security Posture

Assess communication security habits:

```
COMMUNICATION SECURITY POSTURE
==============================

Privacy Indicators:
| Indicator | Status | Evidence |
|-----------|--------|----------|
| Private accounts | [which platforms] | [locked/open] |
| Limited sharing | [Y/N] | [evidence] |
| Selective connections | [Y/N] | [follow patterns] |
| Location disabled | [which platforms] | [observation] |

Encryption Usage:
| Platform | Encrypted | Evidence | Implication |
|----------|-----------|----------|-------------|
| Signal | [Y/N/Unknown] | [mentioned?] | [security conscious] |
| WhatsApp | [Y/N] | [used?] | [standard encryption] |
| Telegram | [Y/N] | [secret chats mentioned?] | [varies] |
| Email | [PGP/S-MIME?] | [evidence] | [high security?] |

Security Behaviors:
| Behavior | Observed | Frequency |
|----------|----------|-----------|
| Uses encrypted messaging | [Y/N] | [always/sometimes] |
| Avoids sensitive topics publicly | [Y/N] | [patterns] |
| Uses VPN | [Y/N] | [indicators] |
| Multi-device usage | [Y/N] | [sync indicators] |

OPSEC Vulnerabilities:
| Vulnerability | Evidence | Exploitation Vector |
|---------------|----------|---------------------|
| Predictable timing | [patterns] | [surveillance timing] |
| Open accounts | [platforms] | [OSINT collection] |
| Location sharing | [frequency] | [physical surveillance] |
| Cross-platform linking | [evidence] | [identity correlation] |

Communication Collection Opportunities:
| Opportunity | Platform | Feasibility | Value |
|-------------|----------|-------------|-------|
| Public monitoring | [platforms] | [easy] | [content access] |
| Network mapping | [platforms] | [feasibility] | [relationship intel] |
| Timing analysis | [all] | [easy] | [behavioral patterns] |

□ Security posture: [high/medium/low]
□ Vulnerabilities identified: [count]
□ Collection opportunities: [count]
```

### 6. Communication Pattern Summary

Compile communication findings:

```
COMMUNICATION PATTERN SUMMARY
=============================

Communication Profile:
| Dimension | Pattern | Confidence |
|-----------|---------|------------|
| Activity level | [high/medium/low volume] | [H/M/L] |
| Peak hours | [times] | [confidence] |
| Primary platform | [platform] | [confidence] |
| Communication style | [initiator/responder/mixed] | [confidence] |

Daily Communication Routine:
```
TYPICAL WEEKDAY:
Morning (7-9):   [first check, platform, device]
Work hours (9-17): [limited personal, professional platforms]
Lunch (12-13):   [personal check-in, platform]
Evening (18-22): [peak personal activity, platforms]
Night (22+):     [last activity, device]

TYPICAL WEEKEND:
Morning:         [later start, different pattern]
Afternoon:       [varied activity]
Evening:         [social activity, platforms]
```

Network Characteristics:
| Characteristic | Assessment |
|----------------|------------|
| Network size | [large/medium/small] |
| Network density | [tight-knit/diverse] |
| Key contacts | [count] |
| Professional/personal mix | [ratio] |

Communication Security:
| Aspect | Assessment |
|--------|------------|
| Privacy practices | [strong/moderate/weak] |
| Encryption usage | [frequent/occasional/rare] |
| OPSEC vulnerabilities | [few/some/many] |

HANDOFF TO SPECTER (Step 4):
- Peak activity hours: [times for surveillance timing]
- Communication patterns: [predictable behaviors]
- Key contacts: [for surveillance network]
- Vulnerabilities: [OPSEC gaps]
- Platform patterns: [for monitoring]
- Location correlation: [from Steps 1-2]
```

---

## STEP 3 OUTPUT

```markdown
## COMMUNICATION PATTERN ANALYSIS COMPLETE

### Activity Profile
- Peak hours: [times]
- Primary platform: [platform]
- Volume: [high/medium/low]

### Communication Style
- Pattern: [initiator/responder]
- Response time: [typical]
- Frequency: [posts/day]

### Network Summary
- Primary contacts: [count]
- Network type: [tight/diverse]
- Key relationships: [identified]

### Security Posture
- Privacy: [strong/moderate/weak]
- Encryption: [usage level]
- Vulnerabilities: [count]

### Collection Opportunities
- [Opportunity 1]
- [Opportunity 2]

### Next Step
Step 4: Operational Assessment (Specter)
Focus: [vulnerabilities, windows, approach opportunities]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Active hours analyzed
- [ ] Communication frequency documented
- [ ] Platform preferences mapped
- [ ] Contact network analyzed
- [ ] Security posture assessed
- [ ] Collection opportunities identified
- [ ] Handoff prepared for Specter

---

## MENU OPTIONS

**[C] Continue** - Proceed to operational assessment (Step 4)
**[N] Network** - Deeper network analysis
**[S] Security** - Extended security assessment
**[T] Timing** - Detailed timing analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-operational-assessment.md`
