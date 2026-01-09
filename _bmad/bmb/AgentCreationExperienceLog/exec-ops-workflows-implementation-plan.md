# Executive Operations Module - Workflows Implementation Plan

**Module ID:** exec-ops
**Version:** 1.1.0 (Workflows Release)
**Created:** 2026-01-09
**Based On:** v1.0 agents release + BMAD workflow architecture standards

---

## Executive Summary

This document provides the complete implementation plan for exec-ops v1.1 workflows. Following the proven pattern from v1.0 agent deployment and cyber-ops workflow architecture, we will build 6 core workflows that maximize the value of the 14 deployed agents.

**Total Scope:**
- 6 Workflows (Tier 1 & 2 priorities)
- Full Party Mode integration (multi-agent orchestration)
- Step-file architecture per BMAD standards
- Templates for consistent output artifacts

---

## Workflow Portfolio Summary

| # | Workflow ID | Display Name | Complexity | Primary Agents | Steps |
|---|-------------|--------------|------------|----------------|-------|
| 1 | strategic-decision-workshop | Strategic Decision Workshop | High | All 14 | 8-9 |
| 2 | stakeholder-negotiation-prep | Stakeholder Negotiation Prep | Medium | 4-6 | 7 |
| 3 | board-presentation-prep | Board Presentation Prep | Medium | 3-5 | 6 |
| 4 | crisis-response-planning | Crisis Response Planning | Medium | 4 | 6 |
| 5 | strategic-planning-session | Strategic Planning Session | High | 5-6 | 7 |
| 6 | policy-development | Policy Development | Medium | 4 | 7 |

**Total Steps to Build:** ~42 step files + 6 workflow.md files + templates + data files

---

## Implementation Phases Overview

| Phase | Epic | Stories | Description |
|-------|------|---------|-------------|
| 0 | Foundation | 3 | Workflow infrastructure, templates, shared resources |
| 1 | Flagship Workflow | 6 | Strategic Decision Workshop (all 14 agents) |
| 2 | Core Workflows | 8 | Negotiation Prep + Board Presentation |
| 3 | Crisis & Strategy | 6 | Crisis Response + Strategic Planning |
| 4 | Policy Workflow | 4 | Policy Development |
| 5 | Integration & Testing | 4 | Testing, documentation, registration |
| 6 | Production Release | 2 | Cleanup, commit, tag v1.1.0 |

**Total Stories:** 33

---

## Epic 0: Workflow Foundation

**Goal:** Create shared infrastructure, templates, and data files for all workflows.

**Dependencies:** None (starting point)

**Acceptance Criteria:**
- [ ] Workflow directory structure exists
- [ ] Shared templates created
- [ ] Common data files for agent references
- [ ] Output templates for artifacts

---

### Story 0.1: Create Workflow Directory Structure

**As a** module developer
**I want** the complete directory structure for exec-ops workflows
**So that** I have organized locations for all workflow components

**Tasks:**
1. Create `_bmad/exec-ops/workflows/` root directory
2. Create subdirectory for each planned workflow:
   - `strategic-decision-workshop/`
   - `stakeholder-negotiation-prep/`
   - `board-presentation-prep/`
   - `crisis-response-planning/`
   - `strategic-planning-session/`
   - `policy-development/`
3. Create within each workflow folder:
   - `steps/` - step files
   - `templates/` - output templates
   - `data/` - reference data (if needed)
4. Create shared resources:
   - `_bmad/exec-ops/workflows/_shared/` for common data
   - `_bmad/exec-ops/workflows/_shared/agent-roster.md`
   - `_bmad/exec-ops/workflows/_shared/party-mode-orchestration.md`

**Acceptance Criteria:**
```bash
ls -la _bmad/exec-ops/workflows/
# Should show: 6 workflow folders + _shared/
```

---

### Story 0.2: Create Shared Agent Roster Data File

**As a** workflow step
**I want** a shared agent roster reference
**So that** any step can quickly reference available agents

