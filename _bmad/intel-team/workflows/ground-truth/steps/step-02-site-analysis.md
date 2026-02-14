---
name: 'step-02-site-analysis'
description: 'Satellite imagery analysis, terrain assessment, entry/exit points, observation positions, environmental factors'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/ground-truth'
thisStepFile: '{workflow_path}/steps/step-02-site-analysis.md'
nextStepFile: '{workflow_path}/steps/step-03-electronic-environment.md'
prevStepFile: '{workflow_path}/steps/step-01-operation-framework.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 2: Site Analysis

## STEP GOAL

Conduct comprehensive site analysis including satellite imagery review, terrain assessment, identification of entry/exit points, observation position selection, and environmental factor analysis for operational planning.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You analyze terrain and physical environments for operations
- You identify optimal positions and routes for field activities

### Analysis Protocol
- Analyze available satellite/aerial imagery
- Assess terrain and physical environment
- Identify entry and exit points
- Select observation positions
- Document environmental factors

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Satellite/Aerial Imagery Analysis

Analyze available imagery:

```
SATELLITE/AERIAL IMAGERY ANALYSIS
=================================

Imagery Sources Consulted:
| Source | Date | Resolution | Coverage |
|--------|------|------------|----------|
| Google Earth/Maps | [date checked] | [standard] | [area] |
| Bing Maps | [date] | [resolution] | [coverage] |
| Commercial satellite | [if available] | [resolution] | [coverage] |
| Historical imagery | [date range] | [availability] | [changes noted] |

Primary Location Analysis:
| Feature | Description | Coordinates | Notes |
|---------|-------------|-------------|-------|
| Target building | [description] | [coords] | [key features] |
| Parking areas | [description] | [coords] | [capacity, access] |
| Entry points | [count, description] | [coords] | [access control] |
| Adjacent buildings | [description] | [proximity] | [considerations] |
| Open areas | [description] | [coords] | [visibility] |

Building Assessment:
| Feature | Assessment | Implication |
|---------|------------|-------------|
| Building type | [commercial/residential/industrial] | [access difficulty] |
| Floors | [count] | [target location] |
| Windows | [orientation, blinds] | [observation opportunity] |
| Roof access | [visible?] | [collection position?] |
| Security features | [cameras, guards, barriers] | [detection risk] |

Perimeter Analysis:
| Boundary | Type | Security | Vulnerability |
|----------|------|----------|---------------|
| Front | [fence, open, etc] | [level] | [access potential] |
| Rear | [type] | [security] | [vulnerability] |
| Left side | [type] | [security] | [vulnerability] |
| Right side | [type] | [security] | [vulnerability] |

Imagery Gaps:
| Gap | Impact | Resolution |
|-----|--------|------------|
| [imagery limitation] | [what we can't see] | [ground reconnaissance needed] |

□ Imagery analyzed: [sources]
□ Key features mapped: [count]
□ Gaps identified: [count]
```

### 2. Terrain Assessment

Assess physical terrain:

```
TERRAIN ASSESSMENT
==================

Geographic Context:
| Factor | Assessment | Operational Impact |
|--------|------------|-------------------|
| Urban/suburban/rural | [type] | [cover, concealment] |
| Density | [high/medium/low] | [foot traffic, blend in] |
| Terrain type | [flat, hilly, mixed] | [line of sight] |
| Elevation | [meters] | [observation advantage] |

Line of Sight Analysis:
| From Position | To Target | Obstruction | Visibility |
|---------------|-----------|-------------|------------|
| [position 1] | [target] | [buildings, trees] | [clear/partial/blocked] |
| [position 2] | [target] | [obstructions] | [visibility] |
| [position 3] | [target] | [obstructions] | [visibility] |

Cover and Concealment:
| Area | Cover Available | Concealment | Duration Possible |
|------|-----------------|-------------|-------------------|
| [area 1] | [physical protection] | [visibility from target] | [how long] |
| [area 2] | [cover] | [concealment] | [duration] |

Vegetation Analysis:
| Type | Location | Seasonal Change | Use |
|------|----------|-----------------|-----|
| Trees | [where] | [deciduous/evergreen] | [concealment] |
| Bushes | [where] | [change] | [use] |
| Open grass | [where] | [maintained?] | [visibility] |

Lighting Conditions:
| Time | Natural Light | Artificial Light | Visibility |
|------|---------------|------------------|------------|
| Dawn | [conditions] | [lights active?] | [for surveillance] |
| Day | [conditions] | [N/A] | [visibility] |
| Dusk | [conditions] | [lights coming on] | [visibility] |
| Night | [darkness level] | [streetlights, building] | [visibility] |

Foot Traffic Assessment:
| Area | Traffic Level | Peak Times | Blend-in Potential |
|------|---------------|------------|-------------------|
| [area 1] | [H/M/L] | [times] | [natural cover?] |
| [area 2] | [level] | [peaks] | [potential] |

□ Terrain mapped: [Y/N]
□ Line of sight: [analyzed]
□ Cover/concealment: [identified]
□ Lighting: [assessed]
```

