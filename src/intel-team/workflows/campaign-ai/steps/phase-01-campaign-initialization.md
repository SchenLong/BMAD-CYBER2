---
name: 'phase-01-campaign-initialization'
description: 'Define AI-specific intelligence requirements, establish collection priorities, define technical depth'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-01-campaign-initialization.md'
nextStepFile: '{workflow_path}/steps/phase-02-technical-intelligence.md'
prevStepFile: null

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Phase 1: Campaign Initialization

## PHASE GOAL

Define AI-specific intelligence requirements, establish collection priorities, and determine the technical depth required for the campaign targeting the AI entity (company, model, application, infrastructure, or researcher).

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You orchestrate AI entity intelligence campaigns
- You define requirements and prioritize collection
- You set the scope and depth for technical analysis

### Analysis Protocol
- Identify and classify the AI entity type
- Define intelligence requirements specific to AI
- Establish collection priorities
- Determine technical depth needed
- Set campaign objectives and success criteria

---

## ANALYSIS EXECUTION SEQUENCE

### 1. AI Entity Classification

Identify and classify the target:

```
AI ENTITY CLASSIFICATION
=========================

Entity Identification:
| Field | Value |
|-------|-------|
| Entity Name | [name] |
| Entity Type | [Company/Model/Application/Infrastructure/Researcher] |
| Parent Organization | [if applicable] |
| Primary Domain | [headquarters/origin country] |
| Website/URL | [primary web presence] |
| First Identified | [date] |

Entity Type Classification:
| Type | Confirmed | Primary Focus Areas |
|------|-----------|---------------------|
| AI Company | [Y/N] | Capabilities, personnel, strategy, funding |
| AI Model | [Y/N] | Architecture, training, limitations, benchmarks |
| AI Application | [Y/N] | Usage, vulnerabilities, data flows, integrations |
| AI Infrastructure | [Y/N] | Scale, location, security, providers |
| AI Researcher | [Y/N] | Publications, affiliations, influence, network |

Related Entities:
| Entity | Relationship | Relevance |
|--------|--------------|-----------|
| [entity] | [parent/subsidiary/partner/competitor] | [why important] |

□ Entity type confirmed: [type]
□ Related entities identified: [count]
□ Primary focus areas defined: [list]
```

### 2. Intelligence Requirements Definition

Define AI-specific intelligence requirements:

```
INTELLIGENCE REQUIREMENTS DEFINITION
====================================

Priority Intelligence Requirements (PIRs):
| Rank | Requirement | Category | Justification |
|------|-------------|----------|---------------|
| 1 | [requirement] | [Technical/Business/Personnel/Security] | [why critical] |
| 2 | [requirement] | [category] | [justification] |
| 3 | [requirement] | [category] | [justification] |
| 4 | [requirement] | [category] | [justification] |
| 5 | [requirement] | [category] | [justification] |

Specific Information Requirements (SIRs):

TECHNICAL REQUIREMENTS:
| Requirement | Priority | Collection Method |
|-------------|----------|-------------------|
| Model architecture details | [H/M/L] | [papers, API testing] |
| Parameter count/scale | [H/M/L] | [documentation, inference] |
| Training methodology | [H/M/L] | [papers, blog posts] |
| Benchmark performance | [H/M/L] | [public benchmarks, testing] |
| Known vulnerabilities | [H/M/L] | [bug bounties, research] |
| Infrastructure scale | [H/M/L] | [job posts, filings] |

BUSINESS REQUIREMENTS:
| Requirement | Priority | Collection Method |
|-------------|----------|-------------------|
| Funding and valuation | [H/M/L] | [filings, press] |
| Partnership network | [H/M/L] | [announcements, LinkedIn] |
| Customer base | [H/M/L] | [case studies, testimonials] |
| Pricing structure | [H/M/L] | [API docs, sales materials] |
| Go-to-market strategy | [H/M/L] | [marketing, job posts] |
| Competitive positioning | [H/M/L] | [analyst reports, press] |

PERSONNEL REQUIREMENTS:
| Requirement | Priority | Collection Method |
|-------------|----------|-------------------|
| Leadership team | [H/M/L] | [LinkedIn, press] |
| Key researchers | [H/M/L] | [papers, conferences] |
| Safety/alignment team | [H/M/L] | [papers, blog posts] |
| Engineering leads | [H/M/L] | [GitHub, LinkedIn] |
| Board and advisors | [H/M/L] | [filings, announcements] |
| Hiring patterns | [H/M/L] | [job posts] |

SECURITY REQUIREMENTS:
| Requirement | Priority | Collection Method |
|-------------|----------|-------------------|
| Credential exposures | [H/M/L] | [breach databases] |
| Internal document leaks | [H/M/L] | [underground sources] |
| Jailbreak susceptibility | [H/M/L] | [research, testing] |
| Prompt injection vulns | [H/M/L] | [research, testing] |
| Incident history | [H/M/L] | [press, disclosures] |
| Bug bounty findings | [H/M/L] | [public disclosures] |

□ PIRs defined: [count]
□ SIRs catalogued: [count]
□ Collection methods mapped: [Y/N]
```

