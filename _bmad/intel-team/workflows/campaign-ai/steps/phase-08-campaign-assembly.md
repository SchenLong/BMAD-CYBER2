---
name: 'phase-08-campaign-assembly'
description: 'Final AI entity profile, technical capability assessment, organizational map, collection gaps, monitoring recommendations'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-08-campaign-assembly.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/phase-07-threat-risk-assessment.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Phase 8: Campaign Plan Assembly

## PHASE GOAL

Synthesize all findings from Phases 1-7 into a comprehensive AI Entity Campaign Plan. Produce the final entity profile, technical capability assessment, organizational map, identify collection gaps, and develop monitoring recommendations.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You synthesize multi-source findings into actionable intelligence
- You produce comprehensive campaign plans and assessments
- You identify gaps and develop monitoring strategies

### Analysis Protocol
- Integrate all findings from Phases 1-7
- Produce comprehensive AI entity profile
- Develop technical capability assessment
- Create organizational map
- Identify collection gaps
- Develop monitoring recommendations
- Produce competitive positioning analysis

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Findings Integration

Consolidate all phase findings:

```
FINDINGS INTEGRATION
====================

Phase Summaries:
| Phase | Agent | Key Findings | Risk Level |
|-------|-------|--------------|------------|
| 1. Initialization | Vector | [priorities, scope] | - |
| 2. Technical Intel | Probe | [capabilities, vulns] | [H/M/L] |
| 3. Infrastructure | Resolver | [domains, APIs, cloud] | [H/M/L] |
| 4. Corporate | Proxy | [structure, funding] | [H/M/L] |
| 5. Personnel | Echo | [leadership, org] | [H/M/L] |
| 6. Underground | Shadow | [exposures, leaks] | [H/M/L] |
| 7. Threat/Risk | Dossier | [threats, risks] | [H/M/L] |

Intelligence Requirements Status:
| PIR | Status | Confidence | Source Quality |
|-----|--------|------------|----------------|
| [PIR 1] | [Answered/Partial/Gap] | [H/M/L] | [quality] |
| [PIR 2] | [status] | [confidence] | [quality] |
| [PIR 3] | [status] | [confidence] | [quality] |
| [PIR 4] | [status] | [confidence] | [quality] |
| [PIR 5] | [status] | [confidence] | [quality] |

Cross-Phase Correlations:
| Finding | Corroborating Phases | Confidence |
|---------|---------------------|------------|
| [finding] | [phase numbers] | [H/M/L] |

Conflicting Information:
| Topic | Phase A Finding | Phase B Finding | Resolution |
|-------|-----------------|-----------------|------------|
| [topic] | [finding] | [conflicting] | [which to believe] |

□ All phases integrated: [Y/N]
□ PIRs answered: [X/Y]
□ Conflicts resolved: [Y/N]
```

### 2. AI Entity Profile

Produce comprehensive entity profile:

```
═══════════════════════════════════════════════════════════════════════════════

                         AI ENTITY PROFILE

═══════════════════════════════════════════════════════════════════════════════

ENTITY OVERVIEW
===============

| Field | Value |
|-------|-------|
| Entity Name | [name] |
| Entity Type | [Company/Model/Application/Infrastructure/Researcher] |
| Parent Organization | [if applicable] |
| Headquarters | [location] |
| Founded | [date] |
| Website | [URL] |
| Primary Products | [list] |

CORPORATE PROFILE
=================

| Attribute | Value |
|-----------|-------|
| Legal Status | [entity type, jurisdiction] |
| Employee Count | [estimate] |
| Valuation | [$X] |
| Total Funding | [$X] |
| Key Investors | [list] |
| Major Partnerships | [list] |

LEADERSHIP
==========

| Name | Title | Background |
|------|-------|------------|
| [name] | CEO | [brief background] |
| [name] | CTO | [background] |
| [name] | Chief Scientist | [background] |

KEY RESEARCH PERSONNEL
| Name | Focus Area | Notable Work |
|------|------------|--------------|
| [name] | [area] | [contributions] |

TECHNICAL PROFILE
=================

Primary Models/Products:
| Model/Product | Capabilities | Benchmarks | Limitations |
|---------------|--------------|------------|-------------|
| [model] | [capabilities] | [performance] | [limitations] |

Architecture Summary:
- Model type: [type]
- Parameter count: [count]
- Context window: [tokens]
- Training data: [summary]
- Training compute: [estimate]

Infrastructure:
- Cloud providers: [list]
- Compute scale: [estimate]
- Geographic presence: [regions]

RISK PROFILE
============

| Category | Risk Level | Key Concern |
|----------|------------|-------------|
| Nation-state | [H/M/L] | [primary concern] |
| Competitive | [H/M/L] | [concern] |
| Insider | [H/M/L] | [concern] |
| Supply chain | [H/M/L] | [concern] |
| Regulatory | [H/M/L] | [concern] |
| Misuse | [H/M/L] | [concern] |
| **OVERALL** | **[H/M/L]** | - |

EXPOSURE STATUS
===============

| Category | Status | Details |
|----------|--------|---------|
| Credential exposure | [count exposed] | [executive exposure] |
| Document leaks | [Y/N] | [severity] |
| Model leaks | [Y/N] | [details] |
| Active targeting | [Y/N] | [threat actors] |

═══════════════════════════════════════════════════════════════════════════════
```

