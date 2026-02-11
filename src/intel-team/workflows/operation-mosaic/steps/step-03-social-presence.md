---
name: 'step-03-social-presence'
description: 'Platform enumeration, account correlation, network mapping, content analysis'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-03-social-presence.md'
nextStepFile: '{workflow_path}/steps/step-04-dark-web-exposure.md'
prevStepFile: '{workflow_path}/steps/step-02-digital-footprint.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 3: Social Presence (Phase 2b)

## STEP GOAL

Enumerate all social media presence, correlate accounts across platforms, map social networks and connections, and analyze content for intelligence value. Build comprehensive social intelligence picture.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT across all platforms
- You correlate identities and map social networks
- You analyze content for behavioral and intelligence insights

### Collection Protocol

- Enumerate accounts across all major platforms
- Correlate accounts to confirm same identity
- Map follower/following networks
- Analyze content themes and patterns
- Identify key connections and relationships
- Extract location and temporal data for Atlas

---

## COLLECTION EXECUTION SEQUENCE

### 1. Platform Enumeration

Search all major platforms:

```
PLATFORM ENUMERATION
====================

Target Identifiers for Search:
- Name: [full name]
- Username patterns: [known handles]
- Email: [email addresses]
- Phone: [if available]
- Company: [if applicable]

Platform Search Results:
| Platform | Handle/URL | Verified | Followers | Status |
|----------|------------|----------|-----------|--------|
| Twitter/X | [@handle] | [Y/N] | [count] | [active/inactive] |
| LinkedIn | [url] | [Y/N] | [connections] | [status] |
| Facebook | [url/name] | [Y/N] | [friends] | [status] |
| Instagram | [@handle] | [Y/N] | [count] | [status] |
| TikTok | [@handle] | [Y/N] | [count] | [status] |
| YouTube | [channel] | [Y/N] | [subs] | [status] |
| Reddit | [u/username] | [N/A] | [karma] | [status] |
| GitHub | [username] | [N/A] | [repos] | [status] |
| Medium | [@handle] | [N/A] | [followers] | [status] |
| Substack | [url] | [N/A] | [subs] | [status] |
| Discord | [if found] | [N/A] | [servers] | [status] |
| Telegram | [if found] | [N/A] | [channels] | [status] |
| Other | [platform] | [Y/N] | [metric] | [status] |

Username Variation Search:
| Variation | Platforms Found |
|-----------|-----------------|
| [variation 1] | [platforms] |
| [variation 2] | [platforms] |
| [variation 3] | [platforms] |

□ Platform enumeration complete: [Y/N]
□ Total accounts found: [count]
□ Confidence all found: [H/M/L]
```

### 2. Account Correlation

Confirm accounts belong to same entity:

```
ACCOUNT CORRELATION
===================

Correlation Indicators:
| Platform A | Platform B | Correlation Evidence | Confidence |
|------------|------------|---------------------|------------|
| [platform] | [platform] | [same photo/bio/links] | [H/M/L] |
| [platform] | [platform] | [cross-references] | [H/M/L] |

Photo Correlation:
| Photo | Platforms Used | Same Person |
|-------|----------------|-------------|
| [profile photo] | [platforms] | [Y/N/Likely] |
| [other photo] | [platforms] | [Y/N/Likely] |

Bio/About Correlation:
| Element | Platforms | Consistent |
|---------|-----------|------------|
| Name | [platforms] | [Y/N/Partial] |
| Location | [platforms] | [Y/N/Partial] |
| Job title | [platforms] | [Y/N/Partial] |
| Website | [platforms] | [Y/N/Partial] |
| Bio text | [platforms] | [similarity %] |

Cross-Platform References:
| From Platform | References To | Type |
|---------------|---------------|------|
| [platform] | [other platform] | [link/mention] |

Confirmed Account Cluster:
| Account | Platform | Confidence |
|---------|----------|------------|
| [handle] | [platform] | [H/M/L] |
| [handle] | [platform] | [H/M/L] |

Uncertain/Possible Accounts:
| Account | Platform | Evidence | Assessment |
|---------|----------|----------|------------|
| [handle] | [platform] | [weak evidence] | [further investigation needed] |
```

