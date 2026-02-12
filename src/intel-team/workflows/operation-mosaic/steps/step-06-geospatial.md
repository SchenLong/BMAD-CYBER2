---
name: 'step-06-geospatial'
description: 'Location indicators, photo geolocation, infrastructure locations, movement patterns'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-06-geospatial.md'
nextStepFile: '{workflow_path}/steps/step-07-threat-correlation.md'
prevStepFile: '{workflow_path}/steps/step-05-corporate-intel.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 6: Geospatial Correlation (Phase 2e)

## STEP GOAL

Correlate all location intelligence from previous steps, perform photo geolocation analysis, verify infrastructure locations, and establish movement patterns. Build comprehensive geographic profile.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You correlate location data from multiple sources
- You perform photo geolocation and pattern analysis

### Collection Protocol

- Aggregate location data from all previous steps
- Verify claimed locations against evidence
- Perform geolocation on photos with visual cues
- Map infrastructure locations
- Identify movement and travel patterns
- Build comprehensive geographic profile

---

## COLLECTION EXECUTION SEQUENCE

### 1. Location Data Aggregation

Compile location data from all sources:

```
LOCATION DATA AGGREGATION
=========================

Location Data from Previous Steps:

From Step 2 (Digital Footprint):
| Data Type | Location | Source | Confidence |
|-----------|----------|--------|------------|
| IP geolocation | [location] | [IP analysis] | [H/M/L] |
| WHOIS address | [address] | [registry] | [H/M/L] |
| Hosting location | [location] | [provider] | [H/M/L] |
| Office address (website) | [address] | [contact page] | [H/M/L] |

From Step 3 (Social Presence):
| Data Type | Location | Source | Confidence |
|-----------|----------|--------|------------|
| Profile location | [location] | [platform] | [H/M/L] |
| Check-ins | [locations] | [platform] | [H/M/L] |
| Geo-tagged photos | [locations] | [platform] | [H/M/L] |
| Timezone indicated | [TZ] | [posting pattern] | [H/M/L] |
| Travel posts | [locations] | [platform] | [H/M/L] |

From Step 5 (Corporate Intel):
| Data Type | Location | Source | Confidence |
|-----------|----------|--------|------------|
| Registered address | [address] | [registry] | [H/M/L] |
| Operating address | [address] | [filings] | [H/M/L] |
| Branch locations | [addresses] | [registries] | [H/M/L] |

Combined Location Inventory:
| Location | Type | Sources | Consistency |
|----------|------|---------|-------------|
| [location 1] | [home/work/etc] | [multiple sources] | [consistent/conflicting] |
| [location 2] | [type] | [sources] | [status] |

□ Location data aggregated: [Y/N]
□ Total unique locations: [count]
□ Consistency issues: [count]
```

### 2. Claimed Location Verification

Verify stated locations:

```
CLAIMED LOCATION VERIFICATION
=============================

Primary Claimed Location(s):
| Claim | Source | Evidence Supporting | Evidence Conflicting |
|-------|--------|---------------------|---------------------|
| [location] | [profile/website] | [supporting data] | [conflicting data] |

Verification Analysis:
| Location Claim | Timezone Match | IP Location | Cultural Markers | Photos |
|----------------|----------------|-------------|------------------|--------|
| [claimed] | [Y/N] | [match/different] | [Y/N] | [consistent?] |

Verification Matrix:
| Evidence Type | Location Indicated | Confidence |
|---------------|-------------------|------------|
| Profile claims | [location] | [self-reported - low] |
| Posting times | [timezone/region] | [H/M/L] |
| IP addresses | [location] | [H/M/L] |
| Photo locations | [locations] | [H/M/L] |
| Check-ins | [locations] | [H/M/L] |
| Corporate filings | [addresses] | [H/M/L] |
| Cultural references | [region] | [H/M/L] |
| Language markers | [region] | [H/M/L] |

Verification Verdict:
| Claimed Location | Likely True | Confidence | Notes |
|------------------|-------------|------------|-------|
| [location] | [Y/N/Partial] | [H/M/L] | [explanation] |

□ Claimed locations verified: [count/total]
□ Discrepancies found: [Y/N]
□ Likely actual location: [location]
```