### 3. Collection Priorities

Establish prioritized collection strategy:

```
COLLECTION PRIORITIES
=====================

Priority Matrix:
| Priority | Intelligence Area | Agents Required | Time Allocation |
|----------|-------------------|-----------------|-----------------|
| Critical | [area] | [agent list] | [% of effort] |
| High | [area] | [agents] | [%] |
| Medium | [area] | [agents] | [%] |
| Low | [area] | [agents] | [%] |

Agent Assignment:
| Agent | Codename | Primary Focus | Secondary Focus |
|-------|----------|---------------|-----------------|
| technical-researcher | Probe | Model/infrastructure analysis | Code review |
| domain-intel-specialist | Resolver | API endpoints, infrastructure | Cloud footprint |
| corporate-intel-specialist | Proxy | Funding, structure | Regulatory |
| social-media-analyst | Echo | Personnel, organization | Community |
| dark-web-analyst | Shadow | Exposures, leaks | Underground trading |
| threat-actor-profiler | Dossier | Threat assessment | Risk analysis |

Collection Phases:
| Phase | Focus | Duration | Outputs |
|-------|-------|----------|---------|
| Phase 2 | Technical Intelligence | [time] | Capability assessment |
| Phase 3 | Digital Infrastructure | [time] | Infrastructure map |
| Phase 4 | Corporate Structure | [time] | Org structure, funding |
| Phase 5 | Personnel | [time] | Key personnel dossiers |
| Phase 6 | Underground | [time] | Exposure assessment |
| Phase 7 | Threat Assessment | [time] | Risk profile |
| Phase 8 | Assembly | [time] | Final campaign plan |

□ Priorities established: [Y/N]
□ Agent assignments confirmed: [Y/N]
□ Phase timeline set: [Y/N]
```

### 4. Technical Depth Definition

Define required technical analysis depth:

```
TECHNICAL DEPTH DEFINITION
==========================

Model Analysis Depth:
| Analysis Area | Depth Required | Justification |
|---------------|----------------|---------------|
| Architecture | [Surface/Moderate/Deep/Comprehensive] | [reason] |
| Training data | [depth] | [reason] |
| Capabilities | [depth] | [reason] |
| Vulnerabilities | [depth] | [reason] |
| API behavior | [depth] | [reason] |

Infrastructure Analysis Depth:
| Analysis Area | Depth Required | Justification |
|---------------|----------------|---------------|
| Compute resources | [depth] | [reason] |
| Cloud providers | [depth] | [reason] |
| Network topology | [depth] | [reason] |
| Data pipelines | [depth] | [reason] |
| Serving infrastructure | [depth] | [reason] |

Research Analysis Depth:
| Analysis Area | Depth Required | Justification |
|---------------|----------------|---------------|
| Published papers | [depth] | [reason] |
| Patent filings | [depth] | [reason] |
| Open source code | [depth] | [reason] |
| Conference presentations | [depth] | [reason] |
| Technical blog posts | [depth] | [reason] |

Depth Level Definitions:
| Level | Definition | Effort Required |
|-------|------------|-----------------|
| Surface | High-level overview, public information only | Low |
| Moderate | Detailed analysis of available sources | Medium |
| Deep | Comprehensive analysis with inference | High |
| Comprehensive | Exhaustive analysis including testing | Very High |

□ Technical depth defined: [Y/N]
□ Effort level estimated: [H/M/L]
□ Testing requirements: [Y/N]
```

