---
name: 'step-04-geographic-mapping'
description: 'Physical infrastructure locations, cell tower coverage, WiFi environment, collection position analysis'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/signal-landscape'
thisStepFile: '{workflow_path}/steps/step-04-geographic-mapping.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-03-infrastructure-signals.md'

# Agent Configuration
executing_agent: geospatial-analyst
agent_codename: Atlas
---

# Step 4: Geographic Signal Mapping

## STEP GOAL

Map physical infrastructure locations, analyze cell tower coverage, assess WiFi environments, and identify optimal collection positions for signals intelligence operations.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Atlas**, Geospatial Analyst
- You specialize in GEOINT and location intelligence
- You map physical infrastructure for collection planning
- You identify optimal signal collection positions

### Analysis Protocol

- Map physical infrastructure locations
- Analyze cell tower coverage
- Assess WiFi environments
- Identify collection positions
- Develop geographic collection plan

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Physical Infrastructure Locations

Map target's physical infrastructure:

```
PHYSICAL INFRASTRUCTURE LOCATIONS
=================================

Primary Facilities:
| Facility | Type | Address | Coordinates | Purpose |
|----------|------|---------|-------------|---------|
| Headquarters | Office | [address] | [lat, long] | Primary operations |
| Data center | DC | [address] | [coords] | IT infrastructure |
| Branch office | Office | [address] | [coords] | Regional ops |
| Residence | Home | [address] | [coords] | Personal |
| [other] | [type] | [address] | [coords] | [purpose] |

Data Center Infrastructure:
| Provider | Location | Facility ID | Purpose | Access Type |
|----------|----------|-------------|---------|-------------|
| [AWS/Azure/etc] | [region] | [DC ID] | [hosting] | [colo/cloud] |
| [colo provider] | [address] | [facility] | [equipment] | [cage/suite] |

Network Points of Presence:
| Location | Type | Provider | Equipment |
|----------|------|----------|-----------|
| [city] | POP | [carrier] | [router/switch] |
| [city] | IXP | [exchange] | [connection] |

ISP Infrastructure:
| ISP | Service Address | Circuit ID | Type | Speed |
|-----|-----------------|------------|------|-------|
| [ISP] | [address] | [circuit] | [fiber/cable] | [Gbps] |

Facility Security Assessment:
| Facility | Physical Security | Electronic Security | Access Control |
|----------|-------------------|---------------------|----------------|
| [facility] | [guards, cameras] | [monitoring] | [badge, biometric] |

Geographic Spread:
| Region | Facilities | Key Location | Significance |
|--------|------------|--------------|--------------|
| [region 1] | [count] | [main facility] | [purpose] |
| [region 2] | [count] | [main facility] | [purpose] |

□ Facilities mapped: [count]
□ Geographic regions: [count]
□ Security assessed: [Y/N]
```

### 2. Cell Tower Coverage Analysis

Analyze cellular coverage for collection:

```
CELL TOWER COVERAGE ANALYSIS
============================

Carrier Identification:
| Location | Carrier | Technology | Tower Locations |
|----------|---------|------------|-----------------|
| [facility] | [carrier] | [4G/5G] | [nearby towers] |
| [residence] | [carrier] | [technology] | [towers] |

Tower Density by Location:
| Location | Towers (1km) | Carriers | Best Coverage |
|----------|--------------|----------|---------------|
| [HQ address] | [count] | [carriers] | [carrier] |
| [residence] | [count] | [carriers] | [carrier] |
| [frequent venue] | [count] | [carriers] | [carrier] |

Cell Site Details:
| Tower ID | Location | Carriers | Technology | Range |
|----------|----------|----------|------------|-------|
| [site ID] | [coords] | [carriers] | [4G/5G] | [coverage] |

IMSI Collection Feasibility:
| Location | Feasibility | Equipment Needed | Legal Authority |
|----------|-------------|------------------|-----------------|
| [location 1] | [H/M/L] | [IMSI catcher type] | [requirement] |
| [location 2] | [feasibility] | [equipment] | [authority] |

Carrier Cooperation:
| Carrier | Legal Process | Response Time | Data Available |
|---------|---------------|---------------|----------------|
| [carrier 1] | [process] | [timeline] | [CDRs, location, content] |
| [carrier 2] | [process] | [timeline] | [data types] |

Cell Collection Opportunities:
| Opportunity | Location | Method | Data Access |
|-------------|----------|--------|-------------|
| CDR access | [carrier] | Legal process | Call records, location |
| Real-time | [location] | [method] | Live tracking |
| IMSI capture | [location] | Proximity device | Device ID |

□ Carriers identified: [count]
□ Tower coverage: [mapped]
□ Collection opportunities: [count]
```

