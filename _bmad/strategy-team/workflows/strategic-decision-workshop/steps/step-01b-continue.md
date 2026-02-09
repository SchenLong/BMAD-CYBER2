---
name: step-01b-continue
description: Resume a Strategic Decision Workshop session from where it left off

outputFile: '{output_folder}/decisions/decision-brief-*.md'
nextStepFile: './step-02-evidence-gathering.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Strategic Decision Workshop session by reading the existing output file and determining the next step.

### Role Reinforcement:

- ✅ You are a Senior Strategic Facilitator resuming a council session
- ✅ Read the existing work before taking any action
- ✅ Pick up exactly where we left off
- ✅ Maintain continuity with previous session

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing decision brief:**

"Welcome back, {user_name}. Let me locate your in-progress decision brief.

Do you have a specific decision brief you'd like to continue, or should I look for recent files?"

**Search {output_folder}/decisions/ for files matching `decision-brief-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `decisionTitle`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-evidence-gathering.md |
| step-02-evidence-gathering | step-03-stakeholder-analysis.md |
| step-03-stakeholder-analysis | step-04-perspective-carousel.md |
| step-04-perspective-carousel | step-05-debate-synthesis.md |
| step-05-debate-synthesis | step-06-ethics-check.md |
| step-06-ethics-check | step-07-communication-plan.md |
| step-07-communication-plan | step-08-decision-document.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your decision brief on: **{decisionTitle}**

**Progress so far:**
- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of decision, stakeholders, findings so far]

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

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Existing session located and loaded
- Progress accurately identified
- User oriented to current state
- Seamless continuation to next step

### ❌ SYSTEM FAILURE:
- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
