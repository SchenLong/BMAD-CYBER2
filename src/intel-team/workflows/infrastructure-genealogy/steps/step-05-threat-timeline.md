---
name: 'step-05-threat-timeline'
description: 'Connect to known threat actors, build complete infrastructure timeline, attribution assessment'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/infrastructure-genealogy'
thisStepFile: '{workflow_path}/steps/step-05-threat-timeline.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-04-underground-connections.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 5: Threat Correlation & Timeline

## STEP GOAL

Connect infrastructure findings to known threat actors, build a complete infrastructure timeline integrating all previous steps, and produce a final attribution assessment with confidence levels.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Dossier**, Threat Actor Profiler
- You specialize in threat intelligence and attribution analysis
- You correlate infrastructure to known campaigns and actors
- You build comprehensive timelines for investigative synthesis

### Analysis Protocol

- Review all findings from Steps 1-4
- Correlate infrastructure to known threat actors
- Build integrated chronological timeline
- Apply Diamond Model attribution
- Assess attribution confidence
- Produce final genealogy report

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Findings Integration

Consolidate all previous step findings:

```
FINDINGS INTEGRATION
====================

Step 1 - Ownership Archaeology (Resolver):
| Finding | Data | Relevance |
|---------|------|-----------|
| Registrant history | [from Step 1] | [for correlation] |
| Domain transfers | [from Step 1] | [timeline events] |
| Related domains | [from Step 1] | [infrastructure scope] |
| Privacy service usage | [from Step 1] | [obfuscation indicator] |

Step 2 - Technical Evolution (Probe):
| Finding | Data | Relevance |
|---------|------|-----------|
| IP history | [from Step 2] | [hosting patterns] |
| Technology changes | [from Step 2] | [capability evolution] |
| Certificate history | [from Step 2] | [infrastructure map] |
| Service evolution | [from Step 2] | [operational changes] |

Step 3 - Corporate Ownership (Proxy):
| Finding | Data | Relevance |
|---------|------|-----------|
| Entity chain | [from Step 3] | [ownership obfuscation] |
| Officer history | [from Step 3] | [personnel correlation] |
| Related entities | [from Step 3] | [network expansion] |
| Financial indicators | [from Step 3] | [motivation clues] |

Step 4 - Underground Connections (Shadow):
| Finding | Data | Relevance |
|---------|------|-----------|
| Malware associations | [from Step 4] | [threat correlation] |
| Phishing history | [from Step 4] | [campaign links] |
| Forum mentions | [from Step 4] | [actor connections] |
| BPH indicators | [from Step 4] | [operational security] |

□ All findings integrated: [Y/N]
□ Correlation points identified: [count]
□ Timeline events collected: [count]
```

### 2. Threat Actor Correlation

Correlate infrastructure to known actors:

```
THREAT ACTOR CORRELATION
========================

Known Actor Search:
| Actor/Group | Correlation Evidence | Confidence |
|-------------|---------------------|------------|
| [actor 1] | [matching indicators] | [H/M/L] |
| [actor 2] | [evidence] | [H/M/L] |

TTP Matching:
| Observed TTP | Matching Actor(s) | MITRE ATT&CK |
|--------------|-------------------|--------------|
| [technique] | [actors using] | [technique ID] |
| [technique] | [actors] | [ID] |

Infrastructure Overlap:
| Our Indicator | Known Actor Infrastructure | Match Type |
|---------------|---------------------------|------------|
| [domain/IP] | [actor's known infra] | [exact/similar] |

Tool/Malware Correlation:
| Tool/Malware | Associated Actor(s) | Our Evidence |
|--------------|---------------------|--------------|
| [malware] | [actors] | [how connected] |

Campaign Linkage:
| Campaign | Actor | Time Period | Our Correlation |
|----------|-------|-------------|-----------------|
| [campaign] | [actor] | [dates] | [matching elements] |

Previous Target Overlap:
| Prior Target | Actor | Connection to Our Infra |
|--------------|-------|-------------------------|
| [target] | [actor] | [shared infrastructure] |

□ Actor correlations found: [count]
□ Campaign matches: [count]
□ Strongest correlation: [actor - confidence]
```

### 3. Diamond Model Analysis

Apply Diamond Model for attribution:

```
DIAMOND MODEL ANALYSIS
======================

ADVERSARY
---------
Known Identity: [identified actor/group or "Unknown"]
Aliases: [known aliases]
Attribution Basis:
| Evidence Type | Evidence | Weight |
|---------------|----------|--------|
| Infrastructure overlap | [evidence] | [H/M/L] |
| TTP matching | [evidence] | [H/M/L] |
| Tool/malware | [evidence] | [H/M/L] |
| Timing correlation | [evidence] | [H/M/L] |
| Underground connection | [evidence] | [H/M/L] |

INFRASTRUCTURE
--------------
Primary Assets:
| Asset | Type | Role | Period |
|-------|------|------|--------|
| [domain/IP] | [domain/IP/ASN] | [C2/staging/etc] | [dates] |

Supporting Assets:
| Asset | Relationship | Purpose |
|-------|--------------|---------|
| [asset] | [how related] | [function] |

CAPABILITY
----------
Technical Capabilities Demonstrated:
| Capability | Evidence | Sophistication |
|------------|----------|----------------|
| [capability] | [from analysis] | [basic/moderate/advanced] |

Operational Capabilities:
| Capability | Evidence | Assessment |
|------------|----------|------------|
| Persistence | [evidence] | [level] |
| OpSec | [evidence] | [level] |
| Scale | [evidence] | [level] |

VICTIM(S)
---------
Known Targets (from historical data):
| Target Type | Count | Time Period |
|-------------|-------|-------------|
| [industry/sector] | [count] | [dates] |

Targeting Patterns:
| Pattern | Evidence | Notes |
|---------|----------|-------|
| [geographic] | [targets] | [assessment] |
| [sector] | [targets] | [assessment] |

DIAMOND MODEL DIAGRAM:
```

```
                    ADVERSARY
                   [Identity]
                       │
           ┌──────────┴──────────┐
           ▼                     ▼
    INFRASTRUCTURE          CAPABILITY
    [Assets List]          [Skills Level]
           │                     │
           └──────────┬──────────┘
                      ▼
                  VICTIM(S)
               [Target Profile]
```

### 4. Complete Infrastructure Timeline

Build integrated chronological timeline:

```
COMPLETE INFRASTRUCTURE TIMELINE
================================

Phase 1: Origin ([earliest date] - [date])
| Date | Event | Source | Significance |
|------|-------|--------|--------------|
| [date] | Domain registered | Step 1 | Infrastructure creation |
| [date] | First hosting | Step 2 | Initial deployment |
| [date] | [event] | [step] | [significance] |

Phase 2: Development ([date] - [date])
| Date | Event | Source | Significance |
|------|-------|--------|--------------|
| [date] | [expansion/change] | [step] | [meaning] |
| [date] | [technical change] | [step] | [meaning] |

Phase 3: Operational Use ([date] - [date])
| Date | Event | Source | Significance |
|------|-------|--------|--------------|
| [date] | [campaign activity] | Step 4 | [threat correlation] |
| [date] | [abuse reported] | Step 4 | [detection indicator] |

Phase 4: Evolution/Pivot ([date] - [date])
| Date | Event | Source | Significance |
|------|-------|--------|--------------|
| [date] | [ownership change] | Step 1/3 | [transfer/sale] |
| [date] | [hosting change] | Step 2 | [operational shift] |

Phase 5: Current State ([date] - Present)
| Date | Event | Source | Significance |
|------|-------|--------|--------------|
| [date] | [current status] | [source] | [assessment] |

Key Transitions:
| From State | To State | Trigger | Date |
|------------|----------|---------|------|
| [state] | [state] | [cause] | [date] |

Timeline Gaps:
| Period | Missing Information | Impact |
|--------|---------------------|--------|
| [dates] | [what's unknown] | [how it affects analysis] |

□ Timeline complete: [Y/N]
□ Events documented: [count]
□ Gaps identified: [count]
```

### 5. Attribution Assessment

Final attribution determination:

```
ATTRIBUTION ASSESSMENT
======================

Primary Attribution:
| Element | Assessment | Confidence | Basis |
|---------|------------|------------|-------|
| Actor/Group | [identified or unknown] | [H/M/L] | [evidence summary] |
| Nation-State | [country or unknown] | [H/M/L] | [basis] |
| Motivation | [financial/espionage/etc] | [H/M/L] | [basis] |
| Skill Level | [script kiddie to APT] | [H/M/L] | [basis] |

Alternative Hypotheses:
| Alternative | Supporting Evidence | Against Evidence | Probability |
|-------------|---------------------|------------------|-------------|
| [alt actor] | [for] | [against] | [%] |
| [alt motive] | [for] | [against] | [%] |

Confidence Limiting Factors:
| Factor | Impact | Can Be Resolved? |
|--------|--------|------------------|
| [factor] | [how it limits confidence] | [Y/N - how] |

Attribution Strength:
□ Direct evidence (compromised actor systems): [Y/N]
□ Strong circumstantial (multiple independent indicators): [Y/N]
□ Moderate circumstantial (some correlated indicators): [Y/N]
□ Weak (single source or tenuous connection): [Y/N]

Overall Attribution Confidence: [HIGH/MEDIUM/LOW]
Confidence Statement: [narrative explanation]
```

### 6. Final Genealogy Report

Compile comprehensive findings:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    INFRASTRUCTURE GENEALOGY REPORT

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
PREPARED BY: Intel Team

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Primary Target: [domain/IP/infrastructure]
Investigation Period: [dates covered]
Overall Confidence: [HIGH/MEDIUM/LOW]

