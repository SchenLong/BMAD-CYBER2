---
name: 'step-04-product-assembly'
description: 'Executive summary, key findings, supporting evidence, confidence statements, gaps, recommendations'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/the-synthesis'
thisStepFile: '{workflow_path}/steps/step-04-product-assembly.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-03-confidence-assessment.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 4: Product Assembly

## STEP GOAL

Assemble the final All-Source Intelligence Assessment including executive summary, key findings with confidence statements, supporting evidence, collection gaps, and actionable recommendations.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You produce formal intelligence products
- You ensure clarity, accuracy, and actionability
- You synthesize complex analysis into consumable assessments

### Assembly Protocol
- Craft executive summary
- Present key findings with confidence
- Document supporting evidence
- Note gaps and caveats
- Provide actionable recommendations

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Executive Summary Drafting

Draft the executive summary:

```
EXECUTIVE SUMMARY DRAFTING
==========================

Bottom Line Up Front (BLUF):
[Single paragraph capturing the most important assessment in 2-3 sentences]

Key Judgments:
| # | Judgment | Confidence |
|---|----------|------------|
| 1 | [most important finding] | [Very High/High/Moderate/Low] |
| 2 | [second finding] | [confidence] |
| 3 | [third finding] | [confidence] |
| 4 | [fourth finding] | [confidence] |

Implications:
| Implication | Significance | Urgency |
|-------------|--------------|---------|
| [what this means] | [H/M/L] | [H/M/L] |
| [implication 2] | [significance] | [urgency] |

Scope Statement:
- This assessment covers: [scope]
- Time period: [dates]
- Sources: [count] from [INT disciplines]
- Confidence range: [low to high confidence]

Major Caveats:
| Caveat | Impact |
|--------|--------|
| [caveat 1] | [how it limits assessment] |
| [caveat 2] | [impact] |

Executive Summary Draft:
```
[TARGET/TOPIC]: All-Source Intelligence Assessment

BOTTOM LINE: [BLUF statement]

KEY JUDGMENTS:
1. [Finding 1] ([Confidence level])
2. [Finding 2] ([Confidence])
3. [Finding 3] ([Confidence])

IMPLICATIONS: [Brief statement of what this means for consumer]

CAVEATS: [Major limitations in 1-2 sentences]

This assessment synthesizes [X] sources across [Y] intelligence
disciplines covering the period [dates].
```

□ BLUF drafted: [Y/N]
□ Key judgments: [count]
□ Caveats noted: [Y/N]
```

### 2. Key Findings Section

Compile key findings with evidence:

```
KEY FINDINGS SECTION
====================

Finding 1: [Statement]
------------------------
Confidence: [Level] - [Label]
Probability Language: "[Language version of finding]"

Evidence Basis:
- [Primary source/evidence 1]
- [Supporting source/evidence 2]
- [Corroborating source/evidence 3]

Evidence Chain: [Brief description of how evidence connects]

Limitations: [What we don't know]

---

Finding 2: [Statement]
------------------------
Confidence: [Level]
Probability Language: "[Language version]"

Evidence Basis:
- [Evidence points]

Evidence Chain: [Description]

Limitations: [Gaps]

---

Finding 3: [Statement]
------------------------
[Same format]

---

Finding 4: [Statement]
------------------------
[Same format]

---

Findings Summary Table:
| # | Finding | Confidence | Key Evidence | Limitation |
|---|---------|------------|--------------|------------|
| 1 | [brief] | [level] | [main source] | [gap] |
| 2 | [brief] | [level] | [source] | [gap] |
| 3 | [brief] | [level] | [source] | [gap] |
| 4 | [brief] | [level] | [source] | [gap] |

□ Findings formatted: [count]
□ Evidence documented: [Y/N]
□ Limitations noted: [Y/N]
```

### 3. Evidence Matrix

Create evidence correlation matrix:

```
EVIDENCE MATRIX
===============

Source-Finding Correlation:
| Source | F1 | F2 | F3 | F4 | F5 | Reliability |
|--------|----|----|----|----|-----|-------------|
| SRC-001 | ✓ | | ✓ | | ✓ | [A-F] |
| SRC-002 | ✓ | ✓ | | | | [rating] |
| SRC-003 | | ✓ | ✓ | ✓ | | [rating] |
| SRC-004 | | | ✓ | ✓ | | [rating] |
| SRC-005 | ✓ | | | ✓ | ✓ | [rating] |

INT Discipline Coverage:
| Discipline | Findings Supported | Key Contribution |
|------------|-------------------|------------------|
| OSINT | [F1, F2, F3] | [what discipline added] |
| SOCMINT | [findings] | [contribution] |
| TECHINT | [findings] | [contribution] |
| CORPINT | [findings] | [contribution] |
| DARKINT | [findings] | [contribution] |
| GEOINT | [findings] | [contribution] |
| HUMINT | [findings] | [contribution] |
| SIGINT | [findings] | [contribution] |

Evidence Independence:
| Finding | Independent Sources | Dependent Sources | Independence Rating |
|---------|---------------------|-------------------|---------------------|
| F1 | [count] | [count] | [H/M/L] |
| F2 | [count] | [count] | [rating] |

□ Matrix complete: [Y/N]
□ Discipline coverage: [documented]
□ Independence assessed: [Y/N]
```

### 4. Alternative Analysis Section

Document alternative views:

```
ALTERNATIVE ANALYSIS SECTION
============================

Alternative Hypotheses Considered:
| Hypothesis | Evidence For | Evidence Against | Assessment |
|------------|--------------|------------------|------------|
| [alt hypothesis 1] | [supporting] | [contradicting] | [rejected/noted] |
| [alt hypothesis 2] | [evidence] | [counter] | [assessment] |

Minority Views:
| View | Source | Rationale | Why Not Adopted |
|------|--------|-----------|-----------------|
| [view] | [who holds] | [their reasoning] | [why majority differs] |

What Would Change Our Assessment:
| Finding | Would Change If | Likelihood | Watch For |
|---------|-----------------|------------|-----------|
| [finding] | [new evidence] | [H/M/L] | [indicators] |

Red Lines (Definitively Rejected):
| Position | Why Rejected |
|----------|--------------|
| [rejected view] | [contradicting evidence] |

Alternative Analysis Text:
```
ALTERNATIVE ANALYSIS

Some analysts have suggested [alternative view]. While
[evidence for], we assess this is [less likely/unlikely]
because [evidence against]. We would reconsider if
[conditions that would change assessment].
```

□ Alternatives documented: [count]
□ Minority views: [count]
□ Change indicators: [defined]
```

### 5. Gaps and Collection Recommendations

Document gaps and recommendations:

```
GAPS AND COLLECTION RECOMMENDATIONS
===================================

Critical Intelligence Gaps:
| Gap | Impact on Assessment | Collection Needed | Priority |
|-----|---------------------|-------------------|----------|
| [gap 1] | [limits finding X] | [what to collect] | [1-3] |
| [gap 2] | [impact] | [collection] | [priority] |
| [gap 3] | [impact] | [collection] | [priority] |

Collection Recommendations:
| Priority | Collection Requirement | Suggested Workflow/Method |
|----------|----------------------|---------------------------|
| 1 | [specific requirement] | [workflow to run] |
| 2 | [requirement] | [method] |
| 3 | [requirement] | [method] |

Information Aging Concerns:
| Finding | Information Date | Recommended Update | Urgency |
|---------|------------------|-------------------|---------|
| [finding] | [date] | [when to update] | [H/M/L] |

Monitoring Recommendations:
| What to Monitor | For What | Alert Threshold |
|-----------------|----------|-----------------|
| [subject] | [changes] | [when to alert] |

Gap Impact Summary:
```
COLLECTION GAPS

This assessment is limited by gaps in [areas]. Priority
collection should focus on [recommendations]. We recommend
[specific workflow] to address [specific gap].
```

□ Gaps documented: [count]
□ Recommendations: [count]
□ Priorities assigned: [Y/N]
```

### 6. Final Intelligence Assessment

Compile the final product:

```markdown
═══════════════════════════════════════════════════════════════════════════════

              ALL-SOURCE INTELLIGENCE ASSESSMENT

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [Level]
DATE: [Current date]
PREPARED BY: Intel Team - The Synthesis Workflow

═══════════════════════════════════════════════════════════════════════════════

                         EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

SUBJECT: [Target/Topic]

BOTTOM LINE: [BLUF - 2-3 sentences capturing most important assessment]

KEY JUDGMENTS:

1. [Finding 1] (Confidence: [Level])

2. [Finding 2] (Confidence: [Level])

3. [Finding 3] (Confidence: [Level])

4. [Finding 4] (Confidence: [Level])

IMPLICATIONS: [What this means for the consumer]

SCOPE: This assessment synthesizes [X] sources across [Y] intelligence
disciplines covering [time period]. [Major caveat if needed]

═══════════════════════════════════════════════════════════════════════════════

                          KEY FINDINGS

═══════════════════════════════════════════════════════════════════════════════

FINDING 1: [Statement]
Confidence: [Level]

[Detailed discussion of finding, evidence, and implications]

Evidence: [Key sources]
Limitations: [What we don't know]

---

FINDING 2: [Statement]
Confidence: [Level]

[Discussion]

Evidence: [Sources]
Limitations: [Gaps]

---

FINDING 3: [Statement]
Confidence: [Level]

[Discussion]

Evidence: [Sources]
Limitations: [Gaps]

---

FINDING 4: [Statement]
Confidence: [Level]

[Discussion]

═══════════════════════════════════════════════════════════════════════════════

                       ALTERNATIVE ANALYSIS

═══════════════════════════════════════════════════════════════════════════════

[Discussion of alternative hypotheses and minority views]

═══════════════════════════════════════════════════════════════════════════════

                     INTELLIGENCE GAPS

═══════════════════════════════════════════════════════════════════════════════

This assessment is limited by gaps in:
- [Gap 1]
- [Gap 2]
- [Gap 3]

═══════════════════════════════════════════════════════════════════════════════

                      RECOMMENDATIONS

═══════════════════════════════════════════════════════════════════════════════

| Priority | Recommendation |
|----------|----------------|
| 1 | [Action/collection recommendation] |
| 2 | [Recommendation] |
| 3 | [Recommendation] |

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Source List and Reliability Assessment
Appendix B: Evidence Matrix
Appendix C: Evidence Chains
Appendix D: Confidence Framework
Appendix E: Methodology

═══════════════════════════════════════════════════════════════════════════════

                    CLASSIFICATION GUIDANCE

═══════════════════════════════════════════════════════════════════════════════

Distribution: [Guidance]
Handling: [Requirements]
Dissemination: [Restrictions]

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: The Synthesis
Steps Completed: 4/4
Agents Engaged: Vector (with consultations as needed)
Sources Synthesized: [count]
INT Disciplines: [count]

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 4 OUTPUT

```markdown
## ALL-SOURCE INTELLIGENCE ASSESSMENT COMPLETE

### Product Summary
- Subject: [target/topic]
- Classification: [level]
- Date: [date]

### Key Findings
| # | Finding | Confidence |
|---|---------|------------|
| 1 | [finding] | [level] |
| 2 | [finding] | [level] |
| 3 | [finding] | [level] |
| 4 | [finding] | [level] |

### Source Base
- Total sources: [count]
- INT disciplines: [count]
- Reliability: [range]

### Confidence Profile
- Very High: [count]
- High: [count]
- Moderate: [count]
- Low: [count]

### Gaps Identified
- [gap 1]
- [gap 2]
- [gap 3]

### Priority Recommendations
1. [recommendation 1]
2. [recommendation 2]
3. [recommendation 3]

### Product Status
- Assessment: Complete
- Ready for: [distribution/review]
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] Executive summary drafted
- [ ] Key findings documented
- [ ] Evidence matrix created
- [ ] Alternative analysis included
- [ ] Gaps and recommendations documented
- [ ] Final assessment assembled

---

## MENU OPTIONS

**[E] Export** - Export full intelligence assessment
**[S] Summary** - Export executive summary only
**[M] Matrix** - Export evidence matrix
**[R] Recommendations** - Export gap recommendations

---

## WORKFLOW COMPLETE

The Synthesis workflow complete.

Recommended follow-on:
- Distribute to appropriate consumers
- Task collection per recommendations
- Schedule update assessment
- Consider **Tripwire** for monitoring
- Archive for future reference

