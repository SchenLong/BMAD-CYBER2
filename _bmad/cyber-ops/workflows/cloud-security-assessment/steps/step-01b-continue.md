---

name: 'step-01b-continue'
description: 'Handle Cloud Security Assessment workflow continuation from previous session'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'
workflowFile: '{workflow_path}/workflow.md'

# Step File References
step02File: '{workflow_path}/steps/step-02-iam-assessment.md'
step03File: '{workflow_path}/steps/step-03-network-security.md'
step04File: '{workflow_path}/steps/step-04-data-protection.md'
step05File: '{workflow_path}/steps/step-05-logging-monitoring.md'
step06File: '{workflow_path}/steps/step-06-compute-security.md'
step07File: '{workflow_path}/steps/step-07-compliance-mapping.md'
step08File: '{workflow_path}/steps/step-08-remediation.md'
step09File: '{workflow_path}/steps/step-09-report-generation.md'

---

# Step 1B: Cloud Security Assessment Continuation

## STEP GOAL:

To resume the Cloud Security Assessment workflow from where it was left off, ensuring smooth continuation without loss of context.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on analyzing and resuming workflow state
- FORBIDDEN to modify content completed in previous steps
- DETECT exact continuation point from frontmatter

## CONTINUATION SEQUENCE:

### 1. Analyze Current State

Review the frontmatter of {outputFile} to understand:

- `stepsCompleted`: Which steps are already done
- `lastStep`: Name of last completed step
- `cloudProviders`: Cloud platforms in scope
- `complianceFrameworks`: Compliance requirements

**Step Mapping:**
- Step 1: Initialization & Scope
- Step 2: IAM Assessment
- Step 3: Network Security
- Step 4: Data Protection
- Step 5: Logging & Monitoring
- Step 6: Compute Security
- Step 7: Compliance Mapping
- Step 8: Remediation Planning
- Step 9: Report Generation

### 2. Determine Next Step

Based on the last value in `stepsCompleted` array:

| Last Completed | Next Step File | Next Step Description |
|----------------|----------------|----------------------|
| 1 | {step02File} | IAM Assessment |
| 2 | {step03File} | Network Security |
| 3 | {step04File} | Data Protection |
| 4 | {step05File} | Logging & Monitoring |
| 5 | {step06File} | Compute Security |
| 6 | {step07File} | Compliance Mapping |
| 7 | {step08File} | Remediation Planning |
| 8 | {step09File} | Report Generation |

### 3. Welcome Back Dialog

"**Welcome back to your Cloud Security Assessment for {project_name}!**

I see we've completed [X] steps of the assessment.

**Progress Summary:**
- Scope & Initialization Complete
[If step 2 complete:] - IAM Assessment Complete
[If step 3 complete:] - Network Security Complete
[If step 4 complete:] - Data Protection Complete
[If step 5 complete:] - Logging & Monitoring Complete
[If step 6 complete:] - Compute Security Complete
[If step 7 complete:] - Compliance Mapping Complete
[If step 8 complete:] - Remediation Planning Complete

**Next Step:** [Description]

Are you ready to continue?"

### 4. Present MENU OPTIONS

Display: **Resuming - Select an Option:** [C] Continue to [Next Step] [R] Review Previous Work

#### Menu Handling Logic:

- IF C: Update frontmatter `lastContinued`, then load and execute appropriate next step file
- IF R: Display summary of completed sections, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected will you update frontmatter and load the next step file.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