### 3. Technical Capability Assessment

Produce detailed technical assessment:

```
TECHNICAL CAPABILITY ASSESSMENT
===============================

Model Capabilities Matrix:
| Capability | Rating (1-10) | Evidence | Competitive Position |
|------------|---------------|----------|---------------------|
| Reasoning | [score] | [benchmarks] | [vs competitors] |
| Coding | [score] | [benchmarks] | [position] |
| Math | [score] | [benchmarks] | [position] |
| Multimodal | [score] | [capabilities] | [position] |
| Safety | [score] | [evidence] | [position] |
| Tool use | [score] | [capabilities] | [position] |
| Instruction following | [score] | [evidence] | [position] |

Training & Data Assessment:
| Aspect | Assessment | Confidence |
|--------|------------|------------|
| Training data quality | [assessment] | [H/M/L] |
| Training data scale | [tokens estimate] | [confidence] |
| RLHF sophistication | [assessment] | [confidence] |
| Safety training | [assessment] | [confidence] |

Infrastructure Assessment:
| Component | Assessment | Scale Estimate |
|-----------|------------|----------------|
| Training compute | [assessment] | [GPU hours/cost] |
| Serving infrastructure | [assessment] | [capacity] |
| Cloud dependency | [assessment] | [providers] |

Vulnerability Assessment:
| Vulnerability Type | Status | Severity |
|--------------------|--------|----------|
| Prompt injection | [vulnerable/mitigated] | [H/M/L] |
| Jailbreaks | [status] | [severity] |
| Data extraction | [status] | [severity] |
| API abuse | [status] | [severity] |

Capability Trajectory:
| Timeframe | Projected Developments | Confidence |
|-----------|------------------------|------------|
| 6 months | [expected improvements] | [H/M/L] |
| 12 months | [projections] | [confidence] |
| 24 months | [projections] | [confidence] |

□ Capabilities assessed: [Y/N]
□ Vulnerabilities documented: [count]
□ Trajectory projected: [Y/N]
```

### 4. Organizational Map

Create comprehensive org map:

```
ORGANIZATIONAL MAP
==================

Corporate Structure:
```
[Ultimate Parent]
├── [Parent Company]
│   ├── [TARGET ENTITY]
│   │   ├── [Research Division]
│   │   ├── [Engineering Division]
│   │   ├── [Safety Division]
│   │   ├── [Product Division]
│   │   └── [Operations]
│   │       ├── [Subsidiary 1]
│   │       ├── [Subsidiary 2]
│   │       └── [Subsidiary 3]
│   └── [Sister Companies]
└── [Other Holdings]
```

Leadership Hierarchy:
```
[CEO]
├── [CTO]
│   ├── [VP Research]
│   │   └── [Research Leads]
│   └── [VP Engineering]
│       └── [Engineering Leads]
├── [COO]
│   └── [Operations Teams]
├── [CFO]
│   └── [Finance Teams]
└── [Chief Scientist / Head of Safety]
    └── [Safety Team]
```

Key Personnel Network:
| Person | Internal Connections | External Connections |
|--------|---------------------|---------------------|
| [person] | [reports to, manages] | [board seats, affiliations] |

Investment/Partnership Network:
| Entity | Relationship | Significance |
|--------|--------------|--------------|
| [investor] | [Series X lead] | [board seat, influence] |
| [partner] | [compute partnership] | [dependency level] |

□ Structure mapped: [Y/N]
□ Key relationships identified: [count]
□ Dependencies documented: [count]
```

### 5. Collection Gaps

Identify intelligence gaps:

```
COLLECTION GAPS
===============

Unanswered PIRs:
| PIR | Status | Gap Reason | Recommended Action |
|-----|--------|------------|-------------------|
| [PIR] | [unanswered] | [information not available] | [action] |

Information Gaps:
| Category | Gap | Priority | Collection Approach |
|----------|-----|----------|---------------------|
| Technical | [specific gap] | [H/M/L] | [how to fill] |
| Corporate | [gap] | [priority] | [approach] |
| Personnel | [gap] | [priority] | [approach] |
| Security | [gap] | [priority] | [approach] |

Confidence Limitations:
| Finding | Confidence | Limitation | Improvement Path |
|---------|------------|------------|------------------|
| [finding] | [L/M] | [single source/inference] | [how to verify] |

Future Collection Priorities:
| Priority | Target | Method | Timeline |
|----------|--------|--------|----------|
| 1 | [target] | [collection method] | [when] |
| 2 | [target] | [method] | [timeline] |
| 3 | [target] | [method] | [timeline] |

Sources Not Yet Exploited:
| Source Type | Potential Value | Access Difficulty |
|-------------|-----------------|-------------------|
| [source] | [value] | [difficulty] |

□ Gaps identified: [count]
□ Priorities set: [Y/N]
□ Collection plan developed: [Y/N]
```

### 6. Monitoring Recommendations

Develop ongoing monitoring plan:

```
MONITORING RECOMMENDATIONS
==========================

Monitoring Categories:
| Category | What to Monitor | Tool/Method | Frequency |
|----------|-----------------|-------------|-----------|
| Technical | New releases, capabilities | [method] | [frequency] |
| Personnel | Hiring, departures | LinkedIn, job posts | Weekly |
| Regulatory | Policy developments | [sources] | Monthly |
| Underground | Exposures, trading | [sources] | Weekly |
| Competitive | Market moves | [sources] | Monthly |
| Research | Publications | arXiv, conferences | Weekly |

Alert Thresholds:
| Alert Type | Trigger | Response |
|------------|---------|----------|
| Model release | New version announced | Immediate assessment |
| Funding round | Announcement | Valuation update |
| Key departure | Executive/researcher leaves | Impact assessment |
| Breach | New exposure detected | Credential/leak assessment |
| Regulatory | New rule affecting entity | Compliance assessment |

Key Indicators to Watch:
| Indicator | Current Baseline | Significance |
|-----------|------------------|--------------|
| Employee count | [baseline] | Growth trajectory |
| Job posting volume | [baseline] | Hiring plans |
| Publication rate | [baseline] | Research activity |
| API pricing | [baseline] | Business strategy |
| Safety announcements | [baseline] | Safety posture |

Update Cadence:
| Assessment Type | Frequency | Owner |
|-----------------|-----------|-------|
| Full campaign update | Quarterly | Vector |
| Technical assessment | Monthly | Probe |
| Personnel update | Monthly | Echo |
| Underground check | Weekly | Shadow |
| Threat assessment | Quarterly | Dossier |

□ Monitoring plan complete: [Y/N]
□ Alert thresholds set: [count]
□ Update cadence defined: [Y/N]
```

### 7. Competitive Positioning Analysis

Assess competitive position:

```
COMPETITIVE POSITIONING ANALYSIS
================================

Market Position:
| Dimension | Position | Trajectory |
|-----------|----------|------------|
| Model capabilities | [leader/challenger/follower] | [improving/stable/declining] |
| Market share | [estimate] | [trajectory] |
| Funding position | [well-funded/adequate/constrained] | [trajectory] |
| Talent position | [strong/adequate/weak] | [trajectory] |
| Partnership strength | [position] | [trajectory] |

Competitive Matrix:
| Factor | Target | Competitor A | Competitor B | Competitor C |
|--------|--------|--------------|--------------|--------------|
| Capabilities | [rating] | [rating] | [rating] | [rating] |
| Funding | [rating] | [rating] | [rating] | [rating] |
| Talent | [rating] | [rating] | [rating] | [rating] |
| Safety posture | [rating] | [rating] | [rating] | [rating] |
| Market position | [rating] | [rating] | [rating] | [rating] |

Competitive Advantages:
| Advantage | Sustainability | Threat |
|-----------|---------------|--------|
| [advantage] | [durable/temporary] | [what could erode] |

Competitive Vulnerabilities:
| Vulnerability | Impact | Exploitation by |
|---------------|--------|-----------------|
| [vulnerability] | [H/M/L] | [who could exploit] |

Strategic Trajectory:
| Timeframe | Expected Position | Key Drivers |
|-----------|-------------------|-------------|
| 6 months | [projection] | [factors] |
| 12 months | [projection] | [factors] |
| 24 months | [projection] | [factors] |

□ Position assessed: [Y/N]
□ Trajectory projected: [Y/N]
□ Vulnerabilities identified: [count]
```

