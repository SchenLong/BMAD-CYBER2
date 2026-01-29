# Workflow Chaining Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Purpose:** Combining workflows for complex multi-stage operations

---

## Overview

Many real-world scenarios require capabilities from multiple modules. Workflow chaining enables you to sequence workflows across teams, passing context and outputs between stages to accomplish complex objectives.

### Key Principles

1. **Context Preservation**: Output from one workflow becomes input to the next
2. **Module Synergy**: Different teams contribute specialized expertise
3. **Phase Gates**: Quality checks between workflow stages
4. **Parallel Execution**: Independent workflows can run simultaneously
5. **Escalation Paths**: Decision points for Party Mode activation

---

## Common Workflow Chains

### Security Incident Response Chain

**Scenario**: Major security incident requiring technical response, legal compliance, and stakeholder communication.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY INCIDENT CHAIN                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ incident-response-    │  PHASE 1: CONTAINMENT                   │
│  │ playbook (Cybersec)   │  • Isolate affected systems             │
│  │                       │  • Preserve evidence                     │
│  │ Output: IR Report     │  • Initial scope assessment             │
│  └───────────┬───────────┘                                         │
│              │                                                      │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ attribution-chain     │  PHASE 2: INVESTIGATION                 │
│  │ (Intel)               │  • Threat actor identification          │
│  │                       │  • TTP analysis                          │
│  │ Output: Attribution   │  • IOC enrichment                       │
│  │ Report                │                                          │
│  └───────────┬───────────┘                                         │
│              │                                                      │
│    ┌─────────┴─────────┐                                           │
│    ▼                   ▼                                           │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │ legal-matter│  │ crisis-     │  PHASE 3: PARALLEL               │
│  │ -intake     │  │ response-   │  • Legal notification            │
│  │ (Legal)     │  │ planning    │  • Stakeholder comms             │
│  │             │  │ (Strategy)  │                                   │
│  └──────┬──────┘  └──────┬──────┘                                  │
│         │                │                                          │
│         └────────┬───────┘                                          │
│                  ▼                                                  │
│  ┌───────────────────────┐                                         │
│  │ Party Mode:           │  PHASE 4: COORDINATION                  │
│  │ incident-war-room     │  • Cross-team synthesis                 │
│  │                       │  • Final response plan                  │
│  │ Output: Action Plan   │  • Executive briefing                   │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Invocation Sequence**:
```
# Phase 1
/bmad:cybersec-team:workflows:incident-response-playbook

# Phase 2 (after containment)
/bmad:intel-team:workflows:attribution-chain

# Phase 3 (parallel)
/bmad:legal-team:workflows:legal-matter-intake
/bmad:strategy-team:workflows:crisis-response-planning

# Phase 4 (synthesis)
> PM
Select preset: incident-war-room
```

---

### Product Launch Chain

**Scenario**: Full product development lifecycle from concept to launch.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRODUCT LAUNCH CHAIN                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: DISCOVERY                                                 │
│  ┌───────────────────────┐                                         │
│  │ create-product-brief  │ → Validate idea with market research    │
│  │ (BMM)                 │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 2: PLANNING                                                  │
│  ┌───────────────────────┐                                         │
│  │ create-prd            │ → Detailed requirements                 │
│  │ (BMM)                 │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 3: DESIGN                                                    │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ create-architecture   │  │ create-ux-design      │              │
│  │ (BMM)                 │  │ (BMM)                 │              │
│  └───────────┬───────────┘  └───────────┬───────────┘              │
│              └──────────────────────────┘                           │
│                            ▼                                        │
│  PHASE 4: SECURITY REVIEW                                           │
│  ┌───────────────────────┐                                         │
│  │ security-architecture-│ → Pre-build security validation        │
│  │ review (Cybersec)     │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ threat-modeling       │ → Detailed threat analysis              │
│  │ (Cybersec)            │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 5: LEGAL PREP                                                │
│  ┌───────────────────────┐                                         │
│  │ contract-drafting     │ → Terms of service, privacy policy     │
│  │ (Legal)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 6: IMPLEMENTATION                                            │
│  ┌───────────────────────┐                                         │
│  │ create-epics-and-     │                                         │
│  │ stories (BMM)         │ → Break down into sprints               │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ sprint-planning       │ → Sprint cycles                         │
│  │ + dev-story (BMM)     │   (repeat until complete)               │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 7: PRE-LAUNCH                                                │
│  ┌───────────────────────┐                                         │
│  │ Party Mode:           │ → Final security/legal/product check   │
│  │ product-security-     │                                         │
│  │ launch                │                                         │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### M&A Due Diligence Chain

