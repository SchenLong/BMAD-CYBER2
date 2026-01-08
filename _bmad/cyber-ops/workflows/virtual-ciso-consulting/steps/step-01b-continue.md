---
name: 'step-01b-continue'
description: 'Resume existing vCISO engagement workflow from saved state'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'

# Step routing based on completion state
step02File: '{workflow_path}/steps/step-02-budget.md'
step03File: '{workflow_path}/steps/step-03-assessment.md'
step04File: '{workflow_path}/steps/step-04-strategy.md'
step05File: '{workflow_path}/steps/step-05-governance.md'
step06File: '{workflow_path}/steps/step-06-reporting.md'
step07File: '{workflow_path}/steps/step-07-vendor-risk.md'
step08File: '{workflow_path}/steps/step-08-advisory.md'
---

# Step 1b: Continuation Handler

## STEP GOAL:

To resume an existing vCISO engagement workflow from its last saved state by reading the frontmatter and routing to the appropriate next step.

## MANDATORY EXECUTION RULES:

- 📖 Read the output document's frontmatter to determine state
- 🎯 Route to the correct next step based on `stepsCompleted` array
- 🚫 DO NOT re-execute completed steps
- ✅ Speak in your Agent communication style with `{communication_language}`

## CONTINUATION SEQUENCE:

### 1. Load Existing Document

The document has already been detected in step-01-init. Read it completely:

```
Read: {outputFile}
```

### 2. Parse Frontmatter

Extract from frontmatter:
- `stepsCompleted`: Array of completed step numbers
- `lastStep`: Name of last completed step
- `clientName`: Client organization name
- `workflowComplete`: Boolean indicating if workflow is done

### 3. Determine Workflow State

**If `workflowComplete: true`:**

Display:

"**vCISO Engagement Complete**

This engagement for **{clientName}** was completed on {date}.

All 8 sections have been finalized:
✅ Engagement Overview
✅ Budget & Resource Plan
✅ Current State Assessment
✅ Strategic Security Roadmap
✅ Governance Framework
✅ Executive Communications
✅ Vendor Risk Program
✅ Advisory Schedule

**Options:**
1. Review/export the final document
2. Modify a specific section (will reopen that step)
3. Start a new engagement

What would you like to do?"

Wait for user response. Handle accordingly.

**If `workflowComplete: false`:**

Proceed to step routing logic below.

### 4. Route to Next Step

Based on `stepsCompleted` array, route to the next incomplete step:

**Routing Logic:**

```
IF 8 in stepsCompleted:
  → Workflow should be complete, but workflowComplete not set
  → Display error, offer to finalize or review

IF 7 in stepsCompleted AND 8 not in stepsCompleted:
  → Load step-08-advisory.md
  → Display: "Resuming at Step 8 of 8: Ongoing Advisory & Review"

IF 6 in stepsCompleted AND 7 not in stepsCompleted:
  → Load step-07-vendor-risk.md
  → Display: "Resuming at Step 7 of 8: Vendor/Third-Party Risk"

IF 5 in stepsCompleted AND 6 not in stepsCompleted:
  → Load step-06-reporting.md
  → Display: "Resuming at Step 6 of 8: Board/Executive Reporting"

IF 4 in stepsCompleted AND 5 not in stepsCompleted:
  → Load step-05-governance.md
  → Display: "Resuming at Step 5 of 8: Governance Framework Design"

IF 3 in stepsCompleted AND 4 not in stepsCompleted:
  → Load step-04-strategy.md
  → Display: "Resuming at Step 4 of 8: Strategic Planning & Roadmap"

IF 2 in stepsCompleted AND 3 not in stepsCompleted:
  → Load step-03-assessment.md
  → Display: "Resuming at Step 3 of 8: Current State Assessment"

IF 1 in stepsCompleted AND 2 not in stepsCompleted:
  → Load step-02-budget.md
  → Display: "Resuming at Step 2 of 8: Budget & Resource Planning"

IF stepsCompleted is empty OR only contains [1]:
  → Load step-02-budget.md
  → Display: "Starting Step 2 of 8: Budget & Resource Planning"
```

### 5. Display Resumption Message

Before loading the next step, display:

"**Resuming vCISO Engagement: {clientName}**

**Progress:** {steps-completed-count} of 8 steps completed

**Completed Sections:**
{list-completed-sections-with-checkmarks}

**Next:** {next-step-name} (Step {next-step-number} of 8)

Continuing from where you left off..."

### 6. Load Next Step

Immediately load, read entire file, then execute the determined next step file.

---

## 🚨 CRITICAL RULES

- ✅ **ALWAYS** read the output document first
- ✅ **ALWAYS** check `stepsCompleted` array accurately
- ✅ **ALWAYS** route to the correct next step
- 🚫 **NEVER** re-execute completed steps
- 🚫 **NEVER** skip ahead to incomplete steps out of order
- 🚫 **NEVER** modify the document in this step

**This step is pure routing logic with no content generation.**
