---

name: 'step-01b-continue'
description: 'Handle Security Awareness Training workflow continuation from previous session'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'
workflowFile: '{workflow_path}/workflow.md'

# Step File References
step02File: '{workflow_path}/steps/step-02-risk-assessment.md'
step03File: '{workflow_path}/steps/step-03-content-development.md'
step04File: '{workflow_path}/steps/step-04-phishing-simulation.md'
step05File: '{workflow_path}/steps/step-05-delivery-strategy.md'
step06File: '{workflow_path}/steps/step-06-metrics-measurement.md'
step07File: '{workflow_path}/steps/step-07-continuous-improvement.md'

---

# Step 1B: Security Awareness Training Continuation

## STEP GOAL:

To resume the Security Awareness Training workflow from where it was left off, ensuring smooth continuation without loss of context.

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
- `date`: Original workflow start date

**Step Mapping:**
- Step 1: Initialization & Program Assessment
- Step 2: Human Risk Assessment
- Step 3: Training Content Development
- Step 4: Phishing Simulation Strategy
- Step 5: Delivery Strategy
- Step 6: Metrics & Measurement
- Step 7: Continuous Improvement

### 2. Determine Next Step

Based on the last value in `stepsCompleted` array:

| Last Completed | Next Step File | Next Step Description |
|----------------|----------------|----------------------|
| 1 | {step02File} | Human Risk Assessment |
| 2 | {step03File} | Training Content Development |
| 3 | {step04File} | Phishing Simulation Strategy |
| 4 | {step05File} | Delivery Strategy |
| 5 | {step06File} | Metrics & Measurement |
| 6 | {step07File} | Continuous Improvement |

### 3. Welcome Back Dialog

"**Welcome back to your Security Awareness Training Program for {project_name}!**

I see we've completed [X] steps of the program design.

**Progress Summary:**
- Program Assessment Complete
[If step 2 complete:] - Human Risk Assessment Complete
[If step 3 complete:] - Training Content Designed
[If step 4 complete:] - Phishing Strategy Defined
[If step 5 complete:] - Delivery Strategy Complete
[If step 6 complete:] - Metrics Framework Complete

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
