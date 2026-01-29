---
name: 'step-01-operation-framework'
description: 'Mission definition, success criteria, risk tolerance, team requirements, timeline development'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/ground-truth'
thisStepFile: '{workflow_path}/steps/step-01-operation-framework.md'
nextStepFile: '{workflow_path}/steps/step-02-site-analysis.md'
prevStepFile: null

# Agent Configuration
executing_agent: field-operative
agent_codename: Specter
---

# Step 1: Operation Framework

## STEP GOAL

Establish the operational framework including mission definition, success criteria, risk tolerance, team requirements, and timeline development for the field operation.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Specter**, Field Operative
- You specialize in field operations and tradecraft
- You develop operational plans and define mission parameters
- You ensure operational viability and safety

### Planning Protocol
- Define mission objectives clearly
- Establish measurable success criteria
- Assess and set risk tolerance
- Determine team and resource requirements
- Develop operational timeline

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Mission Definition

Define the mission:

```
MISSION DEFINITION
==================

Operation Identification:
| Field | Value |
|-------|-------|
| Operation Name | [codename] |
| Classification | [level] |
| Date Initiated | [date] |
| Target | [target identifier] |
| Location(s) | [primary location(s)] |

Mission Type:
| Type | Selected | Description |
|------|----------|-------------|
| Surveillance | [Y/N] | Fixed/mobile observation |
| Site Survey | [Y/N] | Physical reconnaissance |
| HUMINT Encounter | [Y/N] | Planned contact/meeting |
| Technical Placement | [Y/N] | Equipment installation |
| Document/Asset Recovery | [Y/N] | Acquisition operation |
| Counter-Surveillance | [Y/N] | Detect/identify hostile surveillance |
| Security Assessment | [Y/N] | Physical security testing |

Mission Statement:
[Clear, concise statement of what the operation aims to accomplish]

Primary Objectives:
| Rank | Objective | Measurable Outcome | Priority |
|------|-----------|-------------------|----------|
| 1 | [primary objective] | [how measured] | Critical |
| 2 | [objective] | [measurement] | High |
| 3 | [objective] | [measurement] | Medium |

Secondary Objectives (Opportunity):
| Objective | Measurement | If Opportunity Arises |
|-----------|-------------|----------------------|
| [objective] | [measurement] | [conditions] |

Intelligence Requirements:
| Priority | Information Needed | Collection Method |
|----------|-------------------|-------------------|
| PIR 1 | [what we need to learn] | [how to collect] |
| PIR 2 | [information] | [method] |
| SIR 1 | [supporting info] | [method] |

□ Mission type: [identified]
□ Objectives defined: [count]
□ Requirements documented: [Y/N]
```

### 2. Success Criteria

Establish success criteria:

```
SUCCESS CRITERIA
================

Mission Success Definition:
| Level | Criteria | Outcome |
|-------|----------|---------|
| Full Success | [all primary objectives met] | [what this looks like] |
| Partial Success | [some objectives met] | [acceptable minimum] |
| Minimal Success | [intelligence value gained] | [baseline] |
| Mission Failure | [no objectives, compromise] | [what to avoid] |

Objective-Specific Criteria:
| Objective | Success Metric | Verification Method |
|-----------|----------------|---------------------|
| [objective 1] | [specific metric] | [how to verify] |
| [objective 2] | [metric] | [verification] |
| [objective 3] | [metric] | [verification] |

Collection Thresholds:
| Collection Type | Minimum | Target | Stretch |
|-----------------|---------|--------|---------|
| [photos/video] | [count] | [target] | [if possible] |
| [documents] | [count] | [target] | [stretch] |
| [contacts] | [count] | [target] | [stretch] |
| [duration] | [min time] | [target] | [max time] |

Go/No-Go Criteria:
| Phase | Go Criteria | No-Go Criteria |
|-------|-------------|----------------|
| Pre-departure | [conditions for go] | [abort conditions] |
| Arrival | [conditions] | [abort] |
| Pre-execution | [conditions] | [abort] |
| Execution | [continue criteria] | [abort criteria] |

Success Verification:
| Criterion | Verification Method | Who Verifies |
|-----------|---------------------|--------------|
| [criterion 1] | [method] | [person/role] |
| [criterion 2] | [method] | [verifier] |

□ Success levels: [defined]
□ Go/No-Go criteria: [established]
□ Verification methods: [documented]
```

### 3. Risk Assessment and Tolerance

Assess risks and set tolerance:

