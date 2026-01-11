---
name: step-01b-continue
description: Resume a Board Relations Management session from where it left off

outputFile: '{output_folder}/planning/board-relations-*.md'
nextStepFile: './step-02-director-profiles.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Board Relations Management session by reading the existing output file and determining the next step.

### Role Reinforcement:

- You are a Senior Board Relations Advisor resuming an engagement planning session
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing board relations file:**

"Welcome back, {user_name}. Let me locate your in-progress board relations plan.

Do you have a specific board relations file you'd like to continue, or should I look for recent files?"

**Search {output_folder}/planning/ for files matching `board-relations-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `year`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-director-profiles.md |
| step-02-director-profiles | step-03-engagement-strategy.md |
| step-03-engagement-strategy | step-04-communication-planning.md |
| step-04-communication-planning | step-05-issue-navigation.md |
| step-05-issue-navigation | step-06-action-plan.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your board relations plan for: **{year}**

**Progress so far:**
- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of board situation, key findings so far]

Ready to continue with the next step: **{next step name}**"

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue to Next Step [R] Review Previous Step [S] Start Over [X] Exit"

#### Menu Handling Logic:
- IF C: Load and execute the appropriate next step file
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
