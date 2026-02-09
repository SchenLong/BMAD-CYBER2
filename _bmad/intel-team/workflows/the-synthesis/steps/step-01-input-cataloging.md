---
name: 'step-01-input-cataloging'
description: 'Inventory all sources, assess source reliability, identify overlaps, flag conflicts'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/the-synthesis'
thisStepFile: '{workflow_path}/steps/step-01-input-cataloging.md'
nextStepFile: '{workflow_path}/steps/step-02-correlation-analysis.md'
prevStepFile: null

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Input Cataloging

## STEP GOAL

Inventory all intelligence inputs, assess source reliability, identify areas of overlap between sources, and flag conflicts requiring resolution.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You orchestrate all-source intelligence fusion
- You catalog and assess source reliability
- You identify conflicts and gaps for resolution

### Analysis Protocol
- Inventory all input sources
- Assess reliability of each source
- Identify overlapping coverage
- Flag conflicting assessments
- Note collection gaps

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Source Inventory

Catalog all intelligence inputs:

```
SOURCE INVENTORY
================

Input Sources:
| Source ID | Source Type | Origin | Date | Classification |
|-----------|-------------|--------|------|----------------|
| SRC-001 | [workflow/report/raw] | [which workflow/agent] | [date] | [level] |
| SRC-002 | [type] | [origin] | [date] | [classification] |
| SRC-003 | [type] | [origin] | [date] | [classification] |
| SRC-004 | [type] | [origin] | [date] | [classification] |
| SRC-005 | [type] | [origin] | [date] | [classification] |

Source Categories:
| Category | Count | Sources |
|----------|-------|---------|
| OSINT | [count] | [source IDs] |
| SOCMINT | [count] | [source IDs] |
| TECHINT | [count] | [source IDs] |
| CORPINT/FININT | [count] | [source IDs] |
| DARKINT | [count] | [source IDs] |
| GEOINT | [count] | [source IDs] |
| HUMINT | [count] | [source IDs] |
| SIGINT | [count] | [source IDs] |
| External | [count] | [source IDs] |

Source Age Analysis:
| Age | Count | Consideration |
|-----|-------|---------------|
| < 24 hours | [count] | Current |
| 1-7 days | [count] | Recent |
| 7-30 days | [count] | May need update |
| > 30 days | [count] | Verify currency |

□ Sources cataloged: [total count]
□ Categories represented: [count]
□ Date range: [oldest] to [newest]
```

### 2. Source Reliability Assessment

Assess reliability of each source:

```
SOURCE RELIABILITY ASSESSMENT
=============================

Reliability Rating Scale:
| Rating | Label | Definition |
|--------|-------|------------|
| A | Completely reliable | Proven track record, verified methodology |
| B | Usually reliable | Generally accurate, minor issues |
| C | Fairly reliable | Some accuracy concerns, useful with caution |
| D | Not usually reliable | Significant accuracy issues |
| E | Unreliable | Known to be inaccurate or biased |
| F | Unknown reliability | New source, cannot assess |

Individual Source Assessment:
| Source ID | Reliability | Information Quality | Weight | Notes |
|-----------|-------------|---------------------|--------|-------|
| SRC-001 | [A-F] | [1-5] | [calculated] | [assessment notes] |
| SRC-002 | [rating] | [quality] | [weight] | [notes] |
| SRC-003 | [rating] | [quality] | [weight] | [notes] |
| SRC-004 | [rating] | [quality] | [weight] | [notes] |
| SRC-005 | [rating] | [quality] | [weight] | [notes] |

Information Quality Scale:
| Rating | Definition |
|--------|------------|
| 1 | Confirmed | Verified by independent means |
| 2 | Probably true | Logical, consistent, partial corroboration |
| 3 | Possibly true | Reasonably logical, not confirmed |
| 4 | Doubtfully true | Questionable logic or consistency |
| 5 | Improbable | Illogical, contradicted by other info |
| 6 | Cannot be judged | No basis for evaluation |

Weight Calculation:
| Reliability × Info Quality | Weight Factor |
|---------------------------|---------------|
| A1, A2, B1 | 1.0 (Highest) |
| A3, B2, C1 | 0.8 |
| A4, B3, C2, D1 | 0.6 |
| B4, C3, D2, E1 | 0.4 |
| C4, D3, E2 | 0.2 |
| D4, E3, E4, F* | 0.1 (Lowest) |

Source Reliability Summary:
| Reliability Level | Count | Percentage |
|-------------------|-------|------------|
| High (A-B) | [count] | [%] |
| Medium (C) | [count] | [%] |
| Low (D-E) | [count] | [%] |
| Unknown (F) | [count] | [%] |

□ All sources rated: [Y/N]
□ High reliability sources: [count]
□ Concerns identified: [count]
```

