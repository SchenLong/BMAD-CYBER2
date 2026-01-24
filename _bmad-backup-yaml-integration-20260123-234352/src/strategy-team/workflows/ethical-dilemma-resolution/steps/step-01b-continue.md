---
name: step-01b-continue
description: Resume an existing ethical dilemma resolution

outputFile: '{output_folder}/ethics/ethical-resolution-{dilemma}.md'
nextStepFile: './step-02-stakeholder-impact.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Ethical Dilemma Resolution

## STEP GOAL:

Resume a previously started ethical dilemma resolution from where it left off.

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Load Existing Resolution

**Ask the user:**

"Welcome back to Ethical Dilemma Resolution.

To continue your work, I need to find your existing resolution file.

**What dilemma were you working through?** (This helps me locate your file)"

### 2. Locate and Load File

Once user provides dilemma name:
1. Construct path: `{output_folder}/ethics/ethical-resolution-{dilemma}.md`
2. Attempt to read the file
3. If not found, offer to search or start fresh

### 3. Review Progress

**Read the frontmatter** to determine `stepsCompleted`:

Display progress:
"I found your resolution work. Here's where we left off:

**Dilemma:** [from file]
**Steps Completed:** [list from stepsCompleted array]
**Status:** [from frontmatter]

**Last Content Added:**
[Summary of most recent section]"

### 4. Determine Resume Point

Based on `stepsCompleted`, identify the next step:

| If stepsCompleted includes | Resume at |
|---------------------------|-----------|
| step-01-init only | step-02-stakeholder-impact.md |
| step-02-stakeholder-impact | step-03-framework-analysis.md |
| step-03-framework-analysis | step-04-traditional-wisdom.md |
| step-04-traditional-wisdom | step-05-justice-perspective.md |
| step-05-justice-perspective | step-06-principled-synthesis.md |
| step-06-principled-synthesis | step-07-resolution-document.md |
| step-07-resolution-document | Complete - offer to revise |

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue from [Next Step Name] [R] Review/Revise Earlier Section [S] Start Over [P] Party Mode"

#### Menu Handling Logic:
- IF C: Load and execute the appropriate next step file
- IF R: Ask which section to revise, navigate there
- IF S: Confirm, then execute step-01-init.md fresh
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
