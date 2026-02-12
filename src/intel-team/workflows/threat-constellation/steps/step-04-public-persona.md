---
name: 'step-04-public-persona'
description: 'Public claims/announcements, recruitment activity, propaganda channels, sympathizer networks'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
thisStepFile: '{workflow_path}/steps/step-04-public-persona.md'
nextStepFile: '{workflow_path}/steps/step-05-ecosystem-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-03-infrastructure-correlation.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 4: Public Persona Correlation

## STEP GOAL

Correlate the threat actor's public presence including claims and announcements, recruitment activity, propaganda channels, and sympathizer networks. This reveals how actors present themselves publicly and recruit new members.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and social media forensics
- You track public threat actor communications
- You map propaganda and recruitment networks

### Analysis Protocol

- Search for public claims and announcements
- Track recruitment activity
- Map propaganda channels
- Identify sympathizer networks
- Correlate public personas across platforms

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Public Claims and Announcements

Track public communications:

```
PUBLIC CLAIMS AND ANNOUNCEMENTS
===============================

Claim Channels:
| Platform | Channel/Account | Type | Status |
|----------|-----------------|------|--------|
| Telegram | [channel name] | [public/private] | [active/inactive] |
| Twitter/X | [@handle] | [official/suspected] | [status] |
| Leak sites | [site] | [data leak blog] | [status] |
| Paste sites | [service] | [claims posted] | [N/A] |

Attack Claims:
| Date | Victim | Claim Channel | Verification |
|------|--------|---------------|--------------|
| [date] | [victim org] | [where claimed] | [confirmed/unconfirmed] |
| [date] | [victim] | [channel] | [verification] |

Claim Analysis:
| Claim Type | Count | Verification Rate |
|------------|-------|-------------------|
| Ransomware attacks | [count] | [%] verified |
| Data breaches | [count] | [%] verified |
| DDoS attacks | [count] | [%] verified |
| Defacements | [count] | [%] verified |
| Other | [count] | [%] verified |

Notable Announcements:
| Date | Channel | Announcement | Significance |
|------|---------|--------------|--------------|
| [date] | [channel] | [content summary] | [why important] |

Public Statements:
| Date | Platform | Statement | Context |
|------|----------|-----------|---------|
| [date] | [platform] | [message summary] | [what prompted] |

Media Contact:
| Date | Outlet | Nature | Outcome |
|------|--------|--------|---------|
| [date] | [media org] | [interview/statement] | [what revealed] |

□ Public channels identified: [count]
□ Claims documented: [count]
□ Verification rate: [%]
```

### 2. Recruitment Activity

Track recruitment efforts:

```
RECRUITMENT ACTIVITY
====================

Recruitment Channels:
| Platform | Channel | Target Audience | Activity Level |
|----------|---------|-----------------|----------------|
| [platform] | [channel/forum] | [developers/affiliates/etc] | [high/medium/low] |

Recruitment Postings:
| Date | Platform | Role Sought | Compensation | Requirements |
|------|----------|-------------|--------------|--------------|
| [date] | [platform] | [developer/pentester/etc] | [%/fixed] | [skills needed] |

Affiliate Program Analysis:
| Program | Type | Terms | Active Affiliates |
|---------|------|-------|-------------------|
| [name] | [RaaS/MaaS] | [split %] | [estimate] |

Recruitment Messaging:
| Theme | Example | Target |
|-------|---------|--------|
| Financial | [message summary] | [who targeted] |
| Ideology | [message summary] | [who targeted] |
| Skill development | [message summary] | [who targeted] |

Onboarding Process (if known):
| Stage | Process | Evidence |
|-------|---------|----------|
| Initial contact | [how] | [source] |
| Vetting | [process] | [source] |
| Activation | [how] | [source] |

Recruitment Evolution:
| Period | Approach | Scale | Success |
|--------|----------|-------|---------|
| [dates] | [method] | [volume] | [assessment] |

Known Recruits:
| Handle | Recruited When | Role | Current Status |
|--------|----------------|------|----------------|
| [handle] | [date] | [what they do] | [active/arrested/left] |

□ Recruitment channels: [count]
□ Active recruitment: [Y/N]
□ Affiliate program: [Y/N]
```