**Tasks:**
1. Create `_bmad/exec-ops/workflows/_shared/agent-roster.md`
2. Include:
   - Modern Professional Advisors (6) with specialties
   - Historical Archetypes (8) with perspectives
   - When to invoke each agent
   - Party Mode invocation patterns

**Content Structure:**
```markdown
# Exec-Ops Agent Roster

## Modern Professional Advisors
| Agent | Name | Specialty | Best For |
|-------|------|-----------|----------|
| policy-analyst | Augustus | Evidence & data | Research, analysis |
| political-strategist | Magnus | Power dynamics | Strategy, coalitions |
| debate-coach | Cicero | Rhetoric | Arguments, persuasion |
| stakeholder-mediator | Geneva | Negotiation | Consensus, resolution |
| ethics-advisor | Sophia | Values | Ethical analysis |
| communications-director | Joseph | Messaging | Communications |

## Historical Archetypes
| Agent | Name | Perspective | Inherent Bias |
|-------|------|-------------|---------------|
| the-realist | Niccolo | Realpolitik | Cynical pragmatism |
| the-liberator | Charles | Moral authority | Idealistic patience |
| the-revolutionary | Maximilien | Radical change | Revolutionary urgency |
| the-conservative | Burke | Tradition | Status quo preference |
| the-technocrat | Lee | Efficiency | Technocratic elitism |
| the-strategist-warrior | Musashi | Timing | Action orientation |
| the-master-strategist | Sun | Grand strategy | Adversarial framing |
| the-principled-commander | Jean-Luc | Principled leadership | Diplomatic optimism |

## Party Mode Invocation Patterns
- "Let's consult [Name] about [topic]"
- "I want to hear from [Name] and [Name] on this"
- "Bring in the [category] advisors for perspective"
```

**Acceptance Criteria:**
- [ ] Agent roster file exists
- [ ] All 14 agents documented
- [ ] Party Mode patterns included

---

### Story 0.3: Create Output Template Foundation

**As a** workflow
**I want** consistent output templates
**So that** all artifacts have professional, board-ready formatting

**Tasks:**
1. Create `_bmad/exec-ops/workflows/_shared/templates/`
2. Create base templates:
   - `decision-brief-template.md` - Strategic decisions
   - `playbook-template.md` - Action playbooks
   - `analysis-template.md` - Analysis documents
   - `presentation-outline-template.md` - Presentation prep

**Template Structure (decision-brief):**
```markdown
---
stepsCompleted: []
createdDate: {date}
workflow: {workflow_name}
status: draft
---

# {Title}

## Executive Summary
[One paragraph summary]

## Decision Context
[Background and framing]

## Analysis
[Evidence and perspectives]

## Options Considered
[Options with trade-offs]

## Recommendation
[Primary recommendation with rationale]

## Risk Register
[Key risks and mitigations]

## Dissenting Views
[Alternative perspectives captured]

## Next Steps
[Action items]

## Communications Plan
[Stakeholder messaging]
```

**Acceptance Criteria:**
- [ ] 4 base templates created
- [ ] Templates follow board-ready formatting
- [ ] Frontmatter includes workflow tracking

---

## Epic 1: Strategic Decision Workshop (Flagship)

**Goal:** Build the flagship multi-agent workflow showcasing all 14 agents.

**Dependencies:** Epic 0 complete

**Why First:** This is the most complex and valuable workflow, demonstrating the full power of the exec-ops module with all 14 agents working together through Party Mode.

**Acceptance Criteria:**
- [ ] Workflow loads and runs through all steps
- [ ] Party Mode integrates all 14 agents
- [ ] Produces comprehensive decision brief
- [ ] Each archetype perspective captured

---

### Story 1.1: Create Strategic Decision Workshop - workflow.md

**As a** user
**I want** the main workflow definition
**So that** I can initiate the Strategic Decision Workshop

