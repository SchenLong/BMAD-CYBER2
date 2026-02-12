---
name: 'step-03-electronic-environment'
description: 'TSCM considerations, communication plan, electronic surveillance awareness, counter-surveillance equipment'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/ground-truth'
thisStepFile: '{workflow_path}/steps/step-03-electronic-environment.md'
nextStepFile: '{workflow_path}/steps/step-04-human-factors.md'
prevStepFile: '{workflow_path}/steps/step-02-site-analysis.md'

# Agent Configuration
executing_agent: sigint-specialist
agent_codename: Sigil
---

# Step 3: Electronic Environment

## STEP GOAL

Assess the electronic environment including TSCM considerations, develop communication plan, document electronic surveillance awareness factors, and specify counter-surveillance equipment requirements.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Sigil**, SIGINT Specialist
- You specialize in signals intelligence and electronic warfare
- You assess electronic threats and develop countermeasures
- You design secure communication plans for field operations

### Analysis Protocol

- Assess TSCM (Technical Surveillance Countermeasures) needs
- Develop field communication plan
- Identify electronic surveillance threats
- Specify counter-surveillance equipment

---

## ANALYSIS EXECUTION SEQUENCE

### 1. TSCM Considerations

Assess technical surveillance countermeasures:

```
TSCM CONSIDERATIONS
===================

Surveillance Threat Assessment:
| Threat Actor | Capability | Likelihood | Impact |
|--------------|------------|------------|--------|
| Target | [technical sophistication] | [H/M/L] | [H/M/L] |
| Target security team | [capability level] | [likelihood] | [impact] |
| Local law enforcement | [capability] | [likelihood] | [impact] |
| Third party | [capability] | [likelihood] | [impact] |

Electronic Detection Threats:
| Threat | Description | Detection Method | Our Vulnerability |
|--------|-------------|------------------|-------------------|
| RF detection | [hostile RF monitoring] | [spectrum analysis] | [our transmissions] |
| Cell tracking | [IMSI catcher] | [device detection] | [our phones] |
| WiFi monitoring | [rogue AP, passive] | [probe detection] | [our devices] |
| GPS tracking | [vehicle tracker] | [RF sweep] | [our vehicles] |
| Audio surveillance | [bugs, lasers] | [RF/optical sweep] | [our conversations] |

Location-Specific Threats:
| Location | Electronic Threats | TSCM Required |
|----------|-------------------|---------------|
| Target facility | [cameras, RF, etc] | [before approach] |
| Observation positions | [detection risk] | [position sweep] |
| Routes | [ANPR, traffic cam] | [route selection] |
| Vehicle | [tracker risk] | [sweep before/after] |

TSCM Requirements:
| Requirement | Priority | Equipment | Timing |
|-------------|----------|-----------|--------|
| Vehicle sweep | [H/M/L] | [detector type] | [when] |
| Position sweep | [priority] | [equipment] | [timing] |
| Device check | [priority] | [equipment] | [timing] |
| Continuous monitoring | [priority] | [equipment] | [during op] |

Pre-Operation TSCM Checklist:
| Action | Responsible | Verified |
|--------|-------------|----------|
| Vehicle RF sweep | [who] | [ ] |
| Vehicle GPS check | [who] | [ ] |
| Device audit | [who] | [ ] |
| Communication test | [who] | [ ] |
| Equipment function check | [who] | [ ] |

□ Threats assessed: [count]
□ TSCM requirements: [defined]
□ Equipment specified: [Y/N]
```

### 2. Communication Plan

Develop operational communication plan:

```
COMMUNICATION PLAN
==================

Communication Requirements:
| Requirement | Priority | Constraint |
|-------------|----------|------------|
| Team-to-team | [H/M/L] | [range, encryption] |
| Team-to-base | [priority] | [range, method] |
| Emergency | [Critical] | [always available] |
| Covert | [priority] | [undetectable] |

Primary Communication Method:
| Factor | Details |
|--------|---------|
| Method | [encrypted radio, app, etc] |
| Equipment | [specific models] |
| Encryption | [type, key exchange] |
| Range | [effective range] |
| Reliability | [backup if fails] |
| Attribution risk | [traceability] |

Secondary Communication Method:
| Factor | Details |
|--------|---------|
| Method | [backup method] |
| When to use | [primary fails, compromised] |
| Equipment | [backup equipment] |

Emergency Communication:
| Situation | Method | Protocol |
|-----------|--------|----------|
| Primary failure | [backup] | [switch procedure] |
| Compromise suspected | [alternate] | [code/signal] |
| Medical emergency | [direct call] | [procedure] |
| Abort | [method] | [abort signal] |

Communication Schedule:
| Time | Check-in | From | To | Method |
|------|----------|------|-----|--------|
| [time] | Status report | [position] | [base] | [method] |
| [time] | Position update | [team] | [base] | [method] |
| [time] | Check complete | [team] | [base] | [method] |

Code Words/Signals:
| Code | Meaning | Response |
|------|---------|----------|
| [word] | All clear/proceeding | [acknowledgment] |
| [word] | Target sighted | [response] |
| [word] | Abort operation | [action] |
| [word] | Emergency/compromise | [action] |
| [word] | Rally at primary | [response] |
| [word] | Rally at alternate | [response] |
| [signal] | Visual - all clear | [acknowledge] |
| [signal] | Visual - warning | [action] |

Communication Security Rules:
| Rule | Rationale |
|------|-----------|
| No personal devices | Attribution risk |
| No real names | OPSEC |
| Pre-agreed codes only | Limit exposure |
| Minimum transmission | RF detection |
| Location off | Tracking prevention |

□ Primary comms: [defined]
□ Backup comms: [defined]
□ Codes established: [count]
□ Security rules: [documented]
```

