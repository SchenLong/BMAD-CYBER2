---
name: 'step-07-threat-correlation'
description: 'Known actor matching, TTP analysis, campaign correlation, attribution confidence'
estimated_duration: '30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-07-threat-correlation.md'
nextStepFile: '{workflow_path}/steps/step-08-operational-assessment.md'
prevStepFile: '{workflow_path}/steps/step-06-geospatial.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 7: Threat Correlation (Phase 3)

## STEP GOAL

Correlate all collected intelligence with known threat actors, map observed TTPs to MITRE ATT&CK framework, identify campaign connections, and assess attribution confidence. This specialized analysis synthesizes Phase 2 findings into threat intelligence.

## EXECUTION TIME: ~30 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You specialize in threat actor profiling and attribution
- You correlate indicators with known threat landscapes
- You assess attribution confidence using structured methods

### Analysis Protocol
- Review all Phase 2 findings for threat indicators
- Match patterns against known threat actors
- Map observed behaviors to MITRE ATT&CK
- Identify campaign and infrastructure connections
- Build attribution hypothesis with confidence levels
- Document all correlation points

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Indicator Aggregation

Compile threat-relevant indicators from Phase 2:

```
INDICATOR AGGREGATION
=====================

Technical Indicators (from Step 2 - Digital Footprint):
| Indicator Type | Value | Context | Threat Relevance |
|----------------|-------|---------|------------------|
| Domain | [domain] | [purpose] | [suspicious?] |
| IP Address | [IP] | [hosting] | [known bad?] |
| Certificate | [cert details] | [context] | [relevance] |
| Technology | [tech] | [usage] | [vuln/exploit?] |

Behavioral Indicators (from Step 3 - Social):
| Indicator Type | Value | Context | Threat Relevance |
|----------------|-------|---------|------------------|
| Network connections | [entities] | [relationships] | [known actors?] |
| Communication patterns | [patterns] | [context] | [suspicious?] |
| Content themes | [themes] | [analysis] | [threat related?] |

Underground Indicators (from Step 4 - Dark Web):
| Indicator Type | Value | Context | Threat Relevance |
|----------------|-------|---------|------------------|
| Breach exposure | [breaches] | [data types] | [attack vector?] |
| Forum presence | [forums] | [activity] | [threat actor?] |
| Marketplace activity | [activity] | [context] | [criminal?] |

Corporate Indicators (from Step 5 - Corporate):
| Indicator Type | Value | Context | Threat Relevance |
|----------------|-------|---------|------------------|
| Entity structure | [structure] | [analysis] | [shell company?] |
| Personnel | [names] | [roles] | [known actors?] |
| Financial patterns | [patterns] | [analysis] | [suspicious?] |

Location Indicators (from Step 6 - Geospatial):
| Indicator Type | Value | Context | Threat Relevance |
|----------------|-------|---------|------------------|
| Primary location | [location] | [confidence] | [threat region?] |
| Infrastructure location | [locations] | [analysis] | [bulletproof?] |
| Movement patterns | [patterns] | [analysis] | [operational?] |

□ Indicators aggregated: [count]
□ High-priority indicators: [count]
□ Threat-relevant indicators: [count]
```

### 2. Known Actor Matching

Compare against known threat actor profiles:

```
KNOWN ACTOR MATCHING
====================

Actor Database Comparison:
| Actor/Group | Indicators Matching | Match Quality | Confidence |
|-------------|---------------------|---------------|------------|
| [Actor 1] | [matching indicators] | [strong/weak] | [H/M/L] |
| [Actor 2] | [matching indicators] | [match quality] | [confidence] |
| [Actor 3] | [matching indicators] | [match quality] | [confidence] |

Detailed Match Analysis:
| Actor | TTP Match | Infrastructure Match | Targeting Match |
|-------|-----------|---------------------|-----------------|
| [Actor] | [% or description] | [shared infra?] | [similar targets?] |

Known Actor Profiles Considered:
| Actor | Type | Origin | Active | Known TTPs |
|-------|------|--------|--------|------------|
| [Actor] | [APT/Criminal/etc] | [country/region] | [Y/N] | [summary] |

Matching Criteria:
| Criterion | Weight | Match Score |
|-----------|--------|-------------|
| TTP overlap | 30% | [score] |
| Infrastructure overlap | 25% | [score] |
| Targeting similarity | 20% | [score] |
| Geographic correlation | 15% | [score] |
| Timing correlation | 10% | [score] |
| **TOTAL MATCH** | 100% | **[total]** |

Top Actor Hypotheses:
| Rank | Actor | Confidence | Key Evidence |
|------|-------|------------|--------------|
| 1 | [most likely] | [H/M/L] | [why] |
| 2 | [second] | [H/M/L] | [why] |
| 3 | [third] | [H/M/L] | [why] |

□ Known actor match found: [Y/N]
□ Top hypothesis confidence: [H/M/L]
□ Alternative hypotheses: [count]
```

