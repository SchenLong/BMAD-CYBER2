---
name: 'step-01b-continue'
description: 'Handle workflow continuation for compliance audit preparation'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'

# File References
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/compliance/audit-prep-*-{project_name}.md'

step02File: '{workflow_path}/steps/step-02-control-inventory.md'
step03File: '{workflow_path}/steps/step-03-gap-assessment.md'
step04File: '{workflow_path}/steps/step-04-evidence-planning.md'
step05File: '{workflow_path}/steps/step-05-remediation-planning.md'
step06File: '{workflow_path}/steps/step-06-artifact-generation.md'
step07File: '{workflow_path}/steps/step-07-final-review.md'
---

# Step 1b: Workflow Continuation

## STEP GOAL:

To analyze existing audit preparation progress and route to appropriate next step for continuation.

## CONTINUATION SEQUENCE:

### 1. Load Existing Audit Preparation

Read {outputFile} including frontmatter.

Extract:
- `stepsCompleted` - Progress array
- `lastStep` - Last completed step
- `frameworks` - Target frameworks
- `primaryFramework` - Main framework
- `auditDate` - Scheduled audit date

### 2. Analyze State

**Step Mapping:**
- `1` = Initialization
- `2` = Control Inventory
- `3` = Gap Assessment
- `4` = Evidence Planning
- `5` = Remediation Planning
- `6` = Artifact Generation
- `7` = Final Review

### 3. Present Progress

Display:

"**Welcome Back to Compliance Audit Preparation**

**Framework:** {primaryFramework}
**Audit Date:** {auditDate}
**Started:** {date}

**Progress:**

✅ **Completed Steps:**
{list-completed-steps}

**Last Completed:** {lastStep}
**Next Step:** {next-step-description}"

### 4. Route to Next Step

Based on last completed step:

- IF step 1: Load {step02File}
- IF step 2: Load {step03File}
- IF step 3: Load {step04File}
- IF step 4: Load {step05File}
- IF step 5: Load {step06File}
- IF step 6: Load {step07File}
- IF step 7 OR workflowComplete: Display completion message

### 5. Execute Routing

Immediately load, read entire file, then execute appropriate step file.

---

## 🚨 SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Frontmatter loaded correctly
- Progress displayed accurately
- Routed to correct next step

### ❌ FAILURE:
- Incorrect routing
- Skipping steps
- Not preserving state
