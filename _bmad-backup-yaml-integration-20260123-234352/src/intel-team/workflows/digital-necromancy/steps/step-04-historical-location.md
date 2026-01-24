---
name: 'step-04-historical-location'
description: 'Photo EXIF recovery, check-in history, historical satellite imagery, location metadata'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/digital-necromancy'
thisStepFile: '{workflow_path}/steps/step-04-historical-location.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-03-social-resurrection.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 4: Historical Location Correlation

## STEP GOAL

Correlate location data from recovered historical content including photo EXIF metadata, check-in history, and archived geospatial references to build a historical location timeline and identify patterns in the target's past movements.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and historical location analysis
- You extract location data from recovered digital artifacts
- You build historical movement timelines from fragmented data

### Analysis Protocol
- Analyze EXIF metadata from all recovered photos
- Reconstruct check-in history from archived content
- Correlate historical satellite imagery where relevant
- Extract location metadata from all archived sources
- Build comprehensive historical location timeline
- Compile final Digital Necromancy report

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Photo EXIF Metadata Recovery

Analyze photos from recovered content:

```
PHOTO EXIF METADATA RECOVERY
============================

Photos from Step 3 (Social Resurrection):
| Photo ID | Source | Platform | Date Posted | EXIF Present |
|----------|--------|----------|-------------|--------------|
| [photo 1] | [archive url] | [platform] | [date] | [Y/N] |
| [photo 2] | [source] | [platform] | [date] | [Y/N] |

EXIF Data Extracted:
| Photo | GPS Coords | Date Taken | Camera | Software |
|-------|------------|------------|--------|----------|
| [photo] | [lat, long] | [date] | [device] | [editing sw] |
| [photo] | [coords or N/A] | [date] | [device] | [software] |

Geolocated Photos:
| Photo | Coordinates | Location Name | Date | Context |
|-------|-------------|---------------|------|---------|
| [photo] | [coords] | [place name] | [date] | [what photo shows] |

Non-EXIF Location Indicators:
| Photo | Visual Cues | Identified Location | Confidence |
|-------|-------------|---------------------|------------|
| [photo] | [landmarks/signs/etc] | [location] | [H/M/L] |

Device Pattern Analysis:
| Device | Photos | Date Range | Notes |
|--------|--------|------------|-------|
| [camera/phone] | [count] | [dates] | [consistent/changed] |

Photo Timeline:
| Date | Location | Photo Description | Source |
|------|----------|-------------------|--------|
| [earliest] | [location] | [what shown] | [archive source] |
| [date] | [location] | [description] | [source] |
| [latest] | [location] | [description] | [source] |

□ EXIF recovery findings:
  - [ ] GPS coordinates extracted
  - [ ] Date/time stamps recovered
  - [ ] Device information found
  - [ ] Editing software identified
  - [ ] Visual geolocation performed

EXIF RECOVERY SCORE: [0-100]
```

### 2. Check-In History Reconstruction

Recover location check-ins:

```
CHECK-IN HISTORY RECONSTRUCTION
===============================

Platform Check-In Archives:
| Platform | Archive Source | Date Range | Check-ins Found |
|----------|----------------|------------|-----------------|
| Facebook | [archive url] | [dates] | [count] |
| Foursquare/Swarm | [source] | [dates] | [count] |
| Instagram | [source] | [dates] | [count] |
| Yelp | [source] | [dates] | [count] |
| Google Maps | [source] | [dates] | [count] |

Recovered Check-Ins:
| Date | Platform | Venue | Location | Context |
|------|----------|-------|----------|---------|
| [date] | [platform] | [venue name] | [city/address] | [post content] |
| [date] | [platform] | [venue] | [location] | [context] |

Venue Category Analysis:
| Category | Count | Locations | Pattern |
|----------|-------|-----------|---------|
| Restaurants | [count] | [cities/areas] | [frequency] |
| Hotels/Travel | [count] | [locations] | [travel pattern] |
| Workplaces | [count] | [addresses] | [routine] |
| Entertainment | [count] | [venues] | [interests] |
| Other | [count] | [types] | [notes] |

Regular Location Patterns:
| Location Type | Venue/Area | Frequency | Time Period |
|---------------|------------|-----------|-------------|
| [home area?] | [location] | [regular] | [dates] |
| [work area?] | [location] | [weekdays?] | [dates] |
| [recreation] | [location] | [weekends?] | [dates] |

Travel Check-Ins:
| Date | Destination | Duration | Related Posts |
|------|-------------|----------|---------------|
| [date] | [city/country] | [if determinable] | [other posts] |

□ Check-in recovery findings:
  - [ ] Regular locations identified
  - [ ] Travel patterns mapped
  - [ ] Venue preferences documented
  - [ ] Time-based patterns found
  - [ ] Living/working areas suggested

CHECK-IN RECOVERY SCORE: [0-100]
```

