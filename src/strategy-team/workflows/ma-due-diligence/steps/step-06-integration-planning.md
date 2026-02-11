---
name: step-06-integration-planning
description: Develop integration strategy and Day 1 readiness

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-07-stakeholder-comms.md'
previousStepFile: './step-05-risk-identification.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Integration Planning

## STEP GOAL

Develop a comprehensive integration strategy including Day 1 readiness, 100-day plan, and synergy capture roadmap to ensure successful post-merger integration.

### Role Reinforcement

- You are a Senior M&A Advisor with Lee (Technocrat) providing integration expertise
- Focus on practical, executable integration plans
- Address both quick wins and long-term integration
- Balance speed with thoroughness

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on actionable integration plans
- FORBIDDEN to assume integration will "work itself out"
- Address governance and decision rights clearly
- Document resource requirements

---

## Sequence of Instructions

### 1. Integration Philosophy

**Establish integration approach:**

"Let's establish the integration philosophy:"

**Integration model options:**

- Full integration (absorb target completely)
- Partial integration (selective combination)
- Holding company (preserve independence)
- Reverse integration (adopt target practices)

**Key questions:**

- What degree of integration is needed?
- What must be preserved?
- What's the optimal pace?
- Who leads integration?

### 2. Integration Governance

**Design governance structure:**

"Let's design the integration governance:"

**Integration Management Office (IMO):**

- IMO Leader
- Workstream leads
- Reporting structure
- Decision rights

**Steering Committee:**

- Membership
- Meeting cadence
- Escalation process

**Key decisions to make:**

| Decision | Owner | Timeline |
|----------|-------|----------|
| Brand strategy | | |
| Org structure | | |
| Systems roadmap | | |
| Location strategy | | |
| Compensation alignment | | |

### 3. Day 1 Readiness

**Plan Day 1 requirements:**

"Let's ensure Day 1 readiness:"

**Must-haves for Day 1:**

- [ ] Legal close complete
- [ ] Leadership announced
- [ ] Employee communications ready
- [ ] Customer communications ready
- [ ] Supplier communications ready
- [ ] Systems access enabled
- [ ] Payroll/HR transitioned or bridged
- [ ] Key talent retained

**Day 1 communications plan:**

| Audience | Message | Channel | Owner |
|----------|---------|---------|-------|
| Target employees | | | |
| Acquirer employees | | | |
| Customers | | | |
| Suppliers | | | |
| Media | | | |
| Investors | | | |

### 4. First 100 Days Plan

**Invoke Lee (Technocrat) for operational planning:**

"Let me bring in Lee's operational planning perspective..."

**100-Day integration milestones:**

| Days | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1-30 | Stabilization | Leadership in place, communications complete, operations stable |
| 31-60 | Assessment | Detailed integration plans, synergy validation, quick wins identified |
| 61-100 | Execution | Quick wins captured, integration underway, synergy tracking live |

**Workstream plans:**
For each functional area, define:

- Leader
- Day 1 requirements
- 30-day objectives
- 100-day objectives
- Resource needs

### 5. Synergy Capture Plan

**Design synergy realization roadmap:**

"Let's plan synergy capture:"

**Cost synergies timeline:**

| Synergy | Value | Start | Full Run-Rate | Investment |
|---------|-------|-------|---------------|------------|
| [Category] | | | | |

**Revenue synergies timeline:**

| Synergy | Value | Start | Full Run-Rate | Investment |
|---------|-------|-------|---------------|------------|
| [Category] | | | | |

**Synergy tracking:**

- How will synergies be measured?
- Who owns synergy delivery?
- What's the governance process?
- How handle shortfalls?

### 6. Integration Risks & Mitigations

**Plan for integration challenges:**

"Let's address key integration risks:"

| Risk | Mitigation | Owner |
|------|------------|-------|
| Talent flight | Retention packages, quick role clarity | |
| Customer churn | Proactive outreach, service continuity | |
| Systems failure | Parallel running, contingency plans | |
| Culture clash | Culture integration program | |
| Synergy shortfall | Conservative targets, contingency | |

### 7. Resource Requirements

**Document integration resources:**

"Let's identify resource requirements:"

- Integration team (FTEs)
- External advisors needed
- Technology investments
- One-time integration costs
- Timeline requirements

**Total integration investment:** $X

### 8. Update Output File

**Append to the Integration Planning section:**

```markdown
## 6. Integration Planning

### Integration Philosophy
**Model:** [Selected approach]
**Rationale:** [Why this approach]

### Integration Governance
[Structure from section 2]

### Day 1 Readiness Checklist
[Checklist from section 3]

### Day 1 Communications Plan
[Table from section 3]

### First 100 Days Plan
[Timeline and milestones from section 4]

### Synergy Capture Roadmap
[Tables from section 5]

### Integration Risks & Mitigations
[Table from section 6]

### Resource Requirements
**Team:** [details]
**Investment:** $X
**Timeline:** [duration]

### Lee's Integration View
"[Operational perspective]"
```

Update frontmatter: Add `step-06-integration-planning` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the integration planning summary:

**Integration Model:** [approach]

**Day 1 Readiness:** [status]

**100-Day Priorities:**

1. [priority]
2. [priority]
3. [priority]

**Synergy Capture Timeline:**

- Year 1: $X
- Year 2: $X
- Full run-rate: $X

**Integration Investment Required:** $X

**Key Integration Risks:**

1. [risk + mitigation]
2. [risk + mitigation]

**Lee's View:**
[Brief operational perspective]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Stakeholder Communications"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-07-stakeholder-comms.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Integration philosophy established
- Governance structure defined
- Day 1 readiness planned
- 100-day plan developed
- Synergy capture roadmap created
- Resource requirements documented
- Output file updated

### SYSTEM FAILURE

- Vague integration plans
- No Day 1 readiness checklist
- Skipping synergy tracking
- Not updating output file
