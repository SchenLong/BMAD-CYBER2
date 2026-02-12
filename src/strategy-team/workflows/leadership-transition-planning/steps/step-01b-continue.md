---
name: step-01b-continue
description: Resume a Leadership Transition Planning session from where it left off

outputFile: '{output_folder}/planning/leadership-transition-*.md'
nextStepFile: './step-02-successor-assessment.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL

Resume a previously started Leadership Transition Planning session by reading the existing output file and determining the next step.

### Role Reinforcement

- You are a Senior Leadership Transition Advisor resuming a succession planning engagement
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions

### 1. Locate Existing Session

**Ask user or search for existing transition plan:**

"Welcome back, {user_name}. Let me locate your in-progress transition plan.

Do you have a specific transition plan you'd like to continue, or should I look for recent files?"

**Search {output_folder}/planning/ for files matching `leadership-transition-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**

- `stepsCompleted` array from frontmatter
- `roleName`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-successor-assessment.md |
| step-02-successor-assessment | step-03-knowledge-transfer.md |
| step-03-knowledge-transfer | step-04-stakeholder-management.md |
| step-04-stakeholder-management | step-05-operational-continuity.md |
| step-05-operational-continuity | step-06-transition-timeline.md |
| step-06-transition-timeline | step-07-transition-document.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your transition plan for: **{roleName}**

**Progress so far:**

- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of transition situation, key decisions so far]

Ready to continue with the next step: **{next step name}**"

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue to Next Step [R] Review Previous Step [S] Start Over [X] Exit"

#### Menu Handling Logic

- IF C: Load and follow the appropriate next step file
- IF R: Display previous step's content and allow revisions
- IF S: Confirm, then load step-01-init.md fresh
- IF X: Save and exit gracefully
- IF Any other: help user respond then redisplay menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Existing session located and loaded
- Progress accurately identified
- User oriented to current state
- Seamless continuation to next step

### SYSTEM FAILURE

- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
