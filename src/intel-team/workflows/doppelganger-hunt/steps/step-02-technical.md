---
name: 'step-02-technical'
description: 'Profile image analysis, metadata examination, cross-platform correlation, bot indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/doppelganger-hunt'
thisStepFile: '{workflow_path}/steps/step-02-technical.md'
nextStepFile: '{workflow_path}/steps/step-03-location.md'
prevStepFile: '{workflow_path}/steps/step-01-behavioral.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Step 2: Technical Fingerprinting

## STEP GOAL

Perform technical analysis of the account including profile image verification, metadata examination, cross-platform correlation, and bot detection. Identify technical indicators of authenticity or fabrication.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Probe**, Technical Researcher
- You specialize in technical artifact analysis and forensics
- You detect AI-generated content, stolen images, and bot behavior
- You correlate technical indicators across platforms

### Analysis Protocol

- Perform reverse image searches on all profile/posted images
- Analyze available metadata
- Search for accounts with same identifiers across platforms
- Check for automation/bot indicators
- Document all technical findings systematically

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Profile Image Analysis

Analyze the profile picture(s):

```
PROFILE IMAGE ANALYSIS
======================

Current Profile Image:
□ Image saved: [Y/N, filename]
□ Image hash: [hash for comparison]
□ Image dimensions: [WxH]
□ Visual description: [brief description]

Reverse Image Search Results:
| Search Engine | Results Found | Notable Matches |
|---------------|---------------|-----------------|
| Google Images | [count] | [summary of matches] |
| TinEye | [count] | [summary of matches] |
| Yandex | [count] | [summary of matches] |
| Bing | [count] | [summary of matches] |

Match Analysis:
| Match Source | Date | Context | Significance |
|--------------|------|---------|--------------|
| [URL] | [date] | [stock photo/other profile/etc] | [implication] |
| [URL] | [date] | [context] | [implication] |

□ Image origin assessment:
  - [ ] Original photo (no matches)
  - [ ] Stock photo identified
  - [ ] Stolen from real person
  - [ ] AI-generated
  - [ ] Generic/common image

AI-Generated Image Detection:
| Indicator | Present? | Confidence |
|-----------|----------|------------|
| Unnatural skin texture | [Y/N] | [H/M/L] |
| Asymmetric features | [Y/N] | [H/M/L] |
| Background artifacts | [Y/N] | [H/M/L] |
| Earring/jewelry anomalies | [Y/N] | [H/M/L] |
| Hair irregularities | [Y/N] | [H/M/L] |
| Eye reflection inconsistencies | [Y/N] | [H/M/L] |
| Watermark remnants | [Y/N] | [H/M/L] |

AI Detection Tool Results:
| Tool | Result | Confidence |
|------|--------|------------|
| [Tool 1] | [AI/Real/Uncertain] | [%] |
| [Tool 2] | [AI/Real/Uncertain] | [%] |

PROFILE IMAGE VERDICT: [Original/Stolen/AI-Generated/Stock/Unknown]
```

### 2. Posted Media Analysis

Analyze images and media posted by account:

```
POSTED MEDIA ANALYSIS
=====================

Media Inventory:
□ Total images posted: [count]
□ Total videos posted: [count]
□ Sample size analyzed: [count]

Sample Image Analysis:
| Image | Reverse Search | Metadata | Assessment |
|-------|---------------|----------|------------|
| [img 1] | [results] | [EXIF if any] | [Original/Stolen/Stock] |
| [img 2] | [results] | [metadata] | [assessment] |
| [img 3] | [results] | [metadata] | [assessment] |
| [img 4] | [results] | [metadata] | [assessment] |
| [img 5] | [results] | [metadata] | [assessment] |

□ Media patterns:
  - [ ] Consistent image style/quality
  - [ ] Mix of sources
  - [ ] All from same camera/device
  - [ ] EXIF data present/stripped
  - [ ] Location data in images

Metadata Findings:
| Image | Camera/Device | Date | Location | Software |
|-------|---------------|------|----------|----------|
| [img] | [device] | [date] | [loc] | [software] |

□ Metadata consistency:
  - [ ] Same device across images
  - [ ] Dates match posting dates
  - [ ] Location consistent with claims
  - [ ] Evidence of editing

POSTED MEDIA SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 3. Cross-Platform Correlation

Search for account presence across platforms:

```
CROSS-PLATFORM CORRELATION
==========================

