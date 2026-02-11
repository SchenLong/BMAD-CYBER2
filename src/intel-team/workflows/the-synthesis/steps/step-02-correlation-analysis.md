---
name: 'step-02-correlation-analysis'
description: 'Cross-reference findings, identify corroborating evidence, weight by reliability, build evidence chains'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/the-synthesis'
thisStepFile: '{workflow_path}/steps/step-02-correlation-analysis.md'
nextStepFile: '{workflow_path}/steps/step-03-confidence-assessment.md'
prevStepFile: '{workflow_path}/steps/step-01-input-cataloging.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 2: Correlation Analysis

## STEP GOAL

Cross-reference all findings across sources, identify corroborating evidence, weight findings by source reliability, and build evidence chains linking related information.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You correlate findings across intelligence disciplines
- You build evidence chains for key assessments
- You resolve conflicts with specialist agent consultation

### Analysis Protocol

- Cross-reference all findings
- Identify corroborating evidence
- Apply reliability weights
- Build evidence chains
- Resolve identified conflicts

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Finding Extraction

Extract all findings from sources:

```
FINDING EXTRACTION
==================

Key Findings Inventory:
| Finding ID | Finding | Source(s) | Category | Weight |
|------------|---------|-----------|----------|--------|
| FND-001 | [finding statement] | [source IDs] | [topic] | [calculated] |
| FND-002 | [finding] | [sources] | [category] | [weight] |
| FND-003 | [finding] | [sources] | [category] | [weight] |
| FND-004 | [finding] | [sources] | [category] | [weight] |
| FND-005 | [finding] | [sources] | [category] | [weight] |
| ... | ... | ... | ... | ... |

Findings by Category:
| Category | Count | Key Findings |
|----------|-------|--------------|
| Identity | [count] | [FND-XXX, ...] |
| Infrastructure | [count] | [findings] |
| Relationships | [count] | [findings] |
| Activities | [count] | [findings] |
| Vulnerabilities | [count] | [findings] |
| Threats | [count] | [findings] |
| [Other] | [count] | [findings] |

Finding Weight Calculation:
| Finding ID | Source Weights | Combined Weight | Normalized |
|------------|----------------|-----------------|------------|
| FND-001 | [0.8, 0.6] | [calculated] | [0-1] |
| FND-002 | [weights] | [combined] | [normalized] |

□ Findings extracted: [count]
□ Categories covered: [count]
□ Weights calculated: [Y/N]
```

### 2. Cross-Reference Matrix

Build cross-reference matrix:

```
CROSS-REFERENCE MATRIX
======================

Finding Correlation:
| Finding A | Finding B | Relationship | Strength | Evidence |
|-----------|-----------|--------------|----------|----------|
| FND-001 | FND-003 | [supports/contradicts/extends] | [S/M/W] | [explanation] |
| FND-001 | FND-007 | [relationship] | [strength] | [evidence] |
| FND-002 | FND-005 | [relationship] | [strength] | [evidence] |

Relationship Types:
| Type | Definition | Impact |
|------|------------|--------|
| Supports | Finding A corroborates Finding B | Increases confidence |
| Extends | Finding A adds detail to Finding B | Enriches understanding |
| Contradicts | Finding A conflicts with Finding B | Requires resolution |
| Independent | No relationship | Separate analysis |

Corroboration Clusters:
| Cluster ID | Core Finding | Supporting Findings | Combined Confidence |
|------------|--------------|---------------------|---------------------|
| CLU-001 | FND-001 | [FND-003, FND-007] | [H/M/L] |
| CLU-002 | [core] | [supporters] | [confidence] |
| CLU-003 | [core] | [supporters] | [confidence] |

Cross-INT Validation:
| Finding | OSINT | SOCMINT | TECHINT | CORPINT | DARKINT | Other |
|---------|-------|---------|---------|---------|---------|-------|
| FND-001 | [✓/✗] | [✓/✗] | [✓/✗] | [✓/✗] | [✓/✗] | [✓/✗] |
| FND-002 | | | | | | |
| FND-003 | | | | | | |

□ Correlations mapped: [count]
□ Clusters identified: [count]
□ Cross-INT validation: [complete]
```

### 3. Evidence Chain Construction

Build evidence chains:

```
EVIDENCE CHAIN CONSTRUCTION
===========================

Primary Evidence Chains:

**Chain 1: [Key Assessment]**
```

