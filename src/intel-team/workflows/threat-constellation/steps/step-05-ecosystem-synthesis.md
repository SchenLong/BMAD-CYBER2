---
name: 'step-05-ecosystem-synthesis'
description: 'Relationship mapping, hierarchy identification, evolution timeline, predictive analysis'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
thisStepFile: '{workflow_path}/steps/step-05-ecosystem-synthesis.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-04-public-persona.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 5: Ecosystem Synthesis

## STEP GOAL

Synthesize all findings into a comprehensive threat actor ecosystem map including relationship mapping, hierarchy identification, evolution timeline, and predictive analysis for future activity.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Dossier**, Threat Actor Profiler
- You synthesize multi-source intelligence into ecosystem understanding
- You identify hierarchies and relationships
- You develop predictive assessments

### Analysis Protocol

- Integrate all findings from Steps 1-4
- Build comprehensive relationship map
- Identify hierarchies and power structures
- Construct ecosystem evolution timeline
- Develop predictive analysis
- Compile final ecosystem report

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Findings Integration

Consolidate all step findings:

```
FINDINGS INTEGRATION
====================

Step 1 - Actor Profile (Dossier):
| Finding Type | Key Data | Ecosystem Relevance |
|--------------|----------|---------------------|
| Identities | [aliases] | [for relationship mapping] |
| Campaigns | [campaign list] | [timeline events] |
| TTPs | [key TTPs] | [pattern matching] |
| MITRE ATT&CK | [technique count] | [capability comparison] |
| Motivation | [assessment] | [ecosystem positioning] |

Step 2 - Underground Network (Shadow):
| Finding Type | Key Data | Ecosystem Relevance |
|--------------|----------|---------------------|
| Forum presence | [forums/handles] | [reputation/relationships] |
| Marketplace | [vendor activity] | [business relationships] |
| Associates | [count/names] | [direct relationships] |
| Channels | [communication] | [coordination patterns] |
| Providers | [services used] | [supply chain] |

Step 3 - Infrastructure Correlation (Probe):
| Finding Type | Key Data | Ecosystem Relevance |
|--------------|----------|---------------------|
| Shared infra | [overlap] | [actor connections] |
| Tool reuse | [shared tools] | [supply relationships] |
| Code similarity | [matches] | [development links] |
| Op patterns | [correlations] | [group identification] |

Step 4 - Public Persona (Echo):
| Finding Type | Key Data | Ecosystem Relevance |
|--------------|----------|---------------------|
| Public claims | [channel/reach] | [ecosystem visibility] |
| Recruitment | [activity level] | [growth patterns] |
| Propaganda | [themes/effectiveness] | [ecosystem influence] |
| Sympathizers | [network size] | [support structure] |

□ All findings integrated: [Y/N]
□ Total actors identified: [count]
□ Total relationships mapped: [count]
```

### 2. Relationship Mapping

Build comprehensive relationship map:

```
RELATIONSHIP MAPPING
====================

Actor Inventory:
| Actor | Type | Status | Relationship to Target |
|-------|------|--------|------------------------|
| [Primary target] | [type] | [active] | SELF |
| [Actor 2] | [type] | [status] | [partner/customer/supplier] |
| [Actor 3] | [type] | [status] | [relationship] |

Relationship Matrix:
| From | To | Type | Strength | Evidence |
|------|-----|------|----------|----------|
| [Actor A] | [Actor B] | [business/personal/operational] | [strong/moderate/weak] | [basis] |
| [Actor A] | [Actor C] | [type] | [strength] | [evidence] |
| [Actor B] | [Actor C] | [type] | [strength] | [evidence] |

Relationship Types Identified:
| Type | Count | Examples |
|------|-------|----------|
| Business partners | [count] | [actor pairs] |
| Customer-vendor | [count] | [pairs] |
| Affiliate | [count] | [pairs] |
| Competitor | [count] | [pairs] |
| Former associate | [count] | [pairs] |
| Developer-operator | [count] | [pairs] |

Key Relationships:
| Relationship | Actors | Significance | Confidence |
|--------------|--------|--------------|------------|
| [most important] | [actors] | [why important] | [H/M/L] |
| [second] | [actors] | [significance] | [H/M/L] |
| [third] | [actors] | [significance] | [H/M/L] |

Relationship Graph:
```