### 3. Electronic Surveillance Awareness

Document electronic surveillance threats:

```
ELECTRONIC SURVEILLANCE AWARENESS
=================================

Target Area Surveillance:
| Type | Location | Coverage | Threat Level |
|------|----------|----------|--------------|
| CCTV | [locations] | [areas covered] | [H/M/L] |
| ANPR | [roads] | [coverage] | [threat] |
| Access control | [entry points] | [coverage] | [threat] |
| Motion sensors | [areas] | [coverage] | [threat] |

Camera Analysis:
| Camera ID | Location | Type | Coverage | Avoidance |
|-----------|----------|------|----------|-----------|
| [cam 1] | [location] | [fixed/PTZ] | [area] | [how to avoid] |
| [cam 2] | [location] | [type] | [coverage] | [avoidance] |
| [cam 3] | [location] | [type] | [coverage] | [avoidance] |

Law Enforcement Coverage:
| Type | Location | Threat | Mitigation |
|------|----------|--------|------------|
| Traffic cameras | [roads] | [H/M/L] | [route selection] |
| Surveillance systems | [area] | [threat] | [mitigation] |
| Police frequency monitoring | [area] | [threat] | [scanner] |

Commercial Surveillance:
| Type | Owner | Coverage | Data Retention |
|------|-------|----------|----------------|
| Retail cameras | [businesses] | [areas] | [days/months] |
| Parking cameras | [lots] | [coverage] | [retention] |
| Traffic flow | [city] | [roads] | [retention] |

Electronic Signatures We Create:
| Signature | Source | Detection Risk | Mitigation |
|-----------|--------|----------------|------------|
| Cell signal | Team phones | [H/M/L] | [airplane mode, burners] |
| WiFi probes | Team devices | [risk] | [WiFi off] |
| Bluetooth | Wearables | [risk] | [disable] |
| Radio transmissions | Comm equipment | [risk] | [encryption, brevity] |
| Vehicle transponder | Toll, parking | [risk] | [cash, avoidance] |

Surveillance Avoidance Routes:
| Route | Cameras Avoided | Risk Level | Trade-offs |
|-------|-----------------|------------|------------|
| Route Alpha | [count] | [H/M/L] | [longer distance] |
| Route Bravo | [count] | [risk] | [trade-off] |

□ Cameras mapped: [count]
□ Avoidance routes: [planned]
□ Electronic signatures: [minimized]
```

### 4. Counter-Surveillance Equipment

Specify counter-surveillance equipment:

```
COUNTER-SURVEILLANCE EQUIPMENT
==============================

Detection Equipment:
| Equipment | Purpose | Assigned To | Status |
|-----------|---------|-------------|--------|
| RF detector | Bug detection | [who] | [have/need] |
| Spectrum analyzer | RF monitoring | [who] | [status] |
| GPS detector | Tracker detection | [who] | [status] |
| Camera detector | IR/lens detection | [who] | [status] |
| Phone detector | Cell presence | [who] | [status] |

Communication Security Equipment:
| Equipment | Purpose | Assigned To | Status |
|-----------|---------|-------------|--------|
| Encrypted radios | Secure comms | [team] | [status] |
| Burner phones | Backup comms | [team] | [status] |
| Signal jammer | Emergency use only | [if authorized] | [status] |
| Faraday bags | Device isolation | [team] | [status] |

Surveillance Detection Equipment:
| Equipment | Purpose | Assigned To | Status |
|-----------|---------|-------------|--------|
| Binoculars | Counter-surveillance | [who] | [status] |
| Camera w/ zoom | Documentation | [who] | [status] |
| Scanner | LE frequency monitor | [who] | [status] |
| Dashcam | Route documentation | [vehicle] | [status] |

Personal Security Equipment:
| Equipment | Purpose | Assigned To | Status |
|-----------|---------|-------------|--------|
| Body camera | Documentation | [optional] | [status] |
| Audio recorder | Evidence | [optional] | [status] |
| Emergency beacon | Distress signal | [team] | [status] |

Equipment Readiness Checklist:
| Item | Charged | Tested | Assigned | Packed |
|------|---------|--------|----------|--------|
| [equipment 1] | [ ] | [ ] | [ ] | [ ] |
| [equipment 2] | [ ] | [ ] | [ ] | [ ] |
| [equipment 3] | [ ] | [ ] | [ ] | [ ] |

Equipment Load-Out by Role:
| Role | Equipment | Backup |
|------|-----------|--------|
| Team Lead | [equipment list] | [backup] |
| [Role 2] | [equipment] | [backup] |
| [Role 3] | [equipment] | [backup] |

□ Equipment listed: [count items]
□ Status verified: [Y/N]
□ Load-out assigned: [Y/N]
```

