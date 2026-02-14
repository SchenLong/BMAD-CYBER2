---
name: 'step-05b-cross-module-governance'
description: 'Cross-module governance framework validation - brings in Policy Analyst and Legal Counsel for comprehensive governance design'

workflow_path: '{project-root}/_bmad/cybersec-team/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-05b-cross-module-governance.md'
nextStepFile: '{workflow_path}/steps/step-06-reporting.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'vciso-advisory-party'
---

# Step 5b: Cross-Module Governance Validation

## STEP GOAL:

Validate the governance framework designed in Step 5 through cross-module lenses: Policy development expertise (Augustus) and Legal/regulatory requirements (Covenant). Ensure the governance framework is robust, enforceable, and aligned with organizational policies.

### When to Invoke:

This step should be offered after Step 5 (Governance Framework) when ANY of:
- Organization has complex policy landscape
- Multiple compliance frameworks apply
- Legal enforceability of policies is critical
- Board-level reporting is required
- Organization is in regulated industry

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Cross-Module Governance

**Bastion introduction:**

"Before we move to executive reporting, I'm recommending we validate the governance framework through cross-module expertise.

Security governance doesn't exist in isolation:
- **Policy expertise** ensures alignment with organizational governance structures
- **Legal expertise** ensures policies are enforceable and meet regulatory requirements

Let me bring in our cross-module governance experts."

### 2. Activate Cross-Module Team

**Load the vciso-advisory-party preset:**

"Activating cross-module governance validation team:

**Sentinel** (Compliance Guardian, cybersec-team)
- Already involved - technical compliance expertise
- Validates framework against compliance requirements

**Augustus** (Policy Analyst, strategy-team)
- Will assess policy structure and governance alignment
- Ensures fit with organizational governance model
- Reviews decision frameworks for effectiveness

**Covenant** (Counsel, legal-team)
- Will assess legal enforceability
- Reviews for regulatory alignment
- Identifies liability considerations"

### 3. Policy Analysis (Augustus)

**Augustus's governance assessment:**

"**Augustus here.** Reviewing from organizational policy perspective:

**Governance Structure Assessment:**

| Aspect | Assessment | Recommendation |
|--------|------------|----------------|
| Policy hierarchy | [Effective/Needs Work/Inadequate] | [detail] |
| Committee structure | [Effective/Needs Work/Inadequate] | [detail] |
| Decision frameworks | [Effective/Needs Work/Inadequate] | [detail] |
| Escalation paths | [Effective/Needs Work/Inadequate] | [detail] |
| RACI clarity | [Effective/Needs Work/Inadequate] | [detail] |

**Alignment with Organizational Governance:**
- Board-level integration: [assessment]
- Executive sponsorship: [assessment]
- Business unit alignment: [assessment]

**Policy Framework Recommendations:**
1. [Recommendation for policy structure]
2. [Recommendation for committee effectiveness]
3. [Recommendation for decision processes]

**Governance Maturity Assessment:**
Current level: [1-5]
Target level: [1-5]
Gap analysis: [key gaps]"

### 4. Legal Assessment (Covenant)

**Covenant's legal assessment:**

"**Covenant here.** Reviewing from legal/regulatory perspective:

**Enforceability Assessment:**

| Policy Type | Enforceable | Issues | Recommendation |
|-------------|-------------|--------|----------------|
| Information Security Policy | [Y/N/Partial] | [issues] | [fix] |
| Acceptable Use Policy | [Y/N/Partial] | [issues] | [fix] |
| Data Classification | [Y/N/Partial] | [issues] | [fix] |
| Incident Response | [Y/N/Partial] | [issues] | [fix] |

**Regulatory Alignment:**

| Regulation | Governance Requirements | Status |
|------------|------------------------|--------|
| [Applicable regulation] | [requirements] | [Met/Gap] |
| [Applicable regulation] | [requirements] | [Met/Gap] |

**Legal Considerations:**
- **Employment law:** [how policies affect employees]
- **Contractor obligations:** [third-party requirements]
- **Data protection:** [privacy governance requirements]
- **Liability:** [governance-related liability exposure]

