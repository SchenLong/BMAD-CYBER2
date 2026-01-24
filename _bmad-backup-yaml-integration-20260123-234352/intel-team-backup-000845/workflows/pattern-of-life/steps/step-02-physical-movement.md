---
name: 'step-02-physical-movement'
description: 'Location check-in analysis, photo geolocation timeline, travel patterns, routine identification, anomaly detection'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/pattern-of-life'
thisStepFile: '{workflow_path}/steps/step-02-physical-movement.md'
nextStepFile: '{workflow_path}/steps/step-03-communication-patterns.md'
prevStepFile: '{workflow_path}/steps/step-01-digital-behavior.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 2: Physical Movement Patterns

## STEP GOAL

Analyze the target's physical movement patterns including location check-ins, photo geolocation, travel patterns, routine identification, and establishment of anomaly baselines.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You extract location patterns from digital footprints
- You build movement profiles and identify routines

### Analysis Protocol
- Analyze location check-ins across platforms
- Extract geolocation from photos and posts
- Identify travel patterns and corridors
- Document regular routines
- Establish anomaly detection baseline

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Location Check-in Analysis

Analyze explicit location disclosures:

```
LOCATION CHECK-IN ANALYSIS
==========================

Check-in Platforms:
| Platform | Check-ins Found | Date Range | Location Types |
|----------|-----------------|------------|----------------|
| Facebook | [count] | [range] | [restaurants, events, etc] |
| Instagram | [count] | [range] | [types] |
| Foursquare/Swarm | [count] | [range] | [types] |
| Twitter | [count] | [range] | [types] |
| Google Maps | [count] | [range] | [types] |

Check-in Categories:
| Category | Count | Frequency | Typical Days/Times |
|----------|-------|-----------|-------------------|
| Restaurants/Cafes | [count] | [weekly/monthly] | [patterns] |
| Bars/Nightlife | [count] | [frequency] | [when] |
| Gyms/Fitness | [count] | [frequency] | [schedule] |
| Shopping | [count] | [frequency] | [patterns] |
| Work/Office | [count] | [frequency] | [if disclosed] |
| Entertainment | [count] | [frequency] | [types] |
| Travel/Hotels | [count] | [frequency] | [destinations] |

Frequent Locations:
| Location | Address/Area | Visit Count | Typical Timing | Purpose |
|----------|--------------|-------------|----------------|---------|
| [venue 1] | [location] | [count] | [days/times] | [inferred purpose] |
| [venue 2] | [location] | [count] | [timing] | [purpose] |
| [venue 3] | [location] | [count] | [timing] | [purpose] |

Geographic Concentration:
| Area | Check-ins (%) | Location Types | Inference |
|------|---------------|----------------|-----------|
| [area 1] | [%] | [types] | [home area/work area] |
| [area 2] | [%] | [types] | [inference] |

□ Total check-ins analyzed: [count]
□ Frequent locations: [count]
□ Geographic areas: [count]
```

### 2. Photo Geolocation Timeline

Extract location data from photos:

```
PHOTO GEOLOCATION TIMELINE
==========================

Photo Sources:
| Platform | Photos with Location | Date Range | EXIF Data |
|----------|---------------------|------------|-----------|
| Instagram | [count] | [range] | [available/stripped] |
| Facebook | [count] | [range] | [status] |
| Twitter | [count] | [range] | [status] |
| Flickr | [count] | [range] | [status] |

Location Extraction Methods:
| Method | Photos Geolocated | Confidence |
|--------|-------------------|------------|
| EXIF metadata | [count] | High |
| Explicit tagging | [count] | High |
| Landmark identification | [count] | Medium |
| Background analysis | [count] | Low-Medium |
| Caption/hashtag | [count] | Medium |

Photo Location Timeline:
| Date | Location | Platform | Content Type | Confidence |
|------|----------|----------|--------------|------------|
| [date] | [location] | [platform] | [what shown] | [H/M/L] |
| [date] | [location] | [platform] | [content] | [confidence] |

Landmark Identifications:
| Photo | Landmark/Location | Identification Method | Confidence |
|-------|-------------------|----------------------|------------|
| [photo ID/desc] | [landmark] | [how identified] | [H/M/L] |

Home Location Indicators:
| Indicator | Evidence | Confidence |
|-----------|----------|------------|
| Morning/evening photos | [location pattern] | [H/M/L] |
| Recurring indoor location | [photos] | [confidence] |
| Pet/family at home | [photos] | [confidence] |

Work Location Indicators:
| Indicator | Evidence | Confidence |
|-----------|----------|------------|
| Weekday daytime | [location pattern] | [H/M/L] |
| Office/work setting | [photo evidence] | [confidence] |
| Colleague photos | [recurring people] | [confidence] |

□ Photos geolocated: [count]
□ Home location: [identified/estimated/unknown]
□ Work location: [identified/estimated/unknown]
```