**Tasks:**
1. Create `_bmad/exec-ops/workflows/strategic-decision-workshop/workflow.md`
2. Define goal, role, architecture per template
3. Configure initialization sequence
4. Reference first step file

**Workflow Details:**
```yaml
name: Strategic Decision Workshop
description: Multi-perspective strategic decision analysis using all 14 executive advisors
web_bundle: true
```

**Goal:** Guide executives through comprehensive strategic decisions by orchestrating perspectives from all 14 advisors to produce board-ready decision briefs with full stakeholder analysis.

**Your Role:** Senior strategic facilitator orchestrating a council of 14 expert advisors.

**Acceptance Criteria:**
- [ ] workflow.md follows BMAD template exactly
- [ ] References exec-ops config.yaml
- [ ] Points to step-01-init.md

---

### Story 1.2: Create SDW Step 01 - Decision Framing (Init)

**Step ID:** step-01-init.md
**Goal:** Frame the decision, identify stakeholders, constraints, and timeline

**Sequence:**
1. Load config, greet user by name
2. Explain the workshop process
3. Elicit: What decision needs to be made?
4. Elicit: Who are the stakeholders?
5. Elicit: What are the constraints?
6. Elicit: What is the timeline?
7. Create output file with frontmatter
8. Present menu: [A] Advanced Elicitation [P] Party Mode [C] Continue

**Output Written:**
- Decision statement
- Stakeholder list
- Constraints
- Timeline

**Acceptance Criteria:**
- [ ] Under 200 lines
- [ ] Menu includes A/P/C
- [ ] Creates output file with tracking

---

### Story 1.3: Create SDW Step 02 - Evidence Gathering

**Step ID:** step-02-evidence-gathering.md
**Goal:** Augustus leads evidence synthesis and data gathering

**Sequence:**
1. Invoke Augustus (policy-analyst) persona overlay
2. Ask what evidence/data is available
3. Identify gaps in evidence
4. Structure evidence summary
5. Rate confidence levels
6. Menu: [A] [P] [C]

**Party Mode Guidance:**
- Primarily Augustus leading
- Can invoke Magnus for political context data
- Can invoke Lee for metrics/efficiency data

**Acceptance Criteria:**
- [ ] Augustus persona dominant
- [ ] Evidence structured clearly
- [ ] Gaps identified

---

### Story 1.4: Create SDW Step 03 - Stakeholder Analysis

**Step ID:** step-03-stakeholder-analysis.md
**Goal:** Deep stakeholder mapping with power and interest analysis

**Sequence:**
1. For each stakeholder identified:
   - Geneva: What are their interests?
   - Magnus: What is their power/influence?
   - Niccolo: What are their hidden motivations?
2. Create stakeholder matrix (power vs interest)
3. Identify key allies, opponents, swing stakeholders
4. Menu: [A] [P] [C]

**Party Mode Guidance:**
- Geneva leads interest mapping
- Magnus analyzes power dynamics
- Niccolo provides realist perspective

**Acceptance Criteria:**
- [ ] All stakeholders mapped
- [ ] Power/interest matrix created
- [ ] Coalition opportunities identified

---

### Story 1.5: Create SDW Step 04 - Perspective Carousel

**Step ID:** step-04-perspective-carousel.md
**Goal:** Each archetype offers their perspective on the decision

**Sequence:**
1. Present decision to each Historical Archetype in turn:
   - Niccolo (Realist): Power analysis
   - Charles (Liberator): Moral dimension
   - Maximilien (Revolutionary): Systemic critique
   - Burke (Conservative): Stability/tradition
   - Lee (Technocrat): Efficiency/systems
   - Musashi (Warrior): Timing/action
   - Sun (Strategist): Grand strategy
   - Jean-Luc (Commander): Principles/diplomacy
2. Capture each perspective (1-2 paragraphs)
3. Note areas of agreement and tension
4. Menu: [A] [P] [C]

**Party Mode Guidance:**
- This step IS Party Mode - orchestrating all 8 archetypes
- Each speaks in their distinctive voice
- Capture biases alongside perspectives

