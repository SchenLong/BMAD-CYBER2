---
name: 'step-05-operation-assembly'
description: 'SDR routes, contingency plans, communication protocols, exfiltration procedures, final briefing document'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/ground-truth'
thisStepFile: '{workflow_path}/steps/step-05-operation-assembly.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-04-human-factors.md'

# Agent Configuration
executing_agent: field-operative
agent_codename: Specter
---

# Step 5: Operation Package Assembly

## STEP GOAL

Assemble the complete field operation package including final SDR routes, comprehensive contingency plans, communication protocols, exfiltration procedures, and the final briefing document for operational execution.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Specter**, Field Operative
- You synthesize all planning into executable operations
- You produce the final operation package for team execution
- You ensure all elements are ready for deployment

### Assembly Protocol

- Finalize surveillance detection routes
- Complete contingency planning
- Establish communication protocols
- Plan exfiltration procedures
- Compile final briefing document

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Final SDR Routes

Finalize surveillance detection routes:

```
FINAL SDR ROUTES
================

Pre-Operation SDR (Vehicle):
| Segment | Start | Waypoint | End | Duration | Purpose |
|---------|-------|----------|-----|----------|---------|
| 1 | [departure] | [route] | [WP1] | [min] | Establish baseline |
| 2 | [WP1] | [route] | [WP2] | [min] | First check |
| 3 | [WP2] | [route] | [WP3] | [min] | Choke point |
| 4 | [WP3] | [route] | [WP4] | [min] | Reversal |
| 5 | [WP4] | [route] | [Staging] | [min] | Final clean approach |

SDR Waypoint Details:
| Waypoint | Address/Coords | Stop Type | Action | Duration |
|----------|----------------|-----------|--------|----------|
| WP1 | [location] | [gas/store/etc] | [refuel, observe] | [min] |
| WP2 | [location] | [type] | [action] | [duration] |
| WP3 | [location] | [type] | [action] | [duration] |
| WP4 | [location] | [type] | [action] | [duration] |

Choke Points:
| CP | Location | Type | Surveillance Indicator |
|----|----------|------|----------------------|
| CP1 | [location] | [one-lane bridge, etc] | [same vehicle behind] |
| CP2 | [location] | [type] | [indicator] |

SDR Timing:
| Factor | Value |
|--------|-------|
| Total SDR duration | [X minutes] |
| Earliest departure | [time] |
| Latest arrival at staging | [time] |
| Buffer time | [minutes] |

SDR Abort Criteria:
| Observation | Assessment | Action |
|-------------|------------|--------|
| Same vehicle 2+ segments | Probable surveillance | Extended SDR |
| Same vehicle 3+ segments | Confirmed surveillance | Abort operation |
| Unusual vehicle behavior | Possible surveillance | Enhanced observation |
| Direct follow after stop | Confirmed | Abort |

Foot SDR (If Required):
| Segment | Start | End | Duration | Method |
|---------|-------|-----|----------|--------|
| 1 | [parking] | [WP1] | [min] | [walk route] |
| 2 | [WP1] | [WP2] | [min] | [route] |
| 3 | [WP2] | [OP] | [min] | [final approach] |

□ Vehicle SDR: [finalized]
□ Foot SDR: [if applicable]
□ Timing: [calculated]
□ Abort criteria: [established]
```

### 2. Comprehensive Contingency Plans

Complete all contingency planning:

```
COMPREHENSIVE CONTINGENCY PLANS
===============================

Contingency Overview:
| Contingency | Trigger | Response | Communication |
|-------------|---------|----------|---------------|
| Weather abort | [conditions] | [postpone] | [code: weather] |
| Target not present | [not sighted] | [wait/return] | [code: dry] |
| Surveillance detected | [indicators] | [abort/evade] | [code: hot] |
| Law enforcement contact | [any contact] | [protocol] | [code: blue] |
| Medical emergency | [injury/illness] | [extraction] | [code: medic] |
| Communication failure | [no contact X min] | [rally point] | [visual signals] |
| Compromise | [indicators] | [abort/exfil] | [code: burn] |

Detailed Contingency Plans:

**CONTINGENCY A: Target No-Show**
| Phase | Action | Fallback |
|-------|--------|----------|
| Initial | Wait [X] minutes | Maintain position |
| Extended | Contact base | Guidance |
| Max wait | [X] minutes | Abort, reschedule |

**CONTINGENCY B: Surveillance Detected**
| Phase | Action | Next Step |
|-------|--------|-----------|
| Possible | Initiate SDR | Confirm/clear |
| Probable | Extend SDR | Attempt to lose |
| Confirmed | Abort operation | Emergency exfil |

**CONTINGENCY C: Law Enforcement Contact**
| Scenario | Response | Escalation |
|----------|----------|------------|
| Casual contact | Cover story | Cooperate |
| Questioned | Provide ID, cover | Brief answers |
| Detained | Invoke rights | Attorney contact |
| Arrested | Remain silent | Legal protocol |

**CONTINGENCY D: Medical Emergency**
| Severity | Action | Communication |
|----------|--------|---------------|
| Minor | Self-treat, continue | Status report |
| Moderate | Abort, self-extract | Request support |
| Severe | Emergency services | Base notification |

**CONTINGENCY E: Equipment Failure**
| Equipment | Backup | If No Backup |
|-----------|--------|--------------|
| Primary comm | Backup comm | Rally point |
| Camera | Phone camera | Written notes |
| Vehicle | Secondary vehicle | Foot exfil |

**CONTINGENCY F: Hostile Contact**
| Scenario | Response | Priority |
|----------|----------|----------|
| Verbal confrontation | De-escalate, retreat | Disengage |
| Physical threat | Evade, flee | Personal safety |
| Pursuit | Lose pursuit | Emergency exfil |

Decision Authority:
| Decision | Authority Level | Escalation |
|----------|-----------------|------------|
| Continue/wait | Team lead | N/A |
| Extend SDR | Team lead | Base notification |
| Abort | Team lead | Base notification |
| Emergency exfil | Any team member | All units |

□ Contingencies: [count defined]
□ Decision authority: [clear]
□ Team briefed: [Y/N]
```

### 3. Communication Protocols

Establish final communication protocols:

```
COMMUNICATION PROTOCOLS
=======================

Communication Schedule:
| Event | Time | From | To | Method | Content |
|-------|------|------|-----|--------|---------|
| Departure | [time] | TL | Base | [method] | "Departing" |
| SDR start | [time] | TL | Base | [method] | "Route start" |
| SDR complete | [time] | TL | Base | [method] | "Clear" |
| On station | [time] | TL | Base | [method] | "In position" |
| Hourly check | Every hour | TL | Base | [method] | "Status" |
| Objective met | [when] | TL | Base | [method] | "Complete" |
| Exfil start | [time] | TL | Base | [method] | "Moving" |
| Exfil complete | [time] | TL | Base | [method] | "Home" |

Code Words:
| Code | Meaning | Action Required |
|------|---------|-----------------|
| CLEAR | No surveillance | Proceed |
| HOT | Surveillance detected | Enhanced SDR |
| BURN | Compromised | Abort immediately |
| DRY | Target not present | Continue/wait |
| WET | Target sighted | Execute plan |
| BLUE | LE contact | Protocol activated |
| MEDIC | Medical emergency | Support needed |
| HOME | Exfil complete | Operation end |

Status Codes:
| Code | Meaning |
|------|---------|
| GREEN | All normal |
| YELLOW | Situation developing |
| RED | Emergency |

Equipment:
| Device | Primary Holder | Backup Holder | Frequency/Channel |
|--------|----------------|---------------|-------------------|
| Radio 1 | [who] | [backup] | [freq] |
| Radio 2 | [who] | [backup] | [freq] |
| Phone 1 | [who] | [number] | [app if applicable] |
| Phone 2 | [who] | [number] | N/A |

Communication Fallback:
| If | Then | Timeout |
|----|------|---------|
| Primary radio fails | Switch to phones | Immediate |
| All electronic fails | Rally at primary | 30 min |
| Team member silent | Attempt contact x3 | Then abort |
| Base unreachable | Continue, report at exfil | N/A |

Radio Discipline:
| Rule | Rationale |
|------|-----------|
| Minimum transmission | Reduce intercept risk |
| Codes only | OPSEC |
| No names | Attribution prevention |
| Acknowledge all | Confirm receipt |
| Break squelch for emergency | Immediate attention |

□ Schedule: [established]
□ Codes: [distributed]
□ Equipment: [tested]
□ Fallbacks: [defined]
```

### 4. Exfiltration Procedures

Plan exfiltration procedures:

```
EXFILTRATION PROCEDURES
=======================

Normal Exfiltration:
| Phase | Action | Communication | Duration |
|-------|--------|---------------|----------|
| Signal | [objective complete] | "Complete" | - |
| Position departure | [orderly, cover] | [silent] | [X min] |
| Route to vehicle | [planned route] | [if needed] | [X min] |
| Vehicle departure | [normal driving] | "Moving" | [X min] |
| SDR (if warranted) | [abbreviated SDR] | [as needed] | [X min] |
| Safe point | [first safe location] | "Clear" | - |
| Base/debrief | [destination] | "Home" | - |

Emergency Exfiltration:
| Trigger | Action | Route | Destination |
|---------|--------|-------|-------------|
| BURN called | Immediate departure | Emergency route 1 | Primary rally |
| LE contact | Per protocol | Varies | Rally or legal |
| Medical | Fastest safe route | Direct | Hospital/safe point |
| Hostile pursuit | Lose pursuit | Evasion route | Alternate rally |

Exfiltration Routes:
| Route | From | To | Distance | Time | Use When |
|-------|------|-----|----------|------|----------|
| Primary | [OP] | [safe point] | [km] | [min] | Normal exit |
| Alternate 1 | [OP] | [rally 1] | [km] | [min] | Primary blocked |
| Alternate 2 | [OP] | [rally 2] | [km] | [min] | Emergency |
| Emergency | [any position] | [safe haven] | [varies] | [min] | BURN scenario |

Rally Point Procedures:
| Point | Location | Wait Time | If No Contact |
|-------|----------|-----------|---------------|
| Primary rally | [location] | [X min] | Go to alternate |
| Alternate rally | [location] | [X min] | Independent exfil |
| Emergency rally | [location] | [X min] | Abort protocol |

Vehicle Procedures:
| Scenario | Procedure |
|----------|-----------|
| Normal departure | Walk to vehicle, normal drive out |
| Hasty departure | Direct to vehicle, depart immediately |
| Vehicle compromised | Foot exfil, alternate transport |
| Pursuit | Lose pursuit, switch vehicles if possible |

Post-Exfiltration:
| Action | Timing | Responsible |
|--------|--------|-------------|
| Status report | Immediately | Team lead |
| Equipment check | At safe point | All |
| TSCM sweep | Before entering base | TL |
| Initial debrief | Within 1 hour | All |

Evidence Handling:
| Item | During Exfil | At Safe Point |
|------|--------------|---------------|
| Photos/video | Protect/encrypt | Backup, transfer |
| Notes | Secure | Transcribe |
| Equipment | Maintain custody | Inventory |
| Personal items | Check for trackers | Inspect |

□ Normal exfil: [planned]
□ Emergency exfil: [planned]
□ Rally points: [established]
□ Post-exfil: [defined]
```

### 5. Final Briefing Document

Compile the final briefing document:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    FIELD OPERATION BRIEFING DOCUMENT

═══════════════════════════════════════════════════════════════════════════════

OPERATION: [Codename]
CLASSIFICATION: [Level]
DATE: [Current date]
EXECUTION: [Planned date/window]

═══════════════════════════════════════════════════════════════════════════════

                           MISSION OVERVIEW

═══════════════════════════════════════════════════════════════════════════════

Mission Type: [Surveillance/Site Survey/HUMINT/etc]
Target: [Identifier]
Location: [Primary location]
Duration: [Expected duration]

Objectives:
1. [Primary objective]
2. [Secondary objective]
3. [Tertiary objective]

Success Criteria:
- Full: [criteria]
- Minimum: [criteria]

═══════════════════════════════════════════════════════════════════════════════

                              TEAM

═══════════════════════════════════════════════════════════════════════════════

| Position | Callsign | Role | Equipment |
|----------|----------|------|-----------|
| Team Lead | [callsign] | [role] | [key equipment] |
| [Position] | [callsign] | [role] | [equipment] |
| [Position] | [callsign] | [role] | [equipment] |

═══════════════════════════════════════════════════════════════════════════════

                            TIMELINE

═══════════════════════════════════════════════════════════════════════════════

| Time | Event | Location | Action |
|------|-------|----------|--------|
| [time] | Departure | [base] | Team departs |
| [time] | SDR Start | [WP1] | Begin SDR |
| [time] | SDR Complete | [staging] | Clean confirmed |
| [time] | On Station | [OP] | Begin operation |
| [time] | Objective | [target] | Execute mission |
| [time] | Exfil | [OP] | Begin withdrawal |
| [time] | Home | [base] | Debrief |

═══════════════════════════════════════════════════════════════════════════════

                         COVER STORY

═══════════════════════════════════════════════════════════════════════════════

