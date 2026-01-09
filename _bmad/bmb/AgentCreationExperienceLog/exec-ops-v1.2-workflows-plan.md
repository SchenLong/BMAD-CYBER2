# Executive Operations Module - v1.2 Workflows Implementation Plan

**Module ID:** exec-ops
**Version:** 1.2.0 (Additional Workflows Release)
**Created:** 2026-01-09
**Based On:** v1.1.0 workflows release + overlap analysis

---

## Executive Summary

This document provides the implementation plan for exec-ops v1.2 workflows. Following overlap analysis with v1.1, we identified 5 unique workflows that provide distinct value without duplicating existing capabilities.

**Removed from consideration (overlap with v1.1):**
- Pre-Mortem Analysis (covered in Strategic Decision Workshop Step 6)
- Coalition Building Strategy (covered in Stakeholder Negotiation Prep)
- Debate Preparation (covered in Strategic Decision Workshop Step 5)
- Executive Communication Strategy (covered across Board Presentation + Crisis Response)
- Organizational Change Management (partial coverage in Policy Development)

**v1.2 Scope:**
- 5 Unique Workflows
- Full Party Mode integration
- Step-file architecture per BMAD standards
- Enhancement: Workflow chaining support

---

## Workflow Portfolio Summary

| # | Workflow ID | Display Name | Complexity | Primary Agents | Steps |
|---|-------------|--------------|------------|----------------|-------|
| 1 | competitive-warfare | Competitive Warfare | High | Sun, Musashi, Magnus, Augustus | 7 |
| 2 | political-risk-assessment | Political Risk Assessment | Medium | Niccolo, Magnus, Augustus | 6 |
| 3 | ethical-dilemma-resolution | Ethical Dilemma Resolution | Medium | Sophia, Jean-Luc, Burke, Charles | 7 |
| 4 | leadership-philosophy | Leadership Philosophy Development | Medium | Jean-Luc, Athena-proxy, All Archetypes | 6 |
| 5 | conflict-resolution | Conflict Resolution | Medium | Geneva, Sophia, Cicero | 6 |

**Total Steps to Build:** ~32 step files + 5 workflow.md files + templates

---

## Workflow 1: Competitive Warfare

**ID:** competitive-warfare
**Display Name:** Strategic Competitive Warfare
**Description:** Strategic competitive warfare planning for high-stakes business battles
**Complexity:** High
**Primary Agents:** Sun (lead), Musashi, Magnus, Augustus

### Purpose

Guide executives through comprehensive competitive strategy development, from intelligence gathering to tactical execution planning. Goes beyond simple competitive analysis to full strategic warfare planning.

### Why This is Unique

- v1.1 has no dedicated competitive focus
- Leverages Sun + Musashi strategic archetypes specifically
- Produces actionable battle plans, not just analysis

### Steps

| Step | File | Goal | Lead Agent |
|------|------|------|------------|
| 1 | step-01-init.md | Define competitive context, target competitor(s), stakes | Facilitator |
| 2 | step-02-terrain-mapping.md | Map competitive landscape (Sun's terrain analysis) | Sun |
| 3 | step-03-intelligence-gathering.md | Gather competitive intelligence, identify gaps | Augustus |
| 4 | step-04-strength-weakness.md | Analyze relative strengths/weaknesses (SWOT++) | Magnus |
| 5 | step-05-timing-analysis.md | Assess timing and windows of opportunity | Musashi |
| 6 | step-06-strategy-selection.md | Select strategic approach (direct, indirect, flanking) | Sun |
| 7 | step-07-battle-plan.md | Compile tactical battle plan with contingencies | All |

### Output Template

`competitive-warfare-[competitor].md`

```markdown
---
workflow: competitive-warfare
competitor: {name}
created: {date}
status: draft
---

# Competitive Warfare Plan: {Competitor}

## Executive Summary
[One paragraph strategic assessment]

## Competitive Terrain
[Market landscape, positions, dynamics]

## Intelligence Summary
[What we know, confidence levels, gaps]

## Relative Position Analysis
[Strengths, weaknesses, opportunities, threats]

## Strategic Windows
[Timing opportunities identified]

## Recommended Strategy
[Primary approach with rationale]

## Battle Plan
[Tactical actions, timeline, owners]

## Contingencies
[If-then scenarios]

## Success Metrics
[How we'll know we're winning]
```

---

## Workflow 2: Political Risk Assessment

**ID:** political-risk-assessment
**Display Name:** Political Risk Assessment
**Description:** Evaluate political risks in strategic decisions and initiatives
**Complexity:** Medium
**Primary Agents:** Niccolo (lead), Magnus, Augustus

### Purpose

Systematically identify and assess political risks (internal organizational politics and external political/regulatory) that could derail initiatives or decisions.

### Why This is Unique

- Stakeholder Negotiation Prep focuses on influencing stakeholders
- This focuses on risk identification and mitigation
- Niccolo's realist perspective is central (vs Geneva's mediation focus)