### 3. Entry and Exit Points

Identify entry and exit points:

```
ENTRY AND EXIT POINTS
=====================

Vehicle Approach Routes:
| Route | Direction | Distance | Traffic | Advantages | Disadvantages |
|-------|-----------|----------|---------|------------|---------------|
| Route Alpha | [from] | [km] | [level] | [pros] | [cons] |
| Route Bravo | [from] | [km] | [traffic] | [advantages] | [disadvantages] |
| Route Charlie | [from] | [km] | [traffic] | [advantages] | [disadvantages] |

Pedestrian Approach Routes:
| Route | Starting Point | Distance | Cover | Advantages |
|-------|----------------|----------|-------|------------|
| Route 1 | [from where] | [meters] | [level] | [pros] |
| Route 2 | [from] | [meters] | [cover] | [advantages] |

Primary Entry Point:
| Factor | Details |
|--------|---------|
| Location | [description, coords] |
| Approach | [how to reach] |
| Timing | [optimal time] |
| Cover story | [reason for being there] |
| Risk factors | [detection concerns] |

Alternate Entry Points:
| Entry | Location | Use When | Risk Level |
|-------|----------|----------|------------|
| Alt 1 | [location] | [primary blocked] | [H/M/L] |
| Alt 2 | [location] | [condition] | [risk] |

Primary Exit Route:
| Factor | Details |
|--------|---------|
| Route | [description] |
| Distance to safety | [km/time] |
| Chokepoints | [where] |
| Abort triggers | [when to use] |

Emergency Exit Routes:
| Route | Direction | Use When | Destination |
|-------|-----------|----------|-------------|
| Emergency 1 | [direction] | [compromise suspected] | [safe point] |
| Emergency 2 | [direction] | [alternate emergency] | [destination] |

Rally Points:
| Point | Location | Purpose | Coordinates |
|-------|----------|---------|-------------|
| Primary rally | [location] | [team assembly] | [coords] |
| Alternate rally | [location] | [if primary compromised] | [coords] |
| Emergency rally | [location] | [abort situation] | [coords] |

□ Entry routes: [count]
□ Exit routes: [count]
□ Rally points: [established]
```

### 4. Observation Positions

Select observation positions:

```
OBSERVATION POSITIONS
=====================

Position Requirements:
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Line of sight to target | Critical | [specific target point] |
| Cover from target | Critical | [not visible to target] |
| Natural reason to be there | High | [cover for status] |
| Duration capability | High | [how long needed] |
| Communication capability | High | [signal, line of sight] |
| Exit accessibility | High | [quick departure] |

Primary Observation Position (OP Alpha):
| Factor | Details |
|--------|---------|
| Location | [description, coords] |
| Type | [vehicle/foot/static/building] |
| Line of sight | [what's visible] |
| Cover | [physical and visual] |
| Duration | [max time sustainable] |
| Equipment | [what can be used] |
| Approach | [how to reach] |
| Exit | [departure route] |
| Risk factors | [detection concerns] |
| Cover story | [reason for presence] |

Secondary Position (OP Bravo):
| Factor | Details |
|--------|---------|
| Location | [description, coords] |
| Purpose | [backup, alternate angle] |
| Line of sight | [what's visible] |
| When to use | [conditions for using] |

Tertiary Position (OP Charlie):
| Factor | Details |
|--------|---------|
| Location | [description, coords] |
| Purpose | [counter-surveillance, overwatch] |
| Line of sight | [what's visible] |
| When to use | [conditions] |

Position Rotation Plan:
| Time | Position | Activity | Handoff |
|------|----------|----------|---------|
| [time] | OP Alpha | [activity] | [to whom] |
| [time] | OP Bravo | [activity] | [handoff] |

Position Comparison:
| Position | LoS | Cover | Duration | Risk | Priority |
|----------|-----|-------|----------|------|----------|
| Alpha | [1-10] | [1-10] | [hours] | [H/M/L] | [1-3] |
| Bravo | [score] | [score] | [hours] | [risk] | [priority] |
| Charlie | [score] | [score] | [hours] | [risk] | [priority] |

□ Positions selected: [count]
□ Primary position: [confirmed]
□ Rotation plan: [if needed]
```

### 5. Environmental Factors

Document environmental factors:

```
ENVIRONMENTAL FACTORS
=====================

Weather Considerations:
| Factor | Current/Forecast | Operational Impact | Mitigation |
|--------|------------------|-------------------|------------|
| Temperature | [degrees] | [comfort, duration] | [clothing, breaks] |
| Precipitation | [rain, snow, etc] | [visibility, cover] | [equipment protection] |
| Wind | [speed, direction] | [audio, stability] | [positioning] |
| Cloud cover | [percentage] | [lighting, satellite] | [adjust timing] |
| Visibility | [km] | [observation distance] | [position selection] |

Time-Based Factors:
| Time | Sunrise | Sunset | Moon Phase | Impact |
|------|---------|--------|------------|--------|
| [date] | [time] | [time] | [phase] | [low-light considerations] |

Noise Environment:
| Source | Level | Times | Impact |
|--------|-------|-------|--------|
| Traffic | [H/M/L] | [when] | [audio cover] |
| Industrial | [level] | [times] | [impact] |
| Aircraft | [level] | [patterns] | [impact] |
| Natural | [level] | [when] | [audio masking] |

Local Activity Patterns:
| Activity | Times | Impact on Operation |
|----------|-------|---------------------|
| Business hours | [times] | [target presence] |
| Rush hour | [times] | [traffic, cover] |
| School hours | [times] | [child safety] |
| Local events | [if any] | [crowd, distraction] |

Special Considerations:
| Factor | Details | Mitigation |
|--------|---------|------------|
| Holidays/events | [upcoming] | [adjust timing] |
| Construction | [if present] | [noise, workers] |
| Local security | [patrols, cameras] | [pattern, avoidance] |
| Resident patterns | [dog walkers, etc] | [blend in, avoid] |

Environmental Risk Summary:
| Risk | Level | Mitigation | Residual |
|------|-------|------------|----------|
| Weather | [H/M/L] | [action] | [risk] |
| Timing | [level] | [action] | [residual] |
| Local activity | [level] | [action] | [residual] |
| Detection | [level] | [action] | [residual] |

□ Weather assessed: [Y/N]
□ Timing optimized: [Y/N]
□ Local patterns: [documented]
□ Risks mitigated: [Y/N]
```

### 6. Site Analysis Summary

Compile site analysis findings:

```
SITE ANALYSIS SUMMARY
=====================

Location Overview:
| Factor | Assessment |
|--------|------------|
| Primary target | [location, description] |
| Environment type | [urban/suburban/rural] |
| Security level | [H/M/L] |
| Access difficulty | [H/M/L] |
| Observation feasibility | [H/M/L] |

Key Features:
| Feature | Location | Significance |
|---------|----------|--------------|
| [feature 1] | [where] | [why important] |
| [feature 2] | [where] | [significance] |
| [feature 3] | [where] | [significance] |

Recommended Approach:
| Phase | Route/Position | Timing |
|-------|----------------|--------|
| Approach | [route] | [time] |
| Positioning | [OP] | [duration] |
| Exit | [route] | [trigger] |

Position Summary:
| Position | Priority | Purpose | Risk |
|----------|----------|---------|------|
| OP Alpha | Primary | [purpose] | [H/M/L] |
| OP Bravo | Secondary | [purpose] | [risk] |
| OP Charlie | Tertiary | [purpose] | [risk] |

Environmental Constraints:
| Constraint | Impact | Adjustment |
|------------|--------|------------|
| [constraint] | [impact] | [how to adapt] |

HANDOFF TO SIGIL (Step 3):
- Positions: [for electronic analysis]
- Environment: [RF considerations]
- Security systems: [identified for TSCM]
- Communication needs: [geographic spread]
- Counter-surveillance: [electronic aspects]
```

---

## STEP 2 OUTPUT

```markdown
## SITE ANALYSIS COMPLETE

### Location Summary
- Target: [location description]
- Environment: [type]
- Security level: [H/M/L]
- Access difficulty: [H/M/L]

### Observation Positions
- Primary (Alpha): [description]
- Secondary (Bravo): [description]
- Tertiary (Charlie): [description]

### Routes
- Entry: [primary route]
- Exit: [primary route]
- Emergency: [emergency route]

### Environmental Factors
- Weather impact: [assessment]
- Timing window: [optimal times]
- Local patterns: [considerations]

### Key Risks
1. [Risk 1]
2. [Risk 2]
3. [Risk 3]

### Next Step
Step 3: Electronic Environment (Sigil)
Focus: [TSCM, communications, surveillance detection]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Imagery analyzed
- [ ] Terrain assessed
- [ ] Entry/exit identified
- [ ] Positions selected
- [ ] Environmental factors documented
- [ ] Handoff prepared for Sigil

---

## MENU OPTIONS

**[C] Continue** - Proceed to electronic environment (Step 3)
**[P] Positions** - Refine observation positions
**[R] Routes** - Additional route analysis
**[E] Environment** - Extended environmental assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-electronic-environment.md`

