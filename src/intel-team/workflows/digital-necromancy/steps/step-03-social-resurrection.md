---
name: 'step-03-social-resurrection'
description: 'Deleted post recovery, account name history, archived profiles, screenshot archives'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/digital-necromancy'
thisStepFile: '{workflow_path}/steps/step-03-social-resurrection.md'
nextStepFile: '{workflow_path}/steps/step-04-historical-location.md'
prevStepFile: '{workflow_path}/steps/step-02-technical-archaeology.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 3: Social Media Resurrection

## STEP GOAL

Recover deleted social media content, trace account name history, retrieve archived profiles, and search screenshot archives to reconstruct the target's deleted or hidden social media presence.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and social media forensics
- You recover deleted posts, profiles, and social history
- You trace username pivots and account evolution

### Analysis Protocol

- Search all available social media archives
- Trace username/handle changes across platforms
- Recover deleted posts from cache and mirror services
- Search screenshot archives and third-party captures
- Map account evolution and pivots over time
- Correlate with findings from Steps 1-2

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Platform Inventory & Archive Search

Map known and potential platforms:

```
PLATFORM INVENTORY & ARCHIVE SEARCH
===================================

Known Platform Presence (from Steps 1-2):
| Platform | Username | Status | Evidence Source |
|----------|----------|--------|-----------------|
| [platform] | [handle] | [active/deleted/unknown] | [breach/wayback/etc] |
| [platform] | [handle] | [status] | [source] |

Archive Services to Search:
| Service | URL | Coverage | Status |
|---------|-----|----------|--------|
| Wayback Machine | web.archive.org | General web | [searched] |
| Archive.today | archive.ph | Snapshots | [searched] |
| Google Cache | cache:url | Recent | [searched] |
| Bing Cache | Bing search | Recent | [searched] |
| Snapchat Memories | N/A | User-only | [N/A] |
| Twitter Archive | archive.org twitter | Historical | [searched] |

Platform-Specific Archives:
| Platform | Archive Service | Coverage | Results |
|----------|-----------------|----------|---------|
| Twitter/X | Politwoops, archive.org | Political deletes | [results] |
| Instagram | archive.org, storysaver | Limited | [results] |
| Facebook | archive.org | Limited | [results] |
| LinkedIn | archive.org | Professional | [results] |
| Reddit | Pushshift, Unddit | Full archive | [results] |
| YouTube | archive.org, third-party | Videos/channels | [results] |
| TikTok | archive.org | Limited | [results] |

□ Archive search status:
  - [ ] All major archive services searched
  - [ ] Platform-specific archives checked
  - [ ] Third-party mirrors identified
  - [ ] Screenshot services searched
```

### 2. Deleted Post Recovery

Recover deleted content:

```
DELETED POST RECOVERY
=====================

Twitter/X Deleted Content:
| Date | Original URL | Content | Recovery Source |
|------|--------------|---------|-----------------|
| [date] | [url] | [tweet text/media] | [archive/cache] |
| [date] | [url] | [content] | [source] |

Deleted Thread Recovery:
| Date | Thread Topic | Posts Recovered | Gaps |
|------|--------------|-----------------|------|
| [date] | [topic] | [count] | [missing posts] |

Instagram Deleted Content:
| Date | Type | Content Description | Recovery Source |
|------|------|---------------------|-----------------|
| [date] | [post/story/reel] | [description] | [source] |

Reddit Deleted Content:
| Date | Subreddit | Title | Content | Source |
|------|-----------|-------|---------|--------|
| [date] | [subreddit] | [title] | [text/link] | [pushshift/unddit] |

Facebook Deleted Content:
| Date | Type | Content | Recovery Source |
|------|------|---------|-----------------|
| [date] | [post/photo/etc] | [description] | [source] |

YouTube Deleted Content:
| Date | Type | Title | Duration | Recovery |
|------|------|-------|----------|----------|
| [date] | [video/comment] | [title] | [length] | [archive/reupload] |

Other Platform Deletions:
| Platform | Date | Content Type | Description | Source |
|----------|------|--------------|-------------|--------|
| [platform] | [date] | [type] | [description] | [recovery source] |

Content Analysis:
| Post | Topics | Sentiment | Why Deleted (Hypothesis) |
|------|--------|-----------|-------------------------|
| [post] | [topics] | [tone] | [embarrassing/controversial/etc] |

DELETED POST RECOVERY SCORE: [0-100]
```

### 3. Account Name History Tracing

Track username evolution:

```
ACCOUNT NAME HISTORY TRACING
============================

Username Evolution Timeline:
| Platform | Date Range | Username | Evidence |
|----------|------------|----------|----------|
| [platform] | [earliest - date] | [original handle] | [breach/archive] |
| [platform] | [date - date] | [changed to] | [archive capture] |
| [platform] | [date - present] | [current/deleted] | [source] |

Cross-Platform Username Correlation:
| Username | Platforms Found | Date Range | Confidence |
|----------|-----------------|------------|------------|
| [username1] | [platform list] | [dates] | [H/M/L] |
| [username2] | [platform list] | [dates] | [H/M/L] |

Username Pattern Analysis:
| Pattern | Examples | Interpretation |
|---------|----------|----------------|
| [pattern type] | [usernames fitting] | [what it reveals] |

WhatsMyName/Namechk Results:
| Username | Platforms Claimed | Active | Notes |
|----------|-------------------|--------|-------|
| [username] | [platforms] | [Y/N] | [findings] |

Abandoned Account Discovery:
| Platform | Username | Last Active | Content Status |
|----------|----------|-------------|----------------|
| [platform] | [handle] | [date] | [archived/deleted] |

Username Reuse Detection:
| Username | Original Owner | Current Owner | Platform |
|----------|----------------|---------------|----------|
| [username] | [target?] | [who now] | [platform] |

□ Username history findings:
  - [ ] Full username evolution mapped
  - [ ] Cross-platform correlation complete
  - [ ] Abandoned accounts identified
  - [ ] Username pattern analyzed
  - [ ] Current claimants identified

USERNAME HISTORY SCORE: [0-100]
```

### 4. Archived Profile Retrieval

Recover profile snapshots:

```
ARCHIVED PROFILE RETRIEVAL
==========================

Profile Archive Captures:
| Platform | Username | Archive Date | URL | Key Info |
|----------|----------|--------------|-----|----------|
| [platform] | [handle] | [date] | [archive url] | [bio/photo/etc] |

Profile Evolution:
| Platform | Date | Bio Text | Profile Photo | Links |
|----------|------|----------|---------------|-------|
| [platform] | [date] | [bio] | [description/saved] | [website/other] |
| [platform] | [date change] | [new bio] | [new photo] | [new links] |

Profile Photo History:
| Date | Platform | Photo Description | Saved | Notes |
|------|----------|-------------------|-------|-------|
| [date] | [platform] | [description] | [Y/N] | [same as other?] |

Bio/About Section Evolution:
| Date | Platform | Bio Content | Claims Made |
|------|----------|-------------|-------------|
| [date] | [platform] | [text] | [job/location/etc] |

Follower/Following Snapshots:
| Date | Platform | Followers | Following | Notable Connections |
|------|----------|-----------|-----------|---------------------|
| [date] | [platform] | [count] | [count] | [significant follows] |

Verification Status History:
| Platform | Date | Verified | Notes |
|----------|------|----------|-------|
| [platform] | [date range] | [Y/N] | [gained/lost verification] |

□ Profile archaeology findings:
  - [ ] Profile evolution documented
  - [ ] Bio changes tracked
  - [ ] Photo history compiled
  - [ ] Network snapshots captured
  - [ ] Verification history noted

PROFILE RECOVERY SCORE: [0-100]
```

### 5. Screenshot Archive Search

Search visual captures:

```
SCREENSHOT ARCHIVE SEARCH
=========================

Screenshot Sources Searched:
| Source | Query | Results |
|--------|-------|---------|
| Archive.today | [url/handle] | [captures found] |
| Web Archive (screenshot mode) | [url] | [results] |
| Social media archive sites | [handle] | [results] |
| News article screenshots | [name/handle] | [results] |
| Research/report captures | [identifier] | [results] |

Screenshots Recovered:
| Date | Source | Content | Quality | Significance |
|------|--------|---------|---------|--------------|
| [date] | [where found] | [what it shows] | [readable?] | [importance] |
| [date] | [source] | [content] | [quality] | [significance] |

Video Archive Search:
| Platform | Query | Results | Content |
|----------|-------|---------|---------|
| YouTube | [name/handle] | [videos found] | [interviews/mentions] |
| Vimeo | [query] | [results] | [content] |
| TikTok archives | [query] | [results] | [content] |
| Twitch clips | [query] | [results] | [content] |

News/Media Mentions with Screenshots:
| Date | Publication | Article | Screenshots | Content |
|------|-------------|---------|-------------|---------|
| [date] | [outlet] | [title] | [included?] | [what shown] |

Third-Party Documentation:
| Source | Date | Type | Content | Relevance |
|--------|------|------|---------|-----------|
| [source] | [date] | [blog/report/etc] | [description] | [importance] |

□ Screenshot archive findings:
  - [ ] Visual captures recovered
  - [ ] Video mentions found
  - [ ] News screenshots located
  - [ ] Third-party documentation discovered
  - [ ] Quality sufficient for evidence

SCREENSHOT RECOVERY SCORE: [0-100]
```

