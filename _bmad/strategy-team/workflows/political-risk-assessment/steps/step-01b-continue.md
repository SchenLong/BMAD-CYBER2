---
name: step-01b-continue
description: Resume an existing political risk assessment

outputFile: '{output_folder}/risk/political-risk-{initiative}.md'
nextStepFile: './step-02-power-mapping.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Political Risk Assessment

## STEP GOAL:

Resume a previously started political risk assessment from where it left off.

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Load Existing Assessment

**Ask the user:**

"Welcome back to Political Risk Assessment.

To continue your work, I need to find your existing assessment file.

**What initiative were you assessing?** (This helps me locate your file)"

### 2. Locate and Load File

Once user provides initiative name:
1. Construct path: `{output_folder}/risk/political-risk-{initiative}.md`
2. Attempt to read the file
3. If not found, offer to search or start fresh

### 3. Review Progress

**Read the frontmatter** to determine `stepsCompleted`:

Display progress:
"I found your assessment. Here's where we left off:

**Initiative:** [from file]
**Steps Completed:** [list from stepsCompleted array]
**Status:** [from frontmatter]

**Last Content Added:**
[Summary of most recent section]"

### 4. Determine Resume Point

Based on `stepsCompleted`, identify the next step:

| If stepsCompleted includes | Resume at |
|---------------------------|-----------|
| step-01-init only | step-02-power-mapping.md |
| step-02-power-mapping | step-03-interest-analysis.md |
| step-03-interest-analysis | step-04-risk-identification.md |
| step-04-risk-identification | step-05-probability-impact.md |
| step-05-probability-impact | step-06-mitigation-planning.md |
| step-06-mitigation-planning | Complete - offer to revise |

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
