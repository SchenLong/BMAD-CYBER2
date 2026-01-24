---
name: 'step-03-confidence-assessment'
description: 'Apply confidence framework, document evidence basis, note dissenting analysis, qualify uncertainties'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/the-synthesis'
thisStepFile: '{workflow_path}/steps/step-03-confidence-assessment.md'
nextStepFile: '{workflow_path}/steps/step-04-product-assembly.md'
prevStepFile: '{workflow_path}/steps/step-02-correlation-analysis.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 3: Confidence Assessment

## STEP GOAL

Apply the confidence framework to all key findings, document the evidence basis for each assessment, note any dissenting analysis or alternative interpretations, and qualify all uncertainties.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You apply rigorous confidence standards to all assessments
- You document evidence basis transparently
- You ensure intellectual honesty by noting dissent and uncertainty

### Assessment Protocol
- Apply confidence framework consistently
- Document evidence for each finding
- Record dissenting views
- Qualify all uncertainties
- Prepare caveats for product

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Confidence Framework Application

Apply standardized confidence levels:

```
CONFIDENCE FRAMEWORK APPLICATION
================================

Confidence Level Definitions:
| Level | Label | Definition | Criteria |
|-------|-------|------------|----------|
| 1 | Low | Single source, unverified | One INT, no corroboration, or unreliable source |
| 2 | Moderate | Multiple sources, some conflict | 2-3 sources, minor discrepancies possible |
| 3 | High | Multiple independent sources agree | 3+ sources, cross-INT corroboration |
| 4 | Very High | Overwhelming corroboration | All sources align, high reliability, direct evidence |

Probability Language:
| Confidence | Language | Probability Range |
|------------|----------|-------------------|
| Very High | "Almost certainly," "We are confident" | >90% |
| High | "Likely," "Probably" | 70-90% |
| Moderate | "Possibly," "May" | 40-70% |
| Low | "Could," "Might" | 20-40% |
| Very Low | "Remote possibility," "Unlikely" | <20% |

Finding Confidence Assignment:
| Finding ID | Finding Summary | Evidence | Confidence | Language |
|------------|-----------------|----------|------------|----------|
| FND-001 | [brief] | [sources, chain] | [1-4] | [word choice] |
| FND-002 | [summary] | [evidence] | [level] | [language] |
| FND-003 | [summary] | [evidence] | [level] | [language] |
| FND-004 | [summary] | [evidence] | [level] | [language] |
| FND-005 | [summary] | [evidence] | [level] | [language] |

Confidence Distribution:
| Confidence Level | Count | Percentage |
|------------------|-------|------------|
| Very High (4) | [count] | [%] |
| High (3) | [count] | [%] |
| Moderate (2) | [count] | [%] |
| Low (1) | [count] | [%] |

□ All findings assessed: [Y/N]
□ Language calibrated: [Y/N]
□ Distribution reviewed: [Y/N]
```

### 2. Evidence Documentation

Document evidence basis for each key finding:

```
EVIDENCE DOCUMENTATION
======================

Key Finding Evidence Basis:

**Finding: [FND-001 Statement]**
| Element | Details |
|---------|---------|
| Confidence | [Level X: Label] |
| Primary Evidence | [source(s), what they say] |
| Corroboration | [supporting sources] |
| Evidence Chain | [brief chain description] |
| Limitations | [gaps, caveats] |

**Finding: [FND-002 Statement]**
| Element | Details |
|---------|---------|
| Confidence | [Level] |
| Primary Evidence | [sources] |
| Corroboration | [support] |
| Evidence Chain | [description] |
| Limitations | [caveats] |

**Finding: [FND-003 Statement]**
[Same format]

Evidence Quality Summary:
| Finding | Source Count | INT Disciplines | Reliability Range | Chain Strength |
|---------|--------------|-----------------|-------------------|----------------|
| FND-001 | [count] | [count] | [A-F range] | [strong/moderate/weak] |
| FND-002 | [count] | [count] | [range] | [strength] |
| FND-003 | [count] | [count] | [range] | [strength] |

Evidence Gaps by Finding:
| Finding | Missing Evidence | Impact | Noted In |
|---------|------------------|--------|----------|
| [finding] | [what's missing] | [on confidence] | [caveat] |

□ Evidence documented: [count findings]
□ Gaps noted: [count]
□ Chains referenced: [Y/N]
```

