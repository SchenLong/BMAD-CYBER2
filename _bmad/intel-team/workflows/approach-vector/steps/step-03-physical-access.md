---
name: 'step-03-physical-access'
description: 'Location patterns, frequented venues, travel patterns, residence/workplace mapping'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/approach-vector'
thisStepFile: '{workflow_path}/steps/step-03-physical-access.md'
nextStepFile: '{workflow_path}/steps/step-04-approach-planning.md'
prevStepFile: '{workflow_path}/steps/step-02-social-entry-points.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 3: Physical Access Analysis

## STEP GOAL

Analyze physical access opportunities including location patterns, frequented venues, travel patterns, and residence/workplace mapping to identify optimal physical approach locations.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You map physical access opportunities
- You identify optimal approach locations and timing

### Analysis Protocol
- Map residence and workplace locations
- Identify frequented venues
- Document travel patterns
- Analyze physical security factors
- Develop physical approach recommendations

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Residence/Workplace Mapping

Document primary locations:

```
RESIDENCE/WORKPLACE MAPPING
===========================

Residence:
| Attribute | Value | Source | Confidence |
|-----------|-------|--------|------------|
| Address/Area | [location] | [how determined] | [H/M/L] |
| Property type | [apartment/house/condo] | [imagery, records] | [confidence] |
| Neighborhood | [description] | [analysis] | [confidence] |
| Security features | [gate, doorman, cameras] | [observation] | [confidence] |

Residence Approach Assessment:
| Factor | Assessment | Implication |
|--------|------------|-------------|
| Accessibility | [gated, public access] | [can approach?] |
| Foot traffic | [busy, quiet] | [blend in?] |
| Surveillance | [cameras, security] | [detection risk] |
| Natural approach | [delivery, neighbor, lost] | [cover options] |

Workplace:
| Attribute | Value | Source | Confidence |
|-----------|-------|--------|------------|
| Employer | [organization] | [source] | [H/M/L] |
| Address | [location] | [source] | [confidence] |
| Building type | [office tower, campus, etc] | [research] | [confidence] |
| Floor/Suite | [if known] | [source] | [confidence] |

Workplace Approach Assessment:
| Factor | Assessment | Implication |
|--------|------------|-------------|
| Building security | [lobby check-in, badge] | [can access?] |
| Public areas | [cafe, lobby, plaza] | [encounter opportunities] |
| Nearby venues | [restaurants, coffee] | [lunch meetings] |
| External meetings | [client sites, etc] | [alternative venues] |

□ Residence mapped: [Y/N]
□ Workplace mapped: [Y/N]
□ Access assessed: [Y/N]
```

### 2. Frequented Venues

Document regular venues:

```
FREQUENTED VENUES
=================

Dining Venues:
| Venue | Type | Frequency | Day/Time | Companions |
|-------|------|-----------|----------|------------|
| [restaurant 1] | [casual/fine/café] | [weekly/monthly] | [typical] | [alone/others] |
| [restaurant 2] | [type] | [frequency] | [timing] | [companions] |

Approach Potential - Dining:
| Venue | Approach Type | Cover | Feasibility |
|-------|---------------|-------|-------------|
| [venue] | [adjacent table, bar] | [solo diner/waiting for friend] | [H/M/L] |

Fitness/Sports Venues:
| Venue | Type | Frequency | Day/Time | Activity |
|-------|------|-----------|----------|----------|
| [gym] | [gym/club/studio] | [schedule] | [times] | [what they do] |
| [sports venue] | [type] | [frequency] | [timing] | [activity] |

Approach Potential - Fitness:
| Venue | Approach Type | Cover | Feasibility |
|-------|---------------|-------|-------------|
| [gym] | [fellow member] | [same class/routine] | [H/M/L] |

Social/Entertainment Venues:
| Venue | Type | Frequency | Typical Party |
|-------|------|-----------|---------------|
| [bar/club] | [type] | [weekly/monthly] | [alone/friends] |
| [venue 2] | [type] | [frequency] | [companions] |

Retail/Service Venues:
| Venue | Type | Frequency | Opportunity |
|-------|------|-----------|-------------|
| [coffee shop] | [regular] | [daily/weekly] | [casual encounter] |
| [dry cleaner, etc] | [service] | [frequency] | [minimal] |

Religious/Community Venues:
| Venue | Type | Frequency | Community |
|-------|------|-----------|-----------|
| [place of worship] | [type] | [weekly?] | [congregation] |
| [community center] | [type] | [frequency] | [community] |

Top Approach Venues:
| Rank | Venue | Approach Type | Best Timing | Risk |
|------|-------|---------------|-------------|------|
| 1 | [best venue] | [approach] | [when] | [H/M/L] |
| 2 | [second] | [approach] | [timing] | [risk] |
| 3 | [third] | [approach] | [timing] | [risk] |

□ Venues documented: [count]
□ Approach venues identified: [count]
□ Risk assessed: [Y/N]
```

