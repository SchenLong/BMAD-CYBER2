---
name: 'step-01-target-definition'
description: 'Receive target requirements, develop collection plan, task INT disciplines'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-01-target-definition.md'
nextStepFile: '{workflow_path}/steps/step-02-digital-footprint.md'
prevStepFile: null

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Target Definition & Collection Planning

## STEP GOAL

Receive and validate target identifiers, define intelligence requirements, develop a comprehensive collection plan, and task individual INT disciplines for parallel collection in Phase 2.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You coordinate all INT disciplines for comprehensive target packages
- You define collection priorities and confidence thresholds
- You ensure all agents understand their tasking

### Planning Protocol
- Validate all provided target identifiers
- Define Primary Intelligence Requirements (PIRs)
- Develop Key Intelligence Questions (KIQs)
- Create collection matrix for each INT discipline
- Set confidence thresholds for each requirement
- Brief each agent on their specific tasking

---

## PLANNING EXECUTION SEQUENCE

### 1. Target Intake & Validation

Document and validate the target:

```
OPERATION MOSAIC: TARGET INTAKE
===============================

Classification: [As appropriate]
Case ID: [Generate unique identifier]
Date Initiated: [Current date]
Requesting Entity: [If applicable]

TARGET IDENTIFICATION
---------------------

Primary Target Type: [ ] Person  [ ] Organization  [ ] Infrastructure  [ ] Hybrid

Target Identifiers Provided:
| Identifier Type | Value | Validated | Notes |
|-----------------|-------|-----------|-------|
| Full Name | [if provided] | [Y/N/Partial] | [validation notes] |
| Organization | [if provided] | [Y/N/Partial] | [notes] |
| Domain | [if provided] | [Y/N/Partial] | [notes] |
| Email | [if provided] | [Y/N/Partial] | [notes] |
| Phone | [if provided] | [Y/N/Partial] | [notes] |
| Social Handle | [if provided] | [Y/N/Partial] | [notes] |
| Physical Address | [if provided] | [Y/N/Partial] | [notes] |
| Other | [if provided] | [Y/N/Partial] | [notes] |

Target Context:
□ Known relationship to requestor: [context]
□ Reason for investigation: [purpose]
□ Time sensitivity: [urgent/standard/low]
□ Previous intelligence: [any prior collection]

Validation Status:
□ [ ] All identifiers validated - proceed
□ [ ] Partial validation - proceed with caveats
□ [ ] Validation issues - clarification needed
```

### 2. Intelligence Requirements Definition

Define what intelligence is needed:

```
INTELLIGENCE REQUIREMENTS
=========================

Primary Intelligence Requirements (PIRs):
| PIR # | Requirement | Priority | Confidence Needed |
|-------|-------------|----------|-------------------|
| PIR-1 | [What is the primary question?] | [Critical/High/Medium] | [High/Medium/Low] |
| PIR-2 | [Second requirement] | [priority] | [confidence] |
| PIR-3 | [Third requirement] | [priority] | [confidence] |
| PIR-4 | [Fourth requirement if needed] | [priority] | [confidence] |

Key Intelligence Questions (KIQs):
| KIQ # | Question | Related PIR | INT Discipline |
|-------|----------|-------------|----------------|
| KIQ-1 | [Specific question] | PIR-X | [SOCMINT/TECHINT/etc] |
| KIQ-2 | [Specific question] | PIR-X | [discipline] |
| KIQ-3 | [Specific question] | PIR-X | [discipline] |
| KIQ-4 | [Specific question] | PIR-X | [discipline] |
| KIQ-5 | [Specific question] | PIR-X | [discipline] |

Decision Support:
□ What decisions will this intelligence support?
  [Describe the decision context]

□ Who is the consumer of this intelligence?
  [Describe the audience]

□ What format is required for delivery?
  [Report/Briefing/Data package/etc]
```

### 3. Scope & Constraints Definition

Define boundaries and limitations:

```
SCOPE & CONSTRAINTS
===================

Geographic Scope:
□ Primary focus: [regions/countries]
□ Secondary areas: [if applicable]
□ Excluded areas: [if any]

Temporal Scope:
□ Historical depth: [how far back]
□ Focus period: [specific timeframe if relevant]
□ Ongoing monitoring: [Y/N]

Collection Constraints:
| Constraint | Description | Impact |
|------------|-------------|--------|
| Legal | [jurisdiction limits] | [affected activities] |
| Ethical | [ethical boundaries] | [affected activities] |
| Access | [platform/source limits] | [affected collection] |
| Time | [deadline if any] | [prioritization impact] |
| Resources | [any limitations] | [scope impact] |

Out of Scope:
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Explicitly excluded item 3]

Special Handling Requirements:
□ Classification level: [if applicable]
□ Distribution limits: [if applicable]
□ Retention requirements: [if applicable]
```

### 4. Collection Plan Development

Create the multi-INT collection plan:

```
COLLECTION PLAN
===============

Phase 2: Parallel Collection Tasking

RESOLVER (Domain-Intel-Specialist) - Digital Footprint:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Domain portfolio | [H/M/L] | [deliverable] |
| IP infrastructure | [H/M/L] | [deliverable] |
| DNS/email config | [H/M/L] | [deliverable] |
| Certificate analysis | [H/M/L] | [deliverable] |

PROBE (Technical-Researcher) - Technical Reconnaissance:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Technology stack | [H/M/L] | [deliverable] |
| Code repositories | [H/M/L] | [deliverable] |
| API surface | [H/M/L] | [deliverable] |
| Security posture | [H/M/L] | [deliverable] |

ECHO (Social-Media-Analyst) - Social Presence:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Platform enumeration | [H/M/L] | [deliverable] |
| Account correlation | [H/M/L] | [deliverable] |
| Network mapping | [H/M/L] | [deliverable] |
| Content analysis | [H/M/L] | [deliverable] |

SHADOW (Dark-Web-Analyst) - Dark Web Exposure:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Breach exposure | [H/M/L] | [deliverable] |
| Forum mentions | [H/M/L] | [deliverable] |
| Marketplace presence | [H/M/L] | [deliverable] |
| Leaked credentials | [H/M/L] | [deliverable] |

PROXY (Corporate-Intel-Specialist) - Corporate Intelligence:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Entity verification | [H/M/L] | [deliverable] |
| Corporate structure | [H/M/L] | [deliverable] |
| Beneficial ownership | [H/M/L] | [deliverable] |
| Financial filings | [H/M/L] | [deliverable] |

ATLAS (Geospatial-Analyst) - Location Intelligence:
| Collection Target | Priority | Expected Output |
|-------------------|----------|-----------------|
| Location indicators | [H/M/L] | [deliverable] |
| Photo geolocation | [H/M/L] | [deliverable] |
| Infrastructure locations | [H/M/L] | [deliverable] |
| Movement patterns | [H/M/L] | [deliverable] |
```

### 5. Confidence Thresholds

Set assessment standards:

```
CONFIDENCE THRESHOLDS
=====================

Confidence Level Definitions:
| Level | Definition | Evidence Required |
|-------|------------|-------------------|
| High (H) | Almost certainly true | 3+ independent sources, direct evidence |
| Medium (M) | Probably true | 2+ sources, strong circumstantial |
| Low (L) | Possibly true | Single source, indirect evidence |
| Unverified | Cannot assess | Insufficient information |

PIR Confidence Requirements:
| PIR | Minimum Confidence | Action if Not Met |
|-----|-------------------|-------------------|
| PIR-1 | [H/M/L] | [additional collection/caveat] |
| PIR-2 | [H/M/L] | [action] |
| PIR-3 | [H/M/L] | [action] |

Source Reliability Assessment:
| Source Type | Default Reliability | Notes |
|-------------|---------------------|-------|
| Official records | High | Government, corporate filings |
| Platform data | Medium-High | Social media, websites |
| Breach data | Medium | Age and validity varies |
| Forum posts | Low-Medium | Verify independently |
| Anonymous tips | Low | Require corroboration |
```

### 6. Collection Matrix

Map requirements to collection:

```
COLLECTION MATRIX
=================

PIR to INT Discipline Mapping:
| PIR | RESOLVER | ECHO | SHADOW | PROXY | ATLAS | PROBE |
|-----|----------|------|--------|-------|-------|-------|
| PIR-1 | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] |
| PIR-2 | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] |
| PIR-3 | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] |
| PIR-4 | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] | [X/□] |

KIQ to Agent Assignment:
| KIQ | Primary Agent | Supporting | Deadline |
|-----|---------------|------------|----------|
| KIQ-1 | [Agent] | [if any] | [relative] |
| KIQ-2 | [Agent] | [if any] | [relative] |
| KIQ-3 | [Agent] | [if any] | [relative] |
| KIQ-4 | [Agent] | [if any] | [relative] |
| KIQ-5 | [Agent] | [if any] | [relative] |

Collection Sequence:
□ Phase 2 agents can operate in parallel
□ Phase 3 (Dossier) requires Phase 2 completion
□ Phase 4 (Viper/Sigil/Specter) requires Phase 3 findings
□ Phase 5 (Vector) synthesizes all phases
```

### 7. Agent Briefing Summary

Prepare briefings for each discipline:

```
AGENT BRIEFING SUMMARIES
========================

RESOLVER Briefing:
- Target identifiers: [relevant domains/IPs]
- Priority focus: [specific areas]
- KIQs assigned: [KIQ numbers]
- Handoff to: Probe (for technical deep-dive)

PROBE Briefing:
- Target identifiers: [domains/repos/tech indicators]
- Priority focus: [specific areas]
- KIQs assigned: [KIQ numbers]
- Coordinate with: Resolver (infrastructure)

ECHO Briefing:
- Target identifiers: [names/handles/emails]
- Priority focus: [specific platforms/networks]
- KIQs assigned: [KIQ numbers]
- Handoff to: Atlas (location from social)

SHADOW Briefing:
- Target identifiers: [emails/usernames/domains]
- Priority focus: [breach types/forums]
- KIQs assigned: [KIQ numbers]
- Handoff to: Dossier (threat correlation)

PROXY Briefing:
- Target identifiers: [org name/domains/names]
- Priority focus: [corporate structure/ownership]
- KIQs assigned: [KIQ numbers]
- Handoff to: Viper (personnel targeting)

ATLAS Briefing:
- Target identifiers: [addresses/photos/travel]
- Priority focus: [location verification/patterns]
- KIQs assigned: [KIQ numbers]
- Input from: Echo (social location data)
```

---

## STEP 1 OUTPUT

```markdown
## COLLECTION PLAN SUMMARY

### Target
- Type: [Person/Organization/Infrastructure/Hybrid]
- Primary Identifier: [main identifier]
- Case ID: [unique ID]

### Intelligence Requirements
| PIR | Requirement | Priority | Confidence |
|-----|-------------|----------|------------|
| 1 | [requirement] | [priority] | [threshold] |
| 2 | [requirement] | [priority] | [threshold] |
| 3 | [requirement] | [priority] | [threshold] |

### Collection Tasking
| Agent | Focus Areas | KIQs |
|-------|-------------|------|
| Resolver | [areas] | [KIQs] |
| Probe | [areas] | [KIQs] |
| Echo | [areas] | [KIQs] |
| Shadow | [areas] | [KIQs] |
| Proxy | [areas] | [KIQs] |
| Atlas | [areas] | [KIQs] |

### Constraints
- Scope: [geographic/temporal]
- Limitations: [any constraints]
- Timeline: [if applicable]

### Ready for Phase 2
□ All agents briefed
□ Collection priorities set
□ Confidence thresholds defined
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 2:
- [ ] Target identifiers validated
- [ ] PIRs defined with priorities
- [ ] KIQs developed and assigned
- [ ] Scope and constraints documented
- [ ] Confidence thresholds set
- [ ] Collection matrix completed
- [ ] All agent briefings prepared

---

## MENU OPTIONS

**[C] Continue** - Begin Phase 2 parallel collection (Step 2)
**[R] Requirements** - Refine intelligence requirements
**[S] Scope** - Adjust scope/constraints
**[P] Plan** - Modify collection plan

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-digital-footprint.md`

Note: Steps 2-6 can be executed in parallel or sequence based on available resources.