### 3. Dissenting Analysis

Document alternative interpretations:

```
DISSENTING ANALYSIS
===================

Alternative Hypotheses:
| Finding | Majority View | Alternative View | Source | Validity |
|---------|---------------|------------------|--------|----------|
| [finding] | [mainstream interpretation] | [alternative] | [who suggests] | [H/M/L] |
| [finding] | [majority] | [dissent] | [source] | [validity] |

Unresolved Disagreements:
| Topic | Position A | Position B | Why Unresolved | How Noted |
|-------|------------|------------|----------------|-----------|
| [topic] | [view] | [view] | [reason] | [in product] |

Minority Views Worth Noting:
| View | Held By | Rationale | Probability |
|------|---------|-----------|-------------|
| [alternative view] | [source/agent] | [why plausible] | [%] |

Dissent Documentation:
| Finding | Dissent Type | Source | Treatment in Product |
|---------|--------------|--------|---------------------|
| [finding] | [interpretation/factual] | [who] | ["Some analysts believe..."] |

Red Lines:
| Position | Why Rejected | Evidence Against |
|----------|--------------|------------------|
| [rejected hypothesis] | [reason] | [contradicting evidence] |

□ Alternatives considered: [count]
□ Dissent documented: [count]
□ Red lines noted: [count]
```

### 4. Uncertainty Qualification

Qualify all uncertainties:

```
UNCERTAINTY QUALIFICATION
=========================

Types of Uncertainty:
| Type | Definition | Example |
|------|------------|---------|
| Evidentiary | Insufficient data | "Limited sources available" |
| Analytical | Multiple interpretations | "Could indicate X or Y" |
| Temporal | Time-sensitive information | "Valid as of [date]" |
| Source | Reliability concerns | "Source reliability unknown" |
| Methodological | Collection limitations | "Unable to verify directly" |

Finding-Level Uncertainties:
| Finding | Uncertainty Type | Description | Impact |
|---------|------------------|-------------|--------|
| FND-001 | [type] | [specific uncertainty] | [on confidence] |
| FND-002 | [type] | [description] | [impact] |
| FND-003 | [type] | [description] | [impact] |

Assessment-Level Uncertainties:
| Uncertainty | Affects | Magnitude | Caveat Language |
|-------------|---------|-----------|-----------------|
| [uncertainty 1] | [which findings] | [H/M/L] | "This assessment is limited by..." |
| [uncertainty 2] | [findings] | [magnitude] | [language] |

Information Currency:
| Finding | Information Date | Currency Assessment | Update Needed |
|---------|------------------|---------------------|---------------|
| [finding] | [date] | [current/dated] | [Y/N] |

Caveat Statements:
| Caveat | Reason | Applies To |
|--------|--------|------------|
| [caveat 1] | [why needed] | [findings] |
| [caveat 2] | [reason] | [findings] |
| [caveat 3] | [reason] | [findings] |

□ Uncertainties cataloged: [count]
□ Caveats drafted: [count]
□ Currency assessed: [Y/N]
```

### 5. Analytic Standards Review

Ensure analytic standards met:

```
ANALYTIC STANDARDS REVIEW
=========================

Standards Checklist:
| Standard | Met | Evidence |
|----------|-----|----------|
| Sources properly evaluated | [Y/N] | [where documented] |
| Confidence levels appropriate | [Y/N] | [framework applied] |
| Evidence basis documented | [Y/N] | [in Step 2] |
| Alternatives considered | [Y/N] | [dissent section] |
| Uncertainties noted | [Y/N] | [caveats] |
| Language calibrated | [Y/N] | [probability words] |
| Gaps acknowledged | [Y/N] | [gap analysis] |
| Bias checked | [Y/N] | [review] |

Potential Biases Reviewed:
| Bias Type | Check | Finding |
|-----------|-------|---------|
| Confirmation bias | [searched for contradicting evidence] | [OK/Concern] |
| Anchoring | [considered multiple starting points] | [status] |
| Availability | [not over-weighting recent/prominent] | [status] |
| Groupthink | [dissent encouraged] | [status] |

Quality Assurance:
| Check | Performed | Issues |
|-------|-----------|--------|
| Confidence calibration | [Y/N] | [any issues] |
| Evidence-conclusion alignment | [Y/N] | [issues] |
| Alternative hypothesis testing | [Y/N] | [issues] |
| Source independence verification | [Y/N] | [issues] |

Corrections Made:
| Issue Found | Correction | Affected |
|-------------|------------|----------|
| [issue] | [what changed] | [findings] |

□ Standards reviewed: [Y/N]
□ Biases checked: [Y/N]
□ QA complete: [Y/N]
```

### 6. Confidence Assessment Summary

Compile confidence findings:

```
CONFIDENCE ASSESSMENT SUMMARY
=============================

Overall Assessment Confidence:
| Metric | Value |
|--------|-------|
| Average confidence level | [X.X / 4] |
| Very high confidence findings | [count] |
| High confidence findings | [count] |
| Moderate confidence findings | [count] |
| Low confidence findings | [count] |

Key Findings by Confidence:

VERY HIGH CONFIDENCE:
| Finding | Evidence Summary |
|---------|------------------|
| [finding 1] | [brief evidence] |

HIGH CONFIDENCE:
| Finding | Evidence Summary |
|---------|------------------|
| [finding 1] | [evidence] |
| [finding 2] | [evidence] |

MODERATE CONFIDENCE:
| Finding | Limiting Factor |
|---------|-----------------|
| [finding] | [what limits confidence] |

LOW CONFIDENCE:
| Finding | Why Low | Still Included Because |
|---------|---------|------------------------|
| [finding] | [reason] | [value despite uncertainty] |

Dissent Summary:
| Topic | Alternative View | Noted As |
|-------|------------------|----------|
| [topic] | [view] | [how documented] |

Caveat Summary:
| Caveat | Applies To |
|--------|------------|
| [caveat 1] | [scope] |
| [caveat 2] | [scope] |

PROCEED TO STEP 4:
- Findings with confidence assigned: [count]
- Caveats to include: [count]
- Dissent to note: [count]
```

---

## STEP 3 OUTPUT

```markdown
## CONFIDENCE ASSESSMENT COMPLETE

### Confidence Distribution
- Very High: [count] findings
- High: [count] findings
- Moderate: [count] findings
- Low: [count] findings

### Evidence Quality
- Well-supported findings: [count]
- Limited evidence findings: [count]
- Cross-INT corroborated: [count]

### Dissenting Views
- Alternative hypotheses: [count]
- Minority views noted: [count]

### Uncertainties
- Key uncertainties: [count]
- Caveats required: [count]
- Dated information: [count items]

### Standards Compliance
- All standards met: [Y/N]
- Issues corrected: [count]

### Next Step
Step 4: Product Assembly
Focus: [executive summary, findings, recommendations]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Confidence levels assigned
- [ ] Evidence documented
- [ ] Dissent noted
- [ ] Uncertainties qualified
- [ ] Standards reviewed
- [ ] Caveats drafted

---

## MENU OPTIONS

**[C] Continue** - Proceed to product assembly (Step 4)
**[R] Review** - Reassess specific findings
**[D] Dissent** - Add alternative views
**[U] Uncertainty** - Additional uncertainty analysis

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-04-product-assembly.md`

