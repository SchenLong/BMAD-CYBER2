---
name: 'step-03-location'
description: 'Claimed location verification, timezone analysis, cultural consistency'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/doppelganger-hunt'
thisStepFile: '{workflow_path}/steps/step-03-location.md'
nextStepFile: '{workflow_path}/steps/step-04-psychological.md'
prevStepFile: '{workflow_path}/steps/step-02-technical.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 3: Location Consistency

## STEP GOAL

Verify the claimed location through multiple indicators including posting timezone analysis, photo locations, cultural references, and language markers. Determine if location claims are consistent and authentic.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location verification
- You analyze timezone patterns and cultural markers
- You verify claimed locations against behavioral indicators

### Analysis Protocol
- Extract and verify all location claims
- Analyze posting times for timezone patterns
- Check photos for location indicators
- Assess cultural and linguistic consistency
- Determine location authenticity confidence

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Location Claims Extraction

Document all location claims made by the account:

```
LOCATION CLAIMS EXTRACTION
==========================

Profile Location Claims:
| Claim Source | Claimed Location | Specificity |
|--------------|------------------|-------------|
| Profile bio | [location] | [City/State/Country] |
| Profile location field | [location] | [as stated] |
| Website/linked profile | [location] | [if present] |

Content Location Claims:
| Date | Claim Type | Location Mentioned | Context |
|------|------------|-------------------|---------|
| [date] | Direct claim | "[location]" | [context] |
| [date] | Check-in | [venue/location] | [platform] |
| [date] | Event reference | [event location] | [context] |
| [date] | Weather reference | [implied location] | [context] |

Photo Location Evidence:
| Photo | Visual Location Cues | Claimed/Implied Location |
|-------|---------------------|-------------------------|
| [photo 1] | [landmarks, signs, etc] | [location] |
| [photo 2] | [visual cues] | [location] |
| [photo 3] | [visual cues] | [location] |

EXIF/Geotag Data:
| Photo | EXIF Location | Matches Claim? |
|-------|---------------|----------------|
| [photo] | [coordinates if present] | [Y/N] |

□ Location claim consistency:
  - [ ] All claims consistent (same location)
  - [ ] Multiple locations (explainable - travel)
  - [ ] Contradictory claims
  - [ ] Vague/no specific claims
```

### 2. Timezone Analysis

Analyze posting patterns for timezone inference:

```
TIMEZONE ANALYSIS
=================

Posting Time Distribution (UTC):
| UTC Hour | Post Count | Local Time (Claimed TZ) |
|----------|------------|------------------------|
| 00:00 | [count] | [local time] |
| 01:00 | [count] | [local time] |
| ... | ... | ... |
| 23:00 | [count] | [local time] |

Activity Pattern Analysis:
□ Peak activity hours (UTC): [range]
□ Low activity hours (UTC): [range]
□ Zero activity hours (UTC): [range]

Inferred Timezone:
| Method | Inferred TZ | Confidence |
|--------|-------------|------------|
| Peak activity = 9am-6pm | [TZ] | [H/M/L] |
| Low activity = 2am-6am | [TZ] | [H/M/L] |
| Combined analysis | [TZ] | [H/M/L] |

Claimed vs Inferred:
| Claimed Location | Claimed TZ | Inferred TZ | Match? |
|------------------|------------|-------------|--------|
| [location] | [TZ] | [TZ] | [Y/N] |

□ Timezone discrepancy analysis:
  - Discrepancy amount: [hours difference]
  - Possible explanations:
    - [ ] Night shift worker
    - [ ] Travels frequently
    - [ ] Using VPN with wrong time
    - [ ] Location claim is false
    - [ ] Other: [explanation]

TIMEZONE CONSISTENCY SCORE: [0-100]
```

### 3. Cultural and Language Markers

Analyze cultural indicators:

```
CULTURAL AND LANGUAGE MARKERS
=============================

Language Analysis:
| Marker | Observation | Expected for Claimed Location |
|--------|-------------|------------------------------|
| Primary language | [language] | [Y/N match] |
| Spelling variant | [British/American/etc] | [Y/N match] |
| Slang/idioms | [examples] | [Y/N match] |
| Regional expressions | [examples] | [Y/N match] |

Cultural References:
| Reference Type | Specific Reference | Expected for Location |
|----------------|-------------------|----------------------|
| Holidays mentioned | [holidays] | [Y/N match] |
| Sports teams | [teams] | [Y/N match] |
| Local events | [events] | [Y/N match] |
| Food/restaurants | [references] | [Y/N match] |
| Weather references | [weather] | [Y/N match for location/season] |
| Currency references | [currency] | [Y/N match] |
| Political references | [politics] | [Y/N match] |

Local Knowledge Indicators:
| Topic | Claimed Knowledge | Verification |
|-------|-------------------|--------------|
| Local places | [references] | [Accurate/Inaccurate/Unverifiable] |
| Local customs | [references] | [Accurate/Inaccurate/Unverifiable] |
| Local news | [references] | [Accurate/Inaccurate/Unverifiable] |
| Local celebrities | [references] | [Accurate/Inaccurate/Unverifiable] |

□ Cultural consistency assessment:
  - [ ] Highly consistent with claimed location
  - [ ] Generally consistent with some gaps
  - [ ] Significant inconsistencies
  - [ ] Clearly inconsistent with claims

CULTURAL CONSISTENCY SCORE: [0-100]
```

### 4. Photo Location Verification

Verify locations shown in photos:

```
PHOTO LOCATION VERIFICATION
===========================

Identifiable Locations in Photos:
| Photo | Identified Location | Claimed Location | Match? |
|-------|---------------------|------------------|--------|
| [photo 1] | [identified] | [claimed] | [Y/N/NA] |
| [photo 2] | [identified] | [claimed] | [Y/N/NA] |
| [photo 3] | [identified] | [claimed] | [Y/N/NA] |

Location Identification Methods:
| Photo | Method Used | Confidence |
|-------|-------------|------------|
| [photo] | [landmark/sign/GeoGuessr/etc] | [H/M/L] |

Environmental Consistency:
| Photo Element | Observed | Expected for Claimed Location |
|---------------|----------|------------------------------|
| Architecture style | [style] | [Y/N match] |
| Vegetation | [type] | [Y/N match for climate] |
| Street signs | [language/style] | [Y/N match] |
| License plates | [format] | [Y/N match] |
| Power outlets | [type if visible] | [Y/N match] |
| Sun position | [angle/direction] | [Y/N match for hemisphere] |

□ Photo location assessment:
  - [ ] Photos consistent with claimed location
  - [ ] Photos from different location than claimed
  - [ ] Photos are stock/stolen (from Step 2)
  - [ ] No identifiable locations in photos

PHOTO LOCATION SCORE: [0-100]
```

### 5. Multi-Source Location Correlation

Correlate all location evidence:

```
MULTI-SOURCE LOCATION CORRELATION
=================================

Evidence Summary:
| Source | Location Indicated | Confidence | Weight |
|--------|-------------------|------------|--------|
| Profile claim | [location] | [H/M/L] | Low (self-reported) |
| Timezone analysis | [location] | [H/M/L] | High |
| Cultural markers | [location] | [H/M/L] | Medium |
| Language markers | [location] | [H/M/L] | Medium |
| Photo evidence | [location] | [H/M/L] | High |
| Cross-platform consistency | [location] | [H/M/L] | Medium |

Correlation Assessment:
□ All sources agree: [Y/N]
□ Majority agree: [Y/N]
□ Significant disagreement: [Y/N]
□ Contradictory evidence: [Y/N]

Most Likely Actual Location:
| Rank | Location | Evidence | Confidence |
|------|----------|----------|------------|
| 1 | [most likely] | [supporting evidence] | [H/M/L] |
| 2 | [alternate] | [supporting evidence] | [H/M/L] |

Discrepancy Analysis:
| Discrepancy | Claimed vs Actual | Significance |
|-------------|-------------------|--------------|
| [discrepancy 1] | [comparison] | [importance] |
| [discrepancy 2] | [comparison] | [importance] |

□ Location authenticity verdict:
  - [ ] Location claims appear authentic
  - [ ] Location claims likely false
  - [ ] Inconclusive - insufficient data
  - [ ] Deliberate obfuscation detected
```

### 6. Location Consistency Summary

Compile location findings:

```
LOCATION CONSISTENCY SUMMARY
============================

Score Summary:
| Category | Score (0-100) | Weight | Weighted Score |
|----------|---------------|--------|----------------|
| Timezone Consistency | [score] | 35% | [weighted] |
| Cultural Markers | [score] | 25% | [weighted] |
| Photo Verification | [score] | 25% | [weighted] |
| Multi-Source Correlation | [score] | 15% | [weighted] |
| **TOTAL LOCATION** | - | - | **[total]** |

Key Location Indicators:

AUTHENTIC Signals:
1. [Most convincing authentic indicator]
2. [Second most convincing]
3. [Third most convincing]

FAKE/INCONSISTENT Signals:
1. [Most concerning indicator]
2. [Second most concerning]
3. [Third most concerning]

Location Assessment:
□ Claimed location: [location]
□ Likely actual location: [location]
□ Location match: [Y/N/Partial]
□ Confidence: [High/Medium/Low]

Handoff to Viper (Step 4):
- Persona consistency gaps: [from location analysis]
- Motivation indicators: [if location deception detected]
- Psychological profile inputs: [relevant findings]
```

---

## STEP 3 OUTPUT

```markdown
## LOCATION CONSISTENCY SUMMARY

### Claimed Location
- Profile claim: [location]
- Consistency across platforms: [assessment]

### Verification Results
| Method | Indicated Location | Matches Claim? |
|--------|-------------------|----------------|
| Timezone | [location/TZ] | [Y/N] |
| Cultural markers | [location] | [Y/N] |
| Language | [region] | [Y/N] |
| Photo evidence | [location] | [Y/N] |

### Location Scores
| Category | Score |
|----------|-------|
| Timezone | [X/100] |
| Cultural Markers | [X/100] |
| Photo Verification | [X/100] |
| Multi-Source | [X/100] |
| **LOCATION TOTAL** | **[X/100]** |

### Assessment
- Most likely actual location: [location]
- Confidence: [High/Medium/Low]
- Key discrepancies: [if any]

### Psychological Analysis Inputs
- Deception indicators: [list]
- Persona gaps: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Location claims extracted
- [ ] Timezone analyzed
- [ ] Cultural markers assessed
- [ ] Photo locations verified
- [ ] Multi-source correlation complete
- [ ] Location score calculated
- [ ] Psychological analysis inputs identified

---

## MENU OPTIONS

**[C] Continue** - Proceed to psychological assessment (Step 4)
**[T] Timezone** - Deeper timezone analysis
**[P] Photo** - Additional photo geolocation
**[C] Cultural** - Extended cultural analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-psychological.md`
