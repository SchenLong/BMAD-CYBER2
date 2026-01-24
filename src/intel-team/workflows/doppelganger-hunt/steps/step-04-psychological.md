---
name: 'step-04-psychological'
description: 'Persona consistency, motivation assessment, deception indicators, true identity hypothesis'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/doppelganger-hunt'
thisStepFile: '{workflow_path}/steps/step-04-psychological.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-03-location.md'

# Agent Configuration
executing_agent: humint-specialist
agent_codename: Viper
---

# Step 4: Psychological Assessment

## STEP GOAL

Perform psychological analysis of the account to assess persona consistency, identify likely motivations if fake, detect deception indicators, and develop hypotheses about the true identity behind a fake account.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Viper**, HUMINT Specialist
- You specialize in psychological profiling and deception detection
- You assess persona authenticity and motivation
- You develop true identity hypotheses for fake accounts

### Assessment Protocol
- Analyze persona for internal consistency
- Identify psychological patterns indicating deception
- Assess likely motivation for fake account
- Develop hypotheses about true operator
- Compile final authenticity assessment

---

## ASSESSMENT EXECUTION SEQUENCE

### 1. Persona Consistency Analysis

Assess the internal consistency of the claimed persona:

```
PERSONA CONSISTENCY ANALYSIS
============================

Claimed Identity Profile:
| Element | Claim | Evidence | Consistent? |
|---------|-------|----------|-------------|
| Name | [claimed name] | [how used] | [Y/N/Partial] |
| Age/DOB | [claimed] | [evidence] | [Y/N/Partial] |
| Location | [claimed] | [Step 3 findings] | [Y/N/Partial] |
| Profession | [claimed] | [content evidence] | [Y/N/Partial] |
| Education | [claimed] | [content evidence] | [Y/N/Partial] |
| Interests | [claimed] | [content evidence] | [Y/N/Partial] |
| Relationships | [claimed] | [evidence] | [Y/N/Partial] |

Professional Persona Check:
| Claim | Verification | Assessment |
|-------|--------------|------------|
| Job title | [claimed] | [Evidence of actual knowledge?] |
| Industry expertise | [claimed] | [Demonstrates expertise?] |
| Professional network | [claimed] | [Real connections?] |
| Work history | [claimed] | [Verifiable?] |

Personal Narrative Consistency:
| Topic | Consistency | Notes |
|-------|-------------|-------|
| Life story | [Consistent/Inconsistent] | [contradictions?] |
| Timeline of events | [Consistent/Inconsistent] | [impossibilities?] |
| Personal experiences | [Consistent/Inconsistent] | [believability] |
| Relationships mentioned | [Consistent/Inconsistent] | [real people?] |

□ Persona consistency assessment:
  - [ ] Highly consistent, well-developed persona
  - [ ] Generally consistent with minor gaps
  - [ ] Significant inconsistencies
  - [ ] Clearly fabricated/impossible claims
  - [ ] Too perfect (suspicious itself)

PERSONA CONSISTENCY SCORE: [0-100]
```

### 2. Deception Indicator Analysis

Identify patterns associated with deception:

```
DECEPTION INDICATOR ANALYSIS
============================

Linguistic Deception Markers:
| Marker | Present? | Examples |
|--------|----------|----------|
| Excessive detail (overcompensation) | [Y/N] | [examples] |
| Vague on verifiable facts | [Y/N] | [examples] |
| Third-person self-reference | [Y/N] | [examples] |
| Qualifying language ("honestly", "truthfully") | [Y/N] | [examples] |
| Inconsistent pronoun use | [Y/N] | [examples] |
| Tense inconsistencies | [Y/N] | [examples] |

Behavioral Deception Indicators:
| Indicator | Present? | Evidence |
|-----------|----------|----------|
| Avoids direct questions | [Y/N] | [examples] |
| Deflects to new topics | [Y/N] | [examples] |
| Stories change over time | [Y/N] | [examples] |
| Over-explains unprompted | [Y/N] | [examples] |
| Defensive responses | [Y/N] | [examples] |
| Deletes/edits content | [Y/N] | [evidence] |

Identity Maintenance Failures:
| Failure Type | Observed | Example |
|--------------|----------|---------|
| Wrong detail (name, date, etc) | [Y/N] | [example] |
| Broke character | [Y/N] | [example] |
| Inconsistent expertise level | [Y/N] | [example] |
| Wrong cultural references | [Y/N] | [example] |
| Timezone slips | [Y/N] | [example] |

Digital Deception Indicators:
| Indicator | Present? | From Steps 1-3 |
|-----------|----------|----------------|
| Stolen images | [Y/N] | [Step 2 finding] |
| AI-generated images | [Y/N] | [Step 2 finding] |
| Location inconsistencies | [Y/N] | [Step 3 finding] |
| Bot-like behavior | [Y/N] | [Step 2 finding] |
| Cross-platform inconsistencies | [Y/N] | [Step 2 finding] |

□ Deception probability assessment:
  - [ ] No significant deception indicators
  - [ ] Some concerning indicators
  - [ ] Strong evidence of deception
  - [ ] Clear and obvious deception

DECEPTION INDICATOR SCORE: [inverse - high = more deceptive]
```