### 8. Final Campaign Plan

Compile comprehensive campaign plan:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    AI ENTITY OSINT CAMPAIGN PLAN

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
PREPARED BY: Intel Team
ENTITY: [Entity name]

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Entity: [Name]
Type: [Company/Model/Application/Infrastructure/Researcher]
Overall Assessment: [1-2 sentence summary]
Risk Level: [H/M/L]

Key Findings:
1. [Most significant finding]
2. [Second finding]
3. [Third finding]

Priority Intelligence Requirements Status:
- Answered: [X] of [Y]
- Partial: [X]
- Gaps: [X]

═══════════════════════════════════════════════════════════════════════════════

                         ENTITY PROFILE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

[Insert Entity Profile from Section 2]

═══════════════════════════════════════════════════════════════════════════════

                    TECHNICAL CAPABILITY ASSESSMENT

═══════════════════════════════════════════════════════════════════════════════

[Insert Technical Assessment from Section 3]

═══════════════════════════════════════════════════════════════════════════════

                        ORGANIZATIONAL MAP

═══════════════════════════════════════════════════════════════════════════════

[Insert Org Map from Section 4]

═══════════════════════════════════════════════════════════════════════════════

                         THREAT ASSESSMENT

═══════════════════════════════════════════════════════════════════════════════

Overall Risk: [H/M/L]

| Category | Risk Level | Key Concern |
|----------|------------|-------------|
| Nation-state | [H/M/L] | [concern] |
| Competitive | [H/M/L] | [concern] |
| Insider | [H/M/L] | [concern] |
| Supply chain | [H/M/L] | [concern] |
| Regulatory | [H/M/L] | [concern] |
| Misuse | [H/M/L] | [concern] |

Critical Threats:
1. [Threat 1]
2. [Threat 2]
3. [Threat 3]

═══════════════════════════════════════════════════════════════════════════════

                        COLLECTION GAPS

═══════════════════════════════════════════════════════════════════════════════

[Insert Collection Gaps from Section 5]

═══════════════════════════════════════════════════════════════════════════════

                      MONITORING PLAN

═══════════════════════════════════════════════════════════════════════════════

[Insert Monitoring Recommendations from Section 6]

═══════════════════════════════════════════════════════════════════════════════

                    COMPETITIVE ANALYSIS

═══════════════════════════════════════════════════════════════════════════════

[Insert Competitive Positioning from Section 7]

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Key Personnel Dossiers
Appendix B: Technical Deep Dive
Appendix C: Source Documentation
Appendix D: Full Vulnerability Inventory
Appendix E: Methodology

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Campaign Planner: AI Entity
Phases Completed: 8/8
Agents Engaged: Vector, Probe, Resolver, Proxy, Echo, Shadow, Dossier

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 8 OUTPUT

```markdown
## AI ENTITY OSINT CAMPAIGN COMPLETE

### Entity Summary
- Entity: [name]
- Type: [type]
- Overall Risk: [H/M/L]

### Key Findings
1. [Most significant finding]
2. [Second finding]
3. [Third finding]

### Technical Assessment
- Capabilities: [summary]
- Vulnerabilities: [count identified]
- Competitive position: [leader/challenger/follower]

### Risk Profile
| Category | Level |
|----------|-------|
| Nation-state | [H/M/L] |
| Competitive | [H/M/L] |
| Insider | [H/M/L] |
| Supply chain | [H/M/L] |
| Regulatory | [H/M/L] |

### Collection Status
- PIRs answered: [X/Y]
- Collection gaps: [count]
- Confidence level: [H/M/L overall]

### Recommended Actions
1. [Priority action 1]
2. [Priority action 2]
3. [Priority action 3]

### Monitoring Plan
- Update frequency: [cadence]
- Key alerts: [list]
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] All phase findings integrated
- [ ] Entity profile produced
- [ ] Technical assessment complete
- [ ] Organizational map created
- [ ] Collection gaps identified
- [ ] Monitoring plan developed
- [ ] Competitive positioning analyzed
- [ ] Final campaign plan compiled

---

## MENU OPTIONS

**[E] Export** - Export full campaign plan
**[P] Profile** - Export entity profile only
**[T] Technical** - Export technical assessment
**[M] Monitor** - Export monitoring plan

---

## WORKFLOW COMPLETE

Campaign Planner: AI Entity workflow complete.

Recommended follow-on:
- Implement monitoring plan
- Schedule quarterly reassessment
- Consider **Threat Constellation** if threats identified
- Consider **Counter-Intel Audit** for defensive assessment
- Consider **Pattern of Life** for key personnel behavioral analysis