### 3. Network Mapping

Map social connections:

```
NETWORK MAPPING
===============

Key Connections (High-Value):
| Name/Handle | Platform | Relationship | Notes |
|-------------|----------|--------------|-------|
| [connection 1] | [platform] | [type: colleague/friend/family] | [significance] |
| [connection 2] | [platform] | [type] | [significance] |
| [connection 3] | [platform] | [type] | [significance] |

Professional Network:
| Connection | Role/Company | Relationship | Platform |
|------------|--------------|--------------|----------|
| [person] | [title at company] | [colleague/manager/etc] | [LinkedIn] |
| [person] | [role] | [relationship] | [platform] |

Personal Network:
| Connection | Apparent Relationship | Evidence |
|------------|----------------------|----------|
| [person] | [family/friend/partner] | [photos/tags/mentions] |

Organizational Affiliations:
| Organization | Role | Active | Platform |
|--------------|------|--------|----------|
| [org/group] | [member/admin] | [Y/N] | [platform] |
| [org/group] | [role] | [Y/N] | [platform] |

Mutual Connection Clusters:
| Cluster Theme | Key Members | Significance |
|---------------|-------------|--------------|
| [work] | [people] | [same company] |
| [industry] | [people] | [professional community] |
| [personal] | [people] | [friend group] |

Network Statistics:
| Platform | Followers | Following | Engagement Rate |
|----------|-----------|-----------|-----------------|
| [platform] | [count] | [count] | [if calculable] |

□ Key connections identified: [count]
□ Network clusters mapped: [count]
□ High-value connections: [count]
```

### 4. Content Analysis

Analyze posted content:

```
CONTENT ANALYSIS
================

Content Volume:
| Platform | Total Posts | Date Range | Avg/Period |
|----------|-------------|------------|------------|
| [platform] | [count] | [dates] | [avg/day or week] |

Content Themes:
| Theme | Frequency | Examples | Notes |
|-------|-----------|----------|-------|
| [topic 1] | [high/med/low] | [example posts] | [analysis] |
| [topic 2] | [frequency] | [examples] | [notes] |
| [topic 3] | [frequency] | [examples] | [notes] |

Sentiment Analysis:
| Theme/Topic | Sentiment | Evidence |
|-------------|-----------|----------|
| [topic] | [positive/negative/neutral] | [example] |
| [topic] | [sentiment] | [evidence] |

Professional Content:
| Topic | Platform | Frequency | Expertise Level |
|-------|----------|-----------|-----------------|
| [industry topic] | [platform] | [count] | [thought leader/participant] |

Personal Interests Revealed:
| Interest | Evidence | Frequency |
|----------|----------|-----------|
| [hobby/interest] | [posts about] | [regular/occasional] |

Controversial/Notable Content:
| Date | Platform | Content | Significance |
|------|----------|---------|--------------|
| [date] | [platform] | [summary] | [why notable] |

Writing Style Analysis:
| Characteristic | Observation |
|----------------|-------------|
| Tone | [professional/casual/mix] |
| Length | [verbose/concise] |
| Emoji use | [frequent/rare/none] |
| Hashtag use | [pattern] |
| Language | [primary/secondary] |

□ Content themes identified: [count]
□ Key posts documented: [count]
□ Behavioral patterns noted: [Y/N]
```

### 5. Temporal & Location Extraction

Extract time and location data:

