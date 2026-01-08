---
name: 'step-03-gap-assessment'
description: 'Identify and prioritize compliance gaps between current state and framework requirements'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'
thisStepFile: '{workflow_path}/steps/step-03-gap-assessment.md'
nextStepFile: '{workflow_path}/steps/step-04-evidence-planning.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Gap Assessment

## STEP GOAL:

To identify missing or insufficient controls, assess gap severity, and prioritize remediation based on risk and audit impact.

## GAP ASSESSMENT PROCESS:

### 1. Initialize Gap Analysis

Display:

"**Gap Assessment**

**Current Coverage:** {coveragePercentage}%

We'll now analyze gaps between your current controls and {framework} requirements."

### 2. Identify Control Gaps

From Section 2 (Control Inventory), identify:

**Missing Controls:**
- Framework requirements with "Not Implemented" status
- Critical controls completely absent

**Insufficient Controls:**
- Controls marked "Partially Effective"
- Controls with incomplete evidence
- Controls not meeting framework specifications

**Outdated Controls:**
- Controls not updated per framework requirements
- Policies/procedures not reviewed within required timeframe

For each gap:

"**Gap: {Control ID} - {Control Name}**

**Framework Requirement:**
{what-framework-requires}

**Current State:**
{current-implementation-or-none}

**Gap Type:**
- Missing (not implemented)
- Insufficient (partially effective)
- Outdated (needs update)

**Gap Description:**
{detailed-description-of-gap}

Select gap type and describe:"

Collect gap details.

### 3. Assess Gap Severity

For each gap:

"**Gap Severity Assessment**

**Risk Impact:**

If this control remains missing/insufficient during audit:
- High: Likely audit failure, critical compliance risk
- Medium: Potential audit findings, remediation required
- Low: Observations, best practice recommendations

Rate risk impact (High/Medium/Low):"

Collect risk rating.

"**Audit Impact:**

How likely is auditor to test this control?
- High: Core requirement, always tested
- Medium: Commonly tested, depends on auditor
- Low: May not be tested in detail

Rate audit impact (High/Medium/Low):"

Collect audit impact.

"**Remediation Complexity:**

How difficult/time-consuming to remediate?
- High: Major project, significant resources (weeks/months)
- Medium: Moderate effort, some resources (days/weeks)
- Low: Quick fix, minimal resources (hours/days)

Rate complexity (High/Medium/Low):"

Collect complexity rating.

### 4. Calculate Gap Priority

**Priority Matrix:**

| Risk Impact | Audit Impact | Priority |
|-------------|--------------|----------|
| High | High | P0 (Critical) |
| High | Medium | P1 (High) |
| High | Low | P2 (Medium) |
| Medium | High | P1 (High) |
| Medium | Medium | P2 (Medium) |
| Medium | Low | P3 (Low) |
| Low | High | P2 (Medium) |
| Low | Medium | P3 (Low) |
| Low | Low | P4 (Deferred) |

### 5. Prioritize Gaps

Sort gaps by:
1. Priority (P0 → P4)
2. Remediation complexity (Low → High)
3. Audit date proximity

### 6. Create Gap Summary

Display:

"**Gap Assessment Summary**

**Total Gaps Identified:** {count}

**By Priority:**
- P0 (Critical): {count} gaps - **Must fix before audit**
- P1 (High): {count} gaps - **Should fix before audit**
- P2 (Medium): {count} gaps - **Nice to fix**
- P3 (Low): {count} gaps - **Post-audit improvement**
- P4 (Deferred): {count} gaps - **Future consideration**

**By Type:**
- Missing Controls: {count}
- Insufficient Controls: {count}
- Outdated Controls: {count}

**Critical Gaps (P0/P1):**
{list-critical-gaps}"

### 7. Append Section 3 to Document

```markdown

---

## 3. Gap Assessment

### 3.1 Gap Analysis Matrix

| Gap ID | Control | Gap Type | Risk | Audit Impact | Complexity | Priority | Status |
|--------|---------|----------|------|--------------|------------|----------|--------|
{gap-matrix-rows}

### 3.2 Gap Summary

**Total Gaps:** {count}

**Priority Distribution:**
- 🔴 P0 (Critical): {count}
- 🟠 P1 (High): {count}
- 🟡 P2 (Medium): {count}
- 🟢 P3 (Low): {count}
- ⚪ P4 (Deferred): {count}

### 3.3 Critical Gaps (P0/P1)

{for-each-critical-gap}:

**{Gap ID}: {Control Name}**
- **Requirement:** {framework-requirement}
- **Current State:** {current-state}
- **Gap:** {gap-description}
- **Risk:** {risk-explanation}
- **Priority:** {priority-with-justification}

### 3.4 Gap Categories

**By Framework Section:**
{gaps-grouped-by-framework-section}

**By Owner:**
{gaps-grouped-by-responsible-team}

---
```

### 8. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3]
lastStep: 'gap-assessment'
totalGaps: {count}
criticalGaps: {P0+P1-count}
gapCoverageTarget: {percentage}
```

### 9. Present MENU

Display: **[P] Party Mode [C] Continue to Evidence Planning**

- IF P: "Review gap assessment for completeness and priority accuracy"
- IF C: Load {nextStepFile}

---

## 🚨 SUCCESS METRICS

### ✅ SUCCESS:
- All gaps identified and documented
- Severity and priority assigned
- Gaps prioritized by risk and audit impact
- Critical gaps (P0/P1) clearly highlighted
- Section 3 appended

### ❌ FAILURE:
- Missing gaps
- No priority assignment
- Unclear remediation needs
