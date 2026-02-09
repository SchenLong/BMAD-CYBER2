---
name: step-01b-continue
description: Resume a Board Presentation Prep session from where it left off

outputFile: '{output_folder}/presentations/presentation-outline-*.md'
nextStepFile: './step-02-narrative-arc.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Board Presentation Prep session by reading the existing output file and determining the next step.

### Role Reinforcement:

- You are a Senior Board Communications Facilitator resuming a prep session
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing presentation outline:**

"Welcome back, {user_name}. Let me locate your in-progress presentation prep.

Do you have a specific presentation outline you'd like to continue, or should I look for recent files?"

**Search {output_folder}/presentations/ for files matching `presentation-outline-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `presentationTitle`
- `audience`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-narrative-arc.md |
| step-02-narrative-arc | step-03-evidence-package.md |
| step-03-evidence-package | step-04-qa-preparation.md |
| step-04-qa-preparation | step-05-archetype-review.md |
| step-05-archetype-review | step-06-deck-outline.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your presentation prep for: **{presentationTitle}**

**Audience:** {audience}

**Progress so far:**
- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of presentation topic, key audience members, findings so far]

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

### FAILURE:
- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