```
TEMPORAL & LOCATION EXTRACTION
==============================

Activity Timeline:
| Platform | First Post | Last Post | Active Days | Gaps |
|----------|------------|-----------|-------------|------|
| [platform] | [date] | [date] | [pattern] | [notable gaps] |

Posting Time Patterns:
| Platform | Peak Hours (Local) | Peak Days | Timezone Indicated |
|----------|-------------------|-----------|-------------------|
| [platform] | [hours] | [days] | [TZ] |

Location References:
| Type | Location | Source | Date |
|------|----------|--------|------|
| Check-in | [location] | [platform] | [date] |
| Geo-tag | [coordinates] | [photo] | [date] |
| Mention | [location] | [post] | [date] |
| Event | [location] | [platform] | [date] |

Travel Patterns:
| Date | Destination | Evidence | Duration |
|------|-------------|----------|----------|
| [date] | [location] | [posts/photos] | [if known] |

Regular Locations:
| Location Type | Location | Frequency |
|---------------|----------|-----------|
| Home area | [location] | [indicated by] |
| Work area | [location] | [indicated by] |
| Regular visits | [location] | [evidence] |

Photos with Location Potential:
| Platform | Photo ID | Visual Cues | For Atlas |
|----------|----------|-------------|-----------|
| [platform] | [id/url] | [landmarks/signs] | [Y/N] |

□ Location data extracted: [count items]
□ Timezone indicated: [TZ]
□ Travel pattern identified: [Y/N]
```

### 6. Social Intelligence Summary

Compile SOCMINT findings:

```
SOCIAL INTELLIGENCE SUMMARY
===========================

Account Overview:
| Metric | Value |
|--------|-------|
| Total accounts confirmed | [count] |
| Primary platform | [platform] |
| Total reach/followers | [combined] |
| Activity level | [high/medium/low] |

Key Findings:
1. [Most significant social intelligence finding]
2. [Second finding]
3. [Third finding]

Network Intelligence:
- Key professional connections: [summary]
- Personal network: [summary]
- Organizational affiliations: [summary]
- Influence level: [assessment]

Behavioral Profile:
- Primary interests: [list]
- Communication style: [summary]
- Online activity pattern: [summary]
- Sentiment/opinions: [summary]

Location Intelligence (for Atlas):
| Data Type | Value | Confidence |
|-----------|-------|------------|
| Likely home location | [location] | [H/M/L] |
| Work location | [location] | [H/M/L] |
| Recent travel | [locations] | [H/M/L] |
| Timezone | [TZ] | [H/M/L] |

Handoffs for Other Agents:
| Agent | Data Provided |
|-------|---------------|
| Shadow | [emails/usernames for breach search] |
| Proxy | [company affiliations, job history] |
| Atlas | [location data, photos for geolocation] |
| Viper | [personality insights, approach vectors] |
| Dossier | [network for threat correlation] |
```

---

## STEP 3 OUTPUT

```markdown
## SOCIAL PRESENCE SUMMARY

### Account Inventory
| Platform | Handle | Followers | Status |
|----------|--------|-----------|--------|
| [platform] | [handle] | [count] | [active] |

### Key Connections
- Professional: [top connections]
- Personal: [if identified]
- Organizations: [affiliations]

### Content Profile
- Primary themes: [topics]
- Activity level: [assessment]
- Influence: [assessment]

### Location Data for Atlas
- Indicated location: [location]
- Timezone: [TZ]
- Photos for geolocation: [count]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Approach Vectors for Viper
- Interests: [for rapport building]
- Communication preferences: [platform/style]
- Network access points: [key connections]
```

---

## COMPLETION CRITERIA

Before proceeding:

- [ ] All platforms searched
- [ ] Accounts correlated
- [ ] Network mapped
- [ ] Content analyzed
- [ ] Location data extracted
- [ ] Handoff data prepared for other agents

---

## PARALLEL EXECUTION NOTE

This step (3) can run in parallel with Steps 2, 4-6. Share findings as they become available.

---

## MENU OPTIONS

**[C] Continue** - Proceed to dark web exposure (Step 4)
**[N] Network** - Deeper network analysis
**[C] Content** - Extended content analysis
**[P] Platform** - Additional platform search

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-dark-web-exposure.md`