### 3. Content Mapping

Map content areas covered by sources:

```
CONTENT MAPPING
===============

Key Intelligence Topics:
| Topic | Sources Covering | Depth | Conflicts |
|-------|------------------|-------|-----------|
| [topic 1] | [source IDs] | [H/M/L] | [Y/N] |
| [topic 2] | [source IDs] | [depth] | [conflicts] |
| [topic 3] | [source IDs] | [depth] | [conflicts] |
| [topic 4] | [source IDs] | [depth] | [conflicts] |
| [topic 5] | [source IDs] | [depth] | [conflicts] |

Coverage by INT Discipline:
| Discipline | Topics Covered | Primary Sources |
|------------|----------------|-----------------|
| OSINT | [topics] | [sources] |
| SOCMINT | [topics] | [sources] |
| TECHINT | [topics] | [sources] |
| CORPINT | [topics] | [sources] |
| DARKINT | [topics] | [sources] |
| GEOINT | [topics] | [sources] |
| HUMINT | [topics] | [sources] |
| SIGINT | [topics] | [sources] |

Key Findings by Source:
| Source ID | Key Finding 1 | Key Finding 2 | Key Finding 3 |
|-----------|---------------|---------------|---------------|
| SRC-001 | [finding] | [finding] | [finding] |
| SRC-002 | [finding] | [finding] | [finding] |
| SRC-003 | [finding] | [finding] | [finding] |

□ Topics mapped: [count]
□ Coverage assessed: [Y/N]
□ Key findings extracted: [count]
```

### 4. Overlap Identification

Identify areas of overlap:

```
OVERLAP IDENTIFICATION
======================

Corroborating Sources:
| Finding | Sources Agreeing | Confidence Boost |
|---------|------------------|------------------|
| [finding 1] | [source IDs] | [+X%] |
| [finding 2] | [source IDs] | [boost] |
| [finding 3] | [source IDs] | [boost] |
| [finding 4] | [source IDs] | [boost] |

Cross-INT Corroboration:
| Finding | INT Disciplines | Sources | Strength |
|---------|-----------------|---------|----------|
| [finding] | [OSINT, SOCMINT, etc] | [count] | [strong/moderate/weak] |

Overlap Matrix:
| Source | SRC-001 | SRC-002 | SRC-003 | SRC-004 | SRC-005 |
|--------|---------|---------|---------|---------|---------|
| SRC-001 | - | [overlap %] | [%] | [%] | [%] |
| SRC-002 | [%] | - | [%] | [%] | [%] |
| SRC-003 | [%] | [%] | - | [%] | [%] |
| SRC-004 | [%] | [%] | [%] | - | [%] |
| SRC-005 | [%] | [%] | [%] | [%] | - |

Independent Verification:
| Finding | Independently Verified | Method |
|---------|----------------------|--------|
| [finding] | [Y/N] | [how verified] |

□ Overlaps identified: [count]
□ Strong corroboration: [count findings]
□ Cross-INT validation: [count]
```

### 5. Conflict Identification

Flag conflicting assessments:

```
CONFLICT IDENTIFICATION
=======================

Identified Conflicts:
| Conflict ID | Topic | Source A | Source A Finding | Source B | Source B Finding |
|-------------|-------|----------|------------------|----------|------------------|
| CON-001 | [topic] | [source] | [their finding] | [source] | [their finding] |
| CON-002 | [topic] | [source] | [finding] | [source] | [finding] |
| CON-003 | [topic] | [source] | [finding] | [source] | [finding] |

Conflict Analysis:
| Conflict ID | Severity | Type | Resolution Approach |
|-------------|----------|------|---------------------|
| CON-001 | [H/M/L] | [factual/interpretation/timing] | [consult agent/weight/note] |
| CON-002 | [severity] | [type] | [approach] |
| CON-003 | [severity] | [type] | [approach] |

Conflict Types:
| Type | Description | Resolution Method |
|------|-------------|-------------------|
| Factual | Different facts reported | Verify with additional source |
| Interpretation | Same facts, different meaning | Consult specialist agent |
| Timing | Different time references | Clarify timeline |
| Scope | Different scope definitions | Align definitions |
| Methodology | Different collection methods | Weight by reliability |

Agents to Consult:
| Conflict ID | Agent | Reason |
|-------------|-------|--------|
| [conflict] | [agent] | [expertise needed] |

□ Conflicts identified: [count]
□ High severity: [count]
□ Resolution planned: [Y/N]
```