**Acceptance Criteria:**
- [ ] All 8 archetypes contribute
- [ ] Perspectives captured in their voice
- [ ] Tensions documented

---

### Story 1.6: Create SDW Step 05 - Debate & Synthesis

**Step ID:** step-05-debate-synthesis.md
**Goal:** Cicero facilitates structured debate and synthesis

**Sequence:**
1. Cicero takes lead as debate coach
2. Identify the 2-3 core tensions from Step 04
3. For each tension:
   - Steelman Position A
   - Steelman Position B
   - Identify logical vulnerabilities
4. Synthesize: Where is common ground?
5. What remains unresolved?
6. Menu: [A] [P] [C]

**Party Mode Guidance:**
- Cicero leads the process
- Can call on archetypes to defend their positions
- Focus on productive synthesis, not winning

**Acceptance Criteria:**
- [ ] Tensions clearly articulated
- [ ] Both sides steelmanned
- [ ] Synthesis attempts documented

---

### Story 1.7: Create SDW Step 06 - Ethics Check

**Step ID:** step-06-ethics-check.md
**Goal:** Sophia and Jean-Luc assess ethical dimensions

**Sequence:**
1. Sophia leads ethical analysis:
   - What values are in tension?
   - Who bears the costs?
   - Harshest critic test
2. Jean-Luc adds principled leadership lens:
   - What would we be proud of in 10 years?
   - Are we treating all parties with dignity?
3. Document ethical considerations
4. Flag any ethical red lines
5. Menu: [A] [P] [C]

**Party Mode Guidance:**
- Sophia primary, Jean-Luc secondary
- Not preachy - illuminate trade-offs
- Document, don't mandate

**Acceptance Criteria:**
- [ ] Values tensions identified
- [ ] Stakeholder impact assessed
- [ ] Ethical considerations documented

---

### Story 1.8: Create SDW Step 07 - Communication Plan

**Step ID:** step-07-communication-plan.md
**Goal:** Joseph develops messaging for each stakeholder group

**Sequence:**
1. Joseph takes lead as communications director
2. For each key stakeholder group:
   - Core message (10 words or less)
   - Supporting points
   - Potential concerns to address
   - Messenger recommendation
3. Timing sequence
4. Crisis scenarios and responses
5. Menu: [A] [P] [C]

**Party Mode Guidance:**
- Joseph primary
- Magnus for political timing
- Cicero for message refinement

**Acceptance Criteria:**
- [ ] Each stakeholder has tailored message
- [ ] Timing sequence defined
- [ ] Crisis scenarios addressed

---

### Story 1.9: Create SDW Step 08 - Decision Document

**Step ID:** step-08-decision-document.md
**Goal:** Compile final board-ready decision brief

**Sequence:**
1. Load template from `templates/decision-brief-template.md`
2. Compile all sections from previous steps:
   - Executive Summary (synthesize)
   - Decision Context (from Step 01)
   - Analysis (from Steps 02-05)
   - Options Considered
   - Recommendation (from synthesis)
   - Risk Register
   - Dissenting Views (from archetypes)
   - Communications Plan (from Step 07)
   - Next Steps
3. Review and refine
4. Menu: [R] Revise Section [X] Export & Exit

**Output:**
- Complete `decision-brief-[topic].md` file

**Acceptance Criteria:**
- [ ] All sections populated
- [ ] Board-ready formatting
- [ ] Dissenting views preserved

---

## Epic 2: Core Negotiation & Presentation Workflows

**Goal:** Build two high-value practical workflows.

**Dependencies:** Epic 1 complete (patterns established)

---

### Story 2.1: Create Stakeholder Negotiation Prep - workflow.md

**Workflow Details:**
```yaml
name: Stakeholder Negotiation Prep
description: Prepare for critical negotiations with stakeholder analysis, interest mapping, and strategy development
```