### Steps

| Step | File | Goal | Lead Agent |
|------|------|------|------------|
| 1 | step-01-init.md | Define initiative, scope political context | Facilitator |
| 2 | step-02-power-mapping.md | Map power structures and influence networks | Magnus |
| 3 | step-03-interest-analysis.md | Identify hidden interests and motivations | Niccolo |
| 4 | step-04-risk-identification.md | Enumerate political risks (internal + external) | Niccolo |
| 5 | step-05-probability-impact.md | Assess likelihood and impact of each risk | Augustus |
| 6 | step-06-mitigation-plan.md | Develop mitigation strategies per risk | All |

### Output Template

`political-risk-assessment-[initiative].md`

```markdown
---
workflow: political-risk-assessment
initiative: {name}
created: {date}
status: draft
---

# Political Risk Assessment: {Initiative}

## Executive Summary
[Overall risk posture]

## Power Structure Analysis
[Key power holders, influence networks]

## Hidden Interests Map
[Stakeholder motivations beyond stated positions]

## Risk Register

| Risk | Type | Probability | Impact | Severity | Mitigation |
|------|------|-------------|--------|----------|------------|
| ... | Internal/External | H/M/L | H/M/L | Score | Strategy |

## High-Priority Risks
[Detailed analysis of top 3-5 risks]

## Mitigation Plan
[Strategies organized by risk]

## Early Warning Indicators
[Signs that risks are materializing]

## Recommendation
[Proceed / Proceed with caution / Delay / Abandon]
```

---

## Workflow 3: Ethical Dilemma Resolution

**ID:** ethical-dilemma-resolution
**Display Name:** Ethical Dilemma Resolution
**Description:** Navigate complex ethical dilemmas with structured multi-perspective analysis
**Complexity:** Medium
**Primary Agents:** Sophia (lead), Jean-Luc, Burke, Charles

### Purpose

Guide executives through genuine ethical dilemmas where values conflict, providing structured framework for resolution without being preachy or prescriptive.

### Why This is Unique

- Strategic Decision Workshop has quick ethics check (Step 6)
- This is deep-dive for genuinely difficult ethical situations
- Multiple ethical frameworks applied systematically
- Sophia leads (vs supporting role in SDW)

### Steps

| Step | File | Goal | Lead Agent |
|------|------|------|------------|
| 1 | step-01-init.md | Frame the dilemma, identify conflicting values | Facilitator |
| 2 | step-02-stakeholder-impact.md | Map who bears costs and benefits | Sophia |
| 3 | step-03-framework-analysis.md | Apply multiple ethical frameworks | Sophia |
| 4 | step-04-tradition-perspective.md | What does wisdom/tradition counsel? | Burke |
| 5 | step-05-justice-perspective.md | What does justice/liberation require? | Charles |
| 6 | step-06-principled-synthesis.md | Synthesize toward principled resolution | Jean-Luc |
| 7 | step-07-decision-document.md | Document reasoning and decision | All |

### Ethical Frameworks Applied (Step 3)

- **Utilitarian**: Greatest good for greatest number
- **Deontological**: Duty-based, categorical imperatives
- **Virtue Ethics**: What would a person of character do?
- **Care Ethics**: Responsibilities to relationships
- **Justice/Fairness**: Rawlsian veil of ignorance

### Output Template