**Scenario**: Comprehensive due diligence for potential acquisition target.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    M&A DUE DILIGENCE CHAIN                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: RAPID ASSESSMENT                                          │
│  ┌───────────────────────┐                                         │
│  │ flash-assessment      │ → Quick risk triage (15 min)           │
│  │ (Intel)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 2: DEEP INVESTIGATION (PARALLEL)                             │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ campaign-planner-org  │  │ breach-archaeology    │              │
│  │ (Intel)               │  │ (Intel)               │              │
│  │                       │  │                       │              │
│  │ Corporate intel       │  │ Data exposure check   │              │
│  └───────────┬───────────┘  └───────────┬───────────┘              │
│              │                          │                           │
│  ┌───────────┴───────────┐  ┌───────────┴───────────┐              │
│  │ infrastructure-       │  │ counter-intel-audit   │              │
│  │ genealogy (Intel)     │  │ (Intel - their OPSEC) │              │
│  │                       │  │                       │              │
│  │ Tech history          │  │ Their security posture│              │
│  └───────────┬───────────┘  └───────────┬───────────┘              │
│              └──────────────────────────┘                           │
│                            ▼                                        │
│  PHASE 3: LEGAL REVIEW                                              │
│  ┌───────────────────────┐                                         │
│  │ legal-matter-intake   │ → Route to appropriate specialists     │
│  │ (Legal)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ corporate-formation   │ → Analyze structure, liabilities       │
│  │ review (Legal)        │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 4: STRATEGIC ANALYSIS                                        │
│  ┌───────────────────────┐                                         │
│  │ ma-due-diligence      │ → Multi-perspective strategic review   │
│  │ (Strategy)            │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 5: DECISION                                                  │
│  ┌───────────────────────┐                                         │
│  │ Party Mode:           │ → Final go/no-go decision              │
│  │ m-and-a-diligence-    │                                         │
│  │ board                 │                                         │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Enterprise Sales Chain

**Scenario**: Complex enterprise deal requiring competitive intelligence, legal support, and negotiation preparation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE SALES CHAIN                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: OPPORTUNITY RESEARCH                                      │
│  ┌───────────────────────┐                                         │
│  │ campaign-planner-org  │ → Understand prospect deeply            │
│  │ (Intel)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ pattern-of-life       │ → Stakeholder behavior analysis        │
│  │ (Intel)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 2: CONTRACT PREPARATION                                      │
│  ┌───────────────────────┐                                         │
│  │ contract-drafting     │ → Prepare enterprise agreement         │
│  │ (Legal)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 3: NEGOTIATION PREP                                          │
│  ┌───────────────────────┐                                         │
│  │ stakeholder-          │ → Develop negotiation strategy         │
│  │ negotiation-prep      │                                          │
│  │ (Strategy)            │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 4: DEAL SUPPORT                                              │
│  ┌───────────────────────┐                                         │
│  │ Party Mode:           │ → Real-time negotiation support        │
│  │ negotiation-          │                                         │
│  │ intelligence-party    │                                         │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Compliance Program Chain

**Scenario**: Establishing compliance program for new regulation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   COMPLIANCE PROGRAM CHAIN                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: ASSESSMENT                                                │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ compliance-audit-prep │  │ counter-intel-audit   │              │
│  │ (Cybersec)            │  │ (Intel)               │              │
│  │                       │  │                       │              │
│  │ Gap analysis          │  │ External exposure     │              │
│  └───────────┬───────────┘  └───────────┬───────────┘              │
│              └──────────────────────────┘                           │
│                            ▼                                        │
│  PHASE 2: LEGAL FRAMEWORK                                           │
│  ┌───────────────────────┐                                         │
│  │ policy-development    │ → Develop required policies            │
│  │ (Strategy)            │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ legal-matter-intake   │ → Regulatory interpretation            │
│  │ (Legal)               │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 3: IMPLEMENTATION                                            │
│  ┌───────────────────────┐                                         │
│  │ security-architecture-│ → Technical controls                   │
│  │ review (Cybersec)     │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  ┌───────────────────────┐                                         │
│  │ security-awareness-   │ → Employee training                    │
│  │ training (Cybersec)   │                                          │
│  └───────────┬───────────┘                                         │
│              ▼                                                      │
│  PHASE 4: VALIDATION                                                │
│  ┌───────────────────────┐                                         │
│  │ Party Mode:           │ → Cross-functional review              │
│  │ compliance-audit-team │                                         │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Chaining Patterns

### Sequential Chain
Workflows execute one after another, each depending on previous outputs.

```
Workflow A → Output A → Workflow B → Output B → Workflow C
```

**When to use**: Linear dependencies, each stage requires previous completion.

### Parallel Chain
Independent workflows execute simultaneously, then converge.

```
           ┌→ Workflow B ─┐
Workflow A ─┼→ Workflow C ─┼→ Workflow E
           └→ Workflow D ─┘
```

**When to use**: Independent investigations or analyses that feed into synthesis.

### Conditional Chain
Next workflow depends on previous outcome.

```
Workflow A → [Decision Point]
               ├─ If X → Workflow B
               └─ If Y → Workflow C
```

**When to use**: Different paths based on findings (e.g., incident severity).

### Loop Chain
Repeat workflow until condition met.