[Base Finding]
    ↓ [relationship/evidence]
[Supporting Finding 1]
    ↓ [relationship]
[Supporting Finding 2]
    ↓ [relationship]
[Conclusion]

Sources: [source IDs]
Confidence: [H/M/L]
Gaps: [if any]

```

**Chain 2: [Key Assessment]**
```

[Base Finding]
    ↓ [evidence]
    ├── [Branch A]
    │       ↓
    │   [Finding]
    └── [Branch B]
            ↓
        [Finding]
            ↓
[Conclusion]

Sources: [source IDs]
Confidence: [H/M/L]

```

**Chain 3: [Key Assessment]**
[Same format]

Evidence Chain Summary:
| Chain | Core Finding | Links | Sources | Confidence |
|-------|--------------|-------|---------|------------|
| Chain 1 | [finding] | [count] | [count] | [H/M/L] |
| Chain 2 | [finding] | [count] | [count] | [confidence] |
| Chain 3 | [finding] | [count] | [count] | [confidence] |

Weak Links Identified:
| Chain | Weak Link | Issue | Mitigation |
|-------|-----------|-------|------------|
| [chain] | [finding-to-finding] | [why weak] | [how to address] |

□ Evidence chains: [count built]
□ Weak links: [count identified]
□ Strong chains: [count]
```

### 4. Conflict Resolution

Resolve identified conflicts:

```
CONFLICT RESOLUTION
===================

Conflict Resolution Process:
| Conflict ID | Sources | Finding A | Finding B | Resolution |
|-------------|---------|-----------|-----------|------------|
| CON-001 | [A vs B] | [finding] | [finding] | [resolution] |
| CON-002 | [sources] | [finding] | [finding] | [resolution] |
| CON-003 | [sources] | [finding] | [finding] | [resolution] |

Resolution Methods Applied:
| Method | Description | When Used |
|--------|-------------|-----------|
| Weight by reliability | Accept higher reliability source | Different source quality |
| Consult specialist | Request agent expertise | Technical disagreement |
| Accept both | Note as alternative hypotheses | Both plausible |
| Seek additional | Task new collection | Cannot resolve |
| Temporal resolution | Both true at different times | Timing difference |

Agent Consultations:
| Conflict | Agent Consulted | Input Received | Resolution |
|----------|-----------------|----------------|------------|
| CON-001 | [Probe/Echo/etc] | [their assessment] | [final decision] |
| CON-002 | [agent] | [input] | [resolution] |

Unresolved Conflicts:
| Conflict ID | Issue | Impact | Noted As |
|-------------|-------|--------|----------|
| [conflict] | [why unresolved] | [on assessment] | [alternative hypothesis] |

Resolved Findings:
| Original Conflict | Resolved Finding | Confidence | Method |
|-------------------|------------------|------------|--------|
| CON-001 | [final finding] | [H/M/L] | [how resolved] |
| CON-002 | [final finding] | [confidence] | [method] |

□ Conflicts resolved: [count]
□ Unresolved: [count]
□ Agent consultations: [count]
```

### 5. Weighted Finding Synthesis

Synthesize weighted findings:

```
WEIGHTED FINDING SYNTHESIS
==========================

Final Finding Weights:
| Finding ID | Base Weight | Corroboration Boost | Conflict Penalty | Final Weight |
|------------|-------------|---------------------|------------------|--------------|
| FND-001 | [0.X] | [+0.X] | [-0.X] | [final] |
| FND-002 | [weight] | [boost] | [penalty] | [final] |
| FND-003 | [weight] | [boost] | [penalty] | [final] |

Weight Adjustment Factors:
| Factor | Adjustment | Applied To |
|--------|------------|------------|
| Cross-INT corroboration | +0.2 | [findings] |
| Multiple independent sources | +0.15 | [findings] |
| Recent information | +0.1 | [findings] |
| Single source | -0.1 | [findings] |
| Unresolved conflict | -0.2 | [findings] |
| Dated information | -0.1 | [findings] |

Tier 1 Findings (Weight > 0.8):
| Finding ID | Finding | Final Weight | Evidence Chain |
|------------|---------|--------------|----------------|
| [FND-XXX] | [finding] | [weight] | [chain ref] |

Tier 2 Findings (Weight 0.5-0.8):
| Finding ID | Finding | Final Weight | Limiting Factor |
|------------|---------|--------------|-----------------|
| [FND-XXX] | [finding] | [weight] | [what limits confidence] |

Tier 3 Findings (Weight < 0.5):
| Finding ID | Finding | Final Weight | Concern |
|------------|---------|--------------|---------|
| [FND-XXX] | [finding] | [weight] | [why low weight] |

□ Findings weighted: [count]
□ Tier 1 (high confidence): [count]
□ Tier 2 (moderate): [count]
□ Tier 3 (low): [count]
```

