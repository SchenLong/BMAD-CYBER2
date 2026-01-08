---
name: 'step-06-artifact-generation'
description: 'Generate audit artifacts including control matrices, readiness checklist, and executive summary'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'
thisStepFile: '{workflow_path}/steps/step-06-artifact-generation.md'
nextStepFile: '{workflow_path}/steps/step-07-final-review.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
---

# Step 6: Audit Artifact Generation

## STEP GOAL:

To generate all required audit artifacts including control mapping matrices, evidence packages, and stakeholder documentation.

## ARTIFACT GENERATION PROCESS:

### 1. Generate Control Mapping Matrix

From Sections 2 and 3, create comprehensive matrix:

**Framework Control Mapping:**

| Framework Req | Control ID | Control Description | Implementation | Evidence | Status | Notes |
|---------------|------------|---------------------|----------------|----------|--------|-------|
{complete-control-mapping}

**Export Formats:**
- Excel spreadsheet (for auditors)
- PDF document (for executives)
- Markdown (for documentation)

### 2. Create Audit Readiness Checklist

```markdown
## Audit Readiness Checklist

**Framework:** {framework}
**Organization:** {project_name}
**Audit Date:** {audit-date}

### Pre-Audit Preparation

- [ ] All critical gaps (P0) remediated
- [ ] All high-priority gaps (P1) remediated or accepted
- [ ] Evidence collected for all implemented controls
- [ ] Evidence organized in audit folder structure
- [ ] Control owners briefed on audit process
- [ ] Auditor access provisioned (systems, documentation)
- [ ] Audit schedule confirmed
- [ ] Stakeholders notified

### Documentation Ready

- [ ] Policies and procedures current and approved
- [ ] Risk assessments completed and documented
- [ ] Incident response plans tested and documented
- [ ] Business continuity plans tested
- [ ] Vendor risk assessments completed
- [ ] Training records up-to-date
- [ ] Access review documentation current

### Technical Controls Ready

- [ ] System configurations documented
- [ ] Security tools configured and logging
- [ ] Vulnerability scans completed and remediated
- [ ] Penetration testing completed (if required)
- [ ] Patch management current
- [ ] Backup and recovery tested
- [ ] Monitoring and alerting functional

### Personnel Ready

- [ ] IT/Security teams briefed on audit
- [ ] Control owners identified and prepared
- [ ] Management aware of audit scope and timeline
- [ ] Point of contact designated for auditor
- [ ] Interview preparation completed
```

### 3. Generate Executive Summary

"**Executive Summary for Stakeholders:**

Create 1-2 page summary including:

**Audit Overview:**
- Framework and scope
- Audit date and duration
- Organizational impact

**Current Status:**
- Control coverage: {percentage}%
- Gaps identified: {count}
- Critical gaps remediated: {count}/{total}

**Readiness Assessment:**
- Overall readiness: {Strong/Moderate/Needs Improvement}
- Key strengths: {list}
- Areas of concern: {list}

**Action Items:**
- Critical actions before audit: {list}
- Responsible parties: {list}
- Timeline: {dates}

**Risk Assessment:**
- Likelihood of successful audit: {High/Medium/Low}
- Potential findings: {list}
- Mitigation strategies: {list}

Provide input for executive summary:"

### 4. Create Evidence Package Index

```markdown
## Evidence Package Index

**Audit:** {framework}
**Date Compiled:** {current-date}

### Evidence Files by Control

{for-each-control}:

**{Control ID}: {Control Name}**

Evidence Files:
1. {evidence-file-1} - {description} - Location: {path}
2. {evidence-file-2} - {description} - Location: {path}
...

Last Updated: {date}
Prepared By: {owner}
```

### 5. Generate Gap Exception Report

For any P0/P1 gaps NOT remediated before audit:

```markdown
## Gap Exception Report

**Framework:** {framework}
**Reporting Date:** {current-date}

### Unremediated Critical Gaps

{for-each-unremediated-P0-P1}:

**Gap ID:** {id}
**Control:** {control-name}
**Priority:** {priority}
**Status:** Not Remediated

**Reason for Exception:**
{explanation-why-not-remediated}

**Compensating Controls:**
{alternative-controls-in-place}

**Remediation Plan Post-Audit:**
{plan-to-remediate-after-audit}

**Risk Acceptance:**
- Accepted By: {management-name}
- Date: {date}
- Justification: {business-justification}
```

### 6. Append Section 6

```markdown

---

## 6. Audit Artifacts

### 6.1 Control Mapping Matrix

{complete-framework-control-mapping-matrix}

### 6.2 Audit Readiness Checklist

{readiness-checklist-with-status}

**Overall Readiness Score:** {score}/100

**Readiness Status:** {Strong|Moderate|Needs Improvement}

### 6.3 Executive Summary

{executive-summary-for-stakeholders}

### 6.4 Evidence Package Index

{evidence-file-index-by-control}

**Total Evidence Files:** {count}
**Evidence Completeness:** {percentage}%

### 6.5 Gap Exception Report

{exceptions-for-unremediated-critical-gaps}

**Total Exceptions:** {count}
**Management Approvals:** {approved-count}/{total-count}

### 6.6 Artifact Distribution

**Artifacts Generated:**
1. Control Mapping Matrix (Excel, PDF)
2. Audit Readiness Checklist
3. Executive Summary
4. Evidence Package Index
5. Gap Exception Report

**Distribution List:**
- Auditor: Control Mapping, Evidence Index
- Executive Team: Executive Summary, Readiness Checklist
- Control Owners: Relevant sections
- Compliance Team: Complete package

---
```

### 7. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6]
lastStep: 'artifact-generation'
readinessScore: {score}
readinessStatus: '{status}'
artifactsGenerated: true
```

### 8. Menu

Display: **[C] Continue to Final Review**

Load {nextStepFile}

---

## ✅ SUCCESS:
- All audit artifacts generated
- Control mapping matrix complete
- Readiness checklist created
- Executive summary prepared
- Evidence indexed
- Exceptions documented