`ethical-resolution-[dilemma].md`

```markdown
---
workflow: ethical-dilemma-resolution
dilemma: {short_name}
created: {date}
status: draft
---

# Ethical Resolution: {Dilemma Title}

## The Dilemma
[Clear statement of the ethical conflict]

## Values in Tension
[Which principles/values conflict]

## Stakeholder Impact Analysis
| Stakeholder | Potential Benefit | Potential Harm | Voice in Decision |
|-------------|-------------------|----------------|-------------------|

## Framework Analysis

### Utilitarian Perspective
[What outcome produces greatest good?]

### Deontological Perspective
[What duties apply? What rules should we follow?]

### Virtue Ethics Perspective
[What would a person of integrity do?]

### Care Ethics Perspective
[What do our relationships require?]

### Justice Perspective
[What is fair? Who is vulnerable?]

## Traditional Wisdom (Burke)
[What does accumulated wisdom counsel?]

## Justice Imperative (Charles)
[What does moral courage require?]

## Principled Resolution (Jean-Luc)
[Synthesis toward decision]

## Decision & Rationale
[The resolution with clear reasoning]

## Dissenting Considerations
[What we're sacrificing, ongoing tensions]

## Implementation Notes
[How to execute ethically]
```

---

## Workflow 4: Leadership Philosophy Development

**ID:** leadership-philosophy
**Display Name:** Leadership Philosophy Development
**Description:** Develop personal leadership philosophy through dialogue with historical archetypes
**Complexity:** Medium
**Primary Agents:** Jean-Luc (lead), All 8 Historical Archetypes

### Purpose

Help executives articulate their personal leadership philosophy by engaging in dialogue with diverse leadership archetypes, crystallizing values, principles, and approach.

### Why This is Unique

- No current workflow focused on personal development
- Uses archetypes as mentors/dialogue partners
- Produces personal leadership document
- Highly reflective vs action-oriented

### Steps

| Step | File | Goal | Lead Agent |
|------|------|------|------------|
| 1 | step-01-init.md | Explore leadership journey, influences, context | Jean-Luc |
| 2 | step-02-values-exploration.md | Identify core values through archetype dialogue | All Archetypes |
| 3 | step-03-leadership-style.md | Assess natural style and growth edges | Jean-Luc |
| 4 | step-04-principles.md | Crystallize guiding principles | User + Archetypes |
| 5 | step-05-legacy-vision.md | Define desired leadership legacy | Charles |
| 6 | step-06-philosophy-document.md | Compile personal leadership philosophy | Jean-Luc |

### Archetype Dialogue (Step 2)

Each archetype poses a question to the user:

- **Niccolo**: "What will you do when ethics and effectiveness conflict?"
- **Charles**: "What cause would you sacrifice your career for?"
- **Maximilien**: "What injustice in your organization can you no longer tolerate?"
- **Burke**: "What traditions do you feel obligated to preserve?"
- **Lee**: "What inefficiencies are you unwilling to accept?"
- **Musashi**: "When do you know it's time to act?"
- **Sun**: "How do you win without creating enemies?"
- **Jean-Luc**: "What principles will you never compromise?"

### Output Template

`leadership-philosophy-[name].md`

```markdown
---
workflow: leadership-philosophy
leader: {name}
created: {date}
status: draft
---

# Leadership Philosophy: {Name}

## My Leadership Journey
[Key experiences that shaped me]

## Core Values
[3-5 fundamental values with meaning]

## Guiding Principles
[5-7 principles that guide decisions]

## Leadership Style
[Self-assessment of natural approach]

## Growth Edges
[Areas for continued development]

## What I Stand For
[Non-negotiables]

## What I Stand Against
[What I will not tolerate]

## My Leadership Legacy
[What I want to be remembered for]

## Commitment
[Personal commitment statement]

---
*Developed through dialogue with: [Archetypes consulted]*
```

---

## Workflow 5: Conflict Resolution

**ID:** conflict-resolution
**Display Name:** Workplace Conflict Resolution
**Description:** Navigate workplace conflicts with structured mediation and resolution strategies
**Complexity:** Medium
**Primary Agents:** Geneva (lead), Sophia, Cicero

