---
name: 'step-02-pivot-mapping'
description: 'Map social footprint and identify pivot points'
estimated_duration: '20-30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-person'
thisStepFile: '{workflow_path}/steps/step-02-pivot-mapping.md'
nextStepFile: '{workflow_path}/steps/step-03-humint-prep.md'
prevStepFile: '{workflow_path}/steps/step-01-requirements.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 2: Identity Pivot Mapping

## STEP GOAL

Map the subject's digital footprint across platforms, identify username patterns, discover linked accounts, and create a comprehensive pivot map that reveals the full scope of their online presence and relationships.

## EXECUTION TIME: ~20-30 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Echo**, Social Media Analyst
- You specialize in digital footprint mapping
- You identify patterns across platforms
- You discover hidden connections through pivot analysis

### Step-Specific Rules

- Start with known selectors from Step 1
- Expand outward systematically
- Document confidence for each discovery
- Map relationships, not just accounts

---

## PIVOT MAPPING SEQUENCE

### 1. Username Enumeration

Check for subject presence across platforms:

```
USERNAME ENUMERATION
====================

Known Handles from Step 1:
- [handle1]
- [handle2]
- [handle3]

Pattern Analysis:
- Base username: [most common pattern]
- Numeric variations: [patterns like handle123, handle_01]
- Alternate spellings: [patterns]
- Professional vs personal: [if different patterns]

Platform Check Matrix:
| Platform | Handle Checked | Found | Profile URL | Active | Notes |
|----------|----------------|-------|-------------|--------|-------|
| LinkedIn | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Twitter/X | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Instagram | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Facebook | [name search] | Y/N | [url] | [Y/N] | [notes] |
| TikTok | [handle] | Y/N | [url] | [Y/N] | [notes] |
| YouTube | [handle] | Y/N | [url] | [Y/N] | [notes] |
| GitHub | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Reddit | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Discord | [handle#] | Y/N | [id] | [Y/N] | [notes] |
| Telegram | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Pinterest | [handle] | Y/N | [url] | [Y/N] | [notes] |
| Snapchat | [handle] | Y/N | - | [Y/N] | [notes] |
| WhatsApp | [phone] | Y/N | - | [Y/N] | [notes] |

Professional Platforms:
| Platform | Found | Profile URL | Notes |
|----------|-------|-------------|-------|
| LinkedIn | Y/N | [url] | [notes] |
| AngelList | Y/N | [url] | [notes] |
| Crunchbase | Y/N | [url] | [notes] |
| Company website | Y/N | [url] | [notes] |
| Industry forums | Y/N | [url] | [notes] |

Niche/Hobby Platforms (based on known interests):
| Platform | Found | Profile URL | Notes |
|----------|-------|-------------|-------|
| [platform] | Y/N | [url] | [notes] |
```

### 2. Email Pivot Analysis

Extract intelligence from email addresses:

```
EMAIL PIVOT ANALYSIS
====================

Known Email Addresses:
| Email | Type | Domain | Provider | Notes |
|-------|------|--------|----------|-------|
| [email] | Personal | [domain] | [Gmail/etc] | [notes] |
| [email] | Work | [domain] | [Corporate] | [notes] |

Email-Based Discoveries:
□ Gravatar check: [result]
□ Have I Been Pwned: [result - breaches only, not password data]
□ GitHub commits: [result]
□ Public key servers: [result]
□ Forum registrations: [result]
□ Review sites: [result]
□ Mailing list archives: [result]

Email Pattern Intelligence:
- Primary email age: [estimate based on first appearance]
- Secondary emails discovered: [list]
- Corporate email format: [first.last@company.com, etc]
```

### 3. Social Graph Mapping

Map relationships and connections:

```
SOCIAL GRAPH MAPPING
====================

Direct Connections (1st Degree):
| Name/Handle | Relationship Type | Platform | Strength | Notes |
|-------------|-------------------|----------|----------|-------|
| [name] | [Family/Friend/Colleague] | [platform] | [High/Med/Low] | [notes] |
| [name] | [relationship] | [platform] | [strength] | [notes] |

Key Relationship Categories:
□ Family members identified: [count]
□ Close friends/associates: [count]
□ Professional colleagues: [count]
□ Business partners: [count]
□ Romantic relationships: [if relevant and observable]

Network Clusters:
Cluster 1: [Description - e.g., "College friends"]
- [member 1]
- [member 2]
- [member 3]

Cluster 2: [Description - e.g., "Current workplace"]
- [member 1]
- [member 2]

Cluster 3: [Description - e.g., "Hobby community"]
- [member 1]
- [member 2]

High-Value Network Nodes:
[People who appear across multiple contexts or have high influence]
| Node | Why High-Value | Pivot Potential |
|------|----------------|-----------------|
| [name] | [reason] | [what they could reveal] |
```

### 4. Content Analysis

Analyze posted content for intelligence:

```
CONTENT ANALYSIS
================

Content Inventory:
| Platform | Post Volume | Date Range | Content Types | Engagement |
|----------|-------------|------------|---------------|------------|
| [platform] | [count] | [range] | [text/image/video] | [high/med/low] |

Themes & Interests:
□ Professional interests: [list]
□ Hobbies/Recreation: [list]
□ Political views: [if observable]
□ Religious/Spiritual: [if observable]
□ Travel patterns: [locations mentioned/shown]
□ Lifestyle indicators: [wealth signals, habits]

Sentiment & Communication Style:
- Tone: [Professional/Casual/Aggressive/Thoughtful]
- Engagement style: [Active commenter/Lurker/Creator]
- Response patterns: [Quick/Slow/Selective]
- Language use: [Formal/Informal/Technical]

Notable Content:
| Date | Platform | Content | Intelligence Value |
|------|----------|---------|-------------------|
| [date] | [platform] | [description] | [what it reveals] |

Content Gaps (Suspicious absences):
- [Time periods with unusual silence]
- [Topics notably avoided]
- [Platforms abandoned]
```

### 5. Timeline Construction

Build activity timeline:

```
ACTIVITY TIMELINE
=================

Account Creation History:
| Platform | First Activity | Last Activity | Status |
|----------|----------------|---------------|--------|
| [platform] | [date] | [date] | [Active/Dormant/Deleted] |

Key Life Events (from social content):
[Date] - [Event] - [Source]
[Date] - [Event] - [Source]
[Date] - [Event] - [Source]

Location Timeline:
| Period | Location | Confidence | Evidence |
|--------|----------|------------|----------|
| [dates] | [location] | [High/Med/Low] | [source] |

Employment Timeline:
| Period | Employer | Role | Source |
|--------|----------|------|--------|
| [dates] | [company] | [title] | [source] |

Relationship Timeline (if relevant):
| Period | Person | Relationship | Evidence |
|--------|--------|--------------|----------|
| [dates] | [name] | [type] | [source] |
```

### 6. Pivot Map Visualization

Create structured pivot map:

```
PIVOT MAP
=========

                           [SUBJECT NAME]
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   [Email 1]               [Phone Number]           [Username]
        │                        │                        │
        ├─ Platform A            ├─ WhatsApp             ├─ Platform X
        ├─ Platform B            └─ Telegram             ├─ Platform Y
        └─ Breaches                                      └─ Platform Z
             │
             └─ [Additional pivots discovered]

PIVOT RELATIONSHIP TABLE:
| Source Selector | Pivot Type | Discovered Selector | Confidence |
|-----------------|------------|---------------------|------------|
| [email] | Registration | [username on platform] | High |
| [username] | Profile link | [other platform] | Medium |
| [phone] | Messaging app | [handle] | High |
| [name] | Search | [professional profile] | Medium |

UNEXPLORED PIVOTS (for future collection):
- [ ] [Pivot not yet followed]
- [ ] [Pivot not yet followed]
```

---

## PIVOT MAPPING OUTPUT

```markdown
## IDENTITY PIVOT MAP SUMMARY

### Subject Identifier Inventory
**Primary Name:** [name]
**Known Aliases:** [count]
**Validated Email Addresses:** [count]
**Validated Phone Numbers:** [count]
**Social Media Accounts:** [count]
**Professional Profiles:** [count]

### Platform Presence Summary
| Platform | Status | Activity Level | Intelligence Value |
|----------|--------|----------------|-------------------|
| LinkedIn | Active | High | [value] |
| Twitter/X | Active | Medium | [value] |
| Instagram | Active | High | [value] |
| [etc] | [status] | [level] | [value] |

### Social Graph Summary
- **1st Degree Connections Mapped:** [count]
- **Key Clusters Identified:** [count]
- **High-Value Nodes:** [count]
- **Network Reach Estimate:** [assessment]

### Key Pivots Discovered
1. [Most significant pivot - what it revealed]
2. [Second pivot - what it revealed]
3. [Third pivot - what it revealed]

### Intelligence Highlights
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

### Pivot Map Confidence
- Overall confidence: [High/Medium/Low]
- Coverage assessment: [Comprehensive/Partial/Limited]
- Key gaps: [what we couldn't find]

### Ready for HUMINT Preparation
Sufficient pivot points identified to inform social engineering approach.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:

- [ ] Username enumeration complete (15+ platforms checked)
- [ ] Email pivot analysis performed
- [ ] Social graph mapped (key relationships identified)
- [ ] Content analysis performed (themes, style, interests)
- [ ] Timeline constructed
- [ ] Pivot map documented

---

## MENU OPTIONS

**[C] Continue** - Proceed to HUMINT preparation (Step 3)
**[D] Deep Dive** - Additional research on specific platform
**[N] Network** - Expand social graph analysis
**[T] Timeline** - Expand timeline detail

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-humint-prep.md`