```
RISK ASSESSMENT AND TOLERANCE
=============================

Risk Tolerance Statement:
| Factor | Tolerance Level | Justification |
|--------|-----------------|---------------|
| Physical safety | [zero/low/moderate] | [why] |
| Detection by target | [tolerance] | [justification] |
| Law enforcement contact | [tolerance] | [justification] |
| Operation attribution | [tolerance] | [justification] |
| Asset compromise | [tolerance] | [justification] |

Threat Assessment:
| Threat | Probability | Impact | Risk Level |
|--------|-------------|--------|------------|
| Hostile surveillance | [H/M/L] | [H/M/L] | [H/M/L] |
| Target counter-surveillance | [prob] | [impact] | [risk] |
| Third party interference | [prob] | [impact] | [risk] |
| Security/police contact | [prob] | [impact] | [risk] |
| Environmental hazards | [prob] | [impact] | [risk] |
| Communication compromise | [prob] | [impact] | [risk] |

Risk Mitigation Matrix:
| Risk | Mitigation Strategy | Residual Risk | Acceptable? |
|------|---------------------|---------------|-------------|
| [risk 1] | [mitigation] | [H/M/L] | [Y/N] |
| [risk 2] | [mitigation] | [residual] | [acceptable] |
| [risk 3] | [mitigation] | [residual] | [acceptable] |

Abort Thresholds:
| Condition | Threshold | Action |
|-----------|-----------|--------|
| Detection suspected | [indicators] | [abort level] |
| Hostile contact | [any/confirmed] | [immediate abort] |
| Communication failure | [duration] | [action] |
| Environmental change | [conditions] | [action] |
| Team member compromise | [any indication] | [action] |

Risk Acceptance:
| Accepted Risks | Rationale | Approved By |
|----------------|-----------|-------------|
| [risk 1] | [why acceptable] | [authority] |
| [risk 2] | [rationale] | [authority] |

□ Tolerance levels: [set]
□ Threats assessed: [count]
□ Mitigations planned: [Y/N]
□ Abort thresholds: [defined]
```

### 4. Team Requirements

Define team composition:

```
TEAM REQUIREMENTS
=================

Team Size Assessment:
| Factor | Consideration | Impact on Size |
|--------|---------------|----------------|
| Mission type | [type] | [solo possible / team needed] |
| Duration | [hours/days] | [shift requirements] |
| Geographic spread | [area coverage] | [positions needed] |
| Surveillance detection | [SDR complexity] | [counter-surveillance] |
| Technical requirements | [equipment] | [specialists needed] |

Minimum Team Composition:
| Role | Count | Responsibilities |
|------|-------|------------------|
| Team Lead | 1 | Command, decisions, primary execution |
| [role 2] | [count] | [responsibilities] |
| [role 3] | [count] | [responsibilities] |
| Counter-surveillance | [count] | [detect hostile surveillance] |
| Backup/Reserve | [count] | [emergency support] |

Position Assignments:
| Position | Role | Primary Task | Alternate |
|----------|------|--------------|-----------|
| Alpha | [role] | [task] | [backup person] |
| Bravo | [role] | [task] | [backup] |
| Charlie | [role] | [task] | [backup] |
| [position] | [role] | [task] | [backup] |

Skill Requirements:
| Skill | Required | Preferred | Who Has |
|-------|----------|-----------|---------|
| Surveillance tradecraft | [Y/N] | [level] | [team member] |
| Photography/video | [Y/N] | [level] | [who] |
| Technical (SIGINT) | [Y/N] | [level] | [who] |
| HUMINT/elicitation | [Y/N] | [level] | [who] |
| Driving/vehicle | [Y/N] | [level] | [who] |
| Languages | [languages] | [fluency] | [who] |
| Medical/first aid | [Y/N] | [level] | [who] |

Support Requirements:
| Support Type | Provider | Contact | Availability |
|--------------|----------|---------|--------------|
| Command/control | [who] | [how to reach] | [hours] |
| Emergency extraction | [who] | [contact] | [standby] |
| Medical | [who] | [contact] | [distance] |
| Legal | [who] | [contact] | [availability] |
| Technical support | [who] | [contact] | [availability] |

□ Team size: [count]
□ Roles assigned: [Y/N]
□ Skills verified: [Y/N]
□ Support arranged: [Y/N]
```

### 5. Resource Requirements

Document required resources:

```
RESOURCE REQUIREMENTS
=====================

Equipment Categories:
| Category | Items | Status | Source |
|----------|-------|--------|--------|
| Surveillance | [cameras, optics, etc] | [acquired/needed] | [source] |
| Communication | [radios, phones, etc] | [status] | [source] |
| Technical | [specialized equipment] | [status] | [source] |
| Transportation | [vehicles] | [status] | [source] |
| Cover/legend | [documents, props] | [status] | [source] |
| Personal | [clothing, accessories] | [status] | [source] |

Detailed Equipment List:
| Item | Quantity | Purpose | Assigned To |
|------|----------|---------|-------------|
| [item 1] | [qty] | [purpose] | [who] |
| [item 2] | [qty] | [purpose] | [who] |
| [item 3] | [qty] | [purpose] | [who] |

Vehicle Requirements:
| Vehicle | Type | Purpose | Requirements |
|---------|------|---------|--------------|
| Primary | [type] | [mobile surveillance] | [non-descript, reliable] |
| Backup | [type] | [alternate] | [requirements] |
| Support | [type] | [logistics] | [requirements] |

Financial Requirements:
| Category | Estimated Cost | Approval Status |
|----------|----------------|-----------------|
| Equipment | [$X] | [approved/pending] |
| Transportation | [$X] | [status] |
| Accommodations | [$X] | [status] |
| Operational funds | [$X] | [status] |
| Contingency | [$X] | [status] |
| **Total** | **[$X]** | [status] |

Logistical Requirements:
| Requirement | Details | Arranged |
|-------------|---------|----------|
| Safe house/staging | [location if needed] | [Y/N] |
| Vehicle parking | [locations] | [Y/N] |
| Cover business | [if needed] | [Y/N] |
| Communication infrastructure | [details] | [Y/N] |

□ Equipment listed: [Y/N]
□ Vehicles arranged: [Y/N]
□ Budget approved: [Y/N]
□ Logistics set: [Y/N]
```