### 3. Historical Satellite & Street View

Search historical imagery:

```
HISTORICAL SATELLITE & STREET VIEW
==================================

Known Addresses (from all steps):
| Address | Source | Date Range | Relevance |
|---------|--------|------------|-----------|
| [address 1] | [WHOIS/bio/etc] | [dates] | [home/work/etc] |
| [address 2] | [source] | [dates] | [relevance] |

Google Earth Historical Imagery:
| Address | Imagery Dates | Changes Observed | Notes |
|---------|---------------|------------------|-------|
| [address] | [date range] | [building/activity] | [findings] |

Street View Timeline:
| Address | Street View Dates | Observations |
|---------|-------------------|--------------|
| [address] | [available dates] | [vehicles/signs/etc] |

Infrastructure at Locations:
| Location | Feature | First Seen | Last Seen | Notes |
|----------|---------|------------|-----------|-------|
| [location] | [building/sign/etc] | [date] | [date] | [relevance] |

Historical Maps/Imagery Sources:
| Source | Coverage | Date Range | Findings |
|--------|----------|------------|----------|
| Google Earth | [area] | [dates] | [relevant changes] |
| Bing Maps | [area] | [dates] | [findings] |
| Historic aerial | [area] | [dates] | [findings] |

□ Historical imagery findings:
  - [ ] Address locations verified
  - [ ] Building/business changes tracked
  - [ ] Vehicles/equipment observed
  - [ ] Temporal changes documented

IMAGERY ANALYSIS SCORE: [0-100]
```

### 4. Location Metadata Aggregation

Aggregate all location data:

```
LOCATION METADATA AGGREGATION
=============================

All Location Data Sources:
| Source | Step | Data Type | Locations | Date Range |
|--------|------|-----------|-----------|------------|
| Breach data | 1 | Addresses | [list] | [dates] |
| Forum posts | 1 | Mentioned places | [list] | [dates] |
| WHOIS history | 2 | Registration addresses | [list] | [dates] |
| Wayback profiles | 2 | Bio locations | [list] | [dates] |
| Social check-ins | 3 | Venue check-ins | [list] | [dates] |
| Photo EXIF | 4 | GPS coordinates | [list] | [dates] |
| Photo visual | 4 | Identified places | [list] | [dates] |

Location Frequency Analysis:
| Location | Total References | Sources | Primary Period |
|----------|------------------|---------|----------------|
| [city/area] | [count] | [which sources] | [when most active] |
| [location] | [count] | [sources] | [period] |

Address Correlation:
| Address | First Seen | Last Seen | Sources | Confidence |
|---------|------------|-----------|---------|------------|
| [address] | [date] | [date] | [count] | [H/M/L] |

Country/Region Summary:
| Country | Cities | Date Range | Evidence Weight |
|---------|--------|------------|-----------------|
| [country] | [cities found] | [dates] | [strong/moderate/weak] |

□ Location aggregation findings:
  - [ ] All sources correlated
  - [ ] Primary locations identified
  - [ ] Address timeline built
  - [ ] Geographic scope defined
  - [ ] Confidence levels assigned

AGGREGATION SCORE: [0-100]
```