### 3. Commute Pattern Analysis

Document travel patterns:

```
COMMUTE PATTERN ANALYSIS
========================

Home-Work Commute:
| Attribute | Value | Source |
|-----------|-------|--------|
| Mode | [car/train/subway/bike] | [observation, inference] |
| Route | [known/estimated] | [patterns] |
| Departure time | [typical] | [online activity, posts] |
| Arrival time | [typical] | [patterns] |
| Duration | [estimated] | [distance/mode] |

Commute Approach Opportunities:
| Point | Location | Approach Type | Feasibility |
|-------|----------|---------------|-------------|
| Departure | [home area] | [neighborhood encounter] | [H/M/L] |
| Transit point | [station, parking] | [fellow commuter] | [feasibility] |
| Arrival | [work area] | [coffee shop, street] | [feasibility] |
| Return | [reverse] | [evening encounter] | [feasibility] |

Regular Travel Patterns:
| Pattern | Frequency | Route/Destination | Timing |
|---------|-----------|-------------------|--------|
| Gym commute | [X/week] | [home to gym] | [times] |
| Weekend routine | [pattern] | [usual destinations] | [timing] |
| Social outings | [pattern] | [areas, venues] | [timing] |

Transportation Mode Details:
| Mode | Details | Approach Implication |
|------|---------|---------------------|
| Personal vehicle | [make, model if known] | [parking lot approach] |
| Rideshare | [frequent use?] | [limited opportunity] |
| Public transit | [lines, stations] | [fellow commuter] |
| Walking | [routes] | [street encounter] |

□ Commute mapped: [Y/N]
□ Approach points: [identified]
□ Best timing: [documented]
```

### 4. Travel Patterns

Document broader travel patterns:

```
TRAVEL PATTERNS
===============

Domestic Travel:
| Destination | Frequency | Purpose | Timing |
|-------------|-----------|---------|--------|
| [city 1] | [monthly/quarterly] | [business/family] | [typical] |
| [city 2] | [frequency] | [purpose] | [timing] |

International Travel:
| Destination | Frequency | Purpose | Timing |
|-------------|-----------|---------|--------|
| [country] | [annual/occasional] | [purpose] | [when] |

Travel Approach Opportunities:
| Travel Type | Approach Venue | Method | Feasibility |
|-------------|----------------|--------|-------------|
| Conferences | [events they attend] | [fellow attendee] | [H/M/L] |
| Airport lounge | [if known] | [casual encounter] | [feasibility] |
| Hotel preference | [chain, tier] | [lobby, bar] | [feasibility] |

Upcoming Travel (Known):
| Trip | Destination | Dates | Purpose | Source |
|------|-------------|-------|---------|--------|
| [trip] | [destination] | [dates] | [purpose] | [how known] |

Travel Preferences:
| Preference | Detail | Implication |
|------------|--------|-------------|
| Airline | [if known] | [lounge, gate] |
| Hotel | [chain preference] | [loyalty approach] |
| Travel style | [business/economy] | [venue selection] |

□ Travel patterns: [documented]
□ Upcoming travel: [identified/none]
□ Travel approach: [opportunities identified]
```

### 5. Physical Security Assessment

Assess security factors:

```
PHYSICAL SECURITY ASSESSMENT
============================

Personal Security:
| Factor | Status | Evidence |
|--------|--------|----------|
| Security detail | [Y/N] | [observation] |
| Awareness level | [high/medium/low] | [behavior patterns] |
| Varies routine | [Y/N] | [pattern analysis] |
| Counter-surveillance | [trained/none] | [assessment] |

Residence Security:
| Factor | Status | Implication |
|--------|--------|-------------|
| Gated community | [Y/N] | [access difficulty] |
| Doorman/Security | [Y/N] | [visitor logging] |
| Camera coverage | [extensive/some/none] | [detection risk] |
| Alarm system | [Y/N] | [not relevant to approach] |

Workplace Security:
| Factor | Status | Implication |
|--------|--------|-------------|
| Lobby security | [level] | [visitor check-in] |
| Badge access | [required] | [escort needed] |
| Visitor policy | [strict/moderate/lax] | [meeting feasibility] |
| External meeting | [preference] | [off-site opportunity] |

Venue Security Considerations:
| Venue Type | Typical Security | Approach Adjustment |
|------------|------------------|---------------------|
| Restaurants | [none/minimal] | [direct approach OK] |
| Fitness | [membership only] | [join to access] |
| Events | [varies] | [registration, badge] |
| Coffee shops | [none] | [easy access] |

Detection Risks:
| Scenario | Risk Level | Mitigation |
|----------|------------|------------|
| Workplace approach | [H/M/L] | [use external venues] |
| Residence approach | [risk] | [avoid, use public] |
| Event approach | [risk] | [legitimate attendance] |
| Venue encounter | [risk] | [natural cover] |

□ Security assessed: [Y/N]
□ High-risk areas: [identified]
□ Safe approach zones: [identified]
```