### 6. Third-Party Mirror Discovery

Find content mirrors and reposts:

```
THIRD-PARTY MIRROR DISCOVERY
============================

Content Mirrors Found:
| Original | Mirror Location | Type | Date | Content Preserved |
|----------|-----------------|------|------|-------------------|
| [original url] | [mirror url] | [archive/repost] | [date] | [what's preserved] |

Repost/Quote Tracking:
| Platform | User Who Reposted | Date | Original Content |
|----------|-------------------|------|------------------|
| [platform] | [username] | [date] | [what they quoted/shared] |

Embedded Content:
| Embedding Site | Original Source | Date | Content Type |
|----------------|-----------------|------|--------------|
| [site] | [original platform] | [date] | [tweet/post/etc] |

Discussion/Commentary:
| Platform | Thread/Post | Date | Original Referenced |
|----------|-------------|------|---------------------|
| Reddit | [thread] | [date] | [target's content] |
| Forum | [thread] | [date] | [what was discussed] |
| Blog | [post] | [date] | [commentary on target] |

Aggregator Sites:
| Aggregator | Content Type | Results |
|------------|--------------|---------|
| [site] | [type] | [findings] |

□ Mirror discovery findings:
  - [ ] Direct mirrors located
  - [ ] Reposts/quotes found
  - [ ] Embedded content recovered
  - [ ] Commentary threads identified
  - [ ] Aggregator content checked

MIRROR DISCOVERY SCORE: [0-100]
```

### 7. Social Media Resurrection Summary

Compile social findings:

```
SOCIAL MEDIA RESURRECTION SUMMARY
=================================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Deleted Posts | [score] | 30% | [weighted] |
| Username History | [score] | 20% | [weighted] |
| Profile Archives | [score] | 20% | [weighted] |
| Screenshot Archives | [score] | 15% | [weighted] |
| Third-Party Mirrors | [score] | 15% | [weighted] |
| **TOTAL SOCIAL** | - | - | **[total]** |

Social Timeline:
| Date | Platform | Event | Evidence |
|------|----------|-------|----------|
| [earliest] | [platform] | [first presence] | [source] |
| [date] | [platform] | [post/change/etc] | [source] |
| [date] | [platform] | [deletion/pivot] | [source] |
| [latest] | [platform] | [last known] | [source] |

Username Evolution Summary:
| Period | Primary Username | Platforms | Notes |
|--------|------------------|-----------|-------|
| [dates] | [username] | [platforms] | [context] |
| [dates] | [new username] | [platforms] | [why changed?] |

Key Social Recoveries:
1. [Most significant social recovery]
2. [Second most significant]
3. [Third most significant]

Content Analysis:
| Theme | Posts Recovered | Significance |
|-------|-----------------|--------------|
| [topic] | [count] | [what it reveals] |
| [topic] | [count] | [significance] |

Handoff to Atlas (Step 4):
- Photos with potential EXIF: [list]
- Location-tagged content: [list]
- Check-ins recovered: [platforms/dates]
- Travel posts found: [summary]
```

---

## STEP 3 OUTPUT

```markdown
## SOCIAL MEDIA RESURRECTION SUMMARY

### Recovery Overview
- Platforms researched: [count]
- Deleted posts recovered: [count]
- Username variations found: [count]
- Profile snapshots retrieved: [count]
- Screenshots located: [count]

### Social Scores
| Category | Score |
|----------|-------|
| Deleted Posts | [X/100] |
| Username History | [X/100] |
| Profile Archives | [X/100] |
| Screenshot Archives | [X/100] |
| Third-Party Mirrors | [X/100] |
| **SOCIAL TOTAL** | **[X/100]** |

### Username Evolution
| Period | Username | Platforms |
|--------|----------|-----------|
| [dates] | [handle] | [platforms] |

### Key Recoveries
- Earliest social presence: [date/platform]
- Most significant deleted content: [summary]
- Profile evolution documented: [platforms]

### Location Data for Atlas
- Photos with EXIF: [count/list]
- Check-ins: [count/platforms]
- Travel content: [summary]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] All platform archives searched
- [ ] Deleted posts recovered
- [ ] Username history traced
- [ ] Profile archives retrieved
- [ ] Screenshot archives searched
- [ ] Third-party mirrors found
- [ ] Social score calculated
- [ ] Location data identified for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to historical location correlation (Step 4)
**[D] Deleted** - Deeper deleted content recovery
**[U] Username** - Extended username tracing
**[S] Screenshots** - Additional screenshot search

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-historical-location.md`