### 5. Historical Movement Timeline

Build the movement history:

```
HISTORICAL MOVEMENT TIMELINE
============================

Chronological Location History:
| Date | Location | Source | Activity | Confidence |
|------|----------|--------|----------|------------|
| [earliest] | [location] | [evidence] | [what doing] | [H/M/L] |
| [date] | [location] | [evidence] | [activity] | [confidence] |
| [date] | [location] | [evidence] | [activity] | [confidence] |
| ... | ... | ... | ... | ... |
| [latest] | [location] | [evidence] | [activity] | [confidence] |

Residential History:
| Period | Location | Evidence | Notes |
|--------|----------|----------|-------|
| [dates] | [city/address] | [sources] | [confirmed?] |
| [dates] | [new location] | [sources] | [move reason?] |

Travel Pattern Analysis:
| Year | Destinations | Purpose (if known) | Evidence |
|------|--------------|-------------------|----------|
| [year] | [locations] | [business/leisure] | [sources] |

Location Gaps:
| Period | Last Known | Next Known | Gap Duration | Notes |
|--------|------------|------------|--------------|-------|
| [dates] | [location] | [location] | [time] | [unexplained?] |

Movement Patterns:
| Pattern | Description | Evidence |
|---------|-------------|----------|
| [routine] | [commute/regular travel] | [sources] |
| [seasonal] | [vacation patterns] | [check-ins/photos] |
| [one-time] | [relocation/trip] | [evidence] |
```

### 6. Final Report Assembly

Compile the Digital Necromancy report:

```markdown
═══════════════════════════════════════════════════════════════

              DIGITAL NECROMANCY: RESURRECTION REPORT

═══════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
CASE: [Target identifier]
PREPARED BY: Intel Team

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
-----------------

Target: [Primary identifier]
Investigation Period: [Date range covered by recovered data]
Recovery Success: [Overall assessment]

Key Finding: [One sentence summary of most important discovery]

═══════════════════════════════════════════════════════════════

SECTION 1: UNDERGROUND HISTORY (Step 1 - Shadow)
------------------------------------------------

Deep Historical Score: [X/100]

Key Recoveries:
- Breach exposure: [summary]
- Forum history: [summary]
- Marketplace presence: [summary]

Identity Trail:
| Period | Handle | Platform | Activity |
|--------|--------|----------|----------|
| [dates] | [handle] | [platform] | [type] |

═══════════════════════════════════════════════════════════════

SECTION 2: TECHNICAL ARCHAEOLOGY (Step 2 - Probe)
-------------------------------------------------

Technical Score: [X/100]

Infrastructure Timeline:
- Domains: [list with dates]
- Subdomains discovered: [count]
- Certificates found: [count]
- Code repositories: [summary]

Technology Evolution:
| Period | Infrastructure | Technology |
|--------|----------------|------------|
| [dates] | [domains/hosting] | [stack] |

═══════════════════════════════════════════════════════════════

SECTION 3: SOCIAL RESURRECTION (Step 3 - Echo)
----------------------------------------------

Social Score: [X/100]

Platform Presence:
| Platform | Handle | Status | Content Recovered |
|----------|--------|--------|-------------------|
| [platform] | [handle] | [deleted/archived] | [count] |

Username Evolution:
| Period | Username | Platforms |
|--------|----------|-----------|
| [dates] | [handle] | [platforms] |

Significant Recovered Content:
1. [Most significant]
2. [Second]
3. [Third]

═══════════════════════════════════════════════════════════════

SECTION 4: HISTORICAL LOCATION (Step 4 - Atlas)
-----------------------------------------------

Location Score: [X/100]

Geographic Profile:
| Period | Primary Location | Evidence |
|--------|------------------|----------|
| [dates] | [location] | [sources] |

Location Heat Map:
| Location | Frequency | Period |
|----------|-----------|--------|
| [place] | [high/med/low] | [dates] |

Movement Timeline:
[Key location events chronologically]

═══════════════════════════════════════════════════════════════

SECTION 5: DIGITAL TIMELINE
---------------------------

[Comprehensive chronological timeline combining all sources]

| Date | Event | Platform/Source | Evidence |
|------|-------|-----------------|----------|
| [earliest] | [first digital presence] | [source] | [link/ref] |
| ... | ... | ... | ... |
| [latest] | [last known activity] | [source] | [link/ref] |

═══════════════════════════════════════════════════════════════

SECTION 6: IDENTITY EVOLUTION
-----------------------------

Username/Handle Changes:
| Period | Identity | Platforms | Trigger (if known) |
|--------|----------|-----------|-------------------|
| [dates] | [name/handle] | [platforms] | [why changed?] |

Profile Evolution:
| Date | Change Type | Before | After |
|------|-------------|--------|-------|
| [date] | [bio/photo/etc] | [old] | [new] |

═══════════════════════════════════════════════════════════════

SECTION 7: DELETED CONTENT ARCHIVE
----------------------------------

Recovered Deletions by Platform:
| Platform | Content Type | Count | Significance |
|----------|--------------|-------|--------------|
| [platform] | [posts/photos/etc] | [count] | [importance] |

Most Significant Recovered Content:
1. [Item 1 - what it was, why significant]
2. [Item 2]
3. [Item 3]

═══════════════════════════════════════════════════════════════

SECTION 8: GAPS & LIMITATIONS
-----------------------------

Unrecovered Periods:
| Period | Platforms | Attempts | Possible Reasons |
|--------|-----------|----------|------------------|
| [dates] | [platforms] | [what tried] | [why failed] |

Data Quality Issues:
- [Issue 1]
- [Issue 2]

Recommended Follow-Up:
- [Investigation 1]
- [Investigation 2]

═══════════════════════════════════════════════════════════════

APPENDICES
----------

A. Evidence Archive (Screenshots, cached pages)
B. EXIF Data Compilation
C. Check-In Map
D. Username Correlation Matrix
E. Source Documentation

═══════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Steps Completed: 4/4
Agents Engaged: Shadow, Probe, Echo, Atlas

═══════════════════════════════════════════════════════════════
```