```
                           ┌─────────────┐
                           │   ACTOR A   │
                           │  (TARGET)   │
                           └──────┬──────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   ACTOR B   │     │   ACTOR C   │     │   ACTOR D   │
       │  (Partner)  │     │ (Supplier)  │     │  (Customer) │
       └──────┬──────┘     └──────┬──────┘     └─────────────┘
              │                   │
              ▼                   ▼
       ┌─────────────┐     ┌─────────────┐
       │   ACTOR E   │     │   ACTOR F   │
       │ (Affiliate) │     │ (Developer) │
       └─────────────┘     └─────────────┘

Legend:
───── Strong relationship
- - - Moderate relationship
..... Weak/suspected relationship
```

```
□ Relationship map complete: [Y/N]
□ Total relationships: [count]
□ Key relationships: [count]
```

### 3. Hierarchy Identification

Identify power structures:

```
HIERARCHY IDENTIFICATION
========================

Organizational Structure:
| Level | Role | Actor(s) | Evidence |
|-------|------|----------|----------|
| Leadership | [decision maker] | [actor(s)] | [basis] |
| Management | [coordinator] | [actor(s)] | [basis] |
| Specialist | [developer/pentester] | [actor(s)] | [basis] |
| Operator | [execution] | [actor(s)] | [basis] |
| Affiliate | [partner] | [actor(s)] | [basis] |

Power Analysis:
| Actor | Power Score | Basis |
|-------|-------------|-------|
| [actor 1] | [high/medium/low] | [reputation/connections/capability] |
| [actor 2] | [score] | [basis] |

Influence Mapping:
| Actor | Influence Type | Scope | Evidence |
|-------|----------------|-------|----------|
| [actor] | [technical/financial/reputational] | [ecosystem-wide/limited] | [basis] |

Decision-Making Structure:
| Decision Type | Who Decides | Evidence |
|---------------|-------------|----------|
| Target selection | [actor(s)] | [claim patterns] |
| Ransom negotiation | [actor(s)] | [communications] |
| Tool development | [actor(s)] | [code attribution] |
| Recruitment | [actor(s)] | [posting patterns] |

Hierarchy Diagram:
```

```
                    ┌─────────────────────┐
                    │     LEADERSHIP      │
                    │   [Actor Name(s)]   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
           ┌────────┴────────┐   ┌────────┴────────┐
           │   DEVELOPERS    │   │   OPERATORS     │
           │ [Actor Names]   │   │ [Actor Names]   │
           └─────────────────┘   └────────┬────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                     ┌────────┴────────┐    ┌────────┴────────┐
                     │   AFFILIATES    │    │    SUPPORT     │
                     │ [Actor Names]   │    │ [Actor Names]   │
                     └─────────────────┘    └─────────────────┘
```

```
Group Boundaries:
| Group | Core Members | Peripheral | Boundary Definition |
|-------|--------------|------------|---------------------|
| [group] | [actors] | [actors] | [how determined] |

□ Hierarchy mapped: [Y/N]
□ Leadership identified: [Y/N]
□ Structure type: [hierarchical/flat/networked]
```

### 4. Ecosystem Evolution Timeline

Track ecosystem changes over time:

```
ECOSYSTEM EVOLUTION TIMELINE
============================

Major Events:
| Date | Event | Actors Involved | Impact |
|------|-------|-----------------|--------|
| [date] | [group formation] | [actors] | [ecosystem impact] |
| [date] | [major campaign] | [actors] | [impact] |
| [date] | [split/merger] | [actors] | [impact] |
| [date] | [arrest/takedown] | [actors] | [impact] |
| [date] | [rebranding] | [actors] | [impact] |

Evolution Phases:

PHASE 1: Origin ([dates])
- Formation event: [what started it]
- Initial actors: [who]
- Initial capability: [assessment]
- Initial focus: [targets/objectives]

PHASE 2: Growth ([dates])
- Key additions: [new actors/capabilities]
- Expansion: [geographic/technical]
- Notable campaigns: [major operations]
- Infrastructure development: [scale]

PHASE 3: Maturity ([dates])
- Established position: [ecosystem role]
- Stable relationships: [key partnerships]
- Operational tempo: [activity level]
- Reputation: [assessment]

PHASE 4: Current ([dates])
- Current state: [assessment]
- Recent changes: [what's different]
- Current activity: [level]
- Current focus: [objectives]

Capability Evolution:
| Period | Capability | Level | Evidence |
|--------|------------|-------|----------|
| [early] | [capability] | [basic/developing/advanced] | [campaigns] |
| [later] | [capability] | [level] | [evidence] |

Relationship Evolution:
| Period | Relationship | Change | Reason |
|--------|--------------|--------|--------|
| [date] | [actors] | [formed/strengthened/dissolved] | [cause] |

Ecosystem Timeline Visualization:
```

```
Timeline: [earliest year] ─────────────────────────────────────► [current]

[Year 1]        [Year 2]        [Year 3]        [Year 4]
    │               │               │               │
    ▼               ▼               ▼               ▼
┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐
│Origin │──────►│Growth │──────►│Maturity──────►│Current│
│       │       │       │       │       │       │       │
│Actor A│       │+Actor B       │+Actor C       │-Actor B
│formed │       │joined │       │partnership    │arrested
└───────┘       └───────┘       └───────┘       └───────┘
```

```
□ Timeline complete: [Y/N]
□ Evolution phases: [count]
□ Major events documented: [count]
```

### 5. Predictive Analysis

Assess future activity:

```
PREDICTIVE ANALYSIS
===================

Trend Analysis:
| Trend | Direction | Confidence | Basis |
|-------|-----------|------------|-------|
| Activity level | [increasing/stable/decreasing] | [H/M/L] | [evidence] |
| Target focus | [shifting to X] | [H/M/L] | [evidence] |
| Capability | [advancing/stable] | [H/M/L] | [evidence] |
| Ecosystem position | [strengthening/weakening] | [H/M/L] | [evidence] |

Likely Future Activity:
| Prediction | Probability | Timeframe | Basis |
|------------|-------------|-----------|-------|
| [prediction 1] | [high/medium/low] | [when] | [reasoning] |
| [prediction 2] | [probability] | [timeframe] | [basis] |
| [prediction 3] | [probability] | [timeframe] | [basis] |

Threat Assessment:
| Dimension | Current | Trend | 6-Month Outlook |
|-----------|---------|-------|-----------------|
| Capability | [level] | [direction] | [prediction] |
| Intent | [level] | [direction] | [prediction] |
| Opportunity | [level] | [direction] | [prediction] |

Potential Ecosystem Changes:
| Change | Likelihood | Trigger | Impact |
|--------|------------|---------|--------|
| [group split] | [H/M/L] | [what would cause] | [effect] |
| [new partnership] | [H/M/L] | [trigger] | [impact] |
| [capability jump] | [H/M/L] | [trigger] | [impact] |
| [takedown impact] | [H/M/L] | [trigger] | [impact] |

Key Indicators to Monitor:
| Indicator | What to Watch | Why Important |
|-----------|---------------|---------------|
| [indicator 1] | [what specifically] | [significance] |
| [indicator 2] | [what to watch] | [why] |

Defensive Recommendations:
| Recommendation | Priority | Rationale |
|----------------|----------|-----------|
| [action 1] | [P1/P2/P3] | [why] |
| [action 2] | [priority] | [rationale] |

□ Predictive analysis complete: [Y/N]
□ Predictions made: [count]
□ Confidence qualified: [Y/N]
```

### 6. Final Ecosystem Report

Compile comprehensive findings:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    THREAT CONSTELLATION REPORT

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
PREPARED BY: Intel Team

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Primary Subject: [threat actor name]
Ecosystem Size: [number of connected actors]
Analysis Confidence: [HIGH/MEDIUM/LOW]

Key Findings:
1. [Most critical ecosystem finding]
2. [Second critical finding]
3. [Third critical finding]

Threat Assessment: [Summary statement]

