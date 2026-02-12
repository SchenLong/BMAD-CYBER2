---
name: 'step-09-assembly'
description: 'Final plan assembly, source matrix, phased approach, deliverables'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-09-assembly.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-08-human-surface.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Phase 9: Campaign Plan Assembly

## STEP GOAL

Synthesize all intelligence gathered across Phases 1-8 into a comprehensive OSINT campaign plan. Produce the final collection strategy document with PIR-to-source mapping, phased execution plan, risk assessment, and resource requirements.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Vector**, OSINT Lead
- You synthesize multi-source intelligence into actionable plans
- You ensure PIRs are addressed with appropriate sources
- You produce the final campaign deliverables

### Assembly Protocol

- Review all phase outputs
- Map sources to PIRs
- Assess PIR satisfaction
- Compile risk register
- Assemble final campaign plan

---

## ASSEMBLY SEQUENCE

### 1. PIR Satisfaction Assessment

Evaluate how well each PIR has been addressed:

```
PIR SATISFACTION ASSESSMENT
===========================

PIR-1: [Requirement Statement]
| KIQ | Status | Source | Confidence | Gaps |
|-----|--------|--------|------------|------|
| KIQ-1.1 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
| KIQ-1.2 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
| KIQ-1.3 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
Overall PIR-1 Status: [Satisfied/Partially Satisfied/Unsatisfied]
Additional Collection Needed: [Y/N, what]

PIR-2: [Requirement Statement]
| KIQ | Status | Source | Confidence | Gaps |
|-----|--------|--------|------------|------|
| KIQ-2.1 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
| KIQ-2.2 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
| KIQ-2.3 | [Satisfied/Partial/Open] | [phases] | [H/M/L] | [gaps] |
Overall PIR-2 Status: [Satisfied/Partially Satisfied/Unsatisfied]
Additional Collection Needed: [Y/N, what]

PIR-3: [Requirement Statement]
[Same structure]

PIR-4: [Requirement Statement]
[Same structure]

PIR SUMMARY:
| PIR | Status | Confidence | Priority Gaps |
|-----|--------|------------|---------------|
| PIR-1 | [status] | [H/M/L] | [gaps] |
| PIR-2 | [status] | [H/M/L] | [gaps] |
| PIR-3 | [status] | [H/M/L] | [gaps] |
| PIR-4 | [status] | [H/M/L] | [gaps] |

Overall Campaign Satisfaction: [X%] of PIRs addressed
```

### 2. Source-to-PIR Matrix

Map intelligence sources to requirements:

```
SOURCE-TO-PIR MATRIX
====================

| Source/Method | PIR-1 | PIR-2 | PIR-3 | PIR-4 | Primary Phase |
|---------------|-------|-------|-------|-------|---------------|
| DNS Enumeration | [X/-] | [X/-] | [-] | [-] | Phase 2 |
| Certificate Transparency | [X/-] | [-] | [-] | [-] | Phase 2 |
| WHOIS Analysis | [-] | [X/-] | [-] | [-] | Phase 2 |
| Technology Fingerprinting | [-] | [X/-] | [-] | [-] | Phase 3 |
| Code Repository Analysis | [-] | [X/-] | [-] | [-] | Phase 3 |
| Corporate Registry | [X/-] | [-] | [X/-] | [-] | Phase 4 |
| SEC/Regulatory Filings | [-] | [-] | [X/-] | [-] | Phase 4 |
| LinkedIn Analysis | [X/-] | [-] | [-] | [X/-] | Phase 5 |
| Social Media OSINT | [-] | [-] | [-] | [X/-] | Phase 5 |
| Breach Databases | [-] | [X/-] | [-] | [-] | Phase 6 |
| Dark Web Monitoring | [-] | [X/-] | [X/-] | [-] | Phase 6 |
| Threat Intel Feeds | [-] | [-] | [X/-] | [-] | Phase 7 |
| HUMINT Assessment | [-] | [-] | [-] | [X/-] | Phase 8 |

COVERAGE ASSESSMENT:
- PIR-1: [count] sources contributing
- PIR-2: [count] sources contributing
- PIR-3: [count] sources contributing
- PIR-4: [count] sources contributing
```