---

## WORKFLOW COMPLETION

```markdown
## DIGITAL NECROMANCY COMPLETE

### Final Scores
| Step | Agent | Score |
|------|-------|-------|
| Deep Historical | Shadow | [X/100] |
| Technical Archaeology | Probe | [X/100] |
| Social Resurrection | Echo | [X/100] |
| Historical Location | Atlas | [X/100] |
| **OVERALL RECOVERY** | - | **[X/100]** |

### Recovery Summary
- Earliest digital presence: [date/platform]
- Latest known activity: [date/platform]
- Timeline span: [duration]
- Platforms recovered: [count]
- Deleted content recovered: [count]
- Locations mapped: [count]

### Key Findings
1. [Most significant discovery]
2. [Second most significant]
3. [Third most significant]

### Deliverables
- [ ] Digital Timeline
- [ ] Deleted Content Archive
- [ ] Identity Evolution Map
- [ ] Location History
- [ ] Gap Analysis
- [ ] Evidence Package

### Recommended Follow-On
- [Workflow recommendations based on findings]
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] Photo EXIF analyzed
- [ ] Check-in history reconstructed
- [ ] Historical imagery reviewed
- [ ] Location metadata aggregated
- [ ] Movement timeline built
- [ ] Final report assembled
- [ ] Deliverables compiled
- [ ] Follow-on recommendations provided

---

## MENU OPTIONS

**[R] Report** - Generate final report
**[E] Export** - Export evidence package
**[M] Map** - Generate location map
**[T] Timeline** - Generate visual timeline

---

## WORKFLOW COMPLETE

Digital Necromancy workflow finished. Historical digital presence reconstructed.

Recommended follow-on based on findings:
- **If active threat**: Proceed to Doppelganger Hunt or Attribution Chain
- **If corporate due diligence**: Document findings for stakeholders
- **If historical investigation**: Archive findings with chain of custody
- **If identity verification**: Compare recovered history to current claims