**Steps Planned:**
1. step-01-init.md - Context setting (parties, stakes, history, BATNA)
2. step-02-interest-mapping.md - Geneva maps interests vs positions
3. step-03-power-analysis.md - Magnus analyzes leverage and coalitions
4. step-04-argument-arsenal.md - Cicero prepares arguments and counters
5. step-05-tactical-options.md - Sun + Musashi on timing
6. step-06-message-prep.md - Joseph prepares talking points
7. step-07-playbook.md - Compile negotiation playbook

**Acceptance Criteria:**
- [ ] workflow.md created
- [ ] All 7 steps defined

---

### Story 2.2: Build All Negotiation Prep Steps (7 steps)

**Tasks:**
- Create each of the 7 step files per Story 2.1
- Follow patterns from Strategic Decision Workshop
- Each step under 200 lines
- All include A/P/C menu

**Output Template:** `negotiation-playbook-[party].md`

**Acceptance Criteria:**
- [ ] All 7 step files created
- [ ] Workflow runs end-to-end
- [ ] Playbook output complete

---

### Story 2.3: Create Board Presentation Prep - workflow.md

**Workflow Details:**
```yaml
name: Board Presentation Prep
description: Prepare compelling board presentations with evidence, narrative, and Q&A preparation
```

**Steps Planned:**
1. step-01-init.md - Audience analysis (board profiles, concerns)
2. step-02-narrative-arc.md - Joseph designs story structure
3. step-03-evidence-package.md - Augustus assembles data
4. step-04-anticipate-questions.md - Cicero prepares Q&A
5. step-05-archetype-review.md - Optional panel stress-test
6. step-06-deck-outline.md - Slide-by-slide with notes

**Acceptance Criteria:**
- [ ] workflow.md created
- [ ] All 6 steps defined

---

### Story 2.4: Build All Board Presentation Steps (6 steps)

**Tasks:**
- Create each of the 6 step files per Story 2.3
- Focus on practical presentation preparation
- Include optional archetype panel review
- Produce slide-by-slide outline

**Output Template:** `board-presentation-[topic].md`

**Acceptance Criteria:**
- [ ] All 6 step files created
- [ ] Workflow runs end-to-end
- [ ] Presentation outline complete

---

## Epic 3: Crisis & Strategy Workflows

**Goal:** Build crisis response and strategic planning workflows.

**Dependencies:** Epic 2 complete

---

### Story 3.1: Create Crisis Response Planning - workflow.md

**Workflow Details:**
```yaml
name: Crisis Response Planning
description: Develop crisis communication and response strategies for high-stakes situations
```

**Steps Planned:**
1. step-01-init.md - Crisis assessment (type, severity, affected)
2. step-02-immediate-actions.md - First 24-48 hour plan
3. step-03-stakeholder-comms.md - Joseph messaging per audience
4. step-04-media-strategy.md - Press statements, Q&A
5. step-05-political-dimension.md - Magnus power implications
6. step-06-recovery-path.md - Long-term recovery plan

**Primary Agents:** Joseph, Magnus, Geneva, Jean-Luc

**Acceptance Criteria:**
- [ ] workflow.md created
- [ ] All 6 steps defined

---

### Story 3.2: Build All Crisis Response Steps (6 steps)

**Tasks:**
- Create each of the 6 step files per Story 3.1
- Fast-paced, action-oriented tone
- Focus on immediate + long-term response
- Include media strategy

**Output Template:** `crisis-response-[incident].md`

**Acceptance Criteria:**
- [ ] All 6 step files created
- [ ] Workflow produces actionable plan

---

### Story 3.3: Create Strategic Planning Session - workflow.md

**Workflow Details:**
```yaml
name: Strategic Planning Session
description: Long-term strategic planning with diverse strategic philosophies
```

**Steps Planned:**
1. step-01-init.md - Context and objectives
2. step-02-landscape-assessment.md - Sun maps terrain
3. step-03-timing-analysis.md - Musashi on when to act
4. step-04-systems-thinking.md - Lee on efficiency
5. step-05-tradition-risk.md - Burke on preservation
6. step-06-political-reality.md - Magnus on stakeholders
7. step-07-strategy-document.md - Compile strategy