```
Workflow A → [Check] → Not Done → Workflow A (repeat)
                     → Done → Workflow B
```

**When to use**: Sprint cycles, iterative refinement.

---

## Context Passing Best Practices

### 1. Document Outputs Clearly
Each workflow should produce structured output that the next workflow can consume.

```markdown
## INCIDENT RESPONSE PHASE 1 COMPLETE

### Key Findings
- Affected systems: [list]
- Evidence preserved: [list]
- Initial scope: [description]

### For Next Phase (Attribution)
- Known IOCs: [list for intel team]
- Timeline: [chronology for investigation]
- Priority questions: [what we need to know]
```

### 2. Use Standard Handoff Format
```markdown
## WORKFLOW HANDOFF

### Completed Workflow
- Name: [workflow name]
- Module: [module name]
- Status: Complete
- Date: [date]

### Key Outputs
- [Output 1 with location/reference]
- [Output 2 with location/reference]

### Context for Next Workflow
- [Relevant context item 1]
- [Relevant context item 2]

### Questions to Address
- [Outstanding question 1]
- [Outstanding question 2]

### Recommended Next Workflow
- Name: [workflow name]
- Module: [module name]
- Priority: [High/Medium/Low]
```

### 3. Reference Previous Outputs
When starting a new workflow in chain:
```
"Continuing from [previous workflow] output dated [date].
Key findings were:
1. [Finding 1]
2. [Finding 2]

This workflow will address: [scope of current workflow]"
```

---

## Phase Gates

Insert quality checks between major phases:

### Standard Gate Checklist
```markdown
## PHASE GATE: [Phase Name] → [Next Phase]

### Completion Criteria
- [ ] All required outputs produced
- [ ] Quality review completed
- [ ] Stakeholders notified
- [ ] No blocking issues identified

### Handoff Items
- [ ] Documentation updated
- [ ] Context summary prepared
- [ ] Next workflow selected
- [ ] Resources allocated

### Go/No-Go Decision
- [ ] Proceed to next phase
- [ ] Hold for [reason]
- [ ] Escalate to [person/team]
```

---

## Party Mode Escalation Points

Identify when to escalate from sequential workflows to multi-agent Party Mode:

| Situation | Escalate To |
|-----------|-------------|
| Cross-module decision needed | `strategic-advisors` or `strategic-council` |
| Active incident coordination | `incident-war-room` |
| High-stakes negotiation | `negotiation-intelligence-party` |
| Legal + Business conflict | `legal-risk-team` |
| Pre-launch validation | `product-security-launch` |
| Crisis communication | `crisis-response-party` |

---

## Chain Templates

### Quick Start: Incident Response
```bash
# Step 1: Contain
/bmad:cybersec-team:workflows:incident-response-playbook

# Step 2: Investigate (after containment confirmed)
/bmad:intel-team:workflows:attribution-chain

# Step 3: Coordinate (parallel with step 2)
> PM
Select preset: incident-war-room
```

### Quick Start: New Product
```bash
# Step 1: Define
/bmad:bmm:workflows:create-product-brief

# Step 2: Specify
/bmad:bmm:workflows:create-prd

# Step 3: Design
/bmad:bmm:workflows:create-architecture

# Step 4: Secure
/bmad:cybersec-team:workflows:threat-modeling

# Step 5: Build
/bmad:bmm:workflows:create-epics-and-stories
```

### Quick Start: Deal Analysis
```bash
# Step 1: Research
/bmad:intel-team:workflows:flash-assessment

# Step 2: Deep Dive (if flash shows opportunity)
/bmad:intel-team:workflows:campaign-planner-org

# Step 3: Legal Review
/bmad:legal-team:workflows:legal-matter-intake

# Step 4: Strategic Decision
> PM
Select preset: strategic-advisors
```

---

## Monitoring Chain Progress

Track multi-workflow operations:

```markdown
## CHAIN PROGRESS: [Chain Name]

### Overall Status: IN PROGRESS

### Phase Tracker
| Phase | Workflow | Status | Started | Completed |
|-------|----------|--------|---------|-----------|
| 1 | incident-response-playbook | ✅ Done | 14:00 | 15:30 |
| 2 | attribution-chain | 🔄 Active | 15:45 | - |
| 3a | legal-matter-intake | ⏳ Pending | - | - |
| 3b | crisis-response-planning | ⏳ Pending | - | - |
| 4 | Party: incident-war-room | ⏳ Pending | - | - |

### Current Blockers
- None

### Next Milestone
- Phase 2 completion (ETA: 17:00)
```

---

## See Also

- [Workflow Selection Guide](WORKFLOW-SELECTION-GUIDE.md) - Choosing individual workflows
- [Party Mode Examples](Examples/PARTY-MODE-EXAMPLES.md) - Multi-agent collaboration
- [Module Setup Guides](ModuleSetup/) - Module configuration
- [CLI Command Reference](CLI-COMMAND-REFERENCE.md) - Command syntax
