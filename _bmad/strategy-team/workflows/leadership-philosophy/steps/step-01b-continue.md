---
name: step-01b-continue
description: Resume an existing leadership philosophy development

outputFile: '{output_folder}/leadership/leadership-philosophy-{name}.md'
nextStepFile: './step-02-values-exploration.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Leadership Philosophy

## STEP GOAL:

Resume a previously started leadership philosophy development from where it left off.

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Load Existing Philosophy

**Ask the user:**

"Welcome back. Let me find your leadership philosophy work.

**What name was used for your philosophy file?** (This helps me locate it)"

### 2. Locate and Load File

Once user provides name:
1. Construct path: `{output_folder}/leadership/leadership-philosophy-{name}.md`
2. Attempt to read the file
3. If not found, offer to search or start fresh

### 3. Review Progress

**Read the frontmatter** to determine `stepsCompleted`:

Display progress:
"I found your philosophy work. Here's where we left off:

**Leader:** [from file]
**Steps Completed:** [list from stepsCompleted array]
**Status:** [from frontmatter]

**Last Content Added:**
[Summary of most recent section]"

### 4. Determine Resume Point

Based on `stepsCompleted`, identify the next step:

| If stepsCompleted includes | Resume at |
|---------------------------|-----------|
| step-01-init only | step-02-values-exploration.md |
| step-02-values-exploration | step-03-leadership-style.md |
| step-03-leadership-style | step-04-principles.md |
| step-04-principles | step-05-legacy-vision.md |
| step-05-legacy-vision | step-06-philosophy-document.md |
| step-06-philosophy-document | Complete - offer to revise |

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue from [Next Step Name] [R] Review/Revise Earlier Section [S] Start Over [P] Party Mode"

#### Menu Handling Logic:
- IF C: Load and follow the appropriate next step file
- IF R: Ask which section to revise, navigate there
- IF S: Confirm, then follow step-01-init.md fresh
- IF P: Execute {partyModeWorkflow}, then redisplay menu

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- Preserve all existing content when resuming
- Update stepsCompleted appropriately as work continues

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Existing file located and loaded
- Progress accurately identified
- User can resume seamlessly
- No content lost

### SYSTEM FAILURE:
- Cannot find existing work
- Losing or overwriting previous content
- Not picking up from correct point