### 3. Motivation Assessment

If the account appears fake, assess likely motivation:

```
MOTIVATION ASSESSMENT
=====================

Fake Account Type Assessment:
| Type | Likelihood | Evidence |
|------|------------|----------|
| Impersonator (pretending to be specific person) | [H/M/L] | [evidence] |
| Sock puppet (fake persona for influence) | [H/M/L] | [evidence] |
| Bot (automated posting) | [H/M/L] | [evidence] |
| Catfish (romantic deception) | [H/M/L] | [evidence] |
| Astroturf (fake grassroots) | [H/M/L] | [evidence] |
| Troll (provocation) | [H/M/L] | [evidence] |
| Scam account (financial fraud) | [H/M/L] | [evidence] |
| Privacy-conscious real person | [H/M/L] | [evidence] |

Motivation Analysis:
| Motivation | Indicators | Likelihood |
|------------|------------|------------|
| Financial gain | [scam indicators, affiliate links] | [H/M/L] |
| Influence/manipulation | [political content, engagement farming] | [H/M/L] |
| Information gathering | [excessive questioning, profile building] | [H/M/L] |
| Reputation damage | [negative content about specific targets] | [H/M/L] |
| Romantic exploitation | [relationship focus, emotional manipulation] | [H/M/L] |
| Harassment | [targeting specific individuals] | [H/M/L] |
| Privacy protection | [minimal identifying info, consistent otherwise] | [H/M/L] |
| Competitive intelligence | [industry focus, competitor monitoring] | [H/M/L] |

Target Analysis (if applicable):
| Observed Target | Relationship | Motive |
|-----------------|--------------|--------|
| [target person/org 1] | [connection] | [likely motive] |
| [target person/org 2] | [connection] | [likely motive] |

□ Primary motivation assessment:
  Most likely motivation: [motivation]
  Secondary motivation: [motivation]
  Confidence: [H/M/L]
```

### 4. True Identity Hypothesis

Develop hypotheses about the real operator:

```
TRUE IDENTITY HYPOTHESIS
========================

(Only applicable if account determined to be fake)

Evidence of True Operator:
| Evidence Type | Finding | Significance |
|---------------|---------|--------------|
| Timezone (from posting) | [TZ from Step 3] | [actual location] |
| Language patterns | [native language] | [origin indication] |
| Cultural markers | [culture indicated] | [origin indication] |
| Technical indicators | [from Step 2] | [operator profile] |
| Content focus | [topics] | [interests/profession] |
| Writing style | [patterns] | [education/background] |
| Mistakes made | [errors] | [reveals about operator] |

Operator Profile:
| Attribute | Hypothesis | Confidence |
|-----------|------------|------------|
| Likely location | [location] | [H/M/L] |
| Likely native language | [language] | [H/M/L] |
| Likely gender | [gender or unknown] | [H/M/L] |
| Approximate age range | [range] | [H/M/L] |
| Profession/background | [hypothesis] | [H/M/L] |
| Technical sophistication | [level] | [H/M/L] |

Possible Identity Leads:
| Lead Type | Details | Actionable? |
|-----------|---------|-------------|
| Linked account | [if found] | [Y/N] |
| Image trace | [if original found] | [Y/N] |
| Writing sample match | [if found] | [Y/N] |
| Username reuse | [if found] | [Y/N] |
| Other | [details] | [Y/N] |

□ True identity assessment:
  - Identity unknown but profile developed
  - Possible identity leads identified
  - Likely identity hypothesized
  - Identity confirmed

OPERATOR HYPOTHESIS: [summary statement]
```

### 5. Final Authenticity Assessment

Compile the final authenticity verdict:

```
FINAL AUTHENTICITY ASSESSMENT
=============================

COMBINED SCORING:

Category Scores (from all steps):
| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Behavioral (Step 1) | [/100] | 25% | |
| Technical (Step 2) | [/100] | 25% | |
| Location (Step 3) | [/100] | 20% | |
| Persona Consistency | [/100] | 15% | |
| Deception Indicators (inverse) | [/100] | 15% | |
| **TOTAL AUTHENTICITY** | | | **[/100]** |

AUTHENTICITY VERDICT:

□ Score 80-100: LIKELY AUTHENTIC
  - Account shows strong signs of genuine human operation
  - Inconsistencies explained or minor
  - Recommend: [action if any]

□ Score 60-79: POSSIBLY AUTHENTIC
  - Some concerning indicators but not conclusive
  - May be real person with unusual patterns
  - Recommend: Additional monitoring/investigation

□ Score 40-59: INCONCLUSIVE
  - Mixed signals, cannot determine authenticity
  - Recommend: Specific additional investigation

□ Score 20-39: PROBABLY FAKE
  - Multiple strong indicators of inauthenticity
  - Likely sock puppet, bot, or impersonator
  - Recommend: [action based on context]

□ Score 0-19: DEFINITELY FAKE
  - Overwhelming evidence of fabricated account
  - Clear deception with identifiable patterns
  - Recommend: [action based on context]

FINAL VERDICT: [AUTHENTIC/INCONCLUSIVE/FAKE]
CONFIDENCE: [High/Medium/Low]
FAKE TYPE (if applicable): [Impersonator/Bot/Sock Puppet/etc]
```

