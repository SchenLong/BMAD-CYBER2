---
name: 'step-01-initialization'
description: 'Define PIRs, KIQs, collection priorities, and operational boundaries'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-01-initialization.md'
nextStepFile: '{workflow_path}/steps/step-02-infrastructure.md'
prevStepFile: null

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Phase 1: Campaign Initialization

## STEP GOAL

Establish the foundation for the OSINT campaign by defining clear intelligence requirements, scoping the investigation, and setting operational parameters. This phase ensures all subsequent collection is focused and efficient.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Vector**, OSINT Lead
- You coordinate the overall intelligence campaign
- You define collection priorities and resource allocation
- You ensure legal and ethical boundaries are respected

### Initialization Protocol

- Validate target organization information
- Develop Priority Intelligence Requirements (PIRs)
- Create Key Intelligence Questions (KIQs)
- Establish scope and constraints
- Define success criteria

---

## INITIALIZATION SEQUENCE

### 1. Target Organization Validation

Document and validate the target organization:

```
TARGET ORGANIZATION VALIDATION
==============================

Organization Details:
□ Legal Name: [full legal name]
□ Common Name(s): [trade names, DBAs]
□ Organization Type: [Corporate/Government/NGO/Criminal/Threat Group]
□ Industry/Sector: [primary sector]
□ Headquarters: [location]
□ Founded/Established: [date if known]

Known Identifiers:
| Type | Value | Verified |
|------|-------|----------|
| Primary Domain | [domain] | [Y/N] |
| Secondary Domains | [domains] | [Y/N] |
| Registration Number | [company reg] | [Y/N] |
| Tax ID | [if known] | [Y/N] |
| Stock Symbol | [if public] | [Y/N] |

Initial Size Assessment:
□ Employee Count: [estimate or known]
□ Revenue/Budget: [estimate or known]
□ Geographic Footprint: [countries of operation]
□ Subsidiary Count: [estimate if known]

Validation Status:
□ Organization confirmed to exist: [Y/N]
□ Basic information verified: [Y/N]
□ Scope appropriate for campaign: [Y/N]
```

### 2. Intelligence Objective Definition

Define what the campaign needs to achieve:

```
INTELLIGENCE OBJECTIVE DEFINITION
=================================

Primary Objective:
[Clear statement of what intelligence is needed and why]

Objective Type:
□ Reconnaissance - Pre-engagement intelligence gathering
□ Competitive Intelligence - Business/market analysis
□ Due Diligence - M&A/partnership assessment
□ Threat Assessment - Security risk evaluation
□ Investigation - Fraud/misconduct inquiry
□ Attribution - Threat actor identification
□ Other: [specify]

Customer/Stakeholder:
□ Who needs this intelligence: [stakeholder]
□ Decision this will inform: [decision context]
□ Timeline requirements: [deadline if any]

Success Criteria:
1. [Measurable success criterion]
2. [Measurable success criterion]
3. [Measurable success criterion]
```

### 3. Priority Intelligence Requirements (PIRs)

Develop formal intelligence requirements:

```
PRIORITY INTELLIGENCE REQUIREMENTS
==================================

PIR-1: [First priority requirement]
Description: [Detailed description of what needs to be known]
Priority: CRITICAL / HIGH / MEDIUM
Supporting KIQs:
- KIQ-1.1: [Specific question]
- KIQ-1.2: [Specific question]
- KIQ-1.3: [Specific question]
Primary Collection: [Phase/Agent]

PIR-2: [Second priority requirement]
Description: [Detailed description]
Priority: CRITICAL / HIGH / MEDIUM
Supporting KIQs:
- KIQ-2.1: [Specific question]
- KIQ-2.2: [Specific question]
- KIQ-2.3: [Specific question]
Primary Collection: [Phase/Agent]

PIR-3: [Third priority requirement]
Description: [Detailed description]
Priority: CRITICAL / HIGH / MEDIUM
Supporting KIQs:
- KIQ-3.1: [Specific question]
- KIQ-3.2: [Specific question]
- KIQ-3.3: [Specific question]
Primary Collection: [Phase/Agent]

PIR-4: [Fourth priority requirement]
Description: [Detailed description]
Priority: CRITICAL / HIGH / MEDIUM
Supporting KIQs:
- KIQ-4.1: [Specific question]
- KIQ-4.2: [Specific question]
- KIQ-4.3: [Specific question]
Primary Collection: [Phase/Agent]

[Add additional PIRs as needed]

PIR SUMMARY:
| PIR | Topic | Priority | Primary Phase |
|-----|-------|----------|---------------|
| PIR-1 | [topic] | [priority] | [phase] |
| PIR-2 | [topic] | [priority] | [phase] |
| PIR-3 | [topic] | [priority] | [phase] |
| PIR-4 | [topic] | [priority] | [phase] |
```

### 4. Collection Scope Definition

Define boundaries of collection:

```
COLLECTION SCOPE DEFINITION
===========================

Geographic Scope:
□ Primary Countries: [list]
□ Secondary Countries: [list]
□ Excluded Countries: [list if any]

Temporal Scope:
□ Historical Lookback: [how far back to investigate]
□ Campaign Duration: [expected duration]
□ Update Frequency: [one-time/ongoing monitoring]

Entity Scope:
□ Primary Target: [organization name]
□ Subsidiaries In-Scope: [Y/N, criteria]
□ Parent Company In-Scope: [Y/N]
□ Partners/Affiliates In-Scope: [Y/N, criteria]
□ Key Personnel In-Scope: [Y/N, which roles]

Technical Scope:
□ Domain/Infrastructure: [in-scope domains]
□ IP Ranges: [if known]
□ Cloud Services: [in-scope services]

Collection Boundaries:
□ Active collection authorized: [Y/N]
□ Social engineering authorized: [Y/N]
□ Dark web collection authorized: [Y/N]
□ Breach data usage authorized: [Y/N]

OUT OF SCOPE:
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Explicitly excluded item 3]
```