### Purpose

Guide executives through resolving workplace conflicts (interpersonal, team, departmental) using principled negotiation and mediation frameworks.

### Why This is Unique

- Stakeholder Negotiation Prep is external-facing (deals, negotiations)
- This is internal conflict between parties
- Geneva's mediation skills central (vs supporting role)
- Focus on relationship preservation

### Steps

| Step | File | Goal | Lead Agent |
|------|------|------|------------|
| 1 | step-01-init.md | Understand conflict context, parties, history | Facilitator |
| 2 | step-02-perspective-gathering.md | Understand each party's perspective | Geneva |
| 3 | step-03-interests-positions.md | Separate interests from positions | Geneva |
| 4 | step-04-common-ground.md | Identify shared interests and values | Sophia |
| 5 | step-05-solution-generation.md | Generate win-win options | Cicero |
| 6 | step-06-resolution-plan.md | Develop resolution agreement and follow-up | Geneva |

### Output Template

`conflict-resolution-[situation].md`

```markdown
---
workflow: conflict-resolution
situation: {short_name}
parties: [party_a, party_b]
created: {date}
status: draft
---

# Conflict Resolution: {Situation}

## Conflict Summary
[Nature of the conflict]

## Parties Involved
| Party | Role | Stated Position | Underlying Interest |
|-------|------|-----------------|---------------------|

## Conflict History
[How we got here]

## Perspective Analysis

### Party A Perspective
[Their view, concerns, needs]

### Party B Perspective
[Their view, concerns, needs]

## Common Ground
[Shared interests, values, goals]

## Points of Tension
[Where interests genuinely conflict]

## Resolution Options
| Option | Addresses A's Interests | Addresses B's Interests | Feasibility |
|--------|-------------------------|-------------------------|-------------|

## Recommended Resolution
[Primary recommendation with rationale]

## Agreement Terms
[Specific commitments from each party]

## Follow-up Plan
[Check-ins, accountability, escalation path]

## Relationship Restoration
[Steps to rebuild trust]
```

---

## Implementation Phases

| Phase | Epic | Stories | Description |
|-------|------|---------|-------------|
| 0 | Foundation | 2 | Additional templates, shared resources |
| 1 | Competitive Warfare | 4 | workflow.md + 7 steps |
| 2 | Political Risk Assessment | 3 | workflow.md + 6 steps |
| 3 | Ethical Dilemma Resolution | 4 | workflow.md + 7 steps |
| 4 | Leadership Philosophy | 3 | workflow.md + 6 steps |
| 5 | Conflict Resolution | 3 | workflow.md + 6 steps |
| 6 | Integration & Testing | 3 | Testing, registration, documentation |
| 7 | Production Release | 2 | Cleanup, commit, tag v1.2.0 |

**Total Stories:** ~24

---

## Epic 0: Foundation Additions

### Story 0.1: Create Additional Output Templates

**Tasks:**
1. Create `competitive-warfare-template.md`
2. Create `political-risk-template.md`
3. Create `ethical-resolution-template.md`
4. Create `leadership-philosophy-template.md`
5. Create `conflict-resolution-template.md`

**Location:** `_bmad/exec-ops/workflows/_shared/templates/`

### Story 0.2: Update Agent Roster for v1.2

**Tasks:**
1. Update `agent-roster.md` with workflow-specific guidance
2. Add "best for" recommendations per new workflow
3. Document archetype question bank for Leadership Philosophy

---

## Epic 1: Competitive Warfare Workflow

### Story 1.1: Create Competitive Warfare - workflow.md

Create main workflow definition following BMAD template.

### Story 1.2: Create Steps 01-03 (Context, Terrain, Intelligence)

Build first three steps focusing on information gathering phase.

### Story 1.3: Create Steps 04-05 (Analysis, Timing)

Build analysis steps with Magnus and Musashi.

### Story 1.4: Create Steps 06-07 (Strategy, Battle Plan)

Build strategic selection and tactical planning steps.

---

## Epic 2: Political Risk Assessment Workflow

### Story 2.1: Create Political Risk Assessment - workflow.md

Create main workflow definition.