**Required Legal Elements:**
1. [Required policy language or provision]
2. [Required approval/acknowledgment process]
3. [Required documentation/record keeping]

**Disclaimer:** This assessment is strategic guidance. Formal legal review of policy documents required before adoption."

### 5. Compliance Integration (Sentinel)

**Sentinel's compliance validation:**

"**Sentinel here.** Validating governance against compliance frameworks:

**Framework-Specific Governance Requirements:**

| Framework | Governance Requirement | Addressed | Gap |
|-----------|----------------------|-----------|-----|
| SOC 2 | Management commitment | [Y/N] | [gap] |
| SOC 2 | Risk assessment process | [Y/N] | [gap] |
| ISO 27001 | ISMS scope | [Y/N] | [gap] |
| ISO 27001 | Management review | [Y/N] | [gap] |
| GDPR | DPO designation | [Y/N/NA] | [gap] |
| GDPR | Data processing records | [Y/N/NA] | [gap] |
| [Other] | [requirement] | [Y/N] | [gap] |

**Compliance-Driven Governance Additions:**
1. [Required by framework X]
2. [Required by framework Y]

**Audit Readiness:**
- Governance documentation: [Ready/Needs Work]
- Evidence of execution: [Ready/Needs Work]
- Review records: [Ready/Needs Work]"

### 6. Synthesize Cross-Module Input

**Bastion synthesis:**

"Let me synthesize the cross-module governance validation:

**Governance Framework Validation Summary:**

| Domain | Status | Critical Actions |
|--------|--------|------------------|
| Policy Structure | [✓/⚠/✗] | [summary] |
| Legal Enforceability | [✓/⚠/✗] | [summary] |
| Compliance Alignment | [✓/⚠/✗] | [summary] |
| Organizational Fit | [✓/⚠/✗] | [summary] |

**Priority Enhancements:**

| Priority | Enhancement | Owner | Timeline |
|----------|-------------|-------|----------|
| 1 (Critical) | [enhancement] | [owner] | [timeline] |
| 2 (High) | [enhancement] | [owner] | [timeline] |
| 3 (Medium) | [enhancement] | [owner] | [timeline] |

**Governance Framework Score:**
- Current: [X/100]
- Target: [Y/100]
- Gap: [Z points]

**Board-Ready Status:** [Ready/Needs Work/Not Ready]"

### 7. Update Output File

**Append to {outputFile}:**

```markdown
## 5b. Cross-Module Governance Validation

### Policy Analysis (Augustus)
**Governance Structure Assessment:**
[Augustus's assessment content]

**Alignment Recommendations:**
[recommendations]

### Legal Assessment (Covenant)
**Enforceability Assessment:**
[Covenant's assessment content]

**Required Legal Elements:**
[requirements]

### Compliance Validation (Sentinel)
**Framework Requirements:**
[Sentinel's validation content]

### Validation Summary
| Domain | Status | Priority Actions |
|--------|--------|------------------|
[summary table]

### Priority Enhancements
[prioritized enhancements list]

### Governance Framework Score
- Current: [X/100]
- Target: [Y/100]
- Board-Ready: [status]
```

Update frontmatter: add `step-05b-cross-module-governance` to stepsCompleted

### 8. Menu Options

**Present options:**

"{user_name}, the cross-module governance validation is complete.

**Select:**
[D] Discuss specific governance enhancements with team
[P] Party Mode - Full discussion with all governance experts
[E] Generate enhanced governance documentation
[C] Continue to Executive Reporting"

### 9. Continue to Reporting

When user selects [C], load and follow {nextStepFile} (step-06-reporting.md) with cross-module governance validation incorporated.

---

## SUCCESS METRICS:

- All three perspectives (Policy, Legal, Compliance) provided input
- Governance framework validated against organizational needs
- Enforceability issues identified and addressed
- Compliance gaps documented with remediation plan
- Board-ready governance documentation
- Priority enhancements clearly identified

## FAILURE INDICATORS:

- Missing obvious governance gaps
- Not addressing legal enforceability
- Proceeding with compliance gaps unaddressed
- Not integrating organizational governance model