Primary Recommendations: [Key defensive actions]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 1: ACTOR PROFILES

═══════════════════════════════════════════════════════════════════════════════

[Actor profile cards from Step 1, summarized]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 2: UNDERGROUND NETWORK

═══════════════════════════════════════════════════════════════════════════════

[Underground presence and relationships from Step 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 3: INFRASTRUCTURE CORRELATION

═══════════════════════════════════════════════════════════════════════════════

[Technical correlations from Step 3]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 4: PUBLIC PRESENCE

═══════════════════════════════════════════════════════════════════════════════

[Public persona findings from Step 4]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 5: ECOSYSTEM MAP

═══════════════════════════════════════════════════════════════════════════════

5.1 Relationship Network
[Comprehensive relationship diagram]

5.2 Hierarchy Structure
[Organizational hierarchy]

5.3 Supply Chain
[Service provider relationships]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 6: EVOLUTION TIMELINE

═══════════════════════════════════════════════════════════════════════════════

[Complete ecosystem evolution timeline]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 7: THREAT ASSESSMENT

═══════════════════════════════════════════════════════════════════════════════

7.1 Current Threat Level
| Actor | Capability | Intent | Opportunity | Overall |
|-------|------------|--------|-------------|---------|

7.2 Predictive Assessment
[Future activity predictions]

7.3 Indicators to Monitor
[Key indicators for ongoing tracking]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 8: RECOMMENDATIONS

═══════════════════════════════════════════════════════════════════════════════

8.1 Immediate Actions
[Priority 1 defensive measures]

8.2 Ongoing Monitoring
[What to watch]

8.3 Further Investigation
[Recommended follow-up analysis]

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Full Relationship Network Diagram
Appendix B: Complete Timeline
Appendix C: Actor Profile Cards (Full)
Appendix D: MITRE ATT&CK Navigator Layers
Appendix E: IOC List
Appendix F: TTP Overlap Matrix
Appendix G: Source Documentation

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Threat Constellation
Steps Completed: 5/5
Agents Engaged: Dossier, Shadow, Probe, Echo

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 5 OUTPUT

```markdown
## THREAT CONSTELLATION COMPLETE

### Ecosystem Overview
- Primary actor: [name]
- Connected actors: [count]
- Total relationships: [count]

### Relationship Summary
| Relationship Type | Count |
|-------------------|-------|
| Business partners | [count] |
| Customer-vendor | [count] |
| Affiliates | [count] |
| Competitors | [count] |

### Hierarchy
- Structure type: [hierarchical/flat/networked]
- Leadership: [identified/unknown]
- Estimated size: [personnel count]

### Evolution
- Origin: [date]
- Current phase: [growth/maturity/decline]
- Key changes: [recent evolution]

### Threat Assessment
- Current threat: [HIGH/MEDIUM/LOW]
- Trend: [increasing/stable/decreasing]
- 6-month outlook: [assessment]

### Key Predictions
1. [Prediction 1 - probability]
2. [Prediction 2 - probability]
3. [Prediction 3 - probability]

### Priority Recommendations
1. [Most important defensive action]
2. [Second action]
3. [Third action]
```

---

## COMPLETION CRITERIA

Workflow complete when:

- [ ] All Step 1-4 findings integrated
- [ ] Relationship map complete
- [ ] Hierarchy identified
- [ ] Evolution timeline built
- [ ] Predictive analysis complete
- [ ] Final report compiled
- [ ] Recommendations developed

---

## MENU OPTIONS

**[E] Export** - Export full ecosystem report
**[G] Graph** - Export relationship graph
**[N] Navigator** - Export ATT&CK Navigator layers
**[T] Timeline** - Export evolution timeline

---

## WORKFLOW COMPLETE

Threat Constellation workflow complete.

Recommended follow-on based on findings:

- For specific actors → Consider **Operation Mosaic** for comprehensive targeting
- For infrastructure clusters → Consider **Infrastructure Genealogy** for deeper analysis
- For defensive purposes → Consider **Counter-Intel Audit** for organizational assessment
- For ongoing monitoring → Consider **Tripwire** workflow (when available)