**Primary Agents:** Sun, Musashi, Lee, Burke, Magnus

**Acceptance Criteria:**
- [ ] workflow.md created
- [ ] All 7 steps defined

---

### Story 3.4: Build All Strategic Planning Steps (7 steps)

**Tasks:**
- Create each of the 7 step files per Story 3.3
- Each archetype leads their specialty step
- Balance perspectives in final synthesis
- Board-ready strategy document

**Output Template:** `strategic-plan-[period].md`

**Acceptance Criteria:**
- [ ] All 7 step files created
- [ ] Each archetype has clear contribution

---

## Epic 4: Policy Development Workflow

**Goal:** Build the policy development workflow with ethics focus.

**Dependencies:** Epic 3 complete

---

### Story 4.1: Create Policy Development - workflow.md

**Workflow Details:**
```yaml
name: Policy Development
description: Develop internal policies with evidence, ethics review, and implementation planning
```

**Steps Planned:**
1. step-01-init.md - Policy need (problem, stakeholders)
2. step-02-evidence-review.md - Augustus research and precedents
3. step-03-ethics-analysis.md - Sophia values and fairness
4. step-04-conservative-review.md - Burke unintended consequences
5. step-05-reform-perspective.md - Maximilien bold alternatives
6. step-06-draft-policy.md - Complete policy document
7. step-07-implementation-plan.md - Rollout and monitoring

**Primary Agents:** Augustus, Sophia, Burke, Maximilien

**Acceptance Criteria:**
- [ ] workflow.md created
- [ ] All 7 steps defined

---

### Story 4.2: Build All Policy Development Steps (7 steps)

**Tasks:**
- Create each of the 7 step files per Story 4.1
- Balance evidence with ethics
- Include conservative and reform perspectives
- Complete implementation plan

**Output Template:** `policy-[name].md`

**Acceptance Criteria:**
- [ ] All 7 step files created
- [ ] Balanced perspectives documented

---

## Epic 5: Integration & Testing

**Goal:** Comprehensive testing and registration of all workflows.

**Dependencies:** Epics 1-4 complete

---

### Story 5.1: Register All Workflows

**Tasks:**
1. Add workflow entries to module.yaml or manifest
2. Create command wrappers in `.claude/commands/bmad/exec-ops/workflows/`
3. Verify each workflow discoverable

**Files to Create:**
```
.claude/commands/bmad/exec-ops/workflows/strategic-decision-workshop.md
.claude/commands/bmad/exec-ops/workflows/stakeholder-negotiation-prep.md
.claude/commands/bmad/exec-ops/workflows/board-presentation-prep.md
.claude/commands/bmad/exec-ops/workflows/crisis-response-planning.md
.claude/commands/bmad/exec-ops/workflows/strategic-planning-session.md
.claude/commands/bmad/exec-ops/workflows/policy-development.md
```

**Acceptance Criteria:**
- [ ] 6 command wrappers created
- [ ] All workflows accessible via commands

---

### Story 5.2: Individual Workflow Testing

**Tasks:**
For each of the 6 workflows:
1. [ ] Invoke via command
2. [ ] Verify config loads
3. [ ] Run through all steps
4. [ ] Verify output file created
5. [ ] Verify frontmatter tracking
6. [ ] Verify menu options work (A/P/C)
7. [ ] Verify Party Mode invokes correct agents

**Test Log:**
```markdown
| Workflow | Steps Run | Output Created | Party Mode | Pass/Fail |
|----------|-----------|----------------|------------|-----------|
| strategic-decision-workshop | 8/8 | Y | Y | |
| stakeholder-negotiation-prep | 7/7 | Y | Y | |
| board-presentation-prep | 6/6 | Y | Y | |
| crisis-response-planning | 6/6 | Y | Y | |
| strategic-planning-session | 7/7 | Y | Y | |
| policy-development | 7/7 | Y | Y | |
```