### 6. Gap Analysis

Identify collection gaps:

```
GAP ANALYSIS
============

Coverage Gaps:
| Gap ID | Topic Area | Why Missing | Impact | Priority |
|--------|------------|-------------|--------|----------|
| GAP-001 | [topic] | [reason] | [H/M/L] | [H/M/L] |
| GAP-002 | [topic] | [reason] | [impact] | [priority] |
| GAP-003 | [topic] | [reason] | [impact] | [priority] |

INT Discipline Gaps:
| Discipline | Coverage | Gap Areas |
|------------|----------|-----------|
| OSINT | [%] | [missing topics] |
| SOCMINT | [%] | [gaps] |
| TECHINT | [%] | [gaps] |
| CORPINT | [%] | [gaps] |
| DARKINT | [%] | [gaps] |
| GEOINT | [%] | [gaps] |
| HUMINT | [%] | [gaps] |
| SIGINT | [%] | [gaps] |

Critical Gaps:
| Gap | Impact on Assessment | Collection Recommendation |
|-----|---------------------|--------------------------|
| [gap 1] | [how it affects product] | [workflow/agent to task] |
| [gap 2] | [impact] | [recommendation] |

Gap Closure Recommendations:
| Priority | Gap | Recommended Action | Agent/Workflow |
|----------|-----|-------------------|----------------|
| 1 | [gap] | [action] | [who] |
| 2 | [gap] | [action] | [who] |
| 3 | [gap] | [action] | [who] |

□ Gaps identified: [count]
□ Critical gaps: [count]
□ Recommendations: [count]
```

### 7. Input Cataloging Summary

Compile cataloging findings:

```
INPUT CATALOGING SUMMARY
========================

Source Overview:
| Metric | Value |
|--------|-------|
| Total sources | [count] |
| High reliability | [count] |
| INT disciplines | [count] |
| Topics covered | [count] |
| Date range | [span] |

Reliability Profile:
| Level | Count | Weight Contribution |
|-------|-------|---------------------|
| A-B | [count] | [%] |
| C | [count] | [%] |
| D-F | [count] | [%] |

Correlation Status:
| Status | Count |
|--------|-------|
| Corroborated findings | [count] |
| Single-source findings | [count] |
| Conflicting findings | [count] |

Issues for Resolution:
| Issue Type | Count | Priority |
|------------|-------|----------|
| Conflicts | [count] | [H/M/L] |
| Gaps | [count] | [priority] |
| Low reliability | [count] | [priority] |

PROCEED TO STEP 2:
- Total findings to correlate: [count]
- Conflicts to resolve: [count]
- Gaps to note: [count]
- Weighted sources: [ready]
```

---

## STEP 1 OUTPUT

```markdown
## INPUT CATALOGING COMPLETE

### Source Summary
- Total sources: [count]
- INT disciplines: [count]
- Date range: [span]

### Reliability Profile
- High (A-B): [count] ([%])
- Medium (C): [count] ([%])
- Low/Unknown (D-F): [count] ([%])

### Coverage
- Topics covered: [count]
- Corroborated findings: [count]
- Single-source findings: [count]

### Issues Identified
- Conflicts: [count]
- Gaps: [count]
- Reliability concerns: [count]

### Next Step
Step 2: Correlation Analysis
Focus: [cross-reference findings, build evidence chains]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] All sources inventoried
- [ ] Reliability assessed
- [ ] Content mapped
- [ ] Overlaps identified
- [ ] Conflicts flagged
- [ ] Gaps documented

---

## MENU OPTIONS

**[C] Continue** - Proceed to correlation analysis (Step 2)
**[S] Sources** - Add more sources
**[R] Reliability** - Reassess source reliability
**[G] Gaps** - Extended gap analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-correlation-analysis.md`