### 5. Campaign Objectives & Success Criteria

Define measurable objectives:

```
CAMPAIGN OBJECTIVES & SUCCESS CRITERIA
======================================

Primary Objectives:
| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| 1 | [objective] | [measurable outcome] |
| 2 | [objective] | [outcome] |
| 3 | [objective] | [outcome] |

Secondary Objectives:
| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| 1 | [objective] | [outcome] |
| 2 | [objective] | [outcome] |

Success Criteria:
| Criterion | Threshold | Status |
|-----------|-----------|--------|
| PIRs answered | [X%] minimum | [pending] |
| Key personnel identified | [count] minimum | [pending] |
| Technical capabilities assessed | [Y/N] | [pending] |
| Vulnerabilities documented | [count] minimum | [pending] |
| Infrastructure mapped | [Y/N] | [pending] |
| Funding/valuation determined | [Y/N] | [pending] |
| Competitive position assessed | [Y/N] | [pending] |

Risk Factors:
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [risk] | [H/M/L] | [H/M/L] | [strategy] |
| Limited public information | [prob] | [impact] | [mitigation] |
| Rapid entity evolution | [prob] | [impact] | [mitigation] |

Timeline Constraints:
| Constraint | Deadline | Impact on Collection |
|------------|----------|---------------------|
| [constraint] | [date] | [adjustment needed] |

□ Objectives defined: [count]
□ Success criteria established: [count]
□ Risk factors assessed: [count]
```

### 6. Campaign Initialization Summary

Compile initialization findings:

```
CAMPAIGN INITIALIZATION SUMMARY
================================

Entity Summary:
| Field | Value |
|-------|-------|
| Entity Name | [name] |
| Entity Type | [type] |
| Classification | [COMPANY/MODEL/APPLICATION/INFRASTRUCTURE/RESEARCHER] |
| Primary Focus | [key intelligence areas] |

Intelligence Requirements:
| Category | PIR Count | SIR Count |
|----------|-----------|-----------|
| Technical | [count] | [count] |
| Business | [count] | [count] |
| Personnel | [count] | [count] |
| Security | [count] | [count] |
| **TOTAL** | **[count]** | **[count]** |

Collection Strategy:
| Priority Level | Areas | Effort Allocation |
|----------------|-------|-------------------|
| Critical | [areas] | [%] |
| High | [areas] | [%] |
| Medium | [areas] | [%] |
| Low | [areas] | [%] |

Technical Depth:
| Area | Depth |
|------|-------|
| Model analysis | [level] |
| Infrastructure analysis | [level] |
| Research analysis | [level] |

Campaign Parameters:
| Parameter | Value |
|-----------|-------|
| Estimated duration | [time] |
| Agents required | [count] |
| Technical testing required | [Y/N] |
| Underground sources required | [Y/N] |

HANDOFF TO PROBE (Phase 2):
- Entity type: [type]
- Technical priorities: [list]
- Depth requirements: [levels]
- Specific focus areas: [list]
- Time allocation: [hours/days]
```

---

## PHASE 1 OUTPUT

```markdown
## CAMPAIGN INITIALIZATION COMPLETE

### Entity Profile
- Name: [name]
- Type: [type]
- Classification: [category]

### Intelligence Requirements
| Category | Count | Priority Focus |
|----------|-------|----------------|
| Technical | [count] | [focus] |
| Business | [count] | [focus] |
| Personnel | [count] | [focus] |
| Security | [count] | [focus] |

### Collection Strategy
- Primary focus: [area]
- Technical depth: [level]
- Estimated duration: [time]
- Agents assigned: [list]

### Campaign Objectives
1. [Primary objective 1]
2. [Primary objective 2]
3. [Primary objective 3]

### Next Phase
Phase 2: Technical Intelligence (Probe)
Focus: [specific technical areas]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 2:
- [ ] Entity classified and categorized
- [ ] PIRs and SIRs defined
- [ ] Collection priorities established
- [ ] Technical depth determined
- [ ] Success criteria defined
- [ ] Handoff prepared for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical intelligence collection (Phase 2)
**[R] Refine** - Adjust requirements or priorities
**[S] Scope** - Modify campaign scope
**[D] Depth** - Adjust technical depth levels

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/phase-02-technical-intelligence.md`
