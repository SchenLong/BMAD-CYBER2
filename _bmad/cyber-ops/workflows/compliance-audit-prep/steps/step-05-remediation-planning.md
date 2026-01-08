---
name: 'step-05-remediation-planning'
description: 'Create prioritized remediation roadmap for compliance gaps'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'
thisStepFile: '{workflow_path}/steps/step-05-remediation-planning.md'
nextStepFile: '{workflow_path}/steps/step-06-artifact-generation.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Remediation Planning

## STEP GOAL:

To create actionable remediation roadmap addressing all critical gaps before audit date.

## REMEDIATION PLANNING PROCESS:

### 1. Load Gap Data

From Section 3, retrieve all P0/P1 gaps.

Display:

"**Remediation Planning**

**Critical Gaps to Remediate:** {P0+P1-count}
**Time Until Audit:** {weeks} weeks

We'll create phased remediation plan."

### 2. Phase Planning

**Phase 1: Immediate (Week 1-2)** - P0 Critical
**Phase 2: Pre-Audit (Week 3-4)** - P1 High Priority
**Phase 3: Nice-to-Have** - P2 Medium
**Phase 4: Post-Audit** - P3/P4 Deferred

### 3. For Each Gap Create Remediation Plan

"**Gap: {Gap ID}**

**Remediation Approach:**

Describe how you will address this gap:
- Specific actions required
- Resources needed (people, tools, budget)
- Dependencies
- Success criteria

Remediation approach:"

Collect remediation details.

"**Ownership:**

Who will own remediating this gap?
- Primary owner (person/team)
- Support required (if any)
- Approval needed (if any)

Assign ownership:"

"**Timeline:**

When will this be completed?
- Start date
- Target completion date
- Milestones (if applicable)

Provide timeline:"

"**Effort Estimate:**

Estimated effort:
- S (Small): < 1 week
- M (Medium): 1-2 weeks
- L (Large): 3-4 weeks
- XL (Extra Large): > 1 month

Estimate effort:"

### 4. Create Remediation Roadmap

Gantt-style roadmap showing:
- All remediations on timeline
- Dependencies and sequencing
- Resource allocation
- Milestones and checkpoints

### 5. Risk Assessment

"**Remediation Risks:**

What could prevent completing remediation on time?
- Resource constraints
- Technical complexity
- Dependencies on third parties
- Budget limitations

Identify risks and mitigation strategies:"

### 6. Append Section 5

```markdown

---

## 5. Remediation Roadmap

### 5.1 Remediation Plan

| Gap ID | Remediation Action | Owner | Start Date | Target Date | Effort | Phase | Status |
|--------|-------------------|-------|------------|-------------|--------|-------|--------|
{remediation-plan-rows}

### 5.2 Phased Implementation

**Phase 1: Immediate (P0 Critical)**
{P0-remediations-with-timeline}

**Est. Total Effort:** {P0-effort-sum}
**Completion Target:** {phase-1-end-date}

---

**Phase 2: Pre-Audit (P1 High)**
{P1-remediations-with-timeline}

**Est. Total Effort:** {P1-effort-sum}
**Completion Target:** {audit-date}

---

**Phase 3: Nice-to-Have (P2)**
{P2-remediations}

---

**Phase 4: Post-Audit (P3/P4)**
{P3-P4-remediations}

### 5.3 Resource Requirements

**By Team:**
{resource-allocation-by-team}

**By Phase:**
{resource-allocation-by-phase}

### 5.4 Remediation Risks

{risks-and-mitigation-strategies}

### 5.5 Progress Tracking

Weekly checkpoints to review:
- Remediation completion status
- Blockers and risks
- Timeline adjustments

---
```

### 7. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5]
lastStep: 'remediation-planning'
totalRemediations: {count}
criticalRemediations: {P0+P1-count}
estimatedEffort: {total-weeks}
```

### 8. Menu

Display: **[P] Party Mode [C] Continue to Artifact Generation**

- IF P: "Review remediation plan for feasibility and completeness"
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:
- All gaps have remediation plans
- Ownership assigned
- Timeline realistic for audit date
- Phased approach clear
- Risks identified
