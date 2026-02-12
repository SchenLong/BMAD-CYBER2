---
name: 'step-06-attribution-assessment'
description: 'Evidence chain validation, confidence scoring, and final attribution report'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-06-attribution-assessment.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-05-geographic-correlation.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 6: Attribution Assessment

## STEP GOAL

Synthesize all evidence from the attribution chain to produce final attribution assessment. Validate evidence chains, apply structured confidence scoring, test alternative hypotheses, and produce comprehensive attribution report.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Dossier**, Threat Actor Profiler
- You apply structured analytic tradecraft for attribution
- You synthesize multi-INT evidence into coherent assessment
- You clearly document confidence levels and evidence basis
- You acknowledge uncertainty and alternative explanations

### Analysis Protocol

- Review all evidence from Steps 1-5
- Build and validate evidence chains
- Apply Diamond Model analysis
- Score confidence using established framework
- Document dissenting analysis and alternatives
- Produce actionable attribution report

---

## FINAL ASSESSMENT SEQUENCE

### 1. Evidence Chain Compilation

Compile all evidence supporting each hypothesis:

```
EVIDENCE CHAIN COMPILATION
==========================

HYPOTHESIS 1: [Actor Name]

TTP Evidence (Step 1):
| Evidence | Strength | Unique to Actor? |
|----------|----------|------------------|
| [technique pattern] | [Strong/Mod/Weak] | [Y/N] |
| [tool usage] | [Strong/Mod/Weak] | [Y/N] |
| [operational pattern] | [Strong/Mod/Weak] | [Y/N] |

Technical Evidence (Step 2):
| Evidence | Strength | Unique to Actor? |
|----------|----------|------------------|
| [infrastructure match] | [Strong/Mod/Weak] | [Y/N] |
| [code similarity] | [Strong/Mod/Weak] | [Y/N] |
| [tool signature] | [Strong/Mod/Weak] | [Y/N] |

Underground Evidence (Step 3):
| Evidence | Strength | Unique to Actor? |
|----------|----------|------------------|
| [forum persona match] | [Strong/Mod/Weak] | [Y/N] |
| [marketplace correlation] | [Strong/Mod/Weak] | [Y/N] |
| [transaction evidence] | [Strong/Mod/Weak] | [Y/N] |

Open Source Evidence (Step 4):
| Evidence | Strength | Unique to Actor? |
|----------|----------|------------------|
| [public persona match] | [Strong/Mod/Weak] | [Y/N] |
| [linguistic match] | [Strong/Mod/Weak] | [Y/N] |
| [network connection] | [Strong/Mod/Weak] | [Y/N] |

Geographic Evidence (Step 5):
| Evidence | Strength | Unique to Actor? |
|----------|----------|------------------|
| [infrastructure location] | [Strong/Mod/Weak] | [Y/N] |
| [timezone match] | [Strong/Mod/Weak] | [Y/N] |
| [cultural indicators] | [Strong/Mod/Weak] | [Y/N] |

Evidence Summary:
- Total evidence points: [count]
- Strong evidence: [count]
- Moderate evidence: [count]
- Weak evidence: [count]
- Unique indicators: [count]

[REPEAT FOR HYPOTHESIS 2 AND 3]
```

### 2. Diamond Model Analysis

Apply Diamond Model framework:

```
DIAMOND MODEL ANALYSIS
======================

For Primary Hypothesis: [Actor Name]

        ADVERSARY
            │
    ┌───────┴───────┐
    │   [Actor]     │
    │   [Group]     │
    │   [Country]   │
    └───────┬───────┘
            │
┌───────────┼───────────┐
│           │           │
▼           │           ▼
CAPABILITY  │      INFRASTRUCTURE
[Tools]     │      [Domains]
[TTPs]      │      [IPs]
[Access]    │      [Services]
            │
            ▼
         VICTIM
    [Organization]
    [Industry]
    [Country]

Adversary Assessment:
□ Identity confidence: [level]
□ Attribution type: [nation-state/criminal/hacktivist/unknown]
□ Known group affiliation: [if applicable]
□ Individual vs group: [assessment]

Capability Assessment:
□ Technical sophistication: [High/Medium/Low]
□ Tool development capability: [assessment]
□ Zero-day usage: [observed/not observed]
□ Resource level: [well-resourced/moderate/limited]

Infrastructure Assessment:
□ Infrastructure complexity: [assessment]
□ Dedicated vs shared: [assessment]
□ Bulletproof hosting usage: [Y/N]
□ Infrastructure reuse from prior campaigns: [Y/N]

Victim Assessment:
□ Target selection pattern: [strategic/opportunistic]
□ Victim value alignment: [with actor interests]
□ Geographic focus: [assessment]
□ Industry focus: [assessment]

Meta-Features:
□ Timestamp: [attack timeframe]
□ Phase: [reconnaissance/weaponization/delivery/exploitation/C2/actions]
□ Result: [success/failure/partial]
□ Direction: [adversary-to-victim/victim-to-adversary]
```