### 3. MITRE ATT&CK Mapping

Map observed behaviors to ATT&CK framework:

```
MITRE ATT&CK MAPPING
====================

Observed Techniques:
| Tactic | Technique ID | Technique Name | Evidence |
|--------|--------------|----------------|----------|
| Reconnaissance | T1595 | Active Scanning | [evidence] |
| Resource Development | T1583 | Acquire Infrastructure | [evidence] |
| Initial Access | T1566 | Phishing | [evidence if observed] |
| Execution | [TXXXX] | [technique] | [evidence] |
| Persistence | [TXXXX] | [technique] | [evidence] |
| Defense Evasion | [TXXXX] | [technique] | [evidence] |
| Credential Access | [TXXXX] | [technique] | [evidence] |
| Discovery | [TXXXX] | [technique] | [evidence] |
| Collection | [TXXXX] | [technique] | [evidence] |
| Exfiltration | [TXXXX] | [technique] | [evidence] |
| Impact | [TXXXX] | [technique] | [evidence] |

TTP Pattern Analysis:
| Pattern | Techniques Involved | Actor Association |
|---------|---------------------|-------------------|
| [pattern name] | [technique IDs] | [known to use] |

Sub-Technique Details:
| Technique | Sub-Technique | Observation |
|-----------|---------------|-------------|
| [TXXXX] | [TXXXX.XXX] | [specific behavior] |

ATT&CK Navigator Export:
□ Techniques mapped: [count]
□ Tactics covered: [count of 14]
□ Unique to specific actors: [Y/N]
```

### 4. Campaign Correlation

Identify connections to known campaigns:

```
CAMPAIGN CORRELATION
====================

Campaign Database Search:
| Campaign | Time Period | Indicators Overlap | Match |
|----------|-------------|-------------------|-------|
| [Campaign 1] | [dates] | [overlapping IOCs] | [Y/N] |
| [Campaign 2] | [dates] | [overlapping IOCs] | [Y/N] |

Campaign Match Analysis:
| Campaign | Infrastructure Shared | TTP Overlap | Target Overlap |
|----------|----------------------|-------------|----------------|
| [Campaign] | [shared domains/IPs] | [shared techniques] | [similar victims] |

Historical Campaign Timeline:
| Date | Campaign | Actor | Relevance |
|------|----------|-------|-----------|
| [date] | [campaign] | [attributed to] | [connection found] |

Campaign Characteristics Comparison:
| Characteristic | Target | Known Campaign | Match |
|----------------|--------|----------------|-------|
| Targeting sector | [sector] | [sector] | [Y/N] |
| Geographic focus | [region] | [region] | [Y/N] |
| Operational tempo | [pattern] | [pattern] | [Y/N] |
| Tool usage | [tools] | [tools] | [Y/N] |

□ Campaign connection found: [Y/N]
□ Campaign confidence: [H/M/L]
□ Multiple campaigns: [Y/N]
```

### 5. Attribution Assessment

Build attribution hypothesis:

```
ATTRIBUTION ASSESSMENT
======================

Attribution Hypothesis:
| Hypothesis | Confidence | Supporting Evidence | Contradicting Evidence |
|------------|------------|---------------------|----------------------|
| [Primary hypothesis] | [H/M/L] | [evidence list] | [contrary evidence] |
| [Alternative 1] | [H/M/L] | [evidence] | [contrary] |
| [Alternative 2] | [H/M/L] | [evidence] | [contrary] |

Diamond Model Analysis:
```
                    ADVERSARY
                   [identified?]
                        |
    INFRASTRUCTURE ----+---- CAPABILITY
    [domains/IPs]      |     [tools/TTPs]
                        |
                     VICTIM
                   [target type]