Primary Cover:
- Identity: [who you are]
- Purpose: [why you're there]
- If questioned: [brief answer]

Backup: [alternate story if primary fails]

═══════════════════════════════════════════════════════════════════════════════

                       COMMUNICATION

═══════════════════════════════════════════════════════════════════════════════

Primary: [method]
Backup: [method]
Emergency: [method]

Key Codes:
| Code | Meaning |
|------|---------|
| CLEAR | No surveillance |
| HOT | Surveillance detected |
| BURN | Abort immediately |
| HOME | Operation complete |

Check-in Schedule: [times]

═══════════════════════════════════════════════════════════════════════════════

                       POSITIONS & ROUTES

═══════════════════════════════════════════════════════════════════════════════

Observation Positions:
| Position | Location | Line of Sight |
|----------|----------|---------------|
| OP Alpha | [location] | [coverage] |
| OP Bravo | [location] | [coverage] |

SDR Route: [summary]
Entry Route: [description]
Exit Route: [description]
Emergency Route: [description]

Rally Points:
| Point | Location |
|-------|----------|
| Primary | [location] |
| Alternate | [location] |

═══════════════════════════════════════════════════════════════════════════════

                       CONTINGENCIES

═══════════════════════════════════════════════════════════════════════════════

| Situation | Action | Code |
|-----------|--------|------|
| Target no-show | [action] | DRY |
| Surveillance | [action] | HOT |
| LE contact | [action] | BLUE |
| Medical | [action] | MEDIC |
| Compromise | [action] | BURN |

Decision Authority:
- Abort: Team Lead (any member for emergency)
- Continue: Team Lead with base concurrence

═══════════════════════════════════════════════════════════════════════════════

                     EQUIPMENT CHECKLIST

═══════════════════════════════════════════════════════════════════════════════

[ ] Primary communication
[ ] Backup communication
[ ] Surveillance equipment
[ ] Documentation (cover)
[ ] Personal equipment
[ ] Vehicle prepared
[ ] Emergency kit

═══════════════════════════════════════════════════════════════════════════════

                     GO/NO-GO CHECKLIST

═══════════════════════════════════════════════════════════════════════════════

Pre-Departure:
[ ] Weather acceptable
[ ] Equipment tested
[ ] Communications verified
[ ] Team briefed
[ ] Cover stories rehearsed
[ ] Contingencies understood

SDR Complete:
[ ] No surveillance detected
[ ] Communications functional
[ ] Team ready

On Station:
[ ] Position secure
[ ] Target area accessible
[ ] No hostile indicators

═══════════════════════════════════════════════════════════════════════════════

                         LEGAL NOTES

═══════════════════════════════════════════════════════════════════════════════

Attorney: [name, number]
If detained: [procedure]
Do not: [prohibited actions]

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

A. Detailed Maps
B. SDR Route with Waypoints
C. Position Diagrams
D. Equipment Specifications
E. Contact List
F. Legal Authorization

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Ground Truth
Steps Completed: 5/5
Agents Engaged: Specter, Atlas, Sigil, Viper, Specter

═══════════════════════════════════════════════════════════════════════════════

BRIEFING ACKNOWLEDGMENT

I have read and understand this operation briefing.

_________________________    _______________
Team Member Signature         Date

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 5 OUTPUT

```markdown
## OPERATION PACKAGE COMPLETE

### Operation Summary
- Codename: [name]
- Type: [mission type]
- Target: [identifier]
- Execution: [date/window]

### Team
- Size: [count]
- Lead: [callsign]
- Positions: [assigned]

### Key Elements
- SDR: [X minutes, Y waypoints]
- Positions: [count OPs]
- Entry/Exit: [routes defined]
- Contingencies: [count plans]
- Communication: [protocols set]

### Readiness Status
| Element | Status |
|---------|--------|
| Planning | Complete |
| Equipment | [Ready/Pending] |
| Team | [Briefed/Pending] |
| Communications | [Tested/Pending] |
| Cover | [Backstopped/Pending] |

### Briefing Document
- Status: Complete
- Distribution: [team members]
- Acknowledgment: Required

### Next Steps
1. Distribute briefing document
2. Conduct team briefing
3. Equipment check
4. Rehearsal (if time permits)
5. Execute operation
```

---

## COMPLETION CRITERIA

Workflow complete when:

- [ ] SDR routes finalized
- [ ] Contingencies complete
- [ ] Communication protocols established
- [ ] Exfiltration procedures defined
- [ ] Briefing document compiled
- [ ] Team acknowledgment obtained

---

## MENU OPTIONS

**[E] Export** - Export complete operation package
**[B] Briefing** - Print briefing document
**[M] Maps** - Export route/position maps
**[C] Checklist** - Export equipment checklist

---

## WORKFLOW COMPLETE

Ground Truth workflow complete.

Recommended next actions:

1. Schedule team briefing
2. Conduct equipment preparation
3. Test all communications
4. Rehearse contingencies
5. Execute operation as planned

Post-operation:

- Conduct after-action review
- Document lessons learned
- Update procedures as needed
- Archive operation package