### 3. Confidence Scoring

Apply structured confidence framework:

```
CONFIDENCE SCORING
==================

Scoring Framework Applied:
| Level | Confidence | Criteria | Met? |
|-------|------------|----------|------|
| 1 | Possible (20-40%) | Single indicator match | [Y/N] |
| 2 | Probable (40-60%) | Multiple indicator correlation | [Y/N] |
| 3 | Likely (60-80%) | Cross-INT corroboration | [Y/N] |
| 4 | High Confidence (80-95%) | Multiple independent sources | [Y/N] |
| 5 | Near Certain (95%+) | Direct evidence + corroboration | [Y/N] |

Evidence Quality Assessment:
| Quality Factor | Assessment | Impact |
|----------------|------------|--------|
| Source reliability | [assessment] | [+/-] |
| Evidence corroboration | [assessment] | [+/-] |
| Evidence recency | [assessment] | [+/-] |
| Evidence specificity | [assessment] | [+/-] |
| Alternative explanations | [assessment] | [+/-] |

Confidence Calculation:

HYPOTHESIS 1: [Actor Name]
- Base confidence from evidence volume: [level]
- Adjustments for quality factors: [+/-X%]
- Adjustments for unique indicators: [+/-X%]
- Adjustments for corroboration: [+/-X%]
- Adjustments for alternatives: [-X%]
FINAL CONFIDENCE: [X%] - [Level Label]

HYPOTHESIS 2: [Actor Name]
[Same calculation]
FINAL CONFIDENCE: [X%] - [Level Label]

HYPOTHESIS 3: [Actor Name]
[Same calculation]
FINAL CONFIDENCE: [X%] - [Level Label]
```

### 4. Alternative Hypothesis Testing

Systematically test alternative explanations:

```
ALTERNATIVE HYPOTHESIS TESTING
==============================

Alternative 1: False Flag Operation
□ Indicators of deliberate deception:
  - [indicator and assessment]
  - [indicator and assessment]
□ Motivation for false flag: [possible reasons]
□ Capability to execute false flag: [assessment]
□ False flag probability: [High/Medium/Low]

Alternative 2: Shared Infrastructure/Tools
□ Evidence that could indicate tool sharing:
  - [evidence point]
□ Known tool sharing between actors: [if applicable]
□ Shared infrastructure indicators: [if applicable]
□ Tool sharing probability: [High/Medium/Low]

Alternative 3: Contractor/Mercenary Operation
□ Indicators of for-hire operation:
  - [indicator]
□ Known mercenary groups with similar TTPs: [if any]
□ Contractor probability: [High/Medium/Low]

Alternative 4: Unknown/New Actor
□ Evidence supporting new actor:
  - [novel techniques]
  - [no historical matches]
□ Possibility this is debut of new actor: [assessment]
□ New actor probability: [High/Medium/Low]

Alternative Assessment Summary:
| Alternative | Probability | Impact on Primary |
|-------------|-------------|-------------------|
| False flag | [H/M/L] | [reduces confidence by X%] |
| Shared tools | [H/M/L] | [reduces confidence by X%] |
| Contractor | [H/M/L] | [reduces confidence by X%] |
| New actor | [H/M/L] | [reduces confidence by X%] |
```

### 5. Analytic Confidence Statement

Develop formal confidence statement:

```
ANALYTIC CONFIDENCE STATEMENT
=============================

Primary Assessment:
We assess with [CONFIDENCE LEVEL] confidence that [ACTOR NAME/GROUP]
is responsible for [INCIDENT/CAMPAIGN DESCRIPTION].

Confidence Basis:
This assessment is based on:
1. [Primary evidence type and strength]
2. [Secondary evidence type and strength]
3. [Tertiary evidence type and strength]

Key Judgments:
□ Technical attribution (infrastructure/tools): [confidence level]
□ Operational attribution (actor/group): [confidence level]
□ Strategic attribution (nation-state sponsor): [confidence level if applicable]
□ Individual attribution (specific person): [confidence level if applicable]

Uncertainties:
□ Key information gaps: [list]
□ Assumptions made: [list]
□ Evidence that could change assessment: [list]

Alternative Views:
□ [Dissenting analysis if applicable]
□ [Evidence that supports alternatives]

Confidence Trend:
□ If additional collection conducted, confidence likely to: [increase/decrease/remain]
□ Key collection that would resolve uncertainty: [recommended collection]
```