**Acceptance Criteria:**
- [ ] All 6 workflows pass testing
- [ ] All outputs correct format

---

### Story 5.3: Cross-Workflow Agent Consistency Testing

**Tasks:**
1. Test same agent (e.g., Augustus) invoked in multiple workflows
2. Verify persona consistency across contexts
3. Verify Party Mode transitions work
4. Document any issues

**Acceptance Criteria:**
- [ ] Agent personas consistent
- [ ] No confusion between workflows

---

### Story 5.4: Update Documentation

**Tasks:**
1. Update `_bmad/exec-ops/README.md` with workflow section
2. Document each workflow:
   - Purpose
   - When to use
   - Primary agents
   - Output produced
3. Add usage examples

**Acceptance Criteria:**
- [ ] README updated with all 6 workflows
- [ ] Each workflow documented

---

## Epic 6: Production Release

**Goal:** Clean up and release v1.1.0.

**Dependencies:** Epic 5 complete (all tests pass)

---

### Story 6.1: Final Verification & Cleanup

**Tasks:**
1. Count workflow files (should be 6)
2. Count step files (should be ~42)
3. Count command wrappers (should be 6)
4. Remove any build artifacts
5. Remove any TODO comments
6. Verify no placeholder content

**Verification Commands:**
```bash
ls _bmad/exec-ops/workflows/*/workflow.md | wc -l  # Should be 6
find _bmad/exec-ops/workflows -name "step-*.md" | wc -l  # Should be ~42
ls .claude/commands/bmad/exec-ops/workflows/*.md | wc -l  # Should be 6
```

**Acceptance Criteria:**
- [ ] All counts correct
- [ ] No incomplete content

---

### Story 6.2: Git Commit & Tag v1.1.0

**Tasks:**
1. Stage all workflow files
2. Create meaningful commit message
3. Tag release v1.1.0

**Commands:**
```bash
# Stage files
git add _bmad/exec-ops/workflows/
git add .claude/commands/bmad/exec-ops/workflows/
git add _bmad/exec-ops/README.md
git add _bmad/exec-ops/config.yaml  # if updated

# Commit
git commit -m "Add exec-ops workflows - v1.1.0

- 6 workflows deployed:
  - Strategic Decision Workshop (flagship, all 14 agents)
  - Stakeholder Negotiation Prep
  - Board Presentation Prep
  - Crisis Response Planning
  - Strategic Planning Session
  - Policy Development
- ~42 step files following BMAD architecture
- Full Party Mode integration for multi-agent orchestration
- Output templates for board-ready artifacts
- Complete documentation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Tag
git tag -a "exec-ops-v1.1.0" -m "exec-ops v1.1.0 workflows release"
```

**Acceptance Criteria:**
- [ ] Clean commit
- [ ] Tagged v1.1.0

---

## Success Metrics

### Workflow Success Criteria
- [ ] All 6 workflows load and run via commands
- [ ] All workflows produce correctly formatted output files
- [ ] Party Mode correctly orchestrates multiple agents
- [ ] Each workflow leverages appropriate agent expertise
- [ ] Output artifacts are board-ready quality
- [ ] All step files under 200 lines

### Agent Integration Criteria
- [ ] All 14 agents accessible via Party Mode
- [ ] Agents maintain persona in workflow context
- [ ] Appropriate agents invoked for each step
- [ ] Archetype biases acknowledged where relevant

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step files too long | Medium | Medium | Extract to data files, split steps |
| Party Mode coordination complex | Medium | High | Clear agent invocation patterns |
| Workflows feel generic | Low | High | Strong agent personas, specific outputs |
| Too many steps overwhelming | Low | Medium | Clear progress tracking, skip options |
| Output quality inconsistent | Low | High | Strong templates, review steps |

---

## Estimated Effort Per Story