### 3. Key Intelligence Findings

Compile most significant findings:

```
KEY INTELLIGENCE FINDINGS
=========================

CRITICAL FINDINGS:
1. [Most significant finding with phase source]
2. [Second most significant]
3. [Third most significant]
4. [Fourth most significant]
5. [Fifth most significant]

ORGANIZATION PROFILE SUMMARY:

Identity:
- Legal Name: [name]
- Type: [type]
- Industry: [industry]
- Headquarters: [location]
- Status: [active/etc]

Scale:
- Employees: [count]
- Revenue: [amount/estimate]
- Countries: [count]
- Subsidiaries: [count]

Digital Footprint:
- Domains: [count]
- Cloud Providers: [list]
- Technology Stack: [summary]
- Security Posture: [assessment]

Corporate Structure:
- Parent: [if applicable]
- UBOs: [if identified]
- Key Executives: [count]

Threat Exposure:
- Industry Risk: [level]
- Breach History: [Y/N, count]
- Threat Actors: [count] relevant
- Underground Activity: [assessment]

Human Attack Surface:
- High-Value Targets: [count]
- Primary Vector: [vector]
- Physical Access: [assessment]
```

### 4. Risk Register

Compile risks identified during campaign:

```
RISK REGISTER
=============

SECURITY RISKS IDENTIFIED:
| ID | Risk | Severity | Likelihood | Impact | Source |
|----|------|----------|------------|--------|--------|
| R1 | [risk description] | [C/H/M/L] | [H/M/L] | [H/M/L] | Phase X |
| R2 | [risk description] | [C/H/M/L] | [H/M/L] | [H/M/L] | Phase X |
| R3 | [risk description] | [C/H/M/L] | [H/M/L] | [H/M/L] | Phase X |
| R4 | [risk description] | [C/H/M/L] | [H/M/L] | [H/M/L] | Phase X |
| R5 | [risk description] | [C/H/M/L] | [H/M/L] | [H/M/L] | Phase X |

CAMPAIGN OPERATIONAL RISKS:
| ID | Risk | Mitigation | Status |
|----|------|------------|--------|
| O1 | Detection risk | [mitigation] | [mitigated/accepted] |
| O2 | Scope creep | [mitigation] | [mitigated/accepted] |
| O3 | Data accuracy | [mitigation] | [mitigated/accepted] |

RISK SUMMARY:
- Critical risks: [count]
- High risks: [count]
- Medium risks: [count]
- Low risks: [count]
```

### 5. Recommended Follow-On Actions

Define next steps and recommendations:

```
RECOMMENDED FOLLOW-ON ACTIONS
=============================

IMMEDIATE ACTIONS (If authorized):
| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| 1 | [action] | [role] | [time] |
| 2 | [action] | [role] | [time] |
| 3 | [action] | [role] | [time] |

ADDITIONAL COLLECTION RECOMMENDED:
| Collection Type | Purpose | Estimated Effort |
|-----------------|---------|------------------|
| [Deep dive area] | [purpose] | [time/resources] |
| [Monitoring] | [purpose] | [ongoing] |
| [Workflow] | [purpose] | [time/resources] |

DEFENSIVE RECOMMENDATIONS:
| Priority | Recommendation | Addresses Risk |
|----------|---------------|----------------|
| 1 | [security improvement] | R[X] |
| 2 | [security improvement] | R[X] |
| 3 | [security improvement] | R[X] |

MONITORING REQUIREMENTS:
| Target | Frequency | Method | Owner |
|--------|-----------|--------|-------|
| [domain/infrastructure] | [daily/weekly] | [method] | [role] |
| [dark web mentions] | [daily/weekly] | [method] | [role] |
| [personnel changes] | [weekly/monthly] | [method] | [role] |
```

### 6. Campaign Plan Document

Assemble the final campaign plan:

```markdown
═══════════════════════════════════════════════════════════════

              OSINT CAMPAIGN PLAN: ORGANIZATION

═══════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
VERSION: 1.0
PREPARED BY: Intel Team - Vector

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
-----------------

Target: [Organization Name]
Campaign Duration: [time elapsed]
Agents Engaged: 8 (Vector, Resolver, Probe, Proxy, Echo, Shadow, Dossier, Viper)

Key Findings:
1. [Most critical finding]
2. [Second most critical]
3. [Third most critical]

PIR Satisfaction: [X%]
Critical Risks Identified: [count]
Recommended Immediate Actions: [count]

═══════════════════════════════════════════════════════════════

SECTION 1: TARGET PROFILE
-------------------------

[Comprehensive organization profile from findings]

═══════════════════════════════════════════════════════════════

SECTION 2: INTELLIGENCE REQUIREMENTS
------------------------------------

[PIR summary with satisfaction status]

═══════════════════════════════════════════════════════════════

SECTION 3: COLLECTION SUMMARY
-----------------------------

Phase 1 - Initialization: [summary]
Phase 2 - Infrastructure: [summary]
Phase 3 - Technology: [summary]
Phase 4 - Corporate: [summary]
Phase 5 - Public Presence: [summary]
Phase 6 - Underground: [summary]
Phase 7 - Threats: [summary]
Phase 8 - Human Surface: [summary]

═══════════════════════════════════════════════════════════════

SECTION 4: KEY FINDINGS
-----------------------

[Detailed findings organized by category]

═══════════════════════════════════════════════════════════════

SECTION 5: RISK ASSESSMENT
--------------------------

[Risk register with severity ratings]

═══════════════════════════════════════════════════════════════

SECTION 6: RECOMMENDATIONS
--------------------------

[Immediate, short-term, and long-term recommendations]

═══════════════════════════════════════════════════════════════

SECTION 7: SOURCE MATRIX
------------------------

[PIR-to-source mapping]

═══════════════════════════════════════════════════════════════

SECTION 8: GAPS AND FOLLOW-ON
-----------------------------

[Intelligence gaps and recommended additional collection]

═══════════════════════════════════════════════════════════════

APPENDICES
----------

A. Domain Inventory
B. Personnel Roster
C. Corporate Structure Diagram
D. Threat Actor Profiles
E. Timeline of Significant Events
F. Source Log

═══════════════════════════════════════════════════════════════

Report Prepared By: Intel Team (Vector coordinating)
Phases Completed: 9/9
Quality Review: [status]
Distribution: [as appropriate]

═══════════════════════════════════════════════════════════════
```

---

## WORKFLOW COMPLETION

```markdown
## CAMPAIGN PLANNER: ORGANIZATION COMPLETE

### Campaign Summary
- Target: [organization name]
- Duration: [time]
- Phases completed: 9/9
- Agents engaged: 8

### PIR Satisfaction
| PIR | Status | Confidence |
|-----|--------|------------|
| PIR-1 | [status] | [level] |
| PIR-2 | [status] | [level] |
| PIR-3 | [status] | [level] |
| PIR-4 | [status] | [level] |

### Deliverables Generated
- [ ] Campaign Plan Document
- [ ] Organization Profile
- [ ] Source Matrix
- [ ] Risk Register
- [ ] Recommendations
- [ ] Follow-On Actions

### Quality Metrics
- Steps completed: 9/9
- Agents engaged: 8
- PIR satisfaction: [X%]
- Critical findings: [count]
- Risks identified: [count]

### Recommended Follow-On Workflows
- **Spider Web** - Expand from key personnel
- **Breach Archaeology** - Deep breach analysis
- **Tripwire** - Set up monitoring
- **Attribution Chain** - If threat actor targeting identified
```

---

## COMPLETION CRITERIA

Campaign complete when:

- [ ] All phases (1-8) synthesized
- [ ] PIR satisfaction assessed
- [ ] Source matrix compiled
- [ ] Key findings documented
- [ ] Risks cataloged
- [ ] Recommendations developed
- [ ] Campaign plan document assembled
- [ ] Follow-on actions defined

---

## MENU OPTIONS

**[R] Report** - Generate final campaign report
**[E] Export** - Export deliverables
**[M] Monitor** - Initiate Tripwire workflow for ongoing monitoring
**[A] Archive** - Archive campaign materials

---

## WORKFLOW COMPLETE

Campaign Planner: Organization workflow finished. Deliverables ready for stakeholder review.
