---
name: 'step-01b-continue'
description: 'Continue infrastructure security testing from saved state'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
nextStepFile: '{workflow_path}/steps/step-02-server-hardening.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 1B: Continue Infrastructure Security Testing

## CONTINUATION HANDLER

### 1. Load Saved State

Read {outputFile} and extract:

- `stepsCompleted` array from frontmatter
- All documented sections
- Infrastructure scope information

### 2. Display Progress

"**Infrastructure Security Testing Session Resumed**

**Scope:** [Infrastructure from document]
**Started:** [created_date from frontmatter]

**Steps Completed:**
[List completed steps with checkmarks]

**Current Position:** Step [next incomplete step]

Ready to continue assessment."

### 3. Navigation

Determine last completed step and load appropriate step file:

- If `stepsCompleted` includes 1 but not 2 → Load step-02-server-hardening.md
- If `stepsCompleted` includes 2 but not 3 → Load step-03-container-security.md
- If `stepsCompleted` includes 3 but not 4 → Load step-04-kubernetes.md
- If `stepsCompleted` includes 4 but not 5 → Load step-05-cicd-security.md
- If `stepsCompleted` includes 5 but not 6 → Load step-06-secrets-management.md
- If `stepsCompleted` includes 6 but not 7 → Load step-07-iac-review.md
- If `stepsCompleted` includes 7 but not 8 → Load step-08-findings-remediation.md

## MENU

Display: [C] Continue from Last Step [R] Restart from Beginning [J] Jump to Specific Step

---

## CRITICAL NOTE

For [J] Jump, display available steps and wait for user selection before loading step file.