### 6. Physical Approach Locations

Compile optimal approach locations:

```
PHYSICAL APPROACH LOCATIONS
===========================

Location Ranking:
| Rank | Location | Type | Timing | Cover Story | Risk |
|------|----------|------|--------|-------------|------|
| 1 | [best location] | [venue type] | [when] | [natural reason] | [H/M/L] |
| 2 | [second] | [type] | [timing] | [cover] | [risk] |
| 3 | [third] | [type] | [timing] | [cover] | [risk] |
| 4 | [fourth] | [type] | [timing] | [cover] | [risk] |
| 5 | [fifth] | [type] | [timing] | [cover] | [risk] |

Detailed Location Analysis:

**Location #1: [Name]**
- Address: [location]
- Best approach day: [day of week]
- Best approach time: [time range]
- Expected companions: [alone/others]
- Duration at location: [typical time]
- Cover story: [reason for being there]
- Approach method: [accidental encounter, intro, etc]
- Exit strategy: [how to disengage naturally]
- Risk factors: [specific risks]

**Location #2: [Name]**
[Same format]

**Location #3: [Name]**
[Same format]

Backup Locations:
| Location | Use When | Notes |
|----------|----------|-------|
| [backup 1] | [primary unavailable] | [considerations] |
| [backup 2] | [alternative scenario] | [notes] |

□ Locations ranked: [Y/N]
□ Detailed analysis: [count]
□ Backup locations: [identified]
```

### 7. Physical Access Summary

Compile physical access findings:

```
PHYSICAL ACCESS SUMMARY
=======================

Location Profile:
| Location | Confirmed | Approach Potential |
|----------|-----------|-------------------|
| Residence | [location] | [H/M/L] |
| Workplace | [location] | [H/M/L] |
| Primary venue | [venue] | [H/M/L] |

Movement Patterns:
| Pattern | Description | Approach Opportunity |
|---------|-------------|---------------------|
| Commute | [summary] | [best point] |
| Routine | [summary] | [best point] |
| Travel | [summary] | [opportunities] |

Top Physical Approach Locations:
| Rank | Location | Why |
|------|----------|-----|
| 1 | [location] | [rationale] |
| 2 | [location] | [rationale] |
| 3 | [location] | [rationale] |

Security Considerations:
| Factor | Assessment | Impact |
|--------|------------|--------|
| Personal awareness | [level] | [caution level] |
| Location security | [level] | [venue selection] |
| Pattern variation | [level] | [timing flexibility] |

HANDOFF TO SPECTER (Step 4):
- Best approach locations: [ranked list]
- Timing windows: [when to approach]
- Cover story requirements: [what cover needed]
- Risk factors: [to address in planning]
- Social entry synergy: [how physical + social combine]
- Security considerations: [to plan around]
```

---

## STEP 3 OUTPUT

```markdown
## PHYSICAL ACCESS ANALYSIS COMPLETE

### Location Profile
- Residence: [area, access]
- Workplace: [location, access]
- Primary venues: [count]

### Top Approach Locations
1. [Location 1] - [timing]
2. [Location 2] - [timing]
3. [Location 3] - [timing]

### Movement Patterns
- Commute: [summary]
- Regular routine: [summary]
- Travel frequency: [assessment]

### Security Assessment
- Awareness level: [H/M/L]
- Detection risk: [H/M/L]
- Safe approach zones: [list]

### Best Approach Window
- Location: [where]
- Day: [when]
- Time: [range]
- Cover: [story]

### Next Step
Step 4: Approach Planning (Specter)
Focus: [cover story, scenarios, contingencies]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Residence/workplace mapped
- [ ] Venues documented
- [ ] Commute analyzed
- [ ] Travel patterns identified
- [ ] Security assessed
- [ ] Approach locations ranked
- [ ] Handoff prepared for Specter

---

## MENU OPTIONS

**[C] Continue** - Proceed to approach planning (Step 4)
**[L] Locations** - Deeper location analysis
**[V] Venues** - Extended venue mapping
**[S] Security** - Detailed security assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-approach-planning.md`