### 5. Surveillance Detection Route

Plan surveillance detection route:

```
SURVEILLANCE DETECTION ROUTE (SDR)
==================================

SDR Requirements:
| Factor | Requirement | Rationale |
|--------|-------------|-----------|
| Duration | [time] | [adequate for detection] |
| Terrain variety | [types] | [expose surveillance] |
| Choke points | [count] | [force commitment] |
| Natural stops | [count] | [observation opportunities] |
| Reversals | [count] | [detect following] |
| Timing variations | [planned] | [unpredictability] |

Pre-Operational SDR:
| Segment | Start | End | Duration | Purpose |
|---------|-------|-----|----------|---------|
| 1 | [location] | [location] | [min] | [baseline observation] |
| 2 | [location] | [location] | [min] | [choke point] |
| 3 | [location] | [location] | [min] | [reversal] |
| 4 | [location] | [location] | [min] | [natural stop] |
| 5 | [location] | [location] | [min] | [final assessment] |
| 6 | [staging area] | [target area] | [min] | [clean approach] |

SDR Waypoints:
| Waypoint | Location | Action | Observation Point |
|----------|----------|--------|-------------------|
| WP1 | [location] | [action] | [where to observe from] |
| WP2 | [location] | [action] | [observation] |
| WP3 | [location] | [action] | [observation] |
| WP4 | [location] | [action] | [observation] |

Choke Points:
| Point | Location | Type | What We'll See |
|-------|----------|------|----------------|
| CP1 | [location] | [one-way, bridge, etc] | [surveillance commitment] |
| CP2 | [location] | [type] | [indicator] |

Natural Stops:
| Stop | Location | Cover Story | Duration | Observation |
|------|----------|-------------|----------|-------------|
| Stop 1 | [gas station, etc] | [refuel] | [min] | [rear view] |
| Stop 2 | [location] | [reason] | [duration] | [observation] |

SDR Go/No-Go Criteria:
| Indicator | Assessment | Action |
|-----------|------------|--------|
| No surveillance detected | Clean | Proceed to operation |
| Possible surveillance | Suspected | Extended SDR or abort |
| Confirmed surveillance | Compromised | Abort, counter-measures |

□ SDR planned: [Y/N]
□ Duration: [minutes]
□ Choke points: [count]
□ Criteria established: [Y/N]
```

### 6. Electronic Environment Summary

Compile electronic environment findings:

```
ELECTRONIC ENVIRONMENT SUMMARY
==============================

Threat Assessment:
| Category | Level | Key Concerns |
|----------|-------|--------------|
| Electronic detection | [H/M/L] | [main threats] |
| Surveillance systems | [level] | [concerns] |
| Communication intercept | [level] | [concerns] |
| Tracking risk | [level] | [concerns] |

Communication Plan:
| Element | Primary | Backup |
|---------|---------|--------|
| Method | [method] | [backup] |
| Equipment | [equipment] | [backup] |
| Codes | [established] | N/A |

TSCM Requirements:
| Action | Timing | Equipment |
|--------|--------|-----------|
| [action 1] | [when] | [equipment] |
| [action 2] | [when] | [equipment] |

Counter-Surveillance:
| Equipment | Purpose | Status |
|-----------|---------|--------|
| [equipment] | [purpose] | [ready/pending] |

SDR Summary:
| Factor | Detail |
|--------|--------|
| Duration | [minutes] |
| Route | [overview] |
| Criteria | [go/no-go] |

HANDOFF TO VIPER (Step 4):
- Communication plan: [for cover integration]
- Electronic threats: [for legend considerations]
- Surveillance environment: [for interaction planning]
- OPSEC requirements: [for human factor alignment]
```

---

## STEP 3 OUTPUT

```markdown
## ELECTRONIC ENVIRONMENT COMPLETE

### Threat Assessment
- Electronic detection: [H/M/L]
- Surveillance systems: [count cameras, etc]
- Intercept risk: [H/M/L]

### Communication Plan
- Primary: [method]
- Backup: [method]
- Codes: [count established]

### TSCM Requirements
- Pre-op sweeps: [list]
- Equipment: [count items]

### Surveillance Awareness
- Cameras mapped: [count]
- Avoidance routes: [planned]

### Counter-Surveillance
- SDR duration: [minutes]
- Equipment: [ready status]

### Next Step
Step 4: Human Factors (Viper)
Focus: [cover story, legend, interaction protocols]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] TSCM requirements defined
- [ ] Communication plan established
- [ ] Surveillance threats documented
- [ ] Equipment specified
- [ ] SDR planned
- [ ] Handoff prepared for Viper

---

## MENU OPTIONS

**[C] Continue** - Proceed to human factors (Step 4)
**[T] TSCM** - Extended TSCM planning
**[S] SDR** - Detailed SDR routing
**[E] Equipment** - Equipment specifications

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-human-factors.md`