### 3. WiFi Environment Mapping

Assess WiFi environments:

```
WIFI ENVIRONMENT MAPPING
========================

Home Network:
| SSID | Encryption | Channel | Signal Range | Devices |
|------|------------|---------|--------------|---------|
| [home SSID] | [WPA2/WPA3] | [channel] | [meters] | [count] |
| [IoT network] | [encryption] | [channel] | [range] | [devices] |

Workplace Network:
| SSID | Type | Encryption | Coverage | Access |
|------|------|------------|----------|--------|
| [corporate SSID] | Enterprise | [WPA2-Ent] | [building] | [802.1x] |
| [guest SSID] | Guest | [WPA2-PSK] | [limited] | [captive portal] |

Frequented Venue Networks:
| Venue | SSID | Type | Security | Collection Potential |
|-------|------|------|----------|---------------------|
| [coffee shop] | [SSID] | Open/PSK | [level] | [H/M/L] |
| [gym] | [SSID] | [type] | [level] | [potential] |
| [restaurant] | [SSID] | [type] | [level] | [potential] |

WiFi Probe Request Analysis:
| Device | Probe Requests | Preferred Networks | Tracking |
|--------|----------------|-------------------|----------|
| [device 1] | [SSIDs probed] | [networks] | [feasibility] |
| [device 2] | [SSIDs] | [networks] | [feasibility] |

WiFi Collection Positions:
| Location | Position | Equipment | Range | Cover |
|----------|----------|-----------|-------|-------|
| [home] | [where] | [equipment] | [meters] | [natural?] |
| [office] | [where] | [equipment] | [range] | [cover] |
| [venue] | [where] | [equipment] | [range] | [cover] |

WiFi Attack Surface:
| Vector | Feasibility | Equipment | Outcome |
|--------|-------------|-----------|---------|
| Evil twin | [H/M/L] | [equipment] | [credential capture] |
| Deauth attack | [feasibility] | [equipment] | [force reconnect] |
| PMKID capture | [feasibility] | [equipment] | [offline crack] |
| Passive capture | [feasibility] | [equipment] | [traffic analysis] |

WiFi Collection Opportunities:
| Opportunity | Location | Method | Data Access |
|-------------|----------|--------|-------------|
| [opportunity 1] | [location] | [method] | [data] |
| [opportunity 2] | [location] | [method] | [data] |

□ Networks mapped: [count]
□ Probe patterns: [analyzed]
□ Collection positions: [count]
```

### 4. Collection Position Analysis

Identify optimal collection positions:

```
COLLECTION POSITION ANALYSIS
============================

Position Requirements:
| Target | Range Needed | Duration | Equipment | Cover Type |
|--------|--------------|----------|-----------|------------|
| [target 1] | [meters] | [hours/days] | [equipment] | [vehicle/static] |
| [target 2] | [range] | [duration] | [equipment] | [cover] |

Candidate Positions - Residence:
| Position | Type | Range | Cover | Duration | Risk |
|----------|------|-------|-------|----------|------|
| [pos 1] | [vehicle/static] | [m] | [cover story] | [max time] | [H/M/L] |
| [pos 2] | [type] | [range] | [cover] | [duration] | [risk] |
| [pos 3] | [type] | [range] | [cover] | [duration] | [risk] |

Candidate Positions - Workplace:
| Position | Type | Range | Cover | Duration | Risk |
|----------|------|-------|-------|----------|------|
| [pos 1] | [type] | [range] | [cover] | [duration] | [H/M/L] |
| [pos 2] | [type] | [range] | [cover] | [duration] | [risk] |

Candidate Positions - Venues:
| Venue | Position | Type | Range | Cover | Risk |
|-------|----------|------|-------|-------|------|
| [venue 1] | [position] | [inside/outside] | [range] | [cover] | [H/M/L] |
| [venue 2] | [position] | [type] | [range] | [cover] | [risk] |

Position Evaluation:
| Position | Cellular | WiFi | RF | Visual | Overall Score |
|----------|----------|------|----|---------|--------------|
| [pos 1] | [Y/N] | [Y/N] | [Y/N] | [Y/N] | [1-10] |
| [pos 2] | [capable] | [capable] | [capable] | [capable] | [score] |

Environmental Factors:
| Position | Traffic | Lighting | Weather Cover | Parking | Power |
|----------|---------|----------|---------------|---------|-------|
| [pos 1] | [level] | [day/night] | [shelter?] | [available] | [access] |

Counter-Surveillance Risk:
| Position | Detection Risk | Mitigation | Abort Route |
|----------|----------------|------------|-------------|
| [pos 1] | [H/M/L] | [measures] | [exit path] |
| [pos 2] | [risk] | [mitigation] | [route] |

Optimal Positions:
| Rank | Position | Target | Collection Types | Duration |
|------|----------|--------|------------------|----------|
| 1 | [best position] | [target] | [cell, WiFi, RF] | [max safe] |
| 2 | [second] | [target] | [types] | [duration] |
| 3 | [third] | [target] | [types] | [duration] |

□ Positions evaluated: [count]
□ Optimal positions: [count]
□ Risk assessed: [Y/N]
```