### 3. Photo Geolocation Analysis

Geolocate photos without metadata:

```
PHOTO GEOLOCATION ANALYSIS
==========================

Photos Requiring Geolocation:
| Photo ID | Source | Visual Cues | Priority |
|----------|--------|-------------|----------|
| [photo 1] | [platform] | [landmarks, signs, etc] | [H/M/L] |
| [photo 2] | [platform] | [visual cues] | [priority] |

Geolocation Results:
| Photo | Visual Cues Used | Identified Location | Confidence | Method |
|-------|------------------|---------------------|------------|--------|
| [photo] | [landmarks/signs/etc] | [location] | [H/M/L] | [how identified] |

Landmark Identification:
| Photo | Landmark | Location | Confirmed |
|-------|----------|----------|-----------|
| [photo] | [landmark name] | [location] | [Y/N] |

Environmental Analysis:
| Photo | Environment | Climate/Vegetation | Hemisphere | Notes |
|-------|-------------|-------------------|------------|-------|
| [photo] | [urban/rural/etc] | [type] | [N/S] | [findings] |

Infrastructure Clues:
| Photo | Clue Type | Observation | Location Indicated |
|-------|-----------|-------------|-------------------|
| [photo] | Road signs | [language/format] | [country/region] |
| [photo] | Power outlets | [type] | [region] |
| [photo] | License plates | [format] | [country] |
| [photo] | Architecture | [style] | [region] |

Sun/Shadow Analysis:
| Photo | Sun Position | Time Indicated | Hemisphere |
|-------|--------------|----------------|------------|
| [photo] | [angle/direction] | [approximate time] | [N/S] |

□ Photos geolocated: [count]
□ High-confidence locations: [count]
□ Unable to geolocate: [count]
```

### 4. Infrastructure Mapping

Map physical infrastructure locations:

```
INFRASTRUCTURE MAPPING
======================

Known Infrastructure Locations:
| Type | Address | Coordinates | Verified | Purpose |
|------|---------|-------------|----------|---------|
| HQ/Main Office | [address] | [coords] | [Y/N] | [primary office] |
| Data Center | [address] | [coords] | [Y/N] | [hosting] |
| Branch Office | [address] | [coords] | [Y/N] | [regional] |
| Warehouse | [address] | [coords] | [Y/N] | [logistics] |

Address Verification:
| Address | Source | Satellite View | Street View | Verified |
|---------|--------|----------------|-------------|----------|
| [address] | [source] | [exists?] | [matches?] | [Y/N] |

Facility Analysis:
| Location | Building Type | Size | Activity Indicators |
|----------|---------------|------|---------------------|
| [address] | [office/industrial/etc] | [if visible] | [vehicles/signage/etc] |

Co-located Entities:
| Address | Other Entities | Relationship |
|---------|----------------|--------------|
| [address] | [other companies] | [shared space/same building] |

Virtual Office Detection:
| Address | Type | Evidence |
|---------|------|----------|
| [address] | [real/virtual/mail drop] | [how determined] |

□ Infrastructure locations mapped: [count]
□ Addresses verified: [count]
□ Virtual offices detected: [Y/N]
```

### 5. Movement Pattern Analysis

Identify travel and movement patterns:

```
MOVEMENT PATTERN ANALYSIS
=========================

Regular Locations:
| Location Type | Location | Frequency | Evidence |
|---------------|----------|-----------|----------|
| Primary residence | [location] | [daily] | [sources] |
| Workplace | [location] | [weekdays] | [sources] |
| Regular visit | [location] | [weekly/monthly] | [sources] |

Travel Pattern Summary:
| Period | Destinations | Purpose (if known) | Duration |
|--------|--------------|-------------------|----------|
| [date range] | [locations] | [business/personal] | [days] |

Commute/Routine Indicators:
| Pattern | Times | Route/Locations |
|---------|-------|-----------------|
| [weekday] | [hours] | [from → to] |
| [weekend] | [pattern] | [typical locations] |

International Travel:
| Date | Destination | Evidence | Duration |
|------|-------------|----------|----------|
| [date] | [country] | [posts/check-ins] | [if known] |

Seasonal Patterns:
| Season/Period | Pattern | Locations |
|---------------|---------|-----------|
| [summer] | [travel/stay] | [typical destinations] |
| [holidays] | [pattern] | [locations] |

Movement Timeline:
| Date | Location | Activity | Evidence |
|------|----------|----------|----------|
| [earliest] | [location] | [what doing] | [source] |
| ... | ... | ... | ... |
| [most recent] | [location] | [activity] | [source] |

□ Movement patterns identified: [Y/N]
□ Regular locations: [count]
□ Travel frequency: [frequent/occasional/rare]
```

### 6. Geospatial Intelligence Summary

Compile GEOINT findings:

```
GEOSPATIAL INTELLIGENCE SUMMARY
===============================

Geographic Profile:
| Attribute | Value | Confidence |
|-----------|-------|------------|
| Primary location | [location] | [H/M/L] |
| Secondary location | [location] | [H/M/L] |
| Timezone | [TZ] | [H/M/L] |
| Country | [country] | [H/M/L] |
| Region/State | [region] | [H/M/L] |
| City | [city] | [H/M/L] |

Location Summary:
| Location Type | Count | Key Locations |
|---------------|-------|---------------|
| Residential | [count] | [list] |
| Business | [count] | [list] |
| Travel destinations | [count] | [list] |
| Infrastructure | [count] | [list] |

Key Findings:
1. [Most significant geospatial finding]
2. [Second finding]
3. [Third finding]

Verification Status:
| Claimed | Verified | Discrepancy |
|---------|----------|-------------|
| [location] | [Y/N/Partial] | [details if any] |

Movement Intelligence:
- Travel frequency: [assessment]
- Regular patterns: [summary]
- Notable trips: [summary]

Handoffs for Other Agents:
| Agent | Data Provided |
|-------|---------------|
| Dossier | [location patterns for actor correlation] |
| Viper | [location data for approach planning] |
| Specter | [physical locations for operational planning] |

Map Coordinates (for visualization):
| Location | Coordinates | Type |
|----------|-------------|------|
| [location] | [lat, long] | [type] |
```

---

## STEP 6 OUTPUT

```markdown
## GEOSPATIAL INTELLIGENCE SUMMARY

### Primary Location
- Verified location: [location]
- Timezone: [TZ]
- Confidence: [H/M/L]

### Location Inventory
| Type | Location |
|------|----------|
| Primary | [location] |
| Work | [location] |
| Travel | [locations] |

### Verification Status
- Claimed locations verified: [Y/N]
- Discrepancies: [if any]

### Movement Patterns
- Travel frequency: [assessment]
- Regular locations: [count]
- Notable patterns: [summary]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Photo Geolocation Results
- Photos geolocated: [count]
- Locations identified: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 3:

- [ ] Location data aggregated
- [ ] Claimed locations verified
- [ ] Photos geolocated
- [ ] Infrastructure mapped
- [ ] Movement patterns analyzed
- [ ] Geographic profile complete
- [ ] Handoff data prepared for Phase 3-4 agents

---

## PHASE 2 COMPLETE

Steps 2-6 (parallel collection) are now complete. Proceed to Phase 3 for specialized analysis.

---

## MENU OPTIONS

**[C] Continue** - Proceed to threat correlation (Step 7 - Phase 3)
**[G] Geolocation** - Additional photo geolocation
**[M] Movement** - Deeper movement analysis
**[I] Infrastructure** - Extended infrastructure mapping

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-07-threat-correlation.md`
