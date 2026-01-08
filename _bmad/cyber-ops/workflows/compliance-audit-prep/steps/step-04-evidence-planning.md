---
name: 'step-04-evidence-planning'
description: 'Plan evidence collection for audit with evidence matrix and collection procedures'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'
thisStepFile: '{workflow_path}/steps/step-04-evidence-planning.md'
nextStepFile: '{workflow_path}/steps/step-05-remediation-planning.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
---

# Step 4: Evidence Collection Planning

## STEP GOAL:

To plan systematic evidence collection for all implemented controls and document evidence requirements for audit.

## EVIDENCE PLANNING PROCESS:

### 1. Evidence Requirements by Control

For each implemented control from Section 2:

"**Control: {Control ID}**

**Evidence Types Needed:**

- **Policies & Procedures** (written documentation)
- **Configuration Evidence** (system configs, settings screenshots)
- **Log Evidence** (audit logs, access logs, security logs)
- **Test Results** (vulnerability scans, penetration tests)
- **Training Records** (completion certificates, attendance)
- **Incident Records** (incident reports, response documentation)
- **Third-Party Attestations** (vendor SOC 2 reports, certifications)
- **Access Reviews** (user access reviews, privilege audits)
- **Change Records** (change management logs, approvals)

Select applicable evidence types and specify location/collection method:"

### 2. Evidence Matrix

Create comprehensive evidence matrix:

| Control ID | Evidence Type | Evidence Description | Location/Source | Collection Owner | Last Updated | Audit Ready |
|------------|---------------|---------------------|-----------------|------------------|--------------|-------------|
| {id} | {type} | {description} | {location} | {owner} | {date} | {yes/no} |

### 3. Evidence Collection Procedures

For each evidence type:

**Automated Collection:**
- System logs: Export from SIEM/logging platform
- Configs: Script to pull current configurations
- Reports: Automated report generation

**Manual Collection:**
- Policy documents: Gather from document management
- Training records: Export from LMS
- Reviews: Schedule and conduct reviews

### 4. Evidence Gaps

Identify controls where evidence is:
- Not available
- Incomplete
- Outdated
- Insufficient quality

### 5. Append Section 4

```markdown

---

## 4. Evidence Collection Plan

### 4.1 Evidence Matrix

{evidence-matrix-table}

### 4.2 Evidence Collection Schedule

{timeline-for-evidence-collection}

### 4.3 Evidence Gaps

{list-evidence-gaps-and-remediation}

### 4.4 Evidence Organization

**Directory Structure:**
```
/audit-evidence/{framework}/
├── policies/
├── procedures/
├── configurations/
├── logs/
├── testing/
├── training/
└── third-party/
```

---
```

### 6. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4]
lastStep: 'evidence-planning'
totalEvidenceItems: {count}
evidenceReadyPercentage: {percentage}
```

### 7. Menu

Display: **[C] Continue to Remediation Planning**

Load {nextStepFile}

---

## ✅ SUCCESS:
- Evidence matrix complete for all controls
- Collection procedures documented
- Evidence gaps identified
- Organization structure defined