### 5. Equipment and Legal Requirements

Document equipment and legal requirements:

```
EQUIPMENT AND LEGAL REQUIREMENTS
================================

Equipment Matrix:
| Collection Type | Equipment | Cost Range | Portability | Skill Level |
|-----------------|-----------|------------|-------------|-------------|
| IMSI capture | [model] | [$X-$Y] | [portable/fixed] | [H/M/L] |
| WiFi capture | [equipment] | [cost] | [portability] | [skill] |
| RF intercept | [equipment] | [cost] | [portability] | [skill] |
| Directional | [antenna] | [cost] | [portability] | [skill] |

Equipment Recommendations:
| Scenario | Primary | Backup | Total Cost |
|----------|---------|--------|------------|
| [scenario 1] | [equipment] | [backup] | [$X] |
| [scenario 2] | [equipment] | [backup] | [cost] |

Legal Authority Requirements:
| Collection Type | Authority | Court | Process Time |
|-----------------|-----------|-------|--------------|
| Content intercept | Title III / FISA | [court] | [weeks/months] |
| Metadata | Pen register | [court] | [timeline] |
| Location (real-time) | [authority] | [court] | [timeline] |
| Location (historical) | [subpoena/warrant] | [process] | [timeline] |
| WiFi intercept | [authority] | [consideration] | [timeline] |

Jurisdictional Considerations:
| Location | Jurisdiction | Authority | Constraints |
|----------|--------------|-----------|-------------|
| [location 1] | [federal/state] | [applicable law] | [constraints] |
| [location 2] | [jurisdiction] | [authority] | [constraints] |

Operational Security Requirements:
| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| Attribution avoidance | [method] | [how to verify] |
| Equipment security | [method] | [verification] |
| Communication security | [method] | [verification] |
| Position security | [method] | [verification] |

□ Equipment specified: [Y/N]
□ Legal requirements: [documented]
□ OPSEC requirements: [defined]
```

### 6. SIGINT Collection Plan Assembly

Compile final SIGINT collection plan:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                       SIGINT COLLECTION PLAN

═══════════════════════════════════════════════════════════════════════════════

TARGET: [Target identifier]
DATE: [Current date]
CLASSIFICATION: [As appropriate]

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Signal Environment:
| Category | Status | Collection Feasibility |
|----------|--------|----------------------|
| Communications | [encrypted/clear] | [H/M/L] |
| Devices | [count identified] | [H/M/L] |
| Infrastructure | [mapped] | [H/M/L] |
| Geographic | [locations] | [H/M/L] |

Overall Collection Assessment:
- Feasibility: [H/M/L]
- Value: [H/M/L]
- Risk: [H/M/L]
- Legal complexity: [H/M/L]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 1: SIGNAL ENVIRONMENT

═══════════════════════════════════════════════════════════════════════════════