### 6. Gap Impact Assessment

Assess impact of collection gaps:

```
GAP IMPACT ASSESSMENT
=====================

Gap Analysis:
| Gap ID | Missing Information | Impact on Findings | Impact on Assessment |
|--------|---------------------|-------------------|---------------------|
| GAP-001 | [what's missing] | [which findings affected] | [H/M/L] |
| GAP-002 | [missing] | [affected] | [impact] |
| GAP-003 | [missing] | [affected] | [impact] |

Findings Affected by Gaps:
| Finding ID | Gap(s) | Current Weight | Potential Weight | Upgrade Needed |
|------------|--------|----------------|------------------|----------------|
| [FND-XXX] | [GAP-XXX] | [current] | [if gap closed] | [collection] |

Critical Gaps:
| Gap | Impact | Collection Recommendation | Priority |
|-----|--------|--------------------------|----------|
| [gap] | [high impact] | [specific action] | [1-3] |

Gap-Driven Caveats:
| Finding | Caveat Statement | Due To |
|---------|------------------|--------|
| [finding] | "Assessment limited by..." | [gap] |

□ Gap impact assessed: [Y/N]
□ Critical gaps: [count]
□ Caveats generated: [count]
```

### 7. Correlation Analysis Summary

Compile correlation findings:

```
CORRELATION ANALYSIS SUMMARY
============================

Analysis Overview:
| Metric | Value |
|--------|-------|
| Total findings | [count] |
| Corroborated findings | [count] |
| Evidence chains built | [count] |
| Conflicts resolved | [count] |
| Unresolved conflicts | [count] |

Finding Distribution:
| Tier | Count | Confidence Level |
|------|-------|------------------|
| Tier 1 | [count] | High (>0.8) |
| Tier 2 | [count] | Moderate (0.5-0.8) |
| Tier 3 | [count] | Low (<0.5) |

Key Corroborations:
| Finding | Sources | INTs | Confidence |
|---------|---------|------|------------|
| [top finding 1] | [count] | [count] | [H/M/L] |
| [top finding 2] | [count] | [count] | [confidence] |
| [top finding 3] | [count] | [count] | [confidence] |

Remaining Issues:
| Issue | Count | Impact |
|-------|-------|--------|
| Unresolved conflicts | [count] | [will note as alternatives] |
| Critical gaps | [count] | [will caveat findings] |
| Low-weight findings | [count] | [will note uncertainty] |

PROCEED TO STEP 3:
- Findings for confidence assessment: [count]
- Evidence chains: [count]
- Caveats required: [count]
```

---

## STEP 2 OUTPUT

```markdown
## CORRELATION ANALYSIS COMPLETE

### Finding Summary
- Total findings: [count]
- Tier 1 (high confidence): [count]
- Tier 2 (moderate): [count]
- Tier 3 (low): [count]

### Corroboration
- Cross-referenced: [count]
- Evidence chains: [count]
- Cross-INT validated: [count]

### Conflict Resolution
- Resolved: [count]
- Unresolved: [count]
- Agent consultations: [count]

### Key Evidence Chains
1. [Chain 1 summary]
2. [Chain 2 summary]
3. [Chain 3 summary]

### Gaps & Caveats
- Critical gaps: [count]
- Caveats required: [count]

### Next Step
Step 3: Confidence Assessment
Focus: [apply framework, document basis, note dissent]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:

- [ ] All findings extracted
- [ ] Cross-references mapped
- [ ] Evidence chains built
- [ ] Conflicts resolved (or noted)
- [ ] Weights calculated
- [ ] Gap impacts assessed

---

## MENU OPTIONS

**[C] Continue** - Proceed to confidence assessment (Step 3)
**[E] Evidence** - Extend evidence chains
**[R] Resolve** - Additional conflict resolution
**[G] Gaps** - Task additional collection

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-confidence-assessment.md`