Key Findings:
1. [Most critical finding about infrastructure history]
2. [Second critical finding]
3. [Third critical finding]

Attribution: [Actor/group if attributed, or "Unattributed"]
Current Status: [Active/Inactive/Repurposed]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 1: OWNERSHIP HISTORY

═══════════════════════════════════════════════════════════════════════════════

1.1 Registration Timeline
[Chronological ownership from Step 1]

1.2 Registrant Evolution
[Who owned when, privacy services used]

1.3 Related Domain Network
[Connected domains discovered]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 2: TECHNICAL EVOLUTION

═══════════════════════════════════════════════════════════════════════════════

2.1 Hosting History
[IP and hosting provider timeline from Step 2]

2.2 Technology Stack Changes
[How the infrastructure evolved technically]

2.3 Infrastructure Scale
[Certificates, subdomains, services]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 3: CORPORATE CHAIN

═══════════════════════════════════════════════════════════════════════════════

3.1 Entity Ownership
[Corporate ownership chain from Step 3]

3.2 Key Personnel
[Officers/directors with infrastructure connection]

3.3 Corporate Network
[Related entities and subsidiaries]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 4: THREAT HISTORY

═══════════════════════════════════════════════════════════════════════════════

4.1 Malicious Activity
[Malware, phishing, abuse history from Step 4]

4.2 Underground Connections
[Forum mentions, marketplace activity]

4.3 Hosting Assessment
[BPH indicators, abuse tolerance]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 5: ATTRIBUTION

═══════════════════════════════════════════════════════════════════════════════

5.1 Diamond Model Analysis
[Summary of adversary-capability-infrastructure-victim analysis]

5.2 Actor Correlation
[Matching to known threat actors]

5.3 Attribution Assessment
[Final attribution with confidence]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 6: COMPLETE TIMELINE

═══════════════════════════════════════════════════════════════════════════════

[Visual or tabular timeline integrating all phases]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 7: CONCLUSIONS

═══════════════════════════════════════════════════════════════════════════════

7.1 Key Judgments
1. [Judgment with confidence level]
2. [Judgment with confidence level]
3. [Judgment with confidence level]

7.2 Current Risk Assessment
| Risk Dimension | Level | Rationale |
|----------------|-------|-----------|
| Current threat | [H/M/L] | [basis] |
| Reuse potential | [H/M/L] | [basis] |
| Association risk | [H/M/L] | [basis] |

7.3 Intelligence Gaps
[What we couldn't determine]

7.4 Recommendations
[Suggested follow-up actions]

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Infrastructure Genealogy Diagram
Appendix B: Complete Timeline
Appendix C: IOC List
Appendix D: Diamond Model Diagram
Appendix E: Source Documentation

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Infrastructure Genealogy
Steps Completed: 5/5
Agents Engaged: Resolver, Probe, Proxy, Shadow, Dossier

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 5 OUTPUT

```markdown
## INFRASTRUCTURE GENEALOGY COMPLETE

### Investigation Summary
- Target: [primary infrastructure identifier]
- Investigation period: [date range]
- Steps completed: 5/5

### Ownership Chain
| Period | Owner/Registrant | Entity |
|--------|------------------|--------|
| [dates] | [registrant] | [company if known] |

### Technical Evolution
| Period | Hosting | Key Tech |
|--------|---------|----------|
| [dates] | [provider] | [stack] |

### Threat Correlation
| Actor/Campaign | Confidence | Evidence Basis |
|----------------|------------|----------------|
| [actor] | [H/M/L] | [summary] |

### Attribution Assessment
- Primary attribution: [actor/group or "Unattributed"]
- Confidence: [HIGH/MEDIUM/LOW]
- Motivation: [assessed motivation]

### Key Findings
1. [Most important finding]
2. [Second finding]
3. [Third finding]

### Current Risk
- Active threat: [Y/N]
- Risk level: [H/M/L]
- Recommended action: [summary]

### Intelligence Gaps
- [Gap 1]
- [Gap 2]
```

---

## COMPLETION CRITERIA

Workflow complete when:

- [ ] All Step 1-4 findings integrated
- [ ] Threat actor correlation complete
- [ ] Diamond Model analysis applied
- [ ] Complete timeline built
- [ ] Attribution assessment made
- [ ] Final report compiled
- [ ] Confidence levels assigned throughout

---

## MENU OPTIONS

**[E] Export** - Export full genealogy report
**[T] Timeline** - Visual timeline only
**[A] Attribution** - Detailed attribution analysis
**[R] Related** - Explore related infrastructure

---

## WORKFLOW COMPLETE

Infrastructure Genealogy workflow complete.

Recommended follow-on based on findings:

- If attribution made → Consider **Threat Constellation** for actor ecosystem mapping
- If active threat → Consider **Counter-Intel Audit** for defensive assessment
- If campaign identified → Consider **Operation Mosaic** for comprehensive targeting