### 6. Timeline Development

Develop operational timeline:

```
TIMELINE DEVELOPMENT
====================

Phase Timeline:
| Phase | Start | Duration | End | Key Milestones |
|-------|-------|----------|-----|----------------|
| Planning | [date] | [days] | [date] | [key outputs] |
| Reconnaissance | [date] | [days] | [date] | [milestones] |
| Preparation | [date] | [days] | [date] | [milestones] |
| Execution | [date] | [duration] | [date] | [milestones] |
| Debrief | [date] | [days] | [date] | [milestones] |

Execution Window:
| Factor | Optimal | Acceptable | Not Acceptable |
|--------|---------|------------|----------------|
| Day of week | [best days] | [acceptable] | [avoid] |
| Time of day | [optimal hours] | [acceptable] | [avoid] |
| Duration | [target] | [range] | [max/min] |
| Weather | [ideal] | [acceptable] | [abort conditions] |

Key Dates/Events:
| Date | Event | Impact on Operation |
|------|-------|---------------------|
| [date] | [event] | [how it affects timing] |

Milestone Checklist:
| Milestone | Target Date | Responsible | Status |
|-----------|-------------|-------------|--------|
| Planning complete | [date] | [who] | [status] |
| Reconnaissance complete | [date] | [who] | [status] |
| Equipment ready | [date] | [who] | [status] |
| Team briefed | [date] | [who] | [status] |
| Go/No-Go decision | [date] | [who] | [status] |
| Execution | [date] | [who] | [status] |
| Debrief complete | [date] | [who] | [status] |

Flexibility Factors:
| Factor | Flexibility | Adjustment Mechanism |
|--------|-------------|----------------------|
| Execution date | [H/M/L] | [how to adjust] |
| Duration | [flexibility] | [adjustment] |
| Team composition | [flexibility] | [adjustment] |

□ Timeline established: [Y/N]
□ Key dates identified: [Y/N]
□ Milestones set: [Y/N]
□ Flexibility assessed: [Y/N]
```

### 7. Operation Framework Summary

Compile framework summary:

```
OPERATION FRAMEWORK SUMMARY
===========================

Operation Overview:
| Field | Value |
|-------|-------|
| Operation Name | [codename] |
| Mission Type | [type] |
| Target | [identifier] |
| Location | [location(s)] |
| Execution Window | [date range] |

Mission Objectives:
| Rank | Objective | Success Metric |
|------|-----------|----------------|
| 1 | [primary] | [metric] |
| 2 | [secondary] | [metric] |
| 3 | [tertiary] | [metric] |

Risk Profile:
| Category | Level |
|----------|-------|
| Overall risk | [H/M/L] |
| Detection risk | [H/M/L] |
| Safety risk | [H/M/L] |
| Attribution risk | [H/M/L] |

Team Composition:
| Role | Count | Key Skills |
|------|-------|------------|
| [role] | [count] | [skills] |

Resource Summary:
| Category | Status |
|----------|--------|
| Equipment | [ready/pending] |
| Vehicles | [ready/pending] |
| Budget | [approved/pending] |
| Logistics | [ready/pending] |

HANDOFF TO ATLAS (Step 2):
- Operation type: [type for site analysis]
- Location(s): [for imagery analysis]
- Team size: [for position planning]
- Timeline: [for timing analysis]
- Special requirements: [environmental factors needed]
```

---

## STEP 1 OUTPUT

```markdown
## OPERATION FRAMEWORK COMPLETE

### Operation Identity
- Name: [codename]
- Type: [mission type]
- Target: [identifier]
- Location: [primary location]

### Mission Objectives
1. [Primary objective]
2. [Secondary objective]
3. [Tertiary objective]

### Success Criteria
- Full success: [criteria]
- Minimum success: [criteria]

### Risk Profile
- Overall: [H/M/L]
- Tolerance: [statement]

### Team Requirements
- Size: [count]
- Key roles: [list]

### Timeline
- Execution window: [dates]
- Duration: [estimate]

### Resources
- Budget: $[X]
- Status: [ready/pending]

### Next Step
Step 2: Site Analysis (Atlas)
Focus: [locations requiring imagery/terrain analysis]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Mission defined
- [ ] Success criteria established
- [ ] Risks assessed and tolerance set
- [ ] Team requirements determined
- [ ] Resources documented
- [ ] Timeline developed
- [ ] Handoff prepared for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to site analysis (Step 2)
**[R] Risk** - Refine risk assessment
**[T] Team** - Adjust team composition
**[L] Timeline** - Modify timeline

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-site-analysis.md`