### 3. Travel Pattern Analysis

Identify travel patterns:

```
TRAVEL PATTERN ANALYSIS
=======================

Travel Events:
| Date Range | Destination | Duration | Purpose | Evidence |
|------------|-------------|----------|---------|----------|
| [dates] | [city/country] | [days] | [business/personal] | [posts, photos] |
| [dates] | [destination] | [duration] | [purpose] | [evidence] |

Travel Frequency:
| Travel Type | Frequency | Destinations | Timing |
|-------------|-----------|--------------|--------|
| Domestic | [per year] | [common destinations] | [typical months] |
| International | [per year] | [destinations] | [timing] |
| Business | [per year] | [destinations] | [triggers] |
| Personal/Vacation | [per year] | [destinations] | [seasons] |

Transportation Indicators:
| Transport Type | Evidence | Routes |
|----------------|----------|--------|
| Air travel | [airport check-ins, lounge posts] | [common routes] |
| Car/Driving | [road trip posts, car photos] | [corridors] |
| Train | [station check-ins] | [routes] |
| Rental car | [brand mentions, location jumps] | [usage] |

Travel Patterns:
| Pattern | Frequency | Example |
|---------|-----------|---------|
| Weekend trips | [frequency] | [destinations] |
| Extended travel | [frequency] | [typical duration] |
| Seasonal travel | [when] | [destinations] |
| Event-based travel | [conferences, family events] | [triggers] |

Travel Companions:
| Companion | Relationship | Travel Type | Frequency |
|-----------|--------------|-------------|-----------|
| [person] | [spouse/friend/colleague] | [business/personal] | [always/sometimes] |

Future Travel Indicators:
| Indicator | Destination | Timeframe | Confidence |
|-----------|-------------|-----------|------------|
| [event registration] | [location] | [date] | [H/M/L] |
| [ticket/booking mention] | [destination] | [date] | [confidence] |

□ Travel events documented: [count]
□ Common destinations: [list]
□ Upcoming travel: [identified/none]
```

### 4. Daily Routine Identification

Map regular routines:

```
DAILY ROUTINE IDENTIFICATION
============================

Weekday Routine:
```
TYPICAL WEEKDAY:
06:00-07:00 : [activity indicators - wake up, morning routine]
07:00-08:00 : [morning activity - gym? commute?]
08:00-09:00 : [commute pattern - transport mode, duration]
09:00-12:00 : [work location/activity]
12:00-13:00 : [lunch pattern - location, companions]
13:00-17:00 : [afternoon work/activity]
17:00-18:00 : [end of work, commute home]
18:00-20:00 : [evening activity - gym? social? home?]
20:00-22:00 : [evening routine - dinner, entertainment]
22:00-00:00 : [pre-sleep activity, last online]
```

Weekend Routine:
```
TYPICAL SATURDAY:
08:00-10:00 : [wake up - later than weekday?]
10:00-12:00 : [morning activity - errands, gym, brunch]
12:00-18:00 : [daytime activity - shopping, social, hobbies]
18:00-22:00 : [evening - social, dining, entertainment]
22:00-02:00 : [late night - more active than weekday?]