### 6. Attribution Report Assembly

Compile final attribution report:

```
ATTRIBUTION REPORT
==================

CLASSIFICATION: [As appropriate]
DATE: [Current date]
WORKFLOW: Attribution Chain
CASE: [Case identifier if applicable]

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
-----------------
[2-3 sentence summary of attribution finding and confidence]

KEY FINDINGS
------------
1. [Most significant finding]
2. [Second most significant]
3. [Third most significant]

ATTRIBUTION ASSESSMENT
----------------------

Primary Attribution:
• Actor: [Name/alias]
• Confidence: [Level with percentage]
• Attribution Type: [Nation-state/Criminal/Hacktivist/Unknown]
• Geographic Origin: [Country/Region with confidence]

Secondary Considerations:
• Alternative Actor: [If applicable]
• Alternative Confidence: [Level]

EVIDENCE SUMMARY
----------------

Technical Evidence:
• Infrastructure: [Key findings]
• Malware/Tools: [Key findings]
• Code Patterns: [Key findings]

Behavioral Evidence:
• TTPs: [Key findings aligned to MITRE ATT&CK]
• Operational Patterns: [Key findings]
• Targeting: [Key findings]

Intelligence Evidence:
• Underground Activity: [Key findings]
• Open Source: [Key findings]
• Geographic Indicators: [Key findings]

DIAMOND MODEL SUMMARY
---------------------
• Adversary: [Summary]
• Capability: [Summary]
• Infrastructure: [Summary]
• Victim: [Summary]

MITRE ATT&CK COVERAGE
---------------------
Techniques Observed: [List key technique IDs]
Navigator Layer: [Reference to exported layer if created]

CONFIDENCE ASSESSMENT
---------------------
Confidence Level: [Level]
Confidence Basis: [Brief explanation]
Key Uncertainties: [List]
Alternative Explanations: [Brief summary]

COLLECTION GAPS
---------------
• [Gap 1 - what couldn't be determined]
• [Gap 2 - what would increase confidence]
• [Gap 3 - recommended follow-up collection]

RECOMMENDATIONS
---------------
1. [Recommended action based on attribution]
2. [Recommended follow-up investigation]
3. [Recommended defensive measures]

APPENDICES
----------
A. Full IOC List
B. Evidence Chain Diagram
C. Timeline of Activity
D. MITRE ATT&CK Navigator Layer

═══════════════════════════════════════════════════════════════
Report Prepared By: Intel Team (Dossier)
Quality Reviewed: [If applicable]
Distribution: [As appropriate]
```

---

## WORKFLOW COMPLETION

```markdown
## ATTRIBUTION CHAIN COMPLETE

### Final Attribution
- Actor: [name]
- Confidence: [level with percentage]
- Geographic Origin: [location]

### Evidence Strength
- Total evidence points: [count]
- Strong evidence: [count]
- Cross-INT corroboration: [Y/N]
- Unique indicators: [count]

### Deliverables Generated
- [ ] Attribution Report
- [ ] Evidence Chain Diagram
- [ ] Diamond Model Analysis
- [ ] MITRE ATT&CK Mapping
- [ ] Alternative Hypotheses Assessment
- [ ] Collection Gap Analysis

### Quality Metrics
- Steps completed: 6/6
- Agents engaged: 5 (Dossier, Probe, Shadow, Echo, Atlas)
- Time elapsed: [duration]

### Next Steps
- [ ] Distribute report to stakeholders
- [ ] Update threat intelligence platform
- [ ] Task additional collection if gaps identified
- [ ] Monitor for additional actor activity
```

---

## COMPLETION CRITERIA

Workflow complete when:

- [ ] All evidence compiled and validated
- [ ] Diamond Model analysis complete
- [ ] Confidence scored using framework
- [ ] Alternative hypotheses tested
- [ ] Formal confidence statement developed
- [ ] Attribution report assembled
- [ ] Deliverables generated

---

## MENU OPTIONS

**[R] Report** - Generate full attribution report
**[E] Export** - Export MITRE ATT&CK Navigator layer
**[D] Diagram** - Generate evidence chain diagram
**[A] Archive** - Archive case materials

---

## WORKFLOW COMPLETE

Attribution Chain workflow finished. Return to main workflow menu or initiate follow-on workflows as needed.

Recommended follow-on workflows:

- **Threat Constellation** - Map actor's broader ecosystem
- **Tripwire** - Set up monitoring for this actor
- **Pattern of Life** - If individual identified, develop behavioral profile