Username/Handle Search:
| Platform | Username Exists | Profile Match | Activity |
|----------|-----------------|---------------|----------|
| Twitter/X | [Y/N] | [Same person?] | [Active/Inactive] |
| Instagram | [Y/N] | [Same person?] | [Active/Inactive] |
| Facebook | [Y/N] | [Same person?] | [Active/Inactive] |
| LinkedIn | [Y/N] | [Same person?] | [Active/Inactive] |
| TikTok | [Y/N] | [Same person?] | [Active/Inactive] |
| YouTube | [Y/N] | [Same person?] | [Active/Inactive] |
| Reddit | [Y/N] | [Same person?] | [Active/Inactive] |
| GitHub | [Y/N] | [Same person?] | [Active/Inactive] |
| Other: [platform] | [Y/N] | [Same person?] | [Active/Inactive] |

Username Variations Searched:
| Variation | Platforms Found | Notes |
|-----------|-----------------|-------|
| [variation 1] | [platforms] | [notes] |
| [variation 2] | [platforms] | [notes] |

Cross-Platform Consistency:
| Factor | Consistent? | Notes |
|--------|-------------|-------|
| Profile photo | [Y/N/Partial] | [details] |
| Display name | [Y/N/Partial] | [details] |
| Bio information | [Y/N/Partial] | [details] |
| Claimed location | [Y/N/Partial] | [details] |
| Content themes | [Y/N/Partial] | [details] |
| Writing style | [Y/N/Partial] | [details] |
| Activity period | [Y/N/Partial] | [details] |

□ Cross-platform assessment:
  - [ ] Genuine multi-platform presence
  - [ ] Single platform only (unusual)
  - [ ] Inconsistencies suggest fake
  - [ ] Same fake persona across platforms

CROSS-PLATFORM SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 4. Bot Detection Analysis

Analyze for automated/bot behavior:

```
BOT DETECTION ANALYSIS
======================

Automation Indicators:
| Indicator | Present? | Evidence |
|-----------|----------|----------|
| Exact interval posting | [Y/N] | [pattern details] |
| API posting markers | [Y/N] | ["via" indicators] |
| Repetitive content | [Y/N] | [examples] |
| 24/7 activity | [Y/N] | [timeline] |
| Inhuman response speed | [Y/N] | [examples] |
| Template responses | [Y/N] | [examples] |
| Mass following/unfollowing | [Y/N] | [pattern] |
| Engagement pods | [Y/N] | [evidence] |

Posting Source Analysis:
| Source | % of Posts | Notes |
|--------|------------|-------|
| Native app | [%] | [normal] |
| Web | [%] | [normal] |
| Third-party app | [%] | [which apps] |
| API/automation | [%] | [suspicious if high] |
| Unknown | [%] | [investigate] |

Bot Score Tools (if available):
| Tool | Score | Assessment |
|------|-------|------------|
| Botometer | [score] | [Bot/Human/Uncertain] |
| Bot Sentinel | [score] | [assessment] |
| Other | [score] | [assessment] |

Coordinated Behavior Indicators:
| Indicator | Present? | Details |
|-----------|----------|---------|
| Same content as other accounts | [Y/N] | [which accounts] |
| Synchronized posting | [Y/N] | [timing] |
| Same network of followers | [Y/N] | [overlap %] |
| Similar account creation dates | [Y/N] | [comparison] |

BOT PROBABILITY: [High/Medium/Low/None]
Evidence: [summary]
```

### 5. Account History Analysis

Analyze account creation and history:

```
ACCOUNT HISTORY ANALYSIS
========================

Account Timeline:
| Date | Event | Notes |
|------|-------|-------|
| [creation] | Account created | - |
| [first post] | First post | [content] |
| [gaps] | Inactive periods | [duration, explanation?] |
| [changes] | Profile changes | [what changed] |
| [now] | Current state | - |

Account Age vs Activity:
□ Account age: [days/months/years]
□ First post date: [date]
□ Time to first post: [gap from creation]
□ Total posts: [count]
□ Posts per month average: [avg]

□ Age/activity red flags:
  - [ ] Old account, very few posts
  - [ ] New account, massive activity
  - [ ] Long dormancy then sudden activation
  - [ ] Activity doesn't match account age

Profile Change History (if available):
| Date | Change | Old Value | New Value |
|------|--------|-----------|-----------|
| [date] | [element] | [old] | [new] |

□ Profile change patterns:
  - [ ] Consistent identity over time
  - [ ] Complete identity change (account takeover?)
  - [ ] Gradual evolution (normal)
  - [ ] Abrupt changes (suspicious)

ACCOUNT HISTORY SCORE: [0-100]
Authentic indicators: [list]
Fake indicators: [list]
```

### 6. Technical Fingerprint Summary

Compile technical findings:

```
TECHNICAL FINGERPRINT SUMMARY
=============================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Profile Image | [score] | 30% | [weighted] |
| Posted Media | [score] | 20% | [weighted] |
| Cross-Platform | [score] | 20% | [weighted] |
| Bot Detection | [score] | 20% | [weighted] |
| Account History | [score] | 10% | [weighted] |
| **TOTAL TECHNICAL** | - | - | **[total]** |

Key Technical Indicators:

AUTHENTIC Signals:
1. [Most convincing authentic indicator]
2. [Second most convincing]
3. [Third most convincing]

FAKE/SUSPICIOUS Signals:
1. [Most concerning fake indicator]
2. [Second most concerning]
3. [Third most concerning]

Technical Assessment:
□ Profile image: [Original/Stolen/AI-Generated/Stock]
□ Media authenticity: [Authentic/Fake/Mixed]
□ Cross-platform consistency: [Consistent/Inconsistent/N/A]
□ Bot probability: [High/Medium/Low/None]
□ Account history: [Normal/Suspicious]

Handoff to Atlas (Step 3):
- Claimed location: [location from profile]
- Timezone indicators: [from posting patterns]
- Photo locations: [any geotags or visual location cues]
```

---

## STEP 2 OUTPUT

```markdown
## TECHNICAL FINGERPRINTING SUMMARY

### Image Analysis
- Profile image verdict: [Original/Stolen/AI/Stock]
- Posted media authenticity: [assessment]
- AI-generated indicators: [Y/N]

### Cross-Platform
- Platforms found: [count]
- Consistency: [Consistent/Inconsistent]
- Key discrepancies: [if any]

### Bot Detection
- Bot probability: [High/Medium/Low/None]
- Automation indicators: [count]
- Coordinated behavior: [Y/N]

### Account History
- Age: [age]
- Activity pattern: [Normal/Suspicious]
- Changes detected: [summary]

### Technical Scores
| Category | Score |
|----------|-------|
| Profile Image | [X/100] |
| Posted Media | [X/100] |
| Cross-Platform | [X/100] |
| Bot Detection | [X/100] |
| Account History | [X/100] |
| **TECHNICAL TOTAL** | **[X/100]** |

### Key Findings
- [Top technical finding]
- [Second finding]
- [Third finding]

### Location Analysis Needed
- Claimed location: [location]
- Evidence to verify: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:

- [ ] Profile image analyzed
- [ ] Posted media examined
- [ ] Cross-platform search complete
- [ ] Bot indicators assessed
- [ ] Account history reviewed
- [ ] Technical score calculated
- [ ] Location indicators identified for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to location consistency (Step 3)
**[I] Image** - Deeper image forensics
**[B] Bot** - Extended bot analysis
**[X] Cross-Platform** - Additional platform search

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-location.md`