| Epic | Stories | Est. Effort per Story | Epic Total |
|------|---------|----------------------|------------|
| 0 - Foundation | 3 | Low (15-20 min) | ~1 hour |
| 1 - Flagship | 9 | Medium (20-30 min) | ~4 hours |
| 2 - Core | 4 | Medium (45-60 min) | ~3 hours |
| 3 - Crisis/Strategy | 4 | Medium (45-60 min) | ~3 hours |
| 4 - Policy | 2 | Medium (45-60 min) | ~1.5 hours |
| 5 - Integration | 4 | Low-Medium | ~2 hours |
| 6 - Release | 2 | Low (15-20 min) | ~30 min |

**Total Estimated:** 15-18 hours focused work

---

## Build Order & Dependencies

```
Epic 0 (Foundation)
    │
    ▼
Epic 1 (Strategic Decision Workshop - Flagship)
    │
    ├───────────────────┐
    ▼                   ▼
Epic 2              Epic 3
(Negotiation +      (Crisis +
 Presentation)       Strategy)
    │                   │
    └─────────┬─────────┘
              ▼
        Epic 4 (Policy)
              │
              ▼
        Epic 5 (Testing)
              │
              ▼
        Epic 6 (Release)
```

**Critical Path:** Epic 0 → Epic 1 → Epic 5 → Epic 6

**Parallel Opportunities:** Epics 2, 3, and 4 can be built in parallel after Epic 1 patterns established.

---

## Appendix A: File Inventory

### Workflow Files (6)
```
_bmad/exec-ops/workflows/strategic-decision-workshop/workflow.md
_bmad/exec-ops/workflows/stakeholder-negotiation-prep/workflow.md
_bmad/exec-ops/workflows/board-presentation-prep/workflow.md
_bmad/exec-ops/workflows/crisis-response-planning/workflow.md
_bmad/exec-ops/workflows/strategic-planning-session/workflow.md
_bmad/exec-ops/workflows/policy-development/workflow.md
```

### Step Files (~42)
```
strategic-decision-workshop/steps/ (8-9 files)
stakeholder-negotiation-prep/steps/ (7 files)
board-presentation-prep/steps/ (6 files)
crisis-response-planning/steps/ (6 files)
strategic-planning-session/steps/ (7 files)
policy-development/steps/ (7 files)
```

### Shared Resources
```
_bmad/exec-ops/workflows/_shared/agent-roster.md
_bmad/exec-ops/workflows/_shared/party-mode-orchestration.md
_bmad/exec-ops/workflows/_shared/templates/decision-brief-template.md
_bmad/exec-ops/workflows/_shared/templates/playbook-template.md
_bmad/exec-ops/workflows/_shared/templates/analysis-template.md
_bmad/exec-ops/workflows/_shared/templates/presentation-outline-template.md
```

### Command Wrappers (6)
```
.claude/commands/bmad/exec-ops/workflows/strategic-decision-workshop.md
.claude/commands/bmad/exec-ops/workflows/stakeholder-negotiation-prep.md
.claude/commands/bmad/exec-ops/workflows/board-presentation-prep.md
.claude/commands/bmad/exec-ops/workflows/crisis-response-planning.md
.claude/commands/bmad/exec-ops/workflows/strategic-planning-session.md
.claude/commands/bmad/exec-ops/workflows/policy-development.md
```

---

## Appendix B: Next Steps After v1.1

### v1.2 Candidate Workflows
- Competitive Intelligence Brief
- Political Risk Assessment
- Coalition Building Strategy
- Ethical Dilemma Resolution
- Pre-Mortem Analysis
- Leadership Philosophy Development
- Debate Preparation
- Executive Communication Strategy
- Organizational Change Management

### Enhancement Opportunities
- Continue/Resume step (step-01b-continue.md) for each workflow
- Additional output format options (PDF export hints)
- Integration with document storage
- Workflow chaining (one workflow leads to another)

---

**Plan Status:** Ready for Approval
**Target Version:** 1.1.0
**Author:** Claude Opus 4.5
**Date:** 2026-01-09