TYPICAL SUNDAY:
09:00-11:00 : [wake up pattern]
11:00-14:00 : [brunch, relaxation, errands]
14:00-18:00 : [afternoon activity]
18:00-22:00 : [preparation for week, early evening]
```

Routine Locations:
| Time Block | Location | Confidence | Variation |
|------------|----------|------------|-----------|
| Morning | [home area] | [H/M/L] | [low variation] |
| Commute | [route/corridor] | [confidence] | [variation] |
| Work hours | [work location] | [confidence] | [variation] |
| Lunch | [restaurant area] | [confidence] | [high variation?] |
| Evening | [home/social area] | [confidence] | [variation] |

Weekly Patterns:
| Day | Distinguishing Features |
|-----|------------------------|
| Monday | [start of week patterns] |
| Tuesday | [patterns] |
| Wednesday | [mid-week - any regular events?] |
| Thursday | [patterns] |
| Friday | [end of week - social plans?] |
| Saturday | [weekend activities] |
| Sunday | [rest/preparation] |

Recurring Events:
| Event | Day/Time | Location | Frequency |
|-------|----------|----------|-----------|
| [gym visit] | [specific times] | [gym location] | [X times/week] |
| [regular social] | [day, time] | [venue] | [weekly/monthly] |
| [hobby activity] | [when] | [where] | [frequency] |

□ Routine mapped: [Y/N]
□ Regularity level: [highly predictable/somewhat predictable/variable]
□ Key fixed points: [count]
```

### 5. Location Heat Map

Create activity concentration map:

```
LOCATION HEAT MAP
=================

Primary Activity Zones:
| Zone | Center Point | Radius | Activity Type | Time of Day |
|------|--------------|--------|---------------|-------------|
| Home zone | [area/neighborhood] | [km] | Residential | Evening/Morning |
| Work zone | [area] | [km] | Professional | Weekday daytime |
| Social zone | [area] | [km] | Entertainment | Evening/Weekend |
| Exercise zone | [area] | [km] | Fitness | [time patterns] |

Movement Corridors:
| Corridor | From | To | Mode | Timing |
|----------|------|-----|------|--------|
| Commute | [home area] | [work area] | [transport] | [times] |
| Weekend | [home area] | [social area] | [mode] | [timing] |
| Exercise | [home area] | [gym area] | [mode] | [timing] |

Geographic Boundaries:
| Boundary | Normal Range | Exception Triggers |
|----------|--------------|-------------------|
| Weekday | [geographic area] | [business travel] |
| Weekend | [area - may be wider] | [trips, events] |
| Nighttime | [very restricted - home] | [travel, events] |

Location Frequency (Last 90 Days):
| Location Type | Visits | Unique Locations | Concentration |
|---------------|--------|------------------|---------------|
| Home area | [count] | [1-2] | [high] |
| Work area | [count] | [count] | [level] |
| Dining | [count] | [count] | [low/high] |
| Entertainment | [count] | [count] | [level] |
| Travel destinations | [count] | [count] | [level] |

Heat Map Visualization (Text):
```
[HIGH DENSITY]     [MEDIUM]          [LOW]
     ████           ░░░░              ....
    ██████          ░░░░              ....
   ████████         ░░░░              ....
    ██████          ░░░░
     ████

   HOME AREA      WORK AREA       SOCIAL SPOTS
```

□ Activity zones mapped: [count]
□ Primary corridors: [count]
□ Geographic range: [local/regional/national]
```

### 6. Anomaly Detection Baseline

Establish anomaly detection framework:

```
ANOMALY DETECTION BASELINE
==========================

Normal Behavior Baseline:
| Dimension | Normal Range | Measurement Period |
|-----------|--------------|-------------------|
| Geographic range | [X km from home] | [typical day] |
| Active hours | [X:XX - X:XX] | [weekday/weekend] |
| Location types | [home, work, routine spots] | [normal week] |
| Travel radius | [typical distance] | [normal month] |

Anomaly Indicators:
| Indicator | Normal | Anomaly Threshold | Significance |
|-----------|--------|-------------------|--------------|
| Location check-in outside normal area | [0/week] | [>1] | Travel/changed routine |
| Late night activity in new area | [0/month] | [>0] | Unusual behavior |
| Absence from regular location | [0/week] | [>X days] | Travel/illness/change |
| New recurring location | [N/A] | [>3 visits] | New routine/relationship |

High-Significance Anomalies:
| Anomaly Type | Detection Method | Potential Meaning |
|--------------|------------------|-------------------|
| Sudden location change | No activity in normal area | Moved/traveling |
| Pattern disruption | Missed regular events | Schedule change |
| New high-frequency location | Multiple visits to new place | New interest/relationship |
| International location | Out-of-country indicators | Travel |

Monitoring Triggers:
| Trigger | Threshold | Alert Level |
|---------|-----------|-------------|
| Out of normal zone | [X km] | Medium |
| Missed regular event | [count] | Low |
| New country | [any] | High |
| Extended absence | [X days] | High |

□ Baseline established: [Y/N]
□ Anomaly thresholds set: [count]
□ Monitoring triggers defined: [count]
```

### 7. Physical Movement Summary

Compile movement findings:

```
PHYSICAL MOVEMENT SUMMARY
=========================

Location Profile:
| Location | Confirmed | Confidence | Evidence |
|----------|-----------|------------|----------|
| Home | [area/address estimate] | [H/M/L] | [sources] |
| Work | [area/address] | [confidence] | [sources] |
| Gym | [location] | [confidence] | [sources] |
| Regular social | [venues] | [confidence] | [sources] |

Movement Characteristics:
| Characteristic | Pattern |
|----------------|---------|
| Geographic range | [local/regional/frequent traveler] |
| Routine predictability | [high/medium/low] |
| Primary transport | [car/public transit/walking] |
| Travel frequency | [X trips/month] |

Weekly Routine Summary:
| Day | Key Locations | Timing |
|-----|---------------|--------|
| Weekdays | [home → work → home] | [standard hours?] |
| Weekend | [home → social spots] | [variable?] |

Predictive Locations:
| Scenario | Likely Location | Confidence | Best Time |
|----------|-----------------|------------|-----------|
| Weekday morning | [location] | [H/M/L] | [time] |
| Weekday lunch | [area] | [confidence] | [time] |
| Friday evening | [location type] | [confidence] | [time] |
| Saturday afternoon | [location type] | [confidence] | [time] |

HANDOFF TO SIGIL (Step 3):
- Active hours: [from digital + location correlation]
- Device patterns: [mobile activity correlated with location]
- Communication contexts: [when/where communications occur]
- Travel patterns: [for communication continuity analysis]
```

---

## STEP 2 OUTPUT

```markdown
## PHYSICAL MOVEMENT ANALYSIS COMPLETE

### Location Profile
- Home area: [location/confidence]
- Work area: [location/confidence]
- Regular locations: [count]

### Movement Patterns
- Geographic range: [assessment]
- Routine predictability: [high/medium/low]
- Primary transport: [mode]

### Travel Profile
- Frequency: [X trips/month]
- Common destinations: [list]
- Travel triggers: [business/personal]

### Routine Summary
- Weekday pattern: [established]
- Weekend pattern: [established]
- Key fixed points: [list]

### Anomaly Baseline
- Normal geographic range: [defined]
- Triggers established: [count]

### Next Step
Step 3: Communication Patterns (Sigil)
Focus: [active hours, frequency, platforms, network]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Location check-ins analyzed
- [ ] Photo geolocation extracted
- [ ] Travel patterns identified
- [ ] Daily routines mapped
- [ ] Heat map created
- [ ] Anomaly baseline established
- [ ] Handoff prepared for Sigil

---

## MENU OPTIONS

**[C] Continue** - Proceed to communication pattern analysis (Step 3)
**[L] Locations** - Deeper location analysis
**[T] Travel** - Extended travel pattern analysis
**[R] Routine** - Detailed routine mapping

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-03-communication-patterns.md`