### 5. Legal and Ethical Framework

Document legal and ethical constraints:

```
LEGAL AND ETHICAL FRAMEWORK
===========================

Legal Authority:
□ Authorization basis: [contract/internal authority/legal order]
□ Jurisdiction considerations: [relevant jurisdictions]
□ Privacy regulations applicable: [GDPR/CCPA/other]
□ Legal counsel consulted: [Y/N]

Ethical Guidelines:
□ Collection limited to public information: [Y/N]
□ No deceptive practices: [Y/N/With Authorization]
□ Proportionality respected: [Y/N]
□ Data handling protocols: [description]

Platform Compliance:
□ Social media ToS respected: [Y/N]
□ API rate limits honored: [Y/N]
□ Scraping restrictions noted: [Y/N]

Documentation Requirements:
□ All sources documented: [Y/N]
□ Collection timestamps recorded: [Y/N]
□ Chain of custody maintained: [Y/N]

Constraints:
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]
```

### 6. Resource and Tool Planning

Identify required resources:

```
RESOURCE AND TOOL PLANNING
==========================

Agent Allocation:
| Phase | Agent | Codename | Priority |
|-------|-------|----------|----------|
| 2 | domain-intel-specialist | Resolver | HIGH |
| 3 | technical-researcher | Probe | HIGH |
| 4 | corporate-intel-specialist | Proxy | HIGH |
| 5 | social-media-analyst | Echo | MEDIUM |
| 6 | dark-web-analyst | Shadow | MEDIUM |
| 7 | threat-actor-profiler | Dossier | MEDIUM |
| 8 | humint-specialist | Viper | LOW |

Tools Required:
| Tool/Service | Purpose | Phase | Availability |
|--------------|---------|-------|--------------|
| DNS lookup tools | Domain enumeration | 2 | [Available/Needed] |
| WHOIS services | Registration data | 2 | [Available/Needed] |
| Corporate registries | Company data | 4 | [Available/Needed] |
| Social media search | Personnel | 5 | [Available/Needed] |
| Breach databases | Exposure check | 6 | [Available/Needed] |
| Threat intel feeds | Threat correlation | 7 | [Available/Needed] |

API/Service Requirements:
| Service | Purpose | Status |
|---------|---------|--------|
| Shodan | Infrastructure | [Available/Needed] |
| SecurityTrails | DNS history | [Available/Needed] |
| OpenCorporates | Corporate data | [Available/Needed] |
| HIBP | Breach check | [Available/Needed] |
| [Other] | [purpose] | [status] |
```

### 7. Collection Management Plan

Create initial collection management plan:

```
COLLECTION MANAGEMENT PLAN
==========================

Phase Schedule:
| Phase | Name | Agent | Start | Duration |
|-------|------|-------|-------|----------|
| 1 | Initialization | Vector | Now | 15 min |
| 2 | Infrastructure | Resolver | +15min | 20 min |
| 3 | Technology | Probe | +35min | 15 min |
| 4 | Corporate | Proxy | +50min | 20 min |
| 5 | Public Presence | Echo | +70min | 15 min |
| 6 | Underground | Shadow | +85min | 15 min |
| 7 | Threat Landscape | Dossier | +100min | 15 min |
| 8 | Human Surface | Viper | +115min | 15 min |
| 9 | Assembly | Vector | +130min | 20 min |

Checkpoint Criteria:
□ After Phase 4: Validate corporate structure before proceeding
□ After Phase 6: Assess if additional collection needed
□ After Phase 8: Review for gaps before assembly

Risk Factors:
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Limited public info | [H/M/L] | [H/M/L] | [mitigation] |
| Language barriers | [H/M/L] | [H/M/L] | [mitigation] |
| Data accuracy | [H/M/L] | [H/M/L] | [mitigation] |
| Time constraints | [H/M/L] | [H/M/L] | [mitigation] |
```

---

## PHASE 1 OUTPUT

```markdown
## CAMPAIGN INITIALIZATION SUMMARY

### Target Organization
- Name: [organization name]
- Type: [type]
- Industry: [sector]
- Headquarters: [location]

### Intelligence Objective
[Primary objective statement]

### PIR Summary
| PIR | Topic | Priority |
|-----|-------|----------|
| PIR-1 | [topic] | [priority] |
| PIR-2 | [topic] | [priority] |
| PIR-3 | [topic] | [priority] |
| PIR-4 | [topic] | [priority] |

### Scope
- Geographic: [scope]
- Temporal: [scope]
- Entities: [scope]
- Authorized Activities: [list]

### Legal Framework
- Authorization: [basis]
- Key Constraints: [list]

### Resource Readiness
- All agents available: [Y/N]
- Required tools accessible: [Y/N]
- Estimated duration: [time]

### Ready for Collection
Campaign initialization complete. Proceed to infrastructure mapping.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 2:

- [ ] Target organization validated
- [ ] Intelligence objectives defined
- [ ] PIRs and KIQs documented
- [ ] Collection scope established
- [ ] Legal/ethical framework documented
- [ ] Resources and tools identified
- [ ] Collection management plan created

---

## MENU OPTIONS

**[C] Continue** - Proceed to infrastructure mapping (Phase 2)
**[P] PIR Refinement** - Adjust intelligence requirements
**[S] Scope Adjustment** - Modify collection scope
**[R] Resource Check** - Verify tool availability

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-infrastructure.md`
