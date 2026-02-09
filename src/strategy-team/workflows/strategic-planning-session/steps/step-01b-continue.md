---
name: step-01b-continue
description: Resume a Strategic Planning Session from where it left off

outputFile: '{output_folder}/strategy/strategic-plan-*.md'
nextStepFile: './step-02-landscape-assessment.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Strategic Planning Session by reading the existing output file and determining the next step.

### Role Reinforcement:

- You are a Strategic Planning Facilitator resuming a strategy council
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing strategic plan:**

"Welcome back, {user_name}. Let me locate your in-progress strategic plan.

Do you have a specific strategic plan you'd like to continue, or should I look for recent files?"

**Search {output_folder}/strategy/ for files matching `strategic-plan-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `planTitle`
- `planPeriod`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-landscape-assessment.md |
| step-02-landscape-assessment | step-03-timing-analysis.md |
| step-03-timing-analysis | step-04-systems-thinking.md |
| step-04-systems-thinking | step-05-tradition-risk.md |
| step-05-tradition-risk | step-06-political-reality.md |
| step-06-political-reality | step-07-strategy-document.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your strategic plan: **{planTitle}**

**Planning Period:** {planPeriod}

**Progress so far:**
- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of strategic context, objectives, and findings so far]

Ready to continue with the next step: **{next step name}**"

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue to Next Step [R] Review Previous Step [S] Start Over [X] Exit"

#### Menu Handling Logic:
- IF C: Load and follow the appropriate next step file
- IF R: Display previous step's content and allow revisions
- IF S: Confirm, then load step-01-init.md fresh
- IF X: Save and exit gracefully
- IF Any other: help user respond then redisplay menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Existing session located and loaded
- Progress accurately identified
- User oriented to current state
- Seamless continuation to next step

### SYSTEM FAILURE:
- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