### Story 2.2: Create Steps 01-03 (Init, Power, Interests)

Build setup and analysis steps.

### Story 2.3: Create Steps 04-06 (Risks, Assessment, Mitigation)

Build risk identification and planning steps.

---

## Epic 3: Ethical Dilemma Resolution Workflow

### Story 3.1: Create Ethical Dilemma Resolution - workflow.md

Create main workflow definition.

### Story 3.2: Create Steps 01-03 (Frame, Impact, Frameworks)

Build framing and analysis steps.

### Story 3.3: Create Steps 04-05 (Tradition, Justice)

Build archetype perspective steps.

### Story 3.4: Create Steps 06-07 (Synthesis, Document)

Build resolution and documentation steps.

---

## Epic 4: Leadership Philosophy Workflow

### Story 4.1: Create Leadership Philosophy - workflow.md

Create main workflow definition.

### Story 4.2: Create Steps 01-03 (Journey, Values, Style)

Build exploration steps.

### Story 4.3: Create Steps 04-06 (Principles, Legacy, Document)

Build crystallization and documentation steps.

---

## Epic 5: Conflict Resolution Workflow

### Story 5.1: Create Conflict Resolution - workflow.md

Create main workflow definition.

### Story 5.2: Create Steps 01-03 (Context, Perspectives, Interests)

Build understanding steps.

### Story 5.3: Create Steps 04-06 (Common Ground, Solutions, Plan)

Build resolution steps.

---

## Epic 6: Integration & Testing

### Story 6.1: Register All v1.2 Workflows

Add command wrappers for all 5 new workflows.

### Story 6.2: Test All Workflows End-to-End

Run each workflow, verify output quality.

### Story 6.3: Update Module Documentation

Update README with v1.2 workflows.

---

## Epic 7: Production Release

### Story 7.1: Final Verification & Cleanup

Count files, remove artifacts, verify no placeholders.

### Story 7.2: Git Commit & Tag v1.2.0

Stage, commit, tag release.

---

## Success Metrics

### v1.2 Workflow Criteria
- [ ] All 5 workflows load and run via commands
- [ ] All workflows produce correctly formatted output files
- [ ] Party Mode correctly orchestrates designated agents
- [ ] Each workflow provides unique value (no redundancy with v1.1)
- [ ] Output artifacts are board-ready quality

### Differentiation Verification
- [ ] Competitive Warfare distinct from Strategic Planning Session
- [ ] Political Risk Assessment distinct from Stakeholder Negotiation Prep
- [ ] Ethical Dilemma Resolution deeper than SDW Step 6
- [ ] Leadership Philosophy is personal development focused
- [ ] Conflict Resolution is internal-facing mediation

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Overlap with v1.1 not fully eliminated | Low | Medium | Clear differentiation documented above |
| Leadership Philosophy too "soft" | Medium | Low | Frame as executive effectiveness tool |
| Ethical workflow seen as preachy | Medium | High | Sophia persona: illuminate, don't mandate |
| Competitive Warfare too aggressive | Low | Medium | Focus on business competition, not warfare |

---

## Estimated Effort

| Epic | Est. Time |
|------|-----------|
| 0 - Foundation | 30 min |
| 1 - Competitive Warfare | 2 hours |
| 2 - Political Risk | 1.5 hours |
| 3 - Ethical Dilemma | 2 hours |
| 4 - Leadership Philosophy | 1.5 hours |
| 5 - Conflict Resolution | 1.5 hours |
| 6 - Integration | 1 hour |
| 7 - Release | 30 min |

**Total Estimated:** 10-12 hours focused work

---

## Appendix: Enhancement Opportunities (v1.3+)

### Workflow Chaining
- Competitive Warfare → Strategic Decision Workshop
- Political Risk Assessment → Stakeholder Negotiation Prep
- Ethical Dilemma → Policy Development

### Continue/Resume
- Add `step-01b-continue.md` to all workflows (v1.1 + v1.2)

### Additional Output Formats
- PDF export preparation
- Executive summary generation

---

**Plan Status:** Ready for Implementation
**Target Version:** 1.2.0
**Author:** Claude Opus 4.5
**Date:** 2026-01-09