```

| Diamond Element | Assessment | Confidence |
|-----------------|------------|------------|
| Adversary | [known/unknown/suspected] | [H/M/L] |
| Infrastructure | [characterized?] | [H/M/L] |
| Capability | [documented?] | [H/M/L] |
| Victim | [identified?] | [H/M/L] |

Attribution Confidence Factors:
| Factor | Assessment | Weight | Score |
|--------|------------|--------|-------|
| Technical evidence | [strength] | 25% | [score] |
| Operational patterns | [strength] | 20% | [score] |
| Geographic indicators | [strength] | 15% | [score] |
| Timing correlation | [strength] | 15% | [score] |
| Source reporting | [strength] | 15% | [score] |
| Historical consistency | [strength] | 10% | [score] |
| **ATTRIBUTION CONFIDENCE** | - | 100% | **[total]** |

Attribution Statement:
"Based on [evidence summary], this activity is assessed with [HIGH/MEDIUM/LOW] confidence to be associated with [actor/group/nation-state/unknown]. Key indicators include [top 3 indicators]. Alternative hypotheses include [alternatives]."

False Flag Assessment:
| Indicator | Potentially Planted | Analysis |
|-----------|---------------------|----------|
| [indicator] | [Y/N] | [assessment] |

□ Attribution hypothesis formed: [Y/N]
□ Confidence level: [H/M/L]
□ False flag considered: [Y/N]
```

### 6. Threat Correlation Summary

Compile threat intelligence findings:

```
THREAT CORRELATION SUMMARY
==========================

Threat Assessment:
| Dimension | Assessment | Confidence |
|-----------|------------|------------|
| Threat actor type | [APT/Criminal/Hacktivist/Unknown] | [H/M/L] |
| Attribution | [actor/unknown] | [H/M/L] |
| Motivation | [espionage/financial/disruption] | [H/M/L] |
| Capability | [sophisticated/moderate/basic] | [H/M/L] |
| Intent | [targeting/opportunistic] | [H/M/L] |

Key Threat Findings:
1. [Most significant threat finding]
2. [Second finding]
3. [Third finding]

Actor Profile Summary:
| Attribute | Assessment |
|-----------|------------|
| Actor/Group | [name or "Unknown"] |
| Type | [APT/Criminal/etc] |
| Origin | [country/region] |
| Motivation | [assessed motivation] |
| Capability | [level] |
| Active | [Y/N/Unknown] |

TTPs Summary:
| Tactic Category | Key Techniques | Notes |
|-----------------|----------------|-------|
| [category] | [techniques] | [observations] |

Campaign Connection:
| Campaign | Connection Strength | Evidence |
|----------|---------------------|----------|
| [campaign] | [strong/weak/none] | [key evidence] |

Risk Assessment:
| Risk Factor | Level | Basis |
|-------------|-------|-------|
| Current threat | [H/M/L/None] | [assessment] |
| Future targeting likelihood | [H/M/L] | [reasoning] |
| Compromise indicators | [Present/Absent] | [evidence] |

Handoffs for Phase 4:
| Agent | Data Provided |
|-------|---------------|
| Viper | [HUMINT targeting considerations] |
| Sigil | [SIGINT collection opportunities] |
| Specter | [Physical security considerations] |
```

---

## STEP 7 OUTPUT

```markdown
## THREAT CORRELATION SUMMARY

### Attribution Assessment
- Primary hypothesis: [actor/unknown]
- Confidence: [H/M/L]
- Actor type: [APT/Criminal/Hacktivist/Unknown]

### MITRE ATT&CK Coverage
- Techniques observed: [count]
- Tactics covered: [list]
- Actor-specific TTPs: [Y/N]

### Campaign Connection
- Related campaigns: [list or none]
- Connection confidence: [H/M/L]

### Threat Assessment
| Dimension | Assessment |
|-----------|------------|
| Capability | [level] |
| Motivation | [type] |
| Active threat | [Y/N] |

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Risk Level
- Current threat: [H/M/L/None]
- Targeting likelihood: [H/M/L]
- Recommended actions: [summary]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 4:
- [ ] All Phase 2 indicators aggregated
- [ ] Known actor matching complete
- [ ] MITRE ATT&CK mapping done
- [ ] Campaign correlation assessed
- [ ] Attribution hypothesis formed
- [ ] Confidence levels assigned
- [ ] Handoff prepared for operational planning

---

## PHASE 3 COMPLETE

Specialized threat analysis is complete. Proceed to Phase 4 for operational assessment.

---

## MENU OPTIONS

**[C] Continue** - Proceed to operational assessment (Step 8 - Phase 4)
**[A] Actor** - Deeper actor profiling
**[T] TTP** - Extended TTP analysis
**[C] Campaign** - Additional campaign research

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-08-operational-assessment.md`
