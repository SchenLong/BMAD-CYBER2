---
name: 'step-01-ttp-analysis'
description: 'Initial TTP analysis and actor hypothesis generation'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-01-ttp-analysis.md'
nextStepFile: '{workflow_path}/steps/step-02-technical-fingerprinting.md'
prevStepFile: null

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 1: Initial TTP Analysis

## STEP GOAL

Analyze the initial indicators and artifacts to map observed tactics, techniques, and procedures against the MITRE ATT&CK framework. Generate initial attribution hypotheses by comparing patterns against known threat actor profiles.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You specialize in adversary behavior analysis and attribution
- You maintain knowledge of known threat actor TTPs
- You apply structured analytic tradecraft

### Analysis Protocol
- Map all observed behaviors to MITRE ATT&CK
- Identify technique clusters and patterns
- Compare against known actor playbooks
- Generate testable attribution hypotheses
- Document confidence for each correlation

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Indicator Intake

Document all available starting materials:

```
INDICATOR INTAKE
================

IOCs Provided:
| Type | Value | Source | First Seen |
|------|-------|--------|------------|
| IP | [value] | [source] | [date] |
| Domain | [value] | [source] | [date] |
| Hash | [value] | [source] | [date] |
| Email | [value] | [source] | [date] |
| URL | [value] | [source] | [date] |

Artifacts Available:
| Type | Description | Source |
|------|-------------|--------|
| Malware sample | [description] | [source] |
| Phishing email | [description] | [source] |
| Log files | [description] | [source] |
| Network capture | [description] | [source] |
| Other | [description] | [source] |

Observed Behaviors:
| Phase | Observed Activity | Evidence |
|-------|------------------|----------|
| Initial Access | [activity] | [evidence] |
| Execution | [activity] | [evidence] |
| Persistence | [activity] | [evidence] |
| Privilege Escalation | [activity] | [evidence] |
| Defense Evasion | [activity] | [evidence] |
| Credential Access | [activity] | [evidence] |
| Discovery | [activity] | [evidence] |
| Lateral Movement | [activity] | [evidence] |
| Collection | [activity] | [evidence] |
| C2 | [activity] | [evidence] |
| Exfiltration | [activity] | [evidence] |
| Impact | [activity] | [evidence] |

Context:
- Victim Industry: [industry]
- Victim Geography: [location]
- Incident Timeframe: [dates]
- Known Prior Incidents: [if any]
```

### 2. MITRE ATT&CK Mapping

Map observed behaviors to specific techniques:

```
MITRE ATT&CK MAPPING
====================

TACTIC: Initial Access (TA0001)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| T1566 | Phishing | [evidence] | [H/M/L] |
| T1190 | Exploit Public-Facing App | [evidence] | [H/M/L] |
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Execution (TA0002)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| T1059 | Command and Scripting Interpreter | [evidence] | [H/M/L] |
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Persistence (TA0003)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Privilege Escalation (TA0004)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Defense Evasion (TA0005)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Credential Access (TA0006)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Discovery (TA0007)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Lateral Movement (TA0008)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Collection (TA0009)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Command and Control (TA0011)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Exfiltration (TA0010)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TACTIC: Impact (TA0040)
| Technique ID | Technique Name | Evidence | Confidence |
|--------------|----------------|----------|------------|
| [ID] | [name] | [evidence] | [H/M/L] |

TTP SUMMARY:
Total Techniques Observed: [count]
High Confidence: [count]
Medium Confidence: [count]
Low Confidence: [count]
```

### 3. Pattern Analysis

Identify distinctive TTP patterns:

```
PATTERN ANALYSIS
================

Technique Clusters:
□ Cluster 1: [description of related techniques]
  - Techniques: [T1xxx, T1yyy, T1zzz]
  - Pattern significance: [explanation]

□ Cluster 2: [description of related techniques]
  - Techniques: [T1xxx, T1yyy, T1zzz]
  - Pattern significance: [explanation]

Distinctive Characteristics:
□ Unique/unusual techniques observed:
  - [technique and why it's distinctive]
  - [technique and why it's distinctive]

□ Technique combinations rare in the wild:
  - [combination and significance]

□ Operational patterns (timing, targeting):
  - [pattern observed]
  - [pattern observed]

□ Tool preferences indicated:
  - [tool/framework inferred from TTPs]
  - [tool/framework inferred from TTPs]

Victim Pattern Analysis:
□ Target selection indicators:
  - Industry targeting: [specific/opportunistic]
  - Geographic focus: [specific/global]
  - Size preference: [if discernible]
  - Value proposition: [what attacker sought]
```

### 4. Known Actor Comparison

Compare patterns against threat actor database:

```
KNOWN ACTOR COMPARISON
======================

Potential Actor Matches:

HYPOTHESIS 1: [Actor Name/Alias]
| Matching Criteria | Match Quality | Evidence |
|-------------------|---------------|----------|
| TTP overlap | [count/total] techniques match | [specific matches] |
| Targeting pattern | [match level] | [evidence] |
| Tool signatures | [match level] | [evidence] |
| Infrastructure pattern | [match level] | [evidence] |
| Timing/operational tempo | [match level] | [evidence] |
Correlation Confidence: [Possible/Probable/Likely/High/Near Certain]
Notes: [relevant context about this actor]

HYPOTHESIS 2: [Actor Name/Alias]
| Matching Criteria | Match Quality | Evidence |
|-------------------|---------------|----------|
| TTP overlap | [count/total] techniques match | [specific matches] |
| Targeting pattern | [match level] | [evidence] |
| Tool signatures | [match level] | [evidence] |
| Infrastructure pattern | [match level] | [evidence] |
| Timing/operational tempo | [match level] | [evidence] |
Correlation Confidence: [Possible/Probable/Likely/High/Near Certain]
Notes: [relevant context about this actor]

HYPOTHESIS 3: [Actor Name/Alias or "Unknown/New Actor"]
| Matching Criteria | Match Quality | Evidence |
|-------------------|---------------|----------|
| TTP overlap | [count/total] techniques match | [specific matches] |
| Targeting pattern | [match level] | [evidence] |
| Tool signatures | [match level] | [evidence] |
| Infrastructure pattern | [match level] | [evidence] |
| Timing/operational tempo | [match level] | [evidence] |
Correlation Confidence: [Possible/Probable/Likely/High/Near Certain]
Notes: [relevant context about this actor]

ALTERNATIVE CONSIDERATION: New/Unknown Actor
Evidence supporting unknown actor:
- [unique characteristics not matching known actors]
- [novel techniques or combinations]
- [targeting pattern inconsistencies with known actors]
```

### 5. Initial Hypothesis Formulation

Document working hypotheses for validation:

```
ATTRIBUTION HYPOTHESES
======================

PRIMARY HYPOTHESIS:
Actor: [name/alias]
Confidence: [level with percentage range]
Key Evidence:
1. [strongest supporting evidence]
2. [second strongest evidence]
3. [additional supporting evidence]
Weaknesses/Gaps:
- [what doesn't fit or needs validation]
- [alternative explanations]

SECONDARY HYPOTHESIS:
Actor: [name/alias]
Confidence: [level with percentage range]
Key Evidence:
1. [strongest supporting evidence]
2. [second strongest evidence]
3. [additional supporting evidence]
Weaknesses/Gaps:
- [what doesn't fit or needs validation]
- [alternative explanations]

TERTIARY HYPOTHESIS:
Actor: [name/alias or "Unknown Actor"]
Confidence: [level with percentage range]
Key Evidence:
1. [strongest supporting evidence]
2. [second strongest evidence]
3. [additional supporting evidence]
Weaknesses/Gaps:
- [what doesn't fit or needs validation]
- [alternative explanations]

FALSE FLAG ASSESSMENT:
Risk of deliberate deception: [High/Medium/Low]
Indicators:
- [any signs of false flag operations]
- [inconsistencies that might indicate deception]
```

### 6. Collection Requirements

Identify what additional evidence is needed:

```
COLLECTION REQUIREMENTS FOR VALIDATION
======================================

For Technical Fingerprinting (Step 2 - Probe):
□ Infrastructure analysis needed on: [specific IOCs]
□ Malware analysis required for: [specific samples]
□ Code pattern analysis on: [specific artifacts]
□ Historical infrastructure correlation for: [specific domains/IPs]

For Underground Correlation (Step 3 - Shadow):
□ Forum search for: [specific handles, keywords, tools]
□ Marketplace check for: [specific services, tools]
□ Persona investigation for: [specific identifiers]

For Open Source Correlation (Step 4 - Echo):
□ Social media search for: [specific identifiers]
□ Linguistic analysis on: [specific content]
□ Timestamp correlation for: [specific events]

For Geographic Correlation (Step 5 - Atlas):
□ Geolocation needed for: [specific infrastructure]
□ Timezone analysis on: [specific activity patterns]
□ Regional pattern check for: [specific indicators]

PRIORITY VALIDATION TARGETS:
1. [most important validation task]
2. [second priority]
3. [third priority]
```

---

## STEP 1 OUTPUT

```markdown
## TTP ANALYSIS SUMMARY

### Indicator Summary
- Total IOCs cataloged: [count]
- Artifacts analyzed: [count]
- Observed behaviors mapped: [count]

### MITRE ATT&CK Coverage
- Tactics observed: [count]/14
- Techniques mapped: [count]
- High-confidence mappings: [count]

### Pattern Assessment
- Distinctive TTP clusters: [count]
- Unique/rare techniques: [list]
- Operational pattern indicators: [summary]

### Attribution Hypotheses
| Rank | Actor | Confidence | Key Evidence |
|------|-------|------------|--------------|
| 1 | [name] | [level] | [summary] |
| 2 | [name] | [level] | [summary] |
| 3 | [name] | [level] | [summary] |

### False Flag Assessment
Risk Level: [High/Medium/Low]
Key Concerns: [summary]

### Next Steps
Proceed to technical fingerprinting to validate infrastructure
and tool correlations with hypothesized actors.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] All available indicators cataloged
- [ ] MITRE ATT&CK mapping complete
- [ ] TTP patterns identified and documented
- [ ] At least 2-3 attribution hypotheses generated
- [ ] Confidence levels assigned with rationale
- [ ] Collection requirements identified for next steps
- [ ] False flag assessment documented

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical fingerprinting (Step 2)
**[R] Refine** - Additional TTP analysis needed
**[A] Add Data** - New indicators to incorporate
**[H] Hypothesis** - Adjust attribution hypotheses

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-technical-fingerprinting.md`