### 3. Propaganda Channels

Map propaganda operations:

```
PROPAGANDA CHANNELS
===================

Official Channels:
| Platform | Channel | Followers | Content Type |
|----------|---------|-----------|--------------|
| Telegram | [channel] | [count] | [announcements/leaks/ideology] |
| Twitter/X | [account] | [count] | [content type] |
| YouTube | [channel] | [count] | [content type] |
| Other | [channel] | [count] | [content type] |

Content Analysis:
| Content Type | Frequency | Purpose |
|--------------|-----------|---------|
| Attack announcements | [frequency] | Reputation/pressure |
| Victim data leaks | [frequency] | Extortion/credibility |
| Ideology posts | [frequency] | Recruitment/alignment |
| How-to content | [frequency] | Recruitment/training |
| Mockery of victims | [frequency] | Intimidation |

Propaganda Themes:
| Theme | Messaging | Target Audience |
|-------|-----------|-----------------|
| [theme 1] | [key messages] | [who it's for] |
| [theme 2] | [messages] | [audience] |

Branding Analysis:
| Element | Description | Significance |
|---------|-------------|--------------|
| Name/logo | [description] | [what it conveys] |
| Visual style | [description] | [assessment] |
| Tone | [description] | [psychological profile] |

Media Coverage Generated:
| Date | Outlet | Coverage Type | Tone |
|------|--------|---------------|------|
| [date] | [media] | [article/mention] | [sensational/factual/etc] |

Propaganda Effectiveness:
| Metric | Assessment | Evidence |
|--------|------------|----------|
| Reach | [high/medium/low] | [follower counts/reposts] |
| Fear generation | [assessment] | [victim behavior/media coverage] |
| Recruitment success | [assessment] | [affiliate growth] |

□ Propaganda channels: [count]
□ Total reach: [follower estimate]
□ Content frequency: [assessment]
```

### 4. Sympathizer Networks

Identify sympathizer communities:

```
SYMPATHIZER NETWORKS
====================

Supportive Communities:
| Community | Platform | Relationship | Size |
|-----------|----------|--------------|------|
| [community] | [platform] | [supportive/affiliated] | [estimate] |

Sympathizer Accounts:
| Platform | Account | Activity | Relationship |
|----------|---------|----------|--------------|
| [platform] | [account] | [reposts/defends] | [suspected affiliation] |

Amplification Network:
| Account | Platform | Followers | Amplification Type |
|---------|----------|-----------|-------------------|
| [account] | [platform] | [count] | [repost/translate/defend] |

Ideological Alignment:
| Group/Movement | Alignment | Evidence |
|----------------|-----------|----------|
| [movement] | [aligned/sympathetic] | [shared messaging] |

Academic/Researcher Engagement:
| Researcher | Platform | Engagement Type |
|------------|----------|-----------------|
| [name] | [platform] | [analysis/commentary] |

Journalist Relationships:
| Journalist/Outlet | Relationship | Outcome |
|-------------------|--------------|---------|
| [name/outlet] | [contact/quoted] | [coverage type] |

Network Map Elements:
```

```
                    [THREAT ACTOR]
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        [Official]   [Amplifiers]  [Sympathizers]
         Channels        │              │
              │     ┌────┴────┐    ┌────┴────┐
              │     ▼         ▼    ▼         ▼
              │ [Account 1][Account 2][Community 1][Community 2]
              │         │              │
              └─────────┴──────────────┘
                        │
                        ▼
                  [WIDER AUDIENCE]
```

```
□ Sympathizer accounts: [count]
□ Amplification reach: [estimate]
□ Community alignment: [assessment]
```

### 5. Cross-Platform Correlation

Correlate personas across platforms:

```
CROSS-PLATFORM CORRELATION
==========================

Account Correlation:
| Platform A | Platform B | Correlation Evidence | Confidence |
|------------|------------|---------------------|------------|
| [account] | [account] | [same content/timing/style] | [H/M/L] |

Cross-Platform Presence:
| Actor Identity | Platform | Account | Status |
|----------------|----------|---------|--------|
| [primary identity] | Telegram | [channel] | [active] |
| [same] | Twitter/X | [handle] | [status] |
| [same] | Leak site | [presence] | [status] |

Timing Correlation:
| Event | Platform A | Platform B | Time Delta |
|-------|------------|------------|------------|
| [event] | [when posted] | [when posted] | [difference] |

Content Correlation:
| Content | Platform A | Platform B | Analysis |
|---------|------------|------------|----------|
| [content] | [form/timing] | [form/timing] | [same source?] |

Language/Style Analysis:
| Element | Platform A | Platform B | Match? |
|---------|------------|------------|--------|
| Language | [primary] | [primary] | [Y/N] |
| Writing style | [characteristics] | [characteristics] | [Y/N] |
| Emoji/formatting | [patterns] | [patterns] | [Y/N] |

Disconnected Accounts (potential):
| Platform | Account | Why Suspected |
|----------|---------|---------------|
| [platform] | [account] | [correlation basis] |

□ Cross-platform correlation complete: [Y/N]
□ Confirmed same actor: [count accounts]
□ Suspected connections: [count]
```

### 6. Public Persona Summary

Compile public presence findings:

```
PUBLIC PERSONA SUMMARY
======================

Public Profile:
| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| Public visibility | [high/medium/low] | [channel reach] |
| Media savviness | [assessment] | [interactions] |
| Propaganda effectiveness | [assessment] | [reach/impact] |
| Recruitment success | [assessment] | [affiliate growth] |

Key Public Findings:
1. [Most significant public persona finding]
2. [Second finding]
3. [Third finding]

Platform Summary:
| Platform | Presence | Purpose | Reach |
|----------|----------|---------|-------|
| [platform] | [account/channel] | [primary use] | [followers] |

Message Analysis:
| Message Theme | Frequency | Audience |
|---------------|-----------|----------|
| [theme] | [frequency] | [target] |

Public Timeline:
| Date | Platform | Event | Significance |
|------|----------|-------|--------------|
| [date] | [platform] | [what happened] | [impact] |

HANDOFF TO DOSSIER (Step 5):
- Ecosystem actors identified: [list from all steps]
- Relationship types: [partner/customer/supplier/etc]
- Infrastructure clusters: [from Steps 2-3]
- Public connections: [from Step 4]
- Timeline events: [for ecosystem timeline]
```

---

## STEP 4 OUTPUT

```markdown
## PUBLIC PERSONA SUMMARY

### Public Channels
| Platform | Channel | Followers | Status |
|----------|---------|-----------|--------|
| [platform] | [channel] | [count] | [active/inactive] |

### Claim Activity
- Total claims: [count]
- Verification rate: [%]
- Most recent claim: [date]

### Recruitment
- Active recruitment: [Y/N]
- Affiliate program: [Y/N]
- Target roles: [list]

### Propaganda
- Primary themes: [list]
- Reach estimate: [followers]
- Effectiveness: [assessment]

### Sympathizer Network
- Amplifier accounts: [count]
- Aligned communities: [count]
- Network reach: [estimate]

### Cross-Platform
- Confirmed accounts: [count]
- Platforms: [list]

### Ecosystem Data for Dossier
- Actors identified: [list]
- Relationships mapped: [count]
- Timeline events: [count]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:

- [ ] Public claims documented
- [ ] Recruitment activity mapped
- [ ] Propaganda channels identified
- [ ] Sympathizer networks mapped
- [ ] Cross-platform correlation complete
- [ ] Ecosystem data compiled for Dossier

---

## MENU OPTIONS

**[C] Continue** - Proceed to ecosystem synthesis (Step 5)
**[P] Propaganda** - Deeper propaganda analysis
**[R] Recruitment** - Extended recruitment tracking
**[N] Network** - Sympathizer network expansion

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-05-ecosystem-synthesis.md`