### 6. Final Report Assembly

Compile the Doppelganger Hunt report:

```markdown
═══════════════════════════════════════════════════════════════

              DOPPELGANGER HUNT: AUTHENTICITY ASSESSMENT

═══════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
CASE: [Account handle/URL]
PREPARED BY: Intel Team

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
-----------------

Account: [handle] on [platform]
Verdict: [AUTHENTIC/INCONCLUSIVE/FAKE]
Authenticity Score: [X/100]
Confidence: [High/Medium/Low]

Key Finding: [One sentence summary]

═══════════════════════════════════════════════════════════════

SECTION 1: ACCOUNT OVERVIEW
---------------------------

[Basic account information]

═══════════════════════════════════════════════════════════════

SECTION 2: BEHAVIORAL ANALYSIS
------------------------------

Score: [X/100]
Key Findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

═══════════════════════════════════════════════════════════════

SECTION 3: TECHNICAL ANALYSIS
-----------------------------

Score: [X/100]
Profile Image: [Original/Stolen/AI/Stock]
Bot Probability: [High/Medium/Low/None]
Key Findings:
- [Finding 1]
- [Finding 2]

═══════════════════════════════════════════════════════════════

SECTION 4: LOCATION ANALYSIS
----------------------------

Score: [X/100]
Claimed Location: [location]
Likely Actual Location: [location]
Key Findings:
- [Finding 1]
- [Finding 2]

═══════════════════════════════════════════════════════════════

SECTION 5: PSYCHOLOGICAL ASSESSMENT
-----------------------------------

Persona Consistency: [X/100]
Deception Indicators: [count]
Likely Motivation: [if fake]
Key Findings:
- [Finding 1]
- [Finding 2]

═══════════════════════════════════════════════════════════════

SECTION 6: RED FLAGS
--------------------

[Bulleted list of all significant red flags]

═══════════════════════════════════════════════════════════════

SECTION 7: TRUE IDENTITY HYPOTHESIS
-----------------------------------

(If determined to be fake)
[Operator profile and leads]

═══════════════════════════════════════════════════════════════

SECTION 8: RECOMMENDATIONS
--------------------------

[Recommended actions based on findings]

═══════════════════════════════════════════════════════════════

APPENDICES
----------

A. Evidence Screenshots
B. Timeline of Activity
C. Cross-Platform Comparison
D. Image Analysis Results

═══════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Steps Completed: 4/4
Agents Engaged: Echo, Probe, Atlas, Viper

═══════════════════════════════════════════════════════════════
```

---

## WORKFLOW COMPLETION

```markdown
## DOPPELGANGER HUNT COMPLETE

### Final Verdict
- Account: [handle]
- Platform: [platform]
- Verdict: [AUTHENTIC/INCONCLUSIVE/FAKE]
- Score: [X/100]
- Confidence: [High/Medium/Low]

### Score Breakdown
| Category | Score |
|----------|-------|
| Behavioral | [X/100] |
| Technical | [X/100] |
| Location | [X/100] |
| Psychological | [X/100] |
| **TOTAL** | **[X/100]** |

### If Fake
- Type: [Impersonator/Bot/Sock Puppet/etc]
- Motivation: [assessed motivation]
- Operator Profile: [summary]
- Identity Leads: [if any]

### Deliverables
- [ ] Authenticity Assessment Report
- [ ] Evidence Package
- [ ] Red Flag Summary
- [ ] True Identity Hypothesis (if fake)
- [ ] Recommendations

### Recommended Follow-On
- [Workflow recommendations based on findings]
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] Persona consistency analyzed
- [ ] Deception indicators assessed
- [ ] Motivation evaluated (if fake)
- [ ] True identity hypothesized (if fake)
- [ ] Final verdict determined
- [ ] Report assembled
- [ ] Recommendations provided

---

## MENU OPTIONS

**[R] Report** - Generate final report
**[E] Export** - Export evidence package
**[I] Investigate** - Additional investigation on specific finding
**[A] Archive** - Archive case materials

---

## WORKFLOW COMPLETE

Doppelganger Hunt workflow finished. Authenticity assessment complete.

Recommended follow-on based on verdict:
- **If Impersonation**: Report to platform, notify victim
- **If Bot Network**: Consider Threat Constellation workflow
- **If Competitor Intel**: Consider Counter-Intel Audit
- **If Personal Targeting**: Consider Pattern of Life on operator
