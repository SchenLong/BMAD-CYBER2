---
name: 'step-04-strategy'
description: 'Create 3-year strategic security roadmap with prioritized initiatives'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-04-strategy.md'
nextStepFile: '{workflow_path}/steps/step-05-governance.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
---

# Step 4: Strategic Planning & Roadmap

## STEP GOAL:

To develop a comprehensive 3-year strategic security roadmap with prioritized initiatives, quarterly milestones, budget alignment, and measurable success criteria.

## STRATEGIC PLANNING PROCESS:

### 1. Vision & Strategic Objectives

Define 3-year security program vision:
- Where should the security program be in 3 years?
- What business outcomes will security enable?
- What maturity level targets by domain?

Define 3-5 strategic objectives aligned with business goals.

### 2. Initiative Identification

Based on assessment gaps and risks, identify strategic initiatives:
- Gap remediation initiatives
- Risk mitigation projects
- Compliance requirements
- Business enablement initiatives
- Technology modernization
- Capability building

For each initiative:
- Name & description
- Strategic objective alignment
- Priority (P0/P1/P2/P3)
- Estimated effort (S/M/L/XL)
- Budget requirement
- Dependencies
- Success criteria

### 3. Roadmap Development

Create quarterly roadmap across 3 years:

**Year 1 (Foundation):**
- Q1: Critical gaps (P0), compliance foundations
- Q2: Risk mitigation (P1), tool implementation
- Q3: Process establishment, training
- Q4: Assessment and optimization

**Year 2 (Maturity):**
- Q1-Q4: Advanced capabilities, automation, integration

**Year 3 (Optimization):**
- Q1-Q4: Continuous improvement, innovation, business enablement

### 4. Initiative Prioritization Matrix

Create priority matrix:

| Initiative | Strategic Value | Risk Reduction | Effort | Budget | Dependencies | Priority | Quarter |
|------------|----------------|----------------|---------|--------|--------------|----------|---------|
| {initiative} | High/Med/Low | High/Med/Low | S/M/L/XL | $ | {deps} | P0-P3 | Q1 Y1 |

### 5. Resource & Budget Allocation

Map initiatives to budget categories from Step 2.
Validate initiatives fit within approved budget.
Identify any budget adjustments needed.

### 6. Success Metrics & KPIs

Define measurable success criteria:
- Security maturity improvement targets
- Risk reduction metrics
- Compliance achievement dates
- Incident response time improvements
- Mean time to detect/respond (MTTD/MTTR)
- Security awareness metrics

### 7. Append Section 4

Update {outputFile} with:
- 3-year strategic vision
- Strategic objectives
- Complete initiative catalog
- Quarterly roadmap with Gantt-style visualization
- Priority matrix
- Resource/budget alignment
- Success metrics & KPIs
- Dependencies and critical path

### 8. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4]
lastStep: 'strategy'
totalInitiatives: {count}
```

### 9. Present MENU

Display: **[P] Party Mode [A] Advanced Elicitation [C] Continue to Governance**

- IF P: "Collaborate on roadmap prioritization" → {partyModeWorkflow}
- IF A: "Critical review of strategic recommendations" → {advancedElicitationTask}
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:

- 3-year vision defined
- Strategic initiatives identified and prioritized
- Quarterly roadmap created
- Budget-aligned recommendations
- Success metrics established
- Section 4 appended