[Summary from Step 1 - Sigil's analysis]

Communications:
| Platform | Usage | Encryption | Collection Method |
|----------|-------|------------|-------------------|

Devices:
| Device | Type | Collection Potential |
|--------|------|---------------------|

═══════════════════════════════════════════════════════════════════════════════

                  SECTION 2: TECHNICAL VULNERABILITIES

═══════════════════════════════════════════════════════════════════════════════

[Summary from Step 2 - Probe's analysis]

Top Vulnerabilities:
| Vulnerability | Target | Exploitability |
|---------------|--------|----------------|

═══════════════════════════════════════════════════════════════════════════════

                  SECTION 3: INFRASTRUCTURE SIGNALS

═══════════════════════════════════════════════════════════════════════════════

[Summary from Step 3 - Resolver's analysis]

Collection Points:
| Point | Method | Data Access |
|-------|--------|-------------|

═══════════════════════════════════════════════════════════════════════════════

                   SECTION 4: GEOGRAPHIC COLLECTION

═══════════════════════════════════════════════════════════════════════════════

Physical Locations:
| Location | Purpose | Collection Opportunity |
|----------|---------|----------------------|

Optimal Collection Positions:
| Position | Target | Collection Types | Risk |
|----------|--------|------------------|------|

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 5: COLLECTION PRIORITIES

═══════════════════════════════════════════════════════════════════════════════

| Rank | Target | Method | Value | Feasibility | Legal Path |
|------|--------|--------|-------|-------------|------------|
| 1 | [target] | [method] | [H/M/L] | [H/M/L] | [authority] |
| 2 | [target] | [method] | [value] | [feasibility] | [authority] |
| 3 | [target] | [method] | [value] | [feasibility] | [authority] |
| 4 | [target] | [method] | [value] | [feasibility] | [authority] |
| 5 | [target] | [method] | [value] | [feasibility] | [authority] |

═══════════════════════════════════════════════════════════════════════════════

                     SECTION 6: EQUIPMENT REQUIREMENTS

═══════════════════════════════════════════════════════════════════════════════

| Equipment | Purpose | Cost | Priority |
|-----------|---------|------|----------|
| [equipment] | [purpose] | [$X] | [H/M/L] |

Total Estimated Cost: $[X]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 7: LEGAL CONSIDERATIONS

═══════════════════════════════════════════════════════════════════════════════

| Collection Type | Authority Required | Court | Timeline |
|-----------------|-------------------|-------|----------|
| [type] | [authority] | [court] | [time] |

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 8: OPERATIONAL SECURITY

═══════════════════════════════════════════════════════════════════════════════

| Requirement | Implementation |
|-------------|----------------|
| Attribution avoidance | [method] |
| Counter-detection | [measures] |
| Communication | [secure channels] |

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Signal Environment Map
Appendix B: Infrastructure Diagram
Appendix C: Position Maps
Appendix D: Equipment Specifications
Appendix E: Legal Authority Templates

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Signal Landscape
Steps Completed: 4/4
Agents Engaged: Sigil, Probe, Resolver, Atlas

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 4 OUTPUT

```markdown
## GEOGRAPHIC SIGNAL MAPPING COMPLETE

### Physical Locations
- Facilities mapped: [count]
- Geographic regions: [count]
- Data centers: [count]

### Cell Coverage
- Carriers identified: [count]
- Towers mapped: [count]
- IMSI feasibility: [H/M/L]

### WiFi Environment
- Networks mapped: [count]
- Collection venues: [count]
- Attack surface: [assessment]

### Collection Positions
- Positions evaluated: [count]
- Optimal positions: [count]
- Risk level: [H/M/L]

### Equipment Required
- Total items: [count]
- Estimated cost: $[X]

### SIGINT Collection Plan Complete

Top Collection Priorities:
1. [Priority 1] - [method]
2. [Priority 2] - [method]
3. [Priority 3] - [method]

### Next Steps
1. Obtain required legal authority
2. Procure equipment
3. Conduct reconnaissance of positions
4. Execute collection plan
```

---

## COMPLETION CRITERIA

Workflow complete when:

- [ ] Physical locations mapped
- [ ] Cell coverage analyzed
- [ ] WiFi environments assessed
- [ ] Collection positions identified
- [ ] Equipment requirements documented
- [ ] Final SIGINT plan assembled

---

## MENU OPTIONS

**[E] Export** - Export full SIGINT Collection Plan
**[P] Positions** - Detailed position analysis
**[Q] Equipment** - Equipment specifications
**[L] Legal** - Legal authority details

---

## WORKFLOW COMPLETE

Signal Landscape workflow complete.

Recommended follow-on:

- Consider **Ground Truth** workflow for field operation preparation
- Consider **Pattern of Life** for timing optimization
- Coordinate with legal for authority acquisition
- Schedule equipment procurement and testing
